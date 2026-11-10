# BÁO CÁO KIỂM TOÁN KIẾN TRÚC UI/UX, THÀNH PHẦN DƯ THỪA & TÍNH KHẢ DỤNG CHO NÔNG DÂN
## PHÂN HỆ 1: QUẢN TRỊ HỢP TÁC XÃ & XÃ VIÊN (MILESTONE 4)

- **Người thực hiện:** Explorer 1 (UI/UX Architecture, Bloat & Farmer Usability)
- **Mã định danh:** `explorer_m4_uiux`
- **Phân hệ thẩm tra:** Phân hệ 1 — Quản trị HTX & Xã viên (Hồ sơ pháp lý, Xã viên, Đại hội biểu quyết, Sổ vốn điều lệ, Phân phối thặng dư)
- **Căn cứ pháp lý & quy chuẩn:** Luật Hợp tác xã số 17/2023/QH15, Thông tư 71/2024/TT-BTC, Nghị định 113/2024/NĐ-CP, `AGENT.md`, `GEMINI.md`, `docs/00_RULES_REGISTER.md`.

---

## 1. OBSERVATION (QUAN SÁT THỰC TẾ MÃ NGUỒN)

### 1.1. Bản đồ tổng thể cấu trúc Frontend Phân hệ 1
Quá trình quét toàn bộ thư mục `frontend/src/features/members/` và các cấu hình định tuyến liên quan (`frontend/src/router/AppRoutes.tsx`, lines 68–74; `frontend/src/router/navigation.ts`, lines 54–88) ghi nhận Phân hệ 1 gồm 5 màn hình chính và 26 components/modals/drawers:

1. **Hồ sơ Pháp lý HTX** (`/cooperative`): `frontend/src/features/members/pages/CoopProfilePage.tsx` (198 dòng) & `CoopProfileEditModal.tsx` (172 dòng).
2. **Quản lý Xã viên** (`/members`): `frontend/src/features/members/pages/MembersPage.tsx` (379 dòng), `MembersTable.tsx` (368 dòng), `MemberDrawer.tsx` (167 dòng) cùng 6 tab drawers, `MemberWizard.tsx` (432 dòng), `MemberEditModal.tsx` (165 dòng), `MemberStatusModals.tsx` (342 dòng), `MemberTerminationCheckModal.tsx` (175 dòng), `MemberProfileModal.tsx` (422 dòng), `MemberKpiCards.tsx` (159 dòng).
3. **Đại hội & Biểu quyết** (`/meetings`): `frontend/src/features/members/pages/MeetingsPage.tsx` (213 dòng), `MeetingsTable.tsx` (186 dòng), `MeetingDetailDrawer.tsx` (320 dòng), `CreateMeetingModal.tsx` (188 dòng), `CastVoteModal.tsx` (228 dòng), `ResolutionsSummaryCard.tsx` (178 dòng).
4. **Sổ Vốn Điều lệ & Đóng góp QSDĐ** (`/capital`): `frontend/src/features/members/pages/CapitalPage.tsx` (414 dòng), `CapitalMembersTab.tsx` (327 dòng), `CapitalMemberDrawer.tsx` (761 dòng), `CapitalRecordModal.tsx` (288 dòng), `CapitalPendingModal.tsx` (125 dòng), `CapitalCertificateModal.tsx` (302 dòng), `CapitalVoucherModal.tsx` (188 dòng), `LandContributionsTab.tsx` (231 dòng), `LandContributionModal.tsx` (286 dòng), `CapitalKpiCards.tsx` (188 dòng), `CapitalCharts.tsx` (168 dòng).
5. **Phân phối Thặng dư** (`/profit-distribution`): `frontend/src/features/members/pages/ProfitPage.tsx` (366 dòng), `ProfitKpiCards.tsx` (116 dòng), `ProfitParamConfigCard.tsx` (204 dòng), `ProfitAllocationTable.tsx` (342 dòng), `ProfitCharts.tsx` (112 dòng), `CreateSurplusPlanModal.tsx` (196 dòng), `SurplusVoucherPrintModal.tsx` (121 dòng).

---

### 1.2. Phát hiện các thành phần mồ côi (Orphan) & Trùng lặp hoàn toàn (R1)

