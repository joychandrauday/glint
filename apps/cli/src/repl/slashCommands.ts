import { theme } from '../ui/theme.js';
import { runInteractiveSearch } from '../commands/search.js';
import { runTerminalDoctor } from '../commands/fix.js';
import { runToolsMenu } from '../commands/tools.js';
import { manageVault } from '../commands/vault.js';
import { manageConfig } from '../commands/config.js';
import { manageKeys } from '../commands/keys.js';
import { manageModel } from '../commands/model.js';
import { storage, AIProvider, AIMode, CliConfig } from '../services/storage.js';
import { cache } from '../services/cache.js';
import { contextManager } from '../services/contextManager.js';
import { copyToClipboard } from '../services/clipboard.js';
import { ai } from '../services/ai.js';
import { renderTokenPill, StreamingMarkdownRenderer } from '../ui/markdown.js';
import stripAnsi from 'strip-ansi';

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
  // A
  { command: '/ask', args: '[prompt]', description: 'Ask Glint AI directly with streaming response', category: 'ai' },
  { command: '/agent', description: 'Switch to autonomous Agent mode (AI executes shell tasks)', category: 'ai' },
  { command: '/api', args: '[provider] [key]', description: 'View or set BYOK API key (alias for /keys)', category: 'ai' },
  { command: '/about', description: 'Display Glint system information, version and telemetry', category: 'session' },

  // B
  { command: '/byok', args: '[provider] [key]', description: 'Configure Bring-Your-Own-Key provider & credentials', category: 'ai' },

  // C
  { command: '/config', description: 'Open interactive BYOK settings, API keys & preferences', category: 'ai' },
  { command: '/cache', args: '[stats|clear|prune]', description: 'View token cache stats, hit rate, or purge', category: 'cache' },
  { command: '/compact', description: 'Compact conversation memory into dense context to save tokens', category: 'cache' },
  { command: '/copy', description: 'Copy last AI code snippet or command to clipboard', category: 'tools' },
  { command: '/clear', description: 'Clear screen and reset conversation history', category: 'session' },

  // D
  { command: '/doctor', args: '[error]', description: 'Terminal Doctor diagnostic (alias for /fix)', category: 'tools' },

  // E
  { command: '/exit', description: 'Exit Glint session (or Ctrl+D)', category: 'session' },

  // F
  { command: '/fix', args: '[error]', description: 'Terminal Error Doctor: Diagnose and fix errors', category: 'tools' },

  // H
  { command: '/help', description: 'Show all available slash commands', category: 'session' },
  { command: '/history', description: 'View current session conversation turn history', category: 'session' },

  // K
  { command: '/keys', args: '[provider] [key]', description: 'Directly view or set BYOK API key (groq, openai, etc.)', category: 'ai' },
  { command: '/key', args: '[provider] [key]', description: 'Alias for /keys', category: 'ai' },

  // M
  { command: '/model', args: '[name]', description: 'View or set active LLM model (or custom model ID)', category: 'ai' },
  { command: '/mode', args: '[agent|chat|copilot]', description: 'Switch assistant behavior mode', category: 'ai' },

  // P
  { command: '/provider', args: '[name]', description: 'View or switch AI provider (gemini, groq, openai, etc.)', category: 'ai' },
  { command: '/prune', description: 'Prune expired cache entries and reclaim storage', category: 'cache' },

  // Q
  { command: '/quit', description: 'Exit Glint session (alias for /exit)', category: 'session' },

  // R
  { command: '/reset', description: 'Reset conversation context and start fresh', category: 'session' },

  // S
  { command: '/search', args: '[query]', description: 'Search 500+ offline cheatsheets (<2ms lookup)', category: 'tools' },
  { command: '/stats', description: 'View session token telemetry & USD savings (alias for /tokens)', category: 'cache' },

  // T
  { command: '/tokens', description: 'View session token expenditure & USD savings', category: 'cache' },
  { command: '/tools', description: 'Developer micro-tools (Cron, Regex, Port, JWT)', category: 'tools' },

  // V
  { command: '/vault', description: 'View and edit custom cheatsheet snippets', category: 'tools' },
];

