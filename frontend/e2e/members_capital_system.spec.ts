import { test, expect } from '@playwright/test';

test.describe('E2E Test: Quản lý Xã viên, Vốn góp, Cài đặt Hệ thống & Phân quyền', () => {
  test.beforeEach(async ({ page }) => {
    // Pre-seed authenticated session to ensure robust, fast test execution
    await page.addInitScript(() => {
      localStorage.setItem('htx_ocop_token', 'token_e2e_htx_2026');
      localStorage.setItem(
        'htx_ocop_user',
        JSON.stringify({
          id: 'usr-demo-01',
          username: 'admin_htx',
          email: 'admin_htx@htx.vn',
          full_name: 'Quản Trị Viên HTX',
          status: 'ACTIVE',
          roles: [{ id: 'r1', name: 'HTX_OWNER', display_name: 'Ban Giám Đốc HTX' }],
        })
      );
      localStorage.setItem(
        'htx_ocop_cooperative',
        JSON.stringify({
          id: 'a60ccf85-7301-43f7-b6d3-b25f72c75b78',
          cooperative_code: 'HTX-PHUTHINH-01',
          legal_name: 'HỢP TÁC XÃ NÔNG NGHIỆP PHÚ THỊNH',
          status: 'ACTIVE',
        })
      );
    });
  });

  test('TC0: Xác thực & Đăng nhập hệ thống (Login Page)', async ({ page }) => {
    // Clear localStorage to test raw login form
    await page.addInitScript(() => {
      localStorage.clear();
    });

    await page.goto('/auth/login');
    await page.waitForLoadState('domcontentloaded');

    await expect(page.locator('h2')).toContainText('Đăng nhập hệ thống');

    const usernameInput = page.locator('input[placeholder*="admin_htx"], input').first();
    const passwordInput = page.locator('input[type="password"]');

    await usernameInput.fill('admin_htx');
    await passwordInput.fill('password123');

    const submitBtn = page.locator('button[type="submit"]');
    await submitBtn.click();

    await page.waitForURL(/\/(dashboard|members)/, { timeout: 15000 });
    await expect(page).toHaveURL(/\/(dashboard|members)/);
  });

  test('TC1: Danh sách Xã viên - Hiển thị, Thêm mới & Xuất Excel', async ({ page }) => {
    await page.goto('/members');
    await page.waitForLoadState('domcontentloaded');

    // 1. Verify Page Title & Summary
    await expect(page.locator('h1')).toContainText('Quản lý Xã viên Hợp tác xã');

    // 2. Verify Table rows exist
    const tableRows = page.locator('table tbody tr');
    await expect(tableRows.first()).toBeVisible();

    // 3. Test Export Excel button & Toast
    const exportExcelBtn = page.locator('button', { hasText: 'Xuất Excel' }).first();
    await expect(exportExcelBtn).toBeVisible();
    await exportExcelBtn.click();

    // Verify toast confirmation appears
    const toast = page.locator('text=Đã xuất thành công file Excel');
    await expect(toast).toBeVisible({ timeout: 5000 });

    // 4. Test Opening Add Member Wizard
    const addMemberBtn = page.locator('button', { hasText: 'Thêm xã viên mới' }).first();
    await addMemberBtn.click();

    // Verify wizard modal opens
    const wizardModal = page.locator('h3').filter({ hasText: /Thêm.*Xã viên/i }).first();
    await expect(wizardModal).toBeVisible();

    // Fill personal info in Step 1
    const nameInput = page.locator('input[placeholder*="NGUYỄN VĂN A"]').first();
    if (await nameInput.isVisible()) {
      await nameInput.fill('LÊ HOÀNG NAM');
    }

    const cccdInput = page.locator('input[placeholder*="CCCD"], input[placeholder*="12 số"]').first();
    if (await cccdInput.isVisible()) {
      await cccdInput.fill('049088123456');
    }

    // Close modal
    const closeBtn = page.locator('button:has(svg.lucide-x)').first();
    if (await closeBtn.isVisible()) {
      await closeBtn.click();
    }
  });

  test('TC2: Quản lý Vốn góp & Ruộng đất - KPI, Ghi nhận góp vốn & Giấy chứng nhận A4', async ({ page }) => {
    await page.goto('/capital');
    await page.waitForLoadState('domcontentloaded');

    // 1. Verify Page Title
    await expect(page.locator('h1')).toContainText('Quản lý Vốn góp & Chứng nhận Vốn');

    // 2. Verify KPI Cards
    await expect(page.locator('text=Tổng vốn góp').first()).toBeVisible();
    await expect(page.locator('text=Đã góp').first()).toBeVisible();
    await expect(page.locator('text=Còn phải góp').first()).toBeVisible();
    await expect(page.locator('text=Khối liên kết').first()).toBeVisible();
    await expect(page.locator('text=Đất góp vốn').first()).toBeVisible();

    // 3. Test Export Excel on Capital Page
    const exportBtn = page.locator('button', { hasText: 'Xuất Excel' }).first();
    await expect(exportBtn).toBeVisible();
    await exportBtn.click();
    await expect(page.locator('text=Đã xuất thành công file Excel')).toBeVisible({ timeout: 5000 });

    // 4. Test "Ghi nhận góp vốn" Modal
    const recordBtn = page.locator('button', { hasText: 'Ghi nhận góp vốn' }).first();
    await recordBtn.click();

    // Verify Modal Step 1
    await expect(page.locator('text=Bước 1: Chọn Xã viên & Hình thức tài sản')).toBeVisible();

    // Select Land Contribution (QSDĐ)
    const landOption = page.locator('text=Quyền sử dụng đất (QSDĐ)').first();
    await landOption.click();

    // Click Next
    const nextBtn = page.locator('button', { hasText: /Tiếp theo/i }).first();
    await nextBtn.click();

    // Verify Step 2 Land fields
    await expect(page.locator('text=Bước 2: Định giá & Thông tin tài sản góp')).toBeVisible();
    const certNoInput = page.locator('input[placeholder="BD 123456"]').first();
    await expect(certNoInput).toBeVisible();
    await certNoInput.fill('BD 998877');

    const plotInput = page.locator('input[placeholder="Số Thửa"]').first();
    await plotInput.fill('45');

    const sheetInput = page.locator('input[placeholder="Số Tờ"]').first();
    await sheetInput.fill('08');

    // Click Next to Step 3
    const toStep3Btn = page.locator('button', { hasText: /Kiểm tra ranh giới Luật/i }).first();
    await toStep3Btn.click();

    // Verify Step 3: Law 2023 validation
    await expect(page.locator('text=Kết quả kiểm tra Luật HTX 2023')).toBeVisible();
    await expect(page.locator('text=HỢP LỆ')).toBeVisible();

    // Close Modal
    const closeBtn = page.locator('button:has(svg.lucide-x)').first();
    await closeBtn.click();

    // 5. Test Giấy chứng nhận Preview Modal
    const certIconBtn = page.locator('button[title*="Giấy chứng nhận"], button:has(svg.lucide-qr-code)').first();
    if (await certIconBtn.isVisible()) {
      await certIconBtn.click();
      await expect(page.locator('text=GIẤY CHỨNG NHẬN VỐN GÓP').first()).toBeVisible();
      await expect(page.locator('text=Mã QR Tra cứu GCN').first()).toBeVisible();

      // Close cert modal
      const closeCertBtn = page.locator('button', { hasText: /Thoát/i }).first();
      await closeCertBtn.click();
    }
  });

  test('TC3: Cài đặt Hệ thống & Phân quyền RBAC', async ({ page }) => {
    await page.goto('/system/settings');
    await page.waitForLoadState('domcontentloaded');

    // 1. Verify page title
    await expect(page.locator('h1, h2').filter({ hasText: /Cài đặt/i }).first()).toBeVisible();

    // 2. Switch to 'Vai trò & Phân quyền' tab
    const rolesTab = page.locator('button', { hasText: 'Vai trò & Phân quyền' }).first();
    await expect(rolesTab).toBeVisible();
    await rolesTab.click();

    // Verify Roles List appears
    await expect(page.locator('text=Ban Giám Đốc HTX').first()).toBeVisible();

    // 3. Switch to 'Cấu hình nghiệp vụ' tab
    const configTab = page.locator('button', { hasText: 'Cấu hình nghiệp vụ' }).first();
    await expect(configTab).toBeVisible();
    await configTab.click();

    // Verify business parameters card
    await expect(page.locator('text=Cấu hình Nghiệp vụ HTX').first()).toBeVisible();
    await expect(page.locator('text=Vốn góp tối thiểu').first()).toBeVisible();
  });
});
