# 12_API_SPECIFICATION.md

# 1. Document Information

| Field | Value |
|---|---|
| Document ID | 12 |
| Document Name | API Specification |
| Project | Xây dựng Hệ thống quản lý hoạt động Hợp tác xã nông nghiệp và số hóa hồ sơ đánh giá, phân hạng OCOP |
| Status | BASELINE |
| Primary Source | 11_DATABASE_DESIGN_FINAL.md |
| Upstream Source | 01 → 10 |
| Backend Candidates | Laravel / FastAPI |
| API Style | REST/JSON |
| Object Storage | MinIO hoặc tương đương |

> Mục tiêu của tài liệu này là định nghĩa API contract ở mức đủ rõ để frontend và backend phát triển độc lập. API không được thiết kế bằng cách đổi tên database table thành endpoint một cách máy móc.

---

# 2. API Design Principles

1. API là application contract, không phải database contract.
2. Business rule được enforce ở backend; frontend không phải security boundary.
3. Mọi endpoint tenant-bound phải kiểm tra `cooperative_id` hoặc scope qua parent.
4. Các nghiệp vụ thay đổi trạng thái phải kiểm tra workflow.
5. Các dữ liệu versioned/locked không được sửa destructive.
6. File binary không đi qua database; API file dùng object storage abstraction.
7. Không trả dữ liệu nhạy cảm nếu caller không có permission/data scope.
8. Các thao tác quan trọng phải tạo audit event.
9. API phải hỗ trợ pagination/filtering/sorting nhất quán.
10. API version dùng prefix `/api/v1`.
11. Idempotency được yêu cầu cho các command có khả năng retry.
12. Các policy OCOP thay đổi theo version; không hard-code cấp đánh giá hoặc ngưỡng điểm trong endpoint.

---

# 3. Base URL & Content Type

```text
/api/v1
```

Request/response mặc định:

```http
Content-Type: application/json
Accept: application/json
```

File upload:

```http
Content-Type: multipart/form-data
```

---

# 4. Authentication

Baseline:

```text
Authorization: Bearer <access_token>
```

API phải xác định:

```text
authenticated user
        ↓
roles
        ↓
permissions
        ↓
data scopes
        ↓
resource authorization
```

Không tin `user_id`, `cooperative_id` hoặc scope do client gửi nếu không được đối chiếu với token/session.

---

# 5. Authorization & Data Scope

Permission có dạng:

```text
member.read
member.create
member.approve

evidence.read
evidence.upload
evidence.verify

evaluation.score
evaluation.consolidate

decision.record
audit.read
```

Các scope baseline:

```text
GLOBAL
COOPERATIVE
APPLICATION
EVALUATION_SESSION
```

Ví dụ:

```text
GET /api/v1/members
```

phải lọc theo cooperative scope của user.

Evaluator chỉ được thao tác trên evaluation session được phân công.

---

# 6. Common Response

## 6.1 Success

```json
{
  "data": {},
  "meta": {}
}
```

## 6.2 Collection

```json
{
  "data": [],
  "meta": {
    "page": 1,
    "per_page": 20,
    "total": 100
  }
}
```

## 6.3 Error

```json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Request is invalid",
    "details": [
      {
        "field": "name",
        "reason": "required"
      }
    ],
    "trace_id": "..."
  }
}
```

Không trả stack trace hoặc thông tin nội bộ production.

---

# 7. HTTP Status Codes

| Status | Ý nghĩa |
|---:|---|
| 200 | Success |
| 201 | Created |
| 202 | Accepted / async job |
| 204 | Success without body |
| 400 | Bad request |
| 401 | Unauthenticated |
| 403 | Forbidden |
| 404 | Resource not found / không tiết lộ resource ngoài scope |
| 409 | Conflict / state conflict / duplicate |
| 422 | Validation error |
| 429 | Rate limit |
| 500 | Internal error |

---

# 8. Pagination / Filtering / Sorting

Collection endpoint:

```text
?page=1
&per_page=20
&sort=-created_at
&status=ACTIVE
```

