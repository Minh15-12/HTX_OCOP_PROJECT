# 03_BUSINESS_PROCESSES.md

## 1. Thông tin tài liệu

- **Dự án:** Xây dựng Hệ thống quản lý hoạt động Hợp tác xã nông nghiệp và số hóa hồ sơ đánh giá, phân hạng OCOP
- **Mục đích tài liệu:** Chuẩn hóa các quy trình nghiệp vụ được tổng hợp từ kết quả nghiên cứu A–F, làm cơ sở cho Business Requirement, Functional Requirement và Use Case.
- **Nguồn chính:** Báo cáo tổng hợp `Quản lý Hợp tác xã và Số hóa Hồ sơ OCOP.docx` và tài liệu đặc tả nghiệp vụ OCOP.
- **Trạng thái:** DRAFT – PENDING VALIDATION
- **Nguyên tắc:** Nội dung có trong nguồn nhưng chưa đủ căn cứ pháp lý/thực tế được đánh dấu `TO_VERIFY`; nội dung đề xuất số hóa được tách khỏi Business Process.

### Quy ước trạng thái

| Nhãn | Ý nghĩa |
|---|---|
| `CONFIRMED` | Có căn cứ trực tiếp trong nguồn nghiên cứu |
| `INFERRED` | Suy luận từ nguồn, chưa được xác nhận trực tiếp |
| `PROPOSED` | Đề xuất của nhóm phân tích/hệ thống |
| `TO_VERIFY` | Cần xác minh với HTX hoặc văn bản hiện hành |
| `CONFLICT` | Các nguồn có thông tin chưa thống nhất |
| `UNKNOWN` | Chưa đủ thông tin |

> **Lưu ý:** Tài liệu này không coi các kết quả do NotebookLM suy luận là quy định pháp lý cuối cùng. Các con số, điều kiện và thẩm quyền pháp lý phải được xác minh trước khi chuyển thành Business Rule chính thức.

---

# 2. Tổng quan chuỗi nghiệp vụ

Chuỗi nghiệp vụ cấp cao được tổng hợp từ các tài liệu:

```text
HTX
  │
  ├── Quản lý xã viên
  │       │
  │       └── Vốn góp
  │
  ├── Quản lý vùng trồng
  │       │
  │       └── Mùa vụ
  │               │
  │               └── Hoạt động sản xuất
  │                       │
  │                       └── Thu hoạch / Lô sản phẩm
  │
  ├── Quản lý vật tư / kho
  │
  ├── Thu – Chi / Công nợ
  │       │
  │       └── Phân chia lợi nhuận / thặng dư
  │
  ├── Quản lý sản phẩm
  │
  └── Hồ sơ OCOP
          │
          ├── Tiêu chí
          ├── Tự đánh giá
          ├── Minh chứng
          ├── Kiểm tra / đánh giá
          └── Kết quả / hồ sơ
```

Quan hệ này là **mô hình quan hệ nghiệp vụ khái niệm**, chưa phải ERD hoặc thiết kế database.

---

# 3. Danh mục Business Process

| Process ID | Tên quy trình | Nhóm | Mức độ | Trạng thái phân tích |
|---|---|---|---|---|
| BP-MEM-001 | Quản lý xã viên | HTX | CORE | CONFIRMED |
| BP-MEM-002 | Quản lý vốn góp | HTX | CORE | CONFIRMED |
| BP-CROP-001 | Quản lý vùng trồng | Sản xuất | CORE | CONFIRMED |
| BP-SEASON-001 | Quản lý mùa vụ | Sản xuất | CORE | CONFIRMED |
| BP-PROD-001 | Ghi nhận hoạt động sản xuất | Sản xuất | CORE | CONFIRMED |
| BP-HARVEST-001 | Ghi nhận thu hoạch | Sản xuất | CORE | INFERRED / TO_VERIFY |
| BP-INV-001 | Nhập kho vật tư | Kho | CORE | CONFIRMED |
| BP-INV-002 | Xuất kho vật tư | Kho | CORE | CONFIRMED |
| BP-INV-003 | Kiểm kê và xử lý chênh lệch kho | Kho | CORE | CONFIRMED |
| BP-FIN-001 | Ghi nhận thu – chi | Tài chính | CORE | CONFIRMED |
| BP-FIN-002 | Quản lý công nợ xã viên | Tài chính | CORE | CONFIRMED |
| BP-FIN-003 | Phân chia lợi nhuận / thặng dư | Tài chính | CORE | TO_VERIFY |
| BP-PRODUCT-001 | Quản lý sản phẩm | Sản phẩm | CORE | CONFIRMED |
| BP-OCOP-001 | Chuẩn bị và khởi tạo hồ sơ OCOP | OCOP | CORE | CONFIRMED |
| BP-OCOP-002 | Quản lý bộ tiêu chí OCOP | OCOP | CORE | CONFIRMED |
| BP-OCOP-003 | Tự đánh giá / chấm điểm hồ sơ | OCOP | CORE | CONFIRMED |
| BP-OCOP-004 | Quản lý minh chứng | OCOP | CORE | CONFIRMED |
| BP-OCOP-005 | Kiểm tra và bổ sung hồ sơ | OCOP | CORE | CONFIRMED |
| BP-OCOP-006 | Đánh giá / chấm điểm của cơ quan, hội đồng | OCOP | CORE | TO_VERIFY |
| BP-OCOP-007 | Quản lý kết quả và hiệu lực hồ sơ | OCOP | CORE | TO_VERIFY |
| BP-OCOP-008 | Kết xuất hồ sơ / báo cáo OCOP | OCOP | CORE | PROPOSED |

