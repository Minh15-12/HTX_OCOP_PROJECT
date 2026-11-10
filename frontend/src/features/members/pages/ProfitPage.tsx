import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  ChevronRight,
  Send,
  Lock,
  Plus,
  CheckCircle2,
  Coins,
  FileQuestion,
  Loader2,
} from 'lucide-react';
import {
  fetchSurplusPlansApi,
  fetchSurplusPlanByIdApi,
  createSurplusPlanApi,
  submitSurplusPlanApi,
  approveSurplusPlanApi,
  executeSurplusPlanApi,
} from '@/services/memberService';
import { SurplusDistributionPlan, SurplusDistributionItem } from '@/types/memberTypes';
import { ProfitKpiCards } from '../components/profit/ProfitKpiCards';
import { ProfitParamConfigCard, ProfitPlanFormState } from '../components/profit/ProfitParamConfigCard';
import { ProfitAllocationTable } from '../components/profit/ProfitAllocationTable';
import { ProfitCharts } from '../components/profit/ProfitCharts';
import { CreateSurplusPlanModal } from '../components/profit/CreateSurplusPlanModal';
import { SurplusVoucherPrintModal } from '../components/profit/SurplusVoucherPrintModal';

export const ProfitPage: React.FC = () => {
  const queryClient = useQueryClient();
  const [selectedPlanId, setSelectedPlanId] = useState<string>('');
  const [search, setSearch] = useState('');
  const [profitStatusFilter, setProfitStatusFilter] = useState<string>('ALL');
  const [selectedSurplusItem, setSelectedSurplusItem] = useState<SurplusDistributionItem | null>(null);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'danger' } | null>(null);

  const [currentPage, setCurrentPage] = useState<number>(1);
  const [pageSize, setPageSize] = useState<number>(10);

  // Modals state
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isPrintModalOpen, setIsPrintModalOpen] = useState(false);

  const triggerToast = (message: string, type: 'success' | 'danger' = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3500);
  };

  // 1. Fetch plans list with React Query
  const { data: plansResponse, isLoading: isLoadingPlans } = useQuery({
    queryKey: ['surplusPlans'],
    queryFn: () => fetchSurplusPlansApi({ per_page: 50 }),
  });

  const apiPlans: any[] = Array.isArray(plansResponse)
    ? plansResponse
    : Array.isArray(plansResponse?.data)
    ? plansResponse.data
    : [];

  // Automatically select the first plan if none selected
  const activePlanId = selectedPlanId || (apiPlans.length > 0 ? apiPlans[0].id : '');

  // 2. Fetch full details and allocations of active plan
  const { data: activePlanDetail, isLoading: isLoadingDetail } = useQuery({
    queryKey: ['surplusPlanDetail', activePlanId],
    queryFn: () => fetchSurplusPlanByIdApi(activePlanId),
    enabled: !!activePlanId,
  });

  // React Query Mutations
  const createPlanMutation = useMutation({
    mutationFn: createSurplusPlanApi,
    onSuccess: (res) => {
      queryClient.invalidateQueries({ queryKey: ['surplusPlans'] });
      triggerToast('Đã khởi tạo đợt phân chia thặng dư niên độ mới thành công!');
      setIsCreateModalOpen(false);
      if (res?.data?.id) {
        setSelectedPlanId(res.data.id);
      }
    },
    onError: (err: any) => {
      triggerToast(
        err?.response?.data?.message || err?.message || 'Khởi tạo đợt phân chia thất bại',
        'danger'
      );
    },
  });

  const submitPlanMutation = useMutation({
    mutationFn: submitSurplusPlanApi,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['surplusPlans'] });
      queryClient.invalidateQueries({ queryKey: ['surplusPlanDetail', activePlanId] });
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
      queryClient.invalidateQueries({ queryKey: ['surplusPlanDetail', activePlanId] });
      triggerToast('Giám đốc đã phê duyệt phương án phân chia thặng dư!');
    },
    onError: (err: any) => {
      triggerToast(err?.response?.data?.message || 'Phê duyệt phương án thất bại', 'danger');
    },
  });

  const executePlanMutation = useMutation({
    mutationFn: ({ id, options }: { id: string; options?: any }) => executeSurplusPlanApi(id, options),
    onSuccess: (res: any) => {
      queryClient.invalidateQueries({ queryKey: ['surplusPlans'] });
      queryClient.invalidateQueries({ queryKey: ['surplusPlanDetail', activePlanId] });
      triggerToast(res?.message || 'Đã thực thi phân chia thặng dư thành công!');
    },
    onError: (err: any) => {
      triggerToast(err?.response?.data?.message || err?.message || 'Thực thi phương án thất bại', 'danger');
    },
  });

  if (isLoadingPlans) {
    return (
      <div className="flex items-center justify-center min-h-[400px] w-full">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="w-8 h-8 text-emerald-600 animate-spin" />
          <span className="text-xs font-semibold text-slate-500">Đang tải kế hoạch phân phối thặng dư...</span>
        </div>
      </div>
    );
  }

  // TRUTHFUL EMPTY STATE - When no plan exists in database
  if (!isLoadingPlans && apiPlans.length === 0) {
    return (
      <div className="space-y-4 pb-12 animate-fade-in font-sans text-[13px] text-slate-700">
        {toast && (
          <div
            className={`fixed top-4 right-4 z-50 px-4 py-3 rounded-xl shadow-modal text-white text-xs font-extrabold flex items-center gap-2 animate-bounce ${
              toast.type === 'danger' ? 'bg-rose-600' : 'bg-emerald-600'
            }`}
          >
            <CheckCircle2 className="w-4 h-4" />
            {toast.message}
          </div>
        )}

        {/* Header */}
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div>
            <div className="flex items-center gap-2 text-xs font-bold text-slate-400">
              <span>Quản trị HTX</span>
              <ChevronRight className="w-3.5 h-3.5" />
              <span className="text-slate-800">Phân chia thặng dư & Lợi nhuận</span>
            </div>
            <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight mt-1">
              Phân chia Thặng dư Xã viên theo Luật HTX 2023
            </h1>
          </div>

          <button
            onClick={() => setIsCreateModalOpen(true)}
            className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-sm inline-flex items-center gap-1.5 transition cursor-pointer"
          >
            <Plus className="w-4 h-4" /> Lập phương án mới
          </button>
        </div>

        {/* Empty State Box */}
        <div className="bg-white border border-slate-200 rounded-3xl p-12 text-center shadow-xs flex flex-col items-center justify-center space-y-4">
          <div className="w-16 h-16 rounded-3xl bg-emerald-50 text-emerald-600 flex items-center justify-center border border-emerald-100 shadow-inner">
            <Coins className="w-8 h-8" />
          </div>
          <div className="max-w-md space-y-1.5">
            <h3 className="text-base font-black text-slate-900">
              Chưa có Phương án Phân chia Thặng dư nào
            </h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              Hợp tác xã chưa khởi tạo phương án phân phối thặng dư và lợi nhuận cho niên độ hiện tại.
              Hệ thống sẽ tự động quét danh sách xã viên hoạt động và doanh số dịch vụ để tính toán phân bổ công bằng theo Luật HTX 2023.
            </p>
          </div>
          <button
            onClick={() => setIsCreateModalOpen(true)}
            className="px-5 py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white font-extrabold text-xs rounded-xl shadow-xs inline-flex items-center gap-2 transition cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Khởi tạo phương án phân chia thặng dư đầu tiên</span>
          </button>
        </div>

        {/* Create Modal */}
        <CreateSurplusPlanModal
          isOpen={isCreateModalOpen}
          onClose={() => setIsCreateModalOpen(false)}
          onSubmit={(form) => createPlanMutation.mutate(form)}
          isPending={createPlanMutation.isPending}
        />
      </div>
    );
  }

  // Real plan loaded from backend
  const planData = activePlanDetail?.data || activePlanDetail || apiPlans[0];
  const totalSurplus = Number(planData.total_surplus || 0);
  const distributableSurplus = Number(planData.distributable_surplus || 0);
  const unallocatedAmount = Math.max(0, totalSurplus - distributableSurplus);
  const serviceUsageWeight = Number(planData.service_usage_weight || 50);
  const capitalWeight = Number(planData.capital_weight || 50);
  const patronageAmount = (distributableSurplus * serviceUsageWeight) / 100;
  const capitalShareTotal = (distributableSurplus * capitalWeight) / 100;

  // Map real allocations from API
  const rawAllocations: any[] = planData.allocations || [];
  const surplusItems: SurplusDistributionItem[] = rawAllocations.map((alloc: any) => ({
    id: alloc.id,
    plan_id: planData.id,
    member_id: alloc.member_id,
    member_code: alloc.member?.member_code || `TV${alloc.id.substring(0, 4)}`,
    member_name: alloc.member_name || alloc.member?.identity_information?.full_name || 'Xã viên',
    member_type: alloc.member?.member_type === 'ASSOCIATED' ? 'LIEN_KET' : 'CHINH_THUC',
    shares_held: Math.floor(Number(alloc.capital_contribution_snapshot || 0) / 100000),
    capital_contributed: Number(alloc.capital_contribution_snapshot || 0),
    share_percentage: totalSurplus > 0 ? (Number(alloc.capital_contribution_snapshot || 0) / totalSurplus) * 100 : 0,
    capital_share_amount: Number(alloc.capital_share_amount || 0),
    service_usage_output_kg: Number(alloc.service_usage_snapshot || 0),
    service_share_amount: Number(alloc.service_share_amount || 0),
    total_payout_amount: Number(alloc.total_allocated_amount || 0),
    payout_method: 'BANK_TRANSFER',
    payout_status: planData.status === 'APPROVED' ? 'DA_NHAN' : 'CHUA_NHAN',
    payout_date: planData.status === 'APPROVED' ? planData.updated_at?.split('T')[0] : '',
    transaction_code: `LN-${planData.financial_year || 2025}-${alloc.id.substring(0, 4)}`,
  }));

  const activeSurplusPlan: SurplusDistributionPlan = {
    id: planData.id,
    fiscal_year: planData.financial_year,
    plan_name: planData.plan_code || `Phương án phân chia thặng dư ${planData.financial_year}`,
    total_net_profit: totalSurplus,
    internal_service_surplus: distributableSurplus,
    external_service_surplus: unallocatedAmount,
    unallocated_common_fund_rate: totalSurplus > 0 ? Math.round((unallocatedAmount / totalSurplus) * 100) : 5,
    unallocated_common_fund_amount: unallocatedAmount,
    reserve_fund_rate: 10,
    reserve_fund_amount: 0,
    patronage_rebate_rate: serviceUsageWeight,
    member_share_rate: Math.round((distributableSurplus / (totalSurplus || 1)) * 100),
    member_share_amount: distributableSurplus,
    welfare_fund_rate: 0,
    welfare_fund_amount: 0,
    status: planData.status || 'DRAFT',
    planned_payout_date: planData.updated_at?.split('T')[0] || '2026-03-15',
    resolution_number: planData.plan_code,
    notes: `Phân phối thặng dư niên độ ${planData.financial_year} theo Luật HTX 2023`,
  };

  const distributedProfitAmount = surplusItems
    .filter((i) => i.payout_status === 'DA_NHAN')
    .reduce((sum, i) => sum + Number(i.total_payout_amount || 0), 0);
  const distributedProfitPct = Math.round((distributedProfitAmount / (totalSurplus || 1)) * 100);

  // Real Pie chart data
  const pieData = [
    { name: 'Chia theo dịch vụ', value: patronageAmount },
    { name: 'Chia theo vốn góp', value: capitalShareTotal },
    { name: 'Quỹ chung không chia', value: unallocatedAmount },
  ];

  // Real Bar chart data - Distribution by member categories
  const officialTotal = surplusItems
    .filter((i) => i.member_type === 'CHINH_THUC')
    .reduce((s, i) => s + i.total_payout_amount, 0);
  const associatedTotal = surplusItems
    .filter((i) => i.member_type === 'LIEN_KET')
    .reduce((s, i) => s + i.total_payout_amount, 0);

  const barData = [
    { month: 'Thành viên chính thức', paid: planData.status === 'APPROVED' ? officialTotal : 0, unpaid: planData.status === 'APPROVED' ? 0 : officialTotal },
    { month: 'Thành viên liên kết', paid: planData.status === 'APPROVED' ? associatedTotal : 0, unpaid: planData.status === 'APPROVED' ? 0 : associatedTotal },
  ];

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
        <div
          className={`fixed top-4 right-4 z-50 px-4 py-3 rounded-xl shadow-modal text-white text-xs font-extrabold flex items-center gap-2 animate-bounce ${
            toast.type === 'danger' ? 'bg-rose-600' : 'bg-emerald-600'
          }`}
        >
          <CheckCircle2 className="w-4 h-4" />
          {toast.message}
        </div>
      )}

      {/* Header */}
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
            Trích Quỹ chung không chia (NĐ 113/2024 Điều 83-84) và chia thưởng sử dụng dịch vụ nông nghiệp (Điều 85, &ge; 50%)
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {planData.status === 'DRAFT' && (
            <button
              onClick={() => submitPlanMutation.mutate(planData.id)}
              disabled={submitPlanMutation.isPending}
              className="px-3.5 py-2 bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs rounded-xl shadow-sm inline-flex items-center gap-1.5 transition cursor-pointer disabled:opacity-50"
            >
              <Send className="w-3.5 h-3.5" /> Gửi trình duyệt
            </button>
          )}

          {planData.status === 'PENDING_APPROVAL' && (
            <button
              onClick={() => approvePlanMutation.mutate(planData.id)}
              disabled={approvePlanMutation.isPending}
              className="px-3.5 py-2 bg-blue-700 hover:bg-blue-800 text-white font-bold text-xs rounded-xl shadow-sm inline-flex items-center gap-1.5 transition cursor-pointer disabled:opacity-50"
            >
              <Lock className="w-3.5 h-3.5" /> Giám đốc Phê duyệt
            </button>
          )}

          {planData.status === 'APPROVED' && (
            <div className="flex items-center gap-2">
              <button
                onClick={() => executePlanMutation.mutate({ id: planData.id, options: { reinvest_as_capital: true } })}
                disabled={executePlanMutation.isPending}
                className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-sm inline-flex items-center gap-1.5 transition cursor-pointer disabled:opacity-50"
                title="Tự động ghi nhận vốn góp bổ sung, cấp Giấy chứng nhận và tăng hạn mức tín dụng mùa vụ sau"
              >
                <CheckCircle2 className="w-3.5 h-3.5" /> Tái đầu tư thành Vốn góp & Tăng hạn mức
              </button>
              <button
                onClick={() => executePlanMutation.mutate({ id: planData.id, options: { reinvest_as_capital: false } })}
                disabled={executePlanMutation.isPending}
                className="px-3.5 py-2 bg-slate-700 hover:bg-slate-800 text-white font-bold text-xs rounded-xl shadow-sm inline-flex items-center gap-1.5 transition cursor-pointer disabled:opacity-50"
                title="Tự động sinh phiếu chi trong Sổ quỹ tiền mặt/ngân hàng HTX"
              >
                <Coins className="w-3.5 h-3.5" /> Chi trả Tiền mặt (Phiếu chi)
              </button>
            </div>
          )}

          {planData.status === 'EXECUTED' && (
            <span className="px-3 py-1.5 bg-emerald-50 text-emerald-800 border border-emerald-200 font-bold text-xs rounded-xl inline-flex items-center gap-1.5 shadow-xs">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> Đã thực thi hoàn tất chu kỳ tài chính
            </span>
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
      <ProfitKpiCards
        totalNetProfit={totalSurplus}
        unallocatedCommonFundAmount={unallocatedAmount}
        patronageAmount={patronageAmount}
        distributedProfitAmount={distributedProfitAmount}
        distributedProfitPct={distributedProfitPct}
        selectedPlanId={activePlanId}
        setSelectedPlanId={setSelectedPlanId}
        apiPlans={apiPlans}
      />

      {/* MAIN ALLOCATION TABLE */}
      {isLoadingDetail ? (
        <div className="bg-white border border-slate-200 rounded-2xl p-8 flex items-center justify-center">
          <Loader2 className="w-6 h-6 text-emerald-600 animate-spin mr-2" />
          <span className="text-xs text-slate-500">Đang nạp danh sách phân bổ thặng dư xã viên...</span>
        </div>
      ) : (
        <ProfitAllocationTable
          surplusItems={surplusItems}
          filteredSurplusItems={filteredSurplusItems}
          selectedSurplusItem={selectedSurplusItem}
          setSelectedSurplusItem={setSelectedSurplusItem}
          search={search}
          setSearch={setSearch}
          profitStatusFilter={profitStatusFilter}
          setProfitStatusFilter={setProfitStatusFilter}
          currentPage={currentPage}
          setCurrentPage={setCurrentPage}
          pageSize={pageSize}
          setPageSize={setPageSize}
          onToggleReinvest={() => {}}
          onOpenPrintModal={() => setIsPrintModalOpen(true)}
        />
      )}

      {/* CHARTS */}
      <ProfitCharts pieData={pieData} barData={barData} />

      {/* MODALS */}
      <CreateSurplusPlanModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onSubmit={(form) => createPlanMutation.mutate(form)}
        isPending={createPlanMutation.isPending}
      />

      <SurplusVoucherPrintModal
        isOpen={isPrintModalOpen}
        onClose={() => setIsPrintModalOpen(false)}
        selectedSurplusItem={selectedSurplusItem}
        surplusPlan={activeSurplusPlan}
      />
    </div>
  );
};

export default ProfitPage;
