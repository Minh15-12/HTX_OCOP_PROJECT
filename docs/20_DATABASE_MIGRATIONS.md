# 20_DATABASE_MIGRATIONS.md

# Kế hoạch Migration Cơ sở dữ liệu

## 1. Document Information

| Field | Value |
|---|---|
| Document ID | 20 |
| Document Name | Database Migration Specification |
| Project | Xây dựng Hệ thống quản lý hoạt động Hợp tác xã nông nghiệp và số hóa hồ sơ đánh giá, phân hạng OCOP |
| Status | Baseline |
| Depends On | 11_DATABASE_DESIGN.md, 18_DATABASE_IMPLEMENTATION.md, 19_TRACEABILITY_MATRIX.md |
| Purpose | Chuyển thiết kế CSDL logic/vật lý thành kế hoạch migration có thứ tự dependency rõ ràng |
| Target DB | PostgreSQL |
| Next Stage | Backend implementation |

---

# 2. Mục tiêu

Migration phải bảo đảm:

1. Có thể tạo database từ trạng thái rỗng.
2. Thứ tự migration không vi phạm FK dependency.
3. Có thể rollback trong phạm vi an toàn.
4. Reference data có seed rõ ràng.
5. Schema migration không làm mất dữ liệu lịch sử.
6. Các bảng nghiệp vụ quan trọng có constraint/index phù hợp.
7. Migration có thể chạy tự động trong CI/CD.
8. Database sau migration phù hợp với Database Design và Traceability Matrix.
9. Chính sách OCOP được lưu theo version thay vì hard-code.
10. Hỗ trợ `PROVINCE` và `CENTRAL` ở lớp cấu hình council level theo baseline hiện tại.

---

# 3. Nguyên tắc

## 3.1. Database Design là nguồn tham chiếu

Migration không được tự ý tạo bảng/column chỉ vì implementation thuận tiện.

Nếu phát sinh nhu cầu mới:

```text
Requirement
    ↓
Domain
    ↓
Database Design
    ↓
Migration
```

## 3.2. Không sửa lịch sử bằng migration nghiệp vụ

Migration schema có thể thay đổi cấu trúc database, nhưng không được dùng để âm thầm sửa kết quả OCOP, giao dịch tài chính hoặc audit history.

## 3.3. Migration phải deterministic

Cùng một codebase + cùng database state phải cho cùng kết quả migration.

## 3.4. Migration phải idempotent ở mức framework

Việc chạy lại migration phải được framework quản lý bằng migration history.

Không viết migration theo kiểu:

```sql
CREATE TABLE IF NOT EXISTS ...
```

một cách tùy tiện nếu framework migration đã quản lý version.

---

# 4. Migration Naming Convention

Khuyến nghị:

```text
YYYYMMDDHHMMSS_create_<table>_table
YYYYMMDDHHMMSS_add_<column>_to_<table>
YYYYMMDDHHMMSS_create_<index>
YYYYMMDDHHMMSS_create_<constraint>
YYYYMMDDHHMMSS_create_<trigger>
```

Ví dụ:

```text
20260902000100_create_users_table
20260902000200_create_cooperatives_table
20260902000300_create_members_table
```

Tên thực tế phụ thuộc framework backend.

---

# 5. PostgreSQL Baseline

Database sử dụng PostgreSQL.

Các lựa chọn baseline:

- UUID cho primary key;
- `TIMESTAMPTZ` cho timestamp nghiệp vụ;
- `NUMERIC/DECIMAL` cho tiền và số liệu cần độ chính xác;
- `BOOLEAN` cho cờ logic;
- `JSONB` chỉ dùng khi dữ liệu thực sự linh hoạt;
- FK cho quan hệ;
- UNIQUE cho business key cần duy nhất;
- CHECK cho invariant đơn giản và ổn định.

Không dùng floating point cho số tiền.

---

# 6. Extension Strategy

Nếu hệ thống sử dụng UUID do database sinh, có thể sử dụng extension phù hợp.

Ví dụ:

```sql
CREATE EXTENSION IF NOT EXISTS pgcrypto;
```

Hoặc dùng UUID do application tạo.

Chỉ chọn một chiến lược thống nhất.

### Khuyến nghị baseline

Application có thể sinh UUID và database lưu dưới kiểu UUID.

Ưu điểm:

- dễ test;
- không phụ thuộc extension;
- thuận tiện khi tạo entity trước transaction;
- phù hợp API/domain layer.

---

# 7. Migration Dependency Graph

Thứ tự logic:

```text
Extensions
   ↓
Reference / configuration
   ↓
Identity
   ↓
Cooperative
   ↓
Members
   ↓
Agriculture master data
   ↓
Production
   ↓
Products / Lots
   ↓
Inventory
   ↓
Finance
   ↓
OCOP criteria
   ↓
OCOP applications
   ↓
Evaluation
   ↓
Evidence
   ↓
Workflow
   ↓
Audit
   ↓
Reports / document metadata
```

---

# 8. Phase M0 — Database Bootstrap

## M0.1. Database

Tạo database bằng infrastructure/deployment configuration.

Migration application không nên chịu trách nhiệm tạo PostgreSQL server/database trong production.

## M0.2. Extension

Nếu cần:

```sql
CREATE EXTENSION IF NOT EXISTS pgcrypto;
```

## M0.3. Migration metadata

Framework backend quản lý bảng migration history.

---

# 9. Phase M1 — Identity & Authorization

Các bảng nền tảng:

```text
users
roles
permissions
role_permissions
user_roles
```

Nếu thiết kế có session/token/revocation table thì bổ sung ở phase này.

Dependency:

```text
roles
permissions
    ↓
role_permissions
    ↓
users
    ↓
user_roles
```

### Constraint

- username/email hoặc login identifier phải theo business rule;
- role name unique;
- permission code unique;
- FK phải tồn tại;
- không cho duplicate role-permission;
- không cho duplicate user-role.

---

# 10. Phase M2 — Cooperative

Bảng chính:

```text
cooperatives
```

Nếu có bảng địa giới/master data trong thiết kế, tạo trước cooperative hoặc theo dependency tương ứng.

### Nguyên tắc

Mọi dữ liệu tenant phải có:

```text
cooperative_id
```

nếu thuộc phạm vi HTX.

---

# 11. Phase M3 — Member Management

Bảng chính:

```text
members
```

Dependency:

```text
cooperatives
    ↓
members
```

Nếu user account liên kết với member:

```text
users
    ↓
members
```

hoặc:

```text
members
    ↓
users
```

phải tuân theo Database Design đã chốt.

Không tự tạo quan hệ hai chiều bắt buộc nếu chưa được thiết kế.

---

# 12. Phase M4 — Agriculture Master Data

Nhóm master data:

```text
crops
production_units
```

Sau đó:

```text
farm_plots
```

Dependency:

```text
cooperatives
members
crops
    ↓
production_units
    ↓
farm_plots
```

Các trường diện tích, tọa độ, mã vùng phải dùng kiểu dữ liệu phù hợp với Database Design.

---

# 13. Phase M5 — Seasons & Farming Operations

Bảng:

```text
seasons
farming_logs
```

Dependency:

```text
farm_plots
crops
    ↓
seasons
    ↓
farming_logs
```

Nếu nhật ký sản xuất tham chiếu member/operator, phải tạo FK tương ứng.

---

# 14. Phase M6 — Harvest & Lots

Bảng:

```text
harvests
lots
```

Dependency:

```text
farm_plots
seasons
    ↓
harvests
    ↓
lots
```

Mục tiêu:

```text
Lot
 ↓
Production source
 ↓
Farm plot
 ↓
Season
 ↓
Cooperative
```

Không được tạo lot không xác định được nguồn nếu Database Design yêu cầu traceability bắt buộc.

---

# 15. Phase M7 — Products

Bảng:

```text
products
```

Dependency:

```text
cooperatives
    ↓
products
```

Nếu lot tham chiếu product:

```text
products
    ↓
lots
```

thì migration phải điều chỉnh thứ tự tương ứng với schema thực tế.

---

# 16. Phase M8 — Inventory Master

Bảng:

```text
materials
warehouses
```

Dependency:

```text
cooperatives
    ↓
materials
warehouses
```

Nếu warehouse có người phụ trách:

```text
users
    ↓
warehouses
```

---

# 17. Phase M9 — Inventory Transactions

Bảng:

```text
inventory_transactions
```

Dependency:

```text
materials
warehouses
users
    ↓
inventory_transactions
```

Có thể mở rộng thêm reference đến:

- purchase;
- production;
- harvest;
- adjustment;

