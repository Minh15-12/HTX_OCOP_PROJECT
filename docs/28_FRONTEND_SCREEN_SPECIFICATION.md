# 28_FRONTEND_SCREEN_SPECIFICATION.md

# Frontend Screen Specification
## Hệ thống quản lý hoạt động Hợp tác xã nông nghiệp và số hóa hồ sơ đánh giá, phân hạng OCOP

---

# 1. Document Information

| Field | Value |
|---|---|
| Document ID | 28 |
| Document Name | Frontend Screen Specification |
| Project | Xây dựng Hệ thống quản lý hoạt động Hợp tác xã nông nghiệp và số hóa hồ sơ đánh giá, phân hạng OCOP |
| Layer | Frontend / Screen Specification |
| Status | Baseline |
| Audience | AI Coding Agent, Frontend Developer, UI/UX Designer, Tester |
| Depends On | 00–27 |
| Primary References | 08_FUNCTIONAL_REQUIREMENTS.md, 09_USE_CASES_FINAL.md, 10_DOMAIN_MODEL.md, 12_API_SPECIFICATION.md, 15_AUTHORIZATION_MATRIX.md, 16_WORKFLOW_SPECIFICATION.md, 24_FRONTEND_ARCHITECTURE.md, 25_FRONTEND_CODING_STANDARDS.md, 26_FRONTEND_IMPLEMENTATION_PLAN.md, 27_UI_UX_SPECIFICATION.md |
| Next Document | 29_API_ERROR_CATALOG.md |

---

# 2. Purpose

Tài liệu này đặc tả **từng màn hình, route, mục đích, dữ liệu, hành động, trạng thái, quyền và API dependency** của frontend.

Tài liệu trả lời các câu hỏi:

- Màn hình nào tồn tại?
- Route nào mở màn hình?
- Người dùng nào được phép truy cập?
- Màn hình hiển thị dữ liệu gì?
- Có thao tác nào?
- Thao tác gọi API nào?
- Khi loading/error/empty/permission denied thì UI thế nào?
- Khi workflow thay đổi trạng thái thì UI thế nào?
- Form nào có validation?
- Thành phần nào dùng chung?
- Màn hình nào là P0/P1/P2?
- Màn hình nào không được tự ý tạo thêm?

Tài liệu này **không thay thế API specification, business rules hoặc authorization matrix**.

Frontend chỉ phản ánh nghiệp vụ và quyền từ backend; frontend không phải security boundary.

---

# 3. Screen Specification Rules

## 3.1. Screen ID

Mỗi màn hình phải có ID duy nhất:

```text
SCR-AUTH-xxx
SCR-DASH-xxx
SCR-COOP-xxx
SCR-MEMBER-xxx
SCR-PROD-xxx
SCR-INV-xxx
SCR-FIN-xxx
SCR-OCOP-xxx
SCR-REPORT-xxx
SCR-ADMIN-xxx
```

Không tạo screen không có ID.

---

## 3.2. Route

Mỗi screen phải có route ổn định.

Route frontend không được tự suy diễn từ tên entity nếu chưa có trong tài liệu.

---

## 3.3. Permission

Permission hiển thị trong tài liệu là baseline.

Backend mới là nơi quyết định quyền thực tế.

Frontend phải:

```text
hide/disable UI
+
handle 403 from backend
```

Không được coi việc ẩn button là cơ chế bảo mật.

---

## 3.4. API

Mỗi screen phải chỉ ra API dependency.

Frontend không được:

- gọi API chưa được đặc tả;
- tự thêm query parameter nghiệp vụ;
- tự tạo endpoint;
- tự tính kết quả chính thức nếu backend là source of truth.

---

## 3.5. Status

Status phải hiển thị bằng:

```text
label + semantic visual + accessible text
```

Không chỉ dùng màu.

---

# 4. Global Application Routes

Baseline route map:

```text
/auth/login

/
/dashboard

/cooperative
/cooperative/profile

/members
/members/new
/members/:id
/members/:id/edit
/members/:id/capital-contributions

/production/units
/production/units/new
/production/units/:id

/production/plots
/production/plots/new
/production/plots/:id

/production/seasons
/production/seasons/new
/production/seasons/:id

/production/logs
/production/logs/new
/production/logs/:id

/production/harvests
/production/harvests/new
/production/harvests/:id

/products
/products/new
/products/:id

/materials
/materials/new
/materials/:id

/inventory/warehouses
/inventory/stock-receipts
/inventory/stock-receipts/new
/inventory/stock-issues
/inventory/stock-issues/new
/inventory/stock-counts
/inventory/stock-counts/new

/finance/cash-transactions
/finance/cash-transactions/new
/finance/cash-transactions/:id

/finance/receivables-payables
/finance/receivables-payables/new
/finance/receivables-payables/:id
/finance/receivables-payables/:id/settlements

/finance/surplus-distribution
/finance/surplus-distribution/new
/finance/surplus-distribution/:id

/ocop
/ocop/dossiers
/ocop/dossiers/new
/ocop/dossiers/:id
/ocop/dossiers/:id/evaluation

/ocop/criteria-versions
/ocop/criteria-versions/:id
/ocop/criteria
/ocop/scoring-rules
/ocop/mandatory-conditions
/ocop/council-levels

/ocop/evidences
/ocop/evidences/new
/ocop/evidences/:id

/ocop/evaluation-sessions
/ocop/evaluation-sessions/:id
/ocop/evaluators
/ocop/evaluator-assignments
/ocop/scores
/ocop/consolidation
/ocop/proposed-classifications
/ocop/final-decisions

/workflow
/notifications
/reports
/documents
/audit

/admin/users
/admin/roles
/admin/permissions
/admin/settings
```

Các route thực tế phải được đối chiếu với API và authorization matrix trước implementation.

---

# 5. Global Layout

## 5.1. Desktop

```text
┌─────────────────────────────────────────────────────────────┐
│ Header: Logo | Breadcrumb/Page context | Search | Bell/User │
├──────────────┬──────────────────────────────────────────────┤
│ Sidebar      │ Page Header                                  │
│              │ Title / Description / Actions                │
│ Navigation   ├──────────────────────────────────────────────┤
│              │ Filters / Tabs / Toolbar                     │
│              ├──────────────────────────────────────────────┤
│              │ Main Content                                 │
│              │                                              │
│              │ Table / Form / Cards / Detail                │
│              │                                              │
└──────────────┴──────────────────────────────────────────────┘
```

---

## 5.2. Mobile

```text
┌──────────────────────────────┐
│ Menu | Title | Notification  │
├──────────────────────────────┤
│ Breadcrumb / Context         │
├──────────────────────────────┤
│ Page content                 │
│                              │
│ Cards / Form / List          │
│                              │
└──────────────────────────────┘
```

Mobile không bắt buộc giữ nguyên desktop table.

Có thể chuyển:

```text
table → card list
```

nếu 27_UI_UX_SPECIFICATION cho phép.

---

# 6. Global States

Mọi data screen phải hỗ trợ tối thiểu:

```text
INITIAL
LOADING
SUCCESS
EMPTY
ERROR
FORBIDDEN
UNAUTHORIZED
NETWORK_ERROR
```

Form phải hỗ trợ:

```text
INITIAL
DIRTY
SUBMITTING
SUCCESS
VALIDATION_ERROR
SERVER_ERROR
CONFLICT
FORBIDDEN
```

---

# 7. SCR-AUTH-001 — Login

## Route

```text
/auth/login
```

## Purpose

Đăng nhập hệ thống.

## Layout

```text
Logo
System name
Username/email/credential field
Password field
Remember/session option if specified
Login button
Error message
```

## API

Đối chiếu authentication API trong `12_API_SPECIFICATION.md`.

## Actions

```text
Login
```

## Validation

- required;
- format theo API contract;
- không hiển thị credential trong error;
- không log password.

## States

### Loading

Login button disabled + progress indicator.

### Error

Hiển thị thông báo tổng quát, không tiết lộ thông tin nhạy cảm.

### Success

Redirect:

```text
→ /dashboard
```

hoặc route đích đã yêu cầu trước login.

## Permission

Không cần permission module.

## Acceptance

- unauthorized user không vào protected route;
- token/session được lưu theo frontend architecture;
- logout xóa session phù hợp;
- 401 từ API đưa về auth flow.

---

# 8. SCR-AUTH-002 — Session / Access Denied

## Routes

```text
/403
/401
```

## Purpose

Hiển thị lỗi quyền truy cập hoặc phiên đăng nhập.

## Content

```text
Title
Explanation
Back
Go to Dashboard
```

Không hiển thị stack trace.

---

# 9. SCR-DASH-001 — Dashboard

## Route

```text
/dashboard
```

## Purpose

Tổng quan hoạt động HTX.

## Widgets

Có thể gồm:

```text
Số xã viên
Đơn vị sản xuất
Vùng trồng
Mùa vụ đang hoạt động
Lô sản phẩm
Tồn kho
Số dư quỹ
Công nợ
Hồ sơ OCOP
Tiến độ đánh giá OCOP
Thông báo
```

Chỉ hiển thị widget nếu backend/API cung cấp dữ liệu.

## UX

KPI card:

```text
Value
Label
Optional trend/context
```

Không tự tính KPI chính thức ở frontend nếu backend đã cung cấp.

## Permission

Widget nào không có quyền thì:

```text
hide
```

hoặc:

```text
restricted placeholder
```

theo UX baseline.

---

# 10. SCR-COOP-001 — Cooperative Profile

## Route

```text
/cooperative/profile
```

## Purpose

Xem thông tin HTX.

## Sections

```text
Thông tin chung
Thông tin pháp lý
Thông tin liên hệ
Thông tin hoạt động
Metadata
```

## Actions

```text
Edit
```

chỉ khi có permission.

## States

Read-only khi không có quyền update.

---

# 11. SCR-MEMBER-001 — Member List

## Route

```text
/members
```

## Purpose

Quản lý danh sách xã viên.

## Table Columns

Baseline:

```text
Mã xã viên
Họ tên
Số điện thoại
Ngày tham gia
Trạng thái
Vốn góp
Thao tác
```

Chỉ hiển thị field có trong API response.

## Toolbar

```text
Search
Filter status
Filter date if supported
Create Member
Export if API supports
```

## Row Actions

```text
View
Edit
Capital Contributions
```

Các action phải kiểm tra permission.

## Empty

