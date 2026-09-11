# 27_UI_UX_SPECIFICATION.md

# UI/UX Specification
## Hệ thống quản lý hoạt động Hợp tác xã nông nghiệp và số hóa hồ sơ đánh giá, phân hạng OCOP

---

## 1. Document Information

| Field | Value |
|---|---|
| Document ID | 27 |
| Document Name | UI/UX Specification |
| Project | Xây dựng Hệ thống quản lý hoạt động Hợp tác xã nông nghiệp và số hóa hồ sơ đánh giá, phân hạng OCOP |
| Layer | Frontend / UI/UX |
| Status | Baseline |
| Audience | AI Coding Agent, UI/UX Designer, Frontend Developer, Tester |
| Depends On | 00–26 |
| Next Document | 28_FRONTEND_SCREEN_SPECIFICATION.md |

---

# 2. Purpose

Tài liệu này định nghĩa ngôn ngữ giao diện và các pattern UX dùng chung cho toàn hệ thống.

Mục tiêu:

- giao diện thống nhất;
- dễ sử dụng cho cán bộ HTX;
- giảm thao tác sai;
- hiển thị trạng thái nghiệp vụ rõ ràng;
- hỗ trợ desktop và responsive;
- hỗ trợ workflow;
- hỗ trợ hồ sơ OCOP và minh chứng;
- bảo đảm accessibility cơ bản;
- giúp AI Coding Agent không tự thiết kế mỗi màn hình theo một phong cách khác nhau.

Tài liệu này định nghĩa **design baseline**, không thay thế screen specification chi tiết.

---

# 3. UX Principles

## 3.1. Clarity

Người dùng phải biết:

```text
Tôi đang ở đâu?
Tôi đang xem dữ liệu gì?
Dữ liệu đang ở trạng thái nào?
Tôi có thể làm gì?
Điều gì sẽ xảy ra nếu tôi bấm?
```

---

## 3.2. Consistency

Cùng một loại hành động phải có cùng:

- vị trí;
- tên;
- icon;
- màu semantic;
- feedback.

---

## 3.3. Progressive Disclosure

Không hiển thị tất cả thông tin cùng lúc.

Ưu tiên:

```text
Summary
→ Important details
→ Advanced details
→ History
```

---

## 3.4. Error Prevention

Ưu tiên ngăn lỗi trước khi submit:

```text
Clear label
→ Validation
→ Confirmation
→ Backend validation
```

---

## 3.5. Data Integrity UX

UI phải làm người dùng nhận biết rõ:

```text
Draft
Submitted
Under Review
Needs Revision
Approved
Rejected
Locked
```

Không dùng màu sắc đơn thuần để truyền tải status.

---

# 4. Primary Users

Baseline personas:

## 4.1. HTX Manager

Cần:

- dashboard;
- thành viên;
- sản xuất;
- vật tư;
- tài chính;
- OCOP;
- báo cáo.

---

## 4.2. Staff

Cần:

- nhập dữ liệu;
- tra cứu;
- cập nhật nghiệp vụ thuộc quyền;
- theo dõi trạng thái.

---

## 4.3. OCOP Officer

Cần:

- hồ sơ;
- tiêu chí;
- minh chứng;
- tiến độ;
- thiếu hồ sơ;
- workflow.

---

## 4.4. Evaluator / Evaluation User

Cần:

- danh sách hồ sơ được giao;
- tiêu chí;
- minh chứng;
- nhập điểm;
- nhận xét;
- trạng thái đánh giá.

---

## 4.5. Administrator

Cần:

- người dùng;
- quyền;
- cấu hình;
- audit;
- system status.

Các persona/role thực tế phải đối chiếu với `05_ACTORS_AND_ROLES.md` và `15_AUTHORIZATION_MATRIX.md`.

---

# 5. Information Architecture

Navigation baseline:

```text
Dashboard

HTX
├── Thông tin HTX
└── Thành viên

Sản xuất
├── Đơn vị sản xuất
├── Vùng trồng
├── Mùa vụ
├── Nhật ký sản xuất
└── Thu hoạch / Lô

Sản phẩm
├── Sản phẩm
└── Danh mục liên quan

Kho
├── Kho
├── Nhập kho
├── Xuất kho
├── Điều chỉnh
└── Kiểm kê

Tài chính
├── Giao dịch
├── Phải thu
├── Phải trả
├── Quyết toán
└── Phân phối kết quả

OCOP
├── Hồ sơ
├── Tiêu chí
├── Minh chứng
├── Đánh giá
└── Quyết định

Báo cáo

Audit
```

