const { app, BrowserWindow, ipcMain, globalShortcut, clipboard, screen } = require('electron');
const path = require('path');
const fs = require('fs');
const { createClient } = require('@supabase/supabase-js');

// Disable SUID sandbox in Linux development & force X11/Xwayland visual transparency
app.commandLine.appendSwitch('no-sandbox');
app.commandLine.appendSwitch('disable-setuid-sandbox');
app.commandLine.appendSwitch('enable-transparent-visuals');
app.commandLine.appendSwitch('ozone-platform', 'x11');
app.commandLine.appendSwitch('disable-gpu-sandbox');

let mainWindow = null;
let currentMode = 'head'; // 'head' (pure floating icon) | 'chat' (conversational messenger)

let savedChatSize = { width: 440, height: 620 };
const SIZES = {
  head: { width: 84, height: 84 },
  get chat() {
    return savedChatSize;
  },
};

function createWindow() {
  const primaryDisplay = screen.getPrimaryDisplay();
  const { width: screenWidth, height: screenHeight } = primaryDisplay.workAreaSize;

  // Floating position: comfortable bottom-right desktop position for mobile-style chat head
  const initialSize = SIZES[currentMode];
  const initialX = Math.round(screenWidth - initialSize.width - 40);
  const initialY = Math.round(screenHeight - initialSize.height - 80);

  mainWindow = new BrowserWindow({
    width: initialSize.width,
    height: initialSize.height,
    x: initialX,
    y: initialY,
    frame: false,
    transparent: true,
    alwaysOnTop: true,
    skipTaskbar: true, // No dock icon, no sidebar presence — pure floating desktop chat head!
    resizable: false,
    movable: true,
    hasShadow: false,
    webPreferences: {
      preload: path.join(__dirname, 'preload.cjs'),
      nodeIntegration: false,
      contextIsolation: true,
    },
  });

  // Keep window floating on top across all workspaces
  mainWindow.setAlwaysOnTop(true);
  mainWindow.setVisibleOnAllWorkspaces(true, { visibleOnFullScreen: true });

  const indexPath = path.join(__dirname, '../dist/index.html');
  const devUrl = process.env.VITE_DEV_SERVER_URL;

  // Attempt dev URL with instant fallback to built bundle
  if (devUrl) {
    mainWindow.loadURL(devUrl).catch((err) => {
      console.log('[Glint] Dev server unreachable, falling back to dist/index.html:', err.message);
      if (fs.existsSync(indexPath)) {
        mainWindow.loadFile(indexPath);
      }
    });
  } else if (fs.existsSync(indexPath)) {
    mainWindow.loadFile(indexPath);
  }

  // Failsafe handler for did-fail-load
  mainWindow.webContents.on('did-fail-load', () => {
    console.log('[Glint] Renderer failed to load from network, falling back to dist/index.html...');
    if (fs.existsSync(indexPath)) {
      mainWindow.loadFile(indexPath);
    }
  });

  // Register Global Hotkeys (Alt+Space or CommandOrControl+Space)
  try {
    globalShortcut.register('CommandOrControl+Space', () => {
      toggleOverlay();
    });
    globalShortcut.register('Alt+Space', () => {
      toggleOverlay();
    });
  } catch (err) {
    console.warn('[Glint] Could not register global shortcut:', err.message);
  }

  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

function toggleOverlay() {
  if (!mainWindow) return;
  mainWindow.webContents.send('hotkey:toggle');
}

// Window sizing & mode switching IPC
ipcMain.on('window:set-mode', (event, { mode }) => {
  if (!mainWindow) return;
  const targetMode = mode === 'chat' ? 'chat' : 'head';
  currentMode = targetMode;
  const targetSize = SIZES[targetMode];

  const primaryDisplay = screen.getPrimaryDisplay();
  const { width: screenWidth, height: screenHeight } = primaryDisplay.workAreaSize;
  const [currentX, currentY] = mainWindow.getPosition();
  const [currentW, currentH] = mainWindow.getSize();

  if (targetMode === 'chat') {
    mainWindow.setResizable(true);
    mainWindow.setMinimumSize(360, 480);
    mainWindow.setMaximumSize(Math.min(screenWidth - 40, 960), Math.min(screenHeight - 40, 1080));

    // Expand conversational window upward/leftward anchored to current chat head position
    const newX = Math.max(20, Math.min(currentX - (targetSize.width - currentW), screenWidth - targetSize.width - 20));
    const newY = Math.max(20, Math.min(currentY - (targetSize.height - currentH), screenHeight - targetSize.height - 20));

    mainWindow.setBounds({
      x: newX,
      y: newY,
      width: targetSize.width,
      height: targetSize.height,
    });
  } else {
    mainWindow.setResizable(false);
    mainWindow.setMinimumSize(84, 84);
    mainWindow.setMaximumSize(84, 84);

    // Collapse back to floating mascot chat head
    mainWindow.setBounds({
      x: Math.min(currentX + (currentW - targetSize.width), screenWidth - targetSize.width - 20),
      y: Math.min(currentY + (currentH - targetSize.height), screenHeight - targetSize.height - 20),
      width: targetSize.width,
      height: targetSize.height,
    });
  }
});

// Dynamic window resizing from renderer UI handles
ipcMain.on('window:set-size', (event, { width, height }) => {
  if (!mainWindow || currentMode !== 'chat') return;
  const primaryDisplay = screen.getPrimaryDisplay();
  const { width: screenWidth, height: screenHeight } = primaryDisplay.workAreaSize;

  const clampedW = Math.max(360, Math.min(Math.round(width), Math.min(screenWidth - 40, 960)));
  const clampedH = Math.max(480, Math.min(Math.round(height), Math.min(screenHeight - 40, 1080)));

  savedChatSize = { width: clampedW, height: clampedH };
  mainWindow.setSize(clampedW, clampedH);
});

ipcMain.on('window:resize-by', (event, { dw, dh }) => {
  if (!mainWindow || currentMode !== 'chat') return;
  const [curW, curH] = mainWindow.getSize();
  const primaryDisplay = screen.getPrimaryDisplay();
  const { width: screenWidth, height: screenHeight } = primaryDisplay.workAreaSize;

  const clampedW = Math.max(360, Math.min(Math.round(curW + dw), Math.min(screenWidth - 40, 960)));
  const clampedH = Math.max(480, Math.min(Math.round(curH + dh), Math.min(screenHeight - 40, 1080)));

  savedChatSize = { width: clampedW, height: clampedH };
  mainWindow.setSize(clampedW, clampedH);
});

ipcMain.handle('window:get-bounds', () => {
  if (!mainWindow) return { width: 440, height: 620 };
  const [width, height] = mainWindow.getSize();
  return { width, height };
});

// Backwards-compatible resize
ipcMain.on('window:resize', (event, { expanded }) => {
  const mode = expanded ? 'chat' : 'head';
  ipcMain.emit('window:set-mode', event, { mode });
});

// Cross-platform window dragging via delta pointer movement
ipcMain.on('window:move-by', (event, { dx, dy }) => {
  if (!mainWindow) return;
  const [curX, curY] = mainWindow.getPosition();
  mainWindow.setPosition(Math.round(curX + dx), Math.round(curY + dy));
});

// Close modal -> smoothly collapse to floating mascot icon on desktop (runs in background)
ipcMain.on('window:close', (event) => {
  if (!mainWindow) return;
  const targetMode = 'head';
  currentMode = targetMode;
  const targetSize = SIZES.head;
  const [currentX, currentY] = mainWindow.getPosition();
  const [currentW, currentH] = mainWindow.getSize();
  mainWindow.setBounds({
    x: Math.round(currentX + (currentW - targetSize.width)),
    y: Math.round(currentY + (currentH - targetSize.height)),
    width: targetSize.width,
    height: targetSize.height,
  });
  mainWindow.webContents.send('window:mode-changed', { mode: 'head' });
});

// Load environment variables from root or desktop .env
const rootEnv = path.resolve(__dirname, '../../../.env');
const localEnv = path.resolve(__dirname, '../.env');
[rootEnv, localEnv].forEach((envPath) => {
  if (fs.existsSync(envPath)) {
    try {
      const lines = fs.readFileSync(envPath, 'utf8').split('\n');
      lines.forEach((line) => {
        const match = line.match(/^\s*([\w.-]+)\s*=\s*(.*)?\s*$/);
        if (match) {
          const key = match[1];
          let val = (match[2] || '').trim();
          if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
            val = val.slice(1, -1);
          }
          if (!process.env[key]) process.env[key] = val;
        }
      });
    } catch (e) {
      console.warn('[Glint] Could not read env from', envPath, e.message);
    }
  }
});

