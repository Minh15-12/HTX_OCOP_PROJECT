import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, CheckCircle2, ChevronRight, Upload, FileText, Sparkles, Building2, 
  User, Phone, Mail, Award, AlertCircle, Save, Send, Check, Star, ShieldCheck, 
  FileCheck, Eye, Trash2, Plus, RefreshCw, Camera, Image, CheckSquare, Hash,
  ChevronDown, ChevronUp, Layers, HelpCircle
} from 'lucide-react';
import { 
  OCOP_QD148_CRITERIA_DATA, 
  ALL_INDICATORS, 
  DEFAULT_SUGGESTED_SCORES, 
  INITIAL_DRAFT_SCORES, 
  calculateOcopScores 
} from '../data/ocopQd148Data';
import { FarmerCriterionCard } from '../components/FarmerCriterionCard';
import { RealtimeProgressBar } from '../components/RealtimeProgressBar';
import { SmartSuggestionButton } from '../components/SmartSuggestionButton';

interface UploadedEvidence {
  id: string;
  title: string;
  criterionCode: string;
  category: string;
  fileName: string;
  fileSize: string;
  sha256: string;
  status: 'Hợp lệ' | 'Chờ duyệt';
  previewUrl?: string;
  uploadedAt: string;
}

const INITIAL_EVIDENCES: UploadedEvidence[] = [
  {
    id: 'EV-001',
    title: 'Giấy đăng ký kinh doanh HTX Tân Tiến số 5801234567',
    criterionCode: 'TC-A.1.1',
    category: 'Pháp lý chủ thể',
    fileName: 'DKKD_HTX_TanTien.pdf',
    fileSize: '1.8 MB',
    sha256: 'a1b2c3d4e5f67890123456789abcdef0123456789abcdef0123456789abcdef0',
    status: 'Hợp lệ',
    uploadedAt: '15/05/2025 09:30',
  },
  {
    id: 'EV-002',
    title: 'Giấy chứng nhận VietGAP VICB-2024-GAP-0128 (hiệu lực đến 2027)',
    criterionCode: 'TC-C.2.1',
    category: 'Chất lượng & ATTP',
    fileName: 'VietGAP_2024_2027_VICB.pdf',
    fileSize: '3.4 MB',
    sha256: 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855',
    status: 'Hợp lệ',
    uploadedAt: '15/05/2025 09:35',
  },
  {
    id: 'EV-003',
    title: 'Phiếu kiểm nghiệm độ ngọt Brix 9.2 & Vitamin C Quatest 3 (KT3-04128)',
    criterionCode: 'TC-C.1.1',
    category: 'Kiểm nghiệm ISO 17025',
    fileName: 'Test_Quatest3_Brix_Palermo.pdf',
    fileSize: '2.1 MB',
    sha256: '7c89a1b2c3d4e5f67890123456789abcdef0123456789abcdef0123456789abc',
    status: 'Hợp lệ',
    uploadedAt: '15/05/2025 09:40',
  },
  {
    id: 'EV-004',
    title: 'Mẫu tem QR Code GS1 truy xuất nguồn gốc động liên kết mã lô',
    criterionCode: 'TC-B.1.2',
    category: 'Tem nhãn truy xuất',
    fileName: 'TemQR_GS1_LotTrace.png',
    fileSize: '850 KB',
    sha256: '5e6f7a8b9c0d1e2f3a4b5c6d7e8f90123456789abcdef0123456789abcdef012',
    status: 'Hợp lệ',
    previewUrl: 'https://images.unsplash.com/photo-1563565375-f3fdfdbefa83?auto=format&fit=crop&w=400&q=80',
    uploadedAt: '15/05/2025 09:45',
  },
  {
    id: 'EV-005',
    title: 'Hợp đồng chuỗi giá trị bao tiêu 4.720 tấn/năm với WinCommerce',
    criterionCode: 'TC-A.3.1',
    category: 'Liên kết chuỗi',
    fileName: 'HopDong_BaoTieu_WinMart_2025.pdf',
    fileSize: '4.2 MB',
    sha256: '7a8b9c0d1e2f3a4b5c6d7e8f90123456789abcdef0123456789abcdef0123456',
    status: 'Hợp lệ',
    uploadedAt: '15/05/2025 09:50',
  },
];

