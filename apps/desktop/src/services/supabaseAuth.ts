import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://rdhmmzvcevjttxeyycqm.supabase.co';
const SUPABASE_ANON_KEY =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJkaG1tenZjZXZqdHR4ZXl5Y3FtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTM4MDE4ODQsImV4cCI6MjEwOTM3Nzg4NH0.2JDfglz6HMggZU0n8rmzwt7qQOP91arW-WVpTYVIyw0';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

export interface AuthResult {
  success: boolean;
  token?: string;
  email?: string;
  userId?: string;
  error?: string;
}

export async function signInWithEmail(email: string, password: string): Promise<AuthResult> {
  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      email: email.trim(),
      password,
    });

    if (error) {
      if ((error as any).code === 'over_email_send_rate_limit') {
        return {
          success: false,
          error: 'Supabase email send limit reached. Please use the 1-click Dev Profile to sign in immediately!',
        };
      }
      return { success: false, error: error.message };
    }

    if (!data.session || !data.user) {
      return { success: false, error: 'No session returned from authentication server.' };
    }

    return {
      success: true,
      token: data.session.access_token,
      email: data.user.email || email,
      userId: data.user.id,
    };
  } catch (err: any) {
    return { success: false, error: err.message || 'An unexpected error occurred during sign in.' };
  }
}

export async function signUpWithEmail(email: string, password: string): Promise<AuthResult> {
  // Prefer desktop admin provisioning for zero email delivery errors & instant confirmation
  const desktop = typeof window !== 'undefined' ? (window as any).glintDesktop : null;
  if (desktop?.signUpAdmin) {
    try {
      const res = await desktop.signUpAdmin(email, password);
      if (res && res.success) {
        return res;
      }
      if (res && res.error && !res.error.includes('configuration missing')) {
        return res;
      }
    } catch (e) {
      console.warn('[SupabaseAuth] Desktop admin sign up failed, falling back to client:', e);
    }
  }

  try {
    const { data, error } = await supabase.auth.signUp({
      email: email.trim(),
      password,
    });

    if (error) {
      if ((error as any).code === 'over_email_send_rate_limit') {
        return {
          success: false,
          error: 'Supabase email send limit reached. Please use the 1-click Dev Profile to sign in immediately!',
        };
      }
      return { success: false, error: error.message };
    }

    if (!data.user) {
      return { success: false, error: 'Registration failed. Please try again.' };
    }

    // If session is immediately returned (auto-confirm enabled on Supabase)
    const token = data.session?.access_token || `user-${data.user.id.slice(0, 12)}`;

    return {
      success: true,
      token,
      email: data.user.email || email,
      userId: data.user.id,
    };
  } catch (err: any) {
    return { success: false, error: err.message || 'An unexpected error occurred during sign up.' };
  }
}

export async function signOutUser(): Promise<void> {
  try {
    await supabase.auth.signOut();
  } catch (e) {
    console.warn('[SupabaseAuth] Sign out error:', e);
  }
}

export async function getStoredSession(): Promise<{ token: string; email: string } | null> {
  try {
    const { data } = await supabase.auth.getSession();
    if (data.session && data.session.user) {
      return {
        token: data.session.access_token,
        email: data.session.user.email || 'developer@glint.dev',
      };
    }
  } catch (e) {
    console.warn('[SupabaseAuth] Failed to restore session:', e);
  }
  return null;
}
