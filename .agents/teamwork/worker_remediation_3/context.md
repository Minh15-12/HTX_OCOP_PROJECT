# Context: Worker Remediation 3

- Project Root: f:/HTX_OCOP_PROJECT
- Working Directory: f:/HTX_OCOP_PROJECT/.agents/teamwork/worker_remediation_3
- Target File: f:/HTX_OCOP_PROJECT/docs/BAO_CAO_DANH_GIA_VA_THIET_KE_KIEN_TRUC_HTX_OCOP.md
- Feedback from challenger_blueprint_2 & reviewer_blueprint_1:
  1. Module 2 (line 196): Sửa tỷ lệ thông qua Nghị quyết trọng yếu từ >= 66% thành >= 75% theo Khoản 2 Điều 72 Luật HTX 2023 (khớp với MeetingService.php:231).
  2. Section 6.1 (P0 Backlog): Bổ sung nhiệm vụ xử lý lỗ hổng FEFO trong StockIssueService.php: chặn xuất kho các lô vật tư hết hạn (expired_at < now()), ném ngoại lệ ERR_MATERIAL_BATCH_EXPIRED (HTTP 422).
  3. Section 6.3 (Bảng 6.3 TC-06): Sửa mã lỗi từ ERR_DEBT_ALREADY_SETTLED thành OVER_SETTLEMENT_VIOLATION theo đúng ReceivablePayable.php:40.
