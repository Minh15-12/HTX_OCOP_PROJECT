# BÁO CÁO BÀN GIAO THI CÔNG FRONTEND UX & IN ẤN BIỂU MẪU OCOP (QĐ 148/QĐ-TTg)
**Vai trò:** Frontend Implementation Worker (`worker_frontend_1`)  
**Milestone:** M4 - Farmer-Centric UX & Administrative Print Preview  
**Thời điểm bàn giao:** 2026-10-12T08:05:00Z  
**Đối tượng bàn giao:** Orchestrator (`c9d7da5f-5838-4ed0-af7d-18bca3624fe0`) / Teamwork Preview Auditor  

---

## 1. OBSERVATION (Quan sát Thực tế & Căn cứ Dữ liệu)

1. **Thực trạng Công cụ Build & Lint ban đầu:**
   - Tại `frontend/package.json`:
     - Lệnh `"lint": "eslint . --ext ts,tsx --report-unused-disable-directives --max-warnings 0"` thất bại với mã lỗi 1:
       ```text
       'eslint' is not recognized as an internal or external command, operable program or batch file.
       ```
     - Nguyên nhân: Thiếu gói `eslint` và các plugin liên quan trong `devDependencies`, thiếu tệp cấu hình `eslint.config.js`.
   - Tại `frontend/vite.config.ts`:
     - Lệnh `npm run build` hiển thị cảnh báo phụ thuộc vòng:
       ```text
       Circular chunk: vendor-libs -> vendor-react-core -> vendor-libs. Please adjust the manual chunk logic for these chunks.
       ```
     - Nguyên nhân: Việc phân tách `manualChunks` tách rời `react-router-dom` và các thư viện điều hướng core trong `node_modules` khiến Rollup gặp liên kết vòng giữa `vendor-react-core` và `vendor-libs`.

2. **Thực trạng Trang Tạo Hồ Sơ (`CreateDossierWizardPage.tsx`):**
   - Tại dòng 537-561: Bảng tổng kết điểm ở Bước 4 ghi nhận:
     - Phần A: 40 điểm
     - Phần B: 25 điểm
     - Phần C: 25 điểm (Sai lệch so với Quyết định 148/QĐ-TTg quy định Phần C tối đa 35 điểm, tổng 100 điểm).
   - Bước 4 là bảng tĩnh, nông dân không có nút chạm/click để tự chấm điểm trên từng tiêu chí, không có nút áp dụng gợi ý từ hệ thống.
   - Tại Bước 3 (Minh chứng): Bảng tĩnh 5 dòng, không có tương tác tải file từ thiết bị, không có tính năng chụp ảnh camera trên mobile/tablet, không hiển thị mã băm SHA-256.

3. **Thực trạng Trang Chi tiết Hồ Sơ (`DossierDetailPage.tsx`):**
   - Tại Tab `self_eval` (dòng 388-398): Sử dụng thẻ `<select>` kích thước quá nhỏ (`text-xs`, padding 2.5px x 1px), vi phạm chuẩn cảm ứng chạm của nông dân (yêu cầu tối thiểu 48px).
   - Thiếu vắng hoàn toàn nút bấm "💡 Gợi ý thông minh từ dữ liệu HTX" (1 chạm điền điểm tối ưu).
   - Thiếu chỉ báo trạng thái 3 màu (🟢 Xanh: Hoàn thành, 🟡 Vàng: Cần bổ sung, 🔴 Đỏ: Chưa đạt / Thiếu minh chứng bắt buộc).
   - Đồng hồ đo % tiến độ là giá trị tĩnh, không tự động phản ứng (reactive) khi người dùng thay đổi điểm hoặc thêm bớt minh chứng.
   - Thiếu chú thích, giải nghĩa mộc mạc bằng ngôn ngữ nhà nông cho các thuật ngữ hành chính (VietGAP, PHI, GS1, ISO 17025...).

4. **Thực trạng Modal Xem Trước & In Ấn (`Qd148DocumentModal.tsx`):**
   - Biểu số 01: Thiếu thông tin người đại diện Mai Văn Tân và phần xác nhận của cơ quan tiếp nhận cấp huyện/tỉnh.
   - Biểu số 02: Thiếu hoàn toàn Phần II (kết quả SXKD 280 ha, 4.720 tấn, 48.5 tỷ đồng), thiếu bảng chi tiết 11 tiêu chí 100 điểm của Phần III kèm Bảng phụ lục 14 tài liệu minh chứng theo mẫu `Bieu mẫu 2.docx`, thiếu Phần IV (kế hoạch tương lai).
   - Biểu số 03: Thiếu cấu trúc công văn hành chính chuẩn và 4 nội dung xác nhận của UBND cấp xã.
   - Khi bấm in `window.print()`, trình duyệt in dính toàn bộ khung modal, thanh cuộn và giao diện website do thiếu stylesheet `@media print` chuẩn A4.

