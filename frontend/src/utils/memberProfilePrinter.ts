import { Member, MEMBER_TYPE_LABELS } from '@/types/memberTypes';
import { openInteractivePrintWindow } from '@/utils/pdfExportUtils';

export const printMemberProfileDocument = (
  m: Member,
  cooperativeName = 'HỢP TÁC XÃ NÔNG NGHIỆP'
): boolean => {
  const today = new Date();
  const dateStr = `Ngày ${today.getDate()} tháng ${today.getMonth() + 1} năm ${today.getFullYear()}`;
  const memberTypeLabel = MEMBER_TYPE_LABELS[m.member_type] || m.member_type;

  const htmlContent = `
<!DOCTYPE html>
<html lang="vi">
<head>
  <meta charset="UTF-8">
  <title>Hồ sơ xã viên - ${m.full_name} (${m.member_code})</title>
  <style>
    @media print {
      @page { size: A4 portrait; margin: 12mm; }
      body { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
    }
    body {
      font-family: 'Times New Roman', Times, serif;
      font-size: 12.5pt;
      line-height: 1.45;
      color: #000;
      background: #fff;
      padding: 15px;
      margin: 0 auto;
      max-width: 800px;
    }
    .header-table { width: 100%; border-collapse: collapse; margin-bottom: 15px; }
    .header-table td { vertical-align: top; text-align: center; }
    .org-name { font-size: 11pt; font-weight: bold; text-transform: uppercase; }
    .national-motto { font-size: 11pt; font-weight: bold; }
    .national-sub { font-size: 11pt; border-bottom: 1px solid #000; display: inline-block; padding-bottom: 2px; margin-bottom: 8px; }
    .doc-title { text-align: center; margin: 15px 0 10px 0; }
    .doc-title h2 { font-size: 15pt; font-weight: bold; text-transform: uppercase; margin: 0; }
    .doc-title p { font-style: italic; font-size: 10.5pt; margin: 3px 0 0 0; }
    .section-title { font-weight: bold; font-size: 12.5pt; text-transform: uppercase; margin-top: 14px; margin-bottom: 6px; border-bottom: 1.5px solid #000; padding-bottom: 2px; }
    .info-table { width: 100%; border-collapse: collapse; margin-bottom: 10px; }
    .info-table td, .info-table th { border: 1px solid #333; padding: 5px 8px; font-size: 11pt; text-align: left; }
    .info-table th { background-color: #f2f2f2; font-weight: bold; }
    .field-label { font-weight: bold; width: 33%; color: #111; }
    .field-value { width: 67%; }
    .sig-table { width: 100%; margin-top: 25px; border-collapse: collapse; page-break-inside: avoid; }
    .sig-table td { text-align: center; vertical-align: top; width: 33.33%; font-size: 10.5pt; }
    .sig-title { font-weight: bold; text-transform: uppercase; }
    .sig-space { height: 70px; }
  </style>
</head>
<body>
  <table class="header-table">
    <tr>
      <td style="width: 45%;">
        <div class="org-name">${cooperativeName}</div>
        <div style="font-size: 9.5pt;">Mã số HTX: 0317892312</div>
        <div style="font-size: 9.5pt; font-style: italic;">Lâm Đồng, Việt Nam</div>
      </td>
      <td style="width: 55%;">
        <div class="national-motto">CỘNG HÒA XÃ HỘI CHỦ NGHĨA VIỆT NAM</div>
        <div class="national-sub">Độc lập - Tự do - Hạnh phúc</div>
      </td>
    </tr>
  </table>

  <div class="doc-title">
    <h2>SỔ TỜ KHAI HỒ SƠ XÃ VIÊN</h2>
    <p>Mã số xã viên: <strong>${m.member_code}</strong> &bull; Trạng thái: <strong>${m.status === 'ACTIVE' ? 'Đang hoạt động' : m.status === 'PENDING' ? 'Chờ duyệt' : 'Đã ngưng hoạt động'}</strong></p>
  </div>

  <div class="section-title">I. THÔNG TIN CÁ NHÂN XÃ VIÊN</div>
  <table class="info-table">
    <tr>
      <td class="field-label">Họ và tên xã viên:</td>
      <td class="field-value"><strong style="font-size: 12pt; text-transform: uppercase;">${m.full_name}</strong></td>
    </tr>
    <tr>
      <td class="field-label">Giới tính / Ngày sinh:</td>
      <td class="field-value">${m.gender || '—'} &nbsp;|&nbsp; Ngày sinh: ${m.dob || '—'}</td>
    </tr>
    <tr>
      <td class="field-label">Số CCCD (12 chữ số):</td>
      <td class="field-value"><strong>${m.cccd}</strong> &nbsp;|&nbsp; Ngày cấp: ${m.cccd_issue_date || '—'}</td>
    </tr>
    <tr>
      <td class="field-label">Nơi cấp CCCD:</td>
      <td class="field-value">${m.cccd_issue_place || '—'}</td>
    </tr>
    <tr>
      <td class="field-label">Địa chỉ đăng ký:</td>
      <td class="field-value">${m.address || m.detail_address || '—'}</td>
    </tr>
    <tr>
      <td class="field-label">Số điện thoại / Email:</td>
      <td class="field-value">${m.phone} &nbsp;|&nbsp; ${m.email || '—'}</td>
    </tr>
    <tr>
      <td class="field-label">Trình độ / Nghề nghiệp:</td>
      <td class="field-value">${m.education_level || '—'} &nbsp;|&nbsp; ${m.occupation || '—'}</td>
    </tr>
  </table>

  <div class="section-title">II. TÌNH HÌNH VỐN GÓP VÀ QUYỀN LỢI SỞ HỮU</div>
  <table class="info-table">
    <tr>
      <th style="width: 50%;">Chỉ tiêu Quản lý Vốn</th>
      <th style="width: 50%;">Giá trị ghi nhận</th>
    </tr>
    <tr>
      <td>Phân loại xã viên:</td>
      <td><strong>${memberTypeLabel}</strong></td>
    </tr>
    <tr>
      <td>Số vốn cam kết góp:</td>
      <td><strong>${(m.committed_capital || 0).toLocaleString('vi-VN')} ₫</strong></td>
    </tr>
    <tr>
      <td>Số vốn thực đã góp:</td>
      <td><strong style="color: #047857;">${(m.total_capital_contributed || 0).toLocaleString('vi-VN')} ₫</strong></td>
    </tr>
    <tr>
      <td>Vốn còn phải góp:</td>
      <td>${(m.remaining_capital || 0).toLocaleString('vi-VN')} ₫</td>
    </tr>
    <tr>
      <td>Số tiền bằng chữ:</td>
      <td><em>${m.capital_in_words || '—'}</em></td>
    </tr>
    <tr>
      <td>Số cổ phần / Tỷ lệ sở hữu:</td>
      <td><strong>${m.total_shares_held || 0} cổ phần</strong> (${m.ownership_percentage || 0}%)</td>
    </tr>
    <tr>
      <td>Trạng thái vốn góp:</td>
      <td>${m.capital_status === 'DU_VON' ? 'Đã góp đủ vốn' : 'Chưa góp đủ vốn'}</td>
    </tr>
  </table>

  <div class="section-title">III. THÔNG TIN TÀI KHOẢN THỤ HƯỞNG CỔ TỨC</div>
  <table class="info-table">
    <tr>
      <td class="field-label">Ngân hàng thụ hưởng:</td>
      <td class="field-value">${m.bank_name || '—'}</td>
    </tr>
    <tr>
      <td class="field-label">Số tài khoản:</td>
      <td class="field-value"><strong>${m.bank_account || '—'}</strong></td>
    </tr>
    <tr>
      <td class="field-label">Tên chủ tài khoản:</td>
      <td class="field-value">${m.account_holder || m.full_name}</td>
    </tr>
    <tr>
      <td class="field-label">Hình thức chi trả:</td>
      <td class="field-value">${m.payout_method === 'BANK_TRANSFER' ? 'Chuyển khoản ngân hàng' : 'Nhận tiền mặt'}</td>
    </tr>
  </table>

  <div class="section-title">IV. SẢN LƯỢNG NÔNG SẢN & NGHĨA VỤ CÔNG NỢ</div>
  <table class="info-table">
    <tr>
      <td class="field-label">Sản lượng cung ứng / năm:</td>
      <td class="field-value"><strong>${(m.annual_product_output_kg || 0).toLocaleString('vi-VN')} kg/năm</strong></td>
    </tr>
    <tr>
      <td class="field-label">Dư nợ công nợ hiện tại:</td>
      <td class="field-value">${(m.current_debt || 0) > 0 ? `${m.current_debt.toLocaleString('vi-VN')} ₫ (Có nợ)` : 'Không có dư nợ'}</td>
    </tr>
    <tr>
      <td class="field-label">Ngày chính thức gia nhập:</td>
      <td class="field-value">${m.join_date || '—'}</td>
    </tr>
  </table>

  <div style="text-align: right; font-style: italic; margin-top: 20px; font-size: 10.5pt;">
    ${dateStr}
  </div>

  <table class="sig-table">
    <tr>
      <td>
        <div class="sig-title">XÃ VIÊN KHÊU KHAI</div>
        <div style="font-style: italic; font-size: 9.5pt;">(Ký và ghi rõ họ tên)</div>
        <div class="sig-space"></div>
        <strong>${m.full_name}</strong>
      </td>
      <td>
        <div class="sig-title">KẾ TOÁN TRƯỞNG</div>
        <div style="font-style: italic; font-size: 9.5pt;">(Ký và ghi rõ họ tên)</div>
        <div class="sig-space"></div>
      </td>
      <td>
        <div class="sig-title">CHỦ TỊCH HĐQT</div>
        <div style="font-style: italic; font-size: 9.5pt;">(Ký tên và đóng dấu)</div>
        <div class="sig-space"></div>
      </td>
    </tr>
  </table>
</body>
</html>
  `;

  openInteractivePrintWindow(
    htmlContent,
    `Hồ sơ xã viên - ${m.full_name} (${m.member_code})`,
    `ho_so_xa_vien_${m.member_code}.html`
  );
  return true;
};
