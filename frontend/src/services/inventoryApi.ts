import { apiClient } from './apiClient';
import {
  Material,
  StockReceipt,
  MaterialCategory,
  MemberToolTracking,
  Voucher02Data,
  MaterialReconciliationReport
} from '../types/inventory';

const mapCategory = (cat?: string): MaterialCategory => {
  if (!cat) return 'Phân bón';
  const c = cat.toUpperCase();
  if (c.includes('FERTILIZER') || c.includes('PHÂN BÓN') || c.includes('PHAN_BON') || c.includes('PHÂN')) return 'Phân bón';
  if (c.includes('PESTICIDE') || c.includes('BVTV') || c.includes('THUỐC') || c.includes('THUOC')) return 'Thuốc BVTV Sinh học';
  if (c.includes('TOOL') || c.includes('NÔNG CỤ') || c.includes('NONG_CU') || c.includes('CCDC')) return 'Nông cụ';
  if (c.includes('OTHER') || c.includes('SEED') || c.includes('BAO BÌ') || c.includes('ĐÓNG GÓI') || c.includes('PACKAGING') || c.includes('GIONG')) return 'Vật tư đóng gói';
  return (cat as MaterialCategory) || 'Phân bón';
};

// Backend DB to Frontend UI Data Mapper for Material
export const mapApiMaterialToFrontend = (item: any): Material => {
  const category = mapCategory(item.category || item.type);
  const isDurable = Boolean(item.is_durable_tool ?? item.isDurableTool ?? (category === 'Nông cụ' || item.category === 'TOOL'));
  return {
    id: item.id || item.code,
    code: item.sku || item.code || item.id,
    name: item.name || '',
    category,
    accountCode: item.account_code || item.accountCode || (isDurable ? '1525' : '1521'),
    isDurableTool: isDurable,
    stockQty: Number(item.available_stock ?? item.current_stock ?? item.stock_qty ?? item.stockQty ?? 0),
    unit: item.unit || 'kg',
    minSafetyStock: Number(item.min_safety_stock ?? item.reorder_threshold ?? item.minSafetyStock ?? 0),
    unitPrice: Number(item.unit_price ?? item.latest_unit_price ?? item.unitPrice ?? 0),
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
    const res = await apiClient.get<any>('/materials', { params: { per_page: 100 } });
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

  async approveStockReceipt(id: string): Promise<any> {
    return apiClient.post(`/stock-receipts/${id}/approve`);
  },

  async createStockIssue(payload: {
    material_id?: string;
    quantity?: number;
    season_name?: string;
    member_name?: string;
    note?: string;
    issue_date?: string;
    member_id?: string;
    crop_season_id?: string;
    is_credit?: boolean;
    purpose?: string;
    lines?: Array<{
      material_id: string;
      quantity: number;
      unit_price?: number;
      batch_code?: string;
      notes?: string;
    }>;
    [key: string]: any;
  }): Promise<any> {
    const res = await apiClient.post<any>('/stock-issues', payload);
    return mapApiReceiptToFrontend({ ...(res.data?.data || res.data || res), type: 'OUT' });
  },

  // Stock Issues list & Approval
  async getStockIssues(): Promise<any[]> {
    const res = await apiClient.get<any>('/stock-issues').catch(() => ({ data: [] }));
    const raw = Array.isArray(res.data) ? res.data : (res.data?.data || []);
    return raw.map((i: any) => ({
      id: i.id || i.issue_number || i.issue_code,
      issueCode: i.issue_number || i.issue_code || i.id,
      warehouseId: i.warehouse_id,
      warehouseName: i.warehouse?.name || 'Kho Trung tâm',
      memberId: i.member_id,
      memberName: i.member?.identity_information?.full_name || i.member_name || 'Xã viên HTX',
      issueType: i.issue_type || (i.member_id ? 'CREDIT_ADVANCE' : 'SALE_CASH'),
      totalAmount: Number(i.total_amount || 0),
      issueDate: i.issue_date || (i.created_at ? String(i.created_at).slice(0, 10) : new Date().toISOString().slice(0, 10)),
      status: i.status || 'COMPLETED',
      itemsCount: Array.isArray(i.lines) ? i.lines.length : 1,
      emptyBottlesExpected: Number(i.empty_bottles_expected || 0),
      emptyBottlesReturned: Number(i.empty_bottles_returned || 0),
      packagingReturnedStatus: i.packaging_returned_status || 'NOT_REQUIRED',
      packagingProofUrl: i.packaging_proof_url,
      packagingReturnedAt: i.packaging_returned_at,
      note: i.note || '',
    }));
  },

  async approveStockIssue(id: string): Promise<any> {
    return apiClient.post(`/stock-issues/${id}/approve`);
  },

  // Material Batches & FEFO Expiry
  async getMaterialBatches(): Promise<any[]> {
    const res = await apiClient.get<any>('/materials').catch(() => ({ data: [] }));
    const materials = Array.isArray(res.data) ? res.data : (res.data?.data || []);
    
    // Flatten batches from materials if available, or generate from catalog
    const batches: any[] = [];
    materials.forEach((m: any) => {
      if (Array.isArray(m.batches) && m.batches.length > 0) {
        m.batches.forEach((b: any) => {
          const diffDays = b.expired_at ? Math.ceil((new Date(b.expired_at).getTime() - Date.now()) / (1000 * 60 * 60 * 24)) : 999;
          batches.push({
            id: b.id || b.batch_code,
            materialId: m.id,
            materialName: m.name,
            batchCode: b.batch_code || 'BATCH-DEFAULT',
            quantity: Number(b.quantity || 0),
            unit: m.unit || 'kg',
            manufactureDate: b.manufacture_date,
            expiredAt: b.expired_at,
            status: diffDays <= 0 ? 'EXPIRED' : (diffDays <= 30 ? 'NEAR_EXPIRY' : 'ACTIVE'),
            daysUntilExpiry: diffDays,
          });
        });
      } else if (m.expiry_date || m.expiryDate) {
        const exp = m.expiry_date || m.expiryDate;
        const diffDays = Math.ceil((new Date(exp).getTime() - Date.now()) / (1000 * 60 * 60 * 24));
        batches.push({
          id: `batch-${m.id}`,
          materialId: m.id,
          materialName: m.name,
          batchCode: `LÔ-${m.code || m.id?.slice(0, 6)}`,
          quantity: Number(m.current_stock || m.stockQty || 0),
          unit: m.unit || 'kg',
          manufactureDate: '2026-01-15',
          expiredAt: exp,
          status: diffDays <= 0 ? 'EXPIRED' : (diffDays <= 30 ? 'NEAR_EXPIRY' : 'ACTIVE'),
          daysUntilExpiry: diffDays,
        });
      }
    });

    return batches.sort((a, b) => (a.expiredAt || '').localeCompare(b.expiredAt || ''));
  },

  // Stock Counts
  async getStockCounts(): Promise<any[]> {
    const res = await apiClient.get<any>('/stock-counts', { params: { per_page: 100 } }).catch(() => ({ data: [] }));
    const raw = Array.isArray(res.data) ? res.data : (res.data?.data || []);
    return raw.map((c: any) => ({
      id: c.id || c.count_code,
      countCode: c.count_number || c.count_code || c.id,
      warehouseId: c.warehouse_id,
      warehouseName: c.warehouse?.name || 'Kho Trung tâm',
      countDate: c.count_date || (c.created_at ? String(c.created_at).slice(0, 10) : new Date().toISOString().slice(0, 10)),
      status: c.status || 'COMPLETED',
      totalItems: Array.isArray(c.lines) ? c.lines.length : 0,
      discrepancyCount: Array.isArray(c.lines) ? c.lines.filter((l: any) => l.difference !== 0).length : 0,
      note: c.notes || c.reason || '',
    }));
  },

  async createStockCount(payload: {
    count_date: string;
    reason?: string;
    lines: Array<{
      material_id: string;
      actual_quantity: number;
      reason?: string;
    }>;
  }): Promise<any> {
    const res = await apiClient.post<any>('/stock-counts', payload);
    return res.data?.data || res.data;
  },

  // Chứng từ Mẫu 02-VT (Thông tư 71/2024/TT-BTC)
  async getVoucher02Data(id: string): Promise<Voucher02Data> {
    const res = await apiClient.get<any>(`/stock-issues/${id}/voucher-02`);
    return res.data?.data || res.data;
  },

  // Thu hồi vỏ bao bì thuốc BVTV (TTLT 05/2016)
  async recordPackagingReturn(id: string, payload: { returned_count: number; proof_photo_url?: string }): Promise<any> {
    const res = await apiClient.post<any>(`/stock-issues/${id}/return-packaging`, payload);
    return res.data?.data || res.data;
  },

  // Quản lý Nông cụ ngoài bảng TK 005 (Thông tư 71/2024/TT-BTC)
  async getToolTrackings(params?: { member_id?: string; status?: string; search?: string }): Promise<MemberToolTracking[]> {
    const res = await apiClient.get<any>('/tool-trackings', { params: { per_page: 100, ...params } });
    return Array.isArray(res.data) ? res.data : (res.data?.data || []);
  },

  async assignTool(payload: {
    member_id: string;
    material_id: string;
    farm_plot_id?: string;
    serial_number?: string;
    quantity?: number;
    assigned_date?: string;
    note?: string;
  }): Promise<MemberToolTracking> {
    const res = await apiClient.post<any>('/tool-trackings', payload);
    return res.data?.data || res.data;
  },

  async updateToolStatus(id: string, payload: { action: string; note?: string }): Promise<MemberToolTracking> {
    const res = await apiClient.patch<any>(`/tool-trackings/${id}/status`, payload);
    return res.data?.data || res.data;
  },

  // Đối soát cân bằng vật tư vụ mùa 3 chiều (Reconciliation)
  async getMaterialReconciliation(cropSeasonId: string): Promise<MaterialReconciliationReport> {
    const res = await apiClient.get<any>('/inventory/reconciliation', { params: { crop_season_id: cropSeasonId } });
    return res.data?.data || res.data;
  },
};


