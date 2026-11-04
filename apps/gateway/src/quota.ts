import { UserQuota } from '@glint/shared';

interface QuotaRecord {
  queriesUsedToday: number;
  resetAt: number; // timestamp in ms
  isUnlimited: boolean;
}

class QuotaManager {
  private userQuotas = new Map<string, QuotaRecord>();

  private getNextMidnightUTC(): number {
    const now = new Date();
    const midnight = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate() + 1, 0, 0, 0, 0));
    return midnight.getTime();
  }

  public getQuota(userId: string, defaultLimit = 15): UserQuota {
    const now = Date.now();
    let record = this.userQuotas.get(userId);

    if (!record || now >= record.resetAt) {
      record = {
        queriesUsedToday: 0,
        resetAt: this.getNextMidnightUTC(),
        isUnlimited: false,
      };
      this.userQuotas.set(userId, record);
    }

    return {
      userId,
      dailyQueryLimit: defaultLimit,
      queriesUsedToday: record.queriesUsedToday,
      quotaResetAt: new Date(record.resetAt).toISOString(),
      isUnlimited: record.isUnlimited,
    };
  }

  public canConsume(userId: string, limit = 15): boolean {
    const quota = this.getQuota(userId, limit);
    if (quota.isUnlimited) return true;
    return quota.queriesUsedToday < quota.dailyQueryLimit;
  }

  public consume(userId: string, limit = 15): { allowed: boolean; remaining: number; resetAt: string } {
    const quota = this.getQuota(userId, limit);
    if (!quota.isUnlimited && quota.queriesUsedToday >= quota.dailyQueryLimit) {
      return {
        allowed: false,
        remaining: 0,
        resetAt: quota.quotaResetAt,
      };
    }

    const record = this.userQuotas.get(userId)!;
    record.queriesUsedToday += 1;

    return {
      allowed: true,
      remaining: quota.isUnlimited ? 999999 : Math.max(0, limit - record.queriesUsedToday),
      resetAt: quota.quotaResetAt,
    };
  }

  public setUnlimited(userId: string, unlimited: boolean): void {
    const quota = this.getQuota(userId);
    const record = this.userQuotas.get(userId)!;
    record.isUnlimited = unlimited;
  }
}

export const quotaManager = new QuotaManager();
