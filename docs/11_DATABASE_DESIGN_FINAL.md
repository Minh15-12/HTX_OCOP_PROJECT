# 11_DATABASE_DESIGN.md

# 1. Document Information

| Field | Value |
|---|---|
| Document ID | 11 |
| Document Name | Physical Database Design Specification |
| Project | Xây dựng Hệ thống quản lý hoạt động Hợp tác xã nông nghiệp và số hóa hồ sơ đánh giá, phân hạng OCOP |
| Database Engine | PostgreSQL |
| Object Storage | MinIO hoặc tương đương |
| Primary Source | 10_DOMAIN_MODEL.md |
| Upstream Source | 01 → 09 |
| Status | BASELINE |
| Purpose | Chuyển Domain Model thành mô hình dữ liệu vật lý có PK, FK, constraint, index, versioning, audit và chiến lược lưu tệp |

> Đây là thiết kế CSDL baseline. Các quy tắc pháp lý hoặc giá trị nghiệp vụ chưa được xác minh không được hard-code vào constraint/database trigger.
>
> **Policy baseline:** Quyết định 1489/QĐ-TTg ngày 06/07/2025 xác định đánh giá, phân hạng OCOP theo 02 cấp: cấp tỉnh và cấp trung ương. Thiết kế dùng `council_levels` để giữ khả năng thích ứng khi chính sách thay đổi.

---

# 2. Design Principles

## 2.1 Nguyên tắc chính

1. PostgreSQL là nguồn dữ liệu nghiệp vụ chính.
2. Object Storage chỉ lưu binary file; metadata nằm trong PostgreSQL.
3. Foreign Key được sử dụng cho quan hệ dữ liệu quan trọng.
4. Business invariant quan trọng phải được enforce ở backend và database khi phù hợp.
5. Không dùng frontend làm security boundary.
6. Dữ liệu lịch sử quan trọng phải immutable/versioned.
7. Không xóa vật lý các dữ liệu đã tham gia quy trình hoặc audit nếu không có chính sách retention cho phép.
8. Derived values ưu tiên tính từ source data; chỉ materialize khi có lý do hiệu năng.
9. Các trạng thái nghiệp vụ phải có domain enum/reference hoặc CHECK constraint có kiểm soát.
10. Multi-tenant scope phải được enforce bằng application authorization và có thể tăng cường bằng PostgreSQL Row-Level Security.
11. Tệp minh chứng không lưu trực tiếp trong PostgreSQL.
12. Migration phải version-controlled bằng Git.

---

# 3. Naming Convention

## 3.1 Tables

- snake_case
- số nhiều
- ví dụ: `cooperatives`, `members`, `crop_seasons`

## 3.2 Primary Key

Khuyến nghị:

```text
id UUID
```

UUID giúp tránh phụ thuộc vào sequence và thuận tiện khi tích hợp/distributed operations.

## 3.3 Foreign Key

```text
<entity>_id
```

Ví dụ:

```text
cooperative_id
member_id
application_id
```

## 3.4 Timestamps

Dùng:

```text
TIMESTAMPTZ
```

và lưu UTC.

## 3.5 Money

Không dùng floating point.

Khuyến nghị:

```text
NUMERIC(18,2)
```

hoặc precision cao hơn nếu nghiệp vụ yêu cầu.

## 3.6 Quantity

Dùng:

```text
NUMERIC(18,4)
```

khi có khả năng cần phần thập phân.

---

# 4. Schema Organization

Có thể tổ chức PostgreSQL theo logical schemas:

```text
public / core
├── cooperative
├── agriculture
├── inventory
├── finance
├── ocop
├── evidence
├── workflow
├── identity
├── audit
└── reporting
```

Ở MVP có thể sử dụng một schema PostgreSQL duy nhất để giảm độ phức tạp; logical domain vẫn phải được giữ bằng naming và module.

---

# 5. Core Entity Inventory

| Table | Domain | Purpose |
|---|---|---|
| cooperatives | Cooperative | HTX |
| members | Membership | Xã viên |
| capital_contributions | Capital | Góp vốn |
| meetings | Cooperative | Phiên họp |
| votes | Cooperative | Biểu quyết |
| production_units | Agriculture | Vùng trồng |
| farm_plots | Agriculture | Thửa đất |
| member_plot_assignments | Agriculture | Quan hệ xã viên–thửa |
| crop_seasons | Agriculture | Mùa vụ |
| farming_logs | Agriculture | Nhật ký |
| material_usages | Agriculture | Vật tư sử dụng |
| phi_calculations | Agriculture | Kết quả PHI |
| harvests | Agriculture | Thu hoạch |
| lots | Agriculture/Product | Lô truy xuất |
| products | Product | Sản phẩm |
| product_lots | Product | Sản phẩm–Lot |
| materials | Inventory | Vật tư |
| stock_receipts | Inventory | Phiếu nhập |
| stock_receipt_lines | Inventory | Dòng nhập |
| stock_issues | Inventory | Phiếu xuất |
| stock_issue_lines | Inventory | Dòng xuất |
| stock_counts | Inventory | Kiểm kê |
| stock_count_lines | Inventory | Dòng kiểm kê |
| cash_transactions | Finance | Thu/chi |
| receivable_payables | Finance | Công nợ |
| settlements | Finance | Thanh toán/cấn trừ |
| surplus_distribution_plans | Finance | Phương án phân phối |
| surplus_distribution_items | Finance | Chi tiết phân phối |
| criteria_versions | OCOP | Version bộ tiêu chí |
| criteria_groups | OCOP | Nhóm tiêu chí |
| criteria | OCOP | Tiêu chí |
| indicators | OCOP | Chỉ tiêu |
| scoring_rules | OCOP | Quy tắc tính điểm |
| mandatory_conditions | OCOP | Điều kiện bắt buộc |
| ocop_applications | OCOP | Hồ sơ |
| self_assessments | OCOP | Tự đánh giá |
| application_reviews | OCOP | Kiểm tra hồ sơ |
| council_levels | OCOP / Reference | Danh mục cấp đánh giá/hội đồng, có thể cấu hình |
| evaluation_sessions | OCOP | Phiên đánh giá |
| evaluator_assignments | OCOP | Phân công |
| evaluator_scores | OCOP | Điểm evaluator |
| consolidated_results | OCOP | Tổng hợp |
| proposed_classifications | OCOP | Đề xuất phân hạng |
| final_decisions | OCOP | Quyết định |
| evidences | Evidence | Minh chứng |
| evidence_versions | Evidence | Version minh chứng |
| evidence_links | Evidence | Liên kết minh chứng |
| workflow_instances | Workflow | Workflow |
| workflow_transitions | Workflow | Lịch sử transition |
| users | Identity | Tài khoản |
| roles | Identity | Role |
| permissions | Identity | Permission |
| role_assignments | Identity | Gán role |
| data_scopes | Identity | Phạm vi dữ liệu |
| audit_events | Audit | Audit |
| report_requests | Reporting | Yêu cầu báo cáo |
| generated_documents | Reporting | Tài liệu sinh ra |

