# AGENT.md — Hướng dẫn cho AI Coding Agent

> **Dự án:** Hệ thống Quản lý Hợp tác xã Nông nghiệp & Số hóa Hồ sơ OCOP  
> **Tên viết tắt:** HTX-OCOP Management System  
> **Cập nhật lần cuối:** 2026-09-25

---

## 1. Mục tiêu & Nội dung Đề tài Chính thức (Kim chỉ nam dự án)

### 1.1. Mục tiêu dự án
- Số hóa hoạt động quản lý hợp tác xã nông nghiệp và quy trình chuẩn bị hồ sơ đánh giá, phân hạng OCOP.
- Quản lý minh bạch xã viên, vùng trồng, vật tư, phân chia lợi nhuận; hỗ trợ chấm điểm, lưu minh chứng và kết xuất hồ sơ chuẩn hóa.

### 1.2. Nội dung đề tài
- Số hóa hoạt động quản lý hợp tác xã nông nghiệp và quy trình chuẩn bị hồ sơ đánh giá, phân hạng OCOP.
- Quản lý minh bạch xã viên, vùng trồng, vật tư, phân chia lợi nhuận; hỗ trợ chấm điểm, lưu minh chứng và kết xuất hồ sơ chuẩn hóa.

### 1.3. Dự kiến kết quả đạt được
- **Hệ thống web quản lý:** Quản lý xã viên, vùng trồng, vật tư và nghiệp vụ HTX.
- **Quy trình OCOP số hóa:** Quy trình chấm điểm OCOP, lưu minh chứng, theo dõi mức độ hoàn thiện.
- **Kết xuất hồ sơ chuẩn hóa:** Chức năng kết xuất hồ sơ PDF/Word và báo cáo quản trị.
- **Bàn giao toàn diện:** Mã nguồn, dữ liệu mẫu, tài liệu vận hành và báo cáo kiểm thử.

### 1.4. Phần mềm và công cụ sử dụng
- **Framework & Công nghệ chính:** React/Vue (Dự án sử dụng: **React + TypeScript + Vite + TailwindCSS**); Laravel/FastAPI (Dự án sử dụng: **Laravel 11 + Sanctum**).
- **Cơ sở dữ liệu:** PostgreSQL 16.
- **Lưu trữ tệp & Minh chứng:** MinIO hoặc lưu trữ tệp tương đương (S3-compatible Object Storage).
- **Công cụ tài liệu:** Công cụ tạo PDF/DOCX theo mẫu quy chuẩn OCOP (QĐ 148/QĐ-TTg).
- **Môi trường & Vận hành:** Docker, Nginx, Git/GitHub.

### 1.5. Kế hoạch triển khai (14 tuần)
- **Tuần 1–2:** Khảo sát quy trình HTX, biểu mẫu và tiêu chí OCOP.
- **Tuần 3:** Mô hình hóa nghiệp vụ, phân quyền, CSDL và kiến trúc.
- **Tuần 4–5:** Phát triển xã viên, vùng trồng và danh mục nền.
- **Tuần 6–7:** Phát triển vật tư, nhật ký giao dịch và phân chia lợi nhuận.
- **Tuần 8–9:** Số hóa tiêu chí OCOP, chấm điểm và quản lý minh chứng.
- **Tuần 10:** Xây dựng luồng duyệt, nhắc việc và nhật ký kiểm toán.
- **Tuần 11:** Kết xuất PDF/Word, báo cáo và thống kê.
- **Tuần 12:** Kiểm thử dữ liệu, bảo mật, sao lưu và phục hồi.
- **Tuần 13:** Triển khai thử nghiệm, hướng dẫn sử dụng.
- **Tuần 14:** Nghiệm thu, trình diễn và hoàn thiện báo cáo.

### 1.6. Phạm vi triển khai & Giới hạn
- **Phạm vi hiện tại:** Quản lý tập trung **1 Hợp tác xã** (Single-Cooperative Scope — lấy mô hình thực tế HTX Nông nghiệp Tân Tiến, Đà Lạt làm mẫu chuẩn với sản phẩm Ớt chuông Sweet Palermo).
- **Khả năng mở rộng:** Database và Backend duy trì thiết kế Multi-tenant (`cooperative_id`), sẵn sàng mở rộng đa HTX khi cần mà không phải tái cấu trúc CSDL.

---

## 2. Kiến trúc Hệ thống

### Technology Stack

