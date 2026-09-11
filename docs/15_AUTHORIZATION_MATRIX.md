# 15_AUTHORIZATION_MATRIX.md

# 1. Document Information

| Field | Value |
|---|---|
| Document ID | 15 |
| Document Name | Authorization Matrix Specification |
| Project | Xây dựng Hệ thống quản lý hoạt động Hợp tác xã nông nghiệp và số hóa hồ sơ đánh giá, phân hạng OCOP |
| Previous Documents | 01 → 14 |
| Primary Inputs | 05_ACTORS_AND_ROLES.md, 08_FUNCTIONAL_REQUIREMENTS.md, 09_USE_CASES_FINAL.md, 13_SYSTEM_ARCHITECTURE.md, 14_SECURITY_DESIGN.md |
| Status | BASELINE AUTHORIZATION MATRIX – PENDING VALIDATION |
| Authorization Model | RBAC + Data Scope + Workflow State + Separation of Duties |
| Core Principle | Deny by Default / Least Privilege |

> Ma trận này cụ thể hóa authorization ở mức role/permission/scope. Đây không phải là căn cứ để tự tạo thêm nghiệp vụ hoặc quy định pháp lý chưa có trong các tài liệu upstream.

---

# 2. Authorization Model

Quyết định truy cập được xác định theo:

```text
ALLOW =
Authenticated
AND Account Active
AND Permission Granted
AND Data Scope Valid
AND Workflow State Valid
AND SoD Valid
AND Business Preconditions Pass
```

Nếu bất kỳ điều kiện bắt buộc nào không đạt:

```text
DENY
```

---

# 3. Authorization Dimensions

Hệ thống không chỉ kiểm tra role.

```text
WHO?
  ↓
Role / Permission

WHICH DATA?
  ↓
Data Scope

WHEN?
  ↓
Workflow State

CAN THIS PERSON DO IT?
  ↓
Separation of Duties

IS THE OPERATION VALID?
  ↓
Business Preconditions
```

---

# 4. Permission Naming Convention

Chuẩn:

```text
<RESOURCE>.<ACTION>
```

Ví dụ:

```text
USER.READ
USER.CREATE
USER.UPDATE
USER.LOCK
ROLE.MANAGE

MEMBER.READ
MEMBER.CREATE
MEMBER.UPDATE

OCOP_APPLICATION.READ
OCOP_APPLICATION.CREATE
OCOP_APPLICATION.UPDATE
OCOP_APPLICATION.SUBMIT

OCOP_EVIDENCE.READ
OCOP_EVIDENCE.UPLOAD
OCOP_EVIDENCE.REPLACE
OCOP_EVIDENCE.VERIFY

OCOP_EVALUATION.READ
OCOP_EVALUATION.SCORE
OCOP_EVALUATION.LOCK
OCOP_EVALUATION.CONSOLIDATE

OCOP_DECISION.READ
OCOP_DECISION.RECORD
OCOP_DECISION.APPROVE
```

Permission phải được quản lý tập trung, không hard-code scattered trong controller.

---

# 5. Permission Actions

Các action baseline:

| Action | Meaning |
|---|---|
| READ | Xem dữ liệu |
| CREATE | Tạo mới |
| UPDATE | Cập nhật |
| DELETE | Xóa khi business rule cho phép |
| SUBMIT | Gửi/chuyển sang workflow tiếp theo |
| REVIEW | Kiểm tra/review |
| VERIFY | Xác minh |
| REJECT | Từ chối |
| RETURN | Trả lại/chuyển yêu cầu chỉnh sửa |
| SCORE | Chấm điểm |
| LOCK | Khóa dữ liệu |
| CONSOLIDATE | Tổng hợp |
| RECORD | Ghi nhận kết quả |
| APPROVE | Phê duyệt |
| MANAGE | Quản trị |
| EXPORT | Kết xuất |
| DOWNLOAD | Tải xuống |
| ASSIGN | Phân công |
| REVOKE | Thu hồi |
| RESTORE | Khôi phục |

Không phải resource nào cũng được phép dùng mọi action.

---

# 6. Data Scope Catalog

| Scope | Meaning |
|---|---|
| GLOBAL | Toàn hệ thống |
| OWN_HTX | HTX mà user được phân quyền |
| AUTHORIZED_SCOPE | Phạm vi hành chính/nghiệp vụ được ủy quyền |
| ASSIGNED_APPLICATION | Hồ sơ OCOP được giao |
| ASSIGNED_EVALUATION_SESSION | Phiên đánh giá được phân công |
| OWN_ASSIGNMENT | Bản ghi assignment thuộc actor |
| OWN_RECORD | Bản ghi do actor tạo nếu business rule cho phép |
| READ_ONLY_SCOPE | Phạm vi chỉ được xem |
| REPORT_SCOPE | Phạm vi dữ liệu mà user được phép lập/xem báo cáo |

