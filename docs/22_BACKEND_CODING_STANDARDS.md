# 22_BACKEND_CODING_STANDARDS.md

# Backend Coding Standards & Engineering Conventions

## 1. Document Information

| Field | Value |
|---|---|
| Document ID | 22 |
| Document Name | Backend Coding Standards & Engineering Conventions |
| Project | Xây dựng Hệ thống quản lý hoạt động Hợp tác xã nông nghiệp và số hóa hồ sơ đánh giá, phân hạng OCOP |
| Status | Baseline |
| Backend | Laravel / PHP |
| Database | PostgreSQL |
| Architecture | Modular Monolith + REST API + Background Workers |
| Depends On | 13, 14, 15, 16, 17, 18, 19, 20, 21 |
| Next Document | 23_BACKEND_API_IMPLEMENTATION_PLAN.md |

---

# 2. Mục tiêu

Tài liệu này chuẩn hóa cách viết backend để:

1. Code nhất quán giữa các module.
2. Giảm business logic trong Controller.
3. Bảo vệ Domain khỏi framework coupling không cần thiết.
4. Bảo đảm Authorization và Tenant Scope.
5. Chuẩn hóa transaction và workflow action.
6. Chuẩn hóa API response/error.
7. Dễ test và maintain.
8. Hỗ trợ AI coding agent tạo code nhất quán.
9. Giảm technical debt.
10. Bảo đảm implementation bám Traceability Matrix.

---

# 3. Source of Truth

Khi implementation có mâu thuẫn:

```text
Official / Verified Source
        ↓
Approved Business Requirement
        ↓
Business Rule
        ↓
Functional Requirement
        ↓
Use Case
        ↓
Workflow
        ↓
Architecture
        ↓
API
        ↓
Database
        ↓
Code
```

Code không được tự động trở thành source of truth cho nghiệp vụ.

Nếu phát hiện conflict:

```text
CONFLICT
```

Nếu thiếu căn cứ:

```text
TO_VERIFY
```

---

# 4. General Principles

Áp dụng:

- KISS;
- DRY nhưng không over-abstraction;
- SOLID;
- separation of concerns;
- explicit business actions;
- least privilege;
- fail closed;
- secure by default;
- immutable historical records;
- testable code.

Không áp dụng pattern chỉ vì “kiến trúc đẹp”.

---

# 5. PHP Version

Project phải sử dụng một PHP version được Laravel version hiện tại hỗ trợ.

Version cụ thể phải được khóa trong:

```text
composer.json
```

và CI.

Không để mỗi developer dùng một PHP version khác nhau.

---

# 6. Laravel Version

Laravel version phải được khóa trong:

```text
composer.json
```

Không tự nâng major version trong một feature branch nếu chưa có migration/compatibility plan.

---

# 7. Formatting

Sử dụng một formatter/linter thống nhất.

Khuyến nghị:

```text
Laravel Pint
```

CI phải kiểm tra formatting.

Không commit code chưa qua formatter.

---

# 8. Naming Convention

## Class

```text
PascalCase
```

Ví dụ:

```text
CreateMember
SubmitOcopApplication
EvaluationSession
```

## Method

```text
camelCase
```

Ví dụ:

```text
submitApplication()
calculateTotal()
```

## Variable

```text
camelCase
```

Ví dụ:

```text
$applicationId
$cooperativeId
```

## Database

```text
snake_case
```

Ví dụ:

```text
cooperative_id
created_at
evaluation_session_id
```

---

# 9. Boolean Naming

Boolean phải thể hiện trạng thái rõ:

```text
isActive
isLocked
isVerified
hasEvidence
canSubmit
```

Không dùng tên mơ hồ:

```text
activeFlag
checkStatus
```

---

# 10. Enum Naming

Enum class:

```text
PascalCase
```

Case/value phải rõ nghĩa.

Ví dụ:

```text
ApplicationStatus
EvaluationStatus
EvidenceStatus
TransactionType
```

Policy-driven values không được hard-code thành enum nếu cần cấu hình/version.

---

# 11. Class Responsibility

