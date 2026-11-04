import { z } from 'zod';

export const CommandVariableSchema = z.object({
  name: z.string().min(1),
  label: z.string().optional(),
  defaultValue: z.string().optional(),
  description: z.string().optional(),
  required: z.boolean().optional(),
});

export const CheatsheetItemSchema = z.object({
  id: z.string().min(1),
  command: z.string().min(1),
  template: z.string().min(1),
  description: z.string().min(1),
  category: z.string().min(1),
  tags: z.array(z.string()).default([]),
  variables: z.array(CommandVariableSchema).default([]),
  platform: z.enum(['linux', 'macos', 'windows', 'all']).default('all'),
  isPopular: z.boolean().optional(),
  notes: z.string().optional(),
  dangerLevel: z.enum(['safe', 'caution', 'dangerous']).default('safe'),
  version: z.number().int().nonnegative().optional(),
  updatedAt: z.string().optional(),
});

export const AIQueryRequestSchema = z.object({
  query: z.string().min(2).max(500),
  context: z
    .object({
      shell: z.string().optional(),
      os: z.string().optional(),
      cwd: z.string().optional(),
      recentHistory: z.array(z.string()).optional(),
    })
    .optional(),
  preferredProvider: z.enum(['groq', 'gemini', 'cloudflare']).optional(),
});

export const AICommandSuggestionSchema = z.object({
  command: z.string(),
  template: z.string(),
  description: z.string(),
  dangerLevel: z.enum(['safe', 'caution', 'dangerous']),
  explanation: z.string(),
  variables: z.array(
    z.object({
      name: z.string(),
      defaultValue: z.string().optional(),
      description: z.string().optional(),
    })
  ),
});

export const AIQueryResponseSchema = z.object({
  success: z.boolean(),
  query: z.string(),
  cached: z.boolean(),
  provider: z.enum(['groq', 'gemini', 'cloudflare']),
  latencyMs: z.number(),
  suggestions: z.array(AICommandSuggestionSchema),
  remainingDailyQuota: z.number().optional(),
  error: z.string().optional(),
});

export const SystemConfigSchema = z.object({
  defaultDailyQuota: z.number().int().positive().default(15),
  aiCacheTtlSeconds: z.number().int().positive().default(604800), // 7 days
  maintenanceMode: z.boolean().default(false),
  allowedProviders: z.array(z.enum(['groq', 'gemini', 'cloudflare'])).default(['groq', 'gemini', 'cloudflare']),
  primaryProvider: z.enum(['groq', 'gemini', 'cloudflare']).default('groq'),
  guestSearchLimit: z.number().int().positive().default(10),
});
