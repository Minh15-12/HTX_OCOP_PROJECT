import { apiClient } from './apiClient';

export interface OcopProduct {
  id: string;
  name: string;
  category: string;
  targetStar: 3 | 4 | 5;
  cooperativeName: string;
  unit: string;
  farmLocation: string;
}

export interface OcopDossier {
  id: string;
  code: string;
  productName: string;
  productCategory: string;
  targetStar: 3 | 4 | 5;
  submittedBy: string;
  cooperativeCode: string;
  address: string;
  progressPercent: number;
  status: 
    | 'DRAFT'
    | 'INTERNAL_REVIEW'
    | 'HTX_SUBMITTED'
    | 'COMMUNE_REVIEWING'
    | 'COMMUNE_REVISION'
    | 'COMMUNE_APPROVED'
    | 'IN_EVALUATION'
    | 'REVISION_REQUIRED'
    | 'RESUBMITTED'
    | 'COUNCIL_SCORING'
    | 'CONSOLIDATED'
    | 'CERTIFIED'
    | 'REJECTED'
    | 'PROPOSED_5STAR'
    | 'CENTRAL_REVIEWING'
    | 'CERTIFIED_5STAR'
    | 'CENTRAL_REJECTED'
    | 'RENEWAL_PENDING'
    | 'EXPIRED'
    | 'REVOKED';
  statusLabel: string;
  year: number;
  criteriaVersion: string;
  selfScore: number;
  councilScore?: number;
  finalStar?: number;
  mandatoryPassed: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface OcopCriterion {
  id: string;
  code: string;
  section: 'A' | 'B' | 'C';
  sectionName: string;
  groupName: string;
  name: string;
  maxScore: number;
  description: string;
  scoringGuide: string;
  isMandatory: boolean;
  minStarRequirement?: number;
  farmerInstruction: string;
}

export interface OcopEvidence {
  id: string;
  applicationId: string;
  criterionCode: string;
  title: string;
  fileName: string;
  fileSize: string;
  fileHashSha256: string;
  mimeType: string;
  version: string;
  uploadedAt: string;
  expiryDate?: string;
  status: 'PENDING' | 'VERIFIED' | 'REJECTED' | 'EXPIRED';
  sourceModule?: 'VungTrong' | 'NhatKy' | 'PhieuThuMua' | 'VietGAP' | 'Manual';
}

export interface EvaluatorScoreItem {
  evaluatorId: string;
  evaluatorName: string;
  role: string;
  score: number;
  submittedAt: string;
  comments: string;
}

export const MOCK_OCOP_DOSSIERS: OcopDossier[] = [
  {
    id: 'DOS-2026-001',
    code: 'HS-OCOP-2026-01',
    productName: 'Ớt chuông Sweet Palermo Đỏ Đà Lạt',
    productCategory: 'Thực phẩm (Nông sản tươi sống)',
    targetStar: 4,
    submittedBy: 'HTX Dịch vụ Nông nghiệp Tổng hợp Tân Tiến',
    cooperativeCode: 'HTX-TANTIEN-DL',
    address: 'Xã Tân Tiến, Huyện Đức Trọng, Tỉnh Lâm Đồng',
    progressPercent: 92,
    status: 'COUNCIL_SCORING',
    statusLabel: 'Hội đồng đang chấm điểm (Blind Scoring)',
    year: 2026,
    criteriaVersion: 'Bộ tiêu chí QĐ 148/QĐ-TTg (2026)',
    selfScore: 88.5,
    councilScore: 86.5,
    mandatoryPassed: true,
    createdAt: '2026-01-15',
    updatedAt: '2026-10-01',
  },
  {
    id: 'DOS-2026-002',
    code: 'HS-OCOP-2026-02',
    productName: 'Trà Oolong Cầu Đất Thượng Hạng',
    productCategory: 'Đồ uống (Trà chế biến)',
    targetStar: 4,
    submittedBy: 'HTX Dịch vụ Nông nghiệp Tổng hợp Tân Tiến',
    cooperativeCode: 'HTX-TANTIEN-DL',
    address: 'Xã Tân Tiến, Huyện Đức Trọng, Tỉnh Lâm Đồng',
    progressPercent: 65,
    status: 'HTX_SUBMITTED',
    statusLabel: 'Đã nộp UBND Xã xác nhận (Biểu 03)',
    year: 2026,
    criteriaVersion: 'Bộ tiêu chí QĐ 148/QĐ-TTg (2026)',
    selfScore: 78.0,
    mandatoryPassed: true,
    createdAt: '2026-02-10',
    updatedAt: '2026-09-20',
  },
  {
    id: 'DOS-2026-003',
    code: 'HS-OCOP-2026-03',
    productName: 'Sầu Riêng Ri6 Đóng Thùng Xuất Khẩu',
    productCategory: 'Thực phẩm (Nông sản tươi)',
    targetStar: 5,
    submittedBy: 'HTX Dịch vụ Nông nghiệp Tổng hợp Tân Tiến',
    cooperativeCode: 'HTX-TANTIEN-DL',
    address: 'Xã Tân Tiến, Huyện Đức Trọng, Tỉnh Lâm Đồng',
    progressPercent: 100,
    status: 'CERTIFIED_5STAR',
    statusLabel: 'Công nhận OCOP 5 Sao Quốc Gia',
    year: 2026,
    criteriaVersion: 'Bộ tiêu chí QĐ 148/QĐ-TTg (2026)',
    selfScore: 94.0,
    councilScore: 93.5,
    finalStar: 5,
    mandatoryPassed: true,
    createdAt: '2025-06-01',
    updatedAt: '2026-08-15',
  },
  {
    id: 'DOS-2026-004',
    code: 'HS-OCOP-2026-04',
    productName: 'Dâu Tây Đà Lạt Sấy Dẻo Thượng Hạng',
    productCategory: 'Thực phẩm (Chế biến)',
    targetStar: 3,
    submittedBy: 'HTX Dịch vụ Nông nghiệp Tổng hợp Tân Tiến',
    cooperativeCode: 'HTX-TANTIEN-DL',
    address: 'Xã Tân Tiến, Huyện Đức Trọng, Tỉnh Lâm Đồng',
    progressPercent: 35,
    status: 'DRAFT',
    statusLabel: 'Nháp tự hoàn thiện hồ sơ',
    year: 2026,
    criteriaVersion: 'Bộ tiêu chí QĐ 148/QĐ-TTg (2026)',
    selfScore: 48.0,
    mandatoryPassed: false,
    createdAt: '2026-03-01',
    updatedAt: '2026-09-28',
  }
];

export const MOCK_CRITERIA_QD148: OcopCriterion[] = [
  // PHẦN A (40 điểm)
  {
    id: 'TC-A.1.1',
    code: 'TC-A.1.1',
    section: 'A',
    sectionName: 'PHẦN A: SẢN PHẨM & SỨC MẠNH CỘNG ĐỒNG (40 điểm)',
    groupName: 'I. Tổ chức sản xuất',
    name: 'Tỷ lệ nguyên liệu địa phương (trong tỉnh)',
    maxScore: 7,
    description: 'Tỷ lệ khối lượng nguyên liệu sản xuất sản phẩm được mua/thu hoạch trên địa bàn tỉnh.',
    scoringGuide: '100% ĐP: 7đ · ≥50%: 5đ · <50%: 1đ · Không có: 0đ',
    isMandatory: true,
    farmerInstruction: 'Bà con tải hóa đơn/bảng kê thu mua ớt chuông từ các vườn thành viên HTX tại Lâm Đồng để chứng minh 100% nguyên liệu địa phương.',
  },
  {
    id: 'TC-A.1.2',
    code: 'TC-A.1.2',
    section: 'A',
    sectionName: 'PHẦN A: SẢN PHẨM & SỨC MẠNH CỘNG ĐỒNG (40 điểm)',
    groupName: 'I. Tổ chức sản xuất',
    name: 'Vùng nguyên liệu tập trung, ổn định',
    maxScore: 3,
    description: 'Sản phẩm có vùng sản xuất tập trung được chứng nhận mã số vùng trồng hoặc quy hoạch.',
    scoringGuide: 'Có quy hoạch/mã vùng trồng: 3đ · Chưa ổn định: 1đ · Không có: 0đ',
    isMandatory: true,
    farmerInstruction: 'Đính kèm Giấy chứng nhận Mã số vùng trồng ớt chuông Sweet Palermo được cấp bởi Chi cục Trồng trọt & BVTV Lâm Đồng.',
  },
  {
    id: 'TC-A.2.1',
    code: 'TC-A.2.1',
    section: 'A',
    sectionName: 'PHẦN A: SẢN PHẨM & SỨC MẠNH CỘNG ĐỒNG (40 điểm)',
    groupName: 'I. Tổ chức sản xuất',
    name: 'Tỷ lệ lao động địa phương',
    maxScore: 5,
    description: 'Sử dụng lao động thường xuyên là người địa phương tại địa bàn xã/huyện.',
    scoringGuide: '100% lao động địa phương: 5đ · ≥50%: 3đ · <50%: 1đ',
    isMandatory: false,
    farmerInstruction: 'Tải danh sách 165 hộ xã viên & công nhân canh tác tại HTX Tân Tiến có xác nhận nhân khẩu của UBND Xã.',
  },
  {
    id: 'TC-A.3.1',
    code: 'TC-A.3.1',
    section: 'A',
    sectionName: 'PHẦN A: SẢN PHẨM & SỨC MẠNH CỘNG ĐỒNG (40 điểm)',
    groupName: 'I. Tổ chức sản xuất',
    name: 'Áp dụng Hệ thống quản lý chất lượng (VietGAP/GlobalGAP/ISO)',
    maxScore: 5,
    description: 'Sản phẩm đạt chứng nhận VietGAP, GlobalGAP, HACCP, ISO 22000 hoặc tiêu chuẩn quốc tế tương đương.',
    scoringGuide: '≥2 chứng nhận: 5đ · 1 chứng nhận VietGAP/GlobalGAP: 3đ · Đang xây dựng: 1đ',
    isMandatory: true,
    minStarRequirement: 4,
    farmerInstruction: 'Đính kèm Giấy chứng nhận VietGAP còn hiệu lực của HTX Tân Tiến (Điều kiện bắt buộc cho OCOP 4 sao trở lên).',
  },
  {
    id: 'TC-A.4.1',
    code: 'TC-A.4.1',
    section: 'A',
    sectionName: 'PHẦN A: SẢN PHẨM & SỨC MẠNH CỘNG ĐỒNG (40 điểm)',
    groupName: 'II. Phát triển sản phẩm',
    name: 'Có kế hoạch/phương án kinh doanh cụ thể, khả thi',
    maxScore: 5,
    description: 'Phương án sản xuất kinh doanh có phân tích thị trường, doanh thu, lợi nhuận và định hướng mở rộng.',
    scoringGuide: 'Đầy đủ, khả thi: 5đ · Sơ sài: 2đ · Không có: 0đ',
    isMandatory: true,
    farmerInstruction: 'Tải lên bản Phương án sản xuất kinh doanh Ớt chuông Sweet Palermo giai đoạn 2026-2028 của Giám đốc HTX.',
  },
  {
    id: 'TC-A.5.1',
    code: 'TC-A.5.1',
    section: 'A',
    sectionName: 'PHẦN A: SẢN PHẨM & SỨC MẠNH CỘNG ĐỒNG (40 điểm)',
    groupName: 'II. Phát triển sản phẩm',
    name: 'Ứng dụng KHCN, đổi mới sáng tạo trong sản xuất',
    maxScore: 5,
    description: 'Sử dụng hệ thống tưới nhỏ giọt Israel, nhà kính công nghệ cao, cảm biến vi khí hậu.',
    scoringGuide: 'Ứng dụng hiệu quả công nghệ cao: 5đ · Có ứng dụng: 3đ · Không: 0đ',
    isMandatory: false,
    farmerInstruction: 'Chụp ảnh & mô tả hệ thống nhà kính màng & tưới tự động fertigation công nghệ Israel đang vận hành tại HTX.',
  },
  {
    id: 'TC-A.6.1',
    code: 'TC-A.6.1',
    section: 'A',
    sectionName: 'PHẦN A: SẢN PHẨM & SỨC MẠNH CỘNG ĐỒNG (40 điểm)',
    groupName: 'III. Sức mạnh cộng đồng',
    name: 'Liên kết sản xuất theo chuỗi giá trị',
    maxScore: 5,
    description: 'Liên kết bao tiêu sản phẩm giữa HTX và các xã viên/doanh nghiệp thu mua.',
    scoringGuide: 'Chặt chẽ (có hợp đồng bao tiêu): 5đ · Có liên kết: 3đ · Lỏng lẻo: 1đ',
    isMandatory: true,
    farmerInstruction: 'Upload Hợp đồng bao tiêu 4.720 tấn rau/năm ký giữa HTX Tân Tiến và hệ thống siêu thị WinMart / Bách Hóa Xanh.',
  },
  {
    id: 'TC-A.7.1',
    code: 'TC-A.7.1',
    section: 'A',
    sectionName: 'PHẦN A: SẢN PHẨM & SỨC MẠNH CỘNG ĐỒNG (40 điểm)',
    groupName: 'III. Sức mạnh cộng đồng',
    name: 'Số lượng lao động thường xuyên',
    maxScore: 5,
    description: 'Số lượng lao động làm việc thường xuyên trong HTX.',
    scoringGuide: '>30 lao động: 5đ · 10-30 lao động: 3đ · <10 lao động: 1đ',
    isMandatory: false,
    farmerInstruction: 'Bảng xác nhận bảng lương & đóng BHXH cho công nhân lao động thường xuyên.',
  },

  // PHẦN B (25 điểm)
  {
    id: 'TC-B.8.1',
    code: 'TC-B.8.1',
    section: 'B',
    sectionName: 'PHẦN B: KHẢ NĂNG TIẾP THỊ (25 điểm)',
    groupName: 'IV. Tiếp thị sản phẩm',
    name: 'Chất lượng bao bì, thiết kế đóng gói',
    maxScore: 5,
    description: 'Bao bì túi zip/khay màng co thân thiện môi trường, có tem nhãn bắt mắt.',
    scoringGuide: 'Đẹp, chuyên nghiệp, thân thiện MT: 5đ · Khá: 3đ · Trung bình: 1đ',
    isMandatory: true,
    farmerInstruction: 'Chụp ảnh thiết kế khay đóng gói ớt chuông Palermo 300g có in logo nhãn hiệu HTX Tân Tiến.',
  },
  {
    id: 'TC-B.9.1',
    code: 'TC-B.9.1',
    section: 'B',
    sectionName: 'PHẦN B: KHẢ NĂNG TIẾP THỊ (25 điểm)',
    groupName: 'IV. Tiếp thị sản phẩm',
    name: 'Ghi nhãn sản phẩm theo Nghị định 43/2017/NĐ-CP',
    maxScore: 3,
    description: 'Ghi đầy đủ thành phần, NSX, HSD, hướng dẫn bảo quản, mã QR truy xuất.',
    scoringGuide: 'Đầy đủ đúng quy định: 3đ · Thiếu 1-2 nội dung: 1đ · Không đạt: 0đ',
    isMandatory: true,
    farmerInstruction: 'Tải file mẫu nhãn sản phẩm thể hiện rõ tên, địa chỉ, NSX, HSD, QR code truy xuất nguồn gốc.',
  },
  {
    id: 'TC-B.10.1',
    code: 'TC-B.10.1',
    section: 'B',
    sectionName: 'PHẦN B: KHẢ NĂNG TIẾP THỊ (25 điểm)',
    groupName: 'IV. Tiếp thị sản phẩm',
    name: 'Đăng ký Sở hữu trí tuệ (Nhãn hiệu/Chỉ dẫn địa lý)',
    maxScore: 4,
    description: 'Đã được Cục Sở hữu Trí tuệ cấp Giấy chứng nhận đăng ký Nhãn hiệu.',
    scoringGuide: 'Đã có GCN Nhãn hiệu: 4đ · Đã nộp đơn hợp lệ: 2đ · Chưa có: 0đ',
    isMandatory: false,
    farmerInstruction: 'Đính kèm Giấy chứng nhận đăng ký Nhãn hiệu "Sweet Palermo Tân Tiến Đà Lạt" do Cục SHTT cấp.',
  },
  {
    id: 'TC-B.11.1',
    code: 'TC-B.11.1',
    section: 'B',
    sectionName: 'PHẦN B: KHẢ NĂNG TIẾP THỊ (25 điểm)',
    groupName: 'IV. Tiếp thị sản phẩm',
    name: 'Hoạt động quảng bá, marketing & kênh bán hàng',
    maxScore: 3,
    description: 'Bán lẻ qua chuỗi siêu thị, sàn TMĐT (Shopee, TikTok Shop), trang web HTX.',
    scoringGuide: 'Đa kênh, đa dạng hiệu quả: 3đ · Hạn chế: 1đ · Không: 0đ',
    isMandatory: false,
    farmerInstruction: 'Chụp ảnh bài viết quảng bá, đường link gian hàng online & hình ảnh bày bán tại siêu thị WinMart.',
  },
  {
    id: 'TC-B.12.1',
    code: 'TC-B.12.1',
    section: 'B',
    sectionName: 'PHẦN B: KHẢ NĂNG TIẾP THỊ (25 điểm)',
    groupName: 'V. Câu chuyện sản phẩm',
    name: 'Nội dung gắn kết bản sắc văn hóa & đặc thù địa phương',
    maxScore: 5,
    description: 'Thuyết minh câu chuyện ớt chuông ngọt Sweet Palermo trồng trên đất đỏ bazan khí hậu cao nguyên Đà Lạt.',
    scoringGuide: 'Hấp dẫn, giàu cảm xúc, nét riêng: 5đ · Khá: 3đ · Sơ sài: 1đ',
    isMandatory: true,
    farmerInstruction: 'Soạn văn bản "Câu chuyện ớt chuông ngọt Palermo Tân Tiến: Giọt sương cao nguyên & bàn tay xã viên Đà Lạt".',
  },
  {
    id: 'TC-B.12.2',
    code: 'TC-B.12.2',
    section: 'B',
    sectionName: 'PHẦN B: KHẢ NĂNG TIẾP THỊ (25 điểm)',
    groupName: 'V. Câu chuyện sản phẩm',
    name: 'Hình thức trình bày câu chuyện sản phẩm (Video/Hình ảnh)',
    maxScore: 5,
    description: 'Bài thuyết minh có hình ảnh minh họa chất lượng cao hoặc clip giới thiệu.',
    scoringGuide: 'Chuyên nghiệp, video đẹp: 5đ · Có hình ảnh: 3đ · Chỉ có text: 1đ',
    isMandatory: false,
    farmerInstruction: 'Đính kèm bộ ảnh chất lượng cao và đường dẫn video ngắn giới thiệu quy trình trồng ớt Palermo.',
  },

  // PHẦN C (35 điểm)
  {
    id: 'TC-C.13.1',
    code: 'TC-C.13.1',
    section: 'C',
    sectionName: 'PHẦN C: CHẤT LƯỢNG SẢN PHẨM (35 điểm)',
    groupName: 'VI. Chỉ tiêu cảm quan, dinh dưỡng & tính độc đáo',
    name: 'Hình thức, màu sắc, mùi vị đặc trưng',
    maxScore: 5,
    description: 'Ớt chuông vỏ bóng mịn, màu đỏ tươi rực rỡ, vị ngọt đậm giòn tan, không nồng hăng.',
    scoringGuide: 'Hấp dẫn, đặc trưng nổi bật: 5đ · Khá: 3đ · Trung bình: 1đ',
    isMandatory: true,
    farmerInstruction: 'Bảng mô tả chỉ tiêu cảm quan kèm kết quả chấm thử nghiệm hương vị độc lập.',
  },
  {
    id: 'TC-C.14.1',
    code: 'TC-C.14.1',
    section: 'C',
    sectionName: 'PHẦN C: CHẤT LƯỢNG SẢN PHẨM (35 điểm)',
    groupName: 'VI. Chỉ tiêu cảm quan, dinh dưỡng & tính độc đáo',
    name: 'Giá trị dinh dưỡng nổi bật (Hàm lượng Vitamin C, Folic Acid)',
    maxScore: 5,
    description: 'Ớt Palermo chứa hàm lượng Vitamin C cao gấp 3 lần cam tươi, giàu chất chống oxy hóa.',
    scoringGuide: 'Có phiếu phân tích dinh dưỡng chứng minh: 5đ · Chưa rõ: 2đ',
    isMandatory: true,
    farmerInstruction: 'Đính kèm Phiếu kết quả thử nghiệm hàm lượng Vitamin C & Axit Folic từ Trung tâm Phân tích Kiểm nghiệm.',
  },
  {
    id: 'TC-C.15.1',
    code: 'TC-C.15.1',
    section: 'C',
    sectionName: 'PHẦN C: CHẤT LƯỢNG SẢN PHẨM (35 điểm)',
    groupName: 'VI. Chỉ tiêu cảm quan, dinh dưỡng & tính độc đáo',
    name: 'Tính độc đáo, sự khác biệt so với sản phẩm cùng loại',
    maxScore: 5,
    description: 'Giống ớt ngọt dáng dài Sweet Palermo bản quyền Rijk Zwaan trồng sinh học tuân thủ PHI tuyệt đối.',
    scoringGuide: 'Rất khác biệt, độc đáo: 5đ · Có khác biệt: 3đ · Ít: 1đ',
    isMandatory: false,
    farmerInstruction: 'Bản giải trình tính khác biệt so với ớt chuông vuông truyền thống trên thị trường.',
  },
  {
    id: 'TC-C.16.1',
    code: 'TC-C.16.1',
    section: 'C',
    sectionName: 'PHẦN C: CHẤT LƯỢNG SẢN PHẨM (35 điểm)',
    groupName: 'VII. Tiêu chuẩn sản phẩm & An toàn thực phẩm',
    name: 'Đạt TCVN/QCVN hoặc Tiêu chuẩn Quốc tế & An toàn Thực phẩm',
    maxScore: 10,
    description: 'Giấy chứng nhận ATTP hoặc tự công bố chất lượng tuân thủ QCVN 8-2:2011/BYT.',
    scoringGuide: 'Đạt tiêu chuẩn Quốc tế: 10đ · TCVN/QCVN: 7đ · Tự công bố hợp lệ: 3đ',
    isMandatory: true,
    farmerInstruction: 'Đính kèm Bản Tự công bố sản phẩm nông sản tươi an toàn và Giấy chứng nhận cơ sở đủ điều kiện ATTP.',
  },
  {
    id: 'TC-C.17.1',
    code: 'TC-C.17.1',
    section: 'C',
    sectionName: 'PHẦN C: CHẤT LƯỢNG SẢN PHẨM (35 điểm)',
    groupName: 'VII. Tiêu chuẩn sản phẩm & An toàn thực phẩm',
    name: 'Phạm vi thị trường tiêu thụ (Nội địa / Xuất khẩu)',
    maxScore: 5,
    description: 'Sản phẩm đã có mặt tại hệ thống siêu thị toàn quốc (Hà Nội, TP.HCM, Đà Nẵng).',
    scoringGuide: 'Đã xuất khẩu: 5đ · Toàn quốc: 3đ · Trong tỉnh: 1đ',
    isMandatory: false,
    farmerInstruction: 'Tải các hóa đơn bán hàng & hợp đồng phân phối cho hệ thống WinMart toàn quốc.',
  },
  {
    id: 'TC-C.18.1',
    code: 'TC-C.18.1',
    section: 'C',
    sectionName: 'PHẦN C: CHẤT LƯỢNG SẢN PHẨM (35 điểm)',
    groupName: 'VII. Tiêu chuẩn sản phẩm & An toàn thực phẩm',
    name: 'Tiềm năng & năng lực xuất khẩu',
    maxScore: 5,
    description: 'Có mã số cơ sở đóng gói xuất khẩu (Packhouse code) đi Singapore, Hàn Quốc.',
    scoringGuide: 'Đã xuất khẩu thường xuyên: 5đ · Đang chuẩn bị: 3đ · Tiềm năng: 1đ',
    isMandatory: false,
    farmerInstruction: 'Tải Giấy chứng nhận mã số cơ sở đóng gói phục vụ xuất khẩu được Cục Trồng trọt cấp.',
  }
];

export const MOCK_EVIDENCES: OcopEvidence[] = [
  {
    id: 'EVID-001',
    applicationId: 'DOS-2026-001',
    criterionCode: 'TC-A.3.1',
    title: 'Giấy chứng nhận VietGAP Ớt chuông HTX Tân Tiến',
    fileName: 'Giay_Chung_Nhan_VietGAP_TanTien_2026.pdf',
    fileSize: '3.4 MB',
    fileHashSha256: 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855',
    mimeType: 'application/pdf',
    version: 'v2.0',
    uploadedAt: '2026-02-15 09:30',
    expiryDate: '2028-02-15',
    status: 'VERIFIED',
    sourceModule: 'VietGAP',
  },
  {
    id: 'EVID-002',
    applicationId: 'DOS-2026-001',
    criterionCode: 'TC-A.1.2',
    title: 'Mã số vùng trồng Ớt chuông Sweet Palermo Đà Lạt',
    fileName: 'Ma_So_Vung_Trong_Palermo_ChiCuc.pdf',
    fileSize: '1.9 MB',
    fileHashSha256: 'a591a6d40bf420404a011733cfb7b190d62c65bf0bcda32b57b277d9ad9f146e',
    mimeType: 'application/pdf',
    version: 'v1.0',
    uploadedAt: '2026-02-18 14:20',
    expiryDate: '2027-12-31',
    status: 'VERIFIED',
    sourceModule: 'VungTrong',
  },
  {
    id: 'EVID-003',
    applicationId: 'DOS-2026-001',
    criterionCode: 'TC-C.14.1',
    title: 'Phiếu kiểm nghiệm hàm lượng Vitamin C & Dư lượng BVTV (Tuân thủ PHI)',
    fileName: 'Phieu_Kiem_Nhiem_Dinh_Duong_BVTV_2026.pdf',
    fileSize: '2.8 MB',
    fileHashSha256: '8f434346648f6b96df89dda901c5176b10a6d83961dd3c1ac88b59b2dc327aa4',
    mimeType: 'application/pdf',
    version: 'v1.0',
    uploadedAt: '2026-03-01 10:15',
    expiryDate: '2027-03-01',
    status: 'VERIFIED',
    sourceModule: 'NhatKy',
  },
  {
    id: 'EVID-004',
    applicationId: 'DOS-2026-001',
    criterionCode: 'TC-B.9.1',
    title: 'Mẫu Tem nhãn sản phẩm có Mã QR truy xuất nguồn gốc',
    fileName: 'Mau_Tem_Nhan_Ma_QR_Palermo.png',
    fileSize: '1.2 MB',
    fileHashSha256: 'c2d7607a3c30a8497677b1029c78ca14838b0933100222f77890733a46973ff5',
    mimeType: 'image/png',
    version: 'v1.0',
    uploadedAt: '2026-03-05 16:45',
    status: 'VERIFIED',
    sourceModule: 'Manual',
  },
  {
    id: 'EVID-005',
    applicationId: 'DOS-2026-001',
    criterionCode: 'TC-A.6.1',
    title: 'Hợp đồng liên kết bao tiêu sản phẩm với Hệ thống WinMart',
    fileName: 'Hop_Dong_Bao_Tieu_WinMart_TanTien.pdf',
    fileSize: '4.1 MB',
    fileHashSha256: '9f86d081884c7d659a2feaa0c55ad015a3bf4f1b2b0b822cd15d6c15b0f00a08',
    mimeType: 'application/pdf',
    version: 'v1.0',
    uploadedAt: '2026-03-10 11:00',
    expiryDate: '2027-12-31',
    status: 'VERIFIED',
    sourceModule: 'PhieuThuMua',
  },
];

export const MOCK_EVALUATOR_SCORES: EvaluatorScoreItem[] = [
  {
    evaluatorId: 'EV-01',
    evaluatorName: 'TS. Nguyễn Văn Hùng',
    role: 'Trưởng ban Giám khảo (Sở NN&PTNT Lâm Đồng)',
    score: 87.5,
    submittedAt: '2026-09-25 14:00',
    comments: 'Sản phẩm có chất lượng vượt trội, mẫu mã bao bì đẹp. Vùng nguyên liệu đạt VietGAP chuẩn.',
  },
  {
    evaluatorId: 'EV-02',
    evaluatorName: 'ThS. Trần Thị Mai',
    role: 'Chuyên gia Đột phá Công nghệ Thực phẩm',
    score: 88.0,
    submittedAt: '2026-09-25 15:30',
    comments: 'Ớt ngọt Palermo vị đậm giòn, hàm lượng Vitamin C cao. Đạt đầy đủ tiêu chí 4 sao.',
  },
  {
    evaluatorId: 'EV-03',
    evaluatorName: 'Ông Lê Hoàng Nam',
    role: 'Đại diện Chi cục Phát triển Nông thôn Tỉnh',
    score: 85.0,
    submittedAt: '2026-09-26 09:15',
    comments: 'HTX tạo việc làm tốt cho lao động địa phương. Cần duy trì mã số vùng trồng lâu dài.',
  },
  {
    evaluatorId: 'EV-04',
    evaluatorName: 'Bà Phạm Thị Thu',
    role: 'Đại diện Sở Công Thương Lâm Đồng',
    score: 86.0,
    submittedAt: '2026-09-26 11:45',
    comments: 'Kênh phân phối WinMart và sàn TMĐT phát triển bài bản. Đề xuất cấp công nhận 4 sao.',
  },
];

export const ocopService = {
  async getDossiers(): Promise<OcopDossier[]> {
    try {
      const res = await apiClient.get('/ocop/applications');
      if (res && Array.isArray((res as any).data)) {
        return (res as any).data;
      }
    } catch (e) {
      console.warn('Backend API unreached, using verified HTX Tân Tiến OCOP dataset fallback.');
    }
    return MOCK_OCOP_DOSSIERS;
  },

  async getDossierById(id: string): Promise<OcopDossier | undefined> {
    try {
      const res = await apiClient.get(`/ocop/applications/${id}`);
      if (res && (res as any).data) {
        return (res as any).data;
      }
    } catch (e) {
      console.warn('Backend API unreached, using mock detail fallback.');
    }
    return MOCK_OCOP_DOSSIERS.find((d) => d.id === id || d.code === id) || MOCK_OCOP_DOSSIERS[0];
  },

  async getCriteria(): Promise<OcopCriterion[]> {
    try {
      const res = await apiClient.get('/ocop/criteria-versions/latest/groups');
      if (res && Array.isArray((res as any).data)) {
        return (res as any).data;
      }
    } catch (e) {
      console.warn('Using QĐ 148 Criteria List.');
    }
    return MOCK_CRITERIA_QD148;
  },

  async getEvidences(applicationId: string): Promise<OcopEvidence[]> {
    try {
      const res = await apiClient.get(`/ocop/applications/${applicationId}/evidences`);
      if (res && Array.isArray((res as any).data)) {
        return (res as any).data;
      }
    } catch (e) {
      console.warn('Using Evidence list fallback.');
    }
    return MOCK_EVIDENCES.filter((e) => e.applicationId === applicationId || applicationId === 'DOS-2026-001');
  },

  async getEvaluatorScores(applicationId: string): Promise<EvaluatorScoreItem[]> {
    try {
      const res = await apiClient.get(`/ocop/applications/${applicationId}/scores`);
      if (res && Array.isArray((res as any).data)) {
        return (res as any).data;
      }
    } catch (e) {
      console.warn('Using Evaluator Scores fallback.');
    }
    return MOCK_EVALUATOR_SCORES;
  },

  calculateCompleteness(evidences: OcopEvidence[], criteria: OcopCriterion[]): { percent: number; missing: OcopCriterion[] } {
    const mandatoryCriteria = criteria.filter((c) => c.isMandatory);
    const coveredCodes = new Set(evidences.map((e) => e.criterionCode));
    
    const missing = mandatoryCriteria.filter((c) => !coveredCodes.has(c.code));
    const coveredCount = mandatoryCriteria.length - missing.length;
    const percent = Math.round((coveredCount / mandatoryCriteria.length) * 100);

    return { percent, missing };
  },

  calculateScoreStar(totalScore: number, hasMandatoryPassed: boolean): { star: 3 | 4 | 5 | 0; label: string; color: string } {
    if (!hasMandatoryPassed) {
      return { star: 0, label: 'Chưa đạt (Thiếu tiêu chí khống chế VietGAP/ATTP)', color: 'text-rose-600 font-bold' };
    }
    if (totalScore >= 90) return { star: 5, label: '⭐⭐⭐⭐⭐ 5 SAO (Cấp Quốc gia)', color: 'text-amber-500 font-black' };
    if (totalScore >= 70) return { star: 4, label: '⭐⭐⭐⭐ 4 SAO (Cấp Tỉnh)', color: 'text-amber-500 font-black' };
    if (totalScore >= 50) return { star: 3, label: '⭐⭐⭐ 3 SAO (Cấp Huyện)', color: 'text-emerald-600 font-black' };
    return { star: 0, label: 'Chưa đạt 3 sao (< 50 điểm)', color: 'text-rose-600 font-bold' };
  }
};
