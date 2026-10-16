# BÁO CÁO NGHIÊN CỨU & ĐẶC TẢ QUY CHUẨN SỐ HÓA HỒ SƠ OCOP (QĐ 148/QĐ-TTg)
**Dự án:** Hệ thống Quản trị Hợp tác xã Nông nghiệp & Số hóa Hồ sơ Phân hạng OCOP  
**Sản phẩm áp dụng:** Ớt chuông Sweet Palermo Đỏ Đà Lạt — HTX Dịch vụ Nông nghiệp Tổng hợp Tân Tiến  
**Đơn vị thực hiện:** Specification Miner (spec_miner_docs_1)  
**Thời gian hoàn thành:** 2026-10-12T07:45:00Z  

---

## 1. OBSERVATION (Quan sát Thực tế & Căn cứ Dữ liệu)

Từ việc rà soát và đối chiếu toàn bộ tài liệu pháp lý, quy chuẩn kỹ thuật và mã nguồn hiện có trong kho dự án:

1. **Văn bản pháp lý & Tài liệu kiến trúc OCOP:**
   - `docs/34_OCOP_WORKFLOW.md` (dòng 11–37, 85–92): Xác định rõ căn cứ pháp lý là **Quyết định số 148/QĐ-TTg ngày 24/02/2023 của Thủ tướng Chính phủ**. Bộ tiêu chí đánh giá phân hạng OCOP có thang điểm chuẩn **100 điểm**, phân bổ thành 3 phần:
     - **Phần A**: Sản phẩm và sức mạnh cộng đồng — **40 điểm**.
     - **Phần B**: Khả năng tiếp thị — **25 điểm**.
     - **Phần C**: Chất lượng sản phẩm — **35 điểm**.
     - Ngưỡng phân hạng sao: 3 sao (50–69 điểm), 4 sao (70–89 điểm), 5 sao ($\geq 90$ điểm). Giấy chứng nhận có hiệu lực trong **36 tháng**.
   - `docs/Bao_Cao_Nghien_Cuu_Thiet_Ke_He_Thong_OCOP_148.md` (dòng 5–61, 244–258) và `docs/BÁO CÁO NGHIÊN CỨU TOÀN DIỆN...docx` (Bảng 6): Định nghĩa cụ thể bộ 11 tiêu chí chuyên biệt dành riêng cho nông sản tươi sống — **Ớt chuông Sweet Palermo Đỏ Đà Lạt của HTX Tân Tiến**, tổng điểm tự chấm 100đ, Hội đồng chấm mẫu đạt **78,5 điểm (4 sao)**.
   - `docs/KE_HOACH_CHI_TIET_OCOP.md` (dòng 219–260): Cung cấp bộ khung tổng quát 18 tiêu chí theo 7 nhóm chỉ tiêu chuẩn của QĐ 148 Phụ lục III.

2. **Khảo sát Biểu mẫu gốc (Docx Files):**
   - `docs/Bieu mẫu 1 mau-phieu-dk-danh-gia-phan-han-sp-OCOP.docx`: Biểu số 01 — Phiếu đăng ký đánh giá, phân hạng sản phẩm OCOP (gồm thông tin chủ thể, người đại diện, sản phẩm, phân nhóm, lần đăng ký, số lượng mẫu gửi kèm, phần tiếp nhận cấp huyện/tỉnh).
   - `docs/Bieu mẫu 2.docx`: Biểu số 02 — Báo cáo tự đánh giá về sản phẩm OCOP (gồm Phần I: Thông tin chung & giấy tờ pháp lý; Phần II: Kết quả thực hiện phương án SXKD; Phần III: Đánh giá theo bộ tiêu chí kèm bảng danh mục 14 loại minh chứng; Phần IV: Kế hoạch tương lai).
   - `docs/BIEU SO 03-PHU LUC II-QD-148-QD-TTg.docx`: Biểu số 03 — Báo cáo đánh giá của UBND cấp xã (gồm xác nhận 4 nội dung thực tế địa phương: Nguyên liệu địa phương, Lao động địa phương, Nguồn gốc ý tưởng sản phẩm, Bản sắc/trí tuệ địa phương).

3. **Cơ sở dữ liệu Backend hiện tại:**
   - Bảng cơ sở dữ liệu đã có sẵn trong migrations `2026_01_01_000039` đến `000046`, `000054` đến `000056`:
     - `criteria_versions` (id, version_code, name, status, source_reference)
     - `criteria_groups` (id, criteria_version_id, code, name, display_order)
     - `criteria` (id, criteria_group_id, code, name, max_score, mandatory, display_order)
     - `indicators` (id, criterion_id, code, name, max_score, mandatory, evidence_requirement, display_order)
     - `scoring_rules` (id, criteria_version_id, rule_code, rule_type, configuration)
     - `mandatory_conditions` (id, criteria_version_id, condition_code, name, condition_type, configuration, blocking)
     - `ocop_applications` (id, cooperative_id, product_id, criteria_version_id, application_number, application_type, status)
     - `self_assessments` (id, application_id, indicator_id, score, explanation, status)
     - `evidences`, `evidence_versions`, `evidence_links` (hỗ trợ hash SHA-256, versioning, không xóa cứng).
   - **Hiện trạng:** Chưa có seeder nạp dữ liệu tiêu chí QĐ 148 vào database (`CouncilLevelSeeder` đã có nhưng chưa có `OcopCriteriaSeeder`).

4. **Frontend & Mockup hiện tại:**
   - Trong `docs/htx-ocop-ui-v3 (1).html` (dòng 2010–2014) và `CreateDossierWizardPage.tsx` (dòng 549–554), điểm nhóm Phần C bị ghi lệch là 25đ hoặc 30đ, dẫn tới tổng điểm không chuẩn hoặc không khớp tỷ lệ chuẩn của QĐ 148 (40đ - 25đ - 35đ).
   - Modal xem trước `Qd148DocumentModal.tsx` đã dựng layout xem trước cho Biểu 01, 02, 03 nhưng nội dung tĩnh, chưa phản ánh đầy đủ cấu trúc văn bản hành chính theo quy chuẩn docx.
   - Cơ chế tự chấm điểm trên giao diện chưa tích hợp logic gợi ý thông minh dựa trên dữ liệu sản xuất của HTX (vùng trồng, VietGAP, nhật ký PHI...).