Scope thực tế phải được backend resolve từ identity + assignment + organizational relationship; không tin `scope` do client gửi.

---

# 7. Role Catalog

Baseline role:

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

Một user có thể có nhiều role nếu policy cho phép.

Tuy nhiên việc có nhiều role không tự động vượt qua:

```text
SoD
workflow restrictions
data scope
```

---

# 8. High-Level Role Scope Matrix

| Role | Default Scope |
|---|---|
| HTX_OWNER | OWN_HTX |
| HTX_STAFF | OWN_HTX |
| ACCOUNTANT | OWN_HTX |
| STOREKEEPER | OWN_HTX |
| AGRICULTURE_OFFICER | OWN_HTX |
| OCOP_PREPARER | OWN_HTX |
| RECEIVING_REVIEWER | AUTHORIZED_SCOPE / assigned applications |
| EVIDENCE_REVIEWER | AUTHORIZED_SCOPE / assigned applications |
| EVALUATOR | ASSIGNED_EVALUATION_SESSION |
| COUNCIL_MEMBER | Assigned council/evaluation scope |
| COUNCIL_SECRETARY | Assigned council/evaluation scope |
| AUTHORITY | AUTHORIZED_SCOPE |
| CRITERIA_ADMIN | GLOBAL policy/criteria scope |
| SYSTEM_ADMIN | GLOBAL technical administration scope |
| REPORT_VIEWER | REPORT_SCOPE |
| AUDITOR | Authorized read/audit scope |

---

# 9. Core CRUD Matrix

Legend:

```text
C = Create
R = Read
U = Update
D = Delete
- = Deny
S = Special workflow action
```

## 9.1 Cooperative / Member

| Role | Cooperative | Member |
|---|---|---|
| HTX_OWNER | R/U | C/R/U |
| HTX_STAFF | R | C/R/U |
| ACCOUNTANT | R | R |
| STOREKEEPER | R | R |
| AGRICULTURE_OFFICER | R | R |
| OCOP_PREPARER | R | R |
| RECEIVING_REVIEWER | R authorized | R authorized |
| EVIDENCE_REVIEWER | R authorized | R authorized |
| EVALUATOR | - / R as permitted | R as permitted |
| COUNCIL_MEMBER | - / R as permitted | - / R as permitted |
| COUNCIL_SECRETARY | - / R as permitted | - / R as permitted |
| AUTHORITY | R authorized | R authorized |
| CRITERIA_ADMIN | - | - |
| SYSTEM_ADMIN | C/R/U/D technical | C/R/U/D technical |
| REPORT_VIEWER | R report scope | R report scope |
| AUDITOR | R authorized | R authorized |

> SYSTEM_ADMIN CRUD ở đây chỉ là technical administration. Không có nghĩa SYSTEM_ADMIN được phép tự ý thực hiện business approval.

---

# 10. Agriculture / Production Matrix

Resources:

```text
production_units
farm_plots
crop_seasons
production_batches
farming_logs
harvests
lots
```

| Role | Read | Create | Update | Delete |
|---|---:|---:|---:|---:|
| HTX_OWNER | ✓ | ✓ | ✓ | Controlled |
| HTX_STAFF | ✓ | ✓ | ✓ | Controlled |
| AGRICULTURE_OFFICER | ✓ | ✓ | ✓ | Controlled |
| OCOP_PREPARER | ✓ | Limited | Limited | - |
| ACCOUNTANT | ✓ | - | - | - |
| STOREKEEPER | ✓ | - | - | - |
| REVIEWER roles | Authorized | - | - | - |
| EVALUATOR | Assigned/read | - | - | - |
| AUTHORITY | Authorized | - | - | - |
| SYSTEM_ADMIN | Technical | Technical | Technical | Technical |
| REPORT_VIEWER | Report scope | - | - | - |
| AUDITOR | Authorized | - | - | - |

---

# 11. Inventory / Warehouse Matrix

Resources:

```text
materials
warehouses
stock_receipts
stock_issues
stock_counts
inventory_ledger
```

