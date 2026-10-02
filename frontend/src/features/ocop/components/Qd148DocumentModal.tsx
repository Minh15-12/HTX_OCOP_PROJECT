import React, { useState } from 'react';
import { X, Printer, Download, FileText, CheckCircle2, ShieldCheck, Star } from 'lucide-react';
import { OcopDossier } from '../../../services/ocopService';

interface Qd148DocumentModalProps {
  isOpen: boolean;
  onClose: () => void;
  dossier: OcopDossier;
}

export const Qd148DocumentModal: React.FC<Qd148DocumentModalProps> = ({ isOpen, onClose, dossier }) => {
  const [activeForm, setActiveForm] = useState<'bieu01' | 'bieu02' | 'bieu03' | 'phieucham' | 'bangtonghop'>('bieu01');

  if (!isOpen) return null;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 animate-fade-in">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-4xl max-h-[90vh] flex flex-col overflow-hidden">
        {/* Modal Header */}
        <div className="px-6 py-4 bg-emerald-900 text-white flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <FileText className="w-5 h-5 text-amber-400" />
            <div>
              <h3 className="font-extrabold text-base tracking-tight">
                Xuất & Xem trước Biểu mẫu QĐ 148/QĐ-TTg
              </h3>
              <p className="text-[12px] text-emerald-200">
                Sản phẩm: {dossier.productName} ({dossier.code})
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="px-3 py-1.5 bg-emerald-700 hover:bg-emerald-600 font-bold text-[12.5px] rounded-lg text-white transition-colors flex items-center gap-1.5"
            >
              <Printer className="w-4 h-4" /> In / PDF
            </button>
            <button
              onClick={onClose}
              className="p-1.5 text-emerald-200 hover:text-white rounded-lg transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Tab Selection Bar */}
        <div className="flex flex-wrap bg-slate-100 border-b border-slate-200 px-4 pt-2 gap-1 text-[12.5px] font-bold text-slate-700">
          <button
            onClick={() => setActiveForm('bieu01')}
            className={`py-2 px-3 rounded-t-lg transition-colors ${
              activeForm === 'bieu01' ? 'bg-white text-emerald-800 shadow-xs' : 'hover:bg-slate-200/70'
            }`}
          >
            Biểu số 01 (Phiếu đăng ký)
          </button>
          <button
            onClick={() => setActiveForm('bieu02')}
            className={`py-2 px-3 rounded-t-lg transition-colors ${
              activeForm === 'bieu02' ? 'bg-white text-emerald-800 shadow-xs' : 'hover:bg-slate-200/70'
            }`}
          >
            Biểu số 02 (Báo cáo tự đánh giá)
          </button>
          <button
            onClick={() => setActiveForm('bieu03')}
            className={`py-2 px-3 rounded-t-lg transition-colors ${
              activeForm === 'bieu03' ? 'bg-white text-emerald-800 shadow-xs' : 'hover:bg-slate-200/70'
            }`}
          >
            Biểu số 03 (Xác nhận UBND Xã)
          </button>
          <button
            onClick={() => setActiveForm('phieucham')}
            className={`py-2 px-3 rounded-t-lg transition-colors ${
              activeForm === 'phieucham' ? 'bg-white text-emerald-800 shadow-xs' : 'hover:bg-slate-200/70'
            }`}
          >
            Phiếu chấm điểm HĐ
          </button>
          <button
            onClick={() => setActiveForm('bangtonghop')}
            className={`py-2 px-3 rounded-t-lg transition-colors ${
              activeForm === 'bangtonghop' ? 'bg-white text-emerald-800 shadow-xs' : 'hover:bg-slate-200/70'
            }`}
          >
            Bảng tổng hợp điểm HĐ
          </button>
        </div>

        {/* Form Body Preview Container */}
        <div className="flex-1 overflow-y-auto p-8 bg-slate-50 font-serif text-slate-900 text-[13px] leading-relaxed">
          {/* BIỂU SỐ 01 */}
          {activeForm === 'bieu01' && (
            <div className="bg-white p-8 border border-slate-300 shadow-sm max-w-3xl mx-auto space-y-4 font-sans">
              <div className="text-center font-bold">
                <p className="uppercase text-sm">CỘNG HÒA XÃ HỘI CHỦ NGHĨA VIỆT NAM</p>
                <p className="text-xs">Độc lập - Tự do - Hạnh phúc</p>
                <div className="w-24 border-b border-slate-400 mx-auto my-2"></div>
              </div>

              <div className="text-right text-xs italic text-slate-600">
                Biểu số 01 (Ban hành kèm QĐ 148/QĐ-TTg ngày 24/02/2023)
              </div>

              <h2 className="text-center font-extrabold text-base uppercase text-emerald-950 pt-2">
                PHIẾU ĐĂNG KÝ ĐÁNH GIÁ, PHÂN HẠNG SẢN PHẨM OCOP
              </h2>

              <div className="space-y-2 text-[13px]">
                <p><strong>1. Tên đơn vị đăng ký:</strong> {dossier.submittedBy}</p>
                <p><strong>2. Người đại diện pháp luật:</strong> Nguyễn Văn Tân - Chức vụ: Giám đốc HTX</p>

                <p><strong>3. Địa chỉ liên hệ:</strong> {dossier.address}</p>

                <p><strong>4. Tên sản phẩm đăng ký:</strong> <span className="font-extrabold text-emerald-900">{dossier.productName}</span></p>
                <p><strong>5. Phân nhóm sản phẩm:</strong> {dossier.productCategory}</p>

                <p><strong>6. Lần đăng ký:</strong> Lần đầu ☑ &nbsp;&nbsp; Nâng hạng ☐ &nbsp;&nbsp; Tái đánh giá ☐</p>
                <p><strong>7. Mức hạng sao mục tiêu đăng ký:</strong> {dossier.targetStar} Sao OCOP</p>
              </div>

              <div className="pt-6 grid grid-cols-2 text-center text-xs gap-4">
                <div>
                  <p className="font-bold">CƠ QUAN TIẾP NHẬN CẤP XÃ/HUYỆN</p>
                  <p className="italic text-slate-500">(Ký, đóng dấu xác nhận)</p>
                </div>
                <div>
                  <p className="font-bold">ĐẠI DIỆN CHỦ THỂ HTX</p>
                  <p className="italic text-slate-500">(Ký, ghi rõ họ tên và đóng dấu)</p>
                </div>
              </div>
            </div>
          )}

          {/* BIỂU SỐ 02 */}
          {activeForm === 'bieu02' && (
            <div className="bg-white p-8 border border-slate-300 shadow-sm max-w-3xl mx-auto space-y-4 font-sans">
              <div className="text-right text-xs italic text-slate-600">
                Biểu số 02 (Ban hành kèm QĐ 148/QĐ-TTg)
              </div>

              <h2 className="text-center font-extrabold text-base uppercase text-emerald-950">
                BÁO CÁO TỰ ĐÁNH GIÁ SẢN PHẨM OCOP
              </h2>

              <div className="space-y-3">
                <h3 className="font-bold text-emerald-900 border-b pb-1">I. THÔNG TIN CHUNG CHỦ THỂ & SẢN PHẨM</h3>
                <p>&bull; <strong>Chủ thể:</strong> {dossier.submittedBy}</p>
                <p>&bull; <strong>Sản phẩm:</strong> {dossier.productName}</p>
                <p>&bull; <strong>Tiêu chuẩn quản lý:</strong> Đạt chứng nhận VietGAP (Mã số: VietGAP-LĐ-2026-08)</p>

                <h3 className="font-bold text-emerald-900 border-b pb-1 pt-2">II. KẾT QUẢ TỰ CHẤM ĐIỂM THEO BỘ TIÊU CHÍ</h3>
                <div className="p-3 bg-emerald-50 rounded-lg text-emerald-900 font-extrabold text-center text-sm">
                  Tổng điểm tự chấm: {dossier.selfScore} / 100 điểm &bull; Phân hạng dự kiến: OCOP {dossier.targetStar} SAO
                </div>
                <ul className="list-disc pl-5 text-xs space-y-1 text-slate-700">
                  <li>Phần A (Sản phẩm & Cộng đồng): 36.0 / 40.0 điểm</li>
                  <li>Phần B (Khả năng Tiếp thị): 21.5 / 25.0 điểm</li>
                  <li>Phần C (Chất lượng Sản phẩm): 31.0 / 35.0 điểm</li>
                </ul>
              </div>
            </div>
          )}

          {/* BIỂU SỐ 03 */}
          {activeForm === 'bieu03' && (
            <div className="bg-white p-8 border border-slate-300 shadow-sm max-w-3xl mx-auto space-y-4 font-sans">
              <div className="text-right text-xs italic text-slate-600">
                Biểu số 03 (Ban hành kèm QĐ 148/QĐ-TTg)
              </div>

              <h2 className="text-center font-extrabold text-base uppercase text-emerald-950">
                BÁO CÁO ĐÁNH GIÁ CỦA UBND CẤP XÃ
              </h2>

              <div className="space-y-3 text-[12.8px]">
                <p><strong>UBND Xã:</strong> UBND Xã Tân Tiến, Huyện Đức Trọng, Tỉnh Lâm Đồng</p>
                <p><strong>Xác nhận thông tin thực tế cho sản phẩm:</strong> {dossier.productName}</p>

                <div className="p-4 bg-slate-50 border rounded-lg space-y-2">
                  <p>1. <strong>Nguồn gốc nguyên liệu địa phương:</strong> Sử dụng 100% diện tích ớt chuông trồng thực tế trên địa bàn Xã Tân Tiến.</p>
                  <p>2. <strong>Lao động địa phương:</strong> HTX sử dụng 165 lao động thường xuyên là người dân địa phương.</p>
                  <p>3. <strong>Bản sắc & Trí tuệ địa phương:</strong> Phát huy thế mạnh nông nghiệp công nghệ cao của vùng đất Lâm Đồng.</p>
                </div>
              </div>

              <div className="pt-6 text-right font-bold text-xs">
                <p>TM. UỶ BAN NHÂN DÂN XÃ TÂN TIẾN</p>
                <p className="italic font-normal text-slate-500">(Đã ký tên & đóng dấu xác nhận)</p>
              </div>
            </div>
          )}

          {/* PHIẾU CHẤM ĐIỂM */}
          {activeForm === 'phieucham' && (
            <div className="bg-white p-8 border border-slate-300 shadow-sm max-w-3xl mx-auto space-y-4 font-sans text-xs">
              <h2 className="text-center font-extrabold text-sm uppercase text-slate-900">
                PHIẾU CHẤM ĐIỂM ĐỘC LẬP THÀNH VIÊN HỘI ĐỒNG (BLIND SCORING)
              </h2>
              <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg text-blue-900">
                <strong>Thành viên Giám khảo:</strong> TS. Nguyễn Văn Hùng &bull; Chức vụ: Trưởng Ban Thẩm định
              </div>
              <table className="w-full border-collapse border border-slate-300 text-left">
                <thead>
                  <tr className="bg-slate-100">
                    <th className="border p-2">Mã TC</th>
                    <th className="border p-2">Tên Tiêu chí</th>
                    <th className="border p-2 text-center">Tối đa</th>
                    <th className="border p-2 text-center">Điểm chấm</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td className="border p-2">TC-A.1.1</td>
                    <td className="border p-2">Nguyên liệu địa phương (100%)</td>
                    <td className="border p-2 text-center">7</td>
                    <td className="border p-2 text-center font-bold text-emerald-700">7.0</td>
                  </tr>
                  <tr>
                    <td className="border p-2">TC-A.3.1</td>
                    <td className="border p-2">Chứng nhận VietGAP còn hiệu lực</td>
                    <td className="border p-2 text-center">5</td>
                    <td className="border p-2 text-center font-bold text-emerald-700">5.0</td>
                  </tr>
                </tbody>
              </table>
            </div>
          )}

          {/* BẢNG TỔNG HỢP */}
          {activeForm === 'bangtonghop' && (
            <div className="bg-white p-8 border border-slate-300 shadow-sm max-w-3xl mx-auto space-y-4 font-sans text-xs">
              <h2 className="text-center font-extrabold text-sm uppercase text-slate-900">
                BẢNG TỔNG HỢP ĐIỂM CHẤM HỘI ĐỒNG ĐÁNH GIÁ OCOP TỈNH LÂM ĐỒNG
              </h2>
              <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg text-amber-900 text-center font-bold">
                ĐIỂM TRUNG BÌNH CỘNG HỘI ĐỒNG: 86.5 / 100 ĐIỂM &bull; CÔNG NHẬN OCOP 4 SAO
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
