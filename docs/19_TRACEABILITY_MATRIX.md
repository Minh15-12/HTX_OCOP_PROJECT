# 19_TRACEABILITY_MATRIX.md

# Ma trận truy xuất nguồn gốc yêu cầu (Requirements Traceability Matrix)

## 1. Document Information

| Field | Value |
|---|---|
| Document ID | 19 |
| Document Name | Requirements Traceability Matrix |
| Project | Xây dựng Hệ thống quản lý hoạt động Hợp tác xã nông nghiệp và số hóa hồ sơ đánh giá, phân hạng OCOP |
| Status | Baseline |
| Purpose | Liên kết yêu cầu nghiệp vụ với chức năng, Use Case, Workflow, Permission, API, Database và Test Case |
| Depends On | 01–18 |
| Next Document | 20_DATABASE_MIGRATIONS.md |

---

# 2. Mục tiêu

Ma trận này bảo đảm mỗi yêu cầu quan trọng của hệ thống đều có đường truy xuất xuyên suốt:

```text
Business Requirement
        ↓
Functional Requirement
        ↓
Use Case
        ↓
Workflow / Business Rule
        ↓
Permission
        ↓
API
        ↓
Database
        ↓
Test Case
```

Mục tiêu chính:

1. Không có yêu cầu nghiệp vụ bị bỏ quên khi triển khai.
2. Không xây dựng chức năng không có nguồn gốc yêu cầu.
3. Có thể truy ngược từ API/Database về yêu cầu nghiệp vụ.
4. Có thể kiểm thử từng yêu cầu.
5. Khi chính sách OCOP thay đổi, xác định được phạm vi ảnh hưởng.
6. Hỗ trợ AI coding agent hiểu quan hệ giữa các tài liệu dự án.

---

# 3. Nguyên tắc truy xuất

## 3.1. Một chiều từ nghiệp vụ đến kỹ thuật

Mọi chức năng quan trọng phải bắt đầu từ một nhu cầu nghiệp vụ hoặc yêu cầu hệ thống đã được phê duyệt.

```text
BR → FR → UC → WF/BRULE → PERM → API → DB → TC
```

## 3.2. Truy xuất ngược

Cũng phải hỗ trợ:

```text
TC → API → FR → BR
DB Table → Module → FR → BR
API → UC → FR → BR
Permission → UC → FR → BR
```

## 3.3. Không suy diễn yêu cầu

Nếu một chức năng chưa có trong tài liệu yêu cầu:

```text
Status = TO_VERIFY
```

Không tự động coi chức năng đó là bắt buộc.

## 3.4. Phân biệt nguồn

Các yêu cầu cần được phân loại:

| Source Type | Ý nghĩa |
|---|---|
| FACT | Thông tin đã được xác nhận |
| SOURCE | Yêu cầu/quy định lấy từ nguồn chính thức |
| PROPOSED | Đề xuất thiết kế của nhóm |
| TO_VERIFY | Chưa đủ căn cứ, cần xác minh |

---

# 4. Quy ước ID

| Prefix | Ý nghĩa |
|---|---|
| BR | Business Requirement |
| FR | Functional Requirement |
| NFR | Non-functional Requirement |
| UC | Use Case |
| BRULE | Business Rule |
| WF | Workflow |
| PERM | Permission |
| API | API endpoint |
| DB | Database object |
| TC | Test Case |
| DOC | Document |
| GAP | Khoảng trống/chưa xác minh |

Ví dụ:

```text
BR-OCOP-001
FR-OCOP-001
UC-OCOP-001
WF-OCOP-001
PERM-OCOP-001
API-OCOP-001
DB-OCOP-001
TC-OCOP-001
```

---

# 5. Business Requirement Traceability

## 5.1. Nhóm BR-COOP — Quản lý HTX và xã viên

| BR ID | Requirement | FR | UC | DB | TC | Status |
|---|---|---|---|---|---|---|
| BR-COOP-001 | Quản lý thông tin HTX | FR-COOP-001 | UC-COOP-001 | DB-COOP-001 | TC-COOP-001 | BASELINE |
| BR-COOP-002 | Quản lý hồ sơ xã viên | FR-COOP-002 | UC-COOP-002 | DB-MEMBER-001 | TC-COOP-002 | BASELINE |
| BR-COOP-003 | Theo dõi trạng thái tham gia HTX của xã viên | FR-COOP-003 | UC-COOP-003 | DB-MEMBER-001 | TC-COOP-003 | BASELINE |
| BR-COOP-004 | Quản lý phân quyền người dùng theo phạm vi HTX | FR-SEC-001 | UC-SEC-001 | DB-USER-001 | TC-SEC-001 | BASELINE |

---

