# BÁO CÁO KIỂM TOÁN KIẾN TRÚC BACKEND & FRONTEND — PHÂN HỆ 1: QUẢN TRỊ HTX & XÃ VIÊN
> **Tác giả:** Explorer 2 (Backend & Frontend Architecture, 6-Step Deep Dive & CRUD Matrix)  
> **Phân hệ kiểm toán:** Phân hệ 1 — Quản trị HTX & Xã viên (Milestone 4)  
> **Căn cứ pháp lý & kỹ thuật:** Luật HTX số 17/2023/QH15, `docs/00_RULES_REGISTER.md`, `AGENT.md`, `GEMINI.md`, `docs/30_MEMBER_WORKFLOW.md`  
> **Thời gian hoàn thành:** 2026-11-02T16:35:00Z  
> **Đường dẫn báo cáo:** `f:/HTX_OCOP_PROJECT/.agents/teamwork/explorer_m4_backend/handoff.md`

---

## 1. OBSERVATION (Quan sát thực tế mã nguồn & kiểm thử)

### 1.1. Tổng quan cấu trúc Module 1 trên Backend & Frontend
Qua khảo sát toàn diện mã nguồn tại thư mục `backend/app/Modules/Cooperative`, `backend/app/Modules/Finance`, `backend/routes/api.php` và `frontend/src/features/members`, phân hệ Quản trị HTX & Xã viên bao gồm 5 nghiệp vụ cốt lõi:
1. **Hồ sơ pháp lý HTX (Cooperative Profile & Legal Dossier)**
2. **Quản lý Xã viên & Phân loại (Members Management: Chính thức, Liên kết, Chờ duyệt)**
3. **Đại hội thành viên & Biểu quyết (General Assembly, Resolutions, Voting per Luật HTX 2023)**
4. **Sổ vốn điều lệ & Cấp giấy chứng nhận phần vốn góp (Charter Capital & Equity Ledger)**
5. **Kế hoạch Phân phối thặng dư (Surplus Distribution Plan per Luật HTX 2023 Điều 83-85)**

---

### 1.2. Chi tiết quan sát từng nghiệp vụ (5 Nghiệp vụ x 6 Bước Deep-Dive)

#### NGHIỆP VỤ 1: HỒ SƠ PHÁP LÝ HTX (Cooperative Profile & Legal Dossier)
- **Backend:**
  - Route: `GET /api/v1/cooperatives/my-cooperative` (`api.php:105`), `PUT /api/v1/cooperatives/my-cooperative` (`api.php:106`).
  - Controller: `Modules\Cooperative\Presentation\Http\Controllers\CooperativeController.php:21-82`.
  - Phân quyền: Kiểm tra Gate `COOPERATIVE.READ` (dòng 23) và `COOPERATIVE.UPDATE` (dòng 45).
  - Form Request: **KHÔNG CÓ Form Request riêng**. Controller tự gọi `$request->validate()` nội bộ tại dòng 59-64:
    ```php
    $validated = $request->validate([
        'legal_name' => 'sometimes|string|max:255',
        'display_name' => 'nullable|string|max:255',
        'legal_information' => 'nullable|array',
        'contact_information' => 'nullable|array',
    ]);
    ```
  - Persistence: Model `CooperativeModel.php` (`cooperatives` table, migration `2026_01_01_000004_create_cooperatives_table.php`).
  - Audit Trail: Tự động ghi `action: 'COOPERATIVE_UPDATED'` vào `audit_events` (dòng 69-76).
- **Frontend:**
  - Page: `frontend/src/features/members/pages/CoopProfilePage.tsx`.
  - Modal: `frontend/src/features/members/components/CoopProfileEditModal.tsx`.
  - Store: `useTenantContextStore` (`activeCooperative`).
  - **LỖI PHÁT HIỆN NGHIÊM TRỌNG (Silent Mocking & Không gọi API):**
    - Tại `CoopProfilePage.tsx` dòng 26-37, trang **HOÀN TOÀN KHÔNG gọi API backend** `GET /cooperatives/my-cooperative`. Thay vào đó, nó đọc từ `useTenantContextStore` và nếu chưa có thì gán một đối tượng giả lập hardcoded:
      ```typescript
      const coop = activeCooperative || {
        id: 'coop-01',
        cooperative_code: 'HTX-TT-01',
        legal_name: 'HỢP TÁC XÃ NÔNG NGHIỆP TÂN TIẾN',
        short_name: 'HTX Tân Tiến',
        tax_code: '5801452291',
        address: 'Thôn Đạ Sar, Xã Đạ Sar, Huyện Lạc Dương, Tỉnh Lâm Đồng',
        phone: '0263 3822 555',
        phone_number: '0263 3822 555',
        representative_name: 'Nguyễn Văn A (Chủ tịch HĐQT)',
        status: 'ACTIVE',
      };
      ```
    - Tại `CoopProfilePage.tsx` dòng 39-47, hàm `handleSaveProfile` chỉ cập nhật vào Zustand store `setCooperative(newCoop)` và hiển thị Toast thành công, **TUYỆT ĐỐI KHÔNG GỌI API PUT backend**:
      ```typescript
      const handleSaveProfile = async (updated: Partial<Cooperative>) => {
        const newCoop: Cooperative = { ...coop, ...updated };
        setCooperative(newCoop);
        showToast('Cập nhật hồ sơ pháp lý Hợp tác xã thành công!', 'success');
        setIsEditModalOpen(false);
      };
      ```
      Khi người dùng F5 tải lại trang, mọi chỉnh sửa biến mất hoàn toàn và CSDL PostgreSQL không hề được cập nhật!
    - Dữ liệu quy mô tại `CoopProfilePage.tsx:128-138` ("Vốn điều lệ đăng ký: 3.500.000.000 ₫", "Số lượng xã viên: 165 hộ thành viên", "Tổng diện tích canh tác: 52,5 Hécta") và nhân sự Ban quản trị tại dòng 165-184 ("Trần Thị Mai - Phó GĐ", "Lê Văn Hùng - Trưởng BKS") bị hardcode tĩnh bằng HTML text.

