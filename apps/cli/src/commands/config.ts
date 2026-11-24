import { storage, AIProvider, AIMode, CliConfig } from '../services/storage.js';
import { cache } from '../services/cache.js';
import { manageModel } from './model.js';
import { theme } from '../ui/theme.js';
import { select, text, confirm } from '@clack/prompts';

export async function manageConfig(): Promise<void> {
  const current = storage.getConfig();
  const activeModel = storage.getActiveModel();

  console.log(`\n${theme.cyanBold('⚡ Glint BYOK AI & Cache Configuration:')}`);
  console.log(`  • Active Provider:   ${theme.amberBold(current.activeProvider.toUpperCase())}`);
  console.log(`  • Active Model:      ${theme.white(activeModel)}`);
  console.log(`  • Assistant Mode:    ${theme.cyan(current.mode.toUpperCase())}`);
  console.log(`  • Local Cache:       ${current.cacheEnabled ? theme.green('ENABLED') : theme.coral('DISABLED')} (${current.cacheTTLHours}h TTL)`);
  console.log(`  • Max Context Window:${theme.white(`${current.maxContextTokens} tokens`)}`);
  console.log();
  console.log(theme.slate('  Provider Status (BYOK):'));

  const providers: AIProvider[] = ['anthropic', 'openai', 'gemini', 'groq', 'deepseek', 'openrouter', 'ollama'];
  for (const p of providers) {
    const src = storage.getKeySource(p);
    let status = theme.slate('not configured');
    if (src === 'config') status = theme.green('configured in config.json');
    if (src === 'env') status = theme.cyan(`auto-detected from ${p.toUpperCase()}_API_KEY`);
    if (p === 'ollama') status = theme.white(`local (${current.ollamaHost})`);
    
    const prefix = p === current.activeProvider ? theme.amber('  ➔ ') : '    ';
    console.log(`${prefix}${p.padEnd(12)}: ${status}`);
  }
  console.log();

  const choice = await select({
    message: theme.cyanBold('Select configuration action:'),
    options: [
      { value: 'provider', label: '🔄 Switch Active Provider' },
      { value: 'keys', label: '🔑 Set / Update Provider API Key' },
      { value: 'model', label: '🧠 Change Model for Active Provider' },
      { value: 'mode', label: '⚡ Change Assistant Mode (agent / chat / copilot)' },
      { value: 'cache', label: '💾 Cache & Token Optimization Settings' },
      { value: 'done', label: '✔ Done' },
    ],
  });

  if (choice === 'provider') {
    const prov = await select({
      message: 'Choose active AI provider:',
      options: [
        { value: 'anthropic', label: 'Anthropic Claude (claude-3-5-haiku / sonnet with prompt caching)' },
        { value: 'openai', label: 'OpenAI (gpt-4o-mini / gpt-4o)' },
        { value: 'gemini', label: 'Google Gemini (gemini-3.8-flash / gemini-2.5-pro)' },
        { value: 'groq', label: 'Groq (llama-3.3-70b-versatile - ultra-fast)' },
        { value: 'deepseek', label: 'DeepSeek (deepseek-chat / deepseek-reasoner)' },
        { value: 'openrouter', label: 'OpenRouter (unified routing)' },
        { value: 'ollama', label: 'Ollama (Local offline LLM)' },
      ],
    });
    if (typeof prov !== 'symbol') {
      storage.saveConfig({ activeProvider: prov as AIProvider });
      console.log(`\n${theme.green(`✔ Active provider switched to ${prov.toUpperCase()}`)}\n`);
    }
  } else if (choice === 'keys') {
    const target = await select({
      message: 'Select provider key to configure:',
      options: [
        { value: 'anthropicKey', label: 'Anthropic Claude Key' },
        { value: 'openaiKey', label: 'OpenAI Key' },
        { value: 'geminiKey', label: 'Google Gemini Key' },
        { value: 'groqKey', label: 'Groq Key' },
        { value: 'deepseekKey', label: 'DeepSeek Key' },
        { value: 'openrouterKey', label: 'OpenRouter Key' },
      ],
    });
    if (typeof target !== 'symbol') {
      const val = await text({ message: `Enter key for ${target}:` });
      if (typeof val !== 'symbol' && val.trim()) {
        storage.saveConfig({ [target]: val.trim() });
        console.log(`\n${theme.green(`✔ Saved ${target} successfully!`)}\n`);
      }
    }
  } else if (choice === 'model') {
    await manageModel();
  } else if (choice === 'mode') {
    const newMode = await select({
      message: 'Choose default assistant behavior mode:',
      options: [
        { value: 'agent', label: 'Agent Mode (Proposes and runs terminal commands, reads workspace)' },
        { value: 'chat', label: 'Chat Mode (Pure interactive dialogue, coding help, explanations)' },
        { value: 'copilot', label: 'Copilot Mode (Direct 1-line command synthesis cards)' },
      ],
    });
    if (typeof newMode !== 'symbol') {
      storage.saveConfig({ mode: newMode as AIMode });
      console.log(`\n${theme.green(`✔ Assistant mode set to ${newMode.toUpperCase()}`)}\n`);
    }
  } else if (choice === 'cache') {
    const stats = cache.getStats();
    console.log(`\n${theme.cyanBold('Cache Statistics & Token Savings:')}`);
    console.log(`  • Cached Entries:     ${theme.white(`${stats.totalEntries}`)}`);
    console.log(`  • Cache Hits:         ${theme.green(`${stats.hits}`)}`);
    console.log(`  • Cache Misses:       ${theme.slate(`${stats.misses}`)}`);
    console.log(`  • Total Tokens Saved: ${theme.cyanBold(`${stats.tokensSaved.toLocaleString()} tokens`)}`);
    console.log(`  • Estimated USD Saved:${theme.greenBold(`$${stats.estimatedCostSavedUSD.toFixed(4)}`)}\n`);

    const cacheAction = await select({
      message: 'Cache action:',
      options: [
        { value: 'toggle', label: current.cacheEnabled ? 'Disable Cache' : 'Enable Cache' },
        { value: 'prune', label: 'Prune Expired Entries' },
        { value: 'clear', label: 'Clear Entire Cache' },
        { value: 'back', label: 'Back' },
      ],
    });

    if (cacheAction === 'toggle') {
      storage.saveConfig({ cacheEnabled: !current.cacheEnabled });
      console.log(`\n${theme.green(`✔ Cache is now ${!current.cacheEnabled ? 'ENABLED' : 'DISABLED'}`)}\n`);
    } else if (cacheAction === 'prune') {
      const removed = cache.prune();
      console.log(`\n${theme.green(`✔ Pruned ${removed} expired cache entries.`)}\n`);
    } else if (cacheAction === 'clear') {
      const ok = await confirm({ message: 'Are you sure you want to clear all cached responses and stats?' });
      if (ok) {
        cache.clear();
        console.log(`\n${theme.green('✔ Cache cleared successfully.')}\n`);
      }
    }
  }
}
