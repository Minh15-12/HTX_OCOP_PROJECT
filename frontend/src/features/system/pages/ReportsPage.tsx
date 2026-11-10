import React, { useState } from 'react';
import { RefreshCw, Users, Receipt, Sprout, Award } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { reportApi } from '@/services/reportApi';
import { getMembersFromApi } from '@/services/memberService';
import { financeApi } from '@/services/financeApi';
import { fetchCropSeasons } from '@/services/cropSeasonApi';
import { useToast } from '@/components/ui/ToastNotification';
import { useTenantContextStore } from '@/stores/tenantContextStore';

import { MembersEquityReportTab } from '../components/MembersEquityReportTab';
import { FinanceCashbookReportTab } from '../components/FinanceCashbookReportTab';
import { CropVietgapReportTab } from '../components/CropVietgapReportTab';
import { OcopReadinessReportTab } from '../components/OcopReadinessReportTab';

type ReportTab = 'members' | 'finance' | 'agriculture' | 'ocop';

export const ReportsPage: React.FC = () => {
  const { showToast } = useToast();
  const { activeCooperative } = useTenantContextStore();
  const [activeTab, setActiveTab] = useState<ReportTab>('members');
  const [isExportingMembers, setIsExportingMembers] = useState(false);
  const [isExportingCashBook, setIsExportingCashBook] = useState(false);
  const [isExportingDebts, setIsExportingDebts] = useState(false);
  const [isExportingFarmingLogs, setIsExportingFarmingLogs] = useState(false);

  // Queries
  const { data: metrics, isLoading: loadingMetrics, refetch: refetchMetrics } = useQuery({
    queryKey: ['reportMetrics'],
    queryFn: () => reportApi.getDashboardMetrics(),
  });

  const { data: members = [], isLoading: loadingMembers, refetch: refetchMembers } = useQuery({
    queryKey: ['members'],
    queryFn: () => getMembersFromApi(),
  });

  const { data: cashList = [], isLoading: loadingCash, refetch: refetchCash } = useQuery({
    queryKey: ['cashTransactions'],
    queryFn: () => financeApi.getCashTransactions().catch(() => []),
  });

  const { data: seasons = [], isLoading: loadingSeasons, refetch: refetchSeasons } = useQuery({
    queryKey: ['cropSeasons'],
    queryFn: () => fetchCropSeasons().catch(() => []),
  });

  const handleRefreshAll = () => {
    refetchMetrics();
    refetchMembers();
    refetchCash();
    refetchSeasons();
    showToast('Đã làm mới dữ liệu báo cáo thống kê', 'success');
  };

  const handleExportMembers = async () => {
    try {
      setIsExportingMembers(true);
      await reportApi.exportMembersExcel();
      showToast('Xuất danh bạ xã viên Excel thành công!', 'success');
    } catch {
      showToast('Không thể xuất danh bạ xã viên. Vui lòng thử lại.', 'error');
    } finally {
      setIsExportingMembers(false);
    }
  };

  const handleExportCashBook = async () => {
    try {
      setIsExportingCashBook(true);
      await reportApi.exportCashBookExcel();
      showToast('Xuất sổ quỹ tiền mặt Excel thành công!', 'success');
    } catch {
      showToast('Không thể xuất sổ quỹ tiền mặt. Vui lòng thử lại.', 'error');
    } finally {
      setIsExportingCashBook(false);
    }
  };

  const handleExportDebts = async () => {
    try {
      setIsExportingDebts(true);
      await reportApi.exportReceivablesPayablesExcel();
      showToast('Xuất sổ theo dõi công nợ Excel thành công!', 'success');
    } catch {
      showToast('Không thể xuất sổ theo dõi công nợ. Vui lòng thử lại.', 'error');
    } finally {
      setIsExportingDebts(false);
    }
  };

  const handleExportFarmingLogs = async () => {
    try {
      setIsExportingFarmingLogs(true);
      await reportApi.exportFarmingLogsExcel();
      showToast('Xuất nhật ký canh tác VietGAP Excel thành công!', 'success');
    } catch {
      showToast('Không thể xuất nhật ký canh tác VietGAP. Vui lòng thử lại.', 'error');
    } finally {
      setIsExportingFarmingLogs(false);
    }
  };

  return (
    <div className="space-y-5 pb-16 animate-fade-in font-sans">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[11.5px] font-mono font-bold text-slate-400">
              {activeCooperative?.legal_name || 'Hợp tác xã'} / Báo cáo Quản trị
            </span>
            <span className="pill-badge pill-blue">Luật HTX 2023 & OCOP QĐ 148</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight mt-0.5">
            Trung tâm Báo cáo - Thống kê Hoạt động HTX & OCOP
          </h1>
          <p className="text-[12.8px] text-slate-500 mt-0.5">
            Hệ thống trích xuất báo cáo quản trị, đối soát sổ sách và hỗ trợ in/tải PDF chuyên biệt cho máy tính xách tay.
          </p>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-center">
          <button
            onClick={handleRefreshAll}
            className="px-3.5 py-2 rounded-xl bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 font-bold text-xs inline-flex items-center gap-1.5 shadow-2xs transition-all cursor-pointer"
          >
            <RefreshCw className="w-4 h-4 text-emerald-600" />
            <span>Cập nhật số liệu</span>
          </button>
        </div>
      </div>

      {/* Navigation Tabs Bar */}
      <div className="flex border-b border-slate-200 bg-white rounded-t-2xl px-4 pt-2 overflow-x-auto scrollbar-none">
        <button
          type="button"
          onClick={() => setActiveTab('members')}
          className={`py-2.5 px-4 text-xs font-bold border-b-2 transition-all shrink-0 cursor-pointer flex items-center gap-1.5 ${
            activeTab === 'members'
              ? 'border-emerald-700 text-emerald-800'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Users className="w-4 h-4 text-emerald-600" />
          <span>Báo Cáo Xã Viên & Vốn Góp</span>
          <span className="text-[10.5px] px-1.5 py-0.2 rounded-full bg-slate-100 text-slate-600 font-mono">
            {members.length}
          </span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('finance')}
          className={`py-2.5 px-4 text-xs font-bold border-b-2 transition-all shrink-0 cursor-pointer flex items-center gap-1.5 ${
            activeTab === 'finance'
              ? 'border-emerald-700 text-emerald-800'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Receipt className="w-4 h-4 text-blue-600" />
          <span>Sổ Quỹ Tiền Mặt & Dòng Tiền</span>
          <span className="text-[10.5px] px-1.5 py-0.2 rounded-full bg-slate-100 text-slate-600 font-mono">
            {cashList.length}
          </span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('agriculture')}
          className={`py-2.5 px-4 text-xs font-bold border-b-2 transition-all shrink-0 cursor-pointer flex items-center gap-1.5 ${
            activeTab === 'agriculture'
              ? 'border-emerald-700 text-emerald-800'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Sprout className="w-4 h-4 text-emerald-600" />
          <span>Mùa Vụ & An Toàn Canh Tác</span>
          <span className="text-[10.5px] px-1.5 py-0.2 rounded-full bg-slate-100 text-slate-600 font-mono">
            {seasons.length}
          </span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('ocop')}
          className={`py-2.5 px-4 text-xs font-bold border-b-2 transition-all shrink-0 cursor-pointer flex items-center gap-1.5 ${
            activeTab === 'ocop'
              ? 'border-emerald-700 text-emerald-800'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Award className="w-4 h-4 text-amber-500" />
          <span>Tiến Độ Đánh Giá & Xếp Hạng OCOP</span>
          <span className="text-[10.5px] px-1.5 py-0.2 rounded-full bg-slate-100 text-slate-600 font-mono">
            {metrics?.products?.total_products ?? metrics?.totalOcopProducts ?? 0}
          </span>
        </button>
      </div>

      {/* Tab Contents */}
      {activeTab === 'members' && (
        <MembersEquityReportTab
          metrics={metrics}
          members={members}
          isLoading={loadingMetrics || loadingMembers}
          onExportExcel={handleExportMembers}
          isExportingExcel={isExportingMembers}
        />
      )}

      {activeTab === 'finance' && (
        <FinanceCashbookReportTab
          metrics={metrics}
          cashTransactions={cashList}
          isLoading={loadingMetrics || loadingCash}
          onExportExcel={handleExportCashBook}
          isExportingExcel={isExportingCashBook}
          onExportDebts={handleExportDebts}
          isExportingDebts={isExportingDebts}
        />
      )}

      {activeTab === 'agriculture' && (
        <CropVietgapReportTab
          metrics={metrics}
          seasons={seasons}
          isLoading={loadingMetrics || loadingSeasons}
          onExportExcel={handleExportFarmingLogs}
          isExportingExcel={isExportingFarmingLogs}
        />
      )}

      {activeTab === 'ocop' && (
        <OcopReadinessReportTab
          metrics={metrics}
          isLoading={loadingMetrics}
        />
      )}
    </div>
  );
};

export default ReportsPage;
