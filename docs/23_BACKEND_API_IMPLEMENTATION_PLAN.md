# 23_BACKEND_API_IMPLEMENTATION_PLAN.md

# Backend API Implementation Plan

## 1. Document Information

| Field | Value |
|---|---|
| Document ID | 23 |
| Document Name | Backend API Implementation Plan |
| Project | Xây dựng Hệ thống quản lý hoạt động Hợp tác xã nông nghiệp và số hóa hồ sơ đánh giá, phân hạng OCOP |
| Status | Baseline Implementation Plan |
| Backend | Laravel / PHP |
| Database | PostgreSQL |
| Architecture | Modular Monolith + REST API + Background Workers |
| Depends On | 08, 09, 10, 11, 12, 13, 15, 16, 17, 18, 19, 20, 21, 22 |
| Next Document | 24_BACKEND_MODULE_IMPLEMENTATION.md |

---

# 2. Mục tiêu

Document này chuyển API contract thành kế hoạch triển khai backend thực tế.

Mục tiêu:

```text
API Contract
    ↓
Route
    ↓
Controller
    ↓
Request Validation
    ↓
DTO
    ↓
Use Case
    ↓
Policy / Authorization
    ↓
Domain Rule
    ↓
Repository / Query
    ↓
Transaction
    ↓
Audit / Event
    ↓
Resource
    ↓
Test
```

Document này là **implementation plan**, không phải nơi định nghĩa lại business rule.

---

# 3. Implementation Principles

1. API phải bám OpenAPI.
2. Endpoint phải map về Use Case.
3. Không để Controller chứa business logic.
4. Không cho frontend quyết định workflow state.
5. Tenant scope phải được kiểm tra ở backend.
6. Sensitive action phải được audit.
7. OCOP policy phải version-aware.
8. Historical records không được sửa tùy tiện.
9. Database constraints vẫn là lớp bảo vệ cuối.
10. Mỗi feature phải có test và traceability.

---

# 4. Standard Request Pipeline

Mọi protected endpoint nên đi theo:

```text
HTTP Request
    ↓
Authentication
    ↓
Route Binding / Resource Lookup
    ↓
Form Request Validation
    ↓
Permission / Policy
    ↓
Tenant Scope
    ↓
DTO
    ↓
Use Case
    ↓
Domain Rules
    ↓
Transaction
    ↓
Persistence
    ↓
Audit / Event
    ↓
API Resource
```

Không phải endpoint nào cũng cần mọi bước, nhưng không được bỏ qua security boundary.

---

# 5. API Version

Baseline:

```text
/api/v1
```

Ví dụ:

```text
/api/v1/members
/api/v1/ocop/applications
/api/v1/ocop/evaluations
```

Breaking changes phải có versioning strategy.

---

# 6. Authentication Endpoints

## 6.1 Login

```http
POST /api/v1/auth/login
```

Mapping:

```text
LoginRequest
    ↓
AuthenticateUser
    ↓
TokenService
    ↓
AuthResource
```

Security:

- validate credentials;
- rate limit;
- audit authentication result;
- không log password/token.

---

## 6.2 Logout

```http
POST /api/v1/auth/logout
```

Use Case:

```text
LogoutUser
```

---

## 6.3 Current User

```http
GET /api/v1/auth/me
```

Read only.

---

# 7. Cooperative API

## 7.1 List

```http
GET /api/v1/cooperatives
```

Mapping:

```text
ListCooperatives
    ↓
CooperativeQuery
```

## 7.2 Detail

```http
GET /api/v1/cooperatives/{id}
```

## 7.3 Create

```http
POST /api/v1/cooperatives
```

Mapping:

```text
CreateCooperativeRequest
CreateCooperativeData
CreateCooperative
```

## 7.4 Update

```http
PUT/PATCH /api/v1/cooperatives/{id}
```

Use:

```text
UpdateCooperative
```

Không cho client tự thay đổi security-sensitive fields.

---

# 8. Member API

## 8.1 List Members

```http
GET /api/v1/members
```

Query:

```text
page
per_page
search
status
sort
```

## 8.2 Create Member

```http
POST /api/v1/members
```

Pipeline:

