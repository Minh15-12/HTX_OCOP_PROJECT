import React, { useState } from 'react';
import { X, Wheat, Sparkles } from 'lucide-react';
import { CropSeason } from '@/services/cropSeasonApi';
import { Member } from '@/types/memberTypes';
import { SettleSeasonPayload } from '@/services/financeApi';

const money = (n: number) => (n || 0).toLocaleString('vi-VN') + ' ₫';

interface SeasonSettlementModalProps {
  isOpen: boolean;
  seasons: CropSeason[];
  members: Member[];
  onClose: () => void;
  onSubmit: (payload: SettleSeasonPayload) => void;
  isSubmitting?: boolean;
}

export const SeasonSettlementModal: React.FC<SeasonSettlementModalProps> = ({
  isOpen,
  seasons,
  members,
  onClose,
  onSubmit,
  isSubmitting = false,
}) => {
  const [formData, setFormData] = useState<SettleSeasonPayload>({
    season_id: seasons[0]?.id || '',
    member_id: members[0]?.id || '',
    grade_a_price: 0,
    grade_b_price: 0,
    service_fee_rate: 0.025,
  });

  React.useEffect(() => {
    if (isOpen) {
      setFormData({
        season_id: seasons[0]?.id || '',
        member_id: members[0]?.id || '',
        grade_a_price: 0,
        grade_b_price: 0,
        service_fee_rate: 0.025,
      });
    }
  }, [isOpen, seasons, members]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <div
      className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fade-in"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="bg-white rounded-2xl max-w-lg w-full p-6 space-y-4 shadow-2xl border border-slate-100 max-h-[92vh] overflow-y-auto">
        <div className="flex items-center justify-between border-b pb-3 border-slate-200">
          <div className="flex items-center gap-2 text-emerald-800">
            <Wheat className="w-5 h-5 text-emerald-600" />
            <div>
              <h3 className="text-base font-extrabold text-slate-900">
                Chốt Quyết Toán Mùa Vụ Nông Sản
              </h3>
              <p className="text-xs text-slate-500">
                Khấu trừ nợ vật tư trả chậm từ tiền thu mua nông sản theo phẩm cấp KCS
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3.5 text-xs">
          <div>
            <label className="block font-bold text-slate-700 mb-1">Mùa vụ canh tác *</label>
            <select
              value={formData.season_id}
              onChange={(e) => setFormData({ ...formData, season_id: e.target.value })}
              className="w-full px-3 py-2 border border-slate-300 rounded-xl font-bold text-slate-800 bg-slate-50 focus:bg-white text-xs"
              required
            >
              {seasons.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name} ({s.crop}) — {s.status}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block font-bold text-slate-700 mb-1">Xã viên quyết toán *</label>
            <select
              value={formData.member_id}
              onChange={(e) => setFormData({ ...formData, member_id: e.target.value })}
              className="w-full px-3 py-2 border border-slate-300 rounded-xl font-bold text-slate-800 bg-slate-50 focus:bg-white text-xs"
              required
            >
              {members.map((m) => (
                <option key={m.id} value={m.id}>
                  {m.full_name} ({m.member_code}) — Vốn góp: {money(m.total_capital_contributed || 0)}
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-bold text-slate-700 mb-1">Đơn giá Loại A (đ/kg)</label>
              <input
                type="number"
                step="1000"
                value={formData.grade_a_price || ''}
                onChange={(e) => setFormData({ ...formData, grade_a_price: Number(e.target.value) })}
                placeholder="VD: 35000"
                className="w-full px-3 py-2 border border-slate-300 rounded-xl font-bold text-emerald-800 bg-slate-50 focus:bg-white text-xs font-mono"
              />
            </div>
            <div>
              <label className="block font-bold text-slate-700 mb-1">Đơn giá Loại B (đ/kg)</label>
              <input
                type="number"
                step="1000"
                value={formData.grade_b_price || ''}
                onChange={(e) => setFormData({ ...formData, grade_b_price: Number(e.target.value) })}
                placeholder="VD: 25000"
                className="w-full px-3 py-2 border border-slate-300 rounded-xl font-bold text-emerald-800 bg-slate-50 focus:bg-white text-xs font-mono"
              />
            </div>
          </div>

          <div>
            <label className="block font-bold text-slate-700 mb-1">Phí dịch vụ HTX (Tỷ lệ %)</label>
            <input
              type="number"
              step="0.005"
              min="0"
              max="0.2"
              value={formData.service_fee_rate}
              onChange={(e) => setFormData({ ...formData, service_fee_rate: Number(e.target.value) })}
              className="w-full px-3 py-2 border border-slate-300 rounded-xl font-bold text-slate-700 bg-slate-50 focus:bg-white text-xs"
            />
            <span className="text-[11px] text-slate-400 mt-0.5 block">
              Mặc định 0.025 = 2.5% giá trị sản lượng nộp về quỹ điều hành HTX
            </span>
          </div>

          <div className="bg-emerald-50 p-3 rounded-xl border border-emerald-200 text-emerald-900 text-xs space-y-1">
            <div className="font-extrabold flex items-center gap-1.5">
              <Sparkles className="w-4 h-4 text-emerald-600" /> Tự động thực hiện 3 bước nghiệp vụ:
            </div>
            <ul className="list-disc list-inside space-y-0.5 text-[11.5px] opacity-90 pl-1">
              <li>Khóa các đợt thu hoạch của thửa đất liên kết với xã viên (`is_settled: true`).</li>
              <li>Cấn trừ tự động nợ vật tư trả chậm trong bảng `receivable_payables`.</li>
              <li>Tạo phiếu chi ngân hàng / tiền mặt tương ứng với `net_payout` vào Sổ quỹ.</li>
            </ul>
          </div>

          <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-slate-300 rounded-xl font-bold text-slate-600 hover:bg-slate-50 text-xs"
            >
              Hủy
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-5 py-2 bg-emerald-700 text-white rounded-xl font-extrabold hover:bg-emerald-800 shadow-xs text-xs transition-all active:scale-98 disabled:opacity-50"
            >
              {isSubmitting ? 'Đang quyết toán...' : 'Chốt Quyết Toán Ngay'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
