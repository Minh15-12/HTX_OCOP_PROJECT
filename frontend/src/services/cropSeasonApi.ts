import { apiClient } from './apiClient';

export type CropSeasonStatus = 'PLANNED' | 'ACTIVE' | 'HARVESTING' | 'COMPLETED' | 'CANCELLED';

export interface CropSeason {
  id: string;
  production_unit_id: string;
  unit_code?: string | null;
  unit_name?: string | null;
  name: string;
  crop: string;
  seed_supplier?: string | null;
  seedling_standard_checklist?: any;
  buyer_contract_info?: any;
  puc_quota_kg?: number | null;
  logbook_status?: 'ACTIVE' | 'FROZEN_ARCHIVED';
  logbook_frozen_at?: string | null;
  logbook_final_hash?: string | null;
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
  seed_supplier?: string | null;
  seedling_standard_checklist?: any;
  buyer_contract_info?: any;
  puc_quota_kg?: number | null;
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

export function getStoredSeasons(): CropSeason[] {
  try {
    const raw = localStorage.getItem(SEASONS_STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) return parsed;
    }
  } catch (e) {
    console.error('Error reading crop seasons from localStorage', e);
  }
  return [];
}

export function saveSeasonsToStorage(seasons: CropSeason[]): void {
  try {
    localStorage.setItem(SEASONS_STORAGE_KEY, JSON.stringify(seasons));
  } catch (e) {
    console.error('Error saving crop seasons to localStorage', e);
  }
}

export async function fetchCropSeasons(filters: CropSeasonFilters = {}): Promise<CropSeason[]> {
  const res: any = await apiClient.get('/crop-seasons', { params: filters });
  const list = res.data?.data || res.data || [];
  return Array.isArray(list) ? list : [];
}

export async function fetchCropSeason(id: string): Promise<CropSeason | null> {
  const res: any = await apiClient.get(`/crop-seasons/${id}`);
  return res.data?.data || res.data || null;
}

export async function createCropSeason(payload: CropSeasonFormData): Promise<CropSeason> {
  const res: any = await apiClient.post('/crop-seasons', payload);
  return res.data?.data || res.data;
}

export async function updateCropSeason(id: string, payload: Partial<CropSeasonFormData>): Promise<CropSeason> {
  const res: any = await apiClient.patch(`/crop-seasons/${id}`, payload);
  return res.data?.data || res.data;
}

export async function closeCropSeason(id: string): Promise<CropSeason> {
  const res: any = await apiClient.post(`/crop-seasons/${id}/close`);
  return res.data?.data || res.data;
}

export async function fetchSeasonMaterialReconciliations(seasonId: string): Promise<any[]> {
  const res: any = await apiClient.get(`/crop-seasons/${seasonId}/material-reconciliations`);
  const list = res.data?.data || res.data || [];
  return Array.isArray(list) ? list : [];
}

export async function saveSeasonMaterialReconciliations(seasonId: string, items: any[]): Promise<any[]> {
  const res: any = await apiClient.post(`/crop-seasons/${seasonId}/material-reconciliations`, { items });
  const list = res.data?.data || res.data || [];
  return Array.isArray(list) ? list : [];
}

export async function freezeSeasonLogbook(seasonId: string): Promise<CropSeason> {
  const res: any = await apiClient.post(`/crop-seasons/${seasonId}/freeze-logbook`);
  return res.data?.data || res.data;
}

export interface CropSeasonPlotAllocation {
  id: string;
  crop_season_id: string;
  plot_id: string;
  plot_code?: string;
  plot_area?: number | null;
  plot_status?: string;
  plot_quarantine_until?: string | null;
  member_id?: string | null;
  member_code?: string | null;
  member_name?: string | null;
  member_phone?: string | null;
  allocated_area: number;
  crop_variety?: string | null;
  planting_date: string;
  expected_harvest_start: string;
  expected_harvest_end: string;
  target_yield_kg: number;
  actual_harvested_kg: number;
  status: 'PLANNED' | 'PLANTED' | 'GROWING' | 'HARVESTING' | 'COMPLETED' | 'CANCELLED';
  notes?: string | null;
  created_at?: string;
}

