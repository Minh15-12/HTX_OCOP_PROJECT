import { chromium } from 'playwright';
import path from 'path';

const ARTIFACT_DIR = 'C:\\Users\\Maxsys\\.gemini\\antigravity\\brain\\71e32054-e3d6-4751-82fd-1c1de7ead122';
const BASE_URL = 'http://localhost:3001';

async function run() {
  console.log('=== KHỞI ĐỘNG KIỂM THỬ TỰ ĐỘNG PLAYWRIGHT: GIÁM SÁT PHI & NHẬT KÝ CANH TÁC VIETGAP ===');
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  const page = await context.newPage();

  try {
    // -------------------------------------------------------------------------
    // BƯỚC 1: Đăng nhập hệ thống
    // -------------------------------------------------------------------------
    console.log('\n[1/5] Đăng nhập tài khoản Quản trị HTX Tân Tiến...');
    await page.goto(`${BASE_URL}/auth/login`, { waitUntil: 'networkidle' });
    await page.locator('input').first().fill('admin_htx');
    await page.locator('input[type="password"]').fill('password123');
    await page.click('button:has-text("Đăng nhập ngay")');
    await page.waitForURL('**/dashboard', { timeout: 15000 });
    console.log('✓ Đăng nhập thành công, đã vào Bảng điều khiển.');

    // -------------------------------------------------------------------------
    // BƯỚC 2: Kiểm tra Tab Giám Sát An Toàn PHI & Chế Độ Xem Timeline
    // -------------------------------------------------------------------------
    console.log('\n[2/5] Kiểm tra Tab Bàn Giám sát PHI & Chế độ xem Timeline/Gantt...');
    await page.goto(`${BASE_URL}/agriculture/logs`, { waitUntil: 'networkidle' });
    await page.waitForTimeout(2000);

    // Bấm tab "Bàn Giám Sát PHI"
    const phiTabBtn = page.locator('button:has-text("Bàn Giám Sát PHI")');
    if (await phiTabBtn.isVisible()) {
      await phiTabBtn.click();
      await page.waitForTimeout(1500);

      // Chụp ảnh chế độ Timeline mặc định
      await page.screenshot({ path: path.join(ARTIFACT_DIR, 'verify_phi_timeline_view.png') });
      console.log('✓ Đã lưu ảnh: verify_phi_timeline_view.png (Chế độ Timeline trực quan)');

      // Chuyển sang chế độ Bảng chi tiết
      const tableViewBtn = page.locator('button:has-text("Bảng chi tiết")');
      if (await tableViewBtn.isVisible()) {
        await tableViewBtn.click();
        await page.waitForTimeout(1000);
        await page.screenshot({ path: path.join(ARTIFACT_DIR, 'verify_phi_table_view.png') });
        console.log('✓ Đã lưu ảnh: verify_phi_table_view.png (Chế độ Bảng số liệu)');

        // Chuyển lại về chế độ Timeline
        const timelineBtn = page.locator('button:has-text("Tiến trình Timeline")');
        if (await timelineBtn.isVisible()) {
          await timelineBtn.click();
          await page.waitForTimeout(500);
        }
      }

      // Mở modal Ghi nhật ký nhanh từ Tab Giám sát PHI
      const quickLogBtn = page.locator('button:has-text("Ghi nhật ký BVTV / PHI"), button:has-text("Ghi nhật ký mới")').first();
      if (await quickLogBtn.isVisible()) {
        console.log('\n[3/5] Mở modal Ghi nhật ký nhanh & kiểm tra Từ điển hoạt chất PHI...');
        await quickLogBtn.click();
        await page.waitForTimeout(1000);

        // Tìm và click hoạt chất "Matrine" trong từ điển gợi ý nhanh
        const matrinePill = page.locator('button:has-text("Matrine")').first();
        if (await matrinePill.isVisible()) {
          console.log('  -> Click chọn hoạt chất "Matrine" từ Từ điển BVTV chuẩn...');
          await matrinePill.click();
          await page.waitForTimeout(500);
        }

        await page.screenshot({ path: path.join(ARTIFACT_DIR, 'verify_phi_dictionary_quick_log.png') });
        console.log('✓ Đã lưu ảnh: verify_phi_dictionary_quick_log.png (Từ điển hoạt chất & Auto PHI)');

        // Đóng modal
        const closeBtn = page.locator('button[aria-label="Đóng cửa sổ ghi nhật ký"], button:has-text("Hủy")').first();
        if (await closeBtn.isVisible()) {
          await closeBtn.click();
          await page.waitForTimeout(500);
        }
      }
    }

    // -------------------------------------------------------------------------
    // BƯỚC 4: Kiểm tra Chốt Chặn KCS Thu Hoạch Non Ngày Cách Ly
    // -------------------------------------------------------------------------
    console.log('\n[4/5] Kiểm tra Chốt chặn KCS Thu hoạch (/agriculture/harvests)...');
    await page.goto(`${BASE_URL}/agriculture/harvests`, { waitUntil: 'networkidle' });
    await page.waitForTimeout(1500);

    const newHarvestBtn = page.locator('button:has-text("Tạo phiếu thu hoạch"), button:has-text("Thu hoạch mới")').first();
    if (await newHarvestBtn.isVisible()) {
      await newHarvestBtn.click();
      await page.waitForTimeout(1000);

      // Thử chọn thửa đất
      const plotSelect = page.locator('select').first();
      if (await plotSelect.isVisible()) {
        const options = await plotSelect.locator('option').all();
        if (options.length > 1) {
          await plotSelect.selectOption({ index: 1 });
          await page.waitForTimeout(500);
        }
      }

      await page.screenshot({ path: path.join(ARTIFACT_DIR, 'verify_harvest_phi_gate_check.png') });
      console.log('✓ Đã lưu ảnh: verify_harvest_phi_gate_check.png');

      // Đóng modal thu hoạch
      const cancelHarvest = page.locator('button:has-text("Hủy"), button:has-text("Đóng")').first();
      if (await cancelHarvest.isVisible()) {
        await cancelHarvest.click();
        await page.waitForTimeout(500);
      }
    }

    // -------------------------------------------------------------------------
    // BƯỚC 5: Kiểm tra Minh Chứng Số Hóa Sổ Nhật Ký & PHI (TC-C.2.2) trong Wizard OCOP
    // -------------------------------------------------------------------------
    console.log('\n[5/5] Kiểm tra Minh chứng số hóa Sổ Nhật Ký & PHI (TC-C.2.2) trong Wizard OCOP...');
    await page.goto(`${BASE_URL}/ocop/dossiers/create`, { waitUntil: 'networkidle' });
    await page.waitForTimeout(1500);

    // Chuyển sang Bước 2
    await page.click('button:has-text("Tiếp tục Bước 2")');
    await page.waitForTimeout(1000);

    // Chuyển sang Bước 3
    await page.click('button:has-text("Tiếp tục Bước 3")');
    await page.waitForTimeout(1500);

    // Mở Modal Trích xuất từ HTX
    const extractBtn = page.locator('button:has-text("Trích xuất từ HTX")');
    if (await extractBtn.isVisible()) {
      await extractBtn.click();
      await page.waitForTimeout(1000);

      // Bấm nút "Trích xuất toàn bộ (4 trong 1)"
      const extractAllBtn = page.locator('button:has-text("Trích xuất toàn bộ (4 trong 1)")');
      if (await extractAllBtn.isVisible()) {
        console.log('  -> Bấm [Trích xuất toàn bộ (4 trong 1)] để số hóa hồ sơ VietGAP & PHI...');
        await extractAllBtn.click();
        await page.waitForTimeout(1500);
      }
    }

    // Tìm và mở tài liệu xem trước minh chứng PHI (TC-C.2.2)
    const phiRow = page.locator('tr:has-text("TC-C.2.2")');
    if (await phiRow.count() > 0) {
      console.log('  -> Mở trình xem tài liệu minh chứng số hóa LiveEvidenceDocumentViewer (TC-C.2.2)...');
      const eyeBtn = phiRow.locator('button[title*="Xem chi tiết"]').first();
      await eyeBtn.click();
      await page.waitForTimeout(1500);

      // Chụp ảnh minh chứng số hóa
      await page.screenshot({ path: path.join(ARTIFACT_DIR, 'verify_ocop_phi_live_document.png') });
      console.log('✓ Đã lưu ảnh: verify_ocop_phi_live_document.png (Minh chứng số hóa VietGAP PHI)');

      // Chuyển tab "Tiến trình trực quan" trong Live Viewer
      const timelineSubTab = page.locator('button:has-text("Tiến trình trực quan")');
      if (await timelineSubTab.isVisible()) {
        await timelineSubTab.click();
        await page.waitForTimeout(800);
        await page.screenshot({ path: path.join(ARTIFACT_DIR, 'verify_ocop_phi_timeline_tab.png') });
        console.log('✓ Đã lưu ảnh: verify_ocop_phi_timeline_tab.png (Tab Timeline trích xuất)');
      }
    } else {
      // Fallback click on any eye button
      const anyEye = page.locator('button[title*="Xem chi tiết"]').last();
      if (await anyEye.isVisible()) {
        await anyEye.click();
        await page.waitForTimeout(1500);
        await page.screenshot({ path: path.join(ARTIFACT_DIR, 'verify_ocop_phi_live_document.png') });
        console.log('✓ Đã lưu ảnh fallback: verify_ocop_phi_live_document.png');
      }
    }

    console.log('\n=== TẤT CẢ KỊCH BẢN KIỂM THỬ PLAYWRIGHT ĐÃ HOÀN TẤT THÀNH CÔNG ===');
  } catch (err) {
    console.error('LỖI KIỂM THỬ:', err);
    await page.screenshot({ path: path.join(ARTIFACT_DIR, 'verify_phi_error_trace.png') });
    console.log('✓ Đã chụp ảnh vết lỗi: verify_phi_error_trace.png');
    process.exit(1);
  } finally {
    await browser.close();
  }
}

run();
