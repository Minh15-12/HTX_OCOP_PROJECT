# 09_USE_CASES.md

# 1. Document Information

| Field | Value |
|---|---|
| Document ID | 09 |
| Document Name | Use Case Specification |
| Project | Xây dựng Hệ thống quản lý hoạt động Hợp tác xã nông nghiệp và số hóa hồ sơ đánh giá, phân hạng OCOP |
| Previous Documents | 01_PROJECT_OVERVIEW.md, 02_DOMAIN_CONTEXT.md, 03_BUSINESS_PROCESSES.md, 04_OCOP_BUSINESS.md, 05_ACTORS_AND_ROLES.md, 06_BUSINESS_RULES.md, 07_BUSINESS_REQUIREMENTS.md, 08_FUNCTIONAL_REQUIREMENTS.md |
| Supporting Sources | chuong-2-dac-ta-use-case-phan-1-2.md, chuong-2-dac-ta-use-case-phan-3-4.md |
| Next Documents | 10_DOMAIN_MODEL.md, 11_DATABASE_DESIGN.md, 12_API_SPECIFICATION.md |
| Status | FINAL BASELINE – PENDING BUSINESS VALIDATION |

> Tài liệu này hợp nhất `09_USE_CASES` trước đó với hai tài liệu đặc tả Use Case phần 1–2 và 3–4. Các quy tắc pháp lý/hành chính mà tài liệu nguồn hoặc upstream đánh dấu `TO_VERIFY` không được hard-code thành quy định chắc chắn.

---

# 2. Purpose

Use Case là cầu nối:

Business Process → Business Rule → Business Requirement → Functional Requirement → Use Case → Domain Model / Database / API.

Mỗi Use Case mô tả mục tiêu, actor, scope, preconditions, postconditions, luồng chính, luồng thay thế/ngoại lệ, dữ liệu và traceability.

Use Case không phải Database Schema, API Contract hoặc UI Specification. Tên bảng, endpoint, HTTP status, MinIO, PostgreSQL, Cronjob và thư viện cụ thể không phải business requirement.

---

# 3. Modeling Conventions

## 3.1 Scope

| Scope | Ý nghĩa |
|---|---|
| Own HTX | Dữ liệu thuộc HTX của người dùng |
| Assigned Application | Hồ sơ được phân công |
| Assigned Evaluation Session | Phiên đánh giá được phân công |
| Global | Cấu hình dùng chung |
| Authorized Scope | Phạm vi được cấp quyền |

## 3.2 Status

| Status | Ý nghĩa |
|---|---|
| CONFIRMED | Được nguồn nghiệp vụ hỗ trợ trực tiếp |
| INFERRED | Suy luận hợp lý từ nguồn |
| PROPOSED | Đề xuất thiết kế |
| TO_VERIFY | Chưa đủ căn cứ xác minh |
| CONFLICT | Có nguồn chưa thống nhất |

## 3.3 Quy tắc chất lượng

1. Use Case phải có mục tiêu nghiệp vụ.
2. Primary Actor là actor thực hiện mục tiêu chính.
3. SYSTEM không phải business actor.
4. Không đưa chi tiết database/API vào luồng nghiệp vụ trừ khi chỉ để minh họa.
5. Quy tắc chưa xác minh phải giữ trạng thái `TO_VERIFY`.
6. Không tự ban hành quyết định pháp lý.
7. Không tự sửa điểm của evaluator.
8. Không xóa lịch sử nghiệp vụ đã được sử dụng.

---

# 4. Actor Catalog

| Actor ID | Role | Mô tả |
|---|---|---|
| ACT-01 | HTX_OWNER / OCOP_SUBJECT | Đại diện HTX/chủ thể OCOP |
| ACT-02 | HTX_STAFF | Cán bộ HTX |
| ACT-02A | ACCOUNTANT | Vai trò kế toán |
| ACT-02B | STOREKEEPER | Vai trò thủ kho |
| ACT-02C | AGRICULTURE_OFFICER | Vai trò kỹ thuật/canh tác |
| ACT-03 | RECEIVING_REVIEWER / OCOP_PREPARER | Cán bộ tiếp nhận/kiểm tra hoặc chuẩn bị hồ sơ |
| ACT-04 | EVALUATOR | Người thẩm định/chấm điểm |
| ACT-05 | COUNCIL_MEMBER / EVIDENCE_REVIEWER | Thành viên Hội đồng/người kiểm tra minh chứng |
| ACT-06 | COUNCIL_SECRETARY | Thư ký Hội đồng |
| ACT-07 | AUTHORITY / DECISION_MAKER | Người/cơ quan có thẩm quyền |
| ACT-08 | CRITERIA_ADMIN | Quản trị bộ tiêu chí; quyền nghiệp vụ là PROPOSED |
| ACT-09 | SYSTEM_ADMIN / AUDITOR | Quản trị hệ thống/auditor |
| ACT-10 | REPORT_VIEWER | Người xem báo cáo |
| SYSTEM | System | Validation, calculation, notification, audit và tác vụ nền |

---

# 5. Use Case Catalog

## 5.1 HTX, xã viên và vốn

| ID | Use Case | Actor | Priority |
|---|---|---|---|
| UC-COOP-01 | Quản lý hồ sơ HTX | ACT-01 | P0 |
| UC-COOP-02 | Tiếp nhận và phê duyệt xã viên | ACT-02 | P0 |
| UC-COOP-03 | Ghi nhận góp vốn và cấp chứng nhận | ACT-02A | P0 |
| UC-COOP-04 | Quản lý biểu quyết Đại hội thành viên | ACT-01 | P1 |
| UC-COOP-05 | Chấm dứt tư cách và đối soát vốn | ACT-01 / ACT-02A | P1 |
| UC-COOP-06 | Tra cứu/kết xuất sổ đăng ký thành viên | ACT-01 / ACT-02A | P1 |

