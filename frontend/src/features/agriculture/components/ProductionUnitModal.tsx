import React, { useState, useEffect } from 'react';
import {
  X,
  Sprout,
  CircleCheck,
  MapPin,
  Compass,
  Layers,
  Phone,
  User,
  Droplet,
  ShieldCheck,
  Building,
  CheckCircle2,
} from 'lucide-react';
import { ProductionUnit, ProductionUnitPayload } from '@/services/farmPlotApi';
import { GisLocationPickerModal, GisPickerResult } from './GisLocationPickerModal';

interface ProductionUnitModalProps {
  isOpen: boolean;
  onClose: () => void;
  unitToEdit: ProductionUnit | null;
  onSubmit: (payload: ProductionUnitPayload, id?: string) => Promise<void>;
  isSubmitting?: boolean;
}

const statusText: Record<string, string> = {
  ACTIVE: 'Đang canh tác',
  PREPARING: 'Chuẩn bị đất',
  FALLOW: 'Đang nghỉ vụ',
  INACTIVE: 'Ngưng canh tác',
  UNDER_PUC_REVIEW: 'Chờ đánh giá PUC ⚠️',
  IN_QUARANTINE: 'Cách ly PHI 🛑',
};

export const ProductionUnitModal: React.FC<ProductionUnitModalProps> = ({
  isOpen,
  onClose,
  unitToEdit,
  onSubmit,
  isSubmitting = false,
}) => {
  // Tab 1: Thông tin cơ bản & Cây trồng
  const [name, setName] = useState('');
  const [unitCode, setUnitCode] = useState('VT-');
  const [crop, setCrop] = useState('');
  const [area, setArea] = useState<number | ''>('');
  const [status, setStatus] = useState('ACTIVE');
  const [pucCode, setPucCode] = useState('PUC-49-');
  const [pucStatus, setPucStatus] = useState<'ACTIVE' | 'INACTIVE' | 'UNDER_PUC_REVIEW'>('ACTIVE');
  const [standard, setStandard] = useState('VietGAP');

  // Tab 2: Vị trí địa lý & WebGIS
  const [latitude, setLatitude] = useState<string>('');
  const [longitude, setLongitude] = useState<string>('');
  const [polygonCoords, setPolygonCoords] = useState<[number, number][]>([]);
  const [province, setProvince] = useState('Lâm Đồng');
  const [district, setDistrict] = useState('TP. Đà Lạt');
  const [commune, setCommune] = useState('Phường 12');
  const [addressDetail, setAddressDetail] = useState('');
  const [isGisModalOpen, setIsGisModalOpen] = useState(false);

  // Tab 3: Cán bộ kỹ thuật & Nguồn nước
  const [technicianName, setTechnicianName] = useState('');
  const [technicianPhone, setTechnicianPhone] = useState('');
  const [waterSource, setWaterSource] = useState('Nước giếng khoan tầng sâu (Đạt QCVN 01-1:2018)');
  const [greenhouseType, setGreenhouseType] = useState('HIGH_TECH_GREENHOUSE');

  useEffect(() => {
    if (unitToEdit) {
      setName(unitToEdit.name || '');
      setUnitCode(unitToEdit.unit_code || 'VT-');
      setCrop(unitToEdit.crop || '');
      setArea(Number(unitToEdit.area) || '');
      setStatus(unitToEdit.status || 'ACTIVE');
      setPucCode(unitToEdit.puc_code || unitToEdit.registration_information?.puc_code || '');
      setPucStatus(unitToEdit.puc_status || 'ACTIVE');
      setStandard(unitToEdit.registration_information?.standard || 'VietGAP');

      // Vị trí
      const loc = unitToEdit.location || {};
      const lat = loc.latitude ?? loc.lat;
      const lng = loc.longitude ?? loc.lng;
      setLatitude(lat ? String(lat) : '');
      setLongitude(lng ? String(lng) : '');
      setPolygonCoords(loc.polygon_coordinates || loc.polygon || []);
      setProvince(loc.province || 'Lâm Đồng');
      setDistrict(loc.district || 'TP. Đà Lạt');
      setCommune(loc.commune || 'Phường 12');
      setAddressDetail(loc.address || '');

      // Kỹ thuật & Nước
      const reg = unitToEdit.registration_information || {};
      setTechnicianName(reg.technician_name || '');
      setTechnicianPhone(reg.technician_phone || '');
      setWaterSource(reg.water_source || 'Nước giếng khoan tầng sâu (Đạt QCVN 01-1:2018)');
      setGreenhouseType(reg.greenhouse_type || 'HIGH_TECH_GREENHOUSE');
    } else {
      setName('');
      setUnitCode('VT-DALAT-0');
      setCrop('Ớt chuông Sweet Palermo');
      setArea('');
      setStatus('ACTIVE');
      setPucCode('PUC-49-');
      setPucStatus('ACTIVE');
      setStandard('VietGAP');

      setLatitude('11.9540');
      setLongitude('108.4620');
      setPolygonCoords([]);
      setProvince('Lâm Đồng');
      setDistrict('TP. Đà Lạt');
      setCommune('Phường 12');
      setAddressDetail('Thôn Hòn Bồ');

      setTechnicianName('Nguyễn Văn Tuấn');
      setTechnicianPhone('0912345678');
      setWaterSource('Nước giếng khoan tầng sâu (Đạt QCVN 01-1:2018)');
      setGreenhouseType('HIGH_TECH_GREENHOUSE');
    }
  }, [unitToEdit, isOpen]);

  if (!isOpen) return null;

  // Xử lý khi xác nhận chọn từ WebGIS Studio
  const handleGisConfirm = (result: GisPickerResult) => {
    if (result.lat && result.lng) {
      setLatitude(result.lat.toFixed(6));
      setLongitude(result.lng.toFixed(6));
    }
    if (result.polygon && result.polygon.length >= 3) {
      setPolygonCoords(result.polygon);
    }
    if (result.areaHa && result.areaHa > 0) {
      setArea(parseFloat(result.areaHa.toFixed(2)));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !unitCode.trim() || !crop.trim() || !Number(area)) {
      alert('Vui lòng nhập đủ các trường bắt buộc: Tên vùng, Mã vùng, Cây trồng và Diện tích (> 0)');
      return;
    }

    const centerLat = latitude ? parseFloat(latitude) : undefined;
    const centerLng = longitude ? parseFloat(longitude) : undefined;

    const payload: ProductionUnitPayload = {
      name: name.trim(),
      unit_code: unitCode.trim(),
      crop: crop.trim(),
      area: Number(area),
      status,
      puc_code: pucCode.trim() || undefined,
      puc_status: pucStatus,
      location: {
        latitude: centerLat,
        longitude: centerLng,
        lat: centerLat,
        lng: centerLng,
        address: addressDetail.trim() || undefined,
        commune: commune.trim() || undefined,
        district: district.trim() || undefined,
        province: province.trim() || undefined,
        polygon_coordinates: polygonCoords.length >= 3 ? polygonCoords : undefined,
      },
      registration_information: {
        puc_code: pucCode.trim() || undefined,
        standard,
        technician_name: technicianName.trim() || undefined,
        technician_phone: technicianPhone.trim() || undefined,
        water_source: waterSource,
        greenhouse_type: greenhouseType,
      },
    };

    await onSubmit(payload, unitToEdit?.id);
  };

  const inputCls =
    'w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2.5 text-xs font-semibold text-slate-800 outline-none transition focus:border-emerald-500 focus:bg-white focus:ring-2 focus:ring-emerald-500/20 disabled:bg-slate-100 disabled:text-slate-400';

  return (
    <>
      <div
        className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 p-3 sm:p-5 backdrop-blur-xs animate-fade-in text-[13px]"
        onMouseDown={(e) => {
          if (e.target === e.currentTarget) onClose();
        }}
      >
        <div className="w-full max-w-2xl max-h-[92vh] flex flex-col overflow-hidden rounded-3xl border border-white/60 bg-white shadow-2xl animate-scale-in">
          {/* Header */}
          <div className="flex items-start justify-between border-b border-slate-100 bg-gradient-to-r from-emerald-50 via-teal-50/40 to-white px-6 py-4.5 shrink-0">
            <div>
              <p className="text-[10px] font-black uppercase tracking-widest text-emerald-700">
                Hồ Sơ Vùng Trồng &amp; Mã PUC Cục BVTV
              </p>
              <h3 className="mt-0.5 text-lg sm:text-xl font-black text-slate-900 tracking-tight">
                {unitToEdit ? 'Chỉnh Sửa Vùng Trồng' : 'Khai Báo Vùng Trồng Chuyên Canh Mới'}
              </h3>
              <p className="mt-0.5 text-xs text-slate-500">
                Tích hợp WebGIS bản đồ vệ tinh, tọa độ tâm WGS-84 và ranh giới theo chuẩn TCCS 774:2020/BVTV.
              </p>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="flex h-9 w-9 items-center justify-center rounded-xl bg-white text-slate-400 shadow-sm transition hover:text-slate-700 cursor-pointer"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Form Scrollable Body */}
          <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-5">
            {/* Nhóm 1: Thông tin cơ bản & Quy chuẩn Cục BVTV */}
            <div className="p-4 rounded-2xl bg-white border border-slate-200/90 shadow-2xs space-y-3.5">
              <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
                <Sprout className="w-4 h-4 text-emerald-700" />
                <h4 className="text-xs font-black text-slate-900 uppercase tracking-wide">
                  1. Thông Tin Cơ Bản &amp; Mã Số Vùng Trồng PUC
                </h4>
              </div>

              <div>
                <label className="mb-1 block font-bold text-slate-700">Tên vùng trồng chuyên canh *</label>
                <input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className={inputCls}
                  placeholder="VD: Vùng Trồng Ớt Chuông Sweet Palermo Hòn Bồ"
                  required
                />
              </div>

              <div className="grid grid-cols-1 gap-3.5 sm:grid-cols-2">
                <div>
                  <label className="mb-1 block font-bold text-slate-700">Mã vùng nội bộ *</label>
                  <input
                    value={unitCode}
                    disabled={!!unitToEdit}
                    onChange={(e) => setUnitCode(e.target.value)}
                    className={inputCls}
                    placeholder="VT-DALAT-01"
                    required
                  />
                  {unitToEdit && <p className="mt-1 text-[10px] text-slate-400">Mã vùng cố định không thể sửa.</p>}
                </div>

                <div>
                  <label className="mb-1 block font-bold text-slate-700">Diện tích quy hoạch (ha) *</label>
                  <input
                    type="number"
                    step="any"
                    min="0.01"
                    value={area}
                    onChange={(e) => setArea(e.target.value === '' ? '' : Number(e.target.value))}
                    className={inputCls}
                    placeholder="15.0"
                    required
                  />
                  <span className="text-[10px] text-slate-400 mt-0.5 block">
                    (Tự động cập nhật khi vẽ ranh giới trên bản đồ)
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-1 gap-3.5 sm:grid-cols-2">
                <div>
                  <label className="mb-1 block font-bold text-slate-700">Cây trồng chủ lực *</label>
                  <input
                    value={crop}
                    onChange={(e) => setCrop(e.target.value)}
                    className={inputCls}
                    placeholder="Ớt chuông Sweet Palermo"
                    required
                  />
                </div>

                <div>
                  <label className="mb-1 block font-bold text-slate-700">Tiêu chuẩn canh tác</label>
                  <select
                    value={standard}
                    onChange={(e) => setStandard(e.target.value)}
                    className={inputCls}
                  >
                    <option value="VietGAP">VietGAP (TCVN 11892-1:2017)</option>
                    <option value="GlobalGAP">GlobalGAP tiêu chuẩn xuất khẩu</option>
                    <option value="Organic">Hữu cơ Organic (TCVN 11041)</option>
                    <option value="TCCS">Tiêu chuẩn an toàn cơ sở (TCCS)</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 gap-3.5 sm:grid-cols-2">
                <div>
                  <label className="mb-1 block font-bold text-slate-700">Mã số vùng trồng PUC (Cục BVTV)</label>
                  <input
                    value={pucCode}
                    onChange={(e) => setPucCode(e.target.value)}
                    className={`${inputCls} font-mono`}
                    placeholder="PUC-49-015-9923"
                  />
                </div>

                <div>
                  <label className="mb-1 block font-bold text-slate-700">Trạng thái thẩm định PUC</label>
                  <select
                    value={pucStatus}
                    onChange={(e) => setPucStatus(e.target.value as any)}
                    className={inputCls}
                  >
                    <option value="ACTIVE">Hoạt động bình thường (ACTIVE)</option>
                    <option value="UNDER_PUC_REVIEW">Đang chờ đánh giá lại PUC (BR-FARM-005)</option>
                    <option value="INACTIVE">Tạm ngưng (INACTIVE)</option>
                  </select>
                </div>
              </div>

              {unitToEdit && (
                <div>
                  <label className="mb-1 block font-bold text-slate-700">Trạng thái vùng canh tác</label>
                  <select
                    value={status}
                    onChange={(e) => setStatus(e.target.value)}
                    className={inputCls}
                  >
                    {Object.entries(statusText).map(([k, v]) => (
                      <option key={k} value={k}>
                        {v}
                      </option>
                    ))}
                  </select>
                </div>
              )}
            </div>

            {/* Nhóm 2: Vị trí địa lý & Ranh giới WebGIS (Trọng tâm) */}
            <div className="p-4 rounded-2xl bg-emerald-50/50 border border-emerald-200/80 shadow-2xs space-y-3.5">
              <div className="flex items-center justify-between pb-2 border-b border-emerald-200/60">
                <div className="flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-emerald-700" />
                  <h4 className="text-xs font-black text-emerald-950 uppercase tracking-wide">
                    2. Vị Trí Địa Lý &amp; Bản Đồ WebGIS (TCCS 774:2020/BVTV)
                  </h4>
                </div>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-300">
                  Tọa độ WGS-84
                </span>
              </div>

              {/* Nút bấm mở WebGIS Studio */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3.5 rounded-xl bg-white border border-emerald-200 shadow-xs">
                <div>
                  <div className="flex items-center gap-2">
                    <Compass className="w-4 h-4 text-emerald-700 animate-spin-slow" />
                    <strong className="text-xs font-black text-slate-900">Bản Đồ Vệ Tinh Trắc Địa</strong>
                  </div>
                  <p className="text-[11px] text-slate-500 mt-0.5">
                    Click trên ảnh vệ tinh để chọn tâm hoặc vẽ các góc ranh giới vùng trồng.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setIsGisModalOpen(true)}
                  className="px-4 py-2 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs shadow-xs transition flex items-center justify-center gap-2 cursor-pointer shrink-0 active:scale-98"
                >
                  <MapPin className="w-3.5 h-3.5" />
                  <span>Mở Bản Đồ Vệ Tinh &amp; Vẽ Ranh Giới</span>
                </button>
              </div>

              {/* Tóm tắt thông số đo đạc từ WebGIS */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div>
                  <label className="mb-1 block font-bold text-slate-700">Vĩ độ tâm (Latitude WGS-84)</label>
                  <input
                    type="number"
                    step="0.000001"
                    value={latitude}
                    onChange={(e) => setLatitude(e.target.value)}
                    className={`${inputCls} font-mono`}
                    placeholder="11.954000"
                  />
                </div>
                <div>
                  <label className="mb-1 block font-bold text-slate-700">Kinh độ tâm (Longitude WGS-84)</label>
                  <input
                    type="number"
                    step="0.000001"
                    value={longitude}
                    onChange={(e) => setLongitude(e.target.value)}
                    className={`${inputCls} font-mono`}
                    placeholder="108.462000"
                  />
                </div>
              </div>

              {/* Badge trạng thái đa giác ranh giới */}
              <div className="p-2.5 rounded-xl bg-emerald-100/70 border border-emerald-300 flex items-center justify-between text-xs">
                <div className="flex items-center gap-2 text-emerald-950 font-semibold">
                  <CheckCircle2 className="w-4 h-4 text-emerald-700 shrink-0" />
                  <span>
                    Ranh giới đa giác:{' '}
                    <strong>
                      {polygonCoords.length >= 3
                        ? `Đã xác lập ${polygonCoords.length} đỉnh góc ranh khép kín`
                        : 'Chưa vẽ ranh giới (Khuyến nghị mở bản đồ để vẽ)'}
                    </strong>
                  </span>
                </div>
                {polygonCoords.length >= 3 && (
                  <button
                    type="button"
                    onClick={() => setIsGisModalOpen(true)}
                    className="text-[11px] font-bold text-emerald-800 hover:underline cursor-pointer"
                  >
                    Xem lại ranh giới
                  </button>
                )}
              </div>

              {/* Địa chỉ hành chính 4 cấp */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="mb-1 block font-bold text-slate-700 text-[11px]">Tỉnh / Thành phố *</label>
                  <input
                    value={province}
                    onChange={(e) => setProvince(e.target.value)}
                    className={inputCls}
                    placeholder="Lâm Đồng"
                    required
                  />
                </div>
                <div>
                  <label className="mb-1 block font-bold text-slate-700 text-[11px]">Quận / Huyện *</label>
                  <input
                    value={district}
                    onChange={(e) => setDistrict(e.target.value)}
                    className={inputCls}
                    placeholder="TP. Đà Lạt"
                    required
                  />
                </div>
                <div>
                  <label className="mb-1 block font-bold text-slate-700 text-[11px]">Xã / Phường *</label>
                  <input
                    value={commune}
                    onChange={(e) => setCommune(e.target.value)}
                    className={inputCls}
                    placeholder="Phường 12"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="mb-1 block font-bold text-slate-700 text-[11px]">Thôn / Xóm / Địa chỉ chi tiết</label>
                <input
                  value={addressDetail}
                  onChange={(e) => setAddressDetail(e.target.value)}
                  className={inputCls}
                  placeholder="Thôn Hòn Bồ, Tiểu khu 144B"
                />
              </div>
            </div>

            {/* Nhóm 3: Thông tin kỹ thuật & Giám sát kiểm dịch thực vật */}
            <div className="p-4 rounded-2xl bg-white border border-slate-200/90 shadow-2xs space-y-3.5">
              <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
                <ShieldCheck className="w-4 h-4 text-emerald-700" />
                <h4 className="text-xs font-black text-slate-900 uppercase tracking-wide">
                  3. Kỹ Thuật Viên Giám Sát &amp; Nguồn Nước Tưới (VietGAP / OCOP)
                </h4>
              </div>

              <div className="grid grid-cols-1 gap-3.5 sm:grid-cols-2">
                <div>
                  <label className="mb-1 block font-bold text-slate-700">Kỹ thuật viên phụ trách</label>
                  <div className="relative">
                    <User className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                    <input
                      value={technicianName}
                      onChange={(e) => setTechnicianName(e.target.value)}
                      className={`${inputCls} pl-10`}
                      placeholder="Nguyễn Văn Tuấn"
                    />
                  </div>
                </div>

                <div>
                  <label className="mb-1 block font-bold text-slate-700">Số điện thoại liên hệ</label>
                  <div className="relative">
                    <Phone className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                    <input
                      value={technicianPhone}
                      onChange={(e) => setTechnicianPhone(e.target.value)}
                      className={`${inputCls} pl-10`}
                      placeholder="0912 345 678"
                    />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 gap-3.5 sm:grid-cols-2">
                <div>
                  <label className="mb-1 block font-bold text-slate-700">Nguồn nước tưới chính</label>
                  <div className="relative">
                    <Droplet className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                    <select
                      value={waterSource}
                      onChange={(e) => setWaterSource(e.target.value)}
                      className={`${inputCls} pl-10`}
                    >
                      <option value="Nước giếng khoan tầng sâu (Đạt QCVN 01-1:2018)">
                        Nước giếng khoan tầng sâu (Đạt QCVN)
                      </option>
                      <option value="Nước mặt tự nhiên (Hồ Đan Kia / Suối)">
                        Nước mặt tự nhiên (Hồ Đan Kia / Suối)
                      </option>
                      <option value="Hệ thống cấp nước thủy lợi tập trung">
                        Hệ thống cấp nước thủy lợi tập trung
                      </option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="mb-1 block font-bold text-slate-700">Mô hình nhà kính canh tác</label>
                  <div className="relative">
                    <Building className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                    <select
                      value={greenhouseType}
                      onChange={(e) => setGreenhouseType(e.target.value)}
                      className={`${inputCls} pl-10`}
                    >
                      <option value="HIGH_TECH_GREENHOUSE">Nhà màng CNC Israel (Tưới nhỏ giọt)</option>
                      <option value="NET_HOUSE">Nhà lưới ngăn côn trùng</option>
                      <option value="OPEN_FIELD">Canh tác ngoài trời (Đất hở)</option>
                    </select>
                  </div>
                </div>
              </div>

              <div className="flex items-start gap-2 rounded-xl bg-emerald-50 px-3.5 py-2.5 text-xs text-emerald-800">
                <CircleCheck className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600" />
                <span>
                  Thông tin ranh giới WebGIS và tiêu chuẩn VietGAP sẽ được đồng bộ trực tiếp vào hồ sơ OCOP và mã QR truy xuất nguồn gốc.
                </span>
              </div>
            </div>

            {/* Footer Buttons */}
            <div className="flex justify-end gap-2.5 pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={onClose}
                className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-50 cursor-pointer"
              >
                Hủy bỏ
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="rounded-xl bg-emerald-700 px-5 py-2 text-xs font-bold text-white shadow-xs transition hover:bg-emerald-800 disabled:opacity-50 cursor-pointer active:scale-98"
              >
                {isSubmitting ? 'Đang lưu...' : unitToEdit ? 'Lưu thay đổi' : 'Tạo vùng trồng'}
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* Studio Modal WebGIS */}
      <GisLocationPickerModal
        isOpen={isGisModalOpen}
        onClose={() => setIsGisModalOpen(false)}
        onConfirm={handleGisConfirm}
        title={`Bản Đồ WebGIS: Định Vị Vùng Trồng ${name ? `[${name}]` : ''}`}
        initialCoordinates={
          latitude && longitude
            ? { lat: parseFloat(latitude), lng: parseFloat(longitude) }
            : null
        }
        initialPolygon={polygonCoords}
        mode="both"
        unitName={name || unitCode}
      />
    </>
  );
};
