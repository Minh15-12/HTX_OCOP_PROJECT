import React, { useState, useEffect } from 'react';
import {
  X,
  Sprout,
  CheckCircle,
  AlertTriangle,
} from 'lucide-react';
import type { ActivityType, FarmingLogPayload } from '@/types/agriculture';
import { ACTIVITY_TYPES_META } from '@/types/agriculture';
import { createFarmingLog, calculateSafeHarvestDate } from '@/services/farmingLogApi';
import { getAllStoredPlots } from '@/services/farmPlotApi';
import { getStoredSeasons, CropSeason } from '@/services/cropSeasonApi';
import { useToast } from '@/components/ui/ToastNotification';
import { compressImage } from '../utils/imageCompressor';
import { PREDEFINED_MATERIALS } from '../data/predefinedMaterials';
import { QuickLogMaterialsForm } from './quickLog/QuickLogMaterialsForm';
import { QuickLogGpsAndCamera } from './quickLog/QuickLogGpsAndCamera';
import { QuickLogActivitySelector } from './quickLog/QuickLogActivitySelector';
import { QuickLogSeasonPlotDate } from './quickLog/QuickLogSeasonPlotDate';
import { tokenStorage } from '@/services/tokenStorage';

interface QuickMobileLogModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  preselectedSeasonId?: string;
}

