# Backend Challenger Report: Agriculture, PHI Guard, 3-Tier KCS, GS1 & Traceability

**Target Milestone**: Agriculture Track 2 (Production Hierarchy, Farming Logs TT02, PHI Guard, 3-Tier KCS, GS1 Lot Generation, Public QR Traceability)  
**Agent**: `challenger_backend_2` (EMPIRICAL CHALLENGER — critic, specialist)  
**Verdict**: **REQUEST_CHANGES** (Surgical Security Hardening Required in `HarvestService.php`)  
**Date**: 2026-10-14  

---

## 1. Observation

### 1.1 Direct Test Suite Execution Results
All automated test suites were directly executed via terminal commands:

1. **Agriculture Test Suite**:
   ```bash
   php artisan test --filter=Agriculture
   ```
   **Output**:
   ```
      PASS  Tests\Feature\AgricultureInfrastructureTest (6 tests)
      PASS  Tests\Feature\Agriculture\AgricultureChallengerAdversarialTest (18 tests)
      PASS  Tests\Feature\Agriculture\AgricultureE2ETest (16 tests)
      PASS  Tests\Feature\Agriculture\AgricultureNewFeaturesTest (6 tests)

     Tests:    46 passed (271 assertions)
     Duration: 2.21s
   ```

2. **CropSeason Test Suite**:
   ```bash
   php artisan test --filter=CropSeason
   ```
   **Output**:
   ```
      PASS  Tests\Feature\CropSeasonAndFarmingLogTest (8 tests)

     Tests:    8 passed (29 assertions)
     Duration: 0.85s
   ```

3. **Adjacent Suites & Global Checks**:
   - `php artisan test --filter=HarvestLotProductTest`: 4 passed (22 assertions, 0.76s).
   - Global Backend Test Suite (`php artisan test`): 162 passed (923 assertions, 6.46s).
   - Frontend Build (`npm run build` in `frontend/`): built in 7.34s, 0 errors.
   - Frontend Lint (`npm run lint` in `frontend/`): 0 errors, 0 warnings.

---

### 1.2 Adversarial Probes & Code Observations

#### Probe 1: PHI Guard Bypass Attacks
- **Code Inspected**: `app/Modules/Agriculture/Application/Services/HarvestService.php` lines 90-92, 156-159, 210-212, and 349-389 (`verifyPhiSafety`).
- **Verbatim Error**: `ERR_HARVEST_PHI_VIOLATION` (HTTP 400).
- **Probes Executed** in `Tests\Feature\Agriculture\AgricultureChallengerAdversarialTest`:
  - `test_phi_guard_probe_attempt_to_create_harvest_before_safe_date_is_hard_blocked`: Attempting to create a harvest on `2026-09-10` when safe date is `2026-09-15` returns HTTP 400 `ERR_HARVEST_PHI_VIOLATION`. No harvest row persisted. Audit log records `PHI_VIOLATION_ATTEMPTED` in `audit_events`.
  - `test_phi_guard_probe_exact_boundary_one_day_before_is_blocked_exact_safe_date_is_permitted`: Harvesting on `safe_harvest_date - 1 day` is rejected with HTTP 400; harvesting on exact `safe_harvest_date` returns HTTP 201 Created.
  - `test_phi_guard_probe_patch_tamper_attempt_moving_harvest_date_backwards_is_blocked`: `PATCH /api/v1/harvests/{id}` with an unsafe date is blocked with HTTP 400 `ERR_HARVEST_PHI_VIOLATION`. Database remains unchanged.
  - `test_phi_guard_probe_cumulative_multiple_sprays_enforces_strictest_latest_safe_date`: When multiple sprays occur (Spray 1: safe `2026-09-08`, Spray 2: safe `2026-09-19`), attempting harvest on `2026-09-12` is rejected because $\max(\text{safe\_harvest\_date}) = 2026-09-19$.
- **Result**: **PASS**. PHI Guard invariant is strictly enforced.

