# 17_OPENAPI_SPECIFICATION.md

# 1. Document Information

| Field | Value |
|---|---|
| Document ID | 17 |
| Document Name | OpenAPI Specification |
| Project | Xây dựng Hệ thống quản lý hoạt động Hợp tác xã nông nghiệp và số hóa hồ sơ đánh giá, phân hạng OCOP |
| Depends On | 07_BUSINESS_REQUIREMENTS.md, 08_FUNCTIONAL_REQUIREMENTS.md, 09_USE_CASES_FINAL.md, 13_SYSTEM_ARCHITECTURE.md, 14_SECURITY_DESIGN.md, 15_AUTHORIZATION_MATRIX.md, 16_WORKFLOW_SPECIFICATION.md |
| Status | API BASELINE – PENDING IMPLEMENTATION |
| API Style | RESTful HTTP + JSON |
| Authentication | Token-based authentication |
| Authorization | RBAC + Permission + Data Scope + SoD + Workflow |
| Versioning | `/api/v1` |
| Content Types | `application/json`, `multipart/form-data` where file upload is required |

> Đây là API contract baseline. Tên endpoint, field và permission phải được đồng bộ với database/implementation trước khi code production.

---

# 2. Purpose

Tài liệu này chuyển các yêu cầu nghiệp vụ và workflow thành hợp đồng API giữa:

```text
Web Frontend
     ↕
REST API
     ↕
Application Services
     ↕
PostgreSQL / Object Storage
```

API phải bảo đảm:

```text
Authentication
    ↓
Authorization
    ↓
Data Scope
    ↓
Workflow Validation
    ↓
Business Validation
    ↓
Persistence
    ↓
Audit
```

Không được thiết kế API cho phép client thay đổi workflow state bằng cách gửi trực tiếp trường `status`.

---

# 3. API Conventions

## 3.1 Base URL

Development:

```text
/api/v1
```

Production domain cụ thể được cấu hình bằng environment variable.

---

## 3.2 HTTP Methods

| Method | Purpose |
|---|---|
| GET | Read |
| POST | Create / Execute business action |
| PUT | Full replacement where explicitly supported |
| PATCH | Partial update of editable resources |
| DELETE | Delete only where business rules permit |

Workflow actions dùng endpoint riêng:

```text
POST /applications/{id}/submit
POST /applications/{id}/return
POST /applications/{id}/resubmit
```

Không dùng:

```text
PATCH /applications/{id}
{
  "status": "APPROVED"
}
```

---

# 4. Standard Response Envelope

## 4.1 Success

```json
{
  "data": {},
  "meta": {}
}
```

`meta` có thể bỏ qua khi không cần.

---

## 4.2 Validation Error

```json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Request validation failed.",
    "details": [
      {
        "field": "name",
        "code": "REQUIRED",
        "message": "Name is required."
      }
    ]
  }
}
```

---

## 4.3 Business Error

```json
{
  "error": {
    "code": "WORKFLOW_INVALID_TRANSITION",
    "message": "The requested action is not allowed in the current state.",
    "details": []
  }
}
```

---

# 5. HTTP Status Codes

| HTTP | Usage |
|---|---|
| 200 | Successful read/update/action |
| 201 | Resource created |
| 204 | Successful operation with no response body |
| 400 | Invalid request |
| 401 | Authentication required/invalid |
| 403 | Permission/scope/SoD denied |
| 404 | Resource not found or not visible |
| 409 | Conflict/state/concurrency/idempotency |
| 422 | Semantic/business validation error |
| 429 | Rate limit |
| 500 | Unexpected server error |

The API must avoid leaking existence of resources outside the caller's scope.

---

# 6. Authentication

## 6.1 Login

```http
POST /api/v1/auth/login
```

Request:

```json
{
  "email": "user@example.com",
  "password": "********"
}
```

Response:

```json
{
  "data": {
    "access_token": "token",
    "token_type": "Bearer",
    "expires_in": 3600,
    "user": {}
  }
}
```

---

## 6.2 Current User

```http
GET /api/v1/auth/me
```

Response contains:

```text
user
roles
permissions
scope summary
```

Do not expose secrets.

---

## 6.3 Logout

```http
POST /api/v1/auth/logout
```

---

# 7. User Management

## 7.1 List Users

```http
GET /api/v1/users
```

Permission:

```text
USER.READ
```

Scope applies.

---

## 7.2 Create User

```http
POST /api/v1/users
```