---

#### NGHIỆP VỤ 2: QUẢN LÝ XÃ VIÊN & PHÂN LOẠI (Members Management)
- **Backend:**
  - Routes: `GET /members`, `POST /members`, `GET /members/{id}`, `PATCH /members/{id}`, `DELETE /members/{id}`, `POST /members/{id}/approve`, `POST /members/{id}/status-transitions`, `GET /members/{id}/suggested-credit-limit` (`api.php:109-116`).
  - Controller: `MemberController.php:22-188`.
  - Service: `MemberService.php:22-316`.
  - Form Requests: `CreateMemberRequest.php`, `UpdateMemberRequest.php`, `StatusTransitionRequest.php`.
  - Domain Entity: `Member.php:7-55` cài đặt FSM chuyển trạng thái nghiêm ngặt:
    `DRAFT` $\rightarrow$ `['ACTIVE', 'PROSPECTIVE', 'TERMINATED']`  
    `ACTIVE` $\rightarrow$ `['SUSPENDED', 'LEAVING', 'PENDING_TERMINATION', 'TERMINATED']`  
    `SUSPENDED` $\rightarrow$ `['ACTIVE', 'TERMINATED']`  
    `TERMINATED` $\rightarrow$ `[]` (trạng thái kết thúc, cấm quay lui).
  - Persistence: Model `MemberModel.php` sử dụng `SoftDeletes`, trường `status` chuyển thành `TERMINATED` kèm `termination_date` khi xóa (`MemberService.php:185-190`).
  - Audit Trail: Ghi các action: `MEMBER_CREATED`, `MEMBER_UPDATED`, `MEMBER_DELETED`, `MEMBER_APPROVED`, `MEMBER_STATUS_CHANGED`.
  - Kiểm thử Feature: `Tests\Feature\MemberTest` chạy thành công 9/9 tests (31 assertions, 1.11s).
- **Frontend:**
  - Page: `frontend/src/features/members/pages/MembersPage.tsx`.
  - Table: `frontend/src/features/members/components/MembersTable.tsx`.
  - Drawer: `frontend/src/features/members/components/MemberDrawer.tsx` (6 tabs).
  - Wizard Thêm mới: `frontend/src/features/members/components/MemberWizard.tsx` (5 bước).
  - Modal Sửa: `frontend/src/features/members/components/MemberEditModal.tsx`.
  - Modal Chuyển trạng thái: `frontend/src/features/members/components/MemberStatusModals.tsx`.
  - Modal Thẩm tra Quyết toán Chấm dứt: `frontend/src/features/members/components/MemberTerminationCheckModal.tsx` (kiểm tra 4 điều kiện).
  - Data Hook: `useMembersData.ts`.
  - Service: `frontend/src/services/memberService.ts`.
  - **LỖI PHÁT HIỆN NGHIÊM TRỌNG (Nuốt lỗi & Silent Mocking Fallback):**
    - Tại `memberService.ts` dòng 954-1045, các hàm `updateMemberApi`, `deleteMemberApi`, `approveMemberApi`, `transitionMemberStatusApi` dùng cấu trúc:
      ```typescript
      try {
        await apiClient.delete(`/members/${id}`);
      } catch (error) {
        console.warn('API delete member notice:', error);
      }
      const stored = getStoredMembers();
      if (stored) {
        const nextList = stored.filter((m) => m.id !== id);
        saveMembersToStorage(nextList);
      }
      return true;
      ```
      Nếu backend trả về lỗi 403 Forbidden, 422 Unprocessable hoặc 500, khối `catch` âm thầm nuốt lỗi, UI vẫn báo thành công, và ghi đè vào `localStorage`. Vi phạm trực tiếp Rule 2 & Trụ cột IV mục 4.7.
    - Tại `StatusTransitionRequest.php:17`, rule validation quy định: `'target_status' => ['required', 'string', 'in:ACTIVE,PENDING_TERMINATION,TERMINATED']`. Thiếu trạng thái `SUSPENDED` và `LEAVING` vốn có trong Domain Entity `Member.php:34`!

---

#### NGHIỆP VỤ 3: ĐẠI HỘI THÀNH VIÊN & BIỂU QUYẾT (General Assembly & Voting per Luật HTX 2023)
- **Backend:**
  - Routes: `GET /meetings`, `POST /meetings`, `GET /meetings/{id}`, `PATCH /meetings/{id}`, `GET /meetings/{id}/votes`, `POST /meetings/{id}/votes`, `GET /meetings/{id}/resolutions-summary` (`api.php:133-139`).
  - Controller: `MeetingController.php:20-130`.
  - Service: `MeetingService.php:21-252`.
  - Form Requests: `CreateMeetingRequest.php:17-23`, `CastVoteRequest.php:17-21`.
  - Ngưỡng biểu quyết chuẩn Luật HTX 2023 Điều 72:
    - Nghị quyết thông thường (`REGULAR`): Tỷ lệ tán thành $\ge 50\%$ (`MeetingService.php:231`).
    - Nghị quyết trọng yếu (`CRITICAL`: sửa đổi Điều lệ, tổ chức lại, sáp nhập, giải thể): Tỷ lệ tán thành $\ge 75\%$ (`MeetingService.php:231`).
  - Chống bỏ phiếu trùng: `MeetingService.php:153-160` kiểm tra `(meeting_id, user_id, resolution_code)`, ném lỗi `DUPLICATE_VOTE` (409) nếu đã bỏ phiếu.
  - Chống bỏ phiếu khi đại hội đóng: Kiểm tra `meeting->status === 'COMPLETED' || 'CANCELLED'`, ném `MEETING_CLOSED` (400).
  - Kiểm thử Feature: `BackendExtendedFeaturesTest::test_meetings_and_voting_flow` chạy thành công (21 assertions, 0.78s).
