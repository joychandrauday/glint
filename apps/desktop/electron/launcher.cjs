#!/usr/bin/env node
const { spawn } = require('child_process');
const path = require('path');
const http = require('http');
const fs = require('fs');

const VITE_PORT = 5173;
const VITE_URL = `http://localhost:${VITE_PORT}`;

function isServerRunning(url) {
  return new Promise((resolve) => {
    const req = http.get(url, (res) => {
      resolve(true);
    });
    req.on('error', () => resolve(false));
    req.setTimeout(1000, () => {
      req.destroy();
      resolve(false);
    });
  });
}

async function waitForServer(url, timeoutMs = 8000) {
  const start = Date.now();
  while (Date.now() - start < timeoutMs) {
    if (await isServerRunning(url)) return true;
    await new Promise((r) => setTimeout(r, 200));
  }
  return false;
}

function findViteBin(appDir) {
  try {
    const pkgPath = require.resolve('vite/package.json', { paths: [appDir, path.resolve(appDir, '../..')] });
    return path.join(path.dirname(pkgPath), 'bin/vite.js');
  } catch (e) {
    const fallbackRoot = path.resolve(appDir, '../../node_modules/vite/bin/vite.js');
    if (fs.existsSync(fallbackRoot)) return fallbackRoot;
    return path.resolve(appDir, 'node_modules/vite/bin/vite.js');
  }
}

async function main() {
  console.log('[Glint] Starting Glint Native Desktop Overlay...');

  const appDir = path.resolve(__dirname, '..');
  const distHtml = path.join(appDir, 'dist/index.html');
  const viteBin = findViteBin(appDir);

  // Verify that dist build exists as instant reliable fallback
  if (!fs.existsSync(distHtml)) {
    console.log('[Glint] Building desktop bundle before launch...');
    try {
      require('child_process').execSync(`"${process.execPath}" "${viteBin}" build`, {
        cwd: appDir,
        stdio: 'inherit',
      });
    } catch (err) {
      console.warn('[Glint] Vite build warning:', err.message);
    }
  }

  const alreadyRunning = await isServerRunning(VITE_URL);
  let viteProcess = null;

  if (!alreadyRunning) {
    console.log('[Glint] Launching desktop renderer dev server...');

    viteProcess = spawn(process.execPath, [viteBin, '--port', String(VITE_PORT)], {
      cwd: appDir,
      stdio: ['ignore', 'pipe', 'pipe'],
      shell: false,
    });

    viteProcess.stdout?.on('data', (d) => {
      const msg = d.toString().trim();
      if (msg) console.log(`[Glint Renderer] ${msg}`);
    });
    viteProcess.stderr?.on('data', (d) => {
      const msg = d.toString().trim();
      if (msg) console.error(`[Glint Renderer] ${msg}`);
    });

    const ready = await waitForServer(VITE_URL);
    if (ready) {
      console.log('[Glint] Renderer dev server ready at', VITE_URL);
    } else {
      console.log('[Glint] Dev server starting in background, using local bundle fallback...');
    }
  } else {
    console.log('[Glint] Renderer server already active at', VITE_URL);
  }

  // Launch Electron Native Desktop Overlay with Linux sandbox flags & X11 transparency
  console.log('[Glint] Spawning native transparent desktop window overlay...');
  const electronPath = require('electron');
  const appRoot = path.resolve(__dirname, '..');

  const electronArgs = [
    '--no-sandbox',
    '--disable-setuid-sandbox',
    '--enable-transparent-visuals',
    appRoot,
  ];

  const electronProcess = spawn(electronPath, electronArgs, {
    env: {
      ...process.env,
      ELECTRON_DISABLE_SANDBOX: '1',
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
    console.error('[Glint] Failed to launch Electron:', err.message);
  });

  process.on('SIGINT', () => {
    if (viteProcess) viteProcess.kill();
    electronProcess.kill();
    process.exit(0);
  });
}

main().catch(console.error);
