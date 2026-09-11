# 25_FRONTEND_CODING_STANDARDS.md

# Frontend Coding Standards
## Hệ thống quản lý hoạt động Hợp tác xã nông nghiệp và số hóa hồ sơ đánh giá, phân hạng OCOP

---

## 1. Document Information

| Field | Value |
|---|---|
| Document ID | 25 |
| Document Name | Frontend Coding Standards |
| Project | Xây dựng Hệ thống quản lý hoạt động Hợp tác xã nông nghiệp và số hóa hồ sơ đánh giá, phân hạng OCOP |
| Layer | Frontend |
| Status | Baseline / Mandatory |
| Audience | AI Coding Agent, Frontend Developer, Reviewer, Tester |
| Depends On | 00, 13, 17, 21, 22, 23, 24 |
| Next Document | 26_FRONTEND_IMPLEMENTATION_PLAN.md |

---

# 2. Purpose

Tài liệu này định nghĩa các quy chuẩn bắt buộc khi viết frontend.

Mục tiêu:

- code nhất quán;
- dễ review;
- dễ test;
- dễ bảo trì;
- giảm duplicate;
- tránh business logic sai vị trí;
- bảo vệ API/security contract;
- giúp AI Coding Agent tạo code đồng nhất;
- đảm bảo frontend phù hợp với backend architecture.

Quy tắc trong tài liệu này được xem là **coding contract**.

Nếu một yêu cầu mới mâu thuẫn với contract hiện tại, AI Coding Agent phải phân tích impact trước khi thay đổi.

---

# 3. Technology Baseline

Nếu project bootstrap chưa có quyết định khác:

```text
React
TypeScript
Vite
React Router
TanStack Query
ESLint
Prettier
```

Có thể dùng:

```text
Zod
Axios hoặc fetch wrapper
```

UI library phải được chọn thống nhất trong project.

Sau khi project đã chọn framework/library:

> Không tự ý đổi framework, router, state library hoặc UI library.

---

# 4. General Principles

Thứ tự ưu tiên:

```text
Correctness
> Security
> Contract Compliance
> Maintainability
> Consistency
> Testability
> Performance
> Convenience
```

Code phải:

- rõ ràng;
- ngắn vừa đủ;
- tránh abstraction quá sớm;
- tránh magic number;
- tránh duplicate;
- dễ test;
- có boundary rõ.

Không code theo kiểu:

> "miễn chạy được".

---

# 5. Naming Convention

## 5.1. Components

PascalCase:

```text
MemberTable.tsx
MemberForm.tsx
OCOPEvaluationPage.tsx
StatusBadge.tsx
```

Không:

```text
membertable.tsx
member_form.tsx
```

---

## 5.2. Hooks

camelCase với prefix `use`:

```text
useMembersQuery
useCreateMemberMutation
useCurrentUser
usePermissions
```

---

## 5.3. Functions

camelCase:

```text
formatCurrency()
mapMemberResponse()
buildQueryParams()
```

Tên phải thể hiện hành động.

---

## 5.4. Variables

camelCase:

```typescript
const memberId = ...
const isSubmitting = ...
const currentUser = ...
```

Boolean nên có prefix:

```text
is
has
can
should
```

Ví dụ:

```typescript
isLoading
hasPermission
canApprove
shouldRefetch
```

---

## 5.5. Constants

UPPER_SNAKE_CASE cho constants thực sự dùng chung:

```typescript
const DEFAULT_PAGE_SIZE = 20;
const MAX_UPLOAD_SIZE = ...;
```

Không biến mọi string thành constant một cách máy móc.

---

## 5.6. Types

PascalCase:

```typescript
type Member = ...
interface MemberListParams = ...
```

Không đặt:

```text
IMember
TMember
```

trừ khi project có convention riêng.

---

# 6. File Naming

Khuyến nghị:

```text
MemberListPage.tsx
MemberDetailPage.tsx
MemberForm.tsx
member.schema.ts
member.types.ts
member.api.ts
member.queries.ts
member.mutations.ts
```

Tên file phải nhất quán.