| Role | Materials | Receipt | Issue | Count |
|---|---|---|---|---|
| HTX_OWNER | R/U | R | R | R |
| HTX_STAFF | R | C/R/U | C/R/U | C/R/U |
| STOREKEEPER | C/R/U | C/R/U | C/R/U | C/R/U |
| ACCOUNTANT | R | R | R | R |
| AGRICULTURE_OFFICER | R | R | R | R |
| OCOP_PREPARER | R | R | R | R |
| Reviewer | Authorized R | Authorized R | Authorized R | Authorized R |
| EVALUATOR | Assigned R | Assigned R | Assigned R | Assigned R |
| AUTHORITY | Authorized R | Authorized R | Authorized R | Authorized R |
| SYSTEM_ADMIN | Technical | Technical | Technical | Technical |
| REPORT_VIEWER | Report R | Report R | Report R | Report R |
| AUDITOR | Authorized R | Authorized R | Authorized R | Authorized R |

Inventory mutation must be constrained by warehouse scope and transaction rules.

---

# 12. Finance Matrix

Resources:

```text
cash_transactions
receivables
payables
settlements
surplus_distribution_plans
surplus_distribution_items
```

| Role | Read | Create | Update | Approve/Finalize |
|---|---:|---:|---:|---:|
| HTX_OWNER | ✓ | Controlled | Controlled | ✓ if assigned |
| ACCOUNTANT | ✓ | ✓ | ✓ | No self-approval |
| HTX_STAFF | Limited | Limited | Limited | - |
| STOREKEEPER | Limited | - | - | - |
| AGRICULTURE_OFFICER | Limited | - | - | - |
| OCOP_PREPARER | Read as needed | - | - | - |
| AUTHORITY | Authorized | - | - | As authorized |
| AUDITOR | R | - | - | - |
| REPORT_VIEWER | Report R | - | - | - |
| SYSTEM_ADMIN | Technical | Technical | Technical | Not automatically granted |

Financial correction should prefer adjustment/reversal rather than destructive overwrite.

---

# 13. OCOP Criteria Matrix

Resources:

```text
criteria_sets
criteria_versions
criteria_groups
criteria
indicators
scoring_rules
```

| Role | Read | Create Draft | Update Draft | Publish/Manage |
|---|---:|---:|---:|---:|
| CRITERIA_ADMIN | ✓ | ✓ | ✓ | ✓ |
| AUTHORITY | ✓ | - | - | Authorized |
| OCOP_PREPARER | ✓ | - | - | - |
| REVIEWER | ✓ | - | - | - |
| EVALUATOR | ✓ | - | - | - |
| COUNCIL_MEMBER | ✓ | - | - | - |
| COUNCIL_SECRETARY | ✓ | - | - | - |
| HTX roles | Read relevant | - | - | - |
| SYSTEM_ADMIN | Technical only | Technical | Technical | Not business approval |
| AUDITOR | Authorized R | - | - | - |

Published criteria versions must not be destructively edited after use by historical applications.

---

# 14. OCOP Application Matrix

Resources:

```text
ocop_applications
application_items
application_status
```

| Role | Read | Create | Update | Submit | Review |
|---|---:|---:|---:|---:|---:|
| OCOP_PREPARER | ✓ | ✓ | ✓ while editable | ✓ | - |
| HTX_OWNER | ✓ | Controlled | ✓ | ✓ if authorized | - |
| HTX_STAFF | ✓ | Controlled | Controlled | Controlled | - |
| RECEIVING_REVIEWER | Assigned | - | Controlled | - | ✓ |
| EVIDENCE_REVIEWER | Assigned | - | Controlled review data | - | ✓ |
| EVALUATOR | Assigned | - | - | - | Evaluation only |
| COUNCIL_MEMBER | Assigned | - | - | - | Council actions |
| COUNCIL_SECRETARY | Assigned | - | - | - | Council actions |
| AUTHORITY | Authorized | - | - | - | ✓/authorized |
| CRITERIA_ADMIN | Read policy | - | - | - | - |
| SYSTEM_ADMIN | Technical | Technical | Technical | Technical | Not automatic |
| REPORT_VIEWER | Report R | - | - | - | - |
| AUDITOR | Authorized R | - | - | - | Audit |

---

# 15. OCOP Evidence Matrix

Resources:

```text
evidence
evidence_versions
evidence_reviews
```

| Role | Read | Upload | Replace | Verify | Reject | Download |
|---|---:|---:|---:|---:|---:|---:|
| OCOP_PREPARER | Own HTX | ✓ | ✓ while editable | - | - | ✓ |
| HTX_OWNER | Own HTX | ✓ if authorized | ✓ if editable | - | - | ✓ |
| RECEIVING_REVIEWER | Assigned | - | - | ✓ | ✓ | ✓ |
| EVIDENCE_REVIEWER | Assigned | - | Controlled | ✓ | ✓ | ✓ |
| EVALUATOR | Assigned session | - | - | - | - | ✓ if authorized |
| COUNCIL_MEMBER | Assigned | - | - | - | - | ✓ if authorized |
| COUNCIL_SECRETARY | Assigned | - | - | - | - | ✓ if authorized |
| AUTHORITY | Authorized | - | - | Authorized | Authorized | ✓ |
| CRITERIA_ADMIN | - / policy only | - | - | - | - | - |
| SYSTEM_ADMIN | Technical support only | Technical | Technical | Not business verification | Not business rejection | Technical only |
| REPORT_VIEWER | Report scope | - | - | - | - | Only generated docs allowed |
| AUDITOR | Authorized R | - | - | - | - | Authorized |

