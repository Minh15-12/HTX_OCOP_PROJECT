import React, { useState, useEffect } from 'react';
import { MapPin, Plus, ChevronRight, Layers3, Layers, Compass, Printer } from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useTenantContextStore } from '@/stores/tenantContextStore';
import { useToast } from '@/components/ui/ToastNotification';
import {
  fetchProductionUnits,
  createProductionUnit,
  updateProductionUnit,
  fetchPlotsByUnit,
  fetchAllPlots,
  createPlot,
  deletePlot,
  fetchPlotMemberAssignments,
  assignMemberToPlot,
  ProductionUnit,
  ProductionUnitPayload,
  FarmPlot,
  FarmPlotFormData,
  MemberAssignment,
} from '@/services/farmPlotApi';
import { getMembersFromApi } from '@/services/memberService';
import { Member } from '@/types/memberTypes';

import { ProductionUnitsTable } from '../components/ProductionUnitsTable';
import { CompactUnitSelectorBar } from '../components/CompactUnitSelectorBar';
import { FarmPlotsFullTable } from '../components/FarmPlotsFullTable';
import { FarmPlotModals } from '../components/FarmPlotModals';
import { FarmPlotMapView } from '../components/FarmPlotMapView';
import { FarmPlotKpiCards } from '../components/FarmPlotKpiCards';
import { PrintPucMapModal } from '../components/PrintPucMapModal';

