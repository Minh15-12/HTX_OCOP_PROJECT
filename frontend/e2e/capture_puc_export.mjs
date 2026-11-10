import { chromium } from 'playwright';
import path from 'path';

const ARTIFACT_DIR = 'C:\\Users\\Maxsys\\.gemini\\antigravity\\brain\\71e32054-e3d6-4751-82fd-1c1de7ead122';
const BASE_URL = 'http://localhost:3001';

async function capturePuc() {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  const page = await context.newPage();

  try {
    await page.goto(`${BASE_URL}/auth/login`, { waitUntil: 'networkidle' });
    await page.locator('input').first().fill('admin_htx');
    await page.locator('input[type="password"]').fill('password123');
    await page.click('button:has-text("Đăng nhập ngay")');
    await page.waitForURL('**/dashboard', { timeout: 15000 });

    await page.goto(`${BASE_URL}/agriculture/plots`, { waitUntil: 'networkidle' });
    await page.waitForTimeout(2000);

    // Click "Bản Đồ Số GIS"
    console.log('Clicking "Bản Đồ Số GIS"...');
    await page.click('button:has-text("Bản Đồ Số GIS")');
    await page.waitForTimeout(2000);

    await page.screenshot({ path: path.join(ARTIFACT_DIR, 'gis_map_view_with_puc_button.png') });
    console.log('Saved: gis_map_view_with_puc_button.png');

    // Now look for "Xuất Mẫu 01-PUC" button
    const pucButton = page.locator('button:has-text("Xuất Mẫu 01-PUC")');
    if (await pucButton.isVisible()) {
      console.log('Clicking "Xuất Mẫu 01-PUC"...');
      await pucButton.click();
      await page.waitForTimeout(2000);
      await page.screenshot({ path: path.join(ARTIFACT_DIR, 'puc_modal_opened.png') });
      console.log('Saved: puc_modal_opened.png');
    } else {
      console.log('Button "Xuất Mẫu 01-PUC" still not found.');
    }
  } catch (err) {
    console.error('Error:', err);
  } finally {
    await browser.close();
  }
}

capturePuc();
