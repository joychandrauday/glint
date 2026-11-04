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
    const npxCmd = process.platform === 'win32' ? 'npx.cmd' : 'npx';
    viteProcess = spawn(npxCmd, ['vite', '--port', String(VITE_PORT)], {
      cwd: path.resolve(__dirname, '..'),
      stdio: 'pipe',
      shell: true,
    });

    const ready = await waitForServer(VITE_URL);
    if (!ready) {
      console.error('[Glint] Timed out waiting for renderer server.');
    }
  } else {
    console.log('[Glint] Renderer server already active at', VITE_URL);
  }

  // Launch Electron Native Desktop Overlay
  console.log('[Glint] Spawning native transparent desktop window...');
  const electronPath = require('electron');
  const appRoot = path.resolve(__dirname, '..');

  const electronProcess = spawn(electronPath, [appRoot], {
    env: {
      ...process.env,
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
    // Fallback: Standalone Frameless Chrome/Chromium App Window
    console.log('[Glint] Attempting standalone frameless desktop window fallback...');
    const browsers = ['google-chrome', 'chromium', 'google-chrome-stable', 'chromium-browser', 'brave-browser'];
    let launched = false;

    for (const b of browsers) {
      try {
        const appWin = spawn(b, [
          `--app=${VITE_URL}`,
          '--window-size=420,620',
          '--window-position=1400,400',
          '--class=glint-overlay',
        ], { stdio: 'ignore', detached: true });

        appWin.unref();
        launched = true;
        console.log(`[Glint] Desktop overlay launched in standalone app-window via ${b}!`);
        break;
      } catch {}
    }

    if (!launched) {
      console.log(`[Glint] Please open ${VITE_URL} or run from your host desktop: npm run --workspace=@glint/desktop desktop`);
    }
  });

  process.on('SIGINT', () => {
    if (viteProcess) viteProcess.kill();
    electronProcess.kill();
    process.exit(0);
  });
}

main().catch(console.error);
