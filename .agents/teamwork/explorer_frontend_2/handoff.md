# BÁO CÁO KHẢO SÁT KIẾN TRÚC FRONTEND & LỘ TRÌNH TRIỂN KHAI CHO WORKER
**Dự án**: Số hóa Phân hệ Sản xuất, Nhật ký Canh tác TT02/2024 & Thu hoạch - KCS - Truy xuất Nguồn gốc GS1 (HTX Tân Tiến - Ớt chuông Sweet Palermo Đỏ Đà Lạt)  
**Tác giả**: Frontend Architecture Explorer  
**Thời gian**: 2026-10-13T16:25:00Z  
**Thư mục làm việc**: `f:\HTX_OCOP_PROJECT\.agents\teamwork\explorer_frontend_2`

---

## 1. Observation (Quan sát Thực tế)

### 1.1 Khảo sát Công nghệ & Cấu trúc Dự án
- **Thư mục gốc Frontend**: `f:\HTX_OCOP_PROJECT\frontend`
- **Framework & Thư viện lõi (`frontend/package.json`)**:
  - React `18.2.0`, React DOM `18.2.0`, Vite `5.1.6`, TypeScript `5.2.2`
  - React Router DOM `6.22.3`
  - TanStack React Query `@tanstack/react-query` `5.28.9`
  - Styling: Tailwind CSS `3.4.19`, PostCSS `8.5.28`, Autoprefixer `10.6.1`, `clsx`, `tailwind-merge`
  - Biểu đồ & Icon: Recharts `3.10.1`, Lucide React `0.359.0`
  - HTTP Client: Axios `1.20.0`, UUID `14.0.2`, XLSX `0.18.5`
- **Cấu trúc thư mục nguồn (`frontend/src`)**:
  - `layouts/`: `AppLayout.tsx`, `AuthLayout.tsx`, `Header.tsx`, `Sidebar.tsx`, `PageHeader.tsx`, `Breadcrumb.tsx`
  - `components/ui/`: `Button.tsx`, `Card.tsx`, `DataTable.tsx`, `Input.tsx`, `Modal.tsx`, `Select.tsx`, `Skeleton.tsx`, `StatusBadge.tsx`, `Textarea.tsx`, `ToastNotification.tsx`
  - `router/`: `AppRoutes.tsx`, `navigation.ts`, `ProtectedRoute.tsx`, `GuestRoute.tsx`
  - `services/`: `apiClient.ts`, `farmPlotApi.ts`, `cropSeasonApi.ts`, `inventoryApi.ts`, `memberService.ts`, `ocopService.ts`, `financeApi.ts`, `tokenStorage.ts`
  - `features/agriculture/pages/`:
    - `FarmPlotsPage.tsx` (895 dòng)
    - `CropSeasonsPage.tsx` (1005 dòng)
    - `FarmingLogsPage.tsx` (206 dòng)
    - `HarvestsPage.tsx` (266 dòng)
    - `LotTraceabilityPage.tsx` (232 dòng)

### 1.2 Kết quả Kiểm tra Baseline Validation
Explorer đã thực thi trực tiếp các lệnh xác thực trên terminal tại thư mục `frontend`:

