## 2026-11-02T16:15:37Z
You are Explorer 2 (Backend & Frontend Architecture, 6-Step Deep Dive & CRUD Matrix) for Milestone 4 (Phân hệ 1: Quản trị HTX & Xã viên).

Your working directory is:
f:/HTX_OCOP_PROJECT/.agents/teamwork/explorer_m4_backend

Mandatory Reference:
Read f:/HTX_OCOP_PROJECT/.agents/teamwork/ORIGINAL_REQUEST.md (especially section ## 2026-11-02T16:11:34Z) before doing anything. Also adhere strictly to f:/HTX_OCOP_PROJECT/AGENT.md, f:/HTX_OCOP_PROJECT/GEMINI.md, and docs/00_RULES_REGISTER.md.

Mission Focus:
1. R2: Vòng lặp kiểm thử nghiệp vụ theo từng phân hệ cuốn chiếu (Iterative Module-by-Module Audit for Module 1).
   - Phân hệ 1 gồm 5 nghiệp vụ chính:
     (1) Hồ sơ pháp lý HTX (Cooperative Profile & Legal Dossier)
     (2) Quản lý Xã viên & Phân loại (Members Management: Chính thức, Liên kết, Chờ duyệt)
     (3) Đại hội thành viên & Biểu quyết (General Assembly, Resolutions, Voting per Luật HTX 2023)
     (4) Sổ vốn điều lệ & Cấp giấy chứng nhận phần vốn góp (Charter Capital & Equity Ledger)
     (5) Kế hoạch Phân phối thặng dư (Surplus Distribution: Quỹ chung không chia >=20%, chia theo dịch vụ >=50%, chia theo vốn góp)
   - Với MỖI nghiệp vụ trong 5 nghiệp vụ trên, thực hiện đầy đủ cấu trúc 6 bước:
     * Bước 1: Danh mục chức năng cụ thể: Backend (API route, Controller, Form Request, Policy, Service) tới Frontend (Page, Table, Drawer, Modal, Action buttons).
     * Bước 2: Ma trận kiểm tra CRUD (Thêm, Xóa, Sửa, Xem chi tiết): xác định rõ vị trí đã có, còn thiếu, hay bị hạn chế theo quy tắc nghiệp vụ.
     * Bước 3: Cơ chế hoạt động & Luồng dữ liệu (Data flow, state management, API request payload, response DTO/Resource, database transaction).
     * Bước 4: Kiểm thử thiếu/sai dữ liệu nhập (Validation rules tại FormRequest và Frontend feedback).
     * Bước 5: Đối chiếu CSDL thực tế (Các bảng PostgreSQL liên quan, primary/foreign keys, tenant isolation cooperative_id, soft-delete status='TERMINATED', audit hash SHA-256).
     * Bước 6: Đánh giá tính khả dụng UX cho nông dân.

Output Requirements:
- Write your complete report with file paths and line numbers to f:/HTX_OCOP_PROJECT/.agents/teamwork/explorer_m4_backend/handoff.md.
- Send a message to the orchestrator when completed with a summary and link to your handoff file.
