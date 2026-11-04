import React from 'react';
import { Sparkles, Zap, Lock } from 'lucide-react';
import { GlintyMascot } from './GlintyMascot';

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
  return (
    <div
      onClick={onToggle}
      className={`fixed bottom-4 right-4 z-50 flex items-center justify-center cursor-pointer select-none
        w-14 h-14 rounded-3xl transition-all duration-300 transform active:scale-90
        ${
          isOpen
            ? 'scale-90 ring-4 ring-candy-violet/50 shadow-[0_0_25px_rgba(139,92,246,0.6)]'
            : 'hover:scale-110 shadow-[0_0_20px_rgba(236,72,153,0.4)] animate-float'
        }
        bg-gradient-to-tr from-glint-card via-glint-bubble to-glint-card border-2
        ${isLocked ? 'border-candy-coral' : 'border-candy-violet/80 hover:border-candy-pink'}
      `}
      title={
        isLocked
          ? 'Glint (10/10 Guest Searches Used)'
          : 'Glint: Your Playful Floating Command Buddy (Alt+Space)'
      }
    >
      <div className="relative flex items-center justify-center">
        {isLocked ? (
          <div className="flex flex-col items-center">
            <Lock className="w-5 h-5 text-candy-coral" />
            <span className="text-[9px] font-bold text-candy-coralLight">Sign In</span>
          </div>
        ) : (
          <GlintyMascot mood={isOpen ? 'celebrate' : 'happy'} size="md" />
        )}

        {/* Playful Floating Badge Counter */}
        {guestSearchesLeft !== undefined && guestSearchesLeft < 10 && !isLocked && (
          <span className="absolute -top-3.5 -right-3.5 px-2 py-0.5 text-[10px] font-extrabold rounded-full bg-candy-honey text-slate-950 border-2 border-glint-base shadow-sm animate-bounce">
            {guestSearchesLeft}
          </span>
        )}
      </div>
    </div>
  );
};
