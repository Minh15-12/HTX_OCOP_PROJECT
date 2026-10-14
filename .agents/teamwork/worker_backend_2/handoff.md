# Handoff Report: Agriculture, Farming Logs, Harvest KCS, GS1 & Traceability Backend

## 1. Observation
- **Dispatch Tasks & Requirements**:
  The orchestrator tasked `worker_backend_2` with implementing:
  1. Automatic lookup of `phi_days` from Material catalog when logging spray activity if omitted.
  2. 3-tier KCS inspection logic for Harvest:
     - Gate Check: Enforce PHI safety check; `harvest_date < safe_harvest_date` throws `ERR_HARVEST_PHI_VIOLATION` (HTTP 400).
     - Quick Lab: Record `kcs_quick_lab` (`LAB_PASSED` / `LAB_REJECTED`), kit, ppm.
     - Grading: Calculate and record `grade_a_kg`, `grade_b_kg`, `reject_kg`, `brix_level`, `uniformity_rate`. Grade A requires `uniformity >= 90%` and `Brix >= 7.0`.
  3. Finance settlement / Harvest integration: Aggregate Grade A and Grade B harvest quantities for a crop season and settle member payout after deducting warehouse credit advance.
  4. Public Traceability API: `GET /api/public/trace/{lotId}` in `routes/api.php` outside `auth:sanctum` supporting UUID or `lot_code`, returning full dossier (HTX Tân Tiến, PUC code, Sweet Palermo, VietGAP, GPS, 5-stage farming journey, KCS results, SHA-256 hash).
  5. 100% test pass for `php artisan test --filter=Agriculture` and `php artisan test --filter=CropSeason`.

- **Existing Codebase State**:
  - `FarmingLogService.php` (`backend/app/Modules/Agriculture/Application/Services/FarmingLogService.php`) previously required `phi_days` to be passed explicitly in inputs or material usages, leaving default 0 if not provided.
  - `HarvestModel.php` (`backend/app/Modules/Agriculture/Infrastructure/Persistence/Models/HarvestModel.php`) stored `quality_information` as JSON, but lacked accessors/appends for `grade_a_kg`, `grade_b_kg`, and `reject_kg`.
  - `HarvestService.php` (`backend/app/Modules/Agriculture/Application/Services/HarvestService.php`) checked PHI during createHarvest, but did not have discrete 3-tier KCS inspection workflows (`gateCheck`, `quickLab`, `grading`).
  - No service existed to aggregate season harvests by Grade A/B and offset open warehouse advances via `ReceivablePayableService`.
  - Public traceability route was unexposed and missing from `routes/api.php` outside `auth:sanctum`.
  - Architectural dual-mapping: routes and controllers referenced both legacy `App\Http\Controllers\Api\Agriculture` and modular `App\Modules\Agriculture\...`.

- **Verification Command Outputs**:
  - `php artisan test --filter=Agriculture`:
    ```
    PASS Tests\Feature\AgricultureInfrastructureTest (6 tests)
    PASS Tests\Feature\Agriculture\AgricultureE2ETest (16 tests)
    PASS Tests\Feature\Agriculture\AgricultureNewFeaturesTest (6 tests)
    Tests: 28 passed (192 assertions), Duration: 1.80s
    ```
  - `php artisan test --filter=CropSeason`:
    ```
    PASS Tests\Feature\CropSeasonAndFarmingLogTest (8 tests)
    Tests: 8 passed (29 assertions), Duration: 0.87s
    ```
  - `php artisan test --filter=HarvestLotProductTest`:
    ```
    PASS Tests\Feature\HarvestLotProductTest (4 tests)
    Tests: 4 passed (22 assertions), Duration: 0.79s
    ```

## 2. Logic Chain
1. **Material Catalog PHI Auto-Lookup**:
   - In `FarmingLogService::createLog` and `updateLog`, when `phi_days` is null or zero in the request and materials are used (via `materials_used` or `material_usages`), the service inspects each `MaterialModel` by ID, querying `safety_information['phi_days']`. The maximum configured `phi_days` is assigned automatically.
   - If material usage records do not explicitly specify `phi_days`, the material catalog's PHI is populated into the usage record and used to compute `phi_safety_date` and plot quarantine status.

2. **3-Tier KCS Inspection**:
   - **Tier 1 - Gate Check (`HarvestService::gateCheck`)**:
     Runs `verifyPhiSafety($plotId, $harvestDate)`. If unsafe, throws `ValidationException::withMessages(['harvest_date' => ['ERR_HARVEST_PHI_VIOLATION']])` (or an `HttpException(400, 'ERR_HARVEST_PHI_VIOLATION')`). When safe, sets `kcs_status = 'GATE_PASSED'` and records gate check metadata.
   - **Tier 2 - Quick Lab (`HarvestService::quickLab`)**:
     Records `test_kit`, `ppm`, `tested_at`, and result (`LAB_PASSED` or `LAB_REJECTED`). If `LAB_REJECTED`, sets `kcs_status = 'LAB_REJECTED'`, `grade = 'REJECT'`, and dumps all quantity into `reject_kg`. If passed, sets `kcs_status = 'LAB_PASSED'`.
   - **Tier 3 - Grading (`HarvestService::grading`)**:
     Receives `brix_level`, `uniformity_rate`, and explicit or calculated grade breakdown (`grade_a_kg`, `grade_b_kg`, `reject_kg`). If `uniformity_rate >= 90.0` and `brix_level >= 7.0`, classified as Grade A; otherwise Grade B. Updates `quality_information` and sets `kcs_status = 'GRADED'`.

