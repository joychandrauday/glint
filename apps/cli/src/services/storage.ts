import fs from 'fs';
import path from 'path';
import os from 'os';
import { CheatsheetItem } from '@glint/shared';

export interface CliConfig {
  activeProvider: 'groq' | 'gemini' | 'ollama' | 'openai';
  groqKey?: string;
  groqModel: string;
  geminiKey?: string;
  geminiModel: string;
  ollamaHost: string;
  ollamaModel: string;
  openaiKey?: string;
  openaiModel: string;
  autoCopy: boolean;
  confirmDestructive: boolean;
}

const DEFAULT_CONFIG: CliConfig = {
  activeProvider: 'groq',
  groqModel: 'qwen/qwen3.8-27b',
  geminiModel: 'gemini-flash-lite-latest',
  ollamaHost: 'http://localhost:11434',
  ollamaModel: 'llama3.2',
  openaiModel: 'gpt-4o-mini',
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
        return { ...DEFAULT_CONFIG, ...JSON.parse(raw) };
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
