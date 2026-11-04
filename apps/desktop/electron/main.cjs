const { app, BrowserWindow, ipcMain, globalShortcut, clipboard, screen } = require('electron');
const path = require('path');

// Disable SUID sandbox in Linux development & enable transparent windowing
app.commandLine.appendSwitch('no-sandbox');
app.commandLine.appendSwitch('disable-setuid-sandbox');
app.commandLine.appendSwitch('enable-transparent-visuals');
app.commandLine.appendSwitch('disable-gpu-sandbox');

let mainWindow = null;

const BUBBLE_SIZE = { width: 76, height: 76 };
const OVERLAY_SIZE = { width: 400, height: 600 };

function createWindow() {
  const primaryDisplay = screen.getPrimaryDisplay();
  const { width: screenWidth, height: screenHeight } = primaryDisplay.workAreaSize;

  // Initial bubble position at bottom-right corner of screen
  const initialX = screenWidth - BUBBLE_SIZE.width - 24;
  const initialY = screenHeight - BUBBLE_SIZE.height - 24;

  mainWindow = new BrowserWindow({
    width: BUBBLE_SIZE.width,
    height: BUBBLE_SIZE.height,
    x: initialX,
    y: initialY,
    frame: false,
    transparent: true,
    backgroundColor: '#00000000',
    alwaysOnTop: true,
    skipTaskbar: true, // No dock, no sidebar — pure desktop floating overlay!
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
  mainWindow.setAlwaysOnTop(true, 'floating');
  mainWindow.setVisibleOnAllWorkspaces(true, { visibleOnFullScreen: true });

  const isDev = process.env.NODE_ENV === 'development' || !app.isPackaged;
  if (isDev) {
    const devUrl = process.env.VITE_DEV_SERVER_URL || 'http://localhost:5173';
    mainWindow.loadURL(devUrl);
  } else {
    mainWindow.loadFile(path.join(__dirname, '../dist/index.html'));
  }

  // Register Global Hotkeys
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

// Window resize between floating bubble and expanded messenger
ipcMain.on('window:resize', (event, { expanded }) => {
  if (!mainWindow) return;
  const primaryDisplay = screen.getPrimaryDisplay();
  const { width: screenWidth, height: screenHeight } = primaryDisplay.workAreaSize;

  if (expanded) {
    mainWindow.setBounds({
      width: OVERLAY_SIZE.width,
      height: OVERLAY_SIZE.height,
      x: screenWidth - OVERLAY_SIZE.width - 24,
      y: screenHeight - OVERLAY_SIZE.height - 24,
    });
  } else {
    mainWindow.setBounds({
      width: BUBBLE_SIZE.width,
      height: BUBBLE_SIZE.height,
      x: screenWidth - BUBBLE_SIZE.width - 24,
      y: screenHeight - BUBBLE_SIZE.height - 24,
    });
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
