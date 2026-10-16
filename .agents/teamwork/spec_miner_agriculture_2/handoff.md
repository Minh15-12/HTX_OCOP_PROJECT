# Agriculture & Traceability Specification Mining Report

**Date:** 2026-10-13T16:28:00Z  
**Author:** Agriculture Spec Miner (`spec_miner_agriculture_2`)  
**Context:** Phân hệ Sản xuất, Nhật ký canh tác Thông tư 02/2024/TT-BNNPTNT, Kiểm soát an toàn PHI Guard, Thu hoạch & KCS 3 cấp, Mã lô GS1, QR Truy xuất công khai & Liên thông hệ thống (Kho, Tài chính, OCOP).

---

## 1. Observation

Dựa trên việc rà soát trực tiếp các tài liệu đặc tả nghiệp vụ và mã nguồn hiện hữu trong kho mã nguồn:
- **Tài liệu đặc tả nghiệp vụ:**
  - `f:\HTX_OCOP_PROJECT\.agents\teamwork\ORIGINAL_REQUEST.md` (mục 2026-10-13T16:16:40Z): Yêu cầu số hóa toàn diện phân hệ Sản xuất, Nhật ký canh tác, Thu hoạch, KCS, GS1 QR Traceability cho HTX Tân Tiến (Ớt chuông Sweet Palermo Đỏ Đà Lạt).
  - `docs/31_FARMING_WORKFLOW.md`:
    - Dữ liệu thực tế HTX Tân Tiến: Ớt chuông Sweet Palermo Đỏ Đà Lạt, diện tích 280 ha (40 ha nhà kính thành viên + 240 ha liên kết tại Hòn Bồ P12, Đạ Sar, Lạc Dương), sản lượng 4.000–4.720 tấn/năm, mã PUC Cục BVTV.
    - Cấu trúc phân cấp 5 cấp (Mục 2): HTX (`Cooperative`) → Vùng trồng (`ProductionUnit`) → Thửa đất (`FarmPlot`) → Mùa vụ (`CropSeason`) → Nhật ký canh tác (`FarmingLog`).
    - Quy ước mã thửa đất (Mục 4.1): `PLOT-[MaHTX]-[MaXaVien]-[SoThuTu]`.
    - Quy ước mã lô GS1 (Mục 4.2): `LOT-[CoopCode]-[PlotCode]-[YYYYMMDD]-[Seq]`.
    - PHI Guard (Mục 5): `safe_harvest_date = spray_date + PHI_days`. Hệ thống chặn hoàn toàn lệnh thu hoạch nếu `harvest_date < safe_harvest_date` với mã lỗi `ERR_HARVEST_PHI_VIOLATION`. Thửa đất tự động chuyển `IN_QUARANTINE`.
    - Nhật ký canh tác 10 trường TT 02/2024 (Mục 6): Hoạt động, ngày thực hiện, mã thửa/vụ, mã vật tư/SKU, số lô vật tư, khối lượng/liều lượng, số ngày PHI, GPS tọa độ, hình ảnh thực tế, người ghi nhận + server timestamp.
    - KCS 3 cấp (Mục 7): Gate Check (Cổng nông trường) → Quick Lab (Test nhanh `LAB_PASSED` / `LAB_REJECTED`) → Grading (Grade A: Premium $\ge 90\%$ đồng đều, Brix $\ge 7^\circ$; Grade B: Standard; Reject: Không đạt an toàn).
    - Quy tắc kinh doanh (Mục 11): `BR-FARM-001` (`ERR_HARVEST_PHI_VIOLATION`), `BR-FARM-002` (không đóng mùa vụ nếu còn thu hoạch chưa giải quyết), `BR-FARM-003` (bắt buộc GPS và hình ảnh khi phun thuốc), `BR-FARM-004` (đối soát định mức vật tư xuất kho so với sử dụng), `BR-FARM-005` (vùng trồng mất mã PUC chuyển `UNDER_PUC_REVIEW`).
  - `AGENT.md` (Mục 11.1, 11.2, 11.4):
    - Mục 11.1: Bắt buộc chặn thu hoạch khi vi phạm PHI (`ERR_HARVEST_PHI_VIOLATION`), cấm bù trừ hoặc bypass. Chuẩn mã lô GS1. Quy trình KCS 3 cấp.
    - Mục 11.2: Cơ chế xuất nợ đầu vụ (Credit Advance) trả chậm lãi suất 0% dựa trên Trần tín dụng (Credit Limit). Thuật toán cấn trừ quyết toán mùa vụ:
      $$V_{total} = (V_{gradeA} \times P_A) + (V_{gradeB} \times P_B)$$
      $$Fee = V_{total} \times r \quad (r = 2\%\text{--}3\%)$$
      $$D = \min(D_{debt}, V_{total} - Fee)$$
      $$P_{net} = V_{total} - Fee - D$$
      Nợ chưa cấn trừ chuyển kỳ sau, không xóa nợ. Phương pháp xuất kho FEFO (có HSD) và FIFO (không HSD).
    - Mục 11.4: Tự động trích xuất minh chứng số (Evidence Cross-Reference) với mã băm SHA-256 và Hash Chaining `hash_n = SHA256(hash_{n-1} + data_n)`.
  - `docs/10_DOMAIN_MODEL.md` (Mục 8): Mô hình hóa các Aggregate: `ProductionUnit`, `FarmPlot`, `CropSeason`, `FarmingLog`, `MaterialUsage`, `PHI`, `Harvest`, `Lot`.
  - `docs/11_DATABASE_DESIGN_FINAL.md` (Mục 11–17): Thiết kế bảng vật lý PostgreSQL: `production_units`, `farm_plots`, `member_plot_assignments`, `crop_seasons`, `farming_logs`, `material_usages`, `phi_calculations`, `harvests`, `lots`.