Một class nên có một responsibility chính.

Không tạo:

```text
OcopService
```

chứa:

- create application;
- upload evidence;
- score;
- report;
- generate PDF;
- approval;
- notification.

Thay vào đó:

```text
CreateOcopApplication
SubmitOcopApplication
RecordEvaluationScore
ConsolidateEvaluation
GenerateOcopDossier
```

---

# 12. Controller Standard

Controller chỉ thực hiện:

```text
Request
 ↓
Authorization
 ↓
DTO
 ↓
Use Case
 ↓
Resource/Response
```

Không chứa:

- business calculation;
- workflow transition;
- transaction orchestration;
- complex DB query;
- direct object storage logic.

---

# 13. Controller Method Naming

Dùng động từ phù hợp HTTP/business action:

```text
index
show
store
update
destroy
submit
returnApplication
resubmit
approve
reject
```

Không dùng:

```text
doEverything()
process()
handleAll()
```

nếu không rõ business action.

---

# 14. Request Validation

Form Request xử lý input validation.

Ví dụ:

```text
CreateMemberRequest
UpdateMemberRequest
CreateApplicationRequest
SubmitApplicationRequest
RecordEvaluationScoreRequest
UploadEvidenceRequest
```

Validation phải:

- rõ;
- deterministic;
- không truy cập service phức tạp nếu không cần;
- không thay thế business rule.

---

# 15. Validation Levels

## Layer 1 — Syntax

Ví dụ:

```text
email format
date format
UUID format
file size
MIME type
```

## Layer 2 — Application

Ví dụ:

```text
resource exists
user has permission
tenant matches
```

## Layer 3 — Domain

Ví dụ:

```text
score cannot be modified after lock
invalid workflow transition
```

## Layer 4 — Database

Ví dụ:

```text
PK
FK
UNIQUE
NOT NULL
CHECK
```

---

# 16. DTO Standard

DTO là immutable data carrier nếu framework/style cho phép.

Ví dụ:

```text
CreateMemberData
CreateFarmPlotData
RecordFinanceTransactionData
RecordEvaluationScoreData
```

DTO không:

- query database;
- return HTTP response;
- save model.

---

# 17. DTO Mapping

Flow:

```text
HTTP Request
    ↓
Form Request
    ↓
DTO
    ↓
Use Case
```

Không truyền toàn bộ `$request` vào domain/application.

Sai:

```php
$service->execute($request);
```

Ưu tiên:

```php
$data = CreateMemberData::fromRequest($request);
$useCase->execute($data);
```

---

# 18. Use Case Naming

Tên Use Case phải thể hiện business action.

Đúng:

```text
CreateMember
SubmitOcopApplication
ReturnOcopApplication
ApproveOcopApplication
RecordEvaluationScore
ConsolidateEvaluation
```

Không ưu tiên:

```text
ApplicationManager
DataProcessor
SystemService
```

---

# 19. Use Case Structure

Một Use Case thường:

```text
authorize
 ↓
load
 ↓
validate
 ↓
execute
 ↓
persist
 ↓
audit/event
 ↓
return
```

Không nhất thiết mọi use case có chính xác cùng số bước.

---

# 20. Transaction Boundary

Transaction phải nằm quanh business operation cần atomicity.

Ví dụ:

```text
SubmitApplication
BEGIN
    validate state
    update application
    create workflow transition
    create audit
COMMIT
```

Không đặt transaction toàn request nếu không cần.

---

# 21. Transaction Rule

Không:

```text
Controller::transaction(...)
```

Ưu tiên:

```text
Use Case
    ↓
Transaction Manager
    ↓
Repositories
```

---

# 22. Repository Naming

Interface:

```text
MemberRepository
ApplicationRepository
EvaluationRepository
EvidenceRepository
```

Implementation:

```text
EloquentMemberRepository
EloquentApplicationRepository
```

Không dùng:

```text
MemberRepositoryImpl
```

nếu project đã có convention rõ hơn.

---

# 23. Repository Responsibility

Repository chịu trách nhiệm persistence.

Repository không quyết định:

- permission;
- workflow;
- approval;
- SoD;
- policy.

Ví dụ:

```text
ApplicationRepository
```

được phép:

```text
findById()
save()
```

nhưng không nên:

```text
approveApplication()
```

nếu approval là business Use Case.

---

# 24. Query Service

Read-heavy use case có thể dùng Query Service.

Ví dụ:

```text
MemberListQuery
InventoryBalanceQuery
FinancialSummaryQuery
OcopDashboardQuery
```

Query Service:

- read only;
- optimized;
- có DTO/read model;
- không thay đổi business state.

---

# 25. Eloquent Model

Eloquent Model là persistence representation.

Nên chứa:

- casts;
- relationships;
- persistence-specific scopes;
- simple accessors/mutators nếu phù hợp.

Không nên chứa toàn bộ business workflow.

---

# 26. Eloquent Relationships

Relationships phải được định nghĩa rõ.

Ví dụ:

```text
Cooperative
 ├── members
 ├── productionUnits
 ├── products
 └── applications
```

Không tạo relationship chỉ để “cho đủ”.

---

# 27. N+1 Prevention

API list phải tránh N+1 query.

Sử dụng phù hợp:

```text
with()
withCount()
withSum()
```

hoặc Query Service.

Không eager-load toàn bộ graph một cách máy móc.

---

# 28. Database Query Rule

Không query bằng raw SQL nếu Query Builder/Eloquent đáp ứng được.

Raw SQL chỉ dùng khi:

- performance cần thiết;
- PostgreSQL feature cần thiết;
- query phức tạp;
- đã được review.

Raw SQL phải parameterized.

---

# 29. Mass Assignment

Không mở:

```php
protected $guarded = [];
```

một cách tùy tiện.

Dữ liệu input phải có allow-list rõ ràng.

---

# 30. API Resource

Resource kiểm soát dữ liệu trả ra.

Không trả:

```text
password
tokens
secret keys
private object storage credentials
internal security metadata
```

Nếu resource chứa nested relation, phải kiểm soát payload size.

---

# 31. API Response Format

Khuyến nghị success:

```json
{
  "data": {},
  "meta": {}
}
```

List:

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

Format chính thức phải đồng nhất với OpenAPI.

---

# 32. Error Response

Khuyến nghị:

```json
{
  "error": {
    "code": "WORKFLOW_INVALID_TRANSITION",
    "message": "Action is not allowed from current state.",
    "details": {},
    "trace_id": "..."
  }
}
```

Không trả stack trace production.

---

# 33. Error Code Naming

Format:

```text
MODULE_RESOURCE_REASON
```

Ví dụ:

```text
OCOP_APPLICATION_NOT_FOUND
OCOP_INVALID_TRANSITION
OCOP_SCORE_LOCKED
INVENTORY_INSUFFICIENT_STOCK
FINANCE_TRANSACTION_INVALID
EVIDENCE_ACCESS_DENIED
```

Error code phải ổn định để frontend xử lý.

---

# 34. HTTP Status

Baseline:

| Situation | Status |
|---|---:|
| Success read | 200 |
| Created | 201 |
| Accepted async job | 202 |
| No content | 204 |
| Validation | 422 |
| Unauthenticated | 401 |
| Forbidden | 403 |
| Not found | 404 |
| Conflict | 409 |
| Too many requests | 429 |
| Server error | 500 |

Không dùng 200 cho mọi lỗi.

---

# 35. Authorization

Authorization phải được thực hiện ở backend.

Flow:

```text
Authentication
 ↓
Permission
 ↓
Tenant Scope
 ↓
Resource Scope
 ↓
SoD
 ↓
Business Rule
```

Frontend chỉ hỗ trợ UX, không phải security boundary.

---

# 36. Policy Naming

Ví dụ:

```text
ApplicationPolicy
MemberPolicy
EvidencePolicy
EvaluationPolicy
FinancePolicy
InventoryPolicy
```

Policy kiểm tra access.

Business operation vẫn nằm Use Case.

---

# 37. Permission Naming

Canonical pattern:

```text
<resource>.<action>
```

Ví dụ:

