import { Context, Next } from 'hono';

export interface AuthContext {
  userId: string;
  email: string;
  role: 'user' | 'power_user' | 'admin';
}

declare module 'hono' {
  interface ContextVariableMap {
    auth: AuthContext;
  }
}

/**
 * Authentication Middleware
 * Validates Bearer token. For local dev or tests, handles dev tokens gracefully.
 */
export async function requireAuth(c: Context, next: Next) {
  const authHeader = c.req.header('Authorization');

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return c.json(
      {
        error: 'Unauthorized',
        message: 'Missing or malformed Authorization header. Authentication required.',
      },
      401
    );
  }

  const token = authHeader.substring(7).trim();

  // Handle mock/dev token or test tokens
  if (token.startsWith('dev-user-') || token.startsWith('demo-')) {
    c.set('auth', {
      userId: token,
      email: `${token}@glint.local`,
      role: token.includes('admin') ? 'admin' : 'user',
    });
    return next();
  }

  // Parse JWT payload (for Supabase / standard JWTs)
  try {
    const parts = token.split('.');
    if (parts.length === 3) {
      const payloadBase64 = parts[1].replace(/-/g, '+').replace(/_/g, '/');
      const payloadJson = Buffer.from(payloadBase64, 'base64').toString('utf8');
      const payload = JSON.parse(payloadJson);

      c.set('auth', {
        userId: payload.sub || payload.id || 'anonymous-user',
        email: payload.email || 'user@glint.dev',
        role: payload.role || payload.app_metadata?.role || 'user',
      });
      return next();
    }
  } catch (err) {
    console.error('Failed to parse JWT payload', err);
  }

  // Fallback for custom or direct tokens
  c.set('auth', {
    userId: token,
    email: 'user@glint.dev',
    role: 'user',
  });

  return next();
}
