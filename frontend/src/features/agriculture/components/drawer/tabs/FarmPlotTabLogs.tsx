import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { BookOpen, Calendar, ShieldAlert, Sprout, Droplets, Bug, AlertCircle } from 'lucide-react';
import { FarmPlot } from '@/services/farmPlotApi';
import { fetchFarmingLogs } from '@/services/farmingLogApi';
import { FarmingLog } from '@/types/agriculture';

interface FarmPlotTabLogsProps {
  plot: FarmPlot;
}

const activityBadge: Record<string, { label: string; cls: string; icon: any }> = {
  SPRAYING: { label: 'Phun thuốc BVTV', cls: 'bg-rose-50 text-rose-700 border-rose-200', icon: Bug },
  FERTILIZATION: { label: 'Bón phân', cls: 'bg-emerald-50 text-emerald-800 border-emerald-200', icon: Droplets },
  CARE: { label: 'Chăm sóc / Tỉa cành', cls: 'bg-blue-50 text-blue-700 border-blue-200', icon: Sprout },
  LAND_PREPARATION: { label: 'Làm đất / Khử trùng', cls: 'bg-amber-50 text-amber-800 border-amber-200', icon: Sprout },
  HARVEST: { label: 'Thu hoạch', cls: 'bg-purple-50 text-purple-700 border-purple-200', icon: Sprout },
};

export const FarmPlotTabLogs: React.FC<FarmPlotTabLogsProps> = ({ plot }) => {
  const { data: logs = [], isLoading } = useQuery<FarmingLog[]>({
    queryKey: ['farmingLogsForPlot', plot.id],
    queryFn: async () => {
      const all = await fetchFarmingLogs({ plot_id: plot.id });
      // Filter strictly for this plot by id or code
      return all.filter((l) => l.plot_id === plot.id || l.plot_code === plot.plot_code);
    },
  });

  return (
    <div className="space-y-4">
      {/* Header bar */}
      <div className="flex items-center justify-between">
        <div>
          <h4 className="text-xs font-extrabold text-slate-800">
            Nhật ký canh tác thửa đất ({logs.length})
          </h4>
          <p className="text-[11px] text-slate-400">
            Lịch sử phun thuốc, bón phân, tưới tiêu và cách ly an toàn theo TCVN 12850:2019 &amp; VietGAP.
          </p>
        </div>
      </div>

      {/* Loading */}
      {isLoading ? (
        <div className="py-12 text-center text-slate-400">
          <div className="inline-block animate-spin rounded-full h-6 w-6 border-2 border-emerald-600 border-t-transparent mb-2" />
          <p className="text-xs font-semibold">Đang truy xuất nhật ký canh tác của thửa...</p>
        </div>
      ) : logs.length === 0 ? (
        <div className="p-8 text-center rounded-2xl border border-dashed border-slate-200 bg-slate-50/70">
          <BookOpen className="w-8 h-8 text-slate-300 mx-auto mb-2" />
          <p className="font-bold text-xs text-slate-700">Chưa có nhật ký ghi chép cho thửa này</p>
          <p className="text-[11px] text-slate-400 max-w-xs mx-auto mt-1">
            Các hoạt động bón phân, phun thuốc và chăm sóc trên thửa đất sẽ được lưu vết tự động tại đây.
          </p>
        </div>
      ) : (
        <div className="space-y-2.5">
          {logs.map((log) => {
            const badge = activityBadge[log.activity_type] || {
              label: log.activity_type,
              cls: 'bg-slate-100 text-slate-700 border-slate-200',
              icon: BookOpen,
            };
            const Icon = badge.icon;
            const hasPhi = Number(log.phi_days) > 0;

            return (
              <div
                key={log.id}
                className="p-3.5 rounded-xl border border-slate-200 bg-white hover:border-emerald-200 transition shadow-2xs space-y-2"
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span
                      className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-lg text-[10.5px] font-bold border ${badge.cls}`}
                    >
                      <Icon className="w-3 h-3" />
                      {badge.label}
                    </span>
                    <span className="font-mono text-[11px] text-slate-400 font-semibold">
                      {log.id}
                    </span>
                  </div>

                  <div className="flex items-center gap-1 text-[11px] font-mono text-slate-500">
                    <Calendar className="w-3 h-3 text-slate-400" />
                    <span>{log.activity_date}</span>
                  </div>
                </div>

                <p className="text-xs text-slate-800 leading-relaxed font-medium">
                  {log.description}
                </p>

                {/* Material & PHI Info */}
                {(log.material_name || hasPhi) && (
                  <div className="pt-2 border-t border-slate-100 flex flex-wrap items-center justify-between gap-2 text-[11px]">
                    {log.material_name && (
                      <div className="text-slate-600">
                        <span className="text-slate-400">Vật tư: </span>
                        <strong className="text-slate-800">{log.material_name}</strong>
                        {log.quantity_applied && (
                          <span className="ml-1 text-slate-500 font-mono">
                            ({log.quantity_applied} {log.unit})
                          </span>
                        )}
                      </div>
                    )}

                    {hasPhi && (
                      <div className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-rose-50 text-rose-700 border border-rose-200 font-bold">
                        <ShieldAlert className="w-3 h-3" />
                        <span>PHI: Cách ly {log.phi_days} ngày (đến {log.safe_harvest_date})</span>
                      </div>
                    )}
                  </div>
                )}

                {log.performer_name && (
                  <div className="text-[10.5px] text-slate-400">
                    Người thực hiện: <span className="text-slate-600">{log.performer_name}</span>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
