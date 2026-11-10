# Quy Trình Nghiệp Vụ: Hồ Sơ OCOP, Chấm Điểm & Phân Hạng

## 1. Giới Thiệu
Chương trình Mỗi xã một sản phẩm (OCOP) là chương trình phát triển kinh tế khu vực nông thôn theo hướng phát triển nội lực và gia tăng giá trị. Tài liệu này mô tả quy trình nghiệp vụ số hóa quá trình chuẩn bị, tự đánh giá, nộp hồ sơ và chấm điểm phân hạng sản phẩm OCOP, áp dụng cho HTX Tân Tiến.

- **Sản phẩm mục tiêu**: Ớt chuông Sweet Palermo Đỏ Đà Lạt (mục tiêu 4-5 sao).
- **Căn cứ pháp lý**: Quyết định 148/QĐ-TTg ngày 24/02/2023 và Quyết định 1489/QĐ-TTg ngày 06/07/2025 sửa đổi, bổ sung một số nội dung về tiêu chí, quy trình và thẩm quyền đánh giá phân hạng OCOP.

---

## 2. Cấu Trúc Bộ Tiêu Chí OCOP (Theo Quyết định 148)

Tổng điểm tối đa là 100 điểm, được phân thành 3 phần chính. Hệ thống cần hỗ trợ cấu hình động bộ tiêu chí này.

### PHẦN A: SẢN PHẨM & SỨC MẠNH CỘNG ĐỒNG (40 điểm)
- **TC-A.1**: Tỷ lệ sử dụng nguyên liệu địa phương (10đ)
  - *Nguồn dữ liệu hệ thống*: Modules `VungTrong`, `ThuaDat`.
- **TC-A.2**: Sử dụng lao động tại chỗ (5đ)
  - *Nguồn dữ liệu hệ thống*: Danh sách xã viên / nhân sự HTX.
- **TC-A.3**: Năng lực liên kết chuỗi giá trị (10đ)
  - *Nguồn dữ liệu hệ thống*: `PhieuThuMua`, Hợp đồng bao tiêu.
- **TC-A.4**: Bảo vệ môi trường & Xử lý phụ phẩm (15đ)

### PHẦN B: KHẢ NĂNG TIẾP THỊ (25 điểm)
- **TC-B.1.1**: Hệ thống kênh phân phối (8đ)
- **TC-B.1.2**: Bao bì đóng gói & Tem nhãn truy xuất (7đ)
  - *Nguồn dữ liệu hệ thống*: Liên kết mã lô (`lot_id`), mã QR truy xuất nguồn gốc.
- **TC-B.2**: Câu chuyện về sản phẩm (10đ)

### PHẦN C: CHẤT LƯỢNG SẢN PHẨM (35 điểm)
- **TC-C.1**: Cảm quan, dinh dưỡng & Tính độc đáo (10đ)
- **TC-C.2.1**: Tiêu chuẩn chất lượng VietGAP (10đ)
- **TC-C.2.2**: Kiểm soát dư lượng thuốc bảo vệ thực vật (BVTV) (5đ)
  - *Nguồn dữ liệu hệ thống*: `NhatKyPhunThuoc`.
- **TC-C.3**: Sở hữu trí tuệ & Nhãn hiệu bảo hộ (10đ)

---

## 3. Nguyên Tắc Quản Lý Phiên Bản Tiêu Chí (Version Control)

Để đảm bảo tính nhất quán và khả năng mở rộng:
- **Versioning**: Mỗi hồ sơ OCOP phải được gắn (bind) cứng với một **phiên bản bộ tiêu chí** cụ thể tại thời điểm tạo hồ sơ.
- **No Hard-coding**: Các tiêu chí (điểm, thành phần, yêu cầu) không được hard-code vào source code mà phải được lưu trữ dạng cấu hình trong database.
- **Immutability**: Việc thay đổi chính sách/quy định OCOP (tạo phiên bản bộ tiêu chí mới) **TUYỆT ĐỐI KHÔNG** được làm ảnh hưởng hoặc làm sai lệch kết quả của các hồ sơ OCOP cũ.

---

## 4. Vòng Đời Hồ Sơ OCOP (OcopApplication FSM)

Trạng thái của một hồ sơ OCOP tuân theo Finite State Machine (FSM) sau:

1. `DRAFT`: Khởi tạo hồ sơ, đang thu thập thông tin.
2. `INTERNAL_REVIEW`: HTX tự kiểm tra và rà soát hồ sơ nội bộ.
3. `HTX_SUBMITTED`: HTX đã nộp hồ sơ lên cơ quan chức năng (huyện/tỉnh).
4. `IN_EVALUATION`: Hội đồng thẩm định đang tiến hành chấm điểm.
5. `REVISION_REQUIRED`: Hội đồng yêu cầu HTX bổ sung/sửa đổi minh chứng.
6. `RESUBMITTED`: HTX đã bổ sung và nộp lại hồ sơ.
7. `COUNCIL_SCORING`: Hội đồng đang trong phiên họp chốt điểm.
8. `CERTIFIED`: Hồ sơ đạt yêu cầu, được cấp chứng nhận OCOP.
9. `REJECTED`: Hồ sơ không đạt yêu cầu, bị từ chối.
10. `RENEWAL_PENDING`: Gần hết hạn hiệu lực (còn ≤ 3 tháng), cần thực hiện tái đánh giá.
11. `EXPIRED`: Chứng nhận hết hiệu lực (sau 36 tháng).

---

## 5. Quy Trình Nghiệp Vụ

### 5.1. Quy trình Tự Đánh Giá (Tại HTX)
- HTX duyệt qua từng tiêu chí trong bộ tiêu chí.
- Nhập **điểm tự chấm** cho từng tiêu chí.
- Đính kèm **minh chứng (Evidence)** tương ứng cho mỗi tiêu chí (tài liệu, hình ảnh, hoặc trích xuất dữ liệu từ hệ thống).
- Nhập **ghi chú giải trình** (nếu cần).
- Hệ thống tự động kiểm tra tính đầy đủ (completeness) của hồ sơ trước khi nộp.
- **Khóa phiên bản**: Sau khi chuyển trạng thái sang `HTX_SUBMITTED`, phiên bản tự đánh giá bị đóng băng, không cho phép chỉnh sửa.

### 5.2. Quy trình Hội Đồng Thẩm Định
- **Chấm độc lập**: Mỗi thành viên hội đồng (Auditor) được cấp tài khoản để chấm điểm độc lập trên hệ thống.
- **Bảo mật điểm số**: Các thành viên không được xem điểm của nhau trong suốt quá trình chấm (Blind scoring).
- **Tổng hợp điểm**: Điểm tổng hợp được tính theo trung bình cộng hoặc quy tắc loại bỏ cực trị (cấu hình được).
- **Kiểm soát độ lệch**: Chênh lệch điểm tổng giữa các thành viên không được vượt quá 10 điểm (Tham chiếu: `BR-OCOP-02`). Nếu vượt ngưỡng, hệ thống cảnh báo yêu cầu họp hội đồng phân giải.
- **Điểm cuối cùng**: Trạng thái điểm `CONSOLIDATED` được chốt bởi Chủ tịch Hội đồng và là dữ liệu bất biến (immutable).

---

## 6. Phân Hạng Sao Dựa Trên Điểm Số

- **5 sao (≥ 90 điểm)**: Sản phẩm chất lượng cao, đủ điều kiện quảng bá và xuất khẩu quốc tế.
- **4 sao (70 - 89 điểm)**: Sản phẩm đạt tiêu chuẩn, có thể nâng cấp để đáp ứng tiêu chuẩn quốc tế (Mục tiêu của ớt chuông Sweet Palermo).
- **3 sao (50 - 69 điểm)**: Sản phẩm đạt chuẩn OCOP cấp tỉnh.
- **Điều kiện bắt buộc**: Ngoài điểm số, hệ thống cần hỗ trợ cấu hình các "điều kiện cứng" (ví dụ: bắt buộc phải có VietGAP hoặc xử lý môi trường đạt chuẩn) để đạt các hạng sao tương ứng.

---

## 7. Chứng Nhận OCOP & Tái Đánh Giá

- **Hiệu lực**: Giấy chứng nhận có hiệu lực trong **36 tháng** kể từ ngày cấp (Cần xác minh lại theo văn bản pháp luật hiện hành).
- **Cảnh báo**: Hệ thống tự động gửi thông báo nhắc nhở tái đánh giá khi chứng nhận còn 3 tháng hiệu lực (chuyển trạng thái `RENEWAL_PENDING`).
- **Hết hạn**: Tự động chuyển trạng thái `EXPIRED` nếu không có kết quả gia hạn.
- **Tái đánh giá**: Quy trình tái đánh giá sẽ bắt đầu một vòng đời mới (tạo một `OcopApplication` mới, link với hồ sơ cũ).

---

## 8. Quản Lý Minh Chứng (Evidence Management)

