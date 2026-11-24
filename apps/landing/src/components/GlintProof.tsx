import React from "react";

const PREINDEXED_STACK = [
  "Docker",
  "Kubernetes",
  "Git",
  "Nginx",
  "PostgreSQL",
  "systemd",
  "Linux CLI",
  "Redis",
];

const BENCHMARKS = [
  {
    metric: "<2 ms",
    label: "Local Search Recall",
    detail: "Deterministic offline SQLite index",
  },
  {
    metric: "548 KB",
    label: "Standalone Bundle Size",
    detail: "Zero node_modules, pure binary",
  },
  {
    metric: "Up to 90%",
    label: "Token & Cost Savings",
    detail: "Multi-tier prompt & semantic caching",
  },
  {
    metric: "500+ Snippets",
    label: "Preloaded Offline Cheatsheets",
    detail: "Zero-latency, zero-token instant recall",
  },
];

export function GlintProof() {
  return (
    <section className="py-16 px-4 sm:px-6 max-w-6xl mx-auto border-t border-b border-slate-800/80">
      <p className="caption-3 text-slate-400 text-center uppercase tracking-widest mb-6 font-mono">
        Preloaded developer cheatsheets ready on first boot
      </p>

      <div className="flex flex-wrap items-center justify-center gap-2 mb-16">
        {PREINDEXED_STACK.map((item) => (
          <span
            key={item}
            className="title-5 text-slate-300 bg-slate-900 border border-slate-800 hover:border-cyan-500/50 hover:text-white transition-colors px-3.5 py-1.5 rounded-full font-mono"
          >
            {item}
          </span>
        ))}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {BENCHMARKS.map((item) => (
          <div
            key={item.label}
            className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800 hover:border-slate-700 transition-all flex flex-col justify-between group"
          >
            <div>
              <div className="heading-4 text-emerald-400 font-mono mb-1">{item.metric}</div>
              <div className="title-4 text-white mb-2">{item.label}</div>
            </div>
            <div className="caption-2 text-slate-400">{item.detail}</div>
          </div>
        ))}
      </div>
    </section>
  );
}
