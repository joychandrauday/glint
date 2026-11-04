import React, { useState, useEffect } from 'react';
import { FloatingBubble } from './components/FloatingBubble';
import { ConversationalChat } from './components/ConversationalChat';
import { AuthModal } from './components/AuthModal';
import { useGuestMode } from './hooks/useGuestMode';
import { apiClient } from './services/api';

export type DesktopOverlayMode = 'head' | 'chat';

export const App: React.FC = () => {
  const [mode, setMode] = useState<DesktopOverlayMode>('head');
  const [isAuthOpen, setIsAuthOpen] = useState(false);

  const [userToken, setUserToken] = useState<string | null>(() => apiClient.getToken());
  const [userEmail, setUserEmail] = useState<string | null>(() => {
    return localStorage.getItem('glint_user_email') || null;
  });

  const isAuthenticated = Boolean(userToken);
  const { isLocked } = useGuestMode(isAuthenticated);

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
        setMode((prev) => (prev === 'head' ? 'chat' : 'head'));
      });
      return cleanup;
    }

    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey || e.altKey) && e.code === 'Space') {
        e.preventDefault();
        setMode((prev) => (prev === 'head' ? 'chat' : 'head'));
      }
      if (e.key === 'Escape' && !isAuthOpen) {
        setMode('head');
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

  return (
    <div className="relative w-screen h-screen overflow-hidden bg-transparent select-none">
      {mode === 'head' ? (
        /* Pure Mascot Floating Chat Head (Only the icon, no background box/color plate) */
        <FloatingBubble
          onToggle={() => setMode('chat')}
          isLocked={isLocked}
        />
      ) : (
        /* Mobile-Style Conversational Messenger */
        <ConversationalChat
          onCollapseToHead={() => setMode('head')}
          onClose={() => setMode('head')}
          isAuthenticated={isAuthenticated}
          onOpenAuth={() => setIsAuthOpen(true)}
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
