/**
 * geoUtils.ts
 * Tiện ích Địa lý, WebGIS và Chuyển đổi Tọa độ Địa chính VN-2000 sang WGS-84
 * Căn cứ: Quyết định 973/2001/QĐ-TCĐC, Thông tư 25/2014/TT-BTNMT & TCVN 12850:2019
 */

export interface LatLngPoint {
  lat: number;
  lng: number;
}

export interface Vn2000Point {
  point_number?: string | number;
  x: number; // Trục X (Bắc / Northing)
  y: number; // Trục Y (Đông / Easting)
}

export interface ProvinceMeridian {
  name: string;
  meridian: number; // Kinh tuyến trục (độ)
  zone: string;
}

export const VIETNAM_PROVINCE_MERIDIANS: ProvinceMeridian[] = [
  { name: 'Lâm Đồng (Đà Lạt / Đơn Dương / Đức Trọng)', meridian: 107.75, zone: '3°' },
  { name: 'Đắk Lắk', meridian: 108.5, zone: '3°' },
  { name: 'Đắk Nông', meridian: 108.5, zone: '3°' },
  { name: 'Gia Lai', meridian: 108.25, zone: '3°' },
  { name: 'Kon Tum', meridian: 107.5, zone: '3°' },
  { name: 'Đồng Nai', meridian: 107.75, zone: '3°' },
  { name: 'Bình Thuận', meridian: 107.75, zone: '3°' },
  { name: 'Khánh Hòa', meridian: 108.25, zone: '3°' },
  { name: 'TP. Hồ Chí Minh', meridian: 105.75, zone: '3°' },
  { name: 'Hà Nội', meridian: 105.0, zone: '3°' },
  { name: 'Cần Thơ', meridian: 105.0, zone: '3°' },
  { name: 'Tiền Giang', meridian: 105.75, zone: '3°' },
  { name: 'Bến Tre', meridian: 105.75, zone: '3°' },
  { name: 'Bà Rịa - Vũng Tàu', meridian: 107.75, zone: '3°' },
  { name: 'Bình Phước', meridian: 106.25, zone: '3°' },
  { name: 'Sơn La', meridian: 103.0, zone: '3°' },
  { name: 'Lào Cai', meridian: 103.75, zone: '3°' },
];

/**
 * Chuyển đổi tọa độ trắc địa VN-2000 (Múi 3 độ, Ellipsoid WGS-84/Krasovsky) sang WGS-84 GPS (Lat, Lng)
 * @param x Tọa độ X (Northing - thường ~1.200.000m - 1.400.000m ở Lâm Đồng)
 * @param y Tọa độ Y (Easting - thường ~400.000m - 600.000m)
 * @param centralMeridian Kinh tuyến trục tỉnh thành (mặc định Lâm Đồng 107.75°)
 * @returns [lat, lng] hệ thập phân WGS-84
 */
