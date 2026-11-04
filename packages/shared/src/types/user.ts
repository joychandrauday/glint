export type UserRole = 'user' | 'power_user' | 'admin';

export interface UserProfile {
  id: string; // Supabase auth UUID
  email: string;
  fullName?: string;
  role: UserRole;
  createdAt: string;
  updatedAt: string;
}

export interface UserQuota {
  userId: string;
  dailyQueryLimit: number;
  queriesUsedToday: number;
  quotaResetAt: string; // ISO timestamp (UTC midnight)
  isUnlimited: boolean;
}

export interface GuestState {
  guestSearchesLeft: number; // starts at 10
  isLocked: boolean;
  totalGuestSearchesConducted: number;
}
