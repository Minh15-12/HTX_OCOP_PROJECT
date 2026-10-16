import { apiClient } from './apiClient';
import type { HarvestItem, HarvestPayload } from '@/types/agriculture';
import { getAllStoredPlots } from './farmPlotApi';

const HARVESTS_STORAGE_KEY = 'htx_ocop_harvests_db';

export const initialHarvests: HarvestItem[] = [
  {
    id: 'harvest-01',
    harvest_code: 'TH-2026-001',
    lot_code: 'LOT-TT-XV001-01-20261005-01',
    lot_id: 'lot-01',
    harvest_date: '2026-10-05',
    plot_id: 'plot-101',
    plot_code: 'PLOT-TT-XV001-01',
    plot_name: 'Thửa Đất Liên Kết Đạ Sar 01',
    crop_season_id: 'season-palermo-01',
    crop_season_name: 'Vụ Ớt Chuông Sweet Palermo Thu Đông 2026',
    quantity_kg: 1850,
    grade_a_kg: 1600,
    grade_b_kg: 250,
    reject_kg: 0,
    quality_grade: 'GRADE_A',
    brix_level: 7.8,
    uniformity_rate: 93.5,
    is_phi_cleared: true,
    safe_harvest_date: '2026-10-02',
    kcs_status: 'PASSED',
    kcs_gate_check: {
      passed: true,
      phi_checked: true,
      safe_harvest_date: '2026-10-02',
      harvest_date: '2026-10-05',
      note: 'Đối soát cổng: Thửa đất đã vượt qua thời hạn cách ly PHI 3 ngày',
    },
    kcs_quick_lab: {
      test_result: 'LAB_PASSED',
      kit_code: 'KIT-RAPID-PEST-442',
      residue_ppm: 0.002,
      active_substances_tested: ['Chlorpyrifos', 'Imidacloprid', 'Cypermethrin'],
      tested_at: '2026-10-05T09:30:00Z',
      tester_name: 'KCS Nguyễn Thu Trang (HTX Tân Tiến)',
      note: 'Âm tính toàn bộ dư lượng thuốc BVTV & hóa chất cấm',
    },
    status: 'COMPLETED',
    created_at: '2026-10-05T10:00:00Z',
  },
  {
    id: 'harvest-02',
    harvest_code: 'TH-2026-002',
    lot_code: 'LOT-TT-XV003-02-20261008-02',
    lot_id: 'lot-02',
    harvest_date: '2026-10-08',
    plot_id: 'plot-202',
    plot_code: 'PLOT-TT-XV003-02',
    plot_name: 'Thửa Đất Nhà Kính 02 - Hòn Bồ',
    crop_season_id: 'season-palermo-01',
    crop_season_name: 'Vụ Ớt Chuông Sweet Palermo Thu Đông 2026',
    quantity_kg: 2400,
    grade_a_kg: 2150,
    grade_b_kg: 250,
    reject_kg: 0,
    quality_grade: 'GRADE_A',
    brix_level: 8.1,
    uniformity_rate: 95.0,
    is_phi_cleared: true,
    safe_harvest_date: '2026-10-05',
    kcs_status: 'PASSED',
    kcs_gate_check: {
      passed: true,
      phi_checked: true,
      safe_harvest_date: '2026-10-05',
      harvest_date: '2026-10-08',
      note: 'Đối soát cổng: An toàn PHI 100%, đủ tuổi thu hoạch 110 ngày',
    },
    kcs_quick_lab: {
      test_result: 'LAB_PASSED',
      kit_code: 'KIT-RAPID-PEST-443',
      residue_ppm: 0.0,
      active_substances_tested: ['Chlorpyrifos', 'Carbendazim', 'Permethrin'],
      tested_at: '2026-10-08T10:15:00Z',
      tester_name: 'KCS Nguyễn Thu Trang (HTX Tân Tiến)',
      note: 'Không phát hiện bất kỳ dư lượng nào (ND - Not Detected)',
    },
    status: 'COMPLETED',
    created_at: '2026-10-08T11:00:00Z',
  },
];

