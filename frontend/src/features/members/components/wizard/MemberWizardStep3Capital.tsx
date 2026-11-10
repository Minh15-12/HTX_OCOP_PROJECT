import React from 'react';
import { Upload, FileText, AlertTriangle } from 'lucide-react';
import { MemberType, CapitalForm } from '@/types/memberTypes';
import { MemberWizardFormState } from './wizardTypes';

interface Step3Props {
  formData: MemberWizardFormState;
  onChange: (patch: Partial<MemberWizardFormState>) => void;
  fieldErrors: Record<string, string>;
  onClearError?: (field: string) => void;
  calculateDynamicProfitRate: (committedCap: number, initialCap: number, method: string) => number;
}

export const MemberWizardStep3Capital: React.FC<Step3Props> = ({
  formData,
  onChange,
  fieldErrors,
  onClearError,
  calculateDynamicProfitRate,
}) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-5 bg-white p-5 rounded-xl border border-slate-100 shadow-sm">
      <div className="md:col-span-2">
        <h4 className="text-sm font-bold text-slate-800 mb-3 border-b border-slate-100 pb-2">
          Vốn góp & Loại Thành viên
        </h4>
      </div>

      <div>
        <label className="block text-xs font-bold text-slate-700 mb-1.5">Phân loại thành viên</label>
        <select
          value={formData.member_type}
          onChange={(e) => onChange({ member_type: e.target.value as MemberType })}
          className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 focus:border-emerald-500 rounded-lg text-sm text-slate-700 font-semibold"
        >
          <option value="CHINH_THUC">Chính thức (Bắt buộc dùng DV HTX)</option>
          <option value="LIEN_KET_GOP_VON">Liên kết góp vốn</option>
          <option value="LIEN_KET_KHONG_GOP_VON">Liên kết không góp vốn</option>
        </select>
      </div>

      <div>
        <label className="block text-xs font-bold text-slate-700 mb-1.5">Hình thức nộp vốn</label>
        <select
          value={formData.capital_form}
          onChange={(e) => onChange({ capital_form: e.target.value as CapitalForm })}
          className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 focus:border-emerald-500 rounded-lg text-sm text-slate-700"
        >
          <option value="TIEN_MAT">Bằng tiền</option>
          <option value="HIEN_VAT">Hiện vật / Quyền sử dụng đất</option>
        </select>
      </div>

      {formData.capital_form === 'TIEN_MAT' && (
        <div>
          <label className="block text-xs font-bold text-slate-700 mb-1.5">Phương thức thanh toán</label>
          <select
            value={formData.capital_payment_method}
            onChange={(e) => onChange({ capital_payment_method: e.target.value as 'CASH' | 'BANK_TRANSFER' })}
            className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 focus:border-emerald-500 rounded-lg text-sm text-slate-700"
          >
            <option value="CASH">Tiền mặt</option>
            <option value="BANK_TRANSFER">Chuyển khoản</option>
          </select>
        </div>
      )}

      {formData.capital_form === 'TIEN_MAT' && formData.capital_payment_method === 'BANK_TRANSFER' && (
        <div className="md:col-span-2">
          <label className="block text-xs font-bold text-slate-700 mb-1.5">Ảnh chứng từ / Biên lai chuyển khoản</label>
          <div className="flex items-center gap-3">
            <label className="px-4 py-2 bg-white border border-slate-300 rounded-lg text-sm font-medium text-slate-700 cursor-pointer hover:bg-slate-50 flex items-center gap-2">
              <Upload className="w-4 h-4" />
              Tải lên chứng từ
              <input
                type="file"
                accept="image/*,.pdf"
                className="hidden"
                onChange={(e) => {
                  if (e.target.files && e.target.files[0]) {
                    onChange({ capital_receipt_file: e.target.files[0] });
                  }
                }}
              />
            </label>
            {formData.capital_receipt_file && (
              <span className="text-sm text-slate-600 flex items-center gap-1">
                <FileText className="w-4 h-4 text-emerald-600" />
                {formData.capital_receipt_file.name}
              </span>
            )}
          </div>
        </div>
      )}

      {formData.member_type !== 'LIEN_KET_KHONG_GOP_VON' && (
        <>
          <div className="md:col-span-2 mt-2">
            <label className="block text-xs font-bold text-slate-700 mb-1.5">Phương thức đóng vốn</label>
            <div className="flex gap-4 bg-slate-50 p-3 rounded-lg border border-slate-100">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name="contribution_method"
                  value="Góp một lần"
                  checked={formData.contribution_method === 'Góp một lần'}
                  onChange={(e) => {
                    const method = e.target.value;
                    onChange({
                      contribution_method: method,
                      profit_share_rate: calculateDynamicProfitRate(
                        formData.committed_capital,
                        formData.initial_contributed_capital,
                        method
                      ),
                    });
                  }}
                  className="w-4 h-4 text-emerald-600 focus:ring-emerald-500"
                />
                <span className="text-sm text-slate-700 font-medium">Đóng 1 lần (Đủ vốn cam kết)</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name="contribution_method"
                  value="Góp nhiều lần"
                  checked={formData.contribution_method === 'Góp nhiều lần'}
                  onChange={(e) => {
                    const method = e.target.value;
                    onChange({
                      contribution_method: method,
                      profit_share_rate: calculateDynamicProfitRate(
                        formData.committed_capital,
                        formData.initial_contributed_capital,
                        method
                      ),
                    });
                  }}
                  className="w-4 h-4 text-emerald-600 focus:ring-emerald-500"
                />
                <span className="text-sm text-slate-700 font-medium">Đóng nhiều đợt (Luật HTX: Tối đa 6 tháng)</span>
              </label>
            </div>
          </div>

          <div className="md:col-span-2">
            <label className="block text-xs font-bold text-slate-700 mb-1.5">
              Tổng Vốn Cam Kết (VNĐ) <span className="text-rose-500">*</span>
            </label>
            <input
              type="number"
              value={formData.committed_capital}
              onChange={(e) => {
                const val = parseInt(e.target.value) || 0;
                onChange({
                  committed_capital: val,
                  profit_share_rate: calculateDynamicProfitRate(
                    val,
                    formData.initial_contributed_capital,
                    formData.contribution_method
                  ),
                });
                if (fieldErrors.committed_capital && onClearError) onClearError('committed_capital');
              }}
              className="w-full px-3.5 py-3 bg-slate-50 border border-slate-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100 rounded-lg text-lg text-slate-900 font-black transition-all"
            />
            <div className="text-[11px] text-slate-500 mt-2 italic flex items-center gap-1">
              <AlertTriangle className="w-3.5 h-3.5 text-amber-500" />
              Mức tối thiểu: 10.000.000 ₫ (Theo Điều lệ). Tối đa: 30% vốn điều lệ đối với thành viên chính thức.
            </div>
          </div>

          {formData.contribution_method === 'Góp nhiều lần' && (
            <div className="md:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-5 p-4 bg-amber-50/50 rounded-xl border border-amber-200 shadow-sm">
              <div>
                <label className="block text-[11px] font-bold text-amber-900 mb-1.5">Số tiền thực góp đợt 1 (VNĐ)</label>
                <input
                  type="number"
                  value={formData.initial_contributed_capital}
                  onChange={(e) => {
                    const val = parseInt(e.target.value) || 0;
                    onChange({
                      initial_contributed_capital: val,
                      profit_share_rate: calculateDynamicProfitRate(
                        formData.committed_capital,
                        val,
                        formData.contribution_method
                      ),
                    });
                  }}
                  className="w-full px-3.5 py-2.5 bg-white border border-amber-300 focus:border-amber-500 focus:ring-2 focus:ring-amber-100 rounded-lg text-sm font-bold text-amber-900 transition-all"
                />
              </div>
              <div>
                <label className="block text-[11px] font-bold text-amber-900 mb-1.5">Ngày hạn chót nộp đủ vốn</label>
                <input
                  type="date"
                  value={formData.commitment_deadline}
                  onChange={(e) => onChange({ commitment_deadline: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-white border border-amber-300 focus:border-amber-500 focus:ring-2 focus:ring-amber-100 rounded-lg text-sm text-amber-900 transition-all"
                />
              </div>
            </div>
          )}

          <div className="md:col-span-2">
            <label className="block text-xs font-bold text-slate-700 mb-1.5">
              Ngày ghi nhận góp vốn <span className="text-rose-500">*</span>
            </label>
            <input
              type="date"
              value={formData.contribution_date}
              onChange={(e) => {
                onChange({ contribution_date: e.target.value });
                if (fieldErrors.contribution_date && onClearError) onClearError('contribution_date');
              }}
              className="w-full md:w-1/2 px-3.5 py-2.5 bg-slate-50 border border-slate-200 focus:border-emerald-500 rounded-lg text-sm text-slate-700"
            />
          </div>
        </>
      )}
    </div>
  );
};
