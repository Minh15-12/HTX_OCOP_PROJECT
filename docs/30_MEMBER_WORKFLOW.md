# 30_MEMBER_WORKFLOW.md

# Quy Trình Nghiệp Vụ: Quản Trị Thành Viên & Quản Lý Vốn Góp

## 1. Thông Tin Tài Liệu

| Trường | Giá trị |
|--------|---------|
| Document ID | 30 |
| Tên tài liệu | Member & Capital Contribution Workflow |
| Dự án | Hệ thống quản lý HTX nông nghiệp & số hóa OCOP |
| HTX áp dụng | HTX Dịch vụ Nông nghiệp Tổng hợp Tân Tiến (MST: 5801193024) |
| Nguồn | Báo cáo Nghiên cứu Quy trình Quản trị Thành viên và Quản lý Vốn góp.docx |
| Tài liệu liên quan | 03_BUSINESS_PROCESSES.md, 05_ACTORS_AND_ROLES.md, 06_BUSINESS_RULES.md, 08_FUNCTIONAL_REQUIREMENTS.md |
| Trạng thái | CONFIRMED – BASELINE |

---

## 2. Tổng Quan Cơ Cấu Thành Viên HTX Tân Tiến

### 2.1 Số liệu thực tế (FACT)

| Thông số | Giá trị |
|----------|---------|
| Tổng số thành viên | 165 hộ |
| Thành viên chính thức | 20 thành viên nòng cốt |
| Diện tích thành viên chính thức | 40 ha nhà kính công nghệ cao (tổ Hòn Bồ, Phường 12) |
| Hộ liên kết | ~145 hộ nông dân chuyên canh |
| Diện tích liên kết | ~240 ha mở rộng |
| Vốn điều lệ | 3,5 tỷ VNĐ |
| Mức vốn góp tối thiểu | 10.000.000 VNĐ/thành viên chính thức |

### 2.2 Phân Loại Thành Viên

```text
Thành Viên HTX
    │
    ├── THÀNH VIÊN CHÍNH THỨC (Thành viên góp vốn)
    │       ├── Quyền biểu quyết bình đẳng (1 phiếu/thành viên, không phụ thuộc vốn góp)
    │       ├── Được cấp Giấy chứng nhận phần vốn góp
    │       ├── Được phân phối lợi nhuận hàng năm
    │       ├── Có thể ứng cử vào HĐQT, Ban Kiểm soát
    │       └── Chịu trách nhiệm hữu hạn trong phạm vi vốn góp
    │
    └── THÀNH VIÊN LIÊN KẾT (Hộ liên kết chuỗi giá trị)
            ├── Không nộp vốn góp điều lệ
            ├── Không có quyền biểu quyết nhân sự/chính sách cốt lõi
            ├── Ký Hợp đồng liên kết sản xuất và tiêu thụ theo mùa vụ
            └── Được cung ứng giống, phân bón theo giá sỉ
```

**Phân biệt loại thành viên liên kết trong hệ thống:**

| Loại | Enum | Mô tả |
|------|------|--------|
| Thành viên chính thức | `CHINH_THUC` | Góp vốn, có quyền biểu quyết |
| Thành viên liên kết góp vốn | `LIEN_KET_GOP_VON` | Có góp vốn nhưng bị giới hạn tổng tỷ lệ |
| Thành viên liên kết không góp vốn | `LIEN_KET_KHONG_GOP_VON` | Chỉ ký hợp đồng chuỗi giá trị |

---

## 3. Vòng Đời Thành Viên (Finite State Machine)

### 3.1 Sơ Đồ Trạng Thái

