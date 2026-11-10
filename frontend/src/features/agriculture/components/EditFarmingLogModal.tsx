import React, { useState, useEffect } from 'react';
import {
  X,
  Calendar,
  Layers,
  Package,
  ShieldAlert,
  ShieldCheck,
  CheckCircle,
  Save,
  Clock,
  User,
} from 'lucide-react';
import type { FarmingLog, ActivityType } from '@/types/agriculture';
import { updateFarmingLog, calculateSafeHarvestDate } from '@/services/farmingLogApi';
import { useToast } from '@/components/ui/ToastNotification';

interface EditFarmingLogModalProps {
  isOpen: boolean;
  onClose: () => void;
  log: FarmingLog | null;
  onSuccess: () => void;
}

export const EditFarmingLogModal: React.FC<EditFarmingLogModalProps> = ({
  isOpen,
  onClose,
  log,
  onSuccess,
}) => {
  const { showToast } = useToast();
  const [submitting, setSubmitting] = useState(false);

  // Form State
  const [activityDate, setActivityDate] = useState('');
  const [activityType, setActivityType] = useState<ActivityType>('CARE');
  const [description, setDescription] = useState('');
  const [materialName, setMaterialName] = useState('');
  const [materialSku, setMaterialSku] = useState('');
  const [materialBatchNumber, setMaterialBatchNumber] = useState('');
  const [quantityApplied, setQuantityApplied] = useState('');
  const [unit, setUnit] = useState('Lít');
  const [phiDays, setPhiDays] = useState(0);
  const [performerName, setPerformerName] = useState('');

  useEffect(() => {
    if (log) {
      setActivityDate(log.activity_date);
      setActivityType(log.activity_type);
      setDescription(log.description || '');
      setMaterialName(log.material_name || '');
      setMaterialSku(log.material_sku || '');
      setMaterialBatchNumber(log.material_batch_number || '');
      setQuantityApplied(log.quantity_applied ? String(log.quantity_applied) : '');
      setUnit(log.unit || 'Lít');
      setPhiDays(log.phi_days || 0);
      setPerformerName(log.performer_name || log.performed_by || '');
    }
  }, [log]);

  if (!isOpen || !log) return null;

  const liveSafeDate = calculateSafeHarvestDate(activityDate, phiDays);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activityDate) {
      showToast('Vui lòng chọn ngày thực hiện', 'error');
      return;
    }

    try {
      setSubmitting(true);
      await updateFarmingLog(log.id, {
        activity_date: activityDate,
        activity_type: activityType,
        description,
        material_name: materialName || undefined,
        material_sku: materialSku || undefined,
        material_batch_number: materialBatchNumber || undefined,
        quantity_applied: quantityApplied ? parseFloat(quantityApplied) : undefined,
        unit,
        phi_days: phiDays,
        performed_by: performerName,
      });

      showToast('Cập nhật nhật ký canh tác thành công!', 'success');
      onSuccess();
      onClose();
    } catch (err: any) {
      showToast(err.message || 'Cập nhật nhật ký canh tác thất bại', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const inputCls =
    'w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-semibold text-slate-800 outline-none transition focus:border-emerald-500 focus:bg-white focus:ring-2 focus:ring-emerald-500/20';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 p-4 sm:p-6 backdrop-blur-sm animate-fade-in text-[13px]">
      <div className="relative w-full max-w-xl max-h-[90vh] bg-white rounded-3xl shadow-2xl border border-slate-100 flex flex-col overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-100 bg-gradient-to-r from-emerald-50 via-white to-slate-50 flex items-center justify-between">
          <div>
            <h2 className="text-base font-black text-slate-900 tracking-tight flex items-center gap-2">
              <Layers className="w-5 h-5 text-emerald-600" />
              Chỉnh Sửa Nhật Ký Canh Tác (Mã: {log.id})
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Thửa đất: <strong className="text-slate-800">{log.plot_code}</strong> • {log.plot_name}
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
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Ngày thực hiện <span className="text-rose-500">*</span>
              </label>
              <input
                type="date"
                value={activityDate}
                onChange={(e) => setActivityDate(e.target.value)}
                className={inputCls}
                required
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Loại hoạt động canh tác <span className="text-rose-500">*</span>
              </label>
              <select
                value={activityType}
                onChange={(e) => setActivityType(e.target.value as ActivityType)}
                className={inputCls}
              >
                <option value="LAND_PREPARATION">Làm đất & Xử lý giá thể</option>
                <option value="FERTILIZATION">Bón phân & Dinh dưỡng</option>
                <option value="SPRAYING">Phun thuốc BVTV & Chế phẩm</option>
                <option value="CARE">Chăm sóc & Tỉa cành</option>
                <option value="HARVEST">Thu hoạch</option>
              </select>
            </div>
          </div>

          {/* Vật tư */}
          <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200 space-y-3">
            <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
              <Package className="w-4 h-4 text-emerald-600" />
              Thông tin vật tư & Chế phẩm
            </h4>

            <div>
              <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                Tên vật tư / phân bón / thuốc BVTV
              </label>
              <input
                type="text"
                value={materialName}
                onChange={(e) => setMaterialName(e.target.value)}
                placeholder="VD: Chế phẩm sinh học Bio-Tricho"
                className={inputCls}
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                  Mã SKU vật tư
                </label>
                <input
                  type="text"
                  value={materialSku}
                  onChange={(e) => setMaterialSku(e.target.value)}
                  placeholder="SKU-BIO-TRICHO-500ML"
                  className={inputCls}
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                  Số lô sản xuất vật tư
                </label>
                <input
                  type="text"
                  value={materialBatchNumber}
                  onChange={(e) => setMaterialBatchNumber(e.target.value)}
                  placeholder="LOT-BIO-2026-88"
                  className={inputCls}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                  Khối lượng / Thể tích
                </label>
                <input
                  type="number"
                  step="0.1"
                  value={quantityApplied}
                  onChange={(e) => setQuantityApplied(e.target.value)}
                  placeholder="2.5"
                  className={inputCls}
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                  Đơn vị tính
                </label>
                <select
                  value={unit}
                  onChange={(e) => setUnit(e.target.value)}
                  className={inputCls}
                >
                  <option value="Lít">Lít</option>
                  <option value="Kg">Kg</option>
                  <option value="Chai">Chai</option>
                  <option value="Gói">Gói</option>
                  <option value="Cuộn">Cuộn</option>
                </select>
              </div>
            </div>
          </div>

          {/* PHI Guard */}
          <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200 space-y-3">
            <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              Kiểm soát cách ly an toàn (PHI)
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                  Số ngày cách ly (PHI)
                </label>
                <input
                  type="number"
                  min="0"
                  max="60"
                  value={phiDays}
                  onChange={(e) => setPhiDays(parseInt(e.target.value, 10) || 0)}
                  className={inputCls}
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                  Ngày an toàn có thể thu hoạch
                </label>
                <div className="px-3 py-2 bg-emerald-50 rounded-xl border border-emerald-200 text-xs font-extrabold text-emerald-800">
                  {liveSafeDate}
                </div>
              </div>
            </div>
          </div>

          {/* Performer & Notes */}
          <div className="space-y-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Người thực hiện / Cán bộ kỹ thuật
              </label>
              <input
                type="text"
                value={performerName}
                onChange={(e) => setPerformerName(e.target.value)}
                placeholder="Nguyễn Văn An"
                className={inputCls}
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Mô tả chi tiết công việc
              </label>
              <textarea
                rows={3}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Ghi nhận phương thức thao tác, tình trạng cây trồng..."
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-medium text-slate-800 outline-none transition focus:border-emerald-500 focus:bg-white focus:ring-2 focus:ring-emerald-500/20"
              />
            </div>
          </div>

          {/* Footer inside form */}
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
