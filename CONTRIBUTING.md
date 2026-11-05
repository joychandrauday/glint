# Contributing to Glint 🛠️

Thank you for your interest in contributing to Glint! This guide will help you set up the development environment, understand the monorepo architecture, and run the complete test suite.

---

## 🏗️ Monorepo Architecture

Glint is organized as an npm workspaces monorepo:

```text
glint/
├── apps/
│   ├── desktop/    # Electron 45 + React 19 + Tailwind CSS floating messenger overlay
│   ├── gateway/    # Cloudflare Worker / Hono.js multi-LLM proxy & semantic cache
│   ├── admin/      # Next.js management dashboard (telemetry, quotas, kill switch)
│   └── landing/    # Marketing & download portal
├── packages/
│   ├── shared/     # Shared types, Zod schemas, template variable engine
│   └── db/         # PostgreSQL DDL migrations, Supabase RLS policies, seed data
├── brand/          # SVGs, icons, color tokens, and preview HTML
└── package.json    # Workspace orchestration & root scripts
```

---

## 💻 Local Development Setup

### 1. Prerequisites
- **Node.js**: `>= 20.0.0` (LTS recommended)
- **npm**: `>= 10.0.0`
- **Git**

### 2. Clone & Install Dependencies
```bash
git clone https://github.com/joychandrauday/glint.git
cd glint
npm install
```

### 3. Environment Configuration
Copy the template configuration file:
```bash
cp .env.example .env
```
Fill in the following variables as needed:
- `VITE_SUPABASE_URL` & `VITE_SUPABASE_ANON_KEY`: Your Supabase backend credentials.
- `GROQ_API_KEY`: Groq API key for fast inference (primary provider).
- `GEMINI_API_KEY`: Google Gemini API key (fallback provider).
- `VITE_GATEWAY_URL`: Defaults to `http://localhost:8787` for local gateway development.

### 4. Running Development Servers

You can launch individual components from the root workspace:

- **Desktop Overlay (Live Hot-Reload Preview)**:
  ```bash
  npm run dev:desktop
  ```
  Launches Vite at `http://localhost:5173` and boots Electron with the transparent floating window.

- **AI Gateway**:
  ```bash
  npm run dev:gateway
  ```
  Runs the Hono.js edge gateway proxy at `http://localhost:8787`.

- **Admin Management Console**:
  ```bash
  npm run dev:admin
  ```
  Runs the Next.js admin dashboard at `http://localhost:3001`.

- **Landing Page**:
  ```bash
  npm run dev:landing
  ```
  Runs the Vite marketing portal at `http://localhost:5174`.

---

## 🧪 Testing & Quality Assurance

Always verify that tests and TypeScript checks pass before submitting a PR:

### Run All Test Suites
```bash
npm test
```
Tests:
- `@glint/shared`: Template extraction, default substitution, custom substitution, and query normalization.
- `@glint/gateway`: Health check, cheatsheet retrieval, auth rejection, AI fallback cascade, semantic cache hit, and quota tracking.

### Run Monorepo Typecheck
```bash
npm run typecheck
```
Ensures zero TypeScript errors across all 6 workspaces.

---

## 📦 Packaging Desktop Installers

To package the desktop app locally:

### Linux (`.deb` and `.AppImage`)
```bash
npm run package:linux
```
Output files will be generated in `apps/desktop/release/`:
- `Glint-<version>-linux-amd64.deb`
- `Glint-<version>-linux-x86_64.AppImage`

To install your locally built `.deb` package:
```bash
sudo apt install ./apps/desktop/release/Glint-*-linux-amd64.deb
```

### Windows (`.exe` NSIS installer)
```bash
npm run package:win
```
Output file will be generated in `apps/desktop/release/`:
- `Glint-<version>-win-x64.exe`

### Directory Unpack (Fast Debugging)
```bash
npm run package:desktop
```
Creates an unpacked executable directory in `apps/desktop/release/linux-unpacked` (or `win-unpacked`) without packaging installers.

---

## 📋 Pull Request Guidelines

1. **Branch Naming**: Use descriptive prefixes like `feat/`, `fix/`, `docs/`, or `refactor/` (e.g., `feat/snap-distribution`).
2. **Commit Messages**: Follow [Conventional Commits](https://www.conventionalcommits.org/) (e.g., `feat(desktop): add global shortcut customization`).
3. **Keep Client Secrets Safe**: Never commit API keys, service role tokens, or private credentials.
4. **Code Formatting**: Preserve existing Tailwind CSS conventions and TypeScript strict mode definitions.
