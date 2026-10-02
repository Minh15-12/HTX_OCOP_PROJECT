import React, { useState, useRef } from 'react';
import {
  Wallet,
  Building,
  MapPin,
  X,
  Upload,
  FileText,
  Eye,
  CheckCircle2,
  AlertTriangle,
} from 'lucide-react';
import { Member, LandContribution } from '@/types/memberTypes';

export interface CapitalFormData {
  member_id: string;
  contribution_type: 'TIEN_MAT' | 'CHUYEN_KHOAN' | 'LAND' | 'HIEN_VAT';
  amount: number;
  contribution_date: string;
  receipt_number: string;
  content: string;
  approval_mode: 'DIRECT_APPROVE' | 'SUBMIT_PENDING';
  notes: string;
  land_certificate_no?: string;
  plot_number?: string;
  map_sheet_number?: string;
  land_area_sqm?: number;
  land_use_type?: string;
  appraised_unit_price?: number;
  uploaded_file?: { name: string; size: string; url?: string } | null;
}

interface CapitalRecordModalProps {
  isOpen: boolean;
  onClose: () => void;
  members: Member[];
  totalContributedCapital: number;
  onSubmit: (formData: CapitalFormData) => Promise<void> | void;
}

export const CapitalRecordModal: React.FC<CapitalRecordModalProps> = ({
  isOpen,
  onClose,
  members,
  totalContributedCapital,
  onSubmit,
}) => {
  const [recordStep, setRecordStep] = useState<1 | 2 | 3>(1);
  const [capitalForm, setCapitalForm] = useState<CapitalFormData>({
    member_id: members[0]?.id || '',
    contribution_type: 'TIEN_MAT',
    amount: 10000000,
    contribution_date: new Date().toISOString().split('T')[0],
    receipt_number: `PT${Math.floor(100000 + Math.random() * 900000)}`,
    content: 'Góp vốn đợt bổ sung theo Điều lệ',
    approval_mode: 'DIRECT_APPROVE',
    notes: '',
    land_certificate_no: '',
    plot_number: '',
    map_sheet_number: '',
    land_area_sqm: 1500,
    land_use_type: 'Đất trồng lúa',
    appraised_unit_price: 20000,
    uploaded_file: null,
  });

  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const sizeMb = (file.size / (1024 * 1024)).toFixed(2);
      setCapitalForm((prev) => ({
        ...prev,
        uploaded_file: { name: file.name, size: `${sizeMb} MB`, url: URL.createObjectURL(file) },
      }));
    }
  };

  const handleDropFile = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) {
      const sizeMb = (file.size / (1024 * 1024)).toFixed(2);
      setCapitalForm((prev) => ({
        ...prev,
        uploaded_file: { name: file.name, size: `${sizeMb} MB`, url: URL.createObjectURL(file) },
      }));
    }
  };

  const selectedMember = members.find((m) => m.id === capitalForm.member_id) || members[0];
  const effectiveAmount =
    capitalForm.contribution_type === 'LAND'
      ? (capitalForm.land_area_sqm || 0) * (capitalForm.appraised_unit_price || 0)
      : capitalForm.amount;

  const currentMemberContributed = selectedMember ? (selectedMember.contributed_capital || 0) : 0;
  const newMemberTotal = currentMemberContributed + effectiveAmount;
  const newCoopTotal = totalContributedCapital + effectiveAmount;
  const projectedOwnershipPct = newCoopTotal > 0 ? (newMemberTotal / newCoopTotal) * 100 : 0;
  const isCeilingBreach = selectedMember?.member_type === 'CHINH_THUC' && projectedOwnershipPct > 30.0;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isCeilingBreach) {
      alert(`CẢNH BÁO VI PHẠM: Tỷ lệ sở hữu dự kiến ${projectedOwnershipPct.toFixed(2)}% vượt trần 30% theo Luật HTX 2023!`);
      return;
    }

    try {
      setIsSubmitting(true);
      await onSubmit({ ...capitalForm, amount: effectiveAmount });
      onClose();
      setRecordStep(1);
    } catch (err: any) {
      alert(err.message || 'Lỗi khi ghi nhận vốn góp');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fade-in">
      <div className="bg-white rounded-2xl max-w-xl w-full shadow-modal overflow-hidden">
        <div className="p-4 border-b border-slate-200 flex justify-between items-center bg-slate-50">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-full bg-emerald-600 text-white font-black text-xs flex items-center justify-center">
              {recordStep}
            </div>
            <h3 className="font-extrabold text-slate-900 text-base">
              {recordStep === 1 && 'Bước 1: Chọn Xã viên & Hình thức tài sản'}
              {recordStep === 2 && 'Bước 2: Định giá & Thông tin tài sản góp'}
              {recordStep === 3 && 'Bước 3: Xác nhận & Kiểm tra ranh giới Luật 2023'}
            </h3>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 cursor-pointer">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-4 text-[12.8px]">
          {recordStep === 1 && (
            <div className="space-y-4">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Chọn Thành viên HTX *</label>
                <select
                  value={capitalForm.member_id}
                  onChange={(e) => setCapitalForm({ ...capitalForm, member_id: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg font-bold text-slate-800"
                >
                  {members.map((m) => (
                    <option key={m.id} value={m.id}>
                      {m.full_name} ({m.member_code}) - {m.member_type === 'CHINH_THUC' ? 'Chính thức' : 'Liên kết'}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-2">Hình thức tài sản đóng góp *</label>
                <div className="grid grid-cols-2 gap-3">
                  <div
                    onClick={() => setCapitalForm({ ...capitalForm, contribution_type: 'TIEN_MAT' })}
                    className={`p-3 rounded-xl border-2 cursor-pointer flex items-center gap-2.5 transition-all ${
                      capitalForm.contribution_type === 'TIEN_MAT' ? 'border-emerald-600 bg-emerald-50/50' : 'border-slate-200 hover:bg-slate-50'
                    }`}
                  >
                    <Wallet className="w-5 h-5 text-emerald-600" />
                    <div>
                      <div className="font-extrabold text-slate-800">Tiền mặt</div>
                      <div className="text-[10.5px] text-slate-400">Nộp tiền trực tiếp tại quỹ</div>
                    </div>
                  </div>

                  <div
                    onClick={() => setCapitalForm({ ...capitalForm, contribution_type: 'CHUYEN_KHOAN' })}
                    className={`p-3 rounded-xl border-2 cursor-pointer flex items-center gap-2.5 transition-all ${
                      capitalForm.contribution_type === 'CHUYEN_KHOAN' ? 'border-emerald-600 bg-emerald-50/50' : 'border-slate-200 hover:bg-slate-50'
                    }`}
                  >
                    <Building className="w-5 h-5 text-blue-600" />
                    <div>
                      <div className="font-extrabold text-slate-800">Chuyển khoản</div>
                      <div className="text-[10.5px] text-slate-400">Qua tài khoản ngân hàng HTX</div>
                    </div>
                  </div>

                  <div
                    onClick={() => setCapitalForm({ ...capitalForm, contribution_type: 'LAND' })}
                    className={`p-3 rounded-xl border-2 cursor-pointer flex items-center gap-2.5 col-span-2 transition-all ${
                      capitalForm.contribution_type === 'LAND' ? 'border-emerald-600 bg-emerald-50/50' : 'border-slate-200 hover:bg-slate-50'
                    }`}
                  >
                    <MapPin className="w-5 h-5 text-amber-600" />
                    <div>
                      <div className="font-extrabold text-slate-800">Quyền sử dụng đất (QSDĐ)</div>
                      <div className="text-[10.5px] text-slate-400">Định giá ruộng đất tích tụ canh tác sang tên HTX (Miễn 100% lệ phí trước bạ theo Luật HTX 2023)</div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="pt-2 flex justify-end gap-2 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setRecordStep(2)}
                  className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-lg shadow-sm cursor-pointer"
                >
                  Tiếp theo &rarr;
                </button>
              </div>
            </div>
          )}

          {recordStep === 2 && (
            <div className="space-y-4">
              {capitalForm.contribution_type === 'LAND' ? (
                <div className="space-y-3">
                  <div className="p-2.5 bg-amber-50 border border-amber-200 rounded-lg text-amber-900 text-[11.5px] font-bold">
                    Đóng góp bằng Quyền sử dụng đất (Luật HTX 2023 & Luật Đất đai 2024)
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block font-bold text-slate-700 mb-1">Số seri Sổ đỏ *</label>
                      <input
                        type="text"
                        required
                        value={capitalForm.land_certificate_no}
                        onChange={(e) => setCapitalForm({ ...capitalForm, land_certificate_no: e.target.value })}
                        placeholder="BD 123456"
                        className="w-full px-3 py-2 border border-slate-200 rounded-lg font-mono font-bold"
                      />
                    </div>
                    <div>
                      <label className="block font-bold text-slate-700 mb-1">Số thửa & Số tờ bản đồ</label>
                      <div className="flex gap-2">
                        <input
                          type="text"
                          placeholder="Số Thửa"
                          value={capitalForm.plot_number}
                          onChange={(e) => setCapitalForm({ ...capitalForm, plot_number: e.target.value })}
                          className="w-1/2 px-2 py-2 border border-slate-200 rounded-lg font-bold"
                        />
                        <input
                          type="text"
                          placeholder="Số Tờ"
                          value={capitalForm.map_sheet_number}
                          onChange={(e) => setCapitalForm({ ...capitalForm, map_sheet_number: e.target.value })}
                          className="w-1/2 px-2 py-2 border border-slate-200 rounded-lg font-bold"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block font-bold text-slate-700 mb-1">Diện tích đóng góp (m²) *</label>
                      <input
                        type="number"
                        required
                        value={capitalForm.land_area_sqm}
                        onChange={(e) => setCapitalForm({ ...capitalForm, land_area_sqm: Number(e.target.value) })}
                        className="w-full px-3 py-2 border border-slate-200 rounded-lg font-bold text-emerald-800"
                      />
                    </div>
                    <div>
                      <label className="block font-bold text-slate-700 mb-1">Đơn giá định giá (đ/m²) *</label>
                      <input
                        type="number"
                        required
                        value={capitalForm.appraised_unit_price}
                        onChange={(e) => setCapitalForm({ ...capitalForm, appraised_unit_price: Number(e.target.value) })}
                        className="w-full px-3 py-2 border border-slate-200 rounded-lg font-bold"
                      />
                    </div>
                  </div>

                  <div className="p-2.5 bg-slate-100 rounded-lg flex justify-between font-extrabold text-slate-900">
                    <span>Tổng giá trị góp đất quy đổi:</span>
                    <span className="text-emerald-700">{((capitalForm.land_area_sqm || 0) * (capitalForm.appraised_unit_price || 0)).toLocaleString('vi-VN')} ₫</span>
                  </div>
                </div>
              ) : (
                <div className="space-y-3">
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block font-bold text-slate-700 mb-1">Số tiền góp (đ) *</label>
                      <input
                        type="number"
                        step={1000000}
                        required
                        value={capitalForm.amount}
                        onChange={(e) => setCapitalForm({ ...capitalForm, amount: Number(e.target.value) })}
                        className="w-full px-3 py-2 border border-slate-200 rounded-lg font-bold text-emerald-800"
                      />
                    </div>
                    <div>
                      <label className="block font-bold text-slate-700 mb-1">Số chứng từ / Phiếu thu</label>
                      <input
                        type="text"
                        value={capitalForm.receipt_number}
                        onChange={(e) => setCapitalForm({ ...capitalForm, receipt_number: e.target.value })}
                        className="w-full px-3 py-2 border border-slate-200 rounded-lg font-mono font-bold"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block font-bold text-slate-700 mb-1">Ngày nộp *</label>
                      <input
                        type="date"
                        required
                        value={capitalForm.contribution_date}
                        onChange={(e) => setCapitalForm({ ...capitalForm, contribution_date: e.target.value })}
                        className="w-full px-3 py-2 border border-slate-200 rounded-lg font-bold"
                      />
                    </div>
                    <div>
                      <label className="block font-bold text-slate-700 mb-1">Nội dung nộp</label>
                      <input
                        type="text"
                        value={capitalForm.content}
                        onChange={(e) => setCapitalForm({ ...capitalForm, content: e.target.value })}
                        className="w-full px-3 py-2 border border-slate-200 rounded-lg"
                      />
                    </div>
                  </div>
                </div>
              )}

              <div>
                <label className="block font-bold text-slate-700 mb-1">File Biên bản định giá / Chứng từ scan</label>
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileSelect}
                  accept=".pdf,.doc,.docx,.png,.jpg,.jpeg"
                  className="hidden"
                />
                {!capitalForm.uploaded_file ? (
                  <div
                    onClick={() => fileInputRef.current?.click()}
                    onDragOver={(e) => {
                      e.preventDefault();
                      setIsDragging(true);
                    }}
                    onDragLeave={() => setIsDragging(false)}
                    onDrop={handleDropFile}
                    className={`border-2 border-dashed rounded-xl p-4 text-center cursor-pointer transition-all ${
                      isDragging
                        ? 'border-emerald-500 bg-emerald-50 scale-102'
                        : 'border-emerald-400/80 hover:border-emerald-600 bg-emerald-50/20 hover:bg-emerald-50/50'
                    }`}
                  >
                    <Upload className="w-6 h-6 text-emerald-600 mx-auto mb-1.5 animate-bounce" />
                    <div className="text-slate-800 font-bold text-[12px]">Bấm vào đây để chọn file hoặc Kéo thả file vào đây</div>
                    <div className="text-slate-500 text-[11px] mt-0.5 font-medium">Tải lên Biên bản họp Đại hội thành viên / Hợp đồng công chứng / Sổ đỏ (PDF, DOCX, PNG, JPG)</div>
                  </div>
                ) : (
                  <div className="p-3 border border-emerald-300 bg-emerald-50/70 rounded-xl flex items-center justify-between shadow-xs">
                    <div className="flex items-center gap-2.5">
                      <FileText className="w-6 h-6 text-emerald-700 shrink-0" />
                      <div className="text-left">
                        <div className="font-extrabold text-slate-900 text-xs truncate max-w-[240px]">{capitalForm.uploaded_file.name}</div>
                        <div className="text-[10.5px] text-emerald-800 font-bold">{capitalForm.uploaded_file.size} &bull; Đã sẵn sàng đính kèm</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-1.5">
                      {capitalForm.uploaded_file.url && (
                        <a
                          href={capitalForm.uploaded_file.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="px-2.5 py-1 bg-white border border-slate-200 text-emerald-700 hover:bg-emerald-100 rounded-lg text-xs font-bold flex items-center gap-1"
                        >
                          <Eye className="w-3.5 h-3.5" /> Xem
                        </a>
                      )}
                      <button
                        type="button"
                        onClick={() => setCapitalForm((prev) => ({ ...prev, uploaded_file: null }))}
                        className="p-1.5 bg-white border border-slate-200 text-rose-600 hover:bg-rose-50 rounded-lg text-xs font-bold cursor-pointer"
                        title="Xóa file đã chọn"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                )}
              </div>

              <div className="pt-2 flex justify-between gap-2 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setRecordStep(1)}
                  className="px-4 py-2 border border-slate-200 rounded-lg text-slate-600 font-bold hover:bg-slate-50 cursor-pointer"
                >
                  &larr; Quay lại
                </button>
                <button
                  type="button"
                  onClick={() => setRecordStep(3)}
                  className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-lg shadow-sm cursor-pointer"
                >
                  Kiểm tra ranh giới Luật &rarr;
                </button>
              </div>
            </div>
          )}

          {recordStep === 3 && (
            <div className="space-y-4">
              <div className={`p-3 rounded-xl border text-xs space-y-2 ${isCeilingBreach ? 'bg-rose-50 border-rose-200' : 'bg-emerald-50 border-emerald-200'}`}>
                <div className={`font-extrabold text-sm flex items-center gap-1.5 ${isCeilingBreach ? 'text-rose-900' : 'text-emerald-900'}`}>
                  {isCeilingBreach ? <AlertTriangle className="w-4 h-4 text-rose-600" /> : <CheckCircle2 className="w-4 h-4 text-emerald-600" />}
                  Kết quả kiểm tra Luật HTX 2023:
                </div>
                <div className="flex justify-between">
                  <span>Xã viên thụ hưởng:</span>
                  <strong className="text-slate-900">{selectedMember?.full_name}</strong>
                </div>
                <div className="flex justify-between">
                  <span>Hình thức góp:</span>
                  <strong className="text-slate-900">{capitalForm.contribution_type === 'LAND' ? 'Quyền sử dụng đất (QSDĐ)' : capitalForm.contribution_type === 'CHUYEN_KHOAN' ? 'Chuyển khoản ngân hàng' : 'Tiền mặt'}</strong>
                </div>
                <div className="flex justify-between text-emerald-800 font-bold">
                  <span>Giá trị nộp bổ sung:</span>
                  <span>{effectiveAmount.toLocaleString('vi-VN')} ₫</span>
                </div>
                <div className="flex justify-between items-center pt-1 border-t border-slate-200/60">
                  <span>Tỷ lệ sở hữu dự kiến sau nộp:</span>
                  <strong className={`font-mono text-sm ${isCeilingBreach ? 'text-rose-600 font-black' : 'text-emerald-700'}`}>
                    {projectedOwnershipPct.toFixed(2)}% {isCeilingBreach ? '(⛔ VƯỢT TRẦN 30%)' : '(✅ HỢP LỆ)'}
                  </strong>
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="block font-bold text-slate-700 text-xs">Chế độ phê duyệt khi lưu *</label>
                <div className="grid grid-cols-2 gap-2">
                  <label
                    onClick={() => setCapitalForm({ ...capitalForm, approval_mode: 'DIRECT_APPROVE' })}
                    className={`p-2.5 rounded-lg border cursor-pointer flex items-center gap-2 text-xs transition-all ${
                      capitalForm.approval_mode === 'DIRECT_APPROVE'
                        ? 'border-emerald-600 bg-emerald-50 text-emerald-900 font-bold'
                        : 'border-slate-200 text-slate-600'
                    }`}
                  >
                    <input
                      type="radio"
                      name="approval_mode"
                      checked={capitalForm.approval_mode === 'DIRECT_APPROVE'}
                      onChange={() => {}}
                    />
                    <span>Phê duyệt & Cấp vốn ngay</span>
                  </label>

                  <label
                    onClick={() => setCapitalForm({ ...capitalForm, approval_mode: 'SUBMIT_PENDING' })}
                    className={`p-2.5 rounded-lg border cursor-pointer flex items-center gap-2 text-xs transition-all ${
                      capitalForm.approval_mode === 'SUBMIT_PENDING'
                        ? 'border-amber-500 bg-amber-50 text-amber-900 font-bold'
                        : 'border-slate-200 text-slate-600'
                    }`}
                  >
                    <input
                      type="radio"
                      name="approval_mode"
                      checked={capitalForm.approval_mode === 'SUBMIT_PENDING'}
                      onChange={() => {}}
                    />
                    <span>Tạo giao dịch Chờ duyệt</span>
                  </label>
                </div>
              </div>

              <div className="pt-2 flex justify-between gap-2 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setRecordStep(2)}
                  className="px-4 py-2 border border-slate-200 rounded-lg text-slate-600 font-bold hover:bg-slate-50 cursor-pointer"
                >
                  &larr; Quay lại
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting || isCeilingBreach}
                  className="px-6 py-2 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white font-bold rounded-lg shadow-md cursor-pointer inline-flex items-center gap-2"
                >
                  {isSubmitting ? 'Đang lưu...' : 'Lưu & Cấp Giấy chứng nhận Vốn'}
                </button>
              </div>
            </div>
          )}
        </form>
      </div>
    </div>
  );
};
