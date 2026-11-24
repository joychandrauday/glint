export interface FAQItem {
  q: string;
  a: string;
}

export const FAQ_ITEMS: FAQItem[] = [
  {
    q: "Why use Glint instead of Googling or opening an AI chat tab?",
    a: "Context-switching destroys deep focus. When you need an obscure command, regex, or system diagnostic, leaving your terminal or editor to open a browser causes you to lose 10 to 15 minutes to distractions, cookie banners, and outdated stack overflows. With Glint, you never leave your flow: press Ctrl + Space for the desktop HUD, or run `glint` for a full-featured conversational terminal assistant with real-time markdown formatting and token caching.",
  },
  {
    q: "Is Glint completely free to use?",
    a: "Yes. Glint is open source software released under the MIT license. Both the desktop overlay and the 500+ offline cheatsheets are free forever with no credit card required.",
  },
  {
    q: "How does the Bring Your Own Key (BYOK) engine work?",
    a: "Glint operates on a zero-middleman, privacy-first BYOK architecture. You can easily configure your own API keys for Groq, Google Gemini, Anthropic (Claude 3.7 / 3.5), OpenAI (GPT-4o / o3-mini), DeepSeek, OpenRouter, or point directly to a local offline Ollama instance. Your keys are stored locally and credentials route straight from your machine to the provider.",
  },
  {
    q: "How does Glint reduce token usage and API costs?",
    a: "Glint implements multi-tier prompt and token caching. Repeat queries hit a local semantic SHA-256 disk cache with zero token consumption and <10ms replay. In addition, Glint enables native prompt caching for Anthropic and Gemini, reducing input token expenses by up to 90% on long conversations.",
  },
  {
    q: "Does Glint track or transmit my shell history or code?",
    a: "No. Glint never logs keystrokes, tracks shell history, or transmits telemetry. Local cheatsheet searches execute entirely offline against a local SQLite / Fuse database stored on your device.",
  },
  {
    q: "Can I use Glint directly in my terminal without the desktop overlay?",
    a: "Yes! Glint includes an ultra-fast, 548 KB standalone interactive CLI. You can launch `glint` for an interactive REPL with slash command filtering, run `glint ask '<prompt>'` for one-shot answers, or use `glint fix` to diagnose shell and compiler errors. Install it in seconds via `curl -fsSL https://glint.g2gdigital.com/install.sh | bash`.",
  },
  {
    q: "Which operating systems are supported?",
    a: "Glint provides native packages for 64-bit Linux (Debian/Ubuntu .deb, AppImage), Windows 10 and 11 (.exe), macOS Apple Silicon (.dmg, .zip), and a universal standalone CLI executable that runs on any system with Node or Bun.",
  },
  {
    q: "Can I use Glint completely offline?",
    a: "Yes. All 500+ preindexed cheatsheets, developer micro-tools (Cron parser, Regex tester, Port checker), and previously cached queries work completely offline without an internet connection.",
  },
  {
    q: "How do slash commands work in Glint REPL?",
    a: "Typing `/` displays the categorized command directory. Glint supports real-time prefix filtering: typing `/a` shows only commands starting with `a` (`/ask`, `/agent`, `/api`, `/about`), `/k` filters for `/keys`, `/m` for `/model`, `/c` for `/config`, `/cache`, and `/clear`.",
  },
  {
    q: "Can I customize the active model or provider?",
    a: "Yes. Use `/provider <name>` to switch providers, or `/model <name>` to pick curated models or type any arbitrary custom model ID directly.",
  },
];
