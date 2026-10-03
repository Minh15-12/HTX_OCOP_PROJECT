export type SeasonStatus = 'chua_bat_dau' | 'dang_dien_ra' | 'da_ket_thuc' | 'da_dong';

export const SEASON_STATUS_LABELS: Record<SeasonStatus, string> = {
  chua_bat_dau: 'Chưa bắt đầu',
  dang_dien_ra: 'Đang diễn ra',
  da_ket_thuc: 'Đã kết thúc',
  da_dong: 'Đã đóng vụ',
};

export const SEASON_STATUS_STYLES: Record<SeasonStatus, string> = {
  chua_bat_dau: 'bg-gray-100 text-gray-600',
  dang_dien_ra: 'bg-green-100 text-green-700',
  da_ket_thuc: 'bg-blue-100 text-blue-700',
  da_dong: 'bg-amber-100 text-amber-700',
};

export interface Season {
  id: number;
  code: string;
  name: string;
  vung_trong_id: number | null;
  vung_trong_name: string | null;
  crop: string;
  variety: string | null;
  farming_method: string | null;
  area: number;
  start_date: string;
  end_date: string;
  target_yield: number;
  actual_yield: number | null;
  status: SeasonStatus;
  status_label: string;
  manager_name: string | null;
  notes: string | null;
  closed_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface SeasonFormData {
  code: string;
  name: string;
  vung_trong_id?: number | null;
  crop: string;
  variety?: string;
  farming_method?: string;
  area: number;
  start_date: string;
  end_date: string;
  target_yield: number;
  manager_name?: string;
  notes?: string;
}

export interface SeasonStats {
  total_seasons: number;
  total_area: number;
  total_target_yield: number;
  in_progress: number;
  area_by_season: { name: string; area: number }[];
  crop_composition: { crop: string; area: number; percent: number }[];
}

export interface PaginationMeta {
  current_page: number;
  last_page: number;
  per_page: number;
  total: number;
}

export interface SeasonFilters {
  search?: string;
  year?: number;
  crop?: string;
  status?: SeasonStatus | '';
  page?: number;
  per_page?: number;
}