Không trộn:

```text
memberAPI.ts
MemberApi.ts
member-api.ts
```

trong cùng project nếu chưa có convention.

---

# 7. Import Rules

Ưu tiên:

```text
external dependencies
↓
shared/internal aliases
↓
feature imports
↓
relative imports
```

Không tạo import vòng:

```text
A → B → C → A
```

Không import internal implementation của feature khác nếu chỉ cần public contract.

Mỗi feature nên có:

```text
index.ts
```

nếu project cần public exports.

---

# 8. Feature Boundary

Ví dụ:

```text
features/members/
```

được phép chứa:

- member API;
- member types;
- member forms;
- member pages;
- member components;
- member hooks.

Không nên để:

```text
features/members/
```

chứa logic OCOP scoring.

Nếu module cần dữ liệu từ OCOP:

```text
API contract
```

hoặc shared type phù hợp.

---

# 9. Component Responsibilities

Component nên tập trung vào:

- render;
- interaction;
- local UI state;
- gọi callback;
- hiển thị validation.

Không nên chứa:

- database logic;
- business transaction;
- authorization enforcement;
- workflow transition implementation;
- OCOP official scoring calculation.

Ví dụ không nên:

```typescript
function OcopScoreForm() {
  const total = scores.reduce(...);
  const star = total >= 90 ? 5 : ...;
}
```

nếu đây là official scoring rule.

Thay vào đó:

```text
API
→ official score
→ UI display
```

Frontend chỉ có thể tính preview nếu requirement xác định rõ và phải gọi đó là preview.

---

# 10. Page Responsibilities

Page chịu trách nhiệm:

- route-level composition;
- load data;
- compose feature components;
- page-level actions;
- navigation;
- page state.

Page không nên chứa hàng trăm dòng business logic.

Nếu page quá lớn:

```text
Page
 ↓
Feature components
 ↓
Hooks / queries / mutations
```

---

# 11. Presentational vs Container

Có thể tách:

```text
Container
→ data / mutation / permissions

Presentational
→ rendering
```

Ví dụ:

```text
MemberListPage
    ↓
MemberListContainer
    ↓
MemberTable
```

Không bắt buộc tách nếu component nhỏ.

Mục tiêu là giảm coupling, không phải tăng số file.

---

# 12. TypeScript Rules

Không dùng:

```typescript
any
```

trừ trường hợp có lý do kỹ thuật rõ ràng và được giới hạn.

Ưu tiên:

```typescript
unknown
```

khi chưa biết type.

Không disable toàn bộ TypeScript checking để giải quyết lỗi.

Không sử dụng:

```typescript
// @ts-ignore
```

trừ trường hợp đặc biệt có comment giải thích.

---

# 13. API Types

API request/response phải có type.

Ví dụ:

```typescript
interface Member {
  id: string;
  code: string;
  fullName: string;
  status: MemberStatus;
}
```

Không:

```typescript
const response: any = await api.get(...);
```

Nếu có OpenAPI code generation, ưu tiên dùng generated types theo project convention.

---

# 14. API Client

Không gọi API trực tiếp trong component bằng URL hard-code.

Không:

```typescript
fetch("/api/members")
```

rải rác ở nhiều component.

Nên:

```text
features/members/api/
```

hoặc service layer thống nhất.

Ví dụ:

```typescript
export async function getMembers(
  params: MemberListParams
): Promise<MemberListResponse> {
  return apiClient.get(...);
}
```

---

# 15. Query Rules

Server state nên dùng query abstraction.

Ví dụ:

```typescript
useMembersQuery(params)
```

Query key phải ổn định:

```typescript
["members", params]
```

Không tạo query key không nhất quán giữa các component.

---

# 16. Mutation Rules

Mutation phải có:

- input;
- pending state;
- success handling;
- error handling;
- cache invalidation phù hợp.

Ví dụ:

```text
useCreateMemberMutation
```

Sau khi thành công:

```text
invalidate members list
```

Nếu cần redirect:

```text
success
→ invalidate
→ navigate
```

