import React, { useState } from 'react';
import { X, Printer, QrCode, Download, Loader2, FileSpreadsheet } from 'lucide-react';
import { CapitalCertificate } from '@/types/memberTypes';
import { exportPdfFromElement } from '@/utils/pdfExportUtils';
import { exportToExcel } from '@/utils/exportUtils';
import { QrCodeSvg } from '@/features/agriculture/components/QrCodeSvg';

const nfc = (str?: string | number | null): string => {
  if (str === undefined || str === null) return '';
  let text = String(str).normalize('NFC');
  return text
    .replace(/\s+([\u0300-\u036f])/g, '$1')
    .replace(/bằ\s+ng/gi, 'bằng')
    .replace(/cấ\s+p/gi, 'cấp')
    .replace(/Giấ\s+y/gi, 'Giấy')
    .replace(/LÂM\s+ĐỒ\s+NG/gi, 'LÂM ĐỒNG')
    .replace(/Đô\s+ng/gi, 'Đồng')
    .replace(/Số\s+́/gi, 'Số')
    .replace(/Số́/g, 'Số')
    .replace(/cấ\s*p/gi, 'cấp')
    .replace(/Giấ\s*y/gi, 'Giấy')
    .replace(/Thị\s+trấ\s*n/gi, 'Thị trấn')
    .replace(/trấ\s*n/gi, 'trấn')
    .replace(/ĐINH\s+VĂN/gi, 'Đinh Văn')
    .replace(/LÂM\s+HÀ/gi, 'Lâm Hà')
    .replace(/LÂM\s+ĐỒ̀\s*NG/gi, 'LÂM ĐỒNG')
    .normalize('NFC');
};

interface CapitalCertificateModalProps {
  isOpen: boolean;
  onClose: () => void;
  certificate: CapitalCertificate | null;
  onPrintStandalone?: (cert: CapitalCertificate) => void;
}

