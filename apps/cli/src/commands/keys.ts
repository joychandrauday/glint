import { storage, AIProvider, CliConfig } from '../services/storage.js';
import { theme } from '../ui/theme.js';
import { select, text, confirm } from '@clack/prompts';

const VALID_PROVIDERS: AIProvider[] = ['groq', 'openai', 'anthropic', 'gemini', 'deepseek', 'openrouter', 'ollama'];

export function maskKey(key?: string): string {
  if (!key) return '';
  if (key.length <= 8) return '••••••••';
  const prefix = key.slice(0, 4);
  const suffix = key.slice(-4);
  return `${prefix}${'•'.repeat(8)}${suffix}`;
}

export async function manageKeys(targetProvider?: string, directKey?: string): Promise<void> {
  const config = storage.getConfig();

  // Mode 1: Direct key passed inline e.g. "/keys groq gsk_..." or "glint keys openai sk-..."
  if (targetProvider && directKey) {
    const prov = targetProvider.toLowerCase() as AIProvider;
    if (!VALID_PROVIDERS.includes(prov)) {
      console.log(`\n${theme.coral(`Invalid provider "${targetProvider}".`)}`);
      console.log(`${theme.slate(`Valid providers: ${VALID_PROVIDERS.join(', ')}`)}\n`);
      return;
    }

    if (prov === 'ollama') {
      storage.saveConfig({ ollamaHost: directKey });
      console.log(`\n${theme.green(`✔ Ollama host endpoint updated to: ${directKey}`)}\n`);
      return;
    }

    const prop = `${prov}Key` as keyof CliConfig;
    storage.saveConfig({ [prop]: directKey.trim() });
    console.log(`\n${theme.green(`✔ Successfully saved API key for ${prov.toUpperCase()} (${maskKey(directKey.trim())})`)}`);
    console.log(`${theme.slate('Stored securely in ~/.config/glint/config.json')}`);

    // If this provider isn't active, offer or prompt to switch
    if (config.activeProvider !== prov) {
      if (process.stdout.isTTY) {
        const switchNow = await confirm({
          message: `Set ${prov.toUpperCase()} as your active AI provider now?`,
          initialValue: true,
        });
        if (typeof switchNow === 'boolean' && switchNow) {
          storage.saveConfig({ activeProvider: prov });
          console.log(`\n${theme.cyanBold(`✔ Active provider switched to ${prov.toUpperCase()} [${storage.getActiveModel()}]`)}\n`);
        } else {
          console.log(`${theme.slate(`Tip: Switch anytime using /provider ${prov}`)}\n`);
        }
      } else {
        console.log(`${theme.slate(`Tip: Switch anytime using /provider ${prov}`)}\n`);
      }
    } else {
      console.log();
    }
    return;
  }

  // Mode 2: Provider passed without key e.g. "/keys groq"
  if (targetProvider && !directKey) {
    const prov = targetProvider.toLowerCase() as AIProvider;
    if (!VALID_PROVIDERS.includes(prov)) {
      console.log(`\n${theme.coral(`Invalid provider "${targetProvider}".`)}`);
      console.log(`${theme.slate(`Valid providers: ${VALID_PROVIDERS.join(', ')}`)}\n`);
      return;
    }

    if (prov === 'ollama') {
      const host = await text({
        message: 'Enter Ollama server host endpoint:',
        initialValue: config.ollamaHost || 'http://localhost:11434',
      });
      if (typeof host === 'string' && host.trim()) {
        storage.saveConfig({ ollamaHost: host.trim() });
        console.log(`\n${theme.green(`✔ Ollama host updated to: ${host.trim()}`)}\n`);
      }
      return;
    }

    const currentKey = config[`${prov}Key` as keyof CliConfig] as string | undefined;
    const inputKey = await text({
      message: `Enter API key for ${prov.toUpperCase()}${currentKey ? ` [current: ${maskKey(currentKey)}]` : ''}:`,
    });

    if (typeof inputKey === 'string' && inputKey.trim()) {
      const prop = `${prov}Key` as keyof CliConfig;
      storage.saveConfig({ [prop]: inputKey.trim() });
      console.log(`\n${theme.green(`✔ Successfully saved API key for ${prov.toUpperCase()} (${maskKey(inputKey.trim())})`)}`);
      console.log(`${theme.slate('Stored securely in ~/.config/glint/config.json')}`);

      if (config.activeProvider !== prov) {
        const switchNow = await confirm({
          message: `Set ${prov.toUpperCase()} as your active AI provider now?`,
          initialValue: true,
        });
        if (typeof switchNow === 'boolean' && switchNow) {
          storage.saveConfig({ activeProvider: prov });
          console.log(`\n${theme.cyanBold(`✔ Active provider switched to ${prov.toUpperCase()}`)}\n`);
        }
      }
      console.log();
    }
    return;
  }

  // Mode 3: No arguments e.g. "/keys" or "glint keys" -> Show status dashboard and interactive prompt
  console.log(`\n${theme.cyanBold('🔑 Glint BYOK (Bring Your Own Key) Provider Status:')}`);
  console.log(`${theme.slate('Keys are stored locally in ~/.config/glint/config.json with zero telemetry.')}\n`);

  for (const p of VALID_PROVIDERS) {
    const src = storage.getKeySource(p);
    const keyProp = `${p}Key` as keyof CliConfig;
    const rawVal = config[keyProp] as string | undefined;
    const isCurrent = p === config.activeProvider;
    const activeBadge = isCurrent ? theme.amberBold(' [ACTIVE]') : '';

    let statusText = '';
    if (p === 'ollama') {
      statusText = theme.cyan(`local (${config.ollamaHost})`);
    } else if (src === 'config' && rawVal) {
      statusText = `${theme.green('configured')} ${theme.slate(`(${maskKey(rawVal)})`)}`;
    } else if (src === 'env') {
      statusText = theme.cyan(`auto-detected from ${p.toUpperCase()}_API_KEY`);
    } else {
      statusText = theme.coral('not configured');
    }

    const marker = isCurrent ? theme.amber('  ➔ ') : '    ';
    console.log(`${marker}${p.toUpperCase().padEnd(12)}: ${statusText}${activeBadge}`);
  }

  console.log(`\n  ${theme.slate('Direct usage:')} ${theme.cyanBold('/keys <provider> <key>')}`);
  console.log(`  ${theme.slate('Example:')}      ${theme.white('/keys groq gsk_1234567890abcdef')}\n`);

  if (!process.stdout.isTTY) {
    return;
  }

  const selection = await select({
    message: theme.cyanBold('Select provider key to configure:'),
    options: [
      { value: 'groq', label: 'Groq (llama-3.3-70b-versatile - ultra fast)' },
      { value: 'openai', label: 'OpenAI (gpt-4o-mini / gpt-4o)' },
      { value: 'anthropic', label: 'Anthropic Claude (prompt caching enabled)' },
      { value: 'gemini', label: 'Google Gemini (gemini-2.0-flash)' },
      { value: 'deepseek', label: 'DeepSeek (deepseek-chat / reasoner)' },
      { value: 'openrouter', label: 'OpenRouter (unified model router)' },
      { value: 'ollama', label: 'Ollama (Local offline host)' },
      { value: 'cancel', label: '✖ Cancel / Back' },
    ],
  });

  if (typeof selection !== 'string' || selection === 'cancel') {
    return;
  }

  const selectedProv = selection as AIProvider;
  await manageKeys(selectedProv);
}
