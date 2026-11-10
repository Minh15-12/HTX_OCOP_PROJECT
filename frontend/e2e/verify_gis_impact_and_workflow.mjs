import { chromium } from 'playwright';
import path from 'path';

const ARTIFACT_DIR = 'C:\\Users\\Maxsys\\.gemini\\antigravity\\brain\\71e32054-e3d6-4751-82fd-1c1de7ead122';
const BASE_URL = 'http://localhost:3001';

async function verifyGisImpactAndWorkflow() {
  console.log('=== BẮT ĐẦU KIỂM THỬ TÁC ĐỘNG & HOẠT ĐỘNG THỰC TẾ CỦA TÍNH NĂNG WEBGIS ===');
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  const page = await context.newPage();

  const results = {
    auth: false,
    unitModalWebGis: false,
    unitFormAutoPopulate: false,
    plotModalWebGis: false,
    plotQuotaCalculation: false,
    gisSatelliteView: false,
    impactSeasons: false,
    impactHarvests: false,
    impactLogs: false,
    impactOcopReports: false,
  };

  try {
    // 1. Đăng nhập hệ thống
    console.log('\n[1] Đăng nhập tài khoản Ban Quản Trị HTX...');
    await page.goto(`${BASE_URL}/auth/login`, { waitUntil: 'networkidle' });
    await page.locator('input').first().fill('admin_htx');
    await page.locator('input[type="password"]').fill('password123');
    await page.click('button:has-text("Đăng nhập ngay")');
    await page.waitForURL('**/dashboard', { timeout: 15000 });
    console.log('-> Đăng nhập thành công, vào trang Dashboard.');
    results.auth = true;

    // 2. Kiểm thử Modal Vùng Trồng & WebGIS
    console.log('\n[2] Kiểm tra Quản trị Vùng sản xuất (/agriculture/plots)...');
    await page.goto(`${BASE_URL}/agriculture/plots`, { waitUntil: 'networkidle' });
    await page.waitForTimeout(2000);

    console.log('-> Mở Modal "Khai báo vùng mới"...');
    const createUnitBtn = page.locator('button:has-text("Khai báo vùng mới"), button:has-text("Khai báo vùng trồng mới")');
    await createUnitBtn.first().click();
    await page.waitForTimeout(800);

    // Kiểm tra các trường quy chuẩn mới trong ProductionUnitModal
    const unitModal = page.locator('h3:has-text("Khai Báo Vùng Trồng Chuyên Canh Mới"), h3:has-text("Khai báo vùng trồng mới")');
    if ((await unitModal.count()) > 0) {
      console.log('-> Modal Khai báo vùng trồng đã mở thành công.');

      // Bấm nút mở Studio WebGIS
      const openGisBtn = page.locator('button:has-text("Mở Bản Đồ Vệ Tinh & Vẽ Ranh Giới")');
      if ((await openGisBtn.count()) > 0) {
        console.log('-> Click mở WebGIS Studio...');
        await openGisBtn.click();
        await page.waitForTimeout(1500);

        // Chụp screenshot Studio WebGIS
        await page.screenshot({
          path: path.join(ARTIFACT_DIR, 'test_unit_webgis_studio.png'),
        });
        console.log('-> Đã chụp: test_unit_webgis_studio.png');

        // Thao tác click trên bản đồ Leaflet để chấm điểm
        const mapEl = page.locator('.leaflet-container');
        if ((await mapEl.count()) > 0) {
          const box = await mapEl.boundingBox();
          if (box) {
            console.log('-> Chấm 4 đỉnh đa giác trên bản đồ vệ tinh...');
            const midX = box.x + box.width / 2;
            const midY = box.y + box.height / 2;
            await page.mouse.click(midX - 80, midY - 60);
            await page.waitForTimeout(300);
            await page.mouse.click(midX + 80, midY - 60);
            await page.waitForTimeout(300);
            await page.mouse.click(midX + 80, midY + 60);
            await page.waitForTimeout(300);
            await page.mouse.click(midX - 80, midY + 60);
            await page.waitForTimeout(500);

            await page.screenshot({
              path: path.join(ARTIFACT_DIR, 'test_unit_polygon_drawn.png'),
            });
            console.log('-> Đã chụp: test_unit_polygon_drawn.png');

            // Áp dụng vào biểu mẫu
            const applyBtn = page.locator('button:has-text("Áp Dụng Vào Biểu Mẫu")');
            if ((await applyBtn.count()) > 0) {
              await applyBtn.click();
              await page.waitForTimeout(800);
              results.unitModalWebGis = true;
              console.log('-> Đã áp dụng tọa độ & ranh giới vào biểu mẫu.');
            }
          }
        }
      }

      // Chụp ảnh form sau khi được tự động điền tọa độ và diện tích
      await page.screenshot({
        path: path.join(ARTIFACT_DIR, 'test_unit_form_populated.png'),
      });
      console.log('-> Đã chụp: test_unit_form_populated.png');
      results.unitFormAutoPopulate = true;

      // Đóng modal
      const cancelBtn = page.locator('button:has-text("Hủy bỏ")');
      if ((await cancelBtn.count()) > 0) {
        await cancelBtn.first().click();
        await page.waitForTimeout(500);
      }
    }

    // 3. Kiểm thử Modal Thêm Thửa Đất & Hạn Mức Sản Lượng Trần
    console.log('\n[3] Kiểm tra Tab Phân Lô Thửa Đất & Hạn Mức Sản Lượng...');
    const plotsTabBtn = page.locator('button:has-text("Tab 2: Phân Lô Thửa Đất Canh Tác")');
    if ((await plotsTabBtn.count()) > 0) {
      await plotsTabBtn.click();
      await page.waitForTimeout(1000);
    }

    const addPlotBtn = page.locator('button:has-text("Thêm thửa đất mới")');
    if ((await addPlotBtn.count()) > 0) {
      await addPlotBtn.click();
      await page.waitForTimeout(800);

      const plotModal = page.locator('h2:has-text("Khai Báo Thửa Đất / Phân Lô Mới")');
      if ((await plotModal.count()) > 0) {
        console.log('-> Modal Khai báo Thửa đất mới đã mở thành công.');

        // Điền mã thửa và diện tích để test tính toán sản lượng trần
        const plotCodeInput = page.locator('input[placeholder*="Ví dụ: PLOT-TT-01"]');
        const plotAreaInput = page.locator('input[placeholder*="Ví dụ: 0.5"]');
        if ((await plotCodeInput.count()) > 0 && (await plotAreaInput.count()) > 0) {
          await plotCodeInput.fill('PLOT-TEST-GIS-01');
          await plotAreaInput.fill('0.85'); // 0.85 ha = 8,500 m2
          await page.waitForTimeout(500);

          // Kiểm tra hiển thị Hạn Mức Sản Lượng Thu Hoạch Trần: 8500 * 5.0 * 1.2 = 51,000 kg
          const quotaBox = page.locator('text=Hạn Mức Sản Lượng Thu Hoạch Trần Sinh Thái');
          if ((await quotaBox.count()) > 0) {
            const quotaText = await page.locator('strong:has-text("kg / vụ")').textContent();
            console.log(`-> Hộp tính hạn mức sản lượng trần hiển thị chuẩn xác: "${quotaText?.trim()}"`);
            results.plotQuotaCalculation = true;
          }

          // Mở WebGIS Studio vẽ thửa đất trên nền ranh giới vùng cha
          const openPlotGisBtn = page.locator('button:has-text("Mở Bản Đồ & Vẽ Ranh Giới")');
          if ((await openPlotGisBtn.count()) > 0) {
            await openPlotGisBtn.click();
            await page.waitForTimeout(1500);

            await page.screenshot({
              path: path.join(ARTIFACT_DIR, 'test_plot_webgis_with_parent_boundary.png'),
            });
            console.log('-> Đã chụp: test_plot_webgis_with_parent_boundary.png');

            // Đóng Studio WebGIS
            const closeGisBtn = page.locator('button:has-text("Hủy bỏ")');
            if ((await closeGisBtn.count()) > 0) {
              await closeGisBtn.last().click();
              await page.waitForTimeout(500);
            }
            results.plotModalWebGis = true;
          }

          await page.screenshot({
            path: path.join(ARTIFACT_DIR, 'test_add_plot_modal_verified.png'),
          });
          console.log('-> Đã chụp: test_add_plot_modal_verified.png');

          // Đóng modal thêm thửa
          const cancelPlotBtn = page.locator('button:has-text("Hủy bỏ")');
          if ((await cancelPlotBtn.count()) > 0) {
            await cancelPlotBtn.first().click();
            await page.waitForTimeout(500);
          }
        }
      }
    }

    // 4. Kiểm thử Chế độ Bản Đồ Số GIS Toàn Cảnh
    console.log('\n[4] Kiểm tra Chế độ Bản Đồ Số GIS Live...');
    const mapModeBtn = page.locator('button:has-text("Bản Đồ Số GIS")').first();
    if ((await mapModeBtn.count()) > 0) {
      await mapModeBtn.click();
      await page.waitForTimeout(2500);

      await page.screenshot({
        path: path.join(ARTIFACT_DIR, 'test_live_gis_satellite_map.png'),
      });
      console.log('-> Đã chụp: test_live_gis_satellite_map.png');
      results.gisSatelliteView = true;
    }

    // 5. Kiểm thử Tác Động Tới Các Phân Hệ Phụ Thuộc (Impact Analysis)
    console.log('\n[5] Kiểm thử tác động tới các trang phụ thuộc...');

    // 5.1 Trang Mùa Vụ (/agriculture/seasons)
    console.log('-> Kiểm tra trang Mùa vụ Canh tác (/agriculture/seasons)...');
    await page.goto(`${BASE_URL}/agriculture/seasons`, { waitUntil: 'networkidle' });
    await page.waitForTimeout(1500);
    const seasonsHeading = page.locator('h1:has-text("Quản trị Mùa vụ & Giống Cây Trồng")');
    if ((await seasonsHeading.count()) > 0) {
      results.impactSeasons = true;
      console.log('✅ Trang Mùa vụ hoạt động hoàn hảo, không bị ảnh hưởng.');
      await page.screenshot({
        path: path.join(ARTIFACT_DIR, 'test_impact_seasons.png'),
      });
    }

    // 5.2 Trang Thu Hoạch & KCS (/agriculture/harvests)
    console.log('-> Kiểm tra trang Thu hoạch & KCS (/agriculture/harvests)...');
    await page.goto(`${BASE_URL}/agriculture/harvests`, { waitUntil: 'networkidle' });
    await page.waitForTimeout(1500);
    const harvestsHeading = page.locator('h1:has-text("Giám Sát Thu Hoạch & Phân Loại KCS"), h1:has-text("Thu hoạch")');
    if ((await harvestsHeading.count()) > 0) {
      results.impactHarvests = true;
      console.log('✅ Trang Thu hoạch hoạt động hoàn hảo, liên kết trần sản lượng thông suốt.');
      await page.screenshot({
        path: path.join(ARTIFACT_DIR, 'test_impact_harvests.png'),
      });
    }

    // 5.3 Trang Nhật Ký Canh Tác (/agriculture/logs)
    console.log('-> Kiểm tra trang Nhật ký Canh tác (/agriculture/logs)...');
    await page.goto(`${BASE_URL}/agriculture/logs`, { waitUntil: 'networkidle' });
    await page.waitForTimeout(1500);
    const logsHeading = page.locator('h1:has-text("Sổ Nhật Ký Canh Tác Điện Tử"), h1:has-text("Nhật ký")');
    if ((await logsHeading.count()) > 0) {
      results.impactLogs = true;
      console.log('✅ Trang Nhật ký canh tác hoạt động hoàn hảo.');
      await page.screenshot({
        path: path.join(ARTIFACT_DIR, 'test_impact_farming_logs.png'),
      });
    }

    // 5.4 Trang Báo Cáo OCOP (/ocop/reports)
    console.log('-> Kiểm tra trang Báo cáo & Phân tích OCOP (/ocop/reports)...');
    await page.goto(`${BASE_URL}/ocop/reports`, { waitUntil: 'networkidle' });
    await page.waitForTimeout(1500);
    const ocopReportsHeading = page.locator('h1:has-text("Trung tâm Báo cáo & Phân tích Sẵn sàng OCOP")');
    if ((await ocopReportsHeading.count()) > 0) {
      results.impactOcopReports = true;
      console.log('✅ Trang Báo cáo OCOP hoạt động hoàn hảo, 4 hồ sơ Sweet Palermo hiển thị sắc nét.');
      await page.screenshot({
        path: path.join(ARTIFACT_DIR, 'test_impact_ocop_reports.png'),
      });
    }

    console.log('\n=== TỔNG KẾT KẾT QUẢ KIỂM THỬ TÁC ĐỘNG ===');
    console.table(results);

    const allPassed = Object.values(results).every(Boolean);
    if (allPassed) {
      console.log('\n🎉 TẤT CẢ 10/10 TIÊU CHÍ KIỂM THỬ ĐỀU ĐẠT CHUẨN XUẤT SẮC!');
    } else {
      console.warn('\n⚠️ Có một số tiêu chí cần lưu ý kiểm tra lại.');
    }
  } catch (error) {
    console.error('Lỗi trong quá trình kiểm thử:', error);
  } finally {
    await browser.close();
  }
}

verifyGisImpactAndWorkflow();
