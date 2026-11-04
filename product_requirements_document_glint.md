# Master Product Requirements Document (PRD) & Execution Blueprint: Glint

**Document Version:** 2.0 (Master Compilation)  
**Status:** Ready for Engineering & Design  
**Author:** Senior Product Manager  
**Target Platforms:** Desktop (Linux, Windows, macOS) + Mobile (Android Native Overlay, iOS Widget/Keyboard)  
**Core Model:** Open-Source Client + Managed Free-Tier Backend (with Rate-Limiting & Admin Control)  

---

## 1. Brand Identity & Naming

### Primary Brand Name: **Glint**
* **Concept:** A tiny, instantaneous flash of light on the screen that delivers answers without breaking your flow state.
* **Tagline:** *"Zero-context-switch knowledge, floating right where you work."*
* **CLI / Trigger Alias:** `glint`

### Alternative Names Considered
1. **Wisp / WisprDev:** Evokes a "floating wizard" hovering unobtrusively at the edge of your workspace.
2. **HoverCue:** Directly communicates the floating overlay ("Hover") and instant command prompts ("Cue").
3. **Huddy:** A blend of "HUD" (Heads-Up Display) and "Buddy" (conversational messenger UI).

### Visual & UI Identity
* **Design System:** Dark-first Glassmorphism (`#0D1117` at `85%` opacity with backdrop blur).
* **Accent Colors:**
  * **Electric Cyan (`#00F5D4`):** Instant deterministic local/cloud cheatsheet match ($0\text{ API cost}$).
  * **Warm Amber (`#F59E0B`):** AI-generated fallback response (consumes user daily quota).
  * **Crimson Coral (`#F43F5E`):** Quota warning / rate-limit alert.
* **Typography:** `JetBrains Mono` for code/commands; `Inter` for messenger bubbles and admin tables.

---

## 2. Executive Summary & Product Vision

Developers and power users lose hours every week to **context switching**—leaving their IDE or terminal to search Google, documentation sites, or slow AI chat pages just to recall a CLI command, regex, or multi-step deployment workflow.

**Glint** solves this with a tiny floating overlay icon (and global hotkey) on Desktop and Android. Clicking the icon opens a compact **messenger-style chat overlay**. Users type a command or workflow query, and Glint responds in milliseconds using an offline-first cheatsheet database, only calling AI when needed.

Because Glint is open-source and free to use, it features **mandatory post-install Email/Password authentication** to sync user chat history, custom cheatsheets, and enforce **strict server-side AI rate limits** managed via a dedicated **Admin Monitoring Panel**.

---

## 3. End-to-End User Journey (Step-by-Step)

### Step 1: Installation & First Launch
1. User downloads Glint via `.deb`/`.AppImage` (Linux), `.msi` (Windows), `.dmg` (macOS), or `.apk` (Android).
2. On first launch, the floating icon appears and automatically expands into the **Welcome & Auth Card**.

### Step 2: Mandatory Onboarding & Authentication
1. **Sign Up / Log In Screen:** User enters **Email and Password** (powered by Supabase Auth / Appwrite / PocketBase).
2. **Device Registration:** Upon authentication, Glint registers the device OS, app version, and unique session token, then downloads the user's saved chat history, pinned workflows, and current AI quota status.
3. **Quick Setup Wizard (30 Seconds):**
   * Confirm Global Hotkey (default: `Alt + Space`).
   * Select Tech Stack Packs to pre-index (e.g., *Linux, Git, Docker, Next.js, Python, SQL*).

### Step 3: Daily Floating Overlay Usage
1. User clicks the floating bubble (or presses `Alt + Space`).
2. User types a query in the messenger input (e.g., `tar extract gz` or `nextjs dockerfile`).
3. **Tier 1 (Zero-Cost Local/Synced Search):** If a match exists in bundled `tldr-pages` or the user's saved workflows, Glint replies in $<15\text{ ms}$ with a chat bubble containing the command, variable inputs (`{{filename}}`), and a `[Copy]` button.
4. **Tier 2 (Quota-Limited AI Fallback):** If no deterministic match is found, Glint displays: *"No local match. Press `Enter` to ask Glint AI (Uses 1 of 15 daily free credits)."*
5. Every query, AI reply, and custom workflow is automatically synced to the user's account in the background.

---

## 4. Complete Feature Compilation

