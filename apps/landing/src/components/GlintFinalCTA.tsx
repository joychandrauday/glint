import React, { useState } from "react";
import {
  DownloadSimple,
  Terminal,
  Copy,
  Check,
  LinuxLogo,
  WindowsLogo,
  AppleLogo,
  ShieldCheck,
  Sparkle,
} from "@phosphor-icons/react";

export function GlintFinalCTA() {
  const [copied, setCopied] = useState(false);
  const curlCmd = "curl -fsSL https://glint.g2gdigital.com/install.sh | bash";

  const handleCopy = () => {
    navigator.clipboard.writeText(curlCmd);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <section id="download" className="py-24 px-4 sm:px-6 max-w-5xl mx-auto">
      <div className="rounded-2xl bg-[#181818] border border-[#272727] p-8 sm:p-12 text-center flex flex-col items-center shadow-2xl">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#272727] border border-[#313131] text-neutral-300 caption-1 mb-6">
          <Sparkle size={14} weight="fill" className="text-amber-400" />
          <span>Ready for your daily workflow</span>
        </div>

        <h2 className="heading-1 hero-gradient-text max-w-[680px] mb-4">
          Eliminate context switching today
        </h2>

        <p className="body-2 text-neutral-400 max-w-[560px] mb-8">
          Install the free desktop overlay and summon thirty eight offline
          developer runbooks with a single keystroke.
        </p>

        {/* Primary Action Buttons */}
        <div className="flex flex-col sm:flex-row items-center gap-3 mb-8 w-full sm:w-auto">
          <a
            href="https://github.com/joychandrauday/glint/releases/latest"
            target="_blank"
            rel="noreferrer"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 py-2 px-3 rounded-xl bg-white text-black button-md hover:bg-neutral-200 transition-all duration-300 active:scale-[0.98] shadow-lg"
          >
            <DownloadSimple size={18} weight="bold" />
            <span>Download for Linux (deb / AppImage)</span>
          </a>

          <button
            type="button"
            onClick={handleCopy}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 py-2 px-3 rounded-xl bg-[#272727] text-white hover:bg-[#313131] border border-[#313131] button-md transition-all duration-300 active:scale-[0.98]"
          >
            <Terminal size={16} weight="bold" />
            <span className="font-mono text-xs">curl install.sh</span>
            {copied ? (
              <Check size={14} weight="bold" className="text-emerald-400" />
            ) : (
              <Copy size={14} weight="bold" className="text-neutral-400" />
            )}
          </button>
        </div>

        {/* Platform Downloads Bar */}
        <div className="flex flex-wrap items-center justify-center gap-4 text-neutral-400 caption-3 mb-8">
          <a
            href="https://github.com/joychandrauday/glint/releases/latest"
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-1.5 hover:text-white transition-colors"
          >
            <LinuxLogo size={16} weight="bold" />
            <span>Linux .deb and .AppImage</span>
          </a>
          <span className="text-neutral-700">•</span>
          <a
            href="https://github.com/joychandrauday/glint/releases/latest"
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-1.5 hover:text-white transition-colors"
          >
            <WindowsLogo size={16} weight="bold" />
            <span>Windows .exe installer</span>
          </a>
          <span className="text-neutral-700">•</span>
          <a
            href="https://github.com/joychandrauday/glint/releases/latest"
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-1.5 hover:text-white transition-colors"
          >
            <AppleLogo size={16} weight="bold" />
            <span>macOS Apple Silicon and Intel</span>
          </a>
        </div>

        {/* Risk Reversal Signal */}
        <div className="pt-6 border-t border-[#272727] flex items-center justify-center gap-2 text-neutral-500 caption-4">
          <ShieldCheck size={16} weight="bold" className="text-emerald-400" />
          <span>Zero telemetry • MIT open source license • No credit card required</span>
        </div>
      </div>
    </section>
  );
}