```text
CreateMemberRequest
 ↓
CreateMemberData
 ↓
CreateMember
 ↓
MemberRepository
 ↓
Audit
```

## 8.3 Update Member

```http
PATCH /api/v1/members/{id}
```

## 8.4 Activate / Deactivate

Không dùng:

```http
PATCH /members/{id}
{
  "status": "ACTIVE"
}
```

nếu status là business transition.

Ưu tiên:

```http
POST /api/v1/members/{id}/activate
POST /api/v1/members/{id}/deactivate
```

---

# 9. Production Unit API

Baseline:

```text
GET    /api/v1/production-units
POST   /api/v1/production-units
GET    /api/v1/production-units/{id}
PATCH  /api/v1/production-units/{id}
```

Nếu có lifecycle:

```text
POST /production-units/{id}/activate
POST /production-units/{id}/deactivate
```

Tenant scope bắt buộc.

---

# 10. Farm Plot / Planting Area API

```text
GET    /api/v1/farm-plots
POST   /api/v1/farm-plots
GET    /api/v1/farm-plots/{id}
PATCH  /api/v1/farm-plots/{id}
```

Các dữ liệu cần kiểm tra:

- production unit;
- cooperative;
- area;
- ownership/use relation;
- status;
- geometry/location nếu project scope có sử dụng.

Không tự thêm GIS requirement nếu chưa được xác định trong requirements.

---

# 11. Crop Season API

```text
GET  /api/v1/crop-seasons
POST /api/v1/crop-seasons
GET  /api/v1/crop-seasons/{id}
POST /api/v1/crop-seasons/{id}/close
```

Close là business action.

Không cho:

```text
PATCH status=CLOSED
```

nếu workflow yêu cầu validation.

---

# 12. Farming Log API

```text
GET  /api/v1/farming-logs
POST /api/v1/farming-logs
GET  /api/v1/farming-logs/{id}
PATCH /api/v1/farming-logs/{id}
```

Các log cần tham chiếu:

```text
farm plot
crop season
activity type
date
quantity
material
notes
```

Không tự suy diễn thêm trường nghiệp vụ ngoài Domain Model/DB Design.

---

# 13. Harvest API

```text
GET  /api/v1/harvests
POST /api/v1/harvests
GET  /api/v1/harvests/{id}
```

Nếu harvest tạo lot:

```text
RecordHarvest
    ↓
CreateLot
```

Transaction boundary phải được xác định nếu hai operation phải atomic.

---

# 14. Product API

```text
GET    /api/v1/products
POST   /api/v1/products
GET    /api/v1/products/{id}
PATCH  /api/v1/products/{id}
```

Product lifecycle nếu có:

```text
POST /products/{id}/activate
POST /products/{id}/deactivate
```

---

# 15. Material API

```text
GET    /api/v1/materials
POST   /api/v1/materials
GET    /api/v1/materials/{id}
PATCH  /api/v1/materials/{id}
```

Material master data không được nhầm với inventory transaction.

---

# 16. Warehouse API

```text
GET  /api/v1/warehouses
POST /api/v1/warehouses
GET  /api/v1/warehouses/{id}
PATCH /api/v1/warehouses/{id}
```

Tenant scope bắt buộc.

---

# 17. Inventory Receipt

```http
POST /api/v1/inventory/receipts
```

Mapping:

```text
CreateInventoryReceiptRequest
 ↓
CreateInventoryReceiptData
 ↓
ReceiveInventory
 ↓
Transaction
 ├── inventory transaction
 ├── stock update
 └── audit
```

Nếu posting phải atomic, dùng DB transaction.

---

# 18. Inventory Issue

```http
POST /api/v1/inventory/issues
```

Use Case:

```text
IssueInventory
```

Business validation:

```text
item exists
warehouse exists
tenant matches
quantity > 0
available stock sufficient
```

Không tin stock balance do client gửi.

---

# 19. Inventory Adjustment

```http
POST /api/v1/inventory/adjustments
```

Adjustment là sensitive action.

Yêu cầu:

- permission;
- reason;
- audit;
- transaction;
- concurrency protection.

---

# 20. Inventory Count