#### Probe 2: Spray Log GPS Coordinates Enforcement
- **Code Inspected**: `app/Modules/Agriculture/Application/Services/FarmingLogService.php` lines 110-114:
  ```php
  // BR-FARM-003: Spraying activities require GPS coordinates
  if (in_array(strtoupper($dto->activityType), ['SPRAYING', 'PHUN_THUOC'], true)) {
      if ($dto->gpsLatitude === null || $dto->gpsLongitude === null) {
          throw new DomainException('Nhật ký phun thuốc bảo vệ thực vật bắt buộc phải cung cấp tọa độ GPS', 'ERR_GPS_LOCATION_REQUIRED', null, 422);
      }
  }
  ```
- **Probes Executed**:
  - `test_gps_probe_spraying_without_gps_returns_422_err_gps_location_required`: `POST /api/v1/farming-logs` with `activity_type = 'SPRAYING'` and missing GPS returns HTTP 422 with code `ERR_GPS_LOCATION_REQUIRED`.
  - `test_gps_probe_spraying_with_partial_gps_missing_latitude_or_longitude_returns_422`: Submitting `gps_latitude` without `gps_longitude` or vice-versa returns HTTP 422 `ERR_GPS_LOCATION_REQUIRED`.
  - `test_gps_probe_non_spraying_activity_without_gps_is_allowed`: Non-spray activities (e.g. `FERTILIZING`) without GPS succeed with HTTP 201 Created.
  - `test_gps_probe_out_of_range_coordinates_are_rejected`: Coordinates outside valid decimal range (e.g. latitude > 90) return HTTP 422.
- **Result**: **PASS**.

#### Probe 3: 3-Tier KCS Grade A Evaluation & Business Logic Flaw
- **Code Inspected**: `app/Modules/Agriculture/Application/Services/HarvestService.php` lines 305-318:
  ```php
  305: } else {
  306:     // Grade A requires uniformity >= 90% and Brix >= 7
  307:     if ($uniformityRate >= 90.0 && $brixLevel >= 7.0) {
  308:         $finalGrade = 'GRADE_A';
  309:         $gradeAKg = isset($params['grade_a_kg']) ? (float) $params['grade_a_kg'] : (float) $harvest->quantity;
  310:         $gradeBKg = isset($params['grade_b_kg']) ? (float) $params['grade_b_kg'] : 0.0;
  311:         $rejectKg = isset($params['reject_kg']) ? (float) $params['reject_kg'] : 0.0;
  312:     } else {
  313:         $finalGrade = 'GRADE_B';
  314:         $gradeAKg = isset($params['grade_a_kg']) ? (float) $params['grade_a_kg'] : 0.0;
  315:         $gradeBKg = isset($params['grade_b_kg']) ? (float) $params['grade_b_kg'] : (float) $harvest->quantity;
  316:         $rejectKg = isset($params['reject_kg']) ? (float) $params['reject_kg'] : 0.0;
  317:     }
  318: }
  ```
- **Probes Executed**:
  - `test_kcs_probe_sub_par_brix_under_7_is_forced_to_grade_b`: Brix 6.9 (<7.0) and Uniformity 95.0% forces `finalGrade` to `GRADE_B`.
  - `test_kcs_probe_sub_par_uniformity_under_90_is_forced_to_grade_b`: Brix 8.5 and Uniformity 89.9% (<90.0%) forces `finalGrade` to `GRADE_B`.
  - `test_kcs_probe_lab_rejected_harvest_cannot_be_promoted_to_grade_a`: Quick Lab `LAB_REJECTED` locks harvest to `REJECT`, which cannot be upgraded even with high Brix and high Uniformity.
  - `test_kcs_probe_exact_threshold_brix_7_and_uniformity_90_qualifies_as_grade_a`: Brix 7.0 and Uniformity 90.0% qualifies as `GRADE_A`.
  - **Empirical Vulnerability Discovered (`test_kcs_probe_documents_smuggled_grade_a_kg_vulnerability`)**:
    - When a malicious or buggy client passes sub-par Brix (e.g. 6.0) or sub-par uniformity (e.g. 80.0%), but specifies `'grade_a_kg' => 1000.0` in the grading request body:
    - Line 314 executes: `$gradeAKg = isset($params['grade_a_kg']) ? (float) $params['grade_a_kg'] : 0.0;`
    - Because `$params['grade_a_kg']` is present, `$gradeAKg` is assigned `1000.0`!
    - `$qualityInfo['grade_a_kg']` is saved as `1000.0` in the database.
    - In `Modules\Agriculture\Infrastructure\Persistence\Models\HarvestModel.php` lines 48-54:
      ```php
      public function getGradeAKgAttribute(): float
      {
          if (isset($this->quality_information['grade_a_kg'])) {
              return (float) $this->quality_information['grade_a_kg'];
          }
          return $this->grade === 'GRADE_A' ? (float) $this->quantity : 0.0;
      }
      ```
      `$harvest->grade_a_kg` returns `1000.0`!
    - In `Modules\Agriculture\Application\Services\HarvestSettlementService.php` lines 59-66:
      ```php
      foreach ($harvests as $h) {
          $totalGradeA += (float) $h->grade_a_kg;
          $totalGradeB += (float) $h->grade_b_kg;
          $totalReject += (float) $h->reject_kg;
      }
      $grossValue = ($totalGradeA * $gradeAPrice) + ($totalGradeB * $gradeBPrice);
      ```
      The cooperative pays out 1000 kg at the premium Grade A rate ($35,000 VNĐ/kg) instead of Grade B ($25,000 VNĐ/kg), resulting in unjustified financial drain.