- **Hiện trạng Database Migrations & Backend Code:**
  - Migrations hiện hữu:
    - `2026_01_01_000014_create_production_units_table.php`: `id`, `cooperative_id`, `unit_code`, `name`, `crop`, `area`, `location` (JSONB), `status`, `registration_information`.
    - `2026_01_01_000015_create_farm_plots_table.php`: `id`, `production_unit_id`, `plot_code`, `land_relation` (JSONB), `area`, `status`.
    - `2026_01_01_000016_create_member_plot_assignments_table.php`: `member_id`, `plot_id`, `assignment_type`, `start_date`, `end_date`, `status`.
    - `2026_01_01_000017_create_crop_seasons_table.php`: `id`, `production_unit_id`, `name`, `crop`, `start_date`, `expected_end_date`, `actual_end_date`, `status` (`PLANNED`, `ACTIVE`, `HARVESTING`, `COMPLETED`, `CANCELLED`).
    - `2026_01_01_000018_create_farming_logs_table.php` & `2026_01_01_000066_update_agriculture_for_phi_kcs_and_tt02.php`: Đã có các cột bổ sung cho 10 trường TT02: `material_id`, `material_batch_number`, `quantity_applied`, `unit`, `phi_days`, `gps_latitude`, `gps_longitude`.
    - `2026_01_01_000069_update_farming_and_audit_for_phi_and_hash_chain.php`: Thêm `quarantine_until` vào `farm_plots`, thêm `prev_hash` & `current_hash` vào `audit_events`.
    - `2026_01_01_000023_create_harvests_table.php` & migration 000066: Thêm `kcs_status`, `kcs_gate_check` (JSONB), `kcs_quick_lab` (JSONB), `grade` (`GRADE_A`, `GRADE_B`, `REJECT`), `brix_level`, `uniformity_rate`.
    - `2026_01_01_000024_create_lots_table.php`: `lot_code` (unique), `harvest_id`, `quantity`, `unit`, `status`.
  - Backend Services:
    - `HarvestService.php`: Phương thức `verifyPhiSafety()` (dòng 167–207) truy vấn `PhiCalculationModel` và ném ra `ERR_HARVEST_PHI_VIOLATION` (HTTP 400) kèm ghi audit `PHI_VIOLATION_ATTEMPTED` khi `harvestDate < safety_date`.
    - `FarmingLogService.php`: Tự động tính `safe_harvest_date`, sinh `PhiCalculationModel`, khóa trạng thái thửa đất sang `IN_QUARANTINE` với `quarantine_until = safe_harvest_date` (dòng 134–155). Bắt buộc GPS khi phun thuốc (`ERR_GPS_LOCATION_REQUIRED`).
    - `LotService.php`: Sinh mã lô GS1: `LOT-[CoopCode]-[PlotCode]-[YYYYMMDD]-[Seq]`. Cung cấp phương thức `getLotTraceability($id)`.
    - `ReceivablePayableService.php`: Phương thức `offsetHarvestDebt()` (dòng 258–326) triển khai chuẩn xác công thức cấn trừ nợ quyết toán mùa vụ và lập phiếu chi `PC-QT-...`.
    - `OcopEvidenceAutoExtractionService.php`: Tự động trích xuất `FARM_PLOT` (TC-A.1.1), `MEMBER_LIST` (TC-A.2.1), `PHI_JOURNAL` (TC-C.2.2) thành PDF kèm băm SHA-256.
  - Backend Routes:
    - Tuyến `/api/v1/lots/{id}/traceability` hiện đang nằm trong nhóm middleware `auth:sanctum` và `tenant.scope` (tại `backend/routes/api.php` dòng 60 & 152).