| STT | Thành phần trùng lặp / Dư thừa | Đường dẫn file & Số dòng | Hiện trạng & Bằng chứng mã nguồn |
| :--- | :--- | :--- | :--- |
| **1** | `MemberCapitalSection.tsx` (MỒ CÔI) | `frontend/src/features/members/components/drawer/MemberCapitalSection.tsx` (164 dòng) | File tồn tại độc lập nhưng **không có bất kỳ file nào trong dự án import** (grep search `MemberCapitalSection` chỉ trả về chính định nghĩa của file). Tab Vốn góp thực tế đang dùng `MemberTabCapital.tsx`. |
| **2** | `MemberDocumentsSection.tsx` (MỒ CÔI) | `frontend/src/features/members/components/drawer/MemberDocumentsSection.tsx` (144 dòng) | File mồ côi, không được import ở bất cứ đâu. Tab Hồ sơ thực tế đang dùng `MemberTabDocuments.tsx`. |
| **3** | `DataFieldRow.tsx` (TRÙNG LẶP CODE 98%) | • `frontend/src/features/members/components/drawer/common/DataFieldRow.tsx` (38 dòng)<br>• `frontend/src/components/common/DataFieldRow.tsx` (42 dòng) | Hai file giống hệt nhau về cấu trúc JSX và props (chỉ khác 1 prop `valueClassName`). Các module khác (`AuditLogTabSecurity`, `MaterialTabOverview`, `ProductTabCommercial`) đều dùng component dùng chung tại `src/components/common/DataFieldRow.tsx`. |
| **4** | `CapitalMemberDrawer.tsx` (TRÙNG LẶP TOÀN BỘ DRAWER XÃ VIÊN) | `frontend/src/features/members/components/CapitalMemberDrawer.tsx` (761 dòng) | Trùng lặp 80% chức năng với `MemberDrawer.tsx` (gồm 5 tab `overview`, `history`, `land`, `certificate`, `bank`). Đều hiển thị cùng 1 đối tượng xã viên, lặp lại toàn bộ logic số dư, lịch sử giao dịch và giấy chứng nhận. |
| **5** | `LandContributionModal.tsx` vs `CapitalRecordModal.tsx` (XUNG ĐỘT QUẢN TRỊ ĐẤT ĐAI) | • `frontend/src/features/members/components/LandContributionModal.tsx` (286 dòng)<br>• `frontend/src/features/members/components/CapitalRecordModal.tsx` (288 dòng + `CapitalStep2Valuation.tsx`) | Cả 2 modal đều có form nhập đất: `land_certificate_no`, `plot_number`, `map_sheet_number`, `land_area_sqm`, `land_use_type`, `appraised_unit_price`, `cadastral_status`. Một modal gọi endpoint `/api/members/{id}/land-contributions`, modal còn lại gọi `/api/members/{id}/capital-contributions` với type `'LAND'`. |
| **6** | `CreateSurplusPlanModal.tsx` vs `ProfitParamConfigCard.tsx` (TRÙNG CẤU HÌNH THẶNG DƯ) | • `frontend/src/features/members/components/profit/CreateSurplusPlanModal.tsx` (196 dòng)<br>• `frontend/src/features/members/components/profit/ProfitParamConfigCard.tsx` (204 dòng) | Hai giao diện cùng nhập các tỷ lệ trích quỹ và trọng số phân bổ thặng dư. Một giao diện nằm trên Card (`ProfitParamConfigCard`), một giao diện mở Modal popup (`CreateSurplusPlanModal`), gây nhầm lẫn luồng dữ liệu. |
| **7** | Trùng lặp nút bấm Thao tác giữa Table và Drawer | • `MembersTable.tsx` (lines 243–325)<br>• `MemberDrawerHeader.tsx` (lines 98–168) | Mỗi dòng trong bảng `MembersTable` chứa 6 nút bấm (Duyệt, Từ chối, Đình chỉ, Quyết toán, Khôi phục, Thôi TV, Sửa). Khi click vào hàng để mở `MemberDrawer`, phần Header của Drawer lại lặp lại chính xác các nút bấm này. |

---

### 1.3. Rà soát Chi tiết Màn hình xem nhanh (Detail Drawer/Modal Bloat Audit)

Dưới đây là bảng đánh giá từng trường thông tin trên các màn hình xem chi tiết (Detail Drawer và Detail Modal), phân loại rõ **[NÊN GIỮ]** và **[GÂY RỐI MẮT — CẦN LƯỢC BỎ HOẶC THU GỌN]**:

#### A. `MemberDrawer.tsx` (Ngăn kéo chi tiết Xã viên — 6 Tabs)
*Đường dẫn:* `frontend/src/features/members/components/MemberDrawer.tsx` và thư mục `drawer/tabs/`

