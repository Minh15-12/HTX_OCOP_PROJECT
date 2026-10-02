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

const CROP_SEASONS_STORAGE_KEY = 'htx_ocop_crop_seasons_db';

const initialCropSeasons: CropSeason[] = [
  {
    id: 'cs-01',
    production_unit_id: 'pu-01',
    unit_code: 'VT-LUA-01',
    unit_name: 'Cánh Đồng Lúa ST25 - Vùng 1',
    name: 'Đông Xuân 2025-2026 - Lúa ST25',
    crop: 'Lúa ST25',
    start_date: '2025-11-15',
    expected_end_date: '2026-03-20',
    status: 'ACTIVE',
  },
  {
    id: 'cs-02',
    production_unit_id: 'pu-02',
    unit_code: 'VT-BUOI-02',
    unit_name: 'Vùng Bưởi Da Xanh Xuất Khẩu',
    name: 'Mùa Vụ Bưởi Tết 2026',
    crop: 'Bưởi Da Xanh',
    start_date: '2025-06-01',
    expected_end_date: '2026-02-10',
    status: 'HARVESTING',
  },
  {
    id: 'cs-03',
    production_unit_id: 'pu-03',
    unit_code: 'VT-XOAI-03',
    unit_name: 'Vùng Xoài Cát Hòa Lộc',
    name: 'Hè Thu 2026 - Chuẩn bị đất',
    crop: 'Xoài Cát Hòa Lộc',
    start_date: '2026-04-01',
    expected_end_date: '2026-08-30',
    status: 'PLANNED',
  },
];

export function getStoredCropSeasons(): CropSeason[] {
  try {
    const raw = localStorage.getItem(CROP_SEASONS_STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) return parsed;
    }
  } catch (e) {
    console.error('Error reading crop seasons from localStorage', e);
  }
  return initialCropSeasons;
}

export function saveCropSeasonsToStorage(seasons: CropSeason[]): void {
  try {
    localStorage.setItem(CROP_SEASONS_STORAGE_KEY, JSON.stringify(seasons));
  } catch (e) {
    console.error('Error saving crop seasons to localStorage', e);
  }
}

// APIs with Hybrid Fallback
export async function fetchCropSeasons(filters: CropSeasonFilters = {}) {
  try {
    const res: any = await apiClient.get('/crop-seasons', { params: filters });
    const list = res?.data ?? res ?? [];
    if (Array.isArray(list) && list.length > 0) {
      saveCropSeasonsToStorage(list);
      return res;
    }
  } catch (err) {
    console.warn('API fetchCropSeasons warning, using local fallback:', err);
  }
  return { data: getStoredCropSeasons() };
}

export async function fetchCropSeason(id: string) {
  try {
    return await apiClient.get(`/crop-seasons/${id}`);
  } catch (err) {
    const seasons = getStoredCropSeasons();
    const found = seasons.find((s) => s.id === id);
    return { data: found || null };
  }
}

export async function createCropSeason(payload: CropSeasonFormData) {
  try {
    return await apiClient.post('/crop-seasons', payload);
  } catch (err) {
    console.warn('API createCropSeason warning, using local fallback:', err);
    const list = getStoredCropSeasons();
    const newSeason: CropSeason = {
      id: `cs-${Date.now()}`,
      ...payload,
      status: 'PLANNED',
      created_at: new Date().toISOString(),
    };
    saveCropSeasonsToStorage([newSeason, ...list]);
    return { data: newSeason };
  }
}

export async function updateCropSeason(id: string, payload: Partial<CropSeasonFormData>) {
  try {
    return await apiClient.patch(`/crop-seasons/${id}`, payload);
  } catch (err) {
    console.warn('API updateCropSeason warning, using local fallback:', err);
    const list = getStoredCropSeasons();
    const updated = list.map((s) => (s.id === id ? { ...s, ...payload } : s));
    saveCropSeasonsToStorage(updated);
    return { data: updated.find((s) => s.id === id) };
  }
}

export async function closeCropSeason(id: string) {
  try {
    return await apiClient.post(`/crop-seasons/${id}/close`);
  } catch (err) {
    console.warn('API closeCropSeason warning, using local fallback:', err);
    const list = getStoredCropSeasons();
    const updated = list.map((s) =>
      s.id === id
        ? {
            ...s,
            status: 'COMPLETED' as const,
            actual_end_date: new Date().toISOString().slice(0, 10),
          }
        : s
    );
    saveCropSeasonsToStorage(updated);
    return { data: updated.find((s) => s.id === id) };
  }
}