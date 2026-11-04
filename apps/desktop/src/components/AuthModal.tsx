import React, { useState } from 'react';
import { X, Lock, KeyRound, Sparkles, User, ShieldAlert, Heart } from 'lucide-react';
import { GlintyMascot } from './GlintyMascot';

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

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    const token = `user-${email.split('@')[0]}-${Date.now()}`;
    onLogin(token, email);
    onClose();
  };

  const handleQuickLogin = (demoRole: 'developer' | 'admin') => {
    const token = `dev-${demoRole}-${Date.now()}`;
    onLogin(token, `${demoRole}@glint.dev`);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-md p-4 animate-pop">
      <div className="relative w-full max-w-sm rounded-3xl border-2 border-candy-violet/50 bg-glint-base shadow-2xl p-6 text-slate-100 flex flex-col gap-4">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-white p-1 rounded-full hover:bg-glint-bubble transition-colors"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Mascot & Header */}
        <div className="flex items-center gap-3">
          <GlintyMascot mood="happy" size="md" />
          <div>
            <h2 className="text-sm font-black text-white">
              {mode === 'login' ? 'Welcome to Glint!' : 'Create Your Free Account'}
            </h2>
            <p className="text-xs text-slate-300">
              Unlock unlimited cheatsheet searches & AI credits
            </p>
          </div>
        </div>

        {/* Guest Lock Notification Alert */}
        {isGuestLocked && (
          <div className="flex items-start gap-2.5 rounded-2xl border border-candy-honey/40 bg-candy-honey/15 p-3 text-xs text-candy-honeyLight">
            <span className="text-base">⚡</span>
            <div>
              <span className="font-bold block">Guest Searches Complete!</span>
              Sign in with your email or pick a demo profile below to keep searching for free.
            </div>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="flex flex-col gap-3">
          <div className="flex flex-col gap-1">
            <label className="text-xs text-slate-300 font-bold">Email</label>
            <input
              type="email"
              required
              placeholder="developer@workstation.io"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="rounded-2xl border-2 border-glint-border bg-glint-card px-3.5 py-2 text-xs text-white placeholder-slate-500 focus:border-candy-violet focus:outline-none transition-all"
            />
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-xs text-slate-300 font-bold">Password</label>
            <input
              type="password"
              required
              placeholder="••••••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="rounded-2xl border-2 border-glint-border bg-glint-card px-3.5 py-2 text-xs text-white placeholder-slate-500 focus:border-candy-violet focus:outline-none transition-all"
            />
          </div>

          <button
            type="submit"
            className="w-full mt-1 py-2.5 px-4 rounded-2xl bg-gradient-to-r from-candy-violet via-candy-pink to-candy-honey hover:opacity-95 font-bold text-xs text-white shadow-lg transition-transform hover:scale-105 active:scale-95 flex items-center justify-center gap-1.5"
          >
            <KeyRound className="w-3.5 h-3.5" />
            <span>{mode === 'login' ? 'Sign In' : 'Sign Up Free'}</span>
          </button>
        </form>

        {/* 1-Click Quick Demo Profiles */}
        <div className="border-t border-glint-border pt-3 flex flex-col gap-2">
          <span className="text-[10px] uppercase font-bold text-candy-violetLight tracking-wider">
            Quick 1-Click Demo Profiles:
          </span>
          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={() => handleQuickLogin('developer')}
              className="flex items-center justify-center gap-1.5 py-2 px-3 rounded-2xl border border-glint-border bg-glint-bubble hover:bg-glint-card text-xs font-bold text-slate-200 transition-all hover:scale-105 active:scale-95"
            >
              <User className="w-3.5 h-3.5 text-candy-cyan" />
              <span>Dev User</span>
            </button>
            <button
              onClick={() => handleQuickLogin('admin')}
              className="flex items-center justify-center gap-1.5 py-2 px-3 rounded-2xl border border-glint-border bg-glint-bubble hover:bg-glint-card text-xs font-bold text-slate-200 transition-all hover:scale-105 active:scale-95"
            >
              <Sparkles className="w-3.5 h-3.5 text-candy-honey" />
              <span>Admin User</span>
            </button>
          </div>
        </div>

        {/* Switch Mode */}
        <div className="text-center text-xs text-slate-400">
          {mode === 'login' ? (
            <span>
              New to Glint?{' '}
              <button
                type="button"
                onClick={() => setMode('signup')}
                className="text-candy-pinkLight font-bold hover:underline"
              >
                Create account
              </button>
            </span>
          ) : (
            <span>
              Have an account?{' '}
              <button
                type="button"
                onClick={() => setMode('login')}
                className="text-candy-pinkLight font-bold hover:underline"
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
