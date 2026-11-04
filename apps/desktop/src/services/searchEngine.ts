import { CheatsheetItem, CheatsheetSearchResult } from '@glint/shared';
import { localCommandDb } from './localCommandDb';

export class LocalSearchEngine {
  public search(query: string, categoryFilter?: string): CheatsheetSearchResult[] {
    return localCommandDb.search(query, categoryFilter);
  }

  public getCategories(): Array<{ id: string; label: string; count: number }> {
    return localCommandDb.getCategories();
  }

  public learn(query: string, item: Partial<CheatsheetItem> & { command: string; description: string }) {
    return localCommandDb.learnCommand(query, item);
  }

  public getStats() {
    return localCommandDb.getStats();
  }
}

export const searchEngine = new LocalSearchEngine();
