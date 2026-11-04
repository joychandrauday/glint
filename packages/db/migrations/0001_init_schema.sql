-- Glint PostgreSQL / Supabase Initial Schema Migration
-- Migration: 0001_init_schema.sql

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- 1. User Profiles
CREATE TABLE IF NOT EXISTS public.user_profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT NOT NULL,
    full_name TEXT,
    role TEXT NOT NULL DEFAULT 'user' CHECK (role IN ('user', 'power_user', 'admin')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 2. User Quotas
CREATE TABLE IF NOT EXISTS public.user_quotas (
    user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    daily_query_limit INT NOT NULL DEFAULT 15,
    queries_used_today INT NOT NULL DEFAULT 0,
    quota_reset_at TIMESTAMPTZ NOT NULL DEFAULT (timezone('utc'::text, now()) + interval '1 day'),
    is_unlimited BOOLEAN NOT NULL DEFAULT FALSE,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 3. Cheatsheets
CREATE TABLE IF NOT EXISTS public.cheatsheets (
    id TEXT PRIMARY KEY,
    command TEXT NOT NULL,
    template TEXT NOT NULL,
    description TEXT NOT NULL,
    category TEXT NOT NULL,
    tags TEXT[] NOT NULL DEFAULT '{}',
    variables JSONB NOT NULL DEFAULT '[]'::jsonb,
    platform TEXT NOT NULL DEFAULT 'all' CHECK (platform IN ('linux', 'macos', 'windows', 'all')),
    is_popular BOOLEAN NOT NULL DEFAULT FALSE,
    notes TEXT,
    danger_level TEXT NOT NULL DEFAULT 'safe' CHECK (danger_level IN ('safe', 'caution', 'dangerous')),
    version INT NOT NULL DEFAULT 1,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    search_vector tsvector GENERATED ALWAYS AS (
        to_tsvector('english', coalesce(command, '') || ' ' || coalesce(description, '') || ' ' || coalesce(category, '') || ' ' || array_to_string(tags, ' '))
    ) STORED
);

-- 4. AI Query Semantic / Hash Cache
CREATE TABLE IF NOT EXISTS public.ai_query_cache (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    query_hash TEXT NOT NULL UNIQUE,
    normalized_query TEXT NOT NULL,
    provider TEXT NOT NULL CHECK (provider IN ('groq', 'gemini', 'cloudflare')),
    suggestions JSONB NOT NULL,
    latency_ms INT NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    expires_at TIMESTAMPTZ NOT NULL
);

-- 5. System Configuration & Feature Flags
CREATE TABLE IF NOT EXISTS public.system_config (
    key TEXT PRIMARY KEY,
    value JSONB NOT NULL,
    description TEXT,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 6. Usage Audit Logs
CREATE TABLE IF NOT EXISTS public.usage_audit_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    query TEXT NOT NULL,
    provider TEXT NOT NULL,
    was_cached BOOLEAN NOT NULL DEFAULT FALSE,
    latency_ms INT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_cheatsheets_search ON public.cheatsheets USING GIN (search_vector);
CREATE INDEX IF NOT EXISTS idx_cheatsheets_category ON public.cheatsheets (category);
CREATE INDEX IF NOT EXISTS idx_cheatsheets_platform ON public.cheatsheets (platform);
CREATE INDEX IF NOT EXISTS idx_ai_query_cache_hash ON public.ai_query_cache (query_hash);
CREATE INDEX IF NOT EXISTS idx_ai_query_cache_expires ON public.ai_query_cache (expires_at);
CREATE INDEX IF NOT EXISTS idx_usage_audit_logs_user_date ON public.usage_audit_logs (user_id, created_at DESC);

-- Automated Timestamp Update Trigger
CREATE OR REPLACE FUNCTION public.trigger_set_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = timezone('utc'::text, now());
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER set_user_profiles_timestamp
BEFORE UPDATE ON public.user_profiles
FOR EACH ROW
EXECUTE FUNCTION public.trigger_set_timestamp();

CREATE TRIGGER set_cheatsheets_timestamp
BEFORE UPDATE ON public.cheatsheets
FOR EACH ROW
EXECUTE FUNCTION public.trigger_set_timestamp();

CREATE TRIGGER set_user_quotas_timestamp
BEFORE UPDATE ON public.user_quotas
FOR EACH ROW
EXECUTE FUNCTION public.trigger_set_timestamp();

-- Trigger for New User Signup in Supabase auth.users
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  -- Insert User Profile
  INSERT INTO public.user_profiles (id, email, full_name, role)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', ''),
    'user'
  )
  ON CONFLICT (id) DO NOTHING;

  -- Insert User Initial Quota (15 queries/day default)
  INSERT INTO public.user_quotas (user_id, daily_query_limit, queries_used_today, quota_reset_at)
  VALUES (
    NEW.id,
    15,
    0,
    timezone('utc'::text, now()) + interval '1 day'
  )
  ON CONFLICT (user_id) DO NOTHING;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Attach hook to Supabase auth.users
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
AFTER INSERT ON auth.users
FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Enable Row-Level Security (RLS)
ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_quotas ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cheatsheets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ai_query_cache ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.system_config ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.usage_audit_logs ENABLE ROW LEVEL SECURITY;

-- Helper function to check if caller is an admin
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.user_profiles
    WHERE id = auth.uid() AND role = 'admin'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE;

-- RLS Policies: Cheatsheets
CREATE POLICY "Cheatsheets are viewable by everyone"
ON public.cheatsheets FOR SELECT
USING (true);

CREATE POLICY "Cheatsheets can only be modified by admins"
ON public.cheatsheets FOR ALL
USING (public.is_admin());

-- RLS Policies: User Profiles
CREATE POLICY "Users can view their own profile"
ON public.user_profiles FOR SELECT
USING (auth.uid() = id OR public.is_admin());

CREATE POLICY "Users can update their own profile"
ON public.user_profiles FOR UPDATE
USING (auth.uid() = id OR public.is_admin());

-- RLS Policies: User Quotas
CREATE POLICY "Users can view their own quota"
ON public.user_quotas FOR SELECT
USING (auth.uid() = user_id OR public.is_admin());

-- RLS Policies: System Config
CREATE POLICY "System config viewable by authenticated"
ON public.system_config FOR SELECT
USING (true);

CREATE POLICY "System config modified by admins only"
ON public.system_config FOR ALL
USING (public.is_admin());

-- RLS Policies: AI Cache
CREATE POLICY "AI cache readable by authenticated users"
ON public.ai_query_cache FOR SELECT
USING (true);

-- Insert Default System Config
INSERT INTO public.system_config (key, value, description)
VALUES 
  ('ai_settings', '{"primaryProvider": "groq", "allowedProviders": ["groq", "gemini", "cloudflare"], "defaultDailyQuota": 15, "aiCacheTtlSeconds": 604800, "maintenanceMode": false}'::jsonb, 'Global AI Gateway & Quota Configuration'),
  ('guest_settings', '{"guestSearchLimit": 10}'::jsonb, 'Guest mode offline search constraints')
ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value;
