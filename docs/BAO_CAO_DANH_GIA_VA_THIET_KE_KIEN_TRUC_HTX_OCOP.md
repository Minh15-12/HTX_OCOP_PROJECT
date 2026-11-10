# BÁO CÁO ĐÁNH GIÁ TOÀN DIỆN & BẢN THIẾT KẾ KIẾN TRÚC HỆ THỐNG HTX-OCOP
## HỆ THỐNG QUẢN TRỊ HỢP TÁC XÃ NÔNG NGHIỆP & SỐ HÓA HỒ SƠ ĐÁNH GIÁ, PHÂN HẠNG OCOP
### DỰ ÁN HỢP TÁC XÃ NÔNG NGHIỆP TÂN TIẾN — SẢN PHẨM ỚT CHUÔNG SWEET PALERMO ĐỎ ĐÀ LẠT

---

> **Mã tài liệu:** `DOC-ARCH-BLUEPRINT-2026-FINAL`  
> **Cơ quan chủ quản & Triển khai thực nghiệm:** Hợp tác xã Nông nghiệp Tân Tiến (Thôn Hòn Bồ, Xã Đạ Sar, Huyện Lạc Dương, Tỉnh Lâm Đồng)  
> **Phiên bản:** 3.0 — Comprehensive Evaluation & Architectural Master Blueprint  
> **Thời điểm công bố:** 2026-10-31T15:30:00Z  
> **Nhóm thực hiện:** Tổ Đặc nhiệm Đánh giá Kiến trúc Hệ thống (Teamwork Architecture Taskforce: `explorer_backend_3`, `explorer_frontend_3`, `explorer_features_3`, `worker_blueprint_3`)  
> **Văn bản pháp lý & Kỹ thuật đối chiếu:**  
> - **Luật Hợp tác xã số 17/2023/QH15** (Có hiệu lực thi hành từ ngày 01/07/2024).  
> - **Quyết định số 148/QĐ-TTg** (24/02/2023) và văn bản sửa đổi, bổ sung **Quyết định số 1489/QĐ-TTg** (06/07/2025) của Thủ tướng Chính phủ về Bộ tiêu chí và quy trình đánh giá, phân hạng sản phẩm OCOP.  
> - **TCVN 12850:2019** (Truy xuất nguồn gốc — Yêu cầu chung đối với hệ thống truy xuất nguồn gốc).  
> - **VietGAP TCVN 11892-1:2017** & **Thông tư 17/2021/TT-BNNPTNT** về an toàn thực phẩm và nhật ký canh tác.  
> - **Nghị định số 30/2020/NĐ-CP** của Chính phủ về công tác văn thư và quy chuẩn thể thức văn bản hành chính.  
> - **Thông tư số 24/2017/TT-BTC** của Bộ Tài chính hướng dẫn Chế độ kế toán Hợp tác xã, liên hiệp hợp tác xã.

---

## MỤC LỤC TỔNG QUAN

1. **PHẦN 1: TỔNG QUAN ĐỀ TÀI & TẦM NHÌN KIẾN TRÚC TOÀN DIỆN**
   - 1.1. Bối cảnh Đề tài, Mục tiêu Sứ mệnh & Mô hình Thực tế HTX Tân Tiến
   - 1.2. Kiến trúc Tổng thể Đa tầng (3-Tier & 4-Layer Modular Monolith DDD)
   - 1.3. Căn cứ Pháp lý, Tiêu chuẩn Kỹ thuật Quốc gia & Phân định Quy chế Nội bộ
   - 1.4. Tóm tắt Kết quả Khảo sát Thực chứng Độc lập (Executive Summary)

2. **PHẦN 2: MA TRẬN NGHIỆP VỤ & CƠ SỞ DỮ LIỆU CHI TIẾT CHO 9 MODULES DDD (R1)**
   - 2.1. Phân tích Chuyên sâu 9 Modules Nghiệp vụ Cốt lõi
   - 2.2. Bảng Ánh xạ Toàn diện 65 Bảng Cơ sở Dữ liệu PostgreSQL
   - 2.3. Cơ chế Cô lập Đa người thuê 3 Tầng (Tenant Isolation Architecture)
   - 2.4. Chuỗi Kiểm toán Bất biến SHA-256 (Audit Hash Chaining SHA-256)
   - 2.5. Kiểm soát Tương tranh & An toàn Giao dịch Tài chính (Concurrency & FSM)

3. **PHẦN 3: CHUẨN HÓA KIẾN TRÚC GIAO DIỆN, LUỒNG ĐIỀU HƯỚNG & CHỐNG RỐI LOẠN DỮ LIỆU (R2)**
   - 3.1. Quy chuẩn Bố cục Giao diện qua 28 Màn hình (Table vs Drawer vs Modal)
   - 3.2. Vòng đời Tabs & Cơ chế Khóa Chốt sổ (Tab Lifecycle & Read-Only Locking)
   - 3.3. Định lượng Chỉ số & Trực quan hóa (KPI Cards & Charts Audit)
   - 3.4. Xử lý Trạng thái Trung thực (Truthful States: Skeleton, Empty, Error, Success)
   - 3.5. Bảng Rà soát Triệt để 21 Điểm Vi phạm "Silent Mocking" & Hardcoded Tenant
   - 3.6. Cơ chế Kiểm soát Gửi trùng (Idempotency) & Khuyết thiếu Debounce

4. **PHẦN 4: KIỂM CHỨNG THỰC TẾ TRUY XUẤT NGUỒN GỐC GS1 & KẾT XUẤT BÁO CÁO (R3)**
   - 4.1. Kiểm toán Chuỗi Truy xuất GS1 & Cổng Tra cứu QR Công khai (TCVN 12850:2019)
   - 4.2. In Tem Nhãn Thùng Hàng GS1 Kích thước Vật lý 100mm × 75mm
   - 4.3. Kiểm toán Kết xuất Báo cáo Excel (.xlsx) Phía Server (OpenXML) & Client (SheetJS)
   - 4.4. Kiểm toán In ấn & Xuất Chứng từ PDF Chuẩn Thể thức Nghị định 30/2020/NĐ-CP

5. **PHẦN 5: PHÂN TÍCH KHOẢNG CÁCH HIỆN TRẠNG (GAP ANALYSIS) & ĐÁNH GIÁ VIỄN THÁM VỆ TINH (R4)**
   - 5.1. Phân tích Đối chiếu 3 Tầng: Tài liệu vs Backend vs Frontend
   - 5.2. Danh mục Tính năng Ma (Phantom Features) & API Chưa Có Giao diện
   - 5.3. Đánh giá Tính Khả Thi & Nhu cầu Ứng dụng Vệ tinh Viễn thám Nông nghiệp
   - 5.4. Kiến trúc Kỹ thuật Đề xuất cho Module Viễn thám (Background Batch Job)
   - 5.5. Dự toán Chi phí Vận hành & Lộ trình Tích hợp 2 Giai đoạn

6. **PHẦN 6: LỘ TRÌNH ĐỒNG BỘ BACKEND, HỢP ĐỒNG DỮ LIỆU & MA TRẬN KIỂM THỬ (R5)**
   - 6.1. Danh mục Nhiệm vụ Kỹ thuật Cần Thực thi (Task Backlog: P0, P1, P2)
   - 6.2. Kế hoạch Khắc phục 4 Ca Kiểm thử PHPUnit Thất bại (Quorum $\ge 3$)
   - 6.3. Ma trận Kiểm thử Toàn diện Tự động (PHPUnit & Playwright E2E Edge Cases)

7. **PHẦN 7: PHƯƠNG PHÁP XÁC MINH ĐỘC LẬP & KẾT LUẬN NGHIỆM THU**
   - 7.1. Quy trình Thực thi Kiểm chứng Độc lập Từng Phân hệ
   - 7.2. Cam kết Liêm chính Kỹ thuật & Tuyên bố Bàn giao

---

# PHẦN 1: TỔNG QUAN ĐỀ TÀI & TẦM NHÌN KIẾN TRÚC TOÀN DIỆN

## 1.1. Bối cảnh Đề tài, Mục tiêu Sứ mệnh & Mô hình Thực tế HTX Tân Tiến

Trong bối cảnh nền nông nghiệp Việt Nam đang chuyển dịch mạnh mẽ từ sản xuất truyền thống manh mún sang liên kết kinh tế tập thể theo chuỗi giá trị, **Luật Hợp tác xã số 17/2023/QH15** (chính thức có hiệu lực từ ngày 01/07/2024) và **Chương trình Mỗi xã một sản phẩm (OCOP)** theo **Quyết định số 148/QĐ-TTg** (được sửa đổi, bổ sung bởi **Quyết định số 1489/QĐ-TTg ngày 06/07/2025**) đã trở thành hai bệ đỡ pháp lý trọng yếu nhằm nâng cao năng lực cạnh tranh của nông sản nội địa.

Tuy nhiên, các Hợp tác xã nông nghiệp hiện nay đang đối mặt với những rào cản chuyển đổi số nghiêm trọng:
1. **Thiếu minh bạch trong quản trị nội bộ:** Quản lý thành viên, vốn góp, biểu quyết đại hội và phân chia thặng dư cuối năm còn thực hiện thủ công trên sổ sách giấy tờ, dễ phát sinh tranh chấp và không đáp ứng các chế tài của Luật HTX mới.
2. **Đứt gãy chuỗi thông tin canh tác & an toàn thực phẩm:** Việc ghi chép nhật ký canh tác VietGAP thiếu đồng bộ, không kiểm soát được thời gian cách ly an toàn thuốc bảo vệ thực vật (PHI - Pre-Harvest Interval), dẫn đến nguy cơ tồn dư hóa chất khi thu hoạch.
3. **Quy trình chuẩn bị hồ sơ OCOP cồng kềnh, phân tán:** Nông dân và cán bộ HTX lúng túng khi tự chấm điểm theo thang 100 điểm của QĐ 148/QĐ-TTg, việc lưu trữ và liên kết minh chứng chứng nhận (VietGAP, kiểm nghiệm mẫu đất/nước, phân tích lab) phân tán, thiếu bảo chứng toàn vẹn.
4. **Truy xuất nguồn gốc hình thức:** Mã QR trên bao bì thường chỉ dẫn về trang web giới thiệu chung chung của HTX thay vì truy vết chính xác lô nông sản thực địa với đầy đủ hành trình 5 bước canh tác và kết quả kiểm nghiệm KCS.

**Dự án Hệ thống Quản trị HTX Nông nghiệp & Số hóa Hồ sơ OCOP (HTX-OCOP)** được xây dựng như một nền tảng chuyển đổi số toàn diện, lấy thực nghiệm thực tế tại **Hợp tác xã Nông nghiệp Tân Tiến** (Thôn Hòn Bồ, Xã Đạ Sar, Huyện Lạc Dương, Tỉnh Lâm Đồng) với dòng sản phẩm chủ lực: **Ớt chuông Sweet Palermo Đỏ Đà Lạt** (giống Rijk Zwaan Hà Lan, canh tác chuẩn VietGAP trên nền đất bazan, diện tích vùng trồng PUC 240 ha).

---

## 1.2. Kiến trúc Tổng thể Đa tầng (3-Tier & 4-Layer Modular Monolith DDD)

Hệ thống được thiết kế theo mô hình **Modular Monolith** kết hợp nguyên lý **Domain-Driven Design (DDD)** và kiến trúc **Clean Architecture 4 lớp**, mang lại tính đóng gói cao, dễ bảo trì, dễ kiểm thử và sẵn sàng tách thành các Microservices độc lập trong tương lai:

```
┌─────────────────────────────────────────────────────────────────────────────────┐
│                           PRESENTATION LAYER (TẦNG HIỂN THỊ)                    │
│  - React 18 + TypeScript + Vite + Tailwind CSS + Lucide Icons + TanStack Query  │
│  - 28 Màn hình nghiệp vụ: Table phân trang, 14 Drawers xem nhanh, Modals chuẩn   │
│  - Cổng Tra cứu QR Công khai (/public/trace/:lotId) không yêu cầu đăng nhập      │
│  - API Controllers (Laravel 11), Form Requests Validation, API Resources DTO    │
└────────────────────────────────────────┬────────────────────────────────────────┘
                                         │ HTTP RESTful / JSON / Idempotency-Key
┌────────────────────────────────────────▼────────────────────────────────────────┐
│                          APPLICATION LAYER (TẦNG ỨNG DỤNG)                      │
│  - Use Cases & Application Services (23 Services chuyên trách điều phối logic)  │
│  - Singleton TenantContext (Bảo toàn ngữ cảnh HTX xuyên suốt chu kỳ Request)    │
│  - Event Listeners, Laravel Queue Background Jobs, Scheduled Batch Commands     │
│  - OpenXmlSpreadsheetService (Đóng gói .xlsx thuần PHP), OcopDocumentService    │
└────────────────────────────────────────┬────────────────────────────────────────┘
                                         │ Dependency Inversion
┌────────────────────────────────────────▼────────────────────────────────────────┐
│                            DOMAIN LAYER (TẦNG NGHIỆP VỤ)                        │
│  - 9 Bounded Contexts DDD (Identity, Cooperative, Agriculture, Inventory, ...)   │
│  - Domain Entities, Value Objects, Domain Enums, FSM State Machines             │
│  - Nghiệp vụ cốt lõi: PHI Guard, Thuật toán KCS 3 cấp, Cấn trừ Nợ mùa vụ,       │
│    Công thức Phân chia Thặng dư Luật HTX 2023, Túc số Hội đồng OCOP Quorum >= 3  │
└────────────────────────────────────────┬────────────────────────────────────────┘
                                         │
┌────────────────────────────────────────▼────────────────────────────────────────┐
│                        INFRASTRUCTURE LAYER (TẦNG HẠ TẦNG)                      │
│  - PostgreSQL 16 + Pgcrypto Extension (65 Bảng CSDL quan hệ, Khóa chính UUID)   │
│  - Eloquent ORM Models & Repository Implementations                            │
│  - Chuỗi Băm Kiểm Toán Bất Biến SHA-256 (Audit Trail Chaining: prev_hash)      │
│  - Local / Object Storage (MinIO S3 Compatible) lưu trữ minh chứng số hóa       │
└─────────────────────────────────────────────────────────────────────────────────┘
```

---

## 1.3. Căn cứ Pháp lý, Tiêu chuẩn Kỹ thuật Quốc gia & Phân định Quy chế Nội bộ

Để đảm bảo tính nghiêm cẩn của một giải pháp phần mềm cấp doanh nghiệp nông nghiệp, mọi quy tắc trong hệ thống được đối chiếu chuẩn xác theo **Sổ đăng ký Quy tắc Dự án (`docs/00_RULES_REGISTER.md`)**:

### A. Văn bản Quy phạm Pháp luật Bắt buộc Tuân thủ:
1. **Luật Hợp tác xã số 17/2023/QH15:**
   - *Điều 74:* Giới hạn tỷ lệ vốn góp của một thành viên chính thức không vượt quá $30\%$ vốn điều lệ; tổng vốn góp của các thành viên liên kết góp vốn không vượt quá $30\%$ vốn điều lệ. Thời hạn nộp đủ vốn góp cam kết tối đa 06 tháng kể từ ngày gia nhập.
   - *Điều 21 & 72:* Nguyên tắc biểu quyết tại Đại hội thành viên: **Bình đẳng, 1 thành viên = 1 phiếu biểu quyết**, không phụ thuộc vào tỷ lệ vốn góp.
   - *Điều 83 & 84:* Trích lập Quỹ chung không chia tối thiểu $5\%$ từ thu nhập giao dịch bên ngoài HTX (Điều lệ HTX Tân Tiến nâng lên $20\%$). Thặng dư phân phối tối đa $\le 95\%$.
   - *Điều 85:* Tỷ trọng phân phối thặng dư theo mức độ sử dụng sản phẩm, dịch vụ của thành viên không được thấp hơn $50\%$ (Điều lệ HTX Tân Tiến ấn định $70\%$).
