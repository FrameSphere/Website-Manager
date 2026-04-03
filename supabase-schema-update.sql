-- =============================================
-- SiteControl – Schema Update: site_settings + public_api_keys
-- Run this in Supabase SQL Editor after the base schema
-- =============================================

-- ── Per-site configuration for Blog, Support, Changelog ──────────
CREATE TABLE IF NOT EXISTS site_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  site_id UUID NOT NULL REFERENCES sites(id) ON DELETE CASCADE,
  owner_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,

  -- Blog config
  blog_enabled BOOLEAN DEFAULT false,
  blog_config JSONB DEFAULT '{
    "langs": ["de"],
    "base_url": "",
    "site_name": "",
    "site_logo": "",
    "primary_color": "#5b6af6",
    "accent_color": "#a78bfa",
    "footer_links": [],
    "play_url": "",
    "play_label": ""
  }',

  -- Support config
  support_enabled BOOLEAN DEFAULT false,
  support_config JSONB DEFAULT '{
    "fields": ["name","email","subject","message"],
    "categories": [],
    "statuses": ["open","in_progress","resolved","closed"],
    "notify_email": "",
    "widget_title": "Support",
    "widget_color": "#5b6af6",
    "success_message": "Danke! Wir melden uns so schnell wie möglich.",
    "allowed_origins": ["*"]
  }',

  -- Changelog config
  changelog_enabled BOOLEAN DEFAULT false,
  changelog_config JSONB DEFAULT '{
    "show_types": ["feature","fix","improvement","breaking"],
    "widget_title": "Changelog",
    "widget_color": "#5b6af6",
    "max_entries": 20,
    "show_version": true,
    "link_url": ""
  }',

  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),

  UNIQUE(site_id)
);

ALTER TABLE site_settings ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own site settings" ON site_settings
  FOR ALL USING (auth.uid() = owner_id);

-- ── Public API keys (per site, optional auth for public endpoints) ─
CREATE TABLE IF NOT EXISTS site_api_keys (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  site_id UUID NOT NULL REFERENCES sites(id) ON DELETE CASCADE,
  owner_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  key_hash TEXT NOT NULL,      -- sha256 of the actual key
  label TEXT DEFAULT 'Default',
  created_at TIMESTAMPTZ DEFAULT now(),
  last_used_at TIMESTAMPTZ
);

ALTER TABLE site_api_keys ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own api keys" ON site_api_keys
  FOR ALL USING (auth.uid() = owner_id);

-- ── Add group_id + longtail_keywords + tags to blog_posts ─────────
ALTER TABLE blog_posts
  ADD COLUMN IF NOT EXISTS group_id TEXT,
  ADD COLUMN IF NOT EXISTS tags TEXT,
  ADD COLUMN IF NOT EXISTS longtail_keywords TEXT[],
  ADD COLUMN IF NOT EXISTS featured_image TEXT,
  ADD COLUMN IF NOT EXISTS reading_time_min INTEGER;

-- ── Add changelog publish_at ──────────────────────────────────────
ALTER TABLE changelog_entries
  ADD COLUMN IF NOT EXISTS publish_at TIMESTAMPTZ;

-- ── Support ticket: add category + user_token + source ───────────
ALTER TABLE support_tickets
  ADD COLUMN IF NOT EXISTS category TEXT,
  ADD COLUMN IF NOT EXISTS source TEXT DEFAULT 'widget',
  ADD COLUMN IF NOT EXISTS user_token TEXT,
  ADD COLUMN IF NOT EXISTS read BOOLEAN DEFAULT false;

-- ── Indexes ───────────────────────────────────────────────────────
CREATE INDEX IF NOT EXISTS idx_site_settings_site ON site_settings(site_id);
CREATE INDEX IF NOT EXISTS idx_blog_group ON blog_posts(group_id) WHERE group_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_blog_published ON blog_posts(site_id, status, lang);
CREATE INDEX IF NOT EXISTS idx_support_site_status ON support_tickets(site_id, status);
CREATE INDEX IF NOT EXISTS idx_changelog_published ON changelog_entries(site_id, published);
