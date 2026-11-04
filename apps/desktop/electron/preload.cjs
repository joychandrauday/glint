const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('glintDesktop', {
  isDesktopOverlay: true,
  setMode: (mode) => ipcRenderer.send('window:set-mode', { mode }),
  resizeWindow: (expanded) => ipcRenderer.send('window:resize', { expanded }),
  moveBy: (dx, dy) => ipcRenderer.send('window:move-by', { dx, dy }),
  closeWindow: () => ipcRenderer.send('window:close'),
  setSize: (width, height) => ipcRenderer.send('window:set-size', { width, height }),
  resizeBy: (dw, dh) => ipcRenderer.send('window:resize-by', { dw, dh }),
  getBounds: () => ipcRenderer.invoke('window:get-bounds'),
  writeClipboard: (text) => ipcRenderer.send('clipboard:write', text),
  queryAI: (query) => ipcRenderer.invoke('ai:query', { query }),
  signUpAdmin: (email, password) => ipcRenderer.invoke('auth:sign-up', { email, password }),
  onHotkeyToggle: (callback) => {
    const handler = () => callback();
    ipcRenderer.on('hotkey:toggle', handler);
    return () => ipcRenderer.removeListener('hotkey:toggle', handler);
  },
  onModeChanged: (callback) => {
    const handler = (event, data) => callback(data);
    ipcRenderer.on('window:mode-changed', handler);
    return () => ipcRenderer.removeListener('window:mode-changed', handler);
  },
});
