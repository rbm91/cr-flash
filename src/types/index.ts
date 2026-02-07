export interface User {
  id: number;
  name: string;
  email: string;
  role: 'manager' | 'admin';
}

export interface Report {
  id: number;
  user_id: number;
  status: 'draft' | 'submitted';
  gt_commission: string | null;
  meeting_date: string | null;
  agenda: string | null;
  meeting_vibe: number | null;
  rules_respect: number | null;
  discussed_topics: string | null;
  progress_and_agreements: string | null;
  issues_and_disagreements: string | null;
  topics_for_next_meeting: string | null;
  network_communication: string | null;
  next_meeting_date: string | null;
  created_at: string | null;
  updated_at: string | null;
  userName?: string | null;
}

export interface ReportFormData {
  gtCommission?: string;
  meetingDate?: string;
  agenda?: string;
  meetingVibe?: number;
  rulesRespect?: number;
  discussedTopics?: string;
  progressAndAgreements?: string;
  issuesAndDisagreements?: string;
  topicsForNextMeeting?: string;
  networkCommunication?: string;
  nextMeetingDate?: string;
}

export interface ReportHistoryEntry {
  id: number;
  report_id: number;
  editor_id: number;
  changes: any;
  edited_at: string | null;
  editorName: string | null;
}

export interface GtCommission {
  id: number;
  name: string;
}

export interface Manager {
  id: number;
  name: string;
  email: string;
}
