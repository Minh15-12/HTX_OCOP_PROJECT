# Báo Cáo Khảo Sát Frontend UX & Kế Hoạch Cải Tiến Trải Nghiệm Nông Dân (Farmer-Centric UX)

> **Dự án:** Số hóa Hồ sơ Đánh giá, Phân hạng OCOP (Quyết định 148/QĐ-TTg) — HTX Tân Tiến  
> **Phân hệ:** Frontend Single Page Application (React + Vite + TypeScript + Tailwind CSS)  
> **Tác giả:** Frontend UX Explorer Agent  
> **Thời điểm khảo sát:** 2026-10-12T07:42:00Z  
> **Trạng thái:** Hoàn tất khảo sát — Đề xuất kiến trúc & Kế hoạch tái cấu trúc  

---

## 1. Observation (Dữ Liệu Quan Sát Trực Tiếp)

### 1.1. Công nghệ & Cấu hình Frontend
- **Thư mục gốc frontend:** `f:\HTX_OCOP_PROJECT\frontend`
- **Tập tin cấu hình phụ thuộc (`frontend/package.json`):**
  - **Framework & Core:** React `^18.2.0`, React DOM `^18.2.0`, Vite `^5.1.6`, TypeScript `^5.2.2`.
  - **Định tuyến & State:** `react-router-dom` `^6.22.3`, `@tanstack/react-query` `^5.28.9`, `axios` `^1.20.0`.
  - **Giao diện & Tiện ích:** `tailwindcss` `^3.4.19`, `clsx` `^2.1.0`, `tailwind-merge` `^2.2.2`, `lucide-react` `^0.359.0`, `recharts` `^3.10.1`, `xlsx` `^0.18.5`, `uuid` `^14.0.2`.
  - **Scripts khai báo:**
    - `"dev": "vite"`
    - `"build": "tsc && vite build"`
    - `"lint": "eslint . --ext ts,tsx --report-unused-disable-directives --max-warnings 0"`
    - `"preview": "vite preview"`

### 1.2. Kết quả kiểm tra Build & Lint
- **Lệnh thực thi 1:** `npm run build` tại `f:\HTX_OCOP_PROJECT\frontend`
  - **Mã thoát (Exit Code):** `0` (Thành công trong 12.59s)
  - **Đầu ra biên dịch:**
    ```text
    > htx-ocop-frontend@1.0.0 build
    > tsc && vite build

    vite v5.4.21 building for production...
    transforming...
    ✓ 2284 modules transformed.
    Circular chunk: vendor-libs -> vendor-react-core -> vendor-libs. Please adjust the manual chunk logic for these chunks.
    rendering chunks...
    computing gzip size...
    dist/index.html                                     1.15 kB │ gzip:   0.58 kB
    dist/assets/index-XQXVfga_.css                     82.51 kB │ gzip:  12.94 kB
    ...
    dist/assets/vendor-libs-D2-fw3qg.js               438.01 kB │ gzip: 149.14 kB
    ✓ built in 12.59s
    ```
  - **Cảnh báo quan sát:** Vite cảnh báo chunk phụ thuộc vòng: `Circular chunk: vendor-libs -> vendor-react-core -> vendor-libs` do cấu hình `manualChunks` tại `frontend/vite.config.ts` (dòng 26-42).
- **Lệnh thực thi 2:** `npm run lint` tại `f:\HTX_OCOP_PROJECT\frontend`
  - **Mã thoát (Exit Code):** `1` (Thất bại)
  - **Lỗi nguyên văn:**
    ```text
    > htx-ocop-frontend@1.0.0 lint
    > eslint . --ext ts,tsx --report-unused-disable-directives --max-warnings 0

    'eslint' is not recognized as an internal or external command,
    operable program or batch file.
    ```
  - **Xác minh môi trường:** Gói `eslint` và các plugin liên quan hoàn toàn không có trong `devDependencies` của `frontend/package.json`; không có tập tin cấu hình `.eslintrc*` hoặc `eslint.config.*` trong thư mục `frontend/`.

### 1.3. Khảo sát các trang & thành phần OCOP hiện hữu

