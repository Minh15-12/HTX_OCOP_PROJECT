import React from 'react';
import { AlertTriangle, CheckCircle2 } from 'lucide-react';
import { CapitalFormData } from '../CapitalRecordModal';
import { Member } from '@/types/memberTypes';

interface CapitalStep3ReviewProps {
  capitalForm: CapitalFormData;
  setCapitalForm: React.Dispatch<React.SetStateAction<CapitalFormData>>;
  selectedMember?: Member;
  effectiveAmount: number;
  projectedOwnershipPct: number;
  isCeilingBreach: boolean;
  isSubmitting: boolean;
  onBack: () => void;
}

export const CapitalStep3Review: React.FC<CapitalStep3ReviewProps> = ({
  capitalForm,
  setCapitalForm,
  selectedMember,
  effectiveAmount,
  projectedOwnershipPct,
  isCeilingBreach,
  isSubmitting,
  onBack,
}) => {
  return (
    <div className="space-y-4">
      <div
        className={`p-3 rounded-xl border text-xs space-y-2 ${
          isCeilingBreach ? 'bg-rose-50 border-rose-200' : 'bg-emerald-50 border-emerald-200'
        }`}
      >
        <div
          className={`font-extrabold text-sm flex items-center gap-1.5 ${
            isCeilingBreach ? 'text-rose-900' : 'text-emerald-900'
          }`}
        >
          {isCeilingBreach ? (
            <AlertTriangle className="w-4 h-4 text-rose-600" />
          ) : (
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          )}
          Kết quả kiểm tra Luật HTX 2023:
        </div>
        <div className="flex justify-between">
          <span>Xã viên thụ hưởng:</span>
          <strong className="text-slate-900">{selectedMember?.full_name}</strong>
        </div>
        <div className="flex justify-between">
          <span>Hình thức góp:</span>
          <strong className="text-slate-900">
            {capitalForm.contribution_type === 'LAND'
              ? 'Quyền sử dụng đất (QSDĐ)'
              : capitalForm.contribution_type === 'CHUYEN_KHOAN'
              ? 'Chuyển khoản ngân hàng'
              : 'Tiền mặt'}
          </strong>
        </div>
        <div className="flex justify-between text-emerald-800 font-bold">
          <span>Giá trị nộp bổ sung:</span>
          <span>{effectiveAmount.toLocaleString('vi-VN')} ₫</span>
        </div>
        <div className="flex justify-between items-center pt-1 border-t border-slate-200/60">
          <span>Tỷ lệ sở hữu dự kiến sau nộp:</span>
          <strong
            className={`font-mono text-sm ${
              isCeilingBreach ? 'text-rose-600 font-black' : 'text-emerald-700'
            }`}
          >
            {projectedOwnershipPct.toFixed(2)}%{' '}
            {isCeilingBreach ? '(⛔ VƯỢT TRẦN 30%)' : '(✅ HỢP LỆ)'}
          </strong>
        </div>
      </div>

      <div className="space-y-1.5">
        <label className="block font-bold text-slate-700 text-xs">
          Chế độ phê duyệt khi lưu *
        </label>
        <div className="grid grid-cols-2 gap-2">
          <label
            onClick={() =>
              setCapitalForm({ ...capitalForm, approval_mode: 'DIRECT_APPROVE' })
            }
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
            <span>Phê duyệt &amp; Cấp vốn ngay</span>
          </label>

          <label
            onClick={() =>
              setCapitalForm({ ...capitalForm, approval_mode: 'SUBMIT_PENDING' })
            }
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
          onClick={onBack}
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
  );
};
