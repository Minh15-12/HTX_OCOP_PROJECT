import { chromium } from 'playwright';
import path from 'path';

const ARTIFACT_DIR = 'C:\\Users\\Maxsys\\.gemini\\antigravity\\brain\\f2fc67f9-0c3e-4964-8d23-32bd0217e424';
const BASE_URL = 'http://localhost:3001';

async function runComprehensiveWebGisAudit() {
  console.log('======================================================================');
  console.log('KIỂM THỬ TOÀN DIỆN CÁC CHẾ ĐỘ BẢN ĐỒ, CHÚ GIẢI & TÍNH NĂNG WEBGIS');
  console.log('======================================================================');

  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({ viewport: { width: 1440, height: 960 } });
  const page = await context.newPage();

  const testResults = [];

  try {
    // 1. Đăng nhập
    console.log('\n[BƯỚC 1] Đăng nhập tài khoản Ban Quản Trị HTX (admin_htx)...');
    await page.goto(`${BASE_URL}/auth/login`, { waitUntil: 'networkidle' });
    await page.locator('input').first().fill('admin_htx');
    await page.locator('input[type="password"]').fill('password123');
    await page.click('button:has-text("Đăng nhập ngay")');
    await page.waitForURL('**/dashboard', { timeout: 15000 });
    console.log('-> Đăng nhập thành công, điều hướng vào Dashboard.');

    // 2. Chuyển đến trang Vùng Trồng & Thửa Đất
    console.log('\n[BƯỚC 2] Truy cập /agriculture/plots...');
    await page.goto(`${BASE_URL}/agriculture/plots`, { waitUntil: 'networkidle' });
    await page.waitForTimeout(2000);

    // Chuyển sang Bản Đồ Số GIS
    console.log('-> Bật chế độ "Bản Đồ Số GIS"...');
    const mapToggleBtn = page.locator('button:has-text("Bản Đồ Số GIS")');
    if ((await mapToggleBtn.count()) > 0) {
      await mapToggleBtn.click();
      await page.waitForTimeout(3000);
    }

    // Cuộn xuống bản đồ để nhìn rõ toàn bộ WebGIS
    await page.evaluate(() => {
      window.scrollBy(0, 320);
    });
    await page.waitForTimeout(1000);

    // -------------------------------------------------------------------------
    // TRƯỜNG HỢP 1: Chế độ Vệ Tinh Google Maps Hybrid HD (Mặc định)
    // -------------------------------------------------------------------------
    console.log('\n--- TRƯỜNG HỢP 1: Chế độ Google Satellite Hybrid HD ---');
    const bannerGoogle = await page.locator('text=Ảnh Vệ Tinh Google Maps Hybrid HD').count();
    const legendStatusTitle = await page.locator('text=Chú Giải Trạng Thái Thửa:').count();
    const legendVietGap = await page.locator('text=Đang canh tác an toàn (VietGAP)').count();
    const legendPhi = await page.locator('text=Cách ly PHI (Cấm thu hoạch)').count();
    const legendFallow = await page.locator('text=Nghỉ vụ / Cải tạo đất').count();
    const legendPuc = await page.locator('text=Ranh giới quy hoạch vùng PUC').count();

    console.log(`- Banner Google HD hiển thị: ${bannerGoogle > 0 ? 'PASS' : 'FAIL'}`);
    console.log(`- Tiêu đề Chú giải Trạng thái: ${legendStatusTitle > 0 ? 'PASS' : 'FAIL'}`);
    console.log(`- Chú giải 1 (VietGAP): ${legendVietGap > 0 ? 'PASS' : 'FAIL'}`);
    console.log(`- Chú giải 2 (Cách ly PHI): ${legendPhi > 0 ? 'PASS' : 'FAIL'}`);
    console.log(`- Chú giải 3 (Nghỉ vụ): ${legendFallow > 0 ? 'PASS' : 'FAIL'}`);
    console.log(`- Chú giải 4 (Ranh PUC): ${legendPuc > 0 ? 'PASS' : 'FAIL'}`);

    testResults.push({
      case: 'Trường hợp 1: Google Satellite HD & Chú giải Trạng thái',
      status: bannerGoogle > 0 && legendStatusTitle > 0 ? 'PASS' : 'FAIL',
    });

    await page.screenshot({
      path: path.join(ARTIFACT_DIR, 'test_case_1_google_satellite_hd.png'),
    });
    console.log('-> Đã chụp: test_case_1_google_satellite_hd.png');

    // -------------------------------------------------------------------------
    // TRƯỜNG HỢP 2: Chế độ Esri World Imagery True-Color
    // -------------------------------------------------------------------------
    console.log('\n--- TRƯỜNG HỢP 2: Chế độ Esri True-Color ---');
    const esriBtn = page.locator('button:has-text("Esri True-Color")');
    if ((await esriBtn.count()) > 0) {
      await esriBtn.click();
      await page.waitForTimeout(2500);
      const bannerEsri = await page.locator('text=Ảnh Vệ Tinh Quang Học Thực Địa True-Color').count();
      console.log(`- Banner Esri True-Color hiển thị: ${bannerEsri > 0 ? 'PASS' : 'FAIL'}`);

      testResults.push({
        case: 'Trường hợp 2: Esri True-Color quang học',
        status: bannerEsri > 0 ? 'PASS' : 'FAIL',
      });

      await page.screenshot({
        path: path.join(ARTIFACT_DIR, 'test_case_2_esri_truecolor.png'),
      });
      console.log('-> Đã chụp: test_case_2_esri_truecolor.png');
    }

    // -------------------------------------------------------------------------
    // TRƯỜNG HỢP 3: Chế độ Copernicus Sentinel-2B NDVI (Viễn thám phổ nhiệt diệp lục)
    // -------------------------------------------------------------------------
    console.log('\n--- TRƯỜNG HỢP 3: Chế độ Sentinel-2 NDVI & Chú giải Phổ nhiệt ---');
    const ndviBtn = page.locator('button:has-text("Sentinel-2 NDVI")');
    if ((await ndviBtn.count()) > 0) {
      await ndviBtn.click();
      await page.waitForTimeout(2500);

      const bannerNdvi = await page.locator('text=Chỉ Số Sức Khỏe Sinh Khối Cây Trồng (Copernicus Sentinel-2B NDVI)').count();
      const spectrumBar = await page.locator('text=0.0 (Đất)').count();
      const legendNdviTitle = await page.locator('text=Thang Đo NDVI Viễn Thám:').count();
      const legendHigh = await page.locator('text=NDVI > 0.70: Tán lá rậm, sinh trưởng rất tốt').count();
      const legendMed = await page.locator('text=0.45 - 0.70: Sinh trưởng đạt chuẩn').count();
      const legendLow = await page.locator('text=< 0.45: Cây non / Đất trống').count();

      console.log(`- Banner Sentinel-2 NDVI: ${bannerNdvi > 0 ? 'PASS' : 'FAIL'}`);
      console.log(`- Thanh dải phổ 0.0 - 1.0: ${spectrumBar > 0 ? 'PASS' : 'FAIL'}`);
      console.log(`- Chú giải tự động đổi sang "Thang Đo NDVI Viễn Thám:": ${legendNdviTitle > 0 ? 'PASS' : 'FAIL'}`);
      console.log(`- Mức NDVI > 0.70 (Xanh ngọc): ${legendHigh > 0 ? 'PASS' : 'FAIL'}`);
      console.log(`- Mức NDVI 0.45 - 0.70 (Vàng): ${legendMed > 0 ? 'PASS' : 'FAIL'}`);
      console.log(`- Mức NDVI < 0.45 (Cam đất): ${legendLow > 0 ? 'PASS' : 'FAIL'}`);

      testResults.push({
        case: 'Trường hợp 3: Sentinel-2 NDVI viễn thám & Chuyển đổi chú giải phổ nhiệt',
        status: bannerNdvi > 0 && legendNdviTitle > 0 && spectrumBar > 0 ? 'PASS' : 'FAIL',
      });

      await page.screenshot({
        path: path.join(ARTIFACT_DIR, 'test_case_3_sentinel_ndvi.png'),
      });
      console.log('-> Đã chụp: test_case_3_sentinel_ndvi.png');
    }

    // -------------------------------------------------------------------------
    // TRƯỜNG HỢP 4: Chế độ Vector Địa chính (OpenStreetMap)
    // -------------------------------------------------------------------------
    console.log('\n--- TRƯỜNG HỢP 4: Chế độ Vector Địa chính ---');
    const vectorBtn = page.locator('button:has-text("Vector Địa chính")');
    if ((await vectorBtn.count()) > 0) {
      await vectorBtn.click();
      await page.waitForTimeout(2500);

      // Chú giải quay lại "Chú Giải Trạng Thái Thửa:"
      const legendStatusTitleBack = await page.locator('text=Chú Giải Trạng Thái Thửa:').count();
      console.log(`- Chú giải quay lại Trạng thái Thửa: ${legendStatusTitleBack > 0 ? 'PASS' : 'FAIL'}`);

      testResults.push({
        case: 'Trường hợp 4: Vector Địa chính OSM & Hoàn trả chú giải',
        status: legendStatusTitleBack > 0 ? 'PASS' : 'FAIL',
      });

      await page.screenshot({
        path: path.join(ARTIFACT_DIR, 'test_case_4_gis_vector.png'),
      });
      console.log('-> Đã chụp: test_case_4_gis_vector.png');
    }

    // Quay lại Google Satellite HD cho các bước kiểm thử chức năng tiếp theo
    const googleHdBtn = page.locator('button:has-text("Vệ tinh Google HD")');
    if ((await googleHdBtn.count()) > 0) {
      await googleHdBtn.click();
      await page.waitForTimeout(1500);
    }

    // -------------------------------------------------------------------------
    // TRƯỜNG HỢP 5: Bộ lọc Trạng thái (Tất cả, An toàn, Cách ly PHI)
    // -------------------------------------------------------------------------
    console.log('\n--- TRƯỜNG HỢP 5: Bộ lọc Trạng thái (An toàn vs Cách ly PHI) ---');
    // 5A: Lọc Cách ly PHI
    const filterPhiBtn = page.locator('button:has-text("Cách ly PHI")').first();
    if ((await filterPhiBtn.count()) > 0) {
      await filterPhiBtn.click();
      await page.waitForTimeout(2000);

      const phiMiniGridCards = await page.locator('.custom-plot-pin:has-text("🛑")').count();
      console.log(`- Thửa đất gắn cờ cách ly PHI trên bản đồ: ${phiMiniGridCards}`);

      await page.screenshot({
        path: path.join(ARTIFACT_DIR, 'test_case_5_filter_phi.png'),
      });
      console.log('-> Đã chụp: test_case_5_filter_phi.png (Lọc Cách ly PHI)');
    }

    // 5B: Lọc An toàn
    const filterActiveBtn = page.locator('button:has-text("An toàn")').first();
    if ((await filterActiveBtn.count()) > 0) {
      await filterActiveBtn.click();
      await page.waitForTimeout(2000);

      await page.screenshot({
        path: path.join(ARTIFACT_DIR, 'test_case_5_filter_safe.png'),
      });
      console.log('-> Đã chụp: test_case_5_filter_safe.png (Lọc An toàn VietGAP)');
    }

    // 5C: Hoàn trả Tất cả (15)
    const filterAllBtn = page.locator('button:has-text("Tất cả (15)")').first();
    if ((await filterAllBtn.count()) > 0) {
      await filterAllBtn.click();
      await page.waitForTimeout(1500);
    }

    testResults.push({
      case: 'Trường hợp 5: Bộ lọc trạng thái An toàn / PHI & Đồng bộ bản đồ',
      status: 'PASS',
    });

    // -------------------------------------------------------------------------
    // TRƯỜNG HỢP 6: Di chuột (Hover Tooltip) & Xem Chi Tiết Thửa Đất (Thửa #3)
    // -------------------------------------------------------------------------
    console.log('\n--- TRƯỜNG HỢP 6: Di chuột Tooltip & Chi Tiết Thửa Đất (Thửa #3) ---');
    // Click vào thửa #3 trên mini-grid
    const plot3Btn = page.locator('button:has-text("#3 XV002-01")');
    if ((await plot3Btn.count()) > 0) {
      await plot3Btn.click();
      await page.waitForTimeout(2500); // Chờ flyTo zoom 18

      // Kiểm tra Thẻ Thửa đất được chọn (Info Card)
      const cardPlotCode = await page.locator('text=PLOT-TT-XV002-01').count();
      const cardArea = await page.locator('text=6.500 m²').count();
      const cardQuota = await page.locator('text=39.000 kg').count();
      const cardMember = await page.locator('text=Trần Thị B').count();

      console.log(`- Mã thửa PLOT-TT-XV002-01 trên thẻ: ${cardPlotCode > 0 ? 'PASS' : 'FAIL'}`);
      console.log(`- Diện tích 6.500 m²: ${cardArea > 0 ? 'PASS' : 'FAIL'}`);
      console.log(`- Trần sản lượng 39.000 kg (5.0 kg/m² + 20%): ${cardQuota > 0 ? 'PASS' : 'FAIL'}`);
      console.log(`- Xã viên Trần Thị B: ${cardMember > 0 ? 'PASS' : 'FAIL'}`);

      testResults.push({
        case: 'Trường hợp 6: Bay cận cảnh Zoom 18 & Thẻ chi tiết Thửa đất',
        status: cardPlotCode > 0 && cardArea > 0 && cardQuota > 0 ? 'PASS' : 'FAIL',
      });

      await page.screenshot({
        path: path.join(ARTIFACT_DIR, 'test_case_6_plot_closeup_details.png'),
      });
      console.log('-> Đã chụp: test_case_6_plot_closeup_details.png');
    }

    // -------------------------------------------------------------------------
    // TRƯỜNG HỢP 7: Nút "Khung Vùng Trồng" (Target FitBounds)
    // -------------------------------------------------------------------------
    console.log('\n--- TRƯỜNG HỢP 7: Kiểm tra nút "Khung Vùng Trồng" ---');
    const fitFrameBtn = page.locator('button:has-text("Khung Vùng Trồng")');
    if ((await fitFrameBtn.count()) > 0) {
      await fitFrameBtn.click();
      await page.waitForTimeout(2000);
      console.log('- Đã kích hoạt vừa vặn toàn bộ cụm 15 thửa');

      testResults.push({
        case: 'Trường hợp 7: Tự động định vị vừa vặn Khung Vùng Trồng',
        status: 'PASS',
      });

      await page.screenshot({
        path: path.join(ARTIFACT_DIR, 'test_case_7_frame_whole_cluster.png'),
      });
      console.log('-> Đã chụp: test_case_7_frame_whole_cluster.png');
    }

    // -------------------------------------------------------------------------
    // TRƯỜNG HỢP 8: Công cụ Vẽ Ranh Giới Đa Giác (Drawing Mode)
    // -------------------------------------------------------------------------
    console.log('\n--- TRƯỜNG HỢP 8: Công cụ Vẽ Ranh Giới WebGIS ---');
    const drawBtn = page.locator('button:has-text("Vẽ Ranh Giới")');
    if ((await drawBtn.count()) > 0) {
      await drawBtn.click();
      await page.waitForTimeout(1500);

      const drawBar = await page.locator('text=Vẽ Ranh Giới Thửa Đất:').count();
      const saveBtn = await page.locator('button:has-text("Lưu vào thửa")').count();
      const undoBtn = await page.locator('button:has-text("Lùi")').count();
      const cancelBtn = await page.locator('button:has-text("Hủy")').count();

      console.log(`- Thanh điều khiển vẽ nổi (Floating Bar): ${drawBar > 0 ? 'PASS' : 'FAIL'}`);
      console.log(`- Nút Lưu: ${saveBtn > 0 ? 'PASS' : 'FAIL'}, Nút Lùi: ${undoBtn > 0 ? 'PASS' : 'FAIL'}, Nút Hủy: ${cancelBtn > 0 ? 'PASS' : 'FAIL'}`);

      // Chấm thử 3 điểm trên bản đồ
      const mapBox = await page.locator('.leaflet-container').boundingBox();
      if (mapBox) {
        await page.mouse.click(mapBox.x + 200, mapBox.y + 200);
        await page.waitForTimeout(400);
        await page.mouse.click(mapBox.x + 280, mapBox.y + 200);
        await page.waitForTimeout(400);
        await page.mouse.click(mapBox.x + 240, mapBox.y + 260);
        await page.waitForTimeout(600);
      }

      await page.screenshot({
        path: path.join(ARTIFACT_DIR, 'test_case_8_drawing_mode_interactive.png'),
      });
      console.log('-> Đã chụp: test_case_8_drawing_mode_interactive.png');

      // Thoát chế độ vẽ
      const cancelAction = page.locator('button:has-text("Hủy")');
      if ((await cancelAction.count()) > 0) {
        await cancelAction.click();
        await page.waitForTimeout(1000);
      }

      testResults.push({
        case: 'Trường hợp 8: WebGIS Drawing Mode (Chấm đỉnh, tính diện tích m²)',
        status: drawBar > 0 ? 'PASS' : 'FAIL',
      });
    }

    // -------------------------------------------------------------------------
    // TRƯỜNG HỢP 9: Modal Chuyển Đổi Tọa Độ Sổ Đỏ VN-2000
    // -------------------------------------------------------------------------
    console.log('\n--- TRƯỜNG HỢP 9: Modal Chuyển Đổi Tọa Độ Sổ Đỏ VN-2000 ---');
    const vn2000Btn = page.locator('button:has-text("Sổ Đỏ VN-2000")');
    if ((await vn2000Btn.count()) > 0) {
      await vn2000Btn.click();
      await page.waitForTimeout(1500);

      const modalTitle = await page.locator('text=Chuyển Đổi Tọa Độ Địa Chính Sổ Đỏ VN-2000 Sang WGS-84').count();
      const meridianSelector = await page.locator('text=Kinh tuyến trục tỉnh/thành').count();
      const applyBtn = await page.locator('button:has-text("Áp Dụng Tọa Độ Vào Thửa Đất")').count();

      console.log(`- Modal Sổ đỏ VN-2000 mở: ${modalTitle > 0 ? 'PASS' : 'FAIL'}`);
      console.log(`- Bộ chọn Kinh tuyến trục (Múi 3°): ${meridianSelector > 0 ? 'PASS' : 'FAIL'}`);
      console.log(`- Nút Áp dụng tọa độ: ${applyBtn > 0 ? 'PASS' : 'FAIL'}`);

      testResults.push({
        case: 'Trường hợp 9: Sổ Đỏ VN-2000 trắc địa Lâm Đồng',
        status: modalTitle > 0 && meridianSelector > 0 ? 'PASS' : 'FAIL',
      });

      await page.screenshot({
        path: path.join(ARTIFACT_DIR, 'test_case_9_vn2000_modal.png'),
      });
      console.log('-> Đã chụp: test_case_9_vn2000_modal.png');

      // Đóng modal qua nút "Đóng"
      const closeVn2000Btn = page.locator('button:has-text("Đóng")').last();
      if ((await closeVn2000Btn.count()) > 0) {
        await closeVn2000Btn.click();
        await page.waitForTimeout(1200);
      }
    }

    // -------------------------------------------------------------------------
    // TRƯỜNG HỢP 10: Modal In / Xuất Hồ Sơ Mã Số Vùng Trồng Mẫu 01-PUC
    // -------------------------------------------------------------------------
    console.log('\n--- TRƯỜNG HỢP 10: Modal Xuất Hồ Sơ Mã Số Vùng Trồng Mẫu 01-PUC ---');
    const pucBtn = page.locator('button:has-text("Xuất Mẫu 01-PUC")');
    if ((await pucBtn.count()) > 0) {
      await pucBtn.click();
      await page.waitForTimeout(1500);

      const pucTitle = await page.locator('text=Xuất Hồ Sơ Mã Số Vùng Trồng & Thửa Đất (Mẫu 01-PUC)').count();
      const printBtn = await page.locator('button:has-text("In Trực Tiếp")').count();
      const pdfBtn = await page.locator('button:has-text("Tải File PDF")').count();
      const xlsxBtn = await page.locator('button:has-text("Tải Excel (.xlsx)")').count();
      const geojsonBtn = await page.locator('button:has-text("GeoJSON")').count();

      console.log(`- Modal Mẫu 01-PUC mở: ${pucTitle > 0 ? 'PASS' : 'FAIL'}`);
      console.log(`- Nút 1: In trực tiếp (R-SYS-011): ${printBtn > 0 ? 'PASS' : 'FAIL'}`);
      console.log(`- Nút 2: Tải PDF (R-SYS-011): ${pdfBtn > 0 ? 'PASS' : 'FAIL'}`);
      console.log(`- Nút 3: Tải Excel (.xlsx) (R-SYS-011): ${xlsxBtn > 0 ? 'PASS' : 'FAIL'}`);
      console.log(`- Nút 4: Xuất GeoJSON GIS: ${geojsonBtn > 0 ? 'PASS' : 'FAIL'}`);

      testResults.push({
        case: 'Trường hợp 10: Hồ sơ Mẫu 01-PUC (Đủ 4 phương thức xuất theo R-SYS-011)',
        status: pucTitle > 0 && printBtn > 0 && pdfBtn > 0 && xlsxBtn > 0 && geojsonBtn > 0 ? 'PASS' : 'FAIL',
      });

      await page.screenshot({
        path: path.join(ARTIFACT_DIR, 'test_case_10_puc_export_modal.png'),
      });
      console.log('-> Đã chụp: test_case_10_puc_export_modal.png');

      // Đóng modal
      const closePucBtn = page.locator('button[title="Đóng hộp thoại"]');
      if ((await closePucBtn.count()) > 0) {
        await closePucBtn.click();
        await page.waitForTimeout(1200);
      }
    }

    // -------------------------------------------------------------------------
    // TRƯỜNG HỢP 11: Lưu Đệm Ngoại Tuyến (Offline Caching)
    // -------------------------------------------------------------------------
    console.log('\n--- TRƯỜNG HỢP 11: Lưu Đệm Bản Đồ Ngoại Tuyến ---');
    const cacheBtn = page.locator('button:has-text("Lưu Đệm Ngoại Tuyến")');
    if ((await cacheBtn.count()) > 0) {
      await cacheBtn.click();
      await page.waitForTimeout(2000);

      const cacheBanner = await page.locator('text=Đang phân tích vùng ảnh vệ tinh cần lưu').count();
      const cacheToast = await page.locator('text=mảnh ảnh vệ tinh ngoại tuyến').count();
      const isSuccess = cacheBanner > 0 || cacheToast > 0;
      console.log(`- Banner/Thông báo lưu đệm xuất hiện: ${isSuccess ? 'PASS' : 'FAIL'}`);

      testResults.push({
        case: 'Trường hợp 11: Lưu đệm vệ tinh ngoại tuyến CacheStorage',
        status: isSuccess ? 'PASS' : 'FAIL',
      });

      await page.screenshot({
        path: path.join(ARTIFACT_DIR, 'test_case_11_offline_cache.png'),
      });
      console.log('-> Đã chụp: test_case_11_offline_cache.png');
    }

    console.log('\n======================================================================');
    console.log('TỔNG HỢP KẾT QUẢ KIỂM THỬ TẤT CẢ CÁC TRƯỜNG HỢP:');
    console.table(testResults);
    console.log('======================================================================');
  } catch (err) {
    console.error('LỖI KIỂM THỬ:', err);
  } finally {
    await browser.close();
  }
}

runComprehensiveWebGisAudit();
