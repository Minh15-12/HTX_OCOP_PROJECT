import { apiClient } from './apiClient';
import type { FarmingLog, FarmingLogPayload } from '@/types/agriculture';
import { getAllStoredPlots, saveAllPlotsToStorage } from './farmPlotApi';

const FARMING_LOGS_STORAGE_KEY = 'htx_ocop_farming_logs_db';

/**
 * Initial farming logs compliant with TT 02/2024/TT-BNNPTNT
 * Specialized for HTX Nông nghiệp Tân Tiến - Ớt chuông Sweet Palermo Đỏ Đà Lạt.
 */
export const initialFarmingLogs: FarmingLog[] = [
  {
    id: 'NK-2026-001',
    crop_season_id: 'season-palermo-01',
    crop_season_name: 'Vụ Ớt Chuông Sweet Palermo Thu Đông 2026',
    plot_id: 'plot-201',
    plot_code: 'PLOT-TT-XV003-01',
    plot_name: 'Thửa Đất Nhà Kính 01 - Hòn Bồ',
    activity_type: 'SPRAYING',
    activity_date: '2026-10-08',
    description: 'Phun chế phẩm sinh học Bio-Tricho phòng nấm phấn trắng và đốm lá đợt 3',
    material_id: 'mat-bio-01',
    material_name: 'Chế phẩm Sinh học Nấm Đối kháng Bio-Tricho',
    material_sku: 'SKU-BIO-TRICHO-500ML',
    material_batch_number: 'LOT-BIO-2026-88',
    quantity_applied: 2.5,
    unit: 'Lít',
    phi_days: 7,
    safe_harvest_date: '2026-10-15',
    gps_latitude: 11.9501,
    gps_longitude: 108.4712,
    attachment_reference: ['/images/logs/bio-spray-honbo.jpg'],
    performed_by: 'mem-001',
    performer_name: 'Nguyễn Văn An (Xã viên Đội 1)',
    created_at: '2026-10-08T08:30:00Z',
  },
  {
    id: 'NK-2026-002',
    crop_season_id: 'season-palermo-01',
    crop_season_name: 'Vụ Ớt Chuông Sweet Palermo Thu Đông 2026',
    plot_id: 'plot-202',
    plot_code: 'PLOT-TT-XV003-02',
    plot_name: 'Thửa Đất Nhà Kính 02 - Hòn Bồ',
    activity_type: 'FERTILIZATION',
    activity_date: '2026-10-05',
    description: 'Châm phân bón lá hữu cơ Ca-B Bo-Kẽm qua hệ thống tưới nhỏ giọt Israel tăng độ ngọt và dày vỏ',
    material_id: 'mat-fert-02',
    material_name: 'Phân bón sinh học vi lượng Canxi-Bo Israel',
    material_sku: 'SKU-FERT-CABO-20L',
    material_batch_number: 'LOT-NPK-2026-12',
    quantity_applied: 50.0,
    unit: 'Kg',
    phi_days: 0,
    safe_harvest_date: '2026-10-05',
    gps_latitude: 11.9510,
    gps_longitude: 108.4720,
    attachment_reference: ['/images/logs/drip-fert-honbo.jpg'],
    performed_by: 'mem-002',
    performer_name: 'Trần Thị Bình (Kỹ thuật viên HTX)',
    created_at: '2026-10-05T07:15:00Z',
  },
  {
    id: 'NK-2026-003',
    crop_season_id: 'season-palermo-01',
    crop_season_name: 'Vụ Ớt Chuông Sweet Palermo Thu Đông 2026',
    plot_id: 'plot-101',
    plot_code: 'PLOT-TT-XV001-01',
    plot_name: 'Thửa Đất Liên Kết Đạ Sar 01',
    activity_type: 'CARE',
    activity_date: '2026-10-02',
    description: 'Tỉa nhánh phụ định hình 2 thân chính, quấn dây dù treo quả chống gãy cành khi sai trái',
    material_id: undefined,
    material_name: 'Dây dù nông nghiệp chống tia UV',
    material_sku: 'SKU-WIRE-UV-500M',
    material_batch_number: 'LOT-ACC-2026-04',
    quantity_applied: 10.0,
    unit: 'Cuộn',
    phi_days: 0,
    safe_harvest_date: '2026-10-02',
    gps_latitude: 11.9404,
    gps_longitude: 108.4583,
    attachment_reference: ['/images/logs/pruning-dasar.jpg'],
    performed_by: 'mem-003',
    performer_name: 'Lê Hoàng Cường (Xã viên Đội 2)',
    created_at: '2026-10-02T09:00:00Z',
  },
  {
    id: 'NK-2026-004',
    crop_season_id: 'season-palermo-01',
    crop_season_name: 'Vụ Ớt Chuông Sweet Palermo Thu Đông 2026',
    plot_id: 'plot-103',
    plot_code: 'PLOT-TT-XV002-01',
    plot_name: 'Thửa Đất Liên Kết Đạ Sar 02',
    activity_type: 'LAND_PREPARATION',
    activity_date: '2026-08-15',
    description: 'Xử lý giá thể mùn dừa đóng bao, khử trùng bằng vôi nung và tưới vi sinh Trichoderma ủ ấm',
    material_id: 'mat-lime-01',
    material_name: 'Vôi bột nông nghiệp Canxi Cacbonat',
    material_sku: 'SKU-LIME-50KG',
    material_batch_number: 'LOT-VOI-2026-01',
    quantity_applied: 200.0,
    unit: 'Kg',
    phi_days: 0,
    safe_harvest_date: '2026-08-15',
    gps_latitude: 11.9420,
    gps_longitude: 108.4601,
    attachment_reference: ['/images/logs/soil-prep.jpg'],
    performed_by: 'mem-004',
    performer_name: 'Phạm Đức Dũng (Xã viên Đội 2)',
    created_at: '2026-08-15T06:30:00Z',
  },
];

