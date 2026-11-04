import React, { useState, useEffect, useRef } from 'react';
import {
  Search,
  Zap,
  Sparkles,
  X,
  Minus,
  Lock,
  User,
  LogOut,
  FolderTree,
  AlertCircle,
} from 'lucide-react';
import { CheatsheetItem, CheatsheetSearchResult } from '@glint/shared';
import { searchEngine } from '../services/searchEngine';
import { CommandCard } from './CommandCard';
import { AIAssistantView } from './AIAssistantView';

interface MessengerOverlayProps {
  isOpen: boolean;
  onClose: () => void;
  guestSearchesLeft: number;
  isGuestLocked: boolean;
  onSearchConducted: () => boolean;
  isAuthenticated: boolean;
  userEmail: string | null;
  onOpenAuth: () => void;
  onLogout: () => void;
}

export const MessengerOverlay: React.FC<MessengerOverlayProps> = ({
  isOpen,
  onClose,
  guestSearchesLeft,
  isGuestLocked,
  onSearchConducted,
  isAuthenticated,
  userEmail,
  onOpenAuth,
  onLogout,
}) => {
  const [activeTab, setActiveTab] = useState<'cheatsheet' | 'ai'>('cheatsheet');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [results, setResults] = useState<CheatsheetSearchResult[]>([]);
  const searchInputRef = useRef<HTMLInputElement>(null);

  const categories = searchEngine.getCategories();

  // Focus search input when overlay opens
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => searchInputRef.current?.focus(), 50);
    }
  }, [isOpen]);

  // Execute local offline search
  useEffect(() => {
    if (isGuestLocked) {
      setResults([]);
      return;
    }

    if (searchQuery.trim().length > 0) {
      onSearchConducted();
    }

    const matched = searchEngine.search(searchQuery, selectedCategory);
    setResults(matched);
  }, [searchQuery, selectedCategory, isGuestLocked]);

  if (!isOpen) return null;

  return (
    <div className="fixed bottom-16 right-7 z-40 w-[380px] h-[540px] max-w-[calc(100vw-32px)] max-h-[calc(100vh-80px)] rounded-2xl border border-slate-800 bg-slate-950/95 backdrop-blur-xl shadow-2xl flex flex-col overflow-hidden animate-in zoom-in-95 duration-150">
      {/* Top Header Bar */}
      <div className="flex items-center justify-between px-3.5 py-2.5 border-b border-slate-800/80 bg-slate-900/60 select-none">
        <div className="flex items-center gap-2">
          <div className="w-5 h-5 rounded-full bg-cyan-500/20 border border-cyan-500/40 flex items-center justify-center">
            <Zap className="w-3 h-3 text-cyan-400" />
          </div>
          <span className="text-xs font-bold font-mono tracking-tight text-white">GLINT</span>

          {/* Guest Search Counter Badge */}
          {!isAuthenticated ? (
            <span
              onClick={onOpenAuth}
              className={`text-[10px] font-mono px-2 py-0.5 rounded-full border cursor-pointer transition-colors ${
                isGuestLocked
                  ? 'bg-rose-500/20 border-rose-500/40 text-rose-300 hover:bg-rose-500/30'
                  : 'bg-amber-500/10 border-amber-500/30 text-amber-300 hover:bg-amber-500/20'
              }`}
              title="Click to sign in"
            >
              {isGuestLocked ? 'Guest Locked (10/10)' : `${guestSearchesLeft} guest searches left`}
            </span>
          ) : (
            <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-300">
              Pro (Unlimited)
            </span>
          )}
        </div>

        {/* Window Controls */}
        <div className="flex items-center gap-1 text-slate-400">
          <button
            onClick={onClose}
            className="p-1 rounded hover:bg-slate-800 hover:text-white transition-colors"
            title="Minimize"
          >
            <Minus className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={onClose}
            className="p-1 rounded hover:bg-slate-800 hover:text-white transition-colors"
            title="Close"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Mode Switcher Tabs */}
      <div className="flex items-center px-3 pt-2 pb-1 gap-2 border-b border-slate-800/40">
        <button
          onClick={() => setActiveTab('cheatsheet')}
          className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded-lg text-xs font-medium transition-all ${
            activeTab === 'cheatsheet'
              ? 'bg-cyan-500/10 border border-cyan-500/30 text-cyan-300 shadow-sm'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
          }`}
        >
          <FolderTree className="w-3.5 h-3.5" />
          <span>Cheatsheets</span>
        </button>
        <button
          onClick={() => setActiveTab('ai')}
          className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded-lg text-xs font-medium transition-all ${
            activeTab === 'ai'
              ? 'bg-cyan-500/10 border border-cyan-500/30 text-cyan-300 shadow-sm'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
          }`}
        >
          <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
          <span>AI Copilot</span>
        </button>
      </div>

      {/* Main Body */}
      <div className="flex-1 flex flex-col p-3 overflow-hidden">
        {activeTab === 'cheatsheet' ? (
          <div className="flex flex-col h-full gap-2.5 overflow-hidden">
            {/* Search Input Bar */}
            <div className="relative flex items-center">
              <Search className="absolute left-2.5 w-3.5 h-3.5 text-slate-400" />
              <input
                ref={searchInputRef}
                type="text"
                disabled={isGuestLocked}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={
                  isGuestLocked
                    ? 'Search locked. Sign in to continue.'
                    : 'Search commands, tags, tools (e.g. docker, git)...'
                }
                className="w-full bg-slate-900/90 border border-slate-800 focus:border-cyan-500 rounded-lg pl-8 pr-3 py-2 text-xs text-slate-100 placeholder-slate-500 focus:outline-none disabled:opacity-50"
              />
              {searchQuery && !isGuestLocked && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-2.5 text-slate-400 hover:text-slate-200 text-xs"
                >
                  Clear
                </button>
              )}
            </div>

            {/* Category Filter Pills */}
            <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-none py-0.5">
              {categories.map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => setSelectedCategory(cat.id)}
                  className={`shrink-0 px-2.5 py-1 rounded-full text-[10px] font-medium transition-colors ${
                    selectedCategory === cat.id
                      ? 'bg-cyan-600 text-white'
                      : 'bg-slate-900 text-slate-400 hover:bg-slate-800 hover:text-slate-200 border border-slate-800'
                  }`}
                >
                  {cat.label} ({cat.count})
                </button>
              ))}
            </div>

            {/* Guest Lock Screen */}
            {isGuestLocked ? (
              <div className="flex-1 flex flex-col items-center justify-center p-4 text-center gap-3">
                <div className="w-12 h-12 rounded-full bg-rose-500/10 border border-rose-500/30 flex items-center justify-center text-rose-400">
                  <Lock className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-white">Guest Search Limit Reached</h3>
                  <p className="text-xs text-slate-400 mt-1 max-w-[240px]">
                    You have performed 10 guest searches. Sign in with email or select a demo account for unlimited access.
                  </p>
                </div>
                <button
                  onClick={onOpenAuth}
                  className="py-1.5 px-4 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-medium shadow-md transition-colors"
                >
                  Sign In Now
                </button>
              </div>
            ) : results.length > 0 ? (
              /* Search Results List */
              <div className="flex-1 overflow-y-auto pr-1 flex flex-col gap-2">
                {results.map(({ item }) => (
                  <CommandCard key={item.id} item={item} />
                ))}
              </div>
            ) : (
              /* No Results State with AI Callout */
              <div className="flex-1 flex flex-col items-center justify-center p-4 text-center gap-2.5">
                <AlertCircle className="w-8 h-8 text-slate-600" />
                <div className="text-xs text-slate-400">
                  No offline cheatsheet found for "<span className="text-slate-200">{searchQuery}</span>"
                </div>
                <button
                  onClick={() => setActiveTab('ai')}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-900 border border-cyan-500/40 text-cyan-300 hover:bg-cyan-950/30 text-xs font-medium transition-colors"
                >
                  <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
                  <span>Ask Glint AI Copilot</span>
                </button>
              </div>
            )}
          </div>
        ) : (
          <AIAssistantView
            isAuthenticated={isAuthenticated}
            onOpenAuth={onOpenAuth}
            userEmail={userEmail || undefined}
          />
        )}
      </div>

      {/* Footer / Account Bar */}
      <div className="px-3 py-2 border-t border-slate-800/80 bg-slate-900/40 flex items-center justify-between text-xs text-slate-400">
        {isAuthenticated ? (
          <div className="flex items-center justify-between w-full">
            <div className="flex items-center gap-1.5 truncate max-w-[200px]">
              <User className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
              <span className="truncate text-slate-300 text-[11px] font-mono">{userEmail}</span>
            </div>
            <button
              onClick={onLogout}
              className="flex items-center gap-1 text-[11px] text-slate-400 hover:text-rose-400 transition-colors"
              title="Sign out"
            >
              <LogOut className="w-3 h-3" />
              <span>Sign out</span>
            </button>
          </div>
        ) : (
          <div className="flex items-center justify-between w-full">
            <span className="text-[11px] text-slate-500">Guest Mode</span>
            <button
              onClick={onOpenAuth}
              className="text-[11px] font-medium text-cyan-400 hover:underline"
            >
              Sign In
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
