import { apiClient } from './apiClient';
import type { Gs1LotItem, LotLifecycleStatus } from '@/types/agriculture';
import { initialHarvests } from './harvestApi';

const LOTS_STORAGE_KEY = 'htx_ocop_gs1_lots_db';

// Initial seed lots derived from demo harvests
export const initialLots: Gs1LotItem[] = initialHarvests.map((h, idx) => ({
  id: h.lot_id || `lot-${idx + 1}`,
  lot_code: h.lot_code || `LOT-TT-DEFAULT-${idx + 1}`,
  harvest_id: h.id,
  harvest_date: h.harvest_date,
  quantity: Number(h.quantity_kg) || 0,
  remaining_quantity: Number(h.quantity_kg) || 0,
  unit: 'KG',
  status: idx === 2 ? 'PACKED' : idx === 3 ? 'DISTRIBUTED' : 'AVAILABLE',
  source_information: `Thu hoạch từ ${h.plot_name} (${h.plot_code}) - Vụ ${h.crop_season_name}`,
  season_name: h.crop_season_name,
  plot_code: h.plot_code,
  crop_name: 'Ớt chuông Sweet Palermo',
  created_at: h.created_at || new Date().toISOString(),
}));

function getStoredLots(): Gs1LotItem[] {
  if (typeof window === 'undefined') return initialLots;
  try {
    const raw = localStorage.getItem(LOTS_STORAGE_KEY);
    if (!raw) {
      localStorage.setItem(LOTS_STORAGE_KEY, JSON.stringify(initialLots));
      return initialLots;
    }
    return JSON.parse(raw);
  } catch {
    return initialLots;
  }
}

function saveStoredLots(lots: Gs1LotItem[]) {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(LOTS_STORAGE_KEY, JSON.stringify(lots));
  } catch (err) {
    console.error('Failed to save lots to localStorage', err);
  }
}

export async function fetchLots(params?: { status?: string; search?: string }): Promise<Gs1LotItem[]> {
  try {
    const res: any = await apiClient.get('/lots', { params });
    const apiData = Array.isArray(res.data) ? res.data : (res.data?.data || []);
    if (apiData.length > 0) {
      return apiData.map((item: any) => ({
        id: item.id,
        lot_code: item.lot_code,
        harvest_id: item.harvest_id,
        harvest_date: item.harvest_date || item.created_at?.slice(0, 10),
        quantity: Number(item.quantity || 0),
        remaining_quantity: Number(item.remaining_quantity ?? item.quantity ?? 0),
        unit: item.unit || 'KG',
        status: (item.status as LotLifecycleStatus) || 'AVAILABLE',
        source_information: item.source_information || '',
        season_name: item.season_name || '',
        plot_code: item.plot_code || '',
        crop_name: item.crop_name || 'Nông sản OCOP',
        created_at: item.created_at || new Date().toISOString(),
      }));
    }
  } catch (err) {
    console.warn('API /lots unavailable, falling back to local lots store:', err);
  }

  let lots = getStoredLots();
  if (params?.status && params.status !== 'ALL') {
    lots = lots.filter((l) => l.status === params.status);
  }
  if (params?.search) {
    const q = params.search.toLowerCase().trim();
    lots = lots.filter(
      (l) =>
        l.lot_code.toLowerCase().includes(q) ||
        (l.plot_code && l.plot_code.toLowerCase().includes(q)) ||
        (l.season_name && l.season_name.toLowerCase().includes(q))
    );
  }
  return lots;
}

export async function updateLotStatus(id: string, status: LotLifecycleStatus): Promise<Gs1LotItem> {
  try {
    const res: any = await apiClient.patch(`/lots/${id}`, { status });
    if (res.data) return res.data;
  } catch (err) {
    console.warn('API PATCH /lots failed, updating local store:', err);
  }

  const lots = getStoredLots();
  const index = lots.findIndex((l) => l.id === id || l.lot_code === id);
  if (index === -1) {
    throw new Error(`Không tìm thấy lô hàng với ID: ${id}`);
  }
  lots[index].status = status;
  saveStoredLots(lots);
  return lots[index];
}
