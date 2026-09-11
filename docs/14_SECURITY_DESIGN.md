# 14_SECURITY_DESIGN.md

# 1. Document Information

| Field | Value |
|---|---|
| Document ID | 14 |
| Document Name | Security Design Specification |
| Project | Xây dựng Hệ thống quản lý hoạt động Hợp tác xã nông nghiệp và số hóa hồ sơ đánh giá, phân hạng OCOP |
| Previous Documents | 01 → 13 |
| Primary Inputs | 07_BUSINESS_REQUIREMENTS.md, 08_FUNCTIONAL_REQUIREMENTS.md, 09_USE_CASES_FINAL.md, 10_DOMAIN_MODEL.md, 11_DATABASE_DESIGN_FINAL.md, 12_API_SPECIFICATION.md, 13_SYSTEM_ARCHITECTURE.md |
| Status | BASELINE SECURITY DESIGN – PENDING SECURITY VALIDATION |
| Security Boundary | Nginx → Backend → PostgreSQL / Object Storage |
| Main Principles | Least Privilege, RBAC, Data Scope Isolation, SoD, Auditability, Secure File Access, Version Preservation |

> Tài liệu này chuyển các yêu cầu bảo mật đã có trong tài liệu nghiệp vụ/chức năng thành thiết kế bảo mật ở mức hệ thống. Các điểm nguồn đánh dấu `PROPOSED`, `TO_VERIFY`, `INFERRED` hoặc chưa đủ căn cứ không được coi là quy định pháp lý đã xác nhận.

---

# 2. Security Objectives

Hệ thống phải bảo vệ:

1. Tài khoản và phiên đăng nhập.
2. Quyền truy cập chức năng.
3. Phạm vi dữ liệu theo HTX, hồ sơ và phiên đánh giá.
4. Minh chứng OCOP và file nội bộ.
5. Điểm đánh giá độc lập của evaluator.
6. Dữ liệu tài chính và giao dịch kho.
7. Workflow state và dữ liệu đã khóa.
8. Audit trail.
9. Dữ liệu lịch sử và các phiên bản.
10. Backup và khả năng phục hồi.

Mục tiêu bảo mật:

```text
Confidentiality
      +
Integrity
      +
Availability
      +
Accountability
      +
Traceability
```

---

# 3. Security Principles

## 3.1 Least Privilege

Người dùng chỉ được cấp:

```text
Role
  +
Permission
  +
Data Scope
```

đủ để thực hiện công việc.

Không cấp quyền quản trị kỹ thuật đồng nghĩa với quyền phê duyệt nghiệp vụ.

---

## 3.2 Backend Is the Security Boundary

Frontend chỉ hỗ trợ UX.

Mọi kiểm tra quan trọng phải được thực thi tại backend:

```text
Authentication
Authorization
Data Scope
Workflow State
Business Preconditions
File Access
```

Không tin:

- role do client gửi;
- `cooperative_id` do client tự chọn;
- `user_id` do client tự khai báo;
- status do client tự PATCH;
- tổng điểm do client tự tính;
- object URL do client tự tạo.

---

## 3.3 Deny by Default

Nếu không có bằng chứng rằng actor được phép:

```text
DENY
```

Không dùng:

```text
ALLOW unless explicitly denied
```

---

## 3.4 Fail Closed

Khi authorization service, scope resolution hoặc policy evaluation thất bại ở thao tác nhạy cảm:

```text
DENY
```

Không fallback sang quyền rộng hơn.

---

## 3.5 Defense in Depth

Security được triển khai nhiều lớp:

```text
TLS
 ↓
Authentication
 ↓
RBAC
 ↓
Data Scope
 ↓
Workflow / SoD
 ↓
Input Validation
 ↓
Database Constraints
 ↓
Object Storage Authorization
 ↓
Audit
```

---

# 4. Threat Model Baseline

Các threat chính:

| Threat | Impact | Main Control |
|---|---|---|
| Unauthorized login | High | Authentication, lockout, session control |
| Stolen session/token | High | Short-lived token/session, revocation |
| Cross-HTX access | Critical | Data Scope Isolation |
| Evaluator sees unauthorized application | Critical | Assigned Session Scope |
| Evaluator edits another evaluator's score | Critical | Assignment + score ownership + lock |
| SYSTEM_ADMIN bypasses business approval | Critical | SoD + explicit permission |
| Private evidence leaked | Critical | Private object storage + signed URL |
| Malicious file upload | High | MIME/extension/size validation + storage isolation |
| Workflow bypass | Critical | Backend state machine |
| Tampering with historical records | Critical | Immutable/versioned data + audit |
| SQL injection | High | Parameterized queries/ORM + validation |
| XSS | Medium/High | Output encoding + CSP where applicable |
| CSRF | Medium/High | Framework protection / SameSite / token |
| Brute force | Medium/High | Rate limiting + account protection |
| Backup theft | Critical | Encryption/access control |
| Audit manipulation | High | Restricted append-only design |

---

# 5. Authentication Architecture

Baseline flow:

```text
Client
  ↓
HTTPS
  ↓
Login
  ↓
Authentication
  ↓
Authenticated Identity
  ↓
Session / Access Token
  ↓
API
```

Authentication must verify:

```text
identity
+
credential
+
account status
```

If account is:

```text
LOCKED
DISABLED
REVOKED
```

the system must reject access.

The exact authentication technology (Laravel Sanctum, OAuth/OIDC, FastAPI security stack, etc.) is an implementation decision and must remain consistent with the final backend choice.

---

# 6. Password Security

If the system manages passwords directly:

- never store plaintext passwords;
- use a modern password hashing algorithm supported by the selected framework;
- use per-password salt;
- never log passwords;
- never return password hashes through API responses;
- invalidate/revoke relevant sessions after sensitive credential changes.

Password reset tokens must be:

```text
random
single-use
short-lived
non-guessable
```

---

# 7. Multi-Factor Authentication

The current upstream specification treats 2FA as a security capability, with stronger expectations for sensitive roles.

Baseline:

```text
SYSTEM_ADMIN
EVALUATOR
```

may require 2FA according to final security policy.

2FA enforcement must be configurable by role/policy rather than hard-coded into unrelated business modules.

> Exact mandatory role list is a policy item to validate before production.

---

# 8. Session / Token Security

The selected mechanism must support:

```text
expiration
revocation
logout
account lock response
credential-change invalidation
```

If cookie-based sessions are used:

```text
Secure
HttpOnly
SameSite
```

must be configured appropriately.

If bearer tokens are used:

```text
short-lived access token
+
secure refresh/revocation strategy
```

must be implemented.

Never store long-lived sensitive credentials in URLs.

---

# 9. Account Lifecycle

Baseline:

```text
PENDING / INVITED
       ↓
ACTIVE
       ↓
LOCKED
       ↓
DISABLED
```

Possible transitions:

```text
PENDING → ACTIVE
ACTIVE → LOCKED
LOCKED → ACTIVE
ACTIVE → DISABLED
```

Exact lifecycle values are implementation/configuration details.

When an account becomes `LOCKED`:

```text
existing active sessions
       ↓
must be revoked / invalidated according to auth mechanism
```

This requirement is explicitly represented in the functional security baseline.

---

# 10. RBAC Architecture

The system uses:

```text
User
  ↓
Role Assignment
  ↓
Permissions
  ↓
Data Scope
```

Permission naming convention:

```text
<RESOURCE>.<ACTION>
```

Examples from upstream:

```text
OCOP_APPLICATION.CREATE
OCOP_EVALUATION.SCORE
ROLE.MANAGE
USER.MANAGE
OCOP_EVIDENCE.UPLOAD
```

Authorization decision:

