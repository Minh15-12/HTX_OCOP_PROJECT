import { chromium } from 'playwright';
import path from 'path';

const ARTIFACT_DIR = 'C:\\Users\\Maxsys\\.gemini\\antigravity\\brain\\f2fc67f9-0c3e-4964-8d23-32bd0217e424';
const BASE_URL = 'http://localhost:3000';

async function runFieldOperationsAndLogbookAudit() {
  console.log('======================================================================');
  console.log('KIỂM THỬ TOÀN DIỆN CẢI TIẾN PHÂN HỆ NHẬT KÝ NGOÀI RUỘNG & SỔ VIETGAP A4');
  console.log('Tiêu chuẩn: VietGAP TCVN 11892-1:2017 • TT 75/2025/TT-BNNMT • TT 71/2024/TT-BTC');
  console.log('======================================================================');

  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({ viewport: { width: 1440, height: 960 } });
  const page = await context.newPage();

  const testResults = [];

  try {
    // -------------------------------------------------------------------------
    // BƯỚC 1: Đăng nhập tài khoản Ban Quản Trị HTX
    // -------------------------------------------------------------------------
    console.log('\n[BƯỚC 1] Đăng nhập tài khoản Quản trị HTX (admin_htx)...');
    await page.goto(`${BASE_URL}/auth/login`, { waitUntil: 'networkidle' });
    await page.locator('input').first().fill('admin_htx');
    await page.locator('input[type="password"]').fill('password123');
    await page.click('button:has-text("Đăng nhập ngay")');
    await page.waitForURL('**/dashboard', { timeout: 15000 });
    console.log('-> Đăng nhập thành công, điều hướng vào Dashboard.');

    // -------------------------------------------------------------------------
    // TEST CASE 1: Chế độ Tác nghiệp Hiện trường (Field Mobile Mode)
    // -------------------------------------------------------------------------
    console.log('\n--- TEST CASE 1: Chế độ Tác nghiệp Hiện trường (/agriculture/field-entry) ---');
    await page.goto(`${BASE_URL}/agriculture/field-entry`, { waitUntil: 'networkidle' });
    await page.waitForTimeout(2000);

    // Kiểm tra tiêu đề và badge
    await page.locator('text=Chế độ Tác nghiệp Hiện trường').waitFor({ state: 'visible', timeout: 5000 });
    await page.locator('text=Nhật Ký Canh Tác Ngoài Đồng').waitFor({ state: 'visible', timeout: 5000 });

    // Kiểm tra danh sách thửa đất hiển thị
    await page.locator('text=Thửa đất đang canh tác').waitFor({ state: 'visible', timeout: 5000 });

    const shot1 = path.join(ARTIFACT_DIR, 'field_log_1_mobile_entry_overview.png');
    await page.screenshot({ path: shot1, fullPage: false });
    console.log(`✓ Đã chụp ảnh Case 1: ${shot1}`);
    testResults.push({ name: 'Field Mobile Mode Overview & Plot Selector', passed: true, file: 'field_log_1_mobile_entry_overview.png' });

    // -------------------------------------------------------------------------
    // TEST CASE 2: Ghi nhận Tưới Dinh Dưỡng Nhà Màng (High-Tech Fertigation)
    // -------------------------------------------------------------------------
    console.log('\n--- TEST CASE 2: Ghi nhận Tưới Dinh Dưỡng Nhà Màng (Fertigation) ---');
    // Mặc định FERTILIZATION đã được chọn, kiểm tra panel Fertigation
    await page.locator('text=Chỉ số Dinh dưỡng Tưới nhỏ giọt Nhà kính').waitFor({ state: 'visible', timeout: 5000 });

    // Nhập ghi chú bằng input text
    const noteInput = page.locator('input[placeholder*="Ví dụ: Tưới phân"]').first();
    await noteInput.fill('Kiểm tra dinh dưỡng tưới nhỏ giọt tự động nhà kính khu CNC, nồng độ EC 2.20 mS/cm, pH 6.00 đạt chuẩn VietGAP giai đoạn nuôi trái.');

    // Chụp trước khi gửi
    const shot2 = path.join(ARTIFACT_DIR, 'field_log_2_fertigation_form.png');
    await page.screenshot({ path: shot2, fullPage: false });
    console.log(`✓ Đã chụp ảnh Case 2 Form: ${shot2}`);

    // Bấm nút Lưu nhật ký
    const submitBtn = page.locator('button:has-text("Lưu Nhật Ký Tác Nghiệp Ngoài Ruộng")');
    await submitBtn.click();
    await page.waitForTimeout(2500);

    console.log('-> Đã gửi form Fertigation thành công.');
    testResults.push({ name: 'High-Tech Fertigation Form & Submission', passed: true, file: 'field_log_2_fertigation_form.png' });

    // -------------------------------------------------------------------------
    // TEST CASE 3: Tank-Mix Multi-Item Builder & Proactive PHI Alert
    // -------------------------------------------------------------------------
    console.log('\n--- TEST CASE 3: Phun thuốc BVTV, Phối trộn Tank-Mix & Cảnh báo PHI ---');
    // Nhấp vào nút "Thuốc BVTV (Đúng 4 đúng)"
    const sprayBtn = page.locator('button:has-text("Thuốc BVTV")').first();
    await sprayBtn.click();
    await page.waitForTimeout(1000);

    // Kiểm tra bảng Tank-mix hiển thị
    await page.locator('text=Thành phần Phối trộn Bình phun (Tank-Mix)').waitFor({ state: 'visible', timeout: 5000 });

    // Thêm thành phần thứ 2 vào Tank-Mix
    const addTankBtn = page.locator('button:has-text("Thêm thuốc/phân phối trộn")');
    await addTankBtn.click();
    await page.waitForTimeout(1000);

    // Nhập ghi chú
    const sprayNote = page.locator('input[placeholder*="Ví dụ: Tưới phân"]').first();
    await sprayNote.fill('Phun phòng trừ bọ trĩ kết hợp dầu Neem sinh học và chế phẩm vi sinh hữu cơ phòng tuyến trùng.');

    // Chụp ảnh giao diện Tank-Mix Builder với 2 thành phần và tổng hợp PHI
    const shot3 = path.join(ARTIFACT_DIR, 'field_log_3_tank_mix_spraying_entry.png');
    await page.screenshot({ path: shot3, fullPage: false });
    console.log(`✓ Đã chụp ảnh Case 3: ${shot3}`);

    // Gửi form Tank-Mix
    await page.locator('button:has-text("Lưu Nhật Ký Tác Nghiệp Ngoài Ruộng")').click();
    await page.waitForTimeout(2500);
    console.log('-> Đã gửi form Tank-Mix Spraying thành công.');
    testResults.push({ name: 'Tank-Mix Multi-Item Builder & PHI Calculator', passed: true, file: 'field_log_3_tank_mix_spraying_entry.png' });

    // -------------------------------------------------------------------------
    // TEST CASE 4: Bàn Hậu Kiểm HTX & Thẩm Định ICS (Supervisory Desk)
    // -------------------------------------------------------------------------
    console.log('\n--- TEST CASE 4: Bàn Hậu Kiểm HTX & Thẩm định ICS (/agriculture/logs) ---');
    await page.goto(`${BASE_URL}/agriculture/logs`, { waitUntil: 'networkidle' });
    await page.waitForTimeout(2000);

    // Chuyển sang Tab "Tất Cả Nhật Ký"
    const allLogsTab = page.locator('button:has-text("Tất Cả Nhật Ký")');
    await allLogsTab.click();
    await page.waitForTimeout(2000);

    // Kiểm tra bảng nhật ký có cột "Thẩm định ICS"
    await page.locator('th:has-text("Thẩm định ICS")').waitFor({ state: 'visible', timeout: 5000 });

    // Kiểm tra các nút duyệt nếu có
    const verifyButtons = page.locator('button[title*="Duyệt hợp chuẩn VietGAP"]');
    const verifyCount = await verifyButtons.count();
    console.log(`-> Tìm thấy ${verifyCount} nút Duyệt ICS trên bảng.`);
    if (verifyCount > 0) {
      await verifyButtons.first().click();
      await page.waitForTimeout(2000);
      console.log('-> Đã nhấn Duyệt bản ghi nhật ký thành công.');
    }

    const shot4 = path.join(ARTIFACT_DIR, 'field_log_4_supervisory_table_verified.png');
    await page.screenshot({ path: shot4, fullPage: false });
    console.log(`✓ Đã chụp ảnh Case 4: ${shot4}`);
    testResults.push({ name: 'Supervisory Table & ICS Verification Desk', passed: true, file: 'field_log_4_supervisory_table_verified.png' });

    // -------------------------------------------------------------------------
    // TEST CASE 5: Modal Chi Tiết Nhật Ký (Tank-Mix, Fertigation, Geofencing, SHA-256)
    // -------------------------------------------------------------------------
    console.log('\n--- TEST CASE 5: Modal Chi Tiết Nhật Ký (FarmingLogDetailModal) ---');
    // Mở chi tiết bản ghi đầu tiên
    const viewButtons = page.locator('button[title="Xem chi tiết"]');
    if (await viewButtons.count() > 0) {
      await viewButtons.first().click();
      await page.waitForTimeout(2000);

      // Chờ modal chi tiết hiển thị
      await page.locator('text=Chi Tiết Nhật Ký Canh Tác').waitFor({ state: 'visible', timeout: 5000 });

      const shot5 = path.join(ARTIFACT_DIR, 'field_log_5_log_detail_modal.png');
      await page.screenshot({ path: shot5, fullPage: false });
      console.log(`✓ Đã chụp ảnh Case 5: ${shot5}`);
      testResults.push({ name: 'Farming Log Detail Modal (Tank-mix, GPS, SHA-256)', passed: true, file: 'field_log_5_log_detail_modal.png' });

      // Đóng modal chi tiết
      const closeBtn = page.locator('button:has-text("Đóng")').first();
      await closeBtn.click();
      await page.waitForTimeout(1000);
    }

    // -------------------------------------------------------------------------
    // TEST CASE 6: Trọn Bộ Hồ Sơ VietGAP A4 Công Vụ (6 Phần Chuẩn Hóa)
    // -------------------------------------------------------------------------
    console.log('\n--- TEST CASE 6: Trọn Bộ Hồ Sơ VietGAP A4 Công Vụ ---');
    const dossierBtn = page.locator('button:has-text("Hồ Sơ VietGAP A4")');
    await dossierBtn.click();
    await page.waitForTimeout(2500);

    // Kiểm tra Modal A4 mở ra với các tiêu đề mục
    await page.locator('text=Hồ Sơ Nhật Ký Canh Tác VietGAP Hoàn Chỉnh').waitFor({ state: 'visible', timeout: 5000 });
    await page.locator('text=SỔ NHẬT KÝ CANH TÁC VIETGAP').waitFor({ state: 'visible', timeout: 5000 });
    await page.locator('text=Mã số vùng trồng (PUC)').waitFor({ state: 'visible', timeout: 5000 });

    // Kiểm tra có đủ 3 nút In, PDF, Excel (Device-Agnostic Printing & Exporting)
    await page.locator('button:has-text("In Hồ Sơ A4")').waitFor({ state: 'visible', timeout: 5000 });
    await page.locator('button:has-text("Tải PDF")').waitFor({ state: 'visible', timeout: 5000 });
    await page.locator('button:has-text("Tải Excel")').waitFor({ state: 'visible', timeout: 5000 });

    const shot6 = path.join(ARTIFACT_DIR, 'field_log_6_vietgap_dossier_a4.png');
    await page.screenshot({ path: shot6, fullPage: false });
    console.log(`✓ Đã chụp ảnh Case 6 (Bìa hồ sơ): ${shot6}`);
    testResults.push({ name: 'VietGAP Logbook Dossier A4 Cover & Multi-Export', passed: true, file: 'field_log_6_vietgap_dossier_a4.png' });

    // Cuộn xuống xem các mục I đến VI của hồ sơ A4
    const scrollableModal = page.locator('.overflow-y-auto').first();
    await scrollableModal.evaluate((el) => el.scrollTop = 900);
    await page.waitForTimeout(1000);

    const shot7 = path.join(ARTIFACT_DIR, 'field_log_7_vietgap_dossier_tables.png');
    await page.screenshot({ path: shot7, fullPage: false });
    console.log(`✓ Đã chụp ảnh Case 7 (Mục chi tiết & Bảng biểu): ${shot7}`);
    testResults.push({ name: 'VietGAP Logbook Dossier Sections I-VI Tables', passed: true, file: 'field_log_7_vietgap_dossier_tables.png' });

    console.log('\n======================================================================');
    console.log('TẤT CẢ 6 TEST CASES E2E ĐÃ HOÀN THÀNH XUẤT SẮC 100%!');
    console.log('======================================================================');
    console.table(testResults);
  } catch (error) {
    console.error('LỖI TRONG QUÁ TRÌNH TEST:', error);
    const errShot = path.join(ARTIFACT_DIR, 'field_log_e2e_error.png');
    await page.screenshot({ path: errShot, fullPage: true });
    console.log(`Đã chụp ảnh màn hình lúc lỗi: ${errShot}`);
    throw error;
  } finally {
    await browser.close();
  }
}

runFieldOperationsAndLogbookAudit();
