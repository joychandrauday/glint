# Glint ⚡

<p align="center">
  <img src="brand/glint-logo.svg" alt="Glint Logo" width="320"/>
</p>

<p align="center">
  <strong>Lightweight, context-aware command-line cheatsheet overlay and AI assistant for engineers.</strong><br/>
  Instant desktop overlay, interactive variable substitution, multi-provider LLM cascade, and color-coded safety tiers.
</p>

<p align="center">
  <a href="https://github.com/joychandrauday/glint/releases"><img src="https://img.shields.io/badge/Platforms-Linux%20%7C%20Windows-blue?style=flat-square&logo=linux&logoColor=white" alt="Platforms"/></a>
  <a href="https://github.com/joychandrauday/glint/releases"><img src="https://img.shields.io/badge/Package-AppImage%20%7C%20deb%20%7C%20exe%20%7C%20winget-brightgreen?style=flat-square" alt="Package Formats"/></a>
  <a href="https://nodejs.org"><img src="https://img.shields.io/badge/Node.js-%3E%3D%2020.0.0-339933?style=flat-square&logo=node.js&logoColor=white" alt="Node.js"/></a>
  <a href="https://www.typescriptlang.org"><img src="https://img.shields.io/badge/TypeScript-5.7-3178C6?style=flat-square&logo=typescript&logoColor=white" alt="TypeScript"/></a>
  <a href="https://www.electronjs.org"><img src="https://img.shields.io/badge/Electron-45.2-47848F?style=flat-square&logo=electron&logoColor=white" alt="Electron"/></a>
  <a href="https://react.dev"><img src="https://img.shields.io/badge/React-19.0-61DAFB?style=flat-square&logo=react&logoColor=black" alt="React 19"/></a>
  <a href="LICENSE"><img src="https://img.shields.io/badge/License-MIT-purple?style=flat-square" alt="License"/></a>
</p>

---

## 📑 Table of Contents

