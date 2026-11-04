const { app, BrowserWindow, ipcMain, globalShortcut, clipboard, screen } = require('electron');
const path = require('path');
const fs = require('fs');

// Disable SUID sandbox in Linux development & force X11/Xwayland visual transparency
app.commandLine.appendSwitch('no-sandbox');
app.commandLine.appendSwitch('disable-setuid-sandbox');
app.commandLine.appendSwitch('enable-transparent-visuals');
app.commandLine.appendSwitch('ozone-platform', 'x11');
app.commandLine.appendSwitch('disable-gpu-sandbox');

let mainWindow = null;
let currentMode = 'head'; // 'head' (pure floating icon) | 'chat' (conversational messenger)

const SIZES = {
  head: { width: 84, height: 84 },
  chat: { width: 440, height: 620 },
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
    // Collapse back to floating mascot chat head
    mainWindow.setBounds({
      x: Math.min(currentX + (currentW - targetSize.width), screenWidth - targetSize.width - 20),
      y: Math.min(currentY + (currentH - targetSize.height), screenHeight - targetSize.height - 20),
      width: targetSize.width,
      height: targetSize.height,
    });
  }
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

// Close or hide window
ipcMain.on('window:close', () => {
  if (mainWindow) {
    mainWindow.close();
  }
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
