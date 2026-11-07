import React from "react";
import {
  XCircle,
  CheckCircle,
  Browsers,
  Terminal,
  ClockAfternoon,
  Lightning,
  ArrowRight,
  Sparkle,
  Cpu,
  Keyboard,
} from "@phosphor-icons/react";

export function GlintProblemSolution() {
  return (
    <section id="the-problem" className="py-24 px-4 sm:px-6 max-w-6xl mx-auto">
      {/* Section Header */}
      <div className="text-center mb-16">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#160E45] border border-[#261C63] text-xs font-mono text-[#0DE4F3] uppercase tracking-wider mb-4">
          <Sparkle size={13} weight="fill" className="text-[#BDFB03]" />
          <span>The Core Problem & The Breakthrough</span>
        </div>
        <h2 className="heading-2 text-white mb-4 tracking-tight">
          Leaving your code destroys developer momentum.
        </h2>
        <p className="body-2 text-slate-300 max-w-[700px] mx-auto text-base sm:text-lg leading-relaxed">
          When you stumble upon an obscure CLI flag, regex rule, or crashed container, leaving your workspace to search the web derails your train of thought. Glint eliminates that friction permanently.
        </p>
      </div>

      {/* Comparison Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-stretch">
        {/* Card 1: The Pain (Leaving your code) */}
        <div className="p-7 sm:p-8 rounded-3xl bg-[#110939]/80 border border-rose-900/30 flex flex-col justify-between relative overflow-hidden group shadow-xl">
          <div
            aria-hidden="true"
            className="absolute top-0 right-0 w-64 h-64 bg-rose-500/5 rounded-full blur-3xl pointer-events-none"
          />

          <div>
            <div className="flex items-center justify-between mb-8 pb-4 border-b border-[#261C63]/60">
              <div className="flex items-center gap-3">
                <span className="p-2.5 rounded-xl bg-rose-950/60 border border-rose-800/40 text-[#F57265] shadow-inner">
                  <XCircle size={22} weight="bold" />
                </span>
                <div>
                  <h3 className="title-1 text-white font-semibold">The Tab-Hopping Tax</h3>
                  <p className="text-xs text-rose-400 font-mono">Leaving your active window</p>
                </div>
              </div>
              <span className="text-xs px-2.5 py-1 rounded-full bg-rose-950/40 text-[#F57265] border border-rose-900/40 font-mono">
                10-15 min lost
              </span>
            </div>

            <ol className="flex flex-col gap-5 mb-8">
              <li className="flex items-start gap-3.5">
                <span className="w-6 h-6 rounded-full bg-[#160E45] border border-[#261C63] text-slate-400 flex items-center justify-center text-xs font-mono shrink-0 mt-0.5">
                  1
                </span>
                <span className="text-sm text-slate-300 leading-snug">
                  You hit a wall in your terminal or IDE needing a complex <code className="text-rose-300 font-mono text-xs bg-rose-950/40 px-1 py-0.5 rounded">docker</code>, <code className="text-rose-300 font-mono text-xs bg-rose-950/40 px-1 py-0.5 rounded">find</code>, or <code className="text-rose-300 font-mono text-xs bg-rose-950/40 px-1 py-0.5 rounded">git</code> flag.
                </span>
              </li>
              <li className="flex items-start gap-3.5">
                <span className="w-6 h-6 rounded-full bg-[#160E45] border border-[#261C63] text-slate-400 flex items-center justify-center text-xs font-mono shrink-0 mt-0.5">
                  2
                </span>
                <span className="text-sm text-slate-300 leading-snug">
                  You <strong>Alt-Tab away from your editor</strong> to open Chrome, immediately breaking your working memory and focus.
                </span>
              </li>
              <li className="flex items-start gap-3.5">
                <span className="w-6 h-6 rounded-full bg-[#160E45] border border-[#261C63] text-slate-400 flex items-center justify-center text-xs font-mono shrink-0 mt-0.5">
                  3
                </span>
                <span className="text-sm text-slate-300 leading-snug">
                  You wade through sponsored search ads, GDPR cookie banners, and outdated Medium tutorials from 2017.
                </span>
              </li>
              <li className="flex items-start gap-3.5">
                <span className="w-6 h-6 rounded-full bg-[#160E45] border border-[#261C63] text-slate-400 flex items-center justify-center text-xs font-mono shrink-0 mt-0.5">
                  4
                </span>
                <span className="text-sm text-slate-300 leading-snug">
                  You copy an unverified snippet back into your shell, debug incorrect arguments, and lose another 10 minutes recovering your mental thread.
                </span>
              </li>
            </ol>
          </div>

          <div className="p-4 rounded-xl bg-[#0B0726]/90 border border-rose-950/60 text-xs text-rose-300/90 font-mono flex items-center justify-between">
            <span>Result: Deep focus destroyed</span>
            <span className="text-rose-400 font-bold">~15 mins wasted</span>
          </div>
        </div>

        {/* Card 2: The Glint Reflex (Never leave your screen) */}
        <div className="p-7 sm:p-8 rounded-3xl bg-gradient-to-b from-[#160E45] to-[#110939] border border-[#7D23D9]/60 flex flex-col justify-between relative overflow-hidden shadow-2xl shadow-[#7D23D9]/20 group">
          <div
            aria-hidden="true"
            className="absolute top-0 right-0 w-72 h-72 bg-gradient-to-br from-[#0DE4F3]/15 to-[#BDFB03]/15 rounded-full blur-3xl pointer-events-none"
          />

          <div>
            <div className="flex items-center justify-between mb-8 pb-4 border-b border-[#261C63]">
              <div className="flex items-center gap-3">
                <span className="p-2.5 rounded-xl bg-[#7D23D9]/30 border border-[#7D23D9]/60 text-[#BDFB03] shadow-inner">
                  <CheckCircle size={22} weight="bold" />
                </span>
                <div>
                  <h3 className="title-1 text-white font-semibold">The Glint Reflex</h3>
                  <p className="text-xs text-[#BDFB03] font-mono">Never leave your active window</p>
                </div>
              </div>
              <span className="text-xs px-2.5 py-1 rounded-full bg-[#BDFB03]/15 text-[#BDFB03] border border-[#BDFB03]/30 font-mono font-semibold">
                &lt; 2 seconds
              </span>
            </div>

            <ol className="flex flex-col gap-5 mb-8">
              <li className="flex items-start gap-3.5">
                <span className="w-6 h-6 rounded-full bg-[#7D23D9]/40 border border-[#7D23D9] text-[#BDFB03] flex items-center justify-center text-xs font-mono font-bold shrink-0 mt-0.5">
                  1
                </span>
                <span className="text-sm text-slate-100 leading-snug">
                  You hit a wall while coding. <strong>You never leave your window.</strong>
                </span>
              </li>
              <li className="flex items-start gap-3.5">
                <span className="w-6 h-6 rounded-full bg-[#7D23D9]/40 border border-[#7D23D9] text-[#BDFB03] flex items-center justify-center text-xs font-mono font-bold shrink-0 mt-0.5">
                  2
                </span>
                <span className="text-sm text-slate-100 leading-snug">
                  Press{" "}
                  <kbd className="px-2 py-0.5 rounded bg-[#0B0726] border border-[#3A2A9F] text-[#0DE4F3] font-mono text-xs font-semibold shadow-inner">
                    Ctrl + Space
                  </kbd>{" "}
                  (or <kbd className="px-1.5 py-0.5 rounded bg-[#0B0726] border border-[#3A2A9F] text-[#0DE4F3] font-mono text-xs font-semibold">Cmd+Space</kbd>). Glint floats instantly over your active code.
                </span>
              </li>
              <li className="flex items-start gap-3.5">
                <span className="w-6 h-6 rounded-full bg-[#7D23D9]/40 border border-[#7D23D9] text-[#BDFB03] flex items-center justify-center text-xs font-mono font-bold shrink-0 mt-0.5">
                  3
                </span>
                <span className="text-sm text-slate-100 leading-snug">
                  Search 38+ preseeded offline playbooks or ask your BYOK AI model. Verified syntax arrives in{" "}
                  <strong className="text-[#BDFB03]">&lt;2ms</strong> with live parameter pills.
                </span>
              </li>
              <li className="flex items-start gap-3.5">
                <span className="w-6 h-6 rounded-full bg-[#7D23D9]/40 border border-[#7D23D9] text-[#BDFB03] flex items-center justify-center text-xs font-mono font-bold shrink-0 mt-0.5">
                  4
                </span>
                <span className="text-sm text-slate-100 leading-snug">
                  Hit <kbd className="px-1.5 py-0.5 rounded bg-[#0B0726] border border-[#261C63] text-slate-300 font-mono text-xs">Enter</kbd> or click Copy. Glint automatically dismisses and restores cursor focus to your editor.
                </span>
              </li>
            </ol>
          </div>

          <div className="p-4 rounded-xl bg-[#0B0726] border border-[#7D23D9]/60 text-xs text-[#BDFB03] font-mono flex items-center justify-between shadow-inner">
            <span>Result: Continuous flow state</span>
            <span className="font-bold flex items-center gap-1">
              <Lightning size={14} weight="fill" /> &lt;2 sec total
            </span>
          </div>
        </div>
      </div>

      {/* Micro Banner: The Key Principle */}
      <div className="mt-12 p-5 rounded-2xl bg-[#110939]/60 border border-[#261C63] flex flex-col sm:flex-row items-center justify-between gap-4 text-center sm:text-left">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#160E45] border border-[#261C63] flex items-center justify-center text-[#0DE4F3] shrink-0">
            <Keyboard size={20} weight="bold" />
          </div>
          <div>
            <div className="text-sm font-semibold text-white">
              The Golden Rule of Glint: Hands on keyboard. Eyes on screen.
            </div>
            <div className="text-xs text-slate-400">
              Zero tab switching. Zero browser rabbit holes. Instant recall.
            </div>
          </div>
        </div>

        <div className="inline-flex items-center gap-2 font-mono text-xs text-slate-300 bg-[#0B0726] px-3.5 py-2 rounded-xl border border-[#261C63]">
          <span className="text-slate-400">Summon reflex:</span>
          <kbd className="px-1.5 py-0.5 rounded bg-[#160E45] text-[#BDFB03] border border-[#3A2A9F] font-bold">Ctrl</kbd>
          <span>+</span>
          <kbd className="px-2 py-0.5 rounded bg-[#160E45] text-[#BDFB03] border border-[#3A2A9F] font-bold">Space</kbd>
        </div>
      </div>
    </section>
  );
}
