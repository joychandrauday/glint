import React from "react";
import {
  Lightning,
  Sparkle,
  Sliders,
  FirstAid,
  Database,
  Key,
} from "@phosphor-icons/react";

const BENEFITS = [
  {
    icon: Lightning,
    title: "Zero context switching",
    description:
      "Recall complex Docker, Git, and Kubernetes commands instantly over your active terminal with a single global keystroke.",
    badge: "Under 2ms recall",
  },
  {
    icon: Database,
    title: "Preseeded offline data vault",
    description:
      "Execute searches against bundled SQLite full text search tables with zero network latency and zero token cost.",
    badge: "100% offline",
  },
  {
    icon: Sparkle,
    title: "Resilient AI fallback cascade",
    description:
      "Enjoy fifteen free cloud queries daily, backed by automatic failover between Groq and Gemini Flash developer pools.",
    badge: "15 daily credits",
  },
  {
    icon: Sliders,
    title: "Interactive dynamic parameters",
    description:
      "Tweak port numbers, container names, and domain variables live inline so commands are tailored before you copy.",
    badge: "Live variables",
  },
  {
    icon: FirstAid,
    title: "Terminal error doctor",
    description:
      "Paste failed shell logs or compiler errors into the prompt to receive root cause diagnoses and copyable fixes.",
    badge: "Fix my error",
  },
  {
    icon: Key,
    title: "Bring your own key engine",
    description:
      "Plug in personal API keys for OpenAI, Anthropic, or local Ollama on port 11434 for unlimited private queries.",
    badge: "Zero lock in",
  },
];

export function GlintBenefits() {
  return (
    <section id="features" className="py-20 px-4 sm:px-6 max-w-6xl mx-auto">
      <div className="text-center mb-16">
        <div className="caption-3 text-neutral-400 uppercase tracking-widest mb-3">
          Core capabilities
        </div>
        <h2 className="heading-2 text-white mb-4">
          Built for terminal velocity
        </h2>
        <p className="body-2 text-neutral-400 max-w-[680px] mx-auto">
          Every feature in Glint is designed to eliminate context loss, speed up
          command execution, and protect your development momentum.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {BENEFITS.map((item) => {
          const IconComponent = item.icon;
          return (
            <div
              key={item.title}
              className="p-6 rounded-2xl bg-[#181818] border border-[#272727] hover:border-[#313131] flex flex-col justify-between transition-colors duration-300"
            >
              <div>
                <div className="flex items-center justify-between mb-5">
                  <div className="w-10 h-10 rounded-lg bg-[#272727] border border-[#313131] flex items-center justify-center text-amber-400">
                    <IconComponent size={22} weight="bold" />
                  </div>
                  <span className="caption-4 text-neutral-300 bg-[#272727] border border-[#313131] px-2.5 py-0.5 rounded-full">
                    {item.badge}
                  </span>
                </div>

                <h3 className="title-2 text-white mb-2">{item.title}</h3>
                <p className="body-5 text-neutral-400 mb-6">{item.description}</p>
              </div>

              <div className="pt-4 border-t border-[#272727] flex items-center justify-between text-neutral-500 caption-3">
                <span>Verified feature</span>
                <span className="text-emerald-400 font-mono text-xs">Ready</span>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