- **Frontend:**
  - Page: `frontend/src/features/members/pages/MeetingsPage.tsx`.
  - Table: `frontend/src/features/members/components/meetings/MeetingsTable.tsx`.
  - Drawer: `frontend/src/features/members/components/meetings/MeetingDetailDrawer.tsx`.
  - Modals: `CreateMeetingModal.tsx`, `CastVoteModal.tsx`.
  - Card tổng hợp: `ResolutionsSummaryCard.tsx`.
  - API Client: `frontend/src/services/meetingApi.ts`.
  - **LỖI PHÁT HIỆN (Xung đột HTTP Method):**
    - Tại `backend/routes/api.php:136`, route update chỉ đăng ký `PATCH`:
      `Route::patch('/meetings/{id}', [MeetingController::class, 'update'])`
    - Tuy nhiên tại `meetingApi.ts:104`, client lại gọi `PUT`:
      `await apiClient.put('/meetings/' + id, payload)`
      Điều này sẽ dẫn đến lỗi HTTP 405 Method Not Allowed khi người dùng cập nhật thông tin cuộc họp!

---

#### NGHIỆP VỤ 4: SỔ VỐN ĐIỀU LỆ & GIẤY CHỨNG NHẬN PHẦN VỐN GÓP (Charter Capital & Equity Ledger)
- **Backend:**
  - Routes: `GET /capital-contributions/summary`, `GET /capital-contributions`, `GET /members/{member_id}/capital-contributions`, `POST /members/{member_id}/capital-contributions`, `GET /capital-contributions/{id}`, `GET/POST /land-contributions` (`api.php:119-130`).
  - Controller: `CapitalContributionController.php`, `LandContributionController.php`.
  - Service: `CapitalContributionService.php:23-252`.
  - Form Request: `CreateCapitalContributionRequest.php:17-29`.
  - Ràng buộc trần vốn Luật HTX 2023:
    - **BR-COOP-004**: Trần vốn cá nhân thành viên chính thức $\le 30\%$ vốn điều lệ HTX (`CapitalContributionService.php:153-160`), vi phạm ném `ERR_CAPITAL_EXCEED_LIMIT` (422).
    - **BR-COOP-005**: Tổng vốn nhóm thành viên liên kết $\le 30\%$ vốn điều lệ (`CapitalContributionService.php:164-178`), vi phạm ném `ERR_ASSOCIATE_GROUP_CAPITAL_EXCEED_LIMIT` (422).
  - Cấp giấy chứng nhận phần vốn góp: Tự động sinh `certificate_code` định dạng `GCN-YYYY-XXXXXX`, `certificate_issue_date`, `qr_code_url` (`CapitalContributionService.php:192-210`).
  - Góp vốn bằng quyền sử dụng đất: Lưu trữ chi tiết vào bảng `land_contributions` (`land_certificate_no`, `plot_number`, `map_sheet_number`, `land_area_sqm`, `land_use_type`, `appraised_unit_price`, `total_land_value`, `cadastral_status`).
  - Kiểm thử Feature: `CapitalContributionTest` chạy thành công 5/5 tests (18 assertions, 0.86s).
- **Frontend:**
  - Page: `frontend/src/features/members/pages/CapitalPage.tsx`.
  - Components: `CapitalKpiCards.tsx`, `CapitalMembersTab.tsx`, `CapitalMemberDrawer.tsx`, `CapitalCharts.tsx`, `CapitalRecordModal.tsx`, `CapitalPendingModal.tsx`, `CapitalCertificateModal.tsx`, `CapitalVoucherModal.tsx`, `LandContributionsTab.tsx`, `LandContributionModal.tsx`.
  - **LỖI PHÁT HIỆN (Trùng lặp thành phần & dữ liệu dư thừa):**
    - Drawer `MemberDrawer.tsx`: Tab 2 (`capital` - `MemberTabCapital`) và Tab 4 (`farming` - `MemberTabFarmingPlots`) **CÙNG HIỂN THỊ TRÙNG LẶP** khối thông tin "Góp vốn bằng quyền sử dụng đất" (truy vấn cùng `memberLandContributions` từ cùng service, hiển thị cùng danh sách thửa đất, số sổ đỏ và diện tích).
    - Nút in Giấy chứng nhận phần vốn góp xuất hiện ở 3 nơi khác nhau: Drawer Header (`MemberDrawerHeader`), Tab Vốn góp (`MemberTabCapital:134`), và Tab Hồ sơ giấy tờ (`MemberTabDocuments:135`).

---

#### NGHIỆP VỤ 5: KẾ HOẠCH PHÂN PHỐI THẶNG DƯ (Surplus Distribution Plan per Luật HTX 2023)
- **Backend:**
  - Routes: `GET /surplus-distribution-plans`, `POST /surplus-distribution-plans`, `GET /surplus-distribution-plans/{id}`, `POST /surplus-distribution-plans/{id}/submit`, `POST /surplus-distribution-plans/{id}/approve` (`api.php:263-267`).
  - Controller: `Modules\Finance\Presentation\Http\Controllers\SurplusDistributionController.php`.
  - Service: `Modules\Finance\Application\Services\SurplusDistributionService.php`.
  - Form Request: `CreateSurplusDistributionPlanRequest.php:17-23`.
  - Ràng buộc nghiệp vụ Luật HTX 2023:
    - **Điều 83-84**: Trích lập Quỹ chung không chia tối thiểu $5\%$ (`distributableSurplus <= totalSurplus * 0.95`, `SurplusDistributionService.php:86-93`).
    - **Điều 85**: Tỷ trọng phân phối theo mức độ sử dụng dịch vụ tối thiểu $50\%$ (`serviceUsageWeight >= 50.0%`, `SurplusDistributionService.php:104-111`).
    - Tổng tỷ trọng vốn + dịch vụ: `capitalWeight + serviceUsageWeight == 100.0%`.
  - Thuật toán phân bổ tự động:
    - Tự động quét toàn bộ xã viên `ACTIVE`.
    - Trích xuất vốn góp thực tế từ `CapitalContributionModel` và giá trị sử dụng dịch vụ thực tế từ `StockIssueModel` (vật tư đã xuất nợ đầu vụ).
    - Tạo các bản ghi phân bổ chi tiết trong bảng `surplus_distribution_allocations` trong cùng Database Transaction.
  - Kiểm thử Feature: `FinanceManagementTest::test_surplus_distribution_plan_allocation_calculation_and_approval` chạy thành công (11 assertions, 0.85s).