---

## 2. LOGIC CHAIN (Chuỗi Suy luận & Căn cứ Kỹ thuật)

1. **Căn cứ 1 (Từ QĐ 148/QĐ-TTg & Hồ sơ nghiên cứu thiết kế):**
   - Quyết định 148 quy định rõ thang điểm 100 với cơ cấu điểm: **Phần A (40 điểm) + Phần B (25 điểm) + Phần C (35 điểm) = 100 điểm**.
   - Đối với phân nhóm Rau củ quả tươi (Ớt chuông Sweet Palermo), bộ 11 tiêu chí chuyên biệt đã được chuẩn hóa tại `Bao_Cao_Nghien_Cuu_Thiet_Ke_He_Thong_OCOP_148.md` với các trọng số điểm tối đa:
     - Phần A: TC-A.1 (10đ), TC-A.2 (5đ), TC-A.3 (10đ), TC-A.4 (15đ) = 40đ.
     - Phần B: TC-B.1.1 (8đ), TC-B.1.2 (7đ), TC-B.2 (10đ) = 25đ.
     - Phần C: TC-C.1 (10đ), TC-C.2.1 (10đ), TC-C.2.2 (5đ), TC-C.3 (10đ) = 35đ.
   - *Suy luận:* Cần thiết kế Seeder nạp đúng cây 3 cấp (`criteria_groups` $\rightarrow$ `criteria` $\rightarrow$ `indicators`), kèm các mốc điểm bậc thang (`scoring_rules`) và điều kiện khống chế (`mandatory_conditions`) với phiên bản `OCOP-QD148-2023-FRESH` ở trạng thái `PUBLISHED`.

2. **Căn cứ 2 (Từ Biểu mẫu 01, 02, 03 docx & Thông tin HTX Tân Tiến):**
   - Biểu 01, 02, 03 trong văn bản quy chuẩn yêu cầu rất chi tiết thông tin pháp lý của chủ thể, người đại diện, vùng nguyên liệu, quy trình đóng gói, chứng chỉ ATTP/VietGAP và xác nhận của cấp xã.
   - *Suy luận:* Hệ thống cần cơ chế Auto-fill tự động trích xuất các trường dữ liệu sẵn có của HTX Tân Tiến (`cooperatives`, `products`, `members`, `farm_plots`, `phi_calculations`) vào hồ sơ và kết xuất chuẩn hóa ra PDF/HTML.

3. **Căn cứ 3 (Từ Yêu cầu Nông dân làm chủ & Hệ thống gợi ý thông minh):**
   - Nông dân HTX không rành các thuật ngữ hành chính phức tạp, nhưng là người trực tiếp chịu trách nhiệm pháp lý về số điểm tự chấm.
   - *Suy luận:* Giao diện tự chấm điểm phải cho phép nông dân **toàn quyền click chọn mức điểm** (dạng thẻ/radio card to rõ), đồng thời hệ thống đóng vai trò **Trợ lý gợi ý thông minh**: hiển thị mức điểm gợi ý kèm nút bấm "Áp dụng gợi ý" (1 chạm) dựa trên việc phân tích dữ liệu thực tế (ví dụ: phát hiện 100% diện tích canh tác tại Đà Lạt/Lạc Dương $\rightarrow$ gợi ý 10/10đ cho TC-A.1; phát hiện chứng chỉ VietGAP còn hiệu lực đến 2027 $\rightarrow$ gợi ý 10/10đ cho TC-C.2.1).

4. **Căn cứ 4 (Từ Quản lý Minh chứng & Toàn vẹn Dữ liệu):**
   - Yêu cầu kiểm toán OCOP và quy tắc `BR-EVIDENCE-004`, `BR-EVIDENCE-006` đòi hỏi mọi tệp tải lên phải được bảo toàn, không xóa đè.
   - *Suy luận:* Mỗi tệp tải lên phải tính mã băm SHA-256 (64 ký tự hex) ngay tại thời điểm upload; khi cập nhật tệp mới thì tăng version (v1.0 $\rightarrow$ v1.1 $\rightarrow$ v2.0), tệp cũ chuyển trạng thái sang `ARCHIVED` (hoặc `SUPERSEDED`), lưu vết người tải và thời gian tải.

---

## 3. CAVEATS (Vấn đề Cần Lưu ý & Giới hạn Khảo sát)

1. **Hiệu lực phân hạng theo Quyết định 1489/QĐ-TTg năm 2025:**
   - QĐ 1489/QĐ-TTg đã tinh giản thẩm quyền: Cấp Tỉnh trực tiếp đánh giá và công nhận sản phẩm 3 sao và 4 sao (không còn tách riêng cấp huyện đánh giá 3 sao). Cấp Trung ương (Bộ NN&PTNT) đánh giá và công nhận sản phẩm 5 sao. Hệ thống phân quyền và Council Level cần hỗ trợ linh hoạt cả 2 cấp chính: `PROVINCIAL` (3-4 sao) và `CENTRAL` (5 sao).
2. **Xử lý Tỷ lệ hoàn thiện hồ sơ (% Completion Rate):**
   - Công thức tính % tiến độ cần cân bằng giữa việc tự chấm điểm và đính kèm minh chứng hợp lệ để tránh trường hợp nông dân chỉ tự chấm điểm mà chưa nộp minh chứng nhưng tiến độ vẫn báo 100%.

---

## 4. CONCLUSION (Đặc tả Chi tiết Phục vụ Triển khai)

