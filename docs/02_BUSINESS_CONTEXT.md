# BUSINESS CONTEXT
## Hệ thống quản lý hoạt động Hợp tác xã nông nghiệp và số hóa hồ sơ đánh giá, phân hạng OCOP

**Document ID:** BC-HTX-OCOP  
**Version:** 2.0  
**Status:** DRAFT – PENDING VALIDATION  
**Purpose:** Business Analysis  
**Last Updated:** 2026-08-28

---

# 1. DOCUMENT PURPOSE

Tài liệu này mô tả bối cảnh nghiệp vụ của hệ thống quản lý hoạt động Hợp tác xã (HTX) nông nghiệp và số hóa hồ sơ đánh giá, phân hạng sản phẩm OCOP.

Tài liệu được sử dụng làm đầu vào cho:

- Business Requirements.
- Functional Requirements.
- Business Process Analysis.
- Use Case Analysis.
- Business Rules.
- Domain Model.
- Data Model.
- System Architecture.

Tài liệu này **không phải** thiết kế database, API hoặc kiến trúc kỹ thuật.

---

# 2. DOCUMENT STATUS & TRUST MODEL

Các thông tin trong tài liệu được phân loại:

| Classification | Ý nghĩa |
|---|---|
| CONFIRMED | Có căn cứ rõ ràng từ tài liệu nguồn đã xác minh |
| INFERRED | Suy luận hợp lý nhưng chưa được xác nhận |
| PROPOSED | Đề xuất phục vụ thiết kế hệ thống |
| UNKNOWN | Chưa đủ thông tin |
| CONFLICT | Các nguồn có thông tin mâu thuẫn |
| TO_VERIFY | Cần xác minh với đơn vị nghiệp vụ hoặc nguồn pháp lý |

### Quy tắc

Không được sử dụng:

- INFERRED
- PROPOSED
- UNKNOWN
- CONFLICT

như một Business Requirement chính thức.

Chỉ thông tin được xác nhận mới được sử dụng để xây dựng Business Rule bắt buộc.

---

# 3. PROJECT OVERVIEW

## 3.1. Tên dự án

**Xây dựng Hệ thống quản lý hoạt động Hợp tác xã nông nghiệp và số hóa hồ sơ đánh giá, phân hạng OCOP**

## 3.2. Mục tiêu

Hệ thống hướng tới:

1. Số hóa hoạt động quản lý HTX.
2. Quản lý tập trung dữ liệu xã viên.
3. Quản lý vùng trồng và hoạt động sản xuất.
4. Quản lý vật tư/kho.
5. Quản lý các nghiệp vụ thu – chi liên quan trong phạm vi dự án.
6. Hỗ trợ theo dõi phân chia lợi nhuận/thặng dư theo quy định và cơ chế thực tế của HTX.
7. Số hóa hồ sơ OCOP.
8. Quản lý tiêu chí và điểm đánh giá.
9. Quản lý minh chứng.
10. Theo dõi tiến độ hoàn thiện hồ sơ.
11. Hỗ trợ quy trình kiểm tra/phê duyệt.
12. Kết xuất báo cáo và hồ sơ.

---

# 4. BUSINESS PROBLEM

Các hoạt động quản lý HTX và chuẩn bị hồ sơ OCOP có thể sử dụng nhiều:

- Hồ sơ giấy.
- Excel.
- File Word/PDF.
- Sổ theo dõi.
- Dữ liệu nằm ở nhiều bộ phận.

Điều này có thể gây ra:

- Trùng lặp dữ liệu.
- Khó truy xuất.
- Khó kiểm soát phiên bản.
- Khó theo dõi trạng thái hồ sơ.
- Khó tổng hợp báo cáo.
- Khó liên kết dữ liệu sản xuất với hồ sơ OCOP.
- Khó kiểm tra tính đầy đủ của minh chứng.

Các vấn đề cụ thể phải được xác nhận lại từ khảo sát thực tế của HTX.

---

# 5. BUSINESS SCOPE

## 5.1. In Scope

### Domain A – Quản lý HTX

