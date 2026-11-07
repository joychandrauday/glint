#!/usr/bin/env node
import fs from 'fs';
import path from 'path';

/**
 * Generates Microsoft Winget v1.6 manifest files for Glint desktop releases.
 * Usage: node scripts/distribution/winget/generate-manifest.js <version> <sha256>
 */

const version = process.argv[2] || '0.2.14';
const sha256 = process.argv[3] || 'REPLACE_WITH_SHA256_HASH';

const outDir = path.resolve(process.cwd(), `dist/winget/manifests/g/Glint/Glint/${version}`);
fs.mkdirSync(outDir, { recursive: true });

const versionManifest = `PackageIdentifier: Glint.Glint
PackageVersion: ${version}
DefaultLocale: en-US
ManifestType: version
ManifestVersion: 1.6.0
`;

const installerManifest = `PackageIdentifier: Glint.Glint
PackageVersion: ${version}
MinimumOSVersion: 10.0.0.0
InstallerType: nullsoft
Scope: user
InstallModes:
  - interactive
  - silent
UpgradeBehavior: install
Commands:
  - glint
Protocols:
  - glint
Installers:
  - Architecture: x64
    InstallerUrl: https://github.com/joychandrauday/glint/releases/download/v${version}/Glint-${version}-win-x64.exe
    InstallerSha256: ${sha256}
    InstallerType: nullsoft
ManifestType: installer
ManifestVersion: 1.6.0
`;

const localeManifest = `PackageIdentifier: Glint.Glint
PackageVersion: ${version}
PackageLocale: en-US
Publisher: Glint Contributors
PublisherUrl: https://glint.g2gdigital.com
PublisherSupportUrl: https://github.com/joychandrauday/glint/issues
PackageName: Glint
PackageUrl: https://glint.g2gdigital.com
License: MIT
LicenseUrl: https://github.com/joychandrauday/glint/blob/main/LICENSE
Copyright: Copyright (c) 2026 Glint Contributors
ShortDescription: Lightweight, context-aware command-line cheatsheet overlay & AI copilot
Description: |
  Glint is an always-on-top developer desktop HUD. Summon instant runbooks,
  debug terminal errors, and query local or cloud models in less than two milliseconds.
  Zero operational API debt with first-class BYOK and offline storage.
Moniker: glint
Tags:
  - cli
  - terminal
  - cheatsheet
  - developer-tools
  - productivity
  - ai
  - byok
ManifestType: defaultLocale
ManifestVersion: 1.6.0
`;

fs.writeFileSync(path.join(outDir, 'Glint.Glint.yaml'), versionManifest);
fs.writeFileSync(path.join(outDir, 'Glint.Glint.installer.yaml'), installerManifest);
fs.writeFileSync(path.join(outDir, 'Glint.Glint.locale.en-US.yaml'), localeManifest);

console.log(`[Winget Generator] Successfully created manifests in: ${outDir}`);
console.log(`[Winget Generator] To test locally: winget validate --manifest ${outDir}`);