Evidence download always requires:

```text
authentication
+
permission
+
data scope
+
application/evaluation authorization
```

---

# 16. Evaluation Session Matrix

Resources:

```text
evaluation_sessions
evaluation_assignments
evaluator_scores
evaluation_results
```

| Role | Session Read | Assign | Score | Lock Score | Consolidate | Result Read |
|---|---:|---:|---:|---:|---:|---:|
| OCOP_PREPARER | Own application only | - | - | - | - | Limited |
| RECEIVING_REVIEWER | Authorized | - | - | - | - | Limited |
| EVALUATOR | Assigned | - | ✓ | ✓ | - | Assigned |
| COUNCIL_MEMBER | Assigned council | -/authorized | As policy | As policy | ✓/authorized | ✓ |
| COUNCIL_SECRETARY | Assigned council | Authorized | - | - | Authorized | ✓ |
| AUTHORITY | Authorized | Authorized | - | - | Authorized | ✓ |
| CRITERIA_ADMIN | Criteria only | - | - | - | - | - |
| SYSTEM_ADMIN | Technical | Technical | Not automatic | Not automatic | Not automatic | Technical |
| AUDITOR | Authorized R | - | - | - | - | R |

Evaluator assignment is a hard scope boundary.

---

# 17. Evaluator Score Ownership

Invariant:

```text
EvaluatorScore
    belongs to
EvaluatorAssignment
    belongs to
EvaluationSession
```

An evaluator may:

```text
READ assigned score
CREATE own assigned score
UPDATE own unlocked score
LOCK own score
```

An evaluator may not:

```text
READ arbitrary session
UPDATE another evaluator's score
LOCK another evaluator's score
change criteria version
change final consolidated result
approve own application
```

---

# 18. Council Matrix

Council-related actions must follow the assigned council/evaluation scope.

## Council Member

Allowed:

```text
READ assigned evaluation materials
READ assigned evidence
perform council action when explicitly permitted
```

Not automatically allowed:

```text
criteria administration
system administration
cross-council access
unassigned application access
```

## Council Secretary

May additionally:

```text
manage permitted council-session administrative data
prepare/record permitted council documentation
```

Exact decision rights depend on final workflow.

---

# 19. Authority Matrix

`AUTHORITY` receives `AUTHORIZED_SCOPE`, not unrestricted `GLOBAL` by default.

Possible actions:

```text
READ authorized applications
REVIEW
RETURN
RECORD
APPROVE
EXPORT
```

Each action remains constrained by:

```text
workflow
assignment/jurisdiction
SoD
policy
```

---

# 20. Workflow Permission Matrix

Baseline:

| Workflow Action | HTX | Reviewer | Evaluator | Council | Authority |
|---|---:|---:|---:|---:|---:|
| Create Draft | ✓ | - | - | - | - |
| Update Draft | ✓ | Controlled | - | - | - |
| Submit | ✓ | - | - | - | - |
| Receive | - | ✓ | - | - | - |
| Return for Revision | - | ✓ | - | ✓/authorized | ✓/authorized |
| Resubmit | ✓ | - | - | - | - |
| Start Evaluation | - | - | ✓/authorized | ✓/authorized | ✓/authorized |
| Score | - | - | ✓ | As policy | - |
| Lock Score | - | - | ✓ | As policy | - |
| Consolidate | - | - | - | ✓/authorized | ✓/authorized |
| Record Decision | - | - | - | ✓/authorized | ✓ |
| Approve | - | - | - | As authorized | ✓ |
| Export Final Dossier | Authorized | Authorized | Authorized | Authorized | Authorized |

---

# 21. Workflow State Access Matrix

| State | HTX Edit | Reviewer | Evaluator | Council | Authority |
|---|---:|---:|---:|---:|---:|
| DRAFT | ✓ | Limited | - | - | - |
| READY_FOR_SUBMISSION | Controlled | - | - | - | - |
| SUBMITTED | - | ✓ | - | - | - |
| IN_REVIEW | - | ✓ | - | - | Authorized |
| NEED_REVISION | ✓ controlled | ✓ | - | - | Authorized |
| RESUBMITTED | - | ✓ | - | - | - |
| READY_FOR_EVALUATION | - | ✓ | Assigned | Assigned | Authorized |
| EVALUATING | - | Read/controlled | Assigned | Assigned | Authorized |
| CONSOLIDATED | - | Read | Read | ✓ | ✓ |
| PENDING_DECISION | - | Read | Read | ✓ | ✓ |
| APPROVED | - | Read | Read | Read | ✓ |
| REJECTED | - | Read | Read | Read | ✓ |