Không redirect trước khi backend xác nhận thành công.

---

# 17. Cache Invalidation

Mutation phải xác định dữ liệu bị ảnh hưởng.

Ví dụ:

```text
Create Member
→ invalidate member list
→ optionally invalidate member statistics
```

Không invalidate toàn bộ application cache nếu không cần.

Không giữ stale server data chỉ để tránh request.

---

# 18. Forms

Form phải có:

```text
default values
validation
submission
server error
success state
dirty state
```

Schema validation có thể dùng Zod hoặc thư viện thống nhất.

Ví dụ:

```typescript
const memberSchema = z.object({
  fullName: z.string().min(1),
});
```

---

# 19. Validation Layer

Có ba lớp:

```text
UI validation
↓
Frontend schema validation
↓
Backend validation
```

Frontend validation không thay thế backend validation.

Business rule quan trọng phải được backend enforce.

---

# 20. Error Mapping

API validation errors phải được map về field.

Ví dụ:

```json
{
  "errors": {
    "full_name": [
      "The full name field is required."
    ]
  }
}
```

UI:

```text
Họ và tên
[________________]
Họ và tên là bắt buộc.
```

Không chỉ hiển thị:

```text
Request failed
```

nếu backend cung cấp field errors.

---

# 21. API Error Standardization

Nên có centralized error normalization:

```text
API Error
 ↓
normalizeApiError()
 ↓
Application Error Model
 ↓
UI
```

Không để mỗi component tự parse Axios/fetch error theo cách khác nhau.

---

# 22. Authentication Rules

Authentication state phải tập trung.

Không:

```text
localStorage.getItem("token")
```

rải rác khắp application.

Có thể có:

```text
auth service
auth store/context
API interceptor/client
```

theo security contract của backend.

Không lưu password.

Không log token.

Không expose token trong UI.

---

# 23. Authorization UI

Có thể dùng:

```typescript
can("member.create")
```

hoặc equivalent permission abstraction.

Không viết:

```typescript
if (user.role === "admin") ...
```

rải rác nếu backend authorization model dựa trên permission.

Role → permission phải được quản lý theo authorization contract.

---

# 24. Authorization Is Not Security

Ẩn button:

```text
Approve button hidden
```

không có nghĩa:

```text
User cannot approve
```

Backend vẫn phải kiểm tra.

Frontend chỉ cung cấp:

```text
permission-aware UX
```

---

# 25. Route Guard

Route guard phải:

- xác định authentication;
- xác định permission nếu cần;
- xử lý loading session;
- redirect hợp lý.

Không tạo vòng lặp:

```text
/login → /dashboard → /login → ...
```

---

# 26. Workflow Actions

Không tạo UI mutation generic:

```typescript
updateApplication({
  status: "APPROVED"
});
```

Thay vào đó:

```typescript
approveApplication(id)
```

hoặc API action tương ứng.

Các action:

```text
submit
return
resubmit
approve
reject
consolidate
lock
```

phải map với API.

---

# 27. Workflow UI State

Action button phải phụ thuộc vào:

```text
current status
+
permission
+
backend allowed action
```

Nếu API trả:

```json
{
  "allowed_actions": [
    "RETURN",
    "START_REVIEW"
  ]
}
```

Frontend nên dùng dữ liệu này.

Không hard-code workflow nếu backend cung cấp dynamic actions.

---

# 28. OCOP Coding Rules

OCOP frontend phải tuân thủ:

```text
Criteria Version
↓
Criteria
↓
Indicator
↓
Evidence
↓
Evaluation
↓
Score
↓
Decision
```

Không hard-code:

- tổng số criteria;
- tổng điểm;
- star threshold;
- council level;
- evaluation authority;
- workflow state;
- legal requirement.

Các policy có thể thay đổi phải lấy từ API/configuration.

---

# 29. Council Level

Baseline hiện tại:

```text
PROVINCE
CENTRAL
```

Nhưng không được coi đây là business logic bất biến.

Nếu API trả council level:

```typescript
councilLevel: string;
```

hoặc generated enum theo OpenAPI.

