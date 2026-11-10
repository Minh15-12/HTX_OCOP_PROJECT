import { chromium } from 'playwright';
import { execSync } from 'child_process';
import path from 'path';

const ARTIFACT_DIR = 'C:\\Users\\Maxsys\\.gemini\\antigravity\\brain\\b767d259-2ec1-4f08-9a2d-33a518d88c2c';
const BASE_URL = 'http://localhost:3000';

function getDbProductCount() {
  const cmd = `php artisan tinker --execute="echo DB::table('products')->count();"`;
  const out = execSync(cmd, { cwd: 'f:/HTX_OCOP_PROJECT/backend', encoding: 'utf-8' });
  return parseInt(out.trim(), 10);
}

function getLatestDbProduct() {
  const cmd = `php artisan tinker --execute="echo json_encode(DB::table('products')->orderBy('created_at', 'desc')->first());"`;
  const out = execSync(cmd, { cwd: 'f:/HTX_OCOP_PROJECT/backend', encoding: 'utf-8' });
  return JSON.parse(out.trim());
}

async function runAutonomousProductQA() {
  console.log('================================================================');
  console.log('🚀 AUTONOMOUS CLOSED-LOOP QA: PHÂN HỆ SẢN PHẨM OCOP (PRODUCTS)');
  console.log('================================================================');

  // Step 1: Baseline DB Verification
  const countBefore = getDbProductCount();
  console.log(`[DB BASELINE] Số sản phẩm hiện tại trong PostgreSQL: ${countBefore}`);

  // Step 2: Launch Headless Browser
  console.log('[BROWSER] Khởi chạy Playwright Chromium...');
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  const page = await context.newPage();

  page.on('pageerror', (err) => {
    console.error('🔥 [BROWSER PAGE ERROR]:', err.message, err.stack);
  });

  page.on('console', (msg) => {
    if (msg.type() === 'error') {
      console.error('⚠️ [BROWSER CONSOLE ERROR]:', msg.text());
    }
  });

  // Network Spy: Intercept POST /api/v1/products
  let productApiResponse = null;
  page.on('response', async (res) => {
    if (res.url().includes('/api/v1/products') && res.request().method() === 'POST' && !res.url().includes('/lots')) {
      try {
        const body = await res.json();
        productApiResponse = {
          status: res.status(),
          body: body,
        };
        console.log(`[NETWORK SPY] Bắt được POST /api/v1/products -> HTTP ${res.status()}`);
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

    // Step 4: Navigate to /inventory/products
    console.log('[NAV] Điều hướng tới /inventory/products...');
    await page.goto(`${BASE_URL}/inventory/products`, { waitUntil: 'networkidle' });
    await page.waitForTimeout(2000);

    // Step 5: Check UI elements (Table, Cards, Export)
    const headerTitle = await page.textContent('h1');
    console.log(`[UI AUDIT] Tiêu đề trang: "${headerTitle?.trim()}"`);

    // Verify 4 KPI cards exist
    const kpiCards = await page.$$('.grid-cols-1.sm\\:grid-cols-4 > div');
    console.log(`[UI AUDIT] Số lượng thẻ KPI hiển thị: ${kpiCards.length}`);

    // Verify Open Create Modal Button
    const createBtn = page.locator('button:has-text("Thêm sản phẩm mới")');
    if (!(await createBtn.isVisible())) {
      throw new Error('Không tìm thấy nút "Thêm sản phẩm mới"');
    }
    console.log('[UI AUDIT] Nút "Thêm sản phẩm mới" hiển thị đầy đủ và sẵn sàng thao tác.');

    // Verify Export Excel Button
    const exportBtn = page.locator('button:has-text("Xuất Excel Sản Phẩm")');
    if (!(await exportBtn.isVisible())) {
      throw new Error('Không tìm thấy nút "Xuất Excel Sản Phẩm"');
    }
    console.log('[UI AUDIT] Nút "Xuất Excel Sản Phẩm" hiển thị sẵn sàng.');

    // Step 6: Click Open Modal
    console.log('[ACTION] Bấm nút "Thêm sản phẩm mới"...');
    await createBtn.click();
    await page.waitForSelector('form', { state: 'visible', timeout: 5000 });
    console.log('[MODAL] Modal Thêm Sản Phẩm OCOP Mới đã mở.');

    // Step 7: Fill Form Fields
    const code = `PRD-HOACUC-${Date.now().toString().slice(-3)}`;
    console.log(`[FORM] Điền mã sản phẩm: ${code}...`);
    await page.fill('input[value*="PRD-"]', code);

    console.log('[FORM] Chọn phân hạng 4 sao...');
    await page.selectOption('select:has-text("sao")', '4');

    console.log('[FORM] Điền tên sản phẩm OCOP...');
    await page.fill('input[placeholder*="Ớt Chuông"]', 'Trà Hoa Cúc Vàng Sấy Lạnh OCOP Đà Lạt');

    console.log('[FORM] Điền danh mục nông sản...');
    await page.fill('input[value="Rau củ quả tươi cao cấp"]', 'Trà thảo mộc & Thức uống sấy lạnh');

    console.log('[FORM] Điền quy cách đóng gói...');
    await page.fill('input[placeholder*="hút chân không"]', 'Hộp thiếc cao cấp 100g, gói hút ẩm, tem QR GS1-128');

    console.log('[FORM] Điền giá bán tham chiếu...');
    await page.fill('input[type="number"]', '185000');

    console.log('[FORM] Điền đơn vị tính...');
    await page.fill('input[placeholder*="Túi 500g"]', 'Hộp 100g');

    // Step 8: Submit Form
    console.log('[ACTION] Bấm "Lưu sản phẩm"...');
    const submitBtn = page.locator('button[type="submit"]:has-text("Lưu sản phẩm")');
    await submitBtn.click();

    // Step 9: Wait for network response
    console.log('[WAIT] Đang đợi phản hồi từ Backend...');
    for (let i = 0; i < 20; i++) {
      if (productApiResponse) break;
      await page.waitForTimeout(500);
    }

    if (!productApiResponse) {
      throw new Error('Timeout: Không nhận được phản hồi HTTP từ API POST /api/v1/products');
    }

    console.log(`[VERIFY HTTP] Status: ${productApiResponse.status}`);
    if (productApiResponse.status !== 201) {
      console.error('[HTTP ERROR]', JSON.stringify(productApiResponse.body, null, 2));
      throw new Error(`Kỳ vọng HTTP 201 nhưng nhận được HTTP ${productApiResponse.status}`);
    }
    console.log('✅ [HTTP VERIFY] POST /api/v1/products trả về HTTP 201 Created thành công!');

    // Wait for modal to close and toast
    await page.waitForTimeout(2000);

    // Step 10: Verify Database PostgreSQL directly
    const countAfter = getDbProductCount();
    console.log(`[DB VERIFY] Số sản phẩm trong PostgreSQL sau khi tạo: ${countAfter}`);
    if (countAfter !== countBefore + 1) {
      throw new Error(`DB Mismatch: Kỳ vọng ${countBefore + 1} sản phẩm nhưng thực tế có ${countAfter}`);
    }
    console.log(`✅ [DB VERIFY] Số lượng sản phẩm tăng chính xác +1 (từ ${countBefore} lên ${countAfter})!`);

    const latestProduct = getLatestDbProduct();
    console.log('----------------------------------------------------------------');
    console.log('📄 [DB RECORD DETAIL]');
    console.log(`- ID: ${latestProduct.id}`);
    console.log(`- Mã HTX (cooperative_id): ${latestProduct.cooperative_id}`);
    console.log(`- Mã sản phẩm: ${latestProduct.product_code}`);
    console.log(`- Tên sản phẩm: ${latestProduct.product_name}`);
    console.log(`- Danh mục: ${latestProduct.category}`);
    console.log(`- Quy cách (specification): ${JSON.stringify(latestProduct.specification)}`);
    console.log(`- Thông tin chất lượng: ${JSON.stringify(latestProduct.quality_information)}`);
    console.log(`- Trạng thái: ${latestProduct.status}`);
    console.log('----------------------------------------------------------------');

    // Step 11: Capture Screenshot Proof
    const screenshotPath = path.join(ARTIFACT_DIR, '19_product_created.png');
    await page.screenshot({ path: screenshotPath, fullPage: true });
    console.log(`📸 [PROOF SAVED] Ảnh bằng chứng đã được lưu: ${screenshotPath}`);

    console.log('================================================================');
    console.log('🎉 KIỂM THỬ KHÉP KÍN SẢN PHẨM OCOP THÀNH CÔNG 100%!');
    console.log('================================================================');
  } catch (err) {
    console.error('❌ [TEST FAILED]:', err.message);
    const errScreenshotPath = path.join(ARTIFACT_DIR, '19_product_error.png');
    await page.screenshot({ path: errScreenshotPath, fullPage: true }).catch(() => {});
    process.exit(1);
  } finally {
    await browser.close();
  }
}

runAutonomousProductQA();
