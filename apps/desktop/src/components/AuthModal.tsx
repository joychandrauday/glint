import React, { useState } from 'react';
import { X, KeyRound, Sparkles, User, Loader2, AlertCircle, ShieldCheck } from 'lucide-react';
import { BrandSpark } from './BrandSpark';
import { signInWithEmail, signUpWithEmail } from '../services/supabaseAuth';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLogin: (token: string, email: string) => void;
  isGuestLocked?: boolean;
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  onLogin,
  isGuestLocked,
}) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [mode, setMode] = useState<'login' | 'signup'>('login');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanEmail = email.trim();
    if (!cleanEmail || !password) return;

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(cleanEmail)) {
      setErrorMessage('Please enter a valid email address.');
      return;
    }

    // Guard against dummy domains that bounce
    if (mode === 'signup') {
      const domain = cleanEmail.split('@')[1]?.toLowerCase();
      if (domain === 'example.com' || domain === 'test.com' || domain === 'fake.com') {
        setErrorMessage('Please provide a real email domain to prevent delivery bounces.');
        return;
      }
    }

    setIsLoading(true);
    setErrorMessage(null);

    const result =
      mode === 'login'
        ? await signInWithEmail(cleanEmail, password)
        : await signUpWithEmail(cleanEmail, password);

    setIsLoading(false);

    if (result.success && result.token) {
      onLogin(result.token, result.email || cleanEmail);
      onClose();
    } else {
      setErrorMessage(result.error || 'Authentication failed. Please check your credentials.');
    }
  };

  const handleQuickLogin = async (demoRole: 'developer' | 'admin') => {
    setIsLoading(true);
    setErrorMessage(null);
    const targetEmail = `${demoRole}@glint.dev`;
    const res = await signInWithEmail(targetEmail, 'Password123!');
    setIsLoading(false);

    if (res.success && res.token) {
      onLogin(res.token, res.email || targetEmail);
      onClose();
    } else {
      // Offline fallback token
      onLogin(`dev-${demoRole}-${Date.now()}`, targetEmail);
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-md p-4 animate-pop">
      <div className="relative w-full max-w-sm rounded-3xl border border-slate-200 dark:border-glint-violet/50 bg-white dark:bg-glint-space shadow-2xl p-6 text-slate-900 dark:text-slate-100 flex flex-col gap-4">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-slate-700 dark:hover:text-white p-1 rounded-full hover:bg-slate-100 dark:hover:bg-glint-bubble transition-colors"
          title="Close modal"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Mascot & Header */}
        <div className="flex items-center gap-3">
          <BrandSpark size="md" className="w-8 h-8" />
          <div>
            <h2 className="text-sm font-black text-slate-900 dark:text-white">
              {mode === 'login' ? 'Sign in to Glint' : 'Create Free Glint Account'}
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Sync history, offline playbooks & 15 daily AI queries
            </p>
          </div>
        </div>

        {/* Guest Lock Notification Alert */}
        {isGuestLocked && (
          <div className="flex items-start gap-2.5 rounded-2xl border border-amber-300 dark:border-glint-yellow/40 bg-amber-50 dark:bg-glint-yellow/15 p-3 text-xs text-amber-800 dark:text-glint-yellow">
            <span className="text-base">⚡</span>
            <div>
              <span className="font-bold block">Guest Limit Reached</span>
              Sign in with your email or use a 1-click developer profile below to keep searching for free.
            </div>
          </div>
        )}

        {/* Error Alert */}
        {errorMessage && (
          <div className="flex items-center gap-2 p-2.5 rounded-xl border border-rose-300 dark:border-rose-500/40 bg-rose-50 dark:bg-rose-950/40 text-xs text-rose-700 dark:text-rose-300">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="flex flex-col gap-3">
          <div className="flex flex-col gap-1">
            <label className="text-xs text-slate-700 dark:text-slate-300 font-bold">Email</label>
            <input
              type="email"
              required
              placeholder="developer@workstation.io"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="rounded-2xl border border-slate-300 dark:border-glint-border bg-slate-50 dark:bg-glint-card px-3.5 py-2 text-xs text-slate-900 dark:text-white placeholder-slate-400 focus:border-glint-violet focus:outline-none transition-all"
            />
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-xs text-slate-700 dark:text-slate-300 font-bold">Password</label>
            <input
              type="password"
              required
              placeholder="••••••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="rounded-2xl border border-slate-300 dark:border-glint-border bg-slate-50 dark:bg-glint-card px-3.5 py-2 text-xs text-slate-900 dark:text-white placeholder-slate-400 focus:border-glint-violet focus:outline-none transition-all"
            />
          </div>

          <button
            type="submit"
            disabled={isLoading || !email || !password}
            className="w-full mt-1 py-2.5 px-4 rounded-2xl bg-gradient-to-r from-glint-violet to-glint-magenta hover:opacity-95 disabled:opacity-50 font-bold text-xs text-white shadow-md transition-all active:scale-95 flex items-center justify-center gap-1.5 cursor-pointer"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                <span>Processing...</span>
              </>
            ) : (
              <>
                <KeyRound className="w-3.5 h-3.5" />
                <span>{mode === 'login' ? 'Sign In' : 'Sign Up Free'}</span>
              </>
            )}
          </button>
        </form>

        {/* 1-Click Quick Demo Profiles */}
        <div className="border-t border-slate-200 dark:border-glint-border pt-3 flex flex-col gap-2">
          <span className="text-[10px] uppercase font-bold text-glint-violet dark:text-glint-cyan tracking-wider flex items-center gap-1">
            <ShieldCheck className="w-3 h-3" />
            1-Click Instant Demo Profiles:
          </span>
          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={() => handleQuickLogin('developer')}
              className="flex items-center justify-center gap-1.5 py-2 px-3 rounded-2xl border border-slate-200 dark:border-glint-border bg-slate-50 dark:bg-glint-bubble hover:bg-slate-100 dark:hover:bg-glint-card text-xs font-bold text-slate-700 dark:text-slate-200 transition-all hover:scale-[1.02] active:scale-95 cursor-pointer"
            >
              <User className="w-3.5 h-3.5 text-glint-violet dark:text-glint-cyan" />
              <span>Dev User</span>
            </button>
            <button
              onClick={() => handleQuickLogin('admin')}
              className="flex items-center justify-center gap-1.5 py-2 px-3 rounded-2xl border border-slate-200 dark:border-glint-border bg-slate-50 dark:bg-glint-bubble hover:bg-slate-100 dark:hover:bg-glint-card text-xs font-bold text-slate-700 dark:text-slate-200 transition-all hover:scale-[1.02] active:scale-95 cursor-pointer"
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-500 dark:text-glint-yellow" />
              <span>Admin User</span>
            </button>
          </div>
        </div>

        {/* Switch Mode */}
        <div className="text-center text-xs text-slate-500 dark:text-slate-400">
          {mode === 'login' ? (
            <span>
              New to Glint?{' '}
              <button
                type="button"
                onClick={() => {
                  setMode('signup');
                  setErrorMessage(null);
                }}
                className="text-glint-violet dark:text-glint-cyan font-bold hover:underline cursor-pointer"
              >
                Create account
              </button>
            </span>
          ) : (
            <span>
              Have an account?{' '}
              <button
                type="button"
                onClick={() => {
                  setMode('login');
                  setErrorMessage(null);
                }}
                className="text-glint-violet dark:text-glint-cyan font-bold hover:underline cursor-pointer"
              >
                Sign in
              </button>
            </span>
          )}
        </div>
      </div>
    </div>
  );
};