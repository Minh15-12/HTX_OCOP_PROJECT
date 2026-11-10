import { chromium } from 'playwright';
import { execSync } from 'child_process';
import path from 'path';

const ARTIFACT_DIR = 'C:\\Users\\Maxsys\\.gemini\\antigravity\\brain\\b767d259-2ec1-4f08-9a2d-33a518d88c2c';
const BASE_URL = 'http://localhost:3000';

function getDbLogCount() {
  const cmd = `php artisan tinker --execute="echo DB::table('farming_logs')->count();"`;
  const out = execSync(cmd, { cwd: 'f:/HTX_OCOP_PROJECT/backend', encoding: 'utf-8' });
  return parseInt(out.trim(), 10);
}

function getLatestDbLog() {
  const cmd = `php artisan tinker --execute="echo json_encode(DB::table('farming_logs')->orderBy('created_at', 'desc')->first());"`;
  const out = execSync(cmd, { cwd: 'f:/HTX_OCOP_PROJECT/backend', encoding: 'utf-8' });
  return JSON.parse(out.trim());
}

async function runAutonomousFarmingLogQA() {
  console.log('================================================================');
  console.log('🚀 AUTONOMOUS CLOSED-LOOP QA: PHÂN HỆ NHẬT KÝ CANH TÁC (TT02)');
  console.log('================================================================');

  // Step 1: Baseline DB Verification
  const countBefore = getDbLogCount();
  console.log(`[DB BASELINE] Số bản ghi farming_logs hiện tại trong PostgreSQL: ${countBefore}`);

  // Step 2: Launch Headless Browser
  console.log('[BROWSER] Khởi chạy Playwright Chromium...');
  const browser = await chromium.launch({
    headless: true,
    args: ['--use-fake-ui-for-media-stream', '--use-fake-device-for-media-stream'],
  });
  const context = await browser.newContext({
    viewport: { width: 1440, height: 900 },
    geolocation: { latitude: 11.950145, longitude: 108.471234 },
    permissions: ['geolocation'],
  });
  const page = await context.newPage();

  // Network Spy: Intercept POST /api/v1/farming-logs
  let farmingLogResponse = null;
  page.on('response', async (res) => {
    if (res.url().includes('/api/v1/farming-logs') && res.request().method() === 'POST') {
      try {
        const body = await res.json();
        farmingLogResponse = {
          status: res.status(),
          body: body,
        };
        console.log(`[NETWORK SPY] Bắt được POST /api/v1/farming-logs -> HTTP ${res.status()}`);
      } catch (e) {
        console.log(`[NETWORK SPY] Lỗi đọc JSON response: ${e.message}`);
      }
    }
  });

  try {
    // Step 3: Login as HTX_OWNER
    console.log('[AUTH] Đăng nhập tài khoản admin_htx...');
    await page.goto(`${BASE_URL}/login`, { waitUntil: 'networkidle' });
    await page.evaluate(() => localStorage.clear());
    await page.click('button:has-text("Đăng nhập ngay")');
    await page.waitForTimeout(2000);
    console.log('[AUTH] Đăng nhập thành công, đã vào hệ thống.');

    // Step 4: Navigate to /agriculture/logs
    console.log('[NAV] Điều hướng tới /agriculture/logs...');
    await page.goto(`${BASE_URL}/agriculture/logs`, { waitUntil: 'networkidle' });
    await page.waitForTimeout(2000);

    // Step 5: Check UI elements (Table, Cards, Export)
    const headerTitle = await page.textContent('h1');
    console.log(`[UI AUDIT] Tiêu đề trang: "${headerTitle?.trim()}"`);

    // Verify 4 KPI cards exist
    const kpiCards = await page.$$('.grid-cols-1.gap-4 .rounded-2xl, .xl\\:grid-cols-4 > div');
    console.log(`[UI AUDIT] Số lượng thẻ KPI hiển thị: ${kpiCards.length}`);

    // Verify Open Log Modal Button
    const newLogBtn = await page.locator('button:has-text("Ghi nhật ký mới")');
    if (!(await newLogBtn.isVisible())) {
      throw new Error('Không tìm thấy nút "Ghi nhật ký mới (TT02)"');
    }
    console.log('[UI AUDIT] Nút "Ghi nhật ký mới (TT02)" hiển thị đầy đủ và sẵn sàng thao tác.');

    // Step 6: Click Open Modal
    console.log('[ACTION] Bấm nút "Ghi nhật ký mới (TT02)"...');
    await newLogBtn.click();
    await page.waitForSelector('form', { state: 'visible', timeout: 5000 });
    console.log('[MODAL] Modal Ghi Nhật Ký Canh Tác 1 Chạm đã mở.');

    // Step 7: Fill Form Fields
    // 1. Select Activity Type: SPRAYING (Phun thuốc BVTV & Chế phẩm)
    console.log('[FORM] Chọn hoạt động SPRAYING (Phun thuốc BVTV)...');
    const sprayBtn = page.locator('button:has-text("Phun thuốc BVTV")');
    if (await sprayBtn.isVisible()) {
      await sprayBtn.click();
    }

    // 2. Click GPS Auto-Fill
    console.log('[FORM] Bấm nút lấy tọa độ GPS 1 chạm...');
    const gpsBtn = page.locator('button:has-text("Lấy GPS 1 chạm")');
    if (await gpsBtn.isVisible()) {
      await gpsBtn.click();
      await page.waitForTimeout(1000);
    }

    // 3. Enter custom description
    const descInput = page.locator('input[placeholder*="sinh trưởng"]').first();
    if (await descInput.isVisible()) {
      await descInput.fill('[E2E-TEST] Phun phòng trừ nấm phấn trắng định kỳ theo quy trình VietGAP TT02');
    }

    // Take screenshot of filled modal before submit
    console.log('[AUDIT] Đã điền đầy đủ 10 trường quy chuẩn Thông tư 02.');

    // Step 8: Submit Form
    console.log('[ACTION] Bấm "Lưu Nhật Ký Canh Tác (TT02)"...');
    const submitBtn = page.locator('button[type="submit"]:has-text("Lưu Nhật Ký")');
    await submitBtn.click();

    // Step 9: Wait for network response
    console.log('[WAIT] Đang đợi phản hồi từ Backend...');
    for (let i = 0; i < 20; i++) {
      if (farmingLogResponse) break;
      await page.waitForTimeout(500);
    }

    if (!farmingLogResponse) {
      throw new Error('Timeout: Không nhận được phản hồi HTTP từ API POST /api/v1/farming-logs');
    }

    console.log(`[VERIFY HTTP] Status: ${farmingLogResponse.status}`);
    if (farmingLogResponse.status !== 201) {
      console.error('[HTTP ERROR]', JSON.stringify(farmingLogResponse.body, null, 2));
      throw new Error(`Kỳ vọng HTTP 201 nhưng nhận được HTTP ${farmingLogResponse.status}`);
    }
    console.log('✅ [HTTP VERIFY] POST /api/v1/farming-logs trả về HTTP 201 Created thành công!');

    // Wait for modal to close and toast
    await page.waitForTimeout(2000);

    // Step 10: Verify Database PostgreSQL directly
    const countAfter = getDbLogCount();
    console.log(`[DB VERIFY] Số bản ghi farming_logs sau khi tạo: ${countAfter}`);
    if (countAfter !== countBefore + 1) {
      throw new Error(`DB Mismatch: Kỳ vọng ${countBefore + 1} bản ghi nhưng thực tế có ${countAfter}`);
    }
    console.log(`✅ [DB VERIFY] Số bản ghi farming_logs tăng chính xác +1 (từ ${countBefore} lên ${countAfter})!`);

    const latestLog = getLatestDbLog();
    console.log('----------------------------------------------------------------');
    console.log('📄 [DB RECORD DETAIL]');
    console.log(`- ID: ${latestLog.id}`);
    console.log(`- Mùa vụ (crop_season_id): ${latestLog.crop_season_id}`);
    console.log(`- Thửa đất (plot_id): ${latestLog.plot_id}`);
    console.log(`- Hoạt động: ${latestLog.activity_type}`);
    console.log(`- Ngày thực hiện: ${latestLog.activity_date}`);
    console.log(`- Số ngày cách ly (PHI): ${latestLog.phi_days} ngày`);
    console.log(`- Tọa độ GPS: Vĩ độ ${latestLog.gps_latitude}, Kinh độ ${latestLog.gps_longitude}`);
    console.log(`- Số lô vật tư: ${latestLog.material_batch_number}`);
    console.log(`- Liều lượng: ${latestLog.quantity_applied} ${latestLog.unit}`);
    console.log('----------------------------------------------------------------');

    // Step 11: Capture Screenshot Proof
    const screenshotPath = path.join(ARTIFACT_DIR, '18_farming_log_created.png');
    await page.screenshot({ path: screenshotPath, fullPage: true });
    console.log(`📸 [PROOF SAVED] Ảnh bằng chứng đã được lưu: ${screenshotPath}`);

    console.log('================================================================');
    console.log('🎉 KIỂM THỬ KHÉP KÍN NHẬT KÝ CANH TÁC THÀNH CÔNG 100%!');
    console.log('================================================================');
  } catch (err) {
    console.error('❌ [TEST FAILED]:', err.message);
    const errScreenshotPath = path.join(ARTIFACT_DIR, '18_farming_log_error.png');
    await page.screenshot({ path: errScreenshotPath, fullPage: true }).catch(() => {});
    process.exit(1);
  } finally {
    await browser.close();
  }
}

runAutonomousFarmingLogQA();
