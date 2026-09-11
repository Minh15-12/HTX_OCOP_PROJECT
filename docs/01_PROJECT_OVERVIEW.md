# 01. THÔNG TIN TỔNG QUAN DỰ ÁN

## 1.1. Thông tin cơ bản

**Tên đề tài:**  
**Xây dựng Hệ thống quản lý hoạt động Hợp tác xã nông nghiệp và số hóa hồ sơ đánh giá phân hạng OCOP**

**Tên viết tắt đề xuất:**  
**HTX-OCOP Management System**

**Loại hệ thống:**  
Ứng dụng web quản lý nghiệp vụ.

**Đối tượng triển khai:**  
Hợp tác xã nông nghiệp và các cá nhân/bộ phận được HTX phân quyền sử dụng hệ thống.

**Định hướng hệ thống:**  
Số hóa hoạt động quản lý nội bộ của HTX nông nghiệp, đồng thời số hóa quá trình chuẩn bị, quản lý, đánh giá và hoàn thiện hồ sơ phục vụ đánh giá, phân hạng sản phẩm OCOP.

---

## 1.2. Bối cảnh và vấn đề cần giải quyết

Hoạt động quản lý tại các hợp tác xã nông nghiệp liên quan đến nhiều loại thông tin và nghiệp vụ như:

- Quản lý danh sách và thông tin xã viên.
- Quản lý vùng trồng, diện tích và hoạt động sản xuất.
- Quản lý mùa vụ và nhật ký sản xuất.
- Quản lý kho, vật tư và các giao dịch nhập – xuất.
- Theo dõi các khoản thu – chi.
- Theo dõi sản lượng và kết quả sản xuất.
- Phân chia lợi nhuận theo quy định và cơ chế của HTX.
- Quản lý sản phẩm của HTX.
- Chuẩn bị hồ sơ đánh giá, phân hạng OCOP.
- Quản lý các tiêu chí đánh giá và minh chứng tương ứng.
- Theo dõi tình trạng hoàn thiện hồ sơ.
- Quản lý quá trình kiểm tra, duyệt và bổ sung hồ sơ.

Nếu các hoạt động trên được thực hiện chủ yếu bằng sổ sách, bảng tính, hồ sơ giấy hoặc các tệp rời rạc, việc tổng hợp dữ liệu, kiểm tra tính đầy đủ của hồ sơ, truy xuất lịch sử thay đổi và lập báo cáo sẽ khó khăn.

Dự án hướng tới việc xây dựng một hệ thống tập trung nhằm quản lý thống nhất dữ liệu và quy trình nghiệp vụ của HTX, đồng thời tạo nền tảng số hóa hồ sơ OCOP.

---

## 1.3. Mục tiêu tổng quát

Xây dựng một hệ thống web hỗ trợ HTX nông nghiệp:

1. Số hóa dữ liệu và hoạt động quản lý HTX.
2. Quản lý tập trung thông tin xã viên, vùng trồng, mùa vụ, vật tư và các nghiệp vụ liên quan.
3. Quản lý các giao dịch thu – chi và hỗ trợ theo dõi/phân chia lợi nhuận.
4. Số hóa quy trình chuẩn bị hồ sơ đánh giá, phân hạng OCOP.
5. Quản lý bộ tiêu chí OCOP và các minh chứng tương ứng.
6. Hỗ trợ chấm điểm và theo dõi tiến độ hoàn thiện hồ sơ.
7. Quản lý quy trình phê duyệt, bổ sung và hoàn thiện hồ sơ.
8. Đảm bảo khả năng truy vết lịch sử thay đổi thông qua nhật ký kiểm toán.
9. Hỗ trợ kết xuất báo cáo và bộ hồ sơ phục vụ quản lý, lưu trữ và trình diễn/nghiệm thu.
10. Đảm bảo tính chính xác, toàn vẹn, bảo mật dữ liệu và khả năng sao lưu/phục hồi.

---

## 1.4. Các mục tiêu cụ thể

### Mục tiêu 1 – Số hóa quản lý HTX

