import React from 'react';
import { Layers3, Ruler, Sprout, MapPin } from 'lucide-react';

interface FarmPlotKpiCardsProps {
  totalUnits: number;
  totalArea: number;
  activeCount: number;
  plotsCount: number | string;
  selectedUnitCode: string;
}

export const FarmPlotKpiCards: React.FC<FarmPlotKpiCardsProps> = ({
  totalUnits,
  totalArea,
  activeCount,
  plotsCount,
  selectedUnitCode,
}) => {
  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
      <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-xs flex items-center justify-between">
        <div>
          <p className="text-[11.5px] font-medium text-slate-500">Tổng vùng trồng</p>
          <p className="mt-1 text-2xl font-black tracking-tight text-slate-900">{totalUnits}</p>
          <p className="text-[10.5px] text-slate-400 mt-0.5">Vùng đang quản lý</p>
        </div>
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-50 text-emerald-700 border border-emerald-200">
          <Layers3 className="h-5 w-5" />
        </div>
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-xs flex items-center justify-between">
        <div>
          <p className="text-[11.5px] font-medium text-slate-500">Tổng diện tích</p>
          <p className="mt-1 text-2xl font-black tracking-tight text-slate-900">
            {totalArea.toFixed(1)} <span className="text-sm font-bold text-slate-500">ha</span>
          </p>
          <p className="text-[10.5px] text-slate-400 mt-0.5">Quy hoạch VietGAP</p>
        </div>
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-blue-700 border border-blue-200">
          <Ruler className="h-5 w-5" />
        </div>
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-xs flex items-center justify-between">
        <div>
          <p className="text-[11.5px] font-medium text-slate-500">Đang canh tác</p>
          <p className="mt-1 text-2xl font-black tracking-tight text-emerald-700">{activeCount}</p>
          <p className="text-[10.5px] text-slate-400 mt-0.5">Vùng đang sản xuất</p>
        </div>
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-50 text-amber-700 border border-amber-200">
          <Sprout className="h-5 w-5" />
        </div>
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-xs flex items-center justify-between">
        <div>
          <p className="text-[11.5px] font-medium text-slate-500">Thửa đất trực thuộc</p>
          <p className="mt-1 text-2xl font-black tracking-tight text-slate-900">
            {plotsCount}
          </p>
          <p className="text-[10.5px] text-slate-400 mt-0.5 truncate max-w-[130px]">
            {selectedUnitCode}
          </p>
        </div>
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-violet-50 text-violet-700 border border-violet-200">
          <MapPin className="h-5 w-5" />
        </div>
      </div>
    </div>
  );
};
