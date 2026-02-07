// Script pour creer les tables et seed data dans Supabase
// Usage: node scripts/setup-db.mjs

import { createClient } from '@supabase/supabase-js';
import bcrypt from 'bcryptjs';
import { readFileSync } from 'fs';
import { resolve } from 'path';

// Charger .env manuellement
try {
  const envPath = resolve(process.cwd(), '.env');
  const envContent = readFileSync(envPath, 'utf-8');
  for (const line of envContent.split('\n')) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;
    const eqIndex = trimmed.indexOf('=');
    if (eqIndex === -1) continue;
    const key = trimmed.substring(0, eqIndex).trim();
    const value = trimmed.substring(eqIndex + 1).trim();
    if (!process.env[key]) process.env[key] = value;
  }
} catch {}

const SUPABASE_URL = process.env.SUPABASE_URL || 'https://skarlvpenwoasndirhqh.supabase.co';
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_KEY;

if (!SUPABASE_SERVICE_KEY) {
  console.error('SUPABASE_SERVICE_KEY requis. Ajouter dans .env ou en variable d\'environnement.');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

// Utiliser l'API SQL de Supabase via rpc ou directement les tables
async function setupDatabase() {
  console.log('Creation des tables...');

  // On utilise les methodes Supabase directement - les tables doivent etre creees via SQL Editor
  // Ce script ne fait que le seed des donnees

  const adminPassword = bcrypt.hashSync('admin123', 10);
  const managerPassword = bcrypt.hashSync('manager123', 10);

  // Vider les tables existantes (dans l'ordre des FK)
  await supabase.from('cr_report_history').delete().neq('id', 0);
  await supabase.from('cr_reports').delete().neq('id', 0);
  await supabase.from('cr_managers').delete().neq('id', 0);
  await supabase.from('cr_gt_commissions').delete().neq('id', 0);
  await supabase.from('cr_users').delete().neq('id', 0);

  // Insert users
  const { error: usersErr } = await supabase.from('cr_users').insert([
    { name: 'Admin Principal', email: 'admin@crflash.fr', password: adminPassword, role: 'admin' },
    { name: 'Marie Dupont', email: 'marie.dupont@crflash.fr', password: managerPassword, role: 'manager' },
    { name: 'Jean Martin', email: 'jean.martin@crflash.fr', password: managerPassword, role: 'manager' },
  ]);
  if (usersErr) { console.error('Erreur users:', usersErr); return; }
  console.log('  Users crees');

  // Get user IDs
  const { data: users } = await supabase.from('cr_users').select('id, email');
  const userMap = {};
  users.forEach(u => userMap[u.email] = u.id);

  // Insert GT/Commissions
  const { error: gtErr } = await supabase.from('cr_gt_commissions').insert([
    { name: 'GT Inclusion' },
    { name: 'GT Habitat' },
    { name: 'GT Emploi' },
    { name: 'Commission Finances' },
    { name: 'Commission Education' },
    { name: 'GT Sante' },
  ]);
  if (gtErr) { console.error('Erreur GT:', gtErr); return; }
  console.log('  GT/Commissions creees');

  // Insert managers
  const { error: mgErr } = await supabase.from('cr_managers').insert([
    { name: 'Marie Dupont', email: 'marie.dupont@crflash.fr' },
    { name: 'Jean Martin', email: 'jean.martin@crflash.fr' },
    { name: 'Sophie Bernard', email: 'sophie.bernard@crflash.fr' },
    { name: 'Pierre Leroy', email: 'pierre.leroy@crflash.fr' },
  ]);
  if (mgErr) { console.error('Erreur managers:', mgErr); return; }
  console.log('  Managers crees');

  // Insert sample reports
  const { error: r1Err } = await supabase.from('cr_reports').insert({
    user_id: userMap['marie.dupont@crflash.fr'],
    status: 'submitted',
    gt_commission: 'GT Inclusion',
    meeting_date: '2026-01-15',
    agenda: '<p>Reunion mensuelle du GT Inclusion pour discuter des avancees du projet d\'accessibilite.</p>',
    meeting_vibe: 4,
    rules_respect: 5,
    discussed_topics: '<p>Les membres ont presente les resultats de l\'enquete terrain menee en decembre.</p>',
    progress_and_agreements: '<p>Accord unanime pour poursuivre le programme pilote jusqu\'en mars 2026.</p>',
    issues_and_disagreements: '<p>Desaccord sur le calendrier de deploiement de la phase 2.</p>',
    topics_for_next_meeting: '<p>Presentation du bilan trimestriel par le coordinateur.</p>',
    network_communication: '<p>Communiquer les resultats aux partenaires via la newsletter.</p>',
    next_meeting_date: '2026-02-12',
  });
  if (r1Err) { console.error('Erreur report 1:', r1Err); return; }

  const { error: r2Err } = await supabase.from('cr_reports').insert({
    user_id: userMap['jean.martin@crflash.fr'],
    status: 'draft',
    gt_commission: 'GT Emploi',
    meeting_date: '2026-02-01',
    agenda: '<p>Point d\'avancement sur le dispositif d\'accompagnement vers l\'emploi.</p>',
    meeting_vibe: 3,
    rules_respect: 4,
    discussed_topics: '<p>Discussion sur les nouvelles orientations du dispositif.</p>',
    progress_and_agreements: '<p>Mise en place d\'un suivi renforce pour les 15 participants.</p>',
    issues_and_disagreements: '',
    topics_for_next_meeting: '<p>Bilan semestriel et preparation du rapport d\'activite.</p>',
    network_communication: '',
    next_meeting_date: '2026-03-05',
  });
  if (r2Err) { console.error('Erreur report 2:', r2Err); return; }
  console.log('  Reports de test crees');

  console.log('\nSetup termine !');
  console.log('Comptes de test :');
  console.log('  admin@crflash.fr / admin123 (admin)');
  console.log('  marie.dupont@crflash.fr / manager123 (manager)');
  console.log('  jean.martin@crflash.fr / manager123 (manager)');
}

setupDatabase().catch(console.error);
