/**
 * Types & Domain Models for Agriculture, Farming Logs (TCVN 12850:2019 & VietGAP),
 * PHI Guard, 3-Tier KCS, Harvest, GS1 Lot & Traceability.
 * Specialized for HTX Nông nghiệp Tân Tiến - Ớt chuông Sweet Palermo Đỏ Đà Lạt.
 */

export type PlotStatus =
  | 'ACTIVE'
  | 'IN_QUARANTINE'
  | 'FALLOW'
  | 'INACTIVE'
  | 'PREPARING'
  | 'UNDER_PUC_REVIEW';

export interface FarmPlot {
  id: string;
  production_unit_id: string;
  unit_code?: string | null;
  unit_name?: string | null;
  plot_code: string;
  area: number;
  status: string;
  quarantine_until?: string | null;
  safe_harvest_date?: string | null;
  is_in_quarantine?: boolean;
  national_cadastral_code?: string | null;
  land_sheet_number?: string | null;
  land_parcel_number?: string | null;
  substrate_bag_count?: number | null;
  planting_density_per_sqm?: number | null;
  greenhouse_type?: string | null;
  gps_coordinates?: string | null;
  land_relation?: any;
  geometry_geojson?: any;
  vn2000_coordinates?: any;
  max_yield_rate_per_sqm?: number | null;
  max_harvest_quota_kg?: number;
  land_contract_expired_at?: string | null;
  is_contract_expired?: boolean;
  created_at?: string;
  assignments?: any[];
}

export type ActivityType =
  | 'LAND_PREPARATION'
  | 'SOIL_TILLAGE'
  | 'SUBSTRATE_MIXING'
  | 'PLANTING'
  | 'FERTILIZATION'
  | 'FERTILIZING'
  | 'IRRIGATION'
  | 'SPRAYING'
  | 'PEST_CONTROL'
  | 'CARE'
  | 'PRUNING'
  | 'HARVEST'
  | 'MONITORING'
  | 'BIOCONTROL'
  | 'IPM_SCOUTING';

export interface ActivityTypeMeta {
  key: ActivityType;
  label: string;
  iconName: string;
  color: string;
  badgeClass: string;
  description: string;
}