---

# 6. Common Columns

Các bảng nghiệp vụ có thể sử dụng:

```text
id UUID PK
created_at TIMESTAMPTZ NOT NULL
updated_at TIMESTAMPTZ NOT NULL
```

Không áp dụng máy móc cho bảng append-only như audit nếu `updated_at` không có ý nghĩa.

Soft delete chỉ dùng khi có lý do nghiệp vụ:

```text
deleted_at TIMESTAMPTZ NULL
```

Không dùng soft delete để che giấu lịch sử.

---

# 7. Cooperative Tables

## 7.1 cooperatives

| Column | Type | Null | Constraint |
|---|---|---:|---|
| id | UUID | NO | PK |
| cooperative_code | VARCHAR(50) | NO | UNIQUE |
| legal_name | VARCHAR(255) | NO | |
| display_name | VARCHAR(255) | YES | |
| legal_information | JSONB | YES | |
| contact_information | JSONB | YES | |
| status | VARCHAR(30) | NO | CHECK |
| created_at | TIMESTAMPTZ | NO | |
| updated_at | TIMESTAMPTZ | NO | |

### Constraints

```text
UNIQUE(cooperative_code)
```

Không hard-code danh sách trạng thái nếu chưa có state catalog chính thức; baseline có thể dùng:

```text
ACTIVE
INACTIVE
SUSPENDED
```

---

# 8. Member Tables

## 8.1 members

| Column | Type | Null |
|---|---|---:|
| id | UUID | NO |
| cooperative_id | UUID | NO |
| member_code | VARCHAR(50) | NO |
| identity_information | JSONB | NO |
| member_type | VARCHAR(30) | NO |
| status | VARCHAR(30) | NO |
| admission_date | DATE | YES |
| termination_date | DATE | YES |
| created_at | TIMESTAMPTZ | NO |
| updated_at | TIMESTAMPTZ | NO |

### FK

```text
cooperative_id → cooperatives.id
```

### Unique

```text
UNIQUE(cooperative_id, member_code)
```

Identity uniqueness cần policy rõ; không tự chọn một field nhạy cảm làm unique key nếu nghiệp vụ chưa xác nhận.

---

# 9. Capital Tables

## 9.1 capital_contributions

| Column | Type | Null |
|---|---|---:|
| id | UUID | NO |
| member_id | UUID | NO |
| contribution_type | VARCHAR(30) | NO |
| amount | NUMERIC(18,2) | NO |
| value_description | TEXT | YES |
| transaction_date | DATE | NO |
| evidence_reference | JSONB | YES |
| status | VARCHAR(30) | NO |
| created_at | TIMESTAMPTZ | NO |
| updated_at | TIMESTAMPTZ | NO |

### Constraints

```text
amount > 0
```

### FK

```text
member_id → members.id
```

---

# 10. Meeting and Vote Tables

## 10.1 meetings

```text
id UUID PK
cooperative_id UUID FK
meeting_type VARCHAR(50)
meeting_date DATE
title VARCHAR(255)
status VARCHAR(30)
created_at TIMESTAMPTZ
updated_at TIMESTAMPTZ
```

## 10.2 votes

```text
id UUID PK
meeting_id UUID FK
member_id UUID FK
resolution_code VARCHAR(100)
choice VARCHAR(30)
weight NUMERIC(18,4)
created_at TIMESTAMPTZ
```

`weight` không phải giá trị được nhập tùy ý nếu hệ thống có rule tính trọng số.

---

# 11. Production Unit Tables

## 11.1 production_units

Khuyến nghị dùng PostGIS nếu hệ thống cần GIS thật sự.

```text
id UUID PK
cooperative_id UUID FK
unit_code VARCHAR(50)
name VARCHAR(255)
crop VARCHAR(100)
area NUMERIC(18,4)
location JSONB
geometry geometry(Geometry,4326) NULL
status VARCHAR(30)
registration_information JSONB
created_at TIMESTAMPTZ
updated_at TIMESTAMPTZ
```

Nếu không dùng PostGIS, `geometry` có thể thay bằng GeoJSON JSONB, nhưng spatial validation/query sẽ yếu hơn.

### Index

```text
INDEX production_units_cooperative_id
GIST(geometry) nếu PostGIS
```

---

# 12. Farm Plot Tables

## 12.1 farm_plots

```text
id UUID PK
production_unit_id UUID FK
plot_code VARCHAR(50)
land_relation JSONB
area NUMERIC(18,4)
geometry geometry(Geometry,4326) NULL
status VARCHAR(30)
created_at TIMESTAMPTZ
updated_at TIMESTAMPTZ
```

### Unique

```text
UNIQUE(production_unit_id, plot_code)
```

---

## 12.2 member_plot_assignments

Dùng cho quan hệ N-N và lịch sử.

```text
id UUID PK
member_id UUID FK
plot_id UUID FK
assignment_type VARCHAR(50)
start_date DATE
end_date DATE NULL
status VARCHAR(30)
created_at TIMESTAMPTZ
updated_at TIMESTAMPTZ
```

### Index

```text
INDEX member_plot_assignments_member_id
INDEX member_plot_assignments_plot_id
```

Nếu chỉ cho một assignment ACTIVE tại một thời điểm, cần partial unique index sau khi business rule được xác nhận.

---

# 13. Crop Season Tables

## 13.1 crop_seasons

```text
id UUID PK
production_unit_id UUID FK
name VARCHAR(255)
crop VARCHAR(100)
start_date DATE
expected_end_date DATE
actual_end_date DATE NULL
status VARCHAR(30)
plan_information JSONB
created_at TIMESTAMPTZ
updated_at TIMESTAMPTZ
```

### CHECK

```text
expected_end_date >= start_date
actual_end_date IS NULL OR actual_end_date >= start_date
```

---

# 14. Farming Log Tables

## 14.1 farming_logs

```text
id UUID PK
crop_season_id UUID FK
plot_id UUID FK
activity_type VARCHAR(50)
activity_date DATE
description TEXT
performed_by UUID NULL
attachment_reference JSONB NULL
created_at TIMESTAMPTZ
updated_at TIMESTAMPTZ
```

### FK

```text
crop_season_id → crop_seasons.id
plot_id → farm_plots.id
performed_by → users.id
```

Application service phải kiểm tra plot thuộc production unit/crop season tương ứng.

---

# 15. Material Usage Tables

## 15.1 material_usages

```text
id UUID PK
farming_log_id UUID FK
material_id UUID FK
quantity NUMERIC(18,4)
unit VARCHAR(30)
batch_reference VARCHAR(100) NULL
created_at TIMESTAMPTZ
updated_at TIMESTAMPTZ
```

### CHECK

```text
quantity > 0
```

---

# 16. PHI Tables

## 16.1 phi_calculations

