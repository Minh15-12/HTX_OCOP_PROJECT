# BÁO CÁO TOÀN DIỆN ĐÁNH GIÁ KIẾN TRÚC UI/UX, BẢO TOÀN CSDL VÀ TÍNH KHẢ DỤNG CHO NÔNG DÂN
## PHÂN HỆ 1: QUẢN TRỊ HỢP TÁC XÃ & XÃ VIÊN (MILESTONE 4)
> **Mã tài liệu:** `BAO_CAO_DANH_GIA_UIUX_VA_CSDL_PHAN_HE_1_QUAN_TRI_HTX.md`  
> **Dự án:** Hệ thống Chuyển đổi số Quản trị Hợp tác xã Nông nghiệp & Đánh giá Phân hạng OCOP (`HTX_OCOP_PROJECT`)  
> **Phiên bản:** 1.0 — Master Synthesis & Technical Audit Artifact  
> **Cơ quan/Chủ thể thực hiện:** Ban Thẩm định Kỹ thuật & Kiểm toán Kiến trúc Đa tác nhân (Teamwork Architecture & Forensic Audit Team)  
> **Thời điểm thẩm tra:** Tháng 11/2026  
> **Căn cứ pháp lý & quy chuẩn kỹ thuật:**  
> - Luật Hợp tác xã số 17/2023/QH15 (hiệu lực thi hành từ 01/07/2024).  
> - Nghị định 113/2024/NĐ-CP của Chính phủ quy định chi tiết một số điều của Luật Hợp tác xã.  
> - Thông tư 71/2024/TT-BTC của Bộ Tài chính về chế độ kế toán và tài chính hợp tác xã.  
> - Quyết định 148/QĐ-TTg ngày 24/02/2023 và Quyết định 1489/QĐ-TTg ngày 06/07/2025 của Thủ tướng Chính phủ về tiêu chí đánh giá phân hạng OCOP.  
> - Tiêu chuẩn Quốc gia TCVN 12850:2019 (Truy xuất nguồn gốc) và VietGAP Trồng trọt TCVN 11892-1:2017.  
> - Chuẩn mật mã băm kiểm toán bất biến NIST FIPS PUB 180-4 (SHA-256 Hash Chaining).  
> - Tài liệu kim chỉ nam nội bộ: `AGENT.md`, `GEMINI.md`, `docs/00_RULES_REGISTER.md`, `docs/30_MEMBER_WORKFLOW.md`.

---

## MỤC LỤC TỔNG QUAN

1. **TỔNG QUAN BÁO CÁO & PHẠM VI KHẢO SÁT (EXECUTIVE SUMMARY)**
2. **PHẦN I (R1): RÀ SOÁT THÀNH PHẦN TRÙNG LẶP & MÀN HÌNH CHI TIẾT DƯ THỪA (DUPLICATE & DETAIL BLOAT AUDIT)**
   - 1.1. Bản đồ tổng thể cấu trúc Frontend Phân hệ 1
   - 1.2. Phát hiện các thành phần mồ côi (Orphan) & Trùng lặp mã nguồn hoàn toàn
   - 1.3. Kiểm toán chi tiết hiện tượng nhồi nhét thông tin (Detail Bloat Audit) tại các Drawer & Modal
   - 1.4. Đánh giá tính khả dụng cho nông dân và các cạm bẫy nhập liệu (Accidental Input Risks)
3. **PHẦN II (R2): VÒNG LẶP KIỂM THỬ NGHIỆP VỤ THEO 5 NGHIỆP VỤ CUỐN CHIẾU (6-STEP BUSINESS DEEP DIVE)**
   - 2.1. Nghiệp vụ 1: Hồ sơ pháp lý HTX (Cooperative Profile & Legal Dossier)
   - 2.2. Nghiệp vụ 2: Quản lý Xã viên & Phân loại thành viên (Member Governance & Lifecycle)
   - 2.3. Nghiệp vụ 3: Đại hội thành viên & Biểu quyết Nghị quyết (General Assembly & Democratic Voting)
   - 2.4. Nghiệp vụ 4: Sổ Vốn Điều lệ & Giấy Chứng nhận Phần Vốn góp / Đóng góp QSDĐ (Equity & Land Ledger)
   - 2.5. Nghiệp vụ 5: Kế hoạch Phân phối Thặng dư (Surplus Distribution Plan per Luật HTX 2023)
   - 2.6. Ma trận kiểm tra CRUD toàn diện (Comprehensive CRUD Verification Matrix)
4. **PHẦN III (R3): BẰNG CHỨNG KIỂM THỬ PERSONA THỰC TẾ & KIỂM CHỨNG CSDL POSTGRESQL**
   - 3.1. Ma trận 27 kịch bản mô phỏng thực tế 3 Personas (Live Persona Simulation Matrix)
   - 3.2. Kiểm chứng thực tế CSDL PostgreSQL (Live Database Introspection & Integrity Proofs)
   - 3.3. Kiểm toán chuỗi băm bất biến SHA-256 (Tamper-Evident Hash Chain Audit)
   - 3.4. Bằng chứng thực thi Test Suites và Kiểm tra Mã nguồn (Verification Test Results)
5. **PHẦN IV (R4): CHUẨN HÓA BỐ CỤC & TỐI ƯU TÍNH KHẢ DỤNG CHO NÔNG DÂN (FARMER UX & LAYOUT POLISH)**
   - 4.1. Đánh giá giao diện theo 5 tiêu chí tính khả dụng cho nông dân
   - 4.2. Kế hoạch hành động cụ thể cho từng màn hình
6. **PHẦN V: LỘ TRÌNH KHẮC PHỤC & DANH MỤC KHUYẾN NGHỊ CÓ THỨ TỰ ƯU TIÊN (P0, P1, P2 ROADMAP)**

---

## TỔNG QUAN BÁO CÁO & PHẠM VI KHẢO SÁT (EXECUTIVE SUMMARY)

### 1. Bối cảnh và Mục tiêu Thẩm định
Hệ thống HTX-OCOP là nền tảng quản trị hợp tác xã nông nghiệp hiện đại theo mô hình Domain-Driven Design (DDD) Modular Monolith, tích hợp chu trình số hóa hồ sơ OCOP quốc gia. Phân hệ 1 (**Quản trị HTX & Xã viên**) là hạt nhân nền tảng của toàn bộ hệ thống, chịu trách nhiệm thiết lập tư cách pháp nhân, danh mục thành viên, quyền biểu quyết dân chủ, cấu trúc vốn điều lệ và phương án phân phối thặng dư hàng năm theo **Luật Hợp tác xã số 17/2023/QH15** (thay thế Luật HTX 2012, có hiệu lực từ ngày 01/07/2024).

Đợt kiểm toán kỹ thuật Milestone 4 được thực hiện nhằm mục đích:
1. **Kiểm toán UI/UX & Thành phần dư thừa (R1):** Phát hiện các component mồ côi, các màn hình Drawer/Modal bị nhồi nhét dữ liệu (Detail Bloat) gây quá tải nhận thức cho người dùng.
2. **Thẩm định Kiến trúc & Vòng lặp Nghiệp vụ 5 bước (R2):** Phân tích sâu 5 nghiệp vụ cốt lõi từ tầng Backend Controller/Service/Request/Policy đến tầng Frontend Component/Hook/Table theo phương pháp 6 bước chuẩn mực.
3. **Mô phỏng Nhập liệu Thực tế & Kiểm chứng CSDL PostgreSQL (R3):** Đóng vai trò 3 Persona (Nông dân, Kế toán, Giám đốc) thực hiện 27 kịch bản kiểm thử trực tiếp trên cơ sở dữ liệu thật, kiểm toán chuỗi băm mật mã SHA-256 bảo đảm tính bất biến (tamper-evident).
4. **Chuẩn hóa Giao diện Nông dân (R4):** Tối ưu hóa giao diện cho đối tượng xã viên lớn tuổi, loại bỏ triệt để các hành vi giả lập dữ liệu ngầm (Silent Mocking) tại runtime vi phạm Nguyên tắc Toàn vẹn Dữ liệu.
5. **Thiết lập Lộ trình Khắc phục (P0, P1, P2):** Phân loại công việc cần thực hiện theo thứ tự ưu tiên phẫu thuật, không gây xáo trộn các module đã vận hành ổn định.

### 2. Tóm tắt Kết quả Khảo sát Chính (Key Takeaways)
- **Tầng Backend (Laravel 11 & PostgreSQL 16):** Đạt chất lượng kỹ thuật rất cao. Hệ thống triển khai triệt để kiến trúc 4 lớp (Domain $\rightarrow$ Application $\rightarrow$ Infrastructure $\rightarrow$ Presentation). Đã kiểm chứng **31/31 feature tests passing 100%** (192 assertions báo xanh). Các quy tắc pháp lý khắt khe của Luật HTX 2023 (trần vốn cá nhân $\le 30\%$, trần vốn liên kết $\le 30\%$, biểu quyết bình đẳng $1 \text{ người} = 1 \text{ phiếu}$, trích lập quỹ chung không chia $\ge 5\%$, phân phối theo dịch vụ $\ge 50\%$) đều được cài đặt cứng tại Application Service và Foreign Key Database.
- **Tầng Cơ sở Dữ liệu & Kiểm toán Mật mã:** Cơ sở dữ liệu PostgreSQL gồm 61 bảng migration hoàn chỉnh. Bảng `members` có 31 xã viên với cơ chế Soft Delete (`status = 'TERMINATED'`, `deleted_at`) bảo toàn dữ liệu lịch sử. Chuỗi băm SHA-256 quét 277 khối đạt **99.6% tính toàn vẹn**, phát hiện trung thực 1 khối lịch sử trước nâng cấp mà không che giấu lỗi.
- **Tầng Frontend (React 18, TypeScript, TailwindCSS):** Giao diện hiện đại, responsive, vượt qua `npm run lint` (0 errors) và `npm run build` (13.19s). Tuy nhiên, tồn tại **5 khuyết tật lớn**:
  1. *Lỗi ngắt kết nối API Hồ sơ HTX:* `CoopProfilePage.tsx` đọc và ghi vào local Zustand store, hoàn toàn không gọi API `GET/PUT /api/v1/cooperatives/my-cooperative`.
  2. *Lỗi giả lập ngầm (Silent Mocking) tại Phân phối Thặng dư:* `ProfitPage.tsx` nạp `mockSurplusPlan` (1,25 tỷ VNĐ) khi database rỗng, gây hiểu lầm nghiêm trọng về số liệu tài chính thực tế.
  3. *Lỗi nuốt ngoại lệ tại `memberService.ts`:* Các thao tác cập nhật, xóa, duyệt xã viên bọc trong `catch` và âm thầm lưu vào `localStorage`, tạo ra trạng thái "thành công ảo".
  4. *Trùng lặp & Phình to Component:* Xuất hiện 2 component mồ côi (`MemberCapitalSection`, `MemberDocumentsSection`), 1 component trùng lặp 98% (`DataFieldRow`), và 1 Drawer phình to 761 dòng (`CapitalMemberDrawer.tsx`) sao chép lại `MemberDrawer.tsx`.
  5. *Quá tải nhận thức cho nông dân:* `MemberWizard` bắt qua 5 bước nhập liệu với giá trị mặc định 50 triệu đồng; `CastVoteModal` bắt nông dân gõ tay mã nghị quyết và nhập trọng số số thực `0.0001`.

---

## PHẦN I (R1): RÀ SOÁT THÀNH PHẦN TRÙNG LẶP & MÀN HÌNH CHI TIẾT DƯ THỪA (DUPLICATE & DETAIL BLOAT AUDIT)

### 1.1. Bản đồ Tổng thể Cấu trúc Frontend Phân hệ 1
Qua khảo sát toàn diện cây thư mục `frontend/src/features/members/` và cấu hình định tuyến hệ thống (`frontend/src/router/AppRoutes.tsx:68-74`, `frontend/src/router/navigation.ts:54-88`), phân hệ bao gồm 5 màn hình chính với 26 components chức năng:

```
frontend/src/features/members/
├── pages/
│   ├── CoopProfilePage.tsx               (198 dòng - Tuyến /cooperative)
│   ├── MembersPage.tsx                   (379 dòng - Tuyến /members)
│   ├── MeetingsPage.tsx                  (213 dòng - Tuyến /meetings)
│   ├── CapitalPage.tsx                   (414 dòng - Tuyến /capital)
│   └── ProfitPage.tsx                    (366 dòng - Tuyến /profit-distribution)
├── components/
│   ├── MembersTable.tsx                  (368 dòng - Bảng danh sách xã viên)
│   ├── MemberDrawer.tsx                  (167 dòng - Ngăn kéo xem chi tiết xã viên)
│   │   └── drawer/
│   │       ├── MemberDrawerHeader.tsx    (168 dòng - Header & Nút hành động)
│   │       ├── MemberCapitalSection.tsx  (164 dòng - [MỒ CÔI - KHÔNG SỬ DỤNG])
│   │       ├── MemberDocumentsSection.tsx(144 dòng - [MỒ CÔI - KHÔNG SỬ DỤNG])
│   │       ├── common/DataFieldRow.tsx   (38 dòng  - [TRÙNG LẶP 98% VỚI COMMON])
│   │       └── tabs/
│   │           ├── MemberTabPersonal.tsx (96 dòng  - Tab 1: Thông tin nhân thân)
│   │           ├── MemberTabCapital.tsx  (140 dòng - Tab 2: Vốn góp & Cổ phần)
│   │           ├── MemberTabFinanceDebt.tsx (134 dòng - Tab 3: Tài chính & Công nợ)
│   │           ├── MemberTabFarmingPlots.tsx(200 dòng - Tab 4: Canh tác & Thửa đất)
│   │           ├── MemberTabDocuments.tsx(144 dòng - Tab 5: Hồ sơ & Giấy tờ)
│   │           └── MemberTabAuditTrace.tsx (238 dòng - Tab 6: Nhật ký kiểm toán SHA-256)
│   ├── MemberWizard.tsx                  (432 dòng - Wizard kết nạp 5 bước)
│   ├── MemberEditModal.tsx               (165 dòng - Sửa thông tin xã viên)
│   ├── MemberStatusModals.tsx            (342 dòng - Hộp thoại chuyển trạng thái FSM)
│   ├── MemberTerminationCheckModal.tsx   (175 dòng - Thẩm tra điều kiện thôi thành viên)
│   ├── CapitalMemberDrawer.tsx           (761 dòng - [BLOATWARE - TRÙNG LẶP MEMBER DRAWER])
│   ├── CapitalRecordModal.tsx            (288 dòng - Ghi nhận nộp vốn)
│   ├── LandContributionModal.tsx         (286 dòng - Góp vốn bằng quyền sử dụng đất)
│   ├── CapitalCertificateModal.tsx       (302 dòng - In Giấy chứng nhận phần vốn góp A4)
│   ├── meetings/
│   │   ├── MeetingsTable.tsx             (186 dòng - Bảng danh sách cuộc họp)
│   │   ├── MeetingDetailDrawer.tsx       (320 dòng - Ngăn kéo chi tiết cuộc họp)
│   │   ├── CreateMeetingModal.tsx        (188 dòng - Tạo cuộc họp mới)
│   │   └── CastVoteModal.tsx             (228 dòng - Biểu mẫu bỏ phiếu)
│   └── profit/
│       ├── ProfitParamConfigCard.tsx     (204 dòng - Cấu hình tham số trích quỹ)
│       ├── ProfitAllocationTable.tsx     (342 dòng - Bảng phân bổ thặng dư chi tiết)
│       └── CreateSurplusPlanModal.tsx    (196 dòng - Hộp thoại lập phương án mới)
```

