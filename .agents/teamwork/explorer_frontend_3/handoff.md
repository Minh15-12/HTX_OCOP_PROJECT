# BÁO CÁO KHẢO SÁT TOÀN DIỆN KIẾN TRÚC FRONTEND REACT / TYPESCRIPT, THÀNH PHẦN GIAO DIỆN & TRẢI NGHIỆM NGƯỜI DÙNG (HTX-OCOP)

> **Agent thực hiện:** Explorer Frontend (`explorer_frontend_3`)  
> **Thời điểm khảo sát:** 2026-10-31  
> **Thư mục làm việc:** `f:/HTX_OCOP_PROJECT/.agents/teamwork/explorer_frontend_3`  
> **Căn cứ kim chỉ nam:** `AGENT.md`, `docs/00_RULES_REGISTER.md`, `docs/06_BUSINESS_RULES.md`, `ORIGINAL_REQUEST.md`, toàn bộ mã nguồn frontend tại `frontend/src/`.

---

## 1. OBSERVATION (QUAN SÁT THỰC TẾ TRỰC TIẾP TỪ MÃ NGUỒN)

### 1.1. Tiêu chuẩn Bố cục Màn hình & Luồng Điều hướng (Table vs Drawer vs Modal & Tab Lifecycle)

Hệ thống frontend React 18 + TypeScript + Vite (`frontend/src/`) hiện có **28 trang nghiệp vụ** (`*Page.tsx`) được tổ chức theo cấu trúc tính năng (`features/`), được cấu hình định tuyến tập trung tại `frontend/src/router/AppRoutes.tsx` và phân quyền RBAC tại `frontend/src/router/navigation.ts`.

#### A. Ma trận sử dụng Bảng (Table), Ngăn kéo (Drawer) và Hộp thoại (Modal) qua 28 Màn hình:

| Màn hình (Page Path) | Bảng dữ liệu chính (Table) | Ngăn kéo chi tiết (Drawer) | Hộp thoại thao tác (Modal) | Đánh giá kiến trúc UX |
| :--- | :--- | :--- | :--- | :--- |
| **1. Bàn làm việc tổng quan** (`/dashboard` - `DashboardPage.tsx`) | Bảng tiến độ OCOP inline (`DashboardOcopBreakdown.tsx`) | Không có | `QuickActionTaskModal.tsx` | Đạt chuẩn Dashboard điều hành. |
| **2. Hồ sơ pháp lý HTX** (`/cooperative` - `CoopProfilePage.tsx`) | Bảng cơ cấu tổ chức & người đại diện | Không có | `CoopProfileEditModal.tsx` | Bố cục dạng thẻ hồ sơ (Profile Card) phù hợp. |
| **3. Quản lý Xã viên** (`/members` - `MembersPage.tsx`) | `MembersTable.tsx` | `MemberDrawer.tsx` (6 tabs chi tiết) | `MemberEditModal`, `MemberWizard`, `MemberStatusModals`, `MemberTerminationCheckModal` | **Mẫu chuẩn vàng (Golden Standard)**: Table phân trang + Drawer xem chi tiết không rời trang + Modal xác thực. |
| **4. Đại hội & Biểu quyết** (`/meetings` - `MeetingsPage.tsx`) | `MeetingsTable.tsx` | `MeetingDetailDrawer.tsx` | `CreateMeetingModal.tsx`, `CastVoteModal.tsx` | Đúng chuẩn phân tách danh sách, xem nghị quyết và bỏ phiếu. |
| **5. Sổ vốn điều lệ** (`/capital` - `CapitalPage.tsx`) | `CapitalMembersTab.tsx`, `LandContributionsTab.tsx` | `CapitalMemberDrawer.tsx` | `CapitalRecordModal`, `LandContributionModal`, `CapitalCertificateModal`, `CapitalVoucherModal` | Đầy đủ bảng vốn tiền mặt, vốn đất và in chứng từ. |
| **6. Phân phối thặng dư** (`/profit-distribution` - `ProfitPage.tsx`) | `ProfitAllocationTable.tsx` | Không có | `CreateSurplusPlanModal.tsx`, `SurplusVoucherPrintModal.tsx` | Chuẩn bảng trích lập 4 quỹ và phân chia lợi nhuận theo Luật HTX 2023. |
| **7. Vùng trồng & Thửa đất** (`/agriculture/plots` - `FarmPlotsPage.tsx`) | `FarmPlotsFullTable.tsx`, `ProductionUnitsTable.tsx` | `FarmPlotDrawer.tsx` | `AddFarmPlotModal`, `EditFarmPlotModal`, `DeletePlotModal`, `PlotAssignmentModal`, `ProductionUnitModal` | Bảng kết hợp Bản đồ GIS (`FarmPlotMapView`), Drawer xem lịch sử thửa, Modal nhập liệu. |
| **8. Kế hoạch Mùa vụ** (`/agriculture/seasons` - `CropSeasonsPage.tsx`) | `CropSeasonsTable.tsx`, `CropsTab.tsx` | `CropSeasonDrawer.tsx` | `CropSeasonModal.tsx`, `CloseSeasonModal.tsx`, `CropModal.tsx` | Có Scope Switcher phân tách vụ đang làm và vụ đã chốt. |
| **9. Tác nghiệp ngoài đồng** (`/agriculture/field-entry` - `FieldLogEntryPage.tsx`) | Không có | Không có | `QuickMobileLogModal.tsx` | Giao diện nút bấm to bản tối ưu Mobile/Tablet cho nông dân. |
| **10. Nhật ký canh tác & PHI** (`/agriculture/logs` - `FarmingLogsPage.tsx`) | `FarmingLogsTable.tsx`, `PhiSafetyMonitorTab.tsx` | `FarmingLogDetailPanel.tsx` (Split-View) | `FarmingLogDetailModal`, `EditFarmingLogModal`, `DeleteFarmingLogModal` | Hỗ trợ 2 chế độ: Bảng đầy đủ (Full Table) và Màn hình chia đôi (Master-Detail Split View). |
| **11. Thu hoạch & Lô tem GS1** (`/agriculture/harvests` - `HarvestsPage.tsx`) | `HarvestsTable.tsx` | `HarvestDrawer.tsx` | `KcsHarvestModal`, `EditHarvestModal`, `DeleteHarvestModal`, `HarvestLabelPrintModal` | Quản lý lệnh thu hoạch, KCS 3 cấp và in tem mã vạch GS1. |
| **12. Truy xuất lô hàng HTX** (`/agriculture/lots/:id/traceability` - `LotTraceabilityPage.tsx`) | Bảng công đoạn canh tác | Không có | Không có | Màn hình tra cứu nội bộ chuyên sâu. |
| **13. Truy xuất QR công khai** (`/trace/:lotId` - `PublicTraceabilityPage.tsx`) | Dòng thời gian 5 chặng canh tác | Không có | Không có | Giao diện Responsive không cần đăng nhập cho người tiêu dùng. |
| **14. Sản phẩm OCOP** (`/inventory/products` - `ProductsPage.tsx`) | Dạng thẻ `ProductCard.tsx` + Bảng phân trang | `ProductDrawer.tsx` | `CreateProductModal.tsx`, `AttachLotModal.tsx` | Quản lý sản phẩm OCOP gắn liền mã lô và phân hạng sao. |
| **15. Vật tư & Kho hàng** (`/inventory/materials` - `MaterialsPage.tsx`) | `MaterialsTable`, `MaterialBatchesTable`, `StockReceiptsTable`, `StockIssuesTable`, `StockCountsTable` | `MaterialDrawer.tsx`, `StockReceiptDrawer.tsx` | `MaterialFormModal`, `StockMoveModal`, `WarehouseManagementModal` | Quản trị 5 tab: Danh mục vật tư, Lô hạn dùng FEFO, Nhập kho, Xuất kho, Kiểm kê. |
| **16. Bộ Tiêu chí OCOP** (`/ocop/criteria` - `CriteriaPage.tsx`) | Danh mục cây tiêu chí QĐ 148 (`CriteriaGroupCard.tsx`) | Không có | `Qd148DocumentModal.tsx` | Trình diễn cây tiêu chí 3 Phần (A: 40đ, B: 25đ, C: 35đ). |
| **17. Danh sách Hồ sơ OCOP** (`/ocop/dossiers` - `DossiersPage.tsx`) | `DossiersTable.tsx` | `DossierQuickPreviewDrawer.tsx` | Không có | Bảng quản lý hồ sơ kèm Drawer xem tóm tắt tiến độ. |
| **18. Chi tiết Hồ sơ OCOP** (`/ocop/dossiers/:id` - `DossierDetailPage.tsx`) | Bảng tiêu chí tự chấm & minh chứng | Không có | Không có | Chia 6 tabs: Tổng quan, Biểu số 01/02/03, Tự chấm điểm, Kho minh chứng, Hội đồng, Trình duyệt. |
| **19. Wizard tạo hồ sơ OCOP** (`/ocop/dossiers/new` - `CreateDossierWizardPage.tsx`) | Không có | Không có | Dạng luồng Stepper 6 bước toàn trang | Hướng dẫn nông dân từ chọn sản phẩm đến nộp hồ sơ. |
| **20. Kho Minh chứng số** (`/ocop/evidences` - `EvidencesPage.tsx`) | `EvidencesTable.tsx` | `EvidencePreviewDrawer.tsx` | `AddEvidenceModal.tsx` | Quản lý tệp đính kèm, mã băm SHA-256 và liên kết chỉ tiêu. |
| **21. Hội đồng thẩm định** (`/ocop/evaluation` - `EvaluationsPage.tsx`) | Bảng phiên chấm điểm, bảng tổng hợp điểm | Không có | `CreateEvaluationSessionModal.tsx`, `AssignEvaluatorsModal.tsx` | Phân vai trò Chủ tịch hội đồng, Tổ thư ký và Giám khảo. |
| **22. Quyết định & Cấp sao** (`/ocop/decisions` - `DecisionsPage.tsx`) | Bảng quyết định công nhận OCOP | Không có | `DecisionDetailModal.tsx`, `IssueDecisionModal.tsx` | Quản lý quyết định cấp sao của UBND cấp huyện/tỉnh. |
| **23. Báo cáo OCOP** (`/ocop/reports` - `OcopReportsPage.tsx`) | Bảng sản phẩm OCOP tiêu biểu | Không có | Không có | Trang phân tích biểu đồ tổng hợp OCOP. |
| **24. Sổ quỹ & Quyết toán** (`/finance` - `FinancePage.tsx`) | Bảng phiếu thu/chi, bảng công nợ, bảng quyết toán | `CashTransactionDrawer.tsx`, `DebtDrawer.tsx` | `CashTransactionModal`, `DebtSettlementModal`, `SeasonSettlementModal`, `VoucherPrintModal` | Quản lý sổ quỹ tiền mặt, tiền gửi, công nợ và quyết toán mùa vụ. |
| **25. Báo cáo quản trị** (`/reports` - `ReportsPage.tsx`) | Bảng xuất báo cáo 4 phân hệ | Không có | Không có | Báo cáo Sổ thành viên, Sổ quỹ, VietGAP và OCOP. |
| **26. Nhật ký kiểm toán** (`/audit` - `AuditPage.tsx`) | Bảng nhật ký sự kiện hệ thống | `AuditLogDrawer.tsx` | `VerifyChainModal.tsx` | Kiểm toán chuỗi hash SHA-256 tamper-evident. |
| **27. Cài đặt hệ thống** (`/system/settings` - `SystemSettingsPage.tsx`) | Bảng tài khoản người dùng, Ma trận phân quyền | Không có | `UserModal.tsx` | Quản trị Tenant, cấu hình vận hành và phân quyền RBAC. |
| **28. Đăng nhập** (`/auth/login` - `LoginPage.tsx`) | Không có | Không có | Không có | Xác thực tài khoản HTX. |

#### B. Phân chia Tabs theo Vòng đời Nghiệp vụ (Tab Lifecycle & Read-Only Finalization):
1. **Phân tách Hiện tại (`ACTIVE` / `IN_PROGRESS`) vs Quá khứ (`COMPLETED` / `CLOSED` / `ARCHIVED`):**
   - Tại `features/agriculture/components/CropSeasonsTable.tsx:138-185`: Tích hợp bộ chuyển đổi phạm vi (`scopeFilter: 'ALL' | 'ACTIVE_ONLY' | 'HISTORY_ONLY'`).
   - Khi chọn tab `HISTORY_ONLY` (`CropSeasonsTable.tsx:187-192`), hệ thống hiển thị huy hiệu cố định:
     ```tsx
     <span className="text-[11px] font-bold text-slate-500 flex items-center gap-1 bg-slate-200/70 px-2.5 py-1 rounded-lg">
       <Lock className="w-3.5 h-3.5" />
       <span>Chế độ tra cứu quá khứ (Read-only)</span>
     </span>
     ```
   - Nút "Đóng mùa vụ" (`onCloseSeason`) bị ẩn tự động khi `item.status === 'COMPLETED'` (`CropSeasonsTable.tsx:423`).
