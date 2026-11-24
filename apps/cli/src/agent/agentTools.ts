import fs from 'fs';
import path from 'path';
import { executeCommand } from '../services/runner.js';
import { searchEngine } from '../services/searchEngine.js';
import { theme } from '../ui/theme.js';

export interface ToolDefinition {
  name: string;
  description: string;
  parameters: {
    type: 'object';
    properties: Record<string, { type: string; description: string; enum?: string[] }>;
    required: string[];
  };
}

export const AGENT_TOOLS: ToolDefinition[] = [
  {
    name: 'run_command',
    description: 'Execute a bash terminal command on the host. Always explain the intent first.',
    parameters: {
      type: 'object',
      properties: {
        command: { type: 'string', description: 'The exact bash command to execute' },
        dangerLevel: {
          type: 'string',
          enum: ['safe', 'caution', 'dangerous'],
          description: 'Risk assessment of running the command',
        },
      },
      required: ['command'],
    },
  },
  {
    name: 'read_file',
    description: 'Read the contents of a text file in the workspace (safely sliced).',
    parameters: {
      type: 'object',
      properties: {
        path: { type: 'string', description: 'Relative or absolute file path to read' },
        maxLines: { type: 'string', description: 'Maximum number of lines to read (default 50)' },
      },
      required: ['path'],
    },
  },
  {
    name: 'list_dir',
    description: 'List files and directories in a given path with their sizes.',
    parameters: {
      type: 'object',
      properties: {
        dirPath: { type: 'string', description: 'Directory to list (default: current directory)' },
      },
      required: [],
    },
  },
  {
    name: 'search_vault',
    description: 'Search Glint offline cheatsheet vault for verified developer commands.',
    parameters: {
      type: 'object',
      properties: {
        query: { type: 'string', description: 'Search term e.g. "docker prune", "tar extract", "git rebase"' },
      },
      required: ['query'],
    },
  },
  {
    name: 'system_info',
    description: 'Get developer workspace info: OS, current git branch, Node/Bun/Python versions.',
    parameters: {
      type: 'object',
      properties: {},
      required: [],
    },
  },
];

export async function executeAgentTool(name: string, args: Record<string, any>): Promise<string> {
  try {
    switch (name) {
      case 'read_file': {
        const targetPath = path.resolve(process.cwd(), args.path);
        if (!fs.existsSync(targetPath)) {
          return `Error: File not found: ${args.path}`;
        }
        const stat = fs.statSync(targetPath);
        if (stat.isDirectory()) {
          return `Error: ${args.path} is a directory, use list_dir instead`;
        }
        const maxLines = parseInt(args.maxLines || '50', 10);
        const content = fs.readFileSync(targetPath, 'utf8');
        const lines = content.split('\n');
        if (lines.length > maxLines) {
          const slice = lines.slice(0, maxLines).join('\n');
          return `${slice}\n... [${lines.length - maxLines} lines truncated for token efficiency]`;
        }
        return content;
      }

      case 'list_dir': {
        const targetDir = path.resolve(process.cwd(), args.dirPath || '.');
        if (!fs.existsSync(targetDir)) return `Error: Directory not found: ${args.dirPath}`;
        const entries = fs.readdirSync(targetDir, { withFileTypes: true });
        const summary = entries
          .slice(0, 40)
          .map((e) => {
            const icon = e.isDirectory() ? '📁' : '📄';
            return `${icon} ${e.name}`;
          })
          .join('\n');
        return `Directory contents (${entries.length} items):\n${summary}`;
      }

      case 'search_vault': {
        const results = searchEngine.search(args.query || '', 3);
        if (results.length === 0) return `No cheatsheet found in vault for "${args.query}".`;
        return results
          .map((r, i) => `${i + 1}. [${r.item.category}] ${r.item.command}\n   ${r.item.description}`)
          .join('\n\n');
      }

      case 'system_info': {
        let branch = '';
        try {
          branch = fs.readFileSync(path.join(process.cwd(), '.git', 'HEAD'), 'utf8').trim();
          branch = branch.replace('ref: refs/heads/', '');
        } catch {
          branch = 'not a git repo';
        }
        return JSON.stringify({
          os: process.platform,
          arch: process.arch,
          cwd: process.cwd(),
          gitBranch: branch,
          nodeVersion: process.version,
        });
      }

      case 'run_command': {
        return `[Command execution requested: "${args.command}" with dangerLevel: "${args.dangerLevel || 'safe'}"]`;
      }

      default:
        return `Error: Unknown tool "${name}"`;
    }
  } catch (err: any) {
    return `Tool execution error: ${err.message}`;
  }
}
