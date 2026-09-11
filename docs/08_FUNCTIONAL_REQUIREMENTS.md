# 08_FUNCTIONAL_REQUIREMENTS.md

# 1. Document Information

| Field | Value |
|---|---|
| Document ID | 08 |
| Document Name | Functional Requirements Specification (FRS) |
| Project | Xây dựng Hệ thống quản lý hoạt động Hợp tác xã nông nghiệp và số hóa hồ sơ đánh giá, phân hạng OCOP |
| Previous Documents | 01_PROJECT_OVERVIEW.md, 02_DOMAIN_CONTEXT.md, 03_BUSINESS_PROCESSES.md, 04_OCOP_BUSINESS.md, 05_ACTORS_AND_ROLES.md, 06_BUSINESS_RULES.md, 07_BUSINESS_REQUIREMENTS.md |
| Next Documents | 09_USE_CASES.md, 10_DOMAIN_MODEL.md, 11_DATABASE_DESIGN.md, 12_API_SPECIFICATION.md |
| Status | DRAFT – BASELINE SPECIFICATION |

---

# 2. Purpose & Approach

Tài liệu này chuyển đổi toàn bộ các **Yêu cầu Nghiệp vụ (Business Requirements - 07)** thành tập các **Yêu cầu Chức năng (Functional Requirements - FR)** chi tiết ở cấp độ hệ thống.

Mỗi yêu cầu chức năng định nghĩa tường minh:
- **Hệ thống phải thực hiện hành vi gì?** (System Behavior)
- **Điều kiện tiên quyết, dữ liệu đầu vào và kết quả đầu ra là gì?**
- **Quy tắc nghiệp vụ (Business Rules - 06) và luồng kiểm soát nào được áp dụng?**
- **Quyền hạn (RBAC), phạm vi dữ liệu (Data Scope) và nhật ký kiểm toán (Audit Trail) tương ứng?**
- **Tiêu chí nghiệm thu chức năng (Acceptance Criteria)?**

---

# 3. Requirement Traceability Framework

Mỗi Functional Requirement (FR) tuân thủ cấu trúc truy vết đa chiều:

```text
Business Process (03/04) ───► Business Rule (06) ───► Business Requirement (07) ───► Functional Requirement (08)
         │                                                      │
         └─────────────── Actor & Role (05) ────────────────────┘

###  **Quy ước định danh Functional Requirement ID:**

* FR-COOP-xxx: Chức năng Quản lý HTX, Xã viên và Vốn góp.  
* FR-AGRI-xxx: Chức năng Quản lý Vùng trồng, Thửa đất, Mùa vụ, Canh tác và Thu hoạch.  
* FR-PROD-xxx: Chức năng Quản lý Danh mục Sản phẩm HTX.  
* FR-LOG-xxx: Chức năng Quản lý Vật tư, Kho hàng, Nhập/Xuất kho và Kiểm kê.  
* FR-FIN-xxx: Chức năng Quản lý Thu – Chi, Công nợ, Cấn trừ và Phân phối Thặng dư.  
* FR-OCOP-xxx: Chức năng Quản lý Hồ sơ OCOP, Tiêu chí, Tự đánh giá, Chấm điểm và Phân hạng.  
* FR-EVID-xxx: Chức năng Quản lý Lưu trữ, Liên kết, Xác minh và Bảo mật Minh chứng.  
* FR-WKFL-xxx: Chức năng Máy trạng thái Quy trình (Workflow Engine) và Khóa dữ liệu.  
* FR-SEC-xxx: Chức năng Quản lý Người dùng, Phân quyền RBAC và Phạm vi Dữ liệu.  
* FR-AUD-xxx: Chức năng Nhật ký Kiểm toán bất biến và Truy vết Dữ liệu OCOP.  
* FR-RPT-xxx: Chức năng Dashboard, Báo cáo Thống kê và Kết xuất Văn bản (PDF/DOCX).  
* FR-SYS-xxx: Chức năng Quản trị Danh mục Hệ thống, Sao lưu và Phục hồi Dữ liệu.

# **4\. Phân hệ Quản trị HTX, Xã viên & Vốn góp (FR-COOP)**

## **FR-COOP-001: Khởi tạo và Quản lý Hồ sơ Pháp nhân HTX**

* **Priority:** P0 | **Status:** CONFIRMED  
* **Traceability:**  
  * Business Requirement: BRQ-COOP-001  
  * Business Process: BP-MEM-001  
  * Business Rules: BR-COOP-001, BR-COOP-002, BR-DATA-001  
  * Primary Actors: ACT-01 (HTX\_OWNER), ACT-02 (HTX\_STAFF)  
* **Preconditions:** Người dùng đăng nhập với quyền COOP.MANAGE trên phạm vi HTX của mình.  
* **Inputs:** Tên HTX, Mã số HTX (Mã số thuế/Mã số DN), Địa chỉ trụ sở, Ngày cấp phép, Đại diện pháp luật, Vốn điều lệ đăng ký, Mô hình quản trị (Đầy đủ / Rút gọn).  
* **System Behavior:**  
  * Hệ thống tiếp nhận thông tin, kiểm tra tính duy nhất của Mã số HTX trên toàn hệ thống.  
  * Kiểm tra điều kiện số lượng thành viên sáng lập tối thiểu (cảnh báo nếu số thành viên hoạt động \< 05 theo BR-COOP-001).  
  * Căn cứ số lượng thành viên, gợi ý mô hình quản trị tương ứng (bắt buộc mô hình đầy đủ nếu $\\ge 10$ thành viên theo BR-COOP-002).  
  * Lưu thông tin hồ sơ pháp nhân HTX và kích hoạt trạng thái DANG\_HOAT\_DONG.  
* **Exceptions:** Trùng mã số HTX \-\> Báo lỗi ERR\_COOP\_DUPLICATE\_TAX\_CODE.  
* **Outputs:** Bản ghi hồ sơ HTX được khởi tạo thành công; hiển thị trên Dashboard HTX.  
* **Permission & Scope:** COOP.MANAGE | Scope: Own HTX.  
* **Audit:** Ghi log sự kiện COOP\_PROFILE\_UPDATED.  
* **Acceptance Criteria:**  
  * Không cho phép cập nhật nếu thiếu các trường thông tin bắt buộc.  
  * Cập nhật đúng mã số HTX dùng làm tiền tố truy vết cho toàn bộ các giao dịch con.

## **FR-COOP-002: Đăng ký, Tiếp nhận và Quản lý Vòng đời Xã viên**

* **Priority:** P0 | **Status:** CONFIRMED  
* **Traceability:**  
  * Business Requirement: BRQ-COOP-002, BRQ-COOP-003  
  * Business Process: BP-MEM-001  
  * Business Rules: BR-COOP-007, BR-COOP-008, BR-MEM-001, BR-MEM-002, BR-DATA-002  
  * Primary Actors: ACT-02 (HTX\_STAFF), ACT-01 (HTX\_OWNER)  
* **Preconditions:** HTX đang ở trạng thái hoạt động bình thường.  
* **Inputs:** Họ tên xã viên, Số CCCD/Mã định danh, Ngày sinh, Giới tính, Dân tộc, Địa chỉ thường trú, Loại thành viên (CHINH\_THUC, LIEN\_KET\_GOP\_VON, LIEN\_KET\_KHONG\_GOP\_VON), Vốn cam kết góp, Ngày nộp đơn.  
* **System Behavior:**  
  * Kiểm tra tính hợp lệ và duy nhất của CCCD trong phạm vi HTX (chặn tạo trùng lặp theo BR-COOP-008).  
  * Kiểm tra tỷ lệ thành viên nước ngoài nếu có khai báo yếu tố nước ngoài (cảnh báo nếu tỷ lệ vượt quá 35% theo BR-COOP-007).  
  * Tạo hồ sơ xã viên ở trạng thái DRAFT hoặc PENDING\_APPROVAL.  
  * Cấp thẩm quyền (HĐQT/Chủ tịch) phê duyệt kết nạp \-\> Hệ thống chuyển trạng thái sang ACTIVE, tự động cấp Mã xã viên (Member Code) duy nhất và ghi nhận vào Sổ đăng ký thành viên điện tử.  
  * Hỗ trợ quy trình chấm dứt tư cách thành viên: Chuyển trạng thái PENDING\_TERMINATION \-\> Kiểm tra cấn trừ công nợ \-\> Chuyển sang TERMINATED. Tuyệt đối không xóa vật lý bản ghi (BR-DATA-002).  
* **Exceptions:** Trùng CCCD với xã viên đang hoạt động \-\> Báo lỗi ERR\_MEMBER\_DUPLICATE\_ID.  
* **Outputs:** Hồ sơ xã viên được lưu trong Sổ đăng ký thành viên; Quyết định kết nạp/chấm dứt điện tử.  
* **Permission & Scope:** MEMBER.CREATE, MEMBER.UPDATE, MEMBER.APPROVE | Scope: Own HTX.  
* **Audit:** Ghi log MEMBER\_CREATED, MEMBER\_STATUS\_CHANGED kèm trạng thái trước/sau.  
* **Acceptance Criteria:**  
  * Tra cứu được lịch sử trạng thái của xã viên qua mọi thời kỳ.  
  * Xã viên ở trạng thái TERMINATED không thể tham gia mùa vụ hoặc nhận vật tư trả chậm mới.

## **FR-COOP-003: Quản lý Vốn góp, Biến động Vốn và Giới hạn Sở hữu**

* **Priority:** P0 | **Status:** CONFIRMED  
* **Traceability:**  
  * Business Requirement: BRQ-COOP-004, BRQ-COOP-005  
  * Business Process: BP-MEM-002  
  * Business Rules: BR-COOP-004, BR-COOP-005, BR-COOP-006, BR-DATA-004  
  * Primary Actors: ACT-02 (HTX\_STAFF / Accountant), ACT-01 (HTX\_OWNER)  
* **Preconditions:** Xã viên đã được kết nạp hợp lệ (status \= ACTIVE).  
* **Inputs:** Mã xã viên, Số tiền góp thực tế, Loại tài sản góp (Tiền mặt, Quyền sử dụng đất, Tài sản khác), Biên bản định giá tài sản, Ngày nộp tiền/bàn giao tài sản.  
* **System Behavior:**  
  * Ghi nhận giao dịch góp vốn, tự động tính lũy kế vốn thực góp của xã viên.  
  * Tính toán tỷ lệ sở hữu vốn của thành viên trên tổng vốn điều lệ thực góp của HTX.  
  * Kiểm tra trần hạn mức:  
    * Thành viên chính thức: Cảnh báo/chặn nếu tỷ lệ vốn góp vượt 30% vốn điều lệ (BR-COOP-004).  
    * Tổng thành viên liên kết góp vốn: Cảnh báo nếu tổng vượt 30% vốn điều lệ (BR-COOP-005).  
  * Kiểm soát thời hạn góp đủ vốn cam kết: Tự động tính hạn 06 tháng kể từ ngày kết nạp (BR-COOP-006); cảnh báo trạng thái OVERDUE nếu chưa góp đủ.  
  * Cấp Giấy chứng nhận phần vốn góp điện tử khi thành viên hoàn tất 100% nghĩa vụ góp vốn cam kết.  
* **Exceptions:** Giao dịch làm tỷ lệ vốn góp của thành viên vượt trần 30% \-\> Chặn giao dịch, báo lỗi ERR\_CAPITAL\_EXCEED\_LIMIT.  
* **Outputs:** Phiếu thu vốn góp, Giấy chứng nhận phần vốn góp điện tử, Sổ theo dõi biến động vốn điều lệ.  
* **Permission & Scope:** CAPITAL.MANAGE, CAPITAL.APPROVE | Scope: Own HTX.  
* **Audit:** Ghi log CAPITAL\_CONTRIBUTION\_RECORDED, CERTIFICATE\_ISSUED.  
* **Acceptance Criteria:**  
  * Tự động cập nhật tổng vốn điều lệ thực góp của HTX tức thời ngay khi phê duyệt bút toán góp vốn.  
  * Xuất báo cáo danh sách xã viên quá hạn 06 tháng chưa hoàn thành nghĩa vụ vốn góp.

## **FR-COOP-004: Ghi nhận Biểu quyết Bình đẳng Đại hội Thành viên**

* **Priority:** P1 | **Status:** CONFIRMED  
* **Traceability:**  
  * Business Requirement: BRQ-COOP-006  
  * Business Process: BP-MEM-001  
  * Business Rules: BR-COOP-003  
  * Primary Actors: ACT-01 (HTX\_OWNER), ACT-02 (HTX\_STAFF)  
* **Preconditions:** Phiên họp Đại hội thành viên được khởi tạo trên hệ thống; có danh sách thành viên chính thức tham dự.  
* **Inputs:** Mã phiên họp, Nội dung biểu quyết, Danh sách biểu quyết của từng thành viên (TAN\_THANH, KHONG\_TAN\_THANH, KHONG\_Y\_KIEN).  
* **System Behavior:**  
  * Hệ thống thiết lập trọng số biểu quyết: Mỗi thành viên chính thức tham dự có giá trị biểu quyết bằng đúng **01 phiếu**, hoàn toàn không phụ thuộc vào tỷ lệ vốn góp (BR-COOP-003).  
  * Kiểm tra tỷ lệ thông qua theo loại quyết định:  
    * Quyết định sửa đổi điều lệ, tổ chức lại, giải thể, bán tài sản $\\ge 20\\%$: Yêu cầu tối thiểu 65% (hoặc 75% theo Điều lệ) số phiếu tán thành.  
    * Các quyết định thông thường khác: Yêu cầu $\> 50\\%$ số phiếu tán thành.  
  * Tự động tính toán kết quả và khóa biên bản kiểm phiếu.  
* **Outputs:** Biên bản kiểm phiếu Đại hội thành viên điện tử.  
* **Permission & Scope:** COOP.VOTE\_RECORD | Scope: Own HTX.  
* **Audit:** Ghi log CONGRESS\_VOTING\_RECORDED.  
* **Acceptance Criteria:**  
  * Thuật toán tính kết quả không nhân hệ số vốn góp vào phiếu bầu.

# **5\. Phân hệ Canh tác Nông học & Số hóa VietGAP (FR-AGRI & FR-PROD)**

## **FR-AGRI-001: Quản lý Vùng trồng & Thiết lập Mã số PUC Chuyên ngành**

* **Priority:** P0 | **Status:** CONFIRMED  
* **Traceability:**  
  * Business Requirement: BRQ-AGRI-001  
  * Business Process: BP-CROP-001  
  * Business Rules: BR-AGRI-002, BR-AGRI-003  
  * Primary Actors: ACT-02 (HTX\_STAFF / Agriculture Officer)  
* **Preconditions:** HTX đã đăng ký thông tin hợp lệ.  
* **Inputs:** Tên vùng trồng, Loại cây trồng chủ lực, Diện tích tổng thể (ha), Tọa độ GPS tâm hoặc danh sách đỉnh Polygon ranh giới, Mã số PUC (nếu đã được Cục BVTV cấp), Ngày cấp/giám sát định kỳ.  
* **System Behavior:**  
  * Khởi tạo vùng trồng nội bộ của HTX.  
  * Đối với vùng trồng đăng ký cấp mã PUC xuất khẩu: Lưu trữ hồ sơ kỹ thuật, danh sách hộ liên kết và kiểm tra cảnh báo diện tích tối thiểu theo cấu hình (BR-AGRI-003 \- mức 10 ha là TO\_VERIFY theo cây trồng).  
  * Theo dõi lịch giám sát định kỳ mã số PUC và gửi cảnh báo khi đến hạn giám sát duy trì hiệu lực.  
* **Outputs:** Hồ sơ vùng trồng điện tử, Bản đồ số ranh giới vùng trồng.  
* **Permission & Scope:** CROP\_AREA.MANAGE | Scope: Own HTX.  
* **Audit:** Ghi log CROP\_AREA\_CREATED, CROP\_AREA\_UPDATED.  
* **Acceptance Criteria:**  
  * Phân định rõ ràng giữa vùng trồng sản xuất thông thường và vùng trồng đã cấp mã PUC.

## **FR-AGRI-002: Quản lý Phân rã Thửa đất và Gán Quyền Canh tác Xã viên**

* **Priority:** P0 | **Status:** CONFIRMED  
* **Traceability:**  
  * Business Requirement: BRQ-AGRI-002  
  * Business Process: BP-CROP-001  
  * Business Rules: BR-AGRI-001, BR-AGRI-002  
  * Primary Actors: ACT-02 (HTX\_STAFF / Agriculture Officer)  
* **Preconditions:** Vùng trồng cha đã tồn tại; Xã viên được gán có trạng thái ACTIVE.  
* **Inputs:** Mã vùng trồng cha, Mã xã viên chủ sở hữu, Tên/Ký hiệu thửa đất, Diện tích thửa ($m^2$), Số lượng gốc cây, Tọa độ GPS thửa đất, Lịch sử khu đất.  
* **System Behavior:**  
  * Kiểm tra trạng thái hoạt động của xã viên (member.status \== ACTIVE theo BR-AGRI-001). Nếu không hoạt động, chặn thao tác.  
  * Tạo mã thửa đất (plot\_code) duy nhất theo định dạng: PLOT-\[Mã HTX\]-\[Mã Xã viên\]-\[Số thứ tự\].  
  * Thiết lập trạng thái ban đầu của thửa đất: ACTIVE.  
* **Exceptions:** Xã viên bị khóa hoặc không tồn tại \-\> Báo lỗi ERR\_INVALID\_MEMBER\_FOR\_PLOT.  
* **Outputs:** Bản ghi thửa đất thành viên được số hóa, liên kết trực tiếp với vùng trồng cha.  
* **Permission & Scope:** PLOT.MANAGE | Scope: Own HTX.  
* **Audit:** Ghi log PLOT\_CREATED, PLOT\_ASSIGNED.  
* **Acceptance Criteria:**  
  * Một thửa đất chỉ thuộc về duy nhất một xã viên tại một thời điểm xác định.

## **FR-AGRI-003: Quản lý Kế hoạch Niên vụ Sản xuất**

* **Priority:** P0 | **Status:** CONFIRMED  
* **Traceability:**  
  * Business Requirement: BRQ-AGRI-003  
  * Business Process: BP-SEASON-001  
  * Business Rules: BR-AGRI-005  
  * Primary Actors: ACT-01 (HTX\_OWNER), ACT-02 (HTX\_STAFF)  
* **Preconditions:** Đã có danh mục vùng trồng và thửa đất hợp lệ.  
* **Inputs:** Tên mùa vụ (ví dụ: Vụ Nhãn 2026), Ngày bắt đầu vụ, Ngày dự kiến kết thúc/thu hoạch, Kế hoạch sản lượng (tấn), Giống cây trồng, Danh sách các thửa đất tham gia mùa vụ.  
* **System Behavior:**  
  * Kiểm tra ràng buộc logic thời gian: Bắt buộc end\_date \> start\_date.  
  * Gán mùa vụ cho các thửa đất đăng ký. Đảm bảo tại một thời điểm, mỗi thửa đất chỉ tham gia 01 mùa vụ sản xuất chính để tránh xung đột nhật ký.  
  * Tự động khởi tạo sổ nhật ký sản xuất trắng cho từng thửa đất tham gia vụ mùa.  
* **Outputs:** Bản ghi Mùa vụ sản xuất kích hoạt (status \= ACTIVE).  
* **Permission & Scope:** SEASON.MANAGE | Scope: Own HTX.  
* **Audit:** Ghi log SEASON\_CREATED, SEASON\_ACTIVATED.  
* **Acceptance Criteria:**  
  * Không cho phép thiết lập ngày kết thúc nhỏ hơn hoặc bằng ngày bắt đầu mùa vụ.

## **FR-AGRI-004: Ghi nhận Nhật ký Canh tác Điện tử & Tự động Tính Cách ly (PHI)**

* **Priority:** P0 | **Status:** CONFIRMED / TO\_VERIFY  
* **Traceability:**  
  * Business Requirement: BRQ-AGRI-004, BRQ-AGRI-005, BRQ-AGRI-006  
  * Business Process: BP-PROD-001  
  * Business Rules: BR-AGRI-004, BR-AGRI-005, BR-AGRI-006, BR-AGRI-007, BR-LOG-001, BR-LOG-002  
  * Primary Actors: ACT-02 (HTX\_STAFF / Xã viên)  
* **Preconditions:** Thửa đất và mùa vụ đang ở trạng thái ACTIVE.  
* **Inputs:** Mã thửa đất, Mã mùa vụ, Ngày thực hiện, Loại công việc (LAM\_DAT, BON\_PHAN, PHUN\_THUOC, CHAM\_SOC, THU\_GOM\_RAC), Mã vật tư/SKU sử dụng, Số lô vật tư, Khối lượng/Liều lượng sử dụng, Số ngày cách ly (PHI), Hình ảnh thực tế đính kèm.  
* **System Behavior:**  
  * Kiểm tra bắt buộc có định danh thửa đất và mùa vụ (BR-AGRI-004, BR-AGRI-005).  
  * Kiểm tra vật tư sử dụng: Bắt buộc thuộc danh mục vật tư hợp pháp (BR-LOG-001, BR-LOG-002). Nếu là thuốc ngoài danh mục, chặn ghi log và báo cờ đỏ.  
  * Đối với hoạt động phun thuốc BVTV:  
    * Hệ thống tự động tính ngày thu hoạch an toàn:  
      $$\\text{safe\\\_harvest\\\_date} \= \\text{spray\\\_date} \+ \\text{PHI\\\_days}$$  
    * Cập nhật trạng thái thửa đất sang IN\_QUARANTINE (Cách ly hóa chất).  
  * Lưu bản ghi nhật ký với dấu thời gian hệ thống và người ghi nhận thực tế (BR-AGRI-007).  
* **Exceptions:** Khai báo thuốc BVTV nằm trong danh mục cấm \-\> Chặn ghi log, gửi cảnh báo vi phạm VietGAP khẩn cấp đến Quản lý HTX.  
* **Outputs:** Bản ghi nhật ký canh tác điện tử, Cập nhật mốc safe\_harvest\_date trên thửa đất.  
* **Permission & Scope:** FARM\_LOG.CREATE, FARM\_LOG.UPDATE | Scope: Own HTX.  
* **Audit:** Ghi log FARMING\_LOG\_RECORDED kèm metadata đầy đủ.  
* **Acceptance Criteria:**  
  * Tự động kích hoạt trạng thái cách ly IN\_QUARANTINE ngay khi có nhật ký phun thuốc phát sinh.

## **FR-AGRI-005: Ghi nhận Thu hoạch, Kiểm tra Khóa PHI & Sinh Mã Lô hàng (Lot ID)**

* **Priority:** P0 | **Status:** CONFIRMED  
* **Traceability:**  
  * Business Requirement: BRQ-AGRI-007  
  * Business Process: BP-HARVEST-001  
  * Business Rules: BR-AGRI-006, BR-AGRI-008  
  * Primary Actors: ACT-02 (HTX\_STAFF / Agriculture Officer)  
* **Preconditions:** Thửa đất đang canh tác mùa vụ hợp lệ.  
* **Inputs:** Mã thửa đất, Mã mùa vụ, Ngày thu hoạch thực tế, Khối lượng thu hoạch (kg), Đánh giá chất lượng cảm quan, Địa điểm sơ chế/đóng gói, Tên đối tác thu mua.  
* **System Behavior:**  
  * Kiểm tra điều kiện an toàn PHI (BR-AGRI-006):  
    * So sánh: Nếu harvest\_date \< plot.safe\_harvest\_date \-\> **CHẶN HOÀN TOÀN** thao tác thu hoạch và báo lỗi vi phạm an toàn thực phẩm.  
  * Nếu thỏa mãn điều kiện an toàn: Chấp thuận ghi nhận sản lượng thu hoạch.  
  * Tự động sinh mã Lô hàng duy nhất (lot\_id) theo cấu trúc chuẩn:  
    $$\\text{Lot ID} \= \\text{LOT}-\\text{CoopCode}-\\text{PlotCode}-\\text{YYYYMMDD}-\\text{Seq}$$  
  * Cập nhật hoàn trả trạng thái thửa đất về ACTIVE nếu đã kết thúc đợt thu hoạch.  
* **Exceptions:** Thu hoạch trong thời gian cách ly PHI \-\> Chặn lập phiếu, báo lỗi ERR\_HARVEST\_PHI\_VIOLATION.  
* **Outputs:** Bản ghi thu hoạch nông sản được duyệt, Mã lot\_id và mã QR truy xuất nguồn gốc tương ứng.  
* **Permission & Scope:** HARVEST.CREATE, HARVEST.APPROVE | Scope: Own HTX.  
* **Audit:** Ghi log HARVEST\_RECORDED, LOT\_ID\_GENERATED.  
* **Acceptance Criteria:**  
  * Không thể lập phiếu thu hoạch khi thửa đất chưa hết thời gian cách ly an toàn PHI.  
  * Mã Lot ID truy ngược được chính xác 100% về thửa đất, hộ sản xuất, mùa vụ và các đợt phun thuốc liên quan.

## **FR-PROD-001: Quản lý Danh mục Sản phẩm Thương mại HTX**

* **Priority:** P0 | **Status:** CONFIRMED  
* **Traceability:**  
  * Business Requirement: BRQ-PROD-001  
  * Business Process: BP-PRODUCT-001  
  * Business Rules: BR-OCOP-001, BR-DATA-001  
  * Primary Actors: ACT-01 (HTX\_OWNER), ACT-02 (HTX\_STAFF)  
* **Preconditions:** HTX đang hoạt động hợp lệ.  
* **Inputs:** Tên sản phẩm, Mã SKU sản phẩm, Nhóm ngành hàng, Quy cách đóng gói, Nhãn hiệu/Thương hiệu, Tiêu chuẩn chất lượng công bố (TCCS/VietGAP), Liên kết vùng nguyên liệu/Lô thu hoạch.  
* **System Behavior:**  
  * Ghi nhận và quản lý danh mục sản phẩm thương mại của HTX.  
  * Kiểm tra tính duy nhất của mã SKU sản phẩm trong phạm vi HTX.  
  * Thiết lập liên kết giữa sản phẩm thương mại với quy trình sản xuất và nguồn nguyên liệu đầu vào.  
* **Outputs:** Bản ghi Sản phẩm HTX kích hoạt (status \= ACTIVE).  
* **Permission & Scope:** PRODUCT.MANAGE | Scope: Own HTX.  
* **Audit:** Ghi log PRODUCT\_CREATED, PRODUCT\_UPDATED.  
* **Acceptance Criteria:**  
  * Sản phẩm được khởi tạo sẵn sàng để liên kết làm đối tượng đánh giá trong phân hệ OCOP.

# **6\. Phân hệ Logistics & Quản lý Kho Vật tư (FR-LOG)**

## **FR-LOG-001: Quản lý Danh mục Vật tư & Điểm đặt hàng lại (ROP)**

* **Priority:** P0 | **Status:** CONFIRMED  
* **Traceability:**  
  * Business Requirement: BRQ-LOG-001  
  * Business Process: BP-INV-001  
  * Business Rules: BR-LOG-001, BR-LOG-002  
  * Primary Actors: ACT-02 (HTX\_STAFF / Storekeeper)  
* **Preconditions:** Đã đăng nhập với quyền quản lý kho.  
* **Inputs:** Mã vật tư (SKU), Tên thương mại, Nhóm vật tư (Phân bón, Thuốc BVTV, Giống, Khác), Hoạt chất chính, Đơn vị tính, Đơn giá nhập dự kiến, Đơn giá bán nội bộ xã viên (Member Price), Đơn giá bán ngoài, Mức tồn kho an toàn (Safety Stock).  
* **System Behavior:**  
  * Kiểm tra hoạt chất thuốc BVTV: Đối chiếu với danh mục hoạt chất được phép lưu hành của Bộ NN\&PTNT (BR-LOG-002).  
  * Lưu danh mục vật tư dùng chung của HTX.  
  * Tính toán Điểm đặt hàng lại: $\\text{ROP} \= (\\text{Lượng xuất TB/ngày} \\times \\text{LeadTime}) \+ \\text{SafetyStock}$.  
* **Exceptions:** Hoạt chất bị cấm \-\> Chặn lưu, báo lỗi ERR\_SUPPLY\_PROHIBITED\_SUBSTANCE.  
* **Outputs:** Danh mục SKU vật tư nông nghiệp hoạt động.  
* **Permission & Scope:** SUPPLY.MANAGE | Scope: Own HTX.  
* **Audit:** Ghi log SUPPLY\_ITEM\_CREATED.  
* **Acceptance Criteria:**  
  * Không cho phép tạo vật tư không có đơn vị tính hoặc hoạt chất vi phạm pháp luật.

## **FR-LOG-002: Lập và Phê duyệt Phiếu Nhập Kho Vật tư theo Lô**

* **Priority:** P0 | **Status:** CONFIRMED  
* **Traceability:**  
  * Business Requirement: BRQ-LOG-002  
  * Business Process: BP-INV-001  
  * Business Rules: BR-LOG-001, BR-LOG-004, BR-DATA-004  
  * Primary Actors: ACT-02 (HTX\_STAFF / Storekeeper / Accountant)  
* **Preconditions:** SKU vật tư đã tồn tại; Nhà cung cấp hợp lệ.  
* **Inputs:** Mã kho nhận, Nhà cung cấp, Số hóa đơn/chứng từ giao hàng, Danh sách mặt hàng (Mã SKU, Số lượng thực nhập, Đơn giá nhập, Số lô sản xuất, Hạn sử dụng).  
* **System Behavior:**  
  * Tạo phiếu nhập kho ở trạng thái DRAFT \-\> Gửi duyệt PENDING\_APPROVAL.  
  * Người có thẩm quyền duyệt phiếu nhập \-\> Hệ thống thực hiện:  
    * Tăng số lượng tồn kho vật lý và tồn kho khả dụng của SKU tại kho tương ứng (BR-LOG-004).  
    * Lưu vết chi tiết số lô (lot\_number) và hạn sử dụng (expiry\_date) cho từng dòng nhập.  
    * Tự động tính toán lại Giá vốn bình quân gia quyền của mặt hàng.  
    * Ghi nhận biến động tăng thẻ kho (qty\_in).  
* **Outputs:** Phiếu nhập kho được duyệt (status \= COMPLETED), Cập nhật số dư tồn kho tức thời.  
* **Permission & Scope:** INVENTORY.IMPORT\_CREATE, INVENTORY.IMPORT\_APPROVE | Scope: Own HTX.  
* **Audit:** Ghi log STOCK\_INBOUND\_APPROVED kèm chi tiết chứng từ.  
* **Acceptance Criteria:**  
  * Tồn kho tăng chính xác ngay khi phê duyệt; lưu trữ đầy đủ thông tin lô phục vụ truy vết.

## **FR-LOG-003: Xuất Kho Vật tư Cung ứng Xã viên & Tự động Ghi nhận Công nợ**

* **Priority:** P0 | **Status:** CONFIRMED  
* **Traceability:**  
  * Business Requirement: BRQ-LOG-003  
  * Business Process: BP-INV-002  
  * Business Rules: BR-LOG-003, BR-LOG-005, BR-LOG-006, BR-FIN-001  
  * Primary Actors: ACT-02 (HTX\_STAFF / Storekeeper / Accountant)  
* **Preconditions:** Xã viên nhận hàng hợp lệ (status \= ACTIVE); Tồn kho khả dụng đủ để xuất.  
* **Inputs:** Mã kho xuất, Mã người nhận (Xã viên / Khách ngoài), Hình thức xuất (INTERNAL \- Giao dịch nội bộ / EXTERNAL \- Bán ngoài), Hình thức thanh toán (TIEN\_MAT, TRA\_CHAM \- Nợ trả chậm đầu vụ), Danh sách vật tư xuất (Mã SKU, Số lượng, Chọn lô xuất).  
* **System Behavior:**  
  * Kiểm tra tồn kho khả dụng: Nếu $\\text{Số lượng xuất} \> \\text{Tồn khả dụng}$ \-\> **CHẶN XUẤT KHỐNG** (BR-LOG-003).  
  * Áp dụng chính sách giá: Nếu là INTERNAL cho xã viên \-\> Tự động áp giá ưu đãi thành viên (Member Price).  
  * Nếu thanh toán TRA\_CHAM cho xã viên:  
    * Kiểm tra trạng thái nợ của xã viên: Nếu xã viên đang có nợ quá hạn hoặc vượt hạn mức nợ \-\> Khóa phương thức trả chậm (BR-LOG-006).  
    * Nếu hợp lệ: Tự động tạo bản ghi công nợ phải thu của xã viên tương ứng với giá trị phiếu xuất (BR-LOG-005).  
  * Trừ tồn kho khả dụng tức thời, ghi nhận dòng giảm thẻ kho (qty\_out).  
* **Exceptions:** Xuất vượt tồn kho khả dụng \-\> Báo lỗi ERR\_INSUFFICIENT\_STOCK. Xã viên nợ vượt trần \-\> Báo lỗi ERR\_MEMBER\_DEBT\_LOCKED.  
* **Outputs:** Phiếu xuất kho hoàn tất (status \= COMPLETED), Bản ghi công nợ xã viên phát sinh.  
* **Permission & Scope:** INVENTORY.EXPORT\_CREATE, INVENTORY.EXPORT\_APPROVE | Scope: Own HTX.  
* **Audit:** Ghi log STOCK\_OUTBOUND\_COMPLETED.  
* **Acceptance Criteria:**  
  * Không bao giờ để số dư tồn kho khả dụng bị âm trong cơ sở dữ liệu.

## **FR-LOG-004: Kiểm kê Kho, Đối soát Chênh lệch & Điều chỉnh Tồn kho có Kiểm soát**

* **Priority:** P1 | **Status:** CONFIRMED  
* **Traceability:**  
  * Business Requirement: BRQ-LOG-004  
  * Business Process: BP-INV-003  
  * Business Rules: BR-LOG-007, BR-LOG-008, BR-LOG-009, BR-DATA-002  
  * Primary Actors: ACT-02 (Ban Kiểm soát / Storekeeper / Accountant)  
* **Preconditions:** Phiên kiểm kê được lập cho một kho cụ thể.  
* **Inputs:** Mã kho kiểm kê, Ngày kiểm kê, Danh sách mặt hàng kiểm đếm thực tế (Số lượng thực tế).  
* **System Behavior:**  
  * Chốt và khóa số dư lý thuyết trên sổ sách tại thời điểm kiểm kê.  
  * Tiếp nhận số lượng thực đếm, tự động tính chênh lệch:  
    $$\\text{discrepancy\\\_qty} \= \\text{actual\\\_qty} \- \\text{system\\\_qty}$$  
  * Nếu có chênh lệch ($\\ne 0$): Bắt buộc nhập lý do giải trình (BR-LOG-008).  
  * Lập Biên bản kiểm kê có chữ ký số xác nhận của Ban Kiểm soát và Thủ kho.  
  * Khi HĐQT phê duyệt phương án xử lý chênh lệch: Hệ thống mới cho phép chạy lệnh điều chỉnh tồn kho, tự động tạo dòng thẻ kho điều chỉnh bồi hoàn (BR-LOG-007, BR-LOG-009). Tuyệt đối không cho sửa đè dữ liệu lịch sử.  
* **Outputs:** Biên bản kiểm kê kho được duyệt, Số dư kho được đồng bộ chính xác với thực tế.  
* **Permission & Scope:** INVENTORY.AUDIT\_CREATE, INVENTORY.ADJUST\_EXECUTE | Scope: Own HTX.  
* **Audit:** Ghi log STOCK\_AUDIT\_CONDUCTED, STOCK\_ADJUSTMENT\_APPLIED.  
* **Acceptance Criteria:**  
  * Lệnh điều chỉnh tồn kho bắt buộc phải tham chiếu đến ID của Biên bản kiểm kê đã được duyệt.

# **7\. Phân hệ Tài chính, Công nợ & Phân chia Thặng dư (FR-FIN)**

## **FR-FIN-001: Quản lý Thu – Chi & Phân tách Giao dịch Nội bộ / Bên ngoài**

* **Priority:** P0 | **Status:** CONFIRMED  
* **Traceability:**  
  * Business Requirement: BRQ-FIN-001  
  * Business Process: BP-FIN-001  
  * Business Rules: BR-FIN-001, BR-FIN-002, BR-FIN-003  
  * Primary Actors: ACT-02 (Accountant / Cashier), ACT-01 (HTX\_OWNER)  
* **Preconditions:** Tài khoản kế toán và phân loại thu chi đã được cấu hình.  
* **Inputs:** Loại phiếu (Thu / Chi), Đối tượng nộp/nhận, Số tiền, Phân loại nguồn thu/chi (INTERNAL \- Giao dịch nội bộ với thành viên / EXTERNAL \- Giao dịch bên ngoài), Lý do thu/chi, Chứng từ đính kèm.  
* **System Behavior:**  
  * Bắt buộc người dùng phân loại rõ ràng giao dịch INTERNAL hay EXTERNAL (BR-FIN-001 để làm căn cứ miễn giảm thuế TNDN theo Luật HTX 2023).  
  * Đối với phiếu chi: Áp dụng quy trình phê duyệt điện tử đa cấp theo hạn mức quy định trong Điều lệ (BR-FIN-003).  
  * Ghi sổ quỹ tiền mặt/tiền gửi và cập nhật sổ cái kế toán ngay khi hoàn thành giao dịch.  
* **Outputs:** Phiếu thu / Phiếu chi / Ủy nhiệm chi được phê duyệt và hạch toán hoàn tất.  
* **Permission & Scope:** FINANCE.INCOME\_MANAGE, FINANCE.EXPENSE\_APPROVE | Scope: Own HTX.  
* **Audit:** Ghi log CASH\_TRANSACTION\_RECORDED.  
* **Acceptance Criteria:**  
  * Xuất báo cáo tài chính phân tách chính xác 100% doanh thu và chi phí giữa giao dịch nội bộ và bên ngoài.

## **FR-FIN-002: Quản lý Đối soát & Tự động Cấn trừ Công nợ Nông sản Cuối vụ**

* **Priority:** P0 | **Status:** CONFIRMED  
* **Traceability:**  
  * Business Requirement: BRQ-FIN-002  
  * Business Process: BP-FIN-002  
  * Business Rules: BR-FIN-004, BR-FIN-007  
  * Primary Actors: ACT-02 (Accountant), ACT-01 (Xã viên / HTX\_OWNER)  
* **Preconditions:** Cuối mùa vụ thu hoạch; HTX phát sinh phiếu thu mua nông sản bao tiêu của xã viên.  
* **Inputs:** Mã xã viên, Mã mùa vụ, Tổng giá trị nông sản thu mua trong vụ, Danh sách phiếu xuất vật tư trả chậm đầu vụ chưa thanh toán.  
* **System Behavior:**  
  * Hệ thống tự động truy vấn tổng dư nợ vật tư đầu vụ của xã viên (BR-FIN-004).  
  * Thực hiện thuật toán đối soát và cấn trừ tự động:  
    $$\\text{Số tiền thực trả} \= \\text{Tổng tiền thu mua nông sản} \- \\text{Tổng dư nợ vật tư trả chậm}$$  
  * Nếu $\\text{Số tiền thực trả} \\ge 0$: Tất toán toàn bộ nợ vật tư về 0, tạo phiếu chi/chuyển khoản số tiền chênh lệch cho xã viên.  
  * Nếu $\\text{Số tiền thực trả} \< 0$ (thất thu do thiên tai/sản lượng không đủ bù nợ): Cấn trừ tối đa giá trị thu mua, phần dư nợ còn lại được tự động kết chuyển thành số dư nợ đầu kỳ của mùa vụ kế tiếp (BR-FIN-007).  
  * Sinh Biên bản đối soát cấn trừ công nợ điện tử có chữ ký xác nhận của hai bên.  
* **Outputs:** Biên bản đối soát cấn trừ công nợ hoàn tất, Bút toán giảm dư nợ vật tư và thanh toán chênh lệch.  
* **Permission & Scope:** FINANCE.RECONCILE\_EXECUTE | Scope: Own HTX.  
* **Audit:** Ghi log DEBT\_RECONCILIATION\_SETTLED.  
* **Acceptance Criteria:**  
  * Tự động xóa trừ nợ chính xác theo đúng chứng từ gốc; không phát sinh sai lệch số học.

## **FR-FIN-003: Tính toán Trích lập Quỹ chung không chia & Phân phối Thặng dư**

* **Priority:** P0 | **Status:** CONFIRMED / TO\_VERIFY  
* **Traceability:**  
  * Business Requirement: BRQ-FIN-003  
  * Business Process: BP-FIN-003  
  * Business Rules: BR-FIN-008, BR-FIN-009, BR-FIN-010, BR-DATA-002  
  * Primary Actors: ACT-02 (Accountant), ACT-01 (Đại hội thành viên / HTX\_OWNER)  
* **Preconditions:** Báo cáo tài chính năm đã được chốt và Ban Kiểm soát thẩm định.  
* **Inputs:** Tổng thu nhập ròng giao dịch nội bộ, Tổng thu nhập ròng giao dịch bên ngoài, Tỷ lệ trích lập Quỹ chung không chia, Trọng số phân phối theo mức độ sử dụng dịch vụ và ngày công lao động.  
* **System Behavior:**  
  * Thực hiện trích lập Quỹ chung không chia bắt buộc theo BR-FIN-008 (tối thiểu 5% từ thu nhập giao dịch bên ngoài; thu nhập nội bộ theo Điều lệ).  
  * Phân phối phần thu nhập nội bộ còn lại sau khi trích quỹ theo BR-FIN-009:  
    * Tối thiểu **51%** phân phối cho thành viên chính thức căn cứ theo:  
      * Tỷ lệ giá trị dịch vụ/vật tư sử dụng trong năm.  
      * Tỷ lệ đóng góp ngày công lao động (nếu có).  
    * Phần còn lại phân phối theo tỷ lệ phần vốn góp thực tế của thành viên.  
  * Lập Bảng mô phỏng phân phối thặng dư chi tiết từng xã viên trình ĐHTV biểu quyết.  
  * Khi có Nghị quyết ĐHTV phê duyệt: Khóa vĩnh viễn dữ liệu quyết toán và tạo danh sách chi trả cổ tức/thặng dư (BR-FIN-010).  
* **Outputs:** Phương án phân phối thặng dư được duyệt, Sổ theo dõi Quỹ chung không chia, Lệnh chi trả cổ tức.  
* **Permission & Scope:** FINANCE.SURPLUS\_CALCULATE, FINANCE.SURPLUS\_APPROVE | Scope: Own HTX.  
* **Audit:** Ghi log SURPLUS\_DISTRIBUTION\_APPROVED.  
* **Acceptance Criteria:**  
  * Đảm bảo tỷ lệ trích Quỹ chung không chia $\\ge 5\\%$ đối với thu nhập ngoài; tỷ lệ chia theo sử dụng dịch vụ $\\ge 51\\%$ đối với phần thu nhập nội bộ.

## **FR-FIN-004: Quản lý Hoạt động Cho vay Nội bộ & Kiểm soát Nguồn vốn**

* **Priority:** P1 | **Status:** TO\_VERIFY  
* **Traceability:**  
  * Business Requirement: BRQ-FIN-004  
  * Business Process: BP-FIN-001/002  
  * Business Rules: BR-FIN-005, BR-FIN-006  
  * Primary Actors: ACT-02 (Accountant), ACT-01 (HTX\_OWNER)  
* **Preconditions:** HTX tổ chức theo mô hình quản trị đầy đủ, Ban Kiểm soát có $\\ge 03$ người, hoạt động cho vay nội bộ được ĐHTV thông qua trong Điều lệ.  
* **Inputs:** Mã xã viên vay, Số tiền vay, Mục đích vay (Hỗ trợ sản xuất/đời sống), Thời hạn vay (tháng), Lãi suất thỏa thuận (bù đắp chi phí), Nguồn vốn cho vay.  
* **System Behavior:**  
  * Kiểm tra đối tượng vay: Bắt buộc là thành viên chính thức (BR-FIN-005).  
  * Kiểm tra thời hạn vay: Bắt buộc $\\le 12\\text{ tháng}$ (BR-FIN-005).  
  * Kiểm tra nguồn vốn: Bắt buộc sử dụng nguồn vốn nhàn rỗi hợp pháp của HTX, **tuyệt đối không sử dụng nguồn vốn huy động** từ thành viên hoặc bên ngoài để cho vay (BR-FIN-006).  
  * Hạch toán và theo dõi riêng biệt toàn bộ dòng vốn, lãi và lịch thu hồi nợ vay nội bộ.  
* **Exceptions:** Thời hạn vay $\> 12$ tháng hoặc dùng vốn huy động \-\> Báo lỗi chặn ERR\_INTERNAL\_CREDIT\_ILLEGAL.  
* **Outputs:** Hợp đồng vay vốn nội bộ điện tử, Lịch theo dõi thu hồi nợ vay.  
* **Permission & Scope:** FINANCE.CREDIT\_MANAGE | Scope: Own HTX.  
* **Audit:** Ghi log INTERNAL\_LOAN\_DISBURSED.  
* **Acceptance Criteria:**  
  * Chặn hoàn toàn việc tạo khoản vay cho đối tượng không phải thành viên chính thức hoặc thời hạn quá 12 tháng.

# **8\. Phân hệ Số hóa Hồ sơ, Tiêu chí & Đánh giá OCOP (FR-OCOP)**

## **FR-OCOP-001: Khởi tạo Hồ sơ Đăng ký OCOP cho Sản phẩm**

* **Priority:** P0 | **Status:** CONFIRMED  
* **Traceability:**  
  * Business Requirement: BRQ-OCOP-001  
  * Business Process: BP-OCOP-001  
  * Business Rules: BR-OCOP-001, BR-OCOP-002  
  * Primary Actors: ACT-01 (HTX\_OWNER / OCOP\_SUBJECT), ACT-03 (OCOP\_PREPARER)  
* **Preconditions:** Sản phẩm HTX đã được khai báo trên hệ thống; Bộ tiêu chí OCOP tương ứng đang hoạt động.  
* **Inputs:** Mã sản phẩm HTX, Ngành/Nhóm sản phẩm OCOP (theo Phụ lục I QĐ 148/QĐ-TTg), Lần đăng ký (LAN\_DAU, NANG\_HANG, DANH\_GIA\_LAI), Chọn Phiên bản bộ tiêu chí áp dụng (criteria\_version\_id).  
* **System Behavior:**  
  * Kiểm tra sản phẩm bắt buộc tồn tại trong danh mục (BR-OCOP-001).  
  * Gán cố định phiên bản bộ tiêu chí (criteria\_version\_id) vào hồ sơ OCOP ngay khi khởi tạo (BR-OCOP-002).  
  * Tạo hồ sơ OCOP mới ở trạng thái khởi đầu DRAFT.  
  * Tự động sinh cấu trúc biểu mẫu điện tử: Phiếu đăng ký (Biểu số 1), Báo cáo tự đánh giá (Biểu số 2\) và Cây danh mục minh chứng tương ứng.  
* **Outputs:** Bản ghi Hồ sơ OCOP (ocop\_application\_id) được khởi tạo ở trạng thái DRAFT.  
* **Permission & Scope:** OCOP\_APPLICATION.CREATE | Scope: Own HTX.  
* **Audit:** Ghi log OCOP\_APPLICATION\_CREATED.  
* **Acceptance Criteria:**  
  * Không thể tạo hồ sơ OCOP nếu chưa gắn với sản phẩm và phiên bản tiêu chí hợp lệ.

## **FR-OCOP-002: Cấu hình và Quản lý Phiên bản Bộ Tiêu chí OCOP**

* **Priority:** P0 | **Status:** CONFIRMED  
* **Traceability:**  
  * Business Requirement: BRQ-OCOP-002  
  * Business Process: BP-OCOP-002  
  * Business Rules: BR-OCOP-002, BR-OCOP-003, BR-VERSION-001, BR-CALC-003  
  * Primary Actors: ACT-08 (CRITERIA\_ADMIN)  
* **Preconditions:** Đăng nhập với vai trò Quản trị bộ tiêu chí.  
* **Inputs:** Mã bộ tiêu chí, Tên phiên bản, Căn cứ pháp lý (Quyết định 148/QĐ-TTg / Quyết định 1489/QĐ-TTg), Ngày có hiệu lực, Cấu trúc phân cấp:  
  $$\\text{Criteria Set} \\rightarrow \\text{Version} \\rightarrow \\text{Phần (A, B, C)} \\rightarrow \\text{Nhóm Tiêu chí} \\rightarrow \\text{Chỉ tiêu con} \\rightarrow \\text{Thang điểm / Phương án lựa chọn}$$  
  Khai báo cờ chỉ tiêu bắt buộc khống chế (is\_mandatory\_star\_3, is\_mandatory\_star\_4, is\_mandatory\_star\_5).  
* **System Behavior:**  
  * Kiểm tra tổng điểm tối đa của toàn bộ cây chỉ tiêu trong phiên bản: Bắt buộc $\\sum \\text{MaxScore} \= 100.00\\text{ điểm}$.  
  * Cho phép lưu bản nháp (DRAFT\_VERSION) \-\> Khi phát hành (PUBLISH): Chuyển trạng thái ACTIVE\_VERSION.  
  * **Nguyên tắc Bất biến:** Phiên bản tiêu chí đã ở trạng thái ACTIVE\_VERSION và đã được sử dụng cho bất kỳ hồ sơ nào thì **TUYỆT ĐỐI KHÔNG CHO PHÉP CHỈNH SỬA ĐÈ**. Mọi sự thay đổi pháp lý bắt buộc phải tạo một Version mới (BR-OCOP-003, BR-VERSION-001).  
* **Exceptions:** Tổng điểm khác 100 điểm \-\> Chặn phát hành, báo lỗi ERR\_CRITERIA\_TOTAL\_SCORE\_INVALID.  
* **Outputs:** Phiên bản bộ tiêu chí OCOP hoạt động chính xác trên hệ thống.  
* **Permission & Scope:** CRITERIA.MANAGE, CRITERIA.PUBLISH | Scope: Global.  
* **Audit:** Ghi log CRITERIA\_VERSION\_PUBLISHED (Quyền nhạy cảm bắt buộc audit chi tiết).  
* **Acceptance Criteria:**  
  * Đảm bảo tính toàn vẹn 100% của các hồ sơ lịch sử khi có phiên bản tiêu chí mới được ban hành.

## **FR-OCOP-003: Thực hiện Tự đánh giá & Giải trình Hồ sơ (Biểu số 2\)**

* **Priority:** P0 | **Status:** CONFIRMED  
* **Traceability:**  
  * Business Requirement: BRQ-OCOP-003  
  * Business Process: BP-OCOP-003  
  * Business Rules: BR-OCOP-004, BR-OCOP-006, BR-CALC-001, BR-CALC-003  
  * Primary Actors: ACT-01 (HTX\_OWNER), ACT-03 (OCOP\_PREPARER)  
* **Preconditions:** Hồ sơ OCOP ở trạng thái cho phép chỉnh sửa (DRAFT, SELF\_ASSESSING, NEED\_REVISION).  
* **Inputs:** Mã hồ sơ OCOP, Điểm tự chấm/Lựa chọn phương án đạt điểm cho từng chỉ tiêu, Nội dung giải trình thuyết minh chi tiết cho từng chỉ tiêu, Danh sách liên kết tệp minh chứng.  
* **System Behavior:**  
  * Kiểm tra trạng thái hồ sơ: Chỉ cho phép chỉnh sửa khi ở trạng thái hợp lệ (BR-OCOP-004).  
  * Tiếp nhận lựa chọn phương án của chủ thể cho từng chỉ tiêu:  
    $$\\text{criterion\\\_score} \= \\text{selected\\\_option.point\\\_value}$$  
  * Tự động tính tổng điểm tự đánh giá bằng phép cộng dồn: $\\text{total\\\_self\\\_score} \= \\sum \\text{criterion\\\_score}$ (BR-OCOP-006, BR-CALC-001). Tuyệt đối không cho phép nhập tay trực tiếp ô tổng điểm.  
  * Kiểm tra điểm nhập từng chỉ tiêu: $0 \\le \\text{criterion\\\_score} \\le \\text{max\\\_score}$ (BR-CALC-003).  
  * Lưu trữ nội dung giải trình thuyết minh và các liên kết minh chứng tương ứng.  
* **Outputs:** Báo cáo tự đánh giá Biểu số 2 điện tử được cập nhật tổng điểm tự động.  
* **Permission & Scope:** OCOP\_APPLICATION.SELF\_ASSESS | Scope: Own HTX.  
* **Audit:** Ghi log SELF\_ASSESSMENT\_UPDATED.  
* **Acceptance Criteria:**  
  * Tổng điểm tự đánh giá tự động nhảy số chính xác ngay khi người dùng thay đổi lựa chọn chỉ tiêu.

## **FR-OCOP-004: Chấm điểm Độc lập của Thành viên Hội đồng (Evaluator Scoring)**

* **Priority:** P0 | **Status:** CONFIRMED  
* **Traceability:**  
  * Business Requirement: BRQ-OCOP-004  
  * Business Process: BP-OCOP-006  
  * Business Rules: BR-OCOP-007, BR-SEC-002, BR-CALC-001, BR-CALC-003  
  * Primary Actors: ACT-04 (EVALUATOR), ACT-05 (COUNCIL\_MEMBER)  
* **Preconditions:** Hồ sơ OCOP ở trạng thái EVALUATING; Giám khảo được phân công vào Phiên đánh giá (Evaluation Session).  
* **Inputs:** Mã phiên đánh giá, Mã hồ sơ OCOP, Điểm chấm chi tiết cho từng chỉ tiêu của giám khảo, Nhận xét/Ý kiến đánh giá bằng văn bản cho từng tiêu chí.  
* **System Behavior:**  
  * Hiển thị giao diện chấm thi: Xem song song tài liệu thuyết minh/tệp minh chứng và phiếu chấm điểm.  
  * Ghi nhận điểm số chi tiết từng chỉ tiêu do giám khảo lựa chọn.  
  * Kiểm tra tính độc lập tuyệt đối:  
    * Mỗi giám khảo sở hữu một bản ghi Phiếu chấm điểm riêng biệt (BR-OCOP-007).  
    * Giám khảo **TUYỆT ĐỐI KHÔNG THỂ XEM HOẶC SỬA ĐIỂM** của giám khảo khác (BR-SEC-002).  
  * Giám khảo click "Hoàn thành & Khóa phiếu chấm" \-\> Hệ thống khóa bản ghi phiếu chấm của giám khảo đó, không cho phép chỉnh sửa thêm trừ khi có lệnh mở phiên từ Thư ký Hội đồng.  
* **Outputs:** Phiếu chấm điểm cá nhân của giám khảo được lưu và khóa sổ.  
* **Permission & Scope:** OCOP\_EVALUATION.SCORE, OCOP\_EVALUATION.LOCK | Scope: Assigned Evaluation Session.  
* **Audit:** Ghi log EVALUATION\_SCORE\_SUBMITTED, EVALUATION\_LOCKED (Kèm before/after nếu có mở khóa sửa điểm).  
* **Acceptance Criteria:**  
  * Đảm bảo 100% tính bảo mật và độc lập giữa các giám khảo trong suốt quá trình chấm điểm.

## **FR-OCOP-005: Tự động Tổng hợp Điểm Hội đồng & Cảnh báo Lệch điểm**

* **Priority:** P0 | **Status:** CONFIRMED / TO\_VERIFY  
* **Traceability:**  
  * Business Requirement: BRQ-OCOP-005  
  * Business Process: BP-OCOP-007  
  * Business Rules: BR-OCOP-008, BR-OCOP-009, BR-CALC-001  
  * Primary Actors: ACT-06 (COUNCIL\_SECRETARY)  
* **Preconditions:** Tất cả các thành viên Hội đồng được phân công đã hoàn thành và khóa phiếu chấm.  
* **Inputs:** Lệnh tổng hợp điểm từ Thư ký Hội đồng.  
* **System Behavior:**  
  * Kiểm tra 100% phiếu chấm hợp lệ đã được khóa.  
  * Tính điểm trung bình cộng của Hội đồng:  
    $$\\text{Average Score} \= \\frac{\\sum\_{i=1}^{N} \\text{Evaluator\\\_Score}\_i}{N} \\quad (\\text{với } N \\text{ là số giám khảo hợp lệ})$$  
  * Thuật toán kiểm toán độ lệch điểm (BR-OCOP-009):  
    $$\\Delta \= \\text{Score}\_{\\max} \- \\text{Score}\_{\\min}$$  
    * Nếu $\\Delta \> 10.00\\text{ điểm}$: Hệ thống hiển thị **CẢNH BÁO ĐỎ**, tự động khóa chức năng chốt kết quả và thông báo yêu cầu Hội đồng tổ chức hội ý chấm lại theo quy định QĐ 148/1489.  
  * Tổng hợp Bảng ma trận điểm chi tiết của toàn bộ Hội đồng.  
* **Outputs:** Bảng điểm tổng hợp Hội đồng OCOP điện tử, Trạng thái cảnh báo lệch điểm.  
* **Permission & Scope:** OCOP\_EVALUATION.CONSOLIDATE | Scope: Assigned Evaluation Session.  
* **Audit:** Ghi log COUNCIL\_SCORES\_CONSOLIDATED.  
* **Acceptance Criteria:**  
  * Tính toán điểm trung bình chính xác đến 2 chữ số thập phân; cảnh báo lập tức khi $\\Delta \> 10.00$ điểm.

## **FR-OCOP-006: Đề xuất Phân hạng Sao & Kiểm soát Điều kiện Khống chế Hạ sao**

* **Priority:** P0 | **Status:** CONFIRMED / TO\_VERIFY  
* **Traceability:**  
  * Business Requirement: BRQ-OCOP-006  
  * Business Process: BP-OCOP-007  
  * Business Rules: BR-OCOP-010, BR-OCOP-011  
  * Primary Actors: ACT-06 (COUNCIL\_SECRETARY), ACT-07 (AUTHORITY)  
* **Preconditions:** Điểm trung bình Hội đồng đã được tổng hợp hợp lệ.  
* **Inputs:** Điểm trung bình Hội đồng, Danh mục kết quả đạt/không đạt của các chỉ tiêu có cờ bắt buộc dấu sao (\*).  
* **System Behavior:**  
  * Xác định mức sao theo khung tổng điểm thuần túy (score\_based\_star):  
    * $90.00 \\le \\text{Score} \\le 100.00 \\rightarrow \\text{Hạng 5 Sao}$  
    * $70.00 \\le \\text{Score} \< 90.00 \\rightarrow \\text{Hạng 4 Sao}$  
    * $50.00 \\le \\text{Score} \< 70.00 \\rightarrow \\text{Hạng 3 Sao}$  
    * $30.00 \\le \\text{Score} \< 50.00 \\rightarrow \\text{Hạng 2 Sao}$  
    * $\\text{Score} \< 30.00 \\rightarrow \\text{Hạng 1 Sao}$  
  * **Thuật toán Khống chế Hạ sao (BR-OCOP-010, BR-OCOP-011):**  
    * Quét toàn bộ các chỉ tiêu bắt buộc dấu sao của mức hạng tương ứng.  
    * Nếu đạt điểm khung 4 sao ($\\ge 70$đ) nhưng **thiếu bất kỳ chỉ tiêu bắt buộc dấu sao nào của hạng 4 sao** (ví dụ: thiếu chứng nhận VietGAP/HACCP, thiếu bảo hộ SHTT) \-\> Tự động khống chế hạ mức xếp hạng đề xuất xuống **tối đa 3 Sao**.  
    * Nếu đạt điểm khung 5 sao ($\\ge 90$đ) nhưng thiếu chỉ tiêu bắt buộc dấu sao của hạng 5 sao \-\> Tự động khống chế hạ mức xếp hạng đề xuất xuống **tối đa 4 Sao** (hoặc 3 sao tùy mức vi phạm).  
  * Thiết lập kết quả phân hạng đề xuất (Proposed Classification), phân biệt rõ ràng với kết quả phê duyệt chính thức (Final Result).  
* **Outputs:** Báo cáo kết quả đánh giá và đề xuất phân hạng sao OCOP.  
* **Permission & Scope:** OCOP\_RESULT.PROPOSE | Scope: Assigned Application.  
* **Audit:** Ghi log STAR\_RATING\_PROPOSED kèm giải trình khống chế hạ sao (nếu có).  
* **Acceptance Criteria:**  
  * Không bao giờ đề xuất sản phẩm đạt 4 sao hoặc 5 sao nếu hồ sơ còn thiếu chỉ tiêu khống chế bắt buộc dấu sao.

## **FR-OCOP-007: Phê duyệt Kết quả Chính thức & Theo dõi Thời hạn Hiệu lực (36 Tháng)**

* **Priority:** P1 | **Status:** TO\_VERIFY  
* **Traceability:**  
  * Business Requirement: BRQ-OCOP-007  
  * Business Process: BP-OCOP-008  
  * Business Rules: BR-OCOP-012, BR-DATA-002  
  * Primary Actors: ACT-07 (AUTHORITY / DECISION\_MAKER)  
* **Preconditions:** Hồ sơ ở trạng thái PENDING\_DECISION; Cấp phê duyệt có đúng thẩm quyền (UBND Tỉnh duyệt 3-4 sao, Bộ NN\&PTNT duyệt 5 sao theo QĐ 1489/QĐ-TTg).  
* **Inputs:** Số quyết định công nhận, Ngày ban hành quyết định, Cơ quan ban hành, Mức sao công nhận chính thức, Tệp scan quyết định đính kèm.  
* **System Behavior:**  
  * Người có thẩm quyền phê duyệt kết quả chính thức (Final Result).  
  * Hệ thống chuyển trạng thái hồ sơ sang APPROVED / ACTIVE\_RESULT.  
  * Tự động tính toán mốc thời gian hết hạn chứng nhận OCOP (BR-OCOP-012):  
    $$\\text{Expiration Date} \= \\text{Decision Date} \+ 36\\text{ tháng}$$  
  * Hệ thống kích hoạt dịch vụ tự động đếm ngược: Gửi thông báo nhắc nhở HTX làm thủ tục đánh giá lại trước **30 ngày** tính đến ngày hết hạn hiệu lực.  
* **Outputs:** Bản ghi Kết quả OCOP chính thức, Giấy chứng nhận OCOP điện tử.  
* **Permission & Scope:** OCOP\_RESULT.APPROVE | Scope: Authority Scope.  
* **Audit:** Ghi log OCOP\_RESULT\_APPROVED (Sự kiện nhạy cảm cao, lưu vết người duyệt và timestamp).  
* **Acceptance Criteria:**  
  * Hiển thị chính xác trạng thái hiệu lực và ngày đếm ngược hết hạn trên hồ sơ sản phẩm OCOP.

# **9\. Phân hệ Quản lý & Bảo mật Minh chứng OCOP (FR-EVID)**

## **FR-EVID-001: Tải lên, Kiểm tra Định dạng & Lưu trữ Tệp Minh chứng**

* **Priority:** P0 | **Status:** CONFIRMED  
* **Traceability:**  
  * Business Requirement: BRQ-EVIDENCE-001  
  * Business Process: BP-OCOP-004  
  * Business Rules: BR-EVIDENCE-001, BR-EVIDENCE-003, BR-DATA-006  
  * Primary Actors: ACT-01 (HTX\_OWNER), ACT-03 (OCOP\_PREPARER)  
* **Preconditions:** Hồ sơ OCOP đang ở trạng thái cho phép nộp minh chứng.  
* **Inputs:** Tệp tin tải lên (PDF, JPG, PNG), Tên tài liệu mô tả, Số hiệu văn bản, Ngày phát hành, Ngày hết hạn văn bản (nếu có).  
* **System Behavior:**  
  * Kiểm tra tính hợp lệ kỹ thuật của tệp:  
    * Định dạng MIME cho phép: application/pdf, image/jpeg, image/png.  
    * Dung lượng tối đa: $\\le 50\\text{MB/file}$ (BR-EVIDENCE-003).  
  * Tải tệp lên Object Storage (MinIO S3 Vault) theo cấu trúc thư mục bảo mật:  
    ocop-evidence-vault/{coop\_code}/{application\_id}/{file\_id}  
  * Lưu bản ghi metadata minh chứng vào Database (BR-DATA-006).  
* **Exceptions:** Tệp sai định dạng (ví dụ: .exe, .bat) hoặc vượt 50MB \-\> Báo lỗi ERR\_INVALID\_FILE\_FORMAT\_OR\_SIZE.  
* **Outputs:** Bản ghi minh chứng (evidence\_id) được khởi tạo thành công.  
* **Permission & Scope:** OCOP\_EVIDENCE.UPLOAD | Scope: Own HTX.  
* **Audit:** Ghi log EVIDENCE\_UPLOADED.  
* **Acceptance Criteria:**  
  * Chặn đứng 100% các tệp tin không đúng định dạng an toàn hoặc vượt dung lượng cho phép.

## **FR-EVID-002: Ánh xạ Đa chiều Minh chứng với Chỉ tiêu Đánh giá**

* **Priority:** P0 | **Status:** CONFIRMED  
* **Traceability:**  
  * Business Requirement: BRQ-EVIDENCE-002  
  * Business Process: BP-OCOP-004  
  * Business Rules: BR-EVIDENCE-002  
  * Primary Actors: ACT-01 (HTX\_OWNER), ACT-03 (OCOP\_PREPARER)  
* **Preconditions:** Tệp minh chứng đã được tải lên; Chỉ tiêu đánh giá hợp lệ.  
* **Inputs:** Mã minh chứng (evidence\_id), Danh sách mã chỉ tiêu liên kết (indicator\_ids), Trang tham chiếu trong tài liệu.  
* **System Behavior:**  
  * Thiết lập mối quan hệ ánh xạ nhiều \- nhiều ($N \- N$) giữa minh chứng và chỉ tiêu (BR-EVIDENCE-002):  
    * 01 tệp minh chứng (ví dụ: Giấy phép ATTP) có thể gán cho nhiều chỉ tiêu khác nhau.  
    * 01 chỉ tiêu có thể chứa nhiều tệp minh chứng phụ trợ.  
  * Cho phép người đánh giá click mở trực tiếp tệp minh chứng tương ứng khi chấm từng chỉ tiêu cụ thể.  
* **Outputs:** Bảng liên kết evidence\_indicator\_mappings được cập nhật.  
* **Permission & Scope:** OCOP\_EVIDENCE.ATTACH | Scope: Own HTX.  
* **Audit:** Ghi log EVIDENCE\_MAPPED\_TO\_INDICATOR.  
* **Acceptance Criteria:**  
  * Mở xem minh chứng mượt mà trực tiếp từ màn hình chấm thi của giám khảo.

## **FR-EVID-003: Quản lý Phiên bản Minh chứng (Evidence Versioning) & Bảo toàn Lịch sử**

* **Priority:** P0 | **Status:** PROPOSED  
* **Traceability:**  
  * Business Requirement: BRQ-EVIDENCE-003  
  * Business Process: BP-OCOP-004, BP-OCOP-005  
  * Business Rules: BR-EVIDENCE-004, BR-EVIDENCE-006, BR-VERSION-002  
  * Primary Actors: ACT-01 (HTX\_OWNER), ACT-03 (RECEIVING\_REVIEWER)  
* **Preconditions:** Hồ sơ OCOP có yêu cầu chỉnh sửa minh chứng (NEED\_REVISION).  
* **Inputs:** Mã minh chứng cũ, Tệp tin minh chứng mới thay thế, Lý do thay thế.  
* **System Behavior:**  
  * Khi người dùng tải lên tệp thay thế: Hệ thống **TUYỆT ĐỐI KHÔNG XÓA HOẶC GHI ĐÈ** tệp cũ (BR-EVIDENCE-004, BR-VERSION-002).  
  * Đánh dấu bản cũ: Chuyển trạng thái sang REPLACED / ARCHIVED.  
  * Tạo bản ghi mới: Evidence Version v2 ở trạng thái ACTIVE kèm liên kết cha parent\_evidence\_id.  
  * Lưu vết lý do thay thế phục vụ Hội đồng đối chiếu khi thẩm định lại.  
* **Outputs:** Phiên bản minh chứng mới được kích hoạt; bảo toàn nguyên vẹn phiên bản cũ.  
* **Permission & Scope:** OCOP\_EVIDENCE.REPLACE | Scope: Own HTX.  
* **Audit:** Ghi log EVIDENCE\_VERSION\_REPLACED (Lưu rõ ID bản cũ và bản mới).  
* **Acceptance Criteria:**  
  * Truy cứu được lịch sử toàn bộ các lần thay thế minh chứng trong suốt vòng đời hồ sơ.

## **FR-EVID-004: Thẩm định & Xác minh Trạng thái Minh chứng**

* **Priority:** P0 | **Status:** TO\_VERIFY  
* **Traceability:**  
  * Business Requirement: BRQ-EVIDENCE-004  
  * Business Process: BP-OCOP-005  
  * Business Rules: BR-EVIDENCE-005, BR-EVIDENCE-006  
  * Primary Actors: ACT-03 (RECEIVING\_REVIEWER), ACT-05 (EVIDENCE\_REVIEWER)  
* **Preconditions:** Hồ sơ đang trong giai đoạn thẩm định (IN\_REVIEW).  
* **Inputs:** Mã minh chứng, Trạng thái xác minh (VERIFIED, REJECTED), Lý do/Ghi chú từ chối nếu không đạt.  
* **System Behavior:**  
  * Cán bộ thẩm định xem xét nội dung tệp minh chứng.  
  * Cập nhật trạng thái xác minh:  
    * Nếu hợp lệ \-\> Đánh dấu VERIFIED.  
    * Nếu không đạt (mờ, hết hạn, thiếu căn cứ) \-\> Đánh dấu REJECTED, bắt buộc nhập lý do chi tiết.  
  * Khóa tệp minh chứng đã được xác nhận VERIFIED, không cho phép HTX tự ý chỉnh sửa trừ khi có yêu cầu bổ sung chính thức (BR-EVIDENCE-006).  
* **Outputs:** Trạng thái xác minh của minh chứng được cập nhật; danh sách lỗi sai gửi về HTX.  
* **Permission & Scope:** OCOP\_EVIDENCE.VERIFY | Scope: Assigned Application.  
* **Audit:** Ghi log EVIDENCE\_VERIFIED / EVIDENCE\_REJECTED (Quyền nhạy cảm bắt buộc audit).  
* **Acceptance Criteria:**  
  * Hiển thị rõ ràng danh mục các minh chứng bị từ chối kèm lý do trên giao diện của chủ thể HTX.

## **FR-EVID-005: Kiểm soát Quyền Truy cập Tệp qua Signed URL An toàn**

* **Priority:** P0 | **Status:** CONFIRMED  
* **Traceability:**  
  * Business Requirement: BRQ-EVIDENCE-005  
  * Business Process: BP-OCOP-004  
  * Business Rules: BR-EVIDENCE-005, BR-SEC-005  
  * Primary Actors: Toàn bộ hệ thống  
* **Preconditions:** Người dùng gửi yêu cầu xem/tải tệp minh chứng.  
* **Inputs:** Mã tệp tin (file\_id), Token xác thực người dùng.  
* **System Behavior:**  
  * Hệ thống xác thực danh tính và kiểm tra quyền hạn (Role & Data Scope) của người dùng đối với hồ sơ chứa tệp tin đó (BR-EVIDENCE-005).  
  * Nếu không có quyền \-\> Chặn truy cập, trả mã lỗi 403 Forbidden.  
  * Nếu có quyền \-\> Backend tạo một đường dẫn có chữ ký số tạm thời (**Signed URL / Presigned URL**) với thời gian hết hạn ngắn (cấu hình mặc định: **15 phút**).  
  * Tuyệt đối không để lộ đường dẫn tĩnh (Static Public URL) hoặc secret key của kho MinIO ra ngoài Client.  
* **Outputs:** Đường dẫn Signed URL tạm thời cho phép xem tệp tin an toàn.  
* **Permission & Scope:** OCOP\_EVIDENCE.READ | Scope: Authorized Scope.  
* **Audit:** Ghi log EVIDENCE\_FILE\_ACCESSED.  
* **Acceptance Criteria:**  
  * Không thể truy cập tệp tin nếu không đăng nhập hoặc dùng đường dẫn đã quá hạn 15 phút.

## **FR-EVID-006: Tự động Tái sử dụng Dữ liệu Canh tác làm Minh chứng Động (Dynamic Pull)**

* **Priority:** P1 | **Status:** INFERRED  
* **Traceability:**  
  * Business Requirement: BRQ-EVIDENCE-006  
  * Business Process: BP-OCOP-004, BP-PROD-001  
  * Business Rules: BR-EVIDENCE-007, BR-AUDIT-004  
  * Primary Actors: ACT-01 (HTX\_OWNER), ACT-03 (OCOP\_PREPARER)  
* **Preconditions:** HTX đã có dữ liệu nhật ký canh tác VietGAP / vùng trồng / giao dịch kho được lưu trữ trên hệ thống.  
* **Inputs:** Mã hồ sơ OCOP, Mã chỉ tiêu cần liên kết (ví dụ: Chỉ tiêu C.10 \- Quản lý chất lượng tiên tiến VietGAP), Lựa chọn nguồn dữ liệu (FARMING\_DIARY, PUC\_RECORD, MEMBER\_LIST).  
* **System Behavior:**  
  * Người dùng chọn tính năng "Liên kết dữ liệu nội bộ HTX".  
  * Hệ thống tự động truy vấn dữ liệu từ phân hệ Canh tác/Thành viên, tổng hợp và kết xuất tệp tin PDF tương ứng (ví dụ: Sổ nhật ký sản xuất VietGAP điện tử niên vụ gần nhất).  
  * Tự động nạp tệp PDF này vào kho minh chứng OCOP và gán liên kết nguồn dữ liệu gốc (source\_entity \= 'farming\_logs', source\_id \= 'season\_2026') (BR-EVIDENCE-007, BR-AUDIT-004).  
* **Outputs:** Minh chứng OCOP được tạo tự động từ dữ liệu nội bộ, có gắn cờ truy vết nguồn gốc.  
* **Permission & Scope:** OCOP\_EVIDENCE.DYNAMIC\_PULL | Scope: Own HTX.  
* **Audit:** Ghi log DYNAMIC\_EVIDENCE\_GENERATED.  
* **Acceptance Criteria:**  
  * Tiết kiệm thao tác nhập liệu thủ công cho HTX; bảo đảm tính trung thực và truy vết được dữ liệu nguồn.

# **10\. Phân hệ Máy trạng thái Quy trình & Khóa dữ liệu (FR-WKFL)**

## **FR-WKFL-001: Quản trị Máy trạng thái Quy trình Hồ sơ (State Machine Engine)**

* **Priority:** P0 | **Status:** PROPOSED  
* **Traceability:**  
  * Business Requirement: BRQ-WORKFLOW-001  
  * Business Process: BP-OCOP-001/005/006/007  
  * Business Rules: BR-WORKFLOW-001, BR-WORKFLOW-002, BR-WORKFLOW-005  
  * Primary Actors: Toàn bộ hệ thống  
* **Preconditions:** Hồ sơ OCOP đang ở một trạng thái xác định trong vòng đời.  
* **Inputs:** Trạng thái hiện tại (current\_state), Sự kiện chuyển bước (transition\_event), Vai trò người thực hiện (actor\_role).  
* **System Behavior:**  
  * Quản lý toàn bộ vòng đời hồ sơ OCOP thông qua State Machine tại Backend (BR-WORKFLOW-001):  
  * Plaintext

DRAFT ──────────────► READY\_FOR\_SUBMISSION ────────► SUBMITTED  
                                                          │  
COMMUNE\_APPROVED ◄────── IN\_REVIEW ◄──────────────────────┘  
       │                     │  
       │                     ▼  
       │               NEED\_REVISION ──► RESUBMITTED ──► IN\_REVIEW  
       ▼  
READY\_FOR\_EVALUATION ──► EVALUATING ──► CONSOLIDATED ──► PENDING\_DECISION ──► APPROVED / REJECTED

*   
  *   
  * Kiểm tra tính hợp lệ của bước chuyển dịch theo Ma trận chuyển đổi (Transition Matrix).  
  * Kiểm tra điều kiện thẩm quyền (Role, Permission, Data Scope) trước khi thực thi chuyển bước (BR-WORKFLOW-005).  
  * Ngăn chặn tuyệt đối việc nhảy cóc bước (ví dụ: chuyển từ DRAFT thẳng sang APPROVED theo BR-WORKFLOW-002).  
* **Exceptions:** Chuyển trạng thái không hợp lệ \-\> Chặn và trả mã lỗi ERR\_INVALID\_WORKFLOW\_TRANSITION.  
* **Outputs:** Trạng thái hồ sơ được cập nhật mới; kích hoạt các sự kiện liên đới (gửi thông báo, khóa dữ liệu).  
* **Permission & Scope:** Kiểm soát động theo ma trận phân quyền quy trình.  
* **Audit:** Ghi log WORKFLOW\_TRANSITION\_EXECUTED (Lưu trạng thái cũ, trạng thái mới, lý do).  
* **Acceptance Criteria:**  
  * Không một API nào có thể ép thay đổi trạng thái hồ sơ nếu không thỏa mãn Transition Matrix của Backend.

## **FR-WKFL-002: Kiểm tra Điều kiện Trước khi Nộp Hồ sơ (Pre-submission Gatekeeper)**

* **Priority:** P0 | **Status:** CONFIRMED  
* **Traceability:**  
  * Business Requirement: BRQ-WORKFLOW-002  
  * Business Process: BP-OCOP-001, BP-OCOP-003  
  * Business Rules: BR-OCOP-005, BR-WORKFLOW-002  
  * Primary Actors: ACT-01 (HTX\_OWNER), ACT-03 (OCOP\_PREPARER)  
* **Preconditions:** Hồ sơ ở trạng thái DRAFT hoặc SELF\_ASSESSING.  
* **Inputs:** Lệnh yêu cầu nộp hồ sơ (SUBMIT\_APPLICATION).  
* **System Behavior:**  
  * Tự động chạy thuật toán kiểm toán trước khi nộp (BR-OCOP-005):  
    * Kiểm tra 100% các chỉ tiêu trong bộ tiêu chí đã được tự đánh giá điểm (không bỏ sót bất kỳ câu nào).  
    * Kiểm tra nội dung thuyết minh bắt buộc ở các phần lớn (A, B, C) đã được điền đầy đủ.  
    * Kiểm tra tính sẵn có của các tệp minh chứng bắt buộc theo checklist hồ sơ.  
    * Kiểm tra tính hợp lệ của thông tin pháp nhân HTX và sản phẩm.  
  * Nếu phát hiện thiếu sót \-\> Chặn hành động gửi nộp, trả về Báo cáo danh sách các lỗi còn thiếu (Validation Error Report).  
  * Nếu đầy đủ 100% \-\> Chuyển trạng thái hồ sơ sang SUBMITTED.  
* **Exceptions:** Thiếu tiêu chí chưa chấm hoặc thiếu minh chứng bắt buộc \-\> Báo lỗi ERR\_SUBMISSION\_CHECKLIST\_INCOMPLETE.  
* **Outputs:** Hồ sơ được chuyển trạng thái nộp thành công (SUBMITTED).  
* **Permission & Scope:** OCOP\_APPLICATION.SUBMIT | Scope: Own HTX.  
* **Audit:** Ghi log OCOP\_APPLICATION\_SUBMITTED.  
* **Acceptance Criteria:**  
  * Chặn đứng 100% các hồ sơ nộp thiếu thông tin hoặc chưa hoàn thành tự đánh giá.

## **FR-WKFL-003: Quản lý Vòng lặp Yêu cầu Chỉnh sửa & Bổ sung Hồ sơ (Revision Loop)**

* **Priority:** P0 | **Status:** CONFIRMED  
* **Traceability:**  
  * Business Requirement: BRQ-WORKFLOW-003  
  * Business Process: BP-OCOP-005  
  * Business Rules: BR-WORKFLOW-003, BR-WORKFLOW-004  
  * Primary Actors: ACT-03 (RECEIVING\_REVIEWER), ACT-01 (HTX\_OWNER)  
* **Preconditions:** Hồ sơ đang trong quá trình kiểm tra thẩm định (IN\_REVIEW).  
* **Inputs:** Danh sách chỉ tiêu yêu cầu chỉnh sửa, Nội dung hướng dẫn sửa đổi cụ thể, Thời hạn hoàn thành bổ sung (ngày).  
* **System Behavior:**  
  * Cán bộ thẩm định tạo Yêu cầu bổ sung \-\> Hệ thống chuyển trạng thái hồ sơ sang NEED\_REVISION (BR-WORKFLOW-003).  
  * Hệ thống gửi thông báo tự động (Notification/Email) đến tài khoản đại diện HTX kèm bảng kê chi tiết các nội dung cần sửa.  
  * Khi ở trạng thái NEED\_REVISION: Hệ thống tự động **MỞ KHÓA** quyền chỉnh sửa cho phép HTX thay thế minh chứng và cập nhật lại nội dung thuyết minh.  
  * HTX hoàn thiện và bấm "Nộp lại hồ sơ" \-\> Hệ thống chuyển trạng thái sang RESUBMITTED và tự động khóa lại quyền sửa đổi.  
* **Outputs:** Bản ghi Yêu cầu bổ sung hồ sơ, Phiên bản hồ sơ nộp lại được ghi nhận.  
* **Permission & Scope:** OCOP\_APPLICATION.REQUEST\_REVISION, OCOP\_APPLICATION.RESUBMIT | Scope: Assigned Application.  
* **Audit:** Ghi log REVISION\_REQUESTED, APPLICATION\_RESUBMITTED.  
* **Acceptance Criteria:**  
  * Lưu trữ đầy đủ lịch sử trao đổi và các phiên bản sửa đổi giữa cơ quan kiểm tra và chủ thể HTX.

## **FR-WKFL-004: Khóa Dữ liệu Tự động Chống Chỉnh sửa Trái phép**

* **Priority:** P0 | **Status:** PROPOSED  
* **Traceability:**  
  * Business Requirement: BRQ-WORKFLOW-004  
  * Business Process: BP-OCOP-006/007  
  * Business Rules: BR-WORKFLOW-004, BR-DATA-002, BR-OCOP-004  
  * Primary Actors: Toàn bộ hệ thống  
* **Preconditions:** Hồ sơ bước vào các giai đoạn quan trọng (SUBMITTED, IN\_REVIEW, EVALUATING, APPROVED).  
* **Inputs:** Sự kiện chuyển trạng thái hồ sơ.  
* **System Behavior:**  
  * Ngay khi hồ sơ được nộp (SUBMITTED) hoặc bước vào phiên chấm điểm của Hội đồng (EVALUATING): Hệ thống tự động kích hoạt cơ chế **READ-ONLY LOCK** đối với toàn bộ dữ liệu thuyết minh và minh chứng của chủ thể HTX (BR-WORKFLOW-004).  
  * Mọi thao tác sửa đổi, xóa tệp minh chứng từ phía HTX đều bị từ chối tuyệt đối ở cấp độ Backend Policy.  
  * Dữ liệu chỉ được mở khóa khi và chỉ khi có sự kiện chuyển sang NEED\_REVISION được phát động bởi người có thẩm quyền.  
* **Outputs:** Dữ liệu hồ sơ được bảo vệ toàn vẹn nguyên trạng trong suốt thời gian thẩm định.  
* **Permission & Scope:** Backend Enforcement.  
* **Audit:** Ghi log DATA\_LOCK\_ENFORCED.  
* **Acceptance Criteria:**  
  * Không một người dùng nào có thể thay đổi dữ liệu hồ sơ khi đang trong phiên họp chấm điểm của Hội đồng.

# **11\. Phân hệ Bảo mật, Phân quyền & Quản trị Hệ thống (FR-SEC & FR-SYS)**

## **FR-SEC-001: Quản lý Định danh, Xác thực Tập trung & Khóa Tài khoản**

* **Priority:** P0 | **Status:** PROPOSED  
* **Traceability:**  
  * Business Requirement: BRQ-SEC-001  
  * Business Process: 05 (Section 16\)  
  * Business Rules: BR-SEC-001  
  * Primary Actors: ACT-09 (SYSTEM\_ADMIN)  
* **Preconditions:** Đăng nhập với quyền Quản trị hệ thống.  
* **Inputs:** Tên đăng nhập, Mật khẩu, Họ tên, Email, Số điện thoại, Đơn vị trực thuộc (HTX / Cơ quan quản lý), Trạng thái (ACTIVE, LOCKED).  
* **System Behavior:**  
  * Quản lý tài khoản người dùng, mã hóa mật khẩu theo tiêu chuẩn an toàn (Argon2/Bcrypt).  
  * Kiểm soát xác thực: Hỗ trợ xác thực đa yếu tố (2FA) đối với các vai trò quản trị và giám khảo chấm điểm.  
  * Khóa tài khoản tức thời khi phát hiện vi phạm bảo mật hoặc theo yêu cầu hành chính. Người dùng bị khóa không thể đăng nhập hoặc gọi API.  
* **Outputs:** Tài khoản người dùng được khởi tạo và quản lý an toàn.  
* **Permission & Scope:** USER.MANAGE | Scope: Global.  
* **Audit:** Ghi log USER\_CREATED, USER\_LOCKED.  
* **Acceptance Criteria:**  
  * Vô hiệu hóa phiên làm việc ngay lập tức khi tài khoản bị chuyển sang trạng thái LOCKED.

## **FR-SEC-002: Phân quyền Vai trò Chi tiết (RBAC Engine) & Ngăn chặn Bypass**

* **Priority:** P0 | **Status:** CONFIRMED  
* **Traceability:**  
  * Business Requirement: BRQ-SEC-002  
  * Business Process: 05 (ACTORS\_AND\_ROLES)  
  * Business Rules: BR-SEC-001, BR-SEC-005  
  * Primary Actors: ACT-09 (SYSTEM\_ADMIN)  
* **Preconditions:** Danh mục Quyền (Permissions) đã được định nghĩa trong hệ thống.  
* **Inputs:** Gán Role cho User, Danh sách Permission theo chuẩn \<RESOURCE\>.\<ACTION\>.  
* **System Behavior:**  
  * Quản lý 13 vai trò chuẩn: HTX\_OWNER, HTX\_STAFF, OCOP\_PREPARER, RECEIVING\_REVIEWER, EVIDENCE\_REVIEWER, EVALUATOR, COUNCIL\_MEMBER, COUNCIL\_SECRETARY, AUTHORITY, CRITERIA\_ADMIN, SYSTEM\_ADMIN, REPORT\_VIEWER, AUDITOR.  
  * Kiểm tra phân quyền đa tầng tại Backend Middleware:  
    $$\\text{ALLOW} \= \\text{Valid User} \\land \\text{Has Permission} \\land \\text{Valid Scope} \\land \\text{Valid State} \\land \\text{Business Rules Pass}$$  
  * **Ngăn chặn Admin Bypass:** Quản trị kỹ thuật (SYSTEM\_ADMIN) không mặc định có quyền phê duyệt kết quả OCOP hoặc sửa điểm chấm của Hội đồng (BR-SEC-001).  
* **Outputs:** Ma trận phân quyền RBAC được thực thi nghiêm ngặt tại Backend.  
* **Permission & Scope:** ROLE.MANAGE | Scope: Global.  
* **Audit:** Ghi log USER\_ROLE\_ASSIGNED (Quyền nhạy cảm cao bắt buộc audit).  
* **Acceptance Criteria:**  
  * Chặn đứng 100% các request không có đủ Permission tương ứng trong Role của User.

## **FR-SEC-003: Cô lập Phạm vi Dữ liệu Đa tầng (Data Scope Isolation)**

* **Priority:** P0 | **Status:** PROPOSED  
* **Traceability:**  
  * Business Requirement: BRQ-SEC-003  
  * Business Process: 05 (Section 19\)  
  * Business Rules: BR-SEC-005, BR-SEC-006  
  * Primary Actors: Toàn bộ hệ thống  
* **Preconditions:** Người dùng đã được xác thực thành công.  
* **Inputs:** Token người dùng kèm Data Scope Context.  
* **System Behavior:**  
  * Tự động chèn điều kiện lọc phạm vi dữ liệu vào toàn bộ các câu truy vấn Database:  
    * **Own HTX Scope:** Người dùng thuộc HTX nào chỉ truy vấn và thao tác dữ liệu thuộc chính coop\_id của HTX đó (BR-SEC-005). Tuyệt đối không thể truy cập dữ liệu của HTX khác.  
    * **Assigned Session Scope:** Người đánh giá (Evaluator) chỉ truy cập được các hồ sơ thuộc đúng Phiên đánh giá (session\_id) được Thư ký Hội đồng phân công (BR-SEC-006).  
    * **Authority Scope:** Cán bộ cấp nào chỉ truy cập hồ sơ thuộc địa giới hành chính quản lý của cấp đó.  
* **Exceptions:** Truy cập dữ liệu ngoài Scope được cấp \-\> Trả mã lỗi 403 Forbidden và ghi log cảnh báo bảo mật.  
* **Outputs:** Dữ liệu trả về cho Client được cô lập an toàn 100% theo đúng phân vùng được phép.  
* **Permission & Scope:** Backend Data Filter Enforcement.  
* **Audit:** Ghi log cảnh báo SECURITY\_SCOPE\_VIOLATION\_ATTEMPT.  
* **Acceptance Criteria:**  
  * Không thể đọc hoặc sửa đổi dữ liệu của HTX khác ngay cả khi thay đổi tham số ID trên đường dẫn API.

## **FR-SEC-004: Kiểm soát Xung đột Trách nhiệm (Separation of Duties Policy)**

* **Priority:** P0 | **Status:** TO\_VERIFY  
* **Traceability:**  
  * Business Requirement: BRQ-SEC-004  
  * Business Process: 05 (Section 21\)  
  * Business Rules: BR-SEC-001, BR-SEC-002, BR-SEC-003  
  * Primary Actors: ACT-09 (SYSTEM\_ADMIN)  
* **Preconditions:** Gán phân công vai trò hoặc phiên chấm điểm.  
* **Inputs:** Thao tác gán giám khảo chấm điểm hoặc phê duyệt kết quả.  
* **System Behavior:**  
  * Áp dụng các quy tắc kiểm soát xung đột lợi ích:  
    * Một tài khoản đang là người chuẩn bị/đại diện của hồ sơ OCOP (HTX\_OWNER / OCOP\_PREPARER) thì **KHÔNG ĐƯỢC PHÉP ĐỒNG THỜI ĐẢM NHẬN VAI TRÒ GIÁM KHẢO CHẤM ĐIỂM HOẶC CẤP PHÊ DUYỆT** cho chính hồ sơ đó (BR-SEC-003).  
    * Người tải lên minh chứng không đồng thời là người xác minh minh chứng độc lập nếu quy trình yêu cầu tách biệt.  
* **Outputs:** Ngăn chặn các thiết lập phân quyền gây xung đột lợi ích.  
* **Permission & Scope:** POLICY.ENFORCE | Scope: Global.  
* **Audit:** Ghi log SOD\_VIOLATION\_BLOCKED.  
* **Acceptance Criteria:**  
  * Hệ thống tự động từ chối gán tài khoản chủ thể HTX vào danh sách Hội đồng chấm sản phẩm của chính HTX đó.

## **FR-SYS-001: Quản trị Danh mục Dùng chung Hệ thống**

* **Priority:** P1 | **Status:** PROPOSED  
* **Traceability:**  
  * Business Requirement: BRQ-SYS-001  
  * Business Process: 01 (1.5.B), 02 (5.1.A)  
  * Business Rules: BR-DATA-001  
  * Primary Actors: ACT-09 (SYSTEM\_ADMIN)  
* **Preconditions:** Đăng nhập với quyền Quản trị hệ thống.  
* **Inputs:** Danh mục Đơn vị tính, Danh mục Nhóm cây trồng, Danh mục Hoạt chất BVTV, Danh mục Biểu mẫu văn bản.  
* **System Behavior:**  
  * Cho phép thêm, sửa, khóa trạng thái các danh mục nền dùng chung.  
  * Không cho phép xóa vật lý danh mục đã phát sinh liên kết dữ liệu giao dịch trong hệ thống.  
* **Outputs:** Bảng danh mục nền dùng chung được cập nhật.  
* **Permission & Scope:** SYSTEM.CONFIG | Scope: Global.  
* **Audit:** Ghi log SYSTEM\_LOOKUP\_UPDATED.  
* **Acceptance Criteria:**  
  * Dễ dàng mở rộng thêm danh mục mới mà không phải sửa đổi cấu trúc mã nguồn.

## **FR-SYS-002: Tự động Sao lưu và Phục hồi Dữ liệu An toàn**

* **Priority:** P0 | **Status:** CONFIRMED  
* **Traceability:**  
  * Business Requirement: BRQ-SYS-002  
  * Business Process: 01 (1.10), 02 (Section 21\)  
  * Business Rules: BR-DATA-002, BR-DATA-003  
  * Primary Actors: ACT-09 (SYSTEM\_ADMIN)  
* **Preconditions:** Cấu hình hạ tầng lưu trữ sao lưu sẵn sàng.  
* **Inputs:** Lịch sao lưu tự động định kỳ, Lệnh tạo bản sao lưu đột xuất, Lệnh phục hồi từ bản sao lưu chỉ định.  
* **System Behavior:**  
  * Tự động tạo bản sao lưu toàn vẹn (Full Backup) định kỳ hằng ngày cho Cơ sở dữ liệu PostgreSQL và Kho tệp tin MinIO Object Storage.  
  * Mã hóa tệp sao lưu và lưu trữ tại vị trí biệt lập an toàn.  
  * Cung cấp quy trình phục hồi (Restore) có xác thực cấp cao, đảm bảo tính toàn vẹn và nhất quán quan hệ dữ liệu sau khi khôi phục (BR-DATA-003).  
* **Outputs:** Tệp sao lưu nén mã hóa, Báo cáo trạng thái phục hồi hệ thống.  
* **Permission & Scope:** SYSTEM.BACKUP\_RESTORE | Scope: Global.  
* **Audit:** Ghi log DATABASE\_BACKUP\_COMPLETED, SYSTEM\_RESTORE\_EXECUTED.  
* **Acceptance Criteria:**  
  * Khôi phục hệ thống thành công về mốc thời gian sao lưu gần nhất mà không làm sai lệch tính nhất quán dữ liệu.

# **12\. Phân hệ Nhật ký Kiểm toán & Báo cáo Kết xuất (FR-AUD & FR-RPT)**

## **FR-AUD-001: Ghi nhận Nhật ký Kiểm toán Bất biến (Append-only Audit Engine)**

* **Priority:** P0 | **Status:** PROPOSED  
* **Traceability:**  
  * Business Requirement: BRQ-AUDIT-001  
  * Business Process: 05 (Section 18, 24\)  
  * Business Rules: BR-AUDIT-001, BR-AUDIT-002, BR-SEC-004  
  * Primary Actors: Toàn bộ hệ thống  
* **Preconditions:** Phát sinh bất kỳ thao tác nghiệp vụ quan trọng nào trên hệ thống.  
* **Inputs:** Sự kiện hệ thống, Mã người thực hiện (actor\_id), Vai trò (role), Hành động (action), Thực thể tác động (entity), Mã thực thể (entity\_id), Trạng thái trước (before\_state), Trạng thái sau (after\_state), Địa chỉ IP, Dấu thời gian (timestamp).  
* **System Behavior:**  
  * Tự động ghi nhận một bản ghi kiểm toán chuẩn hóa:  
    $$\\text{Audit Log} \= \\langle \\text{actor\\\_id}, \\text{role}, \\text{action}, \\text{entity}, \\text{entity\\\_id}, \\text{timestamp}, \\text{before}, \\text{after}, \\text{ip\\\_address}, \\text{reason} \\rangle$$  
  * Bắt buộc áp dụng cho các hành vi nhạy cảm: Đổi trạng thái hồ sơ OCOP, Chấm điểm/Sửa điểm Hội đồng, Xác minh/Từ chối minh chứng, Phát hành tiêu chí, Xuất kho trả chậm, Điều chỉnh kho, Phê duyệt phân phối thặng dư (BR-AUDIT-001, BR-SEC-004).  
  * **Nguyên tắc Bất biến:** Nhật ký kiểm toán là **APPEND-ONLY**, hoàn toàn không có bất kỳ API, giao diện hoặc quyền quản trị nào cho phép chỉnh sửa hoặc xóa bỏ bản ghi audit (BR-AUDIT-002).  
* **Outputs:** Bản ghi nhật ký kiểm toán được lưu vĩnh viễn trong cơ sở dữ liệu.  
* **Permission & Scope:** AUDIT.READ (Chỉ đọc) | Scope: Authorized Auditor Scope.  
* **Audit:** Tự động ghi nhận bởi hệ thống lõi.  
* **Acceptance Criteria:**  
  * Đảm bảo 100% các hành vi thay đổi dữ liệu nhạy cảm đều có log truy vết không thể chối cãi.

## **FR-AUD-002: Động cơ Truy vết Toàn diện Chuỗi Dữ liệu OCOP & HTX**

* **Priority:** P0 | **Status:** PROPOSED  
* **Traceability:**  
  * Business Requirement: BRQ-AUDIT-002, BRQ-CROSS-001  
  * Business Process: 04 (Section 18\)  
  * Business Rules: BR-AUDIT-003, BR-AUDIT-004  
  * Primary Actors: ACT-07 (AUTHORITY), ACT-09 (AUDITOR)  
* **Preconditions:** Hồ sơ OCOP đã có kết quả đánh giá hoặc đang thẩm định.  
* **Inputs:** Mã hồ sơ OCOP (application\_id) hoặc Mã sản phẩm OCOP.  
* **System Behavior:**  
  * Cho phép người dùng có quyền tra cứu ngược toàn bộ dòng lịch sử hình thành nên kết quả OCOP (BR-AUDIT-003):  
    $$\\text{Quyết định công nhận} \\rightarrow \\text{Điểm tổng hợp} \\rightarrow \\text{Phiếu chấm từng Giám khảo} \\rightarrow \\text{Chỉ tiêu đánh giá} \\rightarrow \\text{Minh chứng đính kèm} \\rightarrow \\text{Dữ liệu nguồn HTX (Nhật ký/Thửa đất/Xã viên)}$$  
  * Hiển thị trực quan cây phả hệ truy vết dữ liệu và các phiên bản thay đổi qua từng đợt thẩm định.  
* **Outputs:** Báo cáo truy vết nguồn gốc hồ sơ OCOP toàn diện.  
* **Permission & Scope:** AUDIT.TRACE\_OCOP | Scope: Authorized Scope.  
* **Audit:** Ghi log OCOP\_TRACEABILITY\_ACCESSED.  
* **Acceptance Criteria:**  
  * Xuất trình đầy đủ chuỗi bằng chứng giải trình khi phục vụ công tác thanh tra, kiểm toán chất lượng.

## **FR-RPT-001: Dashboard Quản trị & Báo cáo Hoạt động HTX**

* **Priority:** P1 | **Status:** CONFIRMED  
* **Traceability:**  
  * Business Requirement: BRQ-REPORT-001  
  * Business Process: BP-MEM-001, BP-CROP-001, BP-INV-001, BP-FIN-001  
  * Business Rules: BR-REPORT-001  
  * Primary Actors: ACT-01 (HTX\_OWNER), ACT-02 (HTX\_STAFF), ACT-10 (REPORT\_VIEWER)  
* **Preconditions:** Đăng nhập với quyền xem báo cáo trên phạm vi HTX.  
* **Inputs:** Bộ lọc khoảng thời gian, Mùa vụ, Vùng trồng, Loại báo cáo.  
* **System Behavior:**  
  * Tổng hợp dữ liệu theo thời gian thực và hiển thị Dashboard trực quan:  
    * Tổng số xã viên, cơ cấu vốn điều lệ thực góp.  
    * Tổng diện tích vùng trồng, số lượng thửa đất đang hoạt động canh tác.  
    * Biến động giá trị tồn kho vật tư, cảnh báo các mặt hàng chạm điểm ROP hoặc sắp hết hạn dùng.  
    * Tổng hợp doanh thu, chi phí phân tách nội bộ/bên ngoài và tổng dư nợ vật tư xã viên.  
  * Cho phép kết xuất báo cáo thống kê định kỳ dạng Excel/PDF.  
* **Outputs:** Bảng điều khiển Dashboard quản trị HTX, Tệp báo cáo thống kê.  
* **Permission & Scope:** REPORT.COOP\_READ | Scope: Own HTX.  
* **Audit:** Ghi log COOP\_REPORT\_GENERATED.  
* **Acceptance Criteria:**  
  * Số liệu thống kê khớp đúng 100% với số dư thực tế trong các bảng dữ liệu gốc.

## **FR-RPT-002: Báo cáo Theo dõi Tiến độ & Sẵn sàng Hồ sơ OCOP (Readiness Checklist)**

* **Priority:** P0 | **Status:** CONFIRMED  
* **Traceability:**  
  * Business Requirement: BRQ-REPORT-002  
  * Business Process: BP-OCOP-001, BP-OCOP-005  
  * Business Rules: BR-REPORT-001  
  * Primary Actors: ACT-01 (HTX\_OWNER), ACT-02 (HTX\_STAFF), ACT-03 (RECEIVING\_REVIEWER)  
* **Preconditions:** Hồ sơ OCOP đã được khởi tạo.  
* **Inputs:** Mã hồ sơ OCOP (application\_id).  
* **System Behavior:**  
  * Tự động quét toàn bộ cấu trúc hồ sơ và tính toán tỷ lệ hoàn thiện:  
    * Số chỉ tiêu đã tự chấm điểm / Tổng số chỉ tiêu trong bộ tiêu chí.  
    * Số chỉ tiêu đã đính kèm minh chứng / Tổng số chỉ tiêu yêu cầu minh chứng.  
    * Số minh chứng đã xác minh hợp lệ (VERIFIED), số minh chứng bị từ chối (REJECTED).  
    * Tình trạng đáp ứng các chỉ tiêu bắt buộc khống chế dấu sao (\*).  
  * Hiển thị thanh tiến độ trực quan (%) và danh sách cảnh báo các mục còn thiếu sót cần hoàn thiện trước khi nộp.  
* **Outputs:** Báo cáo tiến độ hoàn thiện hồ sơ OCOP trực quan.  
* **Permission & Scope:** REPORT.OCOP\_PROGRESS\_READ | Scope: Own HTX / Assigned Scope.  
* **Audit:** Ghi log OCOP\_READINESS\_REPORT\_VIEWED.  
* **Acceptance Criteria:**  
  * Chỉ ra chính xác các chỉ tiêu cụ thể còn thiếu minh chứng hoặc chưa hoàn tất tự đánh giá.

## **FR-RPT-003: Kết xuất Tự động Bộ Hồ sơ OCOP Chuẩn hóa sang PDF và DOCX**

* **Priority:** P0 | **Status:** CONFIRMED  
* **Traceability:**  
  * Business Requirement: BRQ-REPORT-003  
  * Business Process: BP-OCOP-008  
  * Business Rules: BR-REPORT-002, BR-REPORT-003, BR-REPORT-004, BR-VERSION-003  
  * Primary Actors: ACT-01 (HTX\_OWNER), ACT-06 (COUNCIL\_SECRETARY)  
* **Preconditions:** Hồ sơ OCOP đã hoàn thành nhập liệu và có dữ liệu hợp lệ.  
* **Inputs:** Mã hồ sơ OCOP, Loại biểu mẫu cần kết xuất (BIEU\_SO\_1 \- Phiếu đăng ký, BIEU\_SO\_2 \- Báo cáo tự đánh giá, BIEU\_SO\_3 \- Báo cáo cấp xã, PHIEU\_CHAM\_HOI\_DONG), Định dạng tệp (PDF, DOCX).  
* **System Behavior:**  
  * Truy vấn dữ liệu hồ sơ, tự động điền thông tin vào Template biểu mẫu hành chính quy chuẩn của Chính phủ (bám sát biểu mẫu Quyết định 148/QĐ-TTg).  
  * Đối với Biểu số 2: Tự động tổng hợp bảng điểm tự chấm, nội dung thuyết minh và tự động tạo mục lục bảng kê kèm **đường dẫn liên kết trực tiếp (Hyperlink an toàn)** sang các tệp minh chứng tương ứng (BR-REPORT-002).  
  * Kết xuất tệp tin PDF/DOCX có dán mã QR kiểm toán hệ thống.  
  * Lưu vết lịch sử phiên bản kết xuất (Document Generation Version) để phục vụ lưu trữ (BR-REPORT-003, BR-VERSION-003).  
* **Outputs:** Tệp văn bản PDF / DOCX hoàn chỉnh theo đúng thể thức văn bản hành chính Việt Nam.  
* **Permission & Scope:** REPORT.OCOP\_EXPORT | Scope: Authorized Scope.  
* **Audit:** Ghi log OCOP\_DOCUMENT\_EXPORTED.  
* **Acceptance Criteria:**  
  * Tệp kết xuất ra đúng định dạng biểu mẫu, đầy đủ nội dung thuyết minh, bảng điểm và hyperlink minh chứng hoạt động ổn định.

# **13\. Functional Requirements Traceability Matrix Summary**

| FR ID | Tên Chức năng (Functional Requirement) | Business Requirement Mapping | Business Rules Mapping | Primary Roles | Priority | Status |
| :---- | :---- | :---- | :---- | :---- | :---- | :---- |
| **FR-COOP-001** | Quản lý Hồ sơ Pháp nhân HTX | BRQ-COOP-001 | BR-COOP-001, BR-COOP-002, BR-DATA-001 | HTX\_OWNER, HTX\_STAFF | P0 | CONFIRMED |
| **FR-COOP-002** | Đăng ký & Quản lý Xã viên | BRQ-COOP-002, BRQ-COOP-003 | BR-COOP-007, BR-COOP-008, BR-MEM-001, BR-MEM-002, BR-DATA-002 | HTX\_STAFF, HTX\_OWNER | P0 | CONFIRMED |
| **FR-COOP-003** | Quản lý Vốn góp & Giới hạn Sở hữu | BRQ-COOP-004, BRQ-COOP-005 | BR-COOP-004, BR-COOP-005, BR-COOP-006, BR-DATA-004 | HTX\_STAFF, HTX\_OWNER | P0 | CONFIRMED |
| **FR-COOP-004** | Ghi nhận Biểu quyết Bình đẳng | BRQ-COOP-006 | BR-COOP-003 | HTX\_OWNER, HTX\_STAFF | P1 | CONFIRMED |
| **FR-AGRI-001** | Quản lý Vùng trồng & Mã số PUC | BRQ-AGRI-001 | BR-AGRI-002, BR-AGRI-003 | HTX\_STAFF | P0 | CONFIRMED |
| **FR-AGRI-002** | Quản lý Thửa đất Nông hộ | BRQ-AGRI-002 | BR-AGRI-001, BR-AGRI-002 | HTX\_STAFF | P0 | CONFIRMED |
| **FR-AGRI-003** | Quản lý Mùa vụ Sản xuất | BRQ-AGRI-003 | BR-AGRI-005 | HTX\_OWNER, HTX\_STAFF | P0 | CONFIRMED |
| **FR-AGRI-004** | Nhật ký Canh tác & Cách ly PHI | BRQ-AGRI-004, BRQ-AGRI-005, BRQ-AGRI-006 | BR-AGRI-004, BR-AGRI-005, BR-AGRI-006, BR-AGRI-007, BR-LOG-001, BR-LOG-002 | HTX\_STAFF | P0 | CONFIRMED / TO\_VERIFY |
| **FR-AGRI-005** | Thu hoạch & Sinh Mã Lô hàng (Lot ID) | BRQ-AGRI-007 | BR-AGRI-006, BR-AGRI-008 | HTX\_STAFF | P0 | CONFIRMED |
| **FR-PROD-001** | Quản lý Danh mục Sản phẩm HTX | BRQ-PROD-001 | BR-OCOP-001, BR-DATA-001 | HTX\_OWNER, HTX\_STAFF | P0 | CONFIRMED |
| **FR-LOG-001** | Quản lý Danh mục Vật tư & ROP | BRQ-LOG-001 | BR-LOG-001, BR-LOG-002 | HTX\_STAFF | P0 | CONFIRMED |
| **FR-LOG-002** | Nhập kho Vật tư theo Lô | BRQ-LOG-002 | BR-LOG-001, BR-LOG-004, BR-DATA-004 | HTX\_STAFF | P0 | CONFIRMED |
| **FR-LOG-003** | Xuất kho Cung ứng & Công nợ | BRQ-LOG-003 | BR-LOG-003, BR-LOG-005, BR-LOG-006, BR-FIN-001 | HTX\_STAFF | P0 | CONFIRMED |
| **FR-LOG-004** | Kiểm kê Kho & Điều chỉnh Tồn | BRQ-LOG-004 | BR-LOG-007, BR-LOG-008, BR-LOG-009, BR-DATA-002 | HTX\_STAFF | P1 | CONFIRMED |
| **FR-FIN-001** | Quản lý Thu – Chi Nội bộ/Ngoài | BRQ-FIN-001 | BR-FIN-001, BR-FIN-002, BR-FIN-003 | HTX\_STAFF, HTX\_OWNER | P0 | CONFIRMED |
| **FR-FIN-002** | Đối soát Cấn trừ Nợ Nông sản | BRQ-FIN-002 | BR-FIN-004, BR-FIN-007 | HTX\_STAFF, HTX\_OWNER | P0 | CONFIRMED |
| **FR-FIN-003** | Trích Quỹ & Chia Thặng dư 51% | BRQ-FIN-003 | BR-FIN-008, BR-FIN-009, BR-FIN-010, BR-DATA-002 | HTX\_STAFF, HTX\_OWNER | P0 | CONFIRMED / TO\_VERIFY |
| **FR-FIN-004** | Cho vay Nội bộ & Kiểm soát Vốn | BRQ-FIN-004 | BR-FIN-005, BR-FIN-006 | HTX\_STAFF, HTX\_OWNER | P1 | TO\_VERIFY |
| **FR-OCOP-001** | Tạo Hồ sơ Đăng ký OCOP | BRQ-OCOP-001 | BR-OCOP-001, BR-OCOP-002 | HTX\_OWNER, OCOP\_PREPARER | P0 | CONFIRMED |
| **FR-OCOP-002** | Cấu hình & Phiên bản Tiêu chí | BRQ-OCOP-002 | BR-OCOP-002, BR-OCOP-003, BR-VERSION-001, BR-CALC-003 | CRITERIA\_ADMIN | P0 | CONFIRMED |
| **FR-OCOP-003** | Tự đánh giá & Giải trình (Biểu 2\) | BRQ-OCOP-003 | BR-OCOP-004, BR-OCOP-006, BR-CALC-001, BR-CALC-003 | HTX\_OWNER, OCOP\_PREPARER | P0 | CONFIRMED |
| **FR-OCOP-004** | Chấm điểm Độc lập của Giám khảo | BRQ-OCOP-004 | BR-OCOP-007, BR-SEC-002, BR-CALC-001, BR-CALC-003 | EVALUATOR, COUNCIL\_MEMBER | P0 | CONFIRMED |
| **FR-OCOP-005** | Tổng hợp Điểm & Cảnh báo Lệch | BRQ-OCOP-005 | BR-OCOP-008, BR-OCOP-009, BR-CALC-001 | COUNCIL\_SECRETARY | P0 | CONFIRMED / TO\_VERIFY |
| **FR-OCOP-006** | Đề xuất Hạng Sao & Khống chế Hạ | BRQ-OCOP-006 | BR-OCOP-010, BR-OCOP-011 | COUNCIL\_SECRETARY, AUTHORITY | P0 | CONFIRMED / TO\_VERIFY |
| **FR-OCOP-007** | Phê duyệt Kết quả & Hạn 36 Tháng | BRQ-OCOP-007 | BR-OCOP-012, BR-DATA-002 | AUTHORITY | P1 | TO\_VERIFY |
| **FR-EVID-001** | Tải lên & Lưu trữ Minh chứng MinIO | BRQ-EVIDENCE-001 | BR-EVIDENCE-001, BR-EVIDENCE-003, BR-DATA-006 | HTX\_OWNER, OCOP\_PREPARER | P0 | CONFIRMED |
| **FR-EVID-002** | Ánh xạ Minh chứng với Chỉ tiêu | BRQ-EVIDENCE-002 | BR-EVIDENCE-002 | HTX\_OWNER, OCOP\_PREPARER | P0 | CONFIRMED |
| **FR-EVID-003** | Phiên bản hóa Minh chứng (v1, v2) | BRQ-EVIDENCE-003 | BR-EVIDENCE-004, BR-EVIDENCE-006, BR-VERSION-002 | HTX\_OWNER, RECEIVING\_REVIEWER | P0 | PROPOSED |
| **FR-EVID-004** | Thẩm định & Xác minh Minh chứng | BRQ-EVIDENCE-004 | BR-EVIDENCE-005, BR-EVIDENCE-006 | RECEIVING\_REVIEWER, EVIDENCE\_REVIEWER | P0 | TO\_VERIFY |
| **FR-EVID-005** | Bảo mật Tệp qua Signed URL | BRQ-EVIDENCE-005 | BR-EVIDENCE-005, BR-SEC-005 | ALL ACTORS | P0 | CONFIRMED |
| **FR-EVID-006** | Kéo Dữ liệu Canh tác làm Minh chứng | BRQ-EVIDENCE-006 | BR-EVIDENCE-007, BR-AUDIT-004 | HTX\_OWNER, OCOP\_PREPARER | P1 | INFERRED |
| **FR-WKFL-001** | Máy trạng thái Quy trình Backend | BRQ-WORKFLOW-001 | BR-WORKFLOW-001, BR-WORKFLOW-002, BR-WORKFLOW-005 | ALL ACTORS | P0 | PROPOSED |
| **FR-WKFL-002** | Kiểm tra Điều kiện Nộp Hồ sơ | BRQ-WORKFLOW-002 | BR-OCOP-005, BR-WORKFLOW-002 | HTX\_OWNER, OCOP\_PREPARER | P0 | CONFIRMED |
| **FR-WKFL-003** | Vòng lặp Chỉnh sửa Hồ sơ | BRQ-WORKFLOW-003 | BR-WORKFLOW-003, BR-WORKFLOW-004 | RECEIVING\_REVIEWER, HTX\_OWNER | P0 | CONFIRMED |
| **FR-WKFL-004** | Khóa Dữ liệu Tự động Chống Sửa | BRQ-WORKFLOW-004 | BR-WORKFLOW-004, BR-DATA-002, BR-OCOP-004 | ALL ACTORS | P0 | PROPOSED |
| **FR-SEC-001** | Quản lý Tài khoản & Xác thực | BRQ-SEC-001 | BR-SEC-001 | SYSTEM\_ADMIN | P0 | PROPOSED |
| **FR-SEC-002** | Phân quyền RBAC & Chặn Bypass | BRQ-SEC-002 | BR-SEC-001, BR-SEC-005 | SYSTEM\_ADMIN | P0 | CONFIRMED |
| **FR-SEC-003** | Cô lập Phạm vi Dữ liệu (Data Scope) | BRQ-SEC-003 | BR-SEC-005, BR-SEC-006 | ALL ACTORS | P0 | PROPOSED |
| **FR-SEC-004** | Kiểm soát Xung đột Trách nhiệm (SoD) | BRQ-SEC-004 | BR-SEC-001, BR-SEC-002, BR-SEC-003 | SYSTEM\_ADMIN | P0 | TO\_VERIFY |
| **FR-SYS-001** | Quản lý Cấu hình Danh mục | BRQ-SYS-001 | BR-DATA-001 | SYSTEM\_ADMIN | P1 | PROPOSED |
| **FR-SYS-002** | Sao lưu & Phục hồi Tự động | BRQ-SYS-002 | BR-DATA-002, BR-DATA-003 | SYSTEM\_ADMIN | P0 | CONFIRMED |
| **FR-AUD-001** | Ghi nhận Audit Log Bất biến | BRQ-AUDIT-001 | BR-AUDIT-001, BR-AUDIT-002, BR-SEC-004 | ALL ACTORS | P0 | PROPOSED |
| **FR-AUD-002** | Truy vết Ngược Dòng Dữ liệu OCOP | BRQ-AUDIT-002, BRQ-CROSS-001 | BR-AUDIT-003, BR-AUDIT-004 | AUTHORITY, AUDITOR | P0 | PROPOSED |
| **FR-RPT-001** | Dashboard Quản trị HTX | BRQ-REPORT-001 | BR-REPORT-001 | HTX\_OWNER, HTX\_STAFF, REPORT\_VIEWER | P1 | CONFIRMED |
| **FR-RPT-002** | Báo cáo Sẵn sàng Hồ sơ OCOP | BRQ-REPORT-002 | BR-REPORT-001 | HTX\_OWNER, HTX\_STAFF, RECEIVING\_REVIEWER | P0 | CONFIRMED |
| **FR-RPT-003** | Xuất Hồ sơ OCOP sang PDF/DOCX | BRQ-REPORT-003 | BR-REPORT-002, BR-REPORT-003, BR-REPORT-004, BR-VERSION-003 | HTX\_OWNER, COUNCIL\_SECRETARY | P0 | CONFIRMED |

# **14\. Open Questions for Functional Implementation**

| ID | Câu hỏi khảo sát kỹ thuật / chức năng cần làm rõ | Mức độ ưu tiên | Module liên đới |
| :---- | :---- | :---- | :---- |
| **FOQ-001** | Quy trình họp Hội đồng khi lệch điểm $\> 10$ điểm sẽ tiến hành thảo luận trực tiếp ngoài đời hay hệ thống cần cung cấp phòng hội ý trực tuyến? | High | FR-OCOP-005 |
| **FOQ-002** | Tỷ trọng phần trăm cụ thể giữa Mức độ sử dụng dịch vụ và Mức độ góp sức lao động trong 51% thặng dư nội bộ được cấu hình linh hoạt hay cố định? | Critical | FR-FIN-003 |
| **FOQ-003** | Mẫu biểu DOCX kết xuất Báo cáo tự đánh giá Biểu số 2 có bắt buộc chèn hyperlink trực tiếp sang file PDF trên MinIO hay chỉ liệt kê số hiệu văn bản? | Medium | FR-RPT-003 |
| **FOQ-004** | Có yêu cầu ký số Token USB vật lý (qua Plugin trình duyệt) hay hỗ trợ Chữ ký số từ xa (Remote Signing / HSM) trên các quyết định công nhận? | High | FR-OCOP-007, FR-RPT-003 |