export function getStoredFarmingLogs(): FarmingLog[] {
  try {
    const raw = localStorage.getItem(FARMING_LOGS_STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) return parsed;
    }
  } catch (e) {
    console.warn('Error reading farming logs from localStorage', e);
  }
  return initialFarmingLogs;
}

export function saveFarmingLogsToStorage(logs: FarmingLog[]): void {
  try {
    localStorage.setItem(FARMING_LOGS_STORAGE_KEY, JSON.stringify(logs));
  } catch (e) {
    console.error('Error saving farming logs to localStorage', e);
  }
}

/**
 * Calculates safe harvest date based on activity date and PHI days.
 */
export function calculateSafeHarvestDate(activityDateStr: string, phiDays: number): string {
  if (!phiDays || phiDays <= 0) return activityDateStr;
  const date = new Date(activityDateStr);
  if (isNaN(date.getTime())) return activityDateStr;
  date.setDate(date.getDate() + phiDays);
  return date.toISOString().split('T')[0];
}

/**
 * Fetch all farming logs with search and filter.
 */
export async function fetchFarmingLogs(params?: {
  search?: string;
  plot_id?: string;
  crop_season_id?: string;
  activity_type?: string;
}): Promise<FarmingLog[]> {
  try {
    const res: any = await apiClient.get('/farming-logs', { params });
    const remoteData = res?.data || res;
    if (Array.isArray(remoteData) && remoteData.length > 0) {
      return remoteData;
    }
  } catch {
    // Fallback to local storage
  }

  let logs = getStoredFarmingLogs();

  if (params?.search) {
    const term = params.search.toLowerCase().trim();
    logs = logs.filter(
      (l) =>
        l.plot_code.toLowerCase().includes(term) ||
        (l.plot_name && l.plot_name.toLowerCase().includes(term)) ||
        (l.description && l.description.toLowerCase().includes(term)) ||
        (l.material_name && l.material_name.toLowerCase().includes(term)) ||
        (l.performer_name && l.performer_name.toLowerCase().includes(term)) ||
        l.activity_type.toLowerCase().includes(term)
    );
  }

  if (params?.plot_id) {
    logs = logs.filter((l) => l.plot_id === params.plot_id || l.plot_code === params.plot_id);
  }

  if (params?.crop_season_id) {
    logs = logs.filter((l) => l.crop_season_id === params.crop_season_id);
  }

  if (params?.activity_type && params.activity_type !== 'ALL') {
    logs = logs.filter((l) => l.activity_type === params.activity_type);
  }

  return logs;
}

