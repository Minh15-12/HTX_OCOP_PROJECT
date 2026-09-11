# 06_BUSINESS_RULES.md

## 1. Thông tin tài liệu

- **Dự án:** Xây dựng Hệ thống quản lý hoạt động Hợp tác xã nông nghiệp và số hóa hồ sơ đánh giá, phân hạng OCOP
- **Mục đích:** Chuẩn hóa các quy tắc nghiệp vụ mà hệ thống phải tuân thủ trong quản lý HTX, xã viên, vùng trồng, vật tư, tài chính, hồ sơ OCOP, chấm điểm, minh chứng, workflow và audit.
- **Nguồn nền:** `03_BUSINESS_PROCESSES.md`, `04_OCOP_BUSINESS.md`, `05_ACTORS_AND_ROLES.md`, `business_context_htx_ocop.md` và tài liệu đặc tả nghiệp vụ tổng thể.
- **Trạng thái:** `DRAFT – PENDING VALIDATION`

Tài liệu này trả lời câu hỏi:

> **WHAT MUST ALWAYS BE TRUE? – Trong mỗi tình huống, điều kiện nào hệ thống bắt buộc phải bảo đảm?**

---

# 2. Quy ước mức độ chắc chắn

| Nhãn | Ý nghĩa |
|---|---|
| `CONFIRMED` | Nguồn nghiên cứu xác định trực tiếp |
| `INFERRED` | Suy luận từ quy trình/tài liệu, chưa đủ căn cứ để coi là quy định bắt buộc |
| `PROPOSED` | Quy tắc được đề xuất để hệ thống vận hành an toàn |
| `TO_VERIFY` | Phải xác minh với HTX/cơ quan thực tế hoặc văn bản hiện hành |
| `CONFLICT` | Các nguồn chưa thống nhất |

### Nguyên tắc

1. `CONFIRMED` có thể trở thành acceptance rule sau khi kiểm tra nguồn pháp lý.
2. `INFERRED` không được hard-code như quy định pháp luật.
3. `PROPOSED` chỉ là thiết kế hệ thống.
4. `TO_VERIFY` phải được đưa vào danh sách câu hỏi khảo sát.
5. Khi có xung đột, ưu tiên tài liệu pháp lý/văn bản chính thức sau khi được xác minh.
6. Không để coding agent tự suy diễn từ tên rule.

---

# 3. Cấu trúc Business Rule

Mỗi rule được mô tả theo:

```text
Rule ID
Tên
Domain
Mức độ
Nguồn
Điều kiện
Quy tắc
Hành động hệ thống
Ngoại lệ
```

---

# 4. Nhóm BR-COOP — Quản trị HTX & Xã viên

## BR-COOP-001 — Số lượng thành viên thành lập tối thiểu

- **Status:** `CONFIRMED` trong tài liệu nghiên cứu
- **Rule:** HTX phải có ít nhất 05 thành viên chính thức tự nguyện gia nhập để đáp ứng điều kiện thành lập theo nguồn được khảo sát.
- **System Action:** Khi tạo hồ sơ thành lập, hệ thống cảnh báo/không cho hoàn tất nếu chưa đủ điều kiện.
- **Source:** Luật HTX 2023 theo tài liệu nghiên cứu.
- **Validation:** `TO_VERIFY` trước khi coi là quy tắc pháp lý hard-coded.

## BR-COOP-002 — Mô hình quản trị theo quy mô

- **Status:** `CONFIRMED` trong tài liệu nghiên cứu.
- **Rule:** HTX từ 10 thành viên trở lên được xác định là phải tổ chức mô hình quản trị đầy đủ; dưới 10 thành viên có thể áp dụng mô hình rút gọn theo nguồn khảo sát.
- **System Action:** Hệ thống cấu hình/cảnh báo mô hình quản trị theo số lượng thành viên.
- **Validation:** `TO_VERIFY`.

## BR-COOP-003 — Một thành viên một phiếu biểu quyết

- **Status:** `CONFIRMED` trong tài liệu nghiên cứu.
- **Rule:** Thành viên chính thức có quyền biểu quyết bình đẳng, không phụ thuộc tỷ lệ vốn góp.
- **System Action:** Không tính trọng số biểu quyết theo số vốn góp.
- **Validation:** Cần đối chiếu văn bản pháp lý hiện hành khi triển khai module Đại hội thành viên.

## BR-COOP-004 — Hạn mức vốn góp của một thành viên

- **Status:** `CONFIRMED` trong tài liệu nghiên cứu.
- **Rule:** Phần vốn góp của một thành viên chính thức không vượt quá 30% vốn điều lệ.
- **System Action:** Khi ghi nhận góp vốn/tăng vốn, hệ thống tính tỷ lệ và cảnh báo/chặn giao dịch vượt giới hạn.
- **Source:** Điều 74 Luật HTX 2023 theo tài liệu nghiên cứu.

## BR-COOP-005 — Tổng vốn góp của thành viên liên kết góp vốn

