import React, { useState, useEffect, useRef } from 'react';
import { BrandSpark } from './BrandSpark';
import { useDesktopDrag } from '../hooks/useDesktopDrag';
import { localCommandDb } from '../services/localCommandDb';
import { X, Sparkles } from 'lucide-react';

interface FloatingBubbleProps {
  onToggle: () => void;
  isLocked?: boolean;
}

const PING_MESSAGES = [
  'Have you done? ⚡',
  'Are you there? 👋',
  'Are you stuck? I can help! 🛠️',
  'Need a quick command? 💻',
  'Working on something cool? 🚀',
  'Terminal giving you errors? 🩺',
  'Looking for a command? Ask me! 🔍',
  'Still hacking away? Keep going! 💪',
  'Need me to explain a bash flag? 💡',
  "Take a breath! I'm right here ☕",
];

const INACTIVITY_THRESHOLD_MS = 45000; // 45 seconds of inactivity before friendly ping
const PING_DISPLAY_DURATION_MS = 8000;  // 8 seconds visible before auto-dismiss

export const FloatingBubble: React.FC<FloatingBubbleProps> = ({
  onToggle,
}) => {
  const { handlePointerDown } = useDesktopDrag(onToggle);
  const dbStats = localCommandDb.getStats();

  const [pingState, setPingState] = useState<{
    visible: boolean;
    message: string;
    direction: 'left' | 'right';
  }>({
    visible: false,
    message: PING_MESSAGES[0],
    direction: 'left',
  });

  const lastActiveRef = useRef<number>(Date.now());
  const dismissTimerRef = useRef<NodeJS.Timeout | null>(null);

  const dismissPing = async () => {
    if (dismissTimerRef.current) {
      clearTimeout(dismissTimerRef.current);
      dismissTimerRef.current = null;
    }
    setPingState((prev) => ({ ...prev, visible: false }));
    const desktop = (window as any).glintDesktop;
    if (desktop?.setPingBubble) {
      await desktop.setPingBubble(false);
    }
    lastActiveRef.current = Date.now();
  };

  const triggerPing = async () => {
    // Rotate message index
    let nextIdx = 0;
    try {
      const savedIdx = parseInt(localStorage.getItem('glint_ping_idx') || '0', 10);
      nextIdx = (savedIdx + 1) % PING_MESSAGES.length;
      localStorage.setItem('glint_ping_idx', String(nextIdx));
    } catch {
      nextIdx = Math.floor(Math.random() * PING_MESSAGES.length);
    }

    const nextMsg = PING_MESSAGES[nextIdx];
    const desktop = (window as any).glintDesktop;
    let direction: 'left' | 'right' = 'left';

    if (desktop?.setPingBubble) {
      const res = await desktop.setPingBubble(true);
      if (res?.direction) {
        direction = res.direction;
      }
    }

    setPingState({
      visible: true,
      message: nextMsg,
      direction,
    });

    // Auto-dismiss after display duration
    if (dismissTimerRef.current) clearTimeout(dismissTimerRef.current);
    dismissTimerRef.current = setTimeout(() => {
      dismissPing();
    }, PING_DISPLAY_DURATION_MS);
  };

  // Inactivity detection listener
  useEffect(() => {
    const handleActivity = () => {
      lastActiveRef.current = Date.now();
    };

    window.addEventListener('mousemove', handleActivity);
    window.addEventListener('mousedown', handleActivity);
    window.addEventListener('keydown', handleActivity);
    window.addEventListener('wheel', handleActivity);
    window.addEventListener('touchstart', handleActivity);

    const checkInterval = setInterval(() => {
      const idleTime = Date.now() - lastActiveRef.current;
      if (idleTime >= INACTIVITY_THRESHOLD_MS && !pingState.visible) {
        triggerPing();
      }
    }, 4000);

    return () => {
      window.removeEventListener('mousemove', handleActivity);
      window.removeEventListener('mousedown', handleActivity);
      window.removeEventListener('keydown', handleActivity);
      window.removeEventListener('wheel', handleActivity);
      window.removeEventListener('touchstart', handleActivity);
      clearInterval(checkInterval);
      if (dismissTimerRef.current) clearTimeout(dismissTimerRef.current);
    };
  }, [pingState.visible]);

  const handleBubbleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    dismissPing();
    onToggle();
  };

  const handleCloseClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    dismissPing();
  };

  return (
    <div
      onPointerDown={handlePointerDown}
      onMouseDown={handlePointerDown}
      onDragStart={(e) => e.preventDefault()}
      className={`w-full h-full flex items-center bg-transparent select-none cursor-grab active:cursor-grabbing p-1 touch-none ${
        pingState.direction === 'right' ? 'justify-start' : 'justify-end'
      }`}
      title={`Glint: Click to chat! Drag anywhere on your screen. (${dbStats.totalCommands} commands offline)`}
    >
      {/* Speech bubble on Left when direction is 'left' */}
      {pingState.visible && pingState.direction === 'left' && (
        <div
          onClick={handleBubbleClick}
          className="mr-2 flex items-center gap-2 px-3 py-1.5 rounded-2xl bg-white/95 dark:bg-zinc-900/95 border border-slate-200/90 dark:border-zinc-800 shadow-xl backdrop-blur-md cursor-pointer hover:scale-[1.02] active:scale-95 transition-all duration-200 animate-slide-left z-30 max-w-[220px]"
          title="Click to open Glint chat"
        >
          <Sparkles className="w-3.5 h-3.5 text-violet-500 dark:text-violet-400 shrink-0 animate-pulse" />
          <span className="text-xs font-medium text-slate-800 dark:text-zinc-100 truncate">
            {pingState.message}
          </span>
          <button
            onClick={handleCloseClick}
            className="p-0.5 rounded-full hover:bg-slate-100 dark:hover:bg-zinc-800 text-slate-400 hover:text-slate-600 dark:hover:text-zinc-200 transition-colors shrink-0"
            title="Dismiss ping"
          >
            <X className="w-3 h-3" />
          </button>
        </div>
      )}

      {/* Pure Mascot Icon ONLY - No background box, no color plate, zero shadow */}
      <div className="relative group transition-transform duration-200 hover:scale-110 active:scale-95 pointer-events-none shrink-0 w-[76px] h-[76px] flex items-center justify-center">
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

      {/* Speech bubble on Right when direction is 'right' */}
      {pingState.visible && pingState.direction === 'right' && (
        <div
          onClick={handleBubbleClick}
          className="ml-2 flex items-center gap-2 px-3 py-1.5 rounded-2xl bg-white/95 dark:bg-zinc-900/95 border border-slate-200/90 dark:border-zinc-800 shadow-xl backdrop-blur-md cursor-pointer hover:scale-[1.02] active:scale-95 transition-all duration-200 animate-slide-right z-30 max-w-[220px]"
          title="Click to open Glint chat"
        >
          <Sparkles className="w-3.5 h-3.5 text-violet-500 dark:text-violet-400 shrink-0 animate-pulse" />
          <span className="text-xs font-medium text-slate-800 dark:text-zinc-100 truncate">
            {pingState.message}
          </span>
          <button
            onClick={handleCloseClick}
            className="p-0.5 rounded-full hover:bg-slate-100 dark:hover:bg-zinc-800 text-slate-400 hover:text-slate-600 dark:hover:text-zinc-200 transition-colors shrink-0"
            title="Dismiss ping"
          >
            <X className="w-3 h-3" />
          </button>
        </div>
      )}
    </div>
  );
};
