# BÁO CÁO ĐIỀU TRA & CHIẾN LƯỢC KHẮC PHỤC TÍCH HỢP (HANDOFF REPORT)

**Dự án**: Số hóa Phân hệ Nông nghiệp, Nhật ký Canh tác TT02/2024, Thu hoạch KCS 3 Cấp & Truy xuất Nguồn gốc GS1 QR (HTX Tân Tiến)  
**Agent thực hiện**: Integration Remediation Explorer — Iteration 2 (`explorer_integration_remediation_2`)  
**Thư mục làm việc**: `f:\HTX_OCOP_PROJECT\.agents\teamwork\explorer_integration_remediation_2`  
**Ngày báo cáo**: 2026-10-14 (UTC: 2026-10-13T17:10:00Z)  
**Chế độ**: Read-only Investigation & Surgical Remediation Strategy Formulation (KHÔNG trực tiếp sửa đổi mã nguồn sản phẩm).  

---

## 1. Observation (Quan sát Thực tế)

### 1.1 Vấn đề 1: Lỗ hổng Spoofing / Mock Leak tại `frontend/src/services/traceabilityApi.ts`
- **Tệp quan sát**: `frontend/src/services/traceabilityApi.ts`, các dòng 142–167:
  ```ts
  142: export async function fetchPublicTraceability(lotId: string): Promise<PublicTraceabilityData> {
  143:   // Try public backend API endpoint first
  144:   try {
  145:     const res: any = await apiClient.get(`/public/trace/${lotId}`);
  146:     if (res?.data) {
  147:       return res.data;
  148:     }
  149:   } catch {
  150:     // If public route endpoint isn't registered yet in backend, try internal endpoint
  151:     try {
  152:       const res: any = await apiClient.get(`/lots/${lotId}/traceability`);
  153:       if (res?.data) {
  154:         return adaptToPublicTraceability(res.data, lotId);
  155:       }
  156:     } catch {
  157:       // Return high-fidelity fallback data
  158:     }
  159:   }
  160: 
  161:   // Construct customized data matching the requested lotId
  162:   return {
  163:     ...defaultPalermoTraceability,
  164:     lot_code: lotId || defaultPalermoTraceability.lot_code,
  165:     qr_verify_url: `${window.location.origin}/trace/${lotId}`,
  166:   };
  167: }
  ```
- **Tệp liên đới**: `frontend/src/features/agriculture/pages/PublicTraceabilityPage.tsx`, các dòng 35–40 và 61–70:
  ```tsx
  35:   const { data: trace, isLoading } = useQuery<PublicTraceabilityData>({
  36:     queryKey: ['public-traceability', lotId],
  37:     queryFn: async () => {
  38:       return fetchPublicTraceability(lotId);
  39:     },
  40:   });
  ...
  61:   if (!trace) {
  62:     return (
  63:       <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
  64:         <div className="max-w-md bg-white p-6 rounded-3xl border border-slate-200 text-center shadow-lg">
  65:           <h2 className="text-lg font-bold text-slate-900">Không tìm thấy mã lô truy xuất</h2>
  66:           <p className="text-xs text-slate-500 mt-1">Mã lô "{lotId}" chưa có dữ liệu hoặc không hợp lệ.</p>
  67:         </div>
  68:       </div>
  69:     );
  70:   }
  ```
- **Backend Behavior**:
  Tại `app/Modules/Agriculture/Application/Services/LotService.php` dòng 224–226:
  ```php
  if (!$lot) {
      throw new DomainException("Không tìm thấy thông tin lô sản phẩm [{$identifier}] trong hệ thống truy xuất nguồn gốc", 'LOT_NOT_FOUND', null, 404);
  }
  ```
  Khi người dùng gọi `GET /api/v1/public/trace/LOT_FAKE_123`, backend trả về HTTP 404 với mã lỗi `LOT_NOT_FOUND`.
  Tại `frontend/src/services/apiClient.ts` dòng 48: `parseApiError(error)` trả về `{ status: 404, code: 'LOT_NOT_FOUND', message: '...' }` và `Promise.reject(formattedError)`.
