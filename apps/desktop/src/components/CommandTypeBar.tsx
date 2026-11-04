import React, { useState, useEffect, useRef } from 'react';
import { Search, Maximize2, X, Copy, Check, Sparkles, CornerDownLeft, GripVertical } from 'lucide-react';
import { CheatsheetSearchResult } from '@glint/shared';
import { searchEngine } from '../services/searchEngine';
import { GlintyMascot } from './GlintyMascot';
import { useDesktopDrag } from '../hooks/useDesktopDrag';

interface CommandTypeBarProps {
  onExpand: () => void;
  onMinimize: () => void;
  onSearchConducted: () => boolean;
  guestSearchesLeft: number;
  isGuestLocked: boolean;
  onOpenAuth: () => void;
}

export const CommandTypeBar: React.FC<CommandTypeBarProps> = ({
  onExpand,
  onMinimize,
  onSearchConducted,
  guestSearchesLeft,
  isGuestLocked,
  onOpenAuth,
}) => {
  const [query, setQuery] = useState('');
  const [bestMatch, setBestMatch] = useState<CheatsheetSearchResult | null>(null);
  const [copied, setCopied] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const { handlePointerDown, handlePointerMove, handlePointerUp } = useDesktopDrag();

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  useEffect(() => {
    if (isGuestLocked) {
      setBestMatch(null);
      return;
    }

    if (query.trim().length > 0) {
      onSearchConducted();
      const results = searchEngine.search(query);
      setBestMatch(results.length > 0 ? results[0] : null);
    } else {
      setBestMatch(null);
    }
  }, [query, isGuestLocked]);

  const handleCopy = () => {
    if (!bestMatch) return;
    const cmd = bestMatch.item.command;

    if (typeof window !== 'undefined' && (window as any).glintDesktop?.writeClipboard) {
      (window as any).glintDesktop.writeClipboard(cmd);
    } else {
      navigator.clipboard.writeText(cmd);
    }

    setCopied(true);
    setTimeout(() => {
      setCopied(false);
      onMinimize();
    }, 1200);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && bestMatch) {
      e.preventDefault();
      handleCopy();
    } else if (e.key === 'Tab' || (e.ctrlKey && e.key === 'e')) {
      e.preventDefault();
      onExpand();
    } else if (e.key === 'Escape') {
      e.preventDefault();
      onMinimize();
    }
  };

  return (
    <div className="w-full h-full flex flex-col justify-center gap-2 p-2 bg-transparent select-none animate-pop">
      {/* Sleek Floating Type Bar */}
      <div className="flex items-center justify-between gap-2.5 px-3.5 py-2.5 rounded-3xl border-2 border-candy-violet/50 bg-[#121526]/95 backdrop-blur-2xl shadow-[0_12px_40px_rgba(139,92,246,0.4)]">
        {/* Left Drag Handle & Mascot (Drag anywhere on desktop) */}
        <div
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          className="flex items-center gap-1.5 cursor-grab active:cursor-grabbing shrink-0 px-1 py-0.5 rounded-xl hover:bg-glint-border/50 transition-colors touch-none"
          title="Drag anywhere on your desktop screen!"
        >
          <GripVertical className="w-3.5 h-3.5 text-slate-500" />
          <GlintyMascot mood={bestMatch ? 'celebrate' : 'happy'} size="sm" />
          <span className="text-[11px] font-black tracking-tight text-white hidden sm:inline">
            Glint
          </span>
        </div>

        {/* Input Bar */}
        <div className="relative flex-1 flex items-center">
          <Search className="absolute left-2.5 w-4 h-4 text-candy-violetLight" />
          <input
            ref={inputRef}
            type="text"
            disabled={isGuestLocked}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={
              isGuestLocked
                ? 'Guest limit reached (10/10). Click to unlock!'
                : 'Type command (e.g. docker run, kill port, tar)...'
            }
            className="w-full bg-[#0A0D18] border-2 border-glint-border focus:border-candy-violet rounded-2xl pl-8 pr-7 py-2 text-xs text-white placeholder-slate-400 focus:outline-none transition-all shadow-inner disabled:opacity-50"
          />
          {query && !isGuestLocked && (
            <button
              onClick={() => setQuery('')}
              className="absolute right-2.5 text-xs text-slate-400 hover:text-white"
            >
              ✕
            </button>
          )}
        </div>

        {/* Right Actions */}
        <div className="flex items-center gap-1 shrink-0">
          {guestSearchesLeft < 10 && !isGuestLocked && (
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-candy-honey/20 border border-candy-honey/40 text-candy-honeyLight">
              {guestSearchesLeft}
            </span>
          )}

          {/* Expand to Full Chat Modal Button */}
          <button
            onClick={onExpand}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-2xl bg-gradient-to-r from-candy-violet to-candy-pink hover:opacity-95 text-white text-xs font-bold shadow-md hover:scale-105 active:scale-95 transition-all"
            title="Expand into full chat modal (Tab)"
          >
            <Maximize2 className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Expand</span>
          </button>

          {/* Minimize to Bubble */}
          <button
            onClick={onMinimize}
            className="p-1.5 rounded-xl hover:bg-candy-coral/20 hover:text-candy-coral text-slate-400 transition-colors"
            title="Minimize to floating mascot bubble (Esc)"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Instant Best Match Preview Shelf */}
      {bestMatch && !isGuestLocked && (
        <div className="flex items-center justify-between px-3.5 py-2 rounded-2.5xl border border-candy-mint/40 bg-[#0E1220]/95 backdrop-blur-xl shadow-lg animate-pop">
          <div className="flex items-center gap-2 overflow-hidden mr-2">
            <span className="px-1.5 py-0.2 text-[9px] font-bold uppercase rounded-full bg-candy-mint/20 text-candy-mintLight border border-candy-mint/30 shrink-0">
              {bestMatch.item.category}
            </span>
            <span className="truncate text-xs font-mono text-slate-200">
              <span className="text-candy-pink font-bold mr-1">➜</span>
              {bestMatch.item.command}
            </span>
          </div>

          <button
            onClick={handleCopy}
            className={`shrink-0 flex items-center gap-1 px-3 py-1 rounded-xl text-xs font-bold transition-all transform active:scale-90 ${
              copied
                ? 'bg-candy-mint text-slate-950 font-black'
                : 'bg-candy-mint/20 border border-candy-mint/50 text-candy-mintLight hover:bg-candy-mint hover:text-slate-950'
            }`}
            title="Copy command (or press Enter)"
          >
            {copied ? (
              <>
                <Check className="w-3.5 h-3.5 stroke-[3]" />
                <span>Copied!</span>
              </>
            ) : (
              <>
                <CornerDownLeft className="w-3.5 h-3.5" />
                <span>Copy ↵</span>
              </>
            )}
          </button>
        </div>
      )}

      {/* Guest Lock Alert Shelf */}
      {isGuestLocked && (
        <div
          onClick={onOpenAuth}
          className="flex items-center justify-between px-3.5 py-2 rounded-2.5xl border border-candy-honey/40 bg-candy-honey/15 cursor-pointer hover:bg-candy-honey/25 transition-colors"
        >
          <span className="text-xs text-candy-honeyLight font-bold flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5" />
            10 guest searches used. Click here to sign in for unlimited!
          </span>
          <span className="text-xs text-white font-extrabold underline">Sign In</span>
        </div>
      )}
    </div>
  );
};
