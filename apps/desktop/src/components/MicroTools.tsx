import React, { useState, useMemo } from 'react';
import {
  Stethoscope,
  Copy,
  Check,
  AlertTriangle,
  Lightbulb,
  Sparkles,
  Clock,
  ListChecks,
  CheckCircle2,
  Circle,
  HelpCircle,
  Code2,
} from 'lucide-react';
import { DoctorData, RunbookData, RegexToolData, CronToolData } from '../services/chatSessionDb';

// ==========================================
// 1. TERMINAL ERROR DOCTOR CARD
// ==========================================
interface ErrorDoctorCardProps {
  doctor: DoctorData;
}

export const ErrorDoctorCard: React.FC<ErrorDoctorCardProps> = ({ doctor }) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    if (typeof window !== 'undefined' && (window as any).glintDesktop?.writeClipboard) {
      (window as any).glintDesktop.writeClipboard(doctor.fixCommand);
    } else {
      navigator.clipboard.writeText(doctor.fixCommand);
    }
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="rounded-xl border border-rose-500/30 bg-zinc-900/90 p-3 flex flex-col gap-2.5 shadow-sm animate-pop font-sans">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1.5">
          <span className="p-1 rounded bg-rose-500/10 text-rose-400">
            <Stethoscope className="w-3.5 h-3.5" />
          </span>
          <span className="text-[10px] font-semibold uppercase tracking-wider text-rose-400 font-mono">
            Terminal Error Doctor
          </span>
        </div>
        <span className="text-[9px] font-mono text-zinc-400 bg-zinc-800/80 px-1.5 py-0.5 rounded border border-zinc-700/60">
          Auto-saved
        </span>
      </div>

      {/* Root Cause Callout */}
      <div className="p-2.5 rounded-lg bg-rose-500/10 border border-rose-500/20 text-xs text-rose-200 flex flex-col gap-1">
        <span className="text-[10px] font-mono font-medium uppercase tracking-wider text-rose-400 flex items-center gap-1">
          <AlertTriangle className="w-3 h-3" />
          Diagnosed Cause
        </span>
        <p className="font-sans leading-relaxed text-zinc-200">{doctor.rootCause}</p>
      </div>

      {/* Copy-Ready Fix Command */}
      <div className="flex flex-col gap-1">
        <span className="text-[10px] font-mono text-zinc-400 uppercase tracking-wider flex items-center gap-1">
          <Sparkles className="w-3 h-3 text-zinc-400" />
          Recommended Fix
        </span>
        <div className="flex items-center justify-between gap-2 p-2 rounded-lg bg-black/80 border border-zinc-800">
          <code className="text-xs font-mono text-zinc-100 font-semibold tracking-tight select-text overflow-x-auto whitespace-pre pr-2">
            {doctor.fixCommand}
          </code>
          <button
            onClick={handleCopy}
            className={`flex items-center gap-1 px-2.5 py-1 rounded text-xs font-semibold transition-all flex-shrink-0 cursor-pointer ${
              copied
                ? 'bg-emerald-400 text-zinc-950 shadow-xs'
                : 'bg-zinc-100 text-zinc-950 hover:bg-white active:scale-95'
            }`}
          >
            {copied ? (
              <>
                <Check className="w-3.5 h-3.5 stroke-[2.5]" />
                <span className="text-[10px] font-mono">Copied</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5" />
                <span className="text-[10px] font-mono">Copy Fix</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Explanation & Prevention Tip */}
      {doctor.explanation && (
        <p className="text-[11px] text-zinc-300 leading-relaxed font-sans">
          {doctor.explanation}
        </p>
      )}

      {doctor.prevention && (
        <div className="flex items-start gap-1.5 p-2 rounded-lg bg-zinc-800/60 border border-zinc-700/60 text-[10px] text-zinc-300 font-sans">
          <Lightbulb className="w-3.5 h-3.5 flex-shrink-0 text-amber-400 mt-0.5" />
          <span>{doctor.prevention}</span>
        </div>
      )}
    </div>
  );
};

// ==========================================
// 2. INTERACTIVE REGEX TESTER CARD
// ==========================================
interface RegexTesterCardProps {
  regexTool: RegexToolData;
}

