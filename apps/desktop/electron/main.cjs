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
  bar: { width: 520, height: 190 },
  full: { width: 440, height: 640 },
};

function createWindow() {
  const primaryDisplay = screen.getPrimaryDisplay();
  const { width: screenWidth, height: screenHeight } = primaryDisplay.workAreaSize;

  const initialSize = SIZES[currentMode];
  // Position in center-horizontal, comfortable floating position
  const initialX = Math.round((screenWidth - initialSize.width) / 2);
  const initialY = Math.round((screenHeight - initialSize.height) / 3);

  mainWindow = new BrowserWindow({
    width: initialSize.width,
    height: initialSize.height,
    x: initialX,
    y: initialY,
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

// Window Sizing & Positioning IPC (Free-floating anywhere on desktop)
ipcMain.on('window:set-mode', (event, { mode }) => {
  if (!mainWindow || !SIZES[mode]) return;
  currentMode = mode;

  const targetSize = SIZES[mode];
  const primaryDisplay = screen.getPrimaryDisplay();
  const { width: screenWidth, height: screenHeight } = primaryDisplay.workAreaSize;

  const [currentX, currentY] = mainWindow.getPosition();
  const [currentW, currentH] = mainWindow.getSize();

  // Anchor to center of current position so it expands/collapses right where user dragged it
  const centerX = currentX + currentW / 2;
  const centerY = currentY + currentH / 2;

  let newX = Math.round(centerX - targetSize.width / 2);
  let newY = Math.round(centerY - targetSize.height / 2);

  // Clamp within desktop screen area so it doesn't leave the viewable screen
  newX = Math.max(10, Math.min(screenWidth - targetSize.width - 10, newX));
  newY = Math.max(10, Math.min(screenHeight - targetSize.height - 10, newY));

  mainWindow.setBounds({
    width: targetSize.width,
    height: targetSize.height,
    x: newX,
    y: newY,
  });
});

ipcMain.on('window:move-by', (event, { dx, dy }) => {
  if (!mainWindow) return;
  const primaryDisplay = screen.getPrimaryDisplay();
  const { width: screenWidth, height: screenHeight } = primaryDisplay.workAreaSize;

  const [currentX, currentY] = mainWindow.getPosition();
  const [currentW, currentH] = mainWindow.getSize();

  let newX = Math.round(currentX + dx);
  let newY = Math.round(currentY + dy);

  // Prevent dragging completely off the display
  newX = Math.max(-currentW + 50, Math.min(screenWidth - 50, newX));
  newY = Math.max(0, Math.min(screenHeight - 50, newY));

  mainWindow.setPosition(newX, newY);
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
