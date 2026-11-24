import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const cliRoot = path.resolve(__dirname, '..');

const distDir = path.join(cliRoot, 'dist');
const binDir = path.join(cliRoot, 'bin');

if (!fs.existsSync(distDir)) fs.mkdirSync(distDir, { recursive: true });
if (!fs.existsSync(binDir)) fs.mkdirSync(binDir, { recursive: true });

const bundlePath = path.join(distDir, 'bundle.js');
const binGlint = path.join(binDir, 'glint.js');
const distGlint = path.join(distDir, 'glint');

let builtWithBun = false;
try {
  execSync('bun build src/index.ts --target=node --outfile=dist/bundle.js', {
    cwd: cliRoot,
    stdio: 'inherit',
  });
  builtWithBun = true;
} catch {
  console.log('Bun not found, using esbuild fallback...');
  execSync(
    'npx esbuild src/index.ts --bundle --platform=node --format=esm --outfile=dist/bundle.js --banner:js="#!/usr/bin/env node" --packages=external',
    { cwd: cliRoot, stdio: 'inherit' }
  );
}

// Add shebang if built with bun
if (builtWithBun) {
  const content = fs.readFileSync(bundlePath, 'utf8');
  if (!content.startsWith('#!/usr/bin/env node')) {
    fs.writeFileSync(binGlint, '#!/usr/bin/env node\n' + content, 'utf8');
  } else {
    fs.writeFileSync(binGlint, content, 'utf8');
  }
} else {
  fs.copyFileSync(bundlePath, binGlint);
}

try {
  fs.chmodSync(binGlint, 0o755);
} catch {}

fs.copyFileSync(binGlint, distGlint);
try {
  fs.chmodSync(distGlint, 0o755);
} catch {}

console.log('✔ Glint CLI bundled successfully.');