- **Hiện trạng Frontend:**
  - `frontend/src/router/AppRoutes.tsx`: Tuyến `/agriculture/lots/:id/traceability` hiện được bọc bên trong `ProtectedRoute` (dòng 56) và `AppLayout` (dòng 57). Chưa có route công khai `/trace/:lotId` hoặc `/public/trace/:lotId`.
  - `frontend/src/features/agriculture/pages/LotTraceabilityPage.tsx`: Màn hình hiển thị cây truy xuất nguồn gốc, nhưng đang dùng fallback dữ liệu Chè Shan Tuyết và các trường hiển thị chưa khớp hoàn toàn với response JSON thực tế từ backend `LotService::getLotTraceability()`.

---

## 2. Logic Chain

1. **Từ Yêu cầu TT 02/2024 và An toàn PHI:**
   - Hoạt động canh tác sử dụng thuốc BVTV hoặc hóa chất có thời gian cách ly bắt buộc phải được theo dõi sát sao.
   - Khi có nhật ký phun thuốc với `phi_days > 0`, thời điểm an toàn sớm nhất để thu hoạch là:
     $$\text{safe\_harvest\_date} = \text{activity\_date} + \text{phi\_days}$$
   - Trong khoảng thời gian từ `activity_date` đến `safe_harvest_date`, thửa đất phải mang trạng thái `IN_QUARANTINE`.
   - Nếu nông dân hoặc cán bộ cố tình tạo lệnh thu hoạch với `harvest_date < safe_harvest_date`, hệ thống kích hoạt chốt chặn cứng (`BR-FARM-001`), từ chối giao dịch với mã lỗi `ERR_HARVEST_PHI_VIOLATION` và ghi nhật ký kiểm toán hành vi vi phạm (`PHI_VIOLATION_ATTEMPTED`).
2. **Từ Quy trình KCS 3 Cấp:**
   - Sản phẩm thu hoạch không được phép nhập kho hay phân phối ra thị trường ngay mà phải trải qua kiểm soát chất lượng 3 cấp:
     1. Gate Check: Kiểm tra nguồn gốc thửa đất, mã lệnh thu hoạch và xác nhận đã qua thời hạn cách ly PHI.
     2. Quick Lab: Kiểm nghiệm nhanh mẫu đại diện nhằm đảm bảo không có dư lượng vượt ngưỡng hoặc hoạt chất cấm (`LAB_PASSED`). Nếu phát hiện chất cấm, đánh dấu `LAB_REJECTED` và chặn toàn bộ lô hàng (`ERR_SUPPLY_PROHIBITED_SUBSTANCE`).
     3. Grading: Đánh giá cảm quan và đo lường thông số (độ đồng đều $\ge 90\%$, Brix $\ge 7.0^\circ$). Nếu đạt cả hai điều kiện này, xếp hạng `Grade A (Premium)`. Nếu chỉ đạt chuẩn an toàn lab nhưng ngoại hình/độ Brix thấp hơn, xếp hạng `Grade B (Standard)`. Nếu vi phạm an toàn, xếp vào `Reject`.
3. **Từ Chuẩn Định danh GS1 & Truy xuất Nguồn gốc Công khai:**
   - Mỗi đợt thu hoạch sau khi phân loại KCS sẽ được tạo một mã lô duy nhất theo chuẩn GS1: `LOT-[CoopCode]-[PlotCode]-[YYYYMMDD]-[Seq]`.
   - Mã lô này được mã hóa thành mã QR dán trên bao bì sản phẩm ớt chuông Sweet Palermo.
   - Khi người tiêu dùng hoặc cơ quan thanh tra quét mã QR, ứng dụng phải mở ngay trang tra cứu công khai (`/trace/:lotId` hoặc `/public/trace/:lotId`) mà **không được đòi hỏi đăng nhập tài khoản**.
   - Do đó, backend phải cung cấp một API công khai (không qua Sanctum token) và frontend phải có Route công khai (không qua `ProtectedRoute`).
