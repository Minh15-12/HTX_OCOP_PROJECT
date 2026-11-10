import { chromium } from 'playwright';
import path from 'path';

const ARTIFACT_DIR = 'C:\\Users\\Maxsys\\.gemini\\antigravity\\brain\\71e32054-e3d6-4751-82fd-1c1de7ead122';
const BASE_URL = 'http://localhost:3001';

async function run() {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  const page = await context.newPage();

  try {
    await page.goto(`${BASE_URL}/auth/login`, { waitUntil: 'networkidle' });
    await page.locator('input').first().fill('admin_htx');
    await page.locator('input[type="password"]').fill('password123');
    await page.click('button:has-text("Đăng nhập ngay")');
    await page.waitForURL('**/dashboard', { timeout: 15000 });

    await page.goto(`${BASE_URL}/ocop/evidences`, { waitUntil: 'networkidle' });
    await page.waitForTimeout(2000);

    const btn = page.locator('button').filter({ hasText: 'Tải lên tài liệu' });
    await btn.click();
    await page.waitForTimeout(1000);

    const autoTab = page.locator('button').filter({ hasText: 'Trích xuất từ HTX' });
    await autoTab.click();
    await page.waitForTimeout(1000);
    await page.screenshot({ path: path.join(ARTIFACT_DIR, 'ocop_auto_extract_farm_plot_success.png') });
    console.log('Saved: ocop_auto_extract_farm_plot_success.png');
  } catch (err) {
    console.error('Error:', err);
  } finally {
    await browser.close();
  }
}

run();