---

# 4. BP-MEM-001 – Quản lý xã viên

## 4.1 Purpose

Quản lý vòng đời xã viên từ tiếp nhận hồ sơ gia nhập, xem xét/phê duyệt, ghi nhận tư cách thành viên đến thay đổi hoặc chấm dứt tư cách.

## 4.2 Actors

- Người đề nghị gia nhập / xã viên.
- Hội đồng quản trị / Ban quản trị HTX.
- Kế toán.
- Các bộ phận có trách nhiệm kiểm tra hồ sơ.

## 4.3 Trigger

- Có người/tổ chức đề nghị gia nhập HTX.
- Có yêu cầu cập nhật thông tin xã viên.
- Có yêu cầu chấm dứt tư cách thành viên.

## 4.4 Inputs

- Thông tin hành chính.
- CCCD hoặc thông tin pháp nhân.
- Đơn tự nguyện xin gia nhập.
- Số vốn cam kết góp.
- Tài liệu liên quan khác theo Điều lệ/ quy trình của HTX.

## 4.5 Main Flow

```text
1. Người đề nghị cung cấp hồ sơ.
2. Bộ phận có trách nhiệm tiếp nhận và kiểm tra hồ sơ.
3. HTX xem xét điều kiện gia nhập.
4. Cơ quan/người có thẩm quyền của HTX quyết định kết nạp.
5. Kế toán ghi nhận vốn góp thực tế khi phát sinh.
6. Cập nhật sổ đăng ký thành viên.
7. Cấp/ghi nhận giấy chứng nhận phần vốn góp nếu đủ điều kiện.
```

## 4.6 Business Rules

| Rule | Nội dung | Status |
|---|---|---|
| BR-MEM-001 | Điều kiện gia nhập phải tuân theo Luật HTX, Điều lệ và quy định của HTX. | TO_VERIFY |
| BR-MEM-002 | Thông tin xã viên phải được lưu và cập nhật có khả năng truy vết. | CONFIRMED |
| BR-MEM-003 | Các giới hạn tỷ lệ vốn góp được NotebookLM trích dẫn từ Luật HTX phải được đối chiếu lại với văn bản hiện hành trước khi triển khai. | TO_VERIFY |

## 4.7 Outputs

- Hồ sơ xã viên.
- Tư cách xã viên.
- Sổ đăng ký thành viên được cập nhật.
- Thông tin vốn góp liên quan.

## 4.8 Status

```text
DRAFT
  ↓
PENDING_APPROVAL
  ↓
ACTIVE
  ↓
PENDING_TERMINATION
  ↓
TERMINATED
```

Đây là trạng thái đề xuất chuẩn hóa từ báo cáo; cần xác nhận lại với quy trình thực tế của HTX.

## 4.9 Exceptions

- Hồ sơ thiếu hoặc không hợp lệ.
- Thông tin định danh trùng hoặc sai.
- Góp vốn bằng tài sản chưa hoàn tất thủ tục.
- Yêu cầu chấm dứt tư cách nhưng còn nghĩa vụ tài chính.

## 4.10 System Opportunities

Các chức năng dưới đây là **PROPOSED**, không phải business process:

- Kiểm tra trùng thông tin định danh.
- Theo dõi tình trạng hồ sơ.
- Tự động tính tỷ lệ vốn góp.
- Nhắc việc đối với hồ sơ đang chờ xử lý.
- Lưu lịch sử thay đổi.

---

# 5. BP-MEM-002 – Quản lý vốn góp

## Purpose

Theo dõi cam kết góp vốn, vốn đã góp, các biến động vốn góp và thông tin chứng nhận phần vốn góp.

## Actors

- Xã viên.
- Kế toán.
- Hội đồng quản trị / người có thẩm quyền.

## Main Flow

```text
1. Xác định mức vốn cam kết.
2. Ghi nhận lần góp vốn thực tế.
3. Nếu góp bằng tài sản, thực hiện định giá và thủ tục liên quan.
4. Đối chiếu số đã góp với cam kết.
5. Cập nhật hồ sơ vốn góp.
6. Xử lý biến động vốn theo quyết định hợp lệ.
```

## Inputs

- Cam kết góp vốn.
- Chứng từ nộp tiền.
- Hồ sơ tài sản góp vốn nếu có.
- Quyết định/biên bản liên quan.

## Outputs

- Lịch sử góp vốn.
- Số vốn thực góp.
- Chứng từ liên quan.

## Business Rules

- Mức vốn và giới hạn vốn phải căn cứ Luật HTX và Điều lệ HTX hiện hành.
- Các con số pháp lý trong báo cáo nghiên cứu cần được `TO_VERIFY` trước khi hard-code.

---

# 6. BP-CROP-001 – Quản lý vùng trồng

## Purpose

Quản lý thông tin vùng trồng phục vụ quản lý sản xuất và, khi có nhu cầu, hỗ trợ hồ sơ/mã số vùng trồng theo quy định chuyên ngành.

## Actors

- HTX.
- Cán bộ kỹ thuật.
- Xã viên / hộ liên kết.
- Cơ quan chuyên môn khi thực hiện thủ tục quản lý nhà nước.

## Inputs

- Thông tin vùng trồng.
- Thông tin thửa đất.
- Thông tin chủ sử dụng/liên kết.
- Tọa độ/ranh giới nếu có.
- Hồ sơ chuyên ngành nếu vùng trồng thực hiện thủ tục cấp mã.

## Main Flow

```text
1. Khai báo vùng trồng.
2. Gắn vùng trồng với các thửa đất/hộ sản xuất.
3. Ghi nhận thông tin địa lý.
4. Theo dõi tình trạng vùng trồng.
5. Nếu có thủ tục mã số vùng trồng: lập và quản lý hồ sơ chuyên ngành.
6. Theo dõi kết quả kiểm tra/giám sát và cập nhật trạng thái.
```

## Business Rules

| Rule | Status |
|---|---|
| Ranh giới vùng trồng phải được quản lý nhất quán với thông tin thực tế. | CONFIRMED |
| Điều kiện diện tích tối thiểu, tần suất giám sát và điều kiện cấp mã PUC phải xác minh theo đúng loại cây, mục đích và văn bản chuyên ngành hiện hành. | TO_VERIFY |

> Không áp dụng cứng quy tắc “10 ha” cho mọi vùng trồng của HTX. Trong hệ thống cần phân biệt **vùng trồng nội bộ** và **vùng trồng thực hiện thủ tục mã số theo quy định chuyên ngành**.

## System Opportunities

- Bản đồ GIS.
- Vẽ polygon.
- Tính diện tích.
- Lưu tọa độ.
- Quản lý hồ sơ vùng trồng.
- Theo dõi lịch kiểm tra/giám sát.

---

# 7. BP-SEASON-001 – Quản lý mùa vụ

## Purpose

Tổ chức hoạt động sản xuất theo mùa vụ, liên kết mùa vụ với vùng trồng và kế hoạch sản xuất.

## Actors

- Ban giám đốc/quản lý HTX.
- Cán bộ kỹ thuật.
- Xã viên.

## Inputs

- Tên/mã mùa vụ.
- Loại cây/giống.
- Ngày bắt đầu.
- Ngày dự kiến kết thúc/thu hoạch.
- Sản lượng kế hoạch.
- Vùng trồng áp dụng.

## Main Flow

```text
1. HTX tạo mùa vụ.
2. Khai báo thời gian và kế hoạch.
3. Gắn mùa vụ với vùng trồng/thửa đất.
4. Phân bổ cho các hộ/xã viên nếu có.
5. Theo dõi tiến độ.
6. Cập nhật điều chỉnh khi có biến động.
7. Kết thúc mùa vụ.
```

## Business Rules

- Ngày kết thúc phải sau ngày bắt đầu.
- Việc bắt buộc áp dụng VietGAP/IPM/IPHM cho mọi mùa vụ là **TO_VERIFY**, không mặc định cho toàn bộ hệ thống.

## System Opportunities

- Nhắc lịch.
- Theo dõi tiến độ.
- Liên kết nhật ký sản xuất.
- Thống kê sản lượng kế hoạch/thực tế.

---

# 8. BP-PROD-001 – Ghi nhận hoạt động sản xuất

## Purpose

Ghi nhận các hoạt động canh tác thực tế để quản lý sản xuất, truy xuất và làm dữ liệu nghiệp vụ/minh chứng khi phù hợp.

## Actors

- Xã viên.
- Cán bộ kỹ thuật.
- Người kiểm tra/giám sát.

## Inputs

- Ngày thực hiện.
- Hoạt động sản xuất.
- Vật tư sử dụng.
- Phân bón.
- Thuốc BVTV/hóa chất nếu có.
- Khối lượng.
- Ghi chú.
- Hình ảnh/tài liệu nếu cần.

## Main Flow

```text
1. Xã viên thực hiện hoạt động sản xuất.
2. Ghi nhật ký.
3. HTX/cán bộ kỹ thuật kiểm tra khi có yêu cầu.
4. Ghi nhận sai lệch hoặc yêu cầu khắc phục.
5. Lưu nhật ký.
```

## Business Rules

- Chỉ ghi nhận các quy tắc sử dụng vật tư/thuốc BVTV khi có căn cứ từ quy định hoặc quy trình mà HTX áp dụng.
- Thời gian cách ly, MRL và danh mục hoạt chất phải lấy từ nguồn chuyên ngành phù hợp; không hard-code từ báo cáo nghiên cứu nếu chưa xác minh.

## System Opportunities

- Nhật ký điện tử.
- Đính kèm ảnh.
- Theo dõi thời gian cách ly.
- Cảnh báo dữ liệu bất thường.
- Liên kết hoạt động sản xuất với mùa vụ/vùng trồng.

---

# 9. BP-HARVEST-001 – Ghi nhận thu hoạch

## Status

`INFERRED / TO_VERIFY`

Báo cáo A–F có nhắc đến thu hoạch và Lot ID, nhưng chưa mô tả đầy đủ một business process độc lập. Vì vậy chỉ nên coi đây là quy trình cần xác minh.

## Proposed Main Flow

```text
1. Xã viên/HTX ghi nhận thu hoạch.
2. Gắn lần thu hoạch với mùa vụ và vùng/thửa.
3. Ghi nhận sản lượng.
4. Tạo/ghi nhận lô sản phẩm nếu HTX có quản lý theo lô.
5. Chuyển dữ liệu sang nghiệp vụ sản phẩm/thu mua/truy xuất.
```

---

# 10. BP-INV-001 – Nhập kho vật tư

## Actors

- Nhà cung cấp.
- Thủ kho.
- Kế toán.
- Người có trách nhiệm phê duyệt.

## Inputs

- Đơn đặt hàng.
- Chứng từ giao hàng.
- Số lượng thực nhận.
- Đơn giá.
- Số lô/hạn sử dụng nếu áp dụng.

## Main Flow

```text
1. HTX đặt mua vật tư.
2. Nhà cung cấp giao hàng.
3. Thủ kho kiểm đếm và kiểm tra.
4. Lập phiếu nhập.
5. Kế toán/đơn vị có thẩm quyền kiểm tra chứng từ.
6. Cập nhật tồn kho.
```

## Business Rules

- Vật tư có yêu cầu bảo quản đặc biệt phải được lưu trữ theo quy định và quy trình của HTX.
- ROP là cơ chế quản trị tồn kho **PROPOSED**, không phải nghĩa vụ pháp lý bắt buộc.

## System Opportunities

- Phiếu nhập điện tử.
- Theo dõi số lô/hạn dùng.
- Cảnh báo tồn kho thấp.
- Mã vạch/QR.

---

# 11. BP-INV-002 – Xuất kho vật tư

## Actors

- Xã viên/người nhận.
- Thủ kho.
- Kế toán.

## Main Flow

```text
1. Phát sinh nhu cầu vật tư.
2. Kiểm tra tồn kho và điều kiện xuất.
3. Lập phiếu xuất.
4. Thủ kho giao vật tư.
5. Xác nhận số lượng thực xuất.
6. Cập nhật tồn kho.
7. Nếu bán/cung ứng trả chậm: ghi nhận công nợ theo quy định của HTX.
```

## Outputs

- Phiếu xuất.
- Tồn kho mới.
- Công nợ nếu có.

---

# 12. BP-INV-003 – Kiểm kê và xử lý chênh lệch kho

## Actors

- Ban kiểm soát/người kiểm kê.
- Thủ kho.
- Kế toán.
- Người có thẩm quyền xử lý.

## Main Flow

```text
1. Quyết định/lập kế hoạch kiểm kê.
2. Chốt số liệu theo phạm vi kiểm kê.
3. Đếm/đo thực tế.
4. Đối chiếu số liệu.
5. Ghi nhận chênh lệch.
6. Giải trình nguyên nhân.
7. Phê duyệt phương án xử lý.
8. Điều chỉnh số liệu theo quyết định hợp lệ.
```

## Business Rules

- Chênh lệch phải có giải trình và căn cứ xử lý.
- Tỷ lệ hao hụt “0,1%–2%” trong báo cáo chỉ là `INFERRED`, không được dùng làm ngưỡng mặc định.

## System Opportunities

- Phiếu kiểm kê.
- Khóa giao dịch trong phiên kiểm kê.
- Tự tính chênh lệch.
- Lưu lịch sử điều chỉnh.

---

# 13. BP-FIN-001 – Ghi nhận thu – chi

## Purpose

Ghi nhận các khoản thu, chi và chứng từ tài chính phát sinh trong hoạt động HTX.

## Actors

- Kế toán.
- Thủ quỹ.
- Người phê duyệt.
- Đối tác/xã viên khi liên quan.

## Main Flow

```text
1. Phát sinh giao dịch.
2. Thu thập chứng từ.
3. Kiểm tra tính hợp lệ.
4. Ghi nhận giao dịch.
5. Phê duyệt nếu thuộc trường hợp phải phê duyệt.
6. Đối chiếu.
7. Lưu chứng từ và lịch sử.
```

## Business Rules

- Phân loại giao dịch nội bộ và bên ngoài phải phù hợp với chế độ kế toán và quy định áp dụng cho HTX.
- Không tự kết luận một phân loại giao dịch tạo ra ưu đãi thuế nếu chưa xác minh căn cứ pháp lý cụ thể.

---

# 14. BP-FIN-002 – Quản lý công nợ xã viên

## Main Flow

```text
1. Phát sinh nghĩa vụ thanh toán.
2. Ghi nhận khoản phải thu/phải trả.
3. Theo dõi hạn thanh toán.
4. Ghi nhận thanh toán.
5. Đối chiếu số dư.
6. Xử lý cấn trừ nếu có căn cứ và được HTX áp dụng.
7. Tất toán hoặc chuyển kỳ.
```

## Business Rules

- Cấn trừ công nợ chỉ thực hiện khi có căn cứ nghiệp vụ và chứng từ hợp lệ.
- Công thức “tiền thực trả = tiền thu mua – dư nợ vật tư” trong báo cáo là một trường hợp nghiệp vụ cụ thể, không nên hard-code cho mọi giao dịch.

---

# 15. BP-FIN-003 – Phân chia lợi nhuận / thặng dư

## Status

`TO_VERIFY`

Đây là nghiệp vụ quan trọng nhưng công thức và điều kiện phân phối phải được xác minh theo Luật HTX, Điều lệ và quyết định của HTX.

## Actors

- Kế toán.
- Hội đồng quản trị.
- Đại hội thành viên.
- Xã viên là đối tượng nhận phân phối nếu đủ điều kiện.

## Main Flow

```text
1. Xác định kết quả hoạt động kỳ.
2. Xác định các khoản phải xử lý trước khi phân phối.
3. Lập phương án phân phối.
4. Trình cấp có thẩm quyền.
5. Đại hội thành viên/quyền quyết định theo quy định phê duyệt.
6. Lập bảng phân phối.
7. Thực hiện chi trả/kết chuyển.
8. Lưu chứng từ và kết quả.
```

## Business Rules

- Tỷ lệ và phương thức phân phối phải lấy từ văn bản pháp luật và Điều lệ HTX hiện hành.
- Con số “tối thiểu 51%” trong báo cáo phải `TO_VERIFY` trước khi trở thành rule triển khai.
- Không sử dụng tên `cổ tức` nếu nghiệp vụ thực tế/pháp lý cần gọi là `phân phối thu nhập/thặng dư`.

## System Opportunities

- Tự động tổng hợp dữ liệu.
- Mô phỏng phương án phân phối.
- Tạo bảng phân bổ.
- Lưu lịch sử phê duyệt.

---

# 16. BP-PRODUCT-001 – Quản lý sản phẩm

## Purpose

Quản lý danh mục sản phẩm và thông tin thương mại/chất lượng của sản phẩm do HTX quản lý.

## Actors

- Ban giám đốc/quản lý HTX.
- Cán bộ kỹ thuật.
- Bộ phận kinh doanh/đóng gói nếu có.

## Inputs

- Tên sản phẩm.
- Nhóm sản phẩm.
- Quy cách.
- Thông tin nhãn.
- Thông tin chất lượng.
- Thông tin truy xuất/lô nếu áp dụng.
- Hồ sơ/chứng nhận liên quan.

## Main Flow

```text
1. Khởi tạo sản phẩm.
2. Khai báo thông tin.
3. Gắn sản phẩm với nguồn nguyên liệu/lô nếu có.
4. Quản lý hồ sơ chất lượng và pháp lý.
5. Cập nhật trạng thái kinh doanh.
6. Liên kết với hồ sơ OCOP nếu sản phẩm tham gia OCOP.
```

## Business Rules

- Yêu cầu giấy phép, công bố, ATTP, nhãn hàng hóa… phụ thuộc loại sản phẩm và quy định áp dụng.
- Không mặc định mọi sản phẩm đều phải có cùng một bộ chứng nhận.

---

# 17. BP-OCOP-001 – Chuẩn bị và khởi tạo hồ sơ OCOP

## Purpose

Tập hợp thông tin và tài liệu cần thiết để chủ thể chuẩn bị hồ sơ đánh giá, phân hạng sản phẩm OCOP.

## Actors

- Chủ thể OCOP/HTX.
- Người phụ trách hồ sơ.
- Bộ phận kỹ thuật/kế toán/các bộ phận cung cấp dữ liệu.
- Cơ quan tiếp nhận/đánh giá theo quy định hiện hành.

## Inputs

- Thông tin chủ thể.
- Thông tin sản phẩm.
- Phiếu đăng ký.
- Báo cáo tự đánh giá.
- Tài liệu thuyết minh.
- Hồ sơ minh chứng.
- Sản phẩm mẫu khi thủ tục yêu cầu.

## Main Flow

```text
1. Xác định sản phẩm đăng ký.
2. Xác định loại/lần đánh giá.
3. Khởi tạo hồ sơ.
4. Chuẩn bị báo cáo và tài liệu.
5. Chuẩn bị minh chứng.
6. Kiểm tra mức độ đầy đủ.
7. Hoàn thiện hồ sơ để nộp theo quy trình hiện hành.
```

## System Opportunities

- Checklist hồ sơ.
- Theo dõi tiến độ.
- Nhắc việc.
- Liên kết dữ liệu nội bộ.

---

# 18. BP-OCOP-002 – Quản lý bộ tiêu chí OCOP

## Purpose

Quản lý phiên bản bộ tiêu chí được áp dụng cho từng hồ sơ.

## Nguyên tắc quan trọng

```text
Bộ tiêu chí
   ↓
Phiên bản
   ↓
Nhóm tiêu chí
   ↓
Tiêu chí
   ↓
Chỉ tiêu
   ↓
Điều kiện / mức điểm
```

## Business Rules

- Mỗi hồ sơ phải xác định bộ tiêu chí/phiên bản áp dụng.
- Không hard-code tiêu chí OCOP vào source code.
- Tiêu chí và thang điểm phải được quản lý theo phiên bản để bảo toàn lịch sử hồ sơ.

## Status

`TO_VERIFY` đối với toàn bộ nội dung pháp lý chi tiết cho đến khi đối chiếu văn bản OCOP hiện hành và bộ tiêu chí mà đơn vị cung cấp.

---

# 19. BP-OCOP-003 – Tự đánh giá / chấm điểm hồ sơ

## Main Flow

```text
1. Chọn bộ tiêu chí áp dụng.
2. Người phụ trách xem từng tiêu chí/chỉ tiêu.
3. Nhập mức tự đánh giá/điểm nếu biểu mẫu yêu cầu.
4. Gắn minh chứng.
5. Ghi chú giải trình.
6. Kiểm tra tính đầy đủ.
7. Khóa phiên tự đánh giá khi hoàn tất.
```

## Business Rules

- Điểm phải gắn với tiêu chí/chỉ tiêu cụ thể.
- Cần lưu người chấm, thời điểm, phiên bản tiêu chí và lịch sử thay đổi.
- Các ngưỡng sao và điều kiện bắt buộc phải được xác minh theo bộ tiêu chí hiện hành.

---

# 20. BP-OCOP-004 – Quản lý minh chứng

## Purpose

Quản lý tài liệu minh chứng gắn với hồ sơ, tiêu chí và/hoặc chỉ tiêu.

## Main Flow

```text
1. Xác định yêu cầu minh chứng.
2. Tải lên hoặc chọn tài liệu đã có.
3. Gắn tài liệu với tiêu chí.
4. Nhập metadata.
5. Kiểm tra tính đầy đủ/hiệu lực.
6. Lưu phiên bản.
7. Theo dõi lịch sử thay đổi.
```

## Metadata tối thiểu đề xuất

- Evidence ID.
- Tên tài liệu.
- Loại tài liệu.
- Ngày tài liệu.
- Ngày hết hạn nếu có.
- Nguồn.
- Tiêu chí liên quan.
- Người tải lên.
- Phiên bản.
- Trạng thái.

## Security

Bảo mật tệp là yêu cầu hệ thống quan trọng, nhưng giải pháp cụ thể như MinIO/presigned URL thuộc **Technical Design**, không thuộc Business Process.

---

# 21. BP-OCOP-005 – Kiểm tra và bổ sung hồ sơ

## Main Flow

```text
1. Hồ sơ được kiểm tra.
2. Xác định tài liệu/tiêu chí chưa đầy đủ hoặc chưa đạt yêu cầu.
3. Ghi nhận yêu cầu bổ sung.
4. Thông báo cho người phụ trách.
5. Người phụ trách bổ sung/chỉnh sửa.
6. Kiểm tra lại.
7. Chuyển trạng thái khi đủ điều kiện.
```

## Status đề xuất

```text
DRAFT
  ↓
IN_REVIEW
  ↓
NEED_REVISION
  ↓
RESUBMITTED
  ↓
READY
```

Đây là trạng thái hệ thống đề xuất, cần xác nhận với quy trình thực tế.

---

# 22. BP-OCOP-006 – Đánh giá / chấm điểm của cơ quan, hội đồng

## Status

`TO_VERIFY`

Báo cáo nghiên cứu mô tả các cấp/cơ quan đánh giá, nhưng có các điểm chưa thống nhất về cấp hành chính, thẩm quyền và ngưỡng điểm. Vì vậy không hard-code workflow “xã → huyện → tỉnh → trung ương” vào hệ thống khi chưa xác minh văn bản hiện hành.

## Business Flow khái quát

```text
Chủ thể nộp hồ sơ
       ↓
Cơ quan tiếp nhận
       ↓
Kiểm tra hồ sơ
       ↓
Đánh giá / thẩm định
       ↓
Yêu cầu bổ sung (nếu có)
       ↓
Chấm điểm
       ↓
Tổng hợp kết quả
       ↓
Công nhận / chuyển bước theo thẩm quyền
```

## Business Rules

- Cơ quan, thẩm quyền, quy trình và ngưỡng chuyển cấp phải cấu hình theo quy định hiện hành.
- Không cố định “3 cấp” nếu tài liệu pháp lý hiện hành không quy định theo cách đó.
- Không tự động kết luận sản phẩm đạt sao chỉ từ tổng điểm nếu còn điều kiện khống chế/điều kiện bắt buộc.

---

# 23. BP-OCOP-007 – Quản lý kết quả và hiệu lực hồ sơ

## Main Flow

```text
1. Nhận kết quả đánh giá/công nhận.
2. Lưu kết quả và quyết định liên quan.
3. Gắn kết quả với sản phẩm.
4. Ghi nhận ngày hiệu lực và thời hạn nếu có.
5. Theo dõi trạng thái.
6. Nhắc đánh giá lại khi gần hết hiệu lực nếu quy định yêu cầu.
```

## Business Rules

- Thời hạn hiệu lực phải lấy theo văn bản hiện hành và quyết định công nhận.
- Không hard-code 36 tháng nếu chưa xác minh phiên bản pháp lý áp dụng cho hồ sơ.

---

# 24. BP-OCOP-008 – Kết xuất hồ sơ / báo cáo OCOP

## Purpose

Tạo bộ hồ sơ và báo cáo từ dữ liệu đã được kiểm tra/phê duyệt.

## Main Flow

```text
1. Chọn hồ sơ.
2. Kiểm tra trạng thái và phiên bản.
3. Chọn mẫu biểu.
4. Tổng hợp dữ liệu.
5. Chèn minh chứng.
6. Sinh file.
7. Lưu phiên bản kết xuất.
8. Cho phép tải/xuất theo quyền.
```

## Outputs

- PDF.
- DOCX.
- Báo cáo tổng hợp.
- Danh mục minh chứng.

## System Opportunities

- Sinh PDF/DOCX theo template.
- Đánh số phụ lục.
- Mục lục minh chứng.
- Ghi version của bộ hồ sơ.

---

# 25. Process Dependency Matrix

| Process | Phụ thuộc | Cung cấp dữ liệu cho |
|---|---|---|
| BP-MEM-001 | Thông tin HTX/Điều lệ | BP-MEM-002, BP-CROP-001 |
| BP-MEM-002 | BP-MEM-001 | BP-FIN-003 |
| BP-CROP-001 | Xã viên/liên kết | BP-SEASON-001, BP-PROD-001, BP-OCOP-001 |
| BP-SEASON-001 | BP-CROP-001 | BP-PROD-001, BP-HARVEST-001 |
| BP-PROD-001 | BP-SEASON-001 | BP-HARVEST-001, BP-PRODUCT-001, BP-OCOP-004 |
| BP-HARVEST-001 | BP-PROD-001 | BP-PRODUCT-001, BP-FIN-002, BP-OCOP-004 |
| BP-INV-001 | Nhà cung cấp | BP-INV-002, BP-FIN-001 |
| BP-INV-002 | Tồn kho | BP-PROD-001, BP-FIN-002 |
| BP-INV-003 | BP-INV-001/002 | BP-FIN-001 |
| BP-FIN-001 | Chứng từ giao dịch | BP-FIN-003 |
| BP-FIN-002 | BP-INV-002 / giao dịch | BP-FIN-003 |
| BP-FIN-003 | Kết quả tài chính | Báo cáo HTX |
| BP-PRODUCT-001 | BP-HARVEST-001 | BP-OCOP-001 |
| BP-OCOP-001 | BP-PRODUCT-001 | BP-OCOP-002/003/004 |
| BP-OCOP-002 | Bộ tiêu chí | BP-OCOP-003 |
| BP-OCOP-003 | BP-OCOP-002 | BP-OCOP-005/006 |
| BP-OCOP-004 | Dữ liệu/hồ sơ | BP-OCOP-003/005/008 |
| BP-OCOP-005 | Hồ sơ + minh chứng | BP-OCOP-006 |
| BP-OCOP-006 | Hồ sơ hoàn chỉnh | BP-OCOP-007 |
| BP-OCOP-007 | Kết quả đánh giá | BP-OCOP-008 |
| BP-OCOP-008 | Hồ sơ đã đủ điều kiện | Người quản lý/đơn vị tiếp nhận |

---

# 26. Những nội dung KHÔNG được hard-code vào Business Process

Các kết quả dưới đây xuất hiện trong báo cáo nghiên cứu nhưng phải tách hoặc xác minh:

| Nội dung | Xử lý |
|---|---|
| MinIO | Technical Design |
| Presigned URL | Technical Design |
| Database trigger | Technical Design |
| React/Vue | Architecture |
| Laravel/FastAPI | Architecture |
| AI nhận diện thuốc | Future/Proposed |
| Camera nhận diện khuôn mặt | Future/Proposed; không phải core |
| QR truy xuất | Proposed/Enhancement |
| ROP | Proposed business configuration |
| VietGAP | Configurable/To Verify |
| 10 ha PUC | To Verify + giới hạn phạm vi áp dụng |
| Hao hụt 0,1–2% | To Verify |
| Tỷ lệ 51% phân phối | To Verify |
| Workflow OCOP cố định xã–huyện–tỉnh–trung ương | To Verify |
| “3 cấp” | Không dùng làm mô hình cố định |
| “Cổ tức” | Chỉ dùng nếu đúng thuật ngữ nghiệp vụ/pháp lý áp dụng |

---

# 27. Business Process Gaps / Open Questions

| Gap ID | Vấn đề | Mức độ |
|---|---|---|
| GAP-001 | HTX thực tế đang sử dụng quy trình tiếp nhận/phê duyệt xã viên nào? | High |
| GAP-002 | Điều lệ HTX quy định mức góp vốn và phương thức phân phối như thế nào? | Critical |
| GAP-003 | HTX quản lý vùng trồng nội bộ hay trực tiếp quản lý hồ sơ mã số vùng trồng? | Critical |
| GAP-004 | Các loại cây/vùng trồng mục tiêu của hệ thống là gì? | High |
| GAP-005 | Có bắt buộc VietGAP hay hỗ trợ nhiều tiêu chuẩn? | Critical |
| GAP-006 | Có quản lý lô/lot và truy xuất đến thửa đất không? | High |
| GAP-007 | Quy trình thu mua nông sản và cấn trừ công nợ thực tế của HTX? | Critical |
| GAP-008 | Công thức phân chia thặng dư thực tế theo Điều lệ HTX? | Critical |
| GAP-009 | Các mẫu biểu kế toán/kho HTX thực tế đang sử dụng? | High |
| GAP-010 | Bộ tiêu chí OCOP phiên bản hiện hành và bộ tài liệu do đơn vị cung cấp? | Critical |
| GAP-011 | Cơ quan tiếp nhận/đánh giá và workflow OCOP hiện hành áp dụng cho địa bàn? | Critical |
| GAP-012 | Những minh chứng nào được HTX tạo trực tiếp từ dữ liệu nội bộ? | High |
| GAP-013 | Quy trình ký số/chữ ký điện tử có thực sự nằm trong phạm vi đồ án? | Medium |
| GAP-014 | Yêu cầu lưu trữ, thời hạn lưu và phân quyền tệp minh chứng? | High |

---

# 28. Nguyên tắc chuyển sang yêu cầu phần mềm

Không chuyển trực tiếp:

```text
Business Process → Code
```

Mà chuyển theo:

```text
Business Process
      ↓
Business Rule
      ↓
Business Requirement
      ↓
Functional Requirement
      ↓
Use Case
      ↓
Domain Model
      ↓
Technical Design
      ↓
Implementation
```

Ví dụ:

```text
Business Process:
Thủ kho nhập vật tư.

Business Requirement:
HTX phải kiểm soát được số lượng vật tư nhập thực tế.

Functional Requirement:
Hệ thống phải cho phép tạo phiếu nhập kho và ghi nhận số lượng thực nhận.

Technical Design:
API + PostgreSQL + UI React + object storage...
```

---

# 29. Quy tắc kiểm soát phiên bản

Các nội dung có khả năng thay đổi theo pháp luật/quy định phải được thiết kế theo version:

```text
Legal / OCOP Rule
      ↓
Version
      ↓
Effective From
      ↓
Effective To
      ↓
Business Rule
      ↓
Applied To Case
```

Đặc biệt áp dụng cho:

- Bộ tiêu chí OCOP.
- Biểu mẫu OCOP.
- Quy trình đánh giá.
- Điều kiện công nhận.
- Quy định vùng trồng.
- Quy định chuyên ngành sản xuất.

---

# 30. Kết luận

`03_BUSINESS_PROCESSES.md` là tài liệu nghiệp vụ trung gian.

Tài liệu này cố ý **không** quyết định:

- Kiến trúc phần mềm.
- Database schema.
- API.
- Framework.
- Cách triển khai MinIO.
- Cách xác thực người dùng.
- Cách viết code.

Những quyết định đó chỉ được đưa ra sau khi Business Process, Business Rules và Requirements đã được xác nhận.

**Trạng thái hiện tại: DRAFT – PENDING VALIDATION.**

Các mục `TO_VERIFY` phải được xác minh trước khi tạo Business Rule chính thức và trước khi giao tài liệu cho coding agent làm cơ sở triển khai.
