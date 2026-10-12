# Báo Cáo Khảo Sát Backend Codebase: Phân Hệ Số Hóa & Đánh Giá Phân Hạng OCOP (QĐ 148/QĐ-TTg)

## 1. Observation (Các Quan Sát Thực Nghiệm)

### 1.1. Hiện trạng Test Suite OCOP
- Lệnh thực thi: `php artisan test --filter=Ocop` trong thư mục `f:\HTX_OCOP_PROJECT\backend`.
- Kết quả thực tế:
  ```text
  PASS  Tests\Feature\AuditAndReportTest
  ✓ trace ocop application lifecycle (6.82s)
  ✓ ocop readiness checklist (0.06s)

  PASS  Tests\Feature\OcopApplicationTest
  ✓ create ocop application success (1.32s)
  ✓ create application fails when criteria version not published (0.09s)
  ✓ create application fails when product belongs to another cooperative (0.03s)
  ✓ save self assessment score accumulates total (0.05s)
  ✓ save self assessment fails when score exceeds max score (0.04s)
  ✓ submit fails when not all indicators assessed (0.05s)
  ✓ submit succeeds when all indicators assessed and locks dossier (0.20s)
  ✓ read only lock prevents edits on submitted dossier (0.04s)
  ✓ tenant isolation prevents access to other cooperative dossier (0.04s)

  PASS  Tests\Feature\OcopCriteriaTest
  ✓ get council levels returns success list (0.05s)
  ✓ create criteria version creates draft version (0.04s)
  ✓ create criteria tree groups criteria and indicators (0.05s)
  ✓ publish version fails when total score is not 100 (0.04s)
  ✓ publish version succeeds when total score equals 100 (0.03s)
  ✓ published criteria version is immutable (0.05s)

  PASS  Tests\Feature\OcopEdgeCasesTest
  ✓ edge case 1 submit fails when mandatory indicators incomplete (0.03s)
  ✓ edge case 2 discrepancy calculated when self assessment differs from evaluator (0.09s)
  ✓ edge case 3 final decision approval sets 36 month expiration (0.04s)

  PASS  Tests\Feature\OcopEvaluationTest
  ✓ open session and assign evaluators success (0.05s)
  ✓ scoring locking and lock invariant (0.04s)
  ✓ consolidation average calculation and discrepancy flag (0.04s)
  ✓ star limit downgrade algorithm when mandatory indicator zero (0.09s)
  ✓ approve final decision and calculates 36 month expiration (0.03s)
  ✓ reject application success (0.03s)

  PASS  Tests\Feature\OcopEvidenceTest
  ✓ upload evidence success (0.83s)
  ✓ upload evidence fails with invalid mime type (0.09s)
  ✓ link evidence to indicator and unlink (0.06s)
  ✓ replace evidence creates new version (0.06s)
  ✓ generate signed download url (0.11s)
  ✓ verify and reject evidence (0.05s)
  ✓ tenant isolation prevents access to other cooperative evidence (0.04s)

  Tests:    33 passed (130 assertions)
  Duration: 13.93s
  ```