```text
id UUID PK
farming_log_id UUID FK
material_id UUID FK
application_date DATE
configured_phi_days INTEGER NULL
safety_date DATE NULL
status VARCHAR(30)
source_reference JSONB NULL
created_at TIMESTAMPTZ
```

### Rule

Không tạo giá trị PHI mặc định bằng suy đoán.

Nếu `configured_phi_days` không có nguồn đáng tin cậy, record phải phản ánh trạng thái chưa xác định.

---

# 17. Harvest and Lot Tables

## 17.1 harvests

```text
id UUID PK
crop_season_id UUID FK
plot_id UUID FK
harvest_date DATE
quantity NUMERIC(18,4)
unit VARCHAR(30)
quality_information JSONB
lot_id UUID NULL
created_at TIMESTAMPTZ
updated_at TIMESTAMPTZ
```

## 17.2 lots

```text
id UUID PK
lot_code VARCHAR(100) UNIQUE
harvest_id UUID FK
source_information JSONB
quantity NUMERIC(18,4)
unit VARCHAR(30)
status VARCHAR(30)
created_at TIMESTAMPTZ
updated_at TIMESTAMPTZ
```

Nếu một harvest tạo nhiều lot, thay FK `harvest_id` bằng quan hệ phù hợp. Đây là điểm cần xác minh ở bước implementation.

---

# 18. Product Tables

## 18.1 products

```text
id UUID PK
cooperative_id UUID FK
product_code VARCHAR(50)
product_name VARCHAR(255)
category VARCHAR(100)
specification JSONB
brand VARCHAR(255)
quality_information JSONB
status VARCHAR(30)
created_at TIMESTAMPTZ
updated_at TIMESTAMPTZ
```

### Unique

```text
UNIQUE(cooperative_id, product_code)
```

---

## 18.2 product_lots

```text
product_id UUID FK
lot_id UUID FK
quantity NUMERIC(18,4) NULL
created_at TIMESTAMPTZ
```

PK:

```text
(product_id, lot_id)
```

---

# 19. Inventory Tables

## 19.1 materials

```text
id UUID PK
cooperative_id UUID FK
sku VARCHAR(80)
name VARCHAR(255)
category VARCHAR(100)
unit VARCHAR(30)
safety_information JSONB
reorder_threshold NUMERIC(18,4)
status VARCHAR(30)
created_at TIMESTAMPTZ
updated_at TIMESTAMPTZ
```

### Unique

```text
UNIQUE(cooperative_id, sku)
```

---

# 20. Stock Receipt Tables

## 20.1 stock_receipts

```text
id UUID PK
cooperative_id UUID FK
receipt_number VARCHAR(100)
supplier_information JSONB
receipt_date DATE
status VARCHAR(30)
total_amount NUMERIC(18,2)
evidence_reference JSONB
created_by UUID FK
approved_by UUID NULL FK
created_at TIMESTAMPTZ
updated_at TIMESTAMPTZ
```

## 20.2 stock_receipt_lines

```text
id UUID PK
stock_receipt_id UUID FK
material_id UUID FK
quantity NUMERIC(18,4)
unit_price NUMERIC(18,2)
batch_code VARCHAR(100) NULL
expiry_date DATE NULL
line_amount NUMERIC(18,2)
```

### CHECK

```text
quantity > 0
unit_price >= 0
line_amount >= 0
```

---

# 21. Stock Issue Tables

## 21.1 stock_issues

```text
id UUID PK
cooperative_id UUID FK
issue_number VARCHAR(100)
issue_date DATE
member_id UUID NULL FK
purpose VARCHAR(255)
status VARCHAR(30)
total_amount NUMERIC(18,2)
created_by UUID FK
approved_by UUID NULL FK
created_at TIMESTAMPTZ
updated_at TIMESTAMPTZ
```

## 21.2 stock_issue_lines

```text
id UUID PK
stock_issue_id UUID FK
material_id UUID FK
quantity NUMERIC(18,4)
unit_price NUMERIC(18,2)
batch_code VARCHAR(100) NULL
line_amount NUMERIC(18,2)
```

### Invariant

Không xuất vượt tồn khả dụng.

Inventory balance nên được tính từ stock transactions hoặc có ledger/materialized balance có cơ chế consistency.

---

# 22. Stock Count Tables

## 22.1 stock_counts

```text
id UUID PK
cooperative_id UUID FK
count_number VARCHAR(100)
count_date DATE
scope JSONB
status VARCHAR(30)
reason TEXT
created_by UUID FK
approved_by UUID NULL FK
created_at TIMESTAMPTZ
updated_at TIMESTAMPTZ
```

## 22.2 stock_count_lines

```text
id UUID PK
stock_count_id UUID FK
material_id UUID FK
expected_quantity NUMERIC(18,4)
actual_quantity NUMERIC(18,4)
difference NUMERIC(18,4)
reason TEXT NULL
```

---

# 23. Finance Tables

## 23.1 cash_transactions

```text
id UUID PK
cooperative_id UUID FK
transaction_number VARCHAR(100)
transaction_type VARCHAR(30)
amount NUMERIC(18,2)
transaction_date DATE
category VARCHAR(100)
counterparty JSONB
reference JSONB
evidence_reference JSONB
status VARCHAR(30)
created_by UUID FK
approved_by UUID NULL FK
created_at TIMESTAMPTZ
updated_at TIMESTAMPTZ
```

### CHECK

```text
amount > 0
```

---

# 24. Receivable / Payable Tables

## 24.1 receivable_payables

```text
id UUID PK
cooperative_id UUID FK
member_id UUID NULL FK
counterparty JSONB NULL
source_transaction_id UUID NULL
debt_type VARCHAR(30)
original_amount NUMERIC(18,2)
outstanding_amount NUMERIC(18,2)
due_date DATE NULL
status VARCHAR(30)
created_at TIMESTAMPTZ
updated_at TIMESTAMPTZ
```

### CHECK

```text
original_amount >= 0
outstanding_amount >= 0
outstanding_amount <= original_amount
```

---

# 25. Settlement Tables

## 25.1 settlements

```text
id UUID PK
cooperative_id UUID FK
debt_id UUID FK
settlement_type VARCHAR(30)
amount NUMERIC(18,2)
settlement_date DATE
reference JSONB
status VARCHAR(30)
created_by UUID FK
created_at TIMESTAMPTZ
```

### CHECK

```text
amount > 0
```

---

# 26. Surplus Distribution Tables

## 26.1 surplus_distribution_plans

```text
id UUID PK
cooperative_id UUID FK
fiscal_period VARCHAR(30)
source_result_reference JSONB
rule_version_reference VARCHAR(100)
total_amount NUMERIC(18,2)
approval_status VARCHAR(30)
created_by UUID FK
approved_by UUID NULL FK
created_at TIMESTAMPTZ
updated_at TIMESTAMPTZ
```

## 26.2 surplus_distribution_items

```text
id UUID PK
plan_id UUID FK
member_id UUID FK
basis_value NUMERIC(18,2) NULL
allocation_amount NUMERIC(18,2)
rule_reference JSONB
created_at TIMESTAMPTZ
```