4. **Từ Liên thông Nghiệp vụ Kho & Tài chính:**
   - Xã viên canh tác được HTX xuất ứng vật tư đầu vụ theo hình thức trả chậm (*Credit Advance*).
   - Khi thu mua sản phẩm sau thu hoạch, hệ thống xác định giá trị thu mua $V_{total}$ từ sản lượng Grade A và Grade B theo hợp đồng.
   - Hệ thống tự động trừ phí dịch vụ HTX ($Fee = V_{total} \times r$) và cấn trừ nợ vật tư ($D = \min(D_{debt}, V_{total} - Fee)$).
   - Phần tiền còn lại ($P_{net}$) được giải ngân cho xã viên bằng phiếu chi, đảm bảo tính minh bạch tài chính.
5. **Từ Liên thông Hồ sơ OCOP:**
   - Các dữ liệu vùng trồng, nhật ký canh tác không tồn tại độc lập mà là bằng chứng số hóa phục vụ trực tiếp cho việc hoàn thiện hồ sơ OCOP Quyết định 148/QĐ-TTg.
   - Để tránh giả mạo, mỗi báo cáo trích xuất tự động được băm mã SHA-256 và gắn vào cây kiểm toán Hash Chaining.

---

## 3. Features Discovered

| # | Category | Feature | Description | Inputs | Outputs | Error Behavior | Discovered Via |
|---|----------|---------|-------------|--------|---------|----------------|----------------|
| 1 | Production Hierarchy | Quản lý Vùng trồng (ProductionUnit) | Quản lý mã vùng trồng PUC, diện tích, địa bàn trồng trọt, trạng thái hoạt động | `unit_code`, `name`, `crop`, `area`, `location`, `status` | Record `production_units` | `DUPLICATE_UNIT_CODE` (409), `INVALID_AREA` (422) | `docs/31_FARMING_WORKFLOW.md`, `11_DATABASE_DESIGN_FINAL.md` |
| 2 | Production Hierarchy | Quản lý Thửa đất (FarmPlot) | Phân định thửa đất canh tác theo quy chuẩn `PLOT-[HTX]-[MaXaVien]-[STT]`, tọa độ GPS, diện tích | `production_unit_id`, `plot_code`, `area`, `land_relation` | Record `farm_plots` | `DUPLICATE_PLOT_CODE` (409), `PLOT_NOT_FOUND` (404) | `docs/31_FARMING_WORKFLOW.md`, `FarmPlotService.php` |
| 3 | Production Hierarchy | Phân công Xã viên vào Thửa đất | Gán xã viên trực tiếp canh tác và chịu trách nhiệm trên từng thửa đất | `plot_id`, `member_id`, `assignment_type`, `start_date`, `end_date` | Record `member_plot_assignments` | `MEMBER_NOT_FOUND` (404), `UNAUTHORIZED_TENANT_ACCESS` (403) | `FarmPlotService.php`, `docs/10_DOMAIN_MODEL.md` |
| 4 | Production Hierarchy | Quản lý Mùa vụ Canh tác (CropSeason) | Vòng đời mùa vụ nông sản (`PLANNED` → `ACTIVE` → `HARVESTING` → `COMPLETED` / `CANCELLED`) | `production_unit_id`, `name`, `crop`, `start_date`, `expected_end_date` | Record `crop_seasons` | `INVALID_DATE_RANGE` (422), `SEASON_NOT_FOUND` (404) | `CropSeasonService.php`, `docs/31_FARMING_WORKFLOW.md` |
| 5 | Farming Log | Nhật ký Canh tác 10 trường TT 02/2024 | Ghi nhận đầy đủ 10 trường bắt buộc: hoạt động, ngày giờ, thửa đất, mùa vụ, SKU vật tư, số lô vật tư, liều lượng, số ngày PHI, GPS, ảnh đính kèm, người thực hiện + timestamp | `crop_season_id`, `plot_id`, `activity_type`, `activity_date`, `material_id`, `material_batch_number`, `quantity_applied`, `unit`, `phi_days`, `gps_latitude`, `gps_longitude`, `attachment_reference` | Record `farming_logs`, JSON response | `SEASON_CLOSED` (400), `PLOT_SEASON_MISMATCH` (400), `ERR_GPS_LOCATION_REQUIRED` (422) | `FarmingLogService.php`, `docs/31_FARMING_WORKFLOW.md` |
| 6 | PHI Guard | Tự động tính toán PHI & Khóa cách ly Thửa đất | Tính `safe_harvest_date = activity_date + phi_days`, sinh record `phi_calculations`, tự động cập nhật thửa đất sang `IN_QUARANTINE` | `activity_date`, `phi_days`, `plot_id`, `material_id` | Record `phi_calculations` (status: `ISOLATED`/`ACTIVE`), cập nhật `farm_plots.status = 'IN_QUARANTINE'`, `farm_plots.quarantine_until` | Ghi nhận `UNKNOWN` nếu vật tư không có thông tin PHI | `FarmingLogService.php`, `docs/31_FARMING_WORKFLOW.md`, `AGENT.md` (11.1) |
| 7 | Harvest Validation | Chốt chặn an toàn PHI (PHI Safety Guard) | Chặn 100% mọi nỗ lực tạo lệnh thu hoạch khi ngày thu hoạch nhỏ hơn ngày an toàn PHI | `crop_season_id`, `plot_id`, `harvest_date`, `quantity`, `unit` | Record `harvests` (nếu hợp lệ), Audit log `PHI_VIOLATION_ATTEMPTED` (nếu vi phạm) | `ERR_HARVEST_PHI_VIOLATION` (HTTP 400, chặn đứng không bù trừ) | `HarvestService.php`, `docs/31_FARMING_WORKFLOW.md` |
| 8 | Harvest Validation | Ràng buộc Thửa đất - Mùa vụ - Sản lượng | Kiểm tra thửa đất thuộc đúng vùng sản xuất của mùa vụ và sản lượng > 0 | `plot_id`, `crop_season_id`, `quantity` | Xác nhận hợp lệ trước khi tạo | `PLOT_SEASON_MISMATCH` (400), `INVALID_HARVEST_QUANTITY` (400) | `HarvestService.php` |
| 9 | 3-tier KCS | Cấp 1: Gate Check (Cổng nông trường) | Kiểm tra mã lệnh thu hoạch, đối soát trạng thái cách ly PHI của thửa đất và nguồn gốc lô hàng | Mã lệnh, `plot_id`, `kcs_gate_check` JSONB | `kcs_gate_check` passed / rejected | Chặn thu hoạch nếu thửa đất đang `IN_QUARANTINE` | `docs/31_FARMING_WORKFLOW.md`, `HarvestModel.php` |
| 10 | 3-tier KCS | Cấp 2: Quick Lab (Phân tích nhanh) | Lấy mẫu kiểm nghiệm nhanh dư lượng thuốc BVTV và phát hiện hoạt chất cấm | Mẫu thử nghiệm, chỉ số test dư lượng | `kcs_status = 'LAB_PASSED'` hoặc `'LAB_REJECTED'` | Bị từ chối nếu có hoạt chất cấm (`ERR_SUPPLY_PROHIBITED_SUBSTANCE`) | `docs/31_FARMING_WORKFLOW.md`, `docs/32_INVENTORY_WORKFLOW.md` |
| 11 | 3-tier KCS | Cấp 3: Grading (Phân loại phẩm cấp) | Phân loại nông sản: Grade A (Premium: $\ge 90\%$ đồng đều, Brix $\ge 7^\circ$), Grade B (Standard: đạt lab an toàn), Reject (không đạt an toàn hoặc hỏng) | `brix_level`, `uniformity_rate`, kết quả lab | Cập nhật `grade` (`GRADE_A`, `GRADE_B`, `REJECT`) | Không đạt điều kiện Grade A thì tự động hạ xuống Grade B hoặc Reject | `docs/31_FARMING_WORKFLOW.md`, `HarvestService.php` |
| 12 | GS1 Traceability | Sinh Mã Lô GS1 tự động | Sinh mã lô theo chuẩn GS1 `LOT-[CoopCode]-[PlotCode]-[YYYYMMDD]-[Seq]`, kiểm tra tính duy nhất | `harvest_id`, `quantity`, `unit`, `custom_lot_code` (tùy chọn) | Record `lots` (`lot_code`), cập nhật `harvests.lot_id` | Fallback thêm chuỗi ngẫu nhiên nếu trùng mã trong ngày | `LotService.php`, `docs/31_FARMING_WORKFLOW.md` |
| 13 | GS1 Traceability | API Tra cứu Truy xuất Nguồn gốc | Truy xuất cây phả hệ dữ liệu từ mã lô: HTX, Vùng trồng PUC, Thửa đất, Xã viên, Mùa vụ, 10 trường TT02 và KCS | `lot_id` | Cấu trúc dữ liệu JSON đầy đủ cây truy xuất nguồn gốc | `LOT_NOT_FOUND` (404), `UNAUTHORIZED_TENANT_ACCESS` (403) | `LotService.php`, `LotController.php` |
| 14 | Public QR Route | Tuyến Tra cứu QR Công khai không cần Auth | Cho phép khách hàng/thanh tra quét mã QR xem toàn bộ hồ sơ truy xuất mà không bị chặn bởi Auth | `lot_id` từ URL path | Render trang Public Traceability View | Hiện tại đang bị chặn bởi `auth:sanctum` và `ProtectedRoute` (CẦN MỞ) | `ORIGINAL_REQUEST.md` (R3), `docs/31_FARMING_WORKFLOW.md` |
| 15 | System Integration | Liên kết Kho: Xuất nợ đầu vụ (Credit Advance) | Cấp phát vật tư hạt giống, phân bón, thuốc sinh học trả chậm cho xã viên theo hạn mức tín dụng | `member_id`, `materials`, `credit_limit` | Phiếu xuất kho nợ, ghi nhận công nợ `Receivable` | `INV-RULE-003` (vượt trần tín dụng bị từ chối) | `docs/32_INVENTORY_WORKFLOW.md`, `AGENT.md` (11.2) |
| 16 | System Integration | Liên kết Kho: Kiểm soát định mức sử dụng | Đối soát số lượng vật tư sử dụng trong nhật ký canh tác so với tổng số lượng đã xuất kho cho xã viên | `farming_log.quantity_applied`, phiếu xuất kho xã viên | Cảnh báo chênh lệch | `BR-FARM-004` (không vượt quá định mức xuất kho) | `docs/31_FARMING_WORKFLOW.md` |
| 17 | System Integration | Liên kết Tài chính: Quyết toán Mùa vụ (Harvest Settlement) | Tự động tính giá trị thu mua Grade A/B, khấu trừ phí dịch vụ HTX $Fee$, cấn trừ công nợ vật tư $D$, sinh phiếu chi thực trả $P_{net}$ | `member_id`, `produce_value` ($V_{total}$), `service_fee_rate` ($r$) | Cập nhật công nợ `ReceivablePayable`, sinh `DebtSettlement`, sinh `CashTransaction` | `ERR_FINANCE_INVALID_SETTLEMENT` (400), nợ dư chuyển kỳ sau | `ReceivablePayableService.php`, `docs/33_FINANCE_WORKFLOW.md` |
| 18 | System Integration | Liên kết OCOP: Trích xuất Minh chứng Số hóa SHA-256 | Tự động trích xuất vùng trồng, xã viên, nhật ký canh tác PHI làm minh chứng số cho tiêu chí OCOP (TC-A.1.1, TC-A.2.1, TC-C.2.2) với mã băm SHA-256 | `application_id`, `extraction_type` (`FARM_PLOT`, `MEMBER_LIST`, `PHI_JOURNAL`, `ALL`) | Record `evidences`, file PDF trong storage, checksum SHA-256, liên kết `evidence_links` | `APPLICATION_NOT_FOUND` (404), `INVALID_EXTRACTION_TYPE` (400) | `OcopEvidenceAutoExtractionService.php`, `docs/34_OCOP_WORKFLOW.md` |
| 19 | Audit & Security | Nhật ký Kiểm toán & Hash Chaining | Ghi vết mọi sự kiện nhạy cảm (`HARVEST_CREATED`, `PHI_VIOLATION_ATTEMPTED`, `LOT_CREATED`) kèm nối chuỗi băm SHA-256 chống sửa đổi | `action`, `entity_type`, `entity_id`, `before`, `after`, `cooperative_id` | Record `audit_events` với `prev_hash`, `current_hash` | Dữ liệu audit là bất biến (immutable) | `AuditService.php`, `AGENT.md` (11.4) |