- **Hành vi thực tế tại Frontend**:
  Hàm `fetchPublicTraceability` bắt lỗi trong `catch` ở dòng 149 và 156, nuốt chửng hoàn toàn HTTP 404, rồi tự động gán đè `lot_code: 'LOT_FAKE_123'` vào `defaultPalermoTraceability`.
  Kết quả: Trang `/trace/LOT_FAKE_123` hiển thị giao diện chứng nhận OCOP 4 sao Tân Tiến "Xác thực 100%". Màn hình lỗi 404 tại dòng 61–70 của `PublicTraceabilityPage.tsx` trở thành **dead code**.

---

### 1.2 Vấn đề 2: Lệch Múi giờ & Sai Lệch Ngày Đếm ngược tại `frontend/src/features/agriculture/components/PhiCountdownBadge.tsx`
- **Tệp quan sát**: `frontend/src/features/agriculture/components/PhiCountdownBadge.tsx`, các dòng 19–48:
  ```tsx
  19: function calculateRemainingTime(safeHarvestDateStr?: string | null): RemainingTime {
  20:   if (!safeHarvestDateStr) {
  21:     return { isExpired: true, days: 0, hours: 0, minutes: 0, formattedTarget: '' };
  22:   }
  23: 
  24:   const targetDate = new Date(safeHarvestDateStr);
  25:   if (isNaN(targetDate.getTime())) {
  26:     return { isExpired: true, days: 0, hours: 0, minutes: 0, formattedTarget: '' };
  27:   }
  28: 
  29:   // Format target date as DD/MM/YYYY
  30:   const day = String(targetDate.getDate()).padStart(2, '0');
  31:   const month = String(targetDate.getMonth() + 1).padStart(2, '0');
  32:   const year = targetDate.getFullYear();
  33:   const formattedTarget = `${day}/${month}/${year}`;
  34: 
  35:   const now = new Date();
  36:   const diffMs = targetDate.getTime() - now.getTime();
  37: 
  38:   if (diffMs <= 0) {
  39:     return { isExpired: true, days: 0, hours: 0, minutes: 0, formattedTarget };
  40:   }
  ...
  ```
- **Hiện tượng kỹ thuật quan sát**:
  1. Khi `safeHarvestDateStr` là chuỗi ISO ngày chuẩn `"2026-10-20"` (định dạng `YYYY-MM-DD` trả về từ cơ sở dữ liệu), theo quy chuẩn ECMAScript (ES5/ES6+), `new Date("2026-10-20")` được phân tích cú pháp theo **UTC midnight** (`2026-10-20T00:00:00.000Z`).
  2. Tại các múi giờ có offset âm (UTC-1 đến UTC-12 như Bắc Mỹ/Tây Bán cầu), `targetDate.getDate()` trả về ngày hôm trước (`19`), dẫn tới `formattedTarget = "19/10/2026"` thay vì `"20/10/2026"` (off-by-one day bug).
  3. Tại múi giờ Việt Nam (UTC+7 / Asia/Ho_Chi_Minh), `2026-10-20T00:00:00.000Z` tương đương `2026-10-20 07:00:00 AM`. Vào lúc 07:01 sáng của ngày cách ly, `diffMs <= 0` lập tức kích hoạt, khiến huy hiệu chuyển sang "Đạt an toàn PHI" quá sớm vào đầu buổi sáng, trong khi quy tắc cách ly PHI trong nông nghiệp áp dụng hết ngày hoặc đến hết mốc thời gian an toàn.

---

### 1.3 Baseline Kiểm thử Hiện tại
- Lệnh: `npm run build` tại `f:\HTX_OCOP_PROJECT\frontend` → **Exit Code 0** (2300 modules transformed, build in 7.79s).
- Lệnh: `npm run lint` tại `f:\HTX_OCOP_PROJECT\frontend` → **Exit Code 0** (0 warnings, 0 errors).
- Lệnh: `node scripts/verify_frontend_challenger_2.mjs` → **Exit Code 0** (28 Passed, 0 Failed, 1 Warning về touch target 44px).

---

## 2. Logic Chain (Chuỗi Lập luận Từ Quan sát đến Kết luận)