export const ACTIVITY_TYPES_META: Record<ActivityType, ActivityTypeMeta> = {
  LAND_PREPARATION: {
    key: 'LAND_PREPARATION',
    label: 'Làm đất & Giá thể',
    iconName: 'Shovel',
    color: '#854d0e',
    badgeClass: 'bg-amber-100 text-amber-800 border-amber-200',
    description: 'Cày xới, khử trùng giá thể mùn dừa xơ dừa, chuẩn bị túi bầu',
  },
  FERTILIZATION: {
    key: 'FERTILIZATION',
    label: 'Dinh dưỡng & Tưới Fertigation',
    iconName: 'Sprout',
    color: '#15803d',
    badgeClass: 'bg-emerald-100 text-emerald-800 border-emerald-200',
    description: 'Châm phân nhỏ giọt CNC qua que ghim Thùng A/B, kiểm soát EC & pH',
  },
  SPRAYING: {
    key: 'SPRAYING',
    label: 'Thuốc BVTV (Đúng 4 đúng)',
    iconName: 'ShieldAlert',
    color: '#b91c1c',
    badgeClass: 'bg-rose-100 text-rose-800 border-rose-200',
    description: 'Phun thuốc BVTV danh mục TT 75, kiểm soát hoạt chất, nhóm IRAC/FRAC và PHI',
  },
  BIOCONTROL: {
    key: 'BIOCONTROL',
    label: 'Thả Thiên Địch (IPM Sinh học)',
    iconName: 'Bug',
    color: '#0d9488',
    badgeClass: 'bg-teal-100 text-teal-800 border-teal-200',
    description: 'Thả nhện bắt mồi Amblyseius, Phytoseiulus; ngưng hóa chất tối thiểu 21 ngày',
  },
  IPM_SCOUTING: {
    key: 'IPM_SCOUTING',
    label: 'Điều tra Sinh vật hại (IPM)',
    iconName: 'Search',
    color: '#7c3aed',
    badgeClass: 'bg-purple-100 text-purple-800 border-purple-200',
    description: 'Điều tra mật độ bọ trĩ, nhện đỏ, thán thư; ghi Không phát hiện nếu sạch sâu bệnh',
  },
  CARE: {
    key: 'CARE',
    label: 'Chăm sóc & Tỉa cành',
    iconName: 'Scissors',
    color: '#0369a1',
    badgeClass: 'bg-sky-100 text-sky-800 border-sky-200',
    description: 'Tỉa nhánh phụ, quấn dây định hướng ngọn, vặt lá già, tỉa hoa đực',
  },
  HARVEST: {
    key: 'HARVEST',
    label: 'Thu hoạch quả rải vụ',
    iconName: 'Wheat',
    color: '#ea580c',
    badgeClass: 'bg-orange-100 text-orange-800 border-orange-200',
    description: 'Thu hái từng đợt hái, đối chiếu an toàn PHI, phân loại thương phẩm 1 & 2',
  },
  SOIL_TILLAGE: {
    key: 'SOIL_TILLAGE',
    label: 'Cày bừa & Xới đất',
    iconName: 'Shovel',
    color: '#854d0e',
    badgeClass: 'bg-amber-100 text-amber-800 border-amber-200',
    description: 'Cày lật, xới tơi xốp đất trước mùa vụ',
  },
  SUBSTRATE_MIXING: {
    key: 'SUBSTRATE_MIXING',
    label: 'Trộn & Khử trùng giá thể',
    iconName: 'Layers',
    color: '#854d0e',
    badgeClass: 'bg-amber-100 text-amber-800 border-amber-200',
    description: 'Xử lý xơ dừa, đóng túi bầu nhà màng',
  },
  PLANTING: {
    key: 'PLANTING',
    label: 'Xuống giống & Trồng cây',
    iconName: 'Sprout',
    color: '#16a34a',
    badgeClass: 'bg-emerald-100 text-emerald-800 border-emerald-200',
    description: 'Đưa cây giống vào bầu giá thể, căn mật độ',
  },
  FERTILIZING: {
    key: 'FERTILIZING',
    label: 'Bón phân & Tưới dinh dưỡng',
    iconName: 'Sprout',
    color: '#15803d',
    badgeClass: 'bg-emerald-100 text-emerald-800 border-emerald-200',
    description: 'Bón lót, tưới thúc phân bón dinh dưỡng',
  },
  IRRIGATION: {
    key: 'IRRIGATION',
    label: 'Tưới nước & Độ ẩm',
    iconName: 'Droplets',
    color: '#0284c7',
    badgeClass: 'bg-sky-100 text-sky-800 border-sky-200',
    description: 'Tưới nước giữ ẩm cho cây trồng',
  },
  PEST_CONTROL: {
    key: 'PEST_CONTROL',
    label: 'Phòng trừ sâu bệnh',
    iconName: 'ShieldAlert',
    color: '#b91c1c',
    badgeClass: 'bg-rose-100 text-rose-800 border-rose-200',
    description: 'Biện pháp hóa học / sinh học phòng trừ dịch hại',
  },
  PRUNING: {
    key: 'PRUNING',
    label: 'Tỉa cành & Định hình',
    iconName: 'Scissors',
    color: '#0369a1',
    badgeClass: 'bg-sky-100 text-sky-800 border-sky-200',
    description: 'Tỉa nhánh vô hiệu, định hướng ngọn',
  },
  MONITORING: {
    key: 'MONITORING',
    label: 'Giám sát vườn & Thăm đồng',
    iconName: 'Search',
    color: '#6366f1',
    badgeClass: 'bg-indigo-100 text-indigo-800 border-indigo-200',
    description: 'Kiểm tra sinh trưởng và diễn biến ruộng vườn',
  },
};

/**
 * Farming Log entity compliant with TCVN 12850:2019 & Thông tư 17/2021/TT-BNNPTNT (10 standard fields).
 */
export interface FarmingLog {
  id: string;
  crop_season_id: string;
  crop_season_name?: string;
  crop_name?: string;
  plot_id: string;
  plot_code: string;
  plot_name?: string;
  log_code?: string;
  farm_plot_id?: string;
  activity_type: ActivityType;
  activity_date: string;
  description?: string;
  notes?: string;
  fertigation_method?: 'DRIP_EMITTER' | 'DRENCH' | 'FOLIAR';
  ec_solution?: number;
  ec_drain?: number;
  ph_solution?: number;
  tank_composition?: any;
  pest_target?: string;
  pest_density?: string;
  active_ingredient?: string;
  resistance_group?: string;
  material_lot_number?: string;
  material_export_slip_code?: string;
  biocontrol_agent_name?: string;
  biocontrol_release_rate?: string;
  water_volume_liters?: number;
  application_equipment?: string;
  is_phi_cleared?: boolean;
  material_id?: string;
  material_name?: string;
  material_sku?: string;
  material_batch_number?: string;
  quantity_applied?: number;
  materials_used?: Array<{
    material_name?: string;
    material_code?: string;
    quantity?: number;
    unit?: string;
    [key: string]: any;
  }>;
  unit?: string;
  phi_days?: number;
  safe_harvest_date?: string;
  status?: string;
  client_uuid?: string;
  is_backdated?: boolean;
  verified_by?: string;
  verifier_name?: string;
  verified_at?: string;
  rejection_reason?: string;
  hash_sha256?: string;
  prev_hash?: string;
  gps_distance_to_edge_meters?: number;
  is_gps_verified?: boolean;
  voice_raw_text?: string;
  items?: FarmingLogItem[];
  gps_latitude?: number;
  gps_longitude?: number;
  attachment_reference?: string[];
  performed_by?: string;
  performer_name?: string;
  created_at?: string;
}

