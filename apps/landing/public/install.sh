#!/usr/bin/env bash
set -e

# Glint CLI & Desktop Hub Installer
# https://glint.g2gdigital.com
# MIT License - G2G Digital

REPO="joychandrauday/glint"
echo "==> Glint Terminal Copilot & Knowledge Hub Installer"
echo "==> Detecting host environment..."

OS="$(uname -s | tr '[:upper:]' '[:lower:]')"
ARCH="$(uname -m)"

TARGET="$HOME/.local/bin/glint"
mkdir -p "$HOME/.local/bin"

LATEST_TAG="v0.2.20"

# Priority 1: If Node.js or Bun is installed, download the ultra-fast 519KB standalone JS bundle!
if command -v node >/dev/null 2>&1 || command -v bun >/dev/null 2>&1; then
    echo "==> Detected JavaScript runtime (Node.js/Bun). Fetching ultralight standalone bundle (519 KB)..."
    RELEASE_URL="https://github.com/${REPO}/releases/download/${LATEST_TAG}/glint"
    RAW_URL="https://raw.githubusercontent.com/${REPO}/main/apps/cli/bin/glint.js"
    if curl -fsSL "$RELEASE_URL" -o "$TARGET" || curl -fsSL "$RAW_URL" -o "$TARGET"; then
        chmod +x "$TARGET"
        echo ""
        echo "==> Glint successfully installed/updated to ${TARGET}! (v0.2.20 - BYOK AI Assistant & Token Cache)"
        echo "==> Make sure ~/.local/bin is in your PATH."
        echo "==> Run 'glint' to start your interactive AI assistant session."
        echo "==> Run 'glint --help' or 'glint cache stats' to see features."
        exit 0
    fi
fi

# Priority 2: For clean Linux systems without Node.js, download universal AppImage
if [ "$OS" = "linux" ]; then
    echo "==> Node.js not detected. Fetching universal standalone AppImage..."
    APPIMAGE_URL="https://github.com/${REPO}/releases/download/${LATEST_TAG}/Glint-0.2.14-linux-x86_64.AppImage"
    curl -fSL "$APPIMAGE_URL" -o "$TARGET"
    chmod +x "$TARGET"
    echo ""
    echo "==> Successfully installed Glint standalone AppImage to ${TARGET}!"
    echo "==> Run 'glint' to launch."
elif [ "$OS" = "darwin" ]; then
    echo "==> macOS detected. Please install Node.js (brew install node) or download the .dmg:"
    echo "==> https://github.com/${REPO}/releases/download/${LATEST_TAG}/Glint-0.2.14-mac-arm64.dmg"
else
    echo "==> Windows detected. Download the installer:"
    echo "==> https://github.com/${REPO}/releases/download/${LATEST_TAG}/Glint-0.2.14-win-x64.exe"
fi