---

## 4. Edge Cases

| # | Feature | Input / Scenario | Observed Behavior & Expected Rule |
|---|---------|------------------|-----------------------------------|
| EC-01 | PHI Safety Check | Thu hoạch vào đúng ngày an toàn (`harvest_date == safe_harvest_date`) | **Cho phép hợp lệ**. Điều kiện kiểm tra là `safety_date > harvest_date`. Khi ngày thu hoạch bằng ngày an toàn thì thời gian cách ly đã kết thúc, đáp ứng an toàn thực phẩm. |
| EC-02 | PHI Safety Check | Thu hoạch trước ngày an toàn (`harvest_date < safe_harvest_date`) | **Chặn hoàn toàn**. Hệ thống ném ngoại lệ `ERR_HARVEST_PHI_VIOLATION` (HTTP 400), không ghi nhận lệnh thu hoạch, đồng thời ghi log `PHI_VIOLATION_ATTEMPTED` vào bảng `audit_events`. |
| EC-03 | PHI Safety Check | Thửa đất có nhiều lần phun thuốc liên tiếp trong cùng mùa vụ | Hệ thống sắp xếp lấy ngày cách ly an toàn xa nhất (`orderBy('safety_date', 'desc')->first()`). Chỉ khi ngày thu hoạch lớn hơn hoặc bằng ngày an toàn xa nhất này thì mới được phép thu hoạch. |
| EC-04 | Plot & Season Integrity | Thu hoạch từ thửa đất không thuộc Vùng sản xuất của mùa vụ đó | Ném lỗi `PLOT_SEASON_MISMATCH` (HTTP 400). Ngăn chặn việc khai khống hoặc gán sai thửa đất ngoài vùng quy hoạch. |
| EC-05 | Farming Log Creation | Ghi nhật ký canh tác vào mùa vụ đã đóng (`status = 'COMPLETED'` hoặc `'CANCELLED'`) | Ném lỗi `SEASON_CLOSED` (HTTP 400). Mùa vụ đã đóng băng không được phép sửa đổi hoặc thêm dữ liệu canh tác hồi tố. |
| EC-06 | Farming Log TT02 | Ghi nhật ký phun thuốc BVTV (`activity_type = 'SPRAYING'` / `'PHUN_THUOC'`) nhưng không cung cấp tọa độ GPS | Ném lỗi `ERR_GPS_LOCATION_REQUIRED` (HTTP 422). Theo quy tắc `BR-FARM-003`, hoạt động phun thuốc bắt buộc phải có tọa độ GPS tại hiện trường. |
| EC-07 | Harvest Quantity | Tạo lệnh thu hoạch với sản lượng bằng 0 hoặc âm (`quantity <= 0`) | Validation chặn lại ở tầng Request hoặc Service ném lỗi `INVALID_HARVEST_QUANTITY` (HTTP 400). Sản lượng thu hoạch bắt buộc phải $> 0$. |
| EC-08 | GS1 Lot Numbering | Tạo mã lô trùng lặp trong ngày (cùng HTX, thửa đất, ngày tạo) | `LotService` kiểm tra trùng mã: Nếu mã `LOT-[CoopCode]-[PlotCode]-[YYYYMMDD]-[Seq]` đã tồn tại, tự động thay thế `Seq` bằng chuỗi ngẫu nhiên 4 ký tự `Str::random(4)` để đảm bảo tính duy nhất tuyệt đối (`UNIQUE`). |
| EC-09 | Harvest Settlement | Xã viên có dư nợ vật tư đầu vụ lớn hơn giá trị nông sản sau trừ phí ($D_{debt} > V_{total} - Fee$) | Hệ thống chỉ cấn trừ tối đa số tiền bằng $V_{total} - Fee$, tiền thực trả $P_{net} = 0$. Khoản nợ còn lại được giữ nguyên và kết chuyển sang mùa vụ tiếp theo, tuyệt đối không được xóa nợ. |
| EC-10 | Public QR Scan | Người dùng ngoài quét mã QR truy xuất (`/trace/:lotId` hoặc `/public/trace/:lotId`) khi chưa đăng nhập | **Yêu cầu spec:** Trang phải hiển thị đầy đủ thông tin truy xuất (HTX, Vùng trồng PUC, ớt chuông Palermo, nhật ký 10 trường, kết quả KCS, VietGAP) mà không bị chuyển hướng về màn hình Login. Hiện trạng mã nguồn đang bị chặn bởi `auth:sanctum` và `ProtectedRoute`, cần mở route public. |
| EC-11 | KCS Quick Lab | Kết quả kiểm nghiệm lab phát hiện hoạt chất cấm trong danh mục của Bộ NN&PTNT | Lô hàng bị từ chối ngay lập tức (`kcs_status = 'LAB_REJECTED'`), phân loại `grade = 'REJECT'`, trả về lỗi `ERR_SUPPLY_PROHIBITED_SUBSTANCE` và tự động gửi thông báo cảnh báo đến Ban Giám đốc HTX. |
| EC-12 | KCS Grading | Nông sản đạt Quick Lab an toàn nhưng tỷ lệ đồng đều chỉ đạt $85\%$ (< 90%) hoặc độ Brix $6.5^\circ$ (< $7.0^\circ$) | Không được xếp vào `GRADE_A (Premium)`, mà tự động xếp vào `GRADE_B (Standard)`. Khi quyết toán, sản lượng này được tính theo đơn giá $P_B$ thấp hơn. |

