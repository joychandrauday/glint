import React from 'react';
import { Users, Zap, Database, Activity, CheckCircle2, Clock } from 'lucide-react';
import { SystemMetrics } from '../types';

interface KPICardsProps {
  metrics: SystemMetrics;
}

export const KPICards: React.FC<KPICardsProps> = ({ metrics }) => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {/* Total Users */}
      <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-4 backdrop-blur-sm flex flex-col justify-between">
        <div className="flex items-center justify-between text-slate-400">
          <span className="text-xs font-medium uppercase tracking-wider">Registered Users</span>
          <Users className="w-4 h-4 text-cyan-400" />
        </div>
        <div className="mt-2 flex items-baseline gap-2">
          <span className="text-2xl font-bold font-mono text-white">{metrics.totalUsers}</span>
          <span className="text-xs text-emerald-400 font-medium">+{metrics.activeUsersToday} active today</span>
        </div>
      </div>

      {/* Queries Processed */}
      <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-4 backdrop-blur-sm flex flex-col justify-between">
        <div className="flex items-center justify-between text-slate-400">
          <span className="text-xs font-medium uppercase tracking-wider">Queries Today</span>
          <Activity className="w-4 h-4 text-cyan-400" />
        </div>
        <div className="mt-2 flex items-baseline gap-2">
          <span className="text-2xl font-bold font-mono text-white">{metrics.totalQueriesToday}</span>
          <span className="text-xs text-slate-400 font-mono">requests</span>
        </div>
      </div>

      {/* Cache Hit Ratio */}
      <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-4 backdrop-blur-sm flex flex-col justify-between">
        <div className="flex items-center justify-between text-slate-400">
          <span className="text-xs font-medium uppercase tracking-wider">Cache Hit Ratio</span>
          <Database className="w-4 h-4 text-emerald-400" />
        </div>
        <div className="mt-2 flex items-baseline gap-2">
          <span className="text-2xl font-bold font-mono text-emerald-400">{metrics.cacheHitRatio.toFixed(1)}%</span>
          <span className="text-xs text-slate-400 font-mono">instant (3ms)</span>
        </div>
      </div>

      {/* Avg Response Latency */}
      <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-4 backdrop-blur-sm flex flex-col justify-between">
        <div className="flex items-center justify-between text-slate-400">
          <span className="text-xs font-medium uppercase tracking-wider">Avg Latency</span>
          <Clock className="w-4 h-4 text-amber-400" />
        </div>
        <div className="mt-2 flex items-baseline gap-2">
          <span className="text-2xl font-bold font-mono text-white">{metrics.avgLatencyMs}ms</span>
          <span className="text-xs font-mono text-cyan-400 uppercase">[{metrics.activeProvider}]</span>
        </div>
      </div>
    </div>
  );
};
