# 21_BACKEND_PROJECT_STRUCTURE.md

# Backend Project Structure Specification

## 1. Document Information

| Field | Value |
|---|---|
| Document ID | 21 |
| Document Name | Backend Project Structure Specification |
| Project | Xây dựng Hệ thống quản lý hoạt động Hợp tác xã nông nghiệp và số hóa hồ sơ đánh giá, phân hạng OCOP |
| Status | Baseline |
| Architecture | Modular Monolith + REST API + Background Workers |
| Backend | Laravel / PHP baseline |
| Database | PostgreSQL |
| Object Storage | MinIO-compatible private object storage |
| Depends On | 13, 14, 15, 16, 17, 18, 19, 20 |
| Next Document | 22_BACKEND_CODING_STANDARDS.md |

---

# 2. Mục tiêu

Tài liệu này quy định cấu trúc backend trước khi bắt đầu implementation.

Mục tiêu:

1. Chia backend thành các module nghiệp vụ rõ ràng.
2. Giữ ranh giới giữa Domain, Application, Infrastructure và Presentation.
3. Không để controller chứa business logic.
4. Không để ORM model trở thành nơi chứa toàn bộ nghiệp vụ.
5. Bảo đảm authorization và data scope ở server.
6. Hỗ trợ workflow/action-based API.
7. Hỗ trợ transaction cho nghiệp vụ quan trọng.
8. Hỗ trợ background jobs cho PDF/DOCX và tác vụ nặng.
9. Dễ test.
10. Cho phép AI coding agent tạo code nhất quán.

---

# 3. Kiến trúc tổng thể

Backend sử dụng:

```text
Modular Monolith
        +
REST API
        +
Background Workers
```

Sơ đồ:

```text
Client
  ↓
Nginx
  ↓
Laravel Application
  │
  ├── Identity
  ├── Cooperative
  ├── Agriculture
  ├── Product
  ├── Inventory
  ├── Finance
  ├── OCOP
  ├── Evidence
  ├── Workflow
  ├── Reporting
  └── Audit
  │
  ├── PostgreSQL
  ├── Redis / Queue
  └── MinIO
```

---

# 4. Nguyên tắc Modular Monolith

Mỗi module có:

- business responsibility;
- application services/use cases;
- domain entities/rules;
- repositories;
- infrastructure adapters;
- API resources/controllers;
- validation;
- tests.

Module không được tùy tiện truy cập implementation nội bộ của module khác.

Ưu tiên:

```text
Module A
   ↓
Public Application Contract
   ↓
Module B
```

Không ưu tiên:

```text
Module A
   ↓
Module B's private repository/model
```

---

# 5. Module Map

```text
Modules/
├── Identity/
├── Cooperative/
├── Agriculture/
├── Product/
├── Inventory/
├── Finance/
├── OCOP/
├── Evidence/
├── Workflow/
├── Reporting/
├── Document/
└── Audit/
```

---

# 6. Module Responsibilities

## 6.1. Identity

Chịu trách nhiệm:

- users;
- authentication;
- roles;
- permissions;
- user-role assignment;
- current user context.

Không chịu trách nhiệm business nghiệp vụ HTX.

---

## 6.2. Cooperative

Chịu trách nhiệm:

- cooperative;
- member;
- member lifecycle;
- HTX-level settings;
- cooperative scope.

---

## 6.3. Agriculture

Chịu trách nhiệm:

- production units;
- farm plots;
- crops;
- seasons;
- farming logs;
- harvest;
- production traceability.

---

## 6.4. Product

Chịu trách nhiệm:

- products;
- product master;
- lots;
- product-production linkage.

---

## 6.5. Inventory

Chịu trách nhiệm:

- materials;
- warehouses;
- inventory transactions;
- stock balance;
- stock reconciliation.

---

## 6.6. Finance

Chịu trách nhiệm:

- finance transactions;
- receivables;
- payables;
- settlements;
- distribution plans.

---

## 6.7. OCOP

Chịu trách nhiệm:

- criteria versions;
- criteria;
- indicators;
- OCOP applications;
- evaluation sessions;
- evaluation assignments;
- evaluation scores;
- OCOP result.

