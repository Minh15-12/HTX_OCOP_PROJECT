import React from 'react';
import { CalendarDays, Sprout, Wheat, CheckCircle2, Clock } from 'lucide-react';
import { CropSeason } from '@/services/cropSeasonApi';

interface CropSeasonsStatsProps {
  seasons: CropSeason[];
}

export const CropSeasonsStats: React.FC<CropSeasonsStatsProps> = ({ seasons }) => {
  const total = seasons.length;
  const activeCount = seasons.filter((s) => s.status === 'ACTIVE').length;
  const harvestingCount = seasons.filter((s) => s.status === 'HARVESTING').length;
  const completedCount = seasons.filter((s) => s.status === 'COMPLETED').length;
  const plannedCount = seasons.filter((s) => s.status === 'PLANNED').length;

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5">
      <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-xs flex items-center justify-between">
        <div>
          <p className="text-[11.8px] text-slate-500 font-medium">Tổng số mùa vụ</p>
          <p className="text-2xl font-black text-slate-900 mt-1">{total}</p>
          <p className="text-[10.8px] text-slate-400 mt-0.5">Tất cả chu kỳ canh tác</p>
        </div>
        <div className="w-10 h-10 rounded-xl flex items-center justify-center border bg-slate-50 border-slate-200 text-slate-700">
          <CalendarDays className="w-5 h-5" />
        </div>
      </div>

      <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-xs flex items-center justify-between">
        <div>
          <p className="text-[11.8px] text-slate-500 font-medium">Đang diễn ra</p>
          <p className="text-2xl font-black text-emerald-700 mt-1">{activeCount}</p>
          <p className="text-[10.8px] text-slate-400 mt-0.5">Đang chăm sóc VietGAP</p>
        </div>
        <div className="w-10 h-10 rounded-xl flex items-center justify-center border bg-emerald-50 border-emerald-200 text-emerald-700">
          <Sprout className="w-5 h-5" />
        </div>
      </div>

      <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-xs flex items-center justify-between">
        <div>
          <p className="text-[11.8px] text-slate-500 font-medium">Đang thu hoạch</p>
          <p className="text-2xl font-black text-blue-700 mt-1">{harvestingCount}</p>
          <p className="text-[10.8px] text-slate-400 mt-0.5">Kiểm định KCS tại ruộng</p>
        </div>
        <div className="w-10 h-10 rounded-xl flex items-center justify-center border bg-blue-50 border-blue-200 text-blue-700">
          <Wheat className="w-5 h-5" />
        </div>
      </div>

      <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-xs flex items-center justify-between">
        <div>
          <p className="text-[11.8px] text-slate-500 font-medium">Đã kết thúc / Quyết toán</p>
          <p className="text-2xl font-black text-slate-600 mt-1">{completedCount}</p>
          <p className="text-[10.8px] text-slate-400 mt-0.5">Khóa số liệu mùa vụ</p>
        </div>
        <div className="w-10 h-10 rounded-xl flex items-center justify-center border bg-slate-100 border-slate-200 text-slate-600">
          <CheckCircle2 className="w-5 h-5" />
        </div>
      </div>
    </div>
  );
};