## 5.2. Nhóm BR-AGRI — Quản lý sản xuất nông nghiệp

| BR ID | Requirement | FR | UC | DB | TC | Status |
|---|---|---|---|---|---|---|
| BR-AGRI-001 | Quản lý đơn vị/vùng sản xuất | FR-AGRI-001 | UC-AGRI-001 | DB-PRODUCTION-001 | TC-AGRI-001 | BASELINE |
| BR-AGRI-002 | Quản lý thửa/vùng trồng | FR-AGRI-002 | UC-AGRI-002 | DB-FARM-PLOT-001 | TC-AGRI-002 | BASELINE |
| BR-AGRI-003 | Quản lý mùa vụ | FR-AGRI-003 | UC-AGRI-003 | DB-SEASON-001 | TC-AGRI-003 | BASELINE |
| BR-AGRI-004 | Ghi nhận nhật ký sản xuất | FR-AGRI-004 | UC-AGRI-004 | DB-FARM-LOG-001 | TC-AGRI-004 | BASELINE |
| BR-AGRI-005 | Ghi nhận thu hoạch/lô thu hoạch | FR-AGRI-005 | UC-AGRI-005 | DB-HARVEST-001 | TC-AGRI-005 | BASELINE |

---

# 6. Nhóm BR-INV — Vật tư và kho

| BR ID | Requirement | FR | UC | DB | TC | Status |
|---|---|---|---|---|---|---|
| BR-INV-001 | Quản lý danh mục vật tư | FR-INV-001 | UC-INV-001 | DB-MATERIAL-001 | TC-INV-001 | BASELINE |
| BR-INV-002 | Quản lý kho | FR-INV-002 | UC-INV-002 | DB-WAREHOUSE-001 | TC-INV-002 | BASELINE |
| BR-INV-003 | Nhập kho | FR-INV-003 | UC-INV-003 | DB-INVENTORY-TX-001 | TC-INV-003 | BASELINE |
| BR-INV-004 | Xuất kho | FR-INV-004 | UC-INV-004 | DB-INVENTORY-TX-001 | TC-INV-004 | BASELINE |
| BR-INV-005 | Kiểm kê/đối chiếu tồn kho | FR-INV-005 | UC-INV-005 | DB-INVENTORY-TX-001 | TC-INV-005 | BASELINE |

---

# 7. Nhóm BR-FIN — Tài chính

| BR ID | Requirement | FR | UC | DB | TC | Status |
|---|---|---|---|---|---|---|
| BR-FIN-001 | Ghi nhận thu | FR-FIN-001 | UC-FIN-001 | DB-FIN-001 | TC-FIN-001 | BASELINE |
| BR-FIN-002 | Ghi nhận chi | FR-FIN-002 | UC-FIN-002 | DB-FIN-001 | TC-FIN-002 | BASELINE |
| BR-FIN-003 | Quản lý công nợ phải thu/phải trả | FR-FIN-003 | UC-FIN-003 | DB-RECEIVABLE-001 | TC-FIN-003 | BASELINE |
| BR-FIN-004 | Đối chiếu giao dịch tài chính | FR-FIN-004 | UC-FIN-004 | DB-FIN-001 | TC-FIN-004 | BASELINE |
| BR-FIN-005 | Lập phương án phân phối kết quả/thặng dư | FR-FIN-005 | UC-FIN-005 | DB-DISTRIBUTION-001 | TC-FIN-005 | BASELINE |

> Ghi chú: các quy tắc pháp lý cụ thể về kế toán, phân phối và tỷ lệ phải được đối chiếu với quy định áp dụng trước khi triển khai thành business rule cứng.

---

# 8. Nhóm BR-PROD — Sản phẩm và lô sản phẩm

| BR ID | Requirement | FR | UC | DB | TC | Status |
|---|---|---|---|---|---|---|
| BR-PROD-001 | Quản lý sản phẩm của HTX | FR-PROD-001 | UC-PROD-001 | DB-PRODUCT-001 | TC-PROD-001 | BASELINE |
| BR-PROD-002 | Quản lý lô sản phẩm | FR-PROD-002 | UC-PROD-002 | DB-LOT-001 | TC-PROD-002 | BASELINE |
| BR-PROD-003 | Liên kết lô với nguồn sản xuất | FR-PROD-003 | UC-PROD-003 | DB-LOT-001 | TC-PROD-003 | BASELINE |
| BR-PROD-004 | Truy xuất nguồn gốc nội bộ | FR-PROD-004 | UC-PROD-004 | DB-LOT-001 | TC-PROD-004 | BASELINE |

---

# 9. Nhóm BR-OCOP — Hồ sơ OCOP

