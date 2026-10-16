# TEST INFRASTRUCTURE & ARCHITECTURE: AGRICULTURE, FARMING LOGS, HARVEST, 3-TIER KCS & TRACEABILITY

## 1. Test Architecture & Philosophy

### 1.1 Philosophy: Opaque-Box & Requirement-Driven
The testing framework adheres strictly to **Opaque-Box (Black-Box)**, requirement-driven principles derived from:
- **Thông tư 02/2024/TT-BNNPTNT**: Quy chuẩn quốc gia về nhật ký canh tác điện tử, quản lý vùng trồng (PUC), và mã định danh thửa đất.
- **Quyết định 148/QĐ-TTg**: Tiêu chuẩn OCOP quốc gia, liên thông minh chứng số và kiểm tra tính toàn vẹn (SHA-256).
- **HTX Nông nghiệp Tân Tiến (Đà Lạt) Domain Specifications**: Quy trình sản xuất thực tế đối với sản phẩm chủ lực Ớt chuông Sweet Palermo Đỏ Đà Lạt, bao gồm cách ly an toàn thuốc BVTV (PHI Guard), kiểm định chất lượng 3 cấp (KCS Gate Check, Quick Lab, Grading), định danh lô hàng GS1, và tra cứu nguồn gốc QR công khai không rào cản xác thực.

### 1.2 Test Isolation & Determinism
- **Framework**: PHPUnit / Laravel Test Suite (`Tests\TestCase`).
- **Database Isolation**: Mọi test sử dụng `Illuminate\Foundation\Testing\RefreshDatabase` kết hợp migration cơ sở dữ liệu vật lý PostgreSQL (`pgcrypto` UUID).
- **Self-Contained State**: Mỗi test method tự khởi tạo dữ liệu nghiệp vụ (Cooperative, ProductionUnit, FarmPlot, CropSeason, User/Role/Permissions, Materials), độc lập hoàn toàn với thứ tự chạy và không để lại dữ liệu rác.
- **Multi-Tenant Isolation**: Ràng buộc bảo mật dữ liệu giữa các HTX được kiểm tra nghiêm ngặt qua tenant scoping (`cooperative_id`).

---

## 2. 4-Tier Test Suite Structure

The test suite is structured into 4 distinct tiers to ensure end-to-end verification from unit contracts to real-world cooperative operations:

```
+---------------------------------------------------------------------------------------+
|  Tier 4: Real-World Enterprise Scenario (HTX Tân Tiến Sweet Palermo Đỏ Đà Lạt)        |
+---------------------------------------------------------------------------------------+
|  Tier 3: Cross-Feature Integrated Workflows (Supply -> Farming -> Harvest -> Finance) |
+---------------------------------------------------------------------------------------+
|  Tier 2: Boundary, Edge Cases & Adversarial Verification (PHI, GPS, GS1 Collisions)  |
+---------------------------------------------------------------------------------------+
|  Tier 1: Feature Coverage & API Contracts (TT02 10-Field, PHI Guard, KCS, GS1, Trace) |
+---------------------------------------------------------------------------------------+
```

### 2.1 Tier 1: Feature Coverage (Core API Contracts & Safety Invariants)
Verifies discrete feature requirements against functional specifications:
1. **TT02/2024 10-Field Farming Log**:
   - Ghi nhận và phản hồi đầy đủ 10 trường quy chuẩn: `activity_type`, `activity_date`, `plot_id`, `crop_season_id`, `material_id`, `material_batch_number`, `quantity_applied`, `unit`, `phi_days`, `gps_latitude`, `gps_longitude`.
2. **PHI Safety Guard & Plot Quarantine**:
   - Khi ghi nhận nhật ký phun thuốc BVTV (`SPRAYING`) có `phi_days > 0`, hệ thống tự động tính:
     $$\text{safe\_harvest\_date} = \text{activity\_date} + \text{phi\_days}$$
   - Bản ghi `phi_calculations` được tạo ở trạng thái `ISOLATED`.
   - Thửa đất (`FarmPlot`) tự động chuyển sang `status = 'IN_QUARANTINE'` và cập nhật `quarantine_until = safe_harvest_date`.
3. **Hard Blocker `ERR_HARVEST_PHI_VIOLATION`**:
   - Khi tạo lệnh thu hoạch với `harvest_date < safe_harvest_date`, hệ thống bắt buộc từ chối 100% với HTTP 400, mã lỗi `ERR_HARVEST_PHI_VIOLATION`.
   - Hệ thống tự động ghi nhận sự kiện kiểm toán bất biến `PHI_VIOLATION_ATTEMPTED` vào bảng `audit_events`.
