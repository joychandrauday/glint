import React, { useState } from 'react';
import { Copy, Check, Terminal } from 'lucide-react';

interface CodeBlockProps {
  code: string;
  language?: string;
  className?: string;
}

export const CodeBlock: React.FC<CodeBlockProps> = ({
  code,
  language = 'bash',
  className = '',
}) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = (e: React.MouseEvent) => {
    e.stopPropagation();
    const textToCopy = code.trim();
    if (typeof window !== 'undefined' && (window as any).glintDesktop?.writeClipboard) {
      (window as any).glintDesktop.writeClipboard(textToCopy);
    } else if (navigator?.clipboard?.writeText) {
      navigator.clipboard.writeText(textToCopy);
    }
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className={`my-2 rounded-xl border border-slate-200 dark:border-glint-border/80 bg-slate-900 text-slate-100 overflow-hidden shadow-xs select-text ${className}`}>
      {/* Code Header Bar */}
      <div className="flex items-center justify-between px-3 py-1.5 bg-slate-950/70 border-b border-slate-800 text-[10px] font-mono text-slate-400">
        <div className="flex items-center gap-1.5">
          <Terminal className="w-3 h-3 text-glint-lime" />
          <span className="uppercase tracking-wider font-semibold text-slate-300">
            {language}
          </span>
        </div>

        <button
          onClick={handleCopy}
          className="flex items-center gap-1 px-2 py-0.5 rounded-md bg-slate-800 hover:bg-glint-violet hover:text-white transition-colors text-slate-300 active:scale-95 cursor-pointer"
          title="Copy code to clipboard"
        >
          {copied ? (
            <>
              <Check className="w-3 h-3 text-glint-lime" />
              <span className="text-[10px] text-glint-lime font-bold">Copied!</span>
            </>
          ) : (
            <>
              <Copy className="w-3 h-3" />
              <span>Copy</span>
            </>
          )}
        </button>
      </div>

      {/* Code Body */}
      <div className="p-3 overflow-x-auto text-[11px] font-mono leading-relaxed selection:bg-glint-violet selection:text-white">
        <pre className="whitespace-pre">{code.trim()}</pre>
      </div>
    </div>
  );
};

interface FormattedMessageProps {
  text: string;
}

export const FormattedMessage: React.FC<FormattedMessageProps> = ({ text }) => {
  // Parse triple-backtick fenced blocks: ```lang ... ```
  const codeBlockRegex = /```([a-zA-Z0-9_-]*)\n?([\s\S]*?)```/g;

  const parts: React.ReactNode[] = [];
  let lastIndex = 0;
  let match: RegExpExecArray | null;

  while ((match = codeBlockRegex.exec(text)) !== null) {
    const textBefore = text.slice(lastIndex, match.index);
    if (textBefore) {
      parts.push(
        <span key={`text-${lastIndex}`} className="whitespace-pre-line">
          {renderInlineFormatting(textBefore)}
        </span>
      );
    }

    const language = match[1] || 'bash';
    const codeContent = match[2];
    parts.push(
      <CodeBlock
        key={`code-${match.index}`}
        code={codeContent}
        language={language}
      />
    );

    lastIndex = match.index + match[0].length;
  }

  const remainingText = text.slice(lastIndex);
  if (remainingText) {
    parts.push(
      <span key={`text-remaining`} className="whitespace-pre-line">
        {renderInlineFormatting(remainingText)}
      </span>
    );
  }

  return <div className="leading-relaxed select-text">{parts}</div>;
};

export const InlineCommandChip: React.FC<{ command: string }> = ({ command }) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = (e: React.MouseEvent) => {
    e.stopPropagation();
    const textToCopy = command.trim();
    if (typeof window !== 'undefined' && (window as any).glintDesktop?.writeClipboard) {
      (window as any).glintDesktop.writeClipboard(textToCopy);
    } else if (navigator?.clipboard?.writeText) {
      navigator.clipboard.writeText(textToCopy);
    }
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <span className="inline-flex items-center gap-1.5 px-2 py-0.5 mx-1 my-0.5 rounded-lg bg-slate-100 dark:bg-glint-space border border-slate-300 dark:border-glint-border/80 font-mono text-[11px] font-semibold text-glint-violet dark:text-glint-lime shadow-2xs group/cmd align-middle">
      <span className="select-text">{command}</span>
      <button
        onClick={handleCopy}
        className="p-0.5 rounded hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-400 hover:text-glint-violet dark:hover:text-glint-lime transition-all cursor-pointer"
        title={`Copy "${command}"`}
        type="button"
      >
        {copied ? (
          <Check className="w-3 h-3 text-emerald-500 dark:text-glint-lime" />
        ) : (
          <Copy className="w-3 h-3" />
        )}
      </button>
    </span>
  );
};

