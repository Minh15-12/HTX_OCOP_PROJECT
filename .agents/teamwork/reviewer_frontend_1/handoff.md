# BÁO CÁO THẨM ĐỊNH ĐỘC LẬP & PHẢN BIỆN ADVERSARIAL REVIEW: FRONTEND MILESTONE M4
**Người thẩm định:** Frontend Reviewer & Critic (`reviewer_frontend_1`)  
**Milestone:** M4 - Farmer-Centric UX & Administrative Print Preview (QĐ 148/QĐ-TTg)  
**Thời điểm thẩm định:** 2026-10-12T08:16:30Z  
**Đối tượng nhận báo cáo:** Orchestrator (`c9d7da5f-5838-4ed0-af7d-18bca3624fe0`)  
**Phán quyết cuối cùng (Verdict):** **APPROVE**  

---

## 1. OBSERVATION (Quan sát & Căn cứ Dữ liệu Trực tiếp)

1. **Kiểm tra độc lập Công cụ Build & Lint tại thư mục `frontend/`:**
   - Thực thi lệnh:
     ```bash
     cd f:\HTX_OCOP_PROJECT\frontend
     npm run build
     ```
     - Kết quả thực tế: Biên dịch thành công với **Exit Code 0** trong **8.63s**.
     - Số lượng module xử lý: `✓ 2292 modules transformed`.
     - Phân bổ bundles Rollup:
       - `dist/assets/vendor-framework-BQr4lFzm.js` (367.48 kB)
       - `dist/assets/vendor-charts-XCVu6ovb.js` (316.11 kB)
       - `dist/assets/vendor-xlsx-DrgRuPKf.js` (282.77 kB)
       - `dist/assets/vendor-query-pBbQVYqS.js` (40.71 kB)
       - `dist/assets/vendor-icons-DuSvsMct.js` (39.82 kB)
       - `dist/assets/CreateDossierWizardPage-DyPdmXy4.js` (36.07 kB)
       - `dist/assets/DossierDetailPage-C3-uCdp_.js` (32.44 kB)
     - Tuyệt đối không xuất hiện cảnh báo vòng liên kết: `Circular chunk: vendor-libs -> vendor-react-core -> vendor-libs`.
   - Thực thi lệnh:
     ```bash
     cd f:\HTX_OCOP_PROJECT\frontend
     npm run lint
     ```
     - Kết quả thực tế: Chạy script `eslint src --max-warnings 0`, thoát với **Exit Code 0**; không có lỗi (`0 errors`) và không có cảnh báo (`0 warnings`).

2. **Cấu hình Tooling (`package.json`, `vite.config.ts`, `eslint.config.js`):**
   - Tại `frontend/package.json`: Lệnh `"lint": "eslint src --max-warnings 0"` đã được cấu hình chuẩn xác với các thư viện devDependencies: `eslint@^10.12.0`, `@typescript-eslint/parser@^8.71.1`, `@typescript-eslint/eslint-plugin@^8.71.1`, `eslint-plugin-react-hooks@^7.1.1`, `eslint-plugin-react-refresh@^0.5.7`.
   - Tại `frontend/vite.config.ts` (dòng 26-43): Hàm `manualChunks(id)` nhóm các thư viện bên thứ ba rõ ràng theo module mục đích, giải quyết triệt để vấn đề phụ thuộc vòng của Rollup.
   - Tại `frontend/eslint.config.js`: Định dạng Flat Config của ESLint v10 bao gồm quy tắc an toàn cho TypeScript và hooks của React.

