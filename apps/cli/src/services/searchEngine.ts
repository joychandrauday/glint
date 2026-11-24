import Fuse from 'fuse.js';
import { CheatsheetItem, CheatsheetSearchResult } from '@glint/shared';
import { DEFAULT_CHEATSHEETS } from '@glint/db';
import { storage } from './storage.js';

export class SearchEngine {
  private fuse!: Fuse<CheatsheetItem>;
  private allItems: CheatsheetItem[] = [];

  constructor() {
    this.refresh();
  }

  refresh(): void {
    const custom = storage.getCustomVault();
    this.allItems = [...custom, ...DEFAULT_CHEATSHEETS];

    this.fuse = new Fuse(this.allItems, {
      keys: [
        { name: 'command', weight: 0.35 },
        { name: 'template', weight: 0.25 },
        { name: 'description', weight: 0.2 },
        { name: 'tags', weight: 0.15 },
        { name: 'category', weight: 0.05 },
      ],
      threshold: 0.4,
      ignoreLocation: true,
      includeScore: true,
    });
  }

  search(query: string, limit = 10): CheatsheetSearchResult[] {
    if (!query.trim()) {
      return this.allItems.slice(0, limit).map((item) => ({ item, score: 0 }));
    }

    const results = this.fuse.search(query, { limit });
    return results.map((r) => ({
      item: r.item,
      score: r.score ?? 1,
    }));
  }

  getCount(): number {
    return this.allItems.length;
  }
}

export const searchEngine = new SearchEngine();