| BR ID | Requirement | FR | UC | WF | DB | TC | Status |
|---|---|---|---|---|---|---|---|
| BR-OCOP-001 | Quản lý phiên bản bộ tiêu chí OCOP | FR-OCOP-001 | UC-OCOP-001 | WF-OCOP-001 | DB-CRITERIA-001 | TC-OCOP-001 | BASELINE |
| BR-OCOP-002 | Tạo hồ sơ sản phẩm OCOP | FR-OCOP-002 | UC-OCOP-002 | WF-OCOP-001 | DB-APPLICATION-001 | TC-OCOP-002 | BASELINE |
| BR-OCOP-003 | Quản lý nhóm tiêu chí/chỉ tiêu | FR-OCOP-003 | UC-OCOP-003 | WF-OCOP-001 | DB-CRITERIA-001 | TC-OCOP-003 | BASELINE |
| BR-OCOP-004 | Nhập và quản lý minh chứng | FR-OCOP-004 | UC-OCOP-004 | WF-EVIDENCE-001 | DB-EVIDENCE-001 | TC-OCOP-004 | BASELINE |
| BR-OCOP-005 | Tự đánh giá điểm | FR-OCOP-005 | UC-OCOP-005 | WF-OCOP-001 | DB-SCORE-001 | TC-OCOP-005 | BASELINE |
| BR-OCOP-006 | Tiếp nhận/chuyển hồ sơ theo workflow | FR-OCOP-006 | UC-OCOP-006 | WF-OCOP-001 | DB-APPLICATION-001 | TC-OCOP-006 | BASELINE |
| BR-OCOP-007 | Ghi nhận phiên đánh giá | FR-OCOP-007 | UC-OCOP-007 | WF-EVALUATION-001 | DB-EVALUATION-001 | TC-OCOP-007 | BASELINE |
| BR-OCOP-008 | Ghi nhận điểm của đánh giá viên/hội đồng | FR-OCOP-008 | UC-OCOP-008 | WF-EVALUATION-001 | DB-SCORE-001 | TC-OCOP-008 | BASELINE |
| BR-OCOP-009 | Tổng hợp và khóa kết quả đánh giá | FR-OCOP-009 | UC-OCOP-009 | WF-EVALUATION-001 | DB-SCORE-001 | TC-OCOP-009 | BASELINE |
| BR-OCOP-010 | Quản lý kết quả và trạng thái hồ sơ | FR-OCOP-010 | UC-OCOP-010 | WF-OCOP-001 | DB-APPLICATION-001 | TC-OCOP-010 | BASELINE |

---

# 10. Hội đồng đánh giá và cấp đánh giá

Hệ thống không hard-code cấp đánh giá trực tiếp trong logic ứng dụng.

Baseline hiện tại trong thiết kế:

```text
PROVINCE
CENTRAL
```

| Requirement | Thiết kế | Traceability |
|---|---|---|
| Lưu cấp đánh giá | `evaluation_sessions.council_level_id` | BR-OCOP → FR-OCOP → DB |
| Hỗ trợ cấp tỉnh | Reference `PROVINCE` | FR-OCOP-007 |
| Hỗ trợ cấp trung ương | Reference `CENTRAL` | FR-OCOP-007 |
| Có thể bổ sung cấp/quy trình trong tương lai | Reference/configuration | BR-OCOP-001 |
| Không làm mất dữ liệu lịch sử khi chính sách thay đổi | Versioning + immutable history | BR-SEC/BR-OCOP |

Nếu chính sách thay đổi, phải tạo cấu hình/phiên bản mới thay vì sửa dữ liệu lịch sử.

---

# 11. Nhóm BR-EVIDENCE — Minh chứng

| BR ID | Requirement | FR | UC | DB | TC |
|---|---|---|---|---|---|
| BR-EVIDENCE-001 | Upload minh chứng | FR-EVIDENCE-001 | UC-EVIDENCE-001 | DB-EVIDENCE-001 | TC-EVIDENCE-001 |
| BR-EVIDENCE-002 | Quản lý phiên bản minh chứng | FR-EVIDENCE-002 | UC-EVIDENCE-002 | DB-EVIDENCE-VERSION-001 | TC-EVIDENCE-002 |
| BR-EVIDENCE-003 | Liên kết minh chứng với tiêu chí | FR-EVIDENCE-003 | UC-EVIDENCE-003 | DB-EVIDENCE-LINK-001 | TC-EVIDENCE-003 |
| BR-EVIDENCE-004 | Kiểm soát quyền truy cập file | FR-EVIDENCE-004 | UC-EVIDENCE-004 | DB-EVIDENCE-001 | TC-EVIDENCE-004 |
| BR-EVIDENCE-005 | Bảo đảm tính toàn vẹn file | FR-EVIDENCE-005 | UC-EVIDENCE-005 | DB-EVIDENCE-VERSION-001 | TC-EVIDENCE-005 |

