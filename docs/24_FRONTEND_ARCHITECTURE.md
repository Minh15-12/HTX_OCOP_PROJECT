# 24_FRONTEND_ARCHITECTURE.md

# Kiến trúc Frontend
## Hệ thống quản lý hoạt động Hợp tác xã nông nghiệp và số hóa hồ sơ đánh giá, phân hạng OCOP

---

## 1. Document Information

| Field | Value |
|---|---|
| Document ID | 24 |
| Document Name | Frontend Architecture Specification |
| Project | Xây dựng Hệ thống quản lý hoạt động Hợp tác xã nông nghiệp và số hóa hồ sơ đánh giá, phân hạng OCOP |
| Layer | Frontend |
| Status | Baseline / Implementation-Oriented |
| Audience | AI Coding Agent, Frontend Developer, Backend Developer, Tester, Project Reviewer |
| Depends On | 00, 08, 09, 10, 12, 13, 15, 16, 17, 19, 21, 22, 23 |
| Next Documents | 25_FRONTEND_CODING_STANDARDS.md, 26_FRONTEND_IMPLEMENTATION_PLAN.md |

---

# 2. Purpose

Tài liệu này định nghĩa kiến trúc frontend của hệ thống.

Frontend phải cung cấp giao diện web thống nhất để người dùng:

- đăng nhập và quản lý phiên;
- xem dashboard;
- quản lý hợp tác xã;
- quản lý xã viên;
- quản lý đơn vị sản xuất;
- quản lý vùng trồng/thửa đất;
- quản lý mùa vụ;
- ghi nhận nhật ký sản xuất;
- quản lý thu hoạch/lô;
- quản lý sản phẩm;
- quản lý vật tư;
- quản lý kho và tồn kho;
- quản lý nghiệp vụ tài chính;
- lập và quản lý hồ sơ OCOP;
- quản lý minh chứng;
- thực hiện các bước đánh giá theo quyền;
- theo dõi workflow;
- xem báo cáo;
- xuất tài liệu;
- xem lịch sử/audit khi được cấp quyền.

Frontend **không được trở thành nơi chứa business rule độc lập với backend**.

Backend/API là source of truth đối với:

- dữ liệu nghiệp vụ;
- quyền;
- tenant scope;
- workflow;
- trạng thái;
- tiêu chí OCOP;
- tính điểm;
- tính toán tài chính;
- tồn kho;
- tính hợp lệ của giao dịch;
- lịch sử và audit.

Frontend có trách nhiệm chủ yếu về:

- presentation;
- interaction;
- client-side validation cho UX;
- gọi API;
- quản lý trạng thái giao diện;
- route protection;
- hiển thị permission-aware UI;
- loading/error/empty state;
- điều phối upload/download thông qua API;
- hiển thị kết quả do backend trả về.

---

# 3. Architectural Principles

## 3.1. Backend-first business integrity

Frontend không tự quyết định kết quả nghiệp vụ quan trọng.

Ví dụ không được:

- tự tính điểm OCOP cuối cùng rồi coi đó là kết quả chính thức;
- tự chuyển trạng thái hồ sơ;
- tự xác định người dùng có quyền approve;
- tự cộng/trừ tồn kho;
- tự xác nhận giao dịch tài chính;
- tự thay đổi council level;
- tự quyết định hồ sơ đủ điều kiện đánh giá.

Frontend có thể hiển thị preview hoặc validation hỗ trợ UX nhưng backend phải kiểm tra lại.

---

## 3.2. API Contract First

Frontend phát triển dựa trên API contract đã định nghĩa trong:

- `12_API_SPECIFICATION.md`
- `17_OPENAPI_SPECIFICATION.md`
- `23_BACKEND_API_IMPLEMENTATION_PLAN.md`

Không tự tạo API endpoint chỉ vì frontend cần.

Nếu frontend cần dữ liệu mà API chưa hỗ trợ:

1. xác định use case;
2. kiểm tra traceability;
3. kiểm tra API specification;
4. ghi nhận gap;
5. chỉ bổ sung API khi có căn cứ.

---

## 3.3. Feature-Oriented Architecture

Frontend tổ chức theo feature/module nghiệp vụ thay vì gom toàn bộ component theo loại.

Khuyến nghị:

```text
src/
├── app/
├── features/
│   ├── auth/
│   ├── dashboard/
│   ├── cooperative/
│   ├── members/
│   ├── production-units/
│   ├── farm-plots/
│   ├── crop-seasons/
│   ├── farming-logs/
│   ├── harvests/
│   ├── products/
│   ├── materials/
│   ├── warehouses/
│   ├── inventory/
│   ├── finance/
│   ├── ocop/
│   ├── evidence/
│   ├── workflow/
│   ├── reports/
│   ├── documents/
│   └── audit/
├── components/
├── layouts/
├── services/
├── stores/
├── hooks/
├── utils/
├── types/
├── constants/
└── router/
```

Tên thư mục có thể điều chỉnh theo framework đã được project bootstrap lựa chọn nhưng không được phá vỡ boundary nghiệp vụ.

---

# 4. Technology Baseline

## 4.1. Framework

Project baseline cho phép:

- React + TypeScript
- hoặc Vue + TypeScript

Tuy nhiên sau khi project bootstrap chọn một framework, AI Coding Agent phải:

- giữ nguyên framework;
- không chuyển React ↔ Vue giữa chừng;
- không đưa thêm framework frontend thứ hai;
- không thay đổi stack nếu không có yêu cầu rõ ràng.

## 4.2. Recommended baseline

Nếu chưa có quyết định khác:

```text
React
TypeScript
Vite
React Router
TanStack Query
Zod hoặc validation library tương đương
Axios hoặc fetch wrapper
```

