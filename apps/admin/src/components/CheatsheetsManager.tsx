import React, { useState } from 'react';
import { Plus, Search, Terminal, Sliders, Check, Flame, ShieldCheck, AlertTriangle } from 'lucide-react';
import { CheatsheetItem, extractVariablesFromTemplate } from '@glint/shared';

interface CheatsheetsManagerProps {
  cheatsheets: CheatsheetItem[];
  onAddCheatsheet: (item: CheatsheetItem) => void;
}

export const CheatsheetsManager: React.FC<CheatsheetsManagerProps> = ({
  cheatsheets,
  onAddCheatsheet,
}) => {
  const [search, setSearch] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);

  // New item form state
  const [cmd, setCmd] = useState('');
  const [template, setTemplate] = useState('');
  const [desc, setDesc] = useState('');
  const [category, setCategory] = useState('linux');
  const [danger, setDanger] = useState<'safe' | 'caution' | 'dangerous'>('safe');
  const [tagsInput, setTagsInput] = useState('');

  const filtered = cheatsheets.filter(
    (c) =>
      c.command.toLowerCase().includes(search.toLowerCase()) ||
      c.description.toLowerCase().includes(search.toLowerCase()) ||
      c.category.toLowerCase().includes(search.toLowerCase())
  );

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!cmd || !desc) return;

    const tpl = template.trim() || cmd;
    const variables = extractVariablesFromTemplate(tpl);
    const tags = tagsInput
      .split(',')
      .map((t) => t.trim().toLowerCase())
      .filter(Boolean);

    const newItem: CheatsheetItem = {
      id: `custom-${Date.now()}`,
      command: cmd,
      template: tpl,
      description: desc,
      category,
      dangerLevel: danger,
      tags,
      variables,
      platform: 'all',
      isPopular: false,
    };

    onAddCheatsheet(newItem);
    setShowAddModal(false);
    setCmd('');
    setTemplate('');
    setDesc('');
    setTagsInput('');
  };

  return (
    <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-5 backdrop-blur-sm flex flex-col gap-4">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-slate-800/80 pb-4">
        <div>
          <h3 className="text-sm font-semibold text-white">Cheatsheets Library ({cheatsheets.length})</h3>
          <p className="text-xs text-slate-400">Offline database synced to all desktop overlay clients</p>
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <div className="relative flex-1 sm:w-64">
            <Search className="absolute left-2.5 top-2.5 w-3.5 h-3.5 text-slate-500" />
            <input
              type="text"
              placeholder="Search cheatsheets..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-lg pl-8 pr-3 py-1.5 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-cyan-500"
            />
          </div>

          <button
            onClick={() => setShowAddModal(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-medium transition-colors"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Command</span>
          </button>
        </div>
      </div>

      {/* Grid of Cheatsheets */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-[460px] overflow-y-auto pr-1">
        {filtered.map((item) => (
          <div
            key={item.id}
            className="rounded-lg border border-slate-800 bg-slate-950/70 p-3 flex flex-col justify-between gap-2"
          >
            <div>
              <div className="flex items-center justify-between text-xs mb-1.5">
                <span className="px-1.5 py-0.5 rounded text-[10px] font-mono uppercase bg-slate-800 text-cyan-400">
                  {item.category}
                </span>
                <span
                  className={`text-[10px] font-mono px-1.5 py-0.2 rounded border ${
                    item.dangerLevel === 'dangerous'
                      ? 'bg-rose-500/10 border-rose-500/30 text-rose-400'
                      : item.dangerLevel === 'caution'
                      ? 'bg-amber-500/10 border-amber-500/30 text-amber-400'
                      : 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400'
                  }`}
                >
                  {item.dangerLevel}
                </span>
              </div>
              <p className="text-xs text-slate-300 font-medium">{item.description}</p>
            </div>

            <div className="rounded bg-slate-900 border border-slate-800/80 px-2 py-1.5 font-mono text-[11px] text-cyan-300 overflow-x-auto whitespace-pre">
              {item.template}
            </div>

            {item.variables && item.variables.length > 0 && (
              <div className="flex items-center gap-1.5 text-[10px] text-slate-400 font-mono">
                <Sliders className="w-2.5 h-2.5 text-cyan-400" />
                <span>Vars: {item.variables.map((v) => v.name).join(', ')}</span>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Add Command Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="relative w-full max-w-md rounded-xl border border-slate-700 bg-slate-900 p-5 text-slate-100 flex flex-col gap-4">
            <h3 className="text-sm font-semibold text-white">Add New Cheatsheet Command</h3>

            <form onSubmit={handleCreate} className="flex flex-col gap-3 text-xs">
              <div>
                <label className="text-slate-300 font-medium">Description</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Follow container logs with tail limit"
                  value={desc}
                  onChange={(e) => setDesc(e.target.value)}
                  className="w-full mt-1 bg-slate-950 border border-slate-700 rounded-lg p-2 text-white"
                />
              </div>

              <div>
                <label className="text-slate-300 font-medium">Command Template (with variables)</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. docker logs -f --tail {{lines:100}} {{container_id}}"
                  value={template}
                  onChange={(e) => {
                    setTemplate(e.target.value);
                    if (!cmd) setCmd(e.target.value);
                  }}
                  className="w-full mt-1 bg-slate-950 border border-slate-700 rounded-lg p-2 font-mono text-cyan-300"
                />
                <span className="text-[10px] text-slate-500 mt-0.5 block">
                  Use <code className="text-cyan-400">{"{{varName:defaultValue}}"}</code> for interactive inputs.
                </span>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-slate-300 font-medium">Category</label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full mt-1 bg-slate-950 border border-slate-700 rounded-lg p-2 text-white"
                  >
                    <option value="linux">Linux</option>
                    <option value="docker">Docker</option>
                    <option value="git">Git</option>
                    <option value="k8s">Kubernetes</option>
                    <option value="networking">Networking</option>
                  </select>
                </div>

                <div>
                  <label className="text-slate-300 font-medium">Danger Level</label>
                  <select
                    value={danger}
                    onChange={(e) => setDanger(e.target.value as any)}
                    className="w-full mt-1 bg-slate-950 border border-slate-700 rounded-lg p-2 text-white"
                  >
                    <option value="safe">Safe</option>
                    <option value="caution">Caution</option>
                    <option value="dangerous">Dangerous</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-slate-300 font-medium">Tags (comma-separated)</label>
                <input
                  type="text"
                  placeholder="docker, logs, debug"
                  value={tagsInput}
                  onChange={(e) => setTagsInput(e.target.value)}
                  className="w-full mt-1 bg-slate-950 border border-slate-700 rounded-lg p-2 text-white"
                />
              </div>

              <div className="flex items-center justify-end gap-2 mt-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-3 py-1.5 rounded-lg border border-slate-700 text-slate-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white font-medium"
                >
                  Save Command
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
