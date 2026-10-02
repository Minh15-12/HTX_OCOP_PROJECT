import { apiClient } from './apiClient';

export interface OcopDossierItem {
  id: string;
  stt: number;
  code: string;
  productName: string;
  productImage?: string;
  subjectName: string; // Chủ thể (HTX Tân Tiến / HTX Nông nghiệp Xanh Phú Thịnh)
  productCategory: string; // Nhóm sản phẩm (Thực phẩm, Đồ uống, Thảo dược...)
  targetStar: 3 | 4 | 5;
  evalLevel: string; // Cấp đánh giá (4 sao, 3 sao, 5 sao)
  status: 'DRAFT' | 'SELF_EVALUATING' | 'IN_EVALUATION' | 'APPROVED' | 'CERTIFIED' | 'NOT_STARTED';
  statusLabel: string;
  statusColor: 'blue' | 'green' | 'amber' | 'gray' | 'red';
  year: number;
  submissionDate: string;
  totalScore: number;
  progressPercent: number;
  cooperativeCode: string;
  address: string;
  representative: string;
  phone: string;
  email: string;
  memberCount: number;
  laborCount: number;
  establishedDate: string;
  submittedBy?: string;
  selfScore?: number;
  criteriaVersion?: string;
  mandatoryPassed?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export type OcopDossier = OcopDossierItem;

export interface CriteriaGroupSummary {
  id: number;
  name: string;
  weight: number; // Tỉ trọng %
  maxScore: number;
  achievedScore: number;
  percent: number;
}

export interface OcopCriterionDetail {
  id: string;
  groupId: number;
  groupName: string;
  code: string;
  name: string;
  maxScore: number;
  selfScore: number;
  note: string;
  isMandatory: boolean;
  evidenceLinked?: string;
}

export interface EvidenceItem {
  id: string;
  title: string;
  category: 'LEGAL' | 'QUALITY' | 'PROCESS' | 'OTHER';
  categoryLabel: string;
  criterionCode: string;
  uploadedAt: string;
  fileName: string;
  fileSize: string;
  fileHashSha256: string;
  status: 'VALID' | 'PENDING' | 'INVALID';
}

export interface TimelineScheduleItem {
  id: string;
  date: string;
  title: string;
  productName: string;
  type: 'COMMUNE' | 'PROVINCIAL' | 'COUNCIL';
}

export const MOCK_OCOP_DOSSIERS_FULL: OcopDossierItem[] = [
  {
    id: 'OCOP-2025-001',
    stt: 1,
    code: 'OCOP-2025-001',
    productName: 'Ớt chuông Sweet Palermo Đỏ Đà Lạt',
    productImage: 'https://images.unsplash.com/photo-1563565375-f3fdfdbefa83?auto=format&fit=crop&w=600&q=80',
    subjectName: 'HTX Nông nghiệp Xanh Phú Thịnh (HTX Tân Tiến)',
    productCategory: 'Thực phẩm (Nông sản tươi sống)',
    targetStar: 4,
    evalLevel: '4 sao',
    status: 'IN_EVALUATION',
    statusLabel: 'Đang thẩm định',
    statusColor: 'blue',
    year: 2025,
    submissionDate: '10/02/2025',
    totalScore: 78.5,
    progressPercent: 85,
    cooperativeCode: 'HTX-001',
    address: 'Thôn 2, xã Mê Linh, huyện Lâm Hà, Lâm Đồng',
    representative: 'Trần Văn B',
    phone: '0987 654 321',
    email: 'htxphuthinh@gmail.com',
    memberCount: 125,
    laborCount: 48,
    establishedDate: '10/10/2018',
  },
  {
    id: 'OCOP-2025-002',
    stt: 2,
    code: 'OCOP-2025-002',
    productName: 'Rau xà lách thủy canh',
    productImage: 'https://images.unsplash.com/photo-1556801712-76c8eb07ebb1?auto=format&fit=crop&w=600&q=80',
    subjectName: 'HTX Tân Tiến',
    productCategory: 'Thực phẩm',
    targetStar: 3,
    evalLevel: '3 sao',
    status: 'CERTIFIED',
    statusLabel: 'Đã công nhận',
    statusColor: 'green',
    year: 2025,
    submissionDate: '15/01/2025',
    totalScore: 68.0,
    progressPercent: 100,
    cooperativeCode: 'HTX-001',
    address: 'Xã Tân Tiến, Huyện Đức Trọng, Lâm Đồng',
    representative: 'Nguyễn Văn A',
    phone: '0987 111 222',
    email: 'tantien@htx.vn',
    memberCount: 90,
    laborCount: 30,
    establishedDate: '12/05/2019',
  },
  {
    id: 'OCOP-2025-003',
    stt: 3,
    code: 'OCOP-2025-003',
    productName: 'Trà thảo mộc Cầu Đất',
    productImage: 'https://images.unsplash.com/photo-1576092768241-dec231879fc3?auto=format&fit=crop&w=600&q=80',
    subjectName: 'HTX Tân Tiến',
    productCategory: 'Đồ uống',
    targetStar: 3,
    evalLevel: '3 sao',
    status: 'SELF_EVALUATING',
    statusLabel: 'Đang tự đánh giá',
    statusColor: 'amber',
    year: 2025,
    submissionDate: '20/02/2025',
    totalScore: 55.0,
    progressPercent: 40,
    cooperativeCode: 'HTX-001',
    address: 'Xã Tân Tiến, Huyện Đức Trọng, Lâm Đồng',
    representative: 'Lê Văn C',
    phone: '0987 333 444',
    email: 'trathaomoc@htx.vn',
    memberCount: 60,
    laborCount: 25,
    establishedDate: '01/03/2020',
  },
  {
    id: 'OCOP-2025-004',
    stt: 4,
    code: 'OCOP-2025-004',
    productName: 'Mật ong rừng tự nhiên',
    productImage: 'https://images.unsplash.com/photo-1587049352847-81a56d773cae?auto=format&fit=crop&w=600&q=80',
    subjectName: 'HTX Tân Tiến',
    productCategory: 'Thực phẩm',
    targetStar: 3,
    evalLevel: '3 sao',
    status: 'SELF_EVALUATING',
    statusLabel: 'Đang tự đánh giá',
    statusColor: 'amber',
    year: 2025,
    submissionDate: '01/03/2025',
    totalScore: 52.0,
    progressPercent: 30,
    cooperativeCode: 'HTX-001',
    address: 'Xã Tân Tiến, Huyện Đức Trọng, Lâm Đồng',
    representative: 'Phạm Văn D',
    phone: '0987 555 666',
    email: 'matong@htx.vn',
    memberCount: 45,
    laborCount: 15,
    establishedDate: '15/08/2021',
  },
  {
    id: 'OCOP-2025-005',
    stt: 5,
    code: 'OCOP-2025-005',
    productName: 'Tinh dầu sả nguyên chất',
    productImage: 'https://images.unsplash.com/photo-1608571423902-eed4a5ad8108?auto=format&fit=crop&w=600&q=80',
    subjectName: 'HTX Tân Tiến',
    productCategory: 'Thảo dược',
    targetStar: 3,
    evalLevel: '3 sao',
    status: 'NOT_STARTED',
    statusLabel: 'Chưa bắt đầu',
    statusColor: 'gray',
    year: 2025,
    submissionDate: '--/--/2025',
    totalScore: 0,
    progressPercent: 0,
    cooperativeCode: 'HTX-001',
    address: 'Xã Tân Tiến, Huyện Đức Trọng, Lâm Đồng',
    representative: 'Hoàng Văn E',
    phone: '0987 777 888',
    email: 'tinhdau@htx.vn',
    memberCount: 30,
    laborCount: 10,
    establishedDate: '20/11/2022',
  }
];

export const MOCK_CRITERIA_GROUPS_SUMMARY: CriteriaGroupSummary[] = [
  { id: 1, name: '1. Sản phẩm và sức mạnh cộng đồng', weight: 20, maxScore: 20, achievedScore: 17.5, percent: 87.5 },
  { id: 2, name: '2. Khả năng tiếp thị', weight: 20, maxScore: 20, achievedScore: 16.0, percent: 80.0 },
  { id: 3, name: '3. Chất lượng sản phẩm', weight: 20, maxScore: 20, achievedScore: 18.5, percent: 92.5 },
  { id: 4, name: '4. An toàn thực phẩm', weight: 15, maxScore: 15, achievedScore: 13.5, percent: 90.0 },
  { id: 5, name: '5. Môi trường và phát triển bền vững', weight: 10, maxScore: 10, achievedScore: 8.5, percent: 85.0 },
  { id: 6, name: '6. Quản trị và điều hành', weight: 5, maxScore: 5, achievedScore: 4.5, percent: 90.0 },
];

export const MOCK_CRITERIA_DETAILS: OcopCriterionDetail[] = [
  // Group 1
  { id: '1.1', groupId: 1, groupName: 'Sản phẩm và sức mạnh cộng đồng', code: '1.1', name: 'Nguồn gốc, xuất xứ sản phẩm', maxScore: 5, selfScore: 4.5, note: 'Sản phẩm có nguồn gốc rõ ràng từ vùng trồng HTX Tân Tiến', isMandatory: true },
  { id: '1.2', groupId: 1, groupName: 'Sản phẩm và sức mạnh cộng đồng', code: '1.2', name: 'Đặc điểm, chất lượng sản phẩm', maxScore: 5, selfScore: 4.0, note: 'Đạt tiêu chuẩn VietGAP còn hiệu lực đến năm 2028', isMandatory: true },
  { id: '1.3', groupId: 1, groupName: 'Sản phẩm và sức mạnh cộng đồng', code: '1.3', name: 'Liên kết chuỗi giá trị', maxScore: 5, selfScore: 4.5, note: 'Có hợp đồng bao tiêu 4.720 tấn rau/năm với hệ thống WinMart', isMandatory: fontMandatory(true) },
  { id: '1.4', groupId: 1, groupName: 'Sản phẩm và sức mạnh cộng đồng', code: '1.4', name: 'Tác động cộng đồng & Lao động', maxScore: 5, selfScore: 4.5, note: 'Tạo việc làm cho 48 lao động địa phương và 125 hộ xã viên', isMandatory: false },

  // Group 2
  { id: '2.1', groupId: 2, groupName: 'Khả năng tiếp thị', code: '2.1', name: 'Bao bì, thiết kế đóng gói', maxScore: 5, selfScore: 4.0, note: 'Khay màng co có tem nhãn in logo nhãn hiệu HTX', isMandatory: true },
  { id: '2.2', groupId: 2, groupName: 'Khả năng tiếp thị', code: '2.2', name: 'Ghi nhãn NĐ 43/2017 & Tem QR', maxScore: 5, selfScore: 4.0, note: 'Có mã QR code truy xuất nguồn gốc tem nhãn', isMandatory: true },
  { id: '2.3', groupId: 2, groupName: 'Khả năng tiếp thị', code: '2.3', name: 'Đăng ký Sở hữu trí tuệ', maxScore: 5, selfScore: 4.0, note: 'Đã có Giấy chứng nhận đăng ký Nhãn hiệu', isMandatory: false },
  { id: '2.4', groupId: 2, groupName: 'Khả năng tiếp thị', code: '2.4', name: 'Kênh phân phối & Quảng bá', maxScore: 5, selfScore: 4.0, note: 'Bán lẻ qua siêu thị WinMart, Bách Hóa Xanh và Shopee', isMandatory: false },

  // Group 3
  { id: '3.1', groupId: 3, groupName: 'Chất lượng sản phẩm', code: '3.1', name: 'Chỉ tiêu cảm quan hình thức', maxScore: 5, selfScore: 4.5, note: 'Ớt Sweet Palermo đỏ rực giòn ngọt, vỏ bóng đẹp', isMandatory: true },
  { id: '3.2', groupId: 3, groupName: 'Chất lượng sản phẩm', code: '3.2', name: 'Hàm lượng dinh dưỡng Vitamin C', maxScore: 5, selfScore: 5.0, note: 'Phiếu kiểm nghiệm chứng minh hàm lượng Vitamin C cao', isMandatory: true },
  { id: '3.3', groupId: 3, groupName: 'Chất lượng sản phẩm', code: '3.3', name: 'Sự khác biệt & Độc đáo', maxScore: 5, selfScore: 4.5, note: 'Giống ớt dáng dài bản quyền Rijk Zwaan Hà Lan', isMandatory: false },
  { id: '3.4', groupId: 3, groupName: 'Chất lượng sản phẩm', code: '3.4', name: 'Tiêu chuẩn & Xuất khẩu', maxScore: 5, selfScore: 4.5, note: 'Đã có mã cơ sở đóng gói xuất khẩu (Packhouse code)', isMandatory: false },

  // Group 4
  { id: '4.1', groupId: 4, groupName: 'An toàn thực phẩm', code: '4.1', name: 'Chứng nhận ATTP / QCVN 8-2:2011', maxScore: 5, selfScore: 4.5, note: 'Có bản tự công bố và chứng nhận ATTP còn hiệu lực', isMandatory: true },
  { id: '4.2', groupId: 4, groupName: 'An toàn thực phẩm', code: '4.2', name: 'Dư lượng BVTV & Tuân thủ PHI', maxScore: 5, selfScore: 4.5, note: 'Nhật ký phun thuốc tuân thủ thời gian cách ly 100%', isMandatory: true },
  { id: '4.3', groupId: 4, groupName: 'An toàn thực phẩm', code: '4.3', name: 'Phiếu thử nghiệm vi sinh', maxScore: 5, selfScore: 4.5, note: 'Phiếu kiểm nghiệm trung tâm ISO 17025 đạt chuẩn', isMandatory: true },

  // Group 5
  { id: '5.1', groupId: 5, groupName: 'Môi trường & phát triển bền vững', code: '5.1', name: 'Đánh giá tác động môi trường', maxScore: 5, selfScore: 4.5, note: 'Xử lý phụ phẩm nông nghiệp vi sinh làm phân hữu cơ', isMandatory: false },
  { id: '5.2', groupId: 5, groupName: 'Môi trường & phát triển bền vững', code: '5.2', name: 'Tiết kiệm năng lượng & Tưới nhỏ giọt', maxScore: 5, selfScore: 4.0, note: 'Hệ thống tưới fertigation Israel tiết kiệm 40% nước', isMandatory: false },

  // Group 6
  { id: '6.1', groupId: 6, groupName: 'Quản trị và điều hành', code: '6.1', name: 'Sổ sách kế toán & Minh bạch', maxScore: 5, selfScore: 4.5, note: 'Sử dụng phần mềm quản trị kế toán HTX minh bạch', isMandatory: false },
];

function fontMandatory(val: boolean): boolean {
  return val;
}

export const MOCK_EVIDENCES_FULL: EvidenceItem[] = [
  {
    id: 'EV-01',
    title: 'Giấy chứng nhận VietGAP Ớt chuông Sweet Palermo',
    category: 'QUALITY',
    categoryLabel: 'Chất lượng sản phẩm',
    criterionCode: '1.2, 3.1',
    uploadedAt: '10/02/2025',
    fileName: 'giay_chung_nhan_VietGAP.pdf',
    fileSize: '3.4 MB',
    fileHashSha256: 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855',
    status: 'VALID',
  },
  {
    id: 'EV-02',
    title: 'Phiếu kết quả kiểm nghiệm hàm lượng Vitamin C & Dư lượng BVTV',
    category: 'QUALITY',
    categoryLabel: 'Chất lượng sản phẩm',
    criterionCode: '1.3, 3.2',
    uploadedAt: '08/02/2025',
    fileName: 'ket_qua_kiem_nghiem.pdf',
    fileSize: '2.4 MB',
    fileHashSha256: '8f434346648f6b96df89dda901c5176b10a6d83961dd3c1ac88b59b2dc327aa4',
    status: 'VALID',
  },
  {
    id: 'EV-03',
    title: 'Giấy chứng nhận Mã số vùng trồng ớt chuông Đà Lạt',
    category: 'PROCESS',
    categoryLabel: 'Quy trình sản xuất',
    criterionCode: '2.1, 2.2',
    uploadedAt: '05/02/2025',
    fileName: 'ma_so_vung_trong.pdf',
    fileSize: '1.8 MB',
    fileHashSha256: 'a591a6d40bf420404a011733cfb7b190d62c65bf0bcda32b57b277d9ad9f146e',
    status: 'VALID',
  },
  {
    id: 'EV-04',
    title: 'Hợp đồng liên kết bao tiêu sản phẩm với Siêu thị WinMart',
    category: 'LEGAL',
    categoryLabel: 'Hồ sơ pháp lý',
    criterionCode: '4.5, 4.2',
    uploadedAt: '01/02/2025',
    fileName: 'hop_dong_bao_tieu_winmart.pdf',
    fileSize: '4.1 MB',
    fileHashSha256: '9f86d081884c7d659a2feaa0c55ad015a3bf4f1b2b0b822cd15d6c15b0f00a08',
    status: 'VALID',
  }
];

export const MOCK_TIMELINE_SCHEDULES: TimelineScheduleItem[] = [
  { id: '1', date: '15/03/2025', title: 'Thẩm định cấp huyện', productName: 'Ớt chuông Sweet Palermo', type: 'COMMUNE' },
  { id: '2', date: '25/03/2025', title: 'Đánh giá cấp tỉnh', productName: 'Trà thảo mộc', type: 'PROVINCIAL' },
  { id: '3', date: '10/04/2025', title: 'Hội đồng đánh giá', productName: 'Mật ong rừng', type: 'COUNCIL' },
];

export const ocopServiceFull = {
  async getDossiersList(): Promise<OcopDossierItem[]> {
    try {
      const res = await apiClient.get('/ocop/applications');
      if (res && Array.isArray((res as any).data)) {
        return (res as any).data;
      }
    } catch {
      // Fallback
    }
    return MOCK_OCOP_DOSSIERS_FULL;
  },

  async getDossierDetail(id: string): Promise<OcopDossierItem> {
    try {
      const res = await apiClient.get(`/ocop/applications/${id}`);
      if (res && (res as any).data) {
        return (res as any).data;
      }
    } catch {
      // Fallback
    }
    return MOCK_OCOP_DOSSIERS_FULL.find((d) => d.id === id || d.code === id) || MOCK_OCOP_DOSSIERS_FULL[0];
  }
};