---

# 12. Nhóm BR-WORKFLOW — Quy trình

| BR ID | Requirement | FR | UC | WF | TC |
|---|---|---|---|---|---|
| BR-WF-001 | Hồ sơ có trạng thái rõ ràng | FR-WF-001 | UC-WF-001 | WF-OCOP-001 | TC-WF-001 |
| BR-WF-002 | Chỉ được thực hiện transition hợp lệ | FR-WF-002 | UC-WF-002 | WF-OCOP-001 | TC-WF-002 |
| BR-WF-003 | Có luồng trả hồ sơ/chỉnh sửa | FR-WF-003 | UC-WF-003 | WF-OCOP-001 | TC-WF-003 |
| BR-WF-004 | Có luồng nộp lại | FR-WF-004 | UC-WF-004 | WF-OCOP-001 | TC-WF-004 |
| BR-WF-005 | Có lịch sử transition | FR-WF-005 | UC-WF-005 | WF-OCOP-001 | TC-WF-005 |
| BR-WF-006 | Workflow có thể version hóa | FR-WF-006 | UC-WF-006 | WF-OCOP-001 | TC-WF-006 |

---

# 13. Nhóm BR-AUDIT — Audit

| BR ID | Requirement | FR | UC | DB | TC |
|---|---|---|---|---|---|
| BR-AUDIT-001 | Ghi nhận thao tác quan trọng | FR-AUDIT-001 | UC-AUDIT-001 | DB-AUDIT-001 | TC-AUDIT-001 |
| BR-AUDIT-002 | Không cho người dùng tùy ý sửa audit log | FR-AUDIT-002 | UC-AUDIT-002 | DB-AUDIT-001 | TC-AUDIT-002 |
| BR-AUDIT-003 | Truy xuất lịch sử hồ sơ | FR-AUDIT-003 | UC-AUDIT-003 | DB-AUDIT-001 | TC-AUDIT-003 |
| BR-AUDIT-004 | Theo dõi thay đổi dữ liệu nhạy cảm | FR-AUDIT-004 | UC-AUDIT-004 | DB-AUDIT-001 | TC-AUDIT-004 |

---

# 14. Nhóm BR-REPORT — Báo cáo và hồ sơ

| BR ID | Requirement | FR | UC | API | TC |
|---|---|---|---|---|---|
| BR-REPORT-001 | Dashboard tổng quan | FR-REPORT-001 | UC-REPORT-001 | API-REPORT-001 | TC-REPORT-001 |
| BR-REPORT-002 | Báo cáo xã viên | FR-REPORT-002 | UC-REPORT-002 | API-REPORT-002 | TC-REPORT-002 |
| BR-REPORT-003 | Báo cáo vùng sản xuất | FR-REPORT-003 | UC-REPORT-003 | API-REPORT-003 | TC-REPORT-003 |
| BR-REPORT-004 | Báo cáo vật tư/tồn kho | FR-REPORT-004 | UC-REPORT-004 | API-REPORT-004 | TC-REPORT-004 |
| BR-REPORT-005 | Báo cáo tài chính | FR-REPORT-005 | UC-REPORT-005 | API-REPORT-005 | TC-REPORT-005 |
| BR-REPORT-006 | Xuất hồ sơ/tài liệu | FR-REPORT-006 | UC-REPORT-006 | API-DOC-001 | TC-REPORT-006 |

---

# 15. Nhóm BR-SEC — Bảo mật và phân quyền

| BR ID | Requirement | FR | UC | PERM | TC |
|---|---|---|---|---|---|
| BR-SEC-001 | Xác thực người dùng | FR-SEC-001 | UC-SEC-001 | PERM-SEC-001 | TC-SEC-001 |
| BR-SEC-002 | Phân quyền theo vai trò | FR-SEC-002 | UC-SEC-002 | PERM-SEC-002 | TC-SEC-002 |
| BR-SEC-003 | Giới hạn dữ liệu theo HTX | FR-SEC-003 | UC-SEC-003 | PERM-SEC-003 | TC-SEC-003 |
| BR-SEC-004 | Bảo vệ tài liệu/minh chứng | FR-SEC-004 | UC-SEC-004 | PERM-SEC-004 | TC-SEC-004 |
| BR-SEC-005 | Audit thao tác nhạy cảm | FR-SEC-005 | UC-SEC-005 | PERM-SEC-005 | TC-SEC-005 |
| BR-SEC-006 | Áp dụng nguyên tắc least privilege | FR-SEC-006 | UC-SEC-006 | PERM-SEC-006 | TC-SEC-006 |

