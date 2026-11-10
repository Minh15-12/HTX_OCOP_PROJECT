import React from 'react';
import { ArrowRight, ShieldCheck, AlertCircle, Sprout, CheckCircle2, Calendar } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { FarmPlot } from '@/services/farmPlotApi';

interface DashboardFarmPlotsStatusProps {
  plots: FarmPlot[];
  isLoading?: boolean;
}

export const DashboardFarmPlotsStatus: React.FC<DashboardFarmPlotsStatusProps> = ({
  plots,
  isLoading = false,
}) => {
  const navigate = useNavigate();

  const today = new Date().toISOString().slice(0, 10);

  // Compute PHI status for each plot
  const evaluatedPlots = plots.map((plot) => {
    const isQuarantine =
      plot.is_in_quarantine ||
      (plot.quarantine_until && plot.quarantine_until > today) ||
      plot.status === 'IN_QUARANTINE';

    // Calculate days remaining if in quarantine
    let daysLeft = 0;
    if (isQuarantine && plot.quarantine_until) {
      const qDate = new Date(plot.quarantine_until);
      const curr = new Date(today);
      const diffTime = qDate.getTime() - curr.getTime();
      daysLeft = Math.max(1, Math.ceil(diffTime / (1000 * 60 * 60 * 24)));
    }

    return {
      ...plot,
      isQuarantine,
      daysLeft,
    };
  });

  const safeCount = evaluatedPlots.filter((p) => !p.isQuarantine && p.status === 'ACTIVE').length;
  const quarantineCount = evaluatedPlots.filter((p) => p.isQuarantine).length;
  const fallowCount = evaluatedPlots.filter((p) => !p.isQuarantine && p.status !== 'ACTIVE').length;

  return (
    <div className="bg-white border border-[#e7e9ec] rounded-xl shadow-subtle overflow-hidden flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3.5 border-b border-[#e7e9ec] bg-slate-50/60">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="font-extrabold text-[14.5px] text-slate-900">
              Giám sát Vùng trồng & VietGAP PHI
            </h3>
            <span className="pill-badge pill-green text-[10.5px]">15 Nhà kính màng</span>
          </div>
          <p className="text-[11.8px] text-slate-500 mt-0.5">
            Thời hạn cách ly thuốc BVTV & an toàn thu hoạch Ớt chuông Sweet Palermo
          </p>
        </div>
        <button
          onClick={() => navigate('/agriculture/plots')}
          className="text-emerald-700 hover:text-emerald-800 text-[12.5px] font-bold inline-flex items-center gap-1 cursor-pointer"
        >
          Sơ đồ chi tiết <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* KPI Micro Summary */}
      <div className="grid grid-cols-3 divide-x divide-slate-100 border-b border-slate-100 bg-slate-50/30 text-center py-2.5 px-2">
        <div>
          <div className="text-[11px] text-slate-500 font-semibold flex items-center justify-center gap-1">
            <span className="w-2 h-2 rounded-full bg-emerald-500"></span> An toàn hái trái
          </div>
          <div className="text-base font-extrabold text-emerald-700 mt-0.5">
            {isLoading ? '...' : `${safeCount} thửa`}
          </div>
        </div>
        <div>
          <div className="text-[11px] text-slate-500 font-semibold flex items-center justify-center gap-1">
            <span className="w-2 h-2 rounded-full bg-rose-500 animate-pulse"></span> Cách ly PHI
          </div>
          <div className="text-base font-extrabold text-rose-700 mt-0.5">
            {isLoading ? '...' : `${quarantineCount} thửa`}
          </div>
        </div>
        <div>
          <div className="text-[11px] text-slate-500 font-semibold flex items-center justify-center gap-1">
            <span className="w-2 h-2 rounded-full bg-slate-400"></span> Nghỉ vụ / Cải tạo
          </div>
          <div className="text-base font-extrabold text-slate-700 mt-0.5">
            {isLoading ? '...' : `${fallowCount} thửa`}
          </div>
        </div>
      </div>

      {/* Plots Display Grid */}
      <div className="p-4 flex-1">
        {isLoading ? (
          <div className="space-y-2 py-4">
            <div className="h-10 bg-slate-100 animate-pulse rounded-lg" />
            <div className="h-10 bg-slate-100 animate-pulse rounded-lg" />
            <div className="h-10 bg-slate-100 animate-pulse rounded-lg" />
          </div>
        ) : evaluatedPlots.length === 0 ? (
          <div className="text-center py-8 text-slate-400 text-[12.5px]">
            Chưa có dữ liệu thửa đất nhà kính nào được ghi nhận.
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 max-h-[300px] overflow-y-auto pr-1">
            {evaluatedPlots.slice(0, 8).map((plot) => {
              const primaryMember = plot.assignments?.[0]?.member_name;

              const isFallow = !plot.isQuarantine && (plot.status === 'FALLOW' || plot.status !== 'ACTIVE');

              return (
                <div
                  key={plot.id || plot.plot_code}
                  className={`p-2.5 rounded-lg border text-left transition-all ${
                    plot.isQuarantine
                      ? 'border-rose-200 bg-rose-50/40'
                      : isFallow
                      ? 'border-slate-200 bg-slate-50/70'
                      : 'border-slate-200 bg-white hover:border-emerald-300'
                  }`}
                >
                  <div className="flex items-center justify-between gap-1 mb-1">
                    <span className="font-extrabold text-[12px] text-slate-800">
                      {plot.plot_code}
                    </span>
                    {plot.isQuarantine ? (
                      <span className="pill-badge pill-red text-[10px] flex items-center gap-1 font-bold">
                        <AlertCircle className="w-3 h-3" /> Cách ly {plot.daysLeft} ngày
                      </span>
                    ) : isFallow ? (
                      <span className="pill-badge bg-slate-100 text-slate-700 border border-slate-300 text-[10px] flex items-center gap-1 font-bold">
                        <span className="w-1.5 h-1.5 rounded-full bg-slate-500"></span> Nghỉ vụ / Cải tạo
                      </span>
                    ) : (
                      <span className="pill-badge pill-green text-[10px] flex items-center gap-1 font-bold">
                        <CheckCircle2 className="w-3 h-3" /> Đạt chuẩn PHI
                      </span>
                    )}
                  </div>

                  <div className="flex items-center justify-between text-[11px] text-slate-500">
                    <span className="truncate max-w-[120px]">
                      {primaryMember ? `Xã viên: ${primaryMember}` : 'Nhà màng Israel'}
                    </span>
                    <span
                      className="font-semibold text-slate-700"
                      title={plot.area ? `${(Number(plot.area) * 10000).toLocaleString('vi-VN')} m²` : undefined}
                    >
                      {plot.area ? `${Number(plot.area).toLocaleString('vi-VN')} ha` : '—'}
                    </span>
                  </div>

                  {plot.substrate_bag_count ? (
                    <div className="text-[10.5px] text-slate-400 mt-1 flex items-center gap-1">
                      <Sprout className="w-3 h-3 text-emerald-600" />
                      {Number(plot.substrate_bag_count).toLocaleString('vi-VN')} túi xơ dừa giá thể
                    </div>
                  ) : null}
                </div>
              );
            })}
          </div>
        )}

        {evaluatedPlots.length > 8 && (
          <div className="mt-3 pt-2 border-t border-slate-100 flex items-center justify-between text-[11.5px] text-slate-500">
            <span>Hiển thị 8/{evaluatedPlots.length} thửa đất canh tác ớt chuông</span>
            <button
              onClick={() => navigate('/agriculture/plots')}
              className="text-emerald-700 font-bold hover:underline cursor-pointer"
            >
              Xem toàn bộ 15 thửa đất &rarr;
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