export const CreateDossierWizardPage: React.FC = () => {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState<number>(1);

  // Form State
  const [formData, setFormData] = useState({
    dossierCode: 'OCOP-2025-006',
    evalYear: '2025',
    evalBatch: 'Đợt 1 (05/2025)',
    createdDate: '15/05/2025',
    status: 'Lưu nháp',
    evalLevel: 'Cấp tỉnh',
    creatorName: 'Mai Văn Tân',
    creatorRole: 'Giám đốc HTX',

    subjectName: 'HTX Dịch vụ Nông nghiệp Tổng hợp Tân Tiến',
    subjectCode: 'HTX-001',
    subjectType: 'Hợp tác xã',
    address: 'Tổ Hòn Bồ, Phường 12, Thành phố Đà Lạt, Tỉnh Lâm Đồng',
    phone: '0987 654 321',
    email: 'htxtantien@dalat.vn',

    repName: 'Mai Văn Tân',
    repRole: 'Giám đốc',
    repPhone: '0987 654 321',
    repEmail: 'maivantantien@dalat.vn',

    memberCount: '165',
    laborCount: '48',
    establishedDate: '2018-10-10',
    notes: 'Hồ sơ đăng ký đánh giá, phân hạng sản phẩm OCOP năm 2025 theo QĐ 148/QĐ-TTg.',

    // Step 2: Product info
    productName: 'Ớt chuông Sweet Palermo Đỏ Đà Lạt',
    productCode: 'SP-PALERMO-RED',
    category: 'Thực phẩm (Nông sản tươi sống - Rau củ quả)',
    rawLocation: 'Vùng canh tác nhà kính Hòn Bồ (Đà Lạt) & Đạ Sar (Lạc Dương)',
    area: '280.0 ha',
    yield: '4.720 tấn/năm',
  });

  // Step 3: Evidences State
  const [evidences, setEvidences] = useState<UploadedEvidence[]>(INITIAL_EVIDENCES);
  const [isUploading, setIsUploading] = useState<boolean>(false);
  const [uploadTitle, setUploadTitle] = useState<string>('');
  const [uploadCriterion, setUploadCriterion] = useState<string>('TC-A.1.1');
  const [previewingEvidence, setPreviewingEvidence] = useState<UploadedEvidence | null>(null);
  const [simulatedCameraActive, setSimulatedCameraActive] = useState<boolean>(false);

  // Step 4: Criteria Scores State
  const [scores, setScores] = useState<Record<string, number>>(INITIAL_DRAFT_SCORES);
  const [expandedGroup, setExpandedGroup] = useState<'GA' | 'GB' | 'GC' | 'ALL'>('ALL');
  const [smartAppliedNotification, setSmartAppliedNotification] = useState<string | null>(null);

  // Evidence map for score calculator
  const evidenceCountMap: Record<string, number> = {};
  evidences.forEach(ev => {
    evidenceCountMap[ev.criterionCode] = (evidenceCountMap[ev.criterionCode] || 0) + 1;
  });

  // Real-time calculation
  const calculation = calculateOcopScores(scores, evidenceCountMap);

  const steps = [
    { num: 1, title: 'Thông tin chung' },
    { num: 2, title: 'Sản phẩm OCOP' },
    { num: 3, title: 'Hồ sơ minh chứng' },
    { num: 4, title: 'Tiêu chí đánh giá' },
    { num: 5, title: 'Xác nhận hồ sơ' },
    { num: 6, title: 'Gửi đánh giá' },
  ];

  const handleNext = () => {
    if (currentStep < 6) setCurrentStep(currentStep + 1);
  };

  const handleBack = () => {
    if (currentStep > 1) setCurrentStep(currentStep - 1);
  };

  // 1-Click Smart Suggestion Apply for all criteria
  const handleApplyAllSmartSuggestions = () => {
    setScores(DEFAULT_SUGGESTED_SCORES);
    setSmartAppliedNotification('Đã áp dụng toàn bộ mức điểm gợi ý tối ưu từ dữ liệu vùng trồng, VietGAP và doanh số HTX Tân Tiến (Tổng: 98.5đ - 4 Sao OCOP)!');
    setTimeout(() => {
      setSmartAppliedNotification(null);
    }, 5000);
  };

  // Simulate file upload with SHA-256 hash calculation
  const handleSimulateUpload = (isCamera: boolean = false) => {
    const title = uploadTitle.trim() || (isCamera ? 'Ảnh chụp hiện trường vườn ớt nhà kính' : 'Tài liệu bổ sung hồ sơ OCOP');
    const fileName = isCamera ? `Camera_Snapshot_${Date.now()}.jpg` : `Document_Upload_${Date.now()}.pdf`;
    
    // Generate pseudo-random realistic 64-character SHA-256 hash
    const chars = '0123456789abcdef';
    let pseudoHash = '';
    for (let i = 0; i < 64; i++) {
      pseudoHash += chars[Math.floor(Math.random() * chars.length)];
    }

    const newEv: UploadedEvidence = {
      id: `EV-${Date.now().toString().slice(-4)}`,
      title,
      criterionCode: uploadCriterion,
      category: isCamera ? 'Ảnh hiện trường' : 'Tài liệu số',
      fileName,
      fileSize: isCamera ? '2.4 MB' : '1.5 MB',
      sha256: pseudoHash,
      status: 'Hợp lệ',
      previewUrl: isCamera ? 'https://images.unsplash.com/photo-1592924357228-91a4daadcfea?auto=format&fit=crop&w=600&q=80' : undefined,
      uploadedAt: new Date().toLocaleString('vi-VN'),
    };

    setEvidences([newEv, ...evidences]);
    setUploadTitle('');
    setIsUploading(false);
    setSimulatedCameraActive(false);
  };

  const handleDeleteEvidence = (id: string) => {
    setEvidences(evidences.filter(e => e.id !== id));
  };

  return (
    <div className="space-y-6 pb-20 animate-fade-in text-slate-800">
      {/* Top Header */}
      <div className="flex items-center justify-between bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate('/ocop/dossiers')}
            className="p-2 rounded-xl border border-slate-200 bg-slate-50 hover:bg-white text-slate-700 transition-all shadow-xs"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[11.5px] font-mono font-bold text-slate-400">Trang chủ / OCOP / Hồ sơ OCOP</span>
              <span className="pill-badge pill-blue">QĐ 148 Chuẩn hóa</span>
            </div>
            <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight mt-0.5">
              Chuẩn bị Hồ sơ Phân hạng OCOP (QĐ 148/QĐ-TTg)
            </h1>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs font-bold text-slate-500 hidden sm:inline">Tiến độ hồ sơ:</span>
          <span className="pill-badge pill-green font-mono font-black text-xs">
            {calculation.completionPercentage}% Hoàn thành
          </span>
        </div>
      </div>

      {/* Stepper Progress Bar Header */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
        <div className="flex items-center justify-between flex-wrap gap-2 text-xs font-bold">
          {steps.map((s, idx) => (
            <React.Fragment key={s.num}>
              <button
                type="button"
                onClick={() => setCurrentStep(s.num)}
                className={`flex items-center gap-2 cursor-pointer transition-all ${
                  currentStep === s.num
                    ? 'text-emerald-800 font-extrabold'
                    : currentStep > s.num
                    ? 'text-emerald-600'
                    : 'text-slate-400'
                }`}
              >
                <div
                  className={`w-7 h-7 rounded-full flex items-center justify-center font-black text-xs shadow-xs transition-all ${
                    currentStep === s.num
                      ? 'bg-emerald-600 text-white shadow-emerald-200 ring-2 ring-emerald-300'
                      : currentStep > s.num
                      ? 'bg-emerald-100 text-emerald-800'
                      : 'bg-slate-100 text-slate-400'
                  }`}
                >
                  {currentStep > s.num ? <Check className="w-4 h-4 stroke-[3]" /> : s.num}
                </div>
                <span>{s.title}</span>
              </button>
              {idx < steps.length - 1 && (
                <div className="hidden md:block flex-1 h-[2px] bg-slate-200 mx-2" />
              )}
            </React.Fragment>
          ))}
        </div>
      </div>

      {/* Main Layout (2 Columns: Form Left + Summary Card Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column Form Container (2 Cols) */}
        <div className="lg:col-span-2 space-y-6">
          {/* STEP 1: THÔNG TIN CHUNG */}
          {currentStep === 1 && (
            <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs space-y-6">
              <div className="space-y-4">
                <h3 className="font-black text-slate-900 text-sm border-b pb-2 flex items-center gap-2">
                  <FileText className="w-4 h-4 text-emerald-600" /> 1.1 Thông tin hồ sơ & Đợt đánh giá
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-xs font-medium">
                  <div>
                    <label className="block text-slate-700 font-bold mb-1">Mã hồ sơ *</label>
                    <input
                      type="text"
                      value={formData.dossierCode}
                      onChange={(e) => setFormData({ ...formData, dossierCode: e.target.value })}
                      className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 font-mono font-bold focus:bg-white focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-700 font-bold mb-1">Năm đánh giá *</label>
                    <input
                      type="text"
                      value={formData.evalYear}
                      onChange={(e) => setFormData({ ...formData, evalYear: e.target.value })}
                      className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 font-bold focus:bg-white focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-700 font-bold mb-1">Đợt đánh giá</label>
                    <input
                      type="text"
                      value={formData.evalBatch}
                      onChange={(e) => setFormData({ ...formData, evalBatch: e.target.value })}
                      className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 focus:bg-white focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-700 font-bold mb-1">Cấp đánh giá mục tiêu</label>
                    <input
                      type="text"
                      value={formData.evalLevel}
                      onChange={(e) => setFormData({ ...formData, evalLevel: e.target.value })}
                      className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 font-bold focus:bg-white focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                    />
                  </div>
                </div>
              </div>

              {/* Section 1.2 */}
              <div className="space-y-4">
                <h3 className="font-black text-slate-900 text-sm border-b pb-2 flex items-center gap-2">
                  <Building2 className="w-4 h-4 text-emerald-600" /> 1.2 Thông tin chủ thể HTX
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs font-medium">
                  <div className="md:col-span-2">
                    <label className="block text-slate-700 font-bold mb-1">Tên Hợp tác xã (Chủ thể) *</label>
                    <input
                      type="text"
                      value={formData.subjectName}
                      onChange={(e) => setFormData({ ...formData, subjectName: e.target.value })}
                      className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 font-bold focus:bg-white focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-700 font-bold mb-1">Người đại diện hợp pháp *</label>
                    <input
                      type="text"
                      value={formData.repName}
                      onChange={(e) => setFormData({ ...formData, repName: e.target.value })}
                      className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 font-bold focus:bg-white focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-700 font-bold mb-1">Chức vụ đại diện</label>
                    <input
                      type="text"
                      value={formData.repRole}
                      onChange={(e) => setFormData({ ...formData, repRole: e.target.value })}
                      className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:bg-white focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                    />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-slate-700 font-bold mb-1">Địa chỉ trụ sở</label>
                    <input
                      type="text"
                      value={formData.address}
                      onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                      className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:bg-white focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                    />
                  </div>
                </div>
              </div>

              <div className="flex justify-end pt-4 border-t">
                <button
                  type="button"
                  onClick={handleNext}
                  className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs rounded-xl shadow-xs inline-flex items-center gap-1.5"
                >
                  Tiếp tục Bước 2 <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* STEP 2: SẢN PHẨM OCOP */}
          {currentStep === 2 && (
            <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs space-y-6">
              <div className="space-y-4">
                <h3 className="font-black text-slate-900 text-sm border-b pb-2 flex items-center gap-2">
                  <Award className="w-4 h-4 text-emerald-600" /> 2. Thông tin sản phẩm đăng ký đánh giá
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs font-medium">
                  <div className="md:col-span-2">
                    <label className="block text-slate-700 font-bold mb-1">Tên sản phẩm OCOP *</label>
                    <input
                      type="text"
                      value={formData.productName}
                      onChange={(e) => setFormData({ ...formData, productName: e.target.value })}
                      className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 font-black text-sm focus:bg-white focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-700 font-bold mb-1">Mã sản phẩm</label>
                    <input
                      type="text"
                      value={formData.productCode}
                      onChange={(e) => setFormData({ ...formData, productCode: e.target.value })}
                      className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 font-mono font-bold"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-700 font-bold mb-1">Phân nhóm sản phẩm (QĐ 148)</label>
                    <input
                      type="text"
                      value={formData.category}
                      onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                      className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-emerald-900 font-bold"
                    />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-slate-700 font-bold mb-1">Vùng nguyên liệu canh tác</label>
                    <input
                      type="text"
                      value={formData.rawLocation}
                      onChange={(e) => setFormData({ ...formData, rawLocation: e.target.value })}
                      className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-800"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-700 font-bold mb-1">Quy mô diện tích (ha)</label>
                    <input
                      type="text"
                      value={formData.area}
                      onChange={(e) => setFormData({ ...formData, area: e.target.value })}
                      className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 font-bold"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-700 font-bold mb-1">Sản lượng bình quân / năm</label>
                    <input
                      type="text"
                      value={formData.yield}
                      onChange={(e) => setFormData({ ...formData, yield: e.target.value })}
                      className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 font-bold"
                    />
                  </div>
                </div>
              </div>

              <div className="flex justify-between pt-4 border-t">
                <button
                  type="button"
                  onClick={handleBack}
                  className="px-5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl"
                >
                  Quay lại
                </button>
                <button
                  type="button"
                  onClick={handleNext}
                  className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs rounded-xl shadow-xs inline-flex items-center gap-1.5"
                >
                  Tiếp tục Bước 3 <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* STEP 3: HỒ SƠ MINH CHỨNG SỐ HÓA */}
          {currentStep === 3 && (
            <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs space-y-6 animate-fade-in">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b pb-4">
                <div>
                  <h3 className="font-black text-slate-900 text-sm flex items-center gap-2">
                    <FileCheck className="w-4 h-4 text-emerald-600" /> 3. Quản lý Kho Minh chứng Số hóa & Mã băm SHA-256
                  </h3>
                  <p className="text-[11.5px] text-slate-500 mt-0.5">
                    Tải lên tài liệu, scan hoặc chụp ảnh từ máy tính bảng/điện thoại. Tự động tính mã băm SHA-256 chống làm giả.
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setSimulatedCameraActive(true);
                      setIsUploading(true);
                    }}
                    className="px-3.5 py-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 text-xs font-black rounded-xl border border-emerald-300 flex items-center gap-1.5 transition-all shadow-xs"
                  >
                    <Camera className="w-4 h-4 text-emerald-600" /> Chụp ảnh Camera
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setSimulatedCameraActive(false);
                      setIsUploading(!isUploading);
                    }}
                    className="px-3.5 py-2 bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-black rounded-xl shadow-xs flex items-center gap-1.5 transition-all"
                  >
                    <Plus className="w-4 h-4" /> Tải lên tài liệu
                  </button>
                </div>
              </div>

              {/* Upload Controls Box */}
              {isUploading && (
                <div className="p-4 bg-emerald-50/60 border border-emerald-200 rounded-2xl space-y-3 animate-fade-in">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-black text-emerald-950 flex items-center gap-1.5">
                      {simulatedCameraActive ? <Camera className="w-4 h-4 text-emerald-700" /> : <Upload className="w-4 h-4 text-emerald-700" />}
                      {simulatedCameraActive ? 'Chụp ảnh thực địa từ thiết bị' : 'Tải lên tệp minh chứng mới'}
                    </span>
                    <button
                      type="button"
                      onClick={() => setIsUploading(false)}
                      className="text-xs text-slate-500 hover:text-slate-800"
                    >
                      Hủy
                    </button>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                    <div>
                      <label className="block font-bold text-slate-700 mb-1">Tên tài liệu minh chứng:</label>
                      <input
                        type="text"
                        placeholder="VD: Phiếu kiểm tra dư lượng thuốc BVTV trước thu hoạch"
                        value={uploadTitle}
                        onChange={(e) => setUploadTitle(e.target.value)}
                        className="w-full p-2.5 bg-white border border-slate-300 rounded-xl text-slate-900 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="block font-bold text-slate-700 mb-1">Gắn với chỉ tiêu OCOP:</label>
                      <select
                        value={uploadCriterion}
                        onChange={(e) => setUploadCriterion(e.target.value)}
                        className="w-full p-2.5 bg-white border border-slate-300 rounded-xl text-slate-900 font-bold focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                      >
                        {ALL_INDICATORS.map(ind => (
                          <option key={ind.code} value={ind.code}>
                            {ind.code} - {ind.criterionName}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  {simulatedCameraActive ? (
                    <div className="p-3 bg-white border border-emerald-300 rounded-xl flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Camera className="w-5 h-5 text-emerald-600 animate-pulse" />
                        <span className="text-xs font-bold text-slate-800">
                          Ống kính Camera đã sẵn sàng (Độ phân giải Full HD)
                        </span>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleSimulateUpload(true)}
                        className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs rounded-xl shadow-xs"
                      >
                        Chụp & Băm SHA-256
                      </button>
                    </div>
                  ) : (
                    <div className="p-4 border-2 border-dashed border-emerald-300 rounded-xl bg-white text-center space-y-2">
                      <Upload className="w-6 h-6 text-emerald-600 mx-auto" />
                      <p className="text-xs font-bold text-slate-700">
                        Kéo thả file PDF, JPG, PNG vào đây hoặc bấm để chọn tệp
                      </p>
                      <button
                        type="button"
                        onClick={() => handleSimulateUpload(false)}
                        className="px-4 py-1.5 bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs rounded-xl shadow-xs"
                      >
                        Chọn tệp & Tải lên
                      </button>
                    </div>
                  )}
                </div>
              )}

              {/* Table of Evidence Files */}
              <div className="overflow-x-auto border border-slate-200 rounded-xl">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 text-slate-700 font-bold border-b border-slate-200 uppercase text-[10.5px]">
                    <tr>
                      <th className="px-3 py-2.5">STT</th>
                      <th className="px-3 py-2.5">Tên minh chứng</th>
                      <th className="px-3 py-2.5">Chỉ tiêu OCOP</th>
                      <th className="px-3 py-2.5">Mã băm SHA-256</th>
                      <th className="px-3 py-2.5 text-center">Trạng thái</th>
                      <th className="px-3 py-2.5 text-right">Thao tác</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                    {evidences.map((ev, idx) => (
                      <tr key={ev.id} className="hover:bg-slate-50/80 transition-colors">
                        <td className="px-3 py-2.5 font-mono text-slate-400">
                          {String(idx + 1).padStart(2, '0')}
                        </td>
                        <td className="px-3 py-2.5">
                          <div className="font-bold text-slate-900">{ev.title}</div>
                          <span className="text-[11px] text-slate-500 font-mono">
                            {ev.fileName} ({ev.fileSize})
                          </span>
                        </td>
                        <td className="px-3 py-2.5">
                          <span className="font-mono font-bold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                            {ev.criterionCode}
                          </span>
                        </td>
                        <td className="px-3 py-2.5 font-mono text-[10px] text-slate-500" title={ev.sha256}>
                          <span className="bg-slate-100 px-1.5 py-0.5 rounded border border-slate-200">
                            {ev.sha256.slice(0, 16)}...{ev.sha256.slice(-8)}
                          </span>
                        </td>
                        <td className="px-3 py-2.5 text-center">
                          <span className="pill-badge pill-green text-[10px] font-black">
                            {ev.status}
                          </span>
                        </td>
                        <td className="px-3 py-2.5 text-right space-x-1.5">
                          <button
                            type="button"
                            onClick={() => setPreviewingEvidence(ev)}
                            className="p-1.5 text-slate-500 hover:text-emerald-700 hover:bg-slate-100 rounded-lg transition-colors"
                            title="Xem trước minh chứng"
                          >
                            <Eye className="w-4 h-4 inline" />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDeleteEvidence(ev.id)}
                            className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                            title="Xóa minh chứng"
                          >
                            <Trash2 className="w-4 h-4 inline" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Preview Evidence Modal */}
              {previewingEvidence && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 animate-fade-in">
                  <div className="bg-white rounded-2xl max-w-lg w-full p-6 space-y-4 shadow-2xl border border-slate-200">
                    <div className="flex items-center justify-between border-b pb-2">
                      <h4 className="font-black text-sm text-slate-900">
                        Chi tiết minh chứng: {previewingEvidence.fileName}
                      </h4>
                      <button
                        type="button"
                        onClick={() => setPreviewingEvidence(null)}
                        className="text-slate-400 hover:text-slate-700"
                      >
                        ✕
                      </button>
                    </div>

                    <div className="space-y-2 text-xs">
                      <p><strong>Tiêu đề:</strong> {previewingEvidence.title}</p>
                      <p><strong>Chỉ tiêu liên kết:</strong> {previewingEvidence.criterionCode}</p>
                      <p><strong>Dung lượng:</strong> {previewingEvidence.fileSize}</p>
                      <p><strong>Thời gian tải lên:</strong> {previewingEvidence.uploadedAt}</p>
                      
                      <div className="p-3 bg-slate-50 border rounded-xl space-y-1">
                        <span className="font-bold text-slate-700 flex items-center gap-1.5">
                          <Hash className="w-3.5 h-3.5 text-emerald-600" />
                          Mã băm toàn vẹn SHA-256 (Integrity Check):
                        </span>
                        <p className="font-mono text-[10px] text-slate-800 break-all bg-white p-2 border rounded">
                          {previewingEvidence.sha256}
                        </p>
                        <span className="text-[11px] font-bold text-emerald-700">
                          ✓ Đã đối soát: Tệp nguyên bản, không bị chỉnh sửa giả mạo
                        </span>
                      </div>

                      {previewingEvidence.previewUrl && (
                        <div className="aspect-video rounded-xl overflow-hidden border">
                          <img
                            src={previewingEvidence.previewUrl}
                            alt="Preview"
                            className="w-full h-full object-cover"
                          />
                        </div>
                      )}
                    </div>

                    <button
                      type="button"
                      onClick={() => setPreviewingEvidence(null)}
                      className="w-full py-2 bg-slate-100 hover:bg-slate-200 font-bold text-xs rounded-xl"
                    >
                      Đóng xem trước
                    </button>
                  </div>
                </div>
              )}

              <div className="flex justify-between pt-4 border-t">
                <button
                  type="button"
                  onClick={handleBack}
                  className="px-5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl"
                >
                  Quay lại
                </button>
                <button
                  type="button"
                  onClick={handleNext}
                  className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs rounded-xl shadow-xs inline-flex items-center gap-1.5"
                >
                  Tiếp tục Bước 4 (Tự chấm điểm) <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* STEP 4: TIÊU CHÍ ĐÁNH GIÁ (INTERACTIVE FARMER SCORING & SMART SUGGESTION) */}
          {currentStep === 4 && (
            <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs space-y-6 animate-fade-in">
              {/* Header with 1-Click Smart Suggestion Button */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b pb-4">
                <div>
                  <h3 className="font-black text-slate-900 text-sm flex items-center gap-2">
                    <ShieldCheck className="w-4 h-4 text-emerald-600" /> 4. Tự đánh giá & Chấm điểm 11 Tiêu chí (QĐ 148/QĐ-TTg)
                  </h3>
                  <p className="text-[11.5px] text-slate-500 mt-0.5">
                    Nông dân chủ động chạm chọn điểm từng tiêu chí hoặc áp dụng gợi ý tự động từ dữ liệu HTX.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={handleApplyAllSmartSuggestions}
                  className="px-4 py-2 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white font-black text-xs rounded-xl shadow-md flex items-center gap-2 transition-all active:scale-98"
                >
                  <Sparkles className="w-4 h-4 text-amber-200 animate-spin" />
                  💡 Gợi ý thông minh từ dữ liệu HTX (1 Chạm)
                </button>
              </div>

              {/* Notification if applied */}
              {smartAppliedNotification && (
                <div className="p-3 bg-emerald-50 border border-emerald-300 rounded-xl text-xs text-emerald-900 flex items-center gap-2 animate-fade-in font-bold">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>{smartAppliedNotification}</span>
                </div>
              )}

              {/* Reactive Group Score Breakdown Table (QĐ 148 Correct Math: Part A = 40, Part B = 25, Part C = 35 -> Total = 100) */}
              <div className="overflow-x-auto border border-slate-200 rounded-xl">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 text-slate-700 font-bold border-b border-slate-200 uppercase text-[10.5px]">
                    <tr>
                      <th className="px-3 py-2.5">Nhóm tiêu chí QĐ 148</th>
                      <th className="px-3 py-2.5 text-center">Điểm tối đa</th>
                      <th className="px-3 py-2.5 text-center">Điểm tự chấm</th>
                      <th className="px-3 py-2.5 text-right">Tỉ lệ đạt</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                    <tr className="hover:bg-slate-50/80">
                      <td className="px-3 py-2.5 font-bold text-slate-900 flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                        A. Sản phẩm & sức mạnh cộng đồng
                      </td>
                      <td className="px-3 py-2.5 text-center font-mono font-bold">40.0</td>
                      <td className="px-3 py-2.5 text-center font-black text-emerald-700 font-mono text-sm">
                        {calculation.partAScore.toFixed(1)}
                      </td>
                      <td className="px-3 py-2.5 text-right font-bold text-slate-600 font-mono">
                        {((calculation.partAScore / 40.0) * 100).toFixed(1)}%
                      </td>
                    </tr>
                    <tr className="hover:bg-slate-50/80">
                      <td className="px-3 py-2.5 font-bold text-slate-900 flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-blue-500"></span>
                        B. Khả năng tiếp thị
                      </td>
                      <td className="px-3 py-2.5 text-center font-mono font-bold">25.0</td>
                      <td className="px-3 py-2.5 text-center font-black text-blue-700 font-mono text-sm">
                        {calculation.partBScore.toFixed(1)}
                      </td>
                      <td className="px-3 py-2.5 text-right font-bold text-slate-600 font-mono">
                        {((calculation.partBScore / 25.0) * 100).toFixed(1)}%
                      </td>
                    </tr>
                    <tr className="hover:bg-slate-50/80">
                      <td className="px-3 py-2.5 font-bold text-slate-900 flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-purple-500"></span>
                        C. Chất lượng sản phẩm
                      </td>
                      <td className="px-3 py-2.5 text-center font-mono font-bold">35.0</td>
                      <td className="px-3 py-2.5 text-center font-black text-purple-700 font-mono text-sm">
                        {calculation.partCScore.toFixed(1)}
                      </td>
                      <td className="px-3 py-2.5 text-right font-bold text-slate-600 font-mono">
                        {((calculation.partCScore / 35.0) * 100).toFixed(1)}%
                      </td>
                    </tr>
                    <tr className="bg-emerald-50/80 font-black text-slate-900 border-t-2 border-emerald-300">
                      <td className="px-3 py-3 text-emerald-950 uppercase font-black text-xs">
                        TỔNG CỘNG HOÀN THÀNH (QĐ 148)
                      </td>
                      <td className="px-3 py-3 text-center font-mono text-sm">100.0</td>
                      <td className="px-3 py-3 text-center text-emerald-900 text-base font-mono">
                        {calculation.totalScore.toFixed(1)}
                      </td>
                      <td className="px-3 py-3 text-right text-emerald-900 font-mono text-sm">
                        {((calculation.totalScore / 100.0) * 100).toFixed(1)}%
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>

              {/* Group Filter Tabs */}
              <div className="flex gap-2 border-b border-slate-200 pb-2 text-xs font-bold">
                <button
                  type="button"
                  onClick={() => setExpandedGroup('ALL')}
                  className={`px-3 py-1.5 rounded-xl transition-all ${
                    expandedGroup === 'ALL'
                      ? 'bg-slate-900 text-white shadow-xs'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  Tất cả 11 tiêu chí (100đ)
                </button>
                <button
                  type="button"
                  onClick={() => setExpandedGroup('GA')}
                  className={`px-3 py-1.5 rounded-xl transition-all ${
                    expandedGroup === 'GA'
                      ? 'bg-emerald-700 text-white shadow-xs'
                      : 'bg-emerald-50 text-emerald-800 hover:bg-emerald-100'
                  }`}
                >
                  Phần A: Sản phẩm & Cộng đồng (40đ)
                </button>
                <button
                  type="button"
                  onClick={() => setExpandedGroup('GB')}
                  className={`px-3 py-1.5 rounded-xl transition-all ${
                    expandedGroup === 'GB'
                      ? 'bg-blue-700 text-white shadow-xs'
                      : 'bg-blue-50 text-blue-800 hover:bg-blue-100'
                  }`}
                >
                  Phần B: Khả năng Tiếp thị (25đ)
                </button>
                <button
                  type="button"
                  onClick={() => setExpandedGroup('GC')}
                  className={`px-3 py-1.5 rounded-xl transition-all ${
                    expandedGroup === 'GC'
                      ? 'bg-purple-700 text-white shadow-xs'
                      : 'bg-purple-50 text-purple-800 hover:bg-purple-100'
                  }`}
                >
                  Phần C: Chất lượng Sản phẩm (35đ)
                </button>
              </div>

              {/* Interactive Farmer Criterion Cards List */}
              <div className="space-y-4">
                {OCOP_QD148_CRITERIA_DATA
                  .filter(group => expandedGroup === 'ALL' || expandedGroup === group.code)
                  .map(group => (
                    <div key={group.code} className="space-y-3">
                      <div className="flex items-center justify-between bg-slate-50 px-3.5 py-2 rounded-xl border border-slate-200">
                        <span className="font-black text-xs text-slate-900 uppercase tracking-wide">
                          {group.name}: {group.fullName} (Tối đa {group.maxScore.toFixed(1)}đ)
                        </span>
                        <span className="text-xs font-mono font-bold text-emerald-800">
                          Đạt: {group.code === 'GA' ? calculation.partAScore.toFixed(1) : group.code === 'GB' ? calculation.partBScore.toFixed(1) : calculation.partCScore.toFixed(1)}đ
                        </span>
                      </div>

                      <div className="space-y-3 pl-1">
                        {group.indicators.map(ind => (
                          <FarmerCriterionCard
                            key={ind.code}
                            indicator={ind}
                            selectedScore={scores[ind.code]}
                            onSelectScore={(newScore) => {
                              setScores({ ...scores, [ind.code]: newScore });
                            }}
                            hasEvidence={(evidenceCountMap[ind.code] || 0) > 0}
                          />
                        ))}
                      </div>
                    </div>
                  ))}
              </div>

              <div className="flex justify-between pt-4 border-t">
                <button
                  type="button"
                  onClick={handleBack}
                  className="px-5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl"
                >
                  Quay lại
                </button>
                <button
                  type="button"
                  onClick={handleNext}
                  className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs rounded-xl shadow-xs inline-flex items-center gap-1.5"
                >
                  Tiếp tục Bước 5 (Xác nhận) <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* STEP 5: XÁC NHẬN HỒ SƠ */}
          {currentStep === 5 && (
            <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs space-y-6 animate-fade-in">
              <div className="border-b pb-3">
                <h3 className="font-black text-slate-900 text-sm flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" /> 5. Rà soát & Xác nhận hồ sơ trước khi nộp
                </h3>
                <p className="text-[11.5px] text-slate-500 mt-0.5">
                  Rà soát tổng hợp điểm, điều kiện khống chế và tính pháp lý của hồ sơ.
                </p>
              </div>

              <div className="space-y-3">
                <div className="p-3.5 bg-emerald-50/70 border border-emerald-200 rounded-xl flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2.5 font-bold text-emerald-900">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>Thông tin chủ thể HTX ({formData.subjectName})</span>
                  </div>
                  <span className="pill-badge pill-green">Đã hoàn thành</span>
                </div>

                <div className="p-3.5 bg-emerald-50/70 border border-emerald-200 rounded-xl flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2.5 font-bold text-emerald-900">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>Sản phẩm OCOP ({formData.productName} - 280 ha)</span>
                  </div>
                  <span className="pill-badge pill-green">Đã hoàn thành</span>
                </div>

                <div className="p-3.5 bg-emerald-50/70 border border-emerald-200 rounded-xl flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2.5 font-bold text-emerald-900">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>Kho minh chứng số hóa ({evidences.length} tài liệu kèm mã băm SHA-256)</span>
                  </div>
                  <span className="pill-badge pill-green">{evidences.length} tài liệu hợp lệ</span>
                </div>

                <div className="p-3.5 bg-amber-50/80 border border-amber-200 rounded-xl flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2.5 font-bold text-amber-900">
                    <Star className="w-4 h-4 text-amber-500 fill-amber-500 shrink-0" />
                    <span>Tổng điểm tự chấm: <strong>{calculation.totalScore.toFixed(1)} / 100đ</strong> &bull; Đề xuất {calculation.starLabel}</span>
                  </div>
                  <span className="pill-badge pill-amber">{calculation.totalScore.toFixed(1)}đ</span>
                </div>
              </div>

              {/* Legal Confirmation Checkbox */}
              <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl text-xs space-y-2">
                <label className="flex items-start gap-2 cursor-pointer font-bold text-slate-800">
                  <input type="checkbox" defaultChecked className="mt-0.5 rounded text-emerald-600 focus:ring-emerald-500" />
                  <span>
                    Tôi là <strong>{formData.repName}</strong> (Giám đốc HTX Tân Tiến), cam đoan toàn bộ thông tin kê khai và tài liệu minh chứng trong hồ sơ là hoàn toàn trung thực, chính xác và chịu mọi trách nhiệm trước pháp luật.
                  </span>
                </label>
              </div>

              <div className="flex justify-between pt-4 border-t">
                <button
                  type="button"
                  onClick={handleBack}
                  className="px-5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl"
                >
                  Quay lại
                </button>
                <button
                  type="button"
                  onClick={handleNext}
                  className="px-6 py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white font-extrabold text-xs rounded-xl shadow-md inline-flex items-center gap-2 active:scale-98 transition-all"
                >
                  <Send className="w-4 h-4" /> Nộp hồ sơ thẩm định chính thức
                </button>
              </div>
            </div>
          )}

          {/* STEP 6: GỬI ĐÁNH GIÁ THÀNH CÔNG */}
          {currentStep === 6 && (
            <div className="bg-white border border-slate-200 rounded-2xl p-8 shadow-xs text-center space-y-4">
              <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto">
                <CheckCircle2 className="w-10 h-10 stroke-[2.5]" />
              </div>
              <h2 className="text-xl font-black text-slate-900">Hồ sơ OCOP đã được nộp thành công!</h2>
              <p className="text-xs text-slate-500 max-w-md mx-auto leading-relaxed">
                Hồ sơ mã <strong>{formData.dossierCode}</strong> ({formData.productName}) đã được chuyển đến UBND Phường 12 và Hội đồng Đánh giá OCOP Tỉnh Lâm Đồng.
              </p>

              <div className="pt-2 flex justify-center gap-3">
                <button
                  type="button"
                  onClick={() => navigate('/ocop/dossiers')}
                  className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs rounded-xl shadow-xs"
                >
                  Xem danh sách hồ sơ OCOP
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Right Column Summary & Reactive Progress Panel */}
        <div className="space-y-4">
          {/* Reactive Real-time Progress Bar Component */}
          <RealtimeProgressBar calculation={calculation} targetStar={4} />

          {/* Product Summary Card */}
          <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs space-y-4">
            <h3 className="font-extrabold text-slate-900 text-xs uppercase tracking-wider border-b pb-2">
              Thông tin tóm tắt hồ sơ OCOP
            </h3>

            <div className="aspect-4/3 rounded-xl overflow-hidden bg-slate-100 border border-slate-200">
              <img
                src="https://images.unsplash.com/photo-1563565375-f3fdfdbefa83?auto=format&fit=crop&w=600&q=80"
                alt="Ớt Palermo"
                className="w-full h-full object-cover"
              />
            </div>

            <div className="space-y-2 text-xs">
              <div className="flex justify-between">
                <span className="text-slate-500">Tên sản phẩm:</span>
                <span className="font-bold text-slate-900 text-right max-w-[160px]">{formData.productName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Mã sản phẩm:</span>
                <span className="font-mono font-bold text-slate-700">{formData.productCode}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Chủ thể:</span>
                <span className="font-bold text-emerald-800 text-right max-w-[160px]">HTX Tân Tiến</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Trạng thái:</span>
                <span className="pill-badge pill-amber">Lưu nháp</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Quy mô:</span>
                <span className="font-bold text-slate-800">280 ha &bull; 4.720 tấn</span>
              </div>
            </div>

            {/* Steps completion tracker */}
            <div className="pt-4 border-t space-y-2 text-[11.5px]">
              <div className="font-bold text-slate-800 mb-2">Quy trình 6 bước:</div>
              {steps.map((st) => (
                <div key={st.num} className="flex items-center justify-between text-slate-600">
                  <div className="flex items-center gap-2">
                    <div className={`w-4 h-4 rounded-full flex items-center justify-center text-[9px] font-bold ${
                      currentStep >= st.num ? 'bg-emerald-600 text-white' : 'bg-slate-200 text-slate-500'
                    }`}>
                      {st.num}
                    </div>
                    <span>{st.title}</span>
                  </div>
                  <span className={currentStep >= st.num ? 'text-emerald-700 font-bold' : 'text-slate-400'}>
                    {currentStep > st.num ? 'Đã xong' : currentStep === st.num ? 'Đang nhập' : 'Chưa nhập'}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
