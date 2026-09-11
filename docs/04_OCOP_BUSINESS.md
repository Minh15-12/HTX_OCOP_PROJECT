# 04_OCOP_BUSINESS.md

## 1. Thông tin tài liệu

- **Dự án:** Xây dựng Hệ thống quản lý hoạt động Hợp tác xã nông nghiệp và số hóa hồ sơ đánh giá, phân hạng OCOP
- **Phạm vi:** Đặc tả miền nghiệp vụ OCOP.
- **Mục đích:** Chuẩn hóa nghiệp vụ chuẩn bị hồ sơ, quản lý tiêu chí, tự đánh giá/chấm điểm, quản lý minh chứng, kiểm tra/bổ sung, đánh giá và kết quả OCOP.
- **Nguồn chính:** Các tài liệu nghiên cứu A–F và các tài liệu đặc tả nghiệp vụ OCOP được cung cấp trong dự án.
- **Trạng thái:** `DRAFT – PENDING VALIDATION`

### 1.1. Quy ước trạng thái

| Nhãn | Ý nghĩa |
|---|---|
| `CONFIRMED` | Nguồn nghiên cứu xác nhận trực tiếp |
| `INFERRED` | Suy luận từ nguồn, chưa xác nhận trực tiếp |
| `PROPOSED` | Đề xuất phục vụ thiết kế hệ thống |
| `TO_VERIFY` | Cần đối chiếu văn bản/biểu mẫu/thực tế |
| `CONFLICT` | Các nguồn có thông tin chưa thống nhất |

> Không coi mọi kết quả NotebookLM là quy định pháp lý cuối cùng. Thẩm quyền, ngưỡng điểm, điều kiện bắt buộc, biểu mẫu và thời hạn phải được xác minh trước khi trở thành Business Rule chính thức.

---

# 2. OCOP Business Context

Miền OCOP hỗ trợ HTX:

1. Xác định sản phẩm tham gia OCOP.
2. Chuẩn bị và quản lý hồ sơ.
3. Quản lý bộ tiêu chí và phiên bản áp dụng.
4. Tự đánh giá/chấm điểm.
5. Thu thập và liên kết minh chứng.
6. Theo dõi yêu cầu bổ sung.
7. Hỗ trợ đánh giá/chấm điểm của bên có thẩm quyền.
8. Lưu kết quả phân hạng.
9. Kết xuất hồ sơ/báo cáo.
10. Bảo toàn lịch sử, phiên bản và khả năng truy vết.

Nguồn nghiên cứu mô tả hồ sơ gồm phiếu đăng ký, báo cáo tự đánh giá, tài liệu thuyết minh, sản phẩm mẫu khi yêu cầu và hệ thống minh chứng. fileciteturn10file2L139-L149

---

# 3. Phạm vi nghiệp vụ

## 3.1. In Scope

- Hồ sơ OCOP.
- Sản phẩm OCOP.
- Bộ tiêu chí và phiên bản.
- Nhóm tiêu chí.
- Tiêu chí/chỉ tiêu.
- Tự đánh giá.
- Điểm đánh giá.
- Minh chứng và phiên bản minh chứng.
- Yêu cầu bổ sung.
- Nhận xét/giải trình.
- Kết quả đánh giá.
- Kết xuất hồ sơ.
- Audit/traceability.

## 3.2. Không coi là nghiệp vụ lõi

- Thay thế hoàn toàn quy trình hành chính của cơ quan nhà nước.
- Tự động ban hành quyết định công nhận.
- Tự động kết luận pháp lý.
- Tự động sửa điểm của Hội đồng.
- Tự động xác nhận tính pháp lý của tài liệu.
- Hard-code một workflow cấp hành chính khi chưa xác minh.
- Hard-code ngưỡng sao khi chưa xác minh bộ tiêu chí hiện hành.

---

# 4. Actor và vai trò

