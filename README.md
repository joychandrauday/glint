# Glint ⚡

<p align="center">
  <img src="brand/glint-logo.svg" alt="Glint Logo" width="320"/>
</p>

<p align="center">
  <strong>The Developer's Lightweight Desktop Command Cheatsheet, AI Copilot & Execution Hub.</strong><br/>
  Always-on-top overlay, BYOK multi-provider engine, dynamic parameter pills, terminal error doctor, interactive micro-tools, and automated offline knowledge vault.
</p>

<p align="center">
  <a href="https://github.com/joychandrauday/glint/releases"><img src="https://img.shields.io/badge/Platforms-Linux%20%7C%20Windows%20%7C%20macOS-blue?style=flat-square&logo=linux&logoColor=white" alt="Platforms"/></a>
  <a href="https://github.com/joychandrauday/glint/releases"><img src="https://img.shields.io/badge/Release-v0.2.0-emerald?style=flat-square" alt="Version"/></a>
  <a href="https://github.com/joychandrauday/glint/releases"><img src="https://img.shields.io/badge/Package-AppImage%20%7C%20deb%20%7C%20exe-brightgreen?style=flat-square" alt="Package Formats"/></a>
  <a href="https://nodejs.org"><img src="https://img.shields.io/badge/Node.js-%3E%3D%2020.0.0-339933?style=flat-square&logo=node.js&logoColor=white" alt="Node.js"/></a>
  <a href="https://www.typescriptlang.org"><img src="https://img.shields.io/badge/TypeScript-5.7-3178C6?style=flat-square&logo=typescript&logoColor=white" alt="TypeScript"/></a>
  <a href="https://www.electronjs.org"><img src="https://img.shields.io/badge/Electron-45.2-47848F?style=flat-square&logo=electron&logoColor=white" alt="Electron"/></a>
  <a href="https://react.dev"><img src="https://img.shields.io/badge/React-19.0-61DAFB?style=flat-square&logo=react&logoColor=black" alt="React 19"/></a>
  <a href="LICENSE"><img src="https://img.shields.io/badge/License-MIT-purple?style=flat-square" alt="License"/></a>
</p>

---

## 📑 Table of Contents

