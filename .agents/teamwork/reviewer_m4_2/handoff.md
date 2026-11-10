# BÁO CÁO THẨM ĐỊNH VÀ PHẢN BIỆN ĐỐI KHÁNG (REVIEWER & ADVERSARIAL CRITIC REPORT)
## MILESTONE 4: PHÂN HỆ 1 — QUẢN TRỊ HỢP TÁC XÃ & XÃ VIÊN
> **Tác nhân:** Reviewer 2 & Adversarial Critic (`reviewer_m4_2`)  
> **Tài liệu thẩm tra:** `docs/BAO_CAO_DANH_GIA_UIUX_VA_CSDL_PHAN_HE_1_QUAN_TRI_HTX.md` & Toàn bộ mã nguồn Phân hệ 1  
> **Thời điểm thẩm tra:** 2026-11-02T16:48:00Z  
> **Căn cứ pháp lý & quy chuẩn:** Luật HTX số 17/2023/QH15 (Điều 72, 74, 83-85), Luật Đất đai 2024, `AGENT.md`, `GEMINI.md`, Trụ Cột IV, Quy tắc 2 (Truthful Data States).

---

## I. REVIEW SUMMARY & VERDICT

### **VERDICT: REQUEST_CHANGES**
**Lý do cốt lõi:**  
Mặc dù tầng Backend (Laravel 11 & PostgreSQL 16) được xây dựng bài bản và vượt qua 26/26 tests (`RolePersonaAuthorizationTest`, `AuditAndReportTest`, `FinanceManagementTest` đạt 129 assertions xanh 100%), quá trình thẩm tra độc lập và kiểm toán đối kháng phát hiện **4 SAI PHẠM TOÀN VẸN NGHIÊM TRỌNG (INTEGRITY VIOLATIONS)** và **3 RỦI RO PHÁP LÝ & BẢO MẬT TRỌNG YẾU**:
1. **[CRITICAL - INTEGRITY VIOLATION] Giả lập ngầm số liệu tài chính tại Runtime (Silent Mocking):** `ProfitPage.tsx` tự động nạp `mockSurplusPlan` (1,25 tỷ VNĐ) và 10 xã viên giả khi CSDL rỗng; hàm lưu chỉ cập nhật React state trong bộ nhớ và toast thành công giả, hoàn toàn không gọi API lưu vào CSDL PostgreSQL.
2. **[CRITICAL - INTEGRITY VIOLATION] Giao diện Hồ sơ HTX giả lập ngắt kết nối hoàn toàn (Facade Implementation):** `CoopProfilePage.tsx` không gọi API `GET/PUT /api/v1/cooperatives/my-cooperative`; nạp dữ liệu từ local store và phát toast thành công giả khi lưu.
3. **[CRITICAL - INTEGRITY VIOLATION] Nuốt ngoại lệ và báo thành công ảo tại `memberService.ts`:** Các thao tác sửa, xóa, duyệt xã viên bọc trong `catch`, âm thầm ghi vào `localStorage` và trả về `true`, che giấu lỗi 403/422 từ Backend.
4. **[CRITICAL - INTEGRITY VIOLATION] Cài cắm mã giả lập đọc số (Dummy Facade):** `MemberTabCapital.tsx:19-24` hardcode cố định số tiền 50 triệu và 10 triệu trong hàm `numberToVietnameseWords`.
5. **[MAJOR - LEGAL & SECURITY BREACH] Vi phạm nguyên tắc biểu quyết bình đẳng Điều 72 Luật HTX 2023:** `CastVoteRequest.php` và `CastVoteModal.tsx` cho phép người dùng tùy ý nhập trọng số biểu quyết `weight` (bước nhảy `0.0001`), cho phép một thành viên thao túng kết quả đại hội; đồng thời `MeetingService::castVote` không kiểm tra tư cách thành viên chính thức (`ACTIVE` & `OFFICIAL`), cho phép người ngoài bỏ phiếu.
6. **[MAJOR - DEFECT METHOD MISMATCH] Lỗi xung đột HTTP Method:** `meetingApi.ts:104` gọi `PUT` trong khi `api.php:136` chỉ định nghĩa `PATCH`, dẫn đến lỗi HTTP 405 Method Not Allowed khi cập nhật cuộc họp.
7. **[MAJOR - ADVERSARIAL RACE CONDITION & FIRST CONTRIBUTOR DEADLOCK]:** `CapitalContributionService::createContribution` không có `DB::transaction` hay `lockForUpdate()`, cho phép tấn công đồng thời vượt trần 30% Điều 74; đồng thời chặn đứng xã viên đầu tiên góp vốn (tỷ lệ $100\% > 30\%$) do tính trên vốn đã nộp thay vì vốn điều lệ đăng ký.

