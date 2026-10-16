# Báo Cáo Khảo Sát Kiến Trúc Backend: Phân Hệ Nông Nghiệp, KCS, Mã Lô GS1 & Truy Xuất Nguồn Gốc

**Agent**: `explorer_backend_2` (Backend Architecture Explorer)  
**Ngày thực hiện**: 2026-10-13  
**Thư mục làm việc**: `f:\HTX_OCOP_PROJECT\.agents\teamwork\explorer_backend_2`  
**Nhánh Git**: `feature/production-farming-harvest-traceability`  

---

## 1. Observation (Dữ Liệu Quan Sát Thực Tế)

### 1.1 Cấu Trúc Khung Ứng Dụng & Dependencies
- **Framework**: Laravel 11.0 trên nền PHP ^8.2 (theo `backend/composer.json`, dòng 8–14).
- **Kiến trúc Modular Monolith**: `app/Modules/` được map psr-4 tới namespace `Modules\\` (theo `backend/composer.json`, dòng 26).
- **Các Module hiện hữu**: `Agriculture`, `Audit`, `Cooperative`, `Finance`, `Identity`, `Inventory`, `Notification`, `Ocop`, `Product`, `Report` (theo danh mục `backend/app/Modules`).
- **Phân lớp DDD trong Module Agriculture**: Đầy đủ 4 tầng `Domain`, `Application`, `Infrastructure`, `Presentation`.
- **Cơ sở dữ liệu**: PostgreSQL 16 sử dụng extension `pgcrypto`, 72 file migration, 100% bảng nghiệp vụ sử dụng `uuid` làm khóa chính (Primary Key).

### 1.2 Kết Quả Chạy Test Baseline Hiện Tại
Thực thi trực tiếp bằng `php artisan test` trong thư mục `backend`:
1. **Lệnh 1**: `php artisan test --filter=Agriculture`
```
   PASS  Tests\Feature\AgricultureInfrastructureTest
  ✓ create production unit successfully                                                                          0.58s  
  ✓ create production unit fails when unit code duplicated                                                       0.02s  
  ✓ list production units with search and tenant scope                                                           0.12s  
  ✓ create farm plot under production unit successfully                                                          0.14s  
  ✓ assign member to farm plot successfully                                                                      0.15s  
  ✓ cross tenant isolation prevents accessing other cooperative production unit                                  0.02s  

  Tests:    6 passed (21 assertions)
  Duration: 1.21s
```

2. **Lệnh 2**: `php artisan test --filter=CropSeason`
```
   PASS  Tests\Feature\CropSeasonAndFarmingLogTest
  ✓ create crop season successfully                                                                              0.51s  
  ✓ close crop season action endpoint                                                                            0.03s  
  ✓ create farming log successfully                                                                              0.03s  
  ✓ cannot add farming log to closed season                                                                      0.03s  
  ✓ create material usage for farming log                                                                        0.03s  
  ✓ calculate phi with configured days computes safety date and isolated status                                  0.03s  
  ✓ calculate phi without configured days returns unknown status                                                 0.03s  
  ✓ cross tenant isolation prevents viewing crop season of other cooperative                                     0.02s  

  Tests:    8 passed (29 assertions)
  Duration: 0.86s
```

3. **Lệnh 3**: `php artisan test --filter=HarvestLotProductTest`
```
   PASS  Tests\Feature\HarvestLotProductTest
  ✓ create harvest successfully when no phi violation                                                            0.63s  
  ✓ create harvest is blocked when phi safety date is violated                                                   0.03s  
  ✓ create lot from harvest and traceability lookup                                                              0.22s  
  ✓ product master data crud and lot attachment                                                                  0.19s  

  Tests:    4 passed (22 assertions)
  Duration: 1.23s
```

4. **Toàn bộ Test Suite Backend**: 122/122 tests passed (673 assertions) trong 10.21s.

---

### 1.3 Hiện Trạng Code Nghiệp Vụ Từng Phân Hệ

