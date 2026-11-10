import { apiClient } from './apiClient';
import type { CropItem } from '@/types/agriculture';

const CROPS_STORAGE_KEY = 'htx_ocop_crops_db';

export const initialCrops: CropItem[] = [
  {
    id: 'crop-01',
    crop_code: 'CROP-PALERMO-RED',
    name: 'Ớt Chuông Sweet Palermo Đỏ Đà Lạt',
    scientific_name: 'Capsicum annuum var. grossum',
    category: 'Rau củ quả OCOP',
    growth_duration_days: 120,
    standard_yield_ton_ha: 85,
    default_phi_days: 7,
    origin: 'Hạt giống F1 Rijk Zwaan (Hà Lan)',
    description: 'Giống ớt ngọt cao cấp không cay, độ ngọt Brix 7-9°, giàu vitamin C và chất chống oxy hóa.',
    status: 'ACTIVE',
  },
  {
    id: 'crop-02',
    crop_code: 'CROP-PALERMO-YELLOW',
    name: 'Ớt Chuông Sweet Palermo Vàng Đà Lạt',
    scientific_name: 'Capsicum annuum var. grossum',
    category: 'Rau củ quả OCOP',
    growth_duration_days: 120,
    standard_yield_ton_ha: 80,
    default_phi_days: 7,
    origin: 'Hạt giống F1 Rijk Zwaan (Hà Lan)',
    description: 'Vỏ vàng óng, thịt dày giòn ngọt thanh, thích hợp ăn sống, salad và ép nước hoa quả.',
    status: 'ACTIVE',
  },
  {
    id: 'crop-03',
    crop_code: 'CROP-TOMATO-CHERRY',
    name: 'Cà Chua Cherry Socola Đà Lạt',
    scientific_name: 'Solanum lycopersicum var. cerasiforme',
    category: 'Rau củ quả OCOP',
    growth_duration_days: 90,
    standard_yield_ton_ha: 60,
    default_phi_days: 5,
    origin: 'Nhập khẩu Israel',
    description: 'Trái nhỏ màu socola đậm, ngọt đậm đà, chuẩn canh tác nhà kính VietGAP.',
    status: 'ACTIVE',
  },
  {
    id: 'crop-04',
    crop_code: 'CROP-STRAWBERRY-JP',
    name: 'Dâu Tây Hana Nhật Bản',
    scientific_name: 'Fragaria × ananassa',
    category: 'Cây ăn trái đặc sản',
    growth_duration_days: 100,
    standard_yield_ton_ha: 35,
    default_phi_days: 10,
    origin: 'Giống Hana Tochiotome (Nhật Bản)',
    description: 'Hương thơm nồng, quả mềm mọng nước, vị ngọt dịu, OCOP 4 sao.',
    status: 'ACTIVE',
  },
];

function getStoredCrops(): CropItem[] {
  if (typeof window === 'undefined') return initialCrops;
  try {
    const raw = localStorage.getItem(CROPS_STORAGE_KEY);
    if (!raw) {
      localStorage.setItem(CROPS_STORAGE_KEY, JSON.stringify(initialCrops));
      return initialCrops;
    }
    return JSON.parse(raw);
  } catch {
    return initialCrops;
  }
}

function saveStoredCrops(crops: CropItem[]) {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(CROPS_STORAGE_KEY, JSON.stringify(crops));
  } catch (err) {
    console.error('Failed to save crops to localStorage', err);
  }
}

export async function fetchCrops(params?: { category?: string; search?: string }): Promise<CropItem[]> {
  try {
    const res: any = await apiClient.get('/crops', { params });
    const apiData = Array.isArray(res.data) ? res.data : (res.data?.data || []);
    if (apiData.length > 0) {
      return apiData.map((item: any) => ({
        id: item.id,
        crop_code: item.crop_code,
        name: item.name,
        scientific_name: item.scientific_name || '',
        category: item.category || 'Nông sản',
        growth_duration_days: Number(item.growth_duration_days || 120),
        standard_yield_ton_ha: Number(item.standard_yield_ton_ha || 70),
        default_phi_days: Number(item.default_phi_days || 7),
        origin: item.origin || '',
        description: item.description || '',
        status: (item.status as 'ACTIVE' | 'INACTIVE') || 'ACTIVE',
      }));
    }
  } catch (err) {
    console.warn('API /crops unavailable, falling back to local crops database:', err);
  }

  let crops = getStoredCrops();
  if (params?.category && params.category !== 'ALL') {
    crops = crops.filter((c) => c.category === params.category);
  }
  if (params?.search) {
    const q = params.search.toLowerCase().trim();
    crops = crops.filter(
      (c) =>
        c.crop_code.toLowerCase().includes(q) ||
        c.name.toLowerCase().includes(q) ||
        (c.scientific_name && c.scientific_name.toLowerCase().includes(q))
    );
  }
  return crops;
}

export async function createCrop(payload: Omit<CropItem, 'id'>): Promise<CropItem> {
  const newCrop: CropItem = {
    ...payload,
    id: `crop-${Date.now().toString().slice(-6)}`,
  };
  try {
    const res: any = await apiClient.post('/crops', payload);
    if (res.data) return res.data;
  } catch (err) {
    console.warn('API POST /crops failed, updating local store:', err);
  }

  const crops = getStoredCrops();
  crops.unshift(newCrop);
  saveStoredCrops(crops);
  return newCrop;
}

export async function updateCrop(id: string, payload: Partial<CropItem>): Promise<CropItem> {
  try {
    const res: any = await apiClient.patch(`/crops/${id}`, payload);
    if (res.data) return res.data;
  } catch (err) {
    console.warn('API PATCH /crops failed, updating local store:', err);
  }

  const crops = getStoredCrops();
  const index = crops.findIndex((c) => c.id === id);
  if (index === -1) throw new Error('Không tìm thấy giống cây trồng');
  crops[index] = { ...crops[index], ...payload };
  saveStoredCrops(crops);
  return crops[index];
}

export async function deleteCrop(id: string): Promise<void> {
  try {
    await apiClient.delete(`/crops/${id}`);
  } catch (err) {
    console.warn('API DELETE /crops failed, updating local store:', err);
  }

  const crops = getStoredCrops().filter((c) => c.id !== id);
  saveStoredCrops(crops);
}
