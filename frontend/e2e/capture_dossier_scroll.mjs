import { chromium } from 'playwright';
import path from 'path';

const ARTIFACT_DIR = 'C:\\Users\\Maxsys\\.gemini\\antigravity\\brain\\f2fc67f9-0c3e-4964-8d23-32bd0217e424';

async function run() {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({ viewport: { width: 1440, height: 960 } });
  const page = await context.newPage();
  
  await page.goto('http://localhost:3000/auth/login');
  await page.locator('input').first().fill('admin_htx');
  await page.locator('input[type="password"]').fill('password123');
  await page.click('button:has-text("Đăng nhập ngay")');
  await page.waitForURL('**/dashboard');
  
  await page.goto('http://localhost:3000/agriculture/logs');
  await page.waitForTimeout(2000);
  
  await page.click('button:has-text("Hồ Sơ VietGAP A4")');
  await page.waitForTimeout(2000);
  
  const container = page.locator('div.overflow-y-auto').first();
  await container.evaluate((el) => { el.scrollTop = 2200; });
  await page.waitForTimeout(1000);
  
  const shot8 = path.join(ARTIFACT_DIR, 'field_log_8_vietgap_dossier_fertigation_and_bvtv.png');
  await page.screenshot({ path: shot8 });
  console.log('✓ Captured Mục III & IV to', shot8);
  
  await browser.close();
}

run();