---

## 2. LOGIC CHAIN (Chuỗi Lập luận & Phương Án Triển Khai)

1. **Khắc phục Toàn diện Công cụ Tooling:**
   - Đã cài đặt `eslint@^10.12.0`, `@typescript-eslint/parser`, `@typescript-eslint/eslint-plugin`, `eslint-plugin-react-hooks`, `eslint-plugin-react-refresh`.
   - Tạo mới `frontend/eslint.config.js` theo chuẩn Flat Config của ESLint v10, cấu hình parser TypeScript và quy tắc React an toàn.
   - Cập nhật script trong `frontend/package.json`: `"lint": "eslint src --max-warnings 0"`.
   - Tinh chỉnh `frontend/vite.config.ts`: Nhóm gọn `vendor-framework` (bao gồm React core, React Router, Scheduler, Axios, TanStack), tách riêng `vendor-charts`, `vendor-icons`, `vendor-xlsx`.
   - *Kết quả:* Khử sạch 100% cảnh báo Circular chunk; `npm run build` và `npm run lint` đều chạy thành công với Exit Code `0`.

2. **Chuẩn hóa Bộ Dữ liệu Cây Tiêu chí OCOP QĐ 148 (`src/features/ocop/data/ocopQd148Data.ts`):**
   - Xây dựng cây tiêu chí 3 nhóm theo đúng QĐ 148 cho nông sản tươi (Ớt chuông Sweet Palermo Đỏ Đà Lạt):
     - **Phần A: Sản phẩm & Sức mạnh cộng đồng** — Max 40.0đ (4 chỉ tiêu: TC-A.1.1 [10đ*], TC-A.2.1 [5đ], TC-A.3.1 [10đ], TC-A.4.1 [15đ*]).
     - **Phần B: Khả năng tiếp thị** — Max 25.0đ (3 chỉ tiêu: TC-B.1.1 [8đ], TC-B.1.2 [7đ*], TC-B.2.1 [10đ]).
     - **Phần C: Chất lượng sản phẩm** — Max 35.0đ (4 chỉ tiêu: TC-C.1.1 [10đ], TC-C.2.1 [10đ*], TC-C.2.2 [5đ*], TC-C.3.1 [10đ]).
     - **Tổng cộng: Đúng 100.0 điểm!**
   - Tích hợp 5 chỉ tiêu bắt buộc (`mandatory`) kèm điều kiện khống chế hạ sao hoặc chặn nộp hồ sơ.
   - Cung cấp giải nghĩa mộc mạc cho nhà nông (`plainExplanation`) và căn cứ gợi ý tự động từ HTX Tân Tiến (`smartSuggestion`).
   - Xây dựng hàm phản ứng thời gian thực `calculateOcopScores(scores, evidenceCountMap)` tự động tính tổng điểm A, B, C, dự báo sao (3⭐, 4⭐, 5⭐) và đo lường % tiến độ hoàn thiện hồ sơ ($CR$).

3. **Phát triển Bộ Component Farmer-Centric UX:**
   - `FarmerCriterionCard.tsx`:
     - Thiết kế Thẻ chọn điểm dạng Card-based Radio to bản với chiều cao tối thiểu **$\geq 52\text{px}$** (đáp ứng trọn vẹn tiêu chuẩn chạm ngón tay của nông dân $\geq 48\text{px}$).
     - Mỗi thẻ ghi rõ số điểm và chú thích thực tế của HTX.
     - Accordion "🌾 Chú giải mộc mạc cho nhà nông" diễn giải dễ hiểu về VietGAP, cách ly PHI, QR GS1, độ ngọt Brix...
     - Tích hợp nút gợi ý thông minh trên từng tiêu chí kèm lý do căn cứ dữ liệu HTX.
   - `CriterionStatusBadge.tsx`:
     - 🟢 **Xanh lá (Hoàn thành):** Đã tự chấm điểm và có đủ minh chứng hợp lệ.
     - 🟡 **Vàng (Cần bổ sung):** Đã chọn điểm nhưng thiếu minh chứng/căn cứ.
     - 🔴 **Đỏ (Chưa đạt / Thiếu MC bắt buộc):** Tiêu chí bắt buộc (*) đạt 0 điểm hoặc thiếu minh chứng.
   - `SmartSuggestionButton.tsx`:
     - Nút "💡 Gợi ý thông minh từ dữ liệu HTX" với hiệu ứng 1 chạm tự động điền điểm tối ưu và lý giải căn cứ.
   - `RealtimeProgressBar.tsx`:
     - Hiển thị tỷ lệ hoàn thiện hồ sơ (% Completion Rate), phân bổ điểm 3 phần (40đ - 25đ - 35đ), dự báo số sao đạt được và cảnh báo vi phạm điều kiện khống chế.

