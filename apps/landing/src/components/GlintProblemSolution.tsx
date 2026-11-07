import React from "react";
import {
  XCircle,
  CheckCircle,
  Browsers,
  Terminal,
  ClockAfternoon,
  Lightning,
} from "@phosphor-icons/react";

export function GlintProblemSolution() {
  return (
    <section className="py-20 px-4 sm:px-6 max-w-6xl mx-auto">
      <div className="text-center mb-16">
        <h2 className="heading-2 text-white mb-4">
          Stop tab hopping to remember basic flags
        </h2>
        <p className="body-2 text-neutral-400 max-w-[680px] mx-auto">
          Context switching destroys deep focus. Glint keeps your hands on the
          keyboard and your attention on the task.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* The Pain Card */}
        <div className="p-6 rounded-2xl bg-[#181818] border border-[#272727] flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 mb-6">
              <span className="p-2 rounded-lg bg-rose-950/50 border border-rose-800/40 text-rose-400">
                <XCircle size={20} weight="bold" />
              </span>
              <span className="title-2 text-white">The old workflow</span>
            </div>

            <ul className="flex flex-col gap-4 mb-6">
              <li className="flex items-start gap-3">
                <Browsers size={18} className="text-neutral-500 shrink-0 mt-1" />
                <span className="body-4 text-neutral-300">
                  Leave your IDE or terminal to open a browser window and Google syntax.
                </span>
              </li>
              <li className="flex items-start gap-3">
                <ClockAfternoon size={18} className="text-neutral-500 shrink-0 mt-1" />
                <span className="body-4 text-neutral-300">
                  Read through three outdated blog posts and cookie banners to find one command flag.
                </span>
              </li>
              <li className="flex items-start gap-3">
                <XCircle size={18} className="text-neutral-500 shrink-0 mt-1" />
                <span className="body-4 text-neutral-300">
                  Manually edit fragile command parameters in your shell history and risk broken production states.
                </span>
              </li>
            </ul>
          </div>

          <div className="p-4 rounded-lg bg-[#1F1F1F] border border-[#272727] caption-2 text-neutral-400">
            Average delay: 4 to 8 minutes per unknown command flag.
          </div>
        </div>

        {/* The Glint Solution Card */}
        <div className="p-6 rounded-2xl bg-[#181818] border border-[#272727] flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 mb-6">
              <span className="p-2 rounded-lg bg-emerald-950/50 border border-emerald-800/40 text-emerald-400">
                <CheckCircle size={20} weight="bold" />
              </span>
              <span className="title-2 text-white">The Glint workflow</span>
            </div>

            <ul className="flex flex-col gap-4 mb-6">
              <li className="flex items-start gap-3">
                <Lightning size={18} className="text-emerald-400 shrink-0 mt-1" />
                <span className="body-4 text-neutral-300">
                  Press <kbd className="font-mono bg-[#272727] px-1.5 py-0.5 rounded text-white text-xs border border-[#313131]">Ctrl+Space</kbd> from any window to summon the floating HUD.
                </span>
              </li>
              <li className="flex items-start gap-3">
                <Terminal size={18} className="text-emerald-400 shrink-0 mt-1" />
                <span className="body-4 text-neutral-300">
                  Get instant verified runbook steps in less than two milliseconds from your local SQLite cache.
                </span>
              </li>
              <li className="flex items-start gap-3">
                <CheckCircle size={18} className="text-emerald-400 shrink-0 mt-1" />
                <span className="body-4 text-neutral-300">
                  Fill live parameter pills inline, hit enter or copy, and focus automatically restores to your shell.
                </span>
              </li>
            </ul>
          </div>

          <div className="p-4 rounded-lg bg-[#1F1F1F] border border-[#272727] caption-2 text-emerald-400">
            Average delay: under two seconds without leaving your editor.
          </div>
        </div>
      </div>
    </section>
  );
}