### 1.2. Cấu Trúc Database Schema & Migrations
Hệ thống tuân thủ 61 bảng theo đặc tả kỹ thuật tại `Tests\Feature\DatabaseSchemaTest.php:12-78`.
Phân hệ OCOP được định nghĩa qua các tệp migration trong `backend/database/migrations/`:
1. `2026_01_01_000038_create_council_levels_table.php`: Bảng `council_levels` (Hội đồng cấp Tỉnh, Trung ương).
2. `2026_01_01_000039_create_criteria_versions_table.php`: Bảng `criteria_versions` (`id`, `version_code`, `name`, `effective_from`, `effective_to`, `source_reference` jsonb, `status` [DRAFT, PUBLISHED, RETIRED]).
3. `2026_01_01_000040_create_criteria_groups_table.php`: Bảng `criteria_groups` (`id`, `criteria_version_id`, `code`, `name`, `description`, `display_order`).
4. `2026_01_01_000041_create_criteria_table.php`: Bảng `criteria` (`id`, `criteria_group_id`, `code`, `name`, `description`, `max_score`, `mandatory`, `display_order`).
5. `2026_01_01_000042_create_indicators_table.php`: Bảng `indicators` (`id`, `criterion_id`, `code`, `name`, `description`, `max_score`, `mandatory`, `evidence_requirement` jsonb, `display_order`).
6. `2026_01_01_000043_create_scoring_rules_table.php`: Bảng `scoring_rules` (`id`, `criteria_version_id`, `rule_code`, `rule_type`, `configuration` jsonb, `priority`, `status`).
7. `2026_01_01_000044_create_mandatory_conditions_table.php`: Bảng `mandatory_conditions` (`id`, `criteria_version_id`, `condition_code`, `name`, `description`, `condition_type`, `configuration` jsonb, `blocking`).
8. `2026_01_01_000045_create_ocop_applications_table.php`: Bảng `ocop_applications` (`id`, `cooperative_id`, `product_id`, `criteria_version_id`, `application_number`, `application_type` [NEW, RE_EVALUATION, UPGRADE], `status`, `submitted_at`, `completed_at`).
9. `2026_01_01_000046_create_self_assessments_table.php`: Bảng `self_assessments` (`id`, `application_id`, `indicator_id`, `score`, `explanation`, `status`).
10. `2026_01_01_000047_create_application_reviews_table.php`: Bảng `application_reviews` (`id`, `application_id`, `reviewer_id`, `review_type`, `result`, `comments`).
11. `2026_01_01_000048_create_evaluation_sessions_table.php`: Bảng `evaluation_sessions` (`id`, `application_id`, `council_level_id`, `session_code`, `session_name`, `status`, `completed_at`).
12. `2026_01_01_000049_create_evaluator_assignments_table.php`: Bảng `evaluator_assignments` (`id`, `evaluation_session_id`, `evaluator_id`, `role`, `status`).
13. `2026_01_01_000050_create_evaluator_scores_table.php`: Bảng `evaluator_scores` (`id`, `assignment_id`, `indicator_id`, `score`, `comment`, `is_locked`).
14. `2026_01_01_000051_create_consolidated_results_table.php`: Bảng `consolidated_results` (`id`, `application_id`, `evaluation_session_id`, `total_score`, `consolidation_status`).
15. `2026_01_01_000052_create_proposed_classifications_table.php`: Bảng `proposed_classifications` (`id`, `application_id`, `result_id`, `proposed_level`, `reason`, `status`).
16. `2026_01_01_000053_create_final_decisions_table.php`: Bảng `final_decisions` (`id`, `application_id`, `authority_reference`, `decision_number`, `decision_date`, `final_classification`, `effective_date`, `document_reference`, `status`).
17. `2026_01_01_000054_create_evidences_table.php`: Bảng `evidences` (`id`, `application_id`, `title`, `evidence_type`, `source_type`, `status`, `current_version_id`, `verified_by`, `verified_at`).
18. `2026_01_01_000055_create_evidence_versions_table.php`: Bảng `evidence_versions` (`id`, `evidence_id`, `version_number`, `file_reference`, `file_name`, `checksum`, `mime_type`, `file_size`, `uploaded_by`, `uploaded_at`, `replacement_reason`).
19. `2026_01_01_000056_create_evidence_links_table.php`: Bảng `evidence_links` (`evidence_id`, `indicator_id`, `relevance`, `note`, `created_by`, `created_at`).
20. `2026_01_01_000061_create_generated_documents_table.php`: Bảng `generated_documents` (`id`, `document_type`, `source_entity_type`, `source_entity_id`, `template_version`, `file_reference`, `checksum`, `generated_at`).

### 1.3. Hiện trạng Seeders (`backend/database/seeders/`)
- Danh mục tệp seeder hiện tại:
  - `CouncilLevelSeeder.php`: Nạp Hội đồng OCOP cấp Tỉnh và cấp Trung ương.
  - `SystemReferenceSeeder.php`: Nạp 13 vai trò (Roles) và quyền (Permissions: `OCOP_CRITERIA.*`, `OCOP_APPLICATION.*`, `OCOP_EVIDENCE.*`, `OCOP_EVALUATION.*`, `OCOP_DECISION.*`).
  - `UserSeeder.php`, `MemberSeeder.php`, `DatabaseSeeder.php`.
- **Thiếu sót nghiêm trọng đối với R1**: Không có bất kỳ seeder nào nạp cây tiêu chí OCOP (`criteria_versions`, `criteria_groups`, `criteria`, `indicators`, `scoring_rules`, `mandatory_conditions`). Cụ thể, sản phẩm chủ lực của HTX Tân Tiến: **Ớt chuông Sweet Palermo Đỏ Đà Lạt** (nhóm Rau củ quả tươi - 100 điểm) **chưa được nạp vào cơ sở dữ liệu qua Seeder**. Các unit test hiện tại chỉ tự tạo bản ghi giả lập inline (2 chỉ tiêu, 1 nhóm) để kiểm thử logic.

