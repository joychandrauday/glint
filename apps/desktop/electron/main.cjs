const { app, BrowserWindow, ipcMain, globalShortcut, clipboard, screen } = require('electron');
const path = require('path');
const fs = require('fs');
const { createClient } = require('@supabase/supabase-js');

// Enforce single instance lock across the desktop
const gotTheLock = app.requestSingleInstanceLock();
if (!gotTheLock) {
  console.log('[Glint] Another instance is already running. Focusing existing instance...');
  app.quit();
  process.exit(0);
}

// Linux stability & Wayland/X11 compatibility
// IMPORTANT: All app.commandLine switches and app.disableHardwareAcceleration() MUST
// be called before the app 'ready' event (before app.whenReady). These are set here,
// at module load time, so they are always applied before any window is created.
if (process.platform === 'linux') {
  // Suppress libva C-library internal stderr logging
  process.env.LIBVA_MESSAGING_LEVEL = '0';
  process.env.ELECTRON_ENABLE_LOGGING = '0';
  // Force X11/XWayland on Linux:
  // Native Wayland (xdg_shell) strictly forbids client apps from setting their own window position (win.setPosition)
  // and zeroes out pointer screen coordinates (screenX/screenY = 0). Running via XWayland restores full desktop
  // coordinate control, true transparency, and seamless free-floating mascot dragging across all Linux desktops.
  process.env.ELECTRON_OZONE_PLATFORM_HINT = 'x11';
  app.commandLine.appendSwitch('ozone-platform', 'x11');
  app.commandLine.appendSwitch('enable-transparent-visuals');
  // Disabling hardware acceleration and GPU process on Linux prevents Chromium GPU command buffer crashes
  // (ContextResult::kTransientFailure / SIGSEGV exit_code=139) across Wayland, X11, and diverse Mesa/GPU drivers
  app.disableHardwareAcceleration();
  app.commandLine.appendSwitch('no-sandbox');
  app.commandLine.appendSwitch('disable-setuid-sandbox');
  app.commandLine.appendSwitch('disable-gpu');
  app.commandLine.appendSwitch('disable-accelerated-video-decode');
  app.commandLine.appendSwitch('disable-accelerated-video-encode');
  app.commandLine.appendSwitch('disable-features', 'VaapiVideoDecoder,VaapiVideoEncoder,VaapiIgnoreDriverChecks');
  // Suppress non-fatal chromium internal libva/gpu/presenter warnings on Linux stderr
  app.commandLine.appendSwitch('disable-logging');
  app.commandLine.appendSwitch('log-level', '3');
  app.commandLine.appendSwitch('v', '-1');

  // Filter transient X11 software bitmap presenter logs on stderr
  const origStderrWrite = process.stderr.write.bind(process.stderr);
  process.stderr.write = (chunk, encoding, callback) => {
    const msg = typeof chunk === 'string' ? chunk : chunk?.toString() || '';
    if (
      msg.includes('x11_software_bitmap_presenter') ||
      msg.includes('XGetWindowAttributes') ||
      msg.includes('vaInitialize')
    ) {
      if (typeof callback === 'function') callback();
      return true;
    }
    return origStderrWrite(chunk, encoding, callback);
  };
}