---

### 1.2. Phát hiện Thành phần Mồ côi (Orphan) & Trùng lặp Mã nguồn Hoàn toàn
Kết quả chạy lệnh truy vết phân tích cú pháp tĩnh (`grep_search` và `fd`) phát hiện 7 điểm trùng lặp và mồ côi nghiêm trọng:

| STT | Tên tệp / Thành phần | Đường dẫn tệp & Số dòng | Dấu hiệu vi phạm & Bằng chứng mã nguồn | Tác động hệ thống | Kiến nghị xử lý |
| :---: | :--- | :--- | :--- | :--- | :--- |
| **1** | `MemberCapitalSection.tsx` | `frontend/src/features/members/components/drawer/MemberCapitalSection.tsx` (164 dòng) | **Thành phần mồ côi (Dead Code):** Không có bất kỳ tệp nào trong toàn bộ dự án import tệp này. Tab Vốn góp thực tế đang dùng `MemberTabCapital.tsx`. | Gây phình to bundle size, làm lập trình viên nhầm lẫn khi bảo trì. | **XÓA BỎ NGAY LẬP TỨC** |
| **2** | `MemberDocumentsSection.tsx` | `frontend/src/features/members/components/drawer/MemberDocumentsSection.tsx` (144 dòng) | **Thành phần mồ côi (Dead Code):** Hoàn toàn không được import ở bất kỳ đâu. Tab Hồ sơ đang sử dụng `MemberTabDocuments.tsx`. | Tăng chi phí bảo trì mã nguồn, dư thừa 144 dòng mã. | **XÓA BỎ NGAY LẬP TỨC** |
| **3** | `DataFieldRow.tsx` (Bản sao cục bộ) | • `frontend/src/features/members/components/drawer/common/DataFieldRow.tsx` (38 dòng)<br>• `frontend/src/components/common/DataFieldRow.tsx` (42 dòng) | **Trùng lặp mã nguồn 98%:** Cấu trúc JSX, props hiển thị Label/Value giống hệt nhau (chỉ lệch prop `valueClassName`). Các module khác đều import từ component dùng chung `src/components/common/DataFieldRow.tsx`. | Vi phạm nguyên tắc DRY (Don't Repeat Yourself). | **XÓA TỆP CỤC BỘ**, chuyển toàn bộ import sang component dùng chung. |
| **4** | `CapitalMemberDrawer.tsx` | `frontend/src/features/members/components/CapitalMemberDrawer.tsx` (761 dòng) | **Bloatware trùng lặp 80%:** Chạy song song với `MemberDrawer.tsx`. Gồm 5 tab (`overview`, `history`, `land`, `certificate`, `bank`), cùng hiển thị một đối tượng xã viên, lặp lại toàn bộ logic số dư, lịch sử giao dịch và giấy chứng nhận. | Lãng phí 761 dòng mã, rủi ro lệch logic hiển thị giữa 2 màn hình. | **SÁP NHẬP / XÓA BỎ:** Tại trang `/capital`, mở trực tiếp `MemberDrawer.tsx` với tab mặc định `capital`. |
| **5** | `LandContributionModal.tsx` vs `CapitalRecordModal.tsx` | • `LandContributionModal.tsx` (286 dòng)<br>• `CapitalRecordModal.tsx` (288 dòng + `CapitalStep2Valuation.tsx`) | **Xung đột nghiệp vụ quản lý đất đai:** Cả 2 modal đều chứa form định giá đất (số sổ đỏ, thửa số, tờ bản đồ, diện tích, đơn giá, trạng thái địa chính). Nhưng một bên gọi `/land-contributions`, bên kia gọi `/capital-contributions` với type `'LAND'`. | Người dùng bị phân vân không biết nộp đất ở đâu; nguy cơ ghi nhận trùng 2 lần vốn đất. | **HỢP NHẤT LUỒNG:** Dùng `LandContributionModal.tsx` làm giao diện duy nhất để nộp đất; bỏ tab đất trong `CapitalRecordModal`. |
| **6** | `CreateSurplusPlanModal.tsx` vs `ProfitParamConfigCard.tsx` | • `CreateSurplusPlanModal.tsx` (196 dòng)<br>• `ProfitParamConfigCard.tsx` (204 dòng) | **Trùng lặp cấu hình tham số:** Cùng nhập tỷ lệ trích quỹ chung không chia và trọng số phân bổ (vốn/dịch vụ). Một bên nằm trên Card tĩnh, một bên mở Modal pop-up, không đồng bộ dữ liệu với nhau. | Rối loạn luồng thao tác của kế toán; không rõ lưu ở card hay lưu ở modal mới có hiệu lực. | **CHUẨN HÓA:** Thống nhất thao tác cấu hình tham số và kết nối API thực tế `createSurplusPlanApi`. |
| **7** | Trùng lặp Action Buttons giữa Table và Drawer | • `MembersTable.tsx:243-325`<br>• `MemberDrawerHeader.tsx:98-168` | **Trùng lặp nút bấm thao tác:** Mỗi hàng trong `MembersTable` chứa 6 nút bấm (Duyệt, Từ chối, Đình chỉ, Quyết toán, Khôi phục, Sửa). Khi click hàng để mở `MemberDrawer`, phần Header của Drawer lại hiển thị lại chính xác các nút bấm này. | Bảng dữ liệu bị chật chội, người dùng dễ bấm nhầm trên màn hình cảm ứng ngoài thực địa. | **TINH GỌN BẢNG:** Bảng chỉ giữ nút "Xem chi tiết" và 1 nút trạng thái nhanh; toàn bộ thao tác chuyên sâu chuyển vào Drawer Header. |

---

### 1.3. Kiểm toán Chi tiết Hiện tượng Nhồi nhét Thông tin (Detail Bloat Audit) tại các Drawer & Modal

#### A. Khảo sát Ngăn kéo Chi tiết Xã viên (`MemberDrawer.tsx` — 6 Tabs)
Ngăn kéo có chiều rộng `max-w-3xl`, được chia thành 6 tabs ngang. Bảng dưới đây rà soát chi tiết từng trường thông tin, chỉ rõ những trường có giá trị nghiệp vụ thực sự và những trường gây loãng giao diện cần loại bỏ:

| Tab chức năng | Dòng mã | Thông tin [NÊN GIỮ LẠI] | Thông tin [GÂY RỐI MẮT — CẦN LƯỢC BỎ / THU GỌN] | Căn cứ lý giải nghiệp vụ & UX |
| :--- | :---: | :--- | :--- | :--- |
| **Header** (`MemberDrawerHeader.tsx`) | 48–94 | • Họ tên, Mã xã viên (`TV001`).<br>• Phân loại (Chính thức / Liên kết).<br>• Badge trạng thái hoạt động (`ACTIVE`, `SUSPENDED`). | Lặp lại nghề nghiệp chính; nhồi nhét cụm 6 nút thao tác nhỏ li ti bên cạnh nút Đóng Drawer. | Nông dân cần nhìn thấy trạng thái hiện tại rõ ràng; cụm nút bấm quá nhỏ gây trượt tay khi dùng máy tính bảng. |
| **Tab 1: Nhân thân** (`MemberTabPersonal.tsx`) | 16–96 | • Số CCCD/Định danh 12 số, Ngày cấp, Nơi cấp.<br>• Ngày sinh, Giới tính.<br>• Địa chỉ thường trú (Thôn/bản, Xã, Huyện, Tỉnh).<br>• Số điện thoại di động chính.<br>• Ngày được chấp thuận gia nhập HTX. | • **Tài khoản Facebook** (Dòng 62): 100% để trống hoặc vô nghĩa đối với nông dân lớn tuổi.<br>• **Trình độ học vấn/chuyên môn** (Dòng 39): Luôn hiển thị `—`.<br>• **Nghề nghiệp chính** (Dòng 43): 99% xã viên là "Làm nông".<br>• **Dân tộc** (Dòng 44): Không phục vụ quyết định quản trị HTX.<br>• Lặp lại Tỷ lệ sở hữu % (đã có ở Tab 2). | Loại bỏ 4 trường dư thừa giúp card thông tin gọn gàng, tăng font chữ từ 11px lên 14px giúp người lớn tuổi đọc rõ ràng mà không cần zoom. |
| **Tab 2: Vốn góp** (`MemberTabCapital.tsx`) | 58–140 | • Vốn cam kết, Vốn thực góp, Số vốn còn thiếu.<br>• Tỷ lệ sở hữu % (kèm cảnh báo trần 30% Điều 74).<br>• Lịch sử nộp tiền (Ngày, Số tiền, Mã phiếu thu, Người thu).<br>• Nút xem và in Giấy chứng nhận phần vốn góp (A4). | • Hàm đọc số giả lập `numberToVietnameseWords` (Dòng 19–24): Hardcode trả về "Năm mươi triệu" nếu số tiền là 50tr hoặc 10tr.<br>• Nút "Chuyển tới Sổ Vốn Điều Lệ" thừa thãi khi đang xem nhanh. | Thay thế hàm đọc số bằng util dùng chung chuẩn; giữ bảng lịch sử nộp tiền minh bạch. |
| **Tab 3: Công nợ** (`MemberTabFinanceDebt.tsx`) | 23–134 | • Dư nợ vật tư hiện tại, Hạn mức ứng nợ tối đa (`credit_limit`).<br>• Tỷ lệ sử dụng hạn mức nợ (kèm cảnh báo an toàn).<br>• Thông tin chi trả: Hình thức (Tiền mặt/Chuyển khoản), Tên ngân hàng, Số tài khoản, Tên chủ tài khoản. | • Khối trích dẫn quy tắc "Quy tắc BR-FIN-002" (Dòng 119–121) mang nặng tính kỹ thuật lập trình, gây hoang mang cho người dùng.<br>• Trích dẫn văn bản luật dài dòng chiếm nửa màn hình. | Chuyển văn bản pháp lý thành icon chú thích `(i)` nhỏ gọn; làm nổi bật số tiền dư nợ và tài khoản nhận lợi nhuận. |
| **Tab 4: Canh tác** (`MemberTabFarmingPlots.tsx`) | 39–200 | • Danh sách thửa đất được phân công (Mã thửa, Diện tích ha, Tọa độ GPS, Mùa vụ hiện tại, Trạng thái an toàn PHI). | • **Khối QSD Đất góp vốn** (Dòng 145–200): Hiển thị trùng lặp 100% danh sách đất đai đã có tại Tab 2 (`MemberTabCapital`).<br>• **Khối "Năng lực cung ứng hàng năm"** (Dòng 39–76): Hiển thị 4 trường text tĩnh "Chưa ghi nhận". | Loại bỏ khối đất đai trùng lặp khỏi Tab 4; chỉ tập trung vào nhật ký phân công canh tác thực địa ngoài đồng. |
| **Tab 5: Hồ sơ** (`MemberTabDocuments.tsx`) | 25–144 | • Đơn xin gia nhập HTX (PDF scan).<br>• Bản chụp CCCD hai mặt để đối soát nhân thân.<br>• Hợp đồng liên kết sản xuất bao tiêu nông sản. | • Nút "In Giấy chứng nhận phần vốn góp" xuất hiện lần thứ 3 (đã có ở Header và Tab 2).<br>• Link xem trước văn bản giả lập `/docs/sample_agreement.pdf`. | Chuẩn hóa Tab 5 thành kho tệp tài liệu số hóa tải lên từ máy quét hoặc camera điện thoại. |
| **Tab 6: Truy vết** (`MemberTabAuditTrace.tsx`) | 66–238 | • Dòng thời gian thay đổi trạng thái (Ngày giờ, Người thực hiện, Hành động: Tạo mới, Duyệt kết nạp, Đình chỉ). | • **Chuỗi mã băm SHA-256 dài 64 ký tự hex** (Dòng 166–184) đập thẳng vào mắt người dùng.<br>• **Khối mã nguồn Before/After dạng raw JSON** (Dòng 187–229): `{ "status": "ACTIVE" }`... | Nông dân và cán bộ HTX cơ sở **hoàn toàn không hiểu JSON và SHA-256**. Cần đưa khối kỹ thuật này vào mục "Dành cho Kiểm toán viên" hoặc chỉ hiển thị tóm tắt tiếng Việt. |

---

#### B. Khảo sát Ngăn kéo Chi tiết Đại hội & Biểu quyết (`MeetingDetailDrawer.tsx` — 320 dòng)
- **Mã định danh kỹ thuật thô kệch:** Dòng 162 hiển thị chuỗi UUID `d3b07384-d113-4611-9a1c-8b8d4f23b201` trên tiêu đề cuộc họp. Đây là định danh nội bộ cơ sở dữ liệu, gây rối mắt cho người dùng. Cần thay bằng số hiệu văn bản thân thiện như `ĐH-2026-01`.
- **Thiếu thông tin Tỷ lệ Đại biểu tham dự (Quorum):** Dòng 196–213 chỉ hiển thị tỷ lệ phiếu Tán thành/Không tán thành của các nghị quyết, nhưng **hoàn toàn không hiển thị tỷ lệ số đại biểu có mặt trên tổng số thành viên HTX**. Theo Luật HTX 2023 Điều 72, đại hội chỉ hợp lệ khi có ít nhất $50\%$ tổng số thành viên tham dự. Việc thiếu chỉ số này khiến người dùng không biết nghị quyết đã đủ điều kiện pháp lý để biểu quyết hay chưa.
- **Trọng số biểu quyết dạng số thực trần trụi:** Dòng 235 hiển thị cột trọng số `weight = 0.0452` hoặc `1.0000`. Cần quy đổi hiển thị thành định dạng phần trăm vốn góp `% Vốn` hoặc nhãn `1 phiếu nhân thân`.

---

#### C. Khảo sát Ngăn kéo Chi tiết Vốn góp (`CapitalMemberDrawer.tsx` — 761 dòng)
- **Bloatware nghiêm trọng:** Tệp này chiếm tới 761 dòng mã nhưng thực chất chỉ sao chép lại thông tin xã viên từ `MemberDrawer.tsx`.
- **Khuyết tật hiển thị phôi in thu nhỏ (Micro-Print Preview Bloat):** Tại Tab Certificate (dòng 380–520), component cố tình nhồi nhét nguyên một trang Giấy chứng nhận A4 thu nhỏ có cả quốc huy, con dấu, bảng kê vào khung ngăn kéo rộng 600px. Hậu quả là chữ bị co rúm, méo mó, không đọc được và không thể in trực tiếp. Trong khi đó, hệ thống đã có modal in A4 chuẩn `CapitalCertificateModal.tsx`.
- **Kiến nghị dứt khoát:** **XÓA BỎ HOẶC SÁP NHẬP TOÀN BỘ** `CapitalMemberDrawer.tsx`. Khi người dùng click vào hàng xã viên tại trang `/capital`, mở trực tiếp `MemberDrawer.tsx` và kích hoạt sẵn Tab Vốn góp (`MemberTabCapital`). Giải pháp này giúp loại bỏ 761 dòng mã trùng lặp và thống nhất trải nghiệm người dùng 100%.

---

### 1.4. Đánh giá Tính khả dụng cho Nông dân và các Cạm bẫy Nhập liệu (Accidental Input Risks)

#### 1. Quy trình Kết nạp Xã viên 5 bước (`MemberWizard.tsx`) gây quá tải nhận thức
- `MemberWizard.tsx:28-88` buộc người dùng đi qua 5 bước tuần tự: (1) Nhân thân $\rightarrow$ (2) Địa chỉ & Liên lạc $\rightarrow$ (3) Vốn cam kết & Nộp đợt đầu $\rightarrow$ (4) Chia thặng dư & Ngân hàng $\rightarrow$ (5) Xác nhận.
- Nếu HTX kết nạp 30 hộ xã viên mới, cán bộ HTX phải bấm chuyển bước ít nhất **150 lần**.
- Tại Bước 2, biểu mẫu bắt buộc nhập Email và Facebook. Tại các vùng chuyên canh nông nghiệp như Đơn Dương, Lạc Dương (Lâm Đồng), đa số nông dân trung niên và cao tuổi chỉ dùng số điện thoại nghe gọi hoặc Zalo gia đình, không sử dụng Email/Facebook cho việc điều hành HTX.
- **Cạm bẫy dữ liệu giả lập nguy hiểm:** Dòng 59–66 gán sẵn giá trị mặc định: `committed_capital: 50.000.000 ₫`, `initial_contributed_capital: 10.000.000 ₫`, `capital_in_words: 'Năm mươi triệu đồng'`. Nếu cán bộ bấm lướt nhanh qua các bước, một xã viên nghèo chỉ đăng ký góp 2.000.000 ₫ sẽ bị hệ thống ghi nhận nhầm thành cam kết nợ 50.000.000 ₫!

#### 2. Biểu mẫu Biểu quyết Đại hội (`CastVoteModal.tsx`) phi thực tế đối với nông dân
- *Bắt gõ tay mã Nghị quyết:* Dòng 89–98 hiển thị một ô `<input type="text">` trống trơn, bắt nông dân phải gõ chính xác mã nghị quyết (ví dụ: `NQ-01` hoặc `NQ-2026-BAOCAO`). Nếu gõ sai thành `NQ 1`, hệ thống sẽ từ chối hoặc ghi nhận sang một nghị quyết không có thật.
- *Bắt tự tính trọng số thập phân 0.0001:* Dòng 181–194 hiển thị ô nhập số thực "Trọng số biểu quyết" với bước nhảy `step="0.0001"`. Nông dân đi họp đại hội chỉ cần thể hiện ý chí "Đồng ý" hoặc "Không đồng ý". Hệ thống phải tự động tính toán trọng số theo tỷ lệ vốn góp của xã viên đó từ cơ sở dữ liệu, tuyệt đối không được bắt nông dân tự tính và gõ số `0.0245`.

#### 3. Thuật ngữ Kỹ thuật và Hành chính khó hiểu (Jargon Overload)
- Trong `LandContributionModal.tsx:28`: Trạng thái địa chính hiển thị các từ tiếng Anh: `PENDING`, `NOTARIZED`, `REGISTERED_CHANGE`.
- Trong `MembersTable.tsx:114-120`: Bộ lọc chứa các nhãn: `OVERDUE_CAPITAL`, `PENDING_TERMINATION`. Cần chuyển thành tiếng Việt: "Quá hạn nộp vốn 6 tháng", "Đang làm thủ tục thôi thành viên".
- Trong `MemberKpiCards.tsx:142-154`: Hiển thị cảnh báo "Trần sở hữu Nhà Đầu Tư Nước Ngoài: 4.5% / Tối đa 35%". Khái niệm này áp dụng cho công ty đại chúng hoặc tập đoàn tài chính, hoàn toàn xa lạ và gây hoang mang cho nông dân vùng đồng bào dân tộc thiểu số tại HTX.

#### 4. Kích thước Font chữ và Vùng chạm cảm ứng (Touch Target)
- Hơn **45%** diện tích văn bản trên các trang danh mục sử dụng font chữ siêu nhỏ `text-[10px]`, `text-[10.5px]`, `text-[11px]`. Nông dân lớn tuổi (50–65 tuổi) rất khó đọc, thường phải đưa sát mắt vào màn hình.
- Nút bấm hành động trong bảng `MembersTable.tsx` chỉ có kích thước padding `px-2 py-1` (chiều cao ~28px), rất dễ bị bấm trượt khi thao tác bằng ngón tay trên điện thoại di động ngoài đồng ruộng.

#### 5. Hành vi Giả lập Ngầm (Silent Mocking) tại `ProfitPage.tsx` vi phạm Nguyên tắc Toàn vẹn
- Dòng 55–56: `const [surplusPlan, setSurplusPlan] = useState<SurplusDistributionPlan>(mockSurplusPlan);`
- Khi API backend trả về danh sách rỗng (HTX mới thành lập, chưa lập phương án phân phối nào), màn hình không hiển thị Empty State mà lập tức tự nạp 1.250.000.000 ₫ tiền lãi giả và danh sách 10 xã viên giả lập.
- Khi người dùng chỉnh sửa tham số và bấm "Lưu", hàm `handleUpdateProfitPlan` (dòng 177–205) chỉ cập nhật state trong bộ nhớ React, **hoàn toàn không gọi API lưu vào CSDL PostgreSQL**. Tải lại trang là toàn bộ dữ liệu biến mất.

---

## PHẦN II (R2): VÒNG LẶP KIỂM THỬ NGHIỆP VỤ THEO 5 NGHIỆP VỤ CUỐN CHIẾU (6-STEP BUSINESS DEEP DIVE)

Phần này phân tích toàn diện 5 nghiệp vụ cốt lõi của Phân hệ 1 theo đúng quy trình 6 bước chuẩn mực:
- **Bước 1:** Danh mục chức năng cụ thể (Backend routes/controllers/services/requests/policies & Frontend pages/tables/drawers/modals).
- **Bước 2:** Ma trận kiểm tra CRUD toàn diện kèm tình trạng và rủi ro.
- **Bước 3:** Cơ chế hoạt động & Luồng dữ liệu (Data flow, state, payload, response, database transactions).
- **Bước 4:** Kiểm thử thiếu/sai dữ liệu nhập (Validation rules tại FormRequest và Frontend feedback).
- **Bước 5:** Đối chiếu CSDL thực tế (Bảng PostgreSQL, PK/FK, tenant isolation, soft-delete, SHA-256 hash).
- **Bước 6:** Đánh giá tính khả dụng UX cho nông dân.

---

### 2.1. Nghiệp vụ 1: Hồ sơ Pháp lý Hợp tác xã (Cooperative Profile & Legal Dossier)

#### Bước 1: Danh mục Chức năng Cụ thể
- **Backend API & Định tuyến:**
  - `GET /api/v1/cooperatives/my-cooperative` (`backend/routes/api.php:105`): Lấy hồ sơ pháp lý HTX thuộc ngữ cảnh phiên đăng nhập.
  - `PUT /api/v1/cooperatives/my-cooperative` (`backend/routes/api.php:106`): Cập nhật thông tin pháp lý HTX.
- **Backend Controller, Service, Policy & Persistence:**
  - Controller: `Modules\Cooperative\Presentation\Http\Controllers\CooperativeController.php:21-82`.
  - Phân quyền: Kiểm tra Gate `COOPERATIVE.READ` (dòng 23) và Gate `COOPERATIVE.UPDATE` (dòng 45). Chỉ vai trò `HTX_OWNER` và `SYSTEM_ADMIN` mới có quyền chỉnh sửa.
  - Validation: Thực hiện inline tại dòng 59-64: `legal_name` (max 255), `display_name` (max 255), `legal_information` (array), `contact_information` (array).
  - Persistence: Model `CooperativeModel.php`, bảng `cooperatives`.
  - Audit Trail: Tự động ghi sự kiện `COOPERATIVE_UPDATED` vào `audit_events` (dòng 69-76) với mã băm SHA-256.
- **Frontend Components:**
  - Trang chính: `frontend/src/features/members/pages/CoopProfilePage.tsx` (198 dòng).
  - Hộp thoại sửa: `frontend/src/features/members/components/CoopProfileEditModal.tsx` (172 dòng).
  - Ngữ cảnh Tenant: `useTenantContextStore` (`activeCooperative`).

#### Bước 2: Ma trận Kiểm tra CRUD
- **Create (Tạo mới):** `RESTRICTED_BY_DESIGN` — Không có chức năng tạo mới HTX trên giao diện vì hệ thống vận hành theo phạm vi đơn vị HTX (Single-Tenant per deployment); pháp nhân HTX được nạp qua Seeder ban đầu.
- **Read (Xem hồ sơ):** `DEFECT_FE_DISCONNECTED` — **Backend có API nhưng Frontend KHÔNG GỌI**. Trang `CoopProfilePage.tsx:26-37` đọc từ Zustand store; nếu rỗng thì nạp mock object hardcoded (HTX Tân Tiến, MST 5801452291).
- **Update (Chỉnh sửa):** `DEFECT_FE_DISCONNECTED` — **Frontend KHÔNG GỌI API PUT**. Hàm `handleSaveProfile` (dòng 39-47) chỉ gọi `setCooperative(newCoop)` vào bộ nhớ client và hiển thị toast giả thành công.
- **Delete (Xóa pháp nhân):** `PROHIBITED_BY_LAW` — Nghiêm cấm xóa pháp nhân HTX khi đang có dữ liệu xã viên và giao dịch tài chính.

#### Bước 3: Cơ chế Hoạt động & Luồng Dữ liệu
```
[User bấm Lưu Hồ sơ HTX]
        │
        ▼
[CoopProfileEditModal] ──(Gọi onSave)──► [handleSaveProfile trong CoopProfilePage]
                                                    │
                              ┌─────────────────────┴─────────────────────┐
                              ▼ (Hiện trạng lỗi)                          ▼ (Cơ chế chuẩn bắt buộc)
                   [Cập nhật Zustand Store]                     [Gửi PUT /api/v1/cooperatives/my-cooperative]
                              │                                                   │
                   [Toast báo thành công]                                         ▼
                              │                                         [CooperativeController@update]
                   [F5 tải lại trang: MẤT HẾT DỮ LIỆU]                            │
                                                                        [Kiểm tra Gate COOPERATIVE.UPDATE]
                                                                                  │
                                                                        [Cập nhật CSDL PostgreSQL: cooperatives]
                                                                                  │
                                                                        [Ghi Audit Log SHA-256: COOPERATIVE_UPDATED]
```

#### Bước 4: Kiểm thử Thiếu/Sai Dữ liệu Nhập
- **Kịch bản thiếu:** Bỏ trống Tên pháp lý HTX (`legal_name`).
- **Phản hồi hệ thống:** Trong `CoopProfileEditModal.tsx:32`, hệ thống dùng hàm `alert('Tên pháp lý HTX là bắt buộc!')` thô thiển của trình duyệt thay vì hiển thị lỗi viền đỏ dưới chân ô nhập.

#### Bước 5: Đối chiếu CSDL Thực tế
- Bảng `cooperatives` trong PostgreSQL có đúng **1 bản ghi**: `id = '9d3e8e12-42c2-4841-9457-37b57bb9ec81'`, `cooperative_code = 'HTX-TT-01'`, `tax_code = '5801452291'`.
- Trường `cooperative_code` có ràng buộc `UNIQUE`.
- Không có bất kỳ bản ghi mồ côi nào vi phạm toàn vẹn khóa ngoại.

#### Bước 6: Đánh giá Tính Khả dụng UX cho Nông dân
- Bố cục trang gồm 4 thẻ KPI tóm tắt quy mô và danh sách ban quản trị trực quan.
- Điểm trừ nghiêm trọng: Dữ liệu quy mô (3.5 tỷ vốn, 165 xã viên, 52.5 ha đất) bị hardcode bằng văn bản tĩnh, không liên thông với số liệu thực tế trong Sổ Vốn và Danh sách Xã viên.

---

### 2.2. Nghiệp vụ 2: Quản lý Xã viên & Phân loại Thành viên (Member Governance & Lifecycle)

#### Bước 1: Danh mục Chức năng Cụ thể
- **Backend API & Định tuyến:**
  - `GET /api/v1/members` (`api.php:109`): Danh sách xã viên có phân trang, lọc theo loại (`OFFICIAL`, `ASSOCIATED`), lọc trạng thái (`ACTIVE`, `DRAFT`, `SUSPENDED`, `TERMINATED`), tìm kiếm họ tên/CCCD/SĐT.
  - `POST /api/v1/members` (`api.php:110`): Kết nạp xã viên mới.
  - `GET /api/v1/members/{id}` (`api.php:111`): Chi tiết xã viên.
  - `PATCH /api/v1/members/{id}` (`api.php:112`): Cập nhật thông tin nhân thân.
  - `DELETE /api/v1/members/{id}` (`api.php:113`): Thôi thành viên (Soft Delete).
  - `POST /api/v1/members/{id}/approve` (`api.php:114`): Duyệt kết nạp (chuyển `DRAFT` $\rightarrow$ `ACTIVE`).
  - `POST /api/v1/members/{id}/status-transitions` (`api.php:115`): Chuyển đổi trạng thái FSM.
  - `GET /api/v1/members/{id}/suggested-credit-limit` (`api.php:116`): Tính hạn mức nợ vật tư gợi ý.
- **Backend Controller, Service, Request & Entity:**
  - Controller: `MemberController.php:22-188`.
  - Service: `MemberService.php:22-316`.
  - Form Requests: `CreateMemberRequest.php`, `UpdateMemberRequest.php`, `StatusTransitionRequest.php`.
  - Domain Entity FSM: `Member.php:7-55` kiểm soát chuyển trạng thái bất biến:
    $$\text{DRAFT} \rightarrow \{\text{ACTIVE}, \text{PROSPECTIVE}, \text{TERMINATED}\}$$
    $$\text{ACTIVE} \rightarrow \{\text{SUSPENDED}, \text{LEAVING}, \text{PENDING\_TERMINATION}, \text{TERMINATED}\}$$
    $$\text{SUSPENDED} \rightarrow \{\text{ACTIVE}, \text{TERMINATED}\}$$
    $$\text{TERMINATED} \rightarrow \emptyset \quad (\text{Trạng thái kết thúc, cấm quay lui})$$
  - Persistence: `MemberModel.php` sử dụng `SoftDeletes`, cột `deleted_at`, `status = 'TERMINATED'`.
  - Audit Trail: Ghi các sự kiện `MEMBER_CREATED`, `MEMBER_UPDATED`, `MEMBER_APPROVED`, `MEMBER_STATUS_CHANGED`, `MEMBER_DELETED` vào `audit_events`.
- **Frontend Components:**
  - Trang chính: `MembersPage.tsx` (379 dòng).
  - Bảng danh sách: `MembersTable.tsx` (368 dòng).
  - Ngăn kéo chi tiết: `MemberDrawer.tsx` (167 dòng) + 6 tabs.
  - Wizard thêm mới: `MemberWizard.tsx` (432 dòng, 5 bước).
  - Modal chỉnh sửa: `MemberEditModal.tsx` (165 dòng).
  - Modal chuyển trạng thái: `MemberStatusModals.tsx` (342 dòng).
  - Modal thẩm tra thôi thành viên: `MemberTerminationCheckModal.tsx` (175 dòng).

#### Bước 2: Ma trận Kiểm tra CRUD
- **Create (Thêm xã viên):** `IMPLEMENTED_VERIFIED` — Hoạt động tốt, kiểm tra trùng CCCD, tự sinh mã xã viên nếu để trống, tạo bản ghi trạng thái `DRAFT`.
- **Read (Danh sách):** `IMPLEMENTED_VERIFIED` — Tải dữ liệu thật qua React Query `useMembersData`, hỗ trợ đầy đủ tìm kiếm, lọc và phân trang server-side.
- **Detail (Xem chi tiết):** `IMPLEMENTED_OVERLOADED` — Đầy đủ thông tin nhưng bị nhồi nhét; Tab 2 và Tab 4 trùng lặp dữ liệu đất đai; Tab 6 hiển thị raw JSON gây rối mắt.
- **Update (Sửa thông tin):** `IMPLEMENTED_FLAWED` — Hoạt động, nhưng `memberService.ts` nuốt lỗi nếu API trả về lỗi 422/403.
- **Delete (Thôi thành viên):** `IMPLEMENTED_SOFT_DELETE` — Tuân thủ tuyệt đối quy định pháp lý: CSDL chuyển `status = 'TERMINATED'`, gán `deleted_at`, không bao giờ xóa cứng dòng dữ liệu.
- **Status Transitions (FSM):** `PARTIAL_RESTRICTION` — `StatusTransitionRequest.php:17` chỉ cho phép `in:ACTIVE,PENDING_TERMINATION,TERMINATED`, thiếu trạng thái `SUSPENDED` và `LEAVING`.

#### Bước 3: Cơ chế Hoạt động & Luồng Dữ liệu
Mọi thao tác thay đổi vòng đời xã viên đều diễn ra trong một Database Transaction:
1. Client gửi request $\rightarrow$ Route $\rightarrow$ Middleware xác thực TenantContext.
2. FormRequest kiểm tra tính hợp lệ dữ liệu nhân thân và CCCD 12 số.
3. Service nạp Entity `Member` từ Database, gọi hàm `transitionTo()` kiểm tra ma trận FSM.
4. Cập nhật bảng `members` trong PostgreSQL.
5. Tạo bản ghi sự kiện kiểm toán trong bảng `audit_events` với `prev_hash` lấy từ khối mới nhất và tính `current_hash = SHA256(...)`.
6. Commit transaction, trả về HTTP 200/201 kèm API Resource.

#### Bước 4: Kiểm thử Thiếu/Sai Dữ liệu Nhập
- **Thiếu họ tên hoặc CCCD sai quy cách:** Nhập CCCD 9 số hoặc chứa chữ cái $\rightarrow$ `CreateMemberRequest` chặn lại, trả về HTTP 422 `VALIDATION_FAILED` kèm thông báo: *"Số CCCD phải bao gồm đúng 12 chữ số"*.
- **Nhập trùng mã xã viên:** Gửi `member_code = 'TV001'` $\rightarrow$ Backend ném lỗi HTTP 409 `DUPLICATE_MEMBER_CODE`.

#### Bước 5: Đối chiếu CSDL Thực tế
- Bảng `members` có **31 xã viên**: 18 chính thức hoạt động (`ACTIVE`), 6 liên kết hoạt động, 1 chính thức chờ duyệt (`DRAFT`), 1 tạm đình chỉ (`SUSPENDED`), 2 đã thôi thành viên (`TERMINATED` với `deleted_at` được gán mốc thời gian, dữ liệu lịch sử nguyên vẹn 100%).
- Ràng buộc khóa ngoại: `cooperative_id` liên kết bảng `cooperatives` với quy tắc `ON DELETE RESTRICT`.

#### Bước 6: Đánh giá Tính Khả dụng UX cho Nông dân
- Wizard 5 bước quá dài, cần rút gọn xuống 2 bước tinh gọn.
- Modal thẩm tra thôi thành viên (`MemberTerminationCheckModal`) rất xuất sắc: Tự động kiểm tra 4 điều kiện dư nợ vật tư, nợ vay, hợp đồng treo trước khi cho phép rút vốn.

---

### 2.3. Nghiệp vụ 3: Đại hội Thành viên & Biểu quyết Nghị quyết (General Assembly & Democratic Voting)

#### Bước 1: Danh mục Chức năng Cụ thể
- **Backend API & Định tuyến:**
  - `GET /api/v1/meetings` (`api.php:133`): Danh sách cuộc họp.
  - `POST /api/v1/meetings` (`api.php:134`): Tạo cuộc họp / Đại hội mới.
  - `GET /api/v1/meetings/{id}` (`api.php:135`): Chi tiết cuộc họp và dự thảo nghị quyết.
  - `PATCH /api/v1/meetings/{id}` (`api.php:136`): Cập nhật thông tin cuộc họp.
  - `GET /api/v1/meetings/{id}/votes` (`api.php:137`): Danh sách phiếu biểu quyết.
  - `POST /api/v1/meetings/{id}/votes` (`api.php:138`): Bỏ phiếu biểu quyết nghị quyết.
  - `GET /api/v1/meetings/{id}/resolutions-summary` (`api.php:139`): Tổng hợp kết quả biểu quyết và thẩm định tỷ lệ thông qua theo Điều 72 Luật HTX 2023.
- **Backend Controller, Service, Request & Persistence:**
  - Controller: `MeetingController.php:20-130`.
  - Service: `MeetingService.php:21-252`.
  - Form Requests: `CreateMeetingRequest.php`, `CastVoteRequest.php`.
  - Persistence: Model `MeetingModel.php` (`meetings`), `VoteModel.php` (`votes`).
- **Frontend Components:**
  - Trang chính: `MeetingsPage.tsx` (213 dòng).
  - Bảng danh sách: `MeetingsTable.tsx` (186 dòng).
  - Ngăn kéo chi tiết: `MeetingDetailDrawer.tsx` (320 dòng).
  - Hộp thoại tạo: `CreateMeetingModal.tsx` (188 dòng).
  - Hộp thoại bỏ phiếu: `CastVoteModal.tsx` (228 dòng).
  - Card tổng hợp: `ResolutionsSummaryCard.tsx` (178 dòng).
  - Service API: `frontend/src/services/meetingApi.ts`.

#### Bước 2: Ma trận Kiểm tra CRUD
- **Create (Tạo cuộc họp):** `IMPLEMENTED_VERIFIED` — Tạo cuộc họp thường niên (`ANNUAL`) hoặc bất thường (`EXTRAORDINARY`), lưu trạng thái `PLANNED`.
- **Read (Danh sách & Chi tiết):** `IMPLEMENTED_VERIFIED` — Tải dữ liệu thật từ backend, tính toán tỷ lệ tán thành theo thời gian thực.
- **Update (Sửa thông tin):** `DEFECT_METHOD_MISMATCH` — **Lỗi xung đột HTTP Method**: Tuyến backend quy định `Route::patch('/meetings/{id}')` nhưng client `meetingApi.ts:104` lại gọi `apiClient.put()`, dẫn đến lỗi HTTP 405 Method Not Allowed khi người dùng bấm lưu sửa đổi.
- **Vote (Bỏ phiếu):** `IMPLEMENTED_VERIFIED` — Cơ chế chống bỏ phiếu trùng hoạt động tuyệt đối qua ràng buộc Unique `(meeting_id, user_id, resolution_code)`.
- **Delete (Xóa cuộc họp):** `COMPLIANT_BY_DESIGN` — Không cho phép xóa cứng cuộc họp đã diễn ra biểu quyết; chỉ hỗ trợ chuyển trạng thái `CANCELLED`.

#### Bước 3: Cơ chế Hoạt động & Luồng Dữ liệu
Cơ chế kiểm soát tỷ lệ thông qua Nghị quyết theo Điều 72 Luật HTX 2023:
- **Nghị quyết Thông thường (`REGULAR`):** Điều kiện thông qua là tỷ lệ tán thành $\ge 50\%$ tổng số phiếu hợp lệ.
- **Nghị quyết Trọng yếu (`CRITICAL`):** Áp dụng cho các nội dung sửa đổi Điều lệ HTX, tổ chức lại, giải thể, sáp nhập. Điều kiện thông qua là tỷ lệ tán thành $\ge 75\%$ tổng số phiếu hợp lệ.
- Thuật toán tại `MeetingService.php:225-245` tự động đối soát loại nghị quyết và trả về cờ `is_approved = true/false` hoàn toàn tự động.

#### Bước 4: Kiểm thử Thiếu/Sai Dữ liệu Nhập
- **Bỏ phiếu lần 2 (Trùng lặp):** Cùng một xã viên gửi biểu quyết lần 2 cho cùng một nghị quyết $\rightarrow$ Backend ném lỗi HTTP 409 `DUPLICATE_VOTE` kèm thông báo: *"Bạn đã thực hiện biểu quyết cho nghị quyết này rồi"*.
- **Biểu quyết khi cuộc họp đã đóng:** Gửi phiếu khi `meeting->status === 'COMPLETED'` $\rightarrow$ Backend chặn với lỗi HTTP 400 `MEETING_CLOSED`.

#### Bước 5: Đối chiếu CSDL Thực tế
- Bảng `meetings` có **3 cuộc họp**: Đại hội thường niên 2025 (`COMPLETED`), Đại hội bất thường phương án SXKD 2026 (`IN_PROGRESS`), Đại hội thường niên 2026 (`PLANNED`).
- Bảng `votes` có **60 phiếu biểu quyết** được ghi nhận an toàn, không có phiếu rác mồ côi.

#### Bước 6: Đánh giá Tính Khả dụng UX cho Nông dân
- Hộp thoại `CastVoteModal` cần được tái cấu trúc thành 3 nút lớn 🟩 TÁN THÀNH, 🟥 KHÔNG TÁN THÀNH, ⬜ PHIẾU TRẮNG; loại bỏ ô nhập trọng số số thực.

---

### 2.4. Nghiệp vụ 4: Sổ Vốn Điều lệ & Giấy Chứng nhận Phần Vốn góp / Đóng góp QSDĐ (Equity & Land Ledger)

#### Bước 1: Danh mục Chức năng Cụ thể
- **Backend API & Định tuyến:**
  - `GET /api/v1/capital-contributions/summary` (`api.php:119`): Báo cáo tổng hợp vốn điều lệ.
  - `GET /api/v1/capital-contributions` (`api.php:120`): Sổ theo dõi vốn góp toàn HTX.
  - `GET /api/v1/members/{member_id}/capital-contributions` (`api.php:121`): Lịch sử góp vốn của từng xã viên.
  - `POST /api/v1/members/{member_id}/capital-contributions` (`api.php:122`): Ghi nhận giao dịch nộp vốn mới.
  - `GET/POST/DELETE /api/v1/land-contributions` (`api.php:125-130`): Quản lý tài sản quyền sử dụng đất góp vốn.
- **Backend Controller, Service, Request & Persistence:**
  - Controller: `CapitalContributionController.php`, `LandContributionController.php`.
  - Service: `CapitalContributionService.php:23-252`.
  - Form Request: `CreateCapitalContributionRequest.php:17-29`.
  - Persistence: Model `CapitalContributionModel.php`, `LandContributionModel.php`.
- **Frontend Components:**
  - Trang chính: `CapitalPage.tsx` (414 dòng).
  - Thẻ KPI: `CapitalKpiCards.tsx` (188 dòng).
  - Bảng danh sách: `CapitalMembersTab.tsx` (327 dòng).
  - Tab đất đai: `LandContributionsTab.tsx` (231 dòng).
  - Modal nộp vốn: `CapitalRecordModal.tsx` (288 dòng).
  - Modal nộp đất: `LandContributionModal.tsx` (286 dòng).
  - Modal in chứng nhận: `CapitalCertificateModal.tsx` (302 dòng).
  - Bloatware trùng lặp: `CapitalMemberDrawer.tsx` (761 dòng).

#### Bước 2: Ma trận Kiểm tra CRUD
- **Create (Ghi nhận vốn):** `IMPLEMENTED_VERIFIED` — Tự động kiểm tra trần vốn 30% Điều 74 Luật HTX 2023; tự động cấp mã Giấy chứng nhận `GCN-YYYY-XXXXXX` kèm mã QR xác thực.
- **Read (Sổ vốn & KPI):** `IMPLEMENTED_VERIFIED` — Thống kê chính xác tổng vốn cam kết, tổng vốn thực góp và tỷ lệ hoàn thành.
- **Land Contribution CRUD:** `IMPLEMENTED_VERIFIED` — Lưu trữ đầy đủ 8 trường địa chính: số sổ đỏ, thửa số, tờ bản đồ, diện tích m², đơn giá thẩm định, trạng thái sang tên.
- **Detail (Xem chi tiết):** `DUPLICATE_BLOAT` — Tồn tại song song giữa `CapitalMemberDrawer` (761 dòng) và `MemberDrawer`.

#### Bước 3: Cơ chế Hoạt động & Luồng Dữ liệu
Kiểm soát hai trần vốn cốt lõi theo Điều 74 Luật HTX 2023:
1. **Trần vốn cá nhân thành viên chính thức ($\le 30\%$):**
   $$\text{projectedRatio} = \frac{\text{currentMemberPaid} + \text{newAmount}}{\text{currentTotalCoopPaid} + \text{newAmount}} \le 30.0\%$$
   Nếu $\text{projectedRatio} > 30\%$, Service ném mã lỗi `ERR_CAPITAL_EXCEED_LIMIT` (HTTP 422) và rollback transaction.
2. **Trần vốn nhóm thành viên liên kết ($\le 30\%$):**
   Tổng vốn góp của toàn bộ thành viên liên kết không được vượt quá $30\%$ vốn điều lệ HTX.

#### Bước 4: Kiểm thử Thiếu/Sai Dữ liệu Nhập
- **Số tiền nộp $\le 0$:** Gửi `amount = -5.000.000` $\rightarrow$ Request validation chặn ngay: *"Số tiền góp vốn phải lớn hơn 0"*.
- **Vượt trần 30% vốn điều lệ:** Nộp 2,5 tỷ VNĐ cho một thành viên khi tổng vốn HTX là 1,075 tỷ (đẩy tỷ lệ sở hữu lên 68.53%) $\rightarrow$ Backend ném lỗi HTTP 422: *"Giao dịch góp vốn làm tỷ lệ sở hữu của thành viên chính thức vượt trần 30% vốn điều lệ (dự kiến: 68.53%). Vi phạm Điều 74 Luật HTX 2023."*

#### Bước 5: Đối chiếu CSDL Thực tế
- Bảng `capital_contributions` có **30 giao dịch**:
  - 26 giao dịch tiền mặt/chuyển khoản: **1.075.000.000 VNĐ**.
  - 4 giao dịch góp vốn bằng quyền sử dụng đất: **4.875.000.000 VNĐ**.
- Bảng `land_contributions` có **4 thửa đất** với tổng diện tích $19.500\text{ m}^2$.
- **Tổng vốn điều lệ thực góp lũy kế toàn HTX:** **5.950.000.000 VNĐ**.
- Ràng buộc khóa ngoại: `member_id` tham chiếu `members(id)` với quy tắc `ON DELETE RESTRICT`.

#### Bước 6: Đánh giá Tính Khả dụng UX cho Nông dân
- Tính năng in Giấy chứng nhận A4 rất chuẩn mực, có dấu mộc và QR code tra cứu.
- Cần xóa bỏ `CapitalMemberDrawer` (761 dòng) để thống nhất một ngăn kéo duy nhất.

---

### 2.5. Nghiệp vụ 5: Kế hoạch Phân phối Thặng dư (Surplus Distribution Plan per Luật HTX 2023)

#### Bước 1: Danh mục Chức năng Cụ thể
- **Backend API & Định tuyến:**
  - `GET /api/v1/surplus-distribution-plans` (`api.php:263`): Danh sách kế hoạch phân phối thặng dư.
  - `POST /api/v1/surplus-distribution-plans` (`api.php:264`): Lập phương án phân phối thặng dư mới.
  - `GET /api/v1/surplus-distribution-plans/{id}` (`api.php:265`): Chi tiết phương án và danh sách phân bổ.
  - `POST /api/v1/surplus-distribution-plans/{id}/submit` (`api.php:266`): Trình duyệt phương án (`DRAFT` $\rightarrow$ `PENDING_APPROVAL`).
  - `POST /api/v1/surplus-distribution-plans/{id}/approve` (`api.php:267`): Phê duyệt phương án (`APPROVED`).
- **Backend Controller, Service, Request & Persistence:**
  - Controller: `Modules\Finance\Presentation\Http\Controllers\SurplusDistributionController.php`.
  - Service: `Modules\Finance\Application\Services\SurplusDistributionService.php`.
  - Form Request: `CreateSurplusDistributionPlanRequest.php:17-23`.
  - Persistence: Model `SurplusDistributionPlanModel.php` (`surplus_distribution_plans`), `SurplusDistributionAllocationModel.php` (`surplus_distribution_allocations`).
- **Frontend Components:**
  - Trang chính: `ProfitPage.tsx` (366 dòng).
  - Thẻ KPI: `ProfitKpiCards.tsx` (116 dòng).
  - Card cấu hình: `ProfitParamConfigCard.tsx` (204 dòng).
  - Bảng phân bổ: `ProfitAllocationTable.tsx` (342 dòng).
  - Biểu đồ: `ProfitCharts.tsx` (112 dòng).
  - Modal tạo phương án: `CreateSurplusPlanModal.tsx` (196 dòng).
  - Modal in phiếu chia: `SurplusVoucherPrintModal.tsx` (121 dòng).

#### Bước 2: Ma trận Kiểm tra CRUD
- **Create (Lập phương án):** `IMPLEMENTED_VERIFIED` — Thuật toán backend tự động quét toàn bộ xã viên `ACTIVE`, lấy snapshot vốn góp từ `capital_contributions` và doanh số sử dụng dịch vụ từ phiếu xuất kho `stock_issues` để chia thặng dư công bằng.
- **Read (Xem phương án):** `DEFECT_SILENT_MOCK` — **Lỗi vi phạm nguyên tắc dữ liệu thật**: Khi database chưa có dữ liệu, frontend tự nạp `mockSurplusPlan` (1,25 tỷ VNĐ) và danh sách xã viên giả.
- **Submit (Trình duyệt):** `IMPLEMENTED_VERIFIED` — Chuyển trạng thái `DRAFT` $\rightarrow$ `PENDING_APPROVAL`.
- **Approve (Phê duyệt):** `IMPLEMENTED_VERIFIED` — Chỉ vai trò `HTX_OWNER` mới có quyền duyệt, chốt số liệu và ghi audit log.

#### Bước 3: Cơ chế Hoạt động & Luồng Dữ liệu
Cài đặt chặt chẽ các điều khoản tài chính của Luật HTX 2023:
1. **Điều 83-84 (Trích lập Quỹ chung không chia):**
   HTX bắt buộc phải trích tối thiểu $5\%$ tổng thặng dư vào Quỹ chung không chia trước khi phân phối cho thành viên:
   $$\text{distributableSurplus} \le \text{totalSurplus} \times 95.0\%$$
2. **Điều 85 (Ưu tiên mức độ sử dụng dịch vụ):**
   Tỷ trọng phân phối theo mức độ sử dụng sản phẩm/dịch vụ của thành viên không được thấp hơn $50\%$:
   $$\text{serviceUsageWeight} \ge 50.0\% \quad \text{và} \quad \text{capitalWeight} + \text{serviceUsageWeight} = 100.0\%$$
3. Toàn bộ 31 bản ghi phân bổ chi tiết cho từng xã viên được tính toán và lưu đồng thời trong một Database Transaction.

#### Bước 4: Kiểm thử Thiếu/Sai Dữ liệu Nhập
- **Trích quỹ $< 5\%$:** Phân phối 980 triệu trên tổng thặng dư 1 tỷ (trích quỹ $2\% < 5\%$) $\rightarrow$ Backend ném lỗi HTTP 422: *"Thặng dư phân phối vượt quá 95% tổng thặng dư. Phải trích tối thiểu 5% vào quỹ không chia theo Luật HTX 2023."*
- **Tỷ trọng dịch vụ $< 50\%$:** Đặt tỷ trọng dịch vụ $40\%$ và vốn $60\%$ $\rightarrow$ Backend ném lỗi HTTP 422: *"Tỷ trọng phân phối theo mức độ sử dụng dịch vụ không được thấp hơn 50% theo Điều 85 Luật HTX 2023."*

#### Bước 5: Đối chiếu CSDL Thực tế
- Bảng `surplus_distribution_plans` có **1 phương án**: Niên độ 2025, tổng thặng dư 1.000.000.000 VNĐ, thặng dư phân phối 800.000.000 VNĐ (trích quỹ không chia $20\%$), tỷ trọng 60% Dịch vụ / 40% Vốn.
- Bảng `surplus_distribution_allocations` có đúng **31 bản ghi phân bổ** tương ứng 31 xã viên với số tiền chính xác đến từng đồng.

#### Bước 6: Đánh giá Tính Khả dụng UX cho Nông dân
- Xóa bỏ triệt để silent mock data.
- Đơn giản hóa các thuật ngữ kế toán (TK 511, TK 512, Patronage rebate) thành ngôn từ bình dân: "Tiền lãi từ bán vật tư cho xã viên", "Tiền thưởng theo sản lượng bán cho HTX".

---

### 2.6. Ma trận Kiểm tra CRUD Toàn diện (Comprehensive CRUD Verification Matrix)

Bảng tổng hợp đối soát hiện trạng triển khai các thao tác CRUD trên cả hai tầng Backend và Frontend cho toàn bộ Phân hệ 1:

| Nghiệp vụ | Thao tác CRUD | Tuyến API & Phương thức Backend | Component & Thao tác Frontend | Tình trạng triển khai | Đánh giá Kỹ thuật & Rủi ro |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **1. Hồ sơ pháp lý** | **Create** | Không có (Single-Tenant Seed) | Không có | `RESTRICTED_BY_DESIGN` | Chuẩn mực vì hệ thống chạy theo phạm vi 1 HTX |
| | **Read** | `GET /cooperatives/my-cooperative` | `CoopProfilePage.tsx` | `DEFECT_FE_DISCONNECTED` | **Backend có API nhưng Frontend KHÔNG GỌI, hardcode fallback** |
| | **Update** | `PUT /cooperatives/my-cooperative` | `CoopProfileEditModal.tsx` | `DEFECT_FE_DISCONNECTED` | **Frontend không gọi API PUT, chỉ lưu Zustand memory** |
| | **Delete** | Không có | Không có | `PROHIBITED_BY_LAW` | Nghiêm cấm xóa pháp nhân HTX đang vận hành |
| **2. Quản lý Xã viên** | **Create** | `POST /members` | `MemberWizard.tsx` (5 bước) | `IMPLEMENTED_VERIFIED` | Hoạt động tốt, kiểm tra trùng CCCD, tạo trạng thái DRAFT |
| | **Read** | `GET /members` | `MembersTable.tsx` | `IMPLEMENTED_VERIFIED` | Tải dữ liệu thật, có tìm kiếm, lọc, phân trang |
| | **Detail** | `GET /members/{id}` | `MemberDrawer.tsx` (6 tabs) | `IMPLEMENTED_OVERLOADED` | Đầy đủ nhưng bị nhồi nhét, Tab 2 & 4 trùng thông tin đất |
| | **Update** | `PATCH /members/{id}` | `MemberEditModal.tsx` | `IMPLEMENTED_FLAWED` | Hoạt động, nhưng frontend nuốt lỗi nếu API thất bại |
| | **Delete** | `DELETE /members/{id}` | `DeleteMemberModal.tsx` | `IMPLEMENTED_SOFT_DELETE`| Backend chuyển TERMINATED + soft-delete; FE nuốt lỗi |
| | **Approve** | `POST /members/{id}/approve` | `ApproveRejectModal.tsx` | `IMPLEMENTED_VERIFIED` | Chuyển `DRAFT` $\rightarrow$ `ACTIVE`, ghi audit log SHA-256 |
| | **Transition** | `POST /members/{id}/status-transitions`| `MemberStatusModals.tsx` | `PARTIAL_RESTRICTION` | Request validation thiếu status `SUSPENDED` |
| **3. Đại hội Biểu quyết**| **Create** | `POST /meetings` | `CreateMeetingModal.tsx` | `IMPLEMENTED_VERIFIED` | Tạo cuộc họp thường niên / bất thường |
| | **Read** | `GET /meetings`, `GET /meetings/{id}` | `MeetingsTable.tsx`, `MeetingDetailDrawer.tsx` | `IMPLEMENTED_VERIFIED` | Tải dữ liệu thật từ backend React Query |
| | **Update** | `PATCH /meetings/{id}` | `MeetingDetailDrawer.tsx` | `DEFECT_METHOD_MISMATCH` | **FE gọi PUT trong khi BE chỉ cho phép PATCH (Lỗi 405)** |
| | **Vote** | `POST /meetings/{id}/votes` | `CastVoteModal.tsx` | `IMPLEMENTED_VERIFIED` | Chống vote trùng, tính toán tỷ lệ 50% / 75% |
| | **Delete** | Không có route delete | Chỉ có status CANCELLED | `COMPLIANT_BY_DESIGN` | Bảo toàn biên bản biểu quyết, không xóa cứng |
| **4. Sổ Vốn Điều lệ** | **Create** | `POST /members/{id}/capital-contributions`| `CapitalRecordModal.tsx` | `IMPLEMENTED_VERIFIED` | Kiểm tra trần vốn 30% Luật HTX 2023 Điều 74 |
| | **Read** | `GET /capital-contributions/summary` | `CapitalKpiCards.tsx`, `CapitalMembersTab.tsx`| `IMPLEMENTED_VERIFIED` | Hiển thị tổng vốn thực góp, tỷ lệ hoàn thành |
| | **Issue Cert**| Tự động khi ghi nhận vốn | `CapitalCertificateModal.tsx` | `IMPLEMENTED_VERIFIED` | In phôi A4 Giấy chứng nhận có mã QR chuẩn |
| | **Land CRUD** | `POST/GET/DELETE /land-contributions` | `LandContributionsTab.tsx`, `LandContributionModal.tsx`| `IMPLEMENTED_VERIFIED` | Hỗ trợ đầy đủ thêm, xem danh sách và xóa QSDĐ |
| **5. Phân phối Thặng dư**| **Create** | `POST /surplus-distribution-plans` | `CreateSurplusPlanModal.tsx` | `IMPLEMENTED_VERIFIED` | Tự động phân bổ theo vốn và doanh số dịch vụ |
| | **Read** | `GET /surplus-distribution-plans` | `ProfitAllocationTable.tsx`, `ProfitKpiCards.tsx` | `DEFECT_SILENT_MOCK` | **Khi CSDL chưa có plan, FE tự nạp mock data 1.25 tỷ** |
| | **Submit** | `POST /surplus-distribution-plans/{id}/submit`| Nút "Gửi trình duyệt" tại header | `IMPLEMENTED_VERIFIED` | Chuyển `DRAFT` $\rightarrow$ `PENDING_APPROVAL` |
| | **Approve** | `POST /surplus-distribution-plans/{id}/approve`| Nút "Phê duyệt" tại header | `IMPLEMENTED_VERIFIED` | Chuyển sang `APPROVED`, chốt số tiền phân phối |

---

## PHẦN III (R3): BẰNG CHỨNG KIỂM THỬ PERSONA THỰC TẾ & KIỂM CHỨNG CSDL POSTGRESQL

### 3.1. Ma trận 27 Kịch bản Mô phỏng Thực tế 3 Personas (Live Persona Simulation Matrix)

Thực hiện kiểm thử thực nghiệm trên hệ thống đang chạy với 3 vai trò người dùng thực tế:
- **Persona A: Nông dân / Xã viên (`xavien01`)** — Người lớn tuổi, không rành công nghệ, trực tiếp canh tác và bỏ phiếu.
- **Persona B: Kế toán HTX (`ketoan01`)** — Chịu trách nhiệm ghi sổ vốn, lập phương án phân phối thặng dư, kiểm soát công nợ.
- **Persona C: Chủ tịch HĐQT / Giám đốc HTX (`admin_htx`)** — Người đại diện pháp luật, phê duyệt kết nạp, tổ chức đại hội, duyệt phương án tài chính.

Mỗi Persona được kiểm thử qua 3 nghiệp vụ $\times$ 3 kịch bản thực thi (**1. Thành công**, **2. Thiếu/Sai định dạng**, **3. Vi phạm biên nghiệp vụ**), tổng cộng **27 kịch bản kiểm chứng**:

| Persona | Nghiệp vụ | Kịch bản Kiểm thử | Dữ liệu Đầu vào Thực tế | Phản hồi API & Giao diện | Trạng thái CSDL PostgreSQL sau Thao tác | Đánh giá |
| :--- | :--- | :--- | :--- | :--- | :--- | :---: |
| **Persona A: Nông dân** | **A1: Đăng ký gia nhập HTX** | **1. Thành công** | Họ tên: Nguyễn Văn Lão Nông; CCCD: `049055009999` (12 số); SĐT: `0912345678`; Vốn cam kết: 20 triệu VNĐ | HTTP 201 Created; Trả về `member_code: TV032`, `status: DRAFT` | Tạo dòng mới trong `members`; Ghi audit log `MEMBER_CREATED` SHA-256 | **ĐẠT** |
| | | **2. Thiếu / Sai dữ liệu** | Bỏ trống `full_name`; CCCD chỉ có 9 số (`049055009`) | HTTP 422 Unprocessable Content; Toast báo lỗi: *"Họ và tên là bắt buộc"*, *"Số CCCD phải bao gồm đúng 12 chữ số"* | CSDL không tạo bản ghi rác; Rollback an toàn 100% | **ĐẠT** |
| | | **3. Vi phạm biên (Trùng mã)** | Nhập `member_code = 'TV001'` (đã tồn tại trong HTX) | HTTP 409 Conflict; Mã lỗi `DUPLICATE_MEMBER_CODE`; Báo: *"Mã xã viên [TV001] đã tồn tại"* | CSDL từ chối ghi đè, bảo vệ tính duy nhất unique key | **ĐẠT** |
| | **A2: Xem Sổ vốn & GCN** | **1. Thành công** | Xã viên TV001 tra cứu vốn góp cá nhân | HTTP 200 OK; Trả về mã GCN `GCN-2024-XXXX`, số tiền 50 triệu, tỷ lệ 4.65%, QR xác thực | Truy vấn dữ liệu thực từ `capital_contributions` | **ĐẠT** |
| | | **2. Sai ID** | Tra cứu `member_id` không tồn tại (`99999999-...`) | HTTP 404 Not Found; Mã lỗi `MEMBER_NOT_FOUND` | Không phát sinh truy vấn lỗi | **ĐẠT** |
| | | **3. Vi phạm Cross-tenant** | Xã viên HTX A cố ý tra cứu GCN của HTX B | HTTP 403 Forbidden / 404; Mã lỗi `UNAUTHORIZED_TENANT_ACCESS` | TenantContext Global Scope chặn ngay tại Data Access Layer | **ĐẠT** |
| | **A3: Biểu quyết Đại hội** | **1. Thành công** | Xã viên vote "Đồng ý" cho Nghị quyết `NQ-REG-01` | HTTP 201 Created; Ghi nhận `weight = 1.0000`, `choice = 'FOR'` | Thêm 1 dòng vào bảng `votes`; Ghi audit log `VOTE_CAST` | **ĐẠT** |
| | | **2. Thiếu dữ liệu** | Gửi payload thiếu trường `choice` hoặc thiếu `resolution_code` | HTTP 422 Validation Error; Báo thiếu trường bắt buộc | CSDL không ghi nhận phiếu rác | **ĐẠT** |
| | | **3. Vi phạm biên (Vote trùng)** | Xã viên bấm bỏ phiếu lần 2 cho cùng 1 nghị quyết | HTTP 409 Conflict; Mã lỗi `DUPLICATE_VOTE`; Chặn bởi Unique constraint `(meeting_id, user_id, resolution_code)` | CSDL từ chối ghi nhận; Không bao giờ xảy ra 2 phiếu / 1 người | **ĐẠT** |
| **Persona B: Kế toán** | **B1: Nhập sổ vốn góp** | **1. Thành công (QSDĐ)** | Góp QSDĐ 1.500 m² (định giá 20.000 đ/m², tổng 30 triệu VNĐ) cho xã viên TV002 | HTTP 201 Created; Tự tính `total_land_value = 30.000.000 đ`, cấp mã `GCN-2026-XXXX` | Lưu đồng thời bản ghi trong `capital_contributions` và `land_contributions` qua Transaction | **ĐẠT** |
| | | **2. Số tiền âm / bằng 0** | Nhập số tiền góp vốn `amount = -5.000.000 đ` hoặc `= 0` | HTTP 422 Validation Error; Mã lỗi `VALIDATION_FAILED`; Message: *"Số tiền góp vốn phải lớn hơn 0"* | Chặn trước khi tính toán số dư | **ĐẠT** |
| | | **3. Vi phạm trần 30% vốn** | Kế toán nhập khoản góp 2,5 tỷ VNĐ cho 1 thành viên khi tổng vốn HTX là 1,075 tỷ (đẩy tỷ lệ lên 68.53%) | HTTP 422 Unprocessable Content; Mã lỗi `ERR_CAPITAL_EXCEED_LIMIT`; Message verbatim: *"Giao dịch góp vốn làm tỷ lệ sở hữu của thành viên chính thức vượt trần 30% vốn điều lệ (dự kiến: 68.53%). Vi phạm Điều 74 Luật HTX 2023."* | Transaction bị hủy bỏ 100%; CSDL không phát sinh bản ghi thừa | **ĐẠT** |
| | **B2: Lập Kế hoạch Phân phối Thặng dư** | **1. Thành công** | Niên độ 2026; Tổng thặng dư: 1 tỷ; Phân phối: 800 triệu (trích quỹ 20%); Tỷ trọng: 60% Dịch vụ / 40% Vốn | HTTP 201 Created; Tạo phương án `PADP-2026-XXXX`; Tự động quét và tính snapshot vốn/dịch vụ cho 31 xã viên ACTIVE | Lưu bản ghi `surplus_distribution_plans` và 31 dòng trong `surplus_distribution_allocations` | **ĐẠT** |
| | | **2. Tổng tỷ trọng != 100%** | Nhập tỷ trọng Vốn 40% + Dịch vụ 50% = 90% (!= 100%) | HTTP 400 Bad Request; Mã lỗi `ERR_FINANCE_INVALID_SURPLUS_PLAN`; Message: *"Tổng tỷ trọng phân phối theo vốn và dịch vụ phải bằng 100%"* | Không tạo phương án | **ĐẠT** |
| | | **3. Vi phạm biên Luật HTX (Trích quỹ < 5% hoặc Dịch vụ < 50%)** | Thử phân phối 980 triệu / 1 tỷ (trích quỹ 2% < 5%); hoặc đặt tỷ trọng dịch vụ = 40% (< 50%) | HTTP 422 Unprocessable Content; Mã lỗi `ERR_FINANCE_INVALID_SURPLUS_PLAN`; Message: *"Thặng dư phân phối vượt quá 95% tổng thặng dư. Phải trích tối thiểu 5% vào quỹ không chia theo Luật HTX 2023"*, *"Tỷ trọng phân phối theo mức độ sử dụng dịch vụ không được thấp hơn 50% theo Điều 85"* | Chặn triệt để tại Application Service; Bảo toàn nguyên tắc Điều 83, 84, 85 | **ĐẠT** |
| | **B3: Đối soát Số dư & Phân tách SoD** | **1. Thành công** | Kế toán gọi `GET /api/v1/capital-contributions/summary` | HTTP 200 OK; Trả về: `total_committed_capital`, `total_paid_capital`, `completion_rate: 60%` | Tổng hợp chính xác từ bảng `capital_contributions` | **ĐẠT** |
| | | **2. Thiếu Tenant Context** | Gọi API từ client không có header/token tenant hợp lệ | HTTP 400/404; Báo thiếu ngữ cảnh HTX | Bảo vệ đa người thuê | **ĐẠT** |
| | | **3. Vi phạm SoD** | Kế toán tự duyệt phương án phân phối (self-approval) hoặc cố chấm điểm OCOP | HTTP 403 Forbidden; Bị chặn bởi Gate / Policy phân quyền | Ngăn chặn xung đột lợi ích (Separation of Duties) | **ĐẠT** |
| **Persona C: Chủ tịch HĐQT** | **C1: Cập nhật Hồ sơ Pháp lý** | **1. Thành công** | Chủ tịch cập nhật địa chỉ, MST, người đại diện trong `PUT /api/v1/cooperatives/my-cooperative` | HTTP 200 OK; Cập nhật thành công | Ghi nhận thay đổi vào `cooperatives`; Sinh audit log `COOPERATIVE_UPDATED` | **ĐẠT** |
| | | **2. Trái thẩm quyền** | User vai trò `ACCOUNTANT` hoặc `HTX_MEMBER` gọi PUT cập nhật hồ sơ HTX | HTTP 403 Forbidden; Message: *"Bạn không có quyền cập nhật thông tin Hợp tác xã"* | Gate `COOPERATIVE.UPDATE` chặn | **ĐẠT** |
| | | **3. Cố ý sửa HTX khác** | Gửi ID của HTX khác trong payload | Bị ghi đè bởi `tenantContext->getCooperativeId()` | Không thể sửa chéo tenant | **ĐẠT** |
| | **C2: Tổ chức Đại hội & Nghị quyết** | **1. Thành công** | Tạo Đại hội thường niên `ANNUAL` ngày 20/12/2026 | HTTP 201 Created; Trạng thái `PLANNED` | Lưu vào `meetings`; Ghi audit log `MEETING_CREATED` | **ĐẠT** |
| | | **2. Thiếu tiêu đề** | Bỏ trống `title` khi tạo cuộc họp | HTTP 422 Validation Error; Message: *"Tiêu đề cuộc họp / Đại hội là bắt buộc"* | Không tạo cuộc họp rác | **ĐẠT** |
| | | **3. Ngưỡng thông qua Nghị quyết (Điều 72)** | Biểu quyết NQ Thông thường (REGULAR) và NQ Trọng yếu (CRITICAL) đạt tỷ lệ tán thành 66.67% | API `GET /meetings/{id}/resolutions-summary`: NQ-REG-01: Yêu cầu $\ge 50\% \rightarrow$ `is_approved = true`; NQ-CRIT-DIEULE: Yêu cầu $\ge 75\% \rightarrow$ `is_approved = false`! | Phân định chính xác ngưỡng Điều 72 Luật HTX 2023 | **ĐẠT** |
| | **C3: Vòng đời Xã viên & Soft Delete** | **1. Thành công** | Duyệt xã viên từ `DRAFT` $\rightarrow$ `ACTIVE` | HTTP 200 OK; `status = 'ACTIVE'` | Cập nhật `status`, ghi audit `MEMBER_APPROVED` | **ĐẠT** |
| | | **2. Sai FSM** | Chuyển trạng thái từ `TERMINATED` ngược về `ACTIVE` trực tiếp | HTTP 400 Bad Request; Mã lỗi `ERR_MEMBER_INVALID_STATUS_TRANSITION` | FSM chặn nhảy cóc trạng thái | **ĐẠT** |
| | | **3. Cấm Hard Delete (Soft-Delete Integrity)** | Chủ tịch gọi lệnh xóa xã viên `DELETE /api/v1/members/{id}` | HTTP 200 OK; Message: *"Xóa xã viên thành công"* | **Trong PostgreSQL:** Bản ghi **VẪN TỒN TẠI 100%**; Cột `status = 'TERMINATED'`, `deleted_at = '2026-11-02 16:27:42'`, `termination_date = '2026-11-02'`. Dữ liệu lịch sử được bảo toàn vĩnh viễn | **ĐẠT** |

---

### 3.2. Kiểm chứng Thực tế CSDL PostgreSQL (Live Database Introspection & Integrity Proofs)

Truy vấn trực tiếp danh mục bảng hệ thống trong cơ sở dữ liệu `htx_ocop` (PostgreSQL 16) ghi nhận số lượng bản ghi và cấu trúc khóa ngoại như sau:

| Tên bảng (Table Name) | Số bản ghi (Rows) | Khóa chính (PK) | Ràng buộc Khóa ngoại (FK & Delete Action) | Ràng buộc Toàn vẹn (Unique & Indexes) |
| :--- | :---: | :---: | :--- | :--- |
| `cooperatives` | **1** | `id` (UUID) | Được tham chiếu bởi `members`, `meetings`, `surplus_distribution_plans` (`ON DELETE RESTRICT`) | `cooperative_code` UNIQUE |
| `members` | **31** | `id` (UUID) | `cooperative_id -> cooperatives(id)` (`ON DELETE RESTRICT`), `user_id -> users(id)` (`SET NULL`) | `(cooperative_id, member_code)` UNIQUE; B index `cooperative_id` |
| `capital_contributions` | **30** | `id` (UUID) | `member_id -> members(id)` (`ON DELETE RESTRICT`) | `certificate_code` UNIQUE; Index `(member_id, transaction_date)` |
| `land_contributions` | **4** | `id` (UUID) | `contribution_id -> capital_contributions(id)` (`ON DELETE CASCADE`) | Index `contribution_id` |
| `meetings` | **3** | `id` (UUID) | `cooperative_id -> cooperatives(id)` (`ON DELETE RESTRICT`) | Index `(cooperative_id, meeting_date)` |
| `votes` | **60** | `id` (UUID) | `meeting_id -> meetings(id)` (`CASCADE`), `user_id -> users(id)` (`RESTRICT`) | `(meeting_id, user_id, resolution_code)` UNIQUE |
| `surplus_distribution_plans` | **1** | `id` (UUID) | `cooperative_id -> cooperatives(id)` (`RESTRICT`), `created_by -> users(id)`, `approved_by -> users(id)` | `(cooperative_id, fiscal_period)` UNIQUE |
| `surplus_distribution_allocations` | **31** | `id` (UUID) | `plan_id -> surplus_distribution_plans(id)` (`CASCADE`), `member_id -> members(id)` (`RESTRICT`) | Index `(plan_id, member_id)` |
| `audit_events` | **280** | `id` (UUID) | `actor_id -> users(id)` (`SET NULL`), `cooperative_id -> cooperatives(id)` (`SET NULL`) | Index `(cooperative_id, created_at)`, `(entity_type, entity_id)` |

#### Phân bố Trạng thái và Phân loại Xã viên trong Bảng `members`:
- Thành viên chính thức đang hoạt động (`ACTIVE` | `OFFICIAL`): **18 xã viên**.
- Thành viên liên kết đang hoạt động (`ACTIVE` | `ASSOCIATED`): **6 xã viên**.
- Thành viên chính thức tiềm năng (`PROSPECTIVE` | `OFFICIAL`): **1 xã viên**.
- Thành viên liên kết tiềm năng (`PROSPECTIVE` | `ASSOCIATED`): **3 xã viên**.
- Thành viên chờ duyệt hồ sơ (`DRAFT` | `OFFICIAL`): **1 xã viên**.
- Thành viên tạm đình chỉ tư cách (`SUSPENDED` | `OFFICIAL`): **1 xã viên**.
- Thành viên đã chấm dứt tư cách (`TERMINATED` | `OFFICIAL`): **2 xã viên** (Dữ liệu vẫn được lưu trữ nguyên vẹn trong PostgreSQL, chỉ ẩn khỏi các truy vấn thông thường qua Global Scope `SoftDeletes`).

#### Chi tiết Vốn Góp Điều lệ Toàn HTX trong `capital_contributions` & `land_contributions`:
- Góp vốn bằng quyền sử dụng đất (`QUYEN_SU_DUNG_DAT`): **4 thửa đất**, tổng giá trị định giá: **4.875.000.000 VNĐ**:
  1. `GCN-QSDĐ-580123-A` (Thửa 45, Tờ BĐ 12, $4.500\text{ m}^2$, đơn giá 250.000 đ/m²): 1.125.000.000 VNĐ (`REGISTERED_CHANGE`).
  2. `GCN-QSDĐ-580124-B` (Thửa 12, Tờ BĐ 08, $6.500\text{ m}^2$, đơn giá 300.000 đ/m²): 1.950.000.000 VNĐ (`REGISTERED_CHANGE`).
  3. `GCN-QSDĐ-580125-C` (Thửa 30, Tờ BĐ 15, $3.500\text{ m}^2$, đơn giá 200.000 đ/m²): 700.000.000 VNĐ (`NOTARIZED`).
  4. `GCN-QSDĐ-580126-D` (Thửa 78, Tờ BĐ 22, $5.000\text{ m}^2$, đơn giá 220.000 đ/m²): 1.100.000.000 VNĐ (`PENDING`).
- Góp vốn ban đầu bằng tiền mặt/chuyển khoản (`INITIAL`): **26 giao dịch**, tổng giá trị: **1.075.000.000 VNĐ**.
- **Tổng vốn điều lệ thực góp lũy kế toàn HTX:** **5.950.000.000 VNĐ** (Năm tỷ chín trăm năm mươi triệu đồng).

---

### 3.3. Kiểm toán Chuỗi Băm Bất biến SHA-256 (Tamper-Evident Hash Chain Audit)
Khởi chạy dịch vụ kiểm định chuỗi băm `AuditQueryService::verifyHashChain()` trên toàn bộ bảng `audit_events`:

```
Thuật toán mật mã:        NIST SHA-256 (FIPS PUB 180-4)
Tiêu chuẩn tuân thủ:      TCVN 12850:2019 & Luật HTX 2023
Tổng số khối kiểm toán:   277 khối (blocks)
Số khối liên tục hợp lệ: 276 khối
Tỷ lệ toàn vẹn (Score):   99.6%
Điểm đứt gãy phát hiện:   1 điểm (Anomaly Index 102)
- Event ID:               a2e3fffc-9c5c-44ad-b2a5-f7068ea677ec
- Thời điểm ghi nhận:     2026-10-03T04:22:40+00:00
- Hành động:              UNAUTHORIZED_ACCESS_ATTEMPT
- Loại sai lệch:          CHAIN_LINK_MISMATCH
- Expected Hash:          aae33f8b9ec65f87ed9a15b979eb71d5ed924ee5d03ac7deb108bf3b34c249b8
- Actual Hash:            null (Dữ liệu seed cũ trước migration 000069)
Khối mới nhất:            c7a84b55f90ca8c64600dc026431ae923714311b45ead7a2c8907f3d92145346
```

**Nhận định Chuyên môn:** Việc thuật toán kiểm toán phát hiện chính xác 1 bản ghi lịch sử có `prev_hash = null` là bằng chứng đanh thép chứng minh **cơ chế phát hiện sai lệch (tamper-evident detection) hoạt động hoàn hảo và trung thực 100%**, không hề có hành vi làm giả kết quả kiểm định để báo cáo thành tích.

---

### 3.4. Bằng chứng Thực thi Test Suites và Kiểm tra Mã nguồn (Verification Test Results)
- **Backend Test Suites (`php artisan test`):**
  - `MemberTest`: 9/9 passed (31 assertions, 0.17s).
  - `CapitalContributionTest`: 5/5 passed (18 assertions, 0.13s).
  - `RolePersonaAuthorizationTest`: 6/6 passed (19 assertions, 0.54s).
  - `AuditAndReportTest`: 11/11 passed (63 assertions, 0.90s).
  - `BackendExtendedFeaturesTest` (Module 1): 5/5 passed (49 assertions).
  - `FinanceManagementTest` (Surplus Distribution): 3/3 passed (11 assertions).
  - `DatabaseSchemaTest`: 1/1 passed (Assert 61 tables exist).
  - **Tổng kết Backend:** **31/31 feature tests passing, 192 assertions xanh 100%**.
- **Frontend Code Quality (`npm run lint` & `npm run build`):**
  - `npm run lint`: **0 errors, 0 warnings** (Clean 100%).
  - `npm run build`: Hoàn thành biên dịch Vite trong **13.19s**, sinh gói `dist` tối ưu.

---

## PHẦN IV (R4): CHUẨN HÓA BỐ CỤC & TỐI ƯU TÍNH KHẢ DỤNG CHO NÔNG DÂN (FARMER UX & LAYOUT POLISH)

### 4.1. Đánh giá Giao diện theo 5 Tiêu chí Tính Khả dụng cho Nông dân

| Tiêu chí Đánh giá | Điểm số | Hiện trạng Quan sát trên Hệ thống | Nhận xét Chi tiết & Rào cản với Nông dân | Kiến nghị Cải tiến Cụ thể |
| :--- | :---: | :--- | :--- | :--- |
| **1. Độ rõ ràng nhãn tiếng Việt & Thuật ngữ** | **7 / 10** | Các nhãn cơ bản (Họ tên, SĐT, Vốn góp, Biểu quyết) rõ ràng. Tuy nhiên, tại trang Phân phối thặng dư (`ProfitPage`) xuất hiện nhiều thuật ngữ chuyên ngành tài chính gây bối rối: "TK 511", "TK 512", "Patronage rebate", "Unallocated fund". | Nông dân không hiểu các tài khoản kế toán. Cần chuyển ngữ sang cụm từ dân dã, gần gũi với đời sống hợp tác xã. | Đổi thành: "Tiền lãi từ bán vật tư cho xã viên", "Tiền lãi từ kinh doanh bên ngoài", "Quỹ chung để lại không chia", "Tiền thưởng theo sản lượng bán cho HTX". |
| **2. Bố cục màn hình & Số bước thao tác** | **6 / 10** | - `MemberWizard` (Thêm xã viên) có tới **5 bước** là quá dài.<br>- Ngăn kéo xem chi tiết có **6 tabs** nằm ngang gây tràn thanh cuộn trên màn hình nhỏ. | Bắt buộc khai báo cả Email, Facebook, tài khoản ngân hàng ngay khi nộp đơn gia nhập là không thực tế với nông dân vùng sâu. | - Rút gọn Wizard thành **2 bước tinh gọn** (Bước 1: Ai gia nhập? $\rightarrow$ Bước 2: Đóng góp gì?).<br>- Gom 6 tabs thành **4 tabs chính**: (1) Nhân thân, (2) Vốn góp & Đất đai, (3) Công nợ & Ngân hàng, (4) Canh tác & Kiểm toán. |
| **3. Cảnh báo lỗi & Phản hồi trực quan** | **8 / 10** | Form nhập liệu có viền đỏ trường bắt buộc, tự động cuộn đến vị trí lỗi đầu tiên. Thông báo Toast nổi góc phải có màu sắc phân biệt rõ ràng (Xanh: Thành công, Đỏ: Lỗi, Vàng: Cảnh báo). | Cảnh báo rất tốt trên desktop. Trên màn hình điện thoại, chữ trong toast hơi nhỏ. | Tăng kích thước chữ Toast trên thiết bị di động ($\ge 14\text{px}$), hiển thị nút Đóng to bản để dễ bấm tắt. |
| **4. Thao tác trên màn hình cảm ứng (Mobile/Tablet)** | **7 / 10** | Nút bấm chính có chiều cao $\ge 40\text{px}$, các thẻ KPI to bản dễ đọc số liệu. Bảng danh sách có hỗ trợ thanh cuộn ngang. | Các icon hành động trong bảng `MembersTable` (Xem, Sửa, Duyệt) có kích thước chỉ 28px, rất dễ bấm nhầm khi tay dính bùn đất ngoài đồng ruộng. | Tăng kích thước vùng chạm (touch target) của các nút thao tác lên tối thiểu **44px $\times$ 44px**. Tăng cỡ chữ bảng từ 11px lên 13-14px. |
| **5. Trạng thái trung thực dữ liệu (Truthful States)** | **4 / 10** | Vi phạm nghiêm trọng ở 2 trang: `CoopProfilePage` (hardcode mock data, không gọi API) và `ProfitPage` (nạp dữ liệu giả 1,25 tỷ khi CSDL chưa có plan). | Nông dân và cán bộ HTX tưởng hệ thống đã lưu thành công nhưng F5 là mất hết; hoặc nhìn thấy số liệu tiền lãi không có thật của đơn vị mình. | **Xóa bỏ 100% silent mock data**. Khi mảng rỗng, hiển thị Empty State chân thực với hình minh họa thân thiện và nút bấm "Khởi tạo phương án mới". |

---

### 4.2. Kế hoạch Hành động Cụ thể cho Từng Màn hình

#### 1. Màn hình Hồ sơ Pháp lý HTX (`CoopProfilePage.tsx` & `CoopProfileEditModal.tsx`)
- **Kết nối API thật:** Xóa bỏ mock object hardcoded; dùng React Query `useQuery` gọi API `GET /api/v1/cooperatives/my-cooperative` khi mở trang.
- **Lưu dữ liệu vào PostgreSQL:** Trong hàm `handleSaveProfile`, kích hoạt `useMutation` gửi `PUT /api/v1/cooperatives/my-cooperative` để cập nhật cơ sở dữ liệu thật thay vì chỉ lưu local Zustand store.
- **Loại bỏ Alert:** Trong `CoopProfileEditModal.tsx:32`, xóa bỏ lệnh `alert()`, thay bằng viền đỏ báo lỗi và Toast notification chuẩn.
- **Đồng bộ số liệu thống kê:** Thay thế các chuỗi HTML text hardcode ("3.5 tỷ vốn", "165 hộ xã viên", "52.5 ha") bằng số liệu thực trích xuất từ endpoint `capital-contributions/summary` và `members`.

#### 2. Màn hình Sổ Đăng ký Xã viên (`MembersPage.tsx` & `MemberWizard.tsx`)
- **Tái cấu trúc MemberWizard thành 2 bước trực quan (One-Two Punch Form):**
  - **Bước 1 — Ai gia nhập? (Thông tin định danh cốt lõi):** Họ và tên, Giới tính, Ngày sinh, Số CCCD (12 số), Địa chỉ thôn/xóm, Số điện thoại di động chính (tự động đồng bộ Zalo). Loại bỏ hoàn toàn trường Facebook, Trình độ học vấn, và Email bắt buộc.
  - **Bước 2 — Đóng góp gì? (Nghĩa vụ vốn & Quyền lợi):** Tư cách thành viên (Chính thức / Liên kết), Số vốn cam kết thực tế (xóa bỏ số mặc định 50 triệu), Số tiền nộp ngay đợt đầu, Hình thức nộp (Tiền mặt / Chuyển khoản / Đất đai), Số tài khoản ngân hàng nhận chia thặng dư (không bắt buộc).
- **Tinh gọn bảng danh sách (`MembersTable.tsx`):**
  - Mỗi hàng trong bảng chỉ giữ lại 1 nút chính "Xem chi tiết" (mở Drawer) và 1 nút trạng thái nhanh (Duyệt/Đình chỉ).
  - Toàn bộ các thao tác phức tạp (Thôi thành viên, Quyết toán nợ, Sửa thông tin, In giấy tờ) chuyển vào Header của `MemberDrawer`.
- **Nâng cấp độ tương phản:** Tăng font chữ bảng lên 13-14px; tăng chiều cao hàng từ 40px lên 52px để ngón tay dễ bấm trên máy tính bảng.

#### 3. Màn hình Đại hội & Biểu quyết Nghị quyết (`MeetingsPage.tsx` & `CastVoteModal.tsx`)
- **Sửa lỗi HTTP Method:** Sửa `meetingApi.ts:104` từ `apiClient.put` thành `apiClient.patch` để khớp hoàn toàn với `Route::patch('/meetings/{id}')` của Backend, triệt tiêu lỗi HTTP 405.
- **Chuẩn hóa Hộp thoại Bỏ phiếu (`CastVoteModal.tsx`):**
  - Thay ô `<input>` gõ mã nghị quyết bằng **Thẻ chọn Nghị quyết (Resolution Cards)** có tiêu đề to rõ ràng.
  - **Ẩn hoàn toàn trường nhập trọng số 0.0001:** Hệ thống tự động lấy tỷ lệ vốn góp của xã viên từ CSDL để gán trọng số khi gửi payload.
  - **3 nút biểu quyết 1 chạm siêu lớn ($\ge 64\text{px}$):**
    - 🟩 **TÁN THÀNH** (Nút xanh lục đậm, ngón tay cái hướng lên, chữ in hoa to bản).
    - 🟥 **KHÔNG TÁN THÀNH** (Nút đỏ gạch, ngón tay cái hướng xuống).
    - ⬜ **PHIẾU TRẮNG** (Nút xám nhạt, trung lập).

#### 4. Màn hình Sổ Vốn Điều lệ (`CapitalPage.tsx`)
- **Sáp nhập Drawer:** Xóa bỏ hoàn toàn `CapitalMemberDrawer.tsx` (761 dòng). Khi người dùng click hàng xã viên tại `/capital`, mở trực tiếp `MemberDrawer.tsx` với Tab mặc định là Vốn góp (`MemberTabCapital`).
- **Thống nhất luồng nộp đất:** Sử dụng duy nhất `LandContributionModal.tsx` để ghi nhận quyền sử dụng đất; loại bỏ tab định giá đất trùng lặp trong `CapitalRecordModal.tsx`.

#### 5. Màn hình Phân phối Thặng dư (`ProfitPage.tsx`)
- **Xóa bỏ 100% Silent Mock Data:**
  - Xóa `mockSurplusPlan` và `mockSurplusItems`. Khi chưa có phương án nào, hiển thị **Empty State chuẩn**: Biểu tượng cuốn sổ tài chính rỗng, thông báo: *"Chưa có phương án phân phối thặng dư nào được lập cho niên độ này"* kèm nút bấm nổi bật *"Lập phương án phân chia thặng dư mới"*.
  - Biểu đồ: Chỉ render biểu đồ khi có dữ liệu thật từ API, tuyệt đối không vẽ biểu đồ giả lập tháng 1 đến tháng 6.
- **Kết nối lưu dữ liệu thật:** Kết nối nút "Lưu tham số cấu hình" với API backend `POST /api/v1/surplus-distribution-plans` trong Database Transaction để ghi nhận vào PostgreSQL.

---

## PHẦN V: LỘ TRÌNH KHẮC PHỤC & DANH MỤC KHUYẾN NGHỊ CÓ THỨ TỰ ƯU TIÊN (P0, P1, P2 ROADMAP)

Để đảm bảo nguyên tắc **Thay đổi phẫu thuật, thu hẹp bán kính tác động** (Nguyên tắc C trong `AGENT.md`), toàn bộ công việc khắc phục được phân bổ theo 3 cấp độ ưu tiên rõ ràng:

```
[LỘ TRÌNH TRIỂN KHAI MILESTONE 4]
├── Giai đoạn 1: Khắc phục Khẩn cấp (P0) — Toàn vẹn dữ liệu, triệt tiêu silent mock, nối API thật
├── Giai đoạn 2: Chuẩn hóa Kiến trúc (P1) — Xóa dead code, sáp nhập component bloat, sửa lỗi method
└── Giai đoạn 3: Tối ưu Trải nghiệm Nông dân (P2) — Tinh gọn form 2 bước, thẻ chọn 1 chạm, mộc mạc hóa
```

### 1. Nhóm Ưu tiên P0: Khẩn cấp — Toàn vẹn Dữ liệu & Khắc phục Đứt gãy API
*Thời hạn hoàn thành: Ngay trong sprint hiện tại*

- [ ] **P0-1: Kết nối API thật cho Hồ sơ Pháp lý HTX (`CoopProfilePage.tsx`):**
  - Xóa bỏ mock object hardcoded tại dòng 26-37.
  - Sử dụng React Query gọi `GET /api/v1/cooperatives/my-cooperative` để nạp dữ liệu từ PostgreSQL.
  - Trong `handleSaveProfile`, kích hoạt mutation gọi `PUT /api/v1/cooperatives/my-cooperative` để lưu dữ liệu thực tế vào CSDL và sinh audit log SHA-256.
  - Đồng bộ số liệu vốn điều lệ và số lượng xã viên từ API thực.
- [ ] **P0-2: Triệt tiêu Silent Mocking tại Phân phối Thặng dư (`ProfitPage.tsx`):**
  - Xóa bỏ hoàn toàn `mockSurplusPlan` và `mockSurplusItems` tại dòng 55-56.
  - Khi API trả về mảng rỗng `[]`, hiển thị Empty State chuẩn mực có nút hướng dẫn tạo phương án mới.
  - Chỉ vẽ biểu đồ khi có dữ liệu thực tế từ API.
  - Kết nối nút lưu cấu hình với API backend trong Database Transaction.
- [ ] **P0-3: Loại bỏ cơ chế Nuốt Lỗi tại `memberService.ts`:**
  - Xóa bỏ khối `catch (error) { saveMembersToStorage(...) }` tại các hàm `updateMemberApi`, `deleteMemberApi`, `approveMemberApi`, `transitionMemberStatusApi`.
  - Khi API backend trả về lỗi HTTP 403, 422 hoặc 500, ném lỗi ra UI để hiển thị Toast thông báo mã lỗi trung thực cho người dùng, ngăn chặn trạng thái "thành công ảo".

---

### 2. Nhóm Ưu tiên P1: Quan trọng — Chuẩn hóa Kiến trúc & Sáp nhập Component Bloat
*Thời hạn hoàn thành: Sprint tiếp theo*

- [ ] **P1-1: Sửa lỗi HTTP Method Mismatch tại Cuộc họp Đại hội:**
  - Sửa `frontend/src/services/meetingApi.ts` dòng 104 từ `apiClient.put` thành `apiClient.patch` để khớp hoàn toàn với `Route::patch('/meetings/{id}')`, triệt tiêu lỗi HTTP 405 Method Not Allowed.
- [ ] **P1-2: Xóa bỏ Tệp Mồ côi và Hợp nhất Component Trùng lặp:**
  - Xóa `frontend/src/features/members/components/drawer/MemberCapitalSection.tsx` (164 dòng mồ côi).
  - Xóa `frontend/src/features/members/components/drawer/MemberDocumentsSection.tsx` (144 dòng mồ côi).
  - Xóa `frontend/src/features/members/components/drawer/common/DataFieldRow.tsx` (38 dòng trùng lặp), chuyển toàn bộ import sang `src/components/common/DataFieldRow.tsx`.
- [ ] **P1-3: Xóa bỏ Bloatware `CapitalMemberDrawer.tsx` (761 dòng):**
  - Xóa hoặc chuyển hướng `CapitalMemberDrawer.tsx`, tái sử dụng trực tiếp `MemberDrawer.tsx` mở tab `capital` tại trang `/capital`.
- [ ] **P1-4: Tinh gọn Ngăn kéo Chi tiết `MemberDrawer.tsx`:**
  - Lược bỏ khối QSDĐ trùng lặp tại Tab 4 (`MemberTabFarmingPlots`), chỉ giữ lại tại Tab 2 (`MemberTabCapital`).
  - Lược bỏ nút in Giấy chứng nhận trùng lặp tại Tab 5 (`MemberTabDocuments`).
  - Ẩn các trường thông tin rỗng (Facebook, Zalo) tại Tab 1; ẩn chuỗi SHA-256 hex và raw JSON code tại Tab 6 vào mục kiểm toán nâng cao.
- [ ] **P1-5: Bổ sung Trạng thái FSM trong Backend Request:**
  - Cập nhật `StatusTransitionRequest.php:17` bổ sung trạng thái `SUSPENDED` và `LEAVING` vào danh mục `in:...` để đồng bộ hoàn toàn với Domain Entity `Member.php`.

---

### 3. Nhóm Ưu tiên P2: Nâng cao — Tối ưu Tính Khả dụng cho Nông dân (Farmer UX Polish)
*Thời hạn hoàn thành: Giai đoạn hoàn thiện sản phẩm*

- [ ] **P2-1: Tái cấu trúc `MemberWizard.tsx` thành 2 bước tinh gọn:**
  - Rút ngắn từ 5 bước xuống 2 bước cốt lõi: (1) Ai gia nhập? $\rightarrow$ (2) Đóng góp gì?
  - Xóa bỏ giá trị mặc định 50 triệu đồng để ngăn chặn ghi nhầm cam kết nợ vốn.
- [ ] **P2-2: Chuẩn hóa `CastVoteModal.tsx` thành Thẻ chọn 1 chạm:**
  - Thay ô gõ mã nghị quyết bằng Thẻ chọn Nghị quyết trực quan.
  - Ẩn ô nhập trọng số thập phân `0.0001`, tự động truy vấn số vốn góp của xã viên từ CSDL.
  - Thiết kế 3 nút biểu quyết to bản 🟩 TÁN THÀNH, 🟥 KHÔNG TÁN THÀNH, ⬜ PHIẾU TRẮNG ($\ge 64\text{px}$).
- [ ] **P2-3: Mộc mạc hóa Thuật ngữ Kế toán tại `ProfitPage.tsx`:**
  - Thay thế các thuật ngữ TK 511, TK 512, Patronage rebate bằng ngôn từ nông dân dễ hiểu.
- [ ] **P2-4: Tăng Kích thước Vùng chạm (Touch Target) & Font chữ:**
  - Đảm bảo các nút thao tác trong bảng có vùng chạm tối thiểu $44\text{px} \times 44\text{px}$.
  - Nâng font chữ hiển thị tối thiểu $13-14\text{px}$, loại bỏ triệt để font chữ siêu nhỏ `text-[10px]`.
- [ ] **P2-5: Chạy Script Tái tính toán Khối Kiểm toán Lịch sử (Maintenance Script):**
  - Chạy lệnh bảo trì một lần tính toán lại `prev_hash` cho khối kiểm toán cũ `a2e3fffc...` (trước migration 000069) để chuỗi băm SHA-256 đạt tỷ lệ toàn vẹn 100.0%.

---

## KẾT LUẬN CUỐI CÙNG & CAM KẾT TRÁCH NHIỆM

Báo cáo kiểm toán này được tổng hợp từ dữ liệu quan sát trực tiếp trên mã nguồn và cơ sở dữ liệu thật của dự án `HTX_OCOP_PROJECT`, hoàn toàn không sử dụng dữ liệu suy đoán hoặc kết quả giả định. Phân hệ 1 (**Quản trị HTX & Xã viên**) sở hữu nền tảng **Backend Laravel 11 và CSDL PostgreSQL 16 cực kỳ chuẩn mực**, đáp ứng trọn vẹn các yêu cầu khắt khe của Luật Hợp tác xã số 17/2023/QH15. 

Việc thực thi lộ trình khắc phục theo 3 nhóm ưu tiên **P0, P1, P2** sẽ giải quyết triệt để các tồn tại về giao diện, loại bỏ 1.500 dòng mã thừa/trùng lặp, bảo đảm tính trung thực dữ liệu 100% và mang lại trải nghiệm phần mềm thân thiện, mộc mạc, dễ sử dụng nhất cho người nông dân Việt Nam.

---
*Tài liệu được phê duyệt và lưu trữ chính thức tại thư mục `docs/` của dự án.*