1. **Từ Quan sát 1.1**:
   - Khi gọi `apiClient.get('/public/trace/${lotId}')`, nếu mã lô không tồn tại trong CSDL, backend ném ngoại lệ 404 `DomainException` (`LOT_NOT_FOUND`).
   - Axios interceptor định dạng lỗi thành `{ status: 404, code: 'LOT_NOT_FOUND', ... }`.
   - `fetchPublicTraceability` lại nuốt lỗi và tự trả về object mock OCOP 4 sao Tân Tiến với `lot_code = lotId`.
   - *Hệ quả logic*: Bất kỳ chuỗi ngẫu nhiên nào như `FAKE_123` hay `MALO_GIA_999` đều được cấp bảo chứng hợp lệ giả, làm vô hiệu hóa màn hình 404 `!trace` và xâm phạm nghiêm trọng tính toàn vẹn của dữ liệu truy xuất nguồn gốc.
   - *Kết luận logic*: `fetchPublicTraceability` phải kiểm tra: Nếu backend trả về HTTP 404 (hoặc `err.status === 404`), hàm **bắt buộc phải ném lỗi (throw error)** ngay lập tức, không được phép fallback sang mock data. Kể cả khi backend offline, nếu mã lô không trùng khớp với mã demo chuẩn (`defaultPalermoTraceability.lot_code`), hàm vẫn phải ném lỗi 404.

2. **Từ Quan sát 1.2**:
   - `new Date(safeHarvestDateStr)` với chuỗi `YYYY-MM-DD` phụ thuộc vào UTC parsing spec của JavaScript.
   - Khi chuyển đổi sang giờ địa phương bằng `getDate()`, trình duyệt sẽ bị lệch $\pm 1$ ngày tùy thuộc vào timezone của máy khách.
   - Việc so sánh `diffMs` với `targetDate` ở thời điểm 00:00:00 UTC (tương đương 07:00:00 sáng UTC+7) dẫn đến kết thúc đếm ngược PHI bất thường vào đầu giờ sáng.
   - *Kết luận logic*: Phải phân tích chuỗi ngày bằng Regex hoặc trích xuất số học thuần túy (`year`, `month`, `day`), định dạng `formattedTarget` độc lập hoàn toàn với múi giờ, và tạo `targetDate` tại mốc **cuối ngày theo giờ địa phương của client** (`23:59:59.999`) bằng hàm dựng `new Date(year, month - 1, day, 23, 59, 59, 999)`.

---

## 3. Caveats (Lưu ý & Giả định)

1. **Khả năng hoạt động Offline / Demo Seed**:
   Hệ thống cần giữ lại fallback đối với duy nhất mã lô demo chính thức của HTX Tân Tiến (`LOT-TT-XV003-01-20261015-01`) để phục vụ kiểm thử offline và đáp ứng điều kiện kiểm thử trong `scripts/verify_frontend_challenger_2.mjs` (kiểm tra `traceabilityApiCode.includes('defaultPalermoTraceability')`). Mọi mã lô khác nếu backend không tìm thấy đều phải bị từ chối 100%.
2. **Quy tắc Read-Only của Explorer**:
   Báo cáo này tuân thủ nghiêm ngặt nguyên tắc chỉ điều tra và lập phương án khắc phục, **không chỉnh sửa trực tiếp mã nguồn sản phẩm**. Phương án bên dưới được đóng gói dưới dạng diff patch chính xác từng dòng để Worker/Implementer áp dụng an toàn.
3. **Trải nghiệm người dùng React Query**:
   `useQuery` trong `PublicTraceabilityPage.tsx` cần được cấu hình `retry: false` khi tra cứu mã lô công khai để tránh việc người dùng phải chờ đợi 3 lần retry vô ích trước khi thấy màn hình 404.

---

## 4. Conclusion & Exact Remediation Strategy (Chiến Lược Khắc Phục Chính Xác)

### 4.1 Chiến lược Khắc phục Tệp 1: `frontend/src/services/traceabilityApi.ts`

#### Vị trí thay đổi:
Thay thế toàn bộ hàm `fetchPublicTraceability` từ dòng 142 đến dòng 167 trong `frontend/src/services/traceabilityApi.ts`.

#### Chi tiết Code `before` → `after`:

**Before (Hiện tại — Có lỗ hổng Mock Leak):**
```ts
export async function fetchPublicTraceability(lotId: string): Promise<PublicTraceabilityData> {
  // Try public backend API endpoint first
  try {
    const res: any = await apiClient.get(`/public/trace/${lotId}`);
    if (res?.data) {
      return res.data;
    }
  } catch {
    // If public route endpoint isn't registered yet in backend, try internal endpoint
    try {
      const res: any = await apiClient.get(`/lots/${lotId}/traceability`);
      if (res?.data) {
        return adaptToPublicTraceability(res.data, lotId);
      }
    } catch {
      // Return high-fidelity fallback data
    }
  }

  // Construct customized data matching the requested lotId
  return {
    ...defaultPalermoTraceability,
    lot_code: lotId || defaultPalermoTraceability.lot_code,
    qr_verify_url: `${window.location.origin}/trace/${lotId}`,
  };
}
```