export interface FarmingLogItem {
  id?: string;
  farming_log_id?: string;
  material_id?: string;
  material_name: string;
  item_name?: string;
  item_type?: 'PESTICIDE' | 'FERTILIZER' | 'BIOCONTROL' | 'OTHER';
  active_ingredient?: string;
  resistance_group?: string;
  quantity_applied: number;
  dosage_per_ha?: string;
  unit: string;
  phi_days?: number;
  material_lot_number?: string;
  material_export_slip_code?: string;
}

export interface FarmingLogPayload {
  crop_season_id: string;
  plot_id: string;
  activity_type: ActivityType;
  activity_date: string;
  description?: string;
  fertigation_method?: 'DRIP_EMITTER' | 'DRENCH' | 'FOLIAR';
  ec_solution?: number;
  ec_drain?: number;
  ph_solution?: number;
  tank_composition?: any;
  pest_target?: string;
  pest_density?: string;
  active_ingredient?: string;
  resistance_group?: string;
  material_lot_number?: string;
  material_export_slip_code?: string;
  biocontrol_agent_name?: string;
  biocontrol_release_rate?: string;
  water_volume_liters?: number;
  application_equipment?: string;
  material_id?: string;
  material_name?: string;
  material_sku?: string;
  material_batch_number?: string;
  quantity_applied?: number;
  unit?: string;
  phi_days?: number;
  gps_latitude?: number;
  gps_longitude?: number;
  attachment_reference?: string[];
  performed_by?: string;
  client_uuid?: string;
  items?: FarmingLogItem[];
  voice_raw_text?: string;
  status?: string;
}

export interface SeasonMaterialReconciliation {
  id: string;
  cooperative_id: string;
  crop_season_id: string;
  season_name?: string;
  material_id: string;
  material_name: string;
  unit: string;
  opening_balance: number;
  received_from_coop: number;
  used_in_logbook: number;
  actual_closing_balance: number;
  calculated_balance: number;
  variance: number;
  empty_packaging_returned: number;
  waste_disposal_slip_code?: string;
  reconciliation_notes?: string;
  status: string;
  reconciled_by?: string;
  reconciler_name?: string;
  created_at?: string;
}

/**
 * 3-Tier KCS and Quality Grading Types
 */
export type QualityGrade = 'GRADE_A' | 'GRADE_B' | 'REJECT';
export type KcsStatus = 'PENDING_KCS' | 'PASSED' | 'REJECTED';
export type QuickLabResult = 'LAB_PASSED' | 'LAB_REJECTED';

export interface KcsGateCheck {
  passed: boolean;
  phi_checked: boolean;
  safe_harvest_date?: string;
  harvest_date?: string;
  note?: string;
}

export interface KcsQuickLab {
  test_result: QuickLabResult;
  kit_code?: string;
  residue_ppm?: number;
  active_substances_tested?: string[];
  tested_at?: string;
  tester_name?: string;
  note?: string;
}

export interface KcsGrading {
  grade_a_kg: number;
  grade_b_kg: number;
  reject_kg: number;
  brix_level: number;
  uniformity_rate: number;
  final_grade: QualityGrade;
}

export interface HarvestItem {
  id: string;
  harvest_code: string;
  lot_code?: string;
  lot_id?: string;
  gtin?: string;
  puc_code?: string;
  harvest_date: string;
  plot_id: string;
  plot_code: string;
  plot_name: string;
  crop_season_id: string;
  crop_season_name?: string;
  quantity_kg: number;
  grade_a_kg?: number;
  grade_b_kg?: number;
  reject_kg?: number;
  rejection_weight_kg?: number;
  quality_grade: QualityGrade;
  brix_level?: number;
  uniformity_rate?: number;
  stage_number?: number;
  last_spray_date?: string | null;
  last_active_ingredient?: string | null;
  days_since_last_spray?: number | null;
  weighing_slip_code?: string | null;
  is_phi_cleared: boolean;
  safe_harvest_date?: string;
  kcs_status: KcsStatus;
  kcs_gate_check?: KcsGateCheck;
  kcs_quick_lab?: KcsQuickLab;
  is_over_quota?: boolean;
  quota_excess_kg?: number;
  quota_audit_status?: 'APPROVED' | 'REJECTED' | 'NEEDS_RECONCILIATION';
  quota_audit_note?: string | null;
  status: string;
  created_at?: string;
}

