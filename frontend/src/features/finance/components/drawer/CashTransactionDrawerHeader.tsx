import React from 'react';
import {
  Wallet,
  ArrowDownLeft,
  ArrowUpRight,
  Printer,
  X,
  CreditCard,
  Calendar,
  Layers,
} from 'lucide-react';
import { CashTransaction } from '@/services/financeApi';

interface CashTransactionDrawerHeaderProps {
  transaction: CashTransaction;
  onClose: () => void;
  onPrint?: (transaction: CashTransaction) => void;
}

const money = (n: number) => (n || 0).toLocaleString('vi-VN') + ' ₫';

export const CashTransactionDrawerHeader: React.FC<CashTransactionDrawerHeaderProps> = ({
  transaction,
  onClose,
  onPrint,
}) => {
  const isIncome = transaction.transactionType === 'INCOME';

  return (
    <div
      className={`p-5 text-white border-b ${
        isIncome
          ? 'bg-gradient-to-r from-emerald-900 via-teal-950 to-slate-900 border-emerald-800/40'
          : 'bg-gradient-to-r from-rose-950 via-slate-900 to-slate-950 border-rose-900/40'
      }`}
    >
      {/* Top action row */}
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-white/10 backdrop-blur-md text-white border border-white/10 shadow-inner">
            {isIncome ? (
              <ArrowDownLeft className="h-6 w-6 text-emerald-300" strokeWidth={2.2} />
            ) : (
              <ArrowUpRight className="h-6 w-6 text-rose-300" strokeWidth={2.2} />
            )}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-mono text-xs font-bold text-white bg-white/15 px-2 py-0.5 rounded border border-white/20">
                {transaction.voucherNumber}
              </span>
              <span
                className={`text-[11px] font-bold px-2 py-0.5 rounded-full border ${
                  isIncome
                    ? 'bg-emerald-500/20 text-emerald-200 border-emerald-400/30'
                    : 'bg-rose-500/20 text-rose-200 border-rose-400/30'
                }`}
              >
                {isIncome ? 'Phiếu Thu tiền' : 'Phiếu Chi tiền'}
              </span>
            </div>
            <h2 className="text-lg font-black tracking-tight text-white mt-1">
              {transaction.category}
            </h2>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {onPrint && (
            <button
              type="button"
              onClick={() => onPrint(transaction)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-white font-bold text-xs transition border border-white/15 cursor-pointer"
            >
              <Printer className="w-3.5 h-3.5 text-emerald-300" />
              In phiếu
            </button>
          )}
          <button
            type="button"
            onClick={onClose}
            aria-label="Đóng ngăn chi tiết giao dịch thu chi"
            className="p-1.5 rounded-xl hover:bg-white/15 text-slate-300 hover:text-white transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* 4 KPI summary cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 mt-4 pt-4 border-t border-white/10">
        <div className="bg-white/5 rounded-xl p-2.5 border border-white/10">
          <div className="flex items-center gap-1.5 text-[11px] text-slate-300 font-medium">
            <Wallet className="w-3.5 h-3.5 text-amber-300" />
            Số tiền chứng từ
          </div>
          <div
            className={`text-base font-extrabold mt-0.5 font-mono ${
              isIncome ? 'text-emerald-300' : 'text-rose-300'
            }`}
          >
            {isIncome ? '+' : '-'}{money(transaction.amount)}
          </div>
        </div>

        <div className="bg-white/5 rounded-xl p-2.5 border border-white/10">
          <div className="flex items-center gap-1.5 text-[11px] text-slate-300 font-medium">
            <CreditCard className="w-3.5 h-3.5 text-teal-300" />
            Phương thức
          </div>
          <div className="text-sm font-extrabold text-white mt-0.5 truncate">
            {transaction.paymentMethod === 'BANK_TRANSFER' ? 'Chuyển khoản' : 'Tiền mặt tại quỹ'}
          </div>
        </div>

        <div className="bg-white/5 rounded-xl p-2.5 border border-white/10">
          <div className="flex items-center gap-1.5 text-[11px] text-slate-300 font-medium">
            <Calendar className="w-3.5 h-3.5 text-sky-300" />
            Ngày ghi sổ
          </div>
          <div className="text-sm font-extrabold text-white mt-0.5 font-mono">
            {transaction.transactionDate}
          </div>
        </div>

        <div className="bg-white/5 rounded-xl p-2.5 border border-white/10">
          <div className="flex items-center gap-1.5 text-[11px] text-slate-300 font-medium">
            <Layers className="w-3.5 h-3.5 text-indigo-300" />
            Trạng thái sổ
          </div>
          <div className="text-sm font-extrabold text-emerald-300 mt-0.5">
            {transaction.status === 'POSTED' ? 'Đã ghi sổ' : 'Đã duyệt'}
          </div>
        </div>
      </div>
    </div>
  );
};