Quy tắc:

- `per_page` có giới hạn server-side.
- Filter phải được whitelist.
- Sort field phải được whitelist.
- Không cho client truyền raw SQL/order expression.

---

# 9. Cooperative APIs

## 9.1 List

```http
GET /api/v1/cooperatives
```

## 9.2 Detail

```http
GET /api/v1/cooperatives/{cooperative_id}
```

## 9.3 Create

```http
POST /api/v1/cooperatives
```

```json
{
  "cooperative_code": "HTX001",
  "legal_name": "..."
}
```

## 9.4 Update

```http
PATCH /api/v1/cooperatives/{cooperative_id}
```

## 9.5 Status

```http
POST /api/v1/cooperatives/{cooperative_id}/status-transitions
```

Status transition phải được workflow/permission kiểm tra.

---

# 10. Member APIs

```http
GET    /api/v1/members
POST   /api/v1/members
GET    /api/v1/members/{member_id}
PATCH  /api/v1/members/{member_id}
POST   /api/v1/members/{member_id}/approve
POST   /api/v1/members/{member_id}/status-transitions
```

Create:

```json
{
  "cooperative_id": "...",
  "member_code": "...",
  "identity_information": {},
  "member_type": "..."
}
```

Backend phải kiểm tra caller có quyền trên cooperative.

---

# 11. Capital Contribution APIs

```http
GET  /api/v1/members/{member_id}/capital-contributions
POST /api/v1/members/{member_id}/capital-contributions
GET  /api/v1/capital-contributions/{id}
```

Không cho sửa/xóa contribution đã tham gia dữ liệu tài chính nếu policy yêu cầu immutable.

---

# 12. Meeting & Vote APIs

```http
GET  /api/v1/meetings
POST /api/v1/meetings
GET  /api/v1/meetings/{id}
PATCH /api/v1/meetings/{id}
POST /api/v1/meetings/{id}/votes
GET  /api/v1/meetings/{id}/votes
```

Vote phải kiểm tra member thuộc cooperative và có quyền biểu quyết theo nghiệp vụ.

---

# 13. Production Unit APIs

```http
GET    /api/v1/production-units
POST   /api/v1/production-units
GET    /api/v1/production-units/{id}
PATCH  /api/v1/production-units/{id}
DELETE /api/v1/production-units/{id}
```

Nếu GIS được bật:

```text
geometry
```

được nhận dưới representation đã thống nhất, không cho raw database geometry.

---

# 14. Farm Plot APIs

```http
GET   /api/v1/production-units/{unit_id}/plots
POST  /api/v1/production-units/{unit_id}/plots
GET   /api/v1/farm-plots/{plot_id}
PATCH /api/v1/farm-plots/{plot_id}
```

Assignment:

```http
GET  /api/v1/farm-plots/{plot_id}/member-assignments
POST /api/v1/farm-plots/{plot_id}/member-assignments
```

Backend kiểm tra:

```text
member ↔ cooperative
plot ↔ production unit ↔ cooperative
```

---

# 15. Crop Season APIs

```http
GET   /api/v1/crop-seasons
POST  /api/v1/crop-seasons
GET   /api/v1/crop-seasons/{id}
PATCH /api/v1/crop-seasons/{id}
POST  /api/v1/crop-seasons/{id}/close
```

Date invariant:

```text
expected_end_date >= start_date
actual_end_date >= start_date
```

---

# 16. Farming Journal APIs

```http
GET  /api/v1/farming-logs
POST /api/v1/farming-logs
GET  /api/v1/farming-logs/{id}
PATCH /api/v1/farming-logs/{id}
```

Create:

```json
{
  "crop_season_id": "...",
  "plot_id": "...",
  "activity_type": "...",
  "activity_date": "2026-08-31",
  "description": "..."
}
```

Backend phải kiểm tra plot thuộc season/production context phù hợp.

---

# 17. Material Usage APIs

```http
GET  /api/v1/farming-logs/{log_id}/material-usages
POST /api/v1/farming-logs/{log_id}/material-usages
DELETE /api/v1/material-usages/{id}
```

