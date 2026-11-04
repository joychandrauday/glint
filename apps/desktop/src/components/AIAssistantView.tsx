import React, { useState } from 'react';
import { Sparkles, Send, Loader2, Zap, Clock, ShieldAlert, Heart, Flame } from 'lucide-react';
import { AIQueryResponse } from '@glint/shared';
import { CommandCard } from './CommandCard';
import { GlintyMascot } from './GlintyMascot';
import { apiClient } from '../services/api';

interface AIAssistantViewProps {
  isAuthenticated: boolean;
  onOpenAuth: () => void;
  userEmail?: string;
}

export const AIAssistantView: React.FC<AIAssistantViewProps> = ({
  isAuthenticated,
  onOpenAuth,
  userEmail,
}) => {
  const [prompt, setPrompt] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
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

    try {
      const response = await apiClient.queryAI({
        query: prompt.trim(),
        context: {
          shell: 'bash',
          os: 'Linux (Ubuntu)',
        },
      });

      setLastResponse(response);
    } catch (err: any) {
      setError(err.message || 'Glinty could not reach the AI gateway.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-full gap-3 overflow-y-auto pr-1">
      {/* Friendly Guest Prompt */}
      {!isAuthenticated && (
        <div className="flex items-center justify-between rounded-2.5xl border border-candy-violet/40 bg-gradient-to-r from-candy-violet/15 to-candy-pink/15 p-3 text-xs text-slate-200">
          <div className="flex items-center gap-2">
            <GlintyMascot mood="happy" size="sm" />
            <div>
              <span className="font-bold text-white block">Meet Glinty AI Copilot!</span>
              <span className="text-[11px] text-slate-300">Sign in to unlock free daily AI queries.</span>
            </div>
          </div>
          <button
            onClick={onOpenAuth}
            className="px-3 py-1.5 rounded-full bg-gradient-to-r from-candy-violet to-candy-pink text-white text-xs font-bold shadow-md hover:scale-105 active:scale-95 transition-all"
          >
            Sign In
          </button>
        </div>
      )}

      {/* Playful Query Input */}
      <form onSubmit={handleAskAI} className="relative flex items-center">
        <input
          type="text"
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          placeholder="Ask in plain words (e.g. 'kill port 3000' or 'tar extract')..."
          className="w-full bg-glint-base border-2 border-glint-border focus:border-candy-violet rounded-2xl pl-3.5 pr-11 py-2.5 text-xs text-white placeholder-slate-400 focus:outline-none transition-all shadow-inner"
        />
        <button
          type="submit"
          disabled={loading || !prompt.trim()}
          className="absolute right-2 p-2 rounded-xl bg-gradient-to-r from-candy-violet to-candy-pink text-white hover:opacity-90 disabled:opacity-40 shadow-sm transition-all active:scale-95"
          title="Ask Glinty"
        >
          {loading ? (
            <Loader2 className="w-3.5 h-3.5 animate-spin" />
          ) : (
            <Send className="w-3.5 h-3.5" />
          )}
        </button>
      </form>

      {/* Error Notice */}
      {error && (
        <div className="rounded-2xl border border-candy-coral/40 bg-candy-coral/15 p-3 text-xs text-candy-coralLight flex items-center gap-2">
          <ShieldAlert className="w-4 h-4 text-candy-coral shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Bouncy Loading State */}
      {loading && (
        <div className="flex flex-col items-center justify-center py-8 gap-3 text-slate-300">
          <GlintyMascot mood="thinking" size="lg" />
          <div className="text-center">
            <span className="text-xs font-bold text-candy-violetLight block animate-pulse">
              Glinty is whipping up your command...
            </span>
            <span className="text-[11px] text-slate-400">
              Querying Groq & Gemini multi-provider pool
            </span>
          </div>
        </div>
      )}

      {/* AI Response Display */}
      {lastResponse && !loading && (
        <div className="flex flex-col gap-3">
          {/* Metadata Pill */}
          <div className="flex items-center justify-between text-[11px] bg-glint-bubble/80 px-3 py-1.5 rounded-2xl border border-glint-border">
            <div className="flex items-center gap-2">
              <span className="font-bold text-candy-cyan uppercase">
                {lastResponse.provider}
              </span>
              <span>•</span>
              <span className="flex items-center gap-1 text-slate-300">
                <Clock className="w-3 h-3 text-candy-honey" />
                {lastResponse.latencyMs}ms
              </span>
              {lastResponse.cached && (
                <span className="text-candy-mintLight font-bold flex items-center gap-0.5">
                  <Zap className="w-3 h-3 text-candy-mint" /> Instant
                </span>
              )}
            </div>
            {lastResponse.remainingDailyQuota !== undefined && (
              <span className="font-extrabold text-candy-honey">
                {lastResponse.remainingDailyQuota}/15 left today
              </span>
            )}
          </div>

          {/* Render Commands */}
          <div className="flex flex-col gap-2.5">
            {lastResponse.suggestions.map((sug, idx) => (
              <CommandCard
                key={idx}
                item={{
                  id: `ai-${idx}`,
                  command: sug.command,
                  template: sug.template,
                  description: sug.description,
                  category: 'ai-prompt',
                  tags: ['ai', 'smart'],
                  dangerLevel: sug.dangerLevel,
                  platform: 'all',
                  variables: sug.variables.map((v) => ({
                    name: v.name,
                    defaultValue: v.defaultValue,
                    description: v.description,
                  })),
                }}
              />
            ))}
          </div>
        </div>
      )}

      {/* Cute Quick Prompts */}
      {!lastResponse && !loading && (
        <div className="flex flex-col gap-2 mt-1">
          <span className="text-[10px] font-bold uppercase tracking-wider text-candy-violetLight flex items-center gap-1">
            <Sparkles className="w-3 h-3 text-candy-honey" /> Popular prompts to try:
          </span>
          <div className="flex flex-wrap gap-1.5">
            {[
              'Kill process on port 8080',
              'Git undo last 2 commits safely',
              'Docker prune dangling images',
              'Kubectl pod live tail logs',
            ].map((q) => (
              <button
                key={q}
                onClick={() => setPrompt(q)}
                className="text-left text-xs bg-glint-base hover:bg-glint-bubble text-slate-200 border border-glint-border hover:border-candy-violet rounded-xl px-2.5 py-1.5 transition-all hover:scale-105 active:scale-95"
              >
                "{q}"
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