### 4.1. Cây Tiêu Chí QĐ 148 Đầy Đủ — Phân Nhóm Rau Củ Quả Tươi (Ớt Chuông Sweet Palermo)

#### Bảng Tổng Hợp Cây Tiêu Chí 100 Điểm (3 Cấp Database Mapped)

| Mã Nhóm | Tên Nhóm Tiêu Chí (`criteria_groups`) | Mã TC (`criteria`) | Tên Tiêu Chí Thành Phần | Điểm Tối Đa | Mã Chỉ Tiêu (`indicators`) | Tên Chỉ Tiêu Đánh Giá | Bắt Buộc (`mandatory`) | Thang Điểm Chi Tiết (`scoring_rules`) | Nguồn Dữ Liệu Tự Động HTX |
|:---:|---|:---:|---|:---:|:---:|---|:---:|---|---|
| **GA** | **Phần A: Sản phẩm & Sức mạnh cộng đồng** (40.0đ) | **TC-A.1** | Nguồn nguyên liệu địa phương | 10.0 | **TC-A.1.1** | Tỷ lệ sử dụng nguyên liệu địa phương trong tỉnh | Có (Bắt buộc) | 100% nguyên liệu: 10đ<br>$\geq 70\%$: 7đ<br>$\geq 50\%$: 5đ<br>$<50\%$: 1đ<br>Không: 0đ | Module `VungTrong`, `ThuaDat` (100% tại Hòn Bồ & Đạ Sar) |
| **GA** |  | **TC-A.2** | Sử dụng lao động tại chỗ | 5.0 | **TC-A.2.1** | Tỷ lệ lao động địa phương có hợp đồng | Không | $\geq 80\%$ lao động ĐP: 5đ<br>$50 - 79\%$: 3đ<br>$<50\%$: 1đ<br>Không: 0đ | Module `ThanhVien`, Hợp đồng nhân công (165/165 hộ) |
| **GA** |  | **TC-A.3** | Tổ chức sản xuất & liên kết chuỗi | 10.0 | **TC-A.3.1** | Năng lực liên kết chuỗi giá trị tiêu thụ | Không | Hợp đồng bao tiêu ổn định $\geq 50\%$ sản lượng: 10đ<br>Hợp đồng từng vụ: 7đ<br>Liên kết lỏng lẻo: 3đ<br>Không: 0đ | Module `PhieuThuMua`, Hợp đồng WinMart/Co.opmart (4.720 tấn/năm) |
| **GA** |  | **TC-A.4** | Bảo vệ môi trường trong sản xuất | 15.0 | **TC-A.4.1** | Cam kết BVMT & Quy trình tái chế phụ phẩm rau hữu cơ | Có (Bắt buộc) | Đầy đủ cam kết, bể thu gom bao gói BVTV, ủ phân hữu cơ khép kín: 15đ<br>Đạt khá: 11-14đ<br>Trung bình: 6-10đ<br>Chưa đạt: 0đ | Hồ sơ cam kết BVMT Phường 12, ĐTM số hóa |
| **GB** | **Phần B: Khả năng tiếp thị** (25.0đ) | **TC-B.1** | Tiếp thị & Quảng bá sản phẩm (15.0đ) | 8.0 | **TC-B.1.1** | Hệ thống kênh phân phối thương mại | Không | Bán lẻ tại chuỗi siêu thị toàn quốc, sàn TMĐT OCOP: 8đ<br>Phân phối cấp vùng/tỉnh: 5đ<br>Bán lẻ truyền thống: 2đ<br>Chưa có: 0đ | Hợp đồng thương mại, Hóa đơn WinMart, Bách Hóa Xanh |
| **GB** |  | **TC-B.1** |  | 7.0 | **TC-B.1.2** | Bao bì đóng gói & Tem nhãn truy xuất nguồn gốc | Có (Bắt buộc) | Bao bì chuẩn NĐ 43/2017 & TT 02/2024, có tem QR gắn mã lô (`lot_id`): 7đ<br>Bao bì có tem QR cơ bản: 5đ<br>Chỉ có nhãn: 2đ<br>Không nhãn: 0đ | Module QR Code, `lot_id`, Thiết kế bao bì |
| **GB** |  | **TC-B.2** | Câu chuyện về sản phẩm | 10.0 | **TC-B.2.1** | Nội dung & Hình thức thể hiện câu chuyện sản phẩm | Không | Nêu bật di sản rau Đà Lạt, nguồn gốc giống Palermo, có tư liệu ảnh/video chuyên nghiệp: 10đ<br>Khá: 7-9đ<br>Đơn giản: 3-6đ<br>Sơ sài: 1đ | File thuyết minh dạng văn bản/ảnh/video truyền thông |
| **GC** | **Phần C: Chất lượng sản phẩm** (35.0đ) | **TC-C.1** | Chỉ tiêu cảm quan, dinh dưỡng & độc đáo | 10.0 | **TC-C.1.1** | Chỉ tiêu cảm quan, độ ngọt Brix & kiểm nghiệm dinh dưỡng | Không | Độ Brix $\geq 8$, màu đỏ tự nhiên, Vitamin C cao, có phiếu kiểm nghiệm ISO 17025: 10đ<br>Đạt yêu cầu: 7-9đ<br>Trung bình: 4-6đ<br>Kém: 0đ | Phiếu kiểm nghiệm Quatest 3 / Trung tâm kiểm nghiệm độc lập |
| **GC** |  | **TC-C.2** | Tiêu chuẩn chất lượng & ATTP (15.0đ) | 10.0 | **TC-C.2.1** | Tiêu chuẩn chất lượng VietGAP / GlobalGAP | Có (Bắt buộc) | Giấy chứng nhận VietGAP còn hiệu lực: 10đ<br>Chứng nhận đang gia hạn: 5đ<br>Chưa có: 0đ | Bản scan GCN VietGAP VICB-2024-GAP-0128 (hạn 2027) |
| **GC** |  | **TC-C.2** |  | 5.0 | **TC-C.2.2** | Kiểm soát tồn dư thuốc BVTV & Vi sinh vật | Có (Bắt buộc) | Tuân thủ 100% thời gian cách ly PHI, âm tính hoạt chất cấm, sổ nhật ký đầy đủ: 5đ<br>Đạt MRL nhưng sổ thiếu sót: 2-4đ<br>Vi phạm PHI: 0đ | Module `NhatKyPhunThuoc`, Phiếu KCS kiểm soát PHI |
| **GC** |  | **TC-C.3** | Sở hữu trí tuệ & Nhãn hiệu bảo hộ | 10.0 | **TC-C.3.1** | Văn bằng bảo hộ nhãn hiệu / Nhãn hiệu chứng nhận | Không | Được cấp quyền sử dụng nhãn hiệu chứng nhận "Rau Đà Lạt" hoặc nhãn riêng: 10đ<br>Đã nộp đơn hợp lệ chờ cấp: 5-8đ<br>Chưa đăng ký: 0đ | Giấy chứng nhận quyền sử dụng nhãn hiệu "Rau Đà Lạt" |
| **TỔNG** | **3 Phần A, B, C** | **11 Tiêu chí** |  | **100.0** | **11 Chỉ tiêu** |  | **5 Bắt buộc** |  |  |