#### A. Quản Trị Vùng Trồng, Thửa Đất & Mùa Vụ
- **Models**:
  - `CooperativeModel` (`backend/app/Modules/Cooperative/Infrastructure/Persistence/Models/CooperativeModel.php`): Lưu `cooperative_code`, `legal_name`, `status`.
  - `ProductionUnitModel` (`backend/app/Modules/Agriculture/Infrastructure/Persistence/Models/ProductionUnitModel.php`): Lưu `cooperative_id`, `unit_code` (Mã PUC), `name`, `crop`, `area`, `location` (jsonb), `status`, `registration_information` (jsonb).
  - `FarmPlotModel` (`backend/app/Modules/Agriculture/Infrastructure/Persistence/Models/FarmPlotModel.php`): Lưu `production_unit_id`, `plot_code`, `land_relation` (jsonb), `area`, `status`, `quarantine_until`. Có hàm `isInQuarantine(?string $checkDate)` (dòng 31–41).
  - `CropSeasonModel` (`backend/app/Modules/Agriculture/Infrastructure/Persistence/Models/CropSeasonModel.php`): Lưu `production_unit_id`, `name`, `crop`, `start_date`, `expected_end_date`, `actual_end_date`, `status` (`PLANNED`, `ACTIVE`, `COMPLETED`, `CANCELLED`).
- **Quan sát chi tiết**:
  - Chưa có helper/service sinh mã thửa đất tự động theo định dạng chuẩn `PLOT-[HTX]-[MaXaVien]-[STT]` (tại `CreateFarmPlotRequest.php`, dòng 17 chỉ kiểm tra `required, string, max:50`).

#### B. Nhật Ký Canh Tác Điện Tử (Thông tư 02/2024/TT-BNNPTNT) & PHI Guard
- **Cơ sở dữ liệu**:
  - Bảng `farming_logs` (qua migration `2026_01_01_000018` và `2026_01_01_000066`): Đã có đủ các cột: `activity_type`, `activity_date`, `plot_id`, `crop_season_id`, `material_id`, `material_batch_number`, `quantity_applied`, `unit`, `phi_days`, `gps_latitude`, `gps_longitude`, `attachment_reference`, `performed_by`.
- **Ràng buộc an toàn**:
  - Tại `FarmingLogService.php` (dòng 110–114): Bắt buộc kiểm tra tọa độ GPS đối với hoạt động `SPRAYING` hoặc `PHUN_THUOC`, ném `ERR_GPS_LOCATION_REQUIRED` nếu thiếu.
  - Khi `phi_days > 0`: `FarmingLogService.php` (dòng 134–155) tự động tính toán `safety_date = activity_date + phi_days`, tạo bản ghi `PhiCalculationModel` và cập nhật thửa đất sang `status = 'IN_QUARANTINE'`, `quarantine_until = $safetyDate`.
- **Điểm khuyết**:
  - Nếu người dùng tạo nhật ký phun thuốc chọn `material_id` nhưng không nhập `phi_days`, hệ thống không tự động tra cứu `phi_days` từ `material->safety_information['phi_days']` để điền vào.

#### C. Lệnh Thu Hoạch & Chốt Chặn PHI (`ERR_HARVEST_PHI_VIOLATION`)
- **Tại `HarvestService.php`** (dòng 91 & dòng 167–207):
  ```php
  private function verifyPhiSafety(string $seasonId, string $plotId, string $harvestDate): void
  {
      $logIds = FarmingLogModel::where('crop_season_id', $seasonId)
          ->where('plot_id', $plotId)
          ->pluck('id');

      if ($logIds->isEmpty()) {
          return;
      }

      $activeIsolation = PhiCalculationModel::whereIn('farming_log_id', $logIds)
          ->where('safety_date', '>', $harvestDate)
          ->orderBy('safety_date', 'desc')
          ->first();

      if ($activeIsolation) {
          ...
          throw new DomainException(
              "Cảnh báo an toàn PHI: Thửa đất đang trong thời gian cách ly sử dụng vật tư đến hết ngày [{$safetyDateStr}]. Ngày thu hoạch [{$harvestDate}] chưa đủ điều kiện an toàn!",
              'ERR_HARVEST_PHI_VIOLATION',
              null,
              400
          );
      }
  }
  ```
  - **Đánh giá**: Logic chặn 100% lệnh thu hoạch trước `safe_harvest_date` hoạt động hoàn hảo và ghi Audit log `PHI_VIOLATION_ATTEMPTED`.