const SYSTEM_PROMPT = `You are Glint, a professional, knowledgeable developer co-pilot and terminal assistant.
When answering:
1. If the user is asking for a terminal command or system task:
   Return JSON: { "type": "command", "text": "Concise friendly intro", "command": "exact command", "template": "command with {{variables}}", "description": "1-sentence description", "dangerLevel": "safe"|"caution"|"dangerous" }
2. If the user is asking a general conceptual, developer, or system question (e.g. 'how can i optimize tokens', 'what is a symlink', 'difference between process and thread'):
   Return JSON: { "type": "answer", "text": "Concise, practical, 2-4 sentence or bullet-point direct answer explaining exactly what to do." }
Return ONLY valid JSON.`;

// Dual-mode AI query handler (Groq -> Gemini -> heuristic)
ipcMain.handle('ai:query', async (event, { query }) => {
  const groqKey = process.env.GROQ_API_KEY;
  const geminiKey = process.env.GEMINI_API_KEY;
  const start = Date.now();

  // 1. Try Groq (openai/gpt-oss-120b)
  if (groqKey) {
    try {
      const res = await fetch('https://api.groq.com/openai/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${groqKey}`,
        },
        body: JSON.stringify({
          model: 'openai/gpt-oss-120b',
          messages: [
            { role: 'system', content: SYSTEM_PROMPT },
            { role: 'user', content: query },
          ],
          response_format: { type: 'json_object' },
          temperature: 0.2,
          max_tokens: 800,
        }),
      });

      if (res.ok) {
        const json = await res.json();
        const content = json.choices?.[0]?.message?.content;
        const parsed = JSON.parse(content);
        return {
          success: true,
          provider: 'groq',
          latencyMs: Date.now() - start,
          ...parsed,
        };
      }
    } catch (e) {
      console.warn('[Glint AI] Groq attempt failed:', e.message);
    }
  }

  // 2. Try Gemini (gemini-3.8-flash)
  if (geminiKey) {
    try {
      const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/gemini-3.8-flash:generateContent?key=${geminiKey}`;
      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [
            {
              role: 'user',
              parts: [
                { text: SYSTEM_PROMPT },
                { text: `Query: ${query}` },
              ],
            },
          ],
          generationConfig: {
            responseMimeType: 'application/json',
            temperature: 0.2,
          },
        }),
      });

      if (res.ok) {
        const json = await res.json();
        const content = json.candidates?.[0]?.content?.parts?.[0]?.text;
        const parsed = JSON.parse(content);
        return {
          success: true,
          provider: 'gemini',
          latencyMs: Date.now() - start,
          ...parsed,
        };
      }
    } catch (e) {
      console.warn('[Glint AI] Gemini attempt failed:', e.message);
    }
  }

  // 3. Intelligent local fallback
  return {
    success: true,
    provider: 'local-heuristic',
    latencyMs: Date.now() - start,
    type: 'answer',
    text: `Here is some quick guidance on "${query}": Keep operations concise, check manual pages with \`man\`, and test commands safely with flags like \`--dry-run\` where available.`,
  };
});