## 5.2 Nông nghiệp

| ID | Use Case | Actor | Priority |
|---|---|---|---|
| UC-AGRI-01 | Khai báo và quản lý vùng trồng/PUC | ACT-02C | P0 |
| UC-AGRI-02 | Quản lý thửa đất và liên kết xã viên | ACT-02C | P0 |
| UC-AGRI-03 | Thiết lập mùa vụ và phân bổ thửa | ACT-01 / ACT-02C | P0 |
| UC-AGRI-04 | Ghi nhật ký canh tác | ACT-02C / ACT-01 | P0 |
| UC-AGRI-05 | Tính và kiểm soát PHI | SYSTEM / ACT-02C | P0 |
| UC-AGRI-06 | Ghi nhận thu hoạch và tạo Lot ID | ACT-02C / ACT-01 | P0 |
| UC-AGRI-07 | Kết xuất sổ nhật ký vùng trồng | ACT-02C | P1 |

## 5.3 Sản phẩm

| ID | Use Case | Actor | Priority |
|---|---|---|---|
| UC-PROD-01 | Quản lý danh mục sản phẩm HTX | ACT-01 | P0 |

## 5.4 Kho vật tư

| ID | Use Case | Actor | Priority |
|---|---|---|---|
| UC-LOG-01 | Quản lý danh mục vật tư và ngưỡng tồn | ACT-02B | P0 |
| UC-LOG-02 | Lập và duyệt phiếu nhập kho | ACT-02B | P0 |
| UC-LOG-03 | Xuất kho cung ứng cho xã viên | ACT-02B | P0 |
| UC-LOG-04 | Kiểm kê và xử lý chênh lệch kho | ACT-02B / ACT-02A | P1 |

## 5.5 Tài chính

| ID | Use Case | Actor | Priority |
|---|---|---|---|
| UC-FIN-01 | Lập và duyệt phiếu thu/chi | ACT-02A | P0 |
| UC-FIN-02 | Theo dõi và cấn trừ công nợ | ACT-02A | P0 |
| UC-FIN-03 | Lập phương án phân phối thặng dư | ACT-02A | P0 |
| UC-FIN-04 | Quản lý cho vay nội bộ | ACT-02A | P1 / TO_VERIFY |

## 5.6 OCOP

| ID | Use Case | Actor | Priority |
|---|---|---|---|
| UC-OCOP-01 | Khởi tạo hồ sơ OCOP | ACT-01 | P0 |
| UC-OCOP-02 | Quản lý phiên bản bộ tiêu chí | ACT-08 | P0 |
| UC-OCOP-03 | Lập báo cáo tự đánh giá và thuyết minh | ACT-01 / ACT-03 | P0 |
| UC-OCOP-04 | Tiếp nhận và kiểm tra hồ sơ | ACT-03 | P0 |
| UC-OCOP-05 | Chấm điểm độc lập | ACT-04 / ACT-05 | P0 |
| UC-OCOP-06 | Tổng hợp điểm và xử lý cảnh báo | ACT-06 | P0 |
| UC-OCOP-07 | Đề xuất phân hạng | ACT-06 | P0 |
| UC-OCOP-08 | Ghi nhận quyết định/kết quả chính thức | ACT-07 | P1 / TO_VERIFY |

## 5.7 Minh chứng

| ID | Use Case | Actor | Priority |
|---|---|---|---|
| UC-EVID-01 | Tải lên và quản lý minh chứng | ACT-01 / ACT-03 | P0 |
| UC-EVID-02 | Ánh xạ minh chứng với chỉ tiêu | ACT-01 / ACT-03 | P0 |
| UC-EVID-03 | Thay thế và versioning minh chứng | ACT-01 / ACT-03 | P0 |
| UC-EVID-04 | Kiểm tra/xác minh minh chứng | ACT-03 / ACT-05 | P0 / TO_VERIFY |
| UC-EVID-05 | Tái sử dụng dữ liệu HTX làm nguồn minh chứng | ACT-01 / ACT-03 | P1 / INFERRED |

## 5.8 Workflow, security, system, audit, report

| ID | Use Case | Actor | Priority |
|---|---|---|---|
| UC-WKFL-01 | Kiểm tra điều kiện và nộp hồ sơ | ACT-01 / ACT-03 | P0 |
| UC-WKFL-02 | Yêu cầu bổ sung và nộp lại | ACT-03 / ACT-01 | P0 |
| UC-WKFL-03 | Khóa/mở khóa dữ liệu theo trạng thái | SYSTEM / Authorized Actor | P0 |
| UC-SEC-01 | Quản lý tài khoản và xác thực | ACT-09 | P0 |
| UC-SEC-02 | RBAC, Data Scope và SoD | ACT-09 | P0 |
| UC-SYS-01 | Sao lưu và phục hồi | ACT-09 | P0 |
| UC-AUD-01 | Tra cứu audit và truy vết dữ liệu | ACT-09 / ACT-07 | P0 |
| UC-RPT-01 | Dashboard và báo cáo HTX | ACT-01 / ACT-10 | P1 |
| UC-RPT-02 | Theo dõi tiến độ hồ sơ OCOP | ACT-01 / ACT-03 | P0 |
| UC-RPT-03 | Kết xuất bộ hồ sơ OCOP | ACT-01 / ACT-06 | P0 |

---

# 6. Detailed Use Cases

## UC-COOP-01 — Quản lý hồ sơ HTX

**Goal:** Quản lý thông tin pháp lý và thông tin hoạt động cơ bản của HTX.

**Primary Actor:** ACT-01  
**Supporting Actor:** ACT-02  
**Scope:** Own HTX  
**Priority:** P0

**Traceability**
- BRQ: BRQ-COOP-001
- FR: FR-COOP-001
- Process: BP-COOP-01 và các process quản lý HTX liên quan
- Rules: BR-COOP-01, BR-COOP-02