nếu Database Design chính thức có các quan hệ đó.

### Invariant

Không cho phép giao dịch có:

- số lượng không hợp lệ;
- warehouse không tồn tại;
- material không tồn tại;
- transaction type không hợp lệ.

Việc kiểm soát tồn kho âm phải theo Business Rules đã phê duyệt.

---

# 18. Phase M10 — Finance

Các bảng dự kiến theo Database Design:

```text
finance_transactions
receivables
payables
settlements
distribution_plans
```

Dependency:

```text
cooperatives
users
    ↓
finance_transactions
    ↓
receivables / payables
    ↓
settlements
    ↓
distribution_plans
```

Nếu các bảng thực tế trong Document 11 có tên khác, phải dùng đúng tên canonical của Document 11.

---

# 19. Phase M11 — OCOP Reference Configuration

Đây là phase quan trọng.

Tạo:

```text
criteria_versions
criteria
indicators
council_levels
```

Dependency:

```text
council_levels

criteria_versions
    ↓
criteria
    ↓
indicators
```

## 19.1. Council Level Seed

Baseline:

```text
PROVINCE
CENTRAL
```

Các giá trị này là reference/configuration, không nên hard-code trực tiếp trong business logic.

## 19.2. Criteria Version

Mỗi bộ tiêu chí phải có version.

Ví dụ khái niệm:

```text
criteria_version
 ├── effective_from
 ├── effective_to
 ├── status
 └── source_reference
```

Tên column thực tế phải theo Database Design.

---

# 20. Phase M12 — OCOP Application

Bảng:

```text
ocop_applications
```

Dependency:

```text
cooperatives
products
criteria_versions
users
    ↓
ocop_applications
```

Hồ sơ phải tham chiếu đúng phiên bản tiêu chí áp dụng.

Không lấy criteria version hiện tại một cách động để giải thích hồ sơ cũ.

---

# 21. Phase M13 — OCOP Evaluation

Các bảng:

```text
evaluation_sessions
evaluation_assignments
evaluation_scores
```

Dependency:

```text
ocop_applications
council_levels
users
    ↓
evaluation_sessions
    ↓
evaluation_assignments
    ↓
evaluation_scores
```

`evaluation_sessions` phải có liên kết đến council level theo Database Design.

Baseline:

```text
PROVINCE
CENTRAL
```

---

# 22. Phase M14 — Evidence

Các bảng:

```text
evidence
evidence_versions
```

Nếu có bảng liên kết:

```text
evidence_links
```

thì tạo sau evidence và các entity được liên kết.

Dependency:

```text
ocop_applications
criteria / indicators
users
    ↓
evidence
    ↓
evidence_versions
```

File thật không lưu trực tiếp trong PostgreSQL nếu kiến trúc sử dụng object storage.

Database lưu metadata/object reference.

---

# 23. Phase M15 — Workflow

Các bảng:

```text
workflow_definitions
workflow_versions
workflow_instances
workflow_transitions
```

Tên thực tế phải khớp Database Design.

Dependency:

```text
workflow definitions/version
        ↓
workflow instances
        ↓
workflow transitions
```

Workflow version phải bảo đảm hồ sơ lịch sử có thể giải thích bằng version đã dùng tại thời điểm xử lý.

---

# 24. Phase M16 — Audit

Bảng:

```text
audit_logs
```

Audit phải được tạo sau các bảng nghiệp vụ hoặc có thể tạo độc lập nếu schema không FK trực tiếp đến từng entity.

Khuyến nghị:

```text
audit_logs
```

không có FK cứng tới mọi bảng nghiệp vụ nếu điều đó gây khó khăn cho historical audit.

Audit record phải lưu đủ thông tin để xác định:

- actor;
- action;
- resource;
- resource ID;
- timestamp;
- scope;
- request/correlation ID nếu có;
- before/after hoặc metadata phù hợp;
- IP/user-agent nếu chính sách bảo mật cho phép.

---

# 25. Phase M17 — Documents / Reports Metadata

Nếu Database Design có bảng quản lý tài liệu sinh ra:

```text
document_jobs
documents
```

thì tạo sau các entity nguồn.

Dependency:

```text
application/report
      ↓
document metadata
```

File PDF/DOCX thực tế lưu ở object storage.

---

# 26. Foreign Key Strategy

Mọi FK phải:

1. Có index nếu cần cho lookup/join.
2. Có ON DELETE/ON UPDATE strategy rõ ràng.
3. Không cascade xóa dữ liệu lịch sử một cách nguy hiểm.

### Khuyến nghị

Master → child nghiệp vụ:

```text
ON DELETE RESTRICT
```

hoặc soft delete ở application layer.

Historical records:

```text
Không cascade delete.
```

Audit:

```text
Không cascade delete.
```

---

# 27. Soft Delete Strategy

Chỉ dùng soft delete cho entity phù hợp.

Ví dụ:

```text
members
products
materials
warehouses
```

có thể cần `deleted_at` nếu nghiệp vụ cho phép.

Không dùng soft delete một cách máy móc cho:

```text
audit_logs
financial transactions
evaluation scores
workflow transitions
```

Các dữ liệu này nên immutable hoặc được kiểm soát bằng trạng thái/version.

---

# 28. Unique Constraint Strategy

Các business key cần duy nhất phải được constraint ở DB.

Ví dụ:

```text
permission.code
role.code
```

và các mã nghiệp vụ được xác định trong Database Design.

Không chỉ kiểm tra unique ở frontend/backend.

---

# 29. Check Constraint Strategy

CHECK constraint phù hợp với invariant đơn giản và ổn định.

Ví dụ:

```text
quantity >= 0
amount >= 0
score >= 0
```

Nhưng không đưa quy tắc chính sách OCOP dễ thay đổi thành CHECK cứng nếu nó cần thay đổi theo version.

Ví dụ không nên:

```sql
CHECK (score <= 100)
```

nếu phạm vi điểm phụ thuộc cấu hình chỉ tiêu và version.

Thay vào đó:

```text
criteria_version
    ↓
indicator rule
    ↓
application validation
    ↓
transaction validation
```

---

# 30. Index Strategy

Mỗi migration table phải xem xét:

### Primary key

Tự động tạo index.

### Foreign key

Tạo index khi thường xuyên:

- join;
- filter;
- authorization scope;
- reporting.

### Search

Index cho các trường tìm kiếm phổ biến.

### Composite

Ví dụ:

```text
(cooperative_id, status)
(cooperative_id, created_at)
(application_id, status)
(evaluation_session_id, evaluator_id)
```

Chỉ tạo khi workload thực tế cần.

Không tạo index mọi column.

---

# 31. Tenant Isolation Index

Các bảng tenant-scoped thường cần:

```text
cooperative_id
```

và index:

```text
(cooperative_id, ...)
```

Điều này hỗ trợ:

- data scope;
- query performance;
- reporting;
- authorization.

---

# 32. Migration Transaction Strategy

Migration đơn giản:

```text
BEGIN
    schema changes
COMMIT
```

Nếu framework hỗ trợ transactional DDL của PostgreSQL, tận dụng cho migration phù hợp.

Migration dữ liệu lớn cần đánh giá:

- lock;
- downtime;
- batch;
- timeout;
- rollback.

---

# 33. Large Data Migration

Không chạy một UPDATE khổng lồ trong production nếu có thể gây lock dài.

Thay vào đó:

```text
1. Add nullable column
2. Deploy compatible application
3. Backfill in batches
4. Verify
5. Add constraint
6. Make NOT NULL if required
7. Remove old column in later release
```

Đây là chiến lược expand → migrate → contract.

---

# 34. Seed Data

Seed data chia thành:

## 34.1. System reference

Có thể seed:

```text
roles
permissions
council_levels
```

## 34.2. Policy configuration

OCOP criteria phải được seed theo version có nguồn và trạng thái rõ ràng.

## 34.3. Development seed

Dữ liệu demo chỉ dùng development/test.

Không đưa dữ liệu cá nhân thật vào repository.

---

# 35. Seed Council Levels

Baseline:

```text
code = PROVINCE
name = Cấp tỉnh
```

```text
code = CENTRAL
name = Cấp trung ương
```

Nếu policy source thay đổi, không xóa lịch sử.

---

# 36. Seed OCOP Criteria

Không hard-code một bộ tiêu chí chưa được xác minh.

Seed production phải có:

```text
source_reference
version
effective_from
status
```

và phải được đối chiếu với nguồn chính thức trước khi đánh dấu production-ready.

---

# 37. Environment Separation

Migration phải phân biệt:

```text
local
development
test
staging
production
```