Permission:

```text
USER.CREATE
```

---

## 7.3 Get User

```http
GET /api/v1/users/{id}
```

Permission:

```text
USER.READ
```

---

## 7.4 Update User

```http
PATCH /api/v1/users/{id}
```

Permission:

```text
USER.UPDATE
```

---

# 8. Roles and Permissions

## 8.1 Roles

```http
GET /api/v1/roles
```

## 8.2 Permissions

```http
GET /api/v1/permissions
```

## 8.3 User Role Assignment

```http
POST /api/v1/users/{id}/roles
DELETE /api/v1/users/{id}/roles/{roleId}
```

All role administration requires privileged authorization.

---

# 9. Cooperative / HTX

## 9.1 List Cooperatives

```http
GET /api/v1/cooperatives
```

## 9.2 Get Cooperative

```http
GET /api/v1/cooperatives/{id}
```

## 9.3 Create Cooperative

```http
POST /api/v1/cooperatives
```

## 9.4 Update Cooperative

```http
PATCH /api/v1/cooperatives/{id}
```

Data scope must prevent unauthorized cross-HTX access.

---

# 10. Members

## 10.1 List Members

```http
GET /api/v1/members
```

Filters:

```text
cooperative_id
status
keyword
page
per_page
```

Permission:

```text
MEMBER.READ
```

---

## 10.2 Create Member

```http
POST /api/v1/members
```

Permission:

```text
MEMBER.CREATE
```

---

## 10.3 Get Member

```http
GET /api/v1/members/{id}
```

---

## 10.4 Update Member

```http
PATCH /api/v1/members/{id}
```

---

## 10.5 Member Status

Status-changing operations should use explicit actions where required:

```http
POST /api/v1/members/{id}/activate
POST /api/v1/members/{id}/suspend
POST /api/v1/members/{id}/terminate
```

Exact lifecycle is subject to the finalized member business rules.

---

# 11. Member Capital Contributions

## 11.1 List Contributions

```http
GET /api/v1/members/{memberId}/capital-contributions
```

## 11.2 Create Contribution

```http
POST /api/v1/members/{memberId}/capital-contributions
```

Permission:

```text
CAPITAL_CONTRIBUTION.CREATE
```

## 11.3 Contribution Detail

```http
GET /api/v1/capital-contributions/{id}
```

Financial records require appropriate data scope.

---

# 12. Planting Areas

## 12.1 List

```http
GET /api/v1/planting-areas
```

Filters:

```text
cooperative_id
member_id
crop_id
status
keyword
```

## 12.2 Create

```http
POST /api/v1/planting-areas
```

## 12.3 Detail

```http
GET /api/v1/planting-areas/{id}
```

## 12.4 Update

```http
PATCH /api/v1/planting-areas/{id}
```

## 12.5 Status Actions

```http
POST /api/v1/planting-areas/{id}/activate
POST /api/v1/planting-areas/{id}/deactivate
```

---

# 13. Planting Area Evidence / Documents

If supporting documents are modeled separately:

```http
GET /api/v1/planting-areas/{id}/documents
POST /api/v1/planting-areas/{id}/documents
DELETE /api/v1/planting-area-documents/{id}
```

Deletion must respect evidence retention and audit rules.

---

# 14. Seasons

## 14.1 List

```http
GET /api/v1/seasons
```

## 14.2 Create

```http
POST /api/v1/seasons
```

## 14.3 Update

```http
PATCH /api/v1/seasons/{id}
```

## 14.4 Close

```http
POST /api/v1/seasons/{id}/close
```

---

# 15. Crops / Base Catalogs

Base catalog endpoints:

```http
GET /api/v1/crops
POST /api/v1/crops
PATCH /api/v1/crops/{id}
```

Similar endpoints may be implemented for other catalogs defined in the database design.

Catalog mutation requires the corresponding administrative permission.

---

# 16. Materials / Supplies

## 16.1 Material Catalog

```http
GET /api/v1/materials
POST /api/v1/materials
PATCH /api/v1/materials/{id}
```

## 16.2 Warehouses

```http
GET /api/v1/warehouses
POST /api/v1/warehouses
PATCH /api/v1/warehouses/{id}
```

---

# 17. Inventory Transactions

Prefer business commands instead of arbitrary quantity updates.

```http
POST /api/v1/inventory/receipts
POST /api/v1/inventory/issues
POST /api/v1/inventory/adjustments
```

Read:

```http
GET /api/v1/inventory/transactions
GET /api/v1/inventory/stock
```

The backend must calculate/validate stock according to transaction rules.

Client must not directly set:

```text
current_stock
```

through a generic update API.

---

# 18. Operational Journal

## 18.1 List Entries

```http
GET /api/v1/operation-journal
```

## 18.2 Create Entry

```http
POST /api/v1/operation-journal
```

## 18.3 Detail

```http
GET /api/v1/operation-journal/{id}
```

## 18.4 Update

```http
PATCH /api/v1/operation-journal/{id}
```

Editing depends on the journal's lifecycle state.

---

# 19. Finance

## 19.1 Income

```http
GET /api/v1/finance/incomes
POST /api/v1/finance/incomes
```

## 19.2 Expense

```http
GET /api/v1/finance/expenses
POST /api/v1/finance/expenses
```

## 19.3 Financial Transaction Detail

```http
GET /api/v1/finance/transactions/{id}
```

Financial mutation requires appropriate permission and cooperative scope.

---

# 20. Profit / Surplus Distribution

If modeled as a workflow:

```http
GET /api/v1/profit-distributions
POST /api/v1/profit-distributions
GET /api/v1/profit-distributions/{id}
PATCH /api/v1/profit-distributions/{id}
POST /api/v1/profit-distributions/{id}/submit
POST /api/v1/profit-distributions/{id}/approve
POST /api/v1/profit-distributions/{id}/reject
```

Approval must enforce SoD.

Exact legal/business formula is not defined by this API document; it must be implemented from the approved business rules.

---

# 21. OCOP Criteria

## 21.1 Criteria Versions

```http
GET /api/v1/ocop/criteria-versions
POST /api/v1/ocop/criteria-versions
GET /api/v1/ocop/criteria-versions/{id}
PATCH /api/v1/ocop/criteria-versions/{id}
```

## 21.2 Criteria

```http
GET /api/v1/ocop/criteria-versions/{versionId}/criteria
POST /api/v1/ocop/criteria-versions/{versionId}/criteria
PATCH /api/v1/ocop/criteria/{id}
```

Criteria version must be immutable once used by historical evaluation, except through explicitly defined versioning mechanisms.

---

# 22. OCOP Applications

## 22.1 List Applications

```http
GET /api/v1/ocop/applications
```

Filters:

```text
cooperative_id
status
criteria_version_id
keyword
page
per_page
```

Authorization:

```text
OCOP_APPLICATION.READ
```

Data scope is mandatory.

---

## 22.2 Create Application

```http
POST /api/v1/ocop/applications
```

Permission:

```text
OCOP_APPLICATION.CREATE
```

---

## 22.3 Get Application

```http
GET /api/v1/ocop/applications/{id}
```

---

## 22.4 Update Application

```http
PATCH /api/v1/ocop/applications/{id}
```

Only allowed in editable states.

Backend must reject updates when application is locked by workflow.

---

# 23. OCOP Application Workflow APIs

## 23.1 Mark Ready

```http
POST /api/v1/ocop/applications/{id}/ready-for-submission
```

## 23.2 Submit

```http
POST /api/v1/ocop/applications/{id}/submit
```

## 23.3 Start Review

```http
POST /api/v1/ocop/applications/{id}/start-review
```

## 23.4 Return for Revision

```http
POST /api/v1/ocop/applications/{id}/return
```

Request:

```json
{
  "reason": "Bổ sung minh chứng cho tiêu chí..."
}
```

## 23.5 Resubmit

```http
POST /api/v1/ocop/applications/{id}/resubmit
```

## 23.6 Accept for Evaluation

```http
POST /api/v1/ocop/applications/{id}/ready-for-evaluation
```

## 23.7 Start Evaluation

```http
POST /api/v1/ocop/applications/{id}/start-evaluation
```

## 23.8 Move to Decision

```http
POST /api/v1/ocop/applications/{id}/pending-decision
```

---

# 24. Application History

```http
GET /api/v1/ocop/applications/{id}/history
```

Response should expose workflow history that the caller is authorized to see.

---

# 25. Application Completeness

```http
GET /api/v1/ocop/applications/{id}/completeness
```

Possible response:

```json
{
  "data": {
    "is_complete": false,
    "blocking_errors": [],
    "warnings": [],
    "sections": []
  }
}
```

Completeness must use configured business rules and criteria version.

---

# 26. OCOP Evidence

## 26.1 List Evidence

