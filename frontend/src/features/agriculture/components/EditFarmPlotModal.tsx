import React, { useState, useEffect } from 'react';
import {
  X,
  MapPin,
  Save,
  ShieldAlert,
  ShieldCheck,
  Ruler,
  Layers,
} from 'lucide-react';
import type { FarmPlot } from '@/services/farmPlotApi';
import { updatePlot } from '@/services/farmPlotApi';
import { useToast } from '@/components/ui/ToastNotification';

interface EditFarmPlotModalProps {
  isOpen: boolean;
  onClose: () => void;
  plot: FarmPlot | null;
  unitId: string;
  onSuccess: () => void;
}

export const EditFarmPlotModal: React.FC<EditFarmPlotModalProps> = ({
  isOpen,
  onClose,
  plot,
  unitId,
  onSuccess,
}) => {
  const { showToast } = useToast();
  const [submitting, setSubmitting] = useState(false);

  const [plotCode, setPlotCode] = useState('');
  const [area, setArea] = useState('');
  const [status, setStatus] = useState('ACTIVE');
  const [safeHarvestDate, setSafeHarvestDate] = useState('');
  const [gpsCoordinates, setGpsCoordinates] = useState('');

  useEffect(() => {
    if (plot) {
      setPlotCode(plot.plot_code);
      setArea(String(plot.area));
      setStatus(plot.status);
      setSafeHarvestDate(plot.safe_harvest_date || '');
      setGpsCoordinates(plot.gps_coordinates || '');
    }
  }, [plot]);

  if (!isOpen || !plot) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!plotCode.trim() || !(Number(area) > 0)) {
      showToast('Vui lòng nhập Mã thửa đất và Diện tích (> 0)', 'error');
      return;
    }

    try {
      setSubmitting(true);
      await updatePlot(unitId, plot.id, {
        plot_code: plotCode.trim(),
        area: Number(area),
        status,
        safe_harvest_date: status === 'IN_QUARANTINE' ? safeHarvestDate : null,
        gps_coordinates: gpsCoordinates.trim() || null,
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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 p-4 sm:p-6 backdrop-blur-sm animate-fade-in text-[13px]">
      <div className="relative w-full max-w-md bg-white rounded-3xl shadow-2xl border border-slate-100 flex flex-col overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-100 bg-gradient-to-r from-emerald-50 via-white to-slate-50 flex items-center justify-between">
          <div>
            <h2 className="text-base font-black text-slate-900 tracking-tight flex items-center gap-2">
              <MapPin className="w-5 h-5 text-emerald-600" />
              Chỉnh Sửa Thửa Đất ({plot.plot_code})
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Vùng trồng: <strong className="text-slate-800">{plot.unit_name || unitId}</strong>
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
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
          </div>

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

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Tọa độ GPS hiện trường
            </label>
            <input
              type="text"
              value={gpsCoordinates}
              onChange={(e) => setGpsCoordinates(e.target.value)}
              placeholder="11.9501° N, 108.4712° E"
              className={inputCls}
            />
          </div>

          <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 font-bold text-xs transition"
            >
              Hủy
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-md transition disabled:opacity-60 flex items-center gap-1.5"
            >
              <Save className="w-4 h-4" />
              <span>{submitting ? 'Đang lưu...' : 'Lưu Thay Đổi'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