| Đường dẫn tập tin | Loại | Vai trò hiện tại | Dòng mã |
|---|---|---|---|
| `frontend/src/features/ocop/pages/CreateDossierWizardPage.tsx` | Page | Trang Wizard tạo mới hồ sơ OCOP (6 bước) | 732 |
| `frontend/src/features/ocop/pages/CriteriaPage.tsx` | Page | Trang danh mục tra cứu 26 bộ sản phẩm OCOP và cây tiêu chí | 705 |
| `frontend/src/features/ocop/pages/DossiersPage.tsx` | Page | Danh sách hồ sơ OCOP, KPI thống kê, xem chi tiết nhanh | 597 |
| `frontend/src/features/ocop/pages/DossierDetailPage.tsx` | Page | Chi tiết hồ sơ, 6 tabs (Tổng quan, Tự đánh giá, Hội đồng, Minh chứng, Bộ hồ sơ, Workflow) | 749 |
| `frontend/src/features/ocop/pages/EvidencesPage.tsx` | Page | Kho minh chứng số, quản lý phiên bản, kiểm tra mã SHA-256 | 443 |
| `frontend/src/features/ocop/pages/EvaluationsPage.tsx` | Page | Phiên thẩm định hội đồng, blind scoring, tổng hợp điểm | 494 |
| `frontend/src/features/ocop/pages/DecisionsPage.tsx` | Page | Quyết định công nhận phân hạng OCOP và cấp sao | 369 |
| `frontend/src/features/ocop/pages/OcopReportsPage.tsx` | Page | Báo cáo phân tích số liệu OCOP qua các năm | 419 |
| `frontend/src/features/ocop/components/Qd148DocumentModal.tsx` | Component | Modal xem trước và in Biểu số 01, 02, 03, Phiếu chấm, Bảng tổng hợp | 252 |
| `frontend/src/services/ocopService.ts` | Service | API Client và Mock Data cho phân hệ OCOP | 279 |

---

## 2. Logic Chain (Chuỗi Lập Luận & Đánh Giá Chi Tiết)

### 2.1. Đánh giá Trải nghiệm Người dùng Nông dân (Farmer-Centric UX Assessment)

#### A. Wizard Từng Bước Chuẩn Bị Hồ Sơ (`CreateDossierWizardPage.tsx`)
- **Quan sát:**
  - Tập tin khai báo 6 bước: `1. Thông tin chung`, `2. Sản phẩm OCOP`, `3. Hồ sơ minh chứng`, `4. Tiêu chí đánh giá`, `5. Xác nhận hồ sơ`, `6. Gửi đánh giá` (dòng 51-58).
  - Tại Bước 4 (`Tiêu chí đánh giá`, dòng 501-580): Người dùng chỉ thấy 1 bảng tĩnh tóm tắt điểm:
    - *A. Sản phẩm & sức mạnh cộng đồng*: Max 40, Đạt 32.0 (80%)
    - *B. Khả năng tiếp thị*: Max 25, Đạt 25.0 (100%)
    - *C. Chất lượng sản phẩm*: Max 25, Đạt 25.0 (100%)
    - *Tổng cộng hoàn thành*: Max 100, Đạt 82.0 (82.0%)
- **Lập luận:**
  1. Tổng điểm của 3 nhóm trong bảng hiển thị là $40 + 25 + 25 = 90$ điểm, nhưng dòng tổng cộng lại ghi Max 100 và đạt 82.0 điểm. Điều này sai lệch so với Quyết định 148/QĐ-TTg (Phần A: 40 điểm, Phần B: 25 điểm, Phần C: 35 điểm; Tổng: 100 điểm).
  2. Nông dân không có bất kỳ nút hay giao diện nào để tự chấm điểm trên từng tiêu chí ở Bước 4. Nông dân bị buộc phải bấm "Tiếp tục" qua một bảng dữ liệu giả định cố định (82 điểm).
  3. Tại Bước 3 (`Hồ sơ minh chứng`, dòng 388-498), chỉ có một bảng HTML tĩnh hiển thị 5 dòng giả định (dòng 428-480). Không có nút chọn tệp từ bộ nhớ thiết bị, không có chức năng kéo thả và không hỗ trợ camera trên điện thoại/máy tính bảng.

