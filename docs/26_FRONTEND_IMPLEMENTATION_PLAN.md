# 26_FRONTEND_IMPLEMENTATION_PLAN.md

# Frontend Implementation Plan
## Hệ thống quản lý hoạt động Hợp tác xã nông nghiệp và số hóa hồ sơ đánh giá, phân hạng OCOP

---

## 1. Document Information

| Field | Value |
|---|---|
| Document ID | 26 |
| Document Name | Frontend Implementation Plan |
| Project | Xây dựng Hệ thống quản lý hoạt động Hợp tác xã nông nghiệp và số hóa hồ sơ đánh giá, phân hạng OCOP |
| Layer | Frontend |
| Status | Implementation Baseline |
| Audience | AI Coding Agent, Frontend Developer, Backend Developer, Tester |
| Depends On | 00–25, especially 08, 09, 13, 15, 16, 17, 19, 21, 22, 23, 24, 25 |
| Next Document | 27_UI_UX_SPECIFICATION.md |

---

# 2. Purpose

Tài liệu này chuyển kiến trúc frontend thành kế hoạch triển khai có thể thực thi.

Mục tiêu:

```text
Requirements
    ↓
Use Cases
    ↓
Workflow
    ↓
API
    ↓
Screens
    ↓
Components
    ↓
Tests
```

AI Coding Agent phải sử dụng tài liệu này để biết:

- triển khai feature nào trước;
- màn hình nào thuộc feature;
- API nào cần dùng;
- permission nào liên quan;
- workflow nào liên quan;
- dependency giữa các feature;
- tiêu chí hoàn thành;
- cách kiểm tra impact.

---

# 3. Implementation Principles

## 3.1. Implement in dependency order

Không triển khai OCOP trước khi các dependency nền tảng chưa ổn định.

Thứ tự baseline:

```text
F0 Bootstrap
 ↓
F1 Design System + App Shell
 ↓
F2 Authentication + Permission
 ↓
F3 Cooperative + Members
 ↓
F4 Agriculture
 ↓
F5 Products + Inventory
 ↓
F6 Finance
 ↓
F7 OCOP + Evidence
 ↓
F8 Evaluation + Workflow
 ↓
F9 Reports + Documents
 ↓
F10 Testing + Hardening
```

---

# 4. Phase F0 — Frontend Bootstrap

## Objective

Tạo frontend application có thể build/run/test.

## Tasks

- khởi tạo framework đã được project quyết định;
- TypeScript;
- package manager;
- lint;
- formatter;
- environment configuration;
- build;
- basic test;
- path aliases;
- folder structure;
- API client skeleton;
- router skeleton.

## Expected structure

```text
src/
├── app/
├── router/
├── layouts/
├── components/
├── features/
├── services/
├── hooks/
├── stores/
├── types/
├── utils/
├── constants/
└── styles/
```

## Acceptance Criteria

- application starts;
- development build works;
- production build works;
- type check passes;
- lint passes;
- test runner works;
- API base URL is configurable;
- no secrets are committed.

---

# 5. Phase F1 — Design System + Application Shell

## Objective

Tạo nền tảng UI dùng chung.

## Components

```text
Button
Input
Textarea
Select
Checkbox
Radio
DatePicker
FileUpload
Modal
Drawer
Tabs
Card
Table
Badge
Alert
Toast
Pagination
Breadcrumb
Spinner
Skeleton
EmptyState
ErrorState
```

## Layout

```text
AuthLayout
AppLayout
Header
Sidebar
Breadcrumb
PageHeader
```

## Acceptance Criteria

- shared components render;
- consistent spacing;
- consistent typography;
- consistent status;
- keyboard interaction cơ bản;
- responsive baseline;
- no duplicated UI primitives.

---

# 6. Phase F2 — Authentication and Authorization UI

## Screens

```text
/login
```

Có thể bổ sung:

```text
/session-expired
/forbidden
```

nếu cần.

## Features

- login;
- session bootstrap;
- current user;
- logout;
- permission loading;
- route guard;
- forbidden page;
- unauthorized handling.

## API Dependency

Phải đối chiếu:

- authentication API;
- current user API;
- permission contract;
- error contract.

Không invent endpoint.

## Acceptance Criteria

- unauthenticated user cannot access protected routes;
- authenticated user reaches dashboard;
- expired session is handled;
- logout works;
- unauthorized action is handled;
- no credentials are exposed.

---

# 7. Phase F3 — Cooperative Management