#### Probe 4: Unauthenticated Public Traceability Endpoint
- **Code Inspected**:
  - `routes/api.php` lines 58-60 (`/public/trace/{lotId}` and `/trace/{lotId}`).
  - `bootstrap/app.php` line 16 (`apiPrefix: 'api/v1'`).
  - `app/Modules/Agriculture/Presentation/Http/Controllers/PublicTraceabilityController.php`.
  - `app/Modules/Agriculture/Application/Services/LotService.php` lines 215-423 (`getPublicTraceability`).
- **Probes Executed**:
  - `test_public_trace_probe_accessible_without_sanctum_token`: Unauthenticated GET to `/api/v1/public/trace/{lotId}` and `/api/v1/trace/{lotId}` returns HTTP 200 with full provenance tree.
  - Provenance Tree contains: Cooperative, Product (Sweet Palermo, PUC code), Plot (GPS, area, member), 5-stage Farming Journey, 3-tier KCS inspection results, Certifications (VietGAP, OCOP 4-star, PUC), and genuine 64-character hex SHA-256 integrity hash.
  - `test_public_trace_probe_non_existent_lot_returns_404`: Non-existent UUID or Lot Code returns HTTP 404 with error code `LOT_NOT_FOUND`.
  - `test_public_trace_probe_adversarial_malicious_strings_gracefully_handled`: Injected SQLi strings (`' OR '1'='1`), XSS, directory traversal, null bytes, and 500-char strings are safely escaped by Eloquent and return HTTP 404 without SQL errors or HTTP 500 crashes.
  - `test_public_trace_probe_does_not_leak_sensitive_internal_fields`: Zero passwords, password hashes, `remember_token`, or API keys leaked in response JSON.
- **Result**: **PASS**.

---

## 2. Logic Chain

1. **Premise 1 (PHI Invariant)**: TT02/2024 and BR-FARM-001 mandate that no agricultural produce may be harvested prior to `safe_harvest_date`. The system enforces this check centrally via `HarvestService::verifyPhiSafety()` on harvest creation, patch modification, and gate check inspection. Observed: 100% block rate, HTTP 400 `ERR_HARVEST_PHI_VIOLATION`, and audit event emission.
2. **Premise 2 (GPS Invariant)**: BR-FARM-003 mandates GPS coordinates for all pesticide/spraying activities. Observed: `FarmingLogService` strictly validates `gpsLatitude` and `gpsLongitude` for `SPRAYING` and `PHUN_THUOC`, returning HTTP 422 `ERR_GPS_LOCATION_REQUIRED` when omitted.
3. **Premise 3 (KCS Grading Invariant)**: A harvest cannot be classified as Grade A if Brix < 7.0 or Uniformity < 90.0%. While `HarvestService::grading()` sets `$finalGrade = 'GRADE_B'`, line 314 blindly assigns `$gradeAKg = isset($params['grade_a_kg']) ? (float) $params['grade_a_kg'] : 0.0`. If a caller passes `'grade_a_kg' => 1000` on a sub-par batch, `$qualityInfo['grade_a_kg']` stores `1000.0`. Because `HarvestModel->grade_a_kg` inspects `quality_information['grade_a_kg']` first, and `HarvestSettlementService` computes farmer payouts based on `$h->grade_a_kg`, financial payouts can be maliciously or mistakenly inflated at Grade A rates for sub-par agricultural goods.
4. **Premise 4 (Public Traceability Invariant)**: Consumer QR scanning must function without authentication, protect tenant privacy of other cooperatives, handle malicious inputs safely, and produce cryptographically verifiable hashes. Observed: All endpoints respond without auth, return 404 cleanly for invalid/injection inputs, and calculate an exact SHA-256 hash.