#### B. Thẻ Chọn Mức Điểm To Bản (Card-Based Point Selection)
- **Quan sát:**
  - Tại `DossierDetailPage.tsx` (Tab `self_eval`, dòng 388-398):
    ```tsx
    <select
      value={criteriaScores[c.code] ?? c.selfScore}
      onChange={(e) => setCriteriaScores({ ...criteriaScores, [c.code]: Number(e.target.value) })}
      className="px-2.5 py-1 bg-white border border-slate-300 rounded-lg text-xs font-bold text-emerald-900 focus:ring-2 focus:ring-emerald-500 focus:outline-none shadow-xs"
    >
      <option value={5}>5,0</option>
      <option value={4.5}>4,5</option>
      <option value={4.0}>4,0</option>
      <option value={3.5}>3,5</option>
    </select>
    ```
- **Lập luận:**
  1. Thao tác chấm điểm phụ thuộc hoàn toàn vào thẻ `<select>` kích thước rất nhỏ (`text-xs`, padding 2.5px x 1px), đặt lọt thỏm trong hàng bảng máy tính.
  2. Nông dân và xã viên HTX thao tác trên thiết bị di động/máy tính bảng có kích thước ngón tay lớn sẽ rất khó chạm chính xác (vi phạm tiêu chuẩn cảm ứng tối thiểu 44-48px).
  3. Hoàn toàn thiếu vắng giao diện dạng **Thẻ chọn điểm to bản (Card-based Radio Option)** kèm giải thích rõ tiêu chuẩn đạt được tương ứng với từng mốc điểm (ví dụ: *Thẻ [10 điểm]: Có chứng nhận VietGAP còn hạn trên toàn bộ diện tích*; *Thẻ [7 điểm]: VietGAP trên 70% diện tích*; *Thẻ [0 điểm]: Chưa có chứng nhận*).

#### C. Đơn Giản Hóa Thuật Ngữ & Chú Thích Dành Cho HTX
- **Quan sát:**
  - Tại `CriteriaPage.tsx` và `DossierDetailPage.tsx`, các tiêu chí sử dụng ngôn từ hành chính hàn lâm: *"Chất lượng cảm quan & Phiếu kiểm nghiệm ISO/IEC 17025"*, *"Sensory Cup Score >= 80"*, *"Chỉ tiêu an toàn vi sinh & dư lượng thuốc BVTV"*, *"Bao bì dược phẩm chống ẩm, chống tia UV chuyên dụng"*.
- **Lập luận:**
  1. Không có phần "Giải thích bằng ngôn ngữ nhà nông" hoặc gợi ý trực quan (tooltip / accordion diễn giải ngắn).
  2. Nông dân không nắm được tài liệu thực tế của HTX Tân Tiến (như sổ nhật ký cách ly thuốc bảo vệ thực vật PHI, hợp đồng bán rau cho WinMart, giấy chứng nhận VietGAP do Chi cục Trồng trọt cấp) tương ứng chính xác với tiêu chí nào.

#### D. Chỉ Báo Trạng Thái Trực Quan 3 Màu (Xanh - Vàng - Đỏ)
- **Quan sát:**
  - `DossierDetailPage.tsx` chỉ có các nhãn trạng thái tổng quát ở đầu trang (`pill-blue`, `pill-amber`).
  - Trong bảng chi tiết từng tiêu chí (dòng 375-402), không hề có biểu tượng hoặc màu sắc phân loại trạng thái hoàn thiện của tiêu chí.
- **Lập luận:**
  1. Chưa hiện thực hóa yêu cầu R4:
     - 🟢 **Xanh lá (Đã hoàn thành):** Đã tự chấm điểm và đã có tệp minh chứng hợp lệ liên kết.
     - 🟡 **Vàng cam (Cần bổ sung):** Đã chọn điểm nhưng chưa có minh chứng hoặc thiếu căn cứ giải trình.
     - 🔴 **Đỏ (Chưa đạt / Thiếu minh chứng bắt buộc):** Tiêu chí có dấu sao (*) bắt buộc nhưng đạt 0 điểm hoặc chưa có tài liệu.
  2. Nông dân không có cái nhìn tổng quan tức thì để biết mình cần làm thêm những gì trước khi bấm nộp hồ sơ.

