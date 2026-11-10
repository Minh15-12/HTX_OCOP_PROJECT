import React from 'react';
import {
  MapPin,
  Pencil,
  Users,
  X,
  ExternalLink,
  ShieldCheck,
  ShieldAlert,
  Sprout,
  Ruler,
} from 'lucide-react';
import { FarmPlot, ProductionUnit } from '@/services/farmPlotApi';

interface FarmPlotDrawerHeaderProps {
  plot: FarmPlot;
  unit?: ProductionUnit | null;
  assignedCount?: number;
  onClose: () => void;
  onEdit?: (plot: FarmPlot) => void;
  onAssign?: (plot: FarmPlot) => void;
}

const statusBadge: Record<string, { label: string; cls: string }> = {
  ACTIVE: { label: 'Đang canh tác', cls: 'bg-emerald-50 text-emerald-800 border-emerald-200' },
  PREPARING: { label: 'Chuẩn bị đất', cls: 'bg-amber-50 text-amber-700 border-amber-200' },
  FALLOW: { label: 'Đang nghỉ vụ', cls: 'bg-slate-100 text-slate-700 border-slate-200' },
  INACTIVE: { label: 'Ngưng canh tác', cls: 'bg-rose-50 text-rose-700 border-rose-200' },
  UNDER_PUC_REVIEW: { label: 'Chờ thẩm định PUC', cls: 'bg-amber-50 text-amber-800 border-amber-300 font-bold' },
  IN_QUARANTINE: { label: 'Cách ly PHI 🛑', cls: 'bg-rose-100 text-rose-800 border-rose-300 font-bold animate-pulse' },
};

export const FarmPlotDrawerHeader: React.FC<FarmPlotDrawerHeaderProps> = ({
  plot,
  unit,
  assignedCount = 0,
  onClose,
  onEdit,
  onAssign,
}) => {
  const badge = statusBadge[plot.status] || {
    label: plot.status,
    cls: 'bg-slate-100 text-slate-700 border-slate-200',
  };

  const isQuarantine = plot.status === 'IN_QUARANTINE';

  return (
    <div className="bg-gradient-to-r from-emerald-900 via-teal-950 to-slate-900 text-white p-5 border-b border-emerald-800/40">
      {/* Top action row */}
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-white/10 backdrop-blur-md text-emerald-300 border border-white/10 shadow-inner">
            <MapPin className="h-6 w-6" strokeWidth={2.2} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-mono text-xs font-bold text-emerald-300 bg-emerald-900/60 px-2 py-0.5 rounded border border-emerald-500/30">
                {plot.plot_code}
              </span>
              <span className={`text-[11px] font-bold px-2 py-0.5 rounded-full border ${badge.cls}`}>
                {badge.label}
              </span>
            </div>
            <h2 className="text-lg font-black tracking-tight text-white mt-1">
              {plot.unit_name || unit?.name || 'Thửa đất canh tác'}
            </h2>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {onEdit && (
            <button
              type="button"
              onClick={() => onEdit(plot)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-white font-bold text-xs transition border border-white/15 cursor-pointer"
            >
              <Pencil className="w-3.5 h-3.5 text-emerald-300" />
              Sửa thửa
            </button>
          )}
          {onAssign && (
            <button
              type="button"
              onClick={() => onAssign(plot)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs transition shadow-xs cursor-pointer"
            >
              <Users className="w-3.5 h-3.5" />
              Phân công
            </button>
          )}
          <button
            type="button"
            onClick={onClose}
            aria-label="Đóng ngăn chi tiết thửa đất"
            className="p-1.5 rounded-xl hover:bg-white/15 text-slate-300 hover:text-white transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* 4 KPI summary cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 mt-4 pt-4 border-t border-white/10">
        <div className="bg-white/5 rounded-xl p-2.5 border border-white/10">
          <div className="flex items-center gap-1.5 text-[11px] text-slate-300 font-medium">
            <Ruler className="w-3.5 h-3.5 text-emerald-400" />
            Diện tích thửa
          </div>
          <div className="text-base font-extrabold text-white mt-0.5">{plot.area} ha</div>
        </div>

        <div className="bg-white/5 rounded-xl p-2.5 border border-white/10">
          <div className="flex items-center gap-1.5 text-[11px] text-slate-300 font-medium">
            <Sprout className="w-3.5 h-3.5 text-teal-400" />
            Cây trồng chủ lực
          </div>
          <div className="text-sm font-extrabold text-white mt-0.5 truncate">
            {unit?.crop || 'Theo quy hoạch'}
          </div>
        </div>

        <div className="bg-white/5 rounded-xl p-2.5 border border-white/10">
          <div className="flex items-center gap-1.5 text-[11px] text-slate-300 font-medium">
            {isQuarantine ? (
              <ShieldAlert className="w-3.5 h-3.5 text-rose-400" />
            ) : (
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
            )}
            An toàn PHI
          </div>
          <div
            className={`text-sm font-extrabold mt-0.5 truncate ${
              isQuarantine ? 'text-rose-300' : 'text-emerald-300'
            }`}
          >
            {isQuarantine ? 'Đang cách ly' : 'Đạt chuẩn thu hoạch'}
          </div>
        </div>

        <div className="bg-white/5 rounded-xl p-2.5 border border-white/10">
          <div className="flex items-center gap-1.5 text-[11px] text-slate-300 font-medium">
            <Users className="w-3.5 h-3.5 text-sky-400" />
            Xã viên phụ trách
          </div>
          <div className="text-base font-extrabold text-white mt-0.5">
            {assignedCount} người
          </div>
        </div>
      </div>
    </div>
  );
};
