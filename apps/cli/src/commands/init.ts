import { theme } from '../ui/theme.js';

export function generateShellInit(shell: string): string {
  const target = shell.toLowerCase();

  if (target === 'zsh') {
    return `# Glint ZSH Integration
# Add this line to your ~/.zshrc:
#   eval "$(glint init zsh)"

_glint_widget() {
  local selected
  selected=$(glint search 2>&1)
  if [[ -n "$selected" ]]; then
    LBUFFER="\${LBUFFER}\${selected}"
  fi
  zle reset-prompt
}
zle -N _glint_widget
bindkey '^G' _glint_widget
`;
  }

  if (target === 'bash') {
    return `# Glint Bash Integration
# Add this line to your ~/.bashrc:
#   eval "$(glint init bash)"

_glint_widget() {
  local selected
  selected=$(glint search 2>&1)
  READLINE_LINE="\${READLINE_LINE:0:\$READLINE_POINT}\${selected}\${READLINE_LINE:\$READLINE_POINT}"
  READLINE_POINT=\$((READLINE_POINT + \${#selected}))
}
bind -x '"\\C-g": _glint_widget'
`;
  }

  return theme.slate(`Shell "${shell}" not directly supported. Available: zsh, bash`);
}