1. **Kiểm tra Build (`npm run build`)**:
```
> htx-ocop-frontend@1.0.0 build
> tsc && vite build

vite v5.4.21 building for production...
transforming...
✓ 2292 modules transformed.
rendering chunks...
computing gzip size...
dist/index.html                                     1.07 kB │ gzip:   0.57 kB
dist/assets/index-BBPc_YLX.css                     87.77 kB │ gzip:  13.61 kB
dist/assets/Skeleton-QfjJ1D6a.js                    0.35 kB │ gzip:   0.26 kB
dist/assets/Card-C8fk214J.js                        0.35 kB │ gzip:   0.26 kB
dist/assets/PageHeader-CCAL5NsV.js                  0.51 kB │ gzip:   0.31 kB
dist/assets/formatters-CzkaTNuG.js                  1.19 kB │ gzip:   0.73 kB
dist/assets/Button-DQFRPsoA.js                      1.31 kB │ gzip:   0.68 kB
dist/assets/Input-DRJuAWau.js                       1.49 kB │ gzip:   0.70 kB
dist/assets/Modal-BYCv2nyZ.js                       1.52 kB │ gzip:   0.75 kB
dist/assets/apiClient-CbuNAn4T.js                   1.69 kB │ gzip:   1.08 kB
dist/assets/StatusBadge-Dpi7qzDo.js                 2.19 kB │ gzip:   0.82 kB
dist/assets/DataTable-BBWdjU0h.js                   3.35 kB │ gzip:   1.28 kB
dist/assets/ProductsPage-CnmHhphT.js                3.50 kB │ gzip:   1.46 kB
dist/assets/LoginPage-CFeaL-A6.js                   3.50 kB │ gzip:   1.76 kB
dist/assets/farmPlotApi-CQcaJFv1.js                 4.57 kB │ gzip:   1.56 kB
dist/assets/CoopProfilePage-CufQc-h2.js             4.69 kB │ gzip:   1.39 kB
dist/assets/ReportsPage-BmfIQWmM.js                 5.69 kB │ gzip:   1.88 kB
dist/assets/AuditPage-BiPYfS_1.js                   5.84 kB │ gzip:   2.54 kB
dist/assets/FarmingLogsPage-CO1ksb7n.js             6.61 kB │ gzip:   2.64 kB
dist/assets/HarvestsPage-BxxIHCxP.js                7.05 kB │ gzip:   2.89 kB
dist/assets/DecisionsPage-D30NCM6C.js               8.11 kB │ gzip:   2.81 kB
dist/assets/LotTraceabilityPage-Ds5tTc7a.js         9.29 kB │ gzip:   3.04 kB
dist/assets/FinancePage-C8sCK4nA.js                 9.81 kB │ gzip:   3.14 kB
dist/assets/RealtimeProgressBar-CStHUcsi.js        13.43 kB │ gzip:   3.92 kB
dist/assets/DashboardPage-DZBC7eCx.js              14.06 kB │ gzip:   3.02 kB
dist/assets/EvaluationsPage-CzmuTzwi.js            14.31 kB │ gzip:   4.49 kB
dist/assets/EvidencesPage-MZxTEAOw.js              16.76 kB │ gzip:   4.15 kB
dist/assets/voucherDocumentGenerator-CjWv4ibj.js   18.94 kB │ gzip:   5.68 kB
dist/assets/OcopReportsPage-Mni5Y528.js            19.32 kB │ gzip:   3.78 kB
dist/assets/DossiersPage-DkqIFo_X.js               21.27 kB │ gzip:   5.10 kB
dist/assets/ocopQd148Data-B23S3GUA.js              21.34 kB │ gzip:   7.78 kB
dist/assets/CriteriaPage-C_O3cvCV.js               21.58 kB │ gzip:   7.29 kB
dist/assets/index-CEdiDYzo.js                      30.24 kB │ gzip:   9.40 kB
dist/assets/memberService-lASAO2H_.js              31.06 kB │ gzip:   7.50 kB
dist/assets/FarmPlotsPage-CeT05FAT.js              31.65 kB │ gzip:   7.21 kB
dist/assets/DossierDetailPage-C3-uCdp_.js          32.44 kB │ gzip:   7.14 kB
dist/assets/CropSeasonsPage-DihK1FvJ.js            33.62 kB │ gzip:   8.44 kB
dist/assets/ProfitPage-Bz7pfAzG.js                 33.78 kB │ gzip:   7.59 kB
dist/assets/CreateDossierWizardPage-DyPdmXy4.js    36.07 kB │ gzip:   8.09 kB
dist/assets/vendor-icons-DuSvsMct.js               39.82 kB │ gzip:   7.12 kB
dist/assets/vendor-query-pBbQVYqS.js               40.71 kB │ gzip:  12.07 kB
dist/assets/MaterialsPage-CjBvEO5X.js              45.26 kB │ gzip:  11.55 kB
dist/assets/exportUtils-CLOlhqwq.js                47.91 kB │ gzip:  12.80 kB
dist/assets/SystemSettingsPage-_F2se3Vn.js         49.43 kB │ gzip:  11.30 kB
dist/assets/CapitalPage-DgOucMDH.js                80.20 kB │ gzip:  18.68 kB
dist/assets/MembersPage-CUbJBQt-.js               191.43 kB │ gzip:  34.74 kB
dist/assets/vendor-xlsx-DrgRuPKf.js               282.77 kB │ gzip:  95.07 kB
dist/assets/vendor-charts-XCVu6ovb.js             316.11 kB │ gzip:  79.05 kB
dist/assets/vendor-framework-BQr4lFzm.js          367.48 kB │ gzip: 124.60 kB
✓ built in 12.18s
```
*Kết quả*: **EXIT CODE 0 (THÀNH CÔNG)**. TypeScript compilation và Vite bundling hoàn toàn không có lỗi.

2. **Kiểm tra Lint (`npm run lint`)**:
```
> htx-ocop-frontend@1.0.0 lint
> eslint src --max-warnings 0
```
*Kết quả*: **EXIT CODE 0 (THÀNH CÔNG)**. 0 warnings, 0 errors.