// Windows AppUserModelID for taskbar grouping & pinning
if (process.platform === 'win32') {
  app.setAppUserModelId('com.glint.desktop');
}

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

  const candidateIcon = process.platform === 'win32'
    ? path.join(__dirname, '../assets/icon.ico')
    : path.join(__dirname, '../assets/icon.png');
  const appIcon = fs.existsSync(candidateIcon) ? candidateIcon : undefined;

  mainWindow = new BrowserWindow({
    width: initialSize.width,
    height: initialSize.height,
    x: initialX,
    y: initialY,
    frame: false,
    transparent: true,
    // Note: alwaysOnTop is intentionally deferred to onWindowReady below. Passing alwaysOnTop: true
    // during new BrowserWindow(...) triggers immediate native X11 property changes on dummy window 1,
    // which causes 'XGetWindowAttributes failed for window 1' before the window surface is mapped.
    skipTaskbar: false, // Visible in Ubuntu Dock & Windows Taskbar for 1-click pinning
    icon: appIcon,
    resizable: false,
    movable: true,
    hasShadow: false,
    // show: false prevents Chromium's x11_software_bitmap_presenter from querying X11 window
    // attributes on the unmapped placeholder window (ID 1) before the native surface is created.
    // The window is revealed only after 'ready-to-show' fires (or a safety timeout), guaranteeing
    // the X11 XGetWindowAttributes call has a fully mapped real window to query.
    show: false,
    webPreferences: {
      preload: path.join(__dirname, 'preload.cjs'),
      nodeIntegration: false,
      contextIsolation: true,
    },
  });

  // Defer all X11 window property mutations (alwaysOnTop, visibleOnAllWorkspaces) until
  // after the native OS window is fully mapped. Calling these on an unmapped window triggers
  // XGetWindowAttributes on window ID 1 (the dummy root placeholder), which causes the error:
  //   ui/base/x/x11_software_bitmap_presenter.cc:147 XGetWindowAttributes failed for window 1
  let windowShown = false;
  let showFallbackTimer = null;

  const onWindowReady = () => {
    if (windowShown || !mainWindow) return;
    windowShown = true;
    if (showFallbackTimer) clearTimeout(showFallbackTimer);
    // Re-assert always-on-top and workspace visibility now that the X11 surface is mapped
    mainWindow.setAlwaysOnTop(true);
    mainWindow.setVisibleOnAllWorkspaces(true, { visibleOnFullScreen: true });
    mainWindow.show();
  };

  // Primary trigger: fired by Chromium once the first frame is composed and the native window is mapped
  mainWindow.once('ready-to-show', onWindowReady);

  // Safety fallback: covers rare window managers that delay or skip 'ready-to-show'
  showFallbackTimer = setTimeout(onWindowReady, 600);

  const indexPath = path.join(__dirname, '../dist/index.html');
  const devUrl = process.env.VITE_DEV_SERVER_URL;

  // Attempt dev URL with instant fallback to built bundle
  if (devUrl) {
    mainWindow.loadURL(devUrl).catch((err) => {
      console.log('[Glint] Dev server unreachable, falling back to dist/index.html:', err.message);
      mainWindow.loadFile(indexPath).catch(console.error);
    });
  } else {
    mainWindow.loadFile(indexPath).catch(console.error);
  }

  // Failsafe handler for did-fail-load
  mainWindow.webContents.on('did-fail-load', (event, errorCode, errorDescription) => {
    console.warn('[Glint] Renderer did-fail-load:', errorCode, errorDescription);
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

// High-performance cross-platform window dragging engine
// Uses native OS cursor polling via screen.getCursorScreenPoint() at ~80fps (12ms)
// This eliminates the small-window cursor escaping problem where fast mouse movements
// outrun the 84x84 mascot and freeze drag tracking on Linux, Windows, and macOS.
let dragSession = null;

function stopDragSession() {
  if (dragSession) {
    if (dragSession.timer) clearInterval(dragSession.timer);
    dragSession = null;
  }
}

ipcMain.on('window:drag-start', (event, { mouseX, mouseY, clientX, clientY, screenX, screenY } = {}) => {
  if (!mainWindow) return;
  stopDragSession();

  const [winX, winY] = mainWindow.getPosition();
  const cursor = screen.getCursorScreenPoint();
  const rawX = (typeof screenX === 'number' && screenX !== 0) ? screenX : (cursor?.x ?? winX);
  const rawY = (typeof screenY === 'number' && screenY !== 0) ? screenY : (cursor?.y ?? winY);

  const offsetX = Math.round(rawX - winX);
  const offsetY = Math.round(rawY - winY);

  dragSession = {
    isDragging: true,
    offsetX,
    offsetY,
    lastScreenX: rawX,
    lastScreenY: rawY,
    timer: null,
  };

  // High-frequency native OS cursor tracking (~80fps)
  // Polls screen.getCursorScreenPoint() continuously so fast movements outside
  // the 84x84 window never drop tracking or freeze the drag.
  dragSession.timer = setInterval(() => {
    if (!dragSession || !dragSession.isDragging || !mainWindow || mainWindow.isDestroyed()) {
      stopDragSession();
      return;
    }
    const currentCursor = screen.getCursorScreenPoint();
    if (!currentCursor) return;
    const targetX = Math.round(currentCursor.x - dragSession.offsetX);
    const targetY = Math.round(currentCursor.y - dragSession.offsetY);
    mainWindow.setPosition(targetX, targetY);
  }, 12);
});

ipcMain.on('window:drag-move', (event, { dx, dy, screenX, screenY, mouseX, mouseY } = {}) => {
  if (!mainWindow || !dragSession || !dragSession.isDragging) return;

  // When high-resolution cursor polling is active, the interval smoothly handles positioning.
  // If the timer was paused or unavailable, delta movement acts as immediate fallback:
  if (!dragSession.timer) {
    let deltaX = 0;
    let deltaY = 0;

    if (typeof dx === 'number' && typeof dy === 'number' && (dx !== 0 || dy !== 0)) {
      deltaX = dx;
      deltaY = dy;
    } else {
      const curX = screenX ?? mouseX;
      const curY = screenY ?? mouseY;
      if (typeof curX === 'number' && typeof curY === 'number') {
        deltaX = curX - dragSession.lastScreenX;
        deltaY = curY - dragSession.lastScreenY;
        dragSession.lastScreenX = curX;
        dragSession.lastScreenY = curY;
      }
    }

    if (deltaX !== 0 || deltaY !== 0) {
      const [curX, curY] = mainWindow.getPosition();
      mainWindow.setPosition(Math.round(curX + deltaX), Math.round(curY + deltaY));
    }
  }
});

ipcMain.on('window:drag-end', () => {
  stopDragSession();
});

// Cross-platform window dragging via delta pointer movement (fallback & resize)
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

const SYSTEM_PROMPT = `You are Glint, a personalized AI assistant and expert developer co-pilot.
Identify the user's intent and return strictly valid JSON matching ONE of these structures:

1. GENERAL QUESTION, EXPLANATION, OR ASSISTANCE (weather, concepts, math, greetings, general queries):
{
  "type": "answer",
  "text": "friendly, direct, concise answer or explanation. Do NOT generate terminal commands or bash scripts unless the user explicitly requested CLI code."
}

2. ERROR / STACK TRACE / FIX ("error", "failed", "crash", "exit code", stack traces):
{
  "type": "doctor",
  "rootCause": "2 concise sentences explaining why the error occurred",
  "fixCommand": "exact ready-to-run terminal command or code fix",
  "explanation": "brief breakdown of the fix",
  "prevention": "1 practical tip to prevent this error recurring"
}

3. MULTI-STEP WORKFLOW / PROCEDURE ("how to setup", "deploy", "install and configure", multi-step guide):
{
  "type": "runbook",
  "title": "Title of procedure",
  "description": "1-sentence summary",
  "steps": [
    { "title": "Step title", "command": "command to run", "description": "what this step accomplishes" }
  ]
}

4. REGEX QUERY ("regex for...", "regular expression to match..."):
{
  "type": "regex_tool",
  "pattern": "regex pattern without slashes e.g. ^[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+\\.[a-zA-Z0-9-.]+$",
  "flags": "g, i, m",
  "explanation": "concise explanation of tokens",
  "sampleMatch": "an example string that matches"
}

5. CRON EXPRESSION ("cron for...", "schedule every..."):
{
  "type": "cron_tool",
  "expression": "e.g. */15 * * * *",
  "explanation": "human-friendly explanation of the timing"
}

6. SINGLE TERMINAL COMMAND OR TASK:
{
  "type": "command",
  "text": "friendly intro",
  "command": "exact command",
  "template": "command with {{variable_name}} placeholders",
  "description": "1-sentence description",
  "dangerLevel": "safe" | "caution" | "destructive"
}

Return ONLY valid JSON with zero extraneous markdown outside the JSON object.`;

const QUOTA_LIMIT = 15;

function getQuotaStatus() {
  const quotaFile = path.join(app.getPath('userData'), 'glint-quota.json');
  const today = new Date().toISOString().slice(0, 10);
  try {
    if (fs.existsSync(quotaFile)) {
      const data = JSON.parse(fs.readFileSync(quotaFile, 'utf8'));
      if (data.date === today) {
        return {
          count: data.count || 0,
          date: today,
          limit: QUOTA_LIMIT,
          remaining: Math.max(0, QUOTA_LIMIT - (data.count || 0)),
        };
      }
    }
  } catch (e) {
    console.warn('[Glint Quota] Read error:', e.message);
  }
  return { count: 0, date: today, limit: QUOTA_LIMIT, remaining: QUOTA_LIMIT };
}

function incrementQuotaUsage() {
  const quotaFile = path.join(app.getPath('userData'), 'glint-quota.json');
  const today = new Date().toISOString().slice(0, 10);
  const status = getQuotaStatus();
  status.count += 1;
  status.date = today;
  status.remaining = Math.max(0, QUOTA_LIMIT - status.count);
  try {
    fs.writeFileSync(quotaFile, JSON.stringify({ count: status.count, date: today }, null, 2), 'utf8');
  } catch (e) {
    console.warn('[Glint Quota] Write error:', e.message);
  }
  return status;
}

async function fetchLiveWeather() {
  try {
    const res = await fetch('https://wttr.in/?format=j1', {
      headers: { 'User-Agent': 'curl/7.81.0' },
      signal: AbortSignal.timeout ? AbortSignal.timeout(3000) : undefined,
    });
    if (res.ok) {
      const data = await res.json();
      const current = data.current_condition?.[0];
      const area = data.nearest_area?.[0];
      const city = area?.areaName?.[0]?.value || area?.region?.[0]?.value || 'Your Location';
      const country = area?.country?.[0]?.value || '';
      const locationStr = country ? `${city}, ${country}` : city;

      const tempC = current?.temp_C || '?';
      const feelsLikeC = current?.FeelsLikeC || tempC;
      const weatherDesc = current?.weatherDesc?.[0]?.value || 'Clear';
      const humidity = current?.humidity || '?';
      const windKmph = current?.windspeedKmph || '?';
      const windDir = current?.winddir16Point || '';

      let emoji = '🌤️';
      const descLower = weatherDesc.toLowerCase();
      if (descLower.includes('sun') || descLower.includes('clear')) emoji = '☀️';
      else if (descLower.includes('rain') || descLower.includes('drizzle')) emoji = '🌧️';
      else if (descLower.includes('cloud') || descLower.includes('overcast')) emoji = '☁️';
      else if (descLower.includes('snow')) emoji = '❄️';
      else if (descLower.includes('thunder') || descLower.includes('storm')) emoji = '⛈️';
      else if (descLower.includes('fog') || descLower.includes('mist')) emoji = '🌫️';

      const weatherText = `${emoji} **Current Weather in ${locationStr}**\n\n` +
        `• **Condition:** ${weatherDesc}\n` +
        `• **Temperature:** ${tempC}°C (feels like ${feelsLikeC}°C)\n` +
        `• **Humidity:** ${humidity}%\n` +
        `• **Wind:** ${windKmph} km/h ${windDir}\n\n` +
        `*Live weather update. Let me know if you need anything else!*`;

      return {
        type: 'answer',
        text: weatherText,
      };
    }
  } catch (e) {
    console.warn('[Glint AI] wttr.in live weather fetch error:', e.message);
  }
  return null;
}

async function callManagedGroqAi(query, prompt = SYSTEM_PROMPT) {
  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) {
    throw new Error('No system managed GROQ_API_KEY configured');
  }
  const model = process.env.GROQ_MODEL || 'openai/gpt-oss-120b';

  const res = await fetch('https://api.groq.com/openai/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model,
      messages: [
        { role: 'system', content: prompt },
        { role: 'user', content: query },
      ],
      response_format: { type: 'json_object' },
      temperature: 0.2,
      max_tokens: 1000,
    }),
  });

  if (!res.ok) {
    const errText = await res.text();
    throw new Error(`Managed Groq API (${res.status}): ${errText.slice(0, 150)}`);
  }

  const json = await res.json();
  const content = json.choices?.[0]?.message?.content;
  return { model, content };
}

