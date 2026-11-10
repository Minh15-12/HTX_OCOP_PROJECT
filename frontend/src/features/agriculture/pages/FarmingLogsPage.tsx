import React, { useState, useMemo } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import {
  Plus,
  Search,
  Filter,
  FileSpreadsheet,
  Calendar,
  Lock,
  AlertTriangle,
  Smartphone,
  Loader2,
  BookOpen,
  Droplets,
  ShieldAlert,
  Wheat,
  Scale,
  ShieldCheck,
  ListOrdered,
  Printer,
  CheckCircle2,
  XCircle,
  X
} from 'lucide-react';
import { fetchFarmingLogs, deleteFarmingLog, createFarmingLog, verifyFarmingLog, rejectFarmingLog } from '@/services/farmingLogApi';
import {
  fetchCropSeasons,
  CropSeason,
  fetchSeasonMaterialReconciliations,
  saveSeasonMaterialReconciliations,
  freezeSeasonLogbook
} from '@/services/cropSeasonApi';
import { fetchAllPlots } from '@/services/farmPlotApi';
import { fetchHarvests } from '@/services/harvestApi';
import { reportApi } from '@/services/reportApi';

// Sổ Nhật Ký 5 Tab Component
import { LogbookCoverTab } from '../components/logbook/LogbookCoverTab';
import { FertigationLogTab } from '../components/logbook/FertigationLogTab';
import { IpmPestControlTab } from '../components/logbook/IpmPestControlTab';
import { HarvestStagesTab } from '../components/logbook/HarvestStagesTab';
import { SeasonReconciliationTab } from '../components/logbook/SeasonReconciliationTab';
import { FertigationEntryModal } from '../components/logbook/FertigationEntryModal';
import { IpmPestEntryModal } from '../components/logbook/IpmPestEntryModal';
import { VietgapLogbookDossierModal } from '../components/logbook/VietgapLogbookDossierModal';

// Components hiện hữu
import { FarmingLogsKpiStats } from '../components/FarmingLogsKpiStats';
import { FarmingLogsTable } from '../components/FarmingLogsTable';
import { PhiSafetyMonitorTab } from '../components/PhiSafetyMonitorTab';
import { FarmingLogModals } from '../components/FarmingLogModals';

import type { FarmingLog, FarmPlot, HarvestItem, SeasonMaterialReconciliation, FarmingLogPayload } from '@/types/agriculture';
import { exportToExcel } from '@/utils/exportUtils';
import { useToast } from '@/components/ui/ToastNotification';

export type LogbookTabKey =
  | 'cover'
  | 'fertigation'
  | 'ipm'
  | 'harvests'
  | 'reconciliation'
  | 'phi'
  | 'all_logs';

