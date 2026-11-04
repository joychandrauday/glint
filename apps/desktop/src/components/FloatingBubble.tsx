import React, { useState } from 'react';
import { Zap, Terminal, Sparkles } from 'lucide-react';

interface FloatingBubbleProps {
  isOpen: boolean;
  onToggle: () => void;
  guestSearchesLeft?: number;
  isLocked?: boolean;
}

export const FloatingBubble: React.FC<FloatingBubbleProps> = ({
  isOpen,
  onToggle,
  guestSearchesLeft,
  isLocked,
}) => {
  const [position, setPosition] = useState({ x: 28, y: 28 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });

  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(false);
    setDragStart({ x: e.clientX, y: e.clientY });
  };

  const handleMouseUp = (e: React.MouseEvent) => {
    const distance = Math.hypot(e.clientX - dragStart.x, e.clientY - dragStart.y);
    if (distance < 5) {
      onToggle();
    }
    setIsDragging(false);
  };

  return (
    <div
      style={{ right: `${position.x}px`, bottom: `${position.y}px` }}
      onMouseDown={handleMouseDown}
      onMouseUp={handleMouseUp}
      className={`fixed z-50 flex items-center justify-center select-none cursor-pointer transition-all duration-200
        w-11 h-11 rounded-full bg-slate-900 border-2
        ${
          isLocked
            ? 'border-rose-500 shadow-[0_0_15px_rgba(244,63,94,0.5)]'
            : isOpen
            ? 'border-cyan-400 shadow-[0_0_20px_rgba(6,182,212,0.6)]'
            : 'border-cyan-500/80 shadow-[0_0_12px_rgba(6,182,212,0.3)] hover:border-cyan-400 hover:scale-110'
        }
      `}
      title={isLocked ? 'Glint (Guest Limit Reached)' : 'Glint Cheatsheet & AI Overlay (Ctrl+Space)'}
    >
      <div className="relative flex items-center justify-center">
        {isLocked ? (
          <span className="text-rose-400 text-xs font-bold font-mono">!</span>
        ) : (
          <Zap className="w-5 h-5 text-cyan-400 fill-cyan-400/20 transition-transform group-hover:scale-110" />
        )}

        {/* Guest Search Counter Badge (when < 10) */}
        {guestSearchesLeft !== undefined && guestSearchesLeft < 10 && !isLocked && (
          <span className="absolute -top-3 -right-3 px-1.5 py-0.2 text-[9px] font-mono font-bold rounded-full bg-amber-500 text-slate-950 border border-slate-900">
            {guestSearchesLeft}
          </span>
        )}
      </div>
    </div>
  );
};
