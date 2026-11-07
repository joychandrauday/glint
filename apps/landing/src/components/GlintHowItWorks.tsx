import React from "react";
import {
  Keyboard,
  MagnifyingGlass,
  ArrowRight,
  Terminal,
  Lightning,
  Sparkle,
} from "@phosphor-icons/react";

const STEPS = [
  {
    step: "01",
    icon: Keyboard,
    title: "Summon instantly with Ctrl + Space",
    badge: "Never leave your window",
    description:
      "Work uninterrupted. Press Ctrl+Space (or Cmd+Space) from VS Code, terminal, or any active window. Glint floats unobtrusively over your workspace in <2ms.",
  },
  {
    step: "02",
    icon: MagnifyingGlass,
    title: "Search playbooks or ask your AI",
    badge: "<2ms offline recall",
    description:
      "Query 38+ curated offline playbooks with zero network calls, or diagnose shell stack traces and ask general conceptual questions with your BYOK key.",
  },
  {
    step: "03",
    icon: Terminal,
    title: "Hit Enter, done — Glint dismisses",
    badge: "Focus auto-restored",
    description:
      "Tweak dynamic parameter pills inline. Press Enter or copy: Glint automatically vanishes and restores cursor focus back to your code.",
  },
];

export function GlintHowItWorks() {
  return (
    <section id="how-it-works" className="py-24 px-4 sm:px-6 max-w-6xl mx-auto">
      <div className="text-center mb-16">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#160E45] border border-[#261C63] text-xs font-mono text-[#BDFB03] uppercase tracking-wider mb-4">
          <Sparkle size={13} weight="fill" className="text-[#BDFB03]" />
          <span>The Zero-Friction Loop</span>
        </div>
        <h2 className="heading-2 text-white mb-4 tracking-tight">
          How Glint keeps you in deep flow
        </h2>
        <p className="body-2 text-slate-300 max-w-[680px] mx-auto text-base sm:text-lg leading-relaxed">
          From an obscure command roadblock back to typing working code in less than three seconds.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {STEPS.map((item) => {
          const IconComp = item.icon;
          return (
            <div
              key={item.step}
              className="p-7 rounded-2xl bg-[#110939] border border-[#261C63] hover:border-[#7D23D9]/60 hover:shadow-xl hover:shadow-[#7D23D9]/10 transition-all flex flex-col justify-between group"
            >
              <div>
                <div className="flex items-center justify-between mb-6">
                  <div className="w-12 h-12 rounded-xl bg-[#160E45] border border-[#261C63] group-hover:border-[#7D23D9] flex items-center justify-center text-[#BDFB03] transition-colors shadow-sm">
                    <IconComp size={22} weight="bold" />
                  </div>
                  <span className="heading-5 font-mono text-[#0DE4F3] font-bold">
                    {item.step}
                  </span>
                </div>

                <div className="inline-block px-2 py-0.5 rounded bg-[#160E45] border border-[#261C63] text-[10px] font-mono text-[#0DE4F3] mb-3">
                  {item.badge}
                </div>

                <h3 className="title-2 text-white mb-3 font-semibold">{item.title}</h3>
                <p className="body-5 text-slate-300 leading-relaxed">{item.description}</p>
              </div>

              <div className="pt-6 mt-6 border-t border-[#261C63] flex items-center gap-2 text-[#BDFB03] caption-4 font-mono">
                <Lightning size={14} weight="fill" />
                <span>Zero browser tabs required</span>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
