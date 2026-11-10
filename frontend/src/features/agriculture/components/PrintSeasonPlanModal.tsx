import React, { useRef, useState, useEffect } from 'react';
import html2pdf from 'html2pdf.js';
import { useTenantContextStore } from '@/stores/tenantContextStore';
import { CropSeason, CropSeasonBomItem } from '@/services/cropSeasonApi';
import { exportSeasonBomToExcel } from '@/utils/excelExporter';
import {
  Printer,
  FileDown,
  FileSpreadsheet,
  X,
  CalendarDays,
  Sprout,
  ShieldCheck,
  CheckCircle2,
} from 'lucide-react';

interface PrintSeasonPlanModalProps {
  isOpen: boolean;
  onClose: () => void;
  season: CropSeason;
  boms: CropSeasonBomItem[];
}

const phaseNames: Record<string, string> = {
  GENERAL: 'Toàn vụ',
  SEEDLING: 'Ươm & Bén rễ',
  VEGETATIVE: 'Sinh dưỡng thân lá',
  FLOWERING: 'Ra hoa & Đậu quả',
  FRUITING: 'Nuôi quả & Thu hoạch',
};

const formatDateDisplay = (dateStr?: string | null) => {
  if (!dateStr) return '—';
  const d = new Date(dateStr);
  if (Number.isNaN(d.getTime())) return dateStr.slice(0, 10);
  const day = String(d.getDate()).padStart(2, '0');
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const year = d.getFullYear();
  return `${day}/${month}/${year}`;
};