---

# 16. Non-functional Requirements Traceability

| NFR ID | Requirement | Architecture | Security | DB | Test |
|---|---|---|---|---|---|
| NFR-001 | API phải bảo đảm xác thực và phân quyền | DOC-13 | DOC-14 | — | TC-NFR-001 |
| NFR-002 | Dữ liệu giữa các HTX phải được cô lập | DOC-13 | DOC-14/15 | cooperative_id | TC-NFR-002 |
| NFR-003 | File minh chứng không được public mặc định | DOC-13 | DOC-14 | evidence | TC-NFR-003 |
| NFR-004 | Giao dịch tồn kho phải có tính toàn vẹn | DOC-13 | — | transaction/constraint | TC-NFR-004 |
| NFR-005 | Giao dịch tài chính phải có tính toàn vẹn | DOC-13 | — | transaction/constraint | TC-NFR-005 |
| NFR-006 | Audit phải có khả năng truy xuất lịch sử | DOC-13 | DOC-14 | audit_logs | TC-NFR-006 |
| NFR-007 | Hồ sơ OCOP lịch sử không bị thay đổi ngoài quy trình | DOC-13 | DOC-14/16 | versioning | TC-NFR-007 |
| NFR-008 | Hệ thống phải hỗ trợ backup/restore | DOC-13 | DOC-14 | backup | TC-NFR-008 |
| NFR-009 | PDF/DOCX có thể được tạo bất đồng bộ | DOC-13 | — | job metadata | TC-NFR-009 |
| NFR-010 | Hệ thống phải có khả năng mở rộng cấu hình chính sách | DOC-13 | — | versioned configuration | TC-NFR-010 |

---

# 17. Functional Requirement → Use Case

Ma trận tổng hợp:

| FR Group | Use Cases |
|---|---|
| FR-COOP | UC-COOP-001..003 |
| FR-AGRI | UC-AGRI-001..005 |
| FR-INV | UC-INV-001..005 |
| FR-FIN | UC-FIN-001..005 |
| FR-PROD | UC-PROD-001..004 |
| FR-OCOP | UC-OCOP-001..010 |
| FR-EVIDENCE | UC-EVIDENCE-001..005 |
| FR-WF | UC-WF-001..006 |
| FR-AUDIT | UC-AUDIT-001..004 |
| FR-REPORT | UC-REPORT-001..006 |
| FR-SEC | UC-SEC-001..006 |

Các ID chi tiết phải được giữ đồng nhất với `08_FUNCTIONAL_REQUIREMENTS.md` và `09_USE_CASES_FINAL.md`.

---

# 18. Use Case → Workflow

## 18.1. OCOP

```text
UC-OCOP-002
Tạo hồ sơ
        ↓
WF-OCOP-001
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

Luồng thực tế phải được cấu hình theo workflow version tương ứng với chính sách áp dụng.

---

# 19. Workflow → Permission

| Workflow Action | Permission cần kiểm tra |
|---|---|
| Create application | `ocop.application.create` |
| Submit application | `ocop.application.submit` |
| Review application | `ocop.application.review` |
| Return application | `ocop.application.return` |
| Resubmit application | `ocop.application.resubmit` |
| Start evaluation | `ocop.evaluation.start` |
| Enter score | `ocop.evaluation.score` |
| Consolidate score | `ocop.evaluation.consolidate` |
| Approve | `ocop.application.approve` |
| Reject | `ocop.application.reject` |
| Download evidence | `evidence.read` |
| Generate dossier | `document.generate` |

Không được cho phép một API bypass các permission tương ứng.

---

# 20. Permission → Data Scope

Permission phải được kết hợp với phạm vi dữ liệu.

Ví dụ:

```text
ROLE
  +
PERMISSION
  +
COOPERATIVE SCOPE
  +
RESOURCE OWNERSHIP
  =
