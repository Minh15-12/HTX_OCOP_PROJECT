# 🌾 HTX-OCOP Management System

> **Hệ thống Quản lý Hợp tác xã Nông nghiệp & Số hóa Hồ sơ Đánh giá Phân hạng OCOP**

[![PHP](https://img.shields.io/badge/PHP-8.2+-777BB4?logo=php&logoColor=white)](https://php.net)
[![Laravel](https://img.shields.io/badge/Laravel-11.x-FF2D20?logo=laravel&logoColor=white)](https://laravel.com)
[![React](https://img.shields.io/badge/React-18-61DAFB?logo=react&logoColor=black)](https://react.dev)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.x-3178C6?logo=typescript&logoColor=white)](https://typescriptlang.org)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-16-4169E1?logo=postgresql&logoColor=white)](https://postgresql.org)
[![TailwindCSS](https://img.shields.io/badge/TailwindCSS-3.4-06B6D4?logo=tailwindcss&logoColor=white)](https://tailwindcss.com)

---

## 📋 Giới thiệu & Nội dung Đề tài

### 📖 Nội dung đề tài
> **Số hóa hoạt động quản lý hợp tác xã nông nghiệp và quy trình chuẩn bị hồ sơ đánh giá, phân hạng OCOP.**  
> **Quản lý minh bạch xã viên, vùng trồng, vật tư, phân chia lợi nhuận; hỗ trợ chấm điểm, lưu minh chứng và kết xuất hồ sơ chuẩn hóa.**

### 🎯 Mục tiêu dự án
1. **Số hóa hoạt động quản lý hợp tác xã nông nghiệp và quy trình chuẩn bị hồ sơ đánh giá, phân hạng OCOP.**
2. **Quản lý minh bạch xã viên, vùng trồng, vật tư, phân chia lợi nhuận; hỗ trợ chấm điểm, lưu minh chứng và kết xuất hồ sơ chuẩn hóa.**

### 🏆 Dự kiến kết quả đạt được
- • Hệ thống web quản lý xã viên, vùng trồng, vật tư và nghiệp vụ HTX.
- • Quy trình chấm điểm OCOP, lưu minh chứng, theo dõi mức độ hoàn thiện.
- • Chức năng kết xuất hồ sơ PDF/Word và báo cáo quản trị.
- • Mã nguồn, dữ liệu mẫu, tài liệu vận hành và báo cáo kiểm thử.

### 🛠️ Phần mềm và công cụ sử dụng
- **Frontend / UI:** React/Vue (Hiện thực: **React 18 + TypeScript + Vite + TailwindCSS 3.4**)
- **Backend / API:** Laravel/FastAPI (Hiện thực: **Laravel 11 + Sanctum + Modular Monolith**)
- **Cơ sở dữ liệu:** PostgreSQL 16
- **Lưu trữ tệp & Minh chứng:** MinIO hoặc lưu trữ tệp tương đương (S3-compatible Object Storage)
- **Công cụ tạo tài liệu:** Công cụ tạo PDF/DOCX theo mẫu quy chuẩn OCOP QĐ 148
- **Môi trường & Triển khai:** Docker, Nginx, Git/GitHub

### 📅 Kế hoạch triển khai (14 tuần)
| Giai đoạn | Nội dung công việc |
| :--- | :--- |
| **Tuần 1–2** | Khảo sát quy trình HTX, biểu mẫu và tiêu chí OCOP |
| **Tuần 3** | Mô hình hóa nghiệp vụ, phân quyền, CSDL và kiến trúc |
| **Tuần 4–5** | Phát triển xã viên, vùng trồng và danh mục nền |
| **Tuần 6–7** | Phát triển vật tư, nhật ký giao dịch và phân chia lợi nhuận |
| **Tuần 8–9** | Số hóa tiêu chí OCOP, chấm điểm và quản lý minh chứng |
| **Tuần 10** | Xây dựng luồng duyệt, nhắc việc và nhật ký kiểm toán |
| **Tuần 11** | Kết xuất PDF/Word, báo cáo và thống kê |
| **Tuần 12** | Kiểm thử dữ liệu, bảo mật, sao lưu và phục hồi |
| **Tuần 13** | Triển khai thử nghiệm, hướng dẫn sử dụng |
| **Tuần 14** | Nghiệm thu, trình diễn và hoàn thiện báo cáo |

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

## 🚀 Hướng dẫn Cài đặt & Khởi chạy Hệ thống

Dự án hỗ trợ **2 phương thức khởi chạy linh hoạt**:
1. **Phương thức 1: Triển khai trọn gói bằng Docker & MinIO** *(Khuyến nghị cho kiểm thử tích hợp & môi trường chuẩn hóa)*.
2. **Phương thức 2: Khởi chạy Native Local Dev** *(Phù hợp cho lập trình viên phát triển tính năng trực tiếp, kết hợp MinIO & Redis từ Docker)*.

---

### 🐳 Phương thức 1: Triển khai Trọn gói bằng Docker & MinIO (Khuyến nghị)

Toàn bộ ngăn xếp công nghệ (Frontend, Backend Laravel 11, PostgreSQL 16, Redis 7, MinIO S3 Object Storage và Queue Worker) được định nghĩa sẵn trong [`docker-compose.yml`](file:///f:/HTX_OCOP_PROJECT/docker-compose.yml).

#### Bước 1: Khởi động toàn bộ các dịch vụ Container
Tại thư mục gốc dự án:

```bash
# Khởi chạy toàn bộ 6 dịch vụ ngầm trong nền
docker compose up -d
```

Kiểm tra trạng thái hoạt động của các container:
```bash
docker compose ps
```

#### Bước 2: Nạp CSDL Migration & Dữ liệu Mẫu (Seed Data)
Sau khi các container khởi động thành công:

```bash
# Tạo bảng và nạp 31 xã viên thật, hồ sơ Sweet Palermo, tiêu chí QĐ 148
docker compose exec backend php artisan migrate:fresh --seed
```

#### Bước 3: Kiểm tra Kết nối MinIO & Tự động Khởi tạo Bucket
Hệ thống tích hợp sẵn lệnh Artisan chuyên dụng để tự động phát hiện và khởi tạo Bucket `htx-ocop-evidence`:

```bash
docker compose exec backend php artisan storage:minio-check
```

*Lệnh trên sẽ tự động xác thực quyền đọc/ghi tệp, băm SHA-256 và thông báo trạng thái Online của kho lưu trữ.*

---

### 💻 Phương thức 2: Khởi chạy Kết hợp Native Local Dev (Kèm MinIO/Redis từ Docker)

Phương thức này tận dụng Docker cho các dịch vụ hạ tầng nền (MinIO, Redis) trong khi chạy mã nguồn PHP và React trực tiếp trên máy chủ cục bộ.

#### Bước 1: Khởi động MinIO S3 & Redis qua Docker
Tại thư mục gốc:

```bash
docker compose up -d minio redis
```

#### Bước 2: Khởi chạy Backend Laravel 11
Mở **Terminal 1**:

```bash
cd backend

# 1. Cài đặt các thư viện PHP
composer install

# 2. Tạo file cấu hình môi trường nếu chưa có
cp .env.example .env

# 3. Tạo Application Key
php artisan key:generate

# 4. Chạy migration và nạp dữ liệu mẫu
php artisan migrate --seed

# 5. Kiểm tra kết nối MinIO và tạo bucket lưu trữ minh chứng
php artisan storage:minio-check

# 6. Khởi chạy máy chủ Backend API
php artisan serve --host=127.0.0.1 --port=8000
```

#### Bước 3: Khởi chạy Frontend React (Vite + TailwindCSS)
Mở **Terminal 2**:

```bash
cd frontend

# 1. Cài đặt các thư viện Node.js
npm install

# 2. Khởi chạy máy chủ phát triển
npm run dev
# (Mặc định chạy tại http://localhost:3000; nếu cổng 3000 đang được ứng dụng khác sử dụng, Vite sẽ tự động mở http://localhost:3001)
```

---

### 🌐 Bảng Tra cứu Cổng & URL Dịch vụ

| Dịch vụ | Địa chỉ URL | Cổng Host | Tài khoản / Ghi chú |
| :--- | :--- | :--- | :--- |
| 💻 **Frontend Web App** | [http://localhost:3000](http://localhost:3000) *(hoặc :3001)* | `3000` / `3001` | Giao diện React 18 SPA |
| ⚙️ **Backend REST API** | [http://localhost:8000/api/v1](http://localhost:8000/api/v1) | `8000` | Laravel 11 Modular Monolith |
| 💚 **API Health Check** | [http://localhost:8000/api/v1/health](http://localhost:8000/api/v1/health) | `8000` | Trả về JSON trạng thái hệ thống |
| 🗄️ **MinIO Web Console** | [http://localhost:9001](http://localhost:9001) | `9001` | User: `minioadmin` / Pass: `minioadmin` |
| 🪣 **MinIO S3 API Endpoint**| `http://127.0.0.1:9000` | `9000` | Bucket: `htx-ocop-evidence` |
| 🐘 **PostgreSQL 16** | `localhost:5432` | `5432` | Database: `htx_ocop`, User: `postgres` |
| ⚡ **Redis Cache & Queue**| `localhost:6379` | `6379` | Xử lý hàng đợi & bộ nhớ đệm |

---

### 🪣 Quản lý Kho Minh chứng Số OCOP với MinIO S3

Dự án số hóa hồ sơ OCOP yêu cầu lưu trữ và bảo quản các tài liệu pháp lý, kết quả thử nghiệm chỉ tiêu vi sinh (QUATEST 3), giấy chứng nhận VietGAP/HACCP và ảnh chụp thực địa.
- **Cơ chế lưu trữ:** Laravel kết nối tới MinIO thông qua driver `league/flysystem-aws-s3-v3`.
- **Toàn vẹn dữ liệu:** Tệp tải lên được tự động tính toán mã băm SHA-256 để chống giả mạo theo quy chuẩn kiểm toán.
- **Kiểm tra trạng thái:** Chạy lệnh `php artisan storage:minio-check` bất kỳ lúc nào để đánh giá tính khả dụng của MinIO.
- **Cơ chế Fallback:** Trong trường hợp chưa khởi động MinIO, hệ thống tự động kích hoạt `LOCAL FALLBACK` lưu trữ an toàn tại `backend/storage/app/evidences/` mà không làm gián đoạn trải nghiệm người dùng.

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