**After (Đã khắc phục — Chặn đứng Mock Leak, ném 404 chính xác):**
```ts
export async function fetchPublicTraceability(lotId: string): Promise<PublicTraceabilityData> {
  const cleanLotId = lotId?.trim();
  if (!cleanLotId) {
    const emptyError: any = new Error('Mã lô truy xuất không hợp lệ hoặc để trống');
    emptyError.status = 404;
    emptyError.code = 'LOT_NOT_FOUND';
    throw emptyError;
  }

  // 1. Query official public backend API endpoint
  try {
    const res: any = await apiClient.get(`/public/trace/${encodeURIComponent(cleanLotId)}`);
    if (res?.data) {
      return res.data;
    }
  } catch (err: any) {
    // Hard check: If backend explicitly returned 404 (lot not found in DB), propagate immediately!
    if (err?.status === 404 || err?.response?.status === 404 || err?.code === 'LOT_NOT_FOUND') {
      const notFoundError: any = new Error(`Không tìm thấy mã lô truy xuất [${cleanLotId}] trong hệ thống`);
      notFoundError.status = 404;
      notFoundError.code = 'LOT_NOT_FOUND';
      throw notFoundError;
    }

    // If backend route is temporarily unreachable (network error / dev fallback), check internal endpoint if authenticated
    try {
      const res: any = await apiClient.get(`/lots/${encodeURIComponent(cleanLotId)}/traceability`);
      if (res?.data) {
        return adaptToPublicTraceability(res.data, cleanLotId);
      }
    } catch (innerErr: any) {
      if (innerErr?.status === 404 || innerErr?.response?.status === 404) {
        const notFoundError: any = new Error(`Không tìm thấy mã lô truy xuất [${cleanLotId}] trong hệ thống`);
        notFoundError.status = 404;
        notFoundError.code = 'LOT_NOT_FOUND';
        throw notFoundError;
      }
    }
  }

  // 2. Strict Offline Fallback Guard:
  // ONLY return mock fallback data if lotId EXACTLY matches the official demo seed lot code.
  if (cleanLotId === defaultPalermoTraceability.lot_code) {
    return {
      ...defaultPalermoTraceability,
      qr_verify_url: `${window.location.origin}/trace/${cleanLotId}`,
    };
  }

  // 3. For any non-existent / random / fake lot code (e.g. FAKE_123, MALO_GIA_999), THROW 404 error!
  const notFoundError: any = new Error(`Không tìm thấy mã lô truy xuất [${cleanLotId}] trong hệ thống`);
  notFoundError.status = 404;
  notFoundError.code = 'LOT_NOT_FOUND';
  throw notFoundError;
}
```

---

### 4.2 Chiến lược Cải thiện Bổ trợ tại `frontend/src/features/agriculture/pages/PublicTraceabilityPage.tsx`

#### Vị trí thay đổi:
Tại dòng 35–40 và 61–70 của `PublicTraceabilityPage.tsx`:
1. Vô hiệu hóa retry trên 404 để hiển thị màn hình báo lỗi ngay lập tức.
2. Kiểm tra đồng thời `isError || !trace`.

**Before:**
```tsx
  const { data: trace, isLoading } = useQuery<PublicTraceabilityData>({
    queryKey: ['public-traceability', lotId],
    queryFn: async () => {
      return fetchPublicTraceability(lotId);
    },
  });
...
  if (!trace) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
        <div className="max-w-md bg-white p-6 rounded-3xl border border-slate-200 text-center shadow-lg">
          <h2 className="text-lg font-bold text-slate-900">Không tìm thấy mã lô truy xuất</h2>
          <p className="text-xs text-slate-500 mt-1">Mã lô "{lotId}" chưa có dữ liệu hoặc không hợp lệ.</p>
        </div>
      </div>
    );
  }
```

**After:**
```tsx
  const { data: trace, isLoading, isError } = useQuery<PublicTraceabilityData>({
    queryKey: ['public-traceability', lotId],
    queryFn: async () => {
      return fetchPublicTraceability(lotId);
    },
    retry: false, // Phản hồi lập tức khi nhận 404, không lặp lại truy vấn vô ích
  });
...
  if (isError || !trace) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
        <div className="max-w-md bg-white p-6 rounded-3xl border border-slate-200 text-center shadow-lg">
          <h2 className="text-lg font-bold text-slate-900">Không tìm thấy mã lô truy xuất</h2>
          <p className="text-xs text-slate-500 mt-1">Mã lô "{lotId}" chưa có dữ liệu hoặc không hợp lệ.</p>
        </div>
      </div>
    );
  }
```

---

### 4.3 Chiến lược Khắc phục Tệp 3: `frontend/src/features/agriculture/components/PhiCountdownBadge.tsx`

#### Vị trí thay đổi:
Thay thế hàm `calculateRemainingTime` (dòng 19–48) trong `frontend/src/features/agriculture/components/PhiCountdownBadge.tsx`.

#### Chi tiết Code `before` → `after`:

**Before (Hiện tại — Lỗi UTC Date Parsing & Off-by-one Timezone):**
```tsx
function calculateRemainingTime(safeHarvestDateStr?: string | null): RemainingTime {
  if (!safeHarvestDateStr) {
    return { isExpired: true, days: 0, hours: 0, minutes: 0, formattedTarget: '' };
  }

  const targetDate = new Date(safeHarvestDateStr);
  if (isNaN(targetDate.getTime())) {
    return { isExpired: true, days: 0, hours: 0, minutes: 0, formattedTarget: '' };
  }

  // Format target date as DD/MM/YYYY
  const day = String(targetDate.getDate()).padStart(2, '0');
  const month = String(targetDate.getMonth() + 1).padStart(2, '0');
  const year = targetDate.getFullYear();
  const formattedTarget = `${day}/${month}/${year}`;

  const now = new Date();
  const diffMs = targetDate.getTime() - now.getTime();

  if (diffMs <= 0) {
    return { isExpired: true, days: 0, hours: 0, minutes: 0, formattedTarget };
  }

  const totalMinutes = Math.floor(diffMs / (1000 * 60));
  const days = Math.floor(totalMinutes / (60 * 24));
  const hours = Math.floor((totalMinutes % (60 * 24)) / 60);
  const minutes = totalMinutes % 60;

  return { isExpired: false, days, hours, minutes, formattedTarget };
}
```

**After (Đã khắc phục — Parse ISO Date & So sánh Local End-of-Day):**
```tsx
function parseIsoDateToEndOfDay(safeHarvestDateStr: string): { targetDate: Date; formattedTarget: string } | null {
  const trimmed = safeHarvestDateStr.trim();
  // Match standard ISO YYYY-MM-DD prefix
  const match = trimmed.match(/^(\d{4})-(\d{2})-(\d{2})/);
  if (match) {
    const year = parseInt(match[1], 10);
    const month = parseInt(match[2], 10); // 1-based month
    const day = parseInt(match[3], 10);

    if (!isNaN(year) && !isNaN(month) && !isNaN(day)) {
      // Deterministic DD/MM/YYYY formatting, completely timezone-independent
      const formattedTarget = `${String(day).padStart(2, '0')}/${String(month).padStart(2, '0')}/${year}`;
      // Construct target at client local end-of-day: 23:59:59.999
      const targetDate = new Date(year, month - 1, day, 23, 59, 59, 999);
      if (!isNaN(targetDate.getTime())) {
        return { targetDate, formattedTarget };
      }
    }
  }

  // Fallback for non-standard date string formats
  const fallback = new Date(trimmed);
  if (!isNaN(fallback.getTime())) {
    const day = String(fallback.getDate()).padStart(2, '0');
    const month = String(fallback.getMonth() + 1).padStart(2, '0');
    const year = fallback.getFullYear();
    const formattedTarget = `${day}/${month}/${year}`;
    const targetDate = new Date(fallback.getFullYear(), fallback.getMonth(), fallback.getDate(), 23, 59, 59, 999);
    return { targetDate, formattedTarget };
  }

  return null;
}

function calculateRemainingTime(safeHarvestDateStr?: string | null): RemainingTime {
  if (!safeHarvestDateStr) {
    return { isExpired: true, days: 0, hours: 0, minutes: 0, formattedTarget: '' };
  }

  const parsed = parseIsoDateToEndOfDay(safeHarvestDateStr);
  if (!parsed) {
    return { isExpired: true, days: 0, hours: 0, minutes: 0, formattedTarget: '' };
  }

  const { targetDate, formattedTarget } = parsed;
  const now = new Date();
  const diffMs = targetDate.getTime() - now.getTime();

  if (diffMs <= 0) {
    return { isExpired: true, days: 0, hours: 0, minutes: 0, formattedTarget };
  }

  const totalMinutes = Math.floor(diffMs / (1000 * 60));
  const days = Math.floor(totalMinutes / (60 * 24));
  const hours = Math.floor((totalMinutes % (60 * 24)) / 60);
  const minutes = totalMinutes % 60;

  return { isExpired: false, days, hours, minutes, formattedTarget };
}
```

