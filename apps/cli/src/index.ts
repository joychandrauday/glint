import { Command } from 'commander';
import { theme } from './ui/theme.js';
import { renderBanner } from './ui/banner.js';
import { startInteractiveSession } from './repl/session.js';
import { runInteractiveSearch } from './commands/search.js';
import { runTerminalDoctor } from './commands/fix.js';
import { runToolsMenu, explainCron, runKillPort, decodeJwt } from './commands/tools.js';
import { manageVault } from './commands/vault.js';
import { manageConfig } from './commands/config.js';
import { generateShellInit } from './commands/init.js';
import { ai } from './services/ai.js';
import { createSpinner } from './ui/spinner.js';
import { renderCommandCard } from './ui/card.js';
import { CheatsheetItem } from '@glint/shared';

const program = new Command();

program
  .name('glint')
  .description('Glint: The Developer Lightweight Desktop Command Cheatsheet, AI Copilot & Execution Hub')
  .version('0.2.14')
  .option('-p, --print <query>', 'Run a single prompt non-interactively (print mode)')
  .action(async (options) => {
    if (options.print) {
      const spinner = createSpinner('Glint querying...');
      spinner.start();
      const res = await ai.ask(options.print);
      spinner.stop();
      if (res) {
        const item: CheatsheetItem = {
          id: 'print-res',
          command: res.command,
          template: res.template,
          description: res.description,
          category: 'ai',
          tags: [],
          variables: [],
          platform: 'all',
          dangerLevel: res.dangerLevel,
          notes: res.explanation,
        };
        console.log(`\n${renderCommandCard(item, { isAI: true })}`);
      } else {
        console.log(`\n${theme.coral('No AI response. Run `glint config` to verify keys.')}\n`);
      }
      return;
    }

    // Default action: Start interactive Antigravity-style agent session
    await startInteractiveSession();
  });

program
  .command('search [query]')
  .description('Interactive fuzzy search across the preseeded cheatsheet vault')
  .action(async (query) => {
    await runInteractiveSearch(query || '');
  });

program
  .command('fix [error...]')
  .description('Terminal Error Doctor: Diagnose failed terminal commands and generate instant fixes')
  .action(async (args) => {
    await runTerminalDoctor(args?.join(' '));
  });

program
  .command('tool [name] [args...]')
  .description('Developer micro-tools (cron, port, jwt, regex)')
  .action(async (name, args) => {
    if (!name) {
      await runToolsMenu();
      return;
    }
    const tool = name.toLowerCase();
    if (tool === 'cron') {
      explainCron(args.join(' ') || '0 */2 * * *');
    } else if (tool === 'port' || tool === 'kill-port') {
      await runKillPort(args[0]);
    } else if (tool === 'jwt') {
      decodeJwt(args[0] || '');
    } else {
      await runToolsMenu();
    }
  });

program
  .command('vault')
  .description('Manage personal cheatsheet vault snippets')
  .action(async () => {
    await manageVault();
  });

program
  .command('config')
  .description('Manage BYOK AI providers and settings')
  .action(async () => {
    await manageConfig();
  });

program
  .command('init <shell>')
  .description('Generate shell integration hook (zsh, bash)')
  .action((shell) => {
    console.log(generateShellInit(shell));
  });

program.parse(process.argv);
