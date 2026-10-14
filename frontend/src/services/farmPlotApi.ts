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
  area: number;
  status: string;
  safe_harvest_date?: string | null;
  gps_coordinates?: string | null;
  land_relation?: any;
  created_at?: string;
  assignments?: MemberAssignment[];
}

export interface FarmPlotFormData {
  plot_code: string;
  area: number;
  land_relation?: any;
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
  location?: any;
  registration_information?: any;
}

const UNITS_STORAGE_KEY = 'htx_ocop_production_units_db';
const PLOTS_STORAGE_KEY = 'htx_ocop_farm_plots_db';

const initialProductionUnits: ProductionUnit[] = [
  {
    id: 'pu-01',
    unit_code: 'VT-DALAT-01',
    name: 'Vùng trồng Ớt Chuông Sweet Palermo Hòn Bồ (Phường 12 - Đà Lạt)',
    crop: 'Ớt chuông Sweet Palermo Đỏ',
    area: 15.0,
    status: 'ACTIVE',
    puc_code: 'PUC-49-015-9923',
    puc_status: 'ACTIVE',
  },
  {
    id: 'pu-02',
    unit_code: 'VT-DASAR-02',
    name: 'Vùng trồng Liên Kết Đạ Sar - Lạc Dương (HTX Tân Tiến)',
    crop: 'Ớt chuông Sweet Palermo Đỏ & Vàng',
    area: 12.5,
    status: 'ACTIVE',
    puc_code: 'PUC-49-015-9924',
    puc_status: 'ACTIVE',
  },
  {
    id: 'pu-03',
    unit_code: 'VT-DANHIM-03',
    name: 'Vùng Trồng Công Nghệ Cao Đơn Dương',
    crop: 'Ớt chuông Sweet Palermo Đỏ Baby',
    area: 8.5,
    status: 'ACTIVE',
    puc_code: 'PUC-49-018-0045',
    puc_status: 'UNDER_PUC_REVIEW',
  },
];

const initialPlots: FarmPlot[] = [
  { id: 'plot-101', production_unit_id: 'pu-01', plot_code: 'PLOT-TT-XV001-01', area: 4.5, status: 'ACTIVE', gps_coordinates: '11.9501° N, 108.4712° E', unit_name: 'Nhà kính Hòn Bồ 01' },
  { id: 'plot-102', production_unit_id: 'pu-01', plot_code: 'PLOT-TT-XV001-02', area: 4.0, status: 'IN_QUARANTINE', safe_harvest_date: '2026-10-20', gps_coordinates: '11.9510° N, 108.4720° E', unit_name: 'Nhà kính Hòn Bồ 02' },
  { id: 'plot-103', production_unit_id: 'pu-01', plot_code: 'PLOT-TT-XV002-01', area: 6.5, status: 'ACTIVE', gps_coordinates: '11.9525° N, 108.4735° E', unit_name: 'Nhà kính Hòn Bồ 03' },
  { id: 'plot-201', production_unit_id: 'pu-02', plot_code: 'PLOT-TT-XV003-01', area: 5.0, status: 'IN_QUARANTINE', safe_harvest_date: '2026-10-18', gps_coordinates: '11.9404° N, 108.4583° E', unit_name: 'Thửa Đất Đạ Sar 01' },
  { id: 'plot-202', production_unit_id: 'pu-02', plot_code: 'PLOT-TT-XV003-02', area: 7.5, status: 'ACTIVE', gps_coordinates: '11.9412° N, 108.4590° E', unit_name: 'Thửa Đất Đạ Sar 02' },
  { id: 'plot-301', production_unit_id: 'pu-03', plot_code: 'PLOT-TT-XV004-01', area: 8.5, status: 'FALLOW', gps_coordinates: '11.9600° N, 108.4800° E', unit_name: 'Thửa Nghỉ Cải Tạo Đơn Dương' },
];

export function getStoredProductionUnits(): ProductionUnit[] {
  try {
    const raw = localStorage.getItem(UNITS_STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) return parsed;
    }
  } catch (e) {
    console.error('Error reading production units from localStorage', e);
  }
  return initialProductionUnits;
}

export function saveProductionUnitsToStorage(units: ProductionUnit[]): void {
  try {
    localStorage.setItem(UNITS_STORAGE_KEY, JSON.stringify(units));
  } catch (e) {
    console.error('Error saving production units to localStorage', e);
  }
}

export function getAllStoredPlots(): FarmPlot[] {
  try {
    const raw = localStorage.getItem(PLOTS_STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) return parsed;
    }
  } catch (e) {
    console.error('Error reading farm plots from localStorage', e);
  }
  return initialPlots;
}

export function saveAllPlotsToStorage(plots: FarmPlot[]): void {
  try {
    localStorage.setItem(PLOTS_STORAGE_KEY, JSON.stringify(plots));
  } catch (e) {
    console.error('Error saving farm plots to localStorage', e);
  }
}

