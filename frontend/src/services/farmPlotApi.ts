import { apiClient } from './apiClient';

export type PlotStatus = 'ACTIVE' | 'IN_QUARANTINE' | 'FALLOW' | 'INACTIVE' | 'PREPARING';

export interface MemberAssignment {
  id: string;
  member_id: string;
  member_name: string;
  member_code: string;
  role: string;
  assigned_date: string;
}

export interface FarmPlot {
  id: string;
  production_unit_id: string;
  unit_code?: string | null;
  unit_name?: string | null;
  plot_code: string;
  national_cadastral_code?: string | null;
  land_sheet_number?: string | null;
  land_parcel_number?: string | null;
  substrate_bag_count?: number | null;
  planting_density_per_sqm?: number | null;
  greenhouse_type?: string | null;
  area: number;
  status: string;
  quarantine_until?: string | null;
  safe_harvest_date?: string | null;
  is_in_quarantine?: boolean;
  gps_coordinates?: string | null;
  land_relation?: any;
  geometry_geojson?: any;
  vn2000_coordinates?: any;
  max_yield_rate_per_sqm?: number | null;
  max_harvest_quota_kg?: number;
  land_contract_expired_at?: string | null;
  is_contract_expired?: boolean;
  created_at?: string;
  assignments?: MemberAssignment[];
}

export interface FarmPlotFormData {
  unit_id?: string;
  plot_code: string;
  area: number;
  status?: string;
  safe_harvest_date?: string | null;
  gps_coordinates?: string | null;
  national_cadastral_code?: string | null;
  land_sheet_number?: string | null;
  land_parcel_number?: string | null;
  substrate_bag_count?: number | null;
  planting_density_per_sqm?: number | null;
  greenhouse_type?: string | null;
  land_relation?: any;
  geometry_geojson?: any;
  vn2000_coordinates?: any;
  max_yield_rate_per_sqm?: number | null;
  land_contract_expired_at?: string | null;
}

export interface ProductionUnit {
  id: string;
  unit_code: string;
  name: string;
  crop: string;
  area: number;
  status: string;
  puc_code?: string | null;
  puc_status?: 'ACTIVE' | 'INACTIVE' | 'UNDER_PUC_REVIEW';
  gps_coordinates?: string | null;
  plots_count?: number;
  location?: {
    latitude?: number;
    longitude?: number;
    lat?: number;
    lng?: number;
    address?: string;
    commune?: string;
    district?: string;
    province?: string;
    polygon_coordinates?: [number, number][];
  } | any;
  registration_information?: {
    puc_code?: string;
    puc_issue_date?: string;
    puc_expiry_date?: string;
    standard?: string;
    technician_name?: string;
    technician_phone?: string;
    water_source?: string;
    greenhouse_type?: string;
  } | any;
}

export interface ProductionUnitPayload {
  unit_code: string;
  name: string;
  crop: string;
  area: number;
  puc_code?: string;
  puc_status?: string;
  status?: string;
  cooperative_id?: string;
  location?: {
    latitude?: number;
    longitude?: number;
    lat?: number;
    lng?: number;
    address?: string;
    commune?: string;
    district?: string;
    province?: string;
    polygon_coordinates?: [number, number][];
  } | any;
  registration_information?: {
    puc_code?: string;
    puc_issue_date?: string;
    puc_expiry_date?: string;
    standard?: string;
    technician_name?: string;
    technician_phone?: string;
    water_source?: string;
    greenhouse_type?: string;
  } | any;
}

const PLOTS_STORAGE_KEY = 'htx_ocop_farm_plots_db';

export function getAllStoredPlots(): FarmPlot[] {
  try {
    const raw = localStorage.getItem(PLOTS_STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) return parsed;
    }
  } catch (e) {
    console.error('Error reading farm plots from localStorage', e);
  }
  return [];
}

