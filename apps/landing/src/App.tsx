import React from "react";
import { GlintNav } from "./components/GlintNav";
import { GlintHero } from "./components/GlintHero";
import { GlintProof } from "./components/GlintProof";
import { GlintTaglineReveal } from "./components/GlintTaglineReveal";
import { GlintProblemSolution } from "./components/GlintProblemSolution";
import { GlintBenefits } from "./components/GlintBenefits";
import { GlintHowItWorks } from "./components/GlintHowItWorks";
import { GlintTerminalDemo } from "./components/GlintTerminalDemo";
import { GlintFAQ } from "./components/GlintFAQ";
import { GlintFinalCTA } from "./components/GlintFinalCTA";
import { GlintFooter } from "./components/GlintFooter";

export const App: React.FC = () => {
  return (
    <div className="min-h-screen bg-[#0B0726] text-slate-100 flex flex-col font-sans selection:bg-[#7D23D9]/40 selection:text-white antialiased">
      <GlintNav />

      <main id="main-content" className="relative z-10 overflow-hidden">
        <GlintHero />
        <GlintProof />
        <GlintTaglineReveal />
        <GlintProblemSolution />
        <GlintBenefits />
        <GlintHowItWorks />
        <GlintTerminalDemo />
        <GlintFAQ />
        <GlintFinalCTA />
      </main>

      <GlintFooter />
    </div>
  );
};