**Preconditions**
- Người dùng đăng nhập và có quyền quản lý hồ sơ HTX.

**Main Flow**
1. Actor mở hồ sơ HTX.
2. Hệ thống hiển thị thông tin pháp lý/cấu hình.
3. Actor nhập hoặc cập nhật dữ liệu.
4. Hệ thống kiểm tra tính duy nhất của mã định danh.
5. Hệ thống kiểm tra các điều kiện quản trị nếu rule áp dụng.
6. Actor xác nhận lưu.
7. Hệ thống lưu và ghi audit.

**Exceptions**
- Mã trùng: từ chối.
- Dữ liệu không hợp lệ: yêu cầu sửa.
- Không đủ quyền: từ chối.

**Postconditions**
- Hồ sơ HTX được cập nhật và truy vết.

---

## UC-COOP-02 — Tiếp nhận và phê duyệt xã viên

**Primary Actor:** ACT-02  
**Supporting Actor:** ACT-01  
**Scope:** Own HTX  
**Priority:** P0

**Traceability**
- BRQ: BRQ-COOP-002, BRQ-COOP-003
- FR: FR-COOP-002
- Process: BP-COOP-02
- Rules: BR-MEM-001, BR-MEM-002, BR-DATA-002

**Main Flow**
1. Cán bộ HTX tạo hồ sơ.
2. Nhập thông tin định danh, loại thành viên và cam kết.
3. Hệ thống kiểm tra trùng định danh.
4. Tạo hồ sơ chờ duyệt.
5. Người có thẩm quyền xem và duyệt/từ chối.
6. Nếu duyệt, chuyển ACTIVE và cấp mã xã viên.
7. Ghi audit.

**Exceptions**
- Trùng định danh: không tạo hồ sơ hoạt động trùng.
- Hồ sơ thiếu: yêu cầu bổ sung.
- Điều kiện đặc thù chưa xác minh: `TO_VERIFY`.

---

## UC-COOP-03 — Ghi nhận góp vốn và cấp chứng nhận

**Primary Actor:** ACT-02A  
**Supporting Actor:** ACT-01  
**Priority:** P0

**Traceability**
- BRQ: BRQ-COOP-004, BRQ-COOP-005
- FR: FR-COOP-003
- Process: BP-COOP-03

**Main Flow**
1. Chọn xã viên ACTIVE.
2. Nhập giao dịch tiền/tài sản và chứng từ.
3. Kiểm tra giới hạn theo rule.
4. Ghi nhận góp vốn.
5. Cập nhật vốn thực góp.
6. Tính tỷ lệ vốn.
7. Cấp chứng nhận nếu đủ điều kiện.
8. Audit.

> Không hard-code tỷ lệ vốn cụ thể nếu upstream chưa xác minh.

---

## UC-COOP-04 — Quản lý biểu quyết Đại hội thành viên

**Primary Actor:** ACT-01  
**Supporting Actor:** ACT-02  
**Priority:** P1

**Traceability**
- BRQ: BRQ-COOP-006
- FR: FR-COOP-004
- Rule: BR-COOP-03

**Main Flow**
1. Tạo phiên họp và danh sách thành viên đủ điều kiện.
2. Tạo nội dung biểu quyết.
3. Ghi nhận lựa chọn.
4. Áp dụng trọng số phiếu theo rule.
5. Tổng hợp.
6. Khóa phiên.
7. Audit.

---

## UC-COOP-05 — Chấm dứt tư cách và đối soát vốn

**Primary Actor:** ACT-01  
**Supporting Actor:** ACT-02A  
**Priority:** P1  
**Status:** TO_VERIFY ở các chi tiết pháp lý chưa xác minh.

**Main Flow**
1. Khởi tạo yêu cầu.
2. Ghi lý do và tài liệu.
3. Chuyển PENDING_TERMINATION.
4. Hạn chế giao dịch theo workflow.
5. Kế toán đối soát vốn/công nợ.
6. Người có quyền xác nhận.
7. Chuyển trạng thái cuối.
8. Bảo toàn lịch sử.

---

## UC-COOP-06 — Tra cứu/kết xuất sổ đăng ký thành viên

**Primary Actor:** ACT-01 / ACT-02A  
**Priority:** P1

1. Chọn sổ đăng ký.
2. Lọc theo trạng thái/loại/thời gian.
3. Xem hồ sơ.
4. Chọn mẫu/định dạng.
5. Hệ thống sinh báo cáo và lưu lịch sử kết xuất.

**Traceability:** BRQ-REPORT-001, FR-RPT-001.

---

# 7. Agriculture Use Cases

## UC-AGRI-01 — Khai báo và quản lý vùng trồng/PUC

**Primary Actor:** ACT-02C  
**Priority:** P0

**Traceability:** BRQ-AGRI-001 → FR-AGRI-001 → BP-AGRI-01.

**Main Flow**
1. Tạo vùng trồng.
2. Nhập cây trồng, diện tích, vị trí.
3. Vẽ/nhập Polygon nếu áp dụng.
4. Kiểm tra geometry.
5. Áp dụng điều kiện PUC theo cấu hình.
6. Lưu và audit.

**Exception**
- Polygon không hợp lệ: từ chối.
- Điều kiện PUC không đạt: cảnh báo/chặn theo rule.

---

## UC-AGRI-02 — Quản lý thửa đất và liên kết xã viên

**Primary Actor:** ACT-02C  
**Priority:** P0

1. Chọn vùng trồng.
2. Chọn xã viên ACTIVE.
3. Khai báo thửa và diện tích.
4. Vẽ/nhập ranh giới.
5. Kiểm tra thửa thuộc vùng trồng.
6. Lưu liên kết.

**Traceability:** BRQ-AGRI-002 → FR-AGRI-002 → BP-AGRI-02.

