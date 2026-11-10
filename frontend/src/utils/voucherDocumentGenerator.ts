import { Member, CapitalTransaction } from '@/types/memberTypes';
import { openInteractivePrintWindow } from '@/utils/pdfExportUtils';

/**
 * Safely escapes HTML special characters to prevent DOM-based XSS attacks.
 */
export const escapeHtml = (val: unknown): string => {
  if (val === null || val === undefined) return '';
  return String(val)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
    .replace(/\//g, '&#x2F;');
};

/**
 * Common Content-Security-Policy meta tag for print documents to disallow script execution.
 */
const CSP_META = `<meta http-equiv="Content-Security-Policy" content="default-src 'none'; style-src 'unsafe-inline'; font-src 'self' data:;">`;

/**
 * Utility to generate HTML printable documents based on the 3 template specs in /docs:
 * 1. giaybiennhantienmat.md (Giấy biên nhận nộp tiền góp vốn tiền mặt)
 * 2. giayxacnhancknganhang.md (Giấy xác nhận chuyển khoản góp vốn)
 * 3. bienbandinhgia.md (Biên bản định giá tài sản góp vốn)
 */

export const generateCashReceiptHTML = (member: Partial<Member>, tx?: Partial<CapitalTransaction>): string => {
  const code = tx?.receipt_number || tx?.transaction_code || `PT-${member.member_code || '001'}`;
  const amount = tx?.amount ?? member.contributed_capital ?? member.committed_capital ?? 0;
  const committed = member.committed_capital || amount;
  const inWords = member.capital_in_words || (amount > 0 ? `${amount.toLocaleString('vi-VN')} đồng` : 'Không đồng');
  const today = tx?.contribution_date || new Date().toISOString().split('T')[0];

  const day = today.split('-')[2] || '18';
  const month = today.split('-')[1] || '09';
  const year = today.split('-')[0] || '2026';

  return `<!DOCTYPE html>
<html lang="vi">
<head>
  <meta charset="UTF-8">
  ${CSP_META}
  <title>Giấy biên nhận nộp tiền - ${escapeHtml(code)}</title>
  <style>
    @media print {
      @page { size: A4 portrait; margin: 15mm; }
      body { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
    }
    body {
      font-family: 'Times New Roman', Times, serif;
      font-size: 13pt;
      line-height: 1.5;
      color: #000;
      background: #fff;
      padding: 20px;
      max-width: 800px;
      margin: 0 auto;
    }
    .header-table { width: 100%; border-collapse: collapse; margin-bottom: 15px; }
    .header-table td { vertical-align: top; }
    .org-title { font-weight: bold; font-size: 11pt; text-transform: uppercase; }
    .doc-code { font-weight: bold; font-size: 11pt; }
    .national-title { font-weight: bold; font-size: 11pt; text-align: center; }
    .doc-header { text-align: center; margin: 20px 0 15px 0; }
    .doc-header h2 { font-size: 16pt; font-weight: bold; text-transform: uppercase; margin: 0; }
    .doc-header p { font-style: italic; font-size: 11pt; margin-top: 3px; }
    .section-head { font-weight: bold; margin-top: 12px; }
    .content-list { margin-left: 15px; }
    .sig-table { width: 100%; margin-top: 35px; border-collapse: collapse; page-break-inside: avoid; }
    .sig-table td { text-align: center; vertical-align: top; width: 50%; font-size: 11pt; }
    .sig-title { font-weight: bold; text-transform: uppercase; }
    .sig-space { height: 80px; }
  </style>
</head>
<body>
  <table class="header-table">
    <tr>
      <td style="width: 50%;">
        <div class="org-title">HỢP TÁC XÃ NÔNG NGHIỆP DỊCH VỤ OCOP MÊ LINH</div>
        <div>Địa chỉ: Xã Mê Linh, Huyện Lâm Hà, Tỉnh Lâm Đồng</div>
        <div>Mã số thuế: 5801489123</div>
        <div class="doc-code">Số: ${escapeHtml(code)}/PT-VG2026</div>
      </td>
      <td style="width: 50%; text-align: center;">
        <div class="national-title">CỘNG HÒA XÃ HỘI CHỦ NGHĨA VIỆT NAM</div>
        <div style="font-weight: bold;">Độc lập - Tự do - Hạnh phúc</div>
        <div>---------***---------</div>
      </td>
    </tr>
  </table>

  <div class="doc-header">
    <h2>GIẤY BIÊN NHẬN NỘP TIỀN GÓP VỐN</h2>
    <p>(Kiêm Phiếu thu tiền góp vốn điều lệ đợt 1)</p>
  </div>

  <p style="text-indent: 20px;">Hôm nay, ngày ${escapeHtml(day)} tháng ${escapeHtml(month)} năm ${escapeHtml(year)}, tại Văn phòng Hợp tác xã Nông nghiệp Dịch vụ OCOP Mê Linh, chúng tôi gồm có:</p>

  <div class="section-head">I. BÊN NỘP TIỀN (XÃ VIÊN / NGƯỜI ĐĂNG KÝ GIA NHẬP):</div>
  <div class="content-list">
    <div>• Họ và tên: <strong>${escapeHtml(member.full_name || 'Nguyễn Thành Đạt')}</strong></div>
    <div>• Số CCCD/Định danh: <strong>${escapeHtml(member.cccd || '049092008888')}</strong> &nbsp;&nbsp; Ngày cấp: ${escapeHtml(member.cccd_issue_date || '01/01/2021')} &nbsp;&nbsp; Nơi cấp: ${escapeHtml(member.cccd_issue_place || 'Cục CSQLHC về TTXH')}</div>
    <div>• Số điện thoại: ${escapeHtml(member.phone || '0966778899')}</div>
    <div>• Địa chỉ thường trú: ${escapeHtml(member.address || 'Thôn 2, Xã Mê Linh, Huyện Lâm Hà, Lâm Đồng')}</div>
    <div>• Loại thành viên đăng ký: <strong>[X] Thành viên chính thức</strong> &nbsp;&nbsp;&nbsp;&nbsp; [ ] Thành viên liên kết góp vốn</div>
  </div>

  <div class="section-head">II. BÊN NHẬN TIỀN (ĐẠI DIỆN HỢP TÁC XÃ):</div>
  <div class="content-list">
    <div>• Họ và tên người nhận: <strong>Nguyễn Văn A</strong></div>
    <div>• Chức vụ: Kế toán trưởng / Thủ quỹ HTX</div>
  </div>

  <div class="section-head">III. NỘI DUNG NỘP TIỀN:</div>
  <div class="content-list">
    <div>• Tổng số vốn cam kết góp: <strong>${committed.toLocaleString('vi-VN')} VNĐ</strong></div>
    <div>• Phương thức góp: <strong>${escapeHtml(member.contribution_method || 'Góp một lần (Nộp 100% ngay)')}</strong></div>
    <div>• Số tiền nộp đợt này: <strong style="font-size: 14pt; color: #15803d;">${amount.toLocaleString('vi-VN')} VNĐ</strong></div>
    <div>• Bằng chữ: <em>${escapeHtml(inWords)}</em></div>
    <div>• Lý do nộp: ${escapeHtml(tx?.content || 'Nộp đủ 100% vốn điều lệ đợt 1 để hoàn tất hồ sơ đăng ký thành viên mới theo quy định của Luật HTX 2023.')}</div>
    <div>• Tình trạng công nợ vốn sau khi nộp: <strong>0 VNĐ</strong> (Đã đủ điều kiện cấp Giấy chứng nhận phần vốn góp).</div>
  </div>

  <p style="font-style: italic; margin-top: 15px; font-size: 11pt;">Giấy biên nhận này được lập thành 02 bản (mỗi bên giữ 01 bản) và được quét đính kèm trên phần mềm quản lý HTX làm căn cứ xác nhận phần vốn góp.</p>

  <table class="sig-table">
    <tr>
      <td style="width: 50%;">
        <div class="sig-title">NGƯỜI NỘP TIỀN</div>
        <div style="font-style: italic; font-size: 10pt;">(Ký và ghi rõ họ tên)</div>
        <div class="sig-space"></div>
        <div><strong>${escapeHtml(member.full_name || 'Nguyễn Thành Đạt')}</strong></div>
      </td>
      <td style="width: 50%;">
        <div class="sig-title">NGƯỜI THU TIỀN (KẾ TOÁN/THỦ QUỸ)</div>
        <div style="font-style: italic; font-size: 10pt;">(Ký và ghi rõ họ tên)</div>
        <div class="sig-space"></div>
        <div><strong>Nguyễn Văn A</strong></div>
      </td>
    </tr>
  </table>
</body>
</html>`;
};

export const generateBankTransferConfirmHTML = (member: Partial<Member>, tx?: Partial<CapitalTransaction>): string => {
  const code = tx?.receipt_number || tx?.transaction_code || `UNC-${member.member_code || '001'}`;
  const amount = tx?.amount ?? member.contributed_capital ?? member.committed_capital ?? 0;
  const inWords = member.capital_in_words || (amount > 0 ? `${amount.toLocaleString('vi-VN')} đồng` : 'Không đồng');
  const today = tx?.contribution_date || new Date().toISOString().split('T')[0];

  const day = today.split('-')[2] || '18';
  const month = today.split('-')[1] || '09';
  const year = today.split('-')[0] || '2026';

  return `<!DOCTYPE html>
<html lang="vi">
<head>
  <meta charset="UTF-8">
  ${CSP_META}
  <title>Giấy xác nhận chuyển khoản - ${escapeHtml(code)}</title>
  <style>
    @media print {
      @page { size: A4 portrait; margin: 15mm; }
      body { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
    }
    body {
      font-family: 'Times New Roman', Times, serif;
      font-size: 13pt;
      line-height: 1.5;
      color: #000;
      background: #fff;
      padding: 20px;
      max-width: 800px;
      margin: 0 auto;
    }
    .national-title { font-weight: bold; font-size: 12pt; text-align: center; }
    .doc-header { text-align: center; margin: 25px 0 20px 0; }
    .doc-header h2 { font-size: 16pt; font-weight: bold; text-transform: uppercase; margin: 0; }
    .info-block { margin-left: 15px; margin-bottom: 15px; }
    .sig-table { width: 100%; margin-top: 40px; border-collapse: collapse; page-break-inside: avoid; }
    .sig-table td { text-align: center; vertical-align: top; width: 100%; font-size: 11pt; }
  </style>
</head>
<body>
  <div class="national-title">CỘNG HÒA XÃ HỘI CHỦ NGHĨA VIỆT NAM</div>
  <div style="font-weight: bold; text-align: center;">Độc lập - Tự do - Hạnh phúc</div>
  <div style="text-align: center;">---------***---------</div>

  <div class="doc-header">
    <h2>GIẤY XÁC NHẬN CHUYỂN KHOẢN GÓP VỐN ĐIỀU LỆ</h2>
  </div>

  <p style="text-align: center; font-style: italic;">Kính gửi: Ban Quản trị / Kế toán Hợp tác xã Nông nghiệp Dịch vụ OCOP Mê Linh</p>

  <p>Tôi tên là: <strong>${escapeHtml(member.full_name || 'Võ Văn G')}</strong></p>
  <p>Số CCCD: <strong>${escapeHtml(member.cccd || '049093009999')}</strong> &nbsp;&nbsp; Ngày cấp: ${escapeHtml(member.cccd_issue_date || '05/05/2021')} &nbsp;&nbsp; Nơi cấp: ${escapeHtml(member.cccd_issue_place || 'Cục CSQLHC về TTXH')}</p>
  <p>Địa chỉ: ${escapeHtml(member.address || 'Thôn 3, Xã Mê Linh, Huyện Lâm Hà, Lâm Đồng')}</p>
  <p>Số điện thoại: ${escapeHtml(member.phone || '0977889900')}</p>

  <p>Tôi đã thực hiện giao dịch chuyển khoản góp vốn gia nhập Hợp tác xã với thông tin chi tiết như sau:</p>

  <div class="info-block">
    <div>1. Số tiền đã chuyển: <strong style="font-size: 13.5pt; color: #0284c7;">${amount.toLocaleString('vi-VN')} VNĐ</strong> (Bằng chữ: <em>${escapeHtml(inWords)}</em>)</div>
    <div>2. Chuyển vào tài khoản số: <strong>1234567890</strong> tại Ngân hàng <strong>Vietcombank - CN Lâm Đồng</strong></div>
    <div>3. Đơn vị thụ hưởng: <strong>HỢP TÁC XÃ NÔNG NGHIỆP DỊCH VỤ OCOP MÊ LINH</strong></div>
    <div>4. Mã giao dịch ngân hàng / Số chứng từ: <strong style="font-family: monospace; font-weight: bold;">${escapeHtml(code)}</strong></div>
    <div>5. Thời gian chuyển: 09:30 ngày ${escapeHtml(day)}/${escapeHtml(month)}/${escapeHtml(year)}</div>
    <div>6. Nội dung chuyển tiền: <em>"${escapeHtml(member.full_name)} ${escapeHtml(member.cccd)} nop tien gop von HTX dot 1"</em></div>
  </div>

  <p style="text-indent: 20px;">Kính đề nghị Ban Quản trị Hợp tác xã kiểm tra tài khoản, đối soát hệ thống và xác nhận hồ sơ nộp vốn đợt 1 để hoàn thành thủ tục kết nạp xã viên chính thức.</p>

  <table class="sig-table">
    <tr>
      <td style="text-align: right; padding-right: 40px;">
        <div style="font-style: italic;">Lâm Đồng, ngày ${escapeHtml(day)} tháng ${escapeHtml(month)} năm ${escapeHtml(year)}</div>
        <div style="font-weight: bold; margin-top: 5px; text-transform: uppercase;">NGƯỜI LẬP GIẤY</div>
        <div style="font-style: italic; font-size: 10pt;">(Ký và ghi rõ họ tên)</div>
        <div style="height: 70px;"></div>
        <div><strong>${escapeHtml(member.full_name || 'Võ Văn G')}</strong></div>
      </td>
    </tr>
  </table>
</body>
</html>`;
};

export const generateAssetValuationHTML = (member: Partial<Member>, tx?: Partial<CapitalTransaction>): string => {
  const code = tx?.receipt_number || tx?.transaction_code || `BB-${member.member_code || '001'}`;
  const amount = tx?.amount || member.contributed_capital || member.committed_capital || 20000000;
  const inWords = member.capital_in_words || 'Hai mươi triệu đồng chẵn';
  const today = tx?.contribution_date || new Date().toISOString().split('T')[0];

  const day = today.split('-')[2] || '18';
  const month = today.split('-')[1] || '09';
  const year = today.split('-')[0] || '2026';

  return `<!DOCTYPE html>
<html lang="vi">
<head>
  <meta charset="UTF-8">
  ${CSP_META}
  <title>Biên bản định giá tài sản - ${escapeHtml(code)}</title>
  <style>
    @media print {
      @page { size: A4 portrait; margin: 12mm; }
      body { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
    }
    body {
      font-family: 'Times New Roman', Times, serif;
      font-size: 12pt;
      line-height: 1.45;
      color: #000;
      background: #fff;
      padding: 20px;
      max-width: 800px;
      margin: 0 auto;
    }
    .header-table { width: 100%; border-collapse: collapse; margin-bottom: 10px; }
    .header-table td { vertical-align: top; }
    .org-title { font-weight: bold; font-size: 10.5pt; text-transform: uppercase; }
    .doc-header { text-align: center; margin: 15px 0 10px 0; }
    .doc-header h2 { font-size: 15pt; font-weight: bold; text-transform: uppercase; margin: 0; }
    .doc-header p { font-style: italic; font-size: 10.5pt; margin-top: 2px; }
    .section-head { font-weight: bold; margin-top: 10px; text-transform: uppercase; }
    .sig-table { width: 100%; margin-top: 30px; border-collapse: collapse; page-break-inside: avoid; }
    .sig-table td { text-align: center; vertical-align: top; width: 50%; font-size: 10.5pt; }
  </style>
</head>
<body>
  <table class="header-table">
    <tr>
      <td style="width: 50%;">
        <div class="org-title">HỢP TÁC XÃ NÔNG NGHIỆP DỊCH VỤ OCOP MÊ LINH</div>
        <div>Địa chỉ: Xã Mê Linh, Huyện Lâm Hà, Lâm Đồng</div>
        <div>Mã số thuế: 5801489123</div>
        <div><strong>Số: ${escapeHtml(code)}/BBĐG-HTX2026</strong></div>
      </td>
      <td style="width: 50%; text-align: center;">
        <div style="font-weight: bold; font-size: 11pt;">CỘNG HÒA XÃ HỘI CHỦ NGHĨA VIỆT NAM</div>
        <div style="font-weight: bold;">Độc lập - Tự do - Hạnh phúc</div>
        <div>---------***---------</div>
      </td>
    </tr>
  </table>

  <div class="doc-header">
    <h2>BIÊN BẢN ĐỊNH GIÁ TÀI SẢN GÓP VỐN VÀO HỢP TÁC XÃ</h2>
    <p>(Theo quy định tại Điều 73 và Điều 77 Luật Hợp tác xã năm 2023)</p>
  </div>

  <p style="text-indent: 20px;">Hôm nay, vào hồi 09 giờ 00 ngày ${escapeHtml(day)} tháng ${escapeHtml(month)} năm ${escapeHtml(year)}, tại Văn phòng Hợp tác xã Nông nghiệp Dịch vụ OCOP Mê Linh, chúng tôi gồm có:</p>

  <div class="section-head">I. THÀNH PHẦN HỘI ĐỒNG ĐỊNH GIÁ:</div>
  <div>1. <strong>Đại diện Hợp tác xã:</strong></div>
  <div style="margin-left: 15px;">
    <div>• Ông/Bà: <strong>Nguyễn Văn A</strong> - Chức vụ: Chủ tịch HĐQT / Giám đốc HTX - Chủ tịch Hội đồng.</div>
    <div>• Ông/Bà: <strong>Trần Thị B</strong> - Chức vụ: Kế toán trưởng - Thành viên.</div>
    <div>• Ông/Bà: <strong>Lê Văn C</strong> - Chức vụ: Trưởng Ban Kiểm soát HTX - Thành viên giám sát.</div>
  </div>
  <div>2. <strong>Thành viên góp vốn bằng tài sản:</strong></div>
  <div style="margin-left: 15px;">
    <div>• Họ và tên: <strong>${escapeHtml(member.full_name || 'Lê Văn C')}</strong></div>
    <div>• Số CCCD: <strong>${escapeHtml(member.cccd || '049082001111')}</strong> &nbsp;&nbsp; SĐT: ${escapeHtml(member.phone || '0988112233')}</div>
    <div>• Địa chỉ: ${escapeHtml(member.address || 'Thôn 1, Xã Mê Linh, Huyện Lâm Hà, Lâm Đồng')}</div>
  </div>

  <div class="section-head">II. NỘI DUNG VÀ KẾT QUẢ ĐỊNH GIÁ TÀI SẢN:</div>
  <p>Các bên đã tiến hành kiểm tra thực tế tình trạng kỹ thuật, tính pháp lý của tài sản và nhất trí định giá tài sản góp vốn như sau:</p>
  <div style="margin-left: 15px;">
    <div>1. Tên tài sản: <strong>Máy cày nông nghiệp Kubota L5018 & Hệ thống phun thuốc áp lực cao</strong></div>
    <div>2. Tình trạng kỹ thuật: Mới 90% (Vận hành tốt, đầy đủ phụ tùng đính kèm).</div>
    <div>3. Thỏa thuận giá trị định giá quy đổi: <strong style="font-size: 13pt; color: #15803d;">${amount.toLocaleString('vi-VN')} VNĐ</strong></div>
    <div>4. Bằng chữ: <em>${escapeHtml(inWords)}</em></div>
    <div>5. Tỷ lệ hoàn thành nghĩa vụ vốn: <strong>Đạt 100% mức vốn cam kết</strong>.</div>
  </div>

  <div class="section-head">III. CAM KẾT VÀ BÀN GIAO:</div>
  <p>Thành viên góp vốn cam kết tài sản trên thuộc quyền sở hữu hợp pháp, không tranh chấp, không thế chấp. Biên bản này được lập thành 03 bản làm căn cứ xác nhận phần vốn góp.</p>

  <table class="sig-table">
    <tr>
      <td>
        <div style="font-weight: bold;">THÀNH VIÊN GÓP VỐN</div>
        <div style="font-style: italic; font-size: 9.5pt;">(Ký và ghi rõ họ tên)</div>
        <div style="height: 60px;"></div>
        <div><strong>${escapeHtml(member.full_name || 'Lê Văn C')}</strong></div>
      </td>
      <td>
        <div style="font-weight: bold;">ĐẠI DIỆN HỘI ĐỒNG ĐỊNH GIÁ HTX</div>
        <div style="font-style: italic; font-size: 9.5pt;">(Ký, đóng dấu xác nhận)</div>
        <div style="height: 60px;"></div>
        <div><strong>CHỦ TỊCH HĐQT: Nguyễn Văn A</strong></div>
      </td>
    </tr>
  </table>
</body>
</html>`;
};

export const getVoucherHtml = (member: Partial<Member>, tx?: Partial<CapitalTransaction>): string => {
  if (member.capital_form === 'HIEN_VAT' || tx?.payment_method === 'ASSET') {
    return generateAssetValuationHTML(member, tx);
  } else if (member.payout_method === 'BANK_TRANSFER' || tx?.payment_method === 'BANK_TRANSFER') {
    return generateBankTransferConfirmHTML(member, tx);
  } else {
    return generateCashReceiptHTML(member, tx);
  }
};

export const getVoucherDocumentBlobUrl = (member: Partial<Member>, tx?: Partial<CapitalTransaction>): string => {
  const html = getVoucherHtml(member, tx);
  const blob = new Blob([html], { type: 'text/html;charset=utf-8' });
  return URL.createObjectURL(blob);
};

export const openVoucherPrintWindow = (member: Partial<Member>, tx?: Partial<CapitalTransaction>) => {
  let html = '';
  let docTitle = 'Giấy biên nhận nộp tiền';
  let filename = 'bien_nhan_gop_von.html';

  if (member.capital_form === 'HIEN_VAT' || tx?.payment_method === 'ASSET') {
    html = generateAssetValuationHTML(member, tx);
    docTitle = 'Biên bản định giá tài sản';
    filename = 'bien_ban_dinh_gia.html';
  } else if (member.payout_method === 'BANK_TRANSFER' || tx?.payment_method === 'BANK_TRANSFER') {
    html = generateBankTransferConfirmHTML(member, tx);
    docTitle = 'Giấy xác nhận chuyển khoản ngân hàng';
    filename = 'xac_nhan_chuyen_khoan.html';
  } else {
    html = generateCashReceiptHTML(member, tx);
    docTitle = 'Giấy biên nhận nộp tiền mặt';
    filename = 'bien_nhan_tien_mat.html';
  }

  openInteractivePrintWindow(html, docTitle, filename);
};
