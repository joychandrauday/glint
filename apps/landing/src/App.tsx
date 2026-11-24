import React from "react";
import { GlintNav } from "./components/GlintNav";
import { GlintHero } from "./components/GlintHero";
import { GlintProof } from "./components/GlintProof";
import { GlintTerminalDemo } from "./components/GlintTerminalDemo";
import { GlintProblemSolution } from "./components/GlintProblemSolution";
import { GlintBenefits } from "./components/GlintBenefits";
import { GlintHowItWorks } from "./components/GlintHowItWorks";
import { GlintFAQ } from "./components/GlintFAQ";
import { GlintFinalCTA } from "./components/GlintFinalCTA";
import { GlintFooter } from "./components/GlintFooter";

export const App: React.FC = () => {
  return (
    <div className="min-h-screen bg-[#0A0D14] text-slate-100 flex flex-col font-sans selection:bg-cyan-500/25 selection:text-cyan-200 antialiased">
      <GlintNav />

      <main id="main-content" className="relative z-10 overflow-hidden">
        <GlintHero />
        <GlintProof />
        <GlintTerminalDemo />
        <GlintBenefits />
        <GlintProblemSolution />
        <GlintHowItWorks />
        <GlintFAQ />
        <GlintFinalCTA />
      </main>

      <GlintFooter />
    </div>
  );
};