4. **GS1 Standard Lot Numbering**:
   - Định dạng mã lô thu hoạch chuẩn GS1: `LOT-[CoopCode]-[PlotCode]-[YYYYMMDD]-[Seq]`.
5. **3-Tier KCS Inspection Workflow**:
   - *Tier 1 Gate Check*: Đối soát mã lệnh, trạng thái thửa đất, xác nhận vượt qua thời hạn PHI.
   - *Tier 2 Quick Lab*: Kiểm tra tồn dư hóa chất (`kcs_status = 'LAB_PASSED'` hoặc `'LAB_REJECTED'`).
   - *Tier 3 Grading*: Phân loại chất lượng nông sản:
     - Grade A (Premium): Độ đồng đều $\ge 90\%$, độ ngọt Brix $\ge 7.0^\circ$.
     - Grade B (Standard): Đạt lab an toàn nhưng không đạt tiêu chuẩn Grade A.
     - Reject: Không đạt an toàn thực phẩm hoặc bị từ chối ở Quick Lab.
6. **Public QR Traceability API**:
   - Endpoint công khai `GET /api/public/trace/{lotId}` không yêu cầu token xác thực Sanctum (`auth:sanctum` bypass).
   - Cho phép tra cứu bằng cả UUID lẫn mã lô chuỗi GS1 (`lot_code`).
   - Trả về đầy đủ hồ sơ nguồn gốc: HTX, Vùng trồng (PUC, VietGAP), Thửa đất (GPS), Mùa vụ, Hành trình nhật ký canh tác, và kết quả kiểm định KCS 3 cấp.

### 2.2 Tier 2: Boundary & Corner Cases (Adversarial Verification)
Tests precision under edge conditions and invalid input combinations:
1. **Exact Safe Harvest Date Boundary**:
   - Thu hoạch tại thời điểm `harvest_date == safe_harvest_date`.
   - Thời gian cách ly đã hết, lệnh thu hoạch phải được **chấp thuận thành công**.
2. **Zero PHI Days Spraying**:
   - Phun chế phẩm sinh học hoặc vi sinh hữu cơ với `phi_days = 0`.
   - Thửa đất không bị khóa cách ly `IN_QUARANTINE`.
3. **Missing / Invalid GPS Coordinates Enforcement**:
   - Ghi nhật ký phun thuốc BVTV không kèm tọa độ GPS hoặc tọa độ ngoài phạm vi hợp lệ.
   - Hệ thống ném lỗi HTTP 422 `ERR_GPS_LOCATION_REQUIRED`.
4. **GS1 Lot Code Duplicate / Collision Prevention**:
   - Tạo nhiều lô trong cùng một ngày cho cùng một thửa đất.
   - Bộ sinh mã lô tự động tăng số thứ tự hoặc tạo suffix chống trùng lặp, đảm bảo tính duy nhất tuyệt đối (`unique:lots,lot_code`).
5. **Harvest Quantity Boundary**:
   - Nhập sản lượng $\le 0$ bị từ chối với lỗi validation HTTP 400/422.
6. **Cumulative Multi-Spray PHI**:
   - Thửa đất trải qua nhiều đợt phun thuốc liên tiếp với các ngày an toàn khác nhau.
   - Chốt chặn PHI Guard bắt buộc lấy ngày an toàn lớn nhất ($\max(safe\_harvest\_date)$).
7. **Quick Lab Rejection Cascading**:
   - Khi Quick Lab phát hiện hoạt chất cấm (`LAB_REJECTED`), toàn bộ lô hàng tự động bị chuyển sang phân hạng `grade = 'REJECT'`.

