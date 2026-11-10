import React from 'react';
import {
  X,
  Pencil,
  Printer,
  Trash2,
  Wheat,
  ShieldCheck,
  ShieldAlert,
  Award,
  Scale,
  Sparkles,
} from 'lucide-react';
import type { HarvestItem } from '@/types/agriculture';
import { formatNumber, formatDate } from '@/utils/formatters';

interface HarvestDrawerHeaderProps {
  harvest: HarvestItem;
  onClose: () => void;
  onEdit: (h: HarvestItem) => void;
  onPrintLabel: (h: HarvestItem) => void;
  onDelete?: (h: HarvestItem) => void;
}

export const HarvestDrawerHeader: React.FC<HarvestDrawerHeaderProps> = ({
  harvest,
  onClose,
  onEdit,
  onPrintLabel,
  onDelete,
}) => {
  const isGradeA = harvest.quality_grade === 'GRADE_A';
  const isGradeB = harvest.quality_grade === 'GRADE_B';

  const avatarColor = isGradeA
    ? 'bg-emerald-100 text-emerald-800 border-emerald-200'
    : isGradeB
    ? 'bg-amber-100 text-amber-800 border-amber-200'
    : 'bg-rose-100 text-rose-800 border-rose-200';

  return (
    <div className="p-5 border-b border-slate-200 bg-white z-10 shrink-0 shadow-xs space-y-4">
      {/* Top row: Avatar + Title + Status + Action buttons */}
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3.5 min-w-0">
          <div
            className={`w-12 h-12 rounded-2xl font-black flex items-center justify-center text-lg shadow-2xs shrink-0 border ${avatarColor}`}
          >
            <Wheat className="w-6 h-6" />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <h2 className="text-lg font-black text-slate-900 tracking-tight truncate">
                Lệnh {harvest.harvest_code}
              </h2>
              <span
                className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold border ${
                  isGradeA
                    ? 'bg-emerald-100 text-emerald-800 border-emerald-300'
                    : isGradeB
                    ? 'bg-amber-100 text-amber-800 border-amber-300'
                    : 'bg-rose-100 text-rose-800 border-rose-300'
                }`}
              >
                {isGradeA ? 'GRADE A (Thượng hạng)' : isGradeB ? 'GRADE B (Tiêu chuẩn)' : 'REJECT'}
              </span>
              {harvest.is_phi_cleared ? (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10.5px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                  <ShieldCheck className="w-3 h-3" />
                  Đạt Gate PHI
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10.5px] font-bold bg-rose-50 text-rose-700 border border-rose-200">
                  <ShieldAlert className="w-3 h-3" />
                  Chưa đạt PHI
                </span>
              )}
            </div>
            <p className="text-xs text-slate-500 font-medium mt-1 truncate">
              <span className="font-mono text-emerald-800 font-bold">{harvest.lot_code}</span>
              <span className="mx-1.5 text-slate-300">&bull;</span>
              <span>{harvest.plot_code} - {harvest.plot_name}</span>
              <span className="mx-1.5 text-slate-300">&bull;</span>
              <span className="font-mono">{formatDate(harvest.harvest_date)}</span>
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-1.5 shrink-0">
          <button
            type="button"
            onClick={() => onPrintLabel(harvest)}
            className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-xl border border-emerald-300 bg-emerald-50 text-emerald-800 hover:bg-emerald-100 text-xs font-bold transition-all shadow-2xs cursor-pointer"
            title="In tem nhãn truy xuất GS1"
          >
            <Printer className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">In nhãn GS1</span>
          </button>
          <button
            type="button"
            onClick={() => onEdit(harvest)}
            className="p-1.5 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
            title="Chỉnh sửa lệnh thu hoạch"
          >
            <Pencil className="w-4 h-4" />
          </button>
          {onDelete && (
            <button
              type="button"
              onClick={() => onDelete(harvest)}
              className="p-1.5 rounded-xl border border-slate-200 text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
              title="Hủy lệnh thu hoạch"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          )}
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-xl border border-slate-200 text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
            title="Đóng chi tiết"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Quick KPI Stat Chips */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 pt-1">
        <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200/80">
          <div className="flex items-center gap-1.5 text-[11px] font-bold text-slate-500">
            <Scale className="w-3.5 h-3.5 text-emerald-600" />
            <span>Tổng sản lượng</span>
          </div>
          <div className="text-sm font-black font-mono text-slate-900 mt-1">
            {formatNumber(harvest.quantity_kg)}{' '}
            <span className="text-xs font-normal text-slate-500">kg</span>
          </div>
        </div>

        <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200/80">
          <div className="flex items-center gap-1.5 text-[11px] font-bold text-slate-500">
            <Award className="w-3.5 h-3.5 text-indigo-600" />
            <span>Phẩm cấp Grade A</span>
          </div>
          <div className="text-sm font-black font-mono text-emerald-800 mt-1">
            {formatNumber(harvest.grade_a_kg || 0)}{' '}
            <span className="text-xs font-normal text-slate-500">kg</span>
          </div>
        </div>

        <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200/80">
          <div className="flex items-center gap-1.5 text-[11px] font-bold text-slate-500">
            <Sparkles className="w-3.5 h-3.5 text-amber-600" />
            <span>Độ ngọt Brix</span>
          </div>
          <div className="text-sm font-black font-mono text-amber-900 mt-1">
            {harvest.brix_level ?? 7.5}°
          </div>
        </div>

        <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200/80">
          <div className="flex items-center gap-1.5 text-[11px] font-bold text-slate-500">
            <ShieldCheck className="w-3.5 h-3.5 text-blue-600" />
            <span>Độ đồng đều</span>
          </div>
          <div className="text-sm font-black font-mono text-blue-900 mt-1">
            {harvest.uniformity_rate ?? 90}%
          </div>
        </div>
      </div>
    </div>
  );
};
