import { chromium } from 'playwright';

async function run() {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  const page = await context.newPage();

  console.log('1. Logging in as admin_htx...');
  await page.goto('http://localhost:3000/auth/login');
  await page.waitForTimeout(1500);

  const inputs = page.locator('input');
  if ((await inputs.count()) >= 2) {
    await inputs.nth(0).fill('admin_htx');
    await inputs.nth(1).fill('password123');
    await page.click('button[type="submit"]');
    await page.waitForTimeout(2500);
  }

  // 2. Test Evidences Page
  console.log('2. Navigating to /ocop/evidences...');
  await page.goto('http://localhost:3000/ocop/evidences');
  await page.waitForTimeout(3000);

  // Click on QUATEST 3 or VietGAP row to show preview
  const firstRow = page.locator('table tbody tr').first();
  if (await firstRow.isVisible()) {
    console.log('Selecting first evidence row to inspect preview pane...');
    await firstRow.click();
    await page.waitForTimeout(1000);
  }

  const screenshotPath1 = 'C:/Users/Maxsys/.gemini/antigravity/brain/b767d259-2ec1-4f08-9a2d-33a518d88c2c/24_ocop_evidences_verified.png';
  await page.screenshot({ path: screenshotPath1, fullPage: true });
  console.log(`Saved screenshot 1 to: ${screenshotPath1}`);

  // 3. Test Profit Distribution Page
  console.log('3. Navigating to /profit-distribution...');
  await page.goto('http://localhost:3000/profit-distribution');
  await page.waitForTimeout(3000);

  const screenshotPath2 = 'C:/Users/Maxsys/.gemini/antigravity/brain/b767d259-2ec1-4f08-9a2d-33a518d88c2c/25_surplus_distribution_page.png';
  await page.screenshot({ path: screenshotPath2, fullPage: true });
  console.log(`Saved screenshot 2 to: ${screenshotPath2}`);

  // 4. Test Evaluations Page
  console.log('4. Navigating to /ocop/evaluation...');
  await page.goto('http://localhost:3000/ocop/evaluation');
  await page.waitForTimeout(3000);

  const screenshotPath3 = 'C:/Users/Maxsys/.gemini/antigravity/brain/b767d259-2ec1-4f08-9a2d-33a518d88c2c/26_ocop_evaluation_page.png';
  await page.screenshot({ path: screenshotPath3, fullPage: true });
  console.log(`Saved screenshot 3 to: ${screenshotPath3}`);

  // 5. Test Decisions Page
  console.log('5. Navigating to /ocop/decisions...');
  await page.goto('http://localhost:3000/ocop/decisions');
  await page.waitForTimeout(3000);

  const screenshotPath4 = 'C:/Users/Maxsys/.gemini/antigravity/brain/b767d259-2ec1-4f08-9a2d-33a518d88c2c/27_ocop_decisions_page.png';
  await page.screenshot({ path: screenshotPath4, fullPage: true });
  console.log(`Saved screenshot 4 to: ${screenshotPath4}`);

  await browser.close();
  console.log('All screenshots captured successfully!');
}

run().catch((err) => {
  console.error('Error during test:', err);
  process.exit(1);
});
