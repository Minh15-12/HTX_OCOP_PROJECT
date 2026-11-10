const { chromium } = require('playwright');
const path = require('path');
const fs = require('fs');

const ARTIFACT_DIR = 'C:/Users/Maxsys/.gemini/antigravity/brain/f2fc67f9-0c3e-4964-8d23-32bd0217e424';

async function run() {
  console.log('--- STARTING PLAYWRIGHT FIELD ENTRY ROLE & AREA TEST ---');
  const browser = await chromium.launch({ headless: true });

  // -------------------------------------------------------------
  // TEST 1: ADMIN_HTX (Chủ tịch HTX / Quản lý)
  // -------------------------------------------------------------
  console.log('\n[1] Testing ADMIN_HTX (Chủ tịch HTX)...');
  const adminContext = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  const adminPage = await adminContext.newPage();

  await adminPage.goto('http://127.0.0.1:3000/auth/login');
  await adminPage.waitForSelector('input');

  const usernameInput = adminPage.locator('input').first();
  const passwordInput = adminPage.locator('input[type="password"]');

  await usernameInput.fill('admin_htx');
  await passwordInput.fill('password123');
  await adminPage.locator('button[type="submit"]').click();

  await adminPage.waitForURL((url) => !url.pathname.includes('/auth/login'), { timeout: 10000 });
  console.log('Admin login successful, current URL:', adminPage.url());

  await adminPage.goto('http://127.0.0.1:3000/agriculture/field-entry');
  await adminPage.waitForSelector('text=Nhật Ký Canh Tác Ngoài Đồng', { timeout: 10000 });
  await adminPage.waitForTimeout(2000); // Wait for plots and seasons query

  // Check header user name & role
  const adminHeaderName = await adminPage.locator('header').innerText();
  console.log('Admin Header Text contains:', adminHeaderName.replace(/\n+/g, ' | '));

  // Check member filter dropdown
  const filterDropdown = adminPage.locator('select');
  const filterCount = await filterDropdown.count();
  console.log('Manager member filter dropdown count:', filterCount);
  if (filterCount > 0) {
    const filterOptions = await filterDropdown.first().innerText();
    console.log('Filter options preview:', filterOptions.split('\n').slice(0, 5).join('; '));
  }

  // Check plots count
  const plotCards = adminPage.locator('button:has-text("PLOT-TT-")');
  const plotCount = await plotCards.count();
  console.log('Admin visible plots count:', plotCount);

  // Check plot area formatting on first plot card
  const firstPlotText = await plotCards.first().innerText();
  console.log('First plot card text preview:', firstPlotText.replace(/\n+/g, ' '));

  // Verify ha formatting error is gone
  const hasErroneousHa = firstPlotText.includes('3204.44 ha') || firstPlotText.includes('4000 ha');
  console.log('Is 3204.44 ha erroneously present?', hasErroneousHa);

  // Check "Sang Bàn Hậu Kiểm HTX" button
  const auditBtn = adminPage.locator('button:has-text("Sang Bàn Hậu Kiểm HTX")');
  const auditBtnVisible = await auditBtn.isVisible();
  console.log('Admin "Sang Bàn Hậu Kiểm HTX" button visible:', auditBtnVisible);

  // Take screenshot
  const adminShotPath = path.join(ARTIFACT_DIR, 'verified_field_entry_admin.png');
  await adminPage.screenshot({ path: adminShotPath, fullPage: true });
  console.log('Saved admin screenshot to:', adminShotPath);

  // -------------------------------------------------------------
  // TEST 2: XAVIEN01 (Nông dân / Xã viên TV001)
  // -------------------------------------------------------------
  console.log('\n[2] Testing XAVIEN01 (Xã viên / Nông dân TV001)...');
  const farmerContext = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  const farmerPage = await farmerContext.newPage();

  await farmerPage.goto('http://127.0.0.1:3000/auth/login');
  await farmerPage.waitForSelector('input');

  const farmerUserInput = farmerPage.locator('input').first();
  const farmerPassInput = farmerPage.locator('input[type="password"]');

  await farmerUserInput.fill('xavien01');
  await farmerPassInput.fill('password123');
  await farmerPage.locator('button[type="submit"]').click();

  await farmerPage.waitForURL((url) => !url.pathname.includes('/auth/login'), { timeout: 10000 });
  console.log('Farmer login successful, current URL:', farmerPage.url());

  await farmerPage.goto('http://127.0.0.1:3000/agriculture/field-entry');
  await farmerPage.waitForSelector('text=Nhật Ký Canh Tác Ngoài Đồng', { timeout: 10000 });
  await farmerPage.waitForTimeout(2000); // Wait for plots query

  // Check header user name & role
  const farmerHeaderName = await farmerPage.locator('header').innerText();
  console.log('Farmer Header Text contains:', farmerHeaderName.replace(/\n+/g, ' | '));

  // Check member filter dropdown (should NOT be visible for farmer)
  const farmerFilterDropdown = farmerPage.locator('select');
  const farmerFilterCount = await farmerFilterDropdown.count();
  console.log('Farmer member filter dropdown count (should be 0):', farmerFilterCount);

  // Check farmer plots count (should be EXACTLY 2 assigned plots: PLOT-TT-XV001-01 and PLOT-TT-XV001-02)
  const farmerPlotCards = farmerPage.locator('button:has-text("PLOT-TT-")');
  const farmerPlotCount = await farmerPlotCards.count();
  console.log('Farmer visible plots count (expected 2):', farmerPlotCount);

  for (let i = 0; i < farmerPlotCount; i++) {
    const cardText = await farmerPlotCards.nth(i).innerText();
    console.log(`Plot ${i + 1}:`, cardText.replace(/\n+/g, ' '));
  }

  // Check "Sang Bàn Hậu Kiểm HTX" button (should NOT be visible for farmer)
  const farmerAuditBtn = farmerPage.locator('button:has-text("Sang Bàn Hậu Kiểm HTX")');
  const farmerAuditBtnVisible = await farmerAuditBtn.isVisible();
  console.log('Farmer "Sang Bàn Hậu Kiểm HTX" button visible (expected false):', farmerAuditBtnVisible);

  // Take screenshot
  const farmerShotPath = path.join(ARTIFACT_DIR, 'verified_field_entry_farmer.png');
  await farmerPage.screenshot({ path: farmerShotPath, fullPage: true });
  console.log('Saved farmer screenshot to:', farmerShotPath);

  await browser.close();
  console.log('\n--- VERIFICATION COMPLETED SUCCESSFULLY ---');
}

run().catch((err) => {
  console.error('Test execution failed:', err);
  process.exit(1);
});