```http
POST /api/v1/inventory/counts
```

Nếu quy trình có approval:

```text
CreateCount
RecordCount
ApproveCount
ApplyAdjustment
```

Không gộp mọi bước thành một endpoint nếu workflow yêu cầu tách biệt.

---

# 21. Finance API

## 21.1 Transactions

```text
GET  /api/v1/finance/transactions
POST /api/v1/finance/transactions
GET  /api/v1/finance/transactions/{id}
```

Use Case:

```text
RecordFinanceTransaction
```

---

# 22. Receivables / Payables

Nếu có trong approved scope:

```text
GET  /api/v1/finance/receivables
POST /api/v1/finance/receivables

GET  /api/v1/finance/payables
POST /api/v1/finance/payables
```

Không tự mở rộng thành hệ thống kế toán đầy đủ nếu requirement chưa yêu cầu.

---

# 23. Finance Finalization

Sensitive business action:

```http
POST /api/v1/finance/transactions/{id}/finalize
```

Pipeline:

```text
FinalizeFinanceTransaction
 ↓
Permission
 ↓
SoD
 ↓
Validation
 ↓
Transaction
 ↓
Audit
```

---

# 24. Surplus / Profit Distribution

Nếu module được approved:

```text
GET  /api/v1/finance/distribution-plans
POST /api/v1/finance/distribution-plans
GET  /api/v1/finance/distribution-plans/{id}
POST /api/v1/finance/distribution-plans/{id}/submit
POST /api/v1/finance/distribution-plans/{id}/approve
```

Không hard-code công thức phân phối nếu chưa có business rule chính thức.

---

# 25. OCOP Criteria Version API

Criteria là policy-driven.

```text
GET /api/v1/ocop/criteria-versions
GET /api/v1/ocop/criteria-versions/{id}
```

Nếu administration cho phép:

```text
POST /api/v1/ocop/criteria-versions
POST /api/v1/ocop/criteria-versions/{id}/activate
POST /api/v1/ocop/criteria-versions/{id}/retire
```

Historical version phải immutable sau khi được sử dụng.

---

# 26. OCOP Application API

## Create

```http
POST /api/v1/ocop/applications
```

Use Case:

```text
CreateOcopApplication
```

## Detail

```http
GET /api/v1/ocop/applications/{id}
```

## Update Draft

```http
PATCH /api/v1/ocop/applications/{id}
```

Chỉ cho phép khi state phù hợp.

---

# 27. OCOP Application Submission

```http
POST /api/v1/ocop/applications/{id}/submit
```

Use Case:

```text
SubmitOcopApplication
```

Validation:

```text
application exists
tenant matches
actor authorized
state allows submission
required data complete
required evidence present if applicable
```

---

# 28. OCOP Application Return

```http
POST /api/v1/ocop/applications/{id}/return
```

Request:

```json
{
  "reason": "..."
}
```

Use Case:

```text
ReturnOcopApplication
```

Reason bắt buộc nếu business rule yêu cầu.

---

# 29. OCOP Resubmission

```http
POST /api/v1/ocop/applications/{id}/resubmit
```

Use Case:

```text
ResubmitOcopApplication
```

Phải kiểm tra application đang ở trạng thái cho phép resubmit.

---

# 30. OCOP Approval / Rejection

```text
POST /api/v1/ocop/applications/{id}/approve
POST /api/v1/ocop/applications/{id}/reject
```

Không expose generic:

```text
PATCH status
```

cho các transition nhạy cảm.

---

# 31. Evaluation Session

```text
GET  /api/v1/ocop/evaluation-sessions
POST /api/v1/ocop/evaluation-sessions
GET  /api/v1/ocop/evaluation-sessions/{id}
```

Session phải có:

```text
application
criteria version
council level
workflow version
```

Baseline council levels:

```text
PROVINCE
CENTRAL
```

Các level phải được lấy từ configuration/reference phù hợp, không rải literal khắp code.

---

# 32. Evaluation Assignment

```text
POST /api/v1/ocop/evaluation-sessions/{id}/assignments
GET  /api/v1/ocop/evaluation-sessions/{id}/assignments
```

Authorization phải kiểm tra evaluator scope.

