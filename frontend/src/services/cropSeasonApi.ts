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
    id: 'c05e8db9-6fb6-4fe6-8110-b73cc109fab3',
    production_unit_id: 'ac1b4829-763c-4c48-8d53-1a03a842a3fc',
    unit_code: 'VT-DALAT-01',
    unit_name: 'Vùng trồng Ớt Chuông Sweet Palermo Hòn Bồ',
    name: 'Vụ Đông Xuân 2025 - 2026 (Ớt chuông Sweet Palermo Đỏ)',
    crop: 'Ớt chuông Sweet Palermo Đỏ & Vàng',
    start_date: '2025-11-01',
    expected_end_date: '2026-04-30',
    status: 'ACTIVE',
  },
  {
    id: '03c586b3-1a08-43ab-b037-66795d2ae59c',
    production_unit_id: 'ac1b4829-763c-4c48-8d53-1a03a842a3fc',
    unit_code: 'VT-DALAT-01',
    unit_name: 'Vùng trồng Ớt Chuông Sweet Palermo Hòn Bồ',
    name: 'Vụ Thu Đông 2025 (Đã Hoàn Tất Quyết Toán)',
    crop: 'Ớt chuông Sweet Palermo & Xà lách thủy canh',
    start_date: '2025-06-01',
    expected_end_date: '2025-10-31',
    status: 'COMPLETED',
  },
  {
    id: '1497edec-88be-4b8b-bc4e-241e2a41040b',
    production_unit_id: 'ac1b4829-763c-4c48-8d53-1a03a842a3fc',
    unit_code: 'VT-DASAR-02',
    unit_name: 'Vùng trồng Liên Kết Đạ Sar',
    name: 'Vụ Hè Thu 2025 (Đã Quyết Toán VietGAP)',
    crop: 'Dâu tây giống Nhật & Cà chua Cherry',
    start_date: '2025-01-15',
    expected_end_date: '2025-05-30',
    status: 'COMPLETED',
  },
  {
    id: 'e218ce6f-787a-465b-b22c-fb599620970e',
    production_unit_id: 'ac1b4829-763c-4c48-8d53-1a03a842a3fc',
    unit_code: 'VT-DANHIM-03',
    unit_name: 'Vùng Trồng Công Nghệ Cao Đơn Dương',
    name: 'Vụ Xuân Hè 2026 (Kế Hoạch Mở Rộng OCOP)',
    crop: 'Dâu tây Hana giống Nhật & Cà chua Cherry',
    start_date: '2026-02-01',
    expected_end_date: '2026-07-31',
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