### Invariant

```text
SUM(items.allocation_amount) <= plan.total_amount
```

Tỷ lệ/phương thức phân phối phải đến từ rule version đã được xác nhận.

---

# 27. OCOP Criteria Tables

## 27.1 criteria_versions

```text
id UUID PK
version_code VARCHAR(100)
name VARCHAR(255)
effective_from DATE NULL
effective_to DATE NULL
source_reference JSONB
status VARCHAR(30)
created_at TIMESTAMPTZ
updated_at TIMESTAMPTZ
```

### Unique

```text
UNIQUE(version_code)
```

### Critical rule

Criteria Version đã được sử dụng không được update destructively.

---

# 28. Criteria Groups

## 28.1 criteria_groups

```text
id UUID PK
criteria_version_id UUID FK
code VARCHAR(100)
name VARCHAR(255)
description TEXT
display_order INTEGER
created_at TIMESTAMPTZ
updated_at TIMESTAMPTZ
```

### Unique

```text
UNIQUE(criteria_version_id, code)
```

---

# 29. Criteria

## 29.1 criteria

```text
id UUID PK
criteria_group_id UUID FK
code VARCHAR(100)
name VARCHAR(255)
description TEXT
max_score NUMERIC(10,2)
mandatory BOOLEAN
display_order INTEGER
created_at TIMESTAMPTZ
updated_at TIMESTAMPTZ
```

### CHECK

```text
max_score >= 0
display_order >= 0
```

---

# 30. Indicators

## 30.1 indicators

```text
id UUID PK
criterion_id UUID FK
code VARCHAR(100)
name VARCHAR(255)
description TEXT
max_score NUMERIC(10,2)
mandatory BOOLEAN
evidence_requirement JSONB
display_order INTEGER
created_at TIMESTAMPTZ
updated_at TIMESTAMPTZ
```

### Unique

```text
UNIQUE(criterion_id, code)
```

### CHECK

```text
max_score >= 0
```

---

# 31. Scoring Rules

## 31.1 scoring_rules

Scoring logic phải data-driven.

```text
id UUID PK
criteria_version_id UUID FK
rule_code VARCHAR(100)
rule_type VARCHAR(50)
configuration JSONB
priority INTEGER
status VARCHAR(30)
created_at TIMESTAMPTZ
updated_at TIMESTAMPTZ
```

`configuration` chứa cấu hình được phê duyệt; không nên dùng JSONB để né tất cả constraints.

---

# 32. Mandatory Conditions

## 32.1 mandatory_conditions

```text
id UUID PK
criteria_version_id UUID FK
condition_code VARCHAR(100)
name VARCHAR(255)
description TEXT
condition_type VARCHAR(50)
configuration JSONB
blocking BOOLEAN
created_at TIMESTAMPTZ
updated_at TIMESTAMPTZ
```

Điều kiện bắt buộc phải được đánh giá trước Proposed Classification nếu `blocking = true`.

---

# 33. OCOP Application

## 33.1 ocop_applications

```text
id UUID PK
cooperative_id UUID FK
product_id UUID FK
criteria_version_id UUID FK
application_number VARCHAR(100)
application_type VARCHAR(50)
status VARCHAR(40)
created_at TIMESTAMPTZ
updated_at TIMESTAMPTZ
submitted_at TIMESTAMPTZ NULL
completed_at TIMESTAMPTZ NULL
```

### Unique

```text
UNIQUE(application_number)
```

### Critical FK consistency

Application chỉ được tham chiếu một Criteria Version cụ thể.

---

# 34. Self Assessment

## 34.1 self_assessments

```text
id UUID PK
application_id UUID FK
indicator_id UUID FK
score NUMERIC(10,2)
explanation TEXT
status VARCHAR(30)
created_at TIMESTAMPTZ
updated_at TIMESTAMPTZ
```

### Unique

```text
UNIQUE(application_id, indicator_id)
```

### CHECK

```text
score >= 0
```

`score <= indicator.max_score` là cross-row/business constraint; backend phải enforce và có thể dùng trigger nếu cần tuyệt đối.

---

# 35. Application Review

## 35.1 application_reviews

```text
id UUID PK
application_id UUID FK
reviewer_id UUID FK
review_status VARCHAR(30)
comments TEXT
requested_revision TEXT
reviewed_at TIMESTAMPTZ NULL
created_at TIMESTAMPTZ
updated_at TIMESTAMPTZ
```

Reviewer phải có Data Scope phù hợp.

---

# 36. Evaluation Session

## 36.1 council_levels

`council_levels` là reference/configuration table để không hard-code cấp đánh giá vào `evaluation_sessions`.

```text
id UUID PK
code VARCHAR(50) UNIQUE
name VARCHAR(255)
description TEXT NULL
sort_order INTEGER
is_active BOOLEAN
valid_from DATE NULL
valid_to DATE NULL
source_reference JSONB NULL
created_at TIMESTAMPTZ
updated_at TIMESTAMPTZ
```

### Seed hiện tại

Theo Quyết định 1489/QĐ-TTg ngày 06/07/2025, công tác đánh giá, phân hạng sản phẩm OCOP được chia thành 02 cấp: cấp tỉnh và cấp trung ương. Baseline hiện tại có:

```text
PROVINCE
CENTRAL
```

Đây là **dữ liệu cấu hình**, không phải khóa cứng schema. Nếu quy định tương lai thay đổi cấp đánh giá, ưu tiên thêm/version hóa reference thay vì sửa cấu trúc `evaluation_sessions`.

## 36.2 evaluation_sessions

```text
id UUID PK
application_id UUID FK
council_level_id UUID FK
status VARCHAR(30)
started_at TIMESTAMPTZ NULL
completed_at TIMESTAMPTZ NULL
created_at TIMESTAMPTZ
updated_at TIMESTAMPTZ
```

### FK

```text
council_level_id → council_levels.id
```

### Rules

1. `council_level_id` bắt buộc đối với phiên đánh giá chính thức.
2. Không hard-code `PROVINCE`/`CENTRAL` trong application logic.
3. Cấp đánh giá phải được xác định từ policy/configuration áp dụng cho hồ sơ.
4. Một application có thể có nhiều session theo nghiệp vụ; không mặc định `UNIQUE(application_id)`.
5. Không cho phép đổi `council_level_id` sau khi session đã bắt đầu/chốt nếu không có workflow override và audit.

---

# 37. Evaluator Assignment

## 37.1 evaluator_assignments

```text
id UUID PK
evaluation_session_id UUID FK
evaluator_id UUID FK
role VARCHAR(50)
status VARCHAR(30)
assigned_at TIMESTAMPTZ
completed_at TIMESTAMPTZ NULL
```

### Index

```text
INDEX evaluator_assignments_evaluator_id
INDEX evaluator_assignments_session_id
```

---

# 38. Evaluator Scores

## 38.1 evaluator_scores

