## 2026-10-13T17:11:30Z
You are the Frontend Remediation Worker (Iteration 2).
Your working directory is f:\HTX_OCOP_PROJECT\.agents\teamwork\worker_frontend_remediation_2.

You MUST read:
- f:\HTX_OCOP_PROJECT\.agents\teamwork\ORIGINAL_REQUEST.md
- f:\HTX_OCOP_PROJECT\PROJECT.md
- f:\HTX_OCOP_PROJECT\.agents\teamwork\explorer_frontend_remediation_2\handoff.md
- f:\HTX_OCOP_PROJECT\.agents\teamwork\explorer_integration_remediation_2\handoff.md

Your exclusive write boundaries:
- frontend/src/features/agriculture/components/
- frontend/src/features/agriculture/pages/
- frontend/src/services/
- frontend/package.json

MANDATORY INTEGRITY WARNING:
DO NOT CHEAT. All implementations must be genuine. DO NOT hardcode test results, create dummy/facade implementations, or circumvent the intended task. A teamwork_preview_auditor will independently verify your work. Integrity violations WILL be detected and your work WILL be rejected.

Your remediation tasks (follow explorer_frontend_remediation_2 and explorer_integration_remediation_2 handoffs):
1. In `frontend/src/features/agriculture/components/QrCodeSvg.tsx`:
   - Install `qrcode` package (run `npm install qrcode @types/qrcode` in `frontend/`) or use standard ISO/IEC 18004 QR matrix generator so that generated QR codes are 100% scannable by mobile phones (Camera/Zalo) and GS1 scanners.
2. In `frontend/src/features/agriculture/components/QuickMobileLogModal.tsx`:
   - Ensure all 12 input, select, and button elements strictly meet `min-h-[48px]` for farmer touch targets.
   - Implement Canvas image resizing/compression (max 1024px, JPEG 0.75, ~100KB) before saving to Base64 to prevent `QuotaExceededError`.
3. In `frontend/src/services/traceabilityApi.ts`:
   - Propagate/re-throw HTTP 404 on unknown lot codes (e.g. `FAKE_123`) so `PublicTraceabilityPage.tsx` renders the "Không tìm thấy mã lô" error screen. Only allow mock fallback for registered seed demo lots.
4. In `frontend/src/features/agriculture/components/PhiCountdownBadge.tsx`:
   - Parse ISO date into local end-of-day date to eliminate off-by-one day bugs.
5. In `frontend/src/features/agriculture/components/HarvestLabelPrintModal.tsx`:
   - Add print styling `@page { size: 100mm 75mm; margin: 0; }` and reset transform.
6. Run verification:
   - `npm run build && npm run lint`
   Verify 100% pass with 0 errors!