- **Status:** `CONFIRMED` trong tài liệu nghiên cứu.
- **Rule:** Tổng phần vốn góp của thành viên liên kết góp vốn không vượt quá 30% vốn điều lệ.
- **System Action:** Kiểm tra tổng tích lũy trước khi phê duyệt giao dịch.

## BR-COOP-006 — Thời hạn góp đủ vốn cam kết

- **Status:** `CONFIRMED` trong tài liệu nghiên cứu.
- **Rule:** Thành viên phải góp đủ phần vốn cam kết trong thời hạn tối đa 06 tháng kể từ thời điểm pháp lý tương ứng.
- **System Action:** Tự tính deadline và cảnh báo quá hạn.
- **Exception:** Nếu có căn cứ pháp lý khác áp dụng cho trường hợp cụ thể, không tự động kết luận vi phạm.
- **Validation:** Kiểm tra lại văn bản hiện hành trước khi hard-code.

## BR-COOP-007 — Tỷ lệ thành viên nước ngoài

- **Status:** `CONFIRMED` trong tài liệu nghiên cứu.
- **Rule:** Tài liệu khảo sát ghi nhận tổng số thành viên là cá nhân/tổ chức nước ngoài không vượt quá 35% tổng số thành viên chính thức.
- **System Action:** Cảnh báo khi thêm thành viên làm vượt tỷ lệ.
- **Validation:** `TO_VERIFY` với văn bản pháp lý hiện hành.

## BR-COOP-008 — Trùng định danh thành viên

- **Status:** `CONFIRMED/PROPOSED`.
- **Rule:** Một định danh pháp lý của thành viên không được tạo thành nhiều hồ sơ thành viên hoạt động trong cùng HTX.
- **System Action:** Kiểm tra trùng CCCD/mã số doanh nghiệp trước khi tạo.
- **Exception:** Một cá nhân/tổ chức có thể có quan hệ khác nhau với HTX nhưng phải được mô hình hóa bằng quan hệ, không tạo bản ghi thành viên giả.

---

# 5. Nhóm BR-AGRI — Vùng trồng, thửa đất & canh tác

## BR-AGRI-001 — Thành viên phải hợp lệ trước khi đăng ký thửa đất

- **Status:** `CONFIRMED`.
- **Rule:** Thửa đất của hộ xã viên chỉ được tạo khi liên kết với thành viên đang hoạt động hợp pháp.
- **System Action:** Không cho tạo thửa nếu `member.status != ACTIVE`.

## BR-AGRI-002 — Thửa đất phải thuộc vùng PUC được liên kết

- **Status:** `CONFIRMED` theo tài liệu quy trình.
- **Rule:** Thửa đất được quản lý trong vùng nguyên liệu PUC phải có ranh giới phù hợp với vùng PUC đã đăng ký.
- **System Action:** GIS kiểm tra quan hệ không gian trước khi xác nhận.

## BR-AGRI-003 — Diện tích PUC tối thiểu

- **Status:** `CONFIRMED` trong tài liệu nghiên cứu.
- **Rule:** Tài liệu ghi nhận diện tích vùng trồng cây ăn quả tập trung đề nghị cấp mã PUC tối thiểu 10 ha.
- **System Action:** Cảnh báo/chặn hồ sơ cấp PUC nếu không đạt ngưỡng.
- **Source:** TCCS 774:2020/BVTV theo tài liệu nghiên cứu.
- **Validation:** Phải xác minh phạm vi áp dụng và văn bản hiện hành trước khi hard-code.

## BR-AGRI-004 — Nhật ký phải gắn với thửa đất

- **Status:** `CONFIRMED`.
- **Rule:** Mỗi nhật ký bón phân/phun thuốc phải xác định thửa đất cụ thể.
- **System Action:** `plot_id` là dữ liệu bắt buộc.

## BR-AGRI-005 — Nhật ký phải gắn với mùa vụ

- **Status:** `CONFIRMED/INFERRED`.
- **Rule:** Nhật ký canh tác phải thuộc một mùa vụ đang quản lý.
- **System Action:** Không cho tạo nhật ký nếu không xác định được mùa vụ.

## BR-AGRI-006 — Kiểm soát thời gian cách ly PHI

- **Status:** `CONFIRMED` trong tài liệu nghiên cứu.
- **Rule:** Không cho xác nhận thu hoạch trước thời điểm an toàn được tính từ lần sử dụng thuốc theo dữ liệu PHI.
- **Logic khái niệm:**

```text
safe_harvest_date = spray_date + PHI
harvest_date >= safe_harvest_date
```

- **System Action:** Chặn thao tác thu hoạch khi điều kiện không đạt.
- **Validation:** Công thức PHI phải lấy từ dữ liệu vật tư/quy định phù hợp, không tự suy diễn.

## BR-AGRI-007 — Ghi nhận nhật ký kịp thời

