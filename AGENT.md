# AGENT.md — Hướng dẫn cho AI Coding Agent

> **Dự án:** Hệ thống Quản lý Hợp tác xã Nông nghiệp & Số hóa Hồ sơ OCOP  
> **Tên viết tắt:** HTX-OCOP Management System  
> **Cập nhật lần cuối:** 2026-10-25  
> ⚠️ **QUY TẮC BẮT BUỘC:** Mỗi khi trả lời câu hỏi của người dùng hoặc viết code, AI Agent **BẮT BUỘC** phải đọc và tuân thủ các chỉ dẫn trong file này (`AGENT.md`), [`README.md`](./README.md) và [`docs/00_RULES_REGISTER.md`](./docs/00_RULES_REGISTER.md). Tuyệt đối không suy đoán nghiệp vụ, không sử dụng silent mocking hay dữ liệu giả lập đè lên dữ liệu thật ở runtime, và tuân thủ kiến trúc Clean Code / Modular.

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

### 1.7. Ranh giới chức năng OCOP & Các module ngoài phạm vi (Scope Boundaries)
- **Hệ thống phục vụ Chủ thể HTX** chuẩn bị hồ sơ OCOP theo Quyết định 148/QĐ-TTg và QĐ 1489/QĐ-TTg.
- **3 module sau NẰM NGOÀI PHẠM VI CỐT LÕI và mặc định BỊ ẨN trên thanh điều hướng Sidebar:**
  1. `Đại hội & Biểu quyết` (`/meetings`): Quản trị nội bộ chuyên sâu của HTX, không thuộc chuỗi tạo lập hồ sơ minh chứng OCOP.
  2. `Hội đồng thẩm định` (`/ocop/evaluation`): Thuộc thẩm quyền Cơ quan quản lý Nhà nước (UBND huyện/tỉnh). HTX chỉ thực hiện "Tự đánh giá nội bộ".
  3. `Quyết định & Cấp sao` (`/ocop/decisions`): Thẩm quyền ban hành Quyết định công nhận và cấp Giấy chứng nhận thuộc Chủ tịch UBND cấp huyện/tỉnh, HTX không có quyền tự cấp sao.
- **Quy tắc bắt buộc cho AI Agent ở mọi phiên làm việc mới:**
  - AI Agent tuyệt đối **KHÔNG tự ý hiển thị lại** 3 module này nếu không có yêu cầu từ người dùng.
  - **Khôi phục khi cần:** Đổi `isOutOfScopeModulesEnabled()` trả về `true` trong `frontend/src/router/navigation.ts` hoặc set `localStorage.setItem('htx_ocop_enable_out_of_scope_modules', 'true')`.

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
| Đặc tả giao diện & Đồng bộ Backend | **`domain-driven-ui-spec`** | Soi backend contract (routes/requests/enums/resources), phân loại 5 archetypes, loại bỏ card thừa, xử lý backend gap, chốt đủ CRUD và data matrix |
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
5. domain-driven-ui-spec             → Soi backend, xác định archetype, CRUD, data matrix & states
       ↓
6. modern-ui-design                  → Hoàn thiện styling, visual hierarchy, responsive
       ↓
7. systematic-debugging              → Khi gặp lỗi trong quá trình phát triển
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
- **Truy xuất nguồn gốc (TCVN 12850:2019 & VietGAP TCVN 11892-1:2017):**
  - Nhật ký canh tác bắt buộc lưu đủ 10 trường theo chuẩn thực địa: Tên hoạt động, Ngày thực hiện, Mã thửa đất, Mã mùa vụ, Mã vật tư/SKU, Số lô vật tư, Khối lượng/Liều lượng, Số ngày PHI, Tọa độ GPS, Hình ảnh/Chứng minh. *(Lưu ý: Không nhầm lẫn với Thông tư 02/2024/TT-BNNPTNT vốn quy định về phòng chống tham nhũng/người thôi giữ chức vụ)*.
- **Mã Lot ID chuẩn GS1:**
  - Định dạng: `LOT-[CoopCode]-[PlotCode]-[YYYYMMDD]-[Seq]` (ví dụ: `LOT-TT-P001-20260925-01`).
- **KCS Thu hoạch & Nhập kho 3 cấp:**
  - `Level 1 - Gate Check`: Kiểm tra thời gian cách ly PHI và nguồn gốc Lot ID.
  - `Level 2 - Quick Lab`: Kiểm tra dư lượng hóa chất / hoạt chất cấm.
  - `Level 3 - Grading`: Phân loại chất lượng nông sản (Grade A: Premium ≥90% đồng đều, Brix ≥7° / Grade B: Standard / Reject: Không đạt an toàn).

