import { apiClient } from './apiClient';

export interface Meeting {
  id: string;
  cooperative_id?: string;
  meeting_type: 'ANNUAL' | 'EXTRAORDINARY' | 'BOARD' | 'DAI_HOI_THUONG_NIEN' | 'DAI_HOI_BAT_THUONG';
  meeting_date: string;
  title: string;
  description?: string | null;
  status: 'PLANNED' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED';
  votes_count?: number;
  created_at?: string;
  updated_at?: string;
}

export interface Vote {
  id: string;
  meeting_id: string;
  user_id: string;
  user?: {
    id: string;
    full_name: string;
    username: string;
  } | null;
  resolution_code: string;
  choice: 'FOR' | 'AGAINST' | 'ABSTAIN';
  weight: number;
  created_at: string;
}

export interface ResolutionSummary {
  resolution_code: string;
  total_voters: number;
  total_weight: number;
  for_count: number;
  for_weight: number;
  against_count: number;
  against_weight: number;
  abstain_count: number;
  abstain_weight: number;
  approval_percentage: number;
  is_approved: boolean;
}

export interface CreateMeetingPayload {
  meeting_type: string;
  meeting_date: string;
  title: string;
  description?: string;
  status?: string;
}

export interface CastVotePayload {
  resolution_code: string;
  choice: 'FOR' | 'AGAINST' | 'ABSTAIN';
  weight?: number;
}

export const meetingService = {
  async getMeetings(params: { status?: string; meeting_type?: string; page?: number; limit?: number } = {}): Promise<{
    data: Meeting[];
    total: number;
  }> {
    const res: any = await apiClient.get('/meetings', { params });
    const data = res.data?.data || res.data || [];
    const meta = res.meta || res.data?.meta || {};
    return {
      data: Array.isArray(data) ? data : [],
      total: meta.total ?? (Array.isArray(data) ? data.length : 0),
    };
  },

  async getMeetingById(id: string): Promise<Meeting> {
    const res: any = await apiClient.get(`/meetings/${id}`);
    return res.data?.data || res.data;
  },

  async createMeeting(payload: CreateMeetingPayload): Promise<Meeting> {
    const res: any = await apiClient.post('/meetings', payload);
    return res.data?.data || res.data;
  },

  async updateMeeting(id: string, payload: Partial<CreateMeetingPayload>): Promise<Meeting> {
    const res: any = await apiClient.patch(`/meetings/${id}`, payload);
    return res.data?.data || res.data;
  },

  async listVotes(meetingId: string, resolutionCode?: string): Promise<Vote[]> {
    const params = resolutionCode ? { resolution_code: resolutionCode } : {};
    const res: any = await apiClient.get(`/meetings/${meetingId}/votes`, { params });
    const list = res.data?.data || res.data || [];
    return Array.isArray(list) ? list : [];
  },

  async castVote(meetingId: string, payload: CastVotePayload): Promise<Vote> {
    const res: any = await apiClient.post(`/meetings/${meetingId}/votes`, payload);
    return res.data?.data || res.data;
  },

  async getResolutionsSummary(meetingId: string): Promise<ResolutionSummary[]> {
    const res: any = await apiClient.get(`/meetings/${meetingId}/resolutions-summary`);
    const list = res.data?.data || res.data || [];
    return Array.isArray(list) ? list : [];
  },
};
