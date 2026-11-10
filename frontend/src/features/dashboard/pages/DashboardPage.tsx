import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { LayoutDashboard, CheckSquare } from 'lucide-react';
import { useTaskNotificationStore, TaskItem } from '@/stores/taskNotificationStore';
import { QuickActionTaskModal } from '@/features/dashboard/components/QuickActionTaskModal';
import { getMembersFromApi } from '@/services/memberService';
import { fetchAllPlots, getAllStoredPlots } from '@/services/farmPlotApi';
import { inventoryApi } from '@/services/inventoryApi';
import { harvestApi } from '@/services/harvestApi';
import { financeApi } from '@/services/financeApi';
import { apiClient } from '@/services/apiClient';
import { Member } from '@/types/memberTypes';
import { DashboardStatCards } from '../components/DashboardStatCards';
import { DashboardOcopBreakdown } from '../components/DashboardOcopBreakdown';
import { DashboardTaskHub } from '../components/DashboardTaskHub';
import { DashboardAlertStrip } from '../components/DashboardAlertStrip';
import { DashboardFarmPlotsStatus } from '../components/DashboardFarmPlotsStatus';
import { DashboardSeasonHarvestProgress } from '../components/DashboardSeasonHarvestProgress';
import { DashboardFinancialHealth } from '../components/DashboardFinancialHealth';

