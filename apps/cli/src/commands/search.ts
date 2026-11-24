import { select } from '@clack/prompts';
import { searchEngine } from '../services/searchEngine.js';
import { renderCommandCard } from '../ui/card.js';
import { theme } from '../ui/theme.js';
import { copyToClipboard } from '../services/clipboard.js';
import { resolveCommandVariables, executeCommand } from '../services/runner.js';
import { CheatsheetItem } from '@glint/shared';

export async function runInteractiveSearch(initialQuery = ''): Promise<void> {
  let query = initialQuery;
  const results = searchEngine.search(query, 12);

  if (!results.length) {
    console.log(`\n${theme.coral('No matching cheatsheet commands found in vault.')}\n`);
    return;
  }

  const options = results.map((r) => {
    const danger = r.item.dangerLevel === 'dangerous' ? '🚨' : r.item.dangerLevel === 'caution' ? '⚠️' : '✔';
    return {
      value: r.item.id,
      label: `${danger} ${r.item.command}`,
      hint: r.item.description.slice(0, 60),
    };
  });

  const selectedId = await select({
    message: theme.cyanBold(`Select a command (${results.length} matches):`),
    options,
  });

  if (typeof selectedId === 'symbol') return;

  const selected = results.find((r) => r.item.id === selectedId)?.item;
  if (!selected) return;

  await handleCommandAction(selected);
}

export async function handleCommandAction(item: CheatsheetItem): Promise<void> {
  console.log(`\n${renderCommandCard(item)}`);

  const action = await select({
    message: theme.cyanBold('What would you like to do?'),
    options: [
      { value: 'run', label: '⚡ Run command' },
      { value: 'copy', label: '📋 Copy to clipboard' },
      { value: 'cancel', label: '✖ Cancel' },
    ],
  });

  if (action === 'copy') {
    const resolved = await resolveCommandVariables(item);
    const ok = await copyToClipboard(resolved);
    console.log(ok ? `\n${theme.green('✔ Command copied to clipboard!')}\n` : `\n${theme.amber('Clipboard copy failed. Here is the command:')}\n${resolved}\n`);
  } else if (action === 'run') {
    const resolved = await resolveCommandVariables(item);
    await executeCommand(resolved);
  }
}
