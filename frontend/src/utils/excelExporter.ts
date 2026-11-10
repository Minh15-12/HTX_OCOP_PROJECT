import * as XLSX from 'xlsx';
import { Member, CapitalTransaction } from '@/types/memberTypes';

export interface CapitalSummaryData {
  total_committed_capital?: number;
  total_paid_capital?: number;
  remaining_capital?: number;
  completion_rate?: number;
  total_members?: number;
  contributed_member_count?: number;
}

export const exportCapitalToExcel = (
  members: Member[],
  transactions: CapitalTransaction[],
  summary?: CapitalSummaryData,
  fileName = 'Bao_Cao_Von_Gop_HTX.xlsx'
) => {
  const wb = XLSX.utils.book_new();

  // SHEET 1: Danh sách tổng hợp vốn góp xã viên
  const memberHeaders = [
    'STT',
    'Mã xã viên',
    'Họ và tên',
    'Số CCCD/CMND',
    'Số điện thoại',
    'Địa chỉ',
    'Loại thành viên',
    'Vốn cam kết (VNĐ)',
    'Vốn đã góp (VNĐ)',
    'Vốn còn thiếu (VNĐ)',
    'Tỷ lệ sở hữu (%)',
    'Trạng thái góp vốn',
    'Ngày kết nạp',
  ];

  const memberRows = members.map((m, idx) => {
    const memberTypeStr =
      m.member_type === 'CHINH_THUC'
        ? 'Chính thức'
        : m.member_type === 'LIEN_KET_GOP_VON'
        ? 'Liên kết góp vốn'
        : 'Liên kết không góp vốn';

    const statusStr =
      m.capital_status === 'DU_VON'
        ? 'Đủ vốn'
        : m.capital_status === 'CHUA_DU'
        ? 'Chưa đủ vốn'
        : 'Chờ đối soát';

    return [
      idx + 1,
      m.member_code || '',
      m.full_name || '',
      m.cccd || '',
      m.phone || '',
      m.address || '',
      memberTypeStr,
      Number(m.committed_capital || 0),
      Number(m.contributed_capital || m.total_capital_contributed || 0),
      Number(m.remaining_capital || 0),
      Number(m.ownership_percentage || 0),
      statusStr,
      m.join_date || '',
    ];
  });

  const wsMembers = XLSX.utils.aoa_to_sheet([memberHeaders, ...memberRows]);
  wsMembers['!cols'] = [
    { wch: 6 },  // STT
    { wch: 14 }, // Mã xã viên
    { wch: 24 }, // Họ và tên
    { wch: 16 }, // CCCD
    { wch: 14 }, // SĐT
    { wch: 35 }, // Địa chỉ
    { wch: 16 }, // Loại thành viên
    { wch: 20 }, // Vốn cam kết
    { wch: 20 }, // Vốn đã góp
    { wch: 20 }, // Vốn còn thiếu
    { wch: 16 }, // Tỷ lệ sở hữu
    { wch: 16 }, // Trạng thái
    { wch: 14 }, // Ngày kết nạp
  ];
  XLSX.utils.book_append_sheet(wb, wsMembers, 'Tong_Hop_Von_Xa_Vien');

  // SHEET 2: Lịch sử các giao dịch góp vốn
  const txHeaders = [
    'STT',
    'Mã giao dịch',
    'Mã xã viên',
    'Tên xã viên',
    'Hình thức góp vốn',
    'Số tiền / Giá trị (VNĐ)',
    'Ngày giao dịch',
    'Mã Giấy chứng nhận',
    'Số GCN QSDĐ',
    'Số thửa đất',
    'Tờ bản đồ',
    'Diện tích (m2)',
    'Trạng thái',
    'Ghi chú / Diễn giải',
  ];

  const txRows = transactions.map((t, idx) => {
    const formMap: Record<string, string> = {
      CASH: 'Tiền mặt',
      BANK_TRANSFER: 'Chuyển khoản',
      LAND: 'Quyền sử dụng đất',
      ASSET: 'Tài sản / Hiện vật',
    };
    const formStr = formMap[t.payment_method] || t.payment_method || 'Tiền mặt';

    return [
      idx + 1,
      t.transaction_code || t.receipt_number || t.id || `GD-${idx + 1}`,
      t.member_code || '',
      t.member_name || '',
      formStr,
      Number(t.amount || 0),
      t.contribution_date || '',
      t.certificate_code || '',
      t.land_details?.land_certificate_no || '',
      t.land_details?.plot_number || '',
      t.land_details?.map_sheet_number || '',
      t.land_details?.land_area_sqm || '',
      t.status === 'APPROVED' ? 'Đã duyệt' : t.status === 'PENDING' ? 'Chờ duyệt' : 'Từ chối',
      t.content || t.notes || '',
    ];
  });

  const wsTx = XLSX.utils.aoa_to_sheet([txHeaders, ...txRows]);
  wsTx['!cols'] = [
    { wch: 6 },  // STT
    { wch: 18 }, // Mã GD
    { wch: 14 }, // Mã XV
    { wch: 22 }, // Tên XV
    { wch: 20 }, // Hình thức
    { wch: 22 }, // Số tiền
    { wch: 16 }, // Ngày GD
    { wch: 20 }, // Mã GCN
    { wch: 18 }, // GCN QSDĐ
    { wch: 12 }, // Thửa
    { wch: 12 }, // Tờ bản đồ
    { wch: 14 }, // Diện tích
    { wch: 14 }, // Trạng thái
    { wch: 35 }, // Ghi chú
  ];
  XLSX.utils.book_append_sheet(wb, wsTx, 'Lich_Su_Giao_Dich');

  // SHEET 3: Báo cáo tổng hợp vốn điều lệ
  if (summary) {
    const summaryRows = [
      ['BÁO CÁO TỔNG HỢP VỐN ĐIỀU LỆ & VỐN GÓP HỢP TÁC XÃ'],
      ['Thời điểm xuất báo cáo:', new Date().toLocaleString('vi-VN')],
      [''],
      ['Chỉ tiêu', 'Giá trị'],
      ['Tổng vốn điều lệ cam kết (VNĐ)', Number(summary.total_committed_capital || 0)],
      ['Tổng vốn thực tế đã góp (VNĐ)', Number(summary.total_paid_capital || 0)],
      ['Tổng vốn còn thiếu (VNĐ)', Number(summary.remaining_capital || 0)],
      ['Tỷ lệ hoàn thành vốn (%)', `${Number(summary.completion_rate || 0)}%`],
      ['Tổng số xã viên HTX', Number(summary.total_members || members.length)],
      ['Số xã viên đã tham gia góp vốn', Number(summary.contributed_member_count || 0)],
    ];
    const wsSummary = XLSX.utils.aoa_to_sheet(summaryRows);
    wsSummary['!cols'] = [{ wch: 35 }, { wch: 30 }];
    XLSX.utils.book_append_sheet(wb, wsSummary, 'Tong_Quan_Von');
  }

  // Trigger download
  XLSX.writeFile(wb, fileName);
};