export const PrintSeasonPlanModal: React.FC<PrintSeasonPlanModalProps> = ({
  isOpen,
  onClose,
  season,
  boms,
}) => {
  const { activeCooperative } = useTenantContextStore();
  const printAreaRef = useRef<HTMLDivElement>(null);
  const [isExportingPdf, setIsExportingPdf] = useState(false);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen || !season) return null;

  const coopName =
    activeCooperative?.display_name ||
    activeCooperative?.legal_name ||
    activeCooperative?.short_name ||
    'HỢP TÁC XÃ NÔNG NGHIỆP';
  const coopAddress = activeCooperative?.address || 'Lâm Đồng, Việt Nam';
  const coopPhone = activeCooperative?.phone || '—';
  const coopTaxCode = activeCooperative?.tax_code || '—';

  const totalPlannedBudget = boms.reduce(
    (sum, b) =>
      sum +
      (Number(b.estimated_total_cost) ||
        Number(b.planned_quantity || 0) * Number(b.estimated_unit_price || 0)),
    0
  );

  // 1. Direct Print Preview (window.print)
  const handlePrint = () => {
    window.print();
  };

  // 2. Export PDF (.pdf) conforming to RULE-TECH-DOC-01 / R-SYS-011
  const handleExportPdf = async () => {
    if (!printAreaRef.current) return;
    try {
      setIsExportingPdf(true);
      const opt = {
        margin: [10, 10, 10, 10] as [number, number, number, number],
        filename: `Ke_Hoach_Mua_Vu_BOM_${season.name.replace(/\s+/g, '_')}.pdf`,
        image: { type: 'jpeg' as const, quality: 0.98 },
        html2canvas: { scale: 2, useCORS: true, logging: false },
        jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' as const },
      };
      await html2pdf().set(opt).from(printAreaRef.current).save();
    } catch (err) {
      console.error('Lỗi xuất PDF kế hoạch mùa vụ:', err);
      alert('Không thể tạo file PDF tự động. Vui lòng sử dụng tính năng In Trực Tiếp hoặc Tải Excel.');
    } finally {
      setIsExportingPdf(false);
    }
  };

  // 3. Export Excel (.xlsx) conforming to RULE-TECH-DOC-01 / R-SYS-011
  const handleExportExcel = () => {
    exportSeasonBomToExcel(season, boms);
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-2 sm:p-4 backdrop-blur-xs animate-fade-in text-slate-800"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="flex flex-col w-full max-w-4xl max-h-[92vh] bg-white rounded-2xl shadow-2xl overflow-hidden border border-slate-200">
        {/* Top Action Bar (Print Preview Toolbar) */}
        <div className="flex flex-wrap items-center justify-between gap-3 px-6 py-4 bg-slate-900 text-white shrink-0 border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-emerald-600/30 text-emerald-400 rounded-xl border border-emerald-500/30">
              <CalendarDays className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-sm sm:text-base font-bold text-white tracking-wide">
                Hồ Sơ Kế Hoạch Mùa Vụ &amp; Dự Toán Vật Tư (BOM)
              </h2>
              <p className="text-[11px] text-slate-400">
                Mùa vụ: <span className="text-emerald-400 font-bold">{season.name}</span> &bull; Cây trồng: {season.crop}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handlePrint}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold border border-slate-700 transition cursor-pointer"
              title="In trực tiếp ra máy in (A4 Portrait)"
            >
              <Printer className="w-4 h-4 text-emerald-400" />
              <span>In trực tiếp</span>
            </button>

            <button
              type="button"
              onClick={handleExportPdf}
              disabled={isExportingPdf}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-700 hover:bg-emerald-600 text-white text-xs font-bold shadow-xs transition disabled:opacity-50 cursor-pointer"
              title="Tải file PDF lưu trữ hồ sơ"
            >
              <FileDown className="w-4 h-4" />
              <span>{isExportingPdf ? 'Đang tạo PDF...' : 'Tải File PDF'}</span>
            </button>

            <button
              type="button"
              onClick={handleExportExcel}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-teal-800 hover:bg-teal-700 text-white text-xs font-bold shadow-xs transition cursor-pointer"
              title="Tải file Excel để điều chỉnh bảng số liệu"
            >
              <FileSpreadsheet className="w-4 h-4 text-teal-300" />
              <span>Tải Excel</span>
            </button>

            <button
              type="button"
              onClick={onClose}
              className="p-1.5 ml-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition cursor-pointer"
              aria-label="Đóng"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Scrollable Document Content Preview */}
        <div className="overflow-y-auto flex-1 p-4 sm:p-8 bg-slate-100 flex justify-center custom-scrollbar">
          <div
            ref={printAreaRef}
            id="printable-season-plan"
            data-pdf-container="true"
            className="w-full max-w-3xl bg-white p-8 sm:p-10 shadow-md border border-slate-200 text-slate-900 font-sans text-xs leading-relaxed"
          >
            {/* Header: Cooperative & Legal Title */}
            <div className="flex justify-between items-start border-b-2 border-slate-800 pb-4 mb-6">
              <div className="w-7/12 space-y-1">
                <p className="font-extrabold text-[12.5px] uppercase tracking-wide text-emerald-900">
                  {coopName}
                </p>
                <p className="text-[11px] text-slate-600">Địa chỉ: {coopAddress}</p>
                <p className="text-[11px] text-slate-600">Điện thoại: {coopPhone} | MST: {coopTaxCode}</p>
                <p className="text-[11px] font-mono font-bold text-slate-700">
                  Số: KH-{season.unit_code || 'VU'}-{new Date().getFullYear()}
                </p>
              </div>

              <div className="w-5/12 text-center space-y-0.5">
                <p className="font-bold text-[11px] uppercase tracking-wider text-slate-900">
                  CỘNG HÒA XÃ HỘI CHỦ NGHĨA VIỆT NAM
                </p>
                <p className="font-bold text-[11px] text-slate-800 underline decoration-slate-400 underline-offset-4">
                  Độc lập - Tự do - Hạnh phúc
                </p>
                <p className="text-[10px] text-slate-500 italic mt-2">
                  Ngày lập: {formatDateDisplay(new Date().toISOString())}
                </p>
              </div>
            </div>

            {/* Document Title */}
            <div className="text-center my-6 space-y-1">
              <h1 className="text-base sm:text-lg font-black uppercase text-slate-950 tracking-tight">
                KẾ HOẠCH SẢN XUẤT MÙA VỤ &amp; DỰ TOÁN ĐỊNH MỨC VẬT TƯ (BOM)
              </h1>
              <p className="text-[11px] text-slate-600 italic">
                (Căn cứ Luật Hợp tác xã số 17/2023/QH15 &amp; Tiêu chuẩn VietGAP TCVN 11892-1:2017)
              </p>
            </div>

            {/* Section I: Season General Information */}
            <div className="mb-6 space-y-2">
              <h3 className="font-bold text-xs uppercase text-emerald-950 border-b border-emerald-700/40 pb-1 flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-700 inline-block" />
                I. THÔNG TIN CHUNG MÙA VỤ &amp; VÙNG SẢN XUẤT (PUC)
              </h3>
              <div className="grid grid-cols-2 gap-x-6 gap-y-1.5 pt-1 text-slate-800">
                <div>
                  <span className="text-slate-500">Tên mùa vụ:</span>{' '}
                  <strong className="text-slate-950">{season.name}</strong>
                </div>
                <div>
                  <span className="text-slate-500">Cây trồng / Giống:</span>{' '}
                  <strong className="text-slate-950">{season.crop}</strong>
                </div>
                <div>
                  <span className="text-slate-500">Mã vùng sản xuất (PUC):</span>{' '}
                  <strong className="font-mono text-emerald-800">{season.unit_code || 'Chưa cấp'}</strong>
                </div>
                <div>
                  <span className="text-slate-500">Vùng sản xuất:</span>{' '}
                  <strong className="text-slate-950">{season.unit_name || '—'}</strong>
                </div>
                <div>
                  <span className="text-slate-500">Ngày bắt đầu xuống giống:</span>{' '}
                  <strong className="font-mono">{formatDateDisplay(season.start_date)}</strong>
                </div>
                <div>
                  <span className="text-slate-500">Dự kiến kết thúc thu hoạch:</span>{' '}
                  <strong className="font-mono">{formatDateDisplay(season.expected_end_date)}</strong>
                </div>
                <div>
                  <span className="text-slate-500">Nguồn gốc giống F1:</span>{' '}
                  <strong>{season.seed_supplier || '—'}</strong>
                </div>
                <div>
                  <span className="text-slate-500">Hạn mức sản lượng PUC:</span>{' '}
                  <strong className="font-mono text-emerald-900">
                    {season.puc_quota_kg ? `${Number(season.puc_quota_kg).toLocaleString('vi-VN')} kg` : 'Theo năng suất sinh học'}
                  </strong>
                </div>
                <div>
                  <span className="text-slate-500">Trạng thái vận hành vụ:</span>{' '}
                  <strong className="font-semibold text-slate-900">
                    {season.status === 'ACTIVE'
                      ? 'Đang diễn ra (Chăm sóc VietGAP)'
                      : season.status === 'HARVESTING'
                      ? 'Đang trong giai đoạn thu hoạch rộ'
                      : season.status === 'COMPLETED'
                      ? 'Đã hoàn tất vụ mùa'
                      : season.status}
                  </strong>
                </div>
                <div>
                  <span className="text-slate-500">Trạng thái sổ nhật ký:</span>{' '}
                  <strong className="text-slate-900">
                    {season.logbook_status === 'FROZEN_ARCHIVED' ? 'Đã khóa sổ (SHA-256)' : 'Đang mở ghi chép'}
                  </strong>
                </div>
              </div>
            </div>

            {/* Section II: VietGAP Growth Stages */}
            <div className="mb-6 space-y-2">
              <h3 className="font-bold text-xs uppercase text-emerald-950 border-b border-emerald-700/40 pb-1 flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-700 inline-block" />
                II. PHÁC ĐỒ SINH TRƯỞNG 4 GIAI ĐOẠN VIETGAP
              </h3>
              <table className="w-full text-left text-[11px] border-collapse border border-slate-300">
                <thead>
                  <tr className="bg-slate-100 font-bold text-slate-800">
                    <th className="border border-slate-300 py-1.5 px-2.5 w-12 text-center">GĐ</th>
                    <th className="border border-slate-300 py-1.5 px-2.5 w-48">Tên giai đoạn sinh trưởng</th>
                    <th className="border border-slate-300 py-1.5 px-2.5 w-28">Khung thời gian</th>
                    <th className="border border-slate-300 py-1.5 px-2.5">Quy trình kỹ thuật &amp; Phòng ngừa</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td className="border border-slate-300 py-1.5 px-2.5 text-center font-bold">1</td>
                    <td className="border border-slate-300 py-1.5 px-2.5 font-semibold">Ươm cây con &amp; Bén rễ</td>
                    <td className="border border-slate-300 py-1.5 px-2.5 font-mono">Ngày 1 - 30</td>
                    <td className="border border-slate-300 py-1.5 px-2.5">Gieo hạt, kích thích hệ rễ phát triển, tưới EC 1.2 mS/cm, phòng trừ lở cổ rễ.</td>
                  </tr>
                  <tr>
                    <td className="border border-slate-300 py-1.5 px-2.5 text-center font-bold">2</td>
                    <td className="border border-slate-300 py-1.5 px-2.5 font-semibold">Sinh dưỡng thân lá &amp; Tạo tán</td>
                    <td className="border border-slate-300 py-1.5 px-2.5 font-mono">Ngày 31 - 75</td>
                    <td className="border border-slate-300 py-1.5 px-2.5">Tỉa cành tạo tán chữ Y, giăng dây đỡ, tăng đạm &amp; lân sinh học, EC 1.8 - 2.0 mS/cm.</td>
                  </tr>
                  <tr>
                    <td className="border border-slate-300 py-1.5 px-2.5 text-center font-bold">3</td>
                    <td className="border border-slate-300 py-1.5 px-2.5 font-semibold">Ra hoa &amp; Đậu quả lớn</td>
                    <td className="border border-slate-300 py-1.5 px-2.5 font-mono">Ngày 76 - 105</td>
                    <td className="border border-slate-300 py-1.5 px-2.5">Bổ sung Canxi-Bo chống nứt trái, bón Kali tăng độ ngọt Brix &ge; 7°, thả thiên địch Orius.</td>
                  </tr>
                  <tr>
                    <td className="border border-slate-300 py-1.5 px-2.5 text-center font-bold">4</td>
                    <td className="border border-slate-300 py-1.5 px-2.5 font-semibold">Thu hoạch rộ &amp; Kiểm soát PHI</td>
                    <td className="border border-slate-300 py-1.5 px-2.5 font-mono">Ngày 106 - 300</td>
                    <td className="border border-slate-300 py-1.5 px-2.5">Cắt trái định kỳ 5 - 7 ngày/lần, kiểm tra dư lượng thuốc BVTV và cách ly PHI trước ngày hái.</td>
                  </tr>
                </tbody>
              </table>
            </div>

            {/* Section III: Bill of Materials (BOM) Table */}
            <div className="mb-6 space-y-2 html2pdf__page-break">
              <h3 className="font-bold text-xs uppercase text-emerald-950 border-b border-emerald-700/40 pb-1 flex items-center justify-between">
                <span className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-700 inline-block" />
                  III. DỰ TOÁN ĐỊNH MỨC VẬT TƯ ĐẦU VÀO (BOM - BILL OF MATERIALS)
                </span>
                <span className="text-[11px] font-normal text-slate-500">
                  {boms.length} danh mục vật tư
                </span>
              </h3>

              {boms.length === 0 ? (
                <p className="text-slate-500 italic py-2">
                  Chưa có định mức vật tư cụ thể được phê duyệt cho mùa vụ này.
                </p>
              ) : (
                <table className="w-full text-left text-[11px] border-collapse border border-slate-300">
                  <thead>
                    <tr className="bg-slate-100 font-bold text-slate-800">
                      <th className="border border-slate-300 py-1.5 px-2 text-center w-8">STT</th>
                      <th className="border border-slate-300 py-1.5 px-2">Tên vật tư &amp; Mã SKU</th>
                      <th className="border border-slate-300 py-1.5 px-2 w-24">Giai đoạn</th>
                      <th className="border border-slate-300 py-1.5 px-2 text-right w-16">ĐVT</th>
                      <th className="border border-slate-300 py-1.5 px-2 text-right w-20">SL Kế hoạch</th>
                      <th className="border border-slate-300 py-1.5 px-2 text-right w-20">Đã xuất</th>
                      <th className="border border-slate-300 py-1.5 px-2 text-right w-24">Đơn giá (đ)</th>
                      <th className="border border-slate-300 py-1.5 px-2 text-right w-28">Thành tiền (VNĐ)</th>
                    </tr>
                  </thead>
                  <tbody>
                    {boms.map((b, idx) => {
                      const cost =
                        Number(b.estimated_total_cost) ||
                        Number(b.planned_quantity || 0) * Number(b.estimated_unit_price || 0);

                      return (
                        <tr key={b.id || idx}>
                          <td className="border border-slate-300 py-1.5 px-2 text-center">{idx + 1}</td>
                          <td className="border border-slate-300 py-1.5 px-2">
                            <strong className="text-slate-900">{b.material_name || 'Vật tư'}</strong>
                            {b.sku && <span className="font-mono text-slate-500 block text-[10px]">SKU: {b.sku}</span>}
                          </td>
                          <td className="border border-slate-300 py-1.5 px-2">
                            {(b.stage_phase ? phaseNames[b.stage_phase] : undefined) || b.stage_phase || 'Toàn vụ'}
                          </td>
                          <td className="border border-slate-300 py-1.5 px-2 text-right font-medium">{b.unit || '—'}</td>
                          <td className="border border-slate-300 py-1.5 px-2 text-right font-mono font-bold">
                            {Number(b.planned_quantity || 0).toLocaleString('vi-VN')}
                          </td>
                          <td className="border border-slate-300 py-1.5 px-2 text-right font-mono text-slate-700">
                            {Number(b.issued_quantity || 0).toLocaleString('vi-VN')}
                          </td>
                          <td className="border border-slate-300 py-1.5 px-2 text-right font-mono">
                            {Number(b.estimated_unit_price || 0).toLocaleString('vi-VN')}
                          </td>
                          <td className="border border-slate-300 py-1.5 px-2 text-right font-mono font-bold text-emerald-950">
                            {cost.toLocaleString('vi-VN')}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                  <tfoot>
                    <tr className="bg-slate-100 font-bold border-t-2 border-slate-400">
                      <td colSpan={7} className="border border-slate-300 py-2 px-3 text-right uppercase text-slate-800">
                        Tổng ngân sách dự toán vật tư:
                      </td>
                      <td className="border border-slate-300 py-2 px-3 text-right font-mono text-emerald-950 text-xs">
                        {totalPlannedBudget.toLocaleString('vi-VN')} VNĐ
                      </td>
                    </tr>
                  </tfoot>
                </table>
              )}
            </div>

            {/* Section IV: Signatures */}
            <div className="pt-6 mt-6 border-t border-slate-300">
              <div className="grid grid-cols-3 gap-4 text-center">
                <div className="space-y-1">
                  <p className="font-bold uppercase text-[11px] text-slate-900">NGƯỜI LẬP KẾ HOẠCH</p>
                  <p className="text-[10px] text-slate-500 italic">(Ký và ghi rõ họ tên)</p>
                  <div className="h-16" />
                  <p className="font-bold text-slate-800">Cán bộ Kỹ thuật Nông nghiệp</p>
                </div>

                <div className="space-y-1">
                  <p className="font-bold uppercase text-[11px] text-slate-900">KẾ TOÁN TRƯỞNG / THỦ KHO</p>
                  <p className="text-[10px] text-slate-500 italic">(Ký và ghi rõ họ tên)</p>
                  <div className="h-16" />
                  <p className="font-bold text-slate-800">Bộ phận Kế toán Kho vật tư</p>
                </div>

                <div className="space-y-1">
                  <p className="font-bold uppercase text-[11px] text-slate-900">BAN GIÁM ĐỐC HTX DUYỆT</p>
                  <p className="text-[10px] text-slate-500 italic">(Ký, đóng dấu và ghi rõ họ tên)</p>
                  <div className="h-16" />
                  <p className="font-bold text-slate-800">Giám đốc Hợp tác xã</p>
                </div>
              </div>
            </div>

            {/* Print-specific style */}
            <style dangerouslySetInnerHTML={{
              __html: `
                @media print {
                  body * { visibility: hidden !important; }
                  #printable-season-plan, #printable-season-plan * { visibility: visible !important; }
                  #printable-season-plan {
                    position: static !important;
                    width: 100% !important;
                    margin: 0 !important;
                    padding: 0 !important;
                    border: none !important;
                    box-shadow: none !important;
                  }
                  .no-print { display: none !important; }
                  thead { display: table-header-group; }
                  tr { break-inside: avoid; page-break-inside: avoid; }
                  .html2pdf__page-break { page-break-before: always; }
                }
              `
            }} />
          </div>
        </div>

        {/* Bottom Footer Actions */}
        <div className="flex flex-wrap items-center justify-between gap-3 px-6 py-3.5 bg-slate-50 border-t border-slate-200 shrink-0">
          <div className="text-xs text-slate-500 font-medium">
            Tuân thủ chuẩn xuất chứng từ HTX nông nghiệp &bull; Quy định R-SYS-011 &amp; RULE-TECH-DOC-01
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handlePrint}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-200 hover:bg-slate-300 text-slate-800 text-xs font-bold transition cursor-pointer"
            >
              <Printer className="w-4 h-4 text-slate-700" />
              <span>In trực tiếp</span>
            </button>

            <button
              type="button"
              onClick={handleExportPdf}
              disabled={isExportingPdf}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold shadow-xs transition disabled:opacity-50 cursor-pointer"
            >
              <FileDown className="w-4 h-4" />
              <span>{isExportingPdf ? 'Đang tạo PDF...' : 'Tải File PDF'}</span>
            </button>

            <button
              type="button"
              onClick={handleExportExcel}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-teal-700 hover:bg-teal-800 text-white text-xs font-bold shadow-xs transition cursor-pointer"
            >
              <FileSpreadsheet className="w-4 h-4" />
              <span>Tải Excel (.xlsx)</span>
            </button>

            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition cursor-pointer"
            >
              Đóng
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
