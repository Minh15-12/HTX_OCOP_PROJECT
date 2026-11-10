import React from 'react';
import { OcopDossier } from '../../../../services/ocopService';
import { useTenantContextStore } from '@/stores/tenantContextStore';

interface BieuMau03PrintViewProps {
  dossier: OcopDossier;
}

export const BieuMau03PrintView: React.FC<BieuMau03PrintViewProps> = ({ dossier }) => {
  const { activeCooperative } = useTenantContextStore();
  const currentDate = new Date();
  const day = currentDate.getDate().toString().padStart(2, '0');
  const month = (currentDate.getMonth() + 1).toString().padStart(2, '0');
  const year = currentDate.getFullYear();
  const communeName = activeCooperative?.commune || 'Xã Cơ Sở';

  return (
    <div className="nd30-document nd30-a4-page text-[13pt] text-black">
      {/* Top Reference Note */}
      <div className="text-right text-[11pt] italic text-slate-700 mb-1">
        BIỂU SỐ 3. MẪU BÁO CÁO ĐÁNH GIÁ CỦA ỦY BAN NHÂN DÂN CẤP XÃ
        <br />
        <span className="text-[10pt]">(Ban hành kèm theo Quyết định số 148/QĐ-TTg ngày 24/02/2023 và sửa đổi theo Quyết định số 1489/QĐ-TTg của Thủ tướng Chính phủ)</span>
      </div>

      {/* 2-Column Administrative Header */}
      <table className="w-full border-none mb-3" style={{ borderCollapse: 'collapse' }}>
        <tbody>
          <tr>
            <td className="w-[45%] align-top text-center p-0">
              <p className="text-[12pt] uppercase tracking-tight">ỦY BAN NHÂN DÂN</p>
              <p className="text-[12pt] font-bold uppercase tracking-tight">{communeName.toUpperCase()}</p>
              <div className="w-24 border-b border-black mx-auto mt-1 mb-1"></div>
              <p className="text-[12pt] text-slate-800">Số: 88/BC-UBND</p>
            </td>
            <td className="w-[55%] align-top text-center p-0">
              <p className="text-[12pt] font-bold uppercase tracking-tight">CỘNG HÒA XÃ HỘI CHỦ NGHĨA VIỆT NAM</p>
              <p className="text-[13pt] font-bold tracking-normal">Độc lập - Tự do - Hạnh phúc</p>
              <div className="w-40 border-b border-black mx-auto mt-1 mb-2"></div>
              <p className="text-[13pt] italic">{communeName}, ngày {day} tháng {month} năm {year}</p>
            </td>
          </tr>
        </tbody>
      </table>

      {/* Title */}
      <div className="text-center my-4 space-y-1">
        <h2 className="text-[15pt] font-bold uppercase tracking-tight">
          BÁO CÁO
        </h2>
        <p className="text-[13pt] font-bold">
          Về việc đánh giá một số nội dung của Hồ sơ sản phẩm đăng ký tham gia
          <br />
          đánh giá sản phẩm OCOP
        </p>
      </div>

      {/* ===================== PHẦN I ===================== */}
      <div className="space-y-2 mt-4 text-[13pt]">
        <p className="font-bold uppercase text-[13pt]">
          I. THÔNG TIN CHUNG VỀ HỒ SƠ ĐĂNG KÝ
        </p>

        <div className="space-y-1.5 pl-4 leading-relaxed">
          <p>
            1. Tên chủ thể: <strong>{dossier.subjectName}</strong>
          </p>
          <p>
            2. Loại hình tổ chức: <strong>Hợp tác xã</strong>
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
            6. Sản phẩm đăng ký đánh giá: <strong>{dossier.productName}</strong>
          </p>
        </div>
      </div>

      {/* ===================== PHẦN II ===================== */}
      <div className="space-y-3 mt-5 text-[13pt]">
        <p className="font-bold uppercase text-[13pt]">
          II. ĐÁNH GIÁ MỘT SỐ NỘI DUNG CỦA HỒ SƠ ĐĂNG KÝ
        </p>

        <div className="space-y-3 pl-4 leading-relaxed text-justify">
          <div>
            <p className="font-bold">
              1. Về sử dụng nguyên liệu địa phương:
            </p>
            <p className="italic text-[12pt] text-slate-700">
              (Nội dung thể hiện rõ mô tả của chủ thể và đánh giá về tình hình sử dụng nguyên liệu thực tế của chủ thể trên địa bàn xã).
            </p>
            <p className="mt-1 indent-8">
              Ủy ban nhân dân xã xác nhận: 100% diện tích canh tác (280 ha nhà kính công nghệ cao) và toàn bộ sản lượng ớt chuông Sweet Palermo của chủ thể được canh tác thực tế trên địa bàn xã Gia Lâm và các vùng liên kết lân cận. Nguồn nguyên liệu nông sản hoàn toàn tại chỗ, phát huy tối đa lợi thế đất đai thổ nhưỡng địa phương, không có hiện tượng thu gom trôi nổi từ nơi khác.
            </p>
          </div>

          <div>
            <p className="font-bold">
              2. Về sử dụng lao động địa phương:
            </p>
            <p className="italic text-[12pt] text-slate-700">
              (Nội dung thể hiện rõ mô tả của chủ thể và đánh giá về tình hình sử dụng thực tế về lao động địa phương của chủ thể trên địa bàn xã).
            </p>
            <p className="mt-1 indent-8">
              Ủy ban nhân dân xã xác nhận: Hợp tác xã đang tạo việc làm và thu nhập ổn định cho 165 hộ gia đình nông dân xã viên và 48 lao động trực tiếp tại địa phương. Thu nhập bình quân của người lao động đạt từ 11 - 14 triệu đồng/người/tháng. Đơn vị chấp hành nghiêm túc quy định về an toàn lao động và tích cực tham gia các phong trào xây dựng nông thôn mới.
            </p>
          </div>

          <div>
            <p className="font-bold">
              3. Nguồn gốc ý tưởng sản phẩm:
            </p>
            <p className="italic text-[12pt] text-slate-700">
              (Nhận xét về nguồn gốc sản phẩm (truyền thống, sản phẩm mới) của chủ thể dựa trên thực tế của địa phương).
            </p>
            <p className="mt-1 indent-8">
              Ủy ban nhân dân xã nhận xét: Sản phẩm ớt ngọt Sweet Palermo là sản phẩm nông sản mới có tính đột phá cao, phát triển dựa trên việc khai thác tiềm năng khí hậu mát mẻ và kỹ thuật canh tác nhà kính chuyên sâu của địa phương, mang lại hiệu quả kinh tế cao gấp nhiều lần so với các loại cây trồng truyền thống trước đây.
            </p>
          </div>

          <div>
            <p className="font-bold">
              4. Bản sắc/trí tuệ địa phương:
            </p>
            <p className="italic text-[12pt] text-slate-700">
              (Đánh giá về đặc điểm và mức độ thể hiện các giá trị về văn hóa, truyền thông (hình ảnh, câu chuyện,...) trên sản phẩm và hồ sơ của sản phẩm).
            </p>
            <p className="mt-1 indent-8">
              Ủy ban nhân dân xã đánh giá: Sản phẩm kết hợp hài hòa giữa kinh nghiệm canh tác cần cù truyền thống của nông dân địa phương với công nghệ quản lý hiện đại (VietGAP, nhật ký canh tác điện tử, tem QR GS1). Sản phẩm đã được cấp quyền sử dụng nhãn hiệu chứng nhận địa phương, câu chuyện sản phẩm chân thực, giàu bản sắc văn hóa nông thôn mới.
            </p>
          </div>
        </div>

        {/* Conclusion / Proposal */}
        <p className="indent-8 text-justify font-bold mt-4">
          Ủy ban nhân dân xã Gia Lâm đề nghị Ủy ban nhân dân huyện Lâm Hà đánh giá, phân hạng sản phẩm OCOP cho sản phẩm <strong>{dossier.productName}</strong> của <strong>{dossier.subjectName}</strong>.
        </p>
      </div>

      {/* Signature Section */}
      <table className="w-full border-none mt-8" style={{ borderCollapse: 'collapse' }}>
        <tbody>
          <tr>
            <td className="w-1/2 align-top text-left p-0 text-[11pt]">
              <p className="font-bold">Nơi nhận:</p>
              <p>- UBND huyện Lâm Hà (để b/c);</p>
              <p>- Phòng NN&PTNT huyện;</p>
              <p>- Chủ thể OCOP (để phối hợp);</p>
              <p>- Lưu: VT, ĐC-NN.</p>
            </td>
            <td className="w-1/2 align-top text-center p-0">
              <p className="font-bold text-[13pt] uppercase">TM. ỦY BAN NHÂN DÂN XÃ GIA LÂM</p>
              <p className="font-bold text-[13pt] uppercase text-slate-800">CHỦ TỊCH</p>
              <p className="italic text-[12pt]">(Ký tên và đóng dấu)</p>
              <div className="h-20 flex items-center justify-center">
                <div className="w-24 h-24 border-2 border-red-600/40 rounded-full flex flex-col items-center justify-center text-red-600/60 text-[8.5pt] font-bold select-none rotate-[-6deg]">
                  <span>UBND XÃ GIA LÂM</span>
                  <span className="text-[7pt]">ĐÃ ĐÓNG DẤU ĐỎ</span>
                  <span>{`${day}/${month}/${year}`}</span>
                </div>
              </div>
              <p className="font-bold text-[13pt] uppercase text-black">TRẦN VĂN QUANG</p>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  );
};