---

## 3. Caveats

1. **API Prefix Routing**: In `bootstrap/app.php`, Laravel's global API prefix is set to `api/v1`. Consequently, routes defined in `routes/api.php` resolve to `/api/v1/public/trace/{lotId}` and `/api/v1/trace/{lotId}`. The frontend `apiClient` defaults to `/api/v1`, so frontend QR scanning functions seamlessly. However, if external physical QR stickers were printed with `/api/public/trace/{lotId}` (without `v1`), they would encounter a 404 unless a fallback route alias is registered in `routes/web.php`.
2. **Review-Only Constraint**: In accordance with the system constraints (`Review-only — do NOT modify implementation code`), this challenger did NOT modify `HarvestService.php`. The test `test_kcs_probe_documents_smuggled_grade_a_kg_vulnerability` is retained in the test suite to document the reproduction proof for the backend developer.
3. No other agricultural subsystems were found with deviations or regressions.

---

## 4. Conclusion

**Overall Assessment**: HIGH QUALITY WITH 1 CRITICAL BUSINESS LOGIC VULNERABILITY  
**Verdict**: **REQUEST_CHANGES**

The backend implementation for PHI Guard, Spray Log GPS enforcement, GS1 Lot generation, and Public Traceability is remarkably robust, well-architected, and fully tested (162 tests passing across the backend).

However, **REQUEST_CHANGES** is issued specifically to address the **Grade-A Volume Smuggling Vulnerability** in `HarvestService.php`.

### Required Surgical Remediation:
In `backend/app/Modules/Agriculture/Application/Services/HarvestService.php`:
1. In `grading()` (around line 314), when `$finalGrade !== 'GRADE_A'`, force `$gradeAKg = 0.0;` unconditionally:
   ```php
   // Change line 314 from:
   $gradeAKg = isset($params['grade_a_kg']) ? (float) $params['grade_a_kg'] : 0.0;
   // To:
   $gradeAKg = 0.0;
   ```
2. In `createHarvest()` (around line 116), ensure `grade_a_kg` is only populated if `$grade === 'GRADE_A'`:
   ```php
   $qualityInfo['grade_a_kg'] = ($grade === 'GRADE_A') ? ($dto->gradeAKg !== null ? $dto->gradeAKg : (float) $dto->quantity) : 0.0;
   ```

---

## 5. Verification Method

To independently reproduce all observations and verify the status of the backend logic:

1. **Execute Challenger Adversarial Test Suite**:
   ```bash
   cd f:\HTX_OCOP_PROJECT\backend
   php artisan test --filter=AgricultureChallengerAdversarialTest
   ```
2. **Execute Milestone Agriculture Test Suite**:
   ```bash
   cd f:\HTX_OCOP_PROJECT\backend
   php artisan test --filter=Agriculture
   ```
3. **Execute CropSeason Test Suite**:
   ```bash
   cd f:\HTX_OCOP_PROJECT\backend
   php artisan test --filter=CropSeason
   ```
4. **Execute Full Test Suite**:
   ```bash
   cd f:\HTX_OCOP_PROJECT\backend
   php artisan test
   ```
5. **Verify Frontend Build & Lint**:
   ```bash
   cd f:\HTX_OCOP_PROJECT\frontend
   npm run build
   npm run lint
   ```

**Invalidation Conditions**:
- If `php artisan test --filter=AgricultureChallengerAdversarialTest` fails or exits non-zero.
- If a harvest can be created when `harvest_date < safe_harvest_date`.
- If a spray log can be created without GPS coordinates.
- If `/api/v1/public/trace/{lotId}` requires an `Authorization` header or returns a 500 error on malicious inputs.
