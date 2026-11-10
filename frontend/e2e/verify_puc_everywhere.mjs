import { chromium } from 'playwright';
import path from 'path';

const ARTIFACT_DIR = 'C:\\Users\\Maxsys\\.gemini\\antigravity\\brain\\71e32054-e3d6-4751-82fd-1c1de7ead122';
const BASE_URL = 'http://localhost:3001';

async function verifyPucEverywhere() {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  const page = await context.newPage();

  try {
    await page.goto(`${BASE_URL}/auth/login`, { waitUntil: 'networkidle' });
    await page.locator('input').first().fill('admin_htx');
    await page.locator('input[type="password"]').fill('password123');
    await page.click('button:has-text("Đăng nhập ngay")');
    await page.waitForURL('**/dashboard', { timeout: 15000 });

    // 1. Check Plots page header button
    await page.goto(`${BASE_URL}/agriculture/plots`, { waitUntil: 'networkidle' });
    await page.waitForTimeout(2000);
    await page.screenshot({ path: path.join(ARTIFACT_DIR, 'plots_tab1_with_puc_header_btn.png') });
    console.log('Saved: plots_tab1_with_puc_header_btn.png');

    // Click "Trích lục Mẫu 01-PUC" directly from Tab 1
    const btn = page.locator('button:has-text("Trích lục Mẫu 01-PUC")');
    if (await btn.isVisible()) {
      await btn.click();
      await page.waitForTimeout(1500);
      await page.screenshot({ path: path.join(ARTIFACT_DIR, 'puc_modal_opened_from_tab1.png') });
      console.log('Saved: puc_modal_opened_from_tab1.png');
      await page.keyboard.press('Escape');
    }

    // 2. Check OCOP Evidences Page Add Modal
    await page.goto(`${BASE_URL}/ocop/evidences`, { waitUntil: 'networkidle' });
    await page.waitForTimeout(2000);
    const addBtn = page.locator('button:has-text("Thêm minh chứng")');
    if (await addBtn.isVisible()) {
      await addBtn.click();
      await page.waitForTimeout(1000);
      // Click "Trích xuất từ dữ liệu HTX" tab
      await page.click('button:has-text("Trích xuất từ HTX")');
      await page.waitForTimeout(1000);
      await page.screenshot({ path: path.join(ARTIFACT_DIR, 'ocop_auto_extract_with_farm_plot.png') });
      console.log('Saved: ocop_auto_extract_with_farm_plot.png');
    }

  } catch (err) {
    console.error('Error:', err);
  } finally {
    await browser.close();
  }
}

verifyPucEverywhere();
