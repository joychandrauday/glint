import { theme } from '../ui/theme.js';
import { runInteractiveSearch } from '../commands/search.js';
import { runTerminalDoctor } from '../commands/fix.js';
import { runToolsMenu } from '../commands/tools.js';
import { manageVault } from '../commands/vault.js';
import { manageConfig } from '../commands/config.js';
import { storage, AIProvider, AIMode, CliConfig } from '../services/storage.js';
import { cache } from '../services/cache.js';
import { contextManager } from '../services/contextManager.js';
import { copyToClipboard } from '../services/clipboard.js';

let lastAssistantSnippet = '';

export function setLastAssistantSnippet(snippet: string): void {
  lastAssistantSnippet = snippet;
}

export async function handleSlashCommand(input: string): Promise<boolean> {
  const parts = input.trim().split(/\s+/);
  const cmd = parts[0].toLowerCase();
  const args = parts.slice(1).join(' ').trim();

  switch (cmd) {
    case '/help':
      console.log(`\n${theme.cyanBold('⚡ Glint AI Assistant Slash Commands:')}`);
      console.log(`  ${theme.cyanBold('/provider [name]')}      - View or switch AI provider (anthropic, openai, gemini, groq, deepseek, openrouter, ollama)`);
      console.log(`  ${theme.cyanBold('/model [name]')}         - View or set active LLM model`);
      console.log(`  ${theme.cyanBold('/mode [agent|chat|copilot]')} - Switch interaction mode`);
      console.log(`  ${theme.cyanBold('/cache [stats|clear|prune]')} - View token cache stats, hit rate, or purge`);
      console.log(`  ${theme.cyanBold('/tokens')}               - View session token expenditure & savings`);
      console.log(`  ${theme.cyanBold('/compact')}              - Compact conversation memory into dense context to save tokens`);
      console.log(`  ${theme.cyanBold('/copy')}                 - Copy last code snippet or command to system clipboard`);
      console.log(`  ${theme.cyanBold('/search [query]')}       - Search 500+ offline cheatsheets (<2ms deterministic lookup)`);
      console.log(`  ${theme.cyanBold('/fix [error]')}          - Terminal Error Doctor diagnostic`);
      console.log(`  ${theme.cyanBold('/tools')}                - Developer micro-tools (Cron, Regex, Port, JWT)`);
      console.log(`  ${theme.cyanBold('/vault')}                - View and edit custom cheatsheet snippets`);
      console.log(`  ${theme.cyanBold('/config')}               - Open interactive BYOK settings & keys`);
      console.log(`  ${theme.cyanBold('/clear')}                - Clear screen and reset conversation history`);
      console.log(`  ${theme.cyanBold('/exit')}                 - Exit Glint session (or Ctrl+D)\n`);
      return true;

    case '/provider': {
      const config = storage.getConfig();
      if (!args) {
        console.log(`\n${theme.slate('Current active provider:')} ${theme.amberBold(config.activeProvider.toUpperCase())}`);
        console.log(`${theme.slate('Available providers:')} anthropic, openai, gemini, groq, deepseek, openrouter, ollama`);
        console.log(`${theme.slate('Usage: /provider <name>')}\n`);
        return true;
      }
      const target = args.toLowerCase() as AIProvider;
      const valid: AIProvider[] = ['anthropic', 'openai', 'gemini', 'groq', 'deepseek', 'openrouter', 'ollama'];
      if (!valid.includes(target)) {
        console.log(`\n${theme.coral(`Invalid provider "${args}". Valid options: ${valid.join(', ')}`)}\n`);
        return true;
      }
      storage.saveConfig({ activeProvider: target });
      console.log(`\n${theme.green(`✔ Active provider switched to ${target.toUpperCase()}`)}\n`);
      return true;
    }

    case '/model': {
      const config = storage.getConfig();
      const currentModel = storage.getActiveModel();
      if (!args) {
        console.log(`\n${theme.slate('Active provider:')} ${theme.amber(config.activeProvider)}`);
        console.log(`${theme.slate('Active model:')}    ${theme.cyanBold(currentModel)}`);
        console.log(`${theme.slate('Usage: /model <model-name>')}\n`);
        return true;
      }
      const prop = `${config.activeProvider}Model` as keyof CliConfig;
      storage.saveConfig({ [prop]: args });
      console.log(`\n${theme.green(`✔ Model for ${config.activeProvider} updated to ${args}`)}\n`);
      return true;
    }

    case '/mode': {
      const config = storage.getConfig();
      if (!args) {
        console.log(`\n${theme.slate('Current mode:')} ${theme.cyanBold(config.mode.toUpperCase())}`);
        console.log(`${theme.slate('Modes: agent (tools & runs), chat (conversational), copilot (1-line commands)')}`);
        console.log(`${theme.slate('Usage: /mode <agent|chat|copilot>')}\n`);
        return true;
      }
      const target = args.toLowerCase() as AIMode;
      if (!['agent', 'chat', 'copilot'].includes(target)) {
        console.log(`\n${theme.coral(`Invalid mode "${args}". Use agent, chat, or copilot.`)}\n`);
        return true;
      }
      storage.saveConfig({ mode: target });
      console.log(`\n${theme.green(`✔ Mode switched to ${target.toUpperCase()}`)}\n`);
      return true;
    }

    case '/cache': {
      const sub = args.toLowerCase();
      if (sub === 'clear') {
        cache.clear();
        console.log(`\n${theme.green('✔ Cache cleared successfully.')}\n`);
        return true;
      }
      if (sub === 'prune') {
        const pruned = cache.prune();
        console.log(`\n${theme.green(`✔ Pruned ${pruned} expired cache entries.`)}\n`);
        return true;
      }
      const stats = cache.getStats();
      const totalReq = stats.hits + stats.misses;
      const hitRate = totalReq > 0 ? ((stats.hits / totalReq) * 100).toFixed(1) : '0';

      console.log(`\n${theme.cyanBold('💾 Glint Prompt & Token Cache Status:')}`);
      console.log(`  • Cache Entries:      ${theme.white(`${stats.totalEntries}`)}`);
      console.log(`  • Cache Hits:         ${theme.greenBold(`${stats.hits}`)} (${hitRate}% hit rate)`);
      console.log(`  • Cache Misses:       ${theme.slate(`${stats.misses}`)}`);
      console.log(`  • Tokens Saved:       ${theme.cyanBold(`${stats.tokensSaved.toLocaleString()} tokens`)}`);
      console.log(`  • Estimated USD Saved:${theme.greenBold(`$${stats.estimatedCostSavedUSD.toFixed(4)}`)}`);
      console.log(`  • Actions:            ${theme.slate('/cache clear  •  /cache prune')}\n`);
      return true;
    }

    case '/tokens': {
      const totalSession = contextManager.getSessionTokens();
      const currentContext = contextManager.getTotalTokens();
      const config = storage.getConfig();
      console.log(`\n${theme.cyanBold('📊 Session Token Telemetry:')}`);
      console.log(`  • Active Context Window: ${theme.amber(`${currentContext}`)} / ${config.maxContextTokens} tokens`);
      console.log(`  • Total Session Usage:   ${theme.white(`${totalSession.toLocaleString()} tokens`)}`);
      console.log(`  • Provider:              ${theme.cyan(config.activeProvider)} (${storage.getActiveModel()})`);
      console.log(`  • Cache Savings:         ${theme.green(`${cache.getStats().tokensSaved.toLocaleString()} tokens saved`)}\n`);
      return true;
    }

    case '/compact': {
      const compacted = await contextManager.compact();
      if (compacted) {
        console.log(`\n${theme.green('✔ Conversation history compacted successfully into high-density summary!')}`);
        console.log(`${theme.slate(`Current context size: ${contextManager.getTotalTokens()} tokens.`)}\n`);
      } else {
        console.log(`\n${theme.slate('Context is already compact (less than 4 turns or below token threshold).')}\n`);
      }
      return true;
    }

    case '/copy': {
      if (!lastAssistantSnippet) {
        console.log(`\n${theme.slate('No recent code snippet or command to copy.')}\n`);
        return true;
      }
      await copyToClipboard(lastAssistantSnippet);
      console.log(`\n${theme.green('✔ Copied last snippet to clipboard:')}`);
      console.log(`${theme.slate(lastAssistantSnippet.slice(0, 150))}\n`);
      return true;
    }

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
      contextManager.clear();
      return true;

    case '/exit':
    case '/quit':
      process.exit(0);

    default:
      console.log(`\n${theme.coral(`Unknown slash command: ${cmd}`)}. Type ${theme.cyanBold('/help')} for options.\n`);
      return true;
  }
}
