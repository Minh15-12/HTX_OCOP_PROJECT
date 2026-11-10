import React from 'react';
import { OcopDossier } from '../../../../services/ocopService';

interface BangTongHopHoiDongPrintViewProps {
  dossier: OcopDossier;
}

export const BangTongHopHoiDongPrintView: React.FC<BangTongHopHoiDongPrintViewProps> = ({ dossier }) => {
  const currentDate = new Date();
  const day = currentDate.getDate().toString().padStart(2, '0');
  const month = (currentDate.getMonth() + 1).toString().padStart(2, '0');
  const year = currentDate.getFullYear();

  const councilMembers = [
    { stt: 1, name: 'TS. Nguyễn Văn Hùng', role: 'Phó GĐ Sở NN&PTNT - Phó CT Hội đồng', score: 98.5, vote: 'Đồng ý 4 sao' },
    { stt: 2, name: 'ThS. Lê Hoàng Yến', role: 'Chi cục trưởng Chi cục QLCL NLS & Thủy sản', score: 98.0, vote: 'Đồng ý 4 sao' },
    { stt: 3, name: 'KS. Trần Minh Tuấn', role: 'Trưởng phòng Kỹ thuật - Sở Khoa học & Công nghệ', score: 99.0, vote: 'Đồng ý 4 sao' },
    { stt: 4, name: 'ThS. Phạm Quốc Bảo', role: 'Phó Phòng Xúc tiến Thương mại - Sở Công Thương', score: 98.5, vote: 'Đồng ý 4 sao' },
    { stt: 5, name: 'Bà Đặng Thị Mai', role: 'Chuyên viên Chi cục Bảo vệ Môi trường - Sở TN&MT', score: 98.0, vote: 'Đồng ý 4 sao' },
    { stt: 6, name: 'Ông Vũ Đình Nam', role: 'Phó Trưởng phòng NN&PTNT Huyện', score: 99.0, vote: 'Đồng ý 4 sao' },
    { stt: 7, name: 'TS. Trịnh Xuân Hòa', role: 'Viện Nghiên cứu Nông nghiệp', score: 98.5, vote: 'Đồng ý 4 sao' },
  ];

  return (
    <div className="nd30-document nd30-a4-page text-[13pt] text-black">
      {/* 2-Column Administrative Header */}
      <table className="w-full border-none mb-3" style={{ borderCollapse: 'collapse' }}>
        <tbody>
          <tr>
            <td className="w-1/2 align-top text-center p-0">
              <p className="text-[12pt] uppercase tracking-tight">HỘI ĐỒNG ĐÁNH GIÁ, PHÂN HẠNG</p>
              <p className="text-[12pt] font-bold uppercase tracking-tight">SẢN PHẨM OCOP</p>
              <div className="w-32 border-b border-black mx-auto mt-1 mb-1"></div>
              <p className="text-[12pt] text-slate-800">Số: 15/BB-HĐOCOP</p>
            </td>
            <td className="w-1/2 align-top text-center p-0">
              <p className="text-[12pt] font-bold uppercase tracking-tight">CỘNG HÒA XÃ HỘI CHỦ NGHĨA VIỆT NAM</p>
              <p className="text-[13pt] font-bold tracking-normal">Độc lập - Tự do - Hạnh phúc</p>
              <div className="w-40 border-b border-black mx-auto mt-1 mb-2"></div>
              <p className="text-[13pt] italic">Ngày {day} tháng {month} năm {year}</p>
            </td>
          </tr>
        </tbody>
      </table>

      {/* Document Title */}
      <div className="text-center my-4 space-y-1">
        <h2 className="text-[14pt] font-bold uppercase tracking-tight">
          BẢNG TỔNG HỢP KẾT QUẢ ĐÁNH GIÁ, PHÂN HẠNG SẢN PHẨM OCOP
        </h2>
        <p className="text-[13pt] font-bold uppercase tracking-tight text-slate-900">
          ĐỢT 1 NĂM 2025
        </p>
      </div>

      {/* Product Summary */}
      <div className="my-3 p-3 border border-black text-[12.5pt] space-y-1">
        <p><strong>Tên sản phẩm:</strong> {dossier.productName}</p>
        <p><strong>Chủ thể sản xuất:</strong> {dossier.subjectName}</p>
        <p><strong>Địa chỉ:</strong> {dossier.address}</p>
        <p><strong>Ngày họp thẩm định Hội đồng:</strong> 25/05/2025 tại Sở Nông nghiệp & PTNT Tỉnh Lâm Đồng</p>
      </div>

      {/* Council Members Evaluation Table */}
      <div className="my-3">
        <p className="font-bold text-[13pt] mb-1.5">Kết quả chấm điểm của các thành viên Hội đồng:</p>
        <table className="w-full border-collapse border border-black text-[12pt]">
          <thead>
            <tr className="font-bold bg-slate-50">
              <th className="border border-black p-1.5 text-center w-12">STT</th>
              <th className="border border-black p-1.5 text-center">Họ và tên thành viên</th>
              <th className="border border-black p-1.5 text-center">Chức vụ / Cơ quan công tác</th>
              <th className="border border-black p-1.5 text-center w-24">Điểm chấm</th>
              <th className="border border-black p-1.5 text-center w-32">Ý kiến biểu quyết</th>
            </tr>
          </thead>
          <tbody>
            {councilMembers.map((m) => (
              <tr key={m.stt}>
                <td className="border border-black p-1.5 text-center">{m.stt}</td>
                <td className="border border-black p-1.5 font-bold">{m.name}</td>
                <td className="border border-black p-1.5 text-[11pt]">{m.role}</td>
                <td className="border border-black p-1.5 text-center font-bold">{m.score.toFixed(1)}</td>
                <td className="border border-black p-1.5 text-center text-emerald-800 font-bold">{m.vote}</td>
              </tr>
            ))}
            <tr className="font-bold bg-slate-50">
              <td className="border border-black p-1.5 text-center uppercase" colSpan={3}>
                ĐIỂM TRUNG BÌNH CỘNG CỦA HỘI ĐỒNG
              </td>
              <td className="border border-black p-1.5 text-center text-[13pt] text-emerald-900">
                98.5
              </td>
              <td className="border border-black p-1.5 text-center text-emerald-900">
                100% NHẤT TRÍ
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* Council Conclusion */}
      <div className="my-4 text-[12.5pt] space-y-1.5">
        <p><strong>Kết luận của Hội đồng đánh giá, phân hạng sản phẩm OCOP Tỉnh:</strong></p>
        <p className="text-justify indent-8">
          1. Sản phẩm <strong>{dossier.productName}</strong> của <strong>{dossier.subjectName}</strong> đạt điểm trung bình <strong>98.5 / 100 điểm</strong>, đáp ứng toàn diện các tiêu chí bắt buộc theo Quyết định số 148/QĐ-TTg ngày 24/02/2023 của Thủ tướng Chính phủ.
        </p>
        <p className="text-justify indent-8">
          2. 100% (7/7) thành viên Hội đồng có mặt biểu quyết thống nhất trình Ủy ban nhân dân Tỉnh Lâm Đồng ban hành Quyết định công nhận sản phẩm đạt <strong>HẠNG 4 SAO OCOP NĂM 2025</strong>.
        </p>
      </div>

      {/* Signatures */}
      <table className="w-full border-none mt-6" style={{ borderCollapse: 'collapse' }}>
        <tbody>
          <tr>
            <td className="w-1/2 align-top text-center p-0">
              <p className="font-bold text-[12pt] uppercase">THƯ KÝ HỘI ĐỒNG</p>
              <p className="italic text-[11.5pt]">(Ký, ghi rõ họ tên)</p>
              <div className="h-20"></div>
              <p className="font-bold text-[12pt] uppercase">LÊ HOÀNG YẾN</p>
            </td>
            <td className="w-1/2 align-top text-center p-0">
              <p className="font-bold text-[13pt] uppercase">TM. HỘI ĐỒNG</p>
              <p className="font-bold text-[13pt] uppercase">CHỦ TỊCH HỘI ĐỒNG</p>
              <p className="italic text-[12pt]">(Ký tên và đóng dấu)</p>
              <div className="h-20 flex items-center justify-center">
                <div className="w-24 h-24 border-2 border-red-600/40 rounded-full flex flex-col items-center justify-center text-red-600/60 text-[8.5pt] font-bold select-none rotate-[-6deg]">
                  <span>UBND TỈNH LÂM ĐỒNG</span>
                  <span className="text-[7.5pt]">HỘI ĐỒNG OCOP</span>
                  <span>25/05/2025</span>
                </div>
              </div>
              <p className="font-bold text-[13pt] uppercase">PHẠM S</p>
              <p className="text-[11.5pt] text-slate-700">Phó Chủ tịch UBND Tỉnh Lâm Đồng</p>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  );
};
