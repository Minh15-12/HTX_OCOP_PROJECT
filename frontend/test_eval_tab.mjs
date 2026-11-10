import { chromium } from 'playwright';

async function run() {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  const page = await context.newPage();

  console.log('Logging in as admin_htx...');
  await page.goto('http://localhost:3000/auth/login');
  await page.waitForTimeout(1500);

  const inputs = page.locator('input');
  if ((await inputs.count()) >= 2) {
    await inputs.nth(0).fill('admin_htx');
    await inputs.nth(1).fill('password123');
    await page.click('button[type="submit"]');
    await page.waitForTimeout(2500);
  }

  console.log('Navigating to /ocop/evaluation...');
  await page.goto('http://localhost:3000/ocop/evaluation');
  await page.waitForTimeout(3000);

  const screenshotPath3 = 'C:/Users/Maxsys/.gemini/antigravity/brain/b767d259-2ec1-4f08-9a2d-33a518d88c2c/26_ocop_evaluation_page.png';
  await page.screenshot({ path: screenshotPath3, fullPage: true });
  console.log(`Saved screenshot 3 to: ${screenshotPath3}`);

  // Click tab Tổng Hợp & Hạ Sao
  const tabConsolidation = page.locator('button:has-text("Tổng Hợp"), button:has-text("Hạ Sao")').first();
  if (await tabConsolidation.isVisible()) {
    console.log('Clicking tab Tong Hop & Ha Sao...');
    await tabConsolidation.click();
    await page.waitForTimeout(2000);

    const screenshotPath3b = 'C:/Users/Maxsys/.gemini/antigravity/brain/b767d259-2ec1-4f08-9a2d-33a518d88c2c/26b_ocop_consolidation_tab.png';
    await page.screenshot({ path: screenshotPath3b, fullPage: true });
    console.log(`Saved screenshot 3b to: ${screenshotPath3b}`);
  }

  await browser.close();
}

run().catch((err) => {
  console.error('Error during test:', err);
  process.exit(1);
});
