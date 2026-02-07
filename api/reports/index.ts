import type { VercelRequest, VercelResponse } from '@vercel/node';
import { verifyToken } from '../lib/auth';
import { supabase } from '../lib/supabase';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  if (req.method === 'OPTIONS') return res.status(200).end();

  const user = verifyToken(req);
  if (!user) return res.status(401).json({ error: 'Non authentifie' });

  if (req.method === 'GET') {
    let query = supabase
      .from('cr_reports')
      .select('*, cr_users(name)')
      .order('updated_at', { ascending: false });

    if (user.role !== 'admin') {
      query = query.eq('user_id', user.id);
    }

    const { data, error } = await query;
    if (error) return res.status(500).json({ error: error.message });

    const reports = (data || []).map((r: any) => ({
      ...r,
      userName: r.cr_users?.name || null,
      cr_users: undefined,
    }));
    return res.json(reports);
  }

  if (req.method === 'POST') {
    const now = new Date().toISOString();
    const { data, error } = await supabase
      .from('cr_reports')
      .insert({
        user_id: user.id,
        status: 'draft',
        gt_commission: req.body.gtCommission || null,
        meeting_date: req.body.meetingDate || null,
        agenda: req.body.agenda || null,
        meeting_vibe: req.body.meetingVibe || null,
        rules_respect: req.body.rulesRespect || null,
        discussed_topics: req.body.discussedTopics || null,
        progress_and_agreements: req.body.progressAndAgreements || null,
        issues_and_disagreements: req.body.issuesAndDisagreements || null,
        topics_for_next_meeting: req.body.topicsForNextMeeting || null,
        network_communication: req.body.networkCommunication || null,
        next_meeting_date: req.body.nextMeetingDate || null,
        created_at: now,
        updated_at: now,
      })
      .select()
      .single();

    if (error) return res.status(500).json({ error: error.message });
    return res.status(201).json(data);
  }

  return res.status(405).json({ error: 'Method not allowed' });
}