| Tab / Thành phần | Dòng mã | Thông tin [NÊN GIỮ] | Thông tin [GÂY RỐI MẮT — CẦN LƯỢC BỎ / THU GỌN] | Lý do nghiệp vụ & UX |
| :--- | :--- | :--- | :--- | :--- |
| **Drawer Header** (`MemberDrawerHeader.tsx`) | Lines 48–94 | Họ tên, Mã xã viên, Tư cách thành viên (Chính thức/Liên kết), Badge trạng thái hoạt động. | Lặp lại nghề nghiệp, các nút hành động nhỏ li ti bị nhồi nhét cùng nút Đóng. | Nông dân cần nhìn rõ trạng thái xã viên và nút Đóng rõ ràng. |
| **Tab 1: Thông tin cá nhân** (`MemberTabPersonal.tsx`) | Lines 16–96 | • Họ tên, CCCD/Định danh, Ngày cấp, Nơi cấp.<br>• Ngày sinh, Giới tính.<br>• Địa chỉ thường trú (Thôn/xóm, Xã).<br>• Số điện thoại, Số Zalo.<br>• Ngày gia nhập HTX, Tỷ lệ sở hữu vốn. | • **Tài khoản Facebook** (Line 62): Nông dân lớn tuổi không dùng Facebook làm kênh hành chính HTX.<br>• **Trình độ chuyên môn** (Line 39): Luôn để trống hoặc "—".<br>• **Nghề nghiệp chính** (Line 43): 99% xã viên là "Nông nghiệp".<br>• **Dân tộc** (Line 44): Không phục vụ quản trị HTX hàng ngày.<br>• Lặp lại Mã thành viên & Họ tên (đã có ở Header). | Loại bỏ 4 trường rác giúp Card thông tin cá nhân tinh gọn, tăng font size từ 11px lên 13-14px rõ ràng cho người lớn tuổi. |
| **Tab 2: Vốn góp & Cổ phần** (`MemberTabCapital.tsx`) | Lines 58–140 | • Tổng vốn cam kết, Vốn thực góp, Số vốn còn thiếu.<br>• Tỷ lệ sở hữu % (kèm cảnh báo trần 30%).<br>• Lịch sử nộp vốn (Ngày nộp, Số tiền, Người thu, Mã phiếu thu).<br>• Nút "In chứng nhận vốn góp (A4)". | • Hàm đọc số giả lập `numberToVietnameseWords` (Lines 19–24: hardcode nếu 50 triệu / 10 triệu).<br>• Nút "Chuyển tới Sổ Vốn Điều Lệ" thừa thãi khi người dùng đang ở trong Drawer xem nhanh. | Thay thế hàm đọc số bằng util chuẩn; giữ bảng lịch sử nộp tiền rõ ràng. |
| **Tab 3: Tài chính & Công nợ** (`MemberTabFinanceDebt.tsx`) | Lines 23–134 | • Dư nợ vật tư hiện tại, Hạn mức ứng nợ tối đa.<br>• Tỷ lệ sử dụng hạn mức nợ (kèm cảnh báo an toàn).<br>• Thông tin nhận tiền: Hình thức chi trả, Tên ngân hàng, Số tài khoản, Chủ tài khoản. | • Ghi chú dài dòng "Quy tắc BR-FIN-002" (Lines 119–121) mang tính kỹ thuật lập trình, không phù hợp cho người dùng cuối.<br>• Trích dẫn điều luật Điều 62 dạng text chiếm nửa màn hình. | Chuyển trích dẫn điều luật thành icon tooltip (i) nhỏ gọn; giữ nổi bật số dư nợ và tài khoản ngân hàng. |
| **Tab 4: Canh tác & Thửa đất** (`MemberTabFarmingPlots.tsx`) | Lines 39–200 | • Danh sách thửa đất được phân công (Mã thửa, Diện tích ha, Trạng thái).<br>• Đóng góp quyền sử dụng đất (Số sổ đỏ, Thửa số, Tờ bản đồ, Diện tích m²). | • "Năng lực cung ứng nông sản hàng năm" (Lines 39–76): 4 trường Sản lượng năm, Sản phẩm, Hình thức canh tác, PHI status đều hiển thị "Chưa ghi nhận" hoặc text tĩnh. | Gộp thông tin thửa đất và đất góp vốn thành 1 danh sách trực quan, ẩn khối năng lực cung ứng nếu chưa có dữ liệu canh tác thực tế. |
| **Tab 5: Hồ sơ & Giấy tờ** (`MemberTabDocuments.tsx`) | Lines 25–144 | • Đơn gia nhập HTX (PDF).<br>• Giấy chứng nhận cổ phần/vốn góp HTX.<br>• Bản scan CCCD đối soát danh tính. | • Nút "In phiếu thu" xuất hiện lặp lại ở cả Tab Capital lẫn Tab Documents.<br>• Nút xem trước file giả lập link mẫu `/docs/sample_agreement.pdf`. | Chuẩn hóa danh mục tài liệu thành danh sách file tải về / in ấn tập trung. |
| **Tab 6: Nhật ký & Truy vết** (`MemberTabAuditTrace.tsx`) | Lines 66–238 | • Dòng thời gian thay đổi trạng thái (Ngày giờ, Người thực hiện, Hành động: Tạo mới, Duyệt, Đình chỉ). | • **Chuỗi mã băm SHA-256 dài 64 ký tự** (Lines 166–184) kèm nút Copy hash.<br>• **Chi tiết Before / After dạng JSON raw code** (Lines 187–229): `{ "status": "PENDING" }`... | Nông dân và cán bộ cơ sở **hoàn toàn không hiểu JSON và SHA-256**. Cần ẩn JSON/Hash vào tab "Nâng cao / Dành cho Kiểm toán viên" hoặc chỉ hiển thị tóm tắt tiếng Việt. |

---

#### B. `MeetingDetailDrawer.tsx` (Ngăn kéo chi tiết Cuộc họp & Đại hội)
*Đường dẫn:* `frontend/src/features/members/components/meetings/MeetingDetailDrawer.tsx` (320 dòng)

