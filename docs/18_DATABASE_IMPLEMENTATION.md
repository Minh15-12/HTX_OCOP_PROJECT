# 18_DATABASE_IMPLEMENTATION.md

# 1. Document Information

| Field | Value |
|---|---|
| Document ID | 18 |
| Document Name | Database Implementation Specification |
| Project | Xây dựng Hệ thống quản lý hoạt động Hợp tác xã nông nghiệp và số hóa hồ sơ đánh giá, phân hạng OCOP |
| Database Engine | PostgreSQL |
| Status | Implementation Baseline |

> Tài liệu này chuyển thiết kế CSDL thành các nguyên tắc triển khai migration, constraint, index, transaction, integrity và bảo vệ dữ liệu. Tên bảng/cột chính thức phải được đối chiếu với `11_DATABASE_DESIGN.md` trước khi sinh migration production.

---

# 2. Mục tiêu

Database phải bảo đảm chuỗi:

```text
Business Requirements
        ↓
Use Cases
        ↓
Workflow
        ↓
Authorization
        ↓
API
        ↓
Database Integrity
```

Không dựa hoàn toàn vào frontend để bảo vệ dữ liệu.

Nguyên tắc:

```text
Application validation
+
Domain/business validation
+
Database constraints
+
Transactions
+
Audit
```

---

# 3. Tài liệu nguồn và thứ tự đối chiếu

Các tài liệu liên quan:

```text
07_BUSINESS_REQUIREMENTS.md
08_FUNCTIONAL_REQUIREMENTS.md
09_USE_CASES_FINAL.md
11_DATABASE_DESIGN.md
13_SYSTEM_ARCHITECTURE.md
14_SECURITY_DESIGN.md
15_AUTHORIZATION_MATRIX.md
16_WORKFLOW_SPECIFICATION.md
17_OPENAPI_SPECIFICATION.md
```

Khi phát hiện mâu thuẫn:

1. Quy định/nghiệp vụ đã được xác nhận.
2. Business Requirements.
3. Functional Requirements.
4. Use Cases.
5. Database Design.
6. Workflow Specification.
7. OpenAPI Specification.
8. Implementation detail.

Không tự ý sửa schema production để giải quyết mâu thuẫn; phải ghi nhận trong reconciliation log.

---

# 4. Nguyên tắc thiết kế

## 4.1 Referential Integrity

Các quan hệ nghiệp vụ phải được bảo vệ bằng:

```text
PRIMARY KEY
FOREIGN KEY
NOT NULL
UNIQUE
CHECK
```

khi phù hợp.

## 4.2 Naming Convention

Sử dụng:

```text
lower_snake_case
```

Ví dụ:

```text
cooperative_id
member_id
criteria_version_id
evaluation_session_id
created_at
updated_at
```

Không tự đổi tên bảng/cột đã được chốt trong `11_DATABASE_DESIGN.md`.

## 4.3 UUID

Nếu database design đã quy định UUID thì implementation phải giữ UUID.

Không thay đổi kiểu khóa chỉ vì framework thuận tiện hơn.

## 4.4 Timestamp

Khuyến nghị PostgreSQL:

```text
TIMESTAMPTZ
```

Các entity có lifecycle thường dùng:

```text
created_at
updated_at
```

---

# 5. Primary Key và Foreign Key

Mỗi persistent entity phải có primary key.

Ví dụ:

```sql
id UUID PRIMARY KEY
```

Quan hệ parent-child phải có foreign key.

Ví dụ:

```sql
cooperative_id UUID NOT NULL
    REFERENCES cooperatives(id)
```

Nếu `11_DATABASE_DESIGN.md` quy định composite key hoặc natural key thì phải giữ đúng thiết kế đã duyệt.

---

# 6. Delete Strategy

Không dùng `ON DELETE CASCADE` một cách máy móc.

Đối với dữ liệu lịch sử như:

```text
OCOP applications
Evidence
Evaluation sessions
Scores
Decisions
Financial transactions
Inventory transactions
Audit records
```

ưu tiên:

```text
RESTRICT
```

hoặc lifecycle/archive phù hợp.

Cascade chỉ sử dụng khi việc xóa child không làm mất dữ liệu nghiệp vụ cần bảo tồn.

---

# 7. Soft Delete

