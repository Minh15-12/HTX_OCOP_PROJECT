# 05_ACTORS_AND_ROLES.md

## 1. Thông tin tài liệu

- **Dự án:** Xây dựng Hệ thống quản lý hoạt động Hợp tác xã nông nghiệp và số hóa hồ sơ đánh giá, phân hạng OCOP
- **Mục đích:** Xác định các tác nhân, vai trò, trách nhiệm, phạm vi thao tác và quan hệ giữa các vai trò trong hệ thống.
- **Nguồn nền:** `04_OCOP_BUSINESS.md` và các tài liệu nghiên cứu A–F của dự án.
- **Trạng thái:** `DRAFT – PENDING VALIDATION`

Tài liệu này tập trung vào **WHO – Ai thực hiện? Ai chịu trách nhiệm? Ai được phép làm gì?**

Đây chưa phải ma trận RBAC kỹ thuật cuối cùng. Việc ánh xạ Role → Permission sẽ được chuẩn hóa ở tài liệu yêu cầu chức năng và thiết kế phân quyền sau khi các vai trò nghiệp vụ được xác minh.

---

# 2. Quy ước mức độ chắc chắn

| Nhãn | Ý nghĩa |
|---|---|
| `CONFIRMED` | Được nguồn nghiên cứu mô tả trực tiếp |
| `INFERRED` | Suy luận hợp lý từ quy trình, chưa được xác nhận trực tiếp |
| `PROPOSED` | Đề xuất cho hệ thống |
| `TO_VERIFY` | Cần xác minh với HTX, cơ quan thực tế hoặc văn bản hiện hành |
| `CONFLICT` | Nguồn có thông tin chưa thống nhất |

> Không được biến `PROPOSED`, `INFERRED` hoặc `TO_VERIFY` thành quyền nghiệp vụ bắt buộc chỉ bằng cách hard-code.

---

# 3. Nguyên tắc thiết kế Actor/Role

## 3.1. Phân biệt Actor và Role

**Actor** là bên tham gia nghiệp vụ.

**Role** là vai trò mà một người dùng có thể đảm nhận trong hệ thống.

Một người có thể có nhiều role:

```text
User
 ├── UserRole
 │      ├── Role
 │      └── Scope
 └── Organization / HTX
```

Không nên mặc định:

```text
1 User = 1 Role
```

mà nên hỗ trợ:

```text
1 User → N Roles
1 Role → N Permissions
1 Role Assignment → 1 Data Scope
```

Đây là **PROPOSED**.

---

# 4. Actor Landscape

```text
                         ┌──────────────────────┐
                         │    SYSTEM ADMIN      │
                         └──────────┬───────────┘
                                    │
                                    ▼
┌────────────────┐          ┌─────────────────────┐
│ HTX / Chủ thể  │─────────▶│   HTX MANAGEMENT    │
└───────┬────────┘          └──────────┬──────────┘
        │                              │
        ▼                              ▼
┌─────────────────┐          ┌────────────────────┐
│ OCOP PREPARATION│─────────▶│ REVIEW / EVALUATION│
└─────────────────┘          └──────────┬─────────┘
                                        │
                         ┌──────────────┼──────────────┐
                         ▼              ▼              ▼
                    REVIEWER        COUNCIL        AUTHORITY
```

Đây là mô hình khái niệm, không khẳng định cơ cấu hành chính thực tế.

---

# 5. Danh sách Actor