| Actor | Vai trò |
|---|---|
| Chủ thể OCOP / Đại diện HTX | Chuẩn bị hồ sơ, tự đánh giá, cung cấp minh chứng |
| Cán bộ phụ trách HTX | Nhập/tổng hợp dữ liệu, theo dõi hồ sơ |
| Cán bộ tiếp nhận/kiểm tra | Kiểm tra hồ sơ, yêu cầu bổ sung |
| Người thẩm định/đánh giá | Kiểm tra minh chứng, chấm điểm |
| Thành viên Hội đồng | Chấm điểm độc lập nếu quy trình thực tế yêu cầu |
| Thư ký Hội đồng | Tổng hợp hồ sơ, phiếu chấm, biên bản |
| Cấp có thẩm quyền | Quyết định/công nhận kết quả |
| Quản trị bộ tiêu chí | Quản lý phiên bản tiêu chí trong hệ thống — **PROPOSED** |

Nguồn nghiên cứu mô tả chủ thể OCOP là đại diện hợp pháp của chủ thể đăng ký và có các vai trò kiểm tra/phê duyệt trong quy trình. fileciteturn10file0L41-L83

> Chức danh, cấp và thẩm quyền cụ thể phải `TO_VERIFY` trước khi hard-code.

---

# 5. Business Object Model

```text
Product
   │
   └── OcopApplication
          │
          ├── CriteriaVersion
          │      └── CriteriaGroup
          │             └── Criterion / Indicator
          │
          ├── SelfAssessment
          │      └── AssessmentScore
          │
          ├── Evidence
          │      └── EvidenceVersion
          │
          ├── Review / RevisionRequest
          │
          ├── CouncilEvaluation
          │      └── EvaluationScore
          │
          └── OcopResult
```

Đây là **Business Object Model**, chưa phải database schema.

---

# 6. Cấu trúc hồ sơ OCOP

Nguồn nghiên cứu mô tả các thành phần hồ sơ gồm Biểu số 1, Biểu số 2, tài liệu thuyết minh, sản phẩm mẫu khi yêu cầu và cây minh chứng/phụ lục. fileciteturn10file2L139-L149

```text
OCOP Application
├── Registration Form
├── Self Assessment Report
├── Product Explanation
├── Evidence Index
├── Evidence Files
└── Other Required Attachments
```

### Nguyên tắc

- Hồ sơ xác định sản phẩm tham gia.
- Hồ sơ xác định bộ tiêu chí/phiên bản áp dụng.
- Minh chứng được liên kết với tiêu chí/chỉ tiêu khi có thể.
- Hồ sơ bảo toàn lịch sử thay đổi.
- Không xóa lịch sử minh chứng đã được sử dụng trong hồ sơ.

---

# 7. BP-OCOP-01 – Khởi tạo và chuẩn bị hồ sơ

## Trigger

- HTX quyết định đăng ký sản phẩm.
- Có đợt đánh giá/phân hạng.
- Có nhu cầu đánh giá lại.

## Preconditions

- Sản phẩm tồn tại.
- Người dùng có quyền.
- Bộ tiêu chí áp dụng đã được xác định hoặc lựa chọn được.

## Main Flow

```text
1. Chọn sản phẩm.
2. Chọn loại/lần đánh giá.
3. Xác định bộ tiêu chí áp dụng.
4. Tạo hồ sơ.
5. Nhập thông tin chủ thể/sản phẩm.
6. Chuẩn bị Biểu số 1.
7. Chuẩn bị Biểu số 2.
8. Nhập/tham chiếu tài liệu thuyết minh.
9. Tập hợp minh chứng.
10. Kiểm tra checklist.
11. Hoàn thiện hồ sơ.
12. Chuyển bước theo quy trình áp dụng.
```

Nguồn nghiên cứu ghi nhận trạng thái bản nháp và chuyển trình; cơ chế rút hồ sơ sau khi trình vẫn là điểm cần xác minh. fileciteturn10file5L211-L227

---

# 8. BP-OCOP-02 – Quản lý bộ tiêu chí

## Cấu trúc

```text
Criteria Set
   ↓
Version
   ↓
Section / Group
   ↓
Criterion
   ↓
Indicator
   ↓
Scoring Rule
```

Nguồn nghiên cứu mô tả bộ tiêu chí theo các phần/nhóm chỉ tiêu, thang điểm và các chỉ tiêu khống chế/bắt buộc. fileciteturn10file5L228-L234

## Thuộc tính nghiệp vụ

