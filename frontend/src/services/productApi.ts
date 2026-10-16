import { apiClient } from './apiClient';

export interface ProductItem {
  id: string;
  product_code: string;
  product_name: string;
  category: string;
  specification?: string;
  brand?: string;
  quality_information?: {
    star_rating?: number;
    ocop_cert_number?: string;
    cert_date?: string;
    shelf_life_days?: number;
    storage_condition?: string;
    price?: number;
    unit?: string;
    [key: string]: any;
  };
  star_rating?: number;
  price?: number;
  unit?: string;
  status: 'ACTIVE' | 'INACTIVE';
  cooperative_id?: string;
  created_at?: string;
  lots_count?: number;
  lots?: any[];
}

export interface CreateProductPayload {
  product_code: string;
  product_name: string;
  category: string;
  specification?: string;
  brand?: string;
  star_rating?: number;
  price?: number;
  unit?: string;
  quality_information?: any;
  cooperative_id?: string;
}

export interface AttachProductLotPayload {
  lot_id: string;
  quantity?: number;
}

const PRODUCTS_STORAGE_KEY = 'htx_ocop_products_db';

const fallbackProducts: ProductItem[] = [
  {
    id: 'prd-palermo-red',
    product_code: 'PRD-PALERMO-RED',
    product_name: 'Ớt Chuông Sweet Palermo Đỏ (OCOP 4 Sao)',
    category: 'Rau củ quả tươi cao cấp',
    specification: 'Túi hút chân không 500g, tem chống giả GS1',
    brand: 'HTX Nông nghiệp Tân Tiến',
    quality_information: {
      star_rating: 4,
      ocop_cert_number: 'QĐ-UBND-2026-089',
      cert_date: '2026-01-15',
      shelf_life_days: 21,
      storage_condition: 'Bảo quản mát 8-12°C',
    },
    star_rating: 4,
    price: 65000,
    unit: 'Túi 500g',
    status: 'ACTIVE',
    lots_count: 2,
  },
  {
    id: 'prd-palermo-yellow',
    product_code: 'PRD-PALERMO-YEL',
    product_name: 'Ớt Chuông Sweet Palermo Vàng (OCOP 4 Sao)',
    category: 'Rau củ quả tươi cao cấp',
    specification: 'Hộp carton 1kg có màng thoáng khí',
    brand: 'HTX Nông nghiệp Tân Tiến',
    quality_information: {
      star_rating: 4,
      ocop_cert_number: 'QĐ-UBND-2026-089',
      cert_date: '2026-01-15',
      shelf_life_days: 21,
      storage_condition: 'Bảo quản mát 8-12°C',
    },
    star_rating: 4,
    price: 120000,
    unit: 'Hộp 1kg',
    status: 'ACTIVE',
    lots_count: 1,
  },
  {
    id: 'prd-lettuce-hydro',
    product_code: 'PRD-LETTUCE-01',
    product_name: 'Xà Lách Thủy Canh Mỡ Đà Lạt (OCOP 3 Sao)',
    category: 'Rau ăn lá thủy canh',
    specification: 'Túi màng sinh học 300g giữ nguyên rễ',
    brand: 'HTX Nông nghiệp Tân Tiến',
    quality_information: {
      star_rating: 3,
      ocop_cert_number: 'QĐ-UBND-2025-334',
      cert_date: '2025-08-20',
      shelf_life_days: 10,
      storage_condition: 'Nhiệt độ 5-10°C',
    },
    star_rating: 3,
    price: 35000,
    unit: 'Túi 300g',
    status: 'ACTIVE',
    lots_count: 1,
  },
];

export function getStoredProducts(): ProductItem[] {
  try {
    const raw = localStorage.getItem(PRODUCTS_STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) return parsed;
    }
  } catch (e) {
    console.error('Error reading products from storage', e);
  }
  return fallbackProducts;
}

export function saveProductsToStorage(products: ProductItem[]): void {
  try {
    localStorage.setItem(PRODUCTS_STORAGE_KEY, JSON.stringify(products));
  } catch (e) {
    console.error('Error saving products to storage', e);
  }
}

export const productApi = {
  async getProducts(params: any = {}): Promise<ProductItem[]> {
    try {
      const res: any = await apiClient.get('/products', { params });
      const rawList = Array.isArray(res.data) ? res.data : (res.data?.data || res || []);
      if (Array.isArray(rawList) && rawList.length > 0) {
        const mapped = rawList.map((item: any) => ({
          id: item.id,
          product_code: item.product_code || item.code || item.id,
          product_name: item.product_name || item.name || 'Sản phẩm OCOP',
          category: item.category || 'Nông sản HTX',
          specification: item.specification || '',
          brand: item.brand || 'HTX Tân Tiến',
          quality_information: item.quality_information || {},
          star_rating: item.quality_information?.star_rating || item.star_rating || 4,
          price: Number(item.quality_information?.price || item.price || 50000),
          unit: item.quality_information?.unit || item.unit || 'Kg',
          status: item.status || 'ACTIVE',
          created_at: item.created_at,
          lots_count: item.lots_count || (Array.isArray(item.lots) ? item.lots.length : 1),
        }));
        saveProductsToStorage(mapped);
        return mapped;
      }
    } catch (err) {
      console.warn('API getProducts notice, using fallback storage:', err);
    }
    return getStoredProducts();
  },

  async createProduct(payload: CreateProductPayload): Promise<ProductItem> {
    try {
      const res: any = await apiClient.post('/products', {
        ...payload,
        quality_information: {
          ...(payload.quality_information || {}),
          star_rating: payload.star_rating || 4,
          price: payload.price || 50000,
          unit: payload.unit || 'Kg',
        },
      });
      const data = res.data?.data || res.data || res;
      return data;
    } catch (err) {
      console.warn('API createProduct notice, using local storage:', err);
      const list = getStoredProducts();
      const newProd: ProductItem = {
        id: `prd-${Date.now()}`,
        product_code: payload.product_code,
        product_name: payload.product_name,
        category: payload.category,
        specification: payload.specification,
        brand: payload.brand || 'HTX Tân Tiến',
        star_rating: payload.star_rating || 4,
        price: payload.price || 50000,
        unit: payload.unit || 'Kg',
        quality_information: {
          star_rating: payload.star_rating || 4,
          price: payload.price || 50000,
          unit: payload.unit || 'Kg',
        },
        status: 'ACTIVE',
        lots_count: 0,
      };
      const updated = [newProd, ...list];
      saveProductsToStorage(updated);
      return newProd;
    }
  },

  async attachLotToProduct(productId: string, payload: AttachProductLotPayload): Promise<any> {
    try {
      const res = await apiClient.post(`/products/${productId}/lots`, payload);
      return res.data;
    } catch (err) {
      console.warn('API attachLotToProduct notice, updating locally:', err);
      const list = getStoredProducts();
      const updated = list.map((p) => {
        if (p.id === productId) {
          return {
            ...p,
            lots_count: (p.lots_count || 0) + 1,
            lots: [...(p.lots || []), { lot_id: payload.lot_id, quantity: payload.quantity }],
          };
        }
        return p;
      });
      saveProductsToStorage(updated);
      return { success: true };
    }
  },

  async getProductLots(productId: string): Promise<any[]> {
    try {
      const res: any = await apiClient.get(`/products/${productId}/lots`);
      return Array.isArray(res.data) ? res.data : (res.data?.data || []);
    } catch (err) {
      return [];
    }
  },
};
