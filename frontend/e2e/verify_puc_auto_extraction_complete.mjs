import { chromium } from 'playwright';
import path from 'path';

const ARTIFACT_DIR = 'C:\\Users\\Maxsys\\.gemini\\antigravity\\brain\\71e32054-e3d6-4751-82fd-1c1de7ead122';
const BASE_URL = 'http://localhost:3001';

async function run() {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  const page = await context.newPage();

  try {
    console.log('1. Đăng nhập hệ thống HTX...');
    await page.goto(`${BASE_URL}/auth/login`, { waitUntil: 'networkidle' });
    await page.locator('input').first().fill('admin_htx');
    await page.locator('input[type="password"]').fill('password123');
    await page.click('button:has-text("Đăng nhập ngay")');
    await page.waitForURL('**/dashboard', { timeout: 15000 });
    console.log('✓ Đăng nhập thành công.');

    // --- TEST 1: NGUỒN NÔNG NGHIỆP (/agriculture/plots) ---
    console.log('2. Kiểm tra Mẫu 01-PUC tại trang Vùng trồng & Thửa đất (/agriculture/plots)...');
    await page.goto(`${BASE_URL}/agriculture/plots`, { waitUntil: 'networkidle' });
    await page.waitForTimeout(2000);

    const pucBtn = page.locator('button:has-text("Trích lục Mẫu 01-PUC")');
    await pucBtn.click();
    await page.waitForTimeout(1500);

    await page.screenshot({ path: path.join(ARTIFACT_DIR, 'verify_puc_source_export_modal.png') });
    console.log('✓ Đã lưu ảnh: verify_puc_source_export_modal.png');

    // Đóng modal PUC
    const closeBtn = page.locator('button:has-text("Đóng")');
    if (await closeBtn.count() > 0) {
      await closeBtn.first().click();
      await page.waitForTimeout(500);
    }

    // --- TEST 2: ĐÍCH OCOP - TRANG CHI TIẾT HỒ SƠ (/ocop/dossiers) ---
    console.log('3. Điều hướng tới danh sách Hồ sơ OCOP (/ocop/dossiers)...');
    await page.goto(`${BASE_URL}/ocop/dossiers`, { waitUntil: 'networkidle' });
    await page.waitForTimeout(2000);

    // Bấm vào hồ sơ trên bảng để mở Drawer
    await page.locator('tr').filter({ hasText: 'Ớt chuông' }).first().click();
    await page.waitForTimeout(1000);

    // Bấm Mở Workspace Chấm điểm OCOP
    console.log('4. Mở Workspace Chấm điểm OCOP chi tiết...');
    const workspaceBtn = page.locator('button:has-text("Mở Workspace Chấm điểm OCOP")').first();
    await workspaceBtn.click();
    await page.waitForTimeout(2500);

    console.log('5. Mở tab Minh chứng số OCOP...');
    const evidenceTab = page.locator('button:has-text("Minh chứng số")').first();
    await evidenceTab.click();
    await page.waitForTimeout(1500);

    console.log('6. Mở modal Thêm minh chứng -> Tab Trích xuất từ HTX...');
    const addEvBtn = page.locator('button:has-text("Thêm minh chứng")').first();
    await addEvBtn.click();
    await page.waitForTimeout(1000);

    const autoExtractTab = page.locator('button:has-text("Trích xuất từ HTX")');
    await autoExtractTab.click();
    await page.waitForTimeout(1500);

    // Chụp ảnh modal với bộ chọn vùng trồng
    await page.screenshot({ path: path.join(ARTIFACT_DIR, 'verify_ocop_extract_modal_with_units.png') });
    console.log('✓ Đã lưu ảnh: verify_ocop_extract_modal_with_units.png');

    // Kiểm tra các tùy chọn trong dropdown vùng sản xuất
    const unitSelect = page.locator('select').nth(1);
    const unitOptions = await unitSelect.locator('option').allInnerTexts();
    console.log('Danh sách vùng trồng trong bộ chọn:', unitOptions);

    if (unitOptions.length > 1) {
      // Chọn vùng sản xuất cụ thể từ CSDL
      await unitSelect.selectOption({ index: 1 });
      await page.waitForTimeout(500);
    }

    console.log('7. Nhấp nút "Trích xuất & Đính kèm"...');
    const submitExtractBtn = page.locator('button:has-text("Trích xuất & Đính kèm")');
    await submitExtractBtn.click();

    // Chờ phản hồi API và Toast thông báo
    await page.waitForTimeout(4000);
    await page.screenshot({ path: path.join(ARTIFACT_DIR, 'verify_dossier_evidence_extracted_success.png') });
    console.log('✓ Đã lưu ảnh: verify_dossier_evidence_extracted_success.png');

    // --- TEST 3: KIỂM TRA TẠI KHO MINH CHỨNG TỔNG (/ocop/evidences) ---
    console.log('8. Kiểm tra bảng Kho Minh chứng tổng hợp (/ocop/evidences)...');
    await page.goto(`${BASE_URL}/ocop/evidences`, { waitUntil: 'networkidle' });
    await page.waitForTimeout(2500);
    await page.screenshot({ path: path.join(ARTIFACT_DIR, 'verify_evidences_page_table_updated.png') });
    console.log('✓ Đã lưu ảnh: verify_evidences_page_table_updated.png');

    console.log('===> TẤT CẢ CÁC BƯỚC KIỂM THỬ E2E ĐÃ HOÀN TẤT THÀNH CÔNG! <===');
  } catch (err) {
    console.error('Lỗi kiểm thử E2E:', err);
    await page.screenshot({ path: path.join(ARTIFACT_DIR, 'verify_error_trace.png') });
  } finally {
    await browser.close();
  }
}

run();
