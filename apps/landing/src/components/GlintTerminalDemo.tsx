import React, { useState } from "react";
import {
  Terminal,
  Copy,
  Check,
  Lightning,
  Sparkle,
  Database,
  MagnifyingGlass,
  Sliders,
} from "@phosphor-icons/react";

interface TerminalTab {
  id: string;
  name: string;
  icon: any;
  command: string;
  output: React.ReactNode;
}

export function GlintTerminalDemo() {
  const [activeTab, setActiveTab] = useState(0);
  const [copied, setCopied] = useState(false);

  const TABS: TerminalTab[] = [
    {
      id: "chat",
      name: "Conversational AI Co-Pilot",
      icon: Sparkle,
      command: "glint ask 'how to check open listening ports on linux'",
      output: (
        <div className="space-y-3 font-mono text-xs sm:text-sm">
          <div className="text-cyan-400 font-bold">╭─ ⚡ Glint [gemini:gemini-3.5-flash-lite]</div>
          <div className="border-l-2 border-slate-700 pl-3 space-y-2 text-slate-300">
            <p>Hey there! The modern replacement for netstat is <span className="text-amber-300 font-bold">ss</span>. It queries the kernel directly and runs instantly:</p>
            
            <div className="rounded-lg bg-slate-950 border border-slate-800 p-3 my-2">
              <div className="text-xs text-cyan-400 font-bold mb-1 border-b border-slate-800 pb-1 flex items-center justify-between">
                <span>BASH</span>
                <span className="text-slate-500 font-normal">syntax-highlighted</span>
              </div>
              <div className="text-emerald-300 font-semibold">$ sudo ss -tulpn</div>
            </div>

            <p className="text-xs text-slate-400">Key flags to know:</p>
            <ul className="text-xs space-y-1 text-slate-300 pl-2">
              <li><span className="text-cyan-400">• -t</span>: Show TCP listening sockets</li>
              <li><span className="text-cyan-400">• -u</span>: Show UDP listening sockets</li>
              <li><span className="text-cyan-400">• -l</span>: Filter for listening state only</li>
              <li><span className="text-cyan-400">• -p</span>: Display process name & PID</li>
            </ul>
          </div>
          <div className="text-slate-500 text-xs">
            ╰─ <span className="text-slate-400">⚡ 405 tokens</span> • <span className="text-slate-400">1.12s</span> • <span className="text-cyan-400">gemini:gemini-3.5-flash-lite</span>
          </div>
        </div>
      ),
    },
    {
      id: "cache",
      name: "0-Token Cache Replay",
      icon: Database,
      command: "glint ask 'how to check open listening ports on linux'",
      output: (
        <div className="space-y-3 font-mono text-xs sm:text-sm">
          <div className="text-cyan-400 font-bold">╭─ ⚡ Glint [gemini:gemini-3.5-flash-lite]</div>
          <div className="border-l-2 border-slate-700 pl-3 space-y-2 text-slate-300">
            <p className="text-emerald-400 text-xs font-semibold">⚡ Exact Match Retained in Local Semantic Disk Cache (&lt;10ms)</p>
            <p>Hey there! The modern replacement for netstat is <span className="text-amber-300 font-bold">ss</span>:</p>
            
            <div className="rounded-lg bg-slate-950 border border-slate-800 p-3 my-2">
              <div className="text-xs text-cyan-400 font-bold mb-1 border-b border-slate-800 pb-1">BASH</div>
              <div className="text-emerald-300 font-semibold">$ sudo ss -tulpn</div>
            </div>
          </div>
          <div className="text-xs flex flex-wrap items-center gap-2">
            <span className="text-slate-500">╰─</span>
            <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 font-bold border border-emerald-500/30">
              ⚡ CACHED (0 TOKENS)
            </span>
            <span className="text-slate-400">• 0.00s</span>
            <span className="text-slate-400">• gemini-3.5-flash-lite</span>
            <span className="text-emerald-400 font-semibold">• saved ~$0.0014</span>
          </div>
        </div>
      ),
    },
    {
      id: "slash",
      name: "Slash Command Prefix Filtering",
      icon: Sliders,
      command: "glint (inside REPL) > /a",
      output: (
        <div className="space-y-3 font-mono text-xs sm:text-sm">
          <div className="text-cyan-400 font-bold">
            ╭──────────────────────────────────────────────────────────────────────────╮
            <br />
            │  🔍 Commands matching "/a" (4 found)                                     │
            <br />
            ╰──────────────────────────────────────────────────────────────────────────╯
          </div>
          <div className="space-y-2 text-slate-300 pl-2">
            <div className="flex items-center justify-between">
              <span className="text-cyan-300 font-bold">/ask [prompt]</span>
              <span className="text-slate-400 text-xs">Ask Glint AI directly with streaming response</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-cyan-300 font-bold">/agent</span>
              <span className="text-slate-400 text-xs">Switch to autonomous Agent mode</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-cyan-300 font-bold">/api [prov] [key]</span>
              <span className="text-slate-400 text-xs">View or set BYOK API key (alias for /keys)</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-cyan-300 font-bold">/about</span>
              <span className="text-slate-400 text-xs">Display Glint system information & telemetry</span>
            </div>
          </div>
          <div className="text-slate-500 text-xs pt-2">
            💡 Tip: Type command name or press &lt;Tab&gt; to autocomplete.
          </div>
        </div>
      ),
    },
    {
      id: "search",
      name: "500+ Offline Cheatsheets (<2ms)",
      icon: MagnifyingGlass,
      command: "glint search 'tar gzip compress'",
      output: (
        <div className="space-y-3 font-mono text-xs sm:text-sm">
          <div className="text-amber-400 font-semibold text-xs flex items-center gap-1.5">
            <Lightning size={14} weight="fill" />
            <span>Vault exact match (&lt;2ms deterministic offline lookup):</span>
          </div>
          
          <div className="rounded-lg bg-slate-950 border border-slate-800 p-4 space-y-2">
            <div className="flex items-center justify-between text-xs text-slate-400">
              <span className="px-2 py-0.5 rounded bg-cyan-950 text-cyan-300 font-bold border border-cyan-800">
                ⚡ FAST • SAFE
              </span>
              <span>category: linux [archive, compress, tar]</span>
            </div>
            <div className="text-emerald-300 font-bold text-sm sm:text-base pt-1">
              $ tar -czvf archive.tar.gz ./my-folder
            </div>
            <p className="text-xs text-slate-400 pt-1">
              Create a gzip-compressed tar archive from a folder without reading 20 manual pages.
            </p>
          </div>

          <div className="text-xs text-slate-400 flex items-center gap-3">
            <span>■ Actions:</span>
            <span className="text-cyan-400">⚡ Run command</span>
            <span className="text-slate-600">•</span>
            <span className="text-slate-300">📋 Copy to clipboard</span>
            <span className="text-slate-600">•</span>
            <span className="text-slate-300">✔ Continue session</span>
          </div>
        </div>
      ),
    },
  ];

  const currentTab = TABS[activeTab];

  const handleCopyCmd = () => {
    navigator.clipboard.writeText(currentTab.command);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <section id="demo" className="py-20 px-4 sm:px-6 max-w-5xl mx-auto">
      <div className="text-center mb-12">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-900 border border-slate-800 text-xs font-mono text-cyan-400 uppercase tracking-wider mb-4">
          <Terminal size={14} weight="bold" />
          <span>Interactive Terminal Experience</span>
        </div>
        <h2 className="heading-2 text-white mb-4">
          Terminal Intelligence in Action
        </h2>
        <p className="body-2 text-slate-300 max-w-[680px] mx-auto">
          Explore how Glint handles conversational AI, eliminates duplicate tokens through caching, filters slash commands, and provides instant offline cheatsheets.
        </p>
      </div>

      {/* Terminal Window Container */}
      <div className="rounded-2xl bg-[#0D1117] border border-slate-800 shadow-2xl overflow-hidden">
        {/* Terminal Titlebar */}
        <div className="px-4 py-3 bg-slate-900/90 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-rose-500/80 inline-block" />
            <span className="w-3 h-3 rounded-full bg-amber-500/80 inline-block" />
            <span className="w-3 h-3 rounded-full bg-emerald-500/80 inline-block" />
            <span className="ml-2 font-mono text-xs text-slate-400 font-medium">
              glint terminal — 80x24
            </span>
          </div>
          <span className="text-xs font-mono text-slate-400 hidden sm:inline">
            v0.2.23 (BYOK Mode)
          </span>
        </div>

        {/* Tab Switcher */}
        <div className="flex flex-wrap items-center gap-1.5 p-2 bg-slate-950/60 border-b border-slate-800/80">
          {TABS.map((tab, idx) => {
            const Icon = tab.icon;
            const isActive = activeTab === idx;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => {
                  setActiveTab(idx);
                  setCopied(false);
                }}
                className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-medium font-mono transition-all cursor-pointer ${
                  isActive
                    ? "bg-slate-800 text-cyan-300 border border-slate-700 shadow-sm"
                    : "text-slate-400 hover:text-slate-200 hover:bg-slate-900 border border-transparent"
                }`}
              >
                <Icon size={14} weight="bold" />
                <span>{tab.name}</span>
              </button>
            );
          })}
        </div>

        {/* Terminal Body */}
        <div className="p-4 sm:p-6 space-y-4 min-h-[320px] bg-slate-950/80">
          {/* User Prompt Line */}
          <div className="flex items-center justify-between pb-3 border-b border-slate-900">
            <div className="flex items-center gap-2 font-mono text-xs sm:text-sm text-slate-300">
              <span className="text-cyan-400 font-bold">╭─ [you] ~/projects</span>
              <span className="text-slate-600">⚡</span>
            </div>
            <button
              type="button"
              onClick={handleCopyCmd}
              className="text-xs text-slate-400 hover:text-cyan-300 flex items-center gap-1 font-mono transition-colors cursor-pointer"
              title="Copy input"
            >
              {copied ? (
                <span className="text-emerald-400 flex items-center gap-1">
                  <Check size={12} weight="bold" /> Copied
                </span>
              ) : (
                <>
                  <Copy size={12} weight="bold" />
                  <span>Copy</span>
                </>
              )}
            </button>
          </div>

          <div className="font-mono text-xs sm:text-sm text-emerald-400 font-semibold flex items-center gap-2">
            <span className="text-slate-500">╰─❯</span>
            <span>{currentTab.command}</span>
          </div>

          {/* Assistant Rendered Output */}
          <div className="pt-2">{currentTab.output}</div>
        </div>
      </div>
    </section>
  );
}
