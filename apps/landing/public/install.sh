#!/usr/bin/env bash
set -e

# Glint CLI & Desktop Hub Installer
# https://glint.g2gdigital.com
# MIT License - G2G Digital

REPO="joychandrauday/glint"
echo "==> Glint Terminal Copilot & Knowledge Hub Installer"
echo "==> Detecting host operating system..."

OS="$(uname -s | tr '[:upper:]' '[:lower:]')"
ARCH="$(uname -m)"

if [ "$OS" = "linux" ]; then
    echo "==> Detected Linux ($ARCH)"
    
    # Query GitHub API for the latest release assets
    LATEST_JSON=$(curl -s "https://api.github.com/repos/${REPO}/releases/latest")
    LATEST_TAG=$(echo "$LATEST_JSON" | grep '"tag_name":' | sed -E 's/.*"([^"]+)".*/\1/' || echo "v0.2.15")
    
    if [ -z "$LATEST_TAG" ]; then
        LATEST_TAG="v0.2.15"
    fi
    echo "==> Fetching Glint release ${LATEST_TAG}..."

    TARGET="$HOME/.local/bin/glint"
    mkdir -p "$HOME/.local/bin"

    # Extract browser_download_url for AppImage or fallback
    APPIMAGE_URL=$(echo "$LATEST_JSON" | grep -o 'https://[^"]*linux-x86_64.AppImage' | head -n 1)
    if [ -z "$APPIMAGE_URL" ]; then
        APPIMAGE_URL="https://github.com/${REPO}/releases/download/${LATEST_TAG}/Glint-0.2.14-linux-x86_64.AppImage"
    fi

    echo "==> Downloading Glint executable to ${TARGET}..."
    curl -fSL "$APPIMAGE_URL" -o "$TARGET" || {
        echo "==> Direct asset fetch fell back. Please download your package directly from: https://github.com/${REPO}/releases"
        exit 1
    }
    chmod +x "$TARGET"

    echo ""
    echo "==> Glint successfully installed to ${TARGET}!"
    echo "==> Make sure ~/.local/bin is in your PATH."
    echo "==> Run 'glint' in your terminal or launch it from your desktop menu."
    echo "==> Run 'glint --help' to see all available CLI commands."
elif [ "$OS" = "darwin" ]; then
    echo "==> Detected macOS ($ARCH)"
    echo "==> Download the macOS package from: https://github.com/${REPO}/releases/latest"
else
    echo "==> OS $OS is not directly supported via bash installer."
    echo "==> Please download the Windows installer (.exe) from: https://github.com/${REPO}/releases/latest"
fi
