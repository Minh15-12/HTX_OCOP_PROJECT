import React from 'react';
import { OcopDossier } from '../../../../services/ocopService';
import { ALL_INDICATORS } from '../../data/ocopQd148Data';

interface BieuMau02PrintViewProps {
  dossier: OcopDossier;
  scores?: Record<string, number>;
}

export const BieuMau02PrintView: React.FC<BieuMau02PrintViewProps> = ({ dossier, scores = {} }) => {
  const currentDate = new Date();
  const day = currentDate.getDate().toString().padStart(2, '0');
  const month = (currentDate.getMonth() + 1).toString().padStart(2, '0');
  const year = currentDate.getFullYear();

  const getScore = (code: string, fallback: number) => scores[code] ?? fallback;

  const partAScore =
    getScore('TC-A.1.1', 10.0) +
    getScore('TC-A.2.1', 5.0) +
    getScore('TC-A.3.1', 10.0) +
    getScore('TC-A.4.1', 15.0);

  const partBScore =
    getScore('TC-B.1.1', 8.0) +
    getScore('TC-B.1.2', 7.0) +
    getScore('TC-B.2.1', 8.5);

  const partCScore =
    getScore('TC-C.1.1', 10.0) +
    getScore('TC-C.2.1', 10.0) +
    getScore('TC-C.2.2', 5.0) +
    getScore('TC-C.3.1', 10.0);

  const totalScore = Math.round((partAScore + partBScore + partCScore) * 10) / 10;

  // Verbatim 14 Evidence Items from docx Bieu Mau 2 Table 0
  const evidenceRows = [
    {
      tt: '1',
      name: 'Giấy đăng ký kinh doanh',
      req: 'Bản sao có công chứng, chứng minh hoạt động kinh doanh hợp pháp (đối với các đơn vị/cá nhân có đăng ký kinh doanh)',
      file: 'DKKD_HTX_LamHa.pdf',
      hash: 'a1b2c3...d4e5',
    },
    {
      tt: '2',
      name: 'Giấy đủ điều kiện sản xuất',
      req: 'Bản sao có công chứng (đối với sản phẩm cần phải có giấy chứng nhận theo quy định hiện hành)',
      file: 'GCN_ATTP_VietGAP_2024.pdf',
      hash: 'e3b0c4...b855',
    },
    {
      tt: '3',
      name: 'Nguồn gốc nguyên liệu, liên kết chuỗi',
      req: 'Bản sao tài liệu: Giấy xác nhận, hợp đồng, hóa đơn... chứng minh việc mua bán nguyên vật liệu, hợp đồng, thỏa thuận liên kết',
      file: 'HopDong_LienKet_165Ho.pdf',
      hash: '8f4321...9c12',
    },
    {
      tt: '4',
      name: 'Công bố chất lượng sản phẩm',
      req: 'Bản sao tài liệu, chứng minh chất lượng sản phẩm được công bố',
      file: 'TCCS_01_2024_HTX.pdf',
      hash: '7c89a1...3b21',
    },
    {
      tt: '5',
      name: 'Phiếu kết quả kiểm tra chỉ tiêu an toàn thực phẩm theo tiêu chuẩn công bố',
      req: 'Bản sao tài liệu, chứng minh đạt tiêu chuẩn vệ sinh an toàn thực phẩm',
      file: 'Test_Quatest3_Brix_Pesticide.pdf',
      hash: '9b1122...4455',
    },
    {
      tt: '6',
      name: 'Mã số mã vạch, tem truy xuất nguồn gốc',
      req: 'Bản sao tài liệu, chứng minh mã, tem, sở hữu thương hiệu...',
      file: 'TemQR_GS1_VNTrace.pdf',
      hash: '4d5e6f...7a8b',
    },
    {
      tt: '7',
      name: 'Sở hữu trí tuệ',
      req: 'Giấy chứng nhận đăng ký về sở hữu trí tuệ: nhãn hiệu, chỉ dẫn địa lý, nhãn hiệu tập thể, nhãn hiệu chứng nhận, kiểu dáng,...',
      file: 'NhanHieu_RauDaLat_Cert.pdf',
      hash: '5e6f7a...8b9c',
    },
    {
      tt: '8',
      name: 'Bảo vệ môi trường',
      req: 'Bản sao hồ sơ, thủ tục về môi trường theo quy định; hình ảnh minh chứng về thực hiện giải pháp bảo vệ môi trường',
      file: 'KeHoach_BVMT_XaGiaLam.pdf',
      hash: '6f7a8b...9c0d',
    },
    {
      tt: '9',
      name: 'Hệ thống quản lý chất lượng tiên tiến, kiểm soát chất lượng',
      req: 'Bản sao tài liệu: chứng nhận Hệ thống quản lý chất lượng tiên tiến, chứng minh hệ thống quản lý đạt tiêu chuẩn',
      file: 'VietGAP_VICB_2024_0128.pdf',
      hash: '7a8b9c...0d1e',
    },
    {
      tt: '10',
      name: 'Kế toán',
      req: 'Bản sao tài liệu, minh chứng hoạt động kế toán của cơ sở',
      file: 'BaoCao_TaiChinh_KiemToan.pdf',
      hash: '8b9c0d...1e2f',
    },
    {
      tt: '11',
      name: 'Phát triển thị trường, hoạt động quảng bá, xúc tiến thương mại',
      req: 'Bản sao tài liệu: Hợp đồng, cam kết, xác nhận về phân phối sản phẩm, xuất khẩu sản phẩm, hoạt động xúc tiến thương mại...',
      file: 'HopDong_PhanPhoi_SieuThi.pdf',
      hash: '9c0d1e...2f3a',
    },
    {
      tt: '12',
      name: 'Câu chuyện về sản phẩm',
      req: 'Bản sao tờ rơi, hình ảnh, phim, ghi âm... minh chứng về câu chuyện của sản phẩm',
      file: 'ThuyetMinh_Story_SweetPalermo.pdf',
      hash: '0d1e2f...3a4b',
    },
    {
      tt: '13',
      name: 'Kế hoạch kiểm soát nội bộ',
      req: 'Bản sao kế hoạch kiểm soát nội bộ/Hồ sơ minh chứng về kế hoạch kiểm soát nội bộ',
      file: 'QuyTrinh_KCS_PHI_NoiBo.pdf',
      hash: '1e2f3a...4b5c',
    },
    {
      tt: '14',
      name: 'Giải thưởng của sản phẩm, bình chọn của các tổ chức uy tín trong nước và quốc tế...',
      req: 'Bản sao tài liệu, minh chứng về các thành tích, giải thưởng, bình chọn...',
      file: 'GiaiThuong_NongNghiepTieuBieu.pdf',
      hash: '2f3a4b...5c6d',
    },
  ];

  return (
    <div className="nd30-document nd30-a4-page text-[13pt] text-black">
      {/* Top Reference Note */}
      <div className="text-right text-[11pt] italic text-slate-700 mb-1">
        BIỂU SỐ 2: BÁO CÁO TỰ ĐÁNH GIÁ VỀ SẢN PHẨM
        <br />
        <span className="text-[10pt]">(Ban hành kèm theo Quyết định số 148/QĐ-TTg ngày 24/02/2023 của Thủ tướng Chính phủ)</span>
      </div>

      {/* 2-Column Administrative Header */}
      <table className="w-full border-none mb-3" style={{ borderCollapse: 'collapse' }}>
        <tbody>
          <tr>
            <td className="w-[45%] align-top text-center p-0">
              <p className="text-[12pt] font-bold uppercase tracking-tight">
                {dossier.subjectName || 'HỢP TÁC XÃ NÔNG NGHIỆP'}
              </p>
              <div className="w-28 border-b border-black mx-auto mt-1 mb-1"></div>
              <p className="text-[12pt] text-slate-800">
                Số: {dossier.code ? `${dossier.code}/BC-OCOP` : '16/BC-OCOP'}
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

      {/* Title */}
      <div className="text-center my-4 space-y-1">
        <h2 className="text-[15pt] font-bold uppercase tracking-tight">
          BÁO CÁO TỰ ĐÁNH GIÁ VỀ SẢN PHẨM
        </h2>
        <p className="text-[12pt] italic text-slate-700">
          (Dành cho chủ thể có sản phẩm đăng ký)
        </p>
      </div>

      {/* ===================== PHẦN I ===================== */}
      <div className="space-y-2 mt-4 text-[13pt]">
        <div className="text-center font-bold uppercase text-[13pt]">
          <p>Phần I</p>
          <p>THÔNG TIN CHUNG</p>
        </div>

        <div className="space-y-1.5 pl-2 leading-relaxed">
          <p>
            1. Tên chủ thể: <strong>{dossier.subjectName}</strong>
          </p>
          <p>
            2. Loại hình tổ chức: <strong>Hợp tác xã nông nghiệp</strong>
          </p>
          <p>
            3. Địa chỉ: {dossier.address}
          </p>
          <p>
            4. Điện thoại: {dossier.phone}&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;Email: {dossier.email}
          </p>
          <div>
            <p>5. Tên người đại diện pháp luật:</p>
            <div className="pl-6 space-y-0.5">
              <p>- Họ tên: <strong>{dossier.representative || 'Nguyễn Văn An'}</strong></p>
              <p>- Giới tính: Nam;&nbsp;&nbsp;&nbsp;&nbsp;Dân tộc: Kinh</p>
              <p>- Địa chỉ thường trú: {dossier.address}</p>
            </div>
          </div>
          <p>
            6. Ngày thành lập/đăng ký kinh doanh: 12/03/2019;&nbsp;&nbsp;&nbsp;&nbsp;Số giấy đăng ký: 5801345678 do UBND huyện cấp.
          </p>
          <div>
            <p>7. Tên sản phẩm/dịch vụ, mô tả về quy cách sản phẩm, tiêu chuẩn:</p>
            <p className="pl-6 text-justify">
              <strong>{dossier.productName}</strong>. Quả ớt dài 20-25cm, vỏ bóng đỏ tươi, vị ngọt thanh giòn không hăng, độ ngọt tự nhiên Brix &ge; 8.0, giàu Vitamin C. Đóng gói khay giấy sinh học 500g, dán nhãn đầy đủ thông tin TCCS 01:2024/HTX và tem mã QR GS1.
            </p>
            <p className="pl-6 italic text-[12pt] mt-1">Đánh dấu (x) vào mục tương ứng:</p>
            <div className="pl-8 space-y-1 text-[12.5pt] mt-0.5">
              <p>
                a) Giấy đăng ký kinh doanh: <span className="inline-block w-3.5 h-3.5 border border-black text-center text-[9pt] leading-3.5 font-bold mr-1">X</span>
              </p>
              <p>
                b) Đã công bố chất lượng cơ sở: <span className="inline-block w-3.5 h-3.5 border border-black text-center text-[9pt] leading-3.5 font-bold mr-1">X</span>
              </p>
              <div>
                <p>c) Đã có các điều kiện sản xuất theo quy định:</p>
                <div className="pl-6 space-y-0.5">
                  <p>
                    - Giấy đủ điều kiện vệ sinh an toàn thực phẩm theo quy định của pháp luật cho sản xuất sản phẩm: <span className="inline-block w-3.5 h-3.5 border border-black text-center text-[9pt] leading-3.5 font-bold mr-1">X</span>
                  </p>
                  <p>
                    - Giấy chứng nhận đủ điều kiện sản xuất bắt buộc theo quy định cho sản phẩm (VietGAP số VICB-2024-GAP-0128): <span className="inline-block w-3.5 h-3.5 border border-black text-center text-[9pt] leading-3.5 font-bold mr-1">X</span>
                  </p>
                </div>
              </div>
              <div>
                <p>d) Đã có đăng ký sở hữu trí tuệ:</p>
                <div className="pl-6 space-y-0.5">
                  <p>
                    - Giấy chứng nhận đăng ký nhãn hiệu: <span className="inline-block w-3.5 h-3.5 border border-black text-center text-[9pt] leading-3.5 font-bold mr-1">X</span>
                  </p>
                  <p>
                    - Giấy chứng nhận quyền sử dụng chỉ dẫn địa lý, nhãn hiệu tập thể, nhãn hiệu chứng nhận: <span className="inline-block w-3.5 h-3.5 border border-black text-center text-[9pt] leading-3.5 font-bold mr-1">X</span>
                  </p>
                  <p>
                    - Giấy chứng nhận đăng ký kiểu dáng công nghiệp: <span className="inline-block w-3.5 h-3.5 border border-black mr-1"></span>
                  </p>
                  <p>
                    - Khác (Mã số mã vạch GS1 Việt Nam): <span className="inline-block w-3.5 h-3.5 border border-black text-center text-[9pt] leading-3.5 font-bold mr-1">X</span>
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div>
            <p>8. Lịch sử hình thành của chủ thể (nêu các giai đoạn hình thành và phát triển):</p>
            <p className="pl-6 text-justify">
              Hợp tác xã thành lập năm 2019 với 22 thành viên ban đầu. Đến nay, HTX đã phát triển quy mô 165 hộ thành viên, tổng diện tích canh tác 280 ha nhà kính công nghệ cao, ứng dụng hệ thống tưới dinh dưỡng tự động và tiêu chuẩn VietGAP toàn diện.
            </p>
          </div>

          <div>
            <p>9. Cơ cấu tổ chức của chủ thể:</p>
            <p className="pl-6 text-justify">
              Hội đồng quản trị gồm 03 thành viên; Ban kiểm soát 03 thành viên; 04 bộ phận chuyên môn trực thuộc gồm: Kế toán - Tài chính, Kỹ thuật nông nghiệp VietGAP, Thu hoạch KCS và Kinh doanh phát triển thị trường OCOP.
            </p>
          </div>
        </div>
      </div>

      {/* ===================== PHẦN II ===================== */}
      <div className="nd30-page-break space-y-2 text-[13pt]">
        <div className="text-center font-bold uppercase text-[13pt]">
          <p>Phần II</p>
          <p>KẾT QUẢ THỰC HIỆN PHƯƠNG ÁN SẢN XUẤT KINH DOANH</p>
        </div>

        <p className="italic text-[12pt] text-justify text-slate-800">
          Nội dung yêu cầu: Đánh giá kết quả triển khai phương án sản xuất, kinh doanh của chủ thể theo Phương án sản xuất, kinh doanh khi đăng ký tham gia Chương trình OCOP.
        </p>

        <div className="space-y-2 pl-2 text-justify leading-relaxed">
          <p>
            <strong>- Tổ chức vùng nguyên liệu, công nghệ sản xuất, sơ chế, chế biến, đóng gói sản phẩm của chủ thể:</strong> Tổng diện tích canh tác 280 ha nhà kính hiện đại, 100% ứng dụng tưới nhỏ giọt Israel, quản lý sâu bệnh sinh học IPM và kiểm soát thời gian cách ly PHI nghiêm ngặt. Xưởng sơ chế đóng gói 1.200 m² đạt tiêu chuẩn an toàn thực phẩm, kho lạnh bảo quản 8-10°C, công suất 15 tấn/ngày.
          </p>
          <p>
            <strong>- Sự thay đổi về chất lượng sản phẩm:</strong> Chất lượng đồng đều, tiêu chuẩn cơ sở TCCS 01:2024/HTX, kiểm nghiệm định kỳ âm tính dư lượng thuốc BVTV, độ ngọt Brix &ge; 8.0. Bao bì khay giấy tự hủy 500g thân thiện môi trường dán tem QR Code GS1.
          </p>
          <p>
            <strong>- Thị trường phân phối sản phẩm:</strong> Ký kết hợp đồng bao tiêu dài hạn cung ứng cho hệ thống siêu thị WinMart, Big C/Go!, Saigon Co.op, MM Mega Market và chuỗi thực phẩm sạch trên toàn quốc.
          </p>
          <p>
            <strong>- Kết quả sản xuất, kinh doanh:</strong> Sản lượng hàng năm đạt 4.720 tấn; Doanh thu đạt 48,5 tỷ đồng; Lợi nhuận sau thuế đạt 6,8 tỷ đồng; Tạo việc làm ổn định cho 165 hộ xã viên và 48 lao động tại cơ sở với thu nhập bình quân 12,5 triệu đồng/tháng.
          </p>
        </div>
      </div>

      {/* ===================== PHẦN III ===================== */}
      <div className="space-y-3 mt-4 text-[13pt]">
        <div className="text-center font-bold uppercase text-[13pt]">
          <p>Phần III</p>
          <p>ĐÁNH GIÁ KẾT QUẢ THỰC HIỆN THEO BỘ TIÊU CHÍ SẢN PHẨM OCOP</p>
        </div>

        <div className="space-y-1 pl-2 text-justify">
          <p>- Căn cứ vào Bộ tiêu chí đánh giá, phân hạng sản phẩm OCOP tương ứng với sản phẩm đăng ký, chủ thể tự đánh giá về kết quả (điểm số) có thể đạt theo thứ tự từng tiêu chí.</p>
          <p>- Mô tả, chứng minh về kết quả tương ứng (mô tả, tài liệu minh chứng cho nội dung mô tả).</p>
        </div>

        {/* 3-Part Summary Score Table */}
        <table className="w-full border-collapse border border-black text-[12pt] my-2">
          <thead>
            <tr className="bg-slate-50 font-bold">
              <th className="border border-black p-1.5 text-center">Phần / Nhóm Tiêu chí</th>
              <th className="border border-black p-1.5 text-center w-24">Điểm Tối Đa</th>
              <th className="border border-black p-1.5 text-center w-28">Điểm Tự Chấm</th>
              <th className="border border-black p-1.5 text-center w-24">Tỷ Lệ (%)</th>
              <th className="border border-black p-1.5 text-center">Căn cứ tóm tắt minh chứng</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td className="border border-black p-1.5 font-bold">Phần A: Sản phẩm và sức mạnh cộng đồng</td>
              <td className="border border-black p-1.5 text-center">40.0</td>
              <td className="border border-black p-1.5 text-center font-bold">{partAScore.toFixed(1)}</td>
              <td className="border border-black p-1.5 text-center">{((partAScore / 40.0) * 100).toFixed(1)}%</td>
              <td className="border border-black p-1.5 text-[11pt]">100% nguyên liệu địa phương 280 ha, liên kết chuỗi siêu thị.</td>
            </tr>
            <tr>
              <td className="border border-black p-1.5 font-bold">Phần B: Khả năng tiếp thị</td>
              <td className="border border-black p-1.5 text-center">25.0</td>
              <td className="border border-black p-1.5 text-center font-bold">{partBScore.toFixed(1)}</td>
              <td className="border border-black p-1.5 text-center">{((partBScore / 25.0) * 100).toFixed(1)}%</td>
              <td className="border border-black p-1.5 text-[11pt]">Phân phối siêu thị toàn quốc, bao bì khay giấy tem QR GS1.</td>
            </tr>
            <tr>
              <td className="border border-black p-1.5 font-bold">Phần C: Chất lượng sản phẩm</td>
              <td className="border border-black p-1.5 text-center">35.0</td>
              <td className="border border-black p-1.5 text-center font-bold">{partCScore.toFixed(1)}</td>
              <td className="border border-black p-1.5 text-center">{((partCScore / 35.0) * 100).toFixed(1)}%</td>
              <td className="border border-black p-1.5 text-[11pt]">Độ Brix &ge; 8.0, VietGAP đến 2027, tuân thủ 100% cách ly PHI.</td>
            </tr>
            <tr className="bg-slate-50 font-bold">
              <td className="border border-black p-1.5 uppercase text-center">TỔNG ĐIỂM TỰ ĐÁNH GIÁ</td>
              <td className="border border-black p-1.5 text-center">100.0</td>
              <td className="border border-black p-1.5 text-center text-[13pt] font-black">{totalScore.toFixed(1)}</td>
              <td className="border border-black p-1.5 text-center">{((totalScore / 100.0) * 100).toFixed(1)}%</td>
              <td className="border border-black p-1.5 text-center font-bold">ĐỀ NGHỊ PHÂN HẠNG 4 SAO OCOP</td>
            </tr>
          </tbody>
        </table>

        {/* Verbatim 14 Evidence Table from docx */}
        <div className="pt-2">
          <p className="font-bold text-[12.5pt] mb-1">
            - Tài liệu minh chứng kèm theo vào phụ lục của Báo cáo, tham khảo hướng dẫn theo bảng dưới đây:
          </p>
          <table className="w-full border-collapse border border-black text-[11pt]">
            <thead>
              <tr className="bg-slate-50 font-bold">
                <th className="border border-black p-1 text-center w-10">TT</th>
                <th className="border border-black p-1 text-center w-48">Nội dung</th>
                <th className="border border-black p-1 text-center">Yêu cầu (theo Quyết định số 148/QĐ-TTg)</th>
                <th className="border border-black p-1 text-center w-40">Tập tin số hóa & Mã SHA-256</th>
              </tr>
            </thead>
            <tbody>
              {evidenceRows.map((r) => (
                <tr key={r.tt}>
                  <td className="border border-black p-1 text-center font-bold">{r.tt}</td>
                  <td className="border border-black p-1 font-bold">{r.name}</td>
                  <td className="border border-black p-1 text-slate-800">{r.req}</td>
                  <td className="border border-black p-1 text-[10pt]">
                    <span className="font-bold text-slate-900">{r.file}</span>
                    <br />
                    <span className="text-[9pt] font-mono text-slate-600">[{r.hash}]</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* ===================== PHẦN IV ===================== */}
      <div className="nd30-page-break space-y-2 text-[13pt]">
        <div className="text-center font-bold uppercase text-[13pt]">
          <p>Phần IV</p>
          <p>KẾ HOẠCH SẢN XUẤT, KINH DOANH</p>
        </div>

        <p className="italic text-[12pt] text-slate-700">
          Trình bày những định hướng, kế hoạch của chủ sở hữu trong thời gian tới về phát triển sản phẩm, tổ chức sản xuất, thị trường:
        </p>

        <div className="space-y-1.5 pl-2 text-justify leading-relaxed">
          <p>
            1. <strong>Định hướng phát triển sản phẩm:</strong> Tiếp tục nâng cao chất lượng sản phẩm ớt ngọt Sweet Palermo, nghiên cứu mở rộng sang các dòng sản phẩm chế biến sâu (ớt sấy thăng hoa, nước ép hỗn hợp dinh dưỡng) nhằm đa dạng hóa chuỗi giá trị OCOP.
          </p>
          <p>
            2. <strong>Kế hoạch tổ chức sản xuất:</strong> Mở rộng thêm 50 ha diện tích canh tác nhà kính liên kết xã viên, 100% chuyển đổi nâng cấp theo tiêu chuẩn GlobalGAP; đầu tư thêm 01 kho lạnh sâu bảo quản nông sản dung tích 2.000 tấn.
          </p>
          <p>
            3. <strong>Phát triển thị trường:</strong> Duy trì và gia tăng thị phần tại chuỗi các siêu thị cao cấp trong nước; hoàn thiện thủ tục cấp mã số vùng trồng xuất khẩu và đăng ký bảo hộ nhãn hiệu tại các thị trường tiềm năng như Singapore, Nhật Bản và Hàn Quốc, phấn đấu đạt chuẩn <strong>5 SAO OCOP Quốc gia</strong> trong giai đoạn 2026 - 2028.
          </p>
        </div>

        {/* Signature */}
        <table className="w-full border-none mt-8" style={{ borderCollapse: 'collapse' }}>
          <tbody>
            <tr>
              <td className="w-1/2"></td>
              <td className="w-1/2 align-top text-center p-0">
                <p className="italic text-[13pt]">
                  Lâm Đồng, ngày {day} tháng {month} năm {year}
                </p>
                <p className="font-bold text-[13pt] uppercase mt-1">
                  ĐẠI DIỆN THEO PHÁP LUẬT CỦA CƠ SỞ
                </p>
                <p className="italic text-[12pt]">
                  (Ký, họ tên, đóng dấu)
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
      </div>
    </div>
  );
};
