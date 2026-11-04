import React, { useState } from 'react';
import { Search, Copy, Check, Sparkles, Sliders, FolderTree } from 'lucide-react';
import { DEFAULT_CHEATSHEETS } from '@glint/db';
import { substituteTemplateVariables } from '@glint/shared';

export const InteractiveWidgetDemo: React.FC = () => {
  const [isOpen, setIsOpen] = useState(true);
  const [query, setQuery] = useState('');
  const [selectedCat, setSelectedCat] = useState('all');
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Variable values per command id
  const [varValues, setVarValues] = useState<Record<string, Record<string, string>>>({
    'docker-run-port': { host_port: '8080', container_port: '80', container_name: 'my-app', image: 'nginx:latest' },
    'linux-find-kill-port': { port: '3000' },
    'git-undo-last-commit': { commits: '1' },
    'linux-tar-extract': { archive_file: 'archive.tar.gz', destination_dir: './extracted' },
  });

  const filtered = DEFAULT_CHEATSHEETS.filter((item) => {
    const matchesCat = selectedCat === 'all' || item.category === selectedCat;
    const matchesQuery =
      !query ||
      item.command.toLowerCase().includes(query.toLowerCase()) ||
      item.description.toLowerCase().includes(query.toLowerCase()) ||
      item.category.toLowerCase().includes(query.toLowerCase());
    return matchesCat && matchesQuery;
  }).slice(0, 3);

  const handleCopy = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div className="relative w-full max-w-lg mx-auto flex flex-col items-center">
      {/* Floating Demo Trigger Bubble */}
      <div className="flex items-center justify-between w-full mb-3 px-2">
        <span className="text-xs font-bold text-candy-pinkLight flex items-center gap-1.5">
          <Sparkles className="w-3.5 h-3.5 text-candy-honey" />
          Interactive Live Simulator (Try typing below!)
        </span>
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="text-xs font-bold px-3 py-1 rounded-full bg-candy-violet/20 hover:bg-candy-violet/30 text-candy-violetLight border border-candy-violet/40 transition-all hover:scale-105 active:scale-95"
        >
          {isOpen ? 'Minimize Widget' : 'Open Glint Bubble'}
        </button>
      </div>

      {isOpen ? (
        <div className="w-full rounded-3xl border-2 border-candy-violet/50 bg-[#121526]/95 backdrop-blur-2xl shadow-[0_15px_60px_rgba(139,92,246,0.35)] overflow-hidden flex flex-col transition-all">
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-glint-border bg-gradient-to-r from-glint-card to-glint-bubble">
            <div className="flex items-center gap-2.5">
              <div className="w-7 h-7 rounded-2xl bg-gradient-to-tr from-candy-cyan via-candy-violet to-candy-pink flex items-center justify-center text-xs font-black shadow-sm">
                ⚡
              </div>
              <div>
                <span className="text-xs font-black text-white block">Glint Overlay</span>
                <span className="text-[10px] text-candy-mintLight font-semibold">● 100% Offline Ready</span>
              </div>
            </div>
            <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-candy-violet/20 text-candy-violetLight border border-candy-violet/40">
              Hotkey: Alt + Space
            </span>
          </div>

          {/* Search Bar */}
          <div className="p-3.5 flex flex-col gap-2.5">
            <div className="relative flex items-center">
              <Search className="absolute left-3 w-4 h-4 text-candy-violetLight" />
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Type 'docker', 'port', 'git', 'tar'..."
                className="w-full bg-[#0A0D18] border-2 border-glint-border focus:border-candy-violet rounded-2xl pl-9 pr-3 py-2 text-xs text-white placeholder-slate-400 focus:outline-none transition-all shadow-inner"
              />
              {query && (
                <button
                  onClick={() => setQuery('')}
                  className="absolute right-3 text-xs text-slate-400 hover:text-white"
                >
                  ✕
                </button>
              )}
            </div>

            {/* Category Pills */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs">
              {[
                { id: 'all', label: '🌟 All' },
                { id: 'docker', label: '🐳 Docker' },
                { id: 'git', label: '🌿 Git' },
                { id: 'linux', label: '🐧 Linux' },
              ].map((c) => (
                <button
                  key={c.id}
                  onClick={() => setSelectedCat(c.id)}
                  className={`px-3 py-1 rounded-full text-[11px] font-bold transition-all ${
                    selectedCat === c.id
                      ? 'bg-candy-violet text-white shadow-md'
                      : 'bg-[#181D33] text-slate-300 hover:bg-[#202744] border border-glint-border'
                  }`}
                >
                  {c.label}
                </button>
              ))}
            </div>

            {/* Command Cards */}
            <div className="flex flex-col gap-2.5 max-h-[310px] overflow-y-auto pr-1">
              {filtered.map((item) => {
                const currentVals = varValues[item.id] || {};
                const finalCommand = substituteTemplateVariables(item.template, currentVals);

                return (
                  <div
                    key={item.id}
                    className="rounded-2xl border border-glint-border bg-gradient-to-b from-glint-card to-glint-base p-3 flex flex-col gap-2"
                  >
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-[10px] font-bold uppercase tracking-wide px-2 py-0.5 rounded-full bg-candy-violet/15 text-candy-violetLight border border-candy-violet/30">
                        {item.category}
                      </span>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-candy-mint/15 text-candy-mintLight border border-candy-mint/30">
                        🛡️ Safe & Sound
                      </span>
                    </div>

                    <p className="text-xs text-slate-200 font-medium">{item.description}</p>

                    {/* Interactive Variable Tuning */}
                    {item.variables && item.variables.length > 0 && (
                      <div className="flex flex-wrap items-center gap-1.5 bg-[#0D101D] p-2 rounded-xl border border-glint-border">
                        <span className="text-[10px] font-bold text-candy-pinkLight flex items-center gap-1">
                          <Sliders className="w-2.5 h-2.5" /> Tune:
                        </span>
                        {item.variables.map((v) => (
                          <div key={v.name} className="flex items-center gap-1">
                            <span className="text-[10px] text-slate-400">{v.name}:</span>
                            <input
                              type="text"
                              value={currentVals[v.name] ?? v.defaultValue ?? ''}
                              onChange={(e) => {
                                const val = e.target.value;
                                setVarValues((prev) => ({
                                  ...prev,
                                  [item.id]: {
                                    ...(prev[item.id] || {}),
                                    [v.name]: val,
                                  },
                                }));
                              }}
                              className="w-16 px-1.5 py-0.5 text-[10px] font-mono bg-[#161B30] border border-glint-border focus:border-candy-violet rounded-lg text-candy-cyan focus:outline-none"
                            />
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Final Code Preview & Copy */}
                    <div className="flex items-center justify-between rounded-xl bg-[#090C16] border border-glint-border/80 px-2.5 py-1.5 font-mono text-[11px]">
                      <span className="truncate text-slate-200 font-medium mr-2">
                        <span className="text-candy-pink font-bold mr-1.5">➜</span>
                        {finalCommand}
                      </span>
                      <button
                        onClick={() => handleCopy(item.id, finalCommand)}
                        className={`shrink-0 flex items-center gap-1 px-2.5 py-1 rounded-lg text-[10px] font-bold transition-all ${
                          copiedId === item.id
                            ? 'bg-candy-mint text-slate-950 font-extrabold'
                            : 'bg-gradient-to-r from-candy-violet to-candy-pink text-white hover:opacity-90'
                        }`}
                      >
                        {copiedId === item.id ? (
                          <>
                            <Check className="w-3 h-3 stroke-[3]" />
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
              })}
            </div>
          </div>
        </div>
      ) : (
        <div
          onClick={() => setIsOpen(true)}
          className="flex items-center gap-3 p-4 rounded-3xl bg-glint-card border-2 border-candy-violet/60 shadow-xl cursor-pointer hover:scale-105 active:scale-95 transition-all"
        >
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-candy-cyan via-candy-violet to-candy-pink flex items-center justify-center text-xl font-black animate-bounce shadow-md">
            ⚡
          </div>
          <div>
            <span className="text-sm font-bold text-white block">Click to open Glint Overlay</span>
            <span className="text-xs text-slate-400">Try testing the interactive command search</span>
          </div>
        </div>
      )}
    </div>
  );
};
