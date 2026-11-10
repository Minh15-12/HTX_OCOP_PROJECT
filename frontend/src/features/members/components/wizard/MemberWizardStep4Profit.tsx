import React from 'react';
import { AlertTriangle } from 'lucide-react';
import { MemberWizardFormState } from './wizardTypes';

interface Step4Props {
  formData: MemberWizardFormState;
  onChange: (patch: Partial<MemberWizardFormState>) => void;
  fieldErrors: Record<string, string>;
}

export const MemberWizardStep4Profit: React.FC<Step4Props> = ({
  formData,
  onChange,
  fieldErrors,
}) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-5 bg-white p-5 rounded-xl border border-slate-100 shadow-sm">
      <div className="md:col-span-2">
        <h4 className="text-sm font-bold text-slate-800 mb-3 border-b border-slate-100 pb-2">
          Ngân hàng & Lợi nhuận
        </h4>
      </div>

      <div>
        <label className="block text-xs font-bold text-slate-700 mb-1.5">Hình thức nhận chi trả</label>
        <select
          value={formData.payout_method}
          onChange={(e) => onChange({ payout_method: e.target.value as 'CASH' | 'BANK_TRANSFER' })}
          className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 focus:border-emerald-500 rounded-lg text-sm font-semibold text-emerald-700"
        >
          <option value="BANK_TRANSFER">Chuyển khoản ngân hàng</option>
          <option value="CASH">Tiền mặt tại HTX</option>
        </select>
      </div>

      {formData.payout_method === 'BANK_TRANSFER' && (
        <>
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">Ngân hàng thụ hưởng</label>
            <input
              type="text"
              value={formData.bank_name}
              onChange={(e) => onChange({ bank_name: e.target.value })}
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 focus:border-emerald-500 rounded-lg text-sm text-slate-700"
              placeholder="VD: Agribank chi nhánh Lâm Hà"
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">Số tài khoản</label>
            <input
              type="text"
              value={formData.bank_account}
              onChange={(e) => onChange({ bank_account: e.target.value })}
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 focus:border-emerald-500 rounded-lg text-sm text-slate-700 font-mono font-bold"
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">Tên chủ tài khoản</label>
            <input
              type="text"
              value={formData.account_holder}
              onChange={(e) => onChange({ account_holder: e.target.value.toUpperCase() })}
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 focus:border-emerald-500 rounded-lg text-sm text-slate-700 uppercase"
              placeholder="NGUYEN VAN A"
            />
          </div>
        </>
      )}

      <div className="md:col-span-2">
        <label className="block text-xs font-bold text-slate-700 mb-1.5">
          Hạn mức nợ vật tư trả chậm cho phép (VNĐ)
        </label>
        <input
          type="number"
          step="1000000"
          value={formData.credit_limit}
          onChange={(e) => onChange({ credit_limit: parseInt(e.target.value) || 0 })}
          className="w-full md:w-1/2 px-3.5 py-2.5 bg-slate-50 border border-slate-200 focus:border-emerald-500 rounded-lg text-sm font-black text-emerald-800"
        />
        <p className="text-[11px] text-slate-400 mt-1">
          Mặc định 15.000.000 ₫ (Theo Luật HTX 2023). Thủ kho sẽ cảnh báo và chặn xuất kho ứng trước nếu dư nợ hiện tại vượt quá hạn mức này.
        </p>
      </div>

      <div className="md:col-span-2 mt-4 p-5 bg-gradient-to-br from-emerald-50 to-teal-50 rounded-xl border border-emerald-100 flex items-start gap-3 shadow-sm">
        <AlertTriangle className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
        <div>
          <h4 className="text-[13px] font-bold text-emerald-900 mb-2">Tỷ lệ phân chia lợi nhuận ước tính (Theo % vốn góp)</h4>
          <div className="flex items-end gap-2">
            <input
              type="number"
              step="0.01"
              value={formData.profit_share_rate}
              onChange={(e) => onChange({ profit_share_rate: parseFloat(e.target.value) || 0 })}
              className={`w-32 px-3 py-2 bg-white border ${
                fieldErrors.profit_share_rate ? 'border-rose-400 ring-2 ring-rose-100' : 'border-emerald-300 focus:border-emerald-500 ring-2 ring-emerald-100'
              } rounded-lg text-lg font-black text-emerald-700 transition-all`}
            />
            <span className="text-emerald-700 font-bold mb-2">%</span>
          </div>
          {fieldErrors.profit_share_rate && (
            <p className="text-xs text-rose-500 font-medium mt-1">{fieldErrors.profit_share_rate}</p>
          )}
          <p className="text-[11.5px] text-emerald-800/80 mt-2 leading-relaxed">
            Hệ thống tự động tính tỷ lệ này dựa trên tổng vốn hiện tại của HTX. Tuy nhiên, theo Luật HTX 2023, phân chia thặng dư sẽ bao gồm <strong>Chia theo vốn góp</strong> và <strong>Chia theo mức độ sử dụng dịch vụ nội bộ</strong>.
          </p>
        </div>
      </div>
    </div>
  );
};
