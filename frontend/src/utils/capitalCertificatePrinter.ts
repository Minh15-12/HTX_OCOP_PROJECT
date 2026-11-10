import { CapitalCertificate } from '@/types/memberTypes';
import { openInteractivePrintWindow } from '@/utils/pdfExportUtils';

const nfc = (str?: string | number | null): string => {
  if (str === undefined || str === null) return '';
  return String(str)
    .normalize('NFC')
    .replace(/\s+([\u0300-\u036f])/g, '$1')
    .replace(/bằ\s+ng/gi, 'bằng')
    .replace(/cấ\s+p/gi, 'cấp')
    .replace(/Giấ\s+y/gi, 'Giấy')
    .replace(/LÂM\s+ĐỒ\s+NG/gi, 'LÂM ĐỒNG')
    .replace(/Đô\s+ng/gi, 'Đồng')
    .replace(/Số\s+́/gi, 'Số')
    .replace(/Số́/g, 'Số')
    .replace(/cấ\s*p/gi, 'cấp')
    .replace(/Giấ\s*y/gi, 'Giấy')
    .replace(/Thị\s+trấ\s*n/gi, 'Thị trấn')
    .replace(/trấ\s*n/gi, 'trấn')
    .replace(/ĐINH\s+VĂN/gi, 'Đinh Văn')
    .replace(/LÂM\s+HÀ/gi, 'Lâm Hà')
    .replace(/LÂM\s+ĐỒ̀\s*NG/gi, 'LÂM ĐỒNG')
    .normalize('NFC');
};