### Module A: The Floating Wizard & Overlay Engine
* **A1. Draggable Floating Chat-Head:** 40x40px always-on-top icon with customizable opacity (`20%` to `100%`).
* **A2. Edge Snapping & Peek Mode:** Docks cleanly to the left/right screen border and hides 70% of its body until hovered.
* **A3. Smooth Morph Animation:** Morphs seamlessly between the 40x40px icon and a 380x540px messenger window.
* **A4. Non-Intrusive Focus Restoration:** Pressing `Esc` or clicking `[Copy]` collapses the overlay and returns cursor focus directly back to the active terminal or code editor.
* **A5. Wayland & X11 Auto-Adaptation (Linux):** Uses standard window coordinates on X11 (XFCE/Cinnamon/i3) and `gtk-layer-shell` + Global Shortcut Portal on Wayland.
* **A6. Android System Overlay:** Uses `SYSTEM_ALERT_WINDOW` foreground service so the floating bubble works over Chrome, Termux, or YouTube on Android.

### Module B: Messenger Search, Workflows & Variable Injection
* **B1. Chat-Style Thread UI:** Queries appear on the right; cheatsheet/workflow replies appear on the left as structured bubbles.
* **B2. Multi-Step Runbook Threads:** Complex workflows (e.g., `"Setup Nginx Reverse Proxy with Certbot"`) return sequential step-by-step bubbles (`Step 1/4`, `Step 2/4`, etc.).
* **B3. Live Variable Placeholders:** Any command containing `{{variable_name}}` renders a quick inline text input at the top of the bubble. Typing `3000` updates `{{port}}` across all commands in real time.
* **B4. Slash Commands:**
  * `/new` — Create a custom cheatsheet or multi-step workflow right inside the chat.
  * `/history` — Browse and search past chat threads across devices.
  * `/quota` — View remaining daily AI credits.
  * `/byok` — Add a personal API key or local Ollama URL for unlimited AI usage.
* **B5. One-Click Save AI to Cheatsheet:** Any AI-generated response includes a `[+ Save as Local Cheatsheet]` button so the user (and optionally the community) never burns an AI credit for that same question again.

### Module C: User Authentication, Cloud Sync & History
* **C1. Email + Password Auth:** Mandatory login on first boot with JWT refresh token persistence in OS Keychain (`libsecret` on Linux, Credential Manager on Windows, Keychain on macOS).
* **C2. Offline-First Sync Queue (CRDT / Delta Sync):** Works 100% offline using local SQLite; syncs chat history and custom cheatsheets to the cloud database as soon as internet connectivity is restored.
* **C3. Cross-Device Chat History:** Start a troubleshooting thread or save a command on Linux Desktop, and view the exact same chat bubble history on Android seconds later.

### Module D: AI Rate-Limiting & Cost-Protection Engine
Because the project is free and open-source, **never expose AI API keys inside the client binary**. All default AI requests route through our lightweight open-source API Gateway.
* **D1. Three-Tier AI Quota System:**
  1. **Free Managed Tier (Default):** Each verified Email account gets **$N$ free AI requests per day** (e.g., `15 requests/day` and `150 requests/month`), routed through free/ultra-low-cost providers (Groq Free API pool, Gemini Flash free tier, or Cloudflare Workers AI).
  2. **Global Circuit Breaker:** If total platform-wide AI usage hits $85\%$ of our free provider pool limit in a given hour/day, the backend automatically pauses managed AI for free users and displays a friendly banner: *"Community AI pool is at capacity. Local cheatsheets still work 100%, or connect Ollama/BYOK."*
  3. **Unlimited Bypass (Zero Cost to Us):** Users who configure **Local Ollama** (`http://localhost:11434`) or enter their own **BYOK (Bring Your Own Key)** bypass our server quota completely.
* **D2. Semantic Caching (Global Cost Saver):** Before calling the upstream AI API, the backend hashes/embeds the user's prompt. If another user already asked *"how to check open ports in linux"*, the backend returns the cached answer at **$0\text{ API token cost}$**.

### Module E: Admin Monitoring & Control Panel (Web Dashboard)
A secure web dashboard (`/admin`) for you (the maintainer) to monitor users, control costs, and curate cheatsheets.
* **E1. Real-Time Usage Overview:**
  * Total Registered Users, Daily Active Users (DAU), Active Devices (Linux vs. Windows vs. Android).
  * Today's Total AI Requests vs. Global Free-Tier Pool Limit (Gauge chart).
  * Cache Hit Ratio (how many AI queries were served free from cache).
* **E2. User Management & Quota Override Table:**
  * Search users by email, view signup date, last active IP/OS, total saved cheatsheets, and AI tokens consumed.
  * Actions: `[Reset Daily Quota]`, `[Upgrade to VIP/Unlimited]`, `[Throttle User]`, `[Ban/Suspend Account]`.