export function getStoredHarvests(): HarvestItem[] {
  try {
    const raw = localStorage.getItem(HARVESTS_STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) return parsed;
    }
  } catch (e) {
    console.warn('Error reading harvests from localStorage', e);
  }
  return initialHarvests;
}

export function saveHarvestsToStorage(harvests: HarvestItem[]): void {
  try {
    localStorage.setItem(HARVESTS_STORAGE_KEY, JSON.stringify(harvests));
  } catch (e) {
    console.error('Error saving harvests to localStorage', e);
  }
}

/**
 * Generate standard GS1 Harvest Lot Code: LOT-[CoopCode]-[PlotCode]-[YYYYMMDD]-[Seq]
 */
export function generateGs1LotCode(plotCode: string, harvestDateStr: string, seq = 1): string {
  const cleanPlot = plotCode.replace(/^PLOT-TT-/, '').replace(/[^a-zA-Z0-9]/g, '');
  const cleanDate = harvestDateStr.replace(/-/g, '');
  const paddedSeq = String(seq).padStart(2, '0');
  return `LOT-TT-${cleanPlot}-${cleanDate}-${paddedSeq}`;
}

/**
 * Fetch all harvests with search and filters.
 */
export async function fetchHarvests(params?: {
  search?: string;
  plot_id?: string;
  season_id?: string;
}): Promise<HarvestItem[]> {
  try {
    const res: any = await apiClient.get('/harvests', { params });
    const remoteData = res?.data || res;
    if (Array.isArray(remoteData) && remoteData.length > 0) {
      return remoteData;
    }
  } catch {
    // Fallback to local storage
  }

  let list = getStoredHarvests();

  if (params?.search) {
    const term = params.search.toLowerCase().trim();
    list = list.filter(
      (h) =>
        h.harvest_code.toLowerCase().includes(term) ||
        (h.lot_code && h.lot_code.toLowerCase().includes(term)) ||
        h.plot_code.toLowerCase().includes(term) ||
        h.plot_name.toLowerCase().includes(term)
    );
  }

  if (params?.plot_id) {
    list = list.filter((h) => h.plot_id === params.plot_id || h.plot_code === params.plot_id);
  }

  return list;
}

/**
 * Create a new harvest with 3-tier KCS and PHI Guard enforcement (BR-FARM-001).
 * HARD BLOCK: Throws ERR_HARVEST_PHI_VIOLATION if harvest_date < safe_harvest_date.
 */
