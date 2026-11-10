import { chromium } from 'playwright';
import path from 'path';

const ARTIFACT_DIR = 'C:\\Users\\Maxsys\\.gemini\\antigravity\\brain\\f2fc67f9-0c3e-4964-8d23-32bd0217e424';
const BASE_URL = 'http://localhost:3001';

async function verifySatelliteMapZoom() {
  console.log('--- Verifying Zoom Deep on Satellite Map ---');
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  const page = await context.newPage();

  try {
    // 1. Đăng nhập
    console.log('[1] Logging in as admin_htx...');
    await page.goto(`${BASE_URL}/auth/login`, { waitUntil: 'networkidle' });
    await page.locator('input').first().fill('admin_htx');
    await page.locator('input[type="password"]').fill('password123');
    await page.click('button:has-text("Đăng nhập ngay")');
    await page.waitForURL('**/dashboard', { timeout: 15000 });

    // 2. Đi tới trang Quản lý Thửa đất & Vùng trồng
    console.log('[2] Navigating to /agriculture/plots...');
    await page.goto(`${BASE_URL}/agriculture/plots`, { waitUntil: 'networkidle' });
    await page.waitForTimeout(2000);

    // 3. Chuyển sang chế độ Bản Đồ Số GIS
    console.log('[3] Switching to Bản Đồ Số GIS...');
    const mapToggleBtn = page.locator('button:has-text("Bản Đồ Số GIS")');
    if (await mapToggleBtn.count() > 0) {
      await mapToggleBtn.click();
      await page.waitForTimeout(3000);
    }

    // 4. Test zoom sâu trên Google Satellite HD
    console.log('[4] Zooming in deeply on Google Satellite...');
    const zoomInBtn = page.locator('button[title="Phóng to bản đồ"]');
    for (let i = 0; i < 3; i++) {
      await zoomInBtn.click();
      await page.waitForTimeout(800);
    }
    await page.waitForTimeout(3000);

    const zoomDeepGoogleShot = path.join(ARTIFACT_DIR, 'satellite_zoom_deep_google.png');
    await page.screenshot({ path: zoomDeepGoogleShot, fullPage: true });
    console.log('Saved Zoom Deep Google Screenshot to:', zoomDeepGoogleShot);

    // 5. Chuyển sang Esri True-Color và zoom sâu để kiểm tra tính năng overscaling
    console.log('[5] Switching to Esri True-Color at deep zoom...');
    const esriBtn = page.locator('button:has-text("Esri True-Color")');
    if (await esriBtn.count() > 0) {
      await esriBtn.click();
      await page.waitForTimeout(3000);
      const zoomDeepEsriShot = path.join(ARTIFACT_DIR, 'satellite_zoom_deep_esri.png');
      await page.screenshot({ path: zoomDeepEsriShot, fullPage: true });
      console.log('Saved Zoom Deep Esri Screenshot to:', zoomDeepEsriShot);
    }

    console.log('--- Verification Completed Successfully! ---');
  } catch (err) {
    console.error('Error during verification:', err);
  } finally {
    await browser.close();
  }
}

verifySatelliteMapZoom();
