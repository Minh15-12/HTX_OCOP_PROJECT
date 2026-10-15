import React from 'react';
import {
  X,
  Wheat,
  QrCode,
  ShieldAlert,
  ShieldCheck,
  CheckCircle,
  Calendar,
  Layers,
  FlaskConical,
  Scale,
  ExternalLink,
  Printer,
  Pencil,
  Trash2,
  GitBranch,
} from 'lucide-react';
import type { HarvestItem } from '@/types/agriculture';
import { formatNumber, formatDate } from '@/utils/formatters';
import { useNavigate } from 'react-router-dom';

interface HarvestDetailPanelProps {
  harvest: HarvestItem | null;
  onClose?: () => void;
  onEdit: (harvest: HarvestItem) => void;
  onDelete: (harvest: HarvestItem) => void;
  onPrintLabel: (harvest: HarvestItem) => void;
}

export const HarvestDetailPanel: React.FC<HarvestDetailPanelProps> = ({
  harvest,
  onClose,
  onEdit,
  onDelete,
  onPrintLabel,
}) => {
  const navigate = useNavigate();

  if (!harvest) {
    return (
      <div className="flex min-h-[500px] flex-col items-center justify-center p-8 text-center bg-white rounded-2xl border border-slate-200 shadow-sm">
        <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-slate-50 text-slate-300">
          <Wheat className="h-8 w-8" />
        </div>
        <h3 className="font-bold text-slate-700 text-sm">Chọn một lô thu hoạch</h3>
        <p className="mt-1 max-w-xs text-xs text-slate-400 leading-relaxed">
          Nhấp vào bất kỳ dòng nào trong bảng bên trái để xem đầy đủ hồ sơ KCS 3 cấp, kiểm nghiệm lab và mã lô GS1.
        </p>
      </div>
    );
  }

  const isGradeA = harvest.quality_grade === 'GRADE_A';
  const isGradeB = harvest.quality_grade === 'GRADE_B';

  return (
    <aside className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm flex flex-col animate-fade-in text-[13px]">
      {/* Header Styled Identical to Reference Image 4 */}
      <div className="border-b border-slate-100 bg-gradient-to-br from-emerald-50 via-white to-white p-5">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-100 text-emerald-700 shadow-xs">
              <Wheat className="h-5 w-5" />
            </div>
            <div>
              <p className="text-[10px] font-bold uppercase tracking-widest text-emerald-600">
                Chi tiết thu hoạch & KCS 3 cấp
              </p>
              <h3 className="mt-0.5 text-base sm:text-lg font-extrabold text-slate-900 leading-snug">
                {harvest.harvest_code} • {harvest.plot_code}
              </h3>
            </div>
          </div>

          <div className="flex items-center gap-1.5 shrink-0">
            <button
              onClick={() => onEdit(harvest)}
              className="inline-flex items-center gap-1 rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-xs font-bold text-slate-700 shadow-2xs hover:border-emerald-300 hover:text-emerald-700 hover:bg-emerald-50/50 transition cursor-pointer"
              title="Chỉnh sửa KCS & Phân bổ sản lượng"
            >
              <Pencil className="h-3.5 w-3.5 text-slate-500" />
              <span>Sửa</span>
            </button>
            <button
              onClick={() => onDelete(harvest)}
              className="inline-flex items-center justify-center h-8 w-8 rounded-lg border border-slate-200 bg-white text-slate-400 hover:text-rose-600 hover:bg-rose-50 shadow-2xs transition cursor-pointer"
              title="Hủy lệnh thu hoạch"
            >
              <Trash2 className="h-3.5 w-3.5" />
            </button>
            {onClose && (
              <button
                onClick={onClose}
                className="inline-flex items-center justify-center h-8 w-8 rounded-lg border border-slate-200 bg-white text-slate-400 hover:text-slate-700 hover:bg-slate-50 shadow-2xs transition cursor-pointer"
                title="Đóng bảng chi tiết"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>
        </div>

        {/* Badges Row */}
        <div className="mt-3.5 flex flex-wrap items-center justify-between gap-2 rounded-xl border border-white bg-white/80 px-3.5 py-2.5 shadow-xs">
          <span className="font-mono text-xs font-extrabold text-slate-800 bg-slate-100 px-2.5 py-1 rounded-md border border-slate-200">
            {harvest.lot_code}
          </span>
          <span
            className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-black border ${
              isGradeA
                ? 'bg-emerald-50 text-emerald-800 border-emerald-300'
                : isGradeB
                ? 'bg-amber-50 text-amber-800 border-amber-300'
                : 'bg-rose-50 text-rose-800 border-rose-300'
            }`}
          >
            {isGradeA ? 'GRADE A (Thượng hạng)' : isGradeB ? 'GRADE B (Tiêu chuẩn)' : 'REJECT'}
          </span>
        </div>
      </div>

      {/* Detail Content Body */}
      <div className="p-5 space-y-4 overflow-y-auto max-h-[calc(100vh-280px)]">
        {/* Metadata Grid */}
        <div className="grid grid-cols-2 gap-3">
          <div className="rounded-xl bg-slate-50 p-3 border border-slate-100">
            <p className="text-[11px] font-medium text-slate-400">Thửa đất thu hoạch</p>
            <p className="mt-1 font-bold text-slate-800 text-xs truncate">{harvest.plot_code}</p>
            <p className="text-[10.5px] text-slate-400 truncate">{harvest.plot_name}</p>
          </div>

          <div className="rounded-xl bg-slate-50 p-3 border border-slate-100">
            <p className="text-[11px] font-medium text-slate-400">Ngày thu hoạch</p>
            <p className="mt-1 font-bold text-slate-900 text-xs flex items-center gap-1">
              <Calendar className="w-3.5 h-3.5 text-emerald-600" />
              {formatDate(harvest.harvest_date)}
            </p>
          </div>
        </div>

        {/* Cấp 1 & Cấp 2 KCS Badges */}
        <div className="rounded-2xl border border-slate-200/90 bg-white p-3.5 space-y-2.5 shadow-2xs">
          <h4 className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            Kiểm tra KCS Cấp 1 & Cấp 2
          </h4>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
            <div className="p-2.5 bg-emerald-50/60 rounded-xl border border-emerald-200">
              <span className="text-[10.5px] text-emerald-700 font-semibold block">Cấp 1 - Gate Check PHI</span>
              <span className="font-extrabold text-emerald-900 text-xs flex items-center gap-1 mt-0.5">
                <CheckCircle className="w-3.5 h-3.5 text-emerald-600" /> Pass - Đạt an toàn
              </span>
            </div>

            <div className="p-2.5 bg-emerald-50/60 rounded-xl border border-emerald-200">
              <span className="text-[10.5px] text-emerald-700 font-semibold block">Cấp 2 - Quick Lab Test</span>
              <span className="font-extrabold text-emerald-900 text-xs flex items-center gap-1 mt-0.5">
                <CheckCircle className="w-3.5 h-3.5 text-emerald-600" /> Âm tính dư lượng
              </span>
            </div>
          </div>

          <div className="text-[11px] text-slate-500 pt-1 border-t border-slate-100">
            Kit test: <strong className="font-mono text-slate-700">{harvest.kcs_quick_lab?.kit_code || 'KIT-RAPID-PEST'}</strong> • Dư lượng: <strong>{harvest.kcs_quick_lab?.residue_ppm ?? 0} ppm</strong>
          </div>
        </div>

        {/* Cấp 3: Sản lượng & Phẩm cấp */}
        <div className="rounded-2xl border border-slate-200/90 bg-white p-3.5 space-y-3 shadow-2xs">
          <h4 className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
            <Scale className="w-4 h-4 text-emerald-600" />
            Cấp 3 - Phân loại phẩm cấp nông sản
          </h4>

          <div className="grid grid-cols-3 gap-2 text-center">
            <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-200">
              <span className="text-[10px] text-slate-400 block font-semibold">Tổng SL</span>
              <span className="text-sm font-black text-slate-900 mt-0.5 block">
                {formatNumber(harvest.quantity_kg)} kg
              </span>
            </div>
            <div className="bg-emerald-50 p-2.5 rounded-xl border border-emerald-200">
              <span className="text-[10px] text-emerald-700 block font-semibold">Grade A</span>
              <span className="text-sm font-black text-emerald-800 mt-0.5 block">
                {formatNumber(harvest.grade_a_kg || 0)} kg
              </span>
            </div>
            <div className="bg-amber-50 p-2.5 rounded-xl border border-amber-200">
              <span className="text-[10px] text-amber-700 block font-semibold">Grade B</span>
              <span className="text-sm font-black text-amber-800 mt-0.5 block">
                {formatNumber(harvest.grade_b_kg || 0)} kg
              </span>
            </div>
          </div>

          <div className="flex items-center justify-between text-xs pt-1 border-t border-slate-100">
            <span className="text-slate-500 text-[11px]">Độ Brix khúc xạ quang học:</span>
            <span className="font-extrabold text-slate-900">{harvest.brix_level || 7.5}° Brix</span>
          </div>

          <div className="flex items-center justify-between text-xs">
            <span className="text-slate-500 text-[11px]">Độ đồng đều kích cỡ:</span>
            <span className="font-extrabold text-slate-900">{harvest.uniformity_rate || 90}%</span>
          </div>
        </div>

        {/* Quick Actions Footer inside Panel */}
        <div className="pt-2 flex flex-col gap-2">
          <button
            onClick={() => onPrintLabel(harvest)}
            className="w-full py-2.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-sm transition flex items-center justify-center gap-2 cursor-pointer"
          >
            <Printer className="w-4 h-4" />
            <span>In Tem Nhãn QR GS1 Xuất Xưởng</span>
          </button>

          <div className="grid grid-cols-2 gap-2">
            <a
              href={`/trace/${harvest.lot_id || harvest.id}`}
              target="_blank"
              rel="noreferrer"
              className="py-2 px-3 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 font-bold text-xs shadow-2xs transition flex items-center justify-center gap-1.5"
            >
              <QrCode className="w-3.5 h-3.5 text-emerald-600" />
              <span>Trang QR</span>
              <ExternalLink className="w-3 h-3 text-slate-400" />
            </a>

            <button
              onClick={() => navigate(`/agriculture/lots/${harvest.id}/traceability`)}
              className="py-2 px-3 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 font-bold text-xs shadow-2xs transition flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <GitBranch className="w-3.5 h-3.5 text-cop-600" />
              <span>Cây Phả Hệ</span>
            </button>
          </div>
        </div>
      </div>
    </aside>
  );
};