3. **Toán học & Tiêu chí QĐ 148 trong `CreateDossierWizardPage.tsx` và `ocopQd148Data.ts`:**
   - Tại `ocopQd148Data.ts`:
     - Nhóm A (Sản phẩm & Sức mạnh cộng đồng): 4 chỉ tiêu (TC-A.1.1 [10đ*], TC-A.2.1 [5đ], TC-A.3.1 [10đ], TC-A.4.1 [15đ*]) = **40.0 điểm tối đa**.
     - Nhóm B (Khả năng tiếp thị): 3 chỉ tiêu (TC-B.1.1 [8đ], TC-B.1.2 [7đ*], TC-B.2.1 [10đ]) = **25.0 điểm tối đa**.
     - Nhóm C (Chất lượng sản phẩm): 4 chỉ tiêu (TC-C.1.1 [10đ], TC-C.2.1 [10đ*], TC-C.2.2 [5đ*], TC-C.3.1 [10đ]) = **35.0 điểm tối đa**.
     - Tổng cộng: **40.0 + 25.0 + 35.0 = 100.0 điểm**.
     - 5 chỉ tiêu bắt buộc (`isMandatory: true`) được gắn cờ rõ ràng kèm lý do khống chế pháp lý.
   - Tại `CreateDossierWizardPage.tsx` (dòng 762-825): Bảng tổng kết Bước 4 hiển thị chính xác bảng phân bổ: Phần A: 40.0đ, Phần B: 25.0đ, Phần C: 35.0đ, Tổng cộng hoàn thành (QĐ 148): 100.0đ. Lỗi toán học cũ (40+25+25=90) đã được khắc phục hoàn toàn.
   - Tại `CreateDossierWizardPage.tsx` (dòng 744-751): Nút `💡 Gợi ý thông minh từ dữ liệu HTX (1 Chạm)` kích hoạt hàm `handleApplyAllSmartSuggestions` nạp ngay bộ điểm mẫu 98.5đ kèm thông báo phản hồi người dùng trực quan.
   - Tại Bước 3 (dòng 475-585, 653-708): Tích hợp tính năng tải file kéo-thả, chế độ "Chụp ảnh Camera" mô phỏng hiện trường, thuật toán tạo mã băm SHA-256 (64 hex ký tự), và Modal xem trước minh chứng chi tiết.

4. **Trải nghiệm Nông dân (Farmer-Centric UX) trong `DossierDetailPage.tsx`:**
   - Thẻ điểm cảm ứng `FarmerCriterionCard.tsx` (dòng 146-186): Chiều cao nút bấm được cấu hình `min-h-[52px]` với padding `p-3`, viền bo góc `rounded-xl`, kích thước radio circle to bản `w-5 h-5` (20px), vượt mức tiêu chuẩn tối thiểu $\geq 48\text{px}$.
   - Chú thích ngôn ngữ nhà nông (dòng 98-131): Khung Accordion "🌾 Chú giải mộc mạc cho nhà nông" giải thích dễ hiểu các thuật ngữ chuyên môn (VietGAP, cách ly PHI, QR GS1, độ ngọt Brix), kèm lời khuyên và ví dụ chứng từ của HTX.
   - Huy hiệu trạng thái 3 màu (`CriterionStatusBadge.tsx`):
     - 🟢 **Xanh lá (Hoàn thành):** Đã chấm điểm và có đủ minh chứng số hóa.
     - 🟡 **Vàng (Cần bổ sung):** Đã chọn điểm nhưng thiếu chứng từ.
     - 🔴 **Đỏ (Chưa đạt / Thiếu MC bắt buộc):** Tiêu chí bắt buộc (*) đạt 0 điểm hoặc thiếu minh chứng (hiển thị hiệu ứng viền đỏ và cảnh báo).
   - Tiến độ phản ứng tức thời (`RealtimeProgressBar.tsx`): Thanh tiến độ tự động tính toán $CR = 50\% \times \text{Tỷ lệ chấm điểm} + 50\% \times \text{Tỷ lệ minh chứng}$, phân bổ điểm 3 phần (40-25-35), và dự báo hạng sao (3⭐, 4⭐, 5⭐) kèm cảnh báo điều kiện khống chế.