UI library có thể chọn một thư viện thống nhất, nhưng phải được quyết định trước khi implementation diện rộng.

## 4.3. Không phụ thuộc framework

Các quy tắc nghiệp vụ phải được tổ chức sao cho:

- business concept không phụ thuộc React component;
- API contract không phụ thuộc UI;
- domain type không nằm rải rác trong component;
- reusable component không biết business workflow cụ thể.

---

# 5. High-Level Frontend Architecture

```text
┌──────────────────────────────────────────────┐
│                  Browser                     │
│                                              │
│  ┌────────────── Presentation ────────────┐  │
│  │ Pages / Layouts / Components / Forms   │  │
│  └────────────────────┬───────────────────┘  │
│                       │                       │
│  ┌────────────────────▼───────────────────┐  │
│  │        Feature/Application Layer       │  │
│  │ Queries / Mutations / View Models      │  │
│  │ Permission-aware actions / Workflows   │  │
│  └────────────────────┬───────────────────┘  │
│                       │                       │
│  ┌────────────────────▼───────────────────┐  │
│  │             Data Access                │  │
│  │ API Client / Query Cache / Upload      │  │
│  └────────────────────┬───────────────────┘  │
└───────────────────────┼──────────────────────┘
                        │ HTTPS / JSON / Multipart
                        ▼
              ┌───────────────────┐
              │   Backend API     │
              └─────────┬─────────┘
                        ▼
              PostgreSQL / MinIO
```

Frontend không truy cập trực tiếp PostgreSQL.

Frontend không truy cập database.

Frontend không chứa secret backend.

Frontend không lưu credential MinIO dài hạn.

---

# 6. Application Shell

Application shell gồm:

```text
App
├── Router
├── Authentication bootstrap
├── Permission bootstrap
├── Tenant/cooperative context
├── Global error boundary
├── Query client
├── Notification system
├── Theme/design system
└── Main layout
```

## 6.1. Main Layout

```text
┌─────────────────────────────────────────────┐
│ Header                                      │
├──────────────┬──────────────────────────────┤
│ Sidebar      │ Breadcrumb                   │
│              ├──────────────────────────────┤
│ Navigation   │ Page Header                  │
│              ├──────────────────────────────┤
│              │ Page Content                 │
│              │                              │
│              │                              │
│              └──────────────────────────────┤
│              │                              │
└──────────────┴──────────────────────────────┘
```

Các thành phần:

- Header;
- Sidebar;
- Breadcrumb;
- Page header;
- Content;
- Notification;
- User menu;
- Current cooperative/tenant context nếu cần.

---

# 7. Frontend Module Boundaries

## 7.1. Authentication

Trách nhiệm:

- login;
- logout;
- session bootstrap;
- current user;
- permission bootstrap;
- token/session handling;
- unauthorized handling.

Không được:

- tự giả lập authentication;
- lưu access token theo cách không phù hợp với backend security contract;
- tự cấp quyền.

---

## 7.2. Dashboard

Trách nhiệm:

- tổng quan số liệu;
- trạng thái công việc;
- cảnh báo;
- shortcut;
- tiến độ OCOP;
- tổng quan sản xuất/tồn kho/tài chính theo quyền.

Dashboard chỉ hiển thị dữ liệu từ API.

---

## 7.3. Cooperative

Quản lý:

- thông tin HTX;
- thông tin cơ bản;
- trạng thái;
- thông tin quản trị được phép chỉnh sửa.

Không hiển thị hoặc chỉnh sửa dữ liệu ngoài tenant scope.

---

## 7.4. Members

Quản lý:

- danh sách xã viên;
- tạo;
- xem;
- chỉnh sửa;
- trạng thái;
- lịch sử;
- vốn góp nếu API/permission cho phép.

Frontend phải hỗ trợ:

- search;
- filter;
- pagination;
- sorting;
- validation;
- empty state.

---

## 7.5. Production Units

Quản lý đơn vị/vùng sản xuất thuộc HTX.

---

## 7.6. Farm Plots

Quản lý:

- vùng trồng;
- thửa đất;
- diện tích;
- cây trồng;
- thông tin liên quan.

Nếu có bản đồ, bản đồ là UI hỗ trợ; dữ liệu địa lý chính thức vẫn do backend quản lý.

---

## 7.7. Crop Seasons

Quản lý:

- mùa vụ;
- cây trồng;
- thời gian;
- liên kết vùng trồng;
- trạng thái.

---

## 7.8. Farming Logs

Quản lý nhật ký sản xuất:

- ngày;
- hoạt động;
- vật tư sử dụng;
- ghi chú;
- người thực hiện;
- minh chứng nếu có.

---

## 7.9. Harvests / Lots

Quản lý:

- thu hoạch;
- lô;
- số lượng;
- đơn vị;
- nguồn gốc;
- liên kết sản xuất.

---

## 7.10. Products

Quản lý:

- sản phẩm;
- thông tin sản phẩm;
- trạng thái;
- liên kết OCOP khi phù hợp.

---

## 7.11. Materials

Quản lý vật tư:

- danh mục;
- đơn vị;
- trạng thái;
- thông tin liên quan.

---

## 7.12. Warehouses / Inventory

Frontend hỗ trợ:

- danh sách kho;
- phiếu nhập;
- phiếu xuất;
- điều chỉnh;
- kiểm kê;
- xem tồn kho;
- lịch sử giao dịch.

Không tự cập nhật số lượng tồn kho bằng state frontend.

Sau mutation:

1. gửi command API;
2. backend transaction;
3. invalidate/refetch query;
4. hiển thị dữ liệu tồn kho mới.

---

# 8. Finance Frontend

Các màn hình có thể gồm:

```text
Finance
├── Transactions
├── Receivables
├── Payables
├── Settlements
└── Surplus Distribution
```

Frontend phải:

- format tiền đúng locale;
- không dùng floating-point tùy tiện cho logic tiền;
- hiển thị trạng thái giao dịch;
- hiển thị quyền action;
- không tự xác nhận giao dịch.

Các phép tính chính thức phải lấy từ backend.

---

# 9. OCOP Frontend Architecture

OCOP là module đặc biệt vì tiêu chí và quy trình có thể thay đổi theo chính sách.

Frontend không hard-code:

- số lượng tiêu chí;
- số điểm tối đa;
- số sao;
- cấp đánh giá;
- council level;
- điều kiện chuyển cấp;
- workflow cụ thể.

Thay vào đó, frontend đọc configuration/policy từ API.

## 9.1. OCOP module

```text
features/ocop/
├── applications/
├── criteria/
├── evaluations/
├── scoring/
├── evidence/
├── workflow/
├── decisions/
└── reports/
```

## 9.2. Application UI

Có thể gồm:

```text
OCOP Applications
├── List
├── Create
├── Detail
├── Edit
├── Evidence
├── Evaluation
├── Score
├── Workflow
└── Decision
```

---

# 10. OCOP Criteria Rendering

Criteria phải được render theo dữ liệu backend.

Ví dụ API có thể trả:

```json
{
  "criteria_version": {
    "id": "uuid",
    "name": "Current Criteria",
    "status": "ACTIVE"
  },
  "criteria": [
    {
      "id": "uuid",
      "code": "CR-01",
      "name": "Product Information",
      "max_score": 10,
      "indicators": []
    }
  ]
}
```

Frontend dùng metadata này để render.

Không viết:

```typescript
const TOTAL_OCOP_CRITERIA = 14;
```

nếu con số đó chưa được xác định là cấu hình chính thức.

---

# 11. Evaluation UI

Evaluation session phải hiển thị:

- council level;
- session status;
- evaluator/assignment nếu user có quyền;
- criteria;
- indicators;
- score;
- comments;
- evidence;
- calculation result;
- lock status;
- workflow actions.

Baseline hiện tại hỗ trợ:

```text
PROVINCE
CENTRAL
```

Nhưng frontend phải coi đây là configuration/policy data, không phải enum UI bất biến.

---

# 12. Score Entry

Frontend có thể validate:

- required;
- numeric;
- min/max;
- format.

Nhưng backend phải validate lại.

Frontend không được coi:

```text
frontend score = official score
```

Official score là kết quả backend sau khi áp dụng policy/version tương ứng.

---

# 13. Evidence Frontend

Evidence UI hỗ trợ:

- upload;
- list;
- preview;
- metadata;
- version;
- verification status;
- download.

Upload flow:

```text
User selects file
       ↓
Client validation
       ↓
API upload/request
       ↓
Backend authorization
       ↓
Storage
       ↓
Evidence record/version
       ↓
API response
       ↓
Invalidate evidence query
```

Frontend không lưu MinIO credential.

Frontend không tự tạo public URL cho file private.

---

# 14. Workflow UI

Workflow action phải sử dụng action endpoint.

Ví dụ:

```text
Submit
Return
Resubmit
Approve
Reject
Consolidate
Lock
```

Không dùng:

```http
PATCH /applications/{id}
{
  "status": "APPROVED"
}
```

chỉ để thay đổi trạng thái.

Frontend phải hiển thị action dựa trên:

- trạng thái hiện tại;
- permission;
- API-provided allowed actions nếu có.

Ví dụ:

```text
Application status: SUBMITTED

Allowed actions:
- Start Review
- Return
```

Không tự suy diễn action từ status nếu backend đã cung cấp danh sách allowed actions.

---

# 15. Permission-Aware UI

UI phải ẩn/disable action khi user không có quyền, nhưng đây chỉ là UX.

Security enforcement vẫn ở backend.

Ví dụ:

```typescript
if (can("member.create")) {
  showCreateButton();
}
```

Nhưng API vẫn phải kiểm tra:

```text
Authentication
→ Authorization
→ Tenant Scope
→ Business Rule
```

Không được coi việc ẩn button là security control.

---

# 16. Route Architecture

Route nên phân theo module:

```text
/login

/
├── dashboard
├── cooperative
├── members
├── production-units
├── farm-plots
├── crop-seasons
├── farming-logs
├── harvests
├── products
├── materials
├── warehouses
├── inventory
├── finance
├── ocop
├── reports
├── documents
└── audit
```

Nested routes:

```text
/ocop/applications
/ocop/applications/new
/ocop/applications/:id
/ocop/applications/:id/edit
/ocop/applications/:id/evidence
/ocop/applications/:id/evaluation
```

Route naming phải nhất quán với resource/API.

---

# 17. Route Guards

Các lớp guard:

```text
Public Route
      ↓
Authenticated Route
      ↓
Tenant Scope
      ↓
Permission Guard
      ↓
Page
```

Không dùng frontend route guard để thay thế backend authorization.

---

# 18. State Management

Phân biệt:

### Server State

Bao gồm:

- API data;
- list;
- detail;
- dashboard;
- criteria;
- workflow;
- evidence;
- reports.

Nên sử dụng query/cache mechanism.

### Client State

Bao gồm:

- modal open/close;
- selected row;
- filter draft;
- sidebar collapsed;
- temporary form state;
- UI preferences.

Không đưa toàn bộ server data vào global client store nếu không cần.

---

# 19. Query and Mutation Rules

Mỗi feature nên có query/mutation rõ ràng.

Ví dụ:

```text
useMembersQuery
useMemberQuery
useCreateMemberMutation
useUpdateMemberMutation
useDeactivateMemberMutation
```

