import React from 'react';
import { OcopDossier } from '../../../../services/ocopService';

interface BieuMau01PrintViewProps {
  dossier: OcopDossier;
}

export const BieuMau01PrintView: React.FC<BieuMau01PrintViewProps> = ({ dossier }) => {
  return (
    <div className="bg-white text-black p-8 sm:p-12 max-w-[210mm] mx-auto font-serif text-[13.5px] leading-relaxed print:p-0 print:m-0 print:max-w-none print:shadow-none">
      {/* Quốc hiệu Tiêu ngữ */}
      <div className="grid grid-cols-2 gap-4 pb-4 border-b border-black/10">
        <div className="text-left font-sans text-xs">
          <p className="font-bold uppercase tracking-wider">HTX DV NÔNG NGHIỆP TỔNG HỢP TÂN TIẾN</p>
          <p className="text-slate-600">Số: 15/ĐK-OCOP/2025</p>
        </div>
        <div className="text-center font-serif">
          <p className="font-bold uppercase text-[13px]">CỘNG HÒA XÃ HỘI CHỦ NGHĨA VIỆT NAM</p>
          <p className="font-bold text-xs">Độc lập - Tự do - Hạnh phúc</p>
          <div className="w-28 border-b-2 border-black mx-auto mt-1 mb-2"></div>
          <p className="italic text-xs text-slate-600">Đà Lạt, ngày 15 tháng 05 năm 2025</p>
        </div>
      </div>

      <div className="text-right text-[11px] italic text-slate-500 pt-2 pb-4">
        Biểu số 01 (Ban hành kèm theo Quyết định số 148/QĐ-TTg ngày 24/02/2023 của Thủ tướng Chính phủ)
      </div>

      {/* Tiêu đề */}
      <div className="text-center py-4 space-y-1">
        <h2 className="font-bold text-lg uppercase tracking-wide">
          PHIẾU ĐĂNG KÝ ĐÁNH GIÁ, PHÂN HẠNG SẢN PHẨM OCOP
        </h2>
        <p className="text-xs italic text-slate-600">
          (Dành cho chủ thể sản xuất đăng ký tham gia Chương trình OCOP)
        </p>
      </div>

      <div className="text-center font-bold text-xs py-2">
        <p>Kính gửi:</p>
        <p>- Ủy ban nhân dân Thành phố Đà Lạt / Huyện Đơn Dương;</p>
        <p>- Hội đồng Đánh giá, phân hạng sản phẩm OCOP Tỉnh Lâm Đồng.</p>
      </div>

      {/* Nội dung chi tiết */}
      <div className="space-y-3.5 pt-3">
        <div>
          <h3 className="font-bold uppercase text-xs">1. Thông tin về đơn vị đăng ký:</h3>
          <ul className="pl-4 space-y-1 text-xs">
            <li><strong>- Tên chủ thể:</strong> Hợp tác xã Dịch vụ Nông nghiệp Tổng hợp Tân Tiến</li>
            <li><strong>- Tên giao dịch quốc tế:</strong> Tan Tien General Agricultural Services Cooperative</li>
            <li><strong>- Người đại diện hợp pháp:</strong> Mai Văn Tân &nbsp;&nbsp;&nbsp;&nbsp; <strong>Chức vụ:</strong> Giám đốc Hợp tác xã</li>
            <li><strong>- Giấy đăng ký kinh doanh số:</strong> 5801234567 do UBND Thành phố Đà Lạt cấp ngày 10/10/2018</li>
            <li><strong>- Địa chỉ trụ sở:</strong> Tổ Hòn Bồ, Phường 12, Thành phố Đà Lạt, Tỉnh Lâm Đồng</li>
            <li><strong>- Điện thoại:</strong> 0987 654 321 &nbsp;&nbsp;&nbsp;&nbsp; <strong>Email:</strong> htxtantien@dalat.vn &nbsp;&nbsp;&nbsp;&nbsp; <strong>Website:</strong> www.htxtantien.vn</li>
            <li><strong>- Quy mô thành viên:</strong> 165 hộ xã viên &nbsp;&nbsp;&nbsp;&nbsp; <strong>Lao động thường xuyên:</strong> 48 người</li>
          </ul>
        </div>

        <div>
          <h3 className="font-bold uppercase text-xs">2. Tên sản phẩm đăng ký đánh giá:</h3>
          <p className="pl-4 text-xs font-bold text-emerald-950 uppercase text-[13px]">
            ỚT CHUÔNG SWEET PALERMO ĐỎ ĐÀ LẠT
          </p>
          <p className="pl-4 text-xs italic text-slate-600">
            (Đặc tính: Quả dài 20-25cm, màu đỏ tươi bóng, vị ngọt thanh không hăng, độ ngọt Brix &ge; 8.0, giàu Vitamin C)
          </p>
        </div>

        <div>
          <h3 className="font-bold uppercase text-xs">3. Ngành/Nhóm sản phẩm đăng ký (theo Phụ lục I QĐ 148):</h3>
          <ul className="pl-4 space-y-0.5 text-xs">
            <li><strong>- Ngành:</strong> Thực phẩm</li>
            <li><strong>- Nhóm sản phẩm:</strong> Nông sản tươi sống</li>
            <li><strong>- Phân nhóm:</strong> Rau, củ, quả, hạt tươi</li>
          </ul>
        </div>

        <div>
          <h3 className="font-bold uppercase text-xs">4. Lần đăng ký tham gia:</h3>
          <div className="pl-4 text-xs flex gap-6">
            <span>[X] Lần đầu</span>
            <span>[ ] Nâng hạng sao</span>
            <span>[ ] Đánh giá lại (sau 36 tháng)</span>
          </div>
        </div>

        <div>
          <h3 className="font-bold uppercase text-xs">5. Mức hạng sao mục tiêu đăng ký:</h3>
          <p className="pl-4 text-xs font-bold text-amber-800">
            4 SAO OCOP (Cấp Tỉnh) — Định hướng Tiềm năng 5 SAO OCOP Quốc gia
          </p>
        </div>

        <div>
          <h3 className="font-bold uppercase text-xs">6. Hồ sơ, tài liệu gửi kèm theo Phiếu đăng ký:</h3>
          <ol className="pl-8 list-decimal space-y-1 text-xs">
            <li>Báo cáo tự đánh giá về sản phẩm theo Bộ tiêu chí OCOP (Biểu số 02) (01 bản in & dữ liệu số hóa).</li>
            <li>Báo cáo đánh giá và xác nhận của Ủy ban nhân dân cấp xã (Biểu số 03) (01 bản chính).</li>
            <li>Bản sao hợp lệ Giấy đăng ký kinh doanh và Giấy chứng nhận VietGAP còn hiệu lực đến năm 2027.</li>
            <li>Phiếu kết quả thử nghiệm cảm quan, độ ngọt Brix, vi sinh và tồn dư thuốc BVTV đạt chuẩn ISO/IEC 17025.</li>
            <li>Hồ sơ bao bì thương phẩm, mẫu tem truy xuất nguồn gốc QR Code GS1 gắn mã lô thu hoạch.</li>
            <li>Hợp đồng liên kết chuỗi giá trị và hóa đơn bao tiêu với hệ thống siêu thị WinMart, Co.opmart.</li>
            <li>Sản phẩm mẫu gửi kèm thẩm định: <strong>10 khay thành phẩm 500g</strong> dán tem QR truy xuất.</li>
          </ol>
        </div>

        <div>
          <h3 className="font-bold uppercase text-xs">7. Cam đoan của chủ thể:</h3>
          <p className="pl-4 text-xs text-justify italic">
            Chúng tôi xin cam đoan toàn bộ các thông tin kê khai trong phiếu này và các tài liệu đính kèm trong hồ sơ là hoàn toàn chính xác, trung thực. Hợp tác xã cam kết tuân thủ nghiêm ngặt các quy định của Chương trình OCOP và chịu mọi trách nhiệm trước pháp luật về tính chân thực của hồ sơ.
          </p>
        </div>
      </div>

      {/* Chữ ký 2 bên */}
      <div className="pt-8 grid grid-cols-2 text-center text-xs gap-6">
        <div>
          <p className="font-bold uppercase">CƠ QUAN TIẾP NHẬN HỒ SƠ</p>
          <p className="italic text-slate-500">(UBND cấp huyện/tổ giúp việc Hội đồng OCOP)</p>
          <div className="pt-2 text-left pl-6 text-[11px] text-slate-600 space-y-1">
            <p>- Số tiếp nhận: ...... /PĐK-OCOP-2025</p>
            <p>- Ngày nhận: ...... / ...... / 2025</p>
            <p>- Người tiếp nhận: .......................................</p>
          </div>
          <div className="h-20"></div>
          <p className="font-bold text-slate-400">(Ký và ghi rõ họ tên)</p>
        </div>

        <div>
          <p className="font-bold uppercase">ĐẠI DIỆN HỢP TÁC XÃ TÂN TIẾN</p>
          <p className="italic text-slate-500">(Ký tên, đóng dấu pháp nhân)</p>
          <div className="h-20 flex items-center justify-center">
            <div className="w-24 h-24 border-2 border-red-600/40 rounded-full flex flex-col items-center justify-center text-red-600/60 text-[9px] font-bold select-none rotate-[-12deg]">
              <span>HTX TÂN TIẾN</span>
              <span className="text-[8px]">ĐÃ KÝ SỐ</span>
              <span>15/05/2025</span>
            </div>
          </div>
          <p className="font-bold text-xs uppercase text-slate-900">MAI VĂN TÂN</p>
          <p className="text-[11px] text-slate-600">Giám đốc Hợp tác xã</p>
        </div>
      </div>
    </div>
  );
};
