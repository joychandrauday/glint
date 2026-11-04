import React from 'react';
import { Sparkles, Zap } from 'lucide-react';

interface GlintMascotProps {
  mood?: 'happy' | 'thinking' | 'celebrate' | 'warning';
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export const GlintMascot: React.FC<GlintMascotProps> = ({
  mood = 'happy',
  size = 'md',
  className = '',
}) => {
  const sizeMap = {
    sm: 'w-7 h-7 text-xs',
    md: 'w-9 h-9 text-sm',
    lg: 'w-12 h-12 text-base',
  };

  return (
    <div
      className={`relative rounded-2xl flex items-center justify-center shrink-0 transition-transform select-none ${
        sizeMap[size]
      } ${
        mood === 'thinking'
          ? 'bg-gradient-to-tr from-candy-violet to-candy-pink animate-pulse'
          : mood === 'celebrate'
          ? 'bg-gradient-to-tr from-candy-mint to-candy-cyan animate-bounce'
          : mood === 'warning'
          ? 'bg-gradient-to-tr from-candy-coral to-candy-honey'
          : 'bg-gradient-to-tr from-candy-cyan via-candy-violet to-candy-pink'
      } ${className}`}
    >
      {/* Cute Expression Face */}
      <div className="relative flex flex-col items-center justify-center">
        {mood === 'happy' && (
          <div className="flex items-center gap-1">
            <span className="w-1 h-1.5 rounded-full bg-white shadow-sm" />
            <span className="w-1 h-1.5 rounded-full bg-white shadow-sm" />
          </div>
        )}
        {mood === 'thinking' && (
          <div className="flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-white animate-ping" />
          </div>
        )}
        {mood === 'celebrate' && (
          <div className="flex items-center gap-1 text-[10px] font-bold text-white">
            ★ ★
          </div>
        )}
        {mood === 'warning' && (
          <div className="flex items-center gap-0.5 text-[10px] font-bold text-white">
            • ▿ •
          </div>
        )}

        {/* Floating Sparkle Crown */}
        <Sparkles className="absolute -top-2.5 -right-2.5 w-3 h-3 text-candy-honeyLight animate-spin" />
      </div>
    </div>
  );
};

export const GlintyMascot = GlintMascot;
