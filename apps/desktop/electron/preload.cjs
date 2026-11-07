const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('glintDesktop', {
  isDesktopOverlay: true,
  setMode: (mode) => ipcRenderer.send('window:set-mode', { mode }),
  resizeWindow: (expanded) => ipcRenderer.send('window:resize', { expanded }),
  moveBy: (dx, dy) => ipcRenderer.send('window:move-by', { dx, dy }),
  dragStart: (data) => ipcRenderer.send('window:drag-start', data),
  dragMove: (data) => ipcRenderer.send('window:drag-move', data),
  dragEnd: () => ipcRenderer.send('window:drag-end'),
  closeWindow: () => ipcRenderer.send('window:close'),
  setSize: (width, height) => ipcRenderer.send('window:set-size', { width, height }),
  resizeBy: (dw, dh) => ipcRenderer.send('window:resize-by', { dw, dh }),
  getBounds: () => ipcRenderer.invoke('window:get-bounds'),
  writeClipboard: (text) => ipcRenderer.send('clipboard:write', text),
  readClipboard: () => ipcRenderer.invoke('clipboard:read-text'),
  queryAI: (query, byok) => ipcRenderer.invoke('ai:query', { query, byok }),
  abortAIQuery: () => ipcRenderer.invoke('ai:abort'),
  testApiKey: (payload) => ipcRenderer.invoke('ai:test-key', payload),
  detectOllama: (host) => ipcRenderer.invoke('ai:detect-ollama', { host }),
  signUpAdmin: (email, password) => ipcRenderer.invoke('auth:sign-up', { email, password }),
  getAutoStartStatus: () => ipcRenderer.invoke('autostart:get-status'),
  setAutoStartStatus: (enabled) => ipcRenderer.invoke('autostart:set-status', { enabled }),
  setPingBubble: (active) => ipcRenderer.invoke('window:set-ping-bubble', { active }),
  quitApp: () => ipcRenderer.send('app:quit'),
  restartApp: () => ipcRenderer.send('app:restart'),
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
