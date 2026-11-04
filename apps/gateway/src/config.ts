import { SystemConfig } from '@glint/shared';

export interface GatewayEnv {
  PORT?: string;
  GROQ_API_KEY?: string;
  GEMINI_API_KEY?: string;
  CLOUDFLARE_API_KEY?: string;
  CLOUDFLARE_ACCOUNT_ID?: string;
  SUPABASE_URL?: string;
  SUPABASE_JWT_SECRET?: string;
  UPSTASH_REDIS_REST_URL?: string;
  UPSTASH_REDIS_REST_TOKEN?: string;
}

export const defaultConfig: SystemConfig = {
  defaultDailyQuota: 15,
  aiCacheTtlSeconds: 604800, // 7 days
  maintenanceMode: false,
  allowedProviders: ['groq', 'gemini', 'cloudflare'],
  primaryProvider: 'groq',
  guestSearchLimit: 10,
};

export const runtimeConfig: SystemConfig = { ...defaultConfig };