```text
member.read
member.create
member.update

inventory.read
inventory.receive
inventory.issue

finance.read
finance.create
finance.finalize

ocop.application.read
ocop.application.create
ocop.application.submit
ocop.application.return
ocop.application.approve

ocop.evaluation.read
ocop.evaluation.score
ocop.evaluation.consolidate

evidence.read
evidence.upload
evidence.verify
```

Phải đối chiếu Document 15.

---

# 38. Tenant Scope

Mọi query tenant-scoped phải xác định:

```text
cooperative_id
```

Không tin `cooperative_id` từ client.

Ví dụ:

```text
CurrentUserContext
      ↓
Allowed Cooperatives
      ↓
Resource Query
```

---

# 39. Tenant Scope Implementation

Có thể dùng:

- explicit scope;
- repository scope;
- policy;
- query builder helper.

Không áp dụng global scope nếu làm mất khả năng xử lý admin/system operation một cách an toàn.

---

# 40. Workflow

Không cập nhật:

```text
status
```

tùy tiện.

Dùng:

```text
submit()
return()
resubmit()
approve()
reject()
```

hoặc Use Case tương ứng.

Workflow phải kiểm tra:

```text
current state
workflow version
actor
permission
transition
business rule
```

---

# 41. State Machine Rule

Không tạo transition tùy ý từ frontend.

Ví dụ:

```text
SUBMITTED
    ↓
IN_REVIEW
```

không được:

```text
SUBMITTED
    ↓
APPROVED
```

nếu workflow không cho phép.

---

# 42. OCOP Policy

Không hard-code:

```text
score threshold
number of criteria
number of stars
council behavior
```

nếu các giá trị đó thuộc policy có thể thay đổi.

Ưu tiên:

```text
Criteria Version
Workflow Version
Policy Configuration
```

---

# 43. Council Level

Baseline reference:

```text
PROVINCE
CENTRAL
```

Không rải:

```php
if ($level === 'PROVINCE') ...
```

khắp codebase.

Tập trung behavior vào:

```text
CouncilLevel configuration
Workflow
Policy
```

---

# 44. Score Calculation

Điểm phải có source-of-truth:

```text
Evaluation Score
 ↓
Indicator
 ↓
Criteria Version
 ↓
Application
```

Không tính total score từ frontend.

---

# 45. Score Lock

Sau khi score/result được khóa:

```text
READ = allowed
UPDATE = denied
DELETE = denied
```

Nếu cần correction:

```text
Correction Workflow
```

Không sửa trực tiếp database.

---

# 46. Money

Không dùng:

```text
float
double
```

cho tiền.

Ưu tiên:

```text
decimal / numeric
```

và Value Object:

```text
Money
```

nếu domain cần.

---

# 47. Date & Time

Lưu timestamp ở database bằng timezone-aware type:

```text
TIMESTAMPTZ
```

Application phải thống nhất timezone strategy.

Không tự ý convert timestamp thành local string trước khi persistence.

---

# 48. UUID

Nếu project dùng UUID:

```text
UUID
```

phải thống nhất:

- generation;
- storage;
- serialization;
- route binding;
- validation.

Không trộn UUID và integer PK tùy tiện trong cùng bounded context.

---

# 49. File Handling

Không lưu file business trực tiếp vào:

```text
public/
```

File flow:

```text
Request
 ↓
Authorization
 ↓
Validation
 ↓
Object Storage
 ↓
Metadata DB
```

---

# 50. File Name Security

Không dùng tên file client làm object key trực tiếp.

Ưu tiên:

```text
generated object key
```

Ví dụ:

```text
evidence/{cooperative_id}/{application_id}/{uuid}
```

---

# 51. File Download

Không public file private.

Flow:

```text
Authorize
 ↓
Verify evidence
 ↓
Generate short-lived URL
```

Không trả MinIO secret cho frontend.

---

# 52. Upload Validation

Tối thiểu:

- authentication;
- permission;
- tenant scope;
- size;
- MIME/type;
- extension;
- storage capacity;
- checksum nếu cần.

