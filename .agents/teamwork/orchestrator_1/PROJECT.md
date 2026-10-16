# Project: Số Hóa Hoàn Chỉnh Quy Trình Hồ Sơ OCOP (QĐ 148/QĐ-TTg)

## Architecture
- **Backend Architecture**: Laravel 10+, Domain-Driven Design (DDD) phân lớp tại `app/Modules/Ocop/`:
  - `Criteria/`: `CriteriaVersion`, `CriteriaGroup`, `Criterion`, `Indicator`, `ScoringRule`, `MandatoryCondition`.
  - `Dossier/`: `OcopApplication`, `SelfAssessment`, `OcopApplicationService`.
  - `Evidence/`: `Evidence`, `EvidenceVersion` (SHA-256 checksums, non-destructive versioning), `EvidenceLink`.
  - `Evaluation/`: `EvaluationSession`, `EvaluatorScore`, `ConsolidatedResult`, `FinalDecision`.
  - `Report/`: `DashboardReportService`, `OcopDocumentService`.
  - `Database Seeders`: `database/seeders/OcopSweetPalermoCriteriaSeeder.php`, `DatabaseSeeder.php`.
- **Frontend Architecture**: React 18, Vite 5, TypeScript 5, Tailwind CSS 3, TanStack Query 5, React Router v6:
  - `src/features/ocop/pages/`: `CreateDossierWizardPage.tsx`, `DossierDetailPage.tsx`, `CriteriaPage.tsx`, `DossiersPage.tsx`, `EvidencesPage.tsx`.
  - `src/features/ocop/components/`: `Qd148DocumentModal.tsx`, `FarmerCriterionCard.tsx`, `SmartSuggestionButton.tsx`, `CriterionStatusBadge.tsx`, `RealtimeProgressBar.tsx`, `BieuMau01PrintView.tsx`, `BieuMau02PrintView.tsx`, `BieuMau03PrintView.tsx`.
  - `src/services/ocopService.ts`.

