export type DetectedOS = 'linux' | 'windows' | 'mac' | 'unknown';

export interface SecondaryDownload {
  name: string;
  url: string;
  platform: string;
}

export interface OSDownloadInfo {
  os: DetectedOS;
  label: string;
  downloadUrl: string;
  cliUrl: string;
  secondaryDownloads: SecondaryDownload[];
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

export function getDownloadInfo(os: DetectedOS, desktopVersion = '0.2.14', releaseTag = 'v0.2.20'): OSDownloadInfo {
  const linuxDeb = `https://github.com/joychandrauday/glint/releases/download/${releaseTag}/Glint-${desktopVersion}-linux-amd64.deb`;
  const linuxAppImage = `https://github.com/joychandrauday/glint/releases/download/${releaseTag}/Glint-${desktopVersion}-linux-x86_64.AppImage`;
  const windowsExe = `https://github.com/joychandrauday/glint/releases/download/${releaseTag}/Glint-${desktopVersion}-win-x64.exe`;
  const macDmg = `https://github.com/joychandrauday/glint/releases/download/${releaseTag}/Glint-${desktopVersion}-mac-arm64.dmg`;
  const cliUrl = `https://github.com/joychandrauday/glint/releases/download/${releaseTag}/glint`;

  switch (os) {
    case 'windows':
      return {
        os,
        label: 'Download for Windows (.exe)',
        downloadUrl: windowsExe,
        cliUrl,
        secondaryDownloads: [
          { name: 'Linux .deb', url: linuxDeb, platform: 'Linux' },
          { name: 'Linux .AppImage', url: linuxAppImage, platform: 'Linux' },
          { name: 'macOS (.dmg)', url: macDmg, platform: 'macOS' },
        ],
      };
    case 'mac':
      return {
        os,
        label: 'Download for macOS (.dmg)',
        downloadUrl: macDmg,
        cliUrl,
        secondaryDownloads: [
          { name: 'Linux .deb', url: linuxDeb, platform: 'Linux' },
          { name: 'Linux .AppImage', url: linuxAppImage, platform: 'Linux' },
          { name: 'Windows (.exe)', url: windowsExe, platform: 'Windows' },
        ],
      };
    case 'linux':
    default:
      return {
        os: 'linux',
        label: 'Download for Linux (.deb)',
        downloadUrl: linuxDeb,
        cliUrl,
        secondaryDownloads: [
          { name: 'Linux .AppImage', url: linuxAppImage, platform: 'Linux' },
          { name: 'Windows (.exe)', url: windowsExe, platform: 'Windows' },
          { name: 'macOS (.dmg)', url: macDmg, platform: 'macOS' },
        ],
      };
  }
}
