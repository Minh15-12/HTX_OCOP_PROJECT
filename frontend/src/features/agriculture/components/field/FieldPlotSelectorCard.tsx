import React from 'react';
import { Sprout, ShieldAlert, CheckCircle2, MapPin } from 'lucide-react';

export function formatPlotArea(areaVal?: number): string {
  if (!areaVal || isNaN(areaVal)) return '0 m²';
  if (areaVal < 100) {
    const ha = areaVal;
    const m2 = Math.round(areaVal * 10000);
    return `${ha.toLocaleString('vi-VN', { maximumFractionDigits: 2 })} ha (${m2.toLocaleString('vi-VN')} m²)`;
  }
  if (areaVal >= 10000) {
    const ha = areaVal / 10000;
    return `${ha.toLocaleString('vi-VN', { maximumFractionDigits: 2 })} ha (${Math.round(areaVal).toLocaleString('vi-VN')} m²)`;
  }
  return `${Math.round(areaVal).toLocaleString('vi-VN')} m²`;
}

export interface FieldPlotItem {
  id: string;
  plot_code: string;
  name: string;
  crop_name?: string;
  area_ha?: number;
  area_m2?: number;
  assigned_member_name?: string;
  assigned_member_code?: string;
  is_in_quarantine?: boolean;
  phi_days_remaining?: number;
  safe_harvest_date?: string;
}

interface FieldPlotSelectorCardProps {
  plot: FieldPlotItem;
  isSelected: boolean;
  onSelect: (plot: FieldPlotItem) => void;
}

export const FieldPlotSelectorCard: React.FC<FieldPlotSelectorCardProps> = ({
  plot,
  isSelected,
  onSelect,
}) => {
  return (
    <button
      type="button"
      onClick={() => onSelect(plot)}
      className={`relative w-full text-left rounded-2xl p-4 transition-all duration-150 cursor-pointer text-slate-800 ${
        isSelected
          ? 'bg-emerald-50/90 border-2 border-emerald-600 shadow-sm ring-2 ring-emerald-600/10'
          : 'bg-white border border-slate-200/90 hover:border-slate-300 shadow-2xs hover:bg-slate-50/60 active:scale-[0.99]'
      }`}
    >
      {/* Top row: Plot Code & Selection Badge */}
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <div
            className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 ${
              isSelected
                ? 'bg-emerald-600 text-white shadow-xs'
                : 'bg-slate-100 text-slate-600'
            }`}
          >
            <Sprout className="w-4 h-4" />
          </div>
          <div>
            <span className="font-mono text-xs font-black tracking-tight text-slate-900">
              {plot.plot_code}
            </span>
            <div className="text-[11px] text-slate-500 font-medium truncate max-w-[170px] sm:max-w-[220px]">
              {plot.name}
            </div>
          </div>
        </div>

        {isSelected && (
          <div className="inline-flex items-center gap-1 rounded-full bg-emerald-600 px-2 py-0.5 text-[10px] font-black text-white shadow-xs">
            <CheckCircle2 className="w-3 h-3" />
            <span>Đang chọn</span>
          </div>
        )}
      </div>

      {/* Middle row: Crop & Area metadata */}
      <div className="mt-3 flex items-center gap-2.5 text-xs text-slate-600 border-t border-slate-100 pt-2.5 flex-wrap">
        <span className="inline-flex items-center gap-1 font-semibold text-slate-700">
          🌱 {plot.crop_name || 'Ớt chuông Sweet Palermo'}
        </span>
        <span className="text-slate-300">•</span>
        <span className="text-slate-500 font-mono font-medium">
          📐 {formatPlotArea(plot.area_m2 ?? plot.area_ha ?? 0)}
        </span>
        {plot.assigned_member_name && (
          <>
            <span className="text-slate-300">•</span>
            <span className="text-emerald-700 font-bold truncate max-w-[140px]">
              👤 {plot.assigned_member_name}
            </span>
          </>
        )}
      </div>

      {/* Bottom row: PHI Status */}
      {plot.is_in_quarantine ? (
        <div className="mt-2.5 flex items-center gap-2 rounded-xl bg-amber-50 border border-amber-200/90 px-2.5 py-1.5 text-amber-900 text-[11px]">
          <ShieldAlert className="w-3.5 h-3.5 text-amber-600 shrink-0" />
          <span className="font-bold">
            Cách ly PHI: Còn {plot.phi_days_remaining ?? 3} ngày
          </span>
          <span className="text-amber-700/80 ml-auto font-mono text-[10px]">
            {plot.safe_harvest_date || 'Chưa an toàn'}
          </span>
        </div>
      ) : (
        <div className="mt-2.5 flex items-center gap-1.5 text-emerald-700 text-[11px] font-semibold">
          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
          <span>Vùng an toàn thu hoạch (Đạt chuẩn VietGAP)</span>
        </div>
      )}
    </button>
  );
};
