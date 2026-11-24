import { theme } from '../ui/theme.js';
import { runInteractiveSearch } from '../commands/search.js';
import { runTerminalDoctor } from '../commands/fix.js';
import { runToolsMenu } from '../commands/tools.js';
import { manageVault } from '../commands/vault.js';
import { manageConfig } from '../commands/config.js';
import { manageKeys } from '../commands/keys.js';
import { storage, AIProvider, AIMode, CliConfig } from '../services/storage.js';
import { cache } from '../services/cache.js';
import { contextManager } from '../services/contextManager.js';
import { copyToClipboard } from '../services/clipboard.js';

let lastAssistantSnippet = '';

export function setLastAssistantSnippet(snippet: string): void {
  lastAssistantSnippet = snippet;
}

export interface SlashCommandDef {
  command: string;
  args?: string;
  description: string;
  category: 'ai' | 'cache' | 'tools' | 'session';
}

export const SLASH_COMMANDS: SlashCommandDef[] = [
  // AI & Provider
  { command: '/keys', args: '[provider] [key]', description: 'Directly view or set BYOK API key (groq, openai, anthropic, etc.)', category: 'ai' },
  { command: '/key', args: '[provider] [key]', description: 'Alias for /keys', category: 'ai' },
  { command: '/provider', args: '[name]', description: 'View or switch AI provider (anthropic, openai, gemini, groq, etc.)', category: 'ai' },
  { command: '/model', args: '[name]', description: 'View or set active LLM model', category: 'ai' },
  { command: '/mode', args: '[agent|chat|copilot]', description: 'Switch interaction mode', category: 'ai' },
  { command: '/config', description: 'Open interactive BYOK settings & preferences', category: 'ai' },

  // Cache & Optimization
  { command: '/cache', args: '[stats|clear|prune]', description: 'View token cache stats, hit rate, or purge', category: 'cache' },
  { command: '/tokens', description: 'View session token expenditure & USD savings', category: 'cache' },
  { command: '/compact', description: 'Compact conversation memory into dense context', category: 'cache' },

  // Tools & Productivity
  { command: '/search', args: '[query]', description: 'Search 500+ offline cheatsheets (<2ms deterministic lookup)', category: 'tools' },
  { command: '/fix', args: '[error]', description: 'Terminal Error Doctor diagnostic', category: 'tools' },
  { command: '/tools', description: 'Developer micro-tools (Cron, Regex, Port, JWT)', category: 'tools' },
  { command: '/vault', description: 'View and edit custom cheatsheet snippets', category: 'tools' },
  { command: '/copy', description: 'Copy last AI code snippet or command to clipboard', category: 'tools' },

  // Session
  { command: '/clear', description: 'Clear screen and reset conversation history', category: 'session' },
  { command: '/help', description: 'Show all available slash commands', category: 'session' },
  { command: '/exit', description: 'Exit Glint session (or Ctrl+D)', category: 'session' },
];

export function printSlashCommandsHelp(): void {
  console.log(`\n${theme.cyanBold('╭──────────────────────────────────────────────────────────────────────────╮')}`);
  console.log(`${theme.cyanBold('│')}  ${theme.whiteBold('⚡ GLINT AI ASSISTANT SLASH COMMANDS')}                                     ${theme.cyanBold('│')}`);
  console.log(`${theme.cyanBold('╰──────────────────────────────────────────────────────────────────────────╯')}`);

  console.log(`\n  ${theme.amberBold('⚡ AI & PROVIDER CONTROLS')}`);
  printCommandItem('/keys', '[provider] [key]', 'Directly view or set BYOK API key (groq, openai, etc.)');
  printCommandItem('/provider', '[name]', 'View or switch provider (groq, anthropic, openai, gemini, etc.)');
  printCommandItem('/model', '[name]', 'View or change active LLM model');
  printCommandItem('/mode', '[agent|chat|copilot]', 'Switch assistant behavior mode');
  printCommandItem('/config', '', 'Open interactive BYOK settings, API keys & preferences');

  console.log(`\n  ${theme.greenBold('💾 CACHE & TOKEN OPTIMIZATION')}`);
  printCommandItem('/cache', '[stats|clear|prune]', 'Inspect local prompt cache, hit rate, or purge');
  printCommandItem('/tokens', '', 'View active session token usage & calculated USD savings');
  printCommandItem('/compact', '', 'Summarize and compress context history to save tokens');

  console.log(`\n  ${theme.cyanBold('🛠 DEVELOPER TOOLS & WORKSPACE')}`);
  printCommandItem('/search', '[query]', 'Offline fast search for 500+ CLI commands (<2ms)');
  printCommandItem('/fix', '[error]', 'Terminal Doctor: Diagnose and fix terminal errors');
  printCommandItem('/tools', '', 'Developer micro-tools (Cron parser, Regex, Port checker)');
  printCommandItem('/vault', '', 'Manage local custom cheatsheet snippets');
  printCommandItem('/copy', '', 'Copy the most recent generated command or code to clipboard');

  console.log(`\n  ${theme.slate('⚙️ SESSION MANAGEMENT')}`);
  printCommandItem('/clear', '', 'Clear screen and reset active conversation context');
  printCommandItem('/help', '', 'Display this slash command directory');
  printCommandItem('/exit', '', 'Exit Glint session (or Ctrl+D)');
  console.log();
}

function printCommandItem(cmd: string, args: string, desc: string): void {
  const fullCmd = args ? `${cmd} ${theme.slate(args)}` : cmd;
  const padding = ' '.repeat(Math.max(2, 34 - (cmd.length + (args ? args.length + 1 : 0))));
  console.log(`    ${theme.cyanBold(cmd)}${args ? ' ' + theme.slate(args) : ''}${padding}${theme.white(desc)}`);
}

export async function handleSlashCommand(input: string): Promise<boolean> {
  const parts = input.trim().split(/\s+/);
  const rawCmd = parts[0].toLowerCase();
  const args = parts.slice(1).join(' ').trim();

  // If user typed "/" or "/?" or "/help" or empty slash command, show all commands immediately
  if (rawCmd === '/' || rawCmd === '/?' || rawCmd === '/help' || rawCmd === '') {
    printSlashCommandsHelp();
    return true;
  }

  // Support prefix matching if exact match not found (e.g. /prov -> /provider, /tok -> /tokens)
  let cmd = rawCmd;
  if (!SLASH_COMMANDS.some(c => c.command === cmd) && cmd !== '/quit') {
    const matches = SLASH_COMMANDS.filter(c => c.command.startsWith(cmd));
    if (matches.length === 1) {
      cmd = matches[0].command;
    }
  }

  switch (cmd) {
    case '/help':
      printSlashCommandsHelp();
      return true;

    case '/keys':
    case '/key': {
      const subParts = args.split(/\s+/).filter(Boolean);
      const prov = subParts[0];
      const directKey = subParts.slice(1).join(' ').trim();
      await manageKeys(prov, directKey);
      return true;
    }

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
      console.log(`\n${theme.coral(`Unknown slash command: "${rawCmd}".`)}`);
      printSlashCommandsHelp();
      return true;
  }
}
