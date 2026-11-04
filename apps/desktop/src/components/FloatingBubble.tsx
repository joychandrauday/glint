import React from 'react';
import { Lock } from 'lucide-react';
import { GlintyMascot } from './GlintyMascot';

interface FloatingBubbleProps {
  onToggle: () => void;
  guestSearchesLeft?: number;
  isLocked?: boolean;
}

export const FloatingBubble: React.FC<FloatingBubbleProps> = ({
  onToggle,
  guestSearchesLeft,
  isLocked,
}) => {
  return (
    <div
      onClick={onToggle}
      className="w-full h-full flex items-center justify-center p-1 bg-transparent select-none cursor-pointer"
      title={
        isLocked
          ? 'Glint (10/10 Guest Searches Used)'
          : 'Glint: Your Playful Floating Command Overlay (Alt+Space)'
      }
    >
      <div
        className={`w-14 h-14 rounded-3xl flex items-center justify-center transition-all duration-200 transform hover:scale-110 active:scale-95
          bg-gradient-to-tr from-[#121526] via-[#1E243E] to-[#121526] border-2
          ${
            isLocked
              ? 'border-candy-coral shadow-[0_0_20px_rgba(244,63,94,0.6)]'
              : 'border-candy-violet/90 hover:border-candy-pink shadow-[0_0_25px_rgba(139,92,246,0.6)] animate-float'
          }
        `}
      >
        <div className="relative flex items-center justify-center">
          {isLocked ? (
            <div className="flex flex-col items-center">
              <Lock className="w-5 h-5 text-candy-coral" />
              <span className="text-[9px] font-bold text-candy-coralLight">Unlock</span>
            </div>
          ) : (
            <GlintyMascot mood="happy" size="md" />
          )}

          {/* Counter Badge */}
          {guestSearchesLeft !== undefined && guestSearchesLeft < 10 && !isLocked && (
            <span className="absolute -top-3 -right-3 px-1.5 py-0.2 text-[10px] font-black rounded-full bg-candy-honey text-slate-950 border border-glint-base shadow-sm">
              {guestSearchesLeft}
            </span>
          )}
        </div>
      </div>
    </div>
  );
};
