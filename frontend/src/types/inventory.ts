export type MaterialCategory = 'Phân bón' | 'Thuốc BVTV Sinh học' | 'Vật tư đóng gói' | 'Nông cụ';

export interface Material {
  id: string;
  code: string;
  name: string;
  category: MaterialCategory;
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