export function saveAllPlotsToStorage(plots: FarmPlot[]): void {
  try {
    localStorage.setItem(PLOTS_STORAGE_KEY, JSON.stringify(plots));
  } catch (e) {
    console.error('Error saving farm plots to localStorage', e);
  }
}

// Production Units APIs
export async function fetchProductionUnits(params: { search?: string; status?: string; crop?: string; per_page?: number } = {}) {
  const res: any = await apiClient.get('/production-units', { params });
  return res.data?.data || res.data || [];
}

export async function createProductionUnit(payload: ProductionUnitPayload) {
  const res: any = await apiClient.post('/production-units', payload);
  return res.data?.data || res.data;
}

export async function updateProductionUnit(
  id: string,
  payload: Partial<ProductionUnitPayload>
) {
  const res: any = await apiClient.patch(`/production-units/${id}`, payload);
  return res.data?.data || res.data;
}

// Farm Plots APIs
export async function fetchPlotsByUnit(unitId: string): Promise<FarmPlot[]> {
  const res: any = await apiClient.get(`/production-units/${unitId}/plots`);
  const list = res.data?.data || res.data || [];
  return Array.isArray(list) ? list : [];
}

export async function createPlot(unitId: string, payload: FarmPlotFormData): Promise<FarmPlot> {
  const res: any = await apiClient.post(`/production-units/${unitId}/plots`, {
    plot_code: payload.plot_code,
    area: Number(payload.area),
    status: payload.status || 'ACTIVE',
    land_relation: payload.land_relation,
    national_cadastral_code: payload.national_cadastral_code,
    land_sheet_number: payload.land_sheet_number,
    land_parcel_number: payload.land_parcel_number,
    substrate_bag_count: payload.substrate_bag_count,
    planting_density_per_sqm: payload.planting_density_per_sqm,
    greenhouse_type: payload.greenhouse_type,
    geometry_geojson: payload.geometry_geojson,
    vn2000_coordinates: payload.vn2000_coordinates,
    max_yield_rate_per_sqm: payload.max_yield_rate_per_sqm,
    land_contract_expired_at: payload.land_contract_expired_at,
  });
  return res.data?.data || res.data;
}

export async function updatePlot(
  unitId: string,
  plotId: string,
  payload: Partial<FarmPlot>
): Promise<FarmPlot> {
  const res: any = await apiClient.patch(`/farm-plots/${plotId}`, {
    ...payload,
    ...(payload.area !== undefined ? { area: Number(payload.area) } : {}),
  });
  return res.data?.data || res.data;
}

export async function deletePlot(unitId: string, plotId: string): Promise<boolean> {
  await apiClient.delete(`/farm-plots/${plotId}`);
  return true;
}

// Member Plot Assignment APIs
export async function fetchPlotMemberAssignments(plotId: string): Promise<MemberAssignment[]> {
  const res: any = await apiClient.get(`/farm-plots/${plotId}/member-assignments`);
  const list = res.data?.data || res.data || [];
  return Array.isArray(list) ? list : [];
}

export async function assignMemberToPlot(plotId: string, payload: { member_id: string; role?: string; assignment_type?: string }) {
  const res: any = await apiClient.post(`/farm-plots/${plotId}/member-assignments`, {
    member_id: payload.member_id,
    assignment_type: payload.assignment_type || payload.role || 'OWNER',
    start_date: new Date().toISOString().slice(0, 10),
  });
  return res.data?.data || res.data;
}

// Flat All Farm Plots API
export async function fetchAllPlots(params: { status?: string; crop?: string; per_page?: number; member_id?: string } = {}): Promise<FarmPlot[]> {
  const res: any = await apiClient.get('/farm-plots', { params });
  const list = res.data?.data || res.data || [];
  return Array.isArray(list) ? list : [];
}

// Member Plots API
export async function fetchPlotsByMember(memberId: string): Promise<FarmPlot[]> {
  const res: any = await apiClient.get(`/members/${memberId}/plots`);
  const list = res.data?.data || res.data || [];
  return Array.isArray(list) ? list : [];
}

