import React from "react";
import {
  Lightning,
  Sparkle,
  Key,
  Database,
  FirstAid,
  ShieldCheck,
} from "@phosphor-icons/react";

const BENEFITS = [
  {
    icon: Key,
    title: "Universal BYOK Engine",
    description:
      "Bring your own key for Groq, Google Gemini, Anthropic Claude, OpenAI, DeepSeek, or local Ollama. Zero lock-in, zero middleman markups.",
    badge: "7 Providers",
  },
  {
    icon: Database,
    title: "Multi-Tier Token & Prompt Cache",
    description:
      "Exact repeat queries replay in <10ms with 0 token consumption. Native prompt caching with Anthropic & Gemini cuts API expenses by up to 90%.",
    badge: "Up to 90% Savings",
  },
  {
    icon: Sparkle,
    title: "Real-time Markdown & Code Highlighting",
    description:
      "No raw markdown tags or backtick noise. Commands and scripts render inside syntax-highlighted rounded containers with flag explanations.",
    badge: "Syntax Highlighted",
  },
  {
    icon: Lightning,
    title: "500+ Offline Cheatsheets (<2ms)",
    description:
      "Instant deterministic lookups for Docker, Git, Kubernetes, Linux, Nginx, and Postgres with zero network dependency and zero token usage.",
    badge: "<2ms Deterministic",
  },
  {
    icon: FirstAid,
    title: "Terminal Error Doctor",
    description:
      "Pipe cryptic compiler errors, permission issues, or stack traces directly into glint fix for instant root-cause diagnostics and verified remedies.",
    badge: "glint fix",
  },
  {
    icon: ShieldCheck,
    title: "Ultralight Standalone Bundle",
    description:
      "Single 548 KB executable. No runtime baggage, zero telemetry tracking, and 100% private. Runs seamlessly across macOS, Linux, and Windows.",
    badge: "548 KB • 0 Telemetry",
  },
];

export function GlintBenefits() {
  return (
    <section id="features" className="py-20 px-4 sm:px-6 max-w-6xl mx-auto">
      <div className="text-center mb-16">
        <div className="caption-3 text-cyan-400 uppercase tracking-widest mb-3 font-mono">
          Core Capabilities
        </div>
        <h2 className="heading-2 text-white mb-4">
          Built for Terminal Velocity
        </h2>
        <p className="body-2 text-slate-300 max-w-[680px] mx-auto">
          Every capability in Glint is engineered to eliminate context loss, reduce token expenditure, and preserve your deep programming focus.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {BENEFITS.map((item) => {
          const IconComponent = item.icon;
          return (
            <div
              key={item.title}
              className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800 hover:border-slate-700 flex flex-col justify-between transition-colors duration-200 group"
            >
              <div>
                <div className="flex items-center justify-between mb-5">
                  <div className="w-10 h-10 rounded-lg bg-slate-800/80 border border-slate-700/80 group-hover:border-cyan-500/50 flex items-center justify-center text-cyan-400 transition-colors">
                    <IconComponent size={22} weight="bold" />
                  </div>
                  <span className="caption-4 text-emerald-400 bg-slate-950 border border-slate-800 px-2.5 py-0.5 rounded-full font-mono">
                    {item.badge}
                  </span>
                </div>

                <h3 className="title-2 text-white mb-2">{item.title}</h3>
                <p className="body-5 text-slate-300 mb-6">{item.description}</p>
              </div>

              <div className="pt-4 border-t border-slate-800 flex items-center justify-between text-slate-400 caption-3 font-mono">
                <span>Production Feature</span>
                <span className="text-cyan-400 text-xs">Verified</span>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
