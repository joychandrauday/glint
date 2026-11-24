import boxen from 'boxen';
import { theme } from './theme.js';

export function renderBanner(version = '0.2.17'): string {
  const title = `${theme.cyanBold('⚡ GLINT')} ${theme.slate(`v${version}`)} ${theme.slate('•')} ${theme.cyan('Terminal AI Co-Pilot & Knowledge Hub')}`;
  const tagline = theme.slate('Zero-latency terminal co-pilot, local prompt cache & developer cheatsheets.');

  return boxen(`${title}\n${tagline}`, {
    padding: { top: 0, bottom: 0, left: 1, right: 1 },
    margin: { top: 1, bottom: 1, left: 0, right: 0 },
    borderColor: 'cyan',
    borderStyle: 'round',
  });
}

export function renderSessionHeader(context: {
  cwd: string;
  gitBranch?: string;
  provider: string;
  model: string;
  mode: string;
  vaultCount: number;
  cacheCount: number;
}): string {
  const line1 = `${theme.cyanBold('⚡ GLINT AI ASSISTANT')}  ${theme.slate('•')}  ${theme.amber(`[${context.mode.toUpperCase()}]`)}  ${theme.slate('•')}  ${theme.slate('Type / for commands, Ctrl+D to exit')}`;
  const line2 = `${theme.slate('Workspace:')} ${theme.white(context.cwd)}${context.gitBranch ? ` ${theme.cyan(`(${context.gitBranch})`)}` : ''}`;
  const line3 = `${theme.slate('BYOK Engine:')} ${theme.amberBold(context.provider.toUpperCase())} ${theme.slate(`[${context.model}]`)}  ${theme.slate('•')}  ${theme.slate('Cache:')} ${theme.green(`${context.cacheCount} cached`)}  ${theme.slate('•')}  ${theme.slate('Vault:')} ${theme.cyan(`${context.vaultCount} snippets`)}`;

  return boxen(`${line1}\n${line2}\n${line3}`, {
    padding: 0,
    margin: { top: 0, bottom: 1, left: 0, right: 0 },
    borderColor: 'cyan',
    borderStyle: 'round',
  });
}
