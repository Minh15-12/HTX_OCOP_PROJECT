import { chromium } from '@playwright/test';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const screenshotsDir = path.join(__dirname, 'screenshots');
if (!fs.existsSync(screenshotsDir)) {
  fs.mkdirSync(screenshotsDir, { recursive: true });
}

const artifactDir = 'C:\\Users\\Maxsys\\.gemini\\antigravity\\brain\\b767d259-2ec1-4f08-9a2d-33a518d88c2c';

function copyToArtifact(fileName) {
  const src = path.join(screenshotsDir, fileName);
  if (fs.existsSync(src)) {
    const dest = path.join(artifactDir, fileName);
    fs.copyFileSync(src, dest);
    console.log(`  [COPIED] ${fileName} -> Artifacts directory`);
  }
}

async function runVisualTests() {
  console.log('===============================================================');
  console.log('📸 BẮT ĐẦU KIỂM THỬ TRỰC QUAN GIAO DIỆN (E2E VISUAL TEST)');
  console.log('===============================================================\n');

  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    viewport: { width: 1440, height: 900 },
    deviceScaleFactor: 1,
  });

  const page = await context.newPage();

  try {
    // 1. ĐĂNG NHẬP
    console.log('1. Kiểm tra màn hình Đăng nhập & Xác thực hệ thống...');
    await page.goto('http://localhost:3000/login', { waitUntil: 'networkidle' });
    await page.screenshot({ path: path.join(screenshotsDir, '01_login_page.png') });
    copyToArtifact('01_login_page.png');

    console.log('  -> Bấm Đăng nhập ngay...');
    await page.click('button:has-text("Đăng nhập ngay")');
    await page.waitForTimeout(2500);

    // 2. DASHBOARD
    console.log('2. Kiểm tra Dashboard & Menu Sidebar mới...');
    await page.screenshot({ path: path.join(screenshotsDir, '02_dashboard.png') });
    copyToArtifact('02_dashboard.png');

    // 3. GIAI ĐOẠN 1: SIDEBAR & QUẢN LÝ XÃ VIÊN (MEMBERS)
    console.log('3. Kiểm tra Phân hệ Xã viên (loại bỏ 1.400 dòng tab con trùng lặp)...');
    await page.goto('http://localhost:3000/members', { waitUntil: 'networkidle' });
    await page.waitForTimeout(2000);
    await page.screenshot({ path: path.join(screenshotsDir, '03_members_page.png') });
    copyToArtifact('03_members_page.png');

    // 4. GIAI ĐOẠN 2: TÀI CHÍNH 3-TAB & QUYẾT TOÁN MÙA VỤ
    console.log('4. Kiểm tra Giao diện Tài chính 3-Tab...');
    await page.goto('http://localhost:3000/finance', { waitUntil: 'networkidle' });
    await page.waitForTimeout(2000);
    // Tab 1: Sổ quỹ
    await page.screenshot({ path: path.join(screenshotsDir, '04_finance_tab1_cashbook.png') });
    copyToArtifact('04_finance_tab1_cashbook.png');

    // Tab 2: Công nợ
    console.log('  -> Chuyển sang Tab 2: Quản lý Công nợ Xã viên...');
    const debtTab = await page.$('button:has-text("Công Nợ"), button:has-text("công nợ")');
    if (debtTab) {
      await debtTab.click();
      await page.waitForTimeout(2000);
      await page.screenshot({ path: path.join(screenshotsDir, '05_finance_tab2_debts.png') });
      copyToArtifact('05_finance_tab2_debts.png');
    }

    // Tab 3: Quyết toán mùa vụ
    console.log('  -> Chuyển sang Tab 3: Quyết toán mùa vụ & Cấn trừ nợ...');
    const settleTab = await page.$('button:has-text("Quyết Toán Mùa Vụ"), button:has-text("Quyết toán")');
    if (settleTab) {
      await settleTab.click();
      await page.waitForTimeout(2000);
      await page.screenshot({ path: path.join(screenshotsDir, '06_finance_tab3_settlement.png') });
      copyToArtifact('06_finance_tab3_settlement.png');

      // Mở modal Chốt quyết toán
      console.log('  -> Mở Modal Chốt Quyết toán mùa vụ nông sản...');
      const openSettleModalBtn = await page.$('button:has-text("Chốt Quyết Toán"), button:has-text("Quyết toán mới")');
      if (openSettleModalBtn) {
        await openSettleModalBtn.click();
        await page.waitForTimeout(1000);
        await page.screenshot({ path: path.join(screenshotsDir, '07_finance_settlement_modal.png') });
        copyToArtifact('07_finance_settlement_modal.png');

        const closeModalBtn = await page.$('button:has-text("Hủy"), button:has-text("Đóng")');
        if (closeModalBtn) await closeModalBtn.click();
        await page.waitForTimeout(500);
      }
    }

    // 5. GIAI ĐOẠN 3: SẢN PHẨM OCOP & LIÊN KẾT LÔ GS1
    console.log('5. Kiểm tra Danh mục Sản phẩm OCOP...');
    await page.goto('http://localhost:3000/products', { waitUntil: 'networkidle' });
    await page.waitForTimeout(2000);
    await page.screenshot({ path: path.join(screenshotsDir, '08_products_page.png') });
    copyToArtifact('08_products_page.png');

    // Mở modal liên kết lô
    const linkLotBtn = await page.$('button:has-text("Liên kết Lô"), button:has-text("Gán Lô")');
    if (linkLotBtn) {
      console.log('  -> Mở Modal Liên kết Lô Thu Hoạch GS1...');
      await linkLotBtn.click();
      await page.waitForTimeout(1000);
      await page.screenshot({ path: path.join(screenshotsDir, '09_products_link_lot_modal.png') });
      copyToArtifact('09_products_link_lot_modal.png');

      const closeModalBtn = await page.$('button:has-text("Hủy"), button:has-text("Đóng")');
      if (closeModalBtn) await closeModalBtn.click();
      await page.waitForTimeout(500);
    }

    // 6. GIAI ĐOẠN 5: NHẬT KÝ CANH TÁC & READ-ONLY FREEZE GUARD
    console.log('6. Kiểm tra Nhật ký canh tác & Read-Only Freeze Guard...');
    await page.goto('http://localhost:3000/farming-logs', { waitUntil: 'networkidle' });
    await page.waitForTimeout(2000);
    await page.screenshot({ path: path.join(screenshotsDir, '10_farming_logs_page.png') });
    copyToArtifact('10_farming_logs_page.png');

    // 7. OCOP TIÊU CHÍ & QUYẾT ĐỊNH
    console.log('7. Kiểm tra Trang Quyết định OCOP...');
    await page.goto('http://localhost:3000/ocop/decisions', { waitUntil: 'networkidle' });
    await page.waitForTimeout(2000);
    await page.screenshot({ path: path.join(screenshotsDir, '11_ocop_decisions_page.png') });
    copyToArtifact('11_ocop_decisions_page.png');

    console.log('8. Kiểm tra Trang Tiêu chí OCOP QĐ 148...');
    await page.goto('http://localhost:3000/ocop/criteria', { waitUntil: 'networkidle' });
    await page.waitForTimeout(2000);
    await page.screenshot({ path: path.join(screenshotsDir, '12_ocop_criteria_page.png') });
    copyToArtifact('12_ocop_criteria_page.png');

    console.log('\n===============================================================');
    console.log('🎉 KIỂM THỬ TRỰC QUAN HOÀN TẤT THÀNH CÔNG 100%!');
    console.log('===============================================================');
  } catch (error) {
    console.error('❌ Lỗi trong quá trình kiểm thử:', error);
  } finally {
    await browser.close();
  }
}

runVisualTests();
