import { renderToolCard } from '../ui/card.js';
import { theme } from '../ui/theme.js';
import { execSync } from 'child_process';
import { select } from '@clack/prompts';

export async function runToolsMenu(): Promise<void> {
  const tool = await select({
    message: theme.cyanBold('Select a developer micro-tool:'),
    options: [
      { value: 'port', label: '🔌 Port Killer (kill process hogging a port)' },
      { value: 'cron', label: '⏰ Cron Explainer & Calculator' },
      { value: 'jwt', label: '🔑 JWT Token Decoder' },
      { value: 'regex', label: '🔍 Regex Quick Matcher' },
    ],
  });

  if (typeof tool === 'symbol') return;

  if (tool === 'port') {
    await runKillPort();
  } else if (tool === 'cron') {
    explainCron('0 */2 * * *');
  } else if (tool === 'jwt') {
    console.log(`${theme.slate('Usage: glint tool jwt <token>')}\n`);
  } else if (tool === 'regex') {
    console.log(`${theme.slate('Usage: glint tool regex <pattern> <string>')}\n`);
  }
}

export function explainCron(expression: string): void {
  const parts = expression.trim().split(/\s+/);
  if (parts.length < 5) {
    console.log(`\n${theme.coral('Invalid cron expression. Expected 5 fields: minute hour day month weekday')}\n`);
    return;
  }

  const [min, hour, dom, mon, dow] = parts;
  const breakdown = [
    `• Minute:  ${theme.cyan(min)}`,
    `• Hour:    ${theme.cyan(hour)}`,
    `• Day:     ${theme.cyan(dom)}`,
    `• Month:   ${theme.cyan(mon)}`,
    `• Weekday: ${theme.cyan(dow)}`,
  ].join('\n');

  console.log(`\n${renderToolCard('CRON EXPLAINER', `Expression: ${expression}`, breakdown)}`);
}

export async function runKillPort(portArg?: string): Promise<void> {
  const port = portArg || '3000';
  let pid = '';
  let cmd = '';

  try {
    const out = execSync(`lsof -i :${port} -sTCP:LISTEN -t`, { encoding: 'utf8' }).trim();
    pid = out.split('\n')[0];
    if (pid) {
      cmd = execSync(`ps -p ${pid} -o comm=`, { encoding: 'utf8' }).trim();
    }
  } catch {
    // None found
  }

  if (!pid) {
    console.log(`\n${theme.green(`✔ Port ${port} is currently free. No listening process found.`)}\n`);
    return;
  }

  console.log(`\n${renderToolCard('PORT DETECTED', `Port ${port} is occupied`, `• PID: ${theme.cyanBold(pid)}\n• Process: ${theme.amber(cmd)}`)}`);

  const choice = await select({
    message: theme.coralBold(`Terminate process ${pid} (${cmd})?`),
    options: [
      { value: 'sigterm', label: '🛑 Safe Stop (SIGTERM)' },
      { value: 'sigkill', label: '⚡ Force Kill (SIGKILL -9)' },
      { value: 'cancel', label: '✖ Cancel' },
    ],
  });

  if (choice === 'sigterm') {
    execSync(`kill ${pid}`);
    console.log(`\n${theme.green(`✔ Sent SIGTERM to PID ${pid}`)}\n`);
  } else if (choice === 'sigkill') {
    execSync(`kill -9 ${pid}`);
    console.log(`\n${theme.green(`✔ Force-killed PID ${pid}`)}\n`);
  }
}

export function decodeJwt(token: string): void {
  const parts = token.trim().split('.');
  if (parts.length < 2) {
    console.log(`\n${theme.coral('Invalid JWT string format.')}\n`);
    return;
  }

  try {
    const header = JSON.parse(Buffer.from(parts[0], 'base64').toString('utf8'));
    const payload = JSON.parse(Buffer.from(parts[1], 'base64').toString('utf8'));

    const body = `${theme.slate('Header:')}\n${JSON.stringify(header, null, 2)}\n\n${theme.slate('Payload:')}\n${JSON.stringify(payload, null, 2)}`;
    console.log(`\n${renderToolCard('JWT INSPECTOR', 'Decoded Claims', body)}`);
  } catch (err: any) {
    console.log(`\n${theme.coral(`Failed to decode JWT: ${err.message}`)}\n`);
  }
}
