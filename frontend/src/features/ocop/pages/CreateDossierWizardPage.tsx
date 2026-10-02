import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, CheckCircle2, ChevronRight, Upload, FileText, Sparkles, Building2, 
  User, Phone, Mail, Award, AlertCircle, Save, Send, Check, Star, ShieldCheck, 
  FileCheck, Eye, Trash2, Plus, RefreshCw 
} from 'lucide-react';
import { MOCK_OCOP_DOSSIERS_FULL } from '../../../services/ocopService';

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
    evalLevel: 'Cấp huyện',
    creatorName: 'Nguyễn Văn A',
    creatorRole: 'Nhân viên HTX',

    subjectName: 'HTX Nông nghiệp Xanh Phú Thịnh (HTX Tân Tiến)',
    subjectCode: 'HTX-001',
    subjectType: 'Hợp tác xã',
    address: 'Thôn 2, xã Mê Linh, huyện Lâm Hà, Lâm Đồng',
    phone: '0987 654 321',
    email: 'htxphuthinh@gmail.com',

    repName: 'Trần Văn B',
    repRole: 'Giám đốc',
    repPhone: '0987 654 321',
    repEmail: 'tramvanb@gmail.com',

    memberCount: '125',
    laborCount: '48',
    establishedDate: '2018-10-10',
    notes: 'Hồ sơ đăng ký đánh giá, phân hạng sản phẩm OCOP năm 2025.',

    // Step 2: Product info
    productName: 'Ớt chuông Sweet Palermo Đỏ Đà Lạt',
    productCode: 'SP-001',
    category: 'Thực phẩm (Nông sản tươi sống)',
    rawLocation: 'Vùng canh tác HTX Tân Tiến',
    area: '25.50 ha',
    yield: '120 tấn/năm',
  });

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
              <span className="pill-badge pill-blue">Tạo mới</span>
            </div>
            <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight mt-0.5">
              Thêm hồ sơ OCOP mới
            </h1>
          </div>
        </div>
      </div>

      {/* Horizontal Stepper Progress Bar Header (Image 2 Top) */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
        <div className="flex items-center justify-between flex-wrap gap-2 text-xs font-bold">
          {steps.map((s, idx) => (
            <React.Fragment key={s.num}>
              <div
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
                      ? 'bg-emerald-600 text-white shadow-emerald-200'
                      : currentStep > s.num
                      ? 'bg-emerald-100 text-emerald-800'
                      : 'bg-slate-100 text-slate-400'
                  }`}
                >
                  {currentStep > s.num ? <Check className="w-4 h-4 stroke-[3]" /> : s.num}
                </div>
                <span>{s.title}</span>
              </div>
              {idx < steps.length - 1 && (
                <div className="hidden md:block flex-1 h-[2px] bg-slate-200 mx-2" />
              )}
            </React.Fragment>
          ))}
        </div>
      </div>

      {/* Main Form Layout (2 Columns: Form Left + Summary Card Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column Form Container (2 Cols) */}
        <div className="lg:col-span-2 space-y-6">
          {/* STEP 1: THÔNG TIN CHUNG */}
          {currentStep === 1 && (
            <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs space-y-6">
              {/* Section 1.1 */}
              <div className="space-y-4">
                <h3 className="font-black text-slate-900 text-sm border-b pb-2 flex items-center gap-2">
                  <FileText className="w-4 h-4 text-emerald-600" /> 1.1 Thông tin hồ sơ
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
                    <select
                      value={formData.evalYear}
                      onChange={(e) => setFormData({ ...formData, evalYear: e.target.value })}
                      className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 font-bold focus:bg-white focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                    >
                      <option value="2025">2025</option>
                      <option value="2026">2026</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-slate-700 font-bold mb-1">Đợt đánh giá *</label>
                    <select
                      value={formData.evalBatch}
                      onChange={(e) => setFormData({ ...formData, evalBatch: e.target.value })}
                      className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 font-bold focus:bg-white focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                    >
                      <option>Đợt 1 (05/2025)</option>
                      <option>Đợt 2 (10/2025)</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-slate-700 font-bold mb-1">Ngày tạo hồ sơ *</label>
                    <input
                      type="text"
                      value={formData.createdDate}
                      onChange={(e) => setFormData({ ...formData, createdDate: e.target.value })}
                      className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 font-bold focus:bg-white focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-xs font-medium pt-2">
                  <div>
                    <label className="block text-slate-700 font-bold mb-1">Trạng thái</label>
                    <span className="pill-badge pill-amber px-3 py-1.5 inline-block font-bold">Lưu nháp</span>
                  </div>
                  <div>
                    <label className="block text-slate-700 font-bold mb-1">Cấp đánh giá *</label>
                    <select
                      value={formData.evalLevel}
                      onChange={(e) => setFormData({ ...formData, evalLevel: e.target.value })}
                      className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 font-bold focus:bg-white focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                    >
                      <option>Cấp huyện</option>
                      <option>Cấp tỉnh</option>
                      <option>Cấp trung ương</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-slate-700 font-bold mb-1">Người lập hồ sơ *</label>
                    <input
                      type="text"
                      value={formData.creatorName}
                      onChange={(e) => setFormData({ ...formData, creatorName: e.target.value })}
                      className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 font-bold focus:bg-white focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-700 font-bold mb-1">Chức vụ *</label>
                    <input
                      type="text"
                      value={formData.creatorRole}
                      onChange={(e) => setFormData({ ...formData, creatorRole: e.target.value })}
                      className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 font-bold focus:bg-white focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                    />
                  </div>
                </div>
              </div>

              {/* Section 1.2 */}
              <div className="space-y-4 pt-4 border-t">
                <h3 className="font-black text-slate-900 text-sm flex items-center gap-2">
                  <Building2 className="w-4 h-4 text-emerald-600" /> 1.2 Chủ thể OCOP
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs font-medium">
                  <div>
                    <label className="block text-slate-700 font-bold mb-1">Chủ thể OCOP *</label>
                    <input
                      type="text"
                      value={formData.subjectName}
                      onChange={(e) => setFormData({ ...formData, subjectName: e.target.value })}
                      className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 font-bold focus:bg-white focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-700 font-bold mb-1">Mã chủ thể</label>
                    <input
                      type="text"
                      value={formData.subjectCode}
                      onChange={(e) => setFormData({ ...formData, subjectCode: e.target.value })}
                      className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 font-mono font-bold focus:bg-white focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-700 font-bold mb-1">Loại hình chủ thể *</label>
                    <select
                      value={formData.subjectType}
                      onChange={(e) => setFormData({ ...formData, subjectType: e.target.value })}
                      className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 font-bold focus:bg-white focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                    >
                      <option>Hợp tác xã</option>
                      <option>Doanh nghiệp</option>
                      <option>Hộ kinh doanh</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs font-medium pt-2">
                  <div>
                    <label className="block text-slate-700 font-bold mb-1">Địa chỉ trụ sở *</label>
                    <input
                      type="text"
                      value={formData.address}
                      onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                      className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 font-bold focus:bg-white focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-700 font-bold mb-1">Điện thoại</label>
                    <input
                      type="text"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 font-bold focus:bg-white focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-700 font-bold mb-1">Email</label>
                    <input
                      type="text"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 font-bold focus:bg-white focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                    />
                  </div>
                </div>
              </div>

              {/* Section 1.3 */}
              <div className="space-y-4 pt-4 border-t">
                <h3 className="font-black text-slate-900 text-sm flex items-center gap-2">
                  <User className="w-4 h-4 text-emerald-600" /> 1.3 Thông tin liên hệ chính
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-xs font-medium">
                  <div>
                    <label className="block text-slate-700 font-bold mb-1">Người đại diện *</label>
                    <input
                      type="text"
                      value={formData.repName}
                      onChange={(e) => setFormData({ ...formData, repName: e.target.value })}
                      className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 font-bold focus:bg-white focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-700 font-bold mb-1">Chức vụ *</label>
                    <input
                      type="text"
                      value={formData.repRole}
                      onChange={(e) => setFormData({ ...formData, repRole: e.target.value })}
                      className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 font-bold focus:bg-white focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-700 font-bold mb-1">Điện thoại *</label>
                    <input
                      type="text"
                      value={formData.repPhone}
                      onChange={(e) => setFormData({ ...formData, repPhone: e.target.value })}
                      className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 font-bold focus:bg-white focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-700 font-bold mb-1">Email</label>
                    <input
                      type="text"
                      value={formData.repEmail}
                      onChange={(e) => setFormData({ ...formData, repEmail: e.target.value })}
                      className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 font-bold focus:bg-white focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                    />
                  </div>
                </div>
              </div>

              {/* Navigation Buttons */}
              <div className="flex justify-end pt-4 border-t">
                <button
                  onClick={handleNext}
                  className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs rounded-xl shadow-xs transition-all inline-flex items-center gap-1.5"
                >
                  Tiếp tục <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* STEP 2: SẢN PHẨM OCOP */}
          {currentStep === 2 && (
            <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs space-y-6">
              <h3 className="font-black text-slate-900 text-sm border-b pb-2">2. Thông tin Sản phẩm OCOP</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs font-medium">
                <div>
                  <label className="block text-slate-700 font-bold mb-1">Tên sản phẩm *</label>
                  <input
                    type="text"
                    value={formData.productName}
                    onChange={(e) => setFormData({ ...formData, productName: e.target.value })}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 font-extrabold focus:bg-white focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-slate-700 font-bold mb-1">Mã sản phẩm</label>
                  <input
                    type="text"
                    value={formData.productCode}
                    onChange={(e) => setFormData({ ...formData, productCode: e.target.value })}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 font-mono font-bold focus:bg-white focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  />
                </div>
              </div>

              <div className="flex justify-between pt-4 border-t">
                <button
                  onClick={handleBack}
                  className="px-5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl"
                >
                  Quay lại
                </button>
                <button
                  onClick={handleNext}
                  className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs rounded-xl shadow-xs inline-flex items-center gap-1.5"
                >
                  Tiếp tục <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* STEP 3: HỒ SƠ MINH CHỨNG */}
          {currentStep === 3 && (
            <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs space-y-5 animate-fade-in">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b pb-3">
                <div>
                  <h3 className="font-black text-slate-900 text-sm flex items-center gap-2">
                    <FileCheck className="w-4 h-4 text-emerald-600" /> 3. Danh mục Hồ sơ minh chứng số
                  </h3>
                  <p className="text-[11.5px] text-slate-500 mt-0.5">
                    Hệ thống tự động liên kết các chứng nhận, nhật ký sản xuất VietGAP & tài liệu có sẵn của HTX.
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    className="px-3 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 text-xs font-bold rounded-xl border border-emerald-200 flex items-center gap-1.5 transition-all"
                  >
                    <RefreshCw className="w-3.5 h-3.5" /> Tự động đồng bộ VietGAP
                  </button>
                  <button
                    type="button"
                    className="px-3.5 py-1.5 bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-extrabold rounded-xl shadow-xs flex items-center gap-1.5 transition-all"
                  >
                    <Plus className="w-3.5 h-3.5" /> Thêm minh chứng
                  </button>
                </div>
              </div>

              {/* Table of Evidence Files */}
              <div className="overflow-x-auto border border-slate-200 rounded-xl">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 text-slate-700 font-bold border-b border-slate-200 uppercase text-[10.5px]">
                    <tr>
                      <th className="px-3 py-2.5">STT</th>
                      <th className="px-3 py-2.5">Tên minh chứng</th>
                      <th className="px-3 py-2.5">Nhóm tiêu chí</th>
                      <th className="px-3 py-2.5">Trạng thái</th>
                      <th className="px-3 py-2.5 text-right">Thao tác</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                    <tr className="hover:bg-slate-50/80 transition-colors">
                      <td className="px-3 py-2.5 font-mono text-slate-400">01</td>
                      <td className="px-3 py-2.5 font-bold text-slate-900">Giấy đăng ký kinh doanh HTX Tân Tiến</td>
                      <td className="px-3 py-2.5 text-slate-500">A1. Pháp lý chủ thể</td>
                      <td className="px-3 py-2.5"><span className="pill-badge pill-green">Hợp lệ</span></td>
                      <td className="px-3 py-2.5 text-right space-x-2">
                        <button className="text-slate-400 hover:text-emerald-700"><Eye className="w-4 h-4 inline" /></button>
                        <button className="text-slate-400 hover:text-rose-600"><Trash2 className="w-4 h-4 inline" /></button>
                      </td>
                    </tr>
                    <tr className="hover:bg-slate-50/80 transition-colors">
                      <td className="px-3 py-2.5 font-mono text-slate-400">02</td>
                      <td className="px-3 py-2.5 font-bold text-slate-900">Giấy chứng nhận ATTP / VietGAP 2024-2027</td>
                      <td className="px-3 py-2.5 text-slate-500">C3. Chất lượng & ATTP</td>
                      <td className="px-3 py-2.5"><span className="pill-badge pill-green">Hợp lệ</span></td>
                      <td className="px-3 py-2.5 text-right space-x-2">
                        <button className="text-slate-400 hover:text-emerald-700"><Eye className="w-4 h-4 inline" /></button>
                        <button className="text-slate-400 hover:text-rose-600"><Trash2 className="w-4 h-4 inline" /></button>
                      </td>
                    </tr>
                    <tr className="hover:bg-slate-50/80 transition-colors">
                      <td className="px-3 py-2.5 font-mono text-slate-400">03</td>
                      <td className="px-3 py-2.5 font-bold text-slate-900">Kết quả phiếu kiểm nghiệm chất lượng SP (PDF)</td>
                      <td className="px-3 py-2.5 text-slate-500">A2. Tiêu chuẩn chỉ tiêu</td>
                      <td className="px-3 py-2.5"><span className="pill-badge pill-green">Hợp lệ</span></td>
                      <td className="px-3 py-2.5 text-right space-x-2">
                        <button className="text-slate-400 hover:text-emerald-700"><Eye className="w-4 h-4 inline" /></button>
                        <button className="text-slate-400 hover:text-rose-600"><Trash2 className="w-4 h-4 inline" /></button>
                      </td>
                    </tr>
                    <tr className="hover:bg-slate-50/80 transition-colors">
                      <td className="px-3 py-2.5 font-mono text-slate-400">04</td>
                      <td className="px-3 py-2.5 font-bold text-slate-900">Hình ảnh nhãn hiệu & Tem truy xuất QR code</td>
                      <td className="px-3 py-2.5 text-slate-500">A3. Bao bì nhãn mác</td>
                      <td className="px-3 py-2.5"><span className="pill-badge pill-green">Hợp lệ</span></td>
                      <td className="px-3 py-2.5 text-right space-x-2">
                        <button className="text-slate-400 hover:text-emerald-700"><Eye className="w-4 h-4 inline" /></button>
                        <button className="text-slate-400 hover:text-rose-600"><Trash2 className="w-4 h-4 inline" /></button>
                      </td>
                    </tr>
                    <tr className="hover:bg-slate-50/80 transition-colors">
                      <td className="px-3 py-2.5 font-mono text-slate-400">05</td>
                      <td className="px-3 py-2.5 font-bold text-slate-900">Hợp đồng liên kết chuỗi giá trị tiêu thụ nông sản</td>
                      <td className="px-3 py-2.5 text-slate-500">B1. Thị trường tiêu thụ</td>
                      <td className="px-3 py-2.5"><span className="pill-badge pill-green">Hợp lệ</span></td>
                      <td className="px-3 py-2.5 text-right space-x-2">
                        <button className="text-slate-400 hover:text-emerald-700"><Eye className="w-4 h-4 inline" /></button>
                        <button className="text-slate-400 hover:text-rose-600"><Trash2 className="w-4 h-4 inline" /></button>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>

              <div className="flex justify-between pt-4 border-t">
                <button
                  onClick={handleBack}
                  className="px-5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl"
                >
                  Quay lại
                </button>
                <button
                  onClick={handleNext}
                  className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs rounded-xl shadow-xs inline-flex items-center gap-1.5"
                >
                  Tiếp tục <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* STEP 4: TIÊU CHÍ ĐÁNH GIÁ */}
          {currentStep === 4 && (
            <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs space-y-6 animate-fade-in">
              <div className="border-b pb-3">
                <h3 className="font-black text-slate-900 text-sm flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-emerald-600" /> 4. Tiêu chí tự đánh giá & Phân hạng
                </h3>
                <p className="text-[11.5px] text-slate-500 mt-0.5">
                  Bộ tiêu chí phân hạng sản phẩm OCOP áp dụng theo Quyết định 148/QĐ-TTg.
                </p>
              </div>

              <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                <div>
                  <span className="font-bold text-slate-600">Bộ tiêu chí áp dụng:</span>
                  <div className="font-black text-emerald-900 text-sm mt-0.5">
                    Bộ tiêu chí OCOP 2023 (Theo QĐ 148/QĐ-TTg)
                  </div>
                </div>
                <div className="flex items-center gap-2 bg-emerald-100/80 px-3 py-1.5 rounded-xl border border-emerald-300">
                  <Star className="w-4 h-4 text-amber-500 fill-amber-500" />
                  <span className="text-xs font-black text-emerald-950">Dự kiến phân hạng: 4 SAO (82.0 / 100)</span>
                </div>
              </div>

              {/* Group score breakdown table */}
              <div className="overflow-x-auto border border-slate-200 rounded-xl">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 text-slate-700 font-bold border-b border-slate-200 uppercase text-[10.5px]">
                    <tr>
                      <th className="px-3 py-2.5">Nhóm tiêu chí</th>
                      <th className="px-3 py-2.5 text-center">Điểm tối đa</th>
                      <th className="px-3 py-2.5 text-center">Điểm đạt</th>
                      <th className="px-3 py-2.5 text-right">Tỉ lệ đạt</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                    <tr>
                      <td className="px-3 py-2.5 font-bold text-slate-900">A. Sản phẩm & sức mạnh cộng đồng</td>
                      <td className="px-3 py-2.5 text-center font-mono">40</td>
                      <td className="px-3 py-2.5 text-center font-black text-emerald-700">32.0</td>
                      <td className="px-3 py-2.5 text-right font-bold text-slate-600">80.0%</td>
                    </tr>
                    <tr>
                      <td className="px-3 py-2.5 font-bold text-slate-900">B. Khả năng tiếp thị</td>
                      <td className="px-3 py-2.5 text-center font-mono">25</td>
                      <td className="px-3 py-2.5 text-center font-black text-emerald-700">25.0</td>
                      <td className="px-3 py-2.5 text-right font-bold text-slate-600">100.0%</td>
                    </tr>
                    <tr>
                      <td className="px-3 py-2.5 font-bold text-slate-900">C. Chất lượng sản phẩm</td>
                      <td className="px-3 py-2.5 text-center font-mono">25</td>
                      <td className="px-3 py-2.5 text-center font-black text-emerald-700">25.0</td>
                      <td className="px-3 py-2.5 text-right font-bold text-slate-600">100.0%</td>
                    </tr>
                    <tr className="bg-emerald-50/60 font-black text-slate-900">
                      <td className="px-3 py-2.5 text-emerald-900">TỔNG CỘNG HOÀN THÀNH</td>
                      <td className="px-3 py-2.5 text-center font-mono">100</td>
                      <td className="px-3 py-2.5 text-center text-emerald-800 text-sm">82.0</td>
                      <td className="px-3 py-2.5 text-right text-emerald-800">82.0%</td>
                    </tr>
                  </tbody>
                </table>
              </div>

              <div className="flex justify-between pt-4 border-t">
                <button
                  onClick={handleBack}
                  className="px-5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl"
                >
                  Quay lại
                </button>
                <button
                  onClick={handleNext}
                  className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs rounded-xl shadow-xs inline-flex items-center gap-1.5"
                >
                  Tiếp tục <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* STEP 5: XÁC NHẬN HỒ SƠ */}
          {currentStep === 5 && (
            <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs space-y-6 animate-fade-in">
              <div className="border-b pb-3">
                <h3 className="font-black text-slate-900 text-sm flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" /> 5. Xác nhận & Kiểm tra hồ sơ trước khi gửi
                </h3>
                <p className="text-[11.5px] text-slate-500 mt-0.5">
                  Vui lòng rà soát lại các mục đã khai báo để đảm bảo tính chính xác và đầy đủ.
                </p>
              </div>

              <div className="space-y-3">
                <div className="p-3.5 bg-emerald-50/70 border border-emerald-200 rounded-xl flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2.5 font-bold text-emerald-900">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>Thông tin chung & Chủ thể OCOP</span>
                  </div>
                  <span className="pill-badge pill-green">Đã hoàn thành</span>
                </div>

                <div className="p-3.5 bg-emerald-50/70 border border-emerald-200 rounded-xl flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2.5 font-bold text-emerald-900">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>Thông tin sản phẩm OCOP ({formData.productName})</span>
                  </div>
                  <span className="pill-badge pill-green">Đã hoàn thành</span>
                </div>

                <div className="p-3.5 bg-emerald-50/70 border border-emerald-200 rounded-xl flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2.5 font-bold text-emerald-900">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>Hồ sơ minh chứng số (5/5 tài liệu hợp lệ)</span>
                  </div>
                  <span className="pill-badge pill-green">5/5 hợp lệ</span>
                </div>

                <div className="p-3.5 bg-amber-50/80 border border-amber-200 rounded-xl flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2.5 font-bold text-amber-900">
                    <Star className="w-4 h-4 text-amber-500 fill-amber-500 shrink-0" />
                    <span>Điểm tự đánh giá: 82 / 100 điểm &bull; Đề xuất 4 SAO OCOP</span>
                  </div>
                  <span className="pill-badge pill-amber">82/100 điểm</span>
                </div>
              </div>

              <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl text-xs space-y-2">
                <label className="flex items-start gap-2 cursor-pointer font-bold text-slate-800">
                  <input type="checkbox" defaultChecked className="mt-0.5 rounded text-emerald-600 focus:ring-emerald-500" />
                  <span>Tôi xác nhận toàn bộ thông tin kê khai hồ sơ OCOP nêu trên là chính xác và chịu trách nhiệm trước pháp luật về tính chân thực của dữ liệu cung cấp.</span>
                </label>
              </div>

              <div className="flex justify-between pt-4 border-t">
                <button
                  onClick={handleBack}
                  className="px-5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl"
                >
                  Quay lại
                </button>
                <button
                  onClick={handleNext}
                  className="px-6 py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white font-extrabold text-xs rounded-xl shadow-md inline-flex items-center gap-2 active:scale-98 transition-all"
                >
                  <Send className="w-4 h-4" /> Gửi đánh giá chính thức
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
              <h2 className="text-xl font-black text-slate-900">Hồ sơ của bạn đã được gửi thành công!</h2>
              <p className="text-xs text-slate-500 max-w-md mx-auto">
                Hồ sơ OCOP mã {formData.dossierCode} đang được UBND Xã Tân Tiến và Hội đồng xem xét thẩm định.
              </p>

              <button
                onClick={() => navigate('/ocop/dossiers')}
                className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs rounded-xl shadow-xs"
              >
                Xem danh sách hồ sơ
              </button>
            </div>
          )}
        </div>

        {/* Right Column Summary Panel (Image 2 Right Side) */}
        <div className="space-y-4">
          <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs space-y-4">
            <h3 className="font-extrabold text-slate-900 text-xs uppercase tracking-wider border-b pb-2">
              Thông tin tóm tắt hồ sơ
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
                <span className="text-slate-500">Phân nhóm:</span>
                <span className="font-bold text-emerald-800">{formData.category}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Trạng thái:</span>
                <span className="pill-badge pill-amber">Lưu nháp</span>
              </div>
            </div>

            {/* Steps completion tracker */}
            <div className="pt-4 border-t space-y-2 text-[11.5px]">
              <div className="font-bold text-slate-800 mb-2">Quy trình thực hiện:</div>
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
                    {currentStep > st.num ? 'Đã hoàn thành' : currentStep === st.num ? 'Đang nhập' : 'Chưa nhập'}
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
