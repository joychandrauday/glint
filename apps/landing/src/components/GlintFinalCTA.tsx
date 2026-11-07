import React, { useState, useEffect } from "react";
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
import { detectOS, getDownloadInfo, OSDownloadInfo } from "../utils/detectOS";

export function GlintFinalCTA() {
  const [copied, setCopied] = useState(false);
  const [downloadInfo, setDownloadInfo] = useState<OSDownloadInfo>(() => getDownloadInfo("linux"));
  const curlCmd = "curl -fsSL https://glint.g2gdigital.com/install.sh | bash";

  useEffect(() => {
    const os = detectOS();
    setDownloadInfo(getDownloadInfo(os));
  }, []);

  const handleCopy = () => {
    navigator.clipboard.writeText(curlCmd);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <section id="download" className="py-24 px-4 sm:px-6 max-w-5xl mx-auto">
      <div className="rounded-2xl bg-[#110939] border border-[#261C63] p-8 sm:p-12 text-center flex flex-col items-center shadow-2xl relative group">
        <div
          aria-hidden="true"
          className="absolute -inset-1 rounded-3xl bg-gradient-to-r from-[#7D23D9]/20 via-[#0DE4F3]/15 to-[#BDFB03]/20 blur-xl opacity-60 pointer-events-none"
        />

        <div className="relative inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#160E45] border border-[#261C63] text-slate-300 caption-1 mb-6 font-mono">
          <Sparkle size={14} weight="fill" className="text-[#BDFB03]" />
          <span>Never leave home row again</span>
        </div>

        <h2 className="relative heading-1 text-white max-w-[720px] mb-4 tracking-tight">
          Never leave your terminal for answers again
        </h2>

        <p className="relative body-2 text-slate-300 max-w-[620px] mb-8 text-base sm:text-lg leading-relaxed">
          Install the lightweight desktop HUD. Press <kbd className="px-2 py-0.5 rounded bg-[#160E45] border border-[#261C63] text-[#BDFB03] font-mono text-sm font-semibold">Ctrl + Space</kbd> anytime, get your command or AI insight in &lt;2ms, and keep shipping.
        </p>

        {/* Primary Action Buttons */}
        <div className="relative flex flex-col sm:flex-row items-center gap-3 mb-8 w-full sm:w-auto">
          <a
            href={downloadInfo.downloadUrl}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 py-2.5 px-5 rounded-xl bg-[#7D23D9] text-white button-md hover:bg-[#7D23D9]/90 border border-[#7D23D9]/60 shadow-lg shadow-[#7D23D9]/30 transition-all duration-300 active:scale-[0.98]"
          >
            <DownloadSimple size={18} weight="bold" />
            <span>{downloadInfo.label}</span>
          </a>

          <button
            type="button"
            onClick={handleCopy}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-[#160E45] text-slate-200 hover:text-white border border-[#261C63] hover:border-[#3A2A9F] button-md transition-all duration-300 active:scale-[0.98] cursor-pointer"
          >
            <Terminal size={16} weight="bold" className="text-[#0DE4F3]" />
            <span className="font-mono text-xs">curl install.sh</span>
            {copied ? (
              <Check size={14} weight="bold" className="text-[#BDFB03]" />
            ) : (
              <Copy size={14} weight="bold" className="text-slate-400" />
            )}
          </button>
        </div>

        {/* Platform Downloads Bar */}
        <div className="relative flex flex-wrap items-center justify-center gap-4 text-slate-400 caption-3 mb-8">
          <a
            href="https://github.com/joychandrauday/glint/releases/latest"
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-1.5 hover:text-[#0DE4F3] transition-colors"
          >
            <LinuxLogo size={16} weight="bold" />
            <span>Linux (.deb, .AppImage, AUR)</span>
          </a>
          <span className="text-[#261C63]">•</span>
          <a
            href="https://github.com/joychandrauday/glint/releases/latest"
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-1.5 hover:text-[#0DE4F3] transition-colors"
          >
            <WindowsLogo size={16} weight="bold" />
            <span>Windows (.exe, winget)</span>
          </a>
          <span className="text-[#261C63]">•</span>
          <a
            href="https://github.com/joychandrauday/glint/releases/latest"
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-1.5 hover:text-[#0DE4F3] transition-colors"
          >
            <AppleLogo size={16} weight="bold" />
            <span>macOS (Apple Silicon & Intel)</span>
          </a>
        </div>

        {/* Risk Reversal Signal */}
        <div className="relative pt-6 border-t border-[#261C63] flex items-center justify-center gap-2 text-slate-400 caption-4 font-mono">
          <ShieldCheck size={16} weight="bold" className="text-[#BDFB03]" />
          <span>Zero telemetry • MIT open source license • No credit card required</span>
        </div>
      </div>
    </section>
  );
}
