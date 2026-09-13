export type MemberType = 'CHINH_THUC' | 'LIEN_KET_GOP_VON' | 'LIEN_KET_KHONG_GOP_VON';
export type MemberStatus = 'ACTIVE' | 'PENDING' | 'INACTIVE';
export type PaymentMethod = 'CASH' | 'BANK_TRANSFER' | 'LAND' | 'ASSET';
export type CapitalForm = 'TIEN_MAT' | 'HIEN_VAT' | 'QUYEN_SU_DUNG_DAT';

export const MEMBER_TYPE_LABELS: Record<MemberType, string> = {
  CHINH_THUC: 'Chính thức',
  LIEN_KET_GOP_VON: 'Liên kết góp vốn',
  LIEN_KET_KHONG_GOP_VON: 'Liên kết không góp vốn',
};

export interface LandContribution {
  id?: string;
  land_certificate_no: string; // Số seri Sổ đỏ
  plot_number: string; // Số thửa
  map_sheet_number: string; // Số tờ bản đồ
  land_area_sqm: number; // Diện tích m2
  land_use_type: string; // Đất trồng lúa / Đất cây lâu năm
  appraised_unit_price: number; // Đơn giá định giá (VNĐ/m2)
  total_land_value: number; // Tổng giá trị = Diện tích * Đơn giá
  cadastral_status: 'PENDING' | 'NOTARIZED' | 'REGISTERED_CHANGE'; // Trạng thái sang tên HTX
  notary_document_url?: string;
}

export interface CapitalCertificate {
  certificate_code: string; // Số hiệu GCN (Số .../.../GCN-HTX)
  certificate_issue_date: string; // Ngày cấp GCN
  issue_count: number; // Cấp lần thứ mấy
  cooperative_name: string;
  cooperative_address: string;
  cooperative_license_no: string;
  cooperative_license_date: string;
  member_full_name: string;
  member_gender: string;
  member_dob: string;
  member_ethnicity: string;
  member_nationality: string;
  member_address: string;
  member_cccd: string;
  member_cccd_date: string;
  member_cccd_place: string;
  total_capital_amount: number;
  capital_in_words: string;
  contribution_form: string;
  contribution_date: string;
  representative_name: string;
  qr_code_payload: string;
}

// Comprehensive Member Entity containing all verified Database fields
export interface Member {
  id: string; // mem-001
  cooperative_id: string;
  member_code: string; // TV001

  // 1. Thông tin cá nhân
  full_name: string;
  gender: 'Nam' | 'Nữ' | 'Khác';
  dob: string; // YYYY-MM-DD
  cccd: string; // Số CCCD/CMND 12 chữ số
  cccd_issue_date: string; // Ngày cấp YYYY-MM-DD
  cccd_issue_place: string; // Nơi cấp
  education_level: string; // Chưa xác định / THPT / Đại học...
  occupation: string; // Nông dân / Kỹ sư nông nghiệp...

  // 2. Thông tin liên hệ & Địa chỉ
  province: string;
  district: string;
  ward: string;
  detail_address: string;
  address: string;
  phone: string;
  email: string;
  zalo: string;
  facebook: string;

  // 3. Thông tin vốn góp (Luật HTX 2023)
  capital_form: CapitalForm;
  contribution_date: string;
  contribution_method: string;
  member_type: MemberType; // CHINH_THUC | LIEN_KET_GOP_VON | LIEN_KET_KHONG_GOP_VON
  is_foreign_investor?: boolean; // Cờ Nhà đầu tư nước ngoài (Max 30% vốn, <35% số thành viên)
  committed_capital: number; // Vốn cam kết (đ)
  contributed_capital: number; // Đã góp (đ)
  remaining_capital: number; // Còn thiếu (đ)
  commitment_deadline?: string; // Hạn nộp đủ vốn (Gia nhập + 6 tháng)
  total_capital_contributed: number;
  capital_in_words: string;
  total_shares_held: number;
  ownership_percentage: number; // Tỷ lệ sở hữu % (Cảnh báo: Green <25%, Yellow 25-29.9%, Red >=30%)
  capital_status: 'DU_VON' | 'CHUA_DU'; // Trạng thái vốn góp
  land_contributions?: LandContribution[]; // Danh sách ruộng đất góp vốn
  certificate?: CapitalCertificate; // Giấy chứng nhận phần vốn góp