- [⚡ Overview](#-overview)
- [✨ Key Features](#-key-features)
  - [1. 📦 Preseeded Local Data Vault (<2ms Recall)](#1--preseeded-local-data-vault-2ms-recall)
  - [2. 🌤️ Generalized AI Helper & Live Weather](#2--generalized-ai-helper--live-weather)
  - [3. 🔑 Bring Your Own Key (BYOK) Engine & Resilient Cascade](#3--bring-your-own-key-byok-engine--resilient-cascade)
  - [4. 💾 100% Automated Offline Saving (<5ms Recall)](#4--100-automated-offline-saving-5ms-recall)
  - [5. 🩺 Terminal Error Doctor ("Fix My Error")](#5--terminal-error-doctor-fix-my-error)
  - [6. ⚡ Interactive Dynamic Execution Cards](#6--interactive-dynamic-execution-cards)
  - [7. 🧰 Micro-Tools (Regex Tester & Cron Calculator)](#7--micro-tools-regex-tester--cron-calculator)
  - [8. 📋 Multi-Step Runbook Checklists](#8--multi-step-runbook-checklists)
  - [9. 🎨 Modern Dark Monochrome Aesthetic & Typography](#9--modern-dark-monochrome-aesthetic--typography)
- [🚀 Installation & Quick Start](#-installation--quick-start)
  - [🐧 Linux (Debian / Ubuntu / Mint / Pop!_OS)](#-linux-debian--ubuntu--mint--pop_os)
  - [🐧 Linux (Standalone AppImage)](#-linux-standalone-appimage)
  - [🪟 Windows (.exe installer)](#-windows-exe-installer)
- [⌨️ Keyboard Ergonomics](#️-keyboard-ergonomics)
- [🛠️ Tech Stack & Architecture](#️-tech-stack--architecture)
- [📦 Development & Packaging](#-development--packaging)
- [📄 License](#-license)

---

## ⚡ Overview

**Glint** floats unobtrusively on your desktop as an always-on-top mascot or collapsible chat head. Whenever you need an obscure `iptables` rule, Docker run command, kubernetes rollback, regex pattern, or diagnosis for a crashed build, summon Glint instantly via `Ctrl+Space`.

With **v0.2.0**, Glint evolves into a **generalized, personalized developer AI assistant**:
- **📦 Preseeded Offline Data Vault**: 38+ curated developer commands & cheatsheets with intent mapping for instant $<2\text{ms}$ recall with zero network calls.
- **🌤️ Generalized AI Helper**: Ask for live weather, concepts, or explanations and get real human-friendly answers without forced shell commands or bash scripts.
- **🔑 Resilient AI Cascade & Quota Guard**: Seamlessly uses your personal BYOK key (Groq, Gemini, Ollama, OpenAI, OpenRouter); if your personal key encounters an error, Glint automatically falls back to system managed AI. Free users enjoy 15 daily queries before BYOK recommendations appear.
- **💾 Automated Offline Memory**: Every query and answer is locally indexed for offline access.
- **🎨 Modern Developer Typography**: Monospaced parameters and sleek zinc aesthetic.

---

## ✨ Key Features

### 1. 📦 Preseeded Local Data Vault (<2ms Recall)
- Pre-populated with 38+ curated Linux, Git, Docker, Python, and Node tasks.
- Advanced intent and synonym mapping (e.g. `"give me linux command for copy a file"`, `"move file"`, `"disk space"`, `"public ip"`) resolves directly from the offline vault in $<2\text{ms}$ with zero API calls.

### 2. 🌤️ Generalized AI Helper & Live Weather
- Natural language questions (e.g. `"today's weather"`, general concepts) return rich, human-friendly responses.
- Live weather updates fetched on demand with current temperature, humidity, wind, and location details—no unwanted bash code or CLI scripts unless explicitly asked for.

### 3. 🔑 Bring Your Own Key (BYOK) Engine & Resilient Cascade
Skip rate limits and avoid third-party server costs:
- ⚡ **Groq**: Ultra-fast responses (300+ tok/s) using `llama-3.3-70b-versatile` or `llama-3.1-8b-instant`.
- ✨ **Google Gemini**: Generous free tier via `gemini-2.0-flash` or `gemini-1.5-pro`.
- 🦙 **Local Ollama**: 100% private, offline AI running on `http://localhost:11434` (`llama3.2`, `qwen2.5-coder`). Automatically detects running Ollama instances and enumerates installed models.
- 🧠 **OpenAI**: `gpt-4o-mini`, `gpt-4o`.
- 🌐 **OpenRouter**: Access 100+ open-source models with a single unified key.
- 🛡️ **Fault-Tolerant Fallback**: If your BYOK provider throws a rate-limit or key error, Glint seamlessly answers via the managed system AI and displays a non-blocking warning notice.
- 📊 **Quota Guard**: 15 free system AI queries per day; BYOK users enjoy unlimited queries with zero banners.

### 2. 💾 100% Automated Offline Saving (<5ms Recall)
- No manual "Save" button required.
- Every command generated, terminal fix diagnosed, runbook prescribed, and knowledge answer is **instantly saved to your local indexed database**.
- Future repeat searches load from local memory instantly without network latency.
- Visual **`Auto-saved`** indicator on generated cards.

### 3. 🩺 Terminal Error Doctor ("Fix My Error")
- Click the **`🩺 Fix Error`** button in the quick action toolbar.
- Glint inspects your clipboard for compiler errors or stack traces (Python, Rust, Docker, Node, Go, Bash).
- Returns a structured 3-part prescription:
  1. **Root Cause**: Crisp 1-2 sentence explanation of why it failed.
  2. **Exact Copy-Ready Fix**: Single command or patch to resolve the issue.
  3. **Prevention Pro-Tip**: Best practice rule to prevent recurrence.

### 4. 💾 100% Automated Offline Saving (<5ms Recall)
- No manual "Save" button required.
- Every command generated, terminal fix diagnosed, runbook prescribed, and knowledge answer is **instantly saved to your local indexed database**.
- Future repeat searches load from local memory instantly without network latency.
- Visual **`Auto-saved`** indicator on generated cards.

### 5. 🩺 Terminal Error Doctor ("Fix My Error")
- Click the **`🩺 Fix Error`** button in the quick action toolbar.
- Glint inspects your clipboard for compiler errors or stack traces (Python, Rust, Docker, Node, Go, Bash).
- Returns a structured 3-part prescription:
  1. **Root Cause**: Crisp 1-2 sentence explanation of why it failed.
  2. **Exact Copy-Ready Fix**: Single command or patch to resolve the issue.
  3. **Prevention Pro-Tip**: Best practice rule to prevent recurrence.

### 6. ⚡ Interactive Dynamic Execution Cards
- Commands with placeholders (e.g. `{{port}}`, `{{path}}`, `{{app_name}}`) render as **live interactive variable inputs**.
- Typing replacement values updates the previewed command in real time before you copy.
- **Color-Coded Safety Badges**:
  - `SAFE`: Non-destructive queries (e.g. `docker ps`, `ls`, `git status`).
  - `CAUTION`: Potentially disruptive actions (e.g. `kill-port`, `systemctl restart`).
  - `DESTRUCTIVE`: Potentially irreversible operations (`rm -rf`, `DROP TABLE`, `mkfs`) with explicit warning banners.

### 7. 🧰 Micro-Tools (Regex Tester & Cron Calculator)
- **Inline Regex Tester**: Type test strings live with instant match status, pattern flags, and group breakdown.
- **Cron Schedule Calculator**: Human-readable schedule explanation with projected timestamps for the next 5 executions.

### 8. 📋 Multi-Step Runbook Checklists
- Converts complex multi-step workflows (e.g. initiating Docker for a project, deploying SSL certs, database migrations) into interactive step-by-step checklists.
- Individual 1-click copy action per step command with interactive completion checkboxes.

### 9. 🎨 Modern Dark Monochrome Aesthetic & Typography
- Obsidian and zinc neutral tones (`zinc-950`, `zinc-900`, `zinc-800`).
- Modern font stack: **Inter** for UI copy, **JetBrains Mono** for all code blocks, variables, and terminal snippets.
- Clean high-contrast surfaces without neon rainbow distractions.

---

## 🚀 Installation & Quick Start

### 🐧 Linux (Debian / Ubuntu / Mint / Pop!_OS)

Download the `.deb` package from [Releases](https://github.com/joychandrauday/glint/releases) and install:

```bash
sudo dpkg -i release/Glint-0.2.0-linux-amd64.deb
glint
```

*Note: The Debian package includes an automatic binary wrapper ensuring proper X11/XWayland display server bindings across modern Linux desktop environments.*

### 🐧 Linux (Standalone AppImage)

```bash
chmod +x release/Glint-0.2.0-linux-x86_64.AppImage
./release/Glint-0.2.0-linux-x86_64.AppImage
```

### 🪟 Windows (.exe installer)

Download `Glint-0.1.9-windows-setup.exe` from [Releases](https://github.com/joychandrauday/glint/releases) and run the installer.

---

## ⌨️ Keyboard Ergonomics

| Shortcut | Action |
|:---|:---|
| `Ctrl + Space` / `Alt + Space` | Toggle Glint overlay window |
| `Enter` | Send prompt to AI co-pilot |
| `Esc` | Collapse chat window into floating mascot |
| `/byok` or `/keys` | Open BYOK provider configuration |
| `/clear` | Start fresh chat session |

---

## 🛠️ Tech Stack & Architecture

- **Desktop Framework**: Electron 45.2 (Chromium 134 + Node.js 22 runtime)
- **Renderer**: React 19, TypeScript 5.7, Tailwind CSS, Vite 6
- **Typography**: Inter & JetBrains Mono (Google Fonts + system fallbacks)
- **Offline Storage**: Dexie / IndexedDB (`localCommandDb`, `chatSessionDb`)
- **AI Routing Engine**:
  - BYOK Direct HTTP dispatch (Groq, Gemini, Ollama, OpenAI, OpenRouter)
  - Offline Heuristic Generator (Docker runbooks, regex patterns, cron tools, error doctoring)
- **Window Management**: High-frequency (~80fps) native hardware cursor polling via Electron `screen.getCursorScreenPoint()`

---

## 📦 Development & Packaging

```bash
# Clone repository
git clone https://github.com/joychandrauday/glint.git
cd glint

# Install workspace dependencies
npm install

# Run typechecks across all monorepo packages
npm run typecheck

# Start desktop app in development mode
npm run dev:desktop

# Package Linux binaries (.deb and .AppImage)
npm --workspace=@glint/desktop run package:linux

# Package Windows binaries (.exe)
npm --workspace=@glint/desktop run package:win
```

---

## 📄 License

Glint is open-source software licensed under the [MIT License](LICENSE).
