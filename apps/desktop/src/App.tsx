import React, { useState, useEffect } from 'react';
import { FloatingBubble } from './components/FloatingBubble';
import { MessengerOverlay } from './components/MessengerOverlay';
import { AuthModal } from './components/AuthModal';
import { useGuestMode } from './hooks/useGuestMode';
import { apiClient } from './services/api';
import { Terminal, Shield, Sparkles, Command, Info } from 'lucide-react';

export const App: React.FC = () => {
  const [isOpen, setIsOpen] = useState(true);
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [userToken, setUserToken] = useState<string | null>(() => apiClient.getToken());
  const [userEmail, setUserEmail] = useState<string | null>(() => {
    return localStorage.getItem('glint_user_email') || null;
  });

  const isAuthenticated = Boolean(userToken);
  const { searchesLeft, isLocked, decrementSearchCount, resetGuestCounter } = useGuestMode(isAuthenticated);

  // Global Keyboard Shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ctrl+Space or Alt+Space toggles overlay
      if ((e.ctrlKey || e.metaKey || e.altKey) && e.code === 'Space') {
        e.preventDefault();
        setIsOpen((prev) => !prev);
      }
      // Escape closes overlay
      if (e.key === 'Escape' && isOpen && !isAuthOpen) {
        setIsOpen(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, isAuthOpen]);

  const handleLogin = (token: string, email: string) => {
    apiClient.setToken(token);
    localStorage.setItem('glint_user_email', email);
    setUserToken(token);
    setUserEmail(email);
  };

  const handleLogout = () => {
    apiClient.setToken(null);
    localStorage.removeItem('glint_user_email');
    setUserToken(null);
    setUserEmail(null);
  };

  return (
    <div className="relative w-screen h-screen overflow-hidden bg-slate-950 text-slate-100 flex flex-col font-sans select-none">
      {/* Linux Desktop Simulated Environment (Wallpaper + Mock Terminal Window) */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(14,165,233,0.15),rgba(255,255,255,0))] pointer-events-none" />

      {/* Mock Linux Desktop Header Bar */}
      <header className="relative z-10 h-8 bg-slate-900/90 border-b border-slate-800/80 px-4 flex items-center justify-between text-xs text-slate-400">
        <div className="flex items-center gap-4">
          <span className="font-semibold text-slate-200 flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            Ubuntu Desktop (Wayland / X11)
          </span>
          <span className="text-slate-500">•</span>
          <span className="font-mono text-[11px] text-cyan-400">Glint v0.1.0 (Active)</span>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-[11px] bg-slate-800 px-2 py-0.5 rounded text-slate-300 font-mono">
            Hotkey: Ctrl+Space
          </span>
          <span className="font-mono text-slate-400 text-[11px]">19:30</span>
        </div>
      </header>

      {/* Main Workspace Preview with Mock Terminal */}
      <main className="relative flex-1 p-6 flex flex-col items-center justify-center pointer-events-auto">
        <div className="w-full max-w-3xl rounded-xl border border-slate-800 bg-slate-900/70 backdrop-blur-md shadow-2xl overflow-hidden flex flex-col">
          {/* Mock Terminal Header */}
          <div className="h-9 bg-slate-950/80 px-4 flex items-center justify-between border-b border-slate-800">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-rose-500/80" />
              <div className="w-3 h-3 rounded-full bg-amber-500/80" />
              <div className="w-3 h-3 rounded-full bg-emerald-500/80" />
              <span className="ml-2 text-xs font-mono text-slate-400">
                joychandrauday@workstation: ~/projects/glint
              </span>
            </div>
            <Terminal className="w-3.5 h-3.5 text-slate-500" />
          </div>

          {/* Mock Terminal Body */}
          <div className="p-4 font-mono text-xs text-slate-300 space-y-2 select-text">
            <p className="text-slate-500"># Glint Floating Cheatsheet & AI Assistant Desktop Overlay Demo</p>
            <p className="text-slate-400">
              <span className="text-emerald-400">user@workstation</span>:
              <span className="text-cyan-400">~/projects/glint</span>$ glint status
            </p>
            <p className="text-slate-300">
              [Glint] Floating messenger overlay active in bottom-right corner.
              <br />
              [Mode] {isAuthenticated ? `Authenticated (${userEmail}) - Unlimited Searches` : `Guest Mode (${searchesLeft} searches remaining)`}
            </p>
            <p className="text-slate-400 pt-2">
              <span className="text-emerald-400">user@workstation</span>:
              <span className="text-cyan-400">~/projects/glint</span>$ <span className="animate-pulse">_</span>
            </p>
          </div>
        </div>

        {/* Feature Hint Box */}
        <div className="mt-4 flex items-center gap-4 text-xs text-slate-400 bg-slate-900/50 border border-slate-800/80 px-4 py-2 rounded-lg">
          <div className="flex items-center gap-1.5">
            <Command className="w-3.5 h-3.5 text-cyan-400" />
            <span>Interactive <code className="text-cyan-300 font-mono">{"{{variables}}"}</code> live preview & 1-click copy</span>
          </div>
          <span>•</span>
          <div className="flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            <span>Offline search + AI gateway fallback</span>
          </div>
        </div>
      </main>

      {/* Floating Messenger Overlay */}
      <MessengerOverlay
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        guestSearchesLeft={searchesLeft}
        isGuestLocked={isLocked}
        onSearchConducted={decrementSearchCount}
        isAuthenticated={isAuthenticated}
        userEmail={userEmail}
        onOpenAuth={() => setIsAuthOpen(true)}
        onLogout={handleLogout}
      />

      {/* 40x40px Floating Trigger Bubble */}
      <FloatingBubble
        isOpen={isOpen}
        onToggle={() => setIsOpen((prev) => !prev)}
        guestSearchesLeft={searchesLeft}
        isLocked={isLocked}
      />

      {/* Auth Modal */}
      <AuthModal
        isOpen={isAuthOpen}
        onClose={() => setIsAuthOpen(false)}
        onLogin={handleLogin}
        isGuestLocked={isLocked}
      />
    </div>
  );
};