---

### 4.2. Danh Sách Điều Kiện Khống Chế (Mandatory Conditions / Điều Kiện Cứng)

Hệ thống cấu hình 6 điều kiện khống chế trong bảng `mandatory_conditions`:

1. **MC-VIETGAP (Bắt buộc có VietGAP / ATTP):**
   - Mã: `COND-VIETGAP-MANDATORY`
   - Tiêu chí liên kết: `TC-C.2.1`
   - Loại: `BLOCKING_FOR_STAR`
   - Cấu hình: Để đạt **4 sao**, điểm `TC-C.2.1` phải $\geq 10.0$ và có Giấy chứng nhận VietGAP còn hiệu lực. Nếu không đạt điều kiện này, dù tổng điểm $\geq 70$, hồ sơ tự động bị hạ xuống tối đa **3 sao**.
2. **MC-ENVIRONMENT (Bảo vệ môi trường):**
   - Mã: `COND-ENVIRONMENT-MANDATORY`
   - Tiêu chí liên kết: `TC-A.4.1`
   - Loại: `BLOCKING_FOR_SUBMIT`
   - Cấu hình: Điểm tự chấm phải $\geq 8.0$ và phải có văn bản cam kết bảo vệ môi trường được cấp thẩm quyền xác nhận.
3. **MC-RAW-MATERIAL (Nguyên liệu địa phương tối thiểu):**
   - Mã: `COND-RAW-MATERIAL-MINIMUM`
   - Tiêu chí liên kết: `TC-A.1.1`
   - Loại: `BLOCKING_FOR_STAR`
   - Cấu hình: Tỷ lệ nguyên liệu địa phương phải đạt $\geq 50\%$ (đạt $\geq 5.0$ điểm) đối với 3 sao và $\geq 70\%$ (đạt $\geq 7.0$ điểm) đối với 4 sao.
4. **MC-LABEL-QR (Nhãn mác & Tem QR truy xuất):**
   - Mã: `COND-PACKAGING-QR-MANDATORY`
   - Tiêu chí liên kết: `TC-B.1.2`
   - Loại: `BLOCKING_FOR_SUBMIT`
   - Cấu hình: Bắt buộc phải có tem nhãn kèm mã QR liên kết mã lô (`lot_id`) kiểm tra được trên hệ thống.
5. **MC-FOOD-SAFETY (Dư lượng thuốc BVTV & PHI):**
   - Mã: `COND-FOOD-SAFETY-PHI`
   - Tiêu chí liên kết: `TC-C.2.2`
   - Loại: `BLOCKING_FOR_STAR`
   - Cấu hình: Bắt buộc 100% lô xuất kho phải tuân thủ thời gian cách ly PHI, không được có dư lượng chất cấm.
6. **MC-COMPLETENESS (Tỷ lệ hoàn thiện hồ sơ 100% trước khi nộp):**
   - Mã: `COND-COMPLETENESS-100`
   - Loại: `BLOCKING_FOR_SUBMIT`
   - Cấu hình: Completion Rate ($CR$) phải đạt đúng **100%** (100% chỉ tiêu bắt buộc đã có điểm tự chấm và có ít nhất 1 tệp minh chứng hợp lệ gắn kèm). Nếu $CR < 100\%$, nút "Nộp hồ sơ" bị khóa hoàn toàn.

---

### 4.3. Đặc Tả Biểu Mẫu 01, 02, 03 & Dữ Liệu Tự Động Điền (Auto-Fill Mappings)

#### Biểu Số 01: Phiếu Đăng Ký Đánh Giá, Phân Hạng Sản Phẩm OCOP
- **Mục 1. Thông tin về đơn vị đăng ký:**
  - Tên đơn vị: `cooperatives.legal_name` $\rightarrow$ *"Hợp tác xã Dịch vụ Nông nghiệp Tổng hợp Tân Tiến"*
  - Người đại diện pháp lý: `users.full_name` $\rightarrow$ *"Nguyễn Văn Tân"*
  - Chức vụ: *"Giám đốc Hợp tác xã"*
  - Địa chỉ liên hệ: `cooperatives.address` $\rightarrow$ *"Tổ Hòn Bồ, Phường 12, Thành phố Đà Lạt, Tỉnh Lâm Đồng"*
  - Điện thoại: `cooperatives.phone` $\rightarrow$ *"0987 654 321"* — Email: `cooperatives.email` $\rightarrow$ *"htx@tantien.vn"*
- **Mục 2. Tên sản phẩm đăng ký:**
  - `products.product_name` $\rightarrow$ *"Ớt chuông Sweet Palermo Đỏ Đà Lạt"*