This matrix is a baseline and must be synchronized with `16_WORKFLOW_SPECIFICATION.md`.

---

# 22. Separation of Duties Matrix

Forbidden combinations/actions:

| Actor | Cannot Combine |
|---|---|
| OCOP_PREPARER | Prepare + Evaluate same application |
| OCOP_PREPARER | Prepare + Approve own application |
| EVALUATOR | Evaluate + Approve own evaluated application |
| ACCOUNTANT | Prepare financial transaction + self-approve if SoD requires approval |
| STOREKEEPER | Create stock movement + unrestricted self-audit |
| SYSTEM_ADMIN | Technical administration + automatic business approval |
| CRITERIA_ADMIN | Modify used historical criteria version + silently alter historical evaluations |

The final SoD policy must define whether restrictions apply:

```text
per user
per HTX
per application
per evaluation session
per transaction
```

---

# 23. Role Conflict Matrix

Baseline conflicts:

| Role A | Role B | Conflict |
|---|---|---|
| OCOP_PREPARER | EVALUATOR | High |
| OCOP_PREPARER | AUTHORITY approval role | High |
| EVALUATOR | AUTHORITY approving same dossier | High |
| SYSTEM_ADMIN | Business Approver | High |
| CRITERIA_ADMIN | Historical evaluator result modifier | High |
| ACCOUNTANT | Independent financial approver | Depends on policy |

Conflict does not necessarily mean the database must prohibit assigning both roles globally. The application must at minimum prevent prohibited combinations on the same controlled business object.

---

# 24. System Administrator Matrix

`SYSTEM_ADMIN` may manage technical resources such as:

```text
users
roles
permissions
system configuration
technical diagnostics
```

But must not automatically gain:

```text
OCOP_DECISION.APPROVE
OCOP_EVALUATION.SCORE
business-specific approval
```

unless separately and explicitly authorized.

Technical support operations should be auditable.

---

# 25. Criteria Administrator Matrix

`CRITERIA_ADMIN` owns policy configuration.

Allowed:

```text
create criteria draft
update criteria draft
create criteria version
manage scoring configuration
publish according to authorized workflow
```

Restricted:

```text
modify historical application criteria context
modify locked evaluator score
modify final decision
```

Once a criteria version is used by an application:

```text
version becomes historical context
```

---

# 26. Report Viewer Matrix

`REPORT_VIEWER`:

```text
READ report scope
EXPORT allowed reports
DOWNLOAD generated documents within scope
```

Does not automatically receive:

```text
CREATE
UPDATE
DELETE
APPROVE
SCORE
WORKFLOW transition
```

Reports must not become a side channel to access data outside the user's authorized scope.

---

# 27. Auditor Matrix

`AUDITOR` is primarily read/audit oriented.

Allowed:

```text
READ authorized business records
READ audit events
READ workflow history
READ evidence metadata
READ authorized generated documents
EXPORT audit/report data where permitted
```

Not automatically allowed:

```text
UPDATE business data
DELETE evidence
change score
approve
change workflow
```

---

# 28. Delete Policy

Delete is not a universal CRUD operation.

For transactional/historical data:

```text
prefer no physical delete
```

Instead:

```text
void
reverse
archive
supersede
new version
```

Physical delete may be allowed for draft/reference data only if:

```text
no historical dependency
no audit requirement
no workflow dependency
business policy allows
```

---

# 29. Permission Evaluation Algorithm

Conceptual pseudocode:

```text
authorize(actor, permission, resource):

    if actor.account_status != ACTIVE:
        DENY

    if not actor.hasPermission(permission):
        DENY

    if not scopeAllows(actor, resource):
        DENY

    if not workflowAllows(actor, permission, resource.state):
        DENY

    if violatesSeparationOfDuties(actor, resource, permission):
        DENY

    if not businessPreconditionsPass(resource, permission):
        DENY

    ALLOW
```

This logic belongs to the backend authorization/application layer.

---

# 30. API Authorization Metadata

Every protected endpoint should map to:

```text
endpoint
↓
permission
↓
resource
↓
scope
↓
workflow state
↓
SoD rule
↓
audit event
```

Example:

```text
POST /api/v1/ocop/applications/{id}/submit

Permission:
OCOP_APPLICATION.SUBMIT

Scope:
OWN_HTX

Workflow:
DRAFT / READY_FOR_SUBMISSION

SoD:
actor must be authorized preparer/owner

Audit:
APPLICATION_SUBMITTED
```

---

# 31. Error Semantics

Authorization failure should not reveal unnecessary information.

Recommended external behavior:

```text
401 Unauthorized
```

when identity is missing/invalid.

```text
403 Forbidden
```

when authenticated but not permitted.

For resources where existence itself is sensitive, implementation may return:

```text
404 Not Found
```

to avoid resource enumeration.

Exact API error format is defined in API specification.

---

# 32. Cross-Tenant Protection

For every tenant resource:

```text
request resource ID
        ↓
resolve resource
        ↓
resolve cooperative
        ↓
resolve actor scope
        ↓
compare
        ↓
ALLOW / DENY
```

Never rely on:

```text
cooperative_id from request body
```

as proof of authorization.

---

# 33. Evidence Authorization Flow

```text
GET evidence
      ↓
Authenticate
      ↓
Permission check
      ↓
Evidence exists?
      ↓
Application scope valid?
      ↓
Evaluation assignment valid if required?
      ↓
Generate short-lived signed URL
      ↓
Audit where required
      ↓
Return URL
```

---

# 34. Sensitive Operations

The following require elevated authorization and audit:

```text
USER.LOCK
USER.ROLE_ASSIGN
PERMISSION.MANAGE
OCOP_APPLICATION.SUBMIT
OCOP_APPLICATION.RETURN
OCOP_EVIDENCE.VERIFY
OCOP_EVIDENCE.REJECT
OCOP_EVALUATION.SCORE
OCOP_EVALUATION.LOCK
OCOP_EVALUATION.CONSOLIDATE
OCOP_DECISION.RECORD
OCOP_DECISION.APPROVE
FINANCE.ADJUST
INVENTORY.ADJUST
REPORT.EXPORT
DOCUMENT.DOWNLOAD
```

Exact permission names may be normalized during OpenAPI/security implementation, but semantic boundaries must remain.

---

# 35. Authorization Audit Events

At minimum:

```text
AUTHORIZATION_DENIED
ROLE_ASSIGNED
ROLE_REVOKED
PERMISSION_CHANGED
SCOPE_CHANGED
USER_LOCKED
USER_UNLOCKED
EVIDENCE_ACCESSED
EVIDENCE_UPLOADED
EVIDENCE_REPLACED
EVIDENCE_VERIFIED
WORKFLOW_TRANSITION
EVALUATION_SCORE_CREATED
EVALUATION_SCORE_UPDATED
EVALUATION_SCORE_LOCKED
EVALUATION_CONSOLIDATED
DECISION_RECORDED
DECISION_APPROVED
```

Audit must not contain credentials or secrets.

---

# 36. Permission-to-Role Matrix — Core

`✓` = baseline granted.

| Permission | HTX_OWNER | HTX_STAFF | ACCOUNTANT | STOREKEEPER | AGRI_OFFICER | OCOP_PREPARER |
|---|---:|---:|---:|---:|---:|---:|
| MEMBER.READ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ |
| MEMBER.CREATE | ✓ | ✓ | - | - | - | - |
| MEMBER.UPDATE | ✓ | ✓ | - | - | - | - |
| AGRICULTURE.READ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ |
| AGRICULTURE.CREATE | ✓ | ✓ | - | - | ✓ | Limited |
| AGRICULTURE.UPDATE | ✓ | ✓ | - | - | ✓ | Limited |
| INVENTORY.READ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ |
| INVENTORY.MANAGE | Controlled | Controlled | - | ✓ | - | - |
| FINANCE.READ | ✓ | Limited | ✓ | - | - | Limited |
| FINANCE.MANAGE | Controlled | Limited | ✓ | - | - | - |
| OCOP_APPLICATION.READ | ✓ | ✓ | Limited | - | ✓ | ✓ |
| OCOP_APPLICATION.CREATE | ✓ | Controlled | - | - | - | ✓ |
| OCOP_APPLICATION.UPDATE | ✓ | Controlled | - | - | - | ✓ |
| OCOP_APPLICATION.SUBMIT | ✓ | Controlled | - | - | - | ✓ |
| OCOP_EVIDENCE.READ | ✓ | ✓ | Limited | - | ✓ | ✓ |
| OCOP_EVIDENCE.UPLOAD | ✓ | Controlled | - | - | - | ✓ |
| OCOP_EVIDENCE.REPLACE | Controlled | Controlled | - | - | - | ✓ |
| REPORT.EXPORT | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ |

---