| Thành phần | Dòng mã | Thông tin [NÊN GIỮ] | Thông tin [GÂY RỐI MẮT — CẦN LƯỢC BỎ / THU GỌN] | Lý do nghiệp vụ & UX |
| :--- | :--- | :--- | :--- | :--- |
| **Thông tin pháp lý cuộc họp** | Lines 157–193 | • Tiêu đề cuộc họp, Loại hình đại hội (Thường niên / Bất thường).<br>• Ngày tổ chức, Trạng thái (Đang diễn ra / Đã bế mạc).<br>• Nội dung chương trình / Dự thảo nghị quyết. | • **Mã cuộc họp UUID** (Line 162: `d3b07384-d113-4611...`) hiển thị thô ra giao diện, gây rối mắt cho người dùng. | Thay mã UUID bằng mã hiển thị thân thiện như `ĐH-2026-01`. |
| **Kết quả biểu quyết** | Lines 196–213 | Tỷ lệ Tán thành (%), Không tán thành (%), Phiếu trắng (%) theo từng Nghị quyết. | Không có thông tin số lượng cử tri đã tham gia bỏ phiếu trên tổng số xã viên có quyền biểu quyết. | Bổ sung tỷ lệ đại biểu tham dự (Quorum: $\ge 50\%$ hoặc $\ge 75\%$) để người dùng biết nghị quyết đã đủ điều kiện thông qua hay chưa. |
| **Danh sách phiếu biểu quyết** | Lines 228–260 | Tên xã viên, Lựa chọn (Tán thành/Không/Trắng), Thời gian bỏ phiếu. | • **Cột trọng số thập phân** (Line 235: `weight = 0.0452` hoặc `1.0`) hiển thị trần trụi số thực không định dạng. | Hiển thị trọng số theo tỷ lệ phần trăm vốn góp `% Vốn` hoặc `1 phiếu nhân thân` thay vì số thực thập phân khó hiểu. |

---

#### C. `CapitalMemberDrawer.tsx` (Ngăn kéo chi tiết Vốn góp — 761 dòng)
*Đường dẫn:* `frontend/src/features/members/components/CapitalMemberDrawer.tsx`

- **Đánh giá tổng thể:** Toàn bộ component này là **bloatware khổng lồ** (761 dòng) chạy song song với `MemberDrawer.tsx`.
- **Thông tin dư thừa nghiêm trọng:**
  1. *Tab Certificate (Lines 380–520):* Render nguyên một phôi Giấy chứng nhận A4 giả lập thu nhỏ với QR code, con dấu, căn cứ luật định ngay trong khung ngăn kéo chiều rộng 600px, chữ bị co rúm, không đọc được và không in chuẩn. Đã có component `CapitalCertificateModal.tsx` in A4 hoàn hảo.
  2. *Tab Bank (Lines 530–620):* Chỉ có 3 trường Tên ngân hàng, Số tài khoản, Chủ tài khoản nhưng tạo riêng 1 tab lớn, trong khi nội dung này đã có ở Tab Tài chính của `MemberDrawer`.
  3. *Tab History & Land:* Sao chép nguyên vẹn bảng giao dịch và bảng đất đai từ `MemberDrawer`.
- **Kiến nghị giải pháp:** **XÓA BỎ HOẶC SÁP NHẬP TOÀN BỘ** `CapitalMemberDrawer.tsx`. Tại trang `/capital`, khi người dùng bấm vào hàng xã viên, tái sử dụng trực tiếp `MemberDrawer.tsx` (mở mặc định tại Tab `capital`). Tiết kiệm 761 dòng mã trùng lặp, đảm bảo trải nghiệm người dùng nhất quán 100%.

---

### 1.4. Đánh giá Tính khả dụng cho Nông dân & Xã viên lớn tuổi (R4)

#### 1. Quy trình 5 bước đăng ký Xã viên (`MemberWizard.tsx`) gây quá tải nhận thức
- **Hiện trạng quan sát:** `frontend/src/features/members/components/MemberWizard.tsx` (lines 28–88) bắt buộc người dùng trải qua **5 bước tuần tự**:
  - *Bước 1:* Thông tin cá nhân & Giới tính, Ngày sinh, CCCD, Nơi cấp, Trình độ, Nghề nghiệp.
  - *Bước 2:* Địa chỉ chi tiết, Tỉnh, Huyện, Xã, Điện thoại, Email, Zalo, Facebook.
  - *Bước 3:* Vốn cam kết, Vốn nộp lần đầu, Phương thức góp, Thời hạn, Hình thức thanh toán, Upload biên lai.
  - *Bước 4:* Tỷ lệ chia thặng dư, Hình thức chi trả, Ngân hàng, Số tài khoản, Chủ tài khoản, Hạn mức tín dụng.
  - *Bước 5:* Xác nhận toàn bộ thông tin & Gửi duyệt.