#### D. Kiểm Soát Chất Lượng KCS 3 Cấp (Gate Check → Quick Lab → Grading)
- **Cơ sở dữ liệu**:
  - Bảng `harvests` (migration `2026_01_01_000066`) đã có các cột: `kcs_status`, `kcs_gate_check`, `kcs_quick_lab`, `grade`, `brix_level`, `uniformity_rate`.
- **Hiện trạng Code**:
  - `CreateHarvestDTO` có nhận các trường KCS (`CreateHarvestDTO.php`, dòng 16–21).
  - Nhưng trong `HarvestController::store` (`HarvestController.php`, dòng 65–72): **Không hề map** các trường KCS từ `$request`.
  - `UpdateHarvestDTO` (`UpdateHarvestDTO.php`, dòng 7–15): **Hoàn toàn không có** các trường KCS.
  - `HarvestService::updateHarvest` (`HarvestService.php`, dòng 130–165): **Không hỗ trợ cập nhật** KCS, Gate Check, Quick Lab, Grade hay Brix.
  - **CHƯA CÓ** bất kỳ Controller Endpoint hoặc Service Action nào để thực thi quy trình chuyển trạng thái KCS 3 cấp:
    1. *Level 1 Gate Check*: Kiểm tra đối soát mã lệnh, PHI, nguồn gốc thửa đất.
    2. *Level 2 Quick Lab*: Nhập kết quả phân tích dư lượng (`LAB_PASSED` / `LAB_REJECTED`).
    3. *Level 3 Grading*: Thuật toán phân hạng Grade A (Đồng đều $\ge 90\%$, Brix $\ge 7^\circ$), Grade B, Reject.

#### E. Mã Lô GS1 & Endpoint Truy Xuất Nguồn Gốc Công Khai (Public QR Traceability)
- **Cơ chế sinh mã lô GS1**:
  - Tại `LotService.php` (dòng 166–170): Đã sinh đúng định dạng `LOT-{$coopCode}-{$plotCode}-{$dateStr}-{$seq}`.
- **Traceability Tree**:
  - Hàm `LotService::getLotTraceability(string $id)` (dòng 76–156) tổng hợp cây thông tin gồm: `lot`, `harvest`, `crop_season`, `farm_plot`, `production_unit`, `cooperative`, `tt02_traceability_logs`.
- **LỖ HỔNG LỚN (CRITICAL GAP) VỀ ROUTING**:
  - Tại `backend/routes/api.php` (dòng 152):
    ```php
    Route::middleware(['auth:sanctum', 'tenant.scope'])->group(function () {
        ...
        Route::get('/lots/{id}/traceability', [LotController::class, 'traceability'])->name('api.lots.traceability');
    ```
    Route tra cứu duy nhất đang bị khóa sau **Sanctum Authentication** và **Tenant Scope Middleware**!
  - **CHƯA CÓ** route công khai không cần auth như `/api/v1/public/trace/{lotId}` hoặc `/api/v1/trace/{lotId}`.
  - Hàm `getLotTraceability` trong `LotService.php` (dòng 63 & 78) chỉ gọi `find($id)` theo UUID; chưa hỗ trợ tra cứu trực tiếp bằng mã `lot_code` chuỗi (ví dụ: `LOT-TT-PLOT-01-20261013-01`).
  - Dữ liệu trả về hiện thiếu thông tin chứng nhận VietGAP (từ `production_unit.registration_information`) và bản đồ tọa độ thửa đất (GPS boundary).

#### F. Tích Hợp Liên Thông Kho Vật Tư & Tài Chính
- **Kho Vật tư (Inventory)**:
  - `StockIssueService::approveIssue` (`StockIssueService.php`, dòng 198–218): Đã chặn xuất nợ đầu vụ nếu tổng nợ vượt `credit_limit` của xã viên (`ERR_MEMBER_CREDIT_LIMIT_EXCEEDED`).
  - Chưa có API đối soát tự động khối lượng vật tư đã xuất cho xã viên so với tổng lượng vật tư xã viên đã ghi nhận trong nhật ký canh tác (`BR-FARM-004`).
