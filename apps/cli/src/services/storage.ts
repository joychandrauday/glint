import fs from 'fs';
import path from 'path';
import os from 'os';
import { CheatsheetItem } from '@glint/shared';

export type AIProvider = 'anthropic' | 'openai' | 'gemini' | 'groq' | 'deepseek' | 'openrouter' | 'ollama';
export type AIMode = 'agent' | 'chat' | 'copilot';

export interface CliConfig {
  activeProvider: AIProvider;
  mode: AIMode;
  // Provider API Keys (BYOK)
  anthropicKey?: string;
  openaiKey?: string;
  geminiKey?: string;
  groqKey?: string;
  deepseekKey?: string;
  openrouterKey?: string;
  // Provider Default Models
  anthropicModel: string;
  openaiModel: string;
  geminiModel: string;
  groqModel: string;
  deepseekModel: string;
  openrouterModel: string;
  ollamaHost: string;
  ollamaModel: string;
  // Token Reduction & Caching Flow
  cacheEnabled: boolean;
  cacheTTLHours: number;
  maxContextTokens: number;
  autoCompact: boolean;
  // Execution preferences
  autoCopy: boolean;
  confirmDestructive: boolean;
}

const DEFAULT_CONFIG: CliConfig = {
  activeProvider: 'groq',
  mode: 'agent',
  anthropicModel: 'claude-3-5-haiku-20241022',
  openaiModel: 'gpt-4o-mini',
  geminiModel: 'gemini-3.5-flash-lite',
  groqModel: 'llama-3.3-70b-versatile',
  deepseekModel: 'deepseek-chat',
  openrouterModel: 'meta-llama/llama-3.3-70b-instruct:free',
  ollamaHost: 'http://localhost:11434',
  ollamaModel: 'llama3.2',
  cacheEnabled: true,
  cacheTTLHours: 72,
  maxContextTokens: 4096,
  autoCompact: true,
  autoCopy: false,
  confirmDestructive: true,
};

export class StorageService {
  private configDir: string;
  private configFile: string;
  private vaultFile: string;

  constructor() {
    this.configDir = path.join(os.homedir(), '.config', 'glint');
    this.configFile = path.join(this.configDir, 'config.json');
    this.vaultFile = path.join(this.configDir, 'vault.json');
    this.ensureDirs();
  }

  private ensureDirs(): void {
    if (!fs.existsSync(this.configDir)) {
      fs.mkdirSync(this.configDir, { recursive: true });
    }
  }

  getConfig(): CliConfig {
    try {
      if (fs.existsSync(this.configFile)) {
        const raw = fs.readFileSync(this.configFile, 'utf8');
        const parsed = { ...DEFAULT_CONFIG, ...JSON.parse(raw) };
        // Auto-upgrade deprecated Google Gemini models
        if (parsed.geminiModel === 'gemini-2.0-flash' || parsed.geminiModel === 'gemini-2.5-flash') {
          parsed.geminiModel = 'gemini-3.8-flash';
        }
        return parsed;
      }
    } catch {
      // Fallback
    }
    return { ...DEFAULT_CONFIG };
  }

  saveConfig(config: Partial<CliConfig>): CliConfig {
    const current = this.getConfig();
    const updated = { ...current, ...config };
    fs.writeFileSync(this.configFile, JSON.stringify(updated, null, 2), 'utf8');
    return updated;
  }

  getEffectiveKey(provider: AIProvider): string | undefined {
    const config = this.getConfig();
    switch (provider) {
      case 'anthropic':
        return config.anthropicKey || process.env.ANTHROPIC_API_KEY;
      case 'openai':
        return config.openaiKey || process.env.OPENAI_API_KEY;
      case 'gemini':
        return config.geminiKey || process.env.GEMINI_API_KEY;
      case 'groq':
        return config.groqKey || process.env.GROQ_API_KEY;
      case 'deepseek':
        return config.deepseekKey || process.env.DEEPSEEK_API_KEY;
      case 'openrouter':
        return config.openrouterKey || process.env.OPENROUTER_API_KEY;
      case 'ollama':
        return 'local';
      default:
        return undefined;
    }
  }

  getKeySource(provider: AIProvider): 'config' | 'env' | 'none' {
    const config = this.getConfig();
    const keyProp = `${provider}Key` as keyof CliConfig;
    if (config[keyProp]) return 'config';

    const envMap: Record<string, string | undefined> = {
      anthropic: process.env.ANTHROPIC_API_KEY,
      openai: process.env.OPENAI_API_KEY,
      gemini: process.env.GEMINI_API_KEY,
      groq: process.env.GROQ_API_KEY,
      deepseek: process.env.DEEPSEEK_API_KEY,
      openrouter: process.env.OPENROUTER_API_KEY,
      ollama: 'local',
    };

    return envMap[provider] ? 'env' : 'none';
  }

  getActiveModel(): string {
    const config = this.getConfig();
    switch (config.activeProvider) {
      case 'anthropic':
        return config.anthropicModel;
      case 'openai':
        return config.openaiModel;
      case 'gemini':
        return config.geminiModel;
      case 'groq':
        return config.groqModel;
      case 'deepseek':
        return config.deepseekModel;
      case 'openrouter':
        return config.openrouterModel;
      case 'ollama':
        return config.ollamaModel;
    }
  }

  getCustomVault(): CheatsheetItem[] {
    try {
      if (fs.existsSync(this.vaultFile)) {
        const raw = fs.readFileSync(this.vaultFile, 'utf8');
        return JSON.parse(raw);
      }
    } catch {
      // Fallback
    }
    return [];
  }

  saveCustomVault(items: CheatsheetItem[]): void {
    fs.writeFileSync(this.vaultFile, JSON.stringify(items, null, 2), 'utf8');
  }

  addCustomItem(item: CheatsheetItem): void {
    const vault = this.getCustomVault();
    vault.unshift(item);
    this.saveCustomVault(vault);
  }

  removeCustomItem(id: string): boolean {
    const vault = this.getCustomVault();
    const filtered = vault.filter((i) => i.id !== id);
    if (filtered.length !== vault.length) {
      this.saveCustomVault(filtered);
      return true;
    }
    return false;
  }
}

export const storage = new StorageService();
