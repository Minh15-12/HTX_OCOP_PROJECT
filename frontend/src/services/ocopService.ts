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

export const mapApiOcopDossierToFrontend = (item: any, index: number = 0): OcopDossierItem => {
  const statusMap: Record<string, { label: string; color: OcopDossierItem['statusColor'] }> = {
    DRAFT: { label: 'Bản nháp', color: 'gray' },
    SELF_EVALUATING: { label: 'Đang tự đánh giá', color: 'amber' },
    IN_EVALUATION: { label: 'Đang thẩm định', color: 'blue' },
    APPROVED: { label: 'Đã phê duyệt', color: 'green' },
    CERTIFIED: { label: 'Đã công nhận', color: 'green' },
    NOT_STARTED: { label: 'Chưa bắt đầu', color: 'gray' },
  };

  const st = statusMap[item.status] || { label: item.status || 'Khởi tạo', color: 'blue' };

  return {
    id: item.id,
    stt: index + 1,
    code: item.code || item.application_number || `OCOP-${item.id?.slice(0, 8)}`,
    productName: item.product_name || item.productName || item.product?.product_name || item.product?.name || 'Ớt chuông Sweet Palermo',
    productImage: item.product_image || item.productImage || 'https://images.unsplash.com/photo-1563565375-f3fdfdbefa83?auto=format&fit=crop&w=600&q=80',
    subjectName: item.cooperative?.legal_name || item.cooperative_name || item.subjectName || 'Hợp tác xã Nông nghiệp Tân Tiến',
    productCategory: item.product_category || item.productCategory || item.product?.category || 'Rau, củ, quả, hạt tươi',
    targetStar: (Number(item.target_star || item.targetStar || (item.star_rating > 0 ? item.star_rating : 4)) as any) || 4,
    evalLevel: `${item.star_rating > 0 ? item.star_rating : (item.target_star || item.targetStar || 4)} sao`,
    status: item.status || 'DRAFT',
    statusLabel: st.label,
    statusColor: st.color,
    year: Number(item.year || item.created_at?.slice(0, 4) || new Date().getFullYear()),
    submissionDate: item.submitted_at || item.created_at ? String(item.submitted_at || item.created_at).slice(0, 10) : 'Chưa nộp',
    totalScore: Number(item.total_score || item.total_self_assessment_score || item.self_score || item.totalScore || 0),
    progressPercent: Number(item.progress?.percentage || item.progress_percent || item.progressPercent || (item.status === 'APPROVED' ? 100 : item.status === 'SUBMITTED' ? 85 : item.status === 'SELF_EVALUATING' ? 65 : 20)),
    cooperativeCode: item.cooperative?.cooperative_code || item.cooperative_code || 'HTX',
    address: item.cooperative?.address || item.address || 'Chưa cập nhật',
    representative: item.cooperative?.representative_name || item.representative || 'Chưa cập nhật',
    phone: item.cooperative?.phone_number || item.cooperative?.phone || item.phone || 'Chưa cập nhật',
    email: item.cooperative?.email || item.email || 'Chưa cập nhật',
    memberCount: Number(item.cooperative?.total_members || item.member_count || 0),
    laborCount: Number(item.cooperative?.total_labor || item.labor_count || 0),
    establishedDate: item.cooperative?.established_date || item.established_date || 'Chưa cập nhật',
    submittedBy: item.submitted_by_name || item.submittedBy,
    selfScore: Number(item.total_self_assessment_score || item.self_score || item.selfScore || 0),
    criteriaVersion: item.criteria_version?.name || item.criteria_version_name || item.criteriaVersion || 'QĐ 148/QĐ-TTg',
    mandatoryPassed: item.mandatory_passed ?? true,
    createdAt: item.created_at,
    updatedAt: item.updated_at,
  };
};

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
    productName: 'Ớt chuông Sweet Palermo Vàng Đà Lạt',
    productImage: 'https://images.unsplash.com/photo-1556801712-76c8eb07ebb1?auto=format&fit=crop&w=600&q=80',
    subjectName: 'HTX Nông nghiệp Tân Tiến',
    productCategory: 'Rau, củ, quả, hạt tươi',
    targetStar: 4,
    evalLevel: '4 sao',
    status: 'IN_EVALUATION',
    statusLabel: 'Đang thẩm định',
    statusColor: 'blue',
    year: 2026,
    submissionDate: '10/02/2026',
    totalScore: 78.5,
    progressPercent: 85,
    cooperativeCode: 'HTX-TANTIEN-01',
    address: 'Xã Đạ Sar, Huyện Lạc Dương, Lâm Đồng',
    representative: 'Nguyễn Văn A',
    phone: '0987 111 222',
    email: 'tantien@htx.vn',
    memberCount: 165,
    laborCount: 48,
    establishedDate: '12/05/2019',
  },
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
  { id: '1.1', groupId: 1, groupName: 'Sản phẩm và sức mạnh cộng đồng', code: '1.1', name: 'Nguồn gốc, xuất xứ sản phẩm', maxScore: 5, selfScore: 4.5, note: 'Sản phẩm có nguồn gốc rõ ràng từ vùng trồng HTX Tân Tiến', isMandatory: true },
  { id: '1.2', groupId: 1, groupName: 'Sản phẩm và sức mạnh cộng đồng', code: '1.2', name: 'Đặc điểm, chất lượng sản phẩm', maxScore: 5, selfScore: 4.0, note: 'Đạt tiêu chuẩn VietGAP còn hiệu lực đến năm 2028', isMandatory: true },
  { id: '1.3', groupId: 1, groupName: 'Sản phẩm và sức mạnh cộng đồng', code: '1.3', name: 'Liên kết chuỗi giá trị', maxScore: 5, selfScore: 4.5, note: 'Có hợp đồng bao tiêu 4.720 tấn rau/năm với hệ thống WinMart', isMandatory: true },
];

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
];