```text
ALLOW =
Valid Identity
AND
Account Active
AND
Has Permission
AND
Valid Data Scope
AND
Valid Workflow State
AND
Business Rules Pass
```

---

# 11. Role Model

Baseline role catalog contains the following business/system roles:

```text
HTX_OWNER
HTX_STAFF
ACCOUNTANT
STOREKEEPER
AGRICULTURE_OFFICER
OCOP_PREPARER
RECEIVING_REVIEWER
EVIDENCE_REVIEWER
EVALUATOR
COUNCIL_MEMBER
COUNCIL_SECRETARY
AUTHORITY
CRITERIA_ADMIN
SYSTEM_ADMIN
REPORT_VIEWER
AUDITOR
```

Some of these are role specializations represented in the upstream documents.

The final implementation must avoid granting broad permissions merely because two roles are technically assigned to the same person.

---

# 12. Data Scope Isolation

Data scope is mandatory in addition to RBAC.

Core scopes:

```text
GLOBAL
OWN_HTX
ASSIGNED_APPLICATION
ASSIGNED_EVALUATION_SESSION
AUTHORITY_SCOPE
AUTHORIZED_SCOPE
```

## 12.1 Own HTX Scope

User belonging to HTX A:

```text
can access → HTX A
cannot access → HTX B
```

This must hold even if the user changes:

```text
URL ID
query parameter
request body
```

---

## 12.2 Assigned Evaluation Session Scope

Evaluator can access:

```text
assigned evaluation session
```

but not arbitrary sessions.

Example:

```text
Evaluator E1
  ↓
Session S1
```

must not imply access to:

```text
Session S2
Session S3
```

---

## 12.3 Authority Scope

Authority-level scope may restrict access according to administrative jurisdiction.

This remains dependent on the final confirmed administrative workflow and should not be hard-coded before validation.

---

# 13. Scope Enforcement Pattern

Every sensitive resource request should conceptually pass:

```text
authorize(user, action, resource)
```

which evaluates:

```text
Identity
Role
Permission
Scope
Resource Ownership
Workflow State
SoD
```

Example:

```text
GET /api/v1/members/{member_id}
```

must perform:

```text
member exists
AND
user authenticated
AND
user has member.read
AND
member.cooperative_id ∈ user's authorized scope
```

Do not use:

```text
find(member_id)
```

as the only authorization check.

---

# 14. Separation of Duties

SoD prevents incompatible responsibilities from being combined.

Core baseline:

```text
person creating/preparing an OCOP application
          X
person evaluating that application
```

and:

```text
person preparing/submitting
          X
person approving own final result
```

The upstream Use Case specification explicitly requires preventing a user from preparing a dossier and simultaneously evaluating or approving their own dossier.

SoD must be evaluated at assignment and operation time.

---

# 15. SYSTEM_ADMIN Boundary

`SYSTEM_ADMIN` is a technical administration role.

It does NOT automatically receive:

```text
OCOP_EVALUATION.SCORE
OCOP_DECISION.APPROVE
business approval
```

unless those permissions are explicitly and legitimately assigned under the final policy.

This prevents:

```text
technical administrator
       ↓
business decision bypass
```

---

# 16. Evaluator Isolation

Evaluator data is sensitive.

Baseline controls:

1. Evaluator sees only assigned evaluation sessions.
2. Evaluator sees only permitted application/evidence data.
3. Evaluator score belongs to its assignment.
4. Evaluator cannot overwrite another evaluator's score.
5. Locked scores cannot be edited except through an explicitly authorized workflow.
6. Consolidated score is a separate result and must not overwrite individual scores.

Security invariant:

```text
EvaluatorScore
  belongs to
EvaluatorAssignment
  belongs to
EvaluationSession
```

---

# 17. Workflow Security

Workflow state is a security control.

Example:

```text
SUBMITTED
```

means ordinary HTX editing is restricted.

If:

```text
NEED_REVISION
```

is officially created:

```text
controlled edit access
```

may be reopened.

