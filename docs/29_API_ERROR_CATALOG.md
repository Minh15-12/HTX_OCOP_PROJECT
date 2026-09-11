# 29_API_ERROR_CATALOG.md

# API Error Catalog & Frontend Error Handling Specification

## 1. Document Information

| Field | Value |
|---|---|
| Document ID | 29 |
| Document Name | API Error Catalog & Frontend Error Handling Specification |
| Project | Xây dựng Hệ thống quản lý hoạt động Hợp tác xã nông nghiệp và số hóa hồ sơ đánh giá, phân hạng OCOP |
| Backend | Laravel / PHP |
| Frontend | React + TypeScript |
| Database | PostgreSQL 16+ |
| API Style | REST API |
| Status | Specification |
| Purpose | Chuẩn hóa lỗi API, mã lỗi, HTTP status, validation, conflict, workflow, finance, OCOP và cách frontend hiển thị/xử lý |
| Related Documents | 12_API_SPECIFICATION.md, 17_OPENAPI_SPECIFICATION.md, 25_FRONTEND_CODING_STANDARDS.md, 26_FRONTEND_IMPLEMENTATION_PLAN.md, 27_UI_UX_SPECIFICATION.md, 28_FRONTEND_SCREEN_SPECIFICATION.md |

---

# 2. Purpose

Tài liệu này định nghĩa một hợp đồng lỗi thống nhất giữa backend và frontend.

Mục tiêu:

1. Backend trả lỗi có cấu trúc nhất quán.
2. Frontend không phải suy đoán lỗi dựa trên message.
3. Mỗi lỗi có HTTP status phù hợp và `error_code` ổn định.
4. Validation có thể ánh xạ trực tiếp tới field/component.
5. Conflict và concurrency được xử lý riêng với validation thông thường.
6. Workflow error thể hiện đúng trạng thái và action không hợp lệ.
7. Finance error bảo vệ tính toàn vẹn tiền và lịch sử giao dịch.
8. OCOP/evidence/evaluation error bảo vệ dữ liệu hồ sơ và kết quả đánh giá.
9. Không làm lộ thông tin nhạy cảm qua error response.
10. Error contract có thể version hóa và được kiểm thử tự động.

---

# 3. Governing Principles

## 3.1 Error contract is an API contract

Frontend chỉ được phụ thuộc vào:

- HTTP status;
- `error_code`;
- `message`;
- `details`;
- `field_errors`;
- `request_id`;
- `retryable`.

Frontend không được parse message để quyết định business behavior.

Bad:

```ts
if (error.message.includes("already")) {
  ...
}
```

Good:

```ts
if (error.error_code === "MEMBER_CODE_DUPLICATE") {
  ...
}
```

---

## 3.2 Backend is source of truth

Các lỗi liên quan đến:

- authorization;
- tenant isolation;
- business rule;
- financial integrity;
- workflow;
- OCOP locking;
- evaluation;
- concurrency;

phải được xác định ở backend.

Frontend chỉ cải thiện UX, không thay thế backend enforcement.

---

## 3.3 Do not invent business error codes

Một `error_code` chỉ được tạo khi:

- business rule đã tồn tại trong source specification; hoặc
- implementation analysis xác định cần mã kỹ thuật rõ ràng và được ghi nhận là PROPOSED/TO_VERIFY.

AI coding agent không được tự ý tạo hàng loạt mã lỗi chỉ vì “có thể cần”.

---

# 4. Error Classification

Mỗi lỗi thuộc ít nhất một nhóm:

| Group | Prefix | Meaning |
|---|---|---|
| Authentication | AUTH | Người dùng chưa xác thực hoặc session/token không hợp lệ |
| Authorization | AUTHZ | Không có quyền |
| Tenant | TENANT | Không được truy cập dữ liệu tenant khác |
| Validation | VALIDATION | Input không hợp lệ |
| Resource | RESOURCE | Resource không tồn tại hoặc không khả dụng |
| Conflict | CONFLICT | Xung đột dữ liệu/trạng thái |
| Concurrency | CONCURRENCY | Xung đột optimistic locking/concurrent update |
| Idempotency | IDEMPOTENCY | Request retry/deduplication conflict |
| Workflow | WORKFLOW | Transition/action không hợp lệ |
| Finance | FINANCE | Quy tắc tài chính |
| Inventory | INVENTORY | Quy tắc tồn kho |
| Production | PRODUCTION | Quy tắc sản xuất/vùng trồng |
| OCOP | OCOP | Quy tắc hồ sơ/tiêu chí/đánh giá |
| Evidence | EVIDENCE | Quy tắc minh chứng |
| File | FILE | File/storage/document issue |
| Rate Limit | RATE | Request bị giới hạn |
| System | SYSTEM | Lỗi hệ thống |

