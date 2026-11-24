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
      <div className="rounded-2xl bg-slate-900/90 border border-slate-800 p-8 sm:p-12 text-center flex flex-col items-center shadow-2xl relative group">
        <div
          aria-hidden="true"
          className="absolute -inset-1 rounded-3xl bg-gradient-to-r from-cyan-500/15 via-teal-500/10 to-emerald-500/15 blur-xl opacity-60 pointer-events-none"
        />

        <div className="relative inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-slate-800 border border-slate-700 text-slate-300 caption-1 mb-6 font-mono text-xs">
          <Sparkle size={14} weight="fill" className="text-cyan-400" />
          <span>Never leave your terminal for answers again</span>
        </div>

        <h2 className="relative heading-1 text-white max-w-[720px] mb-4 tracking-tight">
          Supercharge Your Terminal Workflow
        </h2>

        <p className="relative body-2 text-slate-300 max-w-[620px] mb-8 text-base sm:text-lg leading-relaxed">
          Install the 548 KB standalone binary or the lightweight desktop overlay. Bring your favorite AI key, save up to 90% tokens with instant caching, and keep shipping.
        </p>

        {/* Primary Action Buttons */}
        <div className="relative flex flex-col sm:flex-row items-center gap-3 mb-8 w-full sm:w-auto">
          <a
            href={downloadInfo.downloadUrl}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 py-3 px-6 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-medium shadow-lg shadow-cyan-600/30 transition-all duration-200 active:scale-[0.98]"
          >
            <DownloadSimple size={18} weight="bold" />
            <span>{downloadInfo.label}</span>
          </a>

          <button
            type="button"
            onClick={handleCopy}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 py-3 px-5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 font-mono text-xs transition-all duration-200 active:scale-[0.98] cursor-pointer"
          >
            <Terminal size={16} weight="bold" className="text-cyan-400" />
            <span>curl install.sh</span>
            {copied ? (
              <Check size={14} weight="bold" className="text-emerald-400" />
            ) : (
              <Copy size={14} weight="bold" className="text-slate-400" />
            )}
          </button>
        </div>

        {/* Platform Downloads Bar */}
        <div className="relative flex flex-wrap items-center justify-center gap-3 text-slate-300 text-xs mb-8">
          <a
            href={downloadInfo.cliUrl}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 border border-slate-700 hover:border-cyan-400 text-cyan-400 font-mono transition-all"
          >
            <Terminal size={15} weight="bold" />
            <span>CLI (548 KB)</span>
          </a>
          <a
            href="https://github.com/joychandrauday/glint/releases/download/v0.2.22/Glint-0.2.14-linux-amd64.deb"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 border border-slate-700 hover:border-cyan-400 text-slate-300 hover:text-white transition-all"
          >
            <LinuxLogo size={15} weight="bold" />
            <span>Linux (.deb)</span>
          </a>
          <a
            href="https://github.com/joychandrauday/glint/releases/download/v0.2.22/Glint-0.2.14-linux-x86_64.AppImage"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 border border-slate-700 hover:border-cyan-400 text-slate-300 hover:text-white transition-all"
          >
            <LinuxLogo size={15} weight="bold" />
            <span>Linux (.AppImage)</span>
          </a>
          <a
            href="https://github.com/joychandrauday/glint/releases/download/v0.2.22/Glint-0.2.14-win-x64.exe"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 border border-slate-700 hover:border-cyan-400 text-slate-300 hover:text-white transition-all"
          >
            <WindowsLogo size={15} weight="bold" />
            <span>Windows (.exe)</span>
          </a>
          <a
            href="https://github.com/joychandrauday/glint/releases/download/v0.2.22/Glint-0.2.14-mac-arm64.dmg"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 border border-slate-700 hover:border-cyan-400 text-slate-300 hover:text-white transition-all"
          >
            <AppleLogo size={15} weight="bold" />
            <span>macOS (.dmg)</span>
          </a>
        </div>

        {/* Risk Reversal Signal */}
        <div className="relative pt-6 border-t border-slate-800 flex items-center justify-center gap-2 text-slate-400 caption-4 font-mono">
          <ShieldCheck size={16} weight="bold" className="text-emerald-400" />
          <span>Zero telemetry • MIT open source license • No credit card required</span>
        </div>
      </div>
    </section>
  );
}
