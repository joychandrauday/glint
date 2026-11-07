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
          className="pointer-events-auto flex items-center justify-between gap-4 w-full max-w-4xl px-3 py-2 rounded-full border border-[#272727] bg-[#181818]/85 backdrop-blur-md shadow-2xl transition-all duration-300"
        >
          {/* Logo & Version */}
          <a
            href="#top"
            className="flex items-center gap-2 group pl-1 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-neutral-400 rounded-full"
          >
            <div className="w-8 h-8 rounded-full bg-[#272727] flex items-center justify-center border border-[#313131] group-hover:border-neutral-500 transition-colors duration-300">
              <img
                src="/glint/glint-icon.svg"
                alt="Glint icon"
                className="w-5 h-5"
              />
            </div>
            <div className="flex items-center gap-2">
              <span className="title-3 text-white tracking-tight">Glint</span>
              <span className="caption-4 text-neutral-300 bg-[#272727] border border-[#313131] px-2 py-0.5 rounded-full">
                v0.2.0
              </span>
            </div>
          </a>

          {/* Desktop Navigation Links */}
          <div className="hidden md:flex items-center gap-1">
            {NAV_LINKS.map((link) => {
              const isActive = activeSection === link.href.replace("#", "");
              return (
                <a
                  key={link.href}
                  href={link.href}
                  className={`title-4 px-3 py-1.5 rounded-full transition-colors duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-neutral-400 ${
                    isActive
                      ? "text-white bg-[#272727]"
                      : "text-neutral-300 hover:text-white hover:bg-[#272727]/60"
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
              className="hidden sm:inline-flex items-center gap-1.5 px-3 py-2 rounded-full text-neutral-300 hover:text-white bg-[#272727] hover:bg-[#313131] border border-[#313131] button-sm transition-all duration-300 active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-neutral-400"
            >
              <GithubLogo size={16} weight="bold" />
              <span>Source</span>
            </a>

            <a
              href="#download"
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-full bg-white text-black button-sm hover:bg-neutral-200 transition-all duration-300 active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-neutral-400"
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
              className="md:hidden p-2 rounded-full text-neutral-300 hover:text-white bg-[#272727] border border-[#313131] transition-transform duration-300 active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-neutral-400"
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
          className="fixed inset-0 z-30 md:hidden bg-[#181818]/95 backdrop-blur-xl flex flex-col justify-between pt-24 pb-8 px-6 transition-opacity duration-300"
        >
          <div className="flex flex-col gap-3">
            {NAV_LINKS.map((link) => (
              <a
                key={link.href}
                href={link.href}
                onClick={() => setMobileOpen(false)}
                className="title-1 text-neutral-200 hover:text-white py-3 border-b border-[#272727] transition-colors"
              >
                {link.label}
              </a>
            ))}
          </div>

          <div className="flex flex-col gap-3 pt-6 border-t border-[#272727]">
            <a
              href="#download"
              onClick={() => setMobileOpen(false)}
              className="flex items-center justify-center gap-2 w-full py-2 px-3 rounded-xl bg-white text-black button-md hover:bg-neutral-200 transition-transform active:scale-[0.98]"
            >
              <DownloadSimple size={18} weight="bold" />
              <span>Download Glint free</span>
            </a>
            <a
              href="https://github.com/joychandrauday/glint"
              target="_blank"
              rel="noreferrer"
              className="flex items-center justify-center gap-2 w-full py-2 px-3 rounded-xl bg-[#272727] text-white button-md border border-[#313131] hover:bg-[#313131] transition-transform active:scale-[0.98]"
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