export function convertVn2000ToWgs84(
  x: number,
  y: number,
  centralMeridian: number = 107.75
): [number, number] {
  // Thông số Elipsoid WGS-84
  const a = 6378137.0; // Bán trục lớn (m)
  const f = 1 / 298.257223563; // Độ dẹt
  const e2 = 2 * f - f * f; // Bình phương tâm sai thứ nhất: ~0.00669437999014
  const ePrime2 = e2 / (1 - e2); // Bình phương tâm sai thứ hai

  // Hệ số co giãn múi chiếu 3 độ của VN-2000
  const k0 = 0.9999;
  const falseEasting = 500000.0;
  const falseNorthing = 0.0;

  const northing = (x - falseNorthing) / k0;
  const easting = (y - falseEasting) / k0;

  // Tính vĩ độ điểm chân (Footprint Latitude phi1)
  const e1 = (1 - Math.sqrt(1 - e2)) / (1 + Math.sqrt(1 - e2));
  const M = northing;
  const mu = M / (a * (1 - e2 / 4 - (3 * e2 * e2) / 64 - (5 * Math.pow(e2, 3)) / 256));

  const phi1 =
    mu +
    ((3 * e1) / 2 - (27 * Math.pow(e1, 3)) / 32) * Math.sin(2 * mu) +
    ((21 * e1 * e1) / 16 - (55 * Math.pow(e1, 4)) / 32) * Math.sin(4 * mu) +
    ((151 * Math.pow(e1, 3)) / 96) * Math.sin(6 * mu) +
    ((1097 * Math.pow(e1, 4)) / 512) * Math.sin(8 * mu);

  const sinPhi1 = Math.sin(phi1);
  const cosPhi1 = Math.cos(phi1);
  const tanPhi1 = Math.tan(phi1);

  const C1 = ePrime2 * cosPhi1 * cosPhi1;
  const T1 = tanPhi1 * tanPhi1;
  const N1 = a / Math.sqrt(1 - e2 * sinPhi1 * sinPhi1);
  const R1 = (a * (1 - e2)) / Math.pow(1 - e2 * sinPhi1 * sinPhi1, 1.5);
  const D = easting / N1;

  // Tính Vĩ độ (Latitude)
  const latRad =
    phi1 -
    ((N1 * tanPhi1) / R1) *
      ((D * D) / 2 -
        ((5 + 3 * T1 + 10 * C1 - 4 * C1 * C1 - 9 * ePrime2) * Math.pow(D, 4)) / 24 +
        ((61 + 90 * T1 + 298 * C1 + 45 * T1 * T1 - 252 * ePrime2 - 3 * C1 * C1) * Math.pow(D, 6)) / 720);

  // Tính Kinh độ (Longitude)
  const lngRad =
    (D -
      ((1 + 2 * T1 + C1) * Math.pow(D, 3)) / 6 +
      ((5 - 2 * C1 + 28 * T1 - 3 * C1 * C1 + 8 * ePrime2 + 24 * T1 * T1) * Math.pow(D, 5)) / 120) /
    cosPhi1;

  const latDeg = (latRad * 180) / Math.PI;
  const lngDeg = centralMeridian + (lngRad * 180) / Math.PI;

  return [parseFloat(latDeg.toFixed(7)), parseFloat(lngDeg.toFixed(7))];
}

/**
 * Tính diện tích thực địa (m2) của đa giác thửa đất trên mặt elipsoid trái đất
 * Dựa trên thuật toán Spherical Excess
 * @param coordinates Mảng tọa độ đỉnh [lat, lng]
 */
export function calculatePolygonAreaM2(coordinates: [number, number][]): number {
  if (!coordinates || coordinates.length < 3) {
    return 0;
  }

  const radius = 6378137; // Bán kính elipsoid WGS-84 (mét)
  let totalAngle = 0;
  const numPoints = coordinates.length;

  for (let i = 0; i < numPoints; i++) {
    const p1 = coordinates[i];
    const p2 = coordinates[(i + 1) % numPoints];

    const lat1Rad = (p1[0] * Math.PI) / 180;
    const lat2Rad = (p2[0] * Math.PI) / 180;
    const deltaLngRad = ((p2[1] - p1[1]) * Math.PI) / 180;

    totalAngle += deltaLngRad * (2 + Math.sin(lat1Rad) + Math.sin(lat2Rad));
  }

  const areaM2 = Math.abs((totalAngle * radius * radius) / 4);
  return parseFloat(areaM2.toFixed(2));
}

/**
 * Tính trọng tâm (Centroid) của đa giác thửa đất để đặt nhãn trên bản đồ
 */
export function calculatePolygonCentroid(coordinates: [number, number][]): [number, number] {
  if (!coordinates || coordinates.length === 0) {
    return [11.9404, 108.4583]; // Tọa độ mặc định Lâm Đồng
  }

  let sumLat = 0;
  let sumLng = 0;
  const len = coordinates.length;

  for (let i = 0; i < len; i++) {
    sumLat += coordinates[i][0];
    sumLng += coordinates[i][1];
  }

  return [parseFloat((sumLat / len).toFixed(7)), parseFloat((sumLng / len).toFixed(7))];
}

/**
 * Chuyển đổi danh sách thửa đất sang định dạng chuẩn GeoJSON FeatureCollection
 */
