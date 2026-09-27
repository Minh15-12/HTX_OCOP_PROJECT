# Quy Trình Nghiệp Vụ: Phê Duyệt Đa Cấp, Audit Trail & Thông Báo

Tài liệu này mô tả chi tiết về hệ thống Workflow Engine, cơ chế phê duyệt đa cấp, theo dõi vết (Audit Trail) và hệ thống thông báo (Notification Engine) trong nền tảng Quản lý HTX Nông nghiệp & OCOP.

---

## 1. Mô hình Workflow Engine

Hệ thống quản lý trạng thái của các thực thể thông qua **Finite State Machine (FSM)**.

*   **FSM cho tất cả quy trình có approval:** Mỗi thực thể trải qua các trạng thái hữu hạn và các chuyển tiếp (transitions) được định nghĩa trước.
*   **RBAC + FSM:** Mỗi hành động chuyển tiếp trạng thái (transition) yêu cầu người dùng phải có đúng Vai trò (Role) và thực thể phải đang ở đúng Trạng thái (State).
*   **Separation of Duties (Phân tách trách nhiệm):** Đảm bảo tính minh bạch và kiểm soát rủi ro bằng nguyên tắc: Người tạo (Creator) ≠ Người phê duyệt (Approver).

---

## 2. Danh sách quy trình có Approval

Bảng dưới đây liệt kê các quy trình nghiệp vụ yêu cầu phê duyệt và luồng trạng thái chính:

| Module | Đối tượng | Workflow / Trạng thái chuyển tiếp |
| :--- | :--- | :--- |
| **Member** | Kết nạp xã viên | `CHO_DUYET` &rarr; `DANG_HOAT_DONG` |
| **Member** | Chấm dứt tư cách | `CHO_QUYET_TOAN` &rarr; `DA_CHAM_DUT` |
| **Capital** | Góp vốn/biến động | `PENDING` &rarr; `APPROVED` |
| **Inventory** | Nhập kho | `DRAFT` &rarr; `ACCEPTED` |
| **Inventory** | Xuất kho nợ | `PENDING` &rarr; `ISSUED` |
| **Inventory** | Kiểm kê điều chỉnh | `PENDING` &rarr; `APPROVED` |
| **Finance** | Quyết toán mùa vụ | `DRAFT` &rarr; `APPROVED` &rarr; `PAID` |
| **Finance** | Phân phối thặng dư | `PROPOSED` &rarr; `APPROVED` &rarr; `PAID` |
| **OCOP** | Hồ sơ OCOP | `DRAFT` &rarr; `SUBMITTED` &rarr; `IN_REVIEW` &rarr; `CERTIFIED` |

---

## 3. Kiến trúc FSM Tổng quát

Kiến trúc xử lý một hành động chuyển đổi trạng thái (Workflow Action) theo trình tự sau:

```mermaid
flowchart TD
    A[API Request: POST /resource/{id}/action] --> B[Load current state]
    B --> C[Kiểm tra Permission - RBAC]
    C --> D[Kiểm tra Tenant Scope - cooperative_id]
    D --> E[Kiểm tra Business Rules - pre-conditions]
    E --> F((Database Transaction BEGIN))
    F --> G[Update state &rarr; new_state]
    G --> H[Ghi Audit Log - BEFORE/AFTER]
    H --> I[Dispatch Event/Job - Notification, Async Task]
    I --> J((Transaction COMMIT))
    J --> K[Return Response]
```

---

## 4. Audit Trail với Hash Chaining SHA-256

Hệ thống lưu vết kiểm toán (Audit Trail) cho mọi thao tác quan trọng để đảm bảo tính toàn vẹn dữ liệu:

*   **Thông tin lưu trữ:** Mỗi audit entry ghi lại ai (who), làm gì (what), khi nào (when), thuộc HTX nào (tenant), đối tượng nào (resource_id), trạng thái trước/sau (before/after state) và thông tin phụ (metadata).
*   **Chống gian lận (Tamper-evident):** Sử dụng hàm băm SHA-256 để tạo chuỗi liên kết (Hash Chaining).
    *   `prev_hash` = SHA-256(previous audit entry)
    *   `current_hash` = SHA-256(entry_data + prev_hash)
*   **Bảo vệ Dữ liệu:** Thiết kế này giúp dễ dàng phát hiện bất kỳ can thiệp nào vào lịch sử log ở mức database. Hoàn toàn **không cho phép** các thao tác `DELETE` hoặc `UPDATE` trên bảng `audit_logs` thông qua API thông thường.

### 4.1 Cấu trúc Audit Entry (JSON)

```json
{
  "id": "e9b1c034-7a9f-4315-9c88-abc123def456",
  "event_type": "MEMBER_STATUS_CHANGED",
  "actor_id": "usr_998877",
  "actor_role": "DIRECTOR",
  "cooperative_id": "htx_001",
  "resource_type": "member",
  "resource_id": "mem_102938",
  "before_state": {
    "status": "CHO_DUYET"
  },
  "after_state": {
    "status": "DANG_HOAT_DONG"
  },
  "metadata": {
    "reason": "Đủ điều kiện pháp lý và đã nộp đủ vốn góp",
    "approved_at": "2026-09-25T15:30:00Z"
  },
  "timestamp": "2026-09-25T15:30:00Z",
  "prev_hash": "a8f5f167f44f4964e6c998dee827110c...",
  "current_hash": "b9c3e214d45e5783a7f889cdd938221b..."
}
```

---

## 5. Notification Engine & Kịch bản

Hệ thống cung cấp cơ chế thông báo tự động thông qua Event-driven architecture.

### Kịch bản Thông báo (5 Kịch bản chính):
*   **KN-01:** Nhắc nhở vốn góp quá hạn (Thành viên chưa đóng đủ vốn góp sau 6 tháng).
*   **KN-02:** Cảnh báo PHI vi phạm (Thời gian thu hoạch dự kiến `harvest_date` nhỏ hơn thời gian cách ly an toàn `safe_harvest_date`).
*   **KN-03:** Cảnh báo hoạt chất cấm trong nhật ký (Phát hiện từ khóa vật tư, thuốc BVTV không được phép).
*   **KN-04:** Nhắc tái đánh giá OCOP (Sản phẩm OCOP còn 3 tháng là hết hiệu lực chứng nhận).
*   **KN-05:** Cảnh báo tồn kho thấp (Số lượng vật tư/sản phẩm `< Safety Stock`).

### Cấu hình Notification
*   **Kênh gửi:** In-app notification (chính) + Email (tùy chọn/cấu hình thêm).
*   **Người nhận:** Được cấu hình linh hoạt dựa trên loại sự kiện và vai trò (Role).
*   **Tính Async:** Việc gửi notification được thực hiện qua Message Queue, đảm bảo không block luồng xử lý transaction chính.

---

## 6. Separation of Duties Rules

Nguyên tắc phân tách trách nhiệm để tránh rủi ro lạm quyền và gian lận:

| Workflow | Người tạo (Creator) | Người phê duyệt (Approver) |
| :--- | :--- | :--- |
| Nhập kho (Inventory Receipt) | `WAREHOUSE` | `ACCOUNTANT` hoặc `DIRECTOR` |
| Quyết toán mùa vụ | `ACCOUNTANT` | `DIRECTOR` |
| Kết nạp thành viên | `STAFF` | `DIRECTOR` |
| Điều chỉnh tồn kho | `WAREHOUSE` | `DIRECTOR` |
| Nộp hồ sơ OCOP (Submit) | `STAFF` | `DIRECTOR` |

> **Lưu ý:** Hệ thống phải kiểm tra `actor_id` của action hiện tại khác với `creator_id` của đối tượng (nếu họ có cùng Role hợp lệ).

