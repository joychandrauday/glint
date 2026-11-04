import React, { useState } from 'react';
import { X, Lock, KeyRound, Sparkles, User, ShieldAlert, CheckCircle } from 'lucide-react';

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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-150">
      <div className="relative w-full max-w-sm rounded-xl border border-slate-700 bg-slate-900 shadow-2xl p-5 text-slate-100 flex flex-col gap-4">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-white p-1 rounded-md hover:bg-slate-800 transition-colors"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Header */}
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-lg bg-cyan-500/10 border border-cyan-500/30 text-cyan-400">
            <Lock className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-sm font-semibold text-white">
              {mode === 'login' ? 'Sign in to Glint' : 'Create an Account'}
            </h2>
            <p className="text-xs text-slate-400">
              Unlock unlimited offline search & AI queries
            </p>
          </div>
        </div>

        {/* Guest Lock Notification Alert */}
        {isGuestLocked && (
          <div className="flex items-start gap-2.5 rounded-lg border border-amber-500/30 bg-amber-500/10 p-3 text-xs text-amber-200">
            <ShieldAlert className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
            <div>
              <span className="font-semibold block">Guest Search Limit Reached</span>
              You have conducted 10 guest searches. Sign in with email or select a demo profile to continue.
            </div>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="flex flex-col gap-3">
          <div className="flex flex-col gap-1">
            <label className="text-xs text-slate-300 font-medium">Email Address</label>
            <input
              type="email"
              required
              placeholder="you@domain.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-xs text-white placeholder-slate-500 focus:border-cyan-500 focus:outline-none"
            />
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-xs text-slate-300 font-medium">Password</label>
            <input
              type="password"
              required
              placeholder="••••••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-xs text-white placeholder-slate-500 focus:border-cyan-500 focus:outline-none"
            />
          </div>

          <button
            type="submit"
            className="w-full mt-1 py-2 px-3 rounded-lg bg-cyan-600 hover:bg-cyan-500 font-medium text-xs text-white shadow-lg shadow-cyan-600/20 transition-colors flex items-center justify-center gap-1.5"
          >
            <KeyRound className="w-3.5 h-3.5" />
            <span>{mode === 'login' ? 'Sign In' : 'Sign Up'}</span>
          </button>
        </form>

        {/* 1-Click Quick Demo Profiles */}
        <div className="border-t border-slate-800 pt-3 flex flex-col gap-2">
          <span className="text-[10px] uppercase font-semibold text-slate-400 tracking-wider">
            Quick 1-Click Demo Profiles:
          </span>
          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={() => handleQuickLogin('developer')}
              className="flex items-center justify-center gap-1.5 py-1.5 px-2 rounded-lg border border-slate-700 bg-slate-800/80 hover:bg-slate-800 text-xs text-slate-200 transition-colors"
            >
              <User className="w-3.5 h-3.5 text-cyan-400" />
              <span>Dev User</span>
            </button>
            <button
              onClick={() => handleQuickLogin('admin')}
              className="flex items-center justify-center gap-1.5 py-1.5 px-2 rounded-lg border border-slate-700 bg-slate-800/80 hover:bg-slate-800 text-xs text-slate-200 transition-colors"
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              <span>Admin User</span>
            </button>
          </div>
        </div>

        {/* Switch Login/Signup */}
        <div className="text-center text-[11px] text-slate-400">
          {mode === 'login' ? (
            <span>
              Don't have an account?{' '}
              <button
                type="button"
                onClick={() => setMode('signup')}
                className="text-cyan-400 hover:underline font-medium"
              >
                Sign up
              </button>
            </span>
          ) : (
            <span>
              Already registered?{' '}
              <button
                type="button"
                onClick={() => setMode('login')}
                className="text-cyan-400 hover:underline font-medium"
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
