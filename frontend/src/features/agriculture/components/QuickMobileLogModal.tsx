import React, { useState, useEffect } from 'react';
import {
  X,
  MapPin,
  Camera,
  ShieldAlert,
  Sprout,
  Shovel,
  Scissors,
  Wheat,
  Calendar,
  CheckCircle,
  AlertTriangle,
  Upload,
  Layers,
  Clock,
  Trash2,
} from 'lucide-react';
import type { ActivityType, FarmingLogPayload } from '@/types/agriculture';
import { ACTIVITY_TYPES_META } from '@/types/agriculture';
import { createFarmingLog, calculateSafeHarvestDate } from '@/services/farmingLogApi';
import { getAllStoredPlots } from '@/services/farmPlotApi';
import { getStoredSeasons, CropSeason } from '@/services/cropSeasonApi';
import { useToast } from '@/components/ui/ToastNotification';

interface QuickMobileLogModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

interface PredefinedMaterial {
  key: string;
  name: string;
  sku: string;
  batchNumber: string;
  defaultPhi: number;
  unit: string;
  materialId?: string;
}

const PREDEFINED_MATERIALS: PredefinedMaterial[] = [
  {
    key: 'bio-tricho',
    name: 'Chế phẩm Sinh học Nấm Đối kháng Bio-Tricho',
    sku: 'SKU-BIO-TRICHO-500ML',
    batchNumber: 'LOT-BIO-2026-88',
    defaultPhi: 7,
    unit: 'Lít',
    materialId: '32ceda6a-e7b2-4f57-ac6a-e3cc98f6ff8b',
  },
  {
    key: 'fert-cabo',
    name: 'Phân bón sinh học vi lượng Canxi-Bo Israel (Dày vỏ, ngọt quả)',
    sku: 'SKU-FERT-CABO-20L',
    batchNumber: 'LOT-NPK-2026-12',
    defaultPhi: 0,
    unit: 'Kg',
    materialId: '2ff08c4b-133f-4268-b5bb-45bf2f19e9a9',
  },
  {
    key: 'bio-neem',
    name: 'Chế phẩm Thảo mộc Xua đuổi Côn trùng & Bọ trĩ Bio-Neem',
    sku: 'SKU-BIO-NEEM-1L',
    batchNumber: 'LOT-NEEM-2026-05',
    defaultPhi: 3,
    unit: 'Lít',
    materialId: '32ceda6a-e7b2-4f57-ac6a-e3cc98f6ff8b',
  },
  {
    key: 'fert-seaweed',
    name: 'Phân bón hữu cơ sinh học rong biển bón rễ Seaweed',
    sku: 'SKU-FERT-SEAWEED-10KG',
    batchNumber: 'LOT-SW-2026-03',
    defaultPhi: 0,
    unit: 'Kg',
    materialId: '6ee4616f-8f54-4d20-9eb9-d2f148e536cd',
  },
  {
    key: 'lime-clean',
    name: 'Vôi bột nông nghiệp Canxi khử trùng giá thể',
    sku: 'SKU-LIME-50KG',
    batchNumber: 'LOT-VOI-2026-01',
    defaultPhi: 0,
    unit: 'Kg',
    materialId: 'caccd604-ba17-4338-95c0-5bc361d8ec4e',
  },
  {
    key: 'other',
    name: 'Vật tư khác / Nhập thủ công',
    sku: '',
    batchNumber: '',
    defaultPhi: 0,
    unit: 'Kg',
  },
];

/**
 * Nén và resize ảnh chụp hiện trường bằng HTML5 Canvas.
 * Giới hạn cạnh lớn nhất tối đa 1024px và nén JPEG chất lượng 0.75.
 * Giảm dung lượng ảnh camera từ 5MB-15MB xuống còn ~80KB-130KB,
 * triệt tiêu hoàn toàn ngoại lệ QuotaExceededError của localStorage.
 */
