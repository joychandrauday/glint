export type LLMProvider = 'groq' | 'gemini' | 'cloudflare';

export interface AIQueryRequest {
  query: string;
  context?: {
    shell?: string;       // e.g. 'bash', 'zsh', 'fish'
    os?: string;          // e.g. 'ubuntu 24.04'
    cwd?: string;         // e.g. '~/projects/glint'
    recentHistory?: string[];
  };
  preferredProvider?: LLMProvider;
}

export interface AICommandSuggestion {
  command: string;
  template: string;
  description: string;
  dangerLevel: 'safe' | 'caution' | 'dangerous';
  explanation: string;
  variables: Array<{
    name: string;
    defaultValue?: string;
    description?: string;
  }>;
}

export interface AIQueryResponse {
  success: boolean;
  query: string;
  cached: boolean;
  provider: LLMProvider;
  latencyMs: number;
  suggestions: AICommandSuggestion[];
  remainingDailyQuota?: number;
  error?: string;
}