```text
id UUID PK
assignment_id UUID FK
indicator_id UUID FK
score NUMERIC(10,2)
comment TEXT
submitted_at TIMESTAMPTZ NULL
locked_at TIMESTAMPTZ NULL
created_at TIMESTAMPTZ
updated_at TIMESTAMPTZ
```

### Unique

```text
UNIQUE(assignment_id, indicator_id)
```

### CHECK

```text
score >= 0
```

Không được sửa điểm sau khi locked trừ workflow override có audit.

---

# 39. Consolidated Results

## 39.1 consolidated_results

```text
id UUID PK
application_id UUID FK
evaluation_session_id UUID FK
total_score NUMERIC(10,2)
rule_version_reference VARCHAR(100)
consolidation_status VARCHAR(30)
calculated_at TIMESTAMPTZ
created_at TIMESTAMPTZ
updated_at TIMESTAMPTZ
```

Không nhập tổng điểm thủ công.

Có thể tạo UNIQUE:

```text
UNIQUE(evaluation_session_id)
```

nếu mỗi session chỉ có một kết quả chốt.

---

# 40. Proposed Classification

## 40.1 proposed_classifications

```text
id UUID PK
application_id UUID FK
result_id UUID FK
proposed_level VARCHAR(50)
rule_version_reference VARCHAR(100)
reason TEXT
status VARCHAR(30)
created_at TIMESTAMPTZ
updated_at TIMESTAMPTZ
```

Không hard-code ngưỡng phân hạng chưa xác minh.

---

# 41. Final Decision

## 41.1 final_decisions

```text
id UUID PK
application_id UUID FK
authority_reference JSONB
decision_number VARCHAR(100)
decision_date DATE
final_classification VARCHAR(50)
effective_date DATE NULL
document_reference JSONB
status VARCHAR(30)
created_at TIMESTAMPTZ
updated_at TIMESTAMPTZ
```

### Critical distinction

```text
proposed_classifications ≠ final_decisions
```

Database không được dùng Proposed Classification để giả lập Final Decision.

---

# 42. Evidence Tables

## 42.1 evidences

```text
id UUID PK
application_id UUID FK
title VARCHAR(255)
evidence_type VARCHAR(100)
source_type VARCHAR(50)
status VARCHAR(30)
current_version_id UUID NULL
verified_by UUID NULL
verified_at TIMESTAMPTZ NULL
created_at TIMESTAMPTZ
updated_at TIMESTAMPTZ
```

## 42.2 evidence_versions

```text
id UUID PK
evidence_id UUID FK
version_number INTEGER
file_reference VARCHAR(1000)
file_name VARCHAR(255)
checksum VARCHAR(128)
mime_type VARCHAR(100)
file_size BIGINT
uploaded_by UUID FK
uploaded_at TIMESTAMPTZ
replacement_reason TEXT NULL
```

### Unique

```text
UNIQUE(evidence_id, version_number)
```

### CHECK

```text
version_number > 0
file_size >= 0
```

---

# 43. Evidence Links

## 43.1 evidence_links

```text
evidence_id UUID FK
indicator_id UUID FK
relevance VARCHAR(50) NULL
note TEXT NULL
created_by UUID FK
created_at TIMESTAMPTZ
```

PK:

```text
(evidence_id, indicator_id)
```

Quan hệ này hỗ trợ:

```text
Evidence N ↔ N Indicator
```

---

# 44. Workflow Tables

## 44.1 workflow_instances

```text
id UUID PK
entity_type VARCHAR(100)
entity_id UUID
current_state VARCHAR(50)
started_at TIMESTAMPTZ
completed_at TIMESTAMPTZ NULL
created_at TIMESTAMPTZ
updated_at TIMESTAMPTZ
```

`entity_id` polymorphic FK không thể enforce bằng một FK thông thường. Nếu cần integrity tuyệt đối cho các entity quan trọng, nên thiết kế workflow relation riêng hoặc association table thay vì polymorphic reference.

---

## 44.2 workflow_transitions

```text
id UUID PK
workflow_instance_id UUID FK
from_state VARCHAR(50)
to_state VARCHAR(50)
actor_id UUID FK
reason TEXT
created_at TIMESTAMPTZ
```

Lịch sử transition là append-only.

---

# 45. Identity Tables

## 45.1 users

```text
id UUID PK
username VARCHAR(255)
email VARCHAR(255)
status VARCHAR(30)
authentication_reference VARCHAR(255)
last_login_at TIMESTAMPTZ NULL
created_at TIMESTAMPTZ
updated_at TIMESTAMPTZ
```

Không lưu plaintext password.

### Unique

```text
UNIQUE(username)
UNIQUE(email)
```

Case-insensitive email nên dùng CITEXT hoặc normalized email strategy.

---

# 46. Roles

## 46.1 roles

```text
id UUID PK
code VARCHAR(100) UNIQUE
name VARCHAR(255)
description TEXT
status VARCHAR(30)
created_at TIMESTAMPTZ
updated_at TIMESTAMPTZ
```

Baseline roles:

```text
HTX_OWNER
HTX_STAFF
ACCOUNTANT
STOREKEEPER
AGRICULTURE_OFFICER
OCOP_PREPARER
EVALUATOR
COUNCIL_MEMBER
COUNCIL_SECRETARY
AUTHORITY
CRITERIA_ADMIN
SYSTEM_ADMIN
AUDITOR
REPORT_VIEWER
```

Danh sách này phải được đối chiếu với 05_ACTORS_AND_ROLES trước khi seed production.

---

# 47. Permissions

## 47.1 permissions

```text
id UUID PK
code VARCHAR(150) UNIQUE
name VARCHAR(255)
description TEXT
```

Ví dụ:

```text
member.read
member.create
member.approve
evidence.read
evidence.upload
evidence.verify
evaluation.score
evaluation.consolidate
decision.record
audit.read
```

---

# 48. Role Assignments

## 48.1 role_assignments

```text
id UUID PK
user_id UUID FK
role_id UUID FK
scope_type VARCHAR(50)
scope_id UUID NULL
valid_from TIMESTAMPTZ NULL
valid_to TIMESTAMPTZ NULL
status VARCHAR(30)
created_at TIMESTAMPTZ
updated_at TIMESTAMPTZ
```

Scope examples:

```text
COOPERATIVE
APPLICATION
EVALUATION_SESSION
GLOBAL
```

---

# 49. Data Scopes

## 49.1 data_scopes

```text
id UUID PK
user_id UUID FK
scope_type VARCHAR(50)
scope_id UUID
created_at TIMESTAMPTZ
```

Có thể gộp vào role_assignments nếu mô hình permission đơn giản. Tách riêng khi authorization phức tạp.

---

# 50. Audit Tables

## 50.1 audit_events

```text
id UUID PK
actor_id UUID NULL FK
action VARCHAR(100)
entity_type VARCHAR(100)
entity_id UUID
before_data JSONB NULL
after_data JSONB NULL
metadata JSONB NULL
created_at TIMESTAMPTZ NOT NULL
```

