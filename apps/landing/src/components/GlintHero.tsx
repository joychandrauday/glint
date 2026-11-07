import React, { useState } from "react";
import {
  DownloadSimple,
  Copy,
  Check,
  Terminal,
  Lightning,
  Sparkle,
} from "@phosphor-icons/react";
import { GlintOverlayTemplate } from "./GlintOverlayTemplate";

export function GlintHero() {
  const [copied, setCopied] = useState(false);
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
      {/* Category Pill Badge with Electric Lime Accent */}
      <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#110939] border border-[#261C63] text-slate-300 caption-1 mb-8 shadow-sm">
        <Sparkle size={14} weight="fill" className="text-[#BDFB03]" />
        <span>Always on top developer overlay for desktop</span>
      </div>

      {/* Hero Headline */}
      <h1 className="heading-1 max-w-[720px] mb-6 text-white tracking-tight">
        Instant command recall
        <br />
        <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#0DE4F3] via-[#BDFB03] to-[#FED02A]">
          without breaking your flow
        </span>
      </h1>

      {/* Subheadline capped at 680px with zero hyphens */}
      <p className="body-2 text-slate-300 max-w-[680px] mb-8">
        Glint is a lightweight floating desktop overlay for developers. Summon
        instant runbooks, debug terminal errors, and query local or cloud models
        in less than two milliseconds.
      </p>

      {/* Primary Actions Area */}
      <div className="flex flex-col sm:flex-row items-center gap-3 mb-6 w-full sm:w-auto">
        <a
          href="#download"
          className="w-full sm:w-auto inline-flex items-center justify-center gap-2 py-2.5 px-5 rounded-xl bg-[#7D23D9] text-white button-md hover:bg-[#7D23D9]/90 border border-[#7D23D9]/60 shadow-lg shadow-[#7D23D9]/30 transition-all duration-300 active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#BDFB03]"
        >
          <DownloadSimple size={18} weight="bold" />
          <span>Download Glint free</span>
        </a>

        {/* Terminal Quick Copy Button */}
        <button
          type="button"
          onClick={handleCopy}
          aria-label="Copy terminal install command"
          className="w-full sm:w-auto inline-flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-[#110939] text-slate-200 hover:text-white border border-[#261C63] hover:border-[#3A2A9F] button-md transition-all duration-300 active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#BDFB03] group cursor-pointer"
        >
          <Terminal size={16} weight="bold" className="text-[#0DE4F3] group-hover:text-white" />
          <code className="font-mono text-xs text-slate-300">curl install.sh</code>
          {copied ? (
            <span className="inline-flex items-center gap-1 text-[#BDFB03] text-xs">
              <Check size={14} weight="bold" /> Copied
            </span>
          ) : (
            <Copy size={14} weight="bold" className="text-slate-400 group-hover:text-slate-200" />
          )}
        </button>
      </div>

      {/* One Proof Signal */}
      <div className="flex flex-wrap items-center justify-center gap-x-4 gap-y-2 text-slate-400 caption-2 mb-14">
        <span className="inline-flex items-center gap-1.5">
          <Lightning size={14} weight="fill" className="text-[#BDFB03]" />
          38 curated offline playbooks
        </span>
        <span className="text-[#261C63]">•</span>
        <span>Sub two millisecond recall</span>
        <span className="text-[#261C63]">•</span>
        <span>MIT licensed open source</span>
      </div>

      {/* Hero Visual: Exact Desktop Overlay Template */}
      <div className="w-full">
        <GlintOverlayTemplate />
      </div>
    </section>
  );
}
