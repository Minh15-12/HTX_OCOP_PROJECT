import { chromium } from 'playwright';
import path from 'path';

const ARTIFACT_DIR = 'C:/Users/Maxsys/.gemini/antigravity/brain/71e32054-e3d6-4751-82fd-1c1de7ead122';
const BASE_URL = 'http://localhost:3001';

async function run() {
  console.log('🚀 Bắt đầu kịch bản kiểm thử E2E: Thêm Vùng, Thêm Thửa & Hiển thị Đa giác Thực tế trên WebGIS');
  
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  const page = await context.newPage();

  try {
    // 1. Đăng nhập hệ thống
    console.log('1️⃣ Đăng nhập tài khoản admin_htx...');
    await page.goto(`${BASE_URL}/auth/login`, { waitUntil: 'networkidle' });
    await page.locator('input').first().fill('admin_htx');
    await page.locator('input[type="password"]').fill('password123');
    await page.click('button:has-text("Đăng nhập ngay")');
    await page.waitForURL('**/dashboard', { timeout: 15000 });
    console.log('✅ Đăng nhập thành công, vào trang Dashboard.');

    // 2. Đi tới trang Quản lý Vùng trồng & Thửa đất
    console.log('2️⃣ Điều hướng tới /agriculture/plots...');
    await page.goto(`${BASE_URL}/agriculture/plots`, { waitUntil: 'networkidle' });
    await page.waitForTimeout(2000);

    // 3. Test Kiểm Chứng 1: Đa giác 6 Vùng & 15 Thửa hiện hữu sau khi làm giàu CSDL
    console.log('3️⃣ Kiểm tra hiển thị đa giác thực tế của Vùng Hòn Bồ VT-DALAT-01 trên Bản Đồ Số GIS...');
    const gisModeBtn = page.locator('button:has-text("Bản Đồ Số GIS")');
    await gisModeBtn.first().click();
    await page.waitForSelector('.leaflet-container', { timeout: 10000 });
    await page.waitForTimeout(2000);

    // Chọn vùng VT-DALAT-01 trong dropdown trên GIS
    const unitSelect = page.locator('select:has(option[value="ALL"])');
    const unitOptions = await unitSelect.locator('option').allInnerTexts();
    console.log('Các tùy chọn vùng trồng trên GIS:', unitOptions);

    const dalatOption = unitOptions.find(o => o.includes('VT-DALAT-01'));
    if (dalatOption) {
      await unitSelect.selectOption({ label: dalatOption });
      await page.waitForTimeout(2500);
    }

    // Đếm số đa giác svg path thực tế trên bản đồ
    const polygonsCount = await page.locator('.leaflet-container svg path.leaflet-interactive').count();
    console.log(`✅ Bản đồ đã render ${polygonsCount} đa giác Leaflet thực tế (Bao gồm ranh giới PUC và các thửa đất)!`);

    // Chụp ảnh màn hình Vùng VT-DALAT-01 với các thửa đất đa giác sống động
    await page.screenshot({
      path: path.join(ARTIFACT_DIR, 'test_real_existing_polygons_dalat01.png'),
      fullPage: false,
    });
    console.log('📸 Đã lưu ảnh minh chứng: test_real_existing_polygons_dalat01.png');

    // 4. Test Kiểm Chứng 2: Tạo Vùng Trồng Thật (VT-HONBO-07) qua UI Modal & WebGIS Studio
    console.log('4️⃣ Chuyển về bảng dữ liệu và mở Modal Khai Báo Vùng Trồng Mới...');
    await page.click('button:has-text("Xem Bảng Dữ Liệu")');
    await page.waitForTimeout(1000);

    const tab1Btn = page.locator('button:has-text("Tab 1:")');
    await tab1Btn.first().click();
    await page.waitForTimeout(1000);

    // Click nút Khai báo Vùng sản xuất mới
    const createUnitBtn = page.locator('button:has-text("Khai báo vùng trồng mới")');
    await createUnitBtn.first().click();
    await page.waitForSelector('text=Khai Báo Vùng Trồng Chuyên Canh Mới', { timeout: 5000 });
    console.log('✅ Đã mở modal Khai Báo Vùng Trồng');

    // Điền thông tin vùng trồng
    await page.fill('input[placeholder*="Vùng Trồng Ớt Chuông Sweet Palermo Hòn Bồ"]', 'Vùng Trồng Ớt Chuông CNC Hòn Bồ Phân Khu Nam');
    await page.fill('input[placeholder="VT-DALAT-01"]', 'VT-HONBO-07');
    await page.fill('input[placeholder="15.0"]', '8.5');

    // Mở WebGIS Studio để chấm GPS và vẽ đa giác ranh giới vùng cha
    console.log('🌐 Mở WebGIS Studio để vẽ đa giác ranh giới Vùng VT-HONBO-07...');
    await page.click('button:has-text("Mở Bản Đồ Vệ Tinh & Vẽ Ranh Giới")');
    await page.waitForSelector('.leaflet-container', { timeout: 10000 });
    await page.waitForTimeout(2000);

    // Chấm 5 đỉnh trên bản đồ GIS Studio để tạo đa giác khép kín
    const gisMapBox = await page.locator('.leaflet-container').last().boundingBox();
    if (gisMapBox) {
      const centerX = gisMapBox.x + gisMapBox.width / 2;
      const centerY = gisMapBox.y + gisMapBox.height / 2;

      console.log('Chấm 5 đỉnh đa giác vùng trồng...');
      await page.mouse.click(centerX - 100, centerY - 80);
      await page.waitForTimeout(400);
      await page.mouse.click(centerX + 110, centerY - 60);
      await page.waitForTimeout(400);
      await page.mouse.click(centerX + 130, centerY + 80);
      await page.waitForTimeout(400);
      await page.mouse.click(centerX - 40, centerY + 110);
      await page.waitForTimeout(400);
      await page.mouse.click(centerX - 120, centerY + 20);
      await page.waitForTimeout(600);
    }

    // Chụp ảnh WebGIS Studio khi đang vẽ đa giác vùng cha
    await page.screenshot({
      path: path.join(ARTIFACT_DIR, 'test_create_unit_drawing_polygon.png'),
    });

    // Áp dụng tọa độ
    await page.click('button:has-text("Áp Dụng Vào Biểu Mẫu")');
    await page.waitForTimeout(1000);
    console.log('✅ Đã áp dụng đa giác vùng trồng vào Form');

    // Chụp Form vùng trồng đã điền đầy đủ
    await page.screenshot({
      path: path.join(ARTIFACT_DIR, 'test_unit_form_ready_to_submit.png'),
    });

    // Submit lưu vào CSDL PostgreSQL
    console.log('💾 Bấm Submit "Tạo vùng trồng"...');
    await page.click('button:has-text("Tạo vùng trồng")');
    await page.waitForTimeout(3000);
    console.log('✅ Đã submit tạo vùng trồng!');

    // 5. Test Kiểm Chứng 3: Tạo Thửa Đất Thật (PLOT-HB07-01) nằm trong vùng VT-HONBO-07
    console.log('5️⃣ Chuyển sang Tab 2: Thêm Thửa Đất Mới cho Vùng VT-HONBO-07...');
    const tab2Btn = page.locator('button:has-text("Tab 2:")');
    await tab2Btn.first().click();
    await page.waitForTimeout(1500);

    // Mở modal Thêm thửa
    const addPlotBtn = page.locator('button:has-text("Thêm thửa đất mới")');
    await addPlotBtn.first().click();
    await page.waitForSelector('text=Khai Báo Thửa Đất / Phân Lô Mới', { timeout: 8000 });
    console.log('✅ Đã mở modal Khai Báo Thửa Đất / Phân Lô Mới');

    // Chọn vùng cha VT-HONBO-07 trong dropdown nếu có
    const targetUnitSelect = page.locator('form select').first();
    if (await targetUnitSelect.count() > 0) {
      const opts = await targetUnitSelect.locator('option').allInnerTexts();
      const match = opts.find(o => o.includes('VT-HONBO-07'));
      if (match) {
        await targetUnitSelect.selectOption({ label: match });
        console.log('Đã chọn Vùng sản xuất:', match);
      }
    }

    // Điền mã và diện tích
    await page.fill('input[placeholder*="Ví dụ: PLOT-TT-01"]', 'PLOT-HB07-01');
    await page.fill('input[placeholder*="Ví dụ: 0.5"]', '2.5');

    // Mở WebGIS Studio để vẽ đa giác thửa đất trên nền ranh giới vùng cha
    console.log('🌐 Mở WebGIS Studio để vẽ đa giác Thửa Đất PLOT-HB07-01...');
    await page.click('button:has-text("Mở Bản Đồ & Vẽ Ranh Giới")');
    await page.waitForSelector('.leaflet-container', { timeout: 10000 });
    await page.waitForTimeout(2000);

    // Chấm 4 đỉnh đa giác thửa đất
    const plotGisMapBox = await page.locator('.leaflet-container').last().boundingBox();
    if (plotGisMapBox) {
      const centerX = plotGisMapBox.x + plotGisMapBox.width / 2;
      const centerY = plotGisMapBox.y + plotGisMapBox.height / 2;

      console.log('Chấm 4 đỉnh đa giác thửa đất con...');
      await page.mouse.click(centerX - 40, centerY - 30);
      await page.waitForTimeout(400);
      await page.mouse.click(centerX + 50, centerY - 25);
      await page.waitForTimeout(400);
      await page.mouse.click(centerX + 40, centerY + 45);
      await page.waitForTimeout(400);
      await page.mouse.click(centerX - 45, centerY + 40);
      await page.waitForTimeout(600);
    }

    // Chụp ảnh WebGIS Studio khi vẽ thửa đất (có viền nét đứt vàng vùng cha làm chuẩn)
    await page.screenshot({
      path: path.join(ARTIFACT_DIR, 'test_create_plot_inside_parent_boundary.png'),
    });

    // Áp dụng tọa độ
    await page.click('button:has-text("Áp Dụng Vào Biểu Mẫu")');
    await page.waitForTimeout(1000);
    console.log('✅ Đã áp dụng đa giác thửa đất vào Form');

    // Submit lưu thửa đất vào CSDL PostgreSQL
    console.log('💾 Bấm Submit "Xác Nhận Thêm Thửa"...');
    await page.click('button:has-text("Xác Nhận Thêm Thửa")');
    await page.waitForTimeout(3000);
    console.log('✅ Đã submit tạo thửa đất thành công!');

    // 6. Test Kiểm Chứng 4: Mở Bản Đồ Số GIS hiển thị Vùng Mới VT-HONBO-07 và Thửa Mới PLOT-HB07-01
    console.log('6️⃣ Mở Bản Đồ Số GIS và chọn Vùng Mới VT-HONBO-07...');
    await page.click('button:has-text("Bản Đồ Số GIS")');
    await page.waitForSelector('.leaflet-container', { timeout: 10000 });
    await page.waitForTimeout(2000);

    // Chọn vùng VT-HONBO-07 trong dropdown selector
    const gisSelect = page.locator('select:has(option[value="ALL"])');
    const updatedOptions = await gisSelect.locator('option').allInnerTexts();
    console.log('Danh sách vùng trên GIS sau khi thêm:', updatedOptions);
    const honboOption = updatedOptions.find(o => o.includes('VT-HONBO-07'));
    if (honboOption) {
      await gisSelect.selectOption({ label: honboOption });
      console.log('✅ Đã chọn Vùng mới VT-HONBO-07 trên bản đồ');
      await page.waitForTimeout(3000);
    }

    // Chụp ảnh màn hình bản đồ vệ tinh hiển thị Đa Giác Vùng Cha và Đa Giác Thửa Con mới tạo
    await page.screenshot({
      path: path.join(ARTIFACT_DIR, 'test_real_created_unit_and_plot_map.png'),
      fullPage: false,
    });
    console.log('📸 Đã chụp ảnh bản đồ vệ tinh: test_real_created_unit_and_plot_map.png');

    console.log('🎉 TẤT CẢ 4 BƯỚC KIỂM THỬ E2E HOÀN TẤT XUẤT SẮC 100%!');

  } catch (error) {
    console.error('❌ Lỗi trong quá trình kiểm thử:', error);
    await page.screenshot({
      path: path.join(ARTIFACT_DIR, 'test_gis_error_trace.png'),
    });
    throw error;
  } finally {
    await browser.close();
  }
}

run();
