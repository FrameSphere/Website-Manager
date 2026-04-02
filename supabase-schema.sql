-- =============================================
-- SiteControl – Supabase Schema
-- =============================================

-- ── Plans ──────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS plans (
  id TEXT PRIMARY KEY,               -- 'free' | 'pro'
  name TEXT NOT NULL,
  max_sites INTEGER NOT NULL,        -- -1 = unlimited
  max_team_members INTEGER NOT NULL,
  features JSONB DEFAULT '{}',
  price_monthly NUMERIC DEFAULT 0,
  price_yearly NUMERIC DEFAULT 0
);

INSERT INTO plans (id, name, max_sites, max_team_members, features, price_monthly, price_yearly) VALUES
  ('free', 'Free', 3, 1, '{"blog":false,"changelog":false,"support":false,"analytics":"basic","adsense":false,"gsc":false}', 0, 0),
  ('pro',  'Pro',  -1, 5, '{"blog":true,"changelog":true,"support":true,"analytics":"full","adsense":true,"gsc":true}',  19, 190)
ON CONFLICT (id) DO NOTHING;

-- ── Users profile (extends Supabase auth.users) ────────────────────
CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT,
  avatar_url TEXT,
  plan_id TEXT NOT NULL DEFAULT 'free' REFERENCES plans(id),
  plan_started_at TIMESTAMPTZ DEFAULT now(),
  plan_ends_at TIMESTAMPTZ,
  stripe_customer_id TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can read own profile" ON profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON profiles FOR UPDATE USING (auth.uid() = id);

-- Auto-create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, avatar_url)
  VALUES (new.id, new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'avatar_url');
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- ── Sites ──────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS sites (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  url TEXT NOT NULL,
  slug TEXT NOT NULL,                -- kurzer key z.B. "myblog"
  icon TEXT DEFAULT 'globe',
  color TEXT DEFAULT '#5b6af6',
  status TEXT DEFAULT 'active',      -- 'active' | 'paused' | 'error'
  description TEXT,
  notes TEXT,
  verified BOOLEAN DEFAULT false,
  verified_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE sites ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can CRUD own sites" ON sites FOR ALL USING (auth.uid() = owner_id);

-- ── Site Status History ────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS site_status_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  site_id UUID NOT NULL REFERENCES sites(id) ON DELETE CASCADE,
  owner_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  old_status TEXT,
  new_status TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE site_status_history ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can read own history" ON site_status_history FOR ALL USING (auth.uid() = owner_id);
CREATE INDEX IF NOT EXISTS idx_status_history_site ON site_status_history(site_id, created_at DESC);

-- ── Team members ───────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS team_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  email TEXT NOT NULL,
  role TEXT DEFAULT 'viewer',        -- 'admin' | 'editor' | 'viewer'
  status TEXT DEFAULT 'invited',     -- 'invited' | 'active'
  invited_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE team_members ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Owners can manage team" ON team_members FOR ALL USING (auth.uid() = owner_id);

-- ── Todos ──────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS todos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  site_id UUID REFERENCES sites(id) ON DELETE SET NULL,
  title TEXT NOT NULL,
  description TEXT,
  done BOOLEAN DEFAULT false,
  important BOOLEAN DEFAULT false,
  priority INTEGER DEFAULT 3,        -- 1-5
  due_date DATE,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE todos ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can CRUD own todos" ON todos FOR ALL USING (auth.uid() = owner_id);

-- ── Notifications ──────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  site_id UUID REFERENCES sites(id) ON DELETE CASCADE,
  type TEXT NOT NULL DEFAULT 'info', -- 'error' | 'info' | 'warn' | 'success'
  title TEXT NOT NULL,
  message TEXT,
  read BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can manage own notifications" ON notifications FOR ALL USING (auth.uid() = owner_id);

-- ── Blog Posts (Pro) ───────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS blog_posts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  site_id UUID NOT NULL REFERENCES sites(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  slug TEXT NOT NULL,
  content TEXT,
  excerpt TEXT,
  lang TEXT DEFAULT 'de',
  status TEXT DEFAULT 'draft',       -- 'draft' | 'published' | 'scheduled'
  published_at TIMESTAMPTZ,
  publish_at TIMESTAMPTZ,
  meta_title TEXT,
  meta_description TEXT,
  meta_keywords TEXT[],
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE blog_posts ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can CRUD own blog posts" ON blog_posts FOR ALL USING (auth.uid() = owner_id);

-- ── Changelog Entries (Pro) ────────────────────────────────────────
CREATE TABLE IF NOT EXISTS changelog_entries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  site_id UUID NOT NULL REFERENCES sites(id) ON DELETE CASCADE,
  version TEXT NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  type TEXT DEFAULT 'feature',       -- 'feature' | 'fix' | 'improvement' | 'breaking'
  published BOOLEAN DEFAULT false,
  published_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE changelog_entries ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can CRUD own changelog" ON changelog_entries FOR ALL USING (auth.uid() = owner_id);

-- ── Support Tickets (Pro) ──────────────────────────────────────────
CREATE TABLE IF NOT EXISTS support_tickets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  site_id UUID REFERENCES sites(id) ON DELETE SET NULL,
  name TEXT,
  email TEXT,
  subject TEXT NOT NULL,
  message TEXT NOT NULL,
  status TEXT DEFAULT 'open',        -- 'open' | 'in_progress' | 'resolved' | 'closed'
  priority TEXT DEFAULT 'normal',    -- 'low' | 'normal' | 'high' | 'urgent'
  reply TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE support_tickets ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can manage own tickets" ON support_tickets FOR ALL USING (auth.uid() = owner_id);

-- ── Error Logs ─────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS error_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  site_id UUID REFERENCES sites(id) ON DELETE CASCADE,
  error_type TEXT NOT NULL,
  message TEXT NOT NULL,
  path TEXT,
  status_code INTEGER,
  resolved BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE error_logs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can manage own errors" ON error_logs FOR ALL USING (auth.uid() = owner_id);

-- ── Analytics Events ───────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS analytics_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  site_id UUID REFERENCES sites(id) ON DELETE CASCADE,
  event_type TEXT NOT NULL,
  path TEXT,
  referrer TEXT,
  country TEXT,
  device TEXT,
  value INTEGER DEFAULT 1,
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE analytics_events ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can manage own analytics" ON analytics_events FOR ALL USING (auth.uid() = owner_id);

-- ── Pinboard Notes ─────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS pinboard_notes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  site_id UUID REFERENCES sites(id) ON DELETE SET NULL,
  content TEXT NOT NULL,
  color TEXT DEFAULT '#5b6af6',
  pinned BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE pinboard_notes ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can CRUD own notes" ON pinboard_notes FOR ALL USING (auth.uid() = owner_id);

-- ── Useful indexes ─────────────────────────────────────────────────
CREATE INDEX IF NOT EXISTS idx_sites_owner ON sites(owner_id);
CREATE INDEX IF NOT EXISTS idx_todos_owner ON todos(owner_id);
CREATE INDEX IF NOT EXISTS idx_blog_posts_site ON blog_posts(site_id);
CREATE INDEX IF NOT EXISTS idx_changelog_site ON changelog_entries(site_id);
CREATE INDEX IF NOT EXISTS idx_analytics_site_date ON analytics_events(site_id, created_at);
CREATE INDEX IF NOT EXISTS idx_notifications_owner_read ON notifications(owner_id, read);