---

## 7. Yêu cầu Hệ thống Nâng cao

### 7.1 Idempotency
*   Các action quan trọng thay đổi trạng thái như (approve, reject, submit, pay) **phải là idempotent**.
*   Client sử dụng Header `Idempotency-Key` (hoặc `X-Idempotency-Key`) để ngăn chặn double-processing khi mạng chập chờn dẫn đến retry request.
*   Nếu API nhận được một request với `Idempotency-Key` đã được xử lý thành công, nó sẽ bỏ qua thao tác logic và trả về HTTP Response giống như lần gọi thành công trước đó.

### 7.2 Workflow Locking
*   Khi một tài nguyên đang ở trạng thái xem xét (`IN_REVIEW`, `PENDING_APPROVAL`), các trường dữ liệu quan trọng của nó sẽ bị **lock** (không thể chỉnh sửa).
*   Tài nguyên chỉ được phép chỉnh sửa lại nếu nó bị trả về (trạng thái `REVISION_REQUIRED`, `REJECTED`) hoặc đang ở nháp (`DRAFT`).
*   Tùy thuộc nghiệp vụ, áp dụng Pessimistic Lock (khóa ở DB) hoặc Optimistic Lock (thông qua `version` field) để kiểm soát xung đột dữ liệu.

---

## 8. API Design cho Workflow Actions

Thiết kế REST API cho các chuyển đổi trạng thái phải thể hiện rõ hành động, không sử dụng `PATCH / PUT` trực tiếp vào trường `status`.

**ĐÚNG (Sử dụng Sub-resource action endpoints):**
```http
POST /api/v1/members/{id}/approve
POST /api/v1/members/{id}/suspend
POST /api/v1/members/{id}/terminate
POST /api/v1/inventory/receipts/{id}/accept
POST /api/v1/inventory/receipts/{id}/reject
POST /api/v1/ocop/applications/{id}/submit
POST /api/v1/ocop/applications/{id}/return
```

**SAI (Tuyệt đối không được dùng cho Workflow state):**
```http
PATCH /api/v1/members/{id} 
Content-Type: application/json
{
  "status": "ACTIVE"
}
```

---

## 9. Error Handling

Chuẩn hóa các mã lỗi khi thực hiện Workflow Action:

| Error Code | Mô tả | HTTP Status |
| :--- | :--- | :--- |
| `ERR_INVALID_STATE_TRANSITION` | Thực thể không thể chuyển sang trạng thái mới từ trạng thái hiện tại (VD: từ DRAFT lên thẳng APPROVED). | 400 Bad Request |
| `ERR_INSUFFICIENT_PERMISSION` | User không có Role phù hợp hoặc vi phạm Separation of Duties để thực hiện action này. | 403 Forbidden |
| `ERR_WRONG_TENANT` | Cố gắng thao tác trên resource không thuộc Cooperative của User. | 404 Not Found (Bảo mật) / 403 |
| `ERR_BUSINESS_RULE_VIOLATION` | Không thỏa mãn các điều kiện tiên quyết (VD: chưa đóng đủ vốn tối thiểu). | 422 Unprocessable Entity |
| `ERR_CONCURRENT_MODIFICATION` | Xung đột dữ liệu khi có nhiều request xử lý cùng lúc (Optimistic Lock thất bại). | 409 Conflict |

---

## 10. Danh sách Audit Events Đầy Đủ (Tham khảo)

