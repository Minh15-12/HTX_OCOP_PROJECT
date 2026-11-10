import React, { useState } from 'react';
import { X, Printer, Download, UserCheck, Loader2, FileSpreadsheet } from 'lucide-react';
import { Member, MEMBER_TYPE_LABELS } from '@/types/memberTypes';
import { exportPdfFromElement } from '@/utils/pdfExportUtils';
import { exportToExcel } from '@/utils/exportUtils';
import { useTenantContextStore } from '@/stores/tenantContextStore';

interface MemberProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  member: Member | null;
}

export const MemberProfileModal: React.FC<MemberProfileModalProps> = ({
  isOpen,
  onClose,
  member,
}) => {
  const [isExportingPdf, setIsExportingPdf] = useState(false);
  const { activeCooperative } = useTenantContextStore();

  if (!isOpen || !member) return null;

  const coopName =
    activeCooperative?.legal_name ||
    activeCooperative?.short_name ||
    member.cooperative_name ||
    'HỢP TÁC XÃ NÔNG NGHIỆP DỊCH VỤ OCOP MÊ LINH';
  const coopTax = activeCooperative?.tax_code || '5801489123';
  const coopAddress = activeCooperative?.address || 'Lâm Đồng, Việt Nam';

  const today = new Date();
  const dateStr = `Lâm Đồng, ngày ${today.getDate()} tháng ${today.getMonth() + 1} năm ${today.getFullYear()}`;
  const memberTypeLabel = MEMBER_TYPE_LABELS[member.member_type] || member.member_type;

  const formatDateDisplay = (dateVal?: string | null) => {
    if (!dateVal) return '—';
    try {
      const d = new Date(dateVal);
      if (isNaN(d.getTime())) return dateVal;
      const day = String(d.getDate()).padStart(2, '0');
      const month = String(d.getMonth() + 1).padStart(2, '0');
      const year = d.getFullYear();
      return `${day}/${month}/${year}`;
    } catch {
      return dateVal;
    }
  };

  const handleDownloadPdf = async () => {
    try {
      setIsExportingPdf(true);
      await exportPdfFromElement(
        'printable-member-profile',
        `Ho_So_Xa_Vien_${member.member_code}.pdf`,
        {
          format: 'a4',
          orientation: 'portrait',
          margin: [12, 15, 12, 15],
        }
      );
    } catch (err) {
      console.error('Lỗi khi xuất file PDF hồ sơ xã viên:', err);
    } finally {
      setIsExportingPdf(false);
    }
  };

  const handleExportExcel = () => {
    const dataRow = [
      {
        'Mã Xã Viên': member.member_code,
        'Họ và Tên': member.full_name,
        'Loại Thành Viên': memberTypeLabel,
        'Giới Tính': member.gender || '—',
        'Ngày Sinh': formatDateDisplay(member.dob),
        'Số CCCD': member.cccd || '—',
        'Ngày Cấp CCCD': formatDateDisplay(member.cccd_issue_date),
        'Nơi Cấp CCCD': member.cccd_issue_place || '—',
        'Địa Chỉ Thường Trú': member.address || member.detail_address || '—',
        'Số Điện Thoại': member.phone || '—',
        'Email': member.email || '—',
        'Trình Độ': member.education_level || '—',
        'Nghề Nghiệp': member.occupation || '—',
        'Vốn Góp Cam Kết (VNĐ)': member.committed_capital || 0,
        'Vốn Đã Góp Thực Tế (VNĐ)': member.contributed_capital || 0,
        'Tỷ Lệ Sở Hữu Vốn (%)': (member as any).share_percentage || 0,
        'Hình Thức Góp Vốn': member.capital_form === 'TIEN_MAT' ? 'Tiền mặt / Chuyển khoản' : 'Hiện vật / Quyền sử dụng đất',
        'Ngân Hàng Thụ Hưởng': member.bank_name || '—',
        'Số Tài Khoản': member.bank_account || '—',
        'Chủ Tài Khoản': member.account_holder || member.full_name,
        'Phương Thức Nhận Tiền': member.payout_method === 'BANK_TRANSFER' ? 'Chuyển khoản trực tiếp' : 'Nhận tiền mặt tại quỹ HTX',
        'Sản Lượng Cung Ứng (kg/năm)': member.annual_product_output_kg || 0,
        'Quy Trình Canh Tác': member.farming_method || '—',
        'Dư Nợ Vật Tư (VNĐ)': member.current_debt || 0,
        'Ngày Gia Nhập': formatDateDisplay(member.join_date),
        'Trạng Thái': member.status === 'ACTIVE' ? 'Đang hoạt động' : member.status === 'PENDING' ? 'Chờ duyệt' : 'Đã chấm dứt',
      },
    ];
    exportToExcel(dataRow, `To_Khai_Xa_Vien_${member.member_code}`, 'ToKhaiXaVien');
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
        className="bg-white max-w-4xl w-full shadow-2xl overflow-hidden my-6 relative flex flex-col max-h-[95vh] border border-slate-300 print:max-h-none print:shadow-none print:my-0 print:w-full print:border-none rounded-xl"
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
            #printable-member-profile, #printable-member-profile * {
              visibility: visible !important;
            }
            #printable-member-profile {
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

        {/* Top Control Bar (Hidden on print) - Trio Actions compliant with RULE-TECH-DOC-01 */}
        <div className="p-3.5 bg-slate-900 text-white flex justify-between items-center shrink-0 print:hidden border-b border-slate-800">
          <div className="flex items-center gap-2">
            <UserCheck className="w-4 h-4 text-emerald-400" />
            <span className="font-bold text-xs uppercase tracking-wide">
              SỔ TỜ KHAI HỒ SƠ XÃ VIÊN (ĐIỀU 33 LUẬT HTX 2023) &bull; MÃ {member.member_code}
            </span>
          </div>

          <div className="flex items-center gap-2">
            {/* Action 1: Tải File PDF */}
            <button
              type="button"
              onClick={handleDownloadPdf}
              disabled={isExportingPdf}
              className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 disabled:bg-slate-700 text-white rounded-lg text-xs font-bold inline-flex items-center gap-1.5 transition-all cursor-pointer shadow-sm"
              title="Tải trực tiếp file PDF chuẩn Nghị định 30/2020/NĐ-CP"
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
              className="px-3.5 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-bold inline-flex items-center gap-1.5 transition-all cursor-pointer shadow-sm"
              title="Tải bảng dữ liệu kê khai xã viên dạng Excel .xlsx (Dành cho laptop/kế toán)"
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
            >
              <X className="w-4 h-4" /> Đóng
            </button>
          </div>
        </div>

        {/* Printable Content Container */}
        <div
          id="printable-member-profile"
          data-pdf-container="true"
          style={{
            fontFamily: '"Times New Roman", Times, serif',
            color: '#000000',
            backgroundColor: '#ffffff',
          }}
          className="p-8 md:p-12 space-y-4 overflow-y-auto flex-1 text-[13pt] leading-relaxed select-text print:p-0 print:overflow-visible"
        >
          {/* Header 2 columns: Org & National Motto */}
          <table className="w-full border-collapse mb-3">
            <tbody>
              <tr>
                <td className="w-[48%] align-top text-center pb-2">
                  <div className="font-bold text-[12pt] uppercase tracking-tight">{coopName}</div>
                  <div className="text-[10.5pt] text-slate-700">Mã số thuế / HTX: {coopTax}</div>
                  <div className="text-[10pt] italic text-slate-600">{coopAddress}</div>
                </td>
                <td className="w-[52%] align-top text-center pb-2">
                  <div className="font-bold text-[12pt] uppercase">CỘNG HÒA XÃ HỘI CHỦ NGHĨA VIỆT NAM</div>
                  <div className="font-bold text-[11.5pt]">Độc lập - Tự do - Hạnh phúc</div>
                  <div className="w-36 border-b border-black mx-auto pt-1"></div>
                </td>
              </tr>
            </tbody>
          </table>

          {/* Document Title */}
          <div className="text-center pt-2 pb-3 space-y-1">
            <h1 className="text-[18pt] font-bold uppercase tracking-wide">SỔ TỜ KHAI HỒ SƠ XÃ VIÊN</h1>
            <p className="text-[11pt] italic text-slate-800">
              Mã số định danh: <strong>{member.member_code}</strong> &bull; Trạng thái:{' '}
              <strong>
                {member.status === 'ACTIVE'
                  ? 'Đang hoạt động chính thức'
                  : member.status === 'PENDING'
                  ? 'Chờ xét duyệt gia nhập'
                  : 'Đã chấm dứt tư cách'}
              </strong>
            </p>
          </div>

          {/* Section I: Personal Info */}
          <div>
            <div className="font-bold text-[12.5pt] uppercase border-b border-black pb-1 mb-2">
              I. THÔNG TIN CÁ NHÂN &amp; ĐỊNH DANH
            </div>
            <table className="w-full border-collapse text-[11.5pt] border border-slate-700">
              <tbody>
                <tr className="border-b border-slate-600">
                  <td className="w-1/3 p-2 font-bold bg-slate-100 border-r border-slate-600">Họ và tên xã viên:</td>
                  <td className="w-2/3 p-2 font-bold uppercase text-[12.5pt]">{member.full_name}</td>
                </tr>
                <tr className="border-b border-slate-600">
                  <td className="p-2 font-bold bg-slate-100 border-r border-slate-600">Giới tính / Ngày sinh:</td>
                  <td className="p-2">{member.gender || '—'} &nbsp;|&nbsp; Ngày sinh: {formatDateDisplay(member.dob)}</td>
                </tr>
                <tr className="border-b border-slate-600">
                  <td className="p-2 font-bold bg-slate-100 border-r border-slate-600">Số CCCD / Định danh:</td>
                  <td className="p-2">
                    <strong>{member.cccd || '—'}</strong> &nbsp;|&nbsp; Ngày cấp: {formatDateDisplay(member.cccd_issue_date)} &nbsp;|&nbsp; Nơi cấp: {member.cccd_issue_place || '—'}
                  </td>
                </tr>
                <tr className="border-b border-slate-600">
                  <td className="p-2 font-bold bg-slate-100 border-r border-slate-600">Địa chỉ thường trú:</td>
                  <td className="p-2">{member.address || member.detail_address || '—'}</td>
                </tr>
                <tr className="border-b border-slate-600">
                  <td className="p-2 font-bold bg-slate-100 border-r border-slate-600">Số điện thoại / Email:</td>
                  <td className="p-2"><strong>{member.phone || '—'}</strong> &nbsp;|&nbsp; {member.email || '—'}</td>
                </tr>
                <tr>
                  <td className="p-2 font-bold bg-slate-100 border-r border-slate-600">Trình độ / Nghề nghiệp:</td>
                  <td className="p-2">{member.education_level || '—'} &nbsp;|&nbsp; {member.occupation || '—'}</td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* Section II: Capital & Equity */}
          <div className="pt-2">
            <div className="font-bold text-[12.5pt] uppercase border-b border-black pb-1 mb-2">
              II. TÌNH HÌNH VỐN GÓP VÀ QUYỀN LỢI ĐIỀU LỆ (LUẬT HTX 2023)
            </div>
            <table className="w-full border-collapse text-[11.5pt] border border-slate-700">
              <thead>
                <tr className="bg-slate-100 border-b border-slate-700">
                  <th className="p-2 text-left font-bold w-1/2 border-r border-slate-600">Chỉ tiêu Quản lý Vốn Điều lệ</th>
                  <th className="p-2 text-left font-bold w-1/2">Giá trị ghi nhận</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-b border-slate-600">
                  <td className="p-2 border-r border-slate-600">Phân loại tư cách xã viên:</td>
                  <td className="p-2 font-bold">{memberTypeLabel}</td>
                </tr>
                <tr className="border-b border-slate-600">
                  <td className="p-2 border-r border-slate-600">Tổng mức vốn cam kết góp:</td>
                  <td className="p-2 font-bold">{(member.committed_capital || 0).toLocaleString('vi-VN')} ₫</td>
                </tr>
                <tr className="border-b border-slate-600">
                  <td className="p-2 border-r border-slate-600">Số vốn thực tế đã nộp (Lũy kế):</td>
                  <td className="p-2 font-bold text-emerald-800">
                    {(member.contributed_capital || member.total_capital_contributed || 0).toLocaleString('vi-VN')} ₫
                  </td>
                </tr>
                <tr className="border-b border-slate-600">
                  <td className="p-2 border-r border-slate-600">Số vốn còn phải góp tiếp:</td>
                  <td className="p-2">
                    {member.remaining_capital > 0
                      ? `${member.remaining_capital.toLocaleString('vi-VN')} ₫`
                      : '0 ₫ (Đã hoàn tất 100%)'}
                  </td>
                </tr>
                <tr className="border-b border-slate-600">
                  <td className="p-2 border-r border-slate-600">Số tiền bằng chữ:</td>
                  <td className="p-2 italic">{member.capital_in_words || '—'}</td>
                </tr>
                <tr className="border-b border-slate-600">
                  <td className="p-2 border-r border-slate-600">Số cổ phần điều lệ / Tỷ lệ sở hữu:</td>
                  <td className="p-2 font-bold">
                    {(member.total_shares_held || 0).toLocaleString('vi-VN')} Cổ phần ({member.ownership_percentage || 0}%)
                  </td>
                </tr>
                <tr>
                  <td className="p-2 border-r border-slate-600">Hình thức góp vốn:</td>
                  <td className="p-2">{member.capital_form === 'TIEN_MAT' ? 'Tiền mặt / Chuyển khoản' : 'Hiện vật / Quyền sử dụng đất'}</td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* Section III: Bank Account */}
          <div className="pt-2">
            <div className="font-bold text-[12.5pt] uppercase border-b border-black pb-1 mb-2">
              III. TÀI KHOẢN NGÂN HÀNG THỤ HƯỞNG CỔ TỨC &amp; THẶNG DƯ
            </div>
            <table className="w-full border-collapse text-[11.5pt] border border-slate-700">
              <tbody>
                <tr className="border-b border-slate-600">
                  <td className="w-1/3 p-2 font-bold bg-slate-100 border-r border-slate-600">Ngân hàng thụ hưởng:</td>
                  <td className="w-2/3 p-2">{member.bank_name || '—'}</td>
                </tr>
                <tr className="border-b border-slate-600">
                  <td className="p-2 font-bold bg-slate-100 border-r border-slate-600">Số tài khoản ngân hàng:</td>
                  <td className="p-2 font-mono font-bold">{member.bank_account || '—'}</td>
                </tr>
                <tr className="border-b border-slate-600">
                  <td className="p-2 font-bold bg-slate-100 border-r border-slate-600">Tên chủ tài khoản:</td>
                  <td className="p-2 font-bold uppercase">{member.account_holder || member.full_name}</td>
                </tr>
                <tr>
                  <td className="p-2 font-bold bg-slate-100 border-r border-slate-600">Hình thức thanh toán:</td>
                  <td className="p-2">{member.payout_method === 'BANK_TRANSFER' ? 'Chuyển khoản trực tiếp' : 'Nhận tiền mặt tại quỹ HTX'}</td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* Section IV: Farming & Output */}
          <div className="pt-2">
            <div className="font-bold text-[12.5pt] uppercase border-b border-black pb-1 mb-2">
              IV. NĂNG LỰC CUNG ỨNG NÔNG SẢN &amp; NGHĨA VỤ CÔNG NỢ
            </div>
            <table className="w-full border-collapse text-[11.5pt] border border-slate-700">
              <tbody>
                <tr className="border-b border-slate-600">
                  <td className="w-1/3 p-2 font-bold bg-slate-100 border-r border-slate-600">Sản lượng cung ứng / năm:</td>
                  <td className="w-2/3 p-2 font-bold">
                    {(member.annual_product_output_kg || 0).toLocaleString('vi-VN')} kg nông sản OCOP/năm
                  </td>
                </tr>
                <tr className="border-b border-slate-600">
                  <td className="p-2 font-bold bg-slate-100 border-r border-slate-600">Quy trình sản xuất áp dụng:</td>
                  <td className="p-2">{member.farming_method || '—'}</td>
                </tr>
                <tr className="border-b border-slate-600">
                  <td className="p-2 font-bold bg-slate-100 border-r border-slate-600">Dư nợ vật tư hiện tại:</td>
                  <td className="p-2">
                    {(member.current_debt || 0) > 0
                      ? `${member.current_debt.toLocaleString('vi-VN')} ₫ (Cấn trừ vào tiền bán nông sản)`
                      : '0 ₫ (Không có dư nợ)'}
                  </td>
                </tr>
                <tr>
                  <td className="p-2 font-bold bg-slate-100 border-r border-slate-600">Ngày chính thức gia nhập:</td>
                  <td className="p-2 font-bold">{formatDateDisplay(member.join_date)}</td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* Date & Signatures */}
          <div className="pt-4 text-right italic text-[11pt]">
            {dateStr}
          </div>

          <table className="w-full border-collapse mt-3 text-center text-[11pt]">
            <tbody>
              <tr>
                <td className="w-1/3 align-top">
                  <div className="font-bold uppercase text-[11pt]">XÃ VIÊN KÊ KHAI</div>
                  <div className="text-[10pt] italic">(Ký và ghi rõ họ tên)</div>
                  <div className="h-20"></div>
                  <div className="font-bold uppercase text-[11.5pt]">{member.full_name}</div>
                </td>
                <td className="w-1/3 align-top">
                  <div className="font-bold uppercase text-[11pt]">KẾ TOÁN TRƯỞNG</div>
                  <div className="text-[10pt] italic">(Ký và ghi rõ họ tên)</div>
                  <div className="h-20"></div>
                  <div className="font-bold text-[11.5pt]">{activeCooperative?.chief_accountant || '(Ký, ghi rõ họ tên)'}</div>
                </td>
                <td className="w-1/3 align-top">
                  <div className="font-bold uppercase text-[11pt]">TM. HỘI ĐỒNG QUẢN TRỊ</div>
                  <div className="text-[10pt] italic">(Ký tên và đóng dấu)</div>
                  <div className="h-20"></div>
                  <div className="font-bold uppercase text-[11.5pt]">
                    {activeCooperative?.representative_name || 'GIÁM ĐỐC HTX'}
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* Footer (Hidden on print) - Trio Actions */}
        <div className="p-3 bg-slate-100 border-t border-slate-300 flex justify-between items-center shrink-0 print:hidden">
          <span className="text-xs text-slate-500 font-medium">
            Tài liệu lưu trữ nội bộ theo Luật Hợp tác xã số 17/2023/QH15 &bull; Chuẩn in A4
          </span>
          <div className="flex items-center gap-2">
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
              className="px-3.5 py-1.5 bg-slate-200 hover:bg-slate-300 text-slate-800 font-bold text-xs rounded-lg transition-colors cursor-pointer"
            >
              Đóng
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
