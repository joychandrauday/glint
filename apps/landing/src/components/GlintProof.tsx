import React from "react";

const PREINDEXED_STACK = [
  "Docker",
  "Kubernetes",
  "Git",
  "Nginx",
  "PostgreSQL",
  "systemd",
  "Next.js",
  "Redis",
];

const BENCHMARKS = [
  {
    metric: "1.8 ms",
    label: "Local search recall",
    detail: "Direct SQLite full text match",
  },
  {
    metric: "58 MB",
    label: "Idle memory footprint",
    detail: "Docks quietly to screen border",
  },
  {
    metric: "15 queries",
    label: "Daily free cloud AI credits",
    detail: "Groq and Gemini Flash pool",
  },
  {
    metric: "38 playbooks",
    label: "Preloaded developer runbooks",
    detail: "Instant zero token answers",
  },
];

export function GlintProof() {
  return (
    <section className="py-16 px-4 sm:px-6 max-w-6xl mx-auto border-t border-b border-[#261C63]">
      <p className="caption-3 text-slate-400 text-center uppercase tracking-widest mb-6 font-mono">
        Preloaded developer runbooks ready on first boot
      </p>

      <div className="flex flex-wrap items-center justify-center gap-2 mb-16">
        {PREINDEXED_STACK.map((item) => (
          <span
            key={item}
            className="title-5 text-slate-300 bg-[#110939] border border-[#261C63] hover:border-[#0DE4F3] hover:text-white transition-colors px-3.5 py-1.5 rounded-full"
          >
            {item}
          </span>
        ))}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {BENCHMARKS.map((item) => (
          <div
            key={item.label}
            className="p-5 rounded-2xl bg-[#110939] border border-[#261C63] hover:border-[#3A2A9F] transition-all flex flex-col justify-between group"
          >
            <div>
              <div className="heading-4 text-[#BDFB03] font-mono mb-1">{item.metric}</div>
              <div className="title-4 text-white mb-2">{item.label}</div>
            </div>
            <div className="caption-2 text-slate-400">{item.detail}</div>
          </div>
        ))}
      </div>
    </section>
  );
}