---

## UC-AGRI-03 — Thiết lập mùa vụ và phân bổ thửa

**Primary Actor:** ACT-01 / ACT-02C  
**Priority:** P0

1. Tạo mùa vụ.
2. Nhập thời gian/kế hoạch.
3. Chọn vùng/thửa.
4. Kiểm tra ngày.
5. Kiểm tra xung đột phân bổ.
6. Kích hoạt mùa vụ.

**Traceability:** BRQ-AGRI-003 → FR-AGRI-003 → BP-AGRI-03.

---

## UC-AGRI-04 — Ghi nhật ký canh tác

**Primary Actor:** ACT-02C / ACT-01  
**Priority:** P0

1. Chọn thửa và mùa vụ.
2. Chọn hoạt động.
3. Nhập thời gian/nội dung.
4. Nếu dùng vật tư, liên kết SKU/lô.
5. Kiểm tra vật tư.
6. Nếu phun thuốc, xác định PHI theo cấu hình.
7. Lưu.
8. Audit.

**Traceability:** BRQ-AGRI-004, BRQ-AGRI-005 → FR-AGRI-004.

---

## UC-AGRI-05 — Tính và kiểm soát PHI

**Primary Actor:** SYSTEM  
**Supporting Actor:** ACT-02C  
**Priority:** P0

1. Nhận bản ghi phun thuốc.
2. Lấy PHI từ dữ liệu được phê duyệt.
3. Tính ngày an toàn.
4. Ghi trạng thái cách ly.
5. Kiểm tra lại khi thu hoạch.

Nếu không xác định được PHI, hệ thống không tự suy đoán.

**Traceability:** BRQ-AGRI-006 → FR-AGRI-004.

---

## UC-AGRI-06 — Ghi nhận thu hoạch và tạo Lot ID

**Primary Actor:** ACT-02C / ACT-01  
**Priority:** P0

1. Chọn thửa/mùa vụ.
2. Nhập ngày và sản lượng.
3. Kiểm tra PHI.
4. Tạo bản ghi thu hoạch.
5. Sinh Lot ID duy nhất.
6. Liên kết Lot với thửa, xã viên, mùa vụ.
7. Audit.

QR truy xuất là capability hỗ trợ; phạm vi dữ liệu công khai phải tuân theo security policy.

---

## UC-AGRI-07 — Kết xuất sổ nhật ký vùng trồng

**Primary Actor:** ACT-02C  
**Priority:** P1

1. Chọn mùa vụ/vùng/thửa.
2. Chọn template.
3. Tổng hợp nhật ký, vật tư, PHI, thu hoạch.
4. Kiểm tra dữ liệu.
5. Sinh PDF/XLSX.
6. Lưu lịch sử kết xuất.

---

# 8. Product Use Case

## UC-PROD-01 — Quản lý danh mục sản phẩm HTX

**Primary Actor:** ACT-01  
**Supporting Actor:** ACT-02  
**Priority:** P0

1. Tạo sản phẩm.
2. Nhập tên, nhóm, quy cách, nhãn hiệu, chất lượng.
3. Liên kết nguồn nguyên liệu/Lot nếu cần.
4. Kiểm tra mã.
5. Lưu.
6. Cho phép sản phẩm được chọn trong hồ sơ OCOP.

---

# 9. Logistics Use Cases

## UC-LOG-01 — Quản lý danh mục vật tư và ngưỡng tồn

**Primary Actor:** ACT-02B  
**Priority:** P0

1. Tạo SKU.
2. Khai báo nhóm, đơn vị, thông tin an toàn và ngưỡng.
3. Nếu là thuốc BVTV, liên kết hoạt chất/PHI từ danh mục được quản lý.
4. Kiểm tra.
5. Lưu.
6. Theo dõi tồn kho.

---

## UC-LOG-02 — Lập và duyệt phiếu nhập kho

**Primary Actor:** ACT-02B  
**Supporting Actor:** ACT-01 / ACT-02A  
**Priority:** P0

1. Chọn nhà cung cấp.
2. Nhập chứng từ và dòng vật tư.
3. Ghi số lượng, đơn giá, lô, hạn dùng nếu có.
4. Gửi duyệt.
5. Người có quyền phê duyệt.
6. Cập nhật tồn và thẻ kho.
7. Audit.

---

## UC-LOG-03 — Xuất kho cung ứng cho xã viên

**Primary Actor:** ACT-02B  
**Priority:** P0

1. Chọn xã viên ACTIVE.
2. Chọn vật tư/số lượng.
3. Chọn phương thức thanh toán.
4. Kiểm tra tồn.
5. Nếu trả chậm, kiểm tra công nợ.
6. Giảm tồn.
7. Tạo công nợ nếu cần.
8. Audit.

---

## UC-LOG-04 — Kiểm kê và xử lý chênh lệch kho

**Primary Actor:** ACT-02B / ACT-02A  
**Priority:** P1

1. Tạo phiên kiểm kê.
2. Chốt số liệu lý thuyết.
3. Nhập số thực tế.
4. Tính chênh lệch.
5. Nhập lý do.
6. Trình duyệt.
7. Chỉ điều chỉnh sau khi được duyệt.
8. Audit.

---

# 10. Finance Use Cases

## UC-FIN-01 — Lập và duyệt phiếu thu/chi

**Primary Actor:** ACT-02A  
**Supporting Actor:** ACT-01  
**Priority:** P0

1. Tạo phiếu.
2. Phân loại giao dịch.
3. Đính kèm chứng từ.
4. Trình duyệt nếu cần.
5. Người có quyền duyệt.
6. Cập nhật sổ giao dịch.
7. Audit.

---

## UC-FIN-02 — Theo dõi và cấn trừ công nợ

**Primary Actor:** ACT-02A  
**Supporting Actor:** ACT-01  
**Priority:** P0

