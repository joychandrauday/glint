import React, { useState, useEffect } from 'react';
import { FloatingBubble } from './components/FloatingBubble';
import { MessengerOverlay } from './components/MessengerOverlay';
import { AuthModal } from './components/AuthModal';
import { useGuestMode } from './hooks/useGuestMode';
import { apiClient } from './services/api';

export const App: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [userToken, setUserToken] = useState<string | null>(() => apiClient.getToken());
  const [userEmail, setUserEmail] = useState<string | null>(() => {
    return localStorage.getItem('glint_user_email') || null;
  });

  const isAuthenticated = Boolean(userToken);
  const { searchesLeft, isLocked, decrementSearchCount } = useGuestMode(isAuthenticated);

  // Resize transparent Electron window when overlay opens or collapses to bubble
  useEffect(() => {
    const desktop = (window as any).glintDesktop;
    if (desktop?.resizeWindow) {
      desktop.resizeWindow(isOpen);
    }
  }, [isOpen]);

  // Global Hotkey toggle (Alt+Space or Ctrl+Space)
  useEffect(() => {
    const desktop = (window as any).glintDesktop;
    if (desktop?.onHotkeyToggle) {
      const cleanup = desktop.onHotkeyToggle(() => {
        setIsOpen((prev) => !prev);
      });
      return cleanup;
    }

    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey || e.altKey) && e.code === 'Space') {
        e.preventDefault();
        setIsOpen((prev) => !prev);
      }
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
    <div className="relative w-screen h-screen overflow-hidden bg-transparent select-none">
      {isOpen ? (
        /* Full Playful Messenger Overlay */
        <MessengerOverlay
          isOpen={true}
          onClose={() => setIsOpen(false)}
          guestSearchesLeft={searchesLeft}
          isGuestLocked={isLocked}
          onSearchConducted={decrementSearchCount}
          isAuthenticated={isAuthenticated}
          userEmail={userEmail}
          onOpenAuth={() => setIsAuthOpen(true)}
          onLogout={handleLogout}
        />
      ) : (
        /* Compact Floating Mascot Bubble */
        <FloatingBubble
          onToggle={() => setIsOpen(true)}
          guestSearchesLeft={searchesLeft}
          isLocked={isLocked}
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