Mutation flow:

```text
UI
 ↓
Mutation
 ↓
API
 ↓
Backend
 ↓
Success
 ↓
Invalidate affected queries
 ↓
Refresh UI
```

Không tự mutate cached data theo cách làm sai lệch server state.

---

# 20. API Client

Tất cả request nên đi qua một API client thống nhất.

API client chịu trách nhiệm:

- base URL;
- headers;
- auth/session;
- serialization;
- response parsing;
- error normalization;
- correlation/request ID nếu cần;
- timeout;
- retry policy phù hợp.

Không viết:

```typescript
fetch("http://localhost:8000/api/...")
```

rải rác trong component.

---

# 21. Error Handling

Frontend phải phân biệt:

```text
400 Validation Error
401 Unauthenticated
403 Forbidden
404 Not Found
409 Conflict
422 Business Validation
429 Rate Limited
500 Server Error
503 Service Unavailable
```

UI cần:

- message dễ hiểu;
- field errors;
- retry khi phù hợp;
- không expose stack trace;
- không expose secret;
- không hiển thị lỗi kỹ thuật không cần thiết cho người dùng.

---

# 22. Loading / Empty / Error States

Mọi màn hình có dữ liệu phải có tối thiểu:

```text
Loading
Success
Empty
Error
```

Các mutation cần:

```text
Idle
Submitting
Success
Error
```

Không để màn hình trắng khi API đang lỗi.

---

# 23. Form Architecture

Form phải tách:

```text
Form UI
   ↓
Schema Validation
   ↓
DTO / Request Payload
   ↓
Mutation
   ↓
API
```

Client validation nhằm:

- UX;
- giảm request không hợp lệ;
- hiển thị lỗi sớm.

Không được bỏ qua server validation.

---

# 24. Tables

Danh sách nghiệp vụ nên hỗ trợ khi cần:

- pagination;
- sorting;
- filtering;
- search;
- column formatting;
- status badge;
- row action;
- bulk action nếu nghiệp vụ cho phép.

Pagination server-side được ưu tiên đối với dataset lớn.

Không tải toàn bộ dữ liệu chỉ để phân trang trên browser nếu API hỗ trợ server-side pagination.

---

# 25. Search / Filter

Filter phải map rõ với API query parameters.

Ví dụ:

```text
GET /members?page=1
&page_size=20
&search=...
&status=ACTIVE
&sort=-created_at
```

Frontend không tự filter một dataset partial rồi coi đó là kết quả đầy đủ.

---

# 26. File Download

File private phải đi qua authorization flow.

Có thể:

```text
Frontend
 ↓
GET /evidence/{id}/download
 ↓
Backend authorization
 ↓
Short-lived signed URL / stream
 ↓
Browser
```

Frontend không được:

- lưu secret storage credential;
- tự tạo signed URL;
- biến private object thành public chỉ để tải file.

---

# 27. Notifications

Hệ thống nên có centralized notification mechanism:

```text
Toast
Inline alert
Modal confirmation
Page-level alert
```

Notification phải:

- rõ hành động;
- không gây hiểu nhầm;
- không che mất lỗi validation;
- không hiển thị success trước khi backend xác nhận.

---

# 28. Confirmation Rules

Các action có tác động lớn cần confirmation:

- deactivate member;
- delete/soft-delete;
- submit;
- return;
- approve;
- reject;
- lock score;
- finalize transaction;
- distribution/finalization nếu API hỗ trợ.

Nội dung confirmation phải nói rõ tác động.

---

# 29. Responsive Design

Frontend phải hỗ trợ:

- desktop;
- laptop;
- tablet;
- mobile ở mức phù hợp.

Ưu tiên:

```text
Desktop-first for administrative workflows
Responsive adaptation for smaller screens
```

Không bắt buộc mọi bảng nghiệp vụ phải hiển thị nguyên dạng trên mobile; có thể chuyển thành card/stacked layout.

---

# 30. Accessibility

Tối thiểu:

- semantic HTML;
- keyboard navigation;
- visible focus;
- label cho form;
- accessible error;
- contrast phù hợp;
- button có tên rõ ràng;
- modal có keyboard close;
- không dùng màu sắc duy nhất để truyền tải trạng thái.

---

# 31. Component Architecture

Phân tầng:

```text
UI Primitives
    ↓
Shared Components
    ↓
Feature Components
    ↓
Page Components
```

Ví dụ:

```text
Button
Input
Select
Modal
Table
Badge
Pagination
      ↓
FormField
DataTable
StatusBadge
ConfirmDialog
      ↓
MemberTable
MemberForm
OCOPCriteriaTable
EvaluationScoreForm
      ↓
MemberListPage
MemberDetailPage
OCOPEvaluationPage
```

Shared component không được chứa business rule riêng của một module.

---

# 32. Design System

Design system phải tập trung:

```text
src/components/ui/
```

Có thể gồm:

- Button;
- Input;
- Select;
- Checkbox;
- Radio;
- DatePicker;
- FileUpload;
- Table;
- Badge;
- Alert;
- Dialog;
- Drawer;
- Tabs;
- Breadcrumb;
- Pagination;
- Card;
- EmptyState;
- LoadingState.

Mục tiêu là tránh mỗi module tự xây một component tương tự.

---

# 33. Type System

TypeScript type nên phản ánh API contract.

Ví dụ:

```typescript
type MemberStatus =
  | "ACTIVE"
  | "INACTIVE"
  | "SUSPENDED";
```

Nhưng với policy/configurable data:

```typescript
type CouncilLevel = string;
```

nếu backend có khả năng mở rộng và API không cam kết enum bất biến.

