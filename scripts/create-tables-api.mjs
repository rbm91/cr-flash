// Cree les tables CR Flash dans Supabase en utilisant le service_role key
// et l'API REST pour verifier + executer du SQL via une function RPC temporaire

import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://skarlvpenwoasndirhqh.supabase.co';
const SERVICE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNrYXJsdnBlbndvYXNuZGlyaHFoIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2ODU2NDU4MCwiZXhwIjoyMDg0MTQwNTgwfQ.mHBSLz1s7smlTRCyElVQ-s7REgjMBwf0lXgIfQ8BdbY';

const supabase = createClient(SUPABASE_URL, SERVICE_KEY, {
  db: { schema: 'public' }
});

// On va utiliser pg_catalog pour voir si les tables existent deja
// puis les creer via l'API Supabase Management

// Approche : utiliser le endpoint SQL de Supabase via fetch direct au pooler
const DB_URL = `https://skarlvpenwoasndirhqh.supabase.co/rest/v1/`;

async function executeSQL(sql) {
  // Supabase ne permet pas d'executer du SQL brut via l'API REST
  // Mais on peut utiliser le hook pg_net ou creer une function RPC
  // Alternative : on verifie si les tables existent et on les cree via l'admin API

  const response = await fetch(`https://skarlvpenwoasndirhqh.supabase.co/pg/query`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${SERVICE_KEY}`,
      'apikey': SERVICE_KEY,
    },
    body: JSON.stringify({ query: sql }),
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`SQL Error ${response.status}: ${text}`);
  }
  return response.json();
}

async function main() {
  console.log('Creation des tables CR Flash dans Supabase...');

  const statements = [
    `CREATE TABLE IF NOT EXISTS cr_users (
      id SERIAL PRIMARY KEY,
      name TEXT NOT NULL,
      email TEXT UNIQUE NOT NULL,
      password TEXT NOT NULL,
      role TEXT NOT NULL CHECK (role IN ('manager', 'admin')),
      created_at TIMESTAMPTZ DEFAULT NOW()
    )`,
    `CREATE TABLE IF NOT EXISTS cr_reports (
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
    )`,
    `CREATE TABLE IF NOT EXISTS cr_report_history (
      id SERIAL PRIMARY KEY,
      report_id INTEGER NOT NULL REFERENCES cr_reports(id),
      editor_id INTEGER NOT NULL REFERENCES cr_users(id),
      changes JSONB NOT NULL,
      edited_at TIMESTAMPTZ DEFAULT NOW()
    )`,
    `CREATE TABLE IF NOT EXISTS cr_gt_commissions (
      id SERIAL PRIMARY KEY,
      name TEXT NOT NULL
    )`,
    `CREATE TABLE IF NOT EXISTS cr_managers (
      id SERIAL PRIMARY KEY,
      name TEXT NOT NULL,
      email TEXT NOT NULL
    )`,
    `CREATE INDEX IF NOT EXISTS idx_cr_reports_user_id ON cr_reports(user_id)`,
    `CREATE INDEX IF NOT EXISTS idx_cr_reports_status ON cr_reports(status)`,
    `CREATE INDEX IF NOT EXISTS idx_cr_report_history_report_id ON cr_report_history(report_id)`,
    `ALTER TABLE cr_users ENABLE ROW LEVEL SECURITY`,
    `ALTER TABLE cr_reports ENABLE ROW LEVEL SECURITY`,
    `ALTER TABLE cr_report_history ENABLE ROW LEVEL SECURITY`,
    `ALTER TABLE cr_gt_commissions ENABLE ROW LEVEL SECURITY`,
    `ALTER TABLE cr_managers ENABLE ROW LEVEL SECURITY`,
  ];

  for (const sql of statements) {
    try {
      await executeSQL(sql);
      console.log('  OK:', sql.substring(0, 60) + '...');
    } catch (err) {
      console.error('  ERREUR:', err.message.substring(0, 100));
      // On essaie une approche alternative - via le pooler direct
    }
  }

  console.log('Terminé !');
}

main().catch(console.error);
