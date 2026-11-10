import React from 'react';
import { Member } from '@/types/memberTypes';
import { Calculator, Building2 } from 'lucide-react';

interface EditSectionProfitProps {
  editingMember: Member;
  setEditingMember: React.Dispatch<React.SetStateAction<Member | null>>;
}

export const EditSectionProfit: React.FC<EditSectionProfitProps> = ({
  editingMember,
  setEditingMember,
}) => {
  return (
    <div className="space-y-5">
      {/* SECTION HEADER 4 */}
      <div className="flex items-center gap-2 pb-2 border-b border-slate-200">
        <Calculator className="w-4 h-4 text-purple-600" />
        <h4 className="text-[13px] font-extrabold uppercase text-slate-700 tracking-wider">
          Phân chia lợi nhuận &amp; Ngân hàng thụ hưởng
        </h4>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-[13px] font-semibold text-slate-700 mb-1.5">
            Tỷ lệ phân chia thặng dư <span className="text-rose-500">*</span>
          </label>
          <div className="relative">
            <input
              type="number"
              step={0.1}
              min={0}
              max={100}
              required
              value={editingMember.profit_share_rate}
              onChange={(e) =>
                setEditingMember({
                  ...editingMember,
                  profit_share_rate: Number(e.target.value),
                })
              }
              className="w-full px-3.5 py-2.5 pr-8 bg-slate-50 border border-slate-200 focus:border-blue-500 rounded-lg font-bold text-sm text-slate-900"
            />
            <span className="absolute right-3.5 top-1/2 -translate-y-1/2 font-bold text-slate-400 text-sm">
              %
            </span>
          </div>
        </div>

        <div>
          <label className="block text-[13px] font-semibold text-slate-700 mb-1.5">
            Hình thức nhận lợi nhuận <span className="text-rose-500">*</span>
          </label>
          <div className="flex items-center gap-6 pt-1 font-medium text-slate-800 bg-slate-50 p-2.5 rounded-lg border border-slate-200">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="radio"
                name="editPayoutMethodRadio"
                checked={editingMember.payout_method === 'CASH'}
                onChange={() =>
                  setEditingMember({ ...editingMember, payout_method: 'CASH' })
                }
                className="w-4 h-4 text-blue-600 focus:ring-blue-500"
              />
              <span className="text-sm">Tiền mặt tại quỹ</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="radio"
                name="editPayoutMethodRadio"
                checked={editingMember.payout_method === 'BANK_TRANSFER'}
                onChange={() =>
                  setEditingMember({ ...editingMember, payout_method: 'BANK_TRANSFER' })
                }
                className="w-4 h-4 text-blue-600 focus:ring-blue-500"
              />
              <span className="text-sm">Chuyển khoản</span>
            </label>
          </div>
        </div>
      </div>

      {/* SUB-SECTION: NGÂN HÀNG */}
      <div className="pt-3 border-t border-slate-100 space-y-4">
        <div className="flex items-center gap-1.5">
          <Building2 className="w-4 h-4 text-slate-500" />
          <h5 className="text-[12px] font-extrabold uppercase text-slate-500 tracking-wider">
            Thông tin tài khoản ngân hàng thụ hưởng
          </h5>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-[13px] font-semibold text-slate-700 mb-1.5">Tên Ngân hàng</label>
            <input
              type="text"
              placeholder="VD: Agribank, Vietcombank, BIDV..."
              value={editingMember.bank_name || ''}
              onChange={(e) =>
                setEditingMember({ ...editingMember, bank_name: e.target.value })
              }
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 focus:border-blue-500 rounded-lg text-sm font-medium text-slate-700"
            />
          </div>

          <div>
            <label className="block text-[13px] font-semibold text-slate-700 mb-1.5">Số tài khoản</label>
            <input
              type="text"
              placeholder="Nhập số tài khoản ngân hàng"
              value={editingMember.bank_account || ''}
              onChange={(e) =>
                setEditingMember({ ...editingMember, bank_account: e.target.value })
              }
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 focus:border-blue-500 rounded-lg font-mono font-bold text-sm text-slate-900"
            />
          </div>
        </div>

        <div>
          <label className="block text-[13px] font-semibold text-slate-700 mb-1.5">Tên chủ tài khoản (In hoa)</label>
          <input
            type="text"
            placeholder="Tên in hoa trên thẻ ngân hàng"
            value={editingMember.account_holder || ''}
            onChange={(e) =>
              setEditingMember({
                ...editingMember,
                account_holder: e.target.value.toUpperCase(),
              })
            }
            className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 focus:border-blue-500 rounded-lg font-bold text-sm text-slate-800 uppercase"
          />
        </div>

        <div>
          <label className="block text-[13px] font-semibold text-slate-700 mb-1.5">Ghi chú bổ sung</label>
          <textarea
            rows={2}
            placeholder="Ghi chú thêm về hoàn cảnh, nguyện vọng hoặc lưu ý đặc biệt..."
            value={editingMember.notes || ''}
            onChange={(e) => setEditingMember({ ...editingMember, notes: e.target.value })}
            className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 focus:border-blue-500 rounded-lg text-sm font-medium text-slate-700"
          ></textarea>
        </div>
      </div>
    </div>
  );
};
