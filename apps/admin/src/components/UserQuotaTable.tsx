import React, { useState } from 'react';
import { Search, Shield, Zap, RotateCcw, Infinity, Check, UserCheck } from 'lucide-react';
import { AdminUserRecord } from '../types';

interface UserQuotaTableProps {
  users: AdminUserRecord[];
  onToggleUnlimited: (userId: string) => void;
  onResetUsage: (userId: string) => void;
  onPromoteRole: (userId: string) => void;
}

export const UserQuotaTable: React.FC<UserQuotaTableProps> = ({
  users,
  onToggleUnlimited,
  onResetUsage,
  onPromoteRole,
}) => {
  const [filter, setFilter] = useState('');
  const [roleFilter, setRoleFilter] = useState<string>('all');

  const filteredUsers = users.filter((u) => {
    const matchesText =
      u.email.toLowerCase().includes(filter.toLowerCase()) ||
      u.fullName.toLowerCase().includes(filter.toLowerCase());
    const matchesRole = roleFilter === 'all' || u.role === roleFilter;
    return matchesText && matchesRole;
  });

  return (
    <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-5 backdrop-blur-sm flex flex-col gap-4">
      {/* Table Header and Controls */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-slate-800/80 pb-4">
        <div>
          <h3 className="text-sm font-semibold text-white">User Accounts & Quota Directory</h3>
          <p className="text-xs text-slate-400">Manage user quotas, roles, and real-time usage metrics</p>
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          {/* Search Bar */}
          <div className="relative flex-1 sm:w-64">
            <Search className="absolute left-2.5 top-2.5 w-3.5 h-3.5 text-slate-500" />
            <input
              type="text"
              placeholder="Search user or email..."
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-lg pl-8 pr-3 py-1.5 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-cyan-500"
            />
          </div>

          {/* Role Filter */}
          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            className="bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs text-slate-300 focus:outline-none focus:border-cyan-500"
          >
            <option value="all">All Roles</option>
            <option value="user">User</option>
            <option value="power_user">Power User</option>
            <option value="admin">Admin</option>
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs">
          <thead>
            <tr className="border-b border-slate-800 text-slate-400 font-mono uppercase text-[10px]">
              <th className="py-2.5 px-3">User</th>
              <th className="py-2.5 px-3">Role</th>
              <th className="py-2.5 px-3">Today's Usage</th>
              <th className="py-2.5 px-3">Daily Limit</th>
              <th className="py-2.5 px-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/60 font-sans">
            {filteredUsers.map((user) => {
              const usagePercent = Math.min(
                100,
                Math.round((user.queriesUsedToday / user.dailyQueryLimit) * 100)
              );

              return (
                <tr key={user.id} className="hover:bg-slate-800/40 transition-colors">
                  <td className="py-3 px-3">
                    <div className="font-medium text-slate-200">{user.email}</div>
                    <div className="text-[11px] text-slate-500">{user.fullName || 'No name'}</div>
                  </td>

                  <td className="py-3 px-3">
                    <span
                      className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-mono font-medium ${
                        user.role === 'admin'
                          ? 'bg-rose-500/10 text-rose-400 border border-rose-500/30'
                          : user.role === 'power_user'
                          ? 'bg-amber-500/10 text-amber-400 border border-amber-500/30'
                          : 'bg-slate-800 text-slate-300 border border-slate-700'
                      }`}
                    >
                      {user.role}
                    </span>
                  </td>

                  <td className="py-3 px-3">
                    <div className="flex items-center gap-2">
                      <div className="w-24 bg-slate-800 rounded-full h-1.5 overflow-hidden">
                        <div
                          className={`h-full ${
                            usagePercent >= 90
                              ? 'bg-rose-500'
                              : usagePercent >= 60
                              ? 'bg-amber-500'
                              : 'bg-cyan-500'
                          }`}
                          style={{ width: `${user.isUnlimited ? 15 : usagePercent}%` }}
                        />
                      </div>
                      <span className="font-mono text-slate-300 text-[11px]">
                        {user.queriesUsedToday}
                      </span>
                    </div>
                  </td>

                  <td className="py-3 px-3 font-mono">
                    {user.isUnlimited ? (
                      <span className="text-emerald-400 flex items-center gap-1">
                        <Infinity className="w-3.5 h-3.5" /> Unlimited
                      </span>
                    ) : (
                      <span className="text-slate-400">{user.dailyQueryLimit}/day</span>
                    )}
                  </td>

                  <td className="py-3 px-3 text-right">
                    <div className="flex items-center justify-end gap-1.5">
                      <button
                        onClick={() => onToggleUnlimited(user.id)}
                        className={`p-1.5 rounded-md border text-[11px] font-medium transition-colors ${
                          user.isUnlimited
                            ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/20'
                            : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-white hover:border-slate-700'
                        }`}
                        title={user.isUnlimited ? 'Revoke Unlimited' : 'Grant Unlimited Quota'}
                      >
                        <Infinity className="w-3 h-3" />
                      </button>

                      <button
                        onClick={() => onResetUsage(user.id)}
                        className="p-1.5 rounded-md border bg-slate-950 border-slate-800 text-slate-400 hover:text-cyan-400 hover:border-cyan-500/50 transition-colors"
                        title="Reset Today's Query Counter to 0"
                      >
                        <RotateCcw className="w-3 h-3" />
                      </button>

                      <button
                        onClick={() => onPromoteRole(user.id)}
                        className="p-1.5 rounded-md border bg-slate-950 border-slate-800 text-slate-400 hover:text-amber-400 hover:border-amber-500/50 transition-colors"
                        title="Promote / Cycle Role"
                      >
                        <UserCheck className="w-3 h-3" />
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};