- [Overview](#-overview)
- [🚀 Quick Install](#-quick-install)
  - [🪟 Windows (Winget & Installer)](#-windows-winget--installer)
  - [🐧 Linux (Debian/Ubuntu, AppImage, AUR, Snap)](#-linux-debianubuntu-appimage-aur-snap)
- [📖 Full Tutorial & User Guide](#-full-tutorial--user-guide)
  - [1. Summoning & Floating Chat Head](#1-summoning--floating-chat-head)
  - [2. Instant Cheatsheet Search & Categories](#2-instant-cheatsheet-search--categories)
  - [3. Interactive Variable Parameter Filling](#3-interactive-variable-parameter-filling)
  - [4. Color-Coded Danger Levels](#4-color-coded-danger-levels)
  - [5. AI Assistant & Multi-LLM Cascade](#5-ai-assistant--multi-llm-cascade)
  - [6. Free vs Pro Tiers & BYOK](#6-free-vs-pro-tiers--byok)
- [⌨️ Keyboard Shortcuts](#️-keyboard-shortcuts)
- [📦 Distribution & Packaging Playbook](#-distribution--packaging-playbook)
- [🛠️ Contributing & Local Development](#️-contributing--local-development)
- [🔧 Troubleshooting & FAQ](#-troubleshooting--faq)
- [📄 License](#-license)

---

## ⚡ Overview

**Glint** is an engineer's companion that floats unobtrusively on your desktop as a sleek neon "chat head". Whenever you need a CLI command—whether it's an obscure `iptables` rule, a multi-container `docker run` invocation, or a complex `kubectl` rollout—summon Glint instantly with `Ctrl+Space` or `Alt+Space`.

Key capabilities:
- **Zero-Friction Summoning**: Runs as a lightweight always-on-top overlay. Click the floating neon orb or press a global hotkey to expand or collapse.
- **Interactive Template Parameters**: Edit inline parameters (e.g. `{{host_port:8080}}`) directly within the UI and copy the dynamically constructed command with a single click.
- **Safety Tiers**: Every command displays a color-coded danger rating (**Safe**, **Caution**, or **Dangerous**) to prevent accidental production outages.
- **Multi-LLM Cascading AI Assistant**: If a command isn't in your local cheatsheet, query the AI engine. Glint automatically cascades from **Groq** (`llama-3.3-70b-versatile`) to **Google Gemini** (`gemini-2.5-flash`) to **Cloudflare Workers AI**, backed by a sub-10ms SHA-256 semantic query cache.

---

## 🚀 Quick Install

### 🪟 Windows (Winget & Installer)

#### Via Windows Package Manager (Winget):
```powershell
winget install Glint.Glint
```

#### Via Direct Installer (`.exe`):
1. Download `Glint-0.1.3-win-x64.exe` from the [Releases page](https://github.com/joychandrauday/glint/releases/latest).
2. Double-click the installer and complete the setup wizard.
3. Glint will appear floating in the bottom-right corner of your desktop screen.

> [!NOTE]
> **Windows SmartScreen**: If prompted with *"Windows protected your PC"*, click **"More info"** $\to$ **"Run anyway"**. Glint is 100% open-source and free of telemetry/adware.

---

### 🐧 Linux (Debian/Ubuntu, AppImage, AUR, Snap)

#### 1. Debian / Ubuntu / Pop!_OS / Linux Mint (`.deb`):
```bash
wget https://github.com/joychandrauday/glint/releases/download/v0.1.3/Glint-0.1.3-linux-amd64.deb
sudo apt install ./Glint-0.1.3-linux-amd64.deb
glint
```

#### 2. Universal Linux (`.AppImage`):
```bash
wget https://github.com/joychandrauday/glint/releases/download/v0.1.3/Glint-0.1.3-linux-x86_64.AppImage
chmod +x Glint-0.1.3-linux-x86_64.AppImage
./Glint-0.1.3-linux-x86_64.AppImage
```

> [!NOTE]
> Modern Linux distributions (Ubuntu 22.04+/24.04+, Fedora 36+) require FUSE 2 for AppImages:
> ```bash
> sudo apt install libfuse2       # Ubuntu / Debian / Pop!_OS / Mint
> sudo dnf install fuse-libs      # Fedora / RHEL
> sudo pacman -S fuse2            # Arch Linux
> ```

#### 3. Arch Linux (AUR):
```bash
yay -S glint-bin
```

#### 4. Snap Store (Ubuntu Software):
```bash
sudo snap install glint
```

---

## 📖 Full Tutorial & User Guide

### 1. Summoning & Floating Chat Head

```text
[ Desktop Screen ]
┌────────────────────────────────────────────────────────┐
│                                                        │
│                                                        │
│                                           ┌──────────┐ │
│                                           │  ⚡ (40) │ │ <-- Floating Neon Bubble
│                                           └──────────┘ │
└────────────────────────────────────────────────────────┘
                    │ Click or Press Ctrl+Space / Alt+Space
                    ▼
┌────────────────────────────────────────────────────────┐
│                                    ┌─────────────────┐ │
│                                    │  Glint Cheats   │ │
│                                    │ 🔍 [Search...]  │ │
│                                    │ [Docker][K8s].. │ │
│                                    │ > docker run... │ │
│                                    │ > git stash...  │ │
│                                    │ 💬 Ask AI...    │ │
│                                    └─────────────────┘ │
└────────────────────────────────────────────────────────┘
```

- **Floating Mode (Chat Head)**:
  - When minimized, Glint docks as a neon purple/cyan orb (`40x40px`) in the bottom-right corner of your screen.
  - It stays always-on-top of your active IDEs and terminals without stealing focus or cluttering the taskbar.
  - You can click and drag the orb anywhere on your screen.
- **Summon / Dismiss Hotkeys**:
  - Press `Ctrl + Space` or `Alt + Space` from any application to instantly summon or dismiss the expanded window.
  - Pressing `Esc` or clicking outside returns Glint to chat head mode.

---

### 2. Instant Cheatsheet Search & Categories

When expanded, Glint provides instantaneous fuzzy searching over curated command sets:

1. **Category Chips**:
   - Filter by clicking: `All`, `Docker`, `Kubernetes`, `Git`, `Linux`, or `Networking`.
2. **Search Input**:
   - Type keywords like `prune`, `rebase`, `port-forward`, `subnet`, or `kill`.
   - Results filter in real time with syntax-highlighted commands and concise explanations.

---

### 3. Interactive Variable Parameter Filling

Glint turns static cheatsheets into dynamic command generators using the `{{param:default}}` syntax:

```text
docker run -d -p {{host_port:8080}}:{{container_port:80}} --name {{container_name:my-app}} {{image:nginx:latest}}
```

1. **Inline Form Fields**:
   - Variables appear as highlighted, editable text boxes inside the command card.
2. **Real-time Synchronization**:
   - As you type in `host_port` (e.g. `3000`) or `image` (e.g. `redis:alpine`), the raw command preview updates immediately.
3. **1-Click Copy**:
   - Click the **Copy** button (or press `Enter` while focused).
   - The formatted command is copied directly to your clipboard with visual confirmation.
   - Paste directly into your terminal (`Ctrl+V` or `Ctrl+Shift+V`).

---

### 4. Color-Coded Danger Levels

Every command in Glint is labeled with a clear, color-coded safety level:

| Level | Badge | Description | Example |
| :--- | :--- | :--- | :--- |
| **Safe** | 🟢 Emerald | Read-only inspection commands with zero risk of state loss. | `docker ps -a`, `git status`, `kubectl get pods` |
| **Caution** | 🟡 Amber | Modifies state, stops services, or rewrites non-destructive history. | `docker restart <id>`, `git stash drop`, `systemctl reload` |
| **Dangerous** | 🔴 Rose | Irreversible or destructive actions that delete containers, volumes, or branches. | `docker system prune -a --volumes`, `git reset --hard HEAD~1` |

---

### 5. AI Assistant & Multi-LLM Cascade

When you need a command that isn't in the default cheatsheet, switch to the **Ask AI** tab or enter a natural language prompt:

```text
"How do I find which process is listening on port 5432 and kill it?"
```

Glint utilizes an intelligent backend cascade:
1. **Local Semantic Heuristic Cache**: Checks if the query has been answered before (<10ms instant response).
2. **Primary Provider (Groq)**: Generates sub-second responses via `llama-3.3-70b-versatile` or `llama-3.1-8b-instant`.
3. **Fallback 1 (Google Gemini)**: Seamlessly takes over using `gemini-2.5-flash` if rate limits or network issues occur.
4. **Fallback 2 (Cloudflare Workers AI)**: High-availability edge model (`@cf/meta/llama-3-8b-instruct`).
5. **Offline Fallback**: Heuristic command synthesis if offline.

---

### 6. Free vs Pro Tiers & BYOK

| Plan | Price | Features |
| :--- | :--- | :--- |
| **Guest / Free** | \$0 | 10 offline queries in Guest mode; unlimited cheatsheets and 15 daily AI queries upon free sign-in. |
| **BYOK (Bring Your Own Key)** | \$0 | Connect your personal Groq/OpenAI key or local **Ollama** (`localhost:11434`) for unlimited AI queries at zero cost. |
| **Glint Pro** | \$8/mo | Unlimited managed AI queries (Claude 3.5 Sonnet / GPT-4o / Groq 70B), multi-step runbooks, and cross-device sync. |

---

## ⌨️ Keyboard Shortcuts

| Shortcut | Context | Action |
| :--- | :--- | :--- |
| `Ctrl + Space` / `Alt + Space` | Global (Anywhere) | Toggle Glint overlay between Chat Head and Expanded mode |
| `Esc` | Glint Window | Collapse expanded overlay back to floating Chat Head |
| `Tab` | Glint Window | Cycle between variable input fields in command templates |
| `Enter` | Variable Field | Copy finalized command to clipboard |
| `/` | Glint Window | Focus the search input field |

---

## 📦 Distribution & Packaging Playbook

Are you distributing Glint across package managers or launching on developer channels? See our dedicated guide:
👉 **[DISTRIBUTION.md](docs/DISTRIBUTION.md)** for complete playbooks covering:
- Windows Winget & Scoop submission
- Arch AUR (`PKGBUILD`) & Snapcraft publication
- Auto-updates setup with `electron-updater`
- Hacker News (Show HN) & Product Hunt launch templates

---

## 🛠️ Contributing & Local Development

Want to build Glint from source, add cheatsheets, or contribute to the desktop overlay?
👉 Check out **[CONTRIBUTING.md](CONTRIBUTING.md)** for:
- Monorepo structure & workspace commands
- Local environment setup (`.env.example`)
- Running live dev servers (`npm run dev:desktop`, `dev:gateway`, etc.)
- Packaging Linux (`npm run package:linux`) and Windows (`npm run package:win`) binaries
- Running test suites (`npm test`) and typechecks (`npm run typecheck`)

---

## 🔧 Troubleshooting & FAQ

### Linux

<details>
<summary><strong>Q: AppImage says "dlopen(): error loading libfuse.so.2"</strong></summary>

Modern Linux distributions (Ubuntu 22.04+, Fedora 36+) do not include FUSE 2 by default. Run:
```bash
sudo apt install libfuse2       # Debian / Ubuntu / Mint / Pop!_OS
sudo dnf install fuse-libs      # Fedora / RHEL
sudo pacman -S fuse2            # Arch Linux
```
</details>

<details>
<summary><strong>Q: apt says "Error: Unsupported file ./Glint-*.deb given on commandline"</strong></summary>

This occurs when `apt` cannot find the `.deb` file in your current working directory.
- **If you built from source**, specify the relative path from the project root or use the absolute path:
  ```bash
  sudo apt install ./apps/desktop/release/Glint-0.1.3-linux-amd64.deb
  # Or navigate directly:
  cd apps/desktop/release && sudo apt install ./Glint-0.1.3-linux-amd64.deb
  ```
- **If you downloaded from GitHub Releases**, ensure you are in the directory where the file was downloaded:
  ```bash
  cd ~/Downloads
  sudo apt install ./Glint-0.1.3-linux-amd64.deb
  ```
</details>

<details>
<summary><strong>Q: Black background or transparency issues on Wayland</strong></summary>

Glint includes Electron command-line flags (`--enable-transparent-visuals`, `--ozone-platform=x11`, `--disable-gpu-sandbox`) to ensure crisp transparency on both X11 and Wayland via XWayland. If you experience visual artifacts on Wayland, start Glint with:
```bash
glint --ozone-platform=wayland --enable-transparent-visuals
```
</details>

### Windows

<details>
<summary><strong>Q: "Windows protected your PC" (SmartScreen) warning</strong></summary>

Because Glint is an open-source project without an expensive Microsoft EV certificate, SmartScreen shows an unrecognized app warning. Click **"More info"** $\to$ **"Run anyway"**. You can inspect the source code in `apps/desktop` to verify its integrity.
</details>

<details>
<summary><strong>Q: Global hotkey (Ctrl+Space) is intercepted by another tool</strong></summary>

Glint registers both `Ctrl+Space` and `Alt+Space` simultaneously. If an IME (Input Method Editor) or power toy claims `Ctrl+Space`, `Alt+Space` will activate Glint. You can also click the floating neon orb at any time.
</details>

---

## 📄 License

Distributed under the MIT License. See [LICENSE](LICENSE) for details.