| Thuộc tính | Status |
|---|---|
| Criteria Code | PROPOSED |
| Name | CONFIRMED/PROPOSED |
| Section/Group | CONFIRMED theo nguồn |
| Max Score | CONFIRMED theo nguồn tổng quát |
| Mandatory/Control Flag | CONFIRMED theo nguồn |
| Version | PROPOSED |
| Effective From/To | PROPOSED |
| Source | PROPOSED |

## Rules

- Hồ sơ phải biết phiên bản tiêu chí được áp dụng.
- Không sửa đè phiên bản đã dùng cho hồ sơ lịch sử.
- Bộ tiêu chí mới tạo phiên bản mới.
- Điểm tối đa và điều kiện bắt buộc lấy từ nguồn chính thức.

---

# 9. BP-OCOP-03 – Tự đánh giá / chấm điểm

```text
1. Mở hồ sơ.
2. Tải phiên bản tiêu chí.
3. Xem từng tiêu chí/chỉ tiêu.
4. Nhập điểm/mức đáp ứng.
5. Nhập giải trình.
6. Liên kết minh chứng.
7. Kiểm tra mục bắt buộc.
8. Hoàn tất tự đánh giá.
9. Khóa phiên khi chuyển bước.
```

### Outputs

- Bảng điểm tự đánh giá.
- Giải trình.
- Liên kết minh chứng.
- Tổng điểm tự đánh giá.

### Rules

- Điểm gắn với tiêu chí/chỉ tiêu.
- Không vượt điểm tối đa.
- Lưu người thực hiện và thời điểm.
- Lưu phiên bản tiêu chí.

---

# 10. BP-OCOP-04 – Quản lý minh chứng

Nguồn nghiên cứu mô tả minh chứng dưới dạng tài liệu scan và liên kết với phụ lục/báo cáo tự đánh giá. fileciteturn10file1L98-L103

## Main Flow

```text
1. Xác định yêu cầu minh chứng.
2. Chọn/tải tệp.
3. Nhập mô tả.
4. Gắn với tiêu chí/chỉ tiêu.
5. Kiểm tra.
6. Ghi nhận phiên bản.
7. Đưa vào hồ sơ.
8. Nếu bị yêu cầu sửa:
      - giữ bản cũ
      - tạo bản mới
      - ghi lý do.
```

## Metadata

- Evidence ID.
- Tên.
- Loại.
- Mô tả.
- Tiêu chí liên quan.
- Ngày phát hành/hết hạn nếu có.
- Nguồn.
- Người cung cấp.
- Phiên bản.
- Trạng thái kiểm tra.

## Status đề xuất

```text
DRAFT → UPLOADED → PENDING_VERIFY → VERIFIED
                         └→ REJECTED → REPLACED / RESUBMITTED
```

> `VERIFIED` chỉ có nghĩa đã được kiểm tra theo quy trình hệ thống; không tự động đồng nghĩa “có giá trị pháp lý”.

---

# 11. BP-OCOP-05 – Kiểm tra và yêu cầu bổ sung

```text
1. Mở hồ sơ.
2. Kiểm tra thành phần.
3. Kiểm tra minh chứng.
4. Ghi nhận vấn đề.
5. Gắn vấn đề với tiêu chí/tài liệu.
6. Tạo yêu cầu bổ sung.
7. Đặt thời hạn nếu áp dụng.
8. Gửi yêu cầu.
9. Chủ thể bổ sung/chỉnh sửa.
10. Nộp lại.
11. Kiểm tra lại.
```

### Output

- Danh sách yêu cầu bổ sung.
- Nhận xét.
- Phiên bản hồ sơ mới.
- Lịch sử xử lý.

---

# 12. BP-OCOP-06 – Đánh giá / chấm điểm

Nguồn nghiên cứu mô tả Hội đồng/cơ quan đánh giá, chấm điểm và các bước chuyển hồ sơ; cấp/thẩm quyền cụ thể vẫn cần xác minh. fileciteturn10file2L130-L138

```text
1. Hồ sơ đủ điều kiện.
2. Người đánh giá được phân quyền.
3. Mở phiên đánh giá.
4. Xem tiêu chí.
5. Xem minh chứng.
6. Nhập điểm.
7. Nhập nhận xét.
8. Hoàn thành phiếu.
9. Tổng hợp theo rule đã cấu hình.
10. Ghi nhận kết quả.
```

Nếu có nhiều người chấm độc lập:

```text
Evaluation Session
 ├── Evaluator A → Score
 ├── Evaluator B → Score
 └── Evaluator C → Score
          ↓
   Aggregated Result
```

Nguồn nghiên cứu nêu điểm trung bình cộng và quy tắc chênh lệch điểm, nhưng các con số phải `TO_VERIFY` trước khi thành rule cứng. fileciteturn10file7L289-L298

### Nguyên tắc

Hệ thống không tự sửa điểm. Nếu có bất thường:

```text
Detect → Flag → Notify → Human Review → Decision
```

---

# 13. BP-OCOP-07 – Tổng hợp kết quả và phân hạng

```text
1. Khóa phiếu chấm hợp lệ.
2. Tổng hợp điểm.
3. Kiểm tra điều kiện khống chế.
4. Xác định hạng đề xuất.
5. Chuyển đến cấp có thẩm quyền.
6. Ghi nhận quyết định.
7. Lưu kết quả cuối cùng.
```

Không thiết kế đơn giản:

```text
TotalScore >= X → Automatically Approved
```

Mà:

```text
Score
 +
Mandatory Conditions
 +
Eligibility Conditions
        ↓
Proposed Classification
        ↓
Authorized Decision
```

---

# 14. BP-OCOP-08 – Quản lý kết quả và hiệu lực

```text
1. Nhận quyết định/kết quả.
2. Lưu số hiệu/ngày quyết định.
3. Gắn với sản phẩm.
4. Lưu hạng được công nhận.
5. Lưu hiệu lực nếu có.
6. Theo dõi trạng thái.
7. Nhắc đánh giá lại khi quy định yêu cầu.
```

### Rules

- Phân biệt `Proposed Classification` và `Final Result`.
- Kết quả cuối cùng phải dựa trên quyết định của cấp có thẩm quyền.
- Không hard-code thời hạn hiệu lực khi chưa xác minh.

---

# 15. BP-OCOP-09 – Kết xuất hồ sơ

```text
1. Chọn hồ sơ.
2. Chọn phiên bản.
3. Kiểm tra tính đầy đủ.
4. Chọn template.
5. Tổng hợp dữ liệu.
6. Liên kết danh mục minh chứng.
7. Sinh PDF/DOCX.
8. Lưu phiên bản kết xuất.
9. Ghi người/thời điểm.
```

### Outputs

- Biểu mẫu.
- Báo cáo tự đánh giá.
- Danh mục minh chứng.
- Báo cáo điểm.
- Bộ hồ sơ điện tử.

> PDF/DOCX là khả năng hệ thống; không đồng nghĩa cơ quan nhà nước bắt buộc tiếp nhận hoàn toàn điện tử.

---

# 16. Workflow hồ sơ

```text
DRAFT
  ↓
SELF_ASSESSING
  ↓
READY_FOR_SUBMISSION
  ↓
SUBMITTED
  ↓
IN_REVIEW
  ├──→ NEED_REVISION
  │        ↓
  │   RESUBMITTED
  │        │
  └────────┘
       ↓
READY_FOR_EVALUATION
       ↓
EVALUATING
       ↓
EVALUATED
       ↓
PENDING_DECISION
       ↓
APPROVED
       ↓
ACTIVE_RESULT
```

Có thể có:

```text
IN_REVIEW → REJECTED
EVALUATING → NEED_REVISION
PENDING_DECISION → NOT_APPROVED
```

Các trạng thái là **system proposal**, cần mapping với thực tế.

---

# 17. Phiên bản hóa

## Những thứ cần version

- Bộ tiêu chí.
- Hồ sơ.
- Báo cáo tự đánh giá.
- Minh chứng.
- Bộ hồ sơ kết xuất.
- Kết quả đánh giá.

## Nguyên tắc

```text
Version 1 → Revision → Version 2 → Revision → Version 3
```

Không sửa đè nội dung lịch sử đã được dùng để đánh giá.

### Version record đề xuất

```text
version_number
created_at
created_by
change_reason
status
source_version
```

---

# 18. Audit và Traceability

```text
Result
 ↓
Evaluation
 ↓
Score
 ↓
Criterion
 ↓
Evidence
 ↓
Evidence Version
 ↓
Source Document
```

Các sự kiện audit đề xuất:

```text
CREATE_APPLICATION
UPDATE_APPLICATION
SUBMIT_APPLICATION
REQUEST_REVISION
UPLOAD_EVIDENCE
REPLACE_EVIDENCE
VERIFY_EVIDENCE
REJECT_EVIDENCE
ENTER_SCORE
UPDATE_SCORE
LOCK_EVALUATION
APPROVE_RESULT
EXPORT_DOCUMENT
```

Đây là **PROPOSED system audit model**.

---

# 19. Business Rules sơ bộ

| Rule ID | Nội dung | Status |
|---|---|---|
| OCOP-BR-001 | Hồ sơ phải xác định sản phẩm | CONFIRMED |
| OCOP-BR-002 | Hồ sơ phải gắn bộ tiêu chí áp dụng | PROPOSED |
| OCOP-BR-003 | Điểm phải gắn tiêu chí/chỉ tiêu | PROPOSED |
| OCOP-BR-004 | Điểm không vượt điểm tối đa | PROPOSED |
| OCOP-BR-005 | Tiêu chí có phiên bản | PROPOSED |
| OCOP-BR-006 | Minh chứng có thể có nhiều phiên bản | PROPOSED |
| OCOP-BR-007 | Lịch sử hồ sơ phải truy vết | PROPOSED |
| OCOP-BR-008 | Điều kiện khống chế/bắt buộc phải được kiểm tra | CONFIRMED theo nguồn tổng hợp |
| OCOP-BR-009 | Hạng đề xuất khác kết quả cuối cùng | PROPOSED |
| OCOP-BR-010 | Không tự sửa điểm của người đánh giá | PROPOSED |
| OCOP-BR-011 | Thẩm quyền phê duyệt | TO_VERIFY |
| OCOP-BR-012 | Thời hạn hiệu lực | TO_VERIFY |
| OCOP-BR-013 | Ngưỡng điểm/hạng sao | TO_VERIFY |
| OCOP-BR-014 | Quy tắc chênh lệch điểm | TO_VERIFY |

---

# 20. Các điểm xung đột/chưa rõ từ nguồn A–F

## 20.1. Workflow “3 cấp”

Một tài liệu gọi là “3 cấp” nhưng lại mô tả Xã/Huyện/Tỉnh/Trung ương. fileciteturn10file1L104-L118

**Status:** `CONFLICT / TO_VERIFY`.

## 20.2. Cấp phê duyệt

Nguồn nghiên cứu mô tả các cấp phê duyệt theo hạng sao. fileciteturn10file0L70-L83

**Status:** `TO_VERIFY`.

## 20.3. Độ lệch điểm 10 điểm

Nguồn nghiên cứu nêu quy tắc chênh lệch không quá 10 điểm. fileciteturn10file7L289-L298

**Status:** `TO_VERIFY`.

## 20.4. VietGAP

Nguồn tổng thể gắn nhật ký sản xuất với VietGAP và OCOP. fileciteturn10file4L184-L199

**Status:** Không mặc định mọi sản phẩm phải VietGAP; cần xác định phạm vi thực tế.

---

# 21. Liên kết OCOP với dữ liệu HTX

```text
Member
   ↓
Farm Plot / Crop Area
   ↓
Crop Season
   ↓
Farming Log
   ↓
Harvest / Lot
   ↓
Product
   ↓
OCOP Application
   ↓
Criterion
   ↓
Evidence
```

Dữ liệu HTX có thể hỗ trợ điền hồ sơ, nhưng:

> **Dữ liệu nội bộ được tái sử dụng không mặc nhiên trở thành minh chứng pháp lý.**

Hệ thống chỉ nên hỗ trợ tham chiếu/tái sử dụng; người có trách nhiệm vẫn xác nhận nội dung.

---

# 22. Các nội dung không được hard-code

### Không được

```text
if score >= 90:
    result = "5 STAR"
```

### Nên

```text
Criteria Version
      ↓
Scoring Rules
      ↓
Mandatory Conditions
      ↓
Score Result
      ↓
Proposed Classification
      ↓
Authorized Decision
```

### Không được

```text
DELETE old evidence
```

### Nên

```text
Old Evidence → Retained
New Evidence → New Version
Revision → Audit Log
```

### Không được

```text
Hard-code OCOP criteria in source code
```

### Nên

```text
Criteria Set
   ↓
Version
   ↓
Criteria
   ↓
Scoring Configuration
```

---

# 23. Process Dependency

| Process | Input từ | Output cho |
|---|---|---|
| OCOP-01 | Product | OCOP-02/03/04 |
| OCOP-02 | Bộ tiêu chí | OCOP-03/06/07 |
| OCOP-03 | Criteria Version | OCOP-04/05/06 |
| OCOP-04 | Evidence | OCOP-03/05/06/09 |
| OCOP-05 | Application/Evidence | OCOP-01/06 |
| OCOP-06 | Application/Criteria/Evidence | OCOP-07 |
| OCOP-07 | Scores/Rules | OCOP-08/09 |
| OCOP-08 | Decision | OCOP-09 |
| OCOP-09 | Application/Result/Evidence | Báo cáo/Hồ sơ |

---

# 24. Definition of Done – Hồ sơ sẵn sàng trình

Một hồ sơ có thể chuyển sang `READY_FOR_SUBMISSION` khi:

- [ ] Có sản phẩm.
- [ ] Có chủ thể.
- [ ] Có bộ tiêu chí/phiên bản.
- [ ] Có biểu mẫu cần thiết.
- [ ] Các trường bắt buộc đã hoàn thành.
- [ ] Tự đánh giá hoàn thành nếu yêu cầu.
- [ ] Minh chứng cần thiết đã liên kết.
- [ ] Không còn lỗi validation.
- [ ] Người có trách nhiệm xác nhận.
- [ ] Phiên bản hồ sơ được khóa.

Đây là **system readiness checklist**, không thay thế checklist pháp lý chính thức.

---

# 25. Open Questions cần xác minh

| ID | Câu hỏi | Priority |
|---|---|---|
| OQ-001 | Bộ tiêu chí OCOP mà đơn vị đang áp dụng là phiên bản nào? | Critical |
| OQ-002 | Đề tài tập trung nhóm sản phẩm OCOP nào? | Critical |
| OQ-003 | Có cần hỗ trợ tất cả nhóm sản phẩm không? | High |
| OQ-004 | Có quản lý Biểu 1/2/3 theo template versioning không? | Critical |
| OQ-005 | Quy trình tiếp nhận/đánh giá thực tế tại địa bàn? | Critical |
| OQ-006 | Ai có quyền chấm điểm? | Critical |
| OQ-007 | Có nhiều giám khảo chấm độc lập không? | High |
| OQ-008 | Công thức tổng hợp điểm chính xác? | Critical |
| OQ-009 | Quy tắc chênh lệch điểm có áp dụng? | Critical |
| OQ-010 | Tiêu chí nào là khống chế/bắt buộc? | Critical |
| OQ-011 | Minh chứng nào có thời hạn? | High |
| OQ-012 | Có yêu cầu ký số không? | High |
| OQ-013 | Bản điện tử thay thế hay song song với bản giấy? | Critical |
| OQ-014 | Có theo dõi đánh giá lại không? | High |
| OQ-015 | Có tự động tái sử dụng dữ liệu HTX vào hồ sơ không? | High |

---

# 26. Quy tắc chuyển sang tài liệu tiếp theo

```text
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

Phân biệt:

- `04_OCOP_BUSINESS.md` = nghiệp vụ OCOP.
- `06_BUSINESS_RULES.md` = luật nghiệp vụ đã xác minh.
- `07_BUSINESS_REQUIREMENTS.md` = hệ thống cần đáp ứng điều gì.
- `08_FUNCTIONAL_REQUIREMENTS.md` = hệ thống phải cung cấp chức năng gì.

---

# 27. Trạng thái tài liệu

**`DRAFT – PENDING VALIDATION`**

Trước khi chuyển sang Business Rules chính thức cần xác minh tối thiểu:

1. Bộ tiêu chí OCOP áp dụng.
2. Biểu mẫu OCOP áp dụng.
3. Quy trình và thẩm quyền đánh giá/phân hạng.
4. Ngưỡng điểm và điều kiện khống chế.
5. Thời hạn hiệu lực.
6. Yêu cầu hồ sơ điện tử/bản giấy.
7. Yêu cầu ký/xác nhận hồ sơ.
