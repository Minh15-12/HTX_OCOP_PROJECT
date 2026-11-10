import React, { useState } from 'react';
import {
  VIETNAM_PROVINCE_MERIDIANS,
  parseVn2000RawInput,
  Vn2000Point,
} from '../utils/geoUtils';

interface Vn2000ConverterModalProps {
  isOpen: boolean;
  onClose: () => void;
  plotCode?: string;
  nominalArea?: number;
  onApplyCoordinates: (data: {
    wgs84Coordinates: [number, number][];
    vn2000Points: Vn2000Point[];
    calculatedAreaM2: number;
  }) => void;
}

export const Vn2000ConverterModal: React.FC<Vn2000ConverterModalProps> = ({
  isOpen,
  onClose,
  plotCode,
  nominalArea,
  onApplyCoordinates,
}) => {
  const [selectedMeridian, setSelectedMeridian] = useState<number>(107.75); // Lâm Đồng mặc định
  const [rawText, setRawText] = useState<string>('');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  if (!isOpen) return null;

  // Dữ liệu mẫu tọa độ thực tế tại Đà Lạt - Lâm Đồng
  const loadSampleCoordinates = () => {
    const sample = `1  1322018.62  577491.29
2  1322018.90  577600.21
3  1321941.47  577600.41
4  1321941.19  577491.49`;
    setRawText(sample);
    setErrorMsg(null);
  };

  const parsed = parseVn2000RawInput(rawText, selectedMeridian);
  const isValidPolygon = parsed.wgs84Points.length >= 3;
  const nominalAreaM2 = nominalArea ? (nominalArea < 100 ? nominalArea * 10000 : nominalArea) : null;
  const areaDiffPercent =
    nominalAreaM2 && nominalAreaM2 > 0 && parsed.areaM2 > 0
      ? (((parsed.areaM2 - nominalAreaM2) / nominalAreaM2) * 100).toFixed(1)
      : null;

  const handleApply = () => {
    if (!isValidPolygon) {
      setErrorMsg('Vui lòng nhập ít nhất 3 cặp tọa độ đỉnh hợp lệ để tạo thành đa giác khép kín của thửa đất.');
      return;
    }

    onApplyCoordinates({
      wgs84Coordinates: parsed.wgs84Points,
      vn2000Points: parsed.points,
      calculatedAreaM2: parsed.areaM2,
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
      <div className="bg-white rounded-2xl shadow-2xl border border-gray-100 w-full max-w-3xl max-h-[90vh] flex flex-col overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 bg-gradient-to-r from-emerald-800 to-teal-800 text-white flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-white/10 rounded-lg">
              <svg className="w-6 h-6 text-emerald-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
              </svg>
            </div>
            <div>
              <h2 className="text-lg font-bold">Chuyển Đổi Tọa Độ Địa Chính Sổ Đỏ VN-2000 Sang WGS-84</h2>
              <p className="text-xs text-emerald-100">
                Căn cứ Quyết định 973/2001/QĐ-TCĐC &amp; Thông tư 25/2014/TT-BTNMT {plotCode ? `• Thửa: ${plotCode}` : ''}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-white/80 hover:text-white p-1 rounded-lg hover:bg-white/10 transition"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Body */}
        <div className="p-6 overflow-y-auto space-y-4 flex-1 text-sm text-gray-700">
          {/* Central Meridian Selector */}
          <div className="bg-emerald-50/70 border border-emerald-200 rounded-xl p-4 flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
            <div className="flex-1">
              <label className="block text-xs font-bold uppercase tracking-wider text-emerald-900 mb-1">
                Kinh tuyến trục tỉnh/thành (Múi 3°):
              </label>
              <select
                value={selectedMeridian}
                onChange={(e) => setSelectedMeridian(parseFloat(e.target.value))}
                className="w-full bg-white border border-emerald-300 rounded-lg px-3 py-2 text-sm font-medium text-gray-900 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              >
                {VIETNAM_PROVINCE_MERIDIANS.map((prov) => (
                  <option key={prov.name} value={prov.meridian}>
                    {prov.name} (KTT: {prov.meridian}°)
                  </option>
                ))}
              </select>
            </div>
            <div className="text-xs text-emerald-800 bg-white/80 px-3 py-2 rounded-lg border border-emerald-100 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              <span>Elipsoid: <strong>WGS-84</strong> | Tỷ lệ $k_0 = 0.9999$</span>
            </div>
          </div>

          {/* Coordinate input area */}
          <div>
            <div className="flex justify-between items-center mb-1">
              <label className="text-xs font-bold uppercase tracking-wider text-gray-700">
                Nhập bảng tọa độ đỉnh thửa đất (X, Y) từ Sổ đỏ:
              </label>
              <button
                type="button"
                onClick={loadSampleCoordinates}
                className="text-xs text-emerald-700 hover:text-emerald-900 font-medium underline flex items-center gap-1"
              >
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
                Điền mẫu thử nghiệm (Đơn Dương)
              </button>
            </div>
            <p className="text-xs text-gray-500 mb-2">
              Copy-paste trực tiếp bảng góc ranh thửa đất từ Giấy chứng nhận QSDĐ. Định dạng hỗ trợ: <code className="bg-gray-100 px-1 py-0.5 rounded text-gray-800">STT  X  Y</code> hoặc <code className="bg-gray-100 px-1 py-0.5 rounded text-gray-800">X, Y</code> (Mỗi đỉnh một dòng).
            </p>
            <textarea
              rows={5}
              value={rawText}
              onChange={(e) => {
                setRawText(e.target.value);
                setErrorMsg(null);
              }}
              placeholder={`1  1318450.25  452100.80\n2  1318520.60  452140.20\n3  1318500.10  452220.50\n4  1318430.80  452180.10`}
              className="w-full font-mono text-xs p-3 bg-gray-50 border border-gray-300 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500 transition"
            />
          </div>

          {errorMsg && (
            <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded-xl flex items-center gap-2">
              <svg className="w-4 h-4 text-red-500 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Real-time Preview Table */}
          {parsed.points.length > 0 && (
            <div className="border border-gray-200 rounded-xl overflow-hidden shadow-sm">
              <div className="bg-gray-100/80 px-4 py-2 border-b border-gray-200 flex justify-between items-center">
                <span className="text-xs font-bold text-gray-700 uppercase tracking-wide">
                  Kết quả phân giải ({parsed.points.length} đỉnh)
                </span>
                <span className="text-xs text-gray-500">
                  WGS-84 (GPS thập phân)
                </span>
              </div>
              <div className="max-h-48 overflow-y-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="bg-gray-50 text-gray-600 border-b border-gray-200">
                      <th className="py-1.5 px-3 font-semibold">Đỉnh</th>
                      <th className="py-1.5 px-3 font-semibold font-mono">X (Northing VN-2000)</th>
                      <th className="py-1.5 px-3 font-semibold font-mono">Y (Easting VN-2000)</th>
                      <th className="py-1.5 px-3 font-semibold font-mono text-emerald-800">Vĩ độ WGS-84 (Lat)</th>
                      <th className="py-1.5 px-3 font-semibold font-mono text-emerald-800">Kinh độ WGS-84 (Lng)</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {parsed.points.map((pt, idx) => {
                      const gps = parsed.wgs84Points[idx];
                      return (
                        <tr key={idx} className="hover:bg-emerald-50/40">
                          <td className="py-1.5 px-3 font-bold text-gray-700">{pt.point_number}</td>
                          <td className="py-1.5 px-3 font-mono text-gray-600">{pt.x.toLocaleString('vi-VN')} m</td>
                          <td className="py-1.5 px-3 font-mono text-gray-600">{pt.y.toLocaleString('vi-VN')} m</td>
                          <td className="py-1.5 px-3 font-mono font-medium text-emerald-700">{gps ? gps[0] : '—'}</td>
                          <td className="py-1.5 px-3 font-mono font-medium text-emerald-700">{gps ? gps[1] : '—'}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {/* Area Comparison Footer */}
              <div className="bg-emerald-50/50 p-3 border-t border-gray-200 flex flex-wrap items-center justify-between gap-3 text-xs">
                <div>
                  <span className="text-gray-500">Diện tích tính từ tọa độ: </span>
                  <span className="font-bold text-emerald-900 text-sm">
                    {parsed.areaM2.toLocaleString('vi-VN')} m²
                  </span>
                  <span className="text-gray-400 text-[11px] ml-1">
                    ({(parsed.areaM2 / 10000).toFixed(3)} ha)
                  </span>
                </div>
                {nominalArea && (
                  <div>
                    <span className="text-gray-500">Khai báo hồ sơ: </span>
                    <span className="font-medium text-gray-800">
                      {nominalArea < 100
                        ? `${nominalArea.toLocaleString('vi-VN')} ha (${nominalAreaM2?.toLocaleString('vi-VN')} m²)`
                        : `${nominalArea.toLocaleString('vi-VN')} m²`}
                    </span>
                    {areaDiffPercent && (
                      <span
                        className={`ml-2 px-2 py-0.5 rounded-full text-[11px] font-bold ${
                          Math.abs(parseFloat(areaDiffPercent)) <= 5
                            ? 'bg-green-100 text-green-800'
                            : 'bg-amber-100 text-amber-800'
                        }`}
                      >
                        Chênh lệch: {parseFloat(areaDiffPercent) > 0 ? `+${areaDiffPercent}` : areaDiffPercent}%
                      </span>
                    )}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 bg-gray-50 border-t border-gray-200 flex justify-end items-center gap-3">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 border border-gray-300 rounded-xl text-gray-700 font-medium hover:bg-gray-100 transition text-sm"
          >
            Đóng
          </button>
          <button
            type="button"
            disabled={!isValidPolygon}
            onClick={handleApply}
            className={`px-5 py-2 rounded-xl font-bold text-white text-sm flex items-center gap-2 shadow-md transition ${
              isValidPolygon
                ? 'bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 hover:shadow-lg'
                : 'bg-gray-300 cursor-not-allowed'
            }`}
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
            Áp Dụng Tọa Độ Vào Thửa Đất
          </button>
        </div>
      </div>
    </div>
  );
};
