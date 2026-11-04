import React, { useState, useEffect } from 'react';
import { FloatingBubble } from './components/FloatingBubble';
import { ConversationalChat } from './components/ConversationalChat';
import { AuthModal } from './components/AuthModal';
import { useGuestMode } from './hooks/useGuestMode';
import { useTheme } from './hooks/useTheme';
import { apiClient } from './services/api';
import { signOutUser } from './services/supabaseAuth';

export type DesktopOverlayMode = 'head' | 'chat';

export const App: React.FC = () => {
  const [mode, setMode] = useState<DesktopOverlayMode>('head');
  const [isAuthOpen, setIsAuthOpen] = useState(false);

  // Initialize theme (Defaults to Light Theme as requested)
  useTheme();

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

  // Global hotkeys (Ctrl+Space / Alt+Space / Esc) and Electron listeners
  useEffect(() => {
    const desktop = (window as any).glintDesktop;

    const cleanupHotkey = desktop?.onHotkeyToggle?.(() => {
      setMode((prev) => (prev === 'head' ? 'chat' : 'head'));
    });

    const cleanupMode = desktop?.onModeChanged?.((data: { mode: DesktopOverlayMode }) => {
      if (data?.mode) {
        setMode(data.mode);
      }
    });

    const handleKeyDown = (e: KeyboardEvent) => {
      // Ctrl+Space or Alt+Space or Cmd+Space
      if ((e.ctrlKey || e.metaKey || e.altKey) && e.code === 'Space') {
        e.preventDefault();
        setMode((prev) => (prev === 'head' ? 'chat' : 'head'));
      }
      // Esc closes chat modal to floating mascot icon in background
      if (e.key === 'Escape' && !isAuthOpen) {
        setMode('head');
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      cleanupHotkey?.();
      cleanupMode?.();
    };
  }, [isAuthOpen]);

  const handleLogin = (token: string, email: string) => {
    apiClient.setToken(token);
    localStorage.setItem('glint_user_email', email);
    setUserToken(token);
    setUserEmail(email);
  };

  const handleSignOut = async () => {
    await signOutUser();
    apiClient.setToken(null);
    localStorage.removeItem('glint_user_email');
    setUserToken(null);
    setUserEmail(null);
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
        /* Mobile-Style Conversational Messenger (Light Theme by default) */
        <ConversationalChat
          onCollapseToHead={() => setMode('head')}
          onClose={() => setMode('head')}
          isAuthenticated={isAuthenticated}
          userEmail={userEmail}
          onOpenAuth={() => setIsAuthOpen(true)}
          onSignOut={handleSignOut}
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