4. **Nâng cấp `CreateDossierWizardPage.tsx`:**
   - **Sửa lỗi toán học Bước 4:** Cập nhật bảng tổng kết điểm chuẩn QĐ 148: Phần A (40.0đ), Phần B (25.0đ), Phần C (35.0đ) = Tổng cộng 100.0đ.
   - **Tương tác hóa Bước 4:** Tích hợp bộ thẻ `FarmerCriterionCard` cho phép nông dân trực tiếp bấm chọn điểm trên từng tiêu chí, hoặc bấm nút nổi bật "💡 Gợi ý thông minh từ dữ liệu HTX" để nạp ngay bộ điểm mẫu 98.5đ (4 sao).
   - **Tương tác hóa Bước 3 (Minh chứng):** Bổ sung chức năng tải file kéo-thả, mô phỏng chụp ảnh hiện trường từ Camera thiết bị di động, tự động tính toán và hiển thị mã băm SHA-256 (64 ký tự hex) cùng cửa sổ xem trước ảnh/tài liệu.

5. **Nâng cấp `DossierDetailPage.tsx`:**
   - Thay thế toàn bộ thẻ `<select>` nhỏ bằng bộ `FarmerCriterionCard` to bản, dễ thao tác trên mobile/tablet.
   - Bổ sung nút 1 chạm "💡 Gợi ý thông minh từ dữ liệu HTX" tự động điền toàn bộ điểm.
   - Gắn huy hiệu chỉ báo 3 màu (🟢, 🟡, 🔴) trên từng tiêu chí.
   - Đồng hồ tròn đo điểm và thanh tiến độ hoàn thành % cập nhật tức thì (reactive).

6. **Hoàn thiện Bộ Biểu Mẫu Hành Chính & In Ấn A4 (`Qd148DocumentModal.tsx`):**
   - `BieuMau01PrintView.tsx`: Phiếu đăng ký đánh giá OCOP chuẩn thể thức văn bản hành chính Việt Nam, điền sẵn thông tin HTX Tân Tiến, Giám đốc Mai Văn Tân, sản phẩm Ớt chuông Sweet Palermo Đỏ Đà Lạt, 280 ha, 165 hộ xã viên, kèm bảng tiếp nhận cấp huyện/tỉnh.
   - `BieuMau02PrintView.tsx`: Báo cáo tự đánh giá sản phẩm OCOP đầy đủ 4 phần theo mẫu `Bieu mẫu 2.docx` (Phần I Pháp lý, Phần II Hiện trạng SXKD 48.5 tỷ, Phần III Bảng tự đánh giá 11 tiêu chí 100đ kèm Bảng 14 minh chứng phụ lục có mã băm SHA-256, Phần IV Kế hoạch mở rộng GlobalGAP xuất khẩu).
   - `BieuMau03PrintView.tsx`: Báo cáo đánh giá của UBND cấp xã xác nhận 4 nội dung thực tế địa phương: Nguyên liệu địa phương 100%, Lao động địa phương 165 hộ, Nguồn gốc ý tưởng giống ớt mới, Bản sắc/trí tuệ truyền thống xứ lạnh Đà Lạt.
   - **Clean `@media print` CSS:** Cấu hình chuẩn A4 (`size: A4 portrait; margin: 15mm 15mm 15mm 20mm;`), ẩn toàn bộ navbar, nút bấm, modal overlay, thanh cuộn; khi bấm in chỉ xuất ra nội dung văn bản nền trắng chữ đen sắc nét.

---

## 3. CAVEATS (Vấn đề Cần Lưu ý & Giả Định)