Xây dựng cơ sở dữ liệu tập trung để quản lý:

- Thông tin HTX.
- Xã viên.
- Vốn góp.
- Vùng trồng.
- Mùa vụ.
- Cây trồng/vật nuôi nếu có.
- Sản phẩm.
- Vật tư.
- Kho.
- Nhật ký nghiệp vụ.
- Thu – chi.
- Sản lượng.
- Phân chia lợi nhuận.

### Mục tiêu 2 – Số hóa hoạt động sản xuất

Cho phép HTX theo dõi mối quan hệ giữa:

**Xã viên → Vùng trồng → Mùa vụ → Hoạt động sản xuất → Vật tư → Sản lượng → Sản phẩm**

Từ đó hình thành dữ liệu có khả năng truy xuất và tổng hợp.

### Mục tiêu 3 – Số hóa hồ sơ OCOP

Hệ thống phải hỗ trợ:

- Quản lý sản phẩm tham gia OCOP.
- Quản lý bộ tiêu chí.
- Quản lý nhóm tiêu chí.
- Quản lý chỉ tiêu/tiêu chí đánh giá.
- Nhập điểm đánh giá.
- Quản lý minh chứng.
- Theo dõi tình trạng minh chứng.
- Theo dõi mức độ hoàn thiện hồ sơ.
- Quản lý phiên bản hồ sơ.
- Theo dõi lịch sử chỉnh sửa.
- Quản lý trạng thái hồ sơ.

### Mục tiêu 4 – Kiểm soát quy trình

Hệ thống phải hỗ trợ các trạng thái và quy trình nghiệp vụ phù hợp với thực tế, bao gồm:

- Tạo mới.
- Soạn thảo.
- Gửi duyệt.
- Đang kiểm tra.
- Yêu cầu bổ sung/chỉnh sửa.
- Gửi lại.
- Phê duyệt.
- Hoàn thành.

Quy trình thực tế phải được xác định dựa trên kết quả khảo sát và tài liệu do đơn vị cung cấp, không được tự ý giả định khi chưa có căn cứ.

### Mục tiêu 5 – Quản trị và truy vết

Hệ thống cần có:

- Phân quyền người dùng.
- Kiểm soát quyền truy cập chức năng.
- Kiểm soát quyền truy cập dữ liệu.
- Nhật ký hoạt động.
- Nhật ký kiểm toán.
- Theo dõi người tạo, người sửa và thời điểm thay đổi.
- Quản lý phiên bản đối với các dữ liệu/hồ sơ cần thiết.

---

## 1.5. Phạm vi chức năng dự kiến

### A. Quản lý hệ thống

- Đăng nhập/đăng xuất.
- Quản lý tài khoản.
- Quản lý vai trò.
- Phân quyền.
- Cấu hình hệ thống.
- Nhật ký hoạt động.
- Nhật ký kiểm toán.

### B. Quản lý HTX

- Thông tin HTX.
- Cơ cấu tổ chức.
- Danh mục nền.
- Đơn vị tính.
- Loại giao dịch.
- Các danh mục phục vụ nghiệp vụ.

### C. Quản lý xã viên

- Hồ sơ xã viên.
- Trạng thái xã viên.
- Thông tin tham gia HTX.
- Vốn góp.
- Lịch sử thay đổi thông tin.
- Quan hệ xã viên với vùng trồng và hoạt động sản xuất.

### D. Quản lý vùng trồng

- Thông tin vùng trồng.
- Chủ sở hữu/người phụ trách.
- Diện tích.
- Vị trí.
- Loại cây trồng.
- Mùa vụ.
- Lịch sử canh tác.
- Hoạt động sản xuất.
- Dữ liệu phục vụ truy xuất.

### E. Quản lý mùa vụ và sản xuất

- Tạo mùa vụ.
- Gán vùng trồng.
- Ghi nhận hoạt động sản xuất.
- Ghi nhận vật tư sử dụng.
- Ghi nhận sản lượng.
- Ghi nhận thu hoạch.
- Nhật ký sản xuất.

### F. Quản lý kho và vật tư

- Danh mục vật tư.
- Kho.
- Nhập kho.
- Xuất kho.
- Điều chỉnh tồn kho.
- Theo dõi tồn kho.
- Lịch sử giao dịch.
- Gắn vật tư với hoạt động sản xuất.

### G. Quản lý tài chính nghiệp vụ

- Khoản thu.
- Khoản chi.
- Danh mục thu – chi.
- Giao dịch.
- Tổng hợp thu – chi.
- Theo dõi kết quả hoạt động.
- Tính toán/hỗ trợ phân chia lợi nhuận theo quy tắc được xác định trong nghiệp vụ thực tế.

### H. Quản lý sản phẩm

- Danh mục sản phẩm.
- Thông tin sản phẩm.
- Nguồn nguyên liệu.
- Quy trình sản xuất.
- Sản lượng.
- Hồ sơ liên quan.

### I. Quản lý hồ sơ OCOP

- Danh sách hồ sơ.
- Sản phẩm OCOP.
- Bộ tiêu chí.
- Nhóm tiêu chí.
- Tiêu chí/chỉ tiêu.
- Điểm đánh giá.
- Minh chứng.
- Phiên bản hồ sơ.
- Trạng thái hoàn thiện.
- Lịch sử thay đổi.
- Quy trình duyệt.

### J. Báo cáo và kết xuất

- Dashboard quản trị.
- Báo cáo xã viên.
- Báo cáo vùng trồng.
- Báo cáo vật tư.
- Báo cáo sản xuất.
- Báo cáo thu – chi.
- Báo cáo lợi nhuận.
- Báo cáo tiến độ hồ sơ OCOP.
- Báo cáo điểm OCOP.
- Kết xuất PDF.
- Kết xuất Word.
- Kết xuất dữ liệu theo định dạng phù hợp.

---

## 1.6. Phạm vi dữ liệu chính

Các nhóm dữ liệu chính dự kiến gồm:

```text
HTX
 ├── Người dùng
 ├── Vai trò & quyền
 ├── Xã viên
 │    └── Vốn góp
 │
 ├── Vùng trồng
 │    └── Mùa vụ
 │         └── Nhật ký sản xuất
 │
 ├── Vật tư
 │    └── Giao dịch kho
 │
 ├── Sản phẩm
 │    └── Hồ sơ sản phẩm
 │
 ├── Thu – Chi
 │
 ├── Phân chia lợi nhuận
 │
 └── Hồ sơ OCOP
      ├── Bộ tiêu chí
      ├── Tiêu chí
      ├── Điểm đánh giá
      ├── Minh chứng
      ├── Phiên bản
      └── Lịch sử xử lý
```

Đây là mô hình khái niệm ban đầu. Database schema chính thức chỉ được xác định sau khi hoàn thành phân tích nghiệp vụ và yêu cầu chi tiết.

---

## 1.7. Đối tượng sử dụng dự kiến

Hệ thống dự kiến có các nhóm người dùng:

### System Administrator

Quản trị hệ thống ở cấp kỹ thuật:

- Quản lý tài khoản.
- Quản lý vai trò.
- Phân quyền.
- Cấu hình.
- Theo dõi nhật ký hệ thống.

### Quản trị/ban quản lý HTX

Quản lý hoạt động của HTX:

- Quản lý xã viên.
- Quản lý vùng trồng.
- Quản lý sản xuất.
- Quản lý vật tư.
- Quản lý thu – chi.
- Theo dõi báo cáo.
- Quản lý hồ sơ OCOP.

### Cán bộ HTX

Thực hiện nghiệp vụ hàng ngày:

- Nhập dữ liệu.
- Cập nhật nghiệp vụ.
- Quản lý kho.
- Ghi nhận sản xuất.
- Quản lý hồ sơ.

### Xã viên

Có thể được cấp quyền để:

- Xem/cập nhật thông tin cá nhân trong phạm vi cho phép.
- Xem vùng trồng được quản lý.
- Ghi nhận hoặc cung cấp thông tin sản xuất nếu nghiệp vụ thực tế yêu cầu.
- Theo dõi các thông tin liên quan đến mình.

### Người phụ trách OCOP/đánh giá hồ sơ

- Quản lý hồ sơ OCOP.
- Quản lý tiêu chí.
- Nhập/chỉnh sửa điểm.
- Quản lý minh chứng.
- Kiểm tra mức độ hoàn thiện.
- Gửi duyệt/yêu cầu bổ sung theo quyền được cấp.

**Lưu ý:** Danh sách role chính thức và ma trận phân quyền phải được xác định sau khi khảo sát nghiệp vụ thực tế.

---

## 1.8. Phạm vi ngoài dự kiến

Trong phiên bản đầu tiên, hệ thống không mặc định bao gồm:

- Sàn thương mại điện tử.
- Thanh toán trực tuyến.
- Quản lý vận chuyển/giao hàng.
- Hệ thống kế toán doanh nghiệp đầy đủ.
- Hệ thống ERP toàn diện.
- AI dự đoán năng suất.
- AI tự động chấm điểm OCOP thay cho người đánh giá.
- IoT cảm biến nông nghiệp.
- Ứng dụng mobile native.

Các chức năng trên chỉ được bổ sung nếu có yêu cầu chính thức.

---

## 1.9. Định hướng kiến trúc và công nghệ

Hệ thống được định hướng xây dựng theo mô hình web application, có khả năng triển khai bằng container.

### Frontend

Một trong hai lựa chọn:

- React
- Vue

Framework/thư viện cụ thể phải được thống nhất trước khi triển khai.

### Backend

Một trong hai lựa chọn:

- Laravel
- FastAPI

### Database

- PostgreSQL

### File Storage

- MinIO hoặc giải pháp lưu trữ tệp tương đương.

Hệ thống cần đặc biệt chú ý đến bảo mật và quyền truy cập đối với các tệp minh chứng OCOP.

### Document Generation

Sử dụng công cụ phù hợp để:

- Sinh PDF.
- Sinh DOCX.
- Kết xuất theo mẫu.
- Ghép dữ liệu hệ thống vào biểu mẫu.

### Deployment

- Docker.
- Nginx.
- Git/GitHub.

---

## 1.10. Yêu cầu phi chức năng cấp cao

### Tính đúng đắn

Dữ liệu nghiệp vụ phải được kiểm tra tính hợp lệ và đảm bảo tính toàn vẹn.

### Bảo mật

- Xác thực người dùng.
- Phân quyền.
- Kiểm soát truy cập API.
- Kiểm soát quyền truy cập file.
- Không cho phép người dùng truy cập trực tiếp các tài liệu không thuộc quyền.
- Bảo vệ dữ liệu nhạy cảm.

### Auditability

Các thao tác quan trọng phải có khả năng truy vết:

```text
Ai thực hiện?
Thực hiện thao tác gì?
Đối tượng nào?
Thời điểm nào?
Dữ liệu trước/sau thay đổi nếu cần?
```

### Sao lưu và phục hồi

Hệ thống phải có phương án:

- Backup database.
- Backup file minh chứng.
- Khôi phục dữ liệu.
- Kiểm tra khả năng phục hồi.

### Khả năng mở rộng

Kiến trúc cần cho phép mở rộng thêm:

- Nhiều HTX.
- Nhiều sản phẩm.
- Nhiều bộ tiêu chí.
- Nhiều loại hồ sơ.
- Các module nghiệp vụ khác.

---

## 1.11. Kết quả đầu ra dự kiến

Sau khi hoàn thành, dự án dự kiến cung cấp:

### Phần mềm

Một hệ thống web có khả năng:

- Quản lý HTX.
- Quản lý xã viên.
- Quản lý vùng trồng.
- Quản lý mùa vụ.
- Quản lý sản xuất.
- Quản lý vật tư/kho.
- Quản lý thu – chi.
- Theo dõi/phân chia lợi nhuận.
- Quản lý sản phẩm.
- Quản lý hồ sơ OCOP.
- Chấm điểm OCOP.
- Quản lý minh chứng.
- Theo dõi trạng thái hồ sơ.
- Duyệt hồ sơ.
- Nhắc việc.
- Audit log.
- Báo cáo.
- Kết xuất PDF/DOCX.

### Tài liệu

- Tài liệu phân tích nghiệp vụ.
- Tài liệu yêu cầu hệ thống.
- Tài liệu kiến trúc.
- Thiết kế cơ sở dữ liệu.
- API documentation.
- Tài liệu hướng dẫn sử dụng.
- Tài liệu triển khai.
- Tài liệu kiểm thử.
- Báo cáo kết quả kiểm thử.

### Mã nguồn

- Source code frontend.
- Source code backend.
- Database migration/schema.
- Seed/sample data.
- Docker configuration.
- Deployment configuration.

---

## 1.12. Kế hoạch triển khai dự kiến

| Thời gian | Nội dung |
|---|---|
| Tuần 1–2 | Khảo sát quy trình HTX, biểu mẫu và tiêu chí OCOP |
| Tuần 3 | Mô hình hóa nghiệp vụ, phân quyền, CSDL và kiến trúc |
| Tuần 4–5 | Phát triển xã viên, vùng trồng và danh mục nền |
| Tuần 6–7 | Phát triển vật tư, nhật ký giao dịch và phân chia lợi nhuận |
| Tuần 8–9 | Số hóa tiêu chí OCOP, chấm điểm và quản lý minh chứng |
| Tuần 10 | Luồng duyệt, nhắc việc và nhật ký kiểm toán |
| Tuần 11 | Kết xuất PDF/Word, báo cáo và thống kê |
| Tuần 12 | Kiểm thử dữ liệu, bảo mật, sao lưu và phục hồi |
| Tuần 13 | Triển khai thử nghiệm và hướng dẫn sử dụng |
| Tuần 14 | Nghiệm thu, trình diễn và hoàn thiện báo cáo |

---

## 1.13. Nguyên tắc phát triển quan trọng

AI Agent và đội phát triển phải tuân thủ các nguyên tắc sau:

1. **Nghiệp vụ thực tế là nguồn ưu tiên cao nhất.**
2. Không tự ý suy diễn quy trình nghiệp vụ khi chưa có căn cứ.
3. Không tự ý thay đổi business rules đã được xác nhận.
4. Không tự ý mở rộng phạm vi dự án.
5. Không hard-code các dữ liệu nghiệp vụ có khả năng thay đổi.
6. Các tiêu chí OCOP phải được quản lý theo cấu hình/dữ liệu thay vì hard-code nếu yêu cầu thực tế cho phép.
7. Tài liệu, database, API và source code phải nhất quán.
8. Mọi thay đổi lớn đối với kiến trúc hoặc database phải được xác nhận trước.
9. Các chức năng quan trọng phải có validation và acceptance criteria.
10. Dữ liệu minh chứng phải được bảo vệ theo quyền truy cập.
11. Các nghiệp vụ quan trọng phải có khả năng truy vết.
12. Khi thiếu thông tin nghiệp vụ quan trọng, Agent phải **đánh dấu ASSUMPTION hoặc hỏi lại**, không tự coi giả định là yêu cầu chính thức.

---

## 1.14. Trạng thái của tài liệu

Tài liệu này là **Project Overview cấp cao**.

Các nội dung như:

- Business Process chi tiết.
- Use Case.
- Business Rules chi tiết.
- Database Schema chính thức.
- API Contract.
- UI Specification.
- Ma trận phân quyền chính thức.
- Tiêu chí OCOP chính thức.
- Biểu mẫu hồ sơ chính thức.

sẽ được đặc tả trong các tài liệu chuyên biệt tiếp theo.

**Nguyên tắc:** Không sử dụng tài liệu tổng quan này để tự suy diễn các quy tắc nghiệp vụ chi tiết chưa được xác nhận.