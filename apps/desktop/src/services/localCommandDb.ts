import { CheatsheetItem, CheatsheetSearchResult, normalizeQuery } from '@glint/shared';
import { DEFAULT_CHEATSHEETS } from '@glint/db';

const STORAGE_KEY = 'glint_local_command_db_v1';

export interface KnowledgeItem {
  id: string;
  query: string;
  answer: string;
  tags: string[];
  createdAt: string;
  hitCount: number;
}

export class LocalCommandDatabase {
  private baseItems: CheatsheetItem[] = [];
  private learnedItems: Map<string, CheatsheetItem> = new Map();
  private queryAliasMap: Map<string, string> = new Map(); // normalized query -> item id
  private learnedKnowledge: Map<string, KnowledgeItem> = new Map();
  private knowledgeAliasMap: Map<string, string> = new Map(); // normalized query -> knowledge id

  constructor() {
    this.baseItems = [...DEFAULT_CHEATSHEETS];
    this.loadFromStorage();
  }

  private loadFromStorage() {
    if (typeof localStorage === 'undefined') return;
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed.learned)) {
          for (const item of parsed.learned) {
            this.learnedItems.set(item.id, item);
          }
        }
        if (parsed.aliases && typeof parsed.aliases === 'object') {
          for (const [q, id] of Object.entries(parsed.aliases)) {
            this.queryAliasMap.set(q, id as string);
          }
        }
        if (Array.isArray(parsed.knowledge)) {
          for (const k of parsed.knowledge) {
            this.learnedKnowledge.set(k.id, k);
          }
        }
        if (parsed.knowledgeAliases && typeof parsed.knowledgeAliases === 'object') {
          for (const [q, id] of Object.entries(parsed.knowledgeAliases)) {
            this.knowledgeAliasMap.set(q, id as string);
          }
        }
      }
    } catch (e) {
      console.warn('[LocalCommandDb] Failed to read from localStorage:', e);
    }
  }

  private saveToStorage() {
    if (typeof localStorage === 'undefined') return;
    try {
      const data = {
        learned: Array.from(this.learnedItems.values()),
        aliases: Object.fromEntries(this.queryAliasMap.entries()),
        knowledge: Array.from(this.learnedKnowledge.values()),
        knowledgeAliases: Object.fromEntries(this.knowledgeAliasMap.entries()),
        updatedAt: new Date().toISOString(),
      };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    } catch (e) {
      console.warn('[LocalCommandDb] Failed to persist to localStorage:', e);
    }
  }

  /**
   * Search cached developer knowledge / answers (<2ms, 0 AI cost)
   */
  public searchKnowledge(query: string): KnowledgeItem | null {
    const trimmed = query.trim().toLowerCase();
    const normalized = normalizeQuery(query);
    if (!trimmed || trimmed.length < 3) return null;

    // 1. Direct alias match
    const aliasHitId = this.knowledgeAliasMap.get(normalized);
    if (aliasHitId && this.learnedKnowledge.has(aliasHitId)) {
      const item = this.learnedKnowledge.get(aliasHitId)!;
      item.hitCount = (item.hitCount || 0) + 1;
      this.saveToStorage();
      return item;
    }

    // 2. Fuzzy / keyword match across knowledge pool
    const stopWords = new Set(['the', 'is', 'in', 'at', 'of', 'a', 'an', 'to', 'for', 'on', 'with', 'my', 'me', 'we', 'do', 'how', 'what', 'can', 'hi', 'hello', 'hey', 'please', 'and']);
    const tokens = trimmed.split(/\s+/).filter((t) => t.length > 2 && !stopWords.has(t));
    if (tokens.length === 0) return null;

    let bestMatch: KnowledgeItem | null = null;
    let highestScore = 0;

    for (const item of this.learnedKnowledge.values()) {
      const qLower = item.query.toLowerCase();
      let score = 0;
      if (qLower === trimmed) {
        score = 100;
      } else if (qLower.includes(trimmed) || trimmed.includes(qLower)) {
        score = 80;
      } else {
        const matchedTokens = tokens.filter((t) => qLower.includes(t) || item.tags.includes(t));
        if (matchedTokens.length > 0 && matchedTokens.length / tokens.length >= 0.6) {
          score = 50 + (matchedTokens.length / tokens.length) * 30;
        }
      }

      if (score > highestScore && score >= 70) {
        highestScore = score;
        bestMatch = item;
      }
    }

    if (bestMatch) {
      bestMatch.hitCount = (bestMatch.hitCount || 0) + 1;
      this.saveToStorage();
    }

    return bestMatch;
  }

  /**
   * Learn a generic answer to local memory so repeated queries cost 0 tokens & work offline
   */
  public learnAnswer(query: string, answer: string): KnowledgeItem {
    const id = `k-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
    const normalized = normalizeQuery(query);
    const tags = query
      .toLowerCase()
      .split(/\s+/)
      .filter((w) => w.length > 2);

    const item: KnowledgeItem = {
      id,
      query: query.trim(),
      answer: answer.trim(),
      tags,
      createdAt: new Date().toISOString(),
      hitCount: 1,
    };

    this.learnedKnowledge.set(id, item);
    if (normalized) {
      this.knowledgeAliasMap.set(normalized, id);
    }
    this.saveToStorage();
    console.log(`[LocalCommandDb] Learned new knowledge answer for "${query}"`);
    return item;
  }

  /**
   * Search local database (curated + user-learned commands)
   */
  public search(query: string, categoryFilter?: string): CheatsheetSearchResult[] {
    const trimmed = query.trim().toLowerCase();
    const normalized = normalizeQuery(query);

    const allItems = [...this.learnedItems.values(), ...this.baseItems];

    // Filter by category if requested
    let pool = allItems;
    if (categoryFilter && categoryFilter !== 'all') {
      pool = pool.filter((item) => item.category.toLowerCase() === categoryFilter.toLowerCase());
    }

    if (!trimmed) {
      return pool.map((item) => ({ item, score: item.isPopular ? 100 : 50 }));
    }

    // Guard: short conversational or stop words (like "hi", "ok", "yo") should never substring-match full descriptions
    if (trimmed.length < 3) {
      const exactShortMatches = pool.filter(
        (item) => item.command.toLowerCase() === trimmed || item.tags.some((t) => t.toLowerCase() === trimmed)
      );
      return exactShortMatches.map((item) => ({ item, score: 100, matchedField: 'command' }));
    }

    // Direct alias hit (exact query previously learned)
    const directHitId = this.queryAliasMap.get(normalized);
    if (directHitId) {
      const directItem = allItems.find((i) => i.id === directHitId);
      if (directItem) {
        return [{ item: directItem, score: 200, matchedField: 'command' }];
      }
    }

    const stopWords = new Set(['the', 'is', 'in', 'at', 'of', 'a', 'an', 'to', 'for', 'on', 'with', 'my', 'me', 'we', 'do', 'how', 'what', 'can', 'hi', 'hello', 'hey', 'please', 'and']);
    const tokens = trimmed.split(/\s+/).filter((t) => t.length > 1 && !stopWords.has(t));
    const results: CheatsheetSearchResult[] = [];

    for (const item of pool) {
      let score = 0;
      let matchedField: 'command' | 'description' | 'category' | 'tags' | undefined;

      const cmdLower = item.command.toLowerCase();
      const descLower = item.description.toLowerCase();
      const catLower = item.category.toLowerCase();
      const tagsStr = item.tags.join(' ').toLowerCase();
      const notesLower = (item.notes || '').toLowerCase();

      // Exact phrase matches
      if (cmdLower === trimmed) {
        score += 150;
        matchedField = 'command';
      } else if (cmdLower.includes(trimmed)) {
        score += 90;
        matchedField = 'command';
      } else if (descLower.includes(trimmed)) {
        score += 70;
        matchedField = 'description';
      } else if (notesLower && (notesLower.includes(trimmed) || trimmed.includes(notesLower))) {
        score += 85;
        matchedField = 'description';
      } else if (tagsStr.includes(trimmed)) {
        score += 55;
        matchedField = 'tags';
      } else if (catLower.includes(trimmed)) {
        score += 40;
        matchedField = 'category';
      }

      // Check token hits
      let matchedTokenCount = 0;
      for (const token of tokens) {
        // For short tokens (<= 3 chars), require word boundary or tag match
        const tokenRegex = token.length <= 3 ? new RegExp(`\\b${token}\\b`, 'i') : null;
        const matchesToken = tokenRegex
          ? tokenRegex.test(cmdLower) || tokenRegex.test(descLower) || item.tags.includes(token)
          : cmdLower.includes(token) || descLower.includes(token) || tagsStr.includes(token) || catLower.includes(token) || notesLower.includes(token);

        if (matchesToken) {
          score += 30;
          matchedTokenCount++;
        }
      }

      // Match if at least half of the substantive tokens match or score is high
      const tokenMatchRatio = tokens.length > 0 ? matchedTokenCount / tokens.length : 0;
      const isViableMatch = score >= 60 && (tokens.length === 0 || tokenMatchRatio >= 0.5);

      // Extra boost if this is a user-learned command
      if (this.learnedItems.has(item.id)) {
        score += 25;
      }

      if (item.isPopular) {
        score += 5;
      }

      if (score > 0 && isViableMatch) {
        results.push({ item, score, matchedField });
      }
    }

    return results.sort((a, b) => b.score - a.score);
  }

  /**
   * Automatically store new command in the background to grow local database and avoid AI usage
   */
  public async learnCommand(
    query: string,
    commandItem: Partial<CheatsheetItem> & { command: string; description: string }
  ): Promise<CheatsheetItem> {
    const id = commandItem.id || `learned-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
    const normalized = normalizeQuery(query);

    const queryWords = query.toLowerCase().split(/\s+/).filter((w) => w.length > 1);

    const fullItem: CheatsheetItem = {
      id,
      command: commandItem.command,
      template: commandItem.template || commandItem.command,
      description: commandItem.description,
      category: commandItem.category || 'general',
      tags: Array.from(new Set([...(commandItem.tags || []), ...queryWords])),
      variables: commandItem.variables || [],
      platform: commandItem.platform || 'linux',
      dangerLevel: commandItem.dangerLevel || 'safe',
      notes: query, // Save original query prompt as searchable note
      isPopular: false,
      updatedAt: new Date().toISOString(),
    };

    this.learnedItems.set(id, fullItem);
    if (normalized) {
      this.queryAliasMap.set(normalized, id);
    }

    this.saveToStorage();
    console.log(`[LocalCommandDb] Learned new command for "${query}":`, fullItem.command);
    return fullItem;
  }

  public getStats() {
    return {
      totalCommands: this.baseItems.length + this.learnedItems.size,
      learnedCommands: this.learnedItems.size,
      baseCommands: this.baseItems.length,
      learnedKnowledge: this.learnedKnowledge.size,
    };
  }

  public getCategories(): Array<{ id: string; label: string; count: number }> {
    const counts = new Map<string, number>();
    const all = [...this.learnedItems.values(), ...this.baseItems];

    for (const item of all) {
      counts.set(item.category, (counts.get(item.category) || 0) + 1);
    }

    const categories = Array.from(counts.entries()).map(([id, count]) => ({
      id,
      label: id.charAt(0).toUpperCase() + id.slice(1),
      count,
    }));

    return [{ id: 'all', label: 'All', count: all.length }, ...categories];
  }
}

export const localCommandDb = new LocalCommandDatabase();
