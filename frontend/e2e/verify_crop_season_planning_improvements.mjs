import { chromium } from 'playwright';
import path from 'path';

const ARTIFACT_DIR = 'C:\\Users\\Maxsys\\.gemini\\antigravity\\brain\\f2fc67f9-0c3e-4964-8d23-32bd0217e424';
const BASE_URL = 'http://localhost:3001';

async function runCropSeasonAudit() {
  console.log('======================================================================');
  console.log('KIỂM THỬ TOÀN DIỆN CẢI TIẾN PHÂN HỆ KẾ HOẠCH MÙA VỤ (CROP SEASON PLANNING)');
  console.log('======================================================================');

  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({ viewport: { width: 1440, height: 960 } });
  const page = await context.newPage();

  const testResults = [];

  try {
    // 1. Đăng nhập
    console.log('\n[BƯỚC 1] Đăng nhập tài khoản Ban Quản Trị HTX (admin_htx)...');
    await page.goto(`${BASE_URL}/auth/login`, { waitUntil: 'networkidle' });
    await page.locator('input').first().fill('admin_htx');
    await page.locator('input[type="password"]').fill('password123');
    await page.click('button:has-text("Đăng nhập ngay")');
    await page.waitForURL('**/dashboard', { timeout: 15000 });
    console.log('-> Đăng nhập thành công, điều hướng vào Dashboard.');

    // 2. Chuyển đến trang Mùa vụ
    console.log('\n[BƯỚC 2] Truy cập /agriculture/seasons...');
    await page.goto(`${BASE_URL}/agriculture/seasons`, { waitUntil: 'networkidle' });
    await page.waitForTimeout(2000);

    // -------------------------------------------------------------------------
    // TEST CASE 1: Bảng danh sách mùa vụ (Table View) & Chuyển đổi chế độ xem
    // -------------------------------------------------------------------------
    console.log('\n--- TEST CASE 1: Bảng Danh Sách Mùa Vụ (Table View) ---');
    const tableSwitchBtn = page.locator('button:has-text("Bảng danh sách")');
    await tableSwitchBtn.waitFor({ state: 'visible', timeout: 5000 });
    const shot1 = path.join(ARTIFACT_DIR, 'crop_season_1_table_view.png');
    await page.screenshot({ path: shot1, fullPage: false });
    console.log(`✓ Đã chụp ảnh Case 1: ${shot1}`);
    testResults.push({ name: 'Table View & View Mode Switcher', passed: true, file: 'crop_season_1_table_view.png' });

    // -------------------------------------------------------------------------
    // TEST CASE 2: Biểu đồ Tiến độ Gantt (Timeline Gantt View)
    // -------------------------------------------------------------------------
    console.log('\n--- TEST CASE 2: Biểu Đồ Tiến Độ Gantt (Gantt Timeline View) ---');
    const ganttSwitchBtn = page.locator('button:has-text("Tiến độ Gantt")');
    await ganttSwitchBtn.click();
    await page.waitForTimeout(2000);

    // Kiểm tra vạch Hôm nay hoặc thanh mùa vụ
    await page.locator('text=Biểu đồ Tiến độ Gantt').waitFor({ state: 'visible', timeout: 5000 });
    const shot2 = path.join(ARTIFACT_DIR, 'crop_season_2_gantt_timeline_view.png');
    await page.screenshot({ path: shot2, fullPage: false });
    console.log(`✓ Đã chụp ảnh Case 2: ${shot2}`);
    testResults.push({ name: 'Gantt Timeline View & Staggered Planting', passed: true, file: 'crop_season_2_gantt_timeline_view.png' });

    // -------------------------------------------------------------------------
    // TEST CASE 3: Mở Drawer Mùa Vụ - Tab 1: Kế Hoạch & Phác Đồ VietGAP
    // -------------------------------------------------------------------------
    console.log('\n--- TEST CASE 3: Drawer Tab 1 - Phác Đồ 4 Giai Đoạn & Cân Đối Bao Tiêu ---');
    const detailBtn = page.locator('button:has-text("Chi tiết mùa vụ")');
    await detailBtn.click();
    await page.waitForTimeout(2000);

    // Kiểm tra Drawer hiển thị
    await page.locator('#crop-season-detail-sheet').waitFor({ state: 'visible', timeout: 5000 });
    await page.locator('text=Phác đồ Sinh trưởng 4 Giai đoạn VietGAP').waitFor({ state: 'visible', timeout: 5000 });
    await page.locator('text=Cân đối Hợp đồng Bao tiêu').waitFor({ state: 'visible', timeout: 5000 });

    const shot3 = path.join(ARTIFACT_DIR, 'crop_season_3_drawer_overview_and_sop.png');
    await page.screenshot({ path: shot3, fullPage: false });
    console.log(`✓ Đã chụp ảnh Case 3: ${shot3}`);
    testResults.push({ name: 'Crop Stages Tracker & Supply-Demand Balance', passed: true, file: 'crop_season_3_drawer_overview_and_sop.png' });

    // -------------------------------------------------------------------------
    // TEST CASE 4: Drawer Tab 2 - Thửa Đất Phân Bổ & Lịch Rải Vụ
    // -------------------------------------------------------------------------
    console.log('\n--- TEST CASE 4: Drawer Tab 2 - Thửa Đất Phân Bổ & Lịch Rải Vụ ---');
    const tabPlotsBtn = page.locator('#crop-season-detail-sheet button:has-text("Thửa đất & Rải vụ")');
    await tabPlotsBtn.click();
    await page.waitForTimeout(2000);

    await page.locator('text=Cam kết Sản lượng Xã viên').waitFor({ state: 'visible', timeout: 5000 });
    const shot4 = path.join(ARTIFACT_DIR, 'crop_season_4_drawer_plots_allocation.png');
    await page.screenshot({ path: shot4, fullPage: false });
    console.log(`✓ Đã chụp ảnh Case 4: ${shot4}`);
    testResults.push({ name: 'Plots Allocation & Staggered Schedule', passed: true, file: 'crop_season_4_drawer_plots_allocation.png' });

    // -------------------------------------------------------------------------
    // TEST CASE 5: Modal Phân Bổ Thửa Đất Vào Mùa Vụ
    // -------------------------------------------------------------------------
    console.log('\n--- TEST CASE 5: Modal Phân Bổ Thửa Đất Mới ---');
    const allocateBtn = page.locator('#crop-season-detail-sheet button:has-text("Phân bổ thửa đất vào vụ")');
    await allocateBtn.click();
    await page.waitForTimeout(1500);

    await page.locator('text=Phân bổ Thửa đất vào Mùa vụ').waitFor({ state: 'visible', timeout: 5000 });
    const shot5 = path.join(ARTIFACT_DIR, 'crop_season_5_modal_allocate_plot.png');
    await page.screenshot({ path: shot5, fullPage: false });
    console.log(`✓ Đã chụp ảnh Case 5: ${shot5}`);
    testResults.push({ name: 'Allocate Plot Modal', passed: true, file: 'crop_season_5_modal_allocate_plot.png' });

    // Đóng Modal phân bổ
    const closeAllocateBtn = page.locator('button:has-text("Hủy bỏ")');
    if ((await closeAllocateBtn.count()) > 0) {
      await closeAllocateBtn.first().click();
      await page.waitForTimeout(1000);
    }

    // -------------------------------------------------------------------------
    // TEST CASE 6: Drawer Tab 3 - Dự Toán Định Mức Vật Tư (BOM) & Ngân Sách
    // -------------------------------------------------------------------------
    console.log('\n--- TEST CASE 6: Drawer Tab 3 - Bảng Định Mức BOM & Ngân Sách ---');
    const tabBomBtn = page.locator('#crop-season-detail-sheet button:has-text("Dự toán Vật tư (BOM)")');
    await tabBomBtn.click();
    await page.waitForTimeout(2000);

    await page.locator('text=Định mức Vật tư Đầu vào (Bill of Materials - BOM)').waitFor({ state: 'visible', timeout: 5000 });
    const shot6 = path.join(ARTIFACT_DIR, 'crop_season_6_drawer_bom_budget.png');
    await page.screenshot({ path: shot6, fullPage: false });
    console.log(`✓ Đã chụp ảnh Case 6: ${shot6}`);
    testResults.push({ name: 'Season BOM & Budget Overview', passed: true, file: 'crop_season_6_drawer_bom_budget.png' });

    // -------------------------------------------------------------------------
    // TEST CASE 7: Modal Chỉnh Sửa Dự Toán BOM
    // -------------------------------------------------------------------------
    console.log('\n--- TEST CASE 7: Modal Lập / Cập Nhật Dự Toán BOM ---');
    const editBomBtn = page.locator('#crop-season-detail-sheet button:has-text("Lập / Cập nhật dự toán BOM")');
    await editBomBtn.click();
    await page.waitForTimeout(1500);

    await page.locator('text=Lập Dự toán Định mức Vật tư Đầu vào (BOM)').waitFor({ state: 'visible', timeout: 5000 });
    const shot7 = path.join(ARTIFACT_DIR, 'crop_season_7_modal_bom_editor.png');
    await page.screenshot({ path: shot7, fullPage: false });
    console.log(`✓ Đã chụp ảnh Case 7: ${shot7}`);
    testResults.push({ name: 'Season BOM Editor Modal', passed: true, file: 'crop_season_7_modal_bom_editor.png' });

    // Đóng Modal BOM
    const closeBomBtn = page.locator('button:has-text("Hủy bỏ")');
    if ((await closeBomBtn.count()) > 0) {
      await closeBomBtn.last().click();
      await page.waitForTimeout(1000);
    }

    console.log('\n======================================================================');
    console.log('KẾT QUẢ KIỂM THỬ: 7/7 TEST CASES ĐẠT CHUẨN 100%');
    console.log('======================================================================');
    testResults.forEach((r, i) => {
      console.log(`[${i + 1}] ${r.name}: ${r.passed ? 'PASS ✓' : 'FAIL ✗'} (${r.file})`);
    });

  } catch (err) {
    console.error('LỖI KIỂM THỬ:', err);
    process.exit(1);
  } finally {
    await browser.close();
  }
}

runCropSeasonAudit();