---

## 6.8. Evidence

Chịu trách nhiệm:

- evidence metadata;
- evidence versions;
- evidence links;
- file access authorization;
- object-storage abstraction.

---

## 6.9. Workflow

Chịu trách nhiệm:

- workflow definitions;
- workflow versions;
- workflow instances;
- valid transitions;
- transition history.

---

## 6.10. Reporting

Chịu trách nhiệm:

- dashboard queries;
- operational reports;
- aggregation;
- report filters;
- report export orchestration.

Reporting không được sửa dữ liệu nghiệp vụ.

---

## 6.11. Document

Chịu trách nhiệm:

- PDF generation;
- DOCX generation;
- document templates;
- document jobs;
- generated document metadata.

---

## 6.12. Audit

Chịu trách nhiệm:

- audit logs;
- actor;
- action;
- resource;
- timestamp;
- correlation/request ID;
- historical trace.

Audit không cung cấp API cho người dùng sửa/xóa log tùy ý.

---

# 7. Recommended Folder Structure

Khuyến nghị:

```text
app/
├── Modules/
│   ├── Identity/
│   ├── Cooperative/
│   ├── Agriculture/
│   ├── Product/
│   ├── Inventory/
│   ├── Finance/
│   ├── OCOP/
│   ├── Evidence/
│   ├── Workflow/
│   ├── Reporting/
│   ├── Document/
│   └── Audit/
│
├── Shared/
│   ├── Domain/
│   ├── Application/
│   ├── Infrastructure/
│   └── Support/
│
└── Providers/
```

---

# 8. Standard Module Structure

Mỗi module:

```text
Modules/<ModuleName>/
├── Domain/
│   ├── Entities/
│   ├── ValueObjects/
│   ├── Enums/
│   ├── Rules/
│   ├── Events/
│   └── Exceptions/
│
├── Application/
│   ├── Commands/
│   ├── Queries/
│   ├── DTOs/
│   ├── Services/
│   └── Contracts/
│
├── Infrastructure/
│   ├── Persistence/
│   │   ├── Models/
│   │   ├── Repositories/
│   │   └── Mappers/
│   ├── Storage/
│   └── Providers/
│
├── Presentation/
│   └── Http/
│       ├── Controllers/
│       ├── Requests/
│       ├── Resources/
│       └── Routes/
│
└── Tests/
    ├── Unit/
    ├── Feature/
    └── Integration/
```

Không nhất thiết mọi module phải có tất cả folder nếu module rất nhỏ.

---

# 9. Domain Layer

Domain chứa:

```text
Entity
Value Object
Domain Rule
Domain Event
Domain Exception
```

Domain không phụ thuộc:

- HTTP;
- Controller;
- Laravel Request;
- Eloquent;
- PostgreSQL;
- MinIO;
- Redis.

---

# 10. Entity

Entity đại diện cho business object.

Ví dụ:

```text
Member
FarmPlot
Season
Product
InventoryTransaction
FinanceTransaction
OcopApplication
EvaluationSession
Evidence
WorkflowInstance
```

Entity không nên biết:

```text
Request
Response
JsonResource
HTTP status
```

---

# 11. Value Object

Value Object dùng cho khái niệm có giá trị và invariant riêng.

Ví dụ:

```text
Money
Quantity
Score
Email
DateRange
FileChecksum
```

Không tạo Value Object cho mọi field nếu không mang lại giá trị.

---

# 12. Enum

Enum phù hợp với trạng thái ổn định trong kỹ thuật.

Ví dụ:

```text
ApplicationStatus
EvaluationStatus
TransactionType
EvidenceStatus
```

Nhưng policy có khả năng thay đổi không nên hard-code thành enum nếu cần configuration/version.

Ví dụ:

```text
CouncilLevel
```

nên lấy từ reference/configuration:

```text
PROVINCE
CENTRAL
```

thay vì coi đây là toàn bộ danh sách bất biến của hệ thống.

---

# 13. Domain Rules

Domain rule xử lý invariant nghiệp vụ.

