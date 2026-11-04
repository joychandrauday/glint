const { app, BrowserWindow, ipcMain, globalShortcut, clipboard, screen } = require('electron');
const path = require('path');

// Disable SUID sandbox in Linux development & enable transparent windowing
app.commandLine.appendSwitch('no-sandbox');
app.commandLine.appendSwitch('disable-setuid-sandbox');
app.commandLine.appendSwitch('enable-transparent-visuals');
app.commandLine.appendSwitch('disable-gpu-sandbox');

let mainWindow = null;
let currentMode = 'bar'; // 'bubble' | 'bar' | 'full'

const SIZES = {
  bubble: { width: 84, height: 84 },
  bar: { width: 500, height: 190 },
  full: { width: 440, height: 640 },
};

function createWindow() {
  const primaryDisplay = screen.getPrimaryDisplay();
  const { width: screenWidth, height: screenHeight } = primaryDisplay.workAreaSize;

  const initialSize = SIZES[currentMode];

  mainWindow = new BrowserWindow({
    width: initialSize.width,
    height: initialSize.height,
    x: screenWidth - initialSize.width - 24,
    y: screenHeight - initialSize.height - 24,
    frame: false,
    transparent: true,
    backgroundColor: '#00000000',
    alwaysOnTop: true,
    skipTaskbar: true,
    resizable: false,
    hasShadow: false,
    type: 'toolbar', // Desktop floating widget type on Linux
    webPreferences: {
      preload: path.join(__dirname, 'preload.cjs'),
      nodeIntegration: false,
      contextIsolation: true,
    },
  });

  // Keep window floating on top across workspaces
  mainWindow.setAlwaysOnTop(true, 'screen-saver');
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

// Window Sizing & Positioning IPC
ipcMain.on('window:set-mode', (event, { mode }) => {
  if (!mainWindow || !SIZES[mode]) return;
  currentMode = mode;

  const targetSize = SIZES[mode];
  const primaryDisplay = screen.getPrimaryDisplay();
  const { width: screenWidth, height: screenHeight } = primaryDisplay.workAreaSize;

  const [currentX, currentY] = mainWindow.getPosition();
  const [currentW, currentH] = mainWindow.getSize();

  // Anchor to bottom-right corner when expanding/contracting
  const deltaW = targetSize.width - currentW;
  const deltaH = targetSize.height - currentH;

  mainWindow.setBounds({
    width: targetSize.width,
    height: targetSize.height,
    x: Math.max(0, currentX - deltaW),
    y: Math.max(0, currentY - deltaH),
  });
});

ipcMain.on('window:move-by', (event, { dx, dy }) => {
  if (!mainWindow) return;
  const [currentX, currentY] = mainWindow.getPosition();
  mainWindow.setPosition(Math.round(currentX + dx), Math.round(currentY + dy));
});

ipcMain.on('clipboard:write', (event, text) => {
  clipboard.writeText(text);
});

app.whenReady().then(() => {
  createWindow();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
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
