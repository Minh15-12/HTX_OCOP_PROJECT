import React, { useState } from 'react';
import { X, Plus, Trash2, AlertCircle, ClipboardCheck, ArrowRight, Loader2 } from 'lucide-react';
import { Material } from '../../../types/inventory';
import { inventoryApi } from '@/services/inventoryApi';
import { useToast } from '@/components/ui/ToastNotification';

interface CreateStockCountModalProps {
  isOpen: boolean;
  onClose: () => void;
  materials: Material[];
  onSuccess: () => void;
}

interface CountLineState {
  materialId: string;
  actualQuantity: number;
  reason: string;
}

export const CreateStockCountModal: React.FC<CreateStockCountModalProps> = ({
  isOpen,
  onClose,
  materials,
  onSuccess,
}) => {
  const { showToast } = useToast();
  const [countDate, setCountDate] = useState<string>(new Date().toISOString().slice(0, 10));
  const [reason, setReason] = useState<string>('');
  const [lines, setLines] = useState<CountLineState[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  React.useEffect(() => {
    if (isOpen) {
      setCountDate(new Date().toISOString().slice(0, 10));
      setReason('');
      setLines([]);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleAddLine = () => {
    const unselected = materials.find((m) => !lines.some((l) => l.materialId === m.id));
    if (unselected) {
      setLines([...lines, { materialId: unselected.id, actualQuantity: unselected.stockQty || 0, reason: '' }]);
    } else if (materials.length > 0) {
      setLines([...lines, { materialId: materials[0].id, actualQuantity: materials[0].stockQty || 0, reason: '' }]);
    }
  };

  const handleRemoveLine = (idx: number) => {
    setLines(lines.filter((_, i) => i !== idx));
  };

  const handleUpdateLine = (idx: number, patch: Partial<CountLineState>) => {
    setLines(lines.map((line, i) => (i === idx ? { ...line, ...patch } : line)));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (lines.length === 0) {
      alert('Vui lòng chọn ít nhất 1 mặt hàng để kiểm kê');
      return;
    }

    try {
      setIsSubmitting(true);
      await inventoryApi.createStockCount({
        count_date: countDate,
        reason: reason.trim(),
        lines: lines.map((l) => ({
          material_id: l.materialId,
          actual_quantity: Number(l.actualQuantity),
          reason: l.reason ? l.reason.trim() : undefined,
        })),
      });

      showToast('Khởi tạo đợt kiểm kê kho thành công!');
      onSuccess();
      onClose();
    } catch (err: any) {
      const msg = err.response?.data?.message || err.message || 'Lỗi khi tạo phiếu kiểm kê';
      showToast(`Lỗi: ${msg}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 animate-fade-in text-[13px]"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget && !isSubmitting) onClose();
      }}
    >
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-3xl p-6 space-y-4 max-h-[90vh] flex flex-col overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between border-b pb-3 border-slate-200 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center">
              <ClipboardCheck className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-black text-slate-900 text-sm">Lập đợt kiểm kê kho vật tư</h3>
              <p className="text-xs text-slate-500">Đối chiếu thực tế và tự động tính chênh lệch tồn kho</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            disabled={isSubmitting}
            className="p-1 text-slate-400 hover:text-slate-700 cursor-pointer disabled:opacity-50"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto space-y-4 pr-1">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-700 font-bold mb-1 text-xs">Ngày kiểm kê *</label>
              <input
                type="date"
                value={countDate}
                onChange={(e) => setCountDate(e.target.value)}
                required
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-medium text-slate-800 text-xs focus:ring-2 focus:ring-emerald-500/20"
              />
            </div>
            <div>
              <label className="block text-slate-700 font-bold mb-1 text-xs">Mục đích / Ghi chú đợt kiểm kê</label>
              <input
                type="text"
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                placeholder="VD: Kiểm kê định kỳ chốt mùa vụ..."
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-medium text-slate-800 text-xs focus:ring-2 focus:ring-emerald-500/20"
              />
            </div>
          </div>

          {/* Lines Table */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-slate-800 font-bold text-xs">
                Danh sách vật tư kiểm đếm ({lines.length} mặt hàng)
              </label>
              <button
                type="button"
                onClick={handleAddLine}
                className="inline-flex items-center gap-1 text-xs font-bold text-emerald-700 hover:text-emerald-800 cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" /> Thêm mặt hàng
              </button>
            </div>

            <div className="border border-slate-200 rounded-xl overflow-hidden">
              <table className="w-full text-left text-xs border-collapse">
                <thead className="bg-slate-50 border-b border-slate-200 font-bold text-slate-600">
                  <tr>
                    <th className="py-2.5 px-3">Tên vật tư</th>
                    <th className="py-2.5 px-3 text-right">Tồn sổ sách</th>
                    <th className="py-2.5 px-3 text-right w-28">Thực tế đếm</th>
                    <th className="py-2.5 px-3 text-right">Chênh lệch</th>
                    <th className="py-2.5 px-3">Lý do lệch (nếu có)</th>
                    <th className="py-2.5 px-2 text-center w-10"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-medium">
                  {lines.map((line, idx) => {
                    const mat = materials.find((m) => m.id === line.materialId);
                    const bookQty = mat ? mat.stockQty : 0;
                    const diff = Number(line.actualQuantity) - bookQty;
                    return (
                      <tr key={idx} className="hover:bg-slate-50/60">
                        <td className="py-2 px-3">
                          <select
                            value={line.materialId}
                            onChange={(e) => {
                              const newMat = materials.find((m) => m.id === e.target.value);
                              handleUpdateLine(idx, {
                                materialId: e.target.value,
                                actualQuantity: newMat ? newMat.stockQty : 0,
                              });
                            }}
                            className="w-full p-1.5 bg-white border border-slate-200 rounded-lg font-bold text-slate-800 text-xs"
                          >
                            {materials.map((m) => (
                              <option key={m.id} value={m.id}>
                                {m.name} ({m.unit})
                              </option>
                            ))}
                          </select>
                        </td>
                        <td className="py-2 px-3 text-right font-mono text-slate-600 font-bold">
                          {bookQty} {mat?.unit}
                        </td>
                        <td className="py-2 px-3 text-right">
                          <input
                            type="number"
                            min="0"
                            step="0.01"
                            value={line.actualQuantity}
                            onChange={(e) =>
                              handleUpdateLine(idx, { actualQuantity: parseFloat(e.target.value) || 0 })
                            }
                            required
                            className="w-full p-1.5 bg-white border border-slate-200 rounded-lg text-right font-mono font-bold text-xs focus:ring-1 focus:ring-emerald-500"
                          />
                        </td>
                        <td className="py-2 px-3 text-right font-mono font-black">
                          <span
                            className={
                              diff === 0
                                ? 'text-slate-400'
                                : diff > 0
                                ? 'text-emerald-700'
                                : 'text-rose-600'
                            }
                          >
                            {diff > 0 ? `+${diff.toFixed(2)}` : diff.toFixed(2)}
                          </span>
                        </td>
                        <td className="py-2 px-3">
                          <input
                            type="text"
                            placeholder="Ghi nhận nguyên nhân..."
                            value={line.reason}
                            onChange={(e) => handleUpdateLine(idx, { reason: e.target.value })}
                            className="w-full p-1.5 bg-white border border-slate-200 rounded-lg text-xs"
                          />
                        </td>
                        <td className="py-2 px-2 text-center">
                          {lines.length > 1 && (
                            <button
                              type="button"
                              onClick={() => handleRemoveLine(idx)}
                              className="p-1 text-slate-400 hover:text-rose-600 rounded cursor-pointer"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* Footer Actions */}
          <div className="flex items-center justify-between pt-3 border-t border-slate-100 shrink-0">
            <div className="text-xs text-slate-500">
              Tổng số mặt hàng đếm: <strong className="text-slate-800">{lines.length}</strong>
            </div>

            <div className="flex gap-2">
              <button
                type="button"
                onClick={onClose}
                disabled={isSubmitting}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl cursor-pointer disabled:opacity-50"
              >
                Hủy
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-5 py-2 bg-emerald-700 hover:bg-emerald-800 text-white font-extrabold text-xs rounded-xl shadow-xs cursor-pointer active:scale-98 disabled:opacity-50 flex items-center gap-1.5"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" /> Đang lưu phiếu kiểm kê...
                  </>
                ) : (
                  'Tạo phiếu kiểm kê'
                )}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