Nếu triển khai malware scanning, phải tích hợp như một security step độc lập.

---

# 53. Jobs

Job class phải:

```text
small
focused
retryable
observable
```

Ví dụ:

```text
GenerateOcopPdf
GenerateOcopDocx
GenerateReport
```

Không tạo:

```text
ProcessEverythingJob
```

---

# 54. Job Retry

Job phải xử lý retry.

Các lỗi permanent không nên retry vô hạn.

Cần phân biệt:

```text
Transient Error
Permanent Error
```

---

# 55. Idempotency

Các operation có thể retry phải tránh duplicate.

Ví dụ:

```text
document generation
financial posting
inventory posting
```

Nếu API cần idempotency key:

```text
Idempotency-Key
```

phải được document trong OpenAPI.

---

# 56. Events

Event dùng để thông báo fact đã xảy ra.

Ví dụ:

```text
ApplicationSubmitted
EvidenceUploaded
EvaluationConsolidated
```

Không dùng event để thay thế business transaction nếu cần atomicity.

---

# 57. Notifications

Nếu bổ sung notification:

```text
NotificationService
```

phải là supporting service.

Không làm notification trở thành dependency bắt buộc của core transaction nếu không cần.

---

# 58. Audit

Audit phải được tạo từ trusted backend.

Các action quan trọng:

```text
submit
return
resubmit
approve
reject
score
consolidate
verify evidence
finance finalize
inventory adjustment
```

Audit không được do client gửi.

---

# 59. Logging vs Audit

### Logging

Phục vụ vận hành/debug.

### Audit

Phục vụ truy xuất nghiệp vụ/security.

Không dùng application log làm thay thế audit log.

---

# 60. Sensitive Logging

Không log:

```text
password
access token
refresh token
MinIO secret
database password
```

Không log toàn bộ request body nếu có nguy cơ chứa dữ liệu nhạy cảm.

---

# 61. Exception Handling

Exception phải được map thành stable API error.

Ví dụ:

```text
ScoreLockedException
    ↓
OCOP_SCORE_LOCKED
    ↓
409
```

Không để exception framework lộ ra client.

---

# 62. Service Container

Dependency injection nên dùng constructor injection.

Ví dụ:

```php
public function __construct(
    ApplicationRepository $applications,
    AuditService $audit
) {}
```

Tránh service locator/global dependency.

---

# 63. Configuration

Không hard-code:

```text
URLs
credentials
bucket names
queue names
policy thresholds
```

nếu là environment/configuration.

Dùng:

```text
config/
.env
secret manager
```

tùy environment.

---

# 64. Environment Safety

Không commit:

```text
.env
.env.production
private keys
database dumps
real member data
real OCOP dossier
```

---

# 65. API Security

Mọi endpoint protected phải:

- authenticate;
- authorize;
- validate;
- scope;
- audit nếu sensitive.

Rate limiting áp dụng cho:

```text
login
OTP nếu có
upload
expensive reports
document generation
```

theo nhu cầu thực tế.

---

# 66. Pagination

List endpoint phải có giới hạn.

Ví dụ:

```text
page
per_page
```

Server phải giới hạn `per_page` tối đa.

Không cho:

```text
per_page=1000000
```

---

# 67. Sorting

Chỉ cho sort theo field whitelist.

Ví dụ:

```text
sort=created_at
```

Không nhận raw SQL:

```text
sort=some_sql_expression
```

---

# 68. Filtering

Filter phải được validate.

Không nối trực tiếp input vào SQL.

---

# 69. Search

Search phải:

- parameterized;
- bounded;
- có index nếu cần;
- tránh full table scan không kiểm soát.

---

# 70. API Compatibility

Không breaking API trong patch/minor change nếu project versioning yêu cầu compatibility.

Breaking:

```text
rename field
remove endpoint
change semantic
change required field
```

phải có version/transition plan.

---

# 71. OpenAPI Synchronization

Mỗi endpoint mới phải cập nhật:

```text
OpenAPI
API Specification
Traceability
Tests
```

Không để implementation đi trước contract một cách không kiểm soát.

---

