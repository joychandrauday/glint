# Glint Micro-SaaS Distribution & Launch Playbook 🚀

This document is your tactical guide for distributing, launching, and scaling Glint as a commercial micro-SaaS desktop product.

---

## 🎯 Executive Summary & Funnel

Glint operates on an **Open-Core / Micro-SaaS** freemium model:
```text
           [ Developer Traffic ]
 (Show HN, Reddit, Winget, Flathub, Product Hunt)
                      │
                      ▼
            [ 1-Click Installation ]
        (Winget, Snap, AppImage, deb, exe)
                      │
                      ▼
         [ Guest Mode: Immediate Value ]
        (10 offline cheatsheet queries, $0 friction)
                      │
                      ▼
           [ Free Registered Tier ]
   (15 AI queries/day, cloud sync across workstations)
                      │
           ┌──────────┴──────────┐
           ▼                     ▼
    [ Pro / Team SaaS ]   [ BYOK / Ollama Power Users ]
    ($8/mo unlimited AI,   (Free, zero server cost,
     team command packs)    maximum retention)
```

---

## 📦 Pillar 1: Native Package Managers

Developers prefer installing tools directly through their terminal. Package managers offer persistent organic distribution without ad spend.

### 1. Windows Package Manager (Winget)
Winget is built into Windows 10/11 and is Microsoft's primary package manager.

#### Submission Steps:
1. Release your Windows installer on GitHub Releases (e.g. `v0.1.2`).
2. Install `wingetcreate`:
   ```powershell
   winget install wingetcreate
   ```
3. Generate the submission manifest:
   ```powershell
   wingetcreate new https://github.com/joychandrauday/glint/releases/download/v0.1.2/Glint-0.1.2-win-x64.exe
   ```
4. Review the generated YAML manifest (`manifests/g/Glint/Glint/0.1.2/`):
   - PackageIdentifier: `Glint.Glint`
   - PackageName: `Glint`
   - Publisher: `Glint`
   - ShortDescription: `Lightweight command-line cheatsheet overlay and AI assistant for engineers`
   - License: `MIT`
   - InstallerType: `nullsoft` (NSIS)
5. Submit directly:
   ```powershell
   wingetcreate submit manifests/g/Glint/Glint/0.1.2/ --token <GITHUB_PERSONAL_ACCESS_TOKEN>
   ```
6. Users can then install instantly:
   ```powershell
   winget install Glint.Glint
   ```

---

### 2. Arch Linux User Repository (AUR)
Arch Linux and Manjaro developers have massive engagement with command-line tools.

#### Create `PKGBUILD` for `glint-bin`:
```bash
# Maintainer: Your Name <dev@glint.dev>
pkgname=glint-bin
pkgver=0.1.2
pkgrel=1
pkgdesc="Lightweight command-line cheatsheet overlay & AI assistant"
arch=('x86_64')
url="https://github.com/joychandrauday/glint"
license=('MIT')
depends=('libfuse2' 'gtk3' 'nss')
provides=('glint')
conflicts=('glint')
source=("https://github.com/joychandrauday/glint/releases/download/v${pkgver}/Glint-${pkgver}-linux-x86_64.AppImage")
sha256sums=('SKIP') # Replace with actual sha256sum

package() {
    install -Dm755 "${srcdir}/Glint-${pkgver}-linux-x86_64.AppImage" "${pkgdir}/usr/bin/glint"
}
```
Users install via:
```bash
yay -S glint-bin
```

---

