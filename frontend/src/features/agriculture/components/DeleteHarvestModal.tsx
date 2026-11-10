import React from 'react';
import { AlertOctagon } from 'lucide-react';
import type { HarvestItem } from '@/types/agriculture';

interface DeleteHarvestModalProps {
  harvest: HarvestItem | null;
  onClose: () => void;
  onConfirm: () => Promise<void>;
  isDeleting?: boolean;
}

export const DeleteHarvestModal: React.FC<DeleteHarvestModalProps> = ({
  harvest,
  onClose,
  onConfirm,
  isDeleting = false,
}) => {
  if (!harvest) return null;

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
            <h3 className="font-black text-slate-900 text-base">Hủy Lệnh Thu Hoạch</h3>
            <p className="text-xs text-slate-500 font-mono">Mã lệnh: {harvest.harvest_code}</p>
          </div>
        </div>

        <div className="p-3.5 bg-rose-50/80 rounded-2xl border border-rose-200 text-xs text-rose-900 leading-relaxed">
          Bạn có chắc chắn muốn hủy lượt thu hoạch này vào ngày <strong>{harvest.harvest_date}</strong> (Sản lượng:{' '}
          {harvest.quantity_kg} kg) trên thửa đất <strong>{harvest.plot_code}</strong>?
          <br />
          <span className="text-[11px] text-rose-700 italic mt-1 block">
            * Mã lô GS1 [{harvest.lot_code}] liên quan sẽ bị thu hồi khỏi hệ thống xuất hàng.
          </span>
        </div>

        <div className="flex items-center justify-end gap-2 pt-2">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 font-bold text-xs transition cursor-pointer"
          >
            Hủy bỏ
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={isDeleting}
            className="px-5 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs shadow-md transition disabled:opacity-60 cursor-pointer"
          >
            {isDeleting ? 'Đang hủy...' : 'Xác nhận Hủy Lệnh'}
          </button>
        </div>
      </div>
    </div>
  );
};