## Feature Inventory
| # | Feature | Description | Milestone | Source |
|---|---------|-------------|-----------|--------|
| 1 | Cây Tiêu chí OCOP QĐ 148 (100đ) | 3 nhóm: Phần A (40đ), Phần B (25đ), Phần C (35đ), 11 tiêu chí, 11 chỉ tiêu chuẩn cho Rau củ quả tươi (Ớt chuông Sweet Palermo) | M1 | Survey / QĐ 148 |
| 2 | Quy tắc chấm điểm bậc thang | Cấu hình thang điểm chi tiết (`scoring_rules`) cho từng chỉ tiêu theo các mức đạt được | M1 | Survey / QĐ 148 |
| 3 | Điều kiện khống chế (Cứng) | 6 điều kiện khống chế (`mandatory_conditions`): VietGAP (4 sao), BVMT, Nguyên liệu ĐP, Nhãn QR, Tuân thủ PHI, Nộp hồ sơ | M1 | Survey / QĐ 148 |
| 4 | Seeder OCOP Sweet Palermo | Seeder `OcopSweetPalermoCriteriaSeeder.php` nạp đầy đủ cây tiêu chí, tự publish sang trạng thái `PUBLISHED` bất biến, tích hợp `DatabaseSeeder` | M1 | ORIGINAL_REQUEST R1 |
| 5 | Trợ lý Gợi ý Điểm Thông minh | Service `OcopScoreSuggestionService` phân tích dữ liệu HTX (vùng trồng, VietGAP, sản lượng, xã viên, nhật ký PHI) để gợi ý điểm tự chấm | M2 | ORIGINAL_REQUEST R2 |
| 6 | API Gợi ý Điểm Tự chấm | Endpoint `GET /api/v1/ocop/applications/{id}/score-suggestions` trả về điểm gợi ý và căn cứ giải trình | M2 | ORIGINAL_REQUEST R2 |
| 7 | Số hóa Biểu mẫu 01 chuẩn | Phiếu đăng ký đánh giá, phân hạng sản phẩm OCOP chuẩn thể thức văn bản hành chính Việt Nam, tự động điền thông tin HTX Tân Tiến | M2 | ORIGINAL_REQUEST R2 / Biểu mẫu 1 |
| 8 | Số hóa Biểu mẫu 02 chuẩn | Báo cáo tự đánh giá về sản phẩm OCOP gồm 4 phần: Thông tin chung, Phương án SXKD, Đánh giá tiêu chí (100đ) & 14 minh chứng phụ lục, Kế hoạch tương lai | M2 | ORIGINAL_REQUEST R2 / Biểu mẫu 2 |
| 9 | Số hóa Biểu mẫu 03 chuẩn | Báo cáo đánh giá của UBND cấp xã xác nhận 4 nội dung: Nguyên liệu, Lao động, Ý tưởng, Bản sắc địa phương | M2 | ORIGINAL_REQUEST R2 / Biểu mẫu 3 |
| 10 | Tính tổng điểm & Dự báo sao | Tự động cộng tổng điểm A+B+C, kiểm tra điều kiện khống chế, dự báo hạng sao (3⭐: 50-69đ, 4⭐: 70-89đ, 5⭐: >=90đ) | M2 | ORIGINAL_REQUEST R2 |
| 11 | Đo lường % Hoàn thiện hồ sơ | Tính toán thời gian thực tỷ lệ hoàn thành hồ sơ dựa trên số tiêu chí đã tự chấm và số minh chứng hợp lệ | M2 | ORIGINAL_REQUEST R2 |
| 12 | Quản lý Mã băm SHA-256 | Tính toán và kiểm tra mã băm SHA-256 cho mọi tệp minh chứng tải lên bảo đảm tính toàn vẹn | M3 | ORIGINAL_REQUEST R3 |
| 13 | Quản lý Phiên bản Minh chứng | Phiên bản v1.0, v1.1..., chuyển trạng thái bản cũ sang ARCHIVED, tuyệt đối không xóa cứng dữ liệu lịch sử | M3 | ORIGINAL_REQUEST R3 |
| 14 | Trích xuất Minh chứng Nội bộ | Tự động trích xuất / liên kết dữ liệu nội bộ HTX (vùng trồng, xã viên, nhật ký PHI) thành tài liệu minh chứng số hóa có hash SHA-256 | M3 | ORIGINAL_REQUEST R3 |
| 15 | Farmer-Centric Wizard Cải tiến | Cải tiến 6 bước Wizard: Sửa lỗi toán học Bước 4 (40+25+35=100), cho phép nông dân trực tiếp tự chọn điểm hoặc áp dụng gợi ý | M4 | ORIGINAL_REQUEST R4 |
| 16 | Thẻ chọn mức điểm to bản | Giao diện Card-based radio to rõ (>=48px touch target) thay thế dropdown nhỏ, có mô tả tiêu chí rõ ràng | M4 | ORIGINAL_REQUEST R4 |
| 17 | Đơn giản hóa thuật ngữ | Bổ sung chú thích/tooltip mộc mạc, dễ hiểu cho nông dân gắn liền với chứng từ thực tế của HTX | M4 | ORIGINAL_REQUEST R4 |
| 18 | Chỉ báo trạng thái 3 màu | 🟢 Xanh lá: Đã hoàn thành (đã chấm + có minh chứng); 🟡 Vàng: Cần bổ sung; 🔴 Đỏ: Chưa có minh chứng bắt buộc | M4 | ORIGINAL_REQUEST R4 |
| 19 | Modal Xem trước & In ấn Biểu 01/02/03 | Giao diện xem trước và in ấn A4 chuẩn thể thức văn bản hành chính Việt Nam, hỗ trợ in sạch không dính UI website | M4 | ORIGINAL_REQUEST R4 |
| 20 | Tối ưu hóa Build & Lint | Sửa cấu hình `package.json` lint script và khử cảnh báo circular chunks trong `vite.config.ts` | M4 | ORIGINAL_REQUEST AC |
| 21 | Test Suite & Adversarial Hardening | Bộ kiểm thử Tiers 1-4 và kiểm thử biên Tier 5 đảm bảo `php artisan test --filter=Ocop` và `npm run build && npm run lint` đạt 100% | M5 | ORIGINAL_REQUEST Verification |

## Milestones
| # | Name | Scope | Dependencies | Status |
|---|------|-------|-------------|--------|
| M1 | Cây Tiêu chí OCOP QĐ 148 & Seeders | Backend seeder nạp đầy đủ cây tiêu chí QĐ 148 (Ớt chuông Sweet Palermo), scoring rules, mandatory conditions, publish immutable version | none | DONE |
| M2 | Biểu mẫu 01, 02, 03 & Cơ chế Tự chấm điểm Thông minh | Backend score suggestion service, document service sinh Biểu 01/02/03, API routes, tính tổng điểm & dự báo sao | M1 | DONE |
| M3 | Quản lý Kho Minh chứng SHA-256 & Phiên bản Toàn vẹn | Backend trích xuất dữ liệu HTX thành minh chứng, tính SHA-256, versioning bất biến, soft archiving | M1 | DONE |
| M4 | Giao diện Frontend Farmer-Centric UX & In ấn Chuẩn | React components: Farmer wizard, Card radio scoring, nút gợi ý, 3 màu trạng thái, Modal xem trước & in ấn Biểu 01/02/03, sửa lint/build | M2, M3 | DONE |
| M5 | Final E2E Test Suite & Adversarial Hardening | Chạy toàn bộ backend test suites (`php artisan test --filter=Ocop`) và frontend build (`npm run build && npm run lint`), thẩm định Forensic Integrity | M4 | DONE |

