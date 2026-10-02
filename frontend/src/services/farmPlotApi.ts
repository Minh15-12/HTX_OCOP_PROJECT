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

export async function fetchPlotsByUnit(unitId: string) {
  return apiClient.get(`/production-units/${unitId}/plots`);
}

export async function fetchPlot(plotId: string) {
  return apiClient.get(`/farm-plots/${plotId}`);
}

export async function createPlot(unitId: string, payload: FarmPlotFormData) {
  return apiClient.post(`/production-units/${unitId}/plots`, payload);
}

// Production Unit (Vùng trồng)
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

export async function fetchProductionUnits(params: { search?: string; status?: string; per_page?: number } = {}) {
  return apiClient.get('/production-units', { params });
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
  return apiClient.post('/production-units', payload);
}

export async function updateProductionUnit(
  id: string,
  payload: Partial<Pick<ProductionUnit, 'name' | 'crop' | 'area' | 'status'>>
) {
  return apiClient.patch(`/production-units/${id}`, payload);
}