2. **Khóa chỉnh sửa đối với dữ liệu đã chốt sổ (Read-only Locking):**
   - Tại `features/agriculture/pages/FarmingLogsPage.tsx:59`: Khi mùa vụ đã đóng (`currentSeason?.status === 'COMPLETED'`), biến cờ `isSeasonReadOnly = true` được kích hoạt, vô hiệu hóa việc ghi thêm hoặc chỉnh sửa nhật ký của vụ đó.
   - Tại `features/ocop/pages/DossierDetailPage.tsx`: Khi hồ sơ OCOP đã nộp thẩm định (`SUBMITTED`), hệ thống khóa quyền tự chấm điểm và vô hiệu hóa nút sửa thông tin, chỉ mở chế độ xem trước (View-only).

---

### 1.2. Kiểm toán Chỉ số & Trực quan hóa (KPI Cards & Charts across Modules)

#### A. Các Thẻ KPI và Biểu đồ Có Giá Trị Quản Trị Thực Tế Cao (High Management Value):
1. **Biểu đồ Tuổi nợ 5 bậc (`DebtAgingSummaryCard.tsx:87-148`):**
   - Phân loại trực quan 5 dải tuổi nợ theo chuẩn kế toán quản trị: *Trong hạn*, *Quá hạn 1–30 ngày*, *31–60 ngày*, *61–90 ngày*, *Trên 90 ngày*.
   - Cho phép người quản lý nhận diện tức thì nguy cơ nợ xấu và lập kế hoạch thu hồi hoặc cấn trừ tiền thu mua nông sản.
2. **Hàng thẻ KPI Thu hoạch & KCS (`HarvestKpiStats.tsx:19-67`):**
   - Thẻ 1: Tổng sản lượng thu hoạch (kg).
   - Thẻ 2: Sản lượng và Tỷ lệ Grade A Premium (điều kiện Brix $\ge 7.0^\circ$, đồng đều $\ge 90\%$).
   - Thẻ 3: Số mã lô GS1 Traceability đã cấp và xuất xưởng.
3. **Bộ 3 Biểu đồ Hồ sơ OCOP (`DossiersStatsCharts.tsx:74-160`):**
   - Donut Chart: Tỷ lệ hoàn thiện hồ sơ (% tiến độ thực tế).
   - Bar Chart: Phân bổ số lượng sản phẩm theo mục tiêu 3 sao, 4 sao, 5 sao.
   - Pie Chart: Cơ cấu sản phẩm theo nhóm ngành OCOP (Thực phẩm, Đồ uống, Thảo dược).

#### B. Các Yếu Tố Trang Trí, Bố Cục Rối Mắt hoặc Số Liệu Giả Lập Cần Chấn Chỉnh (Clutter & Fake Metrics):
1. **Hardcode cứng 100% Đạt tại Thẻ KCS Thu hoạch (`HarvestKpiStats.tsx:73-74`):**
   ```tsx
   {/* Card 4: KCS & PHI Guard */}
   <p className="mt-1.5 text-2xl font-black tracking-tight text-emerald-800">
     100% <span className="text-xs font-bold text-slate-500">Đạt</span>
   </p>
   ```
   *Quan sát thực tế:* Interface `HarvestKpiStatsProps` (dòng 5–10) chỉ nhận `totalVolume`, `gradeAVolume`, `gradeAPercent`, `totalLots`. Thẻ thứ 4 không hề nhận dữ liệu kiểm định KCS mà hardcode chuỗi `100% Đạt`, gây hiểu nhầm rằng toàn bộ lô hàng đều đã qua kiểm nghiệm dù thực tế có thể chưa kiểm nghiệm hoặc có mẫu bị loại.
2. **Toàn bộ Trang Báo cáo OCOP là Dữ liệu Tĩnh Giả lập (`OcopReportsPage.tsx:15-56, 91-127`):**
   - 6 Thẻ KPI đầu trang (`OcopReportsPage.tsx:91-127`) hoàn toàn viết cứng: *12 sản phẩm OCOP*, *4 sản phẩm 3 sao*, *6 sản phẩm 4 sao*, *2 sản phẩm 5 sao*, *92,5% hoàn thiện*, *2,85 tỷ doanh thu*.
   - 4 Biểu đồ Recharts (Stacked Bar, Donut, Line, Radar) vẽ trên các mảng tĩnh `pieDataCategory`, `lineRevenueData`, `radarData`, `topProducts`, `regionalData`. Trang này không hề có hook `useQuery` hay lệnh gọi API nào đến backend!
   - Nút "Xuất báo cáo" (`OcopReportsPage.tsx:82`):
     ```tsx
     onClick={() => alert('Xuất file Báo cáo tổng hợp Excel / PDF thành công!')}
     ```
     Đây là hành vi giả lập thuần túy (Decorative Clutter & Mock).
3. **Mất giá trị định lượng tại Thẻ Công nợ Dashboard (`DashboardStatCards.tsx:92-95`):**
   ```tsx
   <div className="text-[12px] text-slate-500 font-medium">Công nợ xã viên</div>
   <div className="text-2xl font-black text-slate-900 mt-0.5">Theo dõi thời gian thực</div>
   <div className="text-[11.3px] text-purple-700 font-bold mt-0.5">Cấn trừ vụ thu hoạch tự động</div>
   ```
   Thay vì hiển thị tổng dư nợ thực tế (ví dụ: `145.200.000 ₫`), thẻ này lại hiển thị dòng chữ khẩu hiệu `"Theo dõi thời gian thực"`, đánh mất hoàn toàn giá trị của một KPI card.
4. **Hiển thị sai lệch trạng thái rỗng tại Dashboard OCOP (`DashboardOcopBreakdown.tsx:53`):**
   ```tsx
   {ocopApplications.length > 0 ? `${ocopDraftCount} hồ sơ` : '1 hồ sơ'}
   ```
   Khi hệ thống chưa có hồ sơ nào (`ocopApplications.length === 0`), code lại hiển thị `'1 hồ sơ'` thay vì `'0 hồ sơ'`.

---

### 1.3. Kiểm toán Xử lý Trạng thái Trung thực & Rà soát Silent Mocking (Truthful States & Anti-Mocking Audit)

