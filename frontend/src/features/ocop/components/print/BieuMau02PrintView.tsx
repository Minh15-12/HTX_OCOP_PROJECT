import React from 'react';
import { OcopDossier } from '../../../../services/ocopService';
import { OCOP_QD148_CRITERIA_DATA, ALL_INDICATORS } from '../../data/ocopQd148Data';

interface BieuMau02PrintViewProps {
  dossier: OcopDossier;
  scores?: Record<string, number>;
}

export const BieuMau02PrintView: React.FC<BieuMau02PrintViewProps> = ({ dossier, scores = {} }) => {
  const getScore = (code: string, fallback: number) => {
    return scores[code] ?? fallback;
  };

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

  // 14 Evidence Documents according to Bieu Mau 2 Docx
  const evidenceList = [
    { stt: '01', name: 'Giấy chứng nhận đăng ký HTX số 5801234567 do UBND TP. Đà Lạt cấp', type: 'Pháp lý chủ thể', status: 'Hợp lệ', file: 'DKKD_HTX_TanTien.pdf', hash: 'a1b2c3...d4e5' },
    { stt: '02', name: 'Giấy chứng nhận VietGAP số VICB-2024-GAP-0128 còn hiệu lực đến 2027', type: 'Tiêu chuẩn chất lượng', status: 'Hợp lệ', file: 'VietGAP_2024_2027.pdf', hash: 'e3b0c4...b855' },
    { stt: '03', name: 'Bản tự công bố tiêu chuẩn chất lượng cơ sở (TCCS 01:2024/HTXTT)', type: 'Chất lượng SP', status: 'Hợp lệ', file: 'TCCS_OtPalermo_2024.pdf', hash: '8f4321...9c12' },
    { stt: '04', name: 'Phiếu kết quả thử nghiệm độ ngọt Brix & dinh dưỡng Quatest 3 (KT3-04128)', type: 'Kiểm nghiệm ISO 17025', status: 'Hợp lệ', file: 'Test_Quatest3_Brix92.pdf', hash: '7c89a1...3b21' },
    { stt: '05', name: 'Phiếu kiểm nghiệm âm tính dư lượng thuốc BVTV & kim loại nặng Eurofins', type: 'An toàn thực phẩm', status: 'Hợp lệ', file: 'Eurofins_Pesticide_Free.pdf', hash: '9b1122...4455' },
    { stt: '06', name: 'Maket thiết kế bao bì khay giấy tự hủy 500g đạt chuẩn Nghị định 43/2017', type: 'Bao bì thương phẩm', status: 'Hợp lệ', file: 'BaoBi_KhayGiay_500g.pdf', hash: '4d5e6f...7a8b' },
    { stt: '07', name: 'Mẫu tem QR Code GS1 truy xuất nguồn gốc động liên kết mã lô thu hoạch', type: 'Tem QR truy xuất', status: 'Hợp lệ', file: 'TemQR_GS1_LotTrace.pdf', hash: '5e6f7a...8b9c' },
    { stt: '08', name: 'Giấy chứng nhận quyền sử dụng Nhãn hiệu chứng nhận "Rau Đà Lạt"', type: 'Sở hữu trí tuệ', status: 'Hợp lệ', file: 'NhanHieu_RauDaLat_2024.pdf', hash: '6f7a8b...9c0d' },
    { stt: '09', name: 'Hợp đồng liên kết chuỗi giá trị bao tiêu 4.720 tấn/năm với WinCommerce', type: 'Liên kết chuỗi', status: 'Hợp lệ', file: 'HopDong_BaoTieu_WinMart.pdf', hash: '7a8b9c...0d1e' },
    { stt: '10', name: 'Bộ hóa đơn giá trị gia tăng (VAT) xuất bán ớt chuông vào chuỗi siêu thị', type: 'Thị trường phân phối', status: 'Hợp lệ', file: 'HoaDon_VAT_SieuThi_2025.pdf', hash: '8b9c0d...1e2f' },
    { stt: '11', name: 'Bản đồ số hóa 280 ha vùng nguyên liệu và danh sách 165 hộ nông dân xã viên', type: 'Nguyên liệu địa phương', status: 'Hợp lệ', file: 'BanDo_280ha_165XaVien.pdf', hash: '9c0d1e...2f3a' },
    { stt: '12', name: 'Kế hoạch bảo vệ môi trường và biên bản kiểm tra bể chứa bao bì BVTV', type: 'Bảo vệ môi trường', status: 'Hợp lệ', file: 'CamKet_BVMT_Phuong12.pdf', hash: '0d1e2f...3a4b' },
    { stt: '13', name: 'Quy trình kiểm soát thời gian cách ly PHI và sổ nhật ký canh tác điện tử', type: 'Kiểm soát canh tác', status: 'Hợp lệ', file: 'NhatKy_PHI_DienTu.pdf', hash: '1e2f3a...4b5c' },
    { stt: '14', name: 'Bản thuyết minh Câu chuyện sản phẩm và video phóng sự truyền hình', type: 'Tiếp thị OCOP', status: 'Hợp lệ', file: 'ThuyetMinh_CauChuyenSP.pdf', hash: '2f3a4b...5c6d' },
  ];

  return (
    <div className="bg-white text-black p-8 sm:p-12 max-w-[210mm] mx-auto font-serif text-[13px] leading-relaxed print:p-0 print:m-0 print:max-w-none print:shadow-none space-y-6">
      {/* Quốc hiệu Tiêu ngữ */}
      <div className="grid grid-cols-2 gap-4 pb-3 border-b border-black/10">
        <div className="text-left font-sans text-xs">
          <p className="font-bold uppercase tracking-wider">HTX DV NÔNG NGHIỆP TỔNG HỢP TÂN TIẾN</p>
          <p className="text-slate-600">Số: 16/BC-OCOP/2025</p>
        </div>
        <div className="text-center font-serif">
          <p className="font-bold uppercase text-[13px]">CỘNG HÒA XÃ HỘI CHỦ NGHĨA VIỆT NAM</p>
          <p className="font-bold text-xs">Độc lập - Tự do - Hạnh phúc</p>
          <div className="w-28 border-b-2 border-black mx-auto mt-1 mb-2"></div>
          <p className="italic text-xs text-slate-600">Đà Lạt, ngày 15 tháng 05 năm 2025</p>
        </div>
      </div>

      <div className="text-right text-[11px] italic text-slate-500">
        Biểu số 02 (Ban hành kèm theo Quyết định số 148/QĐ-TTg ngày 24/02/2023 của Thủ tướng Chính phủ)
      </div>

      {/* Tiêu đề */}
      <div className="text-center py-2 space-y-1">
        <h2 className="font-bold text-lg uppercase tracking-wide">
          BÁO CÁO TỰ ĐÁNH GIÁ SẢN PHẨM OCOP
        </h2>
        <p className="text-sm font-bold text-emerald-950 uppercase">
          Sản phẩm: ỚT CHUÔNG SWEET PALERMO ĐỎ ĐÀ LẠT
        </p>
        <p className="text-xs italic text-slate-600">
          Chủ thể: Hợp tác xã Dịch vụ Nông nghiệp Tổng hợp Tân Tiến
        </p>
      </div>

      {/* PHẦN I: THÔNG TIN CHUNG */}
      <div className="space-y-2 border-t pt-4">
        <h3 className="font-bold text-sm uppercase text-slate-900">
          PHẦN I. THÔNG TIN CHUNG VỀ CHỦ THỂ VÀ SẢN PHẨM
        </h3>
        
        <div className="pl-4 space-y-1.5 text-xs">
          <p><strong>1.1. Tên chủ thể sản xuất:</strong> Hợp tác xã Dịch vụ Nông nghiệp Tổng hợp Tân Tiến</p>
          <p><strong>1.2. Người đại diện theo pháp luật:</strong> Mai Văn Tân &nbsp;&nbsp;&nbsp;&nbsp; <strong>Chức vụ:</strong> Giám đốc</p>
          <p><strong>1.3. Ngày thành lập & ĐKKD:</strong> Thành lập ngày 10/10/2018 theo Giấy ĐKKD số 5801234567 do UBND Thành phố Đà Lạt cấp.</p>
          <p><strong>1.4. Trụ sở chính:</strong> Tổ Hòn Bồ, Phường 12, Thành phố Đà Lạt, Tỉnh Lâm Đồng.</p>
          <p><strong>1.5. Lịch sử hình thành và phát triển:</strong> HTX khởi đầu từ nhóm 25 hộ nông dân liên kết năm 2018, tiên phong đưa công nghệ nhà kính bán tự động và giống ớt hoa quả Sweet Palermo từ châu Âu về Đà Lạt. Đến nay, HTX đã phát triển vững mạnh với 165 hộ xã viên, tổng diện tích 280 ha vùng trồng đạt chuẩn an toàn cao cấp.</p>
          <p><strong>1.6. Quy cách và đặc tính sản phẩm:</strong> Quả ớt dài 20-25cm, khối lượng 100-150g/trái, độ ngọt tự nhiên Brix &ge; 8.0, hàm lượng Vitamin C đạt 185mg/100g. Sản phẩm đóng gói trong khay giấy sinh học 500g và túi màng thở thân thiện môi trường, dán tem QR truy xuất GS1.</p>
          <p><strong>1.7. Tình trạng pháp lý & Sở hữu trí tuệ:</strong> Đã công bố tiêu chuẩn cơ sở TCCS 01:2024/HTXTT; Đạt chứng nhận VietGAP VICB-2024-GAP-0128; Được UBND TP. Đà Lạt cấp quyền sử dụng Nhãn hiệu chứng nhận "Rau Đà Lạt".</p>
        </div>
      </div>

      {/* PHẦN II: KẾT QUẢ THỰC HIỆN PHƯƠNG ÁN SXKD */}
      <div className="space-y-2 border-t pt-4">
        <h3 className="font-bold text-sm uppercase text-slate-900">
          PHẦN II. KẾT QUẢ THỰC HIỆN PHƯƠNG ÁN SẢN XUẤT KINH DOANH
        </h3>

        <div className="pl-4 space-y-1.5 text-xs">
          <p><strong>2.1. Vùng nguyên liệu và năng lực canh tác:</strong> Tổng diện tích canh tác 280 ha nhà kính hiện đại tại vùng Hòn Bồ (Đà Lạt) và Đạ Sar (Lạc Dương). 100% diện tích ứng dụng hệ thống tưới nhỏ giọt Fertigation của Israel, kiểm soát sinh học IPM và quản lý cách ly thuốc BVTV (PHI) nghiêm ngặt.</p>
          <p><strong>2.2. Sản lượng và doanh thu hàng năm:</strong> Sản lượng thu hoạch đạt <strong>4.720 tấn/năm</strong>. Tổng doanh thu năm gần nhất đạt <strong>48,5 tỷ đồng</strong>, lợi nhuận sau thuế đạt <strong>6,8 tỷ đồng</strong>.</p>
          <p><strong>2.3. Giải quyết việc làm và an sinh xã hội:</strong> Bao tiêu toàn bộ sản lượng cho 165 hộ xã viên với giá sàn bảo hiểm, tạo việc làm ổn định cho 48 lao động sơ chế, đóng gói tại chỗ với mức thu nhập bình quân 12.5 triệu đồng/người/tháng.</p>
          <p><strong>2.4. Mạng lưới phân phối:</strong> Cung ứng thường xuyên vào chuỗi siêu thị bán lẻ toàn quốc (WinMart, Bách Hóa Xanh, Saigon Co.op) và sàn giao dịch OCOP số.</p>
        </div>
      </div>

      {/* PHẦN III: TỰ ĐÁNH GIÁ THEO BỘ TIÊU CHÍ OCOP QĐ 148 */}
      <div className="space-y-3 border-t pt-4">
        <h3 className="font-bold text-sm uppercase text-slate-900">
          PHẦN III. KẾT QUẢ TỰ ĐÁNH GIÁ THEO BỘ TIÊU CHÍ OCOP (THANG ĐIỂM 100)
        </h3>
        <p className="text-xs italic text-slate-600">
          Căn cứ Quyết định số 148/QĐ-TTg ngày 24/02/2023 áp dụng cho phân nhóm Rau, củ, quả, hạt tươi:
        </p>

        {/* Bảng tổng hợp điểm 3 phần */}
        <div className="overflow-x-auto border border-black/20 text-xs font-sans">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-100 font-bold border-b border-black/20">
                <th className="p-2 border-r border-black/20">Phần / Nhóm Tiêu chí</th>
                <th className="p-2 text-center border-r border-black/20 w-24">Điểm Tối Đa</th>
                <th className="p-2 text-center border-r border-black/20 w-28">Điểm Tự Chấm</th>
                <th className="p-2 text-center border-r border-black/20 w-20">Tỷ Lệ (%)</th>
                <th className="p-2">Căn cứ & Tóm tắt minh chứng</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-black/10">
              <tr>
                <td className="p-2 border-r border-black/20 font-bold">Phần A: Sản phẩm và sức mạnh cộng đồng</td>
                <td className="p-2 text-center border-r border-black/20 font-mono">40.0</td>
                <td className="p-2 text-center border-r border-black/20 font-bold text-emerald-800 font-mono">{partAScore.toFixed(1)}</td>
                <td className="p-2 text-center border-r border-black/20 font-mono">{((partAScore / 40.0) * 100).toFixed(1)}%</td>
                <td className="p-2 text-slate-700">100% nguyên liệu địa phương 280 ha, 165 hộ xã viên, liên kết WinMart, BVMT khép kín</td>
              </tr>
              <tr>
                <td className="p-2 border-r border-black/20 font-bold">Phần B: Khả năng tiếp thị</td>
                <td className="p-2 text-center border-r border-black/20 font-mono">25.0</td>
                <td className="p-2 text-center border-r border-black/20 font-bold text-emerald-800 font-mono">{partBScore.toFixed(1)}</td>
                <td className="p-2 text-center border-r border-black/20 font-mono">{((partBScore / 25.0) * 100).toFixed(1)}%</td>
                <td className="p-2 text-slate-700">Phân phối siêu thị toàn quốc, bao bì khay giấy tem QR GS1, câu chuyện sản phẩm xuất sắc</td>
              </tr>
              <tr>
                <td className="p-2 border-r border-black/20 font-bold">Phần C: Chất lượng sản phẩm</td>
                <td className="p-2 text-center border-r border-black/20 font-mono">35.0</td>
                <td className="p-2 text-center border-r border-black/20 font-bold text-emerald-800 font-mono">{partCScore.toFixed(1)}</td>
                <td className="p-2 text-center border-r border-black/20 font-mono">{((partCScore / 35.0) * 100).toFixed(1)}%</td>
                <td className="p-2 text-slate-700">Độ Brix &ge; 8.0, VietGAP đến 2027, tuân thủ 100% cách ly PHI, nhãn hiệu chứng nhận Rau Đà Lạt</td>
              </tr>
              <tr className="bg-emerald-50/60 font-bold text-slate-900 border-t-2 border-black/30">
                <td className="p-2 border-r border-black/20 uppercase text-emerald-950">TỔNG CỘNG ĐIỂM TỰ ĐÁNH GIÁ</td>
                <td className="p-2 text-center border-r border-black/20 font-mono text-sm">100.0</td>
                <td className="p-2 text-center border-r border-black/20 font-mono text-sm text-emerald-900 font-black">{totalScore.toFixed(1)}</td>
                <td className="p-2 text-center border-r border-black/20 font-mono">{((totalScore / 100.0) * 100).toFixed(1)}%</td>
                <td className="p-2 text-emerald-950 font-black">XẾP HẠNG ĐỀ XUẤT: 4 SAO OCOP (TIỀM NĂNG 5 SAO)</td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* Bảng chi tiết 11 chỉ tiêu */}
        <div className="pt-2">
          <p className="font-bold text-xs uppercase mb-1">Chi tiết điểm tự chấm trên 11 chỉ tiêu chuẩn QĐ 148:</p>
          <div className="overflow-x-auto border border-black/20 text-[11px] font-sans">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-100 font-bold border-b border-black/20">
                  <th className="p-1.5 border-r border-black/20 w-16">Mã TC</th>
                  <th className="p-1.5 border-r border-black/20">Nội dung chỉ tiêu đánh giá</th>
                  <th className="p-1.5 border-r border-black/20 text-center w-14">Tối đa</th>
                  <th className="p-1.5 border-r border-black/20 text-center w-14">Tự chấm</th>
                  <th className="p-1.5 border-r border-black/20 text-center w-16">Bắt buộc</th>
                  <th className="p-1.5">Giải trình căn cứ thực tế của HTX</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-black/10">
                {ALL_INDICATORS.map((ind) => {
                  const s = getScore(ind.code, ind.smartSuggestion.suggestedScore);
                  return (
                    <tr key={ind.code}>
                      <td className="p-1.5 border-r border-black/20 font-mono font-bold">{ind.code}</td>
                      <td className="p-1.5 border-r border-black/20 font-medium">
                        <strong>{ind.criterionName}:</strong> {ind.name}
                      </td>
                      <td className="p-1.5 border-r border-black/20 text-center font-mono">{ind.maxScore.toFixed(1)}</td>
                      <td className="p-1.5 border-r border-black/20 text-center font-mono font-bold text-emerald-800">{s.toFixed(1)}</td>
                      <td className="p-1.5 border-r border-black/20 text-center">
                        {ind.isMandatory ? <span className="text-red-600 font-bold">Có (*)</span> : <span className="text-slate-400">Không</span>}
                      </td>
                      <td className="p-1.5 text-slate-600">{ind.smartSuggestion.reason}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Phụ lục danh mục 14 loại tài liệu minh chứng */}
        <div className="pt-3">
          <p className="font-bold text-xs uppercase mb-1">
            Phụ lục: Danh mục 14 tài liệu minh chứng số hóa kèm mã băm SHA-256:
          </p>
          <div className="overflow-x-auto border border-black/20 text-[10.5px] font-sans">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-100 font-bold border-b border-black/20">
                  <th className="p-1.5 border-r border-black/20 w-8 text-center">STT</th>
                  <th className="p-1.5 border-r border-black/20">Tên tài liệu / Văn bản minh chứng</th>
                  <th className="p-1.5 border-r border-black/20 w-32">Phân loại</th>
                  <th className="p-1.5 border-r border-black/20 w-28">Tập tin số hóa</th>
                  <th className="p-1.5 border-r border-black/20 w-20 text-center">Trạng thái</th>
                  <th className="p-1.5 font-mono text-[9px] w-24">Mã băm SHA-256</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-black/10">
                {evidenceList.map((ev) => (
                  <tr key={ev.stt}>
                    <td className="p-1.5 border-r border-black/20 text-center font-mono text-slate-500">{ev.stt}</td>
                    <td className="p-1.5 border-r border-black/20 font-medium text-slate-900">{ev.name}</td>
                    <td className="p-1.5 border-r border-black/20 text-slate-600">{ev.type}</td>
                    <td className="p-1.5 border-r border-black/20 font-mono text-emerald-900">{ev.file}</td>
                    <td className="p-1.5 border-r border-black/20 text-center font-bold text-emerald-700">{ev.status}</td>
                    <td className="p-1.5 font-mono text-[9px] text-slate-500">{ev.hash}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* PHẦN IV: KẾ HOẠCH TƯƠNG LAI */}
      <div className="space-y-2 border-t pt-4">
        <h3 className="font-bold text-sm uppercase text-slate-900">
          PHẦN IV. KẾ HOẠCH PHÁT TRIỂN SẢN XUẤT KINH DOANH TRONG TƯƠNG LAI
        </h3>

        <div className="pl-4 space-y-1.5 text-xs">
          <p><strong>4.1. Mở rộng quy mô và nâng cao chất lượng:</strong> Trong giai đoạn 2025 - 2028, HTX định hướng mở rộng thêm 50 ha diện tích đạt chuẩn GlobalGAP, chuyển đổi hoàn toàn sang hệ thống bón phân hữu cơ vi sinh thông minh tự động hóa ứng dụng cảm biến IoT.</p>
          <p><strong>4.2. Đầu tư công nghệ sau thu hoạch:</strong> Đầu tư xây dựng 01 tổng kho lạnh bảo quản sâu dung tích 2.000 tấn và dây chuyền phân loại quang học tự động theo màu sắc và độ ngọt Brix.</p>
          <p><strong>4.3. Phát triển thị trường xuất khẩu:</strong> Hoàn thiện thủ tục cấp mã số vùng trồng xuất khẩu sang Singapore, Hàn Quốc và Nhật Bản, hướng tới mục tiêu đưa sản phẩm Ớt chuông Sweet Palermo Đỏ Đà Lạt đạt chuẩn <strong>5 SAO OCOP Quốc gia</strong>.</p>
        </div>
      </div>

      {/* Chữ ký */}
      <div className="pt-8 text-right font-serif text-xs">
        <p className="italic text-slate-600">Đà Lạt, ngày 15 tháng 05 năm 2025</p>
        <p className="font-bold uppercase mt-1">ĐẠI DIỆN HỢP TÁC XÃ TÂN TIẾN</p>
        <p className="italic text-slate-500">(Ký tên, ghi rõ họ tên và đóng dấu)</p>
        <div className="h-20 flex items-center justify-end pr-12">
          <div className="w-24 h-24 border-2 border-red-600/40 rounded-full flex flex-col items-center justify-center text-red-600/60 text-[9px] font-bold select-none rotate-[-12deg]">
            <span>HTX TÂN TIẾN</span>
            <span className="text-[8px]">ĐÃ KÝ SỐ</span>
            <span>15/05/2025</span>
          </div>
        </div>
        <p className="font-bold text-xs uppercase text-slate-900 pr-12">MAI VĂN TÂN</p>
        <p className="text-[11px] text-slate-600 pr-12">Giám đốc Hợp tác xã</p>
      </div>
    </div>
  );
};