```text
Chưa có xã viên
+ Thêm xã viên
```

nếu user có quyền create.

---

# 12. SCR-MEMBER-002 — Create Member

## Route

```text
/members/new
```

## Sections

```text
Thông tin cá nhân
Thông tin liên hệ
Thông tin thành viên
Thông tin vốn góp nếu API/flow yêu cầu
```

## Form Rules

- required theo API;
- client validation chỉ để UX;
- backend validation là source of truth;
- không tự tạo mã xã viên nếu specification quy định backend sinh mã.

## Actions

```text
Cancel
Save
```

## Success

Redirect:

```text
/members/:id
```

hoặc route được API flow quy định.

---

# 13. SCR-MEMBER-003 — Member Detail

## Route

```text
/members/:id
```

## Layout

```text
Header:
Tên xã viên
Mã xã viên
Status

Tabs:
Thông tin
Vốn góp
Lịch sử
```

## Related Data

Có thể gồm:

```text
Production Units
Farm Plots
Crop Seasons
Capital Contributions
```

Chỉ hiển thị quan hệ nếu API cung cấp.

## Actions

```text
Edit
Capital Contribution
```

---

# 14. SCR-MEMBER-004 — Edit Member

## Route

```text
/members/:id/edit
```

## Rules

Không cho sửa field bị khóa theo backend.

Nếu server trả conflict:

```text
Hiển thị conflict state
Reload latest data
Không silently overwrite
```

---

# 15. SCR-MEMBER-005 — Capital Contributions

## Route

```text
/members/:id/capital-contributions
```

## Purpose

Theo dõi vốn góp của xã viên.

## Sections

```text
Tổng quan vốn góp
Danh sách giao dịch vốn góp
Lịch sử
```

## Money

Luôn format theo locale:

```text
vi-VN
```

Không dùng floating point ở frontend cho calculation tài chính.

## Actions

Chỉ hiện action được API + permission hỗ trợ.

---

# 16. SCR-PROD-001 — Production Units

## Route

```text
/production/units
```

## Purpose

Quản lý đơn vị sản xuất.

## Table

```text
Mã
Tên
Xã viên/chủ thể liên quan
Trạng thái
Diện tích nếu API cung cấp
Thao tác
```

## Actions

```text
Create
View
Edit
```

Không tự đồng nhất Production Unit với Farm Plot.

---

# 17. SCR-PROD-002 — Production Unit Detail

## Route

```text
/production/units/:id
```

## Sections

```text
Thông tin đơn vị sản xuất
Xã viên liên quan
Vùng trồng
Mùa vụ
Lịch sử
```

---

# 18. SCR-PLOT-001 — Farm Plots / Planting Areas

## Route

```text
/production/plots
```

## Purpose

Quản lý vùng trồng.

## Table

```text
Mã vùng
Tên vùng
Đơn vị sản xuất
Diện tích
Loại cây/cây trồng nếu có
Trạng thái
```

Không tự suy diễn field nếu API không cung cấp.

---

# 19. SCR-PLOT-002 — Farm Plot Detail

## Route

```text
/production/plots/:id
```

## Tabs

```text
Thông tin vùng trồng
Mùa vụ
Nhật ký
Thu hoạch
Lô
Traceability
```

Chỉ hiển thị tab có dữ liệu/API dependency.

---

# 20. SCR-SEASON-001 — Crop Season List

## Route

```text
/production/seasons
```

## Filters

```text
Production Unit
Farm Plot
Status
Date range
```

## Table

```text
Mùa vụ
Vùng trồng
Cây trồng
Ngày bắt đầu
Ngày kết thúc
Trạng thái
```

---

# 21. SCR-SEASON-002 — Crop Season Create

## Route

```text
/production/seasons/new
```

## Form

```text
Production Unit
Farm Plot
Crop/Product reference
Start Date
Expected End Date
Notes
```

Các field thực tế phải theo API/domain.

## Validation

- required;
- date consistency;
- relation belongs to current cooperative;
- backend validation.

---

# 22. SCR-SEASON-003 — Crop Season Detail

## Route

```text
/production/seasons/:id
```

## Sections

```text
Thông tin mùa vụ
Nhật ký sản xuất
Vật tư sử dụng
PHI
Thu hoạch
Lô
```

---

# 23. SCR-LOG-001 — Farming Logs

## Route

```text
/production/logs
```

## Table

```text
Ngày
Mùa vụ
Hoạt động
Người thực hiện
Trạng thái
```

Không tự phát minh activity types.

---

# 24. SCR-LOG-002 — Farming Log Create

## Route

```text
/production/logs/new
```

## Sections

```text
Mùa vụ
Ngày
Hoạt động
Nội dung
Người thực hiện
Ghi chú
```

Nếu activity type là master data thì dùng select từ API.

---

# 25. SCR-LOG-003 — Farming Log Detail

## Route

```text
/production/logs/:id
```

## Sections

```text
Thông tin nhật ký
Vật tư sử dụng
PHI
Lịch sử
```

## Actions

```text
Add Material Usage
Calculate/Refresh PHI if supported
```

Không tự tính PHI bằng công thức frontend nếu backend đã có PHI API.

---

# 26. SCR-MATERIAL-USAGE-001 — Material Usage

## Context

Hiển thị trong Farming Log Detail.

## Data

```text
Material
Quantity
Unit
Application date
Notes
```

Không hard-code vật tư.

---

# 27. SCR-PHI-001 — PHI Information

## Context

Hiển thị trong Farming Log/Season detail.

## Purpose

Hiển thị kết quả PHI do backend cung cấp.

## Rules

Frontend:

- không tự thay đổi PHI days;
- không tự phát minh threshold;
- hiển thị status backend trả về;
- hiển thị warning/block theo contract.

---

# 28. SCR-HARVEST-001 — Harvest List

## Route

```text
/production/harvests
```

## Filters

```text
Season
Farm Plot
Date range
Status
```

## Columns

```text
Harvest Code
Season
Date
Quantity
Unit
Status
```

---

# 29. SCR-HARVEST-002 — Harvest Create

## Route

```text
/production/harvests/new
```

## Sections

```text
Crop Season
Harvest Date
Quantity
Unit
Quality/notes if API provides
PHI safety information
```

Không cho frontend bypass PHI validation.

---

# 30. SCR-HARVEST-003 — Lot Detail

## Route

```text
/production/harvests/:id
```

hoặc route chuyên biệt nếu API architecture đã định nghĩa.

## Sections

```text
Harvest
Lot
Product
Source Plot
Source Season
Traceability
```

---

# 31. SCR-PRODUCT-001 — Product List

## Route

```text
/products
```

## Purpose

Master data sản phẩm.

## Important Distinction

```text
Product = loại/sản phẩm master
Lot = lô cụ thể
```

UI không được gộp hai khái niệm thành một.

---

# 32. SCR-PRODUCT-002 — Product Create/Edit

## Route

```text
/products/new
/products/:id/edit
```

## Form

Chỉ dùng fields từ API/domain.

## Validation

- required;
- unique constraints nếu backend quy định;
- tenant scope.

---

# 33. SCR-INVENTORY-001 — Warehouse List

## Route

```text
/inventory/warehouses
```

## Display

```text
Tên kho
Mã kho
Trạng thái
Địa điểm nếu API cung cấp
```

---

# 34. SCR-INVENTORY-002 — Stock Receipt List

## Route

```text
/inventory/stock-receipts
```

## Actions

```text
Create
View
```

## Columns

```text
Receipt No.
Date
Warehouse
Source
Total/Quantity
Status
```

---

# 35. SCR-INVENTORY-003 — Stock Receipt Create

## Route

```text
/inventory/stock-receipts/new
```

## Form

```text
Warehouse
Date
Source
Items
Quantity
Unit
Unit price if supported
Evidence
Notes
```

Frontend không tự tính official inventory balance nếu backend là source of truth.

---

# 36. SCR-INVENTORY-004 — Stock Issue List/Create

## Routes

```text
/inventory/stock-issues
/inventory/stock-issues/new
```

## Purpose

Quản lý xuất kho.

## Rules

- không cho quantity âm;
- backend quyết định tồn kho khả dụng;
- lỗi insufficient stock hiển thị rõ;
- submit không tạo duplicate issue khi retry.

---

# 37. SCR-INVENTORY-005 — Stock Count

## Route

```text
/inventory/stock-counts
/inventory/stock-counts/new
```

## Purpose

Kiểm kê.

## States

```text
Draft
Submitted
Approved/Finalized
```

Chỉ hiển thị state đã được API định nghĩa.

---

# 38. SCR-FIN-001 — Cash Transaction List

## Route

```text
/finance/cash-transactions
```

## Permission

```text
FINANCE.READ
```

## Toolbar

```text
Search
Type filter: INCOME / EXPENSE
Status filter
Date range
Create
```

## Summary

```text
Current Cash Balance
```

Số dư phải lấy từ backend source of truth.

Không tự cộng dữ liệu chưa được backend xác nhận.

---

# 39. SCR-FIN-002 — Create Cash Transaction

## Route

```text
/finance/cash-transactions/new
```

## Permission

```text
FINANCE.CREATE
```

## Form

```text
Voucher Number if user-entered
Type
Amount
Transaction Date
Category
Description
Payer/Payee
Member
Evidence Reference
```

## Validation

```text
amount > 0
```

Các validation khác theo API.

## Status

New transaction:

```text
DRAFT
```

nếu workflow backend quy định.

## Important

Create không đồng nghĩa POST.

---

# 40. SCR-FIN-003 — Cash Transaction Detail

## Route

```text
/finance/cash-transactions/:id
```

## Header

```text
Voucher
Type
Amount
Status
Date
```

## Actions

```text
Approve
Post
```

chỉ khi:

- permission cho phép;
- status cho phép;
- backend trả action hợp lệ.

## Status Timeline

```text
DRAFT
→ APPROVED
→ POSTED
```

## Cash Balance

Chỉ phản ánh transaction khi backend xác nhận `POSTED`.

---

# 41. SCR-FIN-004 — Receivable / Payable List

## Route

```text
/finance/receivables-payables
```

## Permission

```text
FINANCE.READ
```

## Filters

```text
Type
Status
Due date
Counterparty
```

## Columns

```text
Debt Code
Type
Counterparty
Original Amount
Outstanding Amount
Due Date
Status
```

---

# 42. SCR-FIN-005 — Create Receivable / Payable