---

## 5. Verification Method (Phương pháp Kiểm chứng Độc lập)

Sau khi Worker áp dụng các thay đổi trên, người kiểm thử có thể thực hiện độc lập quy trình kiểm chứng gồm 4 bước:

### Bước 1: Kiểm thử Đơn vị Chặn Mock Leak (Adversarial Fake Lot Test)
1. Khởi động backend hoặc chạy trực tiếp frontend:
   - Truy cập URL: `http://localhost:5173/trace/MALO_GIA_999` hoặc `http://localhost:5173/trace/FAKE_123`.
2. **Kỳ vọng**:
   - Giao diện KHÔNG hiển thị chứng nhận OCOP 4 sao hay "Xác thực 100%".
   - Màn hình hiển thị đúng thông báo:
     `Không tìm thấy mã lô truy xuất`
     `Mã lô "MALO_GIA_999" chưa có dữ liệu hoặc không hợp lệ.`
3. **Truy cập mã demo chính thức**:
   - Truy cập: `http://localhost:5173/trace/LOT-TT-XV003-01-20261015-01`.
   - **Kỳ vọng**: Trang hiển thị đầy đủ thông tin truy xuất nguồn gốc của HTX Tân Tiến.

### Bước 2: Kiểm thử Múi giờ & Local End-of-Day trên `PhiCountdownBadge`
1. Thiết lập `safeHarvestDate` là ngày hôm nay dạng `"YYYY-MM-DD"`.
2. **Kiểm tra**:
   - Vào lúc 08:00 sáng theo giờ Việt Nam, huy hiệu vẫn hiển thị trạng thái cách ly kèm số giờ còn lại đến 23:59:59 (ví dụ: `Còn 15 giờ 59 phút (Đến DD/MM/YYYY)`).
   - Huy hiệu KHÔNG bị chuyển sớm sang "Đạt an toàn PHI" vào lúc 07:01 sáng.
   - Thử nghiệm đổi múi giờ trình duyệt sang New York (UTC-4) hoặc Tokyo (UTC+9): Chuỗi ngày `formattedTarget` luôn hiển thị chính xác ngày của chuỗi `YYYY-MM-DD` (không bao giờ bị lùi 1 ngày).

### Bước 3: Kiểm thử Build & Lint Tự động
Thực thi các lệnh sau tại terminal:
```bash
cd f:\HTX_OCOP_PROJECT\frontend
npm run build
npm run lint
```
**Kỳ vọng**: Cả hai lệnh kết thúc với Exit Code 0, không có bất kỳ cảnh báo TypeScript hay ESLint nào.

### Bước 4: Kiểm thử Kịch bản Challenger Harness
Thực thi lệnh kiểm thử đối kháng:
```bash
cd f:\HTX_OCOP_PROJECT
node scripts/verify_frontend_challenger_2.mjs
```
**Kỳ vọng**: Toàn bộ 28 bài kiểm tra tiếp tục PASS, giữ vững tính toàn vẹn của hệ thống.

---

### Invalidation Conditions (Điều kiện Hủy bỏ Phán quyết)
- Nếu tra cứu `/trace/FAKE_123` mà giao diện vẫn hiển thị chứng nhận OCOP 4 sao Tân Tiến → Phát hiện Mock Leak chưa được khắc phục.
- Nếu chuỗi ngày hiển thị trên `PhiCountdownBadge` bị lệch 1 ngày khi người dùng ở múi giờ khác → Lỗi phân tích ngày chưa được khắc phục.
