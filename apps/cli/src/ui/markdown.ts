import pc from 'picocolors';
import boxen from 'boxen';
import { theme } from './theme.js';

export function renderMarkdown(content: string): string {
  const lines = content.split('\n');
  const formatted: string[] = [];
  let inCodeBlock = false;
  let codeBlockLang = '';
  let codeBlockBuffer: string[] = [];

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];

    // Code block opening or closing
    if (line.startsWith('```')) {
      if (inCodeBlock) {
        // Closing code block
        inCodeBlock = false;
        const codeText = codeBlockBuffer.join('\n');
        const boxed = boxen(codeText, {
          title: codeBlockLang ? ` ${codeBlockLang.toUpperCase()} ` : undefined,
          titleAlignment: 'left',
          padding: 0,
          margin: { top: 0, bottom: 0, left: 1, right: 1 },
          borderStyle: 'round',
          borderColor: 'cyan',
        });
        formatted.push(boxed);
        codeBlockBuffer = [];
        codeBlockLang = '';
      } else {
        // Opening code block
        inCodeBlock = true;
        codeBlockLang = line.replace('```', '').trim();
        codeBlockBuffer = [];
      }
      continue;
    }

    if (inCodeBlock) {
      // Highlight syntax inside code block
      codeBlockBuffer.push(highlightCodeLine(line, codeBlockLang));
      continue;
    }

    // Markdown headers
    if (line.startsWith('# ')) {
      formatted.push(`\n${theme.cyanBold(line.replace(/^#\s+/, '⚡ '))}`);
      continue;
    }
    if (line.startsWith('## ')) {
      formatted.push(`\n${theme.magenta(pc.bold(line.replace(/^##\s+/, '■ ')))}`);
      continue;
    }
    if (line.startsWith('### ')) {
      formatted.push(`\n${theme.amber(pc.bold(line.replace(/^###\s+/, '◆ ')))}`);
      continue;
    }

    // Bullet points
    if (/^[\*\-]\s+/.test(line)) {
      const rest = line.replace(/^[\*\-]\s+/, '');
      formatted.push(`  ${theme.cyan('•')} ${formatInlineStyles(rest)}`);
      continue;
    }

    // Numbered list
    if (/^\d+\.\s+/.test(line)) {
      const match = line.match(/^(\d+)\.\s+(.*)/);
      if (match) {
        formatted.push(`  ${theme.cyan(match[1] + '.')} ${formatInlineStyles(match[2])}`);
        continue;
      }
    }

    // Blockquote
    if (line.startsWith('> ')) {
      formatted.push(`  ${theme.slate('│')} ${theme.slate(line.replace(/^>\s+/, ''))}`);
      continue;
    }

    // Standard text line with inline formatting
    formatted.push(formatInlineStyles(line));
  }

  // Handle unclosed code block if streaming ended abruptly
  if (inCodeBlock && codeBlockBuffer.length > 0) {
    formatted.push(boxen(codeBlockBuffer.join('\n'), { borderStyle: 'round', borderColor: 'cyan' }));
  }

  return formatted.join('\n');
}

function formatInlineStyles(text: string): string {
  // Inline backticks `code`
  let res = text.replace(/`([^`]+)`/g, (_m, p1) => pc.yellow(pc.bold(p1)));
  // Bold **text**
  res = res.replace(/\*\*([^*]+)\*\*/g, (_m, p1) => pc.bold(p1));
  // Links [text](url)
  res = res.replace(/\[([^\]]+)\]\(([^)]+)\)/g, (_m, text, url) => `${pc.cyan(text)} ${pc.dim(`(${url})`)}`);
  return res;
}

function highlightCodeLine(line: string, _lang: string): string {
  // Highlight bash comments
  if (/^\s*#/.test(line)) {
    return pc.dim(line);
  }
  // Highlight shell commands (lines starting with $ or common tools)
  if (/^\s*\$\s+/.test(line)) {
    return `${pc.dim('$')} ${pc.cyan(pc.bold(line.replace(/^\s*\$\s+/, '')))}`;
  }
  return pc.white(line);
}

export function renderTokenPill(
  meta: {
    tokens: number;
    latencyMs?: number;
    cached?: boolean;
    provider?: string;
    model?: string;
    savedUSD?: number;
  },
  prefix = '╰─'
): string {
  const parts: string[] = [];

  if (meta.cached) {
    parts.push(pc.bgCyan(pc.black(pc.bold(' ⚡ CACHED (0 TOKENS) '))));
  } else {
    parts.push(theme.slate(`⚡ ${meta.tokens} tokens`));
  }

  if (meta.latencyMs !== undefined) {
    const sec = (meta.latencyMs / 1000).toFixed(2);
    parts.push(theme.slate(`${sec}s`));
  }

  if (meta.provider && meta.model) {
    parts.push(theme.slate(`${meta.provider}:${meta.model}`));
  }

  if (meta.cached && meta.savedUSD && meta.savedUSD > 0) {
    parts.push(theme.green(`saved ~$${meta.savedUSD.toFixed(4)}`));
  }

  return `${theme.slate(prefix)} ${parts.join(theme.slate(' • '))}`;
}