export const FarmPlotsPage: React.FC = () => {
  const queryClient = useQueryClient();
  const { showToast } = useToast();
  const { activeCooperative } = useTenantContextStore();

  const [activeTab, setActiveTab] = useState<'units' | 'plots'>('units');
  const [selectedUnitId, setSelectedUnitId] = useState<string | 'ALL'>('ALL');
  const [viewMode, setViewMode] = useState<'split' | 'map'>('split');

  // Modal & Drawer states
  const [unitModalOpen, setUnitModalOpen] = useState(false);
  const [editingUnit, setEditingUnit] = useState<ProductionUnit | null>(null);
  const [addPlotModalOpen, setAddPlotModalOpen] = useState(false);
  const [isPrintPucModalOpen, setIsPrintPucModalOpen] = useState(false);
  const [editingPlot, setEditingPlot] = useState<FarmPlot | null>(null);
  const [plotToDelete, setPlotToDelete] = useState<FarmPlot | null>(null);
  const [selectedPlotForDrawer, setSelectedPlotForDrawer] = useState<FarmPlot | null>(null);
  const [selectedPlotForAssignments, setSelectedPlotForAssignments] = useState<FarmPlot | null>(null);
  const [assignments, setAssignments] = useState<MemberAssignment[]>([]);
  const [assignmentsLoading, setAssignmentsLoading] = useState(false);

  // Queries
  const { data: units = [], isLoading: loadingUnits } = useQuery<ProductionUnit[]>({
    queryKey: ['productionUnits'],
    queryFn: () => fetchProductionUnits({ per_page: 50 }),
  });

  const selectedUnit = selectedUnitId === 'ALL' ? null : units.find((u) => u.id === selectedUnitId) || null;

  const { data: plots = [], isLoading: loadingPlots } = useQuery<FarmPlot[]>({
    queryKey: ['farmPlots', selectedUnitId],
    queryFn: async () => (selectedUnitId === 'ALL' ? fetchAllPlots() : fetchPlotsByUnit(selectedUnitId)),
  });

  const { data: members = [] } = useQuery<Member[]>({
    queryKey: ['members'],
    queryFn: () => getMembersFromApi().catch(() => []),
  });

  // Mutations
  const saveUnitMutation = useMutation({
    mutationFn: async ({ payload, id }: { payload: ProductionUnitPayload; id?: string }) => {
      return id ? updateProductionUnit(id, payload) : createProductionUnit(payload);
    },
    onSuccess: (savedUnit, variables) => {
      queryClient.invalidateQueries({ queryKey: ['productionUnits'] });
      setUnitModalOpen(false);
      setEditingUnit(null);
      if (savedUnit) setSelectedUnitId(savedUnit.id);
      showToast(
        variables.id
          ? `Đã cập nhật thông tin vùng trồng [${variables.payload.name}]!`
          : `Đã khai báo vùng trồng [${variables.payload.name}] thành công!`
      );
    },
    onError: (err: any) => showToast(err?.message || 'Có lỗi khi lưu thông tin vùng trồng', 'error'),
  });

  const addPlotMutation = useMutation({
    mutationFn: async (plotData: FarmPlotFormData & { unit_id?: string }) => {
      const targetUnitId = plotData.unit_id || selectedUnit?.id || (units.length > 0 ? units[0].id : null);
      if (!targetUnitId) throw new Error('Chưa chọn vùng trồng để gán thửa đất');
      return createPlot(targetUnitId, plotData);
    },
    onSuccess: (newPlot) => {
      queryClient.invalidateQueries({ queryKey: ['farmPlots'] });
      showToast(`Đã thêm thửa đất [${newPlot?.plot_code || 'mới'}] thành công!`);
    },
    onError: (err: any) => showToast(err?.message || 'Có lỗi khi thêm thửa đất', 'error'),
  });

  const deletePlotMutation = useMutation({
    mutationFn: async () => {
      if (!plotToDelete) throw new Error('Không có thông tin thửa đất');
      const targetUnitId = plotToDelete.production_unit_id || selectedUnit?.id;
      if (!targetUnitId) throw new Error('Không xác định được vùng sản xuất');
      return deletePlot(targetUnitId, plotToDelete.id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['farmPlots'] });
      showToast(`Đã xóa / ngưng canh tác thửa đất [${plotToDelete?.plot_code}] thành công`);
      setPlotToDelete(null);
    },
    onError: (err: any) => showToast(err?.message || 'Xóa thửa đất thất bại', 'error'),
  });

  const openAssignmentsModal = async (plot: FarmPlot) => {
    setSelectedPlotForAssignments(plot);
    setAssignmentsLoading(true);
    try {
      const res = await fetchPlotMemberAssignments(plot.id);
      setAssignments(res);
    } catch {
      setAssignments([]);
    } finally {
      setAssignmentsLoading(false);
    }
  };

  const handleAssignMember = async (memberId: string, role: string) => {
    if (!selectedPlotForAssignments) return;
    try {
      await assignMemberToPlot(selectedPlotForAssignments.id, { member_id: memberId, role });
      showToast('Đã phân công xã viên phụ trách thửa đất thành công!');
      const updated = await fetchPlotMemberAssignments(selectedPlotForAssignments.id);
      setAssignments(updated);
    } catch (err: any) {
      showToast(err?.message || 'Có lỗi khi phân công xã viên', 'error');
    }
  };

  const totalArea = units.reduce((a, u) => a + (Number(u.area) || 0), 0);
  const activeCount = units.filter((u) => u.status === 'ACTIVE').length;

  return (
    <div className="min-h-full space-y-4 pb-12 text-[13px] text-slate-700 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between bg-white p-4.5 rounded-2xl border border-slate-200 shadow-xs">
        <div className="flex items-center gap-3.5">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-emerald-100 text-emerald-700 shadow-2xs">
            <MapPin className="h-6 w-6" strokeWidth={2.2} />
          </div>
          <div>
            <div className="flex items-center gap-2 text-[11px] font-semibold text-slate-400">
              <span className="font-bold text-slate-700">
                {activeCooperative?.legal_name || 'Hợp tác xã'}
              </span>
              <ChevronRight className="h-3 w-3 text-slate-300" />
              <span className="text-emerald-700 font-bold">Vùng trồng & Mã PUC Cục BVTV</span>
            </div>
            <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight mt-0.5">
              Quản trị Vùng sản xuất & Mã số vùng trồng (PUC)
            </h1>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => setIsPrintPucModalOpen(true)}
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-blue-50 text-blue-800 hover:bg-blue-100 border border-blue-200 px-3.5 py-2 text-xs font-bold shadow-xs transition active:scale-98 cursor-pointer shrink-0"
            title="In / Tải PDF / Tải Excel Báo cáo trích lục vùng trồng & Thửa đất Mẫu 01-PUC"
          >
            <Printer className="h-4 w-4 text-blue-700" />
            Trích lục Mẫu 01-PUC (PDF/Excel)
          </button>

          {activeTab === 'units' ? (
            <button
              type="button"
              onClick={() => {
                setEditingUnit(null);
                setUnitModalOpen(true);
              }}
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-700 px-4 py-2 text-xs font-bold text-white shadow-xs transition hover:bg-emerald-800 active:scale-98 cursor-pointer shrink-0"
            >
              <Plus className="h-4 w-4" />
              Khai báo vùng trồng mới
            </button>
          ) : (
            <button
              type="button"
              onClick={() => setAddPlotModalOpen(true)}
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-700 px-4 py-2 text-xs font-bold text-white shadow-xs transition hover:bg-emerald-800 active:scale-98 cursor-pointer shrink-0"
            >
              <Plus className="h-4 w-4" />
              Thêm thửa đất mới
            </button>
          )}
        </div>
      </div>

      {/* Stats Cards */}
      <FarmPlotKpiCards
        totalUnits={units.length}
        totalArea={totalArea}
        activeCount={activeCount}
        plotsCount={plots.length}
        selectedUnitCode={selectedUnit ? selectedUnit.unit_code : 'Toàn HTX'}
      />

      {/* 2 Tabs Navigation & View Mode Switcher */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2.5 border-b border-slate-200 bg-white p-2 rounded-2xl shadow-xs">
        <div className="flex items-center gap-1.5 overflow-x-auto">
          <button
            type="button"
            onClick={() => {
              setActiveTab('units');
              setViewMode('split');
            }}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-black transition cursor-pointer whitespace-nowrap ${
              activeTab === 'units' && viewMode !== 'map'
                ? 'bg-emerald-700 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
            }`}
          >
            <Layers className="w-4 h-4" />
            <span>Tab 1: Danh Sách Vùng Trồng &amp; Mã PUC ({units.length})</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setActiveTab('plots');
              setViewMode('split');
            }}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-black transition cursor-pointer whitespace-nowrap ${
              activeTab === 'plots' && viewMode !== 'map'
                ? 'bg-emerald-700 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
            }`}
          >
            <MapPin className="w-4 h-4" />
            <span>Tab 2: Phân Lô Thửa Đất Canh Tác ({plots.length})</span>
          </button>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setViewMode(viewMode === 'map' ? 'split' : 'map')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition border cursor-pointer ${
              viewMode === 'map'
                ? 'bg-emerald-800 text-white border-emerald-900 shadow-xs'
                : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
            }`}
          >
            <Compass className="w-3.5 h-3.5 text-emerald-600" />
            <span>{viewMode === 'map' ? 'Xem Bảng Dữ Liệu' : 'Bản Đồ Số GIS'}</span>
          </button>
        </div>
      </div>

      {/* Main Layout: GIS Map or 2 Tabs Content */}
      {viewMode === 'map' ? (
        <FarmPlotMapView
          units={units}
          selectedUnit={selectedUnit}
          plots={plots}
          onSelectUnit={(u) => setSelectedUnitId(u ? u.id : 'ALL')}
          onSelectPlot={(p) => setSelectedPlotForDrawer(p)}
          selectedPlotId={selectedPlotForDrawer?.id}
          onPlotUpdated={() => {
            queryClient.invalidateQueries({ queryKey: ['farmPlots'] });
          }}
        />
      ) : activeTab === 'units' ? (
        <ProductionUnitsTable
          units={units}
          isLoading={loadingUnits}
          onOpenCreateModal={() => {
            setEditingUnit(null);
            setUnitModalOpen(true);
          }}
          onOpenEditModal={(u) => {
            setEditingUnit(u);
            setUnitModalOpen(true);
          }}
          onViewPlotsOfUnit={(u) => {
            setSelectedUnitId(u.id);
            setActiveTab('plots');
          }}
          onOpenMapView={(u) => {
            setSelectedUnitId(u.id);
            setViewMode('map');
          }}
        />
      ) : (
        <div className="space-y-4">
          <CompactUnitSelectorBar
            units={units}
            selectedUnitId={selectedUnitId}
            onSelectUnitId={(id) => setSelectedUnitId(id)}
            onOpenCreateUnitModal={() => {
              setEditingUnit(null);
              setUnitModalOpen(true);
            }}
            onOpenEditUnitModal={(u) => {
              setEditingUnit(u);
              setUnitModalOpen(true);
            }}
            onOpenAddPlotModal={() => setAddPlotModalOpen(true)}
            onToggleMapView={() => setViewMode('map')}
            isMapView={false}
          />

          <FarmPlotsFullTable
            units={units}
            selectedUnit={selectedUnit}
            plots={plots}
            plotsLoading={loadingPlots}
            selectedPlotId={selectedPlotForDrawer?.id}
            onSelectPlot={(p) => setSelectedPlotForDrawer(p)}
            onOpenEditUnitModal={(u) => {
              setEditingUnit(u);
              setUnitModalOpen(true);
            }}
            onOpenAddPlotModal={() => setAddPlotModalOpen(true)}
            onEditPlot={(p) => {
              setSelectedPlotForDrawer(null);
              setEditingPlot(p);
            }}
            onOpenAssignments={(p) => {
              setSelectedPlotForDrawer(null);
              openAssignmentsModal(p);
            }}
            onDeletePlot={(p) => {
              setSelectedPlotForDrawer(null);
              setPlotToDelete(p);
            }}
            onSwitchToMap={() => setViewMode('map')}
            isAllUnitsMode={selectedUnitId === 'ALL'}
          />
        </div>
      )}

      {/* Farm Plot Modals & Drawer */}
      <FarmPlotModals
        units={units}
        selectedUnit={selectedUnit}
        unitModalOpen={unitModalOpen}
        editingUnit={editingUnit}
        onCloseUnitModal={() => {
          setUnitModalOpen(false);
          setEditingUnit(null);
        }}
        onSaveUnit={async (payload, id) => {
          await saveUnitMutation.mutateAsync({ payload, id });
        }}
        isSavingUnit={saveUnitMutation.isPending}
        addPlotModalOpen={addPlotModalOpen}
        onCloseAddPlotModal={() => setAddPlotModalOpen(false)}
        onAddPlot={async (plotData) => {
          await addPlotMutation.mutateAsync(plotData);
        }}
        isAddingPlot={addPlotMutation.isPending}
        editingPlot={editingPlot}
        onCloseEditPlot={() => setEditingPlot(null)}
        onPlotEdited={() => {
          queryClient.invalidateQueries({ queryKey: ['farmPlots'] });
        }}
        selectedPlotForAssignments={selectedPlotForAssignments}
        members={members}
        assignments={assignments}
        assignmentsLoading={assignmentsLoading}
        onCloseAssignments={() => setSelectedPlotForAssignments(null)}
        onAssignMember={handleAssignMember}
        plotToDelete={plotToDelete}
        onCloseDeletePlot={() => setPlotToDelete(null)}
        onConfirmDeletePlot={async () => {
          await deletePlotMutation.mutateAsync();
        }}
        isDeletingPlot={deletePlotMutation.isPending}
        selectedPlotForDrawer={selectedPlotForDrawer}
        onCloseDrawer={() => setSelectedPlotForDrawer(null)}
        onEditFromDrawer={(p) => {
          setSelectedPlotForDrawer(null);
          setEditingPlot(p);
        }}
        onAssignFromDrawer={(p) => {
          setSelectedPlotForDrawer(null);
          openAssignmentsModal(p);
        }}
      />

      <PrintPucMapModal
        isOpen={isPrintPucModalOpen}
        onClose={() => setIsPrintPucModalOpen(false)}
        productionUnit={selectedUnit}
        plots={plots}
      />
    </div>
  );
};

export default FarmPlotsPage;
