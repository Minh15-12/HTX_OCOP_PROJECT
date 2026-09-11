# 16_WORKFLOW_SPECIFICATION.md

# 1. Document Information

| Field | Value |
|---|---|
| Document ID | 16 |
| Document Name | Workflow Specification |
| Project | Xây dựng Hệ thống quản lý hoạt động Hợp tác xã nông nghiệp và số hóa hồ sơ đánh giá, phân hạng OCOP |
| Previous Documents | 01 → 15 |
| Primary Inputs | 07_BUSINESS_REQUIREMENTS.md, 08_FUNCTIONAL_REQUIREMENTS.md, 09_USE_CASES_FINAL.md, 14_SECURITY_DESIGN.md, 15_AUTHORIZATION_MATRIX.md |
| Status | BASELINE WORKFLOW SPECIFICATION – PENDING VALIDATION |
| Core Model | State Machine + RBAC + Data Scope + SoD + Audit |
| Principle | Every state transition must be explicit, authorized, validated, and auditable |

> Tài liệu này đặc tả workflow ở mức hệ thống. Những điểm chưa được xác nhận bởi tài liệu nghiệp vụ/pháp lý phải được đánh dấu `TO_VERIFY` hoặc `PROPOSED`, không được coi là quy định pháp lý chính thức.

---

# 2. Purpose

Workflow specification xác định:

```text
Entity
  ↓
State
  ↓
Allowed Action
  ↓
Authorized Actor
  ↓
Permission
  ↓
Preconditions
  ↓
State Transition
  ↓
Side Effects
  ↓
Audit Event
```

Mục tiêu:

- Không cho phép chuyển trạng thái tùy ý.
- Đồng bộ workflow với authorization.
- Bảo vệ dữ liệu đã được kiểm tra/khóa.
- Theo dõi đầy đủ lịch sử xử lý.
- Hỗ trợ xử lý hồ sơ cần chỉnh sửa, trả lại hoặc từ chối.
- Giữ được lịch sử phiên bản và minh chứng.

---

# 3. Workflow Principles

## 3.1 Explicit State Machine

Không dùng trạng thái ngầm.

Mọi business object có workflow phải có:

```text
current_state
```

và mọi thay đổi trạng thái phải thông qua transition hợp lệ.

---

## 3.2 Deny Invalid Transition

Ví dụ:

```text
DRAFT → APPROVED
```

không được phép nếu không có các trạng thái trung gian được định nghĩa trong workflow.

---

## 3.3 Backend Is Source of Truth

Frontend chỉ hiển thị action phù hợp.

Backend vẫn phải kiểm tra:

```text
permission
scope
current_state
preconditions
SoD
```

Không được tin action do client gửi.

---

## 3.4 Every Transition Is Auditable

Mỗi transition tối thiểu lưu:

```text
entity
entity_id
from_state
action
to_state
actor
timestamp
reason
metadata
```

---

# 4. Workflow Entities

Baseline workflow entities:

```text
OCOP Application
OCOP Evidence
Evaluation Session
Evaluation Assignment
Evaluator Score
Evaluation Result
Decision
```

Một số entity có thể chỉ có lifecycle nội bộ thay vì workflow đầy đủ.

---

# 5. OCOP Application Lifecycle

Baseline state machine:

```text
DRAFT
   ↓
READY_FOR_SUBMISSION
   ↓
SUBMITTED
   ↓
IN_REVIEW
   ├──────────────→ NEED_REVISION
   │                    ↓
   │               RESUBMITTED
   │                    ↓
   └──────────────── IN_REVIEW
                         ↓
              READY_FOR_EVALUATION
                         ↓
                    EVALUATING
                         ↓
                    CONSOLIDATED
                         ↓
                  PENDING_DECISION
                    ↙         ↘
              APPROVED       REJECTED
```

> Đây là workflow hệ thống baseline. Các tên trạng thái có thể được điều chỉnh khi quy trình thực tế và hồ sơ do đơn vị cung cấp được xác nhận.

---

# 6. Application State Definitions