Nếu OpenAPI định nghĩa enum chính thức thì frontend có thể generate/use type tương ứng.

---

# 34. DTO / View Model

Không nên đưa API response trực tiếp vào mọi UI component.

Có thể có:

```text
API Response
    ↓
Mapper
    ↓
View Model
    ↓
Component
```

Đặc biệt khi API response phức tạp.

Tuy nhiên không tạo mapper dư thừa nếu API model và UI model đã tương đương.

---

# 35. Authentication State

Authentication bootstrap:

```text
App Start
 ↓
Check Session
 ↓
GET Current User
 ↓
GET Permissions / Context if needed
 ↓
Authenticated App
```

Nếu session không hợp lệ:

```text
→ clear client auth state
→ redirect /login
```

Không redirect vòng lặp.

---

# 36. Tenant / Cooperative Context

Hệ thống có multi-tenant boundary theo cooperative.

Frontend phải biết context hiện tại khi cần:

```text
Current User
Current Cooperative
Current Permissions
```

Nhưng tenant isolation chính thức vẫn do backend enforce.

Frontend không được cho phép user nhập tùy ý:

```text
cooperative_id
```

để truy cập tenant khác nếu API không cấp quyền.

---

# 37. Caching Strategy

Cache phù hợp cho:

- master data;
- danh mục;
- criteria version;
- current user;
- permissions;
- dashboard data với TTL hợp lý.

Không cache lâu đối với dữ liệu nhạy cảm hoặc dữ liệu thay đổi liên tục nếu gây stale data.

Sau mutation quan trọng:

```text
invalidate related query
```

---

# 38. Concurrency Handling

Frontend phải xử lý trường hợp backend trả:

```text
409 Conflict
```

Ví dụ:

- record đã được người khác cập nhật;
- workflow state đã thay đổi;
- score đã lock;
- inventory transaction conflict.

UI nên:

1. thông báo conflict;
2. refetch;
3. cho user xem trạng thái mới;
4. không tự ghi đè.

---

# 39. Unsaved Changes

Các form dài như:

- OCOP application;
- evaluation;
- evidence metadata;
- finance transaction;

nên cảnh báo khi user rời trang nếu có unsaved changes.

Không tự động discard dữ liệu mà không cảnh báo.

---

# 40. Security Rules

Frontend tuyệt đối không chứa:

- database password;
- MinIO secret key;
- private API secret;
- JWT signing secret;
- encryption key;
- production credential.

Không commit:

```text
.env.production
secrets
credentials
private keys
```

Client-side environment variable chỉ được chứa giá trị thực sự có thể public.

---

# 41. Logging

Frontend log:

- development diagnostics;
- correlation/request ID;
- unexpected client errors.

Không log:

- password;
- OTP;
- access token;
- refresh token;
- secret;
- sensitive personal data không cần thiết.

Production logging phải có mức phù hợp.

---

# 42. Performance

Ưu tiên:

- route lazy loading;
- code splitting;
- server-side pagination;
- query caching;
- debounce search;
- virtualized list khi thực sự cần;
- image optimization;
- tránh unnecessary re-render.

Không premature optimize.

Đo lường trước khi tối ưu phức tạp.

---

# 43. Reporting and Dashboard

Dashboard/report screen nên:

- gọi API aggregation;
- hiển thị loading;
- hiển thị empty;
- hỗ trợ filter;
- hiển thị thời điểm dữ liệu nếu cần.

Frontend không tự aggregate hàng chục nghìn records trên browser nếu backend có report endpoint.

---

# 44. Document Generation

Frontend chỉ khởi tạo yêu cầu:

```text
Generate PDF
Generate DOCX
Export report
```

Backend/worker chịu trách nhiệm tạo file.

Frontend:

```text
Request generation
 ↓
Show processing
 ↓
Poll/query job status if async
 ↓
Download result
```

Không triển khai toàn bộ document generation trong browser nếu hệ thống đã quy định backend worker.

---

# 45. Suggested Folder Structure

Nếu sử dụng React + TypeScript:

```text
src/
├── app/
│   ├── App.tsx
│   ├── providers/
│   └── config/
│
├── router/
│   ├── index.tsx
│   ├── guards/
│   └── routes.tsx
│
├── layouts/
│   ├── AuthLayout.tsx
│   └── AppLayout.tsx
│
├── components/
│   ├── ui/
│   ├── forms/
│   ├── tables/
│   ├── feedback/
│   └── navigation/
│
├── features/
│   ├── auth/
│   ├── dashboard/
│   ├── cooperative/
│   ├── members/
│   ├── production-units/
│   ├── farm-plots/
│   ├── crop-seasons/
│   ├── farming-logs/
│   ├── harvests/
│   ├── products/
│   ├── materials/
│   ├── warehouses/
│   ├── inventory/
│   ├── finance/
│   ├── ocop/
│   ├── evidence/
│   ├── workflow/
│   ├── reports/
│   ├── documents/
│   └── audit/
│
├── services/
│   ├── api/
│   ├── auth/
│   └── storage/
│
├── hooks/
│
├── stores/
│
├── types/
│
├── utils/
│
├── constants/
│
└── styles/
```

---

# 46. Feature Structure

Mỗi feature nên có cấu trúc tương tự:

```text
features/members/
├── api/
│   ├── queries.ts
│   ├── mutations.ts
│   └── types.ts
│
├── components/
│   ├── MemberTable.tsx
│   ├── MemberForm.tsx
│   └── MemberStatusBadge.tsx
│
├── pages/
│   ├── MemberListPage.tsx
│   ├── MemberCreatePage.tsx
│   ├── MemberDetailPage.tsx
│   └── MemberEditPage.tsx
│
├── schemas/
│   └── member.schema.ts
│
├── hooks/
│
├── utils/
│
└── index.ts
```

