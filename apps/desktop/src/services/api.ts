import { AIQueryRequest, AIQueryResponse, UserQuota } from '@glint/shared';

const GATEWAY_URL = 'http://localhost:8787';

export class ApiClient {
  private token: string | null = null;

  constructor() {
    this.token = localStorage.getItem('glint_auth_token') || null;
  }

  public setToken(token: string | null) {
    this.token = token;
    if (token) {
      localStorage.setItem('glint_auth_token', token);
    } else {
      localStorage.removeItem('glint_auth_token');
    }
  }

  public getToken(): string | null {
    return this.token;
  }

  public isAuthenticated(): boolean {
    return Boolean(this.token);
  }

  public async getQuota(): Promise<UserQuota | null> {
    if (!this.token) return null;

    try {
      const res = await fetch(`${GATEWAY_URL}/api/v1/user/quota`, {
        headers: { Authorization: `Bearer ${this.token}` },
      });
      if (!res.ok) return null;
      const data = await res.json();
      return data.quota;
    } catch {
      // Fallback for standalone demo mode
      return {
        userId: this.token,
        dailyQueryLimit: 15,
        queriesUsedToday: 1,
        quotaResetAt: new Date(Date.now() + 86400000).toISOString(),
        isUnlimited: false,
      };
    }
  }

  public async queryAI(request: AIQueryRequest): Promise<AIQueryResponse> {
    if (!this.token) {
      throw new Error('Authentication required to use AI features.');
    }

    try {
      const res = await fetch(`${GATEWAY_URL}/api/v1/ai/query`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${this.token}`,
        },
        body: JSON.stringify(request),
      });

      if (!res.ok) {
        const errorJson = await res.json().catch(() => ({}));
        throw new Error(errorJson.error || `AI Query failed with status ${res.status}`);
      }

      return await res.json();
    } catch (err: any) {
      console.warn('Gateway connection error:', err.message);
      throw err;
    }
  }
}

export const apiClient = new ApiClient();