- **Rào cản với nông dân/cán bộ cơ sở:**
  - Nếu kết nạp 30 hộ nông dân vào HTX, kế toán/cán bộ văn phòng phải click chuyển bước ít nhất **150 lần**.
  - Bước 2 yêu cầu bắt buộc cả Email và Facebook – những thứ hầu hết nông dân trồng rau tại Lạc Dương/Đơn Dương không sử dụng trong công việc HTX.
  - Bước 3 và Bước 4 tính toán các công thức phân chia thặng dư động và hạn mức tín dụng khiến người dùng lúng túng không biết điền gì.
- **Dữ liệu giả lập nguy hiểm:** Lines 59–66 đặt giá trị mặc định: `committed_capital: 50.000.000 ₫`, `initial_contributed_capital: 10.000.000 ₫`, `capital_in_words: 'Năm mươi triệu đồng'`. Nếu người dùng bấm nhanh qua các bước, xã viên nghèo chỉ góp 1.000.000 ₫ sẽ bị ghi nhận nhầm thành cam kết nợ 50.000.000 ₫!

#### 2. Biểu mẫu Biểu quyết đại hội (`CastVoteModal.tsx`) phi thực tế với nông dân
- **Hiện trạng quan sát:** `frontend/src/features/members/components/meetings/CastVoteModal.tsx`:
  - *Dòng 89–98:* Trường "Mã Nghị quyết" là một thẻ `<input type="text">` rỗng, bắt nông dân phải tự gõ tay chính xác chữ `NQ-01` hoặc `NQ-2026-BAOCAO`. Nếu gõ `NQ 1` hoặc `Nghi quyet 1`, hệ thống sẽ ghi nhận thành một nghị quyết hoàn toàn mới hoặc báo lỗi!
  - *Dòng 181–194:* Trường "Trọng số biểu quyết (tỷ trọng vốn góp / cổ phần)": bắt nông dân tự nhập số thực với bước nhảy `step="0.0001"`. Nông dân đi họp đại hội biểu quyết giơ tay "Đồng ý" hoặc "Không đồng ý", không thể bắt họ tự tính và gõ số `0.0245` vào ô input.
- **Cơ chế đúng:** Hệ thống phải hiển thị sẵn danh sách các Nghị quyết của đại hội dạng Radio Card to bản; khi xã viên đăng nhập bỏ phiếu, hệ thống tự động gán trọng số theo số vốn góp của xã viên đó từ cơ sở dữ liệu.

#### 3. Thuật ngữ hành chính & tiếng Anh kỹ thuật (Jargon)
- Trong `LandContributionModal.tsx` (dòng 28) và `CapitalRecordModal.tsx` (dòng 21): Trạng thái địa chính hiển thị các giá trị tiếng Anh: `PENDING`, `NOTARIZED`, `REGISTERED_CHANGE`.
- Trong `MembersTable.tsx` (dòng 114–120): Bộ lọc có các thuật ngữ khó hiểu: `OVERDUE_CAPITAL`, `PENDING_TERMINATION`. Cần chuyển hoàn toàn sang tiếng Việt bình dân: "Quá hạn nộp tiền 6 tháng", "Đang làm thủ tục rút vốn/nghỉ HTX".
- Cảnh báo trần sở hữu nhà đầu tư nước ngoài tại `MemberKpiCards.tsx` (dòng 142–154): "Trần sở hữu Nhà Đầu Tư Nước Ngoài: 4.5% / Tối đa 35%" làm nông dân hoang mang vì HTX nông nghiệp vùng nông thôn không có yếu tố nhà đầu tư nước ngoài.

#### 4. Kích thước font chữ và độ tương phản giao diện
- Khảo sát các trang cho thấy tần suất sử dụng font chữ siêu nhỏ `text-[10px]`, `text-[10.5px]`, `text-[11px]` chiếm hơn **45%** diện tích văn bản (ví dụ ở các badge, subtitle, thẻ thống kê).
- Nông dân và cán bộ HTX lớn tuổi (50–65 tuổi) đọc màn hình bị mờ mắt, phải căng mắt nhìn hoặc zoom trình duyệt làm vỡ bố cục.
- Các nút bấm hành động trong bảng `MembersTable.tsx` (dòng 246–315) có kích thước rất nhỏ (`px-2 py-1`, text 11px), rất khó bấm chính xác trên màn hình cảm ứng điện thoại hoặc máy tính bảng ngoài đồng ruộng.

#### 5. Silent Mocking tại `ProfitPage.tsx` vi phạm nguyên tắc dữ liệu thật
- Quan sát tại `frontend/src/features/members/pages/ProfitPage.tsx` (lines 55–56, 168–175):
  - Khởi tạo state bằng `mockSurplusPlan` và `mockSurplusItems` (dòng 55-56). Nếu API backend trả về rỗng, hệ thống vẫn hiển thị 1.250.000.000 ₫ lợi nhuận và danh sách xã viên giả lập TV001, TV002!
  - `barData` biểu đồ tháng 1 đến tháng 6 (dòng 168–175) được hardcode 100% dữ liệu tĩnh.
  - Khi người dùng bấm lưu cấu hình trích quỹ (dòng 177–205), hàm `handleUpdateProfitPlan` chỉ cập nhật state nội bộ React, **hoàn toàn không gọi API backend** để lưu vào cơ sở dữ liệu PostgreSQL.