#### A. Kiểm toán 4 Trạng thái Bắt buộc (Loading, Empty, Error, Success):
1. **Loading Skeleton:**
   - Component nền tảng: `frontend/src/components/ui/Skeleton.tsx` (dòng 1–26) cung cấp hiệu ứng `animate-pulse` cho 3 biến thể: `text`, `circular`, `rectangular`.
   - `DataTable.tsx:112-121`: Khi `isLoading === true`, bảng tự động hiển thị 5 hàng Skeleton giả lập cấu trúc cột, chống nhảy giật layout (Cumulative Layout Shift - CLS).
   - Tại các trang lazy-load (`AppRoutes.tsx:38-45`): Sử dụng `PageLoader` với Spinner và thông báo "Đang tải trang...".
2. **Empty State với Nút bấm 1 chạm "Đặt lại bộ lọc tìm kiếm":**
   - **Đã tuân thủ rất tốt** tại 10 bảng dữ liệu nghiệp vụ:
     - `FarmPlotsFullTable.tsx:250-254`: Nút "Đặt lại bộ lọc tìm kiếm" xóa `search` và đưa `statusFilter` về `'ALL'`.
     - `CropSeasonsTable.tsx:298`: Tích hợp nút đặt lại bộ lọc.
     - `HarvestsTable.tsx:173`: Tích hợp nút đặt lại bộ lọc.
     - `MembersTable.tsx:174`: Tích hợp nút đặt lại bộ lọc.
     - `MaterialsTable.tsx:280`: Tích hợp nút đặt lại bộ lọc.
     - `MaterialBatchesTable.tsx:147`: Tích hợp nút đặt lại bộ lọc.
     - `CashbookTab.tsx:194`: Tích hợp nút đặt lại bộ lọc.
     - `DebtsTab.tsx:255`: Tích hợp nút đặt lại bộ lọc.
     - `CapitalMembersTab.tsx:95`: Nút `<RotateCcw /> Đặt lại`.
     - `EvidencesTable.tsx:101`: Nút "Đặt lại".
   - **Điểm khuyết thiếu:** Component bảng dùng chung `components/ui/DataTable.tsx` (dòng 122–132) chỉ hiển thị icon `FileQuestion` và dòng text `emptyMessage`, **chưa có nút bấm 1 chạm để hoàn tác bộ lọc**.
3. **Error Toast kèm Mã lỗi cụ thể:**
   - Bộ chuyển đổi lỗi chuẩn: `frontend/src/services/errorAdapter.ts` (dòng 1–84) đã bóc tách chính xác các mã lỗi đặc thù: `ERR_HARVEST_PHI_VIOLATION`, `UNAUTHORIZED_TENANT_ACCESS`, `VALIDATION_FAILED`, `INTERNAL_SERVER_ERROR`, `NETWORK_ERROR`.
   - `services/apiClient.ts:54-55`: Tự động chuyển đổi lỗi axios thành `FormattedError` `{ status, code, message, fieldErrors }`.
   - **Tồn tại sai lệch:**
     - Tại `features/finance/pages/FinancePage.tsx:82, 104, 118` và `features/inventory/pages/ProductsPage.tsx:74, 137, 369`: Lệnh `showToast(..., 'danger')` truyền loại `'danger'`, trong khi `ToastNotification.tsx:5` chỉ định nghĩa `type: 'success' | 'error' | 'warning' | 'info'`. Điều này dẫn đến cấu hình CSS toast bị thiếu hụt.
     - Nhiều trang hiển thị thông báo chung chung trong `onError` mà không kèm mã lỗi (ví dụ: `MaterialsPage.tsx:84` chỉ hiện `'Thao tác không thành công. Vui lòng kiểm tra lại kết nối!'`, nuốt trọn mã lỗi backend).
4. **Success Toast:**
   - Hoạt động ổn định sau mỗi mutation thành công qua TanStack React Query (`queryClient.invalidateQueries`).

---

#### B. Bảng Rà Soát Chi Tiết Toàn Bộ Vi Phạm "Silent Mocking" & Hardcoded Tenant Tại Runtime:

Tuân thủ nghiêm ngặt Quy tắc số 2 trong `AGENT.md` và `GEMINI.md` ("CẤM SILENT MOCKING TẠI RUNTIME"), bảng dưới đây ghi nhận chính xác từng tệp tin và số dòng vi phạm:

| STT | Tệp tin vi phạm (File Path) | Dòng mã (Line #) | Đoạn mã / Dữ liệu vi phạm | Bản chất vi phạm & Tác hại nghiệp vụ |
| :---: | :--- | :---: | :--- | :--- |
| **1** | `frontend/src/services/memberService.ts` | 14–456 | `export const mockMembersList: Member[] = [...]` | Khai báo mảng mock tĩnh xã viên. |
| **2** | `frontend/src/services/memberService.ts` | 457–600 | `export const mockCapitalTransactions: CapitalTransaction[] = [...]` | Mảng mock giao dịch vốn góp. |
| **3** | `frontend/src/services/memberService.ts` | 601–635 | `export const mockSurplusPlan = {...}`, `mockSurplusItems = [...]` | Mảng mock phương án phân phối thặng dư. |
| **4** | `frontend/src/services/memberService.ts` | 930–947 | `createdMember = { ...mockMembersList[0], ... }` | Tạo xã viên thất bại thì đè dữ liệu mock vào Local Storage. |
| **5** | `frontend/src/services/memberService.ts` | **1245** | `catch (error) { return { data: [mockSurplusPlan] }; }` | **Silent Mocking nghiêm trọng:** API lỗi thì âm thầm trả về phương án chia lãi giả lập, che giấu lỗi backend! |
| **6** | `frontend/src/services/memberService.ts` | **1255** | `catch (error) { return { data: mockSurplusPlan }; }` | Tương tự dòng 1245 đối với chi tiết kế hoạch thặng dư. |
| **7** | `frontend/src/features/members/pages/ProfitPage.tsx` | 55–56 | `useState(mockSurplusPlan)`, `useState(mockSurplusItems)` | Khởi tạo State trực tiếp từ mảng mock thay vì trạng thái loading từ API. |
| **8** | `frontend/src/features/members/pages/ProfitPage.tsx` | 61–66 | `internal_service_surplus: surplusPlan.internal_service_surplus \|\| 850000000` | Toán tử fallback gán số tiền giả định (850 triệu, 400 triệu, 55%). |
| **9** | `frontend/src/services/ocopService.ts` | 127–219 | `MOCK_OCOP_DOSSIERS_FULL`, `MOCK_EVIDENCES_FULL`, v.v. | Danh mục dữ liệu mock OCOP tĩnh. |
| **10** | `frontend/src/services/ocopService.ts` | **229** | `return MOCK_OCOP_DOSSIERS_FULL;` (trong `getApplications`) | Khi database thật có 0 hồ sơ hoặc API lỗi, hệ thống luôn trả về hồ sơ mock. |
| **11** | `frontend/src/services/ocopService.ts` | **242** | `return MOCK_OCOP_DOSSIERS_FULL.find(...) \|\| MOCK_OCOP_DOSSIERS_FULL[0]` | Tìm chi tiết hồ sơ không thấy thì ép trả về hồ sơ mock đầu tiên. |
| **12** | `frontend/src/services/ocopService.ts` | **276** | `catch (e) { return MOCK_EVIDENCES_FULL; }` | Lỗi API kho minh chứng thì tự động nạp danh sách minh chứng mock. |
| **13** | `frontend/src/features/ocop/pages/DossierDetailPage.tsx` | 11–12, 47 | `MOCK_OCOP_DOSSIERS_FULL.find(...)` | Trang chi tiết hồ sơ import và tra cứu trực tiếp từ mock data. |
| **14** | `frontend/src/features/ocop/pages/CreateDossierWizardPage.tsx` | 19–70 | `const INITIAL_EVIDENCES: UploadedEvidence[] = [...]` | Nạp sẵn 5 tệp minh chứng giả lập kèm mã băm SHA-256 ngẫu nhiên vào wizard. |
| **15** | `frontend/src/features/inventory/pages/ProductsPage.tsx` | 103, 144 | `p.star_rating \|\| p.quality_information?.star_rating \|\| 4` | Sản phẩm chưa đánh giá OCOP bị tự động gắn mác "4 sao" (hardcoded fallback). |
| **16** | `frontend/src/utils/voucherDocumentGenerator.ts` | 32, 151, 234 | `amount = tx?.amount \|\| ... \|\| 10000000` (và `20000000`) | Mẫu in phiếu thu/chi/giấy chứng nhận vốn tự động fallback 10tr và 20tr VNĐ. |
| **17** | `frontend/src/features/dashboard/pages/DashboardPage.tsx` | 72 | `const ocopTotal = ocopApplications.length \|\| 1;` | Tránh chia cho 0 nhưng gây sai lệch mẫu số khi HTX có 0 hồ sơ. |
| **18** | `frontend/src/features/dashboard/components/DashboardOcopBreakdown.tsx` | 53 | `{ocopApplications.length > 0 ? ... : '1 hồ sơ'}` | HTX có 0 hồ sơ thì giao diện tự động vẽ thành '1 hồ sơ'. |
| **19** | `frontend/src/services/traceabilityApi.ts` | 196–202 | `if (VERIFIED_OFFLINE_LOTS.has(cleanLotId)) return { ...defaultPalermoTraceability }` | Tự động trả về dữ liệu mẫu ớt chuông Palermo khi mất mạng/lỗi backend. |
| **20** | `frontend/src/features/inventory/data/inventoryMockData.ts` | 1–180 | `SEED_MATERIALS`, `MOCK_SEASONS`, `MOCK_MEMBERS_PLOTS` | Tệp mock tàn dư 180 dòng trong source code (dù không được import). |
| **21** | **Toàn bộ codebase (18 tệp)** | Nhiều dòng | Hardcode tên HTX `"HTX Tân Tiến"`, `"Hợp tác xã Nông nghiệp Tân Tiến"` | Vi phạm nguyên tắc Tenant Context động: `PublicTraceabilityPage.tsx:228, 366, 395`, `traceabilityApi.ts:10, 106, 129`, `CoopProfilePage.tsx:29, 30, 92`, `SettlementVoucherModal.tsx:69`, `productApi.ts:57, 77, 97, 175`, `ocopService.ts:99, 134, 160`, `harvestApi.ts:42, 82, 186, 255`, `FarmingLogDetailPanel.tsx:289`, `TenantManagementCard.tsx:33, 157`, `OcopReportsPage.tsx:43, 50, 221, 230`, `CashTransactionTabVoucher.tsx:51`, `FarmingLogDetailModal.tsx:79, 260`, `FieldLogQuickForm.tsx:247`, `HarvestLabelPrintModal.tsx:113, 144`, `VoucherPrintModal.tsx:55`, `SurplusVoucherPrintModal.tsx:53`, `CapitalCertificateModal.tsx:39, 158`. |

---

### 1.4. Đối soát Hợp đồng Dữ liệu Frontend-Backend & Concurrency (Contract Alignment & Gaps)

#### A. Đối soát API Client Frontend (`frontend/src/services/`) vs Tuyến đường Backend (`backend/routes/api.php`):

| Nhóm chức năng nghiệp vụ | Tuyến đường Backend (`routes/api.php`) | Frontend API Service | Mức độ khớp nối hợp đồng |
| :--- | :--- | :--- | :--- |
| **Xác thực & Phiên làm việc** | `POST /auth/login`, `GET /auth/me`, `POST /auth/logout`, `POST /auth/change-password` | `services/authService.ts` | **100% Khớp nối**. |
| **Hồ sơ HTX & Cài đặt** | `GET, PUT /cooperatives/my-cooperative`, `/system-settings` | `services/systemService.ts` | **100% Khớp nối**. |
| **Xã viên & Vốn góp** | `GET, POST, PATCH, DELETE /members`, `/capital-contributions`, `/land-contributions` | `services/memberService.ts`, `landContributionService.ts` | **Khớp nối tốt**, nhưng `memberService.ts` có chứa mã fallback mock. |
| **Đại hội & Biểu quyết** | `GET, POST /meetings`, `/meetings/{id}/votes`, `/resolutions-summary` | `services/meetingApi.ts` | **100% Khớp nối**. |
| **Vùng trồng & Thửa đất** | `GET, POST, PATCH /production-units`, `/farm-plots`, `/member-assignments` | `services/farmPlotApi.ts` | **100% Khớp nối**. |
| **Kế hoạch Mùa vụ & Giống** | `GET, POST, PATCH /crop-seasons`, `/close`, `GET, POST /crops` | `services/cropSeasonApi.ts`, `services/cropApi.ts` | **100% Khớp nối**. |
| **Nhật ký canh tác & PHI** | `GET, POST, PATCH, DELETE /farming-logs`, `/material-usages`, `/phi-calculations` | `services/farmingLogApi.ts` | **100% Khớp nối**. |
| **Thu hoạch & KCS 3 cấp** | `GET, POST /harvests`, `/kcs/gate-check`, `/kcs/quick-lab`, `/kcs/grading` | `services/harvestApi.ts` | **100% Khớp nối**. |
| **Mã định danh Lô GS1** | `GET, POST /lots`, `/lots/{id}/traceability`, `/public/trace/{lotId}` | `services/lotApi.ts`, `traceabilityApi.ts` | **100% Khớp nối**. |
| **Sản phẩm OCOP** | `GET, POST, PATCH /products`, `/products/{id}/lots` | `services/productApi.ts` | **100% Khớp nối**. |
| **Kho & Vật tư** | `GET, POST, PATCH /materials`, `/warehouses`, `/stock-receipts`, `/stock-issues` | `services/inventoryApi.ts`, `warehouseService.ts` | **Khớp nối tốt**. |
| **Kiểm kê Kho vật tư** | `GET, POST /stock-counts`, `/complete`, `/approve` | `services/inventoryApi.ts` (chỉ gọi `GET`) | **Khuyết thiếu giao diện**: Backend có đủ 3 route tạo/chốt/duyệt kiểm kê nhưng Frontend chưa có form gọi. |
| **Sổ quỹ & Thu chi** | `GET, POST /cash-transactions`, `/approve`, `/post` | `services/financeApi.ts` | **100% Khớp nối**. |
| **Công nợ & Tuổi nợ 5 bậc** | `GET, POST /receivable-payables`, `/summary`, `/settlements` | `services/financeApi.ts` | **100% Khớp nối**. |
| **Quyết toán mùa vụ** | `POST /harvests/settle-season`, `GET /harvests/settlements` | `services/financeApi.ts` | **100% Khớp nối**. |
| **Phân phối thặng dư** | `GET, POST /surplus-distribution-plans`, `/submit`, `/approve` | `services/memberService.ts` | **Khớp nối Route**, nhưng Frontend fallback về `mockSurplusPlan` khi lỗi. |
| **Bộ Tiêu chí OCOP QĐ 148** | `GET /ocop/criteria-versions`, `/groups`, `/criteria`, `/indicators` | `services/ocopService.ts` | **Khớp nối tốt**. |
| **Hồ sơ & Tự chấm điểm** | `GET, POST, PATCH /ocop/applications`, `/score-suggestions`, `/self-assessments`, `/submit` | `services/ocopService.ts` | **Khớp nối Route**, nhưng fallback về `MOCK_OCOP_DOSSIERS_FULL`. |
| **Kho Minh chứng số** | `GET, POST /ocop/evidences`, `/download`, `/versions`, `/links`, `/verify` | `services/ocopService.ts` | **Tồn tại tính năng ma** trên giao diện `EvidencesPage.tsx`. |
| **Hội đồng & Thẩm định** | `GET, POST /ocop/evaluation-sessions`, `/scores`, `/consolidate`, `/decisions` | `services/ocopService.ts` | **100% Khớp nối**. |
| **Nhật ký kiểm toán SHA-256**| `GET /audit-logs`, `/audit-logs/{id}`, `/trace/ocop/{id}`, `/trace/member/{id}` | `services/auditApi.ts` | **100% Khớp nối**. |
| **Kết xuất Báo cáo & Mẫu in** | `GET /reports/dashboard`, `/export/members`, `/export/cash-book`, `/documents/generate/...` | `services/reportApi.ts` | **100% Khớp nối**. |

---

#### B. Danh Sách Các Tính Năng Ma (Phantom Features — UI Có Nút Nhưng Không Gọi API Thật):
1. **Các nút tác vụ tại Kho Minh chứng (`features/ocop/pages/EvidencesPage.tsx:184, 196-199`):**
   - Nút Tải xuống: `onDownload={(item) => alert('Tải xuống tệp ${item.name}')}`
   - Nút Liên kết chỉ tiêu: `onLinkIndicator={(item) => alert('Liên kết chỉ tiêu cho tệp ${item.name}')}`
   - Nút Thay thế phiên bản: `onReplaceVersion={(item) => alert('Thay thế phiên bản mới cho ${item.name}')}`
   - Nút Xóa tệp: `onDelete={(item) => alert('Xác nhận xóa tệp ${item.name}')}`
   - *Hậu quả:* Backend đã có sẵn các endpoint chuẩn: `GET /ocop/evidences/{id}/download`, `POST /ocop/evidences/{id}/versions`, `POST /ocop/evidences/{id}/links`, nhưng Frontend chỉ gọi lệnh `alert()` của trình duyệt.
2. **Form Thêm mới Minh chứng không lưu trữ (`features/ocop/pages/EvidencesPage.tsx:208-210`):**
   ```tsx
   <AddEvidenceModal
     isOpen={isAddModalOpen}
     onClose={() => setIsAddModalOpen(false)}
     onSubmit={(data) => {
       showToast(`Đã thêm minh chứng [${data.title}] thành công!`);
       setIsAddModalOpen(false);
     }}
   />
   ```
   *Hậu quả:* Người dùng bấm lưu, form hiển thị Toast thành công nhưng hoàn toàn **không gọi API upload lên Backend hay MinIO**, tệp biến mất ngay khi tải lại trang!
3. **Nút Xuất báo cáo tại trang Báo cáo OCOP (`features/ocop/pages/OcopReportsPage.tsx:82`):**
   ```tsx
   onClick={() => alert('Xuất file Báo cáo tổng hợp Excel / PDF thành công!')}
   ```
   Không kích hoạt quy trình sinh file Excel hay PDF thật từ backend `ReportController`.
4. **Tải xuống tệp tại Tab Minh chứng chi tiết (`features/ocop/components/DossierEvidencesTab.tsx:142`):**
   ```tsx
   onClick={() => alert(`Đang tải xuống file ${ev.fileName}`)}
   ```
   Không gọi endpoint ký số streaming `Route::get('/ocop/evidences/{id}/file-stream')`.

---

#### C. Kiểm soát Nhập liệu, Chống Gửi Trùng (Double-submit) và Hiệu Năng Đồng Thời (Concurrency):
1. **Chống gửi trùng (Double-submit Protection) & Khóa thao tác:**
   - Tại `services/apiClient.ts:30-35`: Tự động sinh và đính kèm UUID header `'Idempotency-Key'` cho mọi HTTP request đột biến (`POST`, `PUT`, `PATCH`, `DELETE`). Điều này bảo vệ an toàn cho các tác vụ thanh toán, xuất kho và ghi sổ quỹ khi người dùng nhấn nút nhiều lần.
   - Các modal quan trọng (`AddFarmPlotModal`, `CropSeasonModal`, `CashTransactionModal`, `DebtSettlementModal`) đều đã áp dụng thuộc tính `disabled={loading}` và hiển thị trạng thái đang xử lý (`Đang khởi tạo...`, `Đang ghi sổ...`).
2. **Khuyết thiếu nghiêm trọng: KHÔNG CÓ DEBOUNCE TRÊN CẢ HỆ THỐNG:**
   - Tìm kiếm toàn bộ `frontend/src`: **Không có bất kỳ hàm `debounce` hoặc hook `useDebounce` nào!**
   - Tại `features/agriculture/pages/FarmingLogsPage.tsx:61-64`:
     ```tsx
     const [search, setSearch] = useState('');
     const { data: rawLogsList = [], isLoading } = useQuery<FarmingLog[]>({
       queryKey: ['farming-logs', search, selectedActivity],
       queryFn: async () => fetchFarmingLogs({ search: search.trim() || undefined, ... }),
     });
     ```
     Mỗi ký tự người dùng gõ vào thanh tìm kiếm ngay lập tức làm thay đổi `queryKey`, phát lệnh HTTP request lập tức tới Backend. Một cụm từ 15 ký tự sẽ phát 15 request liên tiếp, gây quá tải server và nguy cơ race condition dữ liệu trả về!
3. **Khóa lạc quan (Optimistic Concurrency Control):**
   - Frontend hiện chưa truyền trường `version` trong payload cập nhật thông tin xã viên, mùa vụ hay sản phẩm; chỉ dựa vào cơ chế `lockForUpdate()` ở backend.

---

## 2. LOGIC CHAIN (CHUỖI LẬP LUẬN TỪ QUAN SÁT ĐẾN KẾT LUẬN)

1. **Từ Quan sát 1.1 (Cấu trúc Table - Drawer - Modal):**
   - Ta thấy rằng hệ thống đã định hình rất tốt ranh giới: Bảng dùng cho danh sách nhiều thuộc tính; Ngăn kéo (Drawer) dùng xem nhanh chi tiết xã viên, thửa đất, lô thu hoạch, giao dịch quỹ mà không làm mất trang hiện tại; Hộp thoại (Modal) tập trung cho việc tạo mới, sửa đổi hoặc xóa có xác nhận.
   - Hơn nữa, việc triển khai `scopeFilter` và huy hiệu `Read-only` tại `CropSeasonsTable` và `FarmingLogsPage` chứng minh kiến trúc frontend đã thấu hiểu vòng đời dữ liệu nông nghiệp (không được sửa dữ liệu mùa vụ đã chốt sổ).
2. **Từ Quan sát 1.2 & 1.3 (Sự tồn tại của Mock Data và Fallback tĩnh):**
   - Trong quá trình phát triển gấp rút giao diện, một số trang (đặc biệt là phân hệ OCOP và Báo cáo thặng dư) đã sử dụng mảng mock tĩnh (`mockMembersList`, `MOCK_OCOP_DOSSIERS_FULL`, `mockSurplusPlan`).
   - Nguy hại nhất là khối `catch (error)` tại `memberService.ts:1245` và `ocopService.ts:229`: Khi API backend trả về rỗng hoặc gặp lỗi 500, code frontend đã "nuốt lỗi âm thầm" và trả về dữ liệu mock.
   - Điều này dẫn đến hiện tượng **"ảo giác vận hành" (False Sense of Functionality)**: Tester hoặc người dùng nhìn thấy dữ liệu trên màn hình nhưng thực chất cơ sở dữ liệu PostgreSQL không hề có dữ liệu đó, vi phạm trực tiếp Quy tắc số 2 trong `AGENT.md`.
3. **Từ Quan sát 1.3.B (Hardcode tên HTX Tân Tiến trên 18 tệp):**
   - Hệ thống được thiết kế theo kiến trúc Đa người thuê (Multi-tenant), có sẵn store `useTenantContextStore` và bảng `cooperatives`.
   - Tuy nhiên, do lập trình viên tiện tay viết cứng chuỗi `'HTX Tân Tiến'` vào giao diện và các chuỗi thông báo, nếu đăng nhập bằng tài khoản của HTX khác (ví dụ: HTX Trà Cầu Đất hay HTX Mộc Châu), giao diện vẫn hiển thị nhầm lẫn tên HTX Tân Tiến, phá vỡ tính cô lập Tenant ở tầng hiển thị.
4. **Từ Quan sát 1.4 (Khoảng cách hợp đồng & Tính năng ma):**
   - Backend Laravel 11 đã hoàn thiện một hệ thống API vô cùng phong phú (355 dòng trong `routes/api.php` với đầy đủ upload, ký số, kiểm kê kho, chấm điểm hội đồng).
   - Tuy nhiên, Frontend lại chưa gắn kết đầy đủ tại trang `EvidencesPage.tsx` (dùng `alert()`), `AddEvidenceModal.tsx` (không gọi API upload), và trang `OcopReportsPage.tsx` (dùng dữ liệu tĩnh).
   - Việc thiếu vắng hoàn toàn kỹ thuật Debounce trên các ô tìm kiếm là nguyên nhân tiềm tàng gây chậm hệ thống và nghẽn mạng khi ứng dụng được đưa vào sử dụng thực tế.

---

## 3. CAVEATS (GIỚI HẠN & VÙNG CHƯA KHẢO SÁT)

1. **Phạm vi khảo sát hoàn toàn là Read-only:** Báo cáo này ghi nhận hiện trạng mã nguồn, không trực tiếp thay đổi hay refactor bất kỳ dòng mã nào trong thư mục `src/` hoặc `frontend/src/` để đảm bảo tuân thủ nguyên tắc explorer.
2. **Chưa đo đạc hiệu năng mạng thực tế (Network Latency):** Chưa thực hiện đo thời gian phản hồi (TTFB) của API khi có 100 người dùng đồng thời gõ phím tìm kiếm mà không có debounce.
3. **Môi trường di động:** Đã khảo sát bố cục responsive qua mã nguồn CSS Tailwind, nhưng chưa kiểm thử cảm ứng thực tế trên các dòng máy tính bảng giá rẻ của nông dân ngoài đồng ruộng.

---

## 4. CONCLUSION (KẾT LUẬN & ĐỀ XUẤT HÀNH ĐỘNG CÓ PHÂN HẠNG ƯU TIÊN)

### Đánh giá Tổng quan:
Frontend HTX-OCOP sở hữu nền tảng kiến trúc **vững chắc, hiện đại và rất giàu tính năng** (React 18, Vite, TailwindCSS, TanStack React Query, 28 màn hình chuyên sâu, phân tầng Drawer/Modal/Table rất chuẩn mực, có `Idempotency-Key` bảo vệ giao dịch).
Tuy nhiên, dự án đang tồn tại **4 nhóm khuyết tật kỹ thuật** cần phải phẫu thuật xử lý:
1. **Silent Mocking tại Runtime** (Đặc biệt ở `ocopService.ts`, `memberService.ts`, `ProfitPage.tsx`).
2. **Tính năng ma (Phantom Features)** dùng `alert()` hoặc không gọi API tại trang Kho Minh chứng (`EvidencesPage.tsx`) và Báo cáo OCOP (`OcopReportsPage.tsx`).
3. **Hardcode tên HTX** trên 18 tệp nguồn thay vì lấy động từ `useTenantContextStore`.
4. **Thiếu Debounce** trên toàn bộ các thanh tìm kiếm gây lãng phí tài nguyên máy chủ.

### Lộ trình Đề xuất Hành động (Action Backlog):

#### Nhóm P0 — Bắt buộc xử lý ngay (Tính toàn vẹn dữ liệu & Luật cấm Silent Mocking):
1. **Loại bỏ triệt để Silent Fallback Mocking trong Services:**
   - Sửa `services/ocopService.ts`: Bỏ khối `return MOCK_OCOP_DOSSIERS_FULL;` và `MOCK_EVIDENCES_FULL;`. Khi API trả về `[]`, phải trả về đúng mảng rỗng `[]` để UI kích hoạt Empty State chân thực.
   - Sửa `services/memberService.ts`: Bỏ fallback `mockSurplusPlan` tại dòng 1245 và 1255; ném lỗi để React Query xử lý trạng thái `isError`.
   - Sửa `features/members/pages/ProfitPage.tsx`: Chuyển sang lấy dữ liệu thật từ API `fetchSurplusPlansApi`, không khởi tạo state từ `mockSurplusPlan`.
2. **Xóa bỏ các Fallback số tiền và số sao giả lập:**
   - Sửa `features/inventory/pages/ProductsPage.tsx:103`: Bỏ `|| 4`, hiển thị đúng trạng thái "Chưa đánh giá OCOP".
   - Sửa `utils/voucherDocumentGenerator.ts:32, 151, 234`: Bỏ fallback `|| 10000000`, hiển thị đúng số tiền thực nộp hoặc báo lỗi nếu chưa ghi nhận vốn.
   - Sửa `DashboardOcopBreakdown.tsx:53`: Sửa `'1 hồ sơ'` thành `'0 hồ sơ'`.

#### Nhóm P1 — Khắc phục Tính năng ma & Kết nối API thật (Feature Completeness):
1. **Đấu nối API thật cho Kho Minh Chứng (`EvidencesPage.tsx` & `AddEvidenceModal.tsx`):**
   - Thay thế các lệnh `alert()` bằng các hàm gọi API: `GET /api/v1/ocop/evidences/{id}/download`, `POST /ocop/evidences/{id}/versions`, `POST /ocop/evidences/{id}/links`.
   - Viết hàm mutation thật trong `AddEvidenceModal.tsx` để upload tệp multipart/form-data lên backend, gắn mã băm SHA-256 thật.
2. **Đồng bộ Ngữ cảnh HTX Động (Tenant Context Consistency):**
   - Rà soát 18 tệp nguồn, thay thế chuỗi cứng `'HTX Tân Tiến'` bằng `activeCooperative?.legal_name || 'Hợp tác xã'` từ `useTenantContextStore`.
3. **Sửa đổi trang Báo cáo OCOP (`OcopReportsPage.tsx`):**
   - Đấu nối vào API `ReportController` (`/reports/dashboard` hoặc `/reports/ocop-readiness`), tính toán tỷ lệ thật từ danh sách hồ sơ trong database thay vì mảng tĩnh.

#### Nhóm P2 — Tối ưu Trải nghiệm & Hiệu năng (UX Polish & Concurrency):
1. **Bổ sung Custom Hook `useDebounce`:**
   - Xây dựng `hooks/useDebounce.ts` (delay 300ms–400ms) và áp dụng cho toàn bộ các ô tìm kiếm tại `FarmingLogsPage`, `CropSeasonsTable`, `FarmPlotsFullTable`, `MembersTable`, `EvidencesTable`.
2. **Chuẩn hóa Error Toast:**
   - Sửa `ToastNotification.tsx` hỗ trợ thêm type `'danger'` hoặc chuẩn hóa toàn bộ lời gọi về `'error'`.
   - Đảm bảo mọi Toast báo lỗi đều hiển thị kèm mã lỗi backend dạng: `[MÃ_LỖI] Nội dung chi tiết`.
3. **Bổ sung Nút bấm 1 chạm Hoàn tác Bộ lọc cho `components/ui/DataTable.tsx`:**
   - Đưa prop `onResetFilters` vào `DataTableProps` để trạng thái rỗng luôn có nút khôi phục nhanh.

---

## 5. VERIFICATION METHOD (HƯỚNG DẪN XÁC MINH ĐỘC LẬP)

Bất kỳ thành viên nào trong đội ngũ cũng có thể kiểm chứng độc lập các phát hiện trên bằng các lệnh và quy trình sau:

1. **Xác minh các điểm Silent Mocking:**
   - Mở tệp `f:/HTX_OCOP_PROJECT/frontend/src/services/ocopService.ts`, kiểm tra dòng 220–230 và dòng 273–277.
   - Mở tệp `f:/HTX_OCOP_PROJECT/frontend/src/services/memberService.ts`, kiểm tra dòng 1243–1257.
   - Mở tệp `f:/HTX_OCOP_PROJECT/frontend/src/features/members/pages/ProfitPage.tsx`, kiểm tra dòng 55–66.
2. **Xác minh các Tính năng ma (Phantom Features):**
   - Mở tệp `f:/HTX_OCOP_PROJECT/frontend/src/features/ocop/pages/EvidencesPage.tsx`, kiểm tra dòng 184 và 196–199 (lệnh `alert(...)`).
   - Mở tệp `f:/HTX_OCOP_PROJECT/frontend/src/features/ocop/pages/OcopReportsPage.tsx`, kiểm tra dòng 82 (lệnh `alert(...)`) và dòng 91–127 (hardcoded cards).
3. **Xác minh tình trạng thiếu Debounce:**
   - Mở tệp `f:/HTX_OCOP_PROJECT/frontend/src/features/agriculture/pages/FarmingLogsPage.tsx`, kiểm tra dòng 61–64 (gán trực tiếp `search` vào `queryKey`).
4. **Lệnh kiểm tra Build và Lint:**
   - Tại thư mục `f:/HTX_OCOP_PROJECT/frontend`:
     ```powershell
     npm run build
     npm run lint
     ```
   - Đảm bảo mã nguồn TypeScript biên dịch hợp lệ không lỗi cú pháp.
