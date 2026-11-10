import { chromium } from 'playwright';

async function capture() {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  const page = await context.newPage();

  // Log in via API first to get real token
  const res = await fetch('http://localhost:8000/api/v1/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username: 'admin', password: 'password123' })
  });
  const data = await res.json();
  const { token, user } = data.data;

  // Navigate to app and set localStorage
  await page.goto('http://localhost:3001');
  await page.evaluate(({ token, user }) => {
    localStorage.setItem('htx_ocop_token', token);
    localStorage.setItem('htx_ocop_user', JSON.stringify(user));
    localStorage.setItem('htx_ocop_cooperative', JSON.stringify({
      id: user.cooperative_id,
      cooperative_code: 'HTX-TANTIEN-01',
      legal_name: user.cooperative_name || 'Hợp tác xã Nông nghiệp Tân Tiến',
      status: 'ACTIVE'
    }));
  }, { token, user });

  await page.goto('http://localhost:3001/members');
  await page.waitForLoadState('networkidle');
  await page.waitForTimeout(1500);

  // Click on the first row to open member drawer
  const firstRow = page.locator('table tbody tr').first();
  await firstRow.waitFor({ state: 'visible', timeout: 5000 });
  await firstRow.click();
  await page.waitForTimeout(1500);

  // Scroll down to 750px to view Cards 4, 5, 6
  const drawerBody = page.locator('#member-detail-sheet .overflow-y-auto');
  await drawerBody.evaluate((el) => {
    el.scrollTop = 750;
  });
  await page.waitForTimeout(800);

  const screenshotPath = 'C:/Users/Maxsys/.gemini/antigravity/brain/cdbba2a6-bc97-4f29-9027-702504134066/drawer_tab1_cards4_5.png';
  await page.screenshot({ path: screenshotPath, fullPage: false });
  console.log(`Saved screenshot to ${screenshotPath}`);

  await browser.close();
}

capture().catch(err => {
  console.error('Error during capture:', err);
  process.exit(1);
});