export function exportFarmPlotsToGeoJson(plots: any[], unitInfo?: any): string {
  const features = plots
    .filter((plot) => plot.geometry_geojson || (plot.vn2000_coordinates && plot.vn2000_coordinates.length >= 3))
    .map((plot) => {
      let geometry = plot.geometry_geojson;

      // Nếu chỉ có vn2000_coordinates, chuyển đổi sang GeoJSON Polygon
      if (!geometry && plot.vn2000_coordinates && plot.vn2000_coordinates.length >= 3) {
        const ring = plot.vn2000_coordinates.map((pt: any) => {
          if (Array.isArray(pt)) {
            const [lat, lng] = convertVn2000ToWgs84(pt[0], pt[1]);
            return [lng, lat]; // GeoJSON dùng chuẩn [lng, lat]
          }
          const [lat, lng] = convertVn2000ToWgs84(pt.x, pt.y);
          return [lng, lat];
        });
        // Khép kín vòng
        if (ring[0][0] !== ring[ring.length - 1][0] || ring[0][1] !== ring[ring.length - 1][1]) {
          ring.push(ring[0]);
        }
        geometry = {
          type: 'Polygon',
          coordinates: [ring],
        };
      }

      const aNum = Number(plot.area) || 0;
      const areaHa = aNum < 100 ? aNum : aNum / 10000;
      const areaM2 = aNum < 100 ? aNum * 10000 : aNum;
      const yieldRate = plot.max_yield_rate_per_sqm ?? 5.0;
      const quotaKg = plot.max_harvest_quota_kg ?? Math.round(areaM2 * yieldRate * 1.2);

      return {
        type: 'Feature',
        id: plot.id,
        geometry,
        properties: {
          plot_code: plot.plot_code,
          production_unit_code: plot.unit_code || unitInfo?.unit_code || '',
          area_ha: areaHa,
          area_m2: areaM2,
          max_yield_rate_per_sqm: yieldRate,
          max_harvest_quota_kg: quotaKg,
          greenhouse_type: plot.greenhouse_type,
          national_cadastral_code: plot.national_cadastral_code,
          land_sheet_number: plot.land_sheet_number,
          land_parcel_number: plot.land_parcel_number,
          land_contract_expired_at: plot.land_contract_expired_at,
          status: plot.status,
        },
      };
    });

  const geoJsonData = {
    type: 'FeatureCollection',
    name: `HTX_FarmPlots_${unitInfo?.unit_code || 'Export'}`,
    crs: {
      type: 'name',
      properties: {
        name: 'urn:ogc:def:crs:OGC:1.3:CRS84',
      },
    },
    features,
  };

  return JSON.stringify(geoJsonData, null, 2);
}

/**
 * Trình phân tích cú pháp chuỗi tọa độ VN-2000 do người dùng copy-paste từ bảng Sổ đỏ
 * Hỗ trợ các định dạng:
 * 1. "1 1320450.25 450120.80"
 * 2. "1320450.25, 450120.80"
 * 3. Bảng tab-separated từ Excel
 */
export function parseVn2000RawInput(rawText: string, meridian: number = 107.75): {
  points: Vn2000Point[];
  wgs84Points: [number, number][];
  areaM2: number;
} {
  const lines = rawText.split(/\r?\n/).map((l) => l.trim()).filter(Boolean);
  const points: Vn2000Point[] = [];
  const wgs84Points: [number, number][] = [];

  lines.forEach((line, index) => {
    // Tách bằng khoảng trắng, dấu phẩy hoặc tab
    const tokens = line.split(/[\s,;\t]+/).filter(Boolean);
    if (tokens.length >= 2) {
      let x = 0;
      let y = 0;
      let ptNum: string | number = index + 1;

      if (tokens.length >= 3 && !isNaN(parseFloat(tokens[0])) && parseFloat(tokens[0]) < 1000) {
        // Có cột số thứ tự đỉnh: [STT, X, Y]
        ptNum = tokens[0];
        x = parseFloat(tokens[1]);
        y = parseFloat(tokens[2]);
      } else {
        // Chỉ có 2 số: [X, Y]
        x = parseFloat(tokens[0]);
        y = parseFloat(tokens[1]);
      }

      // Kiểm tra hoán đổi nếu người dùng nhập ngược Y trước X sau
      // Ở Việt Nam, X (Bắc) thường > 1.000.000m, Y (Đông) thường < 1.000.000m (khoảng 400.000 - 600.000m)
      if (x < 900000 && y > 900000) {
        const temp = x;
        x = y;
        y = temp;
      }

      if (!isNaN(x) && !isNaN(y) && x > 0 && y > 0) {
        points.push({ point_number: ptNum, x, y });
        const gps = convertVn2000ToWgs84(x, y, meridian);
        wgs84Points.push(gps);
      }
    }
  });

  const areaM2 = calculatePolygonAreaM2(wgs84Points);

  return {
    points,
    wgs84Points,
    areaM2,
  };
}
