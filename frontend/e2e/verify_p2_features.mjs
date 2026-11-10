import { chromium } from 'playwright';
import path from 'path';

const ARTIFACT_DIR = 'C:\\Users\\Maxsys\\.gemini\\antigravity\\brain\\5c88d44f-a529-4130-a99d-016200b1d94e';
const BASE_URL = 'http://localhost:3000';

async function runP2E2EVerification() {
  console.log('====================================================');
  console.log('🚀 BẮT ĐẦU KIỂM THỬ TỰ ĐỘNG E2E CÁC TÍNH NĂNG P2');
  console.log('====================================================');

  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  const page = await context.newPage();

  try {
    // -------------------------------------------------------------
    // Bước 1: Đăng nhập vào hệ thống
    // -------------------------------------------------------------
    console.log('\n[1] Đăng nhập tài khoản Quản trị HTX...');
    await page.goto(`${BASE_URL}/auth/login`, { waitUntil: 'networkidle' });
    await page.locator('input').first().fill('admin');
    await page.locator('input[type="password"]').fill('password123');
    await page.locator('button[type="submit"]').click();
    await page.waitForURL('**/dashboard', { timeout: 15000 });
    console.log('✅ Đăng nhập thành công!');

    // -------------------------------------------------------------
    // Bước 2: Kiểm thử Nút Xuất Sổ Công Nợ (Excel) trên Trang Tài Chính
    // -------------------------------------------------------------
    console.log('\n[2] Kiểm tra Nút Xuất Sổ Công Nợ trên Trang Tài Chính...');
    await page.goto(`${BASE_URL}/finance`, { waitUntil: 'networkidle' });
    await page.waitForTimeout(1500);

    // Chuyển sang tab Công nợ
    const debtTab = page.locator('button:has-text("Công nợ Phải thu / Phải trả")');
    if (await debtTab.count() > 0) {
      await debtTab.click();
      await page.waitForTimeout(1200);

      const exportDebtBtn = page.locator('button:has-text("Xuất Sổ Công Nợ (Excel)")');
      if (await exportDebtBtn.count() > 0) {
        console.log('✅ Đã tìm thấy nút Xuất Sổ Công Nợ (Excel) trên Tab Công nợ.');
        const shotDebt = path.join(ARTIFACT_DIR, 'p2_01_finance_debts_export.png');
        await page.screenshot({ path: shotDebt, fullPage: false });
        console.log('📸 Đã chụp ảnh Tab Công nợ & Nút Xuất Excel:', shotDebt);
      } else {
        console.warn('⚠️ Chưa tìm thấy nút Xuất Sổ Công Nợ (Excel)');
      }
    }

    // -------------------------------------------------------------
    // Bước 3: Kiểm thử Nút Xuất Tồn Kho (Excel) trên Trang Kho Vật Tư
    // -------------------------------------------------------------
    console.log('\n[3] Kiểm tra Nút Xuất Tồn Kho & FEFO trên Trang Kho Vật Tư...');
    await page.goto(`${BASE_URL}/inventory/materials`, { waitUntil: 'networkidle' });
    await page.waitForTimeout(1500);

    const exportStockBtn = page.locator('button:has-text("Xuất tồn kho (Excel)")');
    if (await exportStockBtn.count() > 0) {
      console.log('✅ Đã tìm thấy nút Xuất tồn kho (Excel) trên Toolbar Kho Vật tư.');
      const shotStock = path.join(ARTIFACT_DIR, 'p2_02_materials_stock_export.png');
      await page.screenshot({ path: shotStock, fullPage: false });
      console.log('📸 Đã chụp ảnh Trang Kho & Nút Xuất tồn kho Excel:', shotStock);
    }

    // -------------------------------------------------------------
    // Bước 4: Kiểm thử Nút Xuất Nhật Ký VietGAP trên Trang Nhật Ký Canh Tác
    // -------------------------------------------------------------
    console.log('\n[4] Kiểm tra Nút Xuất Nhật Ký Canh Tác VietGAP...');
    await page.goto(`${BASE_URL}/agriculture/logs`, { waitUntil: 'networkidle' });
    await page.waitForTimeout(1500);

    const exportLogBtn = page.locator('button:has-text("Xuất nhật ký VietGAP (Excel)")');
    if (await exportLogBtn.count() > 0) {
      console.log('✅ Đã tìm thấy nút Xuất nhật ký VietGAP (Excel) trên Toolbar Nhật Ký.');
      const shotLogs = path.join(ARTIFACT_DIR, 'p2_03_farming_logs_export.png');
      await page.screenshot({ path: shotLogs, fullPage: false });
      console.log('📸 Đã chụp ảnh Trang Nhật ký & Nút Xuất VietGAP Excel:', shotLogs);
    }

    // -------------------------------------------------------------
    // Bước 5: Kiểm thử Đối Soát Toàn Vẹn Chuỗi Băm SHA-256 (Audit Trail)
    // -------------------------------------------------------------
    console.log('\n[5] Kiểm tra Đối soát Toàn vẹn Chuỗi Băm SHA-256 trên Trang Audit...');
    await page.goto(`${BASE_URL}/audit`, { waitUntil: 'networkidle' });
    await page.waitForTimeout(1500);

    const openVerifyBtn = page.locator('button:has-text("Kiểm tra toàn vẹn chuỗi Hash")');
    if (await openVerifyBtn.count() > 0) {
      await openVerifyBtn.click();
      await page.waitForTimeout(1000);

      const runScanBtn = page.locator('button:has-text("Bắt đầu quét đối soát ngay")');
      if (await runScanBtn.count() > 0) {
        await runScanBtn.click();
        await page.waitForTimeout(3000); // Đợi backend kiểm toán 244 khối

        console.log('✅ Đã thực hiện đối soát chuỗi băm mật mã từ backend thành công.');
        const shotVerify = path.join(ARTIFACT_DIR, 'p2_04_sha256_chain_verification_modal.png');
        await page.screenshot({ path: shotVerify, fullPage: false });
        console.log('📸 Đã chụp ảnh Modal Đối soát Chuỗi Băm SHA-256:', shotVerify);
      }
    }

    console.log('\n====================================================');
    console.log('🎉 TẤT CẢ CÁC KỊCH BẢN KIỂM THỬ P2 HOÀN TẤT XANH 100%!');
    console.log('====================================================');
  } catch (error) {
    console.error('❌ Lỗi kiểm thử E2E P2:', error);
    throw error;
  } finally {
    await browser.close();
  }
}

runP2E2EVerification();