### 11.2. Vật tư, Kho & Tài chính (`Modules\Inventory`, `Modules\Finance`)
- **Cơ chế Xuất nợ Đầu vụ (Credit Advance - Quy chế HTX):**
  - Xã viên được ứng vật tư đầu vụ trả chậm cuối vụ dựa trên trần tín dụng (Credit Limit). Lãi suất nội bộ 0% cho xã viên chính thức.
- **Công thức Cấn trừ Công nợ Quyết toán Mùa vụ (Quy chế HTX):**
  - `V_total = V_gradeA * P_A + V_gradeB * P_B` (Tổng giá trị thu mua nông sản)
  - `Fee = V_total * r` (Phí dịch vụ HTX, r = 2%–3% cấu hình linh hoạt theo hợp đồng dịch vụ HTX)
  - `D = min(D_debt, V_total - Fee)` (Số nợ vật tư được cấn trừ trong kỳ)
  - `P_net = V_total - Fee - D` (Số tiền thực trả cho xã viên)
  - Nếu `D_debt > V_total - Fee`, số nợ chưa cấn trừ còn lại tự động kết chuyển sang kỳ sau, tuyệt đối không xóa nợ.
- **Phương pháp xuất kho:** Ưu tiên **FEFO** (First Expired, First Out) đối với phân bón/BVTV/hạt giống có hạn sử dụng; dùng **FIFO** cho vật tư không có hạn sử dụng.

### 11.3. Quản trị Xã viên & Lợi nhuận (`Modules\Cooperative`)
- **Vòng đời Xã viên (FSM 5 Trạng thái):**
  - `PROSPECTIVE` → `ACTIVE` → `SUSPENDED` → `LEAVING` → `TERMINATED`.
  - **Bắt buộc Soft Delete:** Dữ liệu xã viên đã nghỉ việc/chuyển đi tuyệt đối không xóa cứng (Hard Delete) khỏi database để bảo toàn lịch sử giao dịch tài chính, vốn góp và truy xuất nguồn gốc.
- **Phân chia thặng dư cuối năm (Luật HTX 2023 & Điều lệ HTX):**
  - Trích tối thiểu 5% Quỹ chung không chia (khoản 1 Điều 84 Luật HTX 2023).
  - Thặng dư nội bộ còn lại: Tối thiểu 51% phân phối theo mức độ sử dụng dịch vụ HTX (Điều 85 Luật HTX 2023). Cụ thể HTX Tân Tiến cấu hình theo Điều lệ: 70% mức độ sử dụng dịch vụ (`service_usage_volume`), 30% tỷ lệ Vốn góp (`capital_share`) (hoặc 50/50 tùy quyết định Đại hội).

### 11.4. Hồ sơ OCOP & Quy trình Phê duyệt (`Modules\Ocop`, Phân hệ Phê duyệt)
- **Bộ tiêu chí OCOP (Quyết định 148/QĐ-TTg & QĐ 1489/QĐ-TTg sửa đổi bổ sung năm 2025):**
  - Tổng 100 điểm (Phần A: Sản phẩm & Cộng đồng 40đ, Phần B: Tiếp thị 25đ, Phần C: Chất lượng 35đ).
  - Theo dõi cả văn bản gốc QĐ 148 và văn bản sửa đổi bổ sung QĐ 1489 (thẩm quyền, quy trình đánh giá và tiêu chí điều chỉnh).
  - Tiêu chí phải cấu hình linh hoạt qua Database (`criteria_versions`), không hard-code vào source code.
  - Tự động liên kết dữ liệu minh chứng (Evidence Cross-Reference) từ Nhật ký canh tác, Phiếu thu mua, Hồ sơ xã viên.
- **Approval Engine & Audit Trail:**
  - Engine Phê duyệt Đa cấp (FSM Engine 4 cấp: Trưởng nhóm → Kế toán → Giám đốc → Hội đồng) hỗ trợ ủy quyền và tự động leo thang khi hết hạn (timeout escalation).
  - **Hash Chaining SHA-256:** Nhật ký kiểm toán (Audit Log) sử dụng cơ chế nối chuỗi băm `hash_n = SHA256(hash_{n-1} + data_n)` kết hợp Transaction DB và kiểm tra đứt gãy chuỗi để phát hiện sai lệch.

