import { chromium } from 'playwright';
import path from 'path';

const ARTIFACT_DIR = 'C:\\Users\\Maxsys\\.gemini\\antigravity\\brain\\71e32054-e3d6-4751-82fd-1c1de7ead122';
const BASE_URL = 'http://localhost:3001';

async function run() {
  console.log('--- KHỞI ĐỘNG KIỂM THỬ TỰ ĐỘNG PLAYWRIGHT: TRÍCH XUẤT & XEM MINH CHỨNG OCOP ---');
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  const page = await context.newPage();

  try {
    // Bước 1: Đăng nhập
    console.log('1. Đăng nhập hệ thống HTX...');
    await page.goto(`${BASE_URL}/auth/login`, { waitUntil: 'networkidle' });
    await page.locator('input').first().fill('admin_htx');
    await page.locator('input[type="password"]').fill('password123');
    await page.click('button:has-text("Đăng nhập ngay")');
    await page.waitForURL('**/dashboard', { timeout: 15000 });
    console.log('✓ Đăng nhập thành công.');

    // Bước 2: Kiểm tra Kho Minh chứng Số (/ocop/evidences)
    console.log('2. Điều hướng tới Kho Minh chứng Số (/ocop/evidences)...');
    await page.goto(`${BASE_URL}/ocop/evidences`, { waitUntil: 'networkidle' });
    await page.waitForTimeout(2000);

    // Click vào một dòng trong bảng để mở ngăn kéo chi tiết
    console.log('3. Mở ngăn kéo xem trước minh chứng trong Kho số...');
    const tableRows = page.locator('table tbody tr');
    if (await tableRows.count() > 0) {
      await tableRows.first().click();
      await page.waitForTimeout(1500);
      await page.screenshot({ path: path.join(ARTIFACT_DIR, 'verify_evidence_vault_preview.png') });
      console.log('✓ Đã lưu ảnh: verify_evidence_vault_preview.png');
    }

    // Bước 3: Kiểm tra Wizard tạo hồ sơ OCOP Bước 3 (/ocop/dossiers/create)
    console.log('4. Điều hướng tới Wizard tạo hồ sơ OCOP (/ocop/dossiers/create)...');
    await page.goto(`${BASE_URL}/ocop/dossiers/create`, { waitUntil: 'networkidle' });
    await page.waitForTimeout(1500);

    // Chuyển sang Bước 2
    console.log('5. Bấm Tiếp tục sang Bước 2...');
    await page.click('button:has-text("Tiếp tục Bước 2")');
    await page.waitForTimeout(1000);

    // Chuyển sang Bước 3
    console.log('6. Bấm Tiếp tục sang Bước 3 (Quản lý minh chứng)...');
    await page.click('button:has-text("Tiếp tục Bước 3")');
    await page.waitForTimeout(1500);

    await page.screenshot({ path: path.join(ARTIFACT_DIR, 'verify_wizard_step3_with_extract_buttons.png') });
    console.log('✓ Đã lưu ảnh: verify_wizard_step3_with_extract_buttons.png');

    // Bước 4: Mở Modal Trích xuất từ HTX
    console.log('7. Bấm nút [Trích xuất từ HTX]...');
    const extractBtn = page.locator('button:has-text("Trích xuất từ HTX")');
    await extractBtn.click();
    await page.waitForTimeout(1000);

    await page.screenshot({ path: path.join(ARTIFACT_DIR, 'verify_wizard_extraction_sources_modal.png') });
    console.log('✓ Đã lưu ảnh: verify_wizard_extraction_sources_modal.png');

    // Bấm [Trích xuất toàn bộ (4 trong 1)]
    console.log('8. Bấm nút [Trích xuất toàn bộ (4 trong 1)]...');
    await page.click('button:has-text("Trích xuất toàn bộ")');
    await page.waitForTimeout(1500);

    await page.screenshot({ path: path.join(ARTIFACT_DIR, 'verify_wizard_after_extraction.png') });
    console.log('✓ Đã lưu ảnh: verify_wizard_after_extraction.png');

    // Bước 5: Bấm nút Xem trước (con mắt 👁️) để mở Live Evidence Document Viewer
    console.log('9. Bấm nút xem trước (con mắt) trên tài liệu Mẫu 01-PUC...');
    const eyeButtons = page.locator('tbody tr button[title*="Xem"]');
    if (await eyeButtons.count() > 0) {
      await eyeButtons.first().click();
      await page.waitForTimeout(1500);

      await page.screenshot({ path: path.join(ARTIFACT_DIR, 'verify_wizard_live_puc_preview.png') });
      console.log('✓ Đã lưu ảnh: verify_wizard_live_puc_preview.png');

      // Đóng modal xem trước
      const closeBtn = page.locator('button:has-text("Đóng xem tài liệu")');
      if (await closeBtn.count() > 0) {
        await closeBtn.click();
        await page.waitForTimeout(1000);
      }
    }

    // Bước 6: Bấm xem trước tài liệu thứ hai (Danh bạ hộ nông dân chuỗi liên kết TC-A.3.1)
    if (await eyeButtons.count() > 1) {
      console.log('10. Bấm nút xem trước trên tài liệu Danh bạ liên kết chuỗi TC-A.3.1...');
      await eyeButtons.nth(1).click();
      await page.waitForTimeout(1500);

      await page.screenshot({ path: path.join(ARTIFACT_DIR, 'verify_wizard_live_member_chain_preview.png') });
      console.log('✓ Đã lưu ảnh: verify_wizard_live_member_chain_preview.png');

      const closeBtn = page.locator('button:has-text("Đóng xem tài liệu")');
      if (await closeBtn.count() > 0) {
        await closeBtn.click();
        await page.waitForTimeout(1000);
      }
    }

    // Bước 7: Mở Modal Chọn từ Kho số
    console.log('11. Bấm nút [Chọn từ Kho số]...');
    const vaultBtn = page.locator('button:has-text("Chọn từ Kho số")');
    await vaultBtn.click();
    await page.waitForTimeout(1500);

    await page.screenshot({ path: path.join(ARTIFACT_DIR, 'verify_wizard_vault_picker_modal.png') });
    console.log('✓ Đã lưu ảnh: verify_wizard_vault_picker_modal.png');

    console.log('--- TOÀN BỘ CÁC BƯỚC KIỂM THỬ ĐÃ THÀNH CÔNG VƯỢT TRỘI! ---');
  } catch (error) {
    console.error('LỖI KIỂM THỬ:', error);
    await page.screenshot({ path: path.join(ARTIFACT_DIR, 'verify_evidence_error_trace.png') });
  } finally {
    await browser.close();
  }
}

run();