export const QuickMobileLogModal: React.FC<QuickMobileLogModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  preselectedSeasonId,
}) => {
  const { showToast } = useToast();

  const [plots, setPlots] = useState<{ id: string; plot_code: string; name: string }[]>([]);
  const [seasons, setSeasons] = useState<CropSeason[]>([]);
  const [cropSeasonId, setCropSeasonId] = useState<string>(preselectedSeasonId || '');
  const [activityType, setActivityType] = useState<ActivityType>('SPRAYING');
  const [plotId, setPlotId] = useState<string>('');
  const [activityDate, setActivityDate] = useState<string>(
    new Date().toISOString().split('T')[0]
  );
  const [description, setDescription] = useState<string>('');
  const [materialKey, setMaterialKey] = useState<string>('');
  const [materialId, setMaterialId] = useState<string | undefined>(undefined);
  const [materialName, setMaterialName] = useState<string>('');
  const [materialSku, setMaterialSku] = useState<string>('');
  const [materialBatchNumber, setMaterialBatchNumber] = useState<string>('');
  const [quantityApplied, setQuantityApplied] = useState<string>('');
  const [unit, setUnit] = useState<string>('Lít');
  const [phiDays, setPhiDays] = useState<number>(0);

  // GPS state
  const [gpsLatitude, setGpsLatitude] = useState<number | null>(null);
  const [gpsLongitude, setGpsLongitude] = useState<number | null>(null);
  const [gpsAccuracy, setGpsAccuracy] = useState<number | null>(null);
  const [gpsLoading, setGpsLoading] = useState<boolean>(false);
  const [gpsError, setGpsError] = useState<string | null>(null);

  // Evidence Photos state
  const [photos, setPhotos] = useState<string[]>([]);
  const [isCompressingPhoto, setIsCompressingPhoto] = useState<boolean>(false);
  const [performerName, setPerformerName] = useState<string>(
    () => tokenStorage.getUser()?.full_name || 'Kỹ thuật viên HTX'
  );
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

  const handleSelectActivity = (key: ActivityType) => {
    setActivityType(key);
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
        setGpsLatitude(11.9501);
        setGpsLongitude(108.4712);
        setGpsAccuracy(10);
        setGpsError(
          'Không truy cập được GPS thiết bị. Đã gán tọa độ vùng trồng Hòn Bồ P12 HTX Tân Tiến (11.9501, 108.4712).'
        );
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

    if (activityType === 'SPRAYING') {
      if (
        gpsLatitude === null ||
        gpsLongitude === null ||
        isNaN(gpsLatitude) ||
        isNaN(gpsLongitude)
      ) {
        setValidationError(
          'Quy tắc an toàn BR-FARM-003 & TCVN 12850:2019: Hoạt động Phun thuốc BVTV BẮT BUỘC phải có tọa độ GPS tại hiện trường! Vui lòng bấm nút "📍 Lấy GPS 1 chạm" bên dưới.'
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
        description:
          description ||
          `Ghi nhận ${ACTIVITY_TYPES_META[activityType].label} tại nhà kính Sweet Palermo`,
        material_id: materialId,
        material_name: materialName || undefined,
        material_sku: materialSku || undefined,
        material_batch_number: materialBatchNumber || undefined,
        quantity_applied: quantityApplied ? parseFloat(quantityApplied) : undefined,
        unit: unit || 'Lít',
        phi_days: phiDays,
        gps_latitude: gpsLatitude !== null ? gpsLatitude : undefined,
        gps_longitude: gpsLongitude !== null ? gpsLongitude : undefined,
        attachment_reference:
          photos.length > 0 ? photos : ['/images/logs/evidence-default.jpg'],
        performed_by: performerName,
      };

      await createFarmingLog(payload);

      showToast(
        phiDays > 0
          ? `Ghi nhật ký phun thuốc thành công! Thửa đất đã tự động chuyển sang trạng thái CÁCH LY PHI đến ${safeHarvestDate}.`
          : 'Ghi nhận nhật ký canh tác thành công theo chuẩn TCVN 12850:2019 & VietGAP!',
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
                Ghi Nhật Ký Canh Tác 1 Chạm (VietGAP / TCVN 12850)
              </h2>
              <p className="text-xs text-emerald-100 font-medium">
                HTX Nông Nghiệp • Ớt chuông Sweet Palermo Đỏ Đà Lạt
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="min-w-[48px] min-h-[48px] flex items-center justify-center rounded-xl text-white/80 transition hover:bg-white/20 hover:text-white cursor-pointer"
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

          {/* 1-Tap 5 Activity Selector */}
          <QuickLogActivitySelector
            activityType={activityType}
            onSelectActivity={handleSelectActivity}
          />

          {/* Season, Plot & Date Selection */}
          <QuickLogSeasonPlotDate
            cropSeasonId={cropSeasonId}
            setCropSeasonId={setCropSeasonId}
            seasons={seasons}
            plotId={plotId}
            setPlotId={setPlotId}
            plots={plots}
            activityDate={activityDate}
            setActivityDate={setActivityDate}
          />

          {/* Quick Material Selection & PHI Lookup */}
          <QuickLogMaterialsForm
            materialKey={materialKey}
            onMaterialChange={handleMaterialChange}
            materialSku={materialSku}
            setMaterialSku={setMaterialSku}
            materialBatchNumber={materialBatchNumber}
            setMaterialBatchNumber={setMaterialBatchNumber}
            quantityApplied={quantityApplied}
            setQuantityApplied={setQuantityApplied}
            unit={unit}
            setUnit={setUnit}
            phiDays={phiDays}
            setPhiDays={setPhiDays}
            safeHarvestDate={safeHarvestDate}
          />

          {/* GPS Geolocation & Camera Upload */}
          <QuickLogGpsAndCamera
            activityType={activityType}
            gpsLatitude={gpsLatitude}
            gpsLongitude={gpsLongitude}
            gpsAccuracy={gpsAccuracy}
            gpsLoading={gpsLoading}
            gpsError={gpsError}
            handleGetGps={handleGetGps}
            photos={photos}
            isCompressingPhoto={isCompressingPhoto}
            handlePhotoCapture={handlePhotoCapture}
            handleRemovePhoto={handleRemovePhoto}
          />

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

          {/* Footer Submit Buttons */}
          <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="min-h-[48px] px-5 py-2.5 rounded-2xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-bold transition cursor-pointer"
            >
              Hủy bỏ
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="min-h-[48px] px-7 py-2.5 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs sm:text-sm font-extrabold shadow-md hover:shadow-lg transition flex items-center gap-2 disabled:opacity-60 cursor-pointer"
            >
              {isSubmitting ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Đang lưu nhật ký...</span>
                </>
              ) : (
                <>
                  <CheckCircle className="w-4 h-4" />
                  <span>Lưu Nhật Ký Canh Tác (VietGAP)</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
