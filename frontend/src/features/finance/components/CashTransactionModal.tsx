import React, { useState } from 'react';
import { X, ArrowDownLeft, ArrowUpRight } from 'lucide-react';
import { Member } from '@/types/memberTypes';

interface CashTransactionModalProps {
  isOpen: boolean;
  members: Member[];
  onClose: () => void;
  onSubmit: (formData: {
    transaction_type: 'INCOME' | 'EXPENSE';
    transaction_date: string;
    category: string;
    amount: number;
    description: string;
    person_name: string;
    member_id?: string;
    payment_method: 'CASH' | 'BANK_TRANSFER';
  }) => void;
  isSubmitting?: boolean;
}

export const CashTransactionModal: React.FC<CashTransactionModalProps> = ({
  isOpen,
  members,
  onClose,
  onSubmit,
  isSubmitting = false,
}) => {
  const [formData, setFormData] = useState({
    transaction_type: 'INCOME' as 'INCOME' | 'EXPENSE',
    transaction_date: new Date().toISOString().slice(0, 10),
    category: '',
    amount: 0,
    description: '',
    person_name: '',
    member_id: '',
    payment_method: 'BANK_TRANSFER' as 'CASH' | 'BANK_TRANSFER',
  });

  React.useEffect(() => {
    if (isOpen) {
      setFormData({
        transaction_type: 'INCOME',
        transaction_date: new Date().toISOString().slice(0, 10),
        category: '',
        amount: 0,
        description: '',
        person_name: '',
        member_id: '',
        payment_method: 'BANK_TRANSFER',
      });
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  const isIncome = formData.transaction_type === 'INCOME';

  return (
    <div
      className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fade-in"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="bg-white rounded-2xl max-w-lg w-full p-6 space-y-4 shadow-2xl border border-slate-100 max-h-[92vh] overflow-y-auto">
        <div className="flex items-center justify-between border-b pb-3 border-slate-200">
          <div className="flex items-center gap-2">
            <div
              className={`w-9 h-9 rounded-xl flex items-center justify-center ${
                isIncome ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'
              }`}
            >
              {isIncome ? <ArrowDownLeft className="w-5 h-5" /> : <ArrowUpRight className="w-5 h-5" />}
            </div>
            <div>
              <h3 className="text-base font-extrabold text-slate-900">
                Lập Phiếu Thu / Chi Quỹ HTX
              </h3>
              <p className="text-xs text-slate-500">Ghi nhận dòng tiền thực tế vào sổ cái tài chính</p>
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
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-bold text-slate-700 mb-1">Loại phiếu *</label>
              <select
                value={formData.transaction_type}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    transaction_type: e.target.value as 'INCOME' | 'EXPENSE',
                  })
                }
                className="w-full px-3 py-2 border border-slate-300 rounded-xl font-bold bg-slate-50 focus:bg-white text-xs"
              >
                <option value="INCOME">Phiếu Thu (Tiền vào quỹ)</option>
                <option value="EXPENSE">Phiếu Chi (Tiền ra khỏi quỹ)</option>
              </select>
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">Ngày lập phiếu *</label>
              <input
                type="date"
                value={formData.transaction_date}
                onChange={(e) => setFormData({ ...formData, transaction_date: e.target.value })}
                className="w-full px-3 py-2 border border-slate-300 rounded-xl font-bold text-slate-800 bg-slate-50 focus:bg-white text-xs"
                required
              />
            </div>
          </div>

          <div>
            <label className="block font-bold text-slate-700 mb-1">Chọn nhanh Xã viên (tùy chọn)</label>
            <select
              value={formData.member_id}
              onChange={(e) => {
                const mId = e.target.value;
                const found = members.find((m) => m.id === mId);
                setFormData({
                  ...formData,
                  member_id: mId,
                  person_name: found ? `${found.full_name} (${found.member_code})` : formData.person_name,
                });
              }}
              className="w-full px-3 py-2 border border-slate-300 rounded-xl text-slate-700 bg-slate-50 focus:bg-white text-xs"
            >
              <option value="">-- Chọn xã viên nếu có --</option>
              {members.map((m) => (
                <option key={m.id} value={m.id}>
                  {m.full_name} ({m.member_code})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block font-bold text-slate-700 mb-1">Hạng mục giao dịch *</label>
            <input
              type="text"
              value={formData.category}
              onChange={(e) => setFormData({ ...formData, category: e.target.value })}
              placeholder="Ví dụ: Thu mua Ớt Sweet Palermo, Mua phân bón..."
              className="w-full px-3 py-2 border border-slate-300 rounded-xl font-medium bg-slate-50 focus:bg-white text-xs"
              required
            />
          </div>

          <div>
            <label className="block font-bold text-slate-700 mb-1">Số tiền (VNĐ) *</label>
            <input
              type="number"
              min="1000"
              step="1000"
              value={formData.amount}
              onChange={(e) => setFormData({ ...formData, amount: Number(e.target.value) })}
              className="w-full px-3 py-2 border border-slate-300 rounded-xl font-black text-emerald-800 text-sm bg-slate-50 focus:bg-white font-mono"
              required
            />
          </div>

          <div>
            <label className="block font-bold text-slate-700 mb-1">Đối tác / Người nộp hoặc nhận *</label>
            <input
              type="text"
              value={formData.person_name}
              onChange={(e) => setFormData({ ...formData, person_name: e.target.value })}
              placeholder="Tên xã viên, doanh nghiệp hoặc nhà cung cấp"
              className="w-full px-3 py-2 border border-slate-300 rounded-xl font-medium bg-slate-50 focus:bg-white text-xs"
              required
            />
          </div>

          <div>
            <label className="block font-bold text-slate-700 mb-1">Hình thức thanh toán</label>
            <select
              value={formData.payment_method}
              onChange={(e) =>
                setFormData({ ...formData, payment_method: e.target.value as 'CASH' | 'BANK_TRANSFER' })
              }
              className="w-full px-3 py-2 border border-slate-300 rounded-xl font-bold bg-slate-50 focus:bg-white text-xs"
            >
              <option value="BANK_TRANSFER">Chuyển khoản ngân hàng</option>
              <option value="CASH">Tiền mặt tại quỹ HTX</option>
            </select>
          </div>

          <div>
            <label className="block font-bold text-slate-700 mb-1">Mô tả / Ghi chú</label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              rows={2}
              className="w-full px-3 py-2 border border-slate-300 rounded-xl bg-slate-50 focus:bg-white text-xs"
            />
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
              className="px-5 py-2 bg-emerald-700 text-white rounded-xl font-bold hover:bg-emerald-800 shadow-xs text-xs transition-all active:scale-98 disabled:opacity-50"
            >
              {isSubmitting ? 'Đang lưu...' : 'Lưu & Ghi sổ'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
