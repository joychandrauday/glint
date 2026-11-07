export type AIProvider = 'auto' | 'groq' | 'gemini' | 'ollama' | 'openai' | 'openrouter';

export interface ByokSettings {
  activeProvider: AIProvider;
  groqKey?: string;
  groqModel?: string;
  geminiKey?: string;
  geminiModel?: string;
  ollamaHost?: string;
  ollamaModel?: string;
  openaiKey?: string;
  openaiModel?: string;
  openrouterKey?: string;
  openrouterModel?: string;
}

const STORAGE_KEY = 'glint_byok_config_v1';

const DEFAULT_SETTINGS: ByokSettings = {
  activeProvider: 'auto',
  groqModel: 'qwen/qwen3.8-27b',
  geminiModel: 'gemini-flash-lite-latest',
  ollamaHost: 'http://localhost:11434',
  ollamaModel: 'llama3.2',
  openaiModel: 'gpt-4o-mini',
  openrouterModel: 'meta-llama/llama-3.3-70b-instruct',
};

export const byokStorage = {
  getSettings(): ByokSettings {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return { ...DEFAULT_SETTINGS };
      const parsed = JSON.parse(raw);
      // Auto-migrate deprecated models
      if (parsed.groqModel && (parsed.groqModel.includes('llama-3.3-70b') || parsed.groqModel.includes('llama-3.1') || parsed.groqModel.includes('llama3') || parsed.groqModel.includes('llama'))) {
        parsed.groqModel = 'qwen/qwen3.8-27b';
      }
      if (parsed.geminiModel && (parsed.geminiModel.includes('gemini-2.0') || parsed.geminiModel.includes('gemini-1.5') || parsed.geminiModel.includes('gemini-pro') || parsed.geminiModel.includes('gemini-flash-latest'))) {
        parsed.geminiModel = 'gemini-flash-lite-latest';
      }
      return { ...DEFAULT_SETTINGS, ...parsed };
    } catch {
      return { ...DEFAULT_SETTINGS };
    }
  },

  saveSettings(settings: Partial<ByokSettings>): ByokSettings {
    const current = this.getSettings();
    const updated = { ...current, ...settings };
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    } catch (e) {
      console.warn('[BYOK] Could not save settings to localStorage:', e);
    }
    return updated;
  },

  hasActiveCustomKey(settings?: ByokSettings): boolean {
    const s = settings || this.getSettings();
    if (s.activeProvider === 'groq' && s.groqKey?.trim()) return true;
    if (s.activeProvider === 'gemini' && s.geminiKey?.trim()) return true;
    if (s.activeProvider === 'ollama' && s.ollamaHost?.trim()) return true;
    if (s.activeProvider === 'openai' && s.openaiKey?.trim()) return true;
    if (s.activeProvider === 'openrouter' && s.openrouterKey?.trim()) return true;
    return false;
  },

  getActiveProviderLabel(settings?: ByokSettings): string {
    const s = settings || this.getSettings();
    switch (s.activeProvider) {
      case 'groq':
        return s.groqKey ? `Groq (${s.groqModel || 'qwen/qwen3.8-27b'})` : 'Auto (Managed)';
      case 'gemini':
        return s.geminiKey ? `Gemini (${s.geminiModel || 'gemini-flash-latest'})` : 'Auto (Managed)';
      case 'ollama':
        return `Ollama (${s.ollamaModel || 'llama3.2'})`;
      case 'openai':
        return s.openaiKey ? `OpenAI (${s.openaiModel || 'gpt-4o-mini'})` : 'Auto (Managed)';
      case 'openrouter':
        return s.openrouterKey ? `OpenRouter` : 'Auto (Managed)';
      default:
        return 'Glint Managed Pool';
    }
  },
};