`quantity > 0`.

---

# 18. PHI APIs

```http
GET  /api/v1/farming-logs/{log_id}/phi-calculations
POST /api/v1/farming-logs/{log_id}/phi-calculations
GET  /api/v1/phi-calculations/{id}
```

API không tự suy đoán `configured_phi_days` nếu không có nguồn/rule đã được cấu hình.

---

# 19. Harvest & Lot APIs

```http
GET  /api/v1/harvests
POST /api/v1/harvests
GET  /api/v1/harvests/{id}
PATCH /api/v1/harvests/{id}

GET  /api/v1/lots
POST /api/v1/lots
GET  /api/v1/lots/{id}
```

Quan hệ Harvest → Lot phải tuân theo model đã được chốt ở database/business rules.

---

# 20. Product APIs

```http
GET   /api/v1/products
POST  /api/v1/products
GET   /api/v1/products/{id}
PATCH /api/v1/products/{id}
```

Product phải thuộc cooperative scope.

Product-lot:

```http
POST /api/v1/products/{product_id}/lots
GET  /api/v1/products/{product_id}/lots
```

---

# 21. Material APIs

```http
GET   /api/v1/materials
POST  /api/v1/materials
GET   /api/v1/materials/{id}
PATCH /api/v1/materials/{id}
```

Không cho sửa SKU theo cách phá vỡ transaction history.

---

# 22. Stock Receipt APIs

```http
GET  /api/v1/stock-receipts
POST /api/v1/stock-receipts
GET  /api/v1/stock-receipts/{id}
PATCH /api/v1/stock-receipts/{id}
POST /api/v1/stock-receipts/{id}/submit
POST /api/v1/stock-receipts/{id}/approve
```

Transaction boundary:

```text
validate
→ create receipt
→ create lines
→ inventory transaction/ledger
→ audit
→ commit
```

Không cập nhật tồn kho bằng request rời rạc ngoài transaction nghiệp vụ.

---

# 23. Stock Issue APIs

```http
GET  /api/v1/stock-issues
POST /api/v1/stock-issues
GET  /api/v1/stock-issues/{id}
PATCH /api/v1/stock-issues/{id}
POST /api/v1/stock-issues/{id}/submit
POST /api/v1/stock-issues/{id}/approve
```

Invariant:

```text
available_stock >= requested_quantity
```

Phải xử lý concurrency/locking khi xuất kho.

---

# 24. Stock Count APIs

```http
GET  /api/v1/stock-counts
POST /api/v1/stock-counts
GET  /api/v1/stock-counts/{id}
PATCH /api/v1/stock-counts/{id}
POST /api/v1/stock-counts/{id}/complete
POST /api/v1/stock-counts/{id}/approve
```

Không cho chỉnh count đã chốt nếu không có override/audit.

---

# 25. Finance APIs

## Cash

```http
GET  /api/v1/cash-transactions
POST /api/v1/cash-transactions
GET  /api/v1/cash-transactions/{id}
POST /api/v1/cash-transactions/{id}/approve
```

## Receivable / Payable

```http
GET  /api/v1/receivable-payables
POST /api/v1/receivable-payables
GET  /api/v1/receivable-payables/{id}
```

## Settlement

```http
POST /api/v1/receivable-payables/{debt_id}/settlements
GET  /api/v1/receivable-payables/{debt_id}/settlements
```

---

# 26. Surplus Distribution APIs

```http
GET  /api/v1/surplus-distribution-plans
POST /api/v1/surplus-distribution-plans
GET  /api/v1/surplus-distribution-plans/{id}
POST /api/v1/surplus-distribution-plans/{id}/calculate
POST /api/v1/surplus-distribution-plans/{id}/submit
POST /api/v1/surplus-distribution-plans/{id}/approve
```

Tổng item không được vượt `total_amount`.

Công thức phải tham chiếu rule version đã được xác nhận.

---

# 27. OCOP Criteria Version APIs

