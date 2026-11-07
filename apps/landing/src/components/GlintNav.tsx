import React, { useState, useEffect } from "react";
import {
  DownloadSimple,
  GithubLogo,
  List,
  X,
} from "@phosphor-icons/react";

const NAV_LINKS = [
  { label: "Features", href: "#features" },
  { label: "How it works", href: "#how-it-works" },
  { label: "Interactive demo", href: "#demo" },
  { label: "FAQ", href: "#faq" },
];

export function GlintNav() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [activeSection, setActiveSection] = useState("");

  useEffect(() => {
    const handleScroll = () => {
      const sections = ["features", "how-it-works", "demo", "faq"];
      const scrollPos = window.scrollY + 200;

      for (const section of sections) {
        const el = document.getElementById(section);
        if (el) {
          const top = el.offsetTop;
          const height = el.offsetHeight;
          if (scrollPos >= top && scrollPos < top + height) {
            setActiveSection(section);
            return;
          }
        }
      }
      if (window.scrollY < 200) {
        setActiveSection("");
      }
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <>
      <header className="fixed top-4 inset-x-0 z-40 flex justify-center px-4 pointer-events-none">
        <nav
          aria-label="Primary"
          className="pointer-events-auto flex items-center justify-between gap-4 w-full max-w-4xl px-3 py-2 rounded-full border border-[#261C63] bg-[#110939]/85 backdrop-blur-md shadow-2xl transition-all duration-300"
        >
          {/* Full Logo Without Background Container */}
          <a
            href="#top"
            className="flex items-center gap-2.5 pl-1 group focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#BDFB03] rounded-lg"
          >
            <img
              src="/glint/glint-logo.svg"
              alt="Glint logo"
              className="h-8 w-auto transition-transform duration-300 group-hover:scale-105"
            />
            <span className="text-[10px] font-mono text-[#0DE4F3] bg-[#160E45] border border-[#261C63] px-2 py-0.5 rounded-full hidden sm:inline-block">
              v0.2.0
            </span>
          </a>

          {/* Desktop Navigation Links */}
          <div className="hidden md:flex items-center gap-1">
            {NAV_LINKS.map((link) => {
              const isActive = activeSection === link.href.replace("#", "");
              return (
                <a
                  key={link.href}
                  href={link.href}
                  className={`title-4 px-3 py-1.5 rounded-full transition-colors duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#BDFB03] ${
                    isActive
                      ? "text-[#BDFB03] bg-[#160E45] border border-[#261C63]"
                      : "text-slate-300 hover:text-white hover:bg-[#160E45]"
                  }`}
                >
                  {link.label}
                </a>
              );
            })}
          </div>

          {/* CTA & GitHub */}
          <div className="flex items-center gap-2">
            <a
              href="https://github.com/joychandrauday/glint"
              target="_blank"
              rel="noreferrer"
              aria-label="GitHub repository"
              className="hidden sm:inline-flex items-center gap-1.5 px-3 py-2 rounded-full text-slate-300 hover:text-white bg-[#160E45] hover:bg-[#261C63] border border-[#261C63] button-sm transition-all duration-300 active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#BDFB03]"
            >
              <GithubLogo size={16} weight="bold" />
              <span>Source</span>
            </a>

            <a
              href="#download"
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-[#7D23D9] text-white button-sm hover:bg-[#7D23D9]/90 border border-[#7D23D9]/50 shadow-md shadow-[#7D23D9]/25 transition-all duration-300 active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#BDFB03]"
            >
              <DownloadSimple size={16} weight="bold" />
              <span>Download</span>
            </a>

            {/* Mobile Hamburger Button */}
            <button
              type="button"
              onClick={() => setMobileOpen(!mobileOpen)}
              aria-expanded={mobileOpen}
              aria-label="Toggle navigation menu"
              className="md:hidden p-2 rounded-full text-slate-300 hover:text-white bg-[#160E45] border border-[#261C63] transition-transform duration-300 active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#BDFB03]"
            >
              {mobileOpen ? (
                <X size={18} weight="bold" />
              ) : (
                <List size={18} weight="bold" />
              )}
            </button>
          </div>
        </nav>
      </header>

      {/* Full-height Mobile Menu Panel */}
      {mobileOpen && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-30 md:hidden bg-[#0B0726]/95 backdrop-blur-xl flex flex-col justify-between pt-24 pb-8 px-6 transition-opacity duration-300"
        >
          <div className="flex flex-col gap-3">
            {NAV_LINKS.map((link) => (
              <a
                key={link.href}
                href={link.href}
                onClick={() => setMobileOpen(false)}
                className="title-1 text-slate-200 hover:text-[#BDFB03] py-3 border-b border-[#261C63] transition-colors"
              >
                {link.label}
              </a>
            ))}
          </div>

          <div className="flex flex-col gap-3 pt-6 border-t border-[#261C63]">
            <a
              href="#download"
              onClick={() => setMobileOpen(false)}
              className="flex items-center justify-center gap-2 w-full py-2.5 px-3 rounded-xl bg-[#7D23D9] text-white button-md hover:bg-[#7D23D9]/90 transition-transform active:scale-[0.98] shadow-md shadow-[#7D23D9]/25"
            >
              <DownloadSimple size={18} weight="bold" />
              <span>Download Glint free</span>
            </a>
            <a
              href="https://github.com/joychandrauday/glint"
              target="_blank"
              rel="noreferrer"
              className="flex items-center justify-center gap-2 w-full py-2.5 px-3 rounded-xl bg-[#160E45] text-white button-md border border-[#261C63] hover:bg-[#261C63] transition-transform active:scale-[0.98]"
            >
              <GithubLogo size={18} weight="bold" />
              <span>View GitHub repository</span>
            </a>
          </div>
        </div>
      )}
    </>
  );
}
