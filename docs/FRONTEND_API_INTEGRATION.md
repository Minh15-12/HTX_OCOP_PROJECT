# HỢP ĐỒNG TÍCH HỢP API FRONTEND — DỰ ÁN HTX-OCOP
> **Tài liệu đặc tả hợp đồng API thực tế phục vụ tích hợp giao diện người dùng**  
> **Cập nhật:** 29/10/2026 | **Phiên bản:** 2.0.0 (Post-Backend Fixes)  
> **Backend Base URL:** `http://localhost:8000/api/v1`  
> **Xác thực:** Bearer Token (Laravel Sanctum)  
> **Định dạng trao đổi:** `application/json` (trừ tệp tin đính kèm và xuất OpenXML `.xlsx`)

---

## I. QUY CHUẨN KỸ THUẬT CHUNG

### 1. Chuẩn hóa Cấu trúc Phản hồi (Envelope Structure)

Mọi endpoint API trả về JSON đều tuân thủ chặt chẽ định dạng chuẩn của `ApiResponse`:

#### Phản hồi thành công (HTTP 200, 201):
```json
{
  "success": true,
  "data": { ... } | [ ... ],
  "message": "Thông báo thân thiện với người dùng",
  "meta": {
    "page": 1,
    "per_page": 15,
    "total": 45,
    "last_page": 3,
    "unread_count": 2
  }
}
```

#### Phản hồi thất bại (HTTP 400, 401, 403, 404, 409, 422, 500):
```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_FAILED | UNAUTHENTICATED | FORBIDDEN | DUPLICATE_VOTE | ...",
    "message": "Mô tả nguyên nhân lỗi cụ thể bằng tiếng Việt",
    "details": {
      "field_name": [
        "Lỗi cụ thể của trường dữ liệu"
      ]
    }
  }
}
```

### 2. Định dạng dữ liệu thống nhất
- **Mã định danh (ID):** UUID v4 (`string`, 36 ký tự, ví dụ: `d290f1ee-6c54-4b01-90e6-d701748f0851`).
- **Thời gian (Timestamp):** ISO-8601 UTC (`YYYY-MM-DDTHH:mm:ss.sssZ`).
- **Ngày tháng (Date):** Chuỗi `YYYY-MM-DD` (ví dụ: `2026-10-29`).
- **Tiền tệ (Currency):** `number` (float/decimal, ví dụ: `15000000.00`), hiển thị định dạng `VND` trên giao diện (`Intl.NumberFormat('vi-VN')`).
- **Diện tích đất (Area):** `number` (ha hoặc $m^2$, float, ví dụ: `2.50`).

### 3. Header xác thực & Tenant Context
- `Authorization: Bearer <sanctum_token>`
- `Accept: application/json`
- `Content-Type: application/json` (hoặc `multipart/form-data` khi tải tệp)

---

## II. DANH MỤC API THEO PHÂN HỆ NGHIỆP VỤ

### 1. PHÂN HỆ XÁC THỰC & HỆ THỐNG (AUTHENTICATION & IDENTITY)

#### `POST /auth/login`
- **Mục đích:** Đăng nhập hệ thống, cấp mã định danh phiên và Bearer Token.
- **Yêu cầu quyền:** Công khai (Public).
- **Body:** `{ "username": "htx_owner" | "admin", "password": "string" }`
- **Response Data:**
  ```json
  {
    "token": "1|sanctum_token_hash...",
    "user": {
      "id": "uuid",
      "username": "htx_owner",
      "full_name": "Nguyễn Văn Chủ Nhiệm",
      "cooperative_id": "uuid",
      "roles": ["HTX_OWNER"],
      "permissions": ["MEMBER.*", "AGRICULTURE.*", "FINANCE.*"]
    }
  }
  ```

#### `POST /auth/change-password`
- **Mục đích:** Người dùng tự đổi mật khẩu cá nhân.
- **Yêu cầu quyền:** Đã đăng nhập (`auth:sanctum`).
- **Body:**
  ```json
  {
    "current_password": "old_password_123",
    "new_password": "NewSecretPass@2026",
    "new_password_confirmation": "NewSecretPass@2026"
  }
  ```
- **Mã lỗi đặc thù:** `INVALID_CURRENT_PASSWORD` (HTTP 422).

#### `GET /auth/me`
- **Mục đích:** Lấy thông tin tài khoản hiện tại kèm danh sách vai trò và quyền.

#### `POST /auth/logout`
- **Mục đích:** Đăng xuất và thu hồi Access Token hiện tại.

---

### 2. PHÂN HỆ XÃ VIÊN & VỐN GÓP (MEMBER & CAPITAL)