```http
GET  /api/v1/ocop/criteria-versions
POST /api/v1/ocop/criteria-versions
GET  /api/v1/ocop/criteria-versions/{id}
PATCH /api/v1/ocop/criteria-versions/{id}
POST /api/v1/ocop/criteria-versions/{id}/activate
POST /api/v1/ocop/criteria-versions/{id}/retire
```

Criteria version đã được sử dụng không được destructive update.

---

# 28. Criteria / Indicator APIs

```http
GET  /api/v1/ocop/criteria-versions/{version_id}/groups
POST /api/v1/ocop/criteria-versions/{version_id}/groups

GET  /api/v1/ocop/criteria-groups/{group_id}/criteria
POST /api/v1/ocop/criteria-groups/{group_id}/criteria

GET  /api/v1/ocop/criteria/{criterion_id}/indicators
POST /api/v1/ocop/criteria/{criterion_id}/indicators
```

API phải bảo đảm indicator thuộc đúng criteria version của application khi được sử dụng.

---

# 29. Scoring Rule APIs

```http
GET  /api/v1/ocop/criteria-versions/{version_id}/scoring-rules
POST /api/v1/ocop/criteria-versions/{version_id}/scoring-rules
GET  /api/v1/ocop/scoring-rules/{id}
```

`configuration` phải được validate theo `rule_type`.

Không dùng JSONB để bỏ qua mọi validation.

---

# 30. Mandatory Condition APIs

```http
GET  /api/v1/ocop/criteria-versions/{version_id}/mandatory-conditions
POST /api/v1/ocop/criteria-versions/{version_id}/mandatory-conditions
```

Điều kiện `blocking=true` phải được đánh giá trước proposed classification.

---

# 31. Council Level APIs

Council level là configurable reference, không hard-code trong application code.

```http
GET /api/v1/ocop/council-levels
```

Baseline hiện tại:

```text
PROVINCE
CENTRAL
```

Nếu policy thay đổi, thêm/version hóa reference phù hợp thay vì đổi API contract chỉ vì có thêm một level.

---

# 32. OCOP Application APIs

```http
GET  /api/v1/ocop/applications
POST /api/v1/ocop/applications
GET  /api/v1/ocop/applications/{id}
PATCH /api/v1/ocop/applications/{id}

POST /api/v1/ocop/applications/{id}/submit
POST /api/v1/ocop/applications/{id}/cancel
```

Create:

```json
{
  "cooperative_id": "...",
  "product_id": "...",
  "criteria_version_id": "...",
  "application_type": "..."
}
```

Backend kiểm tra:

```text
product.cooperative_id
=
application.cooperative_id
```

---

# 33. Self Assessment APIs

```http
GET   /api/v1/ocop/applications/{application_id}/self-assessments
POST  /api/v1/ocop/applications/{application_id}/self-assessments
PATCH /api/v1/ocop/self-assessments/{id}
POST  /api/v1/ocop/applications/{application_id}/self-assessment/submit
```

Score:

```text
0 <= score <= indicator.max_score
```

và indicator phải thuộc criteria version của application.

---

# 34. Application Review APIs

```http
GET  /api/v1/ocop/applications/{application_id}/reviews
POST /api/v1/ocop/applications/{application_id}/reviews
POST /api/v1/ocop/application-reviews/{id}/approve
POST /api/v1/ocop/application-reviews/{id}/request-revision
```

Reviewer phải có permission + data scope phù hợp.

---

# 35. Evaluation Session APIs

```http
GET  /api/v1/ocop/evaluation-sessions
POST /api/v1/ocop/evaluation-sessions
GET  /api/v1/ocop/evaluation-sessions/{id}
PATCH /api/v1/ocop/evaluation-sessions/{id}

POST /api/v1/ocop/evaluation-sessions/{id}/start
POST /api/v1/ocop/evaluation-sessions/{id}/close
```

Create:

```json
{
  "application_id": "...",
  "council_level_id": "..."
}
```

Không dùng:

```text
/province-evaluation
/central-evaluation
```

làm API contract lõi.

---

# 36. Evaluator Assignment APIs

