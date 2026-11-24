import { spawn } from 'child_process';

export function copyToClipboard(text: string): Promise<boolean> {
  return new Promise((resolve) => {
    let proc;
    if (process.platform === 'darwin') {
      proc = spawn('pbcopy');
    } else if (process.platform === 'win32') {
      proc = spawn('clip');
    } else {
      // Linux: Try wl-copy or xclip
      proc = spawn('wl-copy');
      proc.on('error', () => {
        const xclip = spawn('xclip', ['-selection', 'clipboard']);
        xclip.on('error', () => resolve(false));
        xclip.stdin.write(text);
        xclip.stdin.end();
        xclip.on('close', (code) => resolve(code === 0));
      });
    }

    if (proc) {
      proc.on('error', () => resolve(false));
      proc.stdin.write(text);
      proc.stdin.end();
      proc.on('close', (code) => resolve(code === 0));
    }
  });
}