#### `GET /members`
- **Mục đích:** Danh sách xã viên toàn HTX có phân trang và bộ lọc.
- **Quyền:** `MEMBER.READ`.
- **Query params:** `page`, `per_page`, `search`, `status` (`ACTIVE`, `PENDING`, `TERMINATED`), `member_type` (`OFFICIAL`, `ASSOCIATED`).
- **Response Data:** Mảng `MemberResource` kèm `meta.total`.

#### `POST /members`
- **Mục đích:** Đăng ký thêm mới xã viên.
- **Quyền:** `MEMBER.CREATE`.
- **Body:**
  ```json
  {
    "member_code": "MB-2026-009",
    "member_type": "OFFICIAL",
    "admission_date": "2026-10-29",
    "identity_information": {
      "full_name": "Trần Văn Nam",
      "citizen_id": "079201008899",
      "phone": "0918889999",
      "address": "Ấp 4, Xã Tân Tiến, Đầm Dơi, Cà Mau"
    },
    "committed_capital": 20000000,
    "credit_limit": 50000000
  }
  ```

#### `GET /members/{id}`
- **Mục đích:** Xem chi tiết hồ sơ xã viên, các khoản vốn góp, thửa đất và lịch sử kiểm toán.

#### `PATCH /members/{id}`
- **Mục đích:** Cập nhật thông tin xã viên, hỗ trợ đầy đủ các trường mở rộng.
- **Body hỗ trợ:**
  - `identity_information`: `{ full_name, phone, address, ... }`
  - `emergency_contact`: `{ name, relationship, phone }`
  - `bank_account_info`: `{ bank_name, account_number, account_holder }`
  - `health_status`: `"GOOD" | "NORMAL" | "CHRONIC"`
  - `family_situation`: `"string"`
  - `beneficiary_info`: `{ name, citizen_id, relationship }`

#### `POST /members/{id}/approve`
- **Mục đích:** Phê duyệt đơn xin gia nhập HTX, chuyển trạng thái `PENDING -> ACTIVE`.
- **Quyền:** `MEMBER.UPDATE` (Chủ tịch / Giám đốc HTX).

#### `POST /members/{id}/transition-status`
- **Mục đích:** Chuyển trạng thái hoạt động xã viên (`ACTIVE`, `SUSPENDED`, `TERMINATED`).

#### `GET /members/{member_id}/plots`
- **Mục đích:** Lấy danh sách toàn bộ thửa đất do xã viên sở hữu hoặc được phân công canh tác.

#### `GET /members/{member_id}/land-contributions`
- **Mục đích:** Lấy danh sách các thửa đất góp vốn của xã viên.

#### `POST /members/{member_id}/land-contributions`
- **Mục đích:** Ghi nhận góp vốn bằng quyền sử dụng đất.
- **Body:**
  ```json
  {
    "land_certificate_no": "CN-QSD-2026-0889",
    "plot_number": "102",
    "map_sheet_number": "15",
    "land_area_sqm": 5000,
    "land_use_type": "Đất trồng trọt lâu năm",
    "appraised_unit_price": 50000,
    "cadastral_status": "NOTARIZED"
  }
  ```

#### `GET /audit-logs/trace/member/{id}`
- **Mục đích:** Lấy toàn bộ timeline sự kiện kiểm toán vòng đời của xã viên.

---

### 3. PHÂN HỆ ĐẠI HỘI & BIỂU QUYẾT (MEETINGS & RESOLUTIONS)

#### `GET /meetings`
- **Mục đích:** Danh sách các cuộc họp / Đại hội thành viên.
- **Quyền:** `MEMBER.READ`.
- **Query params:** `page`, `limit`, `status`, `meeting_type`.

#### `POST /meetings`
- **Mục đích:** Thiết lập cuộc họp/đại hội mới.
- **Quyền:** `MEMBER.CREATE`.
- **Body:**
  ```json
  {
    "meeting_type": "ANNUAL",
    "meeting_date": "2026-12-15",
    "title": "Đại hội thường niên HTX năm 2026",
    "description": "Thông qua phương án chia lãi và bầu cử BKS",
    "status": "PLANNED"
  }
  ```

#### `POST /meetings/{id}/votes`
- **Mục đích:** Ghi nhận phiếu biểu quyết của thành viên.
- **Body:**
  ```json
  {
    "resolution_code": "NQ-2026-01",
    "choice": "FOR" | "AGAINST" | "ABSTAIN",
    "weight": 1.0
  }
  ```
- **Ràng buộc:** Chống biểu quyết 2 lần trên cùng một nghị quyết (`DUPLICATE_VOTE`, HTTP 409).