```http
GET  /api/v1/ocop/evaluation-sessions/{session_id}/assignments
POST /api/v1/ocop/evaluation-sessions/{session_id}/assignments
PATCH /api/v1/ocop/evaluator-assignments/{id}
POST /api/v1/ocop/evaluator-assignments/{id}/complete
```

Backend kiểm tra evaluator có role/scope phù hợp.

---

# 37. Evaluator Score APIs

```http
GET  /api/v1/ocop/evaluator-assignments/{assignment_id}/scores
POST /api/v1/ocop/evaluator-assignments/{assignment_id}/scores
PATCH /api/v1/ocop/evaluator-scores/{id}
POST /api/v1/ocop/evaluator-assignments/{assignment_id}/submit
POST /api/v1/ocop/evaluator-scores/{id}/lock
```

Không sửa score sau lock nếu không có workflow override.

Score phải thuộc indicator của criteria version đang đánh giá.

---

# 38. Consolidation APIs

```http
GET  /api/v1/ocop/evaluation-sessions/{session_id}/consolidated-result
POST /api/v1/ocop/evaluation-sessions/{session_id}/consolidate
```

Transaction:

```text
validate all scores
→ evaluate mandatory conditions
→ calculate result
→ persist consolidated result
→ audit
→ commit
```

Không tạo kết quả tổng hợp một phần.

---

# 39. Proposed Classification APIs

```http
GET  /api/v1/ocop/applications/{application_id}/proposed-classifications
POST /api/v1/ocop/applications/{application_id}/proposed-classifications
GET  /api/v1/ocop/proposed-classifications/{id}
POST /api/v1/ocop/proposed-classifications/{id}/approve
```

Không dùng proposed classification để giả lập final decision.

---

# 40. Final Decision APIs

```http
GET  /api/v1/ocop/applications/{application_id}/final-decisions
POST /api/v1/ocop/applications/{application_id}/final-decisions
GET  /api/v1/ocop/final-decisions/{id}
```

Final decision phải có:

```text
authority reference
decision number
decision date
final classification
document reference
```

Chỉ actor có quyền quyết định mới được record final decision.

---

# 41. Evidence APIs

```http
GET  /api/v1/ocop/applications/{application_id}/evidences
POST /api/v1/ocop/applications/{application_id}/evidences
GET  /api/v1/ocop/evidences/{id}
PATCH /api/v1/ocop/evidences/{id}
```

Upload version:

```http
POST /api/v1/ocop/evidences/{evidence_id}/versions
```

Verify:

```http
POST /api/v1/ocop/evidences/{evidence_id}/verify
```

---

# 42. Evidence Version APIs

Upload response nên trả metadata:

```json
{
  "id": "...",
  "version_number": 2,
  "file_name": "certificate.pdf",
  "mime_type": "application/pdf",
  "file_size": 123456,
  "checksum": "...",
  "uploaded_at": "..."
}
```

Binary có thể upload qua signed/private object-storage flow.

Không public bucket minh chứng.

---

# 43. Evidence Link APIs

```http
GET  /api/v1/ocop/evidences/{evidence_id}/links
POST /api/v1/ocop/evidences/{evidence_id}/links
DELETE /api/v1/ocop/evidences/{evidence_id}/links/{indicator_id}
```

Một evidence có thể liên kết nhiều indicator.

---

# 44. Workflow APIs

```http
GET /api/v1/workflows/{id}
GET /api/v1/workflows/{id}/transitions
POST /api/v1/workflows/{id}/transitions
```

Đối với resource nghiệp vụ:

```http
POST /api/v1/{resource}/{id}/transitions
```

Body:

```json
{
  "to_state": "APPROVED",
  "reason": "..."
}
```

Backend kiểm tra:

```text
current_state
+
allowed transition
+
permission
+
data scope
+
business invariant
```

---

# 45. Workflow Versioning

Nếu workflow thay đổi do policy:

```text
workflow_version_1
workflow_version_2
```

Dữ liệu lịch sử phải biết workflow version đã áp dụng.

