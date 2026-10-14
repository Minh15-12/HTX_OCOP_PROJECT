/**
 * Types & Domain Models for Agriculture, Farming Logs (TT02/2024),
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

export type ActivityType =
  | 'LAND_PREPARATION'
  | 'FERTILIZATION'
  | 'SPRAYING'
  | 'CARE'
  | 'HARVEST';

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
    label: 'Làm đất & Xử lý giá thể',
    iconName: 'Shovel',
    color: '#854d0e',
    badgeClass: 'bg-amber-100 text-amber-800 border-amber-200',
    description: 'Cày xới, bón vôi khử trùng, chuẩn bị luống và giá thể mùn dừa xơ dừa',
  },
  FERTILIZATION: {
    key: 'FERTILIZATION',
    label: 'Bón phân & Dinh dưỡng',
    iconName: 'Sprout',
    color: '#15803d',
    badgeClass: 'bg-emerald-100 text-emerald-800 border-emerald-200',
    description: 'Bón phân hữu cơ vi sinh, châm phân nhỏ giọt NPK Ca-B theo công thức',
  },
  SPRAYING: {
    key: 'SPRAYING',
    label: 'Phun thuốc BVTV & Chế phẩm',
    iconName: 'ShieldAlert',
    color: '#b91c1c',
    badgeClass: 'bg-rose-100 text-rose-800 border-rose-200',
    description: 'Phun thuốc BVTV, chế phẩm sinh học trị sâu bọ, bắt buộc GPS & tính PHI',
  },
  CARE: {
    key: 'CARE',
    label: 'Chăm sóc & Tỉa cành',
    iconName: 'Scissors',
    color: '#0369a1',
    badgeClass: 'bg-sky-100 text-sky-800 border-sky-200',
    description: 'Tỉa nhánh phụ, quấn dây định hướng ngọn, vặt lá già, thụ phấn bổ sung',
  },
  HARVEST: {
    key: 'HARVEST',
    label: 'Thu hoạch quả',
    iconName: 'Wheat',
    color: '#ea580c',
    badgeClass: 'bg-orange-100 text-orange-800 border-orange-200',
    description: 'Thu hái ớt chuông chín đỏ đủ độ Brix, cắt cuống 1cm và chuyển về xưởng KCS',
  },
};

/**
 * Farming Log entity compliant with Thông tư 02/2024/TT-BNNPTNT (10 standard fields).
 */
export interface FarmingLog {
  id: string;
  crop_season_id: string;
  crop_season_name?: string;
  plot_id: string;
  plot_code: string;
  plot_name?: string;
  activity_type: ActivityType;
  activity_date: string;
  description?: string;
  material_id?: string;
  material_name?: string;
  material_sku?: string;
  material_batch_number?: string;
  quantity_applied?: number;
  unit?: string;
  phi_days?: number;
  safe_harvest_date?: string;
  gps_latitude?: number;
  gps_longitude?: number;
  attachment_reference?: string[];
  performed_by?: string;
  performer_name?: string;
  created_at?: string;
}

export interface FarmingLogPayload {
  crop_season_id: string;
  plot_id: string;
  activity_type: ActivityType;
  activity_date: string;
  description?: string;
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
  quality_grade: QualityGrade;
  brix_level?: number;
  uniformity_rate?: number;
  is_phi_cleared: boolean;
  safe_harvest_date?: string;
  kcs_status: KcsStatus;
  kcs_gate_check?: KcsGateCheck;
  kcs_quick_lab?: KcsQuickLab;
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
  brix_level?: number;
  uniformity_rate?: number;
  quality_grade: QualityGrade;
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
    puc_code: string;
    puc_issuer: string;
    grade: QualityGrade;
    brix_level: number;
    uniformity_rate: number;
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
    materials_used?: string;
    location_gps?: string;
    photo_url?: string;
    status: 'COMPLETED' | 'VERIFIED';
  }[];
  kcs_inspection: {
    gate_check: 'PASSED' | 'FAILED';
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
