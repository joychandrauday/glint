#!/usr/bin/env bash
# Build Windows executables on Linux using wine.
set -e

# Ensure wine is installed
if ! command -v wine >/dev/null 2>&1; then
  echo "Wine not found. Please install wine manually (apt install wine) and re-run the script."
  exit 1
fi

# Install dependencies
npm ci

# Build TypeScript
npm run build

# Package for Windows (NSIS installer and portable)
npm run package:win
