import React from 'react';
import { BrandSpark } from './BrandSpark';
import { useDesktopDrag } from '../hooks/useDesktopDrag';
import { localCommandDb } from '../services/localCommandDb';

interface FloatingBubbleProps {
  onToggle: () => void;
  isLocked?: boolean;
}

export const FloatingBubble: React.FC<FloatingBubbleProps> = ({
  onToggle,
}) => {
  const { handlePointerDown } = useDesktopDrag(onToggle);
  const dbStats = localCommandDb.getStats();

  return (
    <div
      onPointerDown={handlePointerDown}
      className="w-full h-full flex items-center justify-center bg-transparent select-none cursor-grab active:cursor-grabbing p-1"
      title={`Glint: Click to chat! Drag anywhere on your screen. (${dbStats.totalCommands} commands offline)`}
    >
      {/* Pure Mascot Icon ONLY - No background box, no color plate, zero shadow */}
      <div className="relative group transition-transform duration-200 hover:scale-110 active:scale-95">
        <BrandSpark size="xl" animate={false} noShadow={true} />

        {/* Subtle Online Presence Dot */}
        <span
          className="absolute bottom-1 right-1 w-3.5 h-3.5 rounded-full bg-glint-lime border-2 border-glint-ink animate-pulse"
          title="Glint is ready"
        />

        {/* Small Offline Counter Pill Badge */}
        {dbStats.totalCommands > 0 && (
          <span
            className="absolute -top-1 -right-1 px-1.5 py-0.2 text-[9px] font-black rounded-full bg-glint-yellow text-glint-ink border border-glint-ink font-mono"
            title={`${dbStats.totalCommands} commands stored in local memory`}
          >
            {dbStats.totalCommands}
          </span>
        )}
      </div>
    </div>
  );
};
