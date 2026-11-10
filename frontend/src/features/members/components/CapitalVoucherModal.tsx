import React, { useState } from 'react';
import { X, Printer, FileText, Download, Loader2, FileSpreadsheet } from 'lucide-react';
import { Member, CapitalTransaction } from '@/types/memberTypes';
import { getVoucherHtml } from '@/utils/voucherDocumentGenerator';
import { exportPdfFromElement } from '@/utils/pdfExportUtils';
import { exportToExcel } from '@/utils/exportUtils';

interface CapitalVoucherModalProps {
  transaction: CapitalTransaction | null;
  member: Member | null;
  onClose: () => void;
}

export const CapitalVoucherModal: React.FC<CapitalVoucherModalProps> = ({
  transaction,
  member,
  onClose,
}) => {
  const [isExportingPdf, setIsExportingPdf] = useState(false);

  if (!transaction) return null;

  const voucherCode =
    transaction.receipt_number || transaction.transaction_code || `PT-${member?.member_code || '001'}`;

  const docHtml = member ? getVoucherHtml(member, transaction) : '';

  const handleDownloadPdf = async () => {
    try {
      setIsExportingPdf(true);
      await exportPdfFromElement(
        'printable-voucher-content',
        `Chung_Tu_${voucherCode.replace(/[/\\?%*:|"<>]/g, '_')}.pdf`,
        {
          format: 'a4',
          orientation: 'portrait',
          margin: [12, 15, 12, 15],
        }
      );
    } catch (err) {
      console.error('Lỗi khi xuất file PDF chứng từ:', err);
    } finally {
      setIsExportingPdf(false);
    }
  };

  const handleExportExcel = () => {
    const rows = [
      {
        'Số Chứng Từ': voucherCode,
        'Họ và Tên Xã Viên': member?.full_name || transaction.member_name,
        'Mã Xã Viên': member?.member_code || transaction.member_code,
        'Số Tiền Nộp (VNĐ)': transaction.amount,
        'Hình Thức Nộp':
          transaction.payment_method === 'CASH'
            ? 'Tiền mặt'
            : transaction.payment_method === 'BANK_TRANSFER'
            ? 'Chuyển khoản'
            : 'Tài sản / Khác',
        'Ngày Lập Chứng Từ': transaction.contribution_date,
        'Nội Dung / Diễn Giải': transaction.content || 'Nộp tiền vốn điều lệ HTX',
        'Trạng Thái Kế Toán': transaction.status === 'APPROVED' ? 'Đã duyệt' : 'Chờ duyệt',
        'Người Ghi Sổ': transaction.recorded_by || 'Thủ quỹ HTX',
      },
    ];
    exportToExcel(rows, `Chung_Tu_${voucherCode.replace(/[/\\?%*:|"<>]/g, '_')}`, 'ChungTuKeToan');
  };

  const handlePrintA4 = () => {
    window.print();
  };

  return (
    <div
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
      className="fixed inset-0 bg-slate-900/80 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fade-in overflow-y-auto print:p-0 print:bg-white print:static"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="bg-white rounded-2xl max-w-4xl w-full max-h-[92vh] shadow-modal overflow-hidden flex flex-col border border-slate-300 print:max-h-none print:shadow-none print:w-full print:border-none"
      >
        <style>{`
          @media print {
            @page {
              size: A4 portrait;
              margin: 12mm 15mm;
            }
            html, body {
              height: auto !important;
              overflow: visible !important;
              background: #ffffff !important;
              margin: 0 !important;
              padding: 0 !important;
            }
            nav, sidebar, header, aside, [role="navigation"], .no-print {
              display: none !important;
            }
            body * {
              visibility: hidden !important;
            }
            #printable-voucher-content, #printable-voucher-content * {
              visibility: visible !important;
            }
            #printable-voucher-content {
              position: static !important;
              width: 100% !important;
              height: auto !important;
              margin: 0 !important;
              padding: 5mm 10mm !important;
              box-shadow: none !important;
              border: none !important;
              background: #ffffff !important;
            }
          }
        `}</style>

        {/* Top Control Bar - Trio Actions */}
        <div className="p-3.5 border-b border-slate-200 flex justify-between items-center bg-slate-900 text-white shrink-0 print:hidden">
          <div className="flex items-center gap-2 min-w-0">
            <FileText className="w-5 h-5 text-emerald-400 shrink-0" />
            <h3 className="font-extrabold text-sm truncate">
              Chứng từ kế toán &bull; <span className="font-mono text-emerald-300">{voucherCode}</span>
            </h3>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            {/* Action 1: Tải File PDF */}
            <button
              type="button"
              onClick={handleDownloadPdf}
              disabled={isExportingPdf}
              className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 disabled:bg-slate-700 text-white font-bold text-xs rounded-lg inline-flex items-center gap-1.5 transition-all cursor-pointer shadow-sm"
              title="Tải trực tiếp file PDF chứng từ"
            >
              {isExportingPdf ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" /> Đang tạo PDF...
                </>
              ) : (
                <>
                  <Download className="w-3.5 h-3.5" /> Tải File PDF (.pdf)
                </>
              )}
            </button>

            {/* Action 2: Tải File Excel */}
            <button
              type="button"
              onClick={handleExportExcel}
              className="px-3.5 py-1.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-lg inline-flex items-center gap-1.5 transition-all cursor-pointer shadow-sm"
              title="Tải thông tin chứng từ kế toán dạng Excel .xlsx (Dành cho kế toán/laptop)"
            >
              <FileSpreadsheet className="w-3.5 h-3.5" /> Tải Excel (.xlsx)
            </button>

            {/* Action 3: In trực tiếp A4 */}
            <button
              type="button"
              onClick={handlePrintA4}
              className="px-3.5 py-1.5 bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs rounded-lg inline-flex items-center gap-1.5 transition-all cursor-pointer shadow-sm"
              title="In trực tiếp trang A4 bằng trình duyệt"
            >
              <Printer className="w-3.5 h-3.5" /> In A4 (Trình duyệt)
            </button>

            <button
              type="button"
              onClick={onClose}
              className="px-3 py-1.5 bg-slate-700 hover:bg-slate-800 text-white rounded-lg text-xs font-bold inline-flex items-center gap-1.5 transition-all cursor-pointer"
            >
              <X className="w-4 h-4" /> Đóng
            </button>
          </div>
        </div>

        {/* Modal Body */}
        <div className="flex-1 bg-slate-100 p-4 md:p-6 overflow-y-auto flex items-start justify-center print:bg-white print:p-0">
          {transaction.receipt_file_url &&
          (transaction.receipt_file_url.startsWith('data:image/') ||
            transaction.receipt_file_name?.match(/\.(png|jpg|jpeg|webp|gif)$/i)) ? (
            <div className="bg-white p-4 rounded-xl shadow-md max-h-full flex flex-col items-center justify-center overflow-auto border border-slate-200">
              <img
                src={transaction.receipt_file_url}
                alt={transaction.receipt_file_name || transaction.receipt_number}
                className="max-h-[70vh] max-w-full object-contain rounded-lg shadow-sm"
              />
              {transaction.receipt_file_name && (
                <div className="mt-3 text-xs font-bold text-slate-600">
                  📁 File đính kèm: {transaction.receipt_file_name}
                </div>
              )}
            </div>
          ) : transaction.receipt_file_url &&
            (transaction.receipt_file_url.startsWith('data:application/pdf') ||
              transaction.receipt_file_name?.endsWith('.pdf')) ? (
            <iframe
              src={transaction.receipt_file_url}
              title="Chứng từ PDF đính kèm"
              className="w-full h-[75vh] border-0 rounded-xl bg-white shadow-sm"
            />
          ) : (
            <div
              id="printable-voucher-content"
              data-pdf-container="true"
              dangerouslySetInnerHTML={{ __html: docHtml }}
              className="w-full max-w-3xl bg-white p-8 md:p-12 shadow-sm rounded-xl border border-slate-200 select-text print:shadow-none print:border-none print:p-0 print:max-w-none"
            />
          )}
        </div>

        {/* Footer info (Hidden on print) */}
        <div className="p-3 bg-slate-50 border-t border-slate-200 flex justify-between items-center text-xs text-slate-500 shrink-0 print:hidden">
          <span>Chứng từ hạch toán nguồn vốn Hợp tác xã theo Thông tư số 24/2024/TT-BTC &bull; Chuẩn in A4</span>
          <button
            type="button"
            onClick={onClose}
            className="px-3.5 py-1.5 bg-slate-200 hover:bg-slate-300 text-slate-800 font-bold rounded-lg transition-colors cursor-pointer"
          >
            Đóng cửa sổ
          </button>
        </div>
      </div>
    </div>
  );
};
