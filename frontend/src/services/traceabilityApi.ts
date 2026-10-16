import { apiClient } from './apiClient';
import type { PublicTraceabilityData } from '@/types/agriculture';

/**
 * Standard public mock traceability data for HTX Tân Tiến - Ớt chuông Sweet Palermo Đỏ Đà Lạt.
 */
export const defaultPalermoTraceability: PublicTraceabilityData = {
  lot_code: 'LOT-TT-XV003-01-20261015-01',
  cooperative: {
    name: 'Hợp tác xã Nông nghiệp Tân Tiến',
    code: 'TT',
    address: 'Thôn Đạ Sar, Xã Đạ Sar, Huyện Lạc Dương, Tỉnh Lâm Đồng (Vùng phụ cận TP. Đà Lạt)',
    hotline: '0263 382 9988',
    email: 'contact@htxtantien.vn',
    province: 'Lâm Đồng',
    representative: 'Mai Văn Khẩn (Chủ tịch HĐQT & Giám đốc)',
    tax_code: '5801456789',
  },
  product: {
    name: 'Ớt chuông Sweet Palermo Đỏ Đà Lạt',
    variety: 'Rijk Zwaan Sweet Palermo Red (Hạt giống nhập khẩu Hà Lan)',
    puc_code: 'PUC-49-015-9923',
    puc_issuer: 'Cục Bảo vệ Thực vật - Bộ Nông nghiệp & PTNT',
    grade: 'GRADE_A',
    brix_level: 8.2,
    uniformity_rate: 94.5,
    harvest_date: '2026-10-15',
    expiry_date: '2026-10-30',
    packaging_spec: 'Khay 500g bọc màng thở sinh học / Thùng carton 5kg chuẩn OCOP',
    storage_instructions: 'Bảo quản nhiệt độ 7°C - 10°C, độ ẩm 90-95%, tránh ánh nắng trực tiếp',
    description:
      'Dòng ớt chuông ngọt thượng hạng Sweet Palermo Đỏ nổi tiếng thế giới. Trái thuôn dài, vỏ mỏng bóng đỏ tươi, vị ngọt thanh tự nhiên, giòn ngọt không hăng cay, hàm lượng Vitamin C cao gấp 3 lần cam.',
    image_url: '/images/products/sweet-palermo-red.jpg',
  },
  plot: {
    plot_code: 'PLOT-TT-XV003-01',
    plot_name: 'Thửa Đất Nhà Kính 01 - Vùng Trồng Hòn Bồ P12',
    production_unit_name: 'Vùng trồng Ớt Chuông Sweet Palermo Hòn Bồ',
    gps_coordinates: '11.9501° N, 108.4712° E',
    gps_latitude: 11.9501,
    gps_longitude: 108.4712,
    area_sqm: 5000,
    assigned_member: 'Nguyễn Văn An (Mã Xã viên: XV-003)',
    soil_type: 'Giá thể mùn xơ dừa cao cấp kết hợp đất đỏ bazan Lâm Đồng',
  },
  farming_journey: [
    {
      stage_number: 1,
      stage_name: 'Chuẩn Bị Giá Thể & Vùng Trồng',
      date: '2026-07-01',
      activity_type: 'LAND_PREPARATION',
      description: 'Xử lý giá thể xơ dừa sạch, khử trùng nhà kính thông minh Israel, lắp đặt hệ thống tưới nhỏ giọt tự động bù áp.',
      materials_used: 'Vôi nông nghiệp tinh khiết, Chế phẩm Trichoderma ủ men',
      location_gps: '11.9501° N, 108.4712° E',
      status: 'VERIFIED',
    },
    {
      stage_number: 2,
      stage_name: 'Xuống Giống Sweet Palermo Chuẩn F1',
      date: '2026-07-15',
      activity_type: 'PLANTING',
      description: 'Tiếp nhận cây giống 28 ngày tuổi từ vườn ươm đối tác Rijk Zwaan, mật độ 2.8 cây/m², đo độ ẩm và nhiệt độ nhà màng.',
      materials_used: 'Cây giống ớt Sweet Palermo F1 nhập khẩu chính ngạch',
      location_gps: '11.9501° N, 108.4712° E',
      status: 'VERIFIED',
    },
    {
      stage_number: 3,
      stage_name: 'Chăm Sóc & Dinh Dưỡng VietGAP',
      date: '2026-08-20',
      activity_type: 'FERTILIZATION',
      description: 'Châm phân sinh học Ca-B, Kali hữu cơ qua mạng lưới tưới nhỏ giọt kiểm soát vi khí hậu tự động.',
      materials_used: 'Dinh dưỡng hữu cơ vi sinh Haifa Israel',
      location_gps: '11.9501° N, 108.4712° E',
      status: 'VERIFIED',
    },
    {
      stage_number: 4,
      stage_name: 'Phun Chế Phẩm Sinh Học & Khóa PHI',
      date: '2026-10-01',
      activity_type: 'SPRAYING',
      description: 'Phun chế phẩm sinh học Bio-Tricho phòng bọ phấn trắng đợt cuối. Hệ thống kích hoạt Khóa an toàn PHI Guard 14 ngày.',
      materials_used: 'Chế phẩm Nấm ký sinh thảo mộc Bio-Tricho (Lô LOT-BIO-2026-88)',
      location_gps: '11.9501° N, 108.4712° E',
      status: 'VERIFIED',
    },
    {
      stage_number: 5,
      stage_name: 'Thu Hoạch, KCS 3 Cấp & Đóng Gói GS1',
      date: '2026-10-15',
      activity_type: 'HARVEST',
      description: 'Hết thời hạn cách ly PHI (An toàn 100%). Cắt hái quả chín đỏ độ ngọt Brix 8.2°, Test nhanh âm tính chất cấm, phân loại Grade A.',
      materials_used: 'Khay màng thở OCOP, Tem QR GS1 thông minh',
      location_gps: '11.9501° N, 108.4712° E',
      status: 'VERIFIED',
    },
  ],
  kcs_inspection: {
    gate_check: 'PASSED',
    quick_lab: 'LAB_PASSED',
    lab_kit_code: 'KIT-RAPID-PEST-449',
    residue_ppm: 0.0,
    brix_level: 8.2,
    uniformity_rate: 94.5,
    inspection_date: '2026-10-15T09:00:00Z',
    inspector: 'Kỹ sư KCS Nguyễn Thu Trang (Tổ KCS HTX Tân Tiến)',
    overall_status: 'PASSED',
  },
  certifications: [
    {
      name: 'Chứng Nhận Sản Phẩm OCOP 4 Sao Tỉnh Lâm Đồng',
      code: 'OCOP-LD-2025-4S-088',
      issuer: 'UBND Tỉnh Lâm Đồng / Hội đồng OCOP cấp Tỉnh',
      valid_until: '2028-12-31',
      badge_label: 'OCOP 4 SAO ⭐⭐⭐⭐',
      description: 'Đánh giá phân hạng theo Quyết định số 148/QĐ-TTg của Thủ tướng Chính phủ',
    },
    {
      name: 'Chứng Nhận Quy Trình Sản Xuất Nông Nghiệp Tốt (VietGAP)',
      code: 'VIETGAP-TT-49-2024-9921',
      issuer: 'Trung tâm Giám định & Chứng nhận Nông sản Quốc gia',
      valid_until: '2027-06-30',
      badge_label: 'VIETGAP CHUẨN',
      description: 'Tuân thủ nghiêm ngặt tiêu chuẩn VietGAP trồng trọt an toàn',
    },
    {
      name: 'Mã Số Vùng Trồng Xuất Khẩu (PUC)',
      code: 'PUC-49-015-9923',
      issuer: 'Cục Bảo vệ Thực vật (Mã số chính thức cấp cho HTX Tân Tiến)',
      valid_until: '2029-12-31',
      badge_label: 'MÃ VÙNG TRỒNG PUC',
      description: 'Định danh vùng trồng ớt chuông an toàn và truy xuất nguồn gốc',
    },
  ],
  integrity_hash: 'c8d451e03a985fbf80d463b2f913d66a7bcf1489e80f49cf52c4e402a5cf3a81',
  qr_verify_url: 'https://htxtantien.vn/trace/LOT-TT-XV003-01-20261015-01',
};

