import React, { useState } from 'react';
import { X, DollarSign } from 'lucide-react';
import { ReceivablePayable } from '@/services/financeApi';

const money = (n: number) => (n || 0).toLocaleString('vi-VN') + ' ₫';

interface DebtSettlementModalProps {
  debt: ReceivablePayable | null;
  onClose: () => void;
  onSubmit: (payload: {
    debtId: string;
    amount: number;
    settlement_date: string;
    payment_method: 'CASH' | 'BANK_TRANSFER';
    note?: string;
  }) => void;
  isSubmitting?: boolean;
}

export const DebtSettlementModal: React.FC<DebtSettlementModalProps> = ({
  debt,
  onClose,
  onSubmit,
  isSubmitting = false,
}) => {
  const [amount, setAmount] = useState(debt?.remainingAmount || 0);
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));
  const [method, setMethod] = useState<'CASH' | 'BANK_TRANSFER'>('BANK_TRANSFER');
  const [note, setNote] = useState('');

  if (!debt) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({
      debtId: debt.id,
      amount,
      settlement_date: date,
      payment_method: method,
      note,
    });
  };

  return (
    <div
      className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fade-in"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="bg-white rounded-2xl max-w-md w-full p-6 space-y-4 shadow-2xl border border-slate-100">
        <div className="flex items-center justify-between border-b pb-3 border-slate-200">
          <div>
            <h3 className="text-base font-extrabold text-slate-900">
              Thu Hồi / Cấn Trừ Công Nợ
            </h3>
            <p className="text-xs text-slate-500">Mã hồ sơ: {debt.id}</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 text-xs space-y-1">
          <div>
            Đối tượng: <strong className="text-slate-900">{debt.debtorName}</strong>
          </div>
          <div>
            Dư nợ hiện tại:{' '}
            <strong className="text-rose-700 font-black">{money(debt.remainingAmount)}</strong>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3.5 text-xs">
          <div>
            <label className="block font-bold text-slate-700 mb-1">Ngày thanh toán *</label>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 rounded-xl font-bold text-slate-800 bg-slate-50 focus:bg-white text-xs"
              required
            />
          </div>

          <div>
            <label className="block font-bold text-slate-700 mb-1">
              Số tiền thanh toán / cấn trừ *
            </label>
            <input
              type="number"
              min="1000"
              max={debt.remainingAmount}
              step="1000"
              value={amount}
              onChange={(e) => setAmount(Number(e.target.value))}
              className="w-full px-3 py-2 border border-slate-300 rounded-xl font-black text-emerald-800 text-sm bg-slate-50 focus:bg-white font-mono"
              required
            />
          </div>

          <div>
            <label className="block font-bold text-slate-700 mb-1">Hình thức thanh toán</label>
            <select
              value={method}
              onChange={(e) => setMethod(e.target.value as any)}
              className="w-full px-3 py-2 border border-slate-300 rounded-xl font-bold bg-slate-50 focus:bg-white text-xs"
            >
              <option value="BANK_TRANSFER">Chuyển khoản</option>
              <option value="CASH">Tiền mặt</option>
            </select>
          </div>

          <div>
            <label className="block font-bold text-slate-700 mb-1">Ghi chú</label>
            <textarea
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="Ghi chú đợt thanh toán..."
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
              disabled={isSubmitting || amount <= 0 || amount > debt.remainingAmount}
              className="px-5 py-2 bg-emerald-700 text-white rounded-xl font-bold hover:bg-emerald-800 shadow-xs text-xs transition-all active:scale-98 disabled:opacity-50"
            >
              {isSubmitting ? 'Đang xử lý...' : 'Xác nhận thu nợ'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
