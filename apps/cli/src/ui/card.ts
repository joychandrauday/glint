import boxen from 'boxen';
import { theme } from './theme.js';
import { CheatsheetItem } from '@glint/shared';

export function renderCommandCard(item: CheatsheetItem, options: { isAI?: boolean; resolvedCommand?: string } = {}): string {
  const { isAI = false, resolvedCommand } = options;
  const badge = isAI ? theme.badgeAI() : theme.badgeFast();
  const dangerBadge = theme.formatDanger(item.dangerLevel);
  const displayCmd = resolvedCommand ?? item.template ?? item.command;

  const header = `${badge} ${dangerBadge} ${theme.slate(`category: ${item.category}`)}${item.tags?.length ? theme.slate(` [${item.tags.join(', ')}]`) : ''}`;
  const cmdLine = `${theme.slate('$')} ${theme.command(displayCmd)}`;
  const descLine = `${theme.white(item.description)}`;
  
  let content = `${header}\n\n${cmdLine}\n\n${descLine}`;
  
  if (item.notes) {
    content += `\n${theme.slate(`Note: ${item.notes}`)}`;
  }

  const borderColor = item.dangerLevel === 'dangerous' ? 'red' : item.dangerLevel === 'caution' ? 'yellow' : 'cyan';

  return boxen(content, {
    padding: { top: 0, bottom: 0, left: 1, right: 1 },
    margin: { top: 0, bottom: 1, left: 0, right: 0 },
    borderStyle: 'round',
    borderColor,
  });
}

export function renderErrorCard(title: string, error: string, suggestion?: string): string {
  let content = `${theme.coralBold('🩺 Terminal Error Doctor Diagnosis')}\n\n${theme.slate('Problem:')} ${theme.white(title)}\n${theme.slate('Details:')} ${theme.coral(error)}`;
  
  if (suggestion) {
    content += `\n\n${theme.greenBold('Suggested Fix:')}\n${theme.slate('$')} ${theme.command(suggestion)}`;
  }

  return boxen(content, {
    padding: { top: 0, bottom: 0, left: 1, right: 1 },
    margin: { top: 1, bottom: 1, left: 0, right: 0 },
    borderStyle: 'round',
    borderColor: 'red',
  });
}

export function renderToolCard(toolName: string, title: string, body: string): string {
  const content = `${theme.badgeTool(toolName.toUpperCase())} ${theme.bold(title)}\n\n${body}`;
  return boxen(content, {
    padding: { top: 0, bottom: 0, left: 1, right: 1 },
    margin: { top: 0, bottom: 1, left: 0, right: 0 },
    borderStyle: 'round',
    borderColor: 'magenta',
  });
}