# 72. Database Migration Rule

Không sửa migration đã chạy production.

Tạo migration mới:

```text
add_xxx_to_yyy
```

Không rewrite history.

---

# 73. Seed Rule

Reference seed phải có key ổn định.

Không seed dữ liệu business thật.

Development seed phải tách production seed.

---

# 74. Test Naming

Test name phải mô tả behavior.

Ví dụ:

```text
it_rejects_application_approval_from_submitted_state()
it_allows_assigned_evaluator_to_record_score()
it_prevents_cross_cooperative_member_access()
it_prevents_modification_of_locked_score()
```

---

# 75. Unit Test Coverage

Ưu tiên test:

- domain rules;
- calculators;
- workflow;
- authorization;
- critical services.

Không chạy theo % coverage một cách máy móc.

---

# 76. Feature Test Coverage

Các API quan trọng phải có:

```text
success
validation failure
unauthorized
forbidden
not found
conflict
business rule violation
```

---

# 77. Integration Test Coverage

Test các boundary:

```text
PostgreSQL
Redis
MinIO
Queue
Document generation
```

khi có liên quan.

---

# 78. Test Data

Không dùng dữ liệu thật.

Factory/fixture phải tạo dữ liệu tối thiểu cần thiết.

Ví dụ:

```text
CooperativeFactory
MemberFactory
ProductFactory
ApplicationFactory
EvaluationSessionFactory
EvidenceFactory
```

---

# 79. Test Isolation

Mỗi test phải độc lập.

Không phụ thuộc thứ tự test.

Database refresh/transaction strategy phải được thống nhất.

---

# 80. Static Analysis

Có thể sử dụng:

```text
PHPStan / Larastan
```

Level phải được project thống nhất.

Không thêm baseline ignore vô thời hạn.

---

# 81. Code Review

PR phải kiểm tra:

- business requirement;
- architecture;
- security;
- authorization;
- tenant scope;
- database;
- API;
- tests;
- audit;
- traceability.

---

# 82. Pull Request Structure

PR nên có:

```text
Summary
Business Requirement
Implementation
Database Changes
API Changes
Security Impact
Test Results
Migration
Traceability
```

---

# 83. Commit Convention

Khuyến nghị:

```text
feat:
fix:
refactor:
test:
docs:
chore:
perf:
security:
```

Ví dụ:

```text
feat(ocop): implement application submission
fix(inventory): prevent invalid stock issue
test(evaluation): add locked score tests
```

---

# 84. Branch Naming

Ví dụ:

```text
feature/ocop-application
feature/inventory-receipt
fix/evaluation-score-lock
refactor/auth-policy
```

Không commit trực tiếp feature vào production branch.

---

# 85. Definition of Ready

Trước khi code một feature:

- [ ] BR identified.
- [ ] FR identified.
- [ ] UC identified.
- [ ] Business rules known.
- [ ] Workflow impact known.
- [ ] Permission known.
- [ ] API contract known.
- [ ] DB impact known.
- [ ] Test cases known.
- [ ] TO_VERIFY items resolved or explicitly accepted.

---

# 86. Definition of Done

Feature chỉ Done khi:

- [ ] Code implemented.
- [ ] Validation implemented.
- [ ] Authorization implemented.
- [ ] Tenant scope checked.
- [ ] Business rule implemented.
- [ ] Transaction defined if needed.
- [ ] Audit implemented if required.
- [ ] API documented.
- [ ] Tests pass.
- [ ] Migration created if schema changes.
- [ ] Traceability updated.
- [ ] No critical security issue.

---

# 87. AI Coding Agent — Mandatory Rules

AI agent phải:

1. Đọc Documents 13–22 trước implementation lớn.
2. Tìm requirement trước khi viết feature.
3. Tìm Use Case trước khi viết controller.
4. Tìm permission trước khi bảo vệ endpoint.
5. Tìm database design trước khi tạo migration.
6. Không hard-code OCOP policy chưa được xác minh.
7. Không bypass workflow.
8. Không bypass tenant scope.
9. Không bypass audit.
10. Không sửa migration đã chạy production.
11. Không tự thêm module.
12. Không tự đổi API contract.
13. Không tự xóa historical data.
14. Không dùng frontend làm security boundary.
15. Khi thiếu thông tin: `TO_VERIFY`.
16. Khi mâu thuẫn: `CONFLICT`.
17. Sau thay đổi phải cập nhật traceability.