export async function createHarvest(payload: HarvestPayload): Promise<HarvestItem> {
  // 1. Gate Check PHI Guard: Lookup plot in farm plots storage
  const plots = getAllStoredPlots();
  const currentPlot = plots.find((p) => p.id === payload.plot_id || p.plot_code === payload.plot_id);

  if (currentPlot && currentPlot.safe_harvest_date) {
    const safeDate = new Date(currentPlot.safe_harvest_date);
    const harvestDate = new Date(payload.harvest_date);

    // If harvestDate is strictly before safeDate => Hard violation!
    if (harvestDate < safeDate) {
      const err = new Error(
        `ERR_HARVEST_PHI_VIOLATION: Thửa đất [${currentPlot.plot_code}] đang trong thời hạn cách ly thuốc BVTV an toàn đến hết ngày ${currentPlot.safe_harvest_date}. Lệnh thu hoạch vào ngày ${payload.harvest_date} bị chặn hoàn toàn theo quy tắc an toàn BR-FARM-001 của HTX Tân Tiến!`
      );
      (err as any).code = 'ERR_HARVEST_PHI_VIOLATION';
      throw err;
    }
  }

  // 2. 3-Tier KCS Validation
  // If Quick Lab is rejected => final grade MUST be REJECT
  let finalGrade = payload.quality_grade;
  let finalKcsStatus = payload.kcs_status || 'PASSED';

  if (payload.kcs_quick_lab?.test_result === 'LAB_REJECTED') {
    finalGrade = 'REJECT';
    finalKcsStatus = 'REJECTED';
  } else {
    // If Grade A requested, check Brix >= 7 and Uniformity >= 90%
    if (finalGrade === 'GRADE_A') {
      const brix = payload.brix_level ?? 7.5;
      const uniformity = payload.uniformity_rate ?? 90;
      if (brix < 7.0 || uniformity < 90.0) {
        // Demote to Grade B
        finalGrade = 'GRADE_B';
      }
    }
  }

  const plotCode = currentPlot ? currentPlot.plot_code : payload.plot_id;
  const plotName = currentPlot ? (currentPlot.unit_name || `Thửa đất ${currentPlot.plot_code}`) : `Thửa ${payload.plot_id}`;

  const stored = getStoredHarvests();
  const seq = stored.length + 1;
  const harvestCode = `TH-2026-${String(seq).padStart(3, '0')}`;
  const lotCode = generateGs1LotCode(plotCode, payload.harvest_date, seq);

  const newHarvest: HarvestItem = {
    id: `harvest-${Date.now().toString().slice(-6)}`,
    harvest_code: harvestCode,
    lot_code: lotCode,
    lot_id: `lot-${Date.now().toString().slice(-6)}`,
    harvest_date: payload.harvest_date,
    plot_id: payload.plot_id,
    plot_code: plotCode,
    plot_name: plotName,
    crop_season_id: payload.crop_season_id,
    crop_season_name: 'Vụ Ớt Chuông Sweet Palermo Thu Đông 2026',
    quantity_kg: Number(payload.quantity_kg),
    grade_a_kg: payload.grade_a_kg !== undefined ? Number(payload.grade_a_kg) : Number(payload.quantity_kg) * 0.85,
    grade_b_kg: payload.grade_b_kg !== undefined ? Number(payload.grade_b_kg) : Number(payload.quantity_kg) * 0.15,
    reject_kg: payload.reject_kg !== undefined ? Number(payload.reject_kg) : 0,
    quality_grade: finalGrade,
    brix_level: payload.brix_level ?? 7.5,
    uniformity_rate: payload.uniformity_rate ?? 92.0,
    is_phi_cleared: true,
    safe_harvest_date: currentPlot?.safe_harvest_date || undefined,
    kcs_status: finalKcsStatus,
    kcs_gate_check: payload.kcs_gate_check || {
      passed: true,
      phi_checked: true,
      safe_harvest_date: currentPlot?.safe_harvest_date || payload.harvest_date,
      harvest_date: payload.harvest_date,
      note: 'Đối soát cổng hoàn tất: Đạt thời hạn cách ly an toàn',
    },
    kcs_quick_lab: payload.kcs_quick_lab || {
      test_result: 'LAB_PASSED',
      kit_code: `KIT-${Date.now().toString().slice(-4)}`,
      residue_ppm: 0.001,
      active_substances_tested: ['Chlorpyrifos', 'Imidacloprid'],
      tested_at: new Date().toISOString(),
      tester_name: 'Bộ phận KCS HTX Tân Tiến',
      note: 'Đạt kiểm nghiệm dư lượng',
    },
    status: 'COMPLETED',
    created_at: new Date().toISOString(),
  };

  // Attempt backend API call
  try {
    const res: any = await apiClient.post('/harvests', {
      ...payload,
      lot_code: lotCode,
      harvest_code: harvestCode,
      quality_grade: finalGrade,
      kcs_status: finalKcsStatus,
    });
    if (res?.data) {
      saveHarvestsToStorage([res.data, ...stored]);
      return res.data;
    }
  } catch {
    // If backend not connected or returns 404, fallback to local storage
  }

  saveHarvestsToStorage([newHarvest, ...stored]);
  return newHarvest;
}

