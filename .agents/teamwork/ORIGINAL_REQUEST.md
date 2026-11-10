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


## 2026-10-31T14:46:05Z

# Báo cáo Đánh giá & Thiết kế Toàn diện Hệ thống HTX-OCOP (Teamwork Project Prompt)

> Status: Launched  
> Goal: Triển khai kiểm toán toàn diện & lập Báo cáo Thiết kế Kiến trúc (Blueprint Matrix)  
> Requested team: Full multi-agent team (Chuyên gia Nghiệp vụ HTX & OCOP, Kiến trúc sư Giao diện DDD/Taste-Skill, Kỹ sư Backend Laravel/PostgreSQL, Chuyên gia GIS/Viễn thám Nông nghiệp)

Đánh giá toàn diện kiến trúc 9 Modules nghiệp vụ DDD của dự án HTX-OCOP trên 3 tầng (Tài liệu đặc tả, Backend Laravel 11 và Frontend React/TypeScript): Xác định chức năng, cơ sở dữ liệu, vai trò và luồng xử lý của từng nghiệp vụ; chuẩn hóa kiến trúc giao diện (bảng, tab, modal, drawer, thẻ KPI, biểu đồ trực quan, luồng điều hướng liền mạch, chống rối loạn thông tin); kiểm chứng thực tế mã QR GS1 & tính năng xuất dữ liệu (Excel/PDF); phân tích khoảng cách thừa/thiếu/trùng lặp; đánh giá tích hợp công nghệ vệ tinh viễn thám (Sentinel-2/Landsat theo dõi NDVI & ranh giới PUC); và xác lập ma trận kiểm thử nghiêm ngặt bằng dữ liệu thực.

Working directory: f:/HTX_OCOP_PROJECT
Integrity mode: development

---

## Requirements

### R1. Ma trận Nghiệp vụ & Cơ sở Dữ liệu Chi tiết cho 9 Modules DDD
Đọc và đối chiếu toàn bộ các tài liệu gốc (`README.md`, `AGENT.md`, `docs/00_RULES_REGISTER.md`, `docs/06_BUSINESS_RULES.md`, `docs/11_DATABASE_DESIGN.md`, `docs/12_API_SPECIFICATION.md`, các tài liệu quy trình chuyên sâu `docs/30–40`):
1. **Phân tích từng phân hệ nghiệp vụ:**
   - **Identity & Access Management:** Quản lý người dùng, 7 vai trò chuẩn (HTX_OWNER, ACCOUNTANT, STOREKEEPER, INSPECTOR, EVALUATOR, OCOP_PREPARER, SYSTEM_ADMIN), ma trận phân quyền RBAC và phân tách trách nhiệm (Separation of Duties - SoD).
   - **Cooperative & Governance:** Hồ sơ pháp lý HTX, Đại hội thành viên, nghị quyết, biểu quyết tỷ lệ vốn và nhân thân theo Luật HTX 2023.
   - **Member & Equity Management:** Phân loại xã viên (Chính thức, Liên kết, Chờ duyệt), sổ theo dõi vốn góp điều lệ, cấp giấy chứng nhận phần vốn góp, góp quyền sử dụng đất canh tác, quy trình thôi thành viên không xóa cứng (Soft-delete).
   - **Agriculture & Production:** Quản trị vùng trồng, mã số vùng trồng PUC Cục BVTV, phân lô thửa đất, mùa vụ (Đang sản xuất, Đã đóng, Lập kế hoạch), giống cây trồng danh mục Bộ NN&PTNT.
   - **Farming Log & PHI Safety:** Nhật ký canh tác VietGAP (TCVN 11892-1:2017), theo dõi vật tư sử dụng, cơ chế tự động khóa thu hoạch an toàn PHI (`safe_harvest_date = activity_date + phi_days`).
   - **Harvest, KCS & GS1 Lots:** Thu hoạch phân loại Grade A (Premium), Grade B, Reject; kiểm nghiệm nhanh dư lượng Quick Lab; sinh mã định danh và tem QR chuẩn GS1 Traceability (`LOT-[CoopCode]-[PlotCode]-[YYYYMMDD]-[Seq]`).
   - **Inventory & FEFO Batches:** Quản trị 3 kho (Vật tư, Kho lạnh nông sản 8–10°C, Kho bao bì), phiếu nhập/xuất kho, quản lý lô vật tư theo nguyên tắc FEFO (Cảnh báo cận date $\le 30$ ngày, khóa xuất lô hết hạn).
   - **Finance & Surplus Distribution:** Sổ quỹ tiền mặt và ngân hàng, theo dõi công nợ 5 dải tuổi (Aging), kế hoạch phân phối lợi nhuận hàng năm theo Luật HTX 2023 (Trích quỹ chung không chia $\ge 20\%$, chia theo sử dụng dịch vụ $\ge 50\%$, chia theo vốn góp).
   - **OCOP Dossier & Evaluation:** Quản lý hồ sơ OCOP theo Quyết định 148/QĐ-TTg & 1489/QĐ-TTg, bộ tiêu chí đánh giá phân hạng (Phần A, B, C), minh chứng số hóa, tự chấm điểm và chấm điểm Hội đồng thẩm định cấp huyện/tỉnh.