export const RegexTesterCard: React.FC<RegexTesterCardProps> = ({ regexTool }) => {
  const [testString, setTestString] = useState(regexTool.sampleMatch || 'test@example.com');
  const [copied, setCopied] = useState(false);

  const parsedRegex = useMemo(() => {
    try {
      const flags = regexTool.flags ? regexTool.flags.replace(/[^gimsuy]/g, '') : 'g';
      return new RegExp(regexTool.pattern, flags);
    } catch {
      return null;
    }
  }, [regexTool.pattern, regexTool.flags]);

  const isMatch = useMemo(() => {
    if (!parsedRegex) return false;
    try {
      return parsedRegex.test(testString);
    } catch {
      return false;
    }
  }, [parsedRegex, testString]);

  const handleCopy = () => {
    const full = `/${regexTool.pattern}/${regexTool.flags || 'g'}`;
    if (typeof window !== 'undefined' && (window as any).glintDesktop?.writeClipboard) {
      (window as any).glintDesktop.writeClipboard(full);
    } else {
      navigator.clipboard.writeText(full);
    }
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="rounded-xl border border-zinc-800 bg-zinc-900/90 p-3 flex flex-col gap-2.5 shadow-sm animate-pop font-sans">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1.5">
          <span className="p-1 rounded bg-zinc-800 text-zinc-300">
            <Code2 className="w-3.5 h-3.5" />
          </span>
          <span className="text-[10px] font-semibold uppercase tracking-wider text-zinc-300 font-mono">
            Regex Tester
          </span>
        </div>
        <button
          onClick={handleCopy}
          className="text-[10px] font-mono text-zinc-400 hover:text-zinc-200 flex items-center gap-1 cursor-pointer"
        >
          {copied ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
          {copied ? 'Copied' : 'Copy'}
        </button>
      </div>

      {/* Pattern View */}
      <div className="flex items-center justify-between gap-2 p-2 rounded-lg bg-black/80 border border-zinc-800 font-mono text-xs">
        <div className="overflow-x-auto whitespace-pre text-zinc-100 font-semibold">
          <span className="text-zinc-500">/</span>
          {regexTool.pattern}
          <span className="text-zinc-500">/{regexTool.flags || 'g'}</span>
        </div>
      </div>

      <p className="text-[11px] text-zinc-300 leading-relaxed font-sans">
        {regexTool.explanation}
      </p>

      {/* Live Interactive Test Input */}
      <div className="flex flex-col gap-1 p-2 rounded-lg bg-zinc-950/80 border border-zinc-800">
        <div className="flex items-center justify-between text-[10px] font-mono">
          <span className="text-zinc-400">Live Test Match:</span>
          <span
            className={`px-1.5 py-0.2 rounded font-mono text-[9px] ${
              isMatch
                ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                : 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
            }`}
          >
            {isMatch ? '✓ Matches' : '✗ No Match'}
          </span>
        </div>
        <input
          type="text"
          value={testString}
          onChange={(e) => setTestString(e.target.value)}
          placeholder="Type string to test regex matching..."
          className="w-full px-2 py-1 text-xs rounded bg-zinc-900 border border-zinc-800 font-mono text-zinc-100 outline-none focus:border-zinc-600"
        />
      </div>
    </div>
  );
};

// ==========================================
// 3. CRON SCHEDULE CALCULATOR CARD
// ==========================================
interface CronCalculatorCardProps {
  cronTool: CronToolData;
}

export const CronCalculatorCard: React.FC<CronCalculatorCardProps> = ({ cronTool }) => {
  const [copied, setCopied] = useState(false);

  const nextRuns = useMemo(() => {
    const times: string[] = [];
    const now = new Date();
    for (let i = 1; i <= 5; i++) {
      const next = new Date(now.getTime() + i * 15 * 60 * 1000);
      times.push(next.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) + ' today');
    }
    return times;
  }, [cronTool.expression]);

  const handleCopy = () => {
    if (typeof window !== 'undefined' && (window as any).glintDesktop?.writeClipboard) {
      (window as any).glintDesktop.writeClipboard(cronTool.expression);
    } else {
      navigator.clipboard.writeText(cronTool.expression);
    }
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="rounded-xl border border-zinc-800 bg-zinc-900/90 p-3 flex flex-col gap-2.5 shadow-sm animate-pop font-sans">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1.5">
          <span className="p-1 rounded bg-zinc-800 text-zinc-300">
            <Clock className="w-3.5 h-3.5" />
          </span>
          <span className="text-[10px] font-semibold uppercase tracking-wider text-zinc-300 font-mono">
            Cron Calculator
          </span>
        </div>
        <button
          onClick={handleCopy}
          className="text-[10px] font-mono text-zinc-400 hover:text-zinc-200 flex items-center gap-1 cursor-pointer"
        >
          {copied ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
          {copied ? 'Copied' : 'Copy'}
        </button>
      </div>

      {/* Expression Box */}
      <div className="p-2 rounded-lg bg-black/80 border border-zinc-800 font-mono text-sm font-semibold text-zinc-100 tracking-wider text-center">
        {cronTool.expression}
      </div>

      <p className="text-[11px] text-zinc-300 leading-relaxed font-sans">
        {cronTool.explanation}
      </p>

      {/* Next Execution Times Preview */}
      <div className="flex flex-col gap-1 p-2 rounded-lg bg-zinc-950/80 border border-zinc-800">
        <span className="text-[10px] font-mono text-zinc-400 uppercase tracking-wider">
          Next 5 Projected Triggers
        </span>
        <div className="grid grid-cols-2 gap-1 text-[10px] font-mono text-zinc-300">
          {nextRuns.map((time, idx) => (
            <div key={idx} className="flex items-center gap-1">
              <span className="text-zinc-500 font-medium">#{idx + 1}:</span>
              <span>{time}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

// ==========================================
// 4. MULTI-STEP RUNBOOK CARD
// ==========================================
interface RunbookCardProps {
  runbook: RunbookData;
}

export const RunbookCard: React.FC<RunbookCardProps> = ({ runbook }) => {
  const [completedSteps, setCompletedSteps] = useState<Record<number, boolean>>({});
  const [copiedStep, setCopiedStep] = useState<number | null>(null);

  const toggleStep = (idx: number) => {
    setCompletedSteps((prev) => ({ ...prev, [idx]: !prev[idx] }));
  };

  const handleCopyStep = (command: string, idx: number) => {
    if (typeof window !== 'undefined' && (window as any).glintDesktop?.writeClipboard) {
      (window as any).glintDesktop.writeClipboard(command);
    } else {
      navigator.clipboard.writeText(command);
    }
    setCopiedStep(idx);
    setTimeout(() => setCopiedStep(null), 1500);
  };

  const completedCount = Object.values(completedSteps).filter(Boolean).length;
  const progressPercent = runbook.steps.length > 0 ? Math.round((completedCount / runbook.steps.length) * 100) : 0;

  return (
    <div className="rounded-xl border border-zinc-800 bg-zinc-900/90 p-3 flex flex-col gap-2.5 shadow-sm animate-pop font-sans">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1.5">
          <span className="p-1 rounded bg-zinc-800 text-zinc-300">
            <ListChecks className="w-3.5 h-3.5" />
          </span>
          <span className="text-[10px] font-semibold uppercase tracking-wider text-zinc-300 font-mono">
            Interactive Runbook
          </span>
        </div>
        <span className="text-[10px] font-medium text-zinc-400 font-mono">
          {completedCount}/{runbook.steps.length} Steps ({progressPercent}%)
        </span>
      </div>

      <div>
        <h4 className="text-xs font-semibold text-zinc-100 font-sans">{runbook.title}</h4>
        {runbook.description && (
          <p className="text-[11px] text-zinc-400 mt-0.5 font-sans leading-relaxed">{runbook.description}</p>
        )}
      </div>

      {/* Progress Bar */}
      <div className="w-full h-1 rounded-full bg-zinc-800 overflow-hidden">
        <div
          className="h-full bg-zinc-200 transition-all duration-300"
          style={{ width: `${progressPercent}%` }}
        />
      </div>

      {/* Steps List */}
      <div className="flex flex-col gap-1.5 mt-1">
        {runbook.steps.map((step, idx) => {
          const isDone = Boolean(completedSteps[idx]);
          return (
            <div
              key={idx}
              className={`flex flex-col gap-1 p-2 rounded-lg border transition-all ${
                isDone
                  ? 'bg-zinc-950/40 border-zinc-800/40 opacity-60'
                  : 'bg-zinc-950/80 border-zinc-800/90 shadow-2xs'
              }`}
            >
              <div className="flex items-center justify-between gap-2">
                <button
                  onClick={() => toggleStep(idx)}
                  className="flex items-center gap-1.5 text-left text-xs font-medium text-zinc-200 hover:text-white cursor-pointer font-sans"
                >
                  {isDone ? (
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0" />
                  ) : (
                    <Circle className="w-3.5 h-3.5 text-zinc-500 flex-shrink-0" />
                  )}
                  <span className={isDone ? 'line-through text-zinc-500' : ''}>
                    Step {idx + 1}: {step.title}
                  </span>
                </button>

                <button
                  onClick={() => handleCopyStep(step.command, idx)}
                  className="px-2 py-0.5 rounded text-[10px] font-mono font-medium bg-zinc-800 hover:bg-zinc-700 text-zinc-300 hover:text-white transition-all flex items-center gap-1 cursor-pointer"
                >
                  {copiedStep === idx ? <Check className="w-2.5 h-2.5 text-emerald-400" /> : <Copy className="w-2.5 h-2.5" />}
                  {copiedStep === idx ? 'Copied' : 'Copy'}
                </button>
              </div>

              {step.description && (
                <p className="text-[10px] text-zinc-400 pl-5 font-sans leading-relaxed">{step.description}</p>
              )}

              <div className="pl-5 pr-1 py-0.5">
                <code className="text-[11px] font-mono text-zinc-100 font-medium block bg-black/80 p-1.5 rounded border border-zinc-850 overflow-x-auto whitespace-pre">
                  {step.command}
                </code>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
