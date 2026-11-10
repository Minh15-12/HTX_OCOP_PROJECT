import React, { useRef, useState, useEffect } from 'react';
import { Printer, Download, FileSpreadsheet, X, Building2, CheckCircle2 } from 'lucide-react';
import { SurplusDistributionItem, SurplusDistributionPlan } from '@/types/memberTypes';
import { useTenantContextStore } from '@/stores/tenantContextStore';
import { exportPdfFromElement } from '@/utils/pdfExportUtils';
import * as XLSX from 'xlsx';

interface SurplusVoucherPrintModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedSurplusItem: SurplusDistributionItem | null;
  surplusPlan: SurplusDistributionPlan;
}

export const SurplusVoucherPrintModal: React.FC<SurplusVoucherPrintModalProps> = ({
  isOpen,
  onClose,
  selectedSurplusItem,
  surplusPlan,
}) => {
  const { activeCooperative } = useTenantContextStore();
  const printContainerRef = useRef<HTMLDivElement>(null);
  const [isExportingPdf, setIsExportingPdf] = useState(false);
  const [isExportingExcel, setIsExportingExcel] = useState(false);

  // Close on Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen || !selectedSurplusItem) return null;

  const coopName = activeCooperative?.legal_name || 'HỢP TÁC XÃ NÔNG NGHIỆP TÂN TIẾN';
  const coopAddress = activeCooperative?.address || 'Ấp Tân Hưng, Xã Tân Hòa, Huyện Lai Vung, Đồng Tháp';
  const coopTax = activeCooperative?.tax_code || '1402158899';

  // Dynamic calculations based on legal plan parameters (Điều 85 Luật HTX 2023)
  const servicePct = surplusPlan.patronage_rebate_rate || 70;
  const capitalPct = 100 - servicePct;

  const totalAmount = Number(selectedSurplusItem.total_payout_amount || 0);
  const serviceAmount = selectedSurplusItem.service_share_amount != null
    ? Number(selectedSurplusItem.service_share_amount)
    : Math.round(totalAmount * (servicePct / 100));
  const capitalAmount = selectedSurplusItem.capital_share_amount != null
    ? Number(selectedSurplusItem.capital_share_amount)
    : Math.max(0, totalAmount - serviceAmount);
  const debtDeduction = Number(selectedSurplusItem.debt_deduction || 0);
  const netPayout = selectedSurplusItem.net_payout_amount != null
    ? Number(selectedSurplusItem.net_payout_amount)
    : Math.max(0, totalAmount - debtDeduction);

  const voucherCode = `BLTD-${selectedSurplusItem.member_code}-${surplusPlan.fiscal_year}`;

  // PDF Export using client-side rendering
  const handleExportPdf = async () => {
    if (!printContainerRef.current) return;
    try {
      setIsExportingPdf(true);
      await exportPdfFromElement(
        printContainerRef.current,
        `bien_lai_thang_du_${selectedSurplusItem.member_code}_${surplusPlan.fiscal_year}.pdf`,
        { margin: [8, 10, 8, 10] }
      );
    } catch (err) {
      console.error('PDF export error:', err);
    } finally {
      setIsExportingPdf(false);
    }
  };

  // Excel Export
  const handleExportExcel = () => {
    try {
      setIsExportingExcel(true);
      const data = [
        ['HỢP TÁC XÃ', coopName],
        ['MÃ SỐ THUẾ', coopTax],
        ['ĐỊA CHỈ', coopAddress],
        ['CĂN CỨ PHÁP LÝ', 'Điều 83, 84, 85 Luật Hợp tác xã số 17/2023/QH15 & Nghị định 113/2024/NĐ-CP'],
        [],
        ['BIÊN LAI CHI TRẢ THẶNG DƯ NIÊN ĐỘ', surplusPlan.fiscal_year],
        ['SỐ HIỆU CHỨNG TỪ', voucherCode],
        ['NGÀY LẬP CHỨNG TỪ', new Date().toLocaleDateString('vi-VN')],
        [],
        ['THÔNG TIN XÃ VIÊN THỤ HƯỞNG'],
        ['Họ và tên xã viên', selectedSurplusItem.member_name],
        ['Mã số xã viên', selectedSurplusItem.member_code],
        ['Loại thành viên', selectedSurplusItem.member_type === 'LIEN_KET' ? 'Thành viên liên kết' : 'Thành viên chính thức'],
        ['Số cổ phần nắm giữ', selectedSurplusItem.shares_held || 0],
        ['Tổng vốn đã góp (VNĐ)', selectedSurplusItem.capital_contributed || 0],
        [],
        ['CHI TIẾT PHÂN BỔ THẶNG DƯ', 'TỶ LỆ (%)', 'SỐ TIỀN (VNĐ)'],
        [`Thưởng theo Mức độ Sử dụng Dịch vụ (Min 51% theo Luật HTX 2023)`, `${servicePct}%`, serviceAmount],
        [`Chia thặng dư theo Tỷ lệ Vốn góp`, `${capitalPct}%`, capitalAmount],
        ['Tổng thặng dư được phân phối', '100%', totalAmount],
        ['Cấn trừ công nợ vật tư đầu vụ', '', -debtDeduction],
        ['SỐ TIỀN THỰC LĨNH', '', netPayout],
        [],
        ['Phương thức chi trả', 'Chuyển khoản / Tiền mặt'],
        ['Ghi chú', `Quyết toán thặng dư năm tài chính ${surplusPlan.fiscal_year}`],
      ];

      const ws = XLSX.utils.aoa_to_sheet(data);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, 'BienLaiThangDu');
      XLSX.writeFile(wb, `bien_lai_thang_du_${selectedSurplusItem.member_code}_${surplusPlan.fiscal_year}.xlsx`);
    } catch (err) {
      console.error('Excel export error:', err);
    } finally {
      setIsExportingExcel(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 p-4 backdrop-blur-xs overflow-y-auto"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-2xl overflow-hidden rounded-3xl border border-white/40 bg-white shadow-2xl animate-fade-in p-6 space-y-4 my-8"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header with Title and Close Button */}
        <div className="flex justify-between items-center border-b border-slate-100 pb-3">
          <div>
            <h3 className="font-extrabold text-slate-900 text-base flex items-center gap-2">
              <Building2 className="w-5 h-5 text-emerald-600" />
              Biên Lai Chi Trả Thặng Dư &amp; Lợi Nhuận
            </h3>
            <p className="text-[11px] text-slate-500 mt-0.5">
              Căn cứ Điều 83, 84, 85 Luật Hợp tác xã số 17/2023/QH15 &amp; Nghị định 113/2024/NĐ-CP
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 p-1.5 rounded-xl hover:bg-slate-100 transition-colors cursor-pointer"
            title="Đóng (Escape)"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Action Toolbar - Trio Buttons */}
        <div className="flex flex-wrap items-center justify-between gap-2 p-3 bg-slate-50 rounded-2xl border border-slate-200/80">
          <span className="text-xs font-bold text-slate-600">Đa phương thức In &amp; Tải chứng từ:</span>
          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => window.print()}
              className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-xs inline-flex items-center gap-1.5 transition-all cursor-pointer"
            >
              <Printer className="w-3.5 h-3.5" /> In Trực Tiếp
            </button>
            <button
              onClick={handleExportPdf}
              disabled={isExportingPdf}
              className="px-3.5 py-1.5 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-bold text-xs rounded-xl shadow-xs inline-flex items-center gap-1.5 transition-all cursor-pointer"
            >
              <Download className="w-3.5 h-3.5" />
              {isExportingPdf ? 'Đang tạo PDF...' : 'Tải File PDF (.pdf)'}
            </button>
            <button
              onClick={handleExportExcel}
              disabled={isExportingExcel}
              className="px-3.5 py-1.5 bg-emerald-700 hover:bg-emerald-800 disabled:opacity-50 text-white font-bold text-xs rounded-xl shadow-xs inline-flex items-center gap-1.5 transition-all cursor-pointer"
            >
              <FileSpreadsheet className="w-3.5 h-3.5" />
              {isExportingExcel ? 'Đang xuất Excel...' : 'Tải File Excel (.xlsx)'}
            </button>
          </div>
        </div>

        {/* Printable Voucher Content - A4 Document */}
        <div
          ref={printContainerRef}
          data-pdf-container="true"
          className="p-6 border border-slate-200 rounded-2xl bg-white space-y-4 text-xs font-sans text-slate-800 break-words"
          style={{ minHeight: '380px' }}
        >
          {/* Header Section */}
          <div className="border-b-2 border-emerald-800 pb-3 text-center space-y-1">
            <h4 className="font-black text-sm uppercase text-slate-900 tracking-wide">{coopName}</h4>
            <p className="text-[11px] text-slate-600 whitespace-normal">Địa chỉ: {coopAddress} • MST: {coopTax}</p>
            <div className="pt-2">
              <h5 className="font-black text-base uppercase text-emerald-800 tracking-tight">
                BIÊN LAI CHI TRẢ THẶNG DƯ NIÊN ĐỘ {surplusPlan.fiscal_year}
              </h5>
              <p className="text-[11px] text-slate-500 font-mono mt-0.5">Số hiệu: {voucherCode}</p>
              <p className="text-[10px] text-slate-400 italic">
                (Phân bổ theo mức độ sử dụng dịch vụ {servicePct}% và tỷ lệ vốn góp {capitalPct}% theo Luật HTX 2023)
              </p>
            </div>
          </div>

          {/* Member Info */}
          <div className="grid grid-cols-2 gap-3 py-2 border-b border-dashed border-slate-200 text-xs">
            <div>
              <span className="text-slate-500">Xã viên thụ hưởng:</span>{' '}
              <strong className="text-slate-900 font-bold">{selectedSurplusItem.member_name}</strong>
            </div>
            <div>
              <span className="text-slate-500">Mã số xã viên:</span>{' '}
              <strong className="font-mono text-emerald-800">{selectedSurplusItem.member_code}</strong>
            </div>
            <div>
              <span className="text-slate-500">Loại thành viên:</span>{' '}
              <span className="font-medium text-slate-800">
                {selectedSurplusItem.member_type === 'LIEN_KET' ? 'Thành viên liên kết' : 'Thành viên chính thức'}
              </span>
            </div>
            <div>
              <span className="text-slate-500">Vốn góp thực tế:</span>{' '}
              <span className="font-mono font-bold text-slate-800">
                {(selectedSurplusItem.capital_contributed || 0).toLocaleString('vi-VN')} ₫
              </span>
            </div>
          </div>

          {/* Breakdown Table */}
          <table className="w-full text-left text-xs border border-slate-200 rounded-lg overflow-hidden">
            <thead className="bg-slate-50 border-b border-slate-200 font-bold text-slate-700 text-[11px]">
              <tr>
                <th className="py-2 px-3">Khoản mục phân bổ</th>
                <th className="py-2 px-3 text-center">Tỷ lệ quy định</th>
                <th className="py-2 px-3 text-right">Số tiền (VNĐ)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium">
              <tr>
                <td className="py-2 px-3">
                  <div className="font-semibold text-slate-800">1. Thưởng theo Mức độ Sử dụng Dịch vụ</div>
                  <div className="text-[10px] text-slate-500">
                    Sản lượng nông sản cung ứng: {(selectedSurplusItem.service_usage_output_kg || 0).toLocaleString('vi-VN')} kg
                  </div>
                </td>
                <td className="py-2 px-3 text-center font-mono font-bold text-emerald-700">{servicePct}%</td>
                <td className="py-2 px-3 text-right font-mono font-bold text-emerald-800">
                  +{serviceAmount.toLocaleString('vi-VN')} ₫
                </td>
              </tr>
              <tr>
                <td className="py-2 px-3">
                  <div className="font-semibold text-slate-800">2. Chia thặng dư theo Tỷ lệ Vốn góp</div>
                  <div className="text-[10px] text-slate-500">Số cổ phần tương ứng: {selectedSurplusItem.shares_held || 0} CP</div>
                </td>
                <td className="py-2 px-3 text-center font-mono font-bold text-blue-700">{capitalPct}%</td>
                <td className="py-2 px-3 text-right font-mono font-bold text-blue-800">
                  +{capitalAmount.toLocaleString('vi-VN')} ₫
                </td>
              </tr>
              <tr className="bg-slate-50/60 font-bold text-slate-900">
                <td className="py-2 px-3">Tổng thặng dư được phân phối:</td>
                <td className="py-2 px-3 text-center font-mono">100%</td>
                <td className="py-2 px-3 text-right font-mono text-emerald-900">
                  {totalAmount.toLocaleString('vi-VN')} ₫
                </td>
              </tr>
              {debtDeduction > 0 && (
                <tr className="text-amber-800 bg-amber-50/40">
                  <td className="py-2 px-3" colSpan={2}>
                    <div className="font-bold">3. Khấu trừ công nợ vật tư trả chậm đầu vụ:</div>
                    <div className="text-[10px] text-amber-700">Theo Quy chế quyết toán hợp đồng bao tiêu HTX</div>
                  </td>
                  <td className="py-2 px-3 text-right font-mono font-bold text-rose-700">
                    -{debtDeduction.toLocaleString('vi-VN')} ₫
                  </td>
                </tr>
              )}
              <tr className="bg-emerald-50/80 font-black text-sm text-emerald-950 border-t-2 border-emerald-600">
                <td className="py-2.5 px-3" colSpan={2}>
                  TỔNG SỐ TIỀN THỰC LĨNH:
                </td>
                <td className="py-2.5 px-3 text-right font-mono text-base text-emerald-900">
                  {netPayout.toLocaleString('vi-VN')} ₫
                </td>
              </tr>
            </tbody>
          </table>

          {/* Signatures */}
          <div className="grid grid-cols-3 text-center pt-6 text-[11px] text-slate-700 break-inside-avoid">
            <div>
              <p className="font-bold text-slate-800">Người lập biểu</p>
              <p className="text-[10px] text-slate-400 italic">(Ký, ghi rõ họ tên)</p>
              <div className="h-14"></div>
              <p className="font-semibold text-slate-600">Kế toán HTX</p>
            </div>
            <div>
              <p className="font-bold text-slate-800">Xã viên xác nhận</p>
              <p className="text-[10px] text-slate-400 italic">(Ký, ghi rõ họ tên)</p>
              <div className="h-14"></div>
              <p className="font-semibold text-slate-900">{selectedSurplusItem.member_name}</p>
            </div>
            <div>
              <p className="font-bold text-slate-800">Giám đốc HTX</p>
              <p className="text-[10px] text-slate-400 italic">(Ký tên, đóng dấu)</p>
              <div className="h-14"></div>
              <p className="font-semibold text-emerald-900">Ban Giám Đốc</p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex justify-end pt-2">
          <button
            onClick={onClose}
            className="px-5 py-2.5 border border-slate-200 rounded-xl text-xs font-bold text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
          >
            Đóng cửa sổ
          </button>
        </div>
      </div>
    </div>
  );
};

export default SurplusVoucherPrintModal;
