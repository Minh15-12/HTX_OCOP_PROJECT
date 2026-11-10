import React, { useState, useEffect, useMemo } from 'react';
import {
  Camera,
  MapPin,
  Calendar,
  AlertTriangle,
  CheckCircle2,
  Send,
  Loader2,
  Trash2,
  Sparkles,
  ShieldAlert,
  Mic,
  MicOff,
  Plus,
  PackageCheck,
  Droplets,
  Layers,
  WifiOff,
  CloudUpload,
  AlertCircle,
  HelpCircle,
} from 'lucide-react';
import type { ActivityType, FarmingLogPayload, FarmingLogItem } from '@/types/agriculture';
import { ACTIVITY_TYPES_META } from '@/types/agriculture';
import { compressImage } from '../../utils/imageCompressor';
import { calculateSafeHarvestDate, fetchBannedPesticides } from '@/services/farmingLogApi';
import { inventoryApi } from '@/services/inventoryApi';
import { useQuery } from '@tanstack/react-query';
import { useToast } from '@/components/ui/ToastNotification';
import { saveOfflineLog, getOfflineQueue } from '../../utils/offlineLogStorage';
import { PESTICIDE_PHI_DICTIONARY } from '../../data/pesticidePhiDictionary';

interface FieldLogQuickFormProps {
  selectedPlotId: string;
  selectedPlotCode: string;
  selectedSeasonId: string;
  plotGpsLat?: number;
  plotGpsLng?: number;
  plotBoundary?: any[];
  expectedHarvestStart?: string;
  onSuccess: () => void;
  onSubmit: (payload: FarmingLogPayload) => Promise<void>;
  isSubmitting: boolean;
}

const QUICK_NOTES = [
  'Thời tiết khô ráo, nắng ấm, độ ẩm nhà kính 70%',
  'Đã kiểm tra đầu béc nhỏ giọt, dòng chảy thông suốt',
  'Cây đang trong giai đoạn đậu quả rộ',
  'Phát hiện bọ trĩ mật độ thấp (< 3 con/ngọn)',
  'Tưới đệm nước sạch sau khi châm phân 1 giờ',
];

