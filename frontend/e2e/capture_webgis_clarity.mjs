import { chromium } from 'playwright';
import path from 'path';

const ARTIFACT_DIR = 'C:\\Users\\Maxsys\\.gemini\\antigravity\\brain\\f2fc67f9-0c3e-4964-8d23-32bd0217e424';
const BASE_URL = 'http://localhost:3001';

async function captureWebGisClarity() {
  console.log('--- Chụp kiểm chứng độ rõ nét của Vùng Trồng & Thửa Đất WebGIS ---');
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  const page = await context.newPage();

  try {
    // 1. Đăng nhập
    await page.goto(`${BASE_URL}/auth/login`, { waitUntil: 'networkidle' });
    await page.locator('input').first().fill('admin_htx');
    await page.locator('input[type="password"]').fill('password123');
    await page.click('button:has-text("Đăng nhập ngay")');
    await page.waitForURL('**/dashboard', { timeout: 15000 });

    // 2. Vào trang Vùng Trồng
    await page.goto(`${BASE_URL}/agriculture/plots`, { waitUntil: 'networkidle' });
    await page.waitForTimeout(2000);

    // Chuyển sang Bản Đồ Số GIS
    const mapToggleBtn = page.locator('button:has-text("Bản Đồ Số GIS")');
    if ((await mapToggleBtn.count()) > 0) {
      await mapToggleBtn.click();
      await page.waitForTimeout(3000);
    }

    // Chụp toàn cảnh toàn bộ 15 thửa đất và ranh giới PUC rõ nét
    await page.screenshot({
      path: path.join(ARTIFACT_DIR, 'webgis_dalat_cluster_overview.png'),
    });
    console.log('-> Đã chụp: webgis_dalat_cluster_overview.png');

    // 3. Click vào thửa #3 XV002-01 để zoom cận cảnh zoom level 18
    console.log('-> Click chọn thửa #3 XV002-01 để flyTo zoom 18...');
    const plot3Btn = page.locator('button:has-text("#3 XV002-01")');
    if ((await plot3Btn.count()) > 0) {
      await plot3Btn.click();
      await page.waitForTimeout(2500); // chờ flyTo hoàn thành
    }

    // Chụp ảnh cận cảnh thửa đất
    await page.screenshot({
      path: path.join(ARTIFACT_DIR, 'webgis_plot_closeup_zoom18.png'),
    });
    console.log('-> Đã chụp: webgis_plot_closeup_zoom18.png');

    console.log('=== HOÀN TẤT CHỤP KIỂM CHỨNG WEBGIS CLARITY ===');
  } catch (err) {
    console.error('Lỗi khi chụp:', err);
  } finally {
    await browser.close();
  }
}

captureWebGisClarity();
