import React from "react";
import {
  Keyboard,
  MagnifyingGlass,
  ArrowRight,
  Terminal,
} from "@phosphor-icons/react";

const STEPS = [
  {
    step: "01",
    icon: Keyboard,
    title: "Summon from anywhere",
    description:
      "Press your global hotkey (default Ctrl+Space or Alt+Space) while inside your IDE, terminal, or browser to invoke the floating overlay.",
  },
  {
    step: "02",
    icon: MagnifyingGlass,
    title: "Type intent or paste error",
    description:
      "Search for command recipes like 'undo last git commit' or paste raw terminal stack traces for immediate diagnosis.",
  },
  {
    step: "03",
    icon: Terminal,
    title: "Copy and resume typing",
    description:
      "Update live variable fields inline, click copy or press enter, and Glint dismisses itself while restoring cursor focus.",
  },
];

export function GlintHowItWorks() {
  return (
    <section id="how-it-works" className="py-20 px-4 sm:px-6 max-w-6xl mx-auto">
      <div className="text-center mb-16">
        <div className="caption-3 text-neutral-400 uppercase tracking-widest mb-3">
          Step by step
        </div>
        <h2 className="heading-2 text-white mb-4">
          How Glint keeps you moving
        </h2>
        <p className="body-2 text-neutral-400 max-w-[680px] mx-auto">
          Three seconds from an obscure syntax roadblock back to shipping code.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {STEPS.map((item) => {
          const IconComp = item.icon;
          return (
            <div
              key={item.step}
              className="p-6 rounded-2xl bg-[#181818] border border-[#272727] flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-6">
                  <div className="w-10 h-10 rounded-lg bg-[#272727] border border-[#313131] flex items-center justify-center text-white">
                    <IconComp size={20} weight="bold" />
                  </div>
                  <span className="heading-5 font-mono text-neutral-500">
                    {item.step}
                  </span>
                </div>

                <h3 className="title-2 text-white mb-2">{item.title}</h3>
                <p className="body-5 text-neutral-400">{item.description}</p>
              </div>

              <div className="pt-6 mt-6 border-t border-[#272727] flex items-center gap-2 text-amber-400 caption-4">
                <span>Instant execution</span>
                <ArrowRight size={14} weight="bold" />
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