```http
GET /api/v1/ocop/applications/{applicationId}/evidence
```

## 26.2 Upload

```http
POST /api/v1/ocop/applications/{applicationId}/evidence
Content-Type: multipart/form-data
```

Fields:

```text
criterion_id
description
file
```

Backend validates:

```text
application scope
permission
file type
file size
malware/security policy
criterion relation
workflow state
```

---

# 27. Evidence Detail

```http
GET /api/v1/ocop/evidence/{id}
```

---

# 28. Evidence Versions

```http
GET /api/v1/ocop/evidence/{id}/versions
POST /api/v1/ocop/evidence/{id}/versions
```

A new version must not destroy the old version.

---

# 29. Evidence Review

```http
POST /api/v1/ocop/evidence/{id}/verify
POST /api/v1/ocop/evidence/{id}/reject
```

Reject request:

```json
{
  "reason": "Minh chứng chưa đủ thông tin xác thực."
}
```

---

# 30. Evidence Download

Do not expose object-storage paths directly.

Prefer:

```http
GET /api/v1/ocop/evidence/{id}/download
```

Backend:

```text
authorize
→ scope check
→ generate short-lived signed URL
→ return/download file
```

Signed URL must not be written into audit logs.

---

# 31. Evaluation Sessions

## 31.1 List

```http
GET /api/v1/ocop/evaluation-sessions
```

## 31.2 Create

```http
POST /api/v1/ocop/evaluation-sessions
```

## 31.3 Detail

```http
GET /api/v1/ocop/evaluation-sessions/{id}
```

## 31.4 Update

```http
PATCH /api/v1/ocop/evaluation-sessions/{id}
```

Only allowed while editable.

---

# 32. Council Level

The evaluation session model must support:

```text
council_level = PROVINCE
council_level = CENTRAL
```

The API must expose this value when creating/reading an evaluation session.

Example:

```json
{
  "council_level": "PROVINCE"
}
```

The values are part of the current project baseline and must remain synchronized with the database enum/reference model.

---

# 33. Evaluation Session Workflow

```http
POST /api/v1/ocop/evaluation-sessions/{id}/open
POST /api/v1/ocop/evaluation-sessions/{id}/start-assignment
POST /api/v1/ocop/evaluation-sessions/{id}/complete-assignment
POST /api/v1/ocop/evaluation-sessions/{id}/complete-scoring
POST /api/v1/ocop/evaluation-sessions/{id}/start-consolidation
POST /api/v1/ocop/evaluation-sessions/{id}/consolidate
POST /api/v1/ocop/evaluation-sessions/{id}/close
```

Every action is authorization- and state-dependent.

---

# 34. Evaluator Assignments

## 34.1 List

```http
GET /api/v1/ocop/evaluation-sessions/{sessionId}/assignments
```

## 34.2 Assign

```http
POST /api/v1/ocop/evaluation-sessions/{sessionId}/assignments
```

Request:

```json
{
  "evaluator_id": "uuid",
  "application_id": "uuid"
}
```

## 34.3 Accept

```http
POST /api/v1/ocop/evaluation-assignments/{id}/accept
```

## 34.4 Decline

```http
POST /api/v1/ocop/evaluation-assignments/{id}/decline
```

Only if reassignment/decline is enabled by final business rules.

## 34.5 Complete

```http
POST /api/v1/ocop/evaluation-assignments/{id}/complete
```

---

# 35. Evaluator Scores

## 35.1 List Scores

```http
GET /api/v1/ocop/evaluation-assignments/{assignmentId}/scores
```

## 35.2 Save Draft Score

```http
POST /api/v1/ocop/evaluation-assignments/{assignmentId}/scores
```

## 35.3 Update Draft Score

```http
PATCH /api/v1/ocop/evaluation-scores/{id}
```

Only while score is editable.

## 35.4 Submit Score

```http
POST /api/v1/ocop/evaluation-scores/{id}/submit
```

## 35.5 Lock Score

```http
POST /api/v1/ocop/evaluation-scores/{id}/lock
```

After lock:

```text
normal PATCH = forbidden
```

---

# 36. Score Validation

API validates:

```text
assignment ownership
session state
criteria version
criterion membership
score range
required fields
duplicate score
lock state
```

The score range must come from the active criteria configuration.

---

# 37. Consolidation

```http
POST /api/v1/ocop/evaluation-sessions/{id}/consolidate
```

Server performs:

```text
authorization
→ scope
→ state validation
→ completeness
→ score validation
→ criteria version validation
→ consolidation
→ audit
```

Result:

```json
{
  "data": {
    "evaluation_session_id": "uuid",
    "result_id": "uuid",
    "status": "CONSOLIDATED"
  }
}
```

---

# 38. Evaluation Result

```http
GET /api/v1/ocop/evaluation-results/{id}
GET /api/v1/ocop/evaluation-sessions/{id}/result
```

Result must reference:

```text
application
criteria_version
evaluation_session
score breakdown
```

---

# 39. Decision

## 39.1 Get Decision

```http
GET /api/v1/ocop/applications/{applicationId}/decision
```

## 39.2 Approve

```http
POST /api/v1/ocop/applications/{applicationId}/approve
```

Request:

```json
{
  "decision_date": "2026-09-01",
  "note": "..."
}
```

## 39.3 Reject

```http
POST /api/v1/ocop/applications/{applicationId}/reject
```

Request:

```json
{
  "reason": "..."
}
```

Approval/rejection must enforce:

```text
authorized decision actor
correct state
valid result
SoD
scope
```

---

# 40. Workflow Generic Endpoint Prohibition

Do not expose:

```http
PATCH /applications/{id}
{
  "status": "APPROVED"
}
```

Do not expose an endpoint allowing arbitrary:

```text
from_state
to_state
```

from the client.

Workflow transitions must be server-defined.

---

# 41. Reports

## 41.1 Dashboard Summary

```http
GET /api/v1/reports/dashboard
```

## 41.2 Member Report

```http
GET /api/v1/reports/members
```

## 41.3 Planting Area Report

```http
GET /api/v1/reports/planting-areas
```

## 41.4 Inventory Report

```http
GET /api/v1/reports/inventory
```

## 41.5 Finance Report

```http
GET /api/v1/reports/finance
```

## 41.6 OCOP Progress

```http
GET /api/v1/reports/ocop-progress
```

---

# 42. Export

Supported business export operations:

```http
POST /api/v1/exports/ocop/application-pdf
POST /api/v1/exports/ocop/application-docx
POST /api/v1/exports/reports
```

Export must use the same authorization/data scope as the underlying resource.

Do not allow a user to export data they cannot read.

---

# 43. Audit Logs

## 43.1 Query Audit Logs

```http
GET /api/v1/audit-logs
```

Highly restricted.

Filters:

```text
actor_id
entity_type
entity_id
action
from
to
```

Audit access itself should be audited.

---

# 44. Notifications

```http
GET /api/v1/notifications
POST /api/v1/notifications/{id}/read
POST /api/v1/notifications/read-all
```

Notifications must not become an authorization mechanism.

They are informational; permission remains enforced by the target API.

---

# 45. Tasks

```http
GET /api/v1/tasks
GET /api/v1/tasks/{id}
POST /api/v1/tasks/{id}/complete
```

Task visibility follows assignment/scope.

---

# 46. Pagination

List APIs should support:

```text
page
per_page
```

Example:

```http
GET /api/v1/ocop/applications?page=1&per_page=20
```

Response:

```json
{
  "data": [],
  "meta": {
    "page": 1,
    "per_page": 20,
    "total": 100,
    "last_page": 5
  }
}
```

---

# 47. Filtering

Filters must be allowlisted.

Do not directly translate arbitrary client query parameters into SQL.

Example:

```text
status
cooperative_id
criteria_version_id
created_from
created_to
```

---

# 48. Sorting

Allow only known fields:

```text
created_at
updated_at
name
status
```

Reject unknown sort columns.

---

# 49. Search

Use controlled search:

```http
GET /api/v1/members?keyword=...
```

Backend must parameterize all queries.

---

# 50. File Upload Security

File APIs must enforce:

```text
authenticated actor
permission
data scope
application state
allowed MIME types
maximum size
extension/content consistency
malware scanning where deployed
object-storage isolation
checksum
audit
```

Never trust filename extension alone.

---

# 51. Object Storage

Recommended logical model:

```text
database
  stores metadata

object storage
  stores binary file
```

The database should reference:

```text
object_key
checksum
mime_type
size
version
```

Do not expose internal object-storage credentials to frontend.

---

# 52. Idempotency

Use idempotency for commands that may be retried:

```text
submit
approve
reject
upload/finalize
inventory receipt
inventory issue
financial posting
```

Recommended header:

```http
Idempotency-Key: <unique-key>
```

Exact persistence strategy belongs to implementation.

---

# 53. Concurrency Control

State-changing endpoints must revalidate current state in a transaction.

Recommended support:

```text
version number
ETag / If-Match
or transactional row locking
```

Return:

```text
409 WORKFLOW_VERSION_CONFLICT
```

when concurrent updates cannot be safely merged.

---

# 54. Authorization Matrix Mapping

Representative mapping:

| API Action | Permission | Scope | Workflow |
|---|---|---|---|
| GET application | OCOP_APPLICATION.READ | Authorized application scope | Any readable state |
| Create application | OCOP_APPLICATION.CREATE | Own/assigned HTX scope | N/A |
| Update application | OCOP_APPLICATION.UPDATE | Application scope | Editable state |
| Submit | OCOP_APPLICATION.SUBMIT | Application scope | DRAFT/READY |
| Return | OCOP_APPLICATION.RETURN | Assigned review scope | IN_REVIEW |
| Resubmit | OCOP_APPLICATION.SUBMIT | Application scope | NEED_REVISION |
| Verify evidence | EVIDENCE.VERIFY | Assigned scope | PENDING_REVIEW |
| Score | EVALUATION.SCORE | Assignment scope | EVALUATING |
| Lock score | EVALUATION.SCORE_LOCK | Assignment scope | EVALUATING |
| Consolidate | EVALUATION.CONSOLIDATE | Session scope | SCORING_COMPLETED/CONSOLIDATING |
| Approve | OCOP_DECISION.APPROVE | Decision scope | PENDING_DECISION |

Exact permission names must remain synchronized with `15_AUTHORIZATION_MATRIX.md`.

---

# 55. SoD Enforcement

The API must reject prohibited combinations.

Examples:

```text
Application preparer
    ≠
Application evaluator
```

when SoD rule prohibits self-evaluation.

And:

```text
Evaluator
    ≠
Final decision maker
```

when the configured SoD rule prohibits it.

Error:

```text
403 WORKFLOW_SOD_VIOLATION
```

---

# 56. Data Scope Enforcement

Every read/write query must apply scope before returning data.

Conceptually:

```text
query resource
WHERE resource belongs to authorized scope
```

not:

```text
load resource by ID
then check scope later
```

The latter risks accidental data leakage.

---

# 57. API Security Requirements

All APIs must:

```text
authenticate
authorize
validate input
parameterize database queries
enforce scope
enforce workflow
enforce SoD
audit sensitive operations
rate-limit sensitive endpoints where appropriate
```

Never trust:

```text
user_id
cooperative_id
role
permission
status
scope
```

sent by the client when those values should derive from authenticated context or server-side authorization.

---

# 58. Error Code Catalogue

Baseline:

```text
AUTH_REQUIRED
AUTH_INVALID_TOKEN
PERMISSION_DENIED
SCOPE_DENIED
SOD_VIOLATION

VALIDATION_ERROR
RESOURCE_NOT_FOUND
RESOURCE_CONFLICT

WORKFLOW_INVALID_STATE
WORKFLOW_INVALID_TRANSITION
WORKFLOW_PRECONDITION_FAILED
WORKFLOW_LOCKED
WORKFLOW_VERSION_CONFLICT
WORKFLOW_INCOMPLETE

CRITERIA_VERSION_MISMATCH
ASSIGNMENT_REQUIRED
SCORE_INVALID
SCORE_LOCKED

FILE_TYPE_NOT_ALLOWED
FILE_TOO_LARGE
FILE_SECURITY_REJECTED
```

---

# 59. OpenAPI Schema Conventions

Resource schemas should define:

```text
id
created_at
updated_at
```

where applicable.

Do not expose internal-only fields unless explicitly required.

For timestamps:

```text
ISO 8601
UTC
```

Example:

```text
2026-09-01T08:30:00Z
```

---

# 60. UUID

Resource identifiers should use UUID where the database design specifies UUID.

Do not expose sequential internal identifiers merely for convenience if that conflicts with the security design.

---

# 61. Date / Time

Use:

```text
ISO 8601
```

The API should document timezone assumptions.

Persistence should use a consistent server/database timezone strategy.

---

# 62. API Versioning

Current:

```text
/api/v1
```

Breaking changes require:

```text
v2
```

or another explicitly approved versioning strategy.

Do not silently change response semantics in a backward-incompatible way.

---

# 63. OpenAPI Tags

