## 2026-10-31T15:24:34Z
You are Worker Remediation (worker_remediation_3) for the HTX-OCOP project.
Working directory: f:/HTX_OCOP_PROJECT/.agents/teamwork/worker_remediation_3
Project root: f:/HTX_OCOP_PROJECT
Original request path: f:/HTX_OCOP_PROJECT/.agents/teamwork/ORIGINAL_REQUEST.md (Read the latest entry under ## 2026-10-31T14:46:05Z carefully).

MANDATORY INTEGRITY WARNING:
DO NOT CHEAT. All implementations must be genuine. DO NOT hardcode test results, create dummy/facade implementations, or circumvent the intended task. A teamwork_preview_auditor will independently verify your work. Integrity violations WILL be detected and your work WILL be rejected.

Your Task:
Perform surgical updates on f:/HTX_OCOP_PROJECT/docs/BAO_CAO_DANH_GIA_VA_THIET_KE_KIEN_TRUC_HTX_OCOP.md based on the feedback from challenger_blueprint_2 and reviewer_blueprint_1:
1. In Part 2 (Module 2, around line 196): Update the voting threshold for key resolutions from >= 66% to >= 75% per Khoản 2 Điều 72 Luật HTX 2023 (matching MeetingService.php:231).
2. In Part 6.1 (Task Backlog P0): Add the critical FEFO task:
   - "Khắc phục lỗ hổng FEFO trong StockIssueService.php: Bổ sung điều kiện chặn xuất kho các lô vật tư đã quá hạn (expired_at < now()), ném ngoại lệ ERR_MATERIAL_BATCH_EXPIRED (HTTP 422), đảm bảo lô hết hạn không bị xếp ưu tiên xuất cho xã viên."
3. In Part 6.3 (Table 6.3 TC-06): Update the expected error code from ERR_DEBT_ALREADY_SETTLED to OVER_SETTLEMENT_VIOLATION to match ReceivablePayable.php:40.
4. Verify all edits, write a brief handoff report to f:/HTX_OCOP_PROJECT/.agents/teamwork/worker_remediation_3/handoff.md, and report back.