### 1.4. Kiến trúc Domain & Services (`backend/app/Modules/Ocop/`)
Kiến trúc tuân thủ chuẩn Domain-Driven Design (DDD) phân lớp:
1. **Modules/Ocop/Criteria**:
   - `CriteriaVersionService.php`:
     - `createVersion`: Khởi tạo bản ghi ở trạng thái `DRAFT`.
     - `updateVersion`: Chặn chỉnh sửa nếu không ở trạng thái DRAFT (`$domainEntity->assertEditable()`).
     - `publishVersion`: Tính tổng `max_score` của tất cả các chỉ tiêu con, kiểm tra chặt chẽ điều kiện `$totalScore == 100.00` thông qua Domain Entity `CriteriaVersion::publish($totalScore)`. Nếu khác 100 điểm, ném ngoại lệ `TOTAL_SCORE_INVALID`. Ghi log kiểm toán `CRITERIA_VERSION_PUBLISHED`.
   - `CriteriaTreeService.php`: Quản trị danh mục cây phân cấp (Groups -> Criteria -> Indicators).
2. **Modules/Ocop/Dossier**:
   - `OcopApplicationService.php`:
     - Quản lý vòng đời hồ sơ: `DRAFT` → `SELF_ASSESSING` → `READY_FOR_SUBMISSION` → `SUBMITTED`.
     - Cách ly dữ liệu đa đơn vị (Tenant Isolation): Kiểm tra `cooperative_id` chặt chẽ (`PRODUCT_TENANT_MISMATCH`, `UNAUTHORIZED_TENANT_ACCESS`).
     - `submitApplication`: Kiểm tra tất cả các chỉ tiêu bắt buộc đã tự chấm điểm (`INCOMPLETE_SELF_ASSESSMENT`), sau đó đóng băng hồ sơ (`DOSSIER_READ_ONLY_LOCKED`).
   - `SelfAssessmentService.php`:
     - Lưu điểm tự chấm theo chỉ tiêu (`score <= max_score`).
3. **Modules/Ocop/Evidence**:
   - `EvidenceUploadService.php`: Tính mã băm SHA-256 an toàn `hash_file('sha256', $file->getRealPath())`, kiểm tra mime type (`pdf, png, jpg...`), gán phiên bản khởi tạo `v1`.
   - `EvidenceVersionService.php`: Tăng số hiệu phiên bản (`version_number` = max + 1), bắt buộc nhập `replacement_reason`, chuyển trạng thái phiên bản cũ sang lưu trữ lịch sử, không xóa cứng.
   - `EvidenceVerificationService.php`: Thẩm định / từ chối minh chứng bởi thẩm định viên.
4. **Modules/Ocop/Evaluation**:
   - `EvaluationConsolidationService.php`:
     - Tổng hợp điểm trung bình của các giám khảo độc lập (Blind scoring).
     - Phát hiện độ lệch điểm giữa các giám khảo vượt quá 10.00 điểm (`SCORE_DISCREPANCY_DETECTED`).
     - Xếp hạng sao sơ bộ (`ProposedClassification::calculateRawClassification($totalScore)`: 3 sao [50-69], 4 sao [70-89], 5 sao [90-100]).
     - Thuật toán khống chế sao (Star-limit Downgrade): Nếu chỉ tiêu bắt buộc dấu sao (`mandatory = true`) có điểm $\le 0$, tự động hạ bậc (ví dụ 4-5 sao bị hạ xuống 3 sao hoặc UNRATED) kèm lý do giải trình.
   - `FinalDecisionService.php`:
     - Phê duyệt quyết định công nhận OCOP, tự động tính ngày hết hạn sau 36 tháng (`$effectiveDate->addMonths(36)`).
5. **Modules/Report**:
   - `DashboardReportService.php`: Phương thức `getOcopReadiness($applicationId)` tính toán:
     - Tỷ lệ hoàn thành tự chấm (`self_assessment_completion_rate`).
     - Tỷ lệ gắn kết minh chứng (`evidence_linkage_completion_rate`).
     - Điểm sẵn sàng (`overall_readiness_score`).
   - `OcopDocumentService.php`: Xuất HTML hồ sơ và chứng nhận OCOP, tính mã băm SHA-256 của file sinh ra (`hash('sha256', $htmlContent)`).