export interface HarvestPayload {
  crop_season_id: string;
  plot_id: string;
  harvest_date: string;
  quantity_kg: number;
  grade_a_kg?: number;
  grade_b_kg?: number;
  reject_kg?: number;
  rejection_weight_kg?: number;
  brix_level?: number;
  uniformity_rate?: number;
  quality_grade: QualityGrade;
  stage_number?: number;
  weighing_slip_code?: string;
  kcs_status?: KcsStatus;
  kcs_gate_check?: KcsGateCheck;
  kcs_quick_lab?: KcsQuickLab;
}

/**
 * Public and Internal Traceability Types
 */
export interface PublicTraceabilityData {
  lot_code: string;
  cooperative: {
    name: string;
    code: string;
    address: string;
    hotline: string;
    email: string;
    province: string;
    representative: string;
    tax_code: string;
  };
  product: {
    name: string;
    variety: string;
    seed_supplier?: string;
    seedling_standard_checklist?: any;
    buyer_contract_info?: any;
    puc_code: string;
    puc_quota_kg?: number;
    puc_issuer: string;
    grade: QualityGrade;
    brix_level: number;
    uniformity_rate: number;
    weighing_slip_code?: string;
    stage_number?: number;
    harvest_date: string;
    expiry_date: string;
    packaging_spec: string;
    storage_instructions: string;
    description: string;
    image_url: string;
  };
  plot: {
    plot_code: string;
    plot_name: string;
    production_unit_name: string;
    puc_code?: string;
    national_cadastral_code?: string;
    land_sheet_number?: string;
    land_parcel_number?: string;
    greenhouse_type?: string;
    substrate_bag_count?: number;
    planting_density_per_sqm?: number;
    gps_coordinates: string;
    gps_latitude: number;
    gps_longitude: number;
    area_sqm: number;
    assigned_member: string;
    soil_type: string;
  };
  farming_journey: {
    stage_number: number;
    stage_name: string;
    date: string;
    activity_type: string;
    description: string;
    performer_name?: string;
    materials_used?: string;
    material_batch_number?: string;
    quantity_applied?: number;
    unit?: string;
    ec_solution?: number;
    ph_solution?: number;
    fertigation_method?: string;
    water_volume_liters?: number;
    pest_target?: string;
    pest_density?: string;
    biocontrol_agent_name?: string;
    biocontrol_release_rate?: string;
    active_ingredient?: string;
    resistance_group?: string;
    phi_days?: number;
    is_phi_cleared?: boolean;
    location_gps?: string;
    photo_url?: string;
    status: 'COMPLETED' | 'VERIFIED';
  }[];
  kcs_inspection: {
    gate_check: 'PASSED' | 'FAILED';
    phi_status?: string;
    days_since_last_spray?: number;
    last_active_ingredient?: string;
    last_spray_date?: string;
    quick_lab: QuickLabResult;
    lab_kit_code: string;
    residue_ppm: number;
    brix_level: number;
    uniformity_rate: number;
    inspection_date: string;
    inspector: string;
    overall_status: 'PASSED' | 'REJECTED';
  };
  certifications: {
    name: string;
    code: string;
    issuer: string;
    valid_until: string;
    badge_label: string;
    description: string;
  }[];
  integrity_hash: string;
  qr_verify_url: string;
}

export type LotLifecycleStatus = 'AVAILABLE' | 'PACKED' | 'DISTRIBUTED' | 'EXPIRED' | 'REJECTED';

export interface Gs1LotItem {
  id: string;
  lot_code: string;
  harvest_id: string;
  harvest_date: string;
  quantity: number;
  remaining_quantity?: number;
  unit: string;
  status: LotLifecycleStatus;
  source_information?: string;
  season_name?: string;
  plot_code?: string;
  unit_code?: string;
  crop_name?: string;
  created_at: string;
}

export interface CropItem {
  id: string;
  crop_code: string;
  name: string;
  scientific_name?: string;
  category: string;
  growth_duration_days?: number;
  standard_yield_ton_ha?: number;
  default_phi_days?: number;
  origin?: string;
  description?: string;
  status: 'ACTIVE' | 'INACTIVE';
}