| Thành phần | Công nghệ | Phiên bản |
| :--- | :--- | :--- |
| **Backend** | Laravel (PHP) | 11.x (PHP 8.2+) |
| **Frontend** | React + TypeScript + Vite | React 18, Vite 5 |
| **Database** | PostgreSQL | 16 |
| **Authentication** | Laravel Sanctum (Bearer Token) | 4.x |
| **CSS Framework** | TailwindCSS | 3.4 |
| **State Management** | Zustand-like custom stores | — |
| **Data Fetching** | TanStack React Query + Axios | 5.x |
| **Container** | Docker Compose | — |
| **Object Storage** | MinIO (S3-compatible) | — |
| **Queue/Cache** | Redis | 7 |

### Kiến trúc tổng thể

```
┌─────────────────────────────────────────────────────┐
│                   Frontend (React)                  │
│               http://localhost:3000                  │
│  Vite Dev Server → Proxy /api → Backend:8000        │
└────────────────────────┬────────────────────────────┘
                         │ REST API (JSON)
┌────────────────────────▼────────────────────────────┐
│              Backend (Laravel 11)                    │
│            http://localhost:8000                     │
│         API Prefix: /api/v1                         │
│    ┌─────────────────────────────────────┐          │
│    │     Modular Monolith (DDD/Clean)    │          │
│    │  9 Modules × 4 Layers each         │          │
│    └─────────────────────────────────────┘          │
└───────┬──────────────┬──────────────┬───────────────┘
        │              │              │
   PostgreSQL       Redis          MinIO
   (port 5432)    (port 6379)   (port 9000/9001)
```

---

## 3. Cấu trúc Backend (Modular Monolith — DDD/Clean Architecture)

### Nguyên tắc kiến trúc

Backend tuân thủ **Modular Monolith** với **Clean Architecture** (Onion Layers). Mỗi module có 4 layer:

```
Module/
├── Application/     → DTOs, Services (Use Cases, Business Logic)
├── Domain/          → Entities, Enums, ValueObjects (Pure Domain)
├── Infrastructure/  → Persistence (Eloquent Models, Repositories)
└── Presentation/    → Http/ (Controllers, Requests, Resources, Middleware)
```

### 9 Business Modules

| Module | Namespace | Mô tả |
| :--- | :--- | :--- |
| **Identity** | `Modules\Identity` | Users, Roles, Permissions, Auth, System Settings |
| **Cooperative** | `Modules\Cooperative` | Hồ sơ HTX, Xã viên, Vốn góp, Tenant Middleware |
| **Agriculture** | `Modules\Agriculture` | Vùng trồng, Mùa vụ, Nhật ký canh tác, PHI, Thu hoạch, Lô hàng |
| **Product** | `Modules\Product` | Sản phẩm OCOP, Liên kết Lô–Sản phẩm |
| **Inventory** | `Modules\Inventory` | Vật tư, Nhập kho, Xuất kho, Kiểm kê |
| **Finance** | `Modules\Finance` | Thu chi, Công nợ, Thanh toán, Phân chia thặng dư |
| **Ocop** | `Modules\Ocop` | 4 sub-modules: `Criteria`, `Dossier`, `Evaluation`, `Evidence` |
| **Audit** | `Modules\Audit` | Audit logging, Event tracing |
| **Report** | `Modules\Report` | Dashboard, Báo cáo, Xuất hồ sơ PDF & Giấy chứng nhận |

### Shared Layer

```
app/Shared/
├── Application/
│   ├── DTOs/           → Shared Data Transfer Objects
│   └── Responses/      → ApiResponse.php (chuẩn hóa JSON response)
├── Domain/
│   └── Exceptions/     → Domain exception classes
├── Infrastructure/
│   └── Exceptions/     → GlobalExceptionHandler.php
└── Presentation/
    └── Http/
        ├── Controllers/ → HealthController.php
        └── Middleware/   → RequestIdMiddleware.php
```

### Quy tắc quan trọng cho Agent

- **KHÔNG** tự phát minh nghiệp vụ ngoài tài liệu đặc tả.
- **KHÔNG** mở rộng scope, phá vỡ DB schema, API contract hoặc Security design.
- **KHÔNG** hard-code chính sách OCOP (bộ tiêu chí phải linh hoạt, cấu hình qua DB).
- **Bảo vệ** dữ liệu lịch sử — không xóa cứng, sử dụng soft-delete hoặc versioning.
- **Tuân thủ** tenant isolation — mọi query phải scope theo `cooperative_id`.
- **Phân loại thông tin rõ ràng**: `FACT`, `SOURCE`, `PROPOSED`, `TO_VERIFY`, `CONFLICT`, `GAP`.
- Khi có xung đột ảnh hưởng kiến trúc/bảo mật: **STOP → REPORT CONFLICT → ASK**.