## Objective

Quản lý thông tin HTX.

## Screens

```text
/cooperative
/cooperative/edit
```

## Components

```text
CooperativeSummary
CooperativeForm
CooperativeStatusBadge
```

## API

Đối chiếu `12`, `17`, `23`.

Các operation có thể gồm:

```text
GET cooperative
PUT/PATCH cooperative
```

Chỉ sử dụng endpoint thực tế trong API contract.

## Acceptance Criteria

- view cooperative;
- edit allowed fields;
- validation;
- permission;
- loading/error/success;
- tenant scope.

---

# 8. Phase F3 — Members

## Screens

```text
/members
/members/new
/members/:id
/members/:id/edit
```

## Components

```text
MemberTable
MemberFilters
MemberForm
MemberSummary
MemberStatusBadge
MemberHistory
```

## Features

- list;
- search;
- filter;
- pagination;
- detail;
- create;
- edit;
- deactivate/reactivate nếu API cho phép;
- history.

## Permission

Đối chiếu `15_AUTHORIZATION_MATRIX.md`.

Không hard-code role.

## Test

- list;
- create;
- validation;
- detail;
- edit;
- permission;
- conflict.

---

# 9. Phase F4 — Production Units

## Screens

```text
/production-units
/production-units/new
/production-units/:id
/production-units/:id/edit
```

## Components

```text
ProductionUnitTable
ProductionUnitForm
ProductionUnitDetail
```

## Dependencies

```text
Cooperative
Members where applicable
Farm Plots
```

## Acceptance Criteria

- CRUD actions match API;
- tenant scope;
- validation;
- pagination;
- error handling.

---

# 10. Phase F4 — Farm Plots / Planting Areas

## Screens

```text
/farm-plots
/farm-plots/new
/farm-plots/:id
/farm-plots/:id/edit
```

## Components

```text
FarmPlotTable
FarmPlotForm
FarmPlotDetail
AreaDisplay
MapSelector if approved
```

Nếu có bản đồ:

> Map UI chỉ hỗ trợ nhập/xem dữ liệu địa lý; backend là source of truth.

Không thêm map provider nếu chưa được project quyết định.

---

# 11. Phase F4 — Crop Seasons

## Screens

```text
/crop-seasons
/crop-seasons/new
/crop-seasons/:id
/crop-seasons/:id/edit
```

## Dependencies

```text
Farm Plot
Crop
Production Unit
```

## Features

- season list;
- create;
- edit;
- detail;
- status;
- related plots.

---

# 12. Phase F4 — Farming Logs

## Screens

```text
/farming-logs
/farming-logs/new
/farming-logs/:id
```

## Components

```text
FarmingLogTable
FarmingLogForm
FarmingLogDetail
MaterialUsage
```

## Features

- record activity;
- date;
- production unit/plot;
- materials;
- notes;
- evidence where supported.

Backend validates inventory/business rules.

---

# 13. Phase F4 — Harvests / Lots

## Screens

```text
/harvests
/harvests/new
/harvests/:id
```

## Features

- harvest records;
- lot information;
- quantity;
- unit;
- production source;
- traceability references.

Frontend displays official quantities returned by backend.

---

# 14. Phase F5 — Products

## Screens

```text
/products
/products/new
/products/:id
/products/:id/edit
```

## Components

```text
ProductTable
ProductForm
ProductDetail
ProductStatusBadge
```

## Dependencies

- cooperative;
- production;
- harvest/lot where applicable.

---

# 15. Phase F5 — Materials

## Screens

```text
/materials
/materials/new
/materials/:id
/materials/:id/edit
```

## Features

- material master data;
- unit;
- status;
- search;
- filtering.

---

# 16. Phase F5 — Warehouses

## Screens

```text
/warehouses
/warehouses/new
/warehouses/:id
```

## Features

- warehouse list;
- warehouse detail;
- inventory summary;
- authorized actions.

---

# 17. Phase F5 — Inventory

## Screens

```text
/inventory
/inventory/receipts
/inventory/receipts/new
/inventory/issues
/inventory/issues/new
/inventory/adjustments
/inventory/counts
```

## Components

```text
StockTable
ReceiptForm
IssueForm
AdjustmentForm
StockCountForm
InventoryTransactionHistory
```

## Critical Rule

Không tự thay đổi official stock trên client.

Flow:

```text
Form
 ↓
Mutation API
 ↓
Backend transaction
 ↓
Success
 ↓
Invalidate stock
 ↓
Refetch
```

