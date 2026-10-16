import React from 'react';
import { OcopDossier } from '../../../../services/ocopService';

interface BieuMau03PrintViewProps {
  dossier: OcopDossier;
}

export const BieuMau03PrintView: React.FC<BieuMau03PrintViewProps> = ({ dossier }) => {
  return (
    <div className="bg-white text-black p-8 sm:p-12 max-w-[210mm] mx-auto font-serif text-[13.5px] leading-relaxed print:p-0 print:m-0 print:max-w-none print:shadow-none space-y-6">
      {/* Tiêu đề cơ quan hành chính & Quốc hiệu */}
      <div className="grid grid-cols-2 gap-4 pb-3 border-b border-black/10">
        <div className="text-left font-sans text-xs">
          <p className="font-bold uppercase tracking-wider">ỦY BAN NHÂN DÂN THÀNH PHỐ ĐÀ LẠT</p>
          <p className="font-bold uppercase tracking-wide">ỦY BAN NHÂN DÂN PHƯỜNG 12</p>
          <div className="w-24 border-b border-black my-1"></div>
          <p className="text-slate-600">Số: 88/BC-UBND</p>
        </div>
        <div className="text-center font-serif">
          <p className="font-bold uppercase text-[13px]">CỘNG HÒA XÃ HỘI CHỦ NGHĨA VIỆT NAM</p>
          <p className="font-bold text-xs">Độc lập - Tự do - Hạnh phúc</p>
          <div className="w-28 border-b-2 border-black mx-auto mt-1 mb-2"></div>
          <p className="italic text-xs text-slate-600">Đà Lạt, ngày 18 tháng 05 năm 2025</p>
        </div>
      </div>

      <div className="text-right text-[11px] italic text-slate-500">
        Biểu số 03 (Phụ lục II ban hành kèm theo Quyết định số 148/QĐ-TTg ngày 24/02/2023 của Thủ tướng Chính phủ)
      </div>

      {/* Tên báo cáo */}
      <div className="text-center py-2 space-y-1">
        <h2 className="font-bold text-lg uppercase tracking-wide">
          BÁO CÁO ĐÁNH GIÁ CỦA ỦY BAN NHÂN DÂN CẤP XÃ
        </h2>
        <p className="text-xs italic text-slate-600">
          Về việc thẩm tra, đánh giá hồ sơ đăng ký tham gia phân hạng sản phẩm OCOP
        </p>
      </div>

      <div className="text-center font-bold text-xs py-2">
        <p>Kính gửi:</p>
        <p>- Hội đồng Đánh giá, phân hạng sản phẩm OCOP Thành phố Đà Lạt;</p>
        <p>- Phòng Kinh tế Thành phố Đà Lạt (Cơ quan Thường trực OCOP).</p>
      </div>

      {/* Nội dung */}
      <div className="space-y-4 pt-2">
        <p className="text-xs text-justify">
          Căn cứ Quyết định số 148/QĐ-TTg ngày 24/02/2023 của Thủ tướng Chính phủ về việc ban hành Bộ tiêu chí và quy trình đánh giá, phân hạng sản phẩm Chương trình mỗi xã một sản phẩm (OCOP);
        </p>
        <p className="text-xs text-justify">
          Xét Phiếu đăng ký số 15/ĐK-OCOP/2025 ngày 15/05/2025 của <strong>Hợp tác xã Dịch vụ Nông nghiệp Tổng hợp Tân Tiến</strong> về việc đề nghị đánh giá, phân hạng sản phẩm <strong>Ớt chuông Sweet Palermo Đỏ Đà Lạt</strong>;
        </p>
        <p className="text-xs text-justify">
          Qua công tác kiểm tra, thẩm tra thực tế tại hiện trường các vùng trồng nhà kính và cơ sở sơ chế đóng gói của Hợp tác xã, Ủy ban nhân dân Phường 12 báo cáo đánh giá và xác nhận 4 nội dung cụ thể như sau:
        </p>

        {/* 4 NỘI DUNG XÁC NHẬN */}
        <div className="space-y-3 pl-2">
          <div className="border-l-2 border-emerald-600 pl-3">
            <h4 className="font-bold text-xs uppercase text-slate-900">
              1. Về sử dụng nguồn nguyên liệu địa phương:
            </h4>
            <p className="text-xs text-justify text-slate-800 mt-1">
              Xác nhận <strong>100% diện tích canh tác (280 ha nhà kính)</strong> của HTX Tân Tiến và 165 hộ gia đình xã viên nằm thực tế trên địa bàn Tổ Hòn Bồ, Phường 12 (Đà Lạt) và vùng liên kết giáp ranh Đạ Sar. Toàn bộ sản lượng ớt chuông Sweet Palermo thu hoạch hoàn toàn có nguồn gốc tại địa phương, đảm bảo điều kiện thổ nhưỡng khí hậu cao nguyên đặc trưng, không có hiện tượng thu gom nông sản không rõ nguồn gốc ngoài tỉnh.
            </p>
          </div>

          <div className="border-l-2 border-emerald-600 pl-3">
            <h4 className="font-bold text-xs uppercase text-slate-900">
              2. Về sử dụng lao động tại chỗ:
            </h4>
            <p className="text-xs text-justify text-slate-800 mt-1">
              HTX Tân Tiến đang tạo việc làm và nguồn thu nhập ổn định cho <strong>165 hộ nông dân xã viên</strong> và <strong>48 lao động phổ thông</strong> thường trú tại Phường 12 và các xã lân cận. Thu nhập bình quân của người lao động đạt từ 11 đến 14 triệu đồng/tháng. HTX thực hiện đầy đủ chính sách an toàn lao động, vệ sinh môi trường nông thôn và tích cực tham gia các phong trào xây dựng nông thôn mới kiểu mẫu tại địa phương.
            </p>
          </div>

          <div className="border-l-2 border-emerald-600 pl-3">
            <h4 className="font-bold text-xs uppercase text-slate-900">
              3. Về nguồn gốc ý tưởng sản phẩm:
            </h4>
            <p className="text-xs text-justify text-slate-800 mt-1">
              Sản phẩm ớt chuông ngọt Sweet Palermo xuất phát từ ý tưởng sáng tạo và tâm huyết của ban lãnh đạo HTX và nông dân Tân Tiến nhằm chuyển đổi cơ cấu cây trồng từ các giống rau truyền thống năng suất thấp sang phân khúc "nông sản tráng miệng" cao cấp, giàu dinh dưỡng, tận dụng biên độ nhiệt ngày đêm lý tưởng của thung lũng sương mù Đà Lạt.
            </p>
          </div>

          <div className="border-l-2 border-emerald-600 pl-3">
            <h4 className="font-bold text-xs uppercase text-slate-900">
              4. Về bản sắc văn hóa và trí tuệ địa phương:
            </h4>
            <p className="text-xs text-justify text-slate-800 mt-1">
              Sản phẩm là sự kết tinh giữa tri thức canh tác nhà kính truyền thống lâu đời của người nông dân xứ lạnh Đà Lạt với công nghệ sinh học hiện đại (tưới nhỏ giọt Fertigation, bao bọc sinh học, truy xuất nguồn gốc tem điện tử). Sản phẩm đã được cấp quyền sử dụng nhãn hiệu chứng nhận <em>"Rau Đà Lạt - Kết tinh kỳ diệu từ đất lành"</em>, góp phần tôn vinh thương hiệu nông sản của thành phố.
            </p>
          </div>
        </div>

        {/* Kiến nghị */}
        <div className="pt-2">
          <h4 className="font-bold text-xs uppercase text-slate-900">
            III. KIẾN NGHỊ VÀ ĐỀ XUẤT:
          </h4>
          <p className="text-xs text-justify mt-1">
            Ủy ban nhân dân Phường 12 xác nhận hồ sơ của Hợp tác xã Dịch vụ Nông nghiệp Tổng hợp Tân Tiến đáp ứng đầy đủ tính chân thực, hợp pháp và các tiêu chí quy định tại Quyết định số 148/QĐ-TTg.
          </p>
          <p className="text-xs text-justify mt-1 font-bold text-emerald-950">
            Kính đề nghị Hội đồng Đánh giá, phân hạng sản phẩm OCOP Thành phố Đà Lạt và Tỉnh Lâm Đồng xem xét, thẩm định và công nhận sản phẩm "Ớt chuông Sweet Palermo Đỏ Đà Lạt" đạt phân hạng 4 SAO OCOP.
          </p>
        </div>
      </div>

      {/* Ký tên đóng dấu */}
      <div className="pt-8 grid grid-cols-2 text-xs">
        <div className="text-left font-sans text-[11px] text-slate-600 space-y-1">
          <p className="font-bold">Nơi nhận:</p>
          <p>- Như kính gửi;</p>
          <p>- UBND Thành phố Đà Lạt (để b/c);</p>
          <p>- HTX Tân Tiến (để phối hợp);</p>
          <p>- Lưu: VT, ĐC-NN.</p>
        </div>

        <div className="text-center font-serif">
          <p className="font-bold uppercase">TM. ỦY BAN NHÂN DÂN PHƯỜNG 12</p>
          <p className="font-bold uppercase text-slate-700">CHỦ TỊCH</p>
          <div className="h-24 flex items-center justify-center">
            <div className="w-28 h-28 border-2 border-red-600/40 rounded-full flex flex-col items-center justify-center text-red-600/60 text-[9px] font-bold select-none rotate-[-8deg]">
              <span>UBND PHƯỜNG 12</span>
              <span className="text-[8px]">ĐÃ ĐÓNG DẤU ĐỎ</span>
              <span>18/05/2025</span>
            </div>
          </div>
          <p className="font-bold text-xs uppercase text-slate-900">NGUYỄN THANH BÌNH</p>
        </div>
      </div>
    </div>
  );
};
