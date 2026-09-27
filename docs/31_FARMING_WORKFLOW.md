# Quy Trình Nghiệp Vụ: Quản Trị Vùng Trồng, Thửa Đất & Mùa Vụ

## 1. Mục tiêu và Phạm vi
Tài liệu này mô tả chi tiết quy trình quản trị vùng trồng, thửa đất và theo dõi mùa vụ, đặc biệt áp dụng cho **HTX Tân Tiến** với sản phẩm chủ lực là **Ớt chuông Sweet Palermo Đỏ Đà Lạt**. Quy trình đảm bảo tính minh bạch, truy xuất nguồn gốc và tuân thủ tiêu chuẩn an toàn thực phẩm, mã số vùng trồng.

### Dữ liệu thực tế HTX Tân Tiến:
- **Sản phẩm**: Ớt chuông Sweet Palermo Đỏ Đà Lạt
- **Tổng diện tích**: 280 ha (40 ha nhà kính thành viên chính thức + 240 ha liên kết)
- **Sản lượng**: 4.000 - 4.720 tấn/năm
- **Vùng trồng**: Hòn Bồ (Phường 12), Đạ Sar, Lạc Dương
- **Mã PUC**: Đã đăng ký với Cục BVTV (yêu cầu giám sát định kỳ)

---

## 2. Cấu trúc Phân cấp Dữ liệu

Hệ thống quản lý dữ liệu vùng trồng theo cấu trúc phân cấp từ cao xuống thấp như sau:
1. **HTX** (Hợp tác xã)
2. **VungTrong** (Vùng trồng)
3. **ThuaDat** (Thửa đất - Plot)
4. **MuaVu** (Mùa vụ - Season)
5. **NhatKyCanhTac** (Nhật ký canh tác - Farming Log)

---

## 3. Trạng thái Đối tượng (Status)

### 3.1 Trạng thái Vùng trồng (VungTrong)
- `ACTIVE`: Đang hoạt động bình thường, đáp ứng đủ điều kiện.
- `INACTIVE`: Tạm ngưng hoạt động.
- `UNDER_PUC_REVIEW`: Đang trong quá trình chờ phê duyệt hoặc đánh giá lại mã số vùng trồng (PUC).

### 3.2 Trạng thái Thửa đất (ThuaDat)
- `ACTIVE`: Đang canh tác.
- `IN_QUARANTINE`: Cách ly hóa chất (đang trong thời gian PHI - Pre-Harvest Interval).
- `FALLOW`: Bỏ vụ (nghỉ ngơi để cải tạo đất).
- `INACTIVE`: Không còn sử dụng.

### 3.3 Trạng thái Mùa vụ (MuaVu)
- `PLANNING`: Đang lên kế hoạch (chuẩn bị giống, vật tư, làm đất).
- `ACTIVE`: Đang trong quá trình canh tác, chăm sóc.
- `COMPLETED`: Đã thu hoạch xong, kết thúc mùa vụ.
- `CANCELLED`: Hủy bỏ mùa vụ (do thiên tai, dịch bệnh,...).

---

## 4. Quy ước Đánh mã và Tiêu chuẩn

### 4.1 Mã Thửa đất (Plot Code)
Định dạng: `PLOT-[MaHTX]-[MaXaVien]-[SoThuTu]`
*Ví dụ: PLOT-TANTIEN-XV001-01*

### 4.2 Mã Lô Thu hoạch (Lot ID) - Chuẩn GS1
Định dạng: `LOT-[CoopCode]-[PlotCode]-[YYYYMMDD]-[Seq]`
*Ví dụ: LOT-TT-XV00101-20261015-01*

---

## 5. Kiểm soát Thời gian Cách ly (PHI - Pre-Harvest Interval)

Kiểm soát PHI là quy tắc tối mật để đảm bảo an toàn thực phẩm, đặc biệt đối với ớt chuông sử dụng hóa chất bảo vệ thực vật.

**Công thức tính:**
`safe_harvest_date = spray_date + PHI_days`

**Quy tắc:**
- Hệ thống **chặn hoàn toàn** lệnh thu hoạch nếu `harvest_date < safe_harvest_date`.
- Nếu vi phạm, hệ thống ném ra mã lỗi: `ERR_HARVEST_PHI_VIOLATION`.
- Trạng thái thửa đất tự động chuyển sang `IN_QUARANTINE` trong thời gian PHI.

---

## 6. Nhật Ký Canh Tác Điện Tử

Nhật ký canh tác phải tuân thủ nghiêm ngặt **10 trường dữ liệu** theo quy định tại Thông tư 02/2024/TT-BNNPTNT.

Các trường dữ liệu bao gồm:
1. **Tên hoạt động/loại công việc**: Enum(`LAM_DAT`, `BON_PHAN`, `PHUN_THUOC`, `CHAM_SOC`, `THU_GOM_RAC`)
2. **Ngày thực hiện**: Ngày giờ bắt đầu và kết thúc (YYYY-MM-DD HH:MM).
3. **Mã thửa đất, Mã mùa vụ**: Liên kết định danh.
4. **Mã vật tư/SKU sử dụng**: (Ví dụ: Phân bón NPK 15-15-15, Thuốc BVTV...).
5. **Số lô vật tư**: (Theo dõi theo lô nhập từ hệ thống kho).
6. **Khối lượng/Liều lượng**: Lượng vật tư đã dùng.
7. **Số ngày cách ly (PHI)**: Ghi nhận từ thông tin vật tư.
8. **GPS Tọa độ**: Tự động lấy tọa độ vị trí ghi nhận trên mobile app.
9. **Hình ảnh đính kèm**: Chụp thực tế công việc.
10. **Người ghi nhận + Timestamp hệ thống**: Định danh cán bộ/xã viên thực hiện và thời gian xác thực từ server.