## Critical Tests

- duplicate submission;
- invalid quantity;
- insufficient stock;
- concurrent mutation;
- unauthorized action.

---

# 18. Phase F6 — Finance

## Screens

```text
/finance/transactions
/finance/transactions/new
/finance/transactions/:id

/finance/receivables
/finance/payables
/finance/settlements
/finance/surplus-distribution
```

## Components

```text
FinanceTransactionTable
FinanceTransactionForm
ReceivableTable
PayableTable
SettlementSummary
DistributionTable
```

## Critical Rules

- official calculation comes from backend;
- money format centralized;
- no floating-point official calculation;
- sensitive action confirmation;
- handle 409 conflict.

---

# 19. Phase F7 — OCOP Application

## Screens

```text
/ocop/applications
/ocop/applications/new
/ocop/applications/:id
/ocop/applications/:id/edit
```

## Main Components

```text
OcopApplicationTable
OcopApplicationForm
OcopApplicationSummary
OcopStatusBadge
CriteriaVersionBadge
```

## Features

- list;
- create;
- edit draft;
- detail;
- criteria version;
- workflow state;
- allowed actions.

---

# 20. Phase F7 — OCOP Criteria

## Screens

Có thể tích hợp vào application detail hoặc có screen quản trị riêng tùy permission:

```text
/ocop/criteria
/ocop/criteria/:id
```

Không triển khai screen quản trị criteria nếu scope/permission chưa xác định.

## Rule

Criteria phải render dynamic.

Không hard-code:

```text
number of criteria
score threshold
star threshold
```

---

# 21. Phase F7 — Evidence

## Screens

```text
/ocop/applications/:id/evidence
```

hoặc embedded trong application detail.

## Components

```text
EvidenceList
EvidenceUpload
EvidenceVersionHistory
EvidencePreview
EvidenceStatusBadge
```

## Flow

```text
Select
 ↓
Client validation
 ↓
Upload API
 ↓
Backend authorization/storage
 ↓
Evidence record
 ↓
Refresh
```

---

# 22. Phase F8 — Evaluation

## Screens

```text
/ocop/applications/:id/evaluation
/ocop/evaluations
/ocop/evaluations/:id
```

## Components

```text
EvaluationHeader
CriteriaTree
IndicatorRow
ScoreInput
EvidenceReference
ScoreSummary
EvaluatorComment
EvaluationActions
```

## Council Level

Baseline:

```text
PROVINCE
CENTRAL
```

Nhưng phải render từ API/configuration khi contract yêu cầu.

---

# 23. Phase F8 — Workflow

Workflow actions:

```text
Submit
Return
Resubmit
Start Review
Start Evaluation
Consolidate
Approve
Reject
Lock
```

Chỉ hiển thị action backend cho phép.

Không dùng arbitrary status update.

---

# 24. Phase F8 — Decision

## Screen

```text
/ocop/applications/:id/decision
```

Có thể embedded trong detail.

## Features

- result;
- decision status;
- council level;
- score summary;
- decision metadata;
- document link if available.

Không tự xác định final result.

---

# 25. Phase F9 — Reports

## Screens

```text
/reports
/reports/production
/reports/inventory
/reports/finance
/reports/ocop
```

Danh sách thực tế phải đối chiếu requirements.

## Rules

Report aggregation chính thức do backend.

Frontend chỉ:

- filter;
- display;
- request export;
- download.

---

# 26. Phase F9 — Documents

## Screens

```text
/documents
```

hoặc document actions trong từng module.

## Flow

```text
Generate
 ↓
Backend / Worker
 ↓
Processing
 ↓
Ready
 ↓
Download
```

Frontend không tự tạo document nghiệp vụ nếu backend đã chịu trách nhiệm.

---

# 27. Phase F9 — Audit

## Screen

```text
/audit
```

Chỉ role được phép mới thấy.

Filters có thể:

- actor;
- action;
- entity;
- date range;
- result.

Không cho edit/delete audit record.

---

# 28. Dashboard Implementation

Dashboard nên triển khai sau authentication và các API aggregation cần thiết.

## Widgets có thể gồm

```text
Cooperative summary
Member summary
Production summary
Inventory summary
Finance summary
OCOP application summary
Pending actions
Alerts
```

Không thêm widget nếu API/requirement chưa có căn cứ.

---

# 29. Shared Page Patterns

## List Page

