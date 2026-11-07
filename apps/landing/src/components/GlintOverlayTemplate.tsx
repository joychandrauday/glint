import React, { useState } from 'react';
import {
  DotsSixVertical,
  Key,
  User,
  Plus,
  ClockCounterClockwise,
  Sun,
  Moon,
  ArrowCounterClockwise,
  Minus,
  X,
  PaperPlaneRight,
  Copy,
  Check,
  FirstAid,
  Lightning,
  Clock,
  BookBookmark,
  Sparkle,
} from '@phosphor-icons/react';
import { BrandSpark } from './BrandSpark';

interface CommandScenario {
  prompt: string;
  command: string;
  template: string;
  description: string;
  dangerLevel: 'safe' | 'caution';
  variables: { name: string; defaultValue: string; label: string }[];
}

const DEMO_SCENARIOS: Record<string, CommandScenario> = {
  port: {
    prompt: 'Kill process on port 3000',
    command: 'lsof -ti :3000 | xargs kill -9',
    template: 'lsof -ti :{{port}} | xargs kill -9',
    description: 'Finds process ID running on chosen TCP port and terminates it immediately.',
    dangerLevel: 'safe',
    variables: [{ name: 'port', defaultValue: '3000', label: 'Port number' }],
  },
  docker: {
    prompt: 'Prune unused docker volumes and images',
    command: 'docker system prune -a --volumes',
    template: 'docker system prune -a --volumes',
    description: 'Removes all stopped containers, unused networks, and dangling volumes in one pass.',
    dangerLevel: 'caution',
    variables: [],
  },
  largefiles: {
    prompt: 'Find files larger than 100MB in current folder',
    command: 'find . -type f -size +100M -exec ls -lh {} +',
    template: 'find . -type f -size +{{size}}M -exec ls -lh {} +',
    description: 'Scans directory recursively and lists all files exceeding your size threshold.',
    dangerLevel: 'safe',
    variables: [{ name: 'size', defaultValue: '100', label: 'File size in MB' }],
  },
  git: {
    prompt: 'Undo last git commit and keep local changes',
    command: 'git reset --soft HEAD~1',
    template: 'git reset --soft HEAD~{{commits}}',
    description: 'Rolls back commit history while preserving every file edit in your working directory.',
    dangerLevel: 'safe',
    variables: [{ name: 'commits', defaultValue: '1', label: 'Commit count' }],
  },
};