Không bắt buộc mọi feature phải có tất cả thư mục nếu feature nhỏ.

---

# 47. Feature Dependency Rules

Ví dụ:

```text
members
production
inventory
finance
ocop
```

có thể dùng shared UI.

Không nên:

```text
ocop → import internal implementation từ members
members → import internal implementation từ ocop
```

Nếu cần dữ liệu chéo module:

```text
Feature
 ↓
API/query contract
```

hoặc shared domain type phù hợp.

---

# 48. Cross-Module Flows

## 48.1. Production → OCOP

```text
Farm Plot
   ↓
Crop Season
   ↓
Farming Logs
   ↓
Harvest/Lot
   ↓
Product
   ↓
OCOP Application
   ↓
Evidence
```

Frontend chỉ điều phối navigation/reference.

Backend xác định tính hợp lệ của liên kết.

---

## 48.2. Inventory → Production

```text
Material
   ↓
Inventory
   ↓
Farming Log
```

Không để frontend tự đảm bảo tồn kho đủ.

Backend kiểm tra.

---

## 48.3. Finance → Distribution

```text
Transactions
   ↓
Settlement / Finalization
   ↓
Surplus
   ↓
Distribution
```

Frontend hiển thị kết quả backend và action được phép.

---

# 49. Navigation Architecture

Sidebar nên dựa trên permission-aware navigation.

Ví dụ:

```text
Dashboard

HTX
├── Thông tin HTX
└── Xã viên

Sản xuất
├── Đơn vị sản xuất
├── Vùng trồng
├── Mùa vụ
├── Nhật ký sản xuất
└── Thu hoạch / Lô

Kho
├── Vật tư
├── Kho
├── Nhập kho
├── Xuất kho
└── Kiểm kê

Tài chính
├── Giao dịch
├── Công nợ
└── Phân phối

OCOP
├── Hồ sơ
├── Minh chứng
├── Đánh giá
└── Kết quả

Báo cáo
Quản trị
```

Danh mục thực tế phải được đối chiếu với requirements và permission matrix.

---

# 50. Page Composition

Mỗi page nên theo mẫu:

```text
Page
├── PageHeader
│   ├── Title
│   ├── Description
│   └── Actions
│
├── Filters
│
├── Content
│
├── Loading / Empty / Error
│
└── Pagination
```

Chi tiết:

```text
Detail Page
├── Header
├── Status
├── Summary
├── Tabs
├── Main information
├── Related records
└── Activity / History
```

---

# 51. Forms with Business Workflow

Một form có workflow không nên chỉ có:

```text
Save
```

Mà có thể có:

```text
Save Draft
Submit
Return
Resubmit
Approve
Reject
```

Các action phải được backend xác định.

---

# 52. OCOP Application Detail Layout

Đề xuất:

```text
┌───────────────────────────────────────────┐
│ OCOP Application Header                   │
│ Product | Version | Status | Actions      │
├───────────────────────────────────────────┤
│ Tabs                                      │
│                                           │
│ Overview                                  │
│ Criteria                                  │
│ Evidence                                  │
│ Evaluation                                │
│ Workflow                                  │
│ Decision                                  │
│ History                                   │
└───────────────────────────────────────────┘
```

Không bắt buộc tất cả tab hiển thị cho mọi role.

---

# 53. Evaluation Screen

Đề xuất:

```text
Evaluation
├── Session information
├── Council level
├── Product information
├── Criteria tree
│   ├── Criterion
│   ├── Indicator
│   ├── Evidence
│   └── Score
├── Comments
├── Score summary
└── Actions
```

Nếu criteria thay đổi theo version, UI phải render theo tree/metadata API trả về.

---

# 54. Evidence Viewer

Evidence viewer nên hiển thị:

```text
File name
Version
Type
Size
Uploaded by
Uploaded at
Verification status
Checksum/reference if permitted
Download
Preview if supported
History
```

Không expose storage implementation details không cần thiết.

---

# 55. Audit UI

Audit chỉ hiển thị cho role được cấp quyền.

Có thể có:

```text
Timestamp
Actor
Action
Entity
Entity ID
Result
Request/Correlation ID
```

Không cho phép frontend chỉnh sửa audit record.

---

# 56. Frontend ↔ Traceability

Mỗi major frontend page/action nên map về:

```text
Screen
 ↓
FR
 ↓
UC
 ↓
API
 ↓
Permission
 ↓
Workflow
 ↓
Test Case
```

Ví dụ:

```text
MemberListPage
→ FR-MEMBER-001
→ UC-MEMBER-001
→ GET /members
→ MEMBER_VIEW
→ N/A
→ TC-MEMBER-001
```

OCOP:

```text
OCOPEvaluationPage
→ FR-OCOP-...
→ UC-OCOP-...
→ Evaluation API
→ OCOP_EVALUATE
→ EVALUATING
→ TC-OCOP-EVAL-...
```

---

# 57. Testing Architecture

Frontend testing tối thiểu:

```text
Unit
 ↓
Component
 ↓
Feature
 ↓
Integration
 ↓
E2E
```

Test các case quan trọng:

- authentication;
- permission;
- tenant boundary;
- form validation;
- API errors;
- workflow actions;
- OCOP criteria rendering;
- evidence upload;
- inventory mutation;
- finance mutation;
- responsive UI.

Chi tiết nằm ở `30_TESTING_STRATEGY.md` và `31_TEST_CASES.md`.

---

# 58. Environment Configuration

Frontend chỉ dùng public configuration cần thiết.

Ví dụ:

```text
VITE_API_BASE_URL
VITE_APP_NAME
VITE_APP_ENV
```