## Route

```text
/finance/receivables-payables/new
```

## Permission

```text
FINANCE.CREATE
```

## Form

```text
Debt Type
Counterparty
Original Amount
Due Date
Description
```

## Validation

```text
amount > 0
```

Không cho client tự quyết định `outstanding_amount` nếu backend tự quản lý.

---

# 43. SCR-FIN-006 — Debt Detail

## Route

```text
/finance/receivables-payables/:id
```

## Sections

```text
Debt Summary
Settlement History
Audit/History
```

## Actions

```text
Edit
Settlement
```

## Summary

```text
Original Amount
Settled Amount
Outstanding Amount
Status
```

Các giá trị financial chính thức lấy từ backend.

---

# 44. SCR-FIN-007 — Debt Settlement

## Route

```text
/finance/receivables-payables/:id/settlements
```

## Purpose

Thanh toán công nợ.

## Form

```text
Amount
Payment Method
Notes
```

Nếu `CASH`, UI phải cảnh báo rằng settlement sẽ tạo cash transaction theo backend workflow.

## Validation

```text
amount > 0
amount <= outstanding_amount
```

Nhưng backend vẫn là nơi enforce.

## Error

Nếu:

```text
OVER_SETTLEMENT_VIOLATION
```

hiển thị:

```text
Số tiền thanh toán vượt quá số dư công nợ còn lại.
```

Không hiển thị stack trace/error internals.

---

# 45. SCR-FIN-008 — Surplus Distribution List

## Route

```text
/finance/surplus-distribution
```

## Permission

```text
FINANCE.READ
```

## Columns

```text
Financial Year
Distributable Surplus
Capital Weight
Service Weight
Status
Created Date
```

## Actions

```text
View
Create
```

---

# 46. SCR-FIN-009 — Create Surplus Distribution Plan

## Route

```text
/finance/surplus-distribution/new
```

## Permission

```text
FINANCE.CREATE
```

## Sections

```text
Financial Year
Distributable Surplus
Capital Weight
Service Usage Weight
Calculation Preview if API provides
```

## Important

Frontend không tự invent:

- tỷ lệ;
- eligibility;
- formula;
- reserve;
- deduction;
- rounding strategy.

Nếu API trả default weight, hiển thị default từ backend.

---

# 47. SCR-FIN-010 — Surplus Distribution Detail

## Route

```text
/finance/surplus-distribution/:id
```

## Sections

```text
Plan Summary
Weights
Allocation Table
Snapshot Information
Workflow
History
```

## Allocation Table

```text
Member
Capital Snapshot
Service Snapshot
Capital Share
Service Share
Total Allocation
```

## Important

Allocation là historical snapshot.

Không tự refresh allocation bằng dữ liệu member hiện tại.

---

# 48. SCR-FIN-011 — Surplus Workflow

## Context

Trong detail screen.

## Actions

```text
Submit
Approve
```

chỉ khi backend cho phép.

## Status

```text
DRAFT
→ SUBMITTED
→ APPROVED
```

## Idempotency UX

Khi đang submit:

```text
button disabled
loading
```

Nếu request retry:

Frontend phải xử lý response idempotently.

---

# 49. SCR-OCOP-001 — OCOP Dashboard

## Route

```text
/ocop
```

## Purpose

Tổng quan OCOP.

## Widgets

```text
Hồ sơ đang chuẩn bị
Hồ sơ đã gửi
Hồ sơ đang đánh giá
Hồ sơ cần bổ sung
Hồ sơ đã đánh giá
Tiến độ minh chứng
Tiến độ tiêu chí
```

Chỉ hiển thị metrics được backend/API cung cấp.

---

# 50. SCR-OCOP-002 — Dossier List

## Route

```text
/ocop/dossiers
```

## Toolbar

```text
Search
Status
Product
Financial/Submission period if supported
Create
```

## Columns

```text
Dossier Code
Product
Owner/HTX
Version
Status
Progress
Updated At
```

## Status

Không hard-code status ngoài workflow specification.

---

# 51. SCR-OCOP-003 — Create OCOP Dossier

## Route

```text
/ocop/dossiers/new
```

## Sections

```text
Thông tin chung
Chủ thể OCOP
Sản phẩm OCOP
Thông tin sản xuất
Thông tin pháp lý
Thông tin liên quan
```

Chỉ field có trong API/domain mới được implement.

## Actions

```text
Save Draft
Cancel
```

---

# 52. SCR-OCOP-004 — Dossier Detail

## Route

```text
/ocop/dossiers/:id
```

## Header

```text
Dossier Code
Product
Status
Version
Progress
```

## Tabs

```text
Thông tin chung
Sản phẩm
Tiêu chí
Minh chứng
Tự đánh giá
Đánh giá
Workflow
Lịch sử
```

Tab visibility theo permission và backend capability.

---

# 53. SCR-OCOP-005 — Dossier General Information

## Context

Dossier detail tab.

## Sections

```text
Thông tin chủ thể
Thông tin liên hệ
Thông tin pháp lý
Thông tin sản phẩm
```

## Edit

Chỉ khi dossier ở trạng thái cho phép edit.

---

# 54. SCR-OCOP-006 — OCOP Product Information

## Context

Dossier detail.

## Sections

```text
Tên sản phẩm
Nhóm sản phẩm
Mô tả
Nguồn nguyên liệu
Thông tin sản xuất
Thông tin thị trường
```

Chỉ hiển thị fields từ API/domain.

---

# 55. SCR-OCOP-007 — Criteria Version List

## Route

```text
/ocop/criteria-versions
```

## Purpose

Quản lý version bộ tiêu chí.

## Table

```text
Version
Name
Effective Date
Status
Created At
```

## Important

Criteria là versioned master data.

Không cho frontend giả định chỉ có một bộ tiêu chí.

---

# 56. SCR-OCOP-008 — Criteria Version Detail

## Route

```text
/ocop/criteria-versions/:id
```

## Sections

```text
Version Metadata
Criteria
Indicators
Scoring Rules
Mandatory Conditions
History
```

---

# 57. SCR-OCOP-009 — Criteria List

## Route

```text
/ocop/criteria
```

## Filters

```text
Criteria Version
Group
Status
```

## Display

```text
Criterion Code
Name
Maximum Score
Required/Optional if specified
```

Không tự thêm điểm tối đa nếu API không trả.

---

# 58. SCR-OCOP-010 — Scoring Rules

## Route

```text
/ocop/scoring-rules
```

## Purpose

Xem/quản lý scoring rules theo permission.

## Important

Frontend không tự hard-code scoring formula.

Score chính thức phải do backend/domain xử lý.

---

# 59. SCR-OCOP-011 — Mandatory Conditions

## Route

```text
/ocop/mandatory-conditions
```

## Purpose

Quản lý/xem điều kiện bắt buộc.

## UX

Mỗi condition có:

```text
Code
Name
Description
Status
```

Nếu có pass/fail:

```text
PASS
FAIL
NOT_EVALUATED
```

chỉ khi API trả các trạng thái này.

---

# 60. SCR-OCOP-012 — Evidence List

## Route

```text
/ocop/evidences
```

## Toolbar

```text
Search
Type
Status
Dossier
Version
```

## Table

```text
Evidence
Type
Dossier
Version
Status
Uploaded At
```

---

# 61. SCR-OCOP-013 — Evidence Upload

## Route

```text
/ocop/evidences/new
```

## Form

```text
Dossier
Evidence Type
Title
Description
File
```

## Upload UX

```text
Select file
→ client-side size/type precheck
→ upload
→ server validation
→ success
```

Client precheck không thay thế backend validation.

## Security

Không hiển thị public URL nếu object storage private.

Dùng signed URL hoặc API proxy theo architecture.

---

# 62. SCR-OCOP-014 — Evidence Detail

## Route

```text
/ocop/evidences/:id
```

## Sections

```text
Metadata
Current Version
Version History
Linked Criteria
```

## Actions

```text
View
Download
Create New Version
Link to Criterion
```

Chỉ hiển thị nếu permission/capability cho phép.

---

# 63. SCR-OCOP-015 — Evidence Version

## Context

Evidence Detail.

## Display

```text
Version number
Created At
Created By
File metadata
Status
```

Không ghi đè file lịch sử nếu domain yêu cầu versioning.

---

# 64. SCR-OCOP-016 — Criteria Evaluation Workspace

## Route

```text
/ocop/dossiers/:id/evaluation
```

## Purpose

Không gian đánh giá hồ sơ.

## Layout

```text
Left:
Criteria tree/list

Center:
Selected criterion
Description
Indicators
Evidence

Right:
Score
Comment
Status
```

Desktop ưu tiên 3-column layout.

Mobile chuyển thành:

```text
Criteria
→ Criterion
→ Evidence
→ Score
```

---

# 65. SCR-OCOP-017 — Evidence Link to Criterion

## Context

Criteria Evaluation Workspace.

## Action

```text
Link Evidence
Unlink Evidence
View Evidence
```

## UX

Hiển thị:

```text
Evidence title
Version
Status
```

Không chỉ hiển thị filename.

---

# 66. SCR-OCOP-018 — Score Input

## Context

Evaluation Workspace.

## Fields

```text
Score
Comment
```

## Rules

- score range lấy từ scoring rule/API;
- không hard-code max score;
- decimal precision theo backend;
- required fields theo workflow;
- submit phải gửi đúng DTO/API.

## Invalid Score

Hiển thị validation ngay cạnh field.

Backend response vẫn là source of truth.

---

# 67. SCR-OCOP-019 — Evaluation Progress

## Context

Dossier Evaluation.

## Display

```text
Total Criteria
Evaluated
Pending
Evidence Complete
Evidence Missing
Score Progress
```

Không tự tính official final score nếu backend cung cấp aggregate.

---

# 68. SCR-OCOP-020 — Evaluation Session List

## Route

```text
/ocop/evaluation-sessions
```

## Table

```text
Session Code
Dossier
Council Level
Status
Start Date
End Date
```

## Council Level

UI phải hỗ trợ cấu hình/versioned council levels.

Không hard-code chỉ một cấp.

---

# 69. SCR-OCOP-021 — Evaluation Session Detail

## Route

```text
/ocop/evaluation-sessions/:id
```

## Sections

```text
Session Information
Council Level
Assigned Evaluators
Criteria
Scores
Consolidation
Workflow
```

---

# 70. SCR-OCOP-022 — Evaluator List

