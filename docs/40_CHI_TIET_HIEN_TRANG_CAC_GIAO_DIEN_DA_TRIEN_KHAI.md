# 40. CHI TIẾT HIỆN TRẠNG TOÀN BỘ CÁC GIAO DIỆN ĐÃ TRIỂN KHAI TRONG HỆ THỐNG
> **Dự án:** Hệ thống Quản trị Hợp tác xã Nông nghiệp & Số hóa Hồ sơ Đánh giá Phân hạng OCOP  
> **Mã tài liệu:** `40_CHI_TIET_HIEN_TRANG_CAC_GIAO_DIEN_DA_TRIEN_KHAI.md`  
> **Cập nhật lần cuối:** 2026-10-29  
> **Công nghệ áp dụng:** React 18 SPA, TypeScript 5, Vite 5, TailwindCSS 3.4, TanStack React Query v5, Lucide Icons, HeadlessUI.  
> **Chuẩn mực kỹ thuật:** 100% các trang $\le 400$ dòng code, Clean Component, Không Silent Mocking tại runtime.

---

## MỤC LỤC TỔNG THỂ CÁC PHÂN HỆ GIAO DIỆN
1. [Bản Đồ Điều Hướng & Danh Mục 26 Trang Giao Diện](#1-bản-đồ-điều-hướng--danh-mục-26-trang-giao-diện)
2. [NHÓM 1: Quản Trị Hợp Tác Xã, Xã Viên & Vốn Góp](#2-nhóm-1-quản-trị-hợp-tác-xã-xã-viên--vốn-góp)
   - 2.1. Trang Quản lý Xã viên (`MembersPage.tsx` — `/members`)
   - 2.2. Trang Quản lý Vốn góp & Giấy chứng nhận (`CapitalPage.tsx` — `/capital`)
   - 2.3. Trang Đại hội Thành viên & Biểu quyết (`MeetingsPage.tsx` — `/meetings`)
   - 2.4. Trang Phân chia Thặng dư Lợi nhuận (`ProfitPage.tsx` — `/profit-distribution`)
   - 2.5. Trang Hồ sơ Pháp lý Hợp tác xã (`CoopProfilePage.tsx` — `/cooperative`)
3. [NHÓM 2: Vùng Trồng, Mùa Vụ & Hoạt Động Canh Tác](#3-nhóm-2-vùng-trồng-mùa-vụ--hoạt-động-canh-tác)
   - 3.1. Trang Quản lý Thửa đất & Vùng trồng PUC (`FarmPlotsPage.tsx` — `/agriculture/plots`)
   - 3.2. Trang Quản lý Mùa vụ Sản xuất (`CropSeasonsPage.tsx` — `/agriculture/seasons`)
   - 3.3. Trang Nhật ký Canh tác Điện tử VietGAP (`FarmingLogsPage.tsx` — `/agriculture/logs`)
   - 3.4. Trang Thu hoạch & Kiểm định KCS 3 Cấp (`HarvestsPage.tsx` — `/agriculture/harvests`)
   - 3.5. Trang Cây Truy xuất Nguồn gốc Nội bộ (`LotTraceabilityPage.tsx` — `/agriculture/lots/:id/traceability`)
   - 3.6. Trang Quét QR Truy xuất Nguồn gốc Công khai (`PublicTraceabilityPage.tsx` — `/trace/:lotId`)
4. [NHÓM 3: Quản Lý Kho Vật Tư & Sản Phẩm HTX](#4-nhóm-3-quản-lý-kho-vật-tư--sản-phẩm-htx)
   - 4.1. Trang Quản lý Kho & Vật tư FEFO/FIFO (`MaterialsPage.tsx` — `/inventory/materials`)
   - 4.2. Trang Danh mục Sản phẩm OCOP & Gắn Lô (`ProductsPage.tsx` — `/inventory/products`)
5. [NHÓM 4: Quản Lý Tài Chính, Sổ Quỹ & Công Nợ](#5-nhóm-4-quản-lý-tài-chính-sổ-quỹ--công-nợ)
   - 5.1. Trang Tài chính, Sổ quỹ & Quyết toán Mùa vụ (`FinancePage.tsx` — `/finance`)
6. [NHÓM 5: Số Hóa Hồ Sơ & Đánh Giá Phân Hạng OCOP](#6-nhóm-5-số-hóa-hồ-sơ--đánh-giá-phân-hạng-ocop)
   - 6.1. Trang Bộ Tiêu chí Động OCOP QĐ 148 & QĐ 1489 (`CriteriaPage.tsx` — `/ocop/criteria`)
   - 6.2. Trang Danh sách Hồ sơ Đăng ký OCOP (`DossiersPage.tsx` — `/ocop/dossiers`)
   - 6.3. Trang Trình tạo Hồ sơ OCOP Wizard 8 Bước (`CreateDossierWizardPage.tsx` — `/ocop/dossiers/new`)
   - 6.4. Trang Chi tiết Hồ sơ OCOP 7 Tabs (`DossierDetailPage.tsx` — `/ocop/dossiers/:id`)
   - 6.5. Trang Kho Minh chứng Số MinIO S3 (`EvidencesPage.tsx` — `/ocop/evidences`)
   - 6.6. Trang Hội đồng Chấm điểm & Quorum Guard (`EvaluationsPage.tsx` — `/ocop/evaluation`)
   - 6.7. Trang Quyết định Phân hạng Sao OCOP (`DecisionsPage.tsx` — `/ocop/decisions`)
   - 6.8. Trang Báo cáo Sẵn sàng Hồ sơ OCOP (`OcopReportsPage.tsx` — `/ocop/reports`)
7. [NHÓM 6: Báo Cáo Điều Hành, Kiểm Toán & Quản Trị Hệ Thống](#7-nhóm-6-báo-cáo-điều-hành-kiểm-toán--quản-trị-hệ-thống)
   - 7.1. Trang Bảng điều hành Trung tâm (`DashboardPage.tsx` — `/dashboard`)
   - 7.2. Trang Báo cáo Tổng hợp Quản trị (`ReportsPage.tsx` — `/reports`)
   - 7.3. Trang Nhật ký Kiểm toán Chuỗi băm SHA-256 (`AuditPage.tsx` — `/audit`)
   - 7.4. Trang Cấu hình Hệ thống & Phân quyền RBAC (`SystemSettingsPage.tsx` — `/system/settings`)

---

## 1. BẢN ĐỒ ĐIỀU HƯỚNG & DANH MỤC 26 TRANG GIAO DIỆN

Hệ thống cung cấp thanh điều hướng bên trái (Sidebar Navigation) phân cấp theo vai trò người dùng (RBAC), liên kết đến đầy đủ 26 trang giao diện SPA:

```
├── TỔNG QUAN
│   └── Dashboard (/dashboard)
├── QUẢN TRỊ HỢP TÁC XÃ
│   ├── Hồ sơ HTX (/cooperative)
│   ├── Xã viên (/members)
│   ├── Đại hội & Biểu quyết (/meetings)
│   ├── Vốn góp (/capital)
│   └── Phân chia lợi nhuận (/profit-distribution)
├── SẢN XUẤT NÔNG NGHIỆP
│   ├── Vùng trồng & Thửa đất (/agriculture/plots)
│   ├── Mùa vụ (/agriculture/seasons)
│   ├── Nhật ký canh tác (/agriculture/logs)
│   ├── Thu hoạch & KCS (/agriculture/harvests)
│   └── Truy xuất nguồn gốc (/agriculture/lots/:id/traceability)
├── KHO & VẬT TƯ
│   ├── Kho vật tư (/inventory/materials)
│   └── Sản phẩm OCOP (/inventory/products)
├── TÀI CHÍNH & CÔNG NỢ
│   └── Tài chính kế toán (/finance)
├── HỒ SƠ OCOP QUỐC GIA
│   ├── Bộ tiêu chí (/ocop/criteria)
│   ├── Hồ sơ OCOP (/ocop/dossiers)
│   ├── Kho minh chứng (/ocop/evidences)
│   ├── Chấm điểm Hội đồng (/ocop/evaluation)
│   ├── Quyết định phân hạng (/ocop/decisions)
│   └── Báo cáo sẵn sàng (/ocop/reports)
└── HỆ THỐNG
    ├── Báo cáo quản trị (/reports)
    ├── Nhật ký kiểm toán (/audit)
    └── Cấu hình hệ thống (/system/settings)
```

---

## 2. NHÓM 1: QUẢN TRỊ HỢP TÁC XÃ, XÃ VIÊN & VỐN GÓP

### 2.1. Trang Quản lý Xã viên (`MembersPage.tsx` — `/members`)

#### A. Các Thành Phần Trực Quan trên Giao Diện
1. **Thẻ KPI Tổng hợp (`MemberKpiCards.tsx`):**
   - *Tổng số xã viên:* Tổng số hộ thành viên của HTX (ví dụ: 165 hộ).
   - *Đang hoạt động (`ACTIVE`):* Số thành viên chính thức đang canh tác.
   - *Tổng vốn cam kết:* Tổng tiền vốn cam kết góp vào HTX.
   - *Hạn mức tín dụng bình quân:* Hạn mức trung bình cấp vật tư nợ đầu vụ.
   - **2 Thanh Tiến Độ Kiểm Soát Trần Pháp Lý (Luật HTX 2023):**
     - *Trần vốn nhóm thành viên liên kết:* Thanh progress bar kiểm soát không vượt quá trần **30% vốn điều lệ** theo Điều 74 Luật HTX 2023.
     - *Trần vốn nhà đầu tư nước ngoài (`is_foreign_investor`):* Thanh progress bar kiểm soát không vượt quá trần **35% vốn điều lệ** theo Điều 74 Luật HTX 2023.
2. **Thanh Công cụ, Tìm kiếm & Bộ lọc:**
   - Ô tìm kiếm tức thời theo: Mã xã viên, Họ tên, Số CCCD, Số điện thoại.
   - Dropdown lọc theo Trạng thái FSM (`Tất cả`, `Chờ duyệt`, `Đang hoạt động`, `Tạm đình chỉ`, `Chờ quyết toán`, `Đã chấm dứt`).
   - Dropdown lọc theo Phân loại xã viên (`Tất cả`, `Thành viên chính thức`, `Liên kết góp vốn`, `Liên kết chuỗi`).
   - **Bộ lọc cảnh báo nhanh "Quá hạn nộp vốn 6 tháng" (`OVERDUE_CAPITAL`):** Lọc danh sách thành viên quá hạn hoàn thành nghĩa vụ góp vốn quá 6 tháng kể từ ngày cam kết theo Điều 74 Luật HTX 2023.
   - Nút **"Thêm Xã Viên Mới"** (Mở Wizard 5 bước).
   - Nút **"Xuất Danh Sách"** (Kết xuất ra file Excel / PDF).

#### B. Bảng Dữ liệu Xã viên (`DataTable`)
Gồm các cột dữ liệu tiêu chuẩn:
- **Cột 1: Mã Xã Viên:** Mã định danh (ví dụ: `TT-TV-0001`), hiển thị kèm badge phân loại thành viên.
- **Cột 2: Họ & Tên / CCCD:** Tên xã viên in đậm, số CCCD và SĐT hiển thị mờ bên dưới.
- **Cột 3: Loại Thành Viên:** Badge màu phân biệt: Xanh lục (`Chính thức`), Xanh dương (`Liên kết vốn`), Xám (`Liên kết lao động`).
- **Cột 4: Diện Tích Canh Tác:** Tổng diện tích các thửa đất được giao quản lý (ha hoặc $m^2$).
- **Cột 5: Vốn Cam Kết / Đã Góp:** Số tiền đã nộp trên tổng tiền cam kết kèm thanh tiến độ hoàn thành; hiển thị badge đỏ cảnh báo nếu quá hạn cam kết 6 tháng.
- **Cột 6: Hạn Mức Tín Dụng Nợ:** Số tiền trần được ứng trước phân bón/thuốc BVTV.
- **Cột 7: Trạng Thái FSM:** Badge màu trạng thái: `Đang hoạt động` (Emerald), `Tạm đình chỉ` (Vàng), `Đã chấm dứt` (Xám).
- **Cột 8: Thao Tác (Action Icons):**
  - Icon Xem chi tiết (Mở `MemberDrawer` 5 tabs).
  - Icon Chỉnh sửa hồ sơ (Mở `MemberEditModal` 4 sections).
  - Icon Chuyển trạng thái FSM (Kích hoạt, Đình chỉ, Quyết toán, Chấm dứt).
  - Icon Xóa mềm (Mở dialog xác nhận Soft Delete, cấm xóa cứng).

#### C. Hộp Thoại & Ngăn Kéo (Modals & Drawers) Đã Triển Khai
1. **Wizard Tạo mới Xã viên 5 Bước (`MemberWizard.tsx`):**
   - *Bước 1 - Thông tin cá nhân:* Mã xã viên, Họ tên, Giới tính, Ngày sinh, Dân tộc.
   - *Bước 2 - Định danh & Liên hệ:* Số CCCD, Ngày cấp, Nơi cấp, SĐT, Email, Địa chỉ thường trú.
   - *Bước 3 - Loại thành viên & Vốn góp:* Chọn loại thành viên, Vốn góp cam kết, Thời hạn góp (tối đa 6 tháng theo luật), Đánh dấu nhà đầu tư nước ngoài.
   - *Bước 4 - Phân công sản xuất:* Hạn mức tín dụng gợi ý (tính tự động $15.000.000\text{ đ/ha}$), ghi chú diện tích.
   - *Bước 5 - Xác nhận & Nộp hồ sơ:* Tóm tắt toàn bộ thông tin trước khi tạo bản ghi trạng thái `DRAFT` hoặc `ACTIVE`.
2. **Slide-over Drawer Chi tiết Xã viên 5 Tabs (`MemberDrawer.tsx`):**
   - *Tab 1 - Hồ sơ cá nhân:* Đầy đủ thông tin pháp lý, CCCD, thông tin tài khoản ngân hàng.
   - *Tab 2 - Lịch sử Vốn góp:* Danh sách các lần nộp vốn, mã Giấy chứng nhận, mã QR tra cứu.
   - *Tab 3 - Tài chính & Công nợ:* Danh sách các khoản nợ vật tư trả chậm, lịch sử cấn trừ mùa vụ.
   - *Tab 4 - Vùng trồng & Thửa đất:* Danh sách các thửa đất đang canh tác, diện tích, tọa độ GPS.
   - *Tab 5 - Chứng từ số hóa:* Ảnh CCCD 2 mặt, Giấy cam kết điều lệ, Hợp đồng bao tiêu.
3. **Modal Chỉnh sửa Hồ sơ 4 Phân mục (`MemberEditModal.tsx`):**
   - Form cuộn liền mạch (Scrollable Sectioned Form) gồm: (1) Cá nhân, (2) Liên hệ, (3) Vốn góp, (4) Hạn mức tín dụng; có cơ chế cuộn đến trường lỗi khi validation thất bại.

---

### 2.2. Trang Quản lý Vốn góp & Giấy chứng nhận (`CapitalPage.tsx` — `/capital`)

#### A. Các Thành Phần Trực Quan
1. **Thẻ Thống kê Vốn Điều lệ HTX:**
   - *Tổng vốn cam kết:* Tổng giá trị vốn đã đăng ký theo Điều lệ.
   - *Tổng vốn thực góp:* Số tiền mặt và giá trị tài sản thực tế đã vào tài khoản HTX.
   - *Vốn còn phải thu:* Số vốn các thành viên còn nợ cam kết.
   - *Tỷ lệ hoàn thành:* Phần trăm thực góp trên cam kết.
2. **Thanh Công cụ:** Ô tìm kiếm mã GCN/tên thành viên, Bộ lọc loại góp vốn (`Tiền mặt`, `Quyền sử dụng đất`, `Hiện vật`), Nút **"Ghi Nhận Góp Vốn"**.

#### B. Bảng Lịch sử Góp vốn
- **Các cột:** Mã Giấy chứng nhận (`GCN-YYYY-XXXXXX`), Tên xã viên & Mã TV, Loại góp vốn, Số tiền/Giá trị định giá (VNĐ), Tỷ lệ sở hữu ($\%$), Ngày nộp, Trạng thái (`Đã thanh toán`), Mã QR xác thực, Thao tác.
- **Thao tác:** Xem biên lai, In Giấy chứng nhận phần vốn góp điện tử chuẩn Bộ NN&PTNT qua `capitalCertificatePrinter.ts`.

#### C. Modal Ghi nhận Góp vốn 3 Bước (`CapitalRecordModal.tsx`)
- *Bước 1:* Chọn thành viên, nhập số tiền, chọn hình thức (Tiền mặt, Chuyển khoản, Quyền sử dụng đất).
- *Bước 2:* Nếu góp bằng QSDĐ: Nhập Số phát hành sổ đỏ, Số thửa, Số tờ bản đồ, Diện tích $m^2$, Đơn giá định giá đất; Hệ thống tự tính tổng giá trị vốn quy đổi.
- *Bước 3:* Hệ thống tự động kiểm tra trần $30\%$ vốn điều lệ theo Điều 74 Luật HTX 2023. Nếu hợp lệ, tự động cấp mã GCN và tạo mã QR.

---

### 2.3. Trang Đại hội Thành viên & Biểu quyết (`MeetingsPage.tsx` — `/meetings`)

#### A. Các Thành Phần Trực Quan
- **Card Tóm tắt Nghị quyết (`ResolutionsSummaryCard.tsx`):** Thống kê số nghị quyết thường (ngưỡng $\ge 50\%$) và nghị quyết trọng yếu (ngưỡng $\ge 75\%$).
  - **Thanh Tiến Độ Ngưỡng Thông Qua Nghị Quyết (Threshold Bar):** Hiển thị vạch mốc pháp lý màu hổ phách trực quan theo **Điều 72 Luật HTX 2023**: Vạch $\ge 50\%$ đối với nghị quyết thông thường và vạch $\ge 75\%$ đối với nghị quyết trọng yếu (sửa đổi điều lệ, sáp nhập, giải thể, đầu tư dự án lớn).
- **Bảng Kỳ họp Đại hội:** Tên kỳ họp, Loại họp (Thường niên, Bất thường), Ngày tổ chức, Địa điểm, Trạng thái (`Lên kế hoạch`, `Đang diễn ra`, `Đã kết thúc`), Số lượng thành viên tham gia biểu quyết.
- **Modal Tạo Kỳ họp (`CreateMeetingModal.tsx`):** Nhập tiêu đề, ngày họp, danh sách dự thảo nghị quyết.
- **Drawer Chi tiết Kỳ họp (`MeetingDetailDrawer.tsx`):** Danh sách đại biểu tham gia, kết quả bỏ phiếu từng nội dung.
- **Modal Bỏ phiếu Biểu quyết (`CastVoteModal.tsx`):** Dành cho xã viên hoặc thư ký nhập phiếu: Chọn nghị quyết, biểu quyết `Tán thành`, `Không tán thành`, `Ý kiến khác` theo nguyên tắc bình đẳng 1 người = 1 phiếu.

---

### 2.4. Trang Phân chia Thặng dư Lợi nhuận (`ProfitPage.tsx` — `/profit-distribution`)

#### A. Các Thành Phần Trực Quan
1. **Thẻ KPI Thống kê Thặng dư (`ProfitKpiCards.tsx`):**
   - *Tổng thặng dư sau thuế:* Lợi nhuận ròng của HTX trong năm tài chính.
   - *Quỹ chung không chia (5%):* Số tiền bắt buộc trích lập theo Điều 84 Luật HTX 2023.
   - *Thặng dư đem chia:* Phần còn lại phân phối cho thành viên.
   - *Số xã viên được hưởng:* Tổng số hộ được chia cổ tức.
2. **Card Cấu hình Tham số Phân bổ (`ProfitParamConfigCard.tsx`):**
   - Cho phép Ban Giám đốc cấu hình tỷ lệ: Mặc định **70% theo Doanh số Dịch vụ** và **30% theo Tỷ lệ Vốn góp** (hoặc cấu hình 50/50 theo Nghị quyết Đại hội thành viên).
   - Hệ thống tự động validate chặn nếu tỷ lệ dịch vụ $< 51\%$ theo luật.
3. **Biểu đồ Phân bổ Thặng dư (`ProfitCharts.tsx`):** Biểu đồ tròn cơ cấu quỹ và biểu đồ cột top 10 thành viên nhận thặng dư cao nhất.
4. **Bảng Phân bổ Chi tiết Từng Xã viên (`ProfitAllocationTable.tsx`):**
   - Các cột: Mã TV, Tên xã viên, Doanh số dịch vụ nông sản đã giao nộp, Tiền chia theo dịch vụ, Vốn góp thực tế, Tiền chia theo vốn, Thuế TNCN khấu trừ (nếu có), Thực lĩnh cuối năm.
5. **Modal Lập Kế hoạch & In Phiếu Chi:**
   - `CreateSurplusPlanModal.tsx`: Tạo phương án phân chia thặng dư cho năm tài chính mới.
   - `SurplusVoucherPrintModal.tsx`: In lệnh chi tiền mặt/ủy nhiệm chi trả cổ tức cho từng xã viên.

---

### 2.5. Trang Hồ sơ Pháp lý Hợp tác xã (`CoopProfilePage.tsx` — `/cooperative`)
- **Tích hợp Ngữ cảnh Đa Người Thuê Động (`useTenantContextStore`):** Tự động đồng bộ tên pháp nhân, mã số HTX, địa chỉ từ hồ sơ tenant đang đăng nhập, không hardcode tên HTX trong mã nguồn.
- **Khối thông tin pháp lý:** Tên HTX, Tên viết tắt, Mã số thuế, Số giấy phép ĐKKD, Ngày thành lập.
- **Người đại diện pháp luật:** Họ tên, Chức vụ (Chủ tịch HĐQT kiêm Giám đốc), SĐT, Địa chỉ email.
- **Vốn & Quy mô:** Vốn điều lệ đăng ký, Số lượng thành viên chính thức, Tổng diện tích canh tác toàn HTX.
- **Chứng từ đính kèm:** Bản scan Giấy phép đăng ký kinh doanh, Điều lệ HTX phê duyệt, Chứng nhận vùng đủ điều kiện an toàn thực phẩm.
- **Modal Chỉnh sửa Hồ sơ Pháp nhân (`CoopProfileEditModal.tsx`):** Dành cho vai trò `HTX_OWNER` cập nhật đại diện pháp luật, số điện thoại hotline, vốn điều lệ đăng ký và upload bản cập nhật Điều lệ / Giấy phép ĐKKD mới.


---

## 3. NHÓM 2: VÙNG TRỒNG, MÙA VỤ & HOẠT ĐỘNG CANH TÁC

### 3.1. Trang Quản lý Thửa đất & Vùng trồng PUC (`FarmPlotsPage.tsx` — `/agriculture/plots`)

#### A. Kiến Trúc 2-Tabs Chuyên Biệt (Dedicated 2-Tabs Architecture) Khắc Phục Giới Hạn Mở Rộng
Để giải quyết triệt để vấn đề quá tải hiển thị khi hợp tác xã có số lượng Vùng trồng quy mô lớn (vượt quá 50–100 vùng trồng), giao diện trang được tái cấu trúc theo mô hình 2 Tabs chuyên biệt kết hợp chế độ Bản đồ GIS số hóa:
1. **Thẻ Thống kê Vùng trồng (`FarmPlotKpiCards.tsx`):** Tổng số vùng trồng (PUC), Tổng diện tích quy hoạch VietGAP (ha), Số vùng đang canh tác, Tổng số thửa đất của HTX.
2. **Tab 1: Danh Sách Vùng Trồng & Mã PUC Cục BVTV (`ProductionUnitsTable.tsx`):**
   - **Mục đích:** Quản lý hồ sơ công nhận mã số vùng trồng tập trung theo chuẩn Cục Bảo vệ Thực vật và Luật HTX 17/2023/QH15.
   - **Bộ lọc & Tìm kiếm:** Lọc theo trạng thái cấp mã (`Tất cả`, `Đã cấp PUC Cục BVTV`, `Chờ thẩm định hồ sơ`, `Chưa có mã PUC`), lọc theo cây trồng chủ lực, ô tìm kiếm thời gian thực theo mã vùng, tên vùng hoặc mã số PUC.
   - **Bảng dữ liệu chuẩn 7 cột:** STT, Mã Vùng & Tên Vùng Trồng, Cây Trồng Chủ Lực, Quy Mô Quy Hoạch (ha & số thửa đất con), Mã Số PUC Cục BVTV (kèm trạng thái cấp mã), Tọa Độ GPS Trạm Điều Hành, Thao Tác Quản Trị (Xem danh sách thửa đất thuộc vùng, Xem vị trí bản đồ GIS, Chỉnh sửa vùng).
   - **Khả năng mở rộng:** Tích hợp phân trang 10 dòng/trang, hỗ trợ HTX quản lý từ 10 đến hơn 100 vùng trồng mượt mà, không gặp hiện tượng tràn thanh cuộn ngang.
   - **Tính năng mở rộng:** Nút Xuất danh sách Vùng trồng ra file Excel và Khởi tạo vùng trồng mới.
3. **Tab 2: Phân Lô Thửa Đất Canh Tác (`FarmPlotsFullTable.tsx` & `CompactUnitSelectorBar.tsx`):**
   - **Thanh Điều Khiển Tinh Gọn (`CompactUnitSelectorBar.tsx`):** Thanh công cụ chỉ cao ~48px với combobox chọn vùng trồng (mặc định chọn `🌟 Xem tất cả vùng trồng (Toàn bộ HTX: X vùng • Y ha)` hoặc chọn đích danh từng vùng để lọc nhanh), hiển thị huy hiệu thông số cây trồng/PUC, nút thêm thửa đất, xuất Excel và chuyển nhanh sang bản đồ GIS.
   - **Banner Trực Quan (`FarmPlotBanner.tsx`):** Tự động hiển thị tóm tắt diện tích, cây trồng và tỷ lệ phân lô của vùng được chọn, hoặc hiển thị tổng quan vĩ mô toàn HTX khi ở chế độ xem tất cả.
   - **Bảng Phân Lô Thửa Đất Chi Tiết (`FarmPlotsFullTable.tsx`):**
     * Ở chế độ Toàn HTX: Tự động bổ sung cột **"Thuộc Vùng Sản Xuất"** để cán bộ HTX theo dõi tập trung toàn bộ các thửa đất mà không cần chuyển vùng thủ công.
     * Cột đếm ngược an toàn PHI (`PhiCountdownBadge`): Cảnh báo thời gian cách ly thuốc BVTV theo tiêu chuẩn VietGAP TCVN 11892-1:2017.
     * Cụm thao tác: Xem ngăn kéo chi tiết (Drawer), Phân công khoán xã viên, Chỉnh sửa, Ngưng canh tác (Xóa mềm).
4. **Chế Độ Xem Bản Đồ Số GIS Vùng Trồng (`FarmPlotMapView.tsx`):** 
   - Chuyển đổi linh hoạt với chế độ Bảng qua nút Toggle `Bản Đồ Số GIS` trên thanh điều hướng.
   - Hiển thị sơ đồ số hóa mặt bằng nông nghiệp dạng GIS tương tác: thể hiện ranh giới vùng trồng PUC, tọa độ GPS trạm điều hành, phân lô các thửa đất bằng đa giác màu sắc trực quan theo chuẩn VietGAP (Xanh lá: An toàn, Đỏ/cam nhấp nháy: Cách ly PHI, Xám: Nghỉ vụ), công cụ phóng to/thu nhỏ (Zoom 70% - 150%) và bảng chú giải GIS chuẩn quốc tế.
5. **Hệ Thống Modals & Drawers Đã Triển Khai (`FarmPlotModals.tsx`):**
   - `ProductionUnitModal.tsx`: Khởi tạo / cập nhật vùng sản xuất tập trung để đăng ký cấp mã PUC Cục BVTV.
   - `AddFarmPlotModal.tsx`: Hộp thoại tạo mới thửa đất/phân lô (hỗ trợ chọn vùng sản xuất trực thuộc khi đang ở chế độ xem toàn HTX, nhập mã thửa, diện tích ha, trạng thái, thời gian cách ly PHI, tọa độ GPS).
   - `EditFarmPlotModal.tsx`: Cập nhật thông số kỹ thuật thửa đất.
   - `PlotAssignmentModal.tsx`: Giao quyền khoán đất canh tác cho xã viên cụ thể.
   - `DeletePlotModal.tsx`: Xóa / ngưng canh tác thửa đất có kiểm tra ràng buộc mùa vụ.
   - `FarmPlotDrawer.tsx`: Ngăn kéo xem chi tiết thửa đất, lịch sử canh tác và xã viên phụ trách.

---

### 3.2. Trang Quản lý Mùa vụ Sản xuất & Danh mục Giống (`CropSeasonsPage.tsx` — `/agriculture/seasons`)

#### A. Kiến Trúc Điều Hướng 2 Tabs Nghiệp Vụ
Trang tích hợp hệ thống 2 Tabs quản trị đồng bộ chu kỳ gieo trồng và nguồn giống:
- **Tab 1 — Mùa Vụ Sản Xuất (`CropSeasonsTable.tsx`):** Quản lý tiến độ mùa vụ, diện tích, cây trồng và đóng vụ.
- **Tab 2 — Danh Mục Giống Cây Trồng (`CropsTab.tsx`):** Quản lý cơ sở dữ liệu danh mục giống cây trồng thuần và giống lai F1 liên kết bảng CSDL `crops`.

#### B. Các Thành Phần Chi Tiết
1. **Thẻ KPI Mùa vụ (`CropSeasonsStats.tsx`):** Vụ đang diễn ra, Sản lượng mục tiêu (tấn), Tiến độ thời gian vụ.
2. **Tab 1: Bảng Mùa vụ (`CropSeasonsTable.tsx`):** Tên mùa vụ (Vụ Thu Đông 2026), Cây trồng (Ớt chuông Sweet Palermo), Ngày bắt đầu, Ngày kết thúc dự kiến, Tổng diện tích gieo trồng, Sản lượng dự kiến, Trạng thái vụ (`Lập kế hoạch`, `Đang sinh trưởng`, `Đang thu hoạch`, `Đã đóng vụ`), Thao tác.
3. **Tab 2: Bảng Danh Mục Giống Cây Trồng (`CropsTab.tsx`):**
   - Mã giống cây trồng (`crop_code`), Tên giống, Tên khoa học (`scientific_name`), Nhóm cây trồng, Chu kỳ sinh trưởng (ngày), Năng suất chuẩn VietGAP (tấn/ha), **Thời gian cách ly PHI mặc định (ngày)**.
   - Nút Thêm giống mới, Chỉnh sửa thông số giống và Xóa giống.
4. **Modals Đã Triển Khai:**
   - `CropSeasonModal.tsx`: Khởi tạo mùa vụ mới, liên kết danh sách thửa đất tham gia.
   - `CloseSeasonModal.tsx`: Nghiệm thu kết thúc mùa vụ, chuyển trạng thái phục vụ quyết toán tài chính.
   - `CropModal.tsx`: Thêm mới hoặc cập nhật hồ sơ giống cây trồng, cấu hình số ngày sinh trưởng và ngưỡng PHI an toàn.

---

### 3.3. Trang Nhật ký Canh tác Điện tử VietGAP (`FarmingLogsPage.tsx` — `/agriculture/logs`)

#### A. Các Thành Phần Trực Quan
1. **Thẻ Thống kê Hoạt động Canh tác (`FarmingLogsKpiStats.tsx`):** Tổng số nhật ký đã ghi, Hoạt động phun thuốc BVTV gần nhất, Cảnh báo thời gian cách ly PHI.
2. **Bảng Nhật ký Canh tác Chuẩn VietGAP 10 Trường (`FarmingLogsTable.tsx`):**
   - *Cột 1: Thời gian & Thửa đất:* Ngày thực hiện, Mã thửa đất, Mã mùa vụ.
   - *Cột 2: Hoạt động canh tác:* Badge màu: Làm đất, Gieo trồng, Bón phân, Phun thuốc BVTV, Tưới nước, Thu hoạch.
   - *Cột 3: Xã viên thực hiện:* Tên người làm và SĐT liên hệ.
   - *Cột 4: Vật tư sử dụng:* Tên phân bón/thuốc BVTV, số lô nhà sản xuất.
   - *Cột 5: Khối lượng & Liều lượng:* Số lượng thực tế, liều lượng pha bình.
   - *Cột 6: Thời gian Cách ly PHI:* Số ngày cách ly an toàn, Ngày cho phép thu hoạch sớm nhất.
   - *Cột 7: Định vị GPS & Ảnh thực địa:* Tọa độ GPS kiểm thực, Thumbnail ảnh chụp hiện trường (click phóng to).
   - *Cột 8: Thao tác:* Xem chi tiết, In phiếu nhật ký VietGAP, Xóa log (`DeleteFarmingLogModal.tsx`).
3. **Modal Ghi Nhật ký Nhanh Mobile 1-Tap (`QuickMobileLogModal.tsx`):**
   - Bóc tách thành 5 sub-components: Bộ chọn công việc (`QuickLogActivitySelector`), Tự động lấy tọa độ GPS và mở camera điện thoại (`QuickLogGpsAndCamera`), Bộ chọn vật tư và tự động điền số ngày PHI chuẩn (`QuickLogMaterialsForm`), Tự động nén ảnh tại client bằng HTML5 Canvas (`imageCompressor.ts`), Chọn vụ và thửa đất (`QuickLogSeasonPlotDate`).

---

### 3.4. Trang Thu hoạch, KCS 3 Cấp & Quản lý Lô hàng GS1 (`HarvestsPage.tsx` — `/agriculture/harvests`)

#### A. Kiến Trúc Điều Hướng 2 Tabs Chuyên Sâu
Trang được thiết kế tích hợp thanh điều hướng 2 Tabs nghiệp vụ xuyên suốt vòng đời từ khi thu hoạch đến khi quản lý lô hàng lưu kho:
- **Tab 1 — Lệnh Thu Hoạch & Nghiệm Thu KCS:** Quản lý quy trình kiểm định chất lượng 3 cấp và phát hành lệnh thu hoạch.
- **Tab 2 — Quản Lý Vòng Đời Lô Hàng GS1 Traceability (`LotsInventoryTab.tsx`):** Quản lý chi tiết từng lô nông sản thành phẩm đã cấp mã GS1, tồn kho và trạng thái phân phối.

#### B. Chi Tiết Thành Phần Tab 1: Lệnh Thu Hoạch & KCS 3 Cấp
1. **Thẻ KPI Thu hoạch & Chất lượng (`HarvestKpiStats.tsx`):** Tổng sản lượng đã thu (kg), Tỷ lệ Loại A xuất khẩu (%), Sản lượng bị loại bỏ (Reject), Trạng thái an toàn PHI.
2. **Bố cục Master-Detail Split View (Tỷ lệ 1.55 : 0.95):**
   - *Bên trái — Bảng Danh sách Lệnh Thu hoạch (`HarvestsTable.tsx`):* Mã lệnh thu hoạch, Ngày thu hoạch, Thửa đất & Xã viên, Tổng khối lượng (kg), Phân loại Grade A / Grade B / Reject, **Trạng thái PHI Guard** (Badge xanh: `Đã cách ly an toàn` / Badge đỏ: `Vi phạm cách ly PHI`), Trạng thái KCS, Mã Lô GS1 phát hành, Xuất Excel (`.xlsx`), Thao tác (Xem chi tiết, Sửa, In nhãn, Xóa).
   - *Bên phải — Ngăn Thanh tra Chi tiết (`HarvestDetailPanel.tsx`):* Hiển thị tức thời phiếu kiểm định KCS của dòng đang chọn, chỉ số độ ngọt Brix, tỷ lệ đồng đều, kết quả test lab và mã băm toàn vẹn.
3. **Các Modals Thu Hoạch & KCS:**
   - `KcsHarvestModal.tsx`: Quy trình KCS 3 cấp: *Cấp 1 - Gate Check* (kiểm tra PHI $\ge$ safe_harvest_date, nếu vi phạm cấm thu mua); *Cấp 2 - Quick Lab Test* (nhập kết quả test nhanh nitrate/BVTV); *Cấp 3 - Grading phân loại* (Grade A Brix $\ge 7^\circ$, Grade B, Reject; tự động sinh mã lô GS1: `LOT-[Coop]-[Plot]-[YYYYMMDD]-[Seq]`).
   - `HarvestLabelPrintModal.tsx`: In nhãn pallet/thùng hàng thu hoạch kèm QR code.
   - `HarvestDrawer.tsx`: Ngăn kéo xem chi tiết thu hoạch trên thiết bị di động.
   - `EditHarvestModal.tsx`: Chỉnh sửa sản lượng và phẩm cấp thu hoạch khi chưa chốt quyết toán.
   - `DeleteHarvestModal.tsx`: Hủy lệnh thu hoạch có cảnh báo nghiệp vụ.

#### C. Chi Tiết Thành Phần Tab 2: Quản Lý Vòng Đời Lô Hàng GS1 (`LotsInventoryTab.tsx`)
1. **4 Thẻ Mini KPI Vòng Đời Lô Hàng:**
   - *Tổng số Lô GS1:* Số lượng lô hàng đã phát hành mã định danh quốc tế GS1.
   - *Sẵn sàng xuất (Kho):* Sản lượng (kg) đang ở trạng thái `AVAILABLE` sẵn sàng cung ứng.
   - *Đã đóng gói OCOP:* Sản lượng (kg) ở trạng thái `PACKED` đã gắn nhãn mác thương mại.
   - *Đã phân phối chuỗi:* Sản lượng (kg) ở trạng thái `DISTRIBUTED` đã giao cho siêu thị / đối tác.
2. **Thanh Công Cụ Tìm Kiếm & Bộ Lọc Vòng Đời:**
   - Tìm kiếm nhanh theo: Mã lô GS1, Mã thửa đất, Tên vụ mùa, Loại cây trồng.
   - Dropdown lọc theo Trạng thái vòng đời: `Tất cả`, `Sẵn sàng xuất (AVAILABLE)`, `Đã đóng gói (PACKED)`, `Đã phân phối (DISTRIBUTED)`, `Hết hạn sử dụng (EXPIRED)`.
   - Nút **"Xuất Excel (.xlsx)"**: Kết xuất toàn bộ danh sách lô hàng GS1 kèm thông tin nguồn gốc và link truy xuất.
3. **Bảng Danh Sách Lô Hàng GS1:**
   - *Cột 1: Mã lô GS1 Traceability:* Font monospace nổi bật kèm nút **Sao chép mã (Copy)** 1-click.
   - *Cột 2: Ngày thu hoạch:* Ngày KCS xác nhận đủ điều kiện thu hoạch.
   - *Cột 3: Vụ mùa & Thửa đất:* Tên vụ mùa canh tác và mã định danh thửa đất xuất xứ.
   - *Cột 4 & 5: Sản lượng ban đầu & Sản lượng còn lại (kg):* Cập nhật theo thời gian thực khi lô được đóng gói/xuất bán.
   - *Cột 6: Trạng thái vòng đời:* Badge phân màu trực quan (`AVAILABLE` - Xanh lá, `PACKED` - Xanh dương, `DISTRIBUTED` - Chàm, `EXPIRED` - Đỏ).
   - *Cột 7: Thao tác tích hợp:*
     - Nút **"Tem QR"**: Mở modal xem trước ma trận mã QR chuẩn GS1-128 và in tem nhãn dán bao bì sản phẩm.
     - Dropdown **"Chuyển trạng thái"**: Chuyển nhanh vòng đời lô hàng giữa `AVAILABLE` $\rightarrow$ `PACKED` $\rightarrow$ `DISTRIBUTED` $\rightarrow$ `EXPIRED`.
     - Nút **"Truy xuất"**: Mở trực tiếp Cổng thông tin truy xuất nguồn gốc công khai (`/trace/:lotId`) trong tab mới.


---

### 3.5. Trang Cây Truy xuất Nguồn gốc Nội bộ (`LotTraceabilityPage.tsx` — `/agriculture/lots/:id/traceability`)
- Hiển thị cây dữ liệu dạng sơ đồ trực quan (Tree Graph):
  - **Node Gốc:** Mã Lô hàng GS1 + Mã QR.
  - **Node Cấp 1:** Lệnh thu hoạch & Biên bản kiểm tra KCS 3 cấp.
  - **Node Cấp 2:** Chuỗi nhật ký canh tác (bón phân, phun thuốc có số ngày PHI).
  - **Node Cấp 3:** Thửa đất, Mã vùng trồng PUC và bản đồ tọa độ GPS.
  - **Node Cấp 4:** Hồ sơ xã viên phụ trách canh tác.

---

### 3.6. Trang Quét QR Truy xuất Nguồn gốc Công khai (`PublicTraceabilityPage.tsx` — `/trace/:lotId`)
- Giao diện mở công khai cho người tiêu dùng dùng điện thoại quét mã QR trên bao bì sản phẩm (không yêu cầu đăng nhập):
  - Thông tin thương hiệu HTX sản xuất và chứng nhận OCOP 4 sao.
  - Tên nông sản: Ớt chuông Sweet Palermo Đỏ Đà Lạt.
  - Ngày thu hoạch, Hạn sử dụng, Độ ngọt Brix cam kết.
  - Lịch sử nhật ký bón phân sinh học và ngày cách ly an toàn.
  - Giấy chứng nhận kiểm nghiệm chất lượng QUATEST 3 và VietGAP.

---

## 4. NHÓM 3: QUẢN LÝ KHO VẬT TƯ & SẢN PHẨM HTX

### 4.1. Trang Quản lý Kho & Vật tư FEFO/FIFO (`MaterialsPage.tsx` — `/inventory/materials`)

#### A. Kiến Trúc Điều Hướng 5 Tabs Toàn Diện
Trang tích hợp hệ thống 5 Tabs nghiệp vụ giúp thủ kho và kế toán kiểm soát chặt chẽ toàn bộ chu kỳ vật tư từ khi nhập, lưu kho theo lô FEFO, xuất ứng nợ đầu vụ đến kiểm kê định kỳ:
- **Tab 1 — Danh Mục Vật Tư & Phân Bổ Xã Viên:** Bảng danh mục SKU, mức an toàn và hạn mức ứng trước từng xã viên (`MemberAllocationTable.tsx`).
- **Tab 2 — Lô Vật Tư & Hạn Sử Dụng FEFO (`MaterialBatchesTable.tsx`):** Theo dõi từng lô nhà sản xuất, ngày hết hạn và cảnh báo cận date.
- **Tab 3 — Lịch Sử Phiếu Nhập Kho (`StockReceiptsTable.tsx`):** Quản lý phiếu nhập kho mua hàng từ nhà cung cấp và nhập thu hồi.
- **Tab 4 — Lịch Sử Phiếu Xuất Kho & Ứng Nợ (`StockIssuesTable.tsx`):** Quản lý phiếu xuất bán và xuất ứng nợ đầu vụ (`CREDIT_ADVANCE`).
- **Tab 5 — Phiếu Kiểm Kê & Cân Chỉnh Kho (`StockCountsTable.tsx`):** Quản lý biên bản kiểm kê thực tế định kỳ và chênh lệch sổ sách.

#### B. Chi Tiết Các Thành Phần Giao Diện Theo Tab
1. **Thẻ Thống kê Kho Vật tư (`MaterialStats.tsx`):** Tổng số mặt hàng, Giá trị tồn kho (VNĐ), Số lô hàng cận hạn sử dụng ($\le 30$ ngày), Số mặt hàng dưới định mức an toàn.
2. **Tab 1: Bảng Danh Mục Vật Tư:**
   - Mã SKU, Tên vật tư (Hạt giống, Phân NPK hữu cơ, Thuốc sinh học Bio-Tricho), Nhóm vật tư, Đơn vị tính, Số lượng tồn thực tế, Mức tồn an toàn, Đơn giá nhập/xuất, Trạng thái tồn kho, Thao tác sửa/xóa danh mục.
   - Bảng Phân bổ Xã viên (`MemberAllocationTable.tsx`): Theo dõi xã viên đã nhận ứng trước vật tư bao nhiêu và hạn mức còn lại.
3. **Tab 2: Bảng Quản Lý Lô Vật Tư FEFO (`MaterialBatchesTable.tsx`):**
   - Mã Lô nhà sản xuất, Tên vật tư, Số lượng tồn của lô, Đơn vị tính, Ngày sản xuất, Ngày hết hạn, Số ngày còn lại đến hạn sử dụng.
   - Badge cảnh báo FEFO 3 cấp màu: Đỏ (`Hết hạn - EXPIRED`), Vàng cam (`Cận date - NEAR_EXPIRY`), Xanh lá (`Bình thường`). Nút xuất CSV.
4. **Tab 3: Bảng Phiếu Nhập Kho (`StockReceiptsTable.tsx`):**
   - Số phiếu nhập (`PNK-xxx`), Ngày nhập, Nhà cung cấp / Nguồn nhập, Tổng giá trị nhập kho (VNĐ), Trạng thái (`DRAFT`, `APPROVED`, `POSTED`).
   - Nút Duyệt phiếu nhập kho và in phiếu nhập kế toán.
5. **Tab 4: Bảng Phiếu Xuất Kho & Ứng Trước Nợ (`StockIssuesTable.tsx`):**
   - Số phiếu xuất (`PXK-xxx`), Ngày xuất, Loại xuất kho (`Bán thu tiền ngay` hoặc `Xuất ứng nợ mùa vụ - CREDIT_ADVANCE`).
   - Tên xã viên nhận ứng nợ, Tổng giá trị xuất kho, Trạng thái phê duyệt.
   - Nút **"Phê duyệt phiếu xuất"** (tự động ghi nợ vào Sổ công nợ xã viên) và nút in phiếu xuất kho kế toán.
6. **Tab 5: Bảng Phiếu Kiểm Kê Kho (`StockCountsTable.tsx`):**
   - Mã phiếu kiểm kê (`PKK-xxx`), Ngày kiểm kê, Người kiểm kê, Tổng số lượng chênh lệch (Thực tế vs Sổ sách), Ghi chú biên bản giải trình, Trạng thái chốt kiểm kê.
7. **Hệ Thống Modals Đã Triển Khai (`src/features/inventory/components/`):**
   - `MaterialModal.tsx`: Thêm/sửa danh mục vật tư mới, cấu hình số ngày cách ly an toàn PHI mặc định.
   - `ReceiptModal.tsx`: Tạo phiếu nhập kho theo lô nhà sản xuất, ghi nhận ngày sản xuất và hạn dùng.
   - `IssueModal.tsx`: Tạo phiếu xuất kho (Tiền mặt / Xuất nợ trả chậm Credit Advance), tự động kiểm tra trần tín dụng và áp dụng thuật toán FEFO.
   - `StockCountModal.tsx`: Tạo phiếu kiểm kê kho định kỳ, cân chỉnh số lượng tồn.


---

### 4.2. Trang Danh mục Sản phẩm OCOP & Gắn Lô (`ProductsPage.tsx` — `/inventory/products`)
- **Thẻ KPI Phân Hạng OCOP (`ProductKpiCards.tsx`):** Tổng sản phẩm OCOP của HTX, Số sản phẩm 4 sao (cấp Tỉnh), Số sản phẩm 3 sao (cấp Huyện), Số lô tem GS1 đã gán mã truy xuất.
- **Lưới Thẻ Sản phẩm (`ProductCard.tsx`):** Ảnh sản phẩm, Tên thương mại (Ớt chuông Sweet Palermo 500g), Hạng sao OCOP đạt được, Mã vạch GTIN-13, Quy cách đóng gói, Giá tham chiếu.
- **Modal Tạo Sản phẩm OCOP (`CreateProductModal.tsx`):** Nhập thông tin sản phẩm, nhóm ngành hàng OCOP (Thực phẩm tươi sống), tiêu chuẩn kỹ thuật, thương hiệu HTX.
- **Modal Gắn Lô Thu Hoạch (`AttachLotModal.tsx`):** Đóng gói sản phẩm bằng cách chọn các lô thu hoạch GS1 hợp lệ từ kho để đưa ra thị trường tiêu thụ.
- **Slide-over Drawer Chi tiết Sản phẩm & Quản lý Lô (`ProductDrawer.tsx` & `ProductTabLots.tsx`):**
  - Xem thông tin thương mại, hồ sơ công nhận OCOP UBND.
  - Quản lý danh sách các Lô thu hoạch GS1 đã liên kết vào sản phẩm: Xem mã QR GS1 chuẩn quốc gia, liên kết truy xuất nguồn gốc công khai, sản lượng liên kết (kg).
  - Nút **"Gỡ liên kết lô"** (`detachLotFromProduct`): Cho phép gỡ bỏ lô hàng ra khỏi danh mục thương phẩm khi lô đã phân phối xong hoặc chuyển mục đích đóng gói.
  - Tuân thủ nguyên tắc không silent mock: Trả về empty state rõ ràng khi sản phẩm chưa được gán lô thu hoạch nào.

---

## 5. NHÓM 4: QUẢN LÝ TÀI CHÍNH, SỔ QUỸ & CÔNG NỢ

### 5.1. Trang Tài chính, Sổ quỹ & Quyết toán Mùa vụ (`FinancePage.tsx` — `/finance`)

#### A. Các Thành Phần Trực Quan
1. **Thẻ KPI Tài chính (`FinanceKpiStats.tsx`):** Số dư quỹ tiền mặt/ngân hàng hiện tại, Tổng nợ vật tư phải thu xã viên, Tổng tiền thu mua nông sản trong kỳ, Tiền thặng dư tạm tính.
2. **Hệ thống 3 Tabs Nghiệp vụ Chuyên sâu:**

##### Tab 1: Sổ Quỹ Tiền Mặt (`CashBookTab.tsx`)
- *Bảng thu - chi:* Mã chứng từ (`PT-xxx`, `PC-xxx`), Ngày giao dịch, Loại thu/chi, Số tiền, Hình thức (Tiền mặt/Chuyển khoản), Người nộp/nhận, Diễn giải, Thao tác.
- *Modal Lập Phiếu Thu/Chi (`CashTransactionModal.tsx`):* Tạo phiếu thu tiền góp vốn, thu tiền bán nông sản hoặc phiếu chi mua vật tư, chi trả lương.
- *Modal In Phiếu Kế toán (`VoucherModal.tsx`):* Xuất phiếu thu/chi theo mẫu Thông tư 24/2017/TT-BTC.

##### Tab 2: Sổ Quản lý Công Nợ & Biểu Đồ 5 Kỳ Tuổi Nợ (`DebtsTab.tsx`)
- **Thẻ Tóm Tắt Tuổi Nợ & Biểu Đồ Trực Quan (`DebtAgingSummaryCard.tsx`):**
  - 3 Thẻ chỉ số tổng hợp: Công nợ phải thu (Xã viên nợ HTX), Công nợ phải trả (HTX nợ Nhà cung cấp), Vị thế nợ ròng.
  - **Biểu đồ Cột Trực Quan 5 Kỳ Tuổi Nợ (Visual Columns Chart):** Các cột đồ họa tỷ lệ chiều cao tương ứng với giá trị nợ từng kỳ:
    - *Trong hạn (Màu xanh lá - Emerald):* Nợ chưa đến ngày đáo hạn.
    - *1–30 ngày (Màu vàng hổ phách - Amber):* Quá hạn ngắn hạn.
    - *31–60 ngày (Màu cam - Orange):* Quá hạn cần gửi văn bản nhắc nợ.
    - *61–90 ngày (Màu cam đậm):* Nguy cơ trễ hạn cao.
    - *> 90 ngày (Màu đỏ - Rose):* Cảnh báo nợ xấu cần cưỡng chế cấn trừ hoặc trích lập dự phòng theo quy chế tài chính HTX.
  - Thẻ chi tiết từng kỳ hiển thị số tiền chính xác, phần trăm chiếm giữ trên tổng dư nợ và tooltip chú thích.
- *Bảng công nợ chi tiết từng xã viên:* Mã TV, Họ tên, Tổng nợ phát sinh từ vật tư ứng trước, Đã trả/cấn trừ, Dư nợ còn lại, Hạn thanh toán, Phân kỳ tuổi nợ, Thao tác.
- *Modal Thu hồi Nợ (`DebtPaymentModal.tsx`):* Ghi nhận xã viên nộp tiền mặt thanh toán bớt nợ vật tư.

##### Tab 3: Quyết toán Thu Mua Mùa Vụ & Bù Trừ Công Nợ (`HarvestSettlementsTab.tsx`)
- *Thanh công cụ:* Tìm kiếm tức thời theo mã quyết toán, mã nợ cấn trừ, tên xã viên; Dropdown lọc theo trạng thái (`Tất cả`, `Đã ghi sổ`, `Đã phê duyệt`, `Bản nháp`); Nút xuất dữ liệu bảng kê sang định dạng CSV UTF-8.
- *Nút "Chốt quyết toán mùa vụ":* Mở Modal `SeasonSettlementModal.tsx` tự động tính toán công thức:
  $$\text{Doanh thu nông sản } (V_{total}) - \text{Phí dịch vụ HTX } (Fee = 2\% - 3\%) - \text{Nợ vật tư cấn trừ } (D) = \text{Thực lĩnh chi trả } (P_{net})$$
- *Bảng kê quyết toán chi tiết:* Mã quyết toán, Số chứng từ/phiếu chi, Mã nợ cấn trừ, Xã viên thụ hưởng, Hình thức chi trả (Cấn trừ nợ thu hoạch / Chuyển khoản / Tiền mặt), Số tiền quyết toán (VNĐ), Ngày quyết toán, Trạng thái kế toán (`DRAFT`, `APPROVED`, `POSTED`).
- *Hành động trên từng dòng bảng kê:*
  - Nút **"Phê duyệt"** (Check icon): Cho phép kế toán trưởng / ban giám đốc duyệt bảng kê quyết toán dự thảo chuyển sang trạng thái đã phê duyệt.
  - Nút **"In phiếu"** (Printer icon): Mở Modal `SettlementVoucherModal.tsx` xem trước và in **Phiếu Chi Quyết Toán Nông Sản Kiêm Biên Bản Bù Trừ Công Nợ** (Mẫu số 02-TT/HTX theo Thông tư 24/2017/TT-BTC và Điều 74 Luật HTX 2023), đầy đủ pháp nhân HTX, mã số thuế, số chứng từ, bảng kê các khoản mục hạch toán và khối 3 chữ ký: Người lập biểu, Xã viên thụ hưởng, Giám đốc HTX.


---

## 6. NHÓM 5: SỐ HÓA HỒ SƠ & ĐÁNH GIÁ PHÂN HẠNG OCOP

### 6.1. Trang Bộ Tiêu chí Động OCOP QĐ 148 & QĐ 1489 (`CriteriaPage.tsx` — `/ocop/criteria`)
- **Bộ chọn Phiên bản & Ngành hàng (`SubProductSetSelector.tsx`):** Chuyển đổi giữa phiên bản QĐ 148/2023 và QĐ 1489/2025; chọn ngành hàng Nông sản tươi sống, Chế biến...
- **Danh sách Nhóm Tiêu chí (`CriteriaGroupCard.tsx`):**
  - *Phần A (40 điểm):* Sản phẩm và sức mạnh cộng đồng (Nguồn gốc nguyên liệu địa phương, lao động xã viên, liên kết chuỗi).
  - *Phần B (25 điểm):* Tiếp thị và thương mại (Bao bì, tem truy xuất QR, câu chuyện sản phẩm).
  - *Phần C (35 điểm):* Chất lượng sản phẩm (Chứng nhận VietGAP, chỉ tiêu vi sinh QUATEST, công bố tiêu chuẩn cơ sở TCCS).
- Hiển thị danh mục từng chỉ tiêu nhỏ và thang điểm chi tiết.

---

### 6.2. Trang Danh sách Hồ sơ Đăng ký OCOP (`DossiersPage.tsx` — `/ocop/dossiers`)
- **Thẻ KPI Hồ sơ (`DossiersKpiCards.tsx`):** Tổng số hồ sơ OCOP, Hồ sơ đang chuẩn bị, Hồ sơ đã nộp Hội đồng, Số sản phẩm đạt 4-5 sao.
- **Biểu đồ Thống kê (`DossiersStatsCharts.tsx`):** Biểu đồ tiến độ hoàn thiện hồ sơ theo từng nhóm tiêu chí.
- **Bảng Danh sách Hồ sơ (`DossiersTable.tsx`):** Mã hồ sơ, Tên sản phẩm OCOP, Phiên bản tiêu chí áp dụng, Điểm HTX tự đánh giá, Tỷ lệ nộp đủ minh chứng (%), Cấp nộp thẩm định (Huyện/Tỉnh), Trạng thái hồ sơ (`DRAFT`, `SUBMITTED`, `APPROVED`), Thao tác (Xem chi tiết, Sửa, Nộp hồ sơ).

---

### 6.3. Trang Trình tạo Hồ sơ OCOP Wizard 8 Bước (`CreateDossierWizardPage.tsx` — `/ocop/dossiers/new`)
Bóc tách thành 8 bước chuẩn mực theo quy trình quốc gia:
- *Bước 1 - Thông tin chung (`WizardGeneralStep.tsx`):* Chọn HTX, năm đăng ký, cấp thẩm định đề xuất.
- *Bước 2 - Thông tin sản phẩm (`WizardProductStep.tsx`):* Chọn sản phẩm trong danh mục, nhập quy cách, sản lượng năm.
- *Bước 3 - Chọn bộ tiêu chí (`WizardCriteriaStep.tsx`):* Xác định đúng ngành hàng và phiên bản tiêu chí.
- *Bước 4 - Tự chấm điểm cơ sở:* Tự cho điểm từng chỉ tiêu kèm giải trình.
- *Bước 5 - Nạp minh chứng số (`WizardEvidencesStep.tsx`):* Đính kèm tài liệu pháp lý và ảnh chụp.
- *Bước 6 - Kiểm tra tính toàn vẹn:* Hệ thống tự động quét kiểm tra các điều kiện bắt buộc (Mandatory conditions).
- *Bước 7 - Xác nhận thông tin (`WizardConfirmStep.tsx`):* Xem lại toàn bộ hồ sơ trước khi lưu.
- *Bước 8 - Hoàn tất & Tải biểu mẫu (`WizardSuccessStep.tsx`):* Thông báo tạo hồ sơ thành công, tải Phiếu đăng ký (Biểu mẫu 01).

---

### 6.4. Trang Chi tiết Hồ sơ OCOP 7 Tabs (`DossierDetailPage.tsx` — `/ocop/dossiers/:id`)
Bao gồm 7 tabs chuyên sâu phục vụ toàn bộ vòng đời hồ sơ:
1. **Tab 1 — Tổng quan (`DossierOverviewTab.tsx`):** Tóm tắt điểm số, trạng thái phê duyệt, thông tin chủ thể.
2. **Tab 2 — Tự đánh giá (`DossierSelfEvalTab.tsx`):** Bảng chi tiết điểm tự chấm của HTX cho 100% các tiêu chí phần A/B/C.
3. **Tab 3 — Kho Minh chứng (`DossierEvidencesTab.tsx`):** Danh mục các tài liệu đã nộp, trạng thái xác thực mã băm SHA-256.
4. **Tab 4 — Tiến trình Phê duyệt (`DossierWorkflowTab.tsx`):** Lịch sử các bước chuyển trạng thái hồ sơ (Soạn thảo $\rightarrow$ Nộp huyện $\rightarrow$ Tiếp nhận $\rightarrow$ Yêu cầu bổ sung $\rightarrow$ Phê duyệt).
5. **Tab 5 — Hội đồng Thẩm định (`DossierCouncilTab.tsx`):** Danh sách thành viên Hội đồng được phân công chấm điểm.
6. **Tab 6 — Đóng gói Hồ sơ (`DossierPackageTab.tsx`):** Công cụ đóng gói trọn bộ hồ sơ thành 1 file ZIP hoặc PDF tổng hợp.
7. **Modal Xuất Biểu mẫu QĐ 148 (`Qd148DocumentModal.tsx`):** Xem trước và kết xuất:
   - *Biểu mẫu 01:* Phiếu đăng ký đánh giá phân hạng.
   - *Biểu mẫu 02:* Phương án kinh doanh sản phẩm OCOP.
   - *Biểu mẫu 03:* Báo cáo tự đánh giá kết quả kèm danh mục minh chứng.

---

### 6.5. Trang Kho Minh chứng Số MinIO S3 (`EvidencesPage.tsx` — `/ocop/evidences`)
- **Thẻ KPI Minh chứng (`EvidenceKpiCards.tsx`):** Tổng số tệp tin, Dung lượng lưu trữ đã dùng, Tỷ lệ tài liệu đã xác thực SHA-256 (100%), Số tài liệu sắp hết hạn (VietGAP, kiểm nghiệm).
- **Bảng Quản lý Minh chứng (`EvidencesTable.tsx`):** Tên file, Loại tài liệu, Tiêu chí OCOP liên kết, Dung lượng, Mã băm SHA-256 (rút gọn), Ngày tải lên, Trạng thái (`Đã xác thực`), Thao tác.
- **Drawer Xem trước Minh chứng (`EvidencePreviewDrawer.tsx`):** Xem trực tiếp file PDF hoặc hình ảnh trong khung slide-over mà không cần tải về máy; kiểm tra chữ ký số và mã băm toàn vẹn.
- **Modal Thêm Minh chứng Số Hóa 2 Chế Độ (`AddEvidenceModal.tsx`):**
  - *Chế độ 1 — Tải lên tệp thủ công:* Tải file PDF, JPG, PNG (tối đa 25MB) từ máy tính, liên kết với chỉ tiêu QĐ 148, tự động tính mã băm SHA-256 tamper-evident.
  - *Chế độ 2 — ⚡ Trích xuất từ dữ liệu HTX (Auto Cross-Reference — `AutoExtractInternalEvidenceTab.tsx`):* Tự động tổng hợp và liên kết hồ sơ số hóa từ hệ thống nội bộ mà không cần scan giấy tờ thủ công:
    1. *Nhật ký VietGAP (TCVN 11892-1:2017):* Trích xuất từ module Agriculture & Farming Logs $\rightarrow$ Gắn vào chỉ tiêu `TC-A.1.1` (Quy trình sản xuất an toàn).
    2. *Nghiệm thu KCS & Test Lab dư lượng thuốc BVTV:* Trích xuất từ module Harvest KCS Gate & Lab $\rightarrow$ Gắn vào chỉ tiêu `TC-B.1.1` (Chất lượng an toàn thực phẩm).
    3. *Hồ sơ Lô hàng GS1 Traceability:* Trích xuất từ module GS1 Lots $\rightarrow$ Gắn vào chỉ tiêu `TC-B.2.1` (Bao bì, nhãn hàng hóa và truy xuất nguồn gốc).
    4. *Liên kết chuỗi xã viên:* Trích xuất từ module Members $\rightarrow$ Gắn vào chỉ tiêu `TC-A.2.1` (Tổ chức sản xuất và liên kết chuỗi giá trị).

---

### 6.6. Trang Hội đồng Chấm điểm & Quorum Guard (`EvaluationsPage.tsx` — `/ocop/evaluation`)
- **Tab 1 — Phiên Chấm điểm (`EvaluationSessionsTab.tsx`):**
  - Danh sách các phiên thẩm định Hội đồng OCOP cấp Huyện/Tỉnh/Trung ương, mã phiên, ngày chấm, địa điểm, số lượng hồ sơ thẩm định và trạng thái.
  - **Modal Khởi tạo Phiên Đánh giá Mới (`CreateEvaluationSessionModal.tsx`):** Cho phép ban thư ký nhập mã phiên, tên phiên, chọn cấp Hội đồng thẩm định (`DISTRICT` - Huyện 3 sao, `PROVINCIAL` - Tỉnh 4 sao & đề xuất 5 sao, `CENTRAL` - Trung ương 5 sao quốc gia theo QĐ 148 và 1489), ngày tổ chức, địa điểm và ghi chú quyết định thành lập Hội đồng.
  - **Modal Phân công Ban Giám khảo (`AssignEvaluatorsModal.tsx`):** Danh sách ban giám khảo chuyên môn (Chủ tịch Hội đồng, Thư ký, Ủy viên phản biện đại diện Sở Nông nghiệp, Sở KH&CN, Trung tâm Kiểm soát bệnh tật CDC), kiểm tra số lượng giám khảo hợp lệ (5–7 thành viên) trước khi lưu.
- **Tab 2 — Chấm điểm Độc lập (`IndependentScoringTab.tsx`):** Dành cho từng giám khảo: Chấm điểm bí mật từng chỉ tiêu, nhập nhận xét phản biện, khóa bảng điểm cá nhân (`lockScoreSheetMutation`).
- **Tab 3 — Tổng hợp Điểm Hội đồng (`EvaluationConsolidationTab.tsx`):**
  - **Kiểm tra Túc số (Quorum Guard):** Hiển thị số lượng giám khảo đã nộp bài. Bắt buộc $\ge 3$ thành viên mới cho phép kích hoạt nút **"Tổng Hợp Điểm Trung Bình"**.
  - Tính điểm trung bình cộng từng phần A/B/C và đề xuất hạng sao (1 đến 5 sao).

---

### 6.7. Trang Quyết định Phân hạng Sao OCOP (`DecisionsPage.tsx` — `/ocop/decisions`)
- **Nút "Ban hành Quyết định mới":** Mở **Modal Ban hành Quyết định Công nhận OCOP (`IssueDecisionModal.tsx`)**:
  - Nhập số quyết định chính thức (VD: `QĐ-UBND-2026-089`), chọn cấp quyết định (UBND Huyện / UBND Tỉnh / Bộ NN&PTNT), chọn hạng sao công nhận (⭐⭐⭐ 3 Sao, ⭐⭐⭐⭐ 4 Sao, ⭐⭐⭐⭐⭐ 5 Sao).
  - Tên sản phẩm, chủ thể HTX, người ký phê duyệt, chức vụ (Phó Chủ tịch UBND) và ngày có hiệu lực.
  - Hệ thống tự động thiết lập thời hạn hiệu lực chính xác **36 tháng** theo quy định pháp luật OCOP.
- **Bảng Quyết định Công nhận:** Số quyết định, Tên sản phẩm & HTX, Hạng sao đạt được, Thời hạn hiệu lực (Từ ngày ... Đến ngày ... (36T)), Trạng thái (`Đã Ban Hành`, `Chờ Ký Duyệt`, `Bị Từ Chối`).
- **Modal Chi tiết & Phê duyệt:** Xem toàn bộ thông tin quyết định, duyệt hoặc từ chối công nhận; kết xuất bộ Hồ sơ OCOP PDF và Bằng Giấy Chứng Nhận OCOP có hoa văn trang trọng.


---

### 6.8. Trang Báo cáo Sẵn sàng Hồ sơ OCOP (`OcopReportsPage.tsx` — `/ocop/reports`)
- **Báo cáo Mức độ Sẵn sàng (Readiness Audit):** Phân tích điểm tự chấm so với tiêu chuẩn 4 sao / 5 sao; cảnh báo những chỉ tiêu chưa có minh chứng hợp lệ để HTX kịp thời bổ sung trước ngày nộp hội đồng.
- **Biểu đồ Radar Năng lực:** Trực quan hóa điểm số thực tế so với điểm tối đa của 3 phần: Phần A (Cộng đồng), Phần B (Tiếp thị), Phần C (Chất lượng kỹ thuật).

---

## 7. NHÓM 6: BÁO CÁO ĐIỀU HÀNH, KIỂM TOÁN & QUẢN TRỊ HỆ THỐNG

### 7.1. Trang Bảng điều hành Trung tâm (`DashboardPage.tsx` — `/dashboard`)
- **Thẻ KPI Điều hành (`DashboardStatCards.tsx`):** Tổng số xã viên đang hoạt động, Tổng diện tích canh tác (ha), Tổng sản lượng vụ hiện tại (tấn), Số dư quỹ tiền mặt khả dụng.
- **Biểu đồ Tổng quan OCOP (`DashboardOcopBreakdown.tsx`):** Tỷ lệ hồ sơ OCOP theo từng cấp độ sao và tiến độ hoàn thiện.
- **Trung tâm Công việc Cần xử lý (`DashboardTaskHub.tsx`):** Danh sách các cảnh báo nóng: Lô hàng sắp đến ngày cách ly PHI, Xã viên quá hạn góp vốn 6 tháng, Vật tư sắp hết hạn trong kho, Hồ sơ OCOP bị yêu cầu sửa đổi.

---
### 7.2. Trang Báo cáo - Thống kê Hoạt động HTX & OCOP (`ReportsPage.tsx` — `/reports`)
Được tái cấu trúc toàn diện thành **Trung tâm Báo cáo Điều hành 4 Tabs chuyên biệt**, tích hợp chặt chẽ với API backend `/reports/dashboard`, `/reports/export/members`, `/reports/export/cash-book` và bộ tiện ích in/xuất tài liệu tương thích máy tính xách tay:

1. **Tab 1: Báo Cáo Xã Viên & Vốn Góp (`MembersEquityReportTab.tsx`):**
   - **4 Thẻ Chỉ Số KPI:** Tổng số xã viên (phân tách chính thức / liên kết), Vốn điều lệ cam kết vs Vốn đã góp thực tế, Tỷ lệ hoàn thành nộp vốn (%), Tỷ lệ vốn góp của thành viên liên kết (với cơ chế kiểm soát trần 30% theo Điều 29 Luật HTX số 17/2023/QH15).
   - **Bảng Thống kê Chi tiết:** Mã xã viên, Họ tên, Số CCCD, Điện thoại, Phân loại, Vốn góp thực tế, Trạng thái.
   - **Hành động Xuất Dữ liệu:**
     - Nút *"Xuất Sổ Xã Viên Excel"*: Gọi API backend `/reports/export/members` tạo file Excel OpenXML chuẩn.
     - Nút *"In / Lưu PDF"*: Mở cửa sổ in chuẩn A4 ngang có thanh điều khiển tương tác (In, Lưu PDF, Tải file HTML offline).

2. **Tab 2: Sổ Quỹ Tiền Mặt & Dòng Tiền (`FinanceCashbookReportTab.tsx`):**
   - **4 Thẻ Chỉ Số KPI:** Tổng thu tiền vào quỹ (+), Tổng chi tiền ra quỹ (-), Tồn quỹ khả dụng (Tiền mặt tại quỹ & ngân hàng), Công nợ phải thu xã viên (tạm ứng giống, phân bón).
   - **Nhật ký Bút toán Sổ Quỹ:** Mã chứng từ, Ngày lập, Loại phiếu (Thu/Chi), Khoản mục, Diễn giải, Số tiền phát sinh, Trạng thái phê duyệt.
   - **Hành động Xuất Dữ liệu:**
     - Nút *"Xuất Sổ Quỹ Excel"*: Gọi API backend `/reports/export/cash-book` kết xuất dữ liệu sổ quỹ.
     - Nút *"In / Lưu PDF"*: Mở bản in chuẩn Sổ quỹ kế toán HTX đầy đủ 3 chữ ký (Thủ quỹ, Kế toán trưởng, Giám đốc HTX).

3. **Tab 3: Mùa Vụ & An Toàn Canh Tác VietGAP (`CropVietgapReportTab.tsx`):**
   - **4 Thẻ Chỉ Số KPI:** Tổng diện tích vùng trồng (ha), Số thửa đất số hóa GIS, Số mùa vụ đang vận hành, Sản lượng thu hoạch lũy kế (tấn).
   - **Bảng Kế hoạch Mùa vụ:** Mã mùa vụ, Tên mùa vụ / Cây trồng, Thời gian canh tác, Sản lượng dự kiến, Tiêu chuẩn chất lượng (VietGAP TCVN 11892-1:2017 & TCVN 12850:2019), Trạng thái.
   - **Hành động Xuất Dữ liệu:** In / Lưu PDF Báo cáo Quy trình Canh tác & Cách ly an toàn PHI.

4. **Tab 4: Tiến Độ Đánh Giá & Xếp Hạng OCOP (`OcopReadinessReportTab.tsx`):**
   - **4 Thẻ Chỉ Số KPI:** Tổng số sản phẩm OCOP số hóa, Số bộ hồ sơ đăng ký đánh giá, Số hồ sơ đã nộp hội đồng thẩm định (SUBMITTED), Cơ cấu phân hạng sao mục tiêu (3 sao cấp Huyện, 4 sao cấp Tỉnh, 5 sao Quốc gia).
   - **Khung Hướng dẫn Pháp lý:** Tóm tắt thẩm quyền và ngưỡng điểm phân hạng sao theo Quyết định 148/QĐ-TTg và Quyết định 1489/QĐ-TTg.
   - **Liên kết Nhanh:** Mở Trung tâm Phân tích OCOP Chuyên sâu (`/ocop/reports`) với biểu đồ Radar 5 nhóm chỉ số và phân tích xu hướng doanh thu.

---

### 7.3. Trang Nhật ký Kiểm toán Chuỗi băm SHA-256 (`AuditPage.tsx` — `/audit`)
- **Nút "Kiểm tra toàn vẹn chuỗi Hash (Verify Chain Integrity)":**
  - Mở **Modal Đối Soát Toàn Vẹn Chuỗi Băm SHA-256 (`VerifyChainModal.tsx`)**:
  - Tự động chạy thuật toán quét tamper-evident tuần tự qua toàn bộ bản ghi kiểm toán trong hệ thống.
  - Kiểm tra tính hợp lệ của hàm băm SHA-256 (64 ký tự hex) và tính liên tục của chuỗi liên kết cha-con (`previous_hash` $\rightarrow$ `current_hash`).
  - Báo cáo kết quả trực quan: Tổng số bản ghi đã quét, Số bản ghi hợp lệ 100%, Cảnh báo nếu phát hiện đứt gãy hoặc can thiệp trái phép vào cơ sở dữ liệu.
  - Nhắc nhở quy tắc an toàn dữ liệu: Chuỗi băm SHA-256 là biện pháp phát hiện sai lệch (tamper-evident) hoạt động song hành cùng Database Transaction bảo vệ toàn vẹn dữ liệu.
- **Bảng Nhật ký Kiểm toán:** Thời gian, Người thực hiện, Hành động (`MEMBER_CREATED`, `SETTLEMENT_APPROVED`, `PHI_VIOLATION_BLOCKED`), Đối tượng tác động, Mã băm hiện tại (`hashSha256`), Trạng thái chuỗi.
- **Drawer Chi tiết Kiểm toán (`AuditLogDrawer.tsx`):**
  - *Tab So sánh biến động (`AuditLogTabDiff.tsx`):* Hiển thị bảng so sánh trực quan Diff (Trước khi sửa màu đỏ, Sau khi sửa màu xanh).
  - *Tab Xác thực Bảo mật (`AuditLogTabSecurity.tsx`):* Hiển thị chuỗi băm nối tiếp: `previous_hash` + dữ liệu mới = `current_hash`, chứng minh dữ liệu không bị ai can thiệp trực tiếp từ cơ sở dữ liệu.

---

### 7.4. Trang Cấu hình Hệ thống & Phân quyền RBAC (`SystemSettingsPage.tsx` — `/system/settings`)
Bao gồm 7 khối chức năng quản trị nền tảng:
1. **Tổng quan Cấu hình Hệ thống (`SystemInfoCard.tsx`):** Phiên bản Laravel, React, PostgreSQL, Dung lượng MinIO đã dùng.
2. **Quản trị Đa Hợp Tác Xã Multi-Tenant (`TenantManagementCard.tsx`):**
   - Bảng điều khiển danh sách các Hợp tác xã thành viên trong hệ sinh thái đa người thuê (Multi-tenant).
   - Hiển thị: Mã HTX, Tên pháp nhân, Tỉnh/thành phố, Mã số thuế, Người đại diện, Số lượng xã viên, Số vùng trồng PUC, Số hồ sơ OCOP, Gói dịch vụ (`Basic`, `Standard OCOP`, `Enterprise OCOP`), Trạng thái hoạt động (`ACTIVE`, `PENDING_REVIEW`).
   - Nút **"Chuyển ngữ cảnh" (Tenant Context Switch):** Cho phép tài khoản Quản trị viên cấp cao (`SYSTEM_ADMIN`) chuyển đổi ngữ cảnh HTX đang làm việc tức thời qua `useTenantContextStore` mà không cần đăng xuất.
   - Modal **"Đăng ký HTX mới"**: Tiếp nhận đăng ký pháp nhân HTX mới gia nhập nền tảng.
3. **Cấu hình Nghiệp vụ HTX (`BusinessSettingsCard.tsx`):** Cấu hình tỷ lệ phí dịch vụ thu mua (2% - 3%), Tỷ lệ phân bổ thặng dư dịch vụ/vốn (70/30 hoặc 50/50), Hạn mức tín dụng gợi ý theo ha.
4. **Cấu hình An toàn Bảo mật (`SecuritySettingsCard.tsx`):** Thời hạn hết hạn phiên đăng nhập Sanctum token, Độ dài mật khẩu tối thiểu.
5. **Quản lý Tài khoản Người dùng (`UserManagementCard.tsx`, `UserModal.tsx`):** Danh sách tài khoản, Khóa/Mở tài khoản, Đặt lại mật khẩu.
6. **Quản lý Vai trò & Ma trận Phân quyền (`RoleManagementCard.tsx`, `RolePermissionMatrixCard.tsx`):** Phân chia ma trận quyền cho 4 nhóm: `HTX_OWNER`, `HTX_STAFF`, `EVALUATOR`, `SYSTEM_ADMIN`.
7. **Sao lưu & Phục hồi (`BackupRestoreCard.tsx`):** Lên lịch sao lưu cơ sở dữ liệu PostgreSQL và cấu hình khôi phục dữ liệu khi có sự cố.



---

## 8. CHUẨN HÓA KIẾN TRÚC TAB DÀNH CHO CÁC MÀN HÌNH ĐA NHIỆM VỤ & BỘ TIỆN ÍCH XUẤT/IN CHO LAPTOP

### 8.1. Danh Mục Các Màn Hình Đã Bóc Tách Thành Tabs Chuyên Biệt
Để giải quyết triệt để tình trạng một giao diện gánh vác quá nhiều vai trò gây quá tải thị giác và khó khăn khi cuộn trên màn hình nhỏ/laptop, các trang cốt lõi đã được tái cấu trúc thành kiến trúc Tabs phân tầng:

| Giao diện | Đường dẫn | Cấu trúc Tabs phân tầng | Mục tiêu & Chuẩn mực nghiệp vụ |
| :--- | :--- | :--- | :--- |
| **Thửa đất & Vùng trồng** | `/agriculture/plots` | • **Tab 1:** Bảng phân lô & Giám sát diện tích<br/>• **Tab 2:** Bản đồ số hóa GIS & Không gian | Thay thế layout chia đôi chật hẹp bằng 2 tab độc lập, tối ưu chiều cao hiển thị và trực quan hóa bản đồ vệ tinh Mapbox |
| **Nhật ký Canh tác** | `/agriculture/logs` | • **Tab 1:** Sổ Nhật Ký Canh Tác Điền Dã<br/>• **Tab 2:** Giám Sát Cách Ly Thuốc BVTV & Cảnh Báo PHI | Tách biệt nhật ký hoạt động canh tác hàng ngày với module giám sát nghiêm ngặt thời gian cách ly PHI (Pre-Harvest Interval) VietGAP TCVN 11892-1:2017 & TCVN 12850:2019 |
| **Sản phẩm & Kho** | `/inventory/products` | • **Tab 1:** Thành Phẩm OCOP & Liên Kết Lô GS1<br/>• **Tab 2:** Kho Thành Phẩm & Bảo Quản | Kết nối toàn diện với API backend `/warehouses` (trước đó chưa có UI) với đầy đủ CRUD, gán thủ kho và kiểm soát nhiệt độ bảo quản |
| **Quản lý Xã viên** | `/members` | • **Tab 1:** Sổ Đăng Ký Xã Viên<br/>• **Tab 2:** Đất Đai & QSDĐ Đóng Góp<br/>• **Tab 3:** Đơn Chờ Xét Duyệt | Tích hợp bảng đăng ký quyền sử dụng đất (`land_contributions`) theo Luật HTX 17/2023/QH15 và phân loại xã viên chính thức/liên kết |
| **Báo Cáo - Thống Kê** | `/reports` | • **Tab 1:** Báo Cáo Xã Viên & Vốn Góp<br/>• **Tab 2:** Sổ Quỹ Tiền Mặt & Dòng Tiền<br/>• **Tab 3:** Mùa Vụ & An Toàn VietGAP<br/>• **Tab 4:** Tiến Độ Đánh Giá & Xếp Hạng OCOP | Nâng cấp từ trang điều hướng đơn giản thành Trung tâm Báo cáo Điều hành toàn diện với biểu đồ, bảng dữ liệu, xuất Excel và in PDF |

### 8.2. Bộ Giải Pháp In & Xuất Tài Liệu PDF Thích Ứng Cho Máy Tính Xách Tay (Laptop)
Người dùng máy tính xách tay (laptop) và thiết bị văn phòng thường không kết nối trực tiếp với máy in vật lý. Hệ thống giải quyết trọn vẹn rào cản này bằng kiến trúc xuất/in tương tác 3 lớp:

1. **Bộ Tiện Ích Trực Quan `pdfExportUtils.ts`:**
   - Cung cấp hàm `openInteractivePrintWindow` mở cửa sổ hiển thị tài liệu chuẩn A4 (Portrait / Landscape).
   - Tích hợp thanh công cụ nổi cố định (`#htx-print-toolbar`, ẩn tự động khi in qua `@media print`) gồm 3 nút hành động:
     - 🖨️ **"In / Lưu PDF":** Kích hoạt hộp thoại in của trình duyệt với hướng dẫn rõ ràng: *"Dùng Laptop: Tại mục Máy in, chọn 'Lưu dưới dạng PDF' (Save as PDF) để tải file PDF về máy."*
     - 📥 **"Tải File Lưu Trữ (.html)":** Tự động đóng gói và tải ngay file HTML độc lập chứa toàn bộ styles và nội dung chứng từ về máy tính để gửi qua Email, Zalo hoặc lưu trữ nội bộ.
     - ✕ **"Đóng":** Đóng cửa sổ xem trước một cách nhanh chóng.
   - Hàm `downloadDocumentHtml`: Lưu trữ trực tiếp tài liệu dưới định dạng file HTML có thể mở trên mọi trình duyệt mà không cần cài thêm phần mềm.

2. **Áp Dụng Đồng Bộ Trên Toàn Bộ Chứng Từ & Tem Nhãn:**
   - **Phiếu Thu / Chi Sổ Quỹ (`VoucherPrintModal.tsx` & `voucherDocumentGenerator.ts`):** Chuẩn khổ A4/A5, có nút "Tải File" trực tiếp, hiển thị số tiền bằng chữ, mã QR kiểm toán và 3 chữ ký.
   - **Giấy Chứng Nhận Phần Vốn Góp (`capitalCertificatePrinter.ts`):** Mẫu chuẩn theo Luật HTX 17/2023/QH15, có mã QR chứng nhận, hỗ trợ tải file và in PDF.
   - **Hồ Sơ Xã Viên Toàn Diện (`memberProfilePrinter.ts`):** Trích xuất lý lịch, vốn cam kết, diện tích đất đóng góp.
   - **Tem Nhãn GS1 QR Nông Sản (`HarvestLabelPrintModal.tsx`):** Chuẩn 100mm × 75mm dán thùng carton, có nút "Tải File Tem (.html)" và "In / Lưu PDF", hiển thị mã QR truy xuất và phân hạng KCS Grade A/B.

---

## 9. ĐÁNH GIÁ & KIỆN TOÀN CÁC LUỒNG ĐIỀU HƯỚNG NGHIỆP VỤ (END-TO-END NAVIGATION AUDIT & WORKFLOW BRIDGING)

Qua quá trình rà soát toàn diện trải nghiệm người dùng và chu trình vận hành nghiệp vụ thực tế, toàn bộ hệ thống đã được kiểm tra tính liền mạch, xóa bỏ các điểm cụt (dead ends) và bổ sung các liên kết chuyển tiếp trực tiếp giữa các module phụ thuộc:

### 9.1. Chu trình Hồ sơ & Phân hạng OCOP (QĐ 148/QĐ-TTg & QĐ 1489/QĐ-TTg)
- **Chuỗi quy trình khép kín:** Khởi tạo hồ sơ (`/ocop/dossiers/create`) $\rightarrow$ Kê khai vùng trồng $\rightarrow$ Tự đánh giá 11 tiêu chí (`/ocop/dossiers/:id` — Tab 2) $\rightarrow$ Số hóa kho minh chứng số SHA-256 (Tab 4) $\rightarrow$ Đối soát sẵn sàng & Chính thức nộp hồ sơ (Tab 6: `DossierWorkflowTab.tsx`) $\rightarrow$ Hội đồng thẩm định độc lập & Tổng hợp khống chế hạ sao (`/ocop/evaluation`) $\rightarrow$ Ban hành Quyết định công nhận & Giấy chứng nhận (`/ocop/decisions`) $\rightarrow$ Phân tích chỉ số sẵn sàng (`/ocop/reports`).
- **Điểm cải tiến điều hướng then chốt:**
  1. **Nâng cấp `DossierWorkflowTab.tsx` thành Trung tâm FSM Tương tác:**
     - Tích hợp thanh tiến trình 5 bước trực quan: *Khởi tạo $\rightarrow$ Tự chấm điểm $\rightarrow$ Niêm phong minh chứng $\rightarrow$ Nộp Hội đồng $\rightarrow$ Thẩm định & Cấp sao*.
     - Gọi API backend `/reports/ocop-readiness/{id}` để hiển thị 3 chỉ số đối soát tự động: Tỷ lệ hoàn thành tự đánh giá, Tỷ lệ phủ minh chứng, Chỉ số sẵn sàng tổng thể.
     - Tích hợp nút hành động FSM *"Chính thức nộp hồ sơ lên Hội đồng OCOP"* (`POST /ocop/applications/{id}/submit`), tự động chuyển hồ sơ sang trạng thái Đang thẩm định và khóa chỉ đọc (Read-only) bảo vệ toàn vẹn dữ liệu.
     - Bổ sung 4 liên kết điều hướng trực tiếp: *Chuyển tới Hội đồng thẩm định*, *Xem Quyết định sao*, *Mở Báo cáo phân tích*, *Kiểm tra chuỗi băm kiểm toán SHA-256*.
  2. **Liên kết Chuyển tiếp từ Hội đồng sang Ban hành Quyết định (`EvaluationConsolidationTab.tsx`):**
     - Bổ sung banner hành động *"Sẵn sàng ban hành"*: Khi Hội đồng hoàn tất tính điểm trung bình và khống chế sao (`READY_FOR_DECISION`), giao diện hiển thị nút hành động lớn *"Chuyển sang Ban Hành Quyết Định OCOP"* trỏ trực tiếp đến `/ocop/decisions`.
  3. **Tối ưu Bóc tách Component Quyết định OCOP (`DecisionsPage.tsx` & `DecisionDetailModal.tsx`):**
     - Bóc tách `DecisionDetailModal.tsx` độc lập, giảm số dòng của `DecisionsPage.tsx` từ 405 dòng xuống 295 dòng (đảm bảo ngưỡng an toàn $\le 400$ dòng của Single Responsibility).

---

### 9.2. Chu trình Canh tác, Giám sát PHI & Thu hoạch GS1
- **Chuỗi quy trình khép kín:** Vùng sản xuất (`/agriculture/plots` — Vùng trồng) $\rightarrow$ Thửa đất & Bản đồ số hóa GIS (`/agriculture/plots` — Thửa đất) $\rightarrow$ Kế hoạch Mùa vụ (`/agriculture/seasons`) $\rightarrow$ Nhật ký canh tác điền dã & Khóa an toàn PHI (`/agriculture/logs`) $\rightarrow$ Lệnh thu hoạch, KCS 3 tầng & Lô tem GS1 (`/agriculture/harvests`) $\rightarrow$ Cổng thông tin truy xuất nguồn gốc công khai (`/traceability/:lotCode`).
- **Điểm cải tiến điều hướng then chốt:**
  1. **Lối tắt thao tác trên từng Mùa vụ (`CropSeasonsTable.tsx`):**
     - Mỗi dòng mùa vụ đang vận hành được bổ sung 2 nút điều hướng tức thời:
       - 📖 **"Nhật ký":** Chuyển trực tiếp sang `/agriculture/logs?season_id={id}` để xem hoặc ghi chép hoạt động canh tác của đúng mùa vụ đó.
       - 🍇 **"Thu hoạch":** Chuyển trực tiếp sang `/agriculture/harvests?season_id={id}` để kiểm tra hoặc tạo lệnh thu hoạch mới cho vụ.
  2. **Nhận diện Query Parameter thông minh (`FarmingLogsPage.tsx` & `HarvestsPage.tsx`):**
     - Trang Nhật ký canh tác và Trang Thu hoạch tự động đọc tham số `season_id` từ URL qua hook `useSearchParams()`.
     - Tự động lọc bảng dữ liệu theo đúng mùa vụ được chọn và hiển thị chip thông báo: *"Đang lọc theo mã mùa vụ: [ID] (Bỏ lọc để xem toàn bộ)"*.

---

### 9.3. Chu trình Quản trị Xã viên, Vốn góp & Đất đai
- **Chuỗi quy trình khép kín:** Tiếp nhận xã viên mới / Đơn chờ duyệt (`/members`) $\rightarrow$ Phân loại xã viên chính thức / liên kết $\rightarrow$ Quản lý Vốn điều lệ & Cổ phần (`/capital`) $\rightarrow$ Kê khai Quyền sử dụng đất đóng góp (`/members` — Tab 2: Đất Đai & QSDĐ) $\rightarrow$ Đại hội thành viên & Biểu quyết Nghị quyết (`/meetings`) $\rightarrow$ Quyết toán niên độ & Phân phối thặng dư (`/profit-distribution`).
- **Điểm cải tiến điều hướng then chốt:**
  1. **Liên kết 2 chiều giữa Hồ sơ Xã viên và Sổ Vốn Điều Lệ:**
     - Tại ngăn kéo chi tiết xã viên (`MemberDrawer.tsx` $\rightarrow$ `MemberTabCapital.tsx`), bổ sung nút *"Mở Sổ vốn điều lệ HTX"* trỏ đến `/capital?member_id={id}`.
     - Tại trang Quản lý Vốn góp (`CapitalPage.tsx`), tự động nhận diện tham số `member_id` và kích hoạt ngay bản ghi của xã viên đó, hiển thị đầy đủ tiến độ nộp vốn và lịch sử phiếu thu.
  2. **Liên kết từ Hồ sơ Xã viên sang Bản đồ Thửa đất Canh tác:**
     - Tại tab Canh tác & Thửa đất (`MemberTabFarmingPlots.tsx`), bổ sung nút *"Quản lý Thửa đất & Bản đồ GIS"* trỏ trực tiếp đến `/agriculture/plots` giúp ban giám đốc nhanh chóng kiểm tra phân bổ đất đai.

---

> [!NOTE]
> Tài liệu này được lưu trữ chính thức tại [`docs/40_CHI_TIET_HIEN_TRANG_CAC_GIAO_DIEN_DA_TRIEN_KHAI.md`](file:///f:/HTX_OCOP_PROJECT/docs/40_CHI_TIET_HIEN_TRANG_CAC_GIAO_DIEN_DA_TRIEN_KHAI.md) và đối chiếu đồng bộ với tài liệu kiến trúc cơ sở dữ liệu [`docs/39_KIEN_TRUC_TRU_COT_CSDL_VA_QUY_TRINH_HOAT_DONG.md`](file:///f:/HTX_OCOP_PROJECT/docs/39_KIEN_TRUC_TRU_COT_CSDL_VA_QUY_TRINH_HOAT_DONG.md).