- **Status:** `CONFIRMED` trong tài liệu khảo sát VietGAP.
- **Rule:** Nhật ký phải được ghi nhận gắn với hoạt động canh tác thực tế; không coi việc ghi hồi ký cuối vụ là tương đương nhật ký thực địa.
- **System Action:** Lưu timestamp, người ghi và thời điểm hoạt động.
- **Validation:** Khoảng thời gian “ngay sau” cần xác định nếu muốn tự động chặn.

## BR-AGRI-008 — Lô hàng phải truy vết được

- **Status:** `PROPOSED/INFERRED`.
- **Rule:** Lô hàng thu hoạch phải truy ngược được tối thiểu tới thửa đất, mùa vụ và xã viên.
- **System Action:** Sinh `lot_id` duy nhất và duy trì liên kết nguồn.

## BR-AGRI-009 — Không sửa xóa lịch sử canh tác đã khóa

- **Status:** `PROPOSED`.
- **Rule:** Nhật ký đã được duyệt/khóa không được sửa trực tiếp.
- **System Action:** Nếu cần chỉnh sửa, tạo correction/version mới và audit.

---

# 6. Nhóm BR-LOG — Vật tư & kho

## BR-LOG-001 — Vật tư phải thuộc danh mục

- **Status:** `CONFIRMED`.
- **Rule:** Nhập/xuất kho phải sử dụng SKU đã tồn tại trong danh mục vật tư.
- **System Action:** Không cho giao dịch với SKU không hợp lệ.

## BR-LOG-002 — Thuốc BVTV phải hợp pháp

- **Status:** `CONFIRMED` trong tài liệu nghiên cứu.
- **Rule:** Vật tư/hóa chất sử dụng phải thuộc danh mục được phép theo phạm vi quy định áp dụng.
- **System Action:** Cảnh báo/chặn vật tư không có trạng thái hợp lệ.
- **Validation:** Danh mục pháp lý phải được cập nhật và xác minh định kỳ.

## BR-LOG-003 — Tồn kho khả dụng không âm

- **Status:** `PROPOSED/INFERRED`.
- **Rule:** Không cho xuất vượt tồn kho khả dụng.
- **System Action:** Transaction phải được kiểm tra tồn kho trước khi commit.

## BR-LOG-004 — Nhập kho phải có chứng từ

- **Status:** `CONFIRMED` theo quy trình.
- **Rule:** Phiếu nhập phải có thông tin nhà cung cấp, số lượng, đơn giá, lô/hạn dùng và chứng từ liên quan theo loại giao dịch.
- **System Action:** Không hoàn tất phiếu nếu thiếu trường bắt buộc.

## BR-LOG-005 — Xuất trả chậm phải kiểm tra tư cách xã viên

- **Status:** `CONFIRMED`.
- **Rule:** Xuất kho trả chậm phải xác định thành viên hợp lệ và ghi nhận công nợ tương ứng.
- **System Action:** Liên kết `stock_issue → member → receivable`.

## BR-LOG-006 — Không xuất trả chậm khi nợ bị khóa

- **Status:** `INFERRED/PROPOSED`.
- **Rule:** Nếu thành viên có khoản nợ quá hạn hoặc vượt hạn mức được HTX cấu hình, hệ thống khóa phương thức trả chậm.
- **System Action:** Chỉ cho thanh toán phương thức khác hoặc yêu cầu phê duyệt đặc biệt.
- **Validation:** Hạn mức thực tế phải được HTX xác định.

## BR-LOG-007 — Điều chỉnh tồn kho phải có căn cứ

- **Status:** `CONFIRMED`.
- **Rule:** Điều chỉnh tồn kho phải xuất phát từ biên bản kiểm kê và phê duyệt hợp lệ.
- **System Action:** Không cho tạo adjustment trực tiếp không có reference document.

## BR-LOG-008 — Kiểm kê phải ghi nhận chênh lệch

- **Status:** `CONFIRMED`.
- **Rule:** Hệ thống phải tính:

```text
discrepancy = actual_quantity - system_quantity
```

- **System Action:** Nếu khác 0, yêu cầu lý do và quy trình phê duyệt.

## BR-LOG-009 — Không tự ý xóa giao dịch kho

- **Status:** `PROPOSED`.
- **Rule:** Giao dịch kho đã ghi sổ không bị xóa vật lý; sửa sai bằng reversal/correction.
- **System Action:** Giữ audit trail.

---

# 7. Nhóm BR-FIN — Thu, chi, công nợ & thặng dư

## BR-FIN-001 — Phân biệt giao dịch nội bộ và bên ngoài

- **Status:** `CONFIRMED`.
- **Rule:** Doanh thu/chi phí phải phân loại rõ giao dịch nội bộ với thành viên và giao dịch bên ngoài.
- **System Action:** Transaction bắt buộc có `transaction_type`.

## BR-FIN-002 — Thu phải có chứng từ

- **Status:** `CONFIRMED` theo quy trình.
- **Rule:** Giao dịch thu phải có chứng từ phù hợp.
- **System Action:** Không hoàn tất nếu thiếu chứng từ bắt buộc.