Recommended tags:

```text
Auth
Users
Roles
Permissions
Cooperatives
Members
Capital Contributions
Planting Areas
Seasons
Crops
Materials
Warehouses
Inventory
Operations
Finance
Profit Distributions
OCOP Criteria
OCOP Applications
OCOP Evidence
Evaluation Sessions
Assignments
Scores
Evaluation Results
Decisions
Reports
Exports
Tasks
Notifications
Audit
```

---

# 64. API-to-Workflow Traceability

```text
16_WORKFLOW_SPECIFICATION
        ↓
Application transitions
        ↓
POST /applications/{id}/submit
POST /applications/{id}/return
POST /applications/{id}/resubmit
POST /applications/{id}/ready-for-evaluation
POST /applications/{id}/start-evaluation
POST /applications/{id}/pending-decision
POST /applications/{id}/approve
POST /applications/{id}/reject
```

Evaluation:

```text
Evaluation Session
        ↓
Open
        ↓
Assign
        ↓
Score
        ↓
Lock
        ↓
Consolidate
        ↓
Close
```

---

# 65. API-to-Use-Case Traceability

The implementation must map each API operation to one or more approved use cases from `09_USE_CASES_FINAL.md`.

Example:

```text
UC – Submit OCOP Application
    ↓
POST /api/v1/ocop/applications/{id}/submit
```

```text
UC – Upload Evidence
    ↓
POST /api/v1/ocop/applications/{id}/evidence
```

```text
UC – Evaluate Application
    ↓
Evaluation assignment
    ↓
Score APIs
```

If an API implements a business capability not represented in the use-case baseline, update the requirements/use-case documents before treating it as final.

---

# 66. API-to-Database Traceability

Each endpoint must eventually map to:

```text
API resource
    ↓
Application service
    ↓
Repository/query
    ↓
Database tables
```

No endpoint should introduce an undocumented persistent entity.

Before implementation, reconcile this document against `11_DATABASE_DESIGN.md`.

---

# 67. API-to-Security Traceability

```text
14_SECURITY_DESIGN
        ↓
Authentication
        ↓
15_AUTHORIZATION_MATRIX
        ↓
Permission + Scope + SoD
        ↓
17_OPENAPI
        ↓
Controller/Service authorization
```

Security controls must be implemented server-side.

---

# 68. OpenAPI Implementation Rules

Controllers should remain thin.

Preferred:

```text
Controller
  ↓
Request Validation
  ↓
Application Service
  ↓
Authorization Policy
  ↓
Domain/Business Logic
  ↓
Repository
```

Avoid putting complex workflow logic directly inside route handlers.

---

# 69. Transactional Commands

The following commands should be transactional where multiple business records change:

```text
submit application
return application
resubmit application
verify/reject evidence
lock score
consolidate evaluation
approve/reject application
inventory posting
financial posting
profit distribution approval
```

---

# 70. Audit Integration

For sensitive commands:

```text
API request
    ↓
authorization
    ↓
business transaction
    ↓
state/data change
    ↓
audit event
```

Audit failure handling must be explicitly designed so that critical business changes cannot become unauditable.

---

# 71. Rate Limiting

Potentially rate-limit:

```text
login
password/reset flows
file upload
export generation
report generation
large list queries
```

Exact thresholds are deployment/configuration concerns.

---

# 72. Caching

Cache only data that is safe to cache.

Do not cache authorization-sensitive responses across users without correct cache keys and scope isolation.

Historical criteria catalogs may be cacheable if version-aware.

---

# 73. Reporting / Export Authorization

The following must be enforced:

```text
report permission
data scope
date/criteria scope
export permission where applicable
```

An export must never bypass normal read authorization.

---

# 74. API Documentation Requirements

Every endpoint must eventually document:

```text
summary
description
authentication
permission
scope
request parameters
request body
response schema
error responses
workflow preconditions
audit behavior
```

---

# 75. Example: Submit Application

```http
POST /api/v1/ocop/applications/APP-UUID/submit
Authorization: Bearer <token>
Idempotency-Key: 8d8b...
Content-Type: application/json
```

Server:

```text
authenticate
→ permission check
→ scope check
→ state = READY_FOR_SUBMISSION
→ completeness check
→ transaction
→ state = SUBMITTED
→ submission history
→ audit
→ task/notification event
```

Response:

```json
{
  "data": {
    "id": "APP-UUID",
    "status": "SUBMITTED"
  }
}
```

