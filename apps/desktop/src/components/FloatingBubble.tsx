import React from 'react';
import { Lock } from 'lucide-react';
import { GlintyMascot } from './GlintyMascot';
import { useDesktopDrag } from '../hooks/useDesktopDrag';

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
  const { handleMouseDown, isDragging } = useDesktopDrag(onOpenBar);

  return (
    <div
      style={{ WebkitAppRegion: 'drag' } as React.CSSProperties}
      onMouseDown={handleMouseDown}
      className="w-full h-full flex items-center justify-center p-1.5 bg-transparent select-none cursor-grab active:cursor-grabbing"
      title="Glint: Drag anywhere on your desktop screen! Click to open search bar."
    >
      <div
        className={`w-16 h-16 rounded-3xl flex items-center justify-center transition-all duration-150 transform
          bg-gradient-to-tr from-[#121526] via-[#1E243E] to-[#121526] border-2
          ${
            isDragging
              ? 'scale-105 ring-4 ring-candy-violet shadow-[0_0_35px_rgba(139,92,246,0.8)] cursor-grabbing'
              : isLocked
              ? 'border-candy-coral shadow-[0_0_20px_rgba(244,63,94,0.5)]'
              : 'border-candy-violet/80 hover:border-candy-pink shadow-[0_0_25px_rgba(139,92,246,0.5)] animate-float'
          }
        `}
      >
        <div className="relative flex items-center justify-center pointer-events-none">
          {isLocked ? (
            <div className="flex flex-col items-center">
              <Lock className="w-5 h-5 text-candy-coral" />
              <span className="text-[9px] font-bold text-candy-coralLight">Unlock</span>
            </div>
          ) : (
            <GlintyMascot mood={isDragging ? 'celebrate' : 'happy'} size="md" />
          )}

          {/* Counter Badge */}
          {guestSearchesLeft !== undefined && guestSearchesLeft < 10 && !isLocked && (
            <span className="absolute -top-3.5 -right-3.5 px-2 py-0.5 text-[10px] font-extrabold rounded-full bg-candy-honey text-slate-950 border-2 border-glint-base shadow-sm">
              {guestSearchesLeft}
            </span>
          )}
        </div>
      </div>
    </div>
  );
};
