import { UserRole, LLMProvider } from '@glint/shared';

export interface AdminUserRecord {
  id: string;
  email: string;
  fullName: string;
  role: UserRole;
  queriesUsedToday: number;
  dailyQueryLimit: number;
  isUnlimited: boolean;
  createdAt: string;
}

export interface SystemMetrics {
  totalUsers: number;
  activeUsersToday: number;
  totalQueriesToday: number;
  cacheHitRatio: number; // e.g. 74.2%
  avgLatencyMs: number;
  activeProvider: LLMProvider;
  maintenanceMode: boolean;
  uptimeSeconds: number;
}