Không hard-code workflow bằng hàng loạt `if/else` theo năm.

---

# 46. Notification / Reminder APIs

```http
GET  /api/v1/notifications
POST /api/v1/notifications/{id}/read
GET  /api/v1/reminders
```

Reminder generation có thể chạy background job.

Không để reminder làm thay đổi transaction nghiệp vụ chính.

---

# 47. Audit APIs

```http
GET /api/v1/audit-events
GET /api/v1/audit-events/{id}
```

Chỉ role có permission:

```text
audit.read
```

được truy cập.

Audit append-only.

---

# 48. Report APIs

```http
GET  /api/v1/reports
POST /api/v1/reports
GET  /api/v1/reports/{id}
GET  /api/v1/reports/{id}/status
```

Report lớn nên chạy async:

```text
POST
  ↓
202 Accepted
  ↓
job
  ↓
completed
  ↓
download
```

---

# 49. PDF / DOCX Generation APIs

```http
POST /api/v1/documents/generate
GET  /api/v1/documents/{id}
GET  /api/v1/documents/{id}/download
```

Request:

```json
{
  "document_type": "OCOP_APPLICATION",
  "source_entity_type": "OCOP_APPLICATION",
  "source_entity_id": "...",
  "template_version": "..."
}
```

Generated document phải truy vết được:

```text
Source Data
+
Template Version
+
Source Data Version
+
Generation Time
+
Checksum
```

---

# 50. File Storage API

Không expose MinIO credentials cho browser.

Hai hướng:

### Option A — backend proxy

```text
client → backend → object storage
```

### Option B — signed URL

```text
client
  ↓
backend authorization
  ↓
short-lived signed URL
  ↓
object storage
```

Signed URL phải ngắn hạn và chỉ được tạo sau authorization.

---

# 51. Security Requirements

API phải:

- validate input server-side;
- chống IDOR;
- kiểm tra tenant scope;
- kiểm tra object ownership;
- giới hạn file size;
- allowlist MIME/type;
- checksum file;
- chống path traversal/object-key manipulation;
- rate limit authentication và sensitive endpoints;
- không log token/password;
- không trả secret;
- audit các command quan trọng.

Đặc biệt:

```text
GET /evidences/{id}
```

không được chỉ kiểm tra ID tồn tại.

Phải kiểm tra:

```text
User
 ↓
Permission
 ↓
Data Scope
 ↓
Application
 ↓
Evidence
```

---

# 52. Idempotency

Các command có khả năng retry nên hỗ trợ:

```http
Idempotency-Key: <unique-key>
```

Áp dụng ưu tiên cho:

```text
stock receipt
stock issue
cash transaction
settlement
surplus distribution
OCOP submission
evaluation consolidation
final decision
document generation
```

Cùng một idempotency key trong cùng operation scope không được tạo duplicate side effect.

---

# 53. Concurrency

Các API nhạy cảm phải xử lý concurrency:

```text
stock issue
stock count
financial closing
score lock
evaluation consolidation
final decision
```

Có thể dùng:

```text
DB transaction
row-level locking
optimistic concurrency
```

Tùy use case.

---

# 54. API Versioning

Current:

```text
/api/v1
```

Khi contract breaking change:

```text
/api/v2
```

Không đổi nghĩa endpoint `v1` âm thầm.

Configuration/policy change không tự động tạo API version mới nếu contract không thay đổi.

---

# 55. Transaction Boundary Summary

| Operation | Transaction |
|---|---|
| Member approval | Member + Audit |
| Stock receipt | Receipt + Lines + Inventory + Audit |
| Stock issue | Validation + Issue + Lines + Inventory + Debt + Audit |
| Self assessment | Assessment + Evidence links + Audit |
| Evaluation consolidation | Scores + Mandatory conditions + Result + Audit |
| Final decision | Decision + Workflow + Audit |

---

# 56. Error Code Baseline