1. Xem công nợ theo xã viên.
2. Chọn giao dịch đối soát.
3. Tổng hợp khoản phải thu/phải trả.
4. Áp dụng quy chế cấn trừ.
5. Ghi số tiền thực trả và phần còn lại.
6. Tạo biên bản.
7. Audit.

Quy tắc xử lý nợ còn lại chưa xác minh thì phải `TO_VERIFY`.

---

## UC-FIN-03 — Lập phương án phân phối thặng dư

**Primary Actor:** ACT-02A  
**Supporting Actor:** ACT-01 / Đại hội thành viên  
**Priority:** P0  
**Status:** TO_VERIFY ở tỷ lệ/công thức cụ thể.

1. Chốt dữ liệu tài chính.
2. Xác định kết quả.
3. Áp dụng tỷ lệ/quy tắc được cấu hình.
4. Tính phương án.
5. Hiển thị bảng phân bổ.
6. Trình Đại hội thành viên.
7. Khóa sau phê duyệt.
8. Audit.

Không hard-code 5%, 51% hoặc trọng số nếu chưa được xác minh.

---

## UC-FIN-04 — Quản lý cho vay nội bộ

**Primary Actor:** ACT-02A  
**Supporting Actor:** ACT-01  
**Priority:** P1  
**Status:** TO_VERIFY

1. Tiếp nhận hồ sơ.
2. Kiểm tra thành viên và nguồn vốn.
3. Kiểm tra điều kiện cấu hình.
4. Trình duyệt.
5. Giải ngân nếu được duyệt.
6. Theo dõi hoàn trả.
7. Tất toán.

---

# 11. OCOP Use Cases

## UC-OCOP-01 — Khởi tạo hồ sơ OCOP

**Primary Actor:** ACT-01  
**Supporting Actor:** ACT-03  
**Priority:** P0

**Traceability:** BRQ-OCOP-001 → FR-OCOP-001 → BP-OCOP-01.

1. Chọn sản phẩm.
2. Chọn loại/lần đánh giá.
3. Xác định Criteria Version.
4. Tạo hồ sơ DRAFT.
5. Khởi tạo cấu trúc hồ sơ.
6. Audit.

Không tạo hồ sơ nếu chưa xác định được sản phẩm/tiêu chí áp dụng.

---

## UC-OCOP-02 — Quản lý phiên bản bộ tiêu chí

**Primary Actor:** ACT-08  
**Scope:** Global  
**Priority:** P0  
**Status:** PROPOSED

1. Tạo phiên bản.
2. Khai báo nhóm, tiêu chí, chỉ tiêu, scoring rule.
3. Khai báo điều kiện bắt buộc/khống chế.
4. Kiểm tra nhất quán.
5. Phát hành.
6. Khóa phiên bản.
7. Ghi nguồn và lịch sử.

Không sửa đè phiên bản đã dùng cho hồ sơ lịch sử.

---

## UC-OCOP-03 — Lập báo cáo tự đánh giá và thuyết minh

**Primary Actor:** ACT-01  
**Supporting Actor:** ACT-03  
**Priority:** P0

1. Mở DRAFT/NEED_REVISION.
2. Nhập thuyết minh.
3. Chọn mức/điểm tự đánh giá.
4. Nhập giải trình.
5. Liên kết minh chứng.
6. Hệ thống tính tổng điểm theo scoring rule.
7. Lưu.
8. Audit.

Không cho nhập trực tiếp tổng điểm.

---

## UC-OCOP-04 — Tiếp nhận và kiểm tra hồ sơ

**Primary Actor:** ACT-03  
**Scope:** Assigned Application  
**Priority:** P0

1. Mở hồ sơ được phân công.
2. Kiểm tra thành phần.
3. Kiểm tra minh chứng.
4. Ghi nhận vấn đề.
5. Tạo yêu cầu bổ sung.
6. Nếu hợp lệ, chuyển bước.
7. Audit.

Thẩm quyền cụ thể theo cấp phải `TO_VERIFY` nếu nguồn chưa xác nhận.

---

## UC-OCOP-05 — Chấm điểm độc lập

**Primary Actor:** ACT-04 / ACT-05  
**Scope:** Assigned Evaluation Session  
**Priority:** P0

1. Mở phiên được phân công.
2. Xem hồ sơ/minh chứng.
3. Nhập điểm từng chỉ tiêu.
4. Nhập nhận xét.
5. Kiểm tra giới hạn điểm.
6. Lưu phiếu riêng.
7. Khóa khi hoàn thành.
8. Audit.

Không xem/sửa điểm evaluator khác khi quy trình yêu cầu độc lập.

---

## UC-OCOP-06 — Tổng hợp điểm và xử lý cảnh báo

**Primary Actor:** ACT-06  
**Scope:** Assigned Evaluation Session  
**Priority:** P0

1. Kiểm tra các phiếu đã hoàn thành.
2. Tổng hợp theo Criteria Version.
3. Tính độ lệch nếu rule yêu cầu.
4. Nếu hợp lệ, tạo kết quả tổng hợp.
5. Nếu bất thường, khóa bước chốt và yêu cầu xử lý theo quy trình.
6. Audit.

Ngưỡng 10 điểm chỉ áp dụng khi rule chính thức xác nhận.

---

## UC-OCOP-07 — Đề xuất phân hạng

**Primary Actor:** ACT-06  
**Supporting Actor:** ACT-07  
**Priority:** P0

1. Nhận điểm tổng hợp.
2. Kiểm tra điều kiện bắt buộc/khống chế.
3. Áp dụng scoring/classification rules của Criteria Version.
4. Tạo Proposed Classification.
5. Chuyển cấp có thẩm quyền.
6. Audit.

Mô hình bắt buộc:

Criteria Version → Scoring Rules → Mandatory Conditions → Proposed Classification → Authorized Decision.

Không hard-code 50/70/90 hoặc các ngưỡng khác nếu chưa được xác minh.

---

## UC-OCOP-08 — Ghi nhận quyết định/kết quả chính thức

**Primary Actor:** ACT-07  
**Priority:** P1  
**Status:** TO_VERIFY về cấp/thẩm quyền.

1. Mở hồ sơ.
2. Xem kết quả và đề xuất.
3. Nhập thông tin quyết định.
4. Xác nhận Final Result.
5. Lưu riêng Proposed Classification và Final Result.
6. Lưu hiệu lực nếu có rule chính thức.
7. Audit.

Hệ thống không tự ban hành quyết định pháp lý.

---

# 12. Evidence Use Cases

## UC-EVID-01 — Tải lên và quản lý minh chứng

**Primary Actor:** ACT-01 / ACT-03  
**Priority:** P0

1. Chọn hồ sơ.
2. Chọn tệp.
3. Kiểm tra định dạng/dung lượng theo cấu hình.
4. Lưu tệp và metadata.
5. Gán PENDING_VERIFY.
6. Audit.

Tệp phải được bảo vệ bằng authorization; MinIO chỉ là implementation choice.

---

## UC-EVID-02 — Ánh xạ minh chứng với chỉ tiêu

**Primary Actor:** ACT-01 / ACT-03  
**Priority:** P0

1. Chọn chỉ tiêu.
2. Chọn minh chứng.
3. Tạo liên kết.
4. Cho phép người có quyền xem minh chứng khi đánh giá.

Hỗ trợ quan hệ nhiều-nhiều.

---

## UC-EVID-03 — Thay thế và versioning minh chứng

**Primary Actor:** ACT-01 / ACT-03  
**Priority:** P0

1. Chọn minh chứng cần thay.
2. Tải bản mới.
3. Nhập lý do.
4. Tạo version mới.
5. Giữ bản cũ.
6. Audit.

Không xóa lịch sử.

---

## UC-EVID-04 — Kiểm tra/xác minh minh chứng

**Primary Actor:** ACT-03 / ACT-05  
**Priority:** P0  
**Status:** TO_VERIFY ở thẩm quyền cụ thể.

1. Mở minh chứng.
2. Kiểm tra theo checklist.
3. Chọn VERIFIED hoặc REJECTED.
4. Nếu REJECTED, ghi lý do.
5. Audit.

`VERIFIED` không tự đồng nghĩa với giá trị pháp lý.

---

## UC-EVID-05 — Tái sử dụng dữ liệu HTX làm nguồn minh chứng

**Primary Actor:** ACT-01 / ACT-03  
**Priority:** P1  
**Status:** INFERRED

1. Chọn nguồn dữ liệu.
2. Chọn mùa vụ/thửa/lô hoặc thực thể liên quan.
3. Tạo tài liệu/tham chiếu hỗ trợ.
4. Lưu source_entity/source_id.
5. Người có trách nhiệm xác nhận trước khi đưa vào hồ sơ.

Dữ liệu nội bộ không mặc nhiên là minh chứng pháp lý.

---

# 13. Workflow Use Cases

## UC-WKFL-01 — Kiểm tra điều kiện và nộp hồ sơ

**Primary Actor:** ACT-01 / ACT-03  
**Priority:** P0

1. Actor yêu cầu nộp.
2. Hệ thống validation.
3. Kiểm tra trường bắt buộc.
4. Kiểm tra tự đánh giá.
5. Kiểm tra minh chứng bắt buộc theo Criteria Version.
6. Nếu hợp lệ, chuyển SUBMITTED.
7. Khóa quyền sửa.
8. Audit.

---

## UC-WKFL-02 — Yêu cầu bổ sung và nộp lại

**Primary Actor:** ACT-03  
**Supporting Actor:** ACT-01  
**Priority:** P0

1. Reviewer chọn nội dung cần sửa.
2. Ghi yêu cầu/lý do.
3. Đặt hạn nếu workflow áp dụng.
4. Chuyển NEED_REVISION.
5. Mở quyền sửa có kiểm soát.
6. HTX cập nhật.
7. Nộp lại.
8. Khóa và ghi version/audit.

---

## UC-WKFL-03 — Khóa/mở khóa dữ liệu theo trạng thái

**Primary Actor:** SYSTEM  
**Priority:** P0

1. Workflow thay đổi trạng thái.
2. Hệ thống xác định quyền sửa.
3. Khóa dữ liệu khi cần.
4. Mở quyền có kiểm soát ở trạng thái cho phép.
5. Audit.

---

# 14. Security and System Use Cases

## UC-SEC-01 — Quản lý tài khoản và xác thực

**Primary Actor:** ACT-09  
**Priority:** P0

1. Tạo/kích hoạt tài khoản.
2. Gán đơn vị/phạm vi.
3. Thiết lập xác thực.
4. Khóa/mở khóa.
5. Audit.

2FA là capability; mức bắt buộc theo role phải được xác định bởi security policy.

---

## UC-SEC-02 — RBAC, Data Scope và SoD

**Primary Actor:** ACT-09  
**Priority:** P0

1. Tạo/cấu hình role.
2. Gán permission.
3. Gán data scope.
4. Kiểm tra xung đột.
5. Backend enforce quyền.
6. Audit thay đổi quyền.

Core scope:
- HTX chỉ truy cập dữ liệu HTX của mình.
- Evaluator chỉ truy cập hồ sơ/phiên được phân công.
- Không cho phép xung đột vai trò khi SoD rule áp dụng.

---

## UC-SYS-01 — Sao lưu và phục hồi

**Primary Actor:** ACT-09  
**Priority:** P0

1. Backup theo lịch.
2. Backup database và object storage.
3. Ghi trạng thái.
4. Khi sự cố, admin xác thực và restore.
5. Kiểm tra consistency.
6. Audit.

Tần suất/retention là deployment configuration.

---

# 15. Audit Use Case

## UC-AUD-01 — Tra cứu audit và truy vết dữ liệu

**Primary Actor:** ACT-09 / ACT-07  
**Scope:** Authorized Scope  
**Priority:** P0

1. Chọn hồ sơ/sản phẩm.
2. Hiển thị chuỗi:
   Final Result → Decision → Consolidated Score → Evaluator Scores → Criterion → Evidence Version → HTX Source Data.
3. Hiển thị audit events.
4. Lọc theo actor/entity/time.
5. Ghi log truy cập nếu policy yêu cầu.

Audit log phải append-only theo chính sách hệ thống.

---

# 16. Reporting Use Cases

## UC-RPT-01 — Dashboard và báo cáo HTX

**Primary Actor:** ACT-01 / ACT-10  
**Priority:** P1

1. Chọn thời gian/mùa vụ/vùng.
2. Tổng hợp xã viên, vốn, vùng trồng, tồn kho, thu-chi, công nợ.
3. Hiển thị dashboard.
4. Kết xuất định dạng hỗ trợ.
5. Lưu lịch sử.

---

## UC-RPT-02 — Theo dõi tiến độ hồ sơ OCOP

**Primary Actor:** ACT-01 / ACT-03  
**Priority:** P0

1. Chọn hồ sơ.
2. Tính tỷ lệ hoàn thiện.
3. Hiển thị chỉ tiêu đã đánh giá.
4. Hiển thị chỉ tiêu có minh chứng.
5. Hiển thị VERIFIED/REJECTED.
6. Hiển thị mục còn thiếu và điều kiện bắt buộc chưa đáp ứng.

---

## UC-RPT-03 — Kết xuất bộ hồ sơ OCOP

**Primary Actor:** ACT-01 / ACT-06  
**Priority:** P0

1. Chọn hồ sơ và version.
2. Kiểm tra completeness.
3. Chọn template.
4. Tổng hợp dữ liệu.
5. Sinh PDF/DOCX.
6. Lưu Document Generation Version.
7. Audit.

Nếu minh chứng bắt buộc bị lỗi, hệ thống phải chặn hoặc báo lỗi rõ ràng; không silently bỏ qua.

PDF/DOCX không mặc nhiên thay thế bản giấy hoặc có giá trị pháp lý nếu chưa được xác minh.

---

# 17. Cross-Domain Relationships

## 17.1 Core data flow

Member
→ Farm Plot
→ Crop Season
→ Farming Log
→ Input / Inventory
→ Harvest / Lot
→ Product
→ OCOP Application
→ Criterion / Indicator
→ Evidence
→ Evaluation
→ Result

## 17.2 OCOP dependency

```text
Product
  ↓
OCOP Application
  ↓
Criteria Version
  ↓
Self Assessment
  ↓
Evidence
  ↓
Review
  ↓
Evaluation Session
  ↓
Evaluator Scores
  ↓
Consolidated Result
  ↓
Proposed Classification
  ↓
Authorized Decision
```

---

# 18. Traceability Matrix

| Use Case | Business Requirement | Functional Requirement |
|---|---|---|
| UC-COOP-01 | BRQ-COOP-001 | FR-COOP-001 |
| UC-COOP-02 | BRQ-COOP-002/003 | FR-COOP-002 |
| UC-COOP-03 | BRQ-COOP-004/005 | FR-COOP-003 |
| UC-COOP-04 | BRQ-COOP-006 | FR-COOP-004 |
| UC-COOP-05 | BRQ-COOP-003 | FR-COOP-002/003 |
| UC-COOP-06 | BRQ-REPORT-001 | FR-RPT-001 |
| UC-AGRI-01 | BRQ-AGRI-001 | FR-AGRI-001 |
| UC-AGRI-02 | BRQ-AGRI-002 | FR-AGRI-002 |
| UC-AGRI-03 | BRQ-AGRI-003 | FR-AGRI-003 |
| UC-AGRI-04 | BRQ-AGRI-004/005 | FR-AGRI-004 |
| UC-AGRI-05 | BRQ-AGRI-006 | FR-AGRI-004 |
| UC-AGRI-06 | BRQ-AGRI-007 | FR-AGRI-005 |
| UC-AGRI-07 | BRQ-REPORT-001 | FR-RPT-001 |
| UC-PROD-01 | BRQ-PROD-001 | FR-PROD-001 |
| UC-LOG-01 | BRQ-LOG-001 | FR-LOG-001 |
| UC-LOG-02 | BRQ-LOG-002 | FR-LOG-002 |
| UC-LOG-03 | BRQ-LOG-003 | FR-LOG-003 |
| UC-LOG-04 | BRQ-LOG-004 | FR-LOG-004 |
| UC-FIN-01 | BRQ-FIN-001 | FR-FIN-001 |
| UC-FIN-02 | BRQ-FIN-002 | FR-FIN-002 |
| UC-FIN-03 | BRQ-FIN-003 | FR-FIN-003 |
| UC-FIN-04 | BRQ-FIN-004 | FR-FIN-004 |
| UC-OCOP-01 | BRQ-OCOP-001 | FR-OCOP-001 |
| UC-OCOP-02 | BRQ-OCOP-002 | FR-OCOP-002 |
| UC-OCOP-03 | BRQ-OCOP-003 | FR-OCOP-003 |
| UC-OCOP-04 | BRQ-WORKFLOW-003 / BRQ-EVIDENCE-004 | FR-WKFL-003 / FR-EVID-004 |
| UC-OCOP-05 | BRQ-OCOP-004 | FR-OCOP-004 |
| UC-OCOP-06 | BRQ-OCOP-005 | FR-OCOP-005 |
| UC-OCOP-07 | BRQ-OCOP-006 | FR-OCOP-006 |
| UC-OCOP-08 | BRQ-OCOP-007 | FR-OCOP-007 |
| UC-EVID-01 | BRQ-EVIDENCE-001 | FR-EVID-001 |
| UC-EVID-02 | BRQ-EVIDENCE-002 | FR-EVID-002 |
| UC-EVID-03 | BRQ-EVIDENCE-003 | FR-EVID-003 |
| UC-EVID-04 | BRQ-EVIDENCE-004 | FR-EVID-004 |
| UC-EVID-05 | BRQ-EVIDENCE-006 | FR-EVID-006 |
| UC-WKFL-01 | BRQ-WORKFLOW-001/002 | FR-WKFL-001/002 |
| UC-WKFL-02 | BRQ-WORKFLOW-003 | FR-WKFL-003 |
| UC-WKFL-03 | BRQ-WORKFLOW-004 | FR-WKFL-004 |
| UC-SEC-01 | BRQ-SEC-001 | FR-SEC-001 |
| UC-SEC-02 | BRQ-SEC-002/003/004 | FR-SEC-002/003/004 |
| UC-SYS-01 | BRQ-SYS-002 | FR-SYS-002 |
| UC-AUD-01 | BRQ-AUDIT-001/002 | FR-AUD-001/002 |
| UC-RPT-01 | BRQ-REPORT-001 | FR-RPT-001 |
| UC-RPT-02 | BRQ-REPORT-002 | FR-RPT-002 |
| UC-RPT-03 | BRQ-REPORT-003 | FR-RPT-003 |