export const exportMembersToExcel = (
  members: Member[],
  fileName = 'Danh_Sach_Xa_Vien_HTX.xlsx'
) => {
  const wb = XLSX.utils.book_new();

  const headers = [
    'STT',
    'Mã xã viên',
    'Họ và tên',
    'Giới tính',
    'Ngày sinh',
    'Số CCCD/CMND',
    'Ngày cấp',
    'Nơi cấp',
    'Số điện thoại',
    'Email',
    'Địa chỉ thường trú',
    'Loại thành viên',
    'Vốn cam kết (VNĐ)',
    'Vốn đã góp (VNĐ)',
    'Tỷ lệ sở hữu (%)',
    'Trạng thái',
    'Ngày kết nạp',
  ];

  const rows = members.map((m, idx) => {
    const memberTypeStr =
      m.member_type === 'CHINH_THUC'
        ? 'Chính thức'
        : m.member_type === 'LIEN_KET_GOP_VON'
        ? 'Liên kết góp vốn'
        : 'Liên kết không góp vốn';

    const statusStr =
      m.status === 'ACTIVE'
        ? 'Đang hoạt động'
        : m.status === 'PENDING'
        ? 'Chờ duyệt'
        : m.status === 'REJECTED'
        ? 'Từ chối'
        : 'Đã rút vốn / Ngưng';

    return [
      idx + 1,
      m.member_code || '',
      m.full_name || '',
      m.gender || 'Nam',
      m.dob || '',
      m.cccd || '',
      m.cccd_issue_date || '',
      m.cccd_issue_place || '',
      m.phone || '',
      m.email || '',
      m.address || '',
      memberTypeStr,
      Number(m.committed_capital || 0),
      Number(m.contributed_capital || m.total_capital_contributed || 0),
      Number(m.ownership_percentage || 0),
      statusStr,
      m.join_date || '',
    ];
  });

  const ws = XLSX.utils.aoa_to_sheet([headers, ...rows]);
  ws['!cols'] = [
    { wch: 6 },  // STT
    { wch: 14 }, // Mã XV
    { wch: 24 }, // Họ tên
    { wch: 10 }, // Giới tính
    { wch: 12 }, // Ngày sinh
    { wch: 16 }, // CCCD
    { wch: 14 }, // Ngày cấp
    { wch: 25 }, // Nơi cấp
    { wch: 14 }, // SĐT
    { wch: 22 }, // Email
    { wch: 35 }, // Địa chỉ
    { wch: 16 }, // Loại TV
    { wch: 20 }, // Vốn cam kết
    { wch: 20 }, // Vốn đã góp
    { wch: 16 }, // Tỷ lệ %
    { wch: 16 }, // Trạng thái
    { wch: 14 }, // Ngày kết nạp
  ];

  XLSX.utils.book_append_sheet(wb, ws, 'Danh_Sach_Xa_Vien');
  XLSX.writeFile(wb, fileName);
};

