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

export function formatInlineStyles(text: string): string {
  // Inline backticks `code` -> amber bold code, NO raw backticks
  let res = text.replace(/`([^`]+)`/g, (_m, p1) => theme.amberBold(p1));
  // Bold **text** -> bold white, NO raw asterisks
  res = res.replace(/\*\*([^*]+)\*\*/g, (_m, p1) => pc.bold(pc.white(p1)));
  // Italic *text* or _text_ -> italic
  res = res.replace(/(\*|_)(.*?)\1/g, (_m, _p, p2) => pc.italic(p2));
  // Links [text](url) -> cyan text with dim url
  res = res.replace(/\[([^\]]+)\]\(([^)]+)\)/g, (_m, t, url) => `${theme.cyan(t)} ${pc.dim(`(${url})`)}`);
  return res;
}

export function highlightCodeLine(line: string, _lang?: string): string {
  // Highlight bash comments
  if (/^\s*#/.test(line)) {
    return theme.slate(line);
  }
  // Highlight shell prompt commands ($ foo ...)
  if (/^\s*\$\s+/.test(line)) {
    return `${theme.slate('$')} ${theme.cyanBold(line.replace(/^\s*\$\s+/, ''))}`;
  }
  // Highlight common bash keywords/flags
  let highlighted = line
    .replace(/\b(sudo|curl|tar|docker|git|npm|bun|pnpm|cargo|kubectl|apt|systemctl|grep|find|cat|awk|sed|ssh|chmod|chown)\b/g, (m) => theme.cyanBold(m))
    .replace(/(\s)(--?[\w-]+)/g, (_m, p1, p2) => `${p1}${theme.amber(p2)}`)
    .replace(/(".*?"|'.*?')/g, (m) => theme.green(m));

  return highlighted;
}

export class StreamingMarkdownRenderer {
  private buffer = '';
  private inCodeBlock = false;
  private codeBlockLang = '';
  private prefix: string;

  constructor(prefix = '│  ') {
    this.prefix = prefix;
  }

  push(chunk: string): void {
    this.buffer += chunk;
    while (this.buffer.includes('\n')) {
      const idx = this.buffer.indexOf('\n');
      const line = this.buffer.slice(0, idx);
      this.buffer = this.buffer.slice(idx + 1);
      this.renderLine(line);
    }
  }

  flush(): void {
    if (this.buffer.length > 0) {
      this.renderLine(this.buffer);
      this.buffer = '';
    }
    if (this.inCodeBlock) {
      this.inCodeBlock = false;
      const border = theme.slate('╰──────────────────────────────────────────────────');
      process.stdout.write(`${this.prefix}${border}\n`);
    }
  }

  private renderLine(rawLine: string): void {
    const line = rawLine.replace(/\r$/, '');

    // Code block opening or closing
    if (line.trim().startsWith('```')) {
      if (this.inCodeBlock) {
        this.inCodeBlock = false;
        const border = theme.slate('╰──────────────────────────────────────────────────');
        process.stdout.write(`${this.prefix}${border}\n`);
      } else {
        this.inCodeBlock = true;
        this.codeBlockLang = line.replace(/`+/g, '').trim().toUpperCase() || 'CODE';
        const title = ` ${theme.cyanBold(this.codeBlockLang)} `;
        const topBorder = `${theme.slate('╭──')}${title}${theme.slate('─'.repeat(Math.max(10, 48 - this.codeBlockLang.length)))}`;
        process.stdout.write(`${this.prefix}${topBorder}\n`);
      }
      return;
    }

    if (this.inCodeBlock) {
      const highlighted = highlightCodeLine(line, this.codeBlockLang);
      process.stdout.write(`${this.prefix}${theme.slate('│  ')}${highlighted}\n`);
      return;
    }

    // Markdown Headers: strip # and render styled section titles
    if (line.startsWith('# ')) {
      const text = line.replace(/^#\s+/, '');
      process.stdout.write(`${this.prefix}${theme.cyanBold('⚡ ' + formatInlineStyles(text))}\n`);
      return;
    }
    if (line.startsWith('## ')) {
      const text = line.replace(/^##\s+/, '');
      process.stdout.write(`${this.prefix}${theme.magenta(pc.bold('■ ' + formatInlineStyles(text)))}\n`);
      return;
    }
    if (line.startsWith('### ')) {
      const text = line.replace(/^###\s+/, '');
      process.stdout.write(`${this.prefix}${theme.amber(pc.bold('◆ ' + formatInlineStyles(text)))}\n`);
      return;
    }
    if (line.startsWith('#### ')) {
      const text = line.replace(/^####\s+/, '');
      process.stdout.write(`${this.prefix}${theme.whiteBold(formatInlineStyles(text))}\n`);
      return;
    }

    // Horizontal Rule
    if (/^(\-{3,}|\*{3,}|_{3,})$/.test(line.trim())) {
      process.stdout.write(`${this.prefix}${theme.slate('──────────────────────────────────────────')}\n`);
      return;
    }

    // Bullet points (* or -) -> strip * / - and show clean bullet dot
    const bulletMatch = line.match(/^(\s*)([\*\-])\s+(.*)/);
    if (bulletMatch) {
      const indent = bulletMatch[1] || '';
      const text = bulletMatch[3];
      process.stdout.write(`${this.prefix}${indent}${theme.cyan('•')} ${formatInlineStyles(text)}\n`);
      return;
    }

    // Numbered list
    const numMatch = line.match(/^(\s*)(\d+)\.\s+(.*)/);
    if (numMatch) {
      const indent = numMatch[1] || '';
      const num = numMatch[2];
      const text = numMatch[3];
      process.stdout.write(`${this.prefix}${indent}${theme.cyan(num + '.')} ${formatInlineStyles(text)}\n`);
      return;
    }

    // Blockquote
    if (line.startsWith('> ')) {
      const text = line.replace(/^>\s+/, '');
      process.stdout.write(`${this.prefix}${theme.slate('▎ ')}${theme.slate(formatInlineStyles(text))}\n`);
      return;
    }

    // Empty line
    if (!line.trim()) {
      process.stdout.write(`${this.prefix}\n`);
      return;
    }

    // Normal text line
    process.stdout.write(`${this.prefix}${formatInlineStyles(line)}\n`);
  }
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
