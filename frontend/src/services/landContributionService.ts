import { apiClient } from './apiClient';

export interface LandContribution {
  id: string;
  contribution_id: string;
  land_certificate_no: string;
  plot_number: string;
  map_sheet_number: string;
  land_area_sqm: number;
  land_use_type: string;
  appraised_unit_price: number;
  total_land_value: number;
  cadastral_status: 'PENDING' | 'NOTARIZED' | 'REGISTERED_CHANGE';
  created_at?: string;
  updated_at?: string;
}

export interface CreateLandContributionPayload {
  land_certificate_no: string;
  plot_number: string;
  map_sheet_number: string;
  land_area_sqm: number;
  land_use_type: string;
  appraised_unit_price: number;
  total_land_value?: number;
  cadastral_status?: 'PENDING' | 'NOTARIZED' | 'REGISTERED_CHANGE';
}

export const landContributionService = {
  async getAllLandContributions(): Promise<(LandContribution & { member_name?: string })[]> {
    const res: any = await apiClient.get('/land-contributions');
    const list = res.data?.data || res.data || [];
    return Array.isArray(list) ? list : [];
  },

  async getMemberLandContributions(memberId: string): Promise<LandContribution[]> {
    const res: any = await apiClient.get(`/members/${memberId}/land-contributions`);
    const list = res.data?.data || res.data || [];
    return Array.isArray(list) ? list : [];
  },

  async createLandContribution(
    memberId: string,
    payload: CreateLandContributionPayload
  ): Promise<LandContribution> {
    const res: any = await apiClient.post(`/members/${memberId}/land-contributions`, payload);
    return res.data?.data || res.data;
  },

  async deleteLandContribution(id: string): Promise<boolean> {
    await apiClient.delete(`/land-contributions/${id}`);
    return true;
  },
};
