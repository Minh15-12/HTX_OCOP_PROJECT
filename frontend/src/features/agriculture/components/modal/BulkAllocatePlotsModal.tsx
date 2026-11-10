import React, { useState, useEffect, useMemo } from 'react';
import {
  X,
  CheckSquare,
  Square,
  MapPin,
  Calendar,
  Sprout,
  Users,
  Search,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  TrendingUp,
} from 'lucide-react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { CropSeason, bulkAllocateSeasonPlots } from '@/services/cropSeasonApi';
import { FarmPlot } from '@/services/farmPlotApi';
import { useToast } from '@/components/ui/ToastNotification';

interface BulkAllocatePlotsModalProps {
  isOpen: boolean;
  onClose: () => void;
  season: CropSeason;
  plots: FarmPlot[];
  alreadyAllocatedPlotIds: string[];
  onSuccess: () => void;
}

export const BulkAllocatePlotsModal: React.FC<BulkAllocatePlotsModalProps> = ({
  isOpen,
  onClose,
  season,
  plots,
  alreadyAllocatedPlotIds,
  onSuccess,
}) => {
  const { showToast } = useToast();
  const queryClient = useQueryClient();

  const [search, setSearch] = useState('');
  const [selectedPlotIds, setSelectedPlotIds] = useState<string[]>([]);
  const [plantingDate, setPlantingDate] = useState('');
  const [expectedHarvestStart, setExpectedHarvestStart] = useState('');
  const [expectedHarvestEnd, setExpectedHarvestEnd] = useState('');
  const [cropVariety, setCropVariety] = useState('');
  const [notes, setNotes] = useState('Phân bổ rải vụ theo kế hoạch vùng sản xuất');

  // Lọc danh sách các thửa đất chưa được phân bổ
  const availablePlots = useMemo(() => {
    return plots.filter((p) => !alreadyAllocatedPlotIds.includes(p.id));
  }, [plots, alreadyAllocatedPlotIds]);

  const filteredPlots = useMemo(() => {
    const q = search.toLowerCase().trim();
    if (!q) return availablePlots;
    return availablePlots.filter(
      (p) =>
        p.plot_code.toLowerCase().includes(q) ||
        (p.land_relation?.member_name && p.land_relation.member_name.toLowerCase().includes(q))
    );
  }, [availablePlots, search]);

  useEffect(() => {
    if (isOpen) {
      const defaultStart = season.start_date ? season.start_date.slice(0, 10) : new Date().toISOString().slice(0, 10);
      const harvestStart = new Date(defaultStart);
      harvestStart.setDate(harvestStart.getDate() + 75);
      const defaultHarvestStart = harvestStart.toISOString().slice(0, 10);
      const defaultHarvestEnd = season.expected_end_date ? season.expected_end_date.slice(0, 10) : defaultHarvestStart;

      setPlantingDate(defaultStart);
      setExpectedHarvestStart(defaultHarvestStart);
      setExpectedHarvestEnd(defaultHarvestEnd);
      setCropVariety(season.crop || 'Giống chuẩn VietGAP');
      setNotes('Phân bổ rải vụ tập trung theo vùng PUC');
      setSelectedPlotIds([]);
      setSearch('');
    }
  }, [isOpen, season]);

  // Đổi ngày xuống giống -> tự tính ngày thu hoạch
  const handlePlantingDateChange = (newDate: string) => {
    setPlantingDate(newDate);
    if (newDate) {
      const d = new Date(newDate);
      d.setDate(d.getDate() + 75);
      setExpectedHarvestStart(d.toISOString().slice(0, 10));
    }
  };

  // Chọn / bỏ chọn 1 thửa
  const togglePlot = (plotId: string) => {
    setSelectedPlotIds((prev) =>
      prev.includes(plotId) ? prev.filter((id) => id !== plotId) : [...prev, plotId]
    );
  };

  // Chọn tất cả
  const selectAll = () => {
    setSelectedPlotIds(filteredPlots.map((p) => p.id));
  };

  // Bỏ chọn tất cả
  const deselectAll = () => {
    setSelectedPlotIds([]);
  };

  // Tính tổng diện tích & sản lượng của các thửa đã tick
  const selectedStats = useMemo(() => {
    const chosen = availablePlots.filter((p) => selectedPlotIds.includes(p.id));
    const totalAreaM2 = chosen.reduce((sum, p) => {
      const a = Number(p.area) || 0;
      return sum + (a < 100 ? a * 10000 : a);
    }, 0);
    const totalYieldKg = Math.round(totalAreaM2 * 4.5);
    return {
      count: chosen.length,
      totalAreaM2,
      totalAreaHa: (totalAreaM2 / 10000).toFixed(2),
      totalYieldKg,
      totalYieldTons: (totalYieldKg / 1000).toFixed(2),
    };
  }, [availablePlots, selectedPlotIds]);

  const bulkMutation = useMutation({
    mutationFn: async () => {
      return bulkAllocateSeasonPlots(season.id, {
        plot_ids: selectedPlotIds,
        planting_date: plantingDate,
        expected_harvest_start: expectedHarvestStart,
        expected_harvest_end: expectedHarvestEnd,
        crop_variety: cropVariety,
        status: 'PLANNED',
        notes: notes.trim() || undefined,
      });
    },
    onSuccess: (res) => {
      queryClient.invalidateQueries({ queryKey: ['seasonPlots', season.id] });
      queryClient.invalidateQueries({ queryKey: ['seasonSupplyDemand', season.id] });
      showToast(`Đã phân bổ thành công ${res.length} thửa đất vào mùa vụ!`);
      onSuccess();
      onClose();
    },
    onError: (err: any) => {
      showToast(err?.message || 'Có lỗi khi phân bổ hàng loạt thửa đất', 'error');
    },
  });

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 p-4 backdrop-blur-xs animate-fade-in text-[13px]"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="w-full max-w-2xl overflow-hidden rounded-3xl border border-white/60 bg-white shadow-2xl flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="flex items-start justify-between border-b border-slate-100 bg-gradient-to-r from-emerald-50 via-teal-50 to-white px-6 py-4.5 shrink-0">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-emerald-600 text-white shadow-md">
              <CheckSquare className="h-6 w-6" />
            </div>
            <div>
              <p className="text-[10.5px] font-bold uppercase tracking-widest text-emerald-700">
                Kế hoạch sản xuất &bull; Vùng {season.unit_code || 'PUC'}
              </p>
              <h3 className="mt-0.5 text-lg font-black text-slate-900">
                Phân bổ Thửa đất Hàng loạt vào Mùa vụ
              </h3>
              <p className="text-xs text-slate-500">
                Mùa vụ: <span className="font-bold text-slate-800">{season.name}</span> ({season.crop})
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="flex h-9 w-9 items-center justify-center rounded-xl bg-white text-slate-400 shadow-sm transition hover:text-slate-700 cursor-pointer"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 overflow-y-auto flex-1 space-y-4 text-xs">
          {/* 1. Common Parameters */}
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-3">
            <div className="font-bold text-slate-800 flex items-center gap-2 text-xs">
              <Calendar className="w-4 h-4 text-emerald-600" />
              <span>Thiết lập Lịch mùa vụ chung cho các thửa được chọn</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block font-semibold text-slate-600 mb-1">Ngày xuống giống *</label>
                <input
                  type="date"
                  value={plantingDate}
                  onChange={(e) => handlePlantingDateChange(e.target.value)}
                  className="w-full px-3 py-1.5 bg-white border border-slate-300 rounded-xl font-medium text-slate-800 text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  required
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-600 mb-1">Bắt đầu thu hoạch *</label>
                <input
                  type="date"
                  value={expectedHarvestStart}
                  onChange={(e) => setExpectedHarvestStart(e.target.value)}
                  className="w-full px-3 py-1.5 bg-white border border-slate-300 rounded-xl font-medium text-slate-800 text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  required
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-600 mb-1">Kết thúc thu hoạch *</label>
                <input
                  type="date"
                  value={expectedHarvestEnd}
                  onChange={(e) => setExpectedHarvestEnd(e.target.value)}
                  className="w-full px-3 py-1.5 bg-white border border-slate-300 rounded-xl font-medium text-slate-800 text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block font-semibold text-slate-600 mb-1">Chủng loại giống cây</label>
                <input
                  type="text"
                  value={cropVariety}
                  onChange={(e) => setCropVariety(e.target.value)}
                  placeholder="VD: Sweet Palermo Đỏ F1"
                  className="w-full px-3 py-1.5 bg-white border border-slate-300 rounded-xl font-medium text-slate-800 text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                />
              </div>
              <div>
                <label className="block font-semibold text-slate-600 mb-1">Ghi chú phân bổ</label>
                <input
                  type="text"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Ghi chú phân bổ rải vụ..."
                  className="w-full px-3 py-1.5 bg-white border border-slate-300 rounded-xl font-medium text-slate-800 text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                />
              </div>
            </div>
          </div>

          {/* 2. Select Plots Table */}
          <div className="space-y-2.5">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <span className="font-bold text-slate-800">
                  Chọn Thửa đất trong Vùng ({filteredPlots.length}/{availablePlots.length} khả dụng)
                </span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={selectAll}
                  className="text-emerald-700 hover:text-emerald-800 font-bold hover:underline cursor-pointer"
                >
                  Chọn tất cả
                </button>
                <span className="text-slate-300">|</span>
                <button
                  type="button"
                  onClick={deselectAll}
                  className="text-slate-500 hover:text-slate-700 font-bold hover:underline cursor-pointer"
                >
                  Bỏ chọn
                </button>
              </div>
            </div>

            {/* Search plot */}
            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Tìm mã thửa, tên xã viên phụ trách..."
                className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:bg-white focus:ring-2 focus:ring-emerald-500 focus:outline-none"
              />
            </div>

            {/* List */}
            <div className="border border-slate-200 rounded-2xl overflow-hidden max-h-56 overflow-y-auto divide-y divide-slate-100">
              {filteredPlots.length === 0 ? (
                <div className="p-6 text-center text-slate-400">
                  {availablePlots.length === 0
                    ? 'Tất cả các thửa đất trong vùng sản xuất này đã được phân bổ vào mùa vụ.'
                    : 'Không tìm thấy thửa đất nào phù hợp với từ khóa tìm kiếm.'}
                </div>
              ) : (
                filteredPlots.map((plot) => {
                  const isChecked = selectedPlotIds.includes(plot.id);
                  const areaNum = Number(plot.area) || 0;
                  const areaM2 = areaNum < 100 ? areaNum * 10000 : areaNum;
                  const memberName = plot.land_relation?.member_name || 'Chưa gán xã viên';

                  return (
                    <div
                      key={plot.id}
                      onClick={() => togglePlot(plot.id)}
                      className={`flex items-center justify-between p-3 transition cursor-pointer select-none ${
                        isChecked ? 'bg-emerald-50/70 text-emerald-950' : 'hover:bg-slate-50 text-slate-700'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div className="text-emerald-700">
                          {isChecked ? (
                            <CheckSquare className="w-4.5 h-4.5 text-emerald-700" />
                          ) : (
                            <Square className="w-4.5 h-4.5 text-slate-300" />
                          )}
                        </div>
                        <div>
                          <div className="font-bold flex items-center gap-2">
                            <span>{plot.plot_code}</span>
                            <span className="text-[11px] font-mono font-medium px-2 py-0.5 rounded-md bg-white border border-slate-200 text-slate-600">
                              {areaM2.toLocaleString()} m² ({(areaM2 / 10000).toFixed(2)} ha)
                            </span>
                          </div>
                          <div className="text-[11px] text-slate-500 flex items-center gap-1.5 mt-0.5">
                            <Users className="w-3.5 h-3.5 text-slate-400" />
                            <span>Xã viên: {memberName}</span>
                          </div>
                        </div>
                      </div>

                      <div className="text-right">
                        <span className="text-[11px] font-bold text-emerald-800">
                          ~{Math.round(areaM2 * 4.5).toLocaleString()} kg
                        </span>
                        <span className="text-[10px] text-slate-400 block">Sản lượng định mức</span>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          {/* 3. Live Stats Bar */}
          {selectedPlotIds.length > 0 && (
            <div className="p-3.5 rounded-2xl bg-emerald-100/70 border border-emerald-300/80 flex items-center justify-between text-emerald-900 animate-fade-in">
              <div className="flex items-center gap-2 font-bold">
                <CheckCircle2 className="w-5 h-5 text-emerald-700" />
                <span>
                  Đã chọn {selectedStats.count} thửa đất &bull; {selectedStats.totalAreaHa} ha ({selectedStats.totalAreaM2.toLocaleString()} m²)
                </span>
              </div>
              <div className="text-right font-black font-mono text-emerald-950">
                Ước tính: {selectedStats.totalYieldTons} tấn ({selectedStats.totalYieldKg.toLocaleString()} kg)
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between border-t border-slate-100 bg-slate-50 px-6 py-4 shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl border border-slate-200 font-bold text-slate-600 hover:bg-slate-100 transition cursor-pointer"
          >
            Đóng
          </button>

          <button
            type="button"
            disabled={selectedPlotIds.length === 0 || bulkMutation.isPending}
            onClick={() => bulkMutation.mutate()}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-white bg-emerald-700 hover:bg-emerald-800 disabled:opacity-50 disabled:cursor-not-allowed shadow-md transition cursor-pointer"
          >
            {bulkMutation.isPending ? (
              <span>Đang phân bổ...</span>
            ) : (
              <>
                <CheckSquare className="w-4 h-4" />
                <span>Xác nhận phân bổ {selectedPlotIds.length} thửa đất</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