| ID | Actor | Mô tả | Status |
|---|---|---|---|
| ACT-01 | Chủ thể OCOP / Đại diện HTX | Chủ thể đăng ký sản phẩm, chuẩn bị hồ sơ và chịu trách nhiệm về thông tin cung cấp | CONFIRMED |
| ACT-02 | Cán bộ phụ trách HTX | Hỗ trợ quản lý dữ liệu và hồ sơ HTX | CONFIRMED/INFERRED |
| ACT-03 | Cán bộ tiếp nhận/kiểm tra | Kiểm tra thành phần hồ sơ và yêu cầu bổ sung | CONFIRMED |
| ACT-04 | Người thẩm định/đánh giá | Kiểm tra hồ sơ, minh chứng và chấm điểm | CONFIRMED |
| ACT-05 | Thành viên Hội đồng | Tham gia đánh giá/chấm điểm nếu quy trình thực tế yêu cầu | CONFIRMED/TO_VERIFY |
| ACT-06 | Thư ký Hội đồng | Tổng hợp hồ sơ, phiếu chấm và biên bản | CONFIRMED/INFERRED |
| ACT-07 | Cấp có thẩm quyền | Xem xét/quyết định/công nhận kết quả theo thẩm quyền | CONFIRMED/TO_VERIFY |
| ACT-08 | Quản trị bộ tiêu chí | Quản lý bộ tiêu chí và phiên bản trong hệ thống | PROPOSED |
| ACT-09 | Quản trị hệ thống | Quản lý tài khoản, cấu hình, phân quyền và vận hành | PROPOSED |
| ACT-10 | Người xem/Báo cáo | Chỉ xem dữ liệu/báo cáo được cấp | PROPOSED |

Nguồn `04_OCOP_BUSINESS.md` xác định nhóm actor gồm chủ thể OCOP/đại diện HTX, cán bộ phụ trách, cán bộ tiếp nhận/kiểm tra, người đánh giá, thành viên Hội đồng, thư ký và cấp có thẩm quyền. fileciteturn11file0L82-L97

---

# 6. R-01 — HTX_OWNER / OCOP_SUBJECT

## Mục đích

Đại diện cho chủ thể OCOP/HTX trong việc chuẩn bị và chịu trách nhiệm về hồ sơ.

## Trách nhiệm

- Quản lý/xác nhận thông tin chủ thể.
- Chọn sản phẩm tham gia.
- Tạo/tiếp nhận hồ sơ.
- Cung cấp thông tin sản phẩm.
- Thực hiện/xác nhận tự đánh giá.
- Cung cấp minh chứng.
- Giải trình.
- Bổ sung hồ sơ.
- Theo dõi trạng thái.
- Xem kết quả.

## Quyền nghiệp vụ đề xuất

| Hành động | Quyền |
|---|---|
| Xem sản phẩm của HTX | ALLOW |
| Tạo hồ sơ OCOP | ALLOW |
| Sửa hồ sơ nháp | ALLOW |
| Tự đánh giá | ALLOW |
| Tải minh chứng | ALLOW |
| Thay thế minh chứng | ALLOW |
| Gửi hồ sơ | ALLOW |
| Xem yêu cầu bổ sung | ALLOW |
| Bổ sung hồ sơ | ALLOW |
| Xem kết quả | ALLOW |
| Chấm điểm chính thức | DENY |
| Phê duyệt kết quả | DENY |
| Sửa điểm Hội đồng | DENY |

**Data Scope:** `Own HTX`.

**Status:** `CONFIRMED + PROPOSED`.

---

# 7. R-02 — HTX_STAFF

## Mục đích

Hỗ trợ HTX quản lý dữ liệu và chuẩn bị hồ sơ.

## Trách nhiệm

- Quản lý dữ liệu xã viên.
- Quản lý vùng trồng.
- Quản lý mùa vụ.
- Ghi nhận nghiệp vụ sản xuất.
- Hỗ trợ vật tư.
- Chuẩn bị dữ liệu OCOP.
- Theo dõi tiến độ hồ sơ.
- Tập hợp minh chứng.

## Không mặc định được

- Phê duyệt kết quả.
- Chấm điểm chính thức.
- Sửa quyết định.
- Thay đổi bộ tiêu chí đang áp dụng.

**Data Scope:** `Own HTX`.

**Status:** `CONFIRMED/INFERRED`.

---

# 8. R-03 — OCOP_PREPARER

## Mục đích

Người chuyên trách chuẩn bị hồ sơ OCOP.

## Trách nhiệm