---

## II. 5-COMPONENT HANDOFF REPORT

### 1. Observation (Quan sát Thực chứng)

#### A. Kết quả Chạy Lệnh Kiểm thử Backend
Thực thi lệnh trong môi trường Powershell tại `f:/HTX_OCOP_PROJECT/backend`:
```powershell
php artisan test --filter="RolePersonaAuthorizationTest|AuditAndReportTest|FinanceManagementTest"
```
**Kết quả thực tế:**
- `Tests\Feature\AuditAndReportTest`: 11 passed (63 assertions, 0.90s)
- `Tests\Feature\FinanceManagementTest`: 9 passed (34 assertions, 0.36s)
- `Tests\Feature\RolePersonaAuthorizationTest`: 6 passed (32 assertions, 0.52s)
- **Tổng số test:** 26 passed, 129 assertions, thời gian chạy: 1.92s, Exit code: 0.

#### B. Kiểm chứng 5 Khuyết tật Tích hợp Cốt lõi

##### Khuyết tật 1: Ngắt kết nối API tại `CoopProfilePage.tsx`
- **Tệp:** `f:/HTX_OCOP_PROJECT/frontend/src/features/members/pages/CoopProfilePage.tsx`
- **Dòng 26–47:**
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

  const handleSaveProfile = async (updated: Partial<Cooperative>) => {
    const newCoop: Cooperative = {
      ...coop,
      ...updated,
    };
    setCooperative(newCoop);
    showToast('Cập nhật hồ sơ pháp lý Hợp tác xã thành công!', 'success');
    setIsEditModalOpen(false);
  };
```
- **Xác thực:** Hoàn toàn không import hoặc sử dụng `apiClient` hay React Query để gọi `GET /api/v1/cooperatives/my-cooperative` hoặc `PUT /api/v1/cooperatives/my-cooperative`. Người dùng sửa xong chỉ lưu vào Zustand store, tải lại trang là mất dữ liệu.

##### Khuyết tật 2: Giả lập ngầm dữ liệu tài chính tại `ProfitPage.tsx`
- **Tệp:** `f:/HTX_OCOP_PROJECT/frontend/src/features/members/pages/ProfitPage.tsx`
- **Dòng 15–16, 55–56, 177–215:**
```typescript
import { mockSurplusPlan, mockSurplusItems } from '../mock/mockSurplusData';
...
const [surplusPlan, setSurplusPlan] = useState<SurplusDistributionPlan>(mockSurplusPlan);
const [surplusItems, setSurplusItems] = useState<SurplusDistributionItem[]>(mockSurplusItems);
...
const handleUpdateProfitPlan = (e: React.FormEvent) => {
  e.preventDefault();
  ...
  setSurplusPlan({
    ...surplusPlan,
    ...
  });
  triggerToast(`Đã cập nhật phương án phân chia thặng dư năm ${profitPlanForm.fiscal_year} theo Luật HTX 2023!`);
};
```
- **Xác thực:** Khi CSDL chưa có phương án nào (`apiPlans.length === 0`), giao diện tự động đổ dữ liệu giả 1,25 tỷ VNĐ. Khi kế toán bấm "Lưu", hàm chỉ cập nhật React local state và phát toast thông báo, hoàn toàn không gọi `POST /api/v1/surplus-distribution-plans`.

##### Khuyết tật 3: Nuốt lỗi và báo thành công ảo tại `memberService.ts`
- **Tệp:** `f:/HTX_OCOP_PROJECT/frontend/src/services/memberService.ts`
- **Dòng 985–999 (`updateMemberApi`):**
```typescript
  } catch (error) {
    console.warn('API update member notice:', error);
  }

  const stored = getStoredMembers();
  if (stored) {
    const nextList = stored.map((m) =>
      m.id === id ? { ...m, ...memberData, ...(updatedMember || {}) } : m
    );
    saveMembersToStorage(nextList);
    const target = nextList.find((m) => m.id === id);
    if (target) return target;
  }
  return updatedMember || (memberData as Member);