// Helper for inline commands, shortcuts, `code`, and **bold**
function renderInlineFormatting(content: string): React.ReactNode[] {
  const inlineRegex =
    /(`[^`]+`|\*\*[^*]+\*\*|\b(?:sudo\s+)?(?:nano|vim|vi|emacs)\s+[a-zA-Z0-9_.\-/]+|(?:Ctrl|Cmd|Alt)\+[A-Za-z0-9]|\b(?:Esc|Escape)\b|:(?:wq|q!|w|q)\b|\bpress\s+[a-zA-Z]\s+to\b|(?:\bStep\s+\d+:?))/gi;

  const nodes: React.ReactNode[] = [];
  let last = 0;
  let m: RegExpExecArray | null;

  while ((m = inlineRegex.exec(content)) !== null) {
    const before = content.slice(last, m.index);
    if (before) nodes.push(before);

    const token = m[1] || m[0];

    // 1. Backtick enclosed token
    if (token.startsWith('`') && token.endsWith('`')) {
      const codeText = token.slice(1, -1);
      const isCmd = /^(?:sudo\s+)?(?:nano|vim|vi|emacs|[a-z0-9_-]+)\s+\S+/i.test(codeText);
      const isShortcut = /^(?:(?:Ctrl|Cmd|Alt)\+[A-Za-z0-9]|Esc|Escape|:[a-z!]+|[a-z])$/i.test(codeText);

      if (isCmd) {
        nodes.push(<InlineCommandChip key={`cmd-bt-${m.index}`} command={codeText} />);
      } else if (isShortcut) {
        nodes.push(
          <kbd
            key={`kbd-bt-${m.index}`}
            className="inline-block px-1.5 py-0.5 mx-0.5 rounded-md bg-slate-200 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 font-mono text-[10px] font-bold text-slate-800 dark:text-slate-200 shadow-2xs align-middle"
          >
            {codeText}
          </kbd>
        );
      } else {
        nodes.push(
          <code
            key={`inline-code-${m.index}`}
            className="px-1.5 py-0.5 mx-0.5 rounded-md bg-slate-100 dark:bg-glint-space font-mono text-[11px] text-glint-violet dark:text-glint-lime border border-slate-200 dark:border-glint-border/60"
          >
            {codeText}
          </code>
        );
      }
    }
    // 2. Bold text
    else if (token.startsWith('**') && token.endsWith('**')) {
      nodes.push(
        <strong key={`bold-${m.index}`} className="font-semibold text-slate-900 dark:text-white">
          {token.slice(2, -2)}
        </strong>
      );
    }
    // 3. Step label
    else if (/^Step\s+\d+:?/i.test(token)) {
      nodes.push(
        <span
          key={`step-${m.index}`}
          className="inline-block px-1.5 py-0.2 mx-0.5 rounded-md bg-glint-violet/10 text-glint-violet dark:text-glint-cyan border border-glint-violet/20 font-mono text-[10px] font-bold align-middle"
        >
          {token}
        </span>
      );
    }
    // 4. "press X to" -> highlight single key
    else if (/^press\s+[a-zA-Z]\s+to$/i.test(token)) {
      const parts = token.split(/\s+/);
      const keyChar = parts[1];
      nodes.push(
        <span key={`press-to-${m.index}`} className="inline-flex items-center gap-1 mx-0.5 align-middle">
          <span>press</span>
          <kbd className="px-1.5 py-0.5 rounded-md bg-slate-200 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 font-mono text-[10px] font-bold text-slate-800 dark:text-slate-200 shadow-2xs">
            {keyChar}
          </kbd>
          <span>to</span>
        </span>
      );
    }
    // 5. Keyboard shortcuts (Ctrl+O, Esc, :wq, etc.)
    else if (/^(?:(?:Ctrl|Cmd|Alt)\+[A-Za-z0-9]|Esc|Escape|:(?:wq|q!|w|q))$/i.test(token)) {
      nodes.push(
        <kbd
          key={`kbd-${m.index}`}
          className="inline-block px-1.5 py-0.5 mx-0.5 rounded-md bg-slate-200 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 font-mono text-[10px] font-bold text-slate-800 dark:text-slate-200 shadow-2xs align-middle"
        >
          {token}
        </kbd>
      );
    }
    // 6. Natural language command (e.g. nano filename, vim filename)
    else if (/^(?:sudo\s+)?(?:nano|vim|vi|emacs)\s+\S+/i.test(token)) {
      nodes.push(<InlineCommandChip key={`cmd-${m.index}`} command={token} />);
    } else {
      nodes.push(token);
    }

    last = m.index + token.length;
  }

  const end = content.slice(last);
  if (end) nodes.push(end);

  return nodes;
}
