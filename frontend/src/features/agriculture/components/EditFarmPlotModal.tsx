import React, { useState, useEffect } from 'react';
import {
  X,
  MapPin,
  Save,
  ShieldAlert,
  Compass,
  CheckCircle2,
  TrendingUp,
  Building,
} from 'lucide-react';
import type { FarmPlot } from '@/services/farmPlotApi';
import { updatePlot } from '@/services/farmPlotApi';
import { useToast } from '@/components/ui/ToastNotification';
import { GisLocationPickerModal, GisPickerResult } from './GisLocationPickerModal';
import { convertVn2000ToWgs84 } from '../utils/geoUtils';

interface EditFarmPlotModalProps {
  isOpen: boolean;
  onClose: () => void;
  plot: FarmPlot | null;
  unitId: string;
  onSuccess: () => void;
  parentPolygon?: [number, number][];
}

export const EditFarmPlotModal: React.FC<EditFarmPlotModalProps> = ({
  isOpen,
  onClose,
  plot,
  unitId,
  onSuccess,
  parentPolygon = [],
}) => {
  const { showToast } = useToast();
  const [submitting, setSubmitting] = useState(false);

  const [plotCode, setPlotCode] = useState('');
  const [area, setArea] = useState('');
  const [status, setStatus] = useState('ACTIVE');
  const [safeHarvestDate, setSafeHarvestDate] = useState('');
  const [gpsCoordinates, setGpsCoordinates] = useState('');
  const [cadastralCode, setCadastralCode] = useState('');
  const [sheetNumber, setSheetNumber] = useState('');
  const [parcelNumber, setParcelNumber] = useState('');
  const [greenhouseType, setGreenhouseType] = useState('HIGH_TECH_GREENHOUSE');
  const [substrateBags, setSubstrateBags] = useState('');
  const [density, setDensity] = useState('');
  const [yieldRate, setYieldRate] = useState('5.0');

  // Trạng thái WebGIS Polygon
  const [plotPolygon, setPlotPolygon] = useState<[number, number][]>([]);
  const [isGisModalOpen, setIsGisModalOpen] = useState(false);

  useEffect(() => {
    if (plot) {
      setPlotCode(plot.plot_code || '');
      setArea(String(plot.area || ''));
      setStatus(plot.status || 'ACTIVE');
      setSafeHarvestDate(plot.safe_harvest_date || plot.quarantine_until || '');
      setGpsCoordinates(plot.gps_coordinates || '');
      setCadastralCode(plot.national_cadastral_code || '');
      setSheetNumber(plot.land_sheet_number || '');
      setParcelNumber(plot.land_parcel_number || '');
      setGreenhouseType(plot.greenhouse_type || 'HIGH_TECH_GREENHOUSE');
      setSubstrateBags(plot.substrate_bag_count ? String(plot.substrate_bag_count) : '');
      setDensity(plot.planting_density_per_sqm ? String(plot.planting_density_per_sqm) : '');
      setYieldRate(plot.max_yield_rate_per_sqm ? String(plot.max_yield_rate_per_sqm) : '5.0');

      // Tải polygon hiện có
      if (plot.geometry_geojson?.coordinates?.[0]?.length >= 3) {
        const poly: [number, number][] = plot.geometry_geojson.coordinates[0].map(
          (pt: [number, number]) => [pt[1], pt[0]]
        );
        setPlotPolygon(poly);
      } else if (plot.vn2000_coordinates && plot.vn2000_coordinates.length >= 3) {
        const poly: [number, number][] = plot.vn2000_coordinates.map((pt: any) => {
          if (Array.isArray(pt)) return convertVn2000ToWgs84(pt[0], pt[1]);
          return convertVn2000ToWgs84(pt.x, pt.y);
        });
        setPlotPolygon(poly);
      } else {
        setPlotPolygon([]);
      }
    }
  }, [plot]);

  if (!isOpen || !plot) return null;

  // Tính toán hạn mức sản lượng trần tối đa theo diện tích
  const areaNum = Number(area) || 0;
  const areaM2 = areaNum < 100 ? areaNum * 10000 : areaNum;
  const maxQuotaKg = Math.round(areaM2 * (parseFloat(yieldRate) || 5.0) * 1.2);

  const handleGisConfirm = (result: GisPickerResult) => {
    if (result.lat && result.lng) {
      setGpsCoordinates(`${result.lat.toFixed(6)}, ${result.lng.toFixed(6)}`);
    }
    if (result.polygon && result.polygon.length >= 3) {
      setPlotPolygon(result.polygon);
    }
    if (result.areaHa && result.areaHa > 0) {
      setArea(String(result.areaHa));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!plotCode.trim() || !(Number(area) > 0)) {
      showToast('Vui lòng nhập Mã thửa đất và Diện tích (> 0)', 'error');
      return;
    }

    // Định dạng GeoJSON Polygon
    let geometryGeoJson: any = undefined;
    if (plotPolygon.length >= 3) {
      const ring = plotPolygon.map((pt) => [pt[1], pt[0]]);
      if (ring[0][0] !== ring[ring.length - 1][0] || ring[0][1] !== ring[ring.length - 1][1]) {
        ring.push(ring[0]);
      }
      geometryGeoJson = {
        type: 'Polygon',
        coordinates: [ring],
      };
    }

    try {
      setSubmitting(true);
      await updatePlot(unitId, plot.id, {
        plot_code: plotCode.trim(),
        area: Number(area),
        status,
        safe_harvest_date: status === 'IN_QUARANTINE' ? safeHarvestDate : null,
        gps_coordinates: gpsCoordinates.trim() || null,
        national_cadastral_code: cadastralCode.trim() || null,
        land_sheet_number: sheetNumber.trim() || null,
        land_parcel_number: parcelNumber.trim() || null,
        greenhouse_type: greenhouseType,
        substrate_bag_count: substrateBags ? parseInt(substrateBags, 10) : null,
        planting_density_per_sqm: density ? parseFloat(density) : null,
        geometry_geojson: geometryGeoJson,
        max_yield_rate_per_sqm: parseFloat(yieldRate) || 5.0,
      });

      showToast(`Cập nhật thửa đất [${plotCode}] thành công!`, 'success');
      onSuccess();
      onClose();
    } catch (err: any) {
      showToast(err.message || 'Cập nhật thửa đất thất bại', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const inputCls =
    'w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-semibold text-slate-800 outline-none transition focus:border-emerald-500 focus:bg-white focus:ring-2 focus:ring-emerald-500/20';

  return (
    <>
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 p-3 sm:p-5 backdrop-blur-xs animate-fade-in text-[13px]">
        <div className="relative w-full max-w-2xl max-h-[92vh] bg-white rounded-3xl shadow-2xl border border-slate-100 flex flex-col overflow-hidden animate-scale-in">
          {/* Header */}
          <div className="px-6 py-4.5 border-b border-slate-100 bg-gradient-to-r from-emerald-50 via-teal-50/40 to-white flex items-center justify-between shrink-0">
            <div>
              <h2 className="text-base font-black text-slate-900 tracking-tight flex items-center gap-2">
                <MapPin className="w-5 h-5 text-emerald-600" />
                Chỉnh Sửa Thửa Đất ({plot.plot_code})
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Thuộc vùng sản xuất: <strong className="text-emerald-800">{plot.unit_name || unitId}</strong>
              </p>
            </div>
            <button
              onClick={onClose}
              className="p-1.5 rounded-full text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Form Body */}
          <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-4">
            {/* Khối WebGIS */}
            <div className="p-4 bg-emerald-50/60 border border-emerald-200/90 rounded-2xl space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-black text-emerald-950 flex items-center gap-1.5 uppercase tracking-wide">
                  <Compass className="w-4 h-4 text-emerald-700" />
                  Định Vị &amp; Ranh Giới WebGIS (TCVN 12850:2019)
                </span>
                <span className="text-[10px] font-bold text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded-full border border-emerald-300">
                  WGS-84
                </span>
              </div>

              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3 rounded-xl bg-white border border-emerald-200 shadow-2xs">
                <div>
                  <p className="text-xs font-bold text-slate-800">
                    Bản đồ vệ tinh phân lô thửa đất
                  </p>
                  <p className="text-[11px] text-slate-500 mt-0.5">
                    Click các đỉnh bờ ruộng/nhà màng để tính tự động diện tích thực tế.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setIsGisModalOpen(true)}
                  className="px-4 py-2 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs shadow-xs transition flex items-center justify-center gap-1.5 cursor-pointer shrink-0"
                >
                  <MapPin className="w-3.5 h-3.5" />
                  <span>Mở Bản Đồ &amp; Vẽ Ranh Giới</span>
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">
                    Tọa Độ GPS Trung Tâm (WGS-84)
                  </label>
                  <input
                    type="text"
                    value={gpsCoordinates}
                    onChange={(e) => setGpsCoordinates(e.target.value)}
                    placeholder="VD: 11.954020, 108.462150"
                    className={`${inputCls} font-mono`}
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">
                    Trạng Thái Đa Giác Ranh Giới
                  </label>
                  <div className="h-[38px] flex items-center px-3 rounded-xl bg-white border border-slate-200 text-xs font-semibold text-slate-700">
                    {plotPolygon.length >= 3 ? (
                      <span className="text-emerald-700 font-bold flex items-center gap-1">
                        <CheckCircle2 className="w-3.5 h-3.5" /> Đã xác lập {plotPolygon.length} đỉnh góc ranh
                      </span>
                    ) : (
                      <span className="text-slate-400 italic">Chưa vẽ ranh giới</span>
                    )}
                  </div>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Mã thửa đất <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  value={plotCode}
                  onChange={(e) => setPlotCode(e.target.value)}
                  placeholder="VD: PLOT-TT-XV001-01"
                  className={inputCls}
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Diện tích canh tác (ha) <span className="text-rose-500">*</span>
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={area}
                  onChange={(e) => setArea(e.target.value)}
                  placeholder="4.5"
                  className={inputCls}
                  required
                />
                <span className="text-[10px] text-slate-400 mt-0.5 block">
                  (Tự động điền khi vẽ ranh giới trên bản đồ)
                </span>
              </div>
            </div>

            {/* Hạn mức sản lượng trần vụ mùa (Chống gian lận OCOP) */}
            {areaNum > 0 && (
              <div className="p-3.5 bg-gradient-to-r from-emerald-50 to-teal-50 border border-emerald-200 rounded-2xl flex items-start gap-3 animate-fade-in">
                <TrendingUp className="w-5 h-5 text-emerald-700 shrink-0 mt-0.5" />
                <div className="text-xs space-y-1">
                  <div className="font-extrabold text-emerald-950 flex items-center gap-2">
                    <span>Hạn Mức Sản Lượng Thu Hoạch Trần Sinh Thái:</span>
                    <strong className="text-emerald-700 text-sm font-mono font-black">
                      {maxQuotaKg.toLocaleString('vi-VN')} kg / vụ
                    </strong>
                  </div>
                  <p className="text-[11px] text-slate-600 leading-relaxed">
                    Quy đổi: <strong>{areaM2.toLocaleString('vi-VN')} m²</strong> &times; Năng suất chuẩn{' '}
                    <strong>{yieldRate} kg/m²</strong> &times; Dung sai mùa vụ <strong>+20%</strong>. Dữ liệu này dùng để khóa tự động sản lượng vượt trần trong hồ sơ kiểm định OCOP.
                  </p>
                </div>
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Trạng thái thửa đất
                </label>
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value)}
                  className={inputCls}
                >
                  <option value="ACTIVE">Đang canh tác (ACTIVE)</option>
                  <option value="IN_QUARANTINE">Cách ly an toàn PHI (IN_QUARANTINE)</option>
                  <option value="PREPARING">Chuẩn bị đất / Giá thể (PREPARING)</option>
                  <option value="FALLOW">Đang nghỉ vụ (FALLOW)</option>
                  <option value="INACTIVE">Ngưng canh tác (INACTIVE)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Mô Hình Nhà Kính Canh Tác
                </label>
                <select
                  value={greenhouseType}
                  onChange={(e) => setGreenhouseType(e.target.value)}
                  className={inputCls}
                >
                  <option value="HIGH_TECH_GREENHOUSE">Nhà màng CNC Israel</option>
                  <option value="NET_HOUSE">Nhà lưới ngăn côn trùng</option>
                  <option value="OPEN_FIELD">Canh tác đất hở ngoài trời</option>
                </select>
              </div>
            </div>

            {status === 'IN_QUARANTINE' && (
              <div className="p-3 bg-amber-50 rounded-2xl border border-amber-300 space-y-2">
                <label className="block text-xs font-bold text-amber-950 flex items-center gap-1.5">
                  <ShieldAlert className="w-4 h-4 text-amber-600" />
                  Ngày kết thúc cách ly an toàn (PHI)
                </label>
                <input
                  type="date"
                  value={safeHarvestDate}
                  onChange={(e) => setSafeHarvestDate(e.target.value)}
                  className={inputCls}
                  required
                />
              </div>
            )}

            {/* Luật Đất Đai 2024 & Nhà Màng CNC */}
            <div className="p-3.5 bg-slate-50 border border-slate-200/90 rounded-2xl space-y-3">
              <span className="text-xs font-black text-slate-800 flex items-center gap-1.5 uppercase tracking-wide">
                <Building className="w-3.5 h-3.5 text-slate-600" />
                Định Danh Đất Đai 2024 &amp; Canh Tác CNC
              </span>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">
                    Mã CSDL Đất Đai 2024
                  </label>
                  <input
                    type="text"
                    value={cadastralCode}
                    onChange={(e) => setCadastralCode(e.target.value)}
                    placeholder="49-302-05-128"
                    className={inputCls}
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">
                    Số Tờ Bản Đồ
                  </label>
                  <input
                    type="text"
                    value={sheetNumber}
                    onChange={(e) => setSheetNumber(e.target.value)}
                    placeholder="Tờ 05"
                    className={inputCls}
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">
                    Số Thửa Sổ Đỏ
                  </label>
                  <input
                    type="text"
                    value={parcelNumber}
                    onChange={(e) => setParcelNumber(e.target.value)}
                    placeholder="Thửa 128"
                    className={inputCls}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">
                    Số Túi Giá Thể Xơ Dừa
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={substrateBags}
                    onChange={(e) => setSubstrateBags(e.target.value)}
                    placeholder="2500"
                    className={inputCls}
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">
                    Mật Độ (cây/m²)
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    min="0"
                    value={density}
                    onChange={(e) => setDensity(e.target.value)}
                    placeholder="3.2"
                    className={inputCls}
                  />
                </div>
              </div>
            </div>

            <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 font-bold text-xs transition cursor-pointer"
              >
                Hủy
              </button>
              <button
                type="submit"
                disabled={submitting}
                className="px-5 py-2.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs shadow-md transition disabled:opacity-60 flex items-center gap-1.5 cursor-pointer active:scale-98"
              >
                <Save className="w-4 h-4" />
                <span>{submitting ? 'Đang lưu...' : 'Lưu Thay Đổi'}</span>
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* WebGIS Studio Modal */}
      <GisLocationPickerModal
        isOpen={isGisModalOpen}
        onClose={() => setIsGisModalOpen(false)}
        onConfirm={handleGisConfirm}
        title={`Bản Đồ WebGIS: Vẽ Thửa Đất [${plotCode}]`}
        initialCoordinates={
          gpsCoordinates && gpsCoordinates.includes(',')
            ? {
                lat: parseFloat(gpsCoordinates.split(',')[0].trim()),
                lng: parseFloat(gpsCoordinates.split(',')[1].trim()),
              }
            : null
        }
        initialPolygon={plotPolygon}
        parentPolygon={parentPolygon}
        mode="both"
        unitName={plot.unit_name || unitId}
      />
    </>
  );
};