---

### 1.3 Hiện Trạng Chi Tiết Từng Trang & Lỗ Hổng (Gaps)

#### A. `FarmPlotsPage.tsx` (`f:\HTX_OCOP_PROJECT\frontend\src\features\agriculture\pages\FarmPlotsPage.tsx`)
- **Quan sát code**:
  - Dòng 31–47: Định nghĩa trạng thái `ACTIVE`, `PREPARING`, `FALLOW`, `INACTIVE`, `UNDER_PUC_REVIEW`, `IN_QUARANTINE`.
  - Dòng 75–84: Dữ liệu mẫu `MOCK_UNITS` đang chứa cây trồng: Cà phê Arabica, Tiêu, Sầu riêng, Bơ; chưa chuẩn hóa cho HTX Tân Tiến & sản phẩm chủ lực Ớt chuông Sweet Palermo Đỏ Đà Lạt.
  - Dòng 720–723: Hiển thị dòng chữ tĩnh: `🛑 Cách ly PHI đến: {p.safe_harvest_date || '15/10/2026'}`.
  - **Lỗ hổng (Gaps)**:
    1. Chưa có đồng hồ đếm ngược trực quan ngày cách ly PHI an toàn (Countdown Timer: ví dụ "Còn 2 ngày 14 giờ an toàn").
    2. Chưa có chỉ báo màu sắc chuẩn quy định: Xanh (Đang canh tác - `ACTIVE`), Đỏ/Cam (Cách ly PHI nhấp nháy + Countdown - `IN_QUARANTINE`), Xám (Nghỉ vụ cải tạo đất - `FALLOW`).
    3. Form thêm thửa đất (`savePlot`, dòng 314–350) thiếu trường tọa độ GPS (`gps_coordinates`), thiếu gợi ý sinh mã thửa theo chuẩn `PLOT-[HTX]-[MaXaVien]-[STT]`.

#### B. `CropSeasonsPage.tsx` (`f:\HTX_OCOP_PROJECT\frontend\src\features\agriculture\pages\CropSeasonsPage.tsx`)
- **Quan sát code**:
  - Đã có timeline progress, biểu đồ Recharts (BarChart diện tích, PieChart cơ cấu), hộp thoại đóng mùa vụ kiểm tra quy tắc `BR-FARM-002`.
  - Dòng 93–102: Mock data sử dụng mùa vụ Cà phê/Tiêu/Bơ.
  - **Lỗ hổng (Gaps)**:
    1. Dữ liệu mẫu cần bổ sung Mùa vụ Ớt chuông Sweet Palermo Đỏ Đà Lạt (HTX Tân Tiến) kèm thông tin phân định liên kết vùng trồng Hòn Bồ / Đạ Sar.
    2. Chi tiết mùa vụ chưa có liên kết nhanh (drill-down) tới danh sách các thửa đất đang bị cách ly PHI trong mùa vụ đó.

#### C. `FarmingLogsPage.tsx` (`f:\HTX_OCOP_PROJECT\frontend\src\features\agriculture\pages\FarmingLogsPage.tsx`) — **Khoảng trống Lớn (Major Gap)**
- **Quan sát code**:
  - Dòng 112–115: Nút `<button>Ghi nhật ký mới (TT02)</button>` **hoàn toàn không có sự kiện `onClick`**!
  - Chỉ có bảng danh sách tĩnh hiển thị dữ liệu nhật ký.
  - Không có file API service riêng (`farmingLogApi.ts`), code đang gọi trực tiếp `apiClient.get('/farming-logs')`.
  - **Lỗ hổng (Gaps)**:
    1. **Hoàn toàn thiếu Màn hình ghi nhận nhật ký nhanh (Quick Mobile Logging)** cho nông dân HTX trên điện thoại/máy tính bảng.
    2. Thiếu các nút bấm to rõ ($\ge 48\text{px}$) hỗ trợ chọn việc 1 chạm: Làm đất (`LAND_PREPARATION`), Bón phân (`FERTILIZATION`), Phun thuốc BVTV (`SPRAYING`), Chăm sóc (`CARE`), Thu hoạch (`HARVEST`).
    3. Thiếu nút "Lấy tọa độ GPS tự động" bằng 1 chạm qua Browser Geolocation API (`navigator.geolocation.getCurrentPosition`).
    4. Thiếu chức năng chụp ảnh / tải ảnh bằng chứng thực tế từ Camera điện thoại (`<input type="file" accept="image/*" capture="environment">`) kèm khung xem trước (preview thumbnail).
    5. Thiếu chức năng chọn nhanh vật tư từ kho (kèm tự động điền SKU và số lô sản xuất `material_batch_number`).
    6. Thiếu tính toán và hiển thị thời gian cách ly PHI tức thời (`safe_harvest_date = activity_date + phi_days`).
    7. Thiếu xử lý chặn bắt lỗi bắt buộc tọa độ GPS khi chọn công việc Phun thuốc BVTV (`ERR_GPS_LOCATION_REQUIRED` theo `BR-FARM-003`).