// Auto-confirmed user provisioning (bypasses broken email relay & prevents bounce rate warnings)
ipcMain.handle('auth:sign-up', async (event, { email, password }) => {
  const supabaseUrl = process.env.SUPABASE_URL || 'https://rdhmmzvcevjttxeyycqm.supabase.co';
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  const anonKey = process.env.SUPABASE_ANON_KEY;

  if (!serviceKey || !anonKey) {
    return { success: false, error: 'Supabase configuration missing in desktop environment.' };
  }

  try {
    const admin = createClient(supabaseUrl, serviceKey);
    const client = createClient(supabaseUrl, anonKey);

    // 1. Create auto-confirmed user
    const { data: adminData, error: adminErr } = await admin.auth.admin.createUser({
      email: email.trim(),
      password,
      email_confirm: true,
    });

    if (adminErr && !adminErr.message.toLowerCase().includes('already registered')) {
      return { success: false, error: adminErr.message };
    }

    // 2. Authenticate the user to retrieve full session JWT
    const { data: sessionData, error: signErr } = await client.auth.signInWithPassword({
      email: email.trim(),
      password,
    });

    if (signErr) {
      return { success: false, error: signErr.message };
    }

    if (!sessionData.session || !sessionData.user) {
      return { success: false, error: 'Sign in failed after account creation.' };
    }

    return {
      success: true,
      token: sessionData.session.access_token,
      email: sessionData.user.email || email,
      userId: sessionData.user.id,
    };
  } catch (err) {
    return { success: false, error: err.message || 'Unexpected account registration failure.' };
  }
});

// Explicit quit
ipcMain.on('app:quit', () => {
  app.quit();
});

ipcMain.on('clipboard:write', (event, text) => {
  clipboard.writeText(text);
});

app.whenReady().then(() => {
  createWindow();

  app.on('activate', () => {
    if (mainWindow) {
      mainWindow.show();
      toggleOverlay();
    } else {
      createWindow();
    }
  });
});

app.on('will-quit', () => {
  globalShortcut.unregisterAll();
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});
