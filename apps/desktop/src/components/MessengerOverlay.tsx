import React, { useState, useEffect, useRef } from 'react';
import {
  Search,
  Sparkles,
  X,
  Minus,
  Lock,
  User,
  LogOut,
  FolderTree,
  Zap,
} from 'lucide-react';
import { CheatsheetSearchResult } from '@glint/shared';
import { searchEngine } from '../services/searchEngine';
import { CommandCard } from './CommandCard';
import { AIAssistantView } from './AIAssistantView';
import { GlintyMascot } from './GlintyMascot';
import { useDesktopDrag } from '../hooks/useDesktopDrag';

interface MessengerOverlayProps {
  isOpen: boolean;
  onClose: () => void;
  onCollapseToBar?: () => void;
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
  onCollapseToBar,
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
  const { handleMouseDown: handleHeaderDrag } = useDesktopDrag();

  const categoryEmojis: Record<string, string> = {
    all: '🌟',
    docker: '🐳',
    git: '🌿',
    k8s: '☸️',
    linux: '🐧',
    networking: '🌐',
  };

  const categories = searchEngine.getCategories();

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => searchInputRef.current?.focus(), 60);
    }
  }, [isOpen]);

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
    <div className="w-full h-full rounded-3xl border-2 border-candy-violet/40 bg-glint-base/95 backdrop-blur-2xl shadow-[0_12px_45px_rgba(139,92,246,0.3)] flex flex-col overflow-hidden animate-pop">
      {/* Playful Top Header Bar (Draggable anywhere on desktop) */}
      <div
        onMouseDown={handleHeaderDrag}
        className="flex items-center justify-between px-4 py-3 border-b border-glint-border/80 bg-gradient-to-r from-glint-card to-glint-bubble select-none cursor-grab active:cursor-grabbing"
        title="Drag anywhere on your desktop screen!"
      >
        <div className="flex items-center gap-2.5">
          <GlintyMascot mood="happy" size="sm" />
          <div className="flex flex-col">
            <span className="text-xs font-black tracking-tight text-white flex items-center gap-1.5">
              Glint
              <span className="text-[9px] px-1.5 py-0.2 rounded-full font-bold bg-candy-mint/20 text-candy-mintLight border border-candy-mint/40">
                Overlay
              </span>
            </span>
          </div>

          {/* Guest Search Counter Badge */}
          {!isAuthenticated ? (
            <button
              onClick={onOpenAuth}
              className={`no-drag text-[10px] font-extrabold px-2.5 py-0.5 rounded-full border transition-all hover:scale-105 active:scale-95 ${
                isGuestLocked
                  ? 'bg-candy-coral/20 border-candy-coral/50 text-candy-coralLight'
                  : 'bg-candy-honey/20 border-candy-honey/50 text-candy-honeyLight'
              }`}
              title="Click to sign in"
            >
              {isGuestLocked ? '🔒 Limit reached' : `⚡ ${guestSearchesLeft} searches left`}
            </button>
          ) : (
            <span className="no-drag text-[10px] font-bold px-2 py-0.5 rounded-full bg-candy-violet/20 border border-candy-violet/40 text-candy-violetLight">
              ✨ Pro (Unlimited)
            </span>
          )}
        </div>

        {/* Window Controls */}
        <div className="no-drag flex items-center gap-1 text-slate-400">
          {onCollapseToBar && (
            <button
              onClick={onCollapseToBar}
              className="px-2 py-1 rounded-xl text-[10px] font-bold bg-[#0A0D18] hover:bg-glint-border text-slate-300 hover:text-white transition-colors"
              title="Collapse into floating search type bar"
            >
              Search Bar ⤢
            </button>
          )}
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl hover:bg-glint-border hover:text-white transition-colors"
            title="Minimize to Bubble"
          >
            <Minus className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl hover:bg-candy-coral/20 hover:text-candy-coral transition-colors"
            title="Close"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Playful Mode Switcher Tabs */}
      <div className="flex items-center px-4 pt-2.5 pb-2 gap-2 border-b border-glint-border/60 bg-glint-card/40">
        <button
          onClick={() => setActiveTab('cheatsheet')}
          className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded-2xl text-xs font-bold transition-all ${
            activeTab === 'cheatsheet'
              ? 'bg-gradient-to-r from-candy-violet to-candy-pink text-white shadow-md'
              : 'text-slate-400 hover:text-white hover:bg-glint-bubble'
          }`}
        >
          <FolderTree className="w-3.5 h-3.5" />
          <span>Cheatsheets</span>
        </button>
        <button
          onClick={() => setActiveTab('ai')}
          className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded-2xl text-xs font-bold transition-all ${
            activeTab === 'ai'
              ? 'bg-gradient-to-r from-candy-violet to-candy-pink text-white shadow-md'
              : 'text-slate-400 hover:text-white hover:bg-glint-bubble'
          }`}
        >
          <Sparkles className="w-3.5 h-3.5 text-candy-honey" />
          <span>AI Copilot</span>
        </button>
      </div>

      {/* Main Container */}
      <div className="flex-1 flex flex-col p-3.5 overflow-hidden">
        {activeTab === 'cheatsheet' ? (
          <div className="flex flex-col h-full gap-2.5 overflow-hidden">
            {/* Search Input Bar */}
            <div className="relative flex items-center">
              <Search className="absolute left-3 w-4 h-4 text-candy-violetLight" />
              <input
                ref={searchInputRef}
                type="text"
                disabled={isGuestLocked}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={
                  isGuestLocked
                    ? 'Search locked. Sign in to unlock!'
                    : 'Search commands (e.g. docker run, git reset)...'
                }
                className="w-full bg-glint-base border-2 border-glint-border focus:border-candy-violet rounded-2xl pl-9 pr-8 py-2 text-xs text-white placeholder-slate-400 focus:outline-none transition-all shadow-inner disabled:opacity-50"
              />
              {searchQuery && !isGuestLocked && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 text-slate-400 hover:text-white text-xs font-bold"
                >
                  ✕
                </button>
              )}
            </div>

            {/* Playful Emoji Category Filter Pills */}
            <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-none py-1">
              {categories.map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => setSelectedCategory(cat.id)}
                  className={`shrink-0 px-3 py-1 rounded-full text-xs font-bold transition-all transform active:scale-95 ${
                    selectedCategory === cat.id
                      ? 'bg-candy-violet text-white shadow-md'
                      : 'bg-glint-bubble text-slate-300 hover:bg-glint-card hover:text-white border border-glint-border'
                  }`}
                >
                  {categoryEmojis[cat.id] || '⚡'} {cat.label} ({cat.count})
                </button>
              ))}
            </div>

            {/* Lock Screen if guest exhausted */}
            {isGuestLocked ? (
              <div className="flex-1 flex flex-col items-center justify-center p-4 text-center gap-3">
                <GlintyMascot mood="warning" size="lg" />
                <div>
                  <h3 className="text-sm font-bold text-white">Guest Search Limit Reached!</h3>
                  <p className="text-xs text-slate-300 mt-1 max-w-[250px]">
                    You used all 10 free guest searches. Sign in with your email to unlock unlimited offline cheatsheets and AI commands!
                  </p>
                </div>
                <button
                  onClick={onOpenAuth}
                  className="py-2 px-5 rounded-2xl bg-gradient-to-r from-candy-violet to-candy-pink hover:opacity-90 text-white text-xs font-extrabold shadow-lg transition-transform hover:scale-105 active:scale-95"
                >
                  Sign In (Unlimited Free)
                </button>
              </div>
            ) : results.length > 0 ? (
              /* Results List */
              <div className="flex-1 overflow-y-auto pr-1 flex flex-col gap-2.5">
                {results.map(({ item }) => (
                  <CommandCard key={item.id} item={item} />
                ))}
              </div>
            ) : (
              /* No Results State */
              <div className="flex-1 flex flex-col items-center justify-center p-4 text-center gap-2.5">
                <GlintyMascot mood="thinking" size="md" />
                <div className="text-xs text-slate-300">
                  No offline cheatsheet found for "<span className="text-candy-pinkLight font-bold">{searchQuery}</span>"
                </div>
                <button
                  onClick={() => setActiveTab('ai')}
                  className="flex items-center gap-1.5 px-3.5 py-2 rounded-2xl bg-gradient-to-r from-candy-violet to-candy-pink text-white text-xs font-bold shadow-md hover:scale-105 active:scale-95 transition-all"
                >
                  <Sparkles className="w-3.5 h-3.5 text-candy-honey" />
                  <span>Ask Glinty AI Copilot</span>
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

      {/* Playful Footer Bar */}
      <div className="px-4 py-2.5 border-t border-glint-border bg-glint-card/80 flex items-center justify-between text-xs text-slate-300">
        {isAuthenticated ? (
          <div className="flex items-center justify-between w-full">
            <div className="flex items-center gap-2 truncate max-w-[210px]">
              <span className="w-2 h-2 rounded-full bg-candy-mint animate-pulse" />
              <span className="truncate text-white text-xs font-semibold">{userEmail}</span>
            </div>
            <button
              onClick={onLogout}
              className="flex items-center gap-1 text-[11px] font-bold text-candy-coral hover:underline transition-colors"
              title="Sign out"
            >
              <LogOut className="w-3 h-3" />
              <span>Logout</span>
            </button>
          </div>
        ) : (
          <div className="flex items-center justify-between w-full">
            <span className="text-[11px] text-slate-400 font-medium">Guest Mode (Local)</span>
            <button
              onClick={onOpenAuth}
              className="text-xs font-bold text-candy-pinkLight hover:underline"
            >
              Sign In Free
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
