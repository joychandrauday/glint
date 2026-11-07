import React, { useState } from "react";
import {
  DownloadSimple,
  Copy,
  Check,
  Terminal,
  Lightning,
  Sparkle,
} from "@phosphor-icons/react";

export function GlintHero() {
  const [copied, setCopied] = useState(false);
  const [activePort, setActivePort] = useState("3000");
  const [activeService, setActiveService] = useState("web");

  const installCommand = "curl -fsSL https://glint.g2gdigital.com/install.sh | bash";

  const handleCopy = () => {
    navigator.clipboard.writeText(installCommand);
    setCopied(true);
    setTimeout(() => setCopied(false), 2200);
  };

  return (
    <section
      id="top"
      className="relative pt-32 pb-20 px-4 sm:px-6 max-w-6xl mx-auto flex flex-col items-center text-center"
    >
      {/* Category Pill Badge */}
      <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#181818] border border-[#272727] text-neutral-300 caption-1 mb-8 shadow-sm">
        <Sparkle size={14} weight="fill" className="text-amber-400" />
        <span>Always on top developer overlay for desktop</span>
      </div>

      {/* Hero Headline with B5 Gradient & 680px Max Width */}
      <h1 className="heading-1 hero-gradient-text max-w-[680px] mb-6">
        Instant command recall
        <br />
        without breaking your flow
      </h1>

      {/* Subheadline capped at 680px with no hyphens */}
      <p className="body-2 text-neutral-400 max-w-[680px] mb-8">
        Glint is a lightweight floating desktop overlay for developers. Summon
        instant runbooks, debug terminal errors, and query local or cloud models
        in less than two milliseconds.
      </p>

      {/* Primary Actions Area */}
      <div className="flex flex-col sm:flex-row items-center gap-3 mb-6 w-full sm:w-auto">
        <a
          href="#download"
          className="w-full sm:w-auto inline-flex items-center justify-center gap-2 py-2 px-3 rounded-xl bg-white text-black button-md hover:bg-neutral-200 transition-all duration-300 active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-neutral-400 shadow-lg"
        >
          <DownloadSimple size={18} weight="bold" />
          <span>Download Glint free</span>
        </a>

        {/* Terminal Quick Copy Button */}
        <button
          type="button"
          onClick={handleCopy}
          aria-label="Copy terminal install command"
          className="w-full sm:w-auto inline-flex items-center justify-center gap-2 py-2 px-3 rounded-xl bg-[#181818] text-neutral-200 hover:text-white border border-[#272727] hover:border-[#313131] button-md transition-all duration-300 active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-neutral-400 group"
        >
          <Terminal size={16} weight="bold" className="text-neutral-400 group-hover:text-white" />
          <code className="font-mono text-xs text-neutral-300">curl install.sh</code>
          {copied ? (
            <span className="inline-flex items-center gap-1 text-emerald-400 text-xs">
              <Check size={14} weight="bold" /> Copied
            </span>
          ) : (
            <Copy size={14} weight="bold" className="text-neutral-500 group-hover:text-neutral-300" />
          )}
        </button>
      </div>

      {/* One Proof Signal */}
      <div className="flex flex-wrap items-center justify-center gap-x-4 gap-y-2 text-neutral-400 caption-2 mb-16">
        <span className="inline-flex items-center gap-1.5">
          <Lightning size={14} weight="fill" className="text-emerald-400" />
          38 curated offline playbooks
        </span>
        <span className="text-neutral-600">•</span>
        <span>Sub two millisecond recall</span>
        <span className="text-neutral-600">•</span>
        <span>MIT licensed open source</span>
      </div>

      {/* Hero Visual: Frameless Desktop Floating HUD Mockup */}
      <div className="w-full max-w-3xl rounded-2xl border border-[#272727] bg-[#181818] p-2 sm:p-3 shadow-2xl text-left">
        {/* Outer HUD Header */}
        <div className="flex items-center justify-between px-3 py-2 border-b border-[#272727] bg-[#1F1F1F] rounded-xl mb-3">
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-rose-500/80 inline-block" />
            <span className="w-3 h-3 rounded-full bg-amber-500/80 inline-block" />
            <span className="w-3 h-3 rounded-full bg-emerald-500/80 inline-block" />
            <span className="caption-3 text-neutral-400 font-mono ml-2">glint overlay (active)</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="caption-4 text-emerald-400 bg-emerald-950/60 border border-emerald-800/50 px-2 py-0.5 rounded-full">
              1.8ms match
            </span>
            <kbd className="caption-5 font-mono bg-[#272727] text-neutral-300 px-1.5 py-0.5 rounded border border-[#313131]">
              Ctrl+Space
            </kbd>
          </div>
        </div>

        {/* Input Bar Inside Mockup */}
        <div className="px-3 py-2 bg-[#131209] border border-[#272727] rounded-xl flex items-center gap-3 mb-3">
          <Terminal size={18} weight="bold" className="text-amber-400 shrink-0" />
          <div className="title-4 text-neutral-200 font-mono flex-1">
            docker run nginx container with port mapping
          </div>
          <span className="caption-5 text-neutral-400 bg-[#272727] px-2 py-0.5 rounded border border-[#313131]">
            Local vault
          </span>
        </div>

        {/* Interactive Parameter Control Bar */}
        <div className="p-3 bg-[#1F1F1F] border border-[#272727] rounded-xl mb-3">
          <div className="flex items-center justify-between mb-2">
            <span className="caption-3 text-neutral-300">Live parameter pills</span>
            <span className="caption-5 text-neutral-400">Edit values to update command live</span>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <label className="flex items-center gap-1.5 caption-4 text-neutral-300">
              <span className="font-mono text-emerald-400">&#123;&#123;port&#125;&#125;:</span>
              <input
                type="text"
                value={activePort}
                onChange={(e) => setActivePort(e.target.value)}
                className="w-20 px-2 py-1 bg-[#131209] border border-[#272727] rounded text-white font-mono text-xs focus:outline-none focus:border-neutral-400"
              />
            </label>
            <label className="flex items-center gap-1.5 caption-4 text-neutral-300">
              <span className="font-mono text-cyan-400">&#123;&#123;service&#125;&#125;:</span>
              <input
                type="text"
                value={activeService}
                onChange={(e) => setActiveService(e.target.value)}
                className="w-24 px-2 py-1 bg-[#131209] border border-[#272727] rounded text-white font-mono text-xs focus:outline-none focus:border-neutral-400"
              />
            </label>
          </div>
        </div>

        {/* Command Output Bubble */}
        <div className="p-4 bg-[#1F1F1F] border border-[#272727] rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="font-mono text-xs text-neutral-200 overflow-x-auto">
            <span className="text-amber-400">docker</span> run <span className="text-neutral-400">-d</span> <span className="text-neutral-400">--name</span> <span className="text-cyan-400 font-semibold">{activeService || "web"}</span> <span className="text-neutral-400">-p</span> <span className="text-emerald-400 font-semibold">{activePort || "3000"}</span>:80 nginx:alpine
          </div>
          <button
            type="button"
            onClick={() => {
              navigator.clipboard.writeText(`docker run -d --name ${activeService} -p ${activePort}:80 nginx:alpine`);
            }}
            className="self-start sm:self-auto shrink-0 inline-flex items-center gap-1.5 py-1.5 px-3 rounded-lg bg-[#272727] hover:bg-[#313131] border border-[#313131] text-neutral-200 caption-3 transition-colors active:scale-[0.98]"
          >
            <Copy size={14} weight="bold" />
            <span>Copy command</span>
          </button>
        </div>
      </div>
    </section>
  );
}