export const printCapitalCertificateDocument = (cert: CapitalCertificate): boolean => {
  const htmlContent = `
<!DOCTYPE html>
<html lang="vi">
<head>
  <meta charset="UTF-8">
  <title>Giấy Chứng Nhận Vốn Góp - ${cert.certificate_code}</title>
  <style>
    @page { size: A4 portrait; margin: 15mm; }
    body {
      font-family: 'Times New Roman', Times, serif;
      color: #0f172a;
      background: #ffffff;
      margin: 0;
      padding: 10px;
      line-height: 1.4;
      font-size: 13.5pt;
    }
    .cert-frame {
      border: 3px double #047857;
      padding: 24px;
      position: relative;
    }
    .text-center { text-align: center; }
    .uppercase { text-transform: uppercase; }
    .font-bold { font-weight: bold; }
    .national-header {
      font-size: 12pt;
      font-weight: bold;
      text-align: center;
      line-height: 1.25;
    }
    .national-header span {
      display: inline-block;
      border-bottom: 1.5px solid #0f172a;
      padding-bottom: 2px;
    }
    .coop-header {
      font-size: 11pt;
      font-weight: bold;
      text-align: center;
      line-height: 1.25;
    }
    .cert-title {
      font-size: 19pt;
      font-weight: 900;
      color: #065f46;
      text-align: center;
      margin: 18px 0 6px 0;
      letter-spacing: 0.5px;
    }
    .cert-code {
      font-size: 11pt;
      font-style: italic;
      text-align: center;
      color: #334155;
      margin-bottom: 15px;
    }
    .legal-basis {
      font-size: 11pt;
      font-style: italic;
      color: #334155;
      margin-bottom: 12px;
      line-height: 1.35;
      text-align: justify;
    }
    .content-table {
      width: 100%;
      border-collapse: collapse;
      margin: 12px 0;
      font-size: 12.5pt;
    }
    .content-table td {
      padding: 4px 0;
      vertical-align: top;
    }
    .label {
      width: 38%;
      color: #1e293b;
    }
    .value {
      width: 62%;
      font-weight: bold;
      color: #0f172a;
    }
    .signatures {
      width: 100%;
      margin-top: 30px;
    }
    .sig-col {
      width: 50%;
      text-align: center;
      vertical-align: top;
      font-size: 12pt;
    }
    .stamp-box {
      height: 75px;
    }
  </style>
</head>
<body>
  <div class="cert-frame">
    <table style="width: 100%; margin-bottom: 10px;">
      <tr>
        <td style="width: 48%; vertical-align: top;" class="coop-header">
          ${nfc(cert.cooperative_name).toUpperCase()}<br>
          <span style="font-weight: normal; font-size: 10pt;">Địa chỉ: ${nfc(cert.cooperative_address)}</span>
        </td>
        <td style="width: 52%; vertical-align: top;" class="national-header">
          CỘNG HÒA XÃ HỘI CHỦ NGHĨA VIỆT NAM<br>
          <span>Độc lập - Tự do - Hạnh phúc</span>
        </td>
      </tr>
    </table>

    <div class="cert-title uppercase">GIẤY CHỨNG NHẬN PHẦN VỐN GÓP</div>
    <div class="cert-code">Số: ${cert.certificate_code} &bull; Cấp lần thứ ${cert.issue_count}</div>

    <div class="legal-basis">
      - ${cert.legal_base_law}<br>
      - ${cert.legal_base_charter}<br>
      - Căn cứ Sổ đăng ký thành viên và các phiếu thu góp vốn thực tế tại Hợp tác xã.
    </div>

    <div style="text-align: center; font-weight: bold; font-size: 13pt; margin: 10px 0; color: #065f46;">
      CHỨNG NHẬN THÀNH VIÊN HỢP TÁC XÃ
    </div>

    <table class="content-table">
      <tr>
        <td class="label">Họ và tên thành viên:</td>
        <td class="value uppercase" style="font-size: 13.5pt; color: #065f46;">${nfc(cert.member_full_name)}</td>
      </tr>
      <tr>
        <td class="label">Ngày sinh:</td>
        <td class="value">${cert.member_dob || '15/06/1980'} &nbsp;&nbsp;&nbsp;&nbsp; Giới tính: ${cert.member_gender || 'Nam'}</td>
      </tr>
      <tr>
        <td class="label">Số CCCD/Định danh:</td>
        <td class="value">${cert.member_cccd || '---'}</td>
      </tr>
      <tr>
        <td class="label">Địa chỉ thường trú:</td>
        <td class="value">${nfc(cert.member_address)}</td>
      </tr>
      <tr>
        <td class="label">Tổng giá trị vốn góp thực tế:</td>
        <td class="value" style="font-size: 14pt; color: #065f46;">
          ${cert.total_capital_amount.toLocaleString('vi-VN')} VNĐ
        </td>
      </tr>
      <tr>
        <td class="label">Bằng chữ:</td>
        <td class="value" style="font-style: italic;">${nfc(cert.capital_in_words)}</td>
      </tr>
      <tr>
        <td class="label">Hình thức góp vốn:</td>
        <td class="value">${cert.contribution_form}</td>
      </tr>
      <tr>
        <td class="label">Thời điểm hoàn thành góp vốn:</td>
        <td class="value">${cert.contribution_date}</td>
      </tr>
    </table>

    <table class="signatures">
      <tr>
        <td class="sig-col">
          <br>
          <strong>THÀNH VIÊN GÓP VỐN</strong><br>
          <span style="font-size: 10.5pt; font-style: italic;">(Ký và ghi rõ họ tên)</span>
          <div class="stamp-box"></div>
          <strong>${nfc(cert.member_full_name)}</strong>
        </td>
        <td class="sig-col">
          <em>${nfc(cert.issue_place)}, ngày ${new Date().getDate()} tháng ${new Date().getMonth() + 1} năm ${new Date().getFullYear()}</em><br>
          <strong>TM. HỘI ĐỒNG QUẢN TRỊ / GIÁM ĐỐC</strong><br>
          <span style="font-size: 10.5pt; font-style: italic;">(Ký tên, đóng dấu)</span>
          <div class="stamp-box"></div>
          <strong>${nfc(cert.representative_name)}</strong>
        </td>
      </tr>
    </table>
  </div>
</body>
</html>
  `;

  openInteractivePrintWindow(
    htmlContent,
    `Giấy Chứng Nhận Vốn Góp - ${cert.certificate_code}`,
    `chung_nhan_von_gop_${cert.certificate_code}.html`
  );

  return true;
};