# 37. Permission-to-Role Matrix — OCOP / Governance

| Permission | Receiving Reviewer | Evidence Reviewer | Evaluator | Council Member | Council Secretary | Authority |
|---|---:|---:|---:|---:|---:|---:|
| OCOP_APPLICATION.READ | ✓ | ✓ | Assigned | Assigned | Assigned | Authorized |
| OCOP_APPLICATION.REVIEW | ✓ | ✓ | - | Authorized | Authorized | ✓ |
| OCOP_APPLICATION.RETURN | ✓ | ✓ | - | Authorized | Authorized | Authorized |
| OCOP_EVIDENCE.READ | ✓ | ✓ | Assigned | Assigned | Assigned | Authorized |
| OCOP_EVIDENCE.VERIFY | ✓ | ✓ | - | Authorized | Authorized | Authorized |
| OCOP_EVIDENCE.REJECT | ✓ | ✓ | - | Authorized | Authorized | Authorized |
| OCOP_EVALUATION.READ | Limited | Limited | Assigned | Assigned | Assigned | Authorized |
| OCOP_EVALUATION.SCORE | - | - | ✓ | Policy | - | - |
| OCOP_EVALUATION.LOCK | - | - | ✓ | Policy | - | - |
| OCOP_EVALUATION.CONSOLIDATE | - | - | - | Authorized | Authorized | Authorized |
| OCOP_DECISION.READ | Authorized | Authorized | Assigned/read | Assigned | Assigned | ✓ |
| OCOP_DECISION.RECORD | - | - | - | Authorized | Authorized | ✓ |
| OCOP_DECISION.APPROVE | - | - | - | Policy | - | ✓ |
| REPORT.EXPORT | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ |

---

# 38. Permission-to-Role Matrix — Administration

| Permission | Criteria Admin | System Admin | Report Viewer | Auditor |
|---|---:|---:|---:|---:|
| CRITERIA.READ | ✓ | Technical | ✓ | ✓ |
| CRITERIA.CREATE | ✓ | Technical only | - | - |
| CRITERIA.UPDATE | ✓ draft only | Technical only | - | - |
| CRITERIA.PUBLISH | ✓ | - | - | - |
| USER.READ | Authorized | ✓ | - | ✓ authorized |
| USER.CREATE | -/Authorized | ✓ | - | - |
| USER.LOCK | -/Authorized | ✓ | - | - |
| ROLE.MANAGE | -/Authorized | ✓ | - | - |
| PERMISSION.MANAGE | -/Authorized | ✓ | - | - |
| AUDIT.READ | Authorized | ✓ technical | - | ✓ |
| REPORT.READ | ✓ | ✓ | ✓ | ✓ |
| REPORT.EXPORT | ✓ | ✓ | ✓ | ✓ |

---

# 39. Temporary / Delegated Access

If future requirements support delegation:

```text
Delegation
  actor
  delegate
  permission
  scope
  start_at
  end_at
  reason
```

Delegated access must:

```text
expire automatically
be auditable
not exceed delegator scope
not bypass SoD
```

This is a future capability unless explicitly required.

---

# 40. Break-Glass Access

No unrestricted emergency bypass is included in the baseline.

If future operations require break-glass:

```text
explicit reason
time limit
minimal scope
enhanced audit
post-incident review
```

must be implemented.

---

# 41. Authorization Test Matrix

## Identity

- [ ] Unauthenticated request is rejected.
- [ ] Locked user is rejected.
- [ ] Disabled user is rejected.
- [ ] Revoked session/token is rejected.

## Permission

- [ ] User without permission receives denial.
- [ ] Permission cannot be inferred from UI visibility.
- [ ] Permission changes take effect according to session/token policy.

## Scope

- [ ] User from HTX A cannot access HTX B.
- [ ] Evaluator cannot access unassigned session.
- [ ] Authority cannot access outside authorized scope.
- [ ] Report cannot expose data outside report scope.

## Workflow

- [ ] Draft can be edited by authorized actor.
- [ ] Submitted application cannot be freely edited.
- [ ] Need-revision allows controlled correction.
- [ ] Resubmission restores controlled lock.
- [ ] Illegal transition is rejected.

## SoD

- [ ] Preparer cannot evaluate own application.
- [ ] Evaluator cannot approve own evaluated application.
- [ ] SYSTEM_ADMIN cannot automatically approve business decisions.

## Evidence

- [ ] Unauthorized evidence download denied.
- [ ] Signed URL expires.
- [ ] Old evidence version is preserved.
- [ ] Invalid file type/size is rejected.

---

# 42. Security Regression Requirements

Any future change to:

```text
roles
permissions
workflow
criteria
evaluation
evidence
tenant model
```