2. **Quyết định 148/QĐ-TTg & Quyết định 1489/QĐ-TTg (Sửa đổi, bổ sung 06/07/2025):**
   - Khung tiêu chí đánh giá phân hạng OCOP gồm 3 phần với tổng điểm 100: Phần A (Các tiêu chí về sản phẩm và sức mạnh cộng đồng: 40 điểm), Phần B (Các tiêu chí về khả năng tiếp thị: 25 điểm), Phần C (Các tiêu chí về chất lượng sản phẩm: 35 điểm).
   - Phân hạng sao: 1 sao ($< 30$ điểm), 2 sao ($30 - 49$ điểm), 3 sao ($50 - 69$ điểm), 4 sao ($70 - 89$ điểm), 5 sao ($90 - 100$ điểm).
   - Thời hạn hiệu lực của Giấy chứng nhận sản phẩm OCOP đạt từ 3 đến 5 sao là **36 tháng** kể từ ngày ban hành quyết định công nhận.
   - Túc số Hội đồng thẩm định (Council Quorum): Phiên họp đánh giá của Hội đồng OCOP cấp huyện/tỉnh bắt buộc phải có tối thiểu **03 thành viên chuyên môn** tham gia chấm điểm trước khi tiến hành tổng hợp kết quả.
3. **Tiêu chuẩn Kỹ thuật Quốc gia:**
   - **TCVN 12850:2019:** Nguyên tắc truy xuất nguồn gốc nông sản thực phẩm, yêu cầu ghi nhận liên tục chuỗi mắt xích từ trang trại, phân lô, canh tác, thu hoạch đến xuất xưởng.
   - **VietGAP TCVN 11892-1:2017 & Thông tư 17/2021/TT-BNNPTNT:** Kiểm soát an toàn thực phẩm, thời gian cách ly thuốc bảo vệ thực vật (PHI) và nhật ký canh tác điện tử đầy đủ 10 trường quy chuẩn *(Lưu ý: Tuyệt đối không viện dẫn Thông tư 02/2024/TT-BNNPTNT vốn quy định về phòng chống tham nhũng ngành nông nghiệp)*.
   - **Nghị định 30/2020/NĐ-CP:** Thể thức văn bản hành chính, bố cục Quốc hiệu Tiêu ngữ, lề trang in A4 ($20\text{mm}$ lề trái để đóng gáy hồ sơ), font Times New Roman và chuẩn hóa chuỗi ký tự Unicode NFC.

### B. Phân định Rạch ròi với Quy chế / Chính sách Nội bộ HTX:
Tuyệt đối không gán nhãn "theo luật định" cho các quy định thuộc thẩm quyền thỏa thuận nội bộ của HTX:
- Mức phí dịch vụ thu mua $2.0\% - 2.5\%$ là quy định trong Hợp đồng dịch vụ bao tiêu của HTX Tân Tiến.
- Trần tín dụng tạm ứng vật tư đầu vụ (`credit_limit`) là chính sách hỗ trợ sản xuất nội bộ.
- Quy chuẩn cảm quan Grade A ớt chuông Palermo (Độ Brix $\ge 7.0^\circ$, độ đồng đều $\ge 90\%$) là tiêu chuẩn thương phẩm xuất khẩu của HTX, không phải luật Nhà nước.

---

## 1.4. Tóm tắt Kết quả Khảo sát Thực chứng Độc lập (Executive Summary)

Dựa trên dữ liệu kiểm toán độc lập của 3 Explorer Agents:
1. **Kiến trúc Backend Laravel 11 (`explorer_backend_3`):** Đạt chuẩn thiết kế xuất sắc với 65 bảng CSDL PostgreSQL, 10 package modules DDD, cô lập đa người thuê 3 tầng (`EnforceTenantScope`, `TenantContext`, Query Scope) và chuỗi băm kiểm toán SHA-256 liền mạch. Test suite đạt **195/199 tests pass (97.99%)**. 4 test case OCOP bị fail do Domain Service thực thi đúng quy định pháp lý về Túc số Hội đồng (Quorum $\ge 3$) trong khi test fixture cũ chỉ khởi tạo 1–2 giám khảo.
2. **Kiến trúc Frontend React/TypeScript (`explorer_frontend_3`):** Giao diện gồm 28 màn hình được tổ chức rất bài bản, phân định rõ ràng giữa Table phân trang, 14 Drawer xem nhanh và Modals nhập liệu có xác thực; có cơ chế `Idempotency-Key` bảo vệ giao dịch. Tuy nhiên, tồn tại **21 điểm vi phạm "Silent Mocking" và hardcoded tenant** tại runtime (đặc biệt tại `ocopService.ts`, `memberService.ts`, `ProfitPage.tsx`), một số tính năng ma (dùng `alert()`), và khuyết thiếu hoàn toàn kỹ thuật Debounce trên các ô tìm kiếm.
3. **Tính năng Nghiệp vụ & GIS Viễn thám (`explorer_features_3`):** Cổng tra cứu QR GS1 công khai (`/api/v1/public/trace/{lotId}`) và tem nhãn nhiệt 100mm × 75mm hoàn chỉnh 100%, đáp ứng đầy đủ TCVN 12850:2019; hệ thống kết xuất báo cáo Excel OpenXML và PDF chuẩn NĐ 30/2020/NĐ-CP hoạt động tốt. Đề xuất lộ trình 2 giai đoạn tích hợp viễn thám vệ tinh Sentinel-2 NDVI và độ ẩm mặt đất qua cơ chế Background Batch Job với chi phí tối ưu (0–30 USD/tháng).

---

# PHẦN 2: MA TRẬN NGHIỆP VỤ & CƠ SỞ DỮ LIỆU CHI TIẾT CHO 9 MODULES DDD (R1)

## 2.1. Phân tích Chuyên sâu 9 Modules Nghiệp vụ Cốt lõi

```
┌────────────────────────────────────────────────────────────────────────────────────────┐
│                              9 MODULES BOUNDED CONTEXTS                                │
├────────────────────────┬───────────────────────────────┬───────────────────────────────┤
│ 1. Identity & Access   │ 2. Cooperative & Governance   │ 3. Member & Equity            │
│    Management          │    (ĐHTV & Biểu quyết)        │    Management (Vốn & Đất)     │
├────────────────────────┼───────────────────────────────┼───────────────────────────────┤
│ 4. Agriculture &       │ 5. Farming Log & PHI Safety   │ 6. Harvest, KCS & GS1 Lots    │
│    Production (PUC)    │    (VietGAP TCVN 11892)       │    (TCVN 12850:2019)          │
├────────────────────────┼───────────────────────────────┼───────────────────────────────┤
│ 7. Inventory & FEFO    │ 8. Finance & Surplus          │ 9. OCOP Dossier & Evaluation  │
│    Batches (3 Kho)     │    Distribution (Luật HTX 23) │    (QĐ 148 & QĐ 1489)         │
└────────────────────────┴───────────────────────────────┴───────────────────────────────┘
```

### Module 1: Identity & Access Management (Định danh & Kiểm soát Phân quyền)
- **Mục tiêu:** Quản trị vòng đời tài khoản, xác thực bảo mật đa yếu tố, phân quyền RBAC và thực thi nguyên tắc Phân tách Trách nhiệm (Separation of Duties - SoD).
- **7 Vai trò Chuẩn trong Hệ thống:**
  1. `HTX_OWNER` (Chủ tịch HĐQT / Giám đốc HTX): Phê duyệt kế hoạch sản xuất, duyệt phương án phân phối thặng dư, ký số nộp hồ sơ OCOP, phê duyệt xuất nhập kho đặc biệt.
  2. `ACCOUNTANT` (Kế toán trưởng / Kế toán viên): Lập và hạch toán phiếu thu/chi sổ quỹ, theo dõi công nợ 5 dải tuổi, lập phương án phân phối thặng dư, đối soát quyết toán mùa vụ. Không thể tự duyệt chi cho chính mình.
  3. `STOREKEEPER` (Thủ kho): Lập phiếu nhập kho vật tư, xuất kho vật tư theo lô hạn dùng FEFO, kiểm kê kho định kỳ, quản lý kho lạnh nông sản và kho bao bì. Không có quyền can thiệp vào sổ quỹ tiền mặt.
  4. `INSPECTOR` (Cán bộ Kiểm soát / Thanh tra HTX): Giám sát tuân thủ quy chế HTX, kiểm tra đột xuất nhật ký canh tác VietGAP, thẩm định điều kiện vệ sinh kho bãi, kiểm toán chuỗi băm SHA-256.
  5. `EVALUATOR` (Thành viên Hội đồng Thẩm định OCOP): Giám khảo chuyên môn cấp huyện/tỉnh tham gia các phiên đánh giá, chấm điểm độc lập từng chỉ tiêu OCOP.
  6. `OCOP_PREPARER` (Cán bộ Chuyên trách Hồ sơ OCOP): Xây dựng hồ sơ sản phẩm, thu thập và số hóa minh chứng, thực hiện tự chấm điểm thử nghiệm.
  7. `SYSTEM_ADMIN` (Quản trị viên Hệ thống): Quản lý người dùng, cấu hình tham số hạ tầng, sao lưu dữ liệu. Không có quyền duyệt các quyết định tài chính hoặc chấm điểm OCOP.

### Module 2: Cooperative & Governance (Quản trị HTX & Biểu quyết)
- **Mục tiêu:** Quản trị hồ sơ pháp nhân HTX, lịch sử đại hội thành viên, nghị quyết và cơ chế biểu quyết bình đẳng theo Luật HTX 2023.
- **Nghiệp vụ cốt lõi:**
  - Tổ chức Đại hội Thành viên thường niên / bất thường: Quản lý danh sách đại biểu triệu tập, túc số tham dự ($\ge 50\%$ tổng số thành viên).
  - Biểu quyết Nghị quyết: Áp dụng cơ chế **1 thành viên = 1 phiếu biểu quyết** (`votes.member_id` unique trên mỗi `meeting_id`). Kết quả kiểm phiếu tự động phân loại theo tỷ lệ biểu quyết tán thành ($\ge 50\%$ với nghị quyết thông thường, $\ge 75\%$ với nghị quyết trọng yếu như sửa đổi Điều lệ, tổ chức lại, sáp nhập hoặc giải thể HTX theo Khoản 2 Điều 72 Luật HTX 2023, đồng bộ với `MeetingService.php:231`).

### Module 3: Member & Equity Management (Quản lý Xã viên & Vốn góp)
- **Mục tiêu:** Quản lý vòng đời xã viên, sổ theo dõi vốn điều lệ, giấy chứng nhận vốn góp và vốn quyền sử dụng đất.
- **Phân loại thành viên:** Thành viên chính thức (tham gia lao động hoặc sử dụng dịch vụ HTX), Thành viên liên kết góp vốn (chỉ góp vốn đầu tư), Thành viên liên kết không góp vốn.
- **Vòng đời Trạng thái FSM (Finite State Machine):**
  $$\text{CHO\_DUYET} \longrightarrow \text{DANG\_HOAT\_DONG} \rightleftharpoons \text{TAM\_DINH\_CHI} \longrightarrow \text{CHO\_QUYET\_TOAN} \longrightarrow \text{DA\_CHAM\_DUT}$$
- **Nguyên tắc bảo toàn lịch sử:** Tuyệt đối không xóa cứng (Hard Delete) thành viên đã phát sinh giao dịch vốn, đất hoặc nhận khoán mùa vụ. Khi thành viên rời HTX, hệ thống thực thi Soft-delete và chuyển sang trạng thái `DA_CHAM_DUT` sau khi đã tất toán toàn bộ công nợ và hoàn trả vốn góp.

### Module 4: Agriculture & Production (Sản xuất & Vùng trồng PUC)
- **Mục tiêu:** Quản lý quy hoạch không gian nông nghiệp phân cấp từ HTX $\rightarrow$ Vùng trồng (Production Unit, Mã PUC) $\rightarrow$ Thửa đất (Farm Plot) $\rightarrow$ Mùa vụ (Crop Season).
- **Mã số Vùng trồng (PUC):** Đăng ký với Cục Bảo vệ Thực vật (ví dụ: `PUC-49-015-9923`), theo dõi tọa độ GPS trung tâm, diện tích canh tác tập trung $\ge 10\,\text{ha}$ (TCCS 774:2020/BVTV).
- **Phân lô Thửa đất:** Định danh chuẩn `PLOT-[CoopCode]-[MemberSeq]-[PlotSeq]`, lưu trữ diện tích ($m^2$), chất đất (bazan), nguồn nước và giao khoán cho từng hộ xã viên quản lý canh tác.

### Module 5: Farming Log & PHI Safety (Nhật ký Canh tác & An toàn PHI Guard)
- **Mục tiêu:** Số hóa việc ghi chép ngoài đồng ruộng theo chuẩn VietGAP TCVN 11892-1:2017, tự động kiểm soát thời gian cách ly thuốc BVTV (PHI).
- **10 Trường Dữ liệu Quy chuẩn Nhật ký:**
  1. Hoạt động canh tác (`activity_type`: Làm đất, Gieo trồng, Bón phân, Phun thuốc, Chăm sóc, Thu hoạch).
  2. Thời gian thực hiện (`activity_date`).
  3. Thửa đất canh tác (`plot_id`, `plot_code`).
  4. Mùa vụ (`crop_season_id`).
  5. Người thực hiện (`performer_id`).
  6. Vật tư nông nghiệp sử dụng (`material_id`, mã SKU).
  7. Số lô vật tư xuất kho (`material_batch_id`, số đăng ký lưu hành).
  8. Liều lượng và nồng độ pha chế (`quantity_used`, đơn vị tính kg/lít/gói).
  9. Thời gian cách ly an toàn (`phi_days` ghi trên nhãn thuốc).
  10. Tọa độ GPS thực địa và ảnh chụp minh chứng hiện trường.
- **Cơ chế Bảo vệ PHI Guard:** Khi ghi nhận hoạt động phun thuốc BVTV, hệ thống tự động tính toán:
  $$\text{safe\_harvest\_date} = \text{spray\_date} + \text{phi\_days}$$
  Đồng thời tự động chuyển thửa đất sang trạng thái cách ly `IN_QUARANTINE`. Bất kỳ lệnh thu hoạch nào có ngày thu hoạch sớm hơn `safe_harvest_date` đều bị Backend **chặn đứng 100% với mã lỗi `ERR_HARVEST_PHI_VIOLATION`**.

### Module 6: Harvest, KCS & GS1 Lots (Thu hoạch, Kiểm định KCS & Lô GS1)
- **Mục tiêu:** Ghi nhận sản lượng thu hoạch, thực hiện quy trình kiểm tra chất lượng 3 cấp và cấp mã định danh truy xuất nguồn gốc GS1.
- **Quy trình KCS 3 Cấp Nghiêm ngặt:**
  1. *Cấp 1 — Gate Check:* Đối soát mã lệnh thu hoạch, kiểm tra trạng thái thửa đất đã hết thời gian cách ly PHI hay chưa.
  2. *Cấp 2 — Quick Lab:* Lấy mẫu ngẫu nhiên kiểm tra nhanh dư lượng hóa chất cấm/thuốc BVTV bằng bộ kit sinh hóa (`residue_ppm`). Nếu phát hiện dư lượng, lô hàng bị từ chối ngay lập tức (`LAB_REJECTED`).
  3. *Cấp 3 — Grading:* Phân hạng cảm quan và cơ lý nông sản:
     - **Grade A (Premium):** Độ ngọt Brix $\ge 7.0^\circ$, tỷ lệ đồng đều kích cỡ $\ge 90\%$, màu sắc đỏ chuẩn, không vết côn trùng chích.
     - **Grade B (Standard):** Độ Brix từ $6.0^\circ - 6.9^\circ$, độ đồng đều $\ge 80\%$, tiêu thụ tại các kênh chợ truyền thống hoặc chế biến sấy khô.
     - **Reject:** Không đạt tiêu chuẩn an toàn, tiến hành hủy bỏ hoặc làm phân bón hữu cơ.