Không tự thêm:

```text
DISTRICT
COMMUNE
```

như một evaluation council chỉ vì suy đoán nghiệp vụ.

---

# 30. OCOP Score

Frontend chỉ nên hiển thị:

```text
score
max_score
percentage
result
```

theo API.

Nếu có preview calculation:

```text
Preview only
```

phải tách biệt với:

```text
Official Evaluation Result
```

Official result do backend quyết định.

---

# 31. Evidence Upload

Upload component phải:

- validate extension/type;
- validate size;
- hiển thị progress nếu API hỗ trợ;
- xử lý cancel nếu hỗ trợ;
- hiển thị upload error;
- refresh evidence list sau success.

Không tự upload trực tiếp tới storage bằng credential bí mật.

Nếu backend sử dụng signed URL:

```text
API
→ temporary upload URL
→ browser upload
→ finalize API
```

phải tuân thủ chính xác API contract.

---

# 32. File Preview

Chỉ preview các loại được hỗ trợ.

Không cố render mọi file trong browser.

Nếu preview không hỗ trợ:

```text
File type cannot be previewed.
Download instead.
```

---

# 33. Tables

Data table phải:

- có stable row key;
- hỗ trợ server pagination khi cần;
- hiển thị loading;
- empty;
- error;
- action permission-aware.

Không dùng array index làm key cho record nghiệp vụ:

```tsx
key={index}
```

nếu record có ID.

Ưu tiên:

```tsx
key={member.id}
```

---

# 34. Pagination

Pagination phải phản ánh API.

Ví dụ:

```text
page
page_size
total
```

Không giả định API luôn trả toàn bộ dataset.

Default page size nên nằm ở configuration.

---

# 35. Search Debounce

Search text field có thể debounce.

Ví dụ:

```text
300–500ms
```

Nhưng không áp dụng debounce cho mọi input một cách máy móc.

Search phải hủy/ignore request cũ khi cần để tránh stale result.

---

# 36. Sorting

Sorting phải map với API sort contract.

Ví dụ:

```text
sort=full_name
sort=-created_at
```

Không gửi field tùy ý nếu backend không hỗ trợ.

---

# 37. Filters

Filter state phải tách:

```text
draft filter
applied filter
```

nếu UX yêu cầu nút Apply.

Filter URL state có thể được sử dụng cho các màn hình list cần shareable/deep-link.

---

# 38. Detail Pages

Detail page nên có:

```text
Header
Status
Summary
Tabs/Sections
Related data
History
Actions
```

Không tải mọi related data cùng lúc nếu không cần.

Lazy load tab có thể được dùng khi dataset lớn.

---

# 39. Delete / Deactivate

Nếu backend dùng soft delete/deactivation:

Không đặt:

```text
Delete
```

mà nên dùng:

```text
Deactivate
Archive
Cancel
Restore
```

theo nghiệp vụ.

Action destructive phải có confirmation.

---

# 40. Historical Records

Không cho user sửa trực tiếp record đã:

```text
locked
finalized
approved
historical
```

nếu API không cho phép.

Frontend phải phản ánh read-only state.

---

# 41. Financial UI Rules

Frontend phải:

- format tiền thống nhất;
- không tự làm tròn official value;
- không tự tính official settlement;
- không tự xác nhận transaction;
- xử lý conflict 409;
- hiển thị transaction status.

Input amount phải dùng numeric model phù hợp, không gửi formatted string nếu API yêu cầu number/decimal.

---

# 42. Inventory UI Rules

Không tự cập nhật:

```text
stock quantity
```

sau khi user nhập phiếu.

Flow:

```text
Create Receipt
↓
Backend transaction
↓
Success
↓
Invalidate stock queries
↓
Display server stock
```

Không cộng tồn kho hai lần ở frontend.

---

# 43. Date and Time

Không dùng:

```text
new Date().toISOString()
```

một cách tùy tiện cho mọi field.

Phải biết API field là:

- date;
- datetime;
- timestamptz;
- local date.

Format display tập trung qua utility.

---

