# Project: Số hóa Sản xuất, Nhật ký Canh tác TT02/2024, Thu hoạch KCS 3 Cấp & Truy xuất Nguồn gốc GS1 QR (HTX Tân Tiến)

## Architecture
- **Backend Architecture**: Laravel 11 / PHP 8.2+ Domain-Driven Design (DDD).
  - Modules: `App\Models\Agriculture\*`, `App\Services\Agriculture\*`, `App\Http\Controllers\Api\Agriculture\*`.
  - Modules Integration: `App\Services\Inventory\*` (Warehouse Credit Advance), `App\Services\Finance\*` (Crop Settlement & Debt Offset), `App\Services\Ocop\*` (Digital Evidence SHA-256).
  - Authentication & Middleware: Sanctum for HTX Admin/Coop portal; Public Route bypass (`/api/public/trace/*`) for consumer QR scanning.
- **Frontend Architecture**: React 18, Vite 5, TypeScript 5, Tailwind CSS 3.4, React Router 6, TanStack Query 5, Lucide Icons.
  - Farmer Mobile UX: Touch targets $\ge 48\text{px}$, 1-tap logging, HTML5 Geolocation API, Camera image capture.
  - Public Traceability View: Dedicated responsive mobile-first page without authentication layout.
  - Label Printing: Canvas/SVG QR Code generation with standard $100\text{mm} \times 75\text{mm}$ label template.

## Feature Inventory
| # | Feature | Description | Milestone | Source |
|---|---------|-------------|-----------|--------|
| F01 | Production Hierarchy Management | Quản lý Cooperative -> ProductionUnit (PUC) -> FarmPlot -> CropSeason | M1 | TT 02/2024, R1 |
| F02 | Standard Plot Coding & GPS | Sinh mã thửa `PLOT-[HTX]-[MaXaVien]-[STT]`, tọa độ GPS, diện tích | M1 | TT 02/2024, R1 |
| F03 | CropSeason Lifecycle FSM | Vòng đời mùa vụ: `PLANNED` -> `ACTIVE` -> `HARVESTING` -> `COMPLETED`/`CANCELLED` | M1 | docs/31, R1 |
| F04 | Plot Status Visual Indicators | Hiển thị trực quan: Xanh (Canh tác), Đỏ/Cam (Cách ly PHI kèm đếm ngược), Xám (Nghỉ vụ) | M1 | R5, UX |
| F05 | TT02/2024 10-Field Farming Log | Lưu trữ và trả về đủ 10 trường thông tư TT02/2024 | M2 | TT 02/2024, R1 |
| F06 | PHI Guard Quarantine Logic | Tự động tính `safe_harvest_date = spray_date + PHI_days`, chuyển thửa sang `IN_QUARANTINE` | M2 | R1, BR-FARM-003 |
| F07 | Material PHI Auto-Lookup | Tự động lấy `phi_days` từ danh mục vật tư kho nếu người dùng không nhập tay | M2 | R1, R4 |
| F08 | Quick Mobile Logging Screen | Nút to $\ge 48\text{px}$, chọn việc 1 chạm, tự điền GPS, chụp ảnh camera, tự điền SKU/lô | M2 | R5 |
| F09 | Harvest PHI Hard Blocker | Chặn 100% lệnh thu hoạch trước `safe_harvest_date` bằng `ERR_HARVEST_PHI_VIOLATION` (HTTP 400) | M3 | R2, BR-FARM-001 |
| F10 | GS1 Standard Lot Generation | Sinh mã lô GS1: `LOT-[CoopCode]-[PlotCode]-[YYYYMMDD]-[Seq]` duy nhất | M3 | R3, GS1 standard |
| F11 | 3-Tier KCS Inspection Workflow | Quy trình KCS 3 cấp: Gate Check -> Quick Lab -> Grading (Grade A: $\ge 90\%$ uniform, Brix $\ge 7^\circ$) | M4 | R2, 3-tier KCS |
| F12 | Warehouse Credit Reconciliation | Kiểm tra trần nợ vật tư đầu vụ, đối soát vật tư sử dụng trong nhật ký với phiếu xuất kho | M4 | R4, Kho |
| F13 | Finance Settlement & Debt Offset | Tự động tổng hợp Grade A / Grade B tính tổng giá trị nông sản và cấn trừ nợ vật tư | M4 | R4, Tài chính |
| F14 | OCOP Digital Evidence Extraction | Trích xuất hồ sơ vùng trồng, nhật ký PHI làm minh chứng số SHA-256 cho OCOP | M4 | R4, OCOP |
| F15 | Public Traceability Backend API | API `/api/public/trace/{lotId}` công khai, không yêu cầu Sanctum Auth | M5 | R3, Traceability |
| F16 | Public Traceability Frontend View | Tuyến đường `/trace/:lotId` hoặc `/public/trace/:lotId` cho người tiêu dùng quét mã QR | M5 | R3, R5 |
| F17 | GS1 QR Label Print Modal | Modal in tem nhãn chuẩn thùng carton/khay đóng gói với mã QR SVG và `window.print()` | M5 | R5, In tem nhãn |
| F18 | Full E2E Test Suite & Atomic Commits | Kiểm thử toàn diện Tiers 1-4, Forensic Audit Clean, atomic git commits theo directive | M6 | Acceptance Criteria |