export const DashboardPage: React.FC = () => {
  // Navigation Tab State
  const [activeTab, setActiveTab] = useState<'OVERVIEW' | 'ACTION_HUB'>('OVERVIEW');

  // 1. Members Query
  const { data: members = [] } = useQuery<Member[]>({
    queryKey: ['members'],
    queryFn: async () => {
      const data = await getMembersFromApi();
      return data || [];
    },
    staleTime: 60000,
  });

  const activeMembersCount = members.filter((m) => m.status === 'ACTIVE').length;
  const pendingMembersCount = members.filter(
    (m) => m.status === 'DRAFT' || m.status === 'PROSPECTIVE'
  ).length;
  const totalMembersCount = members.length;

  // 2. Farm Plots Query (Fetch API first with Local fallback)
  const { data: plots = [], isLoading: plotsLoading } = useQuery({
    queryKey: ['farmPlots'],
    queryFn: async () => {
      try {
        const apiPlots = await fetchAllPlots();
        if (Array.isArray(apiPlots) && apiPlots.length > 0) return apiPlots;
      } catch {
        // Fallback to local stored plots
      }
      return getAllStoredPlots();
    },
    staleTime: 60000,
  });

  const totalPlotArea = plots.reduce((sum, p) => sum + (Number(p.area) || 0), 0);

  // 3. Materials Query
  const { data: materials = [] } = useQuery({
    queryKey: ['materials'],
    queryFn: () => inventoryApi.getMaterials(),
    staleTime: 60000,
  });

  const lowStockCount = materials.filter((m) => m.stockQty < m.minSafetyStock).length;

  // 4. OCOP Applications Query
  const { data: ocopApplications = [] } = useQuery({
    queryKey: ['ocopApplicationsDashboard'],
    queryFn: async () => {
      try {
        const res: any = await apiClient.get('/ocop/applications');
        return Array.isArray(res?.data) ? res.data : res?.data?.data || [];
      } catch {
        return [];
      }
    },
    staleTime: 60000,
  });

  const ocopDraftCount = ocopApplications.filter((a: any) =>
    ['DRAFT', 'READY_FOR_SUBMISSION'].includes(a.status)
  ).length;
  const ocopEvaluatingCount = ocopApplications.filter((a: any) =>
    ['SUBMITTED', 'IN_REVIEW', 'EVALUATED'].includes(a.status)
  ).length;
  const ocopCertifiedCount = ocopApplications.filter((a: any) =>
    ['APPROVED', 'CERTIFIED'].includes(a.status)
  ).length;
  const ocopTotal = ocopApplications.length || 1;

  // 5. Harvests Query (Sweet Palermo Harvest & KCS)
  const { data: harvests = [], isLoading: harvestsLoading } = useQuery({
    queryKey: ['harvestsDashboard'],
    queryFn: async () => {
      try {
        const res = await harvestApi.getHarvests();
        if (Array.isArray(res) && res.length > 0) return res;
      } catch {
        // Fallback
      }
      return harvestApi.getStoredHarvests();
    },
    staleTime: 60000,
  });

  // 6. Finance Cash Transactions & Receivables
  const { data: cashTransactions = [], isLoading: transactionsLoading } = useQuery({
    queryKey: ['cashTransactionsDashboard'],
    queryFn: async () => {
      try {
        return await financeApi.getCashTransactions();
      } catch {
        return [];
      }
    },
    staleTime: 60000,
  });

  const { data: receivables = [] } = useQuery({
    queryKey: ['receivablesDashboard'],
    queryFn: async () => {
      try {
        return await financeApi.getReceivablePayables();
      } catch {
        return [];
      }
    },
    staleTime: 60000,
  });

  // Actionable Task Store
  const {
    tasks,
    pendingTasks,
    completedTasks,
    criticalTasks,
    pendingCount,
    totalCount,
    completedPercent,
    completeTask,
    snoozeTask,
    resetDefaultTasks,
  } = useTaskNotificationStore();

  const [taskFilter, setTaskFilter] = useState<'PENDING' | 'CRITICAL' | 'COMPLETED' | 'ALL'>('PENDING');
  const [activeTask, setActiveTask] = useState<TaskItem | null>(null);
  const [modalOpen, setModalOpen] = useState(false);

  const handleQuickAction = (task: TaskItem) => {
    setActiveTask(task);
    setModalOpen(true);
  };

  const displayTasks =
    taskFilter === 'PENDING'
      ? pendingTasks
      : taskFilter === 'CRITICAL'
      ? criticalTasks
      : taskFilter === 'COMPLETED'
      ? completedTasks
      : tasks;

  return (
    <div className="space-y-4 animate-fade-in pb-10">
      {/* Top Header & Tab Switcher Bar */}
      <div className="bg-white border border-[#e7e9ec] rounded-xl p-4 shadow-subtle space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
              <span>Bàn làm việc Điều hành & Tác nghiệp HTX Tân Tiến</span>
            </h1>
            <p className="text-[12.8px] text-slate-500 mt-0.5 max-w-2xl">
              Giám sát chuỗi giá trị Ớt chuông Sweet Palermo (Đỏ, Vàng, Cam), kiểm soát an toàn VietGAP PHI, tài chính và OCOP 4 sao.
            </p>
          </div>
          <div className="flex items-center gap-2 self-start sm:self-auto">
            <span className="text-[12px] font-semibold text-slate-500">Mùa vụ hiện tại:</span>
            <span className="pill-badge pill-green text-[12px] px-3 py-1 font-bold">
              Đông Xuân 2025–2026
            </span>
          </div>
        </div>

        {/* Tab Switcher Controls */}
        <div className="flex items-center gap-2 border-t border-slate-100 pt-3">
          <button
            onClick={() => setActiveTab('OVERVIEW')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-[13px] font-bold transition-all cursor-pointer ${
              activeTab === 'OVERVIEW'
                ? 'bg-emerald-700 text-white shadow-xs'
                : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
            }`}
          >
            <LayoutDashboard className="w-4 h-4" />
            <span>Tab 1: Tổng quan Điều hành</span>
          </button>

          <button
            onClick={() => setActiveTab('ACTION_HUB')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-[13px] font-bold transition-all cursor-pointer ${
              activeTab === 'ACTION_HUB'
                ? 'bg-emerald-700 text-white shadow-xs'
                : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
            }`}
          >
            <CheckSquare className="w-4 h-4" />
            <span>Tab 2: Trung tâm Tác nghiệp & Nhắc việc</span>
            {pendingCount > 0 ? (
              <span
                className={`text-[10.5px] font-extrabold px-2 py-0.5 rounded-full ${
                  activeTab === 'ACTION_HUB'
                    ? 'bg-rose-500 text-white'
                    : 'bg-rose-100 text-rose-800'
                }`}
              >
                🔴 {pendingCount} việc
              </span>
            ) : (
              <span
                className={`text-[10.5px] font-bold px-2 py-0.5 rounded-full ${
                  activeTab === 'ACTION_HUB'
                    ? 'bg-emerald-800 text-white'
                    : 'bg-emerald-100 text-emerald-800'
                }`}
              >
                ✓ Đã xong
              </span>
            )}
          </button>
        </div>
      </div>

      {/* Tab 1: Executive Command Center */}
      {activeTab === 'OVERVIEW' && (
        <div className="space-y-4 animate-fade-in">
          {/* Mini Urgent Alert Strip (Only visible if pending tasks or critical tasks exist) */}
          <DashboardAlertStrip
            criticalCount={criticalTasks.length}
            pendingCount={pendingCount}
            criticalTasks={criticalTasks}
            onNavigateToActionHub={() => setActiveTab('ACTION_HUB')}
          />

          {/* 4 Primary Stat Cards Grid */}
          <DashboardStatCards
            activeMembersCount={activeMembersCount}
            totalMembersCount={totalMembersCount}
            pendingMembersCount={pendingMembersCount}
            totalPlotArea={totalPlotArea}
            plotsCount={plots.length}
            lowStockCount={lowStockCount}
          />

          {/* Row 1: Farm Plots VietGAP PHI Status & OCOP Certification Breakdown */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <DashboardFarmPlotsStatus
              plots={plots}
              isLoading={plotsLoading}
            />

            <DashboardOcopBreakdown
              ocopApplications={ocopApplications}
              ocopDraftCount={ocopDraftCount}
              ocopEvaluatingCount={ocopEvaluatingCount}
              ocopCertifiedCount={ocopCertifiedCount}
              ocopTotal={ocopTotal}
            />
          </div>

          {/* Row 2: Season Harvest & Quality KCS & Financial Health Flow */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <DashboardSeasonHarvestProgress
              harvests={harvests}
              isLoading={harvestsLoading}
            />

            <DashboardFinancialHealth
              transactions={cashTransactions}
              receivables={receivables}
              isLoading={transactionsLoading}
            />
          </div>
        </div>
      )}

      {/* Tab 2: Full-Width Action & Approval Hub */}
      {activeTab === 'ACTION_HUB' && (
        <div className="animate-fade-in">
          <DashboardTaskHub
            taskFilter={taskFilter}
            setTaskFilter={setTaskFilter}
            displayTasks={displayTasks}
            pendingCount={pendingCount}
            criticalCount={criticalTasks.length}
            completedCount={completedTasks.length}
            totalCount={totalCount}
            completedPercent={completedPercent}
            onQuickAction={handleQuickAction}
            onCompleteTask={completeTask}
            onSnoozeTask={snoozeTask}
            onResetTasks={resetDefaultTasks}
            isFullWidth={true}
          />
        </div>
      )}

      {/* Quick Action Modal for Tasks (Accessible from both tabs) */}
      <QuickActionTaskModal
        task={activeTask}
        isOpen={modalOpen}
        onClose={() => {
          setModalOpen(false);
          setActiveTask(null);
        }}
        onComplete={(taskId, note) => {
          completeTask(taskId, note);
        }}
      />
    </div>
  );
};

export default DashboardPage;