### 11.5. In ấn, Xuất biểu mẫu & Toàn vẹn Dữ liệu hiển thị (`R-SYS-011`, `R-SYS-012`)
- **Đa phương thức In/Xuất chứng từ cho mọi thiết bị (`R-SYS-011`):**
  - Khi thiết kế bất kỳ chức năng in ấn hoặc xuất biểu mẫu, chứng từ kế toán/nông nghiệp (Mẫu 02-VT, phiếu nhập/xuất kho, sổ quỹ, báo cáo OCOP, hợp đồng bao tiêu, v.v.), **bắt buộc phải tính đến trường hợp người dùng sử dụng thiết bị khác không có máy in** (laptop cá nhân, máy tính bảng, điện thoại).
  - Tuyệt đối cấm chỉ cung cấp duy nhất nút in trình duyệt `window.print()`. Bắt buộc cung cấp đủ 3 phương án:
    1. **In trực tiếp (Print Preview / `window.print()`)**: Dành cho máy tính văn phòng kết nối trực tiếp máy in.
    2. **Tải file PDF (.pdf)**: Dành cho laptop, di động lưu trữ ngoại tuyến, ký số hoặc gửi qua Zalo/Email.
    3. **Tải file Excel / CSV (.xlsx / .csv)**: Dành cho kế toán, cán bộ HTX tải về laptop để đối soát, tính toán số liệu.
- **Toàn vẹn hiển thị văn bản dài & Chống cắt cụt dấu ba chấm (`...`) trên chứng từ (`R-SYS-012`):**
  - Dữ liệu HTX và nông nghiệp có nhiều trường văn bản rất dài (tên vật tư kèm hoạt chất/nồng độ, tên xã viên kèm mã số, địa chỉ thôn xóm chi tiết, nhật ký ghi chú canh tác, số tiền lớn).
  - Tuyệt đối cấm dùng các class cắt cụt như `truncate`, `overflow-hidden`, `text-ellipsis` trên các biểu mẫu in, chứng từ kế toán, phiếu xuất kho hoặc modal xem trước chứng từ khiến người dùng hoặc cơ quan thanh tra không đọc được đầy đủ dữ liệu.
  - Bắt buộc áp dụng: `break-words`, `whitespace-normal`, cấu hình độ rộng cột tối thiểu (`min-w-[...]`) và co giãn theo nội dung; kiểm soát `@media print` ngắt trang an toàn (`break-inside-avoid`, `page-break-inside: avoid`, lặp lại `thead` qua các trang in `display: table-header-group`).

---

## 12. Trụ Cột IV: Quy Tắc Kỹ Thuật Lập Trình Bắt Buộc cho AI Coding Agent

**Phạm vi:** Backend Laravel, frontend React/TypeScript (nếu phù hợp với stack thực tế), PostgreSQL, API, kiểm thử, bảo mật và tích hợp hệ thống HTX/OCOP.

> **Tài liệu tham chiếu gốc:** [`docs/00_RULES_REGISTER.md`](./docs/00_RULES_REGISTER.md) và [`docs/38_QUY_TAC_KY_THUAT_LAP_TRINH_AI_AGENT.md`](./docs/38_QUY_TAC_KY_THUAT_LAP_TRINH_AI_AGENT.md).

### 0. Ba Nguyên Tắc Bắt Buộc Đặc Biệt Khi Triển Khai
- **Nguyên tắc A: Cô lập Tenant toàn diện — không chỉ kiểm tra ở Controller:** Kiểm soát `cooperative_id` xuyên suốt Data Access (Eloquent Scope, Repository), quan hệ lồng (`with`, `whereHas`), hàng đợi (Queue Jobs) và tác vụ xuất file (Export). Chống rò rỉ dữ liệu chéo HTX.
- **Nguyên tắc B: Kiểm chứng toàn vẹn nghiệp vụ & dữ liệu — không coi test thành công là bằng chứng duy nhất:** Mã HTTP 200 hay test pass không đồng nghĩa với nghiệp vụ đã đúng. Bắt buộc kiểm tra trạng thái CSDL thực tế: số dư sổ quỹ, biến động tồn kho (chống trừ lặp), cấn trừ công nợ và chuỗi băm audit SHA-256.
- **Nguyên tắc C: Thay đổi phẫu thuật, thu hẹp bán kính tác động — cấm refactor toàn bộ dự án khi chỉ cần sửa một chức năng:** Ưu tiên thay đổi nhỏ nhất có thể (Surgical Change), cô lập nguyên nhân gốc, dễ kiểm thử, dễ xem xét và an toàn khi hoàn tác (rollback). Tuyệt đối không viết lại các module backend đang vận hành ổn định.

