import React, { useState } from 'react';
import { Sparkles, Send, Loader2, Zap, Clock, ShieldAlert, Cpu } from 'lucide-react';
import { AIQueryResponse, LLMProvider } from '@glint/shared';
import { CommandCard } from './CommandCard';
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
      setError(err.message || 'Failed to generate commands.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-full gap-3 overflow-y-auto pr-1">
      {/* Auth Banner if Guest */}
      {!isAuthenticated && (
        <div className="flex items-center justify-between rounded-lg border border-cyan-500/30 bg-cyan-500/10 p-3 text-xs text-cyan-200">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-cyan-400 shrink-0" />
            <span>AI Command generation requires sign-in.</span>
          </div>
          <button
            onClick={onOpenAuth}
            className="px-2.5 py-1 rounded bg-cyan-600 hover:bg-cyan-500 text-white font-medium transition-colors"
          >
            Sign In
          </button>
        </div>
      )}

      {/* Query Input Box */}
      <form onSubmit={handleAskAI} className="relative flex items-center">
        <input
          type="text"
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          placeholder="Describe in plain English (e.g. 'kill port 3000' or 'docker log tail')..."
          className="w-full bg-slate-900 border border-slate-700 rounded-lg pl-3 pr-10 py-2.5 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-cyan-500"
        />
        <button
          type="submit"
          disabled={loading || !prompt.trim()}
          className="absolute right-2 p-1.5 rounded-md bg-cyan-600 text-white hover:bg-cyan-500 disabled:opacity-40 disabled:hover:bg-cyan-600 transition-colors"
          title="Send query"
        >
          {loading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Send className="w-3.5 h-3.5" />}
        </button>
      </form>

      {/* Error Notice */}
      {error && (
        <div className="rounded-lg border border-rose-500/30 bg-rose-500/10 p-2.5 text-xs text-rose-300 flex items-center gap-2">
          <ShieldAlert className="w-4 h-4 text-rose-400 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Loading Skeleton */}
      {loading && (
        <div className="flex flex-col items-center justify-center py-8 gap-2.5 text-slate-400">
          <Loader2 className="w-6 h-6 animate-spin text-cyan-400" />
          <span className="text-xs font-mono">Consulting LLM Gateway (Groq / Gemini)...</span>
        </div>
      )}

      {/* AI Response Display */}
      {lastResponse && !loading && (
        <div className="flex flex-col gap-3">
          {/* Metadata pill */}
          <div className="flex items-center justify-between text-[11px] text-slate-400 bg-slate-950/60 px-3 py-1.5 rounded-lg border border-slate-800">
            <div className="flex items-center gap-2">
              <span className="flex items-center gap-1 font-mono text-cyan-400">
                <Cpu className="w-3 h-3" />
                {lastResponse.provider.toUpperCase()}
              </span>
              <span>•</span>
              <span className="flex items-center gap-1">
                <Clock className="w-3 h-3" />
                {lastResponse.latencyMs}ms
              </span>
              {lastResponse.cached && (
                <span className="text-emerald-400 font-medium flex items-center gap-0.5">
                  <Zap className="w-3 h-3" /> Cached
                </span>
              )}
            </div>
            {lastResponse.remainingDailyQuota !== undefined && (
              <span className="font-mono text-slate-300">
                {lastResponse.remainingDailyQuota}/15 left today
              </span>
            )}
          </div>

          {/* Suggestions List */}
          <div className="flex flex-col gap-2.5">
            {lastResponse.suggestions.map((sug, idx) => (
              <CommandCard
                key={idx}
                item={{
                  id: `ai-${idx}`,
                  command: sug.command,
                  template: sug.template,
                  description: sug.description,
                  category: 'ai-generated',
                  tags: ['ai', 'generated'],
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

      {/* Suggested Quick Prompts */}
      {!lastResponse && !loading && (
        <div className="flex flex-col gap-2 mt-2">
          <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-500">
            Try asking:
          </span>
          <div className="flex flex-wrap gap-1.5">
            {[
              'Kill process on port 8080',
              'Extract tar.gz into directory',
              'Docker prune unused images',
              'Kubectl pod live streaming logs',
            ].map((queryText) => (
              <button
                key={queryText}
                onClick={() => {
                  setPrompt(queryText);
                }}
                className="text-left text-xs bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-800 hover:border-slate-700 rounded-md px-2.5 py-1.5 transition-colors"
              >
                "{queryText}"
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
