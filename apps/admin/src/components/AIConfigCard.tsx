import React, { useState } from 'react';
import { Sliders, Cpu, AlertOctagon, ShieldCheck, Zap, RefreshCw, Check } from 'lucide-react';
import { SystemConfig, LLMProvider } from '@glint/shared';

interface AIConfigCardProps {
  config: SystemConfig;
  onUpdateConfig: (newConfig: Partial<SystemConfig>) => void;
}

export const AIConfigCard: React.FC<AIConfigCardProps> = ({ config, onUpdateConfig }) => {
  const [primary, setPrimary] = useState<LLMProvider>(config.primaryProvider);
  const [maintenance, setMaintenance] = useState<boolean>(config.maintenanceMode);
  const [quota, setQuota] = useState<number>(config.defaultDailyQuota);
  const [saved, setSaved] = useState(false);

  const handleSave = () => {
    onUpdateConfig({
      primaryProvider: primary,
      maintenanceMode: maintenance,
      defaultDailyQuota: quota,
    });
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-5 backdrop-blur-sm flex flex-col gap-5">
      <div className="flex items-center justify-between border-b border-slate-800/80 pb-3">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-lg bg-cyan-500/10 border border-cyan-500/30 text-cyan-400">
            <Cpu className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-white">AI Gateway & Provider Orchestration</h3>
            <p className="text-xs text-slate-400">Manage upstream LLM rotation, circuit breaker, and quotas</p>
          </div>
        </div>

        <button
          onClick={handleSave}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
            saved
              ? 'bg-emerald-600 text-white'
              : 'bg-cyan-600 hover:bg-cyan-500 text-white shadow-md shadow-cyan-600/20'
          }`}
        >
          {saved ? <Check className="w-3.5 h-3.5" /> : <RefreshCw className="w-3.5 h-3.5" />}
          <span>{saved ? 'Saved!' : 'Apply Changes'}</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {/* Primary LLM Provider */}
        <div className="flex flex-col gap-2">
          <label className="text-xs font-medium text-slate-300">Primary LLM Provider</label>
          <select
            value={primary}
            onChange={(e) => setPrimary(e.target.value as LLMProvider)}
            className="rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-xs text-slate-200 focus:border-cyan-500 focus:outline-none"
          >
            <option value="groq">Groq (Llama-3.3-70b-versatile)</option>
            <option value="gemini">Google (Gemini-2.5-Flash)</option>
            <option value="cloudflare">Cloudflare Workers AI (Llama-3-8b)</option>
          </select>
          <p className="text-[11px] text-slate-500 leading-tight">
            If primary provider rate-limits or times out (4.5s), gateway automatically cascades down the chain.
          </p>
        </div>

        {/* Daily Default Quota */}
        <div className="flex flex-col gap-2">
          <div className="flex items-center justify-between">
            <label className="text-xs font-medium text-slate-300">Default Daily Free Quota</label>
            <span className="font-mono text-xs font-bold text-cyan-400">{quota} queries/day</span>
          </div>
          <input
            type="range"
            min="5"
            max="100"
            step="5"
            value={quota}
            onChange={(e) => setQuota(Number(e.target.value))}
            className="w-full accent-cyan-500 cursor-pointer"
          />
          <p className="text-[11px] text-slate-500 leading-tight">
            Allocated to standard registered users every UTC midnight. Cached queries are always free.
          </p>
        </div>

        {/* Emergency Kill Switch */}
        <div className="flex flex-col gap-2 justify-between">
          <div>
            <label className="text-xs font-medium text-slate-300 flex items-center gap-1.5">
              <AlertOctagon className="w-3.5 h-3.5 text-rose-400" />
              <span>Emergency AI Kill Switch</span>
            </label>
            <p className="text-[11px] text-slate-500 mt-0.5">
              Instantly blocks external AI calls and forces all clients into offline cheatsheet-only mode.
            </p>
          </div>

          <button
            onClick={() => setMaintenance(!maintenance)}
            className={`w-full py-2 px-3 rounded-lg text-xs font-semibold flex items-center justify-center gap-2 border transition-all ${
              maintenance
                ? 'bg-rose-500/20 border-rose-500/50 text-rose-300 hover:bg-rose-500/30'
                : 'bg-slate-950 border-slate-700 text-slate-300 hover:border-slate-600'
            }`}
          >
            <span
              className={`w-2 h-2 rounded-full ${
                maintenance ? 'bg-rose-500 animate-ping' : 'bg-emerald-400'
              }`}
            />
            <span>{maintenance ? 'MAINTENANCE MODE ACTIVE' : 'Kill Switch Disarmed (Normal)'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