- **Tài chính & Quyết toán (Finance)**:
  - `ReceivablePayableService::offsetHarvestDebt` (`ReceivablePayableService.php`, dòng 258–348): Đã có logic cấn trừ nợ vật tư đầu vụ, trừ phí dịch vụ 2.5%, tạo bản ghi `DebtSettlementModel` (`HARVEST_OFFSET`) và lập phiếu chi thực thanh toán (`PC-QT-...`).
  - Tuy nhiên, endpoint `POST /api/v1/receivable-payables/harvest-settlements` hiện tại bắt buộc truyền thẳng số tiền `produce_value` thủ công, chưa có hàm tự động gom các lô thu hoạch theo xã viên và tính giá trị tự động:
    $$V_{\text{total}} = V_{\text{gradeA}} \times P_A + V_{\text{gradeB}} \times P_B$$
- **OCOP**:
  - `OcopEvidenceAutoExtractionService` (`OcopEvidenceAutoExtractionService.php`, dòng 32–155): Đã có service trích xuất tự động dữ liệu vùng trồng (`FARM_PLOT`), danh sách xã viên (`MEMBER_LIST`), sổ PHI (`PHI_JOURNAL`) thành tệp minh chứng mã băm SHA-256 liên kết với các tiêu chí OCOP.

---

## 2. Logic Chain (Chuỗi Lập Luận Suy Diễn)

1. **Từ Quan sát 1.2 & 1.3.C**:
   - Nhận thấy hệ thống đã có migration cập nhật các cột KCS và có cơ chế chặn `ERR_HARVEST_PHI_VIOLATION` hoàn hảo. Test `test_create_harvest_is_blocked_when_phi_safety_date_is_violated` chạy xanh 100%.
   - **Suy diễn**: Nền tảng dữ liệu cho an toàn PHI và cấu trúc bảng KCS đã sẵn sàng, không cần thay đổi cấu trúc bảng `harvests` hay `phi_calculations`.

2. **Từ Quan sát 1.3.D**:
   - `UpdateHarvestDTO` không có trường KCS; `HarvestController` không truyền dữ liệu KCS; không có endpoint nào phục vụ quy trình Gate Check, Quick Lab, hay Grading.
   - **Suy diễn**: Phân hệ KCS 3 cấp hiện tại mới chỉ dừng lại ở tầng Database Schema. Cần bổ sung ngay:
     - DTOs và Validation Requests cho KCS.
     - Service methods: `gateCheck(harvestId, data)`, `quickLab(harvestId, status, data)`, `grading(harvestId, brix, uniformityRate)`.
     - Endpoints tương ứng trong `HarvestController` và cập nhật `routes/api.php`.

3. **Từ Quan sát 1.3.E**:
   - Route `/lots/{id}/traceability` nằm trong nhóm middleware `['auth:sanctum', 'tenant.scope']`.
   - Người tiêu dùng ngoài xã hội hoặc khách hàng quét mã QR trên quả Ớt chuông Sweet Palermo qua điện thoại sẽ lập tức bị chặn với HTTP 401 Unauthorized.
   - **Suy diễn**: Cần mở một route công khai `Route::get('/public/trace/{lotIdentifier}', ...)` nằm NGOÀI middleware xác thực. Endpoint này phải hỗ trợ tra cứu cả bằng UUID lẫn `lot_code`, và trả về toàn diện: HTX, Vùng trồng (Mã PUC, VietGAP), Thửa đất (Tọa độ), Sản phẩm (Sweet Palermo), Hành trình nhật ký canh tác TT02/2024, và kết quả KCS 3 cấp.

