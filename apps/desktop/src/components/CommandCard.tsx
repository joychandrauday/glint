import React, { useState, useMemo } from 'react';
import { Copy, Check, Sliders, Sparkles, Database, AlertTriangle, ShieldCheck } from 'lucide-react';
import { CheatsheetItem, substituteTemplateVariables } from '@glint/shared';

interface CommandCardProps {
  item: CheatsheetItem;
  onCopy?: (finalCommand: string) => void;
  isLearned?: boolean;
}

export const CommandCard: React.FC<CommandCardProps> = ({ item, onCopy }) => {
  const [copied, setCopied] = useState(false);
  const [showParameters, setShowParameters] = useState(true);

  // Extract variables from explicit list or auto-parse from template {{var}}
  const effectiveVariables = useMemo(() => {
    if (item.variables && item.variables.length > 0) return item.variables;
    const target = item.template || item.command || '';
    const vars: Array<{ name: string; label: string; defaultValue?: string }> = [];
    const regex = /\{\{([a-zA-Z0-9_-]+)(?::([^}]+))?\}\}/g;
    let match;
    const seen = new Set<string>();
    while ((match = regex.exec(target)) !== null) {
      const name = match[1];
      const defaultValue = match[2] || '';
      if (!seen.has(name)) {
        seen.add(name);
        vars.push({
          name,
          label: name.replace(/[-_]/g, ' '),
          defaultValue,
        });
      }
    }
    return vars;
  }, [item.variables, item.template, item.command]);

  // Initialize variables from defaults
  const [variableValues, setVariableValues] = useState<Record<string, string>>(() => {
    const initial: Record<string, string> = {};
    if (effectiveVariables.length > 0) {
      effectiveVariables.forEach((v) => {
        initial[v.name] = v.defaultValue || '';
      });
    }
    return initial;
  });

  const rawTemplate = item.template || item.command;
  const finalCommand = useMemo(() => {
    return substituteTemplateVariables(rawTemplate, variableValues, { preserveUnfilled: false });
  }, [rawTemplate, variableValues]);

  const handleCopy = () => {
    if (typeof window !== 'undefined' && (window as any).glintDesktop?.writeClipboard) {
      (window as any).glintDesktop.writeClipboard(finalCommand);
    } else {
      navigator.clipboard.writeText(finalCommand);
    }

    setCopied(true);
    onCopy?.(finalCommand);
    setTimeout(() => setCopied(false), 2000);
  };

  const hasVariables = effectiveVariables.length > 0;
  const isDestructive = item.dangerLevel === 'dangerous';
  const isCaution = item.dangerLevel === 'caution';

  return (
    <div className="group relative rounded-xl border border-slate-200 dark:border-zinc-800/90 bg-white dark:bg-zinc-900/80 hover:border-slate-300 dark:hover:border-zinc-700/80 transition-all duration-200 p-3 flex flex-col gap-2 shadow-xs">
      {/* Top Header Row */}
      <div className="flex items-center justify-between gap-2 text-xs">
        <div className="flex items-center gap-1.5 flex-wrap">
          {/* Category Pill */}
          <span className="px-1.5 py-0.5 rounded text-[9px] font-medium uppercase bg-slate-100 text-slate-700 border border-slate-200 dark:bg-zinc-800 dark:text-zinc-300 dark:border-zinc-700/60 font-mono">
            {item.category || 'terminal'}
          </span>

          {/* Automatic Offline Memory Badge */}
          <span className="inline-flex items-center gap-1 text-[9px] font-medium text-slate-600 bg-slate-100/80 px-1.5 py-0.5 rounded border border-slate-200 dark:text-zinc-400 dark:bg-zinc-800/60 dark:border-zinc-700/50 font-mono">
            <Database className="w-2.5 h-2.5 text-emerald-500 dark:text-emerald-400" />
            Auto-saved
          </span>

          {/* Safety & Danger Analysis Badges */}
          {isDestructive && (
            <span className="text-[9px] font-medium text-rose-500 dark:text-rose-400 bg-rose-500/10 px-1.5 py-0.5 rounded border border-rose-500/20 flex items-center gap-1 font-mono">
              <AlertTriangle className="w-2.5 h-2.5" /> DESTRUCTIVE
            </span>
          )}
          {isCaution && (
            <span className="text-[9px] font-medium text-amber-500 dark:text-amber-400 bg-amber-500/10 px-1.5 py-0.5 rounded border border-amber-500/20 flex items-center gap-1 font-mono">
              <AlertTriangle className="w-2.5 h-2.5" /> CAUTION
            </span>
          )}
          {!isDestructive && !isCaution && (
            <span className="text-[9px] font-medium text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-1.5 py-0.5 rounded border border-emerald-500/20 flex items-center gap-1 font-mono">
              <ShieldCheck className="w-2.5 h-2.5" /> SAFE
            </span>
          )}
        </div>

        {/* Live Variable Parameter Counter */}
        {hasVariables && (
          <button
            onClick={() => setShowParameters(!showParameters)}
            className="flex items-center gap-1 text-[10px] font-medium px-2 py-0.5 rounded-md transition-all bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200 dark:bg-zinc-800 dark:text-zinc-300 dark:hover:bg-zinc-750 dark:border-zinc-700/60 font-mono cursor-pointer"
          >
            <Sliders className="w-2.5 h-2.5" />
            <span>{showParameters ? 'Hide inputs' : `${effectiveVariables.length} variables`}</span>
          </button>
        )}
      </div>

      {/* Description */}
      <p className="text-xs text-slate-700 dark:text-zinc-300 font-sans leading-relaxed">
        {item.description}
      </p>

      {/* Destructive Warning Alert Banner */}
      {isDestructive && (
        <div className="p-2 rounded-lg bg-rose-500/10 border border-rose-500/20 text-[10px] text-rose-600 dark:text-rose-300 flex items-center gap-1.5 font-sans">
          <AlertTriangle className="w-3.5 h-3.5 flex-shrink-0 text-rose-500 dark:text-rose-400" />
          <span>Warning: This command mutates files, services, or containers. Verify targets carefully.</span>
        </div>
      )}

      {/* Live Interactive Parameter Input Pills */}
      {hasVariables && showParameters && (
        <div className="flex flex-col gap-1.5 p-2 rounded-lg bg-slate-50 dark:bg-zinc-950/80 border border-slate-200 dark:border-zinc-800/80">
          <div className="flex items-center justify-between text-[10px] font-medium text-slate-500 dark:text-zinc-400 font-mono">
            <span className="flex items-center gap-1">
              <Sparkles className="w-3 h-3 text-slate-400 dark:text-zinc-400" />
              Parameters:
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
            {effectiveVariables.map((variable) => (
              <div key={variable.name} className="flex items-center gap-1.5 bg-white dark:bg-zinc-900 px-2 py-1 rounded border border-slate-200 dark:border-zinc-800 shadow-2xs">
                <span className="text-[10px] font-mono text-slate-500 dark:text-zinc-400 whitespace-nowrap">
                  {variable.name}:
                </span>
                <input
                  type="text"
                  value={variableValues[variable.name] || ''}
                  onChange={(e) => {
                    setVariableValues((prev) => ({
                      ...prev,
                      [variable.name]: e.target.value,
                    }));
                  }}
                  placeholder={variable.defaultValue || variable.label}
                  className="w-full text-xs bg-transparent text-slate-900 dark:text-zinc-100 placeholder-slate-400 dark:placeholder-zinc-500 outline-none font-mono"
                />
              </div>
            ))}
          </div>
        </div>
      )}

      {/* High-Contrast Command Preview Box + 1-Click Copy */}
      <div className="relative flex items-center justify-between gap-2 p-2.5 rounded-lg bg-slate-950 dark:bg-black/90 border border-slate-800 dark:border-zinc-800/90 transition-colors">
        <code className="text-xs font-mono text-slate-100 dark:text-zinc-100 font-semibold tracking-tight select-text overflow-x-auto whitespace-pre pr-2">
          {finalCommand}
        </code>

        <button
          onClick={handleCopy}
          className={`flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-semibold transition-all duration-150 flex-shrink-0 cursor-pointer ${
            copied
              ? 'bg-emerald-500 text-white dark:bg-emerald-400 dark:text-zinc-950 shadow-xs'
              : 'bg-violet-600 text-white hover:bg-violet-500 dark:bg-zinc-100 dark:text-zinc-950 dark:hover:bg-white active:scale-95'
          }`}
          title="Copy command to clipboard"
        >
          {copied ? (
            <>
              <Check className="w-3 h-3 stroke-[2.5]" />
              <span className="text-[10px] font-mono">Copied</span>
            </>
          ) : (
            <>
              <Copy className="w-3 h-3" />
              <span className="text-[10px] font-mono">Copy</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
};