- Thông tin HTX.
- Cơ cấu/vai trò.
- Người dùng.
- Phân quyền.

### Domain B – Quản lý xã viên

- Hồ sơ xã viên.
- Loại thành viên.
- Trạng thái.
- Vốn góp.
- Lịch sử thay đổi.

### Domain C – Vùng trồng & sản xuất

- Vùng trồng.
- Thửa đất.
- Mùa vụ.
- Hoạt động sản xuất.
- Nhật ký sản xuất.
- Thu hoạch nếu cần.

### Domain D – Vật tư & kho

- Danh mục vật tư.
- Kho.
- Nhập kho.
- Xuất kho.
- Tồn kho.
- Kiểm kê.

### Domain E – Tài chính nghiệp vụ

- Thu.
- Chi.
- Công nợ nghiệp vụ nếu có.
- Theo dõi kết quả.
- Phân chia lợi nhuận/thặng dư theo business rule được xác nhận.

### Domain F – Sản phẩm

- Thông tin sản phẩm.
- Nguồn nguyên liệu.
- Thông tin sản xuất.
- Hồ sơ sản phẩm.

### Domain G – OCOP

- Hồ sơ OCOP.
- Bộ tiêu chí.
- Tiêu chí.
- Điểm đánh giá.
- Minh chứng.
- Phiên bản.
- Trạng thái.
- Quy trình xử lý.
- Kết xuất hồ sơ.

---

# 6. OUT OF SCOPE – CURRENT VERSION

Các nội dung sau chưa được coi là phạm vi bắt buộc:

- Mobile App độc lập.
- AI nhận diện thuốc/vật tư.
- AI tự động chấm điểm OCOP.
- SMS gateway.
- Thanh toán trực tuyến.
- Tích hợp ngân hàng.
- Tích hợp phần mềm kế toán bên thứ ba.
- IoT.
- Camera AI.
- Tích hợp trực tiếp với hệ thống cơ quan nhà nước.
- Cổng chấm thi OCOP quốc gia.
- Chữ ký số tích hợp.
- Thương mại điện tử.

Các chức năng này chỉ được đưa vào phạm vi nếu có yêu cầu chính thức.

---

# 7. BUSINESS STAKEHOLDERS

Các stakeholder dự kiến:

| Stakeholder | Mối quan tâm |
|---|---|
| Thành viên HTX | Thông tin cá nhân, vốn góp, sản xuất |
| Ban lãnh đạo HTX | Quản lý và điều hành |
| Kế toán | Vốn góp, thu–chi, công nợ |
| Thủ kho | Kho và vật tư |
| Cán bộ kỹ thuật | Vùng trồng, mùa vụ, sản xuất |
| Người phụ trách OCOP | Hồ sơ, tiêu chí, minh chứng |
| Cơ quan/đơn vị liên quan | Tiếp nhận/thẩm định nếu thuộc phạm vi |
| Quản trị hệ thống | Người dùng và phân quyền |

Danh sách chính thức phải được xác nhận sau khảo sát.

---

# 8. SYSTEM ACTORS

Actor phần mềm phải được phân biệt với stakeholder.

Các actor dự kiến:

- System Administrator.
- HTX Manager.
- Accountant.
- Warehouse Staff.
- Technical Staff.
- Member.
- OCOP Officer.

Actor bên ngoài chỉ được đưa vào hệ thống nếu hệ thống thực sự cung cấp chức năng cho họ.

---

# 9. BUSINESS DOMAINS

## 9.1. HTX Management

Quản lý tổ chức, người dùng và các thông tin nền.

## 9.2. Member Management

Quản lý vòng đời xã viên và vốn góp.

## 9.3. Production Management

Quản lý vùng trồng, mùa vụ, hoạt động sản xuất và thu hoạch.

## 9.4. Inventory Management

Quản lý vật tư, kho và giao dịch kho.

## 9.5. Financial Operations

Quản lý các nghiệp vụ tài chính nằm trong phạm vi hệ thống.

## 9.6. Product Management

Quản lý sản phẩm và thông tin liên quan.

## 9.7. OCOP Management