#### E. Đo Lường & Hiển Thị Tỷ Lệ Hoàn Thiện Hồ Sơ Thời Gian Thực (% Hoàn Thành)
- **Quan sát:**
  - `DossiersPage.tsx` hiển thị trường `d.progressPercent` lấy trực tiếp từ mock data tĩnh (`85%`, `100%`).
  - `CreateDossierWizardPage.tsx` hiển thị thanh tiến trình 6 bước, nhưng tỷ lệ % hoàn thiện nội dung hồ sơ không được tính toán dựa trên số lượng trường đã nhập hoặc số tiêu chí đã hoàn tất.
  - `DossierDetailPage.tsx` có đồng hồ tròn hiển thị `dossier.progressPercent` cố định (dòng 173-183).
- **Lập luận:**
  1. Không có hàm tính toán phản ứng tức thời (reactive calculation) dựa trên công thức quy định tại tài liệu kiến trúc:
     $$\text{Tỷ lệ hoàn thành (\%)} = \left(\frac{\text{Số tiêu chí đã tự chấm}}{\text{Tổng số tiêu chí}} \times 50\%\right) + \left(\frac{\text{Số minh chứng hợp lệ}}{\text{Tổng minh chứng yêu cầu}} \times 50\%\right)$$
  2. Khi người dùng thay đổi điểm hoặc thêm bớt minh chứng, tỷ lệ % không tự động nhảy cập nhật trên giao diện.

#### F. Nút Gợi Ý Điểm Thông Minh (Smart Suggestion Buttons)
- **Quan sát:**
  - Tìm kiếm toàn bộ `frontend/src` từ khóa `suggest`, `smart`, `gợi ý`: Hoàn toàn không có component hay hàm xử lý gợi ý điểm tự động nào.
  - Trong `CreateDossierWizardPage.tsx` (dòng 401-406), có một nút bấm mang nhãn `<RefreshCw /> Tự động đồng bộ VietGAP`, nhưng không có thuộc tính `onClick`, không gắn logic phân tích dữ liệu nào.
- **Lập luận:**
  1. Hệ thống chưa hoàn thiện vai trò "Trợ lý thông minh cho nông dân" theo Requirement R2.
  2. HTX Tân Tiến đã có sẵn cơ sở dữ liệu vùng trồng (25.5 ha ớt chuông Sweet Palermo tại Lâm Hà), sản lượng thu mua, xã viên, chứng nhận VietGAP, nhật ký PHI; tuy nhiên giao diện Frontend chưa có nút "Áp dụng gợi ý từ hệ thống" (kèm giải thích căn cứ: *"Hệ thống kiểm tra HTX có 25.5ha đạt chuẩn VietGAP -> Gợi ý: Điểm tối đa 10đ"*).

---

### 2.2. Đánh giá Xem Trước & In Ấn Biểu Mẫu 01, 02, 03 (`Qd148DocumentModal.tsx`)

#### A. So sánh Cấu trúc Nội dung với Văn bản Quy chuẩn (QĐ 148 & Tài liệu Docs)

