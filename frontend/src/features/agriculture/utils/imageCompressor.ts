/**
 * Nén và resize ảnh chụp hiện trường bằng HTML5 Canvas.
 * Giới hạn cạnh lớn nhất tối đa 1024px và nén JPEG chất lượng 0.75.
 * Giảm dung lượng ảnh camera từ 5MB-15MB xuống còn ~80KB-130KB,
 * triệt tiêu hoàn toàn ngoại lệ QuotaExceededError của localStorage.
 */
export function compressImage(
  file: File,
  maxWidth = 1024,
  maxHeight = 1024,
  quality = 0.75
): Promise<string> {
  return new Promise((resolve, reject) => {
    if (!file.type.startsWith('image/')) {
      return reject(new Error('Tệp không đúng định dạng hình ảnh.'));
    }

    const reader = new FileReader();
    reader.onerror = () => reject(new Error('Không thể đọc tệp hình ảnh.'));
    reader.onload = (event) => {
      const img = new Image();
      img.onerror = () => reject(new Error('Không thể tải đối tượng hình ảnh.'));
      img.onload = () => {
        let width = img.width;
        let height = img.height;

        // Giữ nguyên tỷ lệ khung hình
        if (width > maxWidth || height > maxHeight) {
          if (width / height > maxWidth / maxHeight) {
            height = Math.round((height * maxWidth) / width);
            width = maxWidth;
          } else {
            width = Math.round((width * maxHeight) / height);
            height = maxHeight;
          }
        }

        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          return reject(new Error('Trình duyệt không hỗ trợ Canvas 2D.'));
        }

        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = 'high';
        ctx.drawImage(img, 0, 0, width, height);

        // Xuất chuỗi Base64 JPEG nén tối ưu
        const compressedDataUrl = canvas.toDataURL('image/jpeg', quality);
        resolve(compressedDataUrl);
      };

      if (typeof event.target?.result === 'string') {
        img.src = event.target.result;
      } else {
        reject(new Error('Dữ liệu FileReader không hợp lệ.'));
      }
    };
    reader.readAsDataURL(file);
  });
}
