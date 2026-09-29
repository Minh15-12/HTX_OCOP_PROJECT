---
name: htx-business-rules
description: Bắt buộc áp dụng cho mọi tác vụ liên quan đến logic dữ liệu, API, và nghiệp vụ HTX OCOP.
---

# Quy Chuẩn Nghiệp Vụ Kinh Doanh (HTX OCOP)

Kích hoạt skill này khi phân tích thiết kế database, xử lý API, cập nhật luồng (workflow).

## 1. Nguyên Tắc Dữ Liệu (Data Integrity)
- **Soft Delete Tuyệt Đối:** Không được sử dụng Hard Delete (xóa vật lý khỏi cơ sở dữ liệu) đối với bất kỳ dữ liệu nghiệp vụ nào (Thành viên, Vật tư, Nhật ký, Lô hàng). Thay vào đó, cập nhật trường `is_deleted = true` hoặc đổi status (vd: `CANCELLED`, `INACTIVE`).

## 2. Quản Trị Vốn Góp (Capital Workflow)
- **3 Chỉ số Cốt lõi:** Vốn cam kết, Vốn thực góp (Đã nộp), Tỷ lệ sở hữu.
- Các giao dịch góp vốn hoặc rút vốn ảnh hưởng trực tiếp đến *Tỷ lệ sở hữu* và quyền biểu quyết của xã viên tại Đại hội đồng.
- Không được phép sửa (update) một Giao dịch (Transaction) đã chốt. Mọi sai sót phải được giải quyết bằng Bút toán điều chỉnh (Adjustment).

## 3. Quy Trình Kho Vật Tư (Inventory Workflow)
- **KCS 3 Cấp:** Gate Check -> Quick Lab -> Final Acceptance.
- **Xuất Kho:** Tuân thủ FEFO (First Expired First Out).
- Hỗ trợ xuất nợ vật tư cho xã viên (Credit Advance) và cấn trừ vào đợt thanh toán mùa vụ thu hoạch.

## 4. Quy Trình Phân Hạng OCOP
- Hệ thống chấm điểm phải tuân thủ nghiêm ngặt khung tính điểm của Quyết định 148/QĐ-TTg.
- Các hạng mục bắt buộc phải có minh chứng (PDF/Image) đính kèm.

## 5. Quy Trình Phê Duyệt (Approval Workflow)
- Hệ thống hỗ trợ đa cấp phê duyệt (Multi-level). Mọi phiếu thu/chi, hồ sơ OCOP đều trải qua trạng thái: `DRAFT -> PENDING_APPROVAL -> APPROVED / REJECTED`.