- **Mục 3. Nhóm sản phẩm đăng ký:**
  - Ngành: *"Thực phẩm"* — Nhóm: *"Nông sản tươi sống"* — Phân nhóm: *"Rau, củ, quả, hạt tươi"*
- **Mục 4. Lần đăng ký:**
  - Checkbox: [x] Lần đầu &nbsp;&nbsp; [ ] Nâng hạng &nbsp;&nbsp; [ ] Đánh giá lại
- **Mục 5. Mức sao mục tiêu:**
  - `ocop_applications.target_star` $\rightarrow$ *"4 Sao OCOP (tiềm năng 5 Sao)"*
- **Mục 6. Tài liệu kèm theo:**
  - Báo cáo tự đánh giá về sản phẩm theo Bộ tiêu chí (Biểu số 02) (bản in & bản điện tử)
  - Sản phẩm mẫu: *"10 hộp thành phẩm đóng gói khay giấy 500g dán tem QR truy xuất"*
- **Phần Cơ quan tiếp nhận:**
  - Cấp Huyện / Tỉnh: Phiếu số `.../PĐK-LD-DL-2026`, Ngày nhận, Người tiếp nhận.

#### Biểu Số 02: Báo Cáo Tự Đánh Giá Về Sản Phẩm OCOP
- **Phần I. Thông tin chung:**
  - Tên chủ thể, địa chỉ, người đại diện (tương tự Biểu 01).
  - Ngày thành lập: *"10/10/2018"* — Số ĐKKD: *"5801234567 do UBND Thành phố Đà Lạt cấp"*.
  - Quy cách sản phẩm: *"Ớt chuông Sweet Palermo Đỏ dài 20-25cm, khối lượng 100-150g/trái, độ ngọt Brix $\geq 8.0$, đóng gói túi tự hủy sinh học 500g - 1kg kèm tem truy xuất nguồn gốc GS1"*.
  - Tình trạng pháp lý: Đã công bố chất lượng cơ sở [x], Có GCN đủ điều kiện VSATTP [x], Có VietGAP [x], Có quyền sử dụng nhãn hiệu chứng nhận "Rau Đà Lạt" [x].
  - Lịch sử hình thành: *"Thành lập năm 2018 với 25 hộ thành viên, đến nay phát triển lên 165 hộ xã viên với 280 ha vùng trồng nhà kính tại Đà Lạt và Lạc Dương, tiên phong canh tác giống ớt hoa quả Sweet Palermo tiêu chuẩn cao"*.
- **Phần II. Kết quả thực hiện phương án SXKD:**
  - Vùng nguyên liệu: 280 ha canh tác ứng dụng hệ thống tưới Fertigation tự động, kiểm soát dịch hại IPM sinh học.
  - Sản lượng tiêu thụ: 4.720 tấn rau/năm; Doanh thu: 48,5 tỷ đồng; Lợi nhuận: 6,8 tỷ đồng.
  - Phân phối: Kênh siêu thị WinMart, Co.opmart, sàn TMĐT OCOP.
- **Phần III. Bảng tự đánh giá theo Bộ tiêu chí (Thang điểm 100):**
  - Hiển thị bảng chi tiết 11 tiêu chí, tự chấm **100/100 điểm** (hoặc điểm thực tế do HTX nhập), mô tả kết quả và đính kèm danh mục 14 loại minh chứng trong phụ lục.
- **Phần IV. Kế hoạch SXKD tương lai:**
  - Mở rộng thêm 50 ha canh tác GlobalGAP, đầu tư kho lạnh bảo quản sâu, mở rộng thị trường xuất khẩu sang Singapore.

#### Biểu Số 03: Báo Cáo Đánh Giá Của UBND Cấp Xã
- **Cơ quan xác nhận:** UBND Phường 12, Thành phố Đà Lạt (hoặc UBND Xã Tân Tiến / Mê Linh).
- **4 Nội dung thẩm tra thực tế:**
  1. *Nguyên liệu địa phương:* Xác nhận 100% diện tích trồng ớt chuông nằm thực tế tại địa phương (vùng Hòn Bồ và Đạ Sar), toàn bộ nguồn hàng thu hoạch có nguồn gốc địa phương rõ ràng.
  2. *Lao động địa phương:* Xác nhận HTX sử dụng 165 hộ xã viên và 48 lao động nông nghiệp thường trú tại địa phương, đảm bảo thu nhập ổn định và chính sách an sinh.
  3. *Nguồn gốc ý tưởng:* Xác nhận đây là sản phẩm nông nghiệp công nghệ cao ứng dụng giống mới thích nghi xuất sắc với khí hậu Đà Lạt.
  4. *Bản sắc / trí tuệ địa phương:* Sản phẩm kế thừa và phát huy thế mạnh thương hiệu nông sản Đà Lạt, ứng dụng công nghệ nhà kính tiên tiến của nông dân địa phương.
- **Kiến nghị:** UBND cấp xã trân trọng đề nghị Hội đồng OCOP cấp trên đánh giá, phân hạng sản phẩm OCOP cho HTX Tân Tiến.

---

### 4.4. Cơ Chế Tự Chấm Điểm Thông Minh (Farmer-Centric UX & Smart Suggestion Engine)

1. **Nguyên tắc "Chủ thể chủ động — Hệ thống hỗ trợ":**
   - Người dùng (nông dân/cán bộ HTX) là người duy nhất quyết định mức điểm tự chấm cuối cùng. Giao diện thiết kế các mức điểm thành các **Thẻ chọn to bản (Card/Radio)** kèm màu sắc trực quan, không dùng các bảng nhập liệu số khô khan.
   - Bên dưới mỗi tiêu chí có nút bấm nổi bật: **"💡 Gợi ý thông minh từ dữ liệu HTX"**.