## Route

```text
/ocop/evaluators
```

## Purpose

Tra cứu người đánh giá.

## Fields

Chỉ hiển thị dữ liệu được authorization cho phép.

---

# 71. SCR-OCOP-023 — Evaluator Assignment

## Route

```text
/ocop/evaluator-assignments
```

## Actions

```text
Assign
Reassign if workflow allows
View
```

Không cho frontend tự gán evaluator nếu backend chưa cấp action.

---

# 72. SCR-OCOP-024 — Score Review

## Route

```text
/ocop/scores
```

## Purpose

Tra cứu điểm đánh giá.

## Table

```text
Criterion
Evaluator
Score
Comment
Status
Updated At
```

---

# 73. SCR-OCOP-025 — Consolidation

## Route

```text
/ocop/consolidation
```

## Purpose

Tổng hợp kết quả đánh giá.

## Display

```text
Score by criterion
Score by evaluator
Aggregate score
Mandatory condition result
Overall evaluation status
```

Không tự tính official result ở frontend nếu backend cung cấp.

---

# 74. SCR-OCOP-026 — Proposed Classification

## Route

```text
/ocop/proposed-classifications
```

## Display

```text
Dossier
Total Score
Mandatory Conditions
Proposed Star Level
Status
```

## Important

Proposed classification phải do backend/domain trả.

Frontend không tự suy diễn:

```text
score → star
```

trừ khi specification/API explicitly yêu cầu frontend preview.

---

# 75. SCR-OCOP-027 — Final Decision

## Route

```text
/ocop/final-decisions
```

## Display

```text
Dossier
Council Level
Decision
Decision Date
Status
```

## Actions

Theo permission + workflow.

---

# 76. SCR-OCOP-028 — Council Level

## Route

```text
/ocop/council-levels
```

## Purpose

Hiển thị/cấu hình council levels theo backend policy.

## Critical Rule

Không hard-code assumption rằng hệ thống chỉ có:

```text
District
Province
Central
```

Council level phải được backend/configuration cung cấp theo policy version.

---

# 77. SCR-WORKFLOW-001 — Workflow Inbox

## Route

```text
/workflow
```

## Purpose

Danh sách công việc người dùng cần xử lý.

## Cards/List

```text
Task
Entity
Current Status
Due Date
Priority
Action
```

## Actions

Action label phải lấy từ workflow specification.

Không dùng:

```text
Change Status
```

cho mọi trường hợp.

Ưu tiên action domain:

```text
Submit
Return
Resubmit
Approve
Reject
```

nếu backend cung cấp.

---

# 78. SCR-NOTIFY-001 — Notification Center

## Route

```text
/notifications
```

## Display

```text
Unread
Read
Time
Entity
Action
```

## Actions

```text
Mark as read
Open related resource
```

---

# 79. SCR-REPORT-001 — Reports

## Route

```text
/reports
```

## Categories

```text
Member Reports
Production Reports
Inventory Reports
Finance Reports
OCOP Reports
```

Chỉ hiển thị report mà API/permission hỗ trợ.

---

# 80. SCR-REPORT-002 — Report Detail

## Route

```text
/reports/:id
```

## UX

```text
Filters
Generate
Preview
Export
```

Long-running generation:

```text
Queued
Processing
Completed
Failed
```

Không block UI bằng request vô thời hạn.

---

# 81. SCR-DOC-001 — Document Generation

## Route

```text
/documents
```

## Display

```text
Document
Type
Entity
Status
Created At
```

## Status

```text
QUEUED
PROCESSING
COMPLETED
FAILED
```

## Actions

```text
View
Download
Retry
```

Retry chỉ khi API cho phép.

---

# 82. SCR-AUDIT-001 — Audit Log

## Route

```text
/audit
```

## Permission

Theo `15_AUTHORIZATION_MATRIX.md`.

## Table

```text
Timestamp
Actor
Action
Entity
Entity ID
Result
```

## Detail

Drawer/modal:

```text
Before
After
Metadata
Request correlation ID if exposed
```

Không hiển thị secret/token/password.

---

# 83. SCR-ADMIN-001 — User Management

## Route

```text
/admin/users
```

## Purpose

Quản lý user theo permission.

## Actions

```text
Create
View
Edit
Activate/Deactivate
```

Không hiển thị chức năng nếu role không có quyền.

---

# 84. SCR-ADMIN-002 — Role Management

## Route

```text
/admin/roles
```

## Display

```text
Role
Description
Permissions
Status
```

Không cho frontend bypass backend authorization.

---

# 85. SCR-ADMIN-003 — Permission Management

## Route

```text
/admin/permissions
```

## Purpose

Tra cứu permission catalog.

Không tự tạo permission từ frontend.

---

# 86. SCR-ADMIN-004 — System Settings

## Route

```text
/admin/settings
```

## Rule

Chỉ hiển thị configuration được backend cho phép quản lý.

Không hard-code business policy tại frontend.

---

# 87. Shared List Screen Contract

Mọi list screen nên có:

```text
PageHeader
Search
Filters
PrimaryAction
Table/CardList
Pagination
LoadingState
EmptyState
ErrorState
```

---

# 88. Shared Detail Screen Contract

Mọi detail screen nên có:

```text
PageHeader
Status
Summary
Tabs/Sections
Primary Actions
Secondary Actions
History
Audit if allowed
```

---

# 89. Shared Create/Edit Screen Contract

```text
PageHeader
Form Sections
Validation
Cancel
Save
Submit if applicable
Unsaved Changes Guard
```

---

# 90. Shared Workflow Screen Contract

```text
Entity Summary
Current Status
Allowed Actions
Action Confirmation
Comment/Reason if required
Timeline
```

---

# 91. Confirmation Rules

Confirmation bắt buộc cho action có side effect đáng kể, ví dụ:

```text
Approve
Reject
Post
Finalize
Delete if supported
Submit irreversible action
```

Không confirmation cho navigation bình thường.

---

# 92. Unsaved Changes

Nếu form dirty:

```text
Navigate away
→ Confirmation
```

Nếu submit đang processing:

```text
Disable duplicate submission
```

---

# 93. Server Validation

Server validation error phải map về:

```text
field error
```

nếu API cung cấp field path.

Nếu error không map được:

```text
form-level error
```

Không nuốt error.

---

# 94. Conflict UX

HTTP 409 hoặc equivalent:

```text
Dữ liệu đã thay đổi bởi người dùng khác.
```

Actions:

```text
Reload latest
Cancel
```

Không silently overwrite.

---

# 95. Permission UX

Nếu không có permission:

```text
Do not render action
```

Nhưng nếu user gọi API trực tiếp hoặc stale UI:

```text
403
→ permission error state
```

Không giả định frontend hide button là đủ.

---

# 96. API Loading UX

## List

Skeleton/table loading.

## Detail

Page skeleton.

## Form submit

Button:

```text
Submitting...
```

Không cho double click tạo duplicate.

---

# 97. Empty State Rules

Empty state phải giải thích:

```text
Không có dữ liệu
```

và nếu có quyền:

```text
+ Tạo mới
```

Nếu do filter:

```text
Không tìm thấy kết quả
Xóa bộ lọc
```

---

# 98. Error State Rules

Error state:

```text
Không thể tải dữ liệu.
Thử lại
```

Không hiển thị internal exception.

---

# 99. Network Error

Nếu request thất bại do network:

```text
Không thể kết nối đến máy chủ.
Kiểm tra kết nối và thử lại.
```

Không tự retry vô hạn.

---

# 100. Pagination

List screens phải sử dụng pagination API.

Không load toàn bộ dataset chỉ để phân trang frontend nếu API đã hỗ trợ server-side pagination.

---

# 101. Search

Search phải debounce theo frontend coding standard.

Không gọi API mỗi keystroke nếu không cần.

Search query phải tuân thủ API contract.

---

# 102. Filter

Filter state phải:

```text
reflect URL
```

nếu architecture quy định URL-shareable filters.

Không tự thêm filter nghiệp vụ chưa có API.

---

# 103. Date UX

Hiển thị:

```text
dd/MM/yyyy
```

theo locale UI.

API payload phải theo contract.

Không gửi localized display string nếu API yêu cầu ISO date.

---

# 104. Money UX

Display:

```text
1.000.000,00 ₫
```

theo locale/configuration phù hợp.

Input phải hỗ trợ:

```text
formatted display
+
normalized numeric payload
```

Không sử dụng floating-point business calculation.

---

# 105. Number UX

Tách:

```text
display value
raw value
```

Không gửi comma/dot formatting của UI trực tiếp nếu API yêu cầu numeric.

---

# 106. File Upload UX

## Steps

```text
Choose file
→ Validate basic client constraints
→ Upload
→ Server validation
→ Success
```

## Display

```text
filename
size
type
status
progress
```

## Security

Không hiển thị object-storage credentials.

Không expose private bucket URL.

---

# 107. Evidence File UX

Evidence phải hiển thị:

```text
Evidence title
Version
Status
Linked criteria
Upload date
```

Không chỉ filename.

---

# 108. Evidence Version UX

Nếu evidence có version:

```text
v1
v2
v3
```

phải phân biệt:

```text
Current
Historical
```

Không cho sửa historical version nếu backend khóa.

---

# 109. OCOP Criteria UX

Criteria tree:

```text
Criterion
 ├── Indicator
 ├── Evidence
 └── Score
```

Có thể dùng accordion/tree.

Selected criterion phải được highlight rõ.

---

# 110. OCOP Progress UX

Ví dụ:

```text
Criteria Progress
████████░░ 80%

Evidence Progress
██████░░░░ 60%
```

Nếu progress chính thức do backend trả, frontend chỉ render.

---

# 111. Evaluation Score UX

Score input phải:

```text
Label
Current score
Allowed range
Validation
Comment
```

Nếu score locked:

```text
Read-only
Locked badge
```

---

# 112. Evaluation Lock UX

Khi backend khóa score:

```text
🔒 Score locked
```

Không render editable input.

Nếu user cố gọi edit API:

```text
403/409
```

phải xử lý.

---

# 113. Council Level UX

Council level hiển thị:

```text
Label
Code if needed
Policy version if supplied
```

Không hard-code visual flow dựa trên một policy cố định.

---

# 114. Finance Status UX

Cash transaction:

```text
DRAFT
APPROVED
POSTED
```

Debt:

```text
OPEN
PARTIALLY_SETTLED
SETTLED
OVERDUE
```

Surplus:

```text
DRAFT
SUBMITTED
APPROVED
```

Chỉ sử dụng status nếu API/specification xác nhận.

---

# 115. Finance Source-of-Truth UX

Cash Balance phải được hiển thị từ backend.

UI không được:

```text
localStorage balance
+
client-side accumulation
```

làm source of truth.

Nếu có optimistic update, phải reconcile với server.

---

# 116. Surplus Allocation UX

Allocation table phải hiển thị snapshot values nếu API cung cấp.

Ví dụ:

```text
Member
Capital Snapshot
Service Snapshot
Capital Share
Service Share
Total Allocation
```

Không refresh allocation theo current member data.

---

# 117. Workflow Action UX

Action button phải phản ánh nghiệp vụ:

```text
Submit
Approve
Reject
Return
Resubmit
Post
```

Không dùng generic:

```text
Update Status
```

nếu API có domain action.

---

# 118. Action Confirmation UX

Ví dụ Approve:

```text
Bạn có chắc muốn phê duyệt phương án này?

[Hủy] [Phê duyệt]
```

Nếu backend yêu cầu reason:

```text
Reason
```

là required.

---

# 119. Action Success UX

Sau action thành công:

```text
Toast
+
refresh entity state
```

Ví dụ:

```text
Đã phê duyệt phương án.
```

Không giả lập success trước response backend.

---

# 120. Action Error UX

Ví dụ 409:

```text
Không thể thực hiện thao tác vì dữ liệu đã thay đổi.
```

Ví dụ 403:

```text
Bạn không có quyền thực hiện thao tác này.
```

---

# 121. Accessibility

Mọi screen phải hỗ trợ:

- keyboard navigation;
- visible focus;
- semantic labels;
- form labels;
- error association;
- accessible status;
- sufficient contrast;
- icon + text where needed.

---

# 122. Responsive Rules

## Desktop

```text
>= 1200px
```

Sidebar đầy đủ.

## Tablet

```text
768–1199px
```

Sidebar thu gọn hoặc overlay.

## Mobile

```text
< 768px
```

Navigation thành drawer/bottom pattern theo 27_UI_UX_SPECIFICATION.

Không để horizontal overflow toàn trang.

---

# 123. Table Responsive Rules

Nếu table quá rộng:

```text
Desktop → table
Mobile → card/list
```

Các field quan trọng phải được giữ:

```text
title/name
status
primary value
primary action
```

---

# 124. Mobile Form Rules

Form một cột.

Action bar:

```text
Cancel
Save
```

sticky bottom nếu cần và được 27_UI_UX_SPECIFICATION cho phép.

---

# 125. Global Search

## Route

```text
/search
```

Nếu global search được triển khai.

## Categories

```text
Members
Products
Lots
Finance
OCOP
Documents
```

Chỉ search entity có backend API.

---

# 126. Quick Actions

Dashboard có thể có:

```text
Thêm xã viên
Tạo mùa vụ
Ghi nhật ký
Tạo phiếu thu/chi
Tạo hồ sơ OCOP
Upload minh chứng
```

Chỉ hiển thị action có permission.

---

# 127. Breadcrumb

Ví dụ:

```text
Dashboard
→ Tài chính
→ Công nợ
→ Công nợ #CN001
```

Không dùng breadcrumb thay thế navigation.

---

# 128. Page Header Contract

Mỗi screen chính:

```text
Title
Description
Breadcrumb
Primary action
```

Detail:

```text
Title
Identifier
Status
Actions
```

---

# 129. Page Header Action Priority

Thứ tự:

```text
Primary
Secondary
More
```

Destructive action không đặt cạnh primary nếu có thể gây nhầm.

---

# 130. Modal Rules

Modal cho:

```text
Confirmation
Small focused action
Quick view
```

Không dùng modal cho form dài.

Form dài dùng full page hoặc drawer theo UX.

---

# 131. Drawer Rules

Drawer phù hợp:

```text
Audit detail
History
Quick detail
Filter
```

Không dùng drawer cho workflow phức tạp.

---

# 132. Toast Rules

Toast:

```text
success
warning
error
info
```

Không dùng toast cho lỗi cần user action dài; dùng inline/page error.

---

# 133. Notification Rules

Notification không được tự thay đổi business status.

Notification chỉ là presentation of backend event/task.

---

# 134. Permission Matrix Integration

Frontend route guard nên map:

```text
Route
→ Required permission
→ Backend API permission
```

Nhưng route guard không thay thế backend authorization.

---

# 135. No Orphan Screen

Không tạo screen nếu:

```text
không có use case
không có requirement
không có API
```

trừ màn hình thuần frontend như:

```text
404
403
loading
error
```

---

# 136. No Orphan API Usage

Không có component gọi API không được map đến:

```text
screen
use case
requirement
```

---

# 137. Screen-to-API Traceability

Mỗi screen implementation phải map:

```text
Screen
→ Use Case
→ Permission
→ API endpoint
→ Domain entity
→ Test
```

---

# 138. P0 Screens

MVP P0:

```text
SCR-AUTH-001 Login
SCR-DASH-001 Dashboard

SCR-MEMBER-001 Member List
SCR-MEMBER-002 Create Member
SCR-MEMBER-003 Member Detail
SCR-MEMBER-004 Edit Member
SCR-MEMBER-005 Capital Contributions

SCR-PROD-001 Production Units
SCR-PLOT-001 Farm Plots
SCR-SEASON-001 Crop Season List
SCR-SEASON-002 Crop Season Create
SCR-SEASON-003 Crop Season Detail
SCR-LOG-001 Farming Logs
SCR-LOG-002 Farming Log Create
SCR-LOG-003 Farming Log Detail
SCR-HARVEST-001 Harvest List
SCR-HARVEST-002 Harvest Create
SCR-HARVEST-003 Lot Detail

SCR-PRODUCT-001 Product List
SCR-PRODUCT-002 Product Create/Edit

SCR-INVENTORY-001 Warehouse List
SCR-INVENTORY-002 Stock Receipt List
SCR-INVENTORY-003 Stock Receipt Create
SCR-INVENTORY-004 Stock Issue
SCR-INVENTORY-005 Stock Count

SCR-FIN-001 Cash Transaction List
SCR-FIN-002 Create Cash Transaction
SCR-FIN-003 Cash Transaction Detail
SCR-FIN-004 Receivable/Payable List
SCR-FIN-005 Create Receivable/Payable
SCR-FIN-006 Debt Detail
SCR-FIN-007 Debt Settlement
SCR-FIN-008 Surplus Distribution List
SCR-FIN-009 Create Surplus Plan
SCR-FIN-010 Surplus Detail
SCR-FIN-011 Surplus Workflow

SCR-OCOP-001 OCOP Dashboard
SCR-OCOP-002 Dossier List
SCR-OCOP-003 Create Dossier
SCR-OCOP-004 Dossier Detail
SCR-OCOP-006 Product Information
SCR-OCOP-007 Criteria Versions
SCR-OCOP-008 Criteria Version Detail
SCR-OCOP-009 Criteria
SCR-OCOP-012 Evidence List
SCR-OCOP-013 Evidence Upload
SCR-OCOP-014 Evidence Detail
SCR-OCOP-016 Evaluation Workspace
SCR-OCOP-018 Score Input
SCR-OCOP-020 Evaluation Session List
SCR-OCOP-021 Evaluation Session Detail
SCR-OCOP-025 Consolidation
SCR-OCOP-026 Proposed Classification
SCR-OCOP-027 Final Decision

SCR-WORKFLOW-001 Workflow Inbox
SCR-NOTIFY-001 Notification Center
SCR-REPORT-001 Reports
SCR-DOC-001 Document Generation
SCR-AUDIT-001 Audit
```

P0 phải được ưu tiên theo dependency backend.

---

# 139. P1 Screens

P1 có thể gồm:

```text
SCR-OCOP-005 Dossier General Information
SCR-OCOP-010 Scoring Rules
SCR-OCOP-011 Mandatory Conditions
SCR-OCOP-015 Evidence Version
SCR-OCOP-017 Evidence Link
SCR-OCOP-019 Evaluation Progress
SCR-OCOP-022 Evaluator List
SCR-OCOP-023 Evaluator Assignment
SCR-OCOP-024 Score Review
SCR-OCOP-028 Council Level

SCR-REPORT-002 Report Detail
SCR-AUTH-002 Access Denied
SCR-ADMIN-001 User Management
SCR-ADMIN-002 Role Management
SCR-ADMIN-003 Permission Management
SCR-ADMIN-004 System Settings
```

---

# 140. P2 Screens

P2 chỉ triển khai khi requirement/API đã đủ:

```text
Global Search
Advanced dashboards
Advanced analytics
Additional exports
Additional convenience views
```

Không tự mở rộng scope.

---

# 141. Screen Dependency Graph

```text
Login
  ↓
Dashboard
  ↓
Members
  ↓
Capital Contributions
  ↓
Production Units
  ↓
Farm Plots
  ↓
Crop Seasons
  ↓
Farming Logs
  ↓
Harvest
  ↓
Lots
  ↓
Products
  ↓
Inventory
  ↓
Finance
  ↓
OCOP Dossier
  ↓
Criteria
  ↓
Evidence
  ↓
Evaluation
  ↓
Consolidation
  ↓
Classification
  ↓
Decision
  ↓
Reports / Documents / Audit
```

---

# 142. OCOP Screen Dependency Graph

```text
Criteria Version
      ↓
Criteria / Indicators
      ↓
Scoring Rules / Mandatory Conditions
      ↓
Dossier
      ↓
Evidence
      ↓
Evidence Link
      ↓
Evaluation Session
      ↓
Evaluator Assignment
      ↓
Score
      ↓
Consolidation
      ↓
Proposed Classification
      ↓
Final Decision
```

Không implement child screen trước khi dependency contract tồn tại.

---

# 143. Finance Screen Dependency Graph

```text
Cash Transaction
      ↓
Cash Balance

Receivable / Payable
      ↓
Settlement
      ↓
Cash Transaction (CASH)

Financial Year
      ↓
Surplus Plan
      ↓
Allocation Snapshot
```

---

# 144. Screen Data Ownership

Frontend state ownership:

```text
Server State
→ React Query/API layer

UI State
→ local component/store

Form State
→ form library/local state

Auth Session
→ auth/session layer
```