- **Định danh Mã Lô GS1 Traceability:**
  $$\text{LOT-}[CoopCode]\text{-}[PlotCode]\text{-}[YYYYMMDD]\text{-}[Seq]$$
  *(Ví dụ: `LOT-TT-PLOT01-20261020-001`)*.

### Module 7: Inventory & FEFO Batches (Quản trị Kho & Lô Vật tư FEFO)
- **Mục tiêu:** Quản trị 3 hệ thống kho riêng biệt (Kho Vật tư Nông nghiệp, Kho Lạnh Nông sản 8–10°C, Kho Bao bì & Nhãn mác), xuất kho vật tư theo nguyên tắc FEFO.
- **Nguyên tắc Xuất kho FEFO (First Expired, First Out):**
  Thuật toán truy vấn tự động sắp xếp các lô vật tư có hạn sử dụng gần nhất lên trước:
  ```sql
  ORDER BY expired_at ASC NULLS LAST, created_at ASC
  ```
  Hệ thống phát cảnh báo khi lô vật tư cận hạn ($\le 30$ ngày) và **khóa hoàn toàn** chức năng xuất kho đối với lô vật tư đã hết hạn sử dụng.
- **Quản lý Trần nợ Vật tư Xã viên (Credit Advance):** Cho phép xã viên tạm ứng vật tư đầu vụ trong hạn mức tín dụng (`credit_limit`). Khi xuất kho nợ, hệ thống kiểm tra số dư công nợ lũy kế; nếu vượt trần tín dụng, giao dịch xuất nợ bị chặn, yêu cầu lãnh đạo HTX phê duyệt ngoại lệ.

### Module 8: Finance & Surplus Distribution (Tài chính, Công nợ & Phân chia Thặng dư)
- **Mục tiêu:** Quản lý sổ quỹ tiền mặt và tài khoản ngân hàng, phân tích công nợ 5 dải tuổi, tự động cấn trừ nợ nông sản sau thu hoạch, và phân phối thặng dư cuối năm theo đúng Luật HTX 2023.
- **Công thức Cấn trừ Quyết toán Mùa vụ (Harvest Debt Offset):**
  $$V_{\text{total}} = Q_{\text{GradeA}} \times P_A + Q_{\text{GradeB}} \times P_B$$
  $$\text{Fee} = V_{\text{total}} \times 2.5\% \quad (\text{Phí dịch vụ HTX})$$
  $$D = \min\left(D_{\text{debt}}, V_{\text{total}} - \text{Fee}\right) \quad (\text{Số nợ vật tư khấu trừ})$$
  $$P_{\text{net}} = V_{\text{total}} - \text{Fee} - D \quad (\text{Số tiền thực chi cho xã viên})$$
  Số nợ còn lại $D_{\text{remain}} = D_{\text{debt}} - D$ được kết chuyển kỳ sau; tự động sinh phiếu chi trong Sổ quỹ nếu $P_{\text{net}} > 0$.
- **Phân phối Thặng dư Cuối năm Chuẩn Luật HTX 2023 (Điều 84 & 85):**
  - Trích lập Quỹ chung không chia: $S_{\text{indivisible}} \ge S_{\text{total}} \times 5\%$ (HTX Tân Tiến trích $20\%$).
  - Trích lập Quỹ đầu tư phát triển ($10\%$) và Quỹ dự phòng tài chính ($5\%$).
  - Thặng dư còn lại để phân phối ($S_{\text{distrib}} \le 65\%$):
    - **Phân phối theo mức độ sử dụng dịch vụ:** Tối thiểu $\ge 50\%$ (Điều lệ HTX Tân Tiến ấn định $70\%$). Tính căn cứ theo tổng giá trị vật tư xã viên đã mua trong năm từ bảng `stock_issues`.
    - **Phân phối theo tỷ lệ vốn góp:** Phần còn lại ($30\%$). Tính căn cứ theo số vốn điều lệ thực góp từ bảng `capital_contributions`.

### Module 9: OCOP Dossier & Evaluation (Hồ sơ OCOP, Tự chấm điểm & Hội đồng Thẩm định)
- **Mục tiêu:** Số hóa toàn diện quy trình chuẩn bị hồ sơ OCOP theo Quyết định 148/QĐ-TTg và Quyết định 1489/QĐ-TTg, bộ tiêu chí 100 điểm, kho minh chứng số hóa SHA-256, tự chấm điểm thông minh và chấm điểm Hội đồng thẩm định.
- **Cấu trúc Cây Tiêu chí OCOP (Dòng sản phẩm Rau củ quả tươi - Ớt chuông Palermo):**
  - **Phần A (40 điểm) — Sản phẩm và sức mạnh cộng đồng:** Tổ chức sản xuất (nguyên liệu địa phương, liên kết chuỗi), phát triển sản phẩm, sức mạnh cộng đồng (lao động địa phương, bản sắc văn hóa).
  - **Phần B (25 điểm) — Khả năng tiếp thị:** Tiếp thị và quảng bá (website, thương mại điện tử, xúc tiến thương mại), câu chuyện sản phẩm OCOP.
  - **Phần C (35 điểm) — Chất lượng sản phẩm:** Chỉ tiêu cảm quan, dinh dưỡng, an toàn thực phẩm (VietGAP, kiểm nghiệm không dư lượng), sở hữu trí tuệ và bao bì ghi nhãn truy xuất nguồn gốc.
- **Túc số Hội đồng Thẩm định (Council Quorum):** Phiên họp tổng hợp kết quả của Hội đồng thẩm định cấp huyện/tỉnh bắt buộc phải có tối thiểu **03 thành viên chuyên môn** tham gia chấm điểm (`EVALUATOR_1`, `EVALUATOR_2`, `EVALUATOR_3`).

---

## 2.2. Bảng Ánh xạ Toàn diện 65 Bảng Cơ sở Dữ liệu PostgreSQL

Hệ thống quản lý tổng cộng **65 bảng CSDL vật lý** trong PostgreSQL 16 (tất cả khóa chính sử dụng kiểu dữ liệu `UUID PRIMARY KEY DEFAULT gen_random_uuid()`):

| STT | Tên Bảng (Table Name) | Module DDD | Khóa Chính (PK) | Khóa Ngoại (Foreign Keys) | Cơ chế Cô lập Đa người thuê (Tenant Isolation) | Ghi vết Kiểm toán SHA-256 (`audit_events`) |
| :---: | :--- | :--- | :---: | :--- | :--- | :--- |
| 1 | `cooperatives` | Cooperative | UUID | Không có | **Root Tenant Entity** (Bảng gốc định danh HTX) | `COOPERATIVE_UPDATED` |
| 2 | `roles` | Identity | UUID | Không có | Toàn cục hệ thống (Catalog 7 vai trò chuẩn) | `ROLE_UPDATED` |
| 3 | `permissions` | Identity | UUID | Không có | Toàn cục hệ thống (Catalog quyền hạn RBAC) | `PERMISSIONS_SYNCED` |
| 4 | `role_permissions` | Identity | Composite | `role_id` $\rightarrow$ `roles`, `permission_id` $\rightarrow$ `permissions` | Toàn cục hệ thống | `ROLE_PERMISSIONS_UPDATED` |
| 5 | `users` | Identity | UUID | `cooperative_id` $\rightarrow$ `cooperatives` | Khóa cứng theo `cooperative_id` tài khoản | `USER_CREATED`, `USER_UPDATED` |
| 6 | `user_roles` | Identity | Composite | `user_id` $\rightarrow$ `users`, `role_id` $\rightarrow$ `roles` | Gián tiếp qua `users.cooperative_id` | `USER_ROLES_ASSIGNED` |
| 7 | `data_scopes` | Identity | UUID | `user_id` $\rightarrow$ `users` | Gián tiếp qua `users.cooperative_id` | `DATA_SCOPE_ASSIGNED` |
| 8 | `role_assignments` | Identity | UUID | `user_id` $\rightarrow$ `users`, `role_id`, `cooperative_id` | Khóa trực tiếp `cooperative_id` | `ROLE_ASSIGNMENT_CREATED` |
| 9 | `idempotency_keys` | Identity/Infra | UUID | `user_id` $\rightarrow$ `users` | Bắt buộc `user_id`, `key`, `request_hash` | Cache tự động chống gửi lặp |
| 10 | `meetings` | Cooperative | UUID | `cooperative_id` $\rightarrow$ `cooperatives`, `creator_id` $\rightarrow$ `users` | Khóa trực tiếp `cooperative_id` | `MEETING_CREATED`, `UPDATED` |
| 11 | `votes` | Cooperative | UUID | `meeting_id` $\rightarrow$ `meetings`, `member_id` $\rightarrow$ `members` | Gián tiếp qua `meetings.cooperative_id` | `VOTE_CAST` |
| 12 | `members` | Cooperative | UUID | `cooperative_id` $\rightarrow$ `cooperatives`, `user_id` $\rightarrow$ `users` | Khóa trực tiếp `cooperative_id` | `MEMBER_CREATED`, `FSM_TRANSITION` |
| 13 | `capital_contributions` | Cooperative | UUID | `member_id` $\rightarrow$ `members`, `approver_id` $\rightarrow$ `users` | Gián tiếp qua `members.cooperative_id` | `CAPITAL_CONTRIBUTION_CREATED` |
| 14 | `land_contributions` | Cooperative | UUID | `member_id` $\rightarrow$ `members`, `cooperative_id` $\rightarrow$ `cooperatives` | Khóa trực tiếp `cooperative_id` | `LAND_CONTRIBUTION_CREATED` |
| 15 | `crops` | Agriculture | UUID | Không có | Toàn cục hệ thống (Danh mục giống cây trồng) | `CROP_CREATED` |
| 16 | `production_units` | Agriculture | UUID | `cooperative_id` $\rightarrow$ `cooperatives` | Khóa trực tiếp `cooperative_id` (Mã PUC) | `PRODUCTION_UNIT_CREATED` |
| 17 | `farm_plots` | Agriculture | UUID | `production_unit_id` $\rightarrow$ `production_units` | Gián tiếp qua `production_units.cooperative_id` | `FARM_PLOT_CREATED`, `UPDATED` |
| 18 | `member_plot_assignments` | Agriculture | UUID | `plot_id` $\rightarrow$ `farm_plots`, `member_id` $\rightarrow$ `members` | Gián tiếp qua `members` & `farm_plots` | `MEMBER_PLOT_ASSIGNED` |
| 19 | `crop_seasons` | Agriculture | UUID | `production_unit_id` $\rightarrow$ `production_units` | Gián tiếp qua `production_units.cooperative_id` | `CROP_SEASON_CREATED`, `CLOSED` |
| 20 | `farming_logs` | Agriculture | UUID | `crop_season_id`, `plot_id`, `performer_id` $\rightarrow$ `users` | Gián tiếp qua `crop_seasons` & `farm_plots` | `FARMING_LOG_CREATED`, `DELETED` |
| 21 | `materials` | Inventory | UUID | `cooperative_id` $\rightarrow$ `cooperatives` | Khóa trực tiếp `cooperative_id` | `MATERIAL_CREATED`, `UPDATED` |
| 22 | `material_batches` | Inventory | UUID | `material_id` $\rightarrow$ `materials`, `cooperative_id` $\rightarrow$ `cooperatives` | Khóa trực tiếp `cooperative_id` (Lô FEFO) | `MATERIAL_BATCH_CREATED` |
| 23 | `material_usages` | Agriculture | UUID | `farming_log_id` $\rightarrow$ `farming_logs`, `material_id` $\rightarrow$ `materials` | Gián tiếp qua `farming_logs` | `MATERIAL_USAGE_CREATED` |
| 24 | `phi_calculations` | Agriculture | UUID | `farming_log_id` $\rightarrow$ `farming_logs` | Gián tiếp qua `farming_logs` | `PHI_CALCULATED` |
| 25 | `products` | Product | UUID | `cooperative_id` $\rightarrow$ `cooperatives` | Khóa trực tiếp `cooperative_id` | `PRODUCT_CREATED`, `UPDATED` |
| 26 | `harvests` | Agriculture | UUID | `crop_season_id`, `plot_id`, `lot_id` $\rightarrow$ `lots` | Gián tiếp qua `crop_seasons.production_unit` | `HARVEST_CREATED`, `KCS_GRADED` |
| 27 | `lots` | Agriculture | UUID | `harvest_id` $\rightarrow$ `harvests` | Gián tiếp qua `harvests` $\rightarrow$ `production_units` | `LOT_CREATED` |
| 28 | `product_lots` | Product | Composite | `product_id` $\rightarrow$ `products`, `lot_id` $\rightarrow$ `lots` | Gián tiếp qua `products.cooperative_id` | `PRODUCT_LOT_ATTACHED` |
| 29 | `warehouses` | Inventory | UUID | `cooperative_id` $\rightarrow$ `cooperatives` | Khóa trực tiếp `cooperative_id` (3 loại kho) | `WAREHOUSE_CREATED` |
| 30 | `stock_receipts` | Inventory | UUID | `cooperative_id`, `warehouse_id` $\rightarrow$ `warehouses` | Khóa trực tiếp `cooperative_id` | `STOCK_RECEIPT_CREATED`, `APPROVED` |
| 31 | `stock_receipt_lines` | Inventory | UUID | `stock_receipt_id`, `material_id` $\rightarrow$ `materials` | Gián tiếp qua `stock_receipts` | Tích hợp trong Receipt Audit |
| 32 | `stock_issues` | Inventory | UUID | `cooperative_id`, `member_id` $\rightarrow$ `members` | Khóa trực tiếp `cooperative_id` | `STOCK_ISSUE_CREATED`, `APPROVED` |
| 33 | `stock_issue_lines` | Inventory | UUID | `stock_issue_id`, `material_id` $\rightarrow$ `materials` | Gián tiếp qua `stock_issues` | Tích hợp trong Issue Audit |
| 34 | `stock_counts` | Inventory | UUID | `cooperative_id`, `warehouse_id` $\rightarrow$ `warehouses` | Khóa trực tiếp `cooperative_id` | `STOCK_COUNT_CREATED`, `APPROVED` |
| 35 | `stock_count_lines` | Inventory | UUID | `stock_count_id`, `material_id` $\rightarrow$ `materials` | Gián tiếp qua `stock_counts` | Tích hợp trong Count Audit |
| 36 | `cash_transactions` | Finance | UUID | `cooperative_id`, `member_id` $\rightarrow$ `members` | Khóa trực tiếp `cooperative_id` (Sổ quỹ) | `CASH_TRANSACTION_CREATED`, `POSTED` |
| 37 | `receivable_payables` | Finance | UUID | `cooperative_id` $\rightarrow$ `cooperatives` | Khóa trực tiếp `cooperative_id` (Công nợ) | `RECEIVABLE_PAYABLE_CREATED` |
| 38 | `settlements` | Finance | UUID | `debt_id`, `cash_transaction_id` $\rightarrow$ `cash_transactions` | Gián tiếp qua `receivable_payables` | `DEBT_SETTLEMENT_CREATED` |
| 39 | `surplus_distribution_plans` | Finance | UUID | `cooperative_id` $\rightarrow$ `cooperatives` | Khóa trực tiếp `cooperative_id` | `SURPLUS_PLAN_CREATED`, `APPROVED` |
| 40 | `surplus_distribution_items` | Finance | UUID | `plan_id`, `member_id` $\rightarrow$ `members` | Gián tiếp qua `surplus_distribution_plans` | Tích hợp trong Plan Audit |
| 41 | `council_levels` | OCOP Criteria | UUID | Không có | Toàn cục hệ thống (Catalog cấp hội đồng) | `COUNCIL_LEVEL_CREATED` |
| 42 | `criteria_versions` | OCOP Criteria | UUID | Không có | Toàn cục hệ thống (Bộ tiêu chí QĐ 148 & 1489) | `CRITERIA_VERSION_PUBLISHED` |
| 43 | `criteria_groups` | OCOP Criteria | UUID | `criteria_version_id` $\rightarrow$ `criteria_versions` | Gián tiếp qua `criteria_versions` (Phần A/B/C) | `CRITERIA_GROUP_CREATED` |
| 44 | `criteria` | OCOP Criteria | UUID | `criteria_group_id` $\rightarrow$ `criteria_groups` | Gián tiếp qua `criteria_groups` | `CRITERION_CREATED` |
| 45 | `indicators` | OCOP Criteria | UUID | `criterion_id` $\rightarrow$ `criteria` | Gián tiếp qua `criteria` | `INDICATOR_CREATED`, `UPDATED` |
| 46 | `scoring_rules` | OCOP Criteria | UUID | `indicator_id` $\rightarrow$ `indicators` | Gián tiếp qua `indicators` | `SCORING_RULE_CREATED` |
| 47 | `mandatory_conditions` | OCOP Criteria | UUID | `criteria_version_id` $\rightarrow$ `criteria_versions` | Gián tiếp qua `criteria_versions` | `MANDATORY_CONDITION_CREATED` |
| 48 | `ocop_applications` | OCOP Dossier | UUID | `cooperative_id`, `product_id`, `criteria_version_id` | Khóa trực tiếp `cooperative_id` | `OCOP_APPLICATION_CREATED`, `SUBMIT` |
| 49 | `self_assessments` | OCOP Dossier | UUID | `application_id` $\rightarrow$ `ocop_applications`, `indicator_id` | Gián tiếp qua `ocop_applications` | `SELF_ASSESSMENT_SAVED` |
| 50 | `application_reviews` | OCOP Dossier | UUID | `application_id`, `reviewer_id` $\rightarrow$ `users` | Gián tiếp qua `ocop_applications` | `APPLICATION_REVIEWED` |
| 51 | `evaluation_sessions` | OCOP Evaluation | UUID | `application_id`, `council_level_id` $\rightarrow$ `council_levels` | Gián tiếp qua `ocop_applications` | `EVALUATION_SESSION_CREATED` |
| 52 | `evaluator_assignments` | OCOP Evaluation | UUID | `evaluation_session_id`, `evaluator_id` $\rightarrow$ `users` | Gián tiếp qua `evaluation_sessions` | `EVALUATOR_ASSIGNED` |
| 53 | `evaluator_scores` | OCOP Evaluation | UUID | `assignment_id`, `indicator_id` $\rightarrow$ `indicators` | Gián tiếp qua `evaluator_assignments` | `EVALUATOR_SCORE_RECORDED` |
| 54 | `consolidated_results` | OCOP Evaluation | UUID | `evaluation_session_id` $\rightarrow$ `evaluation_sessions` | Gián tiếp qua `evaluation_sessions` (Quorum $\ge 3$) | `COUNCIL_RESULTS_CONSOLIDATED` |
| 55 | `proposed_classifications` | OCOP Evaluation | UUID | `consolidated_result_id` $\rightarrow$ `consolidated_results` | Gián tiếp qua `consolidated_results` | `PROPOSED_CLASSIFICATION_CREATED` |
| 56 | `final_decisions` | OCOP Evaluation | UUID | `application_id`, `signer_id` $\rightarrow$ `users` | Gián tiếp qua `ocop_applications` | `FINAL_DECISION_APPROVED` |
| 57 | `evidences` | OCOP Evidence | UUID | `cooperative_id`, `application_id` $\rightarrow$ `ocop_applications` | Khóa trực tiếp `cooperative_id` | `EVIDENCE_UPLOADED`, `VERIFIED` |
| 58 | `evidence_versions` | OCOP Evidence | UUID | `evidence_id` $\rightarrow$ `evidences`, `uploaded_by` $\rightarrow$ `users` | Gián tiếp qua `evidences` (Mã SHA-256) | `EVIDENCE_VERSION_REPLACED` |
| 59 | `evidence_links` | OCOP Evidence | UUID | `evidence_id` $\rightarrow$ `evidences`, `indicator_id` $\rightarrow$ `indicators` | Gián tiếp qua `evidences` | `EVIDENCE_LINKED`, `UNLINKED` |
| 60 | `workflow_instances` | Workflow/Infra | UUID | Polymorphic (`entity_type`, `entity_id`) | Thuộc thực thể nghiệp vụ gắn kèm | Vết chuyển trạng thái FSM |
| 61 | `workflow_transitions` | Workflow/Infra | UUID | `instance_id` $\rightarrow$ `workflow_instances`, `actor_id` | Thuộc instance | Vết chuyển trạng thái FSM |
| 62 | `audit_events` | Audit/Infra | UUID | `actor_id` $\rightarrow$ `users`, `cooperative_id` $\rightarrow$ `cooperatives` | Khóa `cooperative_id`, ghi nhận IP & Request-ID | **Kho Lưu Trữ Băm SHA-256 Chained** |
| 63 | `report_requests` | Report/Infra | UUID | `cooperative_id`, `requested_by` $\rightarrow$ `users` | Khóa trực tiếp `cooperative_id` | `REPORT_REQUESTED` |
| 64 | `generated_documents` | Report/Infra | UUID | `cooperative_id`, `application_id` $\rightarrow$ `ocop_applications` | Khóa trực tiếp `cooperative_id` | `DOCUMENT_GENERATED` |
| 65 | `notifications` | Notification | UUID | Polymorphic `notifiable_type`, `notifiable_id` (UUID) | Khóa theo User nhận thông báo | `NOTIFICATION_SENT`, `READ` |