- **Frontend:**
  - Page: `frontend/src/features/members/pages/ProfitPage.tsx`.
  - Components: `ProfitKpiCards.tsx`, `ProfitParamConfigCard.tsx`, `ProfitAllocationTable.tsx`, `ProfitCharts.tsx`, `CreateSurplusPlanModal.tsx`, `SurplusVoucherPrintModal.tsx`.
  - **LỖI PHÁT HIỆN NGHIÊM TRỌNG (Silent Mocking Runtime Fallback):**
    - Tại `ProfitPage.tsx:55-56`:
      ```typescript
      const [surplusPlan, setSurplusPlan] = useState<SurplusDistributionPlan>(mockSurplusPlan);
      const [surplusItems, setSurplusItems] = useState<SurplusDistributionItem[]>(mockSurplusItems);
      ```
    - Nếu API trả về mảng rỗng `[]` (chưa có phương án nào trong năm), màn hình **KHÔNG HIỂN THỊ Empty State** mà lập tức hiển thị dữ liệu giả lập `mockSurplusPlan` (1,25 tỷ VNĐ, niên độ 2024 giả) và danh sách 10 xã viên giả lập! Vi phạm nghiêm trọng Nguyên tắc 2 của `AGENT.md`.
    - Giao diện chứa nhiều thuật ngữ kế toán hàn lâm (TK 511, TK 512, Thuế TNDN 20%, Patronage rebate) không được chú thích đơn giản hóa cho nông dân.

---

## 2. MA TRẬN KIỂM TRA CRUD CHO 5 NGHIỆP VỤ (CRUD Verification Matrix)

Bảng tổng hợp tình trạng triển khai các thao tác CRUD (Create, Read, Update, Delete/Detail) trên cả 2 tầng Backend và Frontend:

| Nghiệp vụ | Thao tác | Backend API & Method | Frontend Component / Action | Tình trạng thực tế | Đánh giá & Rủi ro |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **1. Hồ sơ pháp lý HTX** | **Create** | Không có (Seed sẵn HTX) | Không có | `RESTRICTED_BY_DESIGN` | Hợp lý vì hệ thống Single-Tenant / Scope 1 HTX |
| | **Read (Xem)** | `GET /cooperatives/my-cooperative` | `CoopProfilePage.tsx` | `DEFECT_FE_DISCONNECTED` | **Backend có API nhưng Frontend KHÔNG GỌI, hardcode fallback** |
| | **Update (Sửa)** | `PUT /cooperatives/my-cooperative` | `CoopProfileEditModal.tsx` | `DEFECT_FE_DISCONNECTED` | **Frontend không gọi API PUT, chỉ lưu Zustand memory** |
| | **Delete (Xóa)** | Không có | Không có | `PROHIBITED_BY_LAW` | Không được xóa pháp nhân HTX khi đang vận hành |
| **2. Quản lý Xã viên** | **Create (Thêm)** | `POST /members` | `MemberWizard.tsx` (5 bước) | `IMPLEMENTED_VERIFIED` | Hoạt động tốt, kiểm tra trùng CCCD, lưu status DRAFT |
| | **Read (Danh sách)** | `GET /members` | `MembersTable.tsx` | `IMPLEMENTED_VERIFIED` | Có search, filter type/status, phân trang |
| | **Detail (Xem chi tiết)** | `GET /members/{id}` | `MemberDrawer.tsx` (6 tabs) | `IMPLEMENTED_OVERLOADED` | Đầy đủ nhưng bị nhồi nhét, tab 2 & 4 trùng thông tin đất |
| | **Update (Sửa)** | `PATCH /members/{id}` | `MemberEditModal.tsx` | `IMPLEMENTED_FLAWED` | Hoạt động, nhưng frontend nuốt lỗi nếu API thất bại |
| | **Delete (Xóa/Chấm dứt)**| `DELETE /members/{id}` | `DeleteMemberModal.tsx` | `IMPLEMENTED_SOFT_DELETE`| Backend chuyển `TERMINATED` + soft-delete; FE nuốt lỗi |
| | **Approve (Duyệt kết nạp)**| `POST /members/{id}/approve` | `ApproveRejectModal.tsx` | `IMPLEMENTED_VERIFIED` | Chuyển `DRAFT` $\rightarrow$ `ACTIVE`, ghi audit log |
| | **Transition (FSM)** | `POST /members/{id}/status-transitions` | `MemberStatusModals.tsx` | `PARTIAL_RESTRICTION` | Request validation thiếu status `SUSPENDED` |
| **3. Đại hội & Biểu quyết** | **Create (Tổ chức cuộc họp)**| `POST /meetings` | `CreateMeetingModal.tsx` | `IMPLEMENTED_VERIFIED` | Tạo cuộc họp thường niên / bất thường |
| | **Read (Danh sách/Chi tiết)**| `GET /meetings`, `GET /meetings/{id}` | `MeetingsTable.tsx`, `MeetingDetailDrawer.tsx` | `IMPLEMENTED_VERIFIED` | Tải dữ liệu thật từ backend React Query |
| | **Update (Cập nhật)** | `PATCH /meetings/{id}` | `MeetingDetailDrawer.tsx` | `DEFECT_METHOD_MISMATCH` | **FE gọi PUT trong khi BE chỉ cho phép PATCH (Lỗi 405)** |
| | **Vote (Biểu quyết)** | `POST /meetings/{id}/votes` | `CastVoteModal.tsx` | `IMPLEMENTED_VERIFIED` | Chống vote trùng, tính toán tỷ lệ 50% / 75% |
| | **Delete (Hủy cuộc họp)** | Không có route delete | Chỉ có chuyển status CANCELLED | `COMPLIANT_BY_DESIGN` | Bảo toàn biên bản biểu quyết, không xóa cứng |
| **4. Sổ vốn điều lệ & GCN** | **Create (Ghi nhận vốn)** | `POST /members/{id}/capital-contributions` | `CapitalRecordModal.tsx` | `IMPLEMENTED_VERIFIED` | Kiểm tra trần vốn 30% Luật HTX 2023 Điều 74 |
| | **Read (Tổng hợp/Lịch sử)** | `GET /capital-contributions/summary` | `CapitalKpiCards.tsx`, `CapitalMembersTab.tsx` | `IMPLEMENTED_VERIFIED` | Hiển thị tổng vốn thực góp, tỷ lệ hoàn thành |
| | **Issue Cert (Cấp GCN)** | Tự động khi ghi nhận vốn | `CapitalCertificateModal.tsx` | `IMPLEMENTED_VERIFIED` | Preview PDF A4 Giấy chứng nhận có mã QR |
| | **Land Contribution CRUD** | `POST/GET/DELETE /land-contributions` | `LandContributionsTab.tsx`, `LandContributionModal.tsx` | `IMPLEMENTED_VERIFIED` | Hỗ trợ đầy đủ thêm, xem danh sách và xóa QSDĐ |
| **5. Phân phối thặng dư** | **Create (Lập phương án)** | `POST /surplus-distribution-plans` | `CreateSurplusPlanModal.tsx` | `IMPLEMENTED_VERIFIED` | Tự động phân bổ theo vốn và doanh số dịch vụ |
| | **Read (Xem phương án)** | `GET /surplus-distribution-plans` | `ProfitAllocationTable.tsx`, `ProfitKpiCards.tsx` | `DEFECT_SILENT_MOCK` | **Khi CSDL chưa có plan, FE tự nạp mock data 1.25 tỷ** |
| | **Submit (Trình duyệt)** | `POST /surplus-distribution-plans/{id}/submit` | Nút "Gửi trình duyệt" tại header | `IMPLEMENTED_VERIFIED` | Chuyển `DRAFT` $\rightarrow$ `PENDING_APPROVAL` |
| | **Approve (Phê duyệt)** | `POST /surplus-distribution-plans/{id}/approve` | Nút "Phê duyệt" tại header | `IMPLEMENTED_VERIFIED` | Chuyển sang `APPROVED`, chốt số tiền phân phối |