| State | Meaning | Editable by Applicant? |
|---|---|---:|
| DRAFT | Hồ sơ đang được chuẩn bị | ✓ |
| READY_FOR_SUBMISSION | Hồ sơ đã đủ điều kiện cơ bản để gửi | Controlled |
| SUBMITTED | Đã gửi hồ sơ | - |
| IN_REVIEW | Đang được kiểm tra | - |
| NEED_REVISION | Cần bổ sung/chỉnh sửa | ✓ |
| RESUBMITTED | Đã gửi lại sau chỉnh sửa | - |
| READY_FOR_EVALUATION | Đủ điều kiện chuyển sang đánh giá | - |
| EVALUATING | Đang thực hiện đánh giá | - |
| CONSOLIDATED | Kết quả đánh giá đã được tổng hợp | - |
| PENDING_DECISION | Chờ quyết định | - |
| APPROVED | Đã được phê duyệt | - |
| REJECTED | Không được phê duyệt | Read-only / controlled |

---

# 7. Application Transition Matrix

| From | Action | Actor | Permission | To |
|---|---|---|---|---|
| DRAFT | Prepare | OCOP_PREPARER / authorized HTX role | OCOP_APPLICATION.UPDATE | DRAFT |
| DRAFT | Mark Ready | OCOP_PREPARER / authorized HTX role | OCOP_APPLICATION.SUBMIT | READY_FOR_SUBMISSION |
| READY_FOR_SUBMISSION | Submit | OCOP_PREPARER / authorized HTX role | OCOP_APPLICATION.SUBMIT | SUBMITTED |
| SUBMITTED | Receive/Start Review | RECEIVING_REVIEWER | OCOP_APPLICATION.REVIEW | IN_REVIEW |
| IN_REVIEW | Return | Reviewer | OCOP_APPLICATION.RETURN | NEED_REVISION |
| NEED_REVISION | Update | OCOP_PREPARER | OCOP_APPLICATION.UPDATE | NEED_REVISION |
| NEED_REVISION | Resubmit | OCOP_PREPARER | OCOP_APPLICATION.SUBMIT | RESUBMITTED |
| RESUBMITTED | Receive Review | Reviewer | OCOP_APPLICATION.REVIEW | IN_REVIEW |
| IN_REVIEW | Accept for Evaluation | Authorized Reviewer | OCOP_APPLICATION.REVIEW | READY_FOR_EVALUATION |
| READY_FOR_EVALUATION | Start Evaluation | Authorized evaluator/workflow actor | Evaluation permission | EVALUATING |
| EVALUATING | Complete Evaluation | Assigned evaluator/council workflow | Evaluation permission | CONSOLIDATED |
| CONSOLIDATED | Move to Decision | Authorized workflow actor | Decision permission | PENDING_DECISION |
| PENDING_DECISION | Approve | Authorized Authority | OCOP_DECISION.APPROVE | APPROVED |
| PENDING_DECISION | Reject | Authorized Authority | OCOP_DECISION.APPROVE / policy-specific permission | REJECTED |

---

# 8. Application Transition Preconditions

## 8.1 DRAFT → READY_FOR_SUBMISSION

Minimum system checks:

```text
application exists
application belongs to authorized HTX
required core fields complete
criteria version assigned
required application sections valid
```

Evidence completeness requirements must be based on the configured criteria/workflow and not hard-coded as a universal legal rule.

---

## 8.2 READY_FOR_SUBMISSION → SUBMITTED

Check:

```text
actor authorized
application state correct
mandatory fields complete
no blocking validation errors
required acknowledgements completed if configured
```

On success:

```text
application submitted_at = now
submitted_by = actor
```

---

## 8.3 SUBMITTED → IN_REVIEW

Check:

```text
actor is assigned/authorized reviewer
application belongs to authorized scope
application state = SUBMITTED
```

---

## 8.4 IN_REVIEW → NEED_REVISION

Required:

```text
reason/comment
actor authorization
```

The system should identify:

```text
reviewer
review timestamp
revision reason
affected section if applicable
```

---

## 8.5 NEED_REVISION → RESUBMITTED

Check:

```text
actor authorized preparer
application is in NEED_REVISION
required corrections completed
```

The system should preserve previous submission/review history.

---

## 8.6 IN_REVIEW → READY_FOR_EVALUATION

Check:

```text
review completed
blocking issues resolved
required information available
criteria version valid
application eligible for evaluation
```

---

## 8.7 READY_FOR_EVALUATION → EVALUATING

Check:

```text
evaluation session exists
session is active
criteria version matches application
required evaluator assignments exist
```

---

## 8.8 EVALUATING → CONSOLIDATED

Check:

```text
required evaluation inputs completed
required evaluator scores locked
all mandatory indicators handled
consolidation actor authorized
```

If the actual rules allow incomplete or exceptional evaluation, this must be explicitly configured.

---

## 8.9 CONSOLIDATED → PENDING_DECISION

Check:

```text
consolidated result exists
result is internally valid
required documents generated/available if configured
authorized actor performs transition
```

---

## 8.10 PENDING_DECISION → APPROVED

Check:

```text
authorized decision maker
SoD passes
required result available
required decision data complete
```

---

## 8.11 PENDING_DECISION → REJECTED

Check:

```text
authorized decision maker
reason recorded
SoD passes
```

---

# 9. Revision Workflow

```text
IN_REVIEW
    ↓
NEED_REVISION
    ↓
Applicant updates
    ↓
RESUBMITTED
    ↓
IN_REVIEW
```

Important:

```text
Do not overwrite previous review history.
```

Each revision should preserve:

```text
revision number
submitted_at
submitted_by
return_reason
changed sections
related evidence versions
```

---

# 10. Application Locking Rules

As baseline:

| State | Core Data | Evidence |
|---|---|---|
| DRAFT | Editable | Editable |
| READY_FOR_SUBMISSION | Controlled | Controlled |
| SUBMITTED | Locked | Controlled |
| IN_REVIEW | Locked | Controlled review |
| NEED_REVISION | Editable | Editable/replacement according to policy |
| RESUBMITTED | Locked | Controlled |
| READY_FOR_EVALUATION | Locked | Controlled |
| EVALUATING | Locked | Locked/controlled |
| CONSOLIDATED | Locked | Historical |
| PENDING_DECISION | Locked | Historical |
| APPROVED | Locked | Historical |
| REJECTED | Locked | Historical |

> "Locked" means business update is prohibited except through explicitly defined correction/versioning mechanisms. It does not necessarily mean database row cannot technically be changed.

---

# 11. Evidence Lifecycle

Baseline:

```text
UPLOADED
   ↓
PENDING_REVIEW
   ├────→ VERIFIED
   └────→ REJECTED
             ↓
        REPLACEMENT
             ↓
        PENDING_REVIEW
```

Possible archival state:

```text
SUPERSEDED
```

for an old version replaced by a newer evidence version.

---

# 12. Evidence States

| State | Meaning |
|---|---|
| UPLOADED | File has been uploaded |
| PENDING_REVIEW | Waiting for evidence review |
| VERIFIED | Accepted as valid evidence for workflow purposes |
| REJECTED | Evidence is not accepted |
| SUPERSEDED | Replaced by a newer version |
| ARCHIVED | Retained for historical purposes |

Exact terminology may be aligned with the final UI/API vocabulary.

---

# 13. Evidence Transition Matrix

| From | Action | Actor | To |
|---|---|---|---|
| UPLOADED | Submit for Review | Preparer | PENDING_REVIEW |
| PENDING_REVIEW | Verify | Evidence Reviewer / authorized actor | VERIFIED |
| PENDING_REVIEW | Reject | Evidence Reviewer / authorized actor | REJECTED |
| REJECTED | Replace | Preparer | PENDING_REVIEW |
| VERIFIED | Replace | Authorized actor when policy permits | PENDING_REVIEW |
| VERIFIED | Supersede | System / authorized actor | SUPERSEDED |
| SUPERSEDED | Archive | System/authorized actor | ARCHIVED |

---

# 14. Evidence Versioning

Never silently replace historical evidence.

Model:

```text
Evidence
 ├── Version 1
 ├── Version 2
 └── Version 3
```

Each version records:

```text
version_number
file_object_id
uploaded_by
uploaded_at
checksum
mime_type
size
review_status
reviewed_by
reviewed_at
review_comment
```

The exact physical schema must remain synchronized with the database design.

---

# 15. Evidence Review Rules

Reviewer can:

```text
READ
VERIFY
REJECT
ADD REVIEW COMMENT
```

Reviewer cannot:

```text
silently edit applicant file
change file content
delete historical evidence
change application score
```

---

# 16. Evaluation Session Lifecycle

Baseline:

```text
DRAFT
   ↓
OPEN
   ↓
ASSIGNING
   ↓
IN_PROGRESS
   ↓
SCORING_COMPLETED
   ↓
CONSOLIDATING
   ↓
CONSOLIDATED
   ↓
CLOSED
```

If the final business model requires fewer states, implementation may simplify them without losing the underlying invariants.

---

# 17. Evaluation Session State Definitions

| State | Meaning |
|---|---|
| DRAFT | Phiên đánh giá đang được chuẩn bị |
| OPEN | Phiên đã được mở |
| ASSIGNING | Đang phân công evaluator |
| IN_PROGRESS | Đang đánh giá |
| SCORING_COMPLETED | Các score bắt buộc đã hoàn tất |
| CONSOLIDATING | Đang tổng hợp |
| CONSOLIDATED | Đã tổng hợp |
| CLOSED | Phiên đã đóng |

---

# 18. Evaluation Session Transition Matrix

| From | Action | Actor | To |
|---|---|---|---|
| DRAFT | Open | Authorized coordinator | OPEN |
| OPEN | Start Assignment | Authorized coordinator | ASSIGNING |
| ASSIGNING | Complete Assignment | Authorized coordinator | IN_PROGRESS |
| IN_PROGRESS | Submit Scores | Evaluator | IN_PROGRESS |
| IN_PROGRESS | Complete Scoring | Authorized workflow actor | SCORING_COMPLETED |
| SCORING_COMPLETED | Start Consolidation | Council/workflow actor | CONSOLIDATING |
| CONSOLIDATING | Complete Consolidation | Authorized actor | CONSOLIDATED |
| CONSOLIDATED | Close | Authorized actor | CLOSED |

---

# 19. Evaluation Assignment Lifecycle

Baseline:

```text
ASSIGNED
   ↓
ACCEPTED
   ↓
IN_PROGRESS
   ↓
COMPLETED
   ↓
LOCKED
```

Possible exception:

```text
ASSIGNED → DECLINED
ASSIGNED → REASSIGNED
```

if the business process supports reassignment.

---

# 20. Evaluator Score Lifecycle

```text
DRAFT
  ↓
SUBMITTED
  ↓
LOCKED
```

Allowed:

```text
Evaluator:
DRAFT → update → SUBMITTED → LOCKED
```

After `LOCKED`:

```text
normal UPDATE = DENY
```

Any correction mechanism must create an auditable correction/version event rather than silently modifying historical scoring.

---

# 21. Score Rules

Before accepting a score:

```text
evaluator assignment is active
evaluation session is active
criteria version matches
indicator belongs to session
score is within configured valid range
mandatory justification exists when configured
score is not already locked
```

The valid range must come from the configured criteria/scoring rules.

---

# 22. Score Locking

When evaluator locks a score:

```text
score.status = LOCKED
locked_by = evaluator
locked_at = now
```

Audit:

```text
EVALUATION_SCORE_LOCKED
```

The system should prevent ordinary update after lock.

---

# 23. Consolidation Workflow

```text
Evaluator Scores
      ↓
Validate completeness
      ↓
Validate score ownership
      ↓
Validate criteria version
      ↓
Validate locked status
      ↓
Calculate/aggregate according to configured rules
      ↓
Create consolidated result
      ↓
Audit
```

The consolidation algorithm must use the active criteria/scoring configuration attached to the evaluation session.

---

# 24. Consolidation Preconditions

Required baseline:

```text
session active for consolidation
all mandatory evaluator assignments handled
scores valid
scores locked where required
no unauthorized score exists
criteria version immutable
```

---

# 25. Consolidated Result

A consolidated result should preserve:

```text
evaluation_session_id
criteria_version_id
application_id
total_score / configured result
score breakdown
consolidated_by
consolidated_at
result_status
```

Do not calculate historical results from the current criteria version.

---

# 26. Decision Workflow

Baseline:

```text
CONSOLIDATED
      ↓
PENDING_DECISION
      ↓
┌─────┴─────┐
↓           ↓
APPROVED   REJECTED
```

Decision record should contain:

```text
decision_type
decision_date
decision_actor
reason/comment where required
result reference
```

---

# 27. Approval Rules

Approval requires:

```text
authorized decision maker
correct workflow state
valid consolidated result
SoD passes
required decision information complete
```

Approval must be atomic with its workflow transition.

Conceptually:

```text
BEGIN
  validate authorization
  validate state
  create decision
  transition application
  write audit
COMMIT
```

If any step fails:

```text
ROLLBACK
```

---

# 28. Rejection Rules

Rejection should require:

```text
authorized actor
valid state
reason
audit event
```

Rejection must not delete:

```text
application
evidence
scores
review history
previous submissions
```

---

# 29. Reopening / Correction

Approved or consolidated records must not be reopened through a generic UPDATE operation.

If future requirements require reopening:

```text
explicit REOPEN action
specific authorized role
reason mandatory
audit mandatory
new workflow state
```

This is `TO_VERIFY` unless confirmed by the business owner.

---

# 30. Workflow Action Idempotency

State-changing commands should be idempotent where practical.

Example:

```text
POST /applications/{id}/submit
```

Repeated request should not create duplicate submissions.

The backend should verify:

```text
current state
request idempotency key where applicable
existing transition
```

---

# 31. Concurrent Workflow Updates

Two users may attempt transitions simultaneously.

Backend must prevent invalid race conditions.

Recommended:

```text
transaction
+
row/version locking or optimistic concurrency
+
state revalidation
```

Example:

```text
Reviewer A → NEED_REVISION
Reviewer B → READY_FOR_EVALUATION
```

Only one valid transition may commit according to the current state and business rule.

---

# 32. Audit Requirements

Every transition must record:

```text
audit_event_id
actor_id
entity_type
entity_id
from_state
action
to_state
timestamp
reason
request_id/correlation_id where available
metadata
```

For sensitive operations also capture sufficient context for later investigation.

Do not store:

```text
password
access token
private key
signed URL secret
```

---

# 33. Notification / Reminder Hooks

Workflow transitions may trigger:

```text
notification
task creation
deadline calculation
reminder
```

Examples:

```text
SUBMITTED
    → notify reviewer

NEED_REVISION
    → notify preparer

ASSIGNED
    → notify evaluator

PENDING_DECISION
    → notify decision actor
```

Notification delivery failure must not silently undo a successful business transition unless explicitly designed as a transactional requirement.

---

# 34. Task / Reminder Model

A workflow task may contain:

```text
task_id
entity_type
entity_id
assigned_to
task_type
due_at
status
created_at
completed_at
```

Task status:

```text
OPEN
IN_PROGRESS
COMPLETED
CANCELLED
OVERDUE
```

Reminder policy remains `TO_VERIFY` until business owner defines deadlines.

---

# 35. Workflow + Authorization

Every transition must map to file 15.

Example:

```text
IN_REVIEW
    ↓ RETURN
NEED_REVISION

Actor:
REVIEWER

Permission:
OCOP_APPLICATION.RETURN

Scope:
ASSIGNED_APPLICATION / AUTHORIZED_SCOPE

SoD:
valid

Audit:
APPLICATION_RETURNED
```

No transition may introduce a permission that is absent from the authorization model without updating both documents.

---

# 36. Workflow + Data Scope

Example:

```text
Evaluator E1
    ↓
Evaluation Session S1
    ↓
Application A1
```

E1 may access A1 only through the assignment/session scope.

The following must fail:

```text
E1 → Application A2
```

if A2 is not assigned to E1.

---

# 37. Workflow + Criteria Version

An application entering evaluation must retain its criteria context.

Conceptually:

```text
Application
    ↓
Criteria Version X
    ↓
Evaluation Session
    ↓
Scores
    ↓
Consolidated Result
```

A later criteria version must not silently change historical evaluation results.

---

# 38. Workflow + Evidence Version

Evaluation should reference the evidence version available/accepted under the workflow rules.

Historical result must remain explainable:

```text
Result
  ↓
Criteria Version
  ↓
Score
  ↓
Evidence Version
```

Exact requirement for evidence snapshotting at evaluation start is `TO_VERIFY`.

---

# 39. Exceptional Cases

## 39.1 Reviewer Rejects/Returns

```text
IN_REVIEW → NEED_REVISION
```

