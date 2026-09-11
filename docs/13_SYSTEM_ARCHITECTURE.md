# 13_SYSTEM_ARCHITECTURE.md

# 1. Document Information

| Field | Value |
|---|---|
| Document ID | 13 |
| Document Name | System Architecture Specification |
| Project | Xây dựng Hệ thống quản lý hoạt động Hợp tác xã nông nghiệp và số hóa hồ sơ đánh giá, phân hạng OCOP |
| Status | BASELINE ARCHITECTURE – PENDING VALIDATION |
| Primary Sources | 10_DOMAIN_MODEL.md, 11_DATABASE_DESIGN_FINAL.md, 12_API_SPECIFICATION.md |
| Upstream Sources | 01 → 09 |
| Frontend | React hoặc Vue |
| Backend | Laravel hoặc FastAPI |
| Database | PostgreSQL |
| Spatial Extension | PostGIS nếu GIS được xác nhận |
| Object Storage | MinIO hoặc tương đương |
| Reverse Proxy | Nginx |
| Deployment | Docker |
| Source Control | Git/GitHub |

> Tài liệu này định nghĩa kiến trúc logic và triển khai ở mức baseline. Các điểm upstream còn TO_VERIFY/PROPOSED/CONFLICT không được biến thành sự thật pháp lý hoặc business rule cứng.

---

# 2. Architectural Goals

Kiến trúc phải đáp ứng:

1. Quản lý HTX theo cooperative scope.
2. Quản lý xã viên, vốn góp và governance.
3. Quản lý vùng trồng, thửa đất, mùa vụ, nhật ký và truy xuất lô.
4. Quản lý vật tư/kho và giao dịch tồn kho có consistency.
5. Quản lý tài chính, công nợ, đối soát và phân phối thặng dư.
6. Số hóa hồ sơ OCOP.
7. Version hóa bộ tiêu chí, scoring rule và workflow.
8. Quản lý minh chứng bảo mật.
9. Workflow, approval và audit.
10. Kết xuất PDF/DOCX.
11. Có khả năng triển khai MVP với độ phức tạp vừa phải.
12. Không tạo coupling không cần thiết giữa frontend, database và object storage.
13. Có khả năng thích ứng khi chính sách OCOP thay đổi.

---

# 3. Recommended Architecture

## 3.1 Baseline

Khuyến nghị **Modular Monolith + REST API + Background Workers** cho MVP.

```text
Browser
   |
 HTTPS
   v
Nginx
   |
   v
Application Server (Laravel/FastAPI)
   |
   +-------------------+------------------+
   |                   |                  |
   v                   v                  v
PostgreSQL          MinIO/S3          Queue/Worker
(+ PostGIS*)        Private Files     Reports/Documents
```

* PostGIS chỉ dùng khi yêu cầu GIS/spatial được xác nhận.

---

# 4. Why Modular Monolith

Dự án có nhiều bounded context nhưng vẫn là hệ thống MVP/đồ án với quy mô triển khai vừa phải.

Microservices làm tăng:

- distributed transactions;
- service discovery;
- message broker;
- distributed tracing;
- nhiều deployment unit;
- DevOps overhead.

Vì vậy Modular Monolith được chọn cho baseline:

```text
one deployment
+
clear domain modules
+
simple transaction boundary
+
simple debugging
+
easy local development
```

Codebase vẫn phải giữ module boundary rõ ràng để có thể tách service trong tương lai nếu thật sự cần.

---

# 5. Module Structure

```text
app/
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
└── Audit/
```

Mỗi module nên có logical layers:

```text
Domain/
Application/
Infrastructure/
Presentation/
```

Ví dụ:

```text
OCOP/
├── Domain/
├── Application/
├── Infrastructure/
└── Presentation/
```

Domain không phụ thuộc trực tiếp vào framework, ORM hoặc MinIO.

---

# 6. Bounded Context Architecture

Các bounded contexts chính:

```text
1. COOPERATIVE
2. AGRICULTURE & PRODUCTION
3. INVENTORY & LOGISTICS
4. PRODUCT & OCOP
5. FINANCIAL OPERATIONS
6. EVIDENCE VAULT
7. CROSS-CUTTING INFRASTRUCTURE
```

Implementation grouping:

```text
Core
├── Identity
└── Cooperative

Operations
├── Agriculture
├── Product
├── Inventory
└── Finance

OCOP
├── Criteria
├── Application
├── Evaluation
└── Result

Cross-cutting
├── Evidence
├── Workflow
├── Audit
└── Reporting
```

---

# 7. Dependency Rules

Không cho dependency tùy ý giữa các module.

Nguyên tắc:

```text
Identity
   |
   v
Cooperative
   |
   +--> Agriculture --> Inventory
   |         |
   |         +-------> Product --> OCOP --> Evidence
   |
   +--> Finance
```

Module chỉ giao tiếp qua public application/domain contracts hoặc domain events, không truy cập private internals của module khác.

---

# 8. Layered Architecture

```text
Presentation
     ↓
Application
     ↓
Domain
     ↓
Infrastructure
```

## Presentation

- HTTP controller
- request validation
- authentication context
- response serialization

## Application

- use-case orchestration
- transaction boundary
- DTO
- command/query handling
- authorization invocation

## Domain

- entities
- value objects
- invariants
- domain services
- domain events

## Infrastructure

- PostgreSQL repositories
- MinIO adapter
- queue
- PDF/DOCX adapter
- notification adapter

---

# 9. Frontend Architecture

Recommended:

```text
src/
├── app/
├── modules/
│   ├── auth/
│   ├── cooperative/
│   ├── members/
│   ├── agriculture/
│   ├── inventory/
│   ├── finance/
│   ├── ocop/
│   ├── evidence/
│   ├── workflow/
│   ├── reports/
│   └── audit/
├── shared/
│   ├── components/
│   ├── forms/
│   ├── tables/
│   ├── maps/
│   └── utilities/
└── infrastructure/
    ├── api/
    ├── auth/
    └── storage/
```

Frontend không phải security boundary và không được là nơi duy nhất enforce business rule.

---

# 10. Reverse Proxy

```text
Internet
   ↓
HTTPS
   ↓
Nginx
   ├── /api/* → backend
   └── frontend assets
```

Nginx chịu trách nhiệm:

- TLS termination;
- request size limit;
- basic rate limiting;
- reverse proxy;
- security headers;
- access logging.

Business authorization không đặt ở Nginx.

---

# 11. Authentication Architecture

```text
Browser
   ↓
Login
   ↓
Authentication Service / Provider
   ↓
Access Token / Session
   ↓
API
   ↓
User Identity
   ↓
Role
   ↓
Permission
   ↓
Data Scope
```

Việc chọn cơ chế authentication cụ thể được chốt trong tài liệu Security/Auth.

---

# 12. Authorization Architecture

Authorization gồm:

```text
1. Permission
2. Role
3. Data Scope
```

Ví dụ:

```text
permission = evaluation.score
role       = evaluator
scope      = assigned_evaluation_session
```

Phải thỏa các điều kiện tương ứng mới được thao tác.

---

# 13. Multi-Tenant Architecture

`cooperative_id` là tenant boundary cho dữ liệu HTX.

```text
User
  ↓
Role Assignment
  ↓
Data Scope
  ↓
Cooperative
  ↓
Domain Resource
```

Ví dụ:

```text
GET /api/v1/members/{member_id}
```

không được chỉ kiểm tra member tồn tại.

Phải kiểm tra resource thuộc cooperative scope mà actor được phép truy cập.

PostgreSQL Row-Level Security có thể được xem xét nếu cần tăng cường isolation.

---

# 14. PostgreSQL Architecture

PostgreSQL là source of truth cho:

```text
master data
transactions
workflow state
scores
evidence metadata
audit
report requests
document metadata
```

Binary evidence không lưu trong PostgreSQL.

---

