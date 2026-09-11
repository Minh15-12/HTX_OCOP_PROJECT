\# 07\_BUSINESS\_REQUIREMENTS.md

# 1. Document Information

| Field | Value |

|---|---|

| Document ID | 07 |

| Document Name | Business Requirements |

| Project | Xây dựng Hệ thống quản lý hoạt động Hợp tác xã nông nghiệp và số hóa hồ sơ đánh giá, phân hạng OCOP |

| Previous Documents | 01\_PROJECT\_OVERVIEW.md, 02\_DOMAIN\_CONTEXT.md, 03\_BUSINESS\_PROCESSES.md, 04\_OCOP\_BUSINESS.md, 05\_ACTORS\_AND\_ROLES.md, 06\_BUSINESS\_RULES.md |

| Next Document | 08\_FUNCTIONAL\_REQUIREMENTS.md |

| Status | DRAFT – PENDING VALIDATION |

\---

\# 2\. Purpose

Tài liệu này chuyển đổi các kết quả phân tích nghiệp vụ từ chuỗi tài liệu:

\`\`\`text

Business Context & Process (01, 02, 03, 04\)

        ↓

Actors & Roles (05)

        ↓

Business Rules (06)

        ↓

Business Requirements (07)

thành tập các yêu cầu nghiệp vụ chuẩn hóa mà **hệ thống bắt buộc phải hỗ trợ**.

Tài liệu này đóng vai trò cầu nối nghiệp vụ, định nghĩa **WHAT the system must do** ở góc nhìn vận hành HTX và số hóa OCOP, không chứa chi tiết UI, API, Database Schema hoặc Implementation Code.

# **3\. Scope & Domain Hierarchy**

Các Business Requirements bao phủ các phân hệ nghiệp vụ sau:

* **BRQ-COOP:** Quản lý thông tin HTX, cơ cấu tổ chức và hồ sơ/vòng đời xã viên.  
* **BRQ-AGRI:** Quản lý vùng trồng, thửa đất, mùa vụ, nhật ký canh tác và thu hoạch/lô hàng.  
* **BRQ-PROD:** Quản lý danh mục sản phẩm, quy cách và chất lượng sản phẩm HTX.  
* **BRQ-LOG:** Quản lý danh mục vật tư, đơn vị tính, kho bãi, nhập/xuất kho, kiểm kê và công nợ vật tư.  
* **BRQ-FIN:** Quản lý thu – chi, công nợ, đối soát, cấn trừ, quỹ không chia, phân phối thặng dư và cho vay nội bộ.  
* **BRQ-OCOP:** Quản lý hồ sơ, cấu trúc/phiên bản bộ tiêu chí, tự đánh giá, chấm điểm độc lập, tổng hợp điểm và quyết định phân hạng OCOP.  
* **BRQ-EVIDENCE:** Quản lý lưu trữ, metadata, liên kết tiêu chí, versioning, kiểm tra và bảo mật tệp minh chứng.  
* **BRQ-WORKFLOW:** Kiểm soát vòng đời trạng thái, điều kiện chuyển bước, yêu cầu chỉnh sửa và khóa dữ liệu.  
* **BRQ-SEC:** Quản lý tài khoản, vai trò, quyền hạn, phạm vi dữ liệu (Data Scope) và kiểm soát xung đột trách nhiệm (Separation of Duties).  
* **BRQ-AUDIT:** Ghi nhận nhật ký kiểm toán, bảo đảm bất biến và truy vết toàn diện chuỗi dữ liệu OCOP/HTX.  
* **BRQ-REPORT:** Cung cấp dashboard quản trị, báo cáo chuyên ngành và kết xuất bộ hồ sơ PDF/DOCX theo mẫu.  
* **BRQ-SYS:** Quản trị kỹ thuật, cấu hình danh mục, sao lưu và phục hồi hệ thống.  
* **BRQ-CROSS:** Các yêu cầu liên kết dữ liệu và toàn vẹn xuyên suốt giữa các domain.

# **4\. Requirement Classification & Trust Policy**

| Status | Ý nghĩa |
| :---- | :---- |
| CONFIRMED | Được hỗ trợ trực tiếp từ tài liệu nghiệp vụ/quy trình đã xác minh. |
| INFERRED | Suy luận hợp lý từ luồng nghiệp vụ/quy tắc tổng quát. |
| PROPOSED | Đề xuất giải pháp nghiệp vụ phục vụ thiết kế hệ thống an toàn. |
| TO\_VERIFY | Chưa đủ căn cứ xác minh; tuyệt đối không tự động hard-code thành quy tắc bắt buộc. |
| CONFLICT | Thông tin chưa thống nhất giữa các nguồn khảo sát. |

# **5\. Priority Definition**

| Priority | Ý nghĩa phạm vi phần mềm |
| :---- | :---- |
| **P0** | Bắt buộc đối với phạm vi cốt lõi (MVP) của đề tài. |
| **P1** | Quan trọng, cần có trong phiên bản hoàn chỉnh. |
| **P2** | Có thể triển khai ở giai đoạn mở rộng. |
| **P3** | Tính năng nâng cao/tùy chọn tương lai. |

# **6\. Traceability Convention**

Mỗi requirement phải thể hiện đầy đủ cấu trúc:

Plaintext  
\- Priority: \[P0 | P1 | P2 | P3\]  
\- Status: \[CONFIRMED | INFERRED | PROPOSED | TO\_VERIFY | CONFLICT\]  
\- Actors: \[Mã Actor và Role từ 05\_ACTORS\_AND\_ROLES.md\]  
\- Sources:  
  \* Process: \[Mã BP từ 03\_BUSINESS\_PROCESSES.md hoặc 04\_OCOP\_BUSINESS.md\]  
  \* Rules: \[Mã BR từ 06\_BUSINESS\_RULES.md\]  
  \* Overview Scope: \[01\_PROJECT\_OVERVIEW.md / 02\_DOMAIN\_CONTEXT.md\]  
\- Requirement: \[Mô tả chi tiết nội dung yêu cầu nghiệp vụ\]  
\- Acceptance Intent: \[Mục tiêu nghiệm thu nghiệp vụ\]

# **7\. BRQ-COOP — HTX & Xã viên**

## **BRQ-COOP-001 — Quản lý thông tin HTX**

* **Priority:** P0  
* **Status:** CONFIRMED  
* **Actors:** ACT-01 (Chủ thể/Đại diện HTX), ACT-02 (Cán bộ HTX)  
* **Sources:**  
  * Process: BP-MEM-001  
  * Rules: BR-COOP-001, BR-COOP-002  
  * Overview Scope: 01 (1.5.B), 02 (5.1.A)  
* **Requirement:** Hệ thống phải cho phép quản lý thông tin pháp lý, cơ cấu tổ chức và cấu hình hoạt động cơ bản của HTX. Hệ thống cần hỗ trợ cảnh báo điều kiện thành lập tối thiểu và mô hình quản trị theo quy mô thành viên.  
* **Acceptance Intent:** Đại diện HTX có thể cập nhật thông tin đơn vị; hệ thống ghi nhận và hiển thị đầy đủ thông tin pháp nhân.

## **BRQ-COOP-002 — Quản lý hồ sơ và tư cách xã viên**

* **Priority:** P0  
* **Status:** CONFIRMED  
* **Actors:** ACT-02 (Cán bộ HTX), ACT-01 (Đại diện HTX)  
* **Sources:**  
  * Process: BP-MEM-001  
  * Rules: BR-COOP-008, BR-MEM-001, BR-MEM-002  
  * Overview Scope: 01 (1.5.C), 02 (5.1.B)  
* **Requirement:** Hệ thống phải quản lý toàn bộ vòng đời hồ sơ xã viên (tiếp nhận đơn, kết nạp, hoạt động, chấm dứt tư cách), kiểm tra trùng lặp định danh pháp lý (CCCD/Mã số DN) và liên kết xã viên với thửa đất, sản xuất, công nợ, phân chia lợi nhuận.  
* **Acceptance Intent:** Không cho phép tạo trùng lặp mã định danh xã viên đang hoạt động trong cùng HTX; dữ liệu liên kết nhất quán giữa các phân hệ.

## **BRQ-COOP-003 — Quản lý trạng thái và bảo toàn lịch sử xã viên**

* **Priority:** P0  
* **Status:** CONFIRMED  
* **Actors:** ACT-02 (Cán bộ HTX), ACT-01 (Đại diện HTX)  
* **Sources:**  
  * Process: BP-MEM-001  
  * Rules: BR-MEM-002, BR-DATA-002  
  * Overview Scope: 01 (1.5.C)  
* **Requirement:** Hệ thống phải quản lý các trạng thái chuyển dịch của xã viên (DRAFT, PENDING\_APPROVAL, ACTIVE, PENDING\_TERMINATION, TERMINATED) và tuyệt đối không xóa vật lý các bản ghi thành viên đã phát sinh giao dịch lịch sử.  
* **Acceptance Intent:** Khi xã viên chấm dứt tư cách, toàn bộ lịch sử canh tác, góp vốn và giao dịch cũ vẫn được bảo toàn nguyên vẹn để phục vụ truy xuất.

## **BRQ-COOP-004 — Quản lý và kiểm soát hạn mức vốn góp**

* **Priority:** P0  
* **Status:** CONFIRMED  
* **Actors:** ACT-02 (Cán bộ HTX / Kế toán), ACT-01 (Đại diện HTX)  
* **Sources:**  
  * Process: BP-MEM-002  
  * Rules: BR-COOP-004, BR-COOP-005, BR-COOP-006  
  * Overview Scope: 01 (1.5.C), 02 (5.1.B)  
* **Requirement:** Hệ thống phải ghi nhận chi tiết vốn cam kết, các đợt góp vốn thực tế (tiền mặt/tài sản), tự động tính toán tỷ lệ sở hữu vốn và hỗ trợ kiểm tra, cảnh báo giới hạn tỷ lệ vốn góp của thành viên chính thức cũng như thành viên liên kết.  
* **Acceptance Intent:** Cảnh báo hoặc ngăn chặn giao dịch góp vốn vượt quá tỷ lệ quy định được cấu hình; hỗ trợ ghi nhận lịch sử biến động vốn.

## **BRQ-COOP-005 — Theo dõi tiến độ và nghĩa vụ góp vốn**

* **Priority:** P1  
* **Status:** CONFIRMED  
* **Actors:** ACT-02 (Cán bộ HTX / Kế toán)  
* **Sources:**  
  * Process: BP-MEM-002  
  * Rules: BR-COOP-006  
  * Overview Scope: 01 (1.5.C)  
* **Requirement:** Hệ thống phải theo dõi thời hạn hoàn thành nghĩa vụ góp vốn theo cam kết và nhận diện, cảnh báo các trường hợp quá hạn góp vốn theo cấu hình thời hạn của HTX.  
* **Acceptance Intent:** Xuất danh sách xã viên chưa hoàn thành nghĩa vụ góp vốn kèm số ngày quá hạn.

## **BRQ-COOP-006 — Quản lý biểu quyết bình đẳng**

* **Priority:** P1  
* **Status:** CONFIRMED  
* **Actors:** ACT-01 (Đại diện HTX), ACT-02 (Cán bộ HTX)  
* **Sources:**  
  * Process: BP-MEM-001  
  * Rules: BR-COOP-003  
  * Overview Scope: 02 (Domain B)  
* **Requirement:** Hệ thống phải bảo đảm nguyên tắc mỗi thành viên chính thức có một phiếu biểu quyết ngang nhau trong các sự kiện biểu quyết/đại hội của HTX, không tính trọng số biểu quyết theo tỷ lệ vốn góp.  
* **Acceptance Intent:** Mọi báo cáo/tính năng biểu quyết ghi nhận trọng số biểu quyết là 1 phiếu/thành viên chính thức.

# **8\. BRQ-AGRI — Vùng trồng, Thửa đất & Canh tác**

## **BRQ-AGRI-001 — Quản lý vùng trồng và thông tin chuyên ngành**

* **Priority:** P0  
* **Status:** CONFIRMED  
* **Actors:** ACT-02 (Cán bộ kỹ thuật / HTX Staff)  
* **Sources:**  
  * Process: BP-CROP-001  
  * Rules: BR-AGRI-002, BR-AGRI-003  
  * Overview Scope: 01 (1.5.D), 02 (5.1.C)  
* **Requirement:** Hệ thống phải quản lý danh mục vùng trồng/vùng nguyên liệu, vị trí địa lý, diện tích, cây trồng chủ lực. Đối với vùng trồng đăng ký mã số chuyên ngành (PUC), hệ thống hỗ trợ lưu trữ hồ sơ và cảnh báo điều kiện diện tích theo cấu hình TO\_VERIFY.  
* **Acceptance Intent:** Quản lý danh mục vùng trồng tập trung; phân biệt rõ vùng trồng nội bộ và vùng trồng cấp mã PUC.

## **BRQ-AGRI-002 — Quản lý thửa đất và liên kết xã viên**

* **Priority:** P0  
* **Status:** CONFIRMED  
* **Actors:** ACT-02 (Cán bộ kỹ thuật / HTX Staff)  
* **Sources:**  
  * Process: BP-CROP-001  
  * Rules: BR-AGRI-001, BR-AGRI-002  
  * Overview Scope: 01 (1.5.D), 02 (5.1.C)  
* **Requirement:** Hệ thống phải quản lý danh sách thửa đất thuộc vùng trồng, diện tích từng thửa và bắt buộc liên kết mỗi thửa đất với một xã viên/hộ sản xuất đang ở trạng thái hoạt động (ACTIVE).  
* **Acceptance Intent:** Không cho phép tạo thửa đất gắn với cá nhân chưa phải là xã viên hoặc xã viên đang bị khóa/chấm dứt tư cách.

## **BRQ-AGRI-003 — Quản lý mùa vụ sản xuất**

* **Priority:** P0  
* **Status:** CONFIRMED  
* **Actors:** ACT-02 (Cán bộ kỹ thuật / HTX Staff), ACT-01 (Đại diện HTX)  
* **Sources:**  
  * Process: BP-SEASON-001  
  * Rules: BR-AGRI-005  
  * Overview Scope: 01 (1.5.E), 02 (5.1.C)  
* **Requirement:** Hệ thống phải cho phép khởi tạo và quản lý mùa vụ sản xuất (tên vụ, thời gian bắt đầu, kết thúc, kế hoạch sản lượng, cây trồng/giống), gắn mùa vụ với các vùng trồng, thửa đất và hộ tham gia.  
* **Acceptance Intent:** Ngày kết thúc mùa vụ phải sau ngày bắt đầu; liên kết mùa vụ làm ngữ cảnh bắt buộc cho nhật ký canh tác.

## **BRQ-AGRI-004 — Ghi nhận nhật ký canh tác điện tử**

* **Priority:** P0  
* **Status:** CONFIRMED  
* **Actors:** ACT-02 (Cán bộ kỹ thuật / HTX Staff), ACT-01 (Xã viên / Hộ sản xuất)  
* **Sources:**  
  * Process: BP-PROD-001  
  * Rules: BR-AGRI-004, BR-AGRI-005, BR-AGRI-007  
  * Overview Scope: 01 (1.5.E), 02 (5.1.C)  
* **Requirement:** Hệ thống phải cho phép ghi nhật ký các hoạt động sản xuất (làm đất, gieo trồng, bón phân, phun thuốc BVTV, chăm sóc, thu hoạch). Mỗi nhật ký bắt buộc phải gắn với một thửa đất và một mùa vụ cụ thể, lưu trữ thời gian thực tế và người ghi nhận.  
* **Acceptance Intent:** Không cho phép lưu bản ghi nhật ký nếu thiếu định danh thửa đất hoặc mùa vụ.

## **BRQ-AGRI-005 — Liên kết vật tư sử dụng trong nhật ký**

* **Priority:** P0  
* **Status:** CONFIRMED  
* **Actors:** ACT-02 (Cán bộ kỹ thuật / Thủ kho)  
* **Sources:**  
  * Process: BP-PROD-001, BP-INV-002  
  * Rules: BR-AGRI-004, BR-LOG-001, BR-LOG-002  
  * Overview Scope: 01 (1.5.E, 1.5.F)  
* **Requirement:** Khi ghi nhận sử dụng phân bón hoặc thuốc BVTV trong nhật ký canh tác, hệ thống phải cho phép liên kết trực tiếp với danh mục vật tư/SKU và lô vật tư thực tế đã xuất kho.  
* **Acceptance Intent:** Tự động đối chiếu vật tư sử dụng trên đồng ruộng với phiếu xuất kho tương ứng.

## **BRQ-AGRI-006 — Kiểm soát thời gian cách ly (PHI)**

* **Priority:** P0  
* **Status:** TO\_VERIFY  
* **Actors:** ACT-02 (Cán bộ kỹ thuật), ACT-01 (Đại diện HTX)  
* **Sources:**  
  * Process: BP-PROD-001  
  * Rules: BR-AGRI-006  
  * Overview Scope: 01 (1.10)  
* **Requirement:** Hệ thống phải hỗ trợ tính toán ngày thu hoạch an toàn dựa trên thời điểm xử lý thuốc BVTV gần nhất và chỉ số PHI của hoạt chất. Cảnh báo hoặc chặn xác nhận thu hoạch nếu chưa đủ thời gian cách ly an toàn.  
* **Acceptance Intent:** Cảnh báo vi phạm PHI khi người dùng nhập ngày thu hoạch sớm hơn spray\_date \+ PHI.

## **BRQ-AGRI-007 — Ghi nhận thu hoạch và tạo Lô sản phẩm (Lot ID)**

* **Priority:** P0  
* **Status:** INFERRED  
* **Actors:** ACT-02 (Cán bộ kỹ thuật / HTX Staff)  
* **Sources:**  
  * Process: BP-HARVEST-001  
  * Rules: BR-AGRI-008  
  * Overview Scope: 01 (1.5.E), 02 (5.1.C)  
* **Requirement:** Hệ thống phải ghi nhận sản lượng thu hoạch theo từng đợt của thửa đất/mùa vụ, tự động sinh mã Lô sản phẩm (lot\_id) duy nhất để làm căn cứ liên kết với sản phẩm, chế biến, thu mua và truy xuất nguồn gốc.  
* **Acceptance Intent:** Mỗi lô thu hoạch truy ngược được về đúng thửa đất, hộ sản xuất, mùa vụ và các hoạt động canh tác liên quan.

## **BRQ-AGRI-008 — Khóa và bảo toàn lịch sử canh tác**

* **Priority:** P1  
* **Status:** PROPOSED  
* **Actors:** ACT-02 (Cán bộ kỹ thuật / HTX Manager)  
* **Sources:**  
  * Process: BP-PROD-001, BP-SEASON-001  
  * Rules: BR-AGRI-009, BR-DATA-002  
  * Overview Scope: 01 (1.10)  
* **Requirement:** Khi mùa vụ đã đóng hoặc nhật ký đã được phê duyệt/khóa, hệ thống không cho phép sửa đổi trực tiếp dữ liệu canh tác. Mọi sự điều chỉnh phải được thực hiện thông qua bản ghi hiệu chỉnh (correction version) kèm lý do và audit log.  
* **Acceptance Intent:** Giữ nguyên vẹn dữ liệu canh tác lịch sử phục vụ việc kiểm tra chứng nhận VietGAP/OCOP.

# **9\. BRQ-PROD — Quản lý Sản phẩm HTX**

## **BRQ-PROD-001 — Quản lý danh mục sản phẩm HTX**

* **Priority:** P0  
* **Status:** CONFIRMED  
* **Actors:** ACT-01 (Đại diện HTX), ACT-02 (Cán bộ HTX)  
* **Sources:**  
  * Process: BP-PRODUCT-001  
  * Rules: BR-OCOP-001, BR-DATA-001  
  * Overview Scope: 01 (1.5.H), 02 (5.1.F)  
* **Requirement:** Hệ thống phải quản lý danh mục sản phẩm thương mại của HTX, bao gồm: tên sản phẩm, nhóm/ngành hàng, quy cách đóng gói, nhãn hiệu, tiêu chuẩn chất lượng công bố và liên kết với nguồn nguyên liệu/lô thu hoạch.  
* **Acceptance Intent:** Quản lý tập trung thông tin sản phẩm làm đối tượng tham gia chương trình OCOP hoặc phân phối thương mại.

# **10\. BRQ-LOG — Vật tư & Kho**

## **BRQ-LOG-001 — Quản lý danh mục vật tư nông nghiệp**

* **Priority:** P0  
* **Status:** CONFIRMED  
* **Actors:** ACT-02 (Thủ kho / Cán bộ HTX)  
* **Sources:**  
  * Process: BP-INV-001  
  * Rules: BR-LOG-001, BR-LOG-002  
  * Overview Scope: 01 (1.5.F), 02 (5.1.D)  
* **Requirement:** Hệ thống phải quản lý danh mục vật tư nông nghiệp (phân bón, thuốc BVTV, giống, vật tư phụ trợ), đơn vị tính, danh mục hoạt chất và trạng thái hợp pháp của thuốc BVTV theo quy định hiện hành.  
* **Acceptance Intent:** Không cho phép thực hiện giao dịch kho đối với các mã SKU vật tư chưa được khai báo hoặc thuốc BVTV bị cấm.

## **BRQ-LOG-002 — Quản lý nhập kho và theo dõi lô/hạn dùng**

* **Priority:** P0  
* **Status:** CONFIRMED  
* **Actors:** ACT-02 (Thủ kho / Kế toán)  
* **Sources:**  
  * Process: BP-INV-001  
  * Rules: BR-LOG-004  
  * Overview Scope: 01 (1.5.F), 02 (5.1.D)  
* **Requirement:** Hệ thống phải ghi nhận phiếu nhập kho vật tư kèm thông tin nhà cung cấp, số lượng, đơn giá, chứng từ hóa đơn, số lô sản xuất và hạn sử dụng của từng lô hàng.  
* **Acceptance Intent:** Tồn kho tăng chính xác theo số lượng thực nhập; lưu trữ đầy đủ thông tin lô phục vụ truy vết.

## **BRQ-LOG-003 — Quản lý xuất kho vật tư và công nợ trả chậm**

* **Priority:** P0  
* **Status:** CONFIRMED  
* **Actors:** ACT-02 (Thủ kho / Kế toán)  
* **Sources:**  
  * Process: BP-INV-002  
  * Rules: BR-LOG-003, BR-LOG-005, BR-LOG-006  
  * Overview Scope: 01 (1.5.F), 02 (5.1.D)  
* **Requirement:** Hệ thống phải ghi nhận phiếu xuất kho (xuất cho xã viên phục vụ mùa vụ, xuất bán, xuất chuyển kho), kiểm tra không xuất vượt tồn kho khả dụng. Khi xuất trả chậm cho xã viên, hệ thống bắt buộc kiểm tra tư cách thành viên hợp lệ và tự động ghi nhận công nợ vật tư tương ứng.  
* **Acceptance Intent:** Ngăn chặn xuất âm kho; tự động tạo bản ghi công nợ phải thu của xã viên khi chọn hình thức trả chậm.

## **BRQ-LOG-004 — Quản lý kiểm kê và xử lý chênh lệch kho**

* **Priority:** P1  
* **Status:** CONFIRMED  
* **Actors:** ACT-02 (Ban kiểm soát / Thủ kho / Kế toán)  
* **Sources:**  
  * Process: BP-INV-003  
  * Rules: BR-LOG-007, BR-LOG-008, BR-LOG-009  
  * Overview Scope: 01 (1.5.F), 02 (5.1.D)  
* **Requirement:** Hệ thống phải hỗ trợ tạo phiên kiểm kê định kỳ/đột xuất, ghi nhận số lượng kiểm kê thực tế, tự động tính toán số lượng chênh lệch (thừa/thiếu), yêu cầu nhập lý do giải trình và chỉ cho phép điều chỉnh tồn kho sau khi biên bản kiểm kê được phê duyệt hợp lệ.  
* **Acceptance Intent:** Không cho phép điều chỉnh số dư tồn kho trực tiếp mà không có chứng từ phê duyệt kiểm kê; ghi nhận đầy đủ audit trail.

# **11\. BRQ-FIN — Tài chính, Công nợ & Phân phối Thặng dư**

## **BRQ-FIN-001 — Quản lý thu – chi và phân loại nguồn giao dịch**

* **Priority:** P0  
* **Status:** CONFIRMED  
* **Actors:** ACT-02 (Kế toán / Thủ quỹ), ACT-01 (Đại diện HTX)  
* **Sources:**  
  * Process: BP-FIN-001  
  * Rules: BR-FIN-001, BR-FIN-002, BR-FIN-003  
  * Overview Scope: 01 (1.5.G), 02 (5.1.E)  
* **Requirement:** Hệ thống phải quản lý các phiếu thu, phiếu chi của HTX, bắt buộc phân loại rõ ràng giữa giao dịch nội bộ (với thành viên) và giao dịch bên ngoài (với đối tác/khách hàng), đính kèm chứng từ hợp lệ và tuân thủ quy trình phê duyệt chi.  
* **Acceptance Intent:** Phân tách rõ ràng doanh thu/chi phí nội bộ và bên ngoài phục vụ hạch toán và trích lập quỹ theo quy định.

## **BRQ-FIN-002 — Quản lý công nợ và đối soát cấn trừ cuối vụ**

* **Priority:** P0  
* **Status:** CONFIRMED  
* **Actors:** ACT-02 (Kế toán), ACT-01 (Đại diện HTX / Xã viên)  
* **Sources:**  
  * Process: BP-FIN-002  
  * Rules: BR-FIN-004, BR-FIN-007  
  * Overview Scope: 01 (1.5.G), 02 (5.1.E)  
* **Requirement:** Hệ thống phải theo dõi chi tiết công nợ phải thu (tiền vật tư, dịch vụ trả chậm) và công nợ phải trả (tiền thu mua nông sản) theo từng xã viên. Hỗ trợ tạo biên bản đối soát và thực hiện cấn trừ công nợ cuối vụ theo quy chế của HTX (TO\_VERIFY về quy trình xử lý nợ tồn).  
* **Acceptance Intent:** Xuất bảng tổng hợp công nợ từng hộ; tính toán số tiền thực trả cho xã viên sau khi cấn trừ nghĩa vụ nợ vật tư.

## **BRQ-FIN-003 — Trích lập quỹ không chia và phân phối thặng dư**

* **Priority:** P0  
* **Status:** TO\_VERIFY  
* **Actors:** ACT-02 (Kế toán / Ban quản trị), ACT-01 (Đại hội thành viên)  
* **Sources:**  
  * Process: BP-FIN-003  
  * Rules: BR-FIN-008, BR-FIN-009, BR-FIN-010  
  * Overview Scope: 01 (1.5.G), 02 (5.1.E)  
* **Requirement:** Hệ thống phải hỗ trợ xác định kết quả kinh doanh, lập phương án trích lập quỹ chung không chia và phân phối thu nhập/thặng dư cho thành viên theo mức độ sử dụng dịch vụ và tỷ lệ vốn góp dựa trên các tỷ lệ được cấu hình theo Điều lệ HTX (không hard-code tỷ lệ cố định).  
* **Acceptance Intent:** Hỗ trợ mô phỏng bảng phân chia thặng dư; khóa dữ liệu quyết toán sau khi Đại hội thành viên phê duyệt.

## **BRQ-FIN-004 — Quản lý hoạt động tín dụng/cho vay nội bộ**

* **Priority:** P1  
* **Status:** TO\_VERIFY  
* **Actors:** ACT-02 (Kế toán / Ban kiểm soát), ACT-01 (Đại diện HTX)  
* **Sources:**  
  * Process: BP-FIN-001/002  
  * Rules: BR-FIN-005, BR-FIN-006  
  * Overview Scope: 02 (Domain E)  
* **Requirement:** Trường hợp HTX có hoạt động cho vay nội bộ, hệ thống phải bảo đảm chỉ cho phép giải ngân cho thành viên chính thức, kiểm soát nguồn vốn hợp lệ và theo dõi thời hạn hoàn trả (thời hạn tối đa cấu hình TO\_VERIFY).  
* **Acceptance Intent:** Ngăn chặn tạo khoản vay nội bộ cho đối tượng không phải là thành viên chính thức của HTX.

# **12\. BRQ-OCOP — Hồ sơ, Tiêu chí & Đánh giá OCOP**

## **BRQ-OCOP-001 — Khởi tạo và quản lý hồ sơ OCOP cho sản phẩm**

* **Priority:** P0  
* **Status:** CONFIRMED  
* **Actors:** ACT-01 (Chủ thể OCOP / Đại diện HTX), ACT-02 (Cán bộ OCOP)  
* **Sources:**  
  * Process: BP-OCOP-001  
  * Rules: BR-OCOP-001, BR-OCOP-002  
  * Overview Scope: 01 (1.5.I), 04 (Section 7\)  
* **Requirement:** Hệ thống phải cho phép tạo hồ sơ đánh giá OCOP mới gắn với một sản phẩm cụ thể của HTX, xác định lần đánh giá (đánh giá mới, đánh giá lại/nâng hạng) và gắn cố định với một phiên bản bộ tiêu chí đang có hiệu lực.  
* **Acceptance Intent:** Không thể tạo hồ sơ OCOP nếu chưa xác định sản phẩm hoặc chưa chọn phiên bản tiêu chí áp dụng.

## **BRQ-OCOP-002 — Quản lý cấu trúc và phiên bản bộ tiêu chí OCOP**

* **Priority:** P0  
* **Status:** CONFIRMED  
* **Actors:** ACT-08 (Quản trị bộ tiêu chí / CRITERIA\_ADMIN)  
* **Sources:**  
  * Process: BP-OCOP-002  
  * Rules: BR-OCOP-002, BR-OCOP-003, BR-VERSION-001  
  * Overview Scope: 04 (Section 8), 05 (Section 15\)  
* **Requirement:** Hệ thống phải quản lý cấu trúc phân cấp linh hoạt của bộ tiêu chí theo từng phiên bản:  
  $$\\text{Criteria Set} \\rightarrow \\text{Version} \\rightarrow \\text{Group} \\rightarrow \\text{Criterion} \\rightarrow \\text{Indicator} \\rightarrow \\text{Scoring Options}$$  
  Lưu trữ điểm tối đa, chỉ tiêu bắt buộc/khống chế và ngày hiệu lực. Tuyệt đối không hard-code tiêu chí vào mã nguồn.  
* **Acceptance Intent:** Cho phép tạo và phát hành các phiên bản tiêu chí mới; không làm thay đổi cấu trúc tiêu chí của các hồ sơ lịch sử đã đánh giá.

## **BRQ-OCOP-003 — Tự đánh giá và giải trình hồ sơ OCOP**

* **Priority:** P0  
* **Status:** CONFIRMED  
* **Actors:** ACT-01 (Chủ thể OCOP), ACT-02 (OCOP Preparer)  
* **Sources:**  
  * Process: BP-OCOP-003  
  * Rules: BR-OCOP-004, BR-OCOP-006, BR-CALC-001  
  * Overview Scope: 04 (Section 9\)  
* **Requirement:** Hệ thống phải cho phép chủ thể nhập điểm tự đánh giá chi tiết theo từng chỉ tiêu/lựa chọn có sẵn, nhập nội dung giải trình thuyết minh và đính kèm liên kết minh chứng tương ứng. Tổng điểm tự đánh giá phải được tính tự động từ các chỉ tiêu thành phần.  
* **Acceptance Intent:** Không cho phép nhập trực tiếp tổng điểm; tự động cập nhật tổng điểm khi thay đổi mức tự đánh giá của chỉ tiêu.

## **BRQ-OCOP-004 — Đánh giá độc lập của Evaluator / Hội đồng**

* **Priority:** P0  
* **Status:** CONFIRMED  
* **Actors:** ACT-04 (Người thẩm định / Evaluator), ACT-05 (Thành viên Hội đồng)  
* **Sources:**  
  * Process: BP-OCOP-006  
  * Rules: BR-OCOP-007, BR-SEC-002, BR-CALC-003  
  * Overview Scope: 04 (Section 12), 05 (Section 11, 12\)  
* **Requirement:** Hệ thống phải hỗ trợ người đánh giá/thành viên hội đồng thực hiện chấm điểm độc lập trên hồ sơ và minh chứng được phân công. Mỗi người đánh giá có phiếu chấm riêng, nhập nhận xét chi tiết và khóa phiếu chấm khi hoàn thành. Hệ thống ngăn chặn việc người chấm sửa điểm của nhau hoặc xem trước kết quả chấm kín khi quy trình yêu cầu độc lập.  
* **Acceptance Intent:** Điểm của từng giám khảo được lưu thành các bản ghi riêng biệt; giám khảo không thể sửa phiếu chấm của người khác.

## **BRQ-OCOP-005 — Tổng hợp kết quả đánh giá và kiểm soát độ lệch điểm**

* **Priority:** P0  
* **Status:** CONFIRMED  
* **Actors:** ACT-06 (Thư ký Hội đồng)  
* **Sources:**  
  * Process: BP-OCOP-007  
  * Rules: BR-OCOP-008, BR-OCOP-009, BR-CALC-001  
  * Overview Scope: 04 (Section 13), 05 (Section 13\)  
* **Requirement:** Hệ thống phải hỗ trợ tự động tổng hợp điểm trung bình từ các phiếu chấm hợp lệ của các giám khảo. Đồng thời, hệ thống phát hiện và đưa ra cảnh báo nếu độ lệch điểm giữa các giám khảo vượt quá ngưỡng cho phép (ngưỡng 10 điểm là TO\_VERIFY).  
* **Acceptance Intent:** Tính toán chính xác điểm trung bình; cảnh báo trực quan cho Thư ký Hội đồng khi có sự chênh lệch điểm bất thường để xin ý kiến xử lý.

## **BRQ-OCOP-006 — Kiểm tra điều kiện bắt buộc và đề xuất phân hạng sao**

* **Priority:** P0  
* **Status:** CONFIRMED / TO\_VERIFY  
* **Actors:** ACT-06 (Thư ký Hội đồng), ACT-07 (Cấp có thẩm quyền)  
* **Sources:**  
  * Process: BP-OCOP-007  
  * Rules: BR-OCOP-010, BR-OCOP-011  
  * Overview Scope: 04 (Section 13\)  
* **Requirement:** Hệ thống phải kiểm tra danh mục các chỉ tiêu bắt buộc/khống chế đối với từng mức hạng sao. Nếu hồ sơ đạt tổng điểm nhưng không thỏa mãn chỉ tiêu khống chế, hệ thống phải tự động áp dụng quy tắc khống chế hạ sao để đưa ra mức phân hạng đề xuất (Proposed Classification), phân biệt rõ ràng với kết quả phê duyệt chính thức (Final Result).  
* **Acceptance Intent:** Tách biệt rõ score\_based\_star và eligible\_star; không đề xuất mức sao cao nếu thiếu tiêu chuẩn khống chế.

## **BRQ-OCOP-007 — Quản lý quyết định công nhận và theo dõi thời hạn hiệu lực**

* **Priority:** P1  
* **Status:** TO\_VERIFY  
* **Actors:** ACT-07 (Cấp có thẩm quyền), ACT-01 (Chủ thể HTX)  
* **Sources:**  
  * Process: BP-OCOP-008  
  * Rules: BR-OCOP-012, BR-DATA-002  
  * Overview Scope: 04 (Section 14), 05 (Section 14\)  
* **Requirement:** Hệ thống phải ghi nhận thông tin quyết định công nhận kết quả phân hạng OCOP chính thức (số quyết định, ngày ban hành, cơ quan ban hành, mức sao công nhận), tính toán ngày hết hạn hiệu lực theo quy định (thời hạn 36 tháng là TO\_VERIFY) và hiển thị cảnh báo khi hồ sơ sắp hết hạn để thực hiện đánh giá lại.  
* **Acceptance Intent:** Lưu trữ đầy đủ thông tin pháp lý của chứng nhận OCOP; hiển thị trạng thái hiệu lực trên hồ sơ sản phẩm.

# **13\. BRQ-EVIDENCE — Quản lý Minh chứng OCOP**

## **BRQ-EVIDENCE-001 — Quản lý lưu trữ và định dạng tệp minh chứng**

* **Priority:** P0  
* **Status:** CONFIRMED  
* **Actors:** ACT-01 (Chủ thể OCOP), ACT-02 (OCOP Preparer)  
* **Sources:**  
  * Process: BP-OCOP-004  
  * Rules: BR-EVIDENCE-001, BR-EVIDENCE-003, BR-DATA-006  
  * Overview Scope: 01 (1.9, 1.10), 04 (Section 10\)  
* **Requirement:** Hệ thống phải cho phép tải lên và lưu trữ các tệp minh chứng phục vụ hồ sơ OCOP, hỗ trợ kiểm tra định dạng tệp (PDF, hình ảnh tiêu chuẩn) và giới hạn dung lượng tối đa (cấu hình 50MB/file theo tài liệu khảo sát).  
* **Acceptance Intent:** Ngăn chặn tải lên các định dạng không an toàn hoặc tệp vượt quá kích thước cho phép.

## **BRQ-EVIDENCE-002 — Liên kết minh chứng với chỉ tiêu đánh giá**

* **Priority:** P0  
* **Status:** CONFIRMED  
* **Actors:** ACT-01 (Chủ thể OCOP), ACT-02 (OCOP Preparer)  
* **Sources:**  
  * Process: BP-OCOP-004  
  * Rules: BR-EVIDENCE-002  
  * Overview Scope: 04 (Section 10\)  
* **Requirement:** Hệ thống phải hỗ trợ ánh xạ đa chiều giữa tệp minh chứng và các tiêu chí/chỉ tiêu trong bộ tiêu chí OCOP (một minh chứng có thể phục vụ nhiều chỉ tiêu và một chỉ tiêu có thể liên kết nhiều minh chứng).  
* **Acceptance Intent:** Người đánh giá có thể mở xem trực tiếp minh chứng đính kèm khi xem xét từng chỉ tiêu cụ thể.

## **BRQ-EVIDENCE-003 — Quản lý phiên bản và bảo toàn lịch sử minh chứng**

* **Priority:** P0  
* **Status:** PROPOSED  
* **Actors:** ACT-01 (Chủ thể OCOP), ACT-03 (Cán bộ tiếp nhận/kiểm tra)  
* **Sources:**  
  * Process: BP-OCOP-004, BP-OCOP-005  
  * Rules: BR-EVIDENCE-004, BR-EVIDENCE-006, BR-VERSION-002  
  * Overview Scope: 04 (Section 17\)  
* **Requirement:** Khi minh chứng cần bổ sung hoặc thay thế theo yêu cầu chỉnh sửa, hệ thống phải tạo phiên bản mới (Evidence Version v2) và chuyển trạng thái bản cũ (REPLACED / REJECTED). Tuyệt đối không xóa đè tệp cũ nhằm bảo đảm tính toàn vẹn của lịch sử thẩm định.  
* **Acceptance Intent:** Cho phép truy cứu lại phiên bản minh chứng gốc tại thời điểm nộp hồ sơ lần đầu.

## **BRQ-EVIDENCE-004 — Kiểm tra và xác minh trạng thái minh chứng**

* **Priority:** P0  
* **Status:** TO\_VERIFY  
* **Actors:** ACT-03 (Cán bộ kiểm tra), ACT-05 (Evidence Reviewer)  
* **Sources:**  
  * Process: BP-OCOP-005  
  * Rules: BR-EVIDENCE-005, BR-EVIDENCE-006  
  * Overview Scope: 04 (Section 10), 05 (Section 10\)  
* **Requirement:** Hệ thống phải cung cấp công cụ cho cán bộ kiểm tra đánh dấu trạng thái xác minh của từng tệp minh chứng (PENDING, VERIFIED, REJECTED), ghi nhận nhận xét chi tiết khi tệp không đạt yêu cầu.  
* **Acceptance Intent:** Hiển thị rõ ràng danh sách các minh chứng chưa đạt để chủ thể HTX tiến hành thay thế.

## **BRQ-EVIDENCE-005 — Kiểm soát truy cập và bảo mật tệp minh chứng**

* **Priority:** P0  
* **Status:** CONFIRMED  
* **Actors:** ACT-09 (System Admin), Toàn bộ Actors  
* **Sources:**  
  * Process: BP-OCOP-004  
  * Rules: BR-EVIDENCE-005, BR-SEC-005  
  * Overview Scope: 01 (1.9, 1.10)  
* **Requirement:** Tệp minh chứng không được công khai trực tiếp qua đường dẫn tĩnh. Việc truy cập tệp bắt buộc phải thông qua xác thực quyền hạn và sử dụng liên kết truy cập có thời hạn an toàn (signed URL).  
* **Acceptance Intent:** Người dùng không có quyền hoặc người ngoài hệ thống không thể tải tệp nếu không được cấp quyền hợp lệ.

## **BRQ-EVIDENCE-006 — Tái sử dụng dữ liệu sản xuất làm nguồn minh chứng**

* **Priority:** P1  
* **Status:** INFERRED  
* **Actors:** ACT-01 (Chủ thể HTX), ACT-02 (Cán bộ HTX)  
* **Sources:**  
  * Process: BP-OCOP-004, BP-PROD-001  
  * Rules: BR-EVIDENCE-007, BR-AUDIT-004  
  * Overview Scope: 02 (Section 14), 04 (Section 21\)  
* **Requirement:** Hệ thống phải hỗ trợ trích xuất dữ liệu nhật ký canh tác, vùng trồng, mùa vụ và giao dịch nội bộ của HTX để hỗ trợ lập tài liệu thuyết minh và minh chứng cho hồ sơ OCOP, đồng thời lưu trữ liên kết nguồn dữ liệu gốc (source\_entity, source\_id).  
* **Acceptance Intent:** Giảm thiểu thao tác nhập liệu trùng lặp; truy vết được dữ liệu minh chứng sinh ra từ phân hệ sản xuất nào.

# **14\. BRQ-WORKFLOW — Quản lý Trạng thái & Quy trình Xử lý**

## **BRQ-WORKFLOW-001 — Kiểm soát chuyển trạng thái hồ sơ (State Machine)**

* **Priority:** P0  
* **Status:** PROPOSED  
* **Actors:** Toàn bộ Actors  
* **Sources:**  
  * Process: BP-OCOP-001/005/006/007  
  * Rules: BR-WORKFLOW-001, BR-WORKFLOW-002, BR-WORKFLOW-005  
  * Overview Scope: 04 (Section 16\)  
* **Requirement:** Hệ thống phải quản lý quy trình xử lý hồ sơ thông qua máy trạng thái hữu hạn (State Machine) được kiểm soát hoàn toàn tại Backend:  
  $$\\text{DRAFT} \\rightarrow \\text{READY\\\_FOR\\\_SUBMISSION} \\rightarrow \\text{SUBMITTED} \\rightarrow \\text{IN\\\_REVIEW} \\rightarrow \\text{READY\\\_FOR\\\_EVALUATION} \\rightarrow \\text{EVALUATING} \\rightarrow \\text{CONSOLIDATED} \\rightarrow \\text{PENDING\\\_DECISION} \\rightarrow \\text{APPROVED / REJECTED}$$  
  Ngăn chặn mọi hành vi chuyển trạng thái không hợp lệ hoặc bỏ qua các bước kiểm tra bắt buộc.  
* **Acceptance Intent:** Backend từ chối mọi yêu cầu chuyển trạng thái không nằm trong ma trận chuyển dịch cho phép.

## **BRQ-WORKFLOW-002 — Kiểm tra điều kiện nộp hồ sơ (Pre-submission Validation)**

* **Priority:** P0  
* **Status:** CONFIRMED  
* **Actors:** ACT-01 (Chủ thể OCOP), ACT-02 (OCOP Preparer)  
* **Sources:**  
  * Process: BP-OCOP-001, BP-OCOP-003  
  * Rules: BR-OCOP-005, BR-WORKFLOW-002  
  * Overview Scope: 04 (Section 24\)  
* **Requirement:** Hệ thống phải thực hiện kiểm tra tự động trước khi cho phép nộp hồ sơ: đầy đủ thông tin chủ thể, sản phẩm, hoàn thành tự đánh giá 100% chỉ tiêu và đính kèm đầy đủ các minh chứng bắt buộc theo checklist.  
* **Acceptance Intent:** Chặn hành động gửi duyệt nếu hồ sơ còn chỉ tiêu chưa tự đánh giá hoặc thiếu tài liệu bắt buộc.

## **BRQ-WORKFLOW-003 — Quy trình yêu cầu bổ sung và nộp lại hồ sơ**

* **Priority:** P0  
* **Status:** CONFIRMED  
* **Actors:** ACT-03 (Cán bộ kiểm tra), ACT-01 (Chủ thể OCOP)  
* **Sources:**  
  * Process: BP-OCOP-005  
  * Rules: BR-WORKFLOW-003, BR-WORKFLOW-004  
  * Overview Scope: 04 (Section 11\)  
* **Requirement:** Cán bộ kiểm tra có quyền chuyển trạng thái hồ sơ sang NEED\_REVISION, kèm danh sách chi tiết các nội dung/tiêu chí cần chỉnh sửa và thời hạn khắc phục. Khi ở trạng thái này, chủ thể mới được quyền mở khóa chỉnh sửa dữ liệu và nộp lại (RESUBMITTED).  
* **Acceptance Intent:** Lưu vết lịch sử các lần yêu cầu bổ sung và phản hồi giải trình của chủ thể.

## **BRQ-WORKFLOW-004 — Khóa hồ sơ chống chỉnh sửa trái phép**

* **Priority:** P0  
* **Status:** PROPOSED  
* **Actors:** Toàn bộ Actors  
* **Sources:**  
  * Process: BP-OCOP-006/007  
  * Rules: BR-WORKFLOW-004, BR-DATA-002, BR-OCOP-004  
  * Overview Scope: 04 (Section 16\)  
* **Requirement:** Ngay khi hồ sơ được nộp (SUBMITTED) hoặc bước vào giai đoạn đánh giá (EVALUATING), hệ thống phải lập tức khóa quyền chỉnh sửa thông tin của chủ thể HTX, trừ khi có yêu cầu bổ sung chính thức từ người có thẩm quyền.  
* **Acceptance Intent:** Dữ liệu hồ sơ giữ nguyên trạng trong suốt thời gian Hội đồng tiến hành thẩm định và chấm điểm.

# **15\. BRQ-SEC — Phân quyền, Phạm vi Dữ liệu & Bảo mật**

## **BRQ-SEC-001 — Quản lý người dùng và xác thực tập trung**

* **Priority:** P0  
* **Status:** PROPOSED  
* **Actors:** ACT-09 (Quản trị hệ thống / SYSTEM\_ADMIN)  
* **Sources:**  
  * Process: 05 (Section 16\)  
  * Rules: BR-SEC-001  
  * Overview Scope: 01 (1.5.A), 02 (5.1.A)  
* **Requirement:** Hệ thống phải quản lý tài khoản người dùng, định danh, trạng thái kích hoạt/khóa và xác thực an toàn trước khi cấp quyền truy cập hệ thống.  
* **Acceptance Intent:** Ngăn chặn truy cập trái phép từ các tài khoản đã bị vô hiệu hóa.

## **BRQ-SEC-002 — Phân quyền theo vai trò (RBAC) và cấp quyền chi tiết**

* **Priority:** P0  
* **Status:** CONFIRMED  
* **Actors:** ACT-09 (SYSTEM\_ADMIN)  
* **Sources:**  
  * Process: 05 (ACTORS\_AND\_ROLES)  
  * Rules: BR-SEC-001, BR-SEC-005  
  * Overview Scope: 01 (1.5.A), 05 (Section 23\)  
* **Requirement:** Hệ thống phải hỗ trợ mô hình phân quyền theo vai trò (Role-Based Access Control) với danh mục quyền chi tiết theo chuẩn \<RESOURCE\>.\<ACTION\> (ví dụ: OCOP\_APPLICATION.CREATE, OCOP\_EVALUATION.SCORE).  
* **Acceptance Intent:** Người dùng chỉ thực hiện được các chức năng tương ứng với các quyền được gán cho vai trò của mình.

## **BRQ-SEC-003 — Kiểm soát phạm vi dữ liệu (Data Scope Isolation)**

* **Priority:** P0  
* **Status:** PROPOSED  
* **Actors:** Toàn bộ Actors  
* **Sources:**  
  * Process: 05 (Section 19\)  
  * Rules: BR-SEC-005, BR-SEC-006  
  * Overview Scope: 05 (Section 19\)  
* **Requirement:** Hệ thống phải kiểm soát truy cập dữ liệu dựa trên phạm vi hoạt động của người dùng:  
  * Người dùng HTX chỉ được xem/thao tác dữ liệu thuộc chính HTX của mình (Own HTX Scope).  
  * Người đánh giá chỉ được truy cập các hồ sơ/phiên chấm được phân công trực tiếp (Assigned Session Scope).  
* **Acceptance Intent:** Ngăn chặn tình trạng HTX này xem hoặc sửa đổi dữ liệu sản xuất/hồ sơ OCOP của HTX khác.

## **BRQ-SEC-004 — Tách biệt trách nhiệm và kiểm soát xung đột quyền (Separation of Duties)**

* **Priority:** P0  
* **Status:** TO\_VERIFY  
* **Actors:** ACT-09 (SYSTEM\_ADMIN)  
* **Sources:**  
  * Process: 05 (Section 21\)  
  * Rules: BR-SEC-001, BR-SEC-002, BR-SEC-003  
  * Overview Scope: 05 (Section 21, 26\)  
* **Requirement:** Hệ thống phải áp dụng các quy tắc kiểm soát xung đột lợi ích:  
  * Người chuẩn bị hồ sơ không có quyền chấm điểm hoặc phê duyệt kết quả OCOP cho chính hồ sơ đó.  
  * Quản trị hệ thống kỹ thuật (System Admin) không được cấp quyền phê duyệt kết quả OCOP hoặc sửa điểm chấm của Hội đồng.  
* **Acceptance Intent:** Đảm bảo tính khách quan và minh bạch trong toàn bộ quy trình thẩm định, phân hạng sản phẩm OCOP.

# **16\. BRQ-AUDIT — Nhật ký Kiểm toán & Truy vết Dữ liệu**

## **BRQ-AUDIT-001 — Ghi nhận nhật ký kiểm toán bất biến**

* **Priority:** P0  
* **Status:** PROPOSED  
* **Actors:** ACT-09 (SYSTEM\_ADMIN), Toàn bộ hệ thống  
* **Sources:**  
  * Process: 05 (Section 18, 24\)  
  * Rules: BR-AUDIT-001, BR-AUDIT-002, BR-SEC-004  
  * Overview Scope: 01 (1.10), 02 (Section 21), 06 (Section 12\)  
* **Requirement:** Hệ thống phải tự động ghi lại toàn bộ các thao tác nghiệp vụ quan trọng (thay đổi trạng thái hồ sơ, chấm điểm, sửa điểm, xác minh minh chứng, xuất kho, điều chỉnh số dư) vào nhật ký kiểm toán. Bản ghi audit bắt buộc chứa tối thiểu:  
  $$\\text{Audit Record} \= \\langle \\text{user\\\_id}, \\text{role}, \\text{action}, \\text{entity}, \\text{entity\\\_id}, \\text{timestamp}, \\text{before\\\_state}, \\text{after\\\_state}, \\text{reason} \\rangle$$  
  Nhật ký kiểm toán là bất biến (Append-only), không thể chỉnh sửa hoặc xóa bởi bất kỳ người dùng nào.  
* **Acceptance Intent:** Đảm bảo toàn vẹn dữ liệu ghi nhận; không có API hoặc chức năng nào cho phép xóa/sửa audit log.

## **BRQ-AUDIT-002 — Truy vết toàn diện chuỗi dữ liệu OCOP (Traceability Engine)**

* **Priority:** P0  
* **Status:** PROPOSED  
* **Actors:** ACT-07 (Cấp có thẩm quyền), ACT-09 (Auditor / Admin)  
* **Sources:**  
  * Process: 04 (Section 18\)  
  * Rules: BR-AUDIT-003, BR-AUDIT-004  
  * Overview Scope: 01 (1.3, 1.10), 06 (Section 12\)  
* **Requirement:** Hệ thống phải cho phép truy xuất toàn diện ngược dòng lịch sử đối với mọi kết quả OCOP:  
  $$\\text{Final Result} \\rightarrow \\text{Decision} \\rightarrow \\text{Consolidated Score} \\rightarrow \\text{Evaluator Scores} \\rightarrow \\text{Criterion} \\rightarrow \\text{Evidence Version} \\rightarrow \\text{HTX Source Data}$$  
* **Acceptance Intent:** Xuất trình được toàn bộ bằng chứng và lịch sử chấm điểm giải trình khi có thanh tra hoặc khiếu nại kết quả.

# **17\. BRQ-REPORT — Báo cáo & Kết xuất Biểu mẫu**

## **BRQ-REPORT-001 — Dashboard thống kê và báo cáo quản trị HTX**

* **Priority:** P1  
* **Status:** CONFIRMED  
* **Actors:** ACT-01 (Đại diện HTX), ACT-02 (Cán bộ HTX), ACT-10 (Report Viewer)  
* **Sources:**  
  * Process: BP-MEM-001, BP-CROP-001, BP-INV-001, BP-FIN-001  
  * Rules: BR-REPORT-001  
  * Overview Scope: 01 (1.5.J), 02 (5.1)  
* **Requirement:** Hệ thống phải cung cấp Dashboard quản trị tổng quan và các báo cáo thống kê định kỳ về: số lượng xã viên, cơ cấu vốn góp, diện tích vùng trồng, tiến độ mùa vụ, biến động tồn kho vật tư và tổng hợp doanh thu/chi phí/công nợ của HTX.  
* **Acceptance Intent:** Hiển thị dữ liệu trực quan theo đúng phân quyền và phạm vi dữ liệu của người dùng.

## **BRQ-REPORT-002 — Theo dõi tiến độ hoàn thiện hồ sơ OCOP**

* **Priority:** P0  
* **Status:** CONFIRMED  
* **Actors:** ACT-01 (Chủ thể OCOP), ACT-02 (Cán bộ HTX), ACT-03 (Cán bộ kiểm tra)  
* **Sources:**  
  * Process: BP-OCOP-001, BP-OCOP-005  
  * Rules: BR-REPORT-001  
  * Overview Scope: 01 (1.5.I, 1.5.J), 04 (Section 2\)  
* **Requirement:** Hệ thống phải hiển thị báo cáo tiến độ chuẩn bị hồ sơ OCOP: tổng số tiêu chí, số chỉ tiêu đã tự đánh giá, số chỉ tiêu đã đính kèm minh chứng, số minh chứng đã xác minh hoặc bị yêu cầu bổ sung.  
* **Acceptance Intent:** Cung cấp thanh tiến độ hoàn thiện (%) giúp HTX biết chính xác các phần việc còn thiếu sót trước khi nộp.

## **BRQ-REPORT-003 — Kết xuất bộ hồ sơ OCOP sang định dạng PDF và DOCX**

* **Priority:** P0  
* **Status:** CONFIRMED  
* **Actors:** ACT-01 (Chủ thể OCOP), ACT-06 (Thư ký Hội đồng)  
* **Sources:**  
  * Process: BP-OCOP-008  
  * Rules: BR-REPORT-002, BR-REPORT-003, BR-REPORT-004, BR-VERSION-003  
  * Overview Scope: 01 (1.5.J, 1.9), 04 (Section 15\)  
* **Requirement:** Hệ thống phải hỗ trợ kết xuất tự động toàn bộ hồ sơ OCOP (Phiếu đăng ký Biểu số 1, Báo cáo tự đánh giá Biểu số 2, Thuyết minh sản phẩm, Danh mục bảng kê minh chứng, Phiếu chấm điểm Hội đồng) ra định dạng chuẩn PDF và DOCX theo đúng biểu mẫu quy định. Mỗi lần kết xuất phải được lưu lại lịch sử phiên bản (Document Generation Version).  
* **Acceptance Intent:** Xuất tệp văn bản đúng định dạng biểu mẫu, điền đầy đủ dữ liệu và bảo đảm tính toàn vẹn thông tin.

# **18\. BRQ-SYS — Quản trị Hệ thống & Toàn vẹn Dữ liệu**

## **BRQ-SYS-001 — Quản lý cấu hình danh mục dùng chung**

* **Priority:** P1  
* **Status:** PROPOSED  
* **Actors:** ACT-09 (SYSTEM\_ADMIN)  
* **Sources:**  
  * Process: 01 (1.5.B), 02 (5.1.A)  
  * Rules: BR-DATA-001  
  * Overview Scope: 01 (1.5.A)  
* **Requirement:** Hệ thống phải cho phép quản trị viên cấu hình các danh mục dùng chung: đơn vị tính, loại cây trồng, danh mục hoạt chất bảo vệ thực vật, danh mục nhóm sản phẩm OCOP, mẫu biểu tài liệu.  
* **Acceptance Intent:** Cho phép bổ sung danh mục mới mà không cần can thiệp chỉnh sửa mã nguồn hệ thống.

## **BRQ-SYS-002 — Sao lưu và phục hồi dữ liệu tự động**

* **Priority:** P0  
* **Status:** CONFIRMED  
* **Actors:** ACT-09 (SYSTEM\_ADMIN)  
* **Sources:**  
  * Process: 01 (1.10), 02 (Section 21\)  
  * Rules: BR-DATA-002, BR-DATA-003  
  * Overview Scope: 01 (1.10)  
* **Requirement:** Hệ thống phải cung cấp cơ chế sao lưu tự động và phục hồi định kỳ đối với toàn bộ cơ sở dữ liệu và kho lưu trữ tệp minh chứng, bảo đảm tính sẵn sàng và khả năng khôi phục khi xảy ra sự cố kỹ thuật.  
* **Acceptance Intent:** Có khả năng khôi phục hệ thống về trạng thái sao lưu gần nhất mà không làm sai lệch tính nhất quán dữ liệu.

# **19\. Cross-Domain Requirements**

## **BRQ-CROSS-001 — Liên thông và tái sử dụng dữ liệu xuyên suốt**

* **Priority:** P0  
* **Status:** PROPOSED  
* **Actors:** Toàn bộ Actors  
* **Sources:**  
  * Process: 01 (Mục tiêu 2), 02 (Section 10, 14), 04 (Section 21\)  
  * Rules: BR-DATA-003, BR-AUDIT-004  
  * Overview Scope: 01 (1.4), 02 (Section 10\)  
* **Requirement:** Hệ thống phải thiết lập mối liên kết dữ liệu thống nhất, không tạo ra các bản ghi rời rạc:  
  $$\\text{Xã viên} \\rightarrow \\text{Thửa đất} \\rightarrow \\text{Mùa vụ} \\rightarrow \\text{Nhật ký} \\rightarrow \\text{Vật tư/Kho} \\rightarrow \\text{Lô thu hoạch} \\rightarrow \\text{Sản phẩm} \\rightarrow \\text{Hồ sơ OCOP} \\rightarrow \\text{Minh chứng}$$  
* **Acceptance Intent:** Mọi thay đổi dữ liệu gốc ở các thực thể liên kết được phản ánh nhất quán và có khả năng truy vấn chéo giữa các phân hệ.

## **BRQ-CROSS-002 — Tính toàn vẹn và bất biến của dữ liệu lịch sử**

* **Priority:** P0  
* **Status:** PROPOSED  
* **Actors:** Toàn bộ Actors  
* **Sources:**  
  * Process: Toàn bộ Business Processes  
  * Rules: BR-DATA-002, BR-AGRI-009, BR-LOG-009, BR-FIN-010, BR-EVIDENCE-004  
  * Overview Scope: 01 (1.10), 06 (Section 13\)  
* **Requirement:** Các dữ liệu nghiệp vụ quan trọng đã được chốt/khóa hoặc tham gia vào quy trình thẩm định OCOP, quyết toán tài chính không được phép xóa vật lý. Mọi thay đổi bắt buộc phải thực hiện thông qua cơ chế ghi nhận phiên bản mới (Versioning) hoặc bút toán điều chỉnh (Reversal) kèm lịch sử kiểm toán chi tiết.  
* **Acceptance Intent:** Bảo toàn 100% dữ liệu lịch sử phục vụ kiểm tra, kiểm toán và đối chiếu pháp lý.

# **20\. Traceability Matrix Summary**

| Domain | Business Requirement ID | Business Process Reference | Business Rules Reference | Primary Actors | Priority | Status |
| :---- | :---- | :---- | :---- | :---- | :---- | :---- |
| **COOP** | BRQ-COOP-001 | BP-MEM-001 | BR-COOP-001, BR-COOP-002 | ACT-01, ACT-02 | P0 | CONFIRMED |
|  | BRQ-COOP-002 | BP-MEM-001 | BR-COOP-008, BR-MEM-001, BR-MEM-002 | ACT-02, ACT-01 | P0 | CONFIRMED |
|  | BRQ-COOP-003 | BP-MEM-001 | BR-MEM-002, BR-DATA-002 | ACT-02, ACT-01 | P0 | CONFIRMED |
|  | BRQ-COOP-004 | BP-MEM-002 | BR-COOP-004, BR-COOP-005, BR-COOP-006 | ACT-02, ACT-01 | P0 | CONFIRMED |
|  | BRQ-COOP-005 | BP-MEM-002 | BR-COOP-006 | ACT-02 | P1 | CONFIRMED |
|  | BRQ-COOP-006 | BP-MEM-001 | BR-COOP-003 | ACT-01, ACT-02 | P1 | CONFIRMED |
| **AGRI** | BRQ-AGRI-001 | BP-CROP-001 | BR-AGRI-002, BR-AGRI-003 | ACT-02 | P0 | CONFIRMED |
|  | BRQ-AGRI-002 | BP-CROP-001 | BR-AGRI-001, BR-AGRI-002 | ACT-02 | P0 | CONFIRMED |
|  | BRQ-AGRI-003 | BP-SEASON-001 | BR-AGRI-005 | ACT-02, ACT-01 | P0 | CONFIRMED |
|  | BRQ-AGRI-004 | BP-PROD-001 | BR-AGRI-004, BR-AGRI-005, BR-AGRI-007 | ACT-02, ACT-01 | P0 | CONFIRMED |
|  | BRQ-AGRI-005 | BP-PROD-001, BP-INV-002 | BR-AGRI-004, BR-LOG-001, BR-LOG-002 | ACT-02 | P0 | CONFIRMED |
|  | BRQ-AGRI-006 | BP-PROD-001 | BR-AGRI-006 | ACT-02, ACT-01 | P0 | TO\_VERIFY |
|  | BRQ-AGRI-007 | BP-HARVEST-001 | BR-AGRI-008 | ACT-02 | P0 | INFERRED |
|  | BRQ-AGRI-008 | BP-PROD-001, BP-SEASON-001 | BR-AGRI-009, BR-DATA-002 | ACT-02, ACT-01 | P1 | PROPOSED |
| **PROD** | BRQ-PROD-001 | BP-PRODUCT-001 | BR-OCOP-001, BR-DATA-001 | ACT-01, ACT-02 | P0 | CONFIRMED |
| **LOG** | BRQ-LOG-001 | BP-INV-001 | BR-LOG-001, BR-LOG-002 | ACT-02 | P0 | CONFIRMED |
|  | BRQ-LOG-002 | BP-INV-001 | BR-LOG-004 | ACT-02 | P0 | CONFIRMED |
|  | BRQ-LOG-003 | BP-INV-002 | BR-LOG-003, BR-LOG-005, BR-LOG-006 | ACT-02 | P0 | CONFIRMED |
|  | BRQ-LOG-004 | BP-INV-003 | BR-LOG-007, BR-LOG-008, BR-LOG-009 | ACT-02 | P1 | CONFIRMED |
| **FIN** | BRQ-FIN-001 | BP-FIN-001 | BR-FIN-001, BR-FIN-002, BR-FIN-003 | ACT-02, ACT-01 | P0 | CONFIRMED |
|  | BRQ-FIN-002 | BP-FIN-002 | BR-FIN-004, BR-FIN-007 | ACT-02, ACT-01 | P0 | CONFIRMED |
|  | BRQ-FIN-003 | BP-FIN-003 | BR-FIN-008, BR-FIN-009, BR-FIN-010 | ACT-02, ACT-01 | P0 | TO\_VERIFY |
|  | BRQ-FIN-004 | BP-FIN-001/002 | BR-FIN-005, BR-FIN-006 | ACT-02, ACT-01 | P1 | TO\_VERIFY |
| **OCOP** | BRQ-OCOP-001 | BP-OCOP-001 | BR-OCOP-001, BR-OCOP-002 | ACT-01, ACT-02 | P0 | CONFIRMED |
|  | BRQ-OCOP-002 | BP-OCOP-002 | BR-OCOP-002, BR-OCOP-003, BR-VERSION-001 | ACT-08 | P0 | CONFIRMED |
|  | BRQ-OCOP-003 | BP-OCOP-003 | BR-OCOP-004, BR-OCOP-006, BR-CALC-001 | ACT-01, ACT-02 | P0 | CONFIRMED |
|  | BRQ-OCOP-004 | BP-OCOP-006 | BR-OCOP-007, BR-SEC-002, BR-CALC-003 | ACT-04, ACT-05 | P0 | CONFIRMED |
|  | BRQ-OCOP-005 | BP-OCOP-007 | BR-OCOP-008, BR-OCOP-009, BR-CALC-001 | ACT-06 | P0 | CONFIRMED |
|  | BRQ-OCOP-006 | BP-OCOP-007 | BR-OCOP-010, BR-OCOP-011 | ACT-06, ACT-07 | P0 | CONFIRMED / TO\_VERIFY |
|  | BRQ-OCOP-007 | BP-OCOP-008 | BR-OCOP-012, BR-DATA-002 | ACT-07, ACT-01 | P1 | TO\_VERIFY |
| **EVIDENCE** | BRQ-EVIDENCE-001 | BP-OCOP-004 | BR-EVIDENCE-001, BR-EVIDENCE-003, BR-DATA-006 | ACT-01, ACT-02 | P0 | CONFIRMED |
|  | BRQ-EVIDENCE-002 | BP-OCOP-004 | BR-EVIDENCE-002 | ACT-01, ACT-02 | P0 | CONFIRMED |
|  | BRQ-EVIDENCE-003 | BP-OCOP-004, BP-OCOP-005 | BR-EVIDENCE-004, BR-EVIDENCE-006, BR-VERSION-002 | ACT-01, ACT-03 | P0 | PROPOSED |
|  | BRQ-EVIDENCE-004 | BP-OCOP-005 | BR-EVIDENCE-005, BR-EVIDENCE-006 | ACT-03, ACT-05 | P0 | TO\_VERIFY |
|  | BRQ-EVIDENCE-005 | BP-OCOP-004 | BR-EVIDENCE-005, BR-SEC-005 | ACT-09, ALL | P0 | CONFIRMED |
|  | BRQ-EVIDENCE-006 | BP-OCOP-004, BP-PROD-001 | BR-EVIDENCE-007, BR-AUDIT-004 | ACT-01, ACT-02 | P1 | INFERRED |
| **WORKFLOW** | BRQ-WORKFLOW-001 | BP-OCOP-001/005/006/007 | BR-WORKFLOW-001, BR-WORKFLOW-002, BR-WORKFLOW-005 | ALL | P0 | PROPOSED |
|  | BRQ-WORKFLOW-002 | BP-OCOP-001, BP-OCOP-003 | BR-OCOP-005, BR-WORKFLOW-002 | ACT-01, ACT-02 | P0 | CONFIRMED |
|  | BRQ-WORKFLOW-003 | BP-OCOP-005 | BR-WORKFLOW-003, BR-WORKFLOW-004 | ACT-03, ACT-01 | P0 | CONFIRMED |
|  | BRQ-WORKFLOW-004 | BP-OCOP-006/007 | BR-WORKFLOW-004, BR-DATA-002, BR-OCOP-004 | ALL | P0 | PROPOSED |
| **SEC** | BRQ-SEC-001 | 05 (Section 16\) | BR-SEC-001 | ACT-09 | P0 | PROPOSED |
|  | BRQ-SEC-002 | 05 (ACTORS\_AND\_ROLES) | BR-SEC-001, BR-SEC-005 | ACT-09 | P0 | CONFIRMED |
|  | BRQ-SEC-003 | 05 (Section 19\) | BR-SEC-005, BR-SEC-006 | ALL | P0 | PROPOSED |
|  | BRQ-SEC-004 | 05 (Section 21\) | BR-SEC-001, BR-SEC-002, BR-SEC-003 | ACT-09 | P0 | TO\_VERIFY |
| **AUDIT** | BRQ-AUDIT-001 | 05 (Section 18, 24\) | BR-AUDIT-001, BR-AUDIT-002, BR-SEC-004 | ACT-09, ALL | P0 | PROPOSED |
|  | BRQ-AUDIT-002 | 04 (Section 18\) | BR-AUDIT-003, BR-AUDIT-004 | ACT-07, ACT-09 | P0 | PROPOSED |
| **REPORT** | BRQ-REPORT-001 | BP-MEM-001, BP-CROP-001, BP-INV-001, BP-FIN-001 | BR-REPORT-001 | ACT-01, ACT-02, ACT-10 | P1 | CONFIRMED |
|  | BRQ-REPORT-002 | BP-OCOP-001, BP-OCOP-005 | BR-REPORT-001 | ACT-01, ACT-02, ACT-03 | P0 | CONFIRMED |
|  | BRQ-REPORT-003 | BP-OCOP-008 | BR-REPORT-002, BR-REPORT-003, BR-REPORT-004, BR-VERSION-003 | ACT-01, ACT-06 | P0 | CONFIRMED |
| **SYS** | BRQ-SYS-001 | 01 (1.5.B), 02 (5.1.A) | BR-DATA-001 | ACT-09 | P1 | PROPOSED |
|  | BRQ-SYS-002 | 01 (1.10), 02 (Section 21\) | BR-DATA-002, BR-DATA-003 | ACT-09 | P0 | CONFIRMED |
| **CROSS** | BRQ-CROSS-001 | All Processes | BR-DATA-003, BR-AUDIT-004 | ALL | P0 | PROPOSED |
|  | BRQ-CROSS-002 | All Processes | BR-DATA-002, BR-AGRI-009, BR-LOG-009, BR-FIN-010, BR-EVIDENCE-004 | ALL | P0 | PROPOSED |

# **21\. Open Questions for Next Validation**

| ID | Câu hỏi khảo sát nghiệp vụ cần làm rõ | Mức độ ưu tiên | Domain liên quan |
| :---- | :---- | :---- | :---- |
| OQ-001 | Phiên bản bộ tiêu chí OCOP chính thức mà địa phương/HTX đang áp dụng theo Quyết định nào? | Critical | OCOP |
| OQ-002 | Thẩm quyền phê duyệt chính thức theo phân cấp (Xã, Huyện, Tỉnh hay Trung ương) cho từng mức sao? | Critical | OCOP / SEC |
| OQ-003 | Quy tắc xử lý độ lệch điểm giữa các giám khảo (ngưỡng 10 điểm) có áp dụng bắt buộc không? | High | OCOP |
| OQ-004 | Công thức và tỷ lệ trích lập quỹ chung không chia và phân chia thặng dư theo Điều lệ HTX thực tế là bao nhiêu? | Critical | FIN |
| OQ-005 | Quy trình và chính sách xử lý công nợ vật tư tồn đọng khi cấn trừ sản lượng cuối vụ không đủ bù đắp? | High | FIN / LOG |
| OQ-006 | HTX có triển khai hoạt động tín dụng/cho vay nội bộ không và hạn mức tối đa là bao nhiêu? | Medium | FIN |
| OQ-007 | Các mẫu biểu kết xuất hồ sơ PDF/DOCX chính thức mà cơ quan đánh giá yêu cầu? | Critical | REPORT |
| OQ-008 | Hệ thống có yêu cầu tích hợp Chữ ký số (Digital Signature) trên hồ sơ nộp hay chỉ ký trên bản giấy? | High | EVIDENCE / WORKFLOW |

