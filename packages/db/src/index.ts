import cheatsheetsSeed from '../seeds/cheatsheets.json' with { type: 'json' };
import { CheatsheetItem } from '@glint/shared';

export const DEFAULT_CHEATSHEETS: CheatsheetItem[] = cheatsheetsSeed as unknown as CheatsheetItem[];

export interface DatabaseEnv {
  DATABASE_URL: string;
  SUPABASE_URL?: string;
  SUPABASE_SERVICE_ROLE_KEY?: string;
  SUPABASE_ANON_KEY?: string;
}