Menu thực tế phải ẩn/hiện theo permission và scope.

Không hiển thị menu mà user chắc chắn không có quyền truy cập nếu authorization contract yêu cầu permission-aware navigation.

---

# 6. Application Layout

Desktop baseline:

```text
┌────────────────────────────────────────────────────┐
│ Header                                             │
├───────────────┬────────────────────────────────────┤
│ Sidebar       │ Breadcrumb                         │
│               │ Page Header                        │
│ Navigation    │                                    │
│               │ Main Content                       │
│               │                                    │
│               │                                    │
└───────────────┴────────────────────────────────────┘
```

---

# 7. Header

Header có thể gồm:

```text
Logo / Product Name
Search (nếu có)
Notifications
Current User
User Menu
```

Không đưa quá nhiều chức năng vào header.

---

# 8. Sidebar

Sidebar:

- group theo module;
- icon nhất quán;
- active state rõ;
- collapse trên desktop nếu cần;
- drawer trên mobile.

Không dùng quá nhiều cấp menu.

Khuyến nghị:

```text
Module
  → Screen
```

tối đa 2–3 cấp.

---

# 9. Breadcrumb

Breadcrumb ví dụ:

```text
OCOP / Hồ sơ / HS-OCOP-001
```

Breadcrumb giúp:

- định vị;
- quay lại danh sách;
- hiểu hierarchy.

Không đưa sensitive information vào breadcrumb.

---

# 10. Page Header

Page header chuẩn:

```text
[Title]
[Description]

                         [Primary Action]
```

Nếu có nhiều action:

```text
[Secondary] [Secondary] [Primary]
```

Destructive action không nên đặt ngang hàng với primary action nếu UX có thể gây nhầm.

---

# 11. Primary Button

Dùng cho:

- Create;
- Save;
- Submit;
- Confirm action chính.

Tên phải là động từ:

```text
Thêm xã viên
Lưu thay đổi
Gửi hồ sơ
Xác nhận
```

Không dùng:

```text
OK
Submit
Action
```

nếu người dùng Việt Nam là audience chính.

---

# 12. Secondary Button

Dùng cho:

- Cancel;
- Back;
- Filter;
- Secondary action.

Ví dụ:

```text
Hủy
Quay lại
Lọc
```

---

# 13. Destructive Action

Dùng cho:

- deactivate;
- reject;
- delete nếu có;
- cancel;
- destructive workflow action.

Phải có:

```text
clear label
+
confirmation
```

Ví dụ:

```text
Từ chối hồ sơ
```

thay vì:

```text
Delete
```

---

# 14. Action Group

Khi nhiều action:

```text
[Save] [Cancel]
```

hoặc:

```text
[More]
 ├── Return
 ├── Reject
 └── Archive
```

Không đặt 6–8 nút ngang nhau.

---

# 15. Status Badge

Status badge dùng semantic label.

Ví dụ:

```text
Nháp
Đã gửi
Đang thẩm tra
Cần bổ sung
Đang đánh giá
Đã phê duyệt
Từ chối
Đã khóa
```

Mỗi status phải có:

```text
text
+
visual semantic
```

Không phụ thuộc chỉ vào màu.

---

# 16. Status Colors

Color palette phải được quyết định trong design system implementation.

Semantic categories:

```text
Neutral
Info
Success
Warning
Danger
```

Không gắn màu tùy tiện cho từng page.

---

# 17. Typography

Typography hierarchy:

```text
Page title
Section title
Card title
Body
Caption
Helper text
Error
```

Nguyên tắc:

- dễ đọc;
- line-height phù hợp;
- không quá nhiều font weight;
- không dùng font size quá nhỏ.

---

# 18. Color System

Baseline semantic palette:

```text
Primary
Secondary
Success
Warning
Danger
Info
Neutral
Background
Surface
Border
Text
Muted Text
```

Màu cụ thể sẽ được chốt khi triển khai design system.

Không hard-code màu rải rác trong component.

---

# 19. Spacing

Dùng spacing scale thống nhất.

Ví dụ:

```text
4
8
12
16
24
32
40
48
```

Không dùng:

```text
margin: 13px
margin: 17px
margin: 23px
```

một cách tùy tiện.

---

# 20. Cards

Card phù hợp để hiển thị:

- summary;
- statistics;
- related information;
- compact sections.

Không biến mọi component thành card.

---

# 21. Dashboard

Dashboard nên ưu tiên:

```text
KPI
↓
Pending work
↓
Alerts
↓
Recent activity
↓
Charts
```

Ví dụ KPI:

```text
Số xã viên
Diện tích sản xuất
Sản phẩm
Tồn kho
Hồ sơ OCOP
Hồ sơ cần xử lý
```

Chỉ hiển thị metric có API/requirement.

---

# 22. Dashboard KPI

KPI card:

```text
┌────────────────────┐
│ Xã viên            │
│ 128                │
│ +5 tháng này       │
└────────────────────┘
```

Nếu không có baseline/comparison đáng tin cậy:

> Không hiển thị phần tăng/giảm giả định.

---

# 23. Tables

Table baseline:

```text
Toolbar
Filters
Table
Pagination
```

Columns phải ưu tiên thông tin quan trọng.

Không tạo 15–20 columns nếu user khó đọc.

---

# 24. Table Toolbar

Có thể gồm:

```text
Search
Filter
Sort
Export
Create
```

Primary action đặt ở bên phải nếu layout phù hợp.

---

# 25. Table Row Actions

Ưu tiên:

```text
View
Edit
More
```

Destructive actions nằm trong `More`.

---

# 26. Table Loading

Loading lớn:

```text
Skeleton rows
```

Loading nhỏ:

```text
Spinner
```

Không làm layout nhảy mạnh khi data về.

---

# 27. Empty Table

Nếu chưa có dữ liệu:

```text
Chưa có dữ liệu
[Thêm mới]
```

Nếu filter không có kết quả:

```text
Không tìm thấy dữ liệu phù hợp.
[Đặt lại bộ lọc]
```

Hai trường hợp phải khác nhau.

---

# 28. Pagination UX

Hiển thị:

```text
Tổng: 128
[1] [2] [3] ... [13]
```

Nếu API hỗ trợ:

```text
20 / trang
```

Người dùng có thể chọn page size.

---

# 29. Search UX

Search placeholder phải cụ thể:

```text
Tìm theo mã hoặc tên xã viên...
```

Không:

```text
Search...
```

nếu audience chính là tiếng Việt.

---

# 30. Filters

Filter panel có thể gồm:

```text
Trạng thái
Ngày
Mùa vụ
Sản phẩm
Kho
```

Tùy module.

Có:

```text
Áp dụng
Xóa bộ lọc
```

nếu UX dùng applied filters.

---

# 31. Forms

Form chuẩn:

```text
Section
Label
Input
Helper
Error
```

Required field:

```text
Họ và tên *
```

Không dùng placeholder thay cho label.

---

# 32. Form Layout

Desktop:

```text
Label | Input
Label | Input
Label | Input
```

hoặc:

```text
[Input] [Input]
[Input] [Input]
```

Mobile:

```text
[Input]
[Input]
[Input]
```

---

# 33. Form Sections

Form dài nên chia:

```text
Thông tin cơ bản
Thông tin liên hệ
Thông tin sản xuất
Thông tin bổ sung
```

OCOP application nên chia theo nhóm criteria/sections từ API.

---

# 34. Unsaved Changes

Nếu form có dữ liệu chưa lưu:

```text
Rời trang?
Bạn có thay đổi chưa được lưu.
[Ở lại] [Rời trang]
```

Chỉ bật khi thực sự có dirty state.

---

# 35. Form Submission

Khi submit:

```text
Button → loading
```

Không cho double submit.

Success:

```text
Toast / inline confirmation
→ update/refetch
→ navigate nếu flow yêu cầu
```

---

# 36. Validation Message

Thông báo phải:

- ngắn;
- rõ;
- chỉ ra cách sửa.

Ví dụ:

```text
Số lượng phải lớn hơn 0.
```

Không:

```text
Invalid value.
```

---

# 37. Date Picker

Date picker phải:

- locale phù hợp;
- format thống nhất;
- rõ date vs datetime;
- không cho ngày không hợp lệ nếu business rule cấm.

---