Quản lý hồ sơ, tiêu chí, điểm và minh chứng OCOP.

---

# 10. CORE BUSINESS FLOW

Mô hình tổng quát:

```text
HTX
 │
 ├── Xã viên
 │     │
 │     └── Vốn góp
 │
 ├── Vùng trồng
 │     │
 │     └── Thửa đất
 │           │
 │           └── Mùa vụ
 │                 │
 │                 └── Hoạt động sản xuất
 │                       │
 │                       └── Thu hoạch
 │
 ├── Vật tư / Kho
 │
 ├── Thu – Chi
 │
 ├── Sản phẩm
 │
 └── Hồ sơ OCOP
        │
        ├── Tiêu chí
        ├── Điểm
        ├── Minh chứng
        ├── Phiên bản
        └── Workflow
```

Đây là conceptual model, chưa phải database ERD.

---

# 11. HTX BUSINESS PROCESSES

Các quy trình chính cần phân tích:

1. Quản lý xã viên.
2. Quản lý vốn góp.
3. Quản lý vùng trồng.
4. Quản lý mùa vụ.
5. Quản lý hoạt động sản xuất.
6. Quản lý vật tư.
7. Quản lý kho.
8. Kiểm kê.
9. Thu – chi.
10. Công nợ nếu có.
11. Phân chia lợi nhuận/thặng dư.
12. Quản lý sản phẩm.

Chi tiết từng quy trình được quản lý tại:

`03_BUSINESS_PROCESSES.md`

---

# 12. OCOP BUSINESS CONTEXT

Hệ thống hỗ trợ số hóa quá trình chuẩn bị và quản lý hồ sơ OCOP trong phạm vi được xác định bởi:

- Tài liệu pháp lý hiện hành.
- Biểu mẫu chính thức.
- Tài liệu do đơn vị cung cấp.
- Quy trình thực tế được khảo sát.

Không hard-code các tiêu chí OCOP dựa trên tài liệu chưa được xác minh phiên bản.

Chi tiết:

`04_OCOP_BUSINESS.md`

---

# 13. OCOP DATA CONCEPT

Khái niệm nghiệp vụ dự kiến:

```text
OCOP Program
      │
      └── Criteria Set
             │
             ├── Criteria Group
             │
             └── Criterion
                    │
                    ├── Score
                    └── Evidence

Product
   │
   └── OCOP Application
           │
           ├── Self Assessment
           ├── Evidence
           ├── Review
           ├── Evaluation
           └── Result
```

Cấu trúc chính thức phải dựa trên bộ tiêu chí/biểu mẫu phiên bản được xác nhận.

---

# 14. HTX – OCOP RELATIONSHIP

Một trong những mục tiêu quan trọng của hệ thống là hạn chế nhập lại cùng một dữ liệu nhiều lần.

Ví dụ về khả năng tái sử dụng dữ liệu:

```text
Member
   ↓
Production Area
   ↓
Production Activity
   ↓
Product
   ↓
OCOP Application
   ↓
Evidence
```

Tuy nhiên:

> Tái sử dụng dữ liệu là một SYSTEM DESIGN OPPORTUNITY, không mặc định là BUSINESS RULE.

Việc dữ liệu nào được sử dụng làm minh chứng phải được xác định theo từng tiêu chí và tài liệu chính thức.

---

# 15. BUSINESS ENTITY CONCEPTS

Các entity nghiệp vụ dự kiến:

- Cooperative.
- User.
- Role.
- Member.
- Capital Contribution.
- Production Area.
- Farm Plot.
- Crop Season.
- Production Activity.
- Production Log.
- Supply.
- Warehouse.
- Inventory Transaction.
- Income.
- Expense.
- Debt/Receivable nếu cần.
- Profit/Surplus Distribution.
- Product.
- Harvest.
- OCOP Application.
- OCOP Criteria Set.
- OCOP Criterion Group.
- OCOP Criterion.
- Assessment.
- Evidence.
- Document.
- Document Version.
- Approval/Workflow.
- Audit Log.

Đây là business entity concepts.