Ví dụ:

```text
Cannot modify locked evaluation score
Cannot post invalid inventory transaction
Cannot approve application from invalid state
```

Business rule phức tạp không đặt trong Controller.

---

# 14. Application Layer

Application layer điều phối Use Case.

Ví dụ:

```text
CreateMember
CreateFarmPlot
RecordHarvest
ReceiveInventory
RecordExpense
CreateOcopApplication
SubmitOcopApplication
ReturnOcopApplication
StartEvaluation
RecordEvaluationScore
ConsolidateEvaluation
ApproveApplication
GenerateOcopDossier
```

---

# 15. Command vs Query

## Command

Thay đổi state:

```text
CreateMember
SubmitApplication
ApproveApplication
RecordInventoryReceipt
RecordExpense
RecordEvaluationScore
```

## Query

Chỉ đọc:

```text
GetMember
ListMembers
GetApplication
GetEvaluation
GetInventoryBalance
GetFinancialReport
GetDashboard
```

Không để Query thay đổi dữ liệu.

---

# 16. DTO

DTO dùng để truyền dữ liệu giữa Presentation và Application.

Ví dụ:

```text
CreateMemberData
CreateFarmPlotData
SubmitApplicationData
RecordEvaluationScoreData
GenerateDocumentData
```

DTO không nên chứa:

- HTTP response;
- database query;
- business persistence.

---

# 17. Service

Application Service điều phối:

```text
validation
authorization
domain rule
transaction
repository
event
audit
```

Ví dụ:

```text
SubmitOcopApplicationService
ApproveOcopApplicationService
RecordInventoryTransactionService
RecordEvaluationScoreService
```

Không tạo một `GodService` chứa toàn bộ nghiệp vụ hệ thống.

---

# 18. Repository Contract

Domain/Application chỉ phụ thuộc interface.

Ví dụ:

```text
MemberRepository
ApplicationRepository
EvaluationSessionRepository
EvidenceRepository
InventoryRepository
FinanceTransactionRepository
```

Interface nằm ở Application/Domain contract tùy thiết kế.

Implementation nằm Infrastructure.

---

# 19. Repository Implementation

Infrastructure sử dụng:

```text
Eloquent
Query Builder
PostgreSQL
```

Ví dụ:

```text
EloquentMemberRepository
EloquentApplicationRepository
EloquentEvaluationRepository
```

Không để controller gọi trực tiếp:

```php
Model::query()
```

cho nghiệp vụ phức tạp.

Query đơn giản có thể dùng read model/query service theo coding standard.

---

# 20. Persistence Model

Eloquent Model đại diện persistence concern.

Ví dụ:

```text
MemberModel
FarmPlotModel
OcopApplicationModel
EvaluationSessionModel
EvidenceModel
```

Không coi Eloquent Model là Domain Entity mặc định.

Nếu project chọn Active Record đơn giản cho một số module, phải thống nhất và không trộn lẫn tùy tiện.

---

# 21. Mapper

Mapper chuyển đổi:

```text
Persistence Model
        ↕
Domain Entity
```

Ví dụ:

```text
MemberMapper
ApplicationMapper
EvaluationMapper
```

Nếu module dùng application-oriented persistence model thay vì rich domain entity, có thể giảm mapper; nhưng phải nhất quán.

---

# 22. Controller

Controller chỉ nên:

```text
receive request
 ↓
authorize
 ↓
validate
 ↓
map DTO
 ↓
call use case
 ↓
map response
```

Controller không nên:

```text
calculate score
change workflow
update 10 tables
upload files directly
```

---

# 23. Form Request

Laravel Form Request chịu trách nhiệm:

- input validation;
- basic authorization;
- format validation.

Ví dụ:

```text
CreateMemberRequest
CreateFarmPlotRequest
SubmitApplicationRequest
RecordScoreRequest
UploadEvidenceRequest
```

Business rules phức tạp vẫn nằm Application/Domain.

---

# 24. API Resource

Resource chịu trách nhiệm response representation.

Ví dụ:

```text
MemberResource
ApplicationResource
EvaluationResource
EvidenceResource
```

Không đưa secret/private storage credentials vào response.

---

# 25. Routes

Mỗi module quản lý routes của mình.

Ví dụ:

```text
Modules/OCOP/Presentation/Http/Routes/api.php
```

Route chỉ ánh xạ:

```text
HTTP method
+
URI
+
Controller action
```

Business logic không đặt trong route closure.

---

# 26. Action-Based Endpoints

Các nghiệp vụ chuyển trạng thái quan trọng dùng action endpoint.

Ví dụ:

```http
POST /ocop/applications/{id}/submit
POST /ocop/applications/{id}/return
POST /ocop/applications/{id}/resubmit
POST /ocop/applications/{id}/approve
POST /ocop/applications/{id}/reject
```

Điều này phải đồng nhất với Document 17.

---

# 27. Authorization Pipeline

Mọi protected action:

```text
Authentication
    ↓
Role/Permission
    ↓
Tenant/Data Scope
    ↓
Resource Ownership
    ↓
SoD
    ↓
Business Rule
    ↓
Use Case
```

Không chỉ kiểm tra role.

---

# 28. Permission Naming

Khuyến nghị:

```text
<module>.<resource>.<action>
```

Ví dụ:

```text
member.read
member.create
member.update
member.archive

inventory.read
inventory.receive
inventory.issue
inventory.adjust

finance.read
finance.create
finance.finalize

ocop.application.read
ocop.application.create
ocop.application.submit
ocop.application.return
ocop.application.approve

ocop.evaluation.read
ocop.evaluation.start
ocop.evaluation.score
ocop.evaluation.consolidate

evidence.read
evidence.upload
evidence.verify

document.generate
report.read
```

Tên canonical phải đồng nhất với Authorization Matrix.

---

# 29. Tenant Context

Request phải xác định:

```text
Current User
      ↓
Current Cooperative Scope
      ↓
Resource
```

Không tin:

```text
cooperative_id
```

do client gửi lên mà không kiểm tra quyền.

Ví dụ:

```text
GET /members/{memberId}
```

phải xác nhận member thuộc cooperative mà user được phép truy cập.

---

# 30. Transaction Boundary

Transaction đặt ở Application Service/Use Case boundary.

Ví dụ:

```text
SubmitApplication
BEGIN
    validate
    change state
    create transition
    create audit
COMMIT
```

Inventory:

```text
RecordReceipt
BEGIN
    validate material
    validate warehouse
    create transaction
    update/derive balance
    create audit
COMMIT
```

Finance:

```text
RecordExpense
BEGIN
    validate
    create transaction
    audit
COMMIT
```

---

# 31. OCOP Evaluation Transaction

Khi ghi điểm:

```text
BEGIN
    authorization
    validate session
    validate evaluator assignment
    validate indicator
    validate score range
    validate score not locked
    save score
    audit
COMMIT
```

Khi consolidate:

```text
BEGIN
    validate all required scores
    calculate total
    persist result
    lock/consolidate
    audit
COMMIT
```

---

# 32. Workflow Service

Workflow engine chịu trách nhiệm:

```text
current state
+
requested action
+
workflow version
+
actor
=
valid transition?
```

Không cho client tự gửi:

```text
status = APPROVED
```

để bypass transition.

---

# 33. Workflow Contract

Khuyến nghị interface:

```text
WorkflowService
    canTransition()
    transition()
    getAvailableActions()
    getCurrentState()
```

Implementation không được phụ thuộc trực tiếp vào controller.

---

# 34. Evidence Storage Architecture

Flow:

```text
Client
  ↓
Evidence API
  ↓
Authorization
  ↓
Upload validation
  ↓
Object Storage Adapter
  ↓
MinIO
  ↓
Evidence metadata
  ↓
Database
```

Database không lưu credential object storage.

---

# 35. Object Storage Contract

Application chỉ biết:

```text
ObjectStorage
    put()
    getTemporaryUrl()
    delete()
    exists()
```

Không gọi MinIO SDK trực tiếp từ controller.

Implementation:

```text
MinioObjectStorage
```

hoặc adapter tương ứng.

---

# 36. File Security

Upload phải kiểm tra:

- authenticated user;
- permission;
- cooperative scope;
- file size;
- allowed MIME/type;
- extension;
- checksum;
- storage key.

Download phải:

```text
authorize
 ↓
generate short-lived URL
```

Không public bucket.

---

# 37. Audit Integration

Business action quan trọng phải tạo audit.

Ví dụ:

```text
Create member
Update member
Submit application
Return application
Approve application
Record score
Consolidate score
Upload evidence
Verify evidence
Record finance transaction
Record inventory transaction
```

Audit có thể được gọi trực tiếp từ Application Service hoặc qua domain/application event tùy implementation.

---

# 38. Domain Events

Có thể sử dụng event cho:

```text
ApplicationSubmitted
ApplicationApproved
EvaluationConsolidated
EvidenceUploaded
DocumentGenerationRequested
```

Event không được dùng để che giấu transaction boundary.

Nghiệp vụ cần atomicity phải hoàn thành trong transaction thích hợp.

---

# 39. Background Jobs

Các tác vụ nặng:

```text
GeneratePdf
GenerateDocx
GenerateReport
BuildDossierPackage
RecalculateReport
```

được đưa vào queue.

Flow:

```text
API
 ↓
Create Job
 ↓
Queue
 ↓
Worker
 ↓
Generate
 ↓
Store Object
 ↓
Update Job Status
 ↓
Audit
```

---

# 40. Job Idempotency

Job có thể bị retry.

Do đó:

```text
same job
+
same input/version
```

không được tạo dữ liệu trùng ngoài ý muốn.

Có thể dùng:

- job UUID;
- idempotency key;
- unique business key;
- status check.

---

# 41. Reporting Architecture

Không cho report controller truy cập tùy tiện mọi repository.

Khuyến nghị:

```text
Report Query Service
        ↓
optimized query/read model
        ↓
DTO
        ↓
API/Export
```

Report chỉ đọc dữ liệu.

---

# 42. Document Generation

Document module nhận:

```text
DocumentRequest
+
TemplateVersion
+
Source Data
```

Sau đó:

```text
Generate
 ↓
Validate
 ↓
Store
 ↓
Document Metadata
```

Template phải versioned để tài liệu lịch sử có thể giải thích.

---

# 43. Error Handling

API sử dụng lỗi có cấu trúc.

Ví dụ:

```json
{
  "code": "WORKFLOW_INVALID_TRANSITION",
  "message": "Action is not allowed from current state.",
  "details": {
    "current_state": "SUBMITTED",
    "requested_action": "APPROVE"
  },
  "trace_id": "..."
}
```

Không trả stack trace production.

---

# 44. Exception Categories

```text
ValidationException
AuthorizationException
NotFoundException
ConflictException
BusinessRuleException
WorkflowException
ConcurrencyException
StorageException
InfrastructureException
```

Không expose implementation details.

---

# 45. Logging

Log application phải có:

```text
timestamp
level
service/module
request_id
user_id nếu phù hợp
cooperative_id nếu phù hợp
action
error code
```

Không log:

- password;
- token;
- secret;
- private file content;
- dữ liệu nhạy cảm không cần thiết.

---

# 46. Correlation ID

Mỗi request nên có:

```text
X-Request-ID
```

hoặc cơ chế tương đương.

Correlation ID được truyền sang:

```text
API
 ↓
Application Service
 ↓
Job
 ↓
Audit/Log
```

để truy vết.

---

# 47. API Versioning

Baseline:

```text
/api/v1/...
```

Khi breaking change:

```text
/api/v2/...
```

Không thay đổi semantics của API cũ một cách âm thầm.

---

# 48. Pagination

Danh sách lớn phải pagination.

Ví dụ:

```text
GET /members?page=1&per_page=20
```

Không trả toàn bộ bảng trong một request.

Giới hạn `per_page`.

---

# 49. Filtering & Sorting

Filter phải whitelist.

Ví dụ:

```text
status
created_at
cooperative_id
```

