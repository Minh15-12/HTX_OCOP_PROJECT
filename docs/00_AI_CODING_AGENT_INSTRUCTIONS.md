# 00_AI_CODING_AGENT_INSTRUCTIONS.md

# AI CODING AGENT INSTRUCTIONS
## Hệ thống quản lý hoạt động Hợp tác xã nông nghiệp và số hóa hồ sơ đánh giá, phân hạng OCOP

---

## 1. Mục đích

Đây là **AI Coding Contract** của dự án. AI Coding Agent phải đọc và tuân thủ file này trước khi phân tích, thiết kế, lập trình, kiểm thử hoặc refactor.

Mục tiêu là bảo đảm AI:
- hiểu đúng context của dự án;
- không tự phát minh nghiệp vụ;
- không tự mở rộng scope;
- không phá vỡ Database/API/Security/Workflow;
- không hard-code chính sách OCOP có khả năng thay đổi;
- bảo vệ dữ liệu lịch sử;
- có authorization và tenant isolation;
- có test và traceability;
- triển khai theo phase, không code toàn bộ một lần.

---

## 1.1. Thông tin cốt lõi & Cam kết đề tài (Project Core Specifications)

### Mục tiêu dự án:
- Số hóa hoạt động quản lý hợp tác xã nông nghiệp và quy trình chuẩn bị hồ sơ đánh giá, phân hạng OCOP.
- Quản lý minh bạch xã viên, vùng trồng, vật tư, phân chia lợi nhuận; hỗ trợ chấm điểm, lưu minh chứng và kết xuất hồ sơ chuẩn hóa.

### Nội dung đề tài:
- Số hóa hoạt động quản lý hợp tác xã nông nghiệp và quy trình chuẩn bị hồ sơ đánh giá, phân hạng OCOP.
- Quản lý minh bạch xã viên, vùng trồng, vật tư, phân chia lợi nhuận; hỗ trợ chấm điểm, lưu minh chứng và kết xuất hồ sơ chuẩn hóa.

### Dự kiến kết quả đạt được:
- • Hệ thống web quản lý xã viên, vùng trồng, vật tư và nghiệp vụ HTX.
- • Quy trình chấm điểm OCOP, lưu minh chứng, theo dõi mức độ hoàn thiện.
- • Chức năng kết xuất hồ sơ PDF/Word và báo cáo quản trị.
- • Mã nguồn, dữ liệu mẫu, tài liệu vận hành và báo cáo kiểm thử.

### Phần mềm và công cụ sử dụng:
- React/Vue; Laravel/FastAPI; PostgreSQL; MinIO hoặc lưu trữ tệp tương đương; công cụ tạo PDF/DOCX theo mẫu; Docker; Nginx; Git/GitHub.
  *(Hiện thực hóa kỹ thuật của dự án: Frontend sử dụng **React + TypeScript + Vite + TailwindCSS**; Backend sử dụng **Laravel 11 + Sanctum**; CSDL **PostgreSQL 16**)*.

### Kế hoạch triển khai (14 tuần):
- **Tuần 1–2:** Khảo sát quy trình HTX, biểu mẫu và tiêu chí OCOP.
- **Tuần 3:** Mô hình hóa nghiệp vụ, phân quyền, CSDL và kiến trúc.
- **Tuần 4–5:** Phát triển xã viên, vùng trồng và danh mục nền.
- **Tuần 6–7:** Phát triển vật tư, nhật ký giao dịch và phân chia lợi nhuận.
- **Tuần 8–9:** Số hóa tiêu chí OCOP, chấm điểm và quản lý minh chứng.
- **Tuần 10:** Xây dựng luồng duyệt, nhắc việc và nhật ký kiểm toán.
- **Tuần 11:** Kết xuất PDF/Word, báo cáo và thống kê.
- **Tuần 12:** Kiểm thử dữ liệu, bảo mật, sao lưu và phục hồi.
- **Tuần 13:** Triển khai thử nghiệm, hướng dẫn sử dụng.
- **Tuần 14:** Nghiệm thu, trình diễn và hoàn thiện báo cáo.

