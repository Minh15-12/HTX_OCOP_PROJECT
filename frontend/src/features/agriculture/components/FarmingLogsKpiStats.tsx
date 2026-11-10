import React from 'react';
import { Layers, ShieldAlert, Sprout, Camera } from 'lucide-react';

interface FarmingLogsStats {
  total: number;
  sprayCount: number;
  quarantineCount: number;
  complianceRate: number;
}

interface FarmingLogsKpiStatsProps {
  stats: FarmingLogsStats;
}

export const FarmingLogsKpiStats: React.FC<FarmingLogsKpiStatsProps> = ({ stats }) => {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
      {/* Card 1: Tổng lượt ghi */}
      <div className="group rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:border-emerald-200 hover:shadow-md">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-xs font-semibold text-slate-500">Tổng lượt ghi nhật ký</p>
            <p className="mt-2 text-3xl font-extrabold tracking-tight text-slate-900">
              {stats.total}
            </p>
            <p className="mt-1 text-xs text-slate-400">Canh tác vụ chuẩn VietGAP</p>
          </div>
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
            <Layers className="h-5 w-5" />
          </div>
        </div>
      </div>

      {/* Card 2: Cảnh báo PHI */}
      <div className="group rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:border-rose-200 hover:shadow-md">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-xs font-semibold text-slate-500">Đang cách ly an toàn PHI</p>
            <p className="mt-2 text-3xl font-extrabold tracking-tight text-rose-600 flex items-center gap-1.5">
              {stats.quarantineCount} <span className="text-sm font-bold text-slate-500">lượt</span>
            </p>
            <p className="mt-1 text-xs text-rose-500 font-medium">Khóa tự động lệnh thu hoạch</p>
          </div>
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-rose-50 text-rose-600">
            <ShieldAlert className="h-5 w-5" />
          </div>
        </div>
      </div>

      {/* Card 3: Phun thuốc & Bón phân */}
      <div className="group rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:border-amber-200 hover:shadow-md">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-xs font-semibold text-slate-500">Xử lý dinh dưỡng / BVTV</p>
            <p className="mt-2 text-3xl font-extrabold tracking-tight text-slate-900">
              {stats.sprayCount} <span className="text-sm font-bold text-slate-500">lượt</span>
            </p>
            <p className="mt-1 text-xs text-slate-400">Kiểm soát vật tư & số lô</p>
          </div>
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-amber-50 text-amber-600">
            <Sprout className="h-5 w-5" />
          </div>
        </div>
      </div>

      {/* Card 4: Tỷ lệ minh chứng GPS & Ảnh */}
      <div className="group rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:border-blue-200 hover:shadow-md">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-xs font-semibold text-slate-500">Minh chứng đạt chuẩn số</p>
            <p className="mt-2 text-3xl font-extrabold tracking-tight text-blue-700">
              {stats.complianceRate}%
            </p>
            <p className="mt-1 text-xs text-slate-400">Đầy đủ tọa độ GPS & Ảnh thực tế</p>
          </div>
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
            <Camera className="h-5 w-5" />
          </div>
        </div>
      </div>
    </div>
  );
};
