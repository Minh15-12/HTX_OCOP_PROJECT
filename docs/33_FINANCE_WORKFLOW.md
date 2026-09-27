# Quy Trình Nghiệp Vụ: Tài Chính, Cấn Trừ Công Nợ & Phân Chia Lợi Nhuận

## 1. Phạm Vi Tài Chính Trong Hệ Thống
Hệ thống KHÔNG đóng vai trò như một phần mềm kế toán doanh nghiệp đầy đủ. Phạm vi quản lý tài chính tập trung vào các nghiệp vụ đặc thù của Hợp tác xã (HTX):
- Ghi nhận các khoản thu - chi nội bộ và ngoại bộ (lập phiếu thu, phiếu chi).
- Theo dõi công nợ của xã viên (ví dụ: cấp phát vật tư trả chậm).
- Cấn trừ công nợ khi quyết toán thu mua nông sản vào cuối mùa vụ.
- Phân chia lợi nhuận / thặng dư cuối năm theo quy định của Luật HTX và điều lệ.

---

## 2. Phân Loại Giao Dịch Tài Chính
Các loại giao dịch tài chính chính được hỗ trợ trong hệ thống bao gồm:

- `RECEIPT`: Thu tiền (ví dụ: thu tiền bán nông sản ra thị trường, thu hội phí).
- `PAYMENT`: Chi tiền (ví dụ: thanh toán tiền cho nhà cung cấp vật tư, chi trả lương nhân viên, chi phí vận hành).
- `MEMBER_PURCHASE`: Xuất vật tư cho xã viên dưới hình thức trả chậm, tạo ra một khoản phải thu (`Receivable`).
- `HARVEST_SETTLEMENT`: Quyết toán mùa vụ, tính toán tiền thu mua nông sản và tự động cấn trừ với khoản `Receivable`.
- `PROFIT_DISTRIBUTION`: Phân phối thặng dư / lợi nhuận cuối năm cho các xã viên.

---

## 3. Workflow Quyết Toán Mùa Vụ (Harvest Settlement)

Đây là quy trình cốt lõi để tính toán số tiền thực trả cho xã viên sau khi trừ đi các chi phí và công nợ.

### 3.1. Thông Tin Đầu Vào
- **Trigger**: Quy trình được kích hoạt khi mùa vụ kết thúc (Trạng thái mùa vụ: `season.status = COMPLETED`).
- **Input**: Tổng sản lượng thu mua từ xã viên, phân loại theo chất lượng (Grade A, Grade B).
- **Giá mua**: 
  - `P_A`: Giá thu mua cho sản phẩm Grade A.
  - `P_B`: Giá thu mua cho sản phẩm Grade B.
  *(Giá được cấu hình theo hợp đồng thu mua)*
- **Phí dịch vụ HTX**: Tỷ lệ `r` (thường là 2-3%, có thể cấu hình được bởi Ban Giám đốc).

### 3.2. Thuật Toán Quyết Toán Chi Tiết
Quy trình tính toán tuân theo 5 bước sau:

**Bước 1: Tính tổng giá trị nông sản thu mua**
- `V_gradeA` = `sản_lượng_A` × `P_A`
- `V_gradeB` = `sản_lượng_B` × `P_B`
- `V_total` = `V_gradeA` + `V_gradeB`

**Bước 2: Tính phí dịch vụ HTX**
- `Fee` = `V_total` × `r`

**Bước 3: Kiểm tra và cấn trừ công nợ**
- Xác định tổng dư nợ vật tư trả chậm của xã viên trong mùa vụ (`D_debt`).
- Số tiền cấn trừ (`D`) được tính theo công thức:
  `D` = `min(D_debt, V_total - Fee)`
  *(Nguyên tắc: Không được cấn trừ quá số tiền còn lại sau khi đã trừ phí dịch vụ).*

**Bước 4: Tính số tiền thực trả cho xã viên**
- `P_net` = `V_total` - `Fee` - `D`

**Bước 5: Ghi nhận vào hệ thống**
- Giảm số dư công nợ (`Receivable`) của xã viên đúng bằng số tiền đã cấn trừ (`D`).
- Sinh phiếu thanh toán cho xã viên với số tiền là `P_net`.
- Ghi nhận doanh thu dịch vụ cho HTX bằng `Fee`.
- **Lưu ý:** Nếu dư nợ lớn hơn số tiền được cấn trừ (`D_debt > (V_total - Fee)`), phần công nợ còn lại sẽ được chuyển sang kỳ kế toán tiếp theo, tuyệt đối không được xóa nợ.

### 3.3. Vòng Đời Trạng Thái (Status Lifecycle) của Harvest Settlement
- `DRAFT`: Đang trong quá trình tính toán, có thể thay đổi dữ liệu đầu vào.
- `PENDING_APPROVAL`: Chờ Kế toán trưởng và Giám đốc phê duyệt.
- `APPROVED`: Đã được phê duyệt, dữ liệu bị khóa (Immutable), không thể sửa đổi.
- `PAID`: Đã hoàn tất việc chi trả thực tế cho xã viên.
- `CANCELLED`: Bị hủy bỏ (Chỉ được phép hủy khi giao dịch đang ở trạng thái `DRAFT`).

---

## 4. Quy Trình Phân Phối Thặng Dư Cuối Năm

Quy trình phân phối lợi nhuận tuân thủ các bước pháp lý và quy định của HTX:

1. Xác định kết quả hoạt động kinh doanh trong năm (sau khi đã trích lập các quỹ bắt buộc).
2. Trích quỹ không chia (tối thiểu 5% theo quy định chung).
3. Lập phương án phân phối thặng dư và đệ trình Hội đồng Quản trị (HĐQT) phê duyệt.
4. Trình Đại hội thành viên thông qua phương án.
5. Tính toán phân bổ cho từng thành viên (sử dụng công thức 30/70: 30% theo vốn góp, 70% theo mức độ sử dụng dịch vụ - tỷ lệ này có thể cấu hình được).
6. Ghi nhận giao dịch phân phối vào hệ thống.
7. Tạo phiếu chi hoặc kết chuyển vào nguồn vốn của xã viên (tùy lựa chọn).

---

## 5. Nguyên Tắc Bất Biến Tài Chính (Financial Invariants)

Để đảm bảo tính minh bạch và toàn vẹn của dữ liệu tài chính:

- Giao dịch đã chuyển sang trạng thái `APPROVED` hoặc `FINALIZED` tuyệt đối **không được sửa hoặc xóa**.
- Mọi điều chỉnh, sai sót phát hiện sau khi duyệt phải được thực hiện bằng cách tạo **giao dịch ngược chiều (reversal entry)**.
- Mọi thay đổi về dữ liệu tài chính phải có **Audit Trail** ghi nhận đầy đủ: Ai làm, làm gì, khi nào, lý do.

---

## 6. Kiểm Soát Tương Tranh (Concurrency Control)

Hệ thống tài chính đòi hỏi độ chính xác tuyệt đối trong môi trường đa người dùng:
- Áp dụng **Row-level locking** (ví dụ: `SELECT ... FOR UPDATE` trong DB) khi cập nhật số dư công nợ hoặc ví tài khoản để tránh race condition.
- Sử dụng **Idempotency key** cho mọi API giao dịch tài chính (đặc biệt là tạo phiếu, quyết toán) nhằm hỗ trợ an toàn khi client gọi lại (retry) trong trường hợp lỗi mạng.

---

## 7. Báo Cáo Tài Chính
Hệ thống cung cấp các báo cáo đặc thù:
- **Bảng thu chi theo kỳ**: Liệt kê tổng hợp RECEIPT và PAYMENT.
- **Sổ công nợ xã viên**: Chi tiết phát sinh tăng/giảm công nợ của từng thành viên.
- **Báo cáo quyết toán mùa vụ**: Bảng kê chi tiết tiền thu mua, phí dịch vụ, cấn trừ nợ và số tiền thực trả của đợt quyết toán.
- **Bảng phân phối lợi nhuận**: Danh sách chi tiết số tiền phân chia cho từng thành viên cuối năm.

---

## 8. Permissions & RBAC
Ma trận phân quyền sơ bộ cho phân hệ tài chính:

| Chức năng | Accountant (Kế toán) | Director (Giám đốc) | Member (Xã viên) |
|---|---|---|---|
| Tạo phiếu thu/chi | View, Create, Update | View | N/A |
| Quyết toán mùa vụ | View, Create, Approve | View, Approve | View (của mình) |
| Phương án phân phối lợi nhuận | View, Create | View, Approve | N/A |
| Xem báo cáo công nợ | View (All) | View (All) | View (của mình) |

*(Chỉ Director hoặc người có thẩm quyền được ủy quyền mới được Approve các quyết toán lớn).*

---

## 9. Audit Events
Các sự kiện quan trọng sẽ được lưu vào nhật ký kiểm toán (`audit_logs`):
- `HARVEST_SETTLEMENT_CREATED`
- `HARVEST_SETTLEMENT_APPROVED`
- `DEBT_OFFSET_RECORDED` (Ghi nhận cấn trừ nợ)
- `PROFIT_DISTRIBUTION_FINALIZED`
- `PAYMENT_ISSUED`

---

## 10. Business Rules

- **FIN_RULE_01**: Không được cấn trừ công nợ vượt quá số tiền thu mua sau khi đã trừ phí dịch vụ (D <= V_total - Fee).
- **FIN_RULE_02**: Công nợ chưa thanh toán hết sẽ được kết chuyển sang kỳ sau.
- **FIN_RULE_03**: Giao dịch đã `APPROVED` không được phép sửa/xóa, chỉ được tạo Reversal.
- **FIN_RULE_04**: Trạng thái Harvest Settlement chỉ được chuyển từ `PENDING_APPROVAL` sang `APPROVED` bởi user có role `DIRECTOR` hoặc `CHIEF_ACCOUNTANT`.
- **FIN_RULE_05**: Quỹ không chia phải được trích tối thiểu 5% thặng dư trước khi phân phối.

---

## 11. Open Questions / TO_VERIFY

- **Q1**: Việc chi trả `P_net` cho xã viên sẽ được thực hiện qua chuyển khoản ngân hàng (API tích hợp) hay chỉ ghi nhận phiếu chi tiền mặt trên hệ thống?
- **Q2**: Nếu nông sản bị hao hụt trong quá trình thu mua hoặc lưu kho trước khi quyết toán, chi phí này sẽ được hạch toán vào phí dịch vụ `Fee` hay có hạng mục cấn trừ riêng?
- **Q3**: Công thức phân chia thặng dư (30/70) có áp dụng hồi tố nếu có sự thay đổi quy định giữa năm tài chính không?
