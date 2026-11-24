import fs from 'fs';
import os from 'os';
import path from 'path';
import { theme } from '../ui/theme.js';
import { renderErrorCard } from '../ui/card.js';
import { renderTokenPill } from '../ui/markdown.js';
import { createSpinner } from '../ui/spinner.js';
import { ai } from '../services/ai.js';
import { executeCommand } from '../services/runner.js';
import { select } from '@clack/prompts';
import { copyToClipboard } from '../services/clipboard.js';

export async function runTerminalDoctor(errorInput?: string): Promise<void> {
  let errorText = errorInput?.trim();

  // If no error passed directly, check piped stdin or last history entry
  if (!errorText && !process.stdin.isTTY) {
    try {
      errorText = fs.readFileSync(0, 'utf-8').trim();
    } catch {
      // Stdin read failure
    }
  }

  if (!errorText) {
    // Attempt to inspect shell history
    const zshHist = path.join(os.homedir(), '.zsh_history');
    const bashHist = path.join(os.homedir(), '.bash_history');
    let lastCmd = '';
    try {
      if (fs.existsSync(zshHist)) {
        const lines = fs.readFileSync(zshHist, 'utf8').trim().split('\n');
        lastCmd = lines[lines.length - 1]?.replace(/^: \d+:\d+;/, '') || '';
      } else if (fs.existsSync(bashHist)) {
        const lines = fs.readFileSync(bashHist, 'utf8').trim().split('\n');
        lastCmd = lines[lines.length - 1] || '';
      }
    } catch {
      // Ignore
    }

    if (lastCmd) {
      errorText = `Command failed: "${lastCmd}" with unknown error. Suggest diagnosis and verification.`;
    }
  }

  if (!errorText) {
    console.log(`\n${theme.coral('No error message provided or detected from stdin/history.')}`);
    console.log(`${theme.slate('Usage: glint fix "error message" OR <command> 2>&1 | glint fix')}\n`);
    return;
  }

  const spinner = createSpinner('Terminal Error Doctor diagnosing error stack...');
  spinner.start();

  const prompt = `A developer encountered this terminal error:\n"${errorText}"\nDiagnose the root issue and give the exact fix command.`;
  let result;
  try {
    result = await ai.askCommand(prompt);
  } catch (err: any) {
    spinner.stop();
    console.log(`\n${theme.coral(`Doctor diagnosis failed: ${err.message}`)}\n`);
    return;
  }

  spinner.stop();

  const { suggestion, meta } = result;

  if (!suggestion) {
    console.log(`\n${renderErrorCard('Unresolved Error', errorText, undefined)}`);
    console.log(`${theme.amber('No AI response generated. Run `glint config` to verify provider keys.')}\n`);
    return;
  }

  console.log(`\n${renderErrorCard(suggestion.description, errorText.slice(0, 300), suggestion.command)}`);
  console.log(`${theme.slate(`Explanation: ${suggestion.explanation}`)}`);
  console.log(renderTokenPill({
    tokens: meta.totalTokens,
    latencyMs: meta.latencyMs,
    cached: meta.cached,
    provider: meta.provider,
    model: meta.model,
    savedUSD: meta.savedUSD,
  }));
  console.log();

  const action = await select({
    message: theme.cyanBold('Would you like to apply the fix?'),
    options: [
      { value: 'run', label: '⚡ Run fix command now' },
      { value: 'copy', label: '📋 Copy fix command' },
      { value: 'dismiss', label: '✖ Dismiss' },
    ],
  });

  if (action === 'run') {
    await executeCommand(suggestion.command);
  } else if (action === 'copy') {
    await copyToClipboard(suggestion.command);
    console.log(`\n${theme.green('✔ Fix command copied to clipboard!')}\n`);
  }
}
