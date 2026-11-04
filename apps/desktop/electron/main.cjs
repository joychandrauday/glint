const { app, BrowserWindow, ipcMain, globalShortcut, clipboard, screen } = require('electron');
const path = require('path');

// Disable SUID sandbox in Linux development & force X11/Xwayland visual transparency
app.commandLine.appendSwitch('no-sandbox');
app.commandLine.appendSwitch('disable-setuid-sandbox');
app.commandLine.appendSwitch('enable-transparent-visuals');
app.commandLine.appendSwitch('ozone-platform', 'x11');
app.commandLine.appendSwitch('disable-gpu-sandbox');

let mainWindow = null;
let currentMode = 'bar'; // 'bar' | 'full' | 'bubble'

const SIZES = {
  bar: { width: 520, height: 74 },
  full: { width: 460, height: 600 },
  bubble: { width: 80, height: 80 },
};

function createWindow() {
  const primaryDisplay = screen.getPrimaryDisplay();
  const { width: screenWidth, height: screenHeight } = primaryDisplay.workAreaSize;

  // Initial position: comfortably centered horizontally at upper-third of screen (Raycast / Spotlight style)
  const initialSize = SIZES[currentMode];
  const initialX = Math.round((screenWidth - initialSize.width) / 2);
  const initialY = Math.round(screenHeight * 0.2);

  mainWindow = new BrowserWindow({
    width: initialSize.width,
    height: initialSize.height,
    x: initialX,
    y: initialY,
    frame: false,
    transparent: true,
    backgroundColor: '#00000000',
    alwaysOnTop: true,
    skipTaskbar: false, // Standard window manager integration so GNOME doesn't capture it into sidebars
    resizable: false,
    movable: true,
    hasShadow: false,
    webPreferences: {
      preload: path.join(__dirname, 'preload.cjs'),
      nodeIntegration: false,
      contextIsolation: true,
    },
  });

  // Keep window floating on top
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

// Window sizing & mode switching IPC
ipcMain.on('window:set-mode', (event, { mode }) => {
  if (!mainWindow || !SIZES[mode]) return;
  currentMode = mode;
  const targetSize = SIZES[mode];
  const [currentX, currentY] = mainWindow.getPosition();
  const [currentW] = mainWindow.getSize();

  // Keep horizontal center anchor when expanding or collapsing
  const diffW = targetSize.width - currentW;
  const newX = Math.max(10, Math.round(currentX - diffW / 2));

  mainWindow.setBounds({
    x: newX,
    y: currentY,
    width: targetSize.width,
    height: targetSize.height,
  });
});

// Backwards-compatible window:resize
ipcMain.on('window:resize', (event, { expanded }) => {
  const mode = expanded ? 'full' : 'bubble';
  if (!mainWindow || !SIZES[mode]) return;
  currentMode = mode;
  const targetSize = SIZES[mode];
  mainWindow.setSize(targetSize.width, targetSize.height);
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
