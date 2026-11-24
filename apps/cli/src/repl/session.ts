import readline from 'readline';
import { theme } from '../ui/theme.js';
import { renderSessionHeader } from '../ui/banner.js';
import { getWorkspaceContext } from './context.js';
import { handleSlashCommand, setLastAssistantSnippet, SLASH_COMMANDS } from './slashCommands.js';
import { storage } from '../services/storage.js';
import { searchEngine } from '../services/searchEngine.js';
import { handleCommandAction } from '../commands/search.js';
import { ai, AISuggestion } from '../services/ai.js';
import { cache } from '../services/cache.js';
import { contextManager } from '../services/contextManager.js';
import { createSpinner } from '../ui/spinner.js';
import { renderCommandCard } from '../ui/card.js';
import { renderMarkdown, renderTokenPill, StreamingMarkdownRenderer } from '../ui/markdown.js';
import { executeCommand } from '../services/runner.js';
import { copyToClipboard } from '../services/clipboard.js';
import { select } from '@clack/prompts';
import { CheatsheetItem } from '@glint/shared';

export async function startInteractiveSession(): Promise<void> {
  const ws = getWorkspaceContext();
  const config = storage.getConfig();
  const vaultCount = searchEngine.getCount();
  const cacheStats = cache.getStats();

  console.clear();
  console.log(
    renderSessionHeader({
      cwd: process.cwd(),
      gitBranch: ws.gitBranch,
      provider: config.activeProvider,
      model: storage.getActiveModel(),
      mode: config.mode,
      vaultCount,
      cacheCount: cacheStats.totalEntries,
    })
  );

  const slashNames = SLASH_COMMANDS.map((c) => c.command);

  const completer = (line: string): [string[], string] => {
    const trimmed = line.trim();
    if (trimmed.startsWith('/')) {
      const hits = slashNames.filter((c) => c.startsWith(trimmed));
      return [hits.length ? hits : slashNames, line];
    }
    return [[], line];
  };

  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
    terminal: true,
    completer,
  });

  const promptUser = () => {
    const currentConfig = storage.getConfig();
    const branchLabel = ws.gitBranch ? ` ${theme.cyan(`(${ws.gitBranch})`)}` : '';
    const modeBadge = theme.slate(`[${currentConfig.mode}]`);
    const promptStr = `\n${theme.slate('╭─')} [${theme.cyanBold('glint')}] ${modeBadge} ${theme.white(ws.cwd)}${branchLabel} ⚡\n${theme.slate('╰─❯')} `;

    rl.question(promptStr, async (input) => {
      const line = input.trim();

      if (!line) {
        promptUser();
        return;
      }

      if (line.startsWith('/') || line.toLowerCase() === 'help') {
        await handleSlashCommand(line.startsWith('/') ? line : '/help');
        promptUser();
        return;
      }

      // Copilot Mode: Direct 1-line command synthesis card
      if (currentConfig.mode === 'copilot') {
        const spinner = createSpinner('Glint Copilot synthesizing terminal command...');
        spinner.start();

        try {
          const { suggestion, meta } = await ai.askCommand(line);
          spinner.stop();

          if (suggestion) {
            const item: CheatsheetItem = {
              id: `ai-${Date.now()}`,
              command: suggestion.command,
              template: suggestion.template || suggestion.command,
              description: suggestion.description,
              category: 'ai-copilot',
              tags: ['copilot'],
              variables: [],
              platform: 'all',
              dangerLevel: suggestion.dangerLevel || 'safe',
              notes: suggestion.explanation,
            };

            setLastAssistantSnippet(suggestion.command);
            console.log(renderTokenPill({
              tokens: meta.totalTokens,
              latencyMs: meta.latencyMs,
              cached: meta.cached,
              provider: meta.provider,
              model: meta.model,
              savedUSD: meta.savedUSD,
            }, '⚡'));
            await handleCommandAction(item);
          } else {
            console.log(`\n${theme.coral('No command generated. Check your API key with /keys or /config.')}\n`);
          }
        } catch (err: any) {
          spinner.stop();
          console.log(`\n${theme.coral(`Error: ${err.message}`)}\n`);
        }

        promptUser();
        return;
      }

      // Agent / Chat Mode: Full conversational AI with streaming response & token optimization
      contextManager.addMessage({ role: 'user', content: line });

      // Auto-compact if token budget is nearing threshold
      if (currentConfig.autoCompact) {
        await contextManager.compact();
      }

      console.log(`\n${theme.cyanBold('╭─ ⚡ Glint')}`);
      let streamedResponse = '';
      const renderer = new StreamingMarkdownRenderer(theme.slate('│  '));
      const onToken = (chunk: string) => {
        streamedResponse += chunk;
        renderer.push(chunk);
      };

      try {
        const meta = await ai.streamChat(contextManager.getMessages(), onToken);
        renderer.flush();

        contextManager.addMessage({ role: 'assistant', content: streamedResponse });
        contextManager.recordUsage(meta.totalTokens);

        // Display Token & Latency Footer Pill with conversational closure
        console.log(
          renderTokenPill(
            {
              tokens: meta.totalTokens,
              latencyMs: meta.latencyMs,
              cached: meta.cached,
              provider: meta.provider,
              model: meta.model,
              savedUSD: meta.savedUSD,
            },
            '╰─'
          )
        );

        // Extract primary code block or command if present
        const codeBlockMatch = streamedResponse.match(/```(?:bash|sh|zsh)?\n([\s\S]*?)```/);
        const codeSnippet = codeBlockMatch ? codeBlockMatch[1].trim() : '';

        if (codeSnippet) {
          setLastAssistantSnippet(codeSnippet);
        }

        // If in Agent mode and a shell snippet was generated, offer execution
        if (currentConfig.mode === 'agent' && codeSnippet && !codeSnippet.includes('\n')) {
          console.log();
          const action = await select({
            message: theme.cyanBold(`Would you like to execute \`${codeSnippet}\`?`),
            options: [
              { value: 'run', label: '⚡ Run command' },
              { value: 'copy', label: '📋 Copy to clipboard' },
              { value: 'skip', label: '✔ Continue chat' },
            ],
          });

          if (action === 'run') {
            await executeCommand(codeSnippet);
          } else if (action === 'copy') {
            await copyToClipboard(codeSnippet);
            console.log(`\n${theme.green('✔ Copied command to clipboard!')}\n`);
          }
        }
      } catch (err: any) {
        renderer.flush();
        console.log(`${theme.slate('│  ')}${theme.coral(`[AI Execution Error: ${err.message}]`)}`);
        console.log(`${theme.slate('╰─')} ${theme.slate('Hint: Use /keys (or /keys <provider> <key>) to set your API key.')}\n`);
      }

      promptUser();
    });
  };

  rl.on('close', () => {
    console.log(`\n${theme.cyan('Goodbye from Glint AI Assistant! ⚡')}\n`);
    process.exit(0);
  });

  promptUser();
}