# 44. Currency Formatting

Dùng utility chung:

```typescript
formatCurrency(amount)
```

Không viết:

```typescript
amount.toLocaleString()
```

rải rác nếu cần quy tắc thống nhất.

---

# 45. Status Display

Status nên dùng centralized mapping:

```text
status
→ label
→ semantic variant
```

Ví dụ:

```typescript
getStatusMeta(status)
```

Không mỗi page tự đặt label khác nhau cho cùng status.

---

# 46. Loading UX

Dùng:

```text
Skeleton
Spinner
Button pending state
Progress
```

phù hợp với context.

Không disable toàn bộ application chỉ vì một mutation nhỏ.

---

# 47. Empty State

Empty state phải phân biệt:

```text
No data yet
No search result
No permission
```

Ví dụ:

```text
Chưa có xã viên.
```

khác với:

```text
Không tìm thấy xã viên phù hợp.
```

---

# 48. Confirmation Dialog

Không dùng confirmation cho mọi action nhỏ.

Nên dùng cho:

- submit;
- approve;
- reject;
- return;
- lock;
- deactivate;
- finalize;
- destructive action.

Dialog phải nêu:

```text
What will happen?
Can it be reversed?
```

nếu phù hợp.

---

# 49. Accessibility

Bắt buộc:

- label;
- keyboard navigation;
- focus state;
- semantic buttons;
- accessible dialog;
- error association;
- alt text cho meaningful images.

Không dùng:

```html
<div onClick={...}>
```

thay button nếu không có lý do.

---

# 50. Responsive

Breakpoints phải tập trung.

Không hard-code hàng chục breakpoint khác nhau trong từng component.

Table trên mobile có thể:

- horizontal scroll;
- card layout;
- hide secondary columns;
- detail drawer;

tùy screen specification.

---

# 51. Styling

Chọn một styling strategy thống nhất.

Không trộn tùy tiện:

```text
Tailwind
CSS Modules
styled-components
inline styles
```

trừ trường hợp có lý do và convention.

Không tạo global CSS side effect không kiểm soát.

---

# 52. UI Design Consistency

Các component cùng loại phải có cùng:

- spacing;
- typography;
- border;
- status;
- interaction;
- error presentation.

Ví dụ mọi form submit button phải có pending state thống nhất.

---

# 53. Reusable Components

Chỉ đưa component vào shared khi:

- dùng ở nhiều feature;
- API/component contract ổn định;
- abstraction rõ.

Không tạo:

```text
SuperGenericDataManager
```

chỉ để tránh vài dòng code.

---

# 54. Utility Functions

Utility phải:

- pure nếu có thể;
- không phụ thuộc component;
- có test nếu logic đủ phức tạp.

Ví dụ:

```text
formatDate
formatCurrency
buildQueryParams
parseApiError
```

Không đặt business rule quan trọng vào generic utils.

---

# 55. Constants

Không hard-code magic values:

```typescript
if (status === "APPROVED")
```

nếu project đã có status constants/types.

Nhưng không tạo constant thừa chỉ để thay một string duy nhất.

---

# 56. Environment Variables

Chỉ public configuration:

```text
VITE_API_BASE_URL
VITE_APP_NAME
VITE_APP_ENV
```

Không:

```text
VITE_DB_PASSWORD
VITE_MINIO_SECRET
VITE_JWT_SECRET
```

Bất kỳ biến `VITE_*` nào cũng có khả năng xuất hiện trong client bundle.

---

# 57. Dependency Rules

Trước khi thêm dependency:

1. kiểm tra dependency hiện có;
2. kiểm tra project architecture;
3. xác định necessity;
4. đánh giá bundle size;
5. đánh giá security;
6. tránh duplicate library.

Không thêm package chỉ vì một helper nhỏ nếu project đã có cách giải quyết.

---

# 58. Performance Rules

Ưu tiên:

```text
Correct architecture
→ Measure
→ Optimize
```

Các kỹ thuật được phép khi có lý do:

- lazy route;
- memoization;
- virtualization;
- debounce;
- query caching;
- image optimization.

