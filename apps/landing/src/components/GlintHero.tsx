import React, { useState, useEffect } from "react";
import {
  DownloadSimple,
  Copy,
  Check,
  Terminal,
  Lightning,
  Sparkle,
  Cpu,
  Database,
  ShieldCheck,
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
      className="relative pt-32 pb-16 px-4 sm:px-6 max-w-6xl mx-auto flex flex-col items-center text-center"
    >
      {/* Background ambient lighting accents */}
      <div
        aria-hidden="true"
        className="absolute top-10 left-1/2 -translate-x-1/2 w-[650px] h-[350px] bg-gradient-to-tr from-cyan-500/15 via-emerald-500/10 to-indigo-500/10 blur-3xl pointer-events-none rounded-full"
      />

      {/* Version & Value Pill */}
      <div className="relative inline-flex items-center gap-2.5 px-4 py-1.5 rounded-full bg-slate-900/90 border border-slate-800 text-slate-300 text-xs font-mono mb-8 shadow-xl backdrop-blur-md">
        <span className="flex h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
        <span className="text-cyan-400 font-semibold">GLINT v0.2.23</span>
        <span className="text-slate-600">•</span>
        <span className="text-slate-300">Terminal AI Co-Pilot & Developer Knowledge Hub</span>
      </div>

      {/* Hero Headline */}
      <h1 className="relative heading-1 max-w-[860px] mb-6 text-white tracking-tight">
        The Terminal AI Co-Pilot
        <br />
        <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-teal-300 to-emerald-400">
          Built for Pure Velocity.
        </span>
      </h1>

      {/* Subheadline */}
      <p className="relative body-2 text-slate-300 max-w-[720px] mb-8 text-base sm:text-lg leading-relaxed">
        Universal BYOK AI assistance, multi-tier prompt caching, and 500+ offline cheatsheets in a 548 KB standalone binary. Zero telemetry, instant &lt;2ms recall, and zero context switching.
      </p>

      {/* Primary Actions Area: 1-Click Terminal Command & Desktop Download */}
      <div className="relative flex flex-col sm:flex-row items-center gap-3.5 mb-6 w-full sm:w-auto">
        {/* Terminal Quick Copy Button */}
        <div
          onClick={handleCopy}
          className="w-full sm:w-auto flex items-center gap-3 px-4 py-3 rounded-xl bg-slate-900/90 border border-slate-700/80 hover:border-cyan-500/60 shadow-lg cursor-pointer transition-all duration-200 group"
        >
          <Terminal size={18} weight="bold" className="text-cyan-400 shrink-0" />
          <code className="font-mono text-xs sm:text-sm text-slate-200 select-all">
            curl -fsSL https://glint.g2gdigital.com/install.sh | bash
          </code>
          <button
            type="button"
            className="p-1 rounded bg-slate-800 text-slate-400 group-hover:text-cyan-300 transition-colors ml-1"
            title="Copy command"
          >
            {copied ? (
              <span className="flex items-center gap-1 text-emerald-400 text-xs font-semibold">
                <Check size={14} weight="bold" /> Copied
              </span>
            ) : (
              <Copy size={16} weight="bold" />
            )}
          </button>
        </div>

        {/* Desktop Download Button */}
        <a
          href={downloadInfo.downloadUrl}
          className="w-full sm:w-auto inline-flex items-center justify-center gap-2 py-3 px-5 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-medium shadow-lg shadow-cyan-600/25 transition-all duration-200 active:scale-[0.98]"
        >
          <DownloadSimple size={18} weight="bold" />
          <span>{downloadInfo.label}</span>
        </a>
      </div>

      {/* Secondary Quick Links (CLI & Other Platforms) */}
      <div className="relative flex flex-wrap items-center justify-center gap-2 text-xs text-slate-400 mb-10">
        <span className="text-slate-500 font-mono">Downloads:</span>
        <a
          href={downloadInfo.cliUrl}
          className="px-2.5 py-1 rounded-md bg-slate-900 border border-slate-800 hover:border-cyan-400 text-cyan-400 font-mono transition-colors flex items-center gap-1"
        >
          <Terminal size={13} weight="bold" />
          <span>Universal CLI (548 KB)</span>
        </a>
        {downloadInfo.secondaryDownloads.map((sec) => (
          <a
            key={sec.name}
            href={sec.url}
            className="px-2.5 py-1 rounded-md bg-slate-900 border border-slate-800 hover:border-slate-600 text-slate-300 hover:text-white transition-colors"
          >
            {sec.name}
          </a>
        ))}
      </div>

      {/* Spec Pills */}
      <div className="relative flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-slate-400 text-xs font-mono mb-14">
        <span className="inline-flex items-center gap-1.5 text-slate-300">
          <Lightning size={14} weight="fill" className="text-amber-400" />
          &lt;2ms Offline Lookup
        </span>
        <span className="text-slate-700">•</span>
        <span className="inline-flex items-center gap-1.5 text-slate-300">
          <Cpu size={14} weight="fill" className="text-cyan-400" />
          Universal BYOK Engine
        </span>
        <span className="text-slate-700">•</span>
        <span className="inline-flex items-center gap-1.5 text-slate-300">
          <Database size={14} weight="fill" className="text-emerald-400" />
          Multi-Tier Token Cache
        </span>
        <span className="text-slate-700">•</span>
        <span className="inline-flex items-center gap-1.5 text-slate-300">
          <ShieldCheck size={14} weight="fill" className="text-teal-400" />
          100% Private (0 Telemetry)
        </span>
      </div>

      {/* Hero Visual: Exact Desktop Overlay Template */}
      <div className="relative w-full">
        <GlintOverlayTemplate />
      </div>
    </section>
  );
}
