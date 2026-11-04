import React, { useState, useEffect } from 'react';
import { DesktopTypeBar } from './components/DesktopTypeBar';
import { MessengerOverlay } from './components/MessengerOverlay';
import { FloatingBubble } from './components/FloatingBubble';
import { AuthModal } from './components/AuthModal';
import { useGuestMode } from './hooks/useGuestMode';
import { apiClient } from './services/api';

export type DesktopOverlayMode = 'bar' | 'full' | 'bubble';

export const App: React.FC = () => {
  const [mode, setMode] = useState<DesktopOverlayMode>('bar');
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');

  const [userToken, setUserToken] = useState<string | null>(() => apiClient.getToken());
  const [userEmail, setUserEmail] = useState<string | null>(() => {
    return localStorage.getItem('glint_user_email') || null;
  });

  const isAuthenticated = Boolean(userToken);
  const { searchesLeft, isLocked, decrementSearchCount } = useGuestMode(isAuthenticated);

  // Synchronize window size and bounds with Electron
  useEffect(() => {
    const desktop = (window as any).glintDesktop;
    if (desktop?.setMode) {
      desktop.setMode(mode);
    }
  }, [mode]);

  // Global hotkeys (Alt+Space / Ctrl+Space / Esc)
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
      if (e.key === 'Escape' && !isAuthOpen) {
        setMode('bubble');
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isAuthOpen]);

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
      {mode === 'bar' && (
        <DesktopTypeBar
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          onExpand={() => setMode('full')}
          onMinimizeToBubble={() => setMode('bubble')}
          onClose={() => setMode('bubble')}
          isLocked={isLocked}
        />
      )}

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
          initialSearchQuery={searchQuery}
          initialCategory={selectedCategory}
        />
      )}

      {mode === 'bubble' && (
        <FloatingBubble
          onToggle={() => setMode('bar')}
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