Các sự kiện cần được ghi vào Audit Log:
*   **Member:** `MEMBER_CREATED`, `MEMBER_APPROVED`, `MEMBER_SUSPENDED`, `MEMBER_TERMINATED`
*   **Capital:** `CAPITAL_CONTRIBUTION_REQUESTED`, `CAPITAL_CONTRIBUTION_APPROVED`
*   **Inventory:** `RECEIPT_DRAFTED`, `RECEIPT_ACCEPTED`, `ISSUE_REQUESTED`, `ISSUE_APPROVED`, `ADJUSTMENT_SUBMITTED`, `ADJUSTMENT_APPROVED`
*   **Finance:** `SETTLEMENT_DRAFTED`, `SETTLEMENT_APPROVED`, `SETTLEMENT_PAID`
*   **OCOP:** `OCOP_DOC_CREATED`, `OCOP_DOC_SUBMITTED`, `OCOP_DOC_RETURNED`, `OCOP_DOC_CERTIFIED`

---

## 11. Business Rules (Pre-conditions)

| Rule ID | Mô tả Rule | Phân hệ áp dụng |
| :--- | :--- | :--- |
| `BR-MEM-01` | Thành viên phải nộp đủ vốn góp tối thiểu mới được Approve. | Member |
| `BR-MEM-02` | Chỉ được Quyết toán khi thành viên không còn nợ vật tư hoặc tiền. | Member / Finance |
| `BR-INV-01` | Không được xuất kho nếu số lượng tồn < số lượng yêu cầu. | Inventory |
| `BR-INV-02` | Người lập phiếu nhập không được tự phê duyệt phiếu đó. | Inventory |
| `BR-FIN-01` | Tổng phân phối thặng dư không vượt quá lợi nhuận sau thuế. | Finance |

---

## 12. Phụ lục: Ví dụ Code (Pseudocode) FSM Transition Handler

Đoạn mã giả thể hiện cách xử lý một API endpoint cho quá trình phê duyệt:

```typescript
// POST /api/v1/members/{id}/approve
async function approveMember(memberId: string, actorId: string, tenantId: string, payload: ApprovePayload) {
  
  // 1. Khởi tạo Transaction
  const trx = await database.transaction();
  
  try {
    // 2. Load resource & Lock (Pessimistic)
    const member = await memberRepo.findByIdForUpdate(memberId, tenantId, trx);
    if (!member) throw new Error("ERR_NOT_FOUND");
    
    // 3. Kiểm tra Tenant
    if (member.cooperative_id !== tenantId) throw new Error("ERR_WRONG_TENANT");
    
    // 4. Kiểm tra State Transition (FSM)
    if (member.status !== "CHO_DUYET") {
      throw new Error("ERR_INVALID_STATE_TRANSITION");
    }
    
    // 5. Kiểm tra Permission & Separation of Duties
    const actor = await userRepo.findById(actorId);
    if (!hasRole(actor, "DIRECTOR")) throw new Error("ERR_INSUFFICIENT_PERMISSION");
    if (member.created_by === actorId) throw new Error("ERR_INSUFFICIENT_PERMISSION"); // Creator != Approver
    
    // 6. Kiểm tra Business Rules (BR-MEM-01)
    const capital = await capitalRepo.getTotalContribution(memberId);
    if (capital < MIN_REQUIRED_CAPITAL) {
      throw new Error("ERR_BUSINESS_RULE_VIOLATION");
    }
    
    // 7. Update State
    const beforeState = { status: member.status };
    member.status = "DANG_HOAT_DONG";
    member.approved_at = new Date();
    member.approved_by = actorId;
    await memberRepo.update(member, trx);
    
    // 8. Ghi Audit Log (Hash Chaining)
    await auditService.logEvent({
      event_type: "MEMBER_APPROVED",
      actor_id: actorId,
      actor_role: actor.role,
      cooperative_id: tenantId,
      resource_type: "member",
      resource_id: memberId,
      before_state: beforeState,
      after_state: { status: member.status },
      metadata: { reason: payload.reason }
    }, trx);
    
    // 9. Dispatch Event
    eventBus.publish("MemberApprovedEvent", { memberId, tenantId });
    
    // 10. Commit
    await trx.commit();
    return { success: true, member };
    
  } catch (error) {
    await trx.rollback();
    throw error;
  }
}
```