```
- **Dòng 1003–1015 (`deleteMemberApi`):**
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
- **Dòng 1017–1030 (`approveMemberApi`), 1032–1045 (`transitionMemberStatusApi`):** Cơ chế tương tự: nuốt exception, ghi `localStorage`, trả về `true`.
- **Xác thực:** Khi API Backend từ chối do phân quyền (403), vi phạm dữ liệu (422) hoặc xung đột (409), client nuốt lỗi âm thầm và báo thành công ảo.

##### Khuyết tật 4: Xung đột HTTP Method tại API Cuộc họp Đại hội
- **Backend route:** `f:/HTX_OCOP_PROJECT/backend/routes/api.php:136`:
```php
Route::patch('/meetings/{id}', [MeetingController::class, 'update'])->name('api.meetings.update');
```
- **Frontend client:** `f:/HTX_OCOP_PROJECT/frontend/src/services/meetingApi.ts:104`:
```typescript
async updateMeeting(id: string, payload: Partial<CreateMeetingPayload>): Promise<Meeting> {
  const res: any = await apiClient.put(`/meetings/${id}`, payload);
  return res.data?.data || res.data;
},
```
- **Xác thực:** Không có route `PUT /meetings/{id}` trong backend. Bất kỳ thao tác lưu chỉnh sửa cuộc họp từ frontend đều bị Laravel chặn lại với mã lỗi HTTP 405 Method Not Allowed.

##### Khuyết tật 5: Trùng lặp hiển thị QSD Đất trong `MemberDrawer.tsx`
- **Tệp 1:** `frontend/src/features/members/components/drawer/tabs/MemberTabCapital.tsx:212-225` ("CARD 3: QUYỀN SỬ DỤNG ĐẤT GÓP VỐN (SỔ ĐỎ)").
- **Tệp 2:** `frontend/src/features/members/components/drawer/tabs/MemberTabFarmingPlots.tsx:145-199` ("CARD 3: GÓP VỐN BẰNG QUYỀN SỬ DỤNG ĐẤT").
- **Xác thực:** Cùng nạp và hiển thị danh sách `landContributions` (thửa đất, tờ bản đồ, số GCN, diện tích m², giá trị thẩm định) tại 2 tab khác nhau của cùng 1 drawer.

#### C. Các Phát hiện Bổ sung về Tuân thủ Pháp lý & Tính Toàn vẹn Mã nguồn
1. **Facade đọc số tiền:** `frontend/src/features/members/components/drawer/tabs/MemberTabCapital.tsx:19-24`:
```typescript
const numberToVietnameseWords = (amount: number): string => {
  if (!amount || amount === 0) return 'Không đồng';
  if (amount === 50000000) return 'Năm mươi triệu đồng';
  if (amount === 10000000) return 'Mười triệu đồng';
  return `${amount.toLocaleString('vi-VN')} đồng`;
};
```
2. **Cạm bẫy gán mặc định nợ 50 triệu:** `MemberWizard.tsx:59-61`:
`committed_capital: 50000000, initial_contributed_capital: 10000000, capital_in_words: 'Năm mươi triệu đồng'`.
3. **Thành phần mồ côi (Dead Code):**
- `frontend/src/features/members/components/drawer/MemberCapitalSection.tsx` (164 dòng - không import ở đâu).
- `frontend/src/features/members/components/drawer/MemberDocumentsSection.tsx` (144 dòng - không import ở đâu).
- `frontend/src/features/members/components/CapitalMemberDrawer.tsx` (761 dòng - trùng 80% với `MemberDrawer.tsx`).

---

### 2. Logic Chain (Chuỗi Lập luận Suy biến)

1. **Từ Quan sát A:** Backend tests báo xanh 26/26, chứng minh các quy tắc nghiệp vụ tài chính (quỹ không chia $\ge 5\%$, dịch vụ $\ge 50\%$, phân quyền SoD, hash chain) đã có cài đặt ở tầng Backend.
2. **Từ Quan sát B1 & B2:** Các trang Frontend trọng yếu (`CoopProfilePage` và `ProfitPage`) không kết nối với các endpoint Backend này mà sử dụng dữ liệu giả lập ngầm (silent mock) và state bộ nhớ.
3. **Từ Quan sát B3:** `memberService.ts` chủ động nuốt ngoại lệ mạng/backend để cập nhật vào `localStorage`. Điều này tạo ra trạng thái "thành công ảo" đối với người dùng (bấm sửa/xóa/duyệt xã viên đều báo xanh nhưng PostgreSQL không hề thay đổi).
4. **Từ Quan sát B4:** Khi người dùng cố gắng sửa thông tin cuộc họp đại hội, yêu cầu gửi đi thất bại ngay lập tức với lỗi HTTP 405 do lệch phương thức HTTP (`PUT` vs `PATCH`).
5. **Từ Quan sát C1:** Hàm `numberToVietnameseWords` là một cài đặt facade thuần túy, chỉ khớp cho 2 giá trị 50 triệu và 10 triệu để "đối phó" giao diện mẫu.
6. **Suy ra:** Mặc dù báo cáo `docs/BAO_CAO_DANH_GIA_UIUX_VA_CSDL_PHAN_HE_1_QUAN_TRI_HTX.md` đã khảo sát và chỉ ra các khuyết tật này rất chi tiết và trung thực, bản thân hệ thống thực tế đang vi phạm nghiêm trọng **Nguyên tắc Toàn vẹn Dữ liệu (Rule 2 - Cấm Silent Mocking)** và xuất hiện các mẫu hình **FACADE / DUMMY IMPLEMENTATION**.
7. **Kết luận logic:** Theo quy tắc bắt buộc của Reviewer & Critic: *"If you detect ANY of these patterns, your verdict MUST be REQUEST_CHANGES with a Critical finding tagged as INTEGRITY VIOLATION. Do NOT approve work that cheats, regardless of test scores."* Do đó, quyết định thẩm định bắt buộc là **REQUEST_CHANGES**.

---

### 3. Caveats (Khu vực Chưa Khảo sát & Giả định)

1. **Phạm vi thẩm tra:** Đợt thẩm tra này tập trung chuyên sâu vào Phân hệ 1 (Quản trị HTX & Xã viên, Vốn điều lệ, Đại hội biểu quyết, Phân phối thặng dư). Các phân hệ khác (Sản xuất nông nghiệp, Kho vật tư, Hồ sơ OCOP) chỉ được kiểm tra ở mức độ liên thông tài chính và phân quyền, không rà soát chi tiết từng màn hình UI.
2. **Môi trường chạy test:** Kiểm thử PHPUnit được thực hiện với cơ sở dữ liệu SQLite in-memory / PostgreSQL cấu hình test của dự án. Không chạy stress-test tải hàng ngàn request đồng thời ngoài thực địa mạng Internet.

---

### 4. Conclusion (Kết luận Đánh giá)

- **Đánh giá tổng thể Báo cáo Kiểm toán Master (`docs/BAO_CAO_DANH_GIA_UIUX_VA_CSDL_PHAN_HE_1_QUAN_TRI_HTX.md`):** Đạt chất lượng kỹ thuật xuất sắc, phản ánh trung thực 100% hiện trạng mã nguồn, không che giấu lỗi, cung cấp bằng chứng rõ ràng và lộ trình P0, P1, P2 rất khả thi.
- **Đánh giá Sản phẩm Phần mềm Phân hệ 1:** **CHƯA ĐẠT ĐIỀU KIỆN NGHIỆM THU (UNREADY FOR PRODUCTION)**. Tồn tại 4 vi phạm toàn vẹn dữ liệu (Silent Mocking, Disconnected API, Error Swallowing, Hardcoded Number-to-Words) và 3 lỗ hổng pháp lý/kỹ thuật (Voter weight manipulation, Method 405, Capital concurrency race condition).
- **Phán quyết:** **REQUEST_CHANGES**. Yêu cầu Đội ngũ Kỹ thuật thực thi ngay Giai đoạn 1 (Nhóm Ưu tiên P0) và sửa lỗi HTTP Method P1-1 trước khi tiến hành nghiệm thu lại.

---

### 5. Verification Method (Phương pháp Kiểm chứng Độc lập)

Người nhận bàn giao hoặc kiểm toán viên tiếp theo có thể kiểm chứng độc lập báo cáo này bằng các bước:
1. **Kiểm tra Backend Test:**
   ```powershell
   cd f:\HTX_OCOP_PROJECT\backend
   php artisan test --filter="RolePersonaAuthorizationTest|AuditAndReportTest|FinanceManagementTest"
   ```
   *Điều kiện kiểm chứng:* 26 test báo xanh, không có lỗi.
2. **Kiểm chứng Ngắt kết nối `CoopProfilePage`:**
   Mở tệp `f:/HTX_OCOP_PROJECT/frontend/src/features/members/pages/CoopProfilePage.tsx`, kiểm tra dòng 26-47 để xác nhận không có `useQuery` hay `apiClient.put`.
3. **Kiểm chứng Silent Mocking `ProfitPage`:**
   Mở tệp `f:/HTX_OCOP_PROJECT/frontend/src/features/members/pages/ProfitPage.tsx`, kiểm tra dòng 55-56 (`mockSurplusPlan`) và dòng 177-215 (`handleUpdateProfitPlan` không gọi API).
4. **Kiểm chứng Nuốt lỗi `memberService.ts`:**
   Mở tệp `f:/HTX_OCOP_PROJECT/frontend/src/services/memberService.ts`, kiểm tra dòng 985-999 (`updateMemberApi`), 1003-1015 (`deleteMemberApi`) để thấy khối `catch` âm thầm lưu vào `localStorage`.
5. **Kiểm chứng Lỗi HTTP 405 Cuộc họp:**
   So sánh `frontend/src/services/meetingApi.ts:104` (`apiClient.put`) với `backend/routes/api.php:136` (`Route::patch`).

---

## III. QUALITY REVIEW FINDINGS

### [Critical - INTEGRITY VIOLATION] Finding 1: Giả lập ngầm số liệu tài chính tại `ProfitPage.tsx`
- **Vị trí:** `frontend/src/features/members/pages/ProfitPage.tsx:55-56, 177-215`
- **Vấn đề:** Khi API trả về mảng rỗng, hệ thống hiển thị 1,25 tỷ VNĐ tiền lãi và danh sách xã viên giả. Nút lưu cấu hình không gửi API tới backend.
- **Hậu quả:** Vi phạm nghiêm trọng Nguyên tắc 2 (Cấm Silent Mocking tại Runtime), gây hiểu sai số liệu tài chính HTX.
- **Khắc phục:** Xóa bỏ `mockSurplusPlan`. Render Empty State khi danh sách rỗng. Kết nối `handleUpdateProfitPlan` với `POST /api/v1/surplus-distribution-plans`.

### [Critical - INTEGRITY VIOLATION] Finding 2: Hồ sơ HTX ngắt kết nối API hoàn toàn
- **Vị trí:** `frontend/src/features/members/pages/CoopProfilePage.tsx:26-47`
- **Vấn đề:** Đọc và ghi hoàn toàn trên Zustand memory; không gọi `GET` hoặc `PUT /api/v1/cooperatives/my-cooperative`.
- **Hậu quả:** Dữ liệu chỉnh sửa pháp nhân HTX không được lưu vào PostgreSQL; audit log SHA-256 không được kích hoạt.
- **Khắc phục:** Thay mock object bằng React Query `GET /api/v1/cooperatives/my-cooperative`; gọi mutation `PUT` trong `handleSaveProfile`.

### [Critical - INTEGRITY VIOLATION] Finding 3: Nuốt ngoại lệ và báo thành công ảo tại `memberService.ts`
- **Vị trí:** `frontend/src/services/memberService.ts:985-1045`
- **Vấn đề:** Bọc API call trong `try ... catch` rỗng, nuốt lỗi 403/422/500 và tự động ghi `localStorage` rồi trả về `true`.
- **Hậu quả:** Người dùng tưởng hệ thống đã lưu thành công nhưng thực chất backend đã từ chối.
- **Khắc phục:** Xóa khối catch fallback `localStorage`; re-throw exception để giao diện hiển thị Toast lỗi trung thực.

### [Critical - INTEGRITY VIOLATION] Finding 4: Cài cắm mã giả lập đọc số tiền (Dummy Facade)
- **Vị trí:** `frontend/src/features/members/components/drawer/tabs/MemberTabCapital.tsx:19-24`
- **Vấn đề:** Hàm `numberToVietnameseWords` chỉ kiểm tra cứng 2 giá trị 50.000.000 đ và 10.000.000 đ.
- **Hậu quả:** Bất kỳ khoản tiền nào khác (ví dụ: 15.000.000 đ) đều bị hiển thị sai thành "15.000.000 đồng" thay vì "Mười lăm triệu đồng".
- **Khắc phục:** Tích hợp thư viện đọc số tiếng Việt chuẩn hoặc util dùng chung hoàn chỉnh.

### [Major] Finding 5: Xung đột HTTP Method gây lỗi 405 khi cập nhật cuộc họp
- **Vị trí:** `frontend/src/services/meetingApi.ts:104` vs `backend/routes/api.php:136`
- **Vấn đề:** Frontend gọi `PUT` trong khi Backend định nghĩa `PATCH`.
- **Hậu quả:** Người dùng không thể lưu thông tin cuộc họp đại hội.
- **Khắc phục:** Đổi `apiClient.put` thành `apiClient.patch` trong `meetingApi.ts`.

---

## IV. ADVERSARIAL CRITIQUE & ATTACK SURFACE

### 1. Challenge 1 [CRITICAL]: Thao túng Biểu quyết Đại hội qua Trọng số Tùy ý (Voter Weight Hijacking)
- **Giả định bị thách thức:** Hệ thống cho rằng người dùng hoặc client sẽ gửi đúng tỷ lệ vốn góp của mình trong trường `weight`.
- **Kịch bản tấn công:**
  1. Kẻ xấu hoặc xã viên liên kết gửi payload:
     `POST /api/v1/meetings/{id}/votes`
     `{ "resolution_code": "NQ-01", "choice": "FOR", "weight": 9999999.0 }`
  2. `CastVoteRequest.php:20` chỉ kiểm tra `'weight' => ['nullable', 'numeric', 'min:0.0001']`.
  3. `MeetingService.php:181` gán thẳng `'weight' => $data['weight']`.
  4. `MeetingService.php:222` tính `$approvalRate = ($forWeight / $totalWeight) * 100`.
- **Tác động (Blast Radius):** Một cá nhân duy nhất có thể tự tạo trọng số áp đảo hàng trăm xã viên khác để thông qua bất kỳ nghị quyết nào (kể cả giải thể hay sửa điều lệ), vi phạm trắng trợn Điều 72 Luật HTX 2023.
- **Biện pháp khắc phục (Mitigation):**
  - **LOẠI BỎ HOÀN TOÀN** trường `weight` khỏi `CastVoteRequest` và giao diện `CastVoteModal.tsx`.
  - Mặc định mỗi thành viên chính thức chỉ có **1 phiếu duy nhất** (`weight = 1.0000`) theo nguyên tắc bình đẳng dân chủ Điều 72 Luật HTX 2023. Nếu Điều lệ HTX có quy định biểu quyết theo vốn, Backend phải tự truy vấn số vốn từ CSDL, cấm tin tưởng client.

### 2. Challenge 2 [HIGH]: Lỗ hổng Bỏ phiếu Trái Thẩm quyền (Unauthorized Voting Bypass)
- **Giả định bị thách thức:** Hệ thống giả định mọi user đăng nhập đều có quyền bỏ phiếu.
- **Kịch bản tấn công:**
  - Thành viên liên kết (`ASSOCIATED`), xã viên bị tạm đình chỉ (`SUSPENDED`), xã viên đã thôi việc (`TERMINATED`), hoặc người dùng thuộc HTX khác (cross-tenant) gửi lệnh `POST /api/v1/meetings/{id}/votes`.
  - Hàm `MeetingService::castVote` **hoàn toàn không kiểm tra** `member_type === 'OFFICIAL'` hay `status === 'ACTIVE'`.
- **Tác động (Blast Radius):** Người ngoài hoặc thành viên không có quyền biểu quyết vẫn ghi được phiếu vào bảng `votes` và được tính vào kết quả nghị quyết.
- **Biện pháp khắc phục (Mitigation):** Thêm bước thẩm tra trong `castVote`:
  ```php
  $member = MemberModel::where('cooperative_id', $meeting->cooperative_id)
      ->where('user_id', $userId)
      ->where('status', 'ACTIVE')
      ->where('member_type', 'OFFICIAL')
      ->firstOrFail();
  ```

### 3. Challenge 3 [HIGH]: Bế tắc Góp vốn Xã viên Đầu tiên & Race Condition Vượt Trần 30%
- **Giả định bị thách thức:** Hệ thống cho rằng công thức tính trần vốn 30% Điều 74 có thể dựa trên tổng vốn hiện có trong bảng `capital_contributions`.
- **Kịch bản lỗi 1 (Bế tắc xã viên đầu tiên):**
  - Một HTX mới thành lập có vốn điều lệ đăng ký 1 tỷ VNĐ.
  - Xã viên đầu tiên đến nộp 50 triệu VNĐ.
  - `CapitalContributionService.php:139-155`:
    `$existingTotalCoopCapital = 0`; `$newCoopTotalCapital = 50.000.000 đ`.
    `$newMemberCapital = 50.000.000 đ`.
    `$newOwnershipRatio = (50.000.000 / 50.000.000) * 100 = 100.0% > 30.0%`!
    $\rightarrow$ Hệ thống ném lỗi `ERR_CAPITAL_EXCEED_LIMIT` và **từ chối giao dịch**! Không một ai có thể nộp khoản vốn đầu tiên vào HTX!
- **Kịch bản lỗi 2 (Race condition vượt trần 30%):**
  - `createContribution` không có `DB::transaction` và không có `lockForUpdate()`.
  - Hai giao dịch đồng thời của cùng một thành viên gửi lên cùng lúc, cả hai đều đọc số dư cũ, dẫn đến tổng vốn vượt trần 30% mà không bị phát hiện.
- **Biện pháp khắc phục (Mitigation):**
  - Mẫu số phải lấy từ **Vốn điều lệ đăng ký của HTX** (`cooperatives.charter_capital`) hoặc tổng vốn cam kết (`committed_capital`), không được dùng số vốn thực nộp lũy kế nếu HTX đang trong giai đoạn thu vốn ban đầu.
  - Đóng gói toàn bộ logic kiểm tra và ghi nhận trong `DB::transaction` có khóa `lockForUpdate`.

---

## V. LỘ TRÌNH KHẮC PHỤC YÊU CẦU (REQUIRED REMEDIATION BACKLOG)

Nhóm Kỹ thuật cần hoàn thành các hạng mục sau để Reviewer 2 thẩm định lại:

1. **[P0-1] Nối API thật cho `CoopProfilePage.tsx`:** Gọi `GET` và `PUT /api/v1/cooperatives/my-cooperative`, xóa bỏ mock fallback.
2. **[P0-2] Triệt tiêu Silent Mocking tại `ProfitPage.tsx`:** Xóa `mockSurplusPlan`, hiển thị Empty State khi CSDL rỗng, kết nối lưu vào PostgreSQL.
3. **[P0-3] Loại bỏ nuốt lỗi tại `memberService.ts`:** Ném lỗi ra UI, hiển thị Toast mã lỗi trung thực.
4. **[P1-1] Sửa lỗi HTTP Method:** Đổi `apiClient.put` thành `apiClient.patch` trong `meetingApi.ts`.
5. **[P1-2] Khắc phục lỗ hổng biểu quyết Điều 72:** Khóa cứng `weight = 1.0000`, chỉ cho phép xã viên `ACTIVE` & `OFFICIAL` bỏ phiếu.
6. **[P1-3] Sửa công thức trần vốn 30%:** Sửa mẫu số theo vốn điều lệ đăng ký và bọc `DB::transaction` có khóa dòng chống race condition.
7. **[P1-4] Xóa Dead Code & Bloatware:** Xóa `MemberCapitalSection.tsx`, `MemberDocumentsSection.tsx`, và sáp nhập `CapitalMemberDrawer.tsx`.