export const savePlotsToStorage = saveAllPlotsToStorage;

export function getStoredPlotsByUnit(unitId: string): FarmPlot[] {
  const all = getAllStoredPlots();
  return all.filter((p) => p.production_unit_id === unitId);
}

// APIs with Hybrid Fallback
export async function fetchProductionUnits(params: { search?: string; status?: string; per_page?: number } = {}) {
  try {
    const res: any = await apiClient.get('/production-units', { params });
    const list = res?.data ?? res ?? [];
    if (Array.isArray(list) && list.length > 0) {
      saveProductionUnitsToStorage(list);
      return res;
    }
  } catch (err) {
    console.warn('API fetchProductionUnits notice, using local fallback:', err);
  }
  return { data: getStoredProductionUnits() };
}

export async function createProductionUnit(payload: {
  unit_code: string;
  name: string;
  crop: string;
  area: number;
  puc_code?: string;
  cooperative_id?: string;
  location?: any;
  registration_information?: any;
}) {
  try {
    return await apiClient.post('/production-units', payload);
  } catch (err) {
    console.warn('API createProductionUnit notice, using local fallback:', err);
    const list = getStoredProductionUnits();
    const newUnit: ProductionUnit = {
      id: `pu-${Date.now()}`,
      unit_code: payload.unit_code,
      name: payload.name,
      crop: payload.crop,
      area: Number(payload.area),
      status: 'ACTIVE',
      puc_code: payload.puc_code || `PUC-49-${Math.floor(100 + Math.random() * 900)}-${Math.floor(1000 + Math.random() * 9000)}`,
      puc_status: 'ACTIVE',
    };
    const updated = [newUnit, ...list];
    saveProductionUnitsToStorage(updated);
    return { data: newUnit };
  }
}

export async function updateProductionUnit(
  id: string,
  payload: Partial<Pick<ProductionUnit, 'name' | 'crop' | 'area' | 'status' | 'puc_code' | 'puc_status'>>
) {
  try {
    return await apiClient.patch(`/production-units/${id}`, payload);
  } catch (err) {
    console.warn('API updateProductionUnit notice, using local fallback:', err);
    const list = getStoredProductionUnits();
    const updated = list.map((u) => (u.id === id ? { ...u, ...payload } : u));
    saveProductionUnitsToStorage(updated);
    return { data: updated.find((u) => u.id === id) };
  }
}

export async function fetchPlotsByUnit(unitId: string) {
  try {
    const res: any = await apiClient.get(`/production-units/${unitId}/plots`);
    const list = res?.data ?? res ?? [];
    if (Array.isArray(list) && list.length > 0) {
      return res;
    }
  } catch (err) {
    console.warn(`API fetchPlotsByUnit(${unitId}) notice, using local fallback:`, err);
  }
  return { data: getStoredPlotsByUnit(unitId) };
}

export async function createPlot(unitId: string, payload: FarmPlotFormData) {
  try {
    return await apiClient.post(`/production-units/${unitId}/plots`, payload);
  } catch (err) {
    console.warn('API createPlot notice, using local fallback:', err);
    const allPlots = getAllStoredPlots();
    const newPlot: FarmPlot = {
      id: `plot-${Date.now()}`,
      production_unit_id: unitId,
      plot_code: payload.plot_code,
      area: Number(payload.area),
      status: 'ACTIVE',
    };
    allPlots.push(newPlot);
    saveAllPlotsToStorage(allPlots);
    return { data: newPlot };
  }
}

export async function fetchPlotMemberAssignments(plotId: string): Promise<MemberAssignment[]> {
  try {
    const res: any = await apiClient.get(`/farm-plots/${plotId}/member-assignments`);
    const list = res?.data ?? res ?? [];
    if (Array.isArray(list)) return list;
  } catch (err) {
    console.warn(`API fetchPlotMemberAssignments(${plotId}) notice:`, err);
  }
  return [
    { id: 'ma-1', member_id: 'mem-001', member_name: 'Nguyễn Văn A', member_code: 'TV001', role: 'Trưởng nhóm phụ trách', assigned_date: '2024-01-10' },
    { id: 'ma-2', member_id: 'mem-003', member_name: 'Lê Văn C', member_code: 'TV003', role: 'Xã viên canh tác', assigned_date: '2024-03-20' },
  ];
}

export async function assignMemberToPlot(plotId: string, payload: { member_id: string; role: string }) {
  try {
    return await apiClient.post(`/farm-plots/${plotId}/member-assignments`, payload);
  } catch (err) {
    console.warn('API assignMemberToPlot notice:', err);
    return { data: { id: `ma-${Date.now()}`, member_id: payload.member_id, role: payload.role, assigned_date: new Date().toISOString().slice(0, 10) } };
  }
}