---

# 33. Record Evaluation Score

```http
POST /api/v1/ocop/evaluation-sessions/{id}/scores
```

Request tối thiểu:

```text
indicator_id
score
comment
```

Use Case:

```text
RecordEvaluationScore
```

Không tính tổng điểm từ frontend.

---

# 34. Update Evaluation Score

Nếu policy cho phép sửa trước lock:

```http
PATCH /api/v1/ocop/evaluation-sessions/{id}/scores/{scoreId}
```

Nếu score đã locked:

```text
409 OCOP_SCORE_LOCKED
```

Nếu correction process được yêu cầu, phải đi qua correction workflow.

---

# 35. Evaluation Consolidation

```http
POST /api/v1/ocop/evaluation-sessions/{id}/consolidate
```

Use Case:

```text
ConsolidateEvaluation
```

Transaction:

```text
validate
 ↓
calculate
 ↓
store result
 ↓
lock required scores
 ↓
audit
```

Không để frontend gửi total score để lưu.

---

# 36. Evaluation Decision

Nếu approved workflow yêu cầu:

```text
POST /api/v1/ocop/evaluation-sessions/{id}/approve
POST /api/v1/ocop/evaluation-sessions/{id}/reject
```

SoD phải được áp dụng nếu được quy định.

---

# 37. Province → Central Transition

Khi policy/workflow quy định application đủ điều kiện chuyển cấp:

```text
POST /api/v1/ocop/evaluation-sessions/{id}/forward
```

Use Case:

```text
ForwardEvaluationToCentral
```

Không tự động chuyển chỉ vì frontend gửi:

```text
council_level=CENTRAL
```

Server phải xác định eligibility từ policy/workflow.

---

# 38. Evidence API

## Upload

```http
POST /api/v1/ocop/applications/{id}/evidence
```

Flow:

```text
Authorize
 ↓
Validate file
 ↓
Generate object key
 ↓
Store object
 ↓
Calculate checksum
 ↓
Create evidence metadata
 ↓
Audit
```

---

# 39. Evidence Version

Nếu evidence thay đổi:

```text
POST /api/v1/evidence/{id}/versions
```

Không overwrite historical evidence nếu nó đã được sử dụng trong evaluation.

---

# 40. Evidence Verification

```http
POST /api/v1/evidence/{id}/verify
POST /api/v1/evidence/{id}/reject
```

Phải lưu:

```text
actor
timestamp
result
reason
```

nếu workflow yêu cầu.

---

# 41. Evidence Download

Không expose storage credentials.

```http
GET /api/v1/evidence/{id}/download
```

Backend:

```text
authorize
 ↓
check tenant
 ↓
check evidence
 ↓
generate short-lived URL
```

---

# 42. Workflow API

Workflow chủ yếu được điều khiển bằng business actions.

Không khuyến nghị endpoint public:

```http
PATCH /workflow-state
```

Baseline action endpoints:

```text
submit
return
resubmit
approve
reject
consolidate
forward
```

---

# 43. Audit API

Audit thường read-only.

```http
GET /api/v1/audit-logs
GET /api/v1/audit-logs/{id}
```

Không cung cấp:

```http
DELETE /audit-logs/{id}
```

cho user thông thường.

---

# 44. Reporting API

Report endpoint có thể là:

```text
GET /api/v1/reports/members
GET /api/v1/reports/production
GET /api/v1/reports/inventory
GET /api/v1/reports/finance
GET /api/v1/reports/ocop
```

Query service phải read-only.

---

# 45. Export API

Export lớn nên chạy async.

```http
POST /api/v1/reports/{report}/exports
```

Response:

```http
202 Accepted
```

Job:

```text
GenerateReportExport
```

Sau đó:

```http
GET /api/v1/exports/{id}
```

---

# 46. Document Generation

OCOP dossier/PDF/DOCX:

```text
POST /api/v1/ocop/applications/{id}/documents
```

Nếu nặng:

```text
202 Accepted
```

Job:

```text
GenerateOcopDossier
```

Template phải có version.

---

# 47. Standard Controller Skeleton

Conceptual structure:

```php
final class SubmitOcopApplicationController
{
    public function __invoke(
        SubmitOcopApplicationRequest $request,
        SubmitOcopApplication $useCase
    ): OcopApplicationResource {
        $data = SubmitOcopApplicationData::fromRequest($request);

        $application = $useCase->execute(
            $request->user(),
            $data
        );

        return new OcopApplicationResource($application);
    }
}
```

Controller không tự thực hiện transition.

---

# 48. Standard Use Case Skeleton

Conceptual:

```php
final class SubmitOcopApplication
{
    public function execute(
        User $actor,
        SubmitOcopApplicationData $data
    ): OcopApplication {
        // authorization/context validation
        // domain validation
        // transaction
        // persistence
        // audit/event

        return $application;
    }
}
```

Implementation cụ thể phải tuân Document 21–22.

---

# 49. Standard Query Skeleton

```text
Controller
    ↓
Request
    ↓
Query DTO
    ↓
Query Service
    ↓
Read Model / DTO
    ↓
Resource
```

Không gọi domain mutation từ Query Service.

---

# 50. API Filtering

Common parameters:

```text
page
per_page
search
status
from
to
sort
direction
```

Chỉ expose filter đã được định nghĩa.

---

# 51. Pagination Contract

Baseline:

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

Maximum `per_page` phải được giới hạn server-side.

---

# 52. Idempotency

Áp dụng cho operation có nguy cơ duplicate:

```text
inventory posting
finance posting
document generation
external integration
```

Không nhất thiết mọi GET cần idempotency key.

---

# 53. Concurrency Protection

Các operation cần protection:

```text
inventory issue
inventory adjustment
finance finalize
evaluation score lock
evaluation consolidation
approval
```

Có thể sử dụng:

```text
transaction
row lock
unique constraint
optimistic lock
idempotency
```

theo từng nghiệp vụ.

---

# 54. Transaction Matrix

| Operation | Transaction |
|---|---|
| Create simple master data | Optional |
| Inventory receipt | Required |
| Inventory issue | Required |
| Inventory adjustment | Required |
| Finance posting | Required |
| Finance finalization | Required |
| OCOP submission | Required if state + audit/workflow atomic |
| Evaluation score | Required if score + audit atomic |
| Evaluation consolidation | Required |
| Approval | Required |
| Evidence upload | DB metadata transaction + storage consistency strategy |
| Report read | No |
| Audit read | No |

---

# 55. Storage Consistency

File storage và DB không có cùng transaction boundary.

Recommended flow:

```text
Validate
 ↓
Upload object
 ↓
Persist metadata
 ↓
If DB fails
    ↓
cleanup object / retry strategy
```

Nếu cần robust hơn:

```text
Pending
 ↓
Uploaded
 ↓
Verified
```

---

# 56. Authorization Matrix Integration

Mỗi endpoint phải map:

```text
HTTP Method
Path
Permission
Policy
Tenant Scope
SoD
Audit
```

Ví dụ:

```text
POST /ocop/applications/{id}/submit
    ↓
ocop.application.submit
    ↓
ApplicationPolicy
    ↓
cooperative scope
    ↓
workflow validation
    ↓
audit
```

---

# 57. Traceability Integration

Mỗi endpoint phải truy được:

```text
API
 ↓
FR
 ↓
UC
 ↓
BR
 ↓
Permission
 ↓
DB
 ↓
Test
```

Ví dụ:

```text
API-OCOP-APP-SUBMIT
FR-OCOP-...
UC-OCOP-...
BRULE-OCOP-...
PERM-...
DB-...
TC-...
```

ID thực tế phải đối chiếu Document 19.

---

# 58. Error Mapping Matrix

| Error | HTTP |
|---|---:|
| Unauthorized | 401 |
| Forbidden | 403 |
| Not found | 404 |
| Invalid transition | 409 |
| Locked record | 409 |
| Duplicate business key | 409 |
| Insufficient stock | 409 |
| Validation failure | 422 |
| Rate limit | 429 |

---

# 59. API Implementation Order

## Phase A — Foundation

```text
Authentication
User
Role
Permission
Tenant Context
Exception Handler
API Response
Audit Foundation
```

## Phase B — Cooperative

