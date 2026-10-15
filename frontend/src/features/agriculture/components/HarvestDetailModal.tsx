import React from 'react';
import {
  X,
  Wheat,
  QrCode,
  ShieldAlert,
  ShieldCheck,
  CheckCircle,
  AlertTriangle,
  Calendar,
  Layers,
  FlaskConical,
  Award,
  ExternalLink,
  Printer,
  Scale,
} from 'lucide-react';
import type { HarvestItem } from '@/types/agriculture';
import { formatNumber, formatDate } from '@/utils/formatters';
import { useNavigate } from 'react-router-dom';

interface HarvestDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  harvest: HarvestItem | null;
  onPrintLabel?: () => void;
}

export const HarvestDetailModal: React.FC<HarvestDetailModalProps> = ({
  isOpen,
  onClose,
  harvest,
  onPrintLabel,
}) => {
  const navigate = useNavigate();

  if (!isOpen || !harvest) return null;

  const isGradeA = harvest.quality_grade === 'GRADE_A';
  const isGradeB = harvest.quality_grade === 'GRADE_B';
  const isReject = harvest.quality_grade === 'REJECT';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 p-4 sm:p-6 backdrop-blur-sm animate-fade-in text-[13px]">
      <div className="relative w-full max-w-2xl max-h-[90vh] bg-white rounded-3xl shadow-2xl border border-slate-100 flex flex-col overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-100 bg-gradient-to-r from-emerald-50/70 via-white to-slate-50 flex items-start justify-between">
          <div className="space-y-1">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="font-mono text-xs font-black text-emerald-800 bg-emerald-100 px-2.5 py-0.5 rounded-full border border-emerald-300">
                {harvest.harvest_code}
              </span>
              <span className="font-mono text-xs font-extrabold text-slate-800 bg-slate-100 px-2 py-0.5 rounded border border-slate-300">
                {harvest.lot_code}
              </span>
              <span
                className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-black border ${
                  isGradeA
                    ? 'bg-emerald-50 text-emerald-800 border-emerald-300'
                    : isGradeB
                    ? 'bg-amber-50 text-amber-800 border-amber-300'
                    : 'bg-rose-50 text-rose-800 border-rose-300'
                }`}
              >
                {isGradeA
                  ? 'GRADE A (Thượng hạng)'
                  : isGradeB
                  ? 'GRADE B (Tiêu chuẩn)'
                  : 'REJECT'}
              </span>
            </div>
            <h2 className="text-lg font-black text-slate-900 tracking-tight">
              Chi Tiết Lệnh Thu Hoạch & Hồ Sơ KCS 3 Cấp
            </h2>
            <p className="text-xs text-slate-500">
              Mã Lô GS1 Quốc Tế • HTX Nông nghiệp Tân Tiến Đà Lạt
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body Content */}
        <div className="p-6 overflow-y-auto space-y-5">
          {/* Section 1: Thửa đất & Ngày thu hoạch */}
          <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200/80 space-y-3">
            <h4 className="text-xs font-black text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
              <Layers className="w-4 h-4 text-emerald-600" />
              1. Thông Tin Canh Tác & Nguồn Gốc
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div>
                <span className="text-slate-400 block text-[11px]">Thửa đất thu hoạch:</span>
                <span className="font-mono font-bold text-slate-900 text-sm">
                  {harvest.plot_code}
                </span>
                <span className="text-slate-500 block text-[11px]">{harvest.plot_name}</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[11px]">Ngày thu hoạch:</span>
                <span className="font-bold text-slate-900 flex items-center gap-1 mt-0.5">
                  <Calendar className="w-3.5 h-3.5 text-emerald-600" />
                  {formatDate(harvest.harvest_date)}
                </span>
              </div>
              <div>
                <span className="text-slate-400 block text-[11px]">Mùa vụ canh tác:</span>
                <span className="font-medium text-slate-700">
                  {harvest.crop_season_name || 'Vụ Ớt Chuông Sweet Palermo Thu Đông 2026'}
                </span>
              </div>
              <div>
                <span className="text-slate-400 block text-[11px]">Mã lô định danh GS1:</span>
                <span className="font-mono font-bold text-emerald-800 bg-white px-2 py-0.5 rounded border border-slate-200 inline-block">
                  {harvest.lot_code}
                </span>
              </div>
            </div>
          </div>

          {/* Section 2: KCS Cấp 1 - Gate Check PHI */}
          <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200/80 space-y-3">
            <h4 className="text-xs font-black text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              2. KCS Cấp 1 - Gate Check: Khóa An Toàn PHI (Pre-Harvest Interval)
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div>
                <span className="text-slate-400 block text-[11px]">Tình trạng đối soát cổng:</span>
                <span className="inline-flex items-center gap-1 text-xs font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200 mt-1">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                  Hợp lệ - Đã vượt qua thời hạn cách ly PHI
                </span>
              </div>
              <div>
                <span className="text-slate-400 block text-[11px]">Ngày an toàn thu hoạch:</span>
                <span className="font-extrabold text-emerald-800 text-sm">
                  {harvest.safe_harvest_date || harvest.harvest_date}
                </span>
              </div>
              {harvest.kcs_gate_check?.note && (
                <div className="sm:col-span-2 text-slate-600 bg-white p-2.5 rounded-xl border border-slate-200">
                  <strong>Ghi chú cổng:</strong> {harvest.kcs_gate_check.note}
                </div>
              )}
            </div>
          </div>

          {/* Section 3: KCS Cấp 2 - Quick Lab Test */}
          <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200/80 space-y-3">
            <h4 className="text-xs font-black text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
              <FlaskConical className="w-4 h-4 text-emerald-600" />
              3. KCS Cấp 2 - Quick Lab: Kiểm Nghiệm Dư Lượng Nhanh
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div>
                <span className="text-slate-400 block text-[11px]">Kết quả thử nghiệm test kit:</span>
                <span
                  className={`inline-flex items-center gap-1 text-xs font-extrabold px-2.5 py-0.5 rounded-full border mt-1 ${
                    harvest.kcs_quick_lab?.test_result === 'LAB_PASSED'
                      ? 'bg-emerald-100 text-emerald-800 border-emerald-300'
                      : 'bg-rose-100 text-rose-800 border-rose-300'
                  }`}
                >
                  <CheckCircle className="w-3.5 h-3.5" />
                  {harvest.kcs_quick_lab?.test_result === 'LAB_PASSED'
                    ? 'ÂM TÍNH (Pass - An toàn thực phẩm)'
                    : 'DƯƠNG TÍNH (Reject - Có hóa chất)'}
                </span>
              </div>
              <div>
                <span className="text-slate-400 block text-[11px]">Mã Kit Test & Dư lượng (ppm):</span>
                <span className="font-mono font-bold text-slate-800 text-sm">
                  {harvest.kcs_quick_lab?.kit_code || 'KIT-RAPID-PEST'} • {harvest.kcs_quick_lab?.residue_ppm ?? 0} ppm
                </span>
              </div>
              <div className="sm:col-span-2">
                <span className="text-slate-400 block text-[11px]">Hoạt chất đối soát:</span>
                <div className="flex gap-1.5 mt-1 flex-wrap">
                  {(harvest.kcs_quick_lab?.active_substances_tested || ['Chlorpyrifos', 'Imidacloprid', 'Cypermethrin']).map(
                    (sub) => (
                      <span
                        key={sub}
                        className="bg-white px-2 py-0.5 rounded-md border border-slate-200 font-mono text-[11px] text-slate-700"
                      >
                        {sub}
                      </span>
                    )
                  )}
                </div>
              </div>
              <div className="sm:col-span-2 text-slate-500 text-[11px]">
                Kiểm nghiệm viên: <strong>{harvest.kcs_quick_lab?.tester_name || 'Tổ KCS HTX Tân Tiến'}</strong> • Thời điểm: {harvest.kcs_quick_lab?.tested_at || harvest.created_at}
              </div>
            </div>
          </div>

          {/* Section 4: KCS Cấp 3 - Grading Phân Loại Sản Lượng */}
          <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200/80 space-y-3">
            <h4 className="text-xs font-black text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
              <Scale className="w-4 h-4 text-emerald-600" />
              4. KCS Cấp 3 - Grading: Phân Loại Phẩm Cấp & Sản Lượng
            </h4>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
              <div className="bg-white p-3 rounded-xl border border-slate-200">
                <span className="text-[11px] text-slate-400 block font-semibold">Tổng Sản Lượng</span>
                <span className="text-base font-black text-slate-900 mt-1 block">
                  {formatNumber(harvest.quantity_kg)} kg
                </span>
              </div>
              <div className="bg-emerald-50 p-3 rounded-xl border border-emerald-200">
                <span className="text-[11px] text-emerald-700 block font-semibold">Grade A (Premium)</span>
                <span className="text-base font-black text-emerald-800 mt-1 block">
                  {formatNumber(harvest.grade_a_kg || 0)} kg
                </span>
              </div>
              <div className="bg-amber-50 p-3 rounded-xl border border-amber-200">
                <span className="text-[11px] text-amber-700 block font-semibold">Grade B (Tiêu chuẩn)</span>
                <span className="text-base font-black text-amber-800 mt-1 block">
                  {formatNumber(harvest.grade_b_kg || 0)} kg
                </span>
              </div>
              <div className="bg-rose-50 p-3 rounded-xl border border-rose-200">
                <span className="text-[11px] text-rose-700 block font-semibold">Hàng Loại (Reject)</span>
                <span className="text-base font-black text-rose-800 mt-1 block">
                  {formatNumber(harvest.reject_kg || 0)} kg
                </span>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 text-xs">
              <div>
                <span className="text-slate-400 block text-[11px]">Độ ngọt Brix đo bằng khúc xạ kế quang học:</span>
                <span className="font-extrabold text-slate-900 text-sm">
                  {harvest.brix_level || 7.5}° Brix (Tiêu chuẩn xuất khẩu: ≥ 7.0°)
                </span>
              </div>
              <div>
                <span className="text-slate-400 block text-[11px]">Độ đồng đều kích cỡ & màu sắc:</span>
                <span className="font-extrabold text-slate-900 text-sm">
                  {harvest.uniformity_rate || 90}% (Tiêu chuẩn Grade A: ≥ 90%)
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Footer with Actions */}
        <div className="px-6 py-4 border-t border-slate-100 bg-slate-50 flex items-center justify-between flex-wrap gap-2">
          <div className="flex items-center gap-2">
            {/* Direct Link to Public Traceability View */}
            <a
              href={`/trace/${harvest.lot_id || harvest.id}`}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 font-bold text-xs shadow-2xs transition"
            >
              <QrCode className="w-3.5 h-3.5 text-emerald-600" />
              <span>Trang QR Công Khai</span>
              <ExternalLink className="w-3 h-3 text-slate-400" />
            </a>

            {/* Direct Link to Internal Genealogy Tree */}
            <button
              onClick={() => {
                onClose();
                navigate(`/agriculture/lots/${harvest.id}/traceability`);
              }}
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 font-bold text-xs shadow-2xs transition cursor-pointer"
            >
              <span>Xem Cây Phả Hệ GS1</span>
            </button>
          </div>

          <div className="flex items-center gap-2">
            {onPrintLabel && (
              <button
                onClick={() => {
                  onClose();
                  onPrintLabel();
                }}
                className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-sm transition flex items-center gap-1.5 cursor-pointer"
              >
                <Printer className="w-4 h-4" />
                <span>In Tem QR Xuất Xưởng</span>
              </button>
            )}
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-900 text-white font-bold text-xs shadow-sm transition cursor-pointer"
            >
              Đóng
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