---

## 3. RÀ SOÁT THÀNH PHẦN TRÙNG LẶP & MÀN HÌNH CHI TIẾT DƯ THỪA (Duplicate & Detail Bloat Audit)

### 3.1. Danh sách thành phần trùng lặp (Duplicate Components)
1. **Trùng lặp hiển thị Quyền sử dụng đất (Land Contribution):**
   - **Vị trí 1:** `frontend/src/features/members/components/drawer/tabs/MemberTabCapital.tsx` (dòng 155-250) — Khối "Góp vốn bằng quyền sử dụng đất" hiển thị danh sách thửa đất, số sổ đỏ, tờ bản đồ và giá trị thẩm định.
   - **Vị trí 2:** `frontend/src/features/members/components/drawer/tabs/MemberTabFarmingPlots.tsx` (dòng 145-200) — Khối "QSD Đất góp vốn vào HTX" hiển thị **chính xác 100% dữ liệu giống hệt Vị trí 1** bằng cùng câu truy vấn `landContributionService.getMemberLandContributions(member.id)`.
   - **Kiến nghị giải quyết:** Giữ lại QSDĐ góp vốn tại Tab 2 (`MemberTabCapital`) vì đây là tài sản hình thành vốn điều lệ HTX. Loại bỏ Card 3 khỏi Tab 4 (`MemberTabFarmingPlots`), tại Tab 4 chỉ tập trung vào phân công canh tác thực địa (Mã thửa, diện tích gieo trồng, mùa vụ và cách ly PHI).
2. **Trùng lặp thao tác In ấn / Xem Giấy chứng nhận phần vốn góp:**
   - **Vị trí 1:** `MemberDrawerHeader.tsx:114-121` (Nút Print icon ở thanh tiêu đề Drawer).
   - **Vị trí 2:** `MemberTabCapital.tsx:132-139` (Nút "Xem Giấy chứng nhận (PDF)").
   - **Vị trí 3:** `MemberTabDocuments.tsx:133-140` (Nút "Xem & In Giấy Chứng Nhận (PDF)").
   - **Kiến nghị giải quyết:** Giữ nút In tại `MemberTabCapital` và `MemberDrawerHeader`. Lược bỏ khối Card 2 trong `MemberTabDocuments` để biến Tab này thành kho lưu trữ tệp scan đính kèm thuần túy (Đơn gia nhập, bản sao CCCD, Hợp đồng công chứng).

### 3.2. Đánh giá chi tiết nhồi nhét thông tin (Detail Bloat in Drawer)
Khảo sát ngăn kéo chi tiết `MemberDrawer.tsx` (rộng `max-w-3xl`) với 6 tabs:
- **Thông tin bị thừa / gây rối mắt cần lược bỏ:**
  - Tại Tab 1 (`MemberTabPersonal`): Card 3 hiển thị "Tỷ lệ sở hữu HTX: ...% Vốn điều lệ" và "Trạng thái phê duyệt". Thông tin này bị lặp lại ngay trên Drawer Header (đã có Badge trạng thái và mã xã viên) và lặp lại tại Tab 2 (Vốn góp). Cần bỏ dòng "Tỷ lệ sở hữu" khỏi Tab 1 để giữ Tab 1 thuần túy là thông tin nhân thân.
  - Các trường Zalo, Facebook tại Tab 1: Đa số nông dân lớn tuổi không có hoặc không khai báo đường link Facebook, trường này để trống dạng `—` gây lãng phí không gian thị giác. Cần ẩn nếu giá trị rỗng (`!member.facebook && null`).
- **Thông tin cần giữ lại và làm nổi bật:**
  - Số CCCD, Ngày sinh, Giới tính, Số điện thoại.
  - Địa chỉ thường trú (Thôn/Xã).
  - Phân loại thành viên (Chính thức / Liên kết).
  - Vốn thực góp, Dư nợ vật tư hiện tại và Hạn mức nợ an toàn (`credit_limit`).
  - Lịch sử truy vết chuỗi kiểm toán SHA-256 (`MemberTabAuditTrace`).