export const FarmingLogsPage: React.FC = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { showToast } = useToast();
  const [searchParams] = useSearchParams();
  const paramSeasonId = searchParams.get('season_id') || searchParams.get('seasonId');

  // Tab State
  const [activeTab, setActiveTab] = useState<LogbookTabKey>('cover');
  const [search, setSearch] = useState('');
  const [selectedActivity, setSelectedActivity] = useState<string>('ALL');
  const [selectedSeasonId, setSelectedSeasonId] = useState<string>(paramSeasonId || 'ALL');
  const [selectedPlotId, setSelectedPlotId] = useState<string>('');
  const [isExporting, setIsExporting] = useState<boolean>(false);
  const [isSavingReconciliation, setIsSavingReconciliation] = useState<boolean>(false);
  const [isFreezingLogbook, setIsFreezingLogbook] = useState<boolean>(false);

  // Modals & Dossier
  const [isDossierModalOpen, setIsDossierModalOpen] = useState<boolean>(false);
  const [rejectionModalLog, setRejectionModalLog] = useState<FarmingLog | null>(null);
  const [rejectionReason, setRejectionReason] = useState<string>('');
  const [isRejecting, setIsRejecting] = useState<boolean>(false);

  const [isLogModalOpen, setIsLogModalOpen] = useState(false);
  const [isFertModalOpen, setIsFertModalOpen] = useState(false);
  const [isIpmModalOpen, setIsIpmModalOpen] = useState(false);
  const [selectedPhoto, setSelectedPhoto] = useState<string | null>(null);
  const [selectedLogForDetailModal, setSelectedLogForDetailModal] = useState<FarmingLog | null>(null);
  const [selectedLogForEdit, setSelectedLogForEdit] = useState<FarmingLog | null>(null);
  const [logToDelete, setLogToDelete] = useState<FarmingLog | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Query Mùa Vụ
  const { data: seasonsData } = useQuery({ queryKey: ['cropSeasons'], queryFn: () => fetchCropSeasons() });
  const seasons: CropSeason[] = Array.isArray(seasonsData) ? seasonsData : (seasonsData as any)?.data || [];

  React.useEffect(() => {
    if (paramSeasonId) {
      setSelectedSeasonId(paramSeasonId);
    } else if (seasons.length > 0 && selectedSeasonId === 'ALL') {
      setSelectedSeasonId(seasons[0].id);
    }
  }, [paramSeasonId, seasons]);

  const currentSeason = seasons.find((s) => s.id === selectedSeasonId) || seasons[0];
  const isSeasonReadOnly = currentSeason?.status === 'COMPLETED' || currentSeason?.logbook_status === 'FROZEN_ARCHIVED';

  // Query Thửa Đất
  const { data: rawPlots = [] } = useQuery<FarmPlot[]>({
    queryKey: ['farmPlots'],
    queryFn: () => fetchAllPlots(),
  });

  const plots: FarmPlot[] = useMemo(() => {
    return Array.isArray(rawPlots) ? rawPlots : [];
  }, [rawPlots]);

  React.useEffect(() => {
    if (plots.length > 0 && !selectedPlotId) {
      setSelectedPlotId(plots[0].id);
    }
  }, [plots, selectedPlotId]);

  // Query Nhật Ký Canh Tác
  const { data: rawLogsList = [], isLoading } = useQuery<FarmingLog[]>({
    queryKey: ['farming-logs', search, selectedActivity],
    queryFn: async () => fetchFarmingLogs({ search: search.trim() || undefined, activity_type: selectedActivity !== 'ALL' ? selectedActivity : undefined }),
  });

  const logsList = useMemo(() => {
    if (selectedSeasonId === 'ALL') return rawLogsList;
    return rawLogsList.filter((l) => l.crop_season_id === selectedSeasonId);
  }, [rawLogsList, selectedSeasonId]);

  // Query Thu Hoạch
  const { data: rawHarvests = [] } = useQuery<HarvestItem[]>({
    queryKey: ['harvests', selectedSeasonId],
    queryFn: () => fetchHarvests({ season_id: selectedSeasonId !== 'ALL' ? selectedSeasonId : undefined }),
  });

  const seasonHarvests = useMemo(() => {
    return Array.isArray(rawHarvests) ? rawHarvests : [];
  }, [rawHarvests]);

  // Query Đối Soát Cân Bằng Vật Tư Cuối Vụ
  const { data: rawReconciliations = [] } = useQuery<SeasonMaterialReconciliation[]>({
    queryKey: ['season-reconciliations', currentSeason?.id],
    queryFn: () => currentSeason?.id ? fetchSeasonMaterialReconciliations(currentSeason.id) : Promise.resolve([]),
    enabled: !!currentSeason?.id,
  });

  const reconciliations = useMemo(() => {
    return Array.isArray(rawReconciliations) ? rawReconciliations : [];
  }, [rawReconciliations]);

  // Pagination cho Bảng Flat Logs
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [pageSize, setPageSize] = useState<number>(10);

  const paginatedLogs = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return logsList.slice(start, start + pageSize);
  }, [logsList, currentPage, pageSize]);

  // Statistics
  const stats = useMemo(() => {
    const total = logsList.length;
    const sprayCount = logsList.filter((l) => l.activity_type === 'SPRAYING' || l.activity_type === 'FERTILIZATION').length;
    const quarantineCount = logsList.filter((l) => l.phi_days && l.phi_days > 0).length;
    const gpsAndPhotoCount = logsList.filter((l) => l.gps_latitude && l.attachment_reference && l.attachment_reference.length > 0).length;
    const complianceRate = total > 0 ? Math.round((gpsAndPhotoCount / total) * 100) : 100;
    return { total, sprayCount, quarantineCount, complianceRate };
  }, [logsList]);

  // Handlers
  const handleCreateFastLog = async (payload: FarmingLogPayload) => {
    try {
      await createFarmingLog(payload);
      queryClient.invalidateQueries({ queryKey: ['farming-logs'] });
      queryClient.invalidateQueries({ queryKey: ['season-reconciliations'] });
      showToast('Đã lưu bản ghi nhật ký VietGAP thành công!', 'success');
    } catch {
      showToast('Không thể lưu nhật ký. Vui lòng kiểm tra lại!', 'error');
    }
  };

  const handleSaveReconciliation = async (items: any[]) => {
    if (!currentSeason?.id) return;
    try {
      setIsSavingReconciliation(true);
      await saveSeasonMaterialReconciliations(currentSeason.id, items);
      queryClient.invalidateQueries({ queryKey: ['season-reconciliations', currentSeason.id] });
      showToast('Đã lưu biên bản đối soát cân bằng kho thành công!', 'success');
    } catch {
      showToast('Không thể lưu biên bản đối soát. Vui lòng thử lại!', 'error');
    } finally {
      setIsSavingReconciliation(false);
    }
  };

  const handleFreezeLogbook = async () => {
    if (!currentSeason?.id) return;
    try {
      setIsFreezingLogbook(true);
      await freezeSeasonLogbook(currentSeason.id);
      queryClient.invalidateQueries({ queryKey: ['cropSeasons'] });
      queryClient.invalidateQueries({ queryKey: ['season-reconciliations'] });
      showToast('Đã khóa sổ mùa vụ và thiết lập chữ ký chuỗi băm SHA-256 bất biến!', 'success');
    } catch {
      showToast('Không thể khóa sổ mùa vụ. Vui lòng thử lại!', 'error');
    } finally {
      setIsFreezingLogbook(false);
    }
  };

  const handlePrintCover = () => {
    window.print();
  };

  const handleExportExcel = async () => {
    try {
      setIsExporting(true);
      showToast('Đang kết xuất sổ Nhật ký canh tác điện tử VietGAP...', 'info');
      await reportApi.exportFarmingLogsExcel();
      showToast('Xuất sổ Nhật ký canh tác VietGAP Excel thành công!', 'success');
    } catch (err: any) {
      if (!logsList || logsList.length === 0) {
        showToast('Không có dữ liệu nhật ký canh tác để xuất!', 'warning');
        return;
      }
      const exportRows = logsList.map((log, index) => ({
        STT: index + 1,
        'Mã nhật ký': log.log_code || `LOG-${log.id}`,
        'Ngày thực hiện': log.activity_date,
        'Thửa đất': log.plot_name || log.plot_code,
        'Hoạt động': log.activity_type,
        'Vật tư sử dụng': log.material_name || 'Không có',
        'Hoạt chất BVTV': log.active_ingredient || 'N/A',
        'Nhóm IRAC/FRAC': log.resistance_group || 'N/A',
        'Số Lô (Lot/LSX)': log.material_lot_number || 'N/A',
        'EC Dung dịch': log.ec_solution || 'N/A',
        'pH Dung dịch': log.ph_solution || 'N/A',
        'Thời gian cách ly PHI': log.phi_days || 0,
        'Ngày an toàn thu hoạch': log.safe_harvest_date || 'N/A',
        'Người thực hiện': log.performer_name || 'Xã viên',
      }));
      exportToExcel(exportRows, 'Nhat_Ky_Canh_Tac_VietGAP_TCVN12850', 'NhatKyCanhTac');
      showToast('Xuất dữ liệu nhật ký canh tác sang file Excel thành công!', 'success');
    } finally {
      setIsExporting(false);
    }
  };

  const handleDeleteConfirm = async () => {
    if (!logToDelete) return;
    try {
      setIsDeleting(true);
      await deleteFarmingLog(logToDelete.id);
      showToast('Đã xóa nhật ký canh tác thành công!', 'success');
      setLogToDelete(null);
      queryClient.invalidateQueries({ queryKey: ['farming-logs'] });
    } catch {
      showToast('Không thể xóa nhật ký canh tác. Vui lòng thử lại!', 'error');
    } finally {
      setIsDeleting(false);
    }
  };

  const handleVerifyLog = async (log: FarmingLog) => {
    try {
      await verifyFarmingLog(log.id, { is_compliant: true, notes: 'Thẩm định hợp chuẩn VietGAP TCVN 11892-1:2017' });
      showToast(`Đã thẩm định hợp chuẩn nhật ký ${log.log_code || log.id} thành công!`, 'success');
      queryClient.invalidateQueries({ queryKey: ['farming-logs'] });
    } catch (err: any) {
      showToast(err?.message || 'Lỗi khi thẩm định nhật ký!', 'error');
    }
  };

  const handleOpenRejectModal = (log: FarmingLog) => {
    setRejectionModalLog(log);
    setRejectionReason('');
  };

  const handleConfirmReject = async () => {
    if (!rejectionModalLog) return;
    if (!rejectionReason.trim()) {
      showToast('Vui lòng nhập lý do từ chối giải trình!', 'warning');
      return;
    }
    setIsRejecting(true);
    try {
      await rejectFarmingLog(rejectionModalLog.id, { rejection_reason: rejectionReason.trim() });
      showToast(`Đã từ chối nhật ký ${rejectionModalLog.log_code || rejectionModalLog.id} và gửi yêu cầu giải trình!`, 'success');
      setRejectionModalLog(null);
      setRejectionReason('');
      queryClient.invalidateQueries({ queryKey: ['farming-logs'] });
    } catch (err: any) {
      showToast(err?.message || 'Lỗi khi từ chối nhật ký!', 'error');
    } finally {
      setIsRejecting(false);
    }
  };

  return (
    <div className="space-y-6 pb-20 animate-fade-in text-slate-800">
      {/* 1. Header with Title & Action Buttons */}
      <div className="flex flex-col gap-4 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="inline-flex items-center gap-2 rounded-full bg-emerald-50 px-3 py-1 text-xs font-black text-emerald-800 border border-emerald-200">
            <BookOpen className="w-3.5 h-3.5 text-emerald-700" />
            <span>Sổ Nhật Ký Canh Tác Điện Tử Chuẩn VietGAP &amp; OCOP</span>
          </div>
          <h1 className="mt-2 text-2xl font-black tracking-tight text-slate-900 sm:text-3xl">
            Sổ Nhật Ký Mùa Vụ Số (Digital Season Logbook)
          </h1>
          <p className="mt-1 text-xs sm:text-sm text-slate-500 font-medium">
            Tuân thủ VietGAP TCVN 11892-1:2017 • Nghị định 38/2026/NĐ-CP • TCVN 12850:2019 • Quản trị cách ly PHI &amp; Merkle Root SHA-256
          </p>
        </div>

        <div className="flex items-center gap-2.5 flex-wrap">
          {/* Chọn Vụ Mùa Trọng Tâm */}
          <div className="flex items-center gap-2 bg-slate-50 px-3 py-2 rounded-2xl border border-slate-200">
            <Calendar className="w-4 h-4 text-emerald-700 shrink-0" />
            <select
              value={selectedSeasonId}
              onChange={(e) => setSelectedSeasonId(e.target.value)}
              className="bg-transparent text-xs font-bold text-slate-800 focus:outline-none cursor-pointer"
            >
              {seasons.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name} ({s.crop})
                </option>
              ))}
            </select>
          </div>

          {/* Mode Switcher to Mobile Field Entry */}
          <button
            type="button"
            onClick={() => navigate('/agriculture/field-entry')}
            className="min-h-[44px] shrink-0 inline-flex items-center justify-center gap-2 rounded-2xl border border-emerald-600 bg-emerald-50 hover:bg-emerald-100 px-3.5 py-2.5 text-xs font-extrabold text-emerald-800 shadow-2xs transition active:scale-95 cursor-pointer"
            title="Chuyển sang giao diện thao tác nhanh trên điện thoại dành cho xã viên ngoài vườn"
          >
            <Smartphone className="w-4 h-4 text-emerald-700" />
            <span>Mobile App</span>
          </button>

          {/* Trọn Bộ Hồ Sơ VietGAP A4 */}
          <button
            type="button"
            onClick={() => setIsDossierModalOpen(true)}
            className="min-h-[44px] shrink-0 inline-flex items-center gap-1.5 px-3.5 py-2.5 rounded-2xl bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs shadow-xs transition active:scale-95 cursor-pointer"
            title="Mở toàn bộ hồ sơ sổ nhật ký canh tác A4 chuẩn công vụ (TCVN 11892-1:2017) để in hoặc tải PDF/Excel"
          >
            <Printer className="w-4 h-4" />
            <span>Hồ Sơ VietGAP A4</span>
          </button>

          {/* Xuất Excel */}
          <button
            onClick={handleExportExcel}
            disabled={isExporting}
            className="min-h-[44px] shrink-0 inline-flex items-center gap-1.5 px-3.5 py-2.5 rounded-2xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 font-bold text-xs shadow-2xs transition cursor-pointer disabled:opacity-50"
            title="Xuất dữ liệu VietGAP sang file Excel"
          >
            {isExporting ? <Loader2 className="w-4 h-4 animate-spin text-slate-600" /> : <FileSpreadsheet className="w-4 h-4 text-emerald-700" />}
            <span>Xuất Excel</span>
          </button>
        </div>
      </div>

      {/* 2. Top 4 KPI Metric Cards */}
      <FarmingLogsKpiStats stats={stats} />

      {/* 3. Navigation Bar 6 Tab Chuẩn VietGAP */}
      <div className="flex items-center gap-1.5 border-b border-slate-200 bg-white p-2 rounded-2xl shadow-xs overflow-x-auto scrollbar-none">
        <button
          type="button"
          onClick={() => setActiveTab('cover')}
          className={`flex items-center gap-2 px-3.5 py-2.5 rounded-xl text-xs font-bold transition whitespace-nowrap ${
            activeTab === 'cover'
              ? 'bg-emerald-700 text-white shadow-xs'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
          }`}
        >
          <BookOpen className="w-4 h-4" />
          <span>I. Bìa Sổ &amp; Đầu Vụ</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('fertigation')}
          className={`flex items-center gap-2 px-3.5 py-2.5 rounded-xl text-xs font-bold transition whitespace-nowrap ${
            activeTab === 'fertigation'
              ? 'bg-emerald-700 text-white shadow-xs'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
          }`}
        >
          <Droplets className="w-4 h-4" />
          <span>II. Sổ Dinh Dưỡng &amp; Fertigation</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('ipm')}
          className={`flex items-center gap-2 px-3.5 py-2.5 rounded-xl text-xs font-bold transition whitespace-nowrap ${
            activeTab === 'ipm'
              ? 'bg-emerald-700 text-white shadow-xs'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
          }`}
        >
          <ShieldAlert className="w-4 h-4" />
          <span>III. Sổ Dịch Hại &amp; BVTV (IPM)</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('harvests')}
          className={`flex items-center gap-2 px-3.5 py-2.5 rounded-xl text-xs font-bold transition whitespace-nowrap ${
            activeTab === 'harvests'
              ? 'bg-emerald-700 text-white shadow-xs'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
          }`}
        >
          <Wheat className="w-4 h-4" />
          <span>IV. Sổ Thu Hoạch Rải Vụ</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('reconciliation')}
          className={`flex items-center gap-2 px-3.5 py-2.5 rounded-xl text-xs font-bold transition whitespace-nowrap ${
            activeTab === 'reconciliation'
              ? 'bg-emerald-700 text-white shadow-xs'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
          }`}
        >
          <Scale className="w-4 h-4" />
          <span>V. Cân Bằng Kho &amp; Khóa Sổ</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('phi')}
          className={`flex items-center gap-2 px-3.5 py-2.5 rounded-xl text-xs font-bold transition whitespace-nowrap ${
            activeTab === 'phi'
              ? 'bg-rose-700 text-white shadow-xs'
              : 'text-rose-700 hover:bg-rose-50'
          }`}
        >
          <AlertTriangle className="w-4 h-4" />
          <span>Bàn Giám Sát PHI</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('all_logs')}
          className={`flex items-center gap-2 px-3.5 py-2.5 rounded-xl text-xs font-bold transition whitespace-nowrap ${
            activeTab === 'all_logs'
              ? 'bg-slate-800 text-white shadow-xs'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
          }`}
        >
          <ListOrdered className="w-4 h-4" />
          <span>Tất Cả Nhật Ký ({logsList.length})</span>
        </button>
      </div>

      {/* 4. Nội Dung Chi Tiết Từng Tab */}
      {activeTab === 'cover' && (
        <LogbookCoverTab
          season={currentSeason}
          plots={plots}
          selectedPlotId={selectedPlotId}
          onSelectPlot={setSelectedPlotId}
          onPrintCover={handlePrintCover}
        />
      )}

      {activeTab === 'fertigation' && (
        <FertigationLogTab
          logs={logsList}
          onAddLog={() => setIsFertModalOpen(true)}
          onViewDetail={(log) => setSelectedLogForDetailModal(log)}
          isReadOnly={isSeasonReadOnly}
        />
      )}

      {activeTab === 'ipm' && (
        <IpmPestControlTab
          logs={logsList}
          onAddLog={() => setIsIpmModalOpen(true)}
          onViewDetail={(log) => setSelectedLogForDetailModal(log)}
          isReadOnly={isSeasonReadOnly}
        />
      )}

      {activeTab === 'harvests' && (
        <HarvestStagesTab
          harvests={seasonHarvests}
          season={currentSeason}
          onAddHarvest={() => navigate('/agriculture/harvests')}
          onViewDetail={(h) => navigate(`/trace/LOT-${h.id}`)}
          onPrintSlip={(h) => window.print()}
          isReadOnly={isSeasonReadOnly}
        />
      )}

      {activeTab === 'reconciliation' && (
        <SeasonReconciliationTab
          season={currentSeason}
          reconciliations={reconciliations}
          onSaveReconciliation={handleSaveReconciliation}
          onFreezeLogbook={handleFreezeLogbook}
          isSaving={isSavingReconciliation}
          isFreezing={isFreezingLogbook}
        />
      )}

      {activeTab === 'phi' && (
        <PhiSafetyMonitorTab
          logs={logsList}
          onSelectLog={(l) => setSelectedLogForDetailModal(l)}
          onOpenQuickLog={() => setIsLogModalOpen(true)}
        />
      )}

      {activeTab === 'all_logs' && (
        <div className="space-y-4">
          {/* Table Toolbar */}
          <div className="p-4 bg-white border border-slate-200 rounded-2xl shadow-subtle flex flex-wrap items-center justify-between gap-3">
            <div className="relative flex-1 min-w-[280px]">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Tìm theo mã thửa, vật tư, hoạt động, số lô, người thực hiện..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-[13px] text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
              />
            </div>

            <div className="flex items-center gap-2 flex-wrap">
              <div className="flex items-center gap-2">
                <Filter className="w-4 h-4 text-slate-500 shrink-0" />
                <select
                  value={selectedActivity}
                  onChange={(e) => setSelectedActivity(e.target.value)}
                  className="min-h-[38px] px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 focus:outline-none focus:border-emerald-500"
                >
                  <option value="ALL">Tất cả hoạt động</option>
                  <option value="LAND_PREPARATION">Làm đất &amp; Xử lý giá thể</option>
                  <option value="FERTILIZATION">Bón phân &amp; Dinh dưỡng</option>
                  <option value="SPRAYING">Phun thuốc BVTV &amp; Chế phẩm</option>
                  <option value="BIOCONTROL">Thả Thiên Địch (Sinh học)</option>
                  <option value="IPM_SCOUTING">Điều tra Dịch hại (IPM)</option>
                  <option value="CARE">Chăm sóc &amp; Tỉa cành</option>
                  <option value="HARVEST">Thu hoạch</option>
                </select>
              </div>

              {!isSeasonReadOnly && (
                <button
                  onClick={() => setIsLogModalOpen(true)}
                  className="min-h-[38px] inline-flex items-center gap-2 rounded-xl bg-emerald-700 px-4 py-2 text-xs font-extrabold text-white shadow-md shadow-emerald-700/20 transition hover:bg-emerald-800"
                >
                  <Plus className="w-4 h-4" />
                  <span>Ghi nhật ký mới</span>
                </button>
              )}
            </div>
          </div>

          <FarmingLogsTable
            logsList={logsList}
            paginatedLogs={paginatedLogs}
            activeLog={selectedLogForDetailModal}
            isLoading={isLoading}
            isSeasonReadOnly={!!isSeasonReadOnly}
            currentPage={currentPage}
            pageSize={pageSize}
            onPageChange={setCurrentPage}
            onPageSizeChange={(newSize) => {
              setPageSize(newSize);
              setCurrentPage(1);
            }}
            onSelectLog={(id) => {
              const log = logsList.find((l) => l.id === id);
              if (log) setSelectedLogForDetailModal(log);
            }}
            onOpenDetailModal={setSelectedLogForDetailModal}
            onOpenEditModal={setSelectedLogForEdit}
            onOpenDeleteModal={setLogToDelete}
            onSelectPhoto={setSelectedPhoto}
            onVerifyLog={handleVerifyLog}
            onRejectLog={handleOpenRejectModal}
          />
        </div>
      )}

      {/* Modals & Dialogs */}
      <FertigationEntryModal
        isOpen={isFertModalOpen}
        onClose={() => setIsFertModalOpen(false)}
        onSubmit={handleCreateFastLog}
        season={currentSeason}
        plots={plots}
        selectedPlotId={selectedPlotId}
      />

      <IpmPestEntryModal
        isOpen={isIpmModalOpen}
        onClose={() => setIsIpmModalOpen(false)}
        onSubmit={handleCreateFastLog}
        season={currentSeason}
        plots={plots}
        selectedPlotId={selectedPlotId}
      />

      <FarmingLogModals
        isLogModalOpen={isLogModalOpen}
        onCloseLogModal={() => setIsLogModalOpen(false)}
        onLogCreated={() => {
          queryClient.invalidateQueries({ queryKey: ['farming-logs'] });
          showToast('Đã lưu nhật ký canh tác thành công!', 'success');
        }}
        selectedSeasonId={selectedSeasonId !== 'ALL' ? selectedSeasonId : undefined}
        selectedLogForDetailModal={selectedLogForDetailModal}
        onCloseDetailModal={() => setSelectedLogForDetailModal(null)}
        onOpenEditFromDetail={(log) => {
          setSelectedLogForDetailModal(null);
          setSelectedLogForEdit(log);
        }}
        onOpenDeleteFromDetail={(log) => {
          setSelectedLogForDetailModal(null);
          setLogToDelete(log);
        }}
        onVerifyLog={handleVerifyLog}
        onRejectLog={handleOpenRejectModal}
        selectedLogForEdit={selectedLogForEdit}
        onCloseEditModal={() => setSelectedLogForEdit(null)}
        onLogUpdated={() => {
          queryClient.invalidateQueries({ queryKey: ['farming-logs'] });
          showToast('Đã cập nhật nhật ký canh tác thành công!', 'success');
        }}
        logToDelete={logToDelete}
        onCloseDeleteModal={() => setLogToDelete(null)}
        onConfirmDelete={handleDeleteConfirm}
        isDeleting={isDeleting}
        selectedPhoto={selectedPhoto}
        onClosePhoto={() => setSelectedPhoto(null)}
      />

      {/* VietGAP Logbook Dossier A4 Print & Export Modal */}
      <VietgapLogbookDossierModal
        isOpen={isDossierModalOpen}
        onClose={() => setIsDossierModalOpen(false)}
        season={currentSeason}
        plots={plots}
        logs={logsList}
        harvests={seasonHarvests}
        reconciliations={reconciliations}
      />

      {/* ICS Rejection Reason Modal */}
      {rejectionModalLog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 p-4 backdrop-blur-xs animate-fade-in text-xs">
          <div className="relative w-full max-w-md bg-white rounded-2xl shadow-xl border border-slate-200 p-5 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h4 className="text-sm font-black text-rose-900 flex items-center gap-1.5">
                <AlertTriangle className="w-4 h-4 text-rose-600" />
                Từ Chối Nhật Ký &amp; Yêu Cầu Giải Trình
              </h4>
              <button
                type="button"
                onClick={() => setRejectionModalLog(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-2">
              <p className="text-slate-600 font-medium leading-relaxed">
                Bạn đang từ chối phê duyệt nhật ký <strong className="text-slate-900 font-mono">{rejectionModalLog.log_code || rejectionModalLog.id}</strong> ({rejectionModalLog.activity_type} - {rejectionModalLog.activity_date}).
              </p>
              <div>
                <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">
                  Lý do từ chối / Nội dung sai lệch cần giải trình (*):
                </label>
                <textarea
                  value={rejectionReason}
                  onChange={(e) => setRejectionReason(e.target.value)}
                  placeholder="Ví dụ: Ghi lùi ngày quá 48h không có biên bản sự cố, hoặc tọa độ GPS nằm ngoài ranh giới thửa..."
                  rows={3}
                  className="w-full p-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500 text-xs"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setRejectionModalLog(null)}
                className="px-4 py-2 rounded-xl border border-slate-200 hover:bg-slate-50 font-bold text-slate-600 cursor-pointer"
              >
                Hủy bỏ
              </button>
              <button
                type="button"
                onClick={handleConfirmReject}
                disabled={isRejecting || !rejectionReason.trim()}
                className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold transition disabled:opacity-50 cursor-pointer"
              >
                {isRejecting ? 'Đang xử lý...' : 'Xác nhận từ chối'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default FarmingLogsPage;