2. **Ánh xạ CSDL & Ràng buộc toàn vẹn:**
   - Liệt kê toàn bộ các bảng trong PostgreSQL thuộc từng module, các trường dữ liệu bắt buộc, quan hệ khóa ngoại, cơ chế cô lập đa người thuê (`cooperative_id`) và chuỗi kiểm toán SHA-256 (`audit_events`).

### R2. Thiết kế Kiến trúc Giao diện Chuẩn mực, Luồng Điều Hướng & Chống Rối Loạn Dữ Liệu
Thiết kế cấu trúc giao diện trực quan, rõ ràng cho người dùng (Cán bộ HTX, Kế toán, Thủ kho, Xã viên ngoài đồng, Hội đồng OCOP):
1. **Quy chuẩn bố cục màn hình (Layout Standard):**
   - **Khi nào dùng Bảng (Table):** Dữ liệu dạng danh sách có nhiều thuộc tính cần so sánh, tìm kiếm, lọc đa tiêu chí, phân trang server-side.
   - **Khi nào dùng Ngăn kéo (Drawer):** Xem nhanh chi tiết hồ sơ (như xem chi tiết xã viên, chi tiết thửa đất, lịch sử canh tác của thửa) mà không làm mất ngữ cảnh bảng dữ liệu chính.
   - **Khi nào dùng Hộp thoại (Modal):** Các thao tác nhập liệu tập trung, có xác thực biểu mẫu (Thêm xã viên, Ghi nhật ký VietGAP, Tạo lệnh thu hoạch, Nhập/xuất kho).
   - **Phân chia Tabs theo vòng đời nghiệp vụ:** Phân tách rạch ròi dữ liệu Hiện tại (`ACTIVE` / `IN_PROGRESS`) với dữ liệu Quá khứ (`COMPLETED` / `CLOSED` / `ARCHIVED`), gắn nhãn Read-only cho dữ liệu đã chốt sổ.
2. **Trực quan hóa & Định lượng Chỉ số (KPIs & Charts):**
   - Xác định rõ màn hình nào cần hàng thẻ KPI (Ví dụ: Trang Thu hoạch cần 4 thẻ: Tổng sản lượng, Tỷ lệ Grade A, Số lô GS1, Trạng thái KCS; Trang Tài chính cần 4 thẻ: Quỹ tiền mặt, Quỹ ngân hàng, Phải thu, Phải trả).
   - Xác định rõ biểu đồ cần thiết (Biểu đồ tuổi nợ 5 bậc tại trang Tài chính, Biểu đồ cơ cấu sản phẩm OCOP, Biểu đồ phân bổ diện tích vùng trồng); cấm vẽ biểu đồ hình thức gây rối mắt.
3. **Xử lý trạng thái dữ liệu trung thực (Truthful States):**
   - Bắt buộc có 4 trạng thái: Loading Skeleton, Empty State (kèm nút bấm 1 chạm "Đặt lại bộ lọc"), Error Toast có mã lỗi cụ thể, Success Toast. Cấm dùng silent mock data ở runtime.
   - Xử lý xung đột và khóa dòng (`lockForUpdate` / Idempotency) khi duyệt chứng từ tài chính hoặc trừ tồn kho.

