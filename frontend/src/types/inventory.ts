export type MaterialCategory = 'Phân bón' | 'Thuốc BVTV Sinh học' | 'Vật tư đóng gói' | 'Nông cụ';

export interface Material {
  id: string;
  code: string;
  name: string;
  category: MaterialCategory;
  accountCode?: string; // TK 1521 -> 1525 theo Thông tư 71/2024/TT-BTC
  isDurableTool?: boolean; // CCDC lâu bền theo dõi ngoài bảng TK 005
  stockQty: number;
  unit: string;
  minSafetyStock: number;
  unitPrice: number;
  supplierName?: string;
  warehouseName?: string;
  expiryDate?: string; // ISO date YYYY-MM-DD (cho phân bón/thuốc BVTV sinh học)
  description?: string;
  status: 'ACTIVE' | 'INACTIVE';
}

export type StockReceiptType = 'IN' | 'OUT';

export interface StockReceipt {
  id: string;
  type: StockReceiptType;
  itemId: string;
  itemName: string;
  qty: number;
  unit: string;
  unitPrice?: number;
  date: string; // YYYY-MM-DD
  note: string;
  person: string;

  // Luồng mở rộng: Cấp phát Mùa vụ & Xã viên/Vùng trồng
  seasonId?: string;
  seasonName?: string;
  memberName?: string;
  farmPlotName?: string;
}

export interface SeasonAllocationGroup {
  seasonName: string;
  memberName: string;
  materialName: string;
  totalQty: number;
  unit: string;
  totalCost: number;
  latestDate: string;
}

export interface MaterialBatch {
  id: string;
  materialId: string;
  materialName: string;
  batchCode: string;
  quantity: number;
  unit: string;
  manufactureDate?: string;
  expiredAt?: string;
  status: 'ACTIVE' | 'NEAR_EXPIRY' | 'EXPIRED';
  daysUntilExpiry?: number;
}

export interface StockIssue {
  id: string;
  issueCode: string;
  warehouseId?: string;
  warehouseName?: string;
  memberId?: string;
  memberName?: string;
  issueType: 'SALE_CASH' | 'CREDIT_ADVANCE' | 'INTERNAL_USE';
  isCredit?: boolean;
  totalAmount: number;
  issueDate: string;
  status: 'DRAFT' | 'APPROVED' | 'COMPLETED' | 'CANCELLED';
  itemsCount?: number;
  note?: string;

  // Quản lý thu hồi vỏ bao bì thuốc BVTV (TTLT 05/2016 & Tiêu chí OCOP)
  packagingReturnedStatus?: 'NOT_REQUIRED' | 'PENDING' | 'PARTIALLY_RETURNED' | 'COMPLETED';
  emptyBottlesExpected?: number;
  emptyBottlesReturned?: number;
  packagingProofUrl?: string;
  packagingReturnedAt?: string;
}

export interface StockCount {
  id: string;
  countCode: string;
  warehouseId?: string;
  warehouseName?: string;
  countDate: string;
  status: 'DRAFT' | 'COMPLETED' | 'APPROVED';
  totalItems: number;
  discrepancyCount: number;
  note?: string;
}

// Quản lý Nông cụ ngoài bảng TK 005 (Thông tư 71/2024/TT-BTC)
export interface MemberToolTracking {
  id: string;
  cooperative_id?: string;
  member_id: string;
  member_name?: string;
  material_id: string;
  material_name?: string;
  material_code?: string;
  farm_plot_id?: string;
  farm_plot_name?: string;
  stock_issue_id?: string;
  serial_number?: string;
  quantity: number;
  assigned_date: string;
  status: 'IN_USE' | 'MAINTENANCE' | 'DAMAGED_RETURNED' | 'LOST' | 'REPLACED';
  replaced_by_tracking_id?: string;
  replacement_proof_url?: string;
  note?: string;
  created_at?: string;
}

// Chứng từ Mẫu 02-VT: Phiếu xuất kho kiêm Sổ chia vật tư tập trung
export interface Voucher02Item {
  material_code: string;
  material_name: string;
  account_code: string;
  unit: string;
  quantity: number;
  unit_price: number;
  amount: number;
  is_durable_tool: boolean;
}

export interface Voucher02Data {
  voucher_number: string;
  issue_date: string;
  cooperative: {
    name: string;
    address?: string;
    tax_code?: string;
  };
  recipient: {
    member_name: string;
    member_code?: string;
    farm_plot_name?: string;
  };
  warehouse: {
    name: string;
    code?: string;
  };
  issue_type: string;
  is_credit: boolean;
  note?: string;
  items: Voucher02Item[];
  total_amount: number;
  total_amount_in_words?: string;
  signers: {
    director?: string;
    accountant?: string;
    storekeeper?: string;
    receiver?: string;
  };
}

// Đối soát cân bằng vật tư & vỏ thuốc cuối vụ (Reconciliation)
export interface MaterialReconciliationItem {
  material_id: string;
  material_name: string;
  category: string;
  account_code: string;
  unit: string;
  total_issued_qty: number;
  total_used_qty: number;
  variance_qty: number;
  variance_percent: number;
  unit_price: number;
  total_issued_cost: number;
  actual_cost: number;
  status: 'BALANCED' | 'OVER_USED' | 'UNDER_USED';
  recommendation: string;
}

export interface MaterialReconciliationReport {
  crop_season: {
    id: string;
    name: string;
    crop_name: string;
    plot_name?: string;
    member_name?: string;
    standard_yield_kg?: number;
    actual_yield_kg?: number;
  };
  materials: MaterialReconciliationItem[];
  pesticide_packaging: {
    total_expected_bottles: number;
    total_returned_bottles: number;
    return_rate_percent: number;
    compliant: boolean;
    note: string;
  };
  financials: {
    total_advance_cost: number;
    settled_revenue: number;
    margin_after_material: number;
  };
}