export const exportCropSeasonsToExcel = (
  seasons: any[],
  fileName = 'Ke_Hoach_Mua_Vu_HTX.xlsx'
) => {
  const wb = XLSX.utils.book_new();

  const headers = [
    'STT',
    'Tên mùa vụ',
    'Cây trồng',
    'Mã vùng sản xuất',
    'Tên vùng sản xuất',
    'Trần sản lượng PUC (kg)',
    'Nguồn giống F1',
    'Ngày bắt đầu',
    'Ngày dự kiến kết thúc',
    'Ngày kết thúc thực tế',
    'Trạng thái mùa vụ',
    'Trạng thái sổ nhật ký',
  ];

  const rows = seasons.map((s, idx) => {
    const statusText =
      s.status === 'PLANNED'
        ? 'Chưa bắt đầu'
        : s.status === 'ACTIVE'
        ? 'Đang diễn ra'
        : s.status === 'HARVESTING'
        ? 'Đang thu hoạch'
        : s.status === 'COMPLETED'
        ? 'Đã kết thúc'
        : s.status || '';

    const logbookStatusText =
      s.logbook_status === 'FROZEN_ARCHIVED' ? 'Đã khóa sổ (Merkle)' : 'Đang mở ghi chép';

    return [
      idx + 1,
      s.name || '',
      s.crop || '',
      s.unit_code || '',
      s.unit_name || '',
      Number(s.puc_quota_kg || 0),
      s.seed_supplier || '',
      s.start_date ? s.start_date.slice(0, 10) : '',
      s.expected_end_date ? s.expected_end_date.slice(0, 10) : '',
      s.actual_end_date ? s.actual_end_date.slice(0, 10) : '',
      statusText,
      logbookStatusText,
    ];
  });

  const ws = XLSX.utils.aoa_to_sheet([headers, ...rows]);
  ws['!cols'] = [
    { wch: 6 },  // STT
    { wch: 28 }, // Tên mùa vụ
    { wch: 18 }, // Cây trồng
    { wch: 18 }, // Mã vùng
    { wch: 25 }, // Tên vùng
    { wch: 22 }, // Trần PUC
    { wch: 24 }, // Nguồn giống
    { wch: 14 }, // Ngày bắt đầu
    { wch: 16 }, // Ngày kết thúc DK
    { wch: 16 }, // Ngày kết thúc TT
    { wch: 18 }, // Trạng thái vụ
    { wch: 22 }, // Trạng thái sổ
  ];

  XLSX.utils.book_append_sheet(wb, ws, 'Ke_Hoach_Mua_Vu');
  XLSX.writeFile(wb, fileName);
};