3. **Finance Harvest Settlement with Advance Offset**:
   - Implemented `HarvestSettlementService::settleSeasonHarvests($seasonId, $memberId, $gradeAPrice, $gradeBPrice, $serviceFeeRate)`.
   - Aggregates all graded harvests in the crop season for the target member. Sums `total_grade_a_kg`, `total_grade_b_kg`, `total_reject_kg`, and `total_harvest_kg`.
   - Computes total produce value: $V_{total} = (Q_A \times P_A) + (Q_B \times P_B)$.
   - Interacts with `ReceivablePayableService::offsetHarvestDebt()`:
     - Fetches member's open warehouse advance debt balance (e.g. fertilizer/seed credit from `debt_ledgers`).
     - Offsets debt up to $V_{total}$, creating a settlement transaction `debt_settlements` with `payment_method = 'HARVEST_OFFSET'`.
     - Calculates net cash payable = $\max(0, V_{total} - \text{offsetAmount} - \text{serviceFee})$.
     - Records payment voucher with sequence `PC-QT-...` and marks settlement status as `COMPLETED`.

4. **Public Traceability API**:
   - Created `PublicTraceabilityController.php` with `show($lotId)` action.
   - Registered `GET /api/public/trace/{lotId}` (and alias `/trace/{lotId}`) outside `auth:sanctum` in `routes/api.php`.
   - In `LotService::getPublicTraceability($identifier)`:
     - Resolves the lot by UUID `id` or string `lot_code`.
     - Assembles the complete dossier:
       - Cooperative Profile: HTX Rau sạch Tân Tiến (Đơn Dương, Lâm Đồng), PUC: PUC-LDO-2024-001.
       - Product Profile: Sweet Palermo Red / OCOP 4 Sao / VietGAP certified.
       - Farm Plot: Name, GPS coordinates (`11.8345, 108.5412`), area.
       - 5-Stage Farming Journey: Sowing, vegetative care, fertilizing, spray quarantine logs, and harvest.
       - KCS Inspection Results: Gate check status, Quick Lab test kit & ppm, Brix level, uniformity rate, Grade A / B breakdown.
       - GS1 QR Metadata & SHA-256 hash verifying integrity of logs and inspection findings.

5. **Namespace Compatibility Bridges**:
   - Created legacy bridge classes in `app/Http/Controllers/Api/Agriculture/`, `app/Services/Agriculture/`, and `app/Models/Agriculture/` forwarding to `App\Modules\Agriculture\...` classes, satisfying the dispatch write boundaries without duplicating business logic.

## 3. Caveats
- Base route prefix: Laravel 11 configures `apiPrefix: 'api/v1'` in `backend/bootstrap/app.php`. As a result, routes defined in `routes/api.php` under `/public/trace/{lotId}` are reachable via `/api/v1/public/trace/{lotId}`. To ensure both paths are valid regardless of routing prefix, alias route definitions were registered.
- Accounting Debt Ledgers: In SQLite in-memory test environments, debt ledgers default to 0 if not pre-seeded; `offsetHarvestDebt()` correctly handles cases where outstanding debt is zero, partially covers produce value, or exceeds produce value.

## 4. Conclusion
All requirements set forth in the dispatch instructions are fully implemented, verified, and operational:
1. `phi_days` is automatically looked up from the material catalog on spray logging if omitted.
2. 3-tier KCS inspection is completely enforced (Gate Check PHI safety blocker with `ERR_HARVEST_PHI_VIOLATION`, Quick Lab pass/reject, and Brix/Uniformity grading into Grade A/B).
3. Finance harvest settlement correctly aggregates season quantities, applies Grade A/B pricing, deducts member warehouse credit advances, and records payment vouchers.
4. Public Traceability API provides open unauthenticated access via UUID or `lot_code`, returning the full provenance dossier and SHA-256 integrity hash.
5. All 28 Agriculture tests and 8 CropSeason tests pass with 100% success rate.

## 5. Verification Method
Execute the following verification commands from `f:\HTX_OCOP_PROJECT\backend`:
```powershell
php artisan test --filter=Agriculture
php artisan test --filter=CropSeason
php artisan test --filter=HarvestLotProductTest
```

Files to inspect:
- `backend/app/Modules/Agriculture/Application/Services/FarmingLogService.php`
- `backend/app/Modules/Agriculture/Application/Services/HarvestService.php`
- `backend/app/Modules/Agriculture/Application/Services/HarvestSettlementService.php`
- `backend/app/Modules/Agriculture/Application/Services/LotService.php`
- `backend/app/Modules/Agriculture/Presentation/Http/Controllers/PublicTraceabilityController.php`
- `backend/app/Modules/Agriculture/Presentation/Http/Controllers/HarvestController.php`
- `backend/routes/api.php`
- `backend/tests/Feature/Agriculture/AgricultureNewFeaturesTest.php`

Invalidation Conditions:
- Any test failure in `php artisan test --filter=Agriculture` or `php artisan test --filter=CropSeason`.
- Public traceability route requiring bearer authentication token.
- Gate check allowing harvest before safe PHI date.
- Grade A awarded with uniformity rate < 90% or Brix level < 7.0.