### Rules

- Append-only.
- Không UPDATE/DELETE từ application user.
- Có index theo entity, actor, time.
- Có thể partition theo thời gian khi volume lớn.

### Index

```text
INDEX audit_events_entity(entity_type, entity_id)
INDEX audit_events_actor(actor_id)
INDEX audit_events_created_at(created_at)
```

---

# 51. Reporting Tables

## 51.1 report_requests

```text
id UUID PK
report_type VARCHAR(100)
filters JSONB
requested_by UUID FK
status VARCHAR(30)
requested_at TIMESTAMPTZ
completed_at TIMESTAMPTZ NULL
error_message TEXT NULL
```

## 51.2 generated_documents

```text
id UUID PK
document_type VARCHAR(100)
source_entity_type VARCHAR(100)
source_entity_id UUID
template_version VARCHAR(100)
source_data_version VARCHAR(100) NULL
file_reference VARCHAR(1000)
checksum VARCHAR(128)
generated_by UUID FK
generated_at TIMESTAMPTZ
```

Document phải truy vết được:

```text
Source Data
+
Template Version
+
Generation Time
```

---

# 52. Relationship Summary

```text
cooperatives
 ├── members
 │    └── capital_contributions
 │
 ├── production_units
 │    └── farm_plots
 │         └── member_plot_assignments
 │
 ├── crop_seasons
 │    └── farming_logs
 │         └── material_usages
 │
 ├── harvests
 │    └── lots
 │
 ├── products
 │    └── product_lots
 │
 ├── materials
 │    ├── stock_receipt_lines
 │    └── stock_issue_lines
 │
 ├── cash_transactions
 ├── receivable_payables
 └── surplus_distribution_plans
```

OCOP:

```text
criteria_versions
 ├── criteria_groups
 │    └── criteria
 │         └── indicators
 │
 ├── scoring_rules
 └── mandatory_conditions

products
    ↓
ocop_applications
    ├── self_assessments
    ├── application_reviews
    ├── evidences
    │    ├── evidence_versions
    │    └── evidence_links → indicators
    └── evaluation_sessions
         ├── evaluator_assignments
         │    └── evaluator_scores
         └── consolidated_results
                ↓
         proposed_classifications
                ↓
           final_decisions
```

---

# 53. Critical Foreign Keys

| Child | FK | Parent |
|---|---|---|
| members | cooperative_id | cooperatives |
| capital_contributions | member_id | members |
| production_units | cooperative_id | cooperatives |
| farm_plots | production_unit_id | production_units |
| member_plot_assignments | member_id | members |
| member_plot_assignments | plot_id | farm_plots |
| crop_seasons | production_unit_id | production_units |
| farming_logs | crop_season_id | crop_seasons |
| farming_logs | plot_id | farm_plots |
| material_usages | farming_log_id | farming_logs |
| material_usages | material_id | materials |
| harvests | crop_season_id | crop_seasons |
| harvests | plot_id | farm_plots |
| lots | harvest_id | harvests |
| products | cooperative_id | cooperatives |
| product_lots | product_id | products |
| product_lots | lot_id | lots |
| materials | cooperative_id | cooperatives |
| stock_receipts | cooperative_id | cooperatives |
| stock_receipt_lines | stock_receipt_id | stock_receipts |
| stock_receipt_lines | material_id | materials |
| stock_issues | cooperative_id | cooperatives |
| stock_issue_lines | stock_issue_id | stock_issues |
| stock_issue_lines | material_id | materials |
| cash_transactions | cooperative_id | cooperatives |
| receivable_payables | cooperative_id | cooperatives |
| settlements | debt_id | receivable_payables |
| criteria_groups | criteria_version_id | criteria_versions |
| criteria | criteria_group_id | criteria_groups |
| indicators | criterion_id | criteria |
| ocop_applications | cooperative_id | cooperatives |
| ocop_applications | product_id | products |
| ocop_applications | criteria_version_id | criteria_versions |
| self_assessments | application_id | ocop_applications |
| self_assessments | indicator_id | indicators |
| evaluation_sessions | application_id | ocop_applications |
| evaluation_sessions | council_level_id | council_levels |
| evaluator_assignments | evaluation_session_id | evaluation_sessions |
| evaluator_scores | assignment_id | evaluator_assignments |
| evaluator_scores | indicator_id | indicators |
| consolidated_results | evaluation_session_id | evaluation_sessions |
| proposed_classifications | result_id | consolidated_results |
| final_decisions | application_id | ocop_applications |
| evidences | application_id | ocop_applications |
| evidence_versions | evidence_id | evidences |
| evidence_links | evidence_id | evidences |
| evidence_links | indicator_id | indicators |
| role_assignments | user_id | users |
| role_assignments | role_id | roles |
| audit_events | actor_id | users |

---

# 54. Index Strategy

## 54.1 Always index

- Foreign keys used for joins/filtering.
- Business codes.
- Status + cooperative_id for list screens.
- Application status.
- Evaluation assignment.
- Evidence application.
- Audit entity/time.

## 54.2 Composite indexes

Examples:

```text
members(cooperative_id, status)

production_units(cooperative_id, status)

farm_plots(production_unit_id, status)

crop_seasons(production_unit_id, status)

farming_logs(crop_season_id, activity_date)

materials(cooperative_id, status)

stock_issues(cooperative_id, issue_date)

ocop_applications(cooperative_id, status)

evidences(application_id, status)

evaluation_sessions(application_id, status)

evaluation_sessions(council_level_id, status)
```

Do not create indexes blindly; verify with actual query plans.

---

# 55. Unique Constraints

Baseline candidates:

```text
cooperatives(cooperative_code)

members(cooperative_id, member_code)

production_units(cooperative_id, unit_code)

farm_plots(production_unit_id, plot_code)

products(cooperative_id, product_code)

materials(cooperative_id, sku)

criteria_versions(version_code)

criteria_groups(criteria_version_id, code)

criteria(criteria_group_id, code)

indicators(criterion_id, code)

ocop_applications(application_number)

self_assessments(application_id, indicator_id)

evaluator_scores(assignment_id, indicator_id)

evidence_versions(evidence_id, version_number)

users(username)

users(email)
```

Any additional unique constraint must be justified by business rules.

---

# 56. Configurable Policy / Reference Strategy

Các giá trị có khả năng thay đổi do chính sách hoặc quy định không được hard-code trực tiếp vào cấu trúc nghiệp vụ nếu không cần thiết.

### Stable core

`users`, `roles`, `permissions`, `cooperatives`, `members`, `evidences`, `audit_events`.

### Configurable reference

`council_levels` và các danh mục nghiệp vụ có khả năng thay đổi theo chính sách.

### Versioned policy

`criteria_versions`, `scoring_rules`, `mandatory_conditions`, workflow versions và document template versions.

### Compatibility principle

- Thay đổi giá trị/quy tắc → ưu tiên configuration/version.
- Thay đổi workflow → ưu tiên workflow version.
- Thay đổi cấu trúc domain → migration có kiểm soát.
- Dữ liệu lịch sử → luôn giữ khả năng đọc và truy vết.