Không dùng chung database.

Production không chạy development seed.

---

# 38. Migration Rollback

Mỗi migration phải xác định:

```text
up()
down()
```

Nhưng rollback production cần thận trọng.

Không rollback migration có nguy cơ làm mất dữ liệu mà không có backup và migration phục hồi phù hợp.

Ví dụ:

```text
DROP COLUMN
DROP TABLE
```

không được xem là rollback an toàn mặc định.

---

# 39. Destructive Migration Policy

Các thao tác:

```text
DROP TABLE
DROP COLUMN
TRUNCATE
ALTER TYPE destructive
```

phải có:

1. Change approval.
2. Backup.
3. Impact analysis.
4. Rollback/recovery plan.
5. Test staging.
6. Data verification.

---

# 40. Migration Testing

Mỗi migration phải test:

```text
empty database
        ↓
run all migrations
        ↓
schema validation
        ↓
seed
        ↓
application tests
```

Test rollback nếu framework/project yêu cầu.

---

# 41. Schema Validation

Sau migration phải kiểm tra:

- table tồn tại;
- column đúng kiểu;
- PK tồn tại;
- FK tồn tại;
- unique tồn tại;
- check tồn tại;
- index tồn tại;
- default đúng;
- nullable đúng;
- seed đúng.

Có thể dùng schema inspection trong CI.

---

# 42. Migration → Traceability

Migration phải truy xuất được về:

```text
Migration
 ↓
DB Object
 ↓
Domain Entity
 ↓
FR
 ↓
BR
```

Ví dụ:

```text
create_evaluation_sessions
    ↓
evaluation_sessions
    ↓
Evaluation Session
    ↓
FR-OCOP-007
    ↓
BR-OCOP-007
```

---

# 43. Migration → API Compatibility

Khi thay đổi schema:

```text
Migration
    ↓
Repository
    ↓
Service
    ↓
API
    ↓
OpenAPI
    ↓
Test
```

Không merge migration làm API hiện tại hỏng nếu chưa có kế hoạch compatibility.

---

# 44. Backward Compatibility

Với thay đổi API/schema đang sử dụng:

### Safe

```text
ADD nullable column
ADD new table
ADD new index
```

### Risky

```text
RENAME column
DROP column
CHANGE type
MAKE nullable → NOT NULL
```

Risky migration phải có rollout plan.

---

# 45. Concurrency

Các bảng nhạy cảm:

```text
inventory_transactions
finance_transactions
evaluation_scores
workflow_instances
```

phải được thiết kế để tránh lost update.

Có thể sử dụng:

- transaction;
- row-level locking;
- optimistic locking;
- unique constraint;
- version column.

Chiến lược cụ thể phải thống nhất với backend implementation.

---

# 46. Financial Integrity

Migration phải hỗ trợ các invariant:

```text
amount >= 0
```

nếu business rule yêu cầu.

Các giao dịch đã finalized không được update/delete tùy tiện.

Không dùng migration để tính lại lịch sử tài chính ngoài change procedure đã được phê duyệt.

---

# 47. Inventory Integrity

Tồn kho phải có nguồn từ transaction.

Không tạo bảng snapshot tồn kho làm source-of-truth nếu Database Design đã xác định transaction ledger là nguồn chính.

Nếu có cached/current balance:

```text
Transaction Ledger
       ↓
Current Balance
```

và phải có reconciliation.

---

# 48. OCOP Score Integrity

Điểm đánh giá phải gắn với:

```text
application
evaluation_session
indicator
evaluator
criteria_version
```

Nếu schema đã lưu criteria version ở application/session, không duplicate tùy tiện.

Điểm sau khi khóa không được sửa trực tiếp.

---

# 49. Historical Integrity

Migration không được phá:

```text
old criteria version
old workflow version
old evidence version
old evaluation score
old audit record
old financial transaction
```

Mục tiêu:

```text
Current Configuration
        ≠
Historical Interpretation
```

Lịch sử phải được giải thích bằng cấu hình/version đã áp dụng tại thời điểm đó.

---

# 50. Data Scope Integrity

Tenant-scoped table:

```text
cooperative_id
```

phải được kiểm tra.

Các FK xuyên tenant cần tránh hoặc phải có cơ chế bảo đảm cùng `cooperative_id`.

Không dựa hoàn toàn vào frontend để bảo vệ tenant isolation.

