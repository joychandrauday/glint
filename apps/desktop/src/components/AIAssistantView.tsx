import React, { useState } from 'react';
import { Send, Loader2, Zap, Clock, ShieldAlert, Database, Check } from 'lucide-react';
import { AIQueryResponse, CheatsheetItem } from '@glint/shared';
import { CommandCard } from './CommandCard';
import { BrandSpark } from './BrandSpark';
import { apiClient } from '../services/api';
import { localCommandDb } from '../services/localCommandDb';

interface AIAssistantViewProps {
  isAuthenticated: boolean;
  onOpenAuth: () => void;
  userEmail?: string;
}

export const AIAssistantView: React.FC<AIAssistantViewProps> = ({
  isAuthenticated,
  onOpenAuth,
}) => {
  const [prompt, setPrompt] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [savedToDb, setSavedToDb] = useState(false);
  const [lastResponse, setLastResponse] = useState<AIQueryResponse | null>(null);

  const handleAskAI = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!prompt.trim() || loading) return;

    if (!isAuthenticated) {
      onOpenAuth();
      return;
    }

    setLoading(true);
    setError(null);
    setSavedToDb(false);

    try {
      const response = await apiClient.queryAI({
        query: prompt.trim(),
        context: {
          shell: 'bash',
          os: 'Linux (Ubuntu)',
        },
      });

      setLastResponse(response);

      // Auto-save generated suggestions into local persistent database in the background!
      if (response.suggestions && response.suggestions.length > 0) {
        const first = response.suggestions[0];
        await localCommandDb.learnCommand(prompt.trim(), {
          command: first.command,
          template: first.template || first.command,
          description: first.description,
          dangerLevel: first.dangerLevel,
          variables: first.variables?.map((v) => ({ name: v.name, defaultValue: v.defaultValue, label: v.name })) || [],
          category: 'general',
          platform: 'linux',
        });
        setSavedToDb(true);
      }
    } catch (err: any) {
      setError(err.message || 'Could not reach the AI gateway. Using offline heuristics.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-full gap-2.5 overflow-y-auto pr-1">
      {/* Friendly Guest Prompt */}
      {!isAuthenticated && (
        <div className="flex items-center justify-between rounded-2xl border border-glint-violet/40 bg-gradient-to-r from-glint-card to-glint-bubble p-2.5 text-xs text-slate-200">
          <div className="flex items-center gap-2">
            <BrandSpark size="xs" />
            <div>
              <span className="font-bold text-white block">Glint AI Copilot</span>
              <span className="text-[10px] text-slate-400">Sign in to unlock AI queries and sync to local DB.</span>
            </div>
          </div>
          <button
            onClick={onOpenAuth}
            className="px-3 py-1 rounded-xl bg-gradient-to-r from-glint-violet to-glint-magenta text-white text-xs font-bold shadow-md hover:scale-105 active:scale-95 transition-all"
          >
            Sign In
          </button>
        </div>
      )}

      {/* Query Input */}
      <form onSubmit={handleAskAI} className="relative flex items-center">
        <input
          type="text"
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          placeholder="Ask in natural language (e.g. 'kill port 3000' or 'tar extract')..."
          className="w-full bg-glint-card/90 border border-glint-border focus:border-glint-lime rounded-2xl pl-3 pr-10 py-2 text-xs text-white placeholder-slate-400 focus:outline-none transition-all shadow-inner"
        />
        <button
          type="submit"
          disabled={loading || !prompt.trim()}
          className="absolute right-1.5 p-1.5 rounded-xl bg-gradient-to-r from-glint-violet to-glint-magenta text-white hover:opacity-90 disabled:opacity-40 shadow-sm transition-all active:scale-95"
          title="Ask Glint"
        >
          {loading ? (
            <Loader2 className="w-3.5 h-3.5 animate-spin" />
          ) : (
            <Send className="w-3.5 h-3.5" />
          )}
        </button>
      </form>

      {/* Auto-Saved to Local DB Notification */}
      {savedToDb && (
        <div className="rounded-xl border border-glint-lime/30 bg-glint-lime/10 px-3 py-1.5 text-xs text-glint-lime flex items-center justify-between animate-pop">
          <span className="flex items-center gap-1.5 text-[11px] font-bold">
            <Database className="w-3 h-3 text-glint-lime" />
            Saved to Local Database! Future searches will cost 0 AI quota.
          </span>
          <Check className="w-3.5 h-3.5 stroke-[3]" />
        </div>
      )}

      {/* Error Notice */}
      {error && (
        <div className="rounded-xl border border-glint-coral/40 bg-glint-coral/15 p-2.5 text-xs text-glint-coral flex items-center gap-2">
          <ShieldAlert className="w-4 h-4 text-glint-coral shrink-0" />
          <span className="text-[11px] font-medium">{error}</span>
        </div>
      )}

      {/* Results View */}
      {lastResponse?.suggestions && lastResponse.suggestions.length > 0 && (
        <div className="flex flex-col gap-2 animate-pop">
          {/* Metadata pill row */}
          <div className="flex items-center justify-between text-[10px] text-slate-400 px-1">
            <span className="flex items-center gap-1 font-mono">
              <Zap className="w-3 h-3 text-glint-yellow" />
              Provider: <strong className="text-white">{lastResponse.provider}</strong>
            </span>
            <span className="flex items-center gap-1 font-mono">
              <Clock className="w-3 h-3 text-glint-cyan" />
              Latency: <strong className="text-white">{lastResponse.latencyMs}ms</strong>
            </span>
          </div>

          {lastResponse.suggestions.map((suggestion, idx) => {
            const item: CheatsheetItem = {
              id: `ai-suggest-${idx}`,
              command: suggestion.command,
              template: suggestion.template || suggestion.command,
              description: suggestion.description,
              category: 'ai-generated',
              tags: ['ai'],
              variables: suggestion.variables?.map((v) => ({ name: v.name, defaultValue: v.defaultValue, label: v.name })) || [],
              platform: 'linux',
              dangerLevel: suggestion.dangerLevel,
            };

            return (
              <div key={idx} className="flex flex-col gap-1.5">
                <CommandCard item={item} isLearned={true} />
                {suggestion.explanation && (
                  <div className="p-2 rounded-xl border border-glint-border bg-glint-card/80 text-[11px] text-slate-300">
                    <span className="font-bold text-glint-cyan mr-1">Explanation:</span>
                    {suggestion.explanation}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