#### D. `HarvestsPage.tsx` (`f:\HTX_OCOP_PROJECT\frontend\src\features\agriculture\pages\HarvestsPage.tsx`) — **Khoảng trống Lớn (Major Gap)**
- **Quan sát code**:
  - Dòng 202–262: Modal thu hoạch hiện tại rất đơn giản, chỉ có 1 ô nhập sản lượng tổng (`quantity_kg`) và dropdown chọn phân hạng (`quality_grade`).
  - Dòng 248–260: Các thông tin KCS Gate Check và Quick Lab đang được **hardcode dạng chuỗi tĩnh text hiển thị**, không cho phép nhập kiểm nghiệm thực tế!
  - Chưa có nút và modal in tem nhãn có mã QR truy xuất.
  - **Lỗ hổng (Gaps)**:
    1. **Thiếu quy trình KCS 3 cấp đầy đủ**:
       - *Cấp 1 - Gate Check*: Đối soát tự động thời điểm thu hoạch với ngày an toàn PHI của thửa đất. Nếu vi phạm, hiển thị cảnh báo đỏ `ERR_HARVEST_PHI_VIOLATION` và vô hiệu hóa nút xác nhận!
       - *Cấp 2 - Quick Lab*: Nhập kết quả kiểm tra test nhanh dư lượng BVTV (`LAB_PASSED` / `LAB_REJECTED`), mã kit test, chỉ số dư lượng.
       - *Cấp 3 - Grading*: Nhập phân tách rõ ràng sản lượng: Grade A (kg), Grade B (kg), và Reject (kg) kèm tiêu chí độ ngọt Brix ($\ge 7^\circ$) và tỷ lệ đồng đều ($\ge 90\%$).
    2. **Thiếu tính năng In Tem Nhãn Thùng Nông Sản Chuẩn GS1 kèm Mã QR**:
       - Thiếu nút "In tem nhãn QR" trên từng dòng lô hàng thu hoạch.
       - Thiếu mẫu tem nhãn chuẩn đóng gói OCOP (HTX Tân Tiến, Ớt chuông Sweet Palermo Đỏ Đà Lạt, Mã PUC, Mã Lô GS1 `LOT-TT-XV...`, Ngày thu hoạch, Phân hạng Grade A/B).
       - Thiếu bộ sinh mã QR trực quan (SVG/Canvas) trỏ đến link tra cứu công khai `/trace/:lotId`.

#### E. `LotTraceabilityPage.tsx` & Public Traceability Route — **Khoảng trống Nghiêm trọng (Critical Gap)**
- **Quan sát router (`frontend/src/router/AppRoutes.tsx`)**:
  - Tuyến đường truy xuất hiện tại duy nhất là:
    ```tsx
    <Route path="/agriculture/lots/:id/traceability" element={<LotTraceabilityPage />} />
    ```
    được đặt bên trong `<ProtectedRoute>` (bắt buộc phải đăng nhập JWT!).
  - **Hoàn toàn KHÔNG CÓ route công khai `/trace/:lotId` hoặc `/public/trace/:lotId`**!
  - Khi người tiêu dùng quét mã QR trên tem nhãn dán ở siêu thị, hệ thống sẽ chặn và chuyển hướng ép đăng nhập vào `/auth/login`!
  - `LotTraceabilityPage.tsx` hiện tại được thiết kế như một trang quản trị nội bộ HTX (sử dụng `PageHeader` với nút "Quay lại Thu hoạch", tiêu đề admin), không phù hợp làm trang tra cứu công khai cho khách hàng/người tiêu dùng trên thiết bị di động.

---

## 2. Logic Chain (Chuỗi Lập luận Từ Quan sát đến Giải pháp)

1. **Từ Quan sát 1.1 & 1.2**:
   - Dự án đã có sẵn nền tảng React 18, Tailwind 3.4, React Router 6, TanStack Query 5 và Lucide Icons hoạt động hoàn hảo, cả `npm run build` và `npm run lint` đều đạt 100% không lỗi.
   - *Suy ra*: Frontend Worker có thể phát triển các tính năng và component mới ngay trên nền tảng hiện có mà không gặp xung đột phụ thuộc hoặc thư viện bên ngoài.