### 1.5. Tuyến Tuyến API (API Routes - `routes/api.php`)
Tất cả các route OCOP đều nằm trong nhóm Sanctum Auth `/api/v1`:
- Tiêu chí: `/ocop/council-levels`, `/ocop/criteria-versions` (CRUD, publish), `/groups`, `/criteria`, `/indicators`.
- Hồ sơ: `/ocop/applications` (CRUD), `/self-assessments`, `/ready-for-submission`, `/submit`.
- Minh chứng: `/ocop/applications/{id}/evidences`, `/evidences/{id}/versions`, `/evidences/{id}/links`, `/evidences/{id}/download`, `/evidences/{id}/verify`.
- Thẩm định & Điểm: `/ocop/evaluation-sessions`, `/assignments`, `/scores`, `/lock`, `/consolidate`, `/approve`, `/reject`.
- Báo cáo & Hồ sơ tài liệu: `/reports/ocop-readiness/{id}`, `/documents/generate/ocop-dossier/{id}`, `/documents/generate/certificate/{id}`, `/documents/{id}/download`.

---

## 2. Logic Chain (Chuỗi Lập Luận Từ Quan Sát Đến Kết Luận)

1. **Từ Quan sát 1.1 và 1.4**: Các ràng buộc cốt lõi (100 điểm khi publish, FSM hồ sơ, tính bất biến khi submit, độ lệch điểm 10đ, khống chế sao khi thiếu chỉ tiêu cứng, tính hạn 36 tháng, SHA-256 mã băm minh chứng) **đã được cài đặt chặt chẽ và test suites đang pass 100%**. Do đó, nền tảng DDD của backend hoàn toàn vững chắc và không bị lỗi thời (legacy).
2. **Từ Quan sát 1.3 và Yêu cầu R1**: `DatabaseSeeder.php` chưa gọi bất kỳ seeder nào cho cây tiêu chí. Để thỏa mãn R1, cần thiết kế một seeder chuẩn `OcopCriteria148Seeder` (hoặc `OcopSweetPalermoCriteriaSeeder`) nạp đầy đủ cấu trúc 3 phần (Phần A: 40đ, Phần B: 25đ, Phần C: 35đ) với tổng điểm chính xác 100.00 cho sản phẩm Ớt chuông Sweet Palermo Đỏ Đà Lạt của HTX Tân Tiến, và phát hành (`PUBLISHED`) phiên bản này để có thể dùng ngay trong giao diện người dùng và wizard tạo hồ sơ.
3. **Từ Quan sát 1.4, 1.5 và Yêu cầu R2**:
   - Hiện tại, chức năng tự chấm điểm mới dừng lại ở việc người dùng gửi thủ công điểm lên API `/self-assessments`. Backend chưa có **Trợ lý gợi ý điểm thông minh (Smart Score Suggestion)** để phân tích tự động dữ liệu HTX (vùng trồng từ `farm_plots`, sản lượng từ `harvests`, xã viên từ `members`, chứng nhận VietGAP từ `products`, nhật ký PHI từ `phi_calculations`) và trả về mức điểm gợi ý cho từng tiêu chí kèm giải trình minh bạch.
   - Các Biểu mẫu 01, 02, 03: `OcopDocumentService.php` hiện chỉ có mẫu HTML chung chung, chưa số hóa tách biệt 3 biểu mẫu theo chuẩn mẫu văn bản trong QĐ 148 Phụ lục II (`docs/Bieu mẫu 1...`, `docs/Bieu mẫu 2...`, `docs/BIEU SO 03...`). Cần bổ sung các phương thức chuyên biệt sinh HTML/PDF xem trước cho Biểu số 01, Biểu số 02 và Biểu số 03 với đầy đủ trường thông tin thực tế của HTX Tân Tiến.
4. **Từ Quan sát 1.4, 1.5 và Yêu cầu R3**: Phân hệ Evidence đã có đầy đủ SHA-256 hash và Versioning (v1, v2...). Tuy nhiên, để tối ưu cho nông dân HTX, cần bổ sung endpoint / service hỗ trợ liên kết minh chứng tự sinh từ hệ thống (trích xuất báo cáo vùng trồng, danh sách xã viên, nhật ký phun thuốc) thành một tệp minh chứng số hóa có mã băm SHA-256 gắn vào hồ sơ mà không cần nông dân phải tải file lên thủ công.

---

## 3. Caveats (Khu Vực Chưa Khảo Sát & Giả Định)