After resubmission:

```text
lock again
```

The backend must reject illegal transitions.

Do not implement:

```text
PATCH /application/{id}
{
  "status": "APPROVED"
}
```

as a generic unrestricted operation.

---

# 18. Object Storage Security

Evidence files are private by default.

Architecture:

```text
Client
  ↓
Backend Authorization
  ↓
Object Storage Adapter
  ↓
Private MinIO/S3
```

Do not expose:

```text
MINIO_ACCESS_KEY
MINIO_SECRET_KEY
```

to browsers.

---

# 19. Signed URL Policy

For file download:

```text
request
 ↓
authenticate
 ↓
authorize evidence
 ↓
generate short-lived signed URL
 ↓
client downloads
```

The signed URL should:

- expire quickly;
- be scoped to the requested object;
- not expose permanent credentials;
- not bypass application-level authorization.

The current functional baseline explicitly requires signed-URL protection for evidence files.

---

# 20. File Upload Security

Current functional requirements define the baseline evidence formats as:

```text
application/pdf
image/jpeg
image/png
```

and maximum:

```text
50 MB / file
```

These are requirements from the existing functional specification and should be configurable rather than scattered throughout code.

Validation must include:

```text
MIME validation
extension validation
size validation
file integrity handling
storage isolation
authorization
```

Do not trust the filename or client-declared MIME type alone.

---

# 21. File Storage Isolation

Recommended object key structure:

```text
cooperatives/{coop_id}/applications/{application_id}/evidence/{evidence_id}/versions/{version}/file
```

Benefits:

```text
tenant separation
application separation
evidence version separation
traceability
```

Object keys should not be treated as authorization by themselves.

Authorization remains a backend responsibility.

---

# 22. Evidence Version Security

Evidence replacement must create a new version:

```text
v1
 ↓
v2
 ↓
v3
```

Do not overwrite:

```text
v1
```

with:

```text
v2
```

Each version should preserve:

```text
checksum
file size
MIME type
uploader
timestamp
replacement reason
object reference
```

Historical versions remain available to authorized actors according to retention policy.

---

# 23. Data Integrity

Security includes integrity protection.

Important immutable or controlled data:

```text
finalized financial transactions
stock transactions
evaluator scores after lock
published criteria versions
historical evidence versions
final decisions
audit events
```

If correction is needed, prefer:

```text
reversal
adjustment
new version
new workflow action
```

instead of destructive overwrite.

---

# 24. OCOP Criteria Security

Criteria are policy-sensitive.

Architecture:

```text
Criteria Version
       ↓
Scoring Rules
       ↓
Application
       ↓
Evaluation
```

Once an application uses a criteria version:

```text
historical application
        ↓
retains original criteria version
```

Do not silently replace its criteria with a newer version.

`CRITERIA_ADMIN` should not be able to alter a published version that is already used by historical applications.

---

# 25. Evaluation Security

Evaluator score entry:

```text
Authenticated Evaluator
        ↓
Assigned Session
        ↓
Assigned Application
        ↓
Indicator
        ↓
Score
        ↓
Validation
        ↓
Save
        ↓
Lock
        ↓
Audit
```

Validation:

```text
0 ≤ score ≤ indicator.maxScore
```

The exact scoring rules come from the selected Criteria Version.

Do not allow client-side score manipulation to bypass server-side validation.

---

# 26. Audit Security

Audit is a security mechanism, not merely a reporting feature.

Sensitive events should be recorded, including:

```text
LOGIN
LOGIN_FAILED
LOGOUT
USER_CREATED
USER_LOCKED
USER_ROLE_ASSIGNED
PERMISSION_CHANGED
SCOPE_CHANGED
EVIDENCE_UPLOADED
EVIDENCE_REPLACED
EVIDENCE_VERIFIED
EVIDENCE_REJECTED
SECURITY_SCOPE_VIOLATION_ATTEMPT
WORKFLOW_TRANSITION
SCORE_LOCKED
DECISION_RECORDED
DOCUMENT_GENERATED
```

