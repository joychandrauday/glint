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
      onMouseDown={handlePointerDown}
      onDragStart={(e) => e.preventDefault()}
      className="w-full h-full flex items-center justify-center bg-transparent select-none cursor-grab active:cursor-grabbing p-1 touch-none"
      title={`Glint: Click to chat! Drag anywhere on your screen. (${dbStats.totalCommands} commands offline)`}
    >
      {/* Pure Mascot Icon ONLY - No background box, no color plate, zero shadow */}
      <div className="relative group transition-transform duration-200 hover:scale-110 active:scale-95 pointer-events-none">
        <BrandSpark size="xl" animate={false} noShadow={true} />

        {/* Subtle Online Presence Dot */}
        <span
          className="absolute bottom-1 right-1 w-3 h-3 rounded-full bg-emerald-500 dark:bg-emerald-400 border-2 border-white dark:border-zinc-950 animate-pulse pointer-events-none"
          title="Glint is ready"
        />

        {/* Small Offline Counter Pill Badge */}
        {dbStats.totalCommands > 0 && (
          <span
            className="absolute -top-1 -right-1 px-1.5 py-0.2 text-[9px] font-semibold rounded-full bg-violet-600 text-white border border-violet-400 dark:bg-zinc-800 dark:text-zinc-300 dark:border-zinc-700 font-mono pointer-events-none shadow-xs"
            title={`${dbStats.totalCommands} commands stored in local memory`}
          >
            {dbStats.totalCommands}
          </span>
        )}
      </div>
    </div>
  );
};