### 1. Nguyên tắc ưu tiên và xử lý xung đột
1. Không sửa mã nguồn trước khi đọc hướng dẫn Agent, kiến trúc, SRS, business rules, database design, API specification, sổ đăng ký quy tắc `docs/00_RULES_REGISTER.md` và các tệp liên quan trực tiếp đến chức năng cần thực hiện.
2. Thứ tự ưu tiên khi đối chiếu (Documentation Hierarchy):
   - Pháp luật và tiêu chuẩn chính thức đã được xác minh, còn áp dụng (theo dõi cả văn bản gốc và văn bản sửa đổi bổ sung).
   - Yêu cầu nghiệp vụ đã được chủ dự án phê duyệt.
   - Sổ đăng ký quy tắc `docs/00_RULES_REGISTER.md`, SRS, business rules và các đặc tả hệ thống đã thống nhất.
   - Kiến trúc và quy ước kỹ thuật của repository (`AGENTS.md`, `AGENT.md`, `docs/38_...`).
   - Đề xuất tối ưu của Agent.
3. Nếu hai nguồn mâu thuẫn hoặc thiếu căn cứ, không tự ý chọn một nguồn rồi triển khai. Ghi nhận nội dung mâu thuẫn, tác động, nguồn liên quan và phương án đề xuất để yêu cầu người dùng xác minh.
4. Không được tự phát minh công thức tài chính, quy tắc phân quyền, trường dữ liệu, enum, endpoint hoặc quy trình pháp lý.
5. Mọi giả định chưa được xác nhận phải được ghi rõ là giả định, không được trình bày như yêu cầu đã phê duyệt.
6. Phân biệt rạch ròi giữa quy định pháp luật nhà nước và quy chế nội bộ HTX (ví dụ: phí dịch vụ 2-3%, trần tín dụng, chuẩn cảm quan độ ngọt Brix là quy chế nội bộ HTX, không gắn nhãn "theo luật").

### 2. Quy tắc kiểm tra repository trước khi thay đổi
1. Kiểm tra cấu trúc thư mục, stack, phiên bản framework, package, route, migration, model, service, controller, test và các thay đổi Git hiện có.
2. Tái sử dụng kiến trúc và thành phần hiện có nếu chúng đáp ứng yêu cầu. Không tạo module, service hoặc component trùng chức năng.
3. Trước khi sửa, xác định:
   - Vấn đề thực tế.
   - Nguyên nhân gốc.
   - Các thành phần phụ thuộc.
   - Những chức năng có thể bị ảnh hưởng.
   - Cách kiểm chứng sau sửa.
4. Không ghi đè hoặc xóa thay đổi của người dùng, không tự ý khôi phục file về phiên bản cũ.
5. Không xóa mã nguồn chỉ vì chưa được sử dụng trực tiếp mà chưa kiểm tra các tham chiếu, route, job, test và luồng nghiệp vụ phụ thuộc.

### 3. Quy tắc kiến trúc và tổ chức mã nguồn
1. Tuân thủ kiến trúc hiện có; với backend áp dụng ranh giới Domain, Application, Infrastructure và Presentation theo tài liệu dự án.
2. Controller chỉ tiếp nhận yêu cầu, kiểm tra đầu vào thông qua cơ chế phù hợp, điều phối nghiệp vụ và trả response. Không đặt công thức nghiệp vụ phức tạp trực tiếp trong Controller.
3. Không để frontend truy cập cơ sở dữ liệu hoặc gọi trực tiếp các thành phần nội bộ của backend.
4. Không để Domain phụ thuộc vào Controller, HTTP Request, Eloquent hoặc thành phần giao diện.
5. Mỗi module cần có ranh giới trách nhiệm rõ ràng. Chỉ tạo interface, repository, service hoặc abstraction khi có giá trị thực tế; tránh tạo quá nhiều lớp trung gian không cần thiết.
6. Không tạo tệp/component quá lớn một cách không kiểm soát. Mốc 400 dòng là ngưỡng cần xem xét tách nhỏ, không phải lý do để chia mã một cách máy móc.
7. Tránh copy-paste nghiệp vụ. Logic dùng chung phải có một nguồn triển khai đáng tin cậy.
8. Không sử dụng biến toàn cục, singleton có trạng thái thay đổi hoặc side effect ẩn nếu không có lý do kiến trúc rõ ràng.