### R3. Kiểm chứng Thực tế Truy Xuất Nguồn Gốc GS1 & Kết Xuất Báo Cáo
1. **Kiểm toán Mã QR & Chuỗi Truy xuất GS1 (TCVN 12850:2019):**
   - Xác thực endpoint công khai `/api/v1/public/trace/{lot_code}` và giao diện `/public/trace/:lotId`.
   - Kiểm tra hiển thị đầy đủ: Thông tin nông sản OCOP, HTX sản xuất, Mã số vùng trồng PUC, Thửa đất & Tọa độ GPS, Dòng thời gian 5 chặng canh tác (Làm đất $\rightarrow$ Bón phân $\rightarrow$ Chăm sóc sinh học & PHI $\rightarrow$ Thu hoạch $\rightarrow$ KCS cấp mã), Kết quả kiểm nghiệm Lab (PPM dư lượng, độ ngọt Brix), và Mã băm toàn vẹn SHA-256.
2. **Kiểm toán Kết xuất Báo cáo (Export Capabilities):**
   - Rà soát toàn bộ chức năng xuất Excel (.xlsx) từ server và client: Sổ thành viên, Sổ quỹ, Sổ theo dõi công nợ, Báo cáo vật tư tồn kho, Nhật ký canh tác VietGAP.
   - Rà soát chức năng xuất chứng từ PDF: Phiếu thu/chi có đầy đủ chữ ký kế toán/thủ quỹ, Giấy chứng nhận phần vốn góp xã viên, Hồ sơ minh chứng OCOP.

### R4. Phân tích Khoảng cách Hiện trạng (Gap Analysis) & Đánh giá Nhu cầu Vệ tinh Viễn thám
1. **So sánh Đối chiếu Frontend vs Backend vs Tài liệu:**
   - Liệt kê các thành phần Frontend đang dư thừa hoặc thiếu kết nối backend (Tính năng ma, nút bấm chưa có handler).
   - Liệt kê các API Backend đã xây dựng nhưng chưa được khai thác trên Frontend (như API phân phối lợi nhuận, báo cáo động, API kiểm định chuỗi hash SHA-256).
   - Khắc phục triệt để sự trùng lặp component hoặc logic tính toán không đồng nhất.
2. **Đánh giá Nhu cầu Tích hợp Vệ tinh Viễn thám (Satellite Remote Sensing):**
   - Phân tích sự cần thiết của dữ liệu vệ tinh trong Nông nghiệp Thông minh:
     - **Chỉ số thực vật NDVI (Normalized Difference Vegetation Index):** Sử dụng ảnh vệ tinh quang học Sentinel-2 (chu kỳ 5 ngày, độ phân giải 10m miễn phí từ Copernicus ESA) để đánh giá sức khỏe tán lá, phát hiện sớm sâu bệnh và vùng cây thiếu dinh dưỡng.
     - **Độ ẩm bề mặt đất (Soil Moisture):** Hỗ trợ dự báo hạn hán và tối ưu lịch tưới tiêu tự động.
     - **Xác thực ranh giới đa giác (Polygon Validation):** Đối chiếu tọa độ thực địa của HTX với lớp bản đồ vệ tinh để ngăn chặn gian lận mã số vùng trồng PUC (cấp trùng lặp hoặc khai khống diện tích).
   - Đưa ra kiến trúc kỹ thuật đề xuất: Tích hợp Google Earth Engine API / Sentinel Hub API theo cơ chế Batch Job xử lý định kỳ, không làm chậm giao diện người dùng.

### R5. Lộ trình Đồng bộ Backend, Hợp đồng Dữ liệu & Ma trận Kiểm thử
1. **Kế hoạch Bổ sung Backend:**
   - Hoàn thiện các Controller, Service, Request, Resource còn thiếu.
   - Bổ sung các ràng buộc bảo mật: Phân tách trách nhiệm (SoD), Kiểm tra Tenant Scope trên toàn bộ truy vấn, ghi log kiểm toán tamper-evident.
2. **Ma trận Kiểm thử Toàn diện (Verification Matrix):**
   - Bộ kịch bản kiểm thử tự động trên PHPUnit (Backend) và Playwright (Frontend E2E).
   - Kiểm thử các ca biên: Thu hoạch vi phạm PHI, Chi tiền vượt tồn quỹ, Xuất kho vật tư hết hạn FEFO, Truy cập trái phép tài nguyên HTX khác.

