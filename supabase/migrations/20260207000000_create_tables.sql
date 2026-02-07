-- Tables CR Flash dans Supabase (prefixees cr_ pour pas polluer le projet Assurissom)
-- Executer dans SQL Editor de Supabase

CREATE TABLE IF NOT EXISTS cr_users (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  password TEXT NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('manager', 'admin')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS cr_reports (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES cr_users(id),
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'submitted')),
  gt_commission TEXT,
  meeting_date TEXT,
  agenda TEXT,
  meeting_vibe INTEGER,
  rules_respect INTEGER,
  discussed_topics TEXT,
  progress_and_agreements TEXT,
  issues_and_disagreements TEXT,
  topics_for_next_meeting TEXT,
  network_communication TEXT,
  next_meeting_date TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS cr_report_history (
  id SERIAL PRIMARY KEY,
  report_id INTEGER NOT NULL REFERENCES cr_reports(id),
  editor_id INTEGER NOT NULL REFERENCES cr_users(id),
  changes JSONB NOT NULL,
  edited_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS cr_gt_commissions (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS cr_managers (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT NOT NULL
);

-- Index pour performances
CREATE INDEX IF NOT EXISTS idx_cr_reports_user_id ON cr_reports(user_id);
CREATE INDEX IF NOT EXISTS idx_cr_reports_status ON cr_reports(status);
CREATE INDEX IF NOT EXISTS idx_cr_report_history_report_id ON cr_report_history(report_id);

-- RLS desactive pour ces tables (acces via service_role key cote serveur)
ALTER TABLE cr_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE cr_reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE cr_report_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE cr_gt_commissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE cr_managers ENABLE ROW LEVEL SECURITY;

-- Policies pour service_role (bypass RLS automatiquement)
-- Pas de policies anon pour securiser l'acces