Không copy server state vào nhiều stores không cần thiết.

---

# 145. Cache Rules

Cache chỉ được sử dụng theo frontend architecture.

Các dữ liệu nhạy cảm với thay đổi:

```text
finance
workflow
evaluation
permissions
```

phải invalidate/refetch sau mutation.

---

# 146. Mutation Rules

Sau mutation:

```text
Create
→ invalidate list
→ navigate detail

Update
→ invalidate detail/list

Workflow action
→ refetch entity
→ refresh allowed actions

Settlement
→ refresh debt
→ refresh cash if visible

Surplus approve
→ refresh plan/allocation
```

Không tự mutate cache thành official result nếu backend chưa xác nhận.

---

# 147. Optimistic Update

Không dùng optimistic update cho side effects nhạy cảm nếu có nguy cơ làm UI hiển thị sai:

```text
POST cash
settlement
approve
financial allocation
evaluation score lock
final decision
```

Ưu tiên server-confirmed update.

---

# 148. Error Mapping

API error catalog sẽ được chuẩn hóa ở Document 29.

Trong Document 28:

Frontend chỉ cần map các nhóm:

```text
400 Validation
401 Unauthorized
403 Forbidden
404 Not Found
409 Conflict
422 Business Validation
429 Rate Limit if applicable
5xx Server
Network
```

Không hard-code raw backend message nếu không cần.

---

# 149. Loading Boundary

Mỗi screen có data dependency độc lập nên có loading boundary riêng.

Ví dụ Dossier Detail:

```text
Dossier Summary loading
Criteria loading
Evidence loading
Workflow loading
```

Không nhất thiết block toàn bộ page nếu chỉ một tab đang load.

---

# 150. Permission Boundary

Component-level:

```text
<Can permission="FINANCE.CREATE">
```

nhưng implementation phải dựa trên permission system đã định nghĩa.

Không tạo permission string mới tùy tiện.

---

# 151. Route Guard

Protected routes:

```text
Authenticated
+
Cooperative context
+
Permission where applicable
```

Backend vẫn phải enforce.

---

# 152. Cooperative Context

Nếu hệ thống multi-tenant:

Frontend phải giữ cooperative context theo architecture.

Không cho người dùng tự nhập `cooperative_id` vào URL/form để truy cập tenant khác.

---

# 153. Tenant Error

Nếu backend trả cross-tenant/not-found:

UI không được tiết lộ tenant existence ngoài contract.

---

# 154. Audit Visibility

Audit screen chỉ hiển thị event mà role được phép xem.

Không expose:

```text
password
access token
refresh token
secret
```

---

# 155. Security UX

Private files:

```text
View
Download
```

thông qua API/signed URL.

Frontend không lưu secret storage credentials.

---

# 156. Accessibility Status

Status phải có text:

```text
POSTED
```

không chỉ:

```text
green badge
```

---

# 157. Accessibility Forms

Mỗi input:

```text
label
name
error association
required indicator
```

Error phải được screen reader đọc được.

---

# 158. Accessibility Tables

Table:

```text
header cells
row association
action labels
```

Không dùng icon-only button thiếu accessible name.

---

# 159. Accessibility Modals

Modal phải:

```text
focus trap
close action
keyboard escape
title
```

nếu component library hỗ trợ.

---

# 160. Localization

Default:

```text
vi-VN
```

Text UI phải tách khỏi component logic để có thể localization.

Business codes có thể giữ nguyên:

```text
DRAFT
POSTED
ACTIVE
```

nhưng UI nên hiển thị label tiếng Việt.

---

# 161. Status Label Map

Baseline:

```text
DRAFT → Nháp
APPROVED → Đã phê duyệt
POSTED → Đã ghi sổ

OPEN → Đang mở
PARTIALLY_SETTLED → Thanh toán một phần
SETTLED → Đã thanh toán
OVERDUE → Quá hạn

SUBMITTED → Đã gửi
```

Các status khác phải lấy từ workflow/API và không tự invent.

---

# 162. Action Label Map

Baseline:

```text
Create → Thêm mới
Edit → Chỉnh sửa
View → Xem
Save → Lưu
Cancel → Hủy
Submit → Gửi duyệt
Approve → Phê duyệt
Reject → Từ chối
Return → Trả lại
Resubmit → Gửi lại
Post → Ghi sổ
Download → Tải xuống
Upload → Tải lên
```

---

# 163. Form Validation Message Style

Ví dụ:

```text
Trường này là bắt buộc.
Số tiền phải lớn hơn 0.
Dữ liệu không hợp lệ.
```

Không hiển thị raw SQL/database error.

---

# 164. Financial Validation UX

Ví dụ settlement:

```text
Số tiền thanh toán không được vượt quá
số dư công nợ còn lại.
```

Nhưng vẫn phải xử lý backend error nếu outstanding thay đổi giữa lúc mở form và submit.

---

# 165. Concurrency UX

Nếu transaction bị conflict:

```text
Dữ liệu đã thay đổi.
Vui lòng tải lại dữ liệu mới nhất.
```

Không tự retry financial mutation vô hạn.

---

# 166. Double Submit Prevention

Mọi mutation:

```text
submit
→ disable
→ loading
→ response
```

Nếu user reload sau khi submit thành công:

frontend phải xử lý trạng thái server hiện tại.

---

# 167. Retry Policy

Safe GET:

```text
có thể retry có kiểm soát
```

Financial mutation:

```text
không retry mù
```

Nếu API hỗ trợ idempotency key, frontend phải tuân thủ API contract.

---

# 168. Form Draft

Draft local chỉ được sử dụng nếu requirement cho phép.

Không lưu local storage:

```text
password
financial sensitive payload
private evidence
```

trừ khi security specification explicitly cho phép.

---

# 169. Unsaved Navigation

Khi form dirty:

```text
Bạn có thay đổi chưa lưu.
Bạn có chắc muốn rời trang?
```

---

# 170. Browser Refresh

Nếu đang:

```text
SUBMITTING
```

không giả định request vẫn chạy ở client.

Sau reload:

```text
refetch server state
```

---

# 171. Screen Performance

Không load toàn bộ:

```text
members
lots
evidences
criteria
audit
```

nếu dataset lớn.

Dùng:

```text
pagination
lazy loading
tabs
virtualization
```

khi architecture cho phép.

---

# 172. OCOP Large Criteria UX

Criteria list lớn phải:

```text
search/filter
group
collapse/expand
remember selected criterion
```

Không render hàng nghìn evidence/file preview cùng lúc.

---

# 173. Evidence Preview UX

Preview chỉ dùng khi MIME type/browser capability phù hợp.

Nếu không preview:

```text
Download
```

Không cố render file không hỗ trợ.

---

# 174. Document Download UX

Nếu document generation async:

```text
Generate
→ Queued
→ Processing
→ Completed
→ Download
```

Không giữ HTTP request lâu để chờ file nếu API đã thiết kế background job.

---

# 175. Report Export UX

Cho phép:

```text
Generate
View status
Download
```

Không tự tạo file ở browser nếu backend là source of truth.

---

# 176. Audit Detail UX

Audit detail có thể dùng drawer:

```text
Event
Actor
Timestamp
Entity
Before
After
Metadata
```

Metadata phải sanitize.

---

# 177. Empty OCOP Dossier

Nếu chưa có hồ sơ:

```text
Chưa có hồ sơ OCOP
Tạo hồ sơ
```

chỉ hiện create nếu có permission.

---

# 178. Missing Evidence UX

Trong Dossier:

```text
Minh chứng thiếu: 5
```

Click:

```text
→ Evidence tab
→ filtered criteria
```

Nếu API hỗ trợ deep link/filter.

---

# 179. Criteria Missing Data UX

Nếu criterion chưa đủ dữ liệu:

```text
Chưa đủ thông tin
```

Không tự đánh dấu fail nếu backend chưa kết luận.

---

# 180. Evaluation Readonly UX

Nếu evaluator không có quyền sửa:

```text
Score read-only
```

Không hiển thị edit action.

---

# 181. Final Decision Readonly UX

Sau final decision nếu backend khóa:

```text
Locked
```

UI không cho chỉnh sửa.

---

# 182. Historical Data UX

Các record lịch sử phải có:

```text
Historical
Locked
Snapshot
```

nếu API/domain cung cấp.

Không dùng current master data để overwrite historical display.

---

# 183. Finance Historical UX

Surplus allocation phải hiển thị snapshot.

Ví dụ:

```text
Dữ liệu phân phối được lưu tại thời điểm lập phương án.
```

Chỉ hiển thị explanatory text nếu specification/UX yêu cầu.

---

# 184. Global Date Range UX

Date range:

```text
From
To
```

Validation:

```text
From <= To
```

---

# 185. Filter Persistence

Filter có thể giữ trong URL nếu architecture hỗ trợ.

Khi rời screen và quay lại:

```text
restore filter
```

chỉ khi behavior đã được thống nhất.

---

# 186. Navigation After Create

Default:

```text
Create success
→ Detail
```

Không redirect về list nếu user cần tiếp tục workflow.

---

# 187. Navigation After Delete

Nếu delete được support:

```text
success
→ parent list
```

Nhưng destructive action chỉ được implement nếu domain/API cho phép.

---

# 188. Delete Rules

Không tự thêm delete vào mọi CRUD.

Chỉ có delete nếu:

```text
requirement
+
domain
+
API
+
permission
```

đều hỗ trợ.

---

# 189. Status Edit Rules

Không cho:

```text
PATCH status
```

để thay thế workflow action nếu API định nghĩa action endpoint.

---

# 190. Frontend Calculation Rules

Frontend có thể tính:

```text
display subtotal
form preview
```

nếu UX yêu cầu.

Frontend không được là source of truth cho:

```text
cash balance
official surplus allocation
official OCOP score
final classification
financial totals
```

---

# 191. API Contract Fidelity

Frontend phải:

```text
match method
match path
match payload
match response
match pagination
match errors
```

Không tự rename backend fields trong network layer nếu không có mapping rõ ràng.

---

# 192. DTO Mapping

Nếu API snake_case:

```text
member_id
cooperative_id
```

frontend có thể map sang camelCase ở boundary nếu coding standard quy định.

Không để mapping rải rác toàn component.

---

# 193. Query Key Rules

Query keys phải chứa đủ context:

```text
cooperative
resource
filters
id
```

