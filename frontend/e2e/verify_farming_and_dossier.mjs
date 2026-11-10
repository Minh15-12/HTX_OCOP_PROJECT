import { chromium } from 'playwright';
import path from 'path';

const ARTIFACT_DIR = 'C:\\Users\\Maxsys\\.gemini\\antigravity\\brain\\b767d259-2ec1-4f08-9a2d-33a518d88c2c';
const BASE_URL = 'http://localhost:3001';

async function verifyFarmingAndDossier() {
  console.log('--- Verifying Farming Logs & Dossier Detail ---');
  const browser = await chromium.launch({ headless: true });

  try {
    // 1. Mobile Farming Logs
    console.log('[1] Checking Mobile Farming Logs (viewport 375x812)...');
    const mobileContext = await browser.newContext({ viewport: { width: 375, height: 812 }, isMobile: true });
    const mobilePage = await mobileContext.newPage();
    await mobilePage.goto(`${BASE_URL}/auth/login`, { waitUntil: 'networkidle' });
    await mobilePage.locator('input').first().fill('admin_htx');
    await mobilePage.locator('input[type="password"]').fill('password123');
    await mobilePage.click('button:has-text("Đăng nhập ngay")');
    await mobilePage.waitForURL('**/dashboard', { timeout: 15000 });

    await mobilePage.goto(`${BASE_URL}/agriculture/logs`, { waitUntil: 'networkidle' });
    await mobilePage.waitForTimeout(2000);

    const mobileCards = await mobilePage.locator('.block.md\\:hidden').count();
    console.log('Mobile view block count:', mobileCards);
    const mobileShot = path.join(ARTIFACT_DIR, '64_mobile_farming_logs.png');
    await mobilePage.screenshot({ path: mobileShot, fullPage: true });
    console.log('Saved mobile screenshot:', mobileShot);
    await mobileContext.close();

    // 2. Desktop Farming Logs
    console.log('[2] Checking Desktop Farming Logs (viewport 1440x900)...');
    const desktopContext = await browser.newContext({ viewport: { width: 1440, height: 900 } });
    const desktopPage = await desktopContext.newPage();
    await desktopPage.goto(`${BASE_URL}/auth/login`, { waitUntil: 'networkidle' });
    await desktopPage.locator('input').first().fill('admin_htx');
    await desktopPage.locator('input[type="password"]').fill('password123');
    await desktopPage.click('button:has-text("Đăng nhập ngay")');
    await desktopPage.waitForURL('**/dashboard', { timeout: 15000 });

    await desktopPage.goto(`${BASE_URL}/agriculture/logs`, { waitUntil: 'networkidle' });
    await desktopPage.waitForTimeout(2000);
    const desktopShot = path.join(ARTIFACT_DIR, '65_desktop_farming_logs.png');
    await desktopPage.screenshot({ path: desktopShot, fullPage: true });
    console.log('Saved desktop farming log screenshot:', desktopShot);

    // 3. Dossier Detail Page
    console.log('[3] Checking Dossier Detail Page...');
    await desktopPage.goto(`${BASE_URL}/ocop/dossiers`, { waitUntil: 'networkidle' });
    await desktopPage.waitForTimeout(2000);

    const openWorkspaceBtn = desktopPage.locator('button:has-text("Mở Workspace Chấm điểm OCOP")');
    if (await openWorkspaceBtn.count() > 0) {
      await openWorkspaceBtn.click();
      await desktopPage.waitForTimeout(2500);
      const dossierShot = path.join(ARTIFACT_DIR, '66_dossier_detail_page.png');
      await desktopPage.screenshot({ path: dossierShot, fullPage: true });
      console.log('Saved dossier detail screenshot:', dossierShot);
      
      const pageTitle = await desktopPage.innerText('h1');
      console.log('Dossier detail page title:', pageTitle);
    } else {
      console.log('Open workspace button not found');
    }

    await desktopContext.close();
  } catch (err) {
    console.error('Error during verification:', err);
  } finally {
    await browser.close();
  }
}

verifyFarmingAndDossier();