## BR-FIN-003 — Chi phải qua phê duyệt

- **Status:** `CONFIRMED` theo quy trình.
- **Rule:** Khoản chi thuộc ngưỡng/quy trình phê duyệt phải được phê duyệt trước khi hoàn tất.
- **System Action:** Workflow `DRAFT → PENDING_APPROVAL → APPROVED → COMPLETED`.

## BR-FIN-004 — Công nợ phải gắn với đối tượng

- **Status:** `CONFIRMED`.
- **Rule:** Mọi khoản phải thu/phải trả của thành viên phải liên kết được với đối tượng và chứng từ gốc.

## BR-FIN-005 — Cho vay nội bộ chỉ dành cho đối tượng đủ điều kiện

- **Status:** `CONFIRMED` trong tài liệu nghiên cứu.
- **Rule:** Cho vay nội bộ chỉ dành cho thành viên chính thức trong các điều kiện được quy định.
- **Rule bổ sung từ nguồn:** Thời hạn khoản vay nội bộ được tài liệu ghi nhận không quá 12 tháng.
- **Validation:** Kiểm tra điều kiện pháp lý và Điều lệ HTX trước khi hard-code.

## BR-FIN-006 — Nguồn vốn cho vay nội bộ

- **Status:** `CONFIRMED` trong tài liệu nghiên cứu.
- **Rule:** Không sử dụng nguồn vốn huy động thuộc phạm vi bị hạn chế để thực hiện cho vay nội bộ.
- **System Action:** Transaction phải xác định nguồn vốn.

## BR-FIN-007 — Cấn trừ công nợ

- **Status:** `INFERRED`.
- **Rule:** Giá trị cấn trừ cuối vụ phụ thuộc vào công nợ vật tư và giá trị thu mua thực tế của thành viên.
- **System Action:** Sinh biên bản đối soát/cấn trừ; không tự động xóa dư nợ nếu giá trị thu mua không đủ.
- **Open:** Cách xử lý dư nợ còn lại phải xác minh.

## BR-FIN-008 — Trích lập quỹ không chia

- **Status:** `CONFIRMED` trong tài liệu nghiên cứu.
- **Rule:** Tài liệu ghi nhận thu nhập ròng từ giao dịch bên ngoài phải trích lập quỹ chung không chia tối thiểu 5% đối với HTX.
- **System Action:** Khi quyết toán, hệ thống tính khoản trích theo cấu hình pháp lý hiện hành.
- **Validation:** Phải kiểm tra văn bản hiện hành và phạm vi áp dụng trước khi hard-code.

## BR-FIN-009 — Phân phối thặng dư nội bộ

- **Status:** `CONFIRMED` trong tài liệu nghiên cứu.
- **Rule:** Tài liệu ghi nhận tối thiểu 51% thu nhập còn lại từ giao dịch nội bộ sau các khoản trích lập bắt buộc được phân phối cho thành viên chính thức theo mức độ sử dụng dịch vụ và/hoặc đóng góp lao động.
- **Open:** Trọng số cụ thể giữa sử dụng dịch vụ và lao động phải lấy từ Điều lệ/quy chế HTX.
- **System Action:** Không hard-code trọng số nếu chưa có cấu hình được phê duyệt.

## BR-FIN-010 — Không tự ý thay đổi quyết toán đã khóa

- **Status:** `PROPOSED`.
- **Rule:** Quyết toán đã được phê duyệt không được sửa trực tiếp.
- **System Action:** Correction/reversal + audit.

---

# 8. Nhóm BR-OCOP — Hồ sơ, tiêu chí & chấm điểm

## BR-OCOP-001 — Hồ sơ phải gắn với sản phẩm

- **Status:** `CONFIRMED`.
- **Rule:** Mỗi hồ sơ OCOP phải liên kết với một sản phẩm cụ thể.
- **System Action:** `product_id` bắt buộc.

## BR-OCOP-002 — Hồ sơ phải dùng đúng bộ tiêu chí

- **Status:** `CONFIRMED`.
- **Rule:** Hồ sơ phải gắn với phiên bản bộ tiêu chí phù hợp với thời điểm/phạm vi đánh giá.
- **System Action:** Lưu `criteria_version_id` bất biến sau khi hồ sơ bước vào đánh giá chính thức.

## BR-OCOP-003 — Không sửa phiên bản tiêu chí lịch sử

- **Status:** `PROPOSED`.
- **Rule:** Phiên bản tiêu chí đã được dùng cho hồ sơ không được sửa trực tiếp.
- **System Action:** Tạo version mới.

## BR-OCOP-004 — Hồ sơ nháp mới được chỉnh sửa

- **Status:** `PROPOSED`.
- **Rule:** Chỉ hồ sơ ở trạng thái cho phép chỉnh sửa mới được thay đổi dữ liệu chủ thể.
- **System Action:** Policy kiểm tra workflow state.

## BR-OCOP-005 — Chỉ được nộp hồ sơ khi đủ điều kiện

