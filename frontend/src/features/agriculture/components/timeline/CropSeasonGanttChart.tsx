import React, { useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { CropSeason, CropSeasonPlotAllocation, fetchSeasonPlots } from '@/services/cropSeasonApi';
import {
  CalendarDays,
  Sprout,
  Clock,
  MapPin,
  User,
  ShieldAlert,
  ChevronRight,
  Info,
  BarChart2,
  ListChecks,
} from 'lucide-react';
import { formatDate } from '@/utils/formatters';
import { CropSeasonAgendaView } from './CropSeasonAgendaView';

interface CropSeasonGanttChartProps {
  seasons: CropSeason[];
  onSelectSeason: (season: CropSeason) => void;
}

export const CropSeasonGanttChart: React.FC<CropSeasonGanttChartProps> = ({
  seasons,
  onSelectSeason,
}) => {
  // Chọn mùa vụ đang diễn ra đầu tiên, hoặc mùa vụ đầu tiên
  const activeOrFirstSeason = useMemo(() => {
    return (
      seasons.find((s) => s.status === 'ACTIVE' || s.status === 'HARVESTING') ||
      seasons[0] ||
      null
    );
  }, [seasons]);

  const [selectedSeasonId, setSelectedSeasonId] = useState<string>(activeOrFirstSeason?.id || '');
  const [viewMode, setViewMode] = useState<'GANTT' | 'AGENDA'>('GANTT');

  const currentSeason = useMemo(() => {
    return seasons.find((s) => s.id === selectedSeasonId) || activeOrFirstSeason;
  }, [seasons, selectedSeasonId, activeOrFirstSeason]);

  // Lấy các thửa đất phân bổ của mùa vụ được chọn
  const { data: allocatedPlots = [], isLoading } = useQuery<CropSeasonPlotAllocation[]>({
    queryKey: ['seasonPlots', currentSeason?.id],
    queryFn: () => (currentSeason ? fetchSeasonPlots(currentSeason.id) : Promise.resolve([])),
    enabled: !!currentSeason?.id,
  });

  // Tính toán khung thời gian (Timeline Bound)
  const timelineBounds = useMemo(() => {
    if (!currentSeason) return { start: new Date(), end: new Date(), totalDays: 1, months: [] };

    const start = new Date(currentSeason.start_date);
    const end = new Date(currentSeason.expected_end_date);
    const totalDays = Math.max(1, Math.ceil((end.getTime() - start.getTime()) / (1000 * 3600 * 24)));

    // Tạo các mốc tháng
    const months: { label: string; leftPercent: number; widthPercent: number }[] = [];
    const curMonth = new Date(start.getFullYear(), start.getMonth(), 1);
    const lastMonth = new Date(end.getFullYear(), end.getMonth() + 1, 1);

    while (curMonth < lastMonth) {
      const mStart = Math.max(start.getTime(), curMonth.getTime());
      const nextMonth = new Date(curMonth.getFullYear(), curMonth.getMonth() + 1, 1);
      const mEnd = Math.min(end.getTime(), nextMonth.getTime());

      if (mEnd > mStart) {
        const leftPercent = ((mStart - start.getTime()) / (end.getTime() - start.getTime())) * 100;
        const widthPercent = ((mEnd - mStart) / (end.getTime() - start.getTime())) * 100;
        months.push({
          label: `Tháng ${curMonth.getMonth() + 1}/${curMonth.getFullYear()}`,
          leftPercent,
          widthPercent,
        });
      }
      curMonth.setMonth(curMonth.getMonth() + 1);
    }

    return { start, end, totalDays, months };
  }, [currentSeason]);

  // Vị trí của ngày hiện tại (Today Marker)
  const todayPercent = useMemo(() => {
    if (!currentSeason) return null;
    const now = Date.now();
    const start = timelineBounds.start.getTime();
    const end = timelineBounds.end.getTime();

    if (now < start || now > end) return null;
    return ((now - start) / (end - start)) * 100;
  }, [currentSeason, timelineBounds]);

  if (!currentSeason) {
    return (
      <div className="bg-white p-8 rounded-2xl border border-slate-200 text-center text-slate-400 text-xs">
        Chưa có dữ liệu mùa vụ để hiển thị biểu đồ Gantt.
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* 1. Header Toolbar */}
      <div className="bg-white p-4.5 rounded-2xl border border-slate-200 shadow-xs flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-100 text-emerald-700">
            <CalendarDays className="h-5 w-5" />
          </div>
          <div>
            <div className="text-[11px] font-bold text-slate-400">
              Biểu đồ Tiến độ Gantt &bull; Rải vụ Không gian Thời gian
            </div>
            <h2 className="text-base font-extrabold text-slate-900 mt-0.5 flex items-center gap-2">
              <span>{currentSeason.name}</span>
              <span className="text-xs px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-800 border border-emerald-200 font-bold">
                {currentSeason.crop}
              </span>
            </h2>
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          {/* Toggle Gantt vs Agenda */}
          <div className="flex items-center bg-slate-100 p-1 rounded-xl border border-slate-200">
            <button
              type="button"
              onClick={() => setViewMode('GANTT')}
              className={`px-2.5 py-1 rounded-lg text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
                viewMode === 'GANTT'
                  ? 'bg-white text-emerald-800 shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
              title="Xem biểu đồ Gantt tiến độ ngang"
            >
              <BarChart2 className="w-3.5 h-3.5" />
              <span>Gantt</span>
            </button>
            <button
              type="button"
              onClick={() => setViewMode('AGENDA')}
              className={`px-2.5 py-1 rounded-lg text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
                viewMode === 'AGENDA'
                  ? 'bg-white text-emerald-800 shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
              title="Xem danh sách tiến độ lịch trình theo thửa đất"
            >
              <ListChecks className="w-3.5 h-3.5" />
              <span>Lịch trình (Agenda)</span>
            </button>
          </div>

          <label className="text-xs font-bold text-slate-600">Chọn mùa vụ:</label>
          <select
            value={currentSeason.id}
            onChange={(e) => setSelectedSeasonId(e.target.value)}
            className="bg-slate-50 border border-slate-300 rounded-xl px-3 py-1.5 text-xs font-bold text-slate-800 outline-none focus:ring-2 focus:ring-emerald-500"
          >
            {seasons.map((s) => (
              <option key={s.id} value={s.id}>
                {s.name} ({s.status})
              </option>
            ))}
          </select>

          <button
            type="button"
            onClick={() => onSelectSeason(currentSeason)}
            className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold transition cursor-pointer"
          >
            <span>Chi tiết mùa vụ</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {viewMode === 'AGENDA' ? (
        <CropSeasonAgendaView
          currentSeason={currentSeason}
          allocatedPlots={allocatedPlots}
          isLoading={isLoading}
        />
      ) : (
        <>
      {/* 2. Color Legend */}
      <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 flex flex-wrap items-center justify-between text-xs gap-2">
        <div className="flex flex-wrap items-center gap-4">
          <span className="font-bold text-slate-700 flex items-center gap-1">
            <Info className="w-3.5 h-3.5 text-slate-400" /> Phân kỳ sinh trưởng:
          </span>
          <div className="flex items-center gap-1.5">
            <span className="w-3.5 h-3.5 rounded bg-emerald-300 border border-emerald-400 inline-block" />
            <span className="text-[11px] text-slate-600 font-semibold">1. Ươm &amp; Bén rễ</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3.5 h-3.5 rounded bg-teal-400 border border-teal-500 inline-block" />
            <span className="text-[11px] text-slate-600 font-semibold">2. Sinh dưỡng tạo tán</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3.5 h-3.5 rounded bg-amber-400 border border-amber-500 inline-block" />
            <span className="text-[11px] text-slate-600 font-semibold">3. Đậu quả &amp; Độ Brix</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3.5 h-3.5 rounded bg-blue-500 border border-blue-600 inline-block" />
            <span className="text-[11px] text-slate-600 font-semibold">4. Thu hoạch rộ</span>
          </div>
        </div>

        {todayPercent !== null && (
          <div className="flex items-center gap-1.5 text-[11px] font-bold text-rose-600">
            <span className="w-2.5 h-2.5 rounded-full bg-rose-500 animate-ping inline-block" />
            <span>Vạch đỏ: Thời điểm hôm nay ({new Date().toLocaleDateString('vi-VN')})</span>
          </div>
        )}
      </div>

      {/* 3. Gantt Chart Viewport */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        {/* Month Scale Header */}
        <div className="flex border-b border-slate-200 bg-slate-100/80">
          <div className="w-64 p-3 font-bold text-xs text-slate-700 border-r border-slate-200 shrink-0">
            Thửa đất &amp; Xã viên phụ trách
          </div>
          <div className="flex-1 relative h-9">
            {timelineBounds.months.map((m, idx) => (
              <div
                key={idx}
                className="absolute top-0 bottom-0 border-r border-slate-300 text-[11px] font-bold text-slate-600 flex items-center justify-center overflow-hidden px-1"
                style={{ left: `${m.leftPercent}%`, width: `${m.widthPercent}%` }}
              >
                {m.label}
              </div>
            ))}
          </div>
        </div>

        {/* Rows Container */}
        <div className="divide-y divide-slate-100 relative">
          {/* Today Line Marker Overlay */}
          {todayPercent !== null && (
            <div
              className="absolute top-0 bottom-0 z-20 pointer-events-none"
              style={{ left: `calc(16rem + (100% - 16rem) * ${todayPercent / 100})` }}
            >
              <div className="w-0.5 h-full bg-rose-500" />
              <div className="bg-rose-500 text-white text-[9px] font-bold px-1 rounded-sm -translate-x-1/2 absolute top-1">
                Hôm nay
              </div>
            </div>
          )}

          {/* Row 0: Mùa vụ Tổng thể */}
          <div className="flex items-center hover:bg-slate-50/50 transition">
            <div className="w-64 p-3 border-r border-slate-200 shrink-0">
              <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-700 block">
                Chu kỳ tổng thể
              </span>
              <span className="font-extrabold text-xs text-slate-900 block truncate">
                {currentSeason.name}
              </span>
              <span className="text-[10.5px] text-slate-400 font-mono">
                {currentSeason.start_date?.slice(0, 10)} &rarr; {currentSeason.expected_end_date?.slice(0, 10)}
              </span>
            </div>

            <div className="flex-1 relative h-14 p-2 flex items-center">
              {/* Background grid lines */}
              {timelineBounds.months.map((m, idx) => (
                <div
                  key={idx}
                  className="absolute top-0 bottom-0 border-r border-slate-100 pointer-events-none"
                  style={{ left: `${m.leftPercent}%`, width: `${m.widthPercent}%` }}
                />
              ))}

              {/* Master Season Bar */}
              <div
                className="w-full h-7 rounded-xl bg-gradient-to-r from-emerald-500 via-teal-500 to-blue-600 shadow-xs flex items-center justify-between px-3 text-white text-[11px] font-bold relative z-10"
              >
                <span>Toàn vụ: {timelineBounds.totalDays} ngày</span>
                <span>Hạn ngạch: {Number(currentSeason.puc_quota_kg || 45000).toLocaleString()} kg</span>
              </div>
            </div>
          </div>

          {/* Rows for each Allocated Plot */}
          {isLoading ? (
            <div className="p-8 text-center text-xs text-slate-400">
              Đang tải danh sách thửa đất rải vụ...
            </div>
          ) : allocatedPlots.length === 0 ? (
            <div className="p-8 text-center text-xs text-slate-400">
              Chưa có thửa đất nào được phân bổ cho mùa vụ này. Hãy mở chi tiết mùa vụ để phân bổ.
            </div>
          ) : (
            allocatedPlots.map((plot, idx) => {
              const start = timelineBounds.start.getTime();
              const end = timelineBounds.end.getTime();

              const pStart = new Date(plot.planting_date).getTime();
              const pEnd = new Date(plot.expected_harvest_end).getTime();

              const barLeft = Math.max(0, Math.min(100, ((pStart - start) / (end - start)) * 100));
              const barRight = Math.max(0, Math.min(100, ((pEnd - start) / (end - start)) * 100));
              const barWidth = Math.max(5, barRight - barLeft);

              // Độ dài giai đoạn thu hái
              const harvestStart = new Date(plot.expected_harvest_start).getTime();
              const harvestLeft = Math.max(0, Math.min(100, ((harvestStart - pStart) / (pEnd - pStart)) * 100));

              return (
                <div key={plot.id} className="flex items-center hover:bg-slate-50/60 transition group">
                  {/* Left Column: Plot Info */}
                  <div className="w-64 p-3 border-r border-slate-200 shrink-0">
                    <div className="flex items-center justify-between">
                      <span className="font-mono text-xs font-black text-slate-900">
                        {plot.plot_code}
                      </span>
                      <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-slate-100 text-slate-600">
                        Đợt #{idx + 1}
                      </span>
                    </div>

                    <div className="text-[11.5px] text-slate-700 font-semibold truncate mt-0.5 flex items-center gap-1">
                      <User className="w-3 h-3 text-slate-400 shrink-0" />
                      <span>{plot.member_name || 'Chưa gán xã viên'}</span>
                    </div>

                    <div className="text-[10.5px] text-slate-400 font-mono mt-0.5">
                      {plot.crop_variety || currentSeason.crop} &bull; {Number(plot.allocated_area).toLocaleString()} m²
                    </div>
                  </div>

                  {/* Right Column: Interactive Staggered Gantt Bar */}
                  <div className="flex-1 relative h-14 p-2 flex items-center">
                    {/* Background grid lines */}
                    {timelineBounds.months.map((m, mIdx) => (
                      <div
                        key={mIdx}
                        className="absolute top-0 bottom-0 border-r border-slate-100 pointer-events-none"
                        style={{ left: `${m.leftPercent}%`, width: `${m.widthPercent}%` }}
                      />
                    ))}

                    {/* Staggered Gantt Bar */}
                    <div
                      className="h-8 rounded-xl bg-slate-200 border border-slate-300 relative z-10 shadow-2xs overflow-hidden flex cursor-pointer transition hover:ring-2 hover:ring-emerald-500"
                      style={{ left: `${barLeft}%`, width: `${barWidth}%` }}
                      title={`${plot.plot_code}: Xuống giống ${plot.planting_date.slice(0, 10)} -> Thu hoạch ${plot.expected_harvest_end.slice(0, 10)}`}
                      onClick={() => onSelectSeason(currentSeason)}
                    >
                      {/* Segment 1: Growing Phase */}
                      <div
                        className="h-full bg-gradient-to-r from-emerald-400 to-teal-500 flex items-center px-2 text-[10px] font-bold text-white truncate"
                        style={{ width: `${harvestLeft}%` }}
                      >
                        🌱 Gieo: {plot.planting_date?.slice(5, 10)}
                      </div>

                      {/* Segment 2: Harvesting Phase */}
                      <div
                        className="h-full bg-gradient-to-r from-amber-400 to-blue-500 flex-1 flex items-center justify-between px-2 text-[10px] font-bold text-white truncate"
                      >
                        <span>🍇 Thu hái</span>
                        <span className="font-mono">
                          {Number(plot.actual_harvested_kg || 0).toLocaleString()} / {Number(plot.target_yield_kg || 0).toLocaleString()} kg
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
      </>
      )}
    </div>
  );
};