---

# 76. Example: Return Application

```http
POST /api/v1/ocop/applications/APP-UUID/return
```

Body:

```json
{
  "reason": "Cần bổ sung minh chứng."
}
```

Server:

```text
authenticate
→ permission
→ reviewer scope
→ state = IN_REVIEW
→ reason validation
→ transaction
→ NEED_REVISION
→ audit
→ notification
```

---

# 77. Example: Upload Evidence

```http
POST /api/v1/ocop/applications/APP-UUID/evidence
Content-Type: multipart/form-data
```

Server:

```text
authenticate
→ permission
→ scope
→ application state
→ criterion validation
→ file validation
→ object storage
→ checksum
→ evidence metadata
→ audit
```

---

# 78. Example: Score

```http
POST /api/v1/ocop/evaluation-assignments/ASSIGNMENT-UUID/scores
```

Body:

```json
{
  "criterion_id": "CRITERION-UUID",
  "score": 85,
  "comment": "..."
}
```

Server verifies:

```text
assignment belongs to evaluator
session active
criterion belongs to session criteria version
score valid
score not locked
```

---

# 79. Example: Approve

```http
POST /api/v1/ocop/applications/APP-UUID/approve
```

Server:

```text
authenticate
→ permission
→ scope
→ state = PENDING_DECISION
→ consolidated result valid
→ SoD validation
→ create decision
→ APPROVED
→ audit
```

---

# 80. Forbidden API Patterns

Never implement:

```text
PUT /applications/{id}/status
PATCH /applications/{id} with arbitrary status
POST /workflow/transition with arbitrary from/to states
GET /files/{raw-object-key}
GET /users/{id}/all-data without scope filtering
```

unless an explicit security review approves the design.

---

# 81. API Testing Requirements

Each endpoint must test:

```text
happy path
unauthenticated
wrong role
missing permission
wrong scope
SoD violation
invalid state
invalid transition
invalid input
concurrency
duplicate request
not found
```

For file endpoints additionally:

```text
invalid MIME
oversized file
malicious file
unauthorized download
cross-scope download
```

---

# 82. Contract Testing

Frontend and backend should validate:

```text
request schema
response schema
error schema
enum values
pagination
workflow action semantics
```

OpenAPI should become the shared contract.

---

# 83. Definition of Done

- [ ] API version defined.
- [ ] Authentication endpoints defined.
- [ ] Core resources mapped.
- [ ] Workflow commands defined.
- [ ] OCOP criteria API defined.
- [ ] Evidence API defined.
- [ ] Evaluation API defined.
- [ ] Decision API defined.
- [ ] Reports/export APIs defined.
- [ ] Permission mapping defined.
- [ ] Data scope requirements defined.
- [ ] SoD requirements defined.
- [ ] File security requirements defined.
- [ ] Idempotency defined.
- [ ] Concurrency defined.
- [ ] Audit integration defined.
- [ ] Error catalogue defined.
- [ ] Use-case traceability defined.
- [ ] Database traceability requirement defined.
- [ ] Generic status mutation prohibited.
- [ ] `council_level = PROVINCE | CENTRAL` supported.

---

# 84. Open Questions

| ID | Question | Priority |
|---|---|---|
| API-OQ-001 | Exact endpoint names need final reconciliation with 09 use cases? | High |
| API-OQ-002 | Exact permission names need final reconciliation with 15? | Critical |
| API-OQ-003 | Exact database table/column names need reconciliation with 11? | Critical |
| API-OQ-004 | Exact OCOP criteria fields need reconciliation with 04/07/08? | Critical |
| API-OQ-005 | Exact evaluator/council workflow needs business confirmation? | High |
| API-OQ-006 | Exact report/export templates need confirmation? | Medium |
| API-OQ-007 | File size/MIME limits need deployment policy? | Medium |
| API-OQ-008 | Reopen/correction workflow needs confirmation? | High |
| API-OQ-009 | Profit distribution approval workflow needs confirmation? | Medium |
| API-OQ-010 | Inventory and finance transaction states need final workflow definition? | Medium |

---

# 85. Next Document

Next recommended document:

```text
18_DATABASE_IMPLEMENTATION.md
```

It should reconcile:

```text
11_DATABASE_DESIGN
        +
15_AUTHORIZATION_MATRIX
        +
16_WORKFLOW_SPECIFICATION
        +
17_OPENAPI_SPECIFICATION
```

before implementation code is generated.
