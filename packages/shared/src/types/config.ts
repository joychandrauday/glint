export interface SystemConfig {
  defaultDailyQuota: number;
  aiCacheTtlSeconds: number;
  maintenanceMode: boolean;
  allowedProviders: Array<'groq' | 'gemini' | 'cloudflare'>;
  primaryProvider: 'groq' | 'gemini' | 'cloudflare';
  guestSearchLimit: number;
}
