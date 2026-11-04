#!/usr/bin/env node
const { spawn } = require('child_process');
const path = require('path');
const http = require('http');

const VITE_PORT = 5173;
const VITE_URL = `http://localhost:${VITE_PORT}`;

function isServerRunning(url) {
  return new Promise((resolve) => {
    http.get(url, () => resolve(true)).on('error', () => resolve(false));
  });
}

async function waitForServer(url, timeoutMs = 15000) {
  const start = Date.now();
  while (Date.now() - start < timeoutMs) {
    if (await isServerRunning(url)) return true;
    await new Promise((r) => setTimeout(r, 250));
  }
  return false;
}

async function main() {
  console.log('[Glint] Starting Glint Native Desktop Overlay...');

  const alreadyRunning = await isServerRunning(VITE_URL);
  let viteProcess = null;

  if (!alreadyRunning) {
    console.log('[Glint] Launching desktop renderer server...');
    const appDir = path.resolve(__dirname, '..');
    const viteBin = path.resolve(appDir, 'node_modules/vite/bin/vite.js');

    viteProcess = spawn(process.execPath, [viteBin, '--port', String(VITE_PORT)], {
      cwd: appDir,
      stdio: 'pipe',
      shell: false,
    });

    const ready = await waitForServer(VITE_URL);
    if (!ready) {
      console.error('[Glint] Timed out waiting for renderer server.');
    }
  } else {
    console.log('[Glint] Renderer server already active at', VITE_URL);
  }

  // Launch Electron Native Desktop Overlay with Linux sandbox flags
  console.log('[Glint] Spawning native transparent desktop window...');
  const electronPath = require('electron');
  const appRoot = path.resolve(__dirname, '..');

  const electronArgs = [
    '--no-sandbox',
    '--disable-setuid-sandbox',
    '--enable-transparent-visuals',
    '--ozone-platform=x11',
    appRoot,
  ];

  const electronProcess = spawn(electronPath, electronArgs, {
    env: {
      ...process.env,
      ELECTRON_DISABLE_SANDBOX: '1',
      ELECTRON_OZONE_PLATFORM_HINT: 'x11',
      NODE_ENV: 'development',
      VITE_DEV_SERVER_URL: VITE_URL,
    },
    stdio: 'inherit',
  });

  electronProcess.on('close', (code) => {
    console.log('[Glint] Desktop overlay closed.');
    if (viteProcess) {
      viteProcess.kill();
    }
    process.exit(code || 0);
  });

  electronProcess.on('error', (err) => {
    console.error('[Glint] Failed to launch Electron directly:', err.message);
  });

  process.on('SIGINT', () => {
    if (viteProcess) viteProcess.kill();
    electronProcess.kill();
    process.exit(0);
  });
}

main().catch(console.error);
