# 10_DOMAIN_MODEL.md

# 1. Document Information

| Field | Value |
|---|---|
| Document ID | 10 |
| Document Name | Domain Model Specification |
| Project | Xây dựng Hệ thống quản lý hoạt động Hợp tác xã nông nghiệp và số hóa hồ sơ đánh giá, phân hạng OCOP |
| Source Documents | 01_PROJECT_OVERVIEW.md → 09_USE_CASES.md |
| Primary Input | 09_USE_CASES_FINAL.md |
| Status | BASELINE |
| Purpose | Xác định các domain, aggregate, entity, value object, relationship và invariant làm cơ sở cho thiết kế CSDL/API |

> Tài liệu này mô hình hóa nghiệp vụ, không phải database schema. Tên bảng, cột, API endpoint và công nghệ triển khai chỉ được quyết định ở các tài liệu sau.

---

# 2. Purpose and Scope

Domain Model là lớp trung gian giữa:

```text
Business Context
    ↓
Business Process
    ↓
Business Rules
    ↓
Business Requirements
    ↓
Functional Requirements
    ↓
Use Cases
    ↓
DOMAIN MODEL
    ↓
Database Design
    ↓
API Specification
```

Domain Model phải trả lời:

- Hệ thống quản lý những đối tượng nghiệp vụ nào?
- Đối tượng nào có vòng đời riêng?
- Đối tượng nào thuộc Aggregate nào?
- Các đối tượng liên kết với nhau ra sao?
- Invariant nghiệp vụ nào phải luôn đúng?
- Use Case nào tạo/sửa/đọc các đối tượng đó?

---

# 3. Domain Map

Hệ thống được chia thành các bounded context nghiệp vụ sau:

| Context | Mục đích | Core/Supporting |
|---|---|---|
| Cooperative Management | HTX, thành viên, vốn, biểu quyết | Core |
| Agriculture Management | vùng trồng, thửa, mùa vụ, nhật ký, thu hoạch | Core |
| Product Management | sản phẩm HTX | Core |
| Inventory & Logistics | vật tư, nhập/xuất, tồn kho, kiểm kê | Core |
| Finance | thu/chi, công nợ, phân phối thặng dư | Core |
| OCOP Evaluation | hồ sơ, tiêu chí, chấm điểm, phân hạng | Core |
| Evidence Management | minh chứng và phiên bản | Core |
| Workflow | trạng thái, duyệt, bổ sung, khóa | Supporting |
| Identity & Access | tài khoản, role, scope | Supporting |
| Audit | lịch sử thay đổi và truy vết | Supporting |
| Reporting | dashboard, báo cáo, kết xuất | Supporting |
| Document Generation | PDF/DOCX | Supporting |
| Backup & Recovery | sao lưu/phục hồi | Infrastructure |

---

# 4. Core Domain Relationships

```text
Cooperative
   │
   ├── Member
   │      └── CapitalContribution
   │
   ├── FarmPlot / ProductionUnit
   │      ├── CropSeason
   │      │      ├── FarmingLog
   │      │      ├── InputUsage
   │      │      └── Harvest
   │      │              └── Lot
   │      │
   │      └── MemberAssignment
   │
   ├── Inventory
   │      ├── Material
   │      ├── StockReceipt
   │      ├── StockIssue
   │      └── StockCount
   │
   ├── Finance
   │      ├── CashTransaction
   │      ├── ReceivablePayable
   │      └── SurplusDistributionPlan
   │
   └── Product
          │
          └── OCOPApplication
                  │
                  ├── CriteriaVersion
                  │      ├── CriteriaGroup
                  │      ├── Criterion
                  │      └── Indicator
                  │
                  ├── SelfAssessment
                  ├── Evidence
                  │      └── EvidenceVersion
                  │
                  ├── Review
                  ├── EvaluationSession
                  │      └── EvaluatorScore
                  │
                  ├── ConsolidatedResult
                  ├── ProposedClassification
                  └── FinalDecision
```

---

# 5. Aggregate Overview

