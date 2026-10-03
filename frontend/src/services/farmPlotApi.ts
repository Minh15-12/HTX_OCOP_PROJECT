import { apiClient } from './apiClient';

export type PlotStatus = 'ACTIVE' | 'FALLOW' | 'PREPARING';

export interface FarmPlot {
  id: string;
  production_unit_id: string;
  unit_code?: string | null;
  unit_name?: string | null;
  plot_code: string;
  area: number;
  status: string;
  land_relation?: any;
  created_at?: string;
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
  location?: any;
  registration_information?: any;
}

const UNITS_STORAGE_KEY = 'htx_ocop_production_units_db';
const PLOTS_STORAGE_KEY = 'htx_ocop_farm_plots_db';

const initialProductionUnits: ProductionUnit[] = [
  {
    id: 'pu-01',
    unit_code: 'VT-LAMHA-01',
    name: 'Vùng trồng Cà phê Arabica Cầu Đất',
    crop: 'Cà phê Arabica',
    area: 12.5,
    status: 'ACTIVE',
  },
  {
    id: 'pu-02',
    unit_code: 'VT-DALAT-02',
    name: 'Vùng trồng Ớt Chuông Sweet Palermo',
    crop: 'Ớt chuông Sweet Palermo',
    area: 8.0,
    status: 'ACTIVE',
  },
  {
    id: 'pu-03',
    unit_code: 'VT-TEAML-03',
    name: 'Vùng Chè Shan Tuyết Cổ Thụ',
    crop: 'Chè Shan Tuyết',
    area: 5.5,
    status: 'PREPARING',
  },
];

const initialPlots: FarmPlot[] = [
  { id: 'plot-101', production_unit_id: 'pu-01', plot_code: 'TD-01-CAPHE', area: 4.5, status: 'ACTIVE' },
  { id: 'plot-102', production_unit_id: 'pu-01', plot_code: 'TD-02-CAPHE', area: 4.0, status: 'ACTIVE' },
  { id: 'plot-103', production_unit_id: 'pu-01', plot_code: 'TD-03-CAPHE', area: 4.0, status: 'ACTIVE' },
  { id: 'plot-201', production_unit_id: 'pu-02', plot_code: 'TD-01-OTCHUONG', area: 5.0, status: 'ACTIVE' },
  { id: 'plot-202', production_unit_id: 'pu-02', plot_code: 'TD-02-OTCHUONG', area: 3.0, status: 'ACTIVE' },
  { id: 'plot-301', production_unit_id: 'pu-03', plot_code: 'TD-01-CHE', area: 5.5, status: 'PREPARING' },
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
    };
    const updated = [newUnit, ...list];
    saveProductionUnitsToStorage(updated);
    return { data: newUnit };
  }
}

export async function updateProductionUnit(
  id: string,
  payload: Partial<Pick<ProductionUnit, 'name' | 'crop' | 'area' | 'status'>>
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

export async function fetchPlot(plotId: string) {
  try {
    return await apiClient.get(`/farm-plots/${plotId}`);
  } catch (err) {
    const all = getAllStoredPlots();
    const found = all.find((p) => p.id === plotId);
    return { data: found || null };
  }
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