#### `GET /meetings/{id}/resolutions-summary`
- **Mục đích:** Tổng hợp tỷ lệ biểu quyết tán thành, kiểm tra đạt điều kiện thông qua nghị quyết.

---

### 4. PHÂN HỆ NÔNG NGHIỆP & CANH TÁC (AGRICULTURE)

#### `GET /farm-plots`
- **Mục đích:** Lấy danh sách phẳng tất cả các thửa đất thuộc HTX (phục vụ chọn thửa, bộ lọc, bản đồ).
- **Quyền:** `AGRICULTURE.READ`.
- **Query params:** `page`, `per_page`, `status`, `crop`, `production_unit_id`.

#### `GET /production-units` & `POST /production-units`
- **Mục đích:** Quản lý vùng sản xuất (PUC - Production Unit Code).

#### `GET /crop-seasons` & `POST /crop-seasons`
- **Mục đích:** Quản lý mùa vụ canh tác (mở vụ, theo dõi tiến độ, đóng vụ).

#### `GET /farming-logs` & `POST /farming-logs`
- **Mục đích:** Ghi chép nhật ký canh tác (bón phân, phun thuốc, tưới tiêu, làm đất).

#### `DELETE /farming-logs/{id}`
- **Mục đích:** Xóa nhật ký canh tác ghi nhầm.
- **Ràng buộc:** Chặn xóa khi mùa vụ đã đóng (`SEASON_CLOSED`, HTTP 400) hoặc đã có thu hoạch liên kết (`ERR_LOG_HAS_HARVEST_LINK`, HTTP 422).

#### `GET /farming-logs/phi-warnings`
- **Mục đích:** Cảnh báo thời gian cách ly thuốc bảo vệ thực vật (PHI Guard).

#### `GET /harvests` & `POST /harvests`
- **Mục đích:** Ghi nhận sản lượng thu hoạch thực tế từ các thửa đất.

#### `GET /product-lots` & `POST /product-lots`
- **Mục đích:** Đóng gói lô sản phẩm, phát sinh mã truy xuất nguồn gốc GS1 Lot ID.

---

### 5. PHÂN HỆ KHO VẬT TƯ (INVENTORY)

#### `GET /warehouses` & `POST /warehouses`
- **Mục đích:** Quản lý hệ thống kho đa điểm (kho vật tư, kho nông sản, kho lạnh).
- **Quyền:** `INVENTORY.READ` / `INVENTORY.CREATE`.
- **Body POST:**
  ```json
  {
    "warehouse_code": "WH-VT-01",
    "name": "Kho Tổng Vật Tư Nông Nghiệp",
    "location": "Khu A - Tân Tiến",
    "status": "ACTIVE"
  }
  ```

#### `GET /warehouses/{id}` & `PATCH /warehouses/{id}` & `DELETE /warehouses/{id}`
- **Ràng buộc:** Không cho phép xóa kho đang có phiếu nhập/xuất kho tồn tại (`ERR_WAREHOUSE_HAS_TRANSACTIONS`, HTTP 422).

#### `GET /materials` & `POST /materials`
- **Mục đích:** Danh mục vật tư nông nghiệp (phân bón, thuốc BVTV, hạt giống).

#### `GET /stock-receipts` & `POST /stock-receipts`
- **Mục đích:** Phiếu nhập kho vật tư, kiểm kê chất lượng và cập nhật số dư tồn kho.

#### `GET /stock-issues` & `POST /stock-issues`
- **Mục đích:** Phiếu xuất kho vật tư cấp phát cho xã viên canh tác.

#### `GET /stock-takes` & `POST /stock-takes`
- **Mục đích:** Phiếu kiểm kê kho và xử lý chênh lệch số lượng thực tế vs sổ sách.

---

### 6. PHÂN HỆ TÀI CHÍNH & CÔNG NỢ (FINANCE)

#### `GET /cash-transactions` & `POST /cash-transactions`
- **Mục đích:** Thu chi tiền mặt và tiền gửi ngân hàng (Phiếu thu / Phiếu chi).
- **Quy trình:** Tạo phiếu (`DRAFT`) -> Kế toán duyệt (`APPROVED`) -> Thủ quỹ ghi sổ (`POSTED`).

#### `GET /receivable-payables/summary`
- **Mục đích:** Báo cáo phân tích tổng hợp công nợ và tuổi nợ (Aging Analysis).
- **Response Data:**
  ```json
  {
    "total_receivable": 65000000.00,
    "overdue_receivable": 15000000.00,
    "total_payable": 30000000.00,
    "overdue_payable": 30000000.00,
    "net_debt_position": 35000000.00,
    "total_open_debts_count": 8,
    "aging_breakdown": {
      "current": 50000000.00,
      "overdue_1_30": 15000000.00,
      "overdue_31_60": 30000000.00,
      "overdue_61_90": 0.00,
      "overdue_90_plus": 0.00
    }
  }
  ```