Không lạm dụng `useMemo`, `useCallback`.

---

# 59. React-Specific Rules

Nếu dùng React:

- component function;
- hooks theo rules of hooks;
- không gọi hooks conditionally;
- dependency arrays chính xác;
- tránh effect không cần thiết;
- ưu tiên derived state thay vì duplicate state;
- không dùng global state cho mọi thứ.

Không dùng `useEffect` để thay thế query/mutation library nếu không cần.

---

# 60. React Query Rules

Nếu dùng TanStack Query:

```text
Query
→ server state

Mutation
→ server-side write
```

Không dùng query để thực hiện side effect.

Mutation phải xử lý:

```text
onSuccess
onError
onSettled
```

khi cần.

---

# 61. Router Rules

Route phải có:

- clear path;
- predictable params;
- guard;
- lazy loading nếu phù hợp.

Không đưa object nghiệp vụ lớn vào URL.

Chỉ đưa identifier/filter state cần thiết.

---

# 62. URL State

Có thể lưu trong URL:

- search;
- filter;
- page;
- sort;
- selected tab.

Điều này hữu ích cho:

- refresh;
- bookmark;
- share link.

Không lưu dữ liệu nhạy cảm vào query string.

---

# 63. Sensitive Data

Không đưa vào URL:

- password;
- OTP;
- access token;
- refresh token;
- sensitive personal data không cần thiết.

---

# 64. Logging Rules

Development:

```text
console.debug
console.info
```

có thể dùng khi cần.

Production:

- không log sensitive data;
- không log auth token;
- không log password;
- không log raw API response nếu chứa PII.

Nếu có logger, dùng centralized logger.

---

# 65. Error Boundary

Application nên có global error boundary.

Mục tiêu:

```text
Unexpected component error
→ friendly fallback
→ error tracking/logging
```

Không expose stack trace cho end user.

---

# 66. Network Retry

Không retry tất cả request.

Retry phù hợp với:

- transient GET;
- network failure;
- 503.

Cẩn thận với mutation.

Không tự retry mutation có thể gây duplicate transaction nếu API chưa idempotent.

---

# 67. Idempotency

Nếu backend yêu cầu idempotency key:

Frontend phải tạo/gửi đúng contract.

Đặc biệt với:

- financial transaction;
- inventory transaction;
- document generation;
- workflow action.

Không tự tạo idempotency mechanism khác backend.

---

# 68. Concurrency

Khi API trả:

```text
409 Conflict
```

Frontend phải:

```text
notify
→ refetch
→ show current state
```

Không tự overwrite.

---

# 69. Accessibility of Forms

Mỗi input:

```text
label
input
error
hint
```

phải liên kết semantic.

Ví dụ:

```text
<label htmlFor="fullName">
```

và:

```text
<input id="fullName" />
```

---

# 70. Testing Rules

Mỗi feature quan trọng phải có test.

Ưu tiên test:

- user-visible behavior;
- form;
- permissions;
- workflow;
- API error;
- critical business screens.

Không viết test phụ thuộc implementation detail nếu có thể test behavior.

---

# 71. Unit Test

Test:

- pure functions;
- formatters;
- parsers;
- mappers;
- validation schemas.

Ví dụ:

```text
formatCurrency
formatDate
buildQueryParams
mapApiError
```

---

# 72. Component Test

Test:

```text
render
interaction
validation
loading
error
permission-aware UI
```

Không nhất thiết test mọi CSS property.

---

# 73. E2E Test

Critical flows:

```text
Login
→ Dashboard

Create Member
→ Save
→ List

Create OCOP Application
→ Upload Evidence
→ Submit
→ Evaluation
```

Chi tiết ở document 30/31.

---

# 74. Git Rules

Commit nên nhỏ và có mục đích.

Ví dụ:

```text
feat(members): add member list
feat(ocop): add evidence upload
fix(auth): handle expired session
test(members): add member form tests
```

Không commit:

```text
password
.env
secret
debug dumps
```

---

# 75. Pull Request Rules

PR nên mô tả:

```text
What changed
Why
Related FR/UC
API changes
Test result
Known limitation
```

Nếu thay đổi contract:

```text
Backend impact
Database impact
Frontend impact
Traceability impact
```

phải được nêu rõ.

---

# 76. AI Coding Agent Mandatory Workflow

AI phải thực hiện:

```text
1. Read task
2. Identify FR/UC
3. Read screen requirement
4. Read API contract
5. Read permission/workflow
6. Check traceability
7. Inspect existing code
8. Plan change
9. Implement
10. Test
11. Type check
12. Lint
13. Review diff
14. Report
```

Không code ngay sau khi đọc một câu prompt ngắn nếu task ảnh hưởng nhiều module.

---

# 77. AI Must Not Invent

Không tự invent:

- API endpoint;
- field;
- permission;
- role;
- workflow state;
- OCOP criterion;
- score threshold;
- council level;
- database field;
- business rule.

Nếu cần một thành phần chưa có:

```text
Mark GAP
→ explain
→ ask/resolve
```

---

# 78. AI Change Impact

Mọi thay đổi frontend lớn phải kiểm tra:

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
Backend
↓
DB
↓
Tests
```

Không chỉ sửa frontend nếu contract bị ảnh hưởng.

---

# 79. No Fake Implementation

Không được tạo:

```text
TODO
return mockData
setTimeout(() => ...)
```

rồi coi feature hoàn thành.

Mock chỉ được dùng trong:

- test;
- story/demo;
- explicitly temporary development environment.

Phải đánh dấu rõ nếu mock.

---

# 80. No Duplicate Business Logic

Ví dụ không được có:

```text
Backend:
calculateOfficialScore()