```text
[Đơn xin gia nhập]
         │
         ▼
    CHO_DUYET ─────────────────────────────┐
     (DRAFT/                               │ [Từ chối]
   PENDING_APPROVAL)                       │
         │                                 ▼
         │ [HĐQT phê duyệt]           TU_CHOI
         │ + ghi nhận vốn góp
         ▼
  DANG_HOAT_DONG ◄──────────────── (Hủy đình chỉ)
   (ACTIVE)                                │
         │                                 │
         │ [Vi phạm quy định]    ──────────┘
         ▼
   TAM_DINH_CHI
  (SUSPENDED)
         │
         │ [Quyết định chấm dứt]
         ▼
  CHO_QUYET_TOAN
 (PENDING_TERMINATION) ← Kiểm tra: công nợ = 0
         │               nghĩa vụ giao nộp đủ
         │ [Đủ điều kiện]
         ▼
   DA_CHAM_DUT
   (TERMINATED)
```

> **LƯU Ý TUYỆT ĐỐI**: Không thực hiện Hard Delete (`DELETE FROM members`). Luôn dùng Soft Delete + cơ chế khóa nghiệp vụ. Lý do: bảo toàn Foreign Key với PhieuXuatVatTu, NhatKyCanhTac, PhieuThuMua, hồ sơ OCOP lịch sử.

### 3.2 Transition Matrix

| Từ Trạng Thái | Hành Động | Actor | Điều Kiện | Trạng Thái Mới |
|---------------|-----------|-------|-----------|----------------|
| – | Nộp đơn đăng ký | Người đề nghị | Đủ hồ sơ theo quy định | `CHO_DUYET` |
| `CHO_DUYET` | Phê duyệt kết nạp | HĐQT/Giám đốc | Đủ điều kiện pháp lý | `DANG_HOAT_DONG` |
| `CHO_DUYET` | Từ chối | HĐQT/Giám đốc | Không đủ điều kiện | `TU_CHOI` |
| `DANG_HOAT_DONG` | Đình chỉ | Giám đốc | Có quyết định vi phạm | `TAM_DINH_CHI` |
| `TAM_DINH_CHI` | Hủy đình chỉ | Giám đốc | Đã khắc phục vi phạm | `DANG_HOAT_DONG` |
| `TAM_DINH_CHI` | Khởi động quyết toán | Giám đốc | Có quyết định chấm dứt | `CHO_QUYET_TOAN` |
| `DANG_HOAT_DONG` | Khởi động quyết toán | Giám đốc | Đơn xin rút/quyết định | `CHO_QUYET_TOAN` |
| `CHO_QUYET_TOAN` | Hoàn tất chấm dứt | Kế toán + Giám đốc | Công nợ = 0, đủ nghĩa vụ | `DA_CHAM_DUT` |

---

## 4. Quy Trình Chi Tiết

### 4.1 Kịch Bản 1: Tiếp Nhận & Kết Nạp Thành Viên Mới

**Điều kiện tiếp nhận:**
- Cá nhân từ đủ 18 tuổi hoặc đại diện hộ gia đình
- Có đất canh tác rau củ quả tại Đà Lạt/Lạc Dương
- Có Đơn xin gia nhập, cam kết tuân thủ Điều lệ và quy chuẩn VietGAP
- Đối với thành viên chính thức: cam kết góp vốn tối thiểu 10.000.000 VNĐ

**Luồng thực thi:**

```text
Bước 1: Người đề nghị gửi hồ sơ
        └── Hệ thống tạo bản ghi ở trạng thái CHO_DUYET
        └── Kiểm tra trùng CCCD (BR-COOP-008) → ERR_MEMBER_DUPLICATE_ID nếu trùng

Bước 2: Cán bộ kỹ thuật khảo sát thực địa
        └── Kiểm tra diện tích, nguồn nước, nhà màng
        └── Cập nhật kết quả khảo sát vào hồ sơ

Bước 3: HĐQT họp xét duyệt
        └── Nếu thông qua → Cấp Mã định danh xã viên (TT-TV-XXXX)
        └── Thông báo nộp vốn góp

Bước 4: Kế toán ghi nhận góp vốn (xem mục 5)
        └── Hệ thống tự động kiểm tra giới hạn vốn (BR-COOP-004)
        └── Cập nhật trạng thái → DANG_HOAT_DONG
        └── Sinh Giấy chứng nhận phần vốn góp điện tử

Bước 5: Báo cáo Đại hội thành viên phê chuẩn (kỳ họp gần nhất)
```

