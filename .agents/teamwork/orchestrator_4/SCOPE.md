# Scope: Milestone 4 — Toàn diện Đánh giá UI/UX & Đối chiếu CSDL Phân hệ 1: Quản trị HTX & Xã viên

## Architecture
- **Phân hệ mục tiêu**: Module 1 — Quản trị HTX & Xã viên (Identity & Governance, Members, Capital/Equity Ledger, Surplus Distribution, Legal Dossier, Voting/Resolutions).
- **Backend**: Laravel 11 Modular Monolith (Modules/Cooperative, Modules/Member, Modules/Finance, Policies, FormRequests, Migrations, Seeders).
- **Frontend**: React 19, TypeScript, TailwindCSS v4, Zustand stores, React Query, Lucide icons.
- **Database**: PostgreSQL with multi-tenant isolation (`cooperative_id`), soft deletes (`status = 'TERMINATED'`), SHA-256 tamper-evident audit logging (`audit_events`).

## Feature Inventory
| # | Feature | Description | Milestone Subtask | Source |
|---|---------|-------------|-------------------|--------|
| 1 | R1: Duplicate & Detail Bloat Audit | Rà soát component trùng lặp, modal/drawer bloat, trường hiển thị thừa | Subtask 1 | ORIGINAL_REQUEST §R1 |
| 2 | R2: Module 1 6-Step Deep Dive | Phân tích 5 nghiệp vụ: Hồ sơ pháp lý, Xã viên, Đại hội biểu quyết, Sổ vốn điều lệ, Phân phối thặng dư. Kiểm tra BE route, controller, request, policy, FE UI, CRUD matrix, data flow | Subtask 2 | ORIGINAL_REQUEST §R2 |
| 3 | R3: Live Persona Data Entry & DB Integrity | Giả lập 3 persona, 3 kịch bản kiểm thử (Positive, Missing, Constraint failure), kiểm chứng trạng thái thực tế PostgreSQL (balance, soft delete, audit chain) | Subtask 3 | ORIGINAL_REQUEST §R3 |
| 4 | R4: Farmer UX & Layout Polish | Chuẩn hóa bố cục, đánh giá tính khả dụng cho nông dân/cán bộ cơ sở, kiến nghị giải pháp tối ưu | Subtask 1 | ORIGINAL_REQUEST §R4 |
| 5 | Master Report Deliverable | Tổng hợp báo cáo toàn diện vào docs/BAO_CAO_DANH_GIA_UIUX_VA_CSDL_PHAN_HE_1_QUAN_TRI_HTX.md | Subtask 4 | context.md |

## Subtasks Decomposition
| # | Name | Scope | Dependencies | Status |
|---|------|-------|-------------|--------|
| S1 | Explorer 1: UI/UX, Bloat & Farmer Usability (R1 & R4) | Quét toàn bộ Frontend pages/components của Phân hệ 1, tìm component/modal/drawer duplicate, detail bloat, đánh giá UX nông dân | None | IN_PROGRESS |
| S2 | Explorer 2: BE/FE Architecture & CRUD Matrix (R2) | Quét Backend API, Routes, Controllers, Requests, Policies và Frontend tương ứng, lập ma trận CRUD & Data flow 6 bước | None | IN_PROGRESS |
| S3 | Explorer 3: Persona Testing & PostgreSQL Integrity (R3) | Lập và chạy các kịch bản kiểm thử persona (Positive, Missing, Constraint failure), verify CSDL PostgreSQL (soft-delete, constraints, SHA-256) | None | IN_PROGRESS |
| S4 | Master Synthesis & Report Writing | Biên soạn tài liệu báo cáo tổng thể đầy đủ cấu trúc nghiệp vụ theo tài liệu yêu cầu | S1, S2, S3 | PLANNED |
| S5 | Review & Forensic Integrity Verification | Reviewer & Forensic Auditor độc lập nghiệm thu | S4 | PLANNED |

## Interface Contracts & Guidelines
- Tuân thủ Luật Hợp tác xã số 17/2023/QH15.
- Cấm silent mocking tại runtime: Data state phải chân thực (Loading Skeleton, Empty State with Reset, Error with code, Success).
- Tenant isolation nghiêm ngặt (`cooperative_id`).
- Soft delete (`status = 'TERMINATED'`), tuyệt đối không hard delete xã viên có dữ liệu lịch sử.
