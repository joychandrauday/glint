import React, { useState } from "react";
import { CaretDown } from "@phosphor-icons/react";
import { FAQ_ITEMS } from "./faq-data";

export function GlintFAQ() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const toggle = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <section id="faq" className="py-20 px-4 sm:px-6 max-w-4xl mx-auto">
      <div className="text-center mb-16">
        <div className="caption-3 text-cyan-400 uppercase tracking-widest mb-3 font-mono">
          Objection handling
        </div>
        <h2 className="heading-2 text-white mb-4">
          Frequently asked questions
        </h2>
        <p className="body-2 text-slate-400 max-w-[680px] mx-auto">
          Everything you need to know about privacy, offline capabilities, BYOK keys, and zero-telemetry architecture.
        </p>
      </div>

      <div className="flex flex-col gap-3">
        {FAQ_ITEMS.map((item, index) => {
          const isOpen = openIndex === index;
          return (
            <div
              key={item.q}
              className="rounded-2xl bg-slate-900/60 border border-slate-800 hover:border-slate-700 overflow-hidden transition-colors"
            >
              <button
                type="button"
                onClick={() => toggle(index)}
                aria-expanded={isOpen}
                className="w-full p-5 text-left flex items-center justify-between gap-4 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400 cursor-pointer"
              >
                <span className="title-2 text-white">{item.q}</span>
                <span
                  style={{
                    transitionTimingFunction: "cubic-bezier(0.22, 1, 0.36, 1)",
                  }}
                  className={`p-1.5 rounded-lg bg-slate-800 border border-slate-700 text-slate-300 transition-transform duration-300 shrink-0 ${
                    isOpen ? "rotate-180 text-cyan-400 border-cyan-500/50" : ""
                  }`}
                >
                  <CaretDown size={16} weight="bold" />
                </span>
              </button>

              {isOpen && (
                <div className="px-5 pb-5 pt-1 text-slate-300 body-5 border-t border-slate-800 leading-relaxed">
                  {item.a}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </section>
  );
}