- Mối quan hệ: `Tiêu chí 1 - N Minh chứng`.
- **Loại minh chứng**:
  - Tải lên file thủ công (PDF, JPG, ...).
  - Trích xuất tự động (Extract) từ dữ liệu lõi của hệ thống (Ví dụ: Dữ liệu vùng trồng, nhật ký phun thuốc, lô hàng).
- **Bảo mật & Toàn vẹn**:
  - Hash file (MD5/SHA256) khi upload để đảm bảo tính toàn vẹn (chống giả mạo).
  - Cung cấp **Presigned URL** có thời hạn để download file minh chứng (đảm bảo bảo mật).
  - Không public trực tiếp các file tài liệu nội bộ/private ra internet.

---

## 9. Output Documents (Tự Động Kết Xuất)

Hệ thống cần cung cấp tính năng kết xuất (export) ra file PDF/Word theo đúng biểu mẫu của Quyết định 148:
- Phiếu Tự đánh giá OCOP của chủ thể (Mẫu 01).
- Biên bản chấm điểm Hội đồng (Mẫu 02).
- Bảng tổng hợp điểm của Hội đồng.
- Quyết định cấp Giấy chứng nhận sản phẩm OCOP (nếu đạt).

---

## 10. Phân Quyền (Permissions & RBAC)

- `DIRECTOR` / `STAFF`: Có quyền `OCOP.MANAGE` (tạo, sửa), `OCOP.SUBMIT` (nộp hồ sơ).
- `OCOP_AUDITOR`: Có quyền `OCOP.SCORE` (chỉ được phép chấm điểm độc lập, không có quyền sửa nội dung hồ sơ của HTX).
- `MEMBER`: Có quyền `OCOP.READ_OWN` (chỉ xem các hồ sơ liên quan đến sản phẩm do mình đóng góp).

---

## 11. Các Sự Kiện Lưu Vết (Audit Events)

Mọi thao tác thay đổi trạng thái hồ sơ phải được log lại với các event type:
- `OCOP_APPLICATION_CREATED`
- `OCOP_SUBMITTED`
- `OCOP_SCORE_RECORDED` (Thành viên hội đồng chấm)
- `OCOP_SCORE_CONSOLIDATED` (Chốt điểm hội đồng)
- `OCOP_CERTIFIED`
- `OCOP_REJECTED`
- `OCOP_EXPIRED`

---

## 12. Tập Luật Kinh Doanh (Business Rules)

- **BR-OCOP-01 (Completeness Check)**: Hồ sơ không thể chuyển sang `HTX_SUBMITTED` nếu có bất kỳ tiêu chí bắt buộc nào thiếu minh chứng hoặc chưa có điểm tự chấm.
- **BR-OCOP-02 (Variance Check)**: Trong giai đoạn `COUNCIL_SCORING`, chênh lệch điểm tổng giữa các thành viên hội đồng thẩm định KHÔNG được lớn hơn 10 điểm.
- **BR-OCOP-03 (Immutability)**: Không ai được phép thay đổi điểm sau khi trạng thái đã là `OCOP_SCORE_CONSOLIDATED`.

---

## 13. Bảng Truy Xuất Cross-Reference: Tiêu Chí -> Nguồn Dữ Liệu

| Mã Tiêu Chí | Nội Dung Tiêu Chí | Nguồn Dữ Liệu Nội Bộ Hệ Thống (Module) |
| :--- | :--- | :--- |
| **TC-A.1** | Nguyên liệu địa phương | Module `VungTrong`, `ThuaDat` |
| **TC-A.2** | Lao động tại chỗ | Danh sách nhân sự / Thành viên HTX |
| **TC-A.3** | Năng lực liên kết chuỗi | Bảng kê `PhieuThuMua`, Hợp đồng liên kết |
| **TC-B.1.2**| Truy xuất nguồn gốc | Module Truy xuất QR, `lot_id` |
| **TC-C.2.2**| Dư lượng BVTV | Báo cáo `NhatKyPhunThuoc` |

---

## 14. Vấn Đề Cần Xác Minh (Open Questions / TO_VERIFY)

1. **Verify hiệu lực 36 tháng**: Cần kiểm tra lại QĐ 148 xem thời hạn chứng nhận OCOP 4-5 sao chính xác là 36 tháng hay có thay đổi.
2. **Verify ngưỡng điểm**: Xác nhận chính xác ngưỡng điểm cho 3 sao, 4 sao, 5 sao trong phụ lục QĐ 148 (Có tiêu chí "cứng" (liệt) nào đi kèm không?).
3. **Quy trình gửi báo cáo**: Việc gửi hồ sơ lên Huyện/Tỉnh là quy trình offline (xuất PDF mang đi nộp) hay API tích hợp với hệ thống công của tỉnh?