Configuration không có nghĩa là mọi thay đổi pháp lý đều không cần sửa code; mục tiêu là cô lập thay đổi và tránh phá vỡ dữ liệu lịch sử.

---

# 73. Status Modeling

Không nên dùng một bảng status chung cho mọi domain.

Có thể sử dụng:

- PostgreSQL ENUM cho status ổn định;
- VARCHAR + CHECK cho status thay đổi theo workflow;
- reference table khi status cần cấu hình.

OCOP application state:

```text
DRAFT
IN_PROGRESS
SUBMITTED
UNDER_REVIEW
NEED_REVISION
READY_FOR_EVALUATION
EVALUATING
CONSOLIDATING
PROPOSED
DECIDED
CANCELLED
REJECTED
```

Các trạng thái `CANCELLED`/`REJECTED` cần xác nhận trước production.

---

# 73. Versioning Strategy

## 57.1 Criteria

Không update destructively:

```text
CriteriaVersion V1
CriteriaVersion V2
```

Application tham chiếu V1 vẫn giữ V1.

## 57.2 Evidence

```text
Evidence E
 ├── Version 1
 ├── Version 2
 └── Version 3
```

Bản cũ không xóa.

## 57.3 Generated Document

Lưu:

```text
template_version
source_data_version
checksum
generated_at
```

---

# 73. File Storage Design

PostgreSQL:

```text
evidence_versions
    └── file_reference
```

Object Storage:

```text
bucket/
  cooperative/{cooperative_id}/
    application/{application_id}/
      evidence/{evidence_id}/
        v1/{file}
        v2/{file}
```

Không đặt quyền truy cập public cho bucket minh chứng.

Backend phải kiểm tra:

```text
User
 → Permission
 → Data Scope
 → Application
 → Evidence
 → Object
```

Không cho client tự quyết định object key để bypass authorization.

---

# 73. Transaction Boundaries

## 59.1 Member approval

```text
BEGIN
  update member
  create audit
COMMIT
```

## 59.2 Stock issue

```text
BEGIN
  validate stock
  create stock issue
  create issue lines
  create inventory ledger/transaction
  create debt if applicable
  create audit
COMMIT
```

## 59.3 OCOP self assessment

```text
BEGIN
  save assessment
  link evidence
  calculate derived progress
  create audit
COMMIT
```

## 59.4 Evaluation consolidation

```text
BEGIN
  lock/validate evaluator scores
  calculate consolidated result
  evaluate mandatory conditions
  create result
  create audit
COMMIT
```

Không tạo kết quả tổng hợp một phần.

---

# 73. Concurrency and Locking

Các thao tác nhạy cảm:

- xuất kho;
- kiểm kê;
- chốt tài chính;
- khóa evaluator score;
- consolidate evaluation;
- final decision.

cần transaction isolation/locking phù hợp.

Ví dụ tồn kho:

```text
SELECT ... FOR UPDATE
```

hoặc ledger/optimistic concurrency tùy implementation.

Không dùng locking tùy tiện trên các bảng lớn.

---

# 73. Data Integrity Rules

## 61.1 Monetary

```text
amount > 0
```

## 61.2 Quantity

```text
quantity > 0
```

## 61.3 Dates

```text
end_date >= start_date
```

## 61.4 Scores

```text
0 <= score <= max_score
```

Phần `score <= max_score` cần service/trigger vì max_score nằm ở bảng liên quan.

## 61.5 OCOP

Application:

```text
product.cooperative_id = application.cooperative_id
```

Criteria:

```text
indicator.criteria_version
=
application.criteria_version
```

Đây là cross-table invariant; nên enforce ở service layer và có thể tăng cường bằng trigger/design phù hợp.

---

# 73. Tenant Isolation

Mọi entity tenant-bound phải có:

```text
cooperative_id
```

hoặc truy ra được qua parent.

Các query phải luôn được scope:

```text
WHERE cooperative_id = :current_scope
```

Các bảng không có `cooperative_id` trực tiếp phải được kiểm tra qua FK chain.

Có thể triển khai PostgreSQL RLS cho dữ liệu nhạy cảm sau khi authorization model ổn định.

---

# 73. Audit Strategy

Audit các hành động tối thiểu:

```text
CREATE
UPDATE
SUBMIT
APPROVE
REJECT
LOCK
UNLOCK
UPLOAD
REPLACE
VERIFY
ASSIGN
SCORE
CONSOLIDATE
CLASSIFY
DECIDE
EXPORT
LOGIN
PERMISSION_CHANGE
```

Không log file binary vào audit; chỉ log metadata/reference/checksum.

---

# 73. Backup and Recovery

## Database

- Full backup định kỳ.
- WAL/PITR nếu hạ tầng hỗ trợ.
- Kiểm tra restore định kỳ.

## Object Storage

- Backup/versioning phù hợp.
- Không chỉ backup database mà bỏ object storage.
- Kiểm tra checksum khi cần.

## Recovery

Mục tiêu RPO/RTO cụ thể chưa được xác định trong upstream, vì vậy không hard-code ở đây.

---

# 73. Migration Strategy

Mọi thay đổi schema phải đi qua migration:

```text
001_create_cooperatives
002_create_members
003_create_agriculture
004_create_inventory
005_create_finance
006_create_ocop_criteria
007_create_ocop_applications
008_create_evaluation
009_create_evidence
010_create_workflow
011_create_identity
012_create_audit
013_create_reporting
```

Tên migration thực tế phụ thuộc framework.

Không sửa trực tiếp production database.

---

# 73. Seed Data

Có thể seed:

- Roles.
- Permissions.
- System configuration.
- Status/reference values.
- Demo cooperative.
- Demo members.
- Demo product.
- Demo criteria version nếu là dữ liệu được cung cấp.

Không seed dữ liệu pháp lý/OCOP chính thức nếu chưa xác minh nguồn.

---

# 73. ERD Logical View

```text
COOPERATIVE
   │
   ├──< MEMBER ──< CAPITAL_CONTRIBUTION
   │
   ├──< PRODUCTION_UNIT ──< FARM_PLOT
   │                         │
   │                         └──< MEMBER_PLOT_ASSIGNMENT >── MEMBER
   │
   ├──< CROP_SEASON
   │        └──< FARMING_LOG
   │                 └──< MATERIAL_USAGE >── MATERIAL
   │
   ├──< PRODUCT >──< PRODUCT_LOT >── LOT >── HARVEST
   │
   ├──< MATERIAL
   │        ├──< STOCK_RECEIPT_LINE
   │        └──< STOCK_ISSUE_LINE
   │
   ├──< CASH_TRANSACTION
   ├──< RECEIVABLE_PAYABLE ──< SETTLEMENT
   └──< SURPLUS_DISTRIBUTION_PLAN ──< ITEM
```

OCOP:

```text
CRITERIA_VERSION
   ├──< CRITERIA_GROUP
   │       └──< CRITERION
   │               └──< INDICATOR
   ├──< SCORING_RULE
   └──< MANDATORY_CONDITION

PRODUCT
   └──< OCOP_APPLICATION
          ├──< SELF_ASSESSMENT >── INDICATOR
          ├──< APPLICATION_REVIEW
          ├──< EVIDENCE
          │      └──< EVIDENCE_VERSION
          │
          └──< EVALUATION_SESSION
                 ├──< EVALUATOR_ASSIGNMENT
                 │       └──< EVALUATOR_SCORE >── INDICATOR
                 └──< CONSOLIDATED_RESULT
                          └── PROPOSED_CLASSIFICATION

OCOP_APPLICATION
   └── FINAL_DECISION
```

---

# 73. Potential Design Adjustments

Các điểm cần review trước khi đóng schema:

1. `workflow_instances.entity_id` polymorphic reference có thể đổi thành các workflow relation cụ thể.
2. `identity_information JSONB` có thể tách thành cột chuẩn hóa nếu nghiệp vụ cần tìm kiếm/reporting thường xuyên.
3. `legal_information JSONB`, `contact_information JSONB` tương tự.
4. Nếu GIS là chức năng thật sự, nên dùng PostGIS.
5. Inventory nên có ledger rõ ràng thay vì chỉ tính từ phiếu nhập/xuất.
6. Lot model cần xác nhận quan hệ một Harvest → một hay nhiều Lot.
7. Finance cần xác nhận có accounting chart/period closing hay không.
8. OCOP criteria cần xác nhận cấu trúc thực tế của bộ tiêu chí.
9. Evidence cần xác nhận retention/legal-signature requirement.
10. Final Decision cần xác nhận tài liệu quyết định có phải bắt buộc lưu bản điện tử hay không.

---

# 73. Traceability: Domain → Database

| Domain Object | Table |
|---|---|
| Cooperative | cooperatives |
| Member | members |
| CapitalContribution | capital_contributions |
| Meeting | meetings |
| Vote | votes |
| ProductionUnit | production_units |
| FarmPlot | farm_plots |
| MemberPlotAssignment | member_plot_assignments |
| CropSeason | crop_seasons |
| FarmingLog | farming_logs |
| MaterialUsage | material_usages |
| PHI | phi_calculations |
| Harvest | harvests |
| Lot | lots |
| Product | products |
| Material | materials |
| StockReceipt | stock_receipts |
| StockIssue | stock_issues |
| StockCount | stock_counts |
| CashTransaction | cash_transactions |
| ReceivablePayable | receivable_payables |
| Settlement | settlements |
| SurplusDistributionPlan | surplus_distribution_plans |
| CriteriaVersion | criteria_versions |
| CriteriaGroup | criteria_groups |
| Criterion | criteria |
| Indicator | indicators |
| ScoringRule | scoring_rules |
| MandatoryCondition | mandatory_conditions |
| OCOPApplication | ocop_applications |
| SelfAssessment | self_assessments |
| ApplicationReview | application_reviews |
| CouncilLevel | council_levels |
| EvaluationSession | evaluation_sessions |
| EvaluatorAssignment | evaluator_assignments |
| EvaluatorScore | evaluator_scores |
| ConsolidatedResult | consolidated_results |
| ProposedClassification | proposed_classifications |
| FinalDecision | final_decisions |
| Evidence | evidences |
| EvidenceVersion | evidence_versions |
| EvidenceLink | evidence_links |
| WorkflowInstance | workflow_instances |
| WorkflowTransition | workflow_transitions |
| UserAccount | users |
| Role | roles |
| Permission | permissions |
| RoleAssignment | role_assignments |
| DataScope | data_scopes |
| AuditEvent | audit_events |
| ReportRequest | report_requests |
| GeneratedDocument | generated_documents |

---

# 73. Definition of Done

`11_DATABASE_DESIGN.md` được xem là đủ điều kiện cho API Design khi:

- [ ] Tất cả P0 domain objects có persistence strategy.
- [ ] PK/FK được xác định.
- [ ] Unique constraints được xác định.
- [ ] Check constraints quan trọng được xác định.
- [ ] Index strategy được xác định.
- [ ] Tenant isolation được xác định.
- [ ] Evidence/file storage được tách khỏi database.
- [ ] Criteria Version immutable strategy được xác định.
- [ ] Council Level được thiết kế dạng reference/configuration, không hard-code trong evaluation session.
- [ ] Chính sách/version được tách khỏi stable core để thích ứng thay đổi quy định.
- [ ] Evidence versioning được xác định.
- [ ] Evaluation score locking được xác định.
- [ ] Proposed Classification và Final Decision tách biệt.
- [ ] Audit strategy được xác định.
- [ ] Backup/recovery strategy được xác định.
- [ ] Migration strategy được xác định.
- [ ] Các cross-table invariants được liệt kê.
- [ ] Các điểm chưa xác minh không bị hard-code.
- [ ] ERD logical view có thể chuyển thành physical ERD.

---

# 73. Open Questions

| ID | Question | Priority |
|---|---|---|
| DB-OQ-001 | Có sử dụng PostGIS trong MVP không? | High |
| DB-OQ-002 | Một Harvest tạo một hay nhiều Lot? | High |
| DB-OQ-003 | Inventory có cần ledger transaction riêng không? | Critical |
| DB-OQ-004 | Có cần accounting period/closing không? | High |
| DB-OQ-005 | Criteria Version chính thức có cấu trúc nhóm/criterion/indicator thế nào? | Critical |
| DB-OQ-006 | Điểm được làm tròn theo quy tắc nào? | Critical |
| DB-OQ-007 | Có cần ký số cho hồ sơ/tài liệu không? | High |
| DB-OQ-008 | Có cần lưu bản scan Final Decision không? | High |
| DB-OQ-009 | Retention minh chứng bao lâu? | High |
| DB-OQ-010 | Có cần PostgreSQL RLS ngay từ MVP không? | Medium |
| DB-OQ-011 | RPO/RTO mục tiêu là bao nhiêu? | High |
| DB-OQ-012 | Công thức phân phối thặng dư chính thức là gì? | Critical |
| DB-OQ-013 | Danh mục cấp đánh giá/hội đồng có cần version theo từng bộ quy định không? | Critical |

---

# 73. Next Documents

Sau khi `11_DATABASE_DESIGN.md` được review:

```text
11_DATABASE_DESIGN.md
        ↓
12_API_SPECIFICATION.md
        ↓
13_SYSTEM_ARCHITECTURE.md
        ↓
14_SECURITY_DESIGN.md
        ↓
15_UI_UX_SPECIFICATION.md
        ↓
Implementation
```

`12_API_SPECIFICATION.md` phải sử dụng:

```text
Use Cases
+
Functional Requirements
+
Domain Model
+
Database Design
+
Authorization Model
```

Không thiết kế API chỉ bằng cách chuyển tên database table thành endpoint.
