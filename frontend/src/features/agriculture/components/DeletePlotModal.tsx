import React from 'react';
import { AlertOctagon } from 'lucide-react';
import { FarmPlot, ProductionUnit } from '@/services/farmPlotApi';

interface DeletePlotModalProps {
  plot: FarmPlot | null;
  selectedUnit: ProductionUnit | null;
  onClose: () => void;
  onConfirm: () => Promise<void>;
  isDeleting?: boolean;
}

export const DeletePlotModal: React.FC<DeletePlotModalProps> = ({
  plot,
  selectedUnit,
  onClose,
  onConfirm,
  isDeleting = false,
}) => {
  if (!plot) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 p-4 backdrop-blur-xs animate-fade-in text-[13px]"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="w-full max-w-md bg-white rounded-3xl shadow-2xl border border-slate-100 overflow-hidden p-6 space-y-4">
        <div className="flex items-center gap-3 text-rose-600">
          <div className="p-3 bg-rose-100 rounded-2xl">
            <AlertOctagon className="w-6 h-6 text-rose-600" />
          </div>
          <div>
            <h3 className="font-black text-slate-900 text-base">Xóa / Ngưng Canh Tác Thửa Đất</h3>
            <p className="text-xs text-slate-500 font-mono">Mã thửa: {plot.plot_code}</p>
          </div>
        </div>

        <div className="p-3.5 bg-rose-50/80 rounded-2xl border border-rose-200 text-xs text-rose-900 leading-relaxed">
          Bạn có chắc chắn muốn xóa thửa đất <strong>[{plot.plot_code}]</strong> (Diện tích: {plot.area} ha) khỏi
          danh sách quản lý vùng trồng <strong>{selectedUnit?.name}</strong>?
          <br />
          <span className="text-[11px] text-rose-700 italic mt-1 block">
            * Thao tác này sẽ xóa hồ sơ thửa đất khỏi vùng sản xuất và gỡ bỏ phân công xã viên tương ứng.
          </span>
        </div>

        <div className="flex items-center justify-end gap-2 pt-2">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 font-bold text-xs transition cursor-pointer"
          >
            Hủy bỏ
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={isDeleting}
            className="px-5 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs shadow-md transition disabled:opacity-60 cursor-pointer"
          >
            {isDeleting ? 'Đang xử lý...' : 'Xác nhận Xóa'}
          </button>
        </div>
      </div>
    </div>
  );
};