Reason required.

---

## 39.2 Evidence Rejected

```text
PENDING_REVIEW → REJECTED
```

Applicant may provide replacement if workflow permits.

---

## 39.3 Evaluator Cannot Complete

Potential flow:

```text
ASSIGNED → DECLINED
```

then:

```text
REASSIGNED
```

This is `TO_VERIFY`.

---

## 39.4 Score Correction

Do not directly overwrite locked score.

Possible controlled model:

```text
LOCKED
  ↓
CORRECTION_REQUESTED
  ↓
CORRECTION_AUTHORIZED
  ↓
NEW SCORE VERSION
  ↓
LOCKED
```

This flow is `PROPOSED` until confirmed.

---

# 40. Forbidden Transitions

Examples:

```text
DRAFT → APPROVED
SUBMITTED → APPROVED
REJECTED → APPROVED
APPROVED → DRAFT
LOCKED SCORE → UPDATE
UNASSIGNED EVALUATOR → SCORE
UNAUTHORIZED USER → ANY WORKFLOW TRANSITION
```

unless an explicitly defined workflow supports the transition.

---

# 41. Transaction Boundary

A state-changing business command should execute as one transaction when it modifies multiple related records.

Example:

```text
Submit Application

BEGIN
  validate
  update application state
  create submission history
  create audit event
  create task/notification event
COMMIT
```

External notification sending should preferably use an outbox/event mechanism rather than making database consistency depend on an external notification service.

---

# 42. API Command Pattern

Workflow APIs should represent business actions rather than generic state updates.

Prefer:

```text
POST /applications/{id}/submit
POST /applications/{id}/return
POST /applications/{id}/resubmit
POST /applications/{id}/start-evaluation
POST /evaluation-sessions/{id}/consolidate
POST /decisions/{id}/approve
```

Avoid exposing:

```text
PATCH /applications/{id}
{
  "status": "APPROVED"
}
```

because this bypasses workflow authorization and business validation.

---

# 43. Workflow History

Application history should allow reconstruction of:

```text
who
did what
when
from which state
to which state
why
under which workflow context
```

Example:

```text
DRAFT
 → SUBMITTED
 → IN_REVIEW
 → NEED_REVISION
 → RESUBMITTED
 → IN_REVIEW
 → READY_FOR_EVALUATION
 → EVALUATING
 → CONSOLIDATED
 → PENDING_DECISION
 → APPROVED
```

---

# 44. Workflow Invariants

The following must always hold:

```text
INV-WF-001
Current state must belong to the entity's state machine.

INV-WF-002
Every state transition must be authorized.

INV-WF-003
Every successful transition must be auditable.

INV-WF-004
Historical transitions must not be silently deleted.

INV-WF-005
Locked evaluation scores cannot be normally edited.

INV-WF-006
Evaluator access is limited by assignment/session scope.

INV-WF-007
Historical evaluation retains its criteria version.

INV-WF-008
Approval requires valid SoD.

INV-WF-009
Workflow cannot be bypassed by direct status update.

INV-WF-010
Cross-HTX access is denied unless explicitly authorized.
```

---

# 45. Workflow Error Codes

Recommended semantic codes:

```text
WORKFLOW_INVALID_STATE
WORKFLOW_INVALID_TRANSITION
WORKFLOW_PERMISSION_DENIED
WORKFLOW_SCOPE_DENIED
WORKFLOW_SOD_VIOLATION
WORKFLOW_PRECONDITION_FAILED
WORKFLOW_ALREADY_COMPLETED
WORKFLOW_LOCKED
WORKFLOW_VERSION_CONFLICT
WORKFLOW_ASSIGNMENT_REQUIRED
WORKFLOW_CRITERIA_VERSION_MISMATCH
WORKFLOW_INCOMPLETE
```

Exact HTTP/API representation will be defined in the OpenAPI document.

---

# 46. Workflow Test Matrix

## Application

- [ ] Draft can be created.
- [ ] Draft can be edited by authorized actor.
- [ ] Invalid draft cannot be submitted.
- [ ] Submitted application cannot be freely edited.
- [ ] Reviewer can enter review only within scope.
- [ ] Reviewer can return with reason.
- [ ] Applicant can resubmit after revision.
- [ ] Invalid transitions are rejected.
- [ ] Approved application is immutable through normal CRUD.