5. **Bộ Biểu mẫu Hành chính & In ấn Chuẩn A4 (`Qd148DocumentModal.tsx`):**
   - Tại `Qd148DocumentModal.tsx` (dòng 32-67): Stylesheet `@media print` được cấu hình cô lập hoàn toàn:
     - Ẩn toàn bộ giao diện website bằng `body * { visibility: hidden !important; }`.
     - Chỉ hiển thị vùng tài liệu: `#print-document-container, #print-document-container * { visibility: visible !important; }`.
     - Đặt vùng in `position: absolute; left: 0; top: 0; width: 100%;`.
     - Cấu hình khổ giấy `@page { size: A4 portrait; margin: 15mm 15mm 15mm 20mm; }` tuân thủ thể thức văn bản hành chính Việt Nam (Nghị định 30/2020/NĐ-CP).
   - `BieuMau01PrintView.tsx`: Phiếu đăng ký đánh giá OCOP đầy đủ 7 mục theo mẫu quy chuẩn, thông tin HTX Tân Tiến, Giám đốc Mai Văn Tân, sản phẩm Ớt Sweet Palermo Đỏ Đà Lạt, phần xác nhận của cơ quan tiếp nhận huyện/tỉnh.
   - `BieuMau02PrintView.tsx`: Báo cáo tự đánh giá đầy đủ 4 phần:
     - Phần I: Thông tin chung về chủ thể và sản phẩm.
     - Phần II: Kết quả SXKD (280 ha, 4.720 tấn, doanh thu 48.5 tỷ đồng, 165 hộ xã viên).
     - Phần III: Bảng tự đánh giá 11 tiêu chí 100 điểm theo QĐ 148 và Phụ lục Bảng 14 tài liệu minh chứng số hóa kèm mã băm SHA-256.
     - Phần IV: Kế hoạch mở rộng GlobalGAP và xuất khẩu hướng tới 5 sao OCOP.
   - `BieuMau03PrintView.tsx`: Báo cáo đánh giá của UBND cấp xã xác nhận chi tiết 4 nội dung thực tế (nguyên liệu địa phương 100%, lao động tại chỗ 165 hộ, ý tưởng sản phẩm, bản sắc trí tuệ địa phương "Rau Đà Lạt") kèm con dấu và chữ ký Chủ tịch UBND Phường 12.

---

## 2. LOGIC CHAIN (Chuỗi Lập Luận Thẩm Định & Đánh Giá)

1. **Khắc phục triệt để Tooling:**
   - *Căn cứ quan sát 1 & 2:* Lệnh `npm run build` và `npm run lint` đều kết thúc với mã thoát 0. Các gói devDependencies và tệp cấu hình `eslint.config.js` đã được thiết lập đúng chuẩn. Cảnh báo Circular chunk của Rollup được giải quyết triệt để nhờ chia nhóm `manualChunks` hợp lý.
   - *Suy luận:* Hệ thống frontend đã đạt tính ổn định cao về mặt build pipeline, sẵn sàng cho việc đóng gói sản xuất (production deployment).

2. **Tính Toàn Vẹn Toán Học & Tuân Thủ Quyết Định 148/QĐ-TTg:**
   - *Căn cứ quan sát 3:* Cây tiêu chí trong `ocopQd148Data.ts` có tổng điểm tối đa chính xác là $40.0 + 25.0 + 35.0 = 100.0$ điểm. Cả trang tạo hồ sơ (`CreateDossierWizardPage`) và trang chi tiết (`DossierDetailPage`), cũng như Biểu mẫu 02 (`BieuMau02PrintView`) đều thống nhất tuyệt đối về cấu trúc phân bổ điểm này.
   - *Suy luận:* Lỗi sai lệch toán học 90 điểm trước đây đã được khắc phục hoàn toàn. Cấu trúc thang điểm phản ánh trung thực quy chuẩn Nhà nước đối với nhóm nông sản tươi.

3. **Tính Độc Lập & Khách Quan (Kiểm tra Tính Toàn Vẹn - Integrity Audit):**
   - *Kiểm tra gian lận/Hardcoded test hooks:* Đã rà soát hàm `calculateOcopScores`. Hàm này tính toán động (dynamically computed) dựa trên mảng `ALL_INDICATORS` và đối tượng `scores` được người dùng click chọn từ giao diện.
   - Khi thay đổi điểm hoặc bỏ chọn tiêu chí bắt buộc (ví dụ VietGAP TC-C.2.1 về 0đ), hàm lập tức phát hiện vi phạm điều kiện khống chế, tự động hạ xếp hạng từ 4 sao xuống 3 sao và kích hoạt huy hiệu đỏ (RED).
   - *Suy luận:* Không có dấu hiệu của dummy facade hay hardcoded test scores. Logic tự chấm điểm có tính phản ứng thực chất (real reactivity).