| Aggregate | Aggregate Root | Main responsibility |
|---|---|---|
| Cooperative | Cooperative | Thông tin HTX |
| Membership | Member | Vòng đời xã viên |
| Capital | CapitalAccount / CapitalContribution | Góp vốn |
| ProductionUnit | ProductionUnit | Vùng trồng |
| CropSeason | CropSeason | Mùa vụ |
| FarmingLog | FarmingLog | Nhật ký canh tác |
| HarvestLot | Harvest | Thu hoạch và Lot |
| Product | Product | Sản phẩm |
| Inventory | Inventory / StockTransaction | Tồn kho và giao dịch |
| FinanceTransaction | CashTransaction | Thu/chi |
| ReceivablePayable | ReceivablePayable | Công nợ |
| SurplusDistribution | SurplusDistributionPlan | Phân phối thặng dư |
| OCOPCriteria | CriteriaVersion | Bộ tiêu chí có version |
| OCOPApplication | OCOPApplication | Hồ sơ OCOP |
| Evidence | Evidence | Minh chứng |
| Evaluation | EvaluationSession | Phiên đánh giá |
| Decision | FinalDecision | Kết quả chính thức |
| Workflow | WorkflowInstance | Trạng thái xử lý |
| Identity | UserAccount | Tài khoản |
| Authorization | RoleAssignment | Quyền |
| Audit | AuditEvent | Truy vết |

> Một số aggregate có thể được điều chỉnh khi thiết kế transaction boundary ở bước Database Design. Đây là mô hình nghiệp vụ, không phải quyết định cuối cùng về transaction.

---

# 6. Cooperative Management Domain

## 6.1 Cooperative

**Mục đích:** đại diện cho một HTX được quản lý trong hệ thống.

### Attributes

| Attribute | Meaning |
|---|---|
| cooperativeId | Định danh nội bộ |
| cooperativeCode | Mã HTX |
| legalName | Tên pháp lý |
| displayName | Tên hiển thị |
| legalInformation | Thông tin pháp lý |
| contactInformation | Thông tin liên hệ |
| status | Trạng thái |
| createdAt | Thời điểm tạo |
| updatedAt | Thời điểm cập nhật |

### Invariants

- `cooperativeCode` duy nhất.
- Dữ liệu thuộc HTX phải có tenant/scope tương ứng.
- Không xóa vật lý HTX nếu đã phát sinh dữ liệu nghiệp vụ; ưu tiên trạng thái.

### Related Use Cases

UC-COOP-01, UC-RPT-01.

---

# 7. Membership Domain

## 7.1 Member

**Mục đích:** đại diện cho xã viên.

### Attributes

| Attribute | Meaning |
|---|---|
| memberId | Định danh |
| cooperativeId | HTX |
| memberCode | Mã xã viên |
| identityInformation | Thông tin định danh |
| memberType | Loại thành viên |
| status | Trạng thái |
| admissionDate | Ngày gia nhập |
| terminationDate | Ngày chấm dứt nếu có |

### Lifecycle

```text
PENDING
   ↓
ACTIVE
   ↓
PENDING_TERMINATION
   ↓
TERMINATED
```

### Invariants

- Không có hai thành viên ACTIVE dùng cùng định danh trong cùng HTX nếu rule cấm trùng.
- Chỉ ACTIVE mới được tham gia nghiệp vụ yêu cầu tư cách thành viên.
- Hồ sơ TERMINATED vẫn phải giữ lịch sử.

### Related

UC-COOP-02, UC-COOP-05, UC-COOP-06.

---

## 7.2 CapitalContribution

Đại diện một lần/giao dịch góp vốn của thành viên.

### Attributes

- contributionId
- memberId
- contributionType
- amount/value
- transactionDate
- evidenceReference
- status

### Invariants

- Giao dịch đã chốt không được sửa tùy ý.
- Vốn thực góp phải được tính từ các giao dịch hợp lệ.
- Tỷ lệ vốn không lưu như một giá trị nhập tay nếu có thể tính từ dữ liệu nguồn.

---

## 7.3 MembershipMeeting / VoteSession

Đại diện phiên họp/biểu quyết.

### Relationships

```text
Cooperative
  1 ─── N
Meeting
  1 ─── N
Vote
  N ─── 1
Member
```

