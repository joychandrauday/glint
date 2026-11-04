import crypto from 'node:crypto';
import { normalizeQuery, AICommandSuggestion } from '@glint/shared';

export interface CacheEntry {
  hash: string;
  normalizedQuery: string;
  provider: 'groq' | 'gemini' | 'cloudflare';
  suggestions: AICommandSuggestion[];
  latencyMs: number;
  createdAt: number;
  expiresAt: number;
}

class QueryCache {
  private cache = new Map<string, CacheEntry>();

  public computeHash(rawQuery: string): { hash: string; normalized: string } {
    const normalized = normalizeQuery(rawQuery);
    const hash = crypto.createHash('sha256').update(normalized).digest('hex');
    return { hash, normalized };
  }

  public get(rawQuery: string): CacheEntry | null {
    const { hash } = this.computeHash(rawQuery);
    const entry = this.cache.get(hash);
    if (!entry) return null;

    if (Date.now() > entry.expiresAt) {
      this.cache.delete(hash);
      return null;
    }
    return entry;
  }

  public set(
    rawQuery: string,
    provider: 'groq' | 'gemini' | 'cloudflare',
    suggestions: AICommandSuggestion[],
    latencyMs: number,
    ttlSeconds = 604800
  ): CacheEntry {
    const { hash, normalized } = this.computeHash(rawQuery);
    const now = Date.now();
    const entry: CacheEntry = {
      hash,
      normalizedQuery: normalized,
      provider,
      suggestions,
      latencyMs,
      createdAt: now,
      expiresAt: now + ttlSeconds * 1000,
    };
    this.cache.set(hash, entry);
    return entry;
  }

  public clear(): void {
    this.cache.clear();
  }

  public get size(): number {
    return this.cache.size;
  }
}

export const queryCache = new QueryCache();