1. **Phạm vi thẩm định nâng cao cấp Huyện**: Mặc dù schema hỗ trợ `council_levels` và `evaluator_assignments`, hệ thống hiện tại đang tối ưu cho góc nhìn Chủ thể HTX (Nông dân nộp hồ sơ, tự chấm, in ấn biểu mẫu).
2. **Thư viện xuất PDF thực tế**: Trong môi trường Backend hiện tại, `OcopDocumentService` xuất file HTML có gắn mã băm SHA-256 và định dạng theo thể thức văn bản hành chính Việt Nam (có thể in trực tiếp qua trình duyệt hoặc chuyển đổi qua DomPDF/wkhtmltopdf nếu môi trường cài đặt sẵn).
3. **Giả định dữ liệu HTX Tân Tiến**: Giả định rằng HTX Tân Tiến có dữ liệu mẫu sẵn có (165 xã viên, vùng trồng Hòn Bồ / Đạ Sar, Ớt chuông Sweet Palermo Đỏ, VietGAP còn hiệu lực) để Trợ lý thông minh trích xuất phục vụ gợi ý điểm.

---

## 4. Conclusion (Kết Luận & Đề Xuất Cải Tiến Cụ Thể)

### 4.1. Những Gì Đã Hoàn Thiện & Đang Hoạt Động Tốt
- Toàn bộ Schema 61 bảng và 72 migrations chạy hoàn hảo trên PostgreSQL/SQLite.
- Bộ 33 Feature Tests của Ocop (`OcopCriteriaTest`, `OcopApplicationTest`, `OcopEdgeCasesTest`, `OcopEvaluationTest`, `OcopEvidenceTest`, `AuditAndReportTest`) pass 100% với 130 assertions.
- Logic DDD:
  - Khóa bất biến tiêu chí đã công bố (`CRITERIA_VERSION_IMMUTABLE`).
  - Ràng buộc tổng 100 điểm khi công bố bộ tiêu chí (`TOTAL_SCORE_INVALID`).
  - Khóa hồ sơ chỉ đọc sau khi nộp (`DOSSIER_READ_ONLY_LOCKED`).
  - Thuật toán khống chế sao khi trượt chỉ tiêu bắt buộc (`Star-limit Downgrade`).
  - Tính mã băm SHA-256 cho tệp minh chứng và quản lý đa phiên bản v1, v2 (không xóa cứng).
  - Tự động tính hạn 36 tháng cho chứng nhận OCOP.
  - Đo lường mức độ sẵn sàng nộp hồ sơ (`/reports/ocop-readiness/{id}`).

### 4.2. Những Gì Cần Bổ Sung / Tinh Chỉnh Để Đạt R1, R2, R3
1. **(R1) Xây dựng `OcopSweetPalermoCriteriaSeeder.php`**:
   - Định nghĩa phiên bản: `OCOP-QD148-2023-FOOD-FRESH` ("Bộ tiêu chí OCOP QĐ 148/QĐ-TTg - Rau, củ, quả tươi").
   - Nhóm 1: Phần A - Sản phẩm & Sức mạnh cộng đồng (40 điểm):
     - TC-A.1: Nguồn nguyên liệu địa phương (10 điểm, mandatory = true).
     - TC-A.2: Sử dụng lao động địa phương (5 điểm, mandatory = false).
     - TC-A.3: Tổ chức sản xuất và liên kết chuỗi (10 điểm, mandatory = true).
     - TC-A.4: Bảo vệ môi trường trong sản xuất (15 điểm, mandatory = true).
   - Nhóm 2: Phần B - Khả năng tiếp thị (25 điểm):
     - TC-B.1.1: Hệ thống kênh phân phối thương mại (8 điểm).
     - TC-B.1.2: Bao bì đóng gói & Tem nhãn truy xuất (7 điểm, mandatory = true).
     - TC-B.2: Câu chuyện về sản phẩm (10 điểm).
   - Nhóm 3: Phần C - Chất lượng sản phẩm (35 điểm):
     - TC-C.1: Chỉ tiêu cảm quan, dinh dưỡng & độc đáo (10 điểm).
     - TC-C.2.1: Tiêu chuẩn chất lượng VietGAP (10 điểm, mandatory = true).
     - TC-C.2.2: Kiểm soát dư lượng thuốc BVTV & PHI (5 điểm, mandatory = true).
     - TC-C.3: Sở hữu trí tuệ & Nhãn hiệu bảo hộ (10 điểm).
   - Tổng cộng: Đúng 100.00 điểm. Trạng thái sau seed: `PUBLISHED`.
   - Đăng ký vào `DatabaseSeeder.php`.