Trọng số phiếu phải lấy từ Business Rule đã được xác minh.

---

# 8. Agriculture Domain

# 8.1 ProductionUnit

Đại diện vùng trồng/PUC.

### Attributes

- productionUnitId
- cooperativeId
- name/code
- crop
- area
- location
- geometry
- status
- registrationInformation

### Invariants

- Geometry phải hợp lệ nếu GIS được sử dụng.
- Diện tích không âm.
- ProductionUnit thuộc đúng HTX.
- Không cho phép dữ liệu địa lý xung đột nếu rule topology áp dụng.

---

# 8.2 FarmPlot

Đại diện thửa đất thuộc vùng trồng.

### Attributes

- plotId
- productionUnitId
- owner/landRelation
- area
- geometry
- status

### Relationship

```text
ProductionUnit 1 ─── N FarmPlot
Member          N ─── N FarmPlot
```

Quan hệ Member–FarmPlot phải có thực thể liên kết để lưu vai trò/quyền sử dụng/thời gian nếu cần.

---

# 8.3 CropSeason

Đại diện mùa vụ.

### Attributes

- cropSeasonId
- productionUnitId
- crop
- startDate
- expectedEndDate
- actualEndDate
- status
- planInformation

### Lifecycle

```text
PLANNED → ACTIVE → HARVESTING → COMPLETED
                 ↘ CANCELLED
```

### Invariants

- Ngày kết thúc không trước ngày bắt đầu.
- Không có hai mùa vụ xung đột trên cùng thửa nếu rule không cho phép.
- Nhật ký phải tham chiếu đúng mùa vụ.

---

# 8.4 FarmingLog

Đại diện một hoạt động canh tác.

### Attributes

- farmingLogId
- cropSeasonId
- plotId
- activityType
- activityDate
- description
- performedBy
- materialUsage
- attachmentReference

### Invariants

- Phải thuộc mùa vụ/thửa hợp lệ.
- ActivityDate phải phù hợp với lifecycle của mùa vụ nếu rule yêu cầu.
- Nếu sử dụng vật tư, phải có liên kết InputUsage.

---

# 8.5 MaterialUsage

Đại diện việc sử dụng vật tư trong canh tác.

### Attributes

- usageId
- farmingLogId
- materialId
- quantity
- unit
- batchReference

### Invariants

- Số lượng > 0.
- Vật tư phải tồn tại.
- Nếu quản lý theo lô, batch phải được xác định.
- Giao dịch xuất kho và nhật ký phải có consistency theo quy tắc hệ thống.

---

# 8.6 PHI

PHI là Value Object/Business Calculation liên quan thời gian cách ly.

### Inputs

- Material/Product
- activeIngredient nếu có
- applicationDate
- configuredPHI

### Output

- safetyDate
- status

### Rule

Không được tự suy đoán PHI khi nguồn dữ liệu không xác định.

---

# 8.7 Harvest

Đại diện sự kiện thu hoạch.

### Attributes

- harvestId
- cropSeasonId
- plotId
- harvestDate
- quantity
- unit
- qualityInformation
- lotId

### Invariants

- Không thu hoạch khi điều kiện PHI bắt buộc chưa đạt.
- Quantity > 0.
- Lot phải truy ngược được về nguồn sản xuất.

---

# 8.8 Lot

Đại diện lô sản phẩm/nguyên liệu có khả năng truy xuất.

### Relationship

```text
Member
  ↑
FarmPlot
  ↑
CropSeason
  ↑
Harvest
  ↓
Lot
  ↓
Product / OCOP Application
```

### Invariant

Lot ID phải duy nhất trong phạm vi hệ thống hoặc namespace được quy định.

---

# 9. Product Domain

## 9.1 Product

### Attributes

- productId
- cooperativeId
- productCode
- productName
- category
- specification
- brand
- qualityInformation
- status

### Relationships

```text
Cooperative 1 ─── N Product
Product      1 ─── N OCOPApplication
Product      N ─── N Lot
```

### Invariants

- productCode duy nhất trong HTX.
- Sản phẩm dùng làm hồ sơ OCOP phải tồn tại và ở trạng thái phù hợp.

---

