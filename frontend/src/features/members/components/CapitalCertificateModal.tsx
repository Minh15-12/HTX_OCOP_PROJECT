import React from 'react';
import { X, Printer, QrCode } from 'lucide-react';
import { CapitalCertificate } from '@/types/memberTypes';

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
  onPrintStandalone: (cert: CapitalCertificate) => void;
}

export const CapitalCertificateModal: React.FC<CapitalCertificateModalProps> = ({
  isOpen,
  onClose,
  certificate,
  onPrintStandalone,
}) => {
  if (!isOpen || !certificate) return null;

  return (
    <div
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
      className="fixed inset-0 bg-slate-900/80 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fade-in overflow-y-auto print:p-0 print:bg-white print:static"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="bg-white max-w-4xl w-full shadow-2xl overflow-hidden my-6 relative flex flex-col max-h-[95vh] border border-slate-300 print:max-h-none print:shadow-none print:my-0 print:w-full print:border-none rounded-xl"
      >
        <style>{`
          @media print {
            @page {
              size: A4 portrait;
              margin: 10mm 15mm;
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
              position: fixed !important;
              left: 0 !important;
              top: 0 !important;
              width: 100% !important;
              height: auto !important;
              margin: 0 !important;
              padding: 10mm 15mm !important;
              box-shadow: none !important;
              border: none !important;
              background: #ffffff !important;
              z-index: 9999999 !important;
            }
          }
        `}</style>

        {/* Action Bar */}
        <div className="p-3 bg-slate-900 text-white flex justify-between items-center shrink-0 print:hidden">
          <span className="font-bold text-xs flex items-center gap-1.5">
            <QrCode className="w-4 h-4 text-emerald-400" /> BẢN XEM TRƯỚC GIẤY CHỨNG NHẬN PHẦN VỐN GÓP (CẤP LẦN THỨ {certificate.issue_count})
          </span>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => onPrintStandalone(certificate)}
              className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold inline-flex items-center gap-1.5 transition-all cursor-pointer shadow-sm"
              title="Mở cửa sổ riêng để in hoặc xuất file PDF chuẩn A4"
            >
              <Printer className="w-3.5 h-3.5" /> In Giấy chứng nhận (A4)
            </button>
            <button
              type="button"
              onClick={onClose}
              className="px-3.5 py-1.5 bg-slate-700 hover:bg-slate-800 text-white rounded-lg text-xs font-bold inline-flex items-center gap-1.5 transition-all cursor-pointer"
              title="Thoát / Đóng"
            >
              <X className="w-4 h-4" /> Thoát / Đóng
            </button>
          </div>
        </div>

        {/* Printable Content */}
        <div
          id="printable-certificate"
          style={{
            fontFamily: '"Times New Roman", Times, serif',
            color: '#000000',
            backgroundColor: '#ffffff',
          }}
          className="p-8 md:p-12 space-y-4 overflow-y-auto flex-1 text-[15px] leading-relaxed select-text print:p-0 print:overflow-visible"
        >
          <div className="flex justify-between items-start pt-1">
            <div className="text-left space-y-0.5">
              <div className="font-bold uppercase text-[14px]">{nfc(certificate.cooperative_name)}</div>
              <div className="text-[13.5px]">Số: <strong>{nfc(certificate.certificate_code)}</strong></div>
            </div>
            <div className="text-center space-y-0.5">
              <div className="font-bold uppercase text-[14px]">CỘNG HÒA XÃ HỘI CHỦ NGHĨA VIỆT NAM</div>
              <div className="font-bold italic text-[13.5px]">Độc lập – Tự do – Hạnh phúc</div>
              <div className="w-32 border-b border-black mx-auto pt-0.5"></div>
            </div>
          </div>

          <div className="text-center pt-4 pb-1 space-y-1">
            <h1 className="text-2xl md:text-3xl font-bold uppercase tracking-wide">GIẤY CHỨNG NHẬN VỐN GÓP</h1>
            <div className="text-[14px] italic font-bold">(Cấp lần thứ {certificate.issue_count})</div>
          </div>

          <div className="text-[14.5px] italic space-y-1 pl-1">
            <p>Căn cứ Luật Hợp tác xã số 23/2012/QH13 (và Luật HTX số 17/2023/QH15) được Quốc hội nước CHXHCN Việt Nam thông qua và các văn bản hướng dẫn thi hành;</p>
            <p>Căn cứ Điều lệ {nfc(certificate.cooperative_name)} được thông qua ngày {nfc(certificate.cooperative_license_date)};</p>
            <p>Căn cứ mức vốn góp thực tế của các thành viên.</p>
          </div>

          <div className="space-y-1.5 text-[15px] pt-1">
            <div>Hợp tác xã (ghi bằng chữ in hoa): <strong className="uppercase font-bold">{nfc(certificate.cooperative_name)}</strong></div>
            <div>Địa chỉ trụ sở chính: <span>{nfc(certificate.cooperative_address)}</span></div>
            <div>Số và ngày cấp Giấy chứng nhận đăng ký HTX: <span>Số <strong>{nfc(certificate.cooperative_license_no)}</strong>, ngày <strong>{nfc(certificate.cooperative_license_date)}</strong></span></div>
          </div>

          <div className="text-center font-bold uppercase text-base tracking-widest pt-3 pb-1">
            CHỨNG NHẬN
          </div>

          <div className="space-y-1.5 text-[15px]">
            <div>Họ và tên thành viên (là cá nhân hoặc đại diện hộ gia đình): <strong className="uppercase font-bold text-[16px] pl-1">{nfc(certificate.member_full_name)}</strong></div>
            <div className="grid grid-cols-3 gap-2">
              <div>Giới tính: <strong>{nfc(certificate.member_gender)}</strong></div>
              <div>Sinh ngày: <strong>{nfc(certificate.member_dob)}</strong></div>
              <div>Dân tộc: <strong>{nfc(certificate.member_ethnicity)}</strong> &nbsp;&nbsp; Quốc tịch: <strong>{nfc(certificate.member_nationality)}</strong></div>
            </div>
            <div>Nơi đăng ký hộ khẩu thường trú: <strong>{nfc(certificate.member_address)}</strong></div>
            <div className="grid grid-cols-2 gap-2">
              <div>Chứng minh nhân dân số (hoặc CCCD): <strong>{nfc(certificate.member_cccd)}</strong></div>
              <div>Ngày cấp: <strong>{nfc(certificate.member_cccd_date)}</strong> &nbsp;&nbsp; Nơi cấp: <strong>{nfc(certificate.member_cccd_place)}</strong></div>
            </div>
          </div>

          <div className="space-y-1.5 text-[15px] pt-2">
            <div>Tổng số vốn góp: <strong className="text-[17px] font-bold">{certificate.total_capital_amount.toLocaleString('vi-VN')} đồng</strong> (Bằng chữ: <strong className="italic font-bold">{nfc(certificate.capital_in_words)}</strong>)</div>
            <div>Hình thức góp vốn:</div>
            <div className="pl-6 space-y-1">
              <div>+ Tiền mặt / Chuyển khoản: <strong>{nfc(certificate.cash_amount_text) || `${certificate.total_capital_amount.toLocaleString('vi-VN')} đồng`}</strong></div>
              <div>+ Tài sản (ghi rõ loại tài sản): <strong>{nfc(certificate.asset_amount_text) || 'Không'}</strong></div>
            </div>
            <div>Thời điểm góp vốn: <strong>{nfc(certificate.contribution_date)}</strong></div>
          </div>

          <div className="text-[14px] italic pt-3 text-justify">
            Trình tự, thủ tục cấp, cấp lại, thay đổi, thu hồi giấy chứng nhận vốn góp thực hiện theo quy định của Điều lệ HTX.
          </div>

          <div className="pt-6 flex justify-between items-end">
            <div className="text-center space-y-1">
              <img
                src={`https://api.qrserver.com/v1/create-qr-code/?size=160x160&data=${encodeURIComponent(
                  `HTX OCOP LÂM ĐỒNG - GCN VỐN GÓP: Số ${certificate.certificate_code} | Xã Viên: ${certificate.member_full_name} (${certificate.member_cccd}) | Tổng vốn thực góp: ${certificate.total_capital_amount.toLocaleString('vi-VN')} VNĐ | Cấp lần thứ: ${certificate.issue_count} | Ngày cấp: ${certificate.certificate_issue_date}`
                )}`}
                alt="Mã QR Tra cứu GCN"
                className="w-24 h-24 mx-auto border border-slate-200 p-1 bg-white"
              />
              <span className="text-[11px] font-mono text-slate-700 font-bold block mt-1">Mã QR Tra cứu GCN</span>
            </div>

            <div className="text-center text-[14px] space-y-1 pr-2">
              <div className="italic">{nfc(certificate.issue_place)}, Ngày {new Date().getDate()} tháng {new Date().getMonth() + 1} năm {new Date().getFullYear()}</div>
              <div className="font-bold uppercase text-[14px]">ĐĐ. THEO PHÁP LUẬT CỦA HỢP TÁC XÃ</div>
              <div className="text-[12px] italic">(Ký tên, đóng dấu)</div>
              <div className="h-20"></div>
              <div className="font-bold uppercase text-[15px]">{nfc(certificate.representative_name)}</div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-3 bg-slate-100 border-t border-slate-300 flex justify-between items-center shrink-0 print:hidden">
          <span className="text-xs text-slate-500 font-medium hidden sm:inline">
            Nhấn "Thoát / Đóng" hoặc click phông nền mờ để quay lại
          </span>
          <div className="flex items-center gap-2.5 ml-auto">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-800 font-bold text-xs rounded-lg inline-flex items-center gap-1.5 transition-all cursor-pointer"
            >
              <X className="w-4 h-4 text-slate-600" /> Thoát / Đóng
            </button>
            <button
              type="button"
              onClick={() => onPrintStandalone(certificate)}
              className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-lg shadow-sm inline-flex items-center gap-1.5 transition-all cursor-pointer"
            >
              <Printer className="w-4 h-4" /> In Giấy chứng nhận (A4)
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
