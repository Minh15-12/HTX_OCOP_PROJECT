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

const SEASONS_STORAGE_KEY = 'htx_ocop_crop_seasons_db';

const initialSeasons: CropSeason[] = [
  {
    id: 'cs-01',
    production_unit_id: 'pu-01',
    unit_code: 'VT-LAMHA-01',
    unit_name: 'Vùng trồng Cà phê Arabica Cầu Đất',
    name: 'Mùa Vụ Thu Hoạch Cà Phê 2025–2026',
    crop: 'Cà phê Arabica',
    start_date: '2025-10-01',
    expected_end_date: '2026-03-31',
    status: 'ACTIVE',
  },
  {
    id: 'cs-02',
    production_unit_id: 'pu-02',
    unit_code: 'VT-DALAT-02',
    unit_name: 'Vùng trồng Ớt Chuông Sweet Palermo',
    name: 'Vụ Đông Xuân Ớt Chuông Sweet Palermo 2026',
    crop: 'Ớt chuông Sweet Palermo',
    start_date: '2025-11-15',
    expected_end_date: '2026-04-30',
    status: 'ACTIVE',
  },
  {
    id: 'cs-03',
    production_unit_id: 'pu-03',
    unit_code: 'VT-TEAML-03',
    unit_name: 'Vùng Chè Shan Tuyết Cổ Thụ',
    name: 'Vụ Chè Xuân 2026',
    crop: 'Chè Shan Tuyết',
    start_date: '2026-01-01',
    expected_end_date: '2026-06-30',
    status: 'PLANNED',
  },
];

export function getStoredSeasons(): CropSeason[] {
  try {
    const raw = localStorage.getItem(SEASONS_STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) return parsed;
    }
  } catch (e) {
    console.error('Error reading crop seasons from localStorage', e);
  }
  return initialSeasons;
}

export function saveSeasonsToStorage(seasons: CropSeason[]): void {
  try {
    localStorage.setItem(SEASONS_STORAGE_KEY, JSON.stringify(seasons));
  } catch (e) {
    console.error('Error saving crop seasons to localStorage', e);
  }
}

export async function fetchCropSeasons(filters: CropSeasonFilters = {}) {
  try {
    const res: any = await apiClient.get('/crop-seasons', { params: filters });
    const list = res?.data ?? res ?? [];
    if (Array.isArray(list) && list.length > 0) {
      saveSeasonsToStorage(list);
      return res;
    }
  } catch (err) {
    console.warn('API fetchCropSeasons notice, using local fallback:', err);
  }
  return { data: getStoredSeasons() };
}

export async function fetchCropSeason(id: string) {
  try {
    return await apiClient.get(`/crop-seasons/${id}`);
  } catch (err) {
    const list = getStoredSeasons();
    const found = list.find((s) => s.id === id);
    return { data: found || null };
  }
}

export async function createCropSeason(payload: CropSeasonFormData) {
  try {
    return await apiClient.post('/crop-seasons', payload);
  } catch (err) {
    console.warn('API createCropSeason notice, using local fallback:', err);
    const list = getStoredSeasons();
    const newSeason: CropSeason = {
      id: `cs-${Date.now()}`,
      production_unit_id: payload.production_unit_id,
      name: payload.name,
      crop: payload.crop,
      start_date: payload.start_date,
      expected_end_date: payload.expected_end_date,
      status: 'ACTIVE',
    };
    const updated = [newSeason, ...list];
    saveSeasonsToStorage(updated);
    return { data: newSeason };
  }
}

export async function updateCropSeason(id: string, payload: Partial<CropSeasonFormData>) {
  try {
    return await apiClient.patch(`/crop-seasons/${id}`, payload);
  } catch (err) {
    console.warn('API updateCropSeason notice, using local fallback:', err);
    const list = getStoredSeasons();
    const updated = list.map((s) => (s.id === id ? { ...s, ...payload } : s));
    saveSeasonsToStorage(updated);
    return { data: updated.find((s) => s.id === id) };
  }
}

export async function closeCropSeason(id: string) {
  try {
    return await apiClient.post(`/crop-seasons/${id}/close`);
  } catch (err) {
    const list = getStoredSeasons();
    const updated = list.map((s) => (s.id === id ? { ...s, status: 'COMPLETED' as CropSeasonStatus } : s));
    saveSeasonsToStorage(updated);
    return { data: updated.find((s) => s.id === id) };
  }
}