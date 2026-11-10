import React from 'react';
import { Lock, ShieldAlert, X } from 'lucide-react';
import { CropSeason } from '@/services/cropSeasonApi';

interface CloseSeasonModalProps {
  season: CropSeason | null;
  onClose: () => void;
  onConfirm: () => Promise<void>;
  isSubmitting?: boolean;
}

export const CloseSeasonModal: React.FC<CloseSeasonModalProps> = ({
  season,
  onClose,
  onConfirm,
  isSubmitting = false,
}) => {
  if (!season) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 p-4 backdrop-blur-xs animate-fade-in text-[13px]"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="w-full max-w-md bg-white rounded-3xl shadow-2xl border border-slate-100 overflow-hidden p-6 space-y-4">
        <div className="flex items-center gap-3 text-amber-600">
          <div className="p-3 bg-amber-100 rounded-2xl">
            <Lock className="w-6 h-6 text-amber-700" />
          </div>
          <div>
            <h3 className="font-black text-slate-900 text-base">Đóng & Kết Thúc Mùa Vụ</h3>
            <p className="text-xs text-slate-500 font-mono">Quy tắc nghiệp vụ BR-FARM-002</p>
          </div>
        </div>

        <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200 text-xs space-y-1 text-slate-700">
          <div>
            Mùa vụ: <strong className="text-slate-900">{season.name}</strong>
          </div>
          <div>
            Vùng sản xuất:{' '}
            <strong className="text-slate-900">{season.unit_name || season.production_unit_id}</strong>
          </div>
          <div>
            Cây trồng: <strong className="text-slate-900">{season.crop}</strong>
          </div>
          <div>
            Thời gian:{' '}
            <span className="font-mono text-slate-600">
              {season.start_date} → {season.expected_end_date}
            </span>
          </div>
        </div>

        <div className="p-3.5 bg-amber-50/80 rounded-2xl border border-amber-300 text-xs text-amber-900 leading-relaxed space-y-2">
          <div className="flex items-center gap-2 font-bold text-amber-950">
            <ShieldAlert className="w-4 h-4 text-amber-700 shrink-0" />
            Lưu ý quan trọng trước khi đóng mùa vụ:
          </div>
          <ul className="list-disc pl-5 space-y-1 text-[11.5px] text-amber-800">
            <li>Tất cả đợt thu hoạch KCS và phiếu cân sẽ được chốt số liệu cuối cùng.</li>
            <li>Hệ thống chuyển trạng thái mùa vụ sang <strong>COMPLETED (Đã kết thúc)</strong>.</li>
            <li>
              Dữ liệu sẽ sẵn sàng để Kế toán HTX thực hiện <strong>Quyết toán & Cấn trừ nợ vật tư</strong> cho xã viên.
            </li>
          </ul>
        </div>

        <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
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
            disabled={isSubmitting}
            className="px-5 py-2 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs shadow-md transition disabled:opacity-60 cursor-pointer"
          >
            {isSubmitting ? 'Đang xử lý...' : 'Xác nhận Đóng Mùa Vụ'}
          </button>
        </div>
      </div>
    </div>
  );
};