---

# 5. Canonical Error Envelope

## 5.1 Standard shape

```json
{
  "success": false,
  "error": {
    "error_code": "MEMBER_CODE_DUPLICATE",
    "message": "Mã xã viên đã tồn tại.",
    "http_status": 409,
    "retryable": false,
    "details": {},
    "field_errors": {},
    "request_id": "01JXXXXXXXXXXXX",
    "timestamp": "2026-09-04T10:30:00Z"
  }
}
```

---

## 5.2 Required fields

| Field | Required | Description |
|---|---:|---|
| success | YES | Always `false` |
| error.error_code | YES | Stable machine-readable code |
| error.message | YES | Human-readable message |
| error.http_status | YES | HTTP status |
| error.retryable | YES | Whether retry may succeed |
| error.details | NO | Structured contextual data |
| error.field_errors | NO | Validation errors |
| error.request_id | YES | Correlation identifier |
| error.timestamp | YES | Server timestamp |

---

# 6. Error Code Naming Convention

Format:

```text
<DOMAIN>_<PROBLEM>
```

Examples:

```text
AUTH_INVALID_CREDENTIALS
AUTH_TOKEN_EXPIRED
AUTHZ_FORBIDDEN
MEMBER_NOT_FOUND
MEMBER_CODE_DUPLICATE
CONCURRENCY_VERSION_CONFLICT
WORKFLOW_INVALID_TRANSITION
FINANCE_INSUFFICIENT_BALANCE
OCOP_CRITERIA_VERSION_LOCKED
EVIDENCE_VERSION_LOCKED
```

Rules:

- uppercase;
- underscore separated;
- stable;
- no spaces;
- no Vietnamese diacritics;
- do not encode dynamic IDs in error code;
- do not encode HTTP status in error code.

---

# 7. HTTP Status Mapping

| HTTP | Meaning | Default retry |
|---:|---|---|
| 400 | Malformed request / invalid request structure | NO |
| 401 | Unauthenticated | Usually NO; refresh/re-login may be needed |
| 403 | Forbidden | NO |
| 404 | Resource not found | NO |
| 409 | Resource/state conflict | NO automatic retry unless conflict policy allows |
| 422 | Semantic/business validation | NO |
| 423 | Locked resource, only if adopted by API contract | NO |
| 429 | Rate limited | YES after server-provided delay |
| 500 | Internal server error | Usually YES with bounded retry for safe requests |
| 502 | Upstream failure | YES for safe/idempotent requests |
| 503 | Service unavailable | YES with backoff |
| 504 | Gateway timeout | YES only when operation is safe/idempotent or idempotency is guaranteed |

Do not use status codes inconsistently.

---

# 8. Authentication Errors

## 8.1 AUTH_UNAUTHENTICATED

HTTP:

```text
401
```

Use when:

- no valid access token;
- expired session;
- invalid authentication state.

Frontend:

- clear invalid session if required;
- redirect to login;
- preserve safe return route.

Never display technical token details.

---

## 8.2 AUTH_TOKEN_EXPIRED

HTTP:

```text
401
```

Frontend may attempt one controlled token refresh if the authentication design supports refresh.

Never retry indefinitely.

---

## 8.3 AUTH_INVALID_TOKEN

HTTP:

```text
401
```

Do not expose:

- token contents;
- signing information;
- internal authentication details.

---

# 9. Authorization Errors

## 9.1 AUTHZ_FORBIDDEN

HTTP:

```text
403
```

Meaning:

User is authenticated but lacks permission.

Frontend:

- render permission-aware 403 state;
- hide/disable unavailable actions where appropriate;
- never assume hidden UI is security enforcement.

---

## 9.2 TENANT_ACCESS_DENIED

HTTP:

```text
403
```

Use when a request attempts to cross cooperative/tenant boundaries.

Security requirement:

The response must not reveal whether the foreign resource exists.

---

# 10. Resource Errors

## 10.1 RESOURCE_NOT_FOUND

HTTP:

```text
404
```

Generic fallback when no domain-specific code is required.

---

## 10.2 Domain-specific not-found codes

Only use when frontend behavior benefits from the distinction and the domain supports it.

Examples:

```text
MEMBER_NOT_FOUND
PRODUCTION_UNIT_NOT_FOUND
FARM_PLOT_NOT_FOUND
CROP_SEASON_NOT_FOUND
FARMING_LOG_NOT_FOUND
HARVEST_NOT_FOUND
LOT_NOT_FOUND
PRODUCT_NOT_FOUND
WAREHOUSE_NOT_FOUND
OCOP_APPLICATION_NOT_FOUND
OCOP_CRITERION_NOT_FOUND
EVIDENCE_NOT_FOUND
EVALUATION_SESSION_NOT_FOUND
```

These codes must be reconciled with the actual API/domain specification before implementation.

---

# 11. Validation Errors

## 11.1 VALIDATION_FAILED

HTTP:

```text
422
```

Example:

```json
{
  "success": false,
  "error": {
    "error_code": "VALIDATION_FAILED",
    "message": "Dữ liệu không hợp lệ.",
    "http_status": 422,
    "retryable": false,
    "details": {},
    "field_errors": {
      "full_name": ["Họ và tên là bắt buộc."],
      "join_date": ["Ngày tham gia không hợp lệ."]
    },
    "request_id": "01J..."
  }
}
```

---

## 11.2 Field error contract

Recommended:

```json
"field_errors": {
  "field_name": [
    "Human readable message"
  ]
}
```

Nested fields:

```json
"field_errors": {
  "contact.phone": [
    "Số điện thoại không hợp lệ."
  ]
}
```

Array fields:

```json
"field_errors": {
  "items.0.quantity": [
    "Số lượng phải lớn hơn 0."
  ]
}
```

Frontend must map field paths to form controls consistently.

---

# 12. Common Validation Codes

Potential codes, only where supported:

```text
VALIDATION_FAILED
INVALID_DATE_RANGE
INVALID_NUMBER
INVALID_MONEY
INVALID_ENUM_VALUE
REQUIRED_FIELD
INVALID_FILE_TYPE
FILE_TOO_LARGE
```

If generic Laravel validation is sufficient, prefer `VALIDATION_FAILED` plus `field_errors` rather than creating a unique code for every rule.

---

# 13. Duplicate / Conflict Errors

## 13.1 Generic conflict

```text
CONFLICT
```

HTTP:

```text
409
```

Use when the requested operation conflicts with current server state.

---

## 13.2 Unique business identifier

Examples:

```text
MEMBER_CODE_DUPLICATE
PRODUCTION_UNIT_CODE_DUPLICATE
FARM_PLOT_CODE_DUPLICATE
LOT_CODE_DUPLICATE
PRODUCT_CODE_DUPLICATE
```

These codes are valid only if the corresponding unique business constraints exist in the source specification/database design.

---

# 14. Concurrency Errors

## 14.1 CONCURRENCY_VERSION_CONFLICT

HTTP:

```text
409
```

Use for optimistic-locking conflicts.

Example:

```json
{
  "success": false,
  "error": {
    "error_code": "CONCURRENCY_VERSION_CONFLICT",
    "message": "Dữ liệu đã được thay đổi bởi người dùng khác.",
    "http_status": 409,
    "retryable": false,
    "details": {
      "resource_type": "member",
      "resource_id": "..."
    },
    "request_id": "01J..."
  }
}
```

Frontend:

1. stop current mutation;
2. show conflict dialog/banner;
3. offer reload;
4. never silently overwrite the newer version.

---

# 15. Idempotency Errors

If the API uses idempotency keys:

```text
IDEMPOTENCY_KEY_REUSED
IDEMPOTENCY_REQUEST_IN_PROGRESS
IDEMPOTENCY_RESULT_REPLAYED
```

Behavior must follow the API idempotency specification.

Important for:

- financial posting;
- settlement;
- distribution execution;
- workflow actions;
- document generation jobs;
- other non-safe mutations.

Do not invent idempotency semantics independently in frontend.

---

# 16. Workflow Errors

Workflow is stateful. Invalid transitions must not be treated as ordinary field validation.

## 16.1 WORKFLOW_INVALID_TRANSITION

HTTP:

```text
409
```

Example:

```json
{
  "success": false,
  "error": {
    "error_code": "WORKFLOW_INVALID_TRANSITION",
    "message": "Không thể thực hiện thao tác ở trạng thái hiện tại.",
    "http_status": 409,
    "retryable": false,
    "details": {
      "current_state": "DRAFT",
      "requested_action": "APPROVE"
    },
    "request_id": "01J..."
  }
}
```

Frontend should:

- refresh resource state;
- hide/disable invalid action;
- show current status;
- never locally force the transition.

---