- Tạo hồ sơ.
- Chọn bộ tiêu chí.
- Điền biểu mẫu.
- Tự đánh giá.
- Gắn tiêu chí với minh chứng.
- Viết giải trình.
- Kiểm tra checklist.
- Chuẩn bị hồ sơ trình.
- Xử lý yêu cầu bổ sung.

## Quyền đề xuất

```text
Application
 ├── CREATE
 ├── READ
 ├── UPDATE_DRAFT
 ├── SELF_ASSESS
 ├── ATTACH_EVIDENCE
 ├── SUBMIT
 └── RESPOND_REVISION
```

**Data Scope:** `Own HTX`.

**Status:** `PROPOSED`.

> Có thể gộp role này với `HTX_STAFF` trong MVP nếu quy mô người dùng nhỏ.

---

# 9. R-04 — RECEIVING_REVIEWER

## Mục đích

Tiếp nhận và kiểm tra tính đầy đủ của hồ sơ.

## Trách nhiệm

- Xem hồ sơ được giao.
- Kiểm tra thành phần.
- Kiểm tra thông tin.
- Kiểm tra minh chứng theo phạm vi được giao.
- Ghi nhận thiếu sót.
- Tạo yêu cầu bổ sung.
- Theo dõi hồ sơ bổ sung.
- Chuyển bước.

## Quyền

| Hành động | Quyền |
|---|---|
| Xem hồ sơ được giao | ALLOW |
| Comment | ALLOW |
| Tạo Revision Request | ALLOW |
| Xác nhận đủ điều kiện kiểm tra | ALLOW |
| Sửa nội dung HTX cung cấp | DENY/CONTROLLED |
| Chấm điểm chính thức | DENY nếu không có role Evaluator |
| Phê duyệt cuối cùng | DENY |

**Data Scope:** `Assigned Applications`.

**Status:** `CONFIRMED/PROPOSED`.

---

# 10. R-05 — EVIDENCE_REVIEWER

## Mục đích

Kiểm tra tình trạng và mức phù hợp của minh chứng theo quy trình được giao.

## Trách nhiệm

- Xem minh chứng.
- Kiểm tra tệp.
- Kiểm tra metadata.
- Ghi nhận nhận xét.
- Đánh dấu trạng thái kiểm tra.
- Yêu cầu thay thế/bổ sung.

## Quyền

```text
Evidence
 ├── READ
 ├── REVIEW
 ├── COMMENT
 ├── VERIFY
 └── REQUEST_REPLACEMENT
```

## Không được

- Tạo minh chứng thay cho chủ thể.
- Xóa lịch sử minh chứng.
- Tự sửa điểm.

**Status:** `PROPOSED`.

---

# 11. R-06 — EVALUATOR

## Mục đích

Thực hiện đánh giá/chấm điểm.

## Trách nhiệm

- Xem hồ sơ đủ điều kiện.
- Xem bộ tiêu chí.
- Xem minh chứng.
- Chấm điểm.
- Nhập nhận xét.
- Hoàn thành phiếu.
- Khóa phiếu khi workflow yêu cầu.

## Quyền

```text
Application      READ
Criteria         READ
Evidence         READ
Evaluation       CREATE
EvaluationScore  CREATE/UPDATE_BEFORE_LOCK
Comment          CREATE
Evaluation       COMPLETE
```

## Không được

- Sửa tiêu chí.
- Sửa minh chứng của chủ thể.
- Sửa điểm evaluator khác.
- Phê duyệt kết quả cuối cùng nếu không có role tương ứng.

Nguồn `04_OCOP_BUSINESS.md` mô tả người đánh giá xem tiêu chí/minh chứng, nhập điểm, nhận xét và hoàn thành phiếu. fileciteturn11file0L330-L358

**Data Scope:** `Assigned Evaluation Sessions`.

---

# 12. R-07 — COUNCIL_MEMBER

## Mục đích

Thành viên Hội đồng tham gia đánh giá/chấm điểm nếu quy trình thực tế có Hội đồng.

## Trách nhiệm

- Xem hồ sơ được phân công.
- Đánh giá độc lập.
- Chấm điểm.
- Nhập nhận xét.
- Hoàn thành phiếu.