// Dual-mode AI query handler (BYOK -> Groq -> Gemini -> heuristic)
ipcMain.handle('ai:detect-ollama', async (event, { host } = {}) => {
  const targetHost = (host || 'http://localhost:11434').replace(/\/+$/, '');
  try {
    const res = await fetch(`${targetHost}/api/tags`, {
      method: 'GET',
      signal: AbortSignal.timeout ? AbortSignal.timeout(2000) : undefined,
    });
    if (res.ok) {
      const json = await res.json();
      const models = (json.models || []).map((m) => m.name || m.model);
      return { available: true, models };
    }
  } catch {}
  return { available: false, models: [] };
});

ipcMain.handle('ai:test-key', async (event, { provider, key, host, model }) => {
  const start = Date.now();
  try {
    if (provider === 'groq') {
      const m = model || 'llama-3.3-70b-versatile';
      const res = await fetch('https://api.groq.com/openai/v1/chat/completions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${key}` },
        body: JSON.stringify({ model: m, messages: [{ role: 'user', content: 'Ping' }], max_tokens: 5 }),
      });
      if (res.ok) return { success: true, latencyMs: Date.now() - start };
      const err = await res.text();
      return { success: false, error: `Groq error (${res.status}): ${err.slice(0, 150)}` };
    }

    if (provider === 'gemini') {
      const m = model || 'gemini-2.0-flash';
      const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${m}:generateContent?key=${key}`;
      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ contents: [{ parts: [{ text: 'Ping' }] }] }),
      });
      if (res.ok) return { success: true, latencyMs: Date.now() - start };
      const err = await res.text();
      return { success: false, error: `Gemini error (${res.status}): ${err.slice(0, 150)}` };
    }

    if (provider === 'ollama') {
      const targetHost = (host || 'http://localhost:11434').replace(/\/+$/, '');
      const m = model || 'llama3.2';
      const res = await fetch(`${targetHost}/api/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ model: m, messages: [{ role: 'user', content: 'Ping' }], stream: false }),
      });
      if (res.ok) return { success: true, latencyMs: Date.now() - start };
      const err = await res.text();
      return { success: false, error: `Ollama error (${res.status}): ${err.slice(0, 150)}` };
    }

    if (provider === 'openai') {
      const m = model || 'gpt-4o-mini';
      const res = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${key}` },
        body: JSON.stringify({ model: m, messages: [{ role: 'user', content: 'Ping' }], max_tokens: 5 }),
      });
      if (res.ok) return { success: true, latencyMs: Date.now() - start };
      const err = await res.text();
      return { success: false, error: `OpenAI error (${res.status}): ${err.slice(0, 150)}` };
    }

    if (provider === 'openrouter') {
      const m = model || 'meta-llama/llama-3.3-70b-instruct';
      const res = await fetch('https://openrouter.ai/api/v1/chat/completions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${key}` },
        body: JSON.stringify({ model: m, messages: [{ role: 'user', content: 'Ping' }], max_tokens: 5 }),
      });
      if (res.ok) return { success: true, latencyMs: Date.now() - start };
      const err = await res.text();
      return { success: false, error: `OpenRouter error (${res.status}): ${err.slice(0, 150)}` };
    }

    return { success: false, error: 'Unknown provider' };
  } catch (e) {
    return { success: false, error: e.message };
  }
});