export const MOCK_TIMELINE_SCHEDULES: TimelineScheduleItem[] = [
  { id: '1', date: '15/03/2026', title: 'Thẩm định cấp huyện', productName: 'Ớt chuông Sweet Palermo Đỏ', type: 'COMMUNE' },
  { id: '2', date: '25/03/2026', title: 'Đánh giá cấp tỉnh', productName: 'Ớt chuông Sweet Palermo Vàng', type: 'PROVINCIAL' },
  { id: '3', date: '10/04/2026', title: 'Hội đồng đánh giá', productName: 'Ớt chuông Sweet Palermo Cam', type: 'COUNCIL' },
];

export const ocopServiceFull = {
  async getDossiersList(): Promise<OcopDossierItem[]> {
    try {
      const res = await apiClient.get<any>('/ocop/applications');
      const data = Array.isArray(res.data) ? res.data : (res.data?.data || []);
      return data.map((item: any, idx: number) => mapApiOcopDossierToFrontend(item, idx));
    } catch (e) {
      console.error('Failed to fetch OCOP dossiers:', e);
      throw e;
    }
  },

  async getDossierDetail(id: string): Promise<OcopDossierItem> {
    const res = await apiClient.get<any>(`/ocop/applications/${id}`);
    const data = res.data?.data || res.data;
    if (data) {
      return mapApiOcopDossierToFrontend(data, 0);
    }
    throw new Error('Dossier not found');
  },

  async createDossier(payload: { product_id: string; criteria_version_id: string; target_star: number }): Promise<OcopDossierItem> {
    const res = await apiClient.post<any>('/ocop/applications', payload);
    return mapApiOcopDossierToFrontend(res.data?.data || res.data, 0);
  },

  async submitDossier(id: string): Promise<OcopDossierItem> {
    const res = await apiClient.post<any>(`/ocop/applications/${id}/submit`);
    return mapApiOcopDossierToFrontend(res.data?.data || res.data, 0);
  },

  async getEvidences(applicationId: string): Promise<EvidenceItem[]> {
    try {
      const res = await apiClient.get<any>(`/ocop/applications/${applicationId}/evidences`);
      const data = Array.isArray(res.data) ? res.data : (res.data?.data || []);
      return data.map((item: any) => ({
        id: item.id,
        title: item.title || item.name || 'Minh chứng OCOP',
        category: item.category || 'QUALITY',
        categoryLabel: item.category_label || 'Chất lượng',
        criterionCode: item.criterion_code || '1.1',
        uploadedAt: item.created_at ? String(item.created_at).slice(0, 10) : '',
        fileName: item.file_name || item.title || 'document.pdf',
        fileSize: item.file_size || '2.5 MB',
        fileHashSha256: item.file_hash || '',
        status: item.status || 'VALID',
      }));
    } catch (e) {
      console.error('Failed to fetch evidences:', e);
      return [];
    }
  },

  async getSelfAssessments(applicationId: string): Promise<any[]> {
    try {
      const res = await apiClient.get<any>(`/ocop/applications/${applicationId}/self-assessments`);
      return Array.isArray(res.data) ? res.data : (res.data?.data || []);
    } catch (e) {
      console.warn('Could not fetch self assessments:', e);
      return [];
    }
  },

  async getScoreSuggestions(applicationId: string): Promise<any> {
    try {
      const res = await apiClient.get<any>(`/ocop/applications/${applicationId}/score-suggestions`);
      return res.data?.data || res.data;
    } catch (e) {
      console.warn('Could not fetch score suggestions:', e);
      return null;
    }
  },

  async saveSelfAssessment(applicationId: string, payload: { indicator_id: string; score: number; explanation?: string }): Promise<any> {
    const res = await apiClient.post<any>(`/ocop/applications/${applicationId}/self-assessments`, payload);
    return res.data?.data || res.data;
  },
};