#### `POST /receivable-payables/harvest-settlements`
- **Mục đích:** Tự động cấn trừ công nợ vật tư đầu vụ vào tiền thu mua sản lượng thu hoạch cuối vụ của xã viên.

#### `GET /surplus-distribution-plans` & `POST /surplus-distribution-plans`
- **Mục đích:** Lập phương án phân chia lợi nhuận theo vốn góp và mức độ sử dụng dịch vụ HTX (Luật HTX 2023).

---

### 7. PHÂN HỆ SỐ HÓA HỒ SƠ OCOP (OCOP ENGINE)

#### `GET /ocop/criteria-versions`
- **Mục đích:** Danh sách phiên bản bộ tiêu chí đánh giá phân hạng OCOP (theo Quyết định 148/QĐ-TTg).

#### `GET /ocop/applications` & `POST /ocop/applications`
- **Mục đích:** Khởi tạo và quản lý hồ sơ đăng ký OCOP cho sản phẩm chủ lực (ví dụ: Ớt chuông Sweet Palermo).

#### `GET /ocop/applications/{id}/score-suggestions`
- **Mục đích:** Thuật toán AI gợi ý điểm tự đánh giá dựa trên dữ liệu nhật ký canh tác VietGAP và tính toán PHI.

#### `POST /ocop/applications/{id}/self-assessments`
- **Mục đích:** Lưu kết quả tự chấm điểm hồ sơ theo từng chỉ tiêu chi tiết.

#### `POST /evidence/upload` & `POST /evidence/link-to-indicator`
- **Mục đích:** Tải lên tệp minh chứng số hóa (PDF, PNG, JPG), tự động băm SHA-256 chống làm giả và liên kết với chỉ tiêu đánh giá.

#### `GET /ocop/evaluation-sessions` & `POST /ocop/evaluations/submit`
- **Mục đích:** Hội đồng chấm điểm, thẩm định và khóa điểm phiên đánh giá OCOP.

#### `POST /ocop/applications/{id}/approve`
- **Mục đích:** Ban hành quyết định công nhận hạng sao OCOP (thời hạn 36 tháng).

---

### 8. BÁO CÁO, XUẤT DỮ LIỆU & THÔNG BÁO

#### `GET /reports/dashboard`
- **Mục đích:** Tổng hợp KPI dashboard: diện tích canh tác, số lượng xã viên, doanh thu thu hoạch, hồ sơ OCOP.

#### `GET /reports/export/members`
- **Mục đích:** Tải file Excel (`.xlsx`) OpenXML chuẩn danh bạ xã viên HTX.
- **Response:** File nhị phân dạng StreamedResponse kèm header `Content-Type: application/vnd.openxmlformats-officedocument.spreadsheetml.sheet`.

#### `GET /reports/export/cash-book`
- **Mục đích:** Tải file Excel (`.xlsx`) OpenXML chuẩn Sổ quỹ tiền mặt HTX.

#### `GET /notifications`
- **Mục đích:** Lấy danh sách thông báo của người dùng đăng nhập kèm số lượng chưa đọc (`meta.unread_count`).

#### `POST /notifications/{id}/mark-as-read` & `POST /notifications/mark-all-read`
- **Mục đích:** Cập nhật trạng thái thông báo đã đọc.

---

## III. NGUYÊN TẮC FRONTEND INTEGRATION

1. **Không Mock Dữ Liệu:** Bắt buộc kết nối trực tiếp đến các endpoint nêu trên qua `axiosInstance` hoặc React Query.
2. **Xử lý Trạng thái Trung thực:**
   - Đang tải: Hiển thị Skeleton loading.
   - Dữ liệu trống (`data: []`): Hiển thị Empty state hướng dẫn thêm mới.
   - Lỗi: Hiển thị Toast thông báo lỗi có mã lỗi `error.code` và `error.message`.
3. **Phân tách Trách nhiệm (Component Architecture):**
   - Mọi trang màn hình phải duy trì dưới 400 dòng code.
   - Tách rời các hook truy vấn (`useMemberData.ts`), component bảng (`MemberTable.tsx`) và modal/drawer (`MemberEditModal.tsx`).
4. **Context HTX:** Sử dụng giá trị `tenantContext` từ `useTenantContextStore` để hiển thị tên HTX động.