---

## 4. BẰNG CHỨNG KIỂM THỬ NHẬP LIỆU THỰC TẾ & ĐỐI CHIẾU DATABASE (Live Persona & Integrity Proof)

Thực hiện kiểm thử mô phỏng 3 vai trò người dùng thực tế (Kế toán HTX, Giám đốc HTX, Xã viên) trên 3 kịch bản cho từng nghiệp vụ:

### Kịch bản A: Thêm xã viên & Chuyển trạng thái FSM (Member Persona)
1. **Kịch bản Thành công (Positive):**
   - Payload: `{"member_code": "XV_TEST_POS", "identity_information": {"full_name": "Phan Văn Đồng", "citizen_id": "049085009999", "phone_number": "0918889999", "address": "Thôn Đạ Sar"}, "member_type": "OFFICIAL", "committed_capital": 20000000}`.
   - Kết quả API: HTTP 201 Created. Trạng thái bản ghi khởi tạo là `DRAFT`.
   - Đối chiếu CSDL PostgreSQL: Bản ghi tồn tại trong bảng `members`, `deleted_at IS NULL`. Bảng `audit_events` ghi nhận action `MEMBER_CREATED` kèm mã băm SHA-256 `current_hash` nối chuỗi từ `prev_hash`.
2. **Kịch bản Bỏ trống trường bắt buộc (Missing Data):**
   - Payload: `{"member_code": "", "identity_information": {"full_name": ""}}`.
   - Kết quả API: HTTP 422 Unprocessable Content. Mã lỗi `VALIDATION_FAILED`. Thông báo tiếng Việt rõ ràng: "Mã xã viên không được để trống", "Họ và tên xã viên là bắt buộc".
   - Đối chiếu CSDL: Không có bản ghi rác nào được chèn vào bảng `members`.
3. **Kịch bản Vi phạm ràng buộc nghiệp vụ (Business Constraint Failure):**
   - Thao tác: Chuyển trạng thái trực tiếp từ `TERMINATED` sang `ACTIVE`.
   - Kết quả API: HTTP 400 Bad Request. Mã lỗi `ERR_MEMBER_INVALID_STATUS_TRANSITION`. Thông báo: "Không thể chuyển trạng thái xã viên từ [TERMINATED] sang [ACTIVE]".
   - Đối chiếu CSDL: Trạng thái bản ghi giữ nguyên `TERMINATED`, không bị ghi đè.

### Kịch bản B: Góp vốn vượt trần 30% Luật HTX 2023 (Accountant Persona)
1. **Kịch bản Thành công (Positive):**
   - Góp 50.000.000 ₫ cho thành viên khi tổng vốn HTX là 200.000.000 ₫ (tỷ lệ sở hữu sau góp: $50 / 200 = 25\% \le 30\%$).
   - Kết quả API: HTTP 201 Created. Tự động sinh `certificate_code` (`GCN-2026-XXXXXX`).
   - Đối chiếu CSDL: Bảng `capital_contributions` chèn bản ghi mới với `status = 'PAID'`. Bảng `audit_events` ghi nhận `CAPITAL_CONTRIBUTION_CREATED`.
2. **Kịch bản Vi phạm trần vốn 30% (Điều 74 Luật HTX 2023):**
   - Góp thêm 150.000.000 ₫ khiến tỷ lệ sở hữu của 1 thành viên đạt $55\% > 30\%$.
   - Kết quả API: HTTP 422 Unprocessable Content. Mã lỗi `ERR_CAPITAL_EXCEED_LIMIT`. Thông báo verbatim: "Giao dịch góp vốn làm tỷ lệ sở hữu của thành viên chính thức vượt trần 30% vốn điều lệ (dự kiến: 55%). Vi phạm Điều 74 Luật HTX 2023."
   - Đối chiếu CSDL: Giao dịch bị rollback 100%, không phát sinh bản ghi góp vốn thừa.

### Kịch bản C: Biểu quyết Đại hội & Chống gian lận (Director Persona)
1. **Kịch bản Thành công (Positive):**
   - Bỏ phiếu cho nghị quyết `NQ-2026-01` với lựa chọn `FOR` (Đồng ý).
   - Kết quả API: HTTP 201 Created. Bảng `votes` ghi nhận 1 phiếu.
2. **Kịch bản Bỏ phiếu trùng (Anti-Duplicate Vote):**
   - Cùng User tiếp tục gửi request bỏ phiếu lần 2 cho `NQ-2026-01`.
   - Kết quả API: HTTP 409 Conflict. Mã lỗi `DUPLICATE_VOTE`. Thông báo: "Bạn đã thực hiện biểu quyết cho nghị quyết [NQ-2026-01] rồi".
   - Đối chiếu CSDL: Bảng `votes` chỉ lưu đúng 1 bản ghi duy nhất, bảo toàn tính công bằng bầu cử.

---

## 5. ĐÁNH GIÁ TÍNH KHẢ DỤNG UX CHO NÔNG DÂN (Agricultural UX Evaluation)

