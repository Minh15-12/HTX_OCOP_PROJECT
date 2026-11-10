# SỔ ĐĂNG KÝ QUY TẮC DỰ ÁN (RULES REGISTER)
> **Mã tài liệu:** `00_RULES_REGISTER.md`  
> **Dự án:** Hệ thống Quản lý Hợp tác xã Nông nghiệp & Số hóa Hồ sơ OCOP (`HTX_OCOP_PROJECT`)  
> **Phiên bản:** 1.0 — Chuẩn hóa & Đối chiếu Pháp lý Thực tế  
> **Cập nhật lần cuối:** 2026-10-29  

---

## 1. MỤC TIÊU & NGUYÊN TẮC QUẢN TRỊ QUY TẮC

1. **Minh bạch hóa Căn cứ:** Mọi quy tắc trong hệ thống phải được phân loại rạch ròi giữa:
   - **`LEGAL_STATUTE`**: Văn bản Quy phạm Pháp luật Nhà nước (Luật, Nghị định, Quyết định Thủ tướng, Thông tư).
   - **`TECH_STANDARD`**: Tiêu chuẩn Kỹ thuật Quốc gia / Quốc tế (GS1, TCVN, TCCS, Chuẩn mã hóa NIST).
   - **`COOP_POLICY`**: Quy chế nội bộ / Điều lệ Hợp tác xã (Hạn mức tín dụng, tỷ lệ phân chia, quy cách cảm quan Grade A/B).
   - **`SYSTEM_DESIGN`**: Quy ước Thiết kế & Kiến trúc Phần mềm (FSM, Clean Architecture, Anti-monolithic, Idempotency).
2. **Theo dõi Song song Văn bản Gốc và Văn bản Sửa đổi:** Không chỉ ghi nhận văn bản ban đầu mà phải cập nhật văn bản sửa đổi bổ sung (ví dụ: QĐ 148/QĐ-TTg kèm QĐ 1489/QĐ-TTg; Luật HTX 2023 có hiệu lực từ 01/07/2024).
3. **Chống Viện dẫn Sai lệch (Citation Integrity):** Kiểm tra nội dung văn bản trên Cổng thông tin Chính phủ / Cơ sở dữ liệu Quốc gia trước khi gắn nhãn "theo luật".

---

## 2. MA TRẬN ĐĂNG KÝ QUY TẮC CHI TIẾT (RULES MATRIX)

