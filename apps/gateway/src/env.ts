import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const here = path.dirname(fileURLToPath(import.meta.url));

// Load environment variables from the repo root and the gateway package.
// The dev/prod scripts (`tsx watch src/index.ts`, `node dist/index.js`) do not
// use a dotenv package, so without this the gateway silently starts without
// GROQ_API_KEY / GEMINI_API_KEY and every AI request falls back to heuristics.
for (const envPath of [path.resolve(here, '../../../.env'), path.resolve(here, '../.env')]) {
  try {
    if (!fs.existsSync(envPath)) continue;

    for (const line of fs.readFileSync(envPath, 'utf8').split('\n')) {
      const match = line.match(/^\s*([\w.-]+)\s*=\s*(.*)?\s*$/);
      if (!match) continue;

      const key = match[1];
      let value = (match[2] || '').trim();
      if (
        (value.startsWith('"') && value.endsWith('"')) ||
        (value.startsWith("'") && value.endsWith("'"))
      ) {
        value = value.slice(1, -1);
      }

      // Never override variables explicitly provided by the host/container.
      if (!process.env[key]) process.env[key] = value;
    }
  } catch {
    // Ignore unreadable or malformed env files.
  }
}
