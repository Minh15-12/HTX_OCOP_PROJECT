import React, { useMemo } from 'react';
import { CropSeason, CropSeasonPlotAllocation } from '@/services/cropSeasonApi';
import { formatDate } from '@/utils/formatters';
import {
  MapPin,
  User,
  Calendar,
  Clock,
  Sprout,
  CheckCircle2,
  AlertCircle,
  TrendingUp,
  Wheat,
} from 'lucide-react';

interface CropSeasonAgendaViewProps {
  currentSeason: CropSeason;
  allocatedPlots: CropSeasonPlotAllocation[];
  isLoading: boolean;
  onSelectPlot?: (plot: CropSeasonPlotAllocation) => void;
}

export const CropSeasonAgendaView: React.FC<CropSeasonAgendaViewProps> = ({
  currentSeason,
  allocatedPlots,
  isLoading,
  onSelectPlot,
}) => {
  // Sắp xếp các thửa theo ngày gieo cấy tăng dần, sau đó theo ngày thu hoạch
  const sortedPlots = useMemo(() => {
    return [...allocatedPlots].sort((a, b) => {
      const dateA = new Date(a.planting_date || currentSeason.start_date).getTime();
      const dateB = new Date(b.planting_date || currentSeason.start_date).getTime();
      return dateA - dateB;
    });
  }, [allocatedPlots, currentSeason]);

  // Tính trạng thái tiến độ thời gian thực của từng thửa
  const getGrowthStage = (plot: CropSeasonPlotAllocation) => {
    const now = Date.now();
    const pDate = new Date(plot.planting_date || currentSeason.start_date).getTime();
    const hStart = new Date(plot.expected_harvest_start || currentSeason.expected_end_date).getTime();
    const hEnd = new Date(plot.expected_harvest_end || currentSeason.expected_end_date).getTime();

    if (now < pDate) {
      const daysLeft = Math.ceil((pDate - now) / (1000 * 3600 * 24));
      return {
        stage: 'CHUẨN BỊ XUỐNG GIỐNG',
        color: 'bg-slate-100 text-slate-700 border-slate-300',
        badgeColor: 'bg-slate-200 text-slate-800',
        progress: 0,
        subtext: `Còn ${daysLeft} ngày nữa tới lịch xuống giống`,
        icon: Clock,
      };
    }

    if (now >= hStart && now <= hEnd) {
      return {
        stage: 'ĐANG THU HOẠCH RỘ',
        color: 'bg-blue-50 text-blue-800 border-blue-300',
        badgeColor: 'bg-blue-600 text-white',
        progress: 100,
        subtext: `Cửa sổ thu hoạch: ${formatDate(plot.expected_harvest_start)} - ${formatDate(plot.expected_harvest_end)}`,
        icon: Wheat,
      };
    }

    if (now > hEnd) {
      return {
        stage: 'ĐÃ KẾT THÚC VỤ THỬA',
        color: 'bg-emerald-50 text-emerald-800 border-emerald-300',
        badgeColor: 'bg-emerald-600 text-white',
        progress: 100,
        subtext: `Đã hoàn tất kỳ thu hoạch`,
        icon: CheckCircle2,
      };
    }

    // Đang trong giai đoạn sinh trưởng
    const totalGrowthTime = hStart - pDate;
    const elapsed = now - pDate;
    const pct = Math.min(99, Math.max(1, Math.round((elapsed / totalGrowthTime) * 100)));

    if (pct < 30) {
      return {
        stage: '1. ƯƠM & BÉN RỄ',
        color: 'bg-emerald-50 text-emerald-800 border-emerald-300',
        badgeColor: 'bg-emerald-500 text-white',
        progress: pct,
        subtext: `Đã qua ${Math.round(elapsed / (1000 * 3600 * 24))} ngày sau cấy/gieo`,
        icon: Sprout,
      };
    } else if (pct < 70) {
      return {
        stage: '2. SINH DƯỠNG & TẠO TÁN',
        color: 'bg-teal-50 text-teal-800 border-teal-300',
        badgeColor: 'bg-teal-500 text-white',
        progress: pct,
        subtext: `Tăng trưởng thân lá, kiểm soát sâu bệnh & bón thúc`,
        icon: TrendingUp,
      };
    } else {
      const daysToHarvest = Math.ceil((hStart - now) / (1000 * 3600 * 24));
      return {
        stage: '3. ĐẬU QUẢ & CHỜ THU HOẠCH',
        color: 'bg-amber-50 text-amber-900 border-amber-300',
        badgeColor: 'bg-amber-500 text-white',
        progress: pct,
        subtext: `Còn ${daysToHarvest} ngày đến ngày bắt đầu thu hoạch (${formatDate(plot.expected_harvest_start)})`,
        icon: AlertCircle,
      };
    }
  };

  if (isLoading) {
    return (
      <div className="bg-white p-12 rounded-2xl border border-slate-200 text-center">
        <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-emerald-600 border-t-transparent mb-3" />
        <p className="text-xs font-bold text-slate-600">Đang tải lịch trình nghị sự mùa vụ...</p>
      </div>
    );
  }

  if (sortedPlots.length === 0) {
    return (
      <div className="bg-white p-10 rounded-2xl border border-slate-200 text-center">
        <div className="w-12 h-12 bg-slate-100 rounded-full flex items-center justify-center mx-auto text-slate-400 mb-3">
          <Calendar className="w-6 h-6" />
        </div>
        <p className="font-bold text-slate-700 text-sm">Chưa có thửa đất nào được phân bổ trong mùa vụ</p>
        <p className="text-xs text-slate-400 mt-1">
          Vào chi tiết mùa vụ &rarr; Tab "Thửa đất tham gia" để chọn phân bổ hàng loạt thửa đất.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Summary KPI Strip */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-2xs">
          <div className="text-[11px] font-bold text-slate-400">Tổng thửa tham gia</div>
          <div className="text-lg font-black text-slate-800 mt-0.5">{sortedPlots.length} thửa</div>
        </div>
        <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-2xs">
          <div className="text-[11px] font-bold text-slate-400">Tổng diện tích canh tác</div>
          <div className="text-lg font-black text-emerald-700 mt-0.5">
            {sortedPlots
              .reduce((sum, p) => sum + (Number(p.allocated_area) || 0), 0)
              .toLocaleString('vi-VN')}{' '}
            m²
          </div>
        </div>
        <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-2xs">
          <div className="text-[11px] font-bold text-slate-400">Sản lượng dự kiến</div>
          <div className="text-lg font-black text-blue-700 mt-0.5">
            {sortedPlots
              .reduce((sum, p) => sum + (Number(p.target_yield_kg) || 0), 0)
              .toLocaleString('vi-VN')}{' '}
            kg
          </div>
        </div>
        <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-2xs">
          <div className="text-[11px] font-bold text-slate-400">Thời gian mùa vụ</div>
          <div className="text-xs font-bold text-slate-700 mt-1">
            {formatDate(currentSeason.start_date)} &rarr; {formatDate(currentSeason.expected_end_date)}
          </div>
        </div>
      </div>

      {/* Timeline Agenda List */}
      <div className="space-y-3">
        {sortedPlots.map((plot, index) => {
          const stageInfo = getGrowthStage(plot);
          const StageIcon = stageInfo.icon;
          const plotName = plot.plot_code || (plot as any).plot?.name || `Thửa #${plot.plot_id}`;
          const memberName = plot.member_name || (plot as any).assigned_member?.full_name || 'Chưa gán xã viên';

          return (
            <div
              key={plot.id || index}
              onClick={() => onSelectPlot && onSelectPlot(plot)}
              className={`bg-white rounded-xl border border-slate-200 hover:border-emerald-300 hover:shadow-sm transition-all p-4 ${
                onSelectPlot ? 'cursor-pointer' : ''
              }`}
            >
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
                {/* Left: Plot & Farmer Details */}
                <div className="space-y-1.5 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-mono text-xs font-black text-slate-900 bg-slate-100 px-2.5 py-0.5 rounded-md">
                      {plotName}
                    </span>
                    <span
                      className={`inline-flex items-center gap-1 text-[11px] font-extrabold px-2.5 py-0.5 rounded-md border ${stageInfo.color}`}
                    >
                      <StageIcon className="w-3.5 h-3.5" />
                      {stageInfo.stage}
                    </span>
                    <span className="text-[11px] text-slate-400">
                      Diện tích:{' '}
                      <strong className="text-slate-700">
                        {Number(plot.allocated_area).toLocaleString('vi-VN')} m²
                      </strong>
                    </span>
                  </div>

                  <div className="flex flex-wrap items-center gap-4 text-xs text-slate-500">
                    <span className="flex items-center gap-1">
                      <User className="w-3.5 h-3.5 text-slate-400" />
                      Xã viên phụ trách: <strong className="text-slate-800">{memberName}</strong>
                    </span>
                    <span className="flex items-center gap-1">
                      <MapPin className="w-3.5 h-3.5 text-slate-400" />
                      Sản lượng dự kiến:{' '}
                      <strong className="text-emerald-700">
                        {Number(plot.target_yield_kg).toLocaleString('vi-VN')} kg
                      </strong>
                    </span>
                  </div>

                  <div className="text-[11.5px] text-slate-500 italic">
                    {stageInfo.subtext}
                  </div>
                </div>

                {/* Right: Dates & Progress Bar */}
                <div className="md:w-72 shrink-0 space-y-2 border-t md:border-t-0 md:border-l border-slate-100 pt-3 md:pt-0 md:pl-4">
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="text-slate-400">Tiến độ sinh trưởng</span>
                    <span className="font-extrabold text-slate-800">{stageInfo.progress}%</span>
                  </div>
                  <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                    <div
                      className={`h-full transition-all ${
                        stageInfo.progress >= 100
                          ? 'bg-blue-600'
                          : stageInfo.progress >= 70
                          ? 'bg-amber-500'
                          : 'bg-emerald-500'
                      }`}
                      style={{ width: `${stageInfo.progress}%` }}
                    />
                  </div>

                  <div className="flex items-center justify-between text-[10.5px] text-slate-500 font-mono">
                    <span title="Ngày xuống giống">
                      Gieo: {formatDate(plot.planting_date || currentSeason.start_date)}
                    </span>
                    <span>&rarr;</span>
                    <span title="Dự kiến thu hoạch">
                      Thu: {formatDate(plot.expected_harvest_start || currentSeason.expected_end_date)}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
