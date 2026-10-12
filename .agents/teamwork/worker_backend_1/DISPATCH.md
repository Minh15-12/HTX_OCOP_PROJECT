## 2026-10-12T07:50:21Z

You are the Backend Implementation Worker for the OCOP Digitization Project.
Your working directory is: f:\HTX_OCOP_PROJECT\.agents\teamwork\worker_backend_1
Original request file: f:\HTX_OCOP_PROJECT\.agents\teamwork\ORIGINAL_REQUEST.md
Project scope file: f:\HTX_OCOP_PROJECT\.agents\teamwork\orchestrator_1\PROJECT.md
Spec Miner report: f:\HTX_OCOP_PROJECT\.agents\teamwork\spec_miner_docs_1\handoff.md
Backend Explorer report: f:\HTX_OCOP_PROJECT\.agents\teamwork\explorer_backend_1\handoff.md

MANDATORY INTEGRITY WARNING:
DO NOT CHEAT. All implementations must be genuine. DO NOT hardcode test results, create dummy/facade implementations, or circumvent the intended task. A teamwork_preview_auditor will independently verify your work. Integrity violations WILL be detected and your work WILL be rejected.

EXCLUSIVE WRITE OWNERSHIP:
You own exclusively all backend code files under `f:\HTX_OCOP_PROJECT\backend\` (`app/`, `database/`, `routes/`, `tests/`). DO NOT touch frontend files.

YOUR MISSION (Milestones M1, M2, M3):
1. Read the input files listed above carefully.
2. Build `OcopSweetPalermoCriteriaSeeder.php` in `backend/database/seeders/`:
   - Seeder creates and publishes criteria version `OCOP-QD148-2023-FRESH` (100.0 points total) according to QĐ 148 for Fresh Vegetables (Ớt chuông Sweet Palermo Đỏ Đà Lạt):
     - Group GA (Phần A: Sản phẩm & sức mạnh cộng đồng - 40.0đ): TC-A.1 (10đ, mandatory), TC-A.2 (5đ), TC-A.3 (10đ), TC-A.4 (15đ, mandatory).
     - Group GB (Phần B: Khả năng tiếp thị - 25.0đ): TC-B.1.1 (8đ), TC-B.1.2 (7đ, mandatory), TC-B.2 (10đ).
     - Group GC (Phần C: Chất lượng sản phẩm - 35.0đ): TC-C.1 (10đ), TC-C.2.1 (10đ, mandatory), TC-C.2.2 (5đ, mandatory), TC-C.3 (10đ).
     - 11 indicators matching the criteria with clear display_order and evidence_requirement configs.
     - Complete `scoring_rules` for all indicators with step-by-step point levels.
     - 6 `mandatory_conditions` (VietGAP for 4-star, Environment for submit, Local raw materials, Label/QR, PHI compliance, 100% completion).
     - Auto-publish via `$criteriaVersionService->publishVersion(...)` so status is `PUBLISHED` (immutable).
     - Register `OcopSweetPalermoCriteriaSeeder::class` in `backend/database/seeders/DatabaseSeeder.php`.
3. Implement `OcopScoreSuggestionService.php` in `backend/app/Modules/Ocop/Services/`:
   - Analyzes HTX Tân Tiến real data: farm_plots (100% in Da Lat/Lac Duong), members (165 households), harvests/contracts (WinMart/Coopmart 4,720 tons), VietGAP certificate (VICB-2024-GAP-0128 valid to 2027), PHI spray logs (100% compliant).
   - Generates suggested scores and clear rationale for each indicator.
   - Add controller/route `GET /api/v1/ocop/applications/{id}/score-suggestions` in `backend/routes/api.php`.
4. Enhance `OcopDocumentService.php` in `backend/app/Modules/Report/`:
   - Methods to generate official Vietnamese administrative format HTML for:
     - Form 01 (Biểu số 01: Phiếu đăng ký đánh giá phân hạng OCOP).
     - Form 02 (Biểu số 02: Báo cáo tự đánh giá sản phẩm OCOP - 4 phần + Bảng 14 minh chứng phụ lục).
     - Form 03 (Biểu số 03: Báo cáo đánh giá của UBND cấp xã xác nhận 4 nội dung).
   - Add API routes for document generation/preview in `backend/routes/api.php`.
5. Enhance evidence auto-extraction:
   - Provide capability/endpoint to automatically extract internal HTX data (farm plots list, member list, PHI journal) as an attached evidence document with computed SHA-256 hash.
6. Write Feature Tests in `backend/tests/Feature/Ocop/OcopSweetPalermoIntegrationTest.php`:
   - Test Seeder executes, total score is exactly 100.0, status is PUBLISHED.
   - Test Score Suggestion Service returns expected suggestions and rationales.
   - Test Form 01, 02, 03 generation produces valid HTML with HTX Tan Tien data.
   - Test SHA-256 checksum integrity and versioning.
7. Run `php artisan test --filter=Ocop` in `backend/` and verify that ALL tests pass.
8. Write detailed handoff report to `f:\HTX_OCOP_PROJECT\.agents\teamwork\worker_backend_1\handoff.md` documenting all files created/modified, test command and output, and verification results.
9. Send completion message back to orchestrator.