  // 4. Phân chia lợi nhuận & Ngân hàng
  profit_share_rate: number;
  payout_method: PaymentMethod;
  bank_account: string;
  bank_name: string;
  account_holder?: string;
  notes: string;

  // 5. Hệ thống & Quản lý
  status: MemberStatus;
  join_date: string;
  current_debt: number; // Công nợ tồn đọng (vật tư, thủy nông)
  annual_product_output_kg: number;
  notary_document_url?: string;
}

export interface CapitalTransaction {
  id: string;
  member_id: string;
  member_code: string;
  member_name: string;
  transaction_code: string;
  amount: number;
  share_quantity: number;
  contribution_date: string;
  payment_method: PaymentMethod;
  receipt_number: string;
  content: string;
  notes: string;
  status: 'APPROVED' | 'PENDING';
  recorded_by?: string;
  recorded_date?: string;
  receipt_file_name?: string;
  land_details?: LandContribution;
  certificate_code?: string;
}

export interface SurplusDistributionPlan {
  id: string;
  fiscal_year: number;
  plan_name: string;
  internal_service_surplus: number; // Thặng dư giao dịch nội bộ (TK 512 - Miễn thuế TNDN)
  external_service_surplus: number; // Thặng dư giao dịch bên ngoài (TK 511 - Nộp thuế 20%)
  total_net_profit: number; // Tổng lợi nhuận sau thuế (đ)
  unallocated_common_fund_rate: number; // Tỷ lệ Quỹ chung không chia (%) min 5% từ thu nhập bên ngoài
  unallocated_common_fund_amount: number; // Số tiền Quỹ chung không chia (đ)
  reserve_fund_rate: number; // Tỷ lệ trích lập quỹ đầu tư phát triển (%)
  reserve_fund_amount: number; // Số tiền trích lập quỹ đầu tư phát triển (đ)
  patronage_rebate_rate: number; // Tỷ lệ chia theo sử dụng dịch vụ nội bộ (%) min 51%
  member_share_rate: number; // Tỷ lệ chia cho xã viên (%) e.g. 85%
  member_share_amount: number; // Số tiền chia cho xã viên (đ)
  welfare_fund_rate: number; // Tỷ lệ quỹ khen thưởng, phúc lợi (%) e.g. 5%
  welfare_fund_amount: number; // Số tiền quỹ khen thưởng, phúc lợi (đ)
  planned_payout_date: string; // Ngày dự kiến phân chia
  resolution_number: string; // Số Nghị quyết HĐQT
  notes: string;
  status: 'DRAFT' | 'APPROVED' | 'DISTRIBUTED';
}

export interface SurplusDistributionItem {
  id: string;
  plan_id: string;
  member_id: string;
  member_code: string;
  member_name: string;
  member_type: MemberType;
  shares_held: number;
  capital_contributed: number;
  share_percentage: number;
  capital_share_amount: number;
  service_usage_output_kg?: number;
  internal_service_usage_amount?: number; // Giá trị mua vật tư / bao tiêu nông sản nội bộ năm (đ)
  service_share_amount: number; // Chia thưởng theo mức độ sử dụng dịch vụ (Patronage Rebate)
  total_allocated_amount?: number; // Tổng thu nhập phân bổ trước khấu trừ
  total_payout_amount: number; // Tổng thặng dư được nhận
  debt_deduction?: number; // Cấn trừ nợ tiền mua vật tư tồn đọng
  net_payout_amount?: number; // Số tiền thực lĩnh = Total_allocated - Debt_deduction
  reinvest_as_capital?: boolean; // Tích chọn tái đầu tư thặng dư thành vốn góp bổ sung
  payout_method: PaymentMethod;
  payout_status: 'DA_NHAN' | 'CHUA_NHAN';
  payout_date?: string;
  transaction_code?: string;
  bank_name?: string;
  bank_account?: string;
  account_holder?: string;
  documents?: Array<{ name: string; size: string; type: 'pdf' | 'excel' }>;
  audit_trail?: Array<{ date: string; action: string; actor: string; status: string }>;
}