/**
 * Create a new farming log compliant with TT02/2024.
 * Enforces BR-FARM-003: GPS is mandatory for Spraying activity!
 * Automatically triggers PHI Guard: calculates safe_harvest_date and isolates plot.
 */
export async function createFarmingLog(payload: FarmingLogPayload): Promise<FarmingLog> {
  // BR-FARM-003 Enforcement
  if (payload.activity_type === 'SPRAYING') {
    if (
      payload.gps_latitude === undefined ||
      payload.gps_longitude === undefined ||
      isNaN(payload.gps_latitude) ||
      isNaN(payload.gps_longitude) ||
      (payload.gps_latitude === 0 && payload.gps_longitude === 0)
    ) {
      throw new Error(
        'ERR_GPS_LOCATION_REQUIRED: Hoạt động phun thuốc BVTV bắt buộc phải có tọa độ GPS tại hiện trường theo quy định Thông tư 02/2024/TT-BNNPTNT và quy tắc an toàn BR-FARM-003!'
      );
    }
  }

  const phiDays = payload.phi_days ? Number(payload.phi_days) : 0;
  const safeDate = calculateSafeHarvestDate(payload.activity_date, phiDays);

  const newLog: FarmingLog = {
    id: `NK-${Date.now().toString().slice(-6)}`,
    crop_season_id: payload.crop_season_id,
    crop_season_name: 'Vụ Ớt Chuông Sweet Palermo Thu Đông 2026',
    plot_id: payload.plot_id,
    plot_code: payload.plot_id.toUpperCase().startsWith('PLOT-') ? payload.plot_id : `PLOT-TT-${payload.plot_id}`,
    plot_name: `Thửa đất ${payload.plot_id}`,
    activity_type: payload.activity_type,
    activity_date: payload.activity_date,
    description: payload.description || '',
    material_id: payload.material_id,
    material_name: payload.material_name,
    material_sku: payload.material_sku,
    material_batch_number: payload.material_batch_number,
    quantity_applied: payload.quantity_applied ? Number(payload.quantity_applied) : undefined,
    unit: payload.unit || 'Lít',
    phi_days: phiDays,
    safe_harvest_date: safeDate,
    gps_latitude: payload.gps_latitude,
    gps_longitude: payload.gps_longitude,
    attachment_reference: payload.attachment_reference || [],
    performed_by: payload.performed_by || 'mem-curr',
    performer_name: payload.performed_by || 'Cán bộ kỹ thuật HTX Tân Tiến',
    created_at: new Date().toISOString(),
  };

  // Try remote backend API first
  try {
    const res: any = await apiClient.post('/farming-logs', payload);
    if (res?.data) {
      // Sync local storage cache
      const stored = getStoredFarmingLogs();
      saveFarmingLogsToStorage([res.data, ...stored]);
      return res.data;
    }
  } catch {
    // If backend unavailable, continue with local state
  }

  // Update local storage
  const stored = getStoredFarmingLogs();
  const updatedLogs = [newLog, ...stored];
  saveFarmingLogsToStorage(updatedLogs);

  // If spraying with PHI days > 0, automatically isolate plot in farm plots storage (PHI Guard)
  if (phiDays > 0) {
    try {
      const plots = getAllStoredPlots();
      const updatedPlots = plots.map((p) => {
        if (p.id === payload.plot_id || p.plot_code === payload.plot_id) {
          return {
            ...p,
            status: 'IN_QUARANTINE',
            safe_harvest_date: safeDate,
          };
        }
        return p;
      });
      saveAllPlotsToStorage(updatedPlots);
    } catch (e) {
      console.warn('Could not update plot status for PHI guard', e);
    }
  }

  return newLog;
}

