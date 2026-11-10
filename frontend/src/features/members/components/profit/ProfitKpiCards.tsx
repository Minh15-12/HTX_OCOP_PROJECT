import React from 'react';
import { Wallet, ShieldCheck, Percent, TrendingUp, CheckCircle2, Calendar } from 'lucide-react';

interface ProfitKpiCardsProps {
  totalNetProfit: number;
  unallocatedCommonFundAmount: number;
  patronageAmount: number;
  distributedProfitAmount: number;
  distributedProfitPct: number;
  selectedPlanId: string;
  setSelectedPlanId: (id: string) => void;
  apiPlans: any[];
}

export const ProfitKpiCards: React.FC<ProfitKpiCardsProps> = ({
  totalNetProfit,
  unallocatedCommonFundAmount,
  patronageAmount,
  distributedProfitAmount,
  distributedProfitPct,
  selectedPlanId,
  setSelectedPlanId,
  apiPlans,
}) => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
      {/* Card 1: Tổng lợi nhuận khả dụng */}
      <div className="bg-white border border-[#e7e9ec] p-4 rounded-2xl shadow-xs space-y-1">
        <div className="flex items-center justify-between">
          <span className="text-[11px] font-bold text-slate-400 uppercase">Tổng lợi nhuận khả dụng</span>
          <div className="w-8 h-8 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center">
            <Wallet className="w-4 h-4" />
          </div>
        </div>
        <div className="text-xl font-black text-slate-900">{totalNetProfit.toLocaleString('vi-VN')} ₫</div>
        <div className="text-[11px] font-bold text-emerald-600 flex items-center gap-1">
          <ShieldCheck className="w-3.5 h-3.5" /> Miễn thuế TNDN nội bộ
        </div>
      </div>

      {/* Card 2: Quỹ chung không chia */}
      <div className="bg-white border border-[#e7e9ec] p-4 rounded-2xl shadow-xs space-y-1">
        <div className="flex items-center justify-between">
          <span className="text-[11px] font-bold text-slate-400 uppercase">Quỹ chung không chia</span>
          <div className="w-8 h-8 rounded-xl bg-purple-100 text-purple-700 flex items-center justify-center">
            <Percent className="w-4 h-4" />
          </div>
        </div>
        <div className="text-xl font-black text-purple-900">{unallocatedCommonFundAmount.toLocaleString('vi-VN')} ₫</div>
        <div className="text-[11px] text-slate-500 font-semibold">Tối thiểu 5% thu nhập bên ngoài</div>
      </div>

      {/* Card 3: Chia thưởng dịch vụ */}
      <div className="bg-white border border-[#e7e9ec] p-4 rounded-2xl shadow-xs space-y-1">
        <div className="flex items-center justify-between">
          <span className="text-[11px] font-bold text-slate-400 uppercase">Chia thưởng dịch vụ (≥51%)</span>
          <div className="w-8 h-8 rounded-xl bg-blue-100 text-blue-600 flex items-center justify-center">
            <TrendingUp className="w-4 h-4" />
          </div>
        </div>
        <div className="text-xl font-black text-blue-900">{patronageAmount.toLocaleString('vi-VN')} ₫</div>
        <div className="text-[11px] text-blue-600 font-semibold">Patronage Rebate theo doanh số</div>
      </div>

      {/* Card 4: Đã chi trả thực tế */}
      <div className="bg-white border border-[#e7e9ec] p-4 rounded-2xl shadow-xs space-y-1">
        <div className="flex items-center justify-between">
          <span className="text-[11px] font-bold text-slate-400 uppercase">Đã chi trả thực tế</span>
          <div className="w-8 h-8 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center">
            <CheckCircle2 className="w-4 h-4" />
          </div>
        </div>
        <div className="text-xl font-black text-emerald-800">{distributedProfitAmount.toLocaleString('vi-VN')} ₫</div>
        <div className="w-full bg-slate-100 rounded-full h-1.5 mt-1 overflow-hidden">
          <div
            className="bg-emerald-600 h-1.5 rounded-full transition-all"
            style={{ width: `${distributedProfitPct}%` }}
          />
        </div>
      </div>

      {/* Card 5: Niên độ kế toán */}
      <div className="bg-white border border-[#e7e9ec] p-4 rounded-2xl shadow-xs space-y-1">
        <div className="flex items-center justify-between">
          <span className="text-[11px] font-bold text-slate-400 uppercase">Niên độ kế toán</span>
          <div className="w-8 h-8 rounded-xl bg-slate-100 text-slate-600 flex items-center justify-center">
            <Calendar className="w-4 h-4" />
          </div>
        </div>
        <select
          value={selectedPlanId}
          onChange={(e) => setSelectedPlanId(e.target.value)}
          className="w-full mt-1 bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-1 text-xs font-bold text-slate-800 outline-none"
        >
          <option value="">Niên độ 2025 (Mới nhất)</option>
          {apiPlans.map((p) => (
            <option key={p.id} value={p.id}>
              {p.plan_code} (Năm {p.financial_year})
            </option>
          ))}
          <option value="2024">Niên độ 2024 (Đã duyệt)</option>
        </select>
      </div>
    </div>
  );
};