export function printSlashCommandsHelp(): void {
  console.log(`\n${theme.cyanBold('╭──────────────────────────────────────────────────────────────────────────╮')}`);
  console.log(`${theme.cyanBold('│')}  ${theme.whiteBold('⚡ GLINT AI ASSISTANT SLASH COMMANDS')}                                     ${theme.cyanBold('│')}`);
  console.log(`${theme.cyanBold('╰──────────────────────────────────────────────────────────────────────────╯')}`);

  console.log(`\n  ${theme.amberBold('⚡ AI & PROVIDER CONTROLS')}`);
  printCommandItem('/keys', '[provider] [key]', 'Directly view or set BYOK API key (groq, openai, etc.)');
  printCommandItem('/provider', '[name]', 'View or switch provider (gemini, groq, openai, etc.)');
  printCommandItem('/model', '[name]', 'View or change active LLM model');
  printCommandItem('/mode', '[agent|chat|copilot]', 'Switch assistant behavior mode');
  printCommandItem('/ask', '[prompt]', 'Ask Glint AI directly with streaming response');
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
  printCommandItem('/reset', '', 'Reset conversation context and start fresh');
  printCommandItem('/history', '', 'View conversation turns in current session');
  printCommandItem('/about', '', 'Display Glint CLI system details & telemetry');
  printCommandItem('/help', '', 'Display this slash command directory');
  printCommandItem('/exit', '', 'Exit Glint session (or Ctrl+D)');
  console.log();
}

function printCommandItem(cmd: string, args: string, desc: string): void {
  const fullCmd = args ? `${cmd} ${theme.slate(args)}` : cmd;
  const padding = ' '.repeat(Math.max(2, 34 - (cmd.length + (args ? args.length + 1 : 0))));
  console.log(`    ${theme.cyanBold(cmd)}${args ? ' ' + theme.slate(args) : ''}${padding}${theme.white(desc)}`);
}