## Quyền

Tương tự `EVALUATOR`, nhưng giới hạn trong phiên đánh giá/Hội đồng được phân công.

## Không được

- Xem/sửa phiếu kín của người khác trước thời điểm được phép nếu quy trình yêu cầu độc lập.
- Tự thay đổi kết quả tổng hợp.
- Phê duyệt thay cấp có thẩm quyền.

**Status:** `CONFIRMED/TO_VERIFY`.

Nguồn nghiên cứu cho phép mô hình nhiều người chấm độc lập nhưng cấu trúc Hội đồng và cách vận hành phải xác minh. fileciteturn11file0L347-L358

---

# 13. R-08 — COUNCIL_SECRETARY

## Mục đích

Hỗ trợ quản lý phiên đánh giá và tổng hợp hồ sơ/biên bản.

## Trách nhiệm đề xuất

- Tạo/quản lý phiên đánh giá.
- Gán người đánh giá.
- Theo dõi tình trạng phiếu.
- Tổng hợp điểm.
- Chuẩn bị biên bản.
- Quản lý tài liệu phiên họp.
- Chuyển kết quả sang bước quyết định.

## Không được

- Tự thay đổi điểm evaluator.
- Tự tạo kết quả trái dữ liệu chấm.
- Tự quyết định hạng cuối cùng nếu không có thẩm quyền.

**Status:** `CONFIRMED/INFERRED`.

---

# 14. R-09 — AUTHORITY / DECISION_MAKER

## Mục đích

Thực hiện bước quyết định/công nhận kết quả theo thẩm quyền.

## Trách nhiệm

- Xem hồ sơ và kết quả đánh giá.
- Xem điểm tổng hợp.
- Xem điều kiện khống chế.
- Xem minh chứng cần thiết.
- Chấp thuận/từ chối theo thẩm quyền.
- Ghi nhận quyết định.
- Xác định kết quả cuối cùng.

## Quyền

```text
Application          READ
Evaluation           READ
Score                READ
Evidence             READ
ProposedResult       READ
Decision              CREATE
FinalResult           CONFIRM
```

## Không được

- Sửa dữ liệu gốc của HTX để đạt điểm.
- Xóa audit history.
- Xóa phiếu chấm.

### Quan trọng

Cấp có thẩm quyền cụ thể **chưa được hard-code**.

Nguồn nghiên cứu mô tả các cấp phê duyệt theo hạng nhưng `04_OCOP_BUSINESS.md` xác định đây là điểm cần xác minh. fileciteturn11file0L586-L604

**Status:** `CONFIRMED/TO_VERIFY`.

---

# 15. R-10 — CRITERIA_ADMIN

## Mục đích

Quản lý bộ tiêu chí dưới dạng dữ liệu cấu hình.

## Trách nhiệm

- Tạo bộ tiêu chí.
- Tạo phiên bản.
- Nhập nhóm tiêu chí.
- Nhập tiêu chí/chỉ tiêu.
- Khai báo điểm tối đa.
- Khai báo điều kiện bắt buộc/khống chế.
- Gắn nguồn văn bản.
- Quản lý ngày hiệu lực.
- Phát hành phiên bản.

## Quyền

```text
CriteriaSet      CREATE/READ/UPDATE
CriteriaVersion  CREATE/READ/UPDATE/DRAFT
Criterion        CREATE/READ/UPDATE
ScoringRule      CREATE/READ/UPDATE
PublishVersion   ALLOW
```

## Boundary

Không sửa phiên bản đã được dùng cho hồ sơ lịch sử.

**Status:** `PROPOSED`.

---

# 16. R-11 — SYSTEM_ADMIN

## Mục đích

Quản trị kỹ thuật hệ thống.

## Trách nhiệm

- Quản lý tài khoản.
- Khóa/mở tài khoản.
- Gán role.
- Quản lý cấu hình.
- Theo dõi lỗi.
- Quản lý backup/restore theo chính sách.
- Quản lý storage/configuration.
- Theo dõi audit kỹ thuật.