---

## 4. Cấu trúc Frontend

### Tổ chức thư mục

```
frontend/src/
├── app/               → App.tsx, providers.tsx (React Query, Router, Toast)
├── components/ui/     → 11 reusable UI components (Button, Card, Modal, DataTable...)
├── features/          → Feature modules (mỗi module có pages/ và components/)
│   ├── auth/          → LoginPage
│   ├── dashboard/     → DashboardPage
│   ├── members/       → MembersPage, CapitalPage, ProfitPage, CoopProfilePage
│   ├── agriculture/   → FarmPlotsPage, CropSeasonsPage, FarmingLogsPage, HarvestsPage, LotTraceabilityPage
│   ├── inventory/     → MaterialsPage, ProductsPage
│   ├── finance/       → FinancePage
│   ├── ocop/          → CriteriaPage, DossiersPage, DossierDetailPage, EvidencesPage, EvaluationsPage, DecisionsPage
│   └── system/        → SystemSettingsPage, AuditPage, ReportsPage + 8 components
├── layouts/           → AppLayout, AuthLayout, Header, Sidebar, Breadcrumb, PageHeader
├── router/            → AppRoutes, ProtectedRoute, GuestRoute, navigation config
├── services/          → apiClient (Axios), memberService, systemService, tokenStorage
├── stores/            → authStore, tenantContextStore
├── types/             → TypeScript interfaces (auth, common, dashboard, inventory, memberTypes, tenant)
└── utils/             → cn (classnames), formatters (VNĐ, ngày tháng), voucherDocumentGenerator
```

### Quy ước Frontend

- **API Client**: Sử dụng `apiClient` (Axios instance) tại `src/services/apiClient.ts`, base URL: `/api/v1`.
- **Authentication**: Bearer token lưu trong `localStorage`, tự động gắn vào header qua interceptor.
- **Routing**: React Router v6 với `ProtectedRoute` (yêu cầu đăng nhập) và `GuestRoute` (chuyển hướng nếu đã đăng nhập).
- **Styling**: TailwindCSS 3.4, utility function `cn()` (clsx + tailwind-merge).
- **Định dạng dữ liệu**: Sử dụng `formatters.ts` — tiền VNĐ, ngày DD/MM/YYYY, đọc số thành chữ tiếng Việt.

---

## 5. Database

- **Engine**: PostgreSQL 16 với extension `pgcrypto` (UUID generation).
- **66 migration files** covering toàn bộ nghiệp vụ.
- **3 Seeders**: `SystemReferenceSeeder`, `CouncilLevelSeeder`, `UserSeeder`.
- **Quan trọng**: Tất cả bảng sử dụng UUID (`uuid` type) làm primary key.

---

## 6. Middleware & Security

| Middleware | Chức năng |
| :--- | :--- |
| `RequestIdMiddleware` | Tạo/chuyển tiếp correlation request ID cho tracing |
| `auth:sanctum` | Xác thực Bearer token |
| `tenant.scope` (`EnforceTenantScope`) | Cô lập dữ liệu theo `cooperative_id`, chặn truy cập cross-tenant |

### Multi-tenant

- Mỗi user thuộc 1 `cooperative_id`.
- Middleware `tenant.scope` tự động scope mọi query theo HTX hiện tại.
- Các role toàn cục (`SYSTEM_ADMIN`, `CRITERIA_ADMIN`, `AUTHORITY`, `AUDITOR`) có thể chuyển tenant context qua header `X-Cooperative-ID`.

---

## 7. Tài liệu Tham khảo

Thư mục `docs/` chứa **35 tài liệu đặc tả** chi tiết. Thứ tự đọc ưu tiên:

| # | File | Nội dung |
| :--- | :--- | :--- |
| 00 | `00_AI_CODING_AGENT_INSTRUCTIONS.md` | **BẮT BUỘC ĐỌC ĐẦU TIÊN** — Quy tắc bắt buộc cho AI Agent |
| 01 | `01_PROJECT_OVERVIEW.md` | Tổng quan dự án |
| 02–04 | `02–04_BUSINESS_*.md` | Bối cảnh, Quy trình, Nghiệp vụ OCOP |
| 05–06 | `05–06_ACTORS_RULES.md` | Vai trò, Quy tắc nghiệp vụ |
| 07–08 | `07–08_REQUIREMENTS.md` | Yêu cầu nghiệp vụ & chức năng |
| 09–10 | `09–10_USE_CASES_DOMAIN.md` | Use cases, Domain Model |
| 11 | `11_DATABASE_DESIGN_FINAL.md` | Thiết kế CSDL |
| 12–13 | `12–13_API_ARCHITECTURE.md` | API Specification, System Architecture |
| 14–16 | `14–16_SECURITY_WORKFLOW.md` | Security, Authorization Matrix, Workflow |
| 17–20 | `17–20_OPENAPI_DB_MIGRATIONS.md` | OpenAPI, DB Implementation, Traceability, Migrations |
| 21–23 | `21–23_BACKEND_*.md` | Backend Project Structure, Coding Standards, Implementation Plan |
| 24–28 | `24–28_FRONTEND_*.md` | Frontend Architecture, Standards, Implementation Plan, UI/UX, Screen Specs |
| 29 | `29_API_ERROR_CATALOG.md` | Danh mục lỗi API chuẩn hóa |
| **30** | **`30_MEMBER_WORKFLOW.md`** | **Quy trình nghiệp vụ: Xã viên, Vốn góp — FSM 5 states, Soft Delete, Credit Limit** |
| **31** | **`31_FARMING_WORKFLOW.md`** | **Quy trình nghiệp vụ: Vùng trồng, PHI Guard, Lot ID GS1, 10 trường TT02/2024** |
| **32** | **`32_INVENTORY_WORKFLOW.md`** | **Quy trình nghiệp vụ: Kho Vật tư, KCS 3 cấp, FEFO/FIFO, Credit Advance** |
| **33** | **`33_FINANCE_WORKFLOW.md`** | **Quy trình nghiệp vụ: Tài chính, Cấn trừ công nợ, Phân chia lợi nhuận** |
| **34** | **`34_OCOP_WORKFLOW.md`** | **Quy trình nghiệp vụ: OCOP QĐ148, Chấm điểm HĐ, Evidence cross-reference** |
| **35** | **`35_APPROVAL_WORKFLOW.md`** | **Quy trình nghiệp vụ: FSM Engine, Audit Hash Chaining SHA-256, Notifications** |

> **Lưu ý:** Files 30–35 là tài liệu quy trình nghiệp vụ chi tiết cho từng module, tổng hợp từ 7 báo cáo nghiên cứu DOCX. Đọc file tương ứng trước khi implement module đó.

---

## 8. Các lệnh thường dùng

### Backend

```bash
# Chạy server phát triển
cd backend
php artisan serve --host=127.0.0.1 --port=8000

# Migration
php artisan migrate
php artisan migrate:fresh --seed    # Reset toàn bộ DB + seed data

# Seed data
php artisan db:seed

# Chạy tests
php artisan test
./vendor/bin/phpunit

# Code style
./vendor/bin/pint                   # Laravel Pint (PHP CS Fixer)

# Static analysis
./vendor/bin/phpstan analyse
```

### Frontend

```bash
# Cài đặt dependencies
cd frontend
npm install

# Chạy server phát triển
npm run dev                         # http://localhost:3000

# Build production
npm run build

# Lint
npm run lint
```

### Docker (Tùy chọn)

```bash
cd backend
docker-compose up -d                # Khởi chạy toàn bộ stack
docker-compose down                 # Dừng tất cả containers
```

---

## 9. Tài khoản Test mặc định

Mật khẩu chung: `password123`

| Username | Vai trò | Email |
| :--- | :--- | :--- |
| `admin` | HTX_OWNER | admin@htxphuthinh.vn |
| `admin_htx` | HTX_OWNER | admin_htx@htxphuthinh.vn |
| `ketoan01` | HTX_STAFF | ketoan@htxphuthinh.vn |
| `nvhtx01` | HTX_STAFF | nvhtx@htxphuthinh.vn |
| `truongnhom01` | HTX_STAFF | truongnhom@htxphuthinh.vn |
| `thanhvien01` | HTX_STAFF | thanhvien@htxphuthinh.vn |
| `danhgia01` | EVALUATOR | danhgia@htxphuthinh.vn |

---

## 10. Khuyến nghị Áp dụng Skill theo Loại Công việc