* **E3. Dynamic Rate-Limit Configuration (No Redeploy Needed):**
  * Change daily/hourly limits on the fly (e.g., adjust Free Tier from `15/day` to `10/day`).
  * Switch active upstream AI provider (e.g., toggle between Groq `llama-3.3-70b`, Gemini Flash, or Cloudflare Workers AI) if one provider's free tier runs out.
* **E4. Community Cheatsheet Promotion:**
  * Review anonymized popular AI queries that failed local search, and promote them into the official global cheatsheet database with 1 click—permanently reducing future AI usage.

---

## 5. 100% Free & Open-Source Tech Stack Architecture

Every component below is open-source and can be deployed using **\$0/month free tiers**.

| Layer | Technology (FOSS) | Hosting / Free Tier Strategy |
| :--- | :--- | :--- |
| **Desktop App** | **Tauri v2** (Rust + React + TypeScript + Tailwind) | Distributed via **GitHub Releases** (Free unlimited bandwidth) |
| **Android App** | **Tauri v2 Mobile** or **Flutter** (`flutter_overlay_window`) | GitHub Releases (`.apk`) + **F-Droid** |
| **Local Client DB** | **SQLite (FTS5)** + **Nucleo** (Rust fuzzy matcher) | Runs 100% on user's device |
| **Backend Auth & DB** | **Supabase** (Open-source Postgres) *or* **PocketBase** (Go + SQLite) | **Supabase Free Tier** (50,000 MAU, 500MB Postgres DB) or self-hosted PocketBase on Oracle Cloud Free VPS |
| **AI Proxy & Rate Limiter** | **Cloudflare Workers** (Hono.js) + **Upstash Redis** | **Cloudflare Free** (100,000 req/day) + **Upstash Free** (10k commands/day) |
| **Upstream Free AI Pool** | **Groq Cloud API** + **Google Gemini Flash** + **Cloudflare Workers AI** | Free developer tiers load-balanced via the Cloudflare Worker |
| **Admin Dashboard** | **Next.js / React** + **shadcn/ui** + **Recharts** | **Vercel** or **Cloudflare Pages** (100% Free) |

---

## 6. Database Schema & Backend Architecture

### System Architecture Diagram

$$
\text{Client App (Tauri / Android)} \xrightarrow{\text{JWT Auth}} \begin{cases} \text{1. Local SQLite FTS5 Search (<15ms, Free)} \\ \text{2. Supabase / PocketBase (Sync History & Custom Workflows)} \\ \text{3. Cloudflare Worker AI Gateway (Rate Limit Check + Semantic Cache)} \end{cases}
$$

### PostgreSQL / Supabase Schema (Core Tables)

```sql
-- 1. Users Profile & Quota Table (Extends Supabase auth.users)
CREATE TABLE public.user_profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT NOT NULL,
    role TEXT DEFAULT 'user' CHECK (role IN ('user', 'vip', 'admin')),
    is_banned BOOLEAN DEFAULT FALSE,
    daily_ai_limit INT DEFAULT 15,
    daily_ai_used INT DEFAULT 0,
    total_ai_used INT DEFAULT 0,
    last_reset_date DATE DEFAULT CURRENT_DATE,
    os_platform TEXT,
    app_version TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    last_active_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. User Synced Cheatsheets & Custom Workflows
CREATE TABLE public.cheatsheets (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES public.user_profiles(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    category TEXT NOT NULL,
    tags TEXT[],
    variables JSONB DEFAULT '[]'::jsonb,
    steps JSONB NOT NULL, -- Array of {step, text, command}
    is_public BOOLEAN DEFAULT FALSE,
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. User Chat History (Synced across Desktop & Mobile)
CREATE TABLE public.chat_history (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES public.user_profiles(id) ON DELETE CASCADE,
    query TEXT NOT NULL,
    response_type TEXT CHECK (response_type IN ('local', 'ai', 'workflow')),
    response_payload JSONB NOT NULL,
    tokens_used INT DEFAULT 0,
    device_os TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Global AI Semantic Cache (Saves API Quota Across All Users)
CREATE TABLE public.ai_query_cache (
    query_hash TEXT PRIMARY KEY,
    normalized_query TEXT NOT NULL,
    response_payload JSONB NOT NULL,
    hit_count INT DEFAULT 1,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. Global Admin Settings (Single-row config table)
CREATE TABLE public.system_config (
    id INT PRIMARY KEY DEFAULT 1,
    global_ai_enabled BOOLEAN DEFAULT TRUE,
    default_daily_user_limit INT DEFAULT 15,
    global_daily_cap INT DEFAULT 5000,
    global_daily_used INT DEFAULT 0,
    active_ai_provider TEXT DEFAULT 'groq-llama3'
);
```

---

## 7. AI Quota & Rate-Limiting Enforcement Logic