### 3. Canonical Snap Store (Ubuntu & Linux Mint)
Canonical's Snap Store features apps directly in Ubuntu's App Center:
1. Register your publisher name at [snapcraft.io](https://snapcraft.io).
2. Electron-builder can build snaps automatically by adding `"snap"` to `apps/desktop/package.json` under `linux.target`.
3. Publish using:
   ```bash
   snapcraft login
   snapcraft upload --release=stable apps/desktop/release/glint_0.1.2_amd64.snap
   ```
4. Users install with:
   ```bash
   sudo snap install glint
   ```

---

### 4. Flathub (Flatpak)
Flathub is the standard distribution method for Fedora, Arch, SteamOS, and openSUSE:
1. Fork [flathub/flathub](https://github.com/flathub/flathub).
2. Submit a manifest for `com.glint.desktop`.
3. Once approved, millions of Linux users can install via one click from GNOME Software or:
   ```bash
   flatpak install flathub com.glint.desktop
   ```

---

## 🔄 Pillar 2: Auto-Updates with `electron-updater`

Never let users languish on outdated versions:
1. In `apps/desktop/package.json`, set your release repository:
   ```json
   "build": {
     "publish": [
       {
         "provider": "github",
         "owner": "joychandrauday",
         "repo": "glint"
       }
     ]
   }
   ```
2. When you push a new git tag (e.g. `git tag v0.1.2 && git push origin v0.1.2`), the `.github/workflows/release.yml` builds and attaches the updated `.AppImage`, `.deb`, `.exe`, and `.blockmap` files.
3. Glint downloads updates seamlessly in the background and applies them on next start.

---

## 📢 Pillar 3: Product Launch Playbooks

### 1. Hacker News ("Show HN") Playbook
HN has an audience of hundreds of thousands of terminal and infrastructure engineers.

- **Optimal Timing**: Tuesday or Wednesday morning at **07:00 AM – 08:30 AM EST (12:00 PM – 1:30 PM UTC)**.
- **Title Formula**:
  > `Show HN: Glint – Instant command cheatsheet overlay with AI cascade for engineers`
- **First Comment (Maker Comment)**:
  - *The Origin Story*: Explain why you built it: "I was tired of context-switching out of my terminal or IDE every 10 minutes to search for obscure docker/k8s/tar flags..."
  - *The Tech Stack*: Highlight that it's built with Electron + React 19, operates offline-first, and cascades between Groq, Gemini, and Cloudflare AI.
  - *Privacy & Cost*: Emphasize that searches are local, keys are never leaked, and users can BYOK (Bring Your Own Key) or connect local Ollama.
  - *Direct Link*: Provide immediate links to GitHub and release downloads.

---

### 2. Reddit Targeted Subreddit Strategy
Post natively in relevant subreddits with tailored angles (do **not** cross-post spam):

| Subreddit | Angle / Headline | Focus |
| :--- | :--- | :--- |
| `r/commandline` | *"I built a lightweight floating overlay to remember CLI flags with live variable filling"* | Highlight interactive `{{variable}}` substitution and zero mouse friction. |
| `r/devops` | *"Zero-context-switch cheatsheet overlay for Docker, K8s, and Networking"* | Highlight color-coded danger levels (Safe vs Dangerous) and speed. |
| `r/selfhosted` | *"Open-source command assistant with offline heuristics and local Ollama support"* | Highlight privacy, offline cheatsheets, and self-hosting options. |
| `r/linux` | *"Desktop overlay for Linux engineers with AppImage, deb, and Wayland/X11 support"* | Highlight Linux integration, lightweight memory footprint, and open-source nature. |

---

### 3. Product Hunt Launch
- **Makers**: You and your team.
- **Tagline**: *"Context-aware CLI cheatsheet overlay and AI assistant floating right where you work."*
- **Assets Needed**:
  - High-res animated GIF (summoning overlay, typing `docker run`, editing variable, 1-click copy).
  - 4 screenshot slides highlighting:
    1. Floating chat head in desktop workspace.
    2. Interactive variable parameter substitution.
    3. Multi-LLM AI fallback query.
    4. Safety tiers (Safe / Caution / Dangerous).
- **First Maker Comment**: Offer a discount code for the Pro tier (e.g. `PH50` for 50% off first 6 months).

---

## 💰 Pillar 4: Micro-SaaS Monetization & Pricing Tiers

To turn Glint into a recurring revenue business without burning out API costs:

### 1. The 3-Tier Model

| Tier | Price | Features | Target Audience |
| :--- | :--- | :--- | :--- |
| **Guest / Free** | \$0 | - 10 offline searches (Guest)<br>- Unlimited cheatsheets once signed in<br>- 15 AI requests/day (Groq / Gemini Flash pool)<br>- Community cheatsheets | Hobbyists & occasional CLI users |
| **BYOK / Local AI** | \$0 | - Unlimited AI queries using **personal OpenAI/Groq API key** or **local Ollama**<br>- Cloud sync across devices | Power users, privacy advocates |
| **Glint Pro** | \$8/mo or \$72/yr | - Unlimited managed fast AI queries (Claude 3.5 Sonnet / GPT-4o / Groq 70B)<br>- Multi-step Runbook execution<br>- Private synced cloud workflows across unlimited machines<br>- Priority customer support | Professional DevOps & Senior Software Engineers |
| **Team / Enterprise** | \$19/seat/mo | - Shared team runbooks and company-internal CLI cheatsheets<br>- Centralized team billing & audit log<br>- Single Sign-On (SSO) | Engineering teams & startups |

### 2. Payment Integration Strategy
- Use **Lemon Squeezy** or **Stripe Checkout** for Merchant of Record (MoR) billing.
- Upon successful payment, a Supabase webhook updates the user's `user_profiles.subscription_tier` to `pro`, granting unlimited daily quota.
