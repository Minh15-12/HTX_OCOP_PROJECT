import React, { useState } from 'react';
import {
  X,
  ShieldAlert,
  Bug,
  Search,
  AlertTriangle,
  Clock,
  Sparkles,
  CheckCircle2,
  Calendar,
  Layers,
  Save,
  ShieldCheck
} from 'lucide-react';
import type { FarmPlot, FarmingLogPayload, ActivityType } from '@/types/agriculture';
import type { CropSeason } from '@/services/cropSeasonApi';

interface IpmPestEntryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (payload: FarmingLogPayload) => Promise<void>;
  season?: CropSeason;
  plots: FarmPlot[];
  selectedPlotId?: string;
}

export const IpmPestEntryModal: React.FC<IpmPestEntryModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  season,
  plots,
  selectedPlotId,
}) => {
  const [plotId, setPlotId] = useState<string>(selectedPlotId || plots[0]?.id || '');
  const [activityDate, setActivityDate] = useState<string>(new Date().toISOString().slice(0, 10));
  const [activityType, setActivityType] = useState<ActivityType>('SPRAYING');

  // IPM Scouting State
  const [isCleanPest, setIsCleanPest] = useState<boolean>(true);
  const [pestTarget, setPestTarget] = useState<string>('');
  const [pestDensity, setPestDensity] = useState<string>('KHÔNG_PHÁT_HIỆN');

  // Biocontrol State
  const [biocontrolAgentName, setBiocontrolAgentName] = useState<string>('');
  const [biocontrolReleaseRate, setBiocontrolReleaseRate] = useState<string>('');

  // Chemical Spraying State
  const [materialName, setMaterialName] = useState<string>('');
  const [activeIngredient, setActiveIngredient] = useState<string>('');
  const [resistanceGroup, setResistanceGroup] = useState<string>('');
  const [phiDays, setPhiDays] = useState<number>(0);
  const [materialLotNumber, setMaterialLotNumber] = useState<string>('');
  const [materialExportSlipCode, setMaterialExportSlipCode] = useState<string>('');
  const [quantityApplied, setQuantityApplied] = useState<string>('');
  const [unit, setUnit] = useState<string>('ml');
  const [waterVolumeLiters, setWaterVolumeLiters] = useState<string>('');
  const [description, setDescription] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  React.useEffect(() => {
    if (isOpen) {
      setPlotId(selectedPlotId || plots[0]?.id || '');
      setActivityDate(new Date().toISOString().slice(0, 10));
      setActivityType('SPRAYING');
      setIsCleanPest(true);
      setPestTarget('');
      setPestDensity('KHÔNG_PHÁT_HIỆN');
      setBiocontrolAgentName('');
      setBiocontrolReleaseRate('');
      setMaterialName('');
      setActiveIngredient('');
      setResistanceGroup('');
      setPhiDays(0);
      setMaterialLotNumber('');
      setMaterialExportSlipCode('');
      setQuantityApplied('');
      setUnit('ml');
      setWaterVolumeLiters('');
      setDescription('');
    }
  }, [isOpen, selectedPlotId, plots]);

  if (!isOpen) return null;

  const handleCleanPestToggle = (clean: boolean) => {
    setIsCleanPest(clean);
    if (clean) {
      setPestDensity('KHÔNG_PHÁT_HIỆN');
    } else {
      setPestDensity('1.2 con/lá (Dưới ngưỡng phòng trừ)');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!plotId || !season?.id) return;

    try {
      setIsSubmitting(true);
      await onSubmit({
        crop_season_id: season.id,
        plot_id: plotId,
        activity_type: activityType,
        activity_date: activityDate,
        pest_target: pestTarget,
        pest_density: activityType === 'IPM_SCOUTING' ? (isCleanPest ? 'KHÔNG_PHÁT_HIỆN' : pestDensity) : undefined,
        biocontrol_agent_name: activityType === 'BIOCONTROL' ? biocontrolAgentName : undefined,
        biocontrol_release_rate: activityType === 'BIOCONTROL' ? biocontrolReleaseRate : undefined,
        material_name: activityType === 'SPRAYING' ? materialName : (activityType === 'BIOCONTROL' ? biocontrolAgentName : undefined),
        active_ingredient: activityType === 'SPRAYING' ? activeIngredient : undefined,
        resistance_group: activityType === 'SPRAYING' ? resistanceGroup : undefined,
        phi_days: activityType === 'SPRAYING' ? phiDays : undefined,
        material_lot_number: activityType === 'SPRAYING' ? materialLotNumber : undefined,
        material_export_slip_code: activityType === 'SPRAYING' ? materialExportSlipCode : undefined,
        quantity_applied: activityType === 'SPRAYING' ? parseFloat(quantityApplied) : undefined,
        unit: unit,
        water_volume_liters: waterVolumeLiters ? parseFloat(waterVolumeLiters) : undefined,
        description: description,
      });
      onClose();
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
      <div className="bg-white rounded-2xl max-w-lg w-full shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-rose-600 text-white flex items-center justify-center font-bold">
              <ShieldAlert className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-base">Ghi Nhận IPM, Thiên Địch & Thuốc BVTV</h3>
              <p className="text-xs text-slate-400">Đúng 4 đúng & Kiểm soát cách ly PHI</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1 rounded-lg transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 overflow-y-auto flex-1 text-sm">
          {/* Phân loại thao tác */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">Phân loại hoạt động bảo vệ thực vật *</label>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => setActivityType('IPM_SCOUTING')}
                className={`py-2 px-2 text-xs font-semibold rounded-lg border text-center transition ${
                  activityType === 'IPM_SCOUTING'
                    ? 'bg-purple-50 border-purple-600 text-purple-800 shadow-xs'
                    : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                }`}
              >
                🔍 Điều tra IPM
              </button>
              <button
                type="button"
                onClick={() => setActivityType('BIOCONTROL')}
                className={`py-2 px-2 text-xs font-semibold rounded-lg border text-center transition ${
                  activityType === 'BIOCONTROL'
                    ? 'bg-teal-50 border-teal-600 text-teal-800 shadow-xs'
                    : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                }`}
              >
                🐛 Thả Thiên Địch
              </button>
              <button
                type="button"
                onClick={() => setActivityType('SPRAYING')}
                className={`py-2 px-2 text-xs font-semibold rounded-lg border text-center transition ${
                  activityType === 'SPRAYING'
                    ? 'bg-rose-50 border-rose-600 text-rose-800 shadow-xs'
                    : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                }`}
              >
                🛡️ Thuốc BVTV
              </button>
            </div>
          </div>

          {/* Chọn Thửa & Ngày */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Thửa đất *</label>
              <select
                value={plotId}
                onChange={(e) => setPlotId(e.target.value)}
                required
                className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm bg-white focus:ring-2 focus:ring-emerald-500"
              >
                {plots.map((p) => (
                  <option key={p.id} value={p.id}>
                    Thửa {p.plot_code}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Ngày thực hiện *</label>
              <input
                type="date"
                value={activityDate}
                onChange={(e) => setActivityDate(e.target.value)}
                required
                className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-emerald-500"
              />
            </div>
          </div>

          {/* Trường riêng cho Điều Tra IPM */}
          {activityType === 'IPM_SCOUTING' && (
            <div className="p-4 bg-purple-50/60 rounded-xl border border-purple-200 space-y-3">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-purple-900">Kết quả điều tra sâu bệnh</label>
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="cleanPest"
                    checked={isCleanPest}
                    onChange={(e) => handleCleanPestToggle(e.target.checked)}
                    className="rounded text-purple-600 focus:ring-purple-500"
                  />
                  <label htmlFor="cleanPest" className="text-xs font-semibold text-purple-800 cursor-pointer">
                    Không phát hiện sâu bệnh (Sạch)
                  </label>
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">Đối tượng sinh vật hại theo dõi</label>
                <input
                  type="text"
                  value={pestTarget}
                  onChange={(e) => setPestTarget(e.target.value)}
                  className="w-full px-3 py-1.5 border border-slate-200 rounded-lg text-xs"
                />
              </div>

              {!isCleanPest && (
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">Mật độ / Tỷ lệ hại thực tế</label>
                  <input
                    type="text"
                    value={pestDensity}
                    onChange={(e) => setPestDensity(e.target.value)}
                    placeholder="Ví dụ: 1.2 con/lá (Dưới ngưỡng)"
                    className="w-full px-3 py-1.5 border border-slate-200 rounded-lg text-xs font-mono"
                  />
                </div>
              )}
            </div>
          )}

          {/* Trường riêng cho Thả Thiên Địch (Biocontrol) */}
          {activityType === 'BIOCONTROL' && (
            <div className="p-4 bg-teal-50/60 rounded-xl border border-teal-200 space-y-3">
              <div className="flex items-start gap-2 text-xs text-teal-900">
                <Clock className="w-4 h-4 text-teal-600 flex-shrink-0 mt-0.5" />
                <span>
                  <strong>Quy tắc IPM Sinh học:</strong> Thả thiên địch bắt buộc ngưng phun thuốc hóa học ít nhất 21 ngày để bảo toàn quần thể thiên địch.
                </span>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">Tên loài thiên địch sinh học *</label>
                <select
                  value={biocontrolAgentName}
                  onChange={(e) => setBiocontrolAgentName(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs bg-white"
                >
                  <option value="Amblyseius swirskii (Nhện bắt mồi)">Amblyseius swirskii (Nhện bắt mồi bọ trĩ)</option>
                  <option value="Phytoseiulus persimilis (Bọ săn nhện đỏ)">Phytoseiulus persimilis (Bọ săn nhện đỏ)</option>
                  <option value="Orius insidiosus (Bọ xít bắt mồi)">Orius insidiosus (Bọ xít bắt mồi)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">Mật độ thả</label>
                <input
                  type="text"
                  value={biocontrolReleaseRate}
                  onChange={(e) => setBiocontrolReleaseRate(e.target.value)}
                  className="w-full px-3 py-1.5 border border-slate-200 rounded-lg text-xs"
                />
              </div>
            </div>
          )}

          {/* Trường riêng cho Thuốc BVTV (Chemical Spraying) */}
          {activityType === 'SPRAYING' && (
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Tên thuốc thương phẩm *</label>
                  <input
                    type="text"
                    value={materialName}
                    onChange={(e) => setMaterialName(e.target.value)}
                    placeholder="VD: Radiant 60SC..."
                    required
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Tên hoạt chất chính *</label>
                  <input
                    type="text"
                    value={activeIngredient}
                    onChange={(e) => setActiveIngredient(e.target.value)}
                    placeholder="VD: Spinetoram 60g/L"
                    required
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm font-medium"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Nhóm IRAC / FRAC (Chống kháng)</label>
                  <input
                    type="text"
                    value={resistanceGroup}
                    onChange={(e) => setResistanceGroup(e.target.value)}
                    placeholder="IRAC 5"
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs font-mono"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Thời gian cách ly PHI (ngày) *</label>
                  <input
                    type="number"
                    value={phiDays}
                    onChange={(e) => setPhiDays(Number(e.target.value))}
                    required
                    min={0}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm font-bold text-rose-700"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Số Lô thuốc (Lot/LSX)</label>
                  <input
                    type="text"
                    value={materialLotNumber}
                    onChange={(e) => setMaterialLotNumber(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs font-mono"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Mã phiếu xuất kho HTX</label>
                  <input
                    type="text"
                    value={materialExportSlipCode}
                    onChange={(e) => setMaterialExportSlipCode(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Lượng thuốc</label>
                  <input
                    type="number"
                    value={quantityApplied}
                    onChange={(e) => setQuantityApplied(e.target.value)}
                    className="w-full px-2.5 py-1.5 border border-slate-200 rounded-lg text-xs font-semibold"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Đơn vị</label>
                  <select
                    value={unit}
                    onChange={(e) => setUnit(e.target.value)}
                    className="w-full px-2 py-1.5 border border-slate-200 rounded-lg text-xs bg-slate-50"
                  >
                    <option value="ml">ml</option>
                    <option value="gam">gam</option>
                    <option value="lít">lít</option>
                    <option value="gói">gói</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Lượng nước (L)</label>
                  <input
                    type="number"
                    value={waterVolumeLiters}
                    onChange={(e) => setWaterVolumeLiters(e.target.value)}
                    className="w-full px-2.5 py-1.5 border border-slate-200 rounded-lg text-xs"
                  />
                </div>
              </div>
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Mô tả / Ngưỡng phòng trừ</label>
            <textarea
              rows={2}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          {/* Footer buttons */}
          <div className="flex items-center gap-3 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2.5 text-sm font-medium text-slate-600 hover:bg-slate-100 rounded-xl transition"
            >
              Hủy
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex-1 py-2.5 text-sm font-bold bg-rose-600 hover:bg-rose-700 text-white rounded-xl shadow-md transition"
            >
              {isSubmitting ? 'Đang lưu...' : 'Lưu Bản Ghi IPM / BVTV'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