Không đưa secret vào Vite/client bundle.

Các environment:

```text
development
test
staging
production
```

không được trộn credential.

---

# 59. Build and Deployment Boundary

Frontend build:

```text
Source
 ↓
Type Check
 ↓
Lint
 ↓
Test
 ↓
Build
 ↓
Static Assets
 ↓
Nginx/CDN/Web Server
```

Backend được deploy độc lập.

Frontend không chứa server-side database access.

---

# 60. Observability

Frontend production nên hỗ trợ:

- request correlation;
- client error tracking nếu được triển khai;
- performance monitoring khi cần;
- API latency visibility ở mức phù hợp.

Không thu thập dữ liệu cá nhân không cần thiết.

---

# 61. Internationalization

Nếu project chỉ yêu cầu tiếng Việt:

- ưu tiên Vietnamese UI;
- format date/number/currency phù hợp;
- không hard-code format ở từng component.

Nếu cần đa ngôn ngữ trong tương lai:

```text
i18n
 ↓
translation keys
 ↓
localized UI
```

Không ghép chuỗi ngôn ngữ theo cách khó dịch.

---

# 62. Date / Time / Number Formatting

Frontend phải thống nhất:

- date;
- datetime;
- timezone;
- number;
- currency;
- percentage.

Không tự diễn giải timezone khác với backend.

Đặc biệt:

```text
TIMESTAMPTZ
```

phải được parse và display nhất quán.

---

# 63. Money Handling

Đối với tiền:

- hiển thị theo locale;
- không dùng binary floating-point cho nghiệp vụ tài chính;
- không tự làm tròn khác backend;
- không coi giá trị formatted string là giá trị API.

Ví dụ:

```text
API:
amount = 1500000.00

UI:
1.500.000 ₫
```

---

# 64. Delete / Deactivation UI

Không hiển thị "Delete" nếu backend thực hiện soft delete/deactivation.

Tên action phải phản ánh nghiệp vụ:

```text
Deactivate
Archive
Restore
Cancel
```

không dùng "Delete" một cách tùy tiện.

---

# 65. Historical Data UI

Đối với dữ liệu lịch sử:

- hiển thị version;
- thời điểm;
- actor;
- trạng thái;
- liên kết phiên bản.

Không cho phép sửa trực tiếp bản ghi lịch sử đã khóa.

Đặc biệt:

- evaluation;
- score;
- financial records;
- audit;
- evidence versions.

---

# 66. Policy Version Display

Đối với OCOP, UI nên hiển thị:

```text
Criteria Version
Workflow Version
Evaluation Session
Council Level
```

khi những thông tin này có ý nghĩa đối với lịch sử.

Điều này giúp user hiểu kết quả được đánh giá theo policy nào.

---

# 67. Backward Compatibility

Frontend phải hỗ trợ dữ liệu lịch sử theo API contract.

Không giả định rằng:

```text
current criteria = historical criteria
```

Không render historical record bằng current configuration nếu backend cung cấp version cụ thể.

---

# 68. AI Coding Agent Rules

AI Coding Agent khi code frontend phải:

1. đọc `00_AI_CODING_AGENT_INSTRUCTIONS.md`;
2. đọc `13_SYSTEM_ARCHITECTURE.md`;
3. đọc `21_BACKEND_PROJECT_STRUCTURE.md`;
4. đọc `22_BACKEND_CODING_STANDARDS.md`;
5. đọc `23_BACKEND_API_IMPLEMENTATION_PLAN.md`;
6. đọc tài liệu requirements/use case/workflow/traceability liên quan;
7. đọc tài liệu frontend từ `24` trở đi;
8. kiểm tra OpenAPI trước khi gọi API;
9. không invent endpoint;
10. không invent permission;
11. không hard-code OCOP policy;
12. không hard-code workflow;
13. không bypass authorization;
14. không truy cập DB trực tiếp;
15. không đưa secret vào frontend;
16. không tạo duplicate business logic;
17. không thay đổi architecture mà không có căn cứ.

---

# 69. AI Implementation Decision Rules

## AI được tự quyết

Có thể tự quyết:

- tên component nội bộ;
- cách chia file nhỏ;
- helper thuần UI;
- CSS organization;
- local component state;
- loading skeleton;
- minor UI composition;

miễn không phá contract.

## AI phải kiểm tra tài liệu

Phải kiểm tra:

- API;
- route;
- permission;
- workflow;
- entity;
- DTO;
- filter;
- pagination;
- OCOP criteria;
- council level.

## AI phải STOP và hỏi

Dừng và hỏi khi:

- API thiếu field quan trọng;
- API contract mâu thuẫn;
- permission chưa xác định;
- workflow không xác định;
- criteria version không xác định;
- UI yêu cầu business rule mới;
- cần thay đổi database;
- cần thay đổi backend API;
- có conflict giữa tài liệu;
- yêu cầu có thể làm mất historical integrity.

---

# 70. Forbidden Frontend Patterns

Không được:

```text
Component
 └── business calculation
```

nếu calculation là official backend rule.

Không được:

```text
Frontend
 └── direct database
```

Không được:

```text
UI button hidden
=
security
```

Không được:

```text
PATCH status
```

để bypass workflow.

Không được:

```text
hard-code OCOP scoring rules
```

Không được:

```text
hard-code province/central as immutable business logic
```

nếu backend/policy cho phép cấu hình.

Không được:

```text
copy API calls into dozens of components
```

Không được:

```text
put secret into client code
```

---

# 71. Definition of Ready

Frontend feature chỉ sẵn sàng implementation khi có:

- FR;
- UC;
- workflow nếu có;
- permission;
- API contract;
- request/response schema;
- error contract;
- route;
- screen requirement;
- relevant DB/domain understanding;
- traceability.