4. **Từ Quan sát 1.3.F**:
   - Module Finance đã có `offsetHarvestDebt` xử lý cấn trừ nợ và xuất phiếu chi, nhưng nhận tham số rời rạc (`member_id`, `produce_value`).
   - Phân hệ thu hoạch có `HarvestModel` liên kết với `FarmPlotModel` và `MemberPlotAssignmentModel`.
   - **Suy diễn**: Cần xây dựng hàm cầu nối (Bridge/Aggregation Service) cho phép chọn danh sách các đợt thu hoạch của một xã viên trong mùa vụ, nhân đơn giá Grade A / Grade B để tính ra `produce_value`, rồi tự động chuyển sang `offsetHarvestDebt`.

---

## 3. Caveats (Các Điểm Giới Hạn & Giả Định)

1. **Giả định về định danh mã thửa đất**: Hiện tại hệ thống cho phép người dùng tự điền `plot_code`. Nếu muốn bắt buộc tuân theo `PLOT-[HTX]-[MaXaVien]-[STT]`, cần có quy tắc sinh mã tự động hoặc regex validation mềm dẻo tránh làm gãy các test case hiện hữu (`PLOT_CTX_...`).
2. **Giả định về giá thu mua nông sản**: Hiện bảng `products` hoặc `harvests` chưa lưu bảng giá Grade A / Grade B cố định. Giá thu mua có thể được truyền vào qua request quyết toán hoặc cấu hình theo sản phẩm.
3. **Phân quyền Route Public**: Route public truy xuất nguồn gốc không được áp dụng middleware `tenant.scope`. Do đó, logic service của route public phải tự query trực tiếp từ database mà không được phụ thuộc vào `tenantContext->getCooperativeId()`.

---

## 4. Conclusion (Kết Luận & Lộ Trình Triển Khai Backend)

Kiến trúc Backend hiện tại đã được thiết kế rất chuẩn mực theo DDD và Clean Architecture, 122/122 test đang chạy xanh. Tuy nhiên, để hoàn thiện trọn vẹn yêu cầu R1–R4 tại `ORIGINAL_REQUEST.md` (2026-10-13T16:16:40Z), Backend Worker cần thực hiện 4 gói công việc cụ thể:

### Lộ Trình Triển Khai Chi Tiết Cho Backend Worker (Actionable Roadmap)

#### Gói 1: Hoàn Thiện Nghiệp Vụ KCS 3 Cấp Cho Harvest
- **Tạo DTOs**:
  - `ProcessKcsGateCheckDTO`: `checkerId`, `passed`, `notes`, `checklist`.
  - `ProcessKcsQuickLabDTO`: `labStatus` (`LAB_PASSED` / `LAB_REJECTED`), `testerName`, `testDate`, `activeSubstancesTested`, `certificateUrl`.
  - `ProcessKcsGradingDTO`: `brixLevel`, `uniformityRate`, `defectRate`, `notes`.
- **Cập nhật `HarvestService`**:
  - Phương thức `gateCheck(string $harvestId, ProcessKcsGateCheckDTO $dto): HarvestModel`.
  - Phương thức `quickLab(string $harvestId, ProcessKcsQuickLabDTO $dto): HarvestModel`: Nếu `LAB_REJECTED` $\rightarrow$ set `grade = 'REJECT'`.
  - Phương thức `gradeHarvest(string $harvestId, ProcessKcsGradingDTO $dto): HarvestModel`:
    - Thuật toán phân loại: Nếu `uniformity_rate >= 90.0` và `brix_level >= 7.0` $\rightarrow$ `grade = 'GRADE_A'`, ngược lại $\rightarrow$ `grade = 'GRADE_B'`.
- **Cập nhật `HarvestController` & `routes/api.php`**:
  - `POST /api/v1/harvests/{id}/kcs/gate-check`
  - `POST /api/v1/harvests/{id}/kcs/quick-lab`
  - `POST /api/v1/harvests/{id}/kcs/grading`
- **Bổ sung Feature Tests**: Kiểm thử toàn bộ luồng chuyển trạng thái và tính phân hạng Grade A / B / Reject.

