import { theme } from './theme.js';

export function renderParameterTable(variables: Array<{ name: string; defaultValue?: string; description?: string }>): string {
  if (!variables.length) return '';
  const lines: string[] = [theme.slate('Dynamic Parameter Placeholders:')];
  for (const v of variables) {
    const def = v.defaultValue ? theme.slate(`(default: ${v.defaultValue})`) : theme.coral('(required)');
    lines.push(`  • ${theme.cyanBold(v.name)} ${def}${v.description ? ` - ${theme.slate(v.description)}` : ''}`);
  }
  return lines.join('\n');
}