2. **Logic Gợi ý Điểm Tự động:**
   - **TC-A.1 (Nguyên liệu địa phương):** Quét bảng `farm_plots`: Nếu tỷ lệ diện tích thuộc Đà Lạt/Lâm Đồng $= 100\% \rightarrow$ Gợi ý mức **10.0 điểm** (*"Hệ thống phát hiện 100% diện tích (280 ha) thuộc Hòn Bồ & Đạ Sar"*).
   - **TC-A.2 (Lao động địa phương):** Quét bảng `members`: Nếu tỷ lệ thường trú địa phương $\geq 80\% \rightarrow$ Gợi ý **5.0 điểm** (*"Hệ thống ghi nhận 165/165 hộ xã viên thường trú địa phương"*).
   - **TC-A.3 (Liên kết chuỗi):** Quét bảng `stock_receipts` và hợp đồng: Nếu sản lượng bao tiêu $\geq 50\% \rightarrow$ Gợi ý **10.0 điểm** (*"Sản lượng liên kết bao tiêu đạt 4.720 tấn/năm"*).
   - **TC-B.1.2 (Bao bì & Tem QR):** Quét liên kết mã lô `lot_id` và mã QR GS1 $\rightarrow$ Gợi ý **7.0 điểm** (*"Đã liên kết tem QR truy xuất 10 trường dữ liệu"*).
   - **TC-C.2.1 (VietGAP):** Quét bảng `evidences` loại `CERTIFICATE`: Nếu có VietGAP còn hiệu lực $\rightarrow$ Gợi ý **10.0 điểm** (*"Giấy VietGAP VICB-2024-GAP-0128 còn hiệu lực đến 2027"*).
   - **TC-C.2.2 (Dư lượng BVTV & PHI):** Quét `phi_calculations`: Nếu 100% bản ghi tuân thủ ngày cách ly PHI $\rightarrow$ Gợi ý **5.0 điểm** (*"100% nhật ký canh tác tuân thủ thời gian cách ly PHI"*).
   - Nông dân chỉ cần bấm **"Áp dụng gợi ý"**, điểm và phần giải trình sẽ được điền tự động.
3. **Dự báo Phân hạng Sao & Cảnh báo:**
   - Điểm tự chấm được cộng theo thời gian thực: $Total = S_A + S_B + S_C$.
   - Hiển thị Widget phân hạng sao động:
     - $50.0 - 69.5$ điểm $\rightarrow$ Dự báo **3 SAO 🌟🌟🌟**
     - $70.0 - 89.5$ điểm $\rightarrow$ Dự báo **4 SAO 🌟🌟🌟🌟**
     - $\geq 90.0$ điểm $\rightarrow$ Dự báo **5 SAO 🌟🌟🌟🌟🌟**
   - Nếu $Total \geq 70$ nhưng thiếu VietGAP: Hệ thống phát cảnh báo màu vàng: *"Điểm đạt ngưỡng 4 sao (78.5đ) nhưng chưa gắn chứng chỉ VietGAP hợp lệ. Vui lòng bổ sung để không bị khống chế hạ xuống 3 sao!"*.
4. **Đo lường Tiến độ Hoàn thiện Hồ sơ (Completion Rate %):**
   - Công thức thời gian thực:
     $$CR = \left( \frac{\text{Số chỉ tiêu bắt buộc đã tự chấm}}{\text{Tổng chỉ tiêu bắt buộc}} \times 50\% \right) + \left( \frac{\text{Số chỉ tiêu bắt buộc đã có minh chứng}}{\text{Tổng chỉ tiêu bắt buộc}} \times 50\% \right)$$
   - Tiến độ hiển thị thanh phần trăm màu xanh khi đạt 100%, kèm danh sách checklist các mục còn thiếu nếu $CR < 100\%$.

---

### 4.5. Cơ Chế Quản Lý Minh Chứng Số Hóa (Evidence Management & Integrity)

1. **Bảo toàn Tính Toàn Vẹn bằng Mã Băm SHA-256:**
   - Khi tải lên bất kỳ tệp tài liệu nào (PDF scan, JPG, PNG), hệ thống chạy thuật toán băm SHA-256 nhị phân của tệp:
     $$\text{Checksum} = \text{hash}('sha256', \text{file\_binary})$$
   - Lưu trữ chuỗi 64 ký tự hex vào cột `checksum` trong bảng `evidence_versions`.
   - Cung cấp tính năng "Kiểm tra tính toàn vẹn (Integrity Check)": Hệ thống đọc lại tệp trong ổ lưu trữ, tính lại hash và so sánh với hash lưu trong CSDL. Nếu khớp $\rightarrow$ hiển thị huy hiệu xanh *"Toàn vẹn — Chống giả mạo"*.
2. **Cơ Chế Quản Lý Đa Phiên Bản (Evidence Versioning):**
   - Khi hồ sơ cần bổ sung tài liệu mới thay thế:
     - Tệp mới được tạo trong `evidence_versions` với `version_number` tăng dần (v1.0 $\rightarrow$ v1.1 $\rightarrow$ v2.0).
     - Bắt buộc nhập trường `replacement_reason` (lý do thay thế, ví dụ: *"Bổ sung Giấy chứng nhận VietGAP gia hạn 2024-2027 theo yêu cầu của Hội đồng thẩm định"*).
     - Cập nhật trường `current_version_id` của bản ghi `evidences` trỏ tới phiên bản mới.
3. **Lưu Trữ Lịch Sử Bất Biến (Non-destructive Archiving):**
   - Tuyệt đối không xóa cứng (hard delete) bất kỳ tệp lịch sử nào.
   - Phiên bản cũ được đổi trạng thái sang `ARCHIVED` (hoặc `SUPERSEDED`), phiên bản mới nhận trạng thái `ACTIVE` (hoặc `VERIFIED`).
   - Cung cấp Presigned URL có thời hạn (15-30 phút) để xem trước và tải về an toàn, không để lộ đường dẫn tệp riêng tư ra internet.

---

## 5. FEATURES DISCOVERED (Bảng Tổng Hợp Tính Năng Khai Thác)

