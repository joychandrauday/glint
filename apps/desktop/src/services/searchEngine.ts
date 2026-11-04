import { CheatsheetItem, CheatsheetSearchResult } from '@glint/shared';
import { DEFAULT_CHEATSHEETS } from '@glint/db';

export class LocalSearchEngine {
  private items: CheatsheetItem[];

  constructor(initialItems: CheatsheetItem[] = DEFAULT_CHEATSHEETS) {
    this.items = initialItems;
  }

  public search(query: string, categoryFilter?: string): CheatsheetSearchResult[] {
    const trimmed = query.trim().toLowerCase();

    let pool = this.items;
    if (categoryFilter && categoryFilter !== 'all') {
      pool = pool.filter((item) => item.category.toLowerCase() === categoryFilter.toLowerCase());
    }

    if (!trimmed) {
      return pool.map((item) => ({ item, score: item.isPopular ? 100 : 50 }));
    }

    const tokens = trimmed.split(/\s+/).filter(Boolean);
    const results: CheatsheetSearchResult[] = [];

    for (const item of pool) {
      let score = 0;
      let matchedField: 'command' | 'description' | 'category' | 'tags' | undefined;

      const cmdLower = item.command.toLowerCase();
      const descLower = item.description.toLowerCase();
      const catLower = item.category.toLowerCase();
      const tagsStr = item.tags.join(' ').toLowerCase();

      // Exact command or description match
      if (cmdLower.includes(trimmed)) {
        score += 80;
        matchedField = 'command';
      } else if (descLower.includes(trimmed)) {
        score += 60;
        matchedField = 'description';
      } else if (tagsStr.includes(trimmed)) {
        score += 50;
        matchedField = 'tags';
      } else if (catLower.includes(trimmed)) {
        score += 40;
        matchedField = 'category';
      }

      // Check all individual tokens
      let allTokensMatch = true;
      for (const token of tokens) {
        if (
          cmdLower.includes(token) ||
          descLower.includes(token) ||
          tagsStr.includes(token) ||
          catLower.includes(token)
        ) {
          score += 20;
        } else {
          allTokensMatch = false;
        }
      }

      // Boost popular items slightly
      if (item.isPopular) {
        score += 5;
      }

      if (score > 0 && allTokensMatch) {
        results.push({ item, score, matchedField });
      }
    }

    return results.sort((a, b) => b.score - a.score);
  }

  public getCategories(): Array<{ id: string; label: string; count: number }> {
    const counts = new Map<string, number>();
    for (const item of this.items) {
      counts.set(item.category, (counts.get(item.category) || 0) + 1);
    }

    const categories = Array.from(counts.entries()).map(([id, count]) => ({
      id,
      label: id.charAt(0).toUpperCase() + id.slice(1),
      count,
    }));

    return [{ id: 'all', label: 'All', count: this.items.length }, ...categories];
  }
}

export const searchEngine = new LocalSearchEngine();