2. **Từ Quan sát 1.3.C (FarmingLogsPage)**:
   - Nông dân HTX thao tác trên đồng ruộng bằng điện thoại cảm ứng, tay có thể ướt hoặc dính đất; việc nhập form văn bản phức tạp là rào cản lớn.
   - Thông tư 02/2024/TT-BNNPTNT và quy tắc `BR-FARM-003` yêu cầu đủ 10 trường thông tin, đặc biệt hoạt động phun thuốc BVTV bắt buộc phải có tọa độ GPS và ảnh chụp.
   - *Suy ra*: Cần xây dựng màn hình **Quick Mobile Logging** với các thẻ công việc to bản ($\ge 48\text{px}$), nút bấm tự động điền tọa độ GPS qua Geolocation API, input camera chụp ảnh trực tiếp, và dropdown chọn nhanh vật tư để tự động điền SKU + số lô. Khi chọn thuốc BVTV, hệ thống tự động tính ngày hết cách ly PHI và hiển thị thông báo an toàn.

3. **Từ Quan sát 1.3.D (HarvestsPage)**:
   - Nghiệp vụ thu hoạch yêu cầu kiểm soát chất lượng KCS 3 cấp nghiêm ngặt (Gate Check PHI, Quick Lab test, Grading Grade A/B) và chặn tuyệt đối vi phạm PHI (`ERR_HARVEST_PHI_VIOLATION`).
   - Sau khi phân hạng, nông dân/thủ kho cần in tem nhãn có mã QR chuẩn GS1 để dán lên thùng/khay ớt chuông xuất xưởng.
   - *Suy ra*: Modal ghi nhận thu hoạch phải được tái cấu trúc thành quy trình KCS 3 bước rõ ràng (Step 1: Gate Check PHI cảnh báo thời gian thực; Step 2: Test lab; Step 3: Phân loại Grade A/B sản lượng). Đồng thời bổ sung Modal In Tem Nhãn Nông Sản OCOP với mã QR SVG sắc nét, tích hợp lệnh in `window.print()`.

4. **Từ Quan sát 1.3.E (Route Truy xuất Nguồn gốc Công khai)**:
   - Mục R3 của yêu cầu người dùng nhấn mạnh: *Trang tra cứu truy xuất nguồn gốc công khai hoạt động tại route không yêu cầu đăng nhập (`/trace/:lotId` hoặc `/public/trace/:lotId`)*.
   - *Suy ra*: Bắt buộc phải tạo component mới `PublicTraceabilityPage.tsx` độc lập (giao diện tối ưu Mobile cho người tiêu dùng, nhận diện thương hiệu HTX Tân Tiến, Ớt chuông Sweet Palermo, huy hiệu OCOP 4 sao, VietGAP, bản đồ tọa độ GPS, hành trình canh tác 5 chặng, không chứa sidebar/header quản trị) và đăng ký các route `/trace/:lotId`, `/public/trace/:lotId` bên ngoài `ProtectedRoute` trong `AppRoutes.tsx`.

5. **Từ Quan sát 1.3.A (FarmPlotsPage)**:
   - Nông dân cần nhận diện ngay thửa đất nào an toàn để thu hoạch, thửa nào đang cách ly thuốc BVTV và còn bao lâu nữa thì được hái.
   - *Suy ra*: Cần bổ sung component `PlotStatusBadge` hoặc countdown timer tính số ngày/giờ còn lại dựa trên `safe_harvest_date` của thửa đất, kết hợp 3 mã màu nhận diện trực quan: Xanh lá (Đang canh tác), Đỏ/Cam (Cách ly PHI nhấp nháy), Xám (Đang nghỉ vụ).

---

## 3. Caveats (Lưu ý & Giả định)

1. **Môi trường Trình duyệt Ngoại tuyến (Offline / Fallback)**:
   - Trong quá trình phát triển, nếu Backend API chưa chạy hoặc mạng ngắt quãng, tất cả các service mới (`farmingLogApi.ts`, `harvestApi.ts`, `traceabilityApi.ts`) phải tích hợp cơ chế Hybrid Local Fallback (lưu `localStorage`) để giao diện không bị crash hoặc trắng trang.
2. **Quyền truy cập GPS & Camera trên Browser**:
   - `navigator.geolocation` yêu cầu người dùng cấp quyền (Permission). Cần có thông báo hướng dẫn rõ ràng nếu người dùng từ chối quyền vị trí, kèm cơ chế tự điền tọa độ mặc định vùng trồng Hòn Bồ HTX Tân Tiến (`11.9404, 108.4583`).
   - Chụp ảnh camera trên máy tính bàn có thể không có camera sau; thẻ `<input type="file" accept="image/*">` hỗ trợ cả tải file ảnh thường và chụp ảnh trực tiếp trên điện thoại.