---

## 2. Phạm vi hệ thống

Hệ thống bao gồm các nhóm nghiệp vụ chính:

1. Quản lý Hợp tác xã.
2. Quản lý xã viên/thành viên.
3. Quản lý đơn vị sản xuất.
4. Quản lý vùng trồng/thửa/vùng sản xuất.
5. Quản lý cây trồng và mùa vụ.
6. Quản lý nhật ký sản xuất.
7. Quản lý thu hoạch và lô sản phẩm.
8. Quản lý sản phẩm.
9. Quản lý vật tư.
10. Quản lý kho và biến động tồn kho.
11. Quản lý nghiệp vụ tài chính trong phạm vi dự án.
12. Quản lý hồ sơ OCOP.
13. Quản lý phiên bản tiêu chí/điều kiện OCOP.
14. Quản lý hồ sơ minh chứng.
15. Quản lý đánh giá, chấm điểm và tổng hợp.
16. Quản lý workflow/phê duyệt.
17. Báo cáo và thống kê.
18. Sinh PDF/DOCX.
19. Audit log.
20. Phân quyền và cô lập dữ liệu theo HTX.

---

## 3. Bộ tài liệu phải đọc

AI phải coi bộ tài liệu `01–23` là project context và đọc các tài liệu liên quan trước khi code.

Thứ tự ưu tiên đọc:

```text
00_AI_CODING_AGENT_INSTRUCTIONS.md
01_PROJECT_OVERVIEW.md
02_*.md
03_BUSINESS_PROCESSES.md
04_OCOP_BUSINESS.md
05_ACTORS_AND_ROLES.md
06_BUSINESS_RULES.md
07_BUSINESS_REQUIREMENTS.md
08_FUNCTIONAL_REQUIREMENTS.md
09_USE_CASES_FINAL.md
10_DOMAIN_MODEL.md
11_DATABASE_DESIGN.md
12_API_SPECIFICATION.md
13_SYSTEM_ARCHITECTURE.md
14_SECURITY_DESIGN.md
15_AUTHORIZATION_MATRIX.md
16_WORKFLOW_SPECIFICATION.md
17_OPENAPI_SPECIFICATION.md
18_DATABASE_IMPLEMENTATION.md
19_TRACEABILITY_MATRIX.md
20_DATABASE_MIGRATIONS.md
21_BACKEND_PROJECT_STRUCTURE.md
22_BACKEND_CODING_STANDARDS.md
23_BACKEND_API_IMPLEMENTATION_PLAN.md

# Quy trình nghiệp vụ chi tiết (đọc khi implement từng module):
30_MEMBER_WORKFLOW.md       -- Thành viên & Vốn góp: FSM, Business Rules, Credit Limit
31_FARMING_WORKFLOW.md      -- Vùng trồng, Thửa đất, PHI Guard, Lot ID, TT02/2024
32_INVENTORY_WORKFLOW.md    -- Kho Vật tư, KCS 3 cấp, FEFO/FIFO, Credit Advance
33_FINANCE_WORKFLOW.md      -- Tài chính, Cấn trừ công nợ, Phân chia lợi nhuận
34_OCOP_WORKFLOW.md         -- OCOP QĐ148, Chấm điểm, Phân hạng, Evidence mapping
35_APPROVAL_WORKFLOW.md     -- FSM Engine, Audit Hash Chaining, Notification Engine
```


Nếu file quan trọng bị thiếu:

```text
MISSING DOCUMENT
```

AI phải báo rõ và không được tự giả định nội dung chưa có.

---

## 4. Source of Truth

Khi có mâu thuẫn, ưu tiên:

```text
1. Quyết định mới nhất được user xác nhận trực tiếp
2. Yêu cầu nghiệp vụ/pháp lý đã xác nhận
3. 06_BUSINESS_RULES.md
4. 07_BUSINESS_REQUIREMENTS.md
5. 08_FUNCTIONAL_REQUIREMENTS.md
6. 09_USE_CASES_FINAL.md
7. 10_DOMAIN_MODEL.md
8. 11_DATABASE_DESIGN.md
9. 12_API_SPECIFICATION.md
10. 13_SYSTEM_ARCHITECTURE.md
11. 14_SECURITY_DESIGN.md
12. 15_AUTHORIZATION_MATRIX.md
13. 16_WORKFLOW_SPECIFICATION.md
14. 17_OPENAPI_SPECIFICATION.md
15. 18_DATABASE_IMPLEMENTATION.md
16. 19_TRACEABILITY_MATRIX.md
17. 20_DATABASE_MIGRATIONS.md
18. 21_BACKEND_PROJECT_STRUCTURE.md
19. 22_BACKEND_CODING_STANDARDS.md
20. 23_BACKEND_API_IMPLEMENTATION_PLAN.md
21. AI inference
```

Nếu conflict ảnh hưởng business/architecture/API/database/security:

```text
STOP → REPORT CONFLICT → ASK
```

---

## 5. Phân loại thông tin

AI phải phân biệt:

### FACT
Thông tin đã xác nhận.

### SOURCE
Thông tin có nguồn cụ thể.

### PROPOSED
Đề xuất của AI, chưa được duyệt.

### TO_VERIFY
Thông tin cần xác minh.

### CONFLICT
Các nguồn không thống nhất.

### GAP
Thông tin còn thiếu để implement an toàn.

Không được biến:

```text
PROPOSED / TO_VERIFY / GAP
```

thành requirement chính thức.

---

## 6. Kiến trúc bắt buộc

Architecture:

```text
Modular Monolith
+
REST API
+
Background Workers
```

Layer:

```text
Presentation
    ↓
Application
    ↓
Domain
    ↓
Infrastructure
```

Baseline technology:

```text
PHP
Laravel
PostgreSQL
Redis / Queue
MinIO hoặc private object storage tương đương
Nginx
Docker
Git
```

Không tự chuyển sang Microservices, MongoDB, GraphQL hoặc framework khác nếu chưa được duyệt.

---

## 7. Module boundary

Các module chính:

```text
Identity
Cooperative
Members
Agriculture
Product
Inventory
Finance
OCOP
Evidence
Workflow
Reporting
Document
Audit
```

Không để module truy cập tùy tiện implementation nội bộ của module khác.

---

## 8. Controller/Application/Domain/Infrastructure

### Presentation
Chịu trách nhiệm HTTP, Request, Response và gọi Application layer.

### Application
Chịu trách nhiệm Use Case, Command/Query, DTO, orchestration, transaction boundary, workflow, audit, job/event.

### Domain
Chịu trách nhiệm Entity, Value Object, Domain Rule, Domain Service và business invariant.

### Infrastructure
Chịu trách nhiệm PostgreSQL, Eloquent implementation, repository implementation, storage, queue, document generation và external integration.

Không đặt business logic phức tạp trong Controller.

---

## 9. Database contract

Database phải bảo vệ:

```text
Foreign Keys
Unique Constraints
Check Constraints
Indexes
Transactions
Referential Integrity
Tenant Scope
Historical Integrity
```

Không chỉ dựa vào frontend validation.

Business invariant quan trọng phải được bảo vệ bằng nhiều lớp:

```text
Request Validation
+
Business Validation
+
Domain Rule
+
Database Constraint
```

Migration phải tuân thủ `20_DATABASE_MIGRATIONS.md`.

---

## 10. Tenant isolation

Mọi dữ liệu tenant-sensitive phải kiểm tra:

```text
Authentication
+
Permission
+
Cooperative Scope
+
Resource Ownership
+
Business State
```

User của HTX A không được truy cập dữ liệu HTX B chỉ vì biết ID.

Không được bỏ tenant scope để “code cho chạy”.

---

## 11. Authorization

Authentication không đồng nghĩa Authorization.

Mỗi action phải xác định:

```text
Who?
What?
Which tenant?
Which resource?
Which state?
```

Sensitive action phải kiểm tra permission và business state; áp dụng Separation of Duties nếu tài liệu yêu cầu.

---

## 12. Workflow

Không cho client sửa status tùy ý:

```http
PATCH /applications/{id}
{
  "status": "APPROVED"
}
```

Phải dùng action/use case:

```http
POST /applications/{id}/submit
POST /applications/{id}/return
POST /applications/{id}/resubmit
POST /applications/{id}/approve
POST /applications/{id}/reject
```

Transition phải:

```text
Check current state
→ Check permission
→ Check tenant
→ Check business rule
→ Transaction
→ Audit
→ Event/Job nếu cần
```

---

## 13. OCOP

OCOP là domain có khả năng thay đổi theo chính sách.

Các thành phần có khả năng thay đổi phải được thiết kế theo hướng version/configuration:

```text
Criteria
Indicators
Scoring Rules
Evaluation Policy
Council Level
Workflow
Document Template
```

Không hard-code policy vào Controller/Frontend.

Không để hồ sơ lịch sử tự động chuyển sang criteria mới.

---

## 14. Council Level

Thiết kế hiện tại hỗ trợ:

```text
PROVINCE
CENTRAL
```

Council level phải được quản lý theo reference/configuration phù hợp.

Không tự thêm `DISTRICT` hoặc `COMMUNE` vào formal evaluation session nếu tài liệu/policy hiện hành chưa yêu cầu.

Phải phân biệt:

```text
Administrative preliminary process
```

với:

```text
Formal evaluation session
```

---

## 15. OCOP historical integrity

OCOP Application phải xác định criteria/policy version sử dụng.

Ví dụ:

```text
Application A
    ↓
Criteria Version 2026-A
```

Nếu có version mới:

```text
Criteria Version 2027-A
```

Application A vẫn phải giữ logic lịch sử của version cũ.

---

## 16. Score calculation

Điểm phải có một source of truth.

Nếu domain yêu cầu nhiều lớp:

```text
Raw Score
Calculated Score
Adjusted Score
Final Consolidated Score
```

phải được phân biệt.

Không để frontend, backend, PDF và report tự tính theo các logic khác nhau.

Khi score đã lock/consolidated:

```text
No direct update
No direct delete
No silent overwrite
```

---

## 17. Evidence/file security

Evidence là dữ liệu nghiệp vụ quan trọng.

Phải xem xét:

```text
Private Storage
Authorization
Short-lived Signed URL
File Validation
Metadata
Checksum
Versioning
Verification
Audit
```

Không expose storage credential.

Không public file minh chứng private.

Không dùng filename từ client làm storage key duy nhất.

---

## 18. Finance

Finance không phải CRUD đơn giản.

Phải xem xét:

```text
Transaction
Validation
Classification
Settlement
Finalization
Audit
Reporting
Concurrency
```

Dữ liệu finalized phải được bảo vệ theo business rule.

---

## 19. Inventory

Inventory phải bảo đảm integrity cho:

```text
Receipt
Issue
Adjustment
Count
Transaction History
```

Không tùy tiện update quantity.

Với nghiệp vụ đồng thời, cân nhắc:

```text
Transaction
+
Row Lock / Optimistic Lock
+
Constraint
+
Idempotency
```

---

## 20. API

Mỗi endpoint mới phải xác định:

```text
Requirement
Use Case
Business Rule
Permission
Tenant Scope
Database
Workflow
Audit
Test
```

API phải tuân thủ:

```text
12_API_SPECIFICATION.md
17_OPENAPI_SPECIFICATION.md
23_BACKEND_API_IMPLEMENTATION_PLAN.md
```

Không tự đổi API contract mà không báo.

---

## 21. Validation

Validation gồm:

```text
Request Validation
Business Validation
Domain Invariant
Database Constraint
```

Frontend validation không phải security boundary.

Phân biệt rõ:

```text
NULL
0
unknown
not applicable
```

theo domain.

---

## 22. Transaction và concurrency

Các operation cần atomicity phải dùng transaction phù hợp.

Ví dụ:

```text
Approve Application
+
Workflow Transition
+
Decision
+
Audit
```

Các nghiệp vụ nhạy cảm phải xem xét concurrency.

