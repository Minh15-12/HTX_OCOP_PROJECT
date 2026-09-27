# Quy Trình Nghiệp Vụ: Quản Trị Kho Vật Tư HTX

## 1. Tổng Quan Về Vật Tư (HTX Tân Tiến)
Các nhóm vật tư chính được quản lý trong hệ thống:
- **Nhóm 1: Hạt giống F1 cao cấp**: Sweet Palermo (Enza Zaden/Rijk Zwaan) giá trị từ 135-350 triệu/kg, Capsicum annuum var., YS-201, YS-202.
- **Nhóm 2: Phân bón & Dinh dưỡng**: Phân bón lá, phân tưới nhỏ giọt, Ca-B, pH điều chỉnh.
- **Nhóm 3: Chế phẩm BVTV sinh học**: Chế phẩm nấm Trichoderma, Bacillus subtilis, các loại thuốc sinh học được phép sử dụng.

## 2. Cấu Trúc Phân Hệ Kho
Hệ thống quản trị kho vật tư bao gồm các thực thể cốt lõi sau:
- **Danh mục vật tư (Material Master)**: Chứa thông tin gốc của vật tư (Mã, Tên, Đơn vị tính, Quy cách đóng gói, Hướng dẫn bảo quản).
- **Kho vật tư (Warehouse)**: Địa điểm vật lý hoặc logic lưu trữ vật tư (Kho trung tâm, Kho lạnh, Kho thuốc BVTV).
- **Lô vật tư (Batch/Lot)**: Quản lý chi tiết theo số lô nhà sản xuất (Batch No), Hạn sử dụng (Expiry Date), và Ngày sản xuất.
- **Phiếu nhập kho (Stock Receipt)**: Ghi nhận vật tư nhập vào từ nhà cung cấp hoặc trả lại từ xã viên.
- **Phiếu xuất kho (Stock Issue)**: Ghi nhận vật tư xuất ra sử dụng, có thể là bán đứt thu tiền ngay hoặc xuất nợ (trả chậm) cho xã viên.
- **Phiếu kiểm kê (Stock Count)**: Biên bản ghi nhận số lượng thực tế tại kho so với sổ sách tại một thời điểm.
- **Phiếu điều chỉnh (Stock Adjustment)**: Chứng từ xử lý chênh lệch sau khi kiểm kê (nhập thêm hoặc xuất bớt để khớp thực tế).

## 3. Phương Pháp Xuất Kho
Hệ thống hỗ trợ các phương pháp xuất kho tiêu chuẩn:
- **FEFO (First Expired First Out)**: Là phương pháp chính, ưu tiên xuất các lô vật tư có hạn sử dụng gần nhất để tránh hỏng hóc, hao hụt.
- **FIFO (First In First Out)**: Áp dụng khi vật tư không có hạn sử dụng hoặc các lô có cùng hạn sử dụng (nhập trước xuất trước).

## 4. Điểm Đặt Hàng Lại (Reorder Point - ROP)
Hệ thống tự động cảnh báo khi tồn kho chạm ngưỡng ROP để lên kế hoạch nhập hàng kịp thời:
> **ROP = (Lượng xuất trung bình/ngày × Lead Time) + Safety Stock**
- *Lead Time*: Thời gian từ lúc đặt hàng đến lúc hàng về kho.
- *Safety Stock*: Lượng tồn kho an toàn dự phòng cho rủi ro chậm giao hàng hoặc nhu cầu đột biến.

## 5. Quy Trình KCS 3 Cấp Khi Nhập Kho
Để đảm bảo chất lượng vật tư, đặc biệt là hạt giống đắt tiền, quy trình kiểm tra chất lượng (KCS) gồm 3 bước:
1. **Gate Check (Kiểm tra cổng)**: Nhân viên kho kiểm tra chứng từ (Hóa đơn, Phiếu giao hàng), số lượng vật lý, bao bì, và xác minh nhà cung cấp.
2. **Quick Lab (Test nhanh)**: Bộ phận kỹ thuật lấy mẫu test nhanh độ tinh khiết, tỷ lệ nảy mầm của hạt giống, hoặc đo pH của phân bón/chế phẩm.
3. **Final Acceptance (Nghiệm thu cuối)**: Sau khi đạt chuẩn Quick Lab, Thủ kho ký nhận chính thức, hệ thống cập nhật tăng tồn kho.

## 6. Cơ Chế Xuất Nợ Đầu Vụ (Credit Advance)
Hỗ trợ xã viên trong quá trình canh tác bằng cách ứng trước vật tư:
- Xã viên được phép ứng vật tư đầu vụ và trả chậm vào cuối vụ thu hoạch.
- **Trần tín dụng vật tư**: Được cấu hình riêng cho từng xã viên dựa trên diện tích canh tác, uy tín, và lịch sử hợp tác.
- **Lãi suất nội bộ**: Thường là 0% đối với xã viên chính thức như một chính sách ưu đãi, hoặc áp dụng mức lãi suất nội bộ theo quy định của Đại hội thành viên.
- Khi xuất kho nợ, hệ thống tự động tạo một khoản **Phải thu (Receivable)** liên kết với mã xã viên tương ứng.

## 7. Thuật Toán Cấn Trừ Công Nợ Khi Quyết Toán Mùa Vụ
Khi thu mua nông sản của xã viên vào cuối vụ, hệ thống tự động tính toán để cấn trừ công nợ vật tư:
- **Giá trị nông sản (V_total)**: `V_total = (V_gradeA × P_A) + (V_gradeB × P_B)` (Sản lượng từng loại nhân với đơn giá).
- **Phí dịch vụ HTX (Fee)**: `Fee = V_total × r` (Trong đó `r` là tỷ lệ phí dịch vụ, ví dụ 2-3%, có thể cấu hình được).
- **Công nợ cấn trừ (D)**: `D = min(D_debt, V_total - Fee)` (Số tiền cấn trừ không vượt quá công nợ hiện tại hoặc giá trị nông sản sau khi trừ phí).
- **Thực trả xã viên (P_net)**: `P_net = V_total - Fee - D` (Tiền mặt/chuyển khoản trả cho xã viên).

## 8. Quy Trình Trạng Thái Chứng Từ Kho

### Trạng Thái Phiếu Nhập Kho:
- `DRAFT`: Đang tạo nháp, chưa gửi yêu cầu.
- `PENDING_INSPECTION`: Đang chờ kiểm tra KCS (Gate Check, Quick Lab).
- `ACCEPTED`: Đã nghiệm thu thành công, tồn kho tăng.
- `REJECTED`: Bị từ chối do không đạt chất lượng KCS, hàng trả lại NCC.

### Trạng Thái Phiếu Xuất Kho:
- `PENDING`: Yêu cầu xuất kho đã được tạo, chờ duyệt.
- `ISSUED`: Đã xuất kho thành công, tồn kho giảm (ghi nhận công nợ nếu xuất nợ).
- `SETTLED`: Đã hoàn tất cấn trừ thanh toán (áp dụng cho phiếu xuất nợ).
- `CANCELLED`: Yêu cầu xuất kho bị hủy bỏ.

## 9. Quy Trình Kiểm Kê Kho
- **Khóa giao dịch**: Hệ thống tạm khóa các giao dịch nhập/xuất trong cùng phiên bản kiểm kê đối với kho/nhóm vật tư đang kiểm kê để đảm bảo tính toàn vẹn.
- **Tính toán chênh lệch**: Hệ thống tự động so sánh số lượng đếm được (`Actual`) với số lượng trên sổ sách (`Book`).
- **Phê duyệt**: Các chênh lệch (nếu có) phải được đính kèm giải trình và chuyển lên Ban Giám đốc phê duyệt.
- **Điều chỉnh**: Tự động sinh `Phiếu điều chỉnh kho` sau khi biên bản kiểm kê được phê duyệt để đồng bộ số liệu.

## 10. Kiểm Soát Hoạt Chất Cấm
Vì mục tiêu canh tác an toàn và đạt chuẩn OCOP:
- Hệ thống duy trì và đối chiếu với danh mục thuốc BVTV được phép sử dụng của Bộ NN&PTNT.
- Trả về lỗi `ERR_SUPPLY_PROHIBITED_SUBSTANCE` nếu cố tình tạo danh mục hoặc nhập kho vật tư có chứa hoạt chất cấm (danh mục cấm).
- Tự động **gửi cảnh báo vi phạm** đến Giám đốc HTX qua SMS/Notification.

## 11. Phân Quyền & RBAC (Role-Based Access Control)
- **Storekeeper (Thủ kho)**: Tạo phiếu nhập/xuất, thực hiện Gate Check, Final Acceptance, tạo biên bản kiểm kê.
- **Technician (Kỹ thuật viên)**: Thực hiện Quick Lab KCS, phê duyệt chất lượng vật tư nhập.
- **Accountant (Kế toán)**: Theo dõi công nợ vật tư, thực hiện quyết toán cấn trừ đầu ra.
- **Manager (Giám đốc HTX)**: Phê duyệt phiếu điều chỉnh kho, xét duyệt trần tín dụng cho xã viên, nhận cảnh báo vật tư cấm.
- **Member (Xã viên)**: Xem lịch sử nhận vật tư, theo dõi công nợ cá nhân của mình.

## 12. Audit Events
Hệ thống log lại toàn bộ các sự kiện quan trọng để truy vết:
- `MATERIAL_CREATED`: Khởi tạo danh mục vật tư mới.
- `STOCK_RECEIPT_CREATED`: Tạo yêu cầu nhập kho.
- `STOCK_RECEIPT_ACCEPTED`: Hoàn tất nghiệm thu nhập kho.
- `STOCK_ISSUED`: Hoàn tất xuất kho (trả tiền ngay).
- `STOCK_ISSUED_ON_CREDIT`: Hoàn tất xuất kho nợ (trả chậm).
- `STOCK_COUNT_INITIATED`: Bắt đầu phiên kiểm kê kho.
- `STOCK_ADJUSTMENT_APPROVED`: Phê duyệt phiếu điều chỉnh kho.

## 13. Business Rules (Quy Tắc Nghiệp Vụ)
- `INV-RULE-001`: Không được phép xuất kho nếu số lượng tồn của Lô (Batch) nhỏ hơn số lượng yêu cầu (Ngăn âm kho).
- `INV-RULE-002`: Phải chọn Lô có hạn sử dụng gần nhất theo nguyên tắc FEFO.
- `INV-RULE-003`: Không được cấp vật tư nợ nếu (Công nợ hiện tại + Giá trị đơn hàng mới) vượt quá Trần tín dụng (Credit Limit) của xã viên.
- `INV-RULE-004`: Lãi suất xuất nợ phải nằm trong khoảng cho phép theo thiết lập của HTX (mặc định 0%).
- `INV-RULE-005`: Phiếu kiểm kê đang mở thì không cho phép tạo phiếu nhập/xuất cho các mặt hàng nằm trong danh sách kiểm kê đó.

## 14. Liên Kết Với Các Phân Hệ Khác
- **Nhật ký canh tác (Farm Diary)**: Ghi nhận lượng vật tư thực tế (hạt giống, phân bón, thuốc) đã sử dụng xuống đồng ruộng, trừ trực tiếp từ vật tư xã viên đã nhận.
- **Tài chính - Kế toán (Finance)**: Đồng bộ công nợ phải thu (Receivable) khi xuất nợ và xử lý cấn trừ (Clearing) khi thu mua nông sản.
- **OCOP & Truy xuất nguồn gốc**: Cung cấp minh chứng điện tử về nguồn gốc hạt giống, lịch sử phun thuốc, bón phân phục vụ cấp mã số vùng trồng hoặc chấm điểm OCOP.
