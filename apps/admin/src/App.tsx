import React, { useState } from 'react';
import {
  Shield,
  Activity,
  Users,
  Database,
  Cpu,
  Layers,
  Sparkles,
  Terminal,
  ExternalLink,
} from 'lucide-react';
import { KPICards } from './components/KPICards';
import { AIConfigCard } from './components/AIConfigCard';
import { UserQuotaTable } from './components/UserQuotaTable';
import { CheatsheetsManager } from './components/CheatsheetsManager';
import { SystemMetrics, AdminUserRecord } from './types';
import { SystemConfig, CheatsheetItem, LLMProvider } from '@glint/shared';
import { DEFAULT_CHEATSHEETS } from '@glint/db';

export const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'overview' | 'users' | 'cheatsheets' | 'gateway'>(
    'overview'
  );

  // Initial State & Configuration
  const [metrics, setMetrics] = useState<SystemMetrics>({
    totalUsers: 148,
    activeUsersToday: 32,
    totalQueriesToday: 419,
    cacheHitRatio: 78.4,
    avgLatencyMs: 18,
    activeProvider: 'groq',
    maintenanceMode: false,
    uptimeSeconds: 84600,
  });

  const [config, setConfig] = useState<SystemConfig>({
    defaultDailyQuota: 15,
    aiCacheTtlSeconds: 604800,
    maintenanceMode: false,
    allowedProviders: ['groq', 'gemini', 'cloudflare'],
    primaryProvider: 'groq',
    guestSearchLimit: 10,
  });

  const [users, setUsers] = useState<AdminUserRecord[]>([
    {
      id: 'usr-1',
      email: 'joychandrauday@glint.dev',
      fullName: 'Joychandra Uday',
      role: 'admin',
      queriesUsedToday: 8,
      dailyQueryLimit: 15,
      isUnlimited: true,
      createdAt: '2026-02-15T10:00:00Z',
    },
    {
      id: 'usr-2',
      email: 'alex.chen@workstation.io',
      fullName: 'Alex Chen',
      role: 'power_user',
      queriesUsedToday: 14,
      dailyQueryLimit: 30,
      isUnlimited: false,
      createdAt: '2026-03-01T12:30:00Z',
    },
    {
      id: 'usr-3',
      email: 'sarah.devops@cloudscale.net',
      fullName: 'Sarah Miller',
      role: 'user',
      queriesUsedToday: 15,
      dailyQueryLimit: 15,
      isUnlimited: false,
      createdAt: '2026-03-10T08:15:00Z',
    },
    {
      id: 'usr-4',
      email: 'david.sysadmin@infra.org',
      fullName: 'David K.',
      role: 'user',
      queriesUsedToday: 3,
      dailyQueryLimit: 15,
      isUnlimited: false,
      createdAt: '2026-03-14T14:40:00Z',
    },
  ]);

  const [cheatsheets, setCheatsheets] = useState<CheatsheetItem[]>([...DEFAULT_CHEATSHEETS]);

  const handleUpdateConfig = (newConfig: Partial<SystemConfig>) => {
    setConfig((prev) => ({ ...prev, ...newConfig }));
    if (newConfig.primaryProvider) {
      setMetrics((prev) => ({ ...prev, activeProvider: newConfig.primaryProvider! }));
    }
    if (newConfig.maintenanceMode !== undefined) {
      setMetrics((prev) => ({ ...prev, maintenanceMode: newConfig.maintenanceMode! }));
    }
  };

  const handleToggleUnlimited = (userId: string) => {
    setUsers((prev) =>
      prev.map((u) => (u.id === userId ? { ...u, isUnlimited: !u.isUnlimited } : u))
    );
  };

  const handleResetUsage = (userId: string) => {
    setUsers((prev) =>
      prev.map((u) => (u.id === userId ? { ...u, queriesUsedToday: 0 } : u))
    );
  };

  const handlePromoteRole = (userId: string) => {
    setUsers((prev) =>
      prev.map((u) => {
        if (u.id !== userId) return u;
        const nextRole =
          u.role === 'user' ? 'power_user' : u.role === 'power_user' ? 'admin' : 'user';
        return { ...u, role: nextRole };
      })
    );
  };

  const handleAddCheatsheet = (newItem: CheatsheetItem) => {
    setCheatsheets((prev) => [newItem, ...prev]);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans">
      {/* Top Navbar */}
      <header className="h-14 border-b border-slate-800 bg-slate-900/60 px-6 flex items-center justify-between sticky top-0 z-30 backdrop-blur-md">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
            <Shield className="w-4 h-4" />
          </div>
          <div>
            <h1 className="text-sm font-bold font-mono tracking-tight text-white flex items-center gap-2">
              GLINT ADMIN
              <span className="text-[10px] px-1.5 py-0.2 rounded font-sans font-medium bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
                PROD
              </span>
            </h1>
            <p className="text-[10px] text-slate-400">AI Gateway, Quota Controls & Cheatsheets</p>
          </div>
        </div>

        {/* Navigation Tabs */}
        <nav className="flex items-center gap-1">
          <button
            onClick={() => setActiveTab('overview')}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
              activeTab === 'overview'
                ? 'bg-cyan-500/10 text-cyan-300 border border-cyan-500/30'
                : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
            }`}
          >
            Overview
          </button>
          <button
            onClick={() => setActiveTab('users')}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
              activeTab === 'users'
                ? 'bg-cyan-500/10 text-cyan-300 border border-cyan-500/30'
                : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
            }`}
          >
            Users & Quotas ({users.length})
          </button>
          <button
            onClick={() => setActiveTab('cheatsheets')}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
              activeTab === 'cheatsheets'
                ? 'bg-cyan-500/10 text-cyan-300 border border-cyan-500/30'
                : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
            }`}
          >
            Cheatsheets ({cheatsheets.length})
          </button>
          <button
            onClick={() => setActiveTab('gateway')}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
              activeTab === 'gateway'
                ? 'bg-cyan-500/10 text-cyan-300 border border-cyan-500/30'
                : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
            }`}
          >
            Gateway Settings
          </button>
        </nav>

        {/* Live Status indicator */}
        <div className="flex items-center gap-2 text-xs">
          <span className="flex items-center gap-1.5 text-slate-400 font-mono text-[11px]">
            <span
              className={`w-2 h-2 rounded-full ${
                config.maintenanceMode ? 'bg-rose-500 animate-ping' : 'bg-emerald-400 animate-pulse'
              }`}
            />
            {config.maintenanceMode ? 'MAINTENANCE' : 'GATEWAY HEALTHY'}
          </span>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 p-6 max-w-7xl w-full mx-auto flex flex-col gap-6">
        {/* Top KPI Cards (Always visible or in overview) */}
        <KPICards metrics={metrics} />

        {/* Tab Content */}
        {activeTab === 'overview' && (
          <div className="flex flex-col gap-6">
            <AIConfigCard config={config} onUpdateConfig={handleUpdateConfig} />
            <UserQuotaTable
              users={users}
              onToggleUnlimited={handleToggleUnlimited}
              onResetUsage={handleResetUsage}
              onPromoteRole={handlePromoteRole}
            />
          </div>
        )}

        {activeTab === 'users' && (
          <UserQuotaTable
            users={users}
            onToggleUnlimited={handleToggleUnlimited}
            onResetUsage={handleResetUsage}
            onPromoteRole={handlePromoteRole}
          />
        )}

        {activeTab === 'cheatsheets' && (
          <CheatsheetsManager
            cheatsheets={cheatsheets}
            onAddCheatsheet={handleAddCheatsheet}
          />
        )}

        {activeTab === 'gateway' && (
          <AIConfigCard config={config} onUpdateConfig={handleUpdateConfig} />
        )}
      </main>
    </div>
  );
};
