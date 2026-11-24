import { spawn } from 'child_process';
import { text } from '@clack/prompts';
import { CheatsheetItem, extractVariablesFromTemplate, substituteTemplateVariables } from '@glint/shared';
import { theme } from '../ui/theme.js';

export async function resolveCommandVariables(item: CheatsheetItem): Promise<string> {
  const template = item.template || item.command;
  const variables = extractVariablesFromTemplate(template);

  if (!variables.length) {
    return template;
  }

  console.log(`\n${theme.slate('Interactive Parameter Resolution:')}`);
  const values: Record<string, string> = {};

  for (const v of variables) {
    const promptMsg = `${theme.cyanBold(v.name)}${v.description ? ` (${v.description})` : ''}:`;
    const input = await text({
      message: promptMsg,
      initialValue: v.defaultValue || '',
      placeholder: v.defaultValue ? `default: ${v.defaultValue}` : 'value',
      validate: (val) => {
        if (v.required && !val?.trim()) {
          return `${v.name} is required`;
        }
      },
    });

    if (typeof input === 'symbol') {
      throw new Error('User cancelled parameter prompt');
    }

    values[v.name] = (input as string).trim() || v.defaultValue || '';
  }

  return substituteTemplateVariables(template, values);
}

export function executeCommand(cmd: string): Promise<{ code: number; stdout: string; stderr: string }> {
  return new Promise((resolve) => {
    console.log(`\n${theme.slate('─── Executing ───')}\n${theme.slate('$')} ${theme.command(cmd)}\n`);
    const child = spawn(cmd, { shell: true, stdio: 'inherit' });

    child.on('close', (code) => {
      resolve({ code: code ?? 0, stdout: '', stderr: '' });
    });
  });
}