Exact event catalog can be expanded during implementation.

---

# 27. Audit Integrity

Audit events should be:

```text
append-only
```

Business users must not:

```text
UPDATE audit
DELETE audit
```

Access to audit administration should be restricted.

For higher assurance, future versions may add:

```text
hash chaining
tamper-evident storage
external log sink
```

These are enhancements, not current mandatory requirements.

---

# 28. Security Logging

Application logs should not contain:

```text
passwords
access tokens
refresh tokens
MinIO secret keys
sensitive document contents
```

Log security-relevant context such as:

```text
request_id
actor_id
action
resource
result
timestamp
```

Sensitive PII should be minimized in logs.

---

# 29. API Security

Every protected endpoint must define:

```text
Authentication requirement
Permission
Data Scope
Workflow State
Validation
Audit requirement
```

Example:

```text
POST /api/v1/ocop/applications/{id}/submit
```

requires:

```text
authenticated
AND
OCOP_APPLICATION.SUBMIT
AND
Own HTX / authorized scope
AND
valid workflow state
AND
completeness validation
```

---

# 30. Input Validation

Validate on backend:

```text
type
length
format
range
enum
relationship
ownership
state
business invariant
```

Examples:

```text
amount > 0
quantity > 0
score within maxScore
end_date >= start_date
referenced member belongs to authorized HTX
referenced indicator belongs to application's criteria version
```

Validation failure must not partially mutate critical transactions.

---

# 31. Injection Protection

Backend must use:

```text
parameterized queries
ORM/query builder safely
validated dynamic filters
```

Avoid constructing SQL from raw user input.

For document/report generation, template variables must also be treated as untrusted data.

---

# 32. Web Security

Baseline controls:

```text
HTTPS only
secure headers
CORS allowlist
CSRF protection where applicable
XSS-safe output handling
clickjacking protection
content-type sniffing protection
rate limiting
```

CSP and exact security-header values should be finalized with deployment configuration.

---

# 33. Rate Limiting

Rate limiting should apply especially to:

```text
login
OTP/2FA verification if used
password reset
file upload
signed URL issuance
sensitive API endpoints
report generation
```

Exact thresholds are deployment/security configuration and should not be hard-coded into business logic.

---

# 34. Database Security

PostgreSQL:

```text
not publicly exposed
```

Application connects using a dedicated database account.

Principle:

```text
minimum required database privileges
```

Production database credentials must not be committed to Git.

Sensitive database backups require access control and encryption appropriate to deployment.

---

# 35. Row-Level Security

Application-level scope enforcement is mandatory.

PostgreSQL RLS may be added as defense in depth:

```text
Application Authorization
        +
PostgreSQL RLS
```

RLS should not be introduced without a clear session/context propagation design, because an incorrect RLS implementation can create either data leakage or unexpected denial.

---

# 36. Secrets Management

Secrets include:

```text
database credentials
MinIO credentials
authentication secrets
application keys
mail credentials
signing keys
```

Rules:

```text
never commit to Git
never put in frontend bundle
never return through API
never log
```

Development may use `.env`.

Production should use an appropriate secret-management mechanism.

---

# 37. Encryption

Baseline:

```text
in transit → HTTPS/TLS
at rest → storage/database/backup encryption according to deployment capability
```

Especially protect:

```text
OCOP evidence
database backups
object-storage backups
authentication secrets
```

Exact encryption algorithms/key-management architecture should be finalized in deployment/security hardening.

---

# 38. Backup Security

Backup includes:

```text
PostgreSQL
+
MinIO/Object Storage
```

Backup must have:

```text
restricted access
retention policy
integrity verification
restore testing
```

A backup that cannot be restored is not considered a reliable backup.

---

# 39. Recovery Security

Restore procedure:

```text
Incident
  ↓
Authorize restore
  ↓
Restore database
  ↓
Restore object storage
  ↓
Verify consistency
  ↓
Verify application
  ↓
Audit recovery
```

Do not allow ordinary business users to execute unrestricted production restore operations.

---

# 40. Security of Generated Documents

Generated PDF/DOCX may contain sensitive:

```text
member information
financial information
OCOP evidence references
evaluation information
decision data
```

Therefore:

```text
authorize generation
authorize download
store privately
audit generation/download where policy requires
```

Generated files must not become publicly accessible merely because a report was created.

---

# 41. Privacy / Data Minimization

Only collect and expose data needed for the business purpose.

API responses should avoid returning unnecessary:

```text
PII
internal identifiers
security metadata
credentials
storage secrets
```

Different actors should receive different response fields where necessary.

---

# 42. Security by Workflow State

Security matrix concept:

| State | HTX Edit | Reviewer | Evaluator | Authority |
|---|---:|---:|---:|---:|
| DRAFT | Yes | Limited | No | No |
| SUBMITTED | No | Yes | No/No assignment | No |
| NEED_REVISION | Controlled | Yes | No | No |
| RESUBMITTED | No | Yes | No/No assignment | No |
| EVALUATING | No | Read/controlled | Assigned only | Limited |
| CONSOLIDATED | No | Read | Read as allowed | Yes/limited |
| APPROVED | No | Read | Read | Yes |

> Đây là security baseline, không phải quy định pháp lý. Quyền cuối cùng phải khớp workflow đã xác nhận.

---

# 43. Security Acceptance Criteria

## Authentication

- [ ] Account must be authenticated before protected access.
- [ ] Locked/disabled accounts cannot access protected APIs.
- [ ] Sessions/tokens can be revoked.
- [ ] Passwords are never stored plaintext.
- [ ] Sensitive roles can be protected with 2FA according to policy.

## Authorization

- [ ] Every protected endpoint checks permission.
- [ ] Every tenant resource checks data scope.
- [ ] Evaluator access is assignment-based.
- [ ] SYSTEM_ADMIN cannot automatically bypass business authorization.
- [ ] SoD conflicts are rejected.

## Evidence

- [ ] Private storage.
- [ ] Allowed MIME/type validation.
- [ ] Maximum file size enforced.
- [ ] Signed URL access.
- [ ] Version history preserved.
- [ ] Unauthorized download rejected.

## Workflow

- [ ] Illegal state transitions rejected.
- [ ] Submitted/evaluating data cannot be edited by unauthorized actors.
- [ ] NEED_REVISION reopens editing only through authorized workflow.
- [ ] Resubmission locks data again.

## Audit

- [ ] Security-sensitive events audited.
- [ ] Audit records are append-only.
- [ ] Unauthorized users cannot modify audit.

---

# 44. Security Traceability

| Security Design | Upstream Requirement |
|---|---|
| Authentication | BRQ-SEC-001 / FR-SEC-001 |
| RBAC | BRQ-SEC-002 / FR-SEC-002 |
| Data Scope | BRQ-SEC-003 / FR-SEC-003 |
| SoD | BRQ-SEC-004 / FR-SEC-004 |
| Evidence access | BRQ-EVIDENCE-005 / FR-EVID-005 |
| Workflow lock | BRQ-WORKFLOW-004 / FR-WKFL-004 |
| Audit | BRQ-AUDIT-001/002 and related FR |
| Backup/recovery | BRQ-SYS-002 / UC-SYS-01 |
| Evaluator isolation | UC-OCOP-05 + RBAC/Data Scope |
| Version preservation | BR-VERSION rules + Domain Model |

---

# 45. Security Decisions

## SEC-ADR-001 — Backend Authorization

**Decision:** Authorization is enforced at backend.

**Reason:** Frontend cannot be trusted as a security boundary.

## SEC-ADR-002 — RBAC + Data Scope

**Decision:** RBAC alone is insufficient.

