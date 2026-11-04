export type Platform = 'linux' | 'macos' | 'windows' | 'all';

export interface CommandVariable {
  name: string;
  label?: string;
  defaultValue?: string;
  description?: string;
  required?: boolean;
}

export interface CheatsheetItem {
  id: string;
  command: string;
  template: string; // Command with placeholders, e.g. "docker logs -f --tail {{lines:100}} {{container_id}}"
  description: string;
  category: string; // e.g. 'docker', 'git', 'k8s', 'networking', 'system'
  tags: string[];
  variables: CommandVariable[];
  platform: Platform;
  isPopular?: boolean;
  notes?: string;
  dangerLevel?: 'safe' | 'caution' | 'dangerous'; // e.g. rm -rf or DROP TABLE
  version?: number;
  updatedAt?: string;
}

export interface CheatsheetSearchResult {
  item: CheatsheetItem;
  score: number;
  highlightIndices?: [number, number][];
  matchedField?: 'command' | 'description' | 'category' | 'tags';
}

export interface CheatsheetCategoryMeta {
  id: string;
  title: string;
  icon: string;
  description: string;
  itemCount: number;
}
