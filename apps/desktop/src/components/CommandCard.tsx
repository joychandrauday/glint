import React, { useState, useMemo } from 'react';
import { Copy, Check, Sliders, Sparkles, Database } from 'lucide-react';
import { CheatsheetItem, substituteTemplateVariables } from '@glint/shared';

interface CommandCardProps {
  item: CheatsheetItem;
  onCopy?: (finalCommand: string) => void;
  isLearned?: boolean;
}

export const CommandCard: React.FC<CommandCardProps> = ({ item, onCopy, isLearned }) => {
  const [copied, setCopied] = useState(false);
  const [isEditingVars, setIsEditingVars] = useState(false);

  // Initialize variables from defaults
  const [variableValues, setVariableValues] = useState<Record<string, string>>(() => {
    const initial: Record<string, string> = {};
    if (item.variables) {
      item.variables.forEach((v) => {
        initial[v.name] = v.defaultValue || '';
      });
    }
    return initial;
  });

  const finalCommand = useMemo(() => {
    return substituteTemplateVariables(item.template, variableValues, { preserveUnfilled: false });
  }, [item.template, variableValues]);

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

  const hasVariables = item.variables && item.variables.length > 0;

  return (
    <div className="group relative rounded-2xl border border-slate-200/90 dark:border-glint-border/80 bg-white/95 dark:bg-glint-card/90 hover:border-glint-violet/60 transition-all duration-200 p-3 flex flex-col gap-2 shadow-sm dark:shadow-md hover:shadow-md">
      {/* Top Header Row */}
      <div className="flex items-center justify-between gap-2 text-xs">
        <div className="flex items-center gap-1.5 flex-wrap">
          {/* Category Pill */}
          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase bg-glint-violet/15 dark:bg-glint-violet/20 text-glint-violet dark:text-glint-cyan border border-glint-violet/30 dark:border-glint-violet/40">
            {item.category}
          </span>

          {/* Local Database / Learned Badge */}
          {isLearned ? (
            <span className="inline-flex items-center gap-1 text-[9px] font-bold text-emerald-600 dark:text-glint-lime bg-emerald-50 dark:bg-glint-lime/10 px-1.5 py-0.5 rounded-md border border-emerald-200 dark:border-glint-lime/30">
              <Database className="w-2.5 h-2.5 text-emerald-500 dark:text-glint-lime" />
              Learned Local
            </span>
          ) : (
            <span className="inline-flex items-center gap-1 text-[9px] font-bold text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-glint-space/60 px-1.5 py-0.5 rounded-md border border-slate-200 dark:border-glint-border/50">
              ⚡ Local DB
            </span>
          )}

          {/* Danger Level */}
          {item.dangerLevel === 'caution' && (
            <span className="text-[9px] font-bold text-amber-600 dark:text-glint-yellow bg-amber-50 dark:bg-glint-yellow/15 px-1.5 py-0.5 rounded-md border border-amber-200 dark:border-glint-yellow/30">
              🌶️ Caution
            </span>
          )}
          {item.dangerLevel === 'dangerous' && (
            <span className="text-[9px] font-bold text-rose-600 dark:text-glint-coral bg-rose-50 dark:bg-glint-coral/15 px-1.5 py-0.5 rounded-md border border-rose-200 dark:border-glint-coral/30">
              🚨 Destructive
            </span>
          )}
        </div>

        {/* On-Demand Variables Toggle */}
        {hasVariables && (
          <button
            onClick={() => setIsEditingVars(!isEditingVars)}
            className={`flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-full transition-all ${
              isEditingVars
                ? 'bg-glint-magenta text-white shadow-sm'
                : 'bg-glint-magenta/10 dark:bg-glint-magenta/15 text-glint-magenta hover:bg-glint-magenta/20 border border-glint-magenta/30'
            }`}
          >
            <Sliders className="w-2.5 h-2.5" />
            <span>{isEditingVars ? 'Hide parameters' : `${item.variables.length} parameters`}</span>
          </button>
        )}
      </div>

      {/* Description */}
      <p className="text-xs text-slate-700 dark:text-slate-200 font-medium leading-relaxed">
        {item.description}
      </p>

      {/* On-Demand Parameter Inputs Shelf */}
      {isEditingVars && hasVariables && (
        <div className="flex flex-col gap-2 p-2.5 rounded-xl bg-slate-50 dark:bg-glint-bubble/90 border border-slate-200 dark:border-glint-violet/40 animate-pop">
          <div className="flex items-center justify-between text-[10px] font-bold text-glint-violet dark:text-glint-cyan">
            <span className="flex items-center gap-1">
              <Sparkles className="w-3 h-3 text-glint-yellow" />
              Customize Parameters:
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {item.variables.map((variable) => (
              <div key={variable.name} className="flex flex-col gap-0.5">
                <label className="text-[10px] font-bold text-slate-600 dark:text-slate-300 flex items-center justify-between">
                  <span>{variable.label}</span>
                  <span className="text-[9px] text-slate-400 font-mono">
                    {`{{${variable.name}}}`}
                  </span>
                </label>
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
                  className="px-2 py-1 text-xs rounded-lg bg-white dark:bg-glint-space/90 border border-slate-300 dark:border-glint-border focus:border-glint-violet dark:focus:border-glint-lime text-slate-900 dark:text-white placeholder-slate-400 outline-none transition-all"
                />
              </div>
            ))}
          </div>
        </div>
      )}

      {/* High-Contrast Command Preview Box + Copy Action */}
      <div className="relative flex items-center justify-between gap-2 p-2 rounded-xl bg-slate-950 border border-slate-800 transition-colors">
        <code className="text-xs font-mono text-glint-lime font-bold tracking-tight select-text overflow-x-auto whitespace-pre pr-2">
          {finalCommand}
        </code>

        <button
          onClick={handleCopy}
          className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-extrabold transition-all duration-150 flex-shrink-0 ${
            copied
              ? 'bg-glint-lime text-glint-space shadow-md'
              : 'bg-glint-violet text-white hover:bg-glint-violet/90 active:scale-95'
          }`}
          title="Copy command to clipboard"
        >
          {copied ? (
            <>
              <Check className="w-3.5 h-3.5 stroke-[3]" />
              <span className="text-[10px]">Copied</span>
            </>
          ) : (
            <>
              <Copy className="w-3.5 h-3.5" />
              <span className="text-[10px]">Copy</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
};
