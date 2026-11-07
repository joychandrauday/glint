#!/usr/bin/env bash
set -e

# Glint CLI / Desktop Installer
# https://glint.g2gdigital.com
# MIT License - G2G Digital

REPO="joychandrauday/glint"
echo "==> Glint Developer Desktop Overlay Installer"
echo "==> Detecting host operating system..."

OS="$(uname -s | tr '[:upper:]' '[:lower:]')"
ARCH="$(uname -m)"

if [ "$OS" = "linux" ]; then
    echo "==> Detected Linux ($ARCH)"
    LATEST_TAG=$(curl -s "https://api.github.com/repos/${REPO}/releases/latest" | grep '"tag_name":' | sed -E 's/.*"([^"]+)".*/\1/' || echo "v0.2.0")
    if [ -z "$LATEST_TAG" ]; then
        LATEST_TAG="v0.2.0"
    fi
    echo "==> Fetching Glint release ${LATEST_TAG}..."

    DOWNLOAD_URL="https://github.com/${REPO}/releases/download/${LATEST_TAG}/Glint-${LATEST_TAG#v}-x86_64.AppImage"
    TARGET="$HOME/.local/bin/glint"
    mkdir -p "$HOME/.local/bin"

    echo "==> Downloading AppImage to ${TARGET}..."
    curl -fSL "$DOWNLOAD_URL" -o "$TARGET" || {
        echo "==> Direct asset fetch fell back. Please download your package directly from: https://github.com/${REPO}/releases"
        exit 1
    }
    chmod +x "$TARGET"

    echo ""
    echo "==> Glint successfully installed to ${TARGET}"
    echo "==> Make sure ~/.local/bin is in your PATH."
    echo "==> Run 'glint' or launch it from your desktop application menu."
elif [ "$OS" = "darwin" ]; then
    echo "==> Detected macOS ($ARCH)"
    echo "==> Download the macOS .dmg package from: https://github.com/${REPO}/releases/latest"
else
    echo "==> OS $OS is not directly supported via bash installer."
    echo "==> Please download the Windows installer from: https://github.com/${REPO}/releases/latest"
fi