export const exportSeasonBomToExcel = (
  season: any,
  boms: any[],
  fileName = `Du_Toan_Vat_Tu_BOM_${season?.name ? season.name.replace(/\s+/g, '_') : 'Mua_Vu'}.xlsx`
) => {
  const wb = XLSX.utils.book_new();

  const phaseNames: Record<string, string> = {
    GENERAL: 'Toàn vụ',
    SEEDLING: 'Ươm & Bén rễ',
    VEGETATIVE: 'Sinh dưỡng thân lá',
    FLOWERING: 'Ra hoa & Đậu quả',
    FRUITING: 'Nuôi quả & Thu hoạch',
  };

  const headers = [
    'STT',
    'Tên vật tư',
    'Mã SKU',
    'Đơn vị tính',
    'Giai đoạn sinh trưởng',
    'Định mức / m²',
    'Số lượng kế hoạch',
    'Số lượng đã xuất kho',
    'Đơn giá dự kiến (VNĐ)',
    'Thành tiền dự toán (VNĐ)',
    'Ghi chú kỹ thuật',
  ];

  let totalPlannedCost = 0;
  const rows = boms.map((b, idx) => {
    const cost = Number(b.estimated_total_cost || (Number(b.planned_quantity || 0) * Number(b.estimated_unit_price || 0)));
    totalPlannedCost += cost;

    return [
      idx + 1,
      b.material_name || '',
      b.sku || '',
      b.unit || '',
      phaseNames[b.stage_phase] || b.stage_phase || 'Toàn vụ',
      Number(b.standard_rate_per_sqm || 0),
      Number(b.planned_quantity || 0),
      Number(b.issued_quantity || 0),
      Number(b.estimated_unit_price || 0),
      cost,
      b.notes || '',
    ];
  });

  // Summary row
  rows.push([
    '',
    'TỔNG CỘNG NGÂN SÁCH DỰ TOÁN',
    '',
    '',
    '',
    '',
    '',
    '',
    '',
    totalPlannedCost,
    '',
  ]);

  const ws = XLSX.utils.aoa_to_sheet([
    [`DỰ TOÁN ĐỊNH MỨC VẬT TƯ ĐẦU VÀO (BOM) - ${season?.name || ''}`],
    [`Cây trồng: ${season?.crop || '—'} | Vùng sản xuất: ${season?.unit_name || season?.unit_code || '—'}`],
    [''],
    headers,
    ...rows,
  ]);

  ws['!cols'] = [
    { wch: 6 },  // STT
    { wch: 28 }, // Tên vật tư
    { wch: 16 }, // SKU
    { wch: 12 }, // ĐVT
    { wch: 22 }, // Giai đoạn
    { wch: 15 }, // Định mức/m2
    { wch: 18 }, // SL kế hoạch
    { wch: 18 }, // SL đã xuất
    { wch: 20 }, // Đơn giá
    { wch: 22 }, // Thành tiền
    { wch: 30 }, // Ghi chú
  ];

  XLSX.utils.book_append_sheet(wb, ws, 'Du_Toan_BOM');
  XLSX.writeFile(wb, fileName);
};