## Không mặc định có quyền

```text
Approve OCOP Result
Change Evaluation Score
Change Legal Criteria
```

Đây là nguyên tắc **separation of duties**.

**Status:** `PROPOSED`.

---

# 17. R-12 — REPORT_VIEWER

## Mục đích

Xem báo cáo và thống kê trong phạm vi được cấp.

## Quyền

- Xem dashboard.
- Xem báo cáo.
- Xuất báo cáo nếu được phép.

## Không được

- Sửa dữ liệu.
- Chấm điểm.
- Phê duyệt.
- Thay đổi minh chứng.

**Status:** `PROPOSED`.

---

# 18. R-13 — AUDITOR / AUDIT_VIEWER

## Mục đích

Tra cứu lịch sử xử lý và audit trail.

## Quyền

- Xem lịch sử thay đổi.
- Xem người thực hiện.
- Xem thời gian.
- Xem phiên bản.
- Truy vết hồ sơ → điểm → tiêu chí → minh chứng.

## Không được

- Sửa audit log.
- Xóa audit log.
- Sửa dữ liệu nghiệp vụ.

**Status:** `PROPOSED`.

---

# 19. Data Scope

## S1 — Own HTX

Người dùng chỉ xem/sửa dữ liệu thuộc HTX của mình.

Áp dụng điển hình:

- HTX_OWNER
- HTX_STAFF
- OCOP_PREPARER

```text
User → HTX → Data
```

---

## S2 — Assigned Application

Chỉ truy cập hồ sơ được giao.

Áp dụng:

- RECEIVING_REVIEWER
- EVIDENCE_REVIEWER

```text
User → Assignment → OCOP Application
```

---

## S3 — Assigned Evaluation Session

Người đánh giá chỉ thao tác trong phiên đánh giá được giao.

```text
Evaluator → Evaluation Session → Application
```

---

## S4 — Organization / Authority Scope

Người có thẩm quyền xem các hồ sơ thuộc phạm vi đơn vị được giao.

**Status:** `TO_VERIFY`.

---

## S5 — Global

Quyền toàn hệ thống.

Áp dụng hạn chế cho:

- SYSTEM_ADMIN
- CRITERIA_ADMIN nếu được tổ chức cho phép.

**Status:** `PROPOSED`.

---

# 20. Role × Business Process Matrix

| Role | Chuẩn bị hồ sơ | Tự đánh giá | Minh chứng | Kiểm tra | Chấm điểm | Tổng hợp | Quyết định | Báo cáo |
|---|---:|---:|---:|---:|---:|---:|---:|---:|
| HTX_OWNER | C | C | C | R | - | - | - | R |
| HTX_STAFF | C | C | C | R | - | - | - | R |
| OCOP_PREPARER | C | C | C | R | - | - | - | R |
| RECEIVING_REVIEWER | R | R | R | C | - | - | - | R |
| EVIDENCE_REVIEWER | R | R | C | C | - | - | - | R |
| EVALUATOR | R | R | R | R | C | - | - | R |
| COUNCIL_MEMBER | R | R | R | R | C | - | - | R |
| COUNCIL_SECRETARY | R | R | R | R | R | C | - | C |
| AUTHORITY | R | R | R | R | R | R | C | R |
| CRITERIA_ADMIN | R | R | R | - | Cfg | Cfg | - | R |
| SYSTEM_ADMIN | Tech | Tech | Tech | Tech | Tech | Tech | - | Tech |
| REPORT_VIEWER | R | R | R | R | R | R | R | C |
| AUDITOR | R | R | R | R | R | R | R | R |

Ký hiệu:

- `C` = Create/Change/Perform
- `R` = Read
- `Cfg` = Configure
- `Tech` = quyền kỹ thuật
- `-` = Không mặc định

**Status:** `PROPOSED`.

---

# 21. Separation of Duties

Hệ thống nên hạn chế các xung đột quyền:

| Conflict | Nguyên tắc |
|---|---|
| Người chuẩn bị hồ sơ = người phê duyệt cuối | Không mặc định cho phép |
| Người chấm = người sửa kết quả tổng hợp | Hạn chế |
| System Admin = người quyết định OCOP | Không nên |
| Người upload minh chứng = người xác minh | Hạn chế nếu quy trình yêu cầu độc lập |
| Người tạo tiêu chí = người tự phê duyệt phiên bản pháp lý | Cần kiểm soát |

Đây là **PROPOSED control**.

---

# 22. Role Assignment Model

Đề xuất:

```text
User
  │
  ├── UserRole
  │      ├── Role
  │      └── Scope
  │
  └── Organization / HTX
```

Ví dụ:

```text
User A
 ├── HTX_STAFF
 │      └── HTX = HTX-001
 │
 └── OCOP_PREPARER
        └── HTX = HTX-001
```

Evaluator:

```text
User B
 └── EVALUATOR
        └── Assigned Applications = APP-001, APP-004
```

---

# 23. Permission Naming Convention

Đề xuất:

```text
<RESOURCE>.<ACTION>
```

Ví dụ:

```text
MEMBER.READ
MEMBER.CREATE
MEMBER.UPDATE

PLOT.READ
PLOT.CREATE
PLOT.UPDATE

OCOP_APPLICATION.READ
OCOP_APPLICATION.CREATE
OCOP_APPLICATION.UPDATE
OCOP_APPLICATION.SUBMIT

OCOP_EVIDENCE.READ
OCOP_EVIDENCE.UPLOAD
OCOP_EVIDENCE.REPLACE
OCOP_EVIDENCE.VERIFY

OCOP_EVALUATION.READ
OCOP_EVALUATION.SCORE
OCOP_EVALUATION.COMPLETE
OCOP_EVALUATION.LOCK

OCOP_RESULT.READ
OCOP_RESULT.PROPOSE
OCOP_RESULT.APPROVE

CRITERIA.READ
CRITERIA.MANAGE
CRITERIA.PUBLISH

REPORT.READ
REPORT.EXPORT

AUDIT.READ
```

**Status:** `PROPOSED`.

---

# 24. Các quyền nhạy cảm

```text
CRITERIA.PUBLISH
OCOP_EVALUATION.UPDATE
OCOP_EVALUATION.LOCK
OCOP_RESULT.APPROVE
OCOP_EVIDENCE.VERIFY
AUDIT.READ
USER_ROLE.ASSIGN
```

Đề xuất:

- Ghi audit.
- Có người thực hiện.
- Có timestamp.
- Có đối tượng tác động.
- Có before/after khi dữ liệu thay đổi.
- Có lý do đối với thao tác nhạy cảm.

**Status:** `PROPOSED`.

---

# 25. Actor → Use Case Mapping sơ bộ

## HTX_OWNER / OCOP_SUBJECT

```text
UC-OCOP-01 Tạo hồ sơ
UC-OCOP-02 Cập nhật hồ sơ
UC-OCOP-03 Tự đánh giá
UC-OCOP-04 Quản lý minh chứng
UC-OCOP-05 Nộp hồ sơ
UC-OCOP-06 Bổ sung hồ sơ
UC-OCOP-07 Theo dõi trạng thái
UC-OCOP-08 Xem kết quả
```

## RECEIVING_REVIEWER

```text
UC-OCOP-09 Tiếp nhận hồ sơ
UC-OCOP-10 Kiểm tra hồ sơ
UC-OCOP-11 Yêu cầu bổ sung
UC-OCOP-12 Kiểm tra lại
```

## EVALUATOR / COUNCIL_MEMBER

```text
UC-OCOP-13 Mở phiên đánh giá
UC-OCOP-14 Xem minh chứng
UC-OCOP-15 Chấm điểm
UC-OCOP-16 Nhập nhận xét
UC-OCOP-17 Hoàn thành phiếu
```

## COUNCIL_SECRETARY

```text
UC-OCOP-18 Quản lý phiên đánh giá
UC-OCOP-19 Tổng hợp điểm
UC-OCOP-20 Lập/tổng hợp biên bản
```