# 10. Inventory & Logistics Domain

## 10.1 Material

Đại diện vật tư.

### Attributes

- materialId
- cooperativeId
- sku/code
- name
- category
- unit
- safetyInformation
- reorderThreshold
- status

---

## 10.2 StockReceipt

Đại diện nhập kho.

### Relationship

```text
StockReceipt
  └── N StockReceiptLine
              └── Material
```

### Invariants

- Quantity > 0.
- Tổng giá trị phải nhất quán với dòng giao dịch.
- Phiếu đã chốt không sửa tùy ý.

---

## 10.3 StockIssue

Đại diện xuất kho.

### Relationships

- Material
- Member
- FarmingLog hoặc mục đích sử dụng
- Payment / ReceivablePayable nếu có

### Invariants

- Không xuất vượt tồn khả dụng.
- Người nhận phải hợp lệ.
- Nếu tạo công nợ, phải có liên kết công nợ.

---

## 10.4 StockCount

Đại diện kiểm kê.

### Attributes

- stockCountId
- countDate
- scope
- expectedQuantity
- actualQuantity
- difference
- reason
- approvalStatus

Điều chỉnh tồn kho phải đi qua workflow được phép.

---

# 11. Finance Domain

## 11.1 CashTransaction

Đại diện thu/chi.

### Attributes

- transactionId
- cooperativeId
- transactionType
- amount
- transactionDate
- category
- counterparty
- reference
- evidence
- status

### Invariants

- amount > 0.
- Loại giao dịch quyết định thu hay chi.
- Giao dịch đã chốt phải immutable ở mức nghiệp vụ, chỉnh sửa bằng reversal/adjustment nếu cần.

---

# 11.2 ReceivablePayable

Đại diện công nợ.

### Attributes

- debtId
- cooperativeId
- memberId / counterparty
- sourceTransaction
- originalAmount
- outstandingAmount
- dueDate
- status

### Lifecycle

```text
OPEN → PARTIALLY_SETTLED → SETTLED
  ↘
   OVERDUE
```

---

# 11.3 OffsetSettlement

Đại diện cấn trừ công nợ.

### Relationships

```text
ReceivablePayable
        ↓
OffsetSettlement
        ↓
CashTransaction / Distribution
```

Không tự suy luận quy tắc xử lý phần nợ còn lại khi chưa được xác minh.

---

# 11.4 SurplusDistributionPlan

Đại diện phương án phân phối thặng dư.

### Attributes

- planId
- fiscalPeriod
- sourceResult
- ruleVersion/reference
- totalAmount
- allocationItems
- approvalStatus

### Invariants

- Tổng phân bổ không vượt nguồn phân phối.
- Công thức phải dựa trên Business Rule/version được cấu hình.
- Không hard-code tỷ lệ chưa xác minh.

---

# 12. OCOP Criteria Domain

## 12.1 CriteriaVersion

Đây là Aggregate Root của bộ tiêu chí.

### Attributes

- criteriaVersionId
- name
- versionCode
- effectiveFrom
- effectiveTo
- sourceReference
- status

### Lifecycle

```text
DRAFT → PUBLISHED → RETIRED
```

### Invariants

- Version đã dùng cho hồ sơ lịch sử không được sửa đè.
- Mỗi Application phải tham chiếu một CriteriaVersion cụ thể.

---

# 12.2 CriteriaGroup

Nhóm tiêu chí.

### Relationship

```text
CriteriaVersion 1 ─── N CriteriaGroup
```

---

# 12.3 Criterion

Tiêu chí.

### Attributes

- criterionId
- criteriaGroupId
- code
- name
- description
- maxScore
- mandatory
- order

---

# 12.4 Indicator

Chỉ tiêu/điểm thành phần.

### Attributes

- indicatorId
- criterionId
- code
- name
- description
- maxScore
- mandatory
- evidenceRequirement
- scoringRuleReference

### Invariants

- Điểm không vượt maxScore.
- Không nhập tổng điểm trực tiếp nếu tổng có thể tính từ Indicator.

---

# 13. OCOP Application Domain

## 13.1 OCOPApplication

Đây là Aggregate Root trung tâm của quy trình OCOP.