```text
PageHeader
 ↓
Filters
 ↓
Table
 ↓
Pagination
```

## Create/Edit Page

```text
PageHeader
 ↓
Form
 ↓
Actions
```

## Detail Page

```text
PageHeader
 ↓
Summary
 ↓
Tabs/Sections
 ↓
Related data
 ↓
History
```

## Workflow Page

```text
Header
 ↓
Current status
 ↓
Content
 ↓
Allowed actions
 ↓
History
```

---

# 30. Implementation Dependency Graph

```text
F0 Bootstrap
   ↓
F1 UI Shell
   ↓
F2 Auth
   ↓
F3 Cooperative
   ↓
Members
   ↓
Production Units
   ↓
Farm Plots
   ↓
Crop Seasons
   ↓
Farming Logs
   ↓
Harvests
   ↓
Products
   ↓
Materials
   ↓
Warehouses
   ↓
Inventory
   ↓
Finance
   ↓
OCOP Applications
   ↓
Evidence
   ↓
Evaluation
   ↓
Workflow / Decision
   ↓
Reports / Documents
```

Các dependency không cần thiết phải được làm tuần tự nếu API/backend đã ổn định, nhưng AI phải tránh tạo coupling.

---

# 31. API Mapping Principle

Mỗi screen phải có API mapping.

Mẫu:

```text
Screen
→ Query
→ Mutation
→ Permission
→ Workflow
→ Test
```

Ví dụ:

```text
MemberListPage
→ GET /members
→ MEMBER_VIEW
→ N/A
→ TC-MEMBER-LIST
```

```text
MemberCreatePage
→ POST /members
→ MEMBER_CREATE
→ N/A
→ TC-MEMBER-CREATE
```

```text
OCOPEvaluationPage
→ Evaluation queries
→ Score mutations
→ OCOP_EVALUATE
→ EVALUATING
→ TC-OCOP-EVALUATION
```

Endpoint cụ thể phải lấy từ OpenAPI/API contract, không tự invent.

---

# 32. Permission Mapping

Mỗi protected action phải có:

```text
UI Action
→ Permission
→ Backend Endpoint
```

Ví dụ:

```text
Create Member
→ MEMBER_CREATE
→ POST /members
```

```text
Approve OCOP
→ OCOP_APPROVE
→ POST /applications/{id}/approve
```

Tên permission phải lấy từ `15_AUTHORIZATION_MATRIX.md` hoặc contract đã được phê duyệt.

---

# 33. Workflow Mapping

Mỗi workflow screen/action:

```text
Current State
+
Permission
+
Allowed Action
→ UI
```

Không tự suy luận workflow ngoài tài liệu.

---

# 34. Implementation Order Within a Feature

Khuyến nghị:

```text
1. Types
2. API client/query/mutation
3. Validation schema
4. Shared feature components
5. List page
6. Create/Edit form
7. Detail page
8. Actions
9. Permission UI
10. Loading/error/empty
11. Tests
12. Refactor
```

Không xây page trước rồi mới xác định API.

---

# 35. Feature Completion Checklist

Mỗi feature phải có:

- [ ] route;
- [ ] page;
- [ ] API query;
- [ ] API mutation nếu có;
- [ ] request/response types;
- [ ] validation;
- [ ] permission;
- [ ] loading;
- [ ] empty;
- [ ] error;
- [ ] success;
- [ ] confirmation;
- [ ] responsive;
- [ ] tests;
- [ ] traceability.

---

# 36. Phase Gate F0

Pass khi:

```text
Build ✓
Typecheck ✓
Lint ✓
Test runner ✓
Environment ✓
Router ✓
API client ✓
```

---

# 37. Phase Gate F1

Pass khi:

```text
Design system ✓
App shell ✓
Responsive baseline ✓
Accessibility baseline ✓
Global error handling ✓
```

---

# 38. Phase Gate F2

Pass khi:

```text
Login ✓
Session ✓
Logout ✓
Route guard ✓
Permission-aware navigation ✓
Unauthorized handling ✓
```

---

# 39. Phase Gate F3

Pass khi:

```text
Cooperative ✓
Members ✓
CRUD flows ✓
Validation ✓
Permissions ✓
Tests ✓
```

---

# 40. Phase Gate F4

Pass khi:

```text
Production units ✓
Farm plots ✓
Crop seasons ✓
Farming logs ✓
Harvests ✓
Traceability links ✓
```

---

# 41. Phase Gate F5

Pass khi:

```text
Products ✓
Materials ✓
Warehouses ✓
Inventory ✓
Stock refresh ✓
Concurrency handling ✓
```

---

# 42. Phase Gate F6

Pass khi:

```text
Transactions ✓
Receivables ✓
Payables ✓
Settlement ✓
Distribution ✓
Money formatting ✓
```

---

# 43. Phase Gate F7

Pass khi:

```text
OCOP application ✓
Dynamic criteria ✓
Evidence ✓
Version awareness ✓
Permission ✓
```

---

# 44. Phase Gate F8

Pass khi:

```text
Evaluation ✓
Score entry ✓
Evidence references ✓
Workflow ✓
Decision ✓
Council level ✓
```

---

# 45. Phase Gate F9

Pass khi:

```text
Reports ✓
Document generation request ✓
Download ✓
Audit UI ✓
```

---

# 46. Phase Gate F10

Pass khi:

```text
Unit tests ✓
Component tests ✓
Integration tests ✓
E2E critical flows ✓
Security review ✓
Performance review ✓
Production build ✓
```

---

# 47. AI Coding Agent Task Template

AI nên nhận task theo mẫu:

```text
TASK:
Implement Member List Screen.

CONTEXT:
- FR: ...
- UC: ...
- Screen: ...
- API: ...
- Permission: ...
- Workflow: N/A
- Test: ...

CONSTRAINTS:
- Follow 24 and 25.
- Do not invent API.
- Do not modify backend unless explicitly requested.

DONE WHEN:
- list works;
- search works;
- pagination works;
- permission works;
- loading/empty/error works;
- tests pass.
```

---

# 48. AI Task Execution Contract

AI phải:

```text
Read
 ↓
Trace
 ↓
Inspect existing code
 ↓
Plan
 ↓
Implement
 ↓
Test
 ↓
Review
 ↓
Report
```

Report phải nêu:

```text
Implemented
Files changed
API used
Permission
Tests
Known gaps
```

---

# 49. Change Impact Rules

Nếu task chỉ thay UI:

```text
Check screen + component
```

Nếu thay API integration:

```text
Check OpenAPI
Check backend implementation
Check frontend types
Check tests
```

Nếu thay workflow:

```text
Check FR
Check UC
Check workflow
Check permission
Check API
Check backend
Check traceability
```

Nếu thay OCOP criteria:

```text
STOP
→ policy impact analysis
```

Nếu thay database:

```text
STOP
→ backend/database change process
```

---

# 50. Parallel Development

Có thể triển khai song song:

```text
Members
Production
Inventory
Finance
```

nếu:

- shared shell đã ổn;
- API contract ổn;
- coding standards ổn;
- feature boundaries rõ.

OCOP nên bắt đầu sau khi foundation và các dependency liên quan đủ ổn định.

---

# 51. Recommended Sprint Breakdown

## Sprint 1

```text
F0
F1
```

## Sprint 2

```text
F2
Cooperative
Members
```

## Sprint 3

```text
Production Units
Farm Plots
Crop Seasons
```

## Sprint 4

```text
Farming Logs
Harvests
Products
Materials
```

## Sprint 5

```text
Warehouses
Inventory
```

## Sprint 6

```text
Finance
```

## Sprint 7

```text
OCOP Applications
Criteria
Evidence
```

## Sprint 8

```text
Evaluation
Workflow
Decision
```

## Sprint 9

```text
Reports
Documents
Audit
```

## Sprint 10

```text
Testing
Security
Performance
Deployment hardening
```

---

# 52. MVP Prioritization

## P0 — Must Have

```text
Auth
Cooperative
Members
Production Units
Farm Plots
Crop Seasons
Farming Logs
Products
Materials
Inventory
Finance core
OCOP Application
Evidence
Evaluation
Workflow
Reports basic
```

## P1 — Important

```text
Advanced reports
Document generation
Audit UI
Dashboard enhancements
```

## P2 — Optional

Chỉ triển khai khi có thời gian và requirement:

```text
Advanced map
advanced analytics
additional integrations
real-time notifications
mobile optimization beyond responsive web
```

Không biến P2 thành mandatory scope nếu chưa được phê duyệt.

---

# 53. MVP Definition

MVP phải chứng minh được end-to-end flow:

```text
Login
 ↓
HTX
 ↓
Member
 ↓
Production Area
 ↓
Season
 ↓
Production Log
 ↓
Harvest / Product
 ↓
Inventory / Finance
 ↓
OCOP Application
 ↓
Evidence
 ↓
Evaluation
 ↓
Workflow
 ↓
Result
```

