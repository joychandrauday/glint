import { CommandVariable } from '../types/cheatsheet.js';

const TEMPLATE_VAR_REGEX = /\{\{([a-zA-Z0-9_-]+)(?::([^}]+))?\}\}/g;

/**
 * Extracts all variable definitions from a command template string.
 * Format: `{{var_name}}` or `{{var_name:default_value}}`
 */
export function extractVariablesFromTemplate(template: string): CommandVariable[] {
  const variables: CommandVariable[] = [];
  const seen = new Set<string>();

  let match: RegExpExecArray | null;
  // Reset regex index
  TEMPLATE_VAR_REGEX.lastIndex = 0;

  while ((match = TEMPLATE_VAR_REGEX.exec(template)) !== null) {
    const name = match[1];
    const defaultValue = match[2] ?? '';

    if (!seen.has(name)) {
      seen.add(name);
      variables.push({
        name,
        label: name.replace(/[-_]/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase()),
        defaultValue,
        required: defaultValue.length === 0,
      });
    }
  }

  return variables;
}

/**
 * Replaces placeholders in a template with provided variable values.
 * If a variable is missing and no default exists, leaves the variable name highlighted or defaults to empty.
 */
export function substituteTemplateVariables(
  template: string,
  values: Record<string, string>,
  options: { preserveUnfilled?: boolean } = {}
): string {
  const { preserveUnfilled = false } = options;

  return template.replace(TEMPLATE_VAR_REGEX, (_fullMatch, varName, defaultValue) => {
    if (values[varName] !== undefined && values[varName].trim() !== '') {
      return values[varName];
    }
    if (defaultValue !== undefined && defaultValue !== '') {
      return defaultValue;
    }
    return preserveUnfilled ? `{{${varName}}}` : `<${varName}>`;
  });
}

/**
 * Normalizes a raw user natural language query for caching purposes.
 * Trims whitespace, lowercases, collapses punctuation and multi-spaces.
 */
export function normalizeQuery(query: string): string {
  return query
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/\s+/g, ' ');
}