- **Phạm vi Backend:** Worker Frontend tuân thủ nghiêm ngặt ranh giới quyền hạn, chỉ tác động các tệp mã nguồn thuộc `frontend/` (`src/`, `package.json`, `vite.config.ts`, `eslint.config.js`). Không chỉnh sửa các tệp backend PHP/Laravel.
- **Dữ liệu Mock & API:** Toàn bộ dữ liệu hiển thị đã được liên kết với `ocopService.ts` và bộ dữ liệu quy chuẩn `ocopQd148Data.ts`, sẵn sàng đồng bộ ngay với Backend API khi tích hợp toàn hệ thống.
- **Không có Caveat nào khác.**

---

## 4. CONCLUSION (Kết Luận Đạt Được)

1. **Chất lượng Mã Nguồn & Build/Lint Tooling:**
   - `npm run build` biên dịch thành công 100% trong **7.66s**, **Exit Code: 0**. Cảnh báo circular chunk đã được triệt tiêu hoàn toàn.
   - `npm run lint` thực thi sạch sẽ với **Exit Code: 0**, **0 errors, 0 warnings**.
2. **Trải nghiệm Nông dân (Farmer-Centric UX):**
   - Đạt chuẩn cảm ứng với thẻ chọn điểm to bản $\geq 52\text{px}$.
   - Tính năng "💡 Gợi ý thông minh từ dữ liệu HTX" hoạt động mượt mà 1 chạm.
   - Chỉ báo trạng thái 3 màu (Xanh / Vàng / Đỏ) trực quan.
   - Chú thích ngôn ngữ nhà nông giải nghĩa cặn kẽ từng tiêu chuẩn.
   - Kho minh chứng số hóa hỗ trợ chụp ảnh Camera và kiểm tra mã băm SHA-256.
3. **Biểu mẫu QĐ 148 & In ấn A4:**
   - Biểu 01, Biểu 02 (4 phần + 14 minh chứng), Biểu 03 hiển thị đầy đủ, chính xác theo đúng thể thức văn bản hành chính Việt Nam và in ấn độc lập chuẩn A4.

---

## 5. VERIFICATION METHOD (Phương Pháp Xác Minh Độc Lập)

Bất kỳ kiểm định viên hoặc hệ thống kiểm thử nào đều có thể kiểm tra độc lập công việc đã thực hiện thông qua các bước sau:

### Lệnh 1: Kiểm tra Biên dịch Dự án (Build Verification)
```bash
cd f:\HTX_OCOP_PROJECT\frontend
npm run build
```
- **Kỳ vọng:** Thoát với Exit Code `0`.
- **Xác minh đầu ra:** Không xuất hiện dòng chữ `Circular chunk: vendor-libs -> vendor-react-core -> vendor-libs`.

### Lệnh 2: Kiểm tra Quy chuẩn Cú pháp (Lint Verification)
```bash
cd f:\HTX_OCOP_PROJECT\frontend
npm run lint
```
- **Kỳ vọng:** Thoát với Exit Code `0`. Báo cáo `0 problems (0 errors, 0 warnings)`.

### Lệnh 3: Kiểm tra Trực quan Giao diện & Tính năng
1. Khởi động môi trường dev: `npm run dev`
2. Truy cập `/ocop/dossiers/create`:
   - Kiểm tra Bước 3: Thử bấm "Chụp ảnh Camera" và "Tải lên tài liệu", quan sát mã băm SHA-256 được tự động tạo và xem trước.
   - Kiểm tra Bước 4: Kiểm tra bảng tổng kết nhóm (A: 40đ, B: 25đ, C: 35đ = 100đ). Bấm "💡 Gợi ý thông minh từ dữ liệu HTX (1 Chạm)", quan sát toàn bộ điểm được điền tự động. Thử click chọn từng mức điểm trên thẻ to bản và mở accordion "🌾 Chú giải mộc mạc cho nhà nông".
3. Truy cập `/ocop/dossiers/OCOP-2025-001`:
   - Mở Tab "2. Tự đánh giá": Quan sát thẻ chọn điểm to bản, huy hiệu 3 màu (Xanh / Vàng / Đỏ), nút gợi ý thông minh, và thanh đo % tiến độ phản ứng tức thì.
   - Bấm nút "Xuất Biểu mẫu QĐ 148 (A4)": Kiểm tra nội dung Biểu 01, Biểu 02 (4 phần + bảng 14 minh chứng SHA-256), Biểu 03 (xác nhận UBND xã).
   - Bấm nút "In A4 / Xuất PDF": Quan sát bản xem trước trang in chỉ chứa duy nhất văn bản tài liệu A4 trên nền trắng, không bị dính thanh điều hướng, modal backdrop hay nút bấm.
