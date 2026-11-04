const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('glintDesktop', {
  isDesktopOverlay: true,
  setMode: (mode) => ipcRenderer.send('window:set-mode', { mode }),
  resizeWindow: (expanded) => ipcRenderer.send('window:resize', { expanded }),
  moveBy: (dx, dy) => ipcRenderer.send('window:move-by', { dx, dy }),
  writeClipboard: (text) => ipcRenderer.send('clipboard:write', text),
  onHotkeyToggle: (callback) => {
    const handler = () => callback();
    ipcRenderer.on('hotkey:toggle', handler);
    return () => ipcRenderer.removeListener('hotkey:toggle', handler);
  },
});
