import * as XLSX from 'xlsx';

/**
 * Export data array to Excel (.xlsx) file
 * @param data Array of objects to export
 * @param filename File name without extension
 * @param sheetName Sheet name (default: 'Data')
 */
export const exportToExcel = (data: Record<string, any>[], filename: string, sheetName: string = 'DuLieu') => {
  if (!data || data.length === 0) {
    alert('Không có dữ liệu để xuất!');
    return;
  }

  const worksheet = XLSX.utils.json_to_sheet(data);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, sheetName);

  // Auto-width columns calculation
  const maxWidths = Object.keys(data[0] || {}).map((key) => {
    const maxValLength = Math.max(
      key.length,
      ...data.map((row) => String(row[key] ?? '').length)
    );
    return { wch: Math.min(Math.max(maxValLength + 4, 12), 40) };
  });
  worksheet['!cols'] = maxWidths;

  const dateStr = new Date().toISOString().slice(0, 10);
  XLSX.writeFile(workbook, `${filename}_${dateStr}.xlsx`);
};

/**
 * Export data array to CSV file with UTF-8 BOM for Excel compatibility
 */
export const exportToCSV = (data: Record<string, any>[], filename: string) => {
  if (!data || data.length === 0) {
    alert('Không có dữ liệu để xuất!');
    return;
  }

  const headers = Object.keys(data[0]);
  const csvRows = [headers.join(',')];

  for (const row of data) {
    const values = headers.map((header) => {
      const escaped = ('' + (row[header] ?? '')).replace(/"/g, '""');
      return `"${escaped}"`;
    });
    csvRows.push(values.join(','));
  }

  const csvContent = '\uFEFF' + csvRows.join('\n'); // Add UTF-8 BOM
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  const dateStr = new Date().toISOString().slice(0, 10);
  link.setAttribute('download', `${filename}_${dateStr}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

/**
 * Tải file Excel OpenXML (.xlsx) chuẩn trực tiếp từ máy chủ Backend
 * @param endpoint Endpoint xuất báo cáo (VD: '/reports/export/members')
 * @param fallbackFilename Tên file mặc định khi tải về
 * @param params Tham số lọc ngày tháng hoặc điều kiện truy vấn
 */
export const downloadServerReportXlsx = async (
  endpoint: string,
  fallbackFilename: string,
  params?: Record<string, any>
): Promise<void> => {
  const { apiClient } = await import('@/services/apiClient');
  const response: any = await apiClient.get(endpoint, {
    params,
    responseType: 'blob',
  });

  const blob = new Blob([response.data || response], {
    type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  });

  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.setAttribute('download', fallbackFilename);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};