export function printCommandSuggestions(prefix: string, matches: SlashCommandDef[]): void {
  const title = `🔍 Commands matching "${prefix}" (${matches.length} found)`;
  const titleLen = stripAnsi(title).length;
  const pad = Math.max(0, 70 - titleLen);
  console.log(`\n${theme.cyanBold('╭──────────────────────────────────────────────────────────────────────────╮')}`);
  console.log(`${theme.cyanBold('│')}  ${theme.whiteBold(title)}${' '.repeat(pad)}${theme.cyanBold('│')}`);
  console.log(`${theme.cyanBold('╰──────────────────────────────────────────────────────────────────────────╯')}\n`);

  for (const m of matches) {
    printCommandItem(m.command, m.args || '', m.description);
  }
  console.log(`\n  ${theme.slate('💡 Tip: Type command name or press <Tab> to autocomplete.')}\n`);
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

  // Shorthand: /a <prompt> -> alias for /ask <prompt>
  let cmd = rawCmd;
  if (cmd === '/a' && args) {
    cmd = '/ask';
  }

  // If user typed an incomplete prefix without arguments (e.g. /a, /k, /m, /c, /t, etc.)
  // OR the command is not an exact match:
  const isExact = SLASH_COMMANDS.some((c) => c.command === cmd);
  if (!isExact || (cmd === '/a' && !args)) {
    const matches = SLASH_COMMANDS.filter((c) => c.command.startsWith(cmd));
    if (matches.length > 0) {
      printCommandSuggestions(cmd, matches);
      return true;
    } else {
      console.log(`\n${theme.coral(`No slash commands found starting with "${rawCmd}".`)}`);
      printSlashCommandsHelp();
      return true;
    }
  }

  switch (cmd) {
    case '/help':
      printSlashCommandsHelp();
      return true;

    case '/ask': {
      if (!args) {
        console.log(`\n${theme.slate('Usage: /ask <question or terminal prompt>')}\n`);
        return true;
      }
      console.log(`\n${theme.cyanBold('╭─ ⚡ Glint')} ${theme.slate(`[${storage.getConfig().activeProvider}:${storage.getActiveModel()}]`)}`);
      const renderer = new StreamingMarkdownRenderer(theme.slate('│  '));
      let fullText = '';
      try {
        const meta = await ai.streamChat([{ role: 'user', content: args }], (chunk) => {
          fullText += chunk;
          renderer.push(chunk);
        });
        renderer.flush();
        contextManager.addMessage({ role: 'user', content: args });
        contextManager.addMessage({ role: 'assistant', content: fullText });
        contextManager.recordUsage(meta.totalTokens);
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
        renderer.flush();
        console.log(`${theme.slate('│  ')}${theme.coral(`Error: ${err.message}`)}`);
        console.log(`${theme.slate('╰─')}\n`);
      }
      return true;
    }

    case '/agent': {
      storage.saveConfig({ mode: 'agent' });
      console.log(`\n${theme.green('✔ Mode switched to AGENT (AI executes terminal commands & tools)')}\n`);
      return true;
    }

    case '/api':
    case '/byok':
    case '/keys':
    case '/key': {
      const subParts = args.split(/\s+/).filter(Boolean);
      const prov = subParts[0];
      const directKey = subParts.slice(1).join(' ').trim();
      await manageKeys(prov, directKey);
      return true;
    }

    case '/about': {
      const config = storage.getConfig();
      const stats = cache.getStats();
      console.log(`\n${theme.cyanBold('╭──────────────────────────────────────────────────────────────────────────╮')}`);
      console.log(`${theme.cyanBold('│')}  ${theme.whiteBold('⚡ GLINT CLI - Developer Lightweight AI Assistant')}                      ${theme.cyanBold('│')}`);
      console.log(`${theme.cyanBold('╰──────────────────────────────────────────────────────────────────────────╯')}`);
      console.log(`  • Version:         ${theme.cyan('0.2.23')}`);
      console.log(`  • Active BYOK:     ${theme.amberBold(config.activeProvider.toUpperCase())} [${storage.getActiveModel()}]`);
      console.log(`  • Interaction:     ${theme.white(config.mode.toUpperCase())}`);
      console.log(`  • Query Cache:     ${theme.green(`${stats.totalEntries} entries`)} (${stats.tokensSaved.toLocaleString()} tokens saved)`);
      console.log(`  • Offline Cheats:  500+ instant command snippets`);
      console.log(`  • Documentation:   ${theme.cyan('https://glint.g2gdigital.com')}\n`);
      return true;
    }

    case '/history': {
      const msgs = contextManager.getMessages();
      console.log(`\n${theme.cyanBold(`📜 Conversation History (${msgs.length} messages):`)}`);
      if (msgs.length === 0) {
        console.log(`  ${theme.slate('(No conversation history yet. Send a prompt to begin.)')}\n`);
        return true;
      }
      for (const m of msgs) {
        const badge = m.role === 'user' ? theme.cyanBold('YOU') : theme.amberBold('GLINT');
        const preview = m.content.split('\n')[0].slice(0, 80);
        console.log(`  ${theme.slate('•')} [${badge}]: ${theme.white(preview)}`);
      }
      console.log();
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
      await manageModel(args);
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

    case '/prune': {
      const pruned = cache.prune();
      console.log(`\n${theme.green(`✔ Pruned ${pruned} expired cache entries.`)}\n`);
      return true;
    }

    case '/stats':
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

    case '/doctor':
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
    case '/reset':
      console.clear();
      contextManager.clear();
      console.log(`\n${theme.green('✔ Conversation context reset. Ready for a new topic!')}\n`);
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
