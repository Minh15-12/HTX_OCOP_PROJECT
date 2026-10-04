import { apiClient } from './apiClient';
import { Material, StockReceipt, MaterialCategory } from '../types/inventory';

// Backend DB to Frontend UI Data Mapper for Material
export const mapApiMaterialToFrontend = (item: any): Material => {
  return {
    id: item.id || item.code,
    code: item.sku || item.code || item.id,
    name: item.name || '',
    category: (item.category || item.type || 'Phân bón') as MaterialCategory,
    stockQty: Number(item.current_stock ?? item.stock_qty ?? item.stockQty ?? 0),
    unit: item.unit || 'kg',
    minSafetyStock: Number(item.min_safety_stock ?? item.minSafetyStock ?? 0),
    unitPrice: Number(item.unit_price ?? item.unitPrice ?? 0),
    supplierName: item.supplier_name || item.supplierName || 'Nhà cung cấp HTX',
    warehouseName: item.warehouse_name || item.warehouseName || 'Kho vật tư chính',
    expiryDate: item.expiry_date || item.expiryDate || '',
    description: item.description || '',
    status: item.status || 'ACTIVE',
  };
};

// Backend DB to Frontend UI Data Mapper for Stock Receipt
export const mapApiReceiptToFrontend = (item: any): StockReceipt => {
  return {
    id: item.receipt_number || item.issue_number || item.id,
    type: item.type || (item.receipt_number ? 'IN' : 'OUT'),
    itemId: item.material_id || item.itemId || '',
    itemName: item.material_name || item.itemName || 'Vật tư Nông nghiệp',
    qty: Number(item.quantity ?? item.qty ?? 0),
    unit: item.unit || 'kg',
    unitPrice: Number(item.unit_price ?? item.unitPrice ?? 0),
    date: item.transaction_date || item.created_at ? String(item.transaction_date || item.created_at).slice(0, 10) : new Date().toISOString().slice(0, 10),
    note: item.note || item.reason || '',
    person: item.created_by_name || item.person || 'Thủ kho HTX',
    seasonName: item.season_name || item.seasonName || '',
    memberName: item.member_name || item.memberName || '',
    farmPlotName: item.farm_plot_name || item.farmPlotName || '',
  };
};

export const inventoryApi = {
  // Materials Master Data API
  async getMaterials(): Promise<Material[]> {
    const res = await apiClient.get<any>('/materials');
    const data = Array.isArray(res.data) ? res.data : (res.data?.data || []);
    return data.map(mapApiMaterialToFrontend);
  },

  async createMaterial(payload: Partial<Material>): Promise<Material> {
    const backendPayload = {
      sku: payload.code || payload.id,
      name: payload.name,
      category: payload.category,
      unit: payload.unit,
      min_safety_stock: payload.minSafetyStock,
      unit_price: payload.unitPrice,
      supplier_name: payload.supplierName,
      description: payload.description,
    };
    const res = await apiClient.post<any>('/materials', backendPayload);
    return mapApiMaterialToFrontend(res.data?.data || res.data || res);
  },

  async updateMaterial(id: string, payload: Partial<Material>): Promise<Material> {
    const backendPayload = {
      name: payload.name,
      category: payload.category,
      unit: payload.unit,
      min_safety_stock: payload.minSafetyStock,
      unit_price: payload.unitPrice,
      supplier_name: payload.supplierName,
      description: payload.description,
    };
    const res = await apiClient.patch<any>(`/materials/${id}`, backendPayload);
    return mapApiMaterialToFrontend(res.data?.data || res.data || res);
  },

  // Stock Receipts (IN) API
  async getStockReceipts(): Promise<StockReceipt[]> {
    const [receiptsRes, issuesRes] = await Promise.all([
      apiClient.get<any>('/stock-receipts').catch(() => ({ data: [] })),
      apiClient.get<any>('/stock-issues').catch(() => ({ data: [] })),
    ]);

    const receipts = Array.isArray(receiptsRes.data) ? receiptsRes.data : (receiptsRes.data?.data || []);
    const issues = Array.isArray(issuesRes.data) ? issuesRes.data : (issuesRes.data?.data || []);

    const mappedReceipts = receipts.map((r: any) => mapApiReceiptToFrontend({ ...r, type: 'IN' }));
    const mappedIssues = issues.map((i: any) => mapApiReceiptToFrontend({ ...i, type: 'OUT' }));

    return [...mappedReceipts, ...mappedIssues].sort((a, b) => b.date.localeCompare(a.date));
  },

  async createStockReceipt(payload: {
    material_id: string;
    quantity: number;
    unit_price: number;
    note?: string;
  }): Promise<StockReceipt> {
    const res = await apiClient.post<any>('/stock-receipts', payload);
    return mapApiReceiptToFrontend({ ...(res.data?.data || res.data || res), type: 'IN' });
  },

  async createStockIssue(payload: {
    material_id: string;
    quantity: number;
    season_name?: string;
    member_name?: string;
    note?: string;
  }): Promise<StockReceipt> {
    const res = await apiClient.post<any>('/stock-issues', payload);
    return mapApiReceiptToFrontend({ ...(res.data?.data || res.data || res), type: 'OUT' });
  },
};
