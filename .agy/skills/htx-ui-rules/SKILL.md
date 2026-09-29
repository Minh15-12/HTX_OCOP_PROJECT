---
name: htx-ui-rules
description: Bắt buộc áp dụng cho mọi tác vụ liên quan đến UI/UX Frontend trong dự án HTX OCOP.
---

# Quy Chuẩn UI/UX và Frontend (HTX OCOP)

Kích hoạt skill này khi bạn thực hiện bất kỳ thay đổi nào liên quan đến Frontend, React components, hoặc UI của dự án HTX OCOP.

## 1. Công nghệ Cốt Lõi
- **React & TypeScript:** Bắt buộc sử dụng TypeScript (không dùng `any`).
- **TailwindCSS:** Sử dụng class Tailwind để styling. Không viết CSS thuần trừ trường hợp đặc biệt.
- **Lucide React:** Sử dụng thư viện `lucide-react` cho toàn bộ biểu tượng (icons).
- **Recharts:** Sử dụng `recharts` cho mọi biểu đồ dữ liệu. Tooltip của biểu đồ phải được custom nền tối (slate-900) chữ sáng, có format tiền tệ `đ` và tỷ lệ `%` nếu là PieChart.

## 2. Responsive (Thích Ứng Di Động)
Tuân thủ nghiêm ngặt mục 122 của `28_FRONTEND_SCREEN_SPECIFICATION.md`:
- **Desktop (>= 1200px):** Hiển thị sidebar đầy đủ, bảng (Table) tiêu chuẩn.
- **Tablet (768–1199px):** Sidebar thu gọn (collapsed) hoặc hiển thị dạng overlay.
- **Mobile (< 768px):** 
  - Bắt buộc biến đổi Table thành dạng Card/List.
  - Các thao tác nằm trong menu `More` (3 chấm) hoặc gom gọn.
  - Form nhập liệu trở thành dạng 1 cột.
  - Tránh tuyệt đối thanh cuộn ngang (horizontal scroll) toàn trang màn hình.

## 3. Typography & Colors
- **Màu sắc:** Sử dụng hệ màu semantic. (Ví dụ: `emerald-600` cho Primary action, `slate-900` cho nền/văn bản chính, `amber-500` hoặc `red-500` cho warning/danger).
- **Trạng thái:** Dùng Status Badge với màu sắc kết hợp text (Không chỉ phụ thuộc vào màu).
- Định dạng tiền tệ: Luôn dùng `.toLocaleString('vi-VN') + ' ₫'`.

## 4. UI Layout Patterns
- **Drawer/Modal:** Các form phức tạp (vd: Ghi nhận vốn góp) hoặc chi tiết (vd: Hồ sơ thành viên) nên được đặt trong Modal hoặc Drawer (rút từ phải sang) để tránh chuyển trang liên tục.
- **Card:** Dùng Card layout (có border `#e7e9ec`, `rounded-xl`, `shadow-subtle`, `bg-white`) để hiển thị số liệu tổng quan (Dashboard KPI).
