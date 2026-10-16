import React, { useState } from 'react';
import { X, Printer, FileText, CheckCircle2 } from 'lucide-react';
import { OcopDossier } from '../../../services/ocopService';
import { BieuMau01PrintView } from './print/BieuMau01PrintView';
import { BieuMau02PrintView } from './print/BieuMau02PrintView';
import { BieuMau03PrintView } from './print/BieuMau03PrintView';

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
  const [activeForm, setActiveForm] = useState<'bieu01' | 'bieu02' | 'bieu03' | 'phieucham' | 'bangtonghop'>('bieu01');

  if (!isOpen) return null;

  const handlePrint = () => {
    window.print();
  };

  return (
    <>
      {/* Dedicated Print Stylesheet for Official A4 Vietnamese Administrative Documents */}
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
            position: absolute !important;
            left: 0 !important;
            top: 0 !important;
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
            margin: 15mm 15mm 15mm 20mm;
          }
        }
      `}</style>

      <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-2 sm:p-4 animate-fade-in modal-overlay">
        <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-5xl max-h-[92vh] flex flex-col overflow-hidden">
          {/* Modal Header (Hidden during print) */}
          <div className="no-print px-6 py-4 bg-emerald-900 text-white flex items-center justify-between shrink-0">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-800 flex items-center justify-center text-amber-400">
                <FileText className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-extrabold text-base tracking-tight text-white flex items-center gap-2">
                  Bộ Biểu mẫu Quyết định 148/QĐ-TTg & In ấn Chuẩn A4
                  <span className="text-[11px] font-mono bg-emerald-800 text-emerald-200 px-2 py-0.5 rounded-full">
                    Nghị định 30/2020/NĐ-CP
                  </span>
                </h3>
                <p className="text-xs text-emerald-200">
                  Chủ thể: <strong>HTX Tân Tiến</strong> &bull; Sản phẩm: <strong>{dossier.productName}</strong> ({dossier.code})
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handlePrint}
                className="px-4 py-2 bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-500 hover:to-emerald-400 font-black text-xs rounded-xl text-white transition-all shadow-md flex items-center gap-2 active:scale-98"
              >
                <Printer className="w-4 h-4" /> In A4 / Xuất PDF
              </button>
              <button
                type="button"
                onClick={onClose}
                className="p-2 text-emerald-200 hover:text-white hover:bg-emerald-800/80 rounded-xl transition-colors"
                title="Đóng modal"
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
              className={`py-2 px-3.5 rounded-t-xl transition-all flex items-center gap-1.5 ${
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
              className={`py-2 px-3.5 rounded-t-xl transition-all flex items-center gap-1.5 ${
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
              className={`py-2 px-3.5 rounded-t-xl transition-all flex items-center gap-1.5 ${
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
              className={`py-2 px-3.5 rounded-t-xl transition-all flex items-center gap-1.5 ${
                activeForm === 'phieucham'
                  ? 'bg-white text-emerald-900 shadow-xs font-black border-t-2 border-emerald-600'
                  : 'hover:bg-slate-200/70 text-slate-600'
              }`}
            >
              Phiếu chấm điểm HĐ
            </button>
            <button
              type="button"
              onClick={() => setActiveForm('bangtonghop')}
              className={`py-2 px-3.5 rounded-t-xl transition-all flex items-center gap-1.5 ${
                activeForm === 'bangtonghop'
                  ? 'bg-white text-emerald-900 shadow-xs font-black border-t-2 border-emerald-600'
                  : 'hover:bg-slate-200/70 text-slate-600'
              }`}
            >
              Bảng tổng hợp điểm HĐ
            </button>
          </div>

          {/* Form Body Preview Container (Contains #print-document-container for A4 clean printing) */}
          <div className="flex-1 overflow-y-auto p-4 sm:p-8 bg-slate-200/70">
            <div
              id="print-document-container"
              className="bg-white rounded-xl shadow-lg border border-slate-300 max-w-[210mm] mx-auto overflow-hidden print:rounded-none print:border-none print:shadow-none"
            >
              {/* BIỂU SỐ 01 */}
              {activeForm === 'bieu01' && <BieuMau01PrintView dossier={dossier} />}

              {/* BIỂU SỐ 02 */}
              {activeForm === 'bieu02' && <BieuMau02PrintView dossier={dossier} scores={scores} />}

              {/* BIỂU SỐ 03 */}
              {activeForm === 'bieu03' && <BieuMau03PrintView dossier={dossier} />}

              {/* PHIẾU CHẤM ĐIỂM HỘI ĐỒNG */}
              {activeForm === 'phieucham' && (
                <div className="p-8 sm:p-12 space-y-4 font-serif text-xs">
                  <div className="text-center font-bold pb-2 border-b">
                    <p className="uppercase text-[11px]">HỘI ĐỒNG ĐÁNH GIÁ, PHÂN HẠNG SẢN PHẨM OCOP TỈNH LÂM ĐỒNG</p>
                    <h2 className="text-sm uppercase text-slate-900 mt-2 font-black">
                      PHIẾU ĐÁNH GIÁ, CHẤM ĐIỂM SẢN PHẨM OCOP CỦA THÀNH VIÊN HỘI ĐỒNG
                    </h2>
                    <p className="text-[11px] italic text-slate-600 font-normal mt-0.5">
                      (Áp dụng theo Quyết định 148/QĐ-TTg ngày 24/02/2023 của Thủ tướng Chính phủ)
                    </p>
                  </div>

                  <div className="grid grid-cols-2 gap-2 p-3 bg-slate-50 border rounded-lg text-slate-800">
                    <div>
                      <p><strong>Thành viên Hội đồng:</strong> TS. Nguyễn Văn Hùng</p>
                      <p><strong>Cơ quan công tác:</strong> Sở Nông nghiệp & PTNT Lâm Đồng</p>
                    </div>
                    <div>
                      <p><strong>Sản phẩm đánh giá:</strong> Ớt chuông Sweet Palermo Đỏ Đà Lạt</p>
                      <p><strong>Chủ thể:</strong> HTX Dịch vụ Nông nghiệp Tổng hợp Tân Tiến</p>
                    </div>
                  </div>

                  <table className="w-full border-collapse border border-slate-300 text-left font-sans text-xs">
                    <thead>
                      <tr className="bg-slate-100 font-bold">
                        <th className="border p-2 w-16">Mã TC</th>
                        <th className="border p-2">Nội dung tiêu chí đánh giá</th>
                        <th className="border p-2 text-center w-20">Điểm tối đa</th>
                        <th className="border p-2 text-center w-20">Điểm chấm</th>
                        <th className="border p-2">Ý kiến nhận xét</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200">
                      <tr>
                        <td className="border p-2 font-mono font-bold">TC-A.1.1</td>
                        <td className="border p-2">Tỷ lệ nguyên liệu địa phương trong tỉnh (100% Đà Lạt/Lạc Dương)</td>
                        <td className="border p-2 text-center font-mono">10.0</td>
                        <td className="border p-2 text-center font-bold text-emerald-800 font-mono">10.0</td>
                        <td className="border p-2 text-slate-600">Đạt xuất sắc, 280 ha vùng trồng kiểm tra thực địa</td>
                      </tr>
                      <tr>
                        <td className="border p-2 font-mono font-bold">TC-C.2.1</td>
                        <td className="border p-2">Tiêu chuẩn chất lượng VietGAP còn hiệu lực đến 2027</td>
                        <td className="border p-2 text-center font-mono">10.0</td>
                        <td className="border p-2 text-center font-bold text-emerald-800 font-mono">10.0</td>
                        <td className="border p-2 text-slate-600">GCN VICB-2024-GAP-0128 chuẩn xác, có xét nghiệm dư lượng</td>
                      </tr>
                      <tr>
                        <td className="border p-2 font-mono font-bold">TC-B.1.2</td>
                        <td className="border p-2">Bao bì đóng gói khay giấy tự hủy, tem truy xuất QR GS1</td>
                        <td className="border p-2 text-center font-mono">7.0</td>
                        <td className="border p-2 text-center font-bold text-emerald-800 font-mono">7.0</td>
                        <td className="border p-2 text-slate-600">Mẫu tem quét kiểm tra thực tế hoạt động trơn tru</td>
                      </tr>
                    </tbody>
                  </table>

                  <div className="pt-6 grid grid-cols-2 text-center text-xs">
                    <div>
                      <p className="font-bold">KẾT LUẬN ĐỀ XUẤT CỦA THÀNH VIÊN HĐ</p>
                      <p className="font-bold text-emerald-800 text-sm mt-1">ĐỀ NGHỊ CÔNG NHẬN 4 SAO OCOP</p>
                    </div>
                    <div>
                      <p className="font-bold">THÀNH VIÊN HỘI ĐỒNG</p>
                      <p className="italic text-slate-500">(Ký và ghi rõ họ tên)</p>
                      <div className="h-16"></div>
                      <p className="font-bold uppercase">TS. NGUYỄN VĂN HÙNG</p>
                    </div>
                  </div>
                </div>
              )}

              {/* BẢNG TỔNG HỢP ĐIỂM HỘI ĐỒNG */}
              {activeForm === 'bangtonghop' && (
                <div className="p-8 sm:p-12 space-y-4 font-serif text-xs">
                  <div className="text-center font-bold pb-2 border-b">
                    <p className="uppercase text-[11px]">ỦY BAN NHÂN DÂN TỈNH LÂM ĐỒNG</p>
                    <p className="uppercase text-[11px]">HỘI ĐỒNG ĐÁNH GIÁ, PHÂN HẠNG SẢN PHẨM OCOP</p>
                    <h2 className="text-sm uppercase text-slate-900 mt-2 font-black">
                      BẢNG TỔNG HỢP KẾT QUẢ ĐÁNH GIÁ, PHÂN HẠNG SẢN PHẨM OCOP
                    </h2>
                  </div>

                  <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl text-center space-y-1">
                    <span className="text-xs text-slate-600">Kết quả tổng hợp điểm từ 07 thành viên Hội đồng thẩm định:</span>
                    <div className="text-xl font-black text-emerald-950 font-mono">
                      86.5 / 100 ĐIỂM &bull; XẾP HẠNG 4 SAO OCOP
                    </div>
                    <span className="text-xs font-bold text-emerald-800">
                      100% Thành viên Hội đồng biểu quyết nhất trí đề nghị UBND Tỉnh công nhận
                    </span>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
};