### Attributes

- applicationId
- cooperativeId
- productId
- criteriaVersionId
- applicationType
- applicationNumber
- status
- createdAt
- submittedAt
- completedAt

### Lifecycle

```text
DRAFT
  ↓
IN_PROGRESS
  ↓
SUBMITTED
  ↓
UNDER_REVIEW
  ├── NEED_REVISION
  │       ↓
  │   IN_PROGRESS
  │
  └── READY_FOR_EVALUATION
          ↓
      EVALUATING
          ↓
      CONSOLIDATING
          ↓
      PROPOSED
          ↓
      DECIDED
```

Có thể có trạng thái CANCELLED/REJECTED tùy workflow được xác nhận.

### Invariants

- Application phải thuộc một Cooperative.
- Product phải tồn tại.
- CriteriaVersion phải xác định.
- Không cho submit khi thiếu thành phần bắt buộc.
- Sau khi submit, quyền sửa phải bị hạn chế.
- Lịch sử version phải được bảo toàn.

---

# 14. Self Assessment Domain

## 14.1 SelfAssessment

Đại diện tự đánh giá của chủ thể.

### Attributes

- selfAssessmentId
- applicationId
- indicatorId
- score
- explanation
- status

### Invariants

- score >= 0.
- score <= maxScore.
- Indicator thuộc CriteriaVersion của Application.
- Evidence liên quan phải được liên kết nếu indicator yêu cầu.

---

# 15. Evidence Domain

## 15.1 Evidence

Aggregate Root.

### Attributes

- evidenceId
- applicationId
- title
- evidenceType
- sourceType
- status
- currentVersionId
- verifiedBy
- verifiedAt

### Lifecycle

```text
UPLOADED
   ↓
PENDING_VERIFY
   ├── VERIFIED
   └── REJECTED
          ↓
       REPLACED
```

---

## 15.2 EvidenceVersion

Đại diện từng phiên bản vật lý/nội dung của minh chứng.

### Attributes

- evidenceVersionId
- evidenceId
- versionNumber
- fileReference
- fileName
- checksum
- mimeType
- fileSize
- uploadedBy
- uploadedAt
- replacementReason

### Invariants

- Version number tăng tuần tự.
- Bản cũ không bị xóa khi tạo bản mới.
- Checksum giúp phát hiện thay đổi tệp.
- Quyền truy cập phải được kiểm tra ở backend.
- Tệp bắt buộc không được silently bỏ qua khi kết xuất.

---

## 15.3 EvidenceLink

Quan hệ nhiều-nhiều:

```text
Evidence N ─── N Indicator
```

EvidenceLink có thể chứa:

- relevance
- note
- createdBy
- createdAt

---

# 16. Review Domain

## 16.1 ApplicationReview

Đại diện kiểm tra hồ sơ.

### Attributes

- reviewId
- applicationId
- reviewerId
- reviewStatus
- comments
- requestedRevision
- reviewedAt

### Invariants

Reviewer chỉ thao tác trong scope được phân công.

---

# 17. Evaluation Domain

## 17.1 EvaluationSession

Aggregate Root của một phiên chấm.

### Attributes

- evaluationSessionId
- applicationId
- assignedGroup/assignment
- status
- startedAt
- completedAt

### Lifecycle

```text
ASSIGNED → IN_PROGRESS → COMPLETED → CONSOLIDATED
```

---

## 17.2 EvaluatorAssignment

Liên kết evaluator với session.

### Attributes

- assignmentId
- evaluationSessionId
- evaluatorId
- role
- status

### Invariant

Evaluator chỉ xem/sửa phần được phép và không được phá vỡ yêu cầu độc lập đánh giá.

---

## 17.3 EvaluatorScore

Đại diện điểm của một evaluator cho một indicator.

### Attributes

- scoreId
- assignmentId
- indicatorId
- score
- comment
- submittedAt
- lockedAt

### Invariants

- score >= 0.
- score <= indicator.maxScore.
- Không sửa sau khi locked trừ workflow được phép.
- Không tính consolidated score bằng cách ghi đè evaluator score.

---

# 18. Consolidated Result

## 18.1 ConsolidatedResult

