## 2026-10-13T16:30:26Z
You are the Backend Worker for Agriculture, Farming Logs, Harvest, KCS, GS1 & Traceability.
Your working directory is f:\HTX_OCOP_PROJECT\.agents\teamwork\worker_backend_2.

You MUST read the following files before writing any code:
- f:\HTX_OCOP_PROJECT\.agents\teamwork\ORIGINAL_REQUEST.md
- f:\HTX_OCOP_PROJECT\PROJECT.md
- f:\HTX_OCOP_PROJECT\.agents\teamwork\explorer_backend_2\handoff.md
- f:\HTX_OCOP_PROJECT\.agents\teamwork\spec_miner_agriculture_2\handoff.md

Your exclusive write boundaries:
- app/Http/Controllers/Api/Agriculture/
- app/Services/Agriculture/
- app/Models/Agriculture/
- routes/api.php
- tests/Feature/Agriculture/

MANDATORY INTEGRITY WARNING:
DO NOT CHEAT. All implementations must be genuine. DO NOT hardcode test results, create dummy/facade implementations, or circumvent the intended task. A teamwork_preview_auditor will independently verify your work. Integrity violations WILL be detected and your work WILL be rejected.

Your implementation tasks:
1. In FarmingLogService/Controller, implement auto-lookup of phi_days from Material catalog when logging spray activity if not manually provided.
2. Implement 3-tier KCS inspection logic for Harvest:
   - Gate Check: Enforce PHI safety check; if harvest_date < safe_harvest_date, throw ERR_HARVEST_PHI_VIOLATION (HTTP 400).
   - Quick Lab: Record kcs_quick_lab (LAB_PASSED / LAB_REJECTED), test kit, ppm.
   - Grading: Calculate and record grade_a_kg, grade_b_kg, reject_kg, brix_level, uniformity_rate. Grade A requires uniformity >= 90% and Brix >= 7.
3. In Finance settlement / Harvest integration: Provide a method/service to aggregate Grade A and Grade B harvest quantities for a crop season and settle member payout after deducting warehouse credit advance.
4. Public Traceability API:
   - Create PublicTraceabilityController.php and add public route `GET /api/public/trace/{lotId}` in `routes/api.php` outside of `auth:sanctum`.
   - The route must allow lookup by either lot_code or id without authentication.
   - Return full dossier: cooperative info (HTX Tan Tien), PUC code, Sweet Palermo product details, VietGAP certification, GPS plot coordinates, 5-stage farming journey logs, KCS inspection results, SHA-256 hash.
5. Verification:
   - Run `php artisan test --filter=Agriculture` and `php artisan test --filter=CropSeason`. Ensure all tests pass 100%!

Write your complete report to f:\HTX_OCOP_PROJECT\.agents\teamwork\worker_backend_2\handoff.md.
Update progress.md in your working directory.
When finished, send a message back to parent with summary and handoff file path.