Không xem danh sách này là database schema chính thức.

---

# 16. BUSINESS RULE MANAGEMENT

Mỗi Business Rule phải có metadata:

```text
Rule ID
Title
Description
Classification
Source
Source Version
Effective Date
Verified Date
Verified By
Related Process
Related Entity
```

Ví dụ:

```text
BR-MEMBER-001

Title:
Giới hạn vốn góp

Description:
[Business rule]

Classification:
TO_VERIFY

Source:
[Official source]

Source Version:
[Version]

Status:
PENDING VALIDATION
```

Không hard-code Business Rule vào hệ thống trước khi rule được xác nhận.

---

# 17. DOCUMENT & EVIDENCE CONCEPT

Phân biệt:

### Document

Một loại tài liệu/hồ sơ nghiệp vụ.

### Evidence

Minh chứng được sử dụng để chứng minh một yêu cầu/tiêu chí.

### File

Tệp vật lý được lưu trữ.

### Document Version

Phiên bản của tài liệu.

### Evidence Mapping

Quan hệ giữa minh chứng và tiêu chí.

Ví dụ:

```text
Criterion
   │
   └── Evidence
          │
          └── File
                │
                └── Version
```

Một file có thể cần được liên kết với nhiều tiêu chí nếu nghiệp vụ cho phép.

---

# 18. WORKFLOW CONCEPT

Workflow dự kiến có thể bao gồm:

```text
DRAFT
   ↓
SUBMITTED
   ↓
UNDER_REVIEW
   ↓
REVISION_REQUIRED
   ↓
RESUBMITTED
   ↓
APPROVED
   ↓
COMPLETED
```

Đây chỉ là workflow khái niệm.

Workflow chính thức phải được xác định theo từng loại hồ sơ/nghiệp vụ.

Không được giả định rằng mọi nghiệp vụ sử dụng cùng một workflow.

---

# 19. CURRENT PROBLEMS

Các vấn đề cần khảo sát:

- Quản lý hồ sơ phân tán.
- Nhập dữ liệu trùng lặp.
- Khó theo dõi trạng thái hồ sơ.
- Khó kiểm soát phiên bản.
- Khó tìm kiếm minh chứng.
- Khó tổng hợp báo cáo.
- Khó truy xuất lịch sử.
- Khó liên kết dữ liệu sản xuất với hồ sơ OCOP.

Mức độ nghiêm trọng và mức độ xảy ra thực tế phải được xác nhận qua khảo sát.

---

# 20. DIGITALIZATION OPPORTUNITIES

Các cơ hội số hóa được chia thành:

### Core

- Quản lý dữ liệu tập trung.
- Workflow.
- Quản lý minh chứng.
- Phân quyền.
- Audit log.
- Báo cáo.
- Kết xuất hồ sơ.

### Enhancement

- GIS.
- QR Code.
- Notification.
- Tự động tái sử dụng dữ liệu.
- Tự động kiểm tra tính đầy đủ hồ sơ.

### Future

- Mobile App.
- AI.
- IoT.
- OCR.
- Voice Input.
- Tích hợp hệ thống bên ngoài.

---

# 21. NON-FUNCTIONAL BUSINESS EXPECTATIONS

Ở mức nghiệp vụ, hệ thống cần đáp ứng:

### Security

Người dùng chỉ được truy cập dữ liệu/chức năng thuộc quyền.

### Traceability

Các thao tác quan trọng phải có khả năng truy vết.

### Data Integrity

Dữ liệu nghiệp vụ phải nhất quán.

### Document Security

Minh chứng phải được kiểm soát quyền truy cập.

### Availability

Hệ thống phải có cơ chế backup và recovery phù hợp.

Các yêu cầu kỹ thuật cụ thể được đặc tả ở tài liệu kiến trúc.

---

# 22. ASSUMPTIONS

Mọi giả định phải được ghi rõ.

Ví dụ:

```text
ASM-001
Giả định HTX sử dụng hệ thống để quản lý một đơn vị HTX.

Status:
TO_VERIFY
```

Không được sử dụng ASSUMPTION như một CONFIRMED BUSINESS RULE.

