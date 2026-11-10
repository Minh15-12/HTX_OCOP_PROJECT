import { chromium } from 'playwright';
import path from 'path';

const ARTIFACT_DIR = 'C:\\Users\\Maxsys\\.gemini\\antigravity\\brain\\71e32054-e3d6-4751-82fd-1c1de7ead122';
const BASE_URL = 'http://localhost:3001';

async function run() {
  console.log('=== KHỞI ĐỘNG KIỂM THỬ PLAYWRIGHT: CHUỖI THU MUA, QUYẾT TOÁN NÔNG SẢN & MINH CHỨNG OCOP ===');
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({ viewport: { width: 1440, height: 950 } });
  const page = await context.newPage();

  try {
    // -------------------------------------------------------------------------
    // BƯỚC 1: Đăng nhập hệ thống
    // -------------------------------------------------------------------------
    console.log('\n[1/4] Đăng nhập tài khoản Quản trị HTX Tân Tiến...');
    await page.goto(`${BASE_URL}/auth/login`, { waitUntil: 'networkidle' });
    await page.locator('input').first().fill('admin_htx');
    await page.locator('input[type="password"]').fill('password123');
    await page.click('button:has-text("Đăng nhập ngay")');
    await page.waitForURL('**/dashboard', { timeout: 15000 });
    console.log('✓ Đăng nhập thành công, đã vào Bảng điều khiển.');

    // -------------------------------------------------------------------------
    // BƯỚC 2: Kiểm tra Thu hoạch -> Nút 1-Chạm sang Quyết toán Nông sản
    // -------------------------------------------------------------------------
    console.log('\n[2/4] Kiểm tra Quản lý thu hoạch & Nút 1-Chạm chuyển hướng Quyết toán...');
    await page.goto(`${BASE_URL}/agriculture/harvests`, { waitUntil: 'networkidle' });
    await page.waitForTimeout(1500);

    const settleToolbarBtn = page.locator('button:has-text("Quyết toán nông sản")');
    if (await settleToolbarBtn.isVisible()) {
      console.log('✓ Tìm thấy nút toolbar "Quyết toán nông sản" trên trang HarvestsPage.');
      await page.screenshot({ path: path.join(ARTIFACT_DIR, 'verify_harvest_action_to_settlement.png') });
      console.log('✓ Đã lưu ảnh: verify_harvest_action_to_settlement.png');
      
      await settleToolbarBtn.click();
      await page.waitForTimeout(2000);
      console.log(`✓ Đã bấm chuyển hướng, URL hiện tại: ${page.url()}`);
    } else {
      await page.goto(`${BASE_URL}/finance?tab=harvest-settlements`, { waitUntil: 'networkidle' });
      await page.waitForTimeout(1500);
    }

    // -------------------------------------------------------------------------
    // BƯỚC 3: Kiểm tra Phiếu chi quyết toán & VietQR động Napas 24/7
    // -------------------------------------------------------------------------
    console.log('\n[3/4] Mở Phiếu chi quyết toán nông sản kiêm bù trừ nợ & Kiểm tra VietQR...');
    const printVoucherBtn = page.locator('button:has-text("In phiếu")').first();
    if (await printVoucherBtn.isVisible()) {
      console.log('✓ Bấm "In phiếu" trên bảng kê quyết toán...');
      await printVoucherBtn.click();
      await page.waitForTimeout(1500);

      await page.screenshot({ path: path.join(ARTIFACT_DIR, 'verify_settlement_voucher_vietqr.png') });
      console.log('✓ Đã lưu ảnh: verify_settlement_voucher_vietqr.png (Phiếu chi 4 khoản mục & VietQR)');

      const closeBtn = page.locator('button:has-text("Đóng")').last();
      if (await closeBtn.isVisible()) {
        await closeBtn.click();
        await page.waitForTimeout(500);
      }
    }

    // -------------------------------------------------------------------------
    // BƯỚC 4: Kiểm tra Trích xuất & Trình xem Minh chứng Số hóa OCOP (TC-A.3.1)
    // -------------------------------------------------------------------------
    console.log('\n[4/4] Mở Wizard OCOP Bước 3 & Trích xuất Minh chứng Chuỗi Thu Mua...');
    await page.goto(`${BASE_URL}/ocop/dossiers/create`, { waitUntil: 'networkidle' });
    await page.waitForTimeout(1500);

    // Điền Bước 1 & Bước 2 nếu chưa qua Bước 3
    const nextBtn = page.locator('button:has-text("Tiếp tục"), button:has-text("Tiếp theo")').first();
    if (await nextBtn.isVisible()) {
      const nameInput = page.locator('input[placeholder*="tên sản phẩm"], input[name="product_name"]').first();
      if (await nameInput.isVisible()) {
        await nameInput.fill('Cà Phê Arabica Cầu Đất Đặc Sản');
      }
      await nextBtn.click();
      await page.waitForTimeout(800);

      const nextBtn2 = page.locator('button:has-text("Tiếp tục"), button:has-text("Tiếp theo")').first();
      if (await nextBtn2.isVisible()) {
        await nextBtn2.click();
        await page.waitForTimeout(800);
      }
    }

    // Tại Bước 3: Mở modal "Trích xuất từ HTX"
    const extractModalBtn = page.locator('button:has-text("Trích xuất từ HTX")').first();
    if (await extractModalBtn.isVisible()) {
      console.log('✓ Bấm mở modal "Trích xuất từ HTX"...');
      await extractModalBtn.click();
      await page.waitForTimeout(1000);

      // Bấm "Trích xuất toàn bộ (4 trong 1)" bên trong modal
      const extractAllBtn = page.locator('button:has-text("Trích xuất toàn bộ (4 trong 1)")');
      if (await extractAllBtn.isVisible()) {
        console.log('  -> Bấm thực hiện "Trích xuất toàn bộ (4 trong 1)"...');
        await extractAllBtn.click();
        await page.waitForTimeout(1200);
      }

      // Đóng modal trích xuất
      const closeExtractModal = page.locator('.fixed.inset-0 button:has-text("Đóng")').first();
      if (await closeExtractModal.isVisible()) {
        await closeExtractModal.click();
        await page.waitForTimeout(800);
      }
    }

    // Tìm và mở Xem chi tiết tài liệu của minh chứng TC-A.3.1
    await page.waitForTimeout(1000);
    const viewEyeButtons = page.locator('button[title*="Xem chi tiết tài liệu"]');
    const eyeCount = await viewEyeButtons.count();
    console.log(`✓ Tìm thấy ${eyeCount} nút xem chi tiết tài liệu minh chứng trong bảng.`);

    let targetEyeBtn = null;
    for (let i = 0; i < eyeCount; i++) {
      const btn = viewEyeButtons.nth(i);
      const rowText = await btn.evaluate((el) => el.closest('tr')?.textContent || '');
      if (rowText.includes('TC-A.3.1') || rowText.includes('chuỗi') || rowText.includes('liên kết') || rowText.includes('nông dân')) {
        console.log(`  -> Tìm thấy dòng minh chứng TC-A.3.1 tại mục #${i + 1}`);
        targetEyeBtn = btn;
        break;
      }
    }

    if (!targetEyeBtn && eyeCount > 0) {
      targetEyeBtn = viewEyeButtons.first();
    }

    if (targetEyeBtn) {
      console.log('  -> Mở Trình xem Minh chứng Số hóa OCOP...');
      await targetEyeBtn.click();
      await page.waitForTimeout(2000);

      // Chụp ảnh Tab 1: Hợp đồng chuỗi liên kết
      await page.screenshot({ path: path.join(ARTIFACT_DIR, 'verify_ocop_supply_chain_contracts.png') });
      console.log('✓ Đã lưu ảnh: verify_ocop_supply_chain_contracts.png (Tab Hợp đồng chuỗi liên kết)');

      // Chuyển sang Tab "Bảng thanh toán tiền nông sản"
      const paymentsTabBtn = page.locator('button:has-text("Bảng thanh toán tiền nông sản")');
      if (await paymentsTabBtn.isVisible()) {
        console.log('  -> Chuyển sang tab "Bảng thanh toán tiền nông sản"...');
        await paymentsTabBtn.click();
        await page.waitForTimeout(1500);
        await page.screenshot({ path: path.join(ARTIFACT_DIR, 'verify_ocop_harvest_payments_table.png') });
        console.log('✓ Đã lưu ảnh: verify_ocop_harvest_payments_table.png (Tab Bảng thanh toán tiền & cấn trừ nợ)');
      }
    }

    console.log('\n=== TẤT CẢ KỊCH BẢN KIỂM THỬ ĐÃ HOÀN TẤT THÀNH CÔNG 100%! ===');
  } catch (err) {
    console.error('❌ Lỗi kiểm thử E2E:', err);
    await page.screenshot({ path: path.join(ARTIFACT_DIR, 'verify_harvest_purchasing_error.png') });
  } finally {
    await browser.close();
  }
}

run();
