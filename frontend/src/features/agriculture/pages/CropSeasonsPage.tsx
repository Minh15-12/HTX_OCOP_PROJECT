import React, { useState } from 'react';
import { CalendarDays, ChevronRight, Plus, Sprout } from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useTenantContextStore } from '@/stores/tenantContextStore';
import { useToast } from '@/components/ui/ToastNotification';
import {
  fetchCropSeasons,
  createCropSeason,
  updateCropSeason,
  closeCropSeason,
  CropSeason,
  CropSeasonFormData,
  CropSeasonBomItem,
  fetchSeasonBoms,
} from '@/services/cropSeasonApi';
import { fetchCrops, createCrop, updateCrop, deleteCrop } from '@/services/cropApi';
import { fetchProductionUnits, ProductionUnit } from '@/services/farmPlotApi';
import type { CropItem } from '@/types/agriculture';

import { CropSeasonsStats } from '../components/CropSeasonsStats';
import { CropSeasonsTable } from '../components/CropSeasonsTable';
import { CropSeasonModal } from '../components/CropSeasonModal';
import { CloseSeasonModal } from '../components/CloseSeasonModal';
import { CropSeasonDrawer } from '../components/drawer/CropSeasonDrawer';
import { PrintSeasonPlanModal } from '../components/PrintSeasonPlanModal';
import { CropsTab } from '../components/CropsTab';
import { CropModal } from '../components/CropModal';
import { CropSeasonGanttChart } from '../components/timeline/CropSeasonGanttChart';
import { ListFilter, BarChart3, List } from 'lucide-react';

