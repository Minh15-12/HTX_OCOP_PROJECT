import React, { useState } from 'react';
import {
  X,
  Droplets,
  Plus,
  AlertTriangle,
  Beaker,
  Thermometer,
  Calendar,
  Layers,
  Save
} from 'lucide-react';
import type { FarmPlot, FarmingLogPayload } from '@/types/agriculture';
import type { CropSeason } from '@/services/cropSeasonApi';

interface FertigationEntryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (payload: FarmingLogPayload) => Promise<void>;
  season?: CropSeason;
  plots: FarmPlot[];
  selectedPlotId?: string;
}

export const FertigationEntryModal: React.FC<FertigationEntryModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  season,
  plots,
  selectedPlotId,
}) => {
  const [plotId, setPlotId] = useState<string>(selectedPlotId || plots[0]?.id || '');
  const [activityDate, setActivityDate] = useState<string>(new Date().toISOString().slice(0, 10));
  const [fertigationMethod, setFertigationMethod] = useState<'DRIP_EMITTER' | 'DRENCH' | 'FOLIAR'>('DRIP_EMITTER');
  const [ecSolution, setEcSolution] = useState<string>('');
  const [ecDrain, setEcDrain] = useState<string>('');
  const [phSolution, setPhSolution] = useState<string>('');
  const [materialName, setMaterialName] = useState<string>('');
  const [materialLotNumber, setMaterialLotNumber] = useState<string>('');
  const [materialExportSlipCode, setMaterialExportSlipCode] = useState<string>('');
  const [quantityApplied, setQuantityApplied] = useState<string>('');
  const [unit, setUnit] = useState<string>('kg');
  const [description, setDescription] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  React.useEffect(() => {
    if (isOpen) {
      setPlotId(selectedPlotId || plots[0]?.id || '');
      setActivityDate(new Date().toISOString().slice(0, 10));
      setFertigationMethod('DRIP_EMITTER');
      setEcSolution('');
      setEcDrain('');
      setPhSolution('');
      setMaterialName('');
      setMaterialLotNumber('');
      setMaterialExportSlipCode('');
      setQuantityApplied('');
      setUnit('kg');
      setDescription('');
    }
  }, [isOpen, selectedPlotId, plots]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!plotId || !season?.id) return;

    try {
      setIsSubmitting(true);
      await onSubmit({
        crop_season_id: season.id,
        plot_id: plotId,
        activity_type: 'FERTILIZATION',
        activity_date: activityDate,
        fertigation_method: fertigationMethod,
        ec_solution: ecSolution ? parseFloat(ecSolution) : undefined,
        ec_drain: ecDrain ? parseFloat(ecDrain) : undefined,
        ph_solution: phSolution ? parseFloat(phSolution) : undefined,
        material_name: materialName,
        material_lot_number: materialLotNumber,
        material_export_slip_code: materialExportSlipCode,
        quantity_applied: quantityApplied ? parseFloat(quantityApplied) : undefined,
        unit: unit,
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
            <div className="w-8 h-8 rounded-lg bg-emerald-500 text-white flex items-center justify-center font-bold">
              <Droplets className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-base">Ghi Lượt Dinh Dưỡng & Tưới Fertigation</h3>
              <p className="text-xs text-slate-400">Kiểm soát EC, pH & xuất kho theo VietGAP</p>
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
          {/* Chọn Thửa & Ngày */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Thửa đất canh tác *</label>
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
              <label className="block text-xs font-semibold text-slate-700 mb-1">Ngày tưới / châm phân *</label>
              <input
                type="date"
                value={activityDate}
                onChange={(e) => setActivityDate(e.target.value)}
                required
                className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-emerald-500"
              />
            </div>
          </div>

          {/* Phương pháp bón */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Phương pháp bón / tưới *</label>
            <div className="grid grid-cols-3 gap-2">
              {[
                { id: 'DRIP_EMITTER', label: 'Nhỏ giọt que ghim' },
                { id: 'DRENCH', label: 'Tưới gốc' },
                { id: 'FOLIAR', label: 'Phun qua lá' },
              ].map((m) => (
                <button
                  type="button"
                  key={m.id}
                  onClick={() => setFertigationMethod(m.id as any)}
                  className={`py-2 px-2 text-xs font-semibold rounded-lg border text-center transition ${
                    fertigationMethod === m.id
                      ? 'bg-emerald-50 border-emerald-600 text-emerald-800 shadow-xs'
                      : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  {m.label}
                </button>
              ))}
            </div>
          </div>

          {/* Thông số CNC: EC Tưới, EC Thoát, pH */}
          <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 space-y-3">
            <p className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
              <Beaker className="w-4 h-4 text-emerald-600" />
              Thông số kiểm soát công nghệ cao (Tự động đối chiếu)
            </p>

            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className="block text-[11px] font-medium text-slate-600 mb-1">EC Tưới (mS/cm)</label>
                <input
                  type="number"
                  step="0.1"
                  value={ecSolution}
                  onChange={(e) => setEcSolution(e.target.value)}
                  className="w-full px-2.5 py-1.5 border border-slate-200 rounded-lg text-xs font-bold font-mono focus:ring-1 focus:ring-emerald-500"
                />
              </div>

              <div>
                <label className="block text-[11px] font-medium text-slate-600 mb-1">EC Thoát / Rễ (mS/cm)</label>
                <input
                  type="number"
                  step="0.1"
                  value={ecDrain}
                  onChange={(e) => setEcDrain(e.target.value)}
                  className="w-full px-2.5 py-1.5 border border-slate-200 rounded-lg text-xs font-bold font-mono focus:ring-1 focus:ring-emerald-500"
                />
              </div>

              <div>
                <label className="block text-[11px] font-medium text-slate-600 mb-1">pH Dung Dịch (Chuẩn 5.8-6.2)</label>
                <input
                  type="number"
                  step="0.1"
                  value={phSolution}
                  onChange={(e) => setPhSolution(e.target.value)}
                  className="w-full px-2.5 py-1.5 border border-slate-200 rounded-lg text-xs font-bold font-mono focus:ring-1 focus:ring-emerald-500"
                />
              </div>
            </div>
          </div>

          {/* Tên phân bón & Số lượng */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Tên phân bón / Công thức dinh dưỡng *</label>
            <input
              type="text"
              value={materialName}
              onChange={(e) => setMaterialName(e.target.value)}
              placeholder="VD: NPK 15-5-25 + Ca-B"
              required
              className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Số lượng sử dụng *</label>
              <div className="flex gap-1.5">
                <input
                  type="number"
                  step="0.1"
                  value={quantityApplied}
                  onChange={(e) => setQuantityApplied(e.target.value)}
                  required
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm font-semibold focus:ring-2 focus:ring-emerald-500"
                />
                <select
                  value={unit}
                  onChange={(e) => setUnit(e.target.value)}
                  className="px-2 py-2 border border-slate-200 rounded-lg text-xs bg-slate-50 text-slate-700"
                >
                  <option value="kg">kg</option>
                  <option value="lít">lít</option>
                  <option value="bao">bao</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Số Lô bao bì (Lot/LSX)</label>
              <input
                type="text"
                value={materialLotNumber}
                onChange={(e) => setMaterialLotNumber(e.target.value)}
                placeholder="LOT-PB-2601"
                className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm font-mono focus:ring-2 focus:ring-emerald-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Mã phiếu xuất kho HTX</label>
            <input
              type="text"
              value={materialExportSlipCode}
              onChange={(e) => setMaterialExportSlipCode(e.target.value)}
              placeholder="PXK-HTX-0042"
              className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm font-mono focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Ghi chú kỹ thuật</label>
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
              className="flex-1 py-2.5 text-sm font-bold bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl shadow-md transition"
            >
              {isSubmitting ? 'Đang lưu...' : 'Lưu Lượt Dinh Dưỡng'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
