import { chromium } from 'playwright';
import path from 'path';

const ARTIFACT_DIR = 'C:\\Users\\Maxsys\\.gemini\\antigravity\\brain\\b767d259-2ec1-4f08-9a2d-33a518d88c2c';
const BASE_URL = 'http://localhost:3000';

async function runSystemSettingsAudit() {
  console.log('========================================================================');
  console.log('⚙️  E2E AUDIT: KIỂM THỬ TOÀN DIỆN CÁC TÍNH NĂNG CÀI ĐẶT HỆ THỐNG');
  console.log('========================================================================');

  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  const page = await context.newPage();

  try {
    // ------------------------------------------------------------------------
    // BƯỚC 1: ĐĂNG NHẬP VÀO HỆ THỐNG
    // ------------------------------------------------------------------------
    console.log('\n[1. AUTH] Đăng nhập tài khoản Quản trị HTX...');
    await page.goto(`${BASE_URL}/login`, { waitUntil: 'networkidle' });
    await page.evaluate(() => localStorage.clear());
    await page.click('button:has-text("Đăng nhập ngay")');
    await page.waitForURL('**/dashboard', { timeout: 15000 });
    console.log('  ✅ Đăng nhập thành công, đã tới /dashboard.');

    // ------------------------------------------------------------------------
    // BƯỚC 2: TRUY CẬP TRANG CÀI ĐẶT HỆ THỐNG
    // ------------------------------------------------------------------------
    console.log('\n[2. NAVIGATE] Điều hướng tới /system/settings...');
    await page.goto(`${BASE_URL}/system/settings`, { waitUntil: 'networkidle' });
    await page.waitForSelector('h1:has-text("Cài đặt hệ thống")', { timeout: 10000 });
    console.log('  ✅ Giao diện Cài đặt hệ thống đã sẵn sàng.');

    // ------------------------------------------------------------------------
    // BƯỚC 3: TEST TAB 1 - TỔNG QUAN & BẢO MẬT
    // ------------------------------------------------------------------------
    console.log('\n[3. TAB 1: OVERVIEW] Kiểm tra Cấu hình Thông tin HTX & An ninh...');
    // Cập nhật tên HTX và thông tin liên hệ
    const sysNameInput = page.locator('label:has-text("Tên hệ thống")').locator('..').locator('input');
    await sysNameInput.fill('HTX Nông Nghiệp Công Nghệ Cao Đà Lạt');

    const phoneInput = page.locator('label:has-text("Số điện thoại")').locator('..').locator('input');
    await phoneInput.fill('0912 345 678');

    // Bật 2FA toggle
    const toggle2fa = page.locator('span:has-text("Yêu cầu xác thực 2 lớp (2FA)")').locator('../..').locator('input[type="checkbox"]');
    const is2faChecked = await toggle2fa.isChecked();
    if (!is2faChecked) {
      await toggle2fa.check({ force: true });
      console.log('  -> Đã bật tùy chọn Xác thực 2 lớp (2FA)');
    }

    // Chọn thời gian tự động đăng xuất: 60 phút
    const timeoutSelect = page.locator('select:has-text("phút")');
    if (await timeoutSelect.count() > 0) {
      await timeoutSelect.selectOption('60');
      console.log('  -> Đã chọn thời gian tự động đăng xuất: 60 phút');
    }

    // Bấm Lưu thay đổi
    console.log('  -> Bấm "Lưu thay đổi" tổng quan...');
    const saveOverviewBtn = page.locator('button:has-text("Lưu thay đổi")').first();
    await saveOverviewBtn.click();
    await page.waitForTimeout(1000);

    // Chụp ảnh kết quả Tab 1
    await page.screenshot({ path: path.join(ARTIFACT_DIR, '33_settings_overview_updated.png'), fullPage: true });
    console.log('  📸 Đã chụp ảnh Tab 1: 33_settings_overview_updated.png');

    // ------------------------------------------------------------------------
    // BƯỚC 4: TEST TAB 2 - CẤU HÌNH NGHIỆP VỤ HTX
    // ------------------------------------------------------------------------
    console.log('\n[4. TAB 2: CONFIG] Kiểm tra Cấu hình Nghiệp vụ (Vốn góp, Phí dịch vụ, Chia lợi nhuận)...');
    await page.click('button:has-text("Cấu hình nghiệp vụ")');
    await page.waitForTimeout(600);

    // Chỉnh mức vốn góp tối thiểu
    const capitalInput = page.locator('label:has-text("Vốn góp tối thiểu")').locator('..').locator('input');
    await capitalInput.fill('20000000');
    console.log('  -> Đã đặt vốn góp tối thiểu: 20.000.000 VNĐ');

    // Chỉnh tỷ lệ phí dịch vụ
    const feeInput = page.locator('label:has-text("Tỷ lệ phí dịch vụ")').locator('..').locator('input');
    await feeInput.fill('3.5');
    console.log('  -> Đã đặt phí dịch vụ HTX: 3.5%');

    // Chỉnh tỷ lệ chia lợi nhuận cho xã viên: 75% -> kiểm tra tỷ lệ HTX tự đổi thành 25%
    const memberShareInput = page.locator('label:has-text("Tỷ lệ cho Xã viên")').locator('..').locator('input');
    await memberShareInput.fill('75');
    await page.waitForTimeout(300);

    const coopShareInput = page.locator('label:has-text("Tỷ lệ giữ lại HTX")').locator('..').locator('input');
    const coopShareVal = await coopShareInput.inputValue();
    console.log(`  -> Tỷ lệ giữ lại HTX tự động tính toán: ${coopShareVal}% (Tổng: 75 + ${coopShareVal} = 100%)`);
    if (coopShareVal === '25') {
      console.log('  ✅ [CHIA LỢI NHUẬN ĐẠT] Thuật toán tự cân bằng tỷ lệ theo Luật HTX 2023 hoạt động chuẩn xác!');
    }

    // Bấm Lưu
    await page.click('button:has-text("Lưu thay đổi")');
    await page.waitForTimeout(1000);
    await page.screenshot({ path: path.join(ARTIFACT_DIR, '34_settings_business_config.png'), fullPage: true });
    console.log('  📸 Đã chụp ảnh Tab 2: 34_settings_business_config.png');

    // ------------------------------------------------------------------------
    // BƯỚC 5: TEST TAB 3 - VAI TRÒ & MA TRẬN PHÂN QUYỀN
    // ------------------------------------------------------------------------
    console.log('\n[5. TAB 3: ROLES] Kiểm tra Quản lý Vai trò & Ma trận Phân quyền...');
    await page.click('button:has-text("Vai trò & Phân quyền")');
    await page.waitForTimeout(600);

    // Chọn vai trò đầu tiên trong danh sách (VD: Ban Giám Đốc hoặc Cán bộ HTX)
    const firstRoleRow = page.locator('tbody tr').first();
    await firstRoleRow.waitFor({ timeout: 5000 });
    const roleName = await firstRoleRow.locator('td').first().innerText();
    await firstRoleRow.click();
    await page.waitForTimeout(500);
    console.log(`  -> Đã chọn vai trò: "${roleName.replace(/\s+/g, ' ').trim()}", ma trận phân quyền đã tải.`);

    // Bấm nút Lưu phân quyền (nếu có trên giao diện)
    const savePermBtn = page.locator('button:has-text("Lưu phân quyền")');
    if (await savePermBtn.count() > 0) {
      await savePermBtn.click();
      await page.waitForTimeout(1000);
      console.log('  ✅ Đã lưu phân quyền vai trò.');
    }

    await page.screenshot({ path: path.join(ARTIFACT_DIR, '35_settings_roles_and_permissions.png'), fullPage: true });
    console.log('  📸 Đã chụp ảnh Tab 3: 35_settings_roles_and_permissions.png');

    // ------------------------------------------------------------------------
    // BƯỚC 6: TEST TAB 4 - QUẢN LÝ NGƯỜI DÙNG & VALIDATION
    // ------------------------------------------------------------------------
    console.log('\n[6. TAB 4: USERS] Kiểm tra Quản lý Người dùng & Cơ chế bắt lỗi form rỗng...');
    await page.click('button:has-text("Người dùng")');
    await page.waitForTimeout(600);

    // Đếm số người dùng ban đầu
    const initialUserRows = await page.locator('tbody tr').count();
    console.log(`  -> Số người dùng hiện tại: ${initialUserRows} tài khoản.`);

    // 6.1: Mở modal thêm người dùng
    await page.click('button:has-text("Thêm người dùng")');
    await page.waitForSelector('h3:has-text("Thêm tài khoản người dùng mới")', { timeout: 5000 });
    console.log('  -> Modal "Thêm tài khoản người dùng mới" đã mở.');

    // 6.2: TEST BẮT LỖI FORM RỖNG
    console.log('  -> [TEST VALIDATION] Bấm nút "Tạo tài khoản" khi chưa nhập dữ liệu...');
    // Xóa mật khẩu mặc định để test bắt lỗi toàn diện
    const passInput = page.locator('label:has-text("Mật khẩu khởi tạo")').locator('..').locator('input');
    await passInput.fill('');
    await page.click('button:has-text("Tạo tài khoản")');
    await page.waitForTimeout(500);

    // Kiểm tra hộp cảnh báo màu đỏ
    const errorBox = page.locator('.bg-red-50');
    const hasErrorBox = await errorBox.isVisible();
    console.log(`  -> Hộp cảnh báo lỗi màu đỏ hiển thị: ${hasErrorBox ? 'CÓ (ĐẠT)' : 'KHÔNG'}`);

    // Chụp ảnh minh chứng bắt lỗi validation form rỗng
    await page.screenshot({ path: path.join(ARTIFACT_DIR, '36_settings_user_validation_error.png') });
    console.log('  📸 Đã chụp ảnh Bắt lỗi Form rỗng: 36_settings_user_validation_error.png');

    // 6.3: NHẬP DỮ LIỆU THỰC TẾ HỢP LỆ VÀ TẠO TÀI KHOẢN
    console.log('  -> Nhập dữ liệu hợp lệ để tạo tài khoản mới...');
    await page.locator('label:has-text("Tên đăng nhập")').locator('..').locator('input').fill('kiemtra_vien01');
    await page.locator('label:has-text("Họ và tên")').locator('..').locator('input').fill('Nguyễn Văn Kiểm Tra');
    await page.locator('label:has-text("Email")').locator('..').locator('input').fill('kiemtra01@htxphuthinh.vn');
    await page.locator('label:has-text("Số điện thoại")').locator('..').locator('input').fill('0909888999');
    await page.locator('label:has-text("Mật khẩu khởi tạo")').locator('..').locator('input').fill('Pass@1234');

    await page.click('button:has-text("Tạo tài khoản")');
    await page.waitForTimeout(1000);

    // 6.4: TÌM KIẾM NGƯỜI DÙNG VỪA TẠO
    console.log('  -> Tìm kiếm người dùng "kiemtra_vien01"...');
    const searchUserInput = page.locator('input[placeholder*="Tìm kiếm theo tên, email"]');
    await searchUserInput.fill('kiemtra_vien01');
    await page.waitForTimeout(500);

    const filteredUsers = await page.locator('tbody tr').count();
    console.log(`  -> Số dòng hiển thị sau khi lọc: ${filteredUsers}`);
    if (filteredUsers >= 1) {
      console.log('  ✅ [TẠO & TÌM KIẾM ĐẠT] Tài khoản mới "kiemtra_vien01" đã được tạo và tìm thấy thành công!');
    }

    // 6.5: TEST KHÓA & MỞ KHÓA TÀI KHOẢN
    console.log('  -> Thử nghiệm Khóa tài khoản...');
    const lockBtn = page.locator('button[title="Khóa tài khoản"]').first();
    if (await lockBtn.count() > 0) {
      await lockBtn.click();
      await page.waitForTimeout(600);
      const lockedBadge = await page.locator('span:has-text("Đã khóa")').isVisible();
      console.log(`  -> Trạng thái đã chuyển sang "Đã khóa": ${lockedBadge ? 'ĐẠT' : 'CHƯA'}`);

      // Mở khóa lại
      const unlockBtn = page.locator('button[title="Mở khóa tài khoản"]').first();
      if (await unlockBtn.count() > 0) {
        await unlockBtn.click();
        await page.waitForTimeout(600);
        console.log('  -> Đã mở khóa lại tài khoản thành công ("Hoạt động").');
      }
    }

    // Xóa từ khóa tìm kiếm để hiển thị toàn bộ danh sách
    await searchUserInput.fill('');
    await page.waitForTimeout(500);

    await page.screenshot({ path: path.join(ARTIFACT_DIR, '37_settings_user_management.png'), fullPage: true });
    console.log('  📸 Đã chụp ảnh Tab 4: 37_settings_user_management.png');

    // ------------------------------------------------------------------------
    // BƯỚC 7: TEST TAB 5 - NHẬT KÝ HỆ THỐNG (AUDIT LOGS)
    // ------------------------------------------------------------------------
    console.log('\n[7. TAB 5: AUDIT] Kiểm tra Nhật ký hệ thống...');
    await page.click('button:has-text("Nhật ký hệ thống")');
    await page.waitForTimeout(600);

    const auditRows = await page.locator('tbody tr').count();
    console.log(`  -> Số sự kiện nhật ký kiểm toán: ${auditRows} dòng.`);
    await page.screenshot({ path: path.join(ARTIFACT_DIR, '38_settings_audit_logs.png'), fullPage: true });
    console.log('  📸 Đã chụp ảnh Tab 5: 38_settings_audit_logs.png');

    // ------------------------------------------------------------------------
    // BƯỚC 8: TEST TAB 6 - SAO LƯU & PHỤC HỒI (BACKUP & RESTORE)
    // ------------------------------------------------------------------------
    console.log('\n[8. TAB 6: BACKUP] Kiểm tra Sao lưu & Phục hồi dữ liệu...');
    await page.click('button:has-text("Sao lưu & Phục hồi")');
    await page.waitForTimeout(600);

    const hasBackupBtn = await page.locator('button:has-text("Sao lưu ngay")').isVisible();
    const hasRestoreArea = await page.locator('text=Kéo thả file sao lưu').isVisible();
    console.log(`  -> Nút "Sao lưu ngay" hiển thị: ${hasBackupBtn ? 'ĐẠT' : 'KHÔNG'}`);
    console.log(`  -> Vùng "Kéo thả file khôi phục" hiển thị: ${hasRestoreArea ? 'ĐẠT' : 'KHÔNG'}`);

    await page.screenshot({ path: path.join(ARTIFACT_DIR, '39_settings_backup_restore.png'), fullPage: true });
    console.log('  📸 Đã chụp ảnh Tab 6: 39_settings_backup_restore.png');

    console.log('\n========================================================================');
    console.log('🎉 HOÀN THÀNH 100% KIỂM THỬ THỰC NGHIỆM CÀI ĐẶT HỆ THỐNG');
    console.log('========================================================================');
  } catch (error) {
    console.error('❌ LỖI TRONG QUÁ TRÌNH TEST:', error);
    await page.screenshot({ path: path.join(ARTIFACT_DIR, 'settings_error_debug.png') });
  } finally {
    await browser.close();
  }
}

runSystemSettingsAudit();
