# Glint ⚡

> Lightweight, context-aware command-line cheatsheet overlay and AI assistant designed for engineers. Instant local search, interactive variable parameter filling, multi-provider LLM cascade, and seamless desktop overlay.

---

## 🏗️ Architecture & Monorepo Structure

```text
glint/
├── apps/
│   ├── desktop/    # React 19 + TypeScript + Tailwind floating messenger overlay
│   ├── gateway/    # Cloudflare Worker / Hono.js AI proxy (Groq, Gemini, CF AI)
│   └── admin/      # Next.js/React management console (KPIs, user quotas, kill switch)
├── packages/
│   ├── shared/     # TypeScript definitions, Zod schemas, template variable engine
│   └── db/         # PostgreSQL DDL migrations, RLS policies, triggers, seed data
├── brand/          # Logo, marks, app icons, palette (open brand/preview.html)
└── product_requirements_document_glint.md
```

---

## 🚀 Quick Start

### Prerequisites
- Node.js `>= 20` (tested on `v22.14.0`)
- npm `>= 10`

### 1. Install & Build All Workspaces
```bash
git clone <repo-url>
cd glint
npm install
npm run build
```

### 2. Run Tests
```bash
npm test
```
Runs test suites across `@glint/shared` (variable template parsing & substitution) and `@glint/gateway` (health, auth rejection, quota tracking, query normalization, and cache hit verification).

### 3. Launch Development Environments
- **Desktop Messenger Overlay (Web Preview & Linux Desktop)**:
  ```bash
  npm run dev:desktop
  # Running at http://localhost:5173
  ```
- **AI Gateway**:
  ```bash
  npm run dev:gateway
  # Running at http://localhost:8787
  ```
- **Admin Console**:
  ```bash
  npm run dev:admin
  # Running at http://localhost:3001
  ```

---

## 🎯 Key Features & Decisions

1. **Floating Trigger Bubble & Morphing Messenger**:
   - `40x40px` compact neon bubble fixed to screen corner with pulsing glow.
   - Click or press `Ctrl+Space` / `Alt+Space` to morph into a sleek `380x540px` floating container.
   - Built-in category filters (`Docker`, `Git`, `K8s`, `Linux`, `Networking`).

2. **Interactive `{{variable}}` Substitution**:
   - Command templates support inline parameters: `docker run -d -p {{host_port:8080}}:{{container_port:80}} {{image:nginx:latest}}`.
   - Editing any variable input updates the command string in real time.
   - 1-click clipboard copy with visual confirmation.
   - Color-coded danger levels: `Safe` (Emerald), `Caution` (Amber), and `Dangerous` (Rose).

3. **Limited Guest Mode & Authentication**:
   - Guests receive **10 offline searches**.
   - When 10 searches are conducted, search locks and an Auth modal appears requiring sign-in to continue.
   - AI assistant features strictly require authentication (cannot be invoked by unauthenticated guests).

4. **Multi-LLM Provider Cascade & Semantic Caching**:
   - Primary: **Groq** (`llama-3.3-70b-versatile` / `llama-3.1-8b-instant`).
   - Fallback 1: **Google Gemini** (`gemini-2.5-flash`).
   - Fallback 2: **Cloudflare Workers AI** (`@cf/meta/llama-3-8b-instruct`).
   - Offline fallback: Intelligent local heuristic engine.
   - SHA-256 query normalization cache serves recurring queries in `<10ms` without consuming user daily quota.

5. **PostgreSQL / Supabase Schema & Row-Level Security**:
   - Migrations in [`packages/db/migrations/0001_init_schema.sql`](file:///home/joychandrauday/ops/Projects/glint/packages/db/migrations/0001_init_schema.sql).
   - Auto-provisioning trigger on Supabase `auth.users` creates `user_profiles` and sets default daily quota to 15 queries/day.
   - Strict Row-Level Security (RLS) policies protecting user profiles, quotas, and admin settings.