# 15. PostGIS

Domain có:

```text
GPSCoordinate
GeoPolygon
```

Nếu GIS/spatial query được xác nhận, dùng:

```text
PostgreSQL + PostGIS
```

cho:

- point/polygon storage;
- spatial validation;
- containment/intersection;
- map queries.

Nếu MVP chưa cần spatial query, có thể tạm dùng GeoJSON representation nhưng phải ghi rõ giới hạn.

---

# 16. Object Storage Architecture

```text
Application
    ↓
Authorization
    ↓
Object Storage Adapter
    ↓
MinIO / S3
```

Không expose MinIO credentials cho browser.

Upload:

```text
Client
  ↓
Backend authorization
  ↓
presigned upload OR backend upload
  ↓
MinIO
  ↓
metadata persisted
```

Download:

```text
Client
  ↓
Backend authorization
  ↓
short-lived signed URL
  ↓
private object
```

---

# 17. Evidence Security Architecture

```text
Evidence
 └── EvidenceVersion
      ├── object_key
      ├── mime_type
      ├── size
      ├── checksum
      ├── uploader
      └── status
```

Không overwrite binary version cũ.

Object key khuyến nghị:

```text
cooperatives/{coop_id}/applications/{application_id}/evidence/{evidence_id}/versions/{version}/file
```

---

# 18. OCOP Criteria Architecture

```text
CriteriaSet
      ↓
CriteriaVersion
      ↓
CriteriaGroup
      ↓
Criterion
      ↓
Indicator
      ↓
ScoringRule
      ↓
MandatoryCondition
```

Application giữ:

```text
criteria_version_id
```

Khi hồ sơ đã bước vào quy trình đánh giá, version phải được bảo toàn.

---

# 19. Policy Versioning

Không giả định OCOP chỉ có một rule set vĩnh viễn.

```text
Policy
 ├── Criteria Version
 ├── Scoring Rule Version
 ├── Workflow Version
 └── Document Template Version
```

Khi policy thay đổi:

```text
New policy
   ↓
New version
   ↓
New applications use new version
   ↓
Historical applications retain old version
```

Không destructive update policy đã được sử dụng.

---

# 20. Council Level Architecture

Không hard-code danh sách cấp đánh giá vào API/service.

Dùng:

```text
CouncilLevel
```

là configurable reference.

Baseline hiện tại:

```text
PROVINCE
CENTRAL
```

Evaluation:

```text
EvaluationSession
        ↓
CouncilLevel
```

Nếu policy thay đổi, reference/configuration hoặc policy version có thể thay đổi mà không cần đổi endpoint lõi.

---

# 21. OCOP Evaluation Engine

```text
Evaluator Scores
      ↓
Validate Indicator Version
      ↓
Validate Score Range
      ↓
Validate Mandatory Conditions
      ↓
Aggregate Scores
      ↓
Check Discrepancy Rule
      ↓
Determine Proposed Classification
      ↓
Persist Result
      ↓
Audit
```

Engine đọc rule/version đã áp dụng.

Không hard-code mọi ngưỡng điểm trong controller.

---

# 22. Workflow Architecture

```text
Workflow Definition
       ↓
Workflow Version
       ↓
States
       ↓
Transitions
       ↓
Workflow Instance
```

Baseline hồ sơ có thể gồm:

```text
DRAFT
 ↓
READY_FOR_SUBMISSION
 ↓
SUBMITTED
 ↓
IN_REVIEW
 ↓
NEED_REVISION
 ↓
RESUBMITTED
 ↓
READY_FOR_EVALUATION
 ↓
EVALUATING
 ↓
CONSOLIDATED
 ↓
PENDING_DECISION
 ↓
APPROVED / REJECTED
```

Đây là baseline kiến trúc; trạng thái thực tế phải theo workflow đã được xác nhận.

---

# 23. Workflow Transition

```text
current state
     +
requested transition
     +
actor
     +
permission
     +
data scope
     +
business preconditions
     ↓
allowed?
```

Nếu không:

```text
INVALID_STATE_TRANSITION
```

Không cho frontend PATCH `status` tùy ý để bypass workflow.

---

# 24. Audit Architecture

Audit event có thể gồm:

```text
actor
role
action
entity
entity_id
before
after
reason
ip
timestamp
```

Flow:

```text
Application Command
       ↓
Business Operation
       ↓
Audit Event
       ↓
Append-only storage
```

Audit không được business user update/delete.

---

# 25. Domain Events

Baseline events:

```text
MemberEnrolledEvent
SprayingActivityLoggedEvent
HarvestLotCreatedEvent
StockIssuedDeferredEvent
OcopApplicationSubmittedEvent
EvaluationScoreLockedEvent
ScoreDiscrepancyDetectedEvent
OcopResultApprovedEvent
```

Trong Modular Monolith:

```text
Domain Event
   ↓
In-process Event Dispatcher
   ↓
Handlers
```

Message broker chỉ xem xét khi scale thực tế yêu cầu.

---

# 26. Transaction Architecture

Các operation cần strong consistency phải có transaction boundary phù hợp:

```text
Stock Receipt
Stock Issue
Settlement
Evaluation Consolidation
Final Decision
Critical Workflow Transition
```

Ví dụ Stock Issue:

```text
BEGIN
  validate scope
  validate stock
  create issue
  create issue lines
  update/append inventory ledger
  create debt if applicable
  audit
COMMIT
```

Nếu bước bắt buộc thất bại:

```text
ROLLBACK
```

---

# 27. Inventory Consistency

Không để frontend tính tồn kho.

Source of truth:

```text
Stock Transactions / Inventory Ledger
```

Balance có thể computed hoặc materialized có kiểm soát.

Concurrency phải được xử lý khi xuất kho.

---

# 28. Finance Consistency

Money dùng:

```text
NUMERIC / Decimal
```

Không dùng floating point cho số tiền.

Các nghiệp vụ:

```text
cash transaction
debt
settlement
surplus distribution
```

phải có transaction boundary.

Client không được tự gửi số dư cuối kỳ làm source of truth.

---

# 29. Reporting Architecture

Báo cáo nhẹ:

```text
API
 ↓
Query Service
 ↓
PostgreSQL
 ↓
Response
```

Báo cáo nặng:

```text
POST /reports
      ↓
ReportRequest
      ↓
Queue
      ↓
Worker
      ↓
Generate
      ↓
Store output
      ↓
Completed
```

---

# 30. PDF / DOCX Architecture

```text
Application
   ↓
Document Generation Service
   ↓
Template Version
   ↓
Data Snapshot
   ↓
PDF/DOCX Renderer
   ↓
GeneratedDocument
   ↓
MinIO
```

Generated document phải truy vết được:

```text
Source Data
Template Version
Source Data Version
Generation Time
Checksum
```

Tài liệu lớn nên generate async.

---

# 31. Background Jobs

Worker xử lý:

```text
PDF generation
DOCX generation
large report
notification
reminder
scheduled checks
file integrity checks
```

MVP có thể dùng queue phù hợp framework; Redis là một lựa chọn.

---

# 32. Notification Architecture

```text
Business Event
      ↓
Notification Handler
      ↓
Notification record
      ↓
Channel
 ├── in-app
 └── email (optional)
```

Notification không được làm rollback transaction chính.

---

# 33. Caching

Có thể cache:

```text
reference catalogs
permissions
criteria metadata
dashboard aggregates
```

Không cache lâu transactional truth nếu chưa có invalidation strategy:

```text
inventory balance
current evaluation lock state
financial outstanding amount
```

---

# 34. API ↔ Module Mapping

