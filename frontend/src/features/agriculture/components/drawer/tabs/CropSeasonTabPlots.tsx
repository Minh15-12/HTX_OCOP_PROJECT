import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  CropSeason,
  CropSeasonPlotAllocation,
  fetchSeasonPlots,
  removeSeasonPlot,
} from '@/services/cropSeasonApi';
import { fetchPlotsByUnit, FarmPlot } from '@/services/farmPlotApi';
import {
  MapPin,
  ShieldAlert,
  AlertCircle,
  Plus,
  User,
  Calendar,
  Trash2,
  TrendingUp,
  CheckCircle2,
  CheckSquare,
} from 'lucide-react';
import { AllocatePlotModal } from '../../modal/AllocatePlotModal';
import { BulkAllocatePlotsModal } from '../../modal/BulkAllocatePlotsModal';
import { useToast } from '@/components/ui/ToastNotification';

interface CropSeasonTabPlotsProps {
  season: CropSeason;
}

const statusBadge: Record<string, { label: string; cls: string }> = {
  PLANNED: { label: 'Lên kế hoạch', cls: 'bg-slate-100 text-slate-700 border-slate-200' },
  PLANTED: { label: 'Đã xuống giống 🌱', cls: 'bg-emerald-50 text-emerald-800 border-emerald-200' },
  GROWING: { label: 'Đang nuôi trái 🌿', cls: 'bg-amber-50 text-amber-800 border-amber-200' },
  HARVESTING: { label: 'Đang thu hoạch 🍇', cls: 'bg-blue-50 text-blue-800 border-blue-200 font-bold animate-pulse' },
  COMPLETED: { label: 'Đã hoàn tất vụ', cls: 'bg-slate-100 text-slate-600 border-slate-200' },
  CANCELLED: { label: 'Hủy canh tác', cls: 'bg-rose-50 text-rose-700 border-rose-200' },
};

