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
    LATEST_TAG=$(curl -s "https://api.github.com/repos/${REPO}/releases/latest" | grep '"tag_name":' | sed -E 's/.*"([^"]+)".*/\1/' || echo "v0.2.14")
    if [ -z "$LATEST_TAG" ]; then
        LATEST_TAG="v0.2.14"
    fi
    echo "==> Fetching Glint release ${LATEST_TAG}..."

    TARGET="$HOME/.local/bin/glint"
    mkdir -p "$HOME/.local/bin"

    DOWNLOAD_URL="https://github.com/${REPO}/releases/download/${LATEST_TAG}/glint-linux-x64"
    TAR_URL="https://github.com/${REPO}/releases/download/${LATEST_TAG}/glint-cli-linux-x64.tar.gz"
    APPIMAGE_URL="https://github.com/${REPO}/releases/download/${LATEST_TAG}/Glint-${LATEST_TAG#v}-linux-x86_64.AppImage"

    echo "==> Downloading Glint binary to ${TARGET}..."
    if curl -fSL "$DOWNLOAD_URL" -o "$TARGET" 2>/dev/null; then
        echo "==> Downloaded standalone Glint binary."
    elif curl -fSL "$TAR_URL" -o /tmp/glint-cli.tar.gz 2>/dev/null; then
        tar -xzf /tmp/glint-cli.tar.gz -C "$HOME/.local/bin"
        rm -f /tmp/glint-cli.tar.gz
        echo "==> Extracted Glint CLI binary from archive."
    elif curl -fSL "$APPIMAGE_URL" -o "$TARGET" 2>/dev/null; then
        echo "==> Downloaded Glint AppImage."
    else
        echo "==> Direct asset fetch fell back. Please download your package directly from: https://github.com/${REPO}/releases"
        exit 1
    fi
    chmod +x "$TARGET"

    echo ""
    echo "==> Glint successfully installed to ${TARGET}!"
    echo "==> Make sure ~/.local/bin is in your PATH."
    echo "==> Run 'glint' to start your interactive terminal session."
    echo "==> Run 'glint --help' to see all available commands and micro-tools."
elif [ "$OS" = "darwin" ]; then
    echo "==> Detected macOS ($ARCH)"
    echo "==> Download the macOS package from: https://github.com/${REPO}/releases/latest"
else
    echo "==> OS $OS is not directly supported via bash installer."
    echo "==> Please download the Windows installer (.exe) from: https://github.com/${REPO}/releases/latest"
fi
