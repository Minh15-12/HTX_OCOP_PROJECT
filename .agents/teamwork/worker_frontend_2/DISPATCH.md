## 2026-10-13T16:30:26Z

You are the Frontend Worker for Agriculture, Farming Logs, Harvest, KCS, GS1 & Traceability.
Your working directory is f:\HTX_OCOP_PROJECT\.agents\teamwork\worker_frontend_2.

You MUST read the following files before writing any code:
- f:\HTX_OCOP_PROJECT\.agents\teamwork\ORIGINAL_REQUEST.md
- f:\HTX_OCOP_PROJECT\PROJECT.md
- f:\HTX_OCOP_PROJECT\.agents\teamwork\explorer_frontend_2\handoff.md
- f:\HTX_OCOP_PROJECT\.agents\teamwork\spec_miner_agriculture_2\handoff.md

Your exclusive write boundaries:
- frontend/src/features/agriculture/
- frontend/src/services/
- frontend/src/router/AppRoutes.tsx
- frontend/src/types/agriculture.ts

MANDATORY INTEGRITY WARNING:
DO NOT CHEAT. All implementations must be genuine. DO NOT hardcode test results, create dummy/facade implementations, or circumvent the intended task. A teamwork_preview_auditor will independently verify your work. Integrity violations WILL be detected and your work WILL be rejected.

Your implementation tasks (follow the 6-step roadmap in explorer_frontend_2/handoff.md):
1. Types & Services:
   - Define TypeScript types in `frontend/src/types/agriculture.ts`.
   - Create `farmingLogApi.ts`, `harvestApi.ts`, `traceabilityApi.ts` in `frontend/src/services/` with local fallback support.
2. FarmPlotsPage & Plot Status Visual Indicators:
   - Create `PhiCountdownBadge.tsx` displaying real-time countdown when in quarantine ("🛑 Cách ly PHI: Còn X ngày Y giờ").
   - 3-color status indicators: Green (ACTIVE), Red/Orange pulsing (IN_QUARANTINE), Gray (FALLOW).
   - Standardize data for HTX Tan Tien & Sweet Palermo Red.
3. Quick Mobile Logging on FarmingLogsPage:
   - Create `QuickMobileLogModal.tsx` and connect to button "Ghi nhật ký mới (TT02)".
   - Touch targets >= 48px, 1-tap action selection (5 activity types).
   - 1-tap HTML5 Geolocation API auto-fill for GPS.
   - Camera/file input for real evidence photos.
   - Quick material selector auto-filling SKU and batch number, calculating safe_harvest_date.
   - Enforce mandatory GPS on Spraying (BR-FARM-003).
4. 3-Tier KCS & GS1 Label Printing on HarvestsPage:
   - Enhance Harvest creation modal to support 3-tier KCS: Gate Check (real-time PHI block ERR_HARVEST_PHI_VIOLATION), Quick Lab (Passed/Rejected), Grading (Grade A/B kg, Brix >= 7, Uniformity >= 90%).
   - Create `HarvestLabelPrintModal.tsx`: standard packaging label template (100mm x 75mm) for HTX Tan Tien, Sweet Palermo Red, GS1 Lot Code, QR Code SVG pointing to `/trace/${lot_code}`, with `window.print()`.
5. Public Traceability View:
   - Create `PublicTraceabilityPage.tsx`: Mobile-first responsive consumer view displaying Tan Tien Coop, PUC, Sweet Palermo specs, OCOP 4-star & VietGAP certs, GPS map, 5-stage farming journey, KCS results, SHA-256 hash.
   - Configure public routes `/trace/:lotId` and `/public/trace/:lotId` in `frontend/src/router/AppRoutes.tsx` outside of ProtectedRoute (NO AUTH REQUIRED).
6. Verification:
   - Run `npm run build && npm run lint`. Ensure 100% pass with 0 errors!