4. **Trải Nghiệm Thân Thiện Với Người Nông Dân (Farmer-Centric UX):**
   - *Căn cứ quan sát 4:* Thẻ radio `FarmerCriterionCard` đạt kích thước chạm $52\text{px} \geq 48\text{px}$, đáp ứng tiêu chuẩn WCAG và thực tế bàn tay lao động của nông dân trên thiết bị di động/máy tính bảng.
   - Tính năng "🌾 Chú giải mộc mạc" giải tỏa rào cản thuật ngữ hành chính khó hiểu.
   - Nút "💡 Gợi ý thông minh" và huy hiệu 3 màu giúp nông dân dễ dàng theo dõi tình trạng hồ sơ mà không cần chuyên gia tư vấn túc trực.

5. **Độ Chuẩn Xác Của Thể Thức In Ấn Biểu Mẫu:**
   - *Căn cứ quan sát 5:* Cả 3 biểu mẫu cốt lõi (Biểu 01, Biểu 02, Biểu 03) đều đầy đủ nội dung theo mẫu văn bản trong hồ sơ pháp lý (`Bieu mẫu 1`, `Bieu mẫu 2`, `BIEU SO 03`).
   - Cấu hình `@media print` cách ly khung tài liệu, triệt tiêu toàn bộ các thành phần giao diện web (header, sidebar, backdrop), mang lại bản in sạch sẽ, trang trọng trên khổ giấy A4 tiêu chuẩn.

---

## 3. ADVERSARIAL CHALLENGES & STRESS TESTING (Kiểm Thử Đối Kháng)

1. **Thử thách 1: Khả năng duy trì dữ liệu khi F5/Tải lại trang (State Volatility Challenge)**
   - *Giả định bị chất vấn:* Dữ liệu chấm điểm trong Wizard ở Bước 4 được lưu giữ trong React Component state (`useState`). Nếu người nông dân vô tình bấm tải lại trang (F5) khi đang ở Bước 4, dữ liệu chấm điểm chưa gửi sẽ quay về trạng thái mặc định.
   - *Đánh giá rủi ro:* **Mức độ Thấp - Trung bình** (trong phạm vi frontend mock/draft wizard). Đối với trang `DossierDetailPage`, dữ liệu hồ sơ đã được lưu trữ trong danh sách đối tượng `MOCK_OCOP_DOSSIERS_FULL`.
   - *Biện pháp đề xuất cho Milestone M5:* Khi tích hợp toàn diện với Backend Laravel, bổ sung cơ chế tự động lưu nháp (`auto-save draft`) vào `localStorage` hoặc gọi API `POST /api/v1/ocop/applications/{id}/self-evaluations` mỗi khi người dùng thay đổi điểm để tránh mất mát dữ liệu ngoài ý muốn.

2. **Thử thách 2: Cơ chế sinh mã băm SHA-256 ở môi trường Mock (Cryptographic Simulation)**
   - *Giả định bị chất vấn:* Tại `CreateDossierWizardPage.tsx` dòng 186-192, hàm `handleSimulateUpload` tạo chuỗi 64 ký tự hex ngẫu nhiên phục vụ mô phỏng giao diện minh chứng phía client.
   - *Đánh giá rủi ro:* **Mức độ Thấp** (đây là tính năng mô phỏng UI phía client). Ở phía Backend, Service tại Milestone M3 thực hiện băm SHA-256 thật trên luồng nhị phân của tệp (`hash_file('sha256', ...)`).
   - *Biện pháp đề xuất cho tương lai:* Khi tích hợp upload file nhị phân thật từ trình duyệt, có thể kết hợp Web Crypto API (`window.crypto.subtle.digest('SHA-256', fileBuffer)`) để đối soát mã băm giữa trình duyệt và máy chủ trước khi lưu vào cơ sở dữ liệu.

3. **Thử thách 3: Ngắt trang in tự động trên tài liệu dài (Print Pagination Edge Case)**
   - *Giả định bị chất vấn:* Biểu số 02 có độ dài lớn (gồm 4 phần, bảng 11 tiêu chí và bảng phụ lục 14 minh chứng). Trên một số trình duyệt có kích thước viewport khác nhau, các dòng bảng (`<tr>`) có thể bị cắt ngang mép trang giấy nếu người dùng in nhiều trang.
   - *Biện pháp hoàn thiện:* Đã kiểm tra cấu trúc bảng font chữ 10.5-11px tinh gọn. Trong tương lai có thể bổ sung thuộc tính CSS `tr { break-inside: avoid; page-break-inside: avoid; }` để tối ưu hóa tuyệt đối ngắt trang.

