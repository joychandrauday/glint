import { storage, AIProvider, CliConfig } from '../services/storage.js';
import { theme } from '../ui/theme.js';
import { select, text } from '@clack/prompts';

export interface ModelOption {
  id: string;
  name: string;
  description: string;
  tier: 'free-friendly' | 'balanced' | 'flagship' | 'reasoning';
}

export const PROVIDER_MODELS: Record<AIProvider, ModelOption[]> = {
  gemini: [
    { id: 'gemini-3.5-flash-lite', name: 'Gemini 3.5 Flash Lite', description: 'Recommended: Works on Free & Paid keys, ultra-fast, high limits', tier: 'free-friendly' },
    { id: 'gemini-3.8-flash', name: 'Gemini 3.8 Flash', description: 'Latest Flagship multimodal intelligence', tier: 'flagship' },
    { id: 'gemini-3.5-flash', name: 'Gemini 3.5 Flash', description: 'Balanced high-speed model', tier: 'balanced' },
    { id: 'gemini-flash-latest', name: 'Gemini Flash Latest', description: 'Dynamic rolling alias for latest flash model', tier: 'free-friendly' },
    { id: 'gemini-2.5-pro', name: 'Gemini 2.5 Pro', description: 'Deep reasoning and complex coding (Paid tier)', tier: 'flagship' },
  ],
  groq: [
    { id: 'llama-3.3-70b-versatile', name: 'Llama 3.3 70B Versatile', description: 'Recommended: Free Tier (6k TPM), 70B powerhouse', tier: 'free-friendly' },
    { id: 'llama-3.1-8b-instant', name: 'Llama 3.1 8B Instant', description: 'Free Tier (20k TPM), blazing speed', tier: 'free-friendly' },
    { id: 'deepseek-r1-distill-llama-70b', name: 'DeepSeek R1 Distill 70B', description: 'Reasoning model on Groq hardware', tier: 'reasoning' },
    { id: 'qwen-2.5-32b', name: 'Qwen 2.5 32B', description: 'Strong coding benchmark performance', tier: 'balanced' },
    { id: 'mixtral-8x7b-32768', name: 'Mixtral 8x7B', description: 'Large 32k context window', tier: 'balanced' },
  ],
  openai: [
    { id: 'gpt-4o-mini', name: 'GPT-4o Mini', description: 'Recommended: Free credits & Tier 1 friendly, fast & cheap', tier: 'free-friendly' },
    { id: 'gpt-4o', name: 'GPT-4o', description: 'Flagship high-intelligence multimodal model', tier: 'flagship' },
    { id: 'o3-mini', name: 'o3-mini', description: 'Deep reasoning for STEM & coding', tier: 'reasoning' },
    { id: 'o1-mini', name: 'o1-mini', description: 'Compact reasoning model', tier: 'reasoning' },
  ],
  anthropic: [
    { id: 'claude-3-5-haiku-20241022', name: 'Claude 3.5 Haiku', description: 'Recommended: Lowest cost, prompt caching enabled (90% off)', tier: 'free-friendly' },
    { id: 'claude-3-7-sonnet-20250219', name: 'Claude 3.7 Sonnet', description: 'Latest flagship hybrid reasoning model', tier: 'flagship' },
    { id: 'claude-3-5-sonnet-20241022', name: 'Claude 3.5 Sonnet', description: 'Industry benchmark leader for coding & agents', tier: 'flagship' },
  ],
  deepseek: [
    { id: 'deepseek-chat', name: 'DeepSeek Chat (V3)', description: 'Recommended: Ultra-low cost, free trial credits friendly', tier: 'free-friendly' },
    { id: 'deepseek-reasoner', name: 'DeepSeek Reasoner (R1)', description: 'Chain-of-thought mathematical & logical reasoning', tier: 'reasoning' },
  ],
  openrouter: [
    { id: 'meta-llama/llama-3.3-70b-instruct:free', name: 'Llama 3.3 70B (Free)', description: '100% Free model on OpenRouter', tier: 'free-friendly' },
    { id: 'anthropic/claude-3.5-haiku', name: 'Claude 3.5 Haiku', description: 'Unified API routing for Claude', tier: 'balanced' },
    { id: 'google/gemini-2.5-flash', name: 'Gemini 2.5 Flash', description: 'Fast multimodal Google model', tier: 'balanced' },
    { id: 'openai/gpt-4o-mini', name: 'GPT-4o Mini', description: 'Affordable OpenAI model via OpenRouter', tier: 'balanced' },
  ],
  ollama: [
    { id: 'llama3.2', name: 'Llama 3.2', description: 'Recommended: Default lightweight local model', tier: 'free-friendly' },
    { id: 'qwen2.5-coder', name: 'Qwen 2.5 Coder', description: 'Local code specialization', tier: 'balanced' },
    { id: 'deepseek-r1:8b', name: 'DeepSeek R1 8B', description: 'Local chain-of-thought reasoning', tier: 'reasoning' },
    { id: 'mistral', name: 'Mistral 7B', description: 'Local general-purpose model', tier: 'balanced' },
  ],
};

