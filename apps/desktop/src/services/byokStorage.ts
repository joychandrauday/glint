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
  groqModel: 'llama-3.3-70b-versatile',
  geminiModel: 'gemini-2.0-flash',
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
      return { ...DEFAULT_SETTINGS, ...JSON.parse(raw) };
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
        return s.groqKey ? `Groq (${s.groqModel || 'llama-3.3-70b'})` : 'Auto (Managed)';
      case 'gemini':
        return s.geminiKey ? `Gemini (${s.geminiModel || '2.0-flash'})` : 'Auto (Managed)';
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