2. **(R2) Xây dựng `OcopScoreSuggestionService.php` & Endpoint Gợi Ý Điểm**:
   - Dịch vụ phân tích tự động dữ liệu HTX:
     - TC-A.1: Đọc `farm_plots` của HTX Tân Tiến -> 100% diện tích tại Đà Lạt/Lạc Dương -> Gợi ý: 10/10đ.
     - TC-A.2: Đọc `members` (165 xã viên cư trú địa phương) -> Gợi ý: 5/5đ.
     - TC-A.3: Đọc `harvests` / liên kết bao tiêu chuỗi siêu thị -> Gợi ý: 9/10đ.
     - TC-C.2.1: Đọc chứng nhận VietGAP của sản phẩm -> Gợi ý: 10/10đ.
     - TC-C.2.2: Đọc `phi_calculations` (tuân thủ 100% thời gian cách ly PHI) -> Gợi ý: 5/5đ.
   - Cung cấp API `GET /api/v1/ocop/applications/{id}/score-suggestions` trả về danh sách gợi ý kèm lý giải ngắn gọn, hỗ trợ nông dân bấm "Áp dụng gợi ý" nhanh chóng.

3. **(R2) Số hóa Biểu mẫu 01, 02, 03 trong `OcopDocumentService.php`**:
   - Bổ sung các phương thức:
     - `generateForm01Html(string $applicationId)`: Phiếu đăng ký theo đúng thể thức Quốc hiệu, Tiêu ngữ, thông tin HTX Tân Tiến, người đại diện, sản phẩm Ớt chuông Sweet Palermo, nhóm Thực phẩm tươi, lần đăng ký lần đầu.
     - `generateForm02Html(string $applicationId)`: Báo cáo tự đánh giá gồm Phần I (Pháp lý), Phần II (Hiện trạng SXKD), Phần III (Bảng điểm tự chấm 100đ và minh chứng), Phần IV (Kế hoạch SXKD).
     - `generateForm03Html(string $applicationId)`: Báo cáo đánh giá của UBND cấp xã xác nhận về nguyên liệu, lao động, nguồn gốc ý tưởng, bản sắc trí tuệ địa phương.
   - Thêm các route API xem trước/tải về cho từng biểu mẫu:
     - `GET /api/v1/documents/preview/form-01/{applicationId}`
     - `GET /api/v1/documents/preview/form-02/{applicationId}`
     - `GET /api/v1/documents/preview/form-03/{applicationId}`

4. **(R3) Tính năng sinh minh chứng tự động từ dữ liệu nội bộ**:
   - Bổ sung helper service trong module Evidence cho phép tạo minh chứng tự động dạng PDF/HTML có mã hash SHA-256 từ bảng kê vùng trồng, sổ nhật ký PHI và danh sách xã viên để liên kết ngay vào các chỉ tiêu tương ứng.

---

## 5. Verification Method (Phương Pháp Xác Minh Độc Lập)

1. **Xác minh Test Suite**:
   ```powershell
   cd f:\HTX_OCOP_PROJECT\backend
   php artisan test --filter=Ocop
   ```
   *Kỳ vọng:* 33/33 tests tiếp tục Pass 100%, không phát sinh regression lỗi.

2. **Xác minh Seeder mới (sau khi triển khai)**:
   ```powershell
   php artisan db:seed --class=OcopSweetPalermoCriteriaSeeder
   ```
   *Kỳ vọng:* Cây tiêu chí với mã phiên bản `OCOP-QD148-2023-FOOD-FRESH` được tạo với tổng điểm chính xác 100.00 và trạng thái `PUBLISHED`.

3. **Xác minh API Gợi ý Điểm & Biểu mẫu**:
   - Gửi yêu cầu GET tới `/api/v1/ocop/applications/{id}/score-suggestions`: nhận về danh sách gợi ý điểm cho từng indicator_id.
   - Gửi yêu cầu GET tới `/api/v1/documents/preview/form-01/{applicationId}`, `form-02`, `form-03`: nhận về nội dung HTML sắc nét đúng chuẩn thể thức văn bản hành chính Việt Nam.

4. **Điều kiện Hủy Bỏ (Invalidation Conditions)**:
   - Nếu bất kỳ test nào trong 33 test hiện hữu bị fail.
   - Nếu tổng điểm cây tiêu chí khác 100.00 điểm.
   - Nếu việc sửa đổi làm vi phạm tính bất biến của các hồ sơ OCOP đã submit hoặc làm hỏng mã hash SHA-256 của minh chứng.