const VALID_PROVIDERS: AIProvider[] = ['gemini', 'groq', 'openai', 'anthropic', 'deepseek', 'openrouter', 'ollama'];

export async function manageModel(targetArg?: string, secondArg?: string): Promise<void> {
  const config = storage.getConfig();

  // Mode 1: Provider passed as first arg e.g. "/model groq llama-3.1-8b-instant" or "/model groq"
  if (targetArg && VALID_PROVIDERS.includes(targetArg.toLowerCase() as AIProvider)) {
    const prov = targetArg.toLowerCase() as AIProvider;
    if (secondArg && secondArg.trim()) {
      const prop = `${prov}Model` as keyof CliConfig;
      storage.saveConfig({ [prop]: secondArg.trim() });
      console.log(`\n${theme.green(`✔ Model for ${prov.toUpperCase()} updated to: ${theme.cyanBold(secondArg.trim())}`)}\n`);
      return;
    }
    // Interactive model selection for this specific provider
    await selectModelForProvider(prov);
    return;
  }

  // Mode 2: Direct model ID passed for currently active provider e.g. "/model gemini-3.5-flash-lite" or "/model gpt-4o"
  if (targetArg && targetArg.trim()) {
    const modelId = targetArg.trim();
    const prov = config.activeProvider;
    const prop = `${prov}Model` as keyof CliConfig;
    storage.saveConfig({ [prop]: modelId });
    console.log(`\n${theme.green(`✔ Model for active provider ${prov.toUpperCase()} updated to: ${theme.cyanBold(modelId)}`)}`);
    console.log(`${theme.slate('Stored in ~/.config/glint/config.json')}\n`);
    return;
  }

  // Mode 3: No arguments -> Interactive model selection for active provider with Custom Model ID option
  await selectModelForProvider(config.activeProvider);
}

async function selectModelForProvider(prov: AIProvider): Promise<void> {
  const config = storage.getConfig();
  const currentModel = prov === config.activeProvider ? storage.getActiveModel() : (config[`${prov}Model` as keyof CliConfig] as string);
  const options = PROVIDER_MODELS[prov] || [];

  console.log(`\n${theme.cyanBold('🧠 Glint LLM Model Selector:')}`);
  console.log(`  • Provider:     ${theme.amberBold(prov.toUpperCase())}`);
  console.log(`  • Active Model: ${theme.cyanBold(currentModel)}`);
  console.log(`${theme.slate('  Compatible with both Free tier and Paid API keys.')}\n`);

  if (!process.stdout.isTTY) {
    console.log(`${theme.slate('Usage: /model <model-id>  •  Example: /model gemini-3.5-flash-lite')}\n`);
    return;
  }

  const selectChoices = options.map((opt) => {
    const isCurrent = opt.id === currentModel;
    const badge = isCurrent ? ' (Active)' : '';
    const tierBadge = opt.tier === 'free-friendly' ? theme.green(' [Free & Paid]') : theme.slate(` [${opt.tier}]`);
    return {
      value: opt.id,
      label: `${opt.name}${badge} ${tierBadge} - ${theme.slate(opt.description)}`,
    };
  });

  selectChoices.push({
    value: '__custom__',
    label: `✏️  ${theme.whiteBold('Enter custom model ID (type any model name string)...')}`,
  });

  selectChoices.push({
    value: '__cancel__',
    label: `✖  ${theme.slate('Cancel / Keep current')}`,
  });

  const choice = await select({
    message: theme.cyanBold(`Select model for ${prov.toUpperCase()}:`),
    options: selectChoices,
  });

  if (typeof choice !== 'string' || choice === '__cancel__') {
    return;
  }

  if (choice === '__custom__') {
    const customId = await text({
      message: `Enter model ID string for ${prov.toUpperCase()}:`,
      initialValue: currentModel,
    });
    if (typeof customId === 'string' && customId.trim()) {
      const prop = `${prov}Model` as keyof CliConfig;
      storage.saveConfig({ [prop]: customId.trim() });
      console.log(`\n${theme.green(`✔ Model for ${prov.toUpperCase()} updated to: ${theme.cyanBold(customId.trim())}`)}\n`);
    }
    return;
  }

  const prop = `${prov}Model` as keyof CliConfig;
  storage.saveConfig({ [prop]: choice });
  console.log(`\n${theme.green(`✔ Model for ${prov.toUpperCase()} updated to: ${theme.cyanBold(choice)}`)}\n`);
}