// Danh sách mã lô demo hạt giống hợp lệ được phép fallback khi offline/mock
const VERIFIED_OFFLINE_LOTS = new Set([
  'LOT-TT-XV003-01-20261015-01',
  'LOT-TT-01-20261015-01',
  'LOT-TT-02-20261016-01',
  'LOT-TT-01-20261014-01',
  'LOT-TT-02-20261012-01',
  'LOT-TT-01-20261010-01',
  defaultPalermoTraceability.lot_code,
]);

/**
 * Fetch Public Traceability data without requiring authentication.
 * Re-throws HTTP 404 for unknown/fake lots to prevent attestation spoofing.
 */
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

    // 2. If backend route is temporarily unreachable (network error / dev fallback), check internal endpoint if authenticated
    try {
      const res: any = await apiClient.get(`/lots/${encodeURIComponent(cleanLotId)}/traceability`);
      if (res?.data) {
        return adaptToPublicTraceability(res.data, cleanLotId);
      }
    } catch (innerErr: any) {
      if (innerErr?.status === 404 || innerErr?.response?.status === 404 || innerErr?.code === 'LOT_NOT_FOUND') {
        const notFoundError: any = new Error(`Không tìm thấy mã lô truy xuất [${cleanLotId}] trong hệ thống`);
        notFoundError.status = 404;
        notFoundError.code = 'LOT_NOT_FOUND';
        throw notFoundError;
      }
    }
  }

  // 3. Strict Offline Fallback Guard:
  // ONLY return mock fallback data if lotId matches registered demo seed lots
  if (VERIFIED_OFFLINE_LOTS.has(cleanLotId)) {
    return {
      ...defaultPalermoTraceability,
      lot_code: cleanLotId,
      qr_verify_url: `${window.location.origin}/trace/${cleanLotId}`,
    };
  }

  // 4. For any non-existent / random / fake lot code (e.g. FAKE_123, MALO_GIA_999), THROW 404 error!
  const notFoundError: any = new Error(`Không tìm thấy mã lô truy xuất [${cleanLotId}] trong hệ thống`);
  notFoundError.status = 404;
  notFoundError.code = 'LOT_NOT_FOUND';
  throw notFoundError;
}

function adaptToPublicTraceability(backendData: any, lotId: string): PublicTraceabilityData {
  return {
    lot_code: backendData.lot_code || lotId,
    cooperative: backendData.cooperative || defaultPalermoTraceability.cooperative,
    product: {
      ...defaultPalermoTraceability.product,
      ...(backendData.product || {}),
      name: backendData.product?.name || defaultPalermoTraceability.product.name,
    },
    plot: {
      ...defaultPalermoTraceability.plot,
      ...(backendData.plot || {}),
    },
    farming_journey: backendData.farming_journey || defaultPalermoTraceability.farming_journey,
    kcs_inspection: {
      ...defaultPalermoTraceability.kcs_inspection,
      ...(backendData.kcs_inspection || {}),
    },
    certifications: defaultPalermoTraceability.certifications,
    integrity_hash: backendData.integrity_hash || defaultPalermoTraceability.integrity_hash,
    qr_verify_url: `${window.location.origin}/trace/${lotId}`,
  };
}
