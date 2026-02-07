import type { VercelRequest, VercelResponse } from '@vercel/node';
import { verifyToken } from '../lib/auth';
import { supabase } from '../lib/supabase';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, PUT, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  if (req.method === 'OPTIONS') return res.status(200).end();

  const user = verifyToken(req);
  if (!user) return res.status(401).json({ error: 'Non authentifie' });

  const id = parseInt(req.query.id as string);

  if (req.method === 'GET') {
    const { data, error } = await supabase
      .from('cr_reports')
      .select('*')
      .eq('id', id)
      .single();

    if (error || !data) return res.status(404).json({ error: 'Compte-rendu non trouve' });
    if (user.role !== 'admin' && data.user_id !== user.id) {
      return res.status(403).json({ error: 'Acces non autorise' });
    }
    return res.json(data);
  }

  if (req.method === 'PUT') {
    // Get existing report for history tracking
    const { data: existing } = await supabase
      .from('cr_reports')
      .select('*')
      .eq('id', id)
      .single();

    if (!existing) return res.status(404).json({ error: 'Compte-rendu non trouve' });
    if (user.role !== 'admin' && existing.user_id !== user.id) {
      return res.status(403).json({ error: 'Acces non autorise' });
    }

    // Track history if editing submitted report
    if (existing.status === 'submitted') {
      const changes: Record<string, any> = {};
      const fieldMap: Record<string, string> = {
        gtCommission: 'gt_commission',
        meetingDate: 'meeting_date',
        agenda: 'agenda',
        meetingVibe: 'meeting_vibe',
        rulesRespect: 'rules_respect',
        discussedTopics: 'discussed_topics',
        progressAndAgreements: 'progress_and_agreements',
        issuesAndDisagreements: 'issues_and_disagreements',
        topicsForNextMeeting: 'topics_for_next_meeting',
        networkCommunication: 'network_communication',
        nextMeetingDate: 'next_meeting_date',
      };

      for (const [camelKey, snakeKey] of Object.entries(fieldMap)) {
        if (req.body[camelKey] !== undefined && req.body[camelKey] !== existing[snakeKey]) {
          changes[camelKey] = { old: existing[snakeKey], new: req.body[camelKey] };
        }
      }

      if (Object.keys(changes).length > 0) {
        await supabase.from('cr_report_history').insert({
          report_id: id,
          editor_id: user.id,
          changes,
        });
      }
    }

    const now = new Date().toISOString();
    const updateData: any = { updated_at: now };
    if (req.body.gtCommission !== undefined) updateData.gt_commission = req.body.gtCommission;
    if (req.body.meetingDate !== undefined) updateData.meeting_date = req.body.meetingDate;
    if (req.body.agenda !== undefined) updateData.agenda = req.body.agenda;
    if (req.body.meetingVibe !== undefined) updateData.meeting_vibe = req.body.meetingVibe;
    if (req.body.rulesRespect !== undefined) updateData.rules_respect = req.body.rulesRespect;
    if (req.body.discussedTopics !== undefined) updateData.discussed_topics = req.body.discussedTopics;
    if (req.body.progressAndAgreements !== undefined) updateData.progress_and_agreements = req.body.progressAndAgreements;
    if (req.body.issuesAndDisagreements !== undefined) updateData.issues_and_disagreements = req.body.issuesAndDisagreements;
    if (req.body.topicsForNextMeeting !== undefined) updateData.topics_for_next_meeting = req.body.topicsForNextMeeting;
    if (req.body.networkCommunication !== undefined) updateData.network_communication = req.body.networkCommunication;
    if (req.body.nextMeetingDate !== undefined) updateData.next_meeting_date = req.body.nextMeetingDate;
    if (req.body.status !== undefined) updateData.status = req.body.status;

    const { data, error } = await supabase
      .from('cr_reports')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (error) return res.status(500).json({ error: error.message });
    return res.json(data);
  }

  return res.status(405).json({ error: 'Method not allowed' });
}
