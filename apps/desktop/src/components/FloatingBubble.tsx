import React from 'react';
import { Lock } from 'lucide-react';
import { BrandSpark } from './BrandSpark';
import { useDesktopDrag } from '../hooks/useDesktopDrag';
import { localCommandDb } from '../services/localCommandDb';

interface FloatingBubbleProps {
  onToggle: () => void;
  guestSearchesLeft?: number;
  isLocked?: boolean;
}

export const FloatingBubble: React.FC<FloatingBubbleProps> = ({
  onToggle,
  isLocked,
}) => {
  const { handlePointerDown } = useDesktopDrag(onToggle);
  const dbStats = localCommandDb.getStats();

  return (
    <div
      onPointerDown={handlePointerDown}
      className="w-full h-full flex items-center justify-center p-1 bg-transparent select-none cursor-grab active:cursor-grabbing"
      title={`Glint: Drag anywhere on screen! Click to open (${dbStats.totalCommands} commands offline in local DB)`}
    >
      <div
        className={`w-14 h-14 rounded-3xl flex items-center justify-center transition-all duration-200 transform hover:scale-110 active:scale-95
          bg-gradient-to-tr from-glint-space via-glint-card to-glint-space border-2
          ${
            isLocked
              ? 'border-glint-coral shadow-[0_0_20px_rgba(245,114,101,0.6)]'
              : 'border-glint-violet/90 hover:border-glint-lime shadow-[0_0_25px_rgba(125,35,217,0.6)] animate-float'
          }
        `}
      >
        <div className="relative flex items-center justify-center pointer-events-none">
          {isLocked ? (
            <div className="flex flex-col items-center">
              <Lock className="w-5 h-5 text-glint-coral" />
              <span className="text-[9px] font-bold text-glint-coral">Locked</span>
            </div>
          ) : (
            <BrandSpark size="sm" animate={true} />
          )}

          {/* Local DB Command Counter Badge */}
          <span
            className="absolute -top-3 -right-3 px-1.5 py-0.2 text-[9px] font-black rounded-full bg-glint-lime text-glint-space border border-glint-ink shadow-sm font-mono"
            title={`${dbStats.totalCommands} commands saved offline`}
          >
            {dbStats.totalCommands}
          </span>
        </div>
      </div>
    </div>
  );
};
