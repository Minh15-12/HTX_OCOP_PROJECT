import React from 'react';
import { OcopDossier } from '../../../../services/ocopService';

interface BieuMau01PrintViewProps {
  dossier: OcopDossier;
}

export const BieuMau01PrintView: React.FC<BieuMau01PrintViewProps> = ({ dossier }) => {
  const currentDate = new Date();
  const day = currentDate.getDate().toString().padStart(2, '0');
  const month = (currentDate.getMonth() + 1).toString().padStart(2, '0');
  const year = currentDate.getFullYear();

  return (
    <div className="nd30-document nd30-a4-page text-[13pt] text-black">
      {/* Reference Header */}
      <div className="text-right text-[11pt] italic text-slate-700 mb-1">
        BIỂU SỐ 1: PHIẾU ĐĂNG KÝ ĐÁNH GIÁ, PHÂN HẠNG SẢN PHẨM OCOP
        <br />
        <span className="text-[10pt]">(Ban hành kèm theo Quyết định số 148/QĐ-TTg ngày 24/02/2023 của Thủ tướng Chính phủ)</span>
      </div>

      {/* 2-Column Administrative Header */}
      <table className="w-full border-none mb-4" style={{ borderCollapse: 'collapse' }}>
        <tbody>
          <tr>
            <td className="w-[45%] align-top text-center p-0">
              <p className="text-[12pt] font-bold uppercase tracking-tight">
                {dossier.subjectName || 'HỢP TÁC XÃ NÔNG NGHIỆP'}
              </p>
              <div className="w-28 border-b border-black mx-auto mt-1 mb-1"></div>
              <p className="text-[12pt] text-slate-800">
                Số: {dossier.code ? `${dossier.code}/PĐK-OCOP` : '15/PĐK-OCOP'}
              </p>
            </td>
            <td className="w-[55%] align-top text-center p-0">
              <p className="text-[12pt] font-bold uppercase tracking-tight">
                CỘNG HÒA XÃ HỘI CHỦ NGHĨA VIỆT NAM
              </p>
              <p className="text-[13pt] font-bold tracking-normal">
                Độc lập - Tự do - Hạnh phúc
              </p>
              <div className="w-40 border-b border-black mx-auto mt-1 mb-2"></div>
              <p className="text-[13pt] italic">
                Lâm Đồng, ngày {day} tháng {month} năm {year}
              </p>
            </td>
          </tr>
        </tbody>
      </table>

      {/* Document Title */}
      <div className="text-center my-5 space-y-1">
        <h2 className="text-[15pt] font-bold uppercase tracking-tight">
          PHIẾU ĐĂNG KÝ
        </h2>
        <p className="text-[13pt] font-bold">
          Tham gia đánh giá, phân hạng sản phẩm Chương trình OCOP của tỉnh Lâm Đồng năm {year}
        </p>
      </div>

      {/* Verbatim Section 1: Thông tin về đơn vị đăng ký */}
      <div className="space-y-3 text-[13pt] leading-relaxed">
        <div>
          <p className="font-bold">1. Thông tin về đơn vị đăng ký:</p>
          <div className="pl-6 space-y-1 text-[13pt]">
            <p>
              - Tên đơn vị: <strong>{dossier.subjectName}</strong>
            </p>
            <p>
              - Họ tên người đại diện pháp lý: <strong>{dossier.representative || 'Người đại diện theo pháp luật'}</strong>
            </p>
            <p>
              - Chức vụ: <strong>Giám đốc Hợp tác xã</strong>
            </p>
            <p>
              - Địa chỉ liên hệ: {dossier.address}
            </p>
            <p>
              - Điện thoại: {dossier.phone}&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;Email: {dossier.email}
            </p>
          </div>
        </div>

        {/* Verbatim Section 2: Tên sản phẩm */}
        <div>
          <p className="font-bold">2. Tên sản phẩm:</p>
          <p className="pl-6 font-bold uppercase text-[13.5pt] text-slate-900">
            {dossier.productName}
          </p>
        </div>

        {/* Verbatim Section 3: Nhóm sản phẩm đăng ký */}
        <div>
          <p className="font-bold">
            3. Nhóm sản phẩm đăng ký (Ngành, Nhóm, Phân nhóm<sup>1</sup>):
          </p>
          <div className="pl-6 text-[13pt] space-y-0.5">
            <p>- Ngành: Thực phẩm</p>
            <p>- Nhóm: Nông sản tươi sống (Rau, củ, quả tươi)</p>
            <p>- Phân nhóm: {dossier.productCategory || 'Rau, củ, quả, hạt tươi'}</p>
          </div>
        </div>

        {/* Verbatim Section 4: Lần đăng ký đánh giá */}
        <div>
          <p className="font-bold">4. Lần đăng ký đánh giá:</p>
          <div className="pl-6 flex items-center gap-8 text-[13pt] py-0.5">
            <span className="inline-flex items-center">
              <span className="inline-block w-4 h-4 border border-black text-center text-[10pt] leading-4 font-bold mr-2">X</span>
              Lần đầu
            </span>
            <span className="inline-flex items-center">
              <span className="inline-block w-4 h-4 border border-black mr-2"></span>
              Nâng hạng
            </span>
            <span className="inline-flex items-center">
              <span className="inline-block w-4 h-4 border border-black mr-2"></span>
              Đánh giá lại
            </span>
          </div>
        </div>

        {/* Verbatim Section 5: Tài liệu kèm theo */}
        <div>
          <p className="font-bold">5. Tài liệu kèm theo:</p>
          <div className="pl-6 space-y-1 text-[13pt]">
            <p>- Báo cáo tự đánh giá về sản phẩm theo Bộ tiêu chí (Biểu số 02) (01 bản gốc, 01 bản điện tử).</p>
            <p>- Báo cáo đánh giá của Ủy ban nhân dân cấp xã (Biểu số 03) (01 bản chính).</p>
            <p>- Bộ hồ sơ minh chứng số hóa 14 danh mục theo Quyết định số 148/QĐ-TTg.</p>
            <p>- Sản phẩm mẫu (số lượng): 10 khay thương phẩm tiêu chuẩn (500g/khay có dán tem mã QR GS1).</p>
          </div>
        </div>

        {/* Cam đoan */}
        <p className="text-justify indent-8 pt-1">
          Cam đoan những thông tin trong Phiếu đăng ký là đúng sự thật, chúng tôi xin cam kết tuân thủ các quy định của Chương trình OCOP về đánh giá, phân hạng sản phẩm OCOP, chịu trách nhiệm trước Hội đồng và pháp luật về Hồ sơ đăng ký đánh giá, phân hạng sản phẩm.
        </p>

        {/* Footnote */}
        <div className="text-[10pt] text-slate-600 pt-1">
          <p>___________________</p>
          <p><sup>1</sup> Theo Phụ lục I về Danh mục phân loại sản phẩm tham gia Chương trình OCOP.</p>
        </div>
      </div>

      {/* Signature Table */}
      <table className="w-full border-none mt-5" style={{ borderCollapse: 'collapse' }}>
        <tbody>
          <tr>
            <td className="w-1/2"></td>
            <td className="w-1/2 align-top text-center p-0">
              <p className="italic text-[13pt]">
                Lâm Đồng, ngày {day} tháng {month} năm {year}
              </p>
              <p className="font-bold text-[13pt] uppercase mt-1">
                ĐẠI DIỆN ĐƠN VỊ ĐĂNG KÝ
              </p>
              <p className="italic text-[12pt]">
                (Ký, đóng dấu, ghi rõ họ tên)
              </p>
              <div className="h-20 flex items-center justify-center">
                <div className="w-24 h-24 border-2 border-red-600/40 rounded-full flex flex-col items-center justify-center text-red-600/60 text-[8.5pt] font-bold select-none rotate-[-8deg]">
                  <span className="text-[8pt]">{dossier.subjectName?.substring(0, 20) || 'HTX NÔNG NGHIỆP'}</span>
                  <span className="text-[7pt]">ĐÃ KÝ SỐ</span>
                  <span>{`${day}/${month}/${year}`}</span>
                </div>
              </div>
              <p className="font-bold text-[13pt] uppercase text-black">
                {dossier.representative || 'NGUYỄN VĂN AN'}
              </p>
              <p className="text-[11.5pt] text-slate-700">Giám đốc Hợp tác xã</p>
            </td>
          </tr>
        </tbody>
      </table>

      {/* Verbatim Official Box: PHẦN DÀNH CHO CƠ QUAN QUẢN LÝ */}
      <div className="mt-8 pt-4 border-t-2 border-black">
        <h3 className="font-bold text-[13.5pt] uppercase text-center mb-3 tracking-wide">
          PHẦN DÀNH CHO CƠ QUAN QUẢN LÝ
        </h3>

        <table className="w-full border-collapse border border-black text-[12pt]">
          <tbody>
            <tr>
              <td className="w-1/2 border border-black p-3 align-top">
                <p className="font-bold text-center uppercase text-[11.5pt] mb-2">
                  DÀNH CHO CƠ QUAN QUẢN LÝ CHƯƠNG TRÌNH OCOP CẤP HUYỆN
                </p>
                <div className="space-y-1.5 text-[11.5pt]">
                  <p>Phiếu số: 04 - {year}/PĐK-58-01-{year}</p>
                  <p>Ngày nhận: 18/05/{year}</p>
                  <p>Người tiếp nhận: Lê Minh Tuấn</p>
                  <p>Chữ ký: <em>(Đã ký nhận)</em></p>
                </div>
                <div className="text-center mt-4">
                  <p className="font-bold uppercase text-[11.5pt]">CƠ QUAN TIẾP NHẬN</p>
                  <p className="italic text-[10.5pt]">(Ký, đóng dấu và ghi rõ họ tên)</p>
                  <div className="h-16"></div>
                  <p className="font-bold text-[11.5pt] uppercase">PHÒNG KINH TẾ HUYỆN</p>
                </div>
              </td>
              <td className="w-1/2 border border-black p-3 align-top">
                <p className="font-bold text-center uppercase text-[11.5pt] mb-2">
                  DÀNH CHO CƠ QUAN QUẢN LÝ CHƯƠNG TRÌNH OCOP CẤP TỈNH
                </p>
                <div className="space-y-1.5 text-[11.5pt]">
                  <p>Phiếu số: 02 - {year}/PĐK-58-00-{year}</p>
                  <p>Ngày nhận: 22/05/{year}</p>
                  <p>Người tiếp nhận: Trần Quốc Bảo</p>
                  <p>Chữ ký: <em>(Đã ký nhận)</em></p>
                </div>
                <div className="text-center mt-4">
                  <p className="font-bold uppercase text-[11.5pt]">CƠ QUAN TIẾP NHẬN</p>
                  <p className="italic text-[10.5pt]">(Ký, đóng dấu và ghi rõ họ tên)</p>
                  <div className="h-16"></div>
                  <p className="font-bold text-[11.5pt] uppercase">CHI CỤC PHÁT TRIỂN NÔNG THÔN</p>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
};
