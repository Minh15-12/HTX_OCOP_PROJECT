import React, { useState, useEffect } from 'react';
import * as XLSX from 'xlsx';
import { X, Printer, FileText, Download, FileSpreadsheet, Loader2 } from 'lucide-react';
import { OcopDossier } from '../../../services/ocopService';
import { useTenantContextStore } from '@/stores/tenantContextStore';
import { exportPdfFromElement } from '@/utils/pdfExportUtils';
import { BieuMau01PrintView } from './print/BieuMau01PrintView';
import { BieuMau02PrintView } from './print/BieuMau02PrintView';
import { BieuMau03PrintView } from './print/BieuMau03PrintView';
import { PhieuChamHoiDongPrintView } from './print/PhieuChamHoiDongPrintView';
import { BangTongHopHoiDongPrintView } from './print/BangTongHopHoiDongPrintView';

interface Qd148DocumentModalProps {
  isOpen: boolean;
  onClose: () => void;
  dossier: OcopDossier;
  scores?: Record<string, number>;
}

export const Qd148DocumentModal: React.FC<Qd148DocumentModalProps> = ({
  isOpen,
  onClose,
  dossier,
  scores = {},
}) => {
  const { activeCooperative } = useTenantContextStore();
  const [activeForm, setActiveForm] = useState<'bieu01' | 'bieu02' | 'bieu03' | 'phieucham' | 'bangtonghop'>('bieu01');
  const [isExportingPdf, setIsExportingPdf] = useState<boolean>(false);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handlePrint = () => {
    window.print();
  };

  const filePrefixMap = {
    bieu01: 'Bieu_So_01_Phieu_Dang_Ky_OCOP',
    bieu02: 'Bieu_So_02_Bao_Cao_Tu_Danh_Gia_OCOP',
    bieu03: 'Bieu_So_03_Xac_Nhan_UBND_Xa_OCOP',
    phieucham: 'Phieu_Cham_Diem_Hoi_Dong_OCOP',
    bangtonghop: 'Bang_Tong_Hop_Diem_Hoi_Dong_OCOP',
  };

  const handleDirectDownloadPdf = async () => {
    setIsExportingPdf(true);
    try {
      const cleanProd = (dossier.productName || 'SanPham')
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/[^a-zA-Z0-9_-]/g, '_');
      const filename = `${filePrefixMap[activeForm]}_${cleanProd}.pdf`;

      await exportPdfFromElement('print-document-container', filename, {
        margin: [15, 20, 15, 15],
      });
    } catch (err) {
      console.error('Failed to export PDF directly:', err);
      window.print();
    } finally {
      setIsExportingPdf(false);
    }
  };

  const handleExportExcel = () => {
    const wb = XLSX.utils.book_new();
    const titleMap = {
      bieu01: 'BIỂU SỐ 01: PHIẾU ĐĂNG KÝ ĐÁNH GIÁ, PHÂN HẠNG SẢN PHẨM OCOP',
      bieu02: 'BIỂU SỐ 02: BÁO CÁO TỰ ĐÁNH GIÁ SẢN PHẨM OCOP (QĐ 148 & QĐ 1489)',
      bieu03: 'BIỂU SỐ 03: BÁO CÁO ĐÁNH GIÁ CỦA ỦY BAN NHÂN DÂN CẤP XÃ',
      phieucham: 'PHIẾU ĐÁNH GIÁ, CHẤM ĐIỂM CỦA THÀNH VIÊN HỘI ĐỒNG OCOP',
      bangtonghop: 'BẢNG TỔNG HỢP KẾT QUẢ ĐÁNH GIÁ, PHÂN HẠNG SẢN PHẨM OCOP',
    };

    const cleanProd = (dossier.productName || 'SanPham')
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-zA-Z0-9_-]/g, '_');

    const rows: any[][] = [
      [titleMap[activeForm]],
      ['Căn cứ pháp lý', 'Quyết định số 148/QĐ-TTg ngày 24/02/2023 & Quyết định sửa đổi số 1489/QĐ-TTg của Thủ tướng Chính phủ'],
      ['Chủ thể OCOP', dossier.subjectName || activeCooperative?.legal_name || 'Hợp tác xã Nông nghiệp'],
      ['Sản phẩm OCOP', dossier.productName],
      ['Mã hồ sơ', dossier.code],
      ['Nhóm sản phẩm', dossier.productCategory || 'Nông sản thực phẩm'],
      ['Ngày lập / Ngày xuất', new Date().toLocaleDateString('vi-VN')],
      [],
    ];

    if (activeForm === 'bieu02' || activeForm === 'phieucham') {
      rows.push(['Mã tiêu chí', 'Nội dung chỉ tiêu', 'Điểm tự chấm / Điểm HĐ', 'Ghi chú']);
      rows.push(['TC-A.1.1', 'Nguồn nguyên liệu địa phương', scores['TC-A.1.1'] ?? 10.0, '100% nguyên liệu liên kết thành viên HTX']);
      rows.push(['TC-A.2.1', 'Quy mô sản xuất', scores['TC-A.2.1'] ?? 5.0, 'Đạt công suất vùng']);
      rows.push(['TC-A.3.1', 'Liên kết chuỗi giá trị', scores['TC-A.3.1'] ?? 10.0, 'Hợp đồng liên kết bao tiêu xã viên']);
      rows.push(['TC-A.4.1', 'Bảo vệ môi trường', scores['TC-A.4.1'] ?? 15.0, 'Xử lý chất thải đạt chuẩn']);
      rows.push(['TC-B.1.1', 'Câu chuyện sản phẩm', scores['TC-B.1.1'] ?? 8.0, 'Bản sắc văn hóa đặc trưng địa phương']);
      rows.push(['TC-B.1.2', 'Bao bì, nhãn mác', scores['TC-B.1.2'] ?? 7.0, 'Mã vạch GS1 và truy xuất QR code']);
      rows.push(['TC-B.2.1', 'Xúc tiến thương mại', scores['TC-B.2.1'] ?? 8.5, 'Kênh phân phối hiện đại và sàn TMĐT']);
      rows.push(['TC-C.1.1', 'Chất lượng cảm quan & dinh dưỡng', scores['TC-C.1.1'] ?? 10.0, 'Tiêu chuẩn VietGAP TCVN 11892-1']);
      rows.push(['TC-C.2.1', 'An toàn thực phẩm', scores['TC-C.2.1'] ?? 10.0, 'Chứng nhận ISO/HACCP/VietGAP']);
      rows.push(['TC-C.2.2', 'Kiểm nghiệm định kỳ', scores['TC-C.2.2'] ?? 5.0, 'Phiếu kiểm nghiệm đạt chuẩn']);
      rows.push(['TC-C.3.1', 'Tính độc đáo sản phẩm', scores['TC-C.3.1'] ?? 10.0, 'Giống đặc sản vùng cao']);
    } else if (activeForm === 'bangtonghop') {
      rows.push(['STT', 'Họ tên thành viên Hội đồng', 'Chức vụ', 'Điểm chấm', 'Đề xuất phân hạng']);
      rows.push([1, 'TS. Nguyễn Văn Hùng', 'Phó GĐ Sở NN&PTNT - Phó CT Hội đồng', 98.5, 'Đồng ý 4 sao']);
      rows.push([2, 'ThS. Lê Hoàng Yến', 'Chi cục trưởng Chi cục QLCL NLS & Thủy sản', 98.0, 'Đồng ý 4 sao']);
      rows.push([3, 'KS. Trần Minh Tuấn', 'Trưởng phòng Kỹ thuật - Sở Khoa học & Công nghệ', 99.0, 'Đồng ý 4 sao']);
      rows.push([4, 'ThS. Phạm Quốc Bảo', 'Phó Phòng Xúc tiến Thương mại - Sở Công Thương', 98.5, 'Đồng ý 4 sao']);
      rows.push([5, 'Bà Đặng Thị Mai', 'Chuyên viên Chi cục Bảo vệ Môi trường - Sở TN&MT', 98.0, 'Đồng ý 4 sao']);
      rows.push([6, 'Ông Vũ Đình Nam', 'Phó Trưởng phòng NN&PTNT Huyện', 99.0, 'Đồng ý 4 sao']);
      rows.push([7, 'TS. Trịnh Xuân Hòa', 'Viện Nghiên cứu Nông nghiệp', 98.5, 'Đồng ý 4 sao']);
    } else {
      rows.push(['Nội dung hồ sơ', 'Chi tiết']);
      rows.push(['Tên sản phẩm', dossier.productName]);
      rows.push(['Mục tiêu phân hạng', `${dossier.targetStar || 4} sao`]);
      rows.push(['Điểm tự đánh giá', `${dossier.totalScore || 98.5} / 100 điểm`]);
      rows.push(['Tiến độ hoàn thiện', `${dossier.progressPercent || 100}%`]);
      rows.push(['Tình trạng xác nhận', 'Đã thẩm tra đủ điều kiện theo QĐ 148 & QĐ 1489']);
    }

    const ws = XLSX.utils.aoa_to_sheet(rows);
    ws['!cols'] = [{ wch: 18 }, { wch: 45 }, { wch: 30 }, { wch: 35 }];
    XLSX.utils.book_append_sheet(wb, ws, activeForm.toUpperCase());
    XLSX.writeFile(wb, `${filePrefixMap[activeForm]}_${cleanProd}.xlsx`);
  };

  const coopName = dossier.subjectName || activeCooperative?.legal_name || 'Hợp tác xã Nông nghiệp';

  return (
    <>
      {/* Dedicated Print Stylesheet for Official A4 Vietnamese Administrative Documents (Nghị định 30/2020/NĐ-CP) */}
      <style>{`
        @media print {
          /* Hide everything in page by default */
          body * {
            visibility: hidden !important;
          }
          /* Show ONLY the document preview container */
          #print-document-container,
          #print-document-container * {
            visibility: visible !important;
          }
          #print-document-container {
            position: static !important;
            width: 100% !important;
            margin: 0 !important;
            padding: 0 !important;
            background: white !important;
            box-shadow: none !important;
            border: none !important;
            overflow: visible !important;
          }
          .modal-overlay,
          .no-print,
          nav,
          header,
          aside {
            display: none !important;
          }
          @page {
            size: A4 portrait;
            margin: 20mm 20mm 20mm 30mm; /* Nghị định 30/2020/NĐ-CP: Top 20-25mm, Right 15-20mm, Bottom 20-25mm, Left 30-35mm */
          }
        }
      `}</style>

      <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-2 sm:p-4 animate-fade-in modal-overlay">
        <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-5xl max-h-[94vh] flex flex-col overflow-hidden">
          {/* Modal Header (Hidden during print) */}
          <div className="no-print px-6 py-4 bg-emerald-900 text-white flex flex-wrap items-center justify-between gap-3 shrink-0">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-800 flex items-center justify-center text-amber-400">
                <FileText className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-extrabold text-base tracking-tight text-white flex items-center gap-2">
                  Bộ Biểu mẫu Quyết định 148/QĐ-TTg & QĐ 1489/QĐ-TTg
                  <span className="text-[11px] font-mono bg-emerald-800 text-emerald-200 px-2 py-0.5 rounded-full">
                    Nghị định 30/2020/NĐ-CP
                  </span>
                </h3>
                <p className="text-xs text-emerald-200">
                  Chủ thể: <strong>{coopName}</strong> &bull; Sản phẩm: <strong>{dossier.productName}</strong> ({dossier.code})
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleExportExcel}
                className="px-3.5 py-2 bg-emerald-800 hover:bg-emerald-700 border border-emerald-600/60 font-black text-xs rounded-xl text-white transition-all shadow-xs flex items-center gap-2 active:scale-98 cursor-pointer"
                title="Tải bảng tính Excel (.xlsx) điểm tiêu chí / biểu mẫu"
              >
                <FileSpreadsheet className="w-4 h-4 text-emerald-300" /> Tải Excel (.xlsx)
              </button>

              <button
                type="button"
                onClick={handleDirectDownloadPdf}
                disabled={isExportingPdf}
                className="px-3.5 py-2 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 font-black text-xs rounded-xl text-white transition-all shadow-md flex items-center gap-2 active:scale-98 cursor-pointer disabled:opacity-60"
                title="Tải trực tiếp file PDF về máy tính (không cần kết nối máy in)"
              >
                {isExportingPdf ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" /> Đang tạo PDF...
                  </>
                ) : (
                  <>
                    <Download className="w-4 h-4" /> Tải File PDF (.pdf)
                  </>
                )}
              </button>

              <button
                type="button"
                onClick={handlePrint}
                className="px-3.5 py-2 bg-emerald-700 hover:bg-emerald-600 border border-emerald-500/60 font-black text-xs rounded-xl text-white transition-all shadow-xs flex items-center gap-2 active:scale-98 cursor-pointer"
                title="Mở hộp thoại in trình duyệt (hỗ trợ chọn Lưu dưới dạng PDF)"
              >
                <Printer className="w-4 h-4" /> In A4 (Trình duyệt)
              </button>
              <button
                type="button"
                onClick={onClose}
                className="p-2 text-emerald-200 hover:text-white hover:bg-emerald-800/80 rounded-xl transition-colors cursor-pointer"
                title="Đóng biểu mẫu"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Tab Selection Bar (Hidden during print) */}
          <div className="no-print flex flex-wrap bg-slate-100 border-b border-slate-200 px-4 pt-2.5 gap-1.5 text-xs font-bold text-slate-700 shrink-0">
            <button
              type="button"
              onClick={() => setActiveForm('bieu01')}
              className={`py-2 px-3.5 rounded-t-xl transition-all flex items-center gap-1.5 cursor-pointer ${
                activeForm === 'bieu01'
                  ? 'bg-white text-emerald-900 shadow-xs font-black border-t-2 border-emerald-600'
                  : 'hover:bg-slate-200/70 text-slate-600'
              }`}
            >
              <span className="w-2 h-2 rounded-full bg-emerald-600"></span>
              Biểu 01: Phiếu đăng ký OCOP
            </button>
            <button
              type="button"
              onClick={() => setActiveForm('bieu02')}
              className={`py-2 px-3.5 rounded-t-xl transition-all flex items-center gap-1.5 cursor-pointer ${
                activeForm === 'bieu02'
                  ? 'bg-white text-emerald-900 shadow-xs font-black border-t-2 border-emerald-600'
                  : 'hover:bg-slate-200/70 text-slate-600'
              }`}
            >
              <span className="w-2 h-2 rounded-full bg-emerald-600"></span>
              Biểu 02: Báo cáo tự đánh giá (4 Phần + 14 MC)
            </button>
            <button
              type="button"
              onClick={() => setActiveForm('bieu03')}
              className={`py-2 px-3.5 rounded-t-xl transition-all flex items-center gap-1.5 cursor-pointer ${
                activeForm === 'bieu03'
                  ? 'bg-white text-emerald-900 shadow-xs font-black border-t-2 border-emerald-600'
                  : 'hover:bg-slate-200/70 text-slate-600'
              }`}
            >
              <span className="w-2 h-2 rounded-full bg-emerald-600"></span>
              Biểu 03: Xác nhận UBND Xã (4 Nội dung)
            </button>
            <button
              type="button"
              onClick={() => setActiveForm('phieucham')}
              className={`py-2 px-3.5 rounded-t-xl transition-all flex items-center gap-1.5 cursor-pointer ${
                activeForm === 'phieucham'
                  ? 'bg-white text-emerald-900 shadow-xs font-black border-t-2 border-emerald-600'
                  : 'hover:bg-slate-200/70 text-slate-600'
              }`}
            >
              Phiếu chấm điểm Hội đồng
            </button>
            <button
              type="button"
              onClick={() => setActiveForm('bangtonghop')}
              className={`py-2 px-3.5 rounded-t-xl transition-all flex items-center gap-1.5 cursor-pointer ${
                activeForm === 'bangtonghop'
                  ? 'bg-white text-emerald-900 shadow-xs font-black border-t-2 border-emerald-600'
                  : 'hover:bg-slate-200/70 text-slate-600'
              }`}
            >
              Bảng tổng hợp điểm Hội đồng
            </button>
          </div>

          {/* Form Body Preview Container */}
          <div className="flex-1 overflow-y-auto p-4 sm:p-8 bg-slate-200/80">
            <div id="print-document-container" data-pdf-container="true" className="break-words">
              {/* BIỂU SỐ 01 */}
              {activeForm === 'bieu01' && <BieuMau01PrintView dossier={dossier} />}

              {/* BIỂU SỐ 02 */}
              {activeForm === 'bieu02' && <BieuMau02PrintView dossier={dossier} scores={scores} />}

              {/* BIỂU SỐ 03 */}
              {activeForm === 'bieu03' && <BieuMau03PrintView dossier={dossier} />}

              {/* PHIẾU CHẤM ĐIỂM HỘI ĐỒNG */}
              {activeForm === 'phieucham' && <PhieuChamHoiDongPrintView dossier={dossier} scores={scores} />}

              {/* BẢNG TỔNG HỢP ĐIỂM HỘI ĐỒNG */}
              {activeForm === 'bangtonghop' && <BangTongHopHoiDongPrintView dossier={dossier} />}
            </div>
          </div>
        </div>
      </div>
    </>
  );
};
