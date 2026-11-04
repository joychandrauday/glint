const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('glintDesktop', {
  isDesktopOverlay: true,
  resizeWindow: (expanded) => ipcRenderer.send('window:resize', { expanded }),
  minimizeToBubble: () => ipcRenderer.send('window:minimize-to-bubble'),
  writeClipboard: (text) => ipcRenderer.send('clipboard:write', text),
  onHotkeyToggle: (callback) => {
    const handler = () => callback();
    ipcRenderer.on('hotkey:toggle', handler);
    return () => ipcRenderer.removeListener('hotkey:toggle', handler);
  },
});