Không gọi network service dài bên trong DB transaction nếu có thể tránh.

---

## 23. Idempotency

Các command có khả năng retry phải cân nhắc idempotency:

```text
Submit
Approve
Stock Receipt
Stock Issue
Financial Operation
Document Generation
```

Retry không được tạo dữ liệu nghiệp vụ trùng.

---

## 24. Background jobs

Tác vụ nặng nên dùng queue:

```text
PDF
DOCX
Large Report
Large Import/Export
File Processing
Notification
```

Job phải có:

```text
Retry
Timeout
Failure Handling
Logging
Idempotency nếu cần
```

---

## 25. Audit

Sensitive actions phải audit:

```text
Approve
Reject
Finalize
Lock
Consolidate
Change Permission
Change Policy
Verify Evidence
Financial Finalization
```

Audit cần truy nguyên:

```text
Who?
What?
When?
Which Tenant?
Which Resource?
Before?
After?
Metadata?
```

Không cho API thông thường sửa/xóa audit history.

---

## 26. Security baseline

AI phải kiểm tra:

```text
Authentication
Authorization
Tenant Isolation
Input Validation
Mass Assignment
SQL Injection
XSS
CSRF nếu applicable
File Upload Security
Path Traversal
Rate Limiting
CORS
Secret Management
HTTPS
Audit
Logging
Backup
```

Không expose password, OTP, token, secret, database credential, storage credential, stack trace hoặc internal path.

---

## 27. Performance

Tránh:

```text
N+1 queries
Unbounded queries
Huge file in memory
Repeated queries
Missing indexes
Synchronous heavy jobs
```

List API phải pagination.

Filter/sort/search phải whitelist.

Không cho client truyền raw SQL.

---

## 28. Reporting/document

Report không phải source of truth.

PDF/DOCX:

```text
Domain/Application Data
        ↓
DTO
        ↓
Renderer
        ↓
PDF/DOCX
```

Không tạo business calculation riêng trong report/document renderer.

---

## 29. Environment/secrets

Phân biệt:

```text
local
development
test
staging
production
```

Không commit:

```text
.env
password
secret
JWT key
database credential
MinIO credential
```

---

## 30. Migration

Không sửa migration lịch sử đã chạy production để thay đổi semantics.

Khi cần thay đổi:

```text
Create New Migration
```

Migration phải được test:

```text
Clean Database
+
Existing Sample Data
```

Không tự xóa dữ liệu để migration pass.

---

## 31. Delete/historical data

Trước DELETE phải xác định:

```text
Hard Delete?
Soft Delete?
Deactivate?
Archive?
Version?
Immutable?
```

Không xóa lịch sử quan trọng:

```text
Audit
Evaluation
Score
Finalized Finance
Inventory History
Historical OCOP
```

nếu business rule không cho phép.

---

## 32. No duplicate business logic

Nếu business calculation/rule đã tồn tại, không tạo bản sao ở:

```text
Controller
Service
Helper
Report
PDF
Frontend
```

Phải xác định source of truth.

---

## 33. No fake implementation

Không được dùng placeholder rồi báo hoàn thành:

```php
return ['message' => 'Coming soon'];
```

Nếu chưa làm:

```text
NOT IMPLEMENTED
```

phải được báo rõ.

---

## 34. Testing contract

Feature quan trọng phải có test.

Cần cân nhắc:

```text
Unit Test
Feature Test
Authorization Test
Tenant Isolation Test
Workflow Test
Database Constraint Test
```

Critical path phải test:

```text
Happy Path
Invalid Input
Unauthorized
Wrong Tenant
Wrong State
Concurrency nếu cần
Idempotency nếu cần
```

Không được che giấu test failure.

---

## 35. Definition of Ready

Trước khi code feature phải xác định:

```text
Feature
Business Purpose
Scope
Out of Scope
BR
FR
UC
Actor
Permission
Database
API
Workflow
Business Rules
Security
Tests
Dependencies
```

Nếu thiếu thông tin quan trọng:

```text
STOP
→ Report GAP
→ Ask
```

---

## 36. Definition of Done