---

# 51. Application-Level Validation vs DB Constraint

## DB nên kiểm soát

- PK;
- FK;
- unique;
- simple check;
- NOT NULL;
- referential integrity.

## Application/domain nên kiểm soát

- workflow transition;
- permission;
- SoD;
- policy version;
- complex OCOP scoring;
- business process;
- cross-module business rules.

---

# 52. Migration Security

Migration credentials:

- không commit vào Git;
- không hard-code password;
- sử dụng environment/secret manager;
- production migration chạy bằng account phù hợp;
- hạn chế quyền DDL ngoài migration process.

---

# 53. Backup Before Production Migration

Trước migration có destructive/high-risk change:

```text
Backup
 ↓
Verify backup
 ↓
Migration
 ↓
Schema check
 ↓
Application smoke test
 ↓
Business verification
```

Không coi migration thành công chỉ vì process exit code = 0.

---

# 54. Migration Observability

Production migration cần log:

```text
migration version
start time
end time
success/failure
duration
environment
release version
```

Không log secrets.

---

# 55. CI/CD Pipeline

Khuyến nghị:

```text
Commit
 ↓
Lint
 ↓
Unit Test
 ↓
Build
 ↓
Migration Test
 ↓
Integration Test
 ↓
Build Image
 ↓
Staging Deploy
 ↓
Staging Migration
 ↓
Smoke Test
 ↓
Production Approval
 ↓
Production Migration
 ↓
Health Check
```

---

# 56. Initial Migration Batch

Có thể chia migration thành các release:

```text
Release 1
- Identity
- Cooperative
- Members

Release 2
- Agriculture
- Products

Release 3
- Inventory
- Finance

Release 4
- OCOP criteria
- Applications

Release 5
- Evaluation
- Evidence
- Workflow

Release 6
- Audit
- Documents
- Reporting support
```

Không bắt buộc mỗi phase tương ứng đúng một migration file.

---

# 57. Recommended Migration File Order

Tên cụ thể phải lấy từ schema canonical, nhưng thứ tự logic nên là:

```text
001_enable_extensions
002_create_roles
003_create_permissions
004_create_role_permissions
005_create_users
006_create_user_roles

007_create_cooperatives
008_create_members

009_create_crops
010_create_production_units
011_create_farm_plots
012_create_seasons
013_create_farming_logs
014_create_harvests
015_create_lots

016_create_products

017_create_materials
018_create_warehouses
019_create_inventory_transactions

020_create_finance_transactions
021_create_receivables
022_create_payables
023_create_settlements
024_create_distribution_plans

025_create_council_levels
026_create_criteria_versions
027_create_criteria
028_create_indicators

029_create_ocop_applications

030_create_evaluation_sessions
031_create_evaluation_assignments
032_create_evaluation_scores

033_create_evidence
034_create_evidence_versions
035_create_evidence_links

036_create_workflow_definitions
037_create_workflow_versions
038_create_workflow_instances
039_create_workflow_transitions

040_create_audit_logs

041_create_document_metadata
042_create_report_metadata

043_add_indexes
044_add_constraints
045_seed_reference_data
```

**Lưu ý:** danh sách trên là migration plan baseline. Trước khi code phải đối chiếu từng table/column với Document 11 và 18.

---

# 58. Migration Reconciliation With Document 11

Trước khi viết code phải lập bảng:

| DB Design | Migration | Exists | Dependency | Decision |
|---|---|---|---|---|
| cooperatives | create_cooperatives | Yes | — | Keep |
| members | create_members | Yes | cooperatives | Keep |
| production_units | create_production_units | Yes | cooperative | Keep |
| farm_plots | create_farm_plots | Yes | production | Keep |
| ... | ... | ... | ... | ... |

Nếu table trong 11 không xuất hiện ở migration plan:

```text
GAP
```

Nếu migration plan có table không có trong 11:

```text
CONFLICT
```

Không tự động bỏ qua.

---

# 59. Migration Reconciliation With Domain Model

Tương tự:

```text
Domain Entity
    ↓
DB Table
    ↓
Migration
```

Ví dụ:

```text
EvaluationSession
    ↓
evaluation_sessions
    ↓
create_evaluation_sessions
```

Mọi entity persistent phải có mapping rõ ràng.

---

# 60. Migration Reconciliation With Traceability

Migration phải có:

```text
DB ID
BR ID
FR ID
UC ID
```

đối với bảng nghiệp vụ chính.

Ví dụ:

```text
DB-EVALUATION-001
→ BR-OCOP-007
→ FR-OCOP-007
→ UC-OCOP-007
→ evaluation_sessions
→ migration 030
```

---

# 61. Database Seed Safety

Seed production phải:

- deterministic;
- có mã ổn định;
- không tạo duplicate;
- không phụ thuộc ID ngẫu nhiên;
- không ghi đè dữ liệu business;
- có thể chạy lại an toàn theo chiến lược của framework.

Không dùng:

```text
firstOrCreate
```

hoặc tương đương một cách tùy tiện nếu key không ổn định.

---

# 62. Reference Data Versioning

Reference data có hai loại:

### Stable

Ví dụ:

```text
PROVINCE
CENTRAL
```

### Policy-driven

Ví dụ:

```text
criteria_versions
criteria
indicators
workflow versions
document templates
```

Policy-driven data phải có version/effective date/status phù hợp.

---

# 63. Production Migration Checklist

Trước khi chạy production:

- [ ] Backup hoàn thành.
- [ ] Backup đã verify.
- [ ] Migration test trên staging thành công.
- [ ] Schema diff đã kiểm tra.
- [ ] API compatibility đã kiểm tra.
- [ ] Smoke test đã chuẩn bị.
- [ ] Rollback/recovery plan đã chuẩn bị.
- [ ] Migration duration đã ước lượng.
- [ ] Lock impact đã đánh giá.
- [ ] Không có destructive change chưa được phê duyệt.
- [ ] Seed production đã kiểm tra.
- [ ] Secrets không nằm trong repository.

---

# 64. Development Checklist

Developer trước khi tạo migration:

- [ ] Đã đọc Document 11.
- [ ] Đã đọc Document 18.
- [ ] Đã đọc Document 19.
- [ ] Xác định requirement liên quan.
- [ ] Xác định domain entity.
- [ ] Xác định FK dependency.
- [ ] Xác định nullable.
- [ ] Xác định unique.
- [ ] Xác định index.
- [ ] Xác định delete strategy.
- [ ] Xác định historical impact.
- [ ] Xác định test.

---

# 65. Migration Definition of Done

Migration được coi là hoàn thành khi:

1. Tạo schema thành công từ database rỗng.
2. Tất cả FK hoạt động.
3. Constraint hoạt động.
4. Index cần thiết đã có.
5. Seed reference thành công.
6. Không phá vỡ API.
7. Test integration pass.
8. Traceability được cập nhật.
9. Không còn migration conflict chưa giải quyết.
10. Production migration plan được phê duyệt.

---

# 66. AI Coding Agent Rules

Khi AI agent tạo migration:

```text
READ:
11_DATABASE_DESIGN.md
18_DATABASE_IMPLEMENTATION.md
19_TRACEABILITY_MATRIX.md
20_DATABASE_MIGRATIONS.md

THEN:
inspect existing code/schema

THEN:
generate migration

THEN:
validate FK order

THEN:
run migration test

THEN:
update traceability if schema changes
```

AI agent không được:

- tự đổi tên table;
- tự đổi PK;
- tự thêm business column;
- hard-code OCOP policy;
- xóa historical table;
- tạo cascade delete nguy hiểm;
- bỏ qua FK;
- bỏ qua index cho tenant scope;
- tạo migration không có lý do nghiệp vụ/kỹ thuật.

---

# 67. Next Step

Sau Document 20, dự án đã có chuỗi:

```text
Requirements
    ↓
Use Cases
    ↓
Domain
    ↓
Database Design
    ↓
Database Implementation
    ↓
Traceability
    ↓
Migration Plan
```

Bước tiếp theo nên chuyển sang:

```text
21_BACKEND_PROJECT_STRUCTURE.md
```

Tài liệu 21 sẽ xác định:

- backend module structure;
- folder/package structure;
- Domain/Application/Infrastructure/Presentation;
- module boundaries;
- naming convention;
- DTO;
- Repository;
- Service/Use Case;
- Policy/Authorization;
- validation;
- transaction;
- event/job;
- error handling;
- test structure;
- API integration;
- cách triển khai Modular Monolith.

Chỉ sau khi Document 21 được chốt mới bắt đầu sinh skeleton code backend.