## 16.2 WORKFLOW_ACTION_NOT_ALLOWED

HTTP:

```text
403 or 409
```

The exact mapping must follow the authorization/workflow contract.

Distinguish:

- user lacks permission → `403`;
- user has permission but state does not allow action → `409`.

---

# 17. Locked Resource Errors

Potential codes:

```text
RESOURCE_LOCKED
OCOP_CRITERIA_VERSION_LOCKED
OCOP_APPLICATION_LOCKED
EVIDENCE_VERSION_LOCKED
EVALUATION_LOCKED
DECISION_LOCKED
```

HTTP:

```text
409
```

Use only where the corresponding lock semantics exist.

Frontend:

- disable mutation actions;
- explain that the resource is locked;
- preserve read-only access where permitted.

---

# 18. Finance Error Catalog

Finance errors require stronger consistency guarantees.

## 18.1 FINANCE_INSUFFICIENT_BALANCE

HTTP:

```text
422
```

Use only when the relevant operation actually requires available balance and the business specification defines that rule.

---

## 18.2 FINANCE_TRANSACTION_ALREADY_POSTED

HTTP:

```text
409
```

Use when a posted transaction cannot be posted again.

---

## 18.3 FINANCE_TRANSACTION_NOT_POSTABLE

HTTP:

```text
409
```

Use when current lifecycle state does not permit posting.

---

## 18.4 FINANCE_SETTLEMENT_EXCEEDS_OUTSTANDING

HTTP:

```text
422
```

Use when settlement amount exceeds the remaining receivable/payable amount.

---

## 18.5 FINANCE_SETTLEMENT_ALREADY_SETTLED

HTTP:

```text
409
```

Use when no further settlement is allowed because the obligation is already settled.

---

## 18.6 FINANCE_PERIOD_LOCKED

HTTP:

```text
409
```

Use only if financial period locking exists in the domain.

---

## 18.7 FINANCE_DISTRIBUTION_NOT_EXECUTABLE

HTTP:

```text
409
```

Use when a surplus distribution plan is not in a state that allows execution.

Do not invent distribution lifecycle states.

---

# 19. Financial Error Security

Finance errors must not expose:

- another member's financial information;
- hidden account identifiers;
- internal ledger identifiers;
- unauthorized balances;
- database exception messages;
- SQL;
- stack traces.

Use generic messages when the requester is not authorized to know details.

---

# 20. Inventory Errors

Potential codes:

```text
INVENTORY_INSUFFICIENT_STOCK
INVENTORY_TRANSACTION_NOT_POSTABLE
INVENTORY_STOCK_COUNT_CONFLICT
INVENTORY_WAREHOUSE_NOT_FOUND
INVENTORY_MATERIAL_NOT_FOUND
```

These must be enabled only after confirmation against the inventory domain and implementation.

For stock-sensitive mutations:

- use database transaction;
- prevent negative stock when prohibited;
- handle concurrent issue operations;
- return `409` or `422` according to the defined business semantics.

---

# 21. Production Errors

Potential codes:

```text
PRODUCTION_UNIT_NOT_FOUND
FARM_PLOT_NOT_FOUND
CROP_SEASON_NOT_FOUND
CROP_SEASON_ALREADY_CLOSED
FARMING_LOG_NOT_EDITABLE
HARVEST_NOT_ALLOWED
PHI_NOT_SATISFIED
```

Important:

`PHI_NOT_SATISFIED` must only exist if the project specification defines a blocking or validation behavior for PHI.

Never hard-code:

- pesticide PHI days;
- material safety intervals;
- crop-specific rules;

inside the error catalog.

---

# 22. OCOP Error Catalog

OCOP is a major controlled-data area.

Potential codes:

```text
OCOP_CRITERIA_VERSION_NOT_FOUND
OCOP_CRITERIA_VERSION_LOCKED
OCOP_CRITERION_NOT_FOUND
OCOP_APPLICATION_NOT_FOUND
OCOP_APPLICATION_NOT_EDITABLE
OCOP_APPLICATION_NOT_SUBMITTABLE
OCOP_APPLICATION_ALREADY_SUBMITTED
OCOP_APPLICATION_NOT_REVIEWABLE
OCOP_EVALUATION_NOT_ALLOWED
OCOP_EVALUATION_LOCKED
OCOP_SCORE_NOT_EDITABLE
OCOP_CONSOLIDATION_NOT_ALLOWED
OCOP_CLASSIFICATION_NOT_ALLOWED
OCOP_DECISION_NOT_ALLOWED
```

Each code must be verified against:

- `12_API_SPECIFICATION.md`;
- `17_OPENAPI_SPECIFICATION.md`;
- OCOP domain rules;
- workflow specification;
- authorization matrix.

---

# 23. OCOP Criteria Versioning Errors

Criteria versions are historical business data.

If a version is locked:

```text
OCOP_CRITERIA_VERSION_LOCKED
```

HTTP:

```text
409
```

Frontend:

- show version metadata;
- render read-only state;
- prevent editing;
- do not offer a fake unlock button.

---

# 24. Evidence Errors

Potential codes:

```text
EVIDENCE_NOT_FOUND
EVIDENCE_NOT_EDITABLE
EVIDENCE_VERSION_LOCKED
EVIDENCE_FILE_REQUIRED
EVIDENCE_FILE_NOT_FOUND
EVIDENCE_VERSION_CONFLICT
EVIDENCE_LINK_INVALID
```

Evidence handling must preserve:

- version history;
- file identity;
- ownership/tenant;
- audit trail;
- historical evaluation references.

Do not physically delete evidence versions that are required for historical traceability unless the retention policy explicitly permits it.

---

# 25. File / Object Storage Errors

Potential codes:

```text
FILE_NOT_FOUND
FILE_TYPE_NOT_ALLOWED
FILE_SIZE_EXCEEDED
FILE_UPLOAD_FAILED
FILE_STORAGE_UNAVAILABLE
FILE_DOWNLOAD_NOT_ALLOWED
FILE_SIGNED_URL_EXPIRED
```

Security:

- do not reveal object storage bucket paths;
- do not reveal access credentials;
- do not return private object URLs directly unless explicitly designed;
- use signed URLs where required.

---

# 26. Rate Limit Errors

## RATE_LIMITED

HTTP:

```text
429
```

Response may include:

```http
Retry-After: 30
```

Frontend:

- do not immediately retry in a tight loop;
- display a short retry message;
- honor `Retry-After` when provided.

---

# 27. System Errors

## 27.1 SYSTEM_INTERNAL_ERROR

HTTP:

```text
500
```

Public response:

```json
{
  "success": false,
  "error": {
    "error_code": "SYSTEM_INTERNAL_ERROR",
    "message": "Đã xảy ra lỗi hệ thống.",
    "http_status": 500,
    "retryable": false,
    "request_id": "01J..."
  }
}
```

Do not expose:

- stack trace;
- SQL;
- file paths;
- environment variables;
- framework internals.

---

## 27.2 SYSTEM_SERVICE_UNAVAILABLE

HTTP:

```text
503
```

Frontend may retry safe/idempotent requests with bounded exponential backoff.

---

## 27.3 SYSTEM_GATEWAY_TIMEOUT

HTTP:

```text
504
```

Do not automatically retry an unknown financial mutation unless idempotency guarantees exist.

---

# 28. Error Details Contract

`details` contains structured data needed for UX.

Example:

```json
"details": {
  "resource_type": "ocop_application",
  "resource_id": "APP-001",
  "current_state": "SUBMITTED",
  "allowed_actions": ["RETURN", "REVIEW"]
}
```

Rules:

- only expose data the caller is authorized to see;
- no secrets;
- no raw database rows;
- no arbitrary exception object;
- no internal stack trace.

---

# 29. Retryability

`retryable` is advisory.

| Error | Retry |
|---|---|
| 400 validation | NO |
| 401 auth | Refresh/re-auth, not blind retry |
| 403 forbidden | NO |
| 404 not found | NO |
| 409 workflow conflict | NO automatic retry |
| 409 concurrency | Reload/reconcile |
| 422 business rule | NO |
| 429 rate limit | YES after delay |
| 500 | Maybe, depending on operation |
| 502 | YES for safe/idempotent requests |
| 503 | YES with backoff |
| 504 | Only if operation safety/idempotency is known |

For POST mutations, status alone is insufficient to decide retry.

---

# 30. Frontend Error Presentation Matrix

| Error type | UI |
|---|---|
| Field validation | Inline field error |
| Form-level validation | Form error/banner |
| 401 | Session handling/login |
| 403 | Permission state / 403 page |
| 404 | Not-found state |
| 409 concurrency | Conflict dialog/banner + reload |
| 409 workflow | Action error + refresh |
| Finance business rule | Dialog/banner |
| OCOP locked | Read-only notice |
| File upload | Inline upload error |
| 429 | Toast/banner with retry timing |
| 5xx | Error banner/toast |
| Long-running failure | Job status/error state |

Avoid using toast for errors that require user action or context.