---

# 23. OPEN QUESTIONS

Các câu hỏi cần xác minh:

1. Hệ thống phục vụ một HTX hay nhiều HTX?
2. Ai là người quản trị hệ thống?
3. Xã viên có trực tiếp sử dụng hệ thống không?
4. Có cần Mobile App không?
5. HTX đang sử dụng phần mềm kế toán nào?
6. Thu – chi cần quản lý đến mức nào?
7. Công thức phân chia lợi nhuận/thặng dư thực tế là gì?
8. Có quản lý vùng trồng GIS không?
9. Có cần quản lý mã PUC không?
10. Có cần quản lý truy xuất nguồn gốc không?
11. Quy trình OCOP thực tế tại đơn vị gồm những bước nào?
12. Ai chuẩn bị hồ sơ?
13. Ai kiểm tra?
14. Ai phê duyệt?
15. Cơ quan bên ngoài có trực tiếp sử dụng hệ thống không?
16. Hồ sơ OCOP hiện đang sử dụng những biểu mẫu phiên bản nào?
17. Bộ tiêu chí OCOP nào đang được áp dụng?
18. Minh chứng nào bắt buộc?
19. Hồ sơ cần xuất PDF/DOCX theo mẫu nào?
20. Có yêu cầu chữ ký số không?

---

# 24. SOURCE TRACEABILITY

Mỗi thông tin quan trọng phải truy được về nguồn.

Mẫu:

| ID | Information | Classification | Source | Status |
|---|---|---|---|---|
| SRC-001 | ... | CONFIRMED | Luật/biểu mẫu... | VERIFIED |
| SRC-002 | ... | INFERRED | Báo cáo khảo sát | PENDING |
| SRC-003 | ... | PROPOSED | BA proposal | PROPOSED |

---

# 25. CONFLICT MANAGEMENT

Khi có hai nguồn mâu thuẫn:

```text
CONFLICT
    ↓
Không tự chọn
    ↓
Xác định nguồn
    ↓
Kiểm tra phiên bản/thời điểm
    ↓
Xác minh với nghiệp vụ
    ↓
Cập nhật trạng thái
```

Không được tự động "chốt" một phương án chỉ vì nó có vẻ hợp lý.

---

# 26. DOCUMENT DEPENDENCIES

Tài liệu này liên kết với:

```text
01_PROJECT_OVERVIEW.md
        ↓
02_BUSINESS_CONTEXT.md
        ↓
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
09_USE_CASES.md
        ↓
10_DOMAIN_MODEL.md
        ↓
11_DATA_MODEL.md
        ↓
12_SYSTEM_ARCHITECTURE.md
```

---

# 27. IMPORTANT RULE FOR AI AGENTS

AI Agent phải tuân thủ:

1. Không coi tài liệu này là nguồn pháp lý tuyệt đối.
2. Không biến INFERRED thành CONFIRMED.
3. Không biến PROPOSED thành REQUIRED.
4. Không tự tạo Business Rule.
5. Không tự tạo tiêu chí OCOP.
6. Không tự thay đổi workflow.
7. Không tự mở rộng scope.
8. Không thiết kế database từ Business Context nếu chưa có Domain Model.
9. Không viết code nếu Business Requirement chưa rõ.
10. Khi thiếu thông tin quan trọng phải đánh dấu `TO_VERIFY`.
11. Khi phát hiện mâu thuẫn phải đánh dấu `CONFLICT`.
12. Mọi thay đổi quan trọng phải cập nhật tài liệu liên quan.

---

# 28. VALIDATION STATUS

Current status:

```text
Business Context:
DRAFT

Business Processes:
AI ANALYZED

Business Rules:
PENDING VALIDATION

OCOP Rules:
PENDING LEGAL/DOCUMENT VALIDATION

Actors:
PENDING VALIDATION

Scope:
DRAFT

System Requirements:
NOT STARTED

Database:
NOT STARTED

Architecture:
NOT STARTED
```

Tài liệu chỉ trở thành BASELINE sau khi các nội dung quan trọng được xác minh.