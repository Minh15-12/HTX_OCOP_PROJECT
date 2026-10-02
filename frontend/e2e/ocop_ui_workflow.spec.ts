import { test, expect } from '@playwright/test';

test.describe('OCOP System & Farmer Usability E2E Workflow', () => {
  test('should display OCOP dossiers list with HTX Tân Tiến & Palermo Sweet Pepper', async ({ page }) => {
    // Navigate to OCOP dossiers page
    await page.goto('/ocop/dossiers');

    // Check title banner
    await expect(page.locator('h1')).toContainText('Quản lý & Số hóa Hồ sơ Đánh giá Phân hạng OCOP');
    await expect(page.body()).toContainText('HTX Dịch vụ Nông nghiệp Tổng hợp Tân Tiến');
    await expect(page.body()).toContainText('Ớt chuông Sweet Palermo Đỏ Đà Lạt');
  });

  test('should inspect dossier detail, 18 criteria matrix, and QĐ 148 export modal', async ({ page }) => {
    // Navigate to dossier detail page
    await page.goto('/ocop/dossiers/DOS-2026-001');

    // Verify main product title
    await expect(page.locator('h1')).toContainText('Ớt chuông Sweet Palermo Đỏ Đà Lạt');
    await expect(page.body()).toContainText('HTX Dịch vụ Nông nghiệp Tổng hợp Tân Tiến');

    // Switch to Criteria Scoring tab
    await page.click('button:has-text("2. Chấm điểm Tiêu chí")');
    await expect(page.body()).toContainText('PHẦN A: SẢN PHẨM & SỨC MẠNH CỘNG ĐỒNG');
    await expect(page.body()).toContainText('Tỷ lệ nguyên liệu địa phương');

    // Open QĐ 148 Document Export Modal
    await page.click('button:has-text("Biểu mẫu QĐ 148")');
    await expect(page.body()).toContainText('PHIẾU ĐĂNG KÝ ĐÁNH GIÁ, PHÂN HẠNG SẢN PHẨM OCOP');
    await expect(page.body()).toContainText('Biểu số 01');

    // Switch tabs inside modal
    await page.click('button:has-text("Biểu số 02")');
    await expect(page.body()).toContainText('BÁO CÁO TỰ ĐÁNH GIÁ SẢN PHẨM OCOP');

    await page.click('button:has-text("Biểu số 03")');
    await expect(page.body()).toContainText('BÁO CÁO ĐÁNH GIÁ CỦA UBND CẤP XÃ');
  });

  test('should verify evidence vault and SHA-256 validation', async ({ page }) => {
    await page.goto('/ocop/dossiers/DOS-2026-001');

    // Switch to Evidence tab
    await page.click('button:has-text("3. Kho Minh chứng số")');
    await expect(page.body()).toContainText('Kho Minh chứng Số OCOP (SHA-256 Validated)');
    await expect(page.body()).toContainText('Giấy chứng nhận VietGAP Ớt chuông HTX Tân Tiến');
    await expect(page.body()).toContainText('SHA-256:');
  });
});
