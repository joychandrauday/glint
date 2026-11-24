import ora, { Ora } from 'ora';
import { theme } from './theme.js';

export function createSpinner(text: string): Ora {
  return ora({
    text: theme.cyan(text),
    spinner: 'dots',
    color: 'cyan',
  });
}
