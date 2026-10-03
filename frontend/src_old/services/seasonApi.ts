import axios from 'axios';
import type {
  PaginationMeta,
  Season,
  SeasonFilters,
  SeasonFormData,
  SeasonStats,
} from '../types/season';

// TODO: nếu project đã có sẵn 1 axios instance dùng chung (vd: src/services/apiClient.ts
// đã gắn baseURL + token interceptor), hãy xoá đoạn "api" bên dưới và import instance đó
// thay vì tạo mới, để đảm bảo đồng bộ header Authorization.
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL ?? 'http://localhost:8000/api',
  headers: { 'Content-Type': 'application/json' },
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

export async function fetchSeasons(
  filters: SeasonFilters
): Promise<{ data: Season[]; meta: PaginationMeta }> {
  const { data } = await api.get('/seasons', { params: filters });
  return data;
}

export async function fetchSeasonStats(year?: number): Promise<SeasonStats> {
  const { data } = await api.get('/seasons/stats', { params: { year } });
  return data.data;
}

export async function fetchSeason(id: number): Promise<Season> {
  const { data } = await api.get(`/seasons/${id}`);
  return data.data;
}

export async function createSeason(payload: SeasonFormData): Promise<Season> {
  const { data } = await api.post('/seasons', payload);
  return data.data;
}

export async function updateSeason(
  id: number,
  payload: Partial<SeasonFormData>
): Promise<Season> {
  const { data } = await api.put(`/seasons/${id}`, payload);
  return data.data;
}

export async function closeSeason(id: number, actualYield?: number): Promise<Season> {
  const { data } = await api.patch(`/seasons/${id}/close`, { actual_yield: actualYield });
  return data.data;
}

export async function reopenSeason(id: number): Promise<Season> {
  const { data } = await api.patch(`/seasons/${id}/reopen`);
  return data.data;
}

export async function deleteSeason(id: number): Promise<void> {
  await api.delete(`/seasons/${id}`);
}

export default api;
