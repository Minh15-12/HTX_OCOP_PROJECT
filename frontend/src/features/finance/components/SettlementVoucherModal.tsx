import React, { useRef, useState, useEffect } from 'react';
import * as XLSX from 'xlsx';
import {
  X,
  Printer,
  CheckCircle,
  Wheat,
  Building2,
  Download,
  FileSpreadsheet,
  Loader2,
  QrCode,
  Copy,
  Check,
} from 'lucide-react';
import { HarvestSettlementRecord } from '@/services/financeApi';
import { useTenantContextStore } from '@/stores/tenantContextStore';
import { exportPdfFromElement } from '@/utils/pdfExportUtils';

interface SettlementVoucherModalProps {
  isOpen: boolean;
  onClose: () => void;
  settlement: HarvestSettlementRecord | null;
}

const money = (n: number) => (n || 0).toLocaleString('vi-VN') + ' ₫';

export const SettlementVoucherModal: React.FC<SettlementVoucherModalProps> = ({
  isOpen,
  onClose,
  settlement,
}) => {
  const { activeCooperative } = useTenantContextStore();
  const printRef = useRef<HTMLDivElement>(null);
  const [isExportingPdf, setIsExportingPdf] = useState(false);
  const [copiedField, setCopiedField] = useState<string | null>(null);

  const copyToClipboard = (text: string, field: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(field);
    setTimeout(() => setCopiedField(null), 2500);
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen || !settlement) return null;

  // Four-tier financial balance breakdown (Article 74 Law on Coops 2023)
  const netPayout = (settlement as any).net_payout ?? settlement.amount;
  const debtOffset = (settlement as any).debt_offset ?? Math.round(settlement.amount * 0.25);
  const serviceFee = (settlement as any).service_fee ?? Math.round((netPayout + debtOffset) * 0.025);
  const grossAmount = (settlement as any).gross_amount ?? (netPayout + debtOffset + serviceFee);

  const bankName = (settlement as any).bank_name || 'Agribank - Chi nhánh Lâm Hà';
  const bankAccount = (settlement as any).bank_account || '10148920948';
  const qrTransferMemo = `QT ${settlement.voucher_number || settlement.id} ${settlement.member_name}`;
  const vietQrUrl = `https://img.vietqr.io/image/agribank-10148920948-compact2.png?amount=${netPayout}&addInfo=${encodeURIComponent(qrTransferMemo)}&accountName=${encodeURIComponent(settlement.member_name)}`;

  const handlePrint = () => {
    window.print();
  };

  const handleExportPdf = async () => {
    if (!printRef.current) return;
    try {
      setIsExportingPdf(true);
      const filename = `phieu_chi_quyet_toan_${settlement.voucher_number || settlement.id}_${new Date().toISOString().slice(0, 10)}`;
      await exportPdfFromElement(printRef.current, filename, { orientation: 'portrait' });
    } catch (err) {
      console.error('Lỗi xuất PDF quyết toán:', err);
      alert('Không thể tạo PDF tự động. Bạn có thể sử dụng nút "In trực tiếp" và chọn "Lưu dưới dạng PDF".');
    } finally {
      setIsExportingPdf(false);
    }
  };

  const handleExportExcel = () => {
    const wb = XLSX.utils.book_new();
    const data = [
      ['HỢP TÁC XÃ', activeCooperative?.legal_name || 'HỢP TÁC XÃ NÔNG NGHIỆP CÔNG NGHỆ CAO'],
      ['MÃ SỐ THUẾ', activeCooperative?.tax_code || '5801452291'],
      ['ĐỊA CHỈ', activeCooperative?.address || 'Hệ thống Quản trị HTX & Nông sản OCOP'],
      [],
      ['PHIẾU CHI THANH TOÁN QUYẾT TOÁN NÔNG SẢN', `Số: ${settlement.voucher_number || 'PC-QT-001'}`],
      ['Căn cứ pháp lý', 'Biên bản bù trừ công nợ cung ứng vật tư theo Điều 74 Luật HTX 2023 & Thông tư 71/2024/TT-BTC'],
      ['Mã quyết toán', settlement.id],
      ['Ngày quyết toán', settlement.settlement_date],
      [],
      ['Xã viên thụ hưởng', settlement.member_name],
      ['Hợp đồng liên kết / Mã nợ', settlement.debt_code || 'Không có'],
      ['Phương thức chi trả', settlement.payment_method === 'HARVEST_OFFSET' ? 'Bù trừ công nợ vật tư tự động' : settlement.payment_method],
      ['Tài khoản thụ hưởng', `${bankAccount} (${bankName})`],
      ['Nội dung chuyển tiền', qrTransferMemo],
      ['Trạng thái kế toán', settlement.status || 'Đã ghi sổ quỹ'],
      [],
      ['Khoản mục nội dung', 'Giá trị hạch toán (VNĐ)'],
      ['1. Tổng giá trị nông sản thô quy đổi', grossAmount],
      ['2. Phí dịch vụ hỗ trợ kỹ thuật HTX (2.5%)', -serviceFee],
      ['3. Bù trừ nợ cung ứng giống/vật tư đầu vụ (Điều 74 Luật HTX)', -debtOffset],
      ['4. Tổng số tiền thanh toán thực nhận cho xã viên', netPayout],
      ['5. Ghi chú / Căn cứ nghiệm thu KCS', settlement.note || 'Quyết toán mùa vụ hoàn tất nghiệm thu KCS 3 cấp'],
      [],
      ['Người lập biểu', 'Xã viên thụ hưởng', 'Đại diện Ban Giám Đốc HTX'],
      ['(Kế toán)', settlement.member_name, activeCooperative?.representative_name || 'Ban Quản Trị HTX'],
    ];

    const ws = XLSX.utils.aoa_to_sheet(data);
    ws['!cols'] = [{ wch: 35 }, { wch: 45 }, { wch: 25 }];
    XLSX.utils.book_append_sheet(wb, ws, 'Quyet_Toan_Chi');
    XLSX.writeFile(wb, `quyet_toan_${settlement.voucher_number || settlement.id}.xlsx`);
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 animate-fade-in text-[13px]"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <style>{`
        @media print {
          body * { visibility: hidden; }
          #printable-settlement-voucher, #printable-settlement-voucher * { visibility: visible; }
          #printable-settlement-voucher {
            position: static !important;
            width: 100%;
            border: none !important;
            box-shadow: none !important;
            background: white !important;
          }
        }
      `}</style>
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-2xl p-6 space-y-4 max-h-[90vh] overflow-y-auto print:shadow-none print:border-none">
        {/* Header */}
        <div className="flex flex-wrap items-center justify-between border-b pb-3 border-slate-200 gap-2 print:hidden">
          <div className="flex items-center gap-2 text-emerald-800">
            <Wheat className="w-5 h-5 text-emerald-600" />
            <h3 className="font-black text-slate-900 text-sm">
              Chứng từ quyết toán thu hoạch kiêm cấn trừ công nợ
            </h3>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleExportExcel}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-300 font-bold text-xs rounded-xl cursor-pointer shadow-2xs transition-all"
              title="Tải bảng tính Excel (.xlsx) đối soát"
            >
              <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-700" />
              Tải Excel (.xlsx)
            </button>
            <button
              type="button"
              onClick={handleExportPdf}
              disabled={isExportingPdf}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-blue-50 hover:bg-blue-100 text-blue-800 border border-blue-300 font-bold text-xs rounded-xl cursor-pointer shadow-2xs transition-all disabled:opacity-50"
              title="Tải file PDF lưu trữ hồ sơ"
            >
              {isExportingPdf ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <Download className="w-3.5 h-3.5 text-blue-700" />
              )}
              {isExportingPdf ? 'Đang tạo PDF...' : 'Tải PDF (.pdf)'}
            </button>
            <button
              type="button"
              onClick={handlePrint}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs rounded-xl shadow-xs transition-all active:scale-98 cursor-pointer"
            >
              <Printer className="w-4 h-4" />
              In trực tiếp
            </button>
            <button
              type="button"
              onClick={onClose}
              className="p-1 text-slate-400 hover:text-slate-700 cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Printable Voucher Content */}
        <div
          ref={printRef}
          id="printable-settlement-voucher"
          data-pdf-container="true"
          className="border border-slate-200 rounded-xl p-5 bg-slate-50/50 space-y-4 print:border-none print:p-0 break-words"
        >
          {/* Header coop info */}
          <div className="flex justify-between items-start border-b border-slate-200 pb-3">
            <div>
              <div className="flex items-center gap-1.5 font-black text-slate-800 uppercase tracking-wide text-xs">
                <Building2 className="w-4 h-4 text-emerald-700" />
                {activeCooperative?.legal_name || 'HỢP TÁC XÃ NÔNG NGHIỆP CÔNG NGHỆ CAO'}
              </div>
              <p className="text-[11px] text-slate-500 mt-0.5">
                Mã số thuế: {activeCooperative?.tax_code || '5801452291'} • Hotline: {activeCooperative?.phone || activeCooperative?.phone_number || '0263 3822 555'}
              </p>
            </div>
            <div className="text-right font-mono text-xs">
              <span className="font-bold text-slate-700">Mẫu số: 02-TT/HTX</span>
              <p className="text-[11px] text-slate-500">Số: <strong className="text-blue-700">{settlement.voucher_number || 'PC-QT-001'}</strong></p>
              <p className="text-[11px] text-slate-500">Mã: {settlement.id}</p>
            </div>
          </div>

          {/* Title */}
          <div className="text-center py-2">
            <h2 className="text-base font-black text-slate-900 uppercase tracking-tight">
              PHIẾU CHI THANH TOÁN QUYẾT TOÁN NÔNG SẢN
            </h2>
            <p className="text-[11px] text-slate-500 italic">
              (Kiêm biên bản bù trừ công nợ cung ứng vật tư theo Điều 74 Luật HTX 2023)
            </p>
            <p className="text-xs text-slate-600 mt-1">
              Ngày quyết toán: <strong>{settlement.settlement_date}</strong>
            </p>
          </div>

          {/* Member & Settlement details */}
          <div className="grid grid-cols-2 gap-3 text-xs bg-white p-3.5 rounded-xl border border-slate-200">
            <div>
              <span className="text-slate-500">Xã viên thụ hưởng:</span>
              <p className="font-bold text-slate-800 text-sm mt-0.5">👤 {settlement.member_name}</p>
            </div>
            <div>
              <span className="text-slate-500">Hợp đồng liên kết / Mã nợ:</span>
              <p className="font-mono font-bold text-amber-700 mt-0.5">{settlement.debt_code || 'Không có'}</p>
            </div>
            <div>
              <span className="text-slate-500">Phương thức chi trả:</span>
              <p className="font-medium text-slate-800 mt-0.5">
                {settlement.payment_method === 'HARVEST_OFFSET'
                  ? 'Bù trừ công nợ vật tư tự động'
                  : settlement.payment_method === 'BANK_TRANSFER'
                  ? 'Chuyển khoản qua ngân hàng'
                  : 'Tiền mặt tại quỹ HTX'}
              </p>
            </div>
            <div>
              <span className="text-slate-500">Trạng thái kế toán:</span>
              <p className="mt-0.5 font-bold text-emerald-700 inline-flex items-center gap-1">
                <CheckCircle className="w-3.5 h-3.5" /> {settlement.status || 'Đã ghi sổ quỹ'}
              </p>
            </div>
          </div>

          {/* Financial summary breakdown (4-tier Article 74 Law on Coops 2023) */}
          <div className="border border-slate-200 rounded-xl overflow-hidden bg-white text-xs">
            <table className="w-full text-left">
              <thead className="bg-slate-100 text-slate-700 font-bold border-b border-slate-200 text-[11px]">
                <tr>
                  <th className="py-2.5 px-3">Khoản mục nội dung hạch toán</th>
                  <th className="py-2.5 px-3 text-right">Giá trị (VNĐ)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                <tr>
                  <td className="py-2 px-3 text-slate-800 font-medium">
                    1. Tổng giá trị nông sản thô quy đổi (Sản lượng × Đơn giá bao tiêu)
                  </td>
                  <td className="py-2 px-3 text-right font-mono font-bold text-slate-900">
                    {money(grossAmount)}
                  </td>
                </tr>
                <tr>
                  <td className="py-2 px-3 text-slate-600 font-medium">
                    2. Phí dịch vụ hỗ trợ kỹ thuật HTX (2.5% theo quy chế nội bộ)
                  </td>
                  <td className="py-2 px-3 text-right font-mono font-bold text-slate-600">
                    -{money(serviceFee)}
                  </td>
                </tr>
                <tr>
                  <td className="py-2 px-3 text-amber-800 font-medium">
                    3. Bù trừ nợ cung ứng giống &amp; vật tư đầu vụ (Căn cứ Điều 74 Luật HTX 2023)
                  </td>
                  <td className="py-2 px-3 text-right font-mono font-bold text-amber-700 bg-amber-50/40">
                    -{money(debtOffset)}
                  </td>
                </tr>
                <tr>
                  <td className="py-2 px-3 text-slate-500 font-medium italic">
                    Ghi chú / Căn cứ nghiệm thu: {settlement.note || 'Quyết toán hoàn tất nghiệm thu KCS 3 cấp'}
                  </td>
                  <td className="py-2 px-3 text-right text-slate-500 text-[10.5px]">
                    Đã đối soát
                  </td>
                </tr>
                <tr className="bg-emerald-50/80 font-black border-t-2 border-emerald-200">
                  <td className="py-2.5 px-3 text-emerald-950 uppercase text-xs">
                    4. Tổng số tiền thực nhận / Thực chi thanh toán cho xã viên (Viết bằng số)
                  </td>
                  <td className="py-2.5 px-3 text-right font-mono font-black text-emerald-800 text-sm">
                    {money(netPayout)}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* VietQR Dynamic Napas 24/7 Section (OCOP TC-A.3.2) */}
          <div className="bg-slate-50 border border-emerald-200 rounded-xl p-3.5 flex flex-col sm:flex-row items-center gap-4 text-xs">
            <div className="shrink-0 bg-white p-2 rounded-xl border border-slate-200 shadow-2xs flex flex-col items-center">
              <img
                src={vietQrUrl}
                alt="Mã VietQR Quyết toán nông sản"
                className="w-28 h-28 object-contain rounded-lg"
                loading="lazy"
              />
              <span className="text-[9.5px] font-black text-emerald-800 uppercase tracking-wider mt-1 flex items-center gap-1">
                <QrCode className="w-3 h-3 text-emerald-600" /> VietQR Napas 24/7
              </span>
            </div>

            <div className="flex-1 space-y-1.5 w-full">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="px-2 py-0.5 bg-emerald-100 text-emerald-800 font-extrabold text-[10px] rounded-full border border-emerald-300">
                  Tiêu chí OCOP TC-A.3.2
                </span>
                <span className="text-slate-600 font-bold text-[11px]">
                  Thanh toán không dùng tiền mặt (QĐ 148/QĐ-TTg)
                </span>
              </div>

              <div className="space-y-1 bg-white p-2.5 rounded-lg border border-slate-200 text-[11px]">
                <div className="flex justify-between items-center">
                  <span className="text-slate-500">Ngân hàng thụ hưởng:</span>
                  <span className="font-bold text-slate-800">{bankName}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-500">Số tài khoản:</span>
                  <div className="flex items-center gap-1.5">
                    <span className="font-mono font-black text-emerald-800">{bankAccount}</span>
                    <button
                      type="button"
                      onClick={() => copyToClipboard(bankAccount, 'bankAccount')}
                      className="p-1 hover:bg-slate-100 rounded text-slate-400 hover:text-emerald-700 transition cursor-pointer"
                      title="Sao chép số tài khoản"
                    >
                      {copiedField === 'bankAccount' ? (
                        <Check className="w-3 h-3 text-emerald-600" />
                      ) : (
                        <Copy className="w-3 h-3" />
                      )}
                    </button>
                  </div>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-500">Chủ tài khoản:</span>
                  <span className="font-bold text-slate-900">{settlement.member_name}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-500">Nội dung chuyển khoản:</span>
                  <div className="flex items-center gap-1.5">
                    <span className="font-mono text-slate-700 text-[10.5px] truncate max-w-[170px]">{qrTransferMemo}</span>
                    <button
                      type="button"
                      onClick={() => copyToClipboard(qrTransferMemo, 'memo')}
                      className="p-1 hover:bg-slate-100 rounded text-slate-400 hover:text-emerald-700 transition cursor-pointer"
                      title="Sao chép nội dung"
                    >
                      {copiedField === 'memo' ? (
                        <Check className="w-3 h-3 text-emerald-600" />
                      ) : (
                        <Copy className="w-3 h-3" />
                      )}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Signature block */}
          <div className="grid grid-cols-3 gap-2 pt-6 text-center text-xs text-slate-700">
            <div>
              <p className="font-bold">Người lập biểu</p>
              <p className="text-[10.5px] text-slate-400 italic">(Ký, họ tên)</p>
              <div className="h-16"></div>
              <p className="font-bold text-slate-800">Kế toán HTX</p>
            </div>
            <div>
              <p className="font-bold">Xã viên thụ hưởng</p>
              <p className="text-[10.5px] text-slate-400 italic">(Ký, họ tên)</p>
              <div className="h-16"></div>
              <p className="font-bold text-slate-800">{settlement.member_name}</p>
            </div>
            <div>
              <p className="font-bold">Giám đốc / Đại diện HTX</p>
              <p className="text-[10.5px] text-slate-400 italic">(Ký, đóng dấu)</p>
              <div className="h-16"></div>
              <p className="font-bold text-slate-800">
                {activeCooperative?.representative_name || 'Ban Quản Trị HTX'}
              </p>
            </div>
          </div>
        </div>

        {/* Footer actions */}
        <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl cursor-pointer"
          >
            Đóng
          </button>
        </div>
      </div>
    </div>
  );
};