**Reason:** The same role may access different data depending on HTX, assignment, session or authority scope.

## SEC-ADR-003 — Private Evidence Storage

**Decision:** Evidence is private by default and accessed through authorized signed URLs.

**Reason:** OCOP evidence may contain sensitive documents.

## SEC-ADR-004 — SoD

**Decision:** Incompatible roles/actions must be separated.

**Reason:** Prevent self-evaluation/self-approval and technical-admin business bypass.

## SEC-ADR-005 — Version Preservation

**Decision:** Historical criteria, evidence and evaluation data are preserved.

**Reason:** Security includes integrity and traceability of historical records.

---

# 46. Open Security Questions

| ID | Question | Priority |
|---|---|---|
| SEC-OQ-001 | Cơ chế authentication chính thức: Sanctum/OAuth/OIDC/FastAPI JWT? | High |
| SEC-OQ-002 | 2FA bắt buộc cho chính xác những role nào? | High |
| SEC-OQ-003 | Có yêu cầu chữ ký số trên hồ sơ điện tử không? | High |
| SEC-OQ-004 | Chính sách retention/xóa dữ liệu và evidence là bao lâu? | High |
| SEC-OQ-005 | Có yêu cầu mã hóa application-level cho trường PII nhạy cảm không? | Medium |
| SEC-OQ-006 | RPO/RTO chính thức là bao nhiêu? | High |
| SEC-OQ-007 | Audit cần immutable storage/hash-chain ở mức nào? | Medium |
| SEC-OQ-008 | Chính sách CORS/domain production chính thức? | Medium |
| SEC-OQ-009 | Có yêu cầu virus/malware scanning cho file upload không? | Medium |
| SEC-OQ-010 | Cơ chế quản lý secret production nào sẽ được sử dụng? | Medium |

---

# 47. Security Implementation Priority

```text
P0
├── HTTPS
├── Authentication
├── RBAC
├── Data Scope Isolation
├── SoD
├── Workflow Enforcement
├── Private Evidence Storage
├── Signed URLs
├── File Validation
├── Audit
└── Backup Protection

P1
├── 2FA
├── Rate Limiting hardening
├── Security Headers/CSP
├── Malware Scanning
├── RLS defense in depth
└── Centralized monitoring

P2
├── Tamper-evident audit
├── Advanced SIEM
├── Advanced key management
└── Additional anomaly detection
```

---

# 48. Definition of Done

- [ ] Authentication boundary defined.
- [ ] Account lifecycle defined.
- [ ] RBAC model defined.
- [ ] Permission naming defined.
- [ ] Data Scope defined.
- [ ] Evaluator isolation defined.
- [ ] SoD defined.
- [ ] SYSTEM_ADMIN boundary defined.
- [ ] Workflow security defined.
- [ ] Evidence storage security defined.
- [ ] Signed URL policy defined.
- [ ] File upload validation defined.
- [ ] Evidence version security defined.
- [ ] Criteria version security defined.
- [ ] Audit security defined.
- [ ] Database security baseline defined.
- [ ] Secrets handling defined.
- [ ] Backup security defined.
- [ ] Generated-document security defined.
- [ ] Security acceptance criteria defined.
- [ ] Open security questions documented.

---

# 49. Next Documents

```text
13_SYSTEM_ARCHITECTURE.md
          ↓
14_SECURITY_DESIGN.md
          ↓
15_AUTHORIZATION_MATRIX.md
          ↓
16_WORKFLOW_SPECIFICATION.md
          ↓
17_OPENAPI_SPECIFICATION.md
          ↓
18_FRONTEND_ARCHITECTURE.md
          ↓
19_BACKEND_ARCHITECTURE.md
          ↓
20_DEPLOYMENT_SPECIFICATION.md
          ↓
Implementation
```

`15_AUTHORIZATION_MATRIX.md` phải dùng chính các role, permission, scope và SoD rule trong tài liệu này; không tự tạo một hệ thống role khác.