### 2.3 Tier 3: Cross-Feature Integrated Workflows
Verifies end-to-end data flow across modules (Inventory $\rightarrow$ Agriculture $\rightarrow$ Quality $\rightarrow$ Finance):
1. **Credit Advance**: HTX xuất ứng phân bón/thuốc BVTV cho xã viên ghi nợ đầu vụ.
2. **Farming & PHI Lock**: Xã viên phun thuốc bảo vệ thực vật, hệ thống khóa cách ly thửa đất `IN_QUARANTINE`.
3. **Safety Enforcement**: Cố tình thu hoạch sớm bị chặn đứng bởi `ERR_HARVEST_PHI_VIOLATION`.
4. **Safe Harvest & KCS Inspection**: Đợi hết hạn cách ly, tạo lệnh thu hoạch hợp lệ, thực hiện Gate Check, kiểm nghiệm Quick Lab đạt chuẩn, phân loại KCS ra sản lượng Grade A và Grade B.
5. **GS1 Lot Packaging**: Đóng gói và phát hành mã lô GS1 kèm mã QR tra cứu công khai.
6. **Financial Settlement & Debt Offset**:
   - Tính tổng giá trị nông sản:
     $$V_{total} = (Q_{GradeA} \times P_A) + (Q_{GradeB} \times P_B)$$
   - Khấu trừ phí dịch vụ HTX: $Fee = V_{total} \times r$ ($r = 2.5\%$).
   - Cấn trừ nợ vật tư đầu vụ: $D = \min(D_{debt}, V_{total} - Fee)$.
   - Giải ngân tiền thực trả: $P_{net} = V_{total} - Fee - D$.
   - Tự động sinh phiếu chi thanh toán `PC-QT-...` và phiếu cấn trừ nợ `DebtSettlement`.

### 2.4 Tier 4: Real-World Scenario (HTX Nông Nghiệp Tân Tiến - Sweet Palermo Đỏ Đà Lạt)
Emulates the full operational season for HTX Nông nghiệp Tân Tiến:
- **Chủ thể**: Hợp tác xã Dịch vụ Nông nghiệp Tổng hợp Tân Tiến (`HTX-TT-DALAT`), Tổ Hòn Bồ, Phường 12, TP. Đà Lạt, Lâm Đồng.
- **Vùng sản xuất**: Vùng trồng công nghệ cao Hòn Bồ, Mã PUC `PUC-49-015-9923`, Giấy chứng nhận VietGAP số `VIETGAP-DALAT-2025-089`.
- **Thửa đất**: Thửa số 01 của xã viên Nguyễn Văn Tân, mã `PLOT-TT-NV01-01`, diện tích $2.500\text{ m}^2$, tọa độ GPS `11.9404, 108.4583`.
- **Mùa vụ**: "Vụ Thu Đông 2026 - Ớt chuông Sweet Palermo Đỏ".
- **Hành trình canh tác 5 công đoạn (5-Stage TT02 Journey)**:
  1. *Làm đất & giá thể*: Xơ dừa xử lý nấm Trichoderma.
  2. *Bón lót*: Phân trùn quế hữu cơ.
  3. *Tưới nhỏ giọt dinh dưỡng*: Dinh dưỡng công nghệ Israel.
  4. *Phun phòng trừ sinh học*: Chế phẩm Neem Oil sinh học (PHI 3 ngày), GPS ghi nhận tại vườn.
  5. *Thu hoạch tuyển chọn*: Đúng ngày an toàn sau thời hạn cách ly.
- **Kiểm định KCS 3 cấp**:
  - Gate Check: Đạt chuẩn nguồn gốc và thời hạn cách ly.
  - Quick Lab: Test kit kiểm tra dư lượng đạt $0.00\text{ ppm}$ (`LAB_PASSED`).
  - Grading: Độ đồng đều $94\%$, độ ngọt Brix $8.5^\circ$ $\rightarrow$ Đạt chuẩn `GRADE_A (Premium)`.
- **Định danh GS1**: `LOT-TT-PLOT-TT-NV01-01-20261015-01`.
- **Tra cứu QR Công khai**: Khách hàng quét mã QR xem toàn bộ phả hệ truy xuất nguồn gốc, thông tin HTX Tân Tiến, bản đồ vùng trồng, hành trình canh tác, chứng nhận VietGAP, và mã băm SHA-256 xác thực.

---

## 3. Directory Layout & Test Suite Location

All Agriculture Feature and E2E tests reside under:
```
backend/tests/Feature/
├── Agriculture/
│   ├── AgricultureE2ETest.php              # Comprehensive 4-Tier E2E Test Suite
│   ├── AgricultureInfrastructureTest.php   # PUC, Plots, Member Assignments
│   ├── CropSeasonAndFarmingLogTest.php     # TT02 Logs, Materials, PHI Calculation
│   └── HarvestLotProductTest.php           # Harvest, PHI Blocker, GS1 Lot, Master Data
└── ...
```

---

## 4. Test Execution Commands

```bash
# Run all Agriculture feature tests:
php artisan test --filter=Agriculture

# Run the 4-Tier E2E test suite specifically:
php artisan test --filter=AgricultureE2ETest

# Run individual tiers:
php artisan test --filter=test_tier1_
php artisan test --filter=test_tier2_
php artisan test --filter=test_tier3_
php artisan test --filter=test_tier4_
```