---

# 72. Definition of Done

Frontend feature hoàn thành khi:

- UI đúng screen specification;
- route hoạt động;
- API integration đúng contract;
- permission-aware;
- loading state;
- empty state;
- error state;
- validation;
- success feedback;
- responsive;
- accessibility cơ bản;
- test;
- lint/type check;
- không có secret;
- không duplicate business logic;
- traceability được cập nhật.

---

# 73. Recommended Implementation Order

```text
Phase F0
Frontend bootstrap
        ↓
Phase F1
Design system + App shell
        ↓
Phase F2
Authentication + authorization UI
        ↓
Phase F3
Cooperative + Members
        ↓
Phase F4
Agriculture
        ↓
Phase F5
Products + Inventory
        ↓
Phase F6
Finance
        ↓
Phase F7
OCOP + Evidence
        ↓
Phase F8
Workflow + Evaluation
        ↓
Phase F9
Reports + Documents
        ↓
Phase F10
Testing + Hardening
```

---

# 74. Frontend Milestone Gates

## Gate F0

- project builds;
- routing works;
- API client works;
- environment works.

## Gate F1

- layout;
- design system;
- error/loading;
- navigation.

## Gate F2

- login;
- session;
- permission;
- logout.

## Gate F3

- cooperative;
- members.

## Gate F4

- production modules.

## Gate F5

- inventory/product.

## Gate F6

- finance.

## Gate F7

- OCOP application;
- criteria;
- evidence.

## Gate F8

- evaluation;
- workflow;
- decisions.

## Gate F9

- reporting;
- document export.

## Gate F10

- testing;
- security;
- performance;
- deployment readiness.

---

# 75. Architecture Acceptance Criteria

Kiến trúc frontend được xem là đạt khi:

1. Có feature boundaries rõ ràng.
2. Không truy cập database trực tiếp.
3. API client tập trung.
4. Server state được quản lý nhất quán.
5. Permission-aware UI được triển khai.
6. Backend vẫn là authorization source of truth.
7. Workflow không bị bypass.
8. OCOP policy không bị hard-code.
9. Historical data được tôn trọng.
10. Evidence/file access đi qua security boundary.
11. Secret không nằm trong client.
12. Components có khả năng tái sử dụng.
13. Pages có loading/empty/error state.
14. API errors được xử lý.
15. Frontend có test strategy.
16. Có traceability với requirements/use cases/API.
17. Architecture không tạo coupling không cần thiết giữa modules.
18. Có khả năng mở rộng mà không cần rewrite toàn bộ frontend.

---

# 76. Reconciliation With Existing Documents

Frontend implementation phải đối chiếu:

```text
00
↓
08 Functional Requirements
↓
09 Use Cases
↓
10 Domain Model
↓
13 System Architecture
↓
15 Authorization Matrix
↓
16 Workflow
↓
17 OpenAPI
↓
19 Traceability
↓
21 Backend Structure
↓
22 Backend Coding Standards
↓
23 Backend API Implementation Plan
↓
24 Frontend Architecture
```

Nếu phát hiện conflict:

```text
Do not silently choose.
Record conflict.
Identify source of truth.
Resolve before implementation if material.
```

---

# 77. Known Gaps / To Verify

Các điểm sau cần được xác định ở tài liệu tiếp theo hoặc trong quá trình bootstrap:

- React hay Vue là lựa chọn cuối cùng;
- UI component library;
- authentication/session mechanism cụ thể;
- API base URL convention;
- OpenAPI client generation có sử dụng hay không;
- exact frontend route list;
- exact screen list;
- detailed dashboard widgets;
- detailed OCOP screens;
- exact responsive breakpoints;
- exact accessibility target;
- client error monitoring solution;
- i18n có cần trong scope hay không.

Không được tự biến các GAP này thành business requirement.

---

# 78. Relationship With Document 25

`25_FRONTEND_CODING_STANDARDS.md` sẽ quy định chi tiết:

- naming;
- TypeScript;
- React/Vue coding style;
- component conventions;
- hooks/composables;
- query/mutation;
- form;
- validation;
- state;
- API client;
- error handling;
- testing;
- import rules;
- dependency rules;
- lint/format;
- code review;
- AI coding rules.

---

# 79. Relationship With Document 26

`26_FRONTEND_IMPLEMENTATION_PLAN.md` sẽ chuyển kiến trúc này thành kế hoạch code:

```text
Feature
→ Screens
→ Components
→ API
→ Permission
→ Workflow
→ Test
→ Definition of Done
```

Mỗi feature sẽ có thứ tự implementation và dependency rõ ràng.

---

# 80. Final Frontend Contract

Frontend của hệ thống phải tuân thủ nguyên tắc:

```text
UI
 ↓
Feature
 ↓
API Client
 ↓
Backend API
 ↓
Business Logic
 ↓
Database / Storage
```

Không được:

```text
UI
 ↓
Business Logic độc lập
 ↓
Database
```

OCOP phải:

```text
Policy Version
 ↓
Criteria
 ↓
Application
 ↓
Evidence
 ↓
Evaluation
 ↓
Workflow
 ↓
Decision
```

và frontend phải render theo dữ liệu/configuration mà backend cung cấp.

Nguyên tắc cuối cùng:

> Frontend là lớp trình bày và tương tác của hệ thống; backend là nơi thực thi và bảo vệ nghiệp vụ chính thức.

AI Coding Agent phải ưu tiên:

```text
Correctness
> Contract Compliance
> Security
> Historical Integrity
> Maintainability
> Consistency
> Performance
> Convenience
```

---

# 81. Document End

**Next recommended document:** `25_FRONTEND_CODING_STANDARDS.md`