### 4. Quy tắc thiết kế API và hợp đồng dữ liệu
1. Mọi endpoint phải có mục đích, quyền truy cập, phương thức HTTP, định dạng request/response và quy tắc lỗi rõ ràng.
2. Backend là nguồn xác thực cuối cùng đối với dữ liệu nghiệp vụ. Validation ở frontend chỉ hỗ trợ trải nghiệm người dùng.
3. Dùng Form Request hoặc cơ chế validation tương đương; không chỉ kiểm tra dữ liệu bằng điều kiện thủ công rải rác trong Controller.
4. Không trả trực tiếp toàn bộ Eloquent Model hoặc các trường nội bộ không được phép công khai. Dùng API Resource hoặc DTO theo kiến trúc dự án.
5. Chuẩn hóa cấu trúc response, phân trang, bộ lọc, sắp xếp và định dạng lỗi theo API contract.
6. Mã HTTP phải phù hợp với kết quả xử lý. Lỗi validation, authentication, authorization, tài nguyên không tồn tại và xung đột nghiệp vụ phải phân biệt được.
7. Không nuốt exception hoặc trả thành công giả khi nghiệp vụ thất bại.
8. Không tự ý đổi tên field, enum, cấu trúc response hoặc URL endpoint mà không cập nhật tài liệu, frontend và test liên quan.
9. Với endpoint có thể được gọi lại nhiều lần, đặc biệt là thanh toán, quyết toán, nhập/xuất kho và phân phối lợi nhuận, phải xem xét idempotency hoặc cơ chế chống xử lý trùng phù hợp.
10. Không sử dụng HTTP GET để thay đổi trạng thái dữ liệu.

### 5. Quy tắc cơ sở dữ liệu và tính toàn vẹn
1. Mọi bảng nghiệp vụ đa HTX phải có cơ chế xác định tenant rõ ràng theo thiết kế. **Không chỉ kiểm tra tenant ở Controller**: Truy vấn bị thiếu điều kiện tenant có thể làm lộ dữ liệu của HTX khác qua API, báo cáo, file xuất, job nền hoặc quan hệ dữ liệu. Bắt buộc kiểm soát tại tầng Data Access (Eloquent Global Scope, Repository), Policy, các truy vấn quan hệ (`with`, `whereHas`), hàng đợi (Queue Jobs) và xuất file (Export).
2. Không chỉ dựa vào `cooperative_id` do client gửi. Tenant phải được xác định và xác thực từ ngữ cảnh đăng nhập hoặc cơ chế được hệ thống tin cậy.
3. Sử dụng foreign key, unique constraint, check constraint và index khi phù hợp để bảo vệ tính toàn vẹn tại cơ sở dữ liệu.
4. Không dùng dữ liệu đầu vào chưa được kiểm tra làm căn cứ cho các phép tính tài chính hoặc thay đổi tồn kho.
5. Dùng transaction cho nghiệp vụ nhiều bước cần bảo đảm tất cả thành công hoặc tất cả thất bại.
6. Kiểm soát tranh chấp khi nhiều người cùng duyệt phiếu, cập nhật tồn kho, chốt mùa vụ hoặc thực hiện phân phối lợi nhuận. Sử dụng khóa, điều kiện cập nhật hoặc cơ chế đồng bộ phù hợp.
7. Không giả định rằng kiểm tra tồn kho trước khi ghi là đủ để ngăn tồn kho âm trong môi trường đồng thời.
8. Migration phải có khả năng triển khai có kiểm soát, tránh làm mất dữ liệu. Với thay đổi phá vỡ tương thích, ưu tiên chiến lược mở rộng rồi chuyển đổi rồi mới loại bỏ.
9. Không sửa migration đã chạy ở môi trường có dữ liệu để âm thầm thay đổi lịch sử. Tạo migration mới trừ khi môi trường và quy trình dự án cho phép rõ ràng.
10. Không chạy lệnh xóa dữ liệu, reset database hoặc seed ghi đè dữ liệu thật nếu chưa được cho phép rõ ràng.
11. Lưu thời gian theo quy ước thống nhất của hệ thống; xử lý múi giờ khi hiển thị và khi tính ngày nghiệp vụ.
12. Sử dụng kiểu dữ liệu chính xác cho tiền tệ và số lượng. Không dùng số thực nhị phân để thực hiện phép tính tiền cần độ chính xác kế toán.