Đại diện kết quả tổng hợp.

### Attributes

- resultId
- applicationId
- evaluationSessionId
- totalScore
- ruleVersion
- consolidationStatus
- calculatedAt

### Invariants

```text
totalScore =
Σ valid indicator scores
```

theo scoring rule của CriteriaVersion.

Không nhập tay tổng điểm.

---

# 19. Proposed Classification

## 19.1 ProposedClassification

Đại diện phân hạng được hệ thống/actor đề xuất.

### Attributes

- proposalId
- applicationId
- resultId
- proposedLevel
- ruleVersion
- reason
- status

### Invariant

Phân hạng đề xuất phải được tính từ kết quả và điều kiện của CriteriaVersion.

Không hard-code ngưỡng khi chưa xác minh.

---

# 20. Final Decision

## 20.1 FinalDecision

Đại diện kết quả chính thức do actor có thẩm quyền ghi nhận.

### Attributes

- decisionId
- applicationId
- authorityReference
- decisionNumber
- decisionDate
- finalClassification
- effectiveDate
- documentReference
- status

### Critical Invariant

```text
ProposedClassification ≠ FinalDecision
```

Hệ thống chỉ ghi nhận kết quả chính thức; không tự giả định quyền ban hành quyết định.

---

# 21. Workflow Domain

## 21.1 WorkflowInstance

Đại diện một phiên workflow của entity.

### Attributes

- workflowInstanceId
- entityType
- entityId
- currentState
- startedAt
- completedAt

## 21.2 WorkflowTransition

Đại diện chuyển trạng thái.

### Attributes

- transitionId
- fromState
- toState
- actor
- reason
- timestamp

### Invariants

- Chỉ transition hợp lệ mới được thực hiện.
- Actor phải có quyền.
- Transition quan trọng phải được audit.
- Không xóa lịch sử transition.

---

# 22. Identity & Authorization Domain

## 22.1 UserAccount

### Attributes

- userId
- username/email
- status
- authenticationReference
- lastLoginAt

Không lưu plaintext password trong domain model.

---

## 22.2 Role

### Examples

- HTX_OWNER
- HTX_STAFF
- ACCOUNTANT
- STOREKEEPER
- AGRICULTURE_OFFICER
- OCOP_PREPARER
- EVALUATOR
- COUNCIL_MEMBER
- COUNCIL_SECRETARY
- AUTHORITY
- CRITERIA_ADMIN
- SYSTEM_ADMIN
- AUDITOR
- REPORT_VIEWER

---

## 22.3 RoleAssignment

```text
User
  ↓
RoleAssignment
  ↓
Role
  ↓
Permission
```

RoleAssignment phải hỗ trợ scope.

---

## 22.4 DataScope

Ví dụ:

```text
User → HTX A
User → Assigned Application
User → Assigned Evaluation Session
```

### Invariant

Authorization phải được enforce ở backend; UI visibility không được coi là security boundary.

---

# 23. Audit Domain

## 23.1 AuditEvent

Aggregate/append-only record.

### Attributes

- auditEventId
- actorId
- action
- entityType
- entityId
- beforeReference
- afterReference
- timestamp
- ip/device metadata nếu policy cho phép

### Invariants

- Audit event không được sửa/xóa bởi người dùng thông thường.
- Các thay đổi quan trọng phải có event.
- Có thể truy ngược entity → event → actor → thời điểm.

---

# 24. Reporting and Document Domain

## 24.1 ReportRequest

Đại diện yêu cầu tạo báo cáo.

### Attributes

- reportType
- filters
- requestedBy
- requestedAt
- status

## 24.2 GeneratedDocument

### Attributes

- documentId
- documentType
- sourceEntity
- templateVersion
- generatedAt
- fileReference
- checksum

### Invariant

Document được tạo phải xác định được:

```text
Source Data Version
+
Template Version
+
Generation Time
```

để có khả năng tái lập/truy vết.

---

# 25. Cross-Aggregate Invariants

## 25.1 Tenant Isolation

```text
Entity.cooperativeId = CurrentUser.Scope.cooperativeId
```

trừ các chức năng Global có quyền đặc biệt.

