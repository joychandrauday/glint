import React, { useState, useEffect } from 'react';
import { X, Key, Check, Loader2, Sparkles, Server, Zap, ShieldCheck, ExternalLink, Eye, EyeOff } from 'lucide-react';
import { byokStorage, AIProvider, ByokSettings } from '../services/byokStorage';

interface ByokSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSaved?: () => void;
}

export const ByokSettingsModal: React.FC<ByokSettingsModalProps> = ({ isOpen, onClose, onSaved }) => {
  const [settings, setSettings] = useState<ByokSettings>(() => byokStorage.getSettings());
  const [showKey, setShowKey] = useState(false);
  const [testStatus, setTestStatus] = useState<'idle' | 'testing' | 'success' | 'error'>('idle');
  const [testMessage, setTestMessage] = useState<string>('');
  const [ollamaDetected, setOllamaDetected] = useState<boolean>(false);
  const [detectedOllamaModels, setDetectedOllamaModels] = useState<string[]>([]);
  const [savedSuccess, setSavedSuccess] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setSettings(byokStorage.getSettings());
      setTestStatus('idle');
      setTestMessage('');
      setSavedSuccess(false);

      // Probe Ollama on open
      const desktop = (window as any).glintDesktop;
      if (desktop?.detectOllama) {
        desktop.detectOllama(settings.ollamaHost).then((res: any) => {
          if (res?.available) {
            setOllamaDetected(true);
            setDetectedOllamaModels(res.models || []);
            if (!settings.ollamaModel && res.models?.length > 0) {
              setSettings((prev) => ({ ...prev, ollamaModel: res.models[0] }));
            }
          } else {
            setOllamaDetected(false);
          }
        });
      }
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleTestKey = async () => {
    const desktop = (window as any).glintDesktop;
    if (!desktop?.testApiKey) return;

    setTestStatus('testing');
    setTestMessage('Testing API connection...');

    let key = '';
    let host = settings.ollamaHost;
    let model = '';

    if (settings.activeProvider === 'groq') {
      key = settings.groqKey || '';
      model = settings.groqModel || 'qwen/qwen3.8-27b';
    } else if (settings.activeProvider === 'gemini') {
      key = settings.geminiKey || '';
      model = settings.geminiModel || 'gemini-flash-lite-latest';
    } else if (settings.activeProvider === 'ollama') {
      model = settings.ollamaModel || 'llama3.2';
    } else if (settings.activeProvider === 'openai') {
      key = settings.openaiKey || '';
      model = settings.openaiModel || 'gpt-4o-mini';
    } else if (settings.activeProvider === 'openrouter') {
      key = settings.openrouterKey || '';
      model = settings.openrouterModel || 'meta-llama/llama-3.3-70b-instruct';
    }

    if (settings.activeProvider !== 'ollama' && !key) {
      setTestStatus('error');
      setTestMessage('Please enter an API key first.');
      return;
    }

    const res = await desktop.testApiKey({
      provider: settings.activeProvider,
      key,
      host,
      model,
    });

    if (res?.success) {
      setTestStatus('success');
      setTestMessage(`Connected successfully in ${res.latencyMs}ms!`);
    } else {
      setTestStatus('error');
      setTestMessage(res?.error || 'Connection failed.');
    }
  };

  const handleSave = () => {
    byokStorage.saveSettings(settings);
    setSavedSuccess(true);
    onSaved?.();
    setTimeout(() => {
      setSavedSuccess(false);
      onClose();
    }, 800);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fade-in font-sans">
      <div className="relative w-full max-w-md bg-white dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 rounded-2xl shadow-2xl p-4 flex flex-col gap-4 text-slate-900 dark:text-zinc-100 max-h-[90vh] overflow-y-auto animate-pop">
        {/* Header */}
        <div className="flex items-center justify-between pb-2 border-b border-slate-200 dark:border-zinc-800">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-violet-100 text-violet-700 dark:bg-zinc-800 dark:text-zinc-300">
              <Key className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-semibold flex items-center gap-1.5 font-sans">
                Bring Your Own Key (BYOK)
                <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-violet-50 text-violet-700 border border-violet-200 dark:bg-zinc-800 dark:text-zinc-400 dark:border-zinc-700">
                  Unlimited
                </span>
              </h2>
              <p className="text-[11px] text-slate-500 dark:text-zinc-400">
                Bypass cloud limits with your personal API key or Local Ollama.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg hover:bg-slate-100 dark:hover:bg-zinc-800 text-slate-400 hover:text-slate-700 dark:text-zinc-400 dark:hover:text-zinc-200 cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Provider Selector Tabs */}
        <div className="flex flex-col gap-1.5">
          <label className="text-[11px] font-medium text-slate-700 dark:text-zinc-300 font-sans">Select AI Provider</label>
          <div className="grid grid-cols-3 gap-1.5 p-1 rounded-xl bg-slate-100 dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800">
            {[
              { id: 'groq' as AIProvider, label: 'Groq', icon: Zap, hint: 'Fastest (Free)' },
              { id: 'gemini' as AIProvider, label: 'Gemini', icon: Sparkles, hint: 'High Context' },
              { id: 'ollama' as AIProvider, label: 'Ollama', icon: Server, hint: '100% Offline' },
              { id: 'openai' as AIProvider, label: 'OpenAI', icon: ShieldCheck, hint: 'GPT-4o' },
              { id: 'openrouter' as AIProvider, label: 'Router', icon: Key, hint: '100+ Models' },
              { id: 'auto' as AIProvider, label: 'Managed', icon: Sparkles, hint: 'Default Pool' },
            ].map((p) => {
              const Icon = p.icon;
              const isActive = settings.activeProvider === p.id;
              return (
                <button
                  key={p.id}
                  onClick={() => setSettings((prev) => ({ ...prev, activeProvider: p.id }))}
                  className={`flex flex-col items-center justify-center py-2 px-1 rounded-lg text-center transition-all cursor-pointer ${
                    isActive
                      ? 'bg-white text-slate-900 font-bold shadow-xs border border-slate-200/90 dark:bg-zinc-800 dark:text-zinc-100 dark:border-zinc-700'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60 dark:text-zinc-400 dark:hover:text-zinc-200 dark:hover:bg-zinc-800/50'
                  }`}
                >
                  <Icon className="w-3.5 h-3.5 mb-0.5" />
                  <span className="text-[11px]">{p.label}</span>
                  <span className="text-[9px] opacity-70 font-mono">{p.hint}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Provider-Specific Configuration */}
        {settings.activeProvider === 'groq' && (
          <div className="flex flex-col gap-2 p-3 rounded-xl bg-slate-50 dark:bg-glint-space/70 border border-slate-200 dark:border-glint-border/80">
            <div className="flex items-center justify-between">
              <label className="text-[11px] font-bold text-slate-700 dark:text-slate-200">Groq API Key</label>
              <a
                href="https://console.groq.com/keys"
                target="_blank"
                rel="noreferrer"
                className="text-[10px] text-glint-cyan hover:underline flex items-center gap-1 font-semibold"
              >
                Get Free Groq Key <ExternalLink className="w-2.5 h-2.5" />
              </a>
            </div>
            <div className="relative flex items-center">
              <input
                type={showKey ? 'text' : 'password'}
                value={settings.groqKey || ''}
                onChange={(e) => setSettings((prev) => ({ ...prev, groqKey: e.target.value }))}
                placeholder="gsk_..."
                className="w-full px-2.5 py-1.5 text-xs rounded-lg bg-white dark:bg-glint-card border border-slate-300 dark:border-glint-border font-mono text-slate-900 dark:text-white placeholder-slate-400 outline-none pr-8"
              />
              <button
                type="button"
                onClick={() => setShowKey(!showKey)}
                className="absolute right-2 text-slate-400 hover:text-slate-600"
              >
                {showKey ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
              </button>
            </div>
            <div className="flex flex-col gap-1 mt-1">
              <label className="text-[10px] font-bold text-slate-500">Groq Model</label>
              <select
                value={settings.groqModel || 'qwen/qwen3.8-27b'}
                onChange={(e) => setSettings((prev) => ({ ...prev, groqModel: e.target.value }))}
                className="w-full px-2 py-1.5 text-xs rounded-lg bg-white dark:bg-glint-card border border-slate-300 dark:border-glint-border text-slate-900 dark:text-white outline-none"
              >
                <option value="qwen/qwen3.8-27b">qwen/qwen3.8-27b (Recommended, Ultra Fast 220ms)</option>
                <option value="openai/gpt-oss-120b">openai/gpt-oss-120b (Deep Reasoning)</option>
                <option value="openai/gpt-oss-20b">openai/gpt-oss-20b (Standard)</option>
              </select>
            </div>
          </div>
        )}

        {settings.activeProvider === 'gemini' && (
          <div className="flex flex-col gap-2 p-3 rounded-xl bg-slate-50 dark:bg-glint-space/70 border border-slate-200 dark:border-glint-border/80">
            <div className="flex items-center justify-between">
              <label className="text-[11px] font-bold text-slate-700 dark:text-slate-200">Google Gemini API Key</label>
              <a
                href="https://aistudio.google.com/app/apikey"
                target="_blank"
                rel="noreferrer"
                className="text-[10px] text-glint-cyan hover:underline flex items-center gap-1 font-semibold"
              >
                Get Free Gemini Key <ExternalLink className="w-2.5 h-2.5" />
              </a>
            </div>
            <div className="relative flex items-center">
              <input
                type={showKey ? 'text' : 'password'}
                value={settings.geminiKey || ''}
                onChange={(e) => setSettings((prev) => ({ ...prev, geminiKey: e.target.value }))}
                placeholder="AIzaSy..."
                className="w-full px-2.5 py-1.5 text-xs rounded-lg bg-white dark:bg-glint-card border border-slate-300 dark:border-glint-border font-mono text-slate-900 dark:text-white placeholder-slate-400 outline-none pr-8"
              />
              <button
                type="button"
                onClick={() => setShowKey(!showKey)}
                className="absolute right-2 text-slate-400 hover:text-slate-600"
              >
                {showKey ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
              </button>
            </div>
            <div className="flex flex-col gap-1 mt-1">
              <label className="text-[10px] font-bold text-slate-500">Gemini Model</label>
              <select
                value={settings.geminiModel || 'gemini-flash-lite-latest'}
                onChange={(e) => setSettings((prev) => ({ ...prev, geminiModel: e.target.value }))}
                className="w-full px-2 py-1.5 text-xs rounded-lg bg-white dark:bg-glint-card border border-slate-300 dark:border-glint-border text-slate-900 dark:text-white outline-none"
              >
                <option value="gemini-flash-lite-latest">gemini-flash-lite-latest (Recommended, Fast)</option>
                <option value="gemini-3.8-flash">gemini-3.8-flash (Latest Generation)</option>
                <option value="gemini-2.5-pro">gemini-2.5-pro (Deep Reasoning)</option>
              </select>
            </div>
          </div>
        )}

        {settings.activeProvider === 'ollama' && (
          <div className="flex flex-col gap-2 p-3 rounded-xl bg-slate-50 dark:bg-glint-space/70 border border-slate-200 dark:border-glint-border/80">
            <div className="flex items-center justify-between">
              <label className="text-[11px] font-bold text-slate-700 dark:text-slate-200 flex items-center gap-1.5">
                Local Ollama Host
                {ollamaDetected && (
                  <span className="text-[9px] font-bold text-glint-lime bg-glint-lime/15 px-1.5 py-0.2 rounded-full border border-glint-lime/30">
                    Active & Online
                  </span>
                )}
              </label>
              <a
                href="https://ollama.com"
                target="_blank"
                rel="noreferrer"
                className="text-[10px] text-glint-cyan hover:underline flex items-center gap-1 font-semibold"
              >
                Install Ollama <ExternalLink className="w-2.5 h-2.5" />
              </a>
            </div>
            <input
              type="text"
              value={settings.ollamaHost || 'http://localhost:11434'}
              onChange={(e) => setSettings((prev) => ({ ...prev, ollamaHost: e.target.value }))}
              placeholder="http://localhost:11434"
              className="w-full px-2.5 py-1.5 text-xs rounded-lg bg-white dark:bg-glint-card border border-slate-300 dark:border-glint-border font-mono text-slate-900 dark:text-white outline-none"
            />
            <div className="flex flex-col gap-1 mt-1">
              <label className="text-[10px] font-bold text-slate-500">Ollama Model</label>
              {detectedOllamaModels.length > 0 ? (
                <select
                  value={settings.ollamaModel || detectedOllamaModels[0]}
                  onChange={(e) => setSettings((prev) => ({ ...prev, ollamaModel: e.target.value }))}
                  className="w-full px-2 py-1.5 text-xs rounded-lg bg-white dark:bg-glint-card border border-slate-300 dark:border-glint-border text-slate-900 dark:text-white outline-none"
                >
                  {detectedOllamaModels.map((m) => (
                    <option key={m} value={m}>
                      {m}
                    </option>
                  ))}
                </select>
              ) : (
                <input
                  type="text"
                  value={settings.ollamaModel || 'llama3.2'}
                  onChange={(e) => setSettings((prev) => ({ ...prev, ollamaModel: e.target.value }))}
                  placeholder="llama3.2, qwen2.5-coder:7b"
                  className="w-full px-2.5 py-1.5 text-xs rounded-lg bg-white dark:bg-glint-card border border-slate-300 dark:border-glint-border font-mono text-slate-900 dark:text-white outline-none"
                />
              )}
            </div>
          </div>
        )}

        {settings.activeProvider === 'openai' && (
          <div className="flex flex-col gap-2 p-3 rounded-xl bg-slate-50 dark:bg-glint-space/70 border border-slate-200 dark:border-glint-border/80">
            <label className="text-[11px] font-bold text-slate-700 dark:text-slate-200">OpenAI API Key</label>
            <div className="relative flex items-center">
              <input
                type={showKey ? 'text' : 'password'}
                value={settings.openaiKey || ''}
                onChange={(e) => setSettings((prev) => ({ ...prev, openaiKey: e.target.value }))}
                placeholder="sk-..."
                className="w-full px-2.5 py-1.5 text-xs rounded-lg bg-white dark:bg-glint-card border border-slate-300 dark:border-glint-border font-mono text-slate-900 dark:text-white outline-none pr-8"
              />
              <button
                type="button"
                onClick={() => setShowKey(!showKey)}
                className="absolute right-2 text-slate-400 hover:text-slate-600"
              >
                {showKey ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
              </button>
            </div>
            <div className="flex flex-col gap-1 mt-1">
              <label className="text-[10px] font-bold text-slate-500">OpenAI Model</label>
              <select
                value={settings.openaiModel || 'gpt-4o-mini'}
                onChange={(e) => setSettings((prev) => ({ ...prev, openaiModel: e.target.value }))}
                className="w-full px-2 py-1.5 text-xs rounded-lg bg-white dark:bg-glint-card border border-slate-300 dark:border-glint-border text-slate-900 dark:text-white outline-none"
              >
                <option value="gpt-4o-mini">gpt-4o-mini (Recommended & Fast)</option>
                <option value="gpt-4o">gpt-4o (Most Capable)</option>
              </select>
            </div>
          </div>
        )}

        {settings.activeProvider === 'openrouter' && (
          <div className="flex flex-col gap-2 p-3 rounded-xl bg-slate-50 dark:bg-glint-space/70 border border-slate-200 dark:border-glint-border/80">
            <label className="text-[11px] font-bold text-slate-700 dark:text-slate-200">OpenRouter API Key</label>
            <div className="relative flex items-center">
              <input
                type={showKey ? 'text' : 'password'}
                value={settings.openrouterKey || ''}
                onChange={(e) => setSettings((prev) => ({ ...prev, openrouterKey: e.target.value }))}
                placeholder="sk-or-v1-..."
                className="w-full px-2.5 py-1.5 text-xs rounded-lg bg-white dark:bg-glint-card border border-slate-300 dark:border-glint-border font-mono text-slate-900 dark:text-white outline-none pr-8"
              />
              <button
                type="button"
                onClick={() => setShowKey(!showKey)}
                className="absolute right-2 text-slate-400 hover:text-slate-600"
              >
                {showKey ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
              </button>
            </div>
            <div className="flex flex-col gap-1 mt-1">
              <label className="text-[10px] font-bold text-slate-500">Model Identifier</label>
              <input
                type="text"
                value={settings.openrouterModel || 'meta-llama/llama-3.3-70b-instruct'}
                onChange={(e) => setSettings((prev) => ({ ...prev, openrouterModel: e.target.value }))}
                placeholder="meta-llama/llama-3.3-70b-instruct"
                className="w-full px-2.5 py-1.5 text-xs rounded-lg bg-white dark:bg-glint-card border border-slate-300 dark:border-glint-border font-mono text-slate-900 dark:text-white outline-none"
              />
            </div>
          </div>
        )}

        {settings.activeProvider === 'auto' && (
          <div className="p-3 rounded-xl bg-glint-violet/10 border border-glint-violet/30 text-xs flex flex-col gap-1">
            <span className="font-bold text-glint-violet dark:text-glint-cyan">Glint Managed Pool Active</span>
            <p className="text-[11px] text-slate-600 dark:text-slate-300">
              Queries use the built-in community free tier. To enjoy unlimited queries with zero rate limits, choose Groq, Gemini, or Ollama above!
            </p>
          </div>
        )}

        {/* Test Connection Feedback */}
        {testStatus !== 'idle' && (
          <div
            className={`p-2 rounded-lg text-xs font-medium flex items-center gap-2 ${
              testStatus === 'testing'
                ? 'bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-300'
                : testStatus === 'success'
                ? 'bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-300'
                : 'bg-rose-50 dark:bg-rose-900/30 text-rose-600 dark:text-rose-300'
            }`}
          >
            {testStatus === 'testing' && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
            {testStatus === 'success' && <Check className="w-3.5 h-3.5" />}
            <span>{testMessage}</span>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex items-center justify-between pt-2 border-t border-slate-200 dark:border-zinc-800">
          {settings.activeProvider !== 'auto' ? (
            <button
              onClick={handleTestKey}
              disabled={testStatus === 'testing'}
              className="px-3 py-1.5 rounded-lg text-xs font-medium bg-slate-100 hover:bg-slate-200 dark:bg-zinc-850 dark:hover:bg-zinc-800 text-slate-700 dark:text-zinc-300 transition-all flex items-center gap-1.5 cursor-pointer border border-slate-200 dark:border-zinc-750"
            >
              <Zap className="w-3 h-3 text-amber-500" />
              Test Connection
            </button>
          ) : (
            <div />
          )}

          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="px-3 py-1.5 rounded-lg text-xs font-medium text-slate-500 hover:text-slate-800 dark:text-zinc-400 dark:hover:text-zinc-200 cursor-pointer"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              className="px-4 py-1.5 rounded-lg text-xs font-semibold bg-violet-600 hover:bg-violet-500 text-white dark:bg-zinc-100 dark:hover:bg-white dark:text-zinc-950 transition-all shadow-xs active:scale-95 flex items-center gap-1.5 cursor-pointer"
            >
              {savedSuccess ? (
                <>
                  <Check className="w-3.5 h-3.5" />
                  Saved!
                </>
              ) : (
                'Save & Apply'
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