### 6. Quy tắc bảo mật và phân quyền
1. Mọi endpoint phải xác thực người dùng và kiểm tra quyền trên tài nguyên cụ thể.
2. Không được xem việc ẩn nút trên frontend là biện pháp phân quyền.
3. Kiểm thử truy cập chéo tenant bằng cách thử dùng ID của tài nguyên thuộc HTX khác.
4. Không tin tưởng ID, role, tenant ID, giá tiền, điểm đánh giá hoặc trạng thái phê duyệt do client tự gửi.
5. Không lưu mật khẩu dạng văn bản thuần, token bí mật hoặc thông tin xác thực trong mã nguồn.
6. Không ghi mật khẩu, token, thông tin nhạy cảm hoặc toàn bộ dữ liệu cá nhân vào log.
7. Kiểm tra upload file: loại nội dung, kích thước, quyền truy cập, tên lưu trữ và đường dẫn. Không chỉ dựa vào phần mở rộng của file.
8. Không cho phép truy cập file minh chứng riêng tư chỉ bằng cách biết URL hoặc tên file.
9. Chống mass assignment, SQL injection, XSS, CSRF và các rủi ro phù hợp với phương thức xác thực, framework và kiến trúc thực tế.
10. Không cho phép người tạo tự duyệt giao dịch nếu quy tắc phân tách trách nhiệm yêu cầu người duyệt độc lập.
11. Mọi thay đổi quyền, trạng thái tài chính, điểm OCOP và khóa sổ phải có kiểm soát quyền và audit trail thích hợp.
12. Không coi việc sử dụng SHA-256 hoặc hash chain là đủ để bảo đảm audit log bất biến nếu tài khoản có quyền vẫn có thể sửa hoặc xóa dữ liệu gốc.

### 7. Quy tắc nghiệp vụ và giao dịch tài chính
1. Công thức nghiệp vụ phải được triển khai tại một vị trí thống nhất và có test độc lập.
2. Không tính cùng một chỉ số theo những công thức khác nhau giữa API, báo cáo và giao diện.
3. Các giao dịch đã duyệt, đã thanh toán hoặc đã chốt phải tuân theo quy tắc sửa đổi được phê duyệt; không tùy tiện cập nhật hoặc xóa trực tiếp.
4. Nếu cần sửa giao dịch tài chính đã ghi nhận, phải sử dụng cơ chế đảo bút toán hoặc quy trình điều chỉnh đã được xác định trong nghiệp vụ.
5. Khi một quy trình có nhiều bước, phải bảo đảm dữ liệu liên quan được cập nhật đồng bộ trong transaction.
6. Kiểm tra giới hạn số tiền, tổng phân bổ, tồn kho, ngày tháng, trạng thái và điều kiện chuyển trạng thái ở backend.
7. Không tự động làm tròn hoặc cắt bỏ phần dư tiền mà không tuân thủ quy tắc làm tròn đã được phê duyệt.
8. Tách biệt dữ liệu gốc, dữ liệu tổng hợp, số liệu báo cáo và dữ liệu cache. Không dùng dữ liệu tổng hợp làm nguồn ghi ngược vào sổ nghiệp vụ nếu không có quy trình rõ ràng.

### 8. Quy tắc kiểm thử bắt buộc
1. Mỗi chức năng mới hoặc lỗi được sửa phải có kiểm thử phù hợp với mức độ rủi ro.
2. Kiểm thử tối thiểu gồm:
   - Trường hợp thành công.
   - Dữ liệu đầu vào không hợp lệ.
   - Chưa đăng nhập hoặc không đủ quyền.
   - Truy cập dữ liệu của tenant khác.
   - Tài nguyên không tồn tại.
   - Trạng thái nghiệp vụ không hợp lệ.
   - Lỗi transaction hoặc xử lý trùng nếu có liên quan.
3. Với công thức tài chính, PHI, chấm điểm OCOP, tồn kho và quyết toán, phải có test cho biên giá trị, trường hợp bằng ngưỡng và trường hợp vượt ngưỡng.
4. **Không coi test thành công hoặc mã HTTP 200 là bằng chứng duy nhất**: Một API có thể trả về HTTP 200 nhưng vẫn có thể ghi sai sổ quỹ, trừ kho hai lần, sai lệch công nợ hoặc cho phép người dùng không đủ quyền duyệt phiếu. Test bắt buộc phải kiểm tra cả kết quả nghiệp vụ và trạng thái dữ liệu thực tế trong CSDL sau khi thực hiện (số dư sổ quỹ, biến động tồn kho, công nợ, audit trail).
5. Không xóa, vô hiệu hóa hoặc nới lỏng test chỉ để làm cho pipeline xanh.
6. Không sửa test để chấp nhận một hành vi sai nghiệp vụ mà chưa được phê duyệt.
7. Dùng factory và dữ liệu test riêng biệt; không phụ thuộc dữ liệu thật của người dùng.
8. Chạy các test liên quan trước, sau đó chạy toàn bộ test khả thi.
9. Phân biệt rõ test đã chạy, test chưa chạy, test bị lỗi môi trường và test thất bại do mã nguồn.