export interface AllocatePlotFormData {
  plot_id: string;
  member_id?: string | null;
  allocated_area: number;
  crop_variety?: string;
  planting_date: string;
  expected_harvest_start: string;
  expected_harvest_end: string;
  target_yield_kg?: number;
  status?: string;
  notes?: string;
}

export interface CropSeasonBomItem {
  id: string;
  crop_season_id: string;
  material_id: string;
  material_name?: string;
  sku?: string;
  unit?: string;
  category?: string;
  stage_phase?: string | null;
  standard_rate_per_sqm: number;
  planned_quantity: number;
  issued_quantity: number;
  estimated_unit_price: number;
  estimated_total_cost: number;
  notes?: string | null;
}

export interface SupplyDemandBalance {
  crop_season_id: string;
  season_name: string;
  buyer_name: string;
  phc_code?: string | null;
  buyer_contract_quantity_kg: number;
  total_committed_quantity_kg: number;
  total_actual_harvested_kg: number;
  fulfillment_rate_percent: number;
  commitment_coverage_percent: number;
  commitment_gap_kg: number;
  is_shortage: boolean;
  is_surplus: boolean;
  anomaly_high_yield: boolean;
  anomaly_low_yield: boolean;
}

export async function fetchSeasonPlots(seasonId: string): Promise<CropSeasonPlotAllocation[]> {
  const res: any = await apiClient.get(`/crop-seasons/${seasonId}/plots`);
  const list = res.data?.data || res.data || [];
  return Array.isArray(list) ? list : [];
}

export async function allocateSeasonPlot(seasonId: string, payload: AllocatePlotFormData): Promise<CropSeasonPlotAllocation> {
  const res: any = await apiClient.post(`/crop-seasons/${seasonId}/plots`, payload);
  return res.data?.data || res.data;
}

export async function removeSeasonPlot(seasonId: string, plotId: string): Promise<void> {
  await apiClient.delete(`/crop-seasons/${seasonId}/plots/${plotId}`);
}

export async function fetchSeasonBoms(seasonId: string): Promise<CropSeasonBomItem[]> {
  const res: any = await apiClient.get(`/crop-seasons/${seasonId}/boms`);
  const list = res.data?.data || res.data || [];
  return Array.isArray(list) ? list : [];
}

export async function saveSeasonBoms(seasonId: string, items: Partial<CropSeasonBomItem>[]): Promise<CropSeasonBomItem[]> {
  const res: any = await apiClient.post(`/crop-seasons/${seasonId}/boms`, { items });
  const list = res.data?.data || res.data || [];
  return Array.isArray(list) ? list : [];
}

export async function fetchSeasonSupplyDemand(seasonId: string): Promise<SupplyDemandBalance> {
  const res: any = await apiClient.get(`/crop-seasons/${seasonId}/supply-demand`);
  return res.data?.data || res.data;
}

export interface BomPresetItem {
  stage_phase: string;
  stage_name: string;
  material: {
    material_id?: string | null;
    material_name: string;
    sku: string;
    unit: string;
    unit_price: number;
  };
  standard_rate_per_sqm: number;
  notes?: string;
}

export interface BomPreset {
  preset_code: string;
  preset_name: string;
  applicable_crop: string;
  description: string;
  items: BomPresetItem[];
}

export async function bulkAllocateSeasonPlots(
  seasonId: string,
  payload: {
    plot_ids: string[];
    planting_date?: string;
    expected_harvest_start?: string;
    expected_harvest_end?: string;
    crop_variety?: string;
    status?: string;
    notes?: string;
  }
): Promise<CropSeasonPlotAllocation[]> {
  const res: any = await apiClient.post(`/crop-seasons/${seasonId}/plots/bulk`, payload);
  const list = res.data?.data || res.data || [];
  return Array.isArray(list) ? list : [];
}

export async function fetchBomPresets(crop?: string): Promise<BomPreset[]> {
  const res: any = await apiClient.get('/crop-seasons/bom-presets', { params: { crop } });
  const list = res.data?.data || res.data || [];
  return Array.isArray(list) ? list : [];
}