Soft delete chỉ dùng cho entity có nhu cầu lifecycle phù hợp.

Có thể dùng:

```text
deleted_at
```

hoặc status.

Không áp dụng soft delete một cách máy móc cho mọi bảng.

Đặc biệt các bảng transaction, evaluation history và audit không được xóa tùy tiện.

---

# 8. Enum và Vocabulary

Các giá trị enum phải được định nghĩa thống nhất giữa:

```text
Frontend
Backend
API
Database
Workflow
```

Đặc biệt:

```text
council_level:
    PROVINCE
    CENTRAL
```

Database không được thiết kế chỉ cho một cấp nếu nghiệp vụ yêu cầu cả hai cấp.

---

# 9. OCOP Criteria Versioning

Tiêu chí OCOP phải hỗ trợ versioning.

Mô hình khái niệm:

```text
criteria_version
      ↓
criteria
      ↓
application
      ↓
evaluation_session
      ↓
scores
```

Hồ sơ lịch sử phải giữ được phiên bản tiêu chí đã sử dụng.

Không được để việc thay đổi bộ tiêu chí hiện hành làm thay đổi ý nghĩa của hồ sơ đã đánh giá.

---

# 10. Criteria Immutability

Một criteria version đã được sử dụng cho đánh giá lịch sử không được overwrite tùy tiện.

Lifecycle khuyến nghị:

```text
Draft
  ↓
Published
  ↓
Used
  ↓
Immutable
```

Nếu cần thay đổi tiêu chí:

```text
Create new criteria version
```

thay vì sửa version lịch sử.

---

# 11. OCOP Application Integrity

OCOP application phải tham chiếu đúng các entity liên quan, tối thiểu theo database design:

```text
cooperative
criteria_version
product/application context
```

Foreign key phải ngăn application tham chiếu tới entity không tồn tại.

---

# 12. Evaluation Session

Evaluation session phải liên kết đúng với application và criteria context.

Phải hỗ trợ:

```text
PROVINCE
CENTRAL
```

cho `council_level`.

Historical session phải giữ được context tại thời điểm đánh giá.

---

# 13. Evaluation Historical Integrity

Invariant:

```text
evaluation_session.criteria_version_id
=
criteria version actually used for scoring
```

Một session đã có score/result không được tùy tiện đổi criteria version.

Nếu nghiệp vụ yêu cầu đánh giá lại theo version khác, phải tạo lifecycle/session phù hợp thay vì làm biến dạng lịch sử.

---

# 14. Evaluator Assignment

Assignment phải có foreign key hợp lệ tới:

```text
evaluation_session
evaluator
application
```

Nếu nghiệp vụ xác định evaluator không được assign trùng trong cùng session/application, có thể dùng:

```sql
UNIQUE (
    evaluation_session_id,
    evaluator_id,
    application_id
)
```

Chỉ áp dụng constraint này sau khi đối chiếu business rule chính thức.

---

# 15. Score Integrity

Score phải tham chiếu đúng:

```text
evaluation assignment
criterion
```

và phải thuộc đúng criteria version của session.

Không cho phép:

```text
Session Version A
    +
Criterion Version B
```

nếu business rule không cho phép.

---

# 16. Score Range

Các invariant đơn giản có thể dùng CHECK:

```sql
CHECK (score >= 0)
```

Giới hạn tối đa phải lấy từ cấu hình criteria nếu mỗi tiêu chí có thang điểm khác nhau.

Không hard-code một max score chung nếu tài liệu nghiệp vụ không quy định như vậy.

---

# 17. Score Lock

Sau khi score chuyển sang trạng thái khóa:

```text
Normal UPDATE = forbidden
```

Cơ chế bảo vệ có thể gồm:

```text
workflow state
version
locked_at
authorization
transaction
```

Trigger chỉ nên dùng nếu thực sự cần database-level enforcement.

---

# 18. Evidence Integrity

Evidence metadata phải chứa các trường cần thiết theo database design, ví dụ:

```text
application_id
criterion_id
object_key
original_filename
mime_type
size
checksum
version
created_at
```

Tên chính thức phải khớp `11_DATABASE_DESIGN.md`.

Binary file nên nằm trong object storage như MinIO nếu architecture đã chọn.

PostgreSQL lưu metadata và quan hệ nghiệp vụ.

