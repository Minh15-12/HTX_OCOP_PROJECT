import React, { useState, useMemo } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Wheat, Plus, ChevronRight, Boxes, Banknote } from 'lucide-react';
import { useTenantContextStore } from '@/stores/tenantContextStore';
import { useToast } from '@/components/ui/ToastNotification';
import { fetchHarvests, createHarvest, deleteHarvest } from '@/services/harvestApi';
import { fetchLots, updateLotStatus } from '@/services/lotApi';
import { fetchAllPlots, FarmPlot } from '@/services/farmPlotApi';
import { exportToExcel } from '@/utils/exportUtils';
import type { HarvestItem, Gs1LotItem, LotLifecycleStatus } from '@/types/agriculture';

import { HarvestKpiStats } from '../components/HarvestKpiStats';
import { HarvestsTable } from '../components/HarvestsTable';
import { LotsInventoryTab } from '../components/LotsInventoryTab';
import { KcsHarvestModal } from '../components/KcsHarvestModal';
import { HarvestLabelPrintModal } from '../components/HarvestLabelPrintModal';
import { HarvestDrawer } from '../components/drawer/HarvestDrawer';
import { EditHarvestModal } from '../components/EditHarvestModal';
import { DeleteHarvestModal } from '../components/DeleteHarvestModal';

