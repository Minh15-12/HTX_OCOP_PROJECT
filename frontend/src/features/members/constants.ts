import { MemberType, MemberStatus, CapitalForm, PaymentMethod } from '@/types/memberTypes';

export const MEMBER_TYPE_LABELS: Record<MemberType, string> = {
  CHINH_THUC: 'Chính thức',
  LIEN_KET_GOP_VON: 'Liên kết góp vốn',
  LIEN_KET_KHONG_GOP_VON: 'Liên kết không góp vốn',
  LIEN_KET: 'Liên kết',
  OFFICIAL: 'Chính thức',
  ASSOCIATED: 'Liên kết',
};

export const MEMBER_STATUS_LABELS: Record<MemberStatus, string> = {
  ACTIVE: 'Đang hoạt động',
  PENDING: 'Chờ duyệt',
  INACTIVE: 'Ngưng hoạt động',
  SUSPENDED: 'Tạm đình chỉ',
  TERMINATED: 'Đã chấm dứt',
  REJECTED: 'Đã từ chối',
  DRAFT: 'Bản nháp',
  PROSPECTIVE: 'Tiềm năng',
  PENDING_TERMINATION: 'Chờ chấm dứt',
};

export const CAPITAL_FORM_LABELS: Record<CapitalForm, string> = {
  TIEN_MAT: 'Tiền mặt / Chuyển khoản',
  HIEN_VAT: 'Hiện vật',
  QUYEN_SU_DUNG_DAT: 'Quyền sử dụng đất',
};

export const PAYOUT_METHOD_LABELS: Record<PaymentMethod, string> = {
  CASH: 'Tiền mặt',
  BANK_TRANSFER: 'Chuyển khoản',
  LAND: 'Hiện vật đất đai',
  ASSET: 'Tài sản hiện vật',
};
