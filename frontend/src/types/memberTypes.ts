export type MemberType = 'CHINH_THUC' | 'LIEN_KET_GOP_VON' | 'LIEN_KET_KHONG_GOP_VON';
export type MemberStatus = 'ACTIVE' | 'PENDING' | 'INACTIVE';
export type PaymentMethod = 'CASH' | 'BANK_TRANSFER';
export type CapitalForm = 'TIEN_MAT' | 'HIEN_VAT';

export const MEMBER_TYPE_LABELS: Record<MemberType, string> = {
  CHINH_THUC: 'Chính thức',
  LIEN_KET_GOP_VON: 'Liên kết góp vốn',
  LIEN_KET_KHONG_GOP_VON: 'Liên kết không góp vốn',
};

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

  // 3. Thông tin vốn góp (Theo Ảnh 2 - Vốn góp)
  capital_form: CapitalForm;
  contribution_date: string;
  contribution_method: string;
  member_type: MemberType; // CHINH_THUC | LIEN_KET_GOP_VON | LIEN_KET_KHONG_GOP_VON
  committed_capital: number; // Vốn cam kết (đ)
  contributed_capital: number; // Đã góp (đ)
  remaining_capital: number; // Còn thiếu (đ)
  total_capital_contributed: number;
  capital_in_words: string;
  total_shares_held: number;
  ownership_percentage: number;
  capital_status: 'DU_VON' | 'CHUA_DU'; // Trạng thái vốn góp

  // 4. Phân chia lợi nhuận & Ngân hàng (Theo Ảnh 1 - Phân chia lợi nhuận)
  profit_share_rate: number;
  payout_method: PaymentMethod;
  bank_account: string;
  bank_name: string;
  account_holder?: string;
  notes: string;

  // 5. Hệ thống & Quản lý
  status: MemberStatus;
  join_date: string;
  current_debt: number;
  annual_product_output_kg: number;
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
}

export interface SurplusDistributionPlan {
  id: string;
  fiscal_year: number;
  plan_name: string;
  total_net_profit: number; // Tổng lợi nhuận sau thuế (đ)
  reserve_fund_rate: number; // Tỷ lệ trích lập quỹ (%) e.g. 10%
  reserve_fund_amount: number; // Số tiền trích lập quỹ (đ)
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
  service_usage_output_kg: number;
  service_share_amount: number;
  total_payout_amount: number;
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

