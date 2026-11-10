import { chromium } from 'playwright';
import path from 'path';

const ARTIFACT_DIR = 'C:\\Users\\Maxsys\\.gemini\\antigravity\\brain\\b767d259-2ec1-4f08-9a2d-33a518d88c2c';
const BASE_URL = 'http://localhost:3001';

const pagesToCheck = [
  { url: '/dashboard', name: '52_real_data_dashboard.png', label: 'Bàn làm việc tổng quan' },
  { url: '/capital', name: '53_real_data_capital.png', label: 'Sổ vốn điều lệ' },
  { url: '/agriculture/plots', name: '54_real_data_plots.png', label: 'Vùng trồng & Thửa đất' },
  { url: '/inventory', name: '55_real_data_inventory.png', label: 'Kho vật tư & Nông cụ' },
  { url: '/products', name: '56_real_data_products.png', label: 'Sản phẩm OCOP' },
  { url: '/ocop/applications', name: '57_real_data_ocop_applications.png', label: 'Hồ sơ OCOP' },
  { url: '/finance/surplus', name: '58_real_data_surplus.png', label: 'Phân phối thặng dư' },
];

async function checkAllRealData() {
  console.log('--- Checking all pages with Real Data ---');
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  const page = await context.newPage();

  try {
    console.log('[1] Logging in as admin_htx...');
    await page.goto(`${BASE_URL}/auth/login`, { waitUntil: 'networkidle' });
    await page.locator('input').first().fill('admin_htx');
    await page.locator('input[type="password"]').fill('password123');
    await page.click('button:has-text("Đăng nhập ngay")');
    await page.waitForURL('**/dashboard', { timeout: 15000 });
    await page.waitForTimeout(1500);

    for (const item of pagesToCheck) {
      try {
        console.log(`Navigating to ${item.label} (${item.url})...`);
        await page.goto(`${BASE_URL}${item.url}`, { waitUntil: 'networkidle', timeout: 10000 });
        await page.waitForTimeout(1500);
        const shotPath = path.join(ARTIFACT_DIR, item.name);
        await page.screenshot({ path: shotPath, fullPage: true });
        console.log(`Saved screenshot: ${item.name}`);
      } catch (err) {
        console.warn(`Failed on ${item.url}:`, err.message);
      }
    }
  } catch (err) {
    console.error('Fatal error:', err);
  } finally {
    await browser.close();
  }
}

checkAllRealData();
