import { apiClient } from './apiClient';

export type CropSeasonStatus = 'PLANNED' | 'ACTIVE' | 'HARVESTING' | 'COMPLETED' | 'CANCELLED';

export interface CropSeason {
  id: string;
  production_unit_id: string;
  unit_code?: string | null;
  unit_name?: string | null;
  name: string;
  crop: string;
  start_date: string;
  expected_end_date: string;
  actual_end_date?: string | null;
  status: CropSeasonStatus;
  plan_information?: any;
  created_at?: string;
}

export interface CropSeasonFormData {
  production_unit_id: string;
  name: string;
  crop: string;
  start_date: string;
  expected_end_date: string;
  plan_information?: any;
}

export interface CropSeasonFilters {
  search?: string;
  status?: string;
  crop?: string;
  production_unit_id?: string;
  page?: number;
  per_page?: number;
}

export async function fetchCropSeasons(filters: CropSeasonFilters = {}) {
  return apiClient.get('/crop-seasons', { params: filters });
}

export async function fetchCropSeason(id: string) {
  return apiClient.get(`/crop-seasons/${id}`);
}

export async function createCropSeason(payload: CropSeasonFormData) {
  return apiClient.post('/crop-seasons', payload);
}

export async function updateCropSeason(id: string, payload: Partial<CropSeasonFormData>) {
  return apiClient.patch(`/crop-seasons/${id}`, payload);
}

export async function closeCropSeason(id: string) {
  return apiClient.post(`/crop-seasons/${id}/close`);
}