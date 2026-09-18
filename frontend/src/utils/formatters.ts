/**
 * Format currency in VND (Việt Nam Đồng)
 */
export function formatCurrency(amount: number | null | undefined): string {
  if (amount === null || amount === undefined) return '0 ₫';
  return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);
}

/**
 * Format date string to Vietnamese display format (DD/MM/YYYY)
 */
export function formatDate(dateString: string | null | undefined): string {
  if (!dateString) return '-';
  try {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return dateString;
    return new Intl.DateTimeFormat('vi-VN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    }).format(date);
  } catch {
    return dateString;
  }
}

/**
 * Format datetime string to Vietnamese display format (HH:mm DD/MM/YYYY)
 */
export function formatDateTime(dateTimeString: string | null | undefined): string {
  if (!dateTimeString) return '-';
  try {
    const date = new Date(dateTimeString);
    if (isNaN(date.getTime())) return dateTimeString;
    return new Intl.DateTimeFormat('vi-VN', {
      hour: '2-digit',
      minute: '2-digit',
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    }).format(date);
  } catch {
    return dateTimeString;
  }
}

/**
 * Format number with thousand separators
 */
export function formatNumber(value: number | null | undefined, decimals = 0): string {
  if (value === null || value === undefined) return '0';
  return new Intl.NumberFormat('vi-VN', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(value);
}

/**
 * Format area in Hectares (ha)
 */
export function formatArea(areaHa: number | null | undefined): string {
  if (areaHa === null || areaHa === undefined) return '0 ha';
  return `${formatNumber(areaHa, 2)} ha`;
}

/**
 * Convert number into Vietnamese text words for currency (e.g. 40000000 -> "Bốn mươi triệu đồng")
 */
export function numberToVietnameseWords(n: number | null | undefined): string {
  if (n === null || n === undefined || isNaN(n) || n === 0) return 'Không đồng';

  const defaultUnits = ['', 'một', 'hai', 'ba', 'bốn', 'năm', 'sáu', 'bảy', 'tám', 'chín'];

  function readTriple(num: number, showZeroHundred: boolean): string {
    const hundred = Math.floor(num / 100);
    const ten = Math.floor((num % 100) / 10);
    const unit = num % 10;
    let res = '';

    if (hundred > 0 || showZeroHundred) {
      res += defaultUnits[hundred] + ' trăm ';
    }

    if (ten > 1) {
      res += defaultUnits[ten] + ' mươi ';
      if (unit === 1) res += 'mốt ';
      else if (unit === 5) res += 'lăm ';
      else if (unit > 0) res += defaultUnits[unit] + ' ';
    } else if (ten === 1) {
      res += 'mười ';
      if (unit === 5) res += 'lăm ';
      else if (unit > 0) res += defaultUnits[unit] + ' ';
    } else {
      if (unit > 0) {
        if (hundred > 0 || showZeroHundred) res += 'lẻ ';
        res += defaultUnits[unit] + ' ';
      }
    }

    return res;
  }

  const bigUnits = ['', 'nghìn', 'triệu', 'tỷ', 'nghìn tỷ', 'triệu tỷ'];
  let str = Math.abs(Math.round(n)).toString();
  const groups: number[] = [];

  while (str.length > 0) {
    const chunk = str.slice(-3);
    str = str.slice(0, -3);
    groups.push(parseInt(chunk, 10));
  }

  const parts: string[] = [];
  for (let i = groups.length - 1; i >= 0; i--) {
    const g = groups[i];
    if (g > 0) {
      const readG = readTriple(g, i < groups.length - 1);
      const unitName = bigUnits[i] ? ' ' + bigUnits[i] : '';
      parts.push(readG.trim() + unitName);
    }
  }

  let result = parts.join(' ').replace(/\s+/g, ' ').trim();
  if (!result) return 'Không đồng';

  result = result.charAt(0).toUpperCase() + result.slice(1) + ' đồng';
  return result;
}

