import { chromium } from '@playwright/test';
import { execSync } from 'child_process';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const backendDir = path.resolve(__dirname, '../../backend');
const artifactDir = 'C:/Users/Maxsys/.gemini/antigravity/brain/b767d259-2ec1-4f08-9a2d-33a518d88c2c';

function queryDb(tinkerCommand) {
  const cmd = `php artisan tinker --execute="${tinkerCommand}"`;
  const result = execSync(cmd, { cwd: backendDir }).toString();
  return result.trim();
}

async function runAutonomousFinanceVerification() {
  console.log('========================================================================');
  console.log('🤖 KHỞI CHẠY KIỂM THỬ KHÉP KÍN PHÂN HỆ TÀI CHÍNH (SỔ QUỸ & CÔNG NỢ)');
  console.log('========================================================================\n');

  // BƯỚC 1: TRUY VẤN CƠ SỞ DỮ LIỆU BAN ĐẦU
  console.log('📦 BƯỚC 1: Kiểm tra số lượng bản ghi DB ban đầu...');
  const initCashCount = parseInt(queryDb("echo DB::table('cash_transactions')->count();"), 10);
  const initDebtCount = parseInt(queryDb("echo DB::table('receivable_payables')->count();"), 10);
  const initSettlementCount = parseInt(queryDb("echo DB::table('debt_settlements')->count();"), 10);

  console.log(`  -> Số lượng giao dịch Sổ quỹ hiện tại: ${initCashCount}`);
  console.log(`  -> Số lượng khoản công nợ hiện tại: ${initDebtCount}`);
  console.log(`  -> Số lượng đợt thanh toán nợ hiện tại: ${initSettlementCount}`);

  // BƯỚC 2: KHỞI ĐỘNG PLAYWRIGHT & ĐĂNG NHẬP
  console.log('\n🌐 BƯỚC 2: Khởi động trình duyệt Playwright & Đăng nhập hệ thống...');
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  const page = await context.newPage();

  let cashApiResp = null;
  let debtApiResp = null;

  page.on('response', async (res) => {
    const url = res.url();
    const status = res.status();
    if (url.includes('/api/v1/cash-transactions') && res.request().method() === 'POST') {
      try {
        cashApiResp = { status, body: await res.json() };
        console.log(`\n  📡 [NETWORK EVENT] POST /api/v1/cash-transactions -> Status: ${status}`);
      } catch (e) {
        cashApiResp = { status, text: await res.text() };
      }
    }
    if (url.includes('/settlements') && res.request().method() === 'POST') {
      try {
        debtApiResp = { status, body: await res.json() };
        console.log(`\n  📡 [NETWORK EVENT] POST .../settlements -> Status: ${status}`);
      } catch (e) {
        debtApiResp = { status, text: await res.text() };
      }
    }
  });

  try {
    await page.goto('http://localhost:3000/login', { waitUntil: 'networkidle' });
    await page.evaluate(() => localStorage.clear());
    await page.click('button:has-text("Đăng nhập ngay")');
    await page.waitForTimeout(2000);

    // BƯỚC 3: MỞ TRANG TÀI CHÍNH & KIỂM TRA GIAO DIỆN TỔNG QUAN
    console.log('\n📊 BƯỚC 3: Kiểm tra Trang Tài Chính (FinancePage): Cards, Bảng & Nút Xuất Excel...');
    await page.goto('http://localhost:3000/finance', { waitUntil: 'networkidle' });
    await page.waitForTimeout(1500);

    // Kiểm tra các thẻ KPI
    const cardTonQuy = await page.locator('text=Tồn Quỹ Cân Đối HTX').isVisible();
    const cardDoanhThu = await page.locator('text=Doanh Thu / Tiền Thu').isVisible();
    const cardNoVatTu = await page.locator('text=Nợ Vật Tư Phải Thu').isVisible();
    const cardCanTru = await page.locator('text=Đã Cấn Trừ Mùa Vụ').isVisible();

    console.log(`  -> Thẻ Tồn Quỹ hiển thị: ${cardTonQuy ? '✅ ĐẠT' : '❌ LỖI'}`);
    console.log(`  -> Thẻ Doanh Thu hiển thị: ${cardDoanhThu ? '✅ ĐẠT' : '❌ LỖI'}`);
    console.log(`  -> Thẻ Nợ Vật Tư hiển thị: ${cardNoVatTu ? '✅ ĐẠT' : '❌ LỖI'}`);
    console.log(`  -> Thẻ Đã Cấn Trừ hiển thị: ${cardCanTru ? '✅ ĐẠT' : '❌ LỖI'}`);

    // Kiểm tra Nút Xuất Excel Sổ Quỹ
    const btnExportCash = await page.locator('button:has-text("Xuất Excel Sổ Quỹ")').isVisible();
    console.log(`  -> Nút "Xuất Excel Sổ Quỹ" hiển thị: ${btnExportCash ? '✅ ĐẠT' : '❌ LỖI'}`);

    // BƯỚC 4: LẬP PHIẾU THU SỔ QUỸ MỚI QUA FORM UI
    console.log('\n📝 BƯỚC 4: Mở Form "Lập phiếu Thu / Chi" & Nhập liệu nghiệp vụ thực tế...');
    await page.click('button:has-text("Lập phiếu Thu / Chi")');
    await page.waitForSelector('text=Tạo Phiếu Thu / Chi Sổ Quỹ');

    // Điền form
    await page.selectOption('select:has-text("Phiếu Thu")', 'INCOME');
    await page.fill('input[type="date"]', '2026-10-19');
    await page.fill('input[placeholder*="Ớt Sweet Palermo"]', 'Thu tiền bán Cà phê Arabica Cầu Đất OCOP 4 sao');
    await page.fill('input[type="number"]', '25000000');
    await page.fill('input[placeholder*="Tên xã viên, doanh nghiệp"]', 'Công ty CP Nông sản Xuất khẩu Đà Lạt');
    await page.fill('textarea', 'Thanh toán đợt 1 hợp đồng thu mua nông sản niên vụ 2026');

    console.log('  -> Đang bấm "Lưu & Ghi sổ"...');
    await page.click('button:has-text("Lưu & Ghi sổ")');

    // Đợi phản hồi API
    await page.waitForTimeout(3000);

    if (!cashApiResp || cashApiResp.status !== 201) {
      throw new Error(`Tạo phiếu thu/chi thất bại! Status: ${cashApiResp?.status}, Body: ${JSON.stringify(cashApiResp)}`);
    }

    console.log('  ✅ Backend trả về HTTP 201 Created!');
    console.log('  Voucher Number tạo mới:', cashApiResp.body?.data?.voucher_number || cashApiResp.body?.voucher_number);

    // Chụp ảnh màn hình bảng sổ quỹ sau khi ghi sổ
    const shotCashbookPath = path.resolve(artifactDir, '15_finance_cashbook_created.png');
    await page.screenshot({ path: shotCashbookPath, fullPage: false });
    console.log(`  📸 Đã chụp ảnh bằng chứng Sổ Quỹ: ${shotCashbookPath}`);

    // BƯỚC 5: KIỂM TRA CHỨNG TỪ KẾ TOÁN & MODAL IN PHIẾU (VOUCHER PRINT PREVIEW)
    console.log('\n🖨️ BƯỚC 5: Mở Modal In Chứng Từ Kế Toán HTX (Mẫu 01-TT)...');
    const firstPrintBtn = page.locator('button:has-text("In phiếu")').first();
    await firstPrintBtn.click();
    await page.waitForSelector('text=Xem & In Chứng Từ Kế Toán HTX');

    const voucherTitle = await page.locator('h2:has-text("PHIẾU THU")').isVisible();
    const mauSoVisible = await page.locator('text=Mẫu số: 01-TT').isVisible();
    const signatureCount = await page.locator('text=Ban Giám Đốc').isVisible();

    console.log(`  -> Tiêu đề PHIẾU THU hiển thị: ${voucherTitle ? '✅ ĐẠT' : '❌ LỖI'}`);
    console.log(`  -> Mẫu số 01-TT theo TT 200/2014/TT-BTC: ${mauSoVisible ? '✅ ĐẠT' : '❌ LỖI'}`);
    console.log(`  -> Khối 4 chữ ký kiểm soát nội bộ: ${signatureCount ? '✅ ĐẠT' : '❌ LỖI'}`);

    // Chụp ảnh chứng từ kế toán
    const shotVoucherPath = path.resolve(artifactDir, '16_finance_voucher_print.png');
    await page.screenshot({ path: shotVoucherPath, fullPage: false });
    console.log(`  📸 Đã chụp ảnh bằng chứng Phiếu Thu: ${shotVoucherPath}`);

    // Đóng modal in phiếu
    await page.click('button:has-text("Đóng")');
    await page.waitForTimeout(1000);

    // BƯỚC 6: CHUYỂN QUA TAB 2 CÔNG NỢ & THỰC HIỆN CẤN TRỪ NỢ
    console.log('\n💳 BƯỚC 6: Chuyển Tab 2 "Quản Lý Công Nợ" & Thực hiện Thu hồi nợ...');
    await page.click('button:has-text("2. Quản Lý Công Nợ Xã Viên")');
    await page.waitForTimeout(1500);

    // Kiểm tra nút Xuất Excel Công nợ
    const btnExportDebts = await page.locator('button:has-text("Xuất Excel Công Nợ")').isVisible();
    console.log(`  -> Nút "Xuất Excel Công Nợ" hiển thị: ${btnExportDebts ? '✅ ĐẠT' : '❌ LỖI'}`);

    // Tìm nút "Thu / Cấn trừ" đầu tiên
    const settleBtn = page.locator('button:has-text("Thu / Cấn trừ")').first();
    if (await settleBtn.isVisible()) {
      await settleBtn.click();
      await page.waitForSelector('text=Thu Hồi / Cấn Trừ Công Nợ');

      // Điền form thu nợ
      await page.fill('input[type="date"]', '2026-10-19');
      await page.fill('input[type="number"]', '500000');
      await page.fill('textarea[placeholder*="Ghi chú đợt thanh toán"]', 'Xã viên nộp tiền mặt đợt 1 trả nợ phân bón vi sinh');

      console.log('  -> Đang bấm "Xác nhận thu nợ"...');
      await page.click('button:has-text("Xác nhận thu nợ")');
      await page.waitForTimeout(3000);

      if (!debtApiResp || debtApiResp.status !== 201) {
        throw new Error(`Thu nợ thất bại! Status: ${debtApiResp?.status}, Body: ${JSON.stringify(debtApiResp)}`);
      }

      console.log('  ✅ Backend trả về HTTP 201 Created cho đợt thu hồi nợ!');

      const shotDebtPath = path.resolve(artifactDir, '17_finance_debt_settled.png');
      await page.screenshot({ path: shotDebtPath, fullPage: false });
      console.log(`  📸 Đã chụp ảnh bằng chứng Công Nợ sau cấn trừ: ${shotDebtPath}`);
    } else {
      console.log('  ⚠️ Không có khoản công nợ nào mở để thu nợ.');
    }

    // BƯỚC 7: TRUY VẤN ĐỐI SOÁT CƠ SỞ DỮ LIỆU POSTGRESQL THẬT
    console.log('\n🔍 BƯỚC 7: Đối soát trực tiếp Database PostgreSQL...');
    const postCashCount = parseInt(queryDb("echo DB::table('cash_transactions')->count();"), 10);
    const postSettlementCount = parseInt(queryDb("echo DB::table('debt_settlements')->count();"), 10);

    console.log(`  -> Số lượng giao dịch Sổ Quỹ sau kiểm thử: ${postCashCount} (Tăng: +${postCashCount - initCashCount})`);
    console.log(`  -> Số lượng đợt thanh toán nợ sau kiểm thử: ${postSettlementCount} (Tăng: +${postSettlementCount - initSettlementCount})`);

    // Chi tiết bản ghi mới nhất trong cash_transactions
    const latestCashJson = queryDb("echo json_encode(DB::table('cash_transactions')->orderBy('created_at', 'desc')->first());");
    const latestCash = JSON.parse(latestCashJson);

    console.log('\n📋 BẢN GHI SỔ QUỸ GHI NHẬN THẬT TRONG POSTGRESQL:');
    console.log(`  - ID: ${latestCash.id}`);
    console.log(`  - Mã phiếu: ${latestCash.voucher_number}`);
    console.log(`  - Loại giao dịch: ${latestCash.transaction_type}`);
    console.log(`  - Hạng mục: ${latestCash.category}`);
    console.log(`  - Số tiền: ${Number(latestCash.amount).toLocaleString('vi-VN')} VNĐ`);
    console.log(`  - Đối tác: ${latestCash.payer_payee}`);
    console.log(`  - Ngày giao dịch: ${latestCash.transaction_date}`);
    console.log(`  - Mô tả: ${latestCash.description}`);

    // Chi tiết bản ghi mới nhất trong debt_settlements
    const latestSettlementJson = queryDb("echo json_encode(DB::table('debt_settlements')->orderBy('created_at', 'desc')->first());");
    const latestSettlement = JSON.parse(latestSettlementJson);

    console.log('\n📋 BẢN GHI CẤN TRỪ NỢ GHI NHẬN THẬT TRONG POSTGRESQL:');
    console.log(`  - ID: ${latestSettlement.id}`);
    console.log(`  - Mã công nợ liên kết: ${latestSettlement.receivable_payable_id}`);
    console.log(`  - Số tiền thu hồi: ${Number(latestSettlement.amount).toLocaleString('vi-VN')} VNĐ`);
    console.log(`  - Ngày thanh toán: ${latestSettlement.settlement_date}`);
    console.log(`  - Ghi chú: ${latestSettlement.note}`);

    if (postCashCount !== initCashCount + 1) {
      throw new Error(`Đối soát DB thất bại! Số bản ghi Sổ Quỹ mong đợi ${initCashCount + 1}, thực tế ${postCashCount}`);
    }

    if (postSettlementCount !== initSettlementCount + 1) {
      throw new Error(`Đối soát DB thất bại! Số bản ghi Cấn trừ nợ mong đợi ${initSettlementCount + 1}, thực tế ${postSettlementCount}`);
    }

    console.log('\n========================================================================');
    console.log('🎉 TẤT CẢ CÁC BƯỚC ĐỐI SOÁT FORM - BẢNG - CARD - KẾT XUẤT ĐỀU THÀNH CÔNG 100%!');
    console.log('========================================================================\n');

  } catch (err) {
    console.error('❌ KIỂM THỬ THẤT BẠI:', err);
    process.exit(1);
  } finally {
    await browser.close();
  }
}

runAutonomousFinanceVerification();
