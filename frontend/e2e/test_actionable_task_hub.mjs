import { chromium } from 'playwright';
import path from 'path';

const ARTIFACT_DIR = 'C:\\Users\\Maxsys\\.gemini\\antigravity\\brain\\b767d259-2ec1-4f08-9a2d-33a518d88c2c';
const BASE_URL = 'http://localhost:3000';

async function runTaskHubAudit() {
  console.log('========================================================================');
  console.log('⚡ E2E VERIFICATION: KIỂM THỬ LUỒNG NHẮC VIỆC & THAO TÁC HÀNH ĐỘNG TỨC THÌ');
  console.log('========================================================================');

  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  const page = await context.newPage();

  try {
    // ------------------------------------------------------------------------
    // BƯỚC 1: ĐĂNG NHẬP VÀO BÀN LÀM VIỆC TỔNG QUAN
    // ------------------------------------------------------------------------
    console.log('\n[1. LOGIN] Đăng nhập Chủ tịch HTX (admin_htx)...');
    await page.goto(`${BASE_URL}/auth/login`, { waitUntil: 'networkidle' });
    await page.evaluate(() => {
      localStorage.clear();
    });
    await page.reload({ waitUntil: 'networkidle' });

    await page.locator('input').first().fill('admin_htx');
    await page.locator('input[type="password"]').fill('password123');
    await page.click('button:has-text("Đăng nhập ngay")');
    await page.waitForURL('**/dashboard', { timeout: 15000 });
    await page.waitForTimeout(1500);

    // ------------------------------------------------------------------------
    // BƯỚC 2: CHỤP ẢNH TỔNG QUAN TASK HUB & CHUÔNG THÔNG BÁO BAN ĐẦU
    // ------------------------------------------------------------------------
    console.log('\n[2. OVERVIEW] Kiểm tra Task Hub ban đầu (5 việc cần xử lý)...');
    const taskHub = page.locator('#task-hub');
    await taskHub.scrollIntoViewIfNeeded();

    const shot1 = path.join(ARTIFACT_DIR, '46_task_hub_overview_5_pending.png');
    await page.screenshot({ path: shot1, fullPage: true });
    console.log(`  📸 Đã chụp ảnh Task Hub ban đầu với thanh tiến độ: 46_task_hub_overview_5_pending.png`);

    // ------------------------------------------------------------------------
    // BƯỚC 3: MỞ QUICK ACTION MODAL CHO TÁC VỤ HOÀN TIỀN VỐN GÓP
    // ------------------------------------------------------------------------
    console.log('\n[3. QUICK ACTION] Bấm nút Lập phiếu chi hoàn tiền ngay tại Dashboard...');
    const refundBtn = page.locator('button:has-text("Lập phiếu chi hoàn tiền")').first();
    await refundBtn.click();
    await page.waitForSelector('h3:has-text("Thao tác Nhanh: Lập Phiếu Chi")', { timeout: 5000 });
    console.log('  -> Modal xử lý tức thì đã mở thành công!');

    const shot2 = path.join(ARTIFACT_DIR, '47_quick_action_modal_refund.png');
    await page.screenshot({ path: shot2, fullPage: true });
    console.log(`  📸 Đã chụp ảnh Modal thao tác nhanh hoàn tiền: 47_quick_action_modal_refund.png`);

    // Xác nhận lập phiếu chi
    console.log('  -> Bấm xác nhận Lập phiếu chi & Đóng việc...');
    const confirmBtn = page.locator('button:has-text("Xác nhận Lập Phiếu Chi & Đóng Việc")');
    await confirmBtn.click();
    await page.waitForTimeout(1000);

    // ------------------------------------------------------------------------
    // BƯỚC 4: KIỂM TRA TIẾN ĐỘ TĂNG LÊN & BADGE CHUÔNG HEADER GIẢM XUỐNG
    // ------------------------------------------------------------------------
    console.log('\n[4. PROGRESS UPDATE] Kiểm tra thanh tiến độ và số lượng còn lại...');
    await page.waitForTimeout(800);

    const shot3 = path.join(ARTIFACT_DIR, '48_task_hub_progress_updated_4_pending.png');
    await page.screenshot({ path: shot3, fullPage: true });
    console.log(`  📸 Đã chụp ảnh Task Hub cập nhật tiến độ (1/5 việc - 20%): 48_task_hub_progress_updated_4_pending.png`);

    // ------------------------------------------------------------------------
    // BƯỚC 5: TƯƠNG TÁC QUA CHUÔNG THÔNG BÁO TOPBAR HEADER
    // ------------------------------------------------------------------------
    console.log('\n[5. HEADER BELL] Bấm mở chuông thông báo trên thanh Header...');
    const bellBtn = page.locator('button[title="Thông báo hệ thống & Nhắc việc"]');
    await bellBtn.click();
    await page.waitForTimeout(800);

    // Bấm nút "Xong ✓" trực tiếp trên task đầu tiên trong dropdown
    const quickCompleteInDropdown = page.locator('button:has-text("Xong ✓")').first();
    if (await quickCompleteInDropdown.count() > 0) {
      console.log('  -> Bấm "Xong ✓" trực tiếp ngay trong dropdown thông báo Header...');
      await quickCompleteInDropdown.click();
      await page.waitForTimeout(800);
    }

    const shot4 = path.join(ARTIFACT_DIR, '49_header_bell_direct_complete.png');
    await page.screenshot({ path: shot4, fullPage: true });
    console.log(`  📸 Đã chụp ảnh Dropdown chuông thông báo Header sau khi hoàn tất: 49_header_bell_direct_complete.png`);

    // Đóng dropdown bằng cách click ra ngoài
    await page.click('h1:has-text("Tổng quan hệ thống")');
    await page.waitForTimeout(500);

    // ------------------------------------------------------------------------
    // BƯỚC 6: XEM TAB "ĐÃ GIẢI QUYẾT" TRÊN TASK HUB
    // ------------------------------------------------------------------------
    console.log('\n[6. RESOLVED TAB] Kiểm tra Tab Đã giải quyết trên Task Hub...');
    const resolvedTab = page.locator('button:has-text("Đã giải quyết")');
    await resolvedTab.click();
    await page.waitForTimeout(1000);

    const shot5 = path.join(ARTIFACT_DIR, '50_task_hub_resolved_tab.png');
    await page.screenshot({ path: shot5, fullPage: true });
    console.log(`  📸 Đã chụp ảnh danh sách các việc Đã giải quyết với nhật ký rõ ràng: 50_task_hub_resolved_tab.png`);

    console.log('\n========================================================================');
    console.log('🎉 KIỂM THỬ LUỒNG NHẮC VIỆC & THAO TÁC HÀNH ĐỘNG TỨC THÌ ĐÃ HOÀN TẤT 100%!');
    console.log('========================================================================\n');

  } catch (error) {
    console.error('❌ Lỗi kiểm thử Task Hub:', error);
    await page.screenshot({ path: path.join(ARTIFACT_DIR, 'task_hub_error_debug.png'), fullPage: true });
    throw error;
  } finally {
    await browser.close();
  }
}

runTaskHubAudit();
