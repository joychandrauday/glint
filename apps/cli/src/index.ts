import { Command } from 'commander';
import { theme } from './ui/theme.js';
import { renderBanner } from './ui/banner.js';
import { startInteractiveSession } from './repl/session.js';
import { runInteractiveSearch } from './commands/search.js';
import { runTerminalDoctor } from './commands/fix.js';
import { runToolsMenu, explainCron, runKillPort, decodeJwt } from './commands/tools.js';
import { manageVault } from './commands/vault.js';
import { manageConfig } from './commands/config.js';
import { manageKeys } from './commands/keys.js';
import { manageModel } from './commands/model.js';
import { generateShellInit } from './commands/init.js';
import { ai } from './services/ai.js';
import { cache } from './services/cache.js';
import { storage, AIProvider, CliConfig } from './services/storage.js';
import { renderTokenPill } from './ui/markdown.js';

const program = new Command();

program
  .name('glint')
  .description('Glint: The Developer Lightweight Desktop & Terminal AI Co-Pilot (BYOK, Caching & Cheatsheets)')
  .version('0.2.21')
  .argument('[prompt...]', 'Ask Glint AI directly or enter interactive session')
  .option('-p, --print <query>', 'One-shot AI query (non-interactive)')
  .action(async (promptParts: string[], options) => {
    const rawPrompt = options.print || (promptParts && promptParts.length > 0 ? promptParts.join(' ') : '');

    if (rawPrompt) {
      console.log(`\n${theme.cyanBold('╭─ ⚡ Glint')} ${theme.slate(`[${storage.getConfig().activeProvider}:${storage.getActiveModel()}]`)}`);
      
      let fullText = '';
      let atLineStart = true;
      const onToken = (chunk: string) => {
        fullText += chunk;
        let formatted = '';
        for (let i = 0; i < chunk.length; i++) {
          const char = chunk[i];
          if (atLineStart) {
            formatted += theme.slate('│  ');
            atLineStart = false;
          }
          formatted += char;
          if (char === '\n') {
            atLineStart = true;
          }
        }
        process.stdout.write(formatted);
      };

      try {
        const meta = await ai.streamChat([{ role: 'user', content: rawPrompt }], onToken);
        if (!atLineStart) {
          process.stdout.write('\n');
        }
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
        console.log();
      } catch (err: any) {
        if (!atLineStart) {
          process.stdout.write('\n');
        }
        console.log(`${theme.slate('│  ')}${theme.coral(`Error: ${err.message}`)}`);
        console.log(`${theme.slate('╰─')}\n`);
      }
      return;
    }

    // Default action: Start interactive Antigravity-style AI assistant session
    await startInteractiveSession();
  });

program
  .command('ask <prompt...>')
  .description('Ask Glint a question or request a command with streaming response and token caching')
  .action(async (parts: string[]) => {
    const prompt = parts.join(' ');
    console.log(`\n${theme.cyanBold('╭─ ⚡ Glint')} ${theme.slate(`[${storage.getConfig().activeProvider}:${storage.getActiveModel()}]`)}`);
    
    let fullText = '';
    let atLineStart = true;
    const onToken = (chunk: string) => {
      fullText += chunk;
      let formatted = '';
      for (let i = 0; i < chunk.length; i++) {
        const char = chunk[i];
        if (atLineStart) {
          formatted += theme.slate('│  ');
          atLineStart = false;
        }
        formatted += char;
        if (char === '\n') {
          atLineStart = true;
        }
      }
      process.stdout.write(formatted);
    };

    try {
      const meta = await ai.streamChat([{ role: 'user', content: prompt }], onToken);
      if (!atLineStart) {
        process.stdout.write('\n');
      }
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
      console.log();
    } catch (err: any) {
      if (!atLineStart) {
        process.stdout.write('\n');
      }
      console.log(`${theme.slate('│  ')}${theme.coral(`Error: ${err.message}`)}`);
      console.log(`${theme.slate('╰─')}\n`);
    }
  });

program
  .command('cache [action]')
  .description('Manage prompt cache and token savings (stats, clear, prune)')
  .action((action?: string) => {
    const sub = (action || 'stats').toLowerCase();
    if (sub === 'clear') {
      cache.clear();
      console.log(`\n${theme.green('✔ Glint query cache and telemetry cleared.')}\n`);
      return;
    }
    if (sub === 'prune') {
      const removed = cache.prune();
      console.log(`\n${theme.green(`✔ Pruned ${removed} expired entries from cache.`)}\n`);
      return;
    }

    const stats = cache.getStats();
    const total = stats.hits + stats.misses;
    const hitRate = total > 0 ? ((stats.hits / total) * 100).toFixed(1) : '0';

    console.log(`\n${theme.cyanBold('💾 Glint Token Reduction & Cache Report:')}`);
    console.log(`  • Cache Size:         ${theme.white(`${stats.totalEntries} entries`)}`);
    console.log(`  • Cache Hits:         ${theme.greenBold(`${stats.hits}`)}`);
    console.log(`  • Cache Misses:       ${theme.slate(`${stats.misses}`)}`);
    console.log(`  • Hit Rate:           ${theme.amberBold(`${hitRate}%`)}`);
    console.log(`  • Tokens Saved:       ${theme.cyanBold(`${stats.tokensSaved.toLocaleString()} tokens`)}`);
    console.log(`  • Estimated USD Saved:${theme.greenBold(`$${stats.estimatedCostSavedUSD.toFixed(4)}`)}\n`);
  });

program
  .command('provider [name]')
  .description('View or switch active AI provider (anthropic, openai, gemini, groq, deepseek, openrouter, ollama)')
  .action((name?: string) => {
    const config = storage.getConfig();
    if (!name) {
      console.log(`\n${theme.slate('Active provider:')} ${theme.amberBold(config.activeProvider.toUpperCase())}`);
      console.log(`${theme.slate('Available providers:')} anthropic, openai, gemini, groq, deepseek, openrouter, ollama\n`);
      return;
    }
    const target = name.toLowerCase() as AIProvider;
    const valid: AIProvider[] = ['anthropic', 'openai', 'gemini', 'groq', 'deepseek', 'openrouter', 'ollama'];
    if (!valid.includes(target)) {
      console.log(`\n${theme.coral(`Invalid provider "${name}". Valid options: ${valid.join(', ')}`)}\n`);
      return;
    }
    storage.saveConfig({ activeProvider: target });
    console.log(`\n${theme.green(`✔ Active provider set to ${target.toUpperCase()}`)}\n`);
  });

program
  .command('model [providerOrModel] [modelId]')
  .description('View or set LLM model (e.g. glint model gemini-3.5-flash-lite or glint model groq llama-3.1-8b-instant)')
  .action(async (providerOrModel?: string, modelId?: string) => {
    await manageModel(providerOrModel, modelId);
  });

program
  .command('search [query]')
  .description('Interactive fuzzy search across the offline cheatsheet vault')
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
  .command('keys [provider] [key]')
  .description('Directly view or set BYOK API key (e.g. glint keys groq gsk_...)')
  .action(async (provider, key) => {
    await manageKeys(provider, key);
  });

program
  .command('config')
  .description('Manage BYOK AI providers and token caching')
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
