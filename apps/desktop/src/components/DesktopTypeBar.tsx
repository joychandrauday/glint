import React, { useRef, useEffect } from 'react';
import { Search, Maximize2, Minus, X, GripVertical } from 'lucide-react';
import { GlintyMascot } from './GlintyMascot';
import { useDesktopDrag } from '../hooks/useDesktopDrag';

interface DesktopTypeBarProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  selectedCategory: string;
  onCategoryChange: (cat: string) => void;
  onExpand: () => void;
  onMinimizeToBubble: () => void;
  onClose: () => void;
  guestSearchesLeft?: number;
  isLocked?: boolean;
}

export const DesktopTypeBar: React.FC<DesktopTypeBarProps> = ({
  searchQuery,
  onSearchChange,
  selectedCategory,
  onCategoryChange,
  onExpand,
  onMinimizeToBubble,
  onClose,
  guestSearchesLeft,
  isLocked,
}) => {
  const inputRef = useRef<HTMLInputElement>(null);
  const { handlePointerDown } = useDesktopDrag();

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === 'ArrowDown') {
      e.preventDefault();
      onExpand();
    }
  };

  const categories = [
    { id: 'all', label: 'All', emoji: '🌟' },
    { id: 'docker', label: 'Docker', emoji: '🐳' },
    { id: 'git', label: 'Git', emoji: '🌿' },
    { id: 'linux', label: 'Linux', emoji: '🐧' },
    { id: 'k8s', label: 'K8s', emoji: '☸️' },
  ];

  return (
    <div
      onPointerDown={handlePointerDown}
      className="w-full h-full flex items-center justify-between px-3 py-2 rounded-2xl border-2 border-candy-violet/70 bg-[#121526]/95 backdrop-blur-xl shadow-[0_10px_40px_rgba(139,92,246,0.35)] select-none animate-pop cursor-grab active:cursor-grabbing"
      title="Glint: Drag anywhere on your desktop screen!"
    >
      {/* Drag Grip + Mascot */}
      <div className="flex items-center gap-1.5 flex-shrink-0">
        <GripVertical className="w-4 h-4 text-slate-500 hover:text-candy-violet transition-colors" />
        <div
          onClick={onExpand}
          className="cursor-pointer transition-transform hover:scale-110 active:scale-95"
          title="Click to expand full cheatsheet & AI overlay"
        >
          <GlintyMascot mood="happy" size="sm" />
        </div>
      </div>

      {/* Main Search Input */}
      <div className="flex-1 flex items-center gap-2 mx-2 bg-glint-base/80 border border-glint-border/60 rounded-xl px-2.5 py-1.5 focus-within:border-candy-violet focus-within:ring-2 focus-within:ring-candy-violet/30 transition-all">
        <Search className="w-4 h-4 text-candy-mint flex-shrink-0" />
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
          placeholder={isLocked ? 'Guest search limit reached (10/10)...' : 'Ask Glinty or type a command (e.g. docker, git)...'}
          disabled={isLocked}
          data-no-drag="true"
          className="w-full bg-transparent text-xs text-white placeholder-slate-400 outline-none font-medium selection:bg-pink-500 selection:text-white"
        />

        {/* Quick Category Pills */}
        <div className="hidden sm:flex items-center gap-1 flex-shrink-0" data-no-drag="true">
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => {
                onCategoryChange(cat.id);
                onExpand();
              }}
              className={`px-1.5 py-0.5 rounded-lg text-[10px] font-bold transition-all ${
                selectedCategory === cat.id
                  ? 'bg-candy-violet text-white shadow-sm'
                  : 'bg-glint-card text-slate-400 hover:text-white hover:bg-glint-bubble'
              }`}
            >
              {cat.emoji}
            </button>
          ))}
        </div>
      </div>

      {/* Action Controls */}
      <div className="flex items-center gap-1 flex-shrink-0" data-no-drag="true">
        {/* Expand Button */}
        <button
          onClick={onExpand}
          className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-candy-violet/20 hover:border-candy-violet/40 border border-transparent transition-all"
          title="Expand Full Cheatsheet & AI Messenger"
        >
          <Maximize2 className="w-3.5 h-3.5 text-candy-mint" />
        </button>

        {/* Minimize to Bubble Button */}
        <button
          onClick={onMinimizeToBubble}
          className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-all"
          title="Minimize to Floating Mascot Bubble"
        >
          <Minus className="w-3.5 h-3.5" />
        </button>

        {/* Close Overlay Button */}
        <button
          onClick={onClose}
          className="p-1.5 rounded-lg text-slate-400 hover:text-candy-coral hover:bg-candy-coral/10 transition-all"
          title="Close Glint Overlay"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
};
