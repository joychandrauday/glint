import React, { useRef, useEffect } from 'react';
import { Search, Maximize2, Minus, X, GripVertical, Database } from 'lucide-react';
import { BrandSpark } from './BrandSpark';
import { useDesktopDrag } from '../hooks/useDesktopDrag';
import { localCommandDb } from '../services/localCommandDb';

interface DesktopTypeBarProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  onExpand: () => void;
  onMinimizeToBubble: () => void;
  onClose: () => void;
  isLocked?: boolean;
}

export const DesktopTypeBar: React.FC<DesktopTypeBarProps> = ({
  searchQuery,
  onSearchChange,
  onExpand,
  onMinimizeToBubble,
  onClose,
  isLocked,
}) => {
  const inputRef = useRef<HTMLInputElement>(null);
  const { handlePointerDown } = useDesktopDrag();
  const stats = localCommandDb.getStats();

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === 'ArrowDown') {
      e.preventDefault();
      onExpand();
    }
  };

  return (
    <div
      onPointerDown={handlePointerDown}
      className="w-full h-full flex items-center justify-between px-3.5 py-2.5 rounded-2xl border-2 border-glint-violet/70 bg-glint-space/95 backdrop-blur-2xl shadow-[0_12px_45px_rgba(125,35,217,0.45)] select-none animate-pop cursor-grab active:cursor-grabbing"
      title="Glint: Drag anywhere on your desktop screen!"
    >
      {/* Drag Grip + Brand Mascot */}
      <div className="flex items-center gap-2 flex-shrink-0">
        <GripVertical className="w-4 h-4 text-slate-500 hover:text-glint-lime transition-colors" />
        <div
          onClick={onExpand}
          className="cursor-pointer transition-transform hover:scale-110 active:scale-95"
          title="Glint: Click to expand full cheatsheet & command assistant"
        >
          <BrandSpark size="sm" animate={Boolean(searchQuery)} />
        </div>
      </div>

      {/* Clean Center Message Input */}
      <div className="flex-1 flex items-center gap-2.5 mx-2.5 bg-glint-card/90 border border-glint-border/80 rounded-xl px-3 py-1.5 focus-within:border-glint-lime focus-within:ring-2 focus-within:ring-glint-lime/30 transition-all">
        <Search className="w-4 h-4 text-glint-cyan flex-shrink-0" />
        <input
          ref={inputRef}
          type="text"
          value={searchQuery}
          onChange={(e) => {
            onSearchChange(e.target.value);
            if (e.target.value.trim().length > 0) {
              onExpand();
            }
          }}
          onKeyDown={handleKeyDown}
          placeholder={isLocked ? 'Offline Limit Reached...' : 'Search commands or ask Glint (e.g. docker run, git reset)...'}
          disabled={isLocked}
          data-no-drag="true"
          className="w-full bg-transparent text-xs text-white placeholder-slate-400 outline-none font-medium selection:bg-glint-magenta selection:text-white"
        />

        {/* Subtle Local Database Indicator */}
        <div
          className="flex items-center gap-1 text-[10px] text-slate-400 bg-glint-space/60 px-1.5 py-0.5 rounded-md border border-glint-border/40 flex-shrink-0"
          title={`${stats.totalCommands} total commands ready in local offline database (${stats.learnedCommands} learned)`}
        >
          <Database className="w-3 h-3 text-glint-lime" />
          <span className="font-mono text-[9px] text-glint-lime">{stats.totalCommands}</span>
        </div>
      </div>

      {/* Action Controls */}
      <div className="flex items-center gap-1 flex-shrink-0" data-no-drag="true">
        {/* Expand Button */}
        <button
          onClick={onExpand}
          className="p-1.5 rounded-lg text-slate-400 hover:text-glint-lime hover:bg-glint-lime/10 border border-transparent transition-all"
          title="Expand Full Modal"
        >
          <Maximize2 className="w-3.5 h-3.5" />
        </button>

        {/* Minimize to Bubble Button */}
        <button
          onClick={onMinimizeToBubble}
          className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-glint-card transition-all"
          title="Minimize to Floating Spark Bubble"
        >
          <Minus className="w-3.5 h-3.5" />
        </button>

        {/* Close Overlay Button */}
        <button
          onClick={onClose}
          className="p-1.5 rounded-lg text-slate-400 hover:text-glint-coral hover:bg-glint-coral/10 transition-all"
          title="Close Glint"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
};