Không cho client truyền raw SQL/order expression.

---

# 50. Database Access Rule

Không cho:

```text
Controller → DB
```

Ưu tiên:

```text
Controller
 ↓
Use Case
 ↓
Repository/Query Service
 ↓
Infrastructure
 ↓
DB
```

---

# 51. Cross-Module Communication

Ưu tiên:

```text
OCOP
 ↓
Product Contract
 ↓
Product
```

thay vì:

```text
OCOP
 ↓
ProductEloquentModel
```

Ví dụ OCOP cần product information:

```text
ProductReader
```

hoặc application contract.

---

# 52. Dependency Direction

```text
Presentation
      ↓
Application
      ↓
Domain

Infrastructure
      ↓
implements contracts
```

Infrastructure không làm Domain phụ thuộc ngược vào framework.

---

# 53. Shared Kernel

`Shared/` chỉ chứa thứ thực sự dùng chung.

Có thể gồm:

```text
DomainId
Money
Pagination
ApiResponse
Clock
CurrentUserContext
DomainException
```

Không đưa business logic của OCOP/Finance vào Shared.

---

# 54. Configuration

Configuration đặt trong:

```text
config/
```

Secret từ environment.

Ví dụ:

```text
DB_*
REDIS_*
MINIO_*
APP_*
```

Không commit:

```text
.env
production secrets
access keys
```

---

# 55. Environment Variables

Tối thiểu:

```text
APP_ENV
APP_KEY
APP_URL

DB_HOST
DB_PORT
DB_DATABASE
DB_USERNAME
DB_PASSWORD

REDIS_HOST
REDIS_PORT

MINIO_ENDPOINT
MINIO_ACCESS_KEY
MINIO_SECRET_KEY
MINIO_BUCKET
```

Tên thực tế phụ thuộc deployment.

---

# 56. Testing Structure

```text
tests/
├── Unit/
├── Feature/
├── Integration/
└── Architecture/
```

Ngoài ra mỗi module có thể có:

```text
Modules/<Module>/Tests/
```

Phải thống nhất một convention trong implementation.

---

# 57. Unit Tests

Test:

- Value Object;
- Domain Rule;
- calculator;
- workflow rule;
- policy logic;
- mapper.

Ví dụ:

```text
Cannot modify locked score
Valid transition accepted
Invalid transition rejected
Score outside indicator range rejected
```

---

# 58. Feature Tests

Test:

```text
HTTP
 ↓
Authentication
 ↓
Authorization
 ↓
Validation
 ↓
Use Case
 ↓
Database
```

Ví dụ:

```text
POST /ocop/applications/{id}/submit
```

phải kiểm tra toàn bộ pipeline.

---

# 59. Integration Tests

Test:

- PostgreSQL;
- Redis/queue;
- MinIO;
- PDF/DOCX generation;
- cross-module contracts.

Không dùng mock cho mọi thứ.

---

# 60. Architecture Tests

Có thể kiểm tra:

```text
Controller cannot access DB directly
Domain cannot import HTTP
Domain cannot import Eloquent
Module boundaries are respected
```

---

# 61. Coding Rule — Controller

Controller:

```php
public function submit(
    SubmitApplicationRequest $request,
    SubmitOcopApplication $useCase,
    string $id
) {
    $data = SubmitApplicationData::fromRequest($request);

    $result = $useCase->execute($id, $data);

    return new ApplicationResource($result);
}
```

Đây chỉ là pattern minh họa; implementation phải tuân coding standard của framework.

---

# 62. Coding Rule — Use Case

Use Case nên có cấu trúc:

```text
authorize
 ↓
load aggregate
 ↓
validate business rule
 ↓
execute domain action
 ↓
persist
 ↓
audit/event
 ↓
return result
```

Không nhồi toàn bộ hệ thống vào một service.

---

# 63. Coding Rule — Repository

Repository tập trung vào persistence.

Không để repository quyết định:

```text
whether user may approve
whether workflow transition is valid
whether policy allows action
```

Đó là Application/Domain concern.

---

# 64. Coding Rule — Query

Query tối ưu cho đọc.

