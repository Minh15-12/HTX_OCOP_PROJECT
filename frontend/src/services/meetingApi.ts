import { apiClient } from './apiClient';

export interface Meeting {
  id: string;
  cooperative_id?: string;
  meeting_type: 'ANNUAL' | 'EXTRAORDINARY' | 'REGULAR';
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
  user_name?: string;
  resolution_code: string;
  resolution_type?: 'REGULAR' | 'CRITICAL';
  choice: 'FOR' | 'AGAINST' | 'ABSTAIN';
  weight: number;
  created_at: string;
}

export interface ResolutionSummary {
  resolution_code: string;
  resolution_type?: 'REGULAR' | 'CRITICAL';
  required_percentage?: number;
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

export interface MeetingFilterParams {
  status?: string;
  meeting_type?: string;
  search?: string;
  page?: number;
  per_page?: number;
}

export interface CreateMeetingPayload {
  meeting_type: 'ANNUAL' | 'EXTRAORDINARY' | 'REGULAR';
  meeting_date: string;
  title: string;
  description?: string;
  status?: 'PLANNED' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED';
}

export interface CastVotePayload {
  resolution_code: string;
  resolution_type?: 'REGULAR' | 'CRITICAL';
  choice: 'FOR' | 'AGAINST' | 'ABSTAIN';
  weight?: number;
}

export interface MeetingListResponse {
  data: Meeting[];
  meta: {
    page: number;
    per_page: number;
    total: number;
    last_page: number;
  };
}

export const meetingApi = {
  async getMeetings(params?: MeetingFilterParams): Promise<MeetingListResponse> {
    const res: any = await apiClient.get('/meetings', { params });
    const items = res.data?.data || res.data || [];
    const meta = res.meta || res.data?.meta || {
      page: 1,
      per_page: items.length || 15,
      total: items.length,
      last_page: 1,
    };
    return {
      data: Array.isArray(items) ? items : [],
      meta,
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

  async getVotes(meetingId: string, resolutionCode?: string): Promise<Vote[]> {
    const res: any = await apiClient.get(`/meetings/${meetingId}/votes`, {
      params: resolutionCode ? { resolution_code: resolutionCode } : undefined,
    });
    const items = res.data?.data || res.data || [];
    return Array.isArray(items) ? items : [];
  },

  async castVote(meetingId: string, payload: CastVotePayload): Promise<Vote> {
    const res: any = await apiClient.post(`/meetings/${meetingId}/votes`, payload);
    return res.data?.data || res.data;
  },

  async getResolutionsSummary(meetingId: string): Promise<ResolutionSummary[]> {
    const res: any = await apiClient.get(`/meetings/${meetingId}/resolutions-summary`);
    const items = res.data?.data || res.data || [];
    return Array.isArray(items) ? items : [];
  },
};
