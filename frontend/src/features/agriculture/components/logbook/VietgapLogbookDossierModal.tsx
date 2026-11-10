import React, { useRef, useState, useEffect } from 'react';
import {
  X,
  Printer,
  Download,
  FileSpreadsheet,
  ShieldCheck,
  CheckCircle2,
  Calendar,
  Layers,
  MapPin,
  Lock,
  Award,
  Sparkles,
  Loader2,
} from 'lucide-react';
import type { FarmingLog, FarmPlot, HarvestItem, SeasonMaterialReconciliation } from '@/types/agriculture';
import type { CropSeason } from '@/services/cropSeasonApi';
import { useTenantContextStore } from '@/stores/tenantContextStore';
import { exportToExcel } from '@/utils/exportUtils';
import { exportPdfFromElement } from '@/utils/pdfExportUtils';
import { useToast } from '@/components/ui/ToastNotification';

interface VietgapLogbookDossierModalProps {
  isOpen: boolean;
  onClose: () => void;
  season?: CropSeason;
  plots: FarmPlot[];
  logs: FarmingLog[];
  harvests: HarvestItem[];
  reconciliations: SeasonMaterialReconciliation[];
}

export const VietgapLogbookDossierModal: React.FC<VietgapLogbookDossierModalProps> = ({
  isOpen,
  onClose,
  season,
  plots,
  logs,
  harvests,
  reconciliations,
}) => {
  const { activeCooperative } = useTenantContextStore();
  const { showToast } = useToast();
  const printContainerRef = useRef<HTMLDivElement>(null);
  const [isExportingPdf, setIsExportingPdf] = useState(false);
  const [pageOrientation, setPageOrientation] = useState<'portrait' | 'landscape'>('portrait');

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const htxName = activeCooperative?.display_name || activeCooperative?.legal_name || 'HỢP TÁC XÃ NÔNG NGHIỆP';
  const htxAddress = activeCooperative?.address || '—';
  const htxTax = activeCooperative?.tax_code || '—';
  const pucCode = (season as any)?.unit_code || (season as any)?.puc_code || 'Chưa cấp mã PUC';
  const seasonName = season?.name || 'Kế hoạch mùa vụ';
  const cropName = season?.crop || '—';

  // Sắp xếp các danh mục nhật ký
  const landLogs = logs.filter(
    (l) => l.activity_type === 'LAND_PREPARATION' || l.activity_type === 'SOIL_TILLAGE' || l.activity_type === 'SUBSTRATE_MIXING'
  );
  const fertigationLogs = logs.filter(
    (l) =>
      l.activity_type === 'FERTILIZATION' ||
      l.activity_type === 'FERTILIZING' ||
      Boolean(l.ec_solution) ||
      Boolean(l.tank_composition) ||
      Boolean(l.fertigation_method)
  );
  const pestLogs = logs.filter(
    (l) =>
      l.activity_type === 'SPRAYING' ||
      l.activity_type === 'PEST_CONTROL' ||
      l.activity_type === 'BIOCONTROL' ||
      l.activity_type === 'IPM_SCOUTING' ||
      Boolean(l.active_ingredient) ||
      Boolean(l.phi_days && l.phi_days > 0)
  );
  const isFrozen = season?.logbook_status === 'FROZEN_ARCHIVED' || season?.status === 'COMPLETED';

  // Helper định dạng ngày Việt Nam (DD/MM/YYYY) chống gãy dòng
  const formatDateDisplay = (dateStr?: string) => {
    if (!dateStr) return '-';
    const parts = dateStr.split('-');
    if (parts.length === 3) {
      return `${parts[2]}/${parts[1]}/${parts[0]}`;
    }
    return dateStr;
  };

  // 1. In trực tiếp
  const handlePrint = () => {
    window.print();
  };

  // 2. Xuất file PDF thực sự (.pdf) tải về máy
  const handleExportPdf = async () => {
    if (!printContainerRef.current) return;
    try {
      setIsExportingPdf(true);
      showToast(`Đang kết xuất và tạo tệp PDF hồ sơ VietGAP khổ A4 (${pageOrientation === 'landscape' ? 'ngang' : 'dọc'})...`, 'info');
      await exportPdfFromElement(
        printContainerRef.current,
        `Ho_So_Nhat_Ky_VietGAP_${pucCode}.pdf`,
        {
          format: 'a4',
          orientation: pageOrientation,
          scale: 2,
        }
      );
      showToast('Đã tải tệp PDF về máy thành công!', 'success');
    } catch (err: any) {
      console.error('Lỗi xuất PDF:', err);
      showToast('Không thể tạo file PDF trực tiếp. Đang mở hộp thoại in để bạn chọn "Lưu dạng PDF"...', 'warning');
      window.print();
    } finally {
      setIsExportingPdf(false);
    }
  };

  // 2. Xuất dữ liệu ra file Excel chuẩn VietGAP
  const handleExportExcel = () => {
    try {
      const rows = logs.map((log, idx) => {
        const itemNames = log.items && log.items.length > 0
          ? log.items.map((i) => `${i.item_name || i.material_name} (${i.dosage_per_ha || i.quantity_applied || ''})`).join(', ')
          : log.material_name || 'Không có';

        return {
          STT: idx + 1,
          'Mã nhật ký': log.log_code || log.id,
          'Ngày ghi nhận': log.activity_date,
          'Thửa đất': log.plot_name || log.plot_code,
          'Hoạt động': log.activity_type,
          'Vật tư / Chế phẩm': itemNames,
          'Nồng độ / EC': log.ec_solution ? `EC: ${log.ec_solution} mS/cm` : 'N/A',
          'Độ pH': log.ph_solution || 'N/A',
          'Thời gian cách ly (PHI)': log.phi_days ? `${log.phi_days} ngày` : '0 ngày',
          'Ngày an toàn thu hoạch': log.safe_harvest_date || log.activity_date,
          'Tọa độ GPS': log.gps_latitude ? `${log.gps_latitude}, ${log.gps_longitude}` : 'N/A',
          'Kiểm tra ranh giới': log.is_gps_verified ? 'Hợp lệ trong thửa' : 'Lệch dung sai',
          'Trạng thái ICS': log.status === 'VERIFIED' ? 'Đã thẩm định' : log.status === 'REJECTED' ? 'Từ chối' : 'Chờ duyệt',
          'Người ghi chép': log.performer_name || 'Xã viên',
          'Người thẩm định': log.verifier_name || 'Tổ trưởng ICS',
          'Mã băm SHA-256': log.hash_sha256 || 'N/A',
        };
      });

      exportToExcel(rows, `Ho_So_Nhat_Ky_VietGAP_${pucCode}`, 'NhatKyVietGAP');
      showToast('Đã xuất toàn bộ hồ sơ nhật ký VietGAP sang file Excel thành công!', 'success');
    } catch (err: any) {
      showToast('Lỗi khi xuất file Excel!', 'error');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/75 p-2 sm:p-4 backdrop-blur-sm animate-fade-in text-slate-800">
      <div className="relative w-full max-w-5xl max-h-[96vh] bg-slate-100 rounded-3xl shadow-2xl border border-slate-300 flex flex-col overflow-hidden">
        {/* Top Control Bar (Screen Only - Hidden in Print) */}
        <div className="print:hidden px-6 py-4 bg-white border-b border-slate-200 flex flex-wrap items-center justify-between gap-3 shrink-0">
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-xl bg-emerald-50 text-emerald-700 border border-emerald-200">
              <Award className="w-5 h-5" />
            </span>
            <div>
              <h3 className="text-base font-black text-slate-900 flex items-center gap-2">
                <span>Hồ Sơ Nhật Ký Canh Tác VietGAP Hoàn Chỉnh (A4 Dossier)</span>
                {isFrozen && (
                  <span className="px-2 py-0.5 rounded-full text-[10.5px] font-black bg-emerald-100 text-emerald-800 border border-emerald-300 flex items-center gap-1">
                    <Lock className="w-3 h-3" /> Đã Khóa Sổ Merkle
                  </span>
                )}
              </h3>
              <p className="text-xs text-slate-500 font-medium">
                Quy chuẩn TCVN 11892-1:2017 • TCVN 12850:2019 • TT 75/2025/TT-BNNMT • TT 71/2024/TT-BTC
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Bộ chọn khổ giấy A4 Dọc / Ngang */}
            <div className="hidden sm:flex items-center bg-slate-100 p-0.5 rounded-xl border border-slate-200 text-xs">
              <button
                type="button"
                onClick={() => setPageOrientation('portrait')}
                className={`px-2.5 py-1.5 rounded-lg font-bold transition cursor-pointer ${
                  pageOrientation === 'portrait'
                    ? 'bg-white text-emerald-800 shadow-2xs'
                    : 'text-slate-500 hover:text-slate-800'
                }`}
                title="Khổ giấy A4 dọc chuẩn văn bản hành chính"
              >
                Khổ Dọc A4
              </button>
              <button
                type="button"
                onClick={() => setPageOrientation('landscape')}
                className={`px-2.5 py-1.5 rounded-lg font-bold transition cursor-pointer ${
                  pageOrientation === 'landscape'
                    ? 'bg-white text-emerald-800 shadow-2xs'
                    : 'text-slate-500 hover:text-slate-800'
                }`}
                title="Khổ giấy A4 ngang tối ưu cho bảng biểu nhiều cột (Mục III & IV)"
              >
                Khổ Ngang A4
              </button>
            </div>

            {/* Nút 1: In trực tiếp */}
            <button
              type="button"
              onClick={handlePrint}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs shadow-xs transition active:scale-95 cursor-pointer"
              title="In trực tiếp ra máy in hoặc Lưu dưới dạng PDF (Ctrl+P)"
            >
              <Printer className="w-4 h-4" />
              <span>In Hồ Sơ A4</span>
            </button>

            {/* Nút 2: Tải PDF */}
            <button
              type="button"
              onClick={handleExportPdf}
              disabled={isExportingPdf}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-slate-300 bg-white hover:bg-slate-50 text-slate-700 font-bold text-xs shadow-2xs transition active:scale-95 cursor-pointer disabled:opacity-50"
              title="Tải tệp PDF hồ sơ VietGAP (.pdf) trực tiếp về máy"
            >
              {isExportingPdf ? (
                <Loader2 className="w-4 h-4 animate-spin text-emerald-700" />
              ) : (
                <Download className="w-4 h-4 text-emerald-700" />
              )}
              <span>{isExportingPdf ? 'Đang tạo PDF...' : 'Tải PDF (.pdf)'}</span>
            </button>

            {/* Nút 3: Tải Excel */}
            <button
              type="button"
              onClick={handleExportExcel}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-slate-300 bg-white hover:bg-slate-50 text-slate-700 font-bold text-xs shadow-2xs transition active:scale-95 cursor-pointer"
              title="Tải bảng tính Excel toàn bộ nhật ký để đối soát số liệu"
            >
              <FileSpreadsheet className="w-4 h-4 text-emerald-700" />
              <span>Tải Excel (.xlsx)</span>
            </button>

            <button
              type="button"
              onClick={onClose}
              className="p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition cursor-pointer ml-1"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Printable Document Body */}
        <div className="p-4 sm:p-8 overflow-y-auto print:p-0 print:overflow-visible bg-slate-200 print:bg-white">
          <style>{`
            @page {
              size: A4 ${pageOrientation};
              margin: 10mm;
            }
            .html2pdf__page-break {
              page-break-before: always !important;
              break-before: page !important;
              display: block;
              height: 0;
              margin: 0;
              padding: 0;
            }
            @media print {
              .html2pdf__page-break {
                page-break-before: always !important;
                break-before: page !important;
              }
              thead {
                display: table-header-group !important;
              }
              tr {
                page-break-inside: avoid !important;
                break-inside: avoid !important;
              }
            }
          `}</style>
          <div
            ref={printContainerRef}
            data-pdf-container="true"
            className={`${
              pageOrientation === 'landscape' ? 'max-w-6xl' : 'max-w-4xl'
            } mx-auto bg-white p-6 sm:p-10 shadow-md print:shadow-none print:p-0 print:m-0 print:max-w-none text-slate-900 space-y-10 transition-all`}
            style={{ minHeight: pageOrientation === 'landscape' ? '210mm' : '297mm' }}
          >
            {/* TRANG BÌA HỒ SƠ VIETGAP */}
            <div className="border-4 border-double border-emerald-900 p-8 sm:p-12 rounded-2xl text-center space-y-6 print:break-inside-avoid">
              <div className="space-y-1">
                <p className="font-bold text-xs tracking-widest uppercase text-slate-700">
                  CỘNG HÒA XÃ HỘI CHỦ NGHĨA VIỆT NAM
                </p>
                <p className="font-medium text-xs text-slate-600">Độc lập - Tự do - Hạnh phúc</p>
                <div className="w-24 h-0.5 bg-slate-400 mx-auto mt-2" />
              </div>

              <div className="py-6 space-y-3">
                <span className="inline-block px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider bg-emerald-50 text-emerald-900 border border-emerald-300">
                  TIÊU CHUẨN VIỆT NAM TCVN 11892-1:2017 &amp; TCVN 12850:2019
                </span>
                <h1 className="text-2xl sm:text-4xl font-black text-emerald-950 uppercase tracking-tight font-serif">
                  SỔ NHẬT KÝ CANH TÁC VIETGAP
                </h1>
                <h2 className="text-lg sm:text-xl font-bold text-slate-800">
                  Sản phẩm: {cropName}
                </h2>
              </div>

              <div className="max-w-lg mx-auto text-left text-xs sm:text-sm space-y-2 border-t border-b border-slate-200 py-4 font-medium">
                <div className="flex justify-between py-1 border-b border-slate-100">
                  <span className="text-slate-500">Đơn vị chủ quản:</span>
                  <strong className="text-slate-900 text-right">{htxName}</strong>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-100">
                  <span className="text-slate-500">Mã số thuế HTX:</span>
                  <span className="font-mono font-bold text-slate-900">{htxTax}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-100">
                  <span className="text-slate-500">Mã số vùng trồng (PUC):</span>
                  <span className="font-mono font-black text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                    {pucCode}
                  </span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-100">
                  <span className="text-slate-500">Niên vụ canh tác:</span>
                  <strong className="text-slate-900">{seasonName}</strong>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-100">
                  <span className="text-slate-500">Thời gian mùa vụ:</span>
                  <span className="font-bold text-slate-800">
                    {season?.start_date || '01/08/2026'} đến {season?.expected_end_date || (season as any)?.end_date || '31/01/2027'}
                  </span>
                </div>
                <div className="flex justify-between py-1">
                  <span className="text-slate-500">Địa chỉ vùng sản xuất:</span>
                  <span className="text-slate-900 text-right">{htxAddress}</span>
                </div>
              </div>

              {isFrozen && (season?.logbook_final_hash || (season as any)?.merkle_root) && (
                <div className="p-3 bg-emerald-50/80 rounded-xl border border-emerald-200 max-w-lg mx-auto text-center space-y-1">
                  <span className="text-[11px] font-black uppercase text-emerald-900 flex items-center justify-center gap-1">
                    <ShieldCheck className="w-4 h-4 text-emerald-700" />
                    BẢO CHỨNG SỐ KHÓA SỔ BẤT BIẾN (MERKLE ROOT SHA-256)
                  </span>
                  <code className="text-[10px] font-mono text-emerald-800 break-all block">
                    {season?.logbook_final_hash || (season as any)?.merkle_root}
                  </code>
                </div>
              )}

              <p className="text-[11px] text-slate-400 italic">
                Lưu trữ hồ sơ chứng từ thanh tra VietGAP • Giữ gìn tối thiểu 24 tháng theo quy định
              </p>
            </div>

            {/* Ngắt trang sau bìa hồ sơ */}
            <div className="html2pdf__page-break" style={{ pageBreakBefore: 'always', breakBefore: 'page' }} />

            {/* MỤC I: THÔNG TIN CÁC THỬA ĐẤT THAM GIA MÙA VỤ */}
            <section className="space-y-4 print:break-inside-avoid">
              <div className="border-b-2 border-emerald-900 pb-2">
                <h3 className="text-base font-black text-emerald-950 uppercase tracking-tight flex items-center gap-2">
                  <span>Mục I: Danh Sách Thửa Đất Canh Tác Thuộc Mã Vùng Trồng {pucCode}</span>
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Kiểm soát ranh giới tọa độ VN2000 / WGS-84 theo Nghị định 38/2026/NĐ-CP
                </p>
              </div>

              <div className="overflow-x-visible">
                <table className="w-full table-fixed text-left text-xs border border-slate-300 border-collapse">
                  <colgroup>
                    <col className="w-[6%]" />
                    <col className="w-[17%]" />
                    <col className="w-[18%]" />
                    <col className="w-[13%]" />
                    <col className="w-[18%]" />
                    <col className="w-[14%]" />
                    <col className="w-[14%]" />
                  </colgroup>
                  <thead className="bg-slate-100 text-[11px] font-bold text-slate-700 uppercase border-b border-slate-300">
                    <tr>
                      <th className="p-2 border border-slate-300 text-center">STT</th>
                      <th className="p-2 border border-slate-300 text-center">Mã Thửa</th>
                      <th className="p-2 border border-slate-300 text-center">Tờ bản đồ / Số thửa</th>
                      <th className="p-2 border border-slate-300 text-right">Diện tích</th>
                      <th className="p-2 border border-slate-300">Loại nhà màng</th>
                      <th className="p-2 border border-slate-300 text-right">Hạn mức sản lượng (Trần)</th>
                      <th className="p-2 border border-slate-300 text-center">Tình trạng cách ly</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200">
                    {plots.map((plot, idx) => (
                      <tr key={plot.id} className="hover:bg-slate-50">
                        <td className="p-2 border border-slate-300 text-center font-bold text-slate-400">{idx + 1}</td>
                        <td className="p-2 border border-slate-300 font-mono font-bold text-slate-900 text-center whitespace-nowrap">
                          {plot.plot_code}
                        </td>
                        <td className="p-2 border border-slate-300 text-center whitespace-nowrap">
                          Tờ {plot.land_sheet_number || '-'} / Thửa {plot.land_parcel_number || '-'}
                        </td>
                        <td className="p-2 border border-slate-300 font-semibold text-right whitespace-nowrap">
                          {(() => {
                            const a = Number(plot.area || 0);
                            const ha = a < 100 ? a : a / 10000;
                            const m2 = a < 100 ? a * 10000 : a;
                            return `${ha.toLocaleString('vi-VN', { maximumFractionDigits: 2 })} ha (${m2.toLocaleString('vi-VN')} m²)`;
                          })()}
                        </td>
                        <td className="p-2 border border-slate-300 break-words">
                          {plot.greenhouse_type || 'Nhà màng công nghệ cao'}
                        </td>
                        <td className="p-2 border border-slate-300 font-bold text-slate-800 text-right whitespace-nowrap">
                          {(() => {
                            const a = Number(plot.area || 0);
                            const m2 = a < 100 ? a * 10000 : a;
                            const quota = plot.max_harvest_quota_kg || Math.round(m2 * 5.0 * 1.2);
                            return `${quota.toLocaleString('vi-VN')} kg`;
                          })()}
                        </td>
                        <td className="p-2 border border-slate-300 text-center whitespace-nowrap">
                          {plot.status === 'IN_QUARANTINE' ? (
                            <span className="font-bold text-rose-700">Đang cách ly</span>
                          ) : (
                            <span className="font-semibold text-emerald-700">An toàn thu hoạch</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>

            {/* MỤC II: SỔ THEO DÕI XỬ LÝ ĐẤT & GIÁ THỂ */}
            <section className="space-y-4 print:break-inside-avoid">
              <div className="border-b-2 border-emerald-900 pb-2">
                <h3 className="text-base font-black text-emerald-950 uppercase tracking-tight">
                  Mục II: Sổ Theo Dõi Xử Lý Đất, Giá Thể &amp; Bón Lót Ban Đầu
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Xử lý xơ dừa, nấm đối kháng Trichoderma và rửa mặn giá thể trước khi xuống giống
                </p>
              </div>

              <div className="overflow-x-visible">
                <table className="w-full table-fixed text-left text-xs border border-slate-300 border-collapse">
                  <colgroup>
                    <col className="w-[6%]" />
                    <col className="w-[14%]" />
                    <col className="w-[15%]" />
                    <col className="w-[33%]" />
                    <col className="w-[11%]" />
                    <col className="w-[11%]" />
                    <col className="w-[10%]" />
                  </colgroup>
                  <thead className="bg-slate-100 text-[11px] font-bold text-slate-700 uppercase border-b border-slate-300">
                    <tr>
                      <th className="p-2 border border-slate-300 text-center">STT</th>
                      <th className="p-2 border border-slate-300">Ngày làm</th>
                      <th className="p-2 border border-slate-300">Thửa đất</th>
                      <th className="p-2 border border-slate-300">Nội dung công việc &amp; Vật tư</th>
                      <th className="p-2 border border-slate-300">Liều lượng</th>
                      <th className="p-2 border border-slate-300">Người thực hiện</th>
                      <th className="p-2 border border-slate-300 text-center">ICS Duyệt</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200">
                    {landLogs.length === 0 ? (
                      <tr>
                        <td colSpan={7} className="p-4 text-center text-slate-400 italic">
                          Chưa có ghi chép xử lý đất / giá thể đầu vụ.
                        </td>
                      </tr>
                    ) : (
                      landLogs.map((l, idx) => (
                        <tr key={l.id}>
                          <td className="p-2 border border-slate-300 text-center font-bold text-slate-400">{idx + 1}</td>
                          <td className="p-2 border border-slate-300 font-mono font-bold text-center whitespace-nowrap text-[10.5px]">
                            {formatDateDisplay(l.activity_date)}
                          </td>
                          <td className="p-2 border border-slate-300 font-semibold text-center whitespace-nowrap text-[10.5px]">
                            {l.plot_code}
                          </td>
                          <td className="p-2 border border-slate-300 break-words whitespace-normal leading-relaxed text-[11px]">
                            {l.description || l.material_name || 'Xử lý giá thể khử khuẩn'}
                          </td>
                          <td className="p-2 border border-slate-300 text-center whitespace-nowrap font-medium text-[10.5px]">
                            {l.quantity_applied ? `${l.quantity_applied} ${l.unit || 'kg'}` : '-'}
                          </td>
                          <td className="p-2 border border-slate-300 break-words text-[10.5px]">{l.performer_name || 'Xã viên'}</td>
                          <td className="p-2 border border-slate-300 text-center font-bold text-emerald-800 whitespace-nowrap text-[10.5px]">
                            {l.status === 'VERIFIED' ? '✓ Đã duyệt' : 'Chờ duyệt'}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </section>

            {/* Ngắt trang trước Mục III: Sổ Dinh Dưỡng Fertigation */}
            <div className="html2pdf__page-break" style={{ pageBreakBefore: 'always', breakBefore: 'page' }} />

            {/* MỤC III: SỔ DINH DƯỠNG & FERTIGATION */}
            <section className="space-y-4 print:break-inside-avoid">
              <div className="border-b-2 border-emerald-900 pb-2">
                <h3 className="text-base font-black text-emerald-950 uppercase tracking-tight">
                  Mục III: Sổ Nhật Ký Dinh Dưỡng &amp; Tưới Nhỏ Giọt Fertigation Công Nghệ Cao
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Duy trì EC cấp 2.0 - 2.5 mS/cm, pH 5.8 - 6.2, kiểm soát nồng độ rễ và lưu lượng nước
                </p>
              </div>

              <div className="overflow-x-visible">
                <table className="w-full table-fixed text-left text-xs border border-slate-300 border-collapse">
                  <colgroup>
                    <col className="w-[4%]" />
                    <col className="w-[10%]" />
                    <col className="w-[14%]" />
                    <col className="w-[8%]" />
                    <col className="w-[8%]" />
                    <col className="w-[6%]" />
                    <col className="w-[8%]" />
                    <col className="w-[28%]" />
                    <col className="w-[14%]" />
                  </colgroup>
                  <thead className="bg-slate-100 text-[11px] font-bold text-slate-700 uppercase border-b border-slate-300">
                    <tr>
                      <th className="p-2 border border-slate-300 text-center">STT</th>
                      <th className="p-2 border border-slate-300 text-center">Ngày</th>
                      <th className="p-2 border border-slate-300 text-center">Thửa</th>
                      <th className="p-2 border border-slate-300 text-center">EC Cấp</th>
                      <th className="p-2 border border-slate-300 text-center">EC Thoát</th>
                      <th className="p-2 border border-slate-300 text-center">pH</th>
                      <th className="p-2 border border-slate-300 text-center">Lượng nước</th>
                      <th className="p-2 border border-slate-300">Thành phần phân bón</th>
                      <th className="p-2 border border-slate-300">Người thực hiện</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200">
                    {fertigationLogs.length === 0 ? (
                      <tr>
                        <td colSpan={9} className="p-4 text-center text-slate-400 italic">
                          Chưa có lượt ghi fertigation nào.
                        </td>
                      </tr>
                    ) : (
                      fertigationLogs.map((l, idx) => (
                        <tr key={l.id}>
                          <td className="p-2 border border-slate-300 text-center font-bold text-slate-400">{idx + 1}</td>
                          <td className="p-2 border border-slate-300 font-mono font-bold text-center whitespace-nowrap text-[10.5px]">
                            {formatDateDisplay(l.activity_date)}
                          </td>
                          <td className="p-1.5 border border-slate-300 font-mono font-semibold text-center whitespace-nowrap text-[8.5px] tracking-tight">
                            {l.plot_code}
                          </td>
                          <td className="p-2 border border-slate-300 font-mono font-bold text-teal-900 text-center whitespace-nowrap text-[10.5px]">
                            {l.ec_solution ? `${l.ec_solution} mS/cm` : '-'}
                          </td>
                          <td className="p-2 border border-slate-300 font-mono text-center whitespace-nowrap text-[10.5px]">
                            {l.ec_drain ? `${l.ec_drain} mS/cm` : '-'}
                          </td>
                          <td className="p-2 border border-slate-300 font-mono font-bold text-center whitespace-nowrap text-[10.5px]">
                            {l.ph_solution || '6.0'}
                          </td>
                          <td className="p-2 border border-slate-300 font-mono text-center whitespace-nowrap text-[10.5px]">
                            {l.water_volume_liters ? `${l.water_volume_liters.toLocaleString('vi-VN')} L` : '-'}
                          </td>
                          <td className="p-2 border border-slate-300 break-words whitespace-normal leading-relaxed text-[11px]">
                            {l.tank_composition ? (
                              <div className="space-y-0.5 text-[10.5px]">
                                {l.tank_composition.tank_a && (
                                  <div>
                                    <strong>A:</strong>{' '}
                                    {typeof l.tank_composition.tank_a === 'string'
                                      ? l.tank_composition.tank_a
                                      : Array.isArray(l.tank_composition.tank_a)
                                      ? l.tank_composition.tank_a.map((i: any) => `${i.name || ''} (${i.kg || i.amount || ''}kg)`).join(', ')
                                      : JSON.stringify(l.tank_composition.tank_a)}
                                  </div>
                                )}
                                {l.tank_composition.tank_b && (
                                  <div>
                                    <strong>B:</strong>{' '}
                                    {typeof l.tank_composition.tank_b === 'string'
                                      ? l.tank_composition.tank_b
                                      : Array.isArray(l.tank_composition.tank_b)
                                      ? l.tank_composition.tank_b.map((i: any) => `${i.name || ''} (${i.kg || i.amount || ''}kg)`).join(', ')
                                      : JSON.stringify(l.tank_composition.tank_b)}
                                  </div>
                                )}
                              </div>
                            ) : (
                              l.material_name || l.description || 'Dung dịch dinh dưỡng chuẩn HTX'
                            )}
                          </td>
                          <td className="p-2 border border-slate-300 break-words text-[10.5px]">{l.performer_name || 'Xã viên'}</td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </section>

            {/* Ngắt trang trước Mục IV: Sổ Bảo Vệ Thực Vật & Tank-Mix */}
            <div className="html2pdf__page-break" style={{ pageBreakBefore: 'always', breakBefore: 'page' }} />

            {/* MỤC IV: SỔ BẢO VỆ THỰC VẬT & PHỐI TRỘN TANK-MIX (QUAN TRỌNG) */}
            <section className="space-y-4 print:break-inside-avoid">
              <div className="border-b-2 border-emerald-900 pb-2">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <h3 className="text-base font-black text-emerald-950 uppercase tracking-tight">
                    Mục IV: Sổ Nhật Ký Sử Dụng Thuốc BVTV &amp; Tank-Mix (Tuân Thủ TT 75/2025/TT-BNNMT)
                  </h3>
                  <span className="px-2 py-0.5 rounded text-[10.5px] font-black bg-emerald-100 text-emerald-900 border border-emerald-300">
                    100% Không Có Hoạt Chất Cấm
                  </span>
                </div>
                <p className="text-xs text-slate-500 mt-0.5">
                  Kiểm soát tuyệt đối thời gian cách ly PHI, số lô xuất xưởng và luân phiên nhóm hoạt chất IRAC/FRAC
                </p>
              </div>

              <div className="overflow-x-visible">
                <table className="w-full table-fixed text-left text-[10px] border border-slate-300 border-collapse">
                  <colgroup>
                    <col className="w-[3.5%]" />
                    <col className="w-[8.5%]" />
                    <col className="w-[12.5%]" />
                    <col className="w-[16%]" />
                    <col className="w-[12.5%]" />
                    <col className="w-[7%]" />
                    <col className="w-[11.5%]" />
                    <col className="w-[12%]" />
                    <col className="w-[9%]" />
                    <col className="w-[7.5%]" />
                  </colgroup>
                  <thead className="bg-slate-100 text-[9.5px] font-bold text-slate-700 uppercase border-b border-slate-300">
                    <tr>
                      <th className="p-1.5 border border-slate-300 text-center">STT</th>
                      <th className="p-1.5 border border-slate-300 text-center">Ngày phun</th>
                      <th className="p-1.5 border border-slate-300 text-center">Thửa</th>
                      <th className="p-1.5 border border-slate-300">Tên thuốc / Tank-Mix</th>
                      <th className="p-1.5 border border-slate-300">Hoạt chất &amp; IRAC</th>
                      <th className="p-1.5 border border-slate-300 text-center">Liều dùng</th>
                      <th className="p-1.5 border border-slate-300 text-center">Số lô</th>
                      <th className="p-1.5 border border-slate-300 text-center">Cách ly PHI &amp; Ngày an toàn</th>
                      <th className="p-1.5 border border-slate-300">Người phun</th>
                      <th className="p-1.5 border border-slate-300 text-center">ICS Duyệt</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200">
                    {pestLogs.length === 0 ? (
                      <tr>
                        <td colSpan={10} className="p-4 text-center text-slate-400 italic">
                          Chưa có ghi chép sử dụng thuốc BVTV hoặc biện pháp sinh học nào trong vụ này.
                        </td>
                      </tr>
                    ) : (
                      pestLogs.map((l, idx) => (
                        <tr key={l.id}>
                          <td className="p-1.5 border border-slate-300 text-center font-bold text-slate-400">{idx + 1}</td>
                          <td className="p-1.5 border border-slate-300 font-mono font-bold text-center whitespace-nowrap text-[9px]">
                            {formatDateDisplay(l.activity_date)}
                          </td>
                          <td className="p-1 border border-slate-300 font-mono font-semibold text-center whitespace-nowrap text-[8.5px] tracking-tight">
                            {l.plot_code}
                          </td>
                          <td className="p-1.5 border border-slate-300 break-words whitespace-normal font-bold text-slate-900 leading-tight">
                            {l.items && l.items.length > 0 ? (
                              <div className="space-y-1">
                                {l.items.length > 1 && (
                                  <span className="inline-block px-1 py-0.2 rounded text-[8.5px] font-black bg-purple-100 text-purple-800 border border-purple-200">
                                    Tank-Mix {l.items.length} món
                                  </span>
                                )}
                                {l.items.map((it, i) => (
                                  <div key={i}>• {it.item_name || it.material_name}</div>
                                ))}
                              </div>
                            ) : (
                              l.material_name || 'Chế phẩm sinh học'
                            )}
                          </td>
                          <td className="p-1.5 border border-slate-300 break-words whitespace-normal text-slate-700 leading-tight text-[9px]">
                            {l.items && l.items.length > 0 ? (
                              <div className="space-y-1">
                                {l.items.map((it, i) => (
                                  <div key={i}>
                                    {it.active_ingredient || 'Sinh học'}{' '}
                                    {it.resistance_group && <span className="font-mono text-purple-700 text-[8.5px]">[{it.resistance_group}]</span>}
                                  </div>
                                ))}
                              </div>
                            ) : (
                              l.active_ingredient || 'Sinh học'
                            )}
                          </td>
                          <td className="p-1.5 border border-slate-300 text-center break-words text-[9.5px]">
                            {l.items && l.items.length > 0 ? (
                              <div className="space-y-1">
                                {l.items.map((it, i) => (
                                  <div key={i}>{it.dosage_per_ha ? `${it.dosage_per_ha}/ha` : `${it.quantity_applied || ''} ${it.unit || ''}`}</div>
                                ))}
                              </div>
                            ) : (
                              l.quantity_applied ? `${l.quantity_applied} ${l.unit || 'L'}` : '-'
                            )}
                          </td>
                          <td className="p-1 border border-slate-300 font-mono text-[8px] text-center whitespace-nowrap tracking-tight">
                            {l.material_lot_number || l.material_batch_number || 'LOT-2026-X'}
                          </td>
                          <td className="p-1.5 border border-slate-300 text-center leading-tight">
                            <div className="font-black text-rose-800 text-[10px] whitespace-nowrap">
                              {l.phi_days ? `${l.phi_days} ngày` : '0 ngày'}
                            </div>
                            <div className="text-[9px] font-bold text-emerald-800 whitespace-nowrap mt-0.5">
                              An toàn: {formatDateDisplay(l.safe_harvest_date || l.activity_date)}
                            </div>
                          </td>
                          <td className="p-1 border border-slate-300 text-slate-800 text-[9px] leading-tight break-words">
                            {l.performer_name || 'Xã viên'}
                          </td>
                          <td className="p-1 border border-slate-300 text-center font-bold text-emerald-800 whitespace-nowrap text-[9px]">
                            {l.status === 'VERIFIED' ? '✓ Đã duyệt' : 'Chờ duyệt'}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </section>

            {/* Ngắt trang trước Mục V: Sổ Thu Hoạch & Đối Soát */}
            <div className="html2pdf__page-break" style={{ pageBreakBefore: 'always', breakBefore: 'page' }} />

            {/* MỤC V: SỔ THEO DÕI THU HOẠCH & TRUY XUẤT LÔ HÀNG */}
            <section className="space-y-4 print:break-inside-avoid">
              <div className="border-b-2 border-emerald-900 pb-2">
                <h3 className="text-base font-black text-emerald-950 uppercase tracking-tight">
                  Mục V: Sổ Theo Dõi Thu Hoạch &amp; Mã Lô Truy Xuất Nguồn Gốc (TCVN 12850:2019)
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Đối chiếu sản lượng thu hoạch thực tế không vượt trần sinh thái thửa đất
                </p>
              </div>

              <div className="overflow-x-visible">
                <table className="w-full table-fixed text-left text-xs border border-slate-300 border-collapse">
                  <colgroup>
                    <col className="w-[5%]" />
                    <col className="w-[12%]" />
                    <col className="w-[15%]" />
                    <col className="w-[12%]" />
                    <col className="w-[12%]" />
                    <col className="w-[18%]" />
                    <col className="w-[12%]" />
                    <col className="w-[14%]" />
                  </colgroup>
                  <thead className="bg-slate-100 text-[11px] font-bold text-slate-700 uppercase border-b border-slate-300">
                    <tr>
                      <th className="p-2 border border-slate-300 text-center">STT</th>
                      <th className="p-2 border border-slate-300 text-center">Ngày thu hoạch</th>
                      <th className="p-2 border border-slate-300 text-center">Mã Lô (Lot Code)</th>
                      <th className="p-2 border border-slate-300 text-center">Thửa đất</th>
                      <th className="p-2 border border-slate-300 text-right">Sản lượng (kg)</th>
                      <th className="p-2 border border-slate-300 text-center">Phân loại phẩm cấp</th>
                      <th className="p-2 border border-slate-300 text-center">Khóa an toàn PHI</th>
                      <th className="p-2 border border-slate-300">Cán bộ thu mua</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200">
                    {harvests.length === 0 ? (
                      <tr>
                        <td colSpan={8} className="p-4 text-center text-slate-400 italic">
                          Chưa có đợt thu hoạch nào được ghi nhận.
                        </td>
                      </tr>
                    ) : (
                      harvests.map((h, idx) => (
                        <tr key={h.id}>
                          <td className="p-2 border border-slate-300 text-center font-bold text-slate-400">{idx + 1}</td>
                          <td className="p-2 border border-slate-300 font-mono font-bold text-center whitespace-nowrap text-[10.5px]">
                            {formatDateDisplay(h.harvest_date)}
                          </td>
                          <td className="p-2 border border-slate-300 font-mono font-black text-emerald-800 text-center whitespace-nowrap text-[10.5px]">
                            {h.lot_code || `LOT-${h.id.substring(0, 8)}`}
                          </td>
                          <td className="p-2 border border-slate-300 font-mono font-semibold text-center whitespace-nowrap text-[9px] tracking-tight">
                            {h.plot_code || 'Thửa HTX'}
                          </td>
                          <td className="p-2 border border-slate-300 font-black text-slate-900 text-right whitespace-nowrap text-[10.5px]">
                            {Number(h.quantity_kg || 0).toLocaleString('vi-VN')} kg
                          </td>
                          <td className="p-2 border border-slate-300 text-center whitespace-nowrap text-[10px]">
                            {h.quality_grade === 'GRADE_A' ? 'Loại A (Xuất khẩu)' : 'Loại B (Nội địa)'}
                          </td>
                          <td className="p-1.5 border border-slate-300 text-center leading-tight">
                            <div className="font-bold text-emerald-800 text-[9.5px] whitespace-nowrap">
                              ✓ Đạt chuẩn PHI
                            </div>
                            <div className="text-[8px] text-emerald-700 whitespace-nowrap mt-0.5">
                              (0 rủi ro)
                            </div>
                          </td>
                          <td className="p-2 border border-slate-300 break-words text-[10px] leading-tight">{h.kcs_quick_lab?.tester_name || 'Cán bộ KCS'}</td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </section>

            {/* MỤC VI: ĐỐI SOÁT XUẤT KHO VẬT TƯ THEO TT 71/2024/TT-BTC */}
            <section className="space-y-4 print:break-inside-avoid">
              <div className="border-b-2 border-emerald-900 pb-2">
                <h3 className="text-base font-black text-emerald-950 uppercase tracking-tight">
                  Mục VI: Biên Bản Đối Soát Cân Bằng Vật Tư Mùa Vụ (Mẫu 02-VT theo TT 71/2024/TT-BTC)
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Kiểm toán tính trung thực giữa Xuất kho kế toán vs Thực bón ngoài đồng vs Hoàn kho vụ mùa
                </p>
              </div>

              <div className="overflow-x-visible">
                <table className="w-full table-fixed text-left text-xs border border-slate-300 border-collapse">
                  <colgroup>
                    <col className="w-[5%]" />
                    <col className="w-[12%]" />
                    <col className="w-[28%]" />
                    <col className="w-[7%]" />
                    <col className="w-[12%]" />
                    <col className="w-[12%]" />
                    <col className="w-[11%]" />
                    <col className="w-[13%]" />
                  </colgroup>
                  <thead className="bg-slate-100 text-[11px] font-bold text-slate-700 uppercase border-b border-slate-300">
                    <tr>
                      <th className="p-2 border border-slate-300 text-center">STT</th>
                      <th className="p-2 border border-slate-300 text-center">Mã SKU</th>
                      <th className="p-2 border border-slate-300">Tên vật tư nông nghiệp</th>
                      <th className="p-2 border border-slate-300 text-center">Đơn vị</th>
                      <th className="p-2 border border-slate-300 text-right">Tổng xuất kho</th>
                      <th className="p-2 border border-slate-300 text-right">Thực bón ruộng</th>
                      <th className="p-2 border border-slate-300 text-right">Chênh lệch</th>
                      <th className="p-2 border border-slate-300 text-center">Đánh giá kế toán</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200">
                    {reconciliations.length === 0 ? (
                      <tr>
                        <td colSpan={8} className="p-4 text-center text-slate-400 italic">
                          Chưa có số liệu đối soát vật tư cuối vụ.
                        </td>
                      </tr>
                    ) : (
                      reconciliations.map((r, idx) => {
                        const variance = r.variance ?? ((r.received_from_coop || 0) - (r.used_in_logbook || 0));
                        const isBalanced = Math.abs(variance) < 0.001;

                        return (
                          <tr key={idx}>
                            <td className="p-2 border border-slate-300 text-center font-bold text-slate-400">{idx + 1}</td>
                            <td className="p-2 border border-slate-300 font-mono text-[10.5px] text-center whitespace-nowrap">{r.material_id?.substring(0, 8) || '-'}</td>
                            <td className="p-2 border border-slate-300 font-bold text-slate-900 break-words whitespace-normal leading-relaxed text-[11px]">
                              {r.material_name}
                            </td>
                            <td className="p-2 border border-slate-300 text-center whitespace-nowrap text-[10.5px]">{r.unit}</td>
                            <td className="p-2 border border-slate-300 text-right font-mono font-bold whitespace-nowrap text-[10.5px]">
                              {Number(r.received_from_coop || 0).toLocaleString('vi-VN')}
                            </td>
                            <td className="p-2 border border-slate-300 text-right font-mono font-bold text-emerald-800 whitespace-nowrap text-[10.5px]">
                              {Number(r.used_in_logbook || 0).toLocaleString('vi-VN')}
                            </td>
                            <td className="p-2 border border-slate-300 text-right font-mono font-bold whitespace-nowrap text-[10.5px]">
                              {variance.toLocaleString('vi-VN')}
                            </td>
                            <td className="p-2 border border-slate-300 text-center whitespace-nowrap text-[10.5px]">
                              {isBalanced ? (
                                <span className="font-bold text-emerald-800">✓ Cân bằng kho</span>
                              ) : (
                                <span className="font-bold text-amber-800">Đang đối soát</span>
                              )}
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>
            </section>

            {/* PHẦN KÝ TÊN VÀ XÁC NHẬN PHÁP LÝ 3 BÊN */}
            <div className="pt-8 border-t-2 border-slate-800 print:break-inside-avoid space-y-8">
              <div className="flex justify-end text-xs italic text-slate-600">
                Lâm Đồng, ngày {new Date().getDate()} tháng {new Date().getMonth() + 1} năm {new Date().getFullYear()}
              </div>

              <div className="grid grid-cols-3 gap-6 text-center text-xs">
                {/* 1. Xã viên */}
                <div className="space-y-16">
                  <div>
                    <h5 className="font-black uppercase text-slate-900">NGƯỜI GHI SỔ / XÃ VIÊN</h5>
                    <p className="text-[11px] text-slate-400 italic">(Ký và ghi rõ họ tên)</p>
                  </div>
                  <div className="space-y-0.5">
                    <p className="font-bold text-slate-900">Mai Văn Tân</p>
                    <p className="text-[10px] text-slate-500">Xã viên phụ trách nhà kính</p>
                  </div>
                </div>

                {/* 2. Tổ trưởng ICS */}
                <div className="space-y-16">
                  <div>
                    <h5 className="font-black uppercase text-slate-900">TỔ TRƯỞNG KỸ THUẬT ICS</h5>
                    <p className="text-[11px] text-slate-400 italic">(Ký, thẩm định và ghi rõ họ tên)</p>
                  </div>
                  <div className="space-y-0.5">
                    <p className="font-bold text-slate-900">Nguyễn Văn Kỹ Thuật</p>
                    <p className="text-[10px] text-slate-500">Kiểm soát nội bộ VietGAP</p>
                  </div>
                </div>

                {/* 3. Đại diện pháp luật HTX */}
                <div className="space-y-16">
                  <div>
                    <h5 className="font-black uppercase text-slate-900">GIÁM ĐỐC HỢP TÁC XÃ</h5>
                    <p className="text-[11px] text-slate-400 italic">(Ký tên, đóng dấu pháp nhân)</p>
                  </div>
                  <div className="space-y-0.5">
                    <p className="font-black text-slate-950 uppercase">{activeCooperative?.representative_name || 'ĐẠI DIỆN PHÁP LUẬT HTX'}</p>
                    <p className="text-[10px] text-slate-500">{htxName}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