| Biểu mẫu | Quy định văn bản quy chuẩn (`docs/`) | Hiện trạng trong `Qd148DocumentModal.tsx` | Đánh giá mức độ đáp ứng |
|---|---|---|---|
| **Biểu số 01** *(Phiếu đăng ký)* | - Quốc hiệu, tiêu ngữ, ngày tháng<br>- Tên đơn vị, người đại diện, chức vụ, MST, địa chỉ, SĐT, Email<br>- Tên sản phẩm, ngành/nhóm/phân nhóm (Phụ lục I)<br>- Lần đăng ký (Lần đầu / Nâng hạng / Đánh giá lại)<br>- Mức sao đăng ký<br>- Tài liệu kèm theo & Cam đoan pháp lý<br>- Chữ ký đại diện HTX<br>- Phần tiếp nhận cấp huyện & cấp tỉnh | - Có tiêu ngữ, quốc hiệu cơ bản<br>- Có hiển thị tên đơn vị, sản phẩm, phân nhóm<br>- Người đại diện bị hardcode cố định "Nguyễn Văn Tân - Giám đốc HTX"<br>- Thiếu phần tiếp nhận theo chuẩn của cấp huyện/tỉnh | **Đạt 60%** (Cần động hóa 100% dữ liệu HTX Tân Tiến, bổ sung bảng tiếp nhận chuẩn) |
| **Biểu số 02** *(Báo cáo tự đánh giá)* | - **Phần I:** Thông tin chung chủ thể & sản phẩm (người đại diện, giấy ĐKKD, công bố tiêu chuẩn, sở hữu trí tuệ, cơ cấu tổ chức)<br>- **Phần II:** Kết quả thực hiện phương án sản xuất kinh doanh (vùng nguyên liệu, công nghệ, chất lượng, thị trường, doanh thu, lợi nhuận)<br>- **Phần III:** Đánh giá kết quả thực hiện theo Bộ tiêu chí OCOP (bảng chi tiết 100 điểm, minh chứng phụ lục)<br>- **Phần IV:** Kế hoạch sản xuất kinh doanh tương lai<br>- Chữ ký đại diện pháp luật | - Chỉ có vài dòng chữ tóm tắt: "I. Thông tin chung... II. Kết quả tự chấm điểm... Phần A: 36.0, Phần B: 21.5, Phần C: 31.0"<br>- **Hoàn toàn thiếu:** Toàn bộ Phần II, bảng chi tiết 100 điểm của Phần III và kế hoạch tương lai của Phần IV | **Đạt 20%** (Thiếu nghiêm trọng nội dung cốt lõi của Báo cáo tự đánh giá OCOP) |
| **Biểu số 03** *(Xác nhận UBND Xã)* | - Cơ quan ban hành: UBND Xã Tân Tiến, Huyện Đức Trọng, Tỉnh Lâm Đồng<br>- Tiêu ngữ, số hiệu công văn, trích yếu<br>- **Phần I:** Thông tin chung về hồ sơ đăng ký<br>- **Phần II:** Đánh giá 4 nội dung thực tế:<br>  1. Sử dụng nguyên liệu địa phương<br>  2. Sử dụng lao động địa phương<br>  3. Nguồn gốc ý tưởng sản phẩm<br>  4. Bản sắc/trí tuệ địa phương<br>- Đề nghị UBND cấp huyện đánh giá phân hạng<br>- Ký tên, đóng dấu Chủ tịch UBND xã | - Có 3 gạch đầu dòng ngắn tóm tắt nội dung<br>- Thiếu thể thức văn bản hành chính nhà nước chuẩn (số hiệu, nơi nhận, căn cứ pháp lý, phần xác nhận đề nghị gửi cấp huyện) | **Đạt 40%** (Cần chuẩn hóa theo đúng khuôn dạng văn bản hành chính Phụ lục II) |

#### B. Cơ chế In Ấn & Kết Xuất (Print / Export Layout)
- **Quan sát:**
  - `Qd148DocumentModal.tsx` sử dụng nút `<button onClick={handlePrint}>` gọi trực tiếp `window.print()` (dòng 16-18, 38-42).
  - Tệp `frontend/src/index.css` hoàn toàn không có đoạn mã CSS `@media print` cho modal in này.
- **Lập luận:**
  1. Khi người dùng bấm "In / PDF", trình duyệt in toàn bộ màn hình bao gồm cả thanh điều hướng ứng dụng, thanh cuộn, nút bấm đóng modal, nền làm mờ `backdrop-blur` và các tab của modal.
  2. Bố cục tài liệu in bị gãy trang (page break), không căn chuẩn lề A4 (Top 20mm, Bottom 20mm, Left 30mm, Right 15mm theo Nghị định 30/2020/NĐ-CP về thể thức văn bản hành chính).
  3. Để in chuẩn, hệ thống cần áp dụng cơ chế mở cửa sổ in chuyên dụng hoặc inject stylesheet `@media print` ẩn toàn bộ app shell, chỉ in nội dung khung trang văn bản A4 màu trắng chữ đen nét mực chuẩn như đã làm rất tốt tại `frontend/src/utils/voucherDocumentGenerator.ts`.

---

## 3. Caveats (Khu Vực Chưa Khảo Sát & Giả Định)