> **Lưu ý:** Các skill dưới đây được cài đặt ở cấp người dùng (`~/.gemini/config/skills/`), không nằm trong repository. Nên áp dụng nếu môi trường có sẵn skill tương ứng.

### Bảng Mapping Skill → Công việc

| Loại công việc | Skill khuyến nghị | Khi nào kích hoạt |
| :--- | :--- | :--- |
| Bắt đầu feature mới, yêu cầu mơ hồ | **`spec-driven-planning`** | Khi nhận yêu cầu chưa rõ ràng, cần phân tích và lập đặc tả kỹ thuật trước khi code |
| Feature phức tạp, nhiều bước | **`task-decomposition-and-atomic-workflow`** | Khi feature ảnh hưởng nhiều module, cần chia nhỏ thành micro-task và commit từng bước |
| Viết code mới / Refactor code | **`clean-code-and-refactoring`** | Khi tạo file mới, refactor module, hoặc code review — đảm bảo DRY, SOLID, naming conventions |
| Viết code mới (bổ sung) | **`karpathy-guidelines`** | Bổ trợ cho clean-code — ưu tiên đơn giản, suy nghĩ trước khi code, thay đổi phẫu thuật chính xác |
| Thiết kế / Chỉnh sửa giao diện | **`modern-ui-design`** | Khi tạo trang mới, sửa layout, styling component — áp dụng visual hierarchy, micro-animations |
| Viết test / TDD workflow | **`test-driven-development`** | Khi viết unit test, integration test, hoặc áp dụng quy trình Red → Green → Refactor |
| Debug lỗi, fix bug | **`systematic-debugging`** | Khi gặp lỗi runtime, logic bug, build failure — phân tích root cause có hệ thống |

### Quy trình Khuyến nghị cho Feature Mới

Khi triển khai một feature mới trong dự án, nên áp dụng skill theo thứ tự:

```
1. spec-driven-planning              → Phân tích yêu cầu, lập đặc tả kỹ thuật
       ↓
2. task-decomposition-and-atomic     → Chia nhỏ thành micro-tasks, tạo branch
       ↓
3. test-driven-development           → Viết test trước cho từng task
       ↓
4. clean-code + karpathy-guidelines  → Viết code sạch, đơn giản, đúng chuẩn
       ↓
5. modern-ui-design                  → Áp dụng cho phần giao diện (nếu có)
       ↓
6. systematic-debugging              → Khi gặp lỗi trong quá trình phát triển
```

### Ví dụ Áp dụng Cụ thể trong Dự án

| Tình huống thực tế | Skill nên dùng |
| :--- | :--- |
| Thêm module Quản lý Hợp đồng mới vào Backend | `spec-driven-planning` → `task-decomposition` → `clean-code` |
| Sửa lỗi phân quyền tenant không đúng | `systematic-debugging` |
| Refactor `memberService.ts` (34K lines) thành nhiều file nhỏ | `clean-code-and-refactoring` + `karpathy-guidelines` |
| Tạo trang Dashboard mới với biểu đồ | `modern-ui-design` + `clean-code` |
| Viết test cho API `/ocop/applications` | `test-driven-development` |
| Nhận yêu cầu "làm chức năng xuất báo cáo Excel" chưa có spec | `spec-driven-planning` → `task-decomposition` |

---

## 11. Quy tắc Nghiệp vụ Cốt lõi (Key Business Rules & Guardrails)

Dưới đây là các quy tắc nghiệp vụ quan trọng nhất được tổng hợp từ 7 báo cáo nghiên cứu thực tế và bộ 6 tài liệu quy trình `30–35`. AI Agent **BẮT BUỘC** phải tuân thủ khi triển khai code/logic:

### 11.1. Nông nghiệp & An toàn Thực phẩm (`Modules\Agriculture`)
- **PHI Guard (Pre-Harvest Interval):**
  - Công thức: `safe_harvest_date = spray_date + PHI_days`
  - **Bắt buộc chặn thu hoạch** nếu `harvest_date < safe_harvest_date` (Error code: `ERR_HARVEST_PHI_VIOLATION`). Tuyệt đối không cho phép bù trừ hoặc chỉ hiển thị cảnh báo đơn thuần.
- **Truy xuất nguồn gốc (Thông tư 02/2024/TT-BNNPTNT):**
  - Nhật ký canh tác bắt buộc lưu đủ 10 trường: Tên hoạt động, Ngày thực hiện, Mã thửa đất, Mã mùa vụ, Mã vật tư/SKU, Số lô vật tư, Khối lượng/Liều lượng, Số ngày PHI, Tọa độ GPS, Hình ảnh/Chứng minh.
