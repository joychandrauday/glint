import React, { useState, useEffect } from 'react';
import { FloatingBubble } from './components/FloatingBubble';
import { CommandTypeBar } from './components/CommandTypeBar';
import { MessengerOverlay } from './components/MessengerOverlay';
import { AuthModal } from './components/AuthModal';
import { useGuestMode } from './hooks/useGuestMode';
import { apiClient } from './services/api';

export type OverlayMode = 'bubble' | 'bar' | 'full';

export const App: React.FC = () => {
  const [mode, setMode] = useState<OverlayMode>('bar');
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [userToken, setUserToken] = useState<string | null>(() => apiClient.getToken());
  const [userEmail, setUserEmail] = useState<string | null>(() => {
    return localStorage.getItem('glint_user_email') || null;
  });

  const isAuthenticated = Boolean(userToken);
  const { searchesLeft, isLocked, decrementSearchCount } = useGuestMode(isAuthenticated);

  // Sync window size with Electron desktop overlay if available
  useEffect(() => {
    const desktop = (window as any).glintDesktop;
    if (desktop?.setMode) {
      desktop.setMode(mode);
    }
  }, [mode]);

  // Global Hotkey listener (CommandOrControl+Space or Alt+Space)
  useEffect(() => {
    const desktop = (window as any).glintDesktop;
    if (desktop?.onHotkeyToggle) {
      const cleanup = desktop.onHotkeyToggle(() => {
        setMode((prev) => (prev === 'bubble' ? 'bar' : 'bubble'));
      });
      return cleanup;
    }

    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey || e.altKey) && e.code === 'Space') {
        e.preventDefault();
        setMode((prev) => (prev === 'bubble' ? 'bar' : 'bubble'));
      }
      if (e.key === 'Escape' && mode !== 'bubble' && !isAuthOpen) {
        setMode('bubble');
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [mode, isAuthOpen]);

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
    <div className="relative w-screen h-screen overflow-hidden bg-transparent select-none">
      {/* State 1: Floating Draggable Mascot Bubble */}
      {mode === 'bubble' && (
        <FloatingBubble
          onOpenBar={() => setMode('bar')}
          guestSearchesLeft={searchesLeft}
          isLocked={isLocked}
        />
      )}

      {/* State 2: Sleek Command Type Bar */}
      {mode === 'bar' && (
        <div className="fixed bottom-3 right-3 z-40 max-w-[500px] w-full">
          <CommandTypeBar
            onExpand={() => setMode('full')}
            onMinimize={() => setMode('bubble')}
            onSearchConducted={decrementSearchCount}
            guestSearchesLeft={searchesLeft}
            isGuestLocked={isLocked}
            onOpenAuth={() => setIsAuthOpen(true)}
          />
        </div>
      )}

      {/* State 3: Full Playful Chat & Cheatsheet Messenger Modal */}
      {mode === 'full' && (
        <MessengerOverlay
          isOpen={true}
          onClose={() => setMode('bubble')}
          onCollapseToBar={() => setMode('bar')}
          guestSearchesLeft={searchesLeft}
          isGuestLocked={isLocked}
          onSearchConducted={decrementSearchCount}
          isAuthenticated={isAuthenticated}
          userEmail={userEmail}
          onOpenAuth={() => setIsAuthOpen(true)}
          onLogout={handleLogout}
        />
      )}

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
