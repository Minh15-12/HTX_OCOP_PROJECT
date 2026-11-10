import { chromium } from 'playwright';
import path from 'path';

const ARTIFACT_DIR = 'C:\\Users\\Maxsys\\.gemini\\antigravity\\brain\\f2fc67f9-0c3e-4964-8d23-32bd0217e424';
const BASE_URL = 'http://localhost:3001';

async function verifyWebGisAndQuota() {
  console.log('--- Bắt đầu kiểm thử toàn diện WebGIS & Chống gian lận sản lượng ---');
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  const page = await context.newPage();

  try {
    // 1. Đăng nhập hệ thống
    console.log('[1] Đăng nhập tài khoản Ban Quản Trị HTX...');
    await page.goto(`${BASE_URL}/auth/login`, { waitUntil: 'networkidle' });
    await page.locator('input').first().fill('admin_htx');
    await page.locator('input[type="password"]').fill('password123');
    await page.click('button:has-text("Đăng nhập ngay")');
    await page.waitForURL('**/dashboard', { timeout: 15000 });
    console.log('-> Đăng nhập thành công, vào trang Dashboard.');

    // 2. Chuyển tới trang Thửa Đất & Vùng Trồng
    console.log('[2] Truy cập /agriculture/plots...');
    await page.goto(`${BASE_URL}/agriculture/plots`, { waitUntil: 'networkidle' });
    await page.waitForTimeout(2000);

    // Chuyển sang chế độ Bản Đồ Số GIS
    const mapToggleBtn = page.locator('button:has-text("Bản Đồ Số GIS")');
    if ((await mapToggleBtn.count()) > 0) {
      console.log('-> Chuyển sang Bản Đồ Số GIS...');
      await mapToggleBtn.click();
      await page.waitForTimeout(3000);
    }

    // Chụp toàn cảnh WebGIS với các nút mới
    await page.screenshot({
      path: path.join(ARTIFACT_DIR, 'webgis_full_toolbar.png'),
    });
    console.log('-> Đã chụp: webgis_full_toolbar.png');

    // 3. Kiểm thử Modal Chuyển Đổi Sổ Đỏ VN-2000
    console.log('[3] Mở Modal Chuyển Đổi Sổ Đỏ VN-2000...');
    const vn2000Btn = page.locator('button:has-text("Sổ Đỏ VN-2000")');
    if ((await vn2000Btn.count()) > 0) {
      await vn2000Btn.click();
      await page.waitForTimeout(1000);

      // Điền mẫu Đơn Dương
      const sampleBtn = page.locator('button:has-text("Điền mẫu thử nghiệm")');
      if ((await sampleBtn.count()) > 0) {
        await sampleBtn.click();
        await page.waitForTimeout(800);
      }

      await page.screenshot({
        path: path.join(ARTIFACT_DIR, 'vn2000_converter_modal.png'),
      });
      console.log('-> Đã chụp: vn2000_converter_modal.png');

      // Áp dụng tọa độ vào thửa đất
      const applyBtn = page.locator('button:has-text("Áp Dụng Tọa Độ Vào Thửa Đất")');
      if ((await applyBtn.count()) > 0) {
        // Handle dialog if triggered
        page.once('dialog', async (dialog) => {
          console.log(`Alert: ${dialog.message()}`);
          await dialog.accept();
        });
        await applyBtn.click();
        await page.waitForTimeout(1500);
      }
    }

    // 4. Kiểm thử Modal In / Xuất Hồ Sơ Vùng Trồng Mẫu 01-PUC
    console.log('[4] Mở Modal In / Xuất Hồ Sơ Mẫu 01-PUC...');
    const printPucBtn = page.locator('button:has-text("Xuất Mẫu 01-PUC")');
    if ((await printPucBtn.count()) > 0) {
      await printPucBtn.click();
      await page.waitForTimeout(1500);

      await page.screenshot({
        path: path.join(ARTIFACT_DIR, 'puc_dossier_print_modal.png'),
      });
      console.log('-> Đã chụp: puc_dossier_print_modal.png');

      // Đóng modal in
      const closeBtn = page.locator('button[title="Đóng hộp thoại"]').first();
      if ((await closeBtn.count()) > 0) {
        await closeBtn.click();
        await page.waitForTimeout(1000);
      }
    }

    // 5. Kiểm thử Chế độ Vẽ Ranh Giới (Drawing Mode)
    console.log('[5] Kích hoạt chế độ Vẽ Ranh Giới Thửa Đất...');
    const drawBtn = page.locator('button:has-text("Vẽ Ranh Giới"), button:has-text("Đang Chấm Đỉnh...")');
    if ((await drawBtn.count()) > 0) {
      await drawBtn.first().click();
      await page.waitForTimeout(1000);

      const mapElement = page.locator('.leaflet-container').first();
      const box = await mapElement.boundingBox();
      if (box) {
        const cx = box.x + box.width / 2;
        const cy = box.y + box.height / 2;
        await page.mouse.click(cx - 60, cy - 60);
        await page.waitForTimeout(300);
        await page.mouse.click(cx + 80, cy - 50);
        await page.waitForTimeout(300);
        await page.mouse.click(cx + 60, cy + 60);
        await page.waitForTimeout(300);
        await page.mouse.click(cx - 70, cy + 50);
        await page.waitForTimeout(1000);
      }

      await page.screenshot({
        path: path.join(ARTIFACT_DIR, 'webgis_drawing_mode.png'),
      });
      console.log('-> Đã chụp: webgis_drawing_mode.png');

      // Hủy chế độ vẽ
      const cancelBtn = page.locator('button:has-text("Hủy")').first();
      if ((await cancelBtn.count()) > 0) {
        await cancelBtn.click();
        await page.waitForTimeout(1000);
      }
    }

    // 6. Kiểm thử Bản đồ ngoại tuyến (Offline Caching)
    console.log('[6] Kích hoạt Lưu Đệm Ngoại Tuyến (Offline Caching)...');
    const offlineBtn = page.locator('button:has-text("Lưu Đệm Ngoại Tuyến")');
    if ((await offlineBtn.count()) > 0) {
      await offlineBtn.click();
      await page.waitForTimeout(2500);

      await page.screenshot({
        path: path.join(ARTIFACT_DIR, 'offline_cache_notification.png'),
      });
      console.log('-> Đã chụp: offline_cache_notification.png');
    }

    // 7. Kiểm tra Danh sách Thu Hoạch & Cảnh báo vượt trần sản lượng
    console.log('[7] Truy cập trang Thu Hoạch (/agriculture/harvests)...');
    await page.goto(`${BASE_URL}/agriculture/harvests`, { waitUntil: 'networkidle' });
    await page.waitForTimeout(2000);

    await page.screenshot({
      path: path.join(ARTIFACT_DIR, 'harvests_table_quota_badges.png'),
    });
    console.log('-> Đã chụp: harvests_table_quota_badges.png');

    console.log('=== TẤT CẢ CÁC BƯỚC KIỂM THỬ E2E ĐÃ HOÀN TẤT THÀNH CÔNG ===');
  } catch (error) {
    console.error('Lỗi khi chạy kiểm thử:', error);
    await page.screenshot({ path: path.join(ARTIFACT_DIR, 'error_state.png') });
  } finally {
    await browser.close();
  }
}

verifyWebGisAndQuota();