---

## Acceptance Criteria

### Tính Đầy Đủ & Khách Quan
- [ ] Báo cáo phân tích bao quát trọn vẹn 9 Modules DDD và hơn 30 bảng CSDL trong PostgreSQL.
- [ ] Mọi nhận định về khoảng cách (Gaps) phải dẫn chiếu mã nguồn cụ thể (tên tệp, dòng mã, endpoint API).

### Khả Năng Vận Hành Giao Diện & Trải Nghiệm
- [ ] Toàn bộ các bảng dữ liệu trên Frontend có đầy đủ: Cột dữ liệu chuẩn, Bộ lọc động, Trạng thái rỗng chân thực, Nút phân trang và Nút hoàn tác tìm kiếm.
- [ ] Các màn hình có sự phân định rõ ràng giữa Bảng, Drawer xem chi tiết và Modal nhập liệu, không để bảng dữ liệu vượt ngưỡng hiển thị rối mắt.
- [ ] Thẻ KPI và biểu đồ chỉ xuất hiện ở các vị trí có giá trị quản trị thực sự.

### Tính Xác Thực của QR GS1 & Kết Xuất
- [ ] Mã QR GS1 và API truy xuất nguồn gốc trả về dữ liệu thật 100% từ database cho các sản phẩm OCOP chính.
- [ ] Các file Excel và PDF xuất ra đảm bảo định dạng chuyên nghiệp, hiển thị font tiếng Việt chuẩn và đúng thể thức văn bản quản lý HTX.

### Tính Khả Thi của Giải Pháp Vệ Tinh
- [ ] Đề xuất tích hợp vệ tinh có lộ trình phân kỳ rõ ràng (Giai đoạn 1: GIS Polygon thực địa $\rightarrow$ Giai đoạn 2: Sentinel-2 NDVI API), ước tính chi phí và giải pháp kỹ thuật tối ưu.

### Tính Sẵn Sàng Triển Khai
- [ ] Danh mục công việc (Task Backlog) được phân nhóm ưu tiên rõ ràng (P0, P1, P2) để sẵn sàng chuyển sang giai đoạn thực thi code có kiểm soát.


## 2026-11-02T16:11:34Z

Thực hiện vòng lặp đánh giá toàn diện giao diện và trải nghiệm người dùng (UI/UX) cho Hệ thống Quản lý HTX-OCOP theo chu trình cuốn chiếu từng phân hệ nghiệp vụ (bắt đầu từ Phân hệ Quản trị HTX & Xã viên); rà soát chỉ rõ các chức năng và component trùng lặp, nhận xét các tab/màn hình xem chi tiết (Detail Drawer/Modal) đang nhồi nhét thông tin dư thừa; đóng vai trò người dùng thực tế nhập liệu để kiểm thử validation khi thiếu dữ liệu, kiểm chứng tính toàn vẹn trong Database và đánh giá bố cục chuẩn hóa dành cho người nông dân/xã viên không rành công nghệ.

Working directory: f:/HTX_OCOP_PROJECT
Integrity mode: development

## Requirements

### R1. Rà soát thành phần trùng lặp & Màn hình chi tiết dư thừa (Duplicate & Detail Bloat Audit)
- Kiểm tra toàn diện mã nguồn giao diện để phát hiện các màn hình, nút bấm hoặc component đang bị hiển thị hoặc cấu hình lặp lại (ví dụ giữa Drawer xem nhanh và Modal chỉnh sửa, hoặc các trường lặp giữa trang danh sách và trang chi tiết).
- Rà soát từng màn hình xem chi tiết (Detail Drawer/Modal), đánh giá xem có đang hiển thị quá nhiều thông tin không cần thiết mà tab đó đáng lẽ không nên có hay không, chỉ rõ thông tin nào nên giữ, thông tin nào gây rối mắt cần lược bỏ.

