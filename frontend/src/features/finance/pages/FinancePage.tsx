import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
  Wallet, Receipt, Wheat, TrendingUp, TrendingDown, DollarSign,
} from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  financeApi,
  CashTransaction,
  ReceivablePayable,
  SettleSeasonPayload,
} from '@/services/financeApi';
import { fetchCropSeasons } from '@/services/cropSeasonApi';
import { getMembersFromApi } from '@/services/memberService';
import { useTenantContextStore } from '@/stores/tenantContextStore';

import { CashbookTab } from '../components/CashbookTab';
import { DebtsTab } from '../components/DebtsTab';
import { HarvestSettlementsTab } from '../components/HarvestSettlementsTab';
import { CashTransactionModal } from '../components/CashTransactionModal';
import { DebtSettlementModal } from '../components/DebtSettlementModal';
import { SeasonSettlementModal } from '../components/SeasonSettlementModal';
import { VoucherPrintModal } from '../components/VoucherPrintModal';
import { CashTransactionDrawer } from '../components/drawer/CashTransactionDrawer';

const money = (n: number) => (n || 0).toLocaleString('vi-VN') + ' ₫';

type FinanceTab = 'cashbook' | 'debts' | 'settlements';

export const FinancePage: React.FC = () => {
  const queryClient = useQueryClient();
  const { activeCooperative } = useTenantContextStore();
  const [searchParams, setSearchParams] = useSearchParams();
  const paramTab = searchParams.get('tab');

  const [activeTab, setActiveTab] = useState<FinanceTab>(() => {
    if (paramTab === 'harvest-settlements' || paramTab === 'settlements') return 'settlements';
    if (paramTab === 'debts') return 'debts';
    return 'cashbook';
  });

  useEffect(() => {
    if (paramTab === 'harvest-settlements' || paramTab === 'settlements') {
      setActiveTab('settlements');
    } else if (paramTab === 'debts') {
      setActiveTab('debts');
    } else if (paramTab === 'cashbook') {
      setActiveTab('cashbook');
    }
  }, [paramTab]);

  const handleSelectTab = (tab: FinanceTab) => {
    setActiveTab(tab);
    setSearchParams({ tab });
  };
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'danger' } | null>(null);

  // Modals & Drawer state
  const [cashModalOpen, setCashModalOpen] = useState(false);
  const [settlementModalOpen, setSettlementModalOpen] = useState(false);
  const [settleDebtTarget, setSettleDebtTarget] = useState<ReceivablePayable | null>(null);
  const [selectedVoucherForPrint, setSelectedVoucherForPrint] = useState<CashTransaction | null>(null);
  const [selectedTransaction, setSelectedTransaction] = useState<CashTransaction | null>(null);

  const showToast = (message: string, type: 'success' | 'danger' = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3500);
  };

  // Queries
  const { data: cashList = [], isLoading: loadingCash } = useQuery({
    queryKey: ['cashTransactions'],
    queryFn: () => financeApi.getCashTransactions().catch(() => []),
  });

  const { data: debtsList = [], isLoading: loadingDebts } = useQuery({
    queryKey: ['receivablePayables'],
    queryFn: () => financeApi.getReceivablePayables().catch(() => []),
  });

  const { data: settlements = [], isLoading: loadingSettlements } = useQuery({
    queryKey: ['harvestSettlements'],
    queryFn: () => financeApi.getHarvestSettlements().catch(() => []),
  });

  const { data: seasons = [] } = useQuery({
    queryKey: ['cropSeasons'],
    queryFn: () => fetchCropSeasons().catch(() => []),
  });

  const { data: members = [] } = useQuery({
    queryKey: ['members'],
    queryFn: () => getMembersFromApi().catch(() => []),
  });

  // Mutations
  const createCashMutation = useMutation({
    mutationFn: (payload: any) => financeApi.createCashTransaction(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cashTransactions'] });
      setCashModalOpen(false);
      showToast('Đã ghi sổ phiếu Thu / Chi thành công!');
    },
    onError: (err: any) => {
      showToast(err?.message || 'Có lỗi khi tạo phiếu thu/chi', 'danger');
    },
  });

  const settleDebtMutation = useMutation({
    mutationFn: (payload: {
      debtId: string;
      amount: number;
      settlement_date: string;
      payment_method: 'CASH' | 'BANK_TRANSFER';
      note?: string;
    }) => {
      const { debtId, ...rest } = payload;
      return financeApi.createDebtSettlement(debtId, rest);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['receivablePayables'] });
      queryClient.invalidateQueries({ queryKey: ['cashTransactions'] });
      setSettleDebtTarget(null);
      showToast('Đã thu hồi / cấn trừ công nợ thành công!');
    },
    onError: (err: any) => {
      showToast(err?.message || 'Có lỗi khi thu hồi công nợ', 'danger');
    },
  });

  const settleSeasonMutation = useMutation({
    mutationFn: (payload: SettleSeasonPayload) => financeApi.settleSeason(payload),
    onSuccess: (res) => {
      queryClient.invalidateQueries({ queryKey: ['harvestSettlements'] });
      queryClient.invalidateQueries({ queryKey: ['cashTransactions'] });
      queryClient.invalidateQueries({ queryKey: ['receivablePayables'] });
      setSettlementModalOpen(false);
      showToast(`Chốt quyết toán thành công! Thực nhận: ${money(res?.net_payout || 0)}`);
    },
    onError: (err: any) => {
      showToast(err?.message || 'Có lỗi khi chốt quyết toán mùa vụ', 'danger');
    },
  });

  // KPI Calculations
  const totalIncome = cashList
    .filter((c) => c.transactionType === 'INCOME')
    .reduce((sum, c) => sum + (c.amount || 0), 0);

  const totalExpense = cashList
    .filter((c) => c.transactionType === 'EXPENSE')
    .reduce((sum, c) => sum + (c.amount || 0), 0);

  const netBalance = totalIncome - totalExpense;

  const totalReceivables = debtsList
    .filter((d) => d.debtType === 'RECEIVABLE' && d.status !== 'SETTLED')
    .reduce((sum, d) => sum + (d.remainingAmount || 0), 0);

  return (
    <div className="space-y-5 pb-16 animate-fade-in text-slate-800">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-4.5 rounded-2xl border border-slate-200 shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[11.5px] font-mono font-bold text-slate-400">
              {activeCooperative?.legal_name || 'Hợp tác xã'} / Kế toán & Tài chính
            </span>
            <span className="pill-badge pill-blue">Luật HTX 2023</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight mt-0.5">
            Quản trị Dòng tiền, Công nợ & Quyết toán Mùa vụ
          </h1>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5">
        <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-xs flex items-start gap-3">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0 border bg-emerald-50 border-emerald-200 text-emerald-700">
            <TrendingUp className="w-5 h-5" />
          </div>
          <div className="min-w-0">
            <div className="text-[11.8px] text-slate-500 font-medium">Tổng thu tiền vào quỹ</div>
            <div className="text-xl font-black text-emerald-700 mt-0.5 truncate">{money(totalIncome)}</div>
            <div className="text-[10.8px] text-slate-400 mt-0.5">Bán hàng & vốn góp</div>
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-xs flex items-start gap-3">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0 border bg-rose-50 border-rose-200 text-rose-700">
            <TrendingDown className="w-5 h-5" />
          </div>
          <div className="min-w-0">
            <div className="text-[11.8px] text-slate-500 font-medium">Tổng chi tiền ra quỹ</div>
            <div className="text-xl font-black text-rose-700 mt-0.5 truncate">{money(totalExpense)}</div>
            <div className="text-[10.8px] text-slate-400 mt-0.5">Thu mua & mua vật tư</div>
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-xs flex items-start gap-3">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0 border bg-blue-50 border-blue-200 text-blue-700">
            <Wallet className="w-5 h-5" />
          </div>
          <div className="min-w-0">
            <div className="text-[11.8px] text-slate-500 font-medium">Tồn quỹ khả dụng</div>
            <div className={`text-xl font-black mt-0.5 truncate ${netBalance >= 0 ? 'text-slate-900' : 'text-rose-700'}`}>
              {money(netBalance)}
            </div>
            <div className="text-[10.8px] text-slate-400 mt-0.5">Tiền mặt & tài khoản NH</div>
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-xs flex items-start gap-3">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0 border bg-amber-50 border-amber-200 text-amber-700">
            <DollarSign className="w-5 h-5" />
          </div>
          <div className="min-w-0">
            <div className="text-[11.8px] text-slate-500 font-medium">Nợ phải thu xã viên</div>
            <div className="text-xl font-black text-amber-800 mt-0.5 truncate">{money(totalReceivables)}</div>
            <div className="text-[10.8px] text-slate-400 mt-0.5">Tạm ứng phân bón & giống</div>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex border-b border-slate-200 bg-white rounded-t-2xl px-4 pt-2 overflow-x-auto scrollbar-none">
        <button
          type="button"
          onClick={() => handleSelectTab('cashbook')}
          className={`py-2.5 px-4 text-xs font-bold border-b-2 transition-all shrink-0 cursor-pointer flex items-center gap-1.5 ${
            activeTab === 'cashbook'
              ? 'border-emerald-700 text-emerald-800'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Receipt className="w-4 h-4 text-emerald-600" />
          Sổ quỹ Thu - Chi ({cashList.length})
        </button>
        <button
          type="button"
          onClick={() => handleSelectTab('debts')}
          className={`py-2.5 px-4 text-xs font-bold border-b-2 transition-all shrink-0 cursor-pointer flex items-center gap-1.5 ${
            activeTab === 'debts'
              ? 'border-emerald-700 text-emerald-800'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <DollarSign className="w-4 h-4 text-amber-600" />
          Công nợ Phải thu / Phải trả ({debtsList.length})
        </button>
        <button
          type="button"
          onClick={() => handleSelectTab('settlements')}
          className={`py-2.5 px-4 text-xs font-bold border-b-2 transition-all shrink-0 cursor-pointer flex items-center gap-1.5 ${
            activeTab === 'settlements'
              ? 'border-emerald-700 text-emerald-800'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Wheat className="w-4 h-4 text-blue-600" />
          Quyết toán & Cấn trừ Thu mua ({settlements.length})
        </button>
      </div>

      {/* Tab Contents */}
      {activeTab === 'cashbook' && (
        <CashbookTab
          cashList={cashList}
          onOpenModal={() => setCashModalOpen(true)}
          onPrintVoucher={(voucher) => setSelectedVoucherForPrint(voucher)}
          onSelectRow={(item) => setSelectedTransaction(item)}
          selectedId={selectedTransaction?.id}
        />
      )}

      {activeTab === 'debts' && (
        <DebtsTab
          debtsList={debtsList}
          onSettleDebt={(debt) => setSettleDebtTarget(debt)}
        />
      )}

      {activeTab === 'settlements' && (
        <HarvestSettlementsTab
          settlements={settlements}
          onOpenModal={() => setSettlementModalOpen(true)}
        />
      )}

      {/* Modals */}
      <CashTransactionModal
        isOpen={cashModalOpen}
        members={members}
        onClose={() => setCashModalOpen(false)}
        onSubmit={(form) => createCashMutation.mutate(form)}
        isSubmitting={createCashMutation.isPending}
      />

      <DebtSettlementModal
        debt={settleDebtTarget}
        onClose={() => setSettleDebtTarget(null)}
        onSubmit={(payload) => settleDebtMutation.mutate(payload)}
        isSubmitting={settleDebtMutation.isPending}
      />

      <SeasonSettlementModal
        isOpen={settlementModalOpen}
        seasons={seasons}
        members={members}
        onClose={() => setSettlementModalOpen(false)}
        onSubmit={(payload) => settleSeasonMutation.mutate(payload)}
        isSubmitting={settleSeasonMutation.isPending}
      />

      <VoucherPrintModal
        voucher={selectedVoucherForPrint}
        onClose={() => setSelectedVoucherForPrint(null)}
      />

      <CashTransactionDrawer
        transaction={selectedTransaction}
        isOpen={!!selectedTransaction}
        onClose={() => setSelectedTransaction(null)}
        onPrint={(tx) => {
          setSelectedTransaction(null);
          setSelectedVoucherForPrint(tx);
        }}
      />

      {/* Toast Alert */}
      {toast && (
        <div
          className={`fixed bottom-6 right-6 z-50 flex items-center gap-2.5 px-4 py-3 rounded-xl text-white text-xs font-bold shadow-2xl animate-fade-in ${
            toast.type === 'danger' ? 'bg-rose-900' : 'bg-slate-900'
          }`}
        >
          {toast.message}
        </div>
      )}
    </div>
  );
};
