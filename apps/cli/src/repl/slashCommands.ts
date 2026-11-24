import { theme } from '../ui/theme.js';
import { runInteractiveSearch } from '../commands/search.js';
import { runTerminalDoctor } from '../commands/fix.js';
import { runToolsMenu } from '../commands/tools.js';
import { manageVault } from '../commands/vault.js';
import { manageConfig } from '../commands/config.js';

export async function handleSlashCommand(input: string): Promise<boolean> {
  const parts = input.trim().split(/\s+/);
  const cmd = parts[0].toLowerCase();
  const args = parts.slice(1).join(' ');

  switch (cmd) {
    case '/help':
      console.log(`\n${theme.cyanBold('⚡ Glint Slash Commands Catalog:')}`);
      console.log(`  ${theme.cyanBold('/search [query]')}   - Interactive fuzzy search across offline vault`);
      console.log(`  ${theme.cyanBold('/fix [error]')}      - Terminal Error Doctor diagnostic`);
      console.log(`  ${theme.cyanBold('/tools')}            - Developer micro-tools (Cron, Regex, Port, JWT)`);
      console.log(`  ${theme.cyanBold('/vault')}            - View and manage personal snippets`);
      console.log(`  ${theme.cyanBold('/config')}           - Manage AI keys and active provider`);
      console.log(`  ${theme.cyanBold('/clear')}            - Clear screen viewport`);
      console.log(`  ${theme.cyanBold('/exit')}             - Exit session (or Ctrl+D)\n`);
      return true;

    case '/search':
      await runInteractiveSearch(args);
      return true;

    case '/fix':
      await runTerminalDoctor(args);
      return true;

    case '/tools':
      await runToolsMenu();
      return true;

    case '/vault':
      await manageVault();
      return true;

    case '/config':
      await manageConfig();
      return true;

    case '/clear':
      console.clear();
      return true;

    case '/exit':
    case '/quit':
      process.exit(0);

    default:
      console.log(`\n${theme.coral(`Unknown slash command: ${cmd}`)}. Type ${theme.cyanBold('/help')} for options.\n`);
      return true;
  }
}