---

## 5. Caveats

1. **Route Truy xuất QR Công khai (Public Traceability):**
   - Hiện tại ở Backend, route `/lots/{id}/traceability` nằm trong nhóm middleware `Route::middleware(['auth:sanctum', 'tenant.scope'])`. Cần phải tách ra hoặc bổ sung route public `/public/lots/{id}/traceability` hoặc `/trace/{id}` nằm ngoài auth middleware.
   - Ở Frontend, route `/agriculture/lots/:id/traceability` nằm trong `ProtectedRoute` của `AppRoutes.tsx`. Cần bổ sung route công khai `/trace/:lotId` hoặc `/public/trace/:lotId` thuộc layout công khai (không cần header/sidebar đăng nhập của trang quản trị).
2. **KCS Form Validation:**
   - Cột `kcs_gate_check`, `kcs_quick_lab`, `grade`, `brix_level`, `uniformity_rate` đã có trong database migration và Model/Resource/DTO, nhưng `CreateHarvestRequest.php` và `UpdateHarvestRequest.php` hiện chưa khai báo validation rules cho các trường này. Khi thực hiện bước KCS cần đảm bảo cập nhật Form Request rules.
3. **Mã Thửa đất và Mã Xã viên:**
   - Chuẩn quy ước là `PLOT-[HTX]-[MaXaVien]-[STT]`. Trong cơ sở dữ liệu hiện tại, quan hệ giữa Thửa đất và Xã viên được quản lý qua bảng trung gian `member_plot_assignments` (quan hệ N-N và theo thời gian). Khi sinh mã thửa đất, cần lấy mã xã viên đang được phân công chính thức.