---

## 2. LOGIC CHAIN (CHUỖI SUY LUẬN & ĐỐI SOÁT)

```
[QUAN SÁT THỰC TẾ MÃ NGUỒN]
├── Obs 1: Có 2 file mồ côi (MemberCapitalSection, MemberDocumentsSection) và 1 component trùng lặp 98% (DataFieldRow).
├── Obs 2: CapitalMemberDrawer (761 dòng) và MemberDrawer (167 dòng) cùng hiển thị 1 đối tượng Xã viên với 80% trường dữ liệu trùng lặp.
├── Obs 3: LandContributionModal và CapitalRecordModal cùng chứa form định giá đất giống hệt nhau, gọi 2 API khác nhau.
├── Obs 4: MemberDrawer Tab 1 & Tab 6 hiển thị Facebook, Trình độ chuyên môn, chuỗi SHA-256 hex và raw JSON Before/After.
├── Obs 5: MemberWizard có 5 bước với giá trị mặc định 50 triệu đồng; CastVoteModal bắt gõ tay mã NQ và trọng số thập phân 0.0001.
└── Obs 6: ProfitPage sử dụng mockSurplusPlan và hardcode barData khi dữ liệu rỗng; CoopProfilePage dùng alert() và lưu local state.
       │
       ▼
[SUY LUẬN TÁC ĐỘNG NGHIỆP VỤ & HỆ THỐNG]
├── 1. Codebase bloat: Tồn tại gần 1.500 dòng code thừa/trùng lặp, làm tăng bundle size và nguy cơ sửa lỗi chỗ này nhưng sót chỗ kia.
├── 2. Data Integrity Risk: Việc silent mocking ở ProfitPage và CoopProfilePage làm người dùng tưởng đã lưu thành công nhưng tải lại trang là mất dữ liệu.
├── 3. Cognitive Overload: Nông dân bị quá tải bởi các chuỗi mã băm, JSON code, thuật ngữ tiếng Anh và 5 bước nhập liệu rườm rà.
├── 4. Accidental Input Error: Việc gõ tay mã nghị quyết và trọng số thập phân chắc chắn dẫn đến sai lệch kết quả biểu quyết Đại hội.
       │
       ▼
[KẾT LUẬN & GIẢI PHÁP TÁI CẤU TRÚC]
├── Sáp nhập / Loại bỏ triệt để các file trùng lặp và mồ côi (Xóa 2 file mồ côi, dùng chung 1 DataFieldRow, bỏ CapitalMemberDrawer).
├── Tinh gọn Drawer: Giữ lại thông tin định danh & tài chính thiết yếu; ẩn JSON/SHA-256 vào chế độ Kiểm toán kỹ thuật.
├── Rút gọn MemberWizard từ 5 bước xuống 2 bước tinh gọn; tự động hóa tính toán vốn và trích quỹ.
├── Chuẩn hóa CastVoteModal thành dạng danh sách chọn 1 chạm (Click-to-vote), tự động lấy trọng số từ DB.
└── Xóa bỏ 100% silent mock data, hiển thị Loading Skeleton và Empty State chân thực chuẩn Rule 2.
```

---

## 3. CAVEATS (GIỚI HẠN & VÙNG CHƯA KHẢO SÁT)

1. **Phạm vi thẩm tra:** Báo cáo này tập trung chuyên sâu vào kiến trúc giao diện (Frontend React/TypeScript) và trải nghiệm người dùng nông dân cho Phân hệ 1 (Quản trị HTX & Xã viên). Các phân hệ Sản xuất, Kho, Thu hoạch, Tài chính tổng quát và OCOP nằm ngoài phạm vi khảo sát của báo cáo này.
2. **Khảo sát mã nguồn Backend:** Explorer 1 chỉ đối chiếu các endpoint API phục vụ cho giao diện Phân hệ 1 (`/api/members`, `/api/cooperatives/my-cooperative`, `/api/meetings`, `/api/capital-contributions`, `/api/land-contributions`, `/api/surplus-distribution-plans`). Việc kiểm toán chi tiết từng dòng code PHP Controller, Service, Policy và Test suite của Backend do các Explorer khác phụ trách.
3. **Thao tác ghi mã nguồn:** Tuân thủ tuyệt đối vai trò Teamwork Explorer read-only: Báo cáo này **không trực tiếp sửa đổi file code ứng dụng**, chỉ lập phương án thiết kế và chỉ dẫn chi tiết để đội ngũ triển khai (Implementer) thực hiện.

---

## 4. CONCLUSION (KẾT LUẬN & ĐỀ XUẤT TÁI CẤU TRÚC CHI TIẾT)

### 4.1. Danh mục các tệp cần Xóa bỏ hoặc Sáp nhập (Actionable File Matrix)