| API Domain | Backend Module |
|---|---|
| `/cooperatives` | Cooperative |
| `/members` | Cooperative |
| `/production-units` | Agriculture |
| `/farm-plots` | Agriculture |
| `/crop-seasons` | Agriculture |
| `/farming-logs` | Agriculture |
| `/harvests` / `/lots` | Agriculture/Product |
| `/products` | Product |
| `/materials` | Inventory |
| `/stock-receipts` | Inventory |
| `/stock-issues` | Inventory |
| `/stock-counts` | Inventory |
| `/cash-transactions` | Finance |
| `/receivable-payables` | Finance |
| `/settlements` | Finance |
| `/surplus-distribution-plans` | Finance |
| `/ocop/criteria-versions` | OCOP |
| `/ocop/applications` | OCOP |
| `/ocop/evaluation-sessions` | OCOP |
| `/ocop/evidences` | Evidence |
| `/workflows` | Workflow |
| `/audit-events` | Audit |
| `/reports` | Reporting |
| `/documents` | Reporting |

---

# 35. Deployment Architecture

Docker baseline:

```text
docker-compose
│
├── nginx
├── frontend
├── backend
├── worker
├── postgres
├── redis
└── minio
```

Production:

```text
Internet
   ↓
Nginx
   ↓
Application
   ├── PostgreSQL
   ├── Redis
   ├── Worker
   └── MinIO
```

PostgreSQL và MinIO phải có persistent storage.

---

# 36. Network Segmentation

Không expose trực tiếp ra Internet:

```text
PostgreSQL
Redis
MinIO API
```

Public:

```text
80/443 → Nginx
```

Internal network:

```text
nginx ↔ backend
backend ↔ postgres
backend ↔ redis
backend ↔ minio
worker ↔ postgres/redis/minio
```

---

# 37. Environment Configuration

Secrets không commit Git.

Ví dụ:

```text
APP_ENV
APP_KEY
DATABASE_URL
REDIS_URL
MINIO_ENDPOINT
MINIO_ACCESS_KEY
MINIO_SECRET_KEY
AUTH_SECRET
MAIL_*
```

Production secrets phải dùng secret management phù hợp.

---

# 38. Observability

Baseline:

```text
Application Logs
Access Logs
Error Logs
Audit Logs
```

Nên có:

```text
request_id / trace_id
```

Metrics có thể bổ sung:

```text
request latency
5xx rate
queue failures
database connections
storage usage
```

---

# 39. Backup & Recovery

PostgreSQL:

```text
daily full backup
+
WAL / point-in-time recovery nếu yêu cầu
```

MinIO:

```text
backup/replication object data
+
metadata/database consistency
```

Docker volume không được coi là backup.

RPO/RTO cụ thể phải được chốt trong deployment/operations specification.

---

# 40. Security Architecture Summary

```text
HTTPS
 ↓
Authentication
 ↓
Authorization
 ↓
Tenant/Data Scope
 ↓
Input Validation
 ↓
Business Invariants
 ↓
Transaction
 ↓
Audit
```

File:

```text
Authorization
 ↓
Signed URL
 ↓
Private Object Storage
```

---

# 41. Architecture Decision Records

## ADR-001 — Modular Monolith

**Decision:** Chọn Modular Monolith cho MVP.

**Reason:** giảm độ phức tạp triển khai nhưng vẫn giữ bounded context/module boundaries.

## ADR-002 — PostgreSQL

**Decision:** PostgreSQL là source of truth.

**Reason:** phù hợp relational transactions, constraints, JSONB và có thể mở rộng PostGIS.

## ADR-003 — Private Object Storage

**Decision:** MinIO/private S3 abstraction.

**Reason:** evidence cần versioning, checksum, private access và signed URL.

## ADR-004 — OCOP Policy Versioning

**Decision:** criteria/scoring/workflow/template phải có version.

**Reason:** chính sách có thể thay đổi; historical applications phải giữ context cũ.

## ADR-005 — Configurable Council Level

**Decision:** `council_levels` là configurable reference.

**Reason:** không khóa API/domain vào đúng một danh sách cấp đánh giá.

---

# 42. Important Upstream Conflicts / Validation Required

Kiến trúc không tự ý sửa các mâu thuẫn upstream.

## Conflict 1 — Council Level