---

# 31. Error UX Rules

## 31.1 Never show raw backend exception

Bad:

```text
SQLSTATE[23505]: duplicate key value violates unique constraint...
```

Good:

```text
Mã xã viên đã tồn tại.
```

---

## 31.2 Preserve user input

For validation and ordinary server errors:

- do not clear the form unnecessarily;
- preserve entered values;
- preserve uploaded file state where technically safe;
- indicate fields that need correction.

---

## 31.3 Destructive actions

For failed:

- delete;
- post;
- settle;
- approve;
- reject;
- execute distribution;

the UI must show the resulting server state instead of assuming failure/success solely from local state.

---

# 32. API Error Handling Flow

```text
API Request
   |
   v
HTTP Response
   |
   +--> 2xx --> success handler
   |
   +--> 401 --> auth/session handler
   |
   +--> 403 --> permission handler
   |
   +--> 404 --> not-found handler
   |
   +--> 409 --> conflict/workflow/concurrency handler
   |
   +--> 422 --> validation/business-rule handler
   |
   +--> 429 --> rate-limit handler
   |
   +--> 5xx --> system/retry handler
```

---

# 33. Frontend Error Adapter

Recommended conceptual adapter:

```ts
type ApiError = {
  error_code: string;
  message: string;
  http_status: number;
  retryable: boolean;
  details?: Record<string, unknown>;
  field_errors?: Record<string, string[]>;
  request_id?: string;
  timestamp?: string;
};

function normalizeApiError(error: unknown): ApiError {
  // implementation must follow API contract
}
```

The adapter should normalize transport/library differences.

It must not invent business codes.

---

# 34. Localization

The backend `message` is user-facing fallback text.

Frontend may map stable codes to localization keys:

```text
error.AUTHZ_FORBIDDEN
error.MEMBER_CODE_DUPLICATE
error.WORKFLOW_INVALID_TRANSITION
error.OCOP_CRITERIA_VERSION_LOCKED
```

Preferred behavior:

1. use localized code mapping if available;
2. otherwise use backend message;
3. otherwise use generic safe fallback.

Never display an empty error.

---

# 35. Security and Information Disclosure

Error responses must not reveal:

- passwords;
- tokens;
- API keys;
- database connection information;
- SQL statements;
- stack traces;
- server filesystem paths;
- internal service names;
- other tenant data;
- unauthorized financial data;
- private evidence/file metadata.

For sensitive resources, 403/404 behavior must follow the authorization policy and avoid resource enumeration.

---

# 36. Laravel Backend Rules

Recommended implementation responsibilities:

### Domain/Application layer

Determines business error condition.

### Exception classes

Represent typed application errors.

Example conceptual classes:

```text
InvalidWorkflowTransitionException
ConcurrencyConflictException
FinancialSettlementException
LockedResourceException
```

Actual class names must follow the backend project structure.

### Exception handler

Maps exceptions to:

```text
HTTP status
error_code
message
details
retryable
request_id
```

### Validation layer

Maps validation failures to:

```text
VALIDATION_FAILED
field_errors
```

Do not return framework exception structures directly as public API contracts.

---

# 37. OpenAPI Requirements

Every documented error response should define:

- status code;
- response schema;
- error code;
- example;
- whether retryable;
- field errors where applicable.

Example conceptual schema:

```yaml
ApiErrorResponse:
  type: object
  required:
    - success
    - error
  properties:
    success:
      type: boolean
      example: false
    error:
      $ref: '#/components/schemas/ApiError'
```

---

# 38. Testing Requirements

## 38.1 Unit tests

Test:

- error code mapping;
- status mapping;
- retryability;
- exception conversion;
- validation formatting.

---

## 38.2 Feature tests

Each endpoint should cover applicable errors:

```text
401
403
404
409
422
429
500
```

Not every endpoint requires every status.

---

## 38.3 Security tests

Verify:

- cross-tenant resource access;
- unauthorized resource enumeration;
- hidden financial data;
- private evidence access;
- file path disclosure;
- exception leakage.

---

## 38.4 Concurrency tests

At minimum where applicable:

- two simultaneous updates;
- two simultaneous settlement requests;
- duplicate financial posting;
- duplicate workflow action;
- concurrent evidence/evaluation updates.

Expected result:

- exactly one valid mutation where uniqueness/idempotency requires it;
- no corrupted aggregate;
- clear conflict response.

---

# 39. Error Test Matrix