để tránh cache leakage giữa tenant/resource.

---

# 194. Cache Isolation

Không dùng query cache key:

```text
["members"]
```

nếu nhiều cooperative có thể cùng session/cache.

Phải theo frontend architecture và tenant context.

---

# 195. Unauthorized State

Nếu token/session hết hạn:

```text
401
→ clear session
→ login
```

Không hiển thị stale protected data như thể vẫn authenticated.

---

# 196. Forbidden State

403:

```text
Bạn không có quyền truy cập chức năng này.
```

Không redirect mọi 403 thành 404 nếu UX/security contract không quy định.

---

# 197. Not Found State

404 entity:

```text
Không tìm thấy dữ liệu.
```

Actions:

```text
Quay lại
Về danh sách
```

---

# 198. Screen Acceptance Checklist

Mỗi screen phải đạt:

```text
[ ] Route
[ ] Permission
[ ] API mapping
[ ] Loading
[ ] Empty
[ ] Error
[ ] Forbidden
[ ] Validation
[ ] Success
[ ] Responsive
[ ] Accessibility
[ ] Audit/workflow where applicable
[ ] No invented business rules
```

---

# 199. Feature Acceptance

## Member

```text
List
Create
Detail
Edit
Capital
```

## Production

```text
Unit
Plot
Season
Log
Harvest
Lot
```

## Inventory

```text
Warehouse
Receipt
Issue
Count
```

## Finance

```text
Cash
Debt
Settlement
Surplus
Workflow
```

## OCOP

```text
Dossier
Criteria
Evidence
Evaluation
Consolidation
Classification
Decision
```

---

# 200. Frontend Test Mapping

Mỗi screen P0 phải có ít nhất:

```text
render test
permission test
loading/empty/error test
main interaction test
form validation test if form
API success/error handling
```

Workflow screens cần:

```text
allowed action
forbidden action
invalid transition
```

---

# 201. Finance Test Mapping

Finance UI phải test:

```text
Cash list
Cash create
Cash detail
Approve
Post
Debt create
Debt detail
Settlement
Over-settlement error
Surplus create
Surplus detail
Submit
Approve
```

Không mock frontend thành công nếu API contract không khớp.

---

# 202. OCOP Test Mapping

OCOP UI phải test:

```text
Dossier list
Dossier create
Dossier detail
Criteria selection
Evidence upload
Evidence version
Evidence link
Score entry
Score lock
Evaluation session
Consolidation
Proposed classification
Final decision
```

---

# 203. E2E Candidate Flow

Một flow demo chính:

```text
Login
→ Dashboard
→ Add Member
→ Add Production Unit
→ Add Farm Plot
→ Create Crop Season
→ Add Farming Log
→ Add Material Usage
→ Harvest
→ Lot
→ Product
→ Inventory
→ Finance
→ Create Surplus Plan
→ OCOP Dossier
→ Evidence
→ Evaluation
→ Consolidation
→ Decision
```

Chỉ đưa bước vào E2E khi backend APIs tương ứng đã hoàn thành.

---

# 204. Current Implementation Gate

Theo implementation roadmap, frontend phải triển khai theo dependency.

Không triển khai toàn bộ screen cùng lúc.

Khuyến nghị:

```text
F0 Bootstrap
→ F1 Shell
→ F2 Auth
→ F3 Members
→ F4 Production
→ F5 Inventory
→ F6 Finance
→ F7 OCOP Dossier/Criteria/Evidence
→ F8 Evaluation/Workflow
→ F9 Reports/Documents/Audit
```

---

# 205. AI Coding Agent Screen Rules

AI Coding Agent MUST:

1. Đọc Document 27 trước khi implement screen.
2. Đọc API specification liên quan.
3. Đọc authorization.
4. Kiểm tra domain.
5. Không invent fields.
6. Không invent status.
7. Không invent permission.
8. Không invent endpoint.
9. Không hard-code official calculations.
10. Không bypass backend authorization.
11. Không tạo orphan screens.
12. Không tự triển khai task tiếp theo.

---

# 206. AI Must Not Invent UI Business Logic

Không được tự thêm:

```text
automatic eligibility
automatic OCOP star classification
automatic financial approval
automatic settlement behavior
automatic PHI rules
automatic evidence validity
```

nếu specification/backend chưa định nghĩa.

---

# 207. AI Must Not Invent Status

Nếu API trả:

```text
status
```

frontend phải map status từ contract.

Không tự thêm:

```text
PENDING_REVIEW
WAITING
COMPLETED
```

chỉ vì thấy UX cần.

Nếu cần status chưa được đặc tả:

```text
TO_VERIFY
```

---

# 208. AI Must Not Invent Permission

Permission phải lấy từ:

```text
15_AUTHORIZATION_MATRIX.md
```

Không tạo:

```text
OCOP.MANAGE
FINANCE.APPROVE
```

nếu chưa có source.

---

# 209. AI Must Not Invent Endpoints

Ví dụ không tự tạo:

```text
POST /cash-transactions/{id}/cancel
```

nếu API specification chưa có.

---

# 210. Screen Change Impact

Nếu thay đổi một screen:

Kiểm tra:

```text
route
component
API
permission
test
navigation
documentation
```

---

# 211. API Change Impact

Nếu API thay đổi:

```text
API client
DTO
query
mutation
screen
test
```

phải được rà soát.

---

# 212. Permission Change Impact

Nếu permission thay đổi:

```text
route guard
component guard
action buttons
tests
```

phải được rà soát.

---

# 213. Workflow Change Impact

Nếu workflow thay đổi:

```text
status badges
allowed actions
confirmation
timeline
tests
```

phải được rà soát.

---

# 214. Criteria Version Change Impact

Nếu criteria version thay đổi:

```text
criteria selector
evaluation workspace
score input
evidence linking
progress
```

không được cache nhầm version.

---

# 215. Tenant Change Impact

Nếu cooperative context thay đổi:

```text
clear/invalidate protected queries
refetch
reset relevant forms
```

Không hiển thị data tenant cũ.

---

# 216. Frontend Security Baseline

Không lưu:

```text
password
secret
storage credential
private signing key
```

trong browser storage.

Token handling phải theo Document 24/14.

---

# 217. XSS Baseline

Không render arbitrary HTML từ API nếu không sanitize.

Không dùng dangerouslySetInnerHTML cho user-generated content trừ khi có sanitization contract.

---

# 218. File Security

Không trust filename/MIME từ client.

Backend validation vẫn bắt buộc.

---

# 219. Audit Security

Không cho user sửa/xóa audit từ frontend nếu backend không hỗ trợ.

Audit UI là read-only theo baseline.

---

# 220. Finance Security

Không hiển thị financial data cho user thiếu permission.

Không dựa vào frontend filtering để bảo vệ dữ liệu.

---

# 221. OCOP Security

Evidence/download phải respect authorization.

Không expose private evidence through public URL.

---

# 222. Accessibility Acceptance

Mỗi P0 screen:

```text
[ ] Keyboard accessible
[ ] Form labels
[ ] Focus visible
[ ] Status text
[ ] Accessible button names
[ ] Error association
```

---

# 223. Responsive Acceptance

Mỗi P0 screen:

```text
[ ] Desktop
[ ] Tablet
[ ] Mobile
[ ] No unintended overflow
[ ] Primary actions reachable
```

---

# 224. Performance Acceptance

P0 list:

```text
server pagination
```

P0 detail:

```text
lazy tabs where appropriate
```

Large OCOP criteria:

```text
avoid rendering entire tree unnecessarily
```

---

# 225. UI Consistency Acceptance

All screens use shared:

```text
PageHeader
DataTable
FormField
StatusBadge
ConfirmDialog
EmptyState
ErrorState
LoadingState
Pagination
FileUploader
WorkflowActions
```

Tên component thực tế phải theo Document 24/25.

---

# 226. Screen Naming Convention

React components:

```text
MemberListPage
MemberCreatePage
MemberDetailPage
```

hoặc convention đã được Document 25 quy định.

Không trộn nhiều naming styles.

---

# 227. Folder Convention

Screen code phải tuân theo Document 24 frontend architecture.

Ví dụ concept:

```text
features/
  members/
    pages/
    components/
    hooks/
    api/
    types/
```

Không tự thay đổi architecture trong screen task.

---

# 228. No Business Logic in Presentation

Page component không chứa:

```text
official financial formula
OCOP score formula
tenant authorization decision
workflow transition rules
```

Các logic cần thiết phải nằm ở appropriate frontend application layer hoặc backend.

---

# 229. Screen-level Error Boundary

Critical route groups nên có error boundary:

```text
Finance
OCOP
Reports
Documents
```

theo frontend architecture.

---

# 230. Observability UX

Nếu backend trả:

```text
request_id
correlation_id
```

có thể hiển thị trong technical error detail hoặc log context, nhưng không đưa raw technical data vào normal user UI.

---

# 231. Final Screen Traceability Template

Mỗi implemented screen phải có record:

```text
Screen ID:
Route:
Use Case:
Requirement:
Permission:
API:
Domain Entity:
Workflow:
States:
Tests:
```

---

# 232. Example Traceability

```text
SCR-FIN-007
Route:
/finance/receivables-payables/:id/settlements

Use Case:
Thanh toán công nợ

Permission:
FINANCE.CREATE

API:
POST /api/v1/receivable-payables/{debt_id}/settlements

Domain:
DebtSettlement

Critical Rules:
amount > 0
amount <= outstanding_amount

Tests:
Settlement success
Over-settlement rejection
Concurrent settlement
```

---

# 233. Example OCOP Traceability

```text
SCR-OCOP-016
Route:
/ocop/dossiers/:id/evaluation

Domain:
OCOP Dossier / Evaluation

Dependencies:
Criteria
Evidence
Evaluation Session

Critical Rules:
criteria version aware
evidence linked
score backend validated
workflow permission enforced
```

---

# 234. Definition of Done — Screen

A screen is DONE only when:

```text
[ ] Screen ID exists
[ ] Route implemented
[ ] API mapped
[ ] Permission mapped
[ ] Loading handled
[ ] Empty handled
[ ] Error handled
[ ] Forbidden handled
[ ] Form validation handled
[ ] Mutation success handled
[ ] Mutation failure handled
[ ] Responsive
[ ] Accessibility baseline
[ ] Tests pass
[ ] No invented business rule
[ ] No orphan API
[ ] No orphan permission
```

---

