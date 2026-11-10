import React, { useState, useEffect } from 'react';
import {
  X,
  MapPin,
  Plus,
  ShieldAlert,
  Compass,
  CheckCircle2,
  TrendingUp,
  Building,
  Layers,
} from 'lucide-react';
import { useToast } from '@/components/ui/ToastNotification';
import { ProductionUnit } from '@/services/farmPlotApi';
import { GisLocationPickerModal, GisPickerResult } from './GisLocationPickerModal';

interface AddFarmPlotModalProps {
  isOpen: boolean;
  onClose: () => void;
  units?: ProductionUnit[];
  selectedUnit?: ProductionUnit | null;
  unitName?: string;
  unitId?: string;
  onSubmit?: (plotData: {
    unit_id?: string;
    plot_code: string;
    area: number;
    status?: string;
    safe_harvest_date?: string | null;
    gps_coordinates?: string | null;
    national_cadastral_code?: string | null;
    land_sheet_number?: string | null;
    land_parcel_number?: string | null;
    greenhouse_type?: string | null;
    substrate_bag_count?: number | null;
    planting_density_per_sqm?: number | null;
    geometry_geojson?: any;
    vn2000_coordinates?: any;
    max_yield_rate_per_sqm?: number | null;
  }) => Promise<void>;
  onAddPlot?: (plotData: {
    unit_id?: string;
    plot_code: string;
    area: number;
    status?: string;
    safe_harvest_date?: string | null;
    gps_coordinates?: string | null;
    national_cadastral_code?: string | null;
    land_sheet_number?: string | null;
    land_parcel_number?: string | null;
    greenhouse_type?: string | null;
    substrate_bag_count?: number | null;
    planting_density_per_sqm?: number | null;
    geometry_geojson?: any;
    vn2000_coordinates?: any;
    max_yield_rate_per_sqm?: number | null;
  }) => Promise<void>;
  isSubmitting?: boolean;
  isSaving?: boolean;
}

