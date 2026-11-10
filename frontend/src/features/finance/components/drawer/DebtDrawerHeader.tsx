import React from 'react';
import {
  X,
  Receipt,
  DollarSign,
  Coins,
  Clock,
  CheckCircle2,
  AlertCircle,
  Calendar,
} from 'lucide-react';
import { ReceivablePayable } from '@/services/financeApi';

interface DebtDrawerHeaderProps {
  debt: ReceivablePayable;
  onClose: () => void;
  onSettle: (d: ReceivablePayable) => void;
}

const formatMoney = (n: number) => (n || 0).toLocaleString('vi-VN') + ' ₫';

export const DebtDrawerHeader: React.FC<DebtDrawerHeaderProps> = ({
  debt,
  onClose,
  onSettle,
}) => {
  const isReceivable = debt.debtType === 'RECEIVABLE';
  const isPaid = debt.status === 'SETTLED';
  const paidAmount = Math.max(0, debt.totalAmount - debt.remainingAmount);

  return (
    <div className="p-5 border-b border-slate-200 bg-white z-10 shrink-0 shadow-xs space-y-4">
      {/* Top row */}
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3.5 min-w-0">
          <div
            className={`w-12 h-12 rounded-2xl font-black flex items-center justify-center text-lg shadow-2xs shrink-0 border ${
              isReceivable
                ? 'bg-amber-100 text-amber-800 border-amber-200'
                : 'bg-blue-100 text-blue-800 border-blue-200'
            }`}
          >
            <Receipt className="w-6 h-6" />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <h2 className="text-lg font-black text-slate-900 tracking-tight truncate">
                {debt.debtorName}
              </h2>
              <span
                className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold border ${
                  isReceivable
                    ? 'bg-amber-100 text-amber-800 border-amber-200'
                    : 'bg-blue-100 text-blue-800 border-blue-200'
                }`}
              >
                {isReceivable ? 'Phải thu xã viên' : 'Phải trả đối tác'}
              </span>
              {isPaid ? (
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
                  <CheckCircle2 className="w-3 h-3" />
                  Đã thanh toán đủ
                </span>
              ) : debt.status === 'PARTIAL' ? (
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-orange-100 text-orange-800 border border-orange-200">
                  <Clock className="w-3 h-3" />
                  Trả một phần
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-rose-100 text-rose-800 border border-rose-200">
                  <AlertCircle className="w-3 h-3" />
                  Chưa thanh toán
                </span>
              )}
            </div>
            <p className="text-xs text-slate-500 font-medium mt-1 truncate">
              <span className="font-mono text-emerald-800 font-bold">{debt.id}</span>
              <span className="mx-1.5 text-slate-300">&bull;</span>
              <span>{debt.description || 'Theo dõi công nợ HTX'}</span>
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-1.5 shrink-0">
          {!isPaid && debt.remainingAmount > 0 && (
            <button
              type="button"
              onClick={() => onSettle(debt)}
              className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl border border-emerald-300 bg-emerald-50 text-emerald-800 hover:bg-emerald-100 text-xs font-bold transition-all shadow-2xs cursor-pointer"
            >
              <Coins className="w-3.5 h-3.5" />
              <span>Thu nợ / Cấn trừ</span>
            </button>
          )}
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-xl border border-slate-200 text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
            title="Đóng chi tiết"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Quick KPI Stat Chips */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 pt-1">
        <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200/80">
          <div className="flex items-center gap-1.5 text-[11px] font-bold text-slate-500">
            <DollarSign className="w-3.5 h-3.5 text-slate-600" />
            <span>Gốc ban đầu</span>
          </div>
          <div className="text-sm font-black font-mono text-slate-900 mt-1">
            {formatMoney(debt.totalAmount)}
          </div>
        </div>

        <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200/80">
          <div className="flex items-center gap-1.5 text-[11px] font-bold text-slate-500">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
            <span>Đã thanh toán</span>
          </div>
          <div className="text-sm font-black font-mono text-emerald-800 mt-1">
            {formatMoney(paidAmount)}
          </div>
        </div>

        <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200/80">
          <div className="flex items-center gap-1.5 text-[11px] font-bold text-slate-500">
            <Coins className="w-3.5 h-3.5 text-rose-600" />
            <span>Dư nợ còn lại</span>
          </div>
          <div className="text-sm font-black font-mono text-rose-700 mt-1">
            {formatMoney(debt.remainingAmount)}
          </div>
        </div>

        <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200/80">
          <div className="flex items-center gap-1.5 text-[11px] font-bold text-slate-500">
            <Calendar className="w-3.5 h-3.5 text-amber-600" />
            <span>Hạn thanh toán</span>
          </div>
          <div className="text-sm font-black font-mono text-slate-800 mt-1">
            {debt.dueDate || 'Thỏa thuận'}
          </div>
        </div>
      </div>
    </div>
  );
};