## Milestones
| # | Name | Scope | Dependencies | Status |
|---|------|-------|-------------|--------|
| M1 | Production Hierarchy & Plot Status UI | Quản lý Cooperative, PUC, FarmPlot (`PLOT-[HTX]-[MaXaVien]-[STT]`), CropSeason; visual status 3 màu & đếm ngược PHI | none | DONE |
| M2 | Farming Logs TT02 & PHI Guard | 10 trường TT02/2024, PHI calculation, chuyển plot `IN_QUARANTINE`, Quick Mobile Logging UI | M1 | DONE |
| M3 | Harvest Hard Blocker & GS1 Lot Numbering | Chốt chặn an toàn `ERR_HARVEST_PHI_VIOLATION`, bộ sinh mã lô GS1 chuẩn | M1, M2 | DONE |
| M4 | 3-Tier KCS & System Integration | Quy trình KCS 3 cấp (Gate, Lab, Grading), liên thông Kho vật tư, Tài chính thanh toán, OCOP SHA-256 | M2, M3 | DONE |
| M5 | Public Traceability & QR Label Printing | API & Page `/public/trace/{lotId}` không Auth, modal in tem nhãn QR SVG ISO/IEC 18004 | M3, M4 | DONE |
| M6 | Full E2E Verification, Audit & Atomic Commits | Chạy 100% backend/frontend tests, Forensic Audit CLEAN, thực hiện atomic commits | M1, M2, M3, M4, M5 | DONE |

## Interface Contracts
### Agriculture ↔ Warehouse (Kho Vật tư)
- Endpoint/Service: `StockIssueService::issueAdvanceForMember(memberId, items)`
- Invariant: Tổng nợ xuất vật tư không vượt trần `credit_limit` của xã viên. Lỗi: `ERR_MEMBER_CREDIT_LIMIT_EXCEEDED`.
- FarmingLog SKU/Batch lookup: `MaterialInventory::where('sku', $sku)->firstOrFail()`.

### Agriculture ↔ Finance (Tài chính & Thu mua)
- Settlement Service: `HarvestSettlementService::settleSeasonHarvests(seasonId, memberId)`
- Pricing Rule:
  - $V_{total} = (Q_{GradeA} \times P_{GradeA}) + (Q_{GradeB} \times P_{GradeB})$
  - $D_{deduct} = \min(D_{debt}, V_{total} - Fee)$
  - $P_{net} = V_{total} - Fee - D_{deduct}$
- Output: Tạo phiếu chi/thanh toán thực trả và phiếu ghi nhận cấn trừ công nợ vật tư.

### Agriculture ↔ Public Consumer (Truy xuất nguồn gốc)
- Endpoint: `GET /api/public/trace/{lotId}`
  - Auth: None (Public route, không middleware `auth:sanctum`).
  - Response:
    ```json
    {
      "success": true,
      "data": {
        "lot_code": "LOT-TT-01-20261015-01",
        "cooperative": { "name": "HTX Nông nghiệp Tân Tiến", "code": "TT", "province": "Lâm Đồng" },
        "product": { "name": "Ớt chuông Sweet Palermo Đỏ Đà Lạt", "puc_code": "PUC-49-015-9923", "grade": "GRADE_A" },
        "plot": { "plot_code": "PLOT-TT-01-01", "gps_coordinates": "11.9404, 108.4583", "area_sqm": 2500 },
        "farming_journey": [...],
        "kcs_inspection": { "gate_check": "PASSED", "quick_lab": "LAB_PASSED", "brix": 7.5, "uniformity": 92 },
        "certifications": ["VietGAP", "OCOP_4_STAR"],
        "integrity_hash": "sha256_hash_here"
      }
    }
    ```

## Code Layout
### Backend (`f:\HTX_OCOP_PROJECT\src` hoặc `app/`)
- Domain Models: `app/Models/Agriculture/` (`Cooperative.php`, `ProductionUnit.php`, `FarmPlot.php`, `CropSeason.php`, `FarmingLog.php`, `Harvest.php`, `HarvestLotProduct.php`)
- Services: `app/Services/Agriculture/` (`FarmingLogService.php`, `HarvestService.php`, `KcsService.php`, `TraceabilityService.php`)
- Controllers: `app/Http/Controllers/Api/Agriculture/` (`FarmingLogController.php`, `HarvestController.php`, `PublicTraceabilityController.php`)
- Routes: `routes/api.php`
- Tests: `tests/Feature/Agriculture/`, `tests/Unit/Agriculture/`

### Frontend (`f:\HTX_OCOP_PROJECT\frontend\src`)
- Pages: `src/features/agriculture/pages/` (`FarmPlotsPage.tsx`, `CropSeasonsPage.tsx`, `FarmingLogsPage.tsx`, `HarvestsPage.tsx`, `LotTraceabilityPage.tsx`, `PublicTraceabilityPage.tsx`)
- Components: `src/features/agriculture/components/` (`PhiCountdownBadge.tsx`, `QuickMobileLogModal.tsx`, `HarvestKcsModal.tsx`, `HarvestLabelPrintModal.tsx`, `PlotStatusBadge.tsx`)
- Services: `src/services/` (`farmingLogApi.ts`, `harvestApi.ts`, `traceabilityApi.ts`)
- Router: `src/router/AppRoutes.tsx`