export const AddFarmPlotModal: React.FC<AddFarmPlotModalProps> = ({
  isOpen,
  onClose,
  units = [],
  selectedUnit,
  unitName,
  unitId,
  onSubmit,
  onAddPlot,
  isSubmitting,
  isSaving,
}) => {
  const { showToast } = useToast();
  const [targetUnitId, setTargetUnitId] = useState<string>(
    selectedUnit?.id || (units.length > 0 ? units[0].id : '')
  );
  const [plotCode, setPlotCode] = useState('');
  const [plotArea, setPlotArea] = useState('');
  const [plotStatus, setPlotStatus] = useState('ACTIVE');
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

  const currentUnit = selectedUnit || units.find((u) => u.id === targetUnitId);
  const effectiveUnitName = currentUnit?.name || unitName || 'Tất cả vùng trồng';
  const effectiveSubmit = onSubmit || onAddPlot;
  const loading = isSubmitting ?? isSaving ?? false;

  // Lấy ranh giới vùng trồng cha làm lớp nền khi vẽ thửa con
  const parentBoundary: [number, number][] =
    currentUnit?.location?.polygon_coordinates || currentUnit?.location?.polygon || [];

  // Tính toán sản lượng trần tối đa theo diện tích
  const areaNum = Number(plotArea) || 0;
  const areaM2 = areaNum < 100 ? areaNum * 10000 : areaNum;
  const maxQuotaKg = Math.round(areaM2 * (parseFloat(yieldRate) || 5.0) * 1.2);

  useEffect(() => {
    if (selectedUnit?.id) {
      setTargetUnitId(selectedUnit.id);
    } else if (units.length > 0 && !targetUnitId) {
      setTargetUnitId(units[0].id);
    }
  }, [selectedUnit, units]);

  if (!isOpen) return null;

  const handleGisConfirm = (result: GisPickerResult) => {
    if (result.lat && result.lng) {
      setGpsCoordinates(`${result.lat.toFixed(6)}, ${result.lng.toFixed(6)}`);
    }
    if (result.polygon && result.polygon.length >= 3) {
      setPlotPolygon(result.polygon);
    }
    if (result.areaHa && result.areaHa > 0) {
      setPlotArea(String(parseFloat(result.areaHa.toFixed(2))));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!plotCode.trim() || !(Number(plotArea) > 0)) {
      showToast('Vui lòng nhập đầy đủ Mã thửa đất và Diện tích (> 0)', 'error');
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
      if (effectiveSubmit) {
        await effectiveSubmit({
          unit_id: targetUnitId || selectedUnit?.id,
          plot_code: plotCode.trim(),
          area: Number(plotArea),
          status: plotStatus,
          safe_harvest_date: plotStatus === 'IN_QUARANTINE' && safeHarvestDate ? safeHarvestDate : null,
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
      }

      // Reset form
      setPlotCode('');
      setPlotArea('');
      setPlotStatus('ACTIVE');
      setSafeHarvestDate('');
      setGpsCoordinates('');
      setCadastralCode('');
      setSheetNumber('');
      setParcelNumber('');
      setSubstrateBags('');
      setDensity('');
      setPlotPolygon([]);
      onClose();
    } catch (err: any) {
      showToast(err?.message || 'Có lỗi khi khởi tạo thửa đất', 'error');
    }
  };

  const inputCls =
    'w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2.5 text-xs font-semibold text-slate-800 outline-none transition focus:border-emerald-500 focus:bg-white focus:ring-2 focus:ring-emerald-500/20';

  return (
    <>
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 p-3 sm:p-5 backdrop-blur-xs animate-fade-in text-[13px]">
        <div className="relative w-full max-w-2xl max-h-[92vh] bg-white rounded-3xl shadow-2xl border border-slate-100 flex flex-col overflow-hidden animate-scale-in">
          {/* Header */}
          <div className="px-6 py-4.5 border-b border-slate-100 bg-gradient-to-r from-emerald-50 via-teal-50/40 to-white flex items-center justify-between shrink-0">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold shadow-2xs">
                <Plus className="w-5 h-5 text-emerald-700" />
              </div>
              <div>
                <h2 className="text-base font-black text-slate-900 tracking-tight">
                  Khai Báo Thửa Đất / Phân Lô Mới
                </h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  Thuộc vùng sản xuất: <strong className="text-emerald-800">{effectiveUnitName}</strong>
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="p-1.5 rounded-full text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Form Body (Scrollable) */}
          <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-4">
            {!selectedUnit && units.length > 0 && (
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  Thuộc Vùng Sản Xuất *
                </label>
                <select
                  value={targetUnitId}
                  onChange={(e) => setTargetUnitId(e.target.value)}
                  className={inputCls}
                  required
                >
                  {units.map((u) => (
                    <option key={u.id} value={u.id}>
                      {u.unit_code} — {u.name} ({u.crop} • {u.area} ha)
                    </option>
                  ))}
                </select>
              </div>
            )}

            {/* Khối WebGIS: Bản đồ vẽ ranh giới thửa đất */}
            <div className="p-4 bg-emerald-50/60 border border-emerald-200/90 rounded-2xl space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-black text-emerald-950 flex items-center gap-1.5 uppercase tracking-wide">
                  <Compass className="w-4 h-4 text-emerald-700" />
                  Định Vị Tọa Độ &amp; Vẽ Ranh Giới Thửa Đất (WebGIS)
                </span>
                <span className="text-[10px] font-bold text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded-full border border-emerald-300">
                  Chuẩn TCVN 12850:2019
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
                        <CheckCircle2 className="w-3.5 h-3.5" /> Đã vẽ {plotPolygon.length} đỉnh góc ranh
                      </span>
                    ) : (
                      <span className="text-slate-400 italic">Chưa vẽ ranh giới</span>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Thông tin mã & diện tích */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  Mã Thửa Đất (Plot Code) *
                </label>
                <input
                  type="text"
                  required
                  value={plotCode}
                  onChange={(e) => setPlotCode(e.target.value)}
                  placeholder="Ví dụ: PLOT-TT-01"
                  className={inputCls}
                />
                <span className="text-[10.5px] text-slate-400 mt-1 block">Mã định danh duy nhất trong vùng</span>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  Diện Tích Canh Tác (ha) *
                </label>
                <input
                  type="number"
                  step="any"
                  min="0.01"
                  required
                  value={plotArea}
                  onChange={(e) => setPlotArea(e.target.value)}
                  placeholder="Ví dụ: 0.5"
                  className={inputCls}
                />
                <span className="text-[10.5px] text-slate-400 mt-1 block">
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
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  Trạng Thái Canh Tác
                </label>
                <select
                  value={plotStatus}
                  onChange={(e) => setPlotStatus(e.target.value)}
                  className={inputCls}
                >
                  <option value="ACTIVE">Đang canh tác (ACTIVE)</option>
                  <option value="PREPARING">Chuẩn bị đất / Gieo ươm (PREPARING)</option>
                  <option value="IN_QUARANTINE">Cách ly an toàn PHI (IN_QUARANTINE)</option>
                  <option value="FALLOW">Nghỉ vụ / Cải tạo đất (FALLOW)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  Mô Hình Nhà Màng Canh Tác
                </label>
                <select
                  value={greenhouseType}
                  onChange={(e) => setGreenhouseType(e.target.value)}
                  className={inputCls}
                >
                  <option value="HIGH_TECH_GREENHOUSE">Nhà màng CNC Israel (Tưới nhỏ giọt)</option>
                  <option value="NET_HOUSE">Nhà lưới ngăn côn trùng</option>
                  <option value="OPEN_FIELD">Canh tác ngoài trời (Đất hở)</option>
                </select>
              </div>
            </div>

            {plotStatus === 'IN_QUARANTINE' && (
              <div className="p-3.5 bg-rose-50 border border-rose-200 rounded-2xl space-y-2 animate-fade-in">
                <label className="block text-xs font-extrabold text-rose-900 flex items-center gap-1.5">
                  <ShieldAlert className="w-4 h-4 text-rose-600" />
                  Thời Hạn Khóa Thu Hoạch Cách Ly (Safe Harvest Date) *
                </label>
                <input
                  type="date"
                  required
                  value={safeHarvestDate}
                  onChange={(e) => setSafeHarvestDate(e.target.value)}
                  className="w-full rounded-xl border border-rose-300 bg-white px-3 py-2 text-xs font-semibold text-rose-950 outline-none focus:ring-2 focus:ring-rose-400"
                />
                <span className="text-[11px] text-rose-700 block">
                  Hệ thống sẽ tự động kích hoạt khóa an toàn PHI ngăn chặn phát lệnh thu hoạch cho đến ngày này.
                </span>
              </div>
            )}

            {/* Hồ sơ Địa Chính Đất Đai 2024 */}
            <div className="p-4 bg-slate-50 border border-slate-200/90 rounded-2xl space-y-3">
              <span className="text-xs font-black text-slate-800 flex items-center gap-1.5 uppercase tracking-wide">
                <Building className="w-3.5 h-3.5 text-slate-600" />
                Hồ Sơ Địa Chính &amp; Mật Độ Canh Tác (Luật Đất Đai 2024)
              </span>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
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
                    Số Tờ Bản Đồ Sổ Đỏ
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
                    Số Thửa Đất Sổ Đỏ
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

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">
                    Số Túi Giá Thể Xơ Dừa (Bịch)
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={substrateBags}
                    onChange={(e) => setSubstrateBags(e.target.value)}
                    placeholder="VD: 2500"
                    className={inputCls}
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">
                    Mật Độ Trồng (cây/m²)
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    min="0"
                    value={density}
                    onChange={(e) => setDensity(e.target.value)}
                    placeholder="VD: 3.2"
                    className={inputCls}
                  />
                </div>
              </div>
            </div>

            {/* Footer Actions */}
            <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2.5">
              <button
                type="button"
                onClick={onClose}
                disabled={loading}
                className="px-4 py-2 rounded-xl border border-slate-200 text-xs font-bold text-slate-600 hover:bg-slate-50 transition cursor-pointer"
              >
                Hủy bỏ
              </button>
              <button
                type="submit"
                disabled={loading}
                className="px-5 py-2 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-xs font-extrabold text-white shadow-sm transition active:scale-98 cursor-pointer disabled:opacity-50"
              >
                {loading ? 'Đang khởi tạo...' : 'Xác Nhận Thêm Thửa'}
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
        title={`Bản Đồ WebGIS: Vẽ Thửa Đất [${plotCode || 'Mới'}]`}
        initialCoordinates={
          gpsCoordinates && gpsCoordinates.includes(',')
            ? {
                lat: parseFloat(gpsCoordinates.split(',')[0].trim()),
                lng: parseFloat(gpsCoordinates.split(',')[1].trim()),
              }
            : null
        }
        initialPolygon={plotPolygon}
        parentPolygon={parentBoundary}
        mode="both"
        unitName={effectiveUnitName}
      />
    </>
  );
};