/**
 * Get harvest by ID or Lot code.
 */
export async function getHarvestById(idOrLotCode: string): Promise<HarvestItem | undefined> {
  try {
    const res: any = await apiClient.get(`/harvests/${idOrLotCode}`);
    if (res?.data) return res.data;
  } catch {
    // Fallback
  }
  const harvests = getStoredHarvests();
  return harvests.find((h) => h.id === idOrLotCode || h.lot_code === idOrLotCode);
}

/**
 * Update an existing harvest record (KCS re-grading, test lab results, volume distribution).
 */
export async function updateHarvest(
  id: string,
  payload: Partial<HarvestPayload> & { notes?: string }
): Promise<HarvestItem> {
  const stored = getStoredHarvests();
  const existingIndex = stored.findIndex((h) => h.id === id || h.lot_code === id);
  if (existingIndex === -1) {
    throw new Error('Không tìm thấy thông tin thu hoạch để cập nhật');
  }

  const existing = stored[existingIndex];

  // 3-Tier KCS Recalculation
  let finalGrade = payload.quality_grade || existing.quality_grade;
  let finalKcsStatus = payload.kcs_status || existing.kcs_status;

  const quickLab = payload.kcs_quick_lab || existing.kcs_quick_lab;
  if (quickLab?.test_result === 'LAB_REJECTED') {
    finalGrade = 'REJECT';
    finalKcsStatus = 'REJECTED';
  } else if (finalGrade === 'GRADE_A') {
    const brix = payload.brix_level ?? existing.brix_level ?? 7.5;
    const uniformity = payload.uniformity_rate ?? existing.uniformity_rate ?? 90;
    if (brix < 7.0 || uniformity < 90.0) {
      finalGrade = 'GRADE_B';
    }
  }

  const updatedHarvest: HarvestItem = {
    ...existing,
    ...(payload.harvest_date && { harvest_date: payload.harvest_date }),
    ...(payload.quantity_kg !== undefined && { quantity_kg: Number(payload.quantity_kg) }),
    ...(payload.grade_a_kg !== undefined && { grade_a_kg: Number(payload.grade_a_kg) }),
    ...(payload.grade_b_kg !== undefined && { grade_b_kg: Number(payload.grade_b_kg) }),
    ...(payload.reject_kg !== undefined && { reject_kg: Number(payload.reject_kg) }),
    quality_grade: finalGrade,
    kcs_status: finalKcsStatus,
    ...(payload.brix_level !== undefined && { brix_level: Number(payload.brix_level) }),
    ...(payload.uniformity_rate !== undefined && { uniformity_rate: Number(payload.uniformity_rate) }),
    ...(payload.kcs_gate_check && { kcs_gate_check: payload.kcs_gate_check }),
    ...(payload.kcs_quick_lab && { kcs_quick_lab: payload.kcs_quick_lab }),
  };

  // Try remote backend API
  try {
    const res: any = await apiClient.patch(`/harvests/${id}`, {
      ...payload,
      quality_grade: finalGrade,
      kcs_status: finalKcsStatus,
    });
    if (res?.data) {
      stored[existingIndex] = res.data;
      saveHarvestsToStorage(stored);
      return res.data;
    }
  } catch {
    // Continue with local storage
  }

  stored[existingIndex] = updatedHarvest;
  saveHarvestsToStorage(stored);
  return updatedHarvest;
}

/**
 * Delete or cancel a harvest record by ID.
 */
export async function deleteHarvest(id: string): Promise<boolean> {
  try {
    await apiClient.delete(`/harvests/${id}`);
  } catch {
    // Fallback
  }

  const stored = getStoredHarvests();
  const filtered = stored.filter((h) => h.id !== id && h.lot_code !== id);
  saveHarvestsToStorage(filtered);
  return true;
}