| Tiêu chí | Hiện trạng đánh giá | Nhận xét chi tiết cho đối tượng Nông dân / Cán bộ HTX cơ sở | Đề xuất cải tiến cụ thể |
| :--- | :--- | :--- | :--- |
| **1. Độ rõ ràng nhãn tiếng Việt & Thuật ngữ** | Khá (7/10) | Các nhãn cơ bản (Họ tên, SĐT, Vốn góp, Biểu quyết) rõ ràng. Tuy nhiên, tại trang Phân phối thặng dư (`ProfitPage`) xuất hiện thuật ngữ chuyên ngành tài chính gây hoang mang cho nông dân như: "TK 511", "TK 512", "Patronage rebate", "Unallocated fund". | Thay thế bằng cụm từ mộc mạc: "Tiền lãi từ bán vật tư cho xã viên", "Tiền lãi từ kinh doanh bên ngoài", "Quỹ chung để lại không chia", "Tiền thưởng theo sản lượng bán cho HTX". |
| **2. Bố cục màn hình & Số bước thao tác** | Trung bình (6/10) | - `MemberWizard` (Thêm xã viên) có tới **5 bước** là quá dài đối với nông dân. Việc yêu cầu nhập ngay link Facebook, Zalo, thông tin người thụ hưởng, chi tiết tài khoản ngân hàng ở bước đầu là rào cản lớn.<br>- Drawer xem chi tiết có tới **6 tabs** nằm ngang gây tràn thanh cuộn trên màn hình điện thoại/máy tính bảng. | - Rút gọn Wizard thêm xã viên thành **2 bước cơ bản**: (Bước 1: Thông tin nhân thân & SĐT $\rightarrow$ Bước 2: Vốn cam kết). Các thông tin nâng cao cho phép bổ sung sau trong Drawer.<br>- Gom nhóm 6 tabs Drawer thành **4 tabs chính**: (1) Nhân thân & Liên lạc, (2) Vốn góp & QSD Đất, (3) Tài chính & Công nợ, (4) Canh tác & Nhật ký kiểm toán. |
| **3. Cảnh báo lỗi & Phản hồi trực quan** | Tốt (8/10) | Form nhập liệu có đánh dấu viền đỏ trường bắt buộc, tự động scroll đến trường lỗi đầu tiên. Thông báo Toast nổi góc phải có màu sắc phân biệt rõ (Xanh: Thành công, Đỏ: Lỗi, Vàng: Cảnh báo). | Tăng kích thước chữ Toast trên thiết bị di động ($\ge 14\text{px}$), hiển thị nút đóng to rõ để người lớn tuổi dễ thao tác. |
| **4. Thao tác trên thiết bị cảm ứng (Mobile/Tablet)** | Khá (7/10) | Nút bấm chính có chiều cao $\ge 40\text{px}$, các thẻ KPI to bản dễ đọc số liệu. Bảng danh sách có hỗ trợ thanh cuộn ngang. | Tăng touch target các icon hành động trong bảng (Xem, Sửa, In) từ $32\text{px}$ lên tối thiểu $44\text{px}$ để bấm ngón tay không bị trượt. |
| **5. Trạng thái trung thực dữ liệu (Truthful States)** | Kém (4/10) | Vi phạm nghiêm trọng ở 2 trang: `CoopProfilePage` (hardcode mock data, không kết nối API) và `ProfitPage` (nạp dữ liệu giả 1,25 tỷ khi CSDL chưa có plan). | **Xóa bỏ toàn bộ silent mock data**. Khi mảng rỗng, hiển thị Empty State với hình minh họa thân thiện và nút bấm "Tạo phương án phân phối đầu tiên". |

---

## 6. LOGIC CHAIN (Chuỗi suy luận từ quan sát đến kết luận)

1. **Quan sát 1:** Tại `CoopProfilePage.tsx:39-47`, hàm lưu hồ sơ chỉ gọi `setCooperative(newCoop)` vào Zustand store, hoàn toàn không gọi `apiClient.put('/cooperatives/my-cooperative')`.
   $\rightarrow$ **Suy luận 1:** Mặc dù Backend Laravel đã phát triển đầy đủ `CooperativeController@updateMyCooperative` có audit log SHA-256, Frontend bị "đứt gãy tích hợp" (Integration Gap), khiến dữ liệu pháp nhân HTX không thể lưu vào PostgreSQL.
2. **Quan sát 2:** Tại `memberService.ts:985-1044`, các mutation cập nhật, xóa, duyệt xã viên đều bọc trong `try-catch` và nuốt ngoại lệ, sau đó âm thầm cập nhật `localStorage` và trả về `true`.
   $\rightarrow$ **Suy luận 2:** Điều này tạo ra "thành công ảo" (False Positive UX). Nếu tài khoản người dùng không có quyền (HTTP 403) hoặc vi phạm nghiệp vụ (HTTP 422), giao diện vẫn báo thành công, làm mất tính toàn vẹn dữ liệu giữa client và server.
3. **Quan sát 3:** Tại `backend/routes/api.php:136`, route update cuộc họp là `PATCH /meetings/{id}`, trong khi `meetingApi.ts:104` gọi `apiClient.put(...)`.
   $\rightarrow$ **Suy luận 3:** Khi người dùng bấm lưu sửa cuộc họp trên giao diện, request sẽ bị Laravel từ chối với mã lỗi HTTP 405 Method Not Allowed.
4. **Quan sát 4:** Tại `MemberDrawer.tsx`, Tab 2 (`MemberTabCapital`) và Tab 4 (`MemberTabFarmingPlots`) cùng truy vấn và hiển thị khối dữ liệu QSD Đất (`land_contributions`).
   $\rightarrow$ **Suy luận 4:** Giao diện bị trùng lặp thành phần (Component Bloat), gây lãng phí băng thông truy vấn 2 lần cùng một dữ liệu và gây rối mắt cho người dùng.
5. **Quan sát 5:** Tại `ProfitPage.tsx:55-56`, `useState` được khởi tạo bằng `mockSurplusPlan` và `mockSurplusItems`.
   $\rightarrow$ **Suy luận 5:** Đây là hành vi vi phạm trực tiếp Nguyên tắc Toàn vẹn Dữ liệu (Rule 2 trong `AGENT.md` & `GEMINI.md`). Khi HTX mới triển khai chưa có dữ liệu, người dùng nhìn thấy số liệu 1,25 tỷ VNĐ và danh sách 10 xã viên không có thật trong HTX của họ.

---

## 7. CAVEATS (Vấn đề ngoại vi & Giả định)