- **Mã Lot ID chuẩn GS1:**
  - Định dạng: `LOT-[CoopCode]-[PlotCode]-[YYYYMMDD]-[Seq]` (ví dụ: `LOT-TT-P001-20260925-01`).
- **KCS Thu hoạch & Nhập kho 3 cấp:**
  - `Level 1 - Gate Check`: Kiểm tra thời gian cách ly PHI và nguồn gốc Lot ID.
  - `Level 2 - Quick Lab`: Kiểm tra dư lượng hóa chất / hoạt chất cấm.
  - `Level 3 - Grading`: Phân loại chất lượng nông sản (Grade A: Premium ≥90% đồng đều, Brix ≥7° / Grade B: Standard / Reject: Không đạt an toàn).

### 11.2. Vật tư, Kho & Tài chính (`Modules\Inventory`, `Modules\Finance`)
- **Cơ chế Xuất nợ Đầu vụ (Credit Advance):**
  - Xã viên được ứng vật tư đầu vụ trả chậm cuối vụ dựa trên trần tín dụng (Credit Limit). Lãi suất nội bộ 0% cho xã viên chính thức.
- **Công thức Cấn trừ Công nợ Quyết toán Mùa vụ:**
  - `V_total = V_gradeA * P_A + V_gradeB * P_B` (Tổng giá trị thu mua nông sản)
  - `Fee = V_total * r` (Phí dịch vụ HTX, r = 2%–3% cấu hình)
  - `D = min(D_debt, V_total - Fee)` (Số nợ vật tư được cấn trừ trong kỳ)
  - `P_net = V_total - Fee - D` (Số tiền thực trả cho xã viên)
  - Nếu `D_debt > V_total - Fee`, số nợ chưa cấn trừ còn lại tự động kết chuyển sang kỳ sau, tuyệt đối không xóa nợ.
- **Phương pháp xuất kho:** Ưu tiên **FEFO** (First Expired, First Out) đối với phân bón/BVTV/hạt giống có hạn sử dụng; dùng **FIFO** cho vật tư không có hạn sử dụng.

### 11.3. Quản trị Xã viên & Lợi nhuận (`Modules\Cooperative`)
- **Vòng đời Xã viên (FSM 5 Trạng thái):**
  - `PROSPECTIVE` → `ACTIVE` → `SUSPENDED` → `LEAVING` → `TERMINATED`.
  - **Bắt buộc Soft Delete:** Dữ liệu xã viên đã nghỉ việc/chuyển đi tuyệt đối không xóa cứng (Hard Delete) khỏi database để bảo toàn lịch sử giao dịch tài chính, vốn góp và truy xuất nguồn gốc.
- **Phân chia thặng dư cuối năm (Quy tắc 30/70):**
  - Trích tối thiểu 5% Quỹ phát triển sản xuất không chia.
  - Thặng dư còn lại: chia 30% theo tỷ lệ Vốn góp (`capital_share`), 70% theo Mức độ sử dụng dịch vụ HTX (`service_usage_volume`).

### 11.4. Hồ sơ OCOP & Quy trình Phê duyệt (`Modules\Ocop`, Phân hệ Phê duyệt)
- **Bộ tiêu chí OCOP (Quyết định 148/QĐ-TTg):**
  - Tổng 100 điểm (Phần A: Sản phẩm & Cộng đồng 40đ, Phần B: Tiếp thị 25đ, Phần C: Chất lượng 35đ).
  - Tiêu chí phải cấu hình linh hoạt qua Database (Version Control), không hard-code vào source code.
  - Tự động liên kết dữ liệu minh chứng (Evidence Cross-Reference) từ Nhật ký canh tác, Phiếu thu mua, Hồ sơ xã viên.
- **Approval Engine & Audit Trail:**
  - Engine Phê duyệt Đa cấp (FSM Engine 4 cấp: Trưởng nhóm → Kế toán → Giám đốc → Hội đồng) hỗ trợ ủy quyền và tự động leo thang khi hết hạn (timeout escalation).
  - **Hash Chaining SHA-256:** Nhật ký kiểm toán (Audit Log) sử dụng cơ chế nối chuỗi băm `hash_n = SHA256(hash_{n-1} + data_n)` đảm bảo dữ liệu lịch sử không thể bị sửa đổi hay loại bỏ trái phép.

