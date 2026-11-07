export interface FAQItem {
  q: string;
  a: string;
}

export const FAQ_ITEMS: FAQItem[] = [
  {
    q: "Is Glint completely free to use?",
    a: "Yes. Glint is open source software released under the MIT license. The desktop overlay and all thirty eight local playbooks are free forever with no credit card required.",
  },
  {
    q: "How does the AI query quota work?",
    a: "Every installation receives fifteen free managed AI queries each day powered by fast cloud models. When you reach this threshold, your local playbooks remain fully functional, or you can plug in your own private API key or local Ollama instance for unlimited answers.",
  },
  {
    q: "Does Glint inspect my private shell commands or keystrokes?",
    a: "No. Glint never logs keystrokes, tracks shell history, or transmits private terminal output. Local queries run entirely inside an offline SQLite database stored on your device.",
  },
  {
    q: "Which operating systems are supported?",
    a: "Glint provides native packages for 64 bit Linux (Debian, Ubuntu, AppImage), Windows 10 and 11 (.exe), and macOS (.dmg), with Android overlay support in active development.",
  },
  {
    q: "Can I use Glint completely offline?",
    a: "Yes. All bundled runbooks, regex helpers, cron calculators, and previously saved queries are cached locally in your SQLite database and work seamlessly without an internet connection.",
  },
  {
    q: "How does Bring Your Own Key work?",
    a: "You can add your own API key for OpenAI, Groq, Google Gemini, Anthropic, or point Glint to your local Ollama port (11434). Requests route directly from your workstation to the provider with zero intermediary logging.",
  },
  {
    q: "What is the desktop memory footprint?",
    a: "Glint is optimized to consume less than 65 MB of RAM in background idle state, docking neatly to the screen edge until summoned.",
  },
  {
    q: "Can I add my own custom team runbooks?",
    a: "Yes. Use the slash command new inside the overlay to save custom multi step commands with dynamic parameters, which sync securely across your devices.",
  },
];
