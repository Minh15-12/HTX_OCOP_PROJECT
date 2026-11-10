import React, { useRef } from 'react';
import { FileText, CheckCircle2, Upload, UserCheck } from 'lucide-react';
import { MemberWizardFormState } from './wizardTypes';

interface Step5Props {
  formData: MemberWizardFormState;
  uploadedFile: File | null;
  onFileSelect: (file: File | null) => void;
}

export const MemberWizardStep5Confirm: React.FC<Step5Props> = ({
  formData,
  uploadedFile,
  onFileSelect,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      onFileSelect(e.dataTransfer.files[0]);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      onFileSelect(e.target.files[0]);
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
      {/* File Upload Box */}
      <div className="bg-white p-5 rounded-xl border border-slate-100 shadow-sm">
        <h4 className="text-sm font-bold text-slate-800 mb-4 flex items-center gap-2">
          <FileText className="w-4 h-4 text-emerald-600" /> Hồ sơ đính kèm (Tùy chọn)
        </h4>

        <div
          className="border-2 border-dashed border-slate-300 rounded-xl p-8 text-center bg-slate-50 hover:bg-slate-100 hover:border-emerald-400 transition-all cursor-pointer group"
          onDragOver={(e) => e.preventDefault()}
          onDrop={handleFileDrop}
          onClick={() => fileInputRef.current?.click()}
        >
          <input
            type="file"
            ref={fileInputRef}
            className="hidden"
            onChange={handleFileChange}
            accept=".pdf,.jpg,.jpeg,.png"
          />
          {uploadedFile ? (
            <div className="flex flex-col items-center animate-fade-in">
              <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mb-3">
                <CheckCircle2 className="w-8 h-8 text-emerald-600" />
              </div>
              <p className="text-sm font-bold text-slate-800">{uploadedFile.name}</p>
              <p className="text-[11px] font-medium text-slate-500 mt-1">
                {(uploadedFile.size / 1024 / 1024).toFixed(2)} MB
              </p>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  onFileSelect(null);
                }}
                className="mt-4 px-4 py-1.5 bg-rose-50 text-rose-600 rounded-lg text-xs font-bold hover:bg-rose-100 transition-colors"
              >
                Xóa file
              </button>
            </div>
          ) : (
            <div className="flex flex-col items-center">
              <div className="w-14 h-14 bg-white rounded-full shadow-sm flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                <Upload className="w-6 h-6 text-slate-400 group-hover:text-emerald-500 transition-colors" />
              </div>
              <p className="text-sm font-semibold text-slate-700">Kéo thả Đơn xin gia nhập vào đây</p>
              <p className="text-xs text-slate-400 mt-1">Hỗ trợ PDF, JPG, PNG (Tối đa 5MB)</p>
              <button
                type="button"
                className="mt-4 px-4 py-2 border border-slate-200 bg-white rounded-lg text-xs font-bold text-slate-700 shadow-sm hover:border-emerald-300 transition-colors"
              >
                Hoặc chọn file từ máy
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Review Summary Card */}
      <div className="bg-slate-900 p-6 rounded-xl shadow-lg text-white relative overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/10 rounded-full blur-2xl translate-x-10 -translate-y-10" />

        <h4 className="text-sm font-bold text-emerald-400 mb-4 flex items-center gap-2 border-b border-slate-700/60 pb-3 relative z-10">
          <UserCheck className="w-4 h-4" /> Tổng kết Hồ sơ
        </h4>

        <div className="space-y-5 relative z-10">
          <div>
            <p className="text-[11px] uppercase tracking-wider font-bold text-slate-400 mb-1">Xã viên</p>
            <p className="text-xl font-black text-white">{formData.full_name || 'CHƯA NHẬP TÊN'}</p>
            <p className="text-sm text-slate-300 font-mono mt-1">{formData.cccd || '---'}</p>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-[11px] uppercase tracking-wider font-bold text-slate-400 mb-1">Số điện thoại</p>
              <p className="text-sm font-bold text-white">{formData.phone || '---'}</p>
            </div>
            <div>
              <p className="text-[11px] uppercase tracking-wider font-bold text-slate-400 mb-1">Loại thành viên</p>
              <p className="text-sm font-bold text-emerald-400">
                {formData.member_type === 'CHINH_THUC'
                  ? 'Chính thức'
                  : formData.member_type === 'LIEN_KET_GOP_VON'
                  ? 'Liên kết (Có vốn)'
                  : 'Liên kết (Không vốn)'}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 mt-2">
            <div>
              <p className="text-[11px] uppercase tracking-wider font-bold text-slate-400 mb-1">Địa chỉ</p>
              <p className="text-sm font-bold text-white">
                {formData.detail_address ? `${formData.detail_address}, ` : ''}
                {formData.ward}, {formData.district}, {formData.province}
              </p>
            </div>
            <div>
              <p className="text-[11px] uppercase tracking-wider font-bold text-slate-400 mb-1">Hình thức / PTTT</p>
              <p className="text-sm font-bold text-white">
                {formData.capital_form === 'TIEN_MAT' ? 'Tiền mặt' : 'Hiện vật'} /
                {formData.capital_payment_method === 'CASH' ? ' TM' : ' CK'}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 mt-2">
            <div>
              <p className="text-[11px] uppercase tracking-wider font-bold text-slate-400 mb-1">Tài khoản nhận lợi nhuận</p>
              <p className="text-sm font-bold text-white">{formData.bank_account || '---'}</p>
            </div>
            <div>
              <p className="text-[11px] uppercase tracking-wider font-bold text-slate-400 mb-1">Ngân hàng</p>
              <p className="text-sm font-bold text-white">{formData.bank_name || '---'}</p>
            </div>
          </div>

          <div className="pt-4 border-t border-slate-700/60">
            <div className="flex justify-between items-end mb-1.5">
              <p className="text-[11px] uppercase tracking-wider font-bold text-slate-400">Vốn thực góp (Đợt 1)</p>
              <p className="text-xl font-black text-emerald-400">
                {formData.contribution_method === 'Góp một lần'
                  ? (formData.committed_capital || 0).toLocaleString('vi-VN')
                  : (formData.initial_contributed_capital || 0).toLocaleString('vi-VN')}{' '}
                ₫
              </p>
            </div>
            {formData.contribution_method === 'Góp nhiều lần' && (
              <div className="flex justify-between items-end">
                <p className="text-[11px] uppercase tracking-wider font-bold text-slate-400">Vốn cam kết</p>
                <p className="text-sm font-bold text-amber-400">
                  {(formData.committed_capital || 0).toLocaleString('vi-VN')} ₫
                </p>
              </div>
            )}
          </div>

          <div className="bg-rose-500/10 border border-rose-500/20 p-3.5 rounded-xl mt-4">
            <p className="text-[11.5px] text-rose-200 leading-relaxed">
              <strong>Lưu ý:</strong> Sau khi tạo, xã viên sẽ ở trạng thái{' '}
              <span className="font-bold text-rose-300 text-[10px] uppercase bg-rose-900/40 px-1.5 py-0.5 rounded ml-1">
                CHỜ DUYỆT
              </span>
              . Cần phải thông qua HĐQT phê duyệt để chính thức trở thành thành viên.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