| # | Category | Feature | Description | Inputs | Outputs | Error Behavior | Discovered Via |
|---|----------|---------|-------------|--------|---------|----------------|----------------|
| 1 | Regulatory Tree | Seeder Cây Tiêu Chí QĐ 148 | Nạp toàn diện bộ 11 tiêu chí/chỉ tiêu cho Rau củ quả tươi (Ớt chuông Palermo) | Phiên bản `OCOP-QD148-2023-FRESH` | Database records (groups, criteria, indicators, rules) | Unique constraint violation nếu trùng version | `Bao_Cao_Nghien_Cuu...148.md`, `34_OCOP_WORKFLOW.md` |
| 2 | Regulatory Tree | Quản lý Phiên bản Tiêu chí | Quản lý trạng thái DRAFT $\rightarrow$ PUBLISHED $\rightarrow$ RETIRED; bất biến khi đã xuất bản | Request xuất bản | Status update, audit log | Chặn sửa tiêu chí khi version đã PUBLISHED (`BR-OCOP-003`) | `2026_01_01_000039_create_criteria_versions` |
| 3 | Regulatory Tree | Điều kiện khống chế (Mandatory Conditions) | Ràng buộc tiêu chí cứng (VietGAP, BVMT, Nguyên liệu địa phương...) | Cấu hình condition rules | Validation flags, star cap | Hạ hạng sao hoặc chặn nộp hồ sơ | `2026_01_01_000044_create_mandatory_conditions` |
| 4 | Forms & Export | Biểu mẫu số 01 | Phiếu đăng ký đánh giá, phân hạng sản phẩm OCOP | Thông tin HTX Tân Tiến & Ớt chuông | HTML/PDF view, print output | Báo lỗi nếu thiếu thông tin đại diện pháp lý | `docs/Bieu mẫu 1...docx` |
| 5 | Forms & Export | Biểu mẫu số 02 | Báo cáo tự đánh giá sản phẩm OCOP (4 phần + 14 minh chứng) | Thông tin SXKD, điểm tự chấm, minh chứng | HTML/PDF view, print output | Cảnh báo nếu chưa tự chấm đủ 11 tiêu chí | `docs/Bieu mẫu 2.docx` |
| 6 | Forms & Export | Biểu mẫu số 03 | Báo cáo đánh giá của UBND cấp xã (4 nội dung địa phương) | Xác nhận nguyên liệu, lao động, ý tưởng, bản sắc | HTML/PDF view, print output | Thiếu xác nhận cấp xã thì không đủ điều kiện trình tỉnh | `docs/BIEU SO 03...docx` |
| 7 | Self-Scoring | Tự chấm điểm chủ thể | Nông dân chủ động click chọn mức điểm trên từng tiêu chí | Điểm tự chọn, văn bản giải trình | Lưu bảng `self_assessments` | Điểm vượt trần tối đa bị từ chối (`BR-OCOP-04`) | `2026_01_01_000046_create_self_assessments` |
| 8 | Self-Scoring | Gợi ý điểm thông minh | Tự động phân tích dữ liệu HTX để gợi ý mức điểm và căn cứ | Dữ liệu vùng trồng, VietGAP, nhật ký PHI | Điểm gợi ý, lý do gợi ý | Nếu không có dữ liệu HTX thì không hiển thị gợi ý | `Bao_Cao_Nghien_Cuu...148.md`, `34_OCOP_WORKFLOW.md` |
| 9 | Self-Scoring | Tính tổng điểm & Dự báo sao | Tự động cộng tổng điểm A, B, C và xếp hạng 3, 4, 5 sao | Điểm thành phần | Tổng điểm, số sao dự kiến, cảnh báo | Báo cờ vi phạm nếu thiếu điều kiện cứng | `docs/34_OCOP_WORKFLOW.md` |
| 10 | Self-Scoring | Đo lường Tiến độ (% Completion) | Đo lường thời gian thực tỷ lệ hoàn thiện hồ sơ | Số tiêu chí đã chấm, số minh chứng đính kèm | Tỷ lệ % tiến độ, thanh progress bar | Khóa nút nộp nếu tỷ lệ $<100\%$ (`BR-OCOP-01`) | `Bao_Cao_Nghien_Cuu...148.md`, `06_BUSINESS_RULES.md` |
| 11 | Evidence | Tính mã băm SHA-256 | Băm tệp nhị phân khi upload để đảm bảo tính toàn vẹn | File binary (PDF, scan, ảnh) | Chuỗi 64 ký tự SHA-256 | File hỏng hoặc quá 50MB bị từ chối (`BR-EVIDENCE-003`) | `2026_01_01_000055_create_evidence_versions` |
| 12 | Evidence | Quản lý phiên bản minh chứng | Quản lý v1.0, v1.1..., lưu vết lý do thay thế | File mới, `replacement_reason` | Version mới `ACTIVE`, bản cũ `ARCHIVED` | Không cho phép xóa cứng file cũ | `2026_01_01_000055_create_evidence_versions` |
| 13 | Evidence | Liên kết minh chứng - tiêu chí | Gắn minh chứng với các tiêu chí tương ứng (N-N) | `evidence_id`, `indicator_id` | Bản ghi `evidence_links` | Không cho phép liên kết trùng lặp | `2026_01_01_000056_create_evidence_links` |
| 14 | Farmer UX | Wizard tạo hồ sơ 6 bước | Dẫn dắt quy trình từng bước thân thiện cho nông dân | Input từng bước | Hồ sơ hoàn chỉnh | Báo lỗi trường bắt buộc ở từng bước | `CreateDossierWizardPage.tsx`, `htx-ocop-ui-v3.html` |
| 15 | Farmer UX | Modal xem trước & in ấn chuẩn | Xem trước Biểu mẫu 01, 02, 03 chuẩn thể thức văn bản hành chính | Dữ liệu hồ sơ | Bản in nét, xuất PDF | Lỗi hiển thị nếu thiếu font hỗ trợ tiếng Việt | `Qd148DocumentModal.tsx` |

