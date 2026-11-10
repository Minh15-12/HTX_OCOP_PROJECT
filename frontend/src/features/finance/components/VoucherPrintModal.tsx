import React, { useRef, useState, useEffect } from 'react';
import * as XLSX from 'xlsx';
import { Printer, Download, FileSpreadsheet, X, HelpCircle, Loader2 } from 'lucide-react';
import { CashTransaction } from '@/services/financeApi';
import { useTenantContextStore } from '@/stores/tenantContextStore';
import { exportPdfFromElement } from '@/utils/pdfExportUtils';

const money = (n: number) => (n || 0).toLocaleString('vi-VN') + ' ₫';

interface VoucherPrintModalProps {
  voucher: CashTransaction | null;
  onClose: () => void;
}

export const VoucherPrintModal: React.FC<VoucherPrintModalProps> = ({ voucher, onClose }) => {
  const { activeCooperative } = useTenantContextStore();
  const printRef = useRef<HTMLDivElement>(null);
  const [isExportingPdf, setIsExportingPdf] = useState(false);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  if (!voucher) return null;

  const dateParts = voucher.transactionDate.split('-');
  const year = dateParts[0] || '...';
  const month = dateParts[1] || '...';
  const day = dateParts[2] || '...';
  const isIncome = voucher.transactionType === 'INCOME';

  const handleExportPdf = async () => {
    if (!printRef.current) return;
    try {
      setIsExportingPdf(true);
      const filename = `${isIncome ? 'phieu_thu' : 'phieu_chi'}_${voucher.voucherNumber}_${new Date().toISOString().slice(0, 10)}`;
      await exportPdfFromElement(printRef.current, filename, { orientation: 'portrait' });
    } catch (err) {
      console.error('Lỗi xuất PDF chứng từ:', err);
      alert('Không thể tạo PDF tự động. Bạn có thể sử dụng nút "In trực tiếp" và chọn "Lưu dưới dạng PDF".');
    } finally {
      setIsExportingPdf(false);
    }
  };

  const handleExportExcel = () => {
    const wb = XLSX.utils.book_new();
    const data = [
      ['HỢP TÁC XÃ', activeCooperative?.legal_name || 'HỢP TÁC XÃ NÔNG NGHIỆP CÔNG NGHỆ CAO'],
      ['ĐỊA CHỈ', activeCooperative?.address || 'Hệ thống Quản trị HTX & Nông sản OCOP'],
      ['MÃ SỐ THUẾ', activeCooperative?.tax_code || '5801452291'],
      [],
      [isIncome ? 'PHIẾU THU' : 'PHIẾU CHI', `Số: ${voucher.voucherNumber}`],
      ['Căn cứ', 'Mẫu ' + (isIncome ? '01-TT' : '02-TT') + ' ban hành theo Thông tư 71/2024/TT-BTC'],
      ['Ngày lập', `Ngày ${day} tháng ${month} năm ${year}`],
      [],
      ['Họ tên đối tượng', voucher.personName],
      ['Hạng mục thu/chi', voucher.category],
      ['Diễn giải / Nội dung', voucher.description || 'Thanh toán nghiệp vụ HTX'],
      ['Số tiền (VNĐ)', voucher.amount],
      ['Hình thức thanh toán', voucher.paymentMethod === 'BANK_TRANSFER' ? 'Chuyển khoản qua ngân hàng' : 'Tiền mặt tại quỹ HTX'],
      ['Chứng từ gốc kèm theo', '01 chứng từ giao dịch'],
      [],
      ['Kế toán HTX', 'Thủ quỹ', 'Giám đốc HTX', isIncome ? 'Người nộp tiền' : 'Người nhận tiền'],
      ['(Đã ký)', '(Đã ký)', '(Đã ký)', voucher.personName],
    ];

    const ws = XLSX.utils.aoa_to_sheet(data);
    ws['!cols'] = [{ wch: 25 }, { wch: 45 }, { wch: 25 }, { wch: 25 }];
    XLSX.utils.book_append_sheet(wb, ws, isIncome ? 'Phieu_Thu' : 'Phieu_Chi');
    XLSX.writeFile(wb, `${isIncome ? 'phieu_thu' : 'phieu_chi'}_${voucher.voucherNumber}.xlsx`);
  };

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fade-in print:p-0 print:bg-white">
      <style>{`
        @media print {
          body * { visibility: hidden; }
          #printable-voucher, #printable-voucher * { visibility: visible; }
          #printable-voucher {
            position: static !important;
            width: 100%;
            border: none !important;
            box-shadow: none !important;
            background: white !important;
          }
        }
      `}</style>
      <div className="bg-white rounded-2xl max-w-2xl w-full p-6 space-y-4 shadow-2xl border border-slate-200 text-slate-800 print:shadow-none print:border-none">
        {/* Action Bar (Top) */}
        <div className="flex flex-wrap items-center justify-between border-b pb-3 border-slate-200 gap-2 print:hidden">
          <div className="flex items-center gap-2">
            <Printer className="w-5 h-5 text-emerald-700" />
            <span className="font-extrabold text-sm text-slate-900">
              Chứng Từ Kế Toán: {isIncome ? 'Phiếu Thu' : 'Phiếu Chi'}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleExportExcel}
              className="px-3 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-300 rounded-xl font-bold text-xs inline-flex items-center gap-1.5 cursor-pointer shadow-2xs transition-all"
              title="Tải bảng tính Excel (.xlsx) đối soát"
            >
              <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-700" /> Tải Excel (.xlsx)
            </button>
            <button
              type="button"
              onClick={handleExportPdf}
              disabled={isExportingPdf}
              className="px-3 py-1.5 bg-blue-50 hover:bg-blue-100 text-blue-800 border border-blue-300 rounded-xl font-bold text-xs inline-flex items-center gap-1.5 cursor-pointer shadow-2xs transition-all disabled:opacity-50"
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
              onClick={() => window.print()}
              className="px-3.5 py-1.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl font-bold text-xs inline-flex items-center gap-1.5 cursor-pointer shadow-xs transition-all active:scale-98"
            >
              <Printer className="w-4 h-4" /> In trực tiếp
            </button>
            <button
              type="button"
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Device Agnostic Info Banner */}
        <div className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 flex items-center gap-2 text-[11px] text-slate-600 print:hidden">
          <HelpCircle className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>
            Hỗ trợ đa phương thức: <strong>Tải Excel (.xlsx)</strong> để đối soát sổ sách, <strong>Tải PDF (.pdf)</strong> lưu trữ ngoại tuyến/gửi Zalo, hoặc <strong>In trực tiếp</strong> qua máy in kết nối.
          </span>
        </div>

        {/* Printable Voucher Paper */}
        <div
          ref={printRef}
          id="printable-voucher"
          data-pdf-container="true"
          className="border border-slate-300 rounded-xl p-6 bg-slate-50/50 space-y-4 font-serif text-xs break-words"
        >
          <div className="flex justify-between items-start border-b border-dashed border-slate-300 pb-4">
            <div>
              <div className="font-bold text-[11px] uppercase tracking-wide text-slate-800">
                {activeCooperative?.legal_name || 'HỢP TÁC XÃ NÔNG NGHIỆP CÔNG NGHỆ CAO'}
              </div>
              <div className="text-[10px] text-slate-500 mt-0.5">
                {activeCooperative?.address || 'Hệ thống Quản trị HTX & Nông sản OCOP'}
              </div>
            </div>
            <div className="text-right">
              <div className="font-bold text-[11px] text-slate-700">
                Mẫu số: {isIncome ? '01-TT' : '02-TT'}
              </div>
              <div className="text-[10px] text-slate-500 italic max-w-[200px] leading-tight">
                (Ban hành theo Thông tư số 71/2024/TT-BTC ngày 07/10/2024 của Bộ Tài chính)
              </div>
              <div className="font-mono font-bold text-emerald-800 mt-1">
                Số: {voucher.voucherNumber}
              </div>
            </div>
          </div>

          <div className="text-center py-2">
            <h2 className="text-xl font-black uppercase tracking-wider text-slate-900 font-sans">
              {isIncome ? 'PHIẾU THU' : 'PHIẾU CHI'}
            </h2>
            <div className="text-slate-500 italic text-[11px] mt-0.5">
              Ngày {day} tháng {month} năm {year}
            </div>
          </div>

          <div className="space-y-2 text-slate-800 font-sans leading-relaxed text-[12.5px]">
            <div className="flex">
              <span className="w-44 text-slate-600">
                {isIncome ? 'Họ tên người nộp tiền:' : 'Họ tên người nhận tiền:'}
              </span>
              <span className="font-bold flex-1">{voucher.personName}</span>
            </div>
            <div className="flex">
              <span className="w-44 text-slate-600">Hạng mục thu / chi:</span>
              <span className="font-medium flex-1">{voucher.category}</span>
            </div>
            <div className="flex">
              <span className="w-44 text-slate-600">Lý do / Nội dung:</span>
              <span className="flex-1 italic">{voucher.description || 'Thanh toán nghiệp vụ HTX'}</span>
            </div>
            <div className="flex">
              <span className="w-44 text-slate-600">Số tiền:</span>
              <span className="font-black text-emerald-800 text-sm flex-1">
                {money(voucher.amount)}
              </span>
            </div>
            <div className="flex">
              <span className="w-44 text-slate-600">Hình thức thanh toán:</span>
              <span className="font-medium flex-1">
                {voucher.paymentMethod === 'BANK_TRANSFER' ? 'Chuyển khoản qua ngân hàng' : 'Tiền mặt tại quỹ HTX'}
              </span>
            </div>
            <div className="flex">
              <span className="w-44 text-slate-600">Chứng từ gốc kèm theo:</span>
              <span className="italic text-slate-500 flex-1">01 chứng từ giao dịch</span>
            </div>
          </div>

          {/* Signatures */}
          <div className="grid grid-cols-4 gap-2 pt-6 text-center font-sans">
            <div>
              <div className="font-bold text-[11px]">Giám đốc HTX</div>
              <div className="text-[10px] text-slate-400 italic">(Ký, họ tên, đóng dấu)</div>
              <div className="h-14"></div>
              <div className="font-bold text-[11px] text-slate-700">Ban Giám Đốc</div>
            </div>
            <div>
              <div className="font-bold text-[11px]">Kế toán trưởng</div>
              <div className="text-[10px] text-slate-400 italic">(Ký, họ tên)</div>
              <div className="h-14"></div>
              <div className="font-bold text-[11px] text-slate-700">Kế toán HTX</div>
            </div>
            <div>
              <div className="font-bold text-[11px]">Thủ quỹ</div>
              <div className="text-[10px] text-slate-400 italic">(Ký, họ tên)</div>
              <div className="h-14"></div>
              <div className="font-bold text-[11px] text-slate-700">Thủ quỹ HTX</div>
            </div>
            <div>
              <div className="font-bold text-[11px]">
                {isIncome ? 'Người nộp tiền' : 'Người nhận tiền'}
              </div>
              <div className="text-[10px] text-slate-400 italic">(Ký, họ tên)</div>
              <div className="h-14"></div>
              <div className="font-bold text-[11px] text-slate-700">{voucher.personName}</div>
            </div>
          </div>
        </div>

        {/* Bottom Close Button */}
        <div className="flex justify-end pt-2">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 border border-slate-300 rounded-xl font-bold text-xs text-slate-700 hover:bg-slate-50 cursor-pointer"
          >
            Đóng
          </button>
        </div>
      </div>
    </div>
  );
};