---

## 4. CAVEATS (Phạm Vi Giới Hạn Thẩm Định)

1. **Phạm vi thẩm định:** Reviewer tập trung thẩm định toàn diện các tệp mã nguồn và công cụ thuộc `frontend/` theo yêu cầu nhiệm vụ của Milestone M4. Không can thiệp hoặc chỉnh sửa mã nguồn backend PHP/Laravel.
2. **Môi trường in ấn:** Thẩm định CSS `@media print` được xác thực qua cú pháp stylesheet chuẩn và cấu trúc DOM của container `#print-document-container`. Việc hiển thị thực tế trên máy in vật lý phụ thuộc vào thiết lập lề in của trình điều khiển máy in của người dùng.

---

## 5. CONCLUSION (Kết Luận Thẩm Định)

- **Chất lượng Tooling:** Xuất sắc. `npm run build` và `npm run lint` chạy trơn tru với Exit Code 0, không còn cảnh báo circular chunks.
- **Tính Chính Xác Tiêu Chí & Toán Học:** Hoàn hảo. Thang điểm 100 (40đ - 25đ - 35đ) đúng QĐ 148, điều kiện khống chế hoạt động chính xác.
- **Trải Nghiệm Nông Dân (UX):** Đáp ứng trọn vẹn tiêu chuẩn cảm ứng $\geq 48\text{px}$ (thực tế $52\text{px}$), ngôn ngữ bình dân gần gũi, gợi ý thông minh 1 chạm, chỉ báo 3 màu trực quan.
- **Biểu Mẫu & In Ấn A4:** Đầy đủ Biểu 01, 02, 03 theo thể thức văn bản hành chính Việt Nam, hỗ trợ in A4 sạch đẹp, chuyên nghiệp.
- **Tính Liêm Chính (Integrity):** Đạt 100%. Không có mã giả, không có hardcoded kết quả kiểm thử.

**PHÁN QUYẾT CUỐI CÙNG:** **`APPROVE`** (Chấp thuận nghiệm thu Milestone M4 để chuyển tiếp sang Milestone M5).

---

## 6. VERIFICATION METHOD (Phương Pháp Tái Xác Minh Độc Lập)

Bất kỳ kiểm định viên nào cũng có thể kiểm chứng lại kết quả thẩm định này bằng các bước sau:

```bash
# 1. Xác minh Biên dịch Frontend
cd f:\HTX_OCOP_PROJECT\frontend
npm run build
# Kỳ vọng: Exit Code 0, built < 10s, không xuất hiện cảnh báo "Circular chunk"

# 2. Xác minh Quy chuẩn Mã nguồn (Lint)
npm run lint
# Kỳ vọng: Exit Code 0, 0 problems (0 errors, 0 warnings)
```

**Xác minh giao diện trực quan:**
1. Mở trình duyệt tại đường dẫn `/ocop/dossiers/new`:
   - Đến Bước 3: Thử bấm "Chụp ảnh Camera" & "Tải lên tài liệu", quan sát mã băm SHA-256 và xem trước modal.
   - Đến Bước 4: Kiểm tra bảng tổng kết (A: 40đ, B: 25đ, C: 35đ = 100đ). Bấm "💡 Gợi ý thông minh từ dữ liệu HTX (1 Chạm)", quan sát điểm tự điền 98.5đ. Kiểm tra thẻ radio to bản $\geq 52\text{px}$ và accordion chú giải nhà nông.
2. Mở đường dẫn `/ocop/dossiers/OCOP-2025-001`:
   - Mở Tab "2. Tự đánh giá": Kiểm tra thanh tiến độ reactive và huy hiệu 3 màu (Xanh / Vàng / Đỏ).
   - Bấm nút "Xuất Biểu mẫu QĐ 148 (A4)" -> Bấm "In A4 / Xuất PDF": Kiểm tra bản xem trước in chỉ hiển thị tài liệu hành chính A4, ẩn hoàn toàn navbar và khung modal web.