```text
AUTH_REQUIRED
FORBIDDEN
RESOURCE_NOT_FOUND
VALIDATION_ERROR
DUPLICATE_RESOURCE
INVALID_STATE_TRANSITION
TENANT_SCOPE_VIOLATION
CRITERIA_VERSION_MISMATCH
INDICATOR_VERSION_MISMATCH
SCORE_OUT_OF_RANGE
EVIDENCE_NOT_VERIFIED
EVIDENCE_LOCKED
EVALUATION_LOCKED
INSUFFICIENT_STOCK
CONCURRENCY_CONFLICT
IDEMPOTENCY_CONFLICT
FILE_TYPE_NOT_ALLOWED
FILE_SIZE_EXCEEDED
DOCUMENT_GENERATION_FAILED
INTERNAL_ERROR
```

---

# 57. Traceability Matrix

| Domain | Database | Main API |
|---|---|---|
| Cooperative | cooperatives | `/cooperatives` |
| Member | members | `/members` |
| Capital | capital_contributions | `/members/{id}/capital-contributions` |
| ProductionUnit | production_units | `/production-units` |
| FarmPlot | farm_plots | `/farm-plots` |
| CropSeason | crop_seasons | `/crop-seasons` |
| FarmingLog | farming_logs | `/farming-logs` |
| MaterialUsage | material_usages | `/farming-logs/{id}/material-usages` |
| Harvest | harvests | `/harvests` |
| Lot | lots | `/lots` |
| Product | products | `/products` |
| Material | materials | `/materials` |
| StockReceipt | stock_receipts | `/stock-receipts` |
| StockIssue | stock_issues | `/stock-issues` |
| StockCount | stock_counts | `/stock-counts` |
| CashTransaction | cash_transactions | `/cash-transactions` |
| ReceivablePayable | receivable_payables | `/receivable-payables` |
| Settlement | settlements | `/settlements` |
| SurplusDistributionPlan | surplus_distribution_plans | `/surplus-distribution-plans` |
| CriteriaVersion | criteria_versions | `/ocop/criteria-versions` |
| CriteriaGroup | criteria_groups | `/ocop/criteria-versions/{id}/groups` |
| Criterion | criteria | `/ocop/criteria-groups/{id}/criteria` |
| Indicator | indicators | `/ocop/criteria/{id}/indicators` |
| ScoringRule | scoring_rules | `/ocop/scoring-rules` |
| MandatoryCondition | mandatory_conditions | `/ocop/mandatory-conditions` |
| OCOPApplication | ocop_applications | `/ocop/applications` |
| SelfAssessment | self_assessments | `/ocop/applications/{id}/self-assessments` |
| ApplicationReview | application_reviews | `/ocop/applications/{id}/reviews` |
| CouncilLevel | council_levels | `/ocop/council-levels` |
| EvaluationSession | evaluation_sessions | `/ocop/evaluation-sessions` |
| EvaluatorAssignment | evaluator_assignments | `/ocop/evaluation-sessions/{id}/assignments` |
| EvaluatorScore | evaluator_scores | `/ocop/evaluator-assignments/{id}/scores` |
| ConsolidatedResult | consolidated_results | `/ocop/evaluation-sessions/{id}/consolidated-result` |
| ProposedClassification | proposed_classifications | `/ocop/proposed-classifications` |
| FinalDecision | final_decisions | `/ocop/final-decisions` |
| Evidence | evidences | `/ocop/evidences` |
| EvidenceVersion | evidence_versions | `/ocop/evidences/{id}/versions` |
| EvidenceLink | evidence_links | `/ocop/evidences/{id}/links` |
| Workflow | workflow_instances / transitions | `/workflows` |
| AuditEvent | audit_events | `/audit-events` |
| ReportRequest | report_requests | `/reports` |
| GeneratedDocument | generated_documents | `/documents` |

---

# 58. API Contract Rules for OCOP

Các API OCOP phải bảo đảm chuỗi:

```text
Criteria Version
      ↓
Application
      ↓
Evaluation Session
      ↓
Council Level
      ↓
Evaluator Assignment
      ↓
Evaluator Score
      ↓
Consolidated Result
      ↓
Proposed Classification
      ↓
Final Decision
```