Whenever a user triggers an AI fallback query, the backend executes this exact 5-step gate before spending a single API token:

1. **JWT Verification:** Verify the user's Supabase/PocketBase session token. Reject unauthenticated requests (`401 Unauthorized`).
2. **Account Status Check:** Check if `user_profiles.is_banned == true`.
3. **Cache Lookup ($0\text{ Cost}$):** Normalize query (lowercase, trim) and check `ai_query_cache`. If found, return the cached JSON immediately without deducting the user's quota!
4. **Global Circuit Breaker Check:** Check if `system_config.global_ai_enabled == true` and `global_daily_used < global_daily_cap`.
5. **User Daily Quota Check:**
   * If `CURRENT_DATE > user_profiles.last_reset_date`, reset `daily_ai_used = 0`.
   * If `daily_ai_used >= daily_ai_limit`, return `429 Too Many Requests` with a friendly message prompting them to use local search, wait until tomorrow, or plug in local Ollama/BYOK.
   * Otherwise, increment `daily_ai_used + 1`, call the LLM with a strict JSON cheatsheet system prompt, cache the result, save to `chat_history`, and stream back to the overlay.

---

## 8. Step-by-Step Implementation Roadmap (From Zero to Launch)

### Phase 1: Backend, Auth & Admin Foundation (Week 1)
* [ ] **Step 1.1:** Create a free **Supabase** project (or self-host **PocketBase**).
* [ ] **Step 1.2:** Run the SQL schema above to create `user_profiles`, `cheatsheets`, `chat_history`, `ai_query_cache`, and `system_config`.
* [ ] **Step 1.3:** Enable Row Level Security (RLS) so users can only read/write their own `chat_history` and `cheatsheets`, while `role = 'admin'` can read all metrics.
* [ ] **Step 1.4:** Deploy a lightweight **Cloudflare Worker** (using Hono.js) as the `/api/ai-query` gateway with rate-limiting and free-tier LLM key rotation (Groq + Gemini Flash).

### Phase 2: Desktop Floating Overlay Client (Weeks 2–3)
* [ ] **Step 2.1:** Scaffold the **Tauri v2 + React + TypeScript + Tailwind** desktop app.
* [ ] **Step 2.2:** Build the frameless, transparent window manager that toggles between **Floating Bubble Mode (`40x40px`)** and **Messenger Overlay Mode (`380x540px`)** via click or `Alt + Space`.
* [ ] **Step 2.3:** Build the **Post-Install Auth Gate** (Email/Password Login & Signup UI) inside the overlay and persist the session token securely.
* [ ] **Step 2.4:** Bundle `tldr-pages` into local SQLite FTS5 for instant $<15\text{ ms}$ offline search.
* [ ] **Step 2.5:** Build the Messenger Chat UI with syntax highlighting, `[Copy]` buttons, `{{variable}}` live inputs, and background cloud sync for `chat_history`.

### Phase 3: Admin Monitoring Dashboard (Week 4)
* [ ] **Step 3.1:** Scaffold the Admin Web Panel using **Next.js / React + Tailwind + shadcn/ui**.
* [ ] **Step 3.2:** Build the **Overview KPI Cards** (Total Users, Active Today, Global AI Pool Usage %, Cache Hit Rate).
* [ ] **Step 3.3:** Build the **User Management Table** (View email, OS, AI usage, ban/unban, edit individual daily limits).
* [ ] **Step 3.4:** Build the **Global Kill-Switch & Provider Selector** (Toggle AI on/off, adjust default daily free credits, promote cached AI answers to official cheatsheets).

### Phase 4: Android Overlay & Packaging (Weeks 5–6)
* [ ] **Step 4.1:** Port the frontend and SQLite sync engine to Android with the `SYSTEM_ALERT_WINDOW` floating chat-head permission.
* [ ] **Step 4.2:** Set up **GitHub Actions CI/CD** to automatically build `.deb`, `.AppImage`, `.msi`, `.dmg`, and `.apk` binaries on every Git tag push.

---

## 9. Security & Open-Source Best Practices

1. **Zero Secrets in Client Repo:** The open-source GitHub repo for the Desktop/Mobile client will only contain the public Supabase URL/Anon Key and the public Cloudflare Worker URL. All LLM API keys stay strictly inside Cloudflare Worker secret environment variables.
2. **Self-Hosting Support:** Because it's open-source, include a `docker-compose.yml` so organizations can self-host their own backend if desired, while 99% of regular users simply sign in to your hosted cloud on install.
3. **Strict Output Token Caps:** Enforce `max_tokens: 350` and a concise JSON system prompt on all AI requests so no single user request can consume large token volumes.