- **Status:** `CONFIRMED/PROPOSED`.
- **Rule:** Hồ sơ phải có đủ trường bắt buộc, minh chứng bắt buộc và nội dung tự đánh giá theo checklist.
- **System Action:** Pre-submit validation.

## BR-OCOP-006 — Điểm tự đánh giá được tính từ lựa chọn

- **Status:** `CONFIRMED`.
- **Rule:** Điểm tự đánh giá phải được tính từ các lựa chọn/giá trị tiêu chí đã cấu hình, không nhập tổng điểm thủ công.
- **System Action:**

```text
criterion_score = selected_option.point_value
total_score = Σ criterion_score
```

## BR-OCOP-007 — Điểm Hội đồng là điểm của evaluator

- **Status:** `CONFIRMED`.
- **Rule:** Mỗi evaluator có phiếu/điểm riêng; hệ thống không cho một evaluator ghi đè điểm của evaluator khác.
- **System Action:** Scope theo `evaluation_session + evaluator`.

## BR-OCOP-008 — Điểm tổng hợp

- **Status:** `CONFIRMED` trong tài liệu nghiên cứu.
- **Rule:** Điểm tổng hợp được mô tả là điểm trung bình cộng của các giám khảo.
- **System Action:**

```text
average_score = SUM(valid_evaluator_scores) / COUNT(valid_evaluator_scores)
```

- **Validation:** Phải xác minh cách xử lý evaluator vắng mặt, phiếu không hợp lệ, làm tròn và điều kiện đặc biệt.

## BR-OCOP-009 — Chênh lệch điểm Hội đồng

- **Status:** `CONFIRMED` trong tài liệu nghiên cứu.
- **Rule:** Tài liệu ghi nhận điểm của các thành viên Hội đồng đối với một sản phẩm không được chênh lệch quá 10 điểm trên thang 100.
- **System Action:** Nếu vượt ngưỡng, cảnh báo và không cho chốt điểm theo workflow đề xuất.
- **Validation:** Đối chiếu quy trình/văn bản hiện hành.

## BR-OCOP-010 — Điều kiện chỉ tiêu bắt buộc

- **Status:** `CONFIRMED` trong tài liệu nghiên cứu.
- **Rule:** Việc đạt tổng điểm không tự động đồng nghĩa được công nhận sao nếu còn thiếu điều kiện/chỉ tiêu bắt buộc.
- **System Action:** Scoring engine phải kiểm tra constraint rules trước khi đề xuất hạng.

## BR-OCOP-011 — Hạ hạng do thiếu chỉ tiêu bắt buộc

- **Status:** `CONFIRMED` trong tài liệu nghiên cứu.
- **Rule:** Tài liệu mô tả trường hợp đạt ngưỡng điểm cao nhưng thiếu chỉ tiêu bắt buộc thì hạng được khống chế xuống mức phù hợp.
- **System Action:** Tính `eligible_star_level` riêng với `score_based_star_level`.
- **Validation:** Phải kiểm tra chính xác điều kiện và mức hạ hạng trước khi hard-code.

## BR-OCOP-012 — Hiệu lực chứng nhận

- **Status:** `CONFIRMED` trong tài liệu nghiên cứu.
- **Rule:** Tài liệu ghi nhận chứng nhận OCOP 3–5 sao có hiệu lực 36 tháng kể từ ngày quyết định công nhận.
- **System Action:** Tự tính `expired_date`.
- **Validation:** Kiểm tra văn bản hiện hành.

---

# 9. Nhóm BR-EVIDENCE — Minh chứng

## BR-EVIDENCE-001 — Minh chứng phải gắn với hồ sơ

- **Status:** `CONFIRMED`.
- **Rule:** Mọi file minh chứng phải liên kết với hồ sơ OCOP.

## BR-EVIDENCE-002 — Minh chứng nên gắn với tiêu chí/chỉ tiêu

- **Status:** `CONFIRMED/PROPOSED`.
- **Rule:** Hệ thống phải hỗ trợ liên kết file với criterion/indicator khi biểu mẫu yêu cầu.
- **System Action:** Không dùng một file “mồ côi” không truy vết được.

## BR-EVIDENCE-003 — Kiểm soát định dạng và dung lượng

- **Status:** `CONFIRMED` trong tài liệu nghiên cứu.
- **Rule:** Tài liệu ghi nhận PDF hoặc ảnh chất lượng phù hợp, dung lượng tối đa 50MB/file.
- **System Action:** Validate MIME, extension, size.
- **Validation:** Giới hạn 50MB là cấu hình nghiệp vụ/kỹ thuật theo tài liệu khảo sát, cần xác nhận.

## BR-EVIDENCE-004 — Không xóa vật lý lịch sử minh chứng

- **Status:** `PROPOSED`.
- **Rule:** Minh chứng bị thay thế/từ chối phải giữ version/history.
- **System Action:** `version + status + audit`; không overwrite mất lịch sử.

## BR-EVIDENCE-005 — Chỉ người có scope mới được xem minh chứng

- **Status:** `PROPOSED`.
- **Rule:** File minh chứng không được public chỉ vì biết object key.
- **System Action:** Access qua authorization + signed URL ngắn hạn.

## BR-EVIDENCE-006 — Minh chứng đã xác minh không được sửa trực tiếp

- **Status:** `PROPOSED`.
- **Rule:** Nếu cần thay đổi, tạo version mới và giữ bản cũ.

## BR-EVIDENCE-007 — Minh chứng từ dữ liệu HTX phải truy vết nguồn

- **Status:** `INFERRED`.
- **Rule:** Nếu một tài liệu được sinh từ nhật ký/vùng trồng/tài chính, phải truy được nguồn dữ liệu đã tạo ra tài liệu.
- **System Action:** lưu `source_entity`, `source_id`, `generated_at`, `generated_by`.

---

# 10. Nhóm BR-WORKFLOW — Trạng thái & chuyển bước

## BR-WORKFLOW-001 — Chỉ chuyển trạng thái hợp lệ

- **Status:** `PROPOSED`.
- **Rule:** Mỗi entity chỉ được chuyển từ state hiện tại sang state nằm trong transition matrix.
- **System Action:** Backend là nơi quyết định transition; frontend không được tự quyết định.

## BR-WORKFLOW-002 — Không bỏ qua bước bắt buộc

- **Status:** `PROPOSED`.
- **Rule:** Không được chuyển trực tiếp từ hồ sơ nháp sang phê duyệt cuối nếu chưa hoàn tất các bước bắt buộc.

Ví dụ:

```text
DRAFT
 → SUBMITTED
 → REVIEWING
 → REVISION / VALIDATED
 → EVALUATING
 → CONSOLIDATED
 → PENDING_DECISION
 → APPROVED / REJECTED
```

Workflow thực tế phải được xác minh trước khi coi danh sách này là cố định.

## BR-WORKFLOW-003 — Revision phải có lý do

- **Status:** `PROPOSED`.
- **Rule:** Khi yêu cầu sửa/bổ sung, phải ghi rõ nội dung, người yêu cầu và thời hạn nếu có.

## BR-WORKFLOW-004 — Hồ sơ đã gửi không tự sửa

- **Status:** `PROPOSED`.
- **Rule:** Sau khi submit, chủ thể chỉ sửa khi workflow chuyển sang trạng thái cho phép bổ sung.

## BR-WORKFLOW-005 — Quyền phải kiểm tra cả role và scope

- **Status:** `CONFIRMED/PROPOSED`.
- **Rule:**

```text
ALLOW =
  valid_role
  AND valid_permission
  AND valid_scope
  AND valid_workflow_state
  AND business_rules_pass
```

---

# 11. Nhóm BR-SEC — Phân quyền & Separation of Duties

## BR-SEC-001 — Không dùng Admin để bypass nghiệp vụ

- **Status:** `PROPOSED`.
- **Rule:** System Admin không mặc định có quyền phê duyệt OCOP hoặc sửa điểm đánh giá.

## BR-SEC-002 — Evaluator chỉ sửa phiếu của mình

- **Status:** `PROPOSED`.
- **Rule:** Evaluator chỉ được tạo/sửa điểm thuộc phiên đánh giá và phiếu được phân công.

## BR-SEC-003 — Người chuẩn bị không mặc định được phê duyệt

- **Status:** `PROPOSED`.
- **Rule:** Role chuẩn bị hồ sơ không mặc định có `OCOP_RESULT.APPROVE`.

## BR-SEC-004 — Quyền nhạy cảm phải audit

Các quyền bắt buộc audit:

```text
CRITERIA.PUBLISH
OCOP_EVIDENCE.VERIFY
OCOP_EVALUATION.UPDATE
OCOP_EVALUATION.LOCK
OCOP_RESULT.APPROVE
USER_ROLE.ASSIGN
AUDIT.READ
```

## BR-SEC-005 — Scope của HTX

- **Status:** `PROPOSED`.
- **Rule:** User thuộc HTX chỉ được thao tác dữ liệu thuộc HTX được gán.

## BR-SEC-006 — Scope của evaluator

- **Status:** `PROPOSED`.
- **Rule:** Evaluator chỉ xem/chấm hồ sơ được phân công.

---

# 12. Nhóm BR-AUDIT — Audit Trail

## BR-AUDIT-001 — Audit thao tác nhạy cảm

- **Status:** `PROPOSED`.
- **Rule:** Các thay đổi quan trọng phải lưu:
  - actor/user
  - role
  - action
  - entity
  - entity_id
  - timestamp
  - before
  - after
  - reason nếu có.

## BR-AUDIT-002 — Không sửa audit log

- **Status:** `PROPOSED`.
- **Rule:** Audit log chỉ append-only từ góc nhìn nghiệp vụ.

## BR-AUDIT-003 — Truy vết hồ sơ OCOP

Hệ thống phải có khả năng truy vết:

```text
OCOP Application
   ↓
Criteria Version
   ↓
Criterion
   ↓
Self Assessment
   ↓
Evidence
   ↓
Evaluator Score
   ↓
Consolidated Score
   ↓
Decision
```

## BR-AUDIT-004 — Truy vết dữ liệu tái sử dụng

Dữ liệu từ:

```text
Member
Plot
Season
Farm Journal
Material
Finance
```

nếu được sử dụng làm minh chứng OCOP phải truy được nguồn.

---

# 13. Nhóm BR-DATA — Tính toàn vẹn dữ liệu

## BR-DATA-001

ID nghiệp vụ quan trọng phải duy nhất trong phạm vi được quy định.

## BR-DATA-002

Không xóa vật lý dữ liệu có giá trị lịch sử khi entity đã tham gia quy trình đánh giá/quyết toán.

## BR-DATA-003

Dữ liệu tham chiếu quan trọng phải dùng foreign key hoặc cơ chế integrity tương đương.

## BR-DATA-004

Các phép tính tài chính phải lưu được nguồn dữ liệu đầu vào.

## BR-DATA-005

Các phép tính OCOP phải lưu được bộ tiêu chí và phiên bản dùng để tính.

## BR-DATA-006

Các file phải có metadata tối thiểu:

```text
file_id
original_name
storage_key
mime_type
size
version
status
uploaded_by
uploaded_at
```

---

# 14. Rule về phiên bản

## BR-VERSION-001 — Criteria Version

Mỗi hồ sơ đánh giá chính thức phải tham chiếu đúng phiên bản bộ tiêu chí tại thời điểm áp dụng.

## BR-VERSION-002 — Evidence Version

Khi thay minh chứng:

```text
Evidence v1 → REJECTED/REPLACED
Evidence v2 → ACTIVE
```

Không ghi đè mất v1.

## BR-VERSION-003 — Generated Document Version

Tài liệu PDF/DOCX được sinh lại phải có version hoặc generation history nếu đã từng được dùng làm hồ sơ chính thức.

---

# 15. Rule về tính toán

## BR-CALC-001 — Không nhập tổng điểm thủ công

Tổng điểm phải được tính từ các thành phần.

## BR-CALC-002 — Làm tròn

Quy tắc làm tròn điểm phải được cấu hình rõ trước khi triển khai.

**Status:** `TO_VERIFY`.

## BR-CALC-003 — Điểm âm/vượt điểm tối đa

Không cho điểm nhỏ hơn 0 hoặc lớn hơn điểm tối đa của criterion nếu bộ tiêu chí không quy định khác.

## BR-CALC-004 — Không sửa kết quả bằng tay

Nếu kết quả cần điều chỉnh do exception nghiệp vụ, phải có:

```text
reason
actor
timestamp
approval
audit
```

---

# 16. Rule về báo cáo & kết xuất

## BR-REPORT-001

Báo cáo phải sử dụng dữ liệu đã được xác định theo scope của người dùng.

## BR-REPORT-002

Hồ sơ PDF/DOCX phải sử dụng đúng template tương ứng với loại biểu mẫu.

## BR-REPORT-003

Tài liệu đã phát hành không được âm thầm thay đổi nội dung khi dữ liệu nguồn thay đổi.

## BR-REPORT-004

Nếu tài liệu được tạo lại sau khi dữ liệu nguồn thay đổi, phải xác định đó là version/generation mới.

## BR-REPORT-005

Liên kết tới minh chứng trong hồ sơ xuất phải tuân thủ chính sách bảo mật; không xuất secret/object key nội bộ.

---

# 17. Business Rule Priority

| Priority | Ý nghĩa |
|---|---|
| P0 | Không được vi phạm; có thể chặn giao dịch |
| P1 | Quy tắc nghiệp vụ quan trọng; thường phải chặn hoặc yêu cầu phê duyệt |
| P2 | Cảnh báo/kiểm soát |
| P3 | Khuyến nghị/UX |

### Các nhóm P0/P1 đề xuất

```text
P0:
- Vốn góp vượt giới hạn đã xác minh
- Thu hoạch vi phạm PHI
- Ghi điểm vượt điểm tối đa
- Sửa dữ liệu lịch sử đã khóa
- Evaluator sửa phiếu của evaluator khác
- Approve khi workflow chưa đủ điều kiện

P1:
- Xuất kho vượt tồn
- Điều chỉnh kho không có chứng từ
- Nộp hồ sơ thiếu thành phần bắt buộc
- Minh chứng không đạt validation
- Chấm điểm khi hồ sơ chưa được phân công
```

Các mức ưu tiên trên là **PROPOSED**.

---

# 18. Open Questions / TO_VERIFY

| ID | Nội dung cần xác minh | Priority |
|---|---|---|
| BR-V-001 | Cơ cấu role thực tế trong HTX | Critical |
| BR-V-002 | Người có quyền phê duyệt từng loại nghiệp vụ | Critical |
| BR-V-003 | Công thức phân phối thặng dư 51%: trọng số dịch vụ/lao động | Critical |
| BR-V-004 | Hạn mức nợ vật tư trả chậm | Critical |
| BR-V-005 | Cách xử lý nợ còn lại sau cấn trừ cuối vụ | High |
| BR-V-006 | Cách xử lý thiên tai/thất thu khi cấn trừ không đủ | High |
| BR-V-007 | Quy trình Hội đồng và cách xử lý lệch điểm >10 | Critical |
| BR-V-008 | Quy tắc làm tròn điểm | High |
| BR-V-009 | Điều kiện chỉ tiêu bắt buộc và cách hạ sao | Critical |
| BR-V-010 | Cấp có thẩm quyền quyết định theo từng trường hợp | Critical |
| BR-V-011 | Cách versioning minh chứng bị từ chối | High |
| BR-V-012 | Chữ ký số trên các biểu mẫu | High |
| BR-V-013 | Giới hạn file minh chứng thực tế | Medium |
| BR-V-014 | Có bắt buộc hyperlink tới minh chứng trong file xuất hay không | Medium |
| BR-V-015 | Quy trình sửa dữ liệu sau khi đã phê duyệt | Critical |

---

# 19. Nguyên tắc dành cho Coding Agent

Coding Agent phải coi file này là **Business Rules Layer**, không phải danh sách tính năng.

### Không được

```text
if role == ADMIN:
    bypass_all_rules()
```

### Không được

```text
if score >= 70:
    star = 4
```

mà bỏ qua các điều kiện bắt buộc.

### Nên

```text
score_result
    ↓
check_criteria_version
    ↓
check_mandatory_constraints
    ↓
check_evaluator_rules
    ↓
check_workflow_state
    ↓
calculate_eligible_star
    ↓
propose_result
```

### Không được

```text
delete evidence
```

### Nên

```text
create new evidence version
mark old version as REPLACED
append audit event
```

### Không được

```text
update inventory without source document
```

### Nên

```text
validate source document
    ↓
validate authorization
    ↓
validate stock
    ↓
commit transaction
    ↓
write audit
```

---

# 20. Mapping với tài liệu trước

```text
03_BUSINESS_PROCESSES.md
       │
       │ WHAT happens?
       ▼
04_OCOP_BUSINESS.md
       │
       │ WHO + OCOP flow?
       ▼
05_ACTORS_AND_ROLES.md
       │
       │ WHO can do what?
       ▼
06_BUSINESS_RULES.md
       │
       │ WHAT MUST ALWAYS BE TRUE?
       ▼
07_BUSINESS_REQUIREMENTS.md
       │
       │ WHAT must system provide?
       ▼
08_FUNCTIONAL_REQUIREMENTS.md
```

Ví dụ:

```text
BP-LOG-03
Xuất kho cho xã viên
       ↓
Role: HTX_STAFF / STOREKEEPER
       ↓
BR-LOG-005
Xã viên phải hợp lệ
       ↓
BR-LOG-006
Kiểm tra trạng thái công nợ
       ↓
FR:
Create Stock Issue
```

---

# 21. Definition of Done

`06_BUSINESS_RULES.md` được coi là đủ để chuyển sang `07_BUSINESS_REQUIREMENTS.md` khi:

- [ ] Quy tắc quản lý HTX đã được định danh.
- [ ] Quy tắc xã viên/vốn góp đã được định danh.
- [ ] Quy tắc vùng trồng/canh tác đã được định danh.
- [ ] Quy tắc kho/vật tư đã được định danh.
- [ ] Quy tắc tài chính/công nợ/thặng dư đã được định danh.
- [ ] Quy tắc hồ sơ OCOP đã được định danh.
- [ ] Quy tắc chấm điểm đã được định danh.
- [ ] Quy tắc minh chứng/versioning đã được định danh.
- [ ] Quy tắc workflow đã được định danh.
- [ ] Quy tắc phân quyền và separation of duties đã được định danh.
- [ ] Audit rules đã được định danh.
- [ ] Các điểm chưa chắc chắn được đánh dấu `TO_VERIFY`.
- [ ] Không biến giả định thành luật pháp lý.
- [ ] Mỗi rule có ID duy nhất.
- [ ] Có mapping từ process/role/rule sang requirement.

---

# 22. Trạng thái tài liệu

**`DRAFT – PENDING VALIDATION`**

Tài liệu này là cơ sở để xây dựng:

```text
07_BUSINESS_REQUIREMENTS.md
08_FUNCTIONAL_REQUIREMENTS.md
Use Case Specifications
Acceptance Criteria
Domain Model
Authorization Matrix
Database Constraints
Workflow State Machine
```

**Không được coi toàn bộ các con số, ngưỡng, cấp phê duyệt hoặc quy tắc pháp lý trong tài liệu là bất biến cho tới khi được đối chiếu với nguồn pháp lý hiện hành và xác nhận nghiệp vụ thực tế.**
