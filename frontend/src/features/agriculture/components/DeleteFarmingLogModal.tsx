import React from 'react';
import { AlertOctagon } from 'lucide-react';
import type { FarmingLog } from '@/types/agriculture';

interface DeleteFarmingLogModalProps {
  log: FarmingLog | null;
  onClose: () => void;
  onConfirm: () => void;
  isDeleting: boolean;
}

export const DeleteFarmingLogModal: React.FC<DeleteFarmingLogModalProps> = ({
  log,
  onClose,
  onConfirm,
  isDeleting,
}) => {
  if (!log) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-xs animate-fade-in">
      <div className="w-full max-w-md rounded-3xl bg-white p-6 shadow-2xl border border-slate-100 space-y-4">
        <div className="flex items-center gap-3 text-rose-600">
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-rose-50 border border-rose-100">
            <AlertOctagon className="h-6 w-6 stroke-[2.2]" />
          </div>
          <div>
            <h3 className="text-base font-extrabold text-slate-900">Xác nhận xóa nhật ký?</h3>
            <p className="text-xs text-slate-500">Thao tác này sẽ cập nhật trạng thái xóa nhật ký</p>
          </div>
        </div>

        <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs space-y-1">
          <div>
            <span className="text-slate-500">Mã thửa:</span>{' '}
            <strong className="text-slate-900">{log.plot_name || log.farm_plot_id}</strong>
          </div>
          <div>
            <span className="text-slate-500">Ngày thực hiện:</span>{' '}
            <strong className="text-slate-900">{log.activity_date}</strong>
          </div>
          <div>
            <span className="text-slate-500">Hoạt động:</span>{' '}
            <strong className="text-slate-900">{log.activity_type}</strong>
          </div>
        </div>

        <p className="text-xs text-rose-600 font-bold">
          Lưu ý: Dữ liệu lịch sử và chứng từ truy xuất sẽ được cập nhật đồng bộ.
        </p>

        <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-bold text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-xl cursor-pointer"
          >
            Hủy
          </button>
          <button
            onClick={onConfirm}
            disabled={isDeleting}
            className="px-5 py-2 text-xs font-black text-white bg-rose-600 hover:bg-rose-700 rounded-xl shadow-xs transition-all active:scale-98 cursor-pointer"
          >
            {isDeleting ? 'Đang xóa...' : 'Xác nhận xóa'}
          </button>
        </div>
      </div>
    </div>
  );
};
