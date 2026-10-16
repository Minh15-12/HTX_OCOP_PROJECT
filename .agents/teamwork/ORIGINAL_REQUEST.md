# Original User Request

## 2026-10-12T07:32:57Z

Số hóa hoàn chỉnh quy trình chuẩn bị hồ sơ đánh giá, phân hạng OCOP theo Quyết định 148/QĐ-TTg: số hóa bộ tiêu chí, biểu mẫu tự chấm điểm (Biểu 01, 02, 03), quản lý minh chứng số hóa kèm mã băm SHA-256 và phiên bản, theo dõi tiến độ hoàn thiện hồ sơ, đồng thời cải tiến giao diện Frontend thân thiện, đơn giản, dễ thao tác cho nông dân HTX.

Working directory: f:\HTX_OCOP_PROJECT
Integrity mode: development

Requested team: Full multi-agent team (Backend DDD & Seeders, Frontend UX Nông dân, QA & Verification)

## Requirements

### R1. Số hóa Cây Tiêu chí OCOP & Cơ chế Quản lý Phiên bản (QĐ 148/QĐ-TTg)
- Xây dựng Seeder nạp toàn diện bộ tiêu chí đánh giá phân hạng OCOP theo Quyết định số 148/QĐ-TTg (thang điểm 100 gồm Phần A: 40đ, Phần B: 25đ, Phần C: 35đ), trực tiếp áp dụng cho dòng sản phẩm chủ lực của HTX Tân Tiến: Rau củ quả tươi - Ớt chuông Sweet Palermo Đỏ Đà Lạt.
- Cấu hình tiêu chí linh hoạt lưu trữ trong Database qua bảng `criteria_versions`, `criteria_groups`, `criteria`, `indicators`, `scoring_rules`, `mandatory_conditions`; tuân thủ nguyên tắc Version Control (Draft → Published) và tính bất biến (`immutable`) sau khi phát hành.

### R2. Số hóa Biểu mẫu OCOP Chuẩn (Biểu số 01, 02, 03) & Cơ chế Tự chấm điểm Thân thiện
- Số hóa 3 biểu mẫu cốt lõi theo đúng mẫu quy chuẩn văn bản trong QĐ 148 và các file tài liệu hướng dẫn (`Bieu mẫu 1`, `Bieu mẫu 2`, `BIEU SO 03`):
  1. **Biểu số 01**: Phiếu đăng ký đánh giá, phân hạng sản phẩm OCOP (thông tin HTX, sản phẩm, ngành nhóm, đợt đánh giá).
  2. **Biểu số 02**: Báo cáo tự đánh giá về sản phẩm OCOP (thông tin chung, hiện trạng sản xuất kinh doanh, tự đánh giá theo bộ tiêu chí, kế hoạch tương lai).
  3. **Biểu số 03**: Báo cáo đánh giá & xác nhận của UBND cấp xã (nguyên liệu, lao động, nguồn gốc ý tưởng, bản sắc/trí tuệ địa phương).
- **Cơ chế Tự chấm điểm (Chủ thể chủ động — Hệ thống hỗ trợ thông minh)**:
  - **Người dùng (Chủ thể HTX/Nông dân) có toàn quyền trực tiếp tự chấm điểm**: Chủ động chọn các mức điểm phù hợp theo thang điểm từng tiêu chí và điền căn cứ giải trình.
  - **Hệ thống đóng vai trò Trợ lý thông minh**: Tự động phân tích dữ liệu sẵn có (vùng trồng, sản lượng thu mua, VietGAP, nhật ký PHI...) để đưa ra **mức điểm gợi ý**, nông dân có thể bấm chọn áp dụng ngay hoặc tự điều chỉnh theo thực tế.
  - Tự động cộng tổng điểm (Phần A, B, C), kiểm tra điều kiện khống chế (điều kiện cứng) và dự báo số sao đạt được (3 sao: 50-69đ, 4 sao: 70-89đ, 5 sao: ≥90đ) kèm cảnh báo chi tiết các tiêu chuẩn còn thiếu.
- Tự động đo lường và hiển thị thời gian thực tỷ lệ hoàn thiện hồ sơ (% hoàn thành) dựa trên số tiêu chí đã tự chấm và số lượng minh chứng hợp lệ đã đính kèm.