Không cho phép:

```text
Application dùng Criteria Version A
+
Score dùng Indicator của Version B
```

Không cho phép:

```text
Evaluation Session
→ thay council level tùy ý
```

sau khi session đã bắt đầu/chốt.

Không cho phép:

```text
Final Decision
```

được tạo thay cho:

```text
Proposed Classification
```

nếu workflow yêu cầu hai bước riêng biệt.

---

# 59. Policy Change Compatibility

Thiết kế API phải phân biệt:

### Thay đổi configuration

Ví dụ:

```text
PROVINCE
CENTRAL
```

thay đổi/bổ sung reference.

→ API `/evaluation-sessions` không cần đổi contract.

### Thay đổi criteria

→ tạo `criteria_version` mới.

### Thay đổi scoring rules

→ tạo rule/version mới.

### Thay đổi workflow

→ tạo workflow version mới.

### Thay đổi domain structure

→ migration + API change có kiểm soát.

Mục tiêu:

```text
Policy Change
      ↓
Configuration / Version
      ↓
Stable API Contract
```

khi contract nghiệp vụ không thực sự thay đổi.

---

# 60. Open Questions

| ID | Question | Priority |
|---|---|---|
| API-OQ-001 | API authentication dùng Laravel Sanctum, Passport, OAuth/OIDC hay provider khác? | High |
| API-OQ-002 | Có cần public API/integration với hệ thống ngoài không? | Medium |
| API-OQ-003 | PostGIS có bật trong MVP không? | High |
| API-OQ-004 | Inventory ledger chính thức sẽ là table nào? | Critical |
| API-OQ-005 | Một Harvest tạo một hay nhiều Lot? | High |
| API-OQ-006 | Criteria Version chính thức có cấu trúc indicator thế nào? | Critical |
| API-OQ-007 | Quy tắc làm tròn/tổng hợp điểm là gì? | Critical |
| API-OQ-008 | Council Level có cần tham chiếu trực tiếp tới policy version không? | Critical |
| API-OQ-009 | Workflow version model cuối cùng là gì? | High |
| API-OQ-010 | Có ký số tài liệu không? | High |
| API-OQ-011 | RPO/RTO mục tiêu là bao nhiêu? | High |
| API-OQ-012 | Có cần asynchronous job infrastructure riêng không? | Medium |

---

# 61. Definition of Done

`12_API_SPECIFICATION.md` đủ điều kiện chuyển sang System Architecture khi:

- [ ] Authentication strategy được xác định.
- [ ] Authorization/data scope được xác định.
- [ ] Common response/error được xác định.
- [ ] Pagination/filter/sort được xác định.
- [ ] P0 domain có API contract.
- [ ] OCOP application flow có API contract.
- [ ] Evaluation session có `council_level_id`.
- [ ] Council level không bị hard-code trong endpoint.
- [ ] Criteria version được bảo vệ khỏi destructive update.
- [ ] Evidence upload/version/verify có contract.
- [ ] Workflow transition có contract.
- [ ] Audit requirement được xác định.
- [ ] File storage security được xác định.
- [ ] Idempotency được xác định cho command quan trọng.
- [ ] Concurrency requirement được xác định.
- [ ] Traceability Domain → Database → API có.
- [ ] Open Questions được ghi nhận.
- [ ] Không có endpoint nào được thiết kế chỉ bằng cách đổi tên database table.

---

# 62. Next Documents

```text
01 → 10
    ↓
11_DATABASE_DESIGN_FINAL.md
    ↓
12_API_SPECIFICATION.md
    ↓
13_SYSTEM_ARCHITECTURE.md
    ↓
14_SECURITY_DESIGN.md
    ↓
15_UI_UX_SPECIFICATION.md
    ↓
OpenAPI / API Contract
    ↓
Implementation
```

`12_API_SPECIFICATION.md` là API baseline. Trước implementation production cần chuyển các endpoint quan trọng thành OpenAPI/Swagger contract chính thức và resolve các Open Questions có priority Critical.