---

## 6. Conclusion

- Toàn bộ 8 khối yêu cầu nghiệp vụ chuyên sâu về Nông nghiệp, Nhật ký canh tác TT 02/2024, PHI Guard, Thu hoạch & KCS 3 cấp, GS1 Lot ID và Liên thông Nghiệp vụ (Kho, Tài chính, OCOP) đã được khám phá, đối soát và bóc tách đầy đủ từ các tài liệu chuẩn (`docs/31_FARMING_WORKFLOW.md`, `AGENT.md`, `docs/10`, `docs/11`, `docs/32`, `docs/33`, `docs/34`).
- Cơ chế bảo vệ cốt lõi `ERR_HARVEST_PHI_VIOLATION` đã có nền tảng vững chắc trong `HarvestService` và các bài kiểm thử tự động `HarvestLotProductTest.php`.
- Phân hệ sẵn sàng cho việc hoàn thiện giao diện người dùng Nông dân (Farmer UX) với các nút bấm to, giao diện thân thiện trên mobile và tuyến tra cứu mã QR công khai không rào cản xác thực.

---

## 7. Verification Method

Các kỹ sư và agent tiếp theo có thể xác minh độc lập các phát hiện bằng các lệnh sau:

1. **Kiểm tra Test Suite Nông nghiệp Backend:**
   ```powershell
   cd f:\HTX_OCOP_PROJECT\backend
   php artisan test --filter=AgricultureInfrastructureTest
   php artisan test --filter=CropSeasonAndFarmingLogTest
   php artisan test --filter=HarvestLotProductTest
   ```
   *Kết quả xác minh thực tế:* 18/18 tests đã chạy thành công 100% không có lỗi.

2. **Kiểm tra Cơ chế PHI Guard:**
   - Xem file: `backend/app/Modules/Agriculture/Application/Services/HarvestService.php` dòng 167–207.
   - Chạy test case vi phạm PHI:
     ```powershell
     php artisan test --filter=test_create_harvest_is_blocked_when_phi_safety_date_is_violated
     ```

3. **Kiểm tra Thuật toán Cấn trừ Công nợ Quyết toán Mùa vụ:**
   - Xem file: `backend/app/Modules/Finance/Application/Services/ReceivablePayableService.php` dòng 258–326.
   - Chạy test tài chính:
     ```powershell
     php artisan test --filter=FinanceManagementTest
     ```

4. **Kiểm tra Băm SHA-256 Minh chứng Số OCOP:**
   - Xem file: `backend/app/Modules/Ocop/Evidence/Application/Services/OcopEvidenceAutoExtractionService.php` dòng 97–105.
   - Chạy test OCOP Evidence:
     ```powershell
     php artisan test --filter=OcopEvidenceTest
     ```
