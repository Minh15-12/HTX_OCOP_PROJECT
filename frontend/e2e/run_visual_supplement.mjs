import { chromium } from '@playwright/test';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const screenshotsDir = path.join(__dirname, 'screenshots');
const artifactDir = 'C:\\Users\\Maxsys\\.gemini\\antigravity\\brain\\b767d259-2ec1-4f08-9a2d-33a518d88c2c';

function copyToArtifact(fileName) {
  const src = path.join(screenshotsDir, fileName);
  if (fs.existsSync(src)) {
    const dest = path.join(artifactDir, fileName);
    fs.copyFileSync(src, dest);
    console.log(`  [COPIED] ${fileName} -> Artifacts directory`);
  }
}

async function runVisualTests() {
  console.log('===============================================================');
  console.log('📸 BẮT ĐẦU CHỤP BỔ SUNG CÁC TRANG SẢN PHẨM, NHẬT KÝ, TIÊU CHÍ, QUYẾT ĐỊNH');
  console.log('===============================================================\n');

  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    viewport: { width: 1440, height: 900 },
    deviceScaleFactor: 1,
  });

  const page = await context.newPage();

  try {
    // 1. Đăng nhập
    await page.goto('http://localhost:3000/login', { waitUntil: 'networkidle' });
    await page.click('button:has-text("Đăng nhập ngay")');
    await page.waitForTimeout(2000);

    // 2. SẢN PHẨM OCOP (/inventory/products)
    console.log('1. Kiểm tra Danh mục Sản phẩm OCOP (/inventory/products)...');
    await page.goto('http://localhost:3000/inventory/products', { waitUntil: 'networkidle' });
    await page.waitForTimeout(2000);
    await page.screenshot({ path: path.join(screenshotsDir, '08_products_page.png') });
    copyToArtifact('08_products_page.png');

    // Mở modal thêm sản phẩm OCOP
    const addProdBtn = await page.$('button:has-text("Thêm sản phẩm"), button:has-text("Thêm mới")');
    if (addProdBtn) {
      console.log('  -> Mở Modal Tạo Sản Phẩm OCOP Mới...');
      await addProdBtn.click();
      await page.waitForTimeout(1000);
      await page.screenshot({ path: path.join(screenshotsDir, '08b_create_product_modal.png') });
      copyToArtifact('08b_create_product_modal.png');
      const closeBtn = await page.$('button:has-text("Hủy"), button:has-text("Đóng")');
      if (closeBtn) await closeBtn.click();
      await page.waitForTimeout(500);
    }

    // 3. NHẬT KÝ CANH TÁC (/agriculture/logs)
    console.log('2. Kiểm tra Nhật ký canh tác điện tử (/agriculture/logs)...');
    await page.goto('http://localhost:3000/agriculture/logs', { waitUntil: 'networkidle' });
    await page.waitForTimeout(2000);
    await page.screenshot({ path: path.join(screenshotsDir, '10_farming_logs_page.png') });
    copyToArtifact('10_farming_logs_page.png');

    // 4. QUYẾT ĐỊNH OCOP (/ocop/decisions)
    console.log('3. Kiểm tra Trang Quyết định & Cấp sao OCOP (/ocop/decisions)...');
    await page.goto('http://localhost:3000/ocop/decisions', { waitUntil: 'networkidle' });
    await page.waitForTimeout(2000);
    await page.screenshot({ path: path.join(screenshotsDir, '11_ocop_decisions_page.png') });
    copyToArtifact('11_ocop_decisions_page.png');

    // 5. TIÊU CHÍ OCOP (/ocop/criteria)
    console.log('4. Kiểm tra Trang Tiêu chí OCOP QĐ 148 (/ocop/criteria)...');
    await page.goto('http://localhost:3000/ocop/criteria', { waitUntil: 'networkidle' });
    await page.waitForTimeout(2000);
    await page.screenshot({ path: path.join(screenshotsDir, '12_ocop_criteria_page.png') });
    copyToArtifact('12_ocop_criteria_page.png');

    // 6. THỬA ĐẤT (/agriculture/plots)
    console.log('5. Kiểm tra Trang Vùng trồng & Thửa đất (/agriculture/plots)...');
    await page.goto('http://localhost:3000/agriculture/plots', { waitUntil: 'networkidle' });
    await page.waitForTimeout(2000);
    await page.screenshot({ path: path.join(screenshotsDir, '13_farm_plots_page.png') });
    copyToArtifact('13_farm_plots_page.png');

    console.log('\n✅ CHỤP BỔ SUNG HOÀN TẤT!');
  } catch (err) {
    console.error('❌ Lỗi:', err);
  } finally {
    await browser.close();
  }
}

runVisualTests();
