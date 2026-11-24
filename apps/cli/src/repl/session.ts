import readline from 'readline';
import { theme } from '../ui/theme.js';
import { renderSessionHeader } from '../ui/banner.js';
import { getWorkspaceContext } from './context.js';
import { handleSlashCommand } from './slashCommands.js';
import { storage } from '../services/storage.js';
import { searchEngine } from '../services/searchEngine.js';
import { handleCommandAction } from '../commands/search.js';
import { ai } from '../services/ai.js';
import { createSpinner } from '../ui/spinner.js';
import { renderCommandCard } from '../ui/card.js';
import { CheatsheetItem } from '@glint/shared';

export async function startInteractiveSession(): Promise<void> {
  const ws = getWorkspaceContext();
  const config = storage.getConfig();
  const vaultCount = searchEngine.getCount();

  console.clear();
  console.log(
    renderSessionHeader({
      cwd: process.cwd(),
      gitBranch: ws.gitBranch,
      provider: config.activeProvider.toUpperCase(),
      model: config.activeProvider === 'groq' ? config.groqModel : config.activeProvider === 'gemini' ? config.geminiModel : config.ollamaModel,
      vaultCount,
    })
  );

  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
    terminal: true,
  });

  const promptUser = () => {
    const branchLabel = ws.gitBranch ? ` ${theme.cyan(`(${ws.gitBranch})`)}` : '';
    const promptStr = `\n${theme.slate('╭─')} [${theme.cyanBold('glint')}] ${theme.white(ws.cwd)}${branchLabel} ⚡\n${theme.slate('╰─❯')} `;
    rl.question(promptStr, async (input) => {
      const line = input.trim();

      if (!line) {
        promptUser();
        return;
      }

      if (line.startsWith('/')) {
        await handleSlashCommand(line);
        promptUser();
        return;
      }

      // Check deterministic local vault first
      const matches = searchEngine.search(line, 1);
      const topMatch = matches[0];

      // If very strong local match (score <= 0.25)
      if (topMatch && topMatch.score <= 0.25) {
        await handleCommandAction(topMatch.item);
        promptUser();
        return;
      }

      // Natural language AI Query
      const spinner = createSpinner('Glint AI synthesizing solution...');
      spinner.start();

      const suggestion = await ai.ask(line);
      spinner.stop();

      if (suggestion) {
        const item: CheatsheetItem = {
          id: `ai-${Date.now()}`,
          command: suggestion.command,
          template: suggestion.template || suggestion.command,
          description: suggestion.description,
          category: 'ai-generated',
          tags: ['ai'],
          variables: [],
          platform: 'all',
          dangerLevel: suggestion.dangerLevel || 'safe',
          notes: suggestion.explanation,
        };

        await handleCommandAction(item);
      } else {
        // Fallback to top fuzzy search match if available
        if (topMatch) {
          console.log(`\n${theme.slate('No AI response. Showing closest matching vault cheatsheet:')}`);
          await handleCommandAction(topMatch.item);
        } else {
          console.log(`\n${theme.coral('No match found and no AI response. Use /help or /config to configure API keys.')}\n`);
        }
      }

      promptUser();
    });
  };

  rl.on('close', () => {
    console.log(`\n${theme.cyan('Goodbye from Glint! ⚡')}\n`);
    process.exit(0);
  });

  promptUser();
}