/**
 * Get farming log by ID.
 */
export async function getFarmingLogById(id: string): Promise<FarmingLog | undefined> {
  try {
    const res: any = await apiClient.get(`/farming-logs/${id}`);
    if (res?.data) return res.data;
  } catch {
    // Fallback
  }
  const logs = getStoredFarmingLogs();
  return logs.find((l) => l.id === id);
}

/**
 * Update an existing farming log.
 * Recalculates safe_harvest_date if phi_days or activity_date changes.
 */
export async function updateFarmingLog(
  id: string,
  payload: Partial<FarmingLogPayload>
): Promise<FarmingLog> {
  const stored = getStoredFarmingLogs();
  const existingIndex = stored.findIndex((l) => l.id === id);
  if (existingIndex === -1) {
    throw new Error('Không tìm thấy nhật ký canh tác để cập nhật');
  }

  const existing = stored[existingIndex];
  const newActivityDate = payload.activity_date || existing.activity_date;
  const newPhiDays = payload.phi_days !== undefined ? Number(payload.phi_days) : (existing.phi_days || 0);
  const newSafeDate = calculateSafeHarvestDate(newActivityDate, newPhiDays);

  const updatedLog: FarmingLog = {
    ...existing,
    ...(payload.activity_type && { activity_type: payload.activity_type }),
    ...(payload.activity_date && { activity_date: payload.activity_date }),
    ...(payload.description !== undefined && { description: payload.description }),
    ...(payload.material_id !== undefined && { material_id: payload.material_id }),
    ...(payload.material_name !== undefined && { material_name: payload.material_name }),
    ...(payload.material_sku !== undefined && { material_sku: payload.material_sku }),
    ...(payload.material_batch_number !== undefined && { material_batch_number: payload.material_batch_number }),
    ...(payload.quantity_applied !== undefined && { quantity_applied: Number(payload.quantity_applied) }),
    ...(payload.unit !== undefined && { unit: payload.unit }),
    phi_days: newPhiDays,
    safe_harvest_date: newSafeDate,
    ...(payload.gps_latitude !== undefined && { gps_latitude: payload.gps_latitude }),
    ...(payload.gps_longitude !== undefined && { gps_longitude: payload.gps_longitude }),
    ...(payload.attachment_reference !== undefined && { attachment_reference: payload.attachment_reference }),
    ...(payload.performed_by !== undefined && {
      performed_by: payload.performed_by,
      performer_name: payload.performed_by,
    }),
  };

  // Try remote backend API
  try {
    const res: any = await apiClient.patch(`/farming-logs/${id}`, payload);
    if (res?.data) {
      stored[existingIndex] = res.data;
      saveFarmingLogsToStorage(stored);
      return res.data;
    }
  } catch {
    // Continue with local storage
  }

  stored[existingIndex] = updatedLog;
  saveFarmingLogsToStorage(stored);

  // If spraying with PHI days changed, update plot safe date
  if (updatedLog.activity_type === 'SPRAYING' && newPhiDays > 0) {
    try {
      const plots = getAllStoredPlots();
      const updatedPlots = plots.map((p) => {
        if (p.id === updatedLog.plot_id || p.plot_code === updatedLog.plot_code) {
          return {
            ...p,
            status: 'IN_QUARANTINE',
            safe_harvest_date: newSafeDate,
          };
        }
        return p;
      });
      saveAllPlotsToStorage(updatedPlots);
    } catch (e) {
      console.warn('Could not update plot status for PHI guard', e);
    }
  }

  return updatedLog;
}

/**
 * Delete a farming log by ID.
 */
export async function deleteFarmingLog(id: string): Promise<boolean> {
  try {
    await apiClient.delete(`/farming-logs/${id}`);
  } catch {
    // Local fallback
  }

  const stored = getStoredFarmingLogs();
  const filtered = stored.filter((l) => l.id !== id);
  saveFarmingLogsToStorage(filtered);
  return true;
}

