import React, { useState, useMemo } from 'react';
import { Copy, Check, Sliders, Sparkles, Heart } from 'lucide-react';
import { CheatsheetItem, substituteTemplateVariables } from '@glint/shared';

interface CommandCardProps {
  item: CheatsheetItem;
  onCopy?: (finalCommand: string) => void;
}

export const CommandCard: React.FC<CommandCardProps> = ({ item, onCopy }) => {
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
    // If running inside Electron desktop overlay, use desktop clipboard
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
    <div className="group relative rounded-2.5xl border border-glint-border bg-gradient-to-b from-glint-card/95 to-glint-base/90 hover:border-candy-violet/50 transition-all duration-200 p-3.5 flex flex-col gap-2.5 shadow-md hover:shadow-xl hover:shadow-candy-violet/10">
      {/* Top Header Row */}
      <div className="flex items-center justify-between gap-2 text-xs">
        <div className="flex items-center gap-1.5 flex-wrap">
          {/* Category Pill */}
          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold tracking-wide uppercase bg-candy-violet/15 text-candy-violetLight border border-candy-violet/30">
            {item.category}
          </span>

          {/* Playful Danger Level */}
          {item.dangerLevel === 'safe' && (
            <span className="inline-flex items-center gap-1 text-[10px] font-bold text-candy-mintLight bg-candy-mint/15 px-2 py-0.5 rounded-full border border-candy-mint/30">
              🛡️ Safe & Sound
            </span>
          )}
          {item.dangerLevel === 'caution' && (
            <span className="inline-flex items-center gap-1 text-[10px] font-bold text-candy-honeyLight bg-candy-honey/15 px-2 py-0.5 rounded-full border border-candy-honey/30">
              🌶️ A Bit Spicy
            </span>
          )}
          {item.dangerLevel === 'dangerous' && (
            <span className="inline-flex items-center gap-1 text-[10px] font-bold text-candy-coralLight bg-candy-coral/15 px-2 py-0.5 rounded-full border border-candy-coral/30 animate-pulse">
              🚨 Destructive
            </span>
          )}
        </div>

        {/* Variable Config Pill Button */}
        {hasVariables && (
          <button
            onClick={() => setIsEditingVars(!isEditingVars)}
            className={`flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-full transition-all ${
              isEditingVars
                ? 'bg-candy-pink text-white shadow-sm'
                : 'bg-candy-pink/15 text-candy-pinkLight hover:bg-candy-pink/25 border border-candy-pink/30'
            }`}
          >
            <Sliders className="w-2.5 h-2.5" />
            <span>{item.variables.length} vars</span>
          </button>
        )}
      </div>

      {/* Description */}
      <p className="text-xs text-slate-200 font-medium leading-relaxed">
        {item.description}
      </p>

      {/* Candy Variable Inputs Shelf */}
      {isEditingVars && hasVariables && (
        <div className="flex flex-col gap-2 p-2.5 rounded-2xl bg-glint-bubble/90 border border-candy-violet/30 animate-pop">
          <div className="flex items-center justify-between text-[10px] font-bold text-candy-pinkLight">
            <span className="flex items-center gap-1">
              <Sparkles className="w-3 h-3 text-candy-honey" />
              Tune Your Command Variables:
            </span>
          </div>

          <div className="grid grid-cols-2 gap-2">
            {item.variables.map((variable) => (
              <div key={variable.name} className="flex flex-col gap-0.5">
                <span className="text-[10px] font-semibold text-slate-300 truncate">
                  {variable.label || variable.name}
                </span>
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
                  className="w-full text-xs font-mono bg-glint-base border border-glint-border focus:border-candy-violet rounded-xl px-2 py-1 text-candy-cyan focus:outline-none transition-colors"
                />
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Command Code Speech Bubble */}
      <div className="relative flex items-center justify-between rounded-2xl bg-glint-base border border-glint-border/80 px-3 py-2 font-mono text-xs overflow-hidden">
        <div className="flex items-center gap-2 overflow-x-auto select-text scrollbar-none text-slate-100 font-medium">
          <span className="text-candy-pink select-none font-bold">➜</span>
          <span className="whitespace-pre">{finalCommand}</span>
        </div>

        <button
          onClick={handleCopy}
          className={`ml-2 shrink-0 flex items-center gap-1 px-2.5 py-1 rounded-xl text-xs font-bold transition-all transform active:scale-90 ${
            copied
              ? 'bg-candy-mint text-slate-950 candy-glow-mint'
              : 'bg-gradient-to-r from-candy-violet to-candy-pink text-white hover:opacity-95 shadow-md'
          }`}
          title="Copy command to clipboard"
        >
          {copied ? (
            <>
              <Check className="w-3.5 h-3.5 stroke-[3]" />
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