### 9. Quy tắc tích hợp frontend
1. Frontend phải sử dụng API thật của backend cho các nghiệp vụ đã được tích hợp.
2. Không giả lập việc lưu thành công nếu API chưa tồn tại hoặc yêu cầu thất bại.
3. Mỗi trang dữ liệu phải có trạng thái loading, empty, error và success phù hợp.
4. Form phải hiển thị lỗi validation từ backend tại trường tương ứng khi có thể.
5. Nút gửi biểu mẫu phải chống gửi lặp trong thời gian xử lý.
6. Các thao tác quan trọng như xóa mềm, duyệt phiếu, thanh toán và chốt mùa vụ cần xác nhận trước khi thực hiện.
7. Tìm kiếm, lọc, phân trang, xuất báo cáo và các nút hành động phải hoạt động thực sự; không tạo giao diện chỉ để minh họa rồi coi là hoàn thành.
8. Không hardcode tên HTX, người dùng, số liệu tổng quan hoặc quyền người dùng.
9. Kiểm tra trạng thái quyền, phiên đăng nhập hết hạn và lỗi mạng.
10. Không để lỗi API làm hỏng toàn bộ trang nếu có thể hiển thị lỗi tại khu vực chức năng bị ảnh hưởng.
11. Không lưu dữ liệu nhạy cảm vào local storage nếu không có đánh giá bảo mật và lý do cần thiết.
12. Đảm bảo giao diện có thể sử dụng trên màn hình nhỏ, bàn phím và các trạng thái dữ liệu khác nhau.
13. Khi làm tính năng in ấn, xuất biểu mẫu chứng từ (Mẫu 02-VT, phiếu thu chi, hợp đồng, báo cáo), bắt buộc thiết kế đa thiết bị: hỗ trợ song song in trực tiếp, xuất PDF và xuất Excel/CSV cho người dùng laptop/mobile không có máy in.
14. Trên các biểu mẫu chứng từ in ấn và bảng kê pháp lý, cấm dùng `truncate` cắt cụt văn bản thành `...`; bắt buộc cho phép xuống dòng (`break-words`, `whitespace-normal`) để bảo đảm hiển thị đầy đủ thông tin nông nghiệp/kế toán.

### 10. Quy tắc hiệu năng và chất lượng mã
1. Tránh N+1 query; sử dụng eager loading, pagination và truy vấn có chọn lọc khi phù hợp.
2. Không tải toàn bộ dữ liệu lớn lên frontend chỉ để phân trang ở trình duyệt nếu API có thể phân trang.
3. Không thêm index, cache hoặc queue theo cảm tính; xác định mục tiêu và kiểm chứng tác động.
4. Không cache dữ liệu theo cách có thể làm rò rỉ dữ liệu giữa các tenant.
5. Không thực hiện xử lý file lớn, xuất báo cáo nặng hoặc tác vụ dài trực tiếp trong request nếu kiến trúc hỗ trợ queue phù hợp.
6. Không thêm thư viện mới nếu chức năng có thể được giải quyết hợp lý bằng công cụ hiện có.
7. Khi thêm hoặc nâng cấp dependency, kiểm tra khả năng tương thích, bảo trì, giấy phép và rủi ro bảo mật.
8. **Không refactor toàn bộ dự án khi chỉ cần sửa một chức năng**: Xóa import, biến và mã chết khi có căn cứ; không chạy các đợt refactor lớn không liên quan đến nhiệm vụ. Ưu tiên các thay đổi nhỏ (Surgical Change), có thể kiểm thử độc lập, có thể xem xét lại và dễ dàng hoàn tác (rollback) để tránh phá hỏng các phần backend đã chạy ổn định trong khi tiếp tục hoàn thiện frontend.
9. Tuân thủ formatter, linter, static analysis và coding standard đã được cấu hình trong repository.
10. Không tối ưu sớm bằng các abstraction phức tạp khi chưa có nhu cầu rõ ràng.

