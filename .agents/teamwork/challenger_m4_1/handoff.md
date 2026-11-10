# BÁO CÁO THẨM TRA ĐỐI KHÁNG THỰC NGHIỆM (EMPIRICAL CHALLENGER REPORT)
## PHÂN HỆ 1: QUẢN TRỊ HỢP TÁC XÃ & XÃ VIÊN (MILESTONE 4)

> **Người thực hiện:** Challenger 1 (Arch: Empirical Challenger / Critic & Domain Specialist)  
> **Thư mục làm việc:** `f:/HTX_OCOP_PROJECT/.agents/teamwork/challenger_m4_1`  
> **Tài liệu tham chiếu chính:**  
> - `docs/BAO_CAO_DANH_GIA_UIUX_VA_CSDL_PHAN_HE_1_QUAN_TRI_HTX.md`  
> - `ORIGINAL_REQUEST.md` (## 2026-11-02T16:11:34Z)  
> - `AGENT.md` & `GEMINI.md` (Nguyên tắc Cấm Silent Mocking & Toàn vẹn Dữ liệu)  

---

## TỔNG QUAN ĐÁNH GIÁ RỦI RO (CHALLENGE SUMMARY)

**Đánh giá rủi ro tổng thể (Overall Risk Assessment):** **CRITICAL**

Bốn giả thuyết phản biện được đặt ra nhằm kiểm chứng tính xác thực của các phát hiện trong Master Report. Thông qua quá trình phân tích tĩnh mã nguồn và thực thi kiểm thử trực tiếp trên nhân hệ thống (Laravel HTTP Kernel & React Component trees), **cả 4 giả thuyết đều được XÁC NHẬN (CONFIRMED) 100% bằng bằng chứng thực nghiệm không thể chối cãi**.

| STT | Giả thuyết thẩm tra | Phạm vi kiểm tra | Kết quả thực nghiệm | Phán quyết (Verdict) |
| :---: | :--- | :--- | :--- | :---: |
| **1** | `CoopProfilePage.tsx` bỏ qua API backend, chỉ ghi đè Zustand local store | `frontend/src/features/members/pages/CoopProfilePage.tsx:21-47` | Không gọi `GET/PUT /api/v1/cooperatives/my-cooperative`; ghi vào local memory; F5 hoặc đăng nhập máy khác là mất | **CONFIRMED** |
| **2** | `ProfitPage.tsx` tự nạp `mockSurplusPlan` & dữ liệu biểu đồ `barData` tĩnh | `frontend/src/features/members/pages/ProfitPage.tsx:55-56, 168-175, 177-215` | Khởi tạo với 1,25 tỷ VNĐ giả; biểu đồ thanh hardcode; hàm cập nhật không gọi API | **CONFIRMED** |
| **3** | `memberService.ts` nuốt ngoại lệ try-catch, trả về `true` giả và ghi localStorage | `frontend/src/services/memberService.ts:954-1045` (`update`, `delete`, `approve`, `transition`) | Bọc catch rỗng, không rethrow, âm thầm sửa localStorage và trả về `true`/object giả | **CONFIRMED** |
| **4** | Xung đột phương thức HTTP: Backend `Route::patch('/meetings/{id}')` vs Frontend `apiClient.put()` | `backend/routes/api.php:136`<br>`frontend/src/services/meetingApi.ts:104`<br>`MeetingDetailDrawer.tsx:59` | Thực thi Laravel Kernel trả về đúng **HTTP 405 Method Not Allowed** | **CONFIRMED** |

---

## 1. OBSERVATION (QUAN SÁT THỰC NGHIỆM TRỰC TIẾP)

### Quan sát 1 (Hypothesis 1: `CoopProfilePage.tsx` ngắt kết nối API)
- **Tệp:** `frontend/src/features/members/pages/CoopProfilePage.tsx`
- **Dòng 21–47:**
```typescript
export const CoopProfilePage: React.FC = () => {
  const { activeCooperative, setCooperative } = useTenantContextStore();
  const { showToast } = useToast();
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

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
- **Dòng 129–138 & 167–183:** Toàn bộ thông số vốn điều lệ (`3.500.000.000 ₫`), quy mô (`165 hộ thành viên`, `52,5 Hécta`) và Ban Quản Trị ("Trần Thị Mai", "Lê Văn Hùng") đều bị hardcode trực tiếp trong JSX.
- **Tệp liên quan:** `frontend/src/stores/tenantContextStore.ts:5-24` chỉ là lớp bọc `localStorage` qua `tokenStorage.getCooperative()` / `tokenStorage.setCooperative()`. Không có bất kỳ React Query hook, Axios request hay Fetch API nào được khởi tạo.

### Quan sát 2 (Hypothesis 2: `ProfitPage.tsx` giả lập ngầm và hardcode biểu đồ)
- **Tệp:** `frontend/src/features/members/pages/ProfitPage.tsx`
- **Dòng 55–56:**
```typescript
  // Active Surplus Plan
  const [surplusPlan, setSurplusPlan] = useState<SurplusDistributionPlan>(mockSurplusPlan);
  const [surplusItems, setSurplusItems] = useState<SurplusDistributionItem[]>(mockSurplusItems);
```
- **Dòng 72–77:**
```typescript
  React.useEffect(() => {
    if (apiPlans.length > 0) {
      ...
    }
  }, [apiPlans, selectedPlanId]);
```
  $\rightarrow$ Nếu database rỗng (`apiPlans.length === 0`), `useEffect` bỏ qua, giao diện giữ nguyên `mockSurplusPlan` (id `'SDP-2024'`, tổng thặng dư `1.250.000.000 đ`).
- **Dòng 168–175:**
```typescript
  const barData = [
    { month: 'Tháng 1', paid: 150000000, unpaid: 50000000 },
    { month: 'Tháng 2', paid: 280000000, unpaid: 40000000 },
    { month: 'Tháng 3', paid: 420000000, unpaid: 30000000 },
    { month: 'Tháng 4', paid: 550000000, unpaid: 20000000 },
    { month: 'Tháng 5', paid: 780000000, unpaid: 15000000 },
    { month: 'Tháng 6', paid: 1042500000, unpaid: 0 },
  ];
```
- **Dòng 177–215 (`handleUpdateProfitPlan`):**
  Hàm xử lý khi bấm nút "Lưu phương án phân chia" chỉ gọi:
  ```typescript
  setSurplusPlan({ ...surplusPlan, ... });
  triggerToast(`Đã cập nhật phương án phân chia thặng dư năm ${profitPlanForm.fiscal_year} theo Luật HTX 2023!`);
  ```
  Không hề có lệnh gọi `createPlanMutation`, `apiClient.post` hay bất kỳ request HTTP nào xuống backend.

### Quan sát 3 (Hypothesis 3: `memberService.ts` nuốt lỗi và tạo thành công ảo)
- **Tệp:** `frontend/src/services/memberService.ts`
- **Dòng 954–1000 (`updateMemberApi`):**
```typescript
export const updateMemberApi = async (id: string, memberData: Partial<Member>): Promise<Member> => {
  let updatedMember: Member | null = null;
  try {
    const payload = { ... };
    const res: any = await apiClient.patch(`/members/${id}`, payload);
    if (res && res.data) {
      updatedMember = mapApiMemberToFrontend(res.data);
    }
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
};
```
- **Dòng 1002–1015 (`deleteMemberApi`):**
```typescript
export const deleteMemberApi = async (id: string): Promise<boolean> => {
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
};
```
- **Dòng 1017–1030 (`approveMemberApi`):**
```typescript
export const approveMemberApi = async (id: string): Promise<boolean> => {
  try {
    await apiClient.post(`/members/${id}/approve`);
  } catch (error) {
    console.warn('API approve notice:', error);
  }

  const stored = getStoredMembers();
  if (stored) {
    const updated = stored.map(m => (m.id === id ? { ...m, status: 'ACTIVE' as const } : m));
    saveMembersToStorage(updated);
  }
  return true;
};
```
- **Dòng 1032–1045 (`transitionMemberStatusApi`):**
```typescript
export const transitionMemberStatusApi = async (id: string, targetStatus: string, reason?: string): Promise<boolean> => {
  try {
    await apiClient.post(`/members/${id}/status-transitions`, { target_status: targetStatus, reason });
  } catch (error) {
    console.warn('API transition status notice:', error);
  }

  const stored = getStoredMembers();
  if (stored) {
    const updated = stored.map(m => (m.id === id ? { ...m, status: targetStatus as any } : m));
    saveMembersToStorage(updated);
  }
  return true;
};
```

### Quan sát 4 (Hypothesis 4: Xung đột HTTP Method trên tuyến `/meetings/{id}`)
- **Bảng định tuyến Backend (`backend/routes/api.php:136`):**
```php
Route::patch('/meetings/{id}', [MeetingController::class, 'update'])->name('api.meetings.update');
```
  Lệnh `php artisan route:list --path=meetings` trả về:
  `PATCH api/v1/meetings/{id} api.meetings.update`
  (Không có tuyến `PUT`).
- **Triển khai Client Frontend (`frontend/src/services/meetingApi.ts:103-106`):**
```typescript
  async updateMeeting(id: string, payload: Partial<CreateMeetingPayload>): Promise<Meeting> {
    const res: any = await apiClient.put(`/meetings/${id}`, payload);
    return res.data?.data || res.data;
  },
```
- **Component gọi API (`frontend/src/features/members/components/meetings/MeetingDetailDrawer.tsx:15, 59`):**
```typescript
import { meetingApi, Meeting, ... } from '@/services/meetingApi';
...
meeting ? meetingApi.updateMeeting(meeting.id, { status: newStatus }) : Promise.reject()
```
- **Thực thi kiểm thử thực nghiệm (Empirical Command Execution):**
  Lệnh:
  ```powershell
  php -r "eval(base64_decode('cmVxdWlyZSAndmVuZG9yL2F1dG9sb2FkLnBocCc7ICRhcHAgPSByZXF1aXJlX29uY2UgJ2Jvb3RzdHJhcC9hcHAucGhwJzsgJGtlcm5lbCA9ICRhcHAtPm1ha2UoSWxsdW1pbmF0ZVxDb250cmFjdHNcSHR0cFxLZXJuZWw6OmNsYXNzKTsgJHJlcSA9IElsbHVtaW5hdGVcSHR0cFxSZXF1ZXN0OjpjcmVhdGUoJy9hcGkvdjEvbWVldGluZ3MvMDAwMDAwMDAtMDAwMC0wMDAwLTAwMDAtMDAwMDAwMDAwMDAwJywgJ1BVVCcpOyAkcmVxLT5oZWFkZXJzLT5zZXQoJ0FjY2VwdCcsICdhcHBsaWNhdGlvbi9qc29uJyk7ICRyZXMgPSAka2VybmVsLT5oYW5kbGUoJHJlcSk7IGVjaG8gJ1NUQVRVUz0nIC4gJHJlcy0+Z2V0U3RhdHVzQ29kZSgpIC4gJyBCT0RZPScgLiAkcmVzLT5nZXRDb250ZW50KCk7'));"
  ```
- **Kết quả thực thi trực tiếp từ Laravel Kernel:**
  ```
  STATUS=405 BODY={"success":false,"error":{"code":"INTERNAL_SERVER_ERROR","message":"The PUT method is not supported for route api\/v1\/meetings\/00000000-0000-0000-0000-000000000000. Supported methods: GET, HEAD, PATCH."...
  ```

---

## 2. LOGIC CHAIN (CHUỖI LẬP LUẬN TỪ QUAN SÁT ĐẾN KẾT LUẬN)

1. **Từ Quan sát 1 đến Kết luận 1:**
   - Bước 1: Trong `CoopProfilePage.tsx`, đối tượng `coop` lấy từ `activeCooperative` của Zustand store. Nếu rỗng, fallback sang object hardcoded.
   - Bước 2: Khi người dùng mở modal và lưu thông tin, hàm `handleSaveProfile` chỉ gọi `setCooperative(newCoop)`.
   - Bước 3: `setCooperative` chỉ lưu vào `localStorage.setItem('auth_cooperative', ...)`.
   - Bước 4: Backend có sẵn `PUT /api/v1/cooperatives/my-cooperative` với kiểm tra phân quyền `COOPERATIVE.UPDATE` và ghi log SHA-256 `COOPERATIVE_UPDATED`, nhưng client không hề gửi request.
   - $\Rightarrow$ **Hệ quả:** Dữ liệu pháp lý HTX chỉ thay đổi cục bộ trong trình duyệt đó, CSDL PostgreSQL không đổi, audit log không được ghi, và biến mất khi xóa cache hoặc đăng nhập máy khác. Giả thuyết 1 **CONFIRMED**.

2. **Từ Quan sát 2 đến Kết luận 2:**
   - Bước 1: `useState<SurplusDistributionPlan>(mockSurplusPlan)` gán dữ liệu giả ngay khi component mount.
   - Bước 2: Nếu API trả về `[]` (chưa có phương án nào được lập), `apiPlans.length > 0` là `false`, khiến `surplusPlan` vĩnh viễn mang giá trị của `mockSurplusPlan` (1,25 tỷ đồng).
   - Bước 3: Biến `barData` được gán mảng tĩnh gồm 6 tháng với số liệu cố định từ 150tr đến 1,042 tỷ.
   - Bước 4: Khi người dùng sửa tỷ lệ trích quỹ và bấm Lưu, hàm `handleUpdateProfitPlan` chỉ cập nhật state React nội bộ, không có API mutation.
   - $\Rightarrow$ **Hệ quả:** Vi phạm nghiêm trọng Nguyên tắc 2 của `AGENTS.md` ("CẤM SILENT MOCKING TẠI RUNTIME"). Kế toán nhìn thấy số liệu tài chính ảo, dẫn đến ngộ nhận số dư thặng dư của HTX. Giả thuyết 2 **CONFIRMED**.

3. **Từ Quan sát 3 đến Kết luận 3:**
   - Bước 1: Các hàm `updateMemberApi`, `deleteMemberApi`, `approveMemberApi`, `transitionMemberStatusApi` đều có khối `try { await apiClient... } catch (error) { console.warn(...) }`.
   - Bước 2: Khối `catch` hoàn toàn không rethrow `throw error;`.
   - Bước 3: Sau khối `catch`, mã nguồn tiếp tục đọc `localStorage` (`getStoredMembers()`), cập nhật/xóa phần tử trong `localStorage`, và trả về `true` (hoặc đối tượng xã viên).
   - Bước 4: UI nhận giá trị trả về `true`, kích hoạt Toast xanh "Thành công!", đóng modal và render lại danh sách như thể thao tác đã hoàn tất.
   - $\Rightarrow$ **Hệ quả:** Nếu người dùng không đủ quyền (HTTP 403), vi phạm dữ liệu (HTTP 422 - ví dụ xóa xã viên còn treo nợ vật tư), hoặc backend lỗi (HTTP 500), hệ thống vẫn báo thành công và xóa xã viên trên màn hình. Trong khi đó, database PostgreSQL không thay đổi. Khi F5 hoặc tải lại danh sách từ server, bản ghi lại xuất hiện trở lại ("hiện tượng xã viên ma"). Giả thuyết 3 **CONFIRMED**.

4. **Từ Quan sát 4 đến Kết luận 4:**
   - Bước 1: Tuyến backend được đăng ký độc quyền với phương thức `Route::patch('/meetings/{id}')`.
   - Bước 2: `meetingApi.ts:104` gọi `apiClient.put('/meetings/' + id, payload)`.
   - Bước 3: `MeetingDetailDrawer.tsx:59` gọi `meetingApi.updateMeeting(...)` để chuyển trạng thái cuộc họp.
   - Bước 4: Chạy trực tiếp qua HTTP Kernel của Laravel với phương thức `PUT` sinh ra ngoại lệ `MethodNotAllowedHttpException` với mã trạng thái `HTTP 405` và header `Supported methods: GET, HEAD, PATCH`.
   - $\Rightarrow$ **Hệ quả:** Bất kỳ thao tác chuyển trạng thái cuộc họp nào (`PLANNED` $\rightarrow$ `IN_PROGRESS` $\rightarrow$ `COMPLETED`) trên giao diện đều sẽ thất bại với lỗi 405 Method Not Allowed. Giả thuyết 4 **CONFIRMED**.

---

## 3. CAVEATS (GIỚI HẠN & GIẢ ĐỊNH)

- **Các trường hợp không chịu ảnh hưởng:** 
  - Module `MemberWizard` (khi kết nạp xã viên mới) gọi `POST /members` qua `createMemberApi`. Mặc dù `createMemberApi` cũng ghi vào `localStorage`, nhưng nó có lệnh `throw error;` ở dòng 926 khi API thất bại, do đó không bị lỗi nuốt ngoại lệ khi tạo mới.
  - Tuyến `GET /members` đọc dữ liệu thật từ backend qua API phân trang.
- **Tồn tại 2 tệp service cho meetings:** Có 2 tệp song song: `meetingApi.ts` (dùng `PUT` ở dòng 104) và `meetingService.ts` (dùng `PATCH` ở dòng 84). Tuy nhiên, component `MeetingDetailDrawer.tsx` lại import và sử dụng tệp lỗi `meetingApi.ts`.

---

## 4. CONCLUSION & VERDICT (KẾT LUẬN & PHÁN QUYẾT)

### Bảng Phán quyết Thẩm tra Đối kháng:

| Giả thuyết | Mô tả tóm tắt | Phán quyết | Mức độ nghiêm trọng | Khuyến nghị hành động |
| :--- | :--- | :---: | :---: | :--- |
| **Hypothesis 1** | `CoopProfilePage.tsx` ngắt kết nối API, chỉ ghi Zustand local store | **CONFIRMED** | **HIGH** | Kết nối hook `useQuery` gọi `GET /api/v1/cooperatives/my-cooperative` và `useMutation` gọi `PUT /api/v1/cooperatives/my-cooperative`. Thay thế các giá trị quy mô hardcode bằng dữ liệu thật từ API. |
| **Hypothesis 2** | `ProfitPage.tsx` tự nạp `mockSurplusPlan` & `barData` tĩnh | **CONFIRMED** | **CRITICAL** | Loại bỏ `mockSurplusPlan` làm initial state; khởi tạo state `null`. Hiển thị Empty State chuẩn khi `apiPlans.length === 0`. Kết nối `handleUpdateProfitPlan` với mutation gọi API backend. |
| **Hypothesis 3** | `memberService.ts` nuốt ngoại lệ try-catch, trả về `true` giả | **CONFIRMED** | **CRITICAL** | Xóa bỏ toàn bộ cơ chế fallback `localStorage` trong `memberService.ts`. Bỏ bọc try-catch hoặc rethrow `throw error;` để React Query / UI xử lý hiển thị Error Toast trung thực theo mã lỗi backend. |
| **Hypothesis 4** | Xung đột `Route::patch` backend vs `apiClient.put` frontend trên `/meetings/{id}` | **CONFIRMED** | **HIGH** | Sửa `apiClient.put` thành `apiClient.patch` trong `meetingApi.ts:104` (hoặc sáp nhập `meetingApi.ts` và `meetingService.ts` thành 1 tệp duy nhất để tránh phân mảnh). |

---

## 5. VERIFICATION METHOD (PHƯƠNG PHÁP XÁC MINH ĐỘC LẬP)

Để bất kỳ lập trình viên hoặc hệ thống kiểm định độc lập nào cũng có thể kiểm chứng lại kết quả trên:

1. **Xác minh Hypothesis 1 (`CoopProfilePage.tsx`):**
   ```powershell
   # Tìm kiếm bất kỳ lệnh gọi HTTP nào trong CoopProfilePage.tsx
   rg "apiClient|useQuery|useMutation|fetch|axios" frontend/src/features/members/pages/CoopProfilePage.tsx
   # Kết quả: 0 matches (chứng minh hoàn toàn không có kết nối API).
   ```

2. **Xác minh Hypothesis 2 (`ProfitPage.tsx`):**
   ```powershell
   # Kiểm tra khởi tạo state và barData
   rg "mockSurplusPlan|barData" frontend/src/features/members/pages/ProfitPage.tsx -n
   # Dòng 55: useState<SurplusDistributionPlan>(mockSurplusPlan);
   # Dòng 168: const barData = [ ... ];
   ```

3. **Xác minh Hypothesis 3 (`memberService.ts`):**
   ```powershell
   # Kiểm tra try-catch và return true trong deleteMemberApi / approveMemberApi
   rg -A 15 "export const deleteMemberApi" frontend/src/services/memberService.ts
   rg -A 15 "export const approveMemberApi" frontend/src/services/memberService.ts
   # Thấy rõ khối catch rỗng chỉ ghi console.warn và sau đó return true.
   ```

4. **Xác minh Hypothesis 4 (HTTP 405 Conflict):**
   Chạy lệnh kiểm thử độc lập trực tiếp trong terminal backend:
   ```powershell
   cd f:\HTX_OCOP_PROJECT\backend
   php -r "eval(base64_decode('cmVxdWlyZSAndmVuZG9yL2F1dG9sb2FkLnBocCc7ICRhcHAgPSByZXF1aXJlX29uY2UgJ2Jvb3RzdHJhcC9hcHAucGhwJzsgJGtlcm5lbCA9ICRhcHAtPm1ha2UoSWxsdW1pbmF0ZVxDb250cmFjdHNcSHR0cFxLZXJuZWw6OmNsYXNzKTsgJHJlcSA9IElsbHVtaW5hdGVcSHR0cFxSZXF1ZXN0OjpjcmVhdGUoJy9hcGkvdjEvbWVldGluZ3MvMDAwMDAwMDAtMDAwMC0wMDAwLTAwMDAtMDAwMDAwMDAwMDAwJywgJ1BVVCcpOyAkcmVxLT5oZWFkZXJzLT5zZXQoJ0FjY2VwdCcsICdhcHBsaWNhdGlvbi9qc29uJyk7ICRyZXMgPSAka2VybmVsLT5oYW5kbGUoJHJlcSk7IGVjaG8gJ1NUQVRVUz0nIC4gJHJlcy0+Z2V0U3RhdHVzQ29kZSgpIC4gJyBCT0RZPScgLiAkcmVzLT5nZXRDb250ZW50KCk7'));"
   ```
   **Kết quả in ra màn hình:**
   `STATUS=405 BODY={"success":false,"error":{"code":"INTERNAL_SERVER_ERROR","message":"The PUT method is not supported for route api/v1/meetings/00000000-0000-0000-0000-000000000000. Supported methods: GET, HEAD, PATCH."...`