### R3. Quản lý Kho Minh chứng Số hóa & Toàn vẹn Dữ liệu
- Quản lý kho minh chứng gắn với từng tiêu chí/chỉ tiêu: cho phép tải lên tệp tài liệu ngoại vi (PDF, scan, ảnh) và liên kết/trích xuất tự động từ dữ liệu nội bộ HTX (vùng trồng, danh sách xã viên, nhật ký canh tác PHI).
- Quản lý phiên bản minh chứng (v1.0, v1.1...), chuyển trạng thái minh chứng cũ sang `ARCHIVED` khi có phiên bản mới, tuyệt đối không xóa cứng dữ liệu lịch sử.
- Tính toán và lưu trữ mã băm SHA-256 cho từng tệp minh chứng để đảm bảo tính toàn vẹn (Integrity Check) chống giả mạo.

### R4. Cải tiến Giao diện Frontend Thân thiện & Dễ thao tác cho Nông dân (Farmer-Centric UX)
- Tối ưu hóa giao diện người dùng theo hướng đơn giản, gần gũi với nông dân:
  - Wizard từng bước (Step-by-Step) dẫn dắt quy trình chuẩn bị hồ sơ từ chọn sản phẩm → điền biểu mẫu → tự chấm điểm (có gợi ý thông minh) → đính kèm minh chứng → xem trước và nộp hồ sơ.
  - Đơn giản hóa thuật ngữ hành chính khó hiểu bằng ngôn ngữ mộc mạc, có chú thích giải thích ngắn gọn, dễ hiểu.
  - Nút bấm to rõ, các mức chọn điểm được thiết kế dạng thẻ trực quan (Card/Radio to bản), chỉ báo trạng thái màu sắc dễ nhận diện (Xanh: Đã hoàn thành, Vàng: Cần bổ sung, Đỏ: Chưa có minh chứng).
  - Tối ưu hóa việc tải lên ảnh chụp từ điện thoại/máy tính bảng, xem trước tài liệu nhanh.
  - Tích hợp Modal xem trước và in ấn/kết xuất (Print / PDF / DOCX) sắc nét, chuẩn thể thức văn bản cho Biểu số 01, Biểu số 02 và Biểu số 03.

## Acceptance Criteria

### Tính Chính xác của Tiêu chí & Biểu mẫu
- [ ] Dữ liệu tiêu chí QĐ 148 cho nhóm Rau củ quả tươi (Ớt chuông Sweet Palermo) được nạp đầy đủ vào database qua seeder, đảm bảo cấu trúc 3 phần (A, B, C) với tổng 100 điểm.
- [ ] Các Biểu mẫu 01, 02, 03 hiển thị chuẩn xác về mặt cấu trúc và nội dung, tự động điền sẵn các thông tin sẵn có từ HTX Tân Tiến và sản phẩm.

### Quy trình Tự chấm điểm & Quản lý Minh chứng
- [ ] Người dùng hoàn toàn chủ động click tự chọn/chỉnh sửa điểm tự chấm trên từng tiêu chí; nút gợi ý điểm từ hệ thống hoạt động chính xác dựa trên dữ liệu HTX.
- [ ] Tổng điểm tự chấm và xếp hạng sao (3⭐, 4⭐, 5⭐) tính toán tự động, chính xác và có thông báo kiểm tra điều kiện khống chế.
- [ ] Tỷ lệ hoàn thiện hồ sơ (%) phản ánh chính xác tiến độ thực tế theo thời gian thực.
- [ ] Tệp minh chứng tải lên được lưu vết phiên bản, tính mã băm SHA-256 và liên kết chính xác với từng tiêu chí tương ứng.

### Giao diện & Trải nghiệm Người dùng Nông dân
- [ ] Giao diện các trang Danh mục tiêu chí (`CriteriaPage`), Hồ sơ OCOP (`DossiersPage`, `DossierDetailPage`), Tạo hồ sơ (`CreateDossierWizardPage`), Kho minh chứng (`EvidencesPage`) được cải tiến trực quan, dễ thao tác, có Wizard hướng dẫn rõ ràng.
- [ ] Tính năng xem trước và in ấn Biểu mẫu 01, Biểu mẫu 02, Biểu mẫu 03 trong hệ thống hoạt động trơn tru, hiển thị đầy đủ thông tin chuẩn quy chuẩn.
- [ ] Toàn bộ Backend test suites (`php artisan test`) và Frontend build (`npm run build`, `npm run lint`) chạy thành công, không phát sinh lỗi hoặc cảnh báo gãy vỡ.

