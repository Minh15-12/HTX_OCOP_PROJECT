import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { ReceivablePayable, financeApi, CashTransaction } from '@/services/financeApi';
import { formatDate } from '@/utils/formatters';
import { Receipt, Coins, ArrowDownRight, ArrowUpRight, CheckCircle2, AlertCircle } from 'lucide-react';

interface DebtTabSettlementsProps {
  debt: ReceivablePayable;
}

const formatMoney = (n: number) => (n || 0).toLocaleString('vi-VN') + ' ₫';

export const DebtTabSettlements: React.FC<DebtTabSettlementsProps> = ({ debt }) => {
  const { data: transactions = [], isLoading } = useQuery<CashTransaction[]>({
    queryKey: ['cashTransactions'],
    queryFn: () => financeApi.getCashTransactions(),
  });

  // Filter transactions related to this debtor or debt ID
  const relatedTransactions = transactions.filter(
    (t) =>
      t.description?.includes(debt.id) ||
      t.personName?.toLowerCase() === debt.debtorName.toLowerCase()
  );

  const isReceivable = debt.debtType === 'RECEIVABLE';

  return (
    <div className="space-y-4">
      {/* CARD: LỊCH SỬ THU HỒI / THANH TOÁN */}
      <div className="bg-white rounded-xl border border-slate-200/90 shadow-2xs p-5">
        <h3 className="text-xs font-black uppercase tracking-wider text-slate-800 pb-3 mb-3 border-b border-slate-100 flex items-center justify-between">
          <span className="flex items-center gap-1.5">
            <Receipt className="w-4 h-4 text-emerald-600" />
            Lịch sử phiếu thu / chi & Cấn trừ đối soát
          </span>
          <span className="text-[11px] text-slate-400 font-normal">
            {relatedTransactions.length} phiếu liên quan
          </span>
        </h3>

        {isLoading ? (
          <div className="py-8 text-center text-xs text-slate-400">
            Đang tải dữ liệu chứng từ thanh toán...
          </div>
        ) : relatedTransactions.length === 0 ? (
          <div className="py-8 text-center text-slate-400 text-xs">
            <AlertCircle className="w-6 h-6 mx-auto mb-1.5 text-slate-300" />
            <p className="font-bold text-slate-600">Chưa phát sinh chứng từ thanh toán</p>
            <p className="text-[11.5px] text-slate-400 mt-0.5">
              Khi thực hiện thu nợ hoặc cấn trừ quyết toán, phiếu thu/chi sẽ tự động lưu vào đây.
            </p>
          </div>
        ) : (
          <div className="space-y-2.5">
            {relatedTransactions.map((tx) => {
              const isIncome = tx.transactionType === 'INCOME';

              return (
                <div
                  key={tx.id}
                  className="p-3.5 rounded-xl border border-slate-200/80 bg-slate-50/50 hover:bg-slate-50 transition-colors"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-2.5">
                      <div
                        className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
                          isIncome ? 'bg-emerald-100 text-emerald-800' : 'bg-blue-100 text-blue-800'
                        }`}
                      >
                        {isIncome ? (
                          <ArrowDownRight className="w-4 h-4" />
                        ) : (
                          <ArrowUpRight className="w-4 h-4" />
                        )}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-xs font-bold text-slate-800">
                            {tx.voucherNumber}
                          </span>
                          <span
                            className={`px-2 py-0.2 rounded text-[10.5px] font-bold ${
                              isIncome
                                ? 'bg-emerald-100 text-emerald-800'
                                : 'bg-blue-100 text-blue-800'
                            }`}
                          >
                            {isIncome ? 'Phiếu thu nợ' : 'Phiếu chi cấn trừ'}
                          </span>
                          <span className="text-[11px] text-slate-400 font-mono">
                            {formatDate(tx.transactionDate)}
                          </span>
                        </div>
                        <p className="text-xs text-slate-700 mt-1 font-medium">{tx.description}</p>
                      </div>
                    </div>

                    <div className="text-right shrink-0">
                      <span
                        className={`text-sm font-black font-mono ${
                          isIncome ? 'text-emerald-700' : 'text-blue-700'
                        }`}
                      >
                        {isIncome ? '+' : '-'}
                        {formatMoney(tx.amount)}
                      </span>
                      <div className="text-[10.5px] text-slate-400 mt-0.5">
                        {tx.paymentMethod === 'BANK_TRANSFER' ? 'Chuyển khoản' : 'Tiền mặt'}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