### R2. Vòng lặp kiểm thử nghiệp vụ theo từng phân hệ cuốn chiếu (Iterative Module-by-Module Audit)
- Triển khai theo quy trình cuốn chiếu từng phân hệ một (bắt đầu từ Phân hệ 1: Quản trị HTX & Xã viên bao gồm Hồ sơ pháp lý, Xã viên, Đại hội biểu quyết, Sổ vốn điều lệ, Phân phối thặng dư).
- Với mỗi nghiệp vụ trong phân hệ:
  - Liệt kê đầy đủ các chức năng cụ thể từ Backend (API route, controller, request validation, policy) tới Frontend (page, table, drawer, modal, actions).
  - Đánh giá tính đầy đủ và vị trí đặt của các thao tác CRUD cơ bản (Thêm, Xóa, Sửa, Xem chi tiết).
  - Mô tả chính xác cơ chế hoạt động và luồng dữ liệu của chức năng đó.

### R3. Đóng vai trò người dùng nhập liệu thực tế & Đối chiếu Database (Live Persona Data Entry & DB Integrity Check)
- Đóng vai trò người dùng thực tế (xã viên, kế toán, cán bộ kỹ thuật nông nghiệp) thao tác nhập dữ liệu:
  - Kiểm thử nghiêm ngặt các trường hợp nhập thiếu dữ liệu bắt buộc, dữ liệu sai định dạng, dữ liệu vượt ngưỡng nghiệp vụ (validation, alert, toast phản hồi).
  - Không chỉ dùng các bài test tự động suông mà trực tiếp kiểm chứng sự thay đổi của dữ liệu và các ràng buộc toàn vẹn trong CSDL PostgreSQL (trạng thái bản ghi, số dư, khóa logic soft-delete, audit hash SHA-256).

### R4. Chuẩn hóa bố cục và tối ưu tính khả dụng cho nông dân (Agricultural UX & Layout Polish)
- Đánh giá cách tổ chức giao diện dưới góc nhìn của người dùng nông thôn, nông dân và cán bộ HTX cơ sở (những người không rành về công nghệ).
- Xác định xem bố cục đã trực quan, dễ thao tác hay chưa; phát hiện các thao tác hoặc thành phần đang thừa thãi, rườm rà làm phức tạp hóa trải nghiệm.
- Đưa ra đề xuất cải tiến và giải pháp tái cấu trúc cụ thể cho từng màn hình.

## Acceptance Criteria

### Audit & Detection Quality
- [ ] Báo cáo liệt kê chính xác tên và đường dẫn file của các component/modal/drawer đang bị trùng lặp chức năng hoặc xung đột vai trò hiển thị.
- [ ] Chỉ ra chi tiết từng trường dữ liệu hoặc khối thông tin đang bị hiển thị thừa trong các giao diện xem chi tiết, kèm kiến nghị giữ lại hoặc loại bỏ.

### Module Coverage & CRUD Verification
- [ ] Phân hệ Quản trị HTX & Xã viên được phân tích toàn diện 100% với cấu trúc 6 bước: (1) Danh mục chức năng BE/FE → (2) Ma trận kiểm tra CRUD → (3) Cơ chế hoạt động luồng dữ liệu → (4) Kiểm thử thiếu/sai dữ liệu nhập → (5) Đối chiếu trạng thái CSDL thực tế → (6) Đánh giá tính khả dụng UX cho nông dân.
- [ ] Xác định rõ các vị trí đã có hoặc còn thiếu chức năng Thêm, Xóa, Sửa, Xem chi tiết kèm đánh giá mức độ cần thiết.

### Live Validation & Database Proof
- [ ] Có bằng chứng kiểm thử nhập liệu thực tế mô phỏng người dùng với ít nhất 3 kịch bản cho mỗi nghiệp vụ: Thành công (Positive), Bỏ trống trường bắt buộc (Missing data validation), Dữ liệu vi phạm biên nghiệp vụ (Business constraint failure).
- [ ] Xác nhận tính toàn vẹn dữ liệu trong cơ sở dữ liệu PostgreSQL sau mỗi thao tác kiểm thử.

### Actionable UX Layout Report
- [ ] Báo cáo đánh giá bố cục giao diện với các tiêu chí: số bước thao tác, độ rõ ràng của nhãn tiếng Việt, cảnh báo lỗi dễ hiểu và mức độ thân thiện với người không rành công nghệ.