| Scenario | HTTP | Code | Expected UI |
|---|---:|---|---|
| Missing auth | 401 | AUTH_UNAUTHENTICATED | Login/session |
| No permission | 403 | AUTHZ_FORBIDDEN | 403 |
| Resource missing | 404 | RESOURCE_NOT_FOUND | Not found |
| Invalid field | 422 | VALIDATION_FAILED | Inline |
| Duplicate code | 409 | DOMAIN_DUPLICATE | Field/banner |
| Concurrent edit | 409 | CONCURRENCY_VERSION_CONFLICT | Reload dialog |
| Invalid workflow action | 409 | WORKFLOW_INVALID_TRANSITION | Action error |
| Locked OCOP criteria | 409 | OCOP_CRITERIA_VERSION_LOCKED | Read-only |
| Excess settlement | 422 | FINANCE_SETTLEMENT_EXCEEDS_OUTSTANDING | Dialog |
| Rate limit | 429 | RATE_LIMITED | Retry later |
| Server failure | 500 | SYSTEM_INTERNAL_ERROR | Error state |
| Service unavailable | 503 | SYSTEM_SERVICE_UNAVAILABLE | Retry |

`DOMAIN_DUPLICATE` is illustrative only; replace with the verified domain-specific code.

---

# 40. Traceability to Frontend Screens

| Screen Area | Error Families |
|---|---|
| Login | AUTH |
| Dashboard | AUTH, AUTHZ, SYSTEM |
| Member list/detail/form | VALIDATION, RESOURCE, CONFLICT, AUTHZ |
| Production Unit | VALIDATION, RESOURCE, CONFLICT |
| Farm Plot | VALIDATION, RESOURCE, CONFLICT |
| Crop Season | VALIDATION, WORKFLOW, CONFLICT |
| Farming Log | VALIDATION, PRODUCTION |
| Harvest/Lot | VALIDATION, PRODUCTION, CONFLICT |
| Inventory | INVENTORY, CONFLICT |
| Finance | FINANCE, CONCURRENCY, IDEMPOTENCY |
| OCOP Application | OCOP, WORKFLOW, EVIDENCE |
| Criteria | OCOP, LOCK |
| Evidence | EVIDENCE, FILE, LOCK |
| Evaluation | OCOP, WORKFLOW, CONCURRENCY |
| Consolidation | OCOP, WORKFLOW, LOCK |
| Decision | OCOP, WORKFLOW, LOCK |
| Reports | AUTHZ, SYSTEM |
| Documents | FILE, SYSTEM |
| Audit | AUTHZ, SYSTEM |

---

# 41. Error-to-Action Contract

Frontend should derive available recovery actions from error semantics.

Examples:

### Concurrency

```text
409 + CONCURRENCY_VERSION_CONFLICT
→ Reload
```

### Invalid workflow

```text
409 + WORKFLOW_INVALID_TRANSITION
→ Refresh state
→ Show current status
```

### Validation

```text
422 + VALIDATION_FAILED
→ Focus invalid field
→ Preserve input
```

### Rate limit

```text
429 + RATE_LIMITED
→ Wait
→ Retry
```

### Locked resource

```text
409 + *_LOCKED
→ Read-only
```

Do not provide a recovery action that the backend cannot actually perform.

---

# 42. No Silent Failure

Every failed mutation must produce one of:

- visible inline error;
- banner;
- dialog;
- page-level error state;
- controlled retry state.

Do not:

```text
catch(() => {})
```

Do not silently ignore failed:

- saves;
- uploads;
- approvals;
- submissions;
- postings;
- settlements;
- distribution execution;
- document generation.

---

# 43. Logging and Observability

Server logs should include:

- request_id;
- error_code;
- HTTP status;
- authenticated actor ID where permitted;
- cooperative/tenant ID;
- endpoint;
- correlation information;
- exception classification.

Do not log:

- passwords;
- access tokens;
- secrets;
- private file content;
- unnecessary personal information;
- full financial payloads unless explicitly required and protected.

---

# 44. Versioning

Error codes are API contract elements.

Do not casually rename:

```text
MEMBER_CODE_DUPLICATE
```

to:

```text
DUPLICATE_MEMBER
```

without considering backward compatibility.

If a breaking change is required:

1. update API specification;
2. update OpenAPI;
3. update frontend adapter;
4. update tests;
5. update traceability;
6. document migration.

---

# 45. AI Coding Agent Contract

The AI coding agent MUST:

1. Read documents 12, 17, 25, 26, 27 and 28 before changing error handling.
2. Inspect actual backend exception/validation handling before implementation.
3. Reconcile existing error response format before introducing a new envelope.
4. Never create duplicate error contracts.
5. Never invent business error codes without labeling them PROPOSED/TO_VERIFY.
6. Never expose framework/database exceptions.
7. Never use frontend message parsing as business logic.
8. Preserve tenant isolation.
9. Preserve authorization behavior.
10. Add tests for every new error path.
11. Update OpenAPI when the API contract changes.
12. Keep error codes stable.
13. Avoid broad refactoring unrelated to the task.
14. Never silently swallow errors.
15. Never claim an error scenario is implemented unless tests prove it.

---

# 46. Required Pre-Implementation Verification

Before implementing File 29-related code, the agent must inspect:

```text
12_API_SPECIFICATION.md
17_OPENAPI_SPECIFICATION.md
21_BACKEND_PROJECT_STRUCTURE.md
22_BACKEND_CODING_STANDARDS.md
23_BACKEND_API_IMPLEMENTATION_PLAN.md
25_FRONTEND_CODING_STANDARDS.md
26_FRONTEND_IMPLEMENTATION_PLAN.md
27_UI_UX_SPECIFICATION.md
28_FRONTEND_SCREEN_SPECIFICATION.md
```

Then classify findings:

```text
FACT
SOURCE
PROPOSED
TO_VERIFY
CONFLICT
GAP
```

If the existing backend already has an error contract, preserve it unless the specification explicitly requires migration.

---

# 47. Implementation Sequence

Recommended sequence:

```text
1. Inspect current backend error handling
2. Inventory existing exception classes
3. Inventory existing HTTP responses
4. Compare with API specification
5. Define canonical error envelope
6. Define validated error code registry
7. Implement backend mapper
8. Implement frontend API error adapter
9. Implement field-error mapping
10. Implement 401/403/404 handlers
11. Implement 409 conflict handling
12. Implement workflow errors
13. Implement finance errors where already supported
14. Implement OCOP/evidence errors where already supported
15. Implement 429/5xx handling
16. Update OpenAPI
17. Add unit/feature/security tests
18. Run regression tests
19. Update traceability
20. Stop and report
```

---

# 48. Definition of Done

File 29 implementation is complete only when:

### Contract

- canonical error envelope exists;
- error codes are stable;
- HTTP mappings are consistent;
- validation format is documented.

### Backend

- exception mapping is centralized;
- framework/database errors are sanitized;
- authorization errors are secure;
- tenant errors are secure;
- business conflicts are typed.

### Frontend

- one API error adapter exists;
- 401/403/404/409/422/429/5xx are handled;
- field errors map to forms;
- conflict states provide recovery;
- no silent mutation failures.

### Testing

- unit tests pass;
- feature tests pass;
- security tests pass;
- concurrency tests pass where applicable;
- regression tests pass.

### Documentation

- API specification updated;
- OpenAPI updated;
- screen/error traceability updated;
- unresolved GAP/CONFLICT/TO_VERIFY items documented.

---

# 49. Final Agent Report Format

After implementation, the agent MUST report:

```text
1. Scope completed
2. Files changed
3. Existing error contract discovered
4. New error contract changes
5. Error codes added/changed
6. HTTP status mapping
7. Backend exception mapping
8. Frontend handling
9. Validation handling
10. Authorization/security handling
11. Tenant isolation handling
12. Concurrency/idempotency handling
13. OpenAPI changes
14. Tests added
15. Tests executed/results
16. FACT/SOURCE/PROPOSED/TO_VERIFY/CONFLICT/GAP
17. Technical debt
18. Recommended next task
```

The agent MUST NOT automatically start the recommended next task.

---

# 50. Explicit Non-Goals

This document does NOT authorize the agent to:

- redesign the database;
- invent accounting standards;
- invent OCOP criteria;
- invent evaluation scores;
- invent workflow states;
- change authorization roles;
- implement unrelated frontend screens;
- implement new finance rules not in the specification;
- implement OCOP rules not in the specification;
- create arbitrary HTTP endpoints;
- remove historical audit data.

---

# 51. Final Contract

The system's error architecture must follow:

```text
Stable error code
        +
Correct HTTP status
        +
Safe human message
        +
Structured details
        +
Field errors when applicable
        +
Request correlation ID
        +
Explicit retryability
        +
Frontend recovery behavior
        +
Automated tests
```

The most important rule is:

> Errors are part of the API contract, not incidental strings returned by the backend.

Any change to an error code, response shape, HTTP mapping, or retry semantics must be treated as an API contract change and propagated through backend, OpenAPI, frontend, tests, and traceability.