| Tên tệp / Component | Hành động | Giải pháp thay thế / Điểm đến |
| :--- | :--- | :--- |
| `frontend/src/features/members/components/drawer/MemberCapitalSection.tsx` | **XÓA BỎ** | Đã có `MemberTabCapital.tsx` đang vận hành tốt. |
| `frontend/src/features/members/components/drawer/MemberDocumentsSection.tsx` | **XÓA BỎ** | Đã có `MemberTabDocuments.tsx` đang vận hành tốt. |
| `frontend/src/features/members/components/drawer/common/DataFieldRow.tsx` | **XÓA BỎ** | Chuyển tất cả import sang `frontend/src/components/common/DataFieldRow.tsx`. |
| `frontend/src/features/members/components/CapitalMemberDrawer.tsx` (761 dòng) | **SÁP NHẬP / XÓA BỎ** | Tái sử dụng `MemberDrawer.tsx` (mở tab `capital` làm mặc định khi gọi từ trang `/capital`). |
| `frontend/src/features/members/components/LandContributionModal.tsx` | **HỢP NHẤT** | Thống nhất 1 luồng nhập đất đai vào `LandContributionModal.tsx`, loại bỏ tab định giá đất trùng lặp trong `CapitalRecordModal.tsx`. |
| `frontend/src/features/members/components/profit/CreateSurplusPlanModal.tsx` | **CHUẨN HÓA** | Đồng bộ các trường dữ liệu với `ProfitParamConfigCard.tsx`, kết nối API thực tế `createSurplusPlanApi`. |

---

### 4.2. Chuẩn hóa Bố cục Màn hình & Tối ưu Trải nghiệm Nông dân (Farmer UX Polish)

#### Màn hình 1: Hồ sơ Pháp lý HTX (`CoopProfilePage.tsx`)
- **Khắc phục Mocking:** Thay thế fallback tĩnh bằng truy vấn React Query `useQuery` gọi API `/api/cooperatives/my-cooperative`.
- **Kết nối Backend thực:** Trong `handleSaveProfile`, gọi `useMutation` gửi PUT `/api/cooperatives/my-cooperative` để lưu dữ liệu vào PostgreSQL thay vì chỉ set local store.
- **Loại bỏ Alert:** Trong `CoopProfileEditModal.tsx` (line 32), bỏ lệnh `alert()`, thay bằng Toast Notification hoặc hiển thị lỗi validation đỏ dưới chân input.
- **Đồng bộ số liệu thực:** Thay thế chuỗi text hardcode "Vốn điều lệ 3.5 tỷ", "165 hộ thành viên", "52.5 ha" bằng các giá trị thống kê thực tế lấy từ `capital-summary` và `members-count`.

#### Màn hình 2: Sổ Đăng ký Xã viên (`MembersPage.tsx` & `MemberWizard.tsx`)
- **Tái cấu trúc MemberWizard thành 2 bước trực quan (One-Two Punch Form):**
  - **Bước 1 — Định danh Xã viên (Ai gia nhập?):** Họ tên, Giới tính, Ngày sinh, Số CCCD, Địa chỉ thôn/bản, Số điện thoại (tự động điền Zalo). Loại bỏ hoàn toàn trường Facebook, Trình độ chuyên môn, Email bắt buộc.
  - **Bước 2 — Nghĩa vụ Vốn & Quyền lợi (Đóng góp gì?):** Phân loại (Chính thức / Liên kết), Số vốn cam kết thực tế (bỏ số mặc định 50 triệu), Số tiền nộp ngay đợt đầu, Hình thức nộp (Tiền mặt / Chuyển khoản / Đất đai), Số tài khoản ngân hàng nhận lợi nhuận (tùy chọn).
- **Loại bỏ trùng lặp nút bấm:**
  - Trong bảng `MembersTable.tsx`: Giữ lại 1 nút chính "Xem chi tiết" (mở Drawer) và 1 nút trạng thái nhanh (Duyệt/Đình chỉ).
  - Đưa tất cả các thao tác phức tạp (Chấm dứt tư cách, Quyết toán nợ, Sửa thông tin, In giấy tờ) vào phần Header của `MemberDrawer`.
- **Tối ưu cỡ chữ và bảng:** Tăng cỡ chữ bảng từ 11-12px lên 13-14px. Tăng chiều cao hàng từ 40px lên 52px để thao tác cảm ứng dễ dàng.

#### Màn hình 3: Đại hội & Biểu quyết Nghị quyết (`MeetingsPage.tsx` & `CastVoteModal.tsx`)
- **Chuẩn hóa CastVoteModal thân thiện nông dân:**
  - Thay thẻ `<input>` gõ mã nghị quyết bằng **Thẻ chọn Nghị quyết (Resolution Cards)**: Liệt kê rõ ràng tiêu đề nghị quyết (VD: *Nghị quyết 01: Thông qua Báo cáo SXKD năm 2025 và Kế hoạch Ớt chuông Sweet Palermo 2026*).
  - **Ẩn hoàn toàn trường nhập trọng số 0.0001**: Hệ thống tự động truy vấn số vốn góp của xã viên đang đăng nhập và gán trọng số tương ứng khi gửi payload.
  - **3 nút biểu quyết lớn, trực quan:** Thẻ to bản tối thiểu 64px chiều cao kèm biểu tượng rõ ràng:
    - 🟩 **TÁN THÀNH** (Nút màu xanh lục, ngón tay cái hướng lên, chữ in đậm to).
    - 🟥 **KHÔNG TÁN THÀNH** (Nút màu đỏ gạch, ngón tay cái hướng xuống).
    - ⬜ **PHIẾU TRẮNG** (Nút màu xám nhạt, trung lập).