must trigger authorization regression tests.

Minimum regression groups:

```text
RBAC
Data Scope
SoD
Workflow
Evidence
Evaluation
Finance
Inventory
Audit
```

---

# 43. Implementation Rules

## Backend

Authorization should be implemented using centralized mechanisms such as:

```text
Policy / Guard
Middleware
Authorization Service
Permission Service
Scope Resolver
Workflow Guard
```

Do not scatter raw role-name checks throughout business logic.

Avoid:

```text
if user.role == "ADMIN"
```

for every business operation.

Prefer:

```text
authorize(user, Permission.X, resource)
```

---

# 44. Database / Persistence Rules

Role and permission data should be persisted/configured centrally.

Typical relationships:

```text
users
  ↓
user_roles
  ↓
roles
  ↓
role_permissions
  ↓
permissions
```

Scope/assignment relationships may include:

```text
user_cooperatives
evaluation_assignments
council_assignments
authority_scopes
```

Exact physical schema must remain synchronized with `11_DATABASE_DESIGN_FINAL.md`.

---

# 45. API Contract Requirements

Every protected endpoint in `17_OPENAPI_SPECIFICATION.md` must document:

```text
Security scheme
Required permission
Scope
Possible workflow restriction
Authorization errors
```

Example:

```text
POST /api/v1/ocop/evaluation-sessions/{id}/scores

Required:
OCOP_EVALUATION.SCORE

Scope:
ASSIGNED_EVALUATION_SESSION

Constraints:
evaluator assignment active
indicator belongs to criteria version
score within allowed range
score not locked

Audit:
EVALUATION_SCORE_CREATED / UPDATED
```

---

# 46. Open Authorization Questions

| ID | Question | Priority |
|---|---|---|
| AUTH-OQ-001 | Một user có được đồng thời giữ nhiều role hay không? | High |
| AUTH-OQ-002 | Có cấm tổ hợp role ở cấp hệ thống hay chỉ cấm cùng một hồ sơ? | High |
| AUTH-OQ-003 | Phạm vi `AUTHORITY` được xác định theo tỉnh/huyện hay đơn vị nào? | High |
| AUTH-OQ-004 | Council Member/Secretary được quyền nào trong quá trình consolidate? | High |
| AUTH-OQ-005 | Ai có quyền APPROVE cuối cùng theo workflow thực tế? | Critical |
| AUTH-OQ-006 | HTX_OWNER có được phê duyệt giao dịch tài chính/kho không? | High |
| AUTH-OQ-007 | Có cần delegated access không? | Medium |
| AUTH-OQ-008 | Có yêu cầu break-glass access không? | Low |
| AUTH-OQ-009 | Chính sách 2FA áp dụng role nào? | High |
| AUTH-OQ-010 | RLS PostgreSQL có được triển khai ở production không? | Medium |

---

# 47. Definition of Done

- [ ] Role catalog synchronized with 05.
- [ ] Permission convention defined.
- [ ] Data scope defined.
- [ ] Core CRUD authorization defined.
- [ ] Agriculture authorization defined.
- [ ] Inventory authorization defined.
- [ ] Finance authorization defined.
- [ ] OCOP application authorization defined.
- [ ] Evidence authorization defined.
- [ ] Evaluation authorization defined.
- [ ] Council authorization defined.
- [ ] Authority authorization defined.
- [ ] Criteria administration defined.
- [ ] System admin boundary defined.
- [ ] Report viewer defined.
- [ ] Auditor defined.
- [ ] Workflow authorization defined.
- [ ] SoD defined.
- [ ] Evaluator ownership defined.
- [ ] Cross-tenant protection defined.
- [ ] API authorization mapping defined.
- [ ] Authorization test matrix defined.
- [ ] Open questions documented.

---

# 48. Traceability

```text
05_ACTORS_AND_ROLES.md
        ↓
Role Catalog
        ↓
14_SECURITY_DESIGN.md
        ↓
Security Principles
        ↓
15_AUTHORIZATION_MATRIX.md
        ↓
Permission + Scope + SoD
        ↓
16_WORKFLOW_SPECIFICATION.md
        ↓
State Transition Authorization
        ↓
17_OPENAPI_SPECIFICATION.md
        ↓
Endpoint Security Contract
        ↓
Backend Implementation
        ↓
Authorization Tests
```

---

# 49. Next Document

Next:

```text
16_WORKFLOW_SPECIFICATION.md
```

`16_WORKFLOW_SPECIFICATION.md` must use the same:

```text
roles
permissions
data scopes
SoD constraints
OCOP application states
evaluation states
```

defined in this document.

It must not introduce a second independent authorization model.