## Verification Resources
- Nhánh Git làm việc: `feature/ocop-digitization-forms-scoring`
- Tài liệu quy chuẩn: `docs/34_OCOP_WORKFLOW.md`, `docs/KE_HOACH_CHI_TIET_OCOP.md`, `docs/Bao_Cao_Nghien_Cuu_Thiet_Ke_He_Thong_OCOP_148.md`, `docs/Bieu mẫu 1 mau-phieu-dk-danh-gia-phan-han-sp-OCOP.docx`, `docs/Bieu mẫu 2.docx`, `docs/BIEU SO 03-PHU LUC II-QD-148-QD-TTg.docx`.
- Lệnh kiểm tra xác thực:
  - Backend: `php artisan test --filter=Ocop`
  - Frontend: `npm run build && npm run lint`


## 2026-10-13T16:16:40Z

Số hóa toàn diện phân hệ Sản xuất & Nhật ký canh tác kết hợp phân hệ Thu hoạch & Truy xuất nguồn gốc cho HTX Nông nghiệp Tân Tiến (Ớt chuông Sweet Palermo Đỏ Đà Lạt), tích hợp dữ liệu liên thông xuyên suốt giữa Xã viên, Vùng trồng, Kho vật tư, Kiểm soát an toàn PHI (Pre-Harvest Interval), KCS 3 cấp, Mã lô GS1 và Mã QR công khai truy xuất nguồn gốc theo Thông tư 02/2024/TT-BNNPTNT.

Working directory: f:\HTX_OCOP_PROJECT
Integrity mode: development

Requested team: Full multi-agent team (Backend DDD, Frontend Farmer UX, QA & Verification)
Directive: Thực hiện atomic commits cho các mốc chức năng quan trọng (Production, Farming Logs, Harvest, KCS, GS1 QR Traceability).

## Requirements

### R1. Phân hệ Sản xuất & Nhật ký Canh tác Chuẩn Thông tư 02/2024/TT-BNNPTNT
- Quản lý phân cấp: Hợp tác xã (`Cooperative`) → Vùng trồng (`ProductionUnit`, Mã PUC) → Thửa đất (`FarmPlot`, mã `PLOT-[HTX]-[MaXaVien]-[STT]`, tọa độ GPS, diện tích) → Mùa vụ (`CropSeason`: Kế hoạch, Đang canh tác, Hoàn thành, Hủy).
- Nhật ký canh tác điện tử (`FarmingLog`) ghi nhận đủ 10 trường quy chuẩn TT02/2024: hoạt động, thời gian thực hiện, mã thửa đất, mã mùa vụ, SKU vật tư, số lô vật tư, liều lượng/khối lượng, số ngày PHI, GPS tọa độ, hình ảnh thực tế đính kèm.
- Cơ chế bảo vệ an toàn PHI Guard (Pre-Harvest Interval): Tự động tính `safe_harvest_date = spray_date + PHI_days` khi có nhật ký phun thuốc BVTV, tự động chuyển thửa đất sang `IN_QUARANTINE`.

### R2. Phân hệ Thu hoạch & Kiểm soát Chất lượng KCS 3 Cấp
- Lệnh thu hoạch và chốt chặn an toàn: Hệ thống **chặn hoàn toàn** lệnh thu hoạch nếu `harvest_date < safe_harvest_date` (Error code `ERR_HARVEST_PHI_VIOLATION`), tuyệt đối không cho phép bù trừ hoặc ghi đè.
- Quy trình KCS 3 cấp:
  1. *Gate Check*: Kiểm tra mã lệnh, đối soát PHI và nguồn gốc thửa đất.
  2. *Quick Lab*: Kiểm tra dư lượng thuốc BVTV/hóa chất cấm (`LAB_PASSED` / `LAB_REJECTED`).
  3. *Grading*: Phân loại chất lượng nông sản (Grade A: Premium $\ge 90\%$ đồng đều, Brix $\ge 7^\circ$; Grade B: Standard; Reject: Không đạt an toàn).

### R3. Định danh Lô hàng GS1 & Trang Tra cứu Truy xuất Nguồn gốc QR Công khai
- Quy chuẩn định danh mã lô thu hoạch theo chuẩn GS1: `LOT-[CoopCode]-[PlotCode]-[YYYYMMDD]-[Seq]`.
- Trang công khai Tra cứu Truy xuất Nguồn gốc (Public Traceability View) hoạt động tại route không yêu cầu đăng nhập (`/trace/:lotId` hoặc `/public/trace/:lotId`): Quét mã QR hiển thị đầy đủ thông tin HTX Tân Tiến, mã PUC, ớt chuông Sweet Palermo, hành trình canh tác, kết quả kiểm nghiệm KCS, chứng nhận VietGAP, bản đồ định vị thửa đất.