#### Gói 2: Xây Dựng Public Traceability Endpoint (Mã QR Không Cần Auth)
- **Tạo Public Traceability Controller**:
  - `Modules\Agriculture\Presentation\Http\Controllers\PublicTraceabilityController.php`.
  - Thêm route tại `routes/api.php` (ở ngoài `auth:sanctum`):
    `Route::get('/public/trace/{identifier}', [PublicTraceabilityController::class, 'show'])->name('api.public.trace');`
- **Nâng cấp `LotService`**:
  - Thêm phương thức `getPublicTraceability(string $identifier): array` hỗ trợ tìm kiếm theo cả UUID `id` hoặc `lot_code`.
  - Bổ sung vào kết quả:
    - Chứng nhận VietGAP (lấy từ `production_unit.registration_information`).
    - Bản đồ GPS thửa đất (tọa độ thửa đất và vùng trồng).
    - Thông tin chi tiết ớt chuông Sweet Palermo Đỏ Đà Lạt.
    - Kết quả kiểm định KCS 3 cấp đã thực hiện.
- **Bổ sung Feature Tests**: Kiểm thử truy cập unauthenticated trả về HTTP 200 kèm đầy đủ các khối dữ liệu.

#### Gói 3: Tự Động Hóa Auto-Populate PHI & Sinh Mã Thửa Đất
- Trong `FarmingLogService::createLog`:
  - Nếu `material_id` được cung cấp và `phi_days` không truyền vào: Tự động trích xuất `phi_days` từ `MaterialModel::find($dto->materialId)->safety_information['phi_days']`.
- Trong `FarmPlotService`:
  - Hỗ trợ auto-generate `plot_code` theo định dạng `PLOT-[HTX]-[MaXaVien]-[STT]` nếu không được truyền từ client.

#### Gói 4: Cầu Nối Quyết Toán Nông Sản & Đối Soát Vật Tư
- **Tạo `HarvestSettlementAggregationService` trong Finance**:
  - Nhận `member_id`, `season_id`, `grade_a_price`, `grade_b_price`.
  - Truy vấn toàn bộ các đợt thu hoạch của thành viên đó trong mùa vụ, tính tổng sản lượng Grade A và Grade B.
  - Tính tổng giá trị nông sản:
    $$V_{\text{total}} = Q_{\text{gradeA}} \times P_A + Q_{\text{gradeB}} \times P_B$$
  - Gọi `ReceivablePayableService::offsetHarvestDebt` để cấn trừ nợ vật tư và tạo phiếu chi.
- **Tạo API đối soát vật tư (Material Reconciliation)**:
  - `GET /api/v1/crop-seasons/{id}/material-reconciliation/{memberId}` so sánh tổng khối lượng vật tư đã cấp theo phiếu xuất kho nợ với tổng khối lượng vật tư đã ghi trong nhật ký canh tác.

---

## 5. Verification Method (Phương Pháp Xác Thực Độc Lập)

Người tiếp nhận (Backend Worker / QA Agent) có thể độc lập kiểm chứng các quan sát trên bằng các bước sau:

1. **Xác thực trạng thái tests hiện tại**:
   ```powershell
   cd f:\HTX_OCOP_PROJECT\backend
   php artisan test --filter=Agriculture
   php artisan test --filter=CropSeason
   php artisan test --filter=HarvestLotProductTest
   ```
   *Kỳ vọng*: 18/18 tests chạy thành công.

2. **Xác thực lỗ hổng Public Traceability**:
   ```powershell
   # Gọi API traceability mà không kèm Authorization header
   curl -i http://localhost:8000/api/v1/lots/b52beec0-8914-411a-8c9f-3ef71ff36081/traceability
   ```
   *Kết quả hiện tại*: Trả về `401 Unauthorized` vì bị chặn bởi middleware Sanctum.

3. **Xác thực thiếu sót KCS Endpoint**:
   Kiểm tra file `backend/app/Modules/Agriculture/Presentation/Http/Controllers/HarvestController.php` (dòng 59–103) và `backend/routes/api.php` (dòng 144–147) sẽ thấy chỉ có các hàm `index`, `show`, `store`, `update` cơ bản, không có bất kỳ logic nào về Gate Check, Quick Lab hay Grading.
