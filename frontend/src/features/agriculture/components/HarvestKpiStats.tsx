import React from 'react';
import { Wheat, Scale, QrCode, ShieldCheck } from 'lucide-react';
import { formatNumber } from '@/utils/formatters';

interface HarvestKpiStatsProps {
  totalVolume: number;
  gradeAVolume: number;
  gradeAPercent: number;
  totalLots: number;
}

export const HarvestKpiStats: React.FC<HarvestKpiStatsProps> = ({
  totalVolume,
  gradeAVolume,
  gradeAPercent,
  totalLots,
}) => {
  return (
    <div className="grid grid-cols-1 gap-3.5 sm:grid-cols-2 xl:grid-cols-4">
      {/* Card 1: Tổng sản lượng */}
      <div className="group rounded-2xl border border-slate-200 bg-white p-5 shadow-xs transition hover:border-emerald-200">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-xs font-semibold text-slate-500">Tổng sản lượng thu hoạch</p>
            <p className="mt-1.5 text-2xl font-black tracking-tight text-slate-900">
              {formatNumber(totalVolume)} <span className="text-sm font-bold text-slate-500">kg</span>
            </p>
            <p className="mt-0.5 text-[11px] text-slate-400">Nông sản OCOP HTX</p>
          </div>
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-50 text-emerald-700 border border-emerald-200">
            <Wheat className="h-5 w-5" />
          </div>
        </div>
      </div>

      {/* Card 2: Tỷ lệ Grade A */}
      <div className="group rounded-2xl border border-slate-200 bg-white p-5 shadow-xs transition hover:border-emerald-200">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-xs font-semibold text-slate-500">Sản lượng Grade A (Premium)</p>
            <p className="mt-1.5 text-2xl font-black tracking-tight text-emerald-700">
              {gradeAPercent}% <span className="text-xs font-bold text-slate-500">({formatNumber(gradeAVolume)} kg)</span>
            </p>
            <p className="mt-0.5 text-[11px] text-slate-400">Brix ≥ 7.0° • Đồng đều ≥ 90%</p>
          </div>
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-50 text-emerald-700 border border-emerald-200">
            <Scale className="h-5 w-5" />
          </div>
        </div>
      </div>

      {/* Card 3: Mã lô GS1 */}
      <div className="group rounded-2xl border border-slate-200 bg-white p-5 shadow-xs transition hover:border-blue-200">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-xs font-semibold text-slate-500">Mã lô GS1 đã cấp</p>
            <p className="mt-1.5 text-2xl font-black tracking-tight text-blue-700">
              {totalLots} <span className="text-sm font-bold text-slate-500">lô</span>
            </p>
            <p className="mt-0.5 text-[11px] text-slate-400">Định danh QR xuất xưởng</p>
          </div>
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-700 border border-blue-200">
            <QrCode className="h-5 w-5" />
          </div>
        </div>
      </div>

      {/* Card 4: KCS & PHI Guard */}
      <div className="group rounded-2xl border border-slate-200 bg-white p-5 shadow-xs transition hover:border-emerald-200">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-xs font-semibold text-slate-500">Kiểm định KCS & PHI</p>
            <p className="mt-1.5 text-2xl font-black tracking-tight text-emerald-800">
              100% <span className="text-xs font-bold text-slate-500">Đạt</span>
            </p>
            <p className="mt-0.5 text-[11px] text-slate-400">Âm tính dư lượng BVTV</p>
          </div>
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-50 text-emerald-700 border border-emerald-200">
            <ShieldCheck className="h-5 w-5" />
          </div>
        </div>
      </div>
    </div>
  );
};
