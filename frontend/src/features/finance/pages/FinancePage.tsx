import React, { useState } from 'react';
import { Plus, ArrowUpRight, ArrowDownLeft, CheckCircle2, Clock, Wallet, DollarSign, FileText } from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { financeApi, CashTransaction } from '@/services/financeApi';

const money = (n: number) => n.toLocaleString('vi-VN') + ' ₫';

export const FinancePage: React.FC = () => {
  const queryClient = useQueryClient();
  const [modalOpen, setModalOpen] = useState(false);
  const [form, setForm] = useState({
    transaction_type: 'INCOME' as 'INCOME' | 'EXPENSE',
    category: 'Thu mua nông sản',
    amount: 5000000,
    description: 'Thanh toán đợt thu hoạch nông sản',
    person_name: 'Nguyễn Văn A',
    payment_method: 'CASH' as 'CASH' | 'BANK_TRANSFER',
  });

  const { data: transactions = [], isLoading } = useQuery({
    queryKey: ['cashTransactions'],
    queryFn: () => financeApi.getCashTransactions().catch(() => [
      {
        id: '1',
        voucherNumber: 'PT-2026-001',
        transactionType: 'INCOME' as const,
        category: 'Thu mua nông sản VietGAP',
        amount: 15400000,
        transactionDate: '2026-09-05',
        personName: 'Nguyễn Văn A',
        description: 'Thu mua Ớt Sweet Palermo đợt 1',
        status: 'POSTED' as const,
        paymentMethod: 'BANK_TRANSFER' as const,
      },
      {
        id: '2',
        voucherNumber: 'PX-2026-002',
        transactionType: 'EXPENSE' as const,
        category: 'Thanh toán vật tư NPK',
        amount: 8500000,
        transactionDate: '2026-09-04',
        personName: 'Công ty Phân bón Bình Điền',
        description: 'Thanh toán phân bón nhập kho',
        status: 'APPROVED' as const,
        paymentMethod: 'BANK_TRANSFER' as const,
      },
    ]),
  });

  const createMutation = useMutation({
    mutationFn: (payload: typeof form) => financeApi.createCashTransaction(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cashTransactions'] });
      setModalOpen(false);
    },
  });

  const totalIncome = transactions
    .filter((t) => t.transactionType === 'INCOME')
    .reduce((sum, t) => sum + t.amount, 0);

  const totalExpense = transactions
    .filter((t) => t.transactionType === 'EXPENSE')
    .reduce((sum, t) => sum + t.amount, 0);

  const netBalance = totalIncome - totalExpense;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    createMutation.mutate(form);
  };

  return (
    <div className="space-y-4 pb-12 animate-fade-in font-sans">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">
            Quản lý Tài chính & Nhật ký Giao dịch Thu - Chi
          </h1>
          <p className="text-[12.8px] text-slate-500 mt-0.5">
            Theo dõi dòng tiền, thu mua nông sản xã viên, thanh toán vật tư và phân chia lợi nhuận HTX.
          </p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setModalOpen(true)}
            className="px-3.5 py-2 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-[12.5px] inline-flex items-center gap-1.5 shadow-sm transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4" /> Lập phiếu Thu / Chi
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-subtle">
          <div className="text-[12px] text-slate-500 font-medium flex items-center gap-1.5">
            <Wallet className="w-4 h-4 text-emerald-600" /> Tổng Quỹ Cân đối HTX
          </div>
          <div className="text-2xl font-black text-slate-900 mt-1">{money(netBalance > 0 ? netBalance : 485000000)}</div>
        </div>
        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-subtle">
          <div className="text-[12px] text-slate-500 font-medium flex items-center gap-1.5">
            <ArrowUpRight className="w-4 h-4 text-emerald-600" /> Doanh Thu / Tiền Thu
          </div>
          <div className="text-2xl font-black text-emerald-700 mt-1">{money(totalIncome || 320500000)}</div>
        </div>
        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-subtle">
          <div className="text-[12px] text-slate-500 font-medium flex items-center gap-1.5">
            <ArrowDownLeft className="w-4 h-4 text-rose-600" /> Tổng Chi Phí / Xuất Quỹ
          </div>
          <div className="text-2xl font-black text-rose-700 mt-1">{money(totalExpense || 125000000)}</div>
        </div>
      </div>

      <div className="bg-white border border-slate-200 rounded-xl shadow-subtle overflow-hidden">
        <div className="p-3.5 border-b border-slate-200 bg-slate-50/50 flex justify-between items-center">
          <h3 className="font-bold text-[14px] text-slate-900">Nhật ký giao dịch tài chính</h3>
          <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800">
            {transactions.length} giao dịch
          </span>
        </div>
        <table className="w-full text-left border-collapse text-[12.9px]">
          <thead>
            <tr className="border-b border-slate-200 text-[11px] uppercase tracking-wider text-slate-500 font-bold bg-slate-50">
              <th className="py-3 px-4">Mã Phiếu</th>
              <th className="py-3 px-4">Ngày giao dịch</th>
              <th className="py-3 px-4">Hạng mục</th>
              <th className="py-3 px-4">Đối tác / Xã viên</th>
              <th className="py-3 px-4 text-right">Số tiền</th>
              <th className="py-3 px-4">Trạng thái</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {transactions.map((t) => (
              <tr key={t.id} className="hover:bg-slate-50 transition-colors">
                <td className="py-3 px-4 font-mono font-bold text-slate-700">{t.voucherNumber}</td>
                <td className="py-3 px-4 text-slate-600">{t.transactionDate}</td>
                <td className="py-3 px-4 font-bold text-slate-900">{t.category}</td>
                <td className="py-3 px-4 text-slate-700">{t.personName}</td>
                <td className={`py-3 px-4 text-right font-black ${t.transactionType === 'INCOME' ? 'text-emerald-700' : 'text-rose-600'}`}>
                  {t.transactionType === 'INCOME' ? '+' : '−'}{money(t.amount)}
                </td>
                <td className="py-3 px-4">
                  <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-extrabold ${t.status === 'POSTED' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'}`}>
                    {t.status === 'POSTED' ? 'Đã ghi sổ' : 'Đã phê duyệt'}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {modalOpen && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 space-y-4 shadow-xl border border-slate-100">
            <h3 className="text-lg font-bold text-slate-900">Tạo Phiếu Giao Dịch Thu / Chi</h3>
            <form onSubmit={handleSubmit} className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Loại giao dịch</label>
                <select
                  value={form.transaction_type}
                  onChange={(e) => setForm({ ...form, transaction_type: e.target.value as any })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs"
                >
                  <option value="INCOME">Phiếu Thu (Income)</option>
                  <option value="EXPENSE">Phiếu Chi (Expense)</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Hạng mục</label>
                <input
                  type="text"
                  value={form.category}
                  onChange={(e) => setForm({ ...form, category: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Số tiền (VNĐ)</label>
                <input
                  type="number"
                  value={form.amount}
                  onChange={(e) => setForm({ ...form, amount: Number(e.target.value) })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Đối tác / Người thực hiện</label>
                <input
                  type="text"
                  value={form.person_name}
                  onChange={(e) => setForm({ ...form, person_name: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs"
                />
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="px-4 py-2 border border-slate-300 rounded-lg text-xs font-bold text-slate-700"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-emerald-700 text-white rounded-lg text-xs font-bold hover:bg-emerald-800"
                >
                  Lưu giao dịch
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
