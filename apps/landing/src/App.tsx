import React, { useState } from 'react';
import {
  Download,
  Terminal,
  Zap,
  Sparkles,
  Shield,
  Sliders,
  Cpu,
  Github,
  Check,
  Copy,
  Layers,
  Heart,
  ArrowRight,
} from 'lucide-react';
import { InteractiveWidgetDemo } from './components/InteractiveWidgetDemo';

export const App: React.FC = () => {
  const [curlCopied, setCurlCopied] = useState(false);

  const curlCommand = 'curl -fsSL https://getglint.dev/install.sh | bash';

  const copyCurl = () => {
    navigator.clipboard.writeText(curlCommand);
    setCurlCopied(true);
    setTimeout(() => setCurlCopied(false), 2000);
  };

  return (
    <div className="min-h-screen bg-[#0A0D18] text-slate-100 flex flex-col font-sans selection:bg-pink-500 selection:text-white">
      {/* Background Colorful Aura Gradients */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute -top-40 left-1/4 w-[500px] h-[500px] bg-candy-violet/20 blur-[130px] rounded-full" />
        <div className="absolute top-1/3 -right-20 w-[450px] h-[450px] bg-candy-pink/15 blur-[140px] rounded-full" />
        <div className="absolute -bottom-20 left-10 w-[550px] h-[550px] bg-candy-cyan/15 blur-[150px] rounded-full" />
      </div>

      {/* Top Navbar */}
      <header className="relative z-30 h-16 border-b border-glint-border/60 bg-[#0E1222]/80 backdrop-blur-xl px-6 lg:px-12 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-2xl bg-gradient-to-tr from-candy-cyan via-candy-violet to-candy-pink flex items-center justify-center text-lg font-black shadow-md shadow-candy-violet/20">
            ⚡
          </div>
          <div>
            <span className="text-base font-black tracking-tight text-white flex items-center gap-2">
              Glint
              <span className="text-[10px] px-2 py-0.5 rounded-full font-bold bg-candy-mint/20 text-candy-mintLight border border-candy-mint/40">
                v0.1.0 Beta
              </span>
            </span>
          </div>
        </div>

        <nav className="hidden md:flex items-center gap-6 text-sm font-semibold text-slate-300">
          <a href="#features" className="hover:text-white transition-colors">
            Features
          </a>
          <a href="#demo" className="hover:text-white transition-colors">
            Live Demo
          </a>
          <a href="#install" className="hover:text-white transition-colors">
            Download
          </a>
          <a
            href="https://github.com/joychandrauday/glint"
            target="_blank"
            rel="noreferrer"
            className="flex items-center gap-1.5 hover:text-white transition-colors"
          >
            <Github className="w-4 h-4" />
            <span>GitHub</span>
          </a>
        </nav>

        <div className="flex items-center gap-3">
          <a
            href="#install"
            className="flex items-center gap-2 px-4 py-2 rounded-2xl bg-gradient-to-r from-candy-violet via-candy-pink to-candy-honey hover:opacity-95 text-white text-xs font-extrabold shadow-lg shadow-candy-violet/25 transition-transform hover:scale-105 active:scale-95"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Download for Linux</span>
          </a>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative z-20 pt-16 pb-20 px-6 max-w-6xl mx-auto flex flex-col items-center text-center">
        {/* Floating Pill Badge */}
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-candy-violet/15 border border-candy-violet/40 text-candy-violetLight text-xs font-bold mb-6 animate-bounce">
          <Sparkles className="w-3.5 h-3.5 text-candy-honey" />
          <span>Zero-Context-Switch Floating Command Overlay</span>
        </div>

        {/* Hero Title */}
        <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight text-white leading-tight max-w-3xl">
          Your <span className="bg-gradient-to-r from-candy-cyan via-candy-violet to-candy-pink bg-clip-text text-transparent">Playful Floating</span> Command Buddy.
        </h1>

        {/* Subhead */}
        <p className="mt-5 text-base sm:text-lg text-slate-300 max-w-2xl leading-relaxed">
          Stop breaking your flow state to Google complex terminal commands. Glint floats unobtrusively on your Linux desktop with millisecond offline cheatsheets, live candy variable injection, and smart multi-LLM backup.
        </p>

        {/* CTA Buttons */}
        <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
          <a
            href="#install"
            className="flex items-center gap-2 px-6 py-3.5 rounded-2xl bg-gradient-to-r from-candy-violet via-candy-pink to-candy-honey text-white text-sm font-extrabold shadow-xl shadow-candy-violet/30 hover:scale-105 active:scale-95 transition-transform"
          >
            <Download className="w-4 h-4" />
            <span>Get Glint for Linux (.AppImage / .deb)</span>
          </a>

          <a
            href="#demo"
            className="flex items-center gap-2 px-5 py-3.5 rounded-2xl bg-[#15192B] border border-glint-border hover:border-candy-violet text-slate-200 text-sm font-bold hover:bg-[#1E243E] transition-all"
          >
            <span>Try Live Simulator Below</span>
            <ArrowRight className="w-4 h-4 text-candy-pinkLight" />
          </a>
        </div>

        {/* Hotkey hint */}
        <div className="mt-4 flex items-center gap-2 text-xs text-slate-400 font-mono">
          <span>Press</span>
          <kbd className="px-2 py-0.5 rounded-md bg-[#1B2138] border border-glint-border text-candy-cyan">Alt + Space</kbd>
          <span>anywhere on your desktop to summon Glint</span>
        </div>
      </section>

      {/* Live Interactive Simulator Section */}
      <section id="demo" className="relative z-20 py-12 px-6 max-w-4xl mx-auto w-full">
        <div className="text-center mb-8">
          <h2 className="text-2xl font-black text-white">Experience Glint Live Right in Your Browser</h2>
          <p className="text-sm text-slate-400 mt-1">
            Test the floating widget, tune variables in real time, and copy production-ready commands.
          </p>
        </div>

        <InteractiveWidgetDemo />
      </section>

      {/* Feature Bento Grid */}
      <section id="features" className="relative z-20 py-20 px-6 max-w-6xl mx-auto w-full">
        <div className="text-center mb-12">
          <span className="text-xs font-bold uppercase tracking-wider text-candy-pinkLight">
            Engineered For Speed & Delight
          </span>
          <h2 className="text-3xl font-black text-white mt-1">
            Built for Developers Who Hate Context Switching
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {/* Bento Card 1 */}
          <div className="rounded-3xl border border-glint-border bg-gradient-to-b from-glint-card/90 to-glint-base p-6 flex flex-col justify-between shadow-lg hover:border-candy-mint/50 transition-all group">
            <div className="w-10 h-10 rounded-2xl bg-candy-mint/15 border border-candy-mint/30 flex items-center justify-center text-candy-mintLight mb-4 group-hover:scale-110 transition-transform">
              <Zap className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-black text-white">Instant Offline Search</h3>
              <p className="text-xs text-slate-300 mt-2 leading-relaxed">
                Bundled with thousands of curated Linux, Docker, Git, and Kubernetes commands. Search returns results in under 15 milliseconds without spending battery or API tokens.
              </p>
            </div>
            <div className="mt-4 pt-3 border-t border-glint-border/60 text-[11px] font-mono font-bold text-candy-mintLight">
              ⚡ Zero API Latency
            </div>
          </div>

          {/* Bento Card 2 */}
          <div className="rounded-3xl border border-glint-border bg-gradient-to-b from-glint-card/90 to-glint-base p-6 flex flex-col justify-between shadow-lg hover:border-candy-pink/50 transition-all group">
            <div className="w-10 h-10 rounded-2xl bg-candy-pink/15 border border-candy-pink/30 flex items-center justify-center text-candy-pinkLight mb-4 group-hover:scale-110 transition-transform">
              <Sliders className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-black text-white">Live Candy Variables</h3>
              <p className="text-xs text-slate-300 mt-2 leading-relaxed">
                Never edit template commands by hand in a notepad again. Inline candy chips let you type ports, container names, or paths and watch the final command substitute live.
              </p>
            </div>
            <div className="mt-4 pt-3 border-t border-glint-border/60 text-[11px] font-mono font-bold text-candy-pinkLight">
              🍬 Dynamic Placeholders
            </div>
          </div>

          {/* Bento Card 3 */}
          <div className="rounded-3xl border border-glint-border bg-gradient-to-b from-glint-card/90 to-glint-base p-6 flex flex-col justify-between shadow-lg hover:border-candy-violet/50 transition-all group">
            <div className="w-10 h-10 rounded-2xl bg-candy-violet/15 border border-candy-violet/30 flex items-center justify-center text-candy-violetLight mb-4 group-hover:scale-110 transition-transform">
              <Cpu className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-black text-white">Multi-LLM Fallback Cloud</h3>
              <p className="text-xs text-slate-300 mt-2 leading-relaxed">
                When offline search has no answer, Glint queries our free AI Gateway (Groq Llama-3.3 $\rightarrow$ Gemini Flash $\rightarrow$ Cloudflare AI). Recurring queries are cached at $0 cost.
              </p>
            </div>
            <div className="mt-4 pt-3 border-t border-glint-border/60 text-[11px] font-mono font-bold text-candy-violetLight">
              🤖 Auto-Cascading Gateways
            </div>
          </div>

          {/* Bento Card 4 */}
          <div className="rounded-3xl border border-glint-border bg-gradient-to-b from-glint-card/90 to-glint-base p-6 flex flex-col justify-between shadow-lg hover:border-candy-coral/50 transition-all group">
            <div className="w-10 h-10 rounded-2xl bg-candy-coral/15 border border-candy-coral/30 flex items-center justify-center text-candy-coralLight mb-4 group-hover:scale-110 transition-transform">
              <Shield className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-black text-white">Playful Danger Radar</h3>
              <p className="text-xs text-slate-300 mt-2 leading-relaxed">
                Color-coded badges (🛡️ Safe, 🌶️ Spicy, 🚨 Destructive) instantly alert you before running commands that drop tables, wipe volumes, or kill critical sockets.
              </p>
            </div>
            <div className="mt-4 pt-3 border-t border-glint-border/60 text-[11px] font-mono font-bold text-candy-coralLight">
              🚨 Incident Prevention
            </div>
          </div>

          {/* Bento Card 5 */}
          <div className="rounded-3xl border border-glint-border bg-gradient-to-b from-glint-card/90 to-glint-base p-6 flex flex-col justify-between shadow-lg hover:border-candy-honey/50 transition-all group">
            <div className="w-10 h-10 rounded-2xl bg-candy-honey/15 border border-candy-honey/30 flex items-center justify-center text-candy-honeyLight mb-4 group-hover:scale-110 transition-transform">
              <Layers className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-black text-white">Linux Desktop Native</h3>
              <p className="text-xs text-slate-300 mt-2 leading-relaxed">
                Built specifically for Linux (Ubuntu, Debian, Arch, Fedora) supporting Wayland and X11 compositors. Frameless, transparent floating window with global hotkey support.
              </p>
            </div>
            <div className="mt-4 pt-3 border-t border-glint-border/60 text-[11px] font-mono font-bold text-candy-honeyLight">
              🐧 Wayland & X11 Ready
            </div>
          </div>

          {/* Bento Card 6 */}
          <div className="rounded-3xl border border-glint-border bg-gradient-to-b from-glint-card/90 to-glint-base p-6 flex flex-col justify-between shadow-lg hover:border-candy-cyan/50 transition-all group">
            <div className="w-10 h-10 rounded-2xl bg-candy-cyan/15 border border-candy-cyan/30 flex items-center justify-center text-candy-cyanLight mb-4 group-hover:scale-110 transition-transform">
              <Terminal className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-black text-white">100% Free & Open-Source</h3>
              <p className="text-xs text-slate-300 mt-2 leading-relaxed">
                No credit card, no telemetry trackers. Deploy your own backend via Docker Compose or use our free managed tier with 15 free AI queries daily.
              </p>
            </div>
            <div className="mt-4 pt-3 border-t border-glint-border/60 text-[11px] font-mono font-bold text-candy-cyanLight">
              ❤️ MIT Licensed FOSS
            </div>
          </div>
        </div>
      </section>

      {/* Install & Download Section */}
      <section id="install" className="relative z-20 py-20 px-6 max-w-4xl mx-auto w-full text-center">
        <h2 className="text-3xl font-black text-white">Install Glint on Your Machine</h2>
        <p className="text-sm text-slate-300 mt-2">
          One terminal command to install or grab prebuilt binaries for Linux.
        </p>

        {/* Terminal Quick Box */}
        <div className="mt-6 flex items-center justify-between rounded-2xl bg-[#090C16] border-2 border-candy-violet/40 p-4 max-w-xl mx-auto shadow-2xl font-mono text-xs">
          <div className="flex items-center gap-2 overflow-x-auto select-text text-candy-cyan">
            <span className="text-candy-pink font-bold select-none">$</span>
            <span>{curlCommand}</span>
          </div>
          <button
            onClick={copyCurl}
            className={`shrink-0 ml-3 flex items-center gap-1.5 px-3 py-1.5 rounded-xl font-bold transition-all ${
              curlCopied
                ? 'bg-candy-mint text-slate-950 font-black'
                : 'bg-candy-violet hover:bg-candy-pink text-white'
            }`}
          >
            {curlCopied ? <Check className="w-3.5 h-3.5 stroke-[3]" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{curlCopied ? 'Copied!' : 'Copy'}</span>
          </button>
        </div>

        {/* Download Buttons */}
        <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
          <a
            href="https://github.com/joychandrauday/glint/releases"
            className="flex items-center gap-2 px-5 py-3 rounded-2xl bg-glint-card border border-glint-border hover:border-candy-violet text-slate-200 text-xs font-bold transition-all hover:scale-105"
          >
            <Download className="w-4 h-4 text-candy-violet" />
            <span>Download .AppImage (x86_64)</span>
          </a>

          <a
            href="https://github.com/joychandrauday/glint/releases"
            className="flex items-center gap-2 px-5 py-3 rounded-2xl bg-glint-card border border-glint-border hover:border-candy-pink text-slate-200 text-xs font-bold transition-all hover:scale-105"
          >
            <Download className="w-4 h-4 text-candy-pink" />
            <span>Download .deb Package</span>
          </a>
        </div>
      </section>

      {/* Footer */}
      <footer className="relative z-20 border-t border-glint-border/60 py-8 px-6 text-center text-xs text-slate-500">
        <div className="max-w-4xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="font-black text-white">Glint</span>
            <span>—</span>
            <span>Zero-context-switch floating command overlay</span>
          </div>
          <div className="flex items-center gap-4 text-slate-400">
            <a href="https://github.com/joychandrauday/glint" className="hover:text-white">
              GitHub
            </a>
            <span>•</span>
            <span>MIT License</span>
            <span>•</span>
            <span className="flex items-center gap-1">
              Crafted with <Heart className="w-3 h-3 text-candy-pink fill-candy-pink" /> for Linux
            </span>
          </div>
        </div>
      </footer>
    </div>
  );
};