Nếu upstream có mô tả khác nhau về danh sách council level, kiến trúc giữ:

```text
CouncilLevel = configurable
```

Baseline database/API hiện tại dùng:

```text
PROVINCE
CENTRAL
```

Giá trị pháp lý áp dụng thực tế phải được xác minh trước production seed.

## Conflict 2 — Warehouse

Nếu Domain Model có:

```text
Warehouse
InventoryStock
```

nhưng physical database chưa hoàn thiện các bảng tương ứng, không tự thêm bảng chỉ từ architecture.

Cần resolve:

```text
Có một hay nhiều warehouse?
Có warehouse_id trên receipt/issue/count?
InventoryStock có cần bảng riêng không?
```

## Conflict 3 — Domain Model vs Physical Naming

Domain và persistence không bắt buộc cùng tên.

```text
Domain Entity
      ↕
Repository / Mapper
      ↕
Persistence Model
```

Không đổi database chỉ vì tên domain khác.

## Conflict 4 — Rule Hard-coding

Rule chưa xác minh phải giữ dưới dạng:

```text
configuration
+
versioning
+
validation status
```

Không biến `TO_VERIFY` thành legal constraint.

---

# 43. Architecture Quality Attributes

| Attribute | Strategy |
|---|---|
| Security | RBAC + scope + private storage |
| Integrity | DB constraints + application invariants |
| Auditability | append-only audit |
| Maintainability | modular monolith |
| Policy adaptability | versioned configuration |
| Performance | indexes + async jobs + selective cache |
| Scalability | stateless backend + worker scaling |
| Availability | backup + restartable containers |
| Traceability | lot/evidence/version/audit links |
| Testability | domain/application separation |

---

# 44. Scalability Path

Current:

```text
Modular Monolith
```

Future, chỉ khi có nhu cầu:

```text
API Gateway
      |
      +-- Core Service
      +-- OCOP Service
      +-- Reporting Service
      |
      +-- Event Bus
```

Không tách microservice trước khi có lý do thực tế.

---

# 45. Implementation Sequence

```text
Phase 1
Identity
Cooperative
Member
       ↓
Phase 2
Agriculture
Production
       ↓
Phase 3
Inventory
       ↓
Phase 4
Finance
       ↓
Phase 5
Product
       ↓
Phase 6
OCOP Criteria
       ↓
Phase 7
OCOP Application
Evidence
       ↓
Phase 8
Evaluation
Workflow
       ↓
Phase 9
Reports
PDF/DOCX
       ↓
Phase 10
Security
Testing
Deployment
```

---

# 46. Testing Architecture

Testing pyramid:

```text
              E2E
             /   \
        Integration
          /       \
       Application
        /         \
      Domain Unit Tests
```

Must test:

```text
tenant isolation
permission
workflow transitions
inventory concurrency
financial calculations
OCOP score calculation
mandatory conditions
criteria version mismatch
evidence authorization
audit immutability
document generation
```

---

# 47. Definition of Done

- [ ] Modular boundaries được xác định.
- [ ] Backend layers được xác định.
- [ ] Frontend structure được xác định.
- [ ] API boundary được xác định.
- [ ] PostgreSQL boundary được xác định.
- [ ] Object storage boundary được xác định.
- [ ] Authentication/authorization flow được xác định.
- [ ] Tenant isolation được xác định.
- [ ] OCOP versioning được xác định.
- [ ] Council Level configurable được xác định.
- [ ] Workflow architecture được xác định.
- [ ] Audit architecture được xác định.
- [ ] Async job architecture được xác định.
- [ ] PDF/DOCX generation architecture được xác định.
- [ ] Docker deployment baseline được xác định.
- [ ] Backup strategy baseline được xác định.
- [ ] Upstream conflicts được ghi nhận.
- [ ] Không tự biến TO_VERIFY thành legal fact.

---

# 48. Next Documents

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

Trước implementation production, phải resolve các Open Questions có priority Critical từ Domain Model, Database Design và API Specification.