export const HarvestsPage: React.FC = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { showToast } = useToast();
  const { activeCooperative } = useTenantContextStore();

  // Navigation tab
  const [activeTab, setActiveTab] = useState<'HARVESTS' | 'LOTS'>('HARVESTS');

  // Modals state
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [selectedHarvestForPrint, setSelectedHarvestForPrint] = useState<HarvestItem | null>(null);
  const [selectedHarvestForDrawer, setSelectedHarvestForDrawer] = useState<HarvestItem | null>(null);
  const [selectedHarvestForEdit, setSelectedHarvestForEdit] = useState<HarvestItem | null>(null);
  const [harvestToDelete, setHarvestToDelete] = useState<HarvestItem | null>(null);

  const [searchParams, setSearchParams] = useSearchParams();
  const paramSeasonId = searchParams.get('season_id') || searchParams.get('seasonId');

  // Plots for Gate Check PHI verification
  const { data: plots = [] } = useQuery<FarmPlot[]>({
    queryKey: ['farmPlots', 'all'],
    queryFn: () => fetchAllPlots(),
  });

  // Query Harvests
  const { data: rawHarvestList = [], isLoading: isLoadingHarvests } = useQuery<HarvestItem[]>({
    queryKey: ['harvests'],
    queryFn: () => fetchHarvests(),
  });

  const harvestList = useMemo(() => {
    if (!paramSeasonId) return rawHarvestList;
    return rawHarvestList.filter((h) => h.crop_season_id === paramSeasonId);
  }, [rawHarvestList, paramSeasonId]);

  // Query GS1 Lots
  const { data: rawLotsList = [], isLoading: isLoadingLots } = useQuery<Gs1LotItem[]>({
    queryKey: ['gs1-lots'],
    queryFn: () => fetchLots(),
  });

  // KPI Metrics Calculation
  const kpiStats = useMemo(() => {
    const totalVolume = harvestList.reduce((acc, h) => acc + (Number(h.quantity_kg ?? (h as any).quantity) || 0), 0);
    const gradeAVolume = harvestList.reduce((acc, h) => acc + (Number(h.grade_a_kg) || 0), 0);
    const gradeAPercent = totalVolume > 0 ? Math.round((gradeAVolume / totalVolume) * 100) : 0;
    const totalLots = harvestList.length;

    return { totalVolume, gradeAVolume, gradeAPercent, totalLots };
  }, [harvestList]);

  // Create Harvest Mutation
  const createHarvestMutation = useMutation({
    mutationFn: async (payload: any) => {
      return createHarvest(payload);
    },
    onSuccess: (newItem: HarvestItem) => {
      showToast(`Ghi nhận thu hoạch thành công! Đã tự động sinh mã lô GS1: ${newItem.lot_code}`);
      setIsAddModalOpen(false);
      queryClient.invalidateQueries({ queryKey: ['harvests'] });
      queryClient.invalidateQueries({ queryKey: ['gs1-lots'] });
    },
    onError: (err: any) => {
      showToast(err.message || 'Ghi nhận thu hoạch thất bại.', 'error');
    },
  });

  // Delete Harvest Mutation
  const deleteHarvestMutation = useMutation({
    mutationFn: async (id: string) => {
      return deleteHarvest(id);
    },
    onSuccess: () => {
      showToast(`Đã hủy lệnh thu hoạch [${harvestToDelete?.harvest_code}] thành công`);
      setHarvestToDelete(null);
      queryClient.invalidateQueries({ queryKey: ['harvests'] });
      queryClient.invalidateQueries({ queryKey: ['gs1-lots'] });
    },
    onError: (err: any) => {
      showToast(err.message || 'Hủy lệnh thu hoạch thất bại', 'error');
    },
  });

  // Update Lot Status Mutation
  const updateLotMutation = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: LotLifecycleStatus }) => {
      return updateLotStatus(id, status);
    },
    onSuccess: (updated) => {
      showToast(`Đã chuyển trạng thái lô [${updated.lot_code}] sang [${updated.status}] thành công!`);
      queryClient.invalidateQueries({ queryKey: ['gs1-lots'] });
    },
    onError: (err: any) => {
      showToast(err.message || 'Cập nhật trạng thái lô thất bại', 'error');
    },
  });

  const handleExportExcel = () => {
    if (rawHarvestList.length === 0) {
      showToast('Không có dữ liệu thu hoạch để xuất!', 'warning');
      return;
    }

    const exportData = rawHarvestList.map((item, idx) => ({
      STT: idx + 1,
      'Mã lệnh thu hoạch': item.harvest_code,
      'Mã lô GS1': item.lot_code,
      'Ngày thu hoạch': item.harvest_date,
      'Mã thửa đất': item.plot_code,
      'Tên thửa đất': item.plot_name,
      'Mùa vụ': item.crop_season_name || 'Vụ Canh Tác OCOP',
      'Tổng sản lượng (kg)': item.quantity_kg,
      'Grade A (kg)': item.grade_a_kg || 0,
      'Grade B (kg)': item.grade_b_kg || 0,
      'Hàng loại (kg)': item.reject_kg || 0,
      'Phẩm cấp KCS': item.quality_grade,
      'Độ ngọt Brix (°)': item.brix_level ?? 7.5,
      'Độ đồng đều (%)': item.uniformity_rate ?? 90,
      'Kiểm soát Gate PHI': item.is_phi_cleared ? 'Đạt an toàn PHI' : 'Vi phạm PHI',
      'Kết quả Quick Lab':
        item.kcs_quick_lab?.test_result === 'LAB_PASSED' ? 'Âm tính (Pass)' : 'Dương tính (Reject)',
    }));

    exportToExcel(exportData, `Danh_Sach_Thu_Hoach_KCS_GS1_${activeCooperative?.id || 'HTX'}`, 'ThuHoachKCS');
    showToast('Xuất danh sách thu hoạch sang file Excel (.xlsx) thành công!');
  };

  return (
    <div className="space-y-4 pb-12 animate-fade-in text-[13px] text-slate-700">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-3 bg-white p-4.5 rounded-2xl border border-slate-200 shadow-xs">
        <div className="flex items-center gap-3.5">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-emerald-100 text-emerald-700 shadow-2xs">
            <Wheat className="h-6 w-6" strokeWidth={2.2} />
          </div>
          <div>
            <div className="flex items-center gap-2 text-[11px] font-semibold text-slate-400">
              <span className="font-bold text-slate-700">
                {activeCooperative?.legal_name || 'Hợp tác xã'}
              </span>
              <ChevronRight className="h-3 w-3 text-slate-300" />
              <span className="bg-emerald-50 text-emerald-800 border border-emerald-200 px-2 py-0.2 rounded-full font-bold">
                Chuẩn GS1 Traceability
              </span>
            </div>
            <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight mt-0.5">
              Quản Lý Thu Hoạch, KCS & Lô Hàng GS1
            </h1>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => navigate('/finance?tab=harvest-settlements')}
            className="inline-flex items-center justify-center gap-1.5 rounded-xl border border-emerald-300 bg-emerald-50 px-3.5 py-2.5 text-xs font-bold text-emerald-800 shadow-2xs transition hover:bg-emerald-100 active:scale-98 cursor-pointer shrink-0"
            title="Mở Bảng kê quyết toán & Cấn trừ nợ nông sản (Điều 74 Luật HTX)"
          >
            <Banknote className="w-4 h-4 text-emerald-700" />
            <span>Quyết toán nông sản</span>
          </button>
          {activeTab === 'HARVESTS' && (
            <button
              type="button"
              onClick={() => setIsAddModalOpen(true)}
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-700 px-4 py-2.5 text-xs font-bold text-white shadow-xs transition hover:bg-emerald-800 active:scale-98 cursor-pointer shrink-0"
            >
              <Plus className="w-4 h-4 stroke-[2.5]" />
              <span>Ghi nhận thu hoạch mới</span>
            </button>
          )}
        </div>
      </div>

      {/* Tabs navigation */}
      <div className="flex items-center border-b border-slate-200 gap-2 mb-1">
        <button
          type="button"
          onClick={() => setActiveTab('HARVESTS')}
          className={`flex items-center gap-2 py-2.5 px-4 font-bold text-xs border-b-2 -mb-px transition-all cursor-pointer ${
            activeTab === 'HARVESTS'
              ? 'border-emerald-700 text-emerald-800 bg-white rounded-t-xl shadow-2xs'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Wheat className="w-4 h-4" />
          <span>Lệnh Thu Hoạch & Nghiệm Thu KCS ({harvestList.length})</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('LOTS')}
          className={`flex items-center gap-2 py-2.5 px-4 font-bold text-xs border-b-2 -mb-px transition-all cursor-pointer ${
            activeTab === 'LOTS'
              ? 'border-emerald-700 text-emerald-800 bg-white rounded-t-xl shadow-2xs'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Boxes className="w-4 h-4" />
          <span>Vòng Đời Lô Hàng GS1 ({rawLotsList.length})</span>
        </button>
      </div>

      {/* Active Season Filter Indicator */}
      {paramSeasonId && (
        <div className="p-3 bg-blue-50 border border-blue-200 rounded-xl text-blue-900 text-xs font-bold flex items-center justify-between shadow-2xs">
          <span>Đang lọc lệnh thu hoạch theo mã mùa vụ: <code className="font-mono bg-blue-100 px-1 py-0.5 rounded">{paramSeasonId}</code></span>
          <button
            type="button"
            onClick={() => {
              searchParams.delete('season_id');
              searchParams.delete('seasonId');
              setSearchParams(searchParams);
            }}
            className="text-blue-700 hover:text-blue-950 underline cursor-pointer text-xs font-bold"
          >
            Bỏ lọc (Xem toàn bộ)
          </button>
        </div>
      )}

      {/* TAB 1: HARVESTS & KCS */}
      {activeTab === 'HARVESTS' && (
        <div className="space-y-4 pt-1">
          <HarvestKpiStats
            totalVolume={kpiStats.totalVolume}
            gradeAVolume={kpiStats.gradeAVolume}
            gradeAPercent={kpiStats.gradeAPercent}
            totalLots={kpiStats.totalLots}
          />

          <div className="w-full">
            <HarvestsTable
              harvests={harvestList}
              activeHarvestId={selectedHarvestForDrawer?.id || null}
              isLoading={isLoadingHarvests}
              onSelectHarvest={(id) => {
                const item = harvestList.find((h) => h.id === id);
                if (item) setSelectedHarvestForDrawer(item);
              }}
              onExportExcel={handleExportExcel}
              onViewDetail={(h) => setSelectedHarvestForDrawer(h)}
              onEdit={(h) => setSelectedHarvestForEdit(h)}
              onPrintLabel={(h) => setSelectedHarvestForPrint(h)}
              onDelete={(h) => setHarvestToDelete(h)}
              onOpenAddModal={() => setIsAddModalOpen(true)}
            />
          </div>
        </div>
      )}

      {/* TAB 2: GS1 LOTS INVENTORY */}
      {activeTab === 'LOTS' && (
        <LotsInventoryTab
          lots={rawLotsList}
          isLoading={isLoadingLots}
          onUpdateStatus={(id, status) => updateLotMutation.mutate({ id, status })}
        />
      )}

      {/* Modals */}
      <KcsHarvestModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        plots={plots}
        onSubmit={async (payload) => {
          await createHarvestMutation.mutateAsync(payload);
        }}
        isSubmitting={createHarvestMutation.isPending}
      />

      <HarvestLabelPrintModal
        isOpen={!!selectedHarvestForPrint}
        onClose={() => setSelectedHarvestForPrint(null)}
        harvest={selectedHarvestForPrint}
      />

      <HarvestDrawer
        isOpen={Boolean(selectedHarvestForDrawer)}
        onClose={() => setSelectedHarvestForDrawer(null)}
        harvest={selectedHarvestForDrawer}
        onEdit={(h) => {
          setSelectedHarvestForDrawer(null);
          setSelectedHarvestForEdit(h);
        }}
        onPrintLabel={(h) => {
          setSelectedHarvestForDrawer(null);
          setSelectedHarvestForPrint(h);
        }}
        onDelete={(h) => {
          setSelectedHarvestForDrawer(null);
          setHarvestToDelete(h);
        }}
      />

      <EditHarvestModal
        isOpen={!!selectedHarvestForEdit}
        onClose={() => setSelectedHarvestForEdit(null)}
        harvest={selectedHarvestForEdit}
        onSuccess={() => {
          queryClient.invalidateQueries({ queryKey: ['harvests'] });
          queryClient.invalidateQueries({ queryKey: ['gs1-lots'] });
        }}
      />

      <DeleteHarvestModal
        harvest={harvestToDelete}
        onClose={() => setHarvestToDelete(null)}
        onConfirm={async () => {
          if (harvestToDelete) {
            await deleteHarvestMutation.mutateAsync(harvestToDelete.id);
          }
        }}
        isDeleting={deleteHarvestMutation.isPending}
      />
    </div>
  );
};