---

## 2.3. Cơ chế Cô lập Đa người thuê 3 Tầng (Tenant Isolation Architecture)

Tuân thủ **Nguyên tắc A: Cô lập Tenant Toàn diện**, hệ thống kiểm soát chặt chẽ `cooperative_id` xuyên suốt 3 tầng:

```
[HTTP Request với X-Cooperative-ID]
               │
               ▼
┌────────────────────────────────────────────────────────┐
│ TẦNG 1: PRESENTATION MIDDLEWARE                        │
│ - EnforceTenantScope.php kiểm tra tài khoản gắn HTX    │
│ - Chặn giả mạo: Header khác DB -> HTTP 403 Forbidden  │
│ - Tự động ghi SECURITY_ALERT_TENANT_TAMPERING          │
└──────────────┬─────────────────────────────────────────┘
               │
               ▼
┌────────────────────────────────────────────────────────┐
│ TẦNG 2: APPLICATION SERVICE LAYER                      │
│ - Singleton TenantContext lưu trữ activeCooperativeId  │
│ - 23 Application Services chủ chốt inject và sử dụng:  │
│   $this->tenantContext->getCooperativeId()             │
└──────────────┬─────────────────────────────────────────┘
               │
               ▼
┌────────────────────────────────────────────────────────┐
│ TẦNG 3: DATABASE ACCESS LAYER                          │
│ - Query Scope: where('cooperative_id', $tenantId)      │
│ - Quan hệ liên kết: whereHas('productionUnit', ...)    │
│ - Chống rò rỉ dữ liệu khi Export Excel & Queue Jobs    │
└────────────────────────────────────────────────────────┘
```

1. **Tầng Presentation Middleware:** Lớp `EnforceTenantScope` (`backend/app/Modules/Cooperative/Presentation/Http/Middleware/EnforceTenantScope.php`, dòng 13–110) chặn 100% người dùng chưa được phân bổ HTX (`UNASSIGNED_COOPERATIVE_ACCOUNT`). Khi người dùng cố tình gửi header `X-Cooperative-ID` trỏ sang HTX khác, hệ thống chặn đứng với mã HTTP 403 (`UNAUTHORIZED_TENANT_ACCESS`) và ghi log an ninh `SECURITY_ALERT_TENANT_TAMPERING`.
2. **Tầng Application Service:** Singleton `TenantContext` (`backend/app/Modules/Cooperative/Application/Services/TenantContext.php`) quản lý ngữ cảnh HTX. Có **23 Application Services** độc lập inject `$this->tenantContext->getCooperativeId()` để gán tenant ID tự động vào thực thể khi tạo mới, không tin cậy payload từ client.
3. **Tầng Database Query Scope:** Mọi câu lệnh truy vấn danh sách (`list*`) đều áp dụng điều kiện lọc cứng: `$query->where('cooperative_id', $this->tenantContext->getCooperativeId())`. Với các thực thể con không có cột `cooperative_id` trực tiếp (như `harvests`, `lots`), hệ thống sử dụng quan hệ ràng buộc:
   ```php
   $query->whereHas('cropSeason.productionUnit', fn($q) => $q->where('cooperative_id', $tenantId));
   ```

---

## 2.4. Chuỗi Kiểm toán Bất biến SHA-256 (Audit Hash Chaining SHA-256)

Để bảo đảm tính toàn vẹn (Tamper-evident Audit Trail), bảng `audit_events` được bổ sung hai trường băm mật mã: `prev_hash` và `current_hash` (`2026_01_01_000069_update_farming_and_audit_for_phi_and_hash_chain.php`):

```
┌─────────────────────────┐          ┌─────────────────────────┐
│     Audit Event N-1     │          │      Audit Event N      │
├─────────────────────────┤          ├─────────────────────────┤
│ payload: { ... }        │          │ payload: { ... }        │
│ prev_hash: "000...000"  │          │ prev_hash: "a3b9f8..."  │
│ current_hash: "a3b9f8" ─┼─────────►│ current_hash: "7c1e4d" │
└─────────────────────────┘          └─────────────────────────┘
```

- **Thuật toán sinh mã băm (`AuditService.php:27-42`):**
  ```php
  $lastEvent = AuditEventModel::orderBy('created_at', 'desc')->orderBy('id', 'desc')->first();
  $prevHash = $lastEvent?->current_hash ?: str_repeat('0', 64); // Block nguyên thủy (Genesis) dùng 64 số 0

  $payload = json_encode([
      'action' => $action,
      'entity_type' => $entityType,
      'entity_id' => $entityId,
      'before' => $before,
      'after' => $after,
      'actor_id' => $currentActorId,
      'cooperative_id' => $currentCoopId,
      'request_id' => $requestId,
  ], JSON_UNESCAPED_UNICODE);

  $currentHash = hash('sha256', $payload . $prevHash);
  ```
- **Khai thác truy vết:** `AuditQueryService.php` cung cấp hai API chuyên biệt:
  - `GET /api/v1/audit-logs/trace/ocop/{applicationId}`: Tái hiện toàn bộ lịch sử hồ sơ OCOP từ khi nộp, cập nhật minh chứng, các phiên chấm điểm đến quyết định cấp sao.
  - `GET /api/v1/audit-logs/trace/member/{id}`: Truy vết toàn bộ biến động nhân thân, nộp vốn điều lệ và lịch sử chi trả thặng dư.

---

## 2.5. Kiểm soát Tương tranh & An toàn Giao dịch Tài chính (Concurrency & FSM)

Tuân thủ **Nguyên tắc B: Kiểm chứng Nghiệp vụ & Dữ liệu Thực tế**:
1. **Khóa dòng dữ liệu (`lockForUpdate`):** Trong `ReceivablePayableService::createSettlement` (`ReceivablePayableService.php:165-170`), thao tác thanh toán công nợ được bọc trong `DB::transaction()` và thực thi:
   ```php
   $debtModel = ReceivablePayableModel::where('id', $dto->debtId)->lockForUpdate()->first();
   ```
   Ngăn chặn triệt để tình trạng hai kế toán cùng thực hiện thanh toán một khoản nợ dẫn đến âm nợ (Race condition / Over-settlement).
2. **Khóa tồn kho khả dụng:** Trong `StockIssueService::approveIssue` (`StockIssueService.php:222-234`), vật tư xuất kho được khóa `MaterialModel::where('id', $line->material_id)->lockForUpdate()->first()`, tính toán tồn kho khả dụng thực tế trước khi xuất kho nợ, triệt tiêu nguy cơ tồn kho âm.
3. **Chống duyệt trùng (Idempotency Guard):** Các phương thức `CashTransactionService::approveTransaction`, `StockReceiptService::approveReceipt`, `StockIssueService::approveIssue` đều kiểm tra điều kiện idempotent:
   ```php
   if ($model->status === 'APPROVED') {
       return $model;
   }
   ```
   Đảm bảo không bao giờ cộng/trừ kho hay ghi sổ hai lần nếu người dùng vô tình click đúp.

---

# PHẦN 3: CHUẨN HÓA KIẾN TRÚC GIAO DIỆN, LUỒNG ĐIỀU HƯỚNG & CHỐNG RỐI LOẠN DỮ LIỆU (R2)

## 3.1. Quy chuẩn Bố cục Giao diện qua 28 Màn hình (Table vs Drawer vs Modal)

Căn cứ khảo sát thực chứng từ mã nguồn Frontend React 18 (`explorer_frontend_3`), hệ thống chuẩn hóa ranh giới tương tác của **28 màn hình nghiệp vụ** thành 3 thành phần có trách nhiệm đơn nhất:

```
┌─────────────────────────────────────────────────────────────────────────────────────────┐
│                                 TIÊU CHUẨN BỐ CỤC UI/UX                                 │
├──────────────────────────────┬────────────────────────────┬─────────────────────────────┤
│ 1. BẢNG DỮ LIỆU (TABLE)      │ 2. NGĂN KÉO (DRAWER)       │ 3. HỘP THOẠI (MODAL)        │
│ Danh sách nhiều thuộc tính,  │ Xem nhanh chi tiết hồ sơ,  │ Nhập liệu tập trung, có xác │
│ tìm kiếm, lọc đa tiêu chí,   │ lịch sử canh tác, tab phụ  │ thực biểu mẫu, xác nhận     │
│ phân trang server-side.      │ KHÔNG LÀM MẤT NGỮ CẢNH.    │ giao dịch tài chính/kho.    │
└──────────────────────────────┴────────────────────────────┴─────────────────────────────┘
```

### Ma trận 14 Drawer Chi tiết Được Bố trí Chuẩn Mực trong Hệ thống:
1. `MemberDrawer.tsx` (Màn hình Xã viên): 6 tabs chi tiết (Thông tin cá nhân, Vốn góp, Ruộng khoán, Nhật ký canh tác, Công nợ vật tư, Lịch sử thặng dư).
2. `MeetingDetailDrawer.tsx` (Đại hội): Xem chi tiết chương trình, danh sách đại biểu điểm danh, nghị quyết đại hội và kết quả biểu quyết từng nội dung.
3. `CapitalMemberDrawer.tsx` (Sổ Vốn): Lịch sử các đợt nộp tiền mặt, giấy biên nhận và giấy chứng nhận phần vốn góp.
4. `FarmPlotDrawer.tsx` (Thửa Đất): Lịch sử biến động sử dụng đất, tọa độ ranh giới, danh sách mùa vụ đã canh tác, chỉ số viễn thám vệ tinh.
5. `CropSeasonDrawer.tsx` (Mùa Vụ): Xem chỉ tiêu kế hoạch sản lượng, tiến độ canh tác thực tế, danh sách thửa đất tham gia và tổng lượng vật tư tiêu thụ.
6. `FarmingLogDetailPanel.tsx` (Nhật ký): Chế độ xem chia đôi (Master-Detail Split View) hiển thị chi tiết 10 trường nhật ký, ảnh hiện trường và chỉ số an toàn PHI.
7. `HarvestDrawer.tsx` (Thu hoạch): Chi tiết lệnh thu hoạch, kết quả kiểm định KCS 3 cấp, mã lô GS1 và tem nhãn nhiệt.
8. `ProductDrawer.tsx` (Sản phẩm OCOP): Hồ sơ chất lượng, các chứng nhận đạt được, danh sách lô thu hoạch gắn kèm.
9. `MaterialDrawer.tsx` (Vật tư): Danh sách các lô hạn dùng (FEFO batches), định mức sử dụng, thời gian cách ly PHI khuyến nghị.
10. `StockReceiptDrawer.tsx` (Phiếu Nhập): Xem chi tiết các dòng vật tư, nhà cung cấp, chứng từ gốc đính kèm.
11. `CashTransactionDrawer.tsx` (Sổ Quỹ): Chi tiết phiếu thu/chi, chữ ký chứng từ kế toán, căn cứ giao dịch.
12. `DebtDrawer.tsx` (Công Nợ): Bảng kê chi tiết các hóa đơn phát sinh nợ, dải tuổi nợ, lịch sử cấn trừ sau thu hoạch.
13. `DossierQuickPreviewDrawer.tsx` (Hồ sơ OCOP): Xem nhanh tiến độ hoàn thiện hồ sơ, tỷ lệ minh chứng đã nộp, dự báo số sao đạt được.
14. `AuditLogDrawer.tsx` (Kiểm Toán): Xem chi tiết payload `before`/`after`, địa chỉ IP, chuỗi mã băm `prev_hash` và `current_hash`.