3. **Thư viện Mã QR**:
   - `package.json` hiện tại chưa có gói `qrcode.react`. Để tránh phát sinh lỗi cài đặt npm và giữ bundle tinh gọn, khuyến nghị tạo component `QrCodeSvg` dạng SVG ma trận nội suy hoặc sử dụng Data URL canvas/SVG mã hóa trực tiếp, không phụ thuộc vào thư viện bên thứ 3.

---

## 4. Conclusion (Kết luận Đánh giá & Kiến trúc Đề xuất)

Kiến trúc Frontend hiện tại rất vững chắc về mặt kỹ thuật (Build & Lint 100% Pass), nhưng đang tồn tại **4 khoảng trống lớn về mặt nghiệp vụ và trải nghiệm người dùng (Farmer UX)**:
1. Thiếu hoàn toàn Màn hình Ghi nhật ký nhanh (Quick Mobile Logging 1-tap, GPS, Camera, 10 trường TT02).
2. Thiếu Quy trình KCS 3 cấp (Gate Check PHI, Quick Lab test, phân tách sản lượng Grade A / B) và chức năng In tem nhãn dán QR code GS1 trên trang Thu hoạch.
3. Thiếu Trang Tra cứu Nguồn gốc Công khai (`/trace/:lotId`, `/public/trace/:lotId`) không cần đăng nhập.
4. Thiếu Đồng hồ đếm ngược cách ly PHI và trực quan hóa 3 màu trạng thái thửa đất.

---

## 5. Lộ Trình Triển Khai Chi Tiết cho Frontend Worker (Implementation Roadmap)

Frontend Worker sẽ thực hiện theo 6 bước tuần tự, đảm bảo mỗi bước đều có thể build/lint thành công:

```
┌────────────────────────────────────────────────────────────────────────┐
│ BƯỚC 1: Xây dựng Types & Service APIs                                  │
│ - types/agriculture.ts                                                 │
│ - services/farmingLogApi.ts                                            │
│ - services/harvestApi.ts                                               │
│ - services/traceabilityApi.ts                                          │
└───────────────────────────────────┬────────────────────────────────────┘
                                    │
┌───────────────────────────────────▼────────────────────────────────────┐
│ BƯỚC 2: Cải tiến FarmPlotsPage & Plot Status Visual Indicators         │
│ - Đếm ngược thời gian cách ly PHI (Countdown Badge)                    │
│ - 3 màu trạng thái (Xanh: Canh tác, Đỏ/Cam: Cách ly, Xám: Nghỉ)       │
│ - Chuẩn hóa dữ liệu HTX Tân Tiến & Ớt chuông Sweet Palermo             │
└───────────────────────────────────┬────────────────────────────────────┘
                                    │
┌───────────────────────────────────▼────────────────────────────────────┐
│ BƯỚC 3: Xây dựng Quick Mobile Logging trên FarmingLogsPage             │
│ - Nút bấm to rõ >= 48px, chọn việc 1 chạm (5 loại hoạt động)          │
│ - Nút lấy GPS tự động 1 chạm qua navigator.geolocation                 │
│ - Chụp ảnh/chọn ảnh bằng chứng thực tế từ camera                       │
│ - Chọn nhanh vật tư & tự động tính safe_harvest_date PHI               │
│ - Kiểm soát bắt buộc GPS khi phun thuốc (BR-FARM-003)                  │
└───────────────────────────────────┬────────────────────────────────────┘
                                    │
┌───────────────────────────────────▼────────────────────────────────────┐
│ BƯỚC 4: Nâng cấp HarvestsPage với KCS 3 Cấp & In Tem Nhãn QR GS1       │
│ - Modal KCS 3 Cấp: Gate Check (chặn PHI), Quick Lab test, Grade A/B kg │
│ - Modal In Tem Nhãn Nông Sản OCOP với QR Code chuẩn GS1                │
│ - Lệnh in window.print() chuẩn thể thức đóng gói                       │
└───────────────────────────────────┬────────────────────────────────────┘
                                    │
┌───────────────────────────────────▼────────────────────────────────────┐
│ BƯỚC 5: Xây dựng PublicTraceabilityPage & Cấu hình Tuyến đường Public  │
│ - Tạo PublicTraceabilityPage.tsx (Mobile-first, OCOP 4 sao, VietGAP)   │
│ - Cấu hình route /trace/:lotId & /public/trace/:lotId trong AppRoutes  │
│ - Miễn trừ xác thực (Auth-free) cho người tiêu dùng quét mã QR         │
└───────────────────────────────────┬────────────────────────────────────┘
                                    │
┌───────────────────────────────────▼────────────────────────────────────┐
│ BƯỚC 6: Đồng bộ Mùa vụ & Kiểm thử Toàn diện                            │
│ - Cập nhật dữ liệu Sweet Palermo cho CropSeasonsPage                   │
│ - Chạy npm run build & npm run lint xác thực không phát sinh lỗi       │
└────────────────────────────────────────────────────────────────────────┘
```

