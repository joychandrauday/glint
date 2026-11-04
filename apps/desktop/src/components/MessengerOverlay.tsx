import React, { useState, useEffect, useRef } from 'react';
import {
  Search,
  Sparkles,
  X,
  Minus,
  Minimize2,
  GripVertical,
  SlidersHorizontal,
  Database,
  ArrowRight,
} from 'lucide-react';
import { CheatsheetSearchResult } from '@glint/shared';
import { searchEngine } from '../services/searchEngine';
import { localCommandDb } from '../services/localCommandDb';
import { CommandCard } from './CommandCard';
import { AIAssistantView } from './AIAssistantView';
import { BrandSpark } from './BrandSpark';
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
  initialSearchQuery?: string;
  initialCategory?: string;
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
  initialSearchQuery = '',
  initialCategory = 'all',
}) => {
  const [activeTab, setActiveTab] = useState<'cheatsheet' | 'ai'>('cheatsheet');
  const [searchQuery, setSearchQuery] = useState(initialSearchQuery);
  const [selectedCategory, setSelectedCategory] = useState(initialCategory);
  const [showFilters, setShowFilters] = useState(false); // Clean UI: Hidden by default, show on demand!
  const [results, setResults] = useState<CheatsheetSearchResult[]>([]);
  const searchInputRef = useRef<HTMLInputElement>(null);

  const { handlePointerDown } = useDesktopDrag();
  const dbStats = localCommandDb.getStats();

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
    if (initialSearchQuery) {
      setSearchQuery(initialSearchQuery);
    }
  }, [initialSearchQuery]);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => searchInputRef.current?.focus(), 60);
    }
  }, [isOpen]);

  useEffect(() => {
    if (searchQuery.trim().length > 0) {
      onSearchConducted();
    }

    const matched = searchEngine.search(searchQuery, selectedCategory);
    setResults(matched);
  }, [searchQuery, selectedCategory]);

  if (!isOpen) return null;

  return (
    <div className="w-full h-full flex flex-col rounded-3xl border-2 border-glint-violet/70 bg-glint-space/95 backdrop-blur-2xl shadow-[0_15px_60px_rgba(125,35,217,0.45)] overflow-hidden animate-pop select-none">
      {/* Top Header Bar with Draggable Handle */}
      <div
        onPointerDown={handlePointerDown}
        className="flex items-center justify-between px-3.5 py-2.5 border-b border-glint-border/80 bg-gradient-to-r from-glint-card to-glint-bubble cursor-grab active:cursor-grabbing"
        title="Glint: Drag anywhere on your desktop screen!"
      >
        <div className="flex items-center gap-2">
          <GripVertical className="w-3.5 h-3.5 text-slate-500 hover:text-glint-lime transition-colors" />
          <BrandSpark size="sm" animate={Boolean(searchQuery)} />
          <span className="text-xs font-black tracking-tight text-white flex items-center gap-1.5">
            Glint
            <span className="text-[9px] px-1.5 py-0.2 rounded-full font-bold bg-glint-lime/20 text-glint-lime border border-glint-lime/40">
              Desktop
            </span>
          </span>

          {/* Local DB Command Counter */}
          <span
            className="flex items-center gap-1 text-[10px] text-slate-400 bg-glint-space/70 px-2 py-0.5 rounded-full border border-glint-border/60"
            title={`${dbStats.totalCommands} total commands in offline database (${dbStats.learnedCommands} learned)`}
          >
            <Database className="w-2.5 h-2.5 text-glint-lime" />
            <span className="font-mono text-[9px] text-glint-lime">{dbStats.totalCommands}</span>
            <span className="text-[9px] text-slate-400">offline</span>
          </span>
        </div>

        {/* Window Controls */}
        <div className="flex items-center gap-1 text-slate-400" data-no-drag="true">
          {/* Collapse to Type Bar */}
          {onCollapseToBar && (
            <button
              onClick={onCollapseToBar}
              className="p-1.5 rounded-xl hover:bg-glint-violet/20 hover:text-glint-cyan transition-colors"
              title="Collapse to Sleek Message Bar"
            >
              <Minimize2 className="w-3.5 h-3.5" />
            </button>
          )}

          {/* Minimize to Spark Bubble */}
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl hover:bg-glint-border hover:text-white transition-colors"
            title="Minimize to Floating Spark Bubble"
          >
            <Minus className="w-3.5 h-3.5" />
          </button>

          {/* Close Window */}
          <button
            onClick={() => {
              const desktop = (window as any).glintDesktop;
              if (desktop?.closeWindow) {
                desktop.closeWindow();
              } else {
                onClose();
              }
            }}
            className="p-1.5 rounded-xl hover:bg-glint-coral/20 hover:text-glint-coral transition-colors"
            title="Close Glint"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Main Container */}
      <div className="flex-1 flex flex-col p-3 overflow-hidden gap-2.5">
        {/* Always-Visible Message & Search Input Box */}
        <div className="relative flex items-center bg-glint-card/90 border border-glint-border rounded-2xl px-3 py-2 shadow-inner focus-within:border-glint-lime focus-within:ring-2 focus-within:ring-glint-lime/30 transition-all">
          <Search className="w-4 h-4 text-glint-cyan mr-2 flex-shrink-0" />
          <input
            ref={searchInputRef}
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Type a command or natural language request (e.g. docker run, find large files)..."
            className="w-full bg-transparent text-xs text-white placeholder-slate-400 focus:outline-none font-medium selection:bg-glint-magenta selection:text-white"
          />

          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="text-slate-400 hover:text-white text-xs font-bold px-1.5"
            >
              ✕
            </button>
          )}

          {/* On-Demand Filters Toggle Button */}
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`flex items-center gap-1 text-[10px] font-bold px-2 py-1 rounded-xl transition-all ml-1 ${
              showFilters || selectedCategory !== 'all'
                ? 'bg-glint-violet text-white shadow-sm'
                : 'bg-glint-space text-slate-400 hover:text-white border border-glint-border'
            }`}
            title="Toggle Category Filters on demand"
          >
            <SlidersHorizontal className="w-3 h-3" />
            <span className="hidden sm:inline">
              {selectedCategory !== 'all' ? selectedCategory : 'Filters'}
            </span>
          </button>
        </div>

        {/* On-Demand Category Filters Shelf (Clean UI: only shown when demanded) */}
        {showFilters && (
          <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-none py-1 animate-pop">
            {categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`shrink-0 px-2.5 py-1 rounded-full text-xs font-bold transition-all transform active:scale-95 ${
                  selectedCategory === cat.id
                    ? 'bg-glint-lime text-glint-space shadow-md font-black'
                    : 'bg-glint-card text-slate-300 hover:bg-glint-bubble hover:text-white border border-glint-border'
                }`}
              >
                {categoryEmojis[cat.id] || '⚡'} {cat.label} ({cat.count})
              </button>
            ))}
          </div>
        )}

        {/* Results Area */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {activeTab === 'cheatsheet' ? (
            results.length > 0 ? (
              <div className="flex-1 overflow-y-auto pr-1 flex flex-col gap-2">
                {results.map(({ item }) => (
                  <CommandCard
                    key={item.id}
                    item={item}
                    isLearned={item.id.startsWith('learned-')}
                    onCopy={(cmd) => {
                      // Automatically learn command into local database on copy/use!
                      if (searchQuery.trim().length > 2) {
                        localCommandDb.learnCommand(searchQuery, item);
                      }
                    }}
                  />
                ))}
              </div>
            ) : (
              /* No Local Match - Prompt to Ask AI & Auto-Save */
              <div className="flex-1 flex flex-col items-center justify-center p-4 text-center gap-3">
                <BrandSpark size="md" />
                <div className="text-xs text-slate-300 max-w-[280px]">
                  No offline command found for &ldquo;<span className="text-glint-magenta font-bold">{searchQuery}</span>&rdquo; in your local database.
                </div>
                <button
                  onClick={() => setActiveTab('ai')}
                  className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-gradient-to-r from-glint-violet to-glint-magenta text-white text-xs font-bold shadow-md hover:scale-105 active:scale-95 transition-all"
                >
                  <Sparkles className="w-3.5 h-3.5 text-glint-yellow" />
                  <span>Generate with AI & Auto-Save to Local DB</span>
                  <ArrowRight className="w-3.5 h-3.5 ml-1" />
                </button>
              </div>
            )
          ) : (
            <AIAssistantView
              isAuthenticated={isAuthenticated}
              onOpenAuth={onOpenAuth}
              userEmail={userEmail || undefined}
            />
          )}
        </div>
      </div>

      {/* Clean Footer Bar */}
      <div className="px-3.5 py-2 border-t border-glint-border bg-glint-card/80 flex items-center justify-between text-xs text-slate-300">
        <div className="flex items-center gap-2">
          {activeTab === 'cheatsheet' ? (
            <button
              onClick={() => setActiveTab('ai')}
              className="flex items-center gap-1 text-[11px] font-bold text-glint-cyan hover:underline"
            >
              <Sparkles className="w-3 h-3 text-glint-yellow" />
              <span>Ask AI Copilot</span>
            </button>
          ) : (
            <button
              onClick={() => setActiveTab('cheatsheet')}
              className="flex items-center gap-1 text-[11px] font-bold text-glint-lime hover:underline"
            >
              <span>← Back to Cheatsheets</span>
            </button>
          )}
        </div>

        <div className="flex items-center gap-2 text-[10px] text-slate-400">
          <span>Esc to minimize</span>
          <span>•</span>
          <span className="text-glint-lime font-mono">Zero AI Cost</span>
        </div>
      </div>
    </div>
  );
};
