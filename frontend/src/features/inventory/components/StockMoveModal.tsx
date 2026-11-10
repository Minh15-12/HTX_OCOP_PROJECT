import React, { useState } from 'react';
import { X, ArrowDownRight, ArrowUpRight, AlertTriangle } from 'lucide-react';
import { Material } from '../../../types/inventory';
import { getStoredSeasons } from '@/services/cropSeasonApi';
import { getAllStoredPlots } from '@/services/farmPlotApi';

interface StockMoveModalProps {
  type: 'IN' | 'OUT';
  items: Material[];
  defaultItem?: Material | null;
  onClose: () => void;
  onSubmit: (payload: {
    itemId: string;
    qty: number;
    note: string;
    type: 'IN' | 'OUT';
    seasonName?: string;
    memberName?: string;
    farmPlotName?: string;
  }) => void;
}

export const StockMoveModal: React.FC<StockMoveModalProps> = ({
  type,
  items,
  defaultItem,
  onClose,
  onSubmit,
}) => {
  const seasonsList = React.useMemo(() => {
    const list = getStoredSeasons();
    return list.length > 0 ? list : [{ id: 'season-current', name: 'Vụ Ớt Chuông Sweet Palermo Thu Đông 2026' }];
  }, []);

  const memberPlotsList = React.useMemo(() => {
    const plots = getAllStoredPlots();
    if (plots.length > 0) {
      return plots.map((p) => ({
        member: p.assignments?.[0]?.member_name ? `${p.assignments[0].member_name} (${p.assignments[0].member_code})` : 'Xã viên phụ trách',
        plot: `${p.plot_code} - ${p.unit_name || 'Vùng sản xuất tập trung'}`,
      }));
    }
    return [];
  }, []);

  const [itemId, setItemId] = useState(defaultItem?.id || items[0]?.id || '');
  const [qty, setQty] = useState('');
  const [note, setNote] = useState('');
  const [seasonName, setSeasonName] = useState(seasonsList[0]?.name || '');
  const [memberPlot, setMemberPlot] = useState(memberPlotsList[0] || { member: '', plot: '' });

  const item = items.find((i) => i.id === itemId);
  const qtyNum = Number(qty) || 0;
  const exceeds = type === 'OUT' && item && qtyNum > item.stockQty;
  const valid = Boolean(itemId && qtyNum > 0 && !exceeds);
  const isIn = type === 'IN';

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!valid) return;
    onSubmit({
      itemId,
      qty: qtyNum,
      note,
      type,
      seasonName: isIn ? undefined : seasonName,
      memberName: isIn ? undefined : memberPlot.member,
      farmPlotName: isIn ? undefined : memberPlot.plot,
    });
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs animate-fade-in"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="w-full max-w-lg bg-white rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        <div className="flex items-start justify-between px-5 pt-4 pb-3 border-b border-slate-200">
          <div className="flex items-center gap-2.5">
            <div
              className={`w-9 h-9 rounded-xl flex items-center justify-center ${
                isIn ? 'bg-emerald-100 text-emerald-700' : 'bg-blue-100 text-blue-700'
              }`}
            >
              {isIn ? <ArrowDownRight className="w-5 h-5" /> : <ArrowUpRight className="w-5 h-5" />}
            </div>
            <div>
              <h3 className="text-base font-extrabold text-slate-900">
                {isIn ? 'Lập Phiếu Nhập Kho Vật Tư' : 'Lập Phiếu Xuất Kho Cấp Phát Xã Viên'}
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                {isIn
                  ? 'Bổ sung vật tư từ nhà cung cấp vào kho HTX'
                  : 'Cấp phát phân bón, thuốc BVTV sinh học phục vụ mùa vụ'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-600 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="px-5 py-4 overflow-y-auto space-y-3.5 text-sm">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Chọn vật tư / nông cụ (*)
            </label>
            <select
              value={itemId}
              onChange={(e) => setItemId(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500 text-xs font-bold"
            >
              {items.map((it) => (
                <option key={it.id} value={it.id}>
                  {it.name} (Tồn kho: {it.stockQty.toLocaleString('vi-VN')} {it.unit})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Số lượng {isIn ? 'nhập' : 'xuất'} ({item?.unit || 'đơn vị'}) (*)
            </label>
            <input
              type="number"
              min="0.1"
              step="any"
              value={qty}
              onChange={(e) => setQty(e.target.value)}
              placeholder="Nhập số lượng..."
              className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-slate-900 focus:bg-white focus:outline-none font-mono text-sm font-black"
            />
            {exceeds && (
              <p className="text-xs text-rose-600 font-bold mt-1 flex items-center gap-1">
                <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
                Vượt quá số lượng tồn kho khả dụng ({item?.stockQty.toLocaleString('vi-VN')} {item?.unit})!
              </p>
            )}
          </div>

          {!isIn && (
            <>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Mùa vụ canh tác áp dụng
                </label>
                <select
                  value={seasonName}
                  onChange={(e) => setSeasonName(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-slate-900 focus:bg-white focus:outline-none text-xs"
                >
                  {seasonsList.map((s) => (
                    <option key={s.id} value={s.name}>
                      {s.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Xã viên & Thửa đất thụ hưởng
                </label>
                <select
                  value={`${memberPlot.member}|||${memberPlot.plot}`}
                  onChange={(e) => {
                    const [m, p] = e.target.value.split('|||');
                    setMemberPlot({ member: m, plot: p });
                  }}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-slate-900 focus:bg-white focus:outline-none text-xs"
                >
                  {memberPlotsList.map((mp, idx) => (
                    <option key={idx} value={`${mp.member}|||${mp.plot}`}>
                      {mp.member} — {mp.plot}
                    </option>
                  ))}
                </select>
              </div>
            </>
          )}

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Diễn giải / Ghi chú phiếu
            </label>
            <textarea
              rows={2}
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder={isIn ? 'VD: Nhập bổ sung 15 bao NPK theo hợp đồng...' : 'VD: Cấp phát bón lót đầu vụ...'}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-slate-900 focus:bg-white focus:outline-none text-xs"
            />
          </div>

          <div className="flex justify-end gap-2 pt-3 border-t border-slate-200">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-white hover:bg-slate-100 border border-slate-300 rounded-xl text-slate-700 font-bold text-xs"
            >
              Hủy
            </button>
            <button
              type="submit"
              disabled={!valid}
              className={`px-5 py-2 text-white font-bold text-xs rounded-xl shadow-xs transition-all active:scale-98 disabled:opacity-50 ${
                isIn ? 'bg-emerald-700 hover:bg-emerald-800' : 'bg-blue-700 hover:bg-blue-800'
              }`}
            >
              {isIn ? 'Xác nhận Nhập kho' : 'Xác nhận Xuất cấp phát'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
