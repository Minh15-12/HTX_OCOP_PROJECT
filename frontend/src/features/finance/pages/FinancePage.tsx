import React, { useState } from 'react';
import {
  Plus,
  ArrowUpRight,
  ArrowDownLeft,
  Wallet,
  Receipt,
  Wheat,
  Calendar,
  User,
  CheckCircle2,
  Clock,
  Search,
  Filter,
  DollarSign,
  AlertCircle,
  TrendingDown,
  TrendingUp,
  FileSpreadsheet,
  Layers,
  Sparkles,
  Printer,
  Download,
  X,
  Building,
} from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  financeApi,
  CashTransaction,
  ReceivablePayable,
  HarvestSettlementRecord,
  SettleSeasonPayload,
} from '@/services/financeApi';
import { fetchCropSeasons, CropSeason } from '@/services/cropSeasonApi';
import { getMembersFromApi } from '@/services/memberService';
import { Member } from '@/types/memberTypes';

const money = (n: number) => (n || 0).toLocaleString('vi-VN') + ' ₫';

function exportToCsv(filename: string, headers: string[], rows: (string | number | undefined | null)[][]) {
  const csvContent =
    '\uFEFF' +
    [
      headers.join(','),
      ...rows.map((row) =>
        row
          .map((field) => {
            const str = String(field ?? '').replace(/"/g, '""');
            return `"${str}"`;
          })
          .join(',')
      ),
    ].join('\r\n');

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

type FinanceTab = 'cashbook' | 'debts' | 'settlements';

export const FinancePage: React.FC = () => {
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState<FinanceTab>('cashbook');
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'danger' } | null>(null);

  const showToast = (message: string, type: 'success' | 'danger' = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3500);
  };

  // ==========================================
  // TAB 1: SỔ QUỸ THU - CHI (CASH TRANSACTIONS)
  // ==========================================
  const [selectedVoucherForPrint, setSelectedVoucherForPrint] = useState<CashTransaction | null>(null);
  const [cashModalOpen, setCashModalOpen] = useState(false);
  const [cashFilterType, setCashFilterType] = useState<'ALL' | 'INCOME' | 'EXPENSE'>('ALL');
  const [cashSearch, setCashSearch] = useState('');
  const [cashForm, setCashForm] = useState({
    transaction_type: 'INCOME' as 'INCOME' | 'EXPENSE',
    transaction_date: new Date().toISOString().slice(0, 10),
    category: 'Thu mua nông sản',
    amount: 5000000,
    description: 'Thanh toán đợt thu hoạch nông sản',
    person_name: 'Nguyễn Văn A',
    member_id: '',
    payment_method: 'BANK_TRANSFER' as 'CASH' | 'BANK_TRANSFER',
  });

  const { data: cashList = [], isLoading: loadingCash } = useQuery({
    queryKey: ['cashTransactions'],
    queryFn: () => financeApi.getCashTransactions().catch(() => []),
  });

  const createCashMutation = useMutation({
    mutationFn: (payload: typeof cashForm) => financeApi.createCashTransaction(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cashTransactions'] });
      setCashModalOpen(false);
      showToast('Đã ghi sổ phiếu Thu / Chi thành công!');
    },
    onError: (err: any) => {
      showToast(err?.message || 'Có lỗi khi tạo phiếu thu/chi', 'danger');
    },
  });

  const filteredCash = cashList.filter((t) => {
    const matchType = cashFilterType === 'ALL' || t.transactionType === cashFilterType;
    const matchSearch =
      t.voucherNumber.toLowerCase().includes(cashSearch.toLowerCase()) ||
      t.personName.toLowerCase().includes(cashSearch.toLowerCase()) ||
      t.category.toLowerCase().includes(cashSearch.toLowerCase()) ||
      t.description.toLowerCase().includes(cashSearch.toLowerCase());
    return matchType && matchSearch;
  });

  const totalIncome = cashList
    .filter((t) => t.transactionType === 'INCOME')
    .reduce((sum, t) => sum + t.amount, 0);

  const totalExpense = cashList
    .filter((t) => t.transactionType === 'EXPENSE')
    .reduce((sum, t) => sum + t.amount, 0);

  const netBalance = totalIncome - totalExpense;

  const handleExportCashbook = () => {
    const headers = ['Mã phiếu', 'Ngày giao dịch', 'Loại phiếu', 'Hạng mục', 'Đối tác / Xã viên', 'Số tiền (VNĐ)', 'Hình thức', 'Trạng thái', 'Nội dung'];
    const rows = filteredCash.map((t) => [
      t.voucherNumber,
      t.transactionDate,
      t.transactionType === 'INCOME' ? 'Phiếu Thu' : 'Phiếu Chi',
      t.category,
      t.personName,
      t.amount,
      t.paymentMethod === 'BANK_TRANSFER' ? 'Chuyển khoản' : 'Tiền mặt',
      t.status === 'POSTED' ? 'Đã ghi sổ' : 'Đã duyệt',
      t.description,
    ]);
    exportToCsv(`So_Quy_HTX_${new Date().toISOString().slice(0, 10)}.csv`, headers, rows);
    showToast('Đã xuất file Excel / CSV Sổ Quỹ thành công!');
  };

  // ==========================================
  // TAB 2: CÔNG NỢ XÃ VIÊN & ĐỐI TÁC (RECEIVABLES/PAYABLES)
  // ==========================================
  const [debtFilterType, setDebtFilterType] = useState<'ALL' | 'RECEIVABLE' | 'PAYABLE'>('ALL');
  const [debtSearch, setDebtSearch] = useState('');
  const [settleDebtModalOpen, setSettleDebtModalOpen] = useState(false);
  const [selectedDebt, setSelectedDebt] = useState<ReceivablePayable | null>(null);
  const [settleDebtDate, setSettleDebtDate] = useState(new Date().toISOString().slice(0, 10));
  const [settleDebtAmount, setSettleDebtAmount] = useState(0);
  const [settleDebtMethod, setSettleDebtMethod] = useState<'CASH' | 'BANK_TRANSFER'>('BANK_TRANSFER');
  const [settleDebtNotes, setSettleDebtNotes] = useState('');

  const { data: debtList = [], isLoading: loadingDebts } = useQuery({
    queryKey: ['receivablePayables'],
    queryFn: () => financeApi.getReceivablePayables().catch(() => []),
  });

  const handleExportDebts = () => {
    const headers = ['Đối tượng', 'Phân loại', 'Tổng nợ ban đầu (VNĐ)', 'Dư nợ còn lại (VNĐ)', 'Hạn tất toán', 'Trạng thái', 'Mô tả'];
    const rows = filteredDebts.map((d) => [
      d.debtorName,
      d.debtType === 'RECEIVABLE' ? 'Phải thu (Vật tư)' : 'Phải trả',
      d.totalAmount,
      d.remainingAmount,
      d.dueDate || 'Theo vụ',
      d.status === 'SETTLED' ? 'Đã tất toán' : d.status === 'PARTIAL' ? 'Đã trả 1 phần' : 'Đang mở',
      d.description,
    ]);
    exportToCsv(`Cong_No_HTX_${new Date().toISOString().slice(0, 10)}.csv`, headers, rows);
    showToast('Đã xuất file Excel / CSV Công Nợ thành công!');
  };

  const createDebtSettlementMutation = useMutation({
    mutationFn: ({ debtId, payload }: { debtId: string; payload: any }) =>
      financeApi.createDebtSettlement(debtId, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['receivablePayables'] });
      queryClient.invalidateQueries({ queryKey: ['cashTransactions'] });
      setSettleDebtModalOpen(false);
      showToast('Đã thu hồi / cấn trừ công nợ thành công!');
    },
    onError: (err: any) => {
      showToast(err?.message || 'Có lỗi khi cấn trừ công nợ', 'danger');
    },
  });

  const filteredDebts = debtList.filter((d) => {
    const matchType = debtFilterType === 'ALL' || d.debtType === debtFilterType;
    const matchSearch =
      d.debtorName.toLowerCase().includes(debtSearch.toLowerCase()) ||
      d.description.toLowerCase().includes(debtSearch.toLowerCase());
    return matchType && matchSearch;
  });

  const totalReceivable = debtList
    .filter((d) => d.debtType === 'RECEIVABLE')
    .reduce((sum, d) => sum + d.remainingAmount, 0);

  const totalPayable = debtList
    .filter((d) => d.debtType === 'PAYABLE')
    .reduce((sum, d) => sum + d.remainingAmount, 0);

  // ==========================================
  // TAB 3: QUYẾT TOÁN MÙA VỤ & CẤN TRỪ NỢ (HARVEST SETTLEMENTS)
  // ==========================================
  const [settlementModalOpen, setSettlementModalOpen] = useState(false);
  const [settlementForm, setSettlementForm] = useState<SettleSeasonPayload>({
    season_id: '',
    member_id: '',
    grade_a_price: 35000,
    grade_b_price: 25000,
    service_fee_rate: 0.025,
  });

  const { data: harvestSettlements = [], isLoading: loadingSettlements } = useQuery({
    queryKey: ['harvestSettlements'],
    queryFn: () => financeApi.getHarvestSettlements().catch(() => []),
  });

  const { data: cropSeasonsData } = useQuery({
    queryKey: ['cropSeasons'],
    queryFn: () => fetchCropSeasons(),
  });
  const seasons: CropSeason[] = Array.isArray(cropSeasonsData?.data)
    ? cropSeasonsData.data
    : (cropSeasonsData as any) || [];

  const { data: members = [] } = useQuery<Member[]>({
    queryKey: ['members'],
    queryFn: () => getMembersFromApi().catch(() => []),
  });

  const settleSeasonMutation = useMutation({
    mutationFn: (payload: SettleSeasonPayload) => financeApi.settleSeason(payload),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['harvestSettlements'] });
      queryClient.invalidateQueries({ queryKey: ['receivablePayables'] });
      queryClient.invalidateQueries({ queryKey: ['cashTransactions'] });
      setSettlementModalOpen(false);
      showToast(
        `Quyết toán mùa vụ thành công! Thực chi: ${money(data.net_payout)} (Cấn trừ nợ: ${money(data.total_debt_offset)})`
      );
    },
    onError: (err: any) => {
      const msg = err?.response?.data?.message || err?.message || 'Có lỗi xảy ra khi quyết toán';
      showToast(msg, 'danger');
    },
  });

  const handleOpenSettleSeason = () => {
    if (seasons.length > 0 && members.length > 0) {
      setSettlementForm((prev) => ({
        ...prev,
        season_id: seasons[0].id,
        member_id: members[0].id,
      }));
    }
    setSettlementModalOpen(true);
  };

  const handleOpenSettleDebt = (debt: ReceivablePayable) => {
    setSelectedDebt(debt);
    setSettleDebtDate(new Date().toISOString().slice(0, 10));
    setSettleDebtAmount(debt.remainingAmount);
    setSettleDebtNotes(`Thanh toán cấn trừ nợ cho ${debt.debtorName}`);
    setSettleDebtModalOpen(true);
  };

  const totalSettledAmount = harvestSettlements.reduce((sum, s) => sum + s.amount, 0);

  const handleExportSettlements = () => {
    const headers = ['Ngày quyết toán', 'Mã phiếu / Tham chiếu', 'Xã viên thụ hưởng', 'Hình thức thanh toán', 'Số tiền cấn trừ (VNĐ)', 'Trạng thái', 'Mô tả'];
    const rows = harvestSettlements.map((s) => [
      s.settlement_date,
      s.voucher_number || s.debt_code,
      s.member_name,
      s.payment_method === 'HARVEST_OFFSET' ? 'Cấn trừ nợ nông sản' : s.payment_method,
      s.amount,
      s.status === 'POSTED' ? 'Đã hoàn tất' : 'Đã ghi sổ',
      s.note,
    ]);
    exportToCsv(`Quyet_Toan_Mua_Vu_${new Date().toISOString().slice(0, 10)}.csv`, headers, rows);
    showToast('Đã xuất file Excel / CSV Quyết Toán Mùa Vụ thành công!');
  };

  return (
    <div className="space-y-4 pb-12 animate-fade-in font-sans">
      {/* Toast Notification */}
      {toast && (
        <div
          className={`fixed top-4 right-4 z-50 px-4 py-3 rounded-xl shadow-modal text-white text-xs font-extrabold flex items-center gap-2 animate-bounce ${
            toast.type === 'success' ? 'bg-emerald-600' : 'bg-rose-600'
          }`}
        >
          {toast.type === 'success' ? <CheckCircle2 className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
          {toast.message}
        </div>
      )}

      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white border border-[#e7e9ec] p-4 rounded-2xl shadow-subtle">
        <div>
          <div className="flex items-center gap-2 text-emerald-800 text-xs font-black uppercase tracking-wider">
            <Wallet className="w-4 h-4 text-emerald-600" /> Quản Trị Tài Chính Hợp Tác Xã (Luật HTX 2023)
          </div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight mt-0.5">
            Sổ Quỹ, Công Nợ & Quyết Toán Mùa Vụ
          </h1>
          <p className="text-[12.8px] text-slate-500 mt-0.5">
            Đồng bộ khép kín: Nhật ký thu hoạch nông sản ➔ Cấn trừ nợ vật tư ứng trước ➔ Thực chi quỹ tiền mặt/ngân hàng.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          {activeTab === 'cashbook' && (
            <button
              onClick={() => setCashModalOpen(true)}
              className="px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-[12.5px] inline-flex items-center gap-1.5 shadow-sm transition-all cursor-pointer"
            >
              <Plus className="w-4 h-4" /> Lập phiếu Thu / Chi
            </button>
          )}
          {activeTab === 'settlements' && (
            <button
              onClick={handleOpenSettleSeason}
              className="px-3.5 py-2 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-extrabold text-[12.5px] inline-flex items-center gap-1.5 shadow-md transition-all cursor-pointer"
            >
              <Sparkles className="w-4 h-4 text-emerald-300" /> Chốt quyết toán mùa vụ mới
            </button>
          )}
        </div>
      </div>

      {/* KPI Overview Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-3.5">
        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-subtle">
          <div className="text-[12px] text-slate-500 font-bold flex items-center justify-between">
            <span className="flex items-center gap-1.5">
              <Wallet className="w-4 h-4 text-emerald-600" /> Tồn Quỹ Cân Đối HTX
            </span>
            <span className="text-[10px] bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full font-black">
              TIỀN MẶT
            </span>
          </div>
          <div className="text-2xl font-black text-slate-900 mt-2">{money(netBalance)}</div>
          <div className="text-[11px] text-slate-400 mt-1">Đã đối chiếu sổ tiền mặt & ngân hàng</div>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-subtle">
          <div className="text-[12px] text-slate-500 font-bold flex items-center justify-between">
            <span className="flex items-center gap-1.5">
              <TrendingUp className="w-4 h-4 text-emerald-600" /> Doanh Thu / Tiền Thu
            </span>
            <span className="text-[10px] bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full font-black">
              THU QUỸ
            </span>
          </div>
          <div className="text-2xl font-black text-emerald-700 mt-2">{money(totalIncome)}</div>
          <div className="text-[11px] text-emerald-600 mt-1 font-semibold">Bao gồm thu bán nông sản & cổ tức</div>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-subtle">
          <div className="text-[12px] text-slate-500 font-bold flex items-center justify-between">
            <span className="flex items-center gap-1.5">
              <TrendingDown className="w-4 h-4 text-rose-600" /> Nợ Vật Tư Phải Thu
            </span>
            <span className="text-[10px] bg-amber-100 text-amber-800 px-2 py-0.5 rounded-full font-black">
              PHẢI THU
            </span>
          </div>
          <div className="text-2xl font-black text-amber-700 mt-2">{money(totalReceivable)}</div>
          <div className="text-[11px] text-slate-500 mt-1">Xã viên nợ phân bón, giống trả chậm</div>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-subtle">
          <div className="text-[12px] text-slate-500 font-bold flex items-center justify-between">
            <span className="flex items-center gap-1.5">
              <Wheat className="w-4 h-4 text-sky-600" /> Đã Cấn Trừ Mùa Vụ
            </span>
            <span className="text-[10px] bg-sky-100 text-sky-800 px-2 py-0.5 rounded-full font-black">
              QUYẾT TOÁN
            </span>
          </div>
          <div className="text-2xl font-black text-sky-700 mt-2">{money(totalSettledAmount)}</div>
          <div className="text-[11px] text-slate-500 mt-1">Tự động cấn trừ qua sản lượng thu hoạch</div>
        </div>
      </div>

      {/* Tabs Navigation */}
      <div className="flex border-b border-slate-200 bg-white px-3 pt-2 rounded-t-xl gap-2 shadow-xs">
        <button
          onClick={() => setActiveTab('cashbook')}
          className={`flex items-center gap-2 px-4 py-2.5 text-xs font-black transition-all border-b-2 cursor-pointer ${
            activeTab === 'cashbook'
              ? 'border-emerald-600 text-emerald-700 bg-emerald-50/50 rounded-t-lg'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Wallet className="w-4 h-4" />
          <span>1. Sổ Quỹ Thu - Chi ({cashList.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('debts')}
          className={`flex items-center gap-2 px-4 py-2.5 text-xs font-black transition-all border-b-2 cursor-pointer ${
            activeTab === 'debts'
              ? 'border-emerald-600 text-emerald-700 bg-emerald-50/50 rounded-t-lg'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Receipt className="w-4 h-4" />
          <span>2. Quản Lý Công Nợ Xã Viên ({debtList.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('settlements')}
          className={`flex items-center gap-2 px-4 py-2.5 text-xs font-black transition-all border-b-2 cursor-pointer ${
            activeTab === 'settlements'
              ? 'border-emerald-600 text-emerald-700 bg-emerald-50/50 rounded-t-lg'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Wheat className="w-4 h-4" />
          <span>3. Quyết Toán Mùa Vụ & Cấn Trừ ({harvestSettlements.length})</span>
        </button>
      </div>

      {/* ========================================================================= */}
      {/* TAB CONTENT 1: SỔ QUỸ THU - CHI */}
      {/* ========================================================================= */}
      {activeTab === 'cashbook' && (
        <div className="bg-white border border-slate-200 rounded-b-xl shadow-subtle overflow-hidden">
          <div className="p-3.5 border-b border-slate-200 bg-slate-50/70 flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2 flex-1 max-w-sm">
              <div className="relative w-full">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                <input
                  type="text"
                  placeholder="Tìm theo mã phiếu, đối tác, nội dung..."
                  value={cashSearch}
                  onChange={(e) => setCashSearch(e.target.value)}
                  className="w-full pl-9 pr-3 py-1.5 text-xs border border-slate-300 rounded-lg bg-white focus:outline-none focus:ring-1 focus:ring-emerald-500"
                />
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={handleExportCashbook}
                className="px-3 py-1.5 rounded-lg border border-slate-300 bg-white hover:bg-slate-50 text-slate-700 font-bold text-xs inline-flex items-center gap-1.5 transition-all shadow-xs cursor-pointer"
                title="Xuất dữ liệu Sổ Quỹ ra Excel/CSV"
              >
                <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-600" />
                <span>Xuất Excel Sổ Quỹ</span>
              </button>

              <span className="text-xs font-bold text-slate-500 ml-2">Loại phiếu:</span>
              <select
                value={cashFilterType}
                onChange={(e) => setCashFilterType(e.target.value as any)}
                className="text-xs border border-slate-300 rounded-lg px-2.5 py-1.5 bg-white font-bold text-slate-700"
              >
                <option value="ALL">Tất cả thu - chi</option>
                <option value="INCOME">Phiếu Thu (+)</option>
                <option value="EXPENSE">Phiếu Chi (-)</option>
              </select>
            </div>
          </div>

          <table className="w-full text-left border-collapse text-[12.9px]">
            <thead>
              <tr className="border-b border-slate-200 text-[11px] uppercase tracking-wider text-slate-500 font-bold bg-slate-50">
                <th className="py-3 px-4">Mã Phiếu</th>
                <th className="py-3 px-4">Ngày giao dịch</th>
                <th className="py-3 px-4">Hạng mục thu/chi</th>
                <th className="py-3 px-4">Đối tác / Xã viên</th>
                <th className="py-3 px-4">Hình thức</th>
                <th className="py-3 px-4 text-right">Số tiền</th>
                <th className="py-3 px-4">Trạng thái</th>
                <th className="py-3 px-4 text-center">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loadingCash ? (
                <tr>
                  <td colSpan={8} className="text-center py-8 text-slate-400 text-xs font-medium">
                    Đang nạp dữ liệu sổ quỹ...
                  </td>
                </tr>
              ) : filteredCash.length === 0 ? (
                <tr>
                  <td colSpan={8} className="text-center py-8 text-slate-400 text-xs font-medium">
                    Chưa có giao dịch thu chi nào phù hợp điều kiện tìm kiếm.
                  </td>
                </tr>
              ) : (
                filteredCash.map((t) => (
                  <tr key={t.id} className="hover:bg-slate-50 transition-colors">
                    <td className="py-3 px-4 font-mono font-bold text-slate-700">{t.voucherNumber}</td>
                    <td className="py-3 px-4 text-slate-600">{t.transactionDate}</td>
                    <td className="py-3 px-4">
                      <div className="font-bold text-slate-900">{t.category}</div>
                      <div className="text-[11px] text-slate-400 truncate max-w-xs">{t.description}</div>
                    </td>
                    <td className="py-3 px-4 text-slate-700 font-medium">{t.personName}</td>
                    <td className="py-3 px-4 text-slate-600 text-xs">
                      {t.paymentMethod === 'BANK_TRANSFER' ? 'Chuyển khoản' : 'Tiền mặt'}
                    </td>
                    <td
                      className={`py-3 px-4 text-right font-black ${
                        t.transactionType === 'INCOME' ? 'text-emerald-700' : 'text-rose-600'
                      }`}
                    >
                      {t.transactionType === 'INCOME' ? '+' : '−'}
                      {money(t.amount)}
                    </td>
                    <td className="py-3 px-4">
                      <span
                        className={`px-2.5 py-0.5 rounded-full text-[11px] font-extrabold ${
                          t.status === 'POSTED' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                        }`}
                      >
                        {t.status === 'POSTED' ? 'Đã ghi sổ' : 'Đã duyệt'}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-center">
                      <button
                        onClick={() => setSelectedVoucherForPrint(t)}
                        className="px-2.5 py-1 text-xs font-bold bg-emerald-50 text-emerald-700 hover:bg-emerald-100 rounded-lg border border-emerald-300 transition-colors cursor-pointer inline-flex items-center gap-1"
                        title="In phiếu Thu/Chi theo mẫu chuẩn"
                      >
                        <Printer className="w-3.5 h-3.5" /> In phiếu
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB CONTENT 2: QUẢN LÝ CÔNG NỢ XÃ VIÊN (RECEIVABLES/PAYABLES) */}
      {/* ========================================================================= */}
      {activeTab === 'debts' && (
        <div className="bg-white border border-slate-200 rounded-b-xl shadow-subtle overflow-hidden">
          <div className="p-3.5 border-b border-slate-200 bg-slate-50/70 flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2 flex-1 max-w-sm">
              <div className="relative w-full">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                <input
                  type="text"
                  placeholder="Tìm theo tên xã viên, mô tả công nợ..."
                  value={debtSearch}
                  onChange={(e) => setDebtSearch(e.target.value)}
                  className="w-full pl-9 pr-3 py-1.5 text-xs border border-slate-300 rounded-lg bg-white focus:outline-none focus:ring-1 focus:ring-emerald-500"
                />
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={handleExportDebts}
                className="px-3 py-1.5 rounded-lg border border-slate-300 bg-white hover:bg-slate-50 text-slate-700 font-bold text-xs inline-flex items-center gap-1.5 transition-all shadow-xs cursor-pointer"
                title="Xuất dữ liệu Công Nợ ra Excel/CSV"
              >
                <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-600" />
                <span>Xuất Excel Công Nợ</span>
              </button>

              <span className="text-xs font-bold text-slate-500 ml-2">Phân loại nợ:</span>
              <select
                value={debtFilterType}
                onChange={(e) => setDebtFilterType(e.target.value as any)}
                className="text-xs border border-slate-300 rounded-lg px-2.5 py-1.5 bg-white font-bold text-slate-700"
              >
                <option value="ALL">Tất cả khoản nợ</option>
                <option value="RECEIVABLE">Phải thu xã viên (Vật tư ứng trước)</option>
                <option value="PAYABLE">Phải trả (Mua nông sản / Nhà cung cấp)</option>
              </select>
            </div>
          </div>

          <table className="w-full text-left border-collapse text-[12.9px]">
            <thead>
              <tr className="border-b border-slate-200 text-[11px] uppercase tracking-wider text-slate-500 font-bold bg-slate-50">
                <th className="py-3 px-4">Đối tượng công nợ</th>
                <th className="py-3 px-4">Phân loại</th>
                <th className="py-3 px-4">Mô tả phát sinh</th>
                <th className="py-3 px-4">Hạn tất toán</th>
                <th className="py-3 px-4 text-right">Tổng nợ ban đầu</th>
                <th className="py-3 px-4 text-right">Dư nợ còn lại</th>
                <th className="py-3 px-4">Trạng thái</th>
                <th className="py-3 px-4 text-center">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loadingDebts ? (
                <tr>
                  <td colSpan={8} className="text-center py-8 text-slate-400 text-xs font-medium">
                    Đang nạp danh sách công nợ...
                  </td>
                </tr>
              ) : filteredDebts.length === 0 ? (
                <tr>
                  <td colSpan={8} className="text-center py-8 text-slate-400 text-xs font-medium">
                    Không có khoản công nợ nào đang mở.
                  </td>
                </tr>
              ) : (
                filteredDebts.map((d) => (
                  <tr key={d.id} className="hover:bg-slate-50 transition-colors">
                    <td className="py-3 px-4">
                      <div className="font-extrabold text-slate-900">{d.debtorName}</div>
                      <div className="text-[11px] text-slate-400">Xã viên chính thức</div>
                    </td>
                    <td className="py-3 px-4">
                      <span
                        className={`px-2 py-0.5 rounded-md text-[11px] font-bold ${
                          d.debtType === 'RECEIVABLE'
                            ? 'bg-amber-100 text-amber-800'
                            : 'bg-indigo-100 text-indigo-800'
                        }`}
                      >
                        {d.debtType === 'RECEIVABLE' ? 'Phải thu (Vật tư)' : 'Phải trả'}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-slate-700 max-w-xs">{d.description || 'Ứng trước phân bón & giống'}</td>
                    <td className="py-3 px-4 text-slate-600 text-xs font-mono">{d.dueDate || 'Theo mùa vụ'}</td>
                    <td className="py-3 px-4 text-right text-slate-500 font-bold">{money(d.totalAmount)}</td>
                    <td className="py-3 px-4 text-right font-black text-rose-700 text-sm">
                      {money(d.remainingAmount)}
                    </td>
                    <td className="py-3 px-4">
                      <span
                        className={`px-2.5 py-0.5 rounded-full text-[11px] font-extrabold ${
                          d.status === 'SETTLED'
                            ? 'bg-emerald-100 text-emerald-800'
                            : d.status === 'PARTIAL'
                            ? 'bg-sky-100 text-sky-800'
                            : 'bg-rose-100 text-rose-800'
                        }`}
                      >
                        {d.status === 'SETTLED'
                          ? 'Đã tất toán'
                          : d.status === 'PARTIAL'
                          ? 'Đã trả 1 phần'
                          : 'Đang mở (Chưa thu)'}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-center">
                      {d.remainingAmount > 0 && (
                        <button
                          onClick={() => handleOpenSettleDebt(d)}
                          className="px-2.5 py-1 text-xs font-bold bg-emerald-50 text-emerald-700 hover:bg-emerald-100 rounded-lg border border-emerald-300 transition-colors"
                        >
                          Thu / Cấn trừ
                        </button>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB CONTENT 3: QUYẾT TOÁN MÙA VỤ & CẤN TRỪ NỢ TỰ ĐỘNG */}
      {/* ========================================================================= */}
      {activeTab === 'settlements' && (
        <div className="bg-white border border-slate-200 rounded-b-xl shadow-subtle overflow-hidden space-y-4 p-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-emerald-50/70 border border-emerald-200 p-4 rounded-xl">
            <div>
              <h3 className="font-extrabold text-emerald-950 text-sm flex items-center gap-2">
                <Wheat className="w-4 h-4 text-emerald-700" />
                Cơ chế quyết toán nông sản & Cấn trừ nợ tự động (Luật HTX 2023)
              </h3>
              <p className="text-[12px] text-emerald-800/80 mt-0.5 max-w-3xl">
                Hệ thống tự động tập hợp tất cả các đợt thu hoạch đạt KCS (Grade A, Grade B) của xã viên trong mùa vụ,
                tính toán tổng giá trị nông sản thu mua, khấu trừ nợ vật tư trả chậm và phí dịch vụ 2.5%, sau đó ghi
                nhận phiếu chi thực nhận về sổ quỹ.
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <button
                onClick={handleExportSettlements}
                className="px-3.5 py-2.5 bg-white border border-emerald-300 hover:bg-emerald-50 text-emerald-800 font-extrabold text-xs rounded-xl shadow-xs inline-flex items-center gap-1.5 shrink-0 cursor-pointer"
              >
                <FileSpreadsheet className="w-4 h-4 text-emerald-600" /> Xuất Excel Quyết Toán
              </button>
              <button
                onClick={handleOpenSettleSeason}
                className="px-4 py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white font-extrabold text-xs rounded-xl shadow-sm inline-flex items-center gap-1.5 shrink-0 cursor-pointer"
              >
                <Plus className="w-4 h-4" /> Lập đợt quyết toán mùa vụ
              </button>
            </div>
          </div>

          <table className="w-full text-left border-collapse text-[12.9px]">
            <thead>
              <tr className="border-b border-slate-200 text-[11px] uppercase tracking-wider text-slate-500 font-bold bg-slate-50">
                <th className="py-3 px-4">Ngày quyết toán</th>
                <th className="py-3 px-4">Mã tham chiếu / Phiếu chi</th>
                <th className="py-3 px-4">Xã viên thụ hưởng</th>
                <th className="py-3 px-4">Hình thức thanh toán</th>
                <th className="py-3 px-4">Mô tả cấn trừ</th>
                <th className="py-3 px-4 text-right">Số tiền cấn trừ / chi trả</th>
                <th className="py-3 px-4">Trạng thái</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loadingSettlements ? (
                <tr>
                  <td colSpan={7} className="text-center py-8 text-slate-400 text-xs font-medium">
                    Đang nạp lịch sử quyết toán mùa vụ...
                  </td>
                </tr>
              ) : harvestSettlements.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-center py-8 text-slate-400 text-xs font-medium">
                    Chưa có đợt quyết toán cấn trừ nợ nào được ghi nhận. Bấm "Lập đợt quyết toán mùa vụ" để bắt đầu.
                  </td>
                </tr>
              ) : (
                harvestSettlements.map((s) => (
                  <tr key={s.id} className="hover:bg-slate-50 transition-colors">
                    <td className="py-3 px-4 text-slate-600 font-mono text-xs">{s.settlement_date}</td>
                    <td className="py-3 px-4 font-mono font-bold text-emerald-800">
                      {s.voucher_number || s.debt_code}
                    </td>
                    <td className="py-3 px-4 font-bold text-slate-900">{s.member_name}</td>
                    <td className="py-3 px-4 text-xs text-slate-600">
                      <span className="px-2 py-0.5 rounded-md bg-emerald-100 text-emerald-800 font-bold">
                        {s.payment_method === 'HARVEST_OFFSET' ? 'Cấn trừ nợ nông sản' : s.payment_method}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-slate-600 max-w-sm">{s.note || 'Cấn trừ tiền vật tư vào sản lượng thu hoạch'}</td>
                    <td className="py-3 px-4 text-right font-black text-emerald-700 text-sm">
                      {money(s.amount)}
                    </td>
                    <td className="py-3 px-4">
                      <span className="px-2.5 py-0.5 rounded-full text-[11px] font-extrabold bg-emerald-100 text-emerald-800">
                        {s.status === 'POSTED' ? 'Đã hoàn tất' : 'Đã ghi sổ'}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 1: LẬP PHIẾU THU / CHI SỔ QUỸ */}
      {/* ========================================================================= */}
      {cashModalOpen && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fade-in">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 space-y-4 shadow-modal border border-slate-100">
            <h3 className="text-lg font-extrabold text-slate-900">Tạo Phiếu Thu / Chi Sổ Quỹ</h3>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                createCashMutation.mutate(cashForm);
              }}
              className="space-y-3 text-xs"
            >
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Loại phiếu *</label>
                  <select
                    value={cashForm.transaction_type}
                    onChange={(e) => setCashForm({ ...cashForm, transaction_type: e.target.value as any })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg font-bold text-slate-800"
                  >
                    <option value="INCOME">Phiếu Thu (+)</option>
                    <option value="EXPENSE">Phiếu Chi (-)</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Ngày giao dịch *</label>
                  <input
                    type="date"
                    value={cashForm.transaction_date}
                    onChange={(e) => setCashForm({ ...cashForm, transaction_date: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg font-bold text-slate-800"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Chọn nhanh Xã viên (tùy chọn)</label>
                <select
                  value={cashForm.member_id}
                  onChange={(e) => {
                    const mId = e.target.value;
                    const found = members.find((m) => m.id === mId);
                    setCashForm({
                      ...cashForm,
                      member_id: mId,
                      person_name: found ? `${found.full_name} (${found.member_code})` : cashForm.person_name,
                    });
                  }}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-slate-700 bg-slate-50"
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
                  value={cashForm.category}
                  onChange={(e) => setCashForm({ ...cashForm, category: e.target.value })}
                  placeholder="Ví dụ: Thu mua Ớt Sweet Palermo, Mua phân bón..."
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg font-medium"
                  required
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Số tiền (VNĐ) *</label>
                <input
                  type="number"
                  min="1000"
                  step="1000"
                  value={cashForm.amount}
                  onChange={(e) => setCashForm({ ...cashForm, amount: Number(e.target.value) })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg font-black text-emerald-800 text-sm"
                  required
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Đối tác / Người nộp hoặc nhận *</label>
                <input
                  type="text"
                  value={cashForm.person_name}
                  onChange={(e) => setCashForm({ ...cashForm, person_name: e.target.value })}
                  placeholder="Tên xã viên, doanh nghiệp hoặc nhà cung cấp"
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg font-medium"
                  required
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Hình thức thanh toán</label>
                <select
                  value={cashForm.payment_method}
                  onChange={(e) => setCashForm({ ...cashForm, payment_method: e.target.value as any })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg font-bold"
                >
                  <option value="BANK_TRANSFER">Chuyển khoản ngân hàng</option>
                  <option value="CASH">Tiền mặt tại quỹ HTX</option>
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Mô tả / Ghi chú</label>
                <textarea
                  value={cashForm.description}
                  onChange={(e) => setCashForm({ ...cashForm, description: e.target.value })}
                  rows={2}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setCashModalOpen(false)}
                  className="px-4 py-2 border border-slate-300 rounded-lg font-bold text-slate-600 hover:bg-slate-50"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  disabled={createCashMutation.isPending}
                  className="px-4 py-2 bg-emerald-700 text-white rounded-lg font-bold hover:bg-emerald-800 shadow-sm"
                >
                  {createCashMutation.isPending ? 'Đang lưu...' : 'Lưu & Ghi sổ'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 2: THU HỒI / CẤN TRỪ CÔNG NỢ */}
      {/* ========================================================================= */}
      {settleDebtModalOpen && selectedDebt && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fade-in">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 space-y-4 shadow-modal border border-slate-100">
            <h3 className="text-lg font-extrabold text-slate-900">Thu Hồi / Cấn Trừ Công Nợ</h3>
            <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 text-xs space-y-1">
              <div>
                Đối tượng: <strong className="text-slate-900">{selectedDebt.debtorName}</strong>
              </div>
              <div>
                Dư nợ hiện tại:{' '}
                <strong className="text-rose-700 font-black">{money(selectedDebt.remainingAmount)}</strong>
              </div>
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                createDebtSettlementMutation.mutate({
                  debtId: selectedDebt.id,
                  payload: {
                    amount: settleDebtAmount,
                    settlement_date: settleDebtDate,
                    payment_method: settleDebtMethod,
                    note: settleDebtNotes,
                  },
                });
              }}
              className="space-y-3 text-xs"
            >
              <div>
                <label className="block font-bold text-slate-700 mb-1">Ngày thanh toán / cấn trừ *</label>
                <input
                  type="date"
                  value={settleDebtDate}
                  onChange={(e) => setSettleDebtDate(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg font-bold text-slate-800"
                  required
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Số tiền thanh toán / cấn trừ *</label>
                <input
                  type="number"
                  min="1000"
                  max={selectedDebt.remainingAmount}
                  step="1000"
                  value={settleDebtAmount}
                  onChange={(e) => setSettleDebtAmount(Number(e.target.value))}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg font-black text-emerald-800 text-sm"
                  required
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Hình thức thanh toán</label>
                <select
                  value={settleDebtMethod}
                  onChange={(e) => setSettleDebtMethod(e.target.value as any)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg font-bold"
                >
                  <option value="BANK_TRANSFER">Chuyển khoản</option>
                  <option value="CASH">Tiền mặt</option>
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Ghi chú</label>
                <textarea
                  value={settleDebtNotes}
                  onChange={(e) => setSettleDebtNotes(e.target.value)}
                  placeholder="Ghi chú đợt thanh toán..."
                  rows={2}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setSettleDebtModalOpen(false)}
                  className="px-4 py-2 border border-slate-300 rounded-lg font-bold text-slate-600 hover:bg-slate-50"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  disabled={createDebtSettlementMutation.isPending}
                  className="px-4 py-2 bg-emerald-700 text-white rounded-lg font-bold hover:bg-emerald-800 shadow-sm"
                >
                  {createDebtSettlementMutation.isPending ? 'Đang xử lý...' : 'Xác nhận thu nợ'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 3: CHỐT QUYẾT TOÁN MÙA VỤ & CẤN TRỪ NỢ (SECTION 24 & 26) */}
      {/* ========================================================================= */}
      {settlementModalOpen && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fade-in">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 space-y-4 shadow-modal border border-slate-100">
            <div className="flex items-center gap-2 text-emerald-800">
              <Wheat className="w-5 h-5 text-emerald-600" />
              <h3 className="text-lg font-extrabold text-slate-900">Chốt Quyết Toán Mùa Vụ Nông Sản</h3>
            </div>
            <p className="text-xs text-slate-500">
              Khấu trừ nợ vật tư trả chậm từ tiền thu mua nông sản theo định mức phẩm cấp KCS Grade A / B.
            </p>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                settleSeasonMutation.mutate(settlementForm);
              }}
              className="space-y-3.5 text-xs"
            >
              <div>
                <label className="block font-bold text-slate-700 mb-1">Mùa vụ canh tác *</label>
                <select
                  value={settlementForm.season_id}
                  onChange={(e) => setSettlementForm({ ...settlementForm, season_id: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg font-bold text-slate-800"
                  required
                >
                  {seasons.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.name} ({s.crop}) - {s.status}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Xã viên quyết toán *</label>
                <select
                  value={settlementForm.member_id}
                  onChange={(e) => setSettlementForm({ ...settlementForm, member_id: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg font-bold text-slate-800"
                  required
                >
                  {members.map((m) => (
                    <option key={m.id} value={m.id}>
                      {m.full_name} ({m.member_code}) - Vốn góp: {money(m.total_capital_contributed || 0)}
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
                    value={settlementForm.grade_a_price}
                    onChange={(e) =>
                      setSettlementForm({ ...settlementForm, grade_a_price: Number(e.target.value) })
                    }
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg font-bold text-emerald-800"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Đơn giá Loại B (đ/kg)</label>
                  <input
                    type="number"
                    step="1000"
                    value={settlementForm.grade_b_price}
                    onChange={(e) =>
                      setSettlementForm({ ...settlementForm, grade_b_price: Number(e.target.value) })
                    }
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg font-bold text-emerald-800"
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
                  value={settlementForm.service_fee_rate}
                  onChange={(e) =>
                    setSettlementForm({ ...settlementForm, service_fee_rate: Number(e.target.value) })
                  }
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg font-bold text-slate-700"
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
                  onClick={() => setSettlementModalOpen(false)}
                  className="px-4 py-2 border border-slate-300 rounded-lg font-bold text-slate-600 hover:bg-slate-50"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  disabled={settleSeasonMutation.isPending}
                  className="px-5 py-2 bg-emerald-700 text-white rounded-lg font-extrabold hover:bg-emerald-800 shadow-md flex items-center gap-1.5"
                >
                  {settleSeasonMutation.isPending ? 'Đang quyết toán...' : 'Chốt Quyết Toán Ngay'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 4: IN CHỨNG TỪ THU / CHI KẾ TOÁN (VOUCHER PRINT PREVIEW) */}
      {/* ========================================================================= */}
      {selectedVoucherForPrint && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fade-in">
          <div className="bg-white rounded-2xl max-w-2xl w-full p-6 space-y-5 shadow-2xl border border-slate-200 text-slate-800">
            {/* Action Bar (Top) */}
            <div className="flex items-center justify-between border-b pb-3 border-slate-200">
              <div className="flex items-center gap-2">
                <Printer className="w-5 h-5 text-emerald-700" />
                <span className="font-extrabold text-sm text-slate-900">
                  Xem & In Chứng Từ Kế Toán HTX
                </span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => window.print()}
                  className="px-3.5 py-1.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded-lg font-bold text-xs inline-flex items-center gap-1.5 cursor-pointer shadow-sm transition-all"
                >
                  <Printer className="w-4 h-4" /> In Phiếu (Print)
                </button>
                <button
                  onClick={() => setSelectedVoucherForPrint(null)}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Printable Voucher Paper */}
            <div className="border border-slate-300 rounded-xl p-6 bg-slate-50/50 space-y-4 font-serif text-xs">
              <div className="flex justify-between items-start border-b border-dashed border-slate-300 pb-4">
                <div>
                  <div className="font-bold text-[11px] uppercase tracking-wide text-slate-700">
                    HỢP TÁC XÃ NÔNG NGHIỆP CÔNG NGHỆ CAO
                  </div>
                  <div className="text-[10px] text-slate-500 mt-0.5">
                    Hệ thống Quản trị HTX & Nông sản OCOP
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-bold text-[11px] text-slate-700">
                    Mẫu số: {selectedVoucherForPrint.transactionType === 'INCOME' ? '01-TT' : '02-TT'}
                  </div>
                  <div className="text-[10px] text-slate-500 italic">
                    (Ban hành theo Thông tư 200/2014/TT-BTC)
                  </div>
                  <div className="font-mono font-bold text-emerald-800 mt-1">
                    Số: {selectedVoucherForPrint.voucherNumber}
                  </div>
                </div>
              </div>

              <div className="text-center py-2">
                <h2 className="text-xl font-black uppercase tracking-wider text-slate-900 font-sans">
                  {selectedVoucherForPrint.transactionType === 'INCOME' ? 'PHIẾU THU' : 'PHIẾU CHI'}
                </h2>
                <div className="text-slate-500 italic text-[11px] mt-0.5">
                  Ngày {selectedVoucherForPrint.transactionDate.split('-')[2] || '...'} tháng {selectedVoucherForPrint.transactionDate.split('-')[1] || '...'} năm {selectedVoucherForPrint.transactionDate.split('-')[0] || '...'}
                </div>
              </div>

              <div className="space-y-2 text-slate-800 font-sans leading-relaxed text-[12.5px]">
                <div className="flex">
                  <span className="w-44 text-slate-600">
                    {selectedVoucherForPrint.transactionType === 'INCOME' ? 'Họ tên người nộp tiền:' : 'Họ tên người nhận tiền:'}
                  </span>
                  <span className="font-bold flex-1">{selectedVoucherForPrint.personName}</span>
                </div>
                <div className="flex">
                  <span className="w-44 text-slate-600">Hạng mục thu / chi:</span>
                  <span className="font-medium flex-1">{selectedVoucherForPrint.category}</span>
                </div>
                <div className="flex">
                  <span className="w-44 text-slate-600">Lý do / Nội dung:</span>
                  <span className="flex-1 italic">{selectedVoucherForPrint.description || 'Thanh toán nghiệp vụ HTX'}</span>
                </div>
                <div className="flex">
                  <span className="w-44 text-slate-600">Số tiền:</span>
                  <span className="font-black text-emerald-800 text-sm flex-1">
                    {money(selectedVoucherForPrint.amount)}
                  </span>
                </div>
                <div className="flex">
                  <span className="w-44 text-slate-600">Hình thức thanh toán:</span>
                  <span className="font-medium flex-1">
                    {selectedVoucherForPrint.paymentMethod === 'BANK_TRANSFER' ? 'Chuyển khoản qua ngân hàng' : 'Tiền mặt tại quỹ HTX'}
                  </span>
                </div>
                <div className="flex">
                  <span className="w-44 text-slate-600">Chứng từ gốc kèm theo:</span>
                  <span className="italic text-slate-500 flex-1">01 chứng từ giao dịch</span>
                </div>
              </div>

              {/* Signatures */}
              <div className="grid grid-cols-4 gap-2 pt-6 text-center font-sans">
                <div>
                  <div className="font-bold text-[11px]">Giám đốc HTX</div>
                  <div className="text-[10px] text-slate-400 italic">(Ký, họ tên, đóng dấu)</div>
                  <div className="h-16"></div>
                  <div className="font-bold text-[11px] text-slate-700">Ban Giám Đốc</div>
                </div>
                <div>
                  <div className="font-bold text-[11px]">Kế toán trưởng</div>
                  <div className="text-[10px] text-slate-400 italic">(Ký, họ tên)</div>
                  <div className="h-16"></div>
                  <div className="font-bold text-[11px] text-slate-700">Kế toán HTX</div>
                </div>
                <div>
                  <div className="font-bold text-[11px]">Thủ quỹ</div>
                  <div className="text-[10px] text-slate-400 italic">(Ký, họ tên)</div>
                  <div className="h-16"></div>
                  <div className="font-bold text-[11px] text-slate-700">Thủ quỹ HTX</div>
                </div>
                <div>
                  <div className="font-bold text-[11px]">
                    {selectedVoucherForPrint.transactionType === 'INCOME' ? 'Người nộp tiền' : 'Người nhận tiền'}
                  </div>
                  <div className="text-[10px] text-slate-400 italic">(Ký, họ tên)</div>
                  <div className="h-16"></div>
                  <div className="font-bold text-[11px] text-slate-700">{selectedVoucherForPrint.personName}</div>
                </div>
              </div>
            </div>

            {/* Bottom Close Button */}
            <div className="flex justify-end pt-2">
              <button
                onClick={() => setSelectedVoucherForPrint(null)}
                className="px-4 py-2 border border-slate-300 rounded-lg font-bold text-xs text-slate-700 hover:bg-slate-50 cursor-pointer"
              >
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