- **Khu vực không can thiệp:** Bộ mã nguồn Backend PHP/Laravel (`backend/`) không thuộc phạm vi phân tích chi tiết của Frontend Explorer (sẽ được khảo sát bởi Backend Explorer).
- **Giả định dữ liệu API:** Khảo sát này giả định rằng Backend đã hoặc đang chuẩn bị cung cấp đầy đủ các API hợp đồng RESTful theo đặc tả Section 29, 30, 31 trong `docs/12_API_SPECIFICATION.md` (`/ocop/criteria-versions/{versionId}/groups`, `/ocop/applications/{id}/self-assessments`, `/ocop/applications/{applicationId}/evidences`).
- **Phạm vi quyền hạn:** Explorer là vai trò **Read-Only**, tuyệt đối không chỉnh sửa mã nguồn ứng dụng trong quá trình điều tra.

---

## 4. Conclusion (Kết Luận Toàn Diện & Kế Hoạch Tái Cấu Trúc)

### 4.1. Đánh giá Tổng Thể Hiện Trạng
- **Điểm mạnh:**
  - Giao diện hiện tại rất đẹp về mặt thẩm mỹ, hiện đại, màu sắc chủ đạo xanh nông nghiệp (`emerald-700`, `cop-600`), bố cục 2 cột khoa học.
  - Đã có đầy đủ các trang khung (`DossiersPage`, `DossierDetailPage`, `CreateDossierWizardPage`, `EvidencesPage`, `CriteriaPage`).
  - Lệnh `npm run build` chạy thành công, không bị lỗi cú pháp TypeScript trong mã nguồn trang hiện tại.
- **Khoảng trống nghiêm trọng (Gaps) cần giải quyết:**
  1. **Lỗi Lint:** `npm run lint` bị sập hoàn toàn do thiếu gói `eslint` và tệp cấu hình `.eslintrc`.
  2. **Trải nghiệm Nông dân chưa đạt chuẩn:**
     - Thiếu giao diện chọn điểm dạng Thẻ to bản (Card Buttons) trên mobile/tablet.
     - Thiếu tính năng "Gợi ý điểm thông minh" (Smart Suggestion) từ dữ liệu sản xuất HTX.
     - Thiếu chỉ báo trạng thái 3 màu (Xanh / Vàng / Đỏ) trên từng tiêu chí.
     - Bước 4 trong Wizard tạo hồ sơ mới là bảng tĩnh, không cho phép tự chấm điểm.
  3. **Biểu mẫu QĐ 148 sơ sài & In ấn chưa chuẩn:**
     - Biểu 01, 02, 03 thiếu nội dung cốt lõi theo quy định.
     - In ấn `window.print()` bị dính giao diện modal web, chưa có print stylesheet A4 chuẩn thể thức văn bản hành chính.

---

### 4.2. Đề Xuất Cấu Trúc Thành Phần Frontend Mới (Proposed Component Architecture)

Nhằm đáp ứng trọn vẹn Requirement R4 và Acceptance Criteria, cấu trúc thư mục `frontend/src/features/ocop` cần được bổ sung và mô-đun hóa như sau:

```text
frontend/src/features/ocop/
├── components/
│   ├── Qd148DocumentModal.tsx           # Modal chứa bộ preview & in ấn Biểu 01, 02, 03
│   ├── print/
│   │   ├── BieuMau01Document.tsx        # Khung văn bản A4 chuẩn Biểu mẫu 01 (Phiếu đăng ký)
│   │   ├── BieuMau02Document.tsx        # Khung văn bản A4 chuẩn Biểu mẫu 02 (Báo cáo tự đánh giá 100đ)
│   │   └── BieuMau03Document.tsx        # Khung văn bản A4 chuẩn Biểu mẫu 03 (UBND Xã xác nhận)
│   ├── farmer/
│   │   ├── FarmerCriterionCard.tsx      # Thẻ chấm điểm to bản, chạm ngón tay dễ dàng cho nông dân
│   │   ├── SmartSuggestionBadge.tsx     # Nút gợi ý điểm thông minh & lý giải căn cứ từ dữ liệu HTX
│   │   ├── CriterionStatusBadge.tsx     # Chỉ báo 3 màu: Xanh (Xong), Vàng (Thiếu tt), Đỏ (Thiếu MC)
│   │   ├── RealtimeProgressBar.tsx      # Thanh tiến độ đo lường % hoàn thiện thực tế & dự báo sao
│   │   └── MandatoryWarningAlert.tsx    # Cảnh báo vi phạm điều kiện khống chế hạ sao (*)
│   └── evidence/
│       ├── EvidenceUploadModal.tsx      # Tải lên minh chứng (hỗ trợ kéo thả, camera điện thoại)
│       └── EvidenceIntegrityTag.tsx     # Thẻ hiển thị mã băm SHA-256 & trạng thái toàn vẹn
├── pages/
│   ├── CreateDossierWizardPage.tsx      # Tái cấu trúc: Cho phép tự chấm điểm tương tác tại Step 3 & 4
│   ├── DossierDetailPage.tsx            # Tái cấu trúc: Tab tự chấm điểm dùng thẻ to bản, gợi ý thông minh
│   ├── CriteriaPage.tsx                 # Bổ sung chú thích ngôn ngữ mộc mạc cho nông dân
│   ├── DossiersPage.tsx                 # Hiển thị % tiến độ tính toán động
│   └── EvidencesPage.tsx                # Tích hợp tải lên, camera và xác thực SHA-256
└── utils/
    ├── ocopScoringCalculator.ts         # Tính tổng điểm, xếp hạng sao, kiểm tra điều kiện cứng (*), tính % tiến độ
    ├── ocopPrintHelper.ts               # Kích hoạt in ấn trang A4 độc lập chuẩn Nghị định 30/2020
    └── sha256Helper.ts                  # Tính toán mã băm SHA-256 trực tiếp trên trình duyệt
```

---

### 4.3. Kế Hoạch Tái Cấu Trúc Chi Tiết (Refactoring Plan)

#### Giai đoạn 1: Sửa chữa Hạ tầng Cấu hình & Lệnh Lint (Priority: Critical)
1. Cài đặt các devDependencies phục vụ lint: `eslint`, `@typescript-eslint/parser`, `@typescript-eslint/eslint-plugin`, `eslint-plugin-react-hooks`, `eslint-plugin-react-refresh`.
2. Tạo tệp cấu hình `.eslintrc.cjs` hoặc `eslint.config.js` chuẩn cho React 18 + TypeScript + Vite.
3. Điều chỉnh `frontend/vite.config.ts` để gỡ bỏ cảnh báo chunk phụ thuộc vòng giữa `vendor-libs` và `vendor-react-core`.
4. Xác minh: Chạy `npm run lint` và `npm run build` đều đạt Exit Code `0`.

#### Giai đoạn 2: Xây dựng Module Tiện ích Tính Điểm & In Ấn
1. Tạo `frontend/src/features/ocop/utils/ocopScoringCalculator.ts`:
   - Hàm `calculateTotalScore(scores)`: Tổng Phần A (max 40) + Phần B (max 25) + Phần C (max 35) = 100 điểm.
   - Hàm `predictStarRating(totalScore, mandatoryConditions)`: Phân hạng 3 sao (50-69đ), 4 sao (70-89đ), 5 sao ($\geq 90đ$), tự động hạ sao nếu tiêu chí khống chế (*) chưa đạt.
   - Hàm `calculateCompletionProgress(scoredCount, totalCount, validEvidenceCount, requiredEvidenceCount)`: Trả về % hoàn thành thời gian thực ($0 - 100\%$).
2. Tạo `frontend/src/features/ocop/utils/ocopPrintHelper.ts`:
   - Mở cửa sổ in iframe/popup mới với toàn bộ CSS chuẩn A4, hỗ trợ in ra giấy hoặc lưu thành tệp PDF sắc nét, không bị dính thanh điều hướng website.

#### Giai đoạn 3: Phát triển Bộ Component Farmer-Centric UX
1. `FarmerCriterionCard.tsx`:
   - Thiết kế các nút chọn điểm dạng Card lớn (kích thước nút $\geq 48\text{px}$), viền bo tròn lớn, màu sắc tương phản cao.
   - Hiển thị mô tả mộc mạc dễ hiểu (ví dụ: *"Ớt chuông thu hoạch từ vùng trồng HTX Tân Tiến"* thay vì các thuật ngữ hàn lâm khó hiểu).