---

# 88. AI Agent Implementation Loop

```text
READ CONTEXT
    ↓
IDENTIFY REQUIREMENT
    ↓
IDENTIFY USE CASE
    ↓
IDENTIFY RULES
    ↓
IDENTIFY PERMISSION
    ↓
IDENTIFY API
    ↓
IDENTIFY DB
    ↓
IMPLEMENT
    ↓
TEST
    ↓
SECURITY CHECK
    ↓
TRACEABILITY CHECK
    ↓
REPORT CHANGES
```

---

# 89. Forbidden Patterns

Không sử dụng tùy tiện:

```text
God Controller
God Service
God Repository
Global mutable state
Raw SQL concatenation
Mass assignment without allow-list
Client-controlled status
Client-controlled cooperative scope
Public evidence storage
Hard-coded OCOP policy
Hard-coded secrets
Silent historical mutation
```

---

# 90. Recommended Patterns

```text
Use Case
DTO
Repository Contract
Query Service
Policy
Domain Rule
Value Object
Workflow Service
Audit Service
Object Storage Adapter
Background Job
API Resource
```

Chỉ dùng khi thực sự cần.

---

# 91. Performance Rules

Trước khi tối ưu:

```text
Measure
 ↓
Identify bottleneck
 ↓
Optimize
 ↓
Benchmark
```

Không thêm cache/index/queue chỉ vì “có vẻ nhanh”.

---

# 92. Cache

Cache chỉ dùng cho dữ liệu phù hợp.

Không cache tùy tiện:

```text
permission decision
financial balance
evaluation score
workflow state
```

nếu invalidation chưa được thiết kế chính xác.

---

# 93. Concurrency

Các nghiệp vụ nhạy cảm phải xem xét:

```text
race condition
lost update
duplicate posting
double approval
double job
```

Có thể sử dụng:

```text
DB transaction
row lock
unique constraint
optimistic locking
idempotency
```

---

# 94. Security Review Checklist

Trước merge:

- [ ] Authentication.
- [ ] Authorization.
- [ ] Tenant isolation.
- [ ] Input validation.
- [ ] SQL injection protection.
- [ ] File upload security.
- [ ] Secret handling.
- [ ] Audit.
- [ ] Rate limiting where needed.
- [ ] Error leakage.
- [ ] Historical data protection.

---

# 95. Architecture Boundary Checklist

Code review phải kiểm tra:

```text
Domain → không phụ thuộc HTTP
Domain → không phụ thuộc Eloquent nếu kiến trúc yêu cầu isolation
Controller → không chứa business logic
Repository → không chứa authorization
Report → read-only
Audit → không mutable tùy ý
OCOP → không hard-code policy
```

---

# 96. Final Backend Coding Contract

Mọi backend feature phải đi theo:

```text
Requirement
 ↓
Use Case
 ↓
Permission
 ↓
Validation
 ↓
Domain Rule
 ↓
Transaction
 ↓
Persistence
 ↓
Audit/Event
 ↓
API Response
 ↓
Test
 ↓
Traceability
```

Không được bắt đầu bằng:

```text
"tạo một controller trước rồi tính tiếp"
```

---

# 97. Next Document

Sau Document 22:

```text
23_BACKEND_API_IMPLEMENTATION_PLAN.md
```

Document 23 sẽ chuyển OpenAPI/API Specification thành kế hoạch implementation cụ thể:

```text
Endpoint
 ↓
Controller
 ↓
Request
 ↓
DTO
 ↓
Use Case
 ↓
Policy
 ↓
Repository/Query
 ↓
Transaction
 ↓
Audit
 ↓
Response
 ↓
Test
```

Sau đó mới xây dựng skeleton backend và triển khai từng module theo thứ tự ưu tiên.