### R4. Tích hợp Liên thông Nghiệp vụ Toàn Hệ thống
- **Liên kết Kho Vật tư**: Kiểm soát xuất nợ đầu vụ (Credit Advance), đối soát số lượng vật tư sử dụng trong nhật ký so với phiếu xuất kho cho xã viên.
- **Liên kết Tài chính & Thu mua**: Tự động tổng hợp sản lượng Grade A / Grade B để cấn trừ công nợ vật tư đầu vụ và lập phiếu chi/thanh toán thực trả cho xã viên.
- **Liên kết OCOP**: Trích xuất tự động dữ liệu vùng trồng, nhật ký canh tác tuân thủ PHI và hợp đồng thu mua làm minh chứng số (SHA-256) cho hồ sơ OCOP.

### R5. Tối ưu Giao diện Frontend Thân thiện & Dễ thao tác cho Nông dân (Farmer UX)
- Màn hình ghi nhận nhật ký canh tác nhanh (Quick Mobile Logging): Các nút bấm to rõ ($\ge 48\text{px}$), hỗ trợ chọn việc 1 chạm (Làm đất, Bón phân, Phun thuốc, Chăm sóc, Thu hoạch), chọn nhanh vật tư, tự động điền tọa độ GPS, chụp ảnh từ camera.
- Màn hình Vùng trồng & Mùa vụ: Hiển thị trực quan trạng thái thửa đất (Xanh: Đang canh tác, Đỏ/Cam: Đang cách ly PHI kèm đồng hồ đếm ngược ngày an toàn, Xám: Đang nghỉ vụ).
- Màn hình Thu hoạch & Phân loại KCS: Thao tác nhập kết quả test lab và phân hạng Grade A/B rõ ràng, nút in tem nhãn có mã QR truy xuất.

## Acceptance Criteria

### Tính Đúng đắn & Toàn vẹn Dữ liệu Nghiệp vụ
- [ ] Backend chặn 100% mọi nỗ lực tạo lệnh thu hoạch khi thửa đất chưa hết ngày cách ly PHI (`ERR_HARVEST_PHI_VIOLATION`).
- [ ] Nhật ký canh tác lưu trữ và trả về đầy đủ 10 trường Thông tư 02/2024/TT-BNNPTNT.
- [ ] Mã lô thu hoạch sinh tự động đúng quy chuẩn GS1: `LOT-TT-[PlotCode]-[YYYYMMDD]-[Seq]`.
- [ ] Quy trình KCS 3 cấp (Gate Check → Quick Lab → Grading) chuyển trạng thái chính xác và tính sản lượng Grade A / B chuẩn xác.

### Liên thông & Tra cứu Công khai
- [ ] Quét hoặc truy cập URL mã QR công khai (`/trace/:lotId` hoặc `/public/trace/:lotId`) hiển thị đầy đủ hồ sơ nguồn gốc sản phẩm mà không bị chặn bởi Auth middleware.
- [ ] Dữ liệu thu hoạch liên thông đồng bộ sang Phiếu thu mua / Công nợ của xã viên trong module Tài chính và liên kết minh chứng OCOP.

### Trải nghiệm Frontend Nông dân & Kiểm thử
- [ ] Giao diện các trang `FarmPlotsPage`, `CropSeasonsPage`, `FarmingLogsPage`, `HarvestsPage`, `LotTraceabilityPage` được thiết kế mới mẻ, hiện đại, tối ưu cho thao tác nông dân trên di động/máy tính bảng.
- [ ] Toàn bộ Backend test suites (`php artisan test`) và Frontend build/lint (`npm run build`, `npm run lint`) chạy thành công 100%, không phát sinh lỗi.

## Verification Resources
- Nhánh Git làm việc: `feature/production-farming-harvest-traceability`
- Tài liệu quy chuẩn: `docs/31_FARMING_WORKFLOW.md`, `AGENT.md` (mục 11.1), `docs/10_DOMAIN_MODEL.md`, `docs/11_DATABASE_DESIGN_FINAL.md`.
- Lệnh kiểm tra xác thực:
  - Backend: `php artisan test --filter=Agriculture` và `php artisan test --filter=CropSeason`
  - Frontend: `npm run build && npm run lint`