---

## 25.2 OCOP Criteria Consistency

```text
Application.criteriaVersion
    =
Evaluation.criteriaVersion
    =
ScoringRule.criteriaVersion
```

Không được trộn phiên bản tiêu chí.

---

## 25.3 Evidence Consistency

```text
Evidence.applicationId
    =
EvidenceLink.applicationId
    =
Indicator.criteriaVersion thuộc Application.criteriaVersion
```

---

## 25.4 Evaluation Independence

Evaluator không được tự thay đổi kết quả của evaluator khác nếu workflow yêu cầu độc lập.

---

## 25.5 Immutable History

Các đối tượng đã trở thành căn cứ lịch sử:

- submitted application
- evaluator score đã khóa
- evidence version
- final decision
- audit event
- transaction đã chốt

không được sửa/xóa tùy tiện.

---

## 25.6 Derived Values

Các giá trị có thể tính được nên được xem là derived:

- tổng vốn;
- tổng tồn kho;
- công nợ còn lại;
- tổng điểm;
- tỷ lệ hoàn thiện hồ sơ;
- phân hạng đề xuất.

Nếu lưu vật lý vì hiệu năng, phải có cơ chế bảo đảm consistency.

---

# 26. Main Aggregate Interaction Flows

## 26.1 Agricultural Traceability

```text
Member
   ↓
FarmPlot
   ↓
CropSeason
   ↓
FarmingLog
   ↓
MaterialUsage
   ↓
Harvest
   ↓
Lot
   ↓
Product
```

---

## 26.2 OCOP Preparation

```text
Product
   ↓
OCOPApplication
   ↓
CriteriaVersion
   ↓
Indicator
   ↓
SelfAssessment
   ↓
Evidence
   ↓
EvidenceVersion
```

---

## 26.3 OCOP Evaluation

```text
OCOPApplication
      ↓
ApplicationReview
      ↓
EvaluationSession
      ↓
EvaluatorAssignment
      ↓
EvaluatorScore
      ↓
ConsolidatedResult
      ↓
ProposedClassification
      ↓
FinalDecision
```

---

## 26.4 Financial Flow

```text
StockIssue
    ↓
ReceivablePayable
    ↓
Settlement / Offset
    ↓
CashTransaction

CashTransaction
    ↓
SurplusDistributionPlan
    ↓
Member Allocation
```

---

# 27. State Model Summary

## Member

```text
PENDING → ACTIVE → PENDING_TERMINATION → TERMINATED
```

## CropSeason

```text
PLANNED → ACTIVE → HARVESTING → COMPLETED
                 ↘ CANCELLED
```

## OCOPApplication

```text
DRAFT
 ↓
IN_PROGRESS
 ↓
SUBMITTED
 ↓
UNDER_REVIEW
 ├── NEED_REVISION → IN_PROGRESS
 └── READY_FOR_EVALUATION
        ↓
     EVALUATING
        ↓
     CONSOLIDATING
        ↓
      PROPOSED
        ↓
      DECIDED
```

## Evidence

```text
UPLOADED → PENDING_VERIFY
              ├── VERIFIED
              └── REJECTED → REPLACED
```

## EvaluationSession

```text
ASSIGNED → IN_PROGRESS → COMPLETED → CONSOLIDATED
```

---

# 28. Use Case → Domain Mapping

| Use Case Group | Main Domain Objects |
|---|---|
| UC-COOP-* | Cooperative, Member, CapitalContribution, Meeting, Vote |
| UC-AGRI-* | ProductionUnit, FarmPlot, CropSeason, FarmingLog, MaterialUsage, Harvest, Lot |
| UC-PROD-* | Product |
| UC-LOG-* | Material, StockReceipt, StockIssue, StockCount |
| UC-FIN-* | CashTransaction, ReceivablePayable, OffsetSettlement, SurplusDistributionPlan |
| UC-OCOP-* | OCOPApplication, CriteriaVersion, Criterion, Indicator, SelfAssessment, Review, EvaluationSession, EvaluatorScore, ConsolidatedResult, ProposedClassification, FinalDecision |
| UC-EVID-* | Evidence, EvidenceVersion, EvidenceLink |
| UC-WKFL-* | WorkflowInstance, WorkflowTransition |
| UC-SEC-* | UserAccount, Role, Permission, RoleAssignment, DataScope |
| UC-AUD-* | AuditEvent |
| UC-RPT-* | ReportRequest, GeneratedDocument |

