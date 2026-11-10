import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { CropSeason } from '@/services/cropSeasonApi';
import { fetchFarmingLogs } from '@/services/farmingLogApi';
import { FarmingLog, ACTIVITY_TYPES_META } from '@/types/agriculture';
import { formatDate } from '@/utils/formatters';
import { BookOpen, ShieldAlert, AlertCircle } from 'lucide-react';

interface CropSeasonTabLogsProps {
  season: CropSeason;
}

export const CropSeasonTabLogs: React.FC<CropSeasonTabLogsProps> = ({ season }) => {
  const { data: logs = [], isLoading } = useQuery<FarmingLog[]>({
    queryKey: ['farming-logs'],
    queryFn: () => fetchFarmingLogs(),
  });

  const seasonLogs = logs.filter((l) => l.crop_season_id === season.id);
  const sprayCount = seasonLogs.filter((l) => l.activity_type === 'SPRAYING').length;
  const fertCount = seasonLogs.filter((l) => l.activity_type === 'FERTILIZATION').length;

  return (
    <div className="space-y-4">
      {/* Activity Summary Cards */}
      <div className="grid grid-cols-3 gap-2.5">
        <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
          <div className="text-[11px] font-bold text-slate-500">Tổng nhật ký ghi</div>
          <div className="text-base font-black font-mono text-slate-900 mt-0.5">
            {seasonLogs.length} lượt
          </div>
        </div>
        <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200">
          <div className="text-[11px] font-bold text-emerald-700">Đợt bón dinh dưỡng</div>
          <div className="text-base font-black font-mono text-emerald-900 mt-0.5">
            {fertCount} đợt
          </div>
        </div>
        <div className="p-3 rounded-xl bg-rose-50 border border-rose-200">
          <div className="text-[11px] font-bold text-rose-700">Lượt phun thuốc BVTV</div>
          <div className="text-base font-black font-mono text-rose-900 mt-0.5">
            {sprayCount} lần
          </div>
        </div>
      </div>

      {/* Logs List */}
      <div className="bg-white rounded-xl border border-slate-200/90 shadow-2xs p-5">
        <h3 className="text-xs font-black uppercase tracking-wider text-slate-800 pb-3 mb-3 border-b border-slate-100 flex items-center justify-between">
          <span className="flex items-center gap-1.5">
            <BookOpen className="w-4 h-4 text-emerald-600" />
            Nhật ký canh tác thực tế (VietGAP / TCVN 12850)
          </span>
          <span className="text-[11px] text-slate-400 font-normal">
            {seasonLogs.length} ghi nhận
          </span>
        </h3>

        {isLoading ? (
          <div className="py-8 text-center text-xs text-slate-400">
            Đang tải nhật ký canh tác...
          </div>
        ) : seasonLogs.length === 0 ? (
          <div className="py-8 text-center text-slate-400 text-xs">
            <AlertCircle className="w-6 h-6 mx-auto mb-1.5 text-slate-300" />
            <p className="font-bold text-slate-600">Chưa phát sinh nhật ký canh tác</p>
            <p className="text-[11.5px] text-slate-400 mt-0.5">
              Xã viên ghi chép tại phân hệ Nhật ký sẽ tự động tổng hợp vào đây.
            </p>
          </div>
        ) : (
          <div className="space-y-2.5">
            {seasonLogs.slice(0, 15).map((log) => {
              const meta = ACTIVITY_TYPES_META[log.activity_type] || {
                label: log.activity_type,
                badgeClass: 'bg-slate-100 text-slate-700 border-slate-200',
              };

              return (
                <div
                  key={log.id}
                  className="p-3.5 rounded-xl border border-slate-200/80 bg-slate-50/50 hover:bg-slate-50 transition-colors"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className={`px-2 py-0.2 rounded text-[10.5px] font-bold border ${meta.badgeClass}`}>
                          {meta.label}
                        </span>
                        <span className="font-mono text-xs font-bold text-slate-800">
                          {log.plot_code}
                        </span>
                        <span className="text-[11px] text-slate-400 font-mono">
                          {formatDate(log.activity_date)}
                        </span>
                      </div>
                      <p className="text-xs text-slate-700 mt-1 font-medium">{log.description}</p>
                    </div>

                    {log.phi_days && log.phi_days > 0 && (
                      <span className="inline-flex items-center gap-1 text-[10.5px] font-bold text-rose-700 bg-rose-50 px-2 py-0.5 rounded border border-rose-200 shrink-0">
                        <ShieldAlert className="w-3 h-3" />
                        PHI: {log.phi_days} ngày
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