Frontend:
calculateOfficialScore()
```

trừ khi frontend function chỉ là preview và được đặt tên rõ:

```text
calculateScorePreview()
```

Official result vẫn backend.

---

# 81. Data Fetching Anti-Patterns

Không:

```text
component A fetch
component B fetch same data
component C fetch same data
```

nếu query cache có thể dùng.

Không:

```text
fetch all members
filter locally
```

khi API hỗ trợ server filtering/pagination.

---

# 82. Form Anti-Patterns

Không:

- submit khi đang submitting;
- double-click tạo hai transaction;
- bỏ qua server error;
- reset form trước khi success nếu làm mất dữ liệu;
- tự đổi status sau submit.

---

# 83. Workflow Anti-Patterns

Không:

```text
status === SUBMITTED
→ frontend changes to APPROVED
```

Không:

```text
disable button
→ assume backend cannot execute
```

Không:

```text
URL /approve
```

nếu API contract không có endpoint đó.

---

# 84. File Upload Anti-Patterns

Không:

- upload secret credential;
- publicize private evidence;
- trust file extension alone;
- assume upload success trước server response;
- expose storage internal path.

---

# 85. Finance Anti-Patterns

Không:

- calculate official balance solely in browser;
- use floating-point arithmetic for official money logic;
- submit formatted currency string unless API expects it;
- duplicate a transaction because of retry.

---

# 86. Inventory Anti-Patterns

Không:

```text
currentStock += quantity
```

ở client rồi coi là official inventory.

Client chỉ:

```text
submit transaction
→ refresh stock
```

---

# 87. OCOP Anti-Patterns

Không:

```text
TOTAL_SCORE = 100
FIVE_STAR = 90
```

nếu policy chưa được backend/configuration cung cấp.

Không:

```text
criteria.length === fixedNumber
```

để quyết định validity.

Không giả định mọi application luôn đi cùng một evaluation path.

---

# 88. Code Review Checklist

Reviewer kiểm tra:

### Architecture

- [ ] Feature boundary đúng
- [ ] Không circular dependency
- [ ] Không business logic sai layer

### API

- [ ] Endpoint đúng contract
- [ ] Request type đúng
- [ ] Response type đúng
- [ ] Error mapping đúng

### Security

- [ ] Không secret
- [ ] Permission-aware
- [ ] Không bypass backend

### UX

- [ ] Loading
- [ ] Empty
- [ ] Error
- [ ] Success
- [ ] Confirmation khi cần
- [ ] Responsive

### Data

- [ ] Pagination đúng
- [ ] Cache invalidation đúng
- [ ] No stale overwrite
- [ ] Historical state được bảo vệ

### Tests

- [ ] Unit/component test phù hợp
- [ ] Critical flow test
- [ ] Type check
- [ ] Lint

---

# 89. Definition of Ready

Task frontend phải có tối thiểu:

```text
Feature
FR/UC
Screen requirement
API
Permission
Workflow if applicable
Acceptance criteria
```

Nếu thiếu:

```text
→ inspect existing docs
→ identify gap
→ ask if material
```

---

# 90. Definition of Done

Feature được coi là Done khi:

- [ ] Code đúng architecture
- [ ] TypeScript pass
- [ ] Lint pass
- [ ] API contract đúng
- [ ] Permission-aware
- [ ] Loading state
- [ ] Empty state
- [ ] Error state
- [ ] Validation
- [ ] Success feedback
- [ ] Responsive
- [ ] Accessibility cơ bản
- [ ] Tests pass
- [ ] Không secret
- [ ] Không mock ngoài scope
- [ ] Traceability được cập nhật nếu cần

---

# 91. Performance Checklist

- [ ] Không fetch dư thừa
- [ ] Server pagination cho dataset lớn
- [ ] Query cache hợp lý
- [ ] Search debounce khi cần
- [ ] Lazy loading cho route lớn
- [ ] Không render list khổng lồ không cần thiết
- [ ] Không memoization vô lý
- [ ] Không tải file/image quá lớn không cần thiết

---

# 92. Security Checklist

- [ ] Authentication flow đúng
- [ ] Backend là authorization source of truth
- [ ] Không secret trong bundle
- [ ] Không token trong logs
- [ ] Private files qua authorized flow
- [ ] Không sensitive data trong URL
- [ ] XSS-safe rendering
- [ ] Không dùng dangerouslySetInnerHTML nếu không cần
- [ ] Dependency được kiểm soát

---

# 93. Accessibility Checklist

- [ ] Keyboard navigation
- [ ] Labels
- [ ] Focus
- [ ] Error association
- [ ] Semantic buttons
- [ ] Dialog accessibility
- [ ] Alt text
- [ ] Color không phải tín hiệu duy nhất

---

# 94. Maintainability Checklist

- [ ] Tên rõ ràng
- [ ] Component vừa phải
- [ ] Hook đúng trách nhiệm
- [ ] API calls tập trung
- [ ] Shared component hợp lý
- [ ] Không copy/paste nghiệp vụ
- [ ] Không abstraction quá mức
- [ ] Không dependency thừa

---

# 95. Final Coding Contract

AI Coding Agent phải tuân thủ:

```text
READ
→ UNDERSTAND
→ TRACE
→ PLAN
→ IMPLEMENT
→ TEST
→ REVIEW
→ REPORT
```

Frontend phải:

```text
Presentation
+
Interaction
+
Client UX Validation
+
API Integration
+
Permission-aware UX
```

Frontend không được trở thành:

```text
Business Rule Authority
+
Authorization Authority
+
Database Layer
```

OCOP phải:

```text
Versioned Policy
→ Dynamic Criteria
→ Evidence
→ Evaluation
→ Backend Official Score
→ Workflow
→ Decision
```

Các module:

```text
Auth
Cooperative
Members
Agriculture
Products
Inventory
Finance
OCOP
Evidence
Workflow
Reports
Documents
Audit
```

phải giữ boundary rõ ràng.

---

# 96. Next Step

Tài liệu tiếp theo:

`26_FRONTEND_IMPLEMENTATION_PLAN.md`

Mục tiêu của tài liệu 26:

```text
Frontend Architecture
        ↓
Implementation Phases
        ↓
Screens
        ↓
Components
        ↓
API
        ↓
Permissions
        ↓
Workflow
        ↓
Tests
        ↓
Definition of Done
```

**End of Document**