export const CropSeasonTabPlots: React.FC<CropSeasonTabPlotsProps> = ({ season }) => {
  const queryClient = useQueryClient();
  const { showToast } = useToast();
  const [isAllocateModalOpen, setIsAllocateModalOpen] = useState(false);
  const [isBulkModalOpen, setIsBulkModalOpen] = useState(false);

  // 1. Lấy danh sách thửa đất đã phân bổ cho mùa vụ này
  const {
    data: allocatedPlots = [],
    isLoading: loadingAllocated,
    refetch,
  } = useQuery<CropSeasonPlotAllocation[]>({
    queryKey: ['seasonPlots', season.id],
    queryFn: () => fetchSeasonPlots(season.id),
    enabled: !!season.id,
  });

  // 2. Lấy danh sách toàn bộ thửa đất của vùng sản xuất (để chọn khi phân bổ mới)
  const { data: unitPlots = [] } = useQuery<FarmPlot[]>({
    queryKey: ['farmPlots', season.production_unit_id],
    queryFn: () => (season.production_unit_id ? fetchPlotsByUnit(season.production_unit_id) : Promise.resolve([])),
    enabled: !!season.production_unit_id,
  });

  // Xóa phân bổ thửa đất
  const deleteMutation = useMutation({
    mutationFn: (plotId: string) => removeSeasonPlot(season.id, plotId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['seasonPlots', season.id] });
      queryClient.invalidateQueries({ queryKey: ['seasonSupplyDemand', season.id] });
      showToast('Đã hủy phân bổ thửa đất khỏi mùa vụ');
      refetch();
    },
    onError: (err: any) => {
      showToast(err?.message || 'Có lỗi khi hủy phân bổ', 'error');
    },
  });

  const handleDelete = (plotId: string, plotCode?: string) => {
    if (window.confirm(`Bạn có chắc chắn muốn hủy phân bổ thửa đất [${plotCode || plotId}] khỏi mùa vụ này?`)) {
      deleteMutation.mutate(plotId);
    }
  };

  // Tính toán số liệu tổng hợp
  const totalAllocatedArea = allocatedPlots.reduce((sum, p) => sum + (Number(p.allocated_area) || 0), 0);
  const totalTargetYield = allocatedPlots.reduce((sum, p) => sum + (Number(p.target_yield_kg) || 0), 0);
  const totalActualYield = allocatedPlots.reduce((sum, p) => sum + (Number(p.actual_harvested_kg) || 0), 0);
  const progressPercent = totalTargetYield > 0 ? Math.min(100, Math.round((totalActualYield / totalTargetYield) * 100)) : 0;

  return (
    <div className="space-y-4">
      {/* 1. Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="p-3.5 rounded-2xl bg-emerald-50 border border-emerald-200">
          <span className="text-[11px] font-bold text-emerald-800">Quy mô Thửa đất Tham gia</span>
          <div className="text-xl font-black font-mono text-emerald-950 mt-0.5">
            {allocatedPlots.length} thửa &bull; {(totalAllocatedArea / 10000).toFixed(2)} ha
          </div>
          <span className="text-[10.5px] text-emerald-700 mt-0.5 block">
            {totalAllocatedArea.toLocaleString()} m² canh tác
          </span>
        </div>

        <div className="p-3.5 rounded-2xl bg-blue-50 border border-blue-200">
          <span className="text-[11px] font-bold text-blue-800">Cam kết Sản lượng Xã viên</span>
          <div className="text-xl font-black font-mono text-blue-950 mt-0.5">
            {totalTargetYield.toLocaleString()} kg
          </div>
          <span className="text-[10.5px] text-blue-700 mt-0.5 block">
            Định mức ~ 4.5 kg/m²
          </span>
        </div>

        <div className="p-3.5 rounded-2xl bg-slate-100 border border-slate-200">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-700">Tiến độ Thu hoạch</span>
            <span className="text-xs font-bold font-mono text-slate-800">{progressPercent}%</span>
          </div>
          <div className="text-xl font-black font-mono text-slate-900 mt-0.5">
            {totalActualYield.toLocaleString()} kg
          </div>
          <div className="w-full bg-slate-200 rounded-full h-1.5 mt-1.5 overflow-hidden">
            <div
              className="bg-emerald-600 h-1.5 rounded-full transition-all duration-500"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>
      </div>

      {/* 2. Plot List Header with Action Button */}
      <div className="bg-white rounded-2xl border border-slate-200/90 shadow-2xs p-5 space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div>
            <h3 className="text-xs font-black uppercase tracking-wider text-slate-800">
              Danh sách thửa đất phân bổ &amp; Lịch rải vụ
            </h3>
            <p className="text-[11px] text-slate-400 mt-0.5">
              Phân bổ hạn mức diện tích và cam kết bao tiêu của từng xã viên (Luật HTX 2023).
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setIsBulkModalOpen(true)}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-teal-50 hover:bg-teal-100 text-teal-800 border border-teal-200 text-xs font-bold shadow-2xs transition cursor-pointer"
            >
              <CheckSquare className="w-3.5 h-3.5 text-teal-700" />
              <span>Phân bổ hàng loạt</span>
            </button>

            <button
              type="button"
              onClick={() => setIsAllocateModalOpen(true)}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold shadow-2xs transition cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Thêm đơn lẻ</span>
            </button>
          </div>
        </div>

        {loadingAllocated ? (
          <div className="py-8 text-center text-xs text-slate-400">
            Đang tải dữ liệu thửa đất phân bổ...
          </div>
        ) : allocatedPlots.length === 0 ? (
          <div className="py-10 text-center text-slate-400 text-xs">
            <AlertCircle className="w-8 h-8 mx-auto mb-2 text-slate-300" />
            <p className="font-bold text-slate-600 text-sm">Chưa có thửa đất nào được phân bổ cho mùa vụ này</p>
            <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
              Hãy chọn &quot;Phân bổ hàng loạt&quot; để tick chọn nhanh nhiều thửa đất trong vùng, hoặc thêm từng thửa lẻ.
            </p>
            <div className="mt-3.5 flex items-center justify-center gap-2">
              <button
                type="button"
                onClick={() => setIsBulkModalOpen(true)}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-700 text-white hover:bg-emerald-800 text-xs font-bold shadow-sm transition cursor-pointer"
              >
                <CheckSquare className="w-4 h-4" />
                Phân bổ hàng loạt nhanh
              </button>
              <button
                type="button"
                onClick={() => setIsAllocateModalOpen(true)}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-100 text-slate-700 hover:bg-slate-200 text-xs font-bold transition cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                Thêm đơn lẻ
              </button>
            </div>
          </div>
        ) : (
          <div className="space-y-3">
            {allocatedPlots.map((item, idx) => {
              const isQuarantine = item.plot_status === 'IN_QUARANTINE';
              const badge = statusBadge[item.status] || { label: item.status, cls: 'bg-slate-100 text-slate-700' };
              const itemProgress = item.target_yield_kg > 0 ? Math.min(100, Math.round((item.actual_harvested_kg / item.target_yield_kg) * 100)) : 0;

              return (
                <div
                  key={item.id}
                  className={`p-4 rounded-2xl border transition-all ${
                    isQuarantine
                      ? 'border-rose-300 bg-rose-50/50'
                      : 'border-slate-200 bg-slate-50/50 hover:bg-white hover:shadow-xs'
                  }`}
                >
                  {/* Row 1: Thửa code, giống, status badge */}
                  <div className="flex flex-wrap items-center justify-between gap-2 pb-2.5 border-b border-slate-200/70">
                    <div className="flex items-center gap-2.5">
                      <div
                        className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 ${
                          isQuarantine ? 'bg-rose-100 text-rose-700' : 'bg-emerald-100 text-emerald-700'
                        }`}
                      >
                        {isQuarantine ? <ShieldAlert className="w-4 h-4" /> : <MapPin className="w-4 h-4" />}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-xs font-bold text-slate-900">
                            {item.plot_code || item.plot_id}
                          </span>
                          <span className={`px-2 py-0.5 rounded-md text-[10.5px] border font-bold ${badge.cls}`}>
                            {badge.label}
                          </span>
                          {isQuarantine && (
                            <span className="px-2 py-0.5 rounded-md text-[10px] bg-rose-100 text-rose-800 font-bold border border-rose-300">
                              Cách ly PHI
                            </span>
                          )}
                        </div>
                        <span className="text-[11px] text-emerald-800 font-bold">
                          {item.crop_variety || season.crop}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className="text-[11px] font-mono font-bold text-slate-600 bg-white px-2.5 py-1 rounded-lg border border-slate-200 shadow-2xs">
                        Đợt rải vụ #{idx + 1}
                      </span>
                      <button
                        type="button"
                        onClick={() => handleDelete(item.plot_id, item.plot_code)}
                        className="w-7 h-7 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 flex items-center justify-center transition cursor-pointer"
                        title="Hủy phân bổ thửa đất"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  {/* Row 2: Xã viên, Lịch rải vụ & Sản lượng */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-3 text-xs">
                    {/* Xã viên phụ trách */}
                    <div>
                      <span className="text-[11px] text-slate-400 block mb-0.5">Xã viên nhận khoán</span>
                      <div className="flex items-center gap-1.5 font-bold text-slate-800">
                        <User className="w-3.5 h-3.5 text-slate-400" />
                        <span>{item.member_name || 'Chưa gán xã viên'}</span>
                      </div>
                      {item.member_phone && (
                        <span className="text-[11px] text-slate-500 font-mono ml-5">
                          SĐT: {item.member_phone}
                        </span>
                      )}
                    </div>

                    {/* Lịch xuống giống */}
                    <div>
                      <span className="text-[11px] text-slate-400 block mb-0.5">Lịch trình canh tác</span>
                      <div className="flex items-center gap-1.5 text-slate-700 font-semibold">
                        <Calendar className="w-3.5 h-3.5 text-emerald-600" />
                        <span>Xuống giống: {item.planting_date?.slice(0, 10)}</span>
                      </div>
                      <span className="text-[11px] text-slate-500 font-mono ml-5">
                        Thu bói: {item.expected_harvest_start?.slice(0, 10)}
                      </span>
                    </div>

                    {/* Sản lượng cam kết */}
                    <div>
                      <div className="flex items-center justify-between text-[11px] text-slate-400 mb-0.5">
                        <span>Cam kết: {Number(item.target_yield_kg || 0).toLocaleString()} kg</span>
                        <span className="font-bold text-slate-700">{itemProgress}%</span>
                      </div>
                      <div className="w-full bg-slate-200 rounded-full h-2 overflow-hidden">
                        <div
                          className="bg-emerald-600 h-2 rounded-full transition-all"
                          style={{ width: `${itemProgress}%` }}
                        />
                      </div>
                      <span className="text-[11px] font-bold text-emerald-800 mt-1 block">
                        Đã thu: {Number(item.actual_harvested_kg || 0).toLocaleString()} kg
                      </span>
                    </div>
                  </div>

                  {item.notes && (
                    <div className="mt-2.5 pt-2 border-t border-slate-200/50 text-[11.5px] text-slate-500 italic">
                      Ghi chú: {item.notes}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Modal Allocate */}
      <AllocatePlotModal
        isOpen={isAllocateModalOpen}
        onClose={() => setIsAllocateModalOpen(false)}
        season={season}
        plots={unitPlots}
        onSuccess={() => {
          refetch();
          queryClient.invalidateQueries({ queryKey: ['seasonPlots', season.id] });
          queryClient.invalidateQueries({ queryKey: ['seasonSupplyDemand', season.id] });
        }}
      />

      {/* Modal Bulk Allocate */}
      <BulkAllocatePlotsModal
        isOpen={isBulkModalOpen}
        onClose={() => setIsBulkModalOpen(false)}
        season={season}
        plots={unitPlots}
        alreadyAllocatedPlotIds={allocatedPlots.map((p) => p.plot_id)}
        onSuccess={() => {
          refetch();
          queryClient.invalidateQueries({ queryKey: ['seasonPlots', season.id] });
          queryClient.invalidateQueries({ queryKey: ['seasonSupplyDemand', season.id] });
        }}
      />
    </div>
  );
};

