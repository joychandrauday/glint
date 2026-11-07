import React from "react";
import { GithubLogo } from "@phosphor-icons/react";

export function GlintFooter() {
  return (
    <footer className="border-t border-[#261C63] bg-[#0B0726] py-12 px-4 sm:px-6">
      <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
        {/* Brand & Parent info */}
        <div className="flex flex-col sm:flex-row items-center gap-3">
          <div className="flex items-center gap-2">
            <img
              src="/glint/glint-logo.svg"
              alt="Glint Logo"
              className="h-6 w-auto"
            />
          </div>
          <span className="hidden sm:inline text-[#261C63]">•</span>
          <span className="caption-2 text-slate-400">
            A software product by{" "}
            <a
              href="https://g2gdigital.com"
              target="_blank"
              rel="noreferrer"
              className="text-[#BDFB03] hover:text-white transition-colors underline"
            >
              G2G Digital
            </a>
          </span>
        </div>

        {/* Legal & Repo Links */}
        <div className="flex flex-wrap items-center justify-center gap-6 caption-3 text-slate-400">
          <a
            href="https://g2gdigital.com/privacy"
            target="_blank"
            rel="noreferrer"
            className="hover:text-white transition-colors"
          >
            Privacy policy
          </a>
          <a
            href="https://g2gdigital.com/term"
            target="_blank"
            rel="noreferrer"
            className="hover:text-white transition-colors"
          >
            Terms of service
          </a>
          <a
            href="https://g2gdigital.com/security"
            target="_blank"
            rel="noreferrer"
            className="hover:text-white transition-colors"
          >
            Security
          </a>
          <a
            href="https://github.com/joychandrauday/glint"
            target="_blank"
            rel="noreferrer"
            className="flex items-center gap-1.5 hover:text-white transition-colors"
          >
            <GithubLogo size={16} weight="bold" />
            <span>GitHub repository</span>
          </a>
        </div>
      </div>

      <div className="max-w-6xl mx-auto mt-8 pt-6 border-t border-[#110939] text-center caption-5 text-slate-500 font-mono">
        Released under the MIT License. All rights reserved.
      </div>
    </footer>
  );
}