2. `SmartSuggestionBadge.tsx`:
   - Nút bấm *"Trợ lý HTX gợi ý [X điểm]"* với biểu tượng lấp lánh (Sparkles).
   - Khi bấm, tự động điền mức điểm đề xuất và hiển thị lý do căn cứ (ví dụ: *"HTX đã có chứng nhận VietGAP số... còn hạn đến 2028"*).
3. `CriterionStatusBadge.tsx`:
   - Hiển thị huy hiệu 3 màu trực quan (Xanh: Hoàn tất / Vàng: Cần bổ sung / Đỏ: Thiếu minh chứng bắt buộc).

#### Giai đoạn 4: Tái cấu trúc Wizard Tạo Hồ Sơ & Trang Chi Tiết
1. `CreateDossierWizardPage.tsx`:
   - Đưa cây tiêu chí 100 điểm của sản phẩm Ớt chuông Sweet Palermo vào quy trình Wizard.
   - Nông dân có thể tự chọn điểm và bấm gợi ý thông minh ngay trong các bước lập hồ sơ.
   - Cung cấp ô tải lên ảnh/PDF trực quan có hỗ trợ chụp ảnh từ camera thiết bị.
2. `DossierDetailPage.tsx`:
   - Tích hợp `FarmerCriterionCard`, thanh đo tiến độ thời gian thực `%`, đồng hồ tính sao động và danh mục minh chứng liên kết chặt chẽ.

#### Giai đoạn 5: Chuẩn hóa Toàn diện Biểu mẫu 01, 02, 03
1. Xây dựng các mẫu văn bản `BieuMau01Document.tsx`, `BieuMau02Document.tsx`, `BieuMau03Document.tsx` theo chuẩn văn bản hành chính Việt Nam và nội dung đầy đủ từ `docs/Bieu mẫu 1...`, `docs/Bieu mẫu 2.docx`, `docs/BIEU SO 03...`.
2. Tích hợp tính năng xem trước và in PDF sắc nét, khổ A4 chuẩn từng trang trong `Qd148DocumentModal.tsx`.

---

## 5. Verification Method (Phương Pháp Xác Minh Độc Lập)

Người thực hiện hoặc agent tiếp theo có thể xác minh độc lập báo cáo này thông qua các bước sau:

1. **Kiểm tra bản build Frontend:**
   ```powershell
   cd f:\HTX_OCOP_PROJECT\frontend
   npm run build
   ```
   *Kết quả kỳ vọng:* Exit code 0, Vite build hoàn tất. Kiểm tra cảnh báo circular chunk trong output.
2. **Kiểm tra lệnh lint Frontend:**
   ```powershell
   cd f:\HTX_OCOP_PROJECT\frontend
   npm run lint
   ```
   *Kết quả kỳ vọng:* Lệnh trả về Exit code 1 với lỗi `'eslint' is not recognized as an internal or external command`.
3. **Kiểm tra tệp Wizard Tạo Hồ Sơ:**
   - Mở tệp `frontend/src/features/ocop/pages/CreateDossierWizardPage.tsx`.
   - Xem dòng 501-580: Xác minh Bước 4 chỉ là bảng tĩnh 3 dòng, không có tương tác chấm điểm và tổng điểm con là 40 + 25 + 25 = 90 nhưng hiển thị Max 100 và Đạt 82.0.
4. **Kiểm tra tệp Chi Tiết Hồ Sơ:**
   - Mở tệp `frontend/src/features/ocop/pages/DossierDetailPage.tsx`.
   - Xem dòng 388-398: Xác minh điểm tự đánh giá đang dùng thẻ `<select>` kích thước nhỏ, không có Thẻ chọn điểm to bản và không có nút gợi ý điểm thông minh.
5. **Kiểm tra Modal Biểu Mẫu:**
   - Mở tệp `frontend/src/features/ocop/components/Qd148DocumentModal.tsx`.
   - Xem dòng 142-170 (Biểu 02) và dòng 172-198 (Biểu 03): Xác minh nội dung chỉ là các gạch đầu dòng vắn tắt, thiếu toàn bộ Phần II, III, IV quy chuẩn của QĐ 148; dòng 16-18 gọi `window.print()` mà không có print stylesheet riêng.
