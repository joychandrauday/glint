import React, { useState } from 'react';
import { Lock } from 'lucide-react';
import { GlintyMascot } from './GlintyMascot';

interface FloatingBubbleProps {
  onOpenBar: () => void;
  guestSearchesLeft?: number;
  isLocked?: boolean;
}

export const FloatingBubble: React.FC<FloatingBubbleProps> = ({
  onOpenBar,
  guestSearchesLeft,
  isLocked,
}) => {
  const [dragStart, setDragStart] = useState<{ x: number; y: number } | null>(null);

  const handleMouseDown = (e: React.MouseEvent) => {
    setDragStart({ x: e.screenX, y: e.screenY });
  };

  const handleMouseUp = (e: React.MouseEvent) => {
    if (!dragStart) return;
    const distance = Math.hypot(e.screenX - dragStart.x, e.screenY - dragStart.y);
    setDragStart(null);

    // If click didn't move far, treat as click to open
    if (distance < 6) {
      onOpenBar();
    }
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (e.buttons !== 1 || !dragStart) return;
    const dx = e.screenX - dragStart.x;
    const dy = e.screenY - dragStart.y;
    setDragStart({ x: e.screenX, y: e.screenY });

    if (typeof window !== 'undefined' && (window as any).glintDesktop?.moveBy) {
      (window as any).glintDesktop.moveBy(dx, dy);
    }
  };

  return (
    <div
      onMouseDown={handleMouseDown}
      onMouseUp={handleMouseUp}
      onMouseMove={handleMouseMove}
      className={`drag-region fixed bottom-2 right-2 z-50 flex items-center justify-center cursor-grab active:cursor-grabbing select-none
        w-16 h-16 rounded-3xl transition-transform duration-200 hover:scale-105 active:scale-95
        bg-gradient-to-tr from-[#121526] via-[#1E243E] to-[#121526] border-2
        ${
          isLocked
            ? 'border-candy-coral shadow-[0_0_20px_rgba(244,63,94,0.5)]'
            : 'border-candy-violet/80 hover:border-candy-pink shadow-[0_0_25px_rgba(139,92,246,0.5)] animate-float'
        }
      `}
      title="Click to search commands (or drag to reposition on desktop)"
    >
      <div className="no-drag relative flex items-center justify-center pointer-events-none">
        {isLocked ? (
          <div className="flex flex-col items-center">
            <Lock className="w-5 h-5 text-candy-coral" />
            <span className="text-[9px] font-bold text-candy-coralLight">Unlock</span>
          </div>
        ) : (
          <GlintyMascot mood="happy" size="md" />
        )}

        {/* Counter Pill */}
        {guestSearchesLeft !== undefined && guestSearchesLeft < 10 && !isLocked && (
          <span className="absolute -top-3.5 -right-3.5 px-2 py-0.5 text-[10px] font-extrabold rounded-full bg-candy-honey text-slate-950 border-2 border-glint-base shadow-sm">
            {guestSearchesLeft}
          </span>
        )}
      </div>
    </div>
  );
};