## Interface Contracts
### M1 ↔ M2 (Criteria ↔ Scoring & Suggestion)
- `CriteriaVersion`: Model biểu diễn phiên bản tiêu chí (`version_code = 'OCOP-QD148-2023-FRESH'`).
- `Indicator`: Model biểu diễn chỉ tiêu đánh giá (`code`: `TC-A.1.1`, `TC-A.2.1`...; `max_score`: `10.0`, `5.0`...; `mandatory`: boolean).
- `ScoringRule`: Lưu bậc thang điểm cho từng chỉ tiêu (`configuration`: `[{score: 10, label: '100% nguyên liệu...'}, ...]`).

### M2 ↔ M4 (Backend API ↔ Frontend UX)
- `GET /api/v1/ocop/applications/{id}/score-suggestions`:
  - Output: `{"suggestions": {"TC-A.1.1": {"suggested_score": 10.0, "reason": "100% diện tích trồng tại Đà Lạt/Lạc Dương", "auto_evidence_type": "FARM_PLOT"}, ...}}`
- `GET /api/v1/documents/generate/form-01/{id}`:
  - Output: HTML chuẩn A4 Biểu số 01 điền sẵn dữ liệu HTX Tân Tiến.
- `GET /api/v1/documents/generate/form-02/{id}`:
  - Output: HTML chuẩn A4 Biểu số 02 gồm 4 phần và bảng 14 minh chứng phụ lục.
- `GET /api/v1/documents/generate/form-03/{id}`:
  - Output: HTML chuẩn A4 Biểu số 03 xác nhận UBND cấp xã.

### M3 ↔ M4 (Evidence ↔ Frontend Upload)
- `POST /api/v1/ocop/applications/{id}/evidences`:
  - Upload file multipart, backend trả về `{id, title, checksum, version_number: 1, status: "ACTIVE"}`.
- `POST /api/v1/evidences/{id}/versions`:
  - Upload thay thế, yêu cầu `replacement_reason`, chuyển bản cũ sang `ARCHIVED`.

## Code Layout
- Backend:
  - `backend/app/Modules/Ocop/Criteria/`
  - `backend/app/Modules/Ocop/Dossier/`
  - `backend/app/Modules/Ocop/Evidence/`
  - `backend/app/Modules/Ocop/Evaluation/`
  - `backend/app/Modules/Ocop/Services/OcopScoreSuggestionService.php`
  - `backend/app/Modules/Report/OcopDocumentService.php`
  - `backend/database/seeders/OcopSweetPalermoCriteriaSeeder.php`
  - `backend/database/seeders/DatabaseSeeder.php`
  - `backend/tests/Feature/Ocop/`
- Frontend:
  - `frontend/src/features/ocop/pages/CreateDossierWizardPage.tsx`
  - `frontend/src/features/ocop/pages/DossierDetailPage.tsx`
  - `frontend/src/features/ocop/pages/CriteriaPage.tsx`
  - `frontend/src/features/ocop/pages/DossiersPage.tsx`
  - `frontend/src/features/ocop/pages/EvidencesPage.tsx`
  - `frontend/src/features/ocop/components/FarmerCriterionCard.tsx`
  - `frontend/src/features/ocop/components/SmartSuggestionButton.tsx`
  - `frontend/src/features/ocop/components/CriterionStatusBadge.tsx`
  - `frontend/src/features/ocop/components/RealtimeProgressBar.tsx`
  - `frontend/src/features/ocop/components/Qd148DocumentModal.tsx`
  - `frontend/src/features/ocop/components/BieuMau01PrintView.tsx`
  - `frontend/src/features/ocop/components/BieuMau02PrintView.tsx`
  - `frontend/src/features/ocop/components/BieuMau03PrintView.tsx`
  - `frontend/src/services/ocopService.ts`
  - `frontend/vite.config.ts`
  - `frontend/package.json`