export const GlintOverlayTemplate: React.FC = () => {
  const [selectedKey, setSelectedKey] = useState<string>('port');
  const [variableValues, setVariableValues] = useState<Record<string, string>>({
    port: '3000',
    size: '100',
    commits: '1',
  });
  const [customInput, setCustomInput] = useState<string>('');
  const [isCopied, setIsCopied] = useState<boolean>(false);
  const [isDarkTheme, setIsDarkTheme] = useState<boolean>(true);
  const [isThinking, setIsThinking] = useState<boolean>(false);

  const activeScenario = DEMO_SCENARIOS[selectedKey] || DEMO_SCENARIOS.port;

  const handleSelectScenario = (key: string) => {
    setIsThinking(true);
    setTimeout(() => {
      setSelectedKey(key);
      setIsThinking(false);
    }, 280);
  };

  const handleVariableChange = (name: string, value: string) => {
    setVariableValues((prev) => ({ ...prev, [name]: value }));
  };

  const getComputedCommand = () => {
    let cmd = activeScenario.template;
    for (const variable of activeScenario.variables) {
      const val = variableValues[variable.name] || variable.defaultValue;
      cmd = cmd.replace(new RegExp(`{{${variable.name}}}`, 'g'), val);
    }
    return cmd;
  };

  const handleCopyCommand = () => {
    const text = getComputedCommand();
    navigator.clipboard?.writeText(text);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  };

  const handleCustomSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customInput.trim()) return;
    const lower = customInput.toLowerCase();
    if (lower.includes('docker')) {
      handleSelectScenario('docker');
    } else if (lower.includes('file') || lower.includes('size')) {
      handleSelectScenario('largefiles');
    } else if (lower.includes('git') || lower.includes('commit')) {
      handleSelectScenario('git');
    } else {
      handleSelectScenario('port');
    }
    setCustomInput('');
  };

  return (
    <div className="w-full max-w-4xl mx-auto">
      {/* Simulated Developer IDE Window Backdrop */}
      <div className="relative rounded-3xl border border-[#261C63] bg-[#070418] shadow-2xl overflow-hidden text-left">
        {/* Editor Window Title Bar */}
        <div className="flex items-center justify-between px-4 py-3 bg-[#0D082B] border-b border-[#261C63]/80 select-none">
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-rose-500/80 inline-block" />
            <span className="w-3 h-3 rounded-full bg-amber-500/80 inline-block" />
            <span className="w-3 h-3 rounded-full bg-emerald-500/80 inline-block" />
            <span className="ml-3 text-xs font-mono text-slate-300 flex items-center gap-2">
              <span className="text-[#0DE4F3] font-semibold">api-server.ts</span>
              <span className="text-slate-600">—</span>
              <span className="text-slate-400">Your Active Editor</span>
            </span>
          </div>

          <div className="hidden sm:flex items-center gap-2 text-xs font-mono text-slate-400">
            <span className="text-slate-500">Global Trigger:</span>
            <span className="px-2 py-0.5 rounded-md bg-[#160E45] border border-[#3A2A9F] text-[#BDFB03] font-semibold flex items-center gap-1 shadow-inner">
              <span>Ctrl + Space</span>
            </span>
          </div>
        </div>

        {/* Editor Canvas Area */}
        <div className="relative p-4 sm:p-8 min-h-[520px] flex items-center justify-center overflow-hidden">
          {/* Dimmed background code lines showing real context */}
          <div
            aria-hidden="true"
            className="absolute inset-0 p-6 sm:p-8 font-mono text-xs sm:text-sm text-slate-400/20 pointer-events-none select-none overflow-hidden leading-loose"
          >
            <div className="flex gap-4"><span className="text-slate-600 select-none w-6 text-right">01</span><span>import &#123; createServer &#125; from 'node:http';</span></div>
            <div className="flex gap-4"><span className="text-slate-600 select-none w-6 text-right">02</span><span>import &#123; GlintGateway &#125; from '@glint/gateway';</span></div>
            <div className="flex gap-4"><span className="text-slate-600 select-none w-6 text-right">03</span><span></span></div>
            <div className="flex gap-4"><span className="text-slate-600 select-none w-6 text-right">04</span><span className="text-purple-400">export async function</span> <span className="text-blue-400">startProductionServer</span>() &#123;</div>
            <div className="flex gap-4"><span className="text-slate-600 select-none w-6 text-right">05</span><span>  const port = process.env.PORT || 3000;</span></div>
            <div className="flex gap-4"><span className="text-slate-600 select-none w-6 text-right">06</span><span className="text-rose-400/80">  // Error: listen EADDRINUSE: address already in use :::3000</span></div>
            <div className="flex gap-4"><span className="text-slate-600 select-none w-6 text-right">07</span><span className="text-[#BDFB03]/60">  // Press Ctrl+Space — Summoned Glint without leaving editor:</span></div>
            <div className="flex gap-4"><span className="text-slate-600 select-none w-6 text-right">08</span><span>  await app.listen(port);</span></div>
            <div className="flex gap-4"><span className="text-slate-600 select-none w-6 text-right">09</span><span>  console.log(`Ready on port $&#123;port&#125;`);</span></div>
            <div className="flex gap-4"><span className="text-slate-600 select-none w-6 text-right">10</span><span>&#125;</span></div>
          </div>

          {/* Outer Glow Halo with Glint Violet & Lime */}
          <div className="relative group w-full max-w-2xl z-10">
            <div
              aria-hidden="true"
              className="absolute -inset-1 rounded-3xl bg-gradient-to-r from-[#7D23D9]/40 via-[#0DE4F3]/30 to-[#BDFB03]/35 blur-xl opacity-80 group-hover:opacity-100 transition duration-500"
            />

            {/* Desktop Overlay Container */}
            <div className="relative flex flex-col rounded-2xl border border-[#261C63] bg-[#0B0726]/95 backdrop-blur-2xl shadow-2xl overflow-hidden select-none transition-colors">
          {/* Top Messenger Bar (Draggable layout exact replica) */}
          <div className="flex items-center justify-between px-3.5 py-2.5 border-b border-[#261C63] bg-[#110939]/90 flex-shrink-0">
            <div className="flex items-center gap-2.5">
              <DotsSixVertical
                size={16}
                weight="bold"
                className="text-slate-400 hover:text-white transition-colors cursor-grab"
              />
              <div className="flex items-center justify-center cursor-pointer hover:scale-105 active:scale-95 transition-transform">
                <BrandSpark size="md" className="w-7 h-7" animate={isThinking} />
              </div>

              <div className="flex flex-col">
                <div className="flex items-center gap-1.5">
                  <span className="text-sm font-bold tracking-tight text-white font-sans">
                    Glint
                  </span>
                  <span className="w-2 h-2 rounded-full bg-[#BDFB03] animate-pulse" />
                  <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded bg-[#7D23D9]/25 text-[#0DE4F3] border border-[#7D23D9]/40 font-mono">
                    PRO
                  </span>
                </div>
                <span className="text-[10px] text-slate-400 truncate max-w-[170px] font-mono">
                  {isThinking ? 'Searching offline database...' : '240 offline commands ready'}
                </span>
              </div>
            </div>

            {/* Action Controls Replica */}
            <div className="flex items-center gap-1 text-slate-400">
              <button
                type="button"
                className="p-1.5 rounded-lg text-[#0DE4F3] bg-[#0DE4F3]/10 border border-[#0DE4F3]/25 transition-all"
                title="AI Provider Settings"
              >
                <Key size={14} weight="bold" />
              </button>
              <button
                type="button"
                className="p-1.5 rounded-lg hover:bg-[#160E45] hover:text-white transition-colors"
                title="Account Profile"
              >
                <User size={14} weight="bold" />
              </button>
              <button
                type="button"
                onClick={() => handleSelectScenario('port')}
                className="p-1.5 rounded-lg hover:bg-[#160E45] hover:text-white transition-colors"
                title="New Chat Session"
              >
                <Plus size={14} weight="bold" />
              </button>
              <button
                type="button"
                className="p-1.5 rounded-lg hover:bg-[#160E45] hover:text-white transition-colors"
                title="Chat History"
              >
                <ClockCounterClockwise size={14} weight="bold" />
              </button>
              <button
                type="button"
                onClick={() => setIsDarkTheme(!isDarkTheme)}
                className="p-1.5 rounded-lg hover:bg-[#160E45] hover:text-white transition-colors"
                title="Toggle Theme"
              >
                {isDarkTheme ? (
                  <Sun size={14} weight="bold" className="text-[#FED02A]" />
                ) : (
                  <Moon size={14} weight="bold" />
                )}
              </button>
              <button
                type="button"
                onClick={() => handleSelectScenario('port')}
                className="p-1.5 rounded-lg hover:bg-[#160E45] hover:text-white transition-colors"
                title="Reset Chat"
              >
                <ArrowCounterClockwise size={14} weight="bold" />
              </button>
              <button
                type="button"
                className="p-1.5 rounded-lg hover:bg-[#160E45] hover:text-white transition-colors"
                title="Minimize to Floating Icon"
              >
                <Minus size={14} weight="bold" />
              </button>
              <button
                type="button"
                className="p-1.5 rounded-lg hover:bg-rose-500/20 hover:text-rose-400 transition-colors"
                title="Close"
              >
                <X size={14} weight="bold" />
              </button>
            </div>
          </div>

          {/* Chat Stream Body */}
          <div className="p-4 flex flex-col gap-3 min-h-[380px] max-h-[520px] overflow-y-auto">
            {/* Glint Welcome Greeting Bubble */}
            <div className="flex flex-col gap-1 max-w-[92%] self-start items-start">
              <div className="flex items-center gap-1.5 px-1 text-[10px] text-slate-400 font-mono">
                <BrandSpark size="xs" />
                <span className="font-semibold text-slate-200">Glint</span>
                <span>•</span>
                <span>Just now</span>
              </div>
              <div className="p-3 rounded-xl bg-[#110939] border border-[#261C63] text-slate-200 text-xs leading-relaxed shadow-sm">
                Hey developer. What command or system task are we working on today?
              </div>
            </div>

            {/* Quick Interactive Scenario Starter Chips */}
            <div className="flex flex-wrap gap-1.5 pl-1">
              {Object.entries(DEMO_SCENARIOS).map(([key, item]) => {
                const isSelected = selectedKey === key;
                return (
                  <button
                    key={key}
                    type="button"
                    onClick={() => handleSelectScenario(key)}
                    className={`text-left text-[11px] px-2.5 py-1.5 rounded-lg border transition-all flex items-center gap-1.5 cursor-pointer ${
                      isSelected
                        ? 'bg-[#7D23D9]/30 border-[#7D23D9] text-white shadow-xs'
                        : 'bg-[#110939]/70 hover:bg-[#160E45] border-[#261C63] text-slate-300 hover:text-white'
                    }`}
                  >
                    <span>&ldquo;{item.prompt}&rdquo;</span>
                    <Sparkle size={12} weight="fill" className={isSelected ? 'text-[#BDFB03]' : 'text-slate-500'} />
                  </button>
                );
              })}
            </div>

            {/* Active User Message Bubble */}
            <div className="flex flex-col gap-1 max-w-[85%] self-end items-end mt-1">
              <div className="flex items-center gap-1.5 px-1 text-[10px] text-slate-400 font-mono">
                <span className="font-semibold text-slate-300">You</span>
                <span>•</span>
                <span>Just now</span>
              </div>
              <div className="p-3 rounded-xl bg-[#7D23D9] text-white text-xs leading-relaxed font-sans shadow-md">
                {activeScenario.prompt}
              </div>
            </div>

            {/* Glint AI Response & Embedded Command Card */}
            <div className="flex flex-col gap-1.5 max-w-[95%] self-start items-start w-full mt-1">
              <div className="flex items-center gap-1.5 px-1 text-[10px] text-slate-400 font-mono">
                <BrandSpark size="xs" />
                <span className="font-semibold text-slate-200">Glint</span>
                <span>•</span>
                <span className="text-[#0DE4F3]">Verified Local Syntax</span>
              </div>

              {/* Command Card Container */}
              <div className="w-full rounded-xl border border-[#261C63] bg-[#110939] p-3.5 flex flex-col gap-2.5 shadow-md">
                {/* Header with Risk Pill and Description */}
                <div className="flex items-center justify-between">
                  <span className="text-xs text-slate-300 font-medium">
                    {activeScenario.description}
                  </span>
                  <span
                    className={`text-[9px] font-mono uppercase px-2 py-0.5 rounded-full border ${
                      activeScenario.dangerLevel === 'safe'
                        ? 'bg-[#BDFB03]/10 text-[#BDFB03] border-[#BDFB03]/30'
                        : 'bg-[#FED02A]/10 text-[#FED02A] border-[#FED02A]/30'
                    }`}
                  >
                    {activeScenario.dangerLevel === 'safe' ? 'Safe to run' : 'Caution'}
                  </span>
                </div>

                {/* Live Command Syntax Block */}
                <div className="relative flex items-center justify-between bg-[#0B0726] border border-[#261C63] rounded-lg px-3 py-2.5 font-mono text-xs text-slate-100 overflow-x-auto">
                  <div className="flex items-center gap-2">
                    <span className="text-[#BDFB03] font-bold select-none">$</span>
                    <span className="text-slate-100">{getComputedCommand()}</span>
                  </div>
                  <button
                    type="button"
                    onClick={handleCopyCommand}
                    className="p-1.5 rounded-md bg-[#160E45] hover:bg-[#261C63] text-slate-300 hover:text-white border border-[#261C63] transition-colors ml-2 flex-shrink-0 cursor-pointer"
                    title="Copy command to clipboard"
                  >
                    {isCopied ? (
                      <Check size={14} weight="bold" className="text-[#BDFB03]" />
                    ) : (
                      <Copy size={14} weight="bold" />
                    )}
                  </button>
                </div>

                {/* Live Variables Customizer */}
                {activeScenario.variables.length > 0 && (
                  <div className="flex flex-wrap items-center gap-2 pt-1 border-t border-[#261C63]/60">
                    <span className="text-[10px] text-slate-400 font-mono">Live variables:</span>
                    {activeScenario.variables.map((variable) => (
                      <div
                        key={variable.name}
                        className="flex items-center gap-1.5 bg-[#0B0726] border border-[#261C63] rounded-md px-2 py-1 text-[11px]"
                      >
                        <span className="text-[#0DE4F3] font-mono">{variable.label}:</span>
                        <input
                          type="text"
                          value={variableValues[variable.name] ?? variable.defaultValue}
                          onChange={(e) => handleVariableChange(variable.name, e.target.value)}
                          className="w-16 bg-[#160E45] text-white px-1.5 py-0.5 rounded border border-[#261C63] text-xs font-mono focus:outline-none focus:border-[#0DE4F3]"
                        />
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Bottom Conversational Input & Micro Tools Pills */}
          <div className="p-3 border-t border-[#261C63] bg-[#110939]/95 flex flex-col gap-2">
            {/* Quick Developer Action Pills */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-0.5 select-none text-[10px]">
              <button
                type="button"
                onClick={() => handleSelectScenario('port')}
                className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-[#160E45] hover:bg-[#261C63] text-slate-200 border border-[#261C63] transition-all font-medium cursor-pointer whitespace-nowrap active:scale-95 font-sans"
              >
                <FirstAid size={13} weight="bold" className="text-[#F57265]" />
                <span>Fix Error</span>
              </button>

              <button
                type="button"
                onClick={() => handleSelectScenario('git')}
                className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-[#160E45] hover:bg-[#261C63] text-slate-200 border border-[#261C63] transition-all font-medium cursor-pointer whitespace-nowrap active:scale-95 font-sans"
              >
                <Lightning size={13} weight="fill" className="text-[#0DE4F3]" />
                <span>Regex Tester</span>
              </button>

              <button
                type="button"
                onClick={() => handleSelectScenario('docker')}
                className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-[#160E45] hover:bg-[#261C63] text-slate-200 border border-[#261C63] transition-all font-medium cursor-pointer whitespace-nowrap active:scale-95 font-sans"
              >
                <Clock size={13} weight="bold" className="text-[#FED02A]" />
                <span>Cron</span>
              </button>

              <button
                type="button"
                onClick={() => handleSelectScenario('largefiles')}
                className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-[#160E45] hover:bg-[#261C63] text-slate-200 border border-[#261C63] transition-all font-medium cursor-pointer whitespace-nowrap active:scale-95 font-sans"
              >
                <BookBookmark size={13} weight="bold" className="text-[#BDFB03]" />
                <span>Runbook</span>
              </button>
            </div>

            {/* Conversational Input Bar */}
            <form
              onSubmit={handleCustomSubmit}
              className="relative flex items-center bg-[#0B0726] border border-[#261C63] rounded-xl px-3 py-1.5 focus-within:border-[#7D23D9] focus-within:ring-1 focus-within:ring-[#7D23D9] transition-all"
            >
              <input
                type="text"
                value={customInput}
                onChange={(e) => setCustomInput(e.target.value)}
                placeholder="Ask Glint a command or question (e.g. 'kill port 3000')..."
                className="w-full bg-transparent text-xs text-white placeholder-slate-500 focus:outline-none font-sans pr-8"
              />
              <button
                type="submit"
                className="p-1.5 rounded-lg bg-[#7D23D9] text-white hover:bg-[#7D23D9]/80 transition-all flex-shrink-0 cursor-pointer"
                title="Send query"
              >
                <PaperPlaneRight size={14} weight="bold" />
              </button>
            </form>

            {/* Keyboard Ergonomics Footer */}
            <div className="flex items-center justify-between px-1 text-[9px] text-slate-400 font-mono select-none">
              <span>Ctrl+Space: toggle overlay</span>
              <span>Enter: execute search</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</div>
  );
};
