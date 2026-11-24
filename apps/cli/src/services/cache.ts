import fs from 'fs';
import path from 'path';
import os from 'os';
import crypto from 'crypto';
import { storage } from './storage.js';

export interface CacheEntry {
  hash: string;
  provider: string;
  model: string;
  prompt: string;
  response: string;
  structured?: any;
  promptTokens: number;
  completionTokens: number;
  totalTokens: number;
  createdAt: number;
  expiresAt: number;
  hits: number;
}

export interface CacheStats {
  totalEntries: number;
  hits: number;
  misses: number;
  tokensSaved: number;
  promptTokensSaved: number;
  completionTokensSaved: number;
  estimatedCostSavedUSD: number;
}

export class CacheService {
  private cacheDir: string;
  private cacheFile: string;
  private statsFile: string;
  private memoryCache: Map<string, CacheEntry> = new Map();
  private stats: CacheStats = {
    totalEntries: 0,
    hits: 0,
    misses: 0,
    tokensSaved: 0,
    promptTokensSaved: 0,
    completionTokensSaved: 0,
    estimatedCostSavedUSD: 0,
  };

  constructor() {
    this.cacheDir = path.join(os.homedir(), '.config', 'glint', 'cache');
    this.cacheFile = path.join(this.cacheDir, 'query_cache.json');
    this.statsFile = path.join(this.cacheDir, 'stats.json');
    this.ensureDirs();
    this.load();
  }

  private ensureDirs(): void {
    if (!fs.existsSync(this.cacheDir)) {
      fs.mkdirSync(this.cacheDir, { recursive: true });
    }
  }

  private load(): void {
    try {
      if (fs.existsSync(this.cacheFile)) {
        const raw = fs.readFileSync(this.cacheFile, 'utf8');
        const list: CacheEntry[] = JSON.parse(raw);
        const now = Date.now();
        for (const entry of list) {
          if (entry.expiresAt > now) {
            this.memoryCache.set(entry.hash, entry);
          }
        }
      }
      if (fs.existsSync(this.statsFile)) {
        const rawStats = fs.readFileSync(this.statsFile, 'utf8');
        this.stats = { ...this.stats, ...JSON.parse(rawStats) };
      }
      this.stats.totalEntries = this.memoryCache.size;
    } catch {
      // Ignore initial load failure
    }
  }

  private persist(): void {
    try {
      const list = Array.from(this.memoryCache.values());
      fs.writeFileSync(this.cacheFile, JSON.stringify(list, null, 2), 'utf8');
      this.stats.totalEntries = this.memoryCache.size;
      fs.writeFileSync(this.statsFile, JSON.stringify(this.stats, null, 2), 'utf8');
    } catch {
      // Silently continue
    }
  }

  createHash(provider: string, model: string, prompt: string, systemPrompt?: string): string {
    const normalized = prompt.trim().toLowerCase().replace(/\s+/g, ' ');
    const normalizedSys = (systemPrompt || '').trim().replace(/\s+/g, ' ');
    return crypto
      .createHash('sha256')
      .update(`${provider}:${model}:${normalizedSys}:${normalized}`)
      .digest('hex');
  }

  get(provider: string, model: string, prompt: string, systemPrompt?: string): CacheEntry | null {
    const config = storage.getConfig();
    if (!config.cacheEnabled) return null;

    const hash = this.createHash(provider, model, prompt, systemPrompt);
    const entry = this.memoryCache.get(hash);

    if (!entry) {
      this.stats.misses++;
      this.persist();
      return null;
    }

    // Check expiration
    if (Date.now() > entry.expiresAt) {
      this.memoryCache.delete(hash);
      this.stats.misses++;
      this.persist();
      return null;
    }

    // Hit! Update statistics
    entry.hits++;
    this.stats.hits++;
    const saved = entry.totalTokens || (entry.promptTokens + entry.completionTokens);
    this.stats.tokensSaved += saved;
    this.stats.promptTokensSaved += entry.promptTokens;
    this.stats.completionTokensSaved += entry.completionTokens;
    
    // Average $1.50 per 1M tokens across popular models
    this.stats.estimatedCostSavedUSD += (saved / 1_000_000) * 1.5;

    this.persist();
    return entry;
  }

  set(
    provider: string,
    model: string,
    prompt: string,
    systemPrompt: string | undefined,
    response: string,
    tokens: { promptTokens?: number; completionTokens?: number },
    structured?: any
  ): void {
    const config = storage.getConfig();
    if (!config.cacheEnabled) return;

    const hash = this.createHash(provider, model, prompt, systemPrompt);
    const ttlMs = (config.cacheTTLHours || 72) * 60 * 60 * 1000;
    const now = Date.now();

    const pTokens = tokens.promptTokens || Math.ceil((prompt.length + (systemPrompt?.length || 0)) / 3.8);
    const cTokens = tokens.completionTokens || Math.ceil(response.length / 3.8);

    const entry: CacheEntry = {
      hash,
      provider,
      model,
      prompt,
      response,
      structured,
      promptTokens: pTokens,
      completionTokens: cTokens,
      totalTokens: pTokens + cTokens,
      createdAt: now,
      expiresAt: now + ttlMs,
      hits: 0,
    };

    // If cache exceeds 1000 entries, prune oldest
    if (this.memoryCache.size >= 1000) {
      const oldestKey = this.memoryCache.keys().next().value;
      if (oldestKey) this.memoryCache.delete(oldestKey);
    }

    this.memoryCache.set(hash, entry);
    this.persist();
  }

  getStats(): CacheStats {
    const totalRequests = this.stats.hits + this.stats.misses;
    const hitRate = totalRequests > 0 ? (this.stats.hits / totalRequests) * 100 : 0;
    return {
      ...this.stats,
      totalEntries: this.memoryCache.size,
      estimatedCostSavedUSD: Number(this.stats.estimatedCostSavedUSD.toFixed(4)),
    };
  }

  prune(): number {
    const now = Date.now();
    let removed = 0;
    for (const [key, entry] of this.memoryCache.entries()) {
      if (entry.expiresAt <= now) {
        this.memoryCache.delete(key);
        removed++;
      }
    }
    this.persist();
    return removed;
  }

  clear(): void {
    this.memoryCache.clear();
    this.stats = {
      totalEntries: 0,
      hits: 0,
      misses: 0,
      tokensSaved: 0,
      promptTokensSaved: 0,
      completionTokensSaved: 0,
      estimatedCostSavedUSD: 0,
    };
    try {
      if (fs.existsSync(this.cacheFile)) fs.unlinkSync(this.cacheFile);
      if (fs.existsSync(this.statsFile)) fs.unlinkSync(this.statsFile);
    } catch {
      // Ignore
    }
  }
}

export const cache = new CacheService();
