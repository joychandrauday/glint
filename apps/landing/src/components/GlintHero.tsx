import React, { useState, useEffect } from "react";
import {
  DownloadSimple,
  Copy,
  Check,
  Terminal,
  Lightning,
  Sparkle,
  ArrowRight,
} from "@phosphor-icons/react";
import { GlintOverlayTemplate } from "./GlintOverlayTemplate";
import { detectOS, getDownloadInfo, OSDownloadInfo } from "../utils/detectOS";

export function GlintHero() {
  const [copied, setCopied] = useState(false);
  const [downloadInfo, setDownloadInfo] = useState<OSDownloadInfo>(() => getDownloadInfo("linux"));
  const installCommand = "curl -fsSL https://glint.g2gdigital.com/install.sh | bash";

  useEffect(() => {
    const os = detectOS();
    setDownloadInfo(getDownloadInfo(os));
  }, []);

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
      {/* Background ambient lighting accents */}
      <div
        aria-hidden="true"
        className="absolute top-12 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-gradient-to-tr from-[#7D23D9]/20 via-[#0DE4F3]/15 to-[#BDFB03]/10 blur-3xl pointer-events-none rounded-full"
      />

      {/* Category & Global Keybinding Pill */}
      <div className="relative inline-flex items-center gap-2.5 px-4 py-2 rounded-full bg-[#110939]/90 border border-[#261C63] text-slate-300 caption-1 mb-8 shadow-xl shadow-[#0B0726]/60 backdrop-blur-md">
        <span className="flex h-2 w-2 rounded-full bg-[#BDFB03] animate-pulse" />
        <span className="font-medium text-slate-200">The Zero-Context-Switch HUD</span>
        <span className="text-[#261C63]">•</span>
        <span className="inline-flex items-center gap-1 font-mono text-xs">
          <kbd className="px-1.5 py-0.5 rounded bg-[#160E45] border border-[#3A2A9F] text-[#0DE4F3] shadow-inner font-semibold">
            Ctrl
          </kbd>
          <span className="text-slate-400">+</span>
          <kbd className="px-2 py-0.5 rounded bg-[#160E45] border border-[#3A2A9F] text-[#BDFB03] shadow-inner font-semibold">
            Space
          </kbd>
        </span>
      </div>

      {/* Hero Headline - Core Key Point */}
      <h1 className="relative heading-1 max-w-[820px] mb-6 text-white tracking-tight">
        Never leave your code
        <br />
        <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#0DE4F3] via-[#BDFB03] to-[#FED02A]">
          to search for a command.
        </span>
      </h1>

      {/* Subheadline articulating the developer pain and the instant reflex */}
      <p className="relative body-2 text-slate-300 max-w-[700px] mb-8 text-base sm:text-lg leading-relaxed">
        Context-switching destroys deep focus. Stop leaving your terminal or IDE to sift through browser tabs, cookie banners, and outdated blogs. Press{" "}
        <kbd className="px-2 py-0.5 rounded-md bg-[#160E45] border border-[#261C63] text-[#BDFB03] font-mono text-sm shadow-sm font-semibold">
          Ctrl + Space
        </kbd>{" "}
        to summon Glint directly over your active window, recall syntax in &lt;2ms, and get it done.
      </p>

      {/* Primary Actions Area */}
      <div className="relative flex flex-col sm:flex-row items-center gap-3.5 mb-6 w-full sm:w-auto">
        <a
          href={downloadInfo.downloadUrl}
          className="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 py-3 px-6 rounded-xl bg-[#7D23D9] text-white font-medium hover:bg-[#7D23D9]/90 border border-[#7D23D9]/70 shadow-lg shadow-[#7D23D9]/30 hover:shadow-[#7D23D9]/50 transition-all duration-300 active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#BDFB03]"
        >
          <DownloadSimple size={20} weight="bold" />
          <span>{downloadInfo.label}</span>
        </a>

        {/* Terminal Quick Copy Button */}
        <button
          type="button"
          onClick={handleCopy}
          aria-label="Copy terminal install command"
          className="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 py-3 px-5 rounded-xl bg-[#110939] text-slate-200 hover:text-white border border-[#261C63] hover:border-[#3A2A9F] font-medium transition-all duration-300 active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#BDFB03] group cursor-pointer shadow-md"
        >
          <Terminal size={18} weight="bold" className="text-[#0DE4F3] group-hover:text-white transition-colors" />
          <code className="font-mono text-xs text-slate-300">curl install.sh</code>
          {copied ? (
            <span className="inline-flex items-center gap-1 text-[#BDFB03] text-xs font-semibold">
              <Check size={14} weight="bold" /> Copied
            </span>
          ) : (
            <Copy size={16} weight="bold" className="text-slate-400 group-hover:text-slate-200 transition-colors" />
          )}
        </button>
      </div>

      {/* Proof Signals & Reflex Value */}
      <div className="relative flex flex-wrap items-center justify-center gap-x-5 gap-y-2 text-slate-400 caption-2 mb-14">
        <span className="inline-flex items-center gap-1.5 text-slate-300">
          <Lightning size={14} weight="fill" className="text-[#BDFB03]" />
          Instant &lt;2ms recall
        </span>
        <span className="text-[#261C63]">•</span>
        <span className="text-slate-300">38 preseeded offline runbooks</span>
        <span className="text-[#261C63]">•</span>
        <span className="text-slate-300">Cursor focus auto-restores</span>
        <span className="text-[#261C63]">•</span>
        <span className="text-[#0DE4F3] font-mono text-xs">100% Free & Open Source</span>
      </div>

      {/* Hero Visual: Exact Desktop Overlay Template */}
      <div className="relative w-full">
        <GlintOverlayTemplate />
      </div>
    </section>
  );
}
