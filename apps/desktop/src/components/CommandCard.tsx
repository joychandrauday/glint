import React, { useState, useMemo } from 'react';
import { Copy, Check, Terminal, AlertTriangle, ShieldCheck, Flame, Sliders } from 'lucide-react';
import { CheatsheetItem, substituteTemplateVariables } from '@glint/shared';

interface CommandCardProps {
  item: CheatsheetItem;
  onCopy?: (finalCommand: string) => void;
}

export const CommandCard: React.FC<CommandCardProps> = ({ item, onCopy }) => {
  const [copied, setCopied] = useState(false);
  const [showVariableEditor, setShowVariableEditor] = useState(false);

  // Initialize variable values from defaults
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
    navigator.clipboard.writeText(finalCommand);
    setCopied(true);
    onCopy?.(finalCommand);
    setTimeout(() => setCopied(false), 2000);
  };

  const hasVariables = item.variables && item.variables.length > 0;

  return (
    <div className="group relative rounded-lg border border-slate-800 bg-slate-900/80 hover:bg-slate-900 transition-all duration-150 p-3 flex flex-col gap-2 hover:border-slate-700">
      {/* Top Header: Category & Danger Badge */}
      <div className="flex items-center justify-between gap-2 text-xs">
        <div className="flex items-center gap-1.5">
          <span className="px-1.5 py-0.5 rounded text-[10px] font-medium uppercase tracking-wider bg-slate-800 text-slate-300 border border-slate-700/50">
            {item.category}
          </span>
          {item.dangerLevel === 'dangerous' && (
            <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-rose-400 bg-rose-500/10 px-1.5 py-0.5 rounded border border-rose-500/30">
              <Flame className="w-2.5 h-2.5" /> Dangerous
            </span>
          )}
          {item.dangerLevel === 'caution' && (
            <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-amber-400 bg-amber-500/10 px-1.5 py-0.5 rounded border border-amber-500/30">
              <AlertTriangle className="w-2.5 h-2.5" /> Caution
            </span>
          )}
          {item.dangerLevel === 'safe' && (
            <span className="inline-flex items-center gap-1 text-[10px] font-medium text-emerald-400 bg-emerald-500/10 px-1.5 py-0.5 rounded border border-emerald-500/20">
              <ShieldCheck className="w-2.5 h-2.5" /> Safe
            </span>
          )}
        </div>

        {hasVariables && (
          <button
            onClick={() => setShowVariableEditor(!showVariableEditor)}
            className="flex items-center gap-1 text-[10px] font-mono px-1.5 py-0.5 rounded text-cyan-400/90 hover:text-cyan-300 hover:bg-cyan-950/40 border border-cyan-900/40 transition-colors"
            title="Configure command variables"
          >
            <Sliders className="w-2.5 h-2.5" />
            <span>{Object.keys(variableValues).length} vars</span>
          </button>
        )}
      </div>

      {/* Description */}
      <p className="text-xs text-slate-300 font-normal line-clamp-2 leading-relaxed">
        {item.description}
      </p>

      {/* Live Variable Input Panel (if expanded) */}
      {showVariableEditor && hasVariables && (
        <div className="flex flex-col gap-1.5 bg-slate-950/90 p-2 rounded border border-slate-800/80 my-1">
          <div className="text-[10px] font-semibold uppercase text-slate-400 tracking-wider">
            Fill Command Variables:
          </div>
          <div className="grid grid-cols-2 gap-1.5">
            {item.variables.map((variable) => (
              <div key={variable.name} className="flex flex-col gap-0.5">
                <label className="text-[10px] text-slate-400 truncate">
                  {variable.label || variable.name}
                </label>
                <input
                  type="text"
                  value={variableValues[variable.name] ?? ''}
                  placeholder={variable.defaultValue || variable.name}
                  onChange={(e) =>
                    setVariableValues((prev) => ({
                      ...prev,
                      [variable.name]: e.target.value,
                    }))
                  }
                  className="w-full text-xs font-mono bg-slate-900 border border-slate-700 focus:border-cyan-500 rounded px-1.5 py-1 text-cyan-300 focus:outline-none"
                />
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Command Code Box with Copy Action */}
      <div className="relative group/code flex items-center justify-between rounded bg-slate-950/90 border border-slate-800 px-2.5 py-2 font-mono text-xs overflow-hidden">
        <div className="flex items-center gap-2 overflow-x-auto select-text scrollbar-none text-slate-200">
          <span className="text-cyan-400 select-none font-bold">$</span>
          <span className="whitespace-pre">{finalCommand}</span>
        </div>

        <button
          onClick={handleCopy}
          className={`ml-2 shrink-0 flex items-center gap-1 px-2 py-1 rounded text-[11px] font-sans font-medium transition-all ${
            copied
              ? 'bg-emerald-500 text-white'
              : 'bg-slate-800 text-slate-300 hover:bg-cyan-600 hover:text-white border border-slate-700'
          }`}
          title="Copy command to clipboard"
        >
          {copied ? (
            <>
              <Check className="w-3 h-3 text-white" />
              <span>Copied!</span>
            </>
          ) : (
            <>
              <Copy className="w-3 h-3" />
              <span>Copy</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
};