AUTHORIZED ACTION
```

Ví dụ:

| Actor | Permission | Scope |
|---|---|---|
| HTX Manager | member.read | HTX của người dùng |
| HTX Manager | member.write | HTX của người dùng |
| Accountant | finance.write | HTX của người dùng |
| Warehouse Staff | inventory.write | Kho được phân công |
| OCOP Officer | ocop.application.write | Hồ sơ được phân công/HTX phù hợp |
| Evaluator | ocop.evaluation.score | Phiên đánh giá được phân công |

---

# 21. API Traceability

## 21.1. API theo module

| Module | API Domain | Primary BR |
|---|---|---|
| Identity | `/auth/*` | BR-SEC |
| Cooperative | `/cooperatives/*` | BR-COOP |
| Members | `/members/*` | BR-COOP |
| Agriculture | `/production-units/*` | BR-AGRI |
| Farm plots | `/farm-plots/*` | BR-AGRI |
| Seasons | `/seasons/*` | BR-AGRI |
| Farming logs | `/farming-logs/*` | BR-AGRI |
| Harvest | `/harvests/*` | BR-AGRI |
| Products | `/products/*` | BR-PROD |
| Inventory | `/materials/*`, `/inventory/*` | BR-INV |
| Finance | `/finance/*` | BR-FIN |
| OCOP Criteria | `/ocop/criteria/*` | BR-OCOP |
| Applications | `/ocop/applications/*` | BR-OCOP |
| Evaluation | `/ocop/evaluations/*` | BR-OCOP |
| Evidence | `/evidence/*` | BR-EVIDENCE |
| Workflow | `/workflows/*` | BR-WF |
| Audit | `/audit/*` | BR-AUDIT |
| Reports | `/reports/*` | BR-REPORT |
| Documents | `/documents/*` | BR-REPORT |

---

# 22. Business Action API Rule

Các thao tác thay đổi trạng thái nghiệp vụ quan trọng phải dùng endpoint biểu diễn hành động.

Không ưu tiên:

```http
PATCH /applications/{id}
{
  "status": "APPROVED"
}
```

Ưu tiên:

```http
POST /applications/{id}/submit
POST /applications/{id}/return
POST /applications/{id}/resubmit
POST /applications/{id}/approve
POST /applications/{id}/reject
```

Lý do:

1. Có thể kiểm tra transition.
2. Có thể kiểm tra permission.
3. Có thể kiểm tra SoD.
4. Có thể ghi audit.
5. Có thể kiểm tra business rule.
6. Dễ truy xuất về Use Case.

---

# 23. Database Traceability

## 23.1. Nhóm dữ liệu HTX

```text
BR-COOP
    ↓
FR-COOP
    ↓
UC-COOP
    ↓
cooperatives
members
users
roles
permissions
```

## 23.2. Nhóm sản xuất

```text
BR-AGRI
    ↓
FR-AGRI
    ↓
UC-AGRI
    ↓
production_units
farm_plots
crops
seasons
farming_logs
harvests
lots
```

## 23.3. Nhóm vật tư

```text
BR-INV
    ↓
FR-INV
    ↓
UC-INV
    ↓
materials
warehouses
inventory_transactions
```

## 23.4. Nhóm tài chính

```text
BR-FIN
    ↓
FR-FIN
    ↓
UC-FIN
    ↓
finance_transactions
receivables
payables
settlements
distribution_plans
```

## 23.5. Nhóm OCOP

```text
BR-OCOP
    ↓
FR-OCOP
    ↓
UC-OCOP
    ↓
criteria_versions
criteria
indicators
applications
evaluation_sessions
evaluation_assignments
evaluation_scores
evidence
evidence_versions
workflow_instances
workflow_transitions
```

---

# 24. Calculation Traceability

Mọi giá trị được tính toán quan trọng phải có nguồn dữ liệu xác định.

Ví dụ:

```text
OCOP Total Score
    ↓
Evaluation Scores
    ↓
Indicators
    ↓
Criteria Version
```

Không lưu một giá trị tổng điểm mà không biết nó được tạo từ:

- phiên bản tiêu chí nào;
- chỉ tiêu nào;
- điểm nào;
- người nhập;
- thời điểm;
- phiên đánh giá nào.

Tương tự:

```text
Inventory Balance
    ↓
Opening Balance
+ Receipts
- Issues
± Adjustments
```

và:

```text
Financial Report
    ↓
Finance Transactions
```

---

# 25. Evidence Traceability

Mỗi minh chứng OCOP phải truy xuất được:

```text
Evidence
 ↓
Evidence Version
 ↓
Criterion / Indicator
 ↓
Application
 ↓
Product
 ↓
Cooperative
```

Thông tin tối thiểu cần giữ:

- evidence ID;
- application ID;
- criterion/indicator ID;
- file/object reference;
- version;
- checksum;
- uploader;
- upload time;
- verification status;
- audit history.

---

# 26. OCOP Historical Traceability

Một hồ sơ lịch sử phải có khả năng xác định:

```text
Application
 ├── Product
 ├── Criteria Version
 ├── Workflow Version
 ├── Evidence Versions
 ├── Evaluation Session
 │     ├── Council Level
 │     ├── Assignments
 │     └── Scores
 └── Final Result
```

Không được phụ thuộc vào phiên bản cấu hình hiện tại để giải thích dữ liệu lịch sử.

---

# 27. Test Traceability

Mỗi BR/FR quan trọng phải có ít nhất một nhóm test.

Ví dụ:

| Requirement | Positive Test | Negative Test | Security Test | Audit Test |
|---|---|---|---|---|
| BR-COOP-002 | Tạo xã viên hợp lệ | Dữ liệu thiếu | Sai quyền | Có audit |
| BR-INV-003 | Nhập kho | Số lượng không hợp lệ | Sai scope | Có audit |
| BR-FIN-002 | Ghi nhận chi | Giá trị không hợp lệ | Sai quyền | Có audit |
| BR-OCOP-005 | Tính điểm | Điểm ngoài phạm vi | Sai evaluator | Có audit |
| BR-OCOP-009 | Khóa điểm | Sửa sau khi khóa | Không đủ quyền | Có audit |
| BR-EVIDENCE-004 | Download hợp lệ | File không tồn tại | Không có quyền | Có audit |
| BR-WF-002 | Transition hợp lệ | Transition sai | Không có permission | Có audit |

---

# 28. Coverage Rules

Trước khi chuyển sang implementation, tối thiểu phải đạt:

| Coverage | Target |
|---|---:|
| BR có FR | 100% |
| FR có UC hoặc system use case | 100% |
| UC quan trọng có workflow/rule | 100% |
| Action nhạy cảm có permission | 100% |
| API nghiệp vụ quan trọng có BR/FR | 100% |
| DB table nghiệp vụ có module/FR | 100% |
| BR quan trọng có test | 100% |
| Security NFR có security test | 100% |
| OCOP policy rule có source/status | 100% |

Nếu chưa đạt, không coi tài liệu là implementation-ready.

---

# 29. Orphan Detection

## 29.1. Orphan Requirement

Requirement không có FR:

```text
BR → X
```

=> GAP.

## 29.2. Orphan Functional Requirement

FR không có BR:

```text
BR ← X ← FR
```

=> kiểm tra xem đây là:

- technical requirement;
- supporting requirement;
- hoặc chức năng dư thừa.

## 29.3. Orphan API

API không truy xuất được về FR:

```text
API → X
```

=> Không triển khai nếu chưa xác định mục đích.

## 29.4. Orphan Database Table

Table không truy xuất được về module/requirement:

```text
DB → X
```

=> Kiểm tra trước khi migration.

---

# 30. Change Impact Analysis

Khi một yêu cầu thay đổi:

```text
Changed BR
 ↓
FR
 ↓
UC
 ↓
Workflow
 ↓
Permission
 ↓
API
 ↓
DB
 ↓
Migration
 ↓
Test
```

Ví dụ chính sách OCOP thay đổi:

```text
Criteria Version
      ↓
Criteria / Indicator
      ↓
Scoring
      ↓
Evaluation Workflow
      ↓
Evaluation API
      ↓
Database configuration
      ↓
Reports / Documents
      ↓
Test cases
```

Không sửa trực tiếp dữ liệu lịch sử.

---

# 31. Change Impact Matrix

| Thay đổi | Kiểm tra |
|---|---|
| Bộ tiêu chí OCOP | Criteria version, scoring, evidence, report |
| Cấp đánh giá | Council level config, workflow, permission |
| Trạng thái hồ sơ | Workflow, API actions, UI, tests |
| Vai trò người dùng | Authorization matrix, API policy |
| Quy tắc tồn kho | Inventory transaction, constraints, reports |
| Quy tắc tài chính | Finance calculation, reports, tests |
| Biểu mẫu hồ sơ | Document template version |
| Minh chứng | Evidence schema, storage, authorization |
| Cấu trúc DB | Migration, API, domain, tests |

---

# 32. Source-of-Truth Hierarchy

Khi có mâu thuẫn giữa tài liệu:

```text
1. Văn bản pháp lý / nguồn chính thức đã xác minh
2. Yêu cầu nghiệp vụ đã được phê duyệt
3. Business Rules
4. Functional Requirements
5. Use Cases
6. Workflow
7. API Specification
8. Database Design
9. Implementation details
```

Tài liệu kỹ thuật không được tự động ghi đè yêu cầu pháp lý/nghiệp vụ.

---

# 33. AI Coding Agent Contract

AI coding agent phải đọc theo thứ tự:

```text
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
```

Sau đó mới đọc:

```text
20_DATABASE_MIGRATIONS.md
```

và các tài liệu implementation.

---

# 34. AI Coding Agent Rules

AI agent phải:

1. Không tự tạo business rule nếu tài liệu chưa có.
2. Không thay đổi schema vì lý do tiện code nếu chưa cập nhật tài liệu.
3. Không hard-code chính sách OCOP nếu chính sách được thiết kế versioned/configurable.
4. Không xóa dữ liệu lịch sử đánh giá.
5. Không cho phép API bypass workflow.
6. Không bỏ qua authorization.
7. Không truy cập file private trực tiếp.
8. Không tự ý thêm module ngoài scope.
9. Khi phát hiện mâu thuẫn tài liệu phải báo `CONFLICT`.
10. Khi thiếu căn cứ phải đánh dấu `TO_VERIFY`.
11. Mọi thay đổi schema phải có migration.
12. Mọi API mới phải được truy xuất về FR/UC.
13. Mọi business action quan trọng phải có audit.
14. Mọi thay đổi làm ảnh hưởng traceability phải cập nhật document tương ứng.

---

# 35. Conflict Resolution

Khi phát hiện:

```text
11_DATABASE_DESIGN
        ≠
10_DOMAIN_MODEL
```

Không tự chọn một bên.

Thực hiện:

```text
1. Xác định conflict
2. Xác định source-of-truth
3. Đánh dấu GAP/CONFLICT
4. Quyết định thiết kế
5. Cập nhật tài liệu liên quan
6. Cập nhật traceability
7. Cập nhật migration/API/test
```

---

# 36. Current Known Gaps

Các điểm cần tiếp tục xác minh trước khi khóa implementation:

| GAP ID | Nội dung | Ảnh hưởng | Status |
|---|---|---|---|
| GAP-001 | Bộ tiêu chí OCOP hiện hành và biểu mẫu tương ứng | Criteria/scoring | TO_VERIFY |
| GAP-002 | Chi tiết quy trình thực tế tại địa phương | Workflow | TO_VERIFY |
| GAP-003 | Danh sách vai trò thực tế của hội đồng/tổ giúp việc | Authorization | TO_VERIFY |
| GAP-004 | Quy tắc kế toán/phân phối áp dụng cho HTX cụ thể | Finance | TO_VERIFY |
| GAP-005 | Bộ biểu mẫu xuất hồ sơ chính thức cần số hóa | Document generation | TO_VERIFY |
| GAP-006 | Cấu trúc kho và nghiệp vụ tồn kho thực tế | Inventory | TO_VERIFY |
| GAP-007 | Có cần quản lý các nghiệp vụ tín dụng/vay nội bộ hay không | Scope | TO_VERIFY |

Các GAP trên không được tự động biến thành mandatory features.

---

# 37. Definition of Traceability Complete

Tài liệu được coi là đủ để chuyển sang migration khi:

- [ ] Tất cả BR đã có FR.
- [ ] Tất cả FR đã có UC hoặc system requirement.
- [ ] Các UC quan trọng có workflow/rule.
- [ ] Các business action có permission.
- [ ] Các API chính truy xuất được về FR.
- [ ] Các bảng DB chính truy xuất được về FR/domain.
- [ ] Các requirement quan trọng có test case.
- [ ] Không còn orphan API quan trọng.
- [ ] Không còn orphan DB table quan trọng.
- [ ] Các conflict đã được xử lý.
- [ ] Các TO_VERIFY quan trọng được đánh dấu.
- [ ] OCOP criteria/versioning đã được thiết kế.
- [ ] Historical data protection đã được xác định.
- [ ] Multi-tenant/data scope đã được xác định.
- [ ] Audit requirements đã được xác định.

---

# 38. Final Traceability Chain

Chuỗi chuẩn của toàn bộ dự án:

```text
PROJECT GOAL
    ↓
BUSINESS PROCESS
    ↓
BUSINESS REQUIREMENT
    ↓
FUNCTIONAL REQUIREMENT
    ↓
USE CASE
    ↓
BUSINESS RULE
    ↓
WORKFLOW
    ↓
PERMISSION
    ↓
API
    ↓
DOMAIN ENTITY
    ↓
DATABASE TABLE
    ↓
MIGRATION
    ↓
IMPLEMENTATION
    ↓
TEST CASE
    ↓
ACCEPTANCE
```

Đây là chuỗi kiểm soát chính để bảo đảm hệ thống được xây dựng đúng nghiệp vụ thay vì chỉ đúng về mặt code.

---

# 39. Relationship With Next Document

Sau `19_TRACEABILITY_MATRIX.md`, tài liệu tiếp theo:

```text
20_DATABASE_MIGRATIONS.md
```

Nhiệm vụ của Document 20:

1. Chuyển Database Design thành migration plan.
2. Xác định thứ tự tạo bảng theo dependency.
3. Xác định extension/enum/reference data.
4. Xác định PK/FK/index/unique/check.
5. Xác định seed data.
6. Xác định migration rollback strategy.
7. Xác định dữ liệu mẫu development.
8. Kiểm tra migration không phá vỡ traceability.
9. Chuẩn bị nền tảng cho backend implementation.

**Không viết migration code trước khi schema dependency được chốt.**
