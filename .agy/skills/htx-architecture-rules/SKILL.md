---
name: htx-architecture-rules
description: Bắt buộc áp dụng khi cấu trúc file, refactor code, viết API hoặc Frontend components.
---

# Quy Chuẩn Kiến Trúc Mã Nguồn (HTX OCOP)

## 1. Kiến Trúc Frontend (Feature-based)
- Cấu trúc thư mục được chia theo Feature: `src/features/[feature_name]/` (Ví dụ: `features/members`, `features/inventory`).
- Mỗi Feature tự chứa: `components/`, `pages/`, `api/`, `types/`, `hooks/`.
- **Hạn chế cross-import:** Tránh import implementation nội bộ của Feature A vào Feature B. Chỉ giao tiếp thông qua shared components hoặc public interface.
- Nếu một file Component (như Page) lớn hơn 500-800 dòng, bắt buộc phải tách các Modal, Drawer, Table thành các Component nhỏ hơn nằm trong thư mục `components/` của feature đó.

## 2. Trách Nhiệm Của Component
- **React Component:** Chỉ đảm nhiệm việc Render UI, nhận Props, và quản lý Local State.
- Bất kỳ Logic tính toán phức tạp nào (như tính toán điểm số OCOP, tính lãi suất) tuyệt đối không được viết cứng trong Component mà phải được tính từ Backend trả về thông qua API, hoặc đưa vào các Hook/Utility functions riêng.

## 3. Naming Conventions (Frontend & Backend)
- **Components:** `PascalCase` (vd: `MemberTable.tsx`, `CapitalPage.tsx`).
- **Hooks/Functions/Variables:** `camelCase` (vd: `useMembersQuery`, `formatCurrency`, `isLoading`).
- **Constants:** `UPPER_SNAKE_CASE` (vd: `MAX_UPLOAD_SIZE`, `DEFAULT_PAGE_SIZE`).
- Tên API Interface/Types: Dùng `PascalCase` và không thêm tiền tố I hoặc hậu tố Type trừ khi có lý do đặc biệt.

## 4. Xử Lý Lỗi (Error Handling)
- API Validation Errors phải được bóc tách và map trực tiếp với Field trên giao diện thay vì chỉ văng popup lỗi chung chung.