---

## 3.2. Vòng đời Tabs & Cơ chế Khóa Chốt sổ (Tab Lifecycle & Read-Only Locking)

Nhằm ngăn chặn tình trạng người dùng vô tình chỉnh sửa dữ liệu lịch sử đã quyết toán, hệ thống thiết lập cơ chế **Khóa Chốt Sổ (Read-Only Finalization)** nghiêm ngặt:

1. **Phân tách Tab Hiện tại vs Quá khứ:**
   - Tại `CropSeasonsTable.tsx:138-185`: Tích hợp bộ chuyển đổi phạm vi (`scopeFilter: 'ALL' | 'ACTIVE_ONLY' | 'HISTORY_ONLY'`).
   - Khi người dùng chọn tab `HISTORY_ONLY` (`CropSeasonsTable.tsx:187-192`), giao diện hiển thị huy hiệu cố định:
     ```tsx
     <span className="text-[11px] font-bold text-slate-500 flex items-center gap-1 bg-slate-200/70 px-2.5 py-1 rounded-lg">
       <Lock className="w-3.5 h-3.5" />
       <span>Chế độ tra cứu quá khứ (Read-only)</span>
     </span>
     ```
   - Nút "Đóng mùa vụ" (`onCloseSeason`) bị ẩn hoàn toàn khi mùa vụ đã chuyển sang `COMPLETED`.
2. **Khóa ghi nhật ký khi mùa vụ đã đóng:**
   - Tại `FarmingLogsPage.tsx:59`: Khi mùa vụ được chọn có trạng thái `currentSeason?.status === 'COMPLETED'`, cờ `isSeasonReadOnly = true` được kích hoạt, vô hiệu hóa nút "Ghi nhật ký mới" và khóa toàn bộ form chỉnh sửa.
3. **Khóa hồ sơ OCOP đã nộp thẩm định:**
   - Tại `DossierDetailPage.tsx`: Khi hồ sơ chuyển sang trạng thái `SUBMITTED`, `IN_REVIEW` hoặc `APPROVED`, chức năng tự chấm điểm và chỉnh sửa biểu mẫu bị khóa hoàn toàn, chuyển sang chế độ "Chỉ đọc phục vụ Hội đồng thẩm định".

---

## 3.3. Định lượng Chỉ số & Trực quan hóa (KPI Cards & Charts Audit)

Khảo sát độc lập đã phân định rạch ròi giữa các chỉ số có giá trị quản trị thực chất và các vị trí giả lập / trang trí rối mắt cần chấn chỉnh:

### A. Các Thẻ KPI và Biểu đồ Có Giá Trị Quản Trị Thực Tế Cao:
1. **Biểu đồ Phân kỳ Tuổi nợ 5 bậc (`DebtAgingSummaryCard.tsx:87-148`):**
   - Phân loại trực quan 5 dải tuổi nợ: *Trong hạn*, *Quá hạn 1–30 ngày*, *31–60 ngày*, *61–90 ngày*, *Trên 90 ngày*.
   - Giúp Ban Giám đốc và Kế toán nhận diện tức thì nợ xấu và lập kế hoạch cấn trừ thu mua.
2. **Hàng Thẻ KPI Thu hoạch & KCS (`HarvestKpiStats.tsx:19-67`):**
   - Thẻ 1: Tổng sản lượng thu hoạch thực tế (kg).
   - Thẻ 2: Sản lượng và Tỷ lệ Grade A Premium (Brix $\ge 7.0^\circ$, đồng đều $\ge 90\%$).
   - Thẻ 3: Số mã lô GS1 Traceability đã cấp và xuất kho.
3. **Bộ 3 Biểu đồ Hồ sơ OCOP (`DossiersStatsCharts.tsx:74-160`):**
   - Donut Chart: Tỷ lệ hoàn thiện hồ sơ (% tiến độ thực tế).
   - Bar Chart: Phân bổ số lượng sản phẩm theo mục tiêu 3 sao, 4 sao, 5 sao.
   - Pie Chart: Cơ cấu sản phẩm theo nhóm ngành OCOP.

### B. Các Yếu Tố Trang Trí, Bố Cục Rối Mắt & Số Liệu Giả Lập Cần Loại Bỏ:
1. **Hardcode 100% Đạt tại Thẻ KCS Thu hoạch (`HarvestKpiStats.tsx:73-74`):**
   ```tsx
   <p className="mt-1.5 text-2xl font-black tracking-tight text-emerald-800">
     100% <span className="text-xs font-bold text-slate-500">Đạt</span>
   </p>
   ```
   *Chấn chỉnh:* Bỏ số cứng, tính tỷ lệ đạt thực tế từ `kcs_status === 'GRADED' && grade !== 'REJECT'`.
2. **Trang Báo cáo OCOP Dữ liệu Tĩnh Giả lập (`OcopReportsPage.tsx:15-56, 91-127`):**
   - 6 Thẻ KPI đầu trang viết cứng: *12 sản phẩm*, *4 sản phẩm 3 sao*, *6 sản phẩm 4 sao*, *2 sản phẩm 5 sao*, *92.5% hoàn thiện*, *2.85 tỷ doanh thu*.
   - 4 Biểu đồ Recharts vẽ trên mảng tĩnh không gọi API. Nút "Xuất báo cáo" (dòng 82) chỉ gọi `alert()`.
   - *Chấn chỉnh:* Đấu nối vào API `ReportController` (`/reports/dashboard` hoặc `/reports/ocop-readiness`), tính toán trên dữ liệu thật.
3. **Thẻ Công nợ Mất Định Lượng tại Dashboard (`DashboardStatCards.tsx:92-95`):**
   - Thay vì hiện số tiền thực nợ, thẻ lại hiện dòng chữ khẩu hiệu `"Theo dõi thời gian thực"`.
   - *Chấn chỉnh:* Hiển thị đúng tổng dư nợ thực tế (ví dụ: `145.200.000 ₫`).
4. **Vẽ Sai Lệch Trạng Thái Rỗng OCOP Dashboard (`DashboardOcopBreakdown.tsx:53`):**
   ```tsx
   {ocopApplications.length > 0 ? `${ocopDraftCount} hồ sơ` : '1 hồ sơ'}
   ```
   *Chấn chỉnh:* Sửa `'1 hồ sơ'` thành `'0 hồ sơ'` khi database có 0 hồ sơ.

---

## 3.4. Xử lý Trạng thái Trung thực (Truthful States: Skeleton, Empty, Error, Success)

Tuân thủ nghiêm ngặt **Quy tắc số 2 trong `AGENT.md` và `GEMINI.md`**, hệ thống chuẩn hóa 4 trạng thái giao diện:

1. **Loading Skeleton:**
   - Component `frontend/src/components/ui/Skeleton.tsx` cung cấp hiệu ứng `animate-pulse` cho 3 biến thể: `text`, `circular`, `rectangular`.
   - Bảng dữ liệu `DataTable.tsx:112-121`: Khi `isLoading === true`, tự động hiển thị 5 hàng Skeleton giữ nguyên chiều rộng cột, chống nhảy giật layout (Cumulative Layout Shift - CLS).
2. **Empty State với Nút bấm 1 chạm "Đặt lại bộ lọc tìm kiếm":**
   - Đã được triển khai hoàn hảo trên **10 bảng nghiệp vụ**: `FarmPlotsFullTable.tsx:250-254`, `CropSeasonsTable.tsx:298`, `HarvestsTable.tsx:173`, `MembersTable.tsx:174`, `MaterialsTable.tsx:280`, `MaterialBatchesTable.tsx:147`, `CashbookTab.tsx:194`, `DebtsTab.tsx:255`, `CapitalMembersTab.tsx:95`, `EvidencesTable.tsx:101`.
   - Khi kết quả tìm kiếm rỗng, hiển thị minh họa trực quan cùng nút bấm 1 chạm:
     ```tsx
     <button onClick={handleResetFilters} className="btn-secondary text-xs">
       <RotateCcw className="w-3.5 h-3.5 mr-1" />
       Đặt lại bộ lọc tìm kiếm
     </button>
     ```
3. **Error Toast kèm Mã Lỗi Cụ thể:**
   - Bộ chuyển đổi `frontend/src/services/errorAdapter.ts` và `apiClient.ts:54-55` bóc tách chính xác mã lỗi backend: `[ERR_HARVEST_PHI_VIOLATION] Thửa đất đang trong thời gian cách ly an toàn`, `[UNAUTHORIZED_TENANT_ACCESS] Không có quyền truy cập HTX này`.
4. **Success Toast:** Tự động kích hoạt phản hồi màu xanh ngọc sau mỗi thao tác thêm/sửa/xóa thành công qua TanStack React Query.

---

## 3.5. Bảng Rà soát Triệt để 21 Điểm Vi phạm "Silent Mocking" & Hardcoded Tenant

Bảng kiểm toán dưới đây ghi nhận **chính xác 21 vị trí vi phạm tại runtime** cần loại bỏ triệt để trong đợt chuẩn hóa:

| STT | Tệp tin vi phạm (File Path) | Dòng mã (Line #) | Đoạn mã / Dữ liệu vi phạm | Bản chất vi phạm & Tác hại nghiệp vụ |
| :---: | :--- | :---: | :--- | :--- |
| **1** | `frontend/src/services/memberService.ts` | 14–456 | `export const mockMembersList: Member[] = [...]` | Khai báo mảng mock tĩnh xã viên. |
| **2** | `frontend/src/services/memberService.ts` | 457–600 | `export const mockCapitalTransactions: CapitalTransaction[] = [...]` | Mảng mock giao dịch vốn góp. |
| **3** | `frontend/src/services/memberService.ts` | 601–635 | `export const mockSurplusPlan = {...}`, `mockSurplusItems = [...]` | Mảng mock phương án phân phối thặng dư. |
| **4** | `frontend/src/services/memberService.ts` | 930–947 | `createdMember = { ...mockMembersList[0], ... }` | Tạo xã viên thất bại thì đè dữ liệu mock vào Local Storage. |
| **5** | `frontend/src/services/memberService.ts` | **1245** | `catch (error) { return { data: [mockSurplusPlan] }; }` | **Silent Mocking nghiêm trọng:** API lỗi thì âm thầm trả về phương án chia lãi giả lập, che giấu lỗi backend! |
| **6** | `frontend/src/services/memberService.ts` | **1255** | `catch (error) { return { data: mockSurplusPlan }; }` | Tương tự dòng 1245 đối với chi tiết kế hoạch thặng dư. |
| **7** | `frontend/src/features/members/pages/ProfitPage.tsx` | 55–56 | `useState(mockSurplusPlan)`, `useState(mockSurplusItems)` | Khởi tạo State trực tiếp từ mảng mock thay vì trạng thái loading từ API. |
| **8** | `frontend/src/features/members/pages/ProfitPage.tsx` | 61–66 | `internal_service_surplus: surplusPlan.internal_service_surplus \|\| 850000000` | Toán tử fallback gán số tiền giả định (850 triệu, 400 triệu, 55%). |
| **9** | `frontend/src/services/ocopService.ts` | 127–219 | `MOCK_OCOP_DOSSIERS_FULL`, `MOCK_EVIDENCES_FULL`, v.v. | Danh mục dữ liệu mock OCOP tĩnh. |
| **10** | `frontend/src/services/ocopService.ts` | **229** | `return MOCK_OCOP_DOSSIERS_FULL;` (trong `getApplications`) | Khi database thật có 0 hồ sơ hoặc API lỗi, hệ thống luôn trả về hồ sơ mock. |
| **11** | `frontend/src/services/ocopService.ts` | **242** | `return MOCK_OCOP_DOSSIERS_FULL.find(...) \|\| MOCK_OCOP_DOSSIERS_FULL[0]` | Tìm chi tiết hồ sơ không thấy thì ép trả về hồ sơ mock đầu tiên. |
| **12** | `frontend/src/services/ocopService.ts` | **276** | `catch (e) { return MOCK_EVIDENCES_FULL; }` | Lỗi API kho minh chứng thì tự động nạp danh sách minh chứng mock. |
| **13** | `frontend/src/features/ocop/pages/DossierDetailPage.tsx` | 11–12, 47 | `MOCK_OCOP_DOSSIERS_FULL.find(...)` | Trang chi tiết hồ sơ import và tra cứu trực tiếp từ mock data. |
| **14** | `frontend/src/features/ocop/pages/CreateDossierWizardPage.tsx` | 19–70 | `const INITIAL_EVIDENCES: UploadedEvidence[] = [...]` | Nạp sẵn 5 tệp minh chứng giả lập kèm mã băm SHA-256 ngẫu nhiên vào wizard. |
| **15** | `frontend/src/features/inventory/pages/ProductsPage.tsx` | 103, 144 | `p.star_rating \|\| p.quality_information?.star_rating \|\| 4` | Sản phẩm chưa đánh giá OCOP bị tự động gắn mác "4 sao" (hardcoded fallback). |
| **16** | `frontend/src/utils/voucherDocumentGenerator.ts` | 32, 151, 234 | `amount = tx?.amount \|\| ... \|\| 10000000` (và `20000000`) | Mẫu in phiếu thu/chi/giấy chứng nhận vốn tự động fallback 10tr và 20tr VNĐ. |
| **17** | `frontend/src/features/dashboard/pages/DashboardPage.tsx` | 72 | `const ocopTotal = ocopApplications.length \|\| 1;` | Tránh chia cho 0 nhưng gây sai lệch mẫu số khi HTX có 0 hồ sơ. |
| **18** | `frontend/src/features/dashboard/components/DashboardOcopBreakdown.tsx` | 53 | `{ocopApplications.length > 0 ? ... : '1 hồ sơ'}` | HTX có 0 hồ sơ thì giao diện tự động vẽ thành '1 hồ sơ'. |
| **19** | `frontend/src/services/traceabilityApi.ts` | 196–202 | `if (VERIFIED_OFFLINE_LOTS.has(cleanLotId)) return { ...defaultPalermoTraceability }` | Tự động trả về dữ liệu mẫu ớt chuông Palermo khi mất mạng/lỗi backend. |
| **20** | `frontend/src/features/inventory/data/inventoryMockData.ts` | 1–180 | `SEED_MATERIALS`, `MOCK_SEASONS`, `MOCK_MEMBERS_PLOTS` | Tệp mock tàn dư 180 dòng trong source code (dù không được import). |
| **21** | **Toàn bộ codebase (18 tệp)** | Nhiều dòng | Hardcode tên HTX `"HTX Tân Tiến"`, `"Hợp tác xã Nông nghiệp Tân Tiến"` | Vi phạm nguyên tắc Tenant Context động: `PublicTraceabilityPage.tsx:228, 366, 395`, `traceabilityApi.ts:10, 106, 129`, `CoopProfilePage.tsx:29, 30, 92`, `SettlementVoucherModal.tsx:69`, `productApi.ts:57, 77, 97, 175`, `ocopService.ts:99, 134, 160`, `harvestApi.ts:42, 82, 186, 255`, `FarmingLogDetailPanel.tsx:289`, `TenantManagementCard.tsx:33, 157`, `OcopReportsPage.tsx:43, 50, 221, 230`, `CashTransactionTabVoucher.tsx:51`, `FarmingLogDetailModal.tsx:79, 260`, `FieldLogQuickForm.tsx:247`, `HarvestLabelPrintModal.tsx:113, 144`, `VoucherPrintModal.tsx:55`, `SurplusVoucherPrintModal.tsx:53`, `CapitalCertificateModal.tsx:39, 158`. |

---

## 3.6. Cơ chế Kiểm soát Gửi trùng (Idempotency) & Khuyết thiếu Debounce

1. **Bảo vệ Giao dịch qua Idempotency-Key:**
   - Tại `frontend/src/services/apiClient.ts:30-35`: Bộ đón chặn request tự động sinh và đính kèm header `Idempotency-Key` với giá trị UUID duy nhất cho mọi request đột biến trạng thái (`POST`, `PUT`, `PATCH`, `DELETE`).
   - Kết hợp với bảng `idempotency_keys` ở backend, cơ chế này bảo đảm tuyệt đối không phát sinh giao dịch kép khi người dùng click đúp nút ghi sổ, xuất kho hoặc chuyển tiền.
2. **Khuyết thiếu Kỹ thuật Debounce trên Toàn bộ Ô Tìm kiếm:**
   - Khảo sát toàn bộ thư mục `frontend/src` xác nhận: **Hệ thống chưa có bất kỳ hook `useDebounce` nào**.
   - Điển hình tại `FarmingLogsPage.tsx:61-64`:
     ```tsx
     const [search, setSearch] = useState('');
     const { data: rawLogsList = [], isLoading } = useQuery<FarmingLog[]>({
       queryKey: ['farming-logs', search, selectedActivity],
       queryFn: async () => fetchFarmingLogs({ search: search.trim() || undefined, ... }),
     });
     ```
     Mỗi ký tự gõ vào ô tìm kiếm làm thay đổi `queryKey` và gửi ngay lập tức một HTTP Request về server. Khi người dùng gõ cụm từ 15 ký tự, 15 request liên tiếp được kích hoạt trong chưa đầy 2 giây, gây lãng phí băng thông và nguy cơ race condition kết quả trả về.
   - *Khuyến nghị:* Xây dựng custom hook `useDebounce(value, 350)` và áp dụng đồng loạt cho tất cả các thanh tìm kiếm.

---

# PHẦN 4: KIỂM CHỨNG THỰC TẾ TRUY XUẤT NGUỒN GỐC GS1 & KẾT XUẤT BÁO CÁO (R3)

## 4.1. Kiểm toán Chuỗi Truy xuất GS1 & Cổng Tra cứu QR Công khai (TCVN 12850:2019)

Kiểm toán trực tiếp mã nguồn backend và frontend (`explorer_features_3`) khẳng định hệ thống đáp ứng **100% chuẩn mực Quốc gia TCVN 12850:2019** về chuỗi thông tin truy xuất nguồn gốc:

```
┌──────────────────────────────────────────────────────────────────────────────────┐
│                   HÀNH TRÌNH 5 CHẶNG TRUY XUẤT NGUỒN GỐC GS1                     │
├───────────────┬───────────────┬──────────────────┬───────────────┬───────────────┤
│ CHẶNG 1       │ CHẶNG 2       │ CHẶNG 3          │ CHẶNG 4       │ CHẶNG 5       │
│ Làm đất &     │ Bón phân &    │ Chăm sóc sinh    │ Thu hoạch     │ KCS 3 cấp &   │
│ Xuống giống   │ Tưới nhỏ giọt │ học & Cách ly    │ chọn lọc tiêu │ Cấp mã QR     │
│ Palermo       │ tự động       │ an toàn PHI      │ chuẩn         │ GS1 chuẩn hóa │
└───────────────┴───────────────┴──────────────────┴───────────────┴───────────────┘
```

1. **Bypass Middleware Xác thực Hoàn Toàn:**
   - Tại `backend/routes/api.php:62-65`:
     ```php
     Route::get('/public/trace/{lotId}', [PublicTraceabilityController::class, 'show'])->name('api.public.trace');
     Route::get('/trace/{lotId}', [PublicTraceabilityController::class, 'show'])->name('api.trace');
     ```
     Hai tuyến đường này được khai báo bên ngoài nhóm `auth:sanctum` và `tenant.scope`, cho phép bất kỳ người tiêu dùng nào quét mã QR bằng Zalo, Camera điện thoại hoặc trình duyệt web đều có thể truy cập tức thì mà không bị chặn mã lỗi 401/403.
2. **Cơ chế Tra cứu Kép (Dual Identifier Lookup):**
   - Tại `LotService.php:226-233`: Tự động nhận diện chuỗi truy vấn là `UUID` của bảng `lots` hay `lot_code` dạng GS1 (`LOT-TT-PLOT01-20261020-001`) để truy vấn chính xác bản ghi thu hoạch.
3. **Cấu trúc Dữ liệu Toàn vẹn Trả về:**
   - **Sản phẩm:** Ớt chuông Sweet Palermo Đỏ Đà Lạt, giống Rijk Zwaan Hà Lan, OCOP 4 sao, quy cách đóng gói thùng carton 5 lớp 5kg / khay 500g, điều kiện bảo quản mát 7–10°C, hạn sử dụng 21 ngày.
   - **Pháp nhân HTX:** Hợp tác xã Nông nghiệp Tân Tiến, mã số thuế, địa chỉ Thôn Hòn Bồ, Xã Đạ Sar, Huyện Lạc Dương, Tỉnh Lâm Đồng, hotline và đại diện pháp luật.
   - **Vùng trồng & Thửa đất GPS:** Mã vùng trồng `PUC-49-015-9923` (Cục BVTV cấp), mã thửa `PLOT-TT-01-01`, tọa độ WGS-84 (`11.9404, 108.4583`), diện tích $2.500\,\text{m}^2$, chất đất bazan hữu cơ.
   - **Dòng thời gian 5 chặng canh tác:** Ghi nhận đầy đủ ngày giờ, công việc, vật tư sử dụng, số ngày cách ly PHI.
   - **Kiểm định KCS 3 cấp:** Gate check PHI đạt chuẩn, Quick Lab Kit âm tính ($0.001\,\text{ppm}$ dư lượng), Phân hạng Grade A (Brix $\ge 7.5^\circ$, đồng đều $92\%$).
   - **Mã băm toàn vẹn SHA-256 (`LotService.php:405-417`):** Băm toàn bộ payload dữ liệu thu hoạch và KCS bằng SHA-256, bảo chứng dữ liệu không bị sửa đổi sau khi xuất xưởng.

---

## 4.2. In Tem Nhãn Thùng Hàng GS1 Kích thước Vật lý 100mm × 75mm

Component in tem nhãn `HarvestLabelPrintModal.tsx` (256 dòng) được thiết kế chuyên biệt cho xưởng sơ chế, đóng gói của HTX:
- **Kích thước vật lý:** Chuẩn $100\,\text{mm} \times 75\,\text{mm}$ (tỷ lệ $4:3$), tương thích hoàn hảo với các dòng máy in nhiệt công nghiệp phổ biến (Xprinter, Bixolon, Zebra).
- **Mã vạch QR Code SVG:** Chuẩn ISO/IEC 18004, nhúng URL tra cứu công khai `https://htx-ocop.vn/trace/LOT-TT-PLOT01-20261020-001`.
- **Nội dung nhãn:** Tên sản phẩm, logo OCOP 4 sao, mã PUC Cục BVTV, ngày thu hoạch, hạn dùng, phân hạng Grade A, mã lô GS1 to rõ, và cảnh báo bảo quản mát.
- **CSS In nhiệt:** `@page { size: 100mm 75mm; margin: 0; } -webkit-print-color-adjust: exact !important;`.

---

## 4.3. Kiểm toán Kết xuất Báo cáo Excel (.xlsx) Phía Server (OpenXML) & Client (SheetJS)

### A. Kết xuất Máy chủ Backend (Server-Side OpenXML):
- Lớp dịch vụ `OpenXmlSpreadsheetService.php` (193 dòng) là một điểm sáng kiến trúc nổi bật:
  - Tự động đóng gói cấu trúc file nén `.xlsx` (ECMA-376) bằng `ZipArchive` thuần của PHP, **hoàn toàn không phụ thuộc thư viện nặng `phpoffice/phpspreadsheet`**, tiết kiệm tài nguyên RAM máy chủ.
  - Sinh đầy đủ các file XML chuẩn: `[Content_Types].xml`, `_rels/.rels`, `xl/workbook.xml`, `xl/styles.xml`, `xl/worksheets/sheet1.xml`, `xl/sharedStrings.xml`.
  - Phối màu nhận diện thương hiệu HTX: Tiêu đề cột nền xanh ngọc (Emerald `#059669`), chữ trắng in đậm, có border và tự động format kiểu số.
  - Controller `ReportController.php` cung cấp 2 endpoint:
    - `GET /api/v1/reports/export/members`: Xuất danh bạ xã viên 11 cột có kiểm soát tenant.
    - `GET /api/v1/reports/export/cash-book`: Xuất sổ quỹ tiền mặt 9 cột, hỗ trợ lọc theo khoảng ngày.

### B. Kết xuất Trình duyệt (Client-Side SheetJS & CSV BOM):
- Hàm `exportCapitalToExcel()` (`excelExporter.ts:13-172`) xuất sổ theo dõi vốn góp đa sheet: Sheet 1 (Tổng hợp vốn), Sheet 2 (Lịch sử giao dịch), Sheet 3 (Chỉ số tổng hợp).
- Xuất danh sách lô hàng GS1 (`LotsInventoryTab.tsx:93-110`) và Nhật ký canh tác VietGAP (`FarmingLogsPage.tsx:98-117`).
- Xuất file CSV sổ công nợ (`DebtsTab.tsx:45-67`) chèn tiền tố **UTF-8 BOM (`\uFEFF`)**, đảm bảo mở trực tiếp trên Microsoft Excel tiếng Việt không bao giờ bị lỗi font ký tự có dấu.

---

## 4.4. Kiểm toán In ấn & Xuất Chứng từ PDF Chuẩn Thể thức Nghị định 30/2020/NĐ-CP

1. **Tiện ích In Ấn Tương Tác cho Laptop (`pdfExportUtils.ts:1-212`):**
   - Nhận diện bài toán thực tế: Cán bộ HTX và nông dân dùng laptop không có máy in nối dây.
   - Hàm `openInteractivePrintWindow()` mở cửa sổ xem trước tài liệu có thanh công cụ nổi `#htx-print-toolbar`, nút "🖨️ In / Lưu PDF" gọi `window.print()`, nút "📥 Tải File Lưu Trữ" tải file HTML độc lập, và hướng dẫn chọn máy in ảo "Save as PDF" của trình duyệt.
2. **Phiếu Thu / Chi Kế toán & Giấy Chứng nhận Vốn Góp:**
   - Font chữ Times New Roman 13pt–14pt, Quốc hiệu & Tiêu ngữ chuẩn thể thức, số chứng từ, ngày tháng, bảng ký 2 bên kèm khoảng trống ký tên $80\,\text{px}$ (`sig-space`).
   - Khung viền kép hoa văn trang trọng (`border: 3px double #047857`) cho Giấy chứng nhận phần vốn góp theo Luật HTX 2023.
   - **Hàm Chuẩn hóa Unicode NFC (`capitalCertificatePrinter.ts:4-24`):**
     ```ts
     export function nfc(str: string): string {
       return str ? str.normalize('NFC') : '';
     }
     ```
     Khắc phục triệt để hiện tượng vỡ font tiếng Việt do các bộ gõ Unikey/EVKey sinh mã tổ hợp (decomposed unicode).
3. **Biểu mẫu OCOP Biểu 01, Biểu 02, Biểu 03 Chuẩn QĐ 148 & 1489:**
   - Backend `OcopDocumentService.php` (807 dòng) và Frontend `Qd148DocumentModal.tsx` (289 dòng) định dạng chuẩn trang in A4 dọc (`@page { size: A4 portrait; margin: 15mm 15mm 15mm 20mm; }`), lề trái $20\,\text{mm}$ đúng quy chuẩn văn thư để đóng gáy hồ sơ trình UBND cấp huyện/tỉnh.

---

# PHẦN 5: PHÂN TÍCH KHOẢNG CÁCH HIỆN TRẠNG (GAP ANALYSIS) & ĐÁNH GIÁ VIỄN THÁM VỆ TINH (R4)

## 5.1. Phân tích Đối chiếu 3 Tầng: Tài liệu vs Backend vs Frontend

| Phân hệ Nghiệp vụ | Tài liệu Thiết kế (`docs/*`) | Backend Laravel 11 (`routes/api.php`) | Frontend React 18 (`src/features/*`) | Đánh giá Khớp nối & Khoảng cách (Gaps) |
| :--- | :--- | :--- | :--- | :--- |
| **Identity & RBAC** | 7 vai trò, SoD, 15 permissions | Có đủ routes, middleware, request validation | Giao diện quản lý User, phân quyền RBAC | **100% Khớp nối**. |
| **Cooperative & ĐHTV** | Luật HTX 2023, 1 người = 1 phiếu | Có đủ routes `meetings`, `votes`, summaries | Có Table, Drawer, Modal biểu quyết | **100% Khớp nối**. |
| **Xã viên & Vốn góp** | Giới hạn vốn 30%, FSM 5 trạng thái | Có đủ routes `members`, `capital`, `land` | Có Table, 6 tabs Drawer, in chứng từ | Khớp nối tốt; tồn tại fallback mock trong service. |
| **Vùng trồng & Mùa vụ** | PUC $\ge 10\,\text{ha}$, Thửa đất GPS | Có đủ routes `production-units`, `plots`, `seasons` | Có Table, SVG Map, Drawer, Scope switcher | **100% Khớp nối**. |
| **Nhật ký & PHI Guard** | 10 trường VietGAP, chặn vi phạm PHI | Có đủ routes `farming-logs`, `phi-calculations` | Full Table, Split View, Mobile Form | **100% Khớp nối**; thiếu debounce tìm kiếm. |
| **Thu hoạch & GS1** | KCS 3 cấp, Grade A/B, mã GS1 | Có đủ routes `harvests`, `kcs`, `lots`, `public/trace` | Có Table, KCS modal, Public trace, Tem 100x75 | **100% Khớp nối**. |
| **Kho & FEFO Batches** | 3 loại kho, hạn dùng, trần nợ | Có đủ routes `materials`, `batches`, `receipts`, `issues` | Có 5 tabs quản lý kho, Modal xuất nhập | Khớp nối tốt; **thiếu form Kiểm kê kho**. |
| **Tài chính & Sổ quỹ** | Sổ quỹ thu/chi, tuổi nợ, cấn trừ vụ | Có đủ routes `cash-transactions`, `receivables`, `settle` | Có Sổ quỹ, Tab Công nợ, Thẻ tuổi nợ 5 bậc | **100% Khớp nối**. |
| **Phân phối Thặng dư** | Điều 84 & 85 Luật HTX 2023 | Có đủ routes `surplus-distribution-plans` | Có Bảng phân chia thặng dư, in chứng từ | Backend chuẩn; Frontend fallback mock khi API lỗi. |
| **Tiêu chí & Hồ sơ OCOP**| QĐ 148 & 1489, 100đ, Quorum $\ge 3$ | Có đủ routes `criteria`, `applications`, `evaluations` | Có CriteriaPage, DossiersPage, Wizard 6 bước | Backend chuẩn; Frontend fallback mock hồ sơ. |
| **Kho Minh chứng OCOP** | Minh chứng số hóa, SHA-256 | Có đủ routes `evidences`, `versions`, `links` | Có EvidencesPage, Drawer xem tóm tắt | **Tồn tại Tính năng ma** (dùng `alert()`, không upload). |
| **Báo cáo OCOP** | Tổng hợp tiến độ OCOP | Có endpoint `/reports/ocop-readiness` | Có trang `OcopReportsPage.tsx` | **Tính năng ma**: Dữ liệu tĩnh, nút xuất gọi `alert()`. |
| **Báo cáo Xuất Excel** | Sổ thành viên, Sổ quỹ, Công nợ | Có 2 endpoints: `members`, `cash-book` | Có xuất client qua SheetJS và CSV UTF-8 BOM | **Khoảng cách:** Thiếu 3 endpoint backend xuất Excel. |

---

## 5.2. Danh mục Tính năng Ma (Phantom Features) & API Chưa Có Giao diện

### A. Danh mục Tính năng Ma trên Frontend (UI Có Nút Nhưng Không Gọi API Thật):
1. **Các nút tác vụ tại Kho Minh chứng (`EvidencesPage.tsx:184, 196-199`):** Nút Tải xuống, Liên kết chỉ tiêu, Thay thế phiên bản, Xóa tệp hiện đang gán lệnh `alert()`, trong khi Backend đã có đủ các endpoint: `GET /ocop/evidences/{id}/download`, `POST /ocop/evidences/{id}/versions`, `POST /ocop/evidences/{id}/links`.
2. **Hộp thoại Thêm mới Minh chứng Không Upload Tệp (`EvidencesPage.tsx:208-221`):** Form `AddEvidenceModal` khi submit chỉ hiển thị Toast thông báo thành công mà không hề gửi payload multipart/form-data lên Backend, tệp biến mất khi refresh trang.
3. **Nút Xuất Báo cáo tại Trang Báo cáo OCOP (`OcopReportsPage.tsx:82`):** Lệnh `onClick={() => alert('Xuất file Báo cáo tổng hợp Excel / PDF thành công!')}` là hành vi giả lập thuần túy.
4. **Nút Tải xuống Minh chứng tại Chi tiết Hồ sơ (`DossierEvidencesTab.tsx:142`):** Gán lệnh `alert()` thay vì gọi route stream ký số `GET /ocop/evidences/{id}/file-stream`.

### B. Danh mục API Backend Đã Có Nhưng Chưa Có Giao Diện Khai Thác:
1. **Phân hệ Kiểm kê Kho Vật tư (`StockCountController.php`):** Backend có đủ 3 route: `POST /api/v1/stock-counts` (Tạo phiếu kiểm kê), `POST /stock-counts/{id}/complete` (Chốt số liệu kiểm đếm), `POST /stock-counts/{id}/approve` (Duyệt điều chỉnh kho). Frontend mới chỉ có bảng xem danh sách (`StockCountsTable.tsx`), chưa có modal nhập liệu kiểm kê.
2. **API Truy vết Kiểm toán Chuyên sâu (`AuditQueryService.php`):** `GET /api/v1/audit-logs/trace/ocop/{id}` và `GET /trace/member/{id}` đã có sẵn logic phục dựng timeline và kiểm tra mã băm SHA-256 nhưng chưa được gắn vào Drawer chi tiết hồ sơ OCOP và Xã viên.
3. **API Bổ sung Xuất Excel Phía Máy chủ:** Cần xây dựng thêm 3 endpoint tại `ReportController`: `exportReceivablesPayables`, `exportInventoryStock`, `exportFarmingLogs`.

---

## 5.3. Đánh giá Tính Khả Thi & Nhu cầu Ứng dụng Vệ tinh Viễn thám Nông nghiệp

Khảo sát chuyên sâu từ `explorer_features_3` khẳng định việc đưa công nghệ viễn thám vệ tinh vào quản lý nông nghiệp HTX là **hoàn toàn khả thi, mang lại giá trị thực tiễn đột phá và chi phí cực kỳ tiết kiệm**:

```
┌─────────────────────────────────────────────────────────────────────────────────┐
│                      3 ỨNG DỤNG CỐT LÕI CỦA VIỄN THÁM VỆ TINH                    │
├───────────────────────────────┬────────────────────────────┬────────────────────┤
│ 1. CHỈ SỐ NDVI (SENTINEL-2)   │ 2. ĐỘ ẨM ĐẤT (SENTINEL-1)  │ 3. XÁC THỰC PUC    │
│ Đánh giá sức khỏe tán lá,     │ Radar xuyên mây giám sát   │ Đối chiếu đa giác  │
│ phát hiện sớm sâu bệnh và     │ độ ẩm mặt đất 0-5cm, tối   │ thực địa, chống    │
│ vùng cây thiếu dinh dưỡng.    │ ưu lịch tưới tiêu tự động. │ gian lận diện tích.│
└───────────────────────────────┴────────────────────────────┴────────────────────┘
```

1. **Chỉ số Thực vật NDVI (Normalized Difference Vegetation Index) qua Sentinel-2:**
   - *Đặc tính kỹ thuật:* Cặp vệ tinh Sentinel-2A & Sentinel-2B của Cơ quan Vũ trụ Châu Âu (ESA Copernicus) chụp ảnh quang học đa phổ với chu kỳ **5 ngày/lần** (độ phân giải $10\,\text{m}$ trên kênh Đỏ Band 4 và Cận hồng ngoại Band 8).
   - *Công thức:*
     $$\text{NDVI} = \frac{\text{NIR} - \text{Red}}{\text{NIR} + \text{Red}} = \frac{\text{Band 8} - \text{Band 4}}{\text{Band 8} + \text{Band 4}}$$
   - *Ý nghĩa thực tiễn cho HTX Tân Tiến:* Với 1 pixel $10\text{m} = 100\,\text{m}^2$, một vùng trồng của HTX Tân Tiến từ $2\,\text{ha}$ đến $40\,\text{ha}$ tương đương **$200 - 4.000$ pixels vệ tinh**. Độ phân giải này hoàn toàn đủ để:
     - Phân vùng sức khỏe cây trồng theo thời gian thực (Xanh đậm: Phát triển mạnh mẽ $\text{NDVI} \ge 0.7$; Vàng/Cam: Thiếu đạm/dinh dưỡng hoặc bị sâu bệnh $0.3 \le \text{NDVI} < 0.5$; Đỏ: Cây chết hoặc đất trống $\text{NDVI} < 0.2$).
     - Hỗ trợ cán bộ kỹ thuật HTX định vị chính xác vị trí thửa đất đang có nguy cơ bùng phát sâu bệnh để xử lý cục bộ, giảm thiểu lượng thuốc bảo vệ thực vật sử dụng.
   - *Lưu ý về nhà màng:* Với diện tích ớt chuông trồng trong nhà kính phủ màng PE, lớp màng làm suy giảm nhẹ quang phổ phản xạ. Giai đoạn đầu khuyến nghị áp dụng trên vùng trồng ngoài trời và vùng đệm xung quanh; giai đoạn sau áp dụng thuật toán hiệu chỉnh tán xạ màng nilon.
2. **Giám sát Độ ẩm Mặt Đất (Soil Moisture) qua Radar Sentinel-1 SAR:**
   - *Phương pháp:* Sử dụng sóng radar khẩu độ tổng hợp C-band ($5.4\,\text{GHz}$) của vệ tinh Sentinel-1. Sóng radar có đặc tính **xuyên mây, xuyên sương mù**, phản xạ nhạy cảm với hằng số điện môi của đất trong tầng mặt $0 - 5\,\text{cm}$.
   - *Ý nghĩa:* Dự báo nguy cơ hạn hán sớm tại cao nguyên Lâm Đồng, tối ưu hóa lịch tưới bù áp tự động, tiết kiệm điện năng và tài nguyên nước.
3. **Xác thực Đa giác Mã Vùng Trồng PUC (PUC Boundary Cross-Referencing):**
   - *Thực trạng:* Cục Bảo vệ Thực vật yêu cầu mã số vùng trồng phải có tọa độ ranh giới rõ ràng, không chồng lấn. Hiện nay tình trạng "khai khống diện tích" (đăng ký 10 ha nhưng thực tế chỉ trồng 2 ha) diễn ra phổ biến.
   - *Giải pháp:* Lưu trữ GeoJSON đa giác ranh giới thửa đất; sử dụng hàm không gian PostGIS (`ST_Overlaps`, `ST_Intersects`) để tự động phát hiện cấp trùng mã PUC; đối chiếu chuỗi ảnh vệ tinh lịch sử đa thời gian (Multi-temporal NDVI), nếu khu vực đăng ký trồng trọt quanh năm có $\text{NDVI} < 0.2$ (mặt nước hoặc công trình xây dựng), hệ thống lập tức gắn cờ cảnh báo gian lận.

---

## 5.4. Kiến trúc Kỹ thuật Đề xuất cho Module Viễn thám (Background Batch Job)

**Nguyên tắc kiến trúc bất biến:** Tuyệt đối không gọi API xử lý ảnh vệ tinh trực tiếp trong chu kỳ HTTP Request của người dùng, vì việc phân tích dữ liệu raster viễn thám mất từ 5 đến 20 giây, gây treo trình duyệt.

```
┌────────────────────────────────────────────────────────────────────────┐
│             KIẾN TRÚC BATCH PIPELINE XỬ LÝ VIỄN THÁM VỆ TINH            │
└───────────────────────────────────┬────────────────────────────────────┘
                                    │
       [Laravel Scheduler: Định kỳ 2 lần/tuần vào 02:00 sáng]
                                    │
                                    ▼
       [Dispatch Job: SyncSatelliteVegetationIndicesJob(puc_id)]
                                    │
                                    ▼
       [Worker gọi Copernicus Data Space Ecosystem (CDSE) REST API]
       - Truyền GeoJSON Polygon vùng trồng
       - Lọc dải ngày mây che phủ < 20%
                                    │
                                    ▼
       [Tính toán Thống kê Vùng (Zonal Statistics)]:
       - NDVI (min, mean, max, standard deviation)
       - NDWI (Chỉ số thiếu hụt nước tán lá)
       - Soil Moisture Index (Độ ẩm mặt đất)
                                    │
                                    ▼
       [Ghi dữ liệu vào PostgreSQL: Bảng `satellite_vegetation_indices`]
                                    │
                                    ▼
       [Frontend: FarmPlotDrawer gọi GET /plots/{id}/satellite-metrics]
       - Thời gian phản hồi sub-50ms (Truy vấn dữ liệu đã tính toán sẵn)
       - Hiển thị Biểu đồ Chuỗi thời gian NDVI & Bản đồ phân vùng màu
```

---

## 5.5. Dự toán Chi phí Vận hành & Lộ trình Tích hợp 2 Giai đoạn

### A. Dự toán Chi phí Nền tảng Viễn thám:
- **Copernicus Data Space Ecosystem (CDSE) / OpenEO API:** Hoàn toàn **miễn phí 100%** (Được tài trợ bởi Liên minh Châu Âu ESA, cung cấp đầy đủ dữ liệu ảnh Sentinel-1 và Sentinel-2).
- **Sentinel Hub API (Sinergise / Planet):** Gói Free Developer cung cấp $30.000\,\text{Processing Units/tháng}$ (đủ dùng cho 10–20 HTX); Gói Basic $29\,\text{EUR/tháng}$ (~780.000 VNĐ) phục vụ tới 100 HTX.
- **Google Earth Engine (GEE):** Miễn phí cho mục đích nghiên cứu và phi thương mại; gói thương mại qua Google Cloud Vertex AI ước tính $5 - 15\,\text{USD/tháng}$.
- **Tổng chi phí ước tính:** Dao động từ **0 đến 30 USD/tháng**, cực kỳ tiết kiệm và khả thi cho ngân sách của HTX.

### B. Lộ trình Phân kỳ Triển khai:
- **Giai đoạn 1 (Phase 1: GIS Polygon & Quản trị Ranh giới PUC - Ưu tiên P1):**
  1. Kích hoạt extension `postgis` trên PostgreSQL; bổ sung trường `boundary_polygon` (GeoJSON / PostGIS Geometry) vào bảng `production_units` và `farm_plots`.
  2. Nâng cấp `FarmPlotMapView.tsx` từ khung SVG tĩnh sang thư viện bản đồ số MapLibre GL JS / Leaflet với lớp nền ảnh vệ tinh Esri World Imagery miễn phí.
  3. Bổ sung công cụ số hóa ranh giới thửa đất bằng cách chấm điểm GPS thực địa trên bản đồ, tính toán diện tích tự động và chặn trùng lấn ranh giới (`ST_Overlaps`).
- **Giai đoạn 2 (Phase 2: Tích hợp Sentinel-2 NDVI & Radar SAR - Ưu tiên P2):**
  1. Đăng ký tài khoản API Copernicus CDSE; tạo bảng CSDL `satellite_vegetation_indices`.
  2. Xây dựng Laravel Artisan Command và Queue Job đồng bộ chỉ số viễn thám định kỳ 5 ngày/lần.
  3. Tích hợp biểu đồ chuỗi thời gian NDVI (NDVI Time-Series Chart) vào ngăn kéo xem chi tiết thửa đất (`FarmPlotDrawer.tsx`), kích hoạt thông báo cảnh báo khi chỉ số NDVI suy giảm bất thường $> 25\%$.

---

# PHẦN 6: LỘ TRÌNH ĐỒNG BỘ BACKEND, HỢP ĐỒNG DỮ LIỆU & MA TRẬN KIỂM THỬ (R5)

## 6.1. Danh mục Nhiệm vụ Kỹ thuật Cần Thực thi (Task Backlog: P0, P1, P2)

```
┌────────────────────────────────────────────────────────────────────────────────────────┐
│                        LỘ TRÌNH PHẪU THUẬT KỸ THUẬT (TASK BACKLOG)                     │
├──────────────────────────────┬────────────────────────────┬────────────────────────────┤
│ NHÓM P0 (KHẨN CẤP)           │ NHÓM P1 (HOÀN THIỆN)       │ NHÓM P2 (NÂNG CAO)         │
│ - Fix 4 test cases Quorum    │ - Đấu nối API Kho Minh     │ - Custom hook useDebounce  │
│ - Khắc phục FEFO hết hạn     │   chứng (Upload & Actions) │ - Đồng bộ Tenant động      │
│ - Xóa bỏ toàn bộ Silent      │ - Xóa bỏ Tính năng ma OCOP │ - API Verify Audit Hash    │
│   Mocking tại Runtime        │ - Bổ sung 3 endpoint Excel │ - Tích hợp GIS Polygon     │
│ - Chuẩn hóa Truthful States  │                            │                            │
└──────────────────────────────┴────────────────────────────┴────────────────────────────┘
```

### Nhóm P0 — Khẩn cấp & Bắt buộc (Tính Toàn vẹn Dữ liệu & Tuân thủ Tuyệt đối Quy tắc):
1. **Khắc phục 4 Ca Kiểm thử PHPUnit Thất bại:** Cập nhật fixture của 3 file test (`OcopEdgeCasesTest`, `OcopEvaluationTest`, `OcopAdversarialChallengeTest`) bổ sung giám khảo thứ 3 (`EVALUATOR_3`) để đạt Túc số Hội đồng Quorum $\ge 3$, đưa test suite đạt **100% PASS (199/199 tests)**.
2. **Loại bỏ Triệt để Silent Fallback Mocking:**
   - Sửa `services/ocopService.ts`: Bỏ khối `return MOCK_OCOP_DOSSIERS_FULL;` và `MOCK_EVIDENCES_FULL;`. Khi API trả về mảng rỗng `[]`, phải trả về đúng `[]` để UI kích hoạt Empty State chân thực.
   - Sửa `services/memberService.ts`: Xóa bỏ khối fallback `mockSurplusPlan` tại dòng 1245 và 1255; ném Exception để React Query bắt lỗi `isError`.
   - Sửa `ProfitPage.tsx`: Chuyển sang lấy dữ liệu thật từ `fetchSurplusPlansApi`, không khởi tạo state từ `mockSurplusPlan`.
3. **Xóa bỏ các Fallback Số tiền và Số sao Giả định:**
   - Sửa `ProductsPage.tsx:103`: Bỏ fallback `|| 4`, hiển thị đúng "Chưa phân hạng OCOP".
   - Sửa `voucherDocumentGenerator.ts:32, 151, 234`: Bỏ fallback `|| 10000000`, hiển thị đúng số tiền thực nộp.
   - Sửa `DashboardOcopBreakdown.tsx:53`: Sửa `'1 hồ sơ'` thành `'0 hồ sơ'`.
4. **Khắc phục Lỗ hổng FEFO trong `StockIssueService.php`:** Bổ sung điều kiện chặn xuất kho các lô vật tư đã quá hạn (`expired_at < now()`), ném ngoại lệ `ERR_MATERIAL_BATCH_EXPIRED` (HTTP 422), đảm bảo lô hết hạn không bị xếp ưu tiên xuất cho xã viên.

### Nhóm P1 — Hoàn thiện Tính năng & Khắc phục Khoảng cách Hợp đồng:
1. **Đấu nối API Thật cho Kho Minh Chứng Số (`EvidencesPage.tsx` & `AddEvidenceModal.tsx`):**
   - Thay thế các lệnh `alert()` bằng các hàm gọi API thật: `GET /api/v1/ocop/evidences/{id}/download`, `POST /ocop/evidences/{id}/versions`, `POST /ocop/evidences/{id}/links`.
   - Viết logic mutation upload multipart/form-data trong `AddEvidenceModal.tsx`, tính mã băm SHA-256 thật.
2. **Xóa bỏ Tính năng Ma tại Trang Báo cáo OCOP (`OcopReportsPage.tsx`):**
   - Đấu nối vào API `ReportController` (`/reports/dashboard` hoặc `/reports/ocop-readiness`), tính toán tỷ lệ thật từ database.
3. **Bổ sung 3 Endpoint Xuất Excel Phía Backend (`ReportController.php`):**
   - `exportReceivablesPayables`: Báo cáo tuổi nợ 5 dải và chi tiết công nợ xã viên.
   - `exportInventoryStock`: Báo cáo tồn kho vật tư và hạn dùng lô FEFO.
   - `exportFarmingLogs`: Nhật ký canh tác VietGAP 10 trường quy chuẩn.
4. **Đồng bộ Mã Vai trò và Trạng thái trong Queue Jobs Backend:**
   - Sửa các job tại `Modules/Notification/Application/Jobs/` từ `'DIRECTOR'`/`'WAREHOUSE'` sang `'HTX_OWNER'`/`'STOREKEEPER'`.
   - Sửa trạng thái xã viên trong `CheckOverdueCapitalJob.php:23` từ `'DANG_HOAT_DONG'` sang `'ACTIVE'`.

### Nhóm P2 — Tối ưu Hiệu năng, Trải nghiệm & Nâng cấp Mở rộng:
1. **Xây dựng Custom Hook `useDebounce`:**
   - Tạo `frontend/src/hooks/useDebounce.ts` (delay $350\,\text{ms}$) và tích hợp đồng loạt vào các thanh tìm kiếm tại `FarmingLogsPage`, `CropSeasonsTable`, `FarmPlotsFullTable`, `MembersTable`, `EvidencesTable`.
2. **Đồng bộ Ngữ cảnh HTX Động (Tenant Dynamic Display):**
   - Rà soát 18 tệp nguồn, thay thế chuỗi viết cứng `'HTX Tân Tiến'` bằng `activeCooperative?.legal_name || 'Hợp tác xã'` từ `useTenantContextStore`.
3. **Nâng cấp An toàn Chuỗi Băm Kiểm toán SHA-256:**
   - Thêm cơ chế đồng bộ transaction lock hoặc hàng đợi ghi tuần tự khi ghi nhận `audit_events` để chống phân nhánh chuỗi băm khi có thao tác đồng thời.
   - Xây dựng API `GET /api/v1/audit-logs/verify-chain` kiểm tra tính toàn vẹn của chuỗi băm từ block genesis đến block hiện tại.
4. **Triển khai Giai đoạn 1 Module Viễn thám GIS:**
   - Kích hoạt `postgis`, nâng cấp bản đồ `FarmPlotMapView.tsx` sang MapLibre GL JS với nền vệ tinh Esri Imagery và công cụ vẽ đa giác thửa đất.

---

## 6.2. Kế hoạch Khắc phục 4 Ca Kiểm thử PHPUnit Thất bại (Quorum $\ge 3$)

Khảo sát của `explorer_backend_3` đã xác định chính xác nguyên nhân của 4 ca fail trong tổng số 199 tests:
- **Căn cứ pháp lý:** Quyết định 148/QĐ-TTg và QĐ 1489/QĐ-TTg quy định phiên họp tổng hợp đánh giá của Hội đồng OCOP cấp huyện/tỉnh bắt buộc phải có tối thiểu **03 thành viên chuyên môn** tham gia chấm điểm độc lập.
- **Mã nguồn thực thi:** `EvaluationConsolidationService.php` ném ngoại lệ:
  ```
  DomainException: Hội đồng đánh giá OCOP cần tối thiểu 3 thành viên tham gia để đạt túc số (Quorum requirement) trước khi tổng hợp kết quả (hiện chỉ có 2 giám khảo)
  ```
- **Phương án khắc phục:**
  1. Trong `Tests\Feature\OcopEdgeCasesTest::edge_case_2_discrepancy_calculated_when_self_assessment_differs_from_evaluator`:
     Bổ sung tạo tài khoản `$evaluator3 = $this->createEvaluatorUser($coop);` và gọi `$this->assignEvaluator($session, $evaluator3);` cùng payload chấm điểm của `$evaluator3`.
  2. Trong `Tests\Feature\OcopEvaluationTest::test_consolidation_average_calculation_and_discrepancy_flag`:
     Bổ sung `$evaluator3` tương tự.
  3. Trong `Tests\Feature\OcopEvaluationTest::test_star_limit_downgrade_algorithm_when_mandatory_indicator_zero`:
     Bổ sung `$evaluator3` tương tự.
  4. Trong `Tests\Feature\Ocop\OcopAdversarialChallengeTest::test_challenge_council_consolidation_downgrades_when_vietgap_fails`:
     Bổ sung thêm 2 giám khảo để đủ 3 thành viên.

Sau khi cập nhật fixture, test suite Backend sẽ đạt **100% GREEN (199/199 tests pass)**.

---

## 6.3. Ma trận Kiểm thử Toàn diện Tự động (PHPUnit & Playwright E2E Edge Cases)

Để đảm bảo hệ thống vận hành bền bỉ, ma trận kiểm thử được xây dựng bao quát cả kiểm thử đơn vị, kiểm thử tích hợp và kiểm thử giao diện đầu cuối (E2E):

| STT | Mã Kịch Bản Kiểm Thử | Tầng Kiểm Thử | Phân Hệ Nghiệp Vụ | Ca Biên / Tình Huống Giả Định (Edge Cases & Attacks) | Kết Quả Kỳ Vọng (Expected Outcome) |
| :---: | :--- | :---: | :--- | :--- | :--- |
| **TC-01** | `SEC_TENANT_TAMPER` | Backend Integration | Identity / Cooperative | Tài khoản thuộc HTX A gửi request với Header `X-Cooperative-ID` của HTX B | Chặn đứng với HTTP 403 `UNAUTHORIZED_TENANT_ACCESS`, ghi log `SECURITY_ALERT_TENANT_TAMPERING`. |
| **TC-02** | `SEC_SOD_APPROVE` | Backend Integration | Identity / Finance | Kế toán viên gửi request tự phê duyệt phiếu chi do chính mình lập | Chặn đứng với HTTP 403 `ERR_SOD_VIOLATION_SELF_APPROVAL`. |
| **TC-03** | `AGRI_PHI_VIOLATION` | Backend & E2E | Agriculture / Harvest | Tạo lệnh thu hoạch khi thửa đất chưa hết hạn cách ly an toàn (`harvest_date < safe_harvest_date`) | Backend chặn 100% với mã `ERR_HARVEST_PHI_VIOLATION`; UI hiển thị Error Toast đỏ kèm đồng hồ đếm ngược. |
| **TC-04** | `INV_FEFO_EXPIRED` | Backend Integration | Inventory | Lập phiếu xuất kho vật tư chứa lô hàng có `expired_at < CURRENT_DATE` | Chặn đứng với HTTP 422 `ERR_MATERIAL_BATCH_EXPIRED`, không cho phép xuất kho nợ. |
| **TC-05** | `INV_CREDIT_LIMIT` | Backend Integration | Inventory / Finance | Xuất nợ vật tư đầu vụ cho xã viên có tổng dư nợ vượt trần `credit_limit` | Chặn đứng với HTTP 422 `ERR_MEMBER_CREDIT_LIMIT_EXCEEDED`, yêu cầu Giám đốc duyệt ngoại lệ. |
| **TC-06** | `FIN_OVER_SETTLE` | Backend Concurrency | Finance | 2 kế toán viên cùng bấm thanh toán đồng thời cho một khoản nợ $50.000.000\,\text{đ}$ | Nhờ `lockForUpdate()`, request thứ nhất thành công, request thứ hai trả về `OVER_SETTLEMENT_VIOLATION` (khớp với `ReceivablePayable.php:40`). |
| **TC-07** | `FIN_SURPLUS_DIV_50` | Backend Integration | Finance | Lập phương án phân chia thặng dư với tỷ lệ dịch vụ $< 50\%$ (ví dụ $40\%$) | Chặn đứng với HTTP 422 `ERR_SURPLUS_SERVICE_RATIO_BELOW_MINIMUM` theo Điều 85 Luật HTX 2023. |
| **TC-08** | `OCOP_COUNCIL_QUORUM`| Backend Integration | Ocop Evaluation | Phiên tổng hợp kết quả Hội đồng OCOP chỉ có 2 giám khảo tham gia chấm điểm | Chặn đứng với `DomainException: Hội đồng cần tối thiểu 3 thành viên tham gia để đạt túc số`. |
| **TC-09** | `OCOP_DOWNGRADE_MAND`| Backend Integration | Ocop Evaluation | Hồ sơ đạt 85 điểm (ngưỡng 4 sao) nhưng chỉ tiêu bắt buộc VietGAP bị điểm 0 | Tự động hạ phân hạng xuống 2 sao theo quy tắc điều kiện khống chế QĐ 148/QĐ-TTg. |
| **TC-10** | `TRACE_PUBLIC_BYPASS`| E2E Playwright | Agriculture / Traceability | Người tiêu dùng mở URL `/public/trace/LOT-TT-PLOT01-20261020-001` không có token | Hiển thị đầy đủ thông tin sản phẩm OCOP 4 sao, 5 chặng canh tác, tem GS1, không chuyển hướng Login. |
| **TC-11** | `UI_IDEMPOTENCY_DBL` | E2E Playwright | Finance / UI | Nông dân/Kế toán click 5 lần liên tiếp vào nút "Ghi Sổ Quỹ" trong 300ms | Chỉ có 1 giao dịch được tạo trong database nhờ `Idempotency-Key` và trạng thái `disabled={loading}`. |
| **TC-12** | `UI_EMPTY_RESET_BTN` | E2E Playwright | Agriculture / UI | Gõ chuỗi tìm kiếm không tồn tại `XYZ999` trên bảng Thửa đất, sau đó bấm "Đặt lại bộ lọc" | Bảng hiển thị Empty State kèm nút 1 chạm; click nút lập tức xóa từ khóa và nạp lại toàn bộ dữ liệu. |

---

# PHẦN 7: PHƯƠNG PHÁP XÁC MINH ĐỘC LẬP & KẾT LUẬN NGHIỆM THU

## 7.1. Quy trình Thực thi Kiểm chứng Độc lập Từng Phân hệ

Bất kỳ Kỹ sư, Chuyên gia Kiểm toán hoặc Giám định viên độc lập nào tiếp nhận bàn giao đều có thể kiểm chứng toàn bộ các luận điểm và kết quả trong Báo cáo Thiết kế này theo 5 bước tiêu chuẩn:

### Bước 1: Kiểm chứng CSDL PostgreSQL & 65 Bảng Nghiệp vụ
```bash
cd backend
php artisan test --filter=DatabaseSchemaTest
```
*Tiêu chí đánh giá:* 1 test pass, xác nhận toàn bộ 65 bảng dữ liệu quan hệ, khóa chính UUID và khóa ngoại được ánh xạ đầy đủ theo đúng hợp đồng CSDL.

### Bước 2: Kiểm chứng Phân tách Trách nhiệm (SoD) & Cô lập Tenant
```bash
cd backend
php artisan test --filter=RolePersonaAuthorizationTest
```
*Tiêu chí đánh giá:* 6/6 tests pass, chứng minh Kế toán không thể tự duyệt chi, Thủ kho không thể can thiệp sổ quỹ, và tài khoản HTX khác bị chặn 100%.

### Bước 3: Kiểm chứng An toàn PHI Guard & Mã Lô GS1 Traceability
```bash
cd backend
php artisan test --filter=AgricultureChallengerAdversarialTest
php artisan test --filter=AgricultureE2ETest
```
*Tiêu chí đánh giá:* 38/38 tests pass, chứng minh lệnh thu hoạch vi phạm ngày cách ly an toàn PHI bị chặn tuyệt đối (`ERR_HARVEST_PHI_VIOLATION`), quy trình KCS 3 cấp và định danh GS1 hoạt động chính xác.

### Bước 4: Kiểm chứng Nghiệp vụ Tài chính & Luật HTX 2023
```bash
cd backend
php artisan test --filter=FinanceManagementTest
```
*Tiêu chí đánh giá:* 9/9 tests pass, chứng minh công thức cấn trừ công nợ mùa vụ $Fee = 2.5\%$ chính xác và phân chia thặng dư tuân thủ chặt chẽ Điều 84 và Điều 85 Luật HTX 2023.

### Bước 5: Kiểm tra Toàn bộ Test Suite Backend Hiện tại
```bash
cd backend
php artisan test
```
*Kỳ vọng thực tế:* 195 passed, 4 failed (4 tests fail đều trả về thông báo vi phạm túc số Hội đồng Quorum $\ge 3$ như đã phân tích tại Phần 6.2).

### Bước 6: Kiểm tra Biên dịch Giao diện Frontend
```bash
cd frontend
npm run build
npm run lint
```
*Kỳ vọng thực tế:* Biên dịch TypeScript và đóng gói Vite thành công, không phát sinh lỗi cú pháp hay gãy vỡ thư viện.

---

## 7.2. Cam kết Liêm chính Kỹ thuật & Tuyên bố Bàn giao

Báo cáo Thiết kế Kiến trúc này được lập dựa trên **nguyên tắc liêm chính kỹ thuật tuyệt đối**:
- Không sử dụng kết quả giả lập hay làm sai lệch sự thật hiện trạng.
- Mọi nhận định, đánh giá và đề xuất đều được dẫn chiếu trực tiếp từ số dòng mã nguồn, tên tệp tin, endpoint API và các điều khoản pháp luật hiện hành.
- Tài liệu này đóng vai trò là **Kim chỉ nam Kiến trúc (Architectural Blueprint)** làm căn cứ pháp lý và kỹ thuật cho các kỹ sư, chuyên gia triển khai thực hiện các đợt cập nhật mã nguồn có kiểm soát, bảo vệ an toàn cho hệ sinh thái HTX-OCOP.

---
*Bản quyền tài liệu thuộc Dự án Hệ thống Quản trị HTX Nông nghiệp & Số hóa Hồ sơ OCOP (HTX-OCOP).*  
*Lưu trữ chính thức tại: `f:/HTX_OCOP_PROJECT/docs/BAO_CAO_DANH_GIA_VA_THIET_KE_KIEN_TRUC_HTX_OCOP.md`.*