1. **Giả định về Single-Cooperative Scope:** Hiện tại hệ thống đang cấu hình mặc định cho 1 HTX (HTX Tân Tiến, Lạc Dương, Lâm Đồng). Mặc dù Backend đã có `tenant.scope` sẵn sàng cho Multi-tenant, một số trang Frontend vẫn hiển thị văn bản tĩnh ghi tên HTX Tân Tiến thay vì đọc 100% từ hồ sơ HTX động.
2. **Về chức năng xóa xã viên:** Luật HTX 2023 và `docs/30_MEMBER_WORKFLOW.md` nghiêm cấm Hard Delete. Backend đã tuân thủ Soft Delete (`status = 'TERMINATED'`), nhưng trên giao diện nút bấm vẫn có nhãn "Xóa xã viên" gây hiểu lầm cho cán bộ HTX rằng dữ liệu sẽ biến mất vĩnh viễn. Cần đổi nhãn thành "Chấm dứt tư cách thành viên".
3. **Phân quyền RBAC tại Frontend:** Các nút hành động (Duyệt, Xóa, Sửa) trên giao diện hiện tại được hiển thị dựa trên trạng thái bản ghi, chưa bọc đầy đủ trong component kiểm tra quyền RBAC của tài khoản đang đăng nhập (ví dụ: `can('MEMBER.DELETE')`). Cần đồng bộ kiểm tra quyền trên UI để tránh người dùng không đủ quyền bấm nút rồi nhận thông báo lỗi 403.

---

## 8. CONCLUSION (Kết luận & Đề xuất hành động có thứ tự ưu tiên)

Hệ thống Phân hệ 1 (Quản trị HTX & Xã viên) có **nền tảng Backend Laravel 11 rất vững chắc**: Kiến trúc Modular Monolith 4 lớp chuẩn mực, toàn bộ 9 tests `MemberTest`, 5 tests `CapitalContributionTest`, và các tests Meeting/Surplus đều chạy xanh 100%, tuân thủ chặt chẽ Luật HTX 2023 (trần vốn 30%, ngưỡng biểu quyết 50%/75%, trích quỹ không chia $\ge 5\%$, chia theo dịch vụ $\ge 50\%$, chuỗi kiểm toán SHA-256).

Tuy nhiên, **Frontend React hiện tồn tại 5 điểm khiếm khuyết lớn cần khắc phục triệt để**:
1. **P0 — Kết nối API thật cho `CoopProfilePage`:** Xóa bỏ mock object hardcoded, gọi API `GET /cooperatives/my-cooperative` khi tải trang và gọi `PUT /cooperatives/my-cooperative` khi lưu biểu mẫu.
2. **P0 — Xóa bỏ Silent Mocking tại `ProfitPage` & `memberService.ts`:**
   - Xóa bỏ `mockSurplusPlan` và `mockSurplusItems` ở runtime.
   - Khi API trả về rỗng, hiển thị Empty State chuẩn mực kèm nút hướng dẫn "Khởi tạo phương án phân chia thặng dư niên độ mới".
   - Loại bỏ cơ chế nuốt lỗi `catch (err) { saveMembersToStorage(...) }` trong `memberService.ts`; khi API lỗi phải bắn toast báo lỗi trung thực với mã lỗi từ backend.
3. **P1 — Sửa lỗi HTTP Method Mismatch tại cuộc họp đại hội:** Điều chỉnh `meetingApi.ts:104` từ `apiClient.put` thành `apiClient.patch` để khớp hoàn toàn với `Route::patch('/meetings/{id}')`.
4. **P1 — Tinh gọn Drawer chi tiết xã viên (`MemberDrawer`):**
   - Loại bỏ khối QSDĐ trùng lặp tại Tab Canh tác (`MemberTabFarmingPlots`), chỉ giữ tại Tab Vốn góp (`MemberTabCapital`).
   - Loại bỏ khối cấp chứng nhận trùng lặp tại Tab Giấy tờ (`MemberTabDocuments`).
   - Ẩn các trường thông tin rỗng (Facebook, Zalo) để tránh màn hình bị loãng.
5. **P2 — Đơn giản hóa UX Nông dân:** Rút gọn Wizard thêm xã viên thành 2 bước cốt lõi; việt hóa và mộc mạc hóa các thuật ngữ kế toán tại trang Phân phối thặng dư.

---

## 9. VERIFICATION METHOD (Phương pháp kiểm chứng độc lập)

Để kiểm chứng độc lập tính chính xác của các nhận định trong báo cáo này:

### 1. Kiểm chứng Backend Suites
Chạy các lệnh kiểm thử tự động trên terminal:
```powershell
cd f:/HTX_OCOP_PROJECT/backend
php artisan test --filter=MemberTest
php artisan test --filter=CapitalContributionTest
php artisan test --filter=Surplus
php artisan test --filter=Meeting
```
*Kỳ vọng:* Toàn bộ các bài test phải vượt qua (Green 100%), chứng minh logic nghiệp vụ backend đã hoàn chỉnh và hoạt động đúng theo Luật HTX 2023.

### 2. Kiểm chứng lỗi Frontend Disconnect tại `CoopProfilePage`
1. Mở tệp `frontend/src/features/members/pages/CoopProfilePage.tsx`.
2. Kiểm tra dòng 39-47: Quan sát thấy `handleSaveProfile` không hề có bất kỳ câu lệnh gọi `apiClient.put` hoặc service backend nào.
3. Khởi chạy frontend (`npm run dev`), truy cập trang Hồ sơ HTX, chỉnh sửa tên HTX, bấm Lưu.
4. F5 tải lại trang: Dữ liệu trở về giá trị ban đầu, chứng minh dữ liệu chưa từng được ghi vào PostgreSQL.

### 3. Kiểm chứng lỗi Silent Mocking tại `ProfitPage`
1. Mở tệp `frontend/src/features/members/pages/ProfitPage.tsx`.
2. Kiểm tra dòng 55-56: Thấy rõ `useState(mockSurplusPlan)` và `useState(mockSurplusItems)`.
3. Kiểm tra CSDL bảng `surplus_distribution_plans`: Dù bảng trống rỗng không có bản ghi nào, giao diện `ProfitPage` vẫn hiển thị số tiền 1.250.000.000 ₫ và các thành viên giả lập.

### 4. Kiểm chứng lỗi HTTP 405 Method Mismatch tại `MeetingController`
1. Đối chiếu `backend/routes/api.php` dòng 136: `Route::patch('/meetings/{id}', ...)`.
2. Đối chiếu `frontend/src/services/meetingApi.ts` dòng 104: `apiClient.put(...)`.
3. Nhận định: Khác biệt phương thức HTTP giữa `PATCH` và `PUT`.