**Audit Events:** `MEMBER_CREATED`, `MEMBER_STATUS_CHANGED` (kèm trạng thái trước/sau)

### 4.2 Kịch Bản 2: Cập Nhật Thông Tin Xã Viên

**Phân loại theo mức độ ảnh hưởng:**

| Loại thay đổi | Quy trình | Người phê duyệt |
|---------------|-----------|-----------------|
| Sai sót hành chính thông thường (tên, SĐT, tài khoản ngân hàng) | Kế toán/QTV xác minh CCCD/thẻ ngân hàng → cập nhật | Kế toán |
| Thay đổi thông tin pháp lý trọng yếu (CCCD mới, thay chủ hộ) | Đính kèm tệp số hóa (giấy xác nhận định danh mới / biên bản họp gia đình) | Giám đốc HTX |
| Biến động diện tích canh tác | Không sửa trực tiếp hồ sơ xã viên → cập nhật phân hệ `ThuaDat` và `VungTrong` | Cán bộ kỹ thuật |

**Audit Events:** `MEMBER_PROFILE_UPDATED` (ghi lại giá trị cũ/mới)

### 4.3 Kịch Bản 3: Chấm Dứt Tư Cách Xã Viên

**Các trường hợp chấm dứt:**
- Tự nguyện xin rút
- Thành viên qua đời, mất tích, mất năng lực hành vi dân sự
- Khai trừ do vi phạm nghiêm trọng (bán chui nông sản, dùng hóa chất cấm)
- Không sử dụng dịch vụ HTX liên tục 18–36 tháng

**Điều kiện tiên quyết để chuyển → `DA_CHAM_DUT`:**

```text
Điều kiện 1: Tổng dư nợ vật tư = 0
    └── Kiểm tra: SUM(du_no) FROM PhieuXuatVatTu WHERE ma_xa_vien = ? = 0

Điều kiện 2: Nghĩa vụ giao nộp nông sản hoàn tất
    └── Không còn giao dịch thu mua treo

Điều kiện 3: Không còn ràng buộc tài chính khác
    └── Không có khoản vay nội bộ chưa tất toán

Điều kiện 4: Vốn góp đã được hoàn trả theo quyết định của HĐQT
```

**Luồng thực thi:**

```text
Bước 1: Lập biên bản đề nghị chấm dứt tư cách thành viên
Bước 2: Hệ thống kiểm tra tự động 4 điều kiện trên
Bước 3: Nếu đủ điều kiện → trạng thái CHO_QUYET_TOAN
Bước 4: Kế toán thực hiện quyết toán (vốn góp, công nợ, cổ tức)
Bước 5: Giám đốc phê duyệt → trạng thái DA_CHAM_DUT (Soft Delete)
Bước 6: Khóa tất cả quyền truy cập của xã viên
```

**Audit Events:** `MEMBER_STATUS_CHANGED` → `DA_CHAM_DUT`

---

## 5. Quy Trình Quản Lý Vốn Góp

### 5.1 Các Loại Biến Động Vốn

```text
Giao Dịch Vốn Góp
    │
    ├── GÓP VỐN LẦN ĐẦU (khi kết nạp)
    │
    ├── GÓP BỔ SUNG (tăng vốn)
    │
    ├── HOÀN TRẢ VỐN (khi chấm dứt)
    │
    └── ĐỊNH GIÁ TÀI SẢN GÓP VỐN (nếu góp bằng hiện vật)
```

### 5.2 Business Rules Vốn Góp

| Rule ID | Nội dung | Mức | Nguồn |
|---------|---------|-----|-------|
| BR-COOP-004 | Phần vốn góp của 1 thành viên chính thức ≤ 30% vốn điều lệ | P0 | Điều 74 Luật HTX 2023 |
| BR-COOP-005 | Tổng vốn góp của thành viên liên kết góp vốn ≤ 30% vốn điều lệ | P0 | Luật HTX 2023 |
| BR-COOP-006 | Góp đủ vốn cam kết trong tối đa 6 tháng kể từ ngày kết nạp | P1 | Luật HTX 2023 |
| BR-MEM-LOCAL | Mức góp vốn tối thiểu: 10.000.000 VNĐ/thành viên chính thức | P0 | Điều lệ HTX Tân Tiến |