# 235. Definition of Done — Finance UI

Finance UI is DONE only when:

```text
[ ] Cash Balance comes from backend
[ ] POSTED state reflected correctly
[ ] Debt settlement handles 400/422/409
[ ] Over-settlement message
[ ] No duplicate submit
[ ] Surplus snapshot displayed
[ ] Workflow actions permission-aware
[ ] Financial amounts use correct formatting
[ ] Tests pass
```

---

# 236. Definition of Done — OCOP UI

OCOP UI is DONE only when:

```text
[ ] Dossier
[ ] Criteria Version
[ ] Criteria
[ ] Evidence
[ ] Evidence Version
[ ] Evidence Link
[ ] Evaluation
[ ] Score
[ ] Evaluation Session
[ ] Consolidation
[ ] Proposed Classification
[ ] Final Decision
```

được map rõ tới API/domain/workflow.

---

# 237. MVP Demo Screen Order

Demo frontend theo thứ tự:

```text
1. Login
2. Dashboard
3. Member List
4. Member Detail
5. Production Unit
6. Farm Plot
7. Crop Season
8. Farming Log
9. Harvest/Lot
10. Product
11. Inventory
12. Cash
13. Debt
14. Settlement
15. Surplus
16. OCOP Dossier
17. Criteria
18. Evidence
19. Evaluation
20. Consolidation
21. Final Decision
22. Reports
23. Audit
```

---

# 238. Frontend Implementation Sequence

Không code theo số screen đơn thuần.

Ưu tiên:

```text
Shared Shell
→ Auth
→ Shared Components
→ Members
→ Production
→ Inventory
→ Finance
→ OCOP Dossier
→ Criteria
→ Evidence
→ Evaluation
→ Workflow
→ Reports/Documents/Audit
```

---

# 239. Current Backend Dependency

Finance backend đã có báo cáo implementation với:

```text
Cash Transactions
Receivable/Payable
Debt Settlement
Surplus Distribution
```

Frontend Finance chỉ được implement dựa trên API contract thực tế và không được suy diễn thêm business rules.

OCOP frontend phải chờ/đối chiếu backend OCOP APIs tương ứng trước khi hoàn thiện.

---

# 240. Important Finance UI Notes

Cash balance:

```text
Σ POSTED INCOME - Σ POSTED EXPENSE
```

là backend source of truth.

Surplus allocation:

```text
Capital Share
+
Service Share
=
Total Allocation
```

phải hiển thị từ backend snapshot.

Frontend không tự tính lại official allocation để thay thế backend result.

---

# 241. Important OCOP Policy Notes

OCOP workflow/council level/criteria phải là policy-aware.

Không hard-code UI theo một cấu trúc council level cố định.

Criteria, scoring rules, workflow và templates phải có version awareness nếu API/domain yêu cầu.

---

# 242. No Automatic Next Task

AI Coding Agent sau khi hoàn thành một screen group phải:

```text
STOP
→ report
```

Không tự triển khai screen group kế tiếp.

---

# 243. Required Agent Report After Screen Task

Agent phải báo:

```text
A. Screen IDs implemented
B. Routes
C. Components
D. API endpoints used
E. Permissions
F. Workflow states/actions
G. Validation
H. Loading/empty/error/403/409 states
I. Responsive behavior
J. Accessibility
K. Tests
L. Changed files
M. GAP
N. CONFLICT
O. TO_VERIFY
P. Technical Debt
Q. Next Recommended Task
```

---

# 244. Screen Review Checklist

## Structure

```text
[ ] Correct route
[ ] Correct page title
[ ] Breadcrumb
[ ] Correct layout
```

## Data

```text
[ ] Correct API
[ ] Correct fields
[ ] Correct pagination
[ ] Correct formatting
```

## Business

```text
[ ] No invented rules
[ ] No invented statuses
[ ] No invented permissions
[ ] No invented endpoints
```

## Security

```text
[ ] Permission-aware
[ ] Tenant-safe
[ ] No secret exposure
```

## UX

```text
[ ] Loading
[ ] Empty
[ ] Error
[ ] Confirmation
[ ] Success
```

## Quality

```text
[ ] Responsive
[ ] Accessible
[ ] Tests
```

---

# 245. Final Screen Inventory

| ID | Screen | Priority | Main Domain |
|---|---|---|---|
| SCR-AUTH-001 | Login | P0 | Auth |
| SCR-DASH-001 | Dashboard | P0 | Cross-domain |
| SCR-MEMBER-001 | Member List | P0 | Member |
| SCR-MEMBER-002 | Create Member | P0 | Member |
| SCR-MEMBER-003 | Member Detail | P0 | Member |
| SCR-MEMBER-004 | Edit Member | P0 | Member |
| SCR-MEMBER-005 | Capital Contributions | P0 | Finance/Member |
| SCR-PROD-001 | Production Units | P0 | Production |
| SCR-PLOT-001 | Farm Plots | P0 | Production |
| SCR-SEASON-001 | Crop Seasons | P0 | Production |
| SCR-SEASON-002 | Create Season | P0 | Production |
| SCR-SEASON-003 | Season Detail | P0 | Production |
| SCR-LOG-001 | Farming Logs | P0 | Production |
| SCR-LOG-002 | Create Log | P0 | Production |
| SCR-LOG-003 | Log Detail | P0 | Production |
| SCR-HARVEST-001 | Harvest List | P0 | Production |
| SCR-HARVEST-002 | Create Harvest | P0 | Production |
| SCR-HARVEST-003 | Lot Detail | P0 | Traceability |
| SCR-PRODUCT-001 | Product List | P0 | Product |
| SCR-PRODUCT-002 | Product Form | P0 | Product |
| SCR-INVENTORY-001 | Warehouse | P0 | Inventory |
| SCR-INVENTORY-002 | Stock Receipt | P0 | Inventory |
| SCR-INVENTORY-003 | Create Receipt | P0 | Inventory |
| SCR-INVENTORY-004 | Stock Issue | P0 | Inventory |
| SCR-INVENTORY-005 | Stock Count | P0 | Inventory |
| SCR-FIN-001 | Cash List | P0 | Finance |
| SCR-FIN-002 | Create Cash | P0 | Finance |
| SCR-FIN-003 | Cash Detail | P0 | Finance |
| SCR-FIN-004 | Debt List | P0 | Finance |
| SCR-FIN-005 | Create Debt | P0 | Finance |
| SCR-FIN-006 | Debt Detail | P0 | Finance |
| SCR-FIN-007 | Settlement | P0 | Finance |
| SCR-FIN-008 | Surplus List | P0 | Finance |
| SCR-FIN-009 | Create Surplus | P0 | Finance |
| SCR-FIN-010 | Surplus Detail | P0 | Finance |
| SCR-FIN-011 | Surplus Workflow | P0 | Finance |
| SCR-OCOP-001 | OCOP Dashboard | P0 | OCOP |
| SCR-OCOP-002 | Dossier List | P0 | OCOP |
| SCR-OCOP-003 | Create Dossier | P0 | OCOP |
| SCR-OCOP-004 | Dossier Detail | P0 | OCOP |
| SCR-OCOP-005 | General Information | P1 | OCOP |
| SCR-OCOP-006 | Product Information | P0 | OCOP |
| SCR-OCOP-007 | Criteria Versions | P0 | OCOP |
| SCR-OCOP-008 | Criteria Version Detail | P0 | OCOP |
| SCR-OCOP-009 | Criteria | P0 | OCOP |
| SCR-OCOP-010 | Scoring Rules | P1 | OCOP |
| SCR-OCOP-011 | Mandatory Conditions | P1 | OCOP |
| SCR-OCOP-012 | Evidence List | P0 | OCOP |
| SCR-OCOP-013 | Evidence Upload | P0 | OCOP |
| SCR-OCOP-014 | Evidence Detail | P0 | OCOP |
| SCR-OCOP-015 | Evidence Version | P1 | OCOP |
| SCR-OCOP-016 | Evaluation Workspace | P0 | OCOP |
| SCR-OCOP-017 | Evidence Link | P1 | OCOP |
| SCR-OCOP-018 | Score Input | P0 | OCOP |
| SCR-OCOP-019 | Evaluation Progress | P1 | OCOP |
| SCR-OCOP-020 | Evaluation Sessions | P0 | OCOP |
| SCR-OCOP-021 | Evaluation Session Detail | P0 | OCOP |
| SCR-OCOP-022 | Evaluators | P1 | OCOP |
| SCR-OCOP-023 | Evaluator Assignment | P1 | OCOP |
| SCR-OCOP-024 | Score Review | P1 | OCOP |
| SCR-OCOP-025 | Consolidation | P0 | OCOP |
| SCR-OCOP-026 | Proposed Classification | P0 | OCOP |
| SCR-OCOP-027 | Final Decision | P0 | OCOP |
| SCR-OCOP-028 | Council Level | P1 | OCOP |
| SCR-WORKFLOW-001 | Workflow Inbox | P0 | Workflow |
| SCR-NOTIFY-001 | Notification Center | P0 | Notification |
| SCR-REPORT-001 | Reports | P0 | Reporting |
| SCR-REPORT-002 | Report Detail | P1 | Reporting |
| SCR-DOC-001 | Documents | P0 | Documents |
| SCR-AUDIT-001 | Audit Log | P0 | Audit |
| SCR-ADMIN-001 | Users | P1 | Admin |
| SCR-ADMIN-002 | Roles | P1 | Admin |
| SCR-ADMIN-003 | Permissions | P1 | Admin |
| SCR-ADMIN-004 | Settings | P1 | Admin |

---

# 246. Final Contract

Document 28 establishes the frontend screen inventory and screen-level behavior baseline.

AI Coding Agent MUST treat:

```text
00–27
+
28
```

as the frontend specification baseline.

Priority order:

```text
Business Requirements
→ Functional Requirements
→ Domain Model
→ API Specification
→ Authorization
→ Workflow
→ UI/UX
→ Screen Specification
→ Implementation
```

If a lower-level document conflicts with a higher-level source:

```text
STOP
→ report CONFLICT
→ do not silently choose
```

Frontend must remain:

```text
consistent
permission-aware
tenant-aware
workflow-aware
responsive
accessible
testable
```

and must never become the source of truth for protected business rules.

---

# 247. Next Document

```text
29_API_ERROR_CATALOG.md
```

Document 29 will standardize API error codes and frontend error mapping.

