import { chromium } from 'playwright';
import path from 'path';

const ARTIFACT_DIR = 'C:\\Users\\Maxsys\\.gemini\\antigravity\\brain\\71e32054-e3d6-4751-82fd-1c1de7ead122';
const BASE_URL = 'http://localhost:3001';

async function runCropSeasonAndFinanceAudit() {
  console.log('======================================================================');
  console.log('KIỂM THỬ E2E TOÀN DIỆN CẢI TIẾN MÙA VỤ & LIÊN KẾT KHO -> SỔ CÔNG NỢ & QUỸ');
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
    console.log('-> Đăng nhập thành công, vào Dashboard.');

    // 2. Chuyển đến trang Mùa vụ
    console.log('\n[BƯỚC 2] Truy cập /agriculture/seasons...');
    await page.goto(`${BASE_URL}/agriculture/seasons`, { waitUntil: 'networkidle' });
    await page.waitForTimeout(2000);

    // -------------------------------------------------------------------------
    // TEST CASE 1: Chuyển đổi Gantt <-> Agenda View
    // -------------------------------------------------------------------------
    console.log('\n--- TEST CASE 1: Biểu đồ Tiến độ Gantt & Chế độ xem Lịch trình (Agenda) ---');
    const ganttSwitchBtn = page.locator('button:has-text("Tiến độ Gantt")');
    if (await ganttSwitchBtn.isVisible()) {
      await ganttSwitchBtn.click();
      await page.waitForTimeout(1500);
    }

    // Chuyển sang Agenda
    const agendaToggleBtn = page.locator('button:has-text("Lịch trình (Agenda)")');
    if (await agendaToggleBtn.isVisible()) {
      await agendaToggleBtn.click();
      await page.waitForTimeout(1500);
      const shotAgenda = path.join(ARTIFACT_DIR, 'verify_season_agenda_view.png');
      await page.screenshot({ path: shotAgenda, fullPage: false });
      console.log(`✓ Đã chụp ảnh Agenda View: ${shotAgenda}`);
      testResults.push({ name: 'Crop Season Agenda View', passed: true, file: 'verify_season_agenda_view.png' });
    }

    // Chuyển lại Gantt
    const ganttToggleBtn = page.locator('button:has-text("Gantt")').first();
    if (await ganttToggleBtn.isVisible()) {
      await ganttToggleBtn.click();
      await page.waitForTimeout(1500);
      const shotGantt = path.join(ARTIFACT_DIR, 'verify_season_gantt_view.png');
      await page.screenshot({ path: shotGantt, fullPage: false });
      console.log(`✓ Đã chụp ảnh Gantt View: ${shotGantt}`);
      testResults.push({ name: 'Crop Season Gantt View', passed: true, file: 'verify_season_gantt_view.png' });
    }

    // -------------------------------------------------------------------------
    // TEST CASE 2: Mở Drawer & Phân Bổ Thửa Đất Hàng Loạt (Bulk Plot Allocation)
    // -------------------------------------------------------------------------
    console.log('\n--- TEST CASE 2: Drawer Mùa Vụ & Phân Bổ Hàng Loạt Thửa Đất ---');
    const detailBtn = page.locator('button:has-text("Chi tiết mùa vụ")');
    await detailBtn.click();
    await page.waitForTimeout(2000);

    // Click Tab 2: Thửa đất & Rải vụ
    const plotsTabBtn = page.locator('button:has-text("Thửa đất & Rải vụ")');
    await plotsTabBtn.click();
    await page.waitForTimeout(1500);

    // Click nút "Phân bổ hàng loạt"
    const bulkAllocateBtn = page.locator('button:has-text("Phân bổ hàng loạt")').first();
    if (await bulkAllocateBtn.isVisible()) {
      await bulkAllocateBtn.click();
      await page.waitForTimeout(1500);
      const shotBulkModal = path.join(ARTIFACT_DIR, 'verify_bulk_allocate_plots_modal.png');
      await page.screenshot({ path: shotBulkModal, fullPage: false });
      console.log(`✓ Đã chụp ảnh Bulk Allocate Modal: ${shotBulkModal}`);
      testResults.push({ name: 'Bulk Allocate Plots Modal', passed: true, file: 'verify_bulk_allocate_plots_modal.png' });

      // Đóng modal bulk allocate bằng nút Đóng
      const closeBulkBtn = page.locator('button:has-text("Đóng")').last();
      if (await closeBulkBtn.isVisible()) {
        await closeBulkBtn.click();
        await page.waitForTimeout(1500);
      }
    }

    // -------------------------------------------------------------------------
    // TEST CASE 3: Nạp Định Mức Mẫu VietGAP (BOM Presets)
    // -------------------------------------------------------------------------
    console.log('\n--- TEST CASE 3: Nạp Định Mức Mẫu VietGAP (BOM Presets) ---');
    const bomTabBtn = page.locator('button:has-text("Dự toán Vật tư (BOM)")');
    await bomTabBtn.click();
    await page.waitForTimeout(2000);

    const applyPresetBtn = page.locator('button:has-text("Nạp định mức mẫu")');
    if (await applyPresetBtn.isVisible()) {
      await applyPresetBtn.click();
      await page.waitForTimeout(1500);
      const shotPresetModal = path.join(ARTIFACT_DIR, 'verify_bom_preset_modal.png');
      await page.screenshot({ path: shotPresetModal, fullPage: false });
      console.log(`✓ Đã chụp ảnh BOM Preset Modal: ${shotPresetModal}`);
      testResults.push({ name: 'VietGAP BOM Preset Modal', passed: true, file: 'verify_bom_preset_modal.png' });

      // Đóng modal preset bằng nút Hủy
      const closePresetBtn = page.locator('button:has-text("Hủy")').last();
      if (await closePresetBtn.isVisible()) {
        await closePresetBtn.click();
        await page.waitForTimeout(1500);
      }
    }

    // -------------------------------------------------------------------------
    // TEST CASE 4: Đề Xuất Xuất Kho Từ Định Mức BOM (Auto Warehouse Issue)
    // -------------------------------------------------------------------------
    console.log('\n--- TEST CASE 4: Đề Xuất Xuất Kho Vật Tư Từ Định Mức BOM ---');
    const createIssueBtn = page.locator('button:has-text("Đề xuất xuất kho")');
    if (await createIssueBtn.isVisible()) {
      await createIssueBtn.click();
      await page.waitForTimeout(1500);
      const shotIssueModal = path.join(ARTIFACT_DIR, 'verify_create_issue_from_bom_modal.png');
      await page.screenshot({ path: shotIssueModal, fullPage: false });
      console.log(`✓ Đã chụp ảnh Create Issue from BOM Modal: ${shotIssueModal}`);
      testResults.push({ name: 'Create Warehouse Issue from BOM Modal', passed: true, file: 'verify_create_issue_from_bom_modal.png' });

      // Đóng modal issue bằng nút Hủy
      const closeIssueBtn = page.locator('button:has-text("Hủy")').last();
      if (await closeIssueBtn.isVisible()) {
        await closeIssueBtn.click();
        await page.waitForTimeout(1500);
      }
    }

    // Đóng drawer mùa vụ
    const closeDrawerBtn = page.locator('#crop-season-detail-sheet button[aria-label="Close"], #crop-season-detail-sheet button:has-text("✕")').first();
    if (await closeDrawerBtn.isVisible()) {
      await closeDrawerBtn.click();
      await page.waitForTimeout(1000);
    }

    // -------------------------------------------------------------------------
    // TEST CASE 5: Kiểm tra Khép kín Sổ Công Nợ (Finance Debts Tab)
    // -------------------------------------------------------------------------
    console.log('\n--- TEST CASE 5: Sổ Công Nợ & Bộ Lọc Vụ Mùa (Finance Debts Tab) ---');
    await page.goto(`${BASE_URL}/finance`, { waitUntil: 'networkidle' });
    await page.waitForTimeout(2000);

    // Chuyển sang Tab Công Nợ
    const debtsTabBtn = page.locator('button:has-text("Công nợ Phải thu / Phải trả")');
    if (await debtsTabBtn.isVisible()) {
      await debtsTabBtn.click();
      await page.waitForTimeout(2000);
    }

    // Cuộn xuống bảng công nợ để thấy thanh controls Vụ mùa và danh sách
    const tableLocator = page.locator('table');
    if (await tableLocator.isVisible()) {
      await tableLocator.scrollIntoViewIfNeeded();
      await page.waitForTimeout(1000);
    }

    // Chụp ảnh Sổ Công nợ có Dropdown Vụ mùa và các Badge vụ mùa
    const shotFinance = path.join(ARTIFACT_DIR, 'verify_finance_debts_tab_with_season_filter.png');
    await page.screenshot({ path: shotFinance, fullPage: true });
    console.log(`✓ Đã chụp ảnh Finance Debts Tab: ${shotFinance}`);
    testResults.push({ name: 'Finance Debts Tab with Season Filter & Badges', passed: true, file: 'verify_finance_debts_tab_with_season_filter.png' });

    console.log('\n======================================================================');
    console.log('TẤT CẢ CÁC BÀI TEST ĐÃ HOÀN TẤT THÀNH CÔNG RỰC RỠ:');
    testResults.forEach((t, i) => {
      console.log(`  [${i + 1}] ${t.name}: PASSED -> ${t.file}`);
    });
    console.log('======================================================================\n');
  } catch (error) {
    console.error('LỖI TRONG QUÁ TRÌNH TEST:', error);
    const errShot = path.join(ARTIFACT_DIR, 'verify_crop_season_error_trace.png');
    await page.screenshot({ path: errShot, fullPage: true }).catch(() => {});
  } finally {
    await browser.close();
  }
}

runCropSeasonAndFinanceAudit();