### 5.3 Thuật Toán Kiểm Tra Trần Vốn Góp

```
KHAI BÁO:
    vốn_mới_góp      = số tiền hoặc giá trị tài sản góp
    vốn_hiện_tại    = tổng vốn đã góp của thành viên
    vốn_điều_lệ     = tổng vốn điều lệ đã thực góp của HTX

TÍNH:
    tỷ_lệ_sau_góp = (vốn_hiện_tại + vốn_mới_góp) / vốn_điều_lệ * 100

KIỂM TRA:
    NẾU tỷ_lệ_sau_góp > 30%:
        → CHặn giao dịch
        → Báo lỗi: ERR_CAPITAL_EXCEED_LIMIT
        → Gợi ý số tiền tối đa có thể góp = vốn_điều_lệ * 0.3 - vốn_hiện_tại
    NGƯỢC LẠI:
        → Ghi nhận giao dịch
        → Cập nhật tổng vốn điều lệ thực góp của HTX
```

### 5.4 Phân Phối Lợi Nhuận (Công Thức HTX Tân Tiến)

> **FACT** (từ DOCX nghiên cứu, cần cấu hình được theo Điều lệ)

```
Tổng lợi nhuận có thể phân phối (P_total)
    = Thu nhập ròng
    - Trích lập quỹ không chia tối thiểu 5% (BR-FIN-008)
    - Các khoản bắt buộc khác

Phân phối cho thành viên chính thức:
    P_member = P_total - phần giữ lại khác
    (Tối thiểu 51% thu nhập từ giao dịch nội bộ theo BR-FIN-009)

Công thức phân bổ cho từng thành viên tại HTX Tân Tiến:
    Phần theo vốn góp (30% của P_member):
        = P_member * 0.30 * (vốn_góp_cá_nhân / tổng_vốn_điều_lệ)

    Phần theo doanh số dịch vụ (70% của P_member):
        = P_member * 0.70 * (doanh_số_dịch_vụ_cá_nhân / tổng_doanh_số_dịch_vụ)
```

> **LƯU Ý**: Các tỷ lệ 30/70 là thực tế tại HTX Tân Tiến. Phải cấu hình được, không được hard-code.

---

## 6. Quy Tắc Nghiệp Vụ Tổng Hợp

### 6.1 Ngăn Ngừa Trùng Lặp

```text
KIỂM TRA TRƯỚC KHI TẠO THÀNH VIÊN:
    1. CCCD phải duy nhất trong phạm vi HTX (BR-COOP-008)
    2. Tỷ lệ thành viên nước ngoài ≤ 35% (BR-COOP-007) - TO_VERIFY
    3. Số thành viên tối thiểu để HTX thành lập ≥ 5 người (BR-COOP-001)
```

### 6.2 Soft Delete - Quy Tắc Bất Biến

```sql
-- KHÔNG BAO GIỜ THỰC HIỆN:
DELETE FROM members WHERE id = ?;  -- FORBIDDEN

-- THAY VÀO ĐÓ:
UPDATE members SET
    status = 'DA_CHAM_DUT',
    deleted_at = NOW(),
    deleted_reason = 'REASON',
    deleted_by = user_id
WHERE id = ?;
```

### 6.3 Điều Kiện Chặn Nghiệp Vụ

| Điều kiện | Chặn giao dịch |
|-----------|----------------|
| `member.status != ACTIVE` | Không cho tạo thửa đất mới |
| `member.status != ACTIVE` | Không cho nhận vật tư trả chậm |
| `member.status != ACTIVE` | Không cho tham gia mùa vụ mới |
| `member.status == DA_CHAM_DUT` | Không cho sửa đổi hồ sơ |
| Vốn góp chưa đủ (quá 6 tháng) | Cảnh báo OVERDUE |

---

## 7. Permissions & Authorization

| Hành Động | Permission | Role |
|-----------|-----------|------|
| Xem danh sách xã viên | `MEMBER.READ` | AGRONOMIST, ACCOUNTANT, DIRECTOR |
| Tạo hồ sơ xã viên mới | `MEMBER.CREATE` | DIRECTOR, STAFF |
| Phê duyệt kết nạp | `MEMBER.APPROVE` | DIRECTOR |
| Cập nhật thông tin thông thường | `MEMBER.UPDATE` | ACCOUNTANT, STAFF |
| Phê duyệt thay đổi pháp lý trọng yếu | `MEMBER.APPROVE_LEGAL_CHANGE` | DIRECTOR |
| Đình chỉ tư cách | `MEMBER.SUSPEND` | DIRECTOR |
| Chấm dứt tư cách | `MEMBER.TERMINATE` | DIRECTOR |
| Ghi nhận vốn góp | `CAPITAL.MANAGE` | ACCOUNTANT |
| Phê duyệt biến động vốn | `CAPITAL.APPROVE` | DIRECTOR |
| Xem của mình | `MEMBER.READ_OWN` | MEMBER |

---

## 8. Audit Events Bắt Buộc

| Sự kiện | Bắt buộc ghi | Dữ liệu |
|---------|-------------|---------|
| `MEMBER_CREATED` | Có | actor, member_id, loại_thành_viên, timestamp |
| `MEMBER_STATUS_CHANGED` | Có | actor, member_id, from_status, to_status, reason, timestamp |
| `CAPITAL_CONTRIBUTION_RECORDED` | Có | actor, member_id, amount, type, cumulative_total |
| `CAPITAL_CERTIFICATE_ISSUED` | Có | actor, member_id, cert_number, amount |
| `MEMBER_INFO_UPDATED` | Có | actor, member_id, field_changed, old_value, new_value |
| `MEMBER_TERMINATED` | Có | actor, member_id, reason, final_debt_amount |

---

## 9. Output Documents

| Tài liệu | Điều kiện sinh | Định dạng |
|----------|---------------|-----------|
| Giấy chứng nhận phần vốn góp | Khi thành viên góp đủ 100% cam kết | PDF |
| Phiếu thu vốn góp | Mỗi lần góp vốn | PDF |
| Sổ đăng ký thành viên | Xuất theo yêu cầu | PDF/XLSX |
| Bảng phân phối lợi nhuận | Cuối kỳ quyết toán | PDF/XLSX |
| Biên bản chấm dứt tư cách | Khi terminate | PDF |

---

## 10. Liên Kết Dữ Liệu

```text
Member (Xã viên)
    ├── CapitalContribution (Vốn góp) [1:N]
    ├── FarmPlot (Thửa đất canh tác) [1:N]
    ├── FarmingLog (Nhật ký canh tác) [1:N]
    ├── StockIssue (Phiếu xuất vật tư nợ) [1:N]
    ├── HarvestRecord (Phiếu thu mua nông sản) [1:N]
    ├── Receivable (Công nợ) [1:N]
    └── ProfitDistribution (Phân phối lợi nhuận) [1:N]
```

> **QUAN TRỌNG**: Khi thành viên `DA_CHAM_DUT`, tất cả dữ liệu liên quan phải được giữ nguyên (immutable). Chỉ trạng thái member thay đổi.

---

## 11. Open Questions / TO_VERIFY

| ID | Câu hỏi | Mức độ |
|----|---------|--------|
| MEM-V-001 | Quy trình biểu quyết tại Đại hội thành viên (quorum, tỷ lệ thông qua) | High |
| MEM-V-002 | Thành viên liên kết có được đề nghị lên thành viên chính thức không? | Medium |
| MEM-V-003 | Xử lý trường hợp thành viên qua đời (chuyển kế thừa?) | High |
| MEM-V-004 | Quy trình hoàn trả vốn góp khi chấm dứt (thứ tự ưu tiên trả nợ) | Critical |
| MEM-V-005 | Chính sách đối với thành viên không sử dụng dịch vụ 18-36 tháng | Medium |