### Chi tiết Đặc tả Kỹ thuật Từng Thành phần Mới:

#### 1. Định nghĩa Kiểu dữ liệu (`frontend/src/types/agriculture.ts`)
```typescript
export type PlotStatus = 'ACTIVE' | 'IN_QUARANTINE' | 'FALLOW' | 'INACTIVE' | 'PREPARING' | 'UNDER_PUC_REVIEW';

export type ActivityType = 'LAND_PREPARATION' | 'FERTILIZATION' | 'SPRAYING' | 'CARE' | 'HARVEST';

export interface FarmingLogPayload {
  crop_season_id: string;
  plot_id: string;
  activity_type: ActivityType;
  activity_date: string;
  description?: string;
  material_id?: string;
  material_batch_number?: string;
  quantity_applied?: number;
  unit?: string;
  phi_days?: number;
  gps_latitude?: number;
  gps_longitude?: number;
  attachment_reference?: string[];
  performed_by?: string;
}

export interface Kcs3TierPayload {
  crop_season_id: string;
  plot_id: string;
  harvest_date: string;
  quantity: number;
  unit: string;
  grade_a_kg?: number;
  grade_b_kg?: number;
  reject_kg?: number;
  brix_level?: number;
  uniformity_rate?: number;
  kcs_status: 'PENDING_KCS' | 'PASSED' | 'REJECTED';
  kcs_gate_check?: { passed: boolean; phi_checked: boolean; note?: string };
  kcs_quick_lab?: { test_result: 'LAB_PASSED' | 'LAB_REJECTED'; kit_code?: string; residue_ppm?: number };
  grade: 'GRADE_A' | 'GRADE_B' | 'REJECT';
}
```

#### 2. Dịch vụ Nhật ký (`frontend/src/services/farmingLogApi.ts`)
- Cung cấp hàm `fetchFarmingLogs(params)`, `createFarmingLog(payload)`, `getFarmingLog(id)`.
- Tự động lưu cache `localStorage` cho chế độ offline/mock.
- Kiểm tra hợp lệ: nếu `activity_type === 'SPRAYING'` mà không có `gps_latitude`/`gps_longitude` thì ném lỗi thân thiện `Vui lòng bật GPS khi ghi nhận phun thuốc BVTV`.

#### 3. Dịch vụ Thu hoạch & Tem nhãn (`frontend/src/services/harvestApi.ts`)
- Cung cấp hàm `fetchHarvests(params)`, `createHarvest(payload)`.
- Bắt lỗi `ERR_HARVEST_PHI_VIOLATION` và chuyển đổi thành thông điệp tiếng Việt dễ hiểu cho nông dân: `"Thửa đất đang trong thời gian cách ly thuốc BVTV. Lệnh thu hoạch bị chặn hoàn toàn để đảm bảo an toàn thực phẩm."`

#### 4. Component Đếm ngược PHI (`frontend/src/features/agriculture/components/PhiCountdownBadge.tsx`)
- Nhận `safeHarvestDate: string`.
- Tính số ngày, số giờ còn lại:
  - Nếu đã hết cách ly: hiển thị Badge xanh lá `"Đạt an toàn PHI"`.
  - Nếu đang cách ly: hiển thị Badge đỏ/cam nhấp nháy `"🛑 Cách ly PHI: Còn X ngày Y giờ (Đến DD/MM)"`.

#### 5. Component Quick Mobile Logging Modal (`frontend/src/features/agriculture/components/QuickMobileLogModal.tsx`)
- Giao diện thân thiện nông dân:
  - 5 thẻ công việc kích thước lớn $\ge 48\text{px}$ có biểu tượng trực quan.
  - Nút "📍 Lấy tọa độ GPS ngay" (thời gian phản hồi < 1s).
  - Chọn vật tư từ danh mục kho, tự động gán SKU + số lô nhập.
  - Input camera chụp ảnh thực địa và preview thumbnail.
  - Hiển thị ngày an toàn dự kiến ngay dưới ô nhập số ngày cách ly.