Ví dụ:

```text
MemberListQuery
InventoryBalanceQuery
FinancialSummaryQuery
OcopDashboardQuery
```

Query không sửa dữ liệu.

---

# 65. Coding Rule — Transaction

Không mở transaction ở Controller.

Transaction thuộc Use Case/Application boundary.

---

# 66. Coding Rule — Audit

Không để frontend tự tạo audit.

Audit phải được tạo từ trusted backend path.

---

# 67. Coding Rule — Authorization

Không dùng:

```text
if ($user->role === 'admin')
```

rải rác trong code.

Ưu tiên:

```text
Permission
Policy
Authorization Service
```

theo Authorization Matrix.

---

# 68. Coding Rule — Tenant Scope

Không viết:

```text
Member::find($id)
```

cho resource tenant-scoped mà không kiểm tra scope.

Ưu tiên:

```text
current cooperative scope
+
resource lookup
```

---

# 69. Coding Rule — Status Changes

Không cho generic endpoint thay đổi business status.

Sai:

```text
PATCH /applications/1
status=APPROVED
```

Đúng:

```text
POST /applications/1/approve
```

---

# 70. Coding Rule — Historical Records

Không dùng:

```text
delete()
update()
```

tùy tiện cho:

- finalized finance transactions;
- locked evaluation scores;
- audit logs;
- historical workflow transitions.

Phải có business procedure riêng nếu cần correction.

---

# 71. Coding Rule — OCOP Policy

Không hard-code:

```text
if score >= X then ...
```

nếu `X` thuộc chính sách có thể thay đổi.

Ưu tiên:

```text
Criteria Version
 ↓
Indicator Rules
 ↓
Evaluation Engine
```

---

# 72. Coding Rule — Council Level

Không hard-code logic:

```text
if council == province ...
else if council == central ...
```

ở nhiều nơi.

Ưu tiên:

```text
CouncilLevel configuration
+
WorkflowVersion
+
Policy rules
```

---

# 73. API → Use Case Mapping

| API Action | Use Case |
|---|---|
| POST `/members` | CreateMember |
| POST `/farm-plots` | CreateFarmPlot |
| POST `/harvests` | RecordHarvest |
| POST `/inventory/receipts` | RecordInventoryReceipt |
| POST `/inventory/issues` | RecordInventoryIssue |
| POST `/finance/transactions` | RecordFinanceTransaction |
| POST `/ocop/applications` | CreateOcopApplication |
| POST `/ocop/applications/{id}/submit` | SubmitOcopApplication |
| POST `/ocop/applications/{id}/return` | ReturnOcopApplication |
| POST `/ocop/applications/{id}/resubmit` | ResubmitOcopApplication |
| POST `/ocop/applications/{id}/approve` | ApproveOcopApplication |
| POST `/ocop/evaluations/{id}/scores` | RecordEvaluationScore |
| POST `/ocop/evaluations/{id}/consolidate` | ConsolidateEvaluation |
| POST `/evidence` | UploadEvidence |
| POST `/documents` | GenerateDocument |

Canonical endpoint names must follow Document 17.

---

# 74. Backend Module Dependency Baseline

```text
Identity
   ↑
Cooperative
   ↑
Agriculture ──→ Product
   │              ↑
   └──────────────┘

Inventory
   ↓
Finance

Product
   ↓
OCOP
   ↓
Evidence
   ↓
Workflow

Reporting
   ↑
all read-side modules

Document
   ↑
OCOP / Reporting

Audit
   ↑
all sensitive modules
```

Mũi tên chỉ dependency logic, không phải tất cả module phải import implementation của nhau.

---

# 75. Recommended Implementation Order

## Phase 1

```text
Project bootstrap
Shared
Identity
Cooperative
```

## Phase 2

```text
Agriculture
Product
```

## Phase 3

```text
Inventory
Finance
```

## Phase 4

```text
OCOP Criteria
OCOP Application
```

## Phase 5

```text
Evaluation
Evidence
Workflow
```

## Phase 6

```text
Reporting
Document
Audit hardening
```

## Phase 7

