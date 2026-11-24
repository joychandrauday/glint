import { storage, CliConfig } from '../services/storage.js';
import { theme } from '../ui/theme.js';
import { select, text } from '@clack/prompts';

export async function manageConfig(): Promise<void> {
  const current = storage.getConfig();

  console.log(`\n${theme.cyanBold('Current Configuration:')}`);
  console.log(`  • Active Provider: ${theme.amber(current.activeProvider)}`);
  console.log(`  • Groq API Key:    ${current.groqKey ? theme.green('configured') : theme.slate('none')}`);
  console.log(`  • Gemini API Key:  ${current.geminiKey ? theme.green('configured') : theme.slate('none')}`);
  console.log(`  • Ollama Host:     ${theme.white(current.ollamaHost)}`);
  console.log();

  const field = await select({
    message: theme.cyanBold('Select setting to configure:'),
    options: [
      { value: 'provider', label: '🔄 Switch Active Provider' },
      { value: 'groqKey', label: '🔑 Set Groq API Key' },
      { value: 'geminiKey', label: '🔑 Set Gemini API Key' },
      { value: 'ollamaHost', label: '🌐 Set Ollama Host' },
      { value: 'done', label: '✔ Done' },
    ],
  });

  if (field === 'provider') {
    const prov = await select({
      message: 'Choose active provider:',
      options: [
        { value: 'groq', label: 'Groq (qwen/qwen3.8-27b - ultra fast)' },
        { value: 'gemini', label: 'Google Gemini (gemini-flash-lite)' },
        { value: 'ollama', label: 'Ollama (Local offline model)' },
        { value: 'openai', label: 'OpenAI (gpt-4o-mini)' },
      ],
    });
    if (typeof prov !== 'symbol') {
      storage.saveConfig({ activeProvider: prov as CliConfig['activeProvider'] });
      console.log(`\n${theme.green(`✔ Active provider set to ${prov}`)}\n`);
    }
  } else if (field === 'groqKey' || field === 'geminiKey') {
    const key = await text({ message: `Enter ${field}:` });
    if (typeof key !== 'symbol' && key.trim()) {
      storage.saveConfig({ [field]: key.trim() });
      console.log(`\n${theme.green(`✔ Saved ${field}`)}\n`);
    }
  } else if (field === 'ollamaHost') {
    const host = await text({ message: 'Enter Ollama host url:', initialValue: current.ollamaHost });
    if (typeof host !== 'symbol' && host.trim()) {
      storage.saveConfig({ ollamaHost: host.trim() });
      console.log(`\n${theme.green('✔ Saved Ollama host')}\n`);
    }
  }
}