## AUTHORITY

```text
UC-OCOP-21 Xem kết quả đề xuất
UC-OCOP-22 Kiểm tra điều kiện
UC-OCOP-23 Phê duyệt/quyết định
UC-OCOP-24 Ghi nhận kết quả
```

## CRITERIA_ADMIN

```text
UC-OCOP-25 Quản lý bộ tiêu chí
UC-OCOP-26 Quản lý phiên bản
UC-OCOP-27 Quản lý scoring rules
UC-OCOP-28 Phát hành phiên bản
```

## SYSTEM_ADMIN

```text
UC-ADM-01 Quản lý người dùng
UC-ADM-02 Quản lý role
UC-ADM-03 Gán quyền
UC-ADM-04 Quản lý cấu hình
UC-ADM-05 Theo dõi audit kỹ thuật
```

---

# 26. Role Boundary Rules

## ROLE-BR-001

Người chuẩn bị hồ sơ không mặc định có quyền phê duyệt kết quả.

## ROLE-BR-002

Người đánh giá không được sửa điểm của evaluator khác.

## ROLE-BR-003

System Admin không mặc định là OCOP Decision Maker.

## ROLE-BR-004

Thay đổi bộ tiêu chí không được làm thay đổi lịch sử hồ sơ đã đánh giá.

## ROLE-BR-005

Người kiểm tra minh chứng không được xóa lịch sử minh chứng.

## ROLE-BR-006

Quyền phải đi kèm data scope, không chỉ kiểm tra role.

## ROLE-BR-007

Thao tác nhạy cảm phải có audit trail.

## ROLE-BR-008

Một user có thể có nhiều role nhưng phải kiểm soát xung đột role.

Các rule trên là **PROPOSED**, cần xác nhận trước khi đưa vào `06_BUSINESS_RULES.md`.

---

# 27. Những điểm cần xác minh

| ID | Câu hỏi | Priority |
|---|---|---|
| ACT-V-001 | Trong HTX thực tế ai chuẩn bị hồ sơ OCOP? | Critical |
| ACT-V-002 | Đại diện HTX có trực tiếp tự đánh giá không? | Critical |
| ACT-V-003 | Có cán bộ chuyên trách OCOP không? | High |
| ACT-V-004 | Cán bộ tiếp nhận và cán bộ thẩm định có phải hai vai trò khác nhau không? | Critical |
| ACT-V-005 | Có Hội đồng chấm nhiều thành viên không? | Critical |
| ACT-V-006 | Thành viên có chấm độc lập không? | Critical |
| ACT-V-007 | Ai tổng hợp phiếu chấm? | Critical |
| ACT-V-008 | Ai có quyền quyết định kết quả cuối cùng? | Critical |
| ACT-V-009 | Quyền phê duyệt thay đổi theo cấp/hạng thế nào? | Critical |
| ACT-V-010 | System Admin có được xem hồ sơ OCOP không? | High |
| ACT-V-011 | Quản trị bộ tiêu chí thuộc HTX hay đơn vị quản lý hệ thống? | Critical |
| ACT-V-012 | Có role riêng cho xác minh minh chứng không? | High |
| ACT-V-013 | Một người có được kiêm nhiều role không? | High |
| ACT-V-014 | Có yêu cầu tách người lập và người duyệt không? | Critical |
| ACT-V-015 | Data scope theo HTX, địa bàn hay cấp quản lý? | Critical |

---

# 28. Nguyên tắc cho Coding Agent

Không được:

```text
if user.role == "ADMIN":
    allow_everything()
```

Nên:

```text
User
 ↓
Role
 ↓
Permission
 ↓
Data Scope
 ↓
Business Rule
 ↓
Allow / Deny
```

Không được:

```text
evaluator.update(score_of_any_user)
```

Nên:

```text
Evaluator
   ↓
Assigned Evaluation Session
   ↓
Own Evaluation Score
```

Không được:

```text
system_admin.approve_ocop()
```

chỉ vì là admin.

Nên:

```text
Authority Role
   +
Correct Scope
   +
Valid Workflow State
   +
Required Conditions
   ↓
Approve
```

---

# 29. Quan hệ với 04_OCOP_BUSINESS.md

`04_OCOP_BUSINESS.md` trả lời:

> **WHAT – Quy trình làm gì?**

`05_ACTORS_AND_ROLES.md` trả lời:

> **WHO – Ai làm việc đó?**

Ví dụ:

```text
04:
BP-OCOP-03 – Tự đánh giá
        ↓
05:
HTX_OWNER / OCOP_PREPARER
        ↓
OCOP_APPLICATION.SELF_ASSESS
```

```text
04:
BP-OCOP-06 – Đánh giá/chấm điểm
        ↓
05:
EVALUATOR / COUNCIL_MEMBER
        ↓
OCOP_EVALUATION.SCORE
```

```text
04:
BP-OCOP-07 – Tổng hợp/phân hạng
        ↓
05:
COUNCIL_SECRETARY
        ↓
Aggregate
        ↓
AUTHORITY
        ↓
Final Decision
```

---

# 30. Những gì tài liệu này chưa quyết định

Tài liệu này chưa quyết định:

- Tên role cuối cùng trong database.
- Role nào bắt buộc trong MVP.
- Cấu trúc Permission table.
- RBAC implementation cụ thể.
- Middleware/Policy/Guard.
- JWT/Session.
- Cách xác thực người dùng.
- Cơ cấu hành chính thực tế.
- Cấp phê duyệt OCOP cụ thể.
- Công thức chấm điểm.
- Ngưỡng phân hạng.

Các nội dung này thuộc tài liệu tiếp theo hoặc cần xác minh nghiệp vụ.

---

# 31. Dependency với tài liệu tiếp theo

```text
03_BUSINESS_PROCESSES.md
        ↓
04_OCOP_BUSINESS.md
        ↓
05_ACTORS_AND_ROLES.md
        ↓
06_BUSINESS_RULES.md
        ↓
07_BUSINESS_REQUIREMENTS.md
        ↓
08_FUNCTIONAL_REQUIREMENTS.md
        ↓
Use Cases
        ↓
Domain Model
        ↓
Database
        ↓
Architecture
```

`06_BUSINESS_RULES.md` sẽ lấy:

- Role responsibilities.
- Separation of Duties.
- Data Scope.
- Permission-sensitive actions.
- Các điểm `TO_VERIFY`.

để chuyển thành các Business Rule có ID, điều kiện, ngoại lệ và mức ưu tiên.

---

# 32. Definition of Done

Tài liệu Actor/Role được coi là đủ để chuyển sang Business Rules khi:

- [ ] Đã liệt kê actor chính.
- [ ] Đã phân biệt Actor và Role.
- [ ] Đã mô tả trách nhiệm từng role.
- [ ] Đã xác định quyền nghiệp vụ sơ bộ.
- [ ] Đã xác định data scope.
- [ ] Đã có Role × Process Matrix.
- [ ] Đã xác định các xung đột quyền.
- [ ] Đã xác định các quyền nhạy cảm.
- [ ] Đã mapping sơ bộ Actor → Use Case.
- [ ] Các điểm chưa chắc chắn được đánh dấu `TO_VERIFY`.
- [ ] Không hard-code thẩm quyền hành chính chưa xác minh.

---

# 33. Trạng thái tài liệu

**`DRAFT – PENDING VALIDATION`**

Các nội dung cần xác minh trước khi dùng làm căn cứ phân quyền chính thức:

1. Danh sách chức danh thực tế.
2. Người chịu trách nhiệm hồ sơ OCOP.
3. Cơ chế Hội đồng và số người chấm.
4. Quy trình độc lập của evaluator.
5. Cấp và người có thẩm quyền quyết định.
6. Quyền quản trị bộ tiêu chí.
7. Quyền xem dữ liệu theo HTX/địa bàn/cấp quản lý.
8. Quy định separation of duties.
9. Trường hợp một người kiêm nhiều vai trò.
10. Quy trình xác minh minh chứng.