#### 6. Component In Tem Nhãn Nông Sản (`frontend/src/features/agriculture/components/HarvestLabelPrintModal.tsx`)
- Kích thước tem tiêu chuẩn $100\text{mm} \times 75\text{mm}$ cho thùng carton / khay ớt chuông.
- Trình bày thông tin:
  - Header: HỢP TÁC XÃ NÔNG NGHIỆP TÂN TIẾN - ĐÀ LẠT
  - Sản phẩm: ỚT CHUÔNG SWEET PALERMO ĐỎ ĐÀ LẠT (OCOP 4 SAO)
  - Mã số vùng trồng: PUC-49-015-9923 (Cục BVTV)
  - Mã Lô GS1: `LOT-TT-[MãThửa]-[YYYYMMDD]-[STT]`
  - Phân loại: Grade A - Thượng hạng (Độ Brix $\ge 7.5^\circ$)
  - Ngày thu hoạch, Hạn sử dụng
  - Mã QR SVG quét dẫn trực tiếp đến `${window.location.origin}/trace/${lot_code}`.

#### 7. Trang Tra cứu Công khai (`frontend/src/features/agriculture/pages/PublicTraceabilityPage.tsx`)
- Không yêu cầu token xác thực, mở tự do cho mọi thiết bị.
- Thiết kế chuẩn Mobile-first, giao diện sạch, sang trọng:
  - Banner HTX Tân Tiến & Giấy chứng nhận VietGAP, OCOP 4 sao.
  - Hình ảnh và mô tả sản phẩm Ớt chuông Sweet Palermo Đỏ Đà Lạt.
  - Mã lô GS1 và mã băm SHA-256 xác thực tính toàn vẹn.
  - Hành trình canh tác 5 bước: Vùng trồng Hòn Bồ $\rightarrow$ Chăm sóc VietGAP $\rightarrow$ Kiểm soát PHI nghiêm ngặt $\rightarrow$ Thu hoạch & Test Lab Pass $\rightarrow$ Phân hạng Grade A & Đóng gói.
  - Danh sách nhật ký canh tác chuẩn 10 trường TT02 có ảnh chụp và tọa độ GPS.
  - Bản đồ định vị GPS thửa đất.

---

## 6. Verification Method (Phương pháp Kiểm chứng Độc lập)

Người nhận bàn giao (Frontend Worker và QA) có thể kiểm chứng độc lập theo các bước sau:

1. **Kiểm tra biên dịch và cú pháp toàn dự án**:
   ```powershell
   cd f:\HTX_OCOP_PROJECT\frontend
   npm run build
   ```
   *Điều kiện đạt*: Lệnh kết thúc với Exit code 0, không có lỗi TypeScript, thư mục `dist/` được sinh đầy đủ.

2. **Kiểm tra tiêu chuẩn mã nguồn (Linting)**:
   ```powershell
   cd f:\HTX_OCOP_PROJECT\frontend
   npm run lint
   ```
   *Điều kiện đạt*: Lệnh kết thúc với Exit code 0, không có warning hoặc error nào phát sinh.

3. **Kiểm tra Route công khai không bị chặn Auth**:
   - Truy cập URL trình duyệt `http://localhost:5173/trace/LOT-TT-01-20261015-01` hoặc `http://localhost:5173/public/trace/LOT-TT-01-20261015-01` khi chưa đăng nhập.
   - *Điều kiện đạt*: Trang Public Traceability hiển thị đầy đủ thông tin sản phẩm và hành trình canh tác mà **không bị chuyển hướng sang `/auth/login`**.

4. **Kiểm tra Quick Mobile Logging**:
   - Truy cập `/agriculture/logs`, bấm nút "Ghi nhật ký mới (TT02)".
   - *Điều kiện đạt*: Modal mở ra với 5 nút bấm to $\ge 48\text{px}$, nút lấy GPS bấm tự động điền kinh độ/vĩ độ, trường ảnh chụp cho phép chọn ảnh preview.

5. **Kiểm tra In tem nhãn QR & Chặn vi phạm PHI**:
   - Truy cập `/agriculture/harvests`, bấm "Ghi Nhận Thu Hoạch". Chọn thửa đất đang bị cách ly với ngày thu hoạch sớm hơn ngày an toàn $\rightarrow$ Hệ thống cảnh báo đỏ và chặn submit.
   - Bấm nút "In Tem Nhãn QR" trên bảng danh sách $\rightarrow$ Modal hiển thị tem nhãn đầy đủ mã QR SVG và nút in.

---
*Báo cáo được lập đầy đủ và khép kín theo Giao thức Handoff 5 Thành phần của Teamwork.*
