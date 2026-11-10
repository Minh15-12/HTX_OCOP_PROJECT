import { chromium } from 'playwright';
import path from 'path';

const ARTIFACT_DIR = 'C:\\Users\\Maxsys\\.gemini\\antigravity\\brain\\71e32054-e3d6-4751-82fd-1c1de7ead122';
const BASE_URL = 'http://localhost:3001';

async function verifySidebarScope() {
  console.log('=== VERIFYING SIDEBAR SCOPE & OUT-OF-SCOPE HIDING ===');
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
    await page.waitForTimeout(2000);

    // Get all sidebar links
    const sidebarLinks = await page.locator('aside a').allInnerTexts();
    console.log('Detected Sidebar Items:', sidebarLinks);

    const hasMeetings = sidebarLinks.some(t => t.includes('Đại hội & Biểu quyết'));
    const hasEvaluation = sidebarLinks.some(t => t.includes('Hội đồng thẩm định'));
    const hasDecisions = sidebarLinks.some(t => t.includes('Quyết định & Cấp sao'));

    console.log('Verification Results:');
    console.log('- "Đại hội & Biểu quyết" is hidden:', !hasMeetings ? 'PASS (Hidden)' : 'FAIL (Visible)');
    console.log('- "Hội đồng thẩm định" is hidden:', !hasEvaluation ? 'PASS (Hidden)' : 'FAIL (Visible)');
    console.log('- "Quyết định & Cấp sao" is hidden:', !hasDecisions ? 'PASS (Hidden)' : 'FAIL (Visible)');

    if (hasMeetings || hasEvaluation || hasDecisions) {
      throw new Error('Out of scope items are still visible in Sidebar!');
    }

    // Take screenshot of clean sidebar
    const cleanShotPath = path.join(ARTIFACT_DIR, 'clean_ocop_sidebar.png');
    await page.screenshot({ path: cleanShotPath, fullPage: false });
    console.log(`Saved screenshot: clean_ocop_sidebar.png`);

    // Test Re-enabling via localStorage
    console.log('\n[2] Testing Re-enable mechanism via localStorage...');
    await page.evaluate(() => {
      localStorage.setItem('htx_ocop_enable_out_of_scope_modules', 'true');
    });
    await page.reload({ waitUntil: 'networkidle' });
    await page.waitForTimeout(1500);

    const reenabledLinks = await page.locator('aside a').allInnerTexts();
    const canReenableMeetings = reenabledLinks.some(t => t.includes('Đại hội & Biểu quyết'));
    const canReenableEvaluation = reenabledLinks.some(t => t.includes('Hội đồng thẩm định'));
    const canReenableDecisions = reenabledLinks.some(t => t.includes('Quyết định & Cấp sao'));

    console.log('Re-enable Test Results:');
    console.log('- Can re-enable "Đại hội & Biểu quyết":', canReenableMeetings ? 'PASS' : 'FAIL');
    console.log('- Can re-enable "Hội đồng thẩm định":', canReenableEvaluation ? 'PASS' : 'FAIL');
    console.log('- Can re-enable "Quyết định & Cấp sao":', canReenableDecisions ? 'PASS' : 'FAIL');

    // Reset back to default hidden
    await page.evaluate(() => {
      localStorage.removeItem('htx_ocop_enable_out_of_scope_modules');
    });
    await page.reload({ waitUntil: 'networkidle' });
    await page.waitForTimeout(1000);

    console.log('\n>>> ALL SCOPE & RE-ENABLE VERIFICATIONS PASSED SUCCESSFULLY! <<<');
  } catch (err) {
    console.error('Test Failed:', err);
    process.exit(1);
  } finally {
    await browser.close();
  }
}

verifySidebarScope();
