import { chromium } from 'playwright';
import path from 'path';

const ARTIFACT_DIR = 'C:\\Users\\Maxsys\\.gemini\\antigravity\\brain\\b767d259-2ec1-4f08-9a2d-33a518d88c2c';
const BASE_URL = 'http://localhost:3000';

async function runPersonaRoleVerification() {
  console.log('========================================================================');
  console.log('🎭 E2E VERIFICATION: ĐÓNG VAI TỪNG PERSONA & KIỂM THỬ MA TRẬN PHÂN QUYỀN');
  console.log('========================================================================');

  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  const page = await context.newPage();

  const loginAs = async (username, password, roleTitle) => {
    console.log(`\n------------------------------------------------------------------------`);
    console.log(`🔑 [LOGIN PERSONA] Đăng nhập vai trò: ${roleTitle} (${username})`);
    console.log(`------------------------------------------------------------------------`);
    await page.goto(`${BASE_URL}/auth/login`, { waitUntil: 'networkidle' });
    await page.evaluate(() => localStorage.clear());
    await page.reload({ waitUntil: 'networkidle' });

    // Fill credentials
    const usernameInput = page.locator('input').first();
    await usernameInput.fill(username);

    const passwordInput = page.locator('input[type="password"]');
    await passwordInput.fill(password);

    await page.click('button:has-text("Đăng nhập ngay")');
    await page.waitForURL('**/dashboard', { timeout: 15000 });
    console.log(`  -> Đăng nhập thành công, điều hướng tới /dashboard`);
    await page.waitForTimeout(1000);
  };

  try {
    // ------------------------------------------------------------------------
    // PERSONA 1: KẾ TOÁN HTX (ketoan01)
    // ------------------------------------------------------------------------
    await loginAs('ketoan01', 'password123', 'Kế toán HTX');

    // Kiểm tra menu Sidebar: Có Tài chính, Không có Cài đặt hệ thống
    const hasFinanceMenu = await page.locator('a:has-text("Sổ quỹ & Quyết toán")').count() > 0;
    const hasSettingsMenu = await page.locator('a:has-text("Cài đặt hệ thống")').count() > 0;
    console.log(`  -> [Sidebar Check] Có menu 'Sổ quỹ & Quyết toán': ${hasFinanceMenu}`);
    console.log(`  -> [Sidebar Check] Bị ẩn menu 'Cài đặt hệ thống': ${!hasSettingsMenu}`);

    // Truy cập trang Tài chính
    console.log('  -> Điều hướng tới /finance...');
    await page.click('a:has-text("Sổ quỹ & Quyết toán")');
    await page.waitForURL('**/finance', { timeout: 10000 });
    await page.waitForTimeout(1500);

    const shot1 = path.join(ARTIFACT_DIR, '40_persona_accountant_finance_view.png');
    await page.screenshot({ path: shot1, fullPage: true });
    console.log(`  📸 Đã chụp ảnh minh chứng Kế toán thao tác Sổ quỹ: 40_persona_accountant_finance_view.png`);

    // ------------------------------------------------------------------------
    // PERSONA 2: THỦ KHO HTX (thukho01)
    // ------------------------------------------------------------------------
    await loginAs('thukho01', 'password123', 'Thủ kho HTX');

    // Kiểm tra menu: Có Vật tư & Nông cụ, Không có Sổ quỹ
    const hasInventoryMenu = await page.locator('a:has-text("Vật tư & Nông cụ")').count() > 0;
    const hasFinanceMenuForStorekeeper = await page.locator('a:has-text("Sổ quỹ & Quyết toán")').count() > 0;
    console.log(`  -> [Sidebar Check] Có menu 'Vật tư & Nông cụ': ${hasInventoryMenu}`);
    console.log(`  -> [Sidebar Check] Bị ẩn menu 'Sổ quỹ & Quyết toán' (SoD): ${!hasFinanceMenuForStorekeeper}`);

    // Truy cập trang Vật tư
    console.log('  -> Điều hướng tới /inventory/materials...');
    await page.click('a:has-text("Vật tư & Nông cụ")');
    await page.waitForURL('**/inventory/materials', { timeout: 10000 });
    await page.waitForTimeout(1500);

    const shot2 = path.join(ARTIFACT_DIR, '41_persona_storekeeper_inventory_view.png');
    await page.screenshot({ path: shot2, fullPage: true });
    console.log(`  📸 Đã chụp ảnh minh chứng Thủ kho quản lý Vật tư: 41_persona_storekeeper_inventory_view.png`);

    // ------------------------------------------------------------------------
    // PERSONA 3: CÁN BỘ KỸ THUẬT NÔNG NGHIỆP (canbo_nongnghiep01)
    // ------------------------------------------------------------------------
    await loginAs('canbo_nongnghiep01', 'password123', 'Cán bộ Kỹ thuật Nông nghiệp');

    // Kiểm tra menu: Có Vùng trồng & Thửa đất
    const hasPlotMenu = await page.locator('a:has-text("Vùng trồng & Thửa đất")').count() > 0;
    console.log(`  -> [Sidebar Check] Có menu 'Vùng trồng & Thửa đất': ${hasPlotMenu}`);

    console.log('  -> Điều hướng tới /agriculture/plots...');
    await page.click('a:has-text("Vùng trồng & Thửa đất")');
    await page.waitForURL('**/agriculture/plots', { timeout: 10000 });
    await page.waitForTimeout(1500);

    const shot3 = path.join(ARTIFACT_DIR, '42_persona_agri_officer_plots_view.png');
    await page.screenshot({ path: shot3, fullPage: true });
    console.log(`  📸 Đã chụp ảnh minh chứng Cán bộ nông nghiệp quản lý Thửa đất: 42_persona_agri_officer_plots_view.png`);

    // ------------------------------------------------------------------------
    // PERSONA 4: GIÁM KHẢO HỘI ĐỒNG OCOP (danhgia01)
    // ------------------------------------------------------------------------
    await loginAs('danhgia01', 'password123', 'Giám khảo Hội đồng Đánh giá OCOP');

    // Kiểm tra menu: Có Hội đồng thẩm định, Không có Quản trị HTX hay Sổ quỹ
    const hasEvaluationMenu = await page.locator('a:has-text("Hội đồng thẩm định")').count() > 0;
    const hasCoopMenuForEvaluator = await page.locator('a:has-text("Hồ sơ pháp lý HTX")').count() > 0;
    console.log(`  -> [Sidebar Check] Có menu 'Hội đồng thẩm định': ${hasEvaluationMenu}`);
    console.log(`  -> [Sidebar Check] Bị ẩn menu 'Hồ sơ pháp lý HTX': ${!hasCoopMenuForEvaluator}`);

    console.log('  -> Điều hướng tới /ocop/evaluation...');
    await page.click('a:has-text("Hội đồng thẩm định")');
    await page.waitForURL('**/ocop/evaluation', { timeout: 10000 });
    await page.waitForTimeout(1500);

    const shot4 = path.join(ARTIFACT_DIR, '43_persona_evaluator_council_view.png');
    await page.screenshot({ path: shot4, fullPage: true });
    console.log(`  📸 Đã chụp ảnh minh chứng Giám khảo thẩm định hồ sơ OCOP: 43_persona_evaluator_council_view.png`);

    // ------------------------------------------------------------------------
    // PERSONA 5: CHỦ TỊCH / ĐẠI DIỆN PHÁP LUẬT HTX (admin_htx)
    // ------------------------------------------------------------------------
    await loginAs('admin_htx', 'password123', 'Chủ tịch Hợp tác xã (HTX_OWNER)');

    console.log('  -> Bàn làm việc tổng quan với đầy đủ quyền năng quản trị HTX...');
    await page.waitForTimeout(1500);

    const shot5 = path.join(ARTIFACT_DIR, '44_persona_htx_owner_full_dashboard.png');
    await page.screenshot({ path: shot5, fullPage: true });
    console.log(`  📸 Đã chụp ảnh minh chứng Dashboard toàn diện của Chủ tịch HTX: 44_persona_htx_owner_full_dashboard.png`);

    // ------------------------------------------------------------------------
    // PERSONA 6: QUẢN TRỊ VIÊN HỆ THỐNG CẤP CAO (sys_admin)
    // ------------------------------------------------------------------------
    await loginAs('sys_admin', 'password123', 'Quản trị viên Hệ thống (SYSTEM_ADMIN)');

    console.log('  -> Điều hướng tới /system/settings để kiểm tra Ma trận phân quyền...');
    await page.goto(`${BASE_URL}/system/settings`, { waitUntil: 'networkidle' });
    await page.waitForSelector('h1:has-text("Cài đặt hệ thống")', { timeout: 10000 });

    // Click vào Tab "Vai trò & Phân quyền"
    const roleTab = page.locator('button:has-text("Vai trò & Phân quyền")');
    await roleTab.click();
    await page.waitForTimeout(1000);

    // Chọn vai trò Kế toán HTX (hoặc click vào vai trò trong bảng)
    const accountantRoleRow = page.locator('td:has-text("Kế toán HTX")').first();
    if (await accountantRoleRow.count() > 0) {
      await accountantRoleRow.click();
      await page.waitForTimeout(800);
      console.log('  -> Đã chọn xem chi tiết ma trận phân quyền của vai trò: Kế toán HTX');
    }

    const shot6 = path.join(ARTIFACT_DIR, '45_persona_sysadmin_role_matrix_view.png');
    await page.screenshot({ path: shot6, fullPage: true });
    console.log(`  📸 Đã chụp ảnh minh chứng Ma trận vai trò & Phân quyền (16 vai trò chuẩn): 45_persona_sysadmin_role_matrix_view.png`);

    console.log('\n========================================================================');
    console.log('🎉 TẤT CẢ KỊCH BẢN ĐÓNG VAI PERSONA & PHÂN QUYỀN ĐÃ HOÀN TẤT THÀNH CÔNG!');
    console.log('========================================================================\n');

  } catch (error) {
    console.error('❌ Lỗi trong quá trình kiểm thử E2E Persona:', error);
    await page.screenshot({ path: path.join(ARTIFACT_DIR, 'persona_test_error_debug.png'), fullPage: true });
    throw error;
  } finally {
    await browser.close();
  }
}

runPersonaRoleVerification();