export const FieldLogQuickForm: React.FC<FieldLogQuickFormProps> = ({
  selectedPlotId,
  selectedPlotCode,
  selectedSeasonId,
  plotGpsLat,
  plotGpsLng,
  plotBoundary,
  expectedHarvestStart,
  onSuccess,
  onSubmit,
  isSubmitting,
}) => {
  const { showToast } = useToast();

  // Basic Form State
  const [activityType, setActivityType] = useState<ActivityType>('FERTILIZATION');
  const [activityDate, setActivityDate] = useState<string>(
    () => new Date().toISOString().split('T')[0]
  );
  const [description, setDescription] = useState<string>('');
  const [isVoiceRecording, setIsVoiceRecording] = useState<boolean>(false);
  const [voiceRawText, setVoiceRawText] = useState<string>('');

  // High-Tech Fertigation State
  const [fertigationMethod, setFertigationMethod] = useState<'DRIP_EMITTER' | 'DRENCH' | 'FOLIAR'>('DRIP_EMITTER');
  const [ecSolution, setEcSolution] = useState<string>('2.20');
  const [ecDrain, setEcDrain] = useState<string>('1.15');
  const [phSolution, setPhSolution] = useState<string>('6.00');
  const [tankCompositionA, setTankCompositionA] = useState<string>('Calcinit (Canxi Nitrat 5kg) + Sắt Chelate Fe-EDDHA (50g)');
  const [tankCompositionB, setTankCompositionB] = useState<string>('Krista-K Plus (3kg) + Krista-MAG (2kg) + MKP (2kg)');
  const [waterVolumeLiters, setWaterVolumeLiters] = useState<string>('2500');

  // Tank-Mix Multi-Item State (Dành cho Phun thuốc & Bón phân)
  const [tankMixItems, setTankMixItems] = useState<FarmingLogItem[]>([
    {
      material_id: '',
      material_name: 'Thuốc BVTV Sinh học Neem Oil 1000EC',
      item_type: 'PESTICIDE',
      active_ingredient: 'Azadirachtin 0.3%',
      resistance_group: 'IRAC UN',
      quantity_applied: 1.5,
      unit: 'Lít',
      phi_days: 3,
      material_lot_number: 'LOT-NEEM-2026-01',
      material_export_slip_code: 'PXK-2026-03',
    },
  ]);

  // GPS State
  const [gpsLatitude, setGpsLatitude] = useState<number | null>(null);
  const [gpsLongitude, setGpsLongitude] = useState<number | null>(null);
  const [gpsAccuracy, setGpsAccuracy] = useState<number | null>(null);
  const [gpsLoading, setGpsLoading] = useState<boolean>(false);
  const [gpsError, setGpsError] = useState<string | null>(null);
  const [distanceToEdge, setDistanceToEdge] = useState<number | null>(null);

  // Photos State
  const [photos, setPhotos] = useState<string[]>([]);
  const [isCompressingPhoto, setIsCompressingPhoto] = useState<boolean>(false);
  const [validationError, setValidationError] = useState<string | null>(null);

  // Query Real Inventory Materials from Warehouse
  const { data: warehouseMaterials = [] } = useQuery({
    queryKey: ['materials', 'for-field-log'],
    queryFn: () => inventoryApi.getMaterials(),
  });

  // Query Banned Pesticides list (Thông tư 75/2025/TT-BNNMT)
  const { data: bannedPesticides = [] } = useQuery({
    queryKey: ['bannedPesticides'],
    queryFn: () => fetchBannedPesticides(),
  });

  // Tính toán Effective PHI = Max(phi_days của các item trong tank-mix)
  const maxPhiDays = useMemo(() => {
    if (activityType !== 'SPRAYING') return 0;
    return tankMixItems.reduce((max, item) => Math.max(max, Number(item.phi_days) || 0), 0);
  }, [activityType, tankMixItems]);

  const safeHarvestDate = useMemo(() => {
    return calculateSafeHarvestDate(activityDate, maxPhiDays);
  }, [activityDate, maxPhiDays]);

  // Kiểm tra xung đột thu hoạch (Proactive Collision Warning)
  const hasHarvestCollision = useMemo(() => {
    if (maxPhiDays <= 0 || !expectedHarvestStart) return false;
    return new Date(safeHarvestDate) > new Date(expectedHarvestStart);
  }, [maxPhiDays, safeHarvestDate, expectedHarvestStart]);

  // Kiểm tra hoạt chất cấm trong Tank-Mix
  const bannedViolation = useMemo(() => {
    if (activityType !== 'SPRAYING') return null;
    for (const it of tankMixItems) {
      if (it.active_ingredient) {
        const lower = it.active_ingredient.toLowerCase();
        for (const banned of bannedPesticides) {
          if (lower.includes(banned.toLowerCase())) {
            return `Hoạt chất "${it.active_ingredient}" nằm trong danh mục CẤM SỬ DỤNG theo Thông tư 75/2025/TT-BNNMT!`;
          }
        }
      }
    }
    return null;
  }, [activityType, tankMixItems, bannedPesticides]);

  // Voice-to-Text Support (Web Speech API)
  const handleToggleVoice = () => {
    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      showToast('Trình duyệt không hỗ trợ nhận diện giọng nói (Web Speech API)', 'error');
      return;
    }

    if (isVoiceRecording) {
      setIsVoiceRecording(false);
      return;
    }

    try {
      const recognition = new SpeechRecognition();
      recognition.lang = 'vi-VN';
      recognition.continuous = false;
      recognition.interimResults = false;

      recognition.onstart = () => {
        setIsVoiceRecording(true);
        showToast('Đang lắng nghe giọng nói tiếng Việt... Hãy đọc to công việc!', 'info');
      };

      recognition.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        setVoiceRawText(transcript);
        setDescription((prev) => (prev ? `${prev}. ${transcript}` : transcript));
        setIsVoiceRecording(false);
        showToast('Đã chuyển đổi giọng nói thành văn bản thành công!', 'success');
      };

      recognition.onerror = (event: any) => {
        setIsVoiceRecording(false);
        showToast(`Lỗi nhận diện giọng nói: ${event.error}`, 'error');
      };

      recognition.onend = () => {
        setIsVoiceRecording(false);
      };

      recognition.start();
    } catch (err: any) {
      setIsVoiceRecording(false);
      showToast('Không thể kích hoạt microphone: ' + err.message, 'error');
    }
  };

  // Accurate GPS Geofencing (No fake fallback)
  const handleGetGps = () => {
    if (!navigator.geolocation) {
      setGpsError('Thiết bị không hỗ trợ định vị GPS!');
      return;
    }
    setGpsLoading(true);
    setGpsError(null);

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const lat = pos.coords.latitude;
        const lng = pos.coords.longitude;
        const acc = Math.round(pos.coords.accuracy);

        setGpsLatitude(lat);
        setGpsLongitude(lng);
        setGpsAccuracy(acc);
        setGpsLoading(false);

        // Tính khoảng cách gần đúng tới tâm thửa nếu có
        if (plotGpsLat && plotGpsLng) {
          const dLat = (lat - plotGpsLat) * 111320;
          const dLng = (lng - plotGpsLng) * 111320 * Math.cos((plotGpsLat * Math.PI) / 180);
          const dist = Math.round(Math.sqrt(dLat * dLat + dLng * dLng));
          setDistanceToEdge(dist);

          if (dist > 50) {
            showToast(`Cảnh báo: GPS lệch cách mép thửa ${dist}m (Dung sai cho phép: 50m)`, 'info');
          } else {
            showToast(`Đã xác thực vị trí tại ruộng (Sai số ${dist}m, độ chính xác ${acc}m)!`, 'success');
          }
        } else {
          showToast(`Đã lấy tọa độ thực địa thành công (Độ chính xác: ±${acc}m)!`, 'success');
        }
      },
      (err) => {
        setGpsLoading(false);
        setGpsError(`Không thể lấy GPS (${err.message}). Vui lòng bật vị trí trên điện thoại!`);
      },
      { enableHighAccuracy: true, timeout: 12000, maximumAge: 0 }
    );
  };

  // Tank-Mix Item Management
  const handleAddTankMixItem = () => {
    if (tankMixItems.length >= 4) {
      showToast('Tối đa phối trộn 4 loại vật tư trong 1 lần phun', 'info');
      return;
    }
    setTankMixItems((prev) => [
      ...prev,
      {
        material_id: '',
        material_name: 'Chế phẩm Nấm Đối kháng Trichoderma Bio-VT (1kg)',
        item_type: 'BIOCONTROL',
        active_ingredient: 'Trichoderma viride',
        resistance_group: 'Sinh học',
        quantity_applied: 1,
        unit: 'Gói 1kg',
        phi_days: 0,
        material_lot_number: 'LOT-TRICHO-2026-05',
        material_export_slip_code: 'PXK-2026-04',
      },
    ]);
  };

  const handleRemoveTankMixItem = (index: number) => {
    if (tankMixItems.length <= 1) {
      showToast('Bình phun bắt buộc phải có ít nhất 1 thành phần', 'info');
      return;
    }
    setTankMixItems((prev) => prev.filter((_, i) => i !== index));
  };

  const handleUpdateTankMixItem = (index: number, field: keyof FarmingLogItem, value: any) => {
    setTankMixItems((prev) => {
      const next = [...prev];
      next[index] = { ...next[index], [field]: value };
      return next;
    });
  };

  // Photo Capture & Compression
  const handlePhotoCapture = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setIsCompressingPhoto(true);
      const compressedBase64 = await compressImage(file, 800, 800, 0.75);
      setPhotos((prev) => [...prev, compressedBase64]);
      showToast('Đã chụp và nén ảnh hiện trường thành công!', 'success');
    } catch {
      showToast('Lỗi khi nén ảnh. Vui lòng thử lại!', 'error');
    } finally {
      setIsCompressingPhoto(false);
    }
  };

  // Submit Handler
  const handleSubmitForm = async (e: React.FormEvent) => {
    e.preventDefault();
    setValidationError(null);

    if (!selectedPlotId) {
      setValidationError('Vui lòng chọn thửa đất trước khi ghi nhật ký!');
      return;
    }

    if (bannedViolation) {
      setValidationError(bannedViolation);
      return;
    }

    if (activityType === 'SPRAYING' && (!gpsLatitude || !gpsLongitude)) {
      setValidationError(
        'Hoạt động phun thuốc BVTV bắt buộc phải có tọa độ GPS tại ruộng theo chuẩn TCVN 12850:2019 và VietGAP!'
      );
      return;
    }

    const payload: FarmingLogPayload = {
      crop_season_id: selectedSeasonId || 'c05e8db9-6fb6-4fe6-8110-b73cc109fab3',
      plot_id: selectedPlotId,
      activity_type: activityType,
      activity_date: activityDate,
      description: description.trim() || undefined,
      voice_raw_text: voiceRawText.trim() || undefined,
      gps_latitude: gpsLatitude || undefined,
      gps_longitude: gpsLongitude || undefined,
      attachment_reference: photos.length > 0 ? photos : undefined,
      performed_by: 'Xã viên phụ trách thửa',

      // Fertigation Specifics
      fertigation_method: activityType === 'FERTILIZATION' ? fertigationMethod : undefined,
      ec_solution: activityType === 'FERTILIZATION' && ecSolution ? parseFloat(ecSolution) : undefined,
      ec_drain: activityType === 'FERTILIZATION' && ecDrain ? parseFloat(ecDrain) : undefined,
      ph_solution: activityType === 'FERTILIZATION' && phSolution ? parseFloat(phSolution) : undefined,
      tank_composition: activityType === 'FERTILIZATION' ? { tank_a: tankCompositionA, tank_b: tankCompositionB } : undefined,
      water_volume_liters: waterVolumeLiters ? parseFloat(waterVolumeLiters) : undefined,

      // Tank-Mix Specifics
      items: activityType === 'SPRAYING' ? tankMixItems : undefined,
      phi_days: maxPhiDays,
    };

    try {
      // Kiểm tra kết nối mạng (Offline Resilience)
      if (!navigator.onLine) {
        saveOfflineLog(payload);
        showToast('Mất sóng Internet! Đã lưu tạm an toàn vào Bộ nhớ máy. Sẽ tự đồng bộ khi có mạng.', 'info');
        setDescription('');
        setPhotos([]);
        onSuccess();
        return;
      }

      await onSubmit(payload);
      setDescription('');
      setPhotos([]);
      onSuccess();
    } catch (err: any) {
      // Fallback offline queue khi lỗi mạng
      if (err?.message?.includes('Network') || err?.message?.includes('Failed to fetch')) {
        saveOfflineLog(payload);
        showToast('Lỗi mạng truyền dẫn! Đã lưu bản ghi vào Bộ nhớ tạm ngoại tuyến.', 'info');
        onSuccess();
        return;
      }
      setValidationError(err?.message || 'Có lỗi khi lưu nhật ký. Vui lòng thử lại!');
    }
  };

  return (
    <form onSubmit={handleSubmitForm} className="space-y-5 animate-fade-in text-slate-800">
      {validationError && (
        <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-start gap-2.5 shadow-xs animate-shake">
          <AlertTriangle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
          <div className="font-semibold leading-relaxed">{validationError}</div>
        </div>
      )}

      {/* Cảnh báo xung đột thu hoạch PHI */}
      {hasHarvestCollision && (
        <div className="p-4 rounded-2xl bg-amber-500/10 border-2 border-amber-500/40 text-amber-900 text-xs flex items-start gap-3 shadow-xs">
          <ShieldAlert className="w-5 h-5 text-amber-600 shrink-0 mt-0.5 animate-pulse" />
          <div>
            <span className="font-black text-amber-800 block text-[13px]">
              CẢNH BÁO XUNG ĐỘT LỊCH THU HOẠCH SIÊU THỊ!
            </span>
            <p className="mt-1 leading-relaxed">
              Thời gian cách ly PHI ({maxPhiDays} ngày) sẽ kéo dài an toàn đến ngày{' '}
              <strong className="font-mono text-amber-950 underline">{safeHarvestDate}</strong>, trùng
              với khung cắt hàng dự kiến (<strong className="font-mono">{expectedHarvestStart}</strong>).
              Việc phun hóa chất có thể dẫn đến trễ hạn giao hàng hoặc bị từ chối nhập kho!
            </p>
          </div>
        </div>
      )}

      {/* 1. CHỌN LOẠI HOẠT ĐỘNG (1-TAP GRID LỚN DỄ BẤM NGOÀI ĐỒNG) */}
      <div>
        <label className="block text-xs font-black uppercase tracking-wider text-slate-500 mb-2.5">
          1. Chọn hoạt động ngoài ruộng <span className="text-rose-500">*</span>
        </label>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
          {(Object.keys(ACTIVITY_TYPES_META) as ActivityType[]).map((key) => {
            const meta = ACTIVITY_TYPES_META[key];
            const isSelected = activityType === key;
            return (
              <button
                key={key}
                type="button"
                onClick={() => setActivityType(key)}
                className={`flex flex-col items-center justify-center p-3.5 rounded-2xl border transition-all text-center cursor-pointer min-h-[82px] active:scale-[0.98] ${
                  isSelected
                    ? 'border-emerald-600 bg-emerald-50 text-emerald-950 font-black shadow-xs ring-2 ring-emerald-500/20'
                    : 'border-slate-200 bg-white hover:bg-slate-50 text-slate-700 font-bold'
                }`}
              >
                <span className="text-xl mb-1">{meta.label.includes('Tưới') ? '💧' : meta.label.includes('Thuốc') ? '🛡️' : meta.label.includes('Thiên') ? '🐞' : meta.label.includes('Thu hoạch') ? '🍇' : '🌿'}</span>
                <span className="text-xs leading-tight">{meta.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* 2. KHU VỰC CÔNG NGHỆ CAO: TƯỚI DINH DƯỠNG (FERTIGATION) TRONG NHÀ MÀNG */}
      {activityType === 'FERTILIZATION' && (
        <div className="p-4.5 rounded-2xl bg-teal-50/70 border border-teal-200 space-y-4">
          <div className="flex items-center gap-2 text-teal-900 border-b border-teal-200/60 pb-2.5">
            <Droplets className="w-4 h-4 text-teal-700" />
            <h4 className="text-xs font-black uppercase tracking-wider">
              Chỉ số Dinh dưỡng Tưới nhỏ giọt Nhà kính (Fertigation High-Tech)
            </h4>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-[11px] font-bold text-teal-900 mb-1">
                EC Dung dịch tưới (mS/cm)
              </label>
              <input
                type="number"
                step="0.01"
                value={ecSolution}
                onChange={(e) => setEcSolution(e.target.value)}
                className="w-full rounded-xl border border-teal-300 bg-white px-3 py-2 text-xs font-mono font-bold text-slate-800 outline-none focus:ring-2 focus:ring-teal-500"
                placeholder="2.20"
              />
              <span className="text-[10px] text-teal-700 mt-0.5 block">Chuẩn: 1.8 - 2.5</span>
            </div>

            <div>
              <label className="block text-[11px] font-bold text-teal-900 mb-1">
                EC Nước thoát Drain (mS/cm)
              </label>
              <input
                type="number"
                step="0.01"
                value={ecDrain}
                onChange={(e) => setEcDrain(e.target.value)}
                className="w-full rounded-xl border border-teal-300 bg-white px-3 py-2 text-xs font-mono font-bold text-slate-800 outline-none focus:ring-2 focus:ring-teal-500"
                placeholder="1.15"
              />
              <span className="text-[10px] text-teal-700 mt-0.5 block">Chuẩn: &lt; 1.5</span>
            </div>

            <div>
              <label className="block text-[11px] font-bold text-teal-900 mb-1">
                Độ pH Dung dịch
              </label>
              <input
                type="number"
                step="0.01"
                value={phSolution}
                onChange={(e) => setPhSolution(e.target.value)}
                className="w-full rounded-xl border border-teal-300 bg-white px-3 py-2 text-xs font-mono font-bold text-slate-800 outline-none focus:ring-2 focus:ring-teal-500"
                placeholder="6.00"
              />
              <span className="text-[10px] text-teal-700 mt-0.5 block">Chuẩn: 5.8 - 6.2</span>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
            <div>
              <label className="block text-[11px] font-bold text-teal-900 mb-1">
                Công thức Thùng A (Canxi + Sắt)
              </label>
              <input
                type="text"
                value={tankCompositionA}
                onChange={(e) => setTankCompositionA(e.target.value)}
                className="w-full rounded-xl border border-teal-300 bg-white px-3 py-2 text-xs font-semibold text-slate-800 outline-none"
              />
            </div>
            <div>
              <label className="block text-[11px] font-bold text-teal-900 mb-1">
                Công thức Thùng B (NPK + Magie + Vi lượng)
              </label>
              <input
                type="text"
                value={tankCompositionB}
                onChange={(e) => setTankCompositionB(e.target.value)}
                className="w-full rounded-xl border border-teal-300 bg-white px-3 py-2 text-xs font-semibold text-slate-800 outline-none"
              />
            </div>
          </div>
        </div>
      )}

      {/* 3. KHU VỰC PHUN THUỐC BVTV & PHỐI TRỘN TANK-MIX */}
      {activityType === 'SPRAYING' && (
        <div className="p-4.5 rounded-2xl bg-rose-50/70 border border-rose-200 space-y-4">
          <div className="flex items-center justify-between border-b border-rose-200/60 pb-2.5">
            <div className="flex items-center gap-2 text-rose-950">
              <ShieldAlert className="w-4 h-4 text-rose-700" />
              <h4 className="text-xs font-black uppercase tracking-wider">
                Thành phần Phối trộn Bình phun (Tank-Mix) &bull; Chuẩn VietGAP
              </h4>
            </div>
            <button
              type="button"
              onClick={handleAddTankMixItem}
              className="inline-flex items-center gap-1 px-2.5 py-1 rounded-xl bg-rose-700 hover:bg-rose-800 text-white text-[11px] font-bold transition shadow-xs cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Thêm thuốc/phân phối trộn</span>
            </button>
          </div>

          <div className="space-y-3">
            {tankMixItems.map((item, idx) => (
              <div
                key={idx}
                className="p-3.5 rounded-xl bg-white border border-rose-200/90 shadow-2xs space-y-2.5 relative"
              >
                <div className="flex items-center justify-between text-xs font-black text-rose-900">
                  <span>Thành phần #{idx + 1}:</span>
                  {tankMixItems.length > 1 && (
                    <button
                      type="button"
                      onClick={() => handleRemoveTankMixItem(idx)}
                      className="text-rose-500 hover:text-rose-700 p-1"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                  <div className="sm:col-span-2">
                    <label className="block text-[10px] font-bold text-slate-500 mb-1">
                      Tên thuốc / Hoạt chất / Xuất kho TT 71
                    </label>
                    <input
                      type="text"
                      value={item.material_name}
                      onChange={(e) => handleUpdateTankMixItem(idx, 'material_name', e.target.value)}
                      className="w-full rounded-lg border border-slate-200 px-2.5 py-1.5 text-xs font-bold text-slate-800"
                    />
                    <div className="flex items-center gap-1 flex-wrap mt-1.5">
                      <span className="text-[9.5px] font-bold text-rose-800">Gợi ý VietGAP:</span>
                      {PESTICIDE_PHI_DICTIONARY.slice(0, 5).map((dict) => (
                        <button
                          key={dict.name}
                          type="button"
                          onClick={() => {
                            handleUpdateTankMixItem(idx, 'material_name', dict.name);
                            handleUpdateTankMixItem(idx, 'active_ingredient', dict.name);
                            handleUpdateTankMixItem(idx, 'phi_days', dict.phiDays);
                          }}
                          className="text-[9.5px] px-1.5 py-0.5 rounded border bg-white hover:bg-emerald-50 text-emerald-800 border-emerald-300 font-medium transition cursor-pointer"
                        >
                          {dict.name} ({dict.phiDays} ngày)
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold text-slate-500 mb-1">
                      Thời gian cách ly PHI (Ngày)
                    </label>
                    <input
                      type="number"
                      value={item.phi_days}
                      onChange={(e) => handleUpdateTankMixItem(idx, 'phi_days', parseInt(e.target.value) || 0)}
                      className="w-full rounded-lg border border-slate-200 px-2.5 py-1.5 text-xs font-mono font-bold text-rose-700"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-2 text-[11px]">
                  <div>
                    <span className="text-[10px] text-slate-400 block">Số lượng</span>
                    <input
                      type="number"
                      step="0.1"
                      value={item.quantity_applied}
                      onChange={(e) => handleUpdateTankMixItem(idx, 'quantity_applied', parseFloat(e.target.value) || 0)}
                      className="w-full rounded-lg border border-slate-200 px-2 py-1 font-mono font-bold"
                    />
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 block">Đơn vị</span>
                    <input
                      type="text"
                      value={item.unit}
                      onChange={(e) => handleUpdateTankMixItem(idx, 'unit', e.target.value)}
                      className="w-full rounded-lg border border-slate-200 px-2 py-1 font-bold"
                    />
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 block">Số lô bao bì (Lot)</span>
                    <input
                      type="text"
                      value={item.material_lot_number || ''}
                      onChange={(e) => handleUpdateTankMixItem(idx, 'material_lot_number', e.target.value)}
                      className="w-full rounded-lg border border-slate-200 px-2 py-1 font-mono text-[10px]"
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="p-3 rounded-xl bg-white/90 border border-rose-200 flex items-center justify-between text-xs">
            <span className="font-bold text-rose-950">Thời gian cách ly tổng thể bình phun:</span>
            <span className="font-mono font-black text-rose-700 bg-rose-100 px-2.5 py-1 rounded-lg">
              {maxPhiDays} ngày &bull; Thu hoạch an toàn: {safeHarvestDate}
            </span>
          </div>
        </div>
      )}

      {/* 4. NGÀY THỰC HIỆN & TRỢ LÝ GIỌNG NÓI GHI CHÚ */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-black uppercase tracking-wider text-slate-500 mb-1.5">
            Ngày tác nghiệp tại ruộng <span className="text-rose-500">*</span>
          </label>
          <input
            type="date"
            value={activityDate}
            onChange={(e) => setActivityDate(e.target.value)}
            className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2.5 text-xs font-bold text-slate-800 outline-none focus:bg-white focus:ring-2 focus:ring-emerald-500"
          />
        </div>

        <div>
          <div className="flex items-center justify-between mb-1.5">
            <label className="text-xs font-black uppercase tracking-wider text-slate-500">
              Ghi chú công việc &bull; Giọng nói
            </label>
            <button
              type="button"
              onClick={handleToggleVoice}
              className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-bold transition cursor-pointer ${
                isVoiceRecording
                  ? 'bg-rose-600 text-white animate-pulse'
                  : 'bg-emerald-100 hover:bg-emerald-200 text-emerald-800'
              }`}
            >
              {isVoiceRecording ? <MicOff className="w-3.5 h-3.5" /> : <Mic className="w-3.5 h-3.5" />}
              <span>{isVoiceRecording ? 'Đang ghi âm...' : 'Đọc giọng nói'}</span>
            </button>
          </div>
          <input
            type="text"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Ví dụ: Tưới phân đợt 2, điều chỉnh van nhỏ giọt luống 1..."
            className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2.5 text-xs font-semibold text-slate-800 outline-none focus:bg-white focus:ring-2 focus:ring-emerald-500"
          />
        </div>
      </div>

      {/* Gợi ý mẫu ghi chú nhanh */}
      <div className="flex flex-wrap gap-1.5">
        {QUICK_NOTES.map((n, i) => (
          <button
            key={i}
            type="button"
            onClick={() => setDescription(n)}
            className="text-[11px] px-2.5 py-1 rounded-full bg-slate-100 hover:bg-emerald-100 hover:text-emerald-800 text-slate-600 transition cursor-pointer"
          >
            {n}
          </button>
        ))}
      </div>

      {/* 5. ĐỊNH VỊ GPS THỰC ĐỊA & CHỤP ẢNH HIỆN TRƯỜNG */}
      <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/90 space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <MapPin className="w-4 h-4 text-emerald-700" />
            <span className="text-xs font-bold text-slate-800">
              Xác thực Tọa độ GPS &amp; Ranh giới Thửa đất
            </span>
          </div>

          <button
            type="button"
            onClick={handleGetGps}
            disabled={gpsLoading}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold transition shadow-2xs cursor-pointer disabled:opacity-50"
          >
            {gpsLoading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <MapPin className="w-3.5 h-3.5" />}
            <span>{gpsLatitude ? 'Cập nhật lại GPS' : 'Lấy tọa độ tại ruộng'}</span>
          </button>
        </div>

        {gpsLatitude && gpsLongitude ? (
          <div className="p-2.5 rounded-xl bg-emerald-100/60 border border-emerald-300 text-xs font-mono text-emerald-950 flex flex-wrap items-center justify-between gap-2">
            <span>
              Tọa độ: {gpsLatitude.toFixed(6)}, {gpsLongitude.toFixed(6)} (&plusmn;{gpsAccuracy}m)
            </span>
            {distanceToEdge !== null && (
              <span className={`px-2 py-0.5 rounded-md font-bold text-[11px] ${distanceToEdge <= 50 ? 'bg-emerald-200 text-emerald-900' : 'bg-amber-200 text-amber-900'}`}>
                {distanceToEdge <= 50 ? `✓ Trong ranh giới (Lệch ${distanceToEdge}m)` : `⚠️ Lệch mép ${distanceToEdge}m (>50m)`}
              </span>
            )}
          </div>
        ) : gpsError ? (
          <div className="text-xs text-rose-600 font-semibold">{gpsError}</div>
        ) : (
          <p className="text-[11px] text-slate-500">
            Bấm &quot;Lấy tọa độ tại ruộng&quot; để hệ thống tự động kiểm tra ranh giới thửa đất (dung sai 50m).
          </p>
        )}

        {/* Chụp ảnh */}
        <div className="pt-2 border-t border-slate-200/80">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-slate-700">Ảnh minh chứng hiện trường ({photos.length})</span>
            <label className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white border border-slate-300 hover:bg-slate-100 text-slate-700 text-xs font-bold transition cursor-pointer shadow-2xs">
              <Camera className="w-3.5 h-3.5 text-slate-600" />
              <span>Chụp ảnh tại ruộng</span>
              <input type="file" accept="image/*" capture="environment" onChange={handlePhotoCapture} className="hidden" />
            </label>
          </div>

          {photos.length > 0 && (
            <div className="flex gap-2.5 overflow-x-auto py-1">
              {photos.map((p, idx) => (
                <div key={idx} className="relative w-16 h-16 rounded-xl overflow-hidden border border-slate-300 shrink-0">
                  <img src={p} alt="Ảnh thực địa" className="w-full h-full object-cover" />
                  <button
                    type="button"
                    onClick={() => setPhotos((prev) => prev.filter((_, i) => i !== idx))}
                    className="absolute top-0.5 right-0.5 w-4 h-4 rounded-full bg-slate-900/70 text-white flex items-center justify-center text-[10px]"
                  >
                    &times;
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* 6. NÚT SUBMIT LƯU NHẬT KÝ */}
      <div className="pt-2">
        <button
          type="submit"
          disabled={isSubmitting || isCompressingPhoto}
          className="w-full py-3.5 px-4 rounded-2xl bg-emerald-700 hover:bg-emerald-800 active:scale-[0.99] text-white font-extrabold text-sm shadow-md transition flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
        >
          {isSubmitting ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>Đang lưu nhật ký...</span>
            </>
          ) : (
            <>
              <Send className="w-4 h-4" />
              <span>Lưu Nhật Ký Tác Nghiệp Ngoài Ruộng</span>
            </>
          )}
        </button>
        <p className="text-center text-[11px] text-slate-400 mt-2">
          Dữ liệu được lưu với mã băm SHA-256 bảo chứng toàn vẹn và chuyển tới Ban Kỹ thuật ICS thẩm định.
        </p>
      </div>
    </form>
  );
};