Feature chỉ Done khi:

```text
[ ] Code complete
[ ] Migration complete if needed
[ ] Business rules implemented
[ ] Validation implemented
[ ] Authorization implemented
[ ] Tenant scope implemented
[ ] API implemented
[ ] Workflow implemented if needed
[ ] Audit implemented if needed
[ ] Tests added
[ ] Tests passed
[ ] Documentation synced
[ ] Traceability updated
[ ] No blocking defect
```

---

## 37. Implementation workflow

AI phải thực hiện:

```text
READ
 ↓
UNDERSTAND
 ↓
INSPECT CODEBASE
 ↓
PLAN
 ↓
CHECK GAP/CONFLICT/TO_VERIFY
 ↓
IMPLEMENT
 ↓
MIGRATE
 ↓
TEST
 ↓
REVIEW
 ↓
TRACE
 ↓
REPORT
```

Không:

```text
READ
 ↓
CODE EVERYTHING
```

---

## 38. Phase triển khai

### Phase 0 — Bootstrap

```text
Laravel
PHP
PostgreSQL
Docker
Nginx
Redis/Queue
API /api/v1
Logging
Error Handling
Testing
Health Check
```

### Phase 1 — Foundation

```text
User
Authentication
Role
Permission
Cooperative
Tenant Context
Authorization
Audit Foundation
```

### Phase 2 — Cooperative & Members

```text
Cooperative
Member
Membership Lifecycle
Member Documents
```

### Phase 3 — Agriculture

```text
Production Unit
Farm Plot
Crop
Season
Farming Log
Harvest
Lot
```

### Phase 4 — Product & Inventory

```text
Product
Material
Warehouse
Receipt
Issue
Adjustment
Stock Count
```

### Phase 5 — Finance

```text
Finance Transaction
Receivable
Payable
Settlement
Finalization
Surplus/Profit Distribution
```

### Phase 6 — OCOP & Evidence

```text
Criteria Version
Criteria
Indicator
Application
Evidence
Evidence Version
Evidence Verification
```

### Phase 7 — Evaluation & Workflow

```text
Evaluation Session
Council Level
Assignment
Score
Consolidation
Decision
Province/Central Flow
Return/Resubmit
```

### Phase 8 — Reporting & Documents

```text
Dashboard
Reports
PDF
DOCX
Export
Audit Reports
```

---

## 39. Phase Gate

Không chuyển phase chỉ vì code chạy.

Phase phải đạt:

```text
Architecture
Database
API
Authorization
Tenant Isolation
Business Rules
Tests
Traceability
Documentation
```

---

## 40. Change Impact Analysis

Thay đổi quan trọng phải kiểm tra:

```text
Requirement
 ↓
Use Case
 ↓
Domain
 ↓
Database
 ↓
API
 ↓
Security
 ↓
Authorization
 ↓
Workflow
 ↓
Tests
 ↓
Documentation
```

---

## 41. Khi nào phải STOP

AI phải dừng và hỏi khi:

- Không rõ nghiệp vụ.
- Không rõ policy/OCOP.
- Database conflict.
- API conflict.
- Security uncertainty.
- Migration có nguy cơ mất dữ liệu.
- Feature ngoài scope.
- Thay đổi historical behavior.
- Thay đổi permission/role.
- Thay đổi workflow.
- Thay đổi OCOP scoring/criteria.
- Thay đổi tenant isolation.

---

## 42. Khi nào được tự quyết định

AI có thể tự quyết định implementation detail nếu không làm thay đổi:

```text
Business Behavior
API Contract
Database Semantics
Security
Workflow
Historical Data
```

Ví dụ:

```text
Private method decomposition
Internal helper
Query optimization giữ nguyên behavior
Internal class refactor
```

---

## 43. Khi nào phải xin approval

Phải xin approval khi thay đổi:

```text
Database schema quan trọng
API contract
Business rule
Workflow
Permission
Role
OCOP scoring
Criteria version
Historical behavior
Tenant isolation
Security architecture
External integration
Project scope
```

---

## 44. Task format

Trước mỗi task:

```text
## TASK

Objective:
...

Scope:
...

Out of Scope:
...

## TRACEABILITY

BR:
FR:
UC:
Business Rule:
Permission:

## DEPENDENCIES

Existing Modules:
Existing Tables:
Existing Endpoints:

## PLAN

1.
2.
3.

## RISKS

1.
2.

## TEST PLAN

1.
2.
3.
```

---

## 45. Implementation report

Sau mỗi task phải báo:

```text
## IMPLEMENTATION REPORT

### 1. Task
...

### 2. Files Created
- ...

### 3. Files Modified
- ...

### 4. Database Changes
- ...

### 5. API Changes
- ...

### 6. Business Rules
- ...

### 7. Authorization
- ...

### 8. Tenant Isolation
- ...

### 9. Workflow Impact
- ...

### 10. Audit
- ...

### 11. Tests
- Command:
- Result:

### 12. Traceability
- BR:
- FR:
- UC:
- API:
- DB:
- Test:

### 13. Known Issues
- ...

### 14. GAP / CONFLICT / TO_VERIFY
- ...

### 15. Next Recommended Task
...
```

---

## 46. Code quality checklist

```text
[ ] Naming consistent
[ ] Layering correct
[ ] No duplicated business logic
[ ] Validation
[ ] Authorization
[ ] Tenant Scope
[ ] Transaction
[ ] Audit
[ ] Workflow
[ ] Exception handling
[ ] Safe logging
[ ] Tests
[ ] API documentation
[ ] Traceability
[ ] No secrets
```

---

## 47. Không over-engineer

Không tự thêm nếu chưa có requirement:

```text
Microservices
Kubernetes
Service Mesh
CQRS Framework phức tạp
Event Sourcing toàn hệ thống
Distributed Architecture
```

Ưu tiên:

```text
Simple
Maintainable
Secure
Testable
Traceable
```

---

## 48. Không under-engineer

Không biến hệ thống thành:

```text
Controller
 ↓
Model
```

với business logic, authorization, workflow và validation nằm lẫn trong Controller.

---

## 49. Không biến dự án thành E-commerce

Đây là:

```text
Agricultural Cooperative Management
+
OCOP Dossier Digitization
```

Không tự thêm:

```text
Cart
Checkout
Online Payment
Customer Order
```

nếu không có requirement.

---

## 50. Không biến OCOP thành form khảo sát

OCOP phải gắn với:

```text
Criteria
Version
Evidence
Evaluation
Scoring
Workflow
Approval
Audit
Historical Integrity
```

---

## 51. Không biến Inventory thành một quantity field

Nếu thuộc scope:

```text
Receipt
Issue
Adjustment
Count
Transaction History
```

---

## 52. Không biến Finance thành expense table

Finance phải bảo đảm business integrity theo phạm vi được duyệt.

---

## 53. Frontend contract

Frontend chỉ giao tiếp với Backend qua API contract.

Frontend không được cần biết:

```text
Database internals
Repository
Storage credentials
Domain implementation
```

---

## 54. Session handoff

Cuối session nên ghi:

```text
## SESSION HANDOFF

Completed:
...

Current State:
...

Unfinished:
...

Known Issues:
...

Files Changed:
...

Tests:
...

Next Task:
...
```

---

## 55. Project status

Khi được hỏi trạng thái:

```text
Overall:
...

Phase 0:
DONE / IN PROGRESS / NOT STARTED

Phase 1:
...

Phase 2:
...

Blocking:
...

Risks:
...

Next:
...
```

Không dùng phần trăm cảm tính.

---

# 56. MASTER PROMPT CHO AI CODING AGENT

Copy prompt dưới đây để khởi động AI Coding Agent:

```text
Bạn là Senior Software Architect + Senior Backend Engineer + QA Engineer + Security Engineer cho dự án:

“Xây dựng Hệ thống quản lý hoạt động Hợp tác xã nông nghiệp và số hóa hồ sơ đánh giá, phân hạng OCOP”.

Hãy đọc 00_AI_CODING_AGENT_INSTRUCTIONS.md và toàn bộ tài liệu 01–23 trước khi thực hiện thay đổi lớn.

Hãy coi 00_AI_CODING_AGENT_INSTRUCTIONS.md là AI Coding Contract.

Không được:
- tự phát minh business rule;
- tự mở rộng scope;
- tự đổi architecture;
- tự đổi database;
- tự đổi API;
- hard-code policy OCOP có khả năng thay đổi;
- phá historical data;
- bypass authorization;
- bỏ tenant isolation;
- cho client PATCH workflow status tùy ý;
- che giấu test failure;
- báo Done khi chưa kiểm chứng.

Architecture:
Modular Monolith + REST API + Background Workers.

Layer:
Presentation
Application
Domain
Infrastructure

Technology:
Laravel/PHP
PostgreSQL
Redis/Queue
Private Object Storage/MinIO
Nginx
Docker
Git

Phase:
0 Bootstrap
1 Foundation
2 Members
3 Agriculture
4 Product + Inventory
5 Finance
6 OCOP + Evidence
7 Evaluation + Workflow
8 Reporting + Documents

Không code toàn bộ hệ thống trong một lần.

Trước mỗi task:
1. Đọc tài liệu liên quan.
2. Inspect codebase.
3. Xác định BR/FR/UC/Rule/Permission/API/DB/Test.
4. Kiểm tra dependencies.
5. Kiểm tra GAP/CONFLICT/TO_VERIFY.
6. Lập plan.
7. Implement smallest coherent unit.
8. Run tests.
9. Review security/tenant/workflow.
10. Update traceability/documentation.
11. Report.

Nếu chưa rõ nghiệp vụ:
STOP.

Nếu conflict:
STOP.

Nếu migration có nguy cơ mất dữ liệu:
STOP.

Nếu security chưa rõ:
STOP.

Nếu task ngoài scope:
STOP và đề xuất.

Mục tiêu cuối cùng:
- đúng nghiệp vụ;
- secure;
- maintainable;
- testable;
- traceable;
- historical-safe;
- multi-tenant safe;
- sẵn sàng tích hợp Frontend.
```

---

# 57. FIRST TASK — BACKEND BOOTSTRAP

Nếu codebase đang trống, task đầu tiên phải là:

```text
Phân tích codebase hiện tại và chuẩn bị Phase 0 — Backend Bootstrap.

Không implement toàn bộ hệ thống.

Hãy:
1. Kiểm tra project hiện tại.
2. Kiểm tra PHP version.
3. Kiểm tra Laravel version.
4. Kiểm tra PostgreSQL.
5. Kiểm tra Redis/Queue.
6. Kiểm tra Docker.
7. Kiểm tra cấu trúc source.
8. Đối chiếu Documents 13, 20, 21, 22, 23.
9. Xác định phần đã có/chưa có.
10. Lập kế hoạch Bootstrap.
11. Chỉ sau khi kế hoạch rõ ràng mới code.
12. Chạy test.
13. Báo cáo theo IMPLEMENTATION REPORT.
```

---

# 58. FINAL CONTRACT

AI Coding Agent phải luôn nhớ:

```text
DO NOT GUESS BUSINESS RULES.
DO NOT BREAK TENANT ISOLATION.
DO NOT BYPASS AUTHORIZATION.
DO NOT HARD-CODE CHANGING POLICY.
DO NOT DESTROY HISTORICAL DATA.
DO NOT CHANGE API SILENTLY.
DO NOT HIDE TEST FAILURES.
DO NOT IMPLEMENT OUT-OF-SCOPE FEATURES.
DO NOT MODIFY DESIGN DOCUMENTS JUST TO FIT THE CODE.
DO NOT CLAIM DONE WITHOUT VERIFICATION.
```

Luôn thực hiện:

```text
READ
→ PLAN
→ IMPLEMENT
→ TEST
→ TRACE
→ REPORT
```

Mục tiêu không phải:

```text
Generate as much code as possible.
```

Mà là:

```text
Generate the correct code
according to the approved project specification.
```

---

## END OF DOCUMENT