---

## 7. Quy Trình Thu Hoạch & KCS (Kiểm tra chất lượng) 3 Cấp

Tại HTX Tân Tiến, quy trình thu hoạch và KCS thực hiện qua 3 bước:

1. **Gate Check (Cổng nông trường)**:
   - Kiểm tra mã lệnh thu hoạch.
   - Xác thực PHI (Không thu hoạch nếu đang `IN_QUARANTINE`).
   - Ghi nhận và đối chiếu nguồn gốc `lot_id`.
2. **Quick Lab (Phân tích nhanh)**:
   - Test nhanh dư lượng thuốc BVTV, hóa chất trên mẫu đại diện.
   - Trạng thái Lô: `LAB_PASSED` hoặc `LAB_REJECTED`.
3. **Grading (Phân loại chất lượng theo cảm quan)**:
   - Dựa trên thuật toán phân hạng nông sản:
     - **Grade A (Premium)**: ≥90% đồng đều màu sắc, không dị hình, độ Brix ≥ 7°.
     - **Grade B (Standard)**: Đạt chuẩn an toàn (PASSED lab) nhưng không đạt tiêu chí ngoại hình của Grade A.
     - **Reject**: Không đạt tiêu chuẩn an toàn thực phẩm hoặc bị hỏng nặng.

---

## 8. Truy xuất Nguồn gốc (Traceability)

QR Code in trên bao bì sản phẩm sẽ cung cấp trang truy xuất nguồn gốc chứa đủ thông tin theo **Thông tư 02/2024/TT-BNNPTNT**:
- Thông tin cơ sở sản xuất (HTX Tân Tiến, Mã PUC).
- Thông tin sản phẩm (Ớt chuông Sweet Palermo).
- Mã Lô (Lot ID).
- Hành trình canh tác (Summary từ Nhật ký canh tác).
- Chứng nhận chất lượng, kết quả test dư lượng.
- Ngày thu hoạch, ngày đóng gói.

---

## 9. Phân quyền và Vai trò (Permissions & RBAC)

| Vai trò (Role) | Quyền hạn (Permissions) |
| --- | --- |
| **Admin HTX** | Quản lý toàn bộ dữ liệu Vùng trồng, Xã viên, Mùa vụ. Thiết lập tiêu chuẩn KCS. |
| **Cán bộ Khuyến nông** | Tạo mùa vụ, ghi nhận/phê duyệt Nhật ký canh tác, chuyển trạng thái thửa đất (PHI). |
| **Xã viên / Nông dân** | Ghi nhận Nhật ký canh tác (chỉ trên thửa đất của mình), gửi yêu cầu thu hoạch. |
| **KCS / QC** | Thực hiện Gate Check, Quick Lab, và Grading. |
| **Thủ kho** | Tiếp nhận lô nông sản sau khi grading, quản lý xuất kho. |

---

## 10. Sự kiện Hệ thống (Audit Events)

Hệ thống ghi nhận log tự động cho các sự kiện quan trọng (Audit Trail):
- `CROP_AREA_CREATED`: Vùng trồng mới được tạo.
- `PLOT_CREATED`: Thửa đất mới được phân định.
- `SEASON_CREATED`: Mùa vụ mới bắt đầu.
- `FARMING_LOG_RECORDED`: Nhật ký canh tác được thêm mới.
- `HARVEST_RECORDED`: Sự kiện thu hoạch được ghi nhận.
- `LOT_ID_GENERATED`: Lô hàng thu hoạch mới được sinh mã.
- `PHI_VIOLATION_ATTEMPTED`: Có nỗ lực ghi nhận lệnh thu hoạch khi thửa đất đang bị khóa PHI.

---

## 11. Quy tắc Kinh doanh (Business Rules)

| Rule ID | Mô tả Quy tắc | Mức độ (Severity) |
| --- | --- | --- |
| `BR-FARM-001` | **ERR_HARVEST_PHI_VIOLATION**: Chặn hoàn toàn thu hoạch nếu thời điểm thu hoạch nhỏ hơn `safe_harvest_date`. | CRITICAL |
| `BR-FARM-002` | Không thể chuyển trạng thái Mùa vụ sang `COMPLETED` nếu còn lệnh thu hoạch chưa đóng hoặc thửa đất chưa dọn dẹp (FALLOW). | HIGH |
| `BR-FARM-003` | Nhật ký canh tác bắt buộc phải có GPS và Hình ảnh nếu loại công việc là `PHUN_THUOC`. | HIGH |
| `BR-FARM-004` | Số lượng vật tư sử dụng trong Nhật ký canh tác không được vượt quá số lượng xuất kho cho Xã viên đó. | MEDIUM |
| `BR-FARM-005` | Vùng trồng mất mã PUC (chuyển sang `UNDER_PUC_REVIEW`) sẽ không được phép tạo lô hàng chuẩn xuất khẩu (chỉ nội địa). | HIGH |

---

## 12. Liên kết Dữ liệu (Integration & Context)

Quy trình Vùng trồng liên kết chặt chẽ với các module khác:
- **Module Kho Vật Tư**: Lấy thông tin `Mã vật tư`, `Số lô`, kiểm soát định mức xuất kho so với liều lượng sử dụng.
- **Module Tài chính**: Tính toán chi phí sản xuất từng mùa vụ (Cost per Season), ghi nhận chi phí phân bón, thuốc BVTV, nhân công vào giá thành.
- **Module OCOP / Thương mại**: Cung cấp dữ liệu QR code truy xuất nguồn gốc, thông tin chất lượng lô hàng (Grade A/B) để định giá bán ra thị trường.
