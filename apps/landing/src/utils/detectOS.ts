export type DetectedOS = 'linux' | 'windows' | 'mac' | 'unknown';

export interface OSDownloadInfo {
  os: DetectedOS;
  label: string;
  downloadUrl: string;
  secondaryDownloads: Array<{
    name: string;
    url: string;
    platform: string;
  }>;
}

export function detectOS(): DetectedOS {
  if (typeof window === 'undefined') return 'linux';

  const userAgent = window.navigator.userAgent.toLowerCase();
  const platform = (
    ((window.navigator as unknown as { userAgentData?: { platform?: string } }).userAgentData?.platform) ||
    window.navigator.platform ||
    ''
  ).toLowerCase();

  if (platform.includes('win') || userAgent.includes('windows')) {
    return 'windows';
  }
  if (platform.includes('mac') || userAgent.includes('macintosh') || userAgent.includes('mac os')) {
    return 'mac';
  }
  if (platform.includes('linux') || userAgent.includes('linux') || userAgent.includes('x11')) {
    return 'linux';
  }

  return 'unknown';
}

export function getDownloadInfo(os: DetectedOS, version = '0.2.10'): OSDownloadInfo {
  const linuxDeb = `https://github.com/joychandrauday/glint/releases/download/v${version}/Glint-${version}-linux-amd64.deb`;
  const linuxAppImage = `https://github.com/joychandrauday/glint/releases/download/v${version}/Glint-${version}-linux-x86_64.AppImage`;
  const windowsExe = `https://github.com/joychandrauday/glint/releases/download/v${version}/Glint-${version}-win-x64.exe`;
  const macDmg = `https://github.com/joychandrauday/glint/releases/download/v${version}/Glint-${version}-mac-arm64.dmg`;

  switch (os) {
    case 'windows':
      return {
        os,
        label: 'Download for Windows (.exe)',
        downloadUrl: windowsExe,
        secondaryDownloads: [
          { name: 'Linux .deb (Ubuntu/Debian)', url: linuxDeb, platform: 'Linux' },
          { name: 'Linux .AppImage (Universal)', url: linuxAppImage, platform: 'Linux' },
          { name: 'macOS Apple Silicon (.dmg)', url: macDmg, platform: 'macOS' },
        ],
      };
    case 'mac':
      return {
        os,
        label: 'Download for macOS (.dmg)',
        downloadUrl: macDmg,
        secondaryDownloads: [
          { name: 'Linux .deb (Ubuntu/Debian)', url: linuxDeb, platform: 'Linux' },
          { name: 'Linux .AppImage (Universal)', url: linuxAppImage, platform: 'Linux' },
          { name: 'Windows Installer (.exe)', url: windowsExe, platform: 'Windows' },
        ],
      };
    case 'linux':
    default:
      return {
        os: 'linux',
        label: 'Download for Linux (.deb)',
        downloadUrl: linuxDeb,
        secondaryDownloads: [
          { name: 'Linux .AppImage (Universal)', url: linuxAppImage, platform: 'Linux' },
          { name: 'Windows Installer (.exe)', url: windowsExe, platform: 'Windows' },
          { name: 'macOS Apple Silicon (.dmg)', url: macDmg, platform: 'macOS' },
        ],
      };
  }
}
