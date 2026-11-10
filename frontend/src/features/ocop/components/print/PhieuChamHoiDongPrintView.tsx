import React from 'react';
import { OcopDossier } from '../../../../services/ocopService';

interface PhieuChamHoiDongPrintViewProps {
  dossier: OcopDossier;
  scores?: Record<string, number>;
}

export const PhieuChamHoiDongPrintView: React.FC<PhieuChamHoiDongPrintViewProps> = ({
  dossier,
  scores = {},
}) => {
  const getScore = (code: string, fallback: number) => scores[code] ?? fallback;
  const currentDate = new Date();
  const day = currentDate.getDate().toString().padStart(2, '0');
  const month = (currentDate.getMonth() + 1).toString().padStart(2, '0');
  const year = currentDate.getFullYear();

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
              <p className="text-[12pt] text-slate-800">Số: 08/PĐG-HĐOCOP</p>
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
          PHIẾU ĐÁNH GIÁ, CHẤM ĐIỂM SẢN PHẨM OCOP
        </h2>
        <p className="text-[13pt] font-bold uppercase tracking-tight">
          CỦA THÀNH VIÊN HỘI ĐỒNG THẨM ĐỊNH CẤP TỈNH
        </p>
        <p className="text-[12pt] italic text-slate-700">
          (Áp dụng theo Quyết định số 148/QĐ-TTg ngày 24/02/2023 của Thủ tướng Chính phủ)
        </p>
      </div>

      {/* Evaluator & Subject Information */}
      <div className="my-3 p-3 border border-black text-[12.5pt] space-y-1.5 leading-snug">
        <div className="grid grid-cols-2 gap-2">
          <p><strong>Thành viên Hội đồng:</strong> TS. Nguyễn Văn Hùng</p>
          <p><strong>Chức vụ:</strong> Phó Giám đốc Sở NN&PTNT</p>
        </div>
        <div className="grid grid-cols-2 gap-2">
          <p><strong>Cơ quan công tác:</strong> Sở Nông nghiệp & PTNT Lâm Đồng</p>
          <p><strong>Nhiệm vụ:</strong> Ủy viên Thường trực Hội đồng</p>
        </div>
        <p><strong>Tên sản phẩm thẩm định:</strong> {dossier.productName}</p>
        <p><strong>Chủ thể sản xuất:</strong> {dossier.subjectName}</p>
        <p><strong>Địa chỉ cơ sở:</strong> {dossier.address}</p>
      </div>

      {/* Evaluation Scores Table */}
      <div className="my-3">
        <p className="font-bold text-[13pt] mb-1.5">Kết quả đánh giá, chấm điểm chi tiết:</p>
        <table className="w-full border-collapse border border-black text-[12pt]">
          <thead>
            <tr className="font-bold bg-slate-50">
              <th className="border border-black p-1.5 text-center w-16">Mã TC</th>
              <th className="border border-black p-1.5 text-center">Nội dung tiêu chí đánh giá</th>
              <th className="border border-black p-1.5 text-center w-20">Điểm tối đa</th>
              <th className="border border-black p-1.5 text-center w-20">Điểm chấm</th>
              <th className="border border-black p-1.5 text-center">Ý kiến nhận xét của thành viên</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td className="border border-black p-1.5 text-center font-bold">TC-A.1.1</td>
              <td className="border border-black p-1.5">Sử dụng nguyên liệu địa phương ({'>'} 75%)</td>
              <td className="border border-black p-1.5 text-center">10.0</td>
              <td className="border border-black p-1.5 text-center font-bold">{getScore('TC-A.1.1', 10.0).toFixed(1)}</td>
              <td className="border border-black p-1.5 text-[11pt]">100% nguyên liệu canh tác tại Lâm Đồng, có hồ sơ liên kết rõ ràng.</td>
            </tr>
            <tr>
              <td className="border border-black p-1.5 text-center font-bold">TC-A.3.1</td>
              <td className="border border-black p-1.5">Liên kết chuỗi giá trị và tiêu thụ sản phẩm</td>
              <td className="border border-black p-1.5 text-center">10.0</td>
              <td className="border border-black p-1.5 text-center font-bold">{getScore('TC-A.3.1', 10.0).toFixed(1)}</td>
              <td className="border border-black p-1.5 text-[11pt]">Hợp đồng bao tiêu dài hạn với WinCommerce, Big C, Co.opmart.</td>
            </tr>
            <tr>
              <td className="border border-black p-1.5 text-center font-bold">TC-A.4.1</td>
              <td className="border border-black p-1.5">Bảo vệ môi trường trong sản xuất và sơ chế</td>
              <td className="border border-black p-1.5 text-center">15.0</td>
              <td className="border border-black p-1.5 text-center font-bold">{getScore('TC-A.4.1', 15.0).toFixed(1)}</td>
              <td className="border border-black p-1.5 text-[11pt]">Hệ thống thu gom bao gói thuốc BVTV chuẩn quy định môi trường.</td>
            </tr>
            <tr>
              <td className="border border-black p-1.5 text-center font-bold">TC-B.1.2</td>
              <td className="border border-black p-1.5">Bao bì, ghi nhãn và tem truy xuất nguồn gốc QR</td>
              <td className="border border-black p-1.5 text-center">7.0</td>
              <td className="border border-black p-1.5 text-center font-bold">{getScore('TC-B.1.2', 7.0).toFixed(1)}</td>
              <td className="border border-black p-1.5 text-[11pt]">Bao bì khay giấy tự hủy sinh học, tem QR chuẩn GS1 hoạt động tốt.</td>
            </tr>
            <tr>
              <td className="border border-black p-1.5 text-center font-bold">TC-C.2.1</td>
              <td className="border border-black p-1.5">Chứng nhận chất lượng tiên tiến (VietGAP/GlobalGAP)</td>
              <td className="border border-black p-1.5 text-center">10.0</td>
              <td className="border border-black p-1.5 text-center font-bold">{getScore('TC-C.2.1', 10.0).toFixed(1)}</td>
              <td className="border border-black p-1.5 text-[11pt]">GCN VietGAP số VICB-2024-GAP-0128 còn hiệu lực đến 2027.</td>
            </tr>
            <tr className="font-bold bg-slate-50">
              <td className="border border-black p-1.5 text-center uppercase" colSpan={2}>
                TỔNG ĐIỂM ĐÁNH GIÁ (QUY ĐỔI THANG 100)
              </td>
              <td className="border border-black p-1.5 text-center">100.0</td>
              <td className="border border-black p-1.5 text-center text-[13pt]">98.5</td>
              <td className="border border-black p-1.5 text-center">ĐẠT CHUẨN 4 SAO OCOP</td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* Conclusion & Recommendation */}
      <div className="my-4 text-[12.5pt] space-y-1">
        <p><strong>Kết luận và Đề xuất của Thành viên Hội đồng:</strong></p>
        <p className="text-justify indent-8">
          Hồ sơ đăng ký đánh giá, phân hạng sản phẩm của chủ thể đáp ứng đầy đủ tính pháp lý, chất lượng thực tế vượt trội và minh chứng số hóa minh bạch. Thống nhất đề nghị Hội đồng Đánh giá, phân hạng sản phẩm OCOP Tỉnh Lâm Đồng biểu quyết công nhận sản phẩm đạt <strong>4 SAO OCOP CẤP TỈNH</strong>.
        </p>
      </div>

      {/* Signature Section */}
      <table className="w-full border-none mt-6" style={{ borderCollapse: 'collapse' }}>
        <tbody>
          <tr>
            <td className="w-1/2 align-top text-center p-0">
              <p className="font-bold text-[12pt] uppercase">Ý KIẾN CỦA TỔ TRƯỞNG TỔ GIÚP VIỆC</p>
              <p className="italic text-[11.5pt]">(Ký, ghi rõ họ tên)</p>
              <div className="h-20"></div>
              <p className="font-bold text-[12pt] uppercase">HOÀNG ĐÌNH TRỌNG</p>
            </td>
            <td className="w-1/2 align-top text-center p-0">
              <p className="font-bold text-[13pt] uppercase">THÀNH VIÊN HỘI ĐỒNG</p>
              <p className="italic text-[12pt]">(Ký và ghi rõ họ tên)</p>
              <div className="h-20"></div>
              <p className="font-bold text-[13pt] uppercase">TS. NGUYỄN VĂN HÙNG</p>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  );
};