## Evidence

- [ ] Evidence upload creates a version.
- [ ] Reviewer can verify/reject within scope.
- [ ] Rejected evidence can be replaced if allowed.
- [ ] Historical evidence remains traceable.

## Evaluation

- [ ] Only assigned evaluator can score.
- [ ] Score range is validated.
- [ ] Locked score cannot be normally changed.
- [ ] Consolidation requires required scores.
- [ ] Historical criteria version remains unchanged.

## Decision

- [ ] Unauthorized user cannot approve.
- [ ] SoD violation is rejected.
- [ ] Approval creates decision record.
- [ ] Rejection requires reason where configured.
- [ ] Final transition is audited.

## Concurrency

- [ ] Concurrent transitions do not corrupt state.
- [ ] Duplicate submit does not create duplicate submission.
- [ ] Optimistic/pessimistic locking behaves correctly.

---

# 47. Traceability

```text
07_BUSINESS_REQUIREMENTS
        ↓
08_FUNCTIONAL_REQUIREMENTS
        ↓
09_USE_CASES_FINAL
        ↓
14_SECURITY_DESIGN
        ↓
15_AUTHORIZATION_MATRIX
        ↓
16_WORKFLOW_SPECIFICATION
        ↓
17_OPENAPI_SPECIFICATION
        ↓
Backend Services
        ↓
Workflow Tests
```

---

# 48. Open Questions

| ID | Question | Priority |
|---|---|---|
| WF-OQ-001 | Quy trình thực tế có đúng các trạng thái baseline này không? | Critical |
| WF-OQ-002 | Ai chính thức có quyền chuyển hồ sơ sang READY_FOR_EVALUATION? | Critical |
| WF-OQ-003 | Ai được mở và đóng evaluation session? | High |
| WF-OQ-004 | Council Member và Council Secretary có quyền consolidate giống nhau không? | High |
| WF-OQ-005 | Có cần trạng thái DECLINED/REASSIGNED cho evaluator không? | Medium |
| WF-OQ-006 | Có cơ chế sửa score sau khi LOCKED không? | High |
| WF-OQ-007 | Có cho phép reopen hồ sơ đã APPROVED/REJECTED không? | High |
| WF-OQ-008 | Thời hạn xử lý từng workflow stage là bao nhiêu? | Medium |
| WF-OQ-009 | Notification/reminder nào là bắt buộc? | Medium |
| WF-OQ-010 | Evidence có phải snapshot cứng tại thời điểm bắt đầu evaluation không? | High |
| WF-OQ-011 | Có cần workflow riêng cho finance/inventory transactions không? | Medium |
| WF-OQ-012 | Có cần workflow riêng cho surplus distribution approval không? | Medium |

---

# 49. Definition of Done

- [ ] Application lifecycle defined.
- [ ] Application states defined.
- [ ] Application transitions defined.
- [ ] Preconditions defined.
- [ ] Revision flow defined.
- [ ] Locking rules defined.
- [ ] Evidence lifecycle defined.
- [ ] Evidence versioning defined.
- [ ] Evaluation session lifecycle defined.
- [ ] Evaluation assignment lifecycle defined.
- [ ] Score lifecycle defined.
- [ ] Score locking defined.
- [ ] Consolidation defined.
- [ ] Decision workflow defined.
- [ ] SoD integrated.
- [ ] Data scope integrated.
- [ ] Criteria versioning integrated.
- [ ] Evidence history integrated.
- [ ] Audit requirements defined.
- [ ] Notification hooks defined.
- [ ] Concurrency requirements defined.
- [ ] API command pattern defined.
- [ ] Forbidden transitions documented.
- [ ] Test matrix defined.
- [ ] Open questions documented.
- [ ] Terminology aligned with 15_AUTHORIZATION_MATRIX.md.

---

# 50. Next Document

Next:

```text
17_OPENAPI_SPECIFICATION.md
```

The OpenAPI specification must derive endpoint authorization and workflow commands from:

```text
15_AUTHORIZATION_MATRIX.md
16_WORKFLOW_SPECIFICATION.md
```

It must not expose generic status mutation that bypasses workflow controls.