---

## 6. EDGE CASES (Kịch Bản Ngoại Lệ & Quy Tắc Khóa Chặn)

| # | Feature | Input / Tình Huống | Observed & Expected Behavior |
|---|---------|-------------------|-----------------------------|
| 1 | Nộp hồ sơ OCOP | HTX mới hoàn thành 9/11 tiêu chí ($CR = 81.8\%$) nhưng bấm nút "Nộp hồ sơ chính thức" | Hệ thống **khóa hoàn toàn nút nộp** (disabled). Hiển thị Modal/Alert cảnh báo danh sách 2 tiêu chí còn thiếu điểm tự chấm hoặc thiếu tệp minh chứng bắt buộc (`BR-OCOP-01`). |
| 2 | Thẩm định minh chứng | Giấy chứng nhận VietGAP hết hạn trong thời gian hồ sơ đang thẩm định tại Hội đồng | Job kiểm tra tự động phát hiện `T_tham_dinh > ngay_het_han` $\rightarrow$ Đổi trạng thái minh chứng sang `HET_HIEU_LUC`. Gửi thông báo đỏ yêu cầu HTX nộp giấy tái cấp trong 15 ngày, tạm dừng chấm điểm TC-C.2.1. |
| 3 | Phân hạng sao | Tổng điểm tự chấm đạt 78.5 điểm (ngưỡng 4 sao) nhưng chưa đính kèm Giấy chứng nhận VietGAP | Scoring engine kích hoạt điều kiện khống chế `COND-VIETGAP-MANDATORY` $\rightarrow$ Khống chế xếp hạng tối đa là **3 sao**, hiển thị cảnh báo giải thích rõ lý do thiếu điều kiện cứng. |
| 4 | Chấm điểm Hội đồng | Điểm chấm giữa Thành viên A (85đ) và Thành viên B (70đ) chênh lệch 15 điểm ($> 10$ điểm) | Hệ thống phát cờ cảnh báo `VARIANCE_EXCEEDED` theo `BR-OCOP-02`, khóa nút chốt điểm (`CONSOLIDATED`), yêu cầu Chủ tịch Hội đồng tổ chức họp phân giải để đạt đồng thuận chênh lệch $\leq 10$ điểm. |
| 5 | Độ lệch điểm tự chấm | HTX tự chấm TC-A.4 là 15.0/15.0đ, nhưng Hội đồng chỉ chấm 8.0/15.0đ (lệch 7.0đ $\geq 5.0$đ) | Hệ thống kích hoạt cờ `HIGH_SCORE_DISCREPANCY`, bắt buộc thành viên Hội đồng phải nhập văn bản giải trình lý do trừ điểm vào trường `adjustment_reason` trước khi lưu điểm. |
| 6 | Cập nhật minh chứng | HTX tải lên bản scan VietGAP mới thay thế bản cũ | Hệ thống tạo `evidence_version` v1.1, lưu mã SHA-256 mới, chuyển bản v1.0 sang trạng thái `ARCHIVED`. Tuyệt đối không xóa đè bản cũ, bảo toàn trọn vẹn chuỗi kiểm toán. |
| 7 | Thời hạn bổ sung (SLA) | Hội đồng yêu cầu bổ sung hồ sơ (`REVISION_REQUIRED`), HTX không cập nhật sau 15 ngày làm việc | Hệ thống kích hoạt đếm ngược SLA. Hết 15 ngày không có thao tác $\rightarrow$ Tự động chuyển trạng thái sang `EXPIRED_REVISION` và kết thúc đợt thẩm định. |
| 8 | Tái đánh giá 36 tháng | Chứng nhận OCOP 4 sao đã được cấp cách đây 33 tháng (còn 3 tháng hiệu lực) | Hệ thống tự động chuyển trạng thái sang `RENEWAL_PENDING`, gửi thông báo nhắc việc và gợi ý HTX nhân bản tạo hồ sơ Tái đánh giá kế thừa dữ liệu vùng trồng cũ. |

---

## 7. VERIFICATION METHOD (Phương Pháp & Lệnh Kiểm Tra Xác Thực)

1. **Kiểm tra Cấu trúc Database & Model:**
   - Kiểm tra các bảng OCOP: `criteria_versions`, `criteria_groups`, `criteria`, `indicators`, `scoring_rules`, `mandatory_conditions`, `evidences`, `evidence_versions`.
   - Lệnh kiểm tra schema:
     ```powershell
     php artisan test --filter=DatabaseSchemaTest
     ```
2. **Kiểm tra Suite Test Backend OCOP:**
   - Chạy toàn bộ test suites OCOP hiện có trong backend:
     ```powershell
     php artisan test --filter=Ocop
     ```
   - Bao gồm: `OcopCriteriaTest`, `OcopApplicationTest`, `OcopEvidenceTest`, `OcopEvaluationTest`, `OcopEdgeCasesTest`.
3. **Kiểm tra Frontend Build & Lint:**
   - Chạy build và kiểm tra linting frontend:
     ```powershell
     npm run build
     npm run lint
     ```
4. **Kiểm tra Biểu Mẫu & Tự Chấm Điểm trên Giao Diện:**
   - Truy cập các trang:
     - `/ocop/criteria`: Kiểm tra hiển thị đủ cây tiêu chí QĐ 148 với cơ cấu 40đ - 25đ - 35đ.
     - `/ocop/dossiers/create`: Kiểm tra Wizard 6 bước, tự chấm điểm có nút gợi ý thông minh từ dữ liệu HTX, dự báo sao và thanh tiến độ hoàn thiện hồ sơ.
     - Modal Xuất Biểu Mẫu: Kiểm tra hiển thị chuẩn thể thức và nội dung tự động điền của Biểu 01, Biểu 02, Biểu 03.
