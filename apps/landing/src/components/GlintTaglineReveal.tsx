import React, { useEffect, useRef, useState } from "react";

const TAGLINE_WORDS = [
  "A",
  "tiny",
  "floating",
  "window",
  "that",
  "answers",
  "complex",
  "terminal",
  "questions",
  "before",
  "your",
  "fingers",
  "leave",
  "home",
  "row.",
];

export function GlintTaglineReveal() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [revealedCount, setRevealedCount] = useState(0);
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);

  useEffect(() => {
    const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    setPrefersReducedMotion(mediaQuery.matches);

    const handleMediaChange = (e: MediaQueryListEvent) => {
      setPrefersReducedMotion(e.matches);
    };

    mediaQuery.addEventListener("change", handleMediaChange);

    let rafId: number | null = null;

    const handleScroll = () => {
      if (rafId) return;

      rafId = requestAnimationFrame(() => {
        if (!containerRef.current) {
          rafId = null;
          return;
        }

        const rect = containerRef.current.getBoundingClientRect();
        const windowHeight = window.innerHeight;

        const startOffset = windowHeight * 0.85;
        const endOffset = windowHeight * 0.35;

        if (rect.top > startOffset) {
          setRevealedCount(0);
        } else if (rect.top < endOffset) {
          setRevealedCount(TAGLINE_WORDS.length);
        } else {
          const ratio = (startOffset - rect.top) / (startOffset - endOffset);
          const count = Math.min(
            TAGLINE_WORDS.length,
            Math.max(0, Math.floor(ratio * TAGLINE_WORDS.length))
          );
          setRevealedCount(count);
        }

        rafId = null;
      });
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll();

    return () => {
      mediaQuery.removeEventListener("change", handleMediaChange);
      window.removeEventListener("scroll", handleScroll);
      if (rafId) cancelAnimationFrame(rafId);
    };
  }, []);

  return (
    <section
      ref={containerRef}
      className="py-32 px-4 sm:px-6 max-w-4xl mx-auto flex flex-col items-center text-center"
    >
      <div className="caption-3 text-[#BDFB03] uppercase tracking-widest mb-6 font-mono">
        The core promise
      </div>

      <div className="heading-2 max-w-[680px] leading-tight flex flex-wrap justify-center gap-x-3 gap-y-2">
        {TAGLINE_WORDS.map((word, index) => {
          const isRevealed = prefersReducedMotion || index < revealedCount;
          const isHighlight = word.includes("terminal") || word.includes("floating");
          return (
            <span
              key={`${word}-${index}`}
              style={{
                transitionTimingFunction: "cubic-bezier(0.22, 1, 0.36, 1)",
                transitionDuration: "500ms",
              }}
              className={`transition-colors duration-500 ${
                isRevealed
                  ? isHighlight
                    ? "text-[#0DE4F3]"
                    : "text-white"
                  : "text-[#261C63]"
              }`}
            >
              {word}
            </span>
          );
        })}
      </div>
    </section>
  );
}
