import { CheatsheetItem, CheatsheetSearchResult, normalizeQuery } from '@glint/shared';
import { DEFAULT_CHEATSHEETS } from '@glint/db';

const STORAGE_KEY = 'glint_local_command_db_v1';

export class LocalCommandDatabase {
  private baseItems: CheatsheetItem[] = [];
  private learnedItems: Map<string, CheatsheetItem> = new Map();
  private queryAliasMap: Map<string, string> = new Map(); // normalized query -> item id

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
        updatedAt: new Date().toISOString(),
      };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    } catch (e) {
      console.warn('[LocalCommandDb] Failed to persist to localStorage:', e);
    }
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

    // Direct alias hit (exact query previously learned)
    const directHitId = this.queryAliasMap.get(normalized);
    if (directHitId) {
      const directItem = allItems.find((i) => i.id === directHitId);
      if (directItem) {
        return [{ item: directItem, score: 200, matchedField: 'command' }];
      }
    }

    const tokens = trimmed.split(/\s+/).filter((t) => t.length > 1);
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
        if (
          cmdLower.includes(token) ||
          descLower.includes(token) ||
          tagsStr.includes(token) ||
          catLower.includes(token) ||
          notesLower.includes(token)
        ) {
          score += 25;
          matchedTokenCount++;
        }
      }

      // Match if at least half of the substantive tokens match or score is high
      const tokenMatchRatio = tokens.length > 0 ? matchedTokenCount / tokens.length : 0;
      const isViableMatch = score >= 50 || tokenMatchRatio >= 0.5;

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