export const CapitalCertificateModal: React.FC<CapitalCertificateModalProps> = ({
  isOpen,
  onClose,
  certificate,
  onPrintStandalone,
}) => {
  const [isExportingPdf, setIsExportingPdf] = useState(false);

  if (!isOpen || !certificate) return null;

  const handleDownloadPdf = async () => {
    try {
      setIsExportingPdf(true);
      await exportPdfFromElement(
        'printable-certificate',
        `Giay_Chung_Nhan_Von_Gop_${certificate.certificate_code.replace(/[/\\?%*:|"<>]/g, '_')}.pdf`,
        {
          format: 'a4',
          orientation: 'portrait',
          margin: [8, 12, 8, 12],
        }
      );
    } catch (err) {
      console.error('Lỗi khi xuất file PDF Giấy chứng nhận:', err);
    } finally {
      setIsExportingPdf(false);
    }
  };

  const handleExportExcel = () => {
    const rows = [
      {
        'Số Hiệu Giấy Chứng Nhận': certificate.certificate_code,
        'Cấp Lần Thứ': certificate.issue_count,
        'Ngày Cấp': certificate.certificate_issue_date,
        'Họ và Tên Xã Viên': certificate.member_full_name,
        'Số CCCD/Định Danh': certificate.member_cccd,
        'Ngày Cấp CCCD': certificate.member_cccd_date,
        'Nơi Cấp CCCD': certificate.member_cccd_place,
        'Địa Chỉ Thường Trú': certificate.member_address,
        'Tổng Mức Vốn Góp (VNĐ)': certificate.total_capital_amount,
        'Bằng Chữ': certificate.capital_in_words,
        'Hình Thức Góp Vốn': certificate.contribution_form,
        'Tên Hợp Tác Xã': certificate.cooperative_name,
        'Địa Chỉ HTX': certificate.cooperative_address,
        'Mã Số ĐKKD/Thuế HTX': certificate.cooperative_license_no,
      },
    ];
    exportToExcel(rows, `GCN_Von_Gop_${certificate.certificate_code.replace(/[/\\?%*:|"<>]/g, '_')}`, 'GCN_VonGop');
  };

  const handlePrintA4 = () => {
    window.print();
  };

  return (
    <div
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
      className="fixed inset-0 bg-slate-900/80 backdrop-blur-xs flex items-center justify-center p-2 sm:p-4 z-50 animate-fade-in overflow-y-auto print:p-0 print:bg-white print:static"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="bg-white max-w-4xl w-full shadow-2xl overflow-hidden my-4 relative flex flex-col max-h-[96vh] border border-slate-300 print:max-h-none print:shadow-none print:my-0 print:w-full print:border-none rounded-xl"
      >
        <style>{`
          @media print {
            @page {
              size: A4 portrait;
              margin: 10mm 12mm;
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
            #printable-certificate, #printable-certificate * {
              visibility: visible !important;
            }
            #printable-certificate {
              position: static !important;
              width: 100% !important;
              height: auto !important;
              margin: 0 !important;
              padding: 0 !important;
              box-shadow: none !important;
              border: none !important;
              background: #ffffff !important;
              page-break-inside: avoid !important;
              break-inside: avoid !important;
            }
          }
        `}</style>

        {/* Action Bar - Trio Actions */}
        <div className="p-3.5 bg-slate-900 text-white flex justify-between items-center shrink-0 print:hidden border-b border-slate-800">
          <span className="font-bold text-xs flex items-center gap-1.5">
            <QrCode className="w-4 h-4 text-emerald-400" /> BẢN XEM TRƯỚC GIẤY CHỨNG NHẬN PHẦN VỐN GÓP (CẤP LẦN THỨ {certificate.issue_count})
          </span>
          <div className="flex items-center gap-2">
            {/* Action 1: Tải PDF */}
            <button
              type="button"
              onClick={handleDownloadPdf}
              disabled={isExportingPdf}
              className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 disabled:bg-slate-700 text-white rounded-lg text-xs font-bold inline-flex items-center gap-1.5 transition-all cursor-pointer shadow-sm"
              title="Tải trực tiếp file PDF Giấy chứng nhận vốn góp chuẩn 1 trang A4"
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

            {/* Action 2: Tải Excel */}
            <button
              type="button"
              onClick={handleExportExcel}
              className="px-3.5 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-bold inline-flex items-center gap-1.5 transition-all cursor-pointer shadow-sm"
              title="Tải dữ liệu Giấy chứng nhận vốn góp dạng Excel .xlsx (Dành cho kế toán/laptop)"
            >
              <FileSpreadsheet className="w-3.5 h-3.5" /> Tải Excel (.xlsx)
            </button>

            {/* Action 3: In trực tiếp A4 */}
            <button
              type="button"
              onClick={handlePrintA4}
              className="px-3.5 py-1.5 bg-teal-600 hover:bg-teal-700 text-white rounded-lg text-xs font-bold inline-flex items-center gap-1.5 transition-all cursor-pointer shadow-sm"
              title="In trực tiếp trang A4 bằng trình duyệt"
            >
              <Printer className="w-3.5 h-3.5" /> In A4 (Trình duyệt)
            </button>

            <button
              type="button"
              onClick={onClose}
              className="px-3 py-1.5 bg-slate-700 hover:bg-slate-800 text-white rounded-lg text-xs font-bold inline-flex items-center gap-1.5 transition-all cursor-pointer"
              title="Thoát / Đóng"
            >
              <X className="w-4 h-4" /> Thoát / Đóng
            </button>
          </div>
        </div>

        {/* Document Scroll Wrapper (Desktop paper preview effect) */}
        <div className="bg-slate-200/60 p-3 sm:p-6 overflow-y-auto flex-1 flex justify-center print:p-0 print:bg-white">
          <div className="w-full max-w-[760px] bg-white shadow-md border border-slate-300 print:shadow-none print:border-none">
            <div
              id="printable-certificate"
              data-pdf-container="true"
              style={{
                fontFamily: '"Times New Roman", Times, serif',
                color: '#000000',
                backgroundColor: '#ffffff',
                boxSizing: 'border-box',
              }}
              className="w-full bg-white p-6 sm:p-8 space-y-2.5 text-[13.5px] leading-relaxed select-text print:p-0 print:space-y-2"
            >
            {/* Header: Cooperative name (Left) & National Motto (Right) */}
            <div className="flex justify-between items-start pt-0.5">
              <div className="text-left space-y-0.5 max-w-[50%]">
                <div className="font-bold uppercase text-[13px] leading-snug">{nfc(certificate.cooperative_name)}</div>
                <div className="text-[12.5px]">Số: <strong>{nfc(certificate.certificate_code)}</strong></div>
              </div>
              <div className="text-center space-y-0.5">
                <div className="font-bold uppercase text-[13px]">CỘNG HÒA XÃ HỘI CHỦ NGHĨA VIỆT NAM</div>
                <div className="font-bold italic text-[12.5px]">Độc lập – Tự do – Hạnh phúc</div>
                <div className="w-28 border-b border-black mx-auto pt-0.5"></div>
              </div>
            </div>

            {/* Title */}
            <div className="text-center pt-2 pb-0.5 space-y-0.5">
              <h1 className="text-xl sm:text-2xl font-bold uppercase tracking-wide">GIẤY CHỨNG NHẬN VỐN GÓP</h1>
              <div className="text-[13px] italic font-bold text-slate-800">(Cấp lần thứ {certificate.issue_count})</div>
            </div>

            {/* Legal Basis */}
            <div className="text-[12.5px] italic space-y-0.5 pl-0.5 text-slate-800 leading-normal">
              <p>– Căn cứ Luật Hợp tác xã số 17/2023/QH15 ngày 20/06/2023 của Quốc hội nước CHXHCN Việt Nam và các văn bản hướng dẫn thi hành;</p>
              <p>– Căn cứ Điều lệ {nfc(certificate.cooperative_name)} được Đại hội thành viên thông qua;</p>
              <p>– Căn cứ mức vốn góp thực tế của các thành viên.</p>
            </div>

            {/* Cooperative Info */}
            <div className="space-y-1 text-[13px] pt-1">
              <div>Hợp tác xã (ghi bằng chữ in hoa): <strong className="uppercase font-bold">{nfc(certificate.cooperative_name)}</strong></div>
              <div>Địa chỉ trụ sở chính: <span>{nfc(certificate.cooperative_address)}</span></div>
              <div>Số và ngày cấp Giấy chứng nhận ĐK HTX: <span>Số <strong>{nfc(certificate.cooperative_license_no)}</strong>, ngày cấp: <strong>{nfc(certificate.cooperative_license_date)}</strong></span></div>
            </div>

            {/* Section Divider */}
            <div className="text-center font-bold uppercase text-[15px] tracking-widest pt-1.5 pb-0.5">
              CHỨNG NHẬN
            </div>

            {/* Member Info */}
            <div className="space-y-1 text-[13.5px]">
              <div>Họ và tên thành viên (cá nhân hoặc đại diện hộ gia đình): <strong className="uppercase font-bold text-[14.5px] pl-1">{nfc(certificate.member_full_name)}</strong></div>
              <div className="grid grid-cols-3 gap-2">
                <div>Giới tính: <strong>{nfc(certificate.member_gender)}</strong></div>
                <div>Sinh ngày: <strong>{nfc(certificate.member_dob)}</strong></div>
                <div>Dân tộc: <strong>{nfc(certificate.member_ethnicity)}</strong> &bull; Quốc tịch: <strong>{nfc(certificate.member_nationality)}</strong></div>
              </div>
              <div>Nơi đăng ký thường trú: <strong>{nfc(certificate.member_address)}</strong></div>
              <div className="grid grid-cols-2 gap-2">
                <div>CCCD/CMND số: <strong>{nfc(certificate.member_cccd)}</strong></div>
                <div>Ngày cấp: <strong>{nfc(certificate.member_cccd_date)}</strong> &bull; Nơi cấp: <strong>{nfc(certificate.member_cccd_place)}</strong></div>
              </div>
            </div>

            {/* Capital Contribution Info */}
            <div className="space-y-1 text-[13.5px] pt-1">
              <div>Tổng số vốn góp: <strong className="text-[15px] font-bold">{certificate.total_capital_amount.toLocaleString('vi-VN')} đồng</strong> (Bằng chữ: <strong className="italic">{nfc(certificate.capital_in_words)}</strong>)</div>
              <div className="grid grid-cols-2 gap-2">
                <div>+ Tiền mặt / CK: <strong>{nfc(certificate.cash_amount_text) || `${certificate.total_capital_amount.toLocaleString('vi-VN')} đồng`}</strong></div>
                <div>+ Tài sản (QSDĐ/máy móc): <strong>{nfc(certificate.asset_amount_text) || 'Không'}</strong></div>
              </div>
              <div>Thời điểm góp vốn: <strong>{nfc(certificate.contribution_date)}</strong></div>
            </div>

            {/* Legal Note */}
            <div className="text-[12px] italic pt-1 text-justify text-slate-800 leading-normal">
              Trình tự, thủ tục cấp, cấp lại, thay đổi, thu hồi giấy chứng nhận vốn góp thực hiện theo quy định của Điều lệ HTX và Luật Hợp tác xã 2023.
            </div>

            {/* Signature & Verification Block */}
            <div
              style={{ breakInside: 'avoid', pageBreakInside: 'avoid' }}
              className="pt-4 flex justify-between items-end mt-2"
            >
              {/* QR Code Verification */}
              <div className="text-center space-y-1">
                <div className="w-[84px] h-[84px] mx-auto border border-slate-300 p-1 bg-white flex items-center justify-center shadow-xs">
                  <QrCodeSvg
                    value={`HTX OCOP - GCN VỐN GÓP: Số ${certificate.certificate_code} | Xã Viên: ${certificate.member_full_name} (${certificate.member_cccd}) | Vốn góp: ${certificate.total_capital_amount.toLocaleString('vi-VN')} VNĐ | Cấp lần: ${certificate.issue_count} | Ngày cấp: ${certificate.certificate_issue_date}`}
                    size={76}
                  />
                </div>
                <span className="text-[10.5px] font-mono text-slate-700 font-bold block">Mã QR Tra cứu GCN</span>
              </div>

              {/* Legal Representative Signature */}
              <div className="text-center text-[13.5px] space-y-0.5 pr-2">
                <div className="italic">{nfc(certificate.issue_place)}, Ngày {new Date().getDate()} tháng {new Date().getMonth() + 1} năm {new Date().getFullYear()}</div>
                <div className="font-bold uppercase text-[13px]">ĐĐ. THEO PHÁP LUẬT CỦA HỢP TÁC XÃ</div>
                <div className="text-[11.5px] italic text-slate-700">(Ký tên, đóng dấu)</div>
                <div className="h-14"></div>
                <div className="font-bold uppercase text-[14px]">{nfc(certificate.representative_name)}</div>
              </div>
            </div>
          </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-3 bg-slate-100 border-t border-slate-300 flex justify-between items-center shrink-0 print:hidden">
          <span className="text-xs text-slate-500 font-medium hidden sm:inline">
            Giấy chứng nhận lưu trữ nội bộ theo Luật HTX 2023 &bull; Chuẩn in A4
          </span>
          <div className="flex items-center gap-2.5 ml-auto">
            <button
              type="button"
              onClick={handleDownloadPdf}
              disabled={isExportingPdf}
              className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 disabled:bg-slate-500 text-white font-bold text-xs rounded-lg shadow-xs inline-flex items-center gap-1.5 transition-all cursor-pointer"
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
            <button
              type="button"
              onClick={handleExportExcel}
              className="px-3.5 py-1.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-lg shadow-xs inline-flex items-center gap-1.5 transition-all cursor-pointer"
            >
              <FileSpreadsheet className="w-3.5 h-3.5" /> Tải Excel (.xlsx)
            </button>
            <button
              type="button"
              onClick={handlePrintA4}
              className="px-3.5 py-1.5 bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs rounded-lg shadow-xs inline-flex items-center gap-1.5 transition-all cursor-pointer"
            >
              <Printer className="w-3.5 h-3.5" /> In A4 (Trình duyệt)
            </button>
            <button
              type="button"
              onClick={onClose}
              className="px-3.5 py-1.5 bg-slate-200 hover:bg-slate-300 text-slate-800 font-bold text-xs rounded-lg inline-flex items-center gap-1.5 transition-all cursor-pointer"
            >
              <X className="w-4 h-4 text-slate-600" /> Thoát / Đóng
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