---

# 19. Evidence Versioning

Không overwrite historical evidence.

Mô hình:

```text
Evidence
 ├── Version 1
 ├── Version 2
 └── Version 3
```

Mỗi version có metadata riêng.

Checksum có thể dùng để kiểm tra integrity.

---

# 20. Member Integrity

Member phải liên kết với cooperative.

Các business key như mã xã viên chỉ UNIQUE khi business rule yêu cầu.

Không tự áp đặt uniqueness cho email/số điện thoại nếu nghiệp vụ cho phép dữ liệu trùng hoặc chia sẻ.

---

# 21. Planting Area Integrity

Planting area phải liên kết với các entity liên quan theo database design, chẳng hạn:

```text
cooperative
member
crop
season
```

Các giá trị số như diện tích phải có CHECK phù hợp nếu nghiệp vụ yêu cầu:

```sql
CHECK (area > 0)
```

---

# 22. Inventory Integrity

Biến động kho phải được thể hiện bằng inventory transactions.

Không cho phép API tùy ý cập nhật:

```text
stock_quantity
```

mà bỏ qua transaction.

Source of truth phải được xác định rõ trong implementation.

---

# 23. Inventory Transaction Atomicity

Một nghiệp vụ nhập/xuất kho phải atomic:

```text
validate
   ↓
create transaction
   ↓
update/materialize balance
   ↓
audit
```

Nếu thất bại:

```text
ROLLBACK
```

---

# 24. Finance Integrity

Financial transactions phải được lưu dưới kiểu số chính xác, không dùng floating point cho tiền.

Khuyến nghị:

```text
NUMERIC(p,s)
```

Precision/scale cụ thể phải lấy từ physical database design.

Các giao dịch tài chính quan trọng không được xóa vật lý tùy tiện.

---

# 25. Profit Distribution Integrity

Phân chia lợi nhuận phải tham chiếu đúng dữ liệu nguồn.

Invariant tổng quát:

```text
Total distribution
≤
valid distributable amount
```

Công thức cụ thể phải lấy từ business requirements đã được xác nhận.

Không tự tạo công thức mới ở database implementation.

---

# 26. Audit Integrity

Audit log phải được bảo vệ theo nguyên tắc append-only về mặt nghiệp vụ.

User thông thường không được:

```text
UPDATE audit
DELETE audit
```

Audit nên ghi các thông tin cần thiết:

```text
actor
action
entity
entity_id
timestamp
result
metadata
```

Không lưu:

```text
password
JWT
secret
access token
```

---

# 27. Transaction và Audit

Các command nhạy cảm nên bảo đảm trạng thái nghiệp vụ và audit không bị lệch.

Ví dụ:

```text
Approve application
      ↓
Update state
      +
Create audit
```

Ưu tiên thực hiện trong cùng transaction khi phù hợp.

---

# 28. Index Strategy

Index phục vụ:

```text
Foreign keys
Frequent filters
Workflow lists
Search
Reporting
Unique business keys
```

Không tạo index cho mọi column.

Candidate indexes phải được kiểm chứng bằng query pattern thực tế.

---

# 29. Candidate Indexes

Có thể xem xét:

```text
members.cooperative_id
planting_areas.cooperative_id
planting_areas.member_id
planting_areas.season_id

ocop_applications.cooperative_id
ocop_applications.status
ocop_applications.criteria_version_id

evidence.application_id
evidence.criterion_id

evaluation_sessions.application_id
evaluation_sessions.status

evaluation_assignments.evaluation_session_id
evaluation_assignments.evaluator_id

evaluation_scores.assignment_id
evaluation_scores.criterion_id

audit_logs.actor_id
audit_logs.entity_id
audit_logs.created_at
```

Tên và index cuối cùng phải đối chiếu với `11_DATABASE_DESIGN.md`.

---

# 30. Composite Index

Chỉ dùng composite index khi query pattern thực tế cần.

Ví dụ:

```text
(cooperative_id, status)
```

hoặc:

```text
(evaluation_session_id, evaluator_id)
```

Không tạo composite index chỉ vì có nhiều foreign key.

---

# 31. Unique Constraints

Các candidate:

```text
member code
criteria version code
application reference
assignment uniqueness
```

