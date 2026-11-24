import { execSync } from 'child_process';
import path from 'path';

export interface WorkspaceContext {
  cwd: string;
  gitBranch?: string;
}

export function getWorkspaceContext(): WorkspaceContext {
  const cwd = process.cwd();
  let gitBranch: string | undefined;

  try {
    gitBranch = execSync('git rev-parse --abbrev-ref HEAD 2>/dev/null', { encoding: 'utf8' }).trim();
  } catch {
    // Not a git repo
  }

  return {
    cwd: path.basename(cwd) === '' ? cwd : path.basename(cwd),
    gitBranch,
  };
}
