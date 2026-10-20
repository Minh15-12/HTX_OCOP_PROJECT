import { chromium } from 'playwright';
import path from 'path';

const ARTIFACT_DIR = 'C:\\Users\\Maxsys\\.gemini\\antigravity\\brain\\b767d259-2ec1-4f08-9a2d-33a518d88c2c';
const BASE_URL = 'http://localhost:3000';

async function checkMembersCount() {
  console.log('--- Verifying Members Count on Frontend ---');
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  const page = await context.newPage();

  page.on('console', msg => {
    if (msg.type() === 'error' || msg.text().includes('API') || msg.text().includes('Member')) {
      console.log('BROWSER LOG:', msg.text());
    }
  });

  try {
    console.log('[1] Logging in as admin_htx...');
    await page.goto(`${BASE_URL}/auth/login`, { waitUntil: 'networkidle' });
    await page.locator('input').first().fill('admin_htx');
    await page.locator('input[type="password"]').fill('password123');
    await page.click('button:has-text("Đăng nhập ngay")');
    await page.waitForURL('**/dashboard', { timeout: 15000 });

    console.log('[2] Navigating to /members...');
    await page.goto(`${BASE_URL}/members`, { waitUntil: 'networkidle' });
    await page.waitForTimeout(2000);

    // Check member rows
    const rows = await page.locator('tbody tr').count();
    console.log(`Visible member rows in table: ${rows}`);

    // Check total count text in UI
    const bodyText = await page.textContent('body');
    const match = bodyText.match(/(\d+)\s*xã viên/i) || bodyText.match(/Tổng số:\s*(\d+)/i) || bodyText.match(/tổng số\s*(\d+)/i);
    console.log('Matched count regex:', match ? match[0] : 'None');

    // Screenshot
    const shotPath = path.join(ARTIFACT_DIR, '51_members_verification_real_data.png');
    await page.screenshot({ path: shotPath, fullPage: true });
    console.log(`Saved screenshot to ${shotPath}`);

  } catch (err) {
    console.error('Error during test:', err);
  } finally {
    await browser.close();
  }
}

checkMembersCount();
