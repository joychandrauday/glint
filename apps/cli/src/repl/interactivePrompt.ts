import readline from 'readline';
import stripAnsi from 'strip-ansi';
import { theme } from '../ui/theme.js';
import { SlashCommandDef } from './slashCommands.js';

export interface InteractivePromptOptions {
  prompt: string;
  history?: string[];
  getSuggestions: (input: string) => SlashCommandDef[];
}

export function readInteractiveLine(options: {
  prompt: string;
  history?: string[];
  getSuggestions: (input: string) => SlashCommandDef[];
}): Promise<string> {
  return new Promise((resolve) => {
    // Non-TTY fallback (pipes, automated test runners)
    if (!process.stdin.isTTY || !process.stdout.isTTY) {
      const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout,
        terminal: false,
      });
      rl.question(options.prompt, (answer) => {
        rl.close();
        resolve(answer);
      });
      return;
    }

    const history = options.history || [];
    let historyIndex = -1;
    let savedBuffer = '';

    let buffer = '';
    let cursorPos = 0;
    let selectedIndex = 0;
    let linesDrawnBelow = 0;
    let userNavigated = false;

    const promptStr = options.prompt;
    const promptVisualLen = stripAnsi(promptStr).length;
    const termWidth = Math.max(60, process.stdout.columns || 80);

    const cleanup = () => {
      process.stdin.removeListener('keypress', onKeypress);
      if (process.stdin.isTTY) {
        process.stdin.setRawMode(false);
      }
      process.stdin.pause();
    };

    const clearSuggestionsBelow = () => {
      if (linesDrawnBelow > 0) {
        // Move cursor down to lines drawn and clear up, or move down then back
        // Best practice: move up linesDrawnBelow from wherever we were
        // But since cursor is always kept on the prompt line:
        process.stdout.write(`\x1b[0J`); // clear everything below cursor line
        linesDrawnBelow = 0;
      }
    };

    const render = () => {
      // 1. Move cursor to column 0 of prompt line and clear everything below
      process.stdout.write(`\r\x1b[2K\x1b[0J`);

      // 2. Write the prompt string + current buffer
      process.stdout.write(`${promptStr}${buffer}`);

      // 3. Check for slash suggestions
      const trimmed = buffer.trim();
      const isSlash = buffer.startsWith('/');
      // Suggestions show when typing / command (before user types arguments for commands like /ask)
      const spaceIdx = buffer.indexOf(' ');
      const isTypingCommand = isSlash && (spaceIdx === -1 || spaceIdx === buffer.length - 1);

      if (isTypingCommand) {
        const matches = options.getSuggestions(buffer);
        if (matches.length > 0) {
          if (selectedIndex >= matches.length) selectedIndex = 0;
          if (selectedIndex < 0) selectedIndex = matches.length - 1;

          const maxVisible = Math.min(8, matches.length);
          let startIdx = 0;
          if (selectedIndex >= maxVisible) {
            startIdx = Math.min(selectedIndex - maxVisible + 1, matches.length - maxVisible);
          }
          const visibleMatches = matches.slice(startIdx, startIdx + maxVisible);

          const boxWidth = Math.min(78, termWidth - 4);
          const innerWidth = boxWidth - 4;

          const filterLabel = trimmed === '/' ? 'Slash Commands' : `Matching "${trimmed}"`;
          const countLabel = `(${matches.length} found)`;
          const headerTitle = ` ${filterLabel} ${countLabel} `;
          const headerDashes = Math.max(2, innerWidth - headerTitle.length);
          const headerLine = `  ${theme.cyanBold('╭──')}${theme.whiteBold(headerTitle)}${theme.cyanBold('─'.repeat(headerDashes))}${theme.cyanBold('╮')}`;

          const lines: string[] = [headerLine];

          visibleMatches.forEach((item, idx) => {
            const actualIndex = startIdx + idx;
            const isSelected = actualIndex === selectedIndex;
            const pointer = isSelected ? theme.cyanBold(' ❯ ') : theme.slate('   ');

            const cmd = isSelected ? theme.cyanBold(item.command) : theme.white(item.command);
            const args = item.args ? ' ' + theme.slate(item.args) : '';
            const cmdAndArgs = `${cmd}${args}`;
            const visualCmdLen = item.command.length + (item.args ? item.args.length + 1 : 0);

            const padLen = Math.max(2, 28 - visualCmdLen);
            const padding = ' '.repeat(padLen);

            const descText = item.description;
            const remainingWidth = innerWidth - (visualCmdLen + padLen + 4);
            const truncatedDesc = descText.length > remainingWidth
              ? descText.slice(0, remainingWidth - 3) + '...'
              : descText;

            const desc = isSelected ? theme.whiteBold(truncatedDesc) : theme.slate(truncatedDesc);
            const rightPad = Math.max(0, innerWidth - (3 + visualCmdLen + padLen + stripAnsi(desc).length));

            const row = `  ${theme.cyanBold('│')}${pointer}${cmdAndArgs}${padding}${desc}${' '.repeat(rightPad)}${theme.cyanBold('│')}`;
            lines.push(row);
          });

          const remaining = matches.length - (startIdx + visibleMatches.length);
          const footerHint = remaining > 0
            ? ` ↑↓ navigate • Tab / Enter to select • ${remaining} more `
            : ` ↑↓ navigate • Tab / Enter to select `;
          const footerDashes = Math.max(2, innerWidth - footerHint.length);
          const footerLine = `  ${theme.cyanBold('╰──')}${theme.slate(footerHint)}${theme.cyanBold('─'.repeat(footerDashes))}${theme.cyanBold('╯')}`;
          lines.push(footerLine);

          // Render suggestion lines below prompt
          for (const l of lines) {
            process.stdout.write('\n' + l);
          }

          linesDrawnBelow = lines.length;

          // Move cursor back up to prompt line
          process.stdout.write(`\x1b[${linesDrawnBelow}A`);
        } else {
          // No matches
          const boxWidth = Math.min(78, termWidth - 4);
          const innerWidth = boxWidth - 4;
          const noMatchHeader = `  ${theme.cyanBold('╭──')}${theme.whiteBold(` Commands matching "${trimmed}" `)}${theme.cyanBold('─'.repeat(Math.max(2, innerWidth - (` Commands matching "${trimmed}" `).length)))}${theme.cyanBold('╮')}`;
          const noMatchRow = `  ${theme.cyanBold('│')}   ${theme.slate('No matching commands. Type')} ${theme.cyanBold('/help')} ${theme.slate('to see all commands.')}${' '.repeat(Math.max(0, innerWidth - 52))}${theme.cyanBold('│')}`;
          const noMatchFooter = `  ${theme.cyanBold('╰──')}${theme.cyanBold('─'.repeat(innerWidth))}${theme.cyanBold('╯')}`;
          const lines = [noMatchHeader, noMatchRow, noMatchFooter];

          for (const l of lines) {
            process.stdout.write('\n' + l);
          }
          linesDrawnBelow = lines.length;
          process.stdout.write(`\x1b[${linesDrawnBelow}A`);
        }
      } else {
        linesDrawnBelow = 0;
      }

      // Position cursor correctly on the prompt line
      const targetCol = promptVisualLen + cursorPos + 1;
      process.stdout.write(`\x1b[${targetCol}G`);
    };

    const submit = (result: string) => {
      // Clear suggestions below before finalizing prompt line
      if (linesDrawnBelow > 0) {
        process.stdout.write(`\x1b[0J`);
        linesDrawnBelow = 0;
      }
      process.stdout.write('\n');
      cleanup();
      resolve(result);
    };

    const onKeypress = (_str: string, key: readline.Key) => {
      if (!key) return;

      // Ctrl + C: abort / clear line or exit
      if (key.ctrl && key.name === 'c') {
        if (buffer.length > 0) {
          buffer = '';
          cursorPos = 0;
          selectedIndex = 0;
          userNavigated = false;
          render();
          return;
        }
        clearSuggestionsBelow();
        process.stdout.write('\n' + theme.cyan('Goodbye from Glint AI Assistant! ⚡\n\n'));
        cleanup();
        process.exit(0);
      }

      // Ctrl + D: exit
      if (key.ctrl && key.name === 'd') {
        clearSuggestionsBelow();
        process.stdout.write('\n' + theme.cyan('Goodbye from Glint AI Assistant! ⚡\n\n'));
        cleanup();
        process.exit(0);
      }

      const isSlash = buffer.startsWith('/');
      const spaceIdx = buffer.indexOf(' ');
      const isTypingCommand = isSlash && (spaceIdx === -1 || spaceIdx === buffer.length - 1);
      const matches = isTypingCommand ? options.getSuggestions(buffer) : [];

      // Enter / Return
      if (key.name === 'return' || key.name === 'enter') {
        // If user was navigating suggestions or typed partial slash command
        if (isTypingCommand && matches.length > 0) {
          const selected = matches[selectedIndex];
          if (selected) {
            // If user explicitly navigated with arrows OR typed partial command like /ke or /a
            if (userNavigated || (buffer !== '/' && buffer !== selected.command)) {
              // If selected command takes no args, execute it
              // If it takes args, let it complete into buffer or submit if ready
              if (!selected.args || buffer.startsWith(selected.command)) {
                buffer = selected.command;
              } else {
                buffer = selected.command + ' ';
                cursorPos = buffer.length;
                userNavigated = false;
                render();
                return;
              }
            }
          }
        }
        submit(buffer);
        return;
      }

      // Tab: autocomplete highlighted slash command
      if (key.name === 'tab') {
        if (isTypingCommand && matches.length > 0) {
          const selected = matches[selectedIndex];
          if (selected) {
            buffer = selected.args ? `${selected.command} ` : selected.command;
            cursorPos = buffer.length;
            selectedIndex = 0;
            userNavigated = false;
            render();
            return;
          }
        }
      }

      // Up arrow
      if (key.name === 'up') {
        if (isTypingCommand && matches.length > 0) {
          userNavigated = true;
          selectedIndex = (selectedIndex - 1 + matches.length) % matches.length;
          render();
          return;
        } else if (history.length > 0) {
          // History navigation
          if (historyIndex === -1) {
            savedBuffer = buffer;
            historyIndex = history.length - 1;
          } else if (historyIndex > 0) {
            historyIndex--;
          }
          buffer = history[historyIndex] || '';
          cursorPos = buffer.length;
          selectedIndex = 0;
          userNavigated = false;
          render();
          return;
        }
      }

      // Down arrow
      if (key.name === 'down') {
        if (isTypingCommand && matches.length > 0) {
          userNavigated = true;
          selectedIndex = (selectedIndex + 1) % matches.length;
          render();
          return;
        } else if (historyIndex !== -1) {
          if (historyIndex < history.length - 1) {
            historyIndex++;
            buffer = history[historyIndex] || '';
          } else {
            historyIndex = -1;
            buffer = savedBuffer;
          }
          cursorPos = buffer.length;
          selectedIndex = 0;
          userNavigated = false;
          render();
          return;
        }
      }

      // Left arrow
      if (key.name === 'left') {
        if (cursorPos > 0) {
          cursorPos--;
          render();
        }
        return;
      }

      // Right arrow
      if (key.name === 'right') {
        if (cursorPos < buffer.length) {
          cursorPos++;
          render();
        }
        return;
      }

      // Backspace
      if (key.name === 'backspace') {
        if (cursorPos > 0) {
          buffer = buffer.slice(0, cursorPos - 1) + buffer.slice(cursorPos);
          cursorPos--;
          selectedIndex = 0;
          userNavigated = false;
          render();
        }
        return;
      }

      // Delete
      if (key.name === 'delete') {
        if (cursorPos < buffer.length) {
          buffer = buffer.slice(0, cursorPos) + buffer.slice(cursorPos + 1);
          selectedIndex = 0;
          userNavigated = false;
          render();
        }
        return;
      }

      // Escape: dismiss suggestions
      if (key.name === 'escape') {
        clearSuggestionsBelow();
        userNavigated = false;
        render();
        return;
      }

      // Printable character
      if (!key.ctrl && !key.meta && key.sequence && key.sequence.length === 1 && key.sequence >= ' ') {
        buffer = buffer.slice(0, cursorPos) + key.sequence + buffer.slice(cursorPos);
        cursorPos++;
        selectedIndex = 0;
        userNavigated = false;
        render();
        return;
      }
    };

    readline.emitKeypressEvents(process.stdin);
    process.stdin.setRawMode(true);
    process.stdin.resume();
    process.stdin.on('keypress', onKeypress);

    // Initial render
    render();
  });
}