---

# 19. Consolidation Decisions

## 19.1 Use Case ID

Hai tài liệu đặc tả cũ dùng `UC-01 ... UC-23`, trong khi baseline 09 dùng namespace như `UC-COOP`, `UC-AGRI`, `UC-OCOP`.

Bản Final sử dụng **namespace ID** làm ID chính thức. Nội dung của UC-01…UC-23 được hợp nhất vào các Use Case tương ứng.

## 19.2 Implementation detail

Các nội dung như:
- tên bảng database;
- endpoint API;
- HTTP 201/400;
- SQL trigger;
- MinIO;
- PostgreSQL;
- Background Job;
- thư viện;
- Bluetooth printer;

không được coi là thành phần bắt buộc của Use Case.

## 19.3 OCOP thresholds

Không hard-code các ngưỡng 50/70/90, độ lệch 10 điểm hoặc thời hạn 36 tháng trong logic Use Case nếu upstream chưa xác nhận. Các giá trị phải đến từ Criteria Version / Business Rules chính thức.

## 19.4 Evidence export

Không sử dụng hành vi bỏ qua im lặng đối với minh chứng bắt buộc bị lỗi. Hồ sơ thiếu minh chứng bắt buộc phải được phát hiện rõ ràng.

## 19.5 Legal authority

Use Case chỉ hỗ trợ quy trình; quyết định cuối cùng vẫn thuộc actor/cơ quan có thẩm quyền.

---

# 20. Open Questions

| ID | Question | Priority |
|---|---|---|
| OQ-UC-001 | Phiên bản bộ tiêu chí OCOP chính thức áp dụng là phiên bản nào? | Critical |
| OQ-UC-002 | Cấp/cơ quan có thẩm quyền theo từng mức kết quả là gì? | Critical |
| OQ-UC-003 | Quy tắc độ lệch điểm và ngưỡng chính xác có áp dụng không? | Critical |
| OQ-UC-004 | Thời hạn hiệu lực kết quả OCOP áp dụng như thế nào? | High |
| OQ-UC-005 | Công thức phân phối thặng dư thực tế của HTX? | Critical |
| OQ-UC-006 | HTX có triển khai cho vay nội bộ không? | Medium |
| OQ-UC-007 | Xử lý nợ còn lại sau cấn trừ cuối vụ? | High |
| OQ-UC-008 | Ký số bắt buộc ở bước nào và bằng phương thức nào? | High |
| OQ-UC-009 | PDF/DOCX thay thế hay song song bản giấy? | Critical |
| OQ-UC-010 | Minh chứng bắt buộc theo từng Criteria Version? | Critical |
| OQ-UC-011 | Có QR truy xuất công khai và phạm vi dữ liệu công khai nào? | Medium |
| OQ-UC-012 | Actor/role thực tế có quyền tạo, kiểm tra, chấm và phê duyệt? | Critical |

---

# 21. Definition of Done

`09_USE_CASES.md` đủ điều kiện làm đầu vào cho Domain Model khi:

- [ ] Không còn hai hệ ID Use Case song song.
- [ ] Nội dung quan trọng từ hai tài liệu đặc tả cũ đã được hợp nhất.
- [ ] Mỗi Use Case có actor và mục tiêu.
- [ ] Có traceability UC → FR → BRQ.
- [ ] Luồng chính và ngoại lệ quan trọng được mô tả.
- [ ] Các nội dung `TO_VERIFY` không bị biến thành fact.
- [ ] Không hard-code tiêu chí OCOP chưa xác minh.
- [ ] Không hard-code thẩm quyền pháp lý chưa xác minh.
- [ ] Không để implementation detail chi phối business Use Case.
- [ ] Workflow, Evidence, Security, Audit và Report được phân biệt.
- [ ] Có thể dùng Use Case làm đầu vào cho Domain Model.

---

# 22. Next Document

Sau khi các Open Questions quan trọng được xác minh và 09 được phê duyệt:

```text
09_USE_CASES.md
      ↓
10_DOMAIN_MODEL.md
      ↓
11_DATABASE_DESIGN.md
      ↓
12_API_SPECIFICATION.md
      ↓
Architecture / Implementation
```

Domain Model phải được xây dựng từ Business Objects + Use Case interactions + Business Rules + Cross-domain relationships.
