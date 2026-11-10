import React from 'react';
import { ShieldCheck } from 'lucide-react';

export interface ProfitPlanFormState {
  fiscal_year: number;
  internal_service_surplus: number;
  external_service_surplus: number;
  unallocated_common_fund_rate: number;
  reserve_fund_rate: number;
  patronage_rebate_rate: number;
  welfare_fund_rate: number;
  planned_payout_date: string;
  notes: string;
}

interface ProfitParamConfigCardProps {
  profitPlanForm: ProfitPlanFormState;
  setProfitPlanForm: React.Dispatch<React.SetStateAction<ProfitPlanFormState>>;
  unallocatedCommonFundAmount: number;
  onSubmit: (e: React.FormEvent) => void;
}

export const ProfitParamConfigCard: React.FC<ProfitParamConfigCardProps> = ({
  profitPlanForm,
  setProfitPlanForm,
  unallocatedCommonFundAmount,
  onSubmit,
}) => {
  return (
    <div className="bg-white border border-[#e7e9ec] rounded-2xl p-5 shadow-xs space-y-4">
      <div className="flex justify-between items-center border-b border-slate-100 pb-3">
        <h3 className="font-extrabold text-slate-900 text-sm flex items-center gap-2">
          <ShieldCheck className="w-4.5 h-4.5 text-emerald-600" /> Tham số Bóc tách Thu nhập & Cấu hình Trích Quỹ (Luật HTX 2023)
        </h3>
        <span className="text-[11px] text-emerald-800 font-bold bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200">
          Thông tư 71/2024/TT-BTC & Nghị định 113/2024/NĐ-CP
        </span>
      </div>

      <form onSubmit={onSubmit} className="space-y-4 text-xs">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
          <div>
            <label className="block font-bold text-slate-700 mb-1">
              Lợi nhuận Giao dịch Nội bộ (TK 512) *
            </label>
            <div className="relative">
              <input
                type="number"
                value={profitPlanForm.internal_service_surplus}
                onChange={(e) =>
                  setProfitPlanForm({
                    ...profitPlanForm,
                    internal_service_surplus: Number(e.target.value),
                  })
                }
                className="w-full px-3 py-2 border border-emerald-300 bg-emerald-50/20 rounded-xl font-extrabold text-emerald-900 text-sm outline-none"
              />
              <span className="text-[10.5px] text-emerald-700 font-bold block mt-1">
                Miễn 100% thuế TNDN
              </span>
            </div>
          </div>

          <div>
            <label className="block font-bold text-slate-700 mb-1">
              Lợi nhuận Giao dịch Bên ngoài (TK 511) *
            </label>
            <div className="relative">
              <input
                type="number"
                value={profitPlanForm.external_service_surplus}
                onChange={(e) =>
                  setProfitPlanForm({
                    ...profitPlanForm,
                    external_service_surplus: Number(e.target.value),
                  })
                }
                className="w-full px-3 py-2 border border-slate-200 rounded-xl font-bold text-slate-900 text-sm outline-none"
              />
              <span className="text-[10.5px] text-slate-500 font-bold block mt-1">
                Thuế TNDN 20% = {(profitPlanForm.external_service_surplus * 0.2).toLocaleString('vi-VN')} ₫
              </span>
            </div>
          </div>

          <div>
            <label className="block font-bold text-slate-700 mb-1">
              Quỹ chung không chia (Min 5%)
            </label>
            <div className="flex items-center gap-2">
              <input
                type="number"
                min={5}
                max={50}
                value={profitPlanForm.unallocated_common_fund_rate}
                onChange={(e) =>
                  setProfitPlanForm({
                    ...profitPlanForm,
                    unallocated_common_fund_rate: Number(e.target.value),
                  })
                }
                className="w-20 px-3 py-2 border border-purple-300 rounded-xl font-bold text-purple-900 text-sm outline-none"
              />
              <span className="text-xs text-purple-800 font-bold">
                ({unallocatedCommonFundAmount.toLocaleString('vi-VN')} ₫)
              </span>
            </div>
          </div>

          <div>
            <label className="block font-bold text-slate-700 mb-1">
              Chia theo Dịch vụ (Min 50%)
            </label>
            <div className="flex items-center gap-2">
              <input
                type="number"
                min={50}
                max={100}
                value={profitPlanForm.patronage_rebate_rate}
                onChange={(e) =>
                  setProfitPlanForm({
                    ...profitPlanForm,
                    patronage_rebate_rate: Number(e.target.value),
                  })
                }
                className="w-20 px-3 py-2 border border-blue-300 rounded-xl font-bold text-blue-900 text-sm outline-none"
              />
              <span className="text-xs text-blue-800 font-bold">
                (Vốn góp: {100 - profitPlanForm.patronage_rebate_rate}%)
              </span>
            </div>
          </div>
        </div>

        {/* Quick Ratio Presets */}
        <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/80 flex flex-wrap items-center justify-between gap-2">
          <span className="text-[11px] font-bold text-slate-600">
            Cấu hình tỷ lệ phân chia thặng dư nhanh (Luật HTX 2023 Điều 85):
          </span>
          <div className="flex flex-wrap items-center gap-1.5">
            <button
              type="button"
              onClick={() =>
                setProfitPlanForm({
                  ...profitPlanForm,
                  patronage_rebate_rate: 70,
                })
              }
              className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                profitPlanForm.patronage_rebate_rate === 70
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-100'
              }`}
            >
              70% Dịch vụ / 30% Vốn (HTX Tân Tiến)
            </button>
            <button
              type="button"
              onClick={() =>
                setProfitPlanForm({
                  ...profitPlanForm,
                  patronage_rebate_rate: 50,
                })
              }
              className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                profitPlanForm.patronage_rebate_rate === 50
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-100'
              }`}
            >
              50% Dịch vụ / 50% Vốn (Nghị quyết ĐHĐCĐ)
            </button>
            <button
              type="button"
              onClick={() =>
                setProfitPlanForm({
                  ...profitPlanForm,
                  patronage_rebate_rate: 51,
                })
              }
              className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                profitPlanForm.patronage_rebate_rate === 51
                  ? 'bg-purple-600 text-white shadow-xs'
                  : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-100'
              }`}
            >
              51% Dịch vụ / 49% Vốn (Tối thiểu Luật)
            </button>
          </div>
        </div>

        <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
          <button
            type="submit"
            className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl shadow-xs text-xs whitespace-nowrap transition cursor-pointer"
          >
            Cập nhật mô hình phân bổ thặng dư
          </button>
        </div>
      </form>
    </div>
  );
};