ipcMain.handle('ai:query', async (event, { query, byok }) => {
  const start = Date.now();
  const qLower = (query || '').toLowerCase().trim();

  // Helper to extract clean JSON
  const extractJson = (text) => {
    try {
      return JSON.parse(text);
    } catch {
      const match = text.match(/\{[\s\S]*\}/);
      if (match) return JSON.parse(match[0]);
      throw new Error('No JSON object found in response');
    }
  };

  // 1. Live Weather Utility (instant, generalized, zero code/linux command)
  const isWeatherQuery = /(?:today(?:'s)?\s+)?weather|forecast|temperature|how is the weather/i.test(qLower);
  const isCliWeatherQuery = /(?:curl|cli|command|bash|terminal|code|script)\s+for\s+weather|weather\s+(?:command|cli|bash|script)/i.test(qLower);
  if (isWeatherQuery && !isCliWeatherQuery) {
    const weatherResult = await fetchLiveWeather();
    if (weatherResult) {
      return {
        success: true,
        provider: 'live-weather',
        latencyMs: Date.now() - start,
        ...weatherResult,
      };
    }
  }

  let byokError = null;

  // 2. Check if user configured a personal BYOK provider
  if (byok && byok.activeProvider && byok.activeProvider !== 'auto') {
    try {
      // Groq BYOK
      if (byok.activeProvider === 'groq' && byok.groqKey) {
        const model = byok.groqModel || 'llama-3.3-70b-versatile';
        const res = await fetch('https://api.groq.com/openai/v1/chat/completions', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${byok.groqKey}` },
          body: JSON.stringify({
            model,
            messages: [{ role: 'system', content: SYSTEM_PROMPT }, { role: 'user', content: query }],
            response_format: { type: 'json_object' },
            temperature: 0.2,
            max_tokens: 1000,
          }),
        });
        if (res.ok) {
          const json = await res.json();
          const parsed = extractJson(json.choices?.[0]?.message?.content || '{}');
          return { success: true, provider: `groq (${model})`, isByok: true, latencyMs: Date.now() - start, ...parsed };
        } else {
          const errTxt = await res.text();
          throw new Error(`Groq HTTP ${res.status}: ${errTxt.slice(0, 100)}`);
        }
      }

      // Gemini BYOK
      if (byok.activeProvider === 'gemini' && byok.geminiKey) {
        const model = byok.geminiModel || 'gemini-2.0-flash';
        const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${byok.geminiKey}`;
        const res = await fetch(endpoint, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [{ parts: [{ text: `${SYSTEM_PROMPT}\n\nUser Query: ${query}` }] }],
            generationConfig: { responseMimeType: 'application/json', temperature: 0.2 },
          }),
        });
        if (res.ok) {
          const json = await res.json();
          const parsed = extractJson(json.candidates?.[0]?.content?.parts?.[0]?.text || '{}');
          return { success: true, provider: `gemini (${model})`, isByok: true, latencyMs: Date.now() - start, ...parsed };
        } else {
          const errTxt = await res.text();
          throw new Error(`Gemini HTTP ${res.status}: ${errTxt.slice(0, 100)}`);
        }
      }

      // Ollama Localhost BYOK
      if (byok.activeProvider === 'ollama' && byok.ollamaHost) {
        const host = (byok.ollamaHost || 'http://localhost:11434').replace(/\/+$/, '');
        const model = byok.ollamaModel || 'llama3.2';
        const res = await fetch(`${host}/api/chat`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            model,
            messages: [{ role: 'system', content: SYSTEM_PROMPT }, { role: 'user', content: query }],
            format: 'json',
            stream: false,
          }),
        });
        if (res.ok) {
          const json = await res.json();
          const parsed = extractJson(json.message?.content || '{}');
          return { success: true, provider: `ollama (${model})`, isByok: true, latencyMs: Date.now() - start, ...parsed };
        } else {
          const errTxt = await res.text();
          throw new Error(`Ollama HTTP ${res.status}: ${errTxt.slice(0, 100)}`);
        }
      }

      // OpenAI BYOK
      if (byok.activeProvider === 'openai' && byok.openaiKey) {
        const model = byok.openaiModel || 'gpt-4o-mini';
        const res = await fetch('https://api.openai.com/v1/chat/completions', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${byok.openaiKey}` },
          body: JSON.stringify({
            model,
            messages: [{ role: 'system', content: SYSTEM_PROMPT }, { role: 'user', content: query }],
            response_format: { type: 'json_object' },
            temperature: 0.2,
            max_tokens: 1000,
          }),
        });
        if (res.ok) {
          const json = await res.json();
          const parsed = extractJson(json.choices?.[0]?.message?.content || '{}');
          return { success: true, provider: `openai (${model})`, isByok: true, latencyMs: Date.now() - start, ...parsed };
        } else {
          const errTxt = await res.text();
          throw new Error(`OpenAI HTTP ${res.status}: ${errTxt.slice(0, 100)}`);
        }
      }

      // OpenRouter BYOK
      if (byok.activeProvider === 'openrouter' && byok.openrouterKey) {
        const model = byok.openrouterModel || 'meta-llama/llama-3.3-70b-instruct';
        const res = await fetch('https://openrouter.ai/api/v1/chat/completions', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${byok.openrouterKey}` },
          body: JSON.stringify({
            model,
            messages: [{ role: 'system', content: SYSTEM_PROMPT }, { role: 'user', content: query }],
            response_format: { type: 'json_object' },
            temperature: 0.2,
            max_tokens: 1000,
          }),
        });
        if (res.ok) {
          const json = await res.json();
          const parsed = extractJson(json.choices?.[0]?.message?.content || '{}');
          return { success: true, provider: `openrouter (${model})`, isByok: true, latencyMs: Date.now() - start, ...parsed };
        } else {
          const errTxt = await res.text();
          throw new Error(`OpenRouter HTTP ${res.status}: ${errTxt.slice(0, 100)}`);
        }
      }
    } catch (e) {
      console.warn('[Glint AI] BYOK attempt failed, falling back to managed pool:', e.message);
      byokError = e.message;
    }
  }

  // 3. System Managed Pool (with Daily Quota Guard for non-BYOK users)
  if (!byokError) {
    const quota = getQuotaStatus();
    if (quota.count >= QUOTA_LIMIT) {
      return {
        success: true,
        quotaExceeded: true,
        provider: 'glint-quota-guard',
        type: 'answer',
        text: `⚠️ **Daily Free AI Quota Reached (${QUOTA_LIMIT}/${QUOTA_LIMIT})**\n\nYou've used your 15 complimentary AI queries for today.\n\n💡 **Get Unlimited AI with BYOK:**\nConnect your own free API key (Groq, Gemini, or local Ollama) by clicking the 🔑 **Key** icon in the header. BYOK has zero rate limits, zero daily quotas, and is 100% free!`,
        quota,
      };
    }
  }

  // Try Managed Groq AI (using verified model openai/gpt-oss-120b)
  try {
    const { model, content } = await callManagedGroqAi(query);
    const parsed = extractJson(content);
    if (!byokError) {
      incrementQuotaUsage();
    }
    return {
      success: true,
      provider: byokError ? `glint-system-fallback (${model})` : `glint-system (${model})`,
      byokFailed: !!byokError,
      byokError: byokError || undefined,
      latencyMs: Date.now() - start,
      ...parsed,
    };
  } catch (e) {
    console.warn('[Glint AI] Managed Groq attempt failed:', e.message);
  }

  // Try Gemini if GEMINI_API_KEY is present
  const geminiKey = process.env.GEMINI_API_KEY;
  if (geminiKey) {
    try {
      const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${geminiKey}`;
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
        const parsed = extractJson(content);
        if (!byokError) {
          incrementQuotaUsage();
        }
        return {
          success: true,
          provider: 'gemini (gemini-2.0-flash)',
          byokFailed: !!byokError,
          byokError: byokError || undefined,
          latencyMs: Date.now() - start,
          ...parsed,
        };
      }
    } catch (e) {
      console.warn('[Glint AI] Gemini attempt failed:', e.message);
    }
  }

  // 4. Intelligent local knowledge engine (instant offline response)
  const q = qLower;

  // Docker project initiation / Dockerize
  if (q.includes('docker') && (q.includes('init') || q.includes('project') || q.includes('step by step') || q.includes('guide') || q.includes('runbook') || q.includes('setup') || q.includes('start'))) {
    return {
      success: true,
      provider: 'local-knowledge',
      latencyMs: Date.now() - start,
      type: 'runbook',
      runbook: {
        title: 'Dockerize Application / Project Runbook',
        description: 'Complete step-by-step procedure to containerize your project, define dependencies, build the image, and start the container.',
        steps: [
          {
            step: 1,
            title: 'Create project Dockerfile',
            command: 'touch Dockerfile',
            explanation: 'Creates the core container definition file in your project root directory.'
          },
          {
            step: 2,
            title: 'Configure .dockerignore',
            command: "cat << 'EOF' > .dockerignore\nnode_modules\n.git\n.env\n*.log\ndist\ntarget\nEOF",
            explanation: 'Excludes local dependencies, git history, and secrets to minimize image size and prevent secret leakage.'
          },
          {
            step: 3,
            title: 'Build Docker image',
            command: 'docker build -t {{app_name:my-app}}:latest .',
            explanation: 'Builds the container image with the tag {{app_name:my-app}}:latest from the current directory.'
          },
          {
            step: 4,
            title: 'Run container in background',
            command: 'docker run -d --name {{app_name:my-app}} -p {{host_port:3000}}:{{container_port:3000}} {{app_name:my-app}}:latest',
            explanation: 'Launches the container in detached mode with host port forwarding.'
          },
          {
            step: 5,
            title: 'Verify container status & logs',
            command: 'docker ps && docker logs -f {{app_name:my-app}}',
            explanation: 'Checks running container state and streams standard output logs.'
          }
        ]
      }
    };
  }

  // Regex tool fallback
  if (q.includes('regex') || q.includes('regular expression')) {
    let pattern = '^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}$';
    let sample = 'developer@glint.dev';
    let explanation = 'Validate standard email address formats.';

    if (q.includes('phone') || q.includes('number')) {
      pattern = '^\\+?[1-9]\\d{1,14}$';
      sample = '+14155552671';
      explanation = 'E.164 international phone number format.';
    } else if (q.includes('ip') || q.includes('ipv4')) {
      pattern = '^(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$';
      sample = '192.168.1.1';
      explanation = 'Validates IPv4 addresses (0.0.0.0 to 255.255.255.255).';
    } else if (q.includes('url') || q.includes('http')) {
      pattern = '^https?:\\/\\/(www\\.)?[-a-zA-Z0-9@:%._\\+~#=]{1,256}\\.[a-zA-Z0-9()]{1,6}\\b([-a-zA-Z0-9()@:%_\\+.~#?&//=]*)$';
      sample = 'https://glint.dev/docs';
      explanation = 'Matches HTTP/HTTPS web URLs with optional paths.';
    }

    return {
      success: true,
      provider: 'local-knowledge',
      latencyMs: Date.now() - start,
      type: 'regex_tool',
      regexTool: {
        pattern,
        flags: 'g',
        sampleText: sample,
        explanation
      }
    };
  }

  // Cron schedule fallback
  if (q.includes('cron') || q.includes('schedule')) {
    let expression = '0 0 * * *';
    let humanReadable = 'At 00:00 (midnight) every day';
    let nextRuns = [
      '2026-11-08 00:00:00 UTC',
      '2026-11-09 00:00:00 UTC',
      '2026-11-10 00:00:00 UTC',
      '2026-11-11 00:00:00 UTC',
      '2026-11-12 00:00:00 UTC'
    ];

    if (q.includes('15 min') || q.includes('fifteen')) {
      expression = '*/15 * * * *';
      humanReadable = 'Every 15 minutes';
    } else if (q.includes('hour') || q.includes('hourly')) {
      expression = '0 * * * *';
      humanReadable = 'Every hour on the hour';
    } else if (q.includes('weekday') || q.includes('monday to friday')) {
      expression = '0 9 * * 1-5';
      humanReadable = 'At 09:00 AM, Monday through Friday';
    }

    return {
      success: true,
      provider: 'local-knowledge',
      latencyMs: Date.now() - start,
      type: 'cron_tool',
      cronTool: {
        expression,
        humanReadable,
        nextRuns
      }
    };
  }

  // Generic Step-by-Step / Runbook
  if (q.includes('step by step') || q.includes('runbook') || q.includes('guide for')) {
    const topic = query.replace(/step by step guide for|runbook|guide for/i, '').trim() || 'System Procedure';
    return {
      success: true,
      provider: 'local-knowledge',
      latencyMs: Date.now() - start,
      type: 'runbook',
      runbook: {
        title: `Runbook: ${topic}`,
        description: `Operational step-by-step checklist for ${topic}.`,
        steps: [
          {
            step: 1,
            title: 'Verify environment prerequisites',
            command: 'command -v git && command -v docker && which bash',
            explanation: 'Confirm necessary CLI runtime tools are present in system PATH.'
          },
          {
            step: 2,
            title: 'Backup current state / configuration',
            command: 'cp -r . {{backup_dir:./backup-$(date +%Y%m%d)}}',
            explanation: 'Create a local safety snapshot before applying operational changes.'
          },
          {
            step: 3,
            title: 'Execute primary operation',
            command: `echo "Starting operation for: ${topic.replace(/"/g, '')}"`,
            explanation: 'Run the required system action.'
          },
          {
            step: 4,
            title: 'Validate operational health',
            command: 'systemctl status --no-pager || echo "Checking logs..."',
            explanation: 'Verify services are healthy and running.'
          }
        ]
      }
    };
  }

  // Port killing / common commands
  if (q.includes('kill') && (q.includes('port') || q.includes('3000') || q.includes('8080'))) {
    return {
      success: true,
      provider: 'local-knowledge',
      latencyMs: Date.now() - start,
      type: 'command',
      template: 'npx kill-port {{port:3000}}',
      explanation: 'Locates and terminates any process listening on the specified network port.',
      dangerLevel: 'CAUTION',
      category: 'Network',
      tags: ['port', 'kill', 'process']
    };
  }

  // Clean generalized fallback (no repetitive pro-tip unless quota exceeded)
  return {
    success: true,
    provider: 'local-knowledge',
    latencyMs: Date.now() - start,
    type: 'answer',
    text: `Here is guidance for **${query}**.\n\nYou can run related operational commands in your terminal or search the offline cheatsheets for exact syntax.`,
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

// Auto-start on system startup (Linux & Windows)
function configureAutoStart(enabled = true) {
  try {
    app.setLoginItemSettings({
      openAtLogin: enabled,
      openAsHidden: true,
      args: ['--hidden'],
    });
  } catch (err) {
    console.warn('[Glint] Could not update login item settings:', err.message);
  }
}

ipcMain.handle('autostart:get-status', () => {
  try {
    const settings = app.getLoginItemSettings({ args: ['--hidden'] });
    return { enabled: settings.openAtLogin };
  } catch (err) {
    return { enabled: false, error: err.message };
  }
});

ipcMain.handle('autostart:set-status', (event, { enabled }) => {
  try {
    configureAutoStart(Boolean(enabled));
    return { success: true, enabled: Boolean(enabled) };
  } catch (err) {
    return { success: false, error: err.message };
  }
});

// Explicit quit
ipcMain.on('app:quit', () => {
  app.quit();
});

ipcMain.on('clipboard:write', (event, text) => {
  clipboard.writeText(text);
});

ipcMain.handle('clipboard:read-text', () => {
  return clipboard.readText();
});

app.on('second-instance', () => {
  if (mainWindow) {
    if (mainWindow.isMinimized()) mainWindow.restore();
    mainWindow.show();
    mainWindow.focus();
    toggleOverlay();
  }
});

app.whenReady().then(() => {
  // Enable auto-start on startup by default for desktop releases
  if (app.isPackaged) {
    const current = app.getLoginItemSettings({ args: ['--hidden'] });
    if (!current.wasOpenedAtLogin && !current.openAtLogin) {
      configureAutoStart(true);
    }
  }

  // On Linux X11/XWayland, staggering window creation by 200ms allows the display
  // connection and visual mapping to complete cleanly before creating transparent windows.
  if (process.platform === 'linux') {
    setTimeout(createWindow, 200);
  } else {
    createWindow();
  }

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
