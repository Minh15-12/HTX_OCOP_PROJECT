# QUY CHUẨN KỸ THUẬT XUẤT CHỨNG TỪ, IN ẤN & TẠO FILE PDF (A4)
> **Mã quy chuẩn:** `RULE-TECH-DOC-01`  
> **Căn cứ pháp lý:** Luật Kế toán 88/2015/QH13, Thông tư 71/2024/TT-BTC, TCVN 11892-1:2017 (VietGAP), TCVN 12850:2019 (Truy xuất nguồn gốc), Quyết định 148/QĐ-TTg & 1489/QĐ-TTg (OCOP).  
> **Ngày ban hành:** 05/11/2026.  
> **Phạm vi áp dụng:** Toàn bộ các chức năng in ấn, xem trước và xuất tài liệu/chứng từ/báo cáo của Hệ thống Quản trị HTX & OCOP.

---

## 1. BỐI CẢNH VÀ CÁC SỰ CỐ THỰC TẾ ĐÃ GẶP

Trong quá trình triển khai xuất hồ sơ chứng từ A4 (đặc biệt là Hồ Sơ Nhật Ký Canh Tác VietGAP, Phiếu Mẫu 02-VT, Giấy Chứng Nhận Vốn Góp, Phiếu Chấm OCOP), hệ thống đã ghi nhận các sự cố nghiêm trọng sau:

1. **Lỗi đứt gãy trang cắt ngang bảng (Orphan Table Header):**
   - *Hiện tượng:* Tiêu đề mục và hàng header bảng (`<th>`) nằm chơ vơ ở đáy trang trước, một đường cắt trang A4 chạy ngang qua, và các hàng dữ liệu (`<tr>`) bị đẩy sang trang tiếp theo mà không có tiêu đề cột ở phía trên.
   - *Hậu quả:* Chứng từ bị cơ quan thanh tra nông nghiệp / thanh tra thuế loại bỏ do không thể xác định cột nào chứa số liệu gì ở trang thứ hai trở đi.

2. **Lỗi xé chữ, gãy âm tiết tiếng Việt và số hiệu (Word/Syllable Splitting):**
   - *Hiện tượng:*
     - Ngày tháng `2026-10-28` bị bẻ thành 2 dòng `2026-` và `10-28`.
     - Mã thửa đất `PLOT-TT-XV002-01` bị cắt vụn thành `PLOT-` / `TT-` / `XV00` / `2-01`.
     - Âm tiết tiếng Việt `✓ Đã duyệt` bị xé đôi từ `duyệt` thành `duyệ` và chữ `t` rớt xuống dòng dưới (`duyệ` / `t`).
     - Tên thành viên `Quản Trị Viên Phú Thịnh` bị ép thành 5 dòng thẳng đứng.
     - Tiêu đề cột `CÁCH LY PHI` bị ngắt thành 3 dòng đứng (`CÁCH` / `LY` / `PHI`).
   - *Hậu quả:* Gây phản cảm, mất thẩm mỹ chuyên nghiệp và làm sai lệch số liệu hành chính.

3. **Lỗi mất viền mép phải (Right-Edge Truncation):**
   - *Hiện tượng:* Toàn bộ cột ngoài cùng bên phải hoặc đường viền bảng bên phải bị mất tích khi xuất PDF do thuộc tính cố định `windowWidth: 800` trong `html2canvas` làm cắt cụt các bảng có bề rộng lớn hơn 800px.

4. **Lỗi chỉ cung cấp 1 nút in trình duyệt duy nhất:**
   - *Hiện tượng:* Giao diện chỉ có nút `window.print()`, người dùng mở bằng điện thoại hoặc laptop cá nhân không có máy in văn phòng sẽ không thể lấy được file PDF để gửi Zalo hay lưu trữ.

---

## 2. BẢY NGUYÊN TẮC BẮT BUỘC KHI PHÁT TRIỂN CHỨC NĂNG IN / XUẤT CHỨNG TỪ

### QUY TẮC 1: ĐA PHƯƠNG THỨC XUẤT CHỨNG TỪ CHO MỌI THIẾT BỊ (DEVICE-AGNOSTIC EXPORTING)
Mọi modal xem trước hoặc trang in chứng từ **bắt buộc phải có đủ 3 hành động**:
1. **In trực tiếp (Print Preview / `window.print()`):** Dành cho máy tính bàn kết nối máy in văn phòng.
2. **Tải tệp PDF trực tiếp (.pdf):** Sử dụng `exportPdfFromElement` (tích hợp `html2pdf.js`) để tự động tạo và tải tệp `.pdf` về máy tính người dùng mà không cần mở hộp thoại in.
3. **Tải bảng tính Excel (.xlsx):** Dành cho kế toán, kiểm toán tải về laptop để đối soát số liệu, chạy công thức kiểm tra chéo.

---

### QUY TẮC 2: PHÂN TRANG CÓ CHỦ ĐÍCH (INTENTIONAL SECTION PAGE BREAKS)
- Tuyệt đối không để các mục/chương tài liệu tự do tràn trang một cách ngẫu nhiên.
- Giữa các phân mục lớn (như giữa Trang bìa với Mục I, giữa Mục II với Mục III, giữa Mục IV với Mục V), **bắt buộc chèn thẻ ngắt trang chuẩn**:
  ```tsx
  {/* Thẻ ngắt trang chuẩn quốc tế cho cả Screen, Print và html2pdf */}
  <div 
    className="html2pdf__page-break" 
    style={{ pageBreakBefore: 'always', breakBefore: 'page' }} 
  />
  ```
- Cấu hình CSS in ấn bắt buộc:
  ```css
  .html2pdf__page-break {
    page-break-before: always !important;
    break-before: page !important;
    display: block;
    height: 0;
    margin: 0;
    padding: 0;
  }
  @media print {
    .html2pdf__page-break {
      page-break-before: always !important;
      break-before: page !important;
    }
  }
  ```

---

### QUY TẮC 3: BẢO TOÀN TIÊU ĐỀ BẢNG VÀ CHỐNG CẮT ĐÔI DÒNG DỮ LIỆU
Trong trường hợp một bảng có nhiều dòng dữ liệu dài hơn 1 trang A4:
1. **Tiêu đề bảng (`<thead>`) phải lặp lại ở đầu mỗi trang in mới:**
   ```css
   thead {
     display: table-header-group !important;
   }
   ```
2. **Từng dòng dữ liệu (`<tr>`) tuyệt đối không bị cắt làm đôi ngang mặt chữ:**
   ```css
   tr {
     page-break-inside: avoid !important;
     break-inside: avoid !important;
   }
   ```
3. Khối chữ ký pháp lý (3 bên: Xã viên, Kỹ thuật ICS, Giám đốc HTX) phải luôn đi liền thành 1 khối, không bị tách rời ngày tháng với ô chữ ký:
   ```css
   .print-signature-block {
     page-break-inside: avoid !important;
     break-inside: avoid !important;
   }
   ```

---

### QUY TẮC 4: GIỚI HẠN SỐ CỘT & GỘP CỘT THÔNG MINH TRÊN KHỔ A4 DỌC
- Khổ giấy A4 dọc ở độ phân giải 96 DPI có bề rộng 210mm (~794px), trừ lề 2 bên 24mm còn lại bề rộng in ấn thực tế là **~703px**.
- **Ngưỡng an toàn tối đa trên khổ A4 dọc là 9 - 10 cột**. Tuyệt đối không nhồi nhét 11 - 13 cột khiến mỗi cột chỉ còn 30-40px.
- **Kỹ thuật gộp cột liên đới chặt chẽ:** Khi có 2 thông tin phụ thuộc nhau (ví dụ: *Thời gian cách ly PHI* và *Ngày an toàn thu hoạch*), gộp thành 1 cột phức hợp 2 dòng:
  ```tsx
  <td className="p-1.5 border border-slate-300 text-center leading-tight">
    {/* Dòng 1: Số ngày PHI */}
    <div className="font-extrabold text-rose-800 text-[10px] whitespace-nowrap">
      {log.phi_days ? `${log.phi_days} ngày` : '0 ngày'}
    </div>
    {/* Dòng 2: Ngày thu hoạch an toàn */}
    <div className="text-[9px] font-bold text-emerald-800 whitespace-nowrap mt-0.5">
      An toàn: {formatDateDisplay(log.safe_harvest_date)}
    </div>
  </td>
  ```
- **Hỗ trợ chuyển đổi khổ giấy A4 Dọc / Ngang linh hoạt:**
  Cung cấp nút chuyển nhanh khổ giấy `A4 Dọc (Portrait)` và `A4 Ngang (Landscape)` ngay trên thanh công cụ xem trước tài liệu để người dùng linh hoạt lựa chọn khi bảng biểu có nhiều thông số kỹ thuật.

---

### QUY TẮC 5: CHUẨN HÓA ĐỊNH DẠNG NGÀY THÁNG & CHỐNG GÃY DÒNG MÃ SỐ
1. **Chuẩn hóa ngày tháng hành chính Việt Nam (`DD/MM/YYYY`):**
   Tuyệt đối không hiển thị dạng ISO `YYYY-MM-DD` vì dấu gạch ngang sẽ khiến trình duyệt tự ý bẻ dòng thành `2026-` và `10-28`.
   Sử dụng hàm helper chuẩn:
   ```ts
   export const formatDateDisplay = (dateStr?: string): string => {
     if (!dateStr) return '-';
     const parts = dateStr.split('-');
     if (parts.length === 3) {
       return `${parts[2]}/${parts[1]}/${parts[0]}`;
     }
     return dateStr;
   };
   ```
2. **Khóa chống gãy dòng (`whitespace-nowrap`) cho các trường ngắn & mã định danh:**
   - Ngày tháng: `whitespace-nowrap font-mono text-center`
   - Mã thửa đất (`PLOT-TT-XV001-01`): `whitespace-nowrap font-mono text-[8.5px] tracking-tight text-center`
   - Số lô vật tư / mã lô sản phẩm (`LOT-2026-X`): `whitespace-nowrap font-mono text-[8px] tracking-tight text-center`
   - Badge trạng thái kiểm định (`✓ Đã duyệt`): `whitespace-nowrap font-bold text-emerald-800 text-center`
   - Khóa an toàn PHI: `whitespace-nowrap font-bold text-emerald-800 text-center`

---

### QUY TẮC 6: CHỐNG CẮT CỤT DẤU BA CHẤM (`...`) TRÊN VĂN BẢN DÀI
- Dữ liệu nông nghiệp và hợp tác xã có nhiều chuỗi văn bản rất dài (Tên vật tư, hoạt chất, địa chỉ thôn xóm, tên giống cây trồng, nhật ký canh tác).
- **Tuyệt đối cấm** dùng `truncate`, `overflow-hidden`, `text-ellipsis` trên các biểu mẫu in và chứng từ.
- Bắt buộc dùng `break-words whitespace-normal leading-relaxed text-[10px]` hoặc `text-[11px]` để văn bản tự động xuống dòng một cách trọn vẹn và tự nhiên.

---

### QUY TẮC 7: CẤU HÌNH CHUẨN CHO THƯ VIỆN KẾT XUẤT `html2pdf.js` VÀ `html2canvas`
Khi cấu hình hàm xuất PDF (`exportPdfFromElement`), bắt buộc tuân theo mẫu chuẩn sau:
```ts
export const exportPdfFromElement = async (
  elementOrId: HTMLElement | string,
  filename = 'tai_lieu_ocop.pdf',
  options?: Partial<PdfExportOptions>
): Promise<void> => {
  const element = typeof elementOrId === 'string'
    ? document.getElementById(elementOrId)
    : elementOrId;

  if (!element) throw new Error(`Element not found: ${elementOrId}`);

  // Căn lề chuẩn văn bản hành chính Việt Nam: Trên 10mm, Trái 12mm, Dưới 10mm, Phải 12mm
  const margin: [number, number, number, number] = [10, 12, 10, 12];

  const opt = {
    margin: margin,
    filename: filename.endsWith('.pdf') ? filename : `${filename}.pdf`,
    image: { type: 'jpeg' as const, quality: options?.imageQuality ?? 0.98 },
    html2canvas: {
      scale: options?.scale ?? 2,
      useCORS: true,
      letterRendering: true,
      scrollY: 0,
      scrollX: 0,
      // CẤM: Không đặt windowWidth cứng làm cụt viền phải
      onclone: (clonedDoc: Document) => {
        // Gỡ bỏ overflow-auto/hidden trên các container trong DOM clone để không bị clip
        clonedDoc.querySelectorAll('.overflow-x-auto, .overflow-y-auto').forEach((el) => {
          const htmlEl = el as HTMLElement;
          htmlEl.style.overflow = 'visible';
          htmlEl.style.maxWidth = 'none';
          htmlEl.style.width = '100%';
        });

        // Reset padding/margin của container xem trước trên màn hình
        const container = clonedDoc.querySelector('[data-pdf-container="true"]') as HTMLElement;
        if (container) {
          container.style.padding = '0px';
          container.style.margin = '0px';
          container.style.maxWidth = 'none';
          container.style.boxShadow = 'none';
          container.style.width = '100%';
        }
      },
    },
    jsPDF: {
      unit: 'mm',
      format: options?.format ?? 'a4',
      orientation: options?.orientation ?? 'portrait',
    },
    pagebreak: {
      mode: ['avoid-all', 'css', 'legacy'],
      before: '.html2pdf__page-break',
      avoid: ['tr', 'thead', '.avoid-break', '.print\\:break-inside-avoid'],
    },
  };

  await html2pdf().from(element).set(opt).save();
};
```

---

## 3. CHECKLIST KIỂM THỬ TRƯỚC KHI BÀN GIAO MÃ NGUỒN IN / XUẤT PDF
Mọi pull request hoặc code thay đổi chức năng xuất biểu mẫu bắt buộc phải vượt qua checklist 6 bước sau:
- [x] **Bước 1 (Đủ 3 nút):** Có đủ 3 nút "In Hồ Sơ", "Tải PDF (.pdf)", "Tải Excel (.xlsx)".
- [x] **Bước 2 (Chống cụt viền phải):** Kiểm tra đường viền mép phải của toàn bộ các bảng, đảm bảo hiển thị 100% cột cuối cùng và không bị cắt cụt.
- [x] **Bước 3 (Chống xé chữ):** Không có bất kỳ từ tiếng Việt nào bị bẻ đôi âm tiết (như `duyệ` / `t`), ngày tháng hiển thị dạng `DD/MM/YYYY`.
- [x] **Bước 4 (Chống tràn bảng):** Số cột không vượt quá 10 cột trên khổ dọc; nếu có nhiều cột kỹ thuật phải hỗ trợ khổ ngang (`landscape`).
- [x] **Bước 5 (Ngắt trang an toàn):** Các mục lớn bắt đầu ở trang mới; không có tiêu đề bảng nằm trơ trọi ở mép chân trang mà không có dòng dữ liệu.
- [x] **Bước 6 (Khối chữ ký nguyên vẹn):** Phần chữ ký 3 bên không bị chia đôi giữa 2 trang giấy.
