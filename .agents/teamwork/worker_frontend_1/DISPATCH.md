## 2026-10-12T07:50:21Z

You are the Frontend Implementation Worker for the OCOP Digitization Project.
Your working directory is: f:\HTX_OCOP_PROJECT\.agents\teamwork\worker_frontend_1
Original request file: f:\HTX_OCOP_PROJECT\.agents\teamwork\ORIGINAL_REQUEST.md
Project scope file: f:\HTX_OCOP_PROJECT\.agents\teamwork\orchestrator_1\PROJECT.md
Spec Miner report: f:\HTX_OCOP_PROJECT\.agents\teamwork\spec_miner_docs_1\handoff.md
Frontend Explorer report: f:\HTX_OCOP_PROJECT\.agents\teamwork\explorer_frontend_1\handoff.md

MANDATORY INTEGRITY WARNING:
DO NOT CHEAT. All implementations must be genuine. DO NOT hardcode test results, create dummy/facade implementations, or circumvent the intended task. A teamwork_preview_auditor will independently verify your work. Integrity violations WILL be detected and your work WILL be rejected.

EXCLUSIVE WRITE OWNERSHIP:
You own exclusively all frontend files under `f:\HTX_OCOP_PROJECT\frontend\` (`src/`, `package.json`, `vite.config.ts`). DO NOT touch backend files.

YOUR MISSION (Milestone M4: Farmer-Centric UX & Administrative Print Preview):
1. Read the input files listed above carefully.
2. Fix build and lint tooling in `frontend/`:
   - Fix `frontend/package.json` lint script: Configure eslint properly or install/configure so that `npm run lint` executes cleanly with exit code 0.
   - Fix `frontend/vite.config.ts` manualChunks to eliminate the circular chunk warning (`vendor-libs` <-> `vendor-react-core`).
3. Enhance `CreateDossierWizardPage.tsx` with Farmer-Centric UX:
   - Fix point math in Step 4: Part A (40.0đ), Part B (25.0đ), Part C (35.0đ) = Total 100.0đ according to QĐ 148.
   - Make Step 4 interactive: allow farmers to directly click and score criteria or click a prominent "💡 Gợi ý thông minh từ dữ liệu HTX" button to auto-populate scores.
   - Enhance Step 3 (Evidences): Add interactive file upload controls with preview, camera snapshot simulation for mobile/tablet, and display SHA-256 hash preview.
4. Enhance `DossierDetailPage.tsx`:
   - Replace tiny `<select>` dropdowns with large, touch-friendly Card-based radio options (>=48px touch targets) showing point values and farmer-friendly condition descriptions.
   - Add "💡 Gợi ý thông minh từ dữ liệu HTX" button with 1-click apply of recommended scores and explanation.
   - Add Tri-Color Status Badges:
     - 🟢 Green: Hoàn thành (Score set + Valid evidence attached).
     - 🟡 Yellow: Cần bổ sung (Score set but missing evidence/explanation).
     - 🔴 Red: Chưa đạt / Thiếu minh chứng bắt buộc (Mandatory indicator with 0 pts or missing mandatory evidence).
   - Add real-time reactive calculation and display of Dossier Completion Percentage (% Completion Rate) based on assessed criteria and valid evidence.
   - Add plain-language tooltips/explanatory notes for agricultural administrative terms.
5. Enhance `Qd148DocumentModal.tsx`:
   - Implement complete, official Vietnamese administrative layout for:
     - Biểu số 01: Phiếu đăng ký đánh giá, phân hạng sản phẩm OCOP (đầy đủ thông tin HTX Tân Tiến, người đại diện Mai Văn Tân, sản phẩm Ớt chuông Sweet Palermo Đỏ Đà Lạt, huyện Đơn Dương/Đà Lạt, đợt đánh giá).
     - Biểu số 02: Báo cáo tự đánh giá sản phẩm OCOP (đầy đủ 4 phần theo `Bieu mẫu 2.docx`: Phần I Pháp lý, Phần II KQ SXKD, Phần III Tự đánh giá 11 tiêu chí 100đ kèm Bảng 14 minh chứng phụ lục, Phần IV Kế hoạch phát triển).
     - Biểu số 03: Báo cáo đánh giá của UBND cấp xã (xác nhận 4 nội dung: Nguyên liệu, Lao động, Nguồn gốc ý tưởng, Bản sắc văn hóa/trí tuệ địa phương).
   - Add clean `@media print` CSS for standard A4 printing, ensuring print output contains ONLY the document itself with no navigation bars, buttons, or scrollbars.
6. Verify and Test:
   - Run `npm run build` in `frontend/` and ensure exit code 0.
   - Run `npm run lint` in `frontend/` and ensure exit code 0.
7. Write detailed handoff report to `f:\HTX_OCOP_PROJECT\.agents\teamwork\worker_frontend_1\handoff.md` documenting all files created/modified, build/lint commands and output.
8. Send completion message back to orchestrator.
