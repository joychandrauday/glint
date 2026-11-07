import './env';
import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { serve } from '@hono/node-server';
import { DEFAULT_CHEATSHEETS } from '@glint/db';
import {
  AIQueryRequestSchema,
  AIQueryResponse,
  SystemConfigSchema,
} from '@glint/shared';
import { requireAuth } from './middleware/auth';
import { queryCache } from './cache';
import { quotaManager } from './quota';
import { LLMPipeline } from './llm/pipeline';
import { runtimeConfig } from './config';

const app = new Hono();

// Enable CORS for web previews and desktop overlay
app.use('*', cors());

// Health Check
app.get('/health', (c) => {
  return c.json({
    status: 'ok',
    version: '0.1.0',
    primaryProvider: runtimeConfig.primaryProvider,
    allowedProviders: runtimeConfig.allowedProviders,
    maintenanceMode: runtimeConfig.maintenanceMode,
    cachedQueries: queryCache.size,
    uptimeSeconds: Math.floor(process.uptime()),
  });
});

// Cheatsheets catalog (accessible for syncing to local SQLite / offline index)
app.get('/api/v1/cheatsheets', (c) => {
  const category = c.req.query('category');
  const search = c.req.query('q')?.toLowerCase();

  let results = [...DEFAULT_CHEATSHEETS];

  if (category) {
    results = results.filter((item) => item.category.toLowerCase() === category.toLowerCase());
  }

  if (search) {
    results = results.filter(
      (item) =>
        item.command.toLowerCase().includes(search) ||
        item.description.toLowerCase().includes(search) ||
        item.tags.some((t) => t.toLowerCase().includes(search))
    );
  }

  return c.json({
    success: true,
    total: results.length,
    data: results,
  });
});

// User Quota Endpoint
app.get('/api/v1/user/quota', requireAuth, (c) => {
  const auth = c.get('auth');
  const quota = quotaManager.getQuota(auth.userId, runtimeConfig.defaultDailyQuota);

  return c.json({
    success: true,
    quota: {
      userId: auth.userId,
      email: auth.email,
      dailyQueryLimit: quota.dailyQueryLimit,
      queriesUsedToday: quota.queriesUsedToday,
      remainingQueries: Math.max(0, quota.dailyQueryLimit - quota.queriesUsedToday),
      quotaResetAt: quota.quotaResetAt,
      isUnlimited: quota.isUnlimited,
    },
  });
});

// AI Query Endpoint with Rate Limiting, Cache, & Upstream Cascade
app.post('/api/v1/ai/query', requireAuth, async (c) => {
  if (runtimeConfig.maintenanceMode) {
    return c.json(
      {
        success: false,
        error: 'AI Gateway is currently in maintenance mode. Please try again shortly.',
      },
      503
    );
  }

  const auth = c.get('auth');
  const body = await c.req.json().catch(() => null);

  const parsed = AIQueryRequestSchema.safeParse(body);
  if (!parsed.success) {
    return c.json(
      {
        success: false,
        error: 'Invalid request body',
        details: parsed.error.format(),
      },
      400
    );
  }

  const { query, context, preferredProvider } = parsed.data;

  // 1. Quota Check (sliding daily limit)
  if (!quotaManager.canConsume(auth.userId, runtimeConfig.defaultDailyQuota)) {
    const quota = quotaManager.getQuota(auth.userId, runtimeConfig.defaultDailyQuota);
    return c.json(
      {
        success: false,
        error: 'Daily AI query quota exceeded (15 queries/day).',
        quotaResetAt: quota.quotaResetAt,
      },
      429
    );
  }

  // 2. Cache Lookup
  const cached = queryCache.get(query);
  if (cached) {
    // Cached hits do not deduct from user quota!
    const quota = quotaManager.getQuota(auth.userId, runtimeConfig.defaultDailyQuota);
    const response: AIQueryResponse = {
      success: true,
      query,
      cached: true,
      provider: cached.provider,
      latencyMs: 4, // Instant memory hit
      suggestions: cached.suggestions,
      remainingDailyQuota: Math.max(0, quota.dailyQueryLimit - quota.queriesUsedToday),
    };
    return c.json(response);
  }

  // 3. Upstream Provider Execution
  try {
    const start = Date.now();
    const result = await LLMPipeline.execute(query, context, preferredProvider);

    // 4. Save to Cache
    queryCache.set(
      query,
      result.providerUsed,
      result.suggestions,
      result.latencyMs,
      runtimeConfig.aiCacheTtlSeconds
    );

    // 5. Consume Quota
    const consumption = quotaManager.consume(auth.userId, runtimeConfig.defaultDailyQuota);

    const response: AIQueryResponse = {
      success: true,
      query,
      cached: false,
      provider: result.providerUsed,
      latencyMs: Date.now() - start,
      suggestions: result.suggestions,
      remainingDailyQuota: consumption.remaining,
    };

    return c.json(response);
  } catch (err: any) {
    console.error('[AI Query Error]', err);
    return c.json(
      {
        success: false,
        error: err.message || 'Failed to generate command suggestions.',
      },
      500
    );
  }
});

// Admin Configuration Endpoint
app.post('/api/v1/admin/config', requireAuth, async (c) => {
  const auth = c.get('auth');
  if (auth.role !== 'admin') {
    return c.json({ error: 'Forbidden: Admin access required' }, 403);
  }

  const body = await c.req.json().catch(() => ({}));
  const parsed = SystemConfigSchema.partial().safeParse(body);
  if (!parsed.success) {
    return c.json({ error: 'Invalid config format', details: parsed.error.format() }, 400);
  }

  Object.assign(runtimeConfig, parsed.data);
  return c.json({
    success: true,
    message: 'System configuration updated successfully',
    config: runtimeConfig,
  });
});

// Admin Stats
app.get('/api/v1/admin/stats', requireAuth, (c) => {
  const auth = c.get('auth');
  if (auth.role !== 'admin') {
    return c.json({ error: 'Forbidden: Admin access required' }, 403);
  }

  return c.json({
    success: true,
    stats: {
      cachedEntries: queryCache.size,
      runtimeConfig,
      uptimeSeconds: Math.floor(process.uptime()),
    },
  });
});

const port = Number(process.env.PORT) || 8787;

if (process.env.NODE_ENV !== 'test') {
  serve(
    {
      fetch: app.fetch,
      port,
    },
    (info) => {
      console.log(`[Glint AI Gateway] Running at http://localhost:${info.port}`);
    }
  );
}

export default app;