### 11. Quy tắc log, giám sát và xử lý lỗi
1. Lỗi phải có thông tin đủ để chẩn đoán nhưng không làm lộ dữ liệu nhạy cảm.
2. Phân biệt lỗi nghiệp vụ dự kiến với lỗi hệ thống không dự kiến.
3. Sử dụng mã lỗi ổn định cho các lỗi nghiệp vụ quan trọng; frontend không nên phải phân tích chuỗi thông báo tự do để quyết định hành vi.
4. Các tác vụ nền và thao tác nhiều bước cần có cơ chế ghi nhận trạng thái, lỗi và khả năng thử lại phù hợp.
5. Không tự động thử lại một thao tác tài chính không idempotent nếu có nguy cơ ghi nhận giao dịch hai lần.
6. Không bắt exception rồi bỏ qua mà không xử lý, ghi nhận hoặc truyền lỗi phù hợp.

### 12. Quy tắc quản lý tài liệu
1. Khi thay đổi API, cập nhật API specification và tài liệu tích hợp frontend.
2. Khi thay đổi bảng, field, enum hoặc quan hệ, cập nhật database design và data dictionary.
3. Khi thay đổi nghiệp vụ, cập nhật business rules, use cases hoặc tài liệu liên quan.
4. Khi thay đổi quyền, cập nhật role/permission matrix.
5. Khi có quy tắc pháp lý mới hoặc thay đổi, ghi rõ nguồn, điều khoản, ngày hiệu lực và phạm vi ảnh hưởng.
6. Không đánh dấu tài liệu là đã xác minh pháp lý nếu chưa đối chiếu nguồn đáng tin cậy.
7. Không để báo cáo cũ tiếp tục được sử dụng như trạng thái hiện tại sau khi mã nguồn đã thay đổi.

### 13. Quy trình làm việc của Agent
Với mỗi nhiệm vụ, Agent phải thực hiện theo trình tự:
- **Bước 1:** Đọc tài liệu và kiểm tra repository hiện tại.
- **Bước 2:** Xác định vấn đề, nguyên nhân gốc, phạm vi và các phụ thuộc.
- **Bước 3:** Lập kế hoạch thay đổi nhỏ, có thứ tự và có cách kiểm chứng.
- **Bước 4:** Triển khai theo từng module hoặc nhóm thay đổi có thể kiểm tra độc lập.
- **Bước 5:** Chạy formatter, linter, static analysis và test phù hợp với stack thực tế.
- **Bước 6:** Kiểm tra hồi quy, quyền truy cập, tenant isolation, dữ liệu và hợp đồng API.
- **Bước 7:** Cập nhật tài liệu, báo cáo kết quả và liệt kê những điểm chưa giải quyết.
*Agent không được tuyên bố hoàn thành chỉ vì đã tạo hoặc sửa file.*

### 14. Tiêu chí hoàn thành nhiệm vụ
Một nhiệm vụ chỉ được đánh dấu **DONE** khi:
- Yêu cầu đã được đối chiếu với tài liệu liên quan.
- Mã nguồn đã được triển khai trong phạm vi cho phép.
- Không còn lỗi đã biết thuộc phạm vi nhiệm vụ mà chưa được nêu rõ.
- Test phù hợp đã chạy và có kết quả thực tế.
- Các hợp đồng API, database và frontend liên quan đã được cập nhật.
- Quyền truy cập và tenant isolation đã được kiểm tra khi liên quan.
- Không có dữ liệu giả mạo kết quả hoặc chức năng chỉ hoạt động trên giao diện.
- Có báo cáo tóm tắt file thay đổi, test đã chạy, kết quả, hạn chế và công việc còn lại.
*Nếu một điều kiện chưa đạt, phải đánh dấu PARTIAL hoặc BLOCKED và nêu lý do cụ thể; không được báo cáo DONE.*

### 15. Quy tắc cuối cùng
**Bảo toàn dữ liệu, tính đúng đắn nghiệp vụ, bảo mật và khả năng kiểm chứng quan trọng hơn tốc độ tạo mã.**

Khi thiếu thông tin, ưu tiên điều tra và nêu rõ điểm chưa chắc chắn. Khi có nhiều phương án, chọn phương án ít rủi ro nhất, phù hợp kiến trúc hiện tại và có thể kiểm thử. Không được tự ý mở rộng phạm vi hoặc thay đổi công nghệ chỉ vì sở thích của Agent.