```text
Cooperative
Member
```

## Phase C — Agriculture

```text
Production Unit
Farm Plot
Crop
Season
Farming Log
Harvest
Lot
```

## Phase D — Product

```text
Product
Product traceability foundation
```

## Phase E — Inventory

```text
Material
Warehouse
Receipt
Issue
Adjustment
Count
```

## Phase F — Finance

```text
Finance Transaction
Receivable
Payable
Finalization
Distribution
```

## Phase G — OCOP

```text
Criteria Version
Application
Evidence
Evaluation Session
Assignment
Score
Consolidation
Decision
Forwarding
```

## Phase H — Workflow / Reporting

```text
Workflow
Audit
Reports
Export
Documents
```

---

# 60. Foundation Implementation

Create first:

```text
app/
  Modules/
  Shared/
```

Foundation components:

```text
Auth
TenantContext
Permission
Exception
ApiResponse
Audit
Logging
```

Test foundation before business modules.

---

# 61. Module Implementation Template

Every module should contain:

```text
Domain/
Application/
Infrastructure/
Presentation/
Tests/
```

Minimum implementation sequence:

```text
Domain
 ↓
Migration
 ↓
Model
 ↓
Repository
 ↓
Use Case
 ↓
Request
 ↓
Policy
 ↓
Controller
 ↓
Resource
 ↓
Route
 ↓
Test
```

---

# 62. Master Data First

Master data must be implemented before transaction modules.

Recommended:

```text
Cooperative
Member
Production Unit
Farm Plot
Crop
Season
Material
Warehouse
Product
```

Then:

```text
production/inventory/finance/OCOP transactions
```

---

# 63. OCOP Implementation Dependency

OCOP application depends on:

```text
Cooperative
Product
Production data
Criteria Version
Evidence
Workflow
```

Therefore do not implement OCOP as an isolated CRUD module.

---

# 64. Evaluation Dependency

Evaluation depends on:

```text
Application
Criteria Version
Indicator
Evidence
Evaluator Assignment
Workflow
Council Level
```

Score storage must preserve historical context.

---

# 65. Historical Integrity

Once evaluation has been consolidated/locked:

```text
criteria version = immutable reference
score = protected
evidence version = protected
workflow version = preserved
council level = preserved
result = preserved
```

Changes must occur through correction/versioning mechanisms if approved.

---

# 66. Policy Change Handling

If policy changes:

```text
NEW CRITERIA VERSION
NEW WORKFLOW VERSION
NEW TEMPLATE VERSION
```

Do not rewrite old evaluation records.

Existing application:

```text
application
    ↓
uses version X
```

New application:

```text
application
    ↓
uses version Y
```

---

# 67. API Contract Change Process

Before changing endpoint:

```text
Check OpenAPI
 ↓
Check Use Case
 ↓
Check Frontend dependency
 ↓
Check Traceability
 ↓
Assess breaking change
 ↓
Update tests
 ↓
Implement
```

---

# 68. Migration Dependency

API implementation must not create tables ad hoc.

Required:

```text
Document 11
 ↓
Document 18
 ↓
Document 20
 ↓
Migration
```

If DB gap is found:

```text
GAP
 ↓
update design
 ↓
migration
```

Không tự thêm field chỉ để code chạy.

---

# 69. Test Matrix Per Endpoint

Mỗi critical endpoint:

```text
Happy path
Validation
Unauthenticated
Unauthorized
Wrong tenant
Not found
Invalid state
Business rule violation
Concurrency where applicable
Audit
```

---

# 70. Example Endpoint Test

For:

```text
POST /api/v1/ocop/applications/{id}/submit
```

Tests:

```text
it_submits_valid_application()
it_rejects_invalid_application()
it_rejects_unauthenticated_user()
it_rejects_user_without_permission()
it_rejects_cross_tenant_access()
it_rejects_invalid_workflow_transition()
it_creates_audit_record()
it_preserves_application_version_context()
```

---

# 71. Performance Test Targets

Performance targets must be defined empirically.

Do not invent unrealistic SLA values.

Measure:

```text
p50
p95
p99
query count
DB time
queue time
file generation time
```