MVP không nhất thiết phải có mọi báo cáo nâng cao.

---

# 54. End-to-End Demo Flow

Demo có thể theo:

```text
1. Login
2. Dashboard
3. View HTX
4. Create member
5. Create production unit
6. Create farm plot
7. Create crop season
8. Record farming log
9. Record harvest
10. View product
11. Receive/use material
12. View inventory
13. Record finance transaction
14. Create OCOP application
15. Add evidence
16. Submit
17. Evaluate
18. Enter score
19. Consolidate
20. Decision
21. View report
22. Download document
```

Các bước thực tế phải tuân thủ workflow và permission.

---

# 55. Frontend Traceability Matrix Structure

Khuyến nghị bảng:

| Screen ID | Screen | FR | UC | API | Permission | Workflow | Test |
|---|---|---|---|---|---|---|---|
| SCR-AUTH-001 | Login | FR-AUTH-* | UC-AUTH-* | Auth API | AUTH_LOGIN | N/A | TC-AUTH-* |
| SCR-MEM-001 | Member List | FR-MEMBER-* | UC-MEMBER-* | Members GET | MEMBER_VIEW | N/A | TC-MEMBER-* |
| SCR-MEM-002 | Member Create | FR-MEMBER-* | UC-MEMBER-* | Members POST | MEMBER_CREATE | N/A | TC-MEMBER-* |
| SCR-OCOP-001 | Application List | FR-OCOP-* | UC-OCOP-* | OCOP GET | OCOP_VIEW | N/A | TC-OCOP-* |
| SCR-OCOP-002 | Evaluation | FR-OCOP-* | UC-OCOP-* | Evaluation API | OCOP_EVALUATE | EVALUATING | TC-OCOP-* |

ID chính thức phải được đồng bộ với traceability matrix.

---

# 56. No Orphan Screens

Không được tạo screen không có:

```text
Requirement
OR
approved supporting function
```

Nếu screen không map được:

```text
FR
UC
API
Permission
```

thì phải xem xét lại.

---

# 57. No Orphan API Usage

Không được gọi API mà không xác định:

- use case;
- screen/feature;
- permission;
- response usage.

API call không rõ mục đích phải được xem xét.

---

# 58. No Orphan Permission

Không hard-code permission chưa tồn tại trong authorization contract.

Nếu cần permission mới:

```text
Document gap
→ update authorization design
→ update backend
→ update frontend
```

---

# 59. Frontend Data Ownership

| Data | Owner |
|---|---|
| Authentication | Backend/Auth provider |
| Authorization | Backend |
| Tenant scope | Backend |
| Member records | Backend |
| Inventory stock | Backend |
| Finance balance | Backend |
| OCOP criteria | Policy/backend |
| Official OCOP score | Backend |
| Workflow state | Backend |
| Audit records | Backend |
| UI state | Frontend |
| Temporary form state | Frontend |

---

# 60. Recommended First Implementation Tasks

Sau khi hoàn thành tài liệu:

```text
TASK-001
Bootstrap frontend

TASK-002
Create app shell

TASK-003
Create design system

TASK-004
Implement authentication

TASK-005
Implement permission-aware routing

TASK-006
Implement cooperative

TASK-007
Implement members
```

Không bắt đầu bằng OCOP nếu foundation chưa hoạt động.

---

# 61. Final Implementation Contract

Frontend implementation phải đảm bảo:

```text
Architecture
+
Coding Standards
+
API Contract
+
Authorization
+
Workflow
+
Traceability
+
Testing
```

Mỗi feature phải đi qua:

```text
READY
 ↓
IMPLEMENT
 ↓
TEST
 ↓
REVIEW
 ↓
DONE
```

Không coi việc render UI là hoàn thành feature.

Feature chỉ Done khi:

```text
UI
+
API
+
Permission
+
Validation
+
Error Handling
+
Tests
```

đã được xử lý.

---

# 62. Next Document

Tài liệu tiếp theo:

`27_UI_UX_SPECIFICATION.md`

Mục tiêu:

```text
Frontend Architecture
        ↓
Design System
        ↓
Layout
        ↓
Components
        ↓
Form patterns
        ↓
Table patterns
        ↓
Dashboard
        ↓
OCOP UI
        ↓
Responsive
        ↓
Accessibility
```

**End of Document**