#### Màn hình 4: Sổ Vốn Điều lệ (`CapitalPage.tsx`)
- **Sáp nhập Drawer:** Bỏ `CapitalMemberDrawer.tsx` (761 dòng). Khi click hàng xã viên tại `/capital`, mở trực tiếp `MemberDrawer.tsx` với tab mặc định là `MemberTabCapital`.
- **Đơn giản hóa Ghi nhận Góp vốn (`CapitalRecordModal.tsx`):**
  - Đối với nộp tiền mặt/chuyển khoản thông thường: Tạo form 1 trang đơn giản (Chọn xã viên $\rightarrow$ Nhập số tiền $\rightarrow$ Chọn hình thức $\rightarrow$ Bấm "Lưu phiếu thu"). Không bắt qua 3 bước wizard.
  - Đối với đóng góp đất đai: Mở trực tiếp `LandContributionModal.tsx` để nhập số sổ đỏ và diện tích.

#### Màn hình 5: Phân phối Thặng dư (`ProfitPage.tsx`)
- **Xóa bỏ triệt để Silent Mocking:**
  - Xóa `mockSurplusPlan` và `mockSurplusItems`. Khi chưa có đợt phân phối thặng dư nào, hiển thị **Empty State chuẩn**: Biểu tượng cuốn sổ tài chính rỗng, dòng chữ: *"Chưa có phương án phân phối thặng dư nào được lập cho niên độ này"* kèm nút bấm nổi bật *"Lập phương án phân chia thặng dư mới"*.
  - Biểu đồ: Chỉ render biểu đồ khi có dữ liệu thật từ API, không vẽ biểu đồ giả lập tháng 1 đến tháng 6.
- **Đồng bộ hóa lưu dữ liệu:** Kết nối nút "Lưu tham số cấu hình" với API backend (`updateSurplusPlanApi` hoặc `createSurplusPlanApi`) trong transaction để cập nhật cơ sở dữ liệu PostgreSQL.

---

## 5. VERIFICATION METHOD (PHƯƠNG PHÁP KIỂM CHỨNG ĐỘC LẬP)

Để kiểm chứng độc lập các phát hiện và đề xuất trong báo cáo này, thực hiện các bước sau:

### 5.1. Kiểm chứng sự tồn tại của các file mồ côi và trùng lặp
Chạy lệnh Ripgrep hoặc kiểm tra hệ thống tệp:
```bash
# 1. Kiểm chứng MemberCapitalSection không có nơi nào sử dụng
git grep "MemberCapitalSection" frontend/src

# 2. Kiểm chứng MemberDocumentsSection không có nơi nào sử dụng
git grep "MemberDocumentsSection" frontend/src

# 3. Kiểm chứng sự trùng lặp giữa hai file DataFieldRow
diff -u frontend/src/features/members/components/drawer/common/DataFieldRow.tsx frontend/src/components/common/DataFieldRow.tsx

# 4. Kiểm chứng mockSurplusPlan được import ở ProfitPage
git grep "mockSurplusPlan" frontend/src
```

### 5.2. Kiểm tra độ toàn vẹn mã nguồn và build
Sau khi tiến hành refactor/sáp nhập theo báo cáo:
```powershell
# Chạy build kiểm tra TypeScript và cú pháp Frontend
cd f:\HTX_OCOP_PROJECT\frontend
npm run build
npm run lint
```
*Điều kiện thành công:* Lệnh `npm run build` kết thúc với mã thoát `0` (Success), không phát sinh lỗi type errors hay broken import paths.

### 5.3. Kiểm chứng giao diện thực tế (Visual & Usability Checklist)
1. **Kiểm tra Màn hình Xã viên (`/members`):**
   - Mở Drawer chi tiết xã viên: Xác nhận không còn hiển thị trường "Facebook", "Trình độ chuyên môn", chuỗi SHA-256 hex 64 ký tự và raw JSON code trong tầm nhìn mặc định của người dùng.
   - Bấm nút "Thêm xã viên mới": Kiểm tra số bước nhập liệu đã được rút ngắn, không còn giá trị mặc định 50 triệu đồng gây rủi ro sai sót.
2. **Kiểm tra Màn hình Biểu quyết (`/meetings`):**
   - Bấm "Bỏ phiếu ngay": Xác nhận mã nghị quyết hiển thị dưới dạng danh sách chọn sẵn, không có ô nhập số thực trọng số `0.0001`.
3. **Kiểm tra Màn hình Thặng dư (`/profit-distribution`):**
   - Kiểm tra khi database chưa có dữ liệu: Hiển thị Empty State chân thực, tuyệt đối không hiển thị 1.250.000.000 ₫ giả lập.