# 38. Number Input

Với:

```text
quantity
area
percentage
score
```

phải hiển thị unit nếu cần:

```text
Diện tích [____] ha
Số lượng [____] kg
```

---

# 39. Money Input

Hiển thị:

```text
Giá trị [________] VNĐ
```

Nhưng payload phải theo API type.

Không gửi:

```text
"1.000.000 VNĐ"
```

nếu API yêu cầu numeric/decimal.

---

# 40. Confirmation Dialog

Structure:

```text
Title
Description
Optional consequence
Cancel
Confirm
```

Ví dụ:

```text
Gửi hồ sơ OCOP?

Sau khi gửi, hồ sơ sẽ chuyển sang trạng thái chờ xử lý.

[Hủy] [Gửi hồ sơ]
```

---

# 41. Drawer

Drawer phù hợp:

- quick detail;
- filters;
- secondary information;
- mobile form in some cases.

Không dùng drawer cho workflow phức tạp nếu page riêng dễ hiểu hơn.

---

# 42. Modal

Modal phù hợp:

- confirmation;
- small form;
- quick action.

Không đặt form 20 fields trong modal.

---

# 43. Tabs

Tabs dùng khi sections cùng context:

```text
Tổng quan
Thông tin
Minh chứng
Đánh giá
Lịch sử
```

Không dùng tabs để che giấu workflow state.

---

# 44. Timeline

Timeline phù hợp:

```text
Created
Submitted
Returned
Resubmitted
Evaluated
Approved
```

Rất phù hợp cho:

- OCOP application history;
- audit/activity history;
- workflow.

---

# 45. History

History phải phân biệt:

```text
Business history
Audit history
```

Business history có thể hiển thị user-friendly.

Audit history nên dành cho authorized users.

---

# 46. Notification

Notification categories:

```text
Success
Info
Warning
Error
```

Không dùng toast cho thông tin cần người dùng đọc lâu.

---

# 47. Toast

Toast phù hợp:

```text
Lưu thành công.
Đã gửi hồ sơ.
Đã tải file.
```

Không dùng toast cho lỗi validation hàng loạt.

---

# 48. Error Page

Các page baseline:

```text
401
403
404
500
Network Error
```

Thông báo thân thiện.

Không hiển thị:

```text
stack trace
SQL
internal path
token
```

---

# 49. Permission-Aware UI

Ví dụ:

```text
User không có MEMBER_CREATE
→ không hiển thị "Thêm xã viên"
```

Nhưng backend vẫn enforce.

Nếu user truy cập trực tiếp URL:

```text
403
```

phải được xử lý rõ.

---

# 50. Workflow UX

Mỗi workflow screen phải hiển thị:

```text
Current status
Allowed actions
History
```

Ví dụ:

```text
Trạng thái: Cần bổ sung

[Chỉnh sửa]
[Gửi lại]
```

---

# 51. Workflow Action Labels

Map technical action → Vietnamese label.

Ví dụ:

```text
SUBMIT → Gửi hồ sơ
RETURN → Yêu cầu bổ sung
RESUBMIT → Gửi lại
APPROVE → Phê duyệt
REJECT → Từ chối
```

Tên chính thức phải được thống nhất với business glossary.

---

# 52. OCOP Application UX

Application detail nên có:

```text
Header
Status
Product summary
Criteria progress
Evidence completeness
Evaluation status
Workflow actions
History
```

Ví dụ:

```text
Hồ sơ OCOP
Mã: HS-OCOP-001

Trạng thái: Đang đánh giá

Tiến độ minh chứng: 82%
```

Các percentage phải lấy từ backend hoặc tính preview theo specification.

---

# 53. OCOP Criteria UX

Criteria UI nên hỗ trợ:

```text
Group
Criterion
Indicator
Requirement
Evidence
Score
Comment
```

Cấu trúc render từ criteria version.

---

# 54. Criteria Progress

Có thể hiển thị:

```text
Đã hoàn thành 18/22 tiêu chí
```

Chỉ sử dụng nếu backend/API cung cấp dữ liệu đủ tin cậy.

Không hard-code total.

---

# 55. OCOP Evidence UX

Evidence card:

```text
Tên minh chứng
Loại file
Phiên bản
Ngày tải
Trạng thái
Người tải
[Preview] [Download] [History]
```

Nếu evidence cần verification:

```text
Chờ kiểm tra
Đã xác minh
Không hợp lệ
```

Status phải theo backend contract.

---

# 56. Evidence Version UX

Không overwrite silently.

Hiển thị:

```text
Version 1
Version 2
Current
```

History có thể hiển thị:

```text
Uploaded by
Uploaded at
Checksum/reference if authorized
```

Không hiển thị technical storage path.

---

# 57. Evaluation UX

Evaluation screen nên ưu tiên:

```text
Criteria navigation
Current indicator
Evidence
Score
Comment
Summary
```

Evaluator cần dễ chuyển giữa các criteria.

---

# 58. Score Input UX

Score input phải:

- có min/max từ API nếu có;
- hiển thị unit/scale;
- validation;
- comment khi cần;
- autosave chỉ khi API hỗ trợ rõ ràng.

Không giả định range cố định.

---

# 59. Score Lock UX

Khi score locked:

```text
Đã khóa
```

Input thành read-only.

Nếu muốn thay đổi:

```text
workflow/API action
```

Không cho edit bằng client workaround.

---

# 60. Evaluation Summary

Summary có thể gồm:

```text
Total score
Criteria completed
Evidence completed
Comments
Current state
```

Official score phải từ backend.

---

# 61. Council Level UX

Hiển thị:

```text
Cấp đánh giá: Cấp tỉnh
```

hoặc:

```text
Cấp đánh giá: Cấp trung ương
```

Mapping label phải đến từ configuration/dictionary thống nhất.

Không tự thêm cấp khác.

---

# 62. Finance UX

Finance dashboard/list cần rõ:

```text
Thu
Chi
Phải thu
Phải trả
Số dư
```

Không dùng màu duy nhất để phân biệt thu/chi.

---

# 63. Inventory UX

Inventory screen nên hiển thị:

```text
Material
Warehouse
Current quantity
Unit
Last transaction
```

Stock value/quantity phải lấy từ backend.

---

# 64. Production UX

Production detail có thể liên kết:

```text
Production Unit
→ Farm Plot
→ Crop Season
→ Farming Logs
→ Harvest
→ Lot
→ Product
```

Mục tiêu là hỗ trợ traceability.

---

# 65. Traceability UX

Nếu dữ liệu có liên kết:

```text
Product
→ Lot
→ Harvest
→ Farm Plot
→ Season
→ Farming Log
```

UI nên cho phép drill-down.

Không hiển thị liên kết nếu API chưa cung cấp.

---

# 66. Mobile Strategy

Mobile ưu tiên:

```text
View
→ Search
→ Quick actions
→ Form
```

Các data table lớn có thể chuyển sang:

```text
Card list
```

Không cố giữ desktop table nguyên trạng trên màn hình nhỏ.

---

# 67. Responsive Breakpoints

Breakpoint cụ thể phải được định nghĩa trong design system.

Không hard-code breakpoint riêng trong từng component.

---

# 68. Accessibility

Minimum:

- keyboard;
- focus;
- labels;
- semantic HTML;
- dialog accessibility;
- error association;
- readable contrast;
- non-color status;
- alt text.

---

# 69. Localization

Baseline:

```text
Vietnamese
```

Business terminology phải nhất quán.

Ví dụ không lúc gọi:

```text
Xã viên
```

lúc khác:

```text
Thành viên HTX
```

nếu business glossary chưa quy định equivalence.

---

# 70. Date / Number Locale

Display locale phải thống nhất.

Ví dụ:

```text
01/09/2026
```

Không trộn:

```text
09/01/2026
```

trong cùng context.

---

# 71. Accessibility Text

Icon-only button phải có accessible label.

Ví dụ:

```text
aria-label="Xem chi tiết"
```

Không để icon không có meaning.

---

# 72. Icons

Icons phải có consistent visual family.

Không trộn quá nhiều icon libraries.

Icon phải hỗ trợ label, không thay thế label trong critical actions.

---

# 73. Images

Images phải:

- optimized;
- alt text nếu meaningful;
- lazy-loaded khi phù hợp;
- có placeholder.

Không tải original image khổng lồ nếu thumbnail đủ.

---

# 74. File Size UX

Upload UI nên hiển thị:

```text
Tên file
Kích thước
Loại
Progress
Status
```

Nếu server trả giới hạn:

```text
File tối đa X MB
```

phải lấy từ contract/configuration khi có thể.

---

# 75. Accessibility of Upload

Upload phải hỗ trợ:

```text
click
keyboard
```

nếu custom dropzone.

Không chỉ dựa vào drag-and-drop.

---

# 76. Data Privacy UX

Không hiển thị dữ liệu cá nhân không cần thiết.

Ví dụ trong list:

```text
Tên
Mã
Trạng thái
```

thay vì toàn bộ thông tin cá nhân nếu không cần.

---

# 77. Sensitive Actions

Các action:

```text
Approve
Reject
Lock
Finalize
Financial confirmation
```

nên yêu cầu:

```text
clear confirmation
```

và nếu backend yêu cầu:

```text
reason/comment
```

UI phải bắt buộc nhập reason nếu API yêu cầu.

---

# 78. Long-Running Operations

Với:

```text
PDF generation
DOCX generation
large export
```

UX:

```text
Queued
Processing
Ready
Failed
```

Không giả định hoàn thành ngay.

---

# 79. Report Export

Export button nên hiển thị:

```text
Xuất Excel
Xuất PDF
```

chỉ khi API hỗ trợ.

Nếu job async:

```text
Đang tạo báo cáo...
```

---

# 80. Document Download

Download private document phải đi qua authorized API/signed URL flow.

Không expose storage credentials.

---

# 81. Performance UX

Người dùng nên thấy feedback ngay:

```text
Button loading
Skeleton
Progress
Optimistic UI
```

Optimistic update chỉ dùng khi rollback an toàn.

Không dùng optimistic update cho official finance/inventory/OCOP result nếu có nguy cơ sai dữ liệu.

---

# 82. Accessibility / Color

Không dùng:

```text
red = error
green = success
```

mà không có text/icon/ARIA.

---

# 83. UX for Conflict

Khi backend trả 409:

```text
Dữ liệu đã được thay đổi bởi người dùng khác.
```

Sau đó:

```text
Tải lại
```

hoặc tự refetch nếu UX phù hợp.

Không silently overwrite.

---

# 84. Network Offline

Nếu app chưa hỗ trợ offline:

> Không giả vờ rằng dữ liệu đã lưu khi network mất.

Hiển thị:

```text
Không thể kết nối máy chủ.
Vui lòng thử lại.
```

---

# 85. Global Search

Chỉ triển khai nếu requirement/API hỗ trợ.

Nếu có:

```text
Xã viên
Sản phẩm
Hồ sơ OCOP
```

Search result phải phân loại rõ.

---

# 86. Command / Quick Actions

Có thể có:

```text
Thêm xã viên
Tạo hồ sơ OCOP
Nhập kho
Ghi nhận giao dịch
```

Chỉ hiển thị theo permission.

---

# 87. Notification Center

Nếu backend hỗ trợ notification:

```text
Chưa đọc
Đã đọc
```

Các notification có thể link tới:

```text
record
task
workflow
```

Không tạo notification giả từ frontend.

---

# 88. Help / Guidance

Các màn hình nghiệp vụ phức tạp nên có helper text.

Ví dụ OCOP:

```text
Minh chứng nên được bổ sung theo từng tiêu chí.
```

Nội dung phải dựa trên business/document specification.

Không đưa hướng dẫn pháp lý chưa được xác minh.

---

# 89. Legal / Policy Content

UI không được tự tuyên bố:

```text
Theo quy định X...
```

nếu nội dung đó chưa được xác minh trong project source.

Các policy-sensitive text phải:

```text
source
+
version
+
effective period
```

khi cần.

---

# 90. Design Tokens

Nên có:

```text
colors
spacing
radius
typography
shadows
breakpoints
z-index
```

tập trung.

Ví dụ:

```text
tokens/
```

Không rải design constants trong page.

---

# 91. Component States

Mỗi interactive component quan trọng nên xác định:

```text
Default
Hover
Focus
Active
Disabled
Loading
Error
Success
```

---

# 92. Button States

Button:

```text
Default
Hover
Pressed
Focus
Disabled
Loading
```

Loading phải giữ label nếu giúp user hiểu action.

Ví dụ:

```text
Đang lưu...
```

---

# 93. Input States

Input:

```text
Default
Focus
Filled
Disabled
Error
Success
```

Error phải có text.

