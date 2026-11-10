import { chromium } from 'playwright';
import path from 'path';

const ARTIFACT_DIR = 'C:\\Users\\Maxsys\\.gemini\\antigravity\\brain\\b767d259-2ec1-4f08-9a2d-33a518d88c2c';
const BASE_URL = 'http://localhost:3000';

const routes = [
  { url: '/inventory/products', file: '59_real_data_products.png', label: 'Sản phẩm OCOP' },
  { url: '/inventory/materials', file: '60_real_data_materials.png', label: 'Vật tư & Nông cụ' },
  { url: '/ocop/dossiers', file: '61_real_data_dossiers.png', label: 'Hồ sơ OCOP' },
  { url: '/ocop/evidences', file: '62_real_data_evidences.png', label: 'Kho Minh chứng số' },
  { url: '/profit-distribution', file: '63_real_data_profit.png', label: 'Phân phối thặng dư' },
];

async function capture() {
  console.log('--- Capturing Real Data Modules ---');
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  const page = await context.newPage();

  await page.goto(`${BASE_URL}/auth/login`, { waitUntil: 'networkidle' });
  await page.locator('input').first().fill('admin_htx');
  await page.locator('input[type="password"]').fill('password123');
  await page.click('button:has-text("Đăng nhập ngay")');
  await page.waitForURL('**/dashboard', { timeout: 15000 });
  await page.waitForTimeout(1000);

  for (const r of routes) {
    console.log(`Loading ${r.label} (${r.url})...`);
    await page.goto(`${BASE_URL}${r.url}`, { waitUntil: 'networkidle' });
    await page.waitForTimeout(1500);
    const dest = path.join(ARTIFACT_DIR, r.file);
    await page.screenshot({ path: dest, fullPage: true });
    console.log(`Saved: ${r.file}`);
  }

  await browser.close();
}

capture();
