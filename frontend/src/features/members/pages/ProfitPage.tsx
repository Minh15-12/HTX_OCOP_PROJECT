import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  Wallet,
  Search,
  Plus,
  Eye,
  CheckCircle2,
  AlertCircle,
  TrendingUp,
  Calendar,
  ChevronRight,
  X,
  Printer,
  ShieldCheck,
  Percent,
  RefreshCw,
  Send,
  Lock,
  Download,
  FileSpreadsheet,
} from 'lucide-react';
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
} from 'recharts';
import {
  fetchSurplusPlansApi,
  createSurplusPlanApi,
  submitSurplusPlanApi,
  approveSurplusPlanApi,
  mockSurplusPlan,
  mockSurplusItems,
} from '@/services/memberService';
import { SurplusDistributionPlan, SurplusDistributionItem } from '@/types/memberTypes';

const PIE_COLORS = ['#059669', '#9333ea', '#2563eb', '#f59e0b'];

export const ProfitPage: React.FC = () => {
  const queryClient = useQueryClient();
  const [selectedPlanId, setSelectedPlanId] = useState<string>('');
  const [search, setSearch] = useState('');
  const [profitStatusFilter, setProfitStatusFilter] = useState<string>('ALL');
  const [selectedSurplusItem, setSelectedSurplusItem] = useState<SurplusDistributionItem | null>(null);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'danger' } | null>(null);

  // Modals state
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isPrintModalOpen, setIsPrintModalOpen] = useState(false);

  const triggerToast = (message: string, type: 'success' | 'danger' = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3500);
  };

  // Fetch plans with React Query
  const { data: plansResponse, isLoading: plansLoading } = useQuery({
    queryKey: ['surplusPlans'],
    queryFn: () => fetchSurplusPlansApi({ per_page: 50 }),
  });

  const apiPlans: any[] = plansResponse?.data ?? [];

  // Active Surplus Plan
  const [surplusPlan, setSurplusPlan] = useState<SurplusDistributionPlan>(mockSurplusPlan);
  const [surplusItems, setSurplusItems] = useState<SurplusDistributionItem[]>(mockSurplusItems);

  // Form for bisection & fund rates
  const [profitPlanForm, setProfitPlanForm] = useState({
    fiscal_year: surplusPlan.fiscal_year,
    internal_service_surplus: surplusPlan.internal_service_surplus || 850000000,
    external_service_surplus: surplusPlan.external_service_surplus || 400000000,
    unallocated_common_fund_rate: surplusPlan.unallocated_common_fund_rate || 5,
    reserve_fund_rate: surplusPlan.reserve_fund_rate || 10,
    patronage_rebate_rate: surplusPlan.patronage_rebate_rate || 55,
    welfare_fund_rate: surplusPlan.welfare_fund_rate || 5,
    planned_payout_date: surplusPlan.planned_payout_date || '2026-03-15',
    notes: surplusPlan.notes || '',
  });

  // New Plan Modal Form State
  const [createForm, setCreateForm] = useState({
    financial_year: new Date().getFullYear(),
    total_surplus: 1250000000,
    distributable_surplus: 1042500000,
    capital_weight: 45,
    service_usage_weight: 55,
    custom_plan_code: `PADP-${new Date().getFullYear()}-01`,
  });

  // React Query Mutations
  const createPlanMutation = useMutation({
    mutationFn: createSurplusPlanApi,
    onSuccess: (res) => {
      queryClient.invalidateQueries({ queryKey: ['surplusPlans'] });
      triggerToast('Đã khởi tạo đợt phân chia thặng dư niên độ mới thành công!');
      setIsCreateModalOpen(false);
      if (res?.data) {
        setSelectedPlanId(res.data.id);
      }
    },
    onError: (err: any) => {
      triggerToast(err?.response?.data?.message || err?.message || 'Khởi tạo đợt phân chia thất bại', 'danger');
    },
  });

  const submitPlanMutation = useMutation({
    mutationFn: submitSurplusPlanApi,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['surplusPlans'] });
      setSurplusPlan((prev) => ({ ...prev, status: 'DRAFT' as any }));
      triggerToast('Đã gửi trình duyệt phương án phân chia thặng dư cho Giám đốc!');
    },
    onError: (err: any) => {
      triggerToast(err?.response?.data?.message || 'Gửi duyệt phương án thất bại', 'danger');
    },
  });

  const approvePlanMutation = useMutation({
    mutationFn: approveSurplusPlanApi,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['surplusPlans'] });
      setSurplusPlan((prev) => ({ ...prev, status: 'APPROVED' }));
      triggerToast('Giám đốc đã phê duyệt phương án phân chia thặng dư!');
    },
    onError: (err: any) => {
      triggerToast(err?.response?.data?.message || 'Phê duyệt phương án thất bại', 'danger');
    },
  });

  // Financial calculations
  const totalNetProfit = profitPlanForm.internal_service_surplus + profitPlanForm.external_service_surplus * 0.8;
  const unallocatedCommonFundAmount = (profitPlanForm.external_service_surplus * profitPlanForm.unallocated_common_fund_rate) / 100;
  const reserveFundAmount = (totalNetProfit * profitPlanForm.reserve_fund_rate) / 100;
  const welfareFundAmount = (totalNetProfit * profitPlanForm.welfare_fund_rate) / 100;
  const memberDistributableAmount = totalNetProfit - unallocatedCommonFundAmount - reserveFundAmount - welfareFundAmount;

  const distributedProfitAmount = surplusItems
    .filter((i) => i.payout_status === 'DA_NHAN')
    .reduce((sum, i) => sum + (i.net_payout_amount ?? i.total_payout_amount ?? 0), 0);
  const distributedProfitPct = Math.round((distributedProfitAmount / (totalNetProfit || 1)) * 100);
  const paidMemberCount = surplusItems.filter((i) => i.payout_status === 'DA_NHAN').length;
  const unpaidMemberCount = surplusItems.filter((i) => i.payout_status === 'CHUA_NHAN').length;

  // Chart data
  const pieData = [
    { name: 'Chia cho xã viên (85%)', value: memberDistributableAmount },
    { name: 'Quỹ chung không chia (5%)', value: unallocatedCommonFundAmount },
    { name: 'Quỹ ĐTPT & Dự phòng (10%)', value: reserveFundAmount },
    { name: 'Quỹ Phúc lợi (5%)', value: welfareFundAmount },
  ];

  const barData = [
    { month: 'Tháng 1', paid: 150000000, unpaid: 50000000 },
    { month: 'Tháng 2', paid: 280000000, unpaid: 40000000 },
    { month: 'Tháng 3', paid: 420000000, unpaid: 30000000 },
    { month: 'Tháng 4', paid: 550000000, unpaid: 20000000 },
    { month: 'Tháng 5', paid: 780000000, unpaid: 15000000 },
    { month: 'Tháng 6', paid: 1042500000, unpaid: 0 },
  ];

  const handleUpdateProfitPlan = (e: React.FormEvent) => {
    e.preventDefault();
    if (profitPlanForm.unallocated_common_fund_rate < 5) {
      triggerToast('VI PHẠM NGHỊ ĐỊNH 113/2024: Quỹ chung không chia tối thiểu phải đạt 5% từ thu nhập bên ngoài!', 'danger');
      return;
    }
    if (profitPlanForm.patronage_rebate_rate < 51) {
      triggerToast('VI PHẠM ĐIỀU 86 LUẬT HTX 2023: Tỷ lệ chia theo sử dụng dịch vụ nội bộ tối thiểu phải đạt 51%!', 'danger');
      return;
    }

    setSurplusPlan({
      ...surplusPlan,
      fiscal_year: profitPlanForm.fiscal_year,
      internal_service_surplus: profitPlanForm.internal_service_surplus,
      external_service_surplus: profitPlanForm.external_service_surplus,
      total_net_profit: totalNetProfit,
      unallocated_common_fund_rate: profitPlanForm.unallocated_common_fund_rate,
      unallocated_common_fund_amount: unallocatedCommonFundAmount,
      reserve_fund_rate: profitPlanForm.reserve_fund_rate,
      reserve_fund_amount: reserveFundAmount,
      patronage_rebate_rate: profitPlanForm.patronage_rebate_rate,
      member_share_amount: memberDistributableAmount,
      welfare_fund_rate: profitPlanForm.welfare_fund_rate,
      welfare_fund_amount: welfareFundAmount,
      planned_payout_date: profitPlanForm.planned_payout_date,
      notes: profitPlanForm.notes,
    });

    triggerToast(`Đã cập nhật phương án phân chia thặng dư năm ${profitPlanForm.fiscal_year} theo Luật HTX 2023!`);
  };

  const handleToggleReinvest = (itemId: string) => {
    setSurplusItems((prev) =>
      prev.map((item) =>
        item.id === itemId
          ? {
              ...item,
              reinvest_as_capital: !item.reinvest_as_capital,
            }
          : item
      )
    );
    const it = surplusItems.find((i) => i.id === itemId);
    if (it) {
      triggerToast(
        !it.reinvest_as_capital
          ? `Đã đăng ký tái đầu tư thặng dư thành vốn góp bổ sung cho xã viên ${it.member_name}!`
          : `Đã hủy tái đầu tư, nhận thặng dư bằng tiền mặt/chuyển khoản cho ${it.member_name}.`
      );
    }
  };

  const handleCreateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (createForm.service_usage_weight < 51) {
      triggerToast('VI PHẠM ĐIỀU 86 LUẬT HTX 2023: Tỷ trọng phân chia theo sử dụng dịch vụ nội bộ tối thiểu phải đạt 51%!', 'danger');
      return;
    }
    if (createForm.capital_weight + createForm.service_usage_weight !== 100) {
      triggerToast('Tổng tỷ trọng phân chia theo vốn và dịch vụ phải đúng bằng 100%!', 'danger');
      return;
    }

    createPlanMutation.mutate({
      financial_year: Number(createForm.financial_year),
      total_surplus: Number(createForm.total_surplus),
      distributable_surplus: Number(createForm.distributable_surplus),
      capital_weight: Number(createForm.capital_weight),
      service_usage_weight: Number(createForm.service_usage_weight),
      custom_plan_code: createForm.custom_plan_code,
    });
  };

  const filteredSurplusItems = surplusItems.filter((i) => {
    const matchSearch =
      i.member_name.toLowerCase().includes(search.toLowerCase()) ||
      i.member_code.toLowerCase().includes(search.toLowerCase());
    const matchStatus = profitStatusFilter === 'ALL' || i.payout_status === profitStatusFilter;
    return matchSearch && matchStatus;
  });

  return (
    <div className="space-y-4 pb-12 animate-fade-in font-sans text-[13px] text-slate-700">
      {toast && (
        <div className={`fixed top-4 right-4 z-50 px-4 py-3 rounded-xl shadow-modal text-white text-xs font-extrabold flex items-center gap-2 animate-bounce ${toast.type === 'danger' ? 'bg-rose-600' : 'bg-emerald-600'}`}>
          <CheckCircle2 className="w-4 h-4" />
          {toast.message}
        </div>
      )}

      {/* Breadcrumb Header */}
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold text-slate-400">
            <span>Quản trị HTX</span>
            <ChevronRight className="w-3.5 h-3.5" />
            <span className="text-slate-800">Phân chia thặng dư & Lợi nhuận (Luật HTX 2023)</span>
          </div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight mt-1">
            Phân chia Thặng dư Xã viên theo Giao dịch Nội bộ
          </h1>
          <p className="text-xs text-slate-500">
            Bóc tách thu nhập nội bộ (TK 512 - Miễn thuế TNDN), trích Quỹ chung không chia (NĐ 113/2024) và chia thưởng Patronage Rebate ($\ge 51\%$)
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {surplusPlan.status !== 'APPROVED' && (
            <button
              onClick={() => submitPlanMutation.mutate(surplusPlan.id)}
              disabled={submitPlanMutation.isPending}
              className="px-3.5 py-2 bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs rounded-xl shadow-sm inline-flex items-center gap-1.5 transition cursor-pointer"
            >
              <Send className="w-3.5 h-3.5" /> Gửi trình duyệt
            </button>
          )}

          {surplusPlan.status !== 'APPROVED' && (
            <button
              onClick={() => approvePlanMutation.mutate(surplusPlan.id)}
              disabled={approvePlanMutation.isPending}
              className="px-3.5 py-2 bg-blue-700 hover:bg-blue-800 text-white font-bold text-xs rounded-xl shadow-sm inline-flex items-center gap-1.5 transition cursor-pointer"
            >
              <Lock className="w-3.5 h-3.5" /> Giám đốc Phê duyệt
            </button>
          )}

          <button
            onClick={() => setIsCreateModalOpen(true)}
            className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-sm inline-flex items-center gap-1.5 transition cursor-pointer"
          >
            <Plus className="w-4 h-4" /> Tạo đợt phân chia mới
          </button>
        </div>
      </div>

      {/* TOP 5 KPI STATS CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
        <div className="bg-white border border-[#e7e9ec] p-4 rounded-2xl shadow-xs space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-400 uppercase">Tổng lợi nhuận khả dụng</span>
            <div className="w-8 h-8 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center">
              <Wallet className="w-4 h-4" />
            </div>
          </div>
          <div className="text-xl font-black text-slate-900">{totalNetProfit.toLocaleString('vi-VN')} ₫</div>
          <div className="text-[11px] font-bold text-emerald-600 flex items-center gap-1">
            <ShieldCheck className="w-3.5 h-3.5" /> Miễn thuế TNDN nội bộ
          </div>
        </div>

        <div className="bg-white border border-[#e7e9ec] p-4 rounded-2xl shadow-xs space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-400 uppercase">Quỹ chung không chia</span>
            <div className="w-8 h-8 rounded-xl bg-purple-100 text-purple-700 flex items-center justify-center">
              <Percent className="w-4 h-4" />
            </div>
          </div>
          <div className="text-xl font-black text-purple-900">{unallocatedCommonFundAmount.toLocaleString('vi-VN')} ₫</div>
          <div className="text-[11px] text-slate-500 font-semibold">Tối thiểu 5% thu nhập bên ngoài</div>
        </div>

        <div className="bg-white border border-[#e7e9ec] p-4 rounded-2xl shadow-xs space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-400 uppercase">Chia thưởng dịch vụ (&ge;51%)</span>
            <div className="w-8 h-8 rounded-xl bg-blue-100 text-blue-600 flex items-center justify-center">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div className="text-xl font-black text-blue-900">
            {((memberDistributableAmount * profitPlanForm.patronage_rebate_rate) / 100).toLocaleString('vi-VN')} ₫
          </div>
          <div className="text-[11px] text-blue-600 font-semibold">Patronage Rebate theo doanh số</div>
        </div>

        <div className="bg-white border border-[#e7e9ec] p-4 rounded-2xl shadow-xs space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-400 uppercase">Đã chi trả thực tế</span>
            <div className="w-8 h-8 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <div className="text-xl font-black text-emerald-800">{distributedProfitAmount.toLocaleString('vi-VN')} ₫</div>
          <div className="w-full bg-slate-100 rounded-full h-1.5 mt-1 overflow-hidden">
            <div className="bg-emerald-600 h-1.5 rounded-full transition-all" style={{ width: `${distributedProfitPct}%` }}></div>
          </div>
        </div>

        <div className="bg-white border border-[#e7e9ec] p-4 rounded-2xl shadow-xs space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-400 uppercase">Niên độ kế toán</span>
            <div className="w-8 h-8 rounded-xl bg-slate-100 text-slate-600 flex items-center justify-center">
              <Calendar className="w-4 h-4" />
            </div>
          </div>
          <select
            value={selectedPlanId}
            onChange={(e) => setSelectedPlanId(e.target.value)}
            className="w-full mt-1 bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-1 text-xs font-bold text-slate-800 outline-none"
          >
            <option value="">Niên độ 2025 (Mới nhất)</option>
            {apiPlans.map((p) => (
              <option key={p.id} value={p.id}>
                {p.plan_code} (Năm {p.financial_year})
              </option>
            ))}
            <option value="2024">Niên độ 2024 (Đã duyệt)</option>
          </select>
        </div>
      </div>

      {/* FORM BÓC TÁCH THU NHẬP NỘI BỘ VS BÊN NGOÀI & TỶ LỆ TRÍCH QUỸ */}
      <div className="bg-white border border-[#e7e9ec] rounded-2xl p-5 shadow-xs space-y-4">
        <div className="flex justify-between items-center border-b border-slate-100 pb-3">
          <h3 className="font-extrabold text-slate-900 text-sm flex items-center gap-2">
            <ShieldCheck className="w-4.5 h-4.5 text-emerald-600" /> Tham số Bóc tách Thu nhập & Cấu hình Trích Quỹ (Luật HTX 2023)
          </h3>
          <span className="text-[11px] text-emerald-800 font-bold bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200">
            Thông tư 71/2024/TT-BTC & Nghị định 113/2024/NĐ-CP
          </span>
        </div>

        <form onSubmit={handleUpdateProfitPlan} className="space-y-4 text-xs">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
            <div>
              <label className="block font-bold text-slate-700 mb-1">Lợi nhuận Giao dịch Nội bộ (TK 512) *</label>
              <div className="relative">
                <input
                  type="number"
                  value={profitPlanForm.internal_service_surplus}
                  onChange={(e) => setProfitPlanForm({ ...profitPlanForm, internal_service_surplus: Number(e.target.value) })}
                  className="w-full px-3 py-2 border border-emerald-300 bg-emerald-50/20 rounded-xl font-extrabold text-emerald-900 text-sm outline-none"
                />
                <span className="text-[10.5px] text-emerald-700 font-bold block mt-1">Miễn 100% thuế TNDN</span>
              </div>
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">Lợi nhuận Giao dịch Bên ngoài (TK 511) *</label>
              <div className="relative">
                <input
                  type="number"
                  value={profitPlanForm.external_service_surplus}
                  onChange={(e) => setProfitPlanForm({ ...profitPlanForm, external_service_surplus: Number(e.target.value) })}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl font-bold text-slate-900 text-sm outline-none"
                />
                <span className="text-[10.5px] text-slate-500 font-bold block mt-1">
                  Thuế TNDN 20% = {(profitPlanForm.external_service_surplus * 0.2).toLocaleString('vi-VN')} ₫
                </span>
              </div>
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">Quỹ chung không chia (Min 5%)</label>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  min={5}
                  max={50}
                  value={profitPlanForm.unallocated_common_fund_rate}
                  onChange={(e) => setProfitPlanForm({ ...profitPlanForm, unallocated_common_fund_rate: Number(e.target.value) })}
                  className="w-20 px-3 py-2 border border-purple-300 rounded-xl font-bold text-purple-900 text-sm outline-none"
                />
                <span className="text-xs text-purple-800 font-bold">({unallocatedCommonFundAmount.toLocaleString('vi-VN')} ₫)</span>
              </div>
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">Chia theo Dịch vụ nội bộ (Min 51%)</label>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  min={51}
                  max={100}
                  value={profitPlanForm.patronage_rebate_rate}
                  onChange={(e) => setProfitPlanForm({ ...profitPlanForm, patronage_rebate_rate: Number(e.target.value) })}
                  className="w-20 px-3 py-2 border border-blue-300 rounded-xl font-bold text-blue-900 text-sm outline-none"
                />
                <span className="text-xs text-blue-800 font-bold">(Patronage Rebate)</span>
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
            <button
              type="submit"
              className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl shadow-xs text-xs whitespace-nowrap transition cursor-pointer"
            >
              Cập nhật mô hình phân bổ thặng dư
            </button>
          </div>
        </form>
      </div>

      {/* MAIN PROFIT ALLOCATION TABLE & SIDE DRAWER */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 items-start">
        <div className={`${selectedSurplusItem ? 'lg:col-span-2' : 'lg:col-span-3'} bg-white border border-[#e7e9ec] rounded-2xl shadow-xs overflow-hidden`}>
          <div className="p-4 border-b border-slate-100 bg-slate-50/50 flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-3 text-xs font-bold text-slate-600">
              <span className="text-emerald-800 border-b-2 border-emerald-600 pb-1">Tất cả ({surplusItems.length})</span>
              <span className="hover:text-slate-900 cursor-pointer">Đã nhận ({paidMemberCount})</span>
              <span className="hover:text-slate-900 cursor-pointer">Chưa nhận ({unpaidMemberCount})</span>
            </div>

            <div className="flex items-center gap-2">
              <div className="relative">
                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Tìm tên xã viên..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-8 pr-3 py-1.5 bg-white border border-slate-200 rounded-xl text-xs outline-none"
                />
              </div>

              <select
                value={profitStatusFilter}
                onChange={(e) => setProfitStatusFilter(e.target.value)}
                className="px-3 py-1.5 bg-white border border-slate-200 rounded-xl text-xs font-medium outline-none"
              >
                <option value="ALL">Trạng thái: Tất cả</option>
                <option value="DA_NHAN">Đã nhận</option>
                <option value="CHUA_NHAN">Chưa nhận</option>
              </select>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-slate-100 text-[10.5px] uppercase tracking-wider text-slate-400 font-bold bg-slate-50/80">
                  <th className="py-3 px-3.5">STT</th>
                  <th className="py-3 px-3.5">Mã & Họ tên</th>
                  <th className="py-3 px-3.5 text-right">Chia theo Dịch vụ (&ge;51%)</th>
                  <th className="py-3 px-3.5 text-right">Chia theo Vốn góp</th>
                  <th className="py-3 px-3.5 text-right">Cấn trừ công nợ (đ)</th>
                  <th className="py-3 px-3.5 text-right">Thực lĩnh chuyển khoản (đ)</th>
                  <th className="py-3 px-3.5 text-center">Tái đầu tư vốn</th>
                  <th className="py-3 px-3.5">Trạng thái</th>
                  <th className="py-3 px-3.5 text-center">Thao tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredSurplusItems.map((item, idx) => {
                  const serviceShare = item.service_share_amount || Math.round(item.total_payout_amount * 0.55);
                  const capitalShare = item.capital_share_amount || (item.total_payout_amount - serviceShare);

                  return (
                    <tr
                      key={item.id}
                      onClick={() => setSelectedSurplusItem(item)}
                      className={`cursor-pointer hover:bg-slate-50 transition-colors ${
                        selectedSurplusItem?.id === item.id ? 'bg-emerald-50/60 font-semibold' : ''
                      }`}
                    >
                      <td className="py-3 px-3.5 text-slate-400 font-medium">{idx + 1}</td>
                      <td className="py-3 px-3.5">
                        <strong className="text-slate-900 block">{item.member_name}</strong>
                        <span className="text-[10.5px] font-mono text-slate-400">{item.member_code}</span>
                      </td>
                      <td className="py-3 px-3.5 text-right font-bold text-blue-700">
                        +{serviceShare.toLocaleString('vi-VN')} ₫
                      </td>
                      <td className="py-3 px-3.5 text-right font-bold text-slate-700">
                        +{capitalShare.toLocaleString('vi-VN')} ₫
                      </td>
                      <td className="py-3 px-3.5 text-right font-bold text-amber-800">
                        {(item.debt_deduction || 0) > 0 ? `-${(item.debt_deduction || 0).toLocaleString('vi-VN')} ₫` : '0 ₫'}
                      </td>
                      <td className="py-3 px-3.5 text-right font-black text-emerald-800">
                        {(item.net_payout_amount || item.total_payout_amount || 0).toLocaleString('vi-VN')} ₫
                      </td>
                      <td className="py-3 px-3.5 text-center" onClick={(e) => e.stopPropagation()}>
                        <button
                          onClick={() => handleToggleReinvest(item.id)}
                          className={`p-1.5 rounded-lg text-[11px] font-bold flex items-center gap-1 mx-auto cursor-pointer transition ${
                            item.reinvest_as_capital
                              ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                              : 'bg-slate-100 text-slate-500 hover:bg-slate-200'
                          }`}
                          title="Tự động chuyển thặng dư thành vốn góp bổ sung"
                        >
                          <RefreshCw className="w-3 h-3" /> {item.reinvest_as_capital ? 'Tái đầu tư' : 'Rút tiền'}
                        </button>
                      </td>
                      <td className="py-3 px-3.5">
                        {item.payout_status === 'DA_NHAN' ? (
                          <span className="px-2.5 py-1 rounded-full text-[10.5px] font-bold bg-emerald-100 text-emerald-800">
                            Đã nhận
                          </span>
                        ) : (
                          <span className="px-2.5 py-1 rounded-full text-[10.5px] font-bold bg-amber-100 text-amber-800">
                            Chưa nhận
                          </span>
                        )}
                      </td>
                      <td className="py-3 px-3.5 text-center">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedSurplusItem(item);
                          }}
                          className="p-1.5 text-slate-400 hover:text-emerald-700 hover:bg-emerald-50 rounded-lg cursor-pointer transition"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Selected Surplus Item Detail Drawer */}
        {selectedSurplusItem && (
          <div className="bg-white border border-[#e7e9ec] rounded-2xl shadow-xs p-5 space-y-4 animate-fade-in">
            <div className="flex items-start justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-full bg-emerald-100 text-emerald-800 font-bold flex items-center justify-center text-sm border border-emerald-200 shrink-0">
                  {selectedSurplusItem.member_name.substring(0, 2).toUpperCase()}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-extrabold text-sm text-slate-900">{selectedSurplusItem.member_name}</h3>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
                      Đã duyệt
                    </span>
                  </div>
                  <p className="text-xs text-slate-400 font-mono">{selectedSurplusItem.member_code} &bull; Xã viên chính thức</p>
                </div>
              </div>
              <button onClick={() => setSelectedSurplusItem(null)} className="text-slate-400 hover:text-slate-600 p-1 cursor-pointer">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-2 text-xs border-b border-slate-100 pb-3">
              <div className="font-bold text-slate-800 text-[11px] uppercase tracking-wide">Chi tiết Phân bổ Thặng dư</div>
              <div className="flex justify-between"><span className="text-slate-500">Sản lượng cung ứng nội bộ:</span> <span className="font-bold text-slate-900">12.500 kg</span></div>
              <div className="flex justify-between"><span className="text-slate-500">Thưởng theo Dịch vụ (&ge;51%):</span> <span className="font-bold text-blue-700">+{((selectedSurplusItem.total_payout_amount * 0.55)).toLocaleString('vi-VN')} ₫</span></div>
              <div className="flex justify-between"><span className="text-slate-500">Thưởng theo Tỷ lệ vốn:</span> <span className="font-bold text-slate-900">+{((selectedSurplusItem.total_payout_amount * 0.45)).toLocaleString('vi-VN')} ₫</span></div>
              <div className="flex justify-between text-amber-800"><span>Khấu trừ nợ vật tư tồn đọng:</span> <span className="font-bold">-${(selectedSurplusItem.debt_deduction || 0).toLocaleString('vi-VN')} ₫</span></div>
              <div className="flex justify-between text-emerald-900 font-extrabold text-sm border-t pt-2 mt-1"><span>Thực lĩnh chuyển khoản:</span> <span>{(selectedSurplusItem.net_payout_amount || selectedSurplusItem.total_payout_amount || 0).toLocaleString('vi-VN')} ₫</span></div>
            </div>

            <div className="space-y-2 text-xs border-b border-slate-100 pb-3">
              <div className="font-bold text-slate-800 text-[11px] uppercase tracking-wide">Thông tin ngân hàng thụ hưởng</div>
              <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-1">
                <div className="font-bold text-emerald-800 text-xs">{selectedSurplusItem.bank_name || 'Ngân hàng TMCP Ngoại thương Việt Nam (VCB)'}</div>
                <div className="text-xs text-slate-700 font-mono font-bold">STK: {selectedSurplusItem.bank_account || '1234567890'}</div>
                <div className="text-[11.5px] text-slate-500">Chủ tài khoản: <strong>{selectedSurplusItem.account_holder || selectedSurplusItem.member_name}</strong></div>
              </div>
            </div>

            <div className="pt-1 flex justify-between gap-2 border-t border-slate-100">
              <button
                onClick={() => setIsPrintModalOpen(true)}
                className="flex-1 py-2 border border-blue-300 text-blue-700 font-bold hover:bg-blue-50 text-xs rounded-xl inline-flex items-center justify-center gap-1.5 cursor-pointer transition"
              >
                <Printer className="w-3.5 h-3.5" /> In biên lai
              </button>
            </div>
          </div>
        )}
      </div>

      {/* CHARTS GRID MATCHING LAW 2023 RECHARTS VISUALS */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="bg-white border border-[#e7e9ec] p-5 rounded-2xl shadow-xs space-y-3">
          <h3 className="font-extrabold text-slate-900 text-sm">Biểu đồ Cơ cấu Trích Quỹ & Phân chia Thặng dư (Luật HTX 2023)</h3>
          <div className="h-56">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={55}
                  outerRadius={80}
                  paddingAngle={4}
                  dataKey="value"
                >
                  {pieData.map((_, i) => (
                    <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(value) => [`${Number(value).toLocaleString('vi-VN')} ₫`, 'Giá trị']} />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="grid grid-cols-2 gap-2 text-xs pt-1 border-t border-slate-100">
            <div className="flex items-center gap-2"><span className="w-3 h-3 rounded-full bg-emerald-600"></span> <span>Chia xã viên (85%)</span></div>
            <div className="flex items-center gap-2"><span className="w-3 h-3 rounded-full bg-purple-600"></span> <span>Quỹ chung không chia (5%)</span></div>
            <div className="flex items-center gap-2"><span className="w-3 h-3 rounded-full bg-blue-600"></span> <span>Quỹ ĐTPT & Dự phòng (10%)</span></div>
            <div className="flex items-center gap-2"><span className="w-3 h-3 rounded-full bg-amber-500"></span> <span>Quỹ Phúc lợi (5%)</span></div>
          </div>
        </div>

        <div className="bg-white border border-[#e7e9ec] p-5 rounded-2xl shadow-xs space-y-3">
          <div className="flex justify-between items-center">
            <h3 className="font-extrabold text-slate-900 text-sm">Biểu đồ Tiến độ Chi trả Thặng dư cho Xã viên</h3>
            <div className="flex items-center gap-3 text-xs font-bold">
              <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-emerald-600"></span> Đã giải ngân</span>
              <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-amber-500"></span> Còn tồn đọng</span>
            </div>
          </div>
          <div className="h-56">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={barData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#64748b' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
                <Tooltip formatter={(value) => [`${Number(value).toLocaleString('vi-VN')} ₫`, 'Số tiền']} />
                <Bar dataKey="paid" fill="#059669" radius={[4, 4, 0, 0]} maxBarSize={32} />
                <Bar dataKey="unpaid" fill="#f59e0b" radius={[4, 4, 0, 0]} maxBarSize={32} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Modal Khai báo Đợt Phân chia Mới (Create Plan Wizard Modal) */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/45 p-4 backdrop-blur-sm">
          <div className="w-full max-w-md overflow-hidden rounded-3xl border border-white/60 bg-white shadow-2xl animate-fade-in">
            <div className="flex items-start justify-between border-b border-slate-100 bg-gradient-to-r from-emerald-50 to-white px-6 py-4">
              <div>
                <p className="text-[10px] font-bold uppercase tracking-widest text-emerald-600">Phân hệ Tài chính HTX</p>
                <h3 className="mt-1 text-lg font-extrabold text-slate-900">Khai báo Đợt Phân chia Thặng dư Mới</h3>
              </div>
              <button
                onClick={() => setIsCreateModalOpen(false)}
                className="flex h-8 w-8 items-center justify-center rounded-xl bg-white text-slate-400 shadow-xs hover:text-slate-700"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateSubmit} className="space-y-4 px-6 py-5">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Mã Đợt / Phương án Phân chia *</label>
                <input
                  type="text"
                  value={createForm.custom_plan_code}
                  onChange={(e) => setCreateForm({ ...createForm, custom_plan_code: e.target.value })}
                  className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-xs font-mono font-bold bg-slate-50 outline-none"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Niên độ Kế toán *</label>
                  <input
                    type="number"
                    value={createForm.financial_year}
                    onChange={(e) => setCreateForm({ ...createForm, financial_year: Number(e.target.value) })}
                    className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-xs font-bold outline-none"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Tổng Thặng dư (đ) *</label>
                  <input
                    type="number"
                    value={createForm.total_surplus}
                    onChange={(e) => setCreateForm({ ...createForm, total_surplus: Number(e.target.value) })}
                    className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-xs font-bold outline-none"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Thặng dư Khả dụng Phân chia (đ) *</label>
                <input
                  type="number"
                  value={createForm.distributable_surplus}
                  onChange={(e) => setCreateForm({ ...createForm, distributable_surplus: Number(e.target.value) })}
                  className="w-full px-3.5 py-2.5 border border-emerald-300 bg-emerald-50/20 rounded-xl text-xs font-bold text-emerald-900 outline-none"
                  required
                />
                <p className="text-[10.5px] text-slate-400 mt-1">Đã khấu trừ Quỹ chung không chia tối thiểu 5%</p>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Tỷ trọng Dịch vụ nội bộ (%) *</label>
                  <input
                    type="number"
                    min={51}
                    max={100}
                    value={createForm.service_usage_weight}
                    onChange={(e) => setCreateForm({ ...createForm, service_usage_weight: Number(e.target.value) })}
                    className="w-full px-3.5 py-2.5 border border-blue-300 rounded-xl text-xs font-bold text-blue-900 outline-none"
                    required
                  />
                  <span className="text-[10px] text-blue-700 font-bold block mt-0.5">&ge; 51% Luật HTX 2023</span>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Tỷ trọng Vốn góp (%) *</label>
                  <input
                    type="number"
                    max={49}
                    value={createForm.capital_weight}
                    onChange={(e) => setCreateForm({ ...createForm, capital_weight: Number(e.target.value) })}
                    className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-xs font-bold text-slate-900 outline-none"
                    required
                  />
                  <span className="text-[10px] text-slate-400 block mt-0.5">&le; 49% Phần còn lại</span>
                </div>
              </div>

              <div className="flex justify-end gap-2 border-t border-slate-100 pt-3">
                <button
                  type="button"
                  onClick={() => setIsCreateModalOpen(false)}
                  className="px-4 py-2.5 border border-slate-200 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-50"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  disabled={createPlanMutation.isPending}
                  className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-sm transition cursor-pointer"
                >
                  {createPlanMutation.isPending ? 'Đang tạo...' : 'Tạo đợt phân chia'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal In Biên lai (Print Voucher Modal) */}
      {isPrintModalOpen && selectedSurplusItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/45 p-4 backdrop-blur-sm">
          <div className="w-full max-w-lg overflow-hidden rounded-3xl border border-white/60 bg-white shadow-2xl animate-fade-in p-6 space-y-4">
            <div className="flex justify-between items-center border-b border-slate-100 pb-3">
              <h3 className="font-extrabold text-slate-900 text-base flex items-center gap-2">
                <Printer className="w-5 h-5 text-emerald-600" /> In Biên lai Phân chia Thặng dư
              </h3>
              <button onClick={() => setIsPrintModalOpen(false)} className="text-slate-400 hover:text-slate-600 p-1">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-5 border border-slate-200 rounded-2xl bg-slate-50/50 space-y-3 text-xs font-mono">
              <div className="text-center space-y-1">
                <h4 className="font-black text-sm uppercase text-slate-900">HỢP TÁC XÃ NÔNG NGHIỆP TÂN TIẾN</h4>
                <p className="text-[11px] text-slate-500 font-sans">Mê Linh, Huyện Lâm Hà, Tỉnh Lâm Đồng</p>
                <h5 className="font-bold text-xs uppercase pt-2 text-emerald-800 font-sans">
                  BIÊN LAI CHI TRẢ THẶNG DƯ NIÊN ĐỘ {surplusPlan.fiscal_year}
                </h5>
                <p className="text-[10.5px] text-slate-400">Số hiệu: BLTD-{selectedSurplusItem.member_code}-2025</p>
              </div>

              <div className="space-y-1.5 border-t border-b border-dashed border-slate-300 py-3 text-slate-800">
                <div className="flex justify-between"><span>Xã viên thụ hưởng:</span> <strong className="font-sans">{selectedSurplusItem.member_name}</strong></div>
                <div className="flex justify-between"><span>Mã số xã viên:</span> <strong>{selectedSurplusItem.member_code}</strong></div>
                <div className="flex justify-between"><span>Thưởng theo Sử dụng Dịch vụ (55%):</span> <span>+{((selectedSurplusItem.total_payout_amount * 0.55)).toLocaleString('vi-VN')} ₫</span></div>
                <div className="flex justify-between"><span>Thưởng theo Vốn góp (45%):</span> <span>+{((selectedSurplusItem.total_payout_amount * 0.45)).toLocaleString('vi-VN')} ₫</span></div>
                <div className="flex justify-between text-amber-800"><span>Cấn trừ công nợ vật tư:</span> <span>-${(selectedSurplusItem.debt_deduction || 0).toLocaleString('vi-VN')} ₫</span></div>
                <div className="flex justify-between font-black text-sm text-emerald-900 border-t pt-1"><span>TỔNG THỰC LĨNH:</span> <span>{(selectedSurplusItem.net_payout_amount || selectedSurplusItem.total_payout_amount || 0).toLocaleString('vi-VN')} ₫</span></div>
              </div>

              <div className="grid grid-cols-2 text-center pt-2 text-[11px] font-sans text-slate-600">
                <div>
                  <p className="font-bold">Người lập phiếu</p>
                  <p className="text-[10px] text-slate-400 pt-8">(Ký, họ tên)</p>
                </div>
                <div>
                  <p className="font-bold">Xã viên xác nhận</p>
                  <p className="text-[10px] text-slate-400 pt-8">{selectedSurplusItem.member_name}</p>
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-2">
              <button
                onClick={() => setIsPrintModalOpen(false)}
                className="px-4 py-2 border border-slate-200 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-50"
              >
                Đóng
              </button>
              <button
                onClick={() => {
                  window.print();
                }}
                className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-sm inline-flex items-center gap-1.5 transition cursor-pointer"
              >
                <Printer className="w-3.5 h-3.5" /> Xác nhận In
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