for important endpoints.

---

# 72. Observability

Every request should have:

```text
request_id / correlation_id
user_id where available
cooperative_id where available
route
status
duration
```

Sensitive data must be excluded.

---

# 73. Background Job Monitoring

Track:

```text
job id
job type
started_at
finished_at
status
attempts
error code
correlation id
```

Especially for:

```text
PDF
DOCX
reports
large exports
```

---

# 74. Deployment Gate

Before deployment:

```text
composer install --no-dev where appropriate
migrate --force
config/cache validation
route validation
OpenAPI validation
test suite
security checks
queue health
database connectivity
object storage connectivity
```

Exact CI/CD commands depend on deployment environment.

---

# 75. API Implementation Checklist

For each endpoint:

- [ ] Endpoint exists in OpenAPI.
- [ ] FR/UC mapping exists.
- [ ] Permission exists.
- [ ] Policy exists.
- [ ] Request exists.
- [ ] DTO exists where needed.
- [ ] Use Case exists.
- [ ] Domain rules implemented.
- [ ] Repository/query exists.
- [ ] Transaction reviewed.
- [ ] Audit reviewed.
- [ ] Resource exists.
- [ ] Route exists.
- [ ] Tests exist.
- [ ] Traceability updated.

---

# 76. AI Coding Agent Execution Contract

AI agent must not start by generating all controllers.

Instead:

```text
1. Read context.
2. Select one module.
3. Select one use case.
4. Confirm dependencies.
5. Implement domain/application.
6. Implement persistence.
7. Implement API.
8. Implement tests.
9. Run checks.
10. Update traceability.
11. Report files changed.
```

---

# 77. AI Agent Output Format

After implementation, agent should report:

```text
Feature:
Requirement:
Use Case:
Permission:
API:
DB:
Files Created:
Files Modified:
Tests:
Migration:
Security Checks:
Traceability:
Known Gaps:
```

---

# 78. Do Not Implement Unknown Requirements

If agent encounters:

```text
TO_VERIFY
```

it must not silently turn it into mandatory functionality.

If a decision is needed:

```text
Decision Required
```

If source conflicts:

```text
CONFLICT
```

---

# 79. Backend Milestone Gates

## Gate 1

```text
Foundation + Auth + Tenant
```

## Gate 2

```text
Cooperative + Members
```

## Gate 3

```text
Agriculture
```

## Gate 4

```text
Inventory + Finance
```

## Gate 5

```text
OCOP + Evidence
```

## Gate 6

```text
Evaluation + Workflow
```

## Gate 7

```text
Reports + Documents + Audit
```

## Gate 8

```text
Security + Testing + Deployment
```

---

# 80. Final Implementation Contract

Backend implementation must remain consistent with:

```text
01 Project Overview
02 Project Context
03 Business Processes
04 OCOP Business
05 Actors & Roles
06 Business Rules
07 Business Requirements
08 Functional Requirements
09 Use Cases
10 Domain Model
11 Database Design
12 API Specification
13 System Architecture
14 Security Design
15 Authorization Matrix
16 Workflow Specification
17 OpenAPI Specification
18 Database Implementation
19 Traceability Matrix
20 Database Migrations
21 Backend Project Structure
22 Backend Coding Standards
23 Backend API Implementation Plan
```

The backend is considered structurally ready for module-by-module coding after this document, subject to resolving documented `TO_VERIFY`, `GAP`, and `CONFLICT` items.

---

# 81. Next Document

```text
24_BACKEND_MODULE_IMPLEMENTATION.md
```

Document 24 sẽ đặc tả cách triển khai từng module theo thứ tự:

```text
Foundation
 ↓
Identity
 ↓
Cooperative
 ↓
Agriculture
 ↓
Product
 ↓
Inventory
 ↓
Finance
 ↓
OCOP
 ↓
Evidence
 ↓
Workflow
 ↓
Reporting
 ↓
Document
 ↓
Audit
```

Mỗi module sẽ có:

```text
Responsibilities
Dependencies
Entities
Use Cases
Commands
Queries
Repositories
Policies
Routes
Requests
Resources
Events
Jobs
Migrations
Tests
Definition of Done
```