| Rule ID | Phân loại | Nội dung quy tắc | Nguồn căn cứ & Điều khoản | Phiên bản / Văn bản liên quan | Ngày hiệu lực | Module áp dụng | Trạng thái xác minh | Cơ chế kiểm chứng / Test |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **R-LEG-001** | `LEGAL_STATUTE` | Giới hạn vốn góp cá nhân: Một thành viên chính thức không góp quá 30% vốn điều lệ HTX | Điều 74, Luật Hợp tác xã số 17/2023/QH15 | Thay thế Luật HTX 2012 | 01/07/2024 | `Cooperative` | `CONFIRMED` | `CreateCapitalTest`, Validation request chặn khi `share_percent > 30` |
| **R-LEG-002** | `LEGAL_STATUTE` | Giới hạn vốn góp liên kết: Tổng vốn góp của các thành viên liên kết góp vốn $\le 30\%$ vốn điều lệ | Điều 74, Luật Hợp tác xã số 17/2023/QH15 | Luật HTX 2023 | 01/07/2024 | `Cooperative` | `CONFIRMED` | Tổng hợp vốn góp liên kết trước khi phê duyệt |
| **R-LEG-003** | `LEGAL_STATUTE` | Quyền biểu quyết Đại hội thành viên: Bình đẳng 1 thành viên = 1 phiếu, không phụ thuộc vốn góp | Điều 21, Điều 72, Luật Hợp tác xã số 17/2023/QH15 | Luật HTX 2023 | 01/07/2024 | `Cooperative` | `CONFIRMED` | `CastVoteRequest`, bảng `votes` unique `(meeting_id, member_id)` |
| **R-LEG-004** | `LEGAL_STATUTE` | Thời hạn nộp đủ vốn góp cam kết: Tối đa 06 tháng kể từ ngày được chấp thuận gia nhập | Điều 74, Luật Hợp tác xã số 17/2023/QH15 | Luật HTX 2023 | 01/07/2024 | `Cooperative` | `CONFIRMED` | Cron job kiểm tra `created_at + 180 days` cảnh báo quá hạn |
| **R-LEG-005** | `LEGAL_STATUTE` | Trích lập Quỹ chung không chia tối thiểu 5% từ thu nhập giao dịch bên ngoài HTX | Điều 83 & 84, Luật Hợp tác xã số 17/2023/QH15 | Luật HTX 2023 | 01/07/2024 | `Finance` | `CONFIRMED` | Thuật toán quyết toán năm trích $\ge 5\%$ vào Quỹ không chia |
| **R-LEG-006** | `LEGAL_STATUTE` | Phân phối thặng dư nội bộ: Tối thiểu 51% thặng dư từ giao dịch nội bộ chia theo mức độ sử dụng SP/DV | Điều 85, Luật Hợp tác xã số 17/2023/QH15 | Luật HTX 2023 | 01/07/2024 | `Finance` | `CONFIRMED` | Service phân phối kiểm tra tỷ lệ phân bổ theo doanh số dịch vụ |
| **R-LEG-007** | `LEGAL_STATUTE` | Bộ tiêu chí và quy trình đánh giá, phân hạng OCOP (Thang 100 điểm, 3 phần A/B/C) | Quyết định 148/QĐ-TTg ngày 24/02/2023 | Văn bản gốc | 24/02/2023 | `Ocop` | `CONFIRMED` | `CriteriaCatalogSeeder`, cấu trúc `criteria` động trong DB |
| **R-LEG-008** | `LEGAL_STATUTE` | Cập nhật quy trình, phân cấp thẩm quyền đánh giá và điều chỉnh một số tiêu chí OCOP | Quyết định 1489/QĐ-TTg ngày 06/07/2025 | Sửa đổi, bổ sung QĐ 148/QĐ-TTg | 06/07/2025 | `Ocop` | `VERIFIED_AMENDED` | Cấu hình `criteria_version_id`, hỗ trợ phiên bản 2023 và 2025 |
| **R-LEG-009** | `LEGAL_STATUTE` | Phân hạng sao OCOP: 1 sao (<30đ), 2 sao (30-49đ), 3 sao (50-69đ), 4 sao (70-89đ), 5 sao (90-100đ) | Quyết định 148/QĐ-TTg & QĐ 1489/QĐ-TTg | Bộ tiêu chí OCOP | Hiện hành | `Ocop` | `CONFIRMED` | `OcopEvaluationServiceTest`, test biên giá trị 49/50, 69/70, 89/90 |
| **R-LEG-010** | `LEGAL_STATUTE` | Thời hạn hiệu lực giấy chứng nhận OCOP 3–5 sao là 36 tháng kể từ ngày quyết định công nhận | QĐ 148/QĐ-TTg (Điều 10) | QĐ 148 & QĐ 1489 | Hiện hành | `Ocop` | `CONFIRMED` | Tự động tính `expired_date = issue_date + 36 months` |
| **R-LEG-011** | `LEGAL_STATUTE` | Điều kiện góp vốn bằng Quyền sử dụng đất: Phải có hợp đồng công chứng, Giấy chứng nhận QSDĐ hợp pháp | Luật Đất đai 2024 (sửa đổi) & Luật HTX 2023 | Luật Đất đai | 01/08/2024 | `Cooperative` | `CONFIRMED` | `CreateLandContributionRequest` validate số sổ, số vào sổ, diện tích |
| **R-LEG-012** | `LEGAL_STATUTE` | Chế độ kế toán HTX: Theo dõi phân kỳ công nợ 5 kỳ và chứng từ sổ quỹ tiền mặt | Thông tư 24/2017/TT-BTC của Bộ Tài chính | Chế độ Kế toán HTX | 01/01/2018 | `Finance` | `CONFIRMED` | `DebtsTab`, `CashbookTab`, `DebtAgingSummaryCard` |
| **R-STD-001** | `TECH_STANDARD` | Định dạng mã Lô thu hoạch GS1 Lot ID: `LOT-[CoopCode]-[PlotCode]-[YYYYMMDD]-[Seq]` | GS1 General Specifications & GTIN/GLN | GS1 Standard | Toàn cầu | `Agriculture` | `TECHNICAL_DESIGN` | Regex validation trên backend, QR code generator |
| **R-STD-002** | `TECH_STANDARD` | Vùng trồng tập trung cấp mã PUC cây ăn quả tối thiểu 10 ha | Tiêu chuẩn cơ sở TCCS 774:2020/BVTV | Cục Bảo vệ Thực vật | 2020 | `Agriculture` | `CONFIRMED` | Cảnh báo khi diện tích đề xuất cấp mã PUC < 10 ha |
| **R-STD-003** | `TECH_STANDARD` | Nguyên tắc nhật ký canh tác điện tử: Lưu đủ 10 trường dữ liệu (Hoạt động, thời gian, thửa, mùa, SKU, lô vật tư, liều lượng, PHI, GPS, ảnh) | TCVN 12850:2019 (Truy xuất nguồn gốc) & VietGAP TCVN 11892-1:2017 *(Lưu ý: Không dùng nhãn Thông tư 02/2024)* | Tiêu chuẩn Quốc gia | Hiện hành | `Agriculture` | `CORRECTED_REF` | Form Request validation kiểm tra đủ 10 trường nhật ký thực địa |
| **R-STD-004** | `TECH_STANDARD` | Băm nối chuỗi kiểm toán bất biến (Audit Hash Chaining) SHA-256 | FIPS PUB 180-4 (NIST SHA-256) | Tiêu chuẩn mật mã | Quốc tế | `Audit` | `TECHNICAL_DESIGN` | `current_hash = SHA256(data + prev_hash)`, test kiểm tra đứt gãy |
| **R-STD-005** | `TECH_STANDARD` | Chuyển đổi trắc địa Tọa độ Sổ đỏ VN-2000 (Múi chiếu 3°, Ellipsoid WGS-84, $k_0=0.9999$) sang tọa độ GPS WGS-84 Leaflet WebGIS | QĐ 973/2001/QĐ-TTg & Thông tư 25/2014/TT-BTNMT (Bản đồ địa chính) | Quy chuẩn Bản đồ Địa chính | Hiện hành | `Agriculture` | `CONFIRMED` | `convertVn2000ToWgs84`, kiểm thử sai số $< 0.05\text{mm}$, tính diện tích Spherical Excess |
| **R-COP-001** | `COOP_POLICY` | PHI Guard (Thời gian cách ly an toàn): Chặn lệnh thu hoạch nếu $harvest\_date < spray\_date + PHI$ | Quy trình VietGAP nội bộ & Nhãn thuốc BVTV đăng ký | Nội quy HTX | Hiện hành | `Agriculture` | `INTERNAL_COOP` | `HarvestController`, mã lỗi `ERR_HARVEST_PHI_VIOLATION` |
| **R-COP-002** | `COOP_POLICY` | Quy trình KCS 3 cấp khi Nhập kho & Thu hoạch (Gate Check $\rightarrow$ Quick Lab $\rightarrow$ Grading) | Quy trình kiểm soát chất lượng nội bộ HTX Tân Tiến | Sổ tay KCS HTX | Hiện hành | `Inventory`, `Agri` | `INTERNAL_COOP` | Trạng thái phiếu kiểm nghiệm, `LAB_PASSED`, phân hạng A/B/Reject |
| **R-COP-003** | `COOP_POLICY` | Tiêu chuẩn cảm quan Grade A ớt chuông: Độ đồng đều $\ge 90\%$, độ Brix $\ge 7^\circ$, không dị hình | Quy chuẩn chất lượng sản phẩm xuất khẩu HTX Tân Tiến | Quy chế kỹ thuật | Nội bộ | `Agriculture` | `INTERNAL_COOP` | Form phân loại KCS thu hoạch |
| **R-COP-004** | `COOP_POLICY` | Cấp vật tư trả chậm đầu vụ (Credit Advance) theo hạn mức tín dụng xã viên (`credit_limit`) | Chính sách hỗ trợ thành viên theo Điều lệ HTX | Quy chế tài chính | Nội bộ | `Inventory`, `Finance` | `INTERNAL_COOP` | Kiểm tra dư nợ khả dụng trước khi duyệt xuất kho nợ |
| **R-COP-005** | `COOP_POLICY` | Công thức cấn trừ mùa vụ: $D = \min(D_{\text{debt}}, V_{\text{total}} - \text{Fee})$, nợ thừa kết chuyển kỳ sau | Quy chế quyết toán hợp đồng bao tiêu HTX | Quy chế tài chính | Nội bộ | `Finance` | `INTERNAL_COOP` | `HarvestSettlementServiceTest`, bảo đảm không bao giờ xóa nợ thừa |
| **R-COP-006** | `COOP_POLICY` | Phí dịch vụ HTX khấu trừ khi thu mua: $r = 2 - 3\%$ (cấu hình linh hoạt) | Hợp đồng dịch vụ nông nghiệp HTX | Điều lệ HTX | Nội bộ | `Finance` | `INTERNAL_COOP` | Cho phép Ban Giám đốc cấu hình tỷ lệ $r$ theo vụ, cấm hardcode |
| **R-COP-007** | `COOP_POLICY` | Tỷ lệ phân chia thặng dư nội bộ: 70% mức độ sử dụng dịch vụ / 30% tỷ lệ vốn góp (hoặc 50/50) | Nghị quyết Đại hội thành viên thường niên HTX | Điều lệ HTX | Hàng năm | `Finance` | `INTERNAL_COOP` | Cấu hình tham số phân bổ linh hoạt theo Nghị quyết Đại hội |
| **R-COP-008** | `COOP_POLICY` | Cơ chế kiểm soát gian lận sản lượng & Phương án B: Định mức trần sinh thái thửa đất ($5.0\text{ kg/m}^2$, dung sai $+20\%$). Vượt trần gắn nhãn `NEEDS_RECONCILIATION`, tạm giữ thanh toán `withheld_excess_kg` chờ BKS đối soát thực địa | Quy chế Quản lý Vùng trồng & Bao tiêu Nông sản HTX | Quy chế nội bộ | Hiện hành | `Agriculture`, `Finance` | `INTERNAL_COOP` | `calculateHarvestQuota`, cảnh báo vàng `HarvestsTable`, tạm giữ `withheld_excess_kg` trong `HarvestSettlementService` |
| **R-SYS-001** | `SYSTEM_DESIGN` | Vòng đời xã viên FSM 5 trạng thái: `CHO_DUYET` $\rightarrow$ `DANG_HOAT_DONG` $\rightleftharpoons$ `TAM_DINH_CHI` $\rightarrow$ `CHO_QUYET_TOAN` $\rightarrow$ `DA_CHAM_DUT` | Kiến trúc FSM của hệ thống | Thiết kế DDD | Vĩnh viễn | `Cooperative` | `SYSTEM_ARCH` | FSM Transition Matrix, cấm nhảy cóc trạng thái |
| **R-SYS-002** | `SYSTEM_DESIGN` | Cấm Hard Delete đối với Xã viên, Lô hàng, Minh chứng OCOP; bắt buộc Soft Delete | Thiết kế toàn vẹn dữ liệu lịch sử | Thiết kế DDD | Vĩnh viễn | Toàn hệ thống | `SYSTEM_ARCH` | Eloquent `SoftDeletes`, cấm `DELETE FROM` trực tiếp |
| **R-SYS-003** | `SYSTEM_DESIGN` | Xuất kho theo nguyên tắc FEFO (hàng có date) và FIFO (hàng không date) | Quản trị tồn kho thông minh | Thiết kế kho | Vĩnh viễn | `Inventory` | `SYSTEM_ARCH` | Thuật toán xuất kho sắp xếp theo `expiry_date ASC` |
| **R-SYS-004** | `SYSTEM_DESIGN` | Ràng buộc Cô lập Đa người thuê (Tenant Isolation) tại tầng Data Layer (Repository/Global Scope) | Bảo mật đa người thuê (Multi-tenancy) | Thiết kế bảo mật | Vĩnh viễn | Toàn hệ thống | `SYSTEM_ARCH` | `cooperative_id` trong Eloquent Global Scope, API Request, Job, Export |
| **R-SYS-005** | `SYSTEM_DESIGN` | Idempotency Key cho các API tài chính, duyệt phiếu, xuất kho, quyết toán | Kiểm soát tương tranh & chống gọi trùng | Thiết kế API | Vĩnh viễn | `Finance`, `Inventory`| `SYSTEM_ARCH` | Middleware kiểm tra Header `Idempotency-Key` với Redis cache |
| **R-SYS-006** | `SYSTEM_DESIGN` | Cấm Silent Mocking tại runtime: Hiển thị đúng Skeleton, Empty State, Error Alert; chỉ mock trong test fixture | Nguyên tắc trung thực dữ liệu | Clean Code | Vĩnh viễn | Frontend | `SYSTEM_ARCH` | Kiểm tra code review, cấm `list.length || 24` |
| **R-SYS-007** | `SYSTEM_DESIGN` | Bóc tách Frontend theo Đơn trách nhiệm (Single Responsibility), ngưỡng cảnh báo 400 dòng | Nguyên tắc Clean Frontend | Clean Code | Vĩnh viễn | Frontend | `SYSTEM_ARCH` | Bóc tách `useData`, `Table`, `Modal`, `Drawer` |
| **R-SYS-008** | `SYSTEM_DESIGN` | Kiểm soát Tenant toàn luồng: Bắt buộc ở Data Layer, quan hệ lồng, Queue Jobs, Export; không chỉ ở Controller | Cô lập Đa người thuê an toàn | Bảo mật & Integrity | Vĩnh viễn | Toàn hệ thống | `SYSTEM_ARCH` | Test truy cập chéo tenant với ID của HTX khác |
| **R-SYS-009** | `SYSTEM_DESIGN` | Kiểm chứng nghiệp vụ & dữ liệu thực tế: Không chỉ nhìn HTTP 200/test xanh; kiểm tra biến động DB, số dư, chống trừ kho/ghi sổ lặp | Tính toàn vẹn nghiệp vụ (Semantic Integrity) | Clean QA | Vĩnh viễn | Backend, DB | `SYSTEM_ARCH` | Assert database state, lockForUpdate, balance check |
| **R-SYS-010** | `SYSTEM_DESIGN` | Thay đổi phẫu thuật (Surgical Changes): Cấm refactor toàn bộ dự án khi sửa một tính năng; ưu tiên thay đổi nhỏ, reviewable, rollbackable | Giảm thiểu bán kính ảnh hưởng (Blast Radius) | Clean Code | Vĩnh viễn | Toàn hệ thống | `SYSTEM_ARCH` | Giữ nguyên backend ổn định, cô lập thay đổi theo commit nhỏ |
| **R-SYS-011** | `SYSTEM_DESIGN` | Đa phương thức In/Xuất chứng từ (Device-Agnostic Printing & Exporting): Mọi biểu mẫu, chứng từ (Mẫu 02-VT, sổ sách, hợp đồng, báo cáo OCOP) bắt buộc cung cấp tối thiểu 3 lựa chọn: In trực tiếp (`window.print`), Tải file PDF (`.pdf`), Tải file Excel/CSV (`.xlsx`/`.csv`) để đáp ứng mọi thiết bị người dùng (laptop không có máy in, máy tính bảng, điện thoại); cấm chỉ có duy nhất nút in trình duyệt | Thiết kế đa thiết bị & Lưu trữ số | Trải nghiệm người dùng & Lưu trữ | Vĩnh viễn | Frontend, Report | `SYSTEM_ARCH` | Kiểm tra giao diện modal in/chứng từ có đủ 3 nút hành động |
| **R-SYS-012** | `SYSTEM_DESIGN` | Toàn vẹn hiển thị văn bản dài & Chống cắt cụt dấu ba chấm (`...`) trên chứng từ (Long Text & Anti-Truncation Resilience): Dữ liệu nông nghiệp/HTX thường dài (tên hoạt chất BVTV, quy cách vật tư, địa chỉ xã viên, ghi chú). Tuyệt đối cấm dùng `truncate`/`overflow-hidden` gây mất chữ trên phiếu in, chứng từ kế toán và modal xem trước; bắt buộc dùng `break-words`, `whitespace-normal`, kiểm soát độ rộng cột hợp lý và xử lý `@media print` ngắt trang an toàn (`break-inside-avoid`, lặp `thead`) | Chuẩn mực chứng từ & Toàn vẹn thông tin | UI/UX & Print CSS | Vĩnh viễn | Frontend, Print | `SYSTEM_ARCH` | Kiểm tra CSS in ấn không có `text-overflow: ellipsis`, test với dữ liệu chuỗi dài |
| **R-SYS-013** | `SYSTEM_DESIGN` | Quy chuẩn Kỹ thuật Xuất Chứng từ & In ấn PDF A4 (`RULE-TECH-DOC-01`): Chống xé chữ, gãy âm tiết tiếng Việt, định dạng ngày `DD/MM/YYYY`, phân trang chuẩn `.html2pdf__page-break` (`page-break-before: always`), lặp `thead` `table-header-group`, `tr` `page-break-inside: avoid`, giới hạn 10 cột A4 dọc, gộp cột liên đới (Cách ly PHI & Ngày an toàn), cấu hình `html2canvas` scale 2, không đặt `windowWidth` cứng làm cụt viền phải | [`docs/41_QUY_CHUAN_XUAT_CHUNG_TU_IN_AN_PDF.md`](file:///f:/HTX_OCOP_PROJECT/docs/41_QUY_CHUAN_XUAT_CHUNG_TU_IN_AN_PDF.md) | Quy chuẩn Kỹ thuật | Vĩnh viễn | Frontend, Print, PDF | `SYSTEM_ARCH` | E2E Playwright test kiểm tra screenshot không xé chữ, tải file PDF hợp lệ |

---

## 3. PHÂN ĐỊNH RÕ RÀNG GIỮA CĂN CỨ PHÁP LUẬT VÀ NỘI QUY HTX

> [!IMPORTANT]
> **Quy định bắt buộc đối với AI Coding Agent:**
> 1. **Tuyệt đối không gán nhãn "theo quy định pháp luật"** cho các tham số thuộc thẩm quyền nội bộ HTX như:
>    - Mức phí dịch vụ $2 - 3\%$ (đây là thỏa thuận hợp đồng dịch vụ nội bộ).
>    - Tỷ lệ phân chia 70/30 hay 50/50 (đây là điều khoản Điều lệ HTX thông qua bởi Đại hội thành viên).
>    - Hạn mức tín dụng trả chậm, quy chuẩn cảm quan độ ngọt Brix $7^\circ$ của ớt chuông.
> 2. **Sửa đổi viện dẫn Thông tư 02/2024/TT-BNNPTNT:** Không trích dẫn Thông tư 02/2024/TT-BNNPTNT làm căn cứ cho 10 trường nhật ký canh tác. Căn cứ truy xuất nguồn gốc nông sản phải dựa trên **TCVN 12850:2019**, **Thông tư 17/2021/TT-BNNPTNT** và tiêu chuẩn **VietGAP TCVN 11892-1:2017**.
> 3. **Theo dõi cập nhật OCOP:** Khi tính toán hoặc kiểm tra quy trình OCOP, hệ thống phải đối chiếu đồng thời **Quyết định 148/QĐ-TTg** và **Quyết định 1489/QĐ-TTg ngày 06/07/2025** (về sửa đổi, bổ sung quy trình đánh giá và bộ tiêu chí).

---

## 4. THỨ BẬC VÀ THỨ TỰ ƯU TIÊN GIỮA CÁC TỆP CHỈ DẪN (DOCUMENTATION HIERARCHY)

Khi có nội dung mâu thuẫn hoặc chưa thống nhất giữa các tệp tài liệu, AI Agent **BẮT BUỘC** áp dụng thứ bậc ưu tiên sau:

```
[TẦNG 1: NGUỒN PHÁP LÝ & SỔ ĐĂNG KÝ QUY TẮC]
  └── docs/00_RULES_REGISTER.md (Sổ đăng ký tập trung, đối chiếu văn bản Quốc gia)
        ↓
[TẦNG 2: CHỈ DẪN TỐI CAO CHO AI AGENT TRONG CONTEXT]
  └── AGENTS.md & GEMINI.md (Chỉ dẫn hệ thống, 3 Nguyên tắc Bắt buộc A-B-C, Trụ cột IV)
        ↓
[TẦNG 3: CẨM NANG KIẾN TRÚC & QUY CHUẨN KỸ THUẬT TOÀN DỰ ÁN]
  └── AGENT.md (9 Modules DDD, FSM Engine, RBAC Matrix, Tech Stack, Key Guardrails)
        ↓
[TẦNG 4: QUY TRÌNH NGHIỆP VỤ & TÀI LIỆU KỸ THUẬT CHUYÊN ĐỀ]
  └── docs/38_QUY_TAC_KY_THUAT_LAP_TRINH_AI_AGENT.md, docs/06_BUSINESS_RULES.md, docs/30–36
        ↓
[TẦNG 5: TỔNG QUAN DỰ ÁN & HƯỚNG DẪN VẬN HÀNH CHUNG]
  └── README.md
```

### Nguyên tắc giải quyết mâu thuẫn:
1. **Pháp luật chính thức > Quyết định của Chủ dự án > Đặc tả SRS/Business Rules > Thiết kế kỹ thuật > Đề xuất của Agent.**
2. **CẤM ÂM THẦM CHỌN MỘT PHƯƠNG ÁN:** Nếu hai tệp tài liệu mâu thuẫn hoặc tài liệu thiếu căn cứ xác thực, Agent **phải ghi nhận rõ mâu thuẫn vào báo cáo/transcript và yêu cầu người dùng xác minh**, tuyệt đối không tự ý chọn một phương án để triển khai.

---

## 5. BẢNG THEO DÕI CĂN CỨ PHÁP LÝ CẦN XÁC MINH & BỔ SUNG (LEGAL VERIFICATION REGISTER)

| STT | Văn bản căn cứ | Ngày ban hành & Hiệu lực | Nội dung viện dẫn trong hệ thống | Tình trạng xác minh thực tế | Tác động cụ thể đến mã nguồn / phần mềm |
| :---: | :--- | :--- | :--- | :--- | :--- |
| 1 | **Luật Hợp tác xã số 17/2023/QH15** | Ban hành 20/06/2023; **Hiệu lực 01/07/2024** | Trần vốn 30%, 1 người 1 phiếu, quỹ không chia 5%, thặng dư tối thiểu 51% theo dịch vụ | `CONFIRMED` — Đã kiểm tra Cổng TTĐT Chính phủ | Backend validate `share_percent <= 30`, cấn trừ nợ, thuật toán phân chia thặng dư |
| 2 | **Quyết định 148/QĐ-TTg** | Ban hành & Hiệu lực **24/02/2023** | Bộ tiêu chí quốc gia OCOP thang 100 điểm, phân hạng 1–5 sao, thẩm định 3 cấp | `CONFIRMED` — Văn bản gốc | Database seeder nạp bộ tiêu chí gốc phiên bản 2023 |
| 3 | **Quyết định 1489/QĐ-TTg** | Ban hành **06/07/2025** | Sửa đổi, bổ sung một số điều của QĐ 148/QĐ-TTg về thẩm quyền, tiêu chí đánh giá | `VERIFIED_AMENDED` — Cần tiếp tục theo dõi hướng dẫn thực hiện | Bảng `criteria_versions` hỗ trợ dynamic versions; không hardcode logic chấm điểm |
| 4 | **Thông tư 02/2024/TT-BNNPTNT** | Ban hành 10/05/2024 | Tài liệu cũ gán nhầm làm căn cứ 10 trường nhật ký canh tác | `MISATTRIBUTED` — Văn bản thực chất về phòng chống tham nhũng / thôi giữ chức vụ | Đã gỡ bỏ toàn bộ nhãn Thông tư 02/2024 khỏi nhật ký canh tác và truy xuất nguồn gốc |
| 5 | **TCVN 12850:2019 & TT 17/2021/TT-BNNPTNT** | 2019 / 2021 | Tiêu chuẩn Quốc gia về truy xuất nguồn gốc nông sản và an toàn thực phẩm | `CONFIRMED` — Chuẩn thay thế chính xác | Quy chuẩn 10 trường dữ liệu nhật ký canh tác và QR Code truy xuất nguồn gốc GS1 |
| 6 | **Luật Đất đai 2024** | Hiệu lực **01/08/2024** | Góp vốn bằng quyền sử dụng đất (QSDĐ) vào HTX, đăng ký biến động đất đai | `CONFIRMED` | Form Request và Modal góp vốn đất lưu trữ giấy chứng nhận QSDĐ, số thửa, diện tích |
| 7 | **Thông tư 24/2017/TT-BTC** | Hiệu lực **01/01/2018** | Chế độ kế toán HTX: Sổ quỹ tiền mặt, phân kỳ 5 kỳ tuổi nợ | `CONFIRMED` | Giao diện Báo cáo tuổi nợ 5 kỳ (`DebtAgingSummaryCard`) và xuất sổ quỹ Excel/PDF |

---

## 6. CÁC THAM SỐ NGHIỆP VỤ ĐÃ ĐƯỢC CHỦ DỰ ÁN PHÊ DUYỆT VÀ TRIỂN KHAI (DECIDED & IMPLEMENTED)

Tất cả 4 vấn đề tham số nghiệp vụ trước đây đã được Chủ dự án chính thức phê chuẩn phương án và triển khai vào mã nguồn:

1. **Trọng số phân chia thặng dư nội bộ (Luật HTX 2023 Điều 85):**
   - **Tình trạng:** `APPROVED_AND_IMPLEMENTED`
   - **Quy tắc triển khai:** Hỗ trợ cấu hình linh hoạt qua giao diện với các preset:
     - Mặc định HTX Tân Tiến: 70% Dịch vụ / 30% Vốn.
     - Khi Đại hội thành viên biểu quyết hàng năm: Cho phép 50% Dịch vụ / 50% Vốn.
     - Chuẩn tối thiểu Luật HTX: 51% Dịch vụ / 49% Vốn (Backend chặn nếu `service_usage_weight < 50%`).

2. **Túc số Hội đồng thẩm định OCOP (Quorum Requirement):**
   - **Tình trạng:** `APPROVED_AND_IMPLEMENTED`
   - **Quy tắc triển khai:** Yêu cầu tối thiểu 3 thành viên Hội đồng (`count >= 3`) tham gia nộp phiếu chấm điểm hợp lệ trước khi cho phép tổng hợp kết quả / chốt điểm. Nếu ít hơn 3 thành viên, backend ném `DomainException` (`ERR_COUNCIL_QUORUM_NOT_MET`), frontend hiển thị cảnh báo vi phạm túc số và vô hiệu hóa nút tổng hợp.

3. **Công thức tính hạn mức tín dụng cấp phát vật tư trả chậm (`credit_limit`):**
   - **Tình trạng:** `APPROVED_AND_IMPLEMENTED`
   - **Quy tắc triển khai:** Tự động tính hạn mức gợi ý theo công thức quy chế HTX:
     $$\text{suggested\_credit\_limit} = \text{total\_active\_area\_ha} \times 15.000.000\text{ VNĐ}$$
     Đồng thời cho phép Ban Giám đốc ghi đè thủ công (manual override) trong hồ sơ/form chỉnh sửa xã viên.

4. **Ngưỡng biểu quyết thông qua Nghị quyết Đại hội thành viên (Luật HTX 2023 Điều 72):**
   - **Tình trạng:** `APPROVED_AND_IMPLEMENTED`
   - **Quy tắc triển khai:**
     - Nghị quyết thông thường (`REGULAR`): Ngưỡng thông qua $\ge 50\%$ tổng số phiếu/trọng số biểu quyết.
     - Nghị quyết trọng yếu (`CRITICAL`: sửa đổi Điều lệ, tổ chức lại, sáp nhập, chia tách, giải thể): Ngưỡng thông qua $\ge 75\%$ theo Khoản 2 Điều 72 Luật HTX 2023. Giao diện và API hiển thị badge phân loại và ngưỡng mục tiêu tương ứng.

5. **Quy tắc quản lý phạm vi chức năng OCOP & Ẩn 3 module ngoài phạm vi (Scope Boundary Guardrail):**
   - **Tình trạng:** `APPROVED_AND_IMPLEMENTED`
   - **Căn cứ pháp lý & Ranh giới chủ thể:**
     - *Đại hội & Biểu quyết* (`/meetings`): Quản trị nội bộ chuyên sâu của HTX, nằm ngoài chuỗi tạo lập hồ sơ minh chứng OCOP.
     - *Hội đồng thẩm định* (`/ocop/evaluation`): Thuộc thẩm quyền cơ quan Nhà nước (UBND cấp huyện/tỉnh theo QĐ 148/QĐ-TTg & QĐ 1489/QĐ-TTg). HTX chỉ là Chủ thể nộp hồ sơ và thực hiện "Tự đánh giá nội bộ".
     - *Quyết định & Cấp sao* (`/ocop/decisions`): Thẩm quyền ban hành Quyết định công nhận và cấp Giấy chứng nhận thuộc Chủ tịch UBND cấp huyện/tỉnh, HTX tuyệt đối không có thẩm quyền này.
   - **Quy tắc bắt buộc cho AI Agent ở mọi phiên làm việc mới:**
     - Mặc định: ẨN 3 mục này khỏi thanh điều hướng Sidebar (`hidden: !isOutOfScopeModulesEnabled()`) để giao diện tập trung 100% vào mục tiêu đề tài OCOP.
     - AI Agent ở bất kỳ phiên chat mới nào **tuyệt đối KHÔNG tự ý hiển thị lại** 3 mục này khi không có yêu cầu rõ ràng từ người dùng.
     - **Cơ chế hiển thị lại (Re-enable):** Nếu người dùng yêu cầu hiển thị lại, chỉ cần đổi hàm `isOutOfScopeModulesEnabled()` trả về `true` trong `frontend/src/router/navigation.ts` hoặc hướng dẫn người dùng chạy `localStorage.setItem('htx_ocop_enable_out_of_scope_modules', 'true')` trong Browser Console.

---

## 7. QUY TRÌNH BẮT BUỘC CHO AGENT KHI THỰC HIỆN TÁC VỤ (OPERATIONAL WORKFLOW)

Mỗi khi nhận nhiệm vụ, AI Agent bắt buộc tuân thủ 7 bước:
- **Bước 1 — Khảo sát Repo:** Chạy `git status`, đọc các tệp liên quan, kiểm tra API route, migration, schema hiện có trước khi sửa bất kỳ file nào.
- **Bước 2 — Bảo vệ thay đổi người dùng:** Không được ghi đè, xóa hoặc revert thay đổi của người dùng.
- **Bước 3 — Lập kế hoạch phẫu thuật:** Thay đổi nhỏ nhất có thể, thu hẹp bán kính tác động, không refactor lan man.
- **Bước 4 — Triển khai mã nguồn:** Tuân thủ Modular Monolith 4 lớp, form request, API resource, cấm silent mocking.
- **Bước 5 — Kiểm thử thực tế:** Chạy test thực tế trên terminal, kiểm tra DB state sau thao tác, không tin vào mã HTTP 200 đơn thuần.
- **Bước 6 — Kiểm chứng Tenant Isolation:** Đảm bảo mọi truy vấn, job nền, báo cáo đều ràng buộc theo `cooperative_id`.
- **Bước 7 — Báo cáo & Cập nhật Tài liệu:** Báo cáo trung thực tệp thay đổi, test đã chạy và các điểm chưa giải quyết.

