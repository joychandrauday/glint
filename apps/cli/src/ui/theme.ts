import pc from 'picocolors';

// Glint Brand Palette:
// Electric Cyan: deterministic, local vault, zero cost
// Warm Amber: AI generation, reasoning
// Crimson Coral: dangerous actions, errors, rate limits
// Slate Gray: muted info, timestamps, borders

export const theme = {
  cyan: (s: string) => pc.cyan(s),
  cyanBold: (s: string) => pc.bold(pc.cyan(s)),
  amber: (s: string) => pc.yellow(s),
  amberBold: (s: string) => pc.bold(pc.yellow(s)),
  coral: (s: string) => pc.red(s),
  coralBold: (s: string) => pc.bold(pc.red(s)),
  slate: (s: string) => pc.dim(s),
  bold: (s: string) => pc.bold(s),
  green: (s: string) => pc.green(s),
  greenBold: (s: string) => pc.bold(pc.green(s)),
  magenta: (s: string) => pc.magenta(s),
  white: (s: string) => pc.white(s),
  whiteBold: (s: string) => pc.bold(pc.white(s)),

  badgeFast: () => pc.bgCyan(pc.black(pc.bold(' ⚡ FAST '))),
  badgeAI: () => pc.bgYellow(pc.black(pc.bold(' ✦ AI '))),
  badgeSafe: () => pc.bgGreen(pc.black(pc.bold(' SAFE '))),
  badgeCaution: () => pc.bgYellow(pc.black(pc.bold(' CAUTION '))),
  badgeDanger: () => pc.bgRed(pc.white(pc.bold(' DANGEROUS '))),
  badgeTool: (name: string) => pc.bgMagenta(pc.white(pc.bold(` ${name} `))),

  formatDanger(level?: 'safe' | 'caution' | 'dangerous'): string {
    if (level === 'dangerous') return theme.badgeDanger();
    if (level === 'caution') return theme.badgeCaution();
    return theme.badgeSafe();
  },

  command(cmd: string): string {
    return pc.bold(pc.cyan(cmd));
  },

  highlightVar(variable: string): string {
    return pc.bgBlack(pc.yellow(`{{${variable}}}`));
  }
};
