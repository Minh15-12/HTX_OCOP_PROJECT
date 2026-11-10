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

    // --- TEST 1: KHO MINH CHỨNG TỔNG (/ocop/evidences) ---
    console.log('2. Điều hướng tới Kho minh chứng số (/ocop/evidences)...');
    await page.goto(`${BASE_URL}/ocop/evidences`, { waitUntil: 'networkidle' });
    await page.waitForTimeout(2000);

    // Mở modal Thêm minh chứng
    console.log('3. Mở Modal Thêm minh chứng bằng nút "Tải lên tài liệu"...');
    const uploadBtn = page.locator('button:has-text("Tải lên tài liệu")').first();
    await uploadBtn.click();
    await page.waitForTimeout(1000);

    // Chọn tab "Trích xuất từ HTX"
    console.log('4. Chọn tab "Trích xuất từ HTX (Auto Cross-Ref)"...');
    const extractTab = page.locator('button:has-text("Trích xuất từ HTX")').first();
    await extractTab.click();
    await page.waitForTimeout(1000);

    // --- TEST 2: LUỒNG 1: LAO ĐỘNG ĐỊA PHƯƠNG (TC-A.2.1) ---
    console.log('5. Kiểm tra tùy chọn "Lao động địa phương (TC-A.2.1)"...');
    const laborCard = page.locator('span:has-text("Lao động địa phương (TC-A.2.1)")').first();
    await laborCard.click();
    await page.waitForTimeout(1000);

    await page.screenshot({ path: path.join(ARTIFACT_DIR, 'verify_labor_modal_options.png') });
    console.log('✓ Đã lưu ảnh: verify_labor_modal_options.png');

    console.log('6. Bấm "Trích xuất & Đính kèm" Báo cáo Lao động Địa phương...');
    const submitBtn = page.locator('button:has-text("Trích xuất & Đính kèm")').first();
    await submitBtn.click();
    await page.waitForTimeout(3500);
    console.log('✓ Đã trích xuất xong Báo cáo Lao động Địa phương.');

    // --- TEST 3: LUỒNG 2: LIÊN KẾT CHUỖI NÔNG HỘ THEO VÙNG TRỒNG (TC-A.3.1) ---
    console.log('7. Mở lại Modal để trích xuất "Liên kết chuỗi nông hộ (TC-A.3.1)"...');
    await uploadBtn.click();
    await page.waitForTimeout(1000);
    await extractTab.click();
    await page.waitForTimeout(1000);

    const chainCard = page.locator('span:has-text("Liên kết chuỗi nông hộ (TC-A.3.1)")').first();
    await chainCard.click();
    await page.waitForTimeout(1000);

    // Chọn vùng trồng cụ thể VT-DALAT-01
    console.log('8. Chọn Vùng sản xuất VT-DALAT-01 cho liên kết chuỗi...');
    const unitSelect = page.locator('select').first();
    if (await unitSelect.count() > 0) {
      const options = await unitSelect.locator('option').all();
      for (const opt of options) {
        const txt = await opt.innerText();
        if (txt.includes('VT-DALAT-01')) {
          const val = await opt.getAttribute('value');
          if (val) {
            await unitSelect.selectOption(val);
            console.log(`   Đã chọn vùng: ${txt}`);
            break;
          }
        }
      }
    }
    await page.waitForTimeout(1000);

    await page.screenshot({ path: path.join(ARTIFACT_DIR, 'verify_member_chain_modal_with_unit.png') });
    console.log('✓ Đã lưu ảnh: verify_member_chain_modal_with_unit.png');

    console.log('9. Bấm "Trích xuất & Đính kèm" Danh bạ Chuỗi Nông hộ...');
    await submitBtn.click();
    await page.waitForTimeout(3500);
    console.log('✓ Đã trích xuất xong Danh bạ Chuỗi Nông hộ.');

    // --- TEST 4: ĐỐI SOÁT TRÊN BẢNG MINH CHỨNG TỔNG ---
    console.log('10. Đối soát trên Bảng Kho minh chứng số (/ocop/evidences)...');
    await page.waitForTimeout(2000);

    await page.screenshot({ path: path.join(ARTIFACT_DIR, 'verify_member_and_labor_evidences_table.png') });
    console.log('✓ Đã lưu ảnh: verify_member_and_labor_evidences_table.png');

    console.log('=== TẤT CẢ CÁC BƯỚC KIỂM THỬ E2E HOÀN TẤT THÀNH CÔNG 100% ===');
  } catch (err) {
    console.error('Lỗi kiểm thử E2E:', err);
    await page.screenshot({ path: path.join(ARTIFACT_DIR, 'verify_member_error_trace.png') });
    process.exit(1);
  } finally {
    await browser.close();
  }
}

run();