---

# 29. Domain Model Rules for Database Design

Khi chuyển sang `11_DATABASE_DESIGN.md`:

1. Mỗi Aggregate Root phải được xem xét như transaction boundary.
2. Không biến mọi Value Object thành bảng một cách máy móc.
3. Quan hệ N-N phải có associative entity khi cần metadata.
4. State machine phải được thể hiện rõ bằng status + transition/audit.
5. Các entity lịch sử phải có version hoặc immutable strategy.
6. Criteria Version phải immutable sau khi được sử dụng.
7. Evidence phải tách metadata nghiệp vụ và file object.
8. File không được lưu trực tiếp trong PostgreSQL nếu kiến trúc chọn object storage.
9. Database phải enforce các unique/FK/check constraint quan trọng.
10. Authorization scope không được chỉ dựa vào frontend.
11. Audit phải có chiến lược append-only.
12. Derived values phải có chiến lược consistency.

---

# 30. Open Questions Before Database Design

| ID | Question | Impact |
|---|---|---|
| DM-OQ-001 | Criteria Version chính thức gồm cấu trúc nhóm/chỉ tiêu nào? | Critical |
| DM-OQ-002 | Quan hệ xã viên–thửa đất có cần lịch sử quyền sử dụng không? | High |
| DM-OQ-003 | Một thửa có thể thuộc nhiều mùa vụ chồng lấn không? | High |
| DM-OQ-004 | Một Product có thể có nhiều Lot và nguồn nguyên liệu thế nào? | High |
| DM-OQ-005 | Phiếu kho có cần workflow maker-checker không? | High |
| DM-OQ-006 | Công thức phân phối thặng dư cụ thể là gì? | Critical |
| DM-OQ-007 | Cho vay nội bộ có thực sự nằm trong phạm vi MVP không? | Medium |
| DM-OQ-008 | Có cần chữ ký số không? | High |
| DM-OQ-009 | Final Decision lưu bản scan quyết định hay chỉ metadata? | High |
| DM-OQ-010 | Mẫu PDF/DOCX chính thức nào phải tái tạo? | Critical |
| DM-OQ-011 | Evidence nào bắt buộc theo từng Criteria Version? | Critical |
| DM-OQ-012 | Quyền evaluator/council/authority thực tế ra sao? | Critical |

---

# 31. Definition of Done

Domain Model được xem là đủ điều kiện chuyển sang Database Design khi:

- [ ] Tất cả P0 Use Case trong 09 có domain object tương ứng.
- [ ] Không có business object quan trọng chỉ xuất hiện trong UI.
- [ ] Aggregate Root được xác định.
- [ ] Lifecycle chính được mô hình hóa.
- [ ] Cross-domain relationship được xác định.
- [ ] Invariant quan trọng được ghi nhận.
- [ ] OCOP Criteria Version được mô hình hóa.
- [ ] Evidence versioning được mô hình hóa.
- [ ] Evaluation independence được mô hình hóa.
- [ ] Proposed Classification và Final Decision được tách biệt.
- [ ] Tenant/Data Scope được mô hình hóa.
- [ ] Audit được mô hình hóa.
- [ ] Open Questions Critical được xác minh hoặc đánh dấu rõ.
- [ ] Không hard-code quy định pháp lý chưa được xác minh.

---

# 32. Next Step

Sau khi Domain Model được review:

```text
10_DOMAIN_MODEL.md
        ↓
11_DATABASE_DESIGN.md
        ↓
12_API_SPECIFICATION.md
        ↓
13_SYSTEM_ARCHITECTURE.md
        ↓
Implementation
```

`11_DATABASE_DESIGN.md` phải được xây dựng từ:

```text
Domain Model
+
Business Rules
+
Functional Requirements
+
Use Cases
+
Security / Audit requirements
```

Không thiết kế database chỉ dựa trên danh sách màn hình UI.
