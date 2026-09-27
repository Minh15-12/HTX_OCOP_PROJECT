# 🌾 HTX-OCOP Management System

> **Hệ thống Quản lý Hợp tác xã Nông nghiệp & Số hóa Hồ sơ Đánh giá Phân hạng OCOP**

[![PHP](https://img.shields.io/badge/PHP-8.2+-777BB4?logo=php&logoColor=white)](https://php.net)
[![Laravel](https://img.shields.io/badge/Laravel-11.x-FF2D20?logo=laravel&logoColor=white)](https://laravel.com)
[![React](https://img.shields.io/badge/React-18-61DAFB?logo=react&logoColor=black)](https://react.dev)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.x-3178C6?logo=typescript&logoColor=white)](https://typescriptlang.org)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-16-4169E1?logo=postgresql&logoColor=white)](https://postgresql.org)
[![TailwindCSS](https://img.shields.io/badge/TailwindCSS-3.4-06B6D4?logo=tailwindcss&logoColor=white)](https://tailwindcss.com)

---

## 📋 Giới thiệu

**HTX-OCOP Management System** là hệ thống web quản lý toàn diện hoạt động của Hợp tác xã (HTX) nông nghiệp Việt Nam, đồng thời số hóa trọn vẹn quy trình chuẩn bị hồ sơ, đánh giá và phân hạng sản phẩm OCOP (Chương trình Mỗi xã Một sản phẩm) theo Quyết định 148/QĐ-TTg.

### Bối cảnh

Các HTX nông nghiệp hiện nay phần lớn vẫn quản lý bằng sổ sách giấy và bảng tính rời rạc, gây khó khăn trong:
- Theo dõi xã viên, vốn góp, mùa vụ, sản lượng
- Truy xuất nguồn gốc nông sản
- Chuẩn bị hồ sơ đánh giá phân hạng OCOP (thường mất 3–6 tháng thủ công)
- Đảm bảo tính minh bạch trong tài chính và phân chia lợi nhuận

Hệ thống này giải quyết toàn bộ các vấn đề trên bằng một nền tảng số tập trung.

---

## 🎯 Mục tiêu

### 1. Số hóa Quản lý HTX
Cơ sở dữ liệu tập trung quản lý: hồ sơ pháp lý HTX, xã viên, vốn góp (tiền mặt, chuyển khoản, quyền sử dụng đất), vùng trồng, mùa vụ, vật tư nông nghiệp, kho, thu chi tài chính, phân chia thặng dư/lợi nhuận.

### 2. Số hóa Hoạt động Sản xuất
Khép kín chuỗi truy vết sản xuất nông nghiệp:

```
Xã viên → Vùng trồng → Mùa vụ → Nhật ký canh tác → Vật tư sử dụng → Thu hoạch → Lô sản phẩm
```

Hỗ trợ quét mã QR để truy xuất nguồn gốc nông sản từ ruộng đến bàn ăn.

### 3. Số hóa Hồ sơ OCOP
Chuẩn hóa bộ tiêu chí đánh giá, quản lý hồ sơ tự đánh giá, kho minh chứng số, hội đồng chấm điểm, tổng hợp kết quả, ra quyết định phân hạng và xuất giấy chứng nhận sản phẩm OCOP tự động.

---

## 🏗️ Kiến trúc Hệ thống

```
                         ┌──────────────────────┐
                         │     Trình duyệt      │
                         │   (Chrome/Firefox)    │
                         └──────────┬───────────┘
                                    │
              ┌─────────────────────▼─────────────────────┐
              │          Frontend (React + Vite)           │
              │           http://localhost:3000            │
              │  React 18 · TypeScript · TailwindCSS 3.4  │
              │  React Query · React Router v6 · Axios    │
              └─────────────────────┬─────────────────────┘
                                    │ REST API (/api/v1)
              ┌─────────────────────▼─────────────────────┐
              │          Backend (Laravel 11)              │
              │           http://localhost:8000            │
              │     Modular Monolith · Clean Architecture  │
              │     Sanctum Auth · Tenant Isolation        │
              ├─────────────────────────────────────────── │
              │  9 Domain Modules:                        │
              │  Identity · Cooperative · Agriculture     │
              │  Product · Inventory · Finance            │
              │  OCOP (Criteria/Dossier/Evaluation/       │
              │        Evidence) · Audit · Report         │
              └───────┬──────────┬──────────┬─────────────┘
                      │          │          │
               ┌──────▼───┐ ┌───▼────┐ ┌───▼────┐
               │PostgreSQL│ │ Redis  │ │ MinIO  │
               │  16      │ │   7    │ │  (S3)  │
               │ port 5432│ │ p.6379 │ │ p.9000 │
               └──────────┘ └────────┘ └────────┘
```

### Backend — Modular Monolith (DDD / Clean Architecture)

Mỗi module trong `app/Modules/` tuân thủ 4 layer:

| Layer | Trách nhiệm |
| :--- | :--- |
| **Domain** | Entities, Enums, Value Objects — logic nghiệp vụ thuần túy |
| **Application** | DTOs, Services (Use Cases) — điều phối nghiệp vụ |
| **Infrastructure** | Eloquent Models, Repositories — tương tác DB/External |
| **Presentation** | Controllers, Form Requests, API Resources — HTTP interface |

### Frontend — Feature-based Architecture

```
src/
├── app/          → Entry point, Providers (React Query, Router, Toast)
├── components/   → 11 Reusable UI Components
├── features/     → 8 Feature Modules (auth, dashboard, members, agriculture,
│                   inventory, finance, ocop, system)
├── layouts/      → AppLayout, AuthLayout, Header, Sidebar, Breadcrumb
├── router/       → Routes, Guards (Protected/Guest), Navigation Config
├── services/     → API Client (Axios), Service layers
├── stores/       → Auth Store, Tenant Context Store
├── types/        → TypeScript Interfaces & Types
└── utils/        → Formatters (VNĐ, ngày tháng), Helpers
```

---

## 🚀 Hướng dẫn Cài đặt & Chạy

### Yêu cầu Hệ thống

| Phần mềm | Phiên bản tối thiểu |
| :--- | :--- |
| PHP | 8.2+ |
| Composer | 2.x |
| Node.js | 18+ |
| npm | 9+ |
| PostgreSQL | 15+ |
| Redis | 7+ (tùy chọn cho queue/cache) |
| Git | 2.x |

### Cài đặt

#### 1. Clone Repository

```bash
git clone <repository-url>
cd HTX_OCOP_PROJECT
```

#### 2. Cài đặt Backend

```bash
cd backend

# Cài đặt PHP dependencies
composer install

# Tạo file cấu hình
cp .env.example .env

# Sinh application key
php artisan key:generate
```

#### 3. Cấu hình Database

Chỉnh sửa file `backend/.env`:

```env
DB_CONNECTION=pgsql
DB_HOST=127.0.0.1
DB_PORT=5432
DB_DATABASE=htx_ocop
DB_USERNAME=postgres
DB_PASSWORD=your_password
```

Tạo database PostgreSQL:

```sql
CREATE DATABASE htx_ocop;
```

#### 4. Chạy Migration & Seed Data

```bash
cd backend

# Tạo bảng (66 migration files)
php artisan migrate

# Nạp dữ liệu mẫu (Roles, Permissions, Users, Council Levels)
php artisan db:seed
```

#### 5. Cài đặt Frontend

```bash
cd frontend

# Cài đặt Node dependencies
npm install
```

### Khởi chạy

Mở **2 terminal** riêng biệt:

**Terminal 1 — Backend:**
```bash
cd backend
php artisan serve --host=127.0.0.1 --port=8000
```

**Terminal 2 — Frontend:**
```bash
cd frontend
npm run dev
```

### Truy cập Ứng dụng

| Dịch vụ | URL |
| :--- | :--- |
| 🌐 **Giao diện Web** | [http://localhost:3000](http://localhost:3000) |
| ⚙️ **API Backend** | [http://localhost:8000/api/v1](http://localhost:8000/api/v1) |
| 💚 **Health Check** | [http://localhost:8000/api/v1/health](http://localhost:8000/api/v1/health) |

### Khởi chạy bằng Docker (Tùy chọn)

```bash
cd backend
docker-compose up -d
```

Sẽ khởi chạy: Nginx (port 8000), PHP-FPM, PostgreSQL (port 5432), Redis (port 6379), MinIO (port 9000/9001).

---

## 🔑 Tài khoản Đăng nhập Mặc định

> Mật khẩu chung cho tất cả tài khoản: **`password123`**

| Tên đăng nhập | Họ tên | Vai trò | Email |
| :--- | :--- | :--- | :--- |
| `admin` | Nguyễn Văn A | Chủ tịch HTX (HTX_OWNER) | admin@htxphuthinh.vn |
| `admin_htx` | Quản Trị Viên HTX | Quản trị viên (HTX_OWNER) | admin_htx@htxphuthinh.vn |
| `ketoan01` | Trần Thị B | Kế toán (HTX_STAFF) | ketoan@htxphuthinh.vn |
| `nvhtx01` | Lê Văn C | Nhân viên (HTX_STAFF) | nvhtx@htxphuthinh.vn |
| `truongnhom01` | Phạm Thị D | Trưởng nhóm (HTX_STAFF) | truongnhom@htxphuthinh.vn |
| `thanhvien01` | Hoàng Văn E | Thành viên (HTX_STAFF) | thanhvien@htxphuthinh.vn |
| `danhgia01` | Nguyễn Văn Giám Khảo | Chuyên gia đánh giá (EVALUATOR) | danhgia@htxphuthinh.vn |

---

## 📦 Các Module Chức năng

### 🏢 Quản lý HTX
- **Hồ sơ Hợp tác xã** — Thông tin pháp lý, đăng ký kinh doanh, điều lệ HTX
- **Quản lý Xã viên** — Hồ sơ thành viên, duyệt gia nhập, chuyển trạng thái, thống kê
- **Quản lý Vốn góp** — Góp vốn bằng tiền mặt/chuyển khoản/quyền sử dụng đất, xuất Giấy chứng nhận vốn góp có mã QR
- **Phân chia Lợi nhuận** — Lập kế hoạch phân chia thặng dư theo vốn góp và mức sử dụng dịch vụ (Patronage Rebate)

### 🌱 Quản lý Sản xuất Nông nghiệp
- **Vùng trồng & Thửa ruộng** — Đơn vị sản xuất, thửa đất, phân công xã viên canh tác
- **Mùa vụ** — Kế hoạch mùa vụ, mở/đóng vụ, theo dõi tiến độ
- **Nhật ký Canh tác** — Ghi nhận hoạt động sản xuất, vật tư sử dụng, tính toán PHI (Pre-Harvest Interval)
- **Thu hoạch & Truy xuất Nguồn gốc** — Ghi nhận sản lượng, tạo lô hàng, mã QR truy xuất nguồn gốc

### 📦 Quản lý Kho & Vật tư
- **Danh mục Vật tư** — Quản lý danh mục phân bón, thuốc BVTV, nông cụ
- **Nhập/Xuất kho** — Phiếu nhập kho, phiếu xuất kho với quy trình duyệt
- **Kiểm kê** — Kiểm kê tồn kho định kỳ, đối chiếu chênh lệch

### 💰 Quản lý Tài chính
- **Sổ quỹ Thu - Chi** — Ghi nhận giao dịch tiền mặt, quy trình duyệt & ghi sổ
- **Quản lý Công nợ** — Theo dõi khoản phải thu/phải trả, thanh toán từng phần
- **Phương án Phân chia Thặng dư** — Lập, trình duyệt kế hoạch phân chia kết dư cuối kỳ

### ⭐ Hồ sơ & Đánh giá OCOP
- **Bộ Tiêu chí** — Cấu hình linh hoạt bộ tiêu chí đánh giá phân hạng OCOP theo QĐ 148, nhóm tiêu chí, chỉ tiêu, thang điểm
- **Hồ sơ OCOP** — Đăng ký sản phẩm tham gia OCOP, tự đánh giá điểm
- **Kho Minh chứng Số** — Upload, quản lý, liên kết file minh chứng với từng chỉ tiêu, versioning
- **Hội đồng Đánh giá** — Tạo phiên chấm, phân công giám khảo, nhập điểm, khóa sổ, tổng hợp kết quả
- **Quyết định & Chứng nhận** — Phê duyệt/từ chối hồ sơ, xuất Hồ sơ OCOP chuẩn & Giấy chứng nhận tự động

### 🛡️ Quản trị Hệ thống
- **Quản lý Tài khoản** — CRUD người dùng, kích hoạt/vô hiệu hóa
- **Phân quyền RBAC** — Vai trò, quyền hạn, ma trận phân quyền
- **Nhật ký Kiểm toán** — Ghi lại mọi thao tác thay đổi dữ liệu, truy vết theo hồ sơ OCOP
- **Báo cáo & Dashboard** — Thống kê tổng hợp KPI, tiến độ OCOP, tài chính

---

## 🔌 API Overview

Tất cả API endpoints đều có prefix `/api/v1`. Xác thực bằng Bearer Token (Laravel Sanctum).

### Nhóm API chính

| Nhóm | Prefix | Mô tả |
| :--- | :--- | :--- |
| Health | `/health` | Kiểm tra trạng thái hệ thống |
| Auth | `/auth/*` | Đăng nhập, đăng xuất, thông tin user |
| Users | `/users/*` | CRUD tài khoản người dùng |
| Roles & Permissions | `/roles/*`, `/permissions` | Quản lý vai trò & phân quyền |
| Cooperative | `/cooperatives/*` | Hồ sơ HTX |
| Members | `/members/*` | Xã viên & vốn góp |
| Agriculture | `/production-units/*`, `/farm-plots/*`, `/crop-seasons/*`, `/farming-logs/*` | Sản xuất nông nghiệp |
| Harvest & Lots | `/harvests/*`, `/lots/*` | Thu hoạch & truy xuất nguồn gốc |
| Products | `/products/*` | Sản phẩm OCOP |
| Inventory | `/materials/*`, `/stock-receipts/*`, `/stock-issues/*`, `/stock-counts/*` | Kho & vật tư |
| Finance | `/cash-transactions/*`, `/receivable-payables/*`, `/surplus-distribution-plans/*` | Tài chính |
| OCOP | `/ocop/*` | Tiêu chí, hồ sơ, minh chứng, đánh giá, quyết định |
| Audit | `/audit-logs/*` | Nhật ký kiểm toán |
| Reports | `/reports/*` | Báo cáo & dashboard |
| Documents | `/documents/*` | Xuất hồ sơ & giấy chứng nhận |

---

## 🧪 Kiểm thử

### Backend

```bash
cd backend

# Chạy toàn bộ test suite
php artisan test

# Hoặc sử dụng PHPUnit trực tiếp
./vendor/bin/phpunit

# Static analysis
./vendor/bin/phpstan analyse
```

### Frontend

```bash
cd frontend

# Lint kiểm tra
npm run lint

# Build kiểm tra (TypeScript compile + Vite build)
npm run build
```

---

## 📁 Cấu trúc Thư mục Dự án

```
HTX_OCOP_PROJECT/
├── backend/                    # Laravel 11 Backend
│   ├── app/
│   │   ├── Modules/            # 9 Business Domain Modules (DDD)
│   │   │   ├── Agriculture/
│   │   │   ├── Audit/
│   │   │   ├── Cooperative/
│   │   │   ├── Finance/
│   │   │   ├── Identity/
│   │   │   ├── Inventory/
│   │   │   ├── Ocop/           # Sub: Criteria, Dossier, Evaluation, Evidence
│   │   │   ├── Product/
│   │   │   └── Report/
│   │   ├── Providers/          # Service Providers
│   │   └── Shared/             # Shared kernel (ApiResponse, Exceptions, Middleware)
│   ├── bootstrap/              # App bootstrapping (Laravel 11 style)
│   ├── config/                 # Configuration files
│   ├── database/
│   │   ├── migrations/         # 66 migration files
│   │   └── seeders/            # System, CouncilLevel, User seeders
│   ├── docker/                 # Nginx config for Docker
│   ├── routes/                 # api.php, web.php, console.php
│   ├── storage/                # Logs, cache, uploads
│   ├── tests/                  # PHPUnit tests
│   ├── composer.json
│   ├── docker-compose.yml
│   └── Dockerfile
│
├── frontend/                   # React + TypeScript Frontend
│   ├── src/
│   │   ├── app/                # App entry, Providers
│   │   ├── components/ui/      # 11 Reusable UI Components
│   │   ├── features/           # 8 Feature Modules
│   │   ├── layouts/            # App/Auth Layouts, Header, Sidebar
│   │   ├── router/             # Routes & Navigation
│   │   ├── services/           # API Client, Service layers
│   │   ├── stores/             # State management
│   │   ├── types/              # TypeScript definitions
│   │   └── utils/              # Helpers & Formatters
│   ├── package.json
│   ├── tailwind.config.js
│   ├── tsconfig.json
│   └── vite.config.ts
│
├── docs/                       # 29+ tài liệu đặc tả chi tiết
├── AGENT.md                    # Hướng dẫn cho AI Coding Agent
├── README.md                   # File này
└── .gitignore
```

---

## 📚 Tài liệu Chi tiết

Thư mục `docs/` chứa hệ thống tài liệu đặc tả đầy đủ, bao gồm:

- **Tổng quan & Nghiệp vụ**: Bối cảnh, quy trình, nghiệp vụ OCOP, vai trò & quy tắc
- **Yêu cầu**: Yêu cầu nghiệp vụ, yêu cầu chức năng, use cases
- **Thiết kế**: Domain model, database design, API specification, system architecture
- **Bảo mật**: Security design, authorization matrix, workflow specification
- **Triển khai**: OpenAPI spec, coding standards, implementation plans (Backend & Frontend)
- **UI/UX**: UI/UX specification, screen specification chi tiết từng màn hình

---

## 🔒 Bảo mật

- **Authentication**: Laravel Sanctum với Bearer Token
- **Authorization**: RBAC (Role-Based Access Control) với ma trận phân quyền chi tiết
- **Multi-tenant**: Cô lập dữ liệu theo HTX (`cooperative_id`), chặn truy cập cross-tenant
- **Audit Trail**: Ghi lại toàn bộ thao tác thay đổi dữ liệu với request ID correlation
- **Data Protection**: Soft-delete, versioning minh chứng, không xóa cứng dữ liệu lịch sử

---

## 📄 Giấy phép

Dự án phục vụ mục đích học thuật và nghiên cứu.

---

<p align="center">
  <b>HTX-OCOP Management System</b><br>
  <i>Số hóa Hợp tác xã Nông nghiệp Việt Nam 🇻🇳</i>
</p>