export const CropSeasonsPage: React.FC = () => {
  const queryClient = useQueryClient();
  const { showToast } = useToast();
  const { activeCooperative } = useTenantContextStore();

  // Navigation tab
  const [activeTab, setActiveTab] = useState<'SEASONS' | 'CROPS'>('SEASONS');
  const [viewMode, setViewMode] = useState<'TABLE' | 'GANTT'>('TABLE');

  // Modals & Drawer state for Seasons
  const [modalOpen, setModalOpen] = useState(false);
  const [editingSeason, setEditingSeason] = useState<CropSeason | null>(null);
  const [closeTarget, setCloseTarget] = useState<CropSeason | null>(null);
  const [selectedSeason, setSelectedSeason] = useState<CropSeason | null>(null);
  const [printingSeason, setPrintingSeason] = useState<CropSeason | null>(null);

  // Modals state for Crops
  const [isCropModalOpen, setIsCropModalOpen] = useState(false);
  const [cropToEdit, setCropToEdit] = useState<CropItem | null>(null);

  // Queries
  const {
    data: seasons = [],
    isLoading: loadingSeasons,
  } = useQuery<CropSeason[]>({
    queryKey: ['cropSeasons'],
    queryFn: () => fetchCropSeasons({ per_page: 50 }),
  });

  const { data: units = [] } = useQuery<ProductionUnit[]>({
    queryKey: ['productionUnits'],
    queryFn: () => fetchProductionUnits({ per_page: 50 }),
  });

  const {
    data: crops = [],
    isLoading: loadingCrops,
  } = useQuery<CropItem[]>({
    queryKey: ['crops'],
    queryFn: () => fetchCrops(),
  });

  const { data: printingBoms = [] } = useQuery<CropSeasonBomItem[]>({
    queryKey: ['seasonBoms', printingSeason?.id],
    queryFn: () => (printingSeason?.id ? fetchSeasonBoms(printingSeason.id) : Promise.resolve([])),
    enabled: !!printingSeason?.id,
  });

  // Season Mutations
  const saveSeasonMutation = useMutation({
    mutationFn: async ({ formData, id }: { formData: CropSeasonFormData; id?: string }) => {
      if (id) return updateCropSeason(id, formData);
      return createCropSeason(formData);
    },
    onSuccess: (saved, variables) => {
      queryClient.invalidateQueries({ queryKey: ['cropSeasons'] });
      setModalOpen(false);
      setEditingSeason(null);
      showToast(
        variables.id
          ? `Đã cập nhật mùa vụ [${variables.formData.name}]!`
          : `Đã khởi tạo mùa vụ [${variables.formData.name}] thành công!`
      );
    },
    onError: (err: any) => {
      showToast(err?.message || 'Có lỗi khi lưu thông tin mùa vụ', 'error');
    },
  });

  const closeSeasonMutation = useMutation({
    mutationFn: async (seasonId: string) => {
      return closeCropSeason(seasonId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cropSeasons'] });
      setCloseTarget(null);
      showToast('Đã đóng và kết thúc mùa vụ thành công! (BR-FARM-002)');
    },
    onError: (err: any) => {
      showToast(err?.message || 'Có lỗi khi đóng mùa vụ', 'error');
    },
  });

  // Crop Mutations
  const saveCropMutation = useMutation({
    mutationFn: async ({ payload, id }: { payload: Omit<CropItem, 'id'>; id?: string }) => {
      if (id) return updateCrop(id, payload);
      return createCrop(payload);
    },
    onSuccess: (_, vars) => {
      queryClient.invalidateQueries({ queryKey: ['crops'] });
      setIsCropModalOpen(false);
      setCropToEdit(null);
      showToast(vars.id ? 'Đã cập nhật giống cây thành công!' : 'Đã thêm giống cây trồng mới!');
    },
    onError: (err: any) => {
      showToast(err?.message || 'Lưu giống cây thất bại', 'error');
    },
  });

  const deleteCropMutation = useMutation({
    mutationFn: async (id: string) => {
      return deleteCrop(id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['crops'] });
      showToast('Đã xóa giống cây thành công!');
    },
    onError: (err: any) => {
      showToast(err?.message || 'Xóa giống cây thất bại', 'error');
    },
  });

  return (
    <div className="min-h-full space-y-4 pb-12 text-[13px] text-slate-700 animate-fade-in">
      {/* Page Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between bg-white p-4.5 rounded-2xl border border-slate-200 shadow-xs">
        <div className="flex items-center gap-3.5">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-emerald-100 text-emerald-700 shadow-2xs">
            <CalendarDays className="h-6 w-6" strokeWidth={2.2} />
          </div>
          <div>
            <div className="flex items-center gap-2 text-[11px] font-semibold text-slate-400">
              <span className="font-bold text-slate-700">
                {activeCooperative?.legal_name || 'Hợp tác xã'}
              </span>
              <ChevronRight className="h-3 w-3 text-slate-300" />
              <span className="text-emerald-700 font-bold">Kế hoạch sản xuất</span>
            </div>
            <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight mt-0.5">
              Quản trị Mùa vụ & Giống Cây Trồng
            </h1>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {activeTab === 'SEASONS' ? (
            <button
              type="button"
              onClick={() => {
                setEditingSeason(null);
                setModalOpen(true);
              }}
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-700 px-4 py-2.5 text-xs font-bold text-white shadow-xs transition hover:bg-emerald-800 active:scale-98 cursor-pointer shrink-0"
            >
              <Plus className="h-4 w-4" />
              Khai báo mùa vụ mới
            </button>
          ) : (
            <button
              type="button"
              onClick={() => {
                setCropToEdit(null);
                setIsCropModalOpen(true);
              }}
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-700 px-4 py-2.5 text-xs font-bold text-white shadow-xs transition hover:bg-emerald-800 active:scale-98 cursor-pointer shrink-0"
            >
              <Plus className="h-4 w-4" />
              Thêm giống cây trồng
            </button>
          )}
        </div>
      </div>

      {/* Tabs navigation */}
      <div className="flex flex-wrap items-center justify-between border-b border-slate-200 gap-2 mb-1">
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setActiveTab('SEASONS')}
            className={`flex items-center gap-2 py-2.5 px-4 font-bold text-xs border-b-2 -mb-px transition-all cursor-pointer ${
              activeTab === 'SEASONS'
                ? 'border-emerald-700 text-emerald-800 bg-white rounded-t-xl shadow-2xs'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <CalendarDays className="w-4 h-4" />
            <span>Kế Hoạch Mùa Vụ ({seasons.length})</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('CROPS')}
            className={`flex items-center gap-2 py-2.5 px-4 font-bold text-xs border-b-2 -mb-px transition-all cursor-pointer ${
              activeTab === 'CROPS'
                ? 'border-emerald-700 text-emerald-800 bg-white rounded-t-xl shadow-2xs'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Sprout className="w-4 h-4" />
            <span>Danh Mục Giống Cây Trồng ({crops.length})</span>
          </button>
        </div>

        {/* View Mode Switcher on SEASONS */}
        {activeTab === 'SEASONS' && (
          <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-xl border border-slate-200 mb-1">
            <button
              type="button"
              onClick={() => setViewMode('TABLE')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer ${
                viewMode === 'TABLE'
                  ? 'bg-emerald-700 text-white shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <List className="w-3.5 h-3.5" />
              <span>Bảng danh sách</span>
            </button>
            <button
              type="button"
              onClick={() => setViewMode('GANTT')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer ${
                viewMode === 'GANTT'
                  ? 'bg-emerald-700 text-white shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <BarChart3 className="w-3.5 h-3.5" />
              <span>Tiến độ Gantt</span>
            </button>
          </div>
        )}
      </div>

      {/* TAB 1: SEASONS */}
      {activeTab === 'SEASONS' && (
        <div className="space-y-4 pt-1">
          {viewMode === 'TABLE' ? (
            <>
              <CropSeasonsStats seasons={seasons} />

              <CropSeasonsTable
                seasons={seasons}
                units={units}
                isLoading={loadingSeasons}
                onSelectRow={(s) => setSelectedSeason(s)}
                selectedId={selectedSeason?.id}
                onEditSeason={(s) => {
                  setSelectedSeason(null);
                  setEditingSeason(s);
                  setModalOpen(true);
                }}
                onCloseSeason={(s) => {
                  setSelectedSeason(null);
                  setCloseTarget(s);
                }}
                onPrintSeason={(s) => setPrintingSeason(s)}
                onOpenCreateModal={() => {
                  setSelectedSeason(null);
                  setEditingSeason(null);
                  setModalOpen(true);
                }}
              />
            </>
          ) : (
            <CropSeasonGanttChart
              seasons={seasons}
              onSelectSeason={(s) => setSelectedSeason(s)}
            />
          )}
        </div>
      )}

      {/* TAB 2: CROPS */}
      {activeTab === 'CROPS' && (
        <CropsTab
          crops={crops}
          isLoading={loadingCrops}
          onEditCrop={(crop) => {
            setCropToEdit(crop);
            setIsCropModalOpen(true);
          }}
          onDeleteCrop={(id) => deleteCropMutation.mutate(id)}
          onOpenCreateModal={() => {
            setCropToEdit(null);
            setIsCropModalOpen(true);
          }}
        />
      )}

      {/* Season Drawer & Modals */}
      <CropSeasonDrawer
        season={selectedSeason}
        isOpen={!!selectedSeason}
        onClose={() => setSelectedSeason(null)}
        onEdit={(s) => {
          setSelectedSeason(null);
          setEditingSeason(s);
          setModalOpen(true);
        }}
        onCloseSeason={(s) => {
          setSelectedSeason(null);
          setCloseTarget(s);
        }}
      />

      <CropSeasonModal
        isOpen={modalOpen}
        seasonToEdit={editingSeason}
        units={units}
        onClose={() => {
          setModalOpen(false);
          setEditingSeason(null);
        }}
        onSubmit={async (formData, id) => {
          await saveSeasonMutation.mutateAsync({ formData, id });
        }}
        isSubmitting={saveSeasonMutation.isPending}
      />

      <CloseSeasonModal
        season={closeTarget}
        onClose={() => setCloseTarget(null)}
        onConfirm={async () => {
          if (closeTarget) {
            await closeSeasonMutation.mutateAsync(closeTarget.id);
          }
        }}
        isSubmitting={closeSeasonMutation.isPending}
      />

      {/* Crop Modal */}
      <CropModal
        isOpen={isCropModalOpen}
        cropToEdit={cropToEdit}
        onClose={() => {
          setIsCropModalOpen(false);
          setCropToEdit(null);
        }}
        onSubmit={async (payload, id) => {
          await saveCropMutation.mutateAsync({ payload, id });
        }}
        isSubmitting={saveCropMutation.isPending}
      />

      {/* Print Season Plan & BOM Modal */}
      {printingSeason && (
        <PrintSeasonPlanModal
          isOpen={!!printingSeason}
          onClose={() => setPrintingSeason(null)}
          season={printingSeason}
          boms={printingBoms}
        />
      )}
    </div>
  );
};