Chỉ trở thành constraint chính thức khi được business/data design xác nhận.

---

# 32. CHECK Constraints

Ưu tiên CHECK cho invariant đơn giản:

```text
amount >= 0
area > 0
score >= 0
start_date <= end_date
```

Không đưa business logic phức tạp vào CHECK.

---

# 33. Nullability

`NOT NULL` chỉ dùng khi field bắt buộc ở lifecycle tương ứng.

Ví dụ:

```text
created_at NOT NULL
```

Field chỉ xuất hiện sau transition có thể nullable trước transition.

---

# 34. Workflow State và Business Data

Không trộn workflow status với business attributes.

Ví dụ:

```text
application.status
```

khác:

```text
application.completeness_score
```

Workflow state phải được cập nhật thông qua domain/service action tương ứng.

---

# 35. Historical Data

Historical records phải giữ được:

```text
who
what
when
which version
which state
```

Đặc biệt:

```text
OCOP evaluation
scores
evidence versions
decisions
audit
```

---

# 36. Referential Stability

Thay đổi dữ liệu hiện hành không được phá historical interpretation.

Ví dụ:

```text
Current criteria changes
Current role changes
Current catalog changes
```

không được làm mất khả năng đọc/giải thích dữ liệu lịch sử.

---

# 37. User Deactivation

Khi user bị deactivate:

```text
active = false
```

không cascade-delete business history.

Audit/evaluation history phải được bảo toàn theo requirements.

---

# 38. Multi-Cooperative Data Scope

Nếu nhiều HTX dùng chung database:

```text
cooperative_id
```

là data-scope boundary quan trọng.

Các service query phải bảo đảm không trả dữ liệu HTX khác.

RBAC/data scope nằm ở application/domain authorization; database constraints chỉ là lớp bảo vệ bổ sung.

---

# 39. Cross-Cooperative Access

Các endpoint như:

```text
GET /members/{id}
GET /ocop/applications/{id}
GET /evidence/{id}
```

phải kiểm tra scope trước khi trả dữ liệu.

Không coi việc biết ID là đủ quyền truy cập.

---

# 40. Reporting

Không tạo bảng report riêng chỉ để giải quyết query chậm ngay từ đầu.

Ưu tiên:

```text
proper indexes
views
materialized views
read models
```

chỉ khi workload thực tế chứng minh cần.

---

# 41. Large Tables

Các bảng có khả năng tăng nhanh:

```text
audit_logs
operation_journal
inventory_transactions
financial_transactions
evidence_versions
evaluation_scores
```

phải được theo dõi growth.

Partitioning chỉ thực hiện khi có nhu cầu thực tế.

---

# 42. Transaction Boundaries

Các use case quan trọng nên có transaction boundary rõ ràng:

| Use Case | Transaction |
|---|---|
| Create member | Khi tạo nhiều record liên quan |
| Capital contribution | Có |
| Inventory receipt | Có |
| Inventory issue | Có |
| Financial posting | Có |
| Submit OCOP application | Có |
| Return application | Có |
| Verify evidence | Có |
| Save score | Có |
| Lock score | Có |
| Consolidate evaluation | Có |
| Approve/Reject | Có |
| Profit distribution approval | Có |

---

# 43. API / Domain / Database Boundary

## API layer

```text
Request validation
Authentication
Authorization
```

## Domain/service layer

```text
Business rules
Workflow
Calculations
Cross-entity validation
```

## Database

```text
Referential integrity
Unique constraints
Simple invariants
Transaction atomicity
Persistence
```

Không dồn toàn bộ business workflow vào database.

---

# 44. Calculation Source of Truth

Các calculation quan trọng:

```text
OCOP score
Inventory balance
Profit distribution
```

phải có một source of truth.

Không để frontend/backend/database tự tính cùng một nghiệp vụ theo ba cách khác nhau.

---

# 45. OCOP Score Calculation

Công thức không hard-code trong migration.

Nên phụ thuộc:

```text
criteria version
criterion configuration
score rules
```

Historical result phải có khả năng reproducible từ dữ liệu đã lưu.

---

# 46. Versioned Business Rules

Nếu business rule có khả năng thay đổi, có thể cần:

```text
version
effective_from
effective_to
```

Không sửa historical data để áp dụng rule mới.

---

# 47. Migration Rules

