export interface PredefinedMaterial {
  key: string;
  name: string;
  sku: string;
  batchNumber: string;
  defaultPhi: number;
  unit: string;
  activeIngredient?: string;
  resistanceGroup?: string;
  materialId?: string;
}

export const PREDEFINED_MATERIALS: PredefinedMaterial[] = [
  {
    key: 'radiant-60sc',
    name: 'Thuốc trừ sâu Radiant 60SC (Đặc trị bọ trĩ, sâu xanh)',
    sku: 'SKU-RADIANT-60SC-100ML',
    batchNumber: 'LOT-RD-2026-09',
    defaultPhi: 3,
    unit: 'Chai',
    activeIngredient: 'Spinetoram',
    resistanceGroup: 'IRAC 5',
  },
  {
    key: 'bio-neem',
    name: 'Chế phẩm Thảo mộc Xua đuổi Côn trùng & Bọ trĩ Bio-Neem',
    sku: 'SKU-BIO-NEEM-1L',
    batchNumber: 'LOT-NEEM-2026-05',
    defaultPhi: 3,
    unit: 'Lít',
    activeIngredient: 'Azadirachtin',
    resistanceGroup: 'BIO-PEST',
    materialId: '32ceda6a-e7b2-4f57-ac6a-e3cc98f6ff8b',
  },
  {
    key: 'amblyseius-swirskii',
    name: 'Bao nhân nuôi Thiên địch nhện ăn thịt Amblyseius swirskii',
    sku: 'SKU-BIO-SWIRSKII-250K',
    batchNumber: 'LOT-BC-SW-2026',
    defaultPhi: 0,
    unit: 'Túi',
    activeIngredient: 'Amblyseius swirskii (Thiên địch sinh học)',
    resistanceGroup: 'BIOCONTROL',
  },
  {
    key: 'bio-tricho',
    name: 'Chế phẩm Sinh học Nấm Đối kháng Bio-Tricho',
    sku: 'SKU-BIO-TRICHO-500ML',
    batchNumber: 'LOT-BIO-2026-88',
    defaultPhi: 7,
    unit: 'Lít',
    activeIngredient: 'Trichoderma harzianum',
    resistanceGroup: 'FRAC BM02',
    materialId: '32ceda6a-e7b2-4f57-ac6a-e3cc98f6ff8b',
  },
  {
    key: 'haifa-calmag',
    name: 'Dinh dưỡng tưới nhỏ giọt CNC Haifa Cal-Mag Israel',
    sku: 'SKU-HAIFA-CALMAG-25KG',
    batchNumber: 'LOT-PB-2601',
    defaultPhi: 0,
    unit: 'Kg',
    activeIngredient: 'Ca(NO3)2 + Mg(NO3)2 (Thùng A)',
    resistanceGroup: 'FERT-CNC',
  },
  {
    key: 'fert-cabo',
    name: 'Phân bón sinh học vi lượng Canxi-Bo Israel (Dày vỏ, ngọt quả)',
    sku: 'SKU-FERT-CABO-20L',
    batchNumber: 'LOT-NPK-2026-12',
    defaultPhi: 0,
    unit: 'Kg',
    activeIngredient: 'Chelate Ca-B',
    resistanceGroup: 'FERT-MICRO',
    materialId: '2ff08c4b-133f-4268-b5bb-45bf2f19e9a9',
  },
  {
    key: 'fert-seaweed',
    name: 'Phân bón hữu cơ sinh học rong biển bón rễ Seaweed',
    sku: 'SKU-FERT-SEAWEED-10KG',
    batchNumber: 'LOT-SW-2026-03',
    defaultPhi: 0,
    unit: 'Kg',
    activeIngredient: 'Chiết xuất rong biển Alginate',
    resistanceGroup: 'BIO-ORGANIC',
    materialId: '6ee4616f-8f54-4d20-9eb9-d2f148e536cd',
  },
  {
    key: 'lime-clean',
    name: 'Vôi bột nông nghiệp Canxi khử trùng giá thể',
    sku: 'SKU-LIME-50KG',
    batchNumber: 'LOT-VOI-2026-01',
    defaultPhi: 0,
    unit: 'Kg',
    activeIngredient: 'CaCO3 + CaO',
    resistanceGroup: 'SOIL-DISINFECT',
    materialId: 'caccd604-ba17-4338-95c0-5bc361d8ec4e',
  },
  {
    key: 'other',
    name: 'Vật tư khác / Nhập thủ công',
    sku: '',
    batchNumber: '',
    defaultPhi: 0,
    unit: 'Kg',
  },
];