---

# 94. Table States

Table:

```text
Loading
Loaded
Empty
Filtered Empty
Error
```

Mỗi state phải có UX rõ.

---

# 95. Form States

Form:

```text
Initial
Dirty
Submitting
Success
Validation Error
Server Error
```

Không reset dirty state trước server success.

---

# 96. Workflow State Visual Language

Workflow state phải có:

```text
Label
Icon where useful
Description where useful
Action
History
```

Ví dụ:

```text
Cần bổ sung

Hồ sơ cần được hoàn thiện trước khi gửi lại.

[Chỉnh sửa] [Gửi lại]
```

---

# 97. Responsive Navigation

Desktop:

```text
Sidebar
```

Mobile:

```text
Top bar
Drawer
```

Không hiển thị toàn bộ sidebar desktop trên mobile.

---

# 98. Screen Density

Ứng dụng quản trị có thể dùng medium/high information density nhưng phải:

- dễ đọc;
- có whitespace;
- không quá nhỏ;
- không nhồi quá nhiều field.

---

# 99. UX Priority

Khi có xung đột:

```text
Data correctness
>
Workflow clarity
>
Security
>
Task completion
>
Visual decoration
```

Không hy sinh data integrity để UX “nhanh” hơn.

---

# 100. AI Coding Agent UI Rules

AI phải:

1. đọc document 24;
2. đọc document 25;
3. đọc screen specification;
4. inspect existing components;
5. reuse existing design tokens;
6. reuse existing components;
7. không tạo style riêng nếu shared component đã có;
8. không tự thêm business rule;
9. không hard-code OCOP policy;
10. không hard-code workflow;
11. không hard-code permission;
12. test interactive states.

---

# 101. AI Must Not Invent UI

Không tự invent:

- menu;
- role;
- permission;
- workflow action;
- OCOP criterion;
- legal wording;
- score threshold;
- report;
- dashboard KPI;

nếu chưa có source.

Nếu cần UX hỗ trợ:

```text
mark as PROPOSED
```

và không coi đó là approved scope.

---

# 102. UI Review Checklist

## Layout

- [ ] Header
- [ ] Sidebar
- [ ] Breadcrumb
- [ ] Page title
- [ ] Content width

## Components

- [ ] Buttons
- [ ] Forms
- [ ] Tables
- [ ] Dialogs
- [ ] Status

## States

- [ ] Loading
- [ ] Empty
- [ ] Error
- [ ] Success
- [ ] Disabled

## Accessibility

- [ ] Keyboard
- [ ] Labels
- [ ] Focus
- [ ] Contrast
- [ ] Non-color status

## Business

- [ ] Permission
- [ ] Workflow
- [ ] API contract
- [ ] No invented rule

---

# 103. Screen Specification Template

Mỗi screen trong document 28 nên dùng:

```text
Screen ID
Route
Purpose
Actor
Permission
Entry Conditions
Data Sources
API
Layout
Components
Fields
Actions
Validation
Loading
Empty
Error
Success
Workflow
Responsive
Accessibility
Acceptance Criteria
Traceability
```

---

# 104. UX Acceptance Criteria

Một screen đạt UX baseline khi:

- [ ] User knows current context;
- [ ] primary action is clear;
- [ ] status is visible;
- [ ] errors are actionable;
- [ ] loading is visible;
- [ ] empty state is meaningful;
- [ ] permission is respected;
- [ ] responsive behavior defined;
- [ ] keyboard accessibility works;
- [ ] no unverified business/legal statement.

---

# 105. Final UI/UX Contract

UI/UX phải:

```text
Consistent
+
Clear
+
Accessible
+
Responsive
+
Permission-aware
+
Workflow-aware
+
Policy-aware
```

Không được:

```text
Invent business rules
+
Invent legal rules
+
Invent permissions
+
Invent workflow
+
Expose sensitive data
```

---

# 106. Next Document

Tài liệu tiếp theo:

`28_FRONTEND_SCREEN_SPECIFICATION.md`

Tài liệu 28 sẽ chuyển UI/UX baseline thành **đặc tả từng màn hình cụ thể**, bao gồm:

```text
Screen ID
Route
Actor
Permission
Layout
Fields
Components
API
Actions
Validation
States
Workflow
Responsive
Acceptance Criteria
Traceability
```

**End of Document**