Mọi schema change phải thông qua migration có version.

Migration phải:

```text
versioned
reviewable
testable
repeatable
```

Không sửa production schema thủ công mà không có record.

---

# 48. Migration Naming

Ví dụ:

```text
202609010001_create_cooperatives
202609010002_create_members
202609010003_create_criteria_versions
```

Tên thực tế phụ thuộc framework backend.

---

# 49. Seed Strategy

Seed dùng cho:

```text
Reference data
Development data
Test fixtures
```

Không seed dữ liệu giả vào production nếu chưa được phê duyệt.

---

# 50. Reference Data

Các dữ liệu nền:

```text
roles
permissions
statuses
council levels
catalogs
```

phải có chiến lược quản lý rõ ràng.

Ví dụ:

```text
migration
seed
administrative UI
```

Không để frontend tự định nghĩa vocabulary.

---

# 51. Migration Compatibility

Khi schema thay đổi:

```text
Migration
   ↓
Backend compatibility
   ↓
API compatibility
   ↓
Frontend compatibility
   ↓
Tests
```

Không deploy migration phá API đang chạy mà không có deployment plan.

---

# 52. Concurrency

Các nghiệp vụ cạnh tranh như:

```text
Inventory issue
Score lock
Final consolidation
Approval
```

phải đánh giá:

```text
row locking
optimistic concurrency
```

PostgreSQL default:

```text
READ COMMITTED
```

có thể đủ cho nhiều CRUD thông thường.

---

# 53. Row Locking

Có thể sử dụng:

```sql
SELECT ...
FOR UPDATE;
```

khi cần serialize cập nhật cùng một resource.

Chỉ lock record cần thiết.

---

# 54. Optimistic Concurrency

Các resource có nhiều người chỉnh sửa có thể dùng:

```text
version
updated_at
ETag
```

Stale update có thể trả:

```text
409 Conflict
```

---

# 55. Database Security

Application DB user phải theo least privilege.

Không cấp production application user:

```text
SUPERUSER
CREATE ROLE
DROP DATABASE
```

hoặc quyền không cần thiết.

---

# 56. Secrets

Không commit:

```text
DB password
JWT secret
MinIO secret
API secret
```

vào source code.

Dùng:

```text
environment variables
secret manager
deployment secrets
```

---

# 57. File Storage

Nếu sử dụng MinIO:

```text
PostgreSQL
    stores metadata
        ↓
MinIO
    stores binary
```

Database record phải là source of truth cho quan hệ business giữa evidence và hồ sơ.

---

# 58. Backup

Phải có:

```text
scheduled backup
retention
backup verification
restore test
```

Có file backup không đồng nghĩa với việc disaster recovery đã hoàn thành.

---

# 59. Restore Test

Quy trình kiểm tra:

```text
Backup
 ↓
Restore
 ↓
Integrity check
 ↓
Application startup
 ↓
Critical query
```

---

# 60. Test Database

CI nên chạy database test gần production schema.

Tối thiểu:

```text
migration
seed
constraints
repositories
transactions
critical workflows
```

---

# 61. Constraint Tests

Kiểm thử:

```text
Invalid FK
Duplicate unique key
Invalid amount
Invalid area
Invalid score
Invalid criteria-version relation
Duplicate assignment
Invalid state persistence
```

---

# 62. Migration Tests

Kiểm tra:

```text
Empty database → latest migration
```

Nếu hỗ trợ rollback:

```text
Latest → previous
```

---

# 63. Performance Baseline

Critical queries:

```text
Application list
Application detail
Evidence list
Evaluation session list
Evaluator assignment list
Score list
Dashboard
Audit search
```

Đo trước khi tối ưu.

---

# 64. Observability

Theo dõi:

```text
Connection count
Query latency
Slow queries
Deadlocks
Locks
Database size
Storage growth
Backup status
```

---

# 65. Connection Pool

Backend phải dùng connection pool phù hợp.

Không tạo connection PostgreSQL mới cho từng request nếu framework đã hỗ trợ pooling.

---

# 66. Environment Separation

Phân biệt:

```text
development
test
staging
production
```

Không sử dụng production data trong development nếu chưa có biện pháp bảo vệ/anonymization phù hợp.

---

# 67. Production Data Change

Manual SQL production phải:

```text
authorized
reviewed
documented
audited
```

Ưu tiên migration hoặc application command.

---

# 68. Database Invariants

Baseline:

```text
I-001 Business entities have valid primary keys.
I-002 Child records cannot reference missing parents.
I-003 Historical OCOP records retain criteria version.
I-004 Evidence history is versioned.
I-005 Locked scores cannot be edited through normal workflow.
I-006 Inventory changes are represented by transactions.
I-007 Financial transactions remain traceable.
I-008 Audit records are protected from ordinary modification.
I-009 Cooperative data scope is enforced by authorized services.
I-010 Evaluation session supports PROVINCE and CENTRAL.
I-011 Historical results remain reproducible.
I-012 Critical state-changing operations are transactional.
```

---

# 69. Traceability Requirement

Mỗi persistent business table phải có khả năng truy vết:

```text
Business Requirement
        ↓
Functional Requirement
        ↓
Use Case
        ↓
Workflow
        ↓
Permission
        ↓
API
        ↓
Database Table
        ↓
Test
```

Đây là điều kiện quan trọng trước khi chuyển sang implementation thực tế.

---

# 70. Reconciliation Matrix

Phải lập ma trận:

| Table | API | Use Case | Workflow | Permission | Data Scope | Test |
|---|---|---|---|---|---|---|
| Theo 11_DATABASE_DESIGN | TBD | TBD | TBD | TBD | TBD | TBD |

Không đánh dấu hoàn thành khi chưa đối chiếu từng bảng thực tế.

---

# 71. Reconciliation Log

| ID | Issue | Source | Decision | Status |
|---|---|---|---|---|
| DB-R-001 | Exact final table/column inventory | 11_DATABASE_DESIGN | Reconcile before migration | OPEN |
| DB-R-002 | Exact criteria schema | 04/07/08/11 | Reconcile | OPEN |
| DB-R-003 | Exact workflow status vocabulary | 16/11 | Reconcile | OPEN |
| DB-R-004 | Exact permission vocabulary | 15/17 | Reconcile | OPEN |
| DB-R-005 | Evaluation schema and council level | 11/16/17 | Reconcile | OPEN |
| DB-R-006 | Finance/profit distribution rules | 07/08/11 | Confirm business rule | OPEN |

---

# 72. Definition of Done

- [ ] Tables reconciled with `11_DATABASE_DESIGN.md`.
- [ ] Primary keys verified.
- [ ] Foreign keys verified.
- [ ] Nullability verified.
- [ ] Unique constraints verified.
- [ ] CHECK constraints verified.
- [ ] OCOP criteria versioning verified.
- [ ] Historical evaluation integrity verified.
- [ ] `PROVINCE` and `CENTRAL` supported.
- [ ] Evidence versioning verified.
- [ ] Score lifecycle verified.
- [ ] Inventory transaction integrity verified.
- [ ] Financial transaction integrity verified.
- [ ] Audit strategy verified.
- [ ] Data scope implications verified.
- [ ] Migration strategy defined.
- [ ] Seed strategy defined.
- [ ] Backup/restore strategy defined.
- [ ] Test database strategy defined.
- [ ] API/database mapping completed.
- [ ] Workflow/database mapping completed.
- [ ] No unresolved critical schema conflict remains.

---

# 73. Implementation Priority

## P0 – Mandatory

```text
Core schema
PK/FK
NOT NULL
UNIQUE
Core CHECK constraints
Criteria versioning
Evaluation relationships
Financial/inventory transaction integrity
Audit persistence
```

## P1 – Important

```text
Indexes
Concurrency control
File checksum
Reporting views
Backup automation
Restore test
```

## P2 – Optimization

```text
Materialized views
Partitioning
Advanced RLS
Performance tuning
```

---

# 74. Next Document

Sau khi `18_DATABASE_IMPLEMENTATION.md` được đối chiếu với database design thực tế, bước tiếp theo là:

```text
19_TRACEABILITY_MATRIX.md
```

Mục tiêu:

```text
Requirement
   ↓
Use Case
   ↓
Workflow
   ↓
Permission
   ↓
API
   ↓
Database
   ↓
Test Case
```

Sau khi traceability hoàn chỉnh mới nên sinh migration cụ thể và bắt đầu backend implementation.