```text
Security hardening
Testing
Performance
Deployment
```

---

# 76. Backend Bootstrap Checklist

Trước khi code module đầu tiên:

- [ ] Laravel project initialized.
- [ ] PostgreSQL connection configured.
- [ ] Redis/queue configured nếu sử dụng.
- [ ] Object storage adapter configured.
- [ ] Migration framework configured.
- [ ] API `/api/v1` baseline configured.
- [ ] Authentication configured.
- [ ] Exception handling configured.
- [ ] Logging configured.
- [ ] Request ID configured.
- [ ] Module autoloading configured.
- [ ] Test database configured.
- [ ] CI pipeline skeleton configured.

---

# 77. Definition of Done — Module

Một module được coi là hoàn thành khi:

- [ ] Module boundary rõ.
- [ ] Domain/Application/Infrastructure/Presentation tách hợp lý.
- [ ] API documented.
- [ ] Authorization implemented.
- [ ] Tenant scope implemented.
- [ ] Business rules implemented.
- [ ] Transaction boundary defined.
- [ ] Audit integrated.
- [ ] Tests pass.
- [ ] Traceability updated.
- [ ] No unresolved critical conflict.

---

# 78. AI Coding Agent Contract

AI coding agent phải đọc:

```text
13_SYSTEM_ARCHITECTURE.md
14_SECURITY_DESIGN.md
15_AUTHORIZATION_MATRIX.md
16_WORKFLOW_SPECIFICATION.md
17_OPENAPI_SPECIFICATION.md
18_DATABASE_IMPLEMENTATION.md
19_TRACEABILITY_MATRIX.md
20_DATABASE_MIGRATIONS.md
21_BACKEND_PROJECT_STRUCTURE.md
```

Trước khi tạo backend code.

AI agent phải:

1. Tuân module boundary.
2. Không đưa business logic vào controller.
3. Không bypass authorization.
4. Không bypass workflow.
5. Không truy cập private object storage trực tiếp.
6. Không sửa migration cũ đã chạy production.
7. Không hard-code policy OCOP chưa được xác minh.
8. Không tạo endpoint không có traceability.
9. Không tự thêm module ngoài scope.
10. Nếu thiếu requirement, đánh dấu `TO_VERIFY`.
11. Nếu tài liệu mâu thuẫn, báo `CONFLICT`.
12. Khi thay đổi schema, cập nhật migration và traceability.

---

# 79. Final Backend Architecture Contract

Backend implementation phải bảo đảm:

```text
HTTP
 ↓
Controller
 ↓
Request Validation
 ↓
Authorization
 ↓
DTO
 ↓
Use Case
 ↓
Domain Rule
 ↓
Repository / Query
 ↓
Database
```

Với file:

```text
HTTP
 ↓
Authorization
 ↓
Evidence Service
 ↓
Object Storage Adapter
 ↓
MinIO
```

Với workflow:

```text
Action API
 ↓
Permission
 ↓
Workflow Engine
 ↓
Domain Rule
 ↓
Transaction
 ↓
State + Transition + Audit
```

Với document:

```text
API
 ↓
Document Job
 ↓
Queue
 ↓
Worker
 ↓
Template Version
 ↓
PDF/DOCX
 ↓
Object Storage
 ↓
Document Metadata
```

---

# 80. Next Document

Sau `21_BACKEND_PROJECT_STRUCTURE.md`, bước tiếp theo là:

```text
22_BACKEND_CODING_STANDARDS.md
```

Document 22 sẽ chuẩn hóa:

- PHP/Laravel coding convention;
- naming;
- DTO;
- service;
- repository;
- controller;
- request;
- resource;
- enum;
- exception;
- transaction;
- validation;
- query;
- API response;
- error code;
- logging;
- testing;
- Git/commit;
- AI coding rules.

Sau đó mới nên tạo:

```text
23_BACKEND_API_IMPLEMENTATION_PLAN.md
24_BACKEND_MODULE_IMPLEMENTATION.md
25_FRONTEND_ARCHITECTURE.md
```

và bắt đầu skeleton/code.