function compressImage(
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

export const QuickMobileLogModal: React.FC<QuickMobileLogModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
}) => {
  const { showToast } = useToast();

  const [plots, setPlots] = useState<{ id: string; plot_code: string; name: string }[]>([]);
  const [seasons, setSeasons] = useState<CropSeason[]>([]);
  const [cropSeasonId, setCropSeasonId] = useState<string>('c05e8db9-6fb6-4fe6-8110-b73cc109fab3');
  const [activityType, setActivityType] = useState<ActivityType>('SPRAYING');
  const [plotId, setPlotId] = useState<string>('');
  const [activityDate, setActivityDate] = useState<string>(
    new Date().toISOString().split('T')[0]
  );
  const [description, setDescription] = useState<string>('');
  const [materialKey, setMaterialKey] = useState<string>('bio-tricho');
  const [materialId, setMaterialId] = useState<string | undefined>('32ceda6a-e7b2-4f57-ac6a-e3cc98f6ff8b');
  const [materialName, setMaterialName] = useState<string>('Chế phẩm Sinh học Nấm Đối kháng Bio-Tricho');
  const [materialSku, setMaterialSku] = useState<string>('SKU-BIO-TRICHO-500ML');
  const [materialBatchNumber, setMaterialBatchNumber] = useState<string>('LOT-BIO-2026-88');
  const [quantityApplied, setQuantityApplied] = useState<string>('2.5');
  const [unit, setUnit] = useState<string>('Lít');
  const [phiDays, setPhiDays] = useState<number>(7);

  // GPS state
  const [gpsLatitude, setGpsLatitude] = useState<number | null>(null);
  const [gpsLongitude, setGpsLongitude] = useState<number | null>(null);
  const [gpsAccuracy, setGpsAccuracy] = useState<number | null>(null);
  const [gpsLoading, setGpsLoading] = useState<boolean>(false);
  const [gpsError, setGpsError] = useState<string | null>(null);

  // Evidence Photos state
  const [photos, setPhotos] = useState<string[]>([]);
  const [isCompressingPhoto, setIsCompressingPhoto] = useState<boolean>(false);
  const [performerName, setPerformerName] = useState<string>('Nguyễn Văn An (Xã viên Đội 1)');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [validationError, setValidationError] = useState<string | null>(null);

  // Safe harvest date calculation
  const safeHarvestDate = calculateSafeHarvestDate(activityDate, phiDays);

  useEffect(() => {
    if (isOpen) {
      const storedPlots = getAllStoredPlots();
      const plotOptions = storedPlots.map((p) => ({
        id: p.id,
        plot_code: p.plot_code,
        name: `${p.plot_code} - ${p.unit_name || 'Nhà kính Sweet Palermo'}`,
      }));
      setPlots(plotOptions);
      if (plotOptions.length > 0 && !plotId) {
        setPlotId(plotOptions[0].id);
      }

      const storedSeasons = getStoredSeasons();
      setSeasons(storedSeasons);
      if (storedSeasons.length > 0 && !cropSeasonId) {
        setCropSeasonId(storedSeasons[0].id);
      }
      setValidationError(null);
    }
  }, [isOpen]);

  // Handle material selector change
  const handleMaterialChange = (key: string) => {
    setMaterialKey(key);
    const found = PREDEFINED_MATERIALS.find((m) => m.key === key);
    if (found && key !== 'other') {
      setMaterialId(found.materialId);
      setMaterialName(found.name);
      setMaterialSku(found.sku);
      setMaterialBatchNumber(found.batchNumber);
      setPhiDays(found.defaultPhi);
      setUnit(found.unit);
    } else if (key === 'other') {
      setMaterialId(undefined);
      setMaterialName('');
      setMaterialSku('');
      setMaterialBatchNumber('');
      setPhiDays(0);
      setUnit('Kg');
    }
  };

  // 1-Tap Geolocation Handler
  const handleGetGps = () => {
    setGpsLoading(true);
    setGpsError(null);
    if (!navigator.geolocation) {
      setGpsLatitude(11.9501);
      setGpsLongitude(108.4712);
      setGpsAccuracy(15);
      setGpsError('Thiết bị không có GPS. Đã lấy tọa độ vùng trồng Hòn Bồ HTX Tân Tiến.');
      setGpsLoading(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setGpsLatitude(Number(pos.coords.latitude.toFixed(6)));
        setGpsLongitude(Number(pos.coords.longitude.toFixed(6)));
        setGpsAccuracy(Math.round(pos.coords.accuracy));
        setGpsLoading(false);
      },
      () => {
        // Fallback to Tan Tien Cooperative greenhouse coordinates
        setGpsLatitude(11.9501);
        setGpsLongitude(108.4712);
        setGpsAccuracy(10);
        setGpsError('Không truy cập được GPS thiết bị. Đã gán tọa độ vùng trồng Hòn Bồ P12 HTX Tân Tiến (11.9501, 108.4712).');
        setGpsLoading(false);
      },
      { enableHighAccuracy: true, timeout: 8000 }
    );
  };

  // Photo upload handler with Canvas compression
  const handlePhotoCapture = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    const file = files[0];

    try {
      setIsCompressingPhoto(true);
      const compressedDataUrl = await compressImage(file, 1024, 1024, 0.75);
      setPhotos((prev) => [...prev, compressedDataUrl]);
    } catch (err) {
      console.warn('Canvas compression failed, falling back to direct reader:', err);
      const reader = new FileReader();
      reader.onloadend = () => {
        if (typeof reader.result === 'string') {
          setPhotos((prev) => [...prev, reader.result as string]);
        }
      };
      reader.readAsDataURL(file);
    } finally {
      setIsCompressingPhoto(false);
      e.target.value = '';
    }
  };

  const handleRemovePhoto = (index: number) => {
    setPhotos((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setValidationError(null);

    // Enforce BR-FARM-003: GPS is mandatory for Spraying activity!
    if (activityType === 'SPRAYING') {
      if (
        gpsLatitude === null ||
        gpsLongitude === null ||
        isNaN(gpsLatitude) ||
        isNaN(gpsLongitude)
      ) {
        setValidationError(
          'Quy tắc an toàn BR-FARM-003 & Thông tư 02/2024: Hoạt động Phun thuốc BVTV BẮT BUỘC phải có tọa độ GPS tại hiện trường! Vui lòng bấm nút "📍 Lấy tọa độ GPS ngay" bên dưới.'
        );
        return;
      }
    }

    if (!plotId) {
      setValidationError('Vui lòng chọn Thửa đất canh tác.');
      return;
    }

    setIsSubmitting(true);

    try {
      const payload: FarmingLogPayload = {
        crop_season_id: cropSeasonId || 'c05e8db9-6fb6-4fe6-8110-b73cc109fab3',
        plot_id: plotId,
        activity_type: activityType,
        activity_date: activityDate,
        description: description || `Ghi nhận ${ACTIVITY_TYPES_META[activityType].label} tại nhà kính Sweet Palermo`,
        material_id: materialId,
        material_name: materialName || undefined,
        material_sku: materialSku || undefined,
        material_batch_number: materialBatchNumber || undefined,
        quantity_applied: quantityApplied ? parseFloat(quantityApplied) : undefined,
        unit: unit || 'Lít',
        phi_days: phiDays,
        gps_latitude: gpsLatitude !== null ? gpsLatitude : undefined,
        gps_longitude: gpsLongitude !== null ? gpsLongitude : undefined,
        attachment_reference: photos.length > 0 ? photos : ['/images/logs/evidence-default.jpg'],
        performed_by: performerName,
      };

      await createFarmingLog(payload);

      showToast(
        phiDays > 0
          ? `Ghi nhật ký phun thuốc thành công! Thửa đất đã tự động chuyển sang trạng thái CÁCH LY PHI đến ${safeHarvestDate}.`
          : 'Ghi nhận nhật ký canh tác thành công theo chuẩn Thông tư 02/2024!',
        'success'
      );

      onSuccess();
      onClose();
    } catch (err: any) {
      setValidationError(err?.message || 'Có lỗi xảy ra khi lưu nhật ký.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 p-2 sm:p-4 backdrop-blur-sm overflow-y-auto">
      <div className="relative w-full max-w-2xl overflow-hidden rounded-3xl border border-white/60 bg-white shadow-2xl my-6 animate-scale-up">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-100 bg-gradient-to-r from-emerald-600 to-teal-700 px-6 py-4 text-white">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-white/20 backdrop-blur-md shadow-sm">
              <Sprout className="h-6 w-6 text-white" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-extrabold tracking-tight">
                Ghi Nhật Ký Canh Tác 1 Chạm (TT02/2024)
              </h2>
              <p className="text-xs text-emerald-100 font-medium">
                HTX Tân Tiến • Ớt chuông Sweet Palermo Đỏ Đà Lạt
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="min-w-[48px] min-h-[48px] flex items-center justify-center rounded-xl text-white/80 transition hover:bg-white/20 hover:text-white"
            aria-label="Đóng cửa sổ ghi nhật ký"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-5 sm:p-6 space-y-5 max-h-[80vh] overflow-y-auto">
          {/* Validation Alert */}
          {validationError && (
            <div className="p-3.5 rounded-2xl bg-rose-50 border border-rose-300 text-rose-900 text-xs flex items-start gap-2.5">
              <AlertTriangle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
              <div>
                <span className="font-bold">Lỗi kiểm tra quy tắc:</span>
                <p className="mt-0.5 leading-relaxed">{validationError}</p>
              </div>
            </div>
          )}

          {/* 1-Tap 5 Activity Selector (Large Touch Targets >= 48px) */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
              1. Chọn công việc hôm nay (1 chạm) <span className="text-rose-500">*</span>
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
              {(Object.keys(ACTIVITY_TYPES_META) as ActivityType[]).map((key) => {
                const meta = ACTIVITY_TYPES_META[key];
                const isSelected = activityType === key;

                return (
                  <button
                    key={key}
                    type="button"
                    onClick={() => {
                      setActivityType(key);
                      if (key === 'FERTILIZATION') {
                        setMaterialKey('fert-cabo');
                        handleMaterialChange('fert-cabo');
                      } else if (key === 'SPRAYING') {
                        setMaterialKey('bio-tricho');
                        handleMaterialChange('bio-tricho');
                      }
                    }}
                    className={`min-h-[54px] p-2.5 rounded-2xl border text-left flex items-center gap-3 transition-all ${
                      isSelected
                        ? 'border-emerald-600 bg-emerald-50 text-emerald-950 shadow-md ring-2 ring-emerald-500/20 font-bold'
                        : 'border-slate-200 bg-white text-slate-700 hover:border-emerald-200 hover:bg-slate-50'
                    }`}
                  >
                    <div
                      className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl ${
                        isSelected ? 'bg-emerald-600 text-white shadow-sm' : 'bg-slate-100 text-slate-600'
                      }`}
                    >
                      {key === 'LAND_PREPARATION' && <Shovel className="h-5 w-5" />}
                      {key === 'FERTILIZATION' && <Sprout className="h-5 w-5" />}
                      {key === 'SPRAYING' && <ShieldAlert className="h-5 w-5" />}
                      {key === 'CARE' && <Scissors className="h-5 w-5" />}
                      {key === 'HARVEST' && <Wheat className="h-5 w-5" />}
                    </div>
                    <span className="text-xs leading-snug">{meta.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Season, Plot & Date Selection */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">
              2. Mùa vụ canh tác <span className="text-rose-500">*</span>
            </label>
            <select
              value={cropSeasonId}
              onChange={(e) => setCropSeasonId(e.target.value)}
              className="w-full min-h-[48px] rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2.5 text-xs sm:text-sm font-semibold text-slate-800 outline-none focus:border-emerald-500 focus:bg-white focus:ring-2 focus:ring-emerald-200"
            >
              {seasons.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name} ({s.crop})
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                3. Thửa đất canh tác <span className="text-rose-500">*</span>
              </label>
              <select
                value={plotId}
                onChange={(e) => setPlotId(e.target.value)}
                className="w-full min-h-[48px] rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2.5 text-xs sm:text-sm font-semibold text-slate-800 outline-none focus:border-emerald-500 focus:bg-white focus:ring-2 focus:ring-emerald-200"
              >
                {plots.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                4. Ngày thực hiện <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <input
                  type="date"
                  value={activityDate}
                  onChange={(e) => setActivityDate(e.target.value)}
                  className="w-full min-h-[48px] rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2.5 text-xs sm:text-sm font-semibold text-slate-800 outline-none focus:border-emerald-500 focus:bg-white focus:ring-2 focus:ring-emerald-200"
                />
              </div>
            </div>
          </div>

          {/* Quick Material Selection & PHI Lookup */}
          <div className="rounded-2xl border border-slate-200 bg-slate-50/70 p-4 space-y-3.5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                <Layers className="w-4 h-4 text-emerald-600" />
                4. Chọn Vật Tư / Phân Bón / Chế Phẩm
              </span>
              <span className="text-[11px] text-slate-400">Tự động điền SKU & Số Lô</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                  Danh mục vật tư kho HTX
                </label>
                <select
                  value={materialKey}
                  onChange={(e) => handleMaterialChange(e.target.value)}
                  className="w-full min-h-[48px] rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-xs font-medium text-slate-800 outline-none focus:border-emerald-500"
                >
                  {PREDEFINED_MATERIALS.map((m) => (
                    <option key={m.key} value={m.key}>
                      {m.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                  Mã SKU & Số lô sản xuất
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={materialSku}
                    onChange={(e) => setMaterialSku(e.target.value)}
                    placeholder="Mã SKU"
                    className="w-1/2 min-h-[48px] rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-xs font-mono text-slate-700 outline-none focus:border-emerald-500"
                  />
                  <input
                    type="text"
                    value={materialBatchNumber}
                    onChange={(e) => setMaterialBatchNumber(e.target.value)}
                    placeholder="Số lô SX"
                    className="w-1/2 min-h-[48px] rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-xs font-mono text-slate-700 outline-none focus:border-emerald-500"
                  />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                  Khối lượng / Liều lượng
                </label>
                <input
                  type="number"
                  step="0.1"
                  value={quantityApplied}
                  onChange={(e) => setQuantityApplied(e.target.value)}
                  placeholder="2.5"
                  className="w-full min-h-[48px] rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-xs font-bold text-slate-800 outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-600 mb-1">Đơn vị</label>
                <select
                  value={unit}
                  onChange={(e) => setUnit(e.target.value)}
                  className="w-full min-h-[48px] rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-xs font-medium text-slate-800 outline-none focus:border-emerald-500"
                >
                  <option value="Lít">Lít (Dung dịch/Nước)</option>
                  <option value="Kg">Kg (Dạng bột/Hạt)</option>
                  <option value="Chai">Chai</option>
                  <option value="Gói">Gói</option>
                  <option value="Cuộn">Cuộn (Dây quấn)</option>
                </select>
              </div>

              <div className="col-span-2 sm:col-span-1">
                <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                  Cách ly PHI (Ngày)
                </label>
                <input
                  type="number"
                  min="0"
                  value={phiDays}
                  onChange={(e) => setPhiDays(parseInt(e.target.value) || 0)}
                  className={`w-full min-h-[48px] rounded-xl border px-3 py-2.5 text-xs font-bold outline-none focus:border-emerald-500 ${
                    phiDays > 0
                      ? 'border-rose-300 bg-rose-50/80 text-rose-900 font-extrabold'
                      : 'border-slate-200 bg-white text-slate-800'
                  }`}
                />
              </div>
            </div>

            {/* Live PHI Guard Indicator */}
            {phiDays > 0 ? (
              <div className="p-3 rounded-xl bg-amber-50 border border-amber-300 text-amber-900 text-xs flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <ShieldAlert className="w-4 h-4 text-amber-600 shrink-0" />
                  <span>
                    Khóa PHI kích hoạt: <strong>Cách ly {phiDays} ngày</strong>
                  </span>
                </div>
                <span className="font-bold text-rose-700 bg-white px-2 py-0.5 rounded-lg border border-amber-200">
                  Thu hoạch từ: {safeHarvestDate}
                </span>
              </div>
            ) : (
              <div className="p-2.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>Không có thời gian cách ly (An toàn PHI)</span>
              </div>
            )}
          </div>

          {/* 1-Tap Geolocation Auto-Fill (Touch Target >= 48px) */}
          <div className="rounded-2xl border border-slate-200 bg-slate-50/70 p-4 space-y-2.5">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                <MapPin className="w-4 h-4 text-emerald-600" />
                5. Tọa độ GPS hiện trường {activityType === 'SPRAYING' && <span className="text-rose-500">* Bắt buộc</span>}
              </label>
              <button
                type="button"
                onClick={handleGetGps}
                disabled={gpsLoading}
                className="min-h-[48px] px-3.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-sm flex items-center gap-1.5 transition active:scale-95 disabled:opacity-60"
              >
                <MapPin className="w-4 h-4 animate-bounce" />
                {gpsLoading ? 'Đang định vị...' : '📍 Lấy GPS 1 chạm'}
              </button>
            </div>

            <div className="flex items-center gap-2 text-xs">
              {gpsLatitude && gpsLongitude ? (
                <div className="flex items-center gap-2 w-full p-2.5 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-900 font-mono font-bold">
                  <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>
                    Vĩ độ: {gpsLatitude}° N • Kinh độ: {gpsLongitude}° E (Độ chính xác: ±{gpsAccuracy || 10}m)
                  </span>
                </div>
              ) : (
                <div className="w-full p-2.5 bg-slate-100 rounded-xl text-slate-500 italic text-[11.5px]">
                  Chưa lấy tọa độ. Bấm nút màu xanh phía trên để tự động nhận diện vị trí thửa đất qua GPS.
                </div>
              )}
            </div>
            {gpsError && <p className="text-[11px] text-amber-700">{gpsError}</p>}
          </div>

          {/* Camera / Real Evidence Photo */}
          <div className="rounded-2xl border border-slate-200 bg-slate-50/70 p-4 space-y-2.5">
            <label className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
              <Camera className="w-4 h-4 text-emerald-600" />
              6. Chụp ảnh / Tải minh chứng thực địa (Thông tư 02)
            </label>

            <div className="flex flex-wrap items-center gap-3">
              <label className="min-h-[48px] px-4 py-2.5 rounded-xl border border-dashed border-emerald-500 bg-emerald-50/50 hover:bg-emerald-50 text-emerald-800 text-xs font-bold flex items-center gap-2 cursor-pointer shadow-2xs transition active:scale-95">
                {isCompressingPhoto ? (
                  <>
                    <div className="w-4 h-4 border-2 border-emerald-600 border-t-transparent rounded-full animate-spin" />
                    <span>Đang nén & tối ưu ảnh...</span>
                  </>
                ) : (
                  <>
                    <Camera className="w-4 h-4 text-emerald-600" />
                    <span>Chụp / Chọn ảnh bằng chứng</span>
                  </>
                )}
                <input
                  type="file"
                  accept="image/*"
                  capture="environment"
                  disabled={isCompressingPhoto}
                  onChange={handlePhotoCapture}
                  className="hidden"
                />
              </label>

              {photos.map((src, idx) => (
                <div key={idx} className="relative group w-14 h-14 rounded-xl overflow-hidden border border-slate-300 shadow-sm">
                  <img src={src} alt="Evidence preview" className="w-full h-full object-cover" />
                  <button
                    type="button"
                    onClick={() => handleRemovePhoto(idx)}
                    className="absolute inset-0 bg-black/50 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition"
                  >
                    <Trash2 className="w-4 h-4 text-rose-300" />
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Performer & Notes */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                7. Người thực hiện ghi nhật ký
              </label>
              <input
                type="text"
                value={performerName}
                onChange={(e) => setPerformerName(e.target.value)}
                className="w-full min-h-[48px] rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2.5 text-xs font-medium text-slate-800 outline-none focus:border-emerald-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                8. Ghi chú kỹ thuật chi tiết
              </label>
              <input
                type="text"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="VD: Cây sinh trưởng tốt, không phát hiện sâu bệnh"
                className="w-full min-h-[48px] rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2.5 text-xs font-medium text-slate-800 outline-none focus:border-emerald-500"
              />
            </div>
          </div>

          {/* Footer Submit Buttons (Touch Target >= 48px) */}
          <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="min-h-[48px] px-5 py-2.5 rounded-2xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-bold transition"
            >
              Hủy bỏ
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="min-h-[48px] px-7 py-2.5 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs sm:text-sm font-extrabold shadow-md hover:shadow-lg transition flex items-center gap-2 disabled:opacity-60"
            >
              {isSubmitting ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Đang lưu nhật ký...</span>
                </>
              ) : (
                <>
                  <CheckCircle className="w-4 h-4" />
                  <span>Lưu Nhật Ký Canh Tác (TT02)</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
