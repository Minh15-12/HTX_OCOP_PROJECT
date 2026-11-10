import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { CropSeason } from '@/services/cropSeasonApi';
import { fetchHarvests } from '@/services/harvestApi';
import { HarvestItem } from '@/types/agriculture';
import { formatDate, formatNumber } from '@/utils/formatters';
import { Wheat, Award, AlertCircle } from 'lucide-react';

interface CropSeasonTabHarvestsProps {
  season: CropSeason;
}

export const CropSeasonTabHarvests: React.FC<CropSeasonTabHarvestsProps> = ({ season }) => {
  const { data: harvests = [], isLoading } = useQuery<HarvestItem[]>({
    queryKey: ['harvests'],
    queryFn: () => fetchHarvests(),
  });

  const seasonHarvests = harvests.filter(
    (h) => h.crop_season_id === season.id || h.crop_season_name?.includes(season.name)
  );

  const totalKg = seasonHarvests.reduce((sum, h) => sum + (Number(h.quantity_kg) || 0), 0);
  const gradeAKg = seasonHarvests.reduce((sum, h) => sum + (Number(h.grade_a_kg) || 0), 0);
  const gradeAPct = totalKg > 0 ? Math.round((gradeAKg / totalKg) * 100) : 0;

  return (
    <div className="space-y-4">
      {/* KPI Cards */}
      <div className="grid grid-cols-3 gap-2.5">
        <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
          <div className="text-[11px] font-bold text-slate-500">Lũy kế sản lượng</div>
          <div className="text-base font-black font-mono text-slate-900 mt-0.5">
            {formatNumber(totalKg)} kg
          </div>
        </div>
        <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200">
          <div className="text-[11px] font-bold text-emerald-700">Sản lượng Grade A</div>
          <div className="text-base font-black font-mono text-emerald-900 mt-0.5">
            {formatNumber(gradeAKg)} kg
          </div>
        </div>
        <div className="p-3 rounded-xl bg-indigo-50 border border-indigo-200">
          <div className="text-[11px] font-bold text-indigo-700">Tỷ lệ Grade A</div>
          <div className="text-base font-black font-mono text-indigo-900 mt-0.5">
            {gradeAPct}%
          </div>
        </div>
      </div>

      {/* Harvests List */}
      <div className="bg-white rounded-xl border border-slate-200/90 shadow-2xs p-5">
        <h3 className="text-xs font-black uppercase tracking-wider text-slate-800 pb-3 mb-3 border-b border-slate-100 flex items-center justify-between">
          <span className="flex items-center gap-1.5">
            <Wheat className="w-4 h-4 text-emerald-600" />
            Lệnh thu hoạch đã thực hiện
          </span>
          <span className="text-[11px] text-slate-400 font-normal">
            {seasonHarvests.length} đợt hái
          </span>
        </h3>

        {isLoading ? (
          <div className="py-8 text-center text-xs text-slate-400">
            Đang tải dữ liệu thu hoạch...
          </div>
        ) : seasonHarvests.length === 0 ? (
          <div className="py-8 text-center text-slate-400 text-xs">
            <AlertCircle className="w-6 h-6 mx-auto mb-1.5 text-slate-300" />
            <p className="font-bold text-slate-600">Chưa phát sinh lệnh thu hoạch</p>
            <p className="text-[11.5px] text-slate-400 mt-0.5">
              Khi bước vào giai đoạn thu hoạch, các lệnh thu hoạch sẽ ghi nhận tại đây.
            </p>
          </div>
        ) : (
          <div className="space-y-2.5">
            {seasonHarvests.map((h) => (
              <div
                key={h.id}
                className="p-3.5 rounded-xl border border-slate-200/80 bg-slate-50/50 hover:bg-slate-50 transition-colors"
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs font-bold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                        {h.harvest_code}
                      </span>
                      <span className="font-mono text-xs text-slate-500">
                        {h.lot_code}
                      </span>
                      <span className="text-[11px] text-slate-400 font-mono">
                        {formatDate(h.harvest_date)}
                      </span>
                    </div>
                    <p className="text-xs text-slate-700 mt-1 font-medium">
                      Thửa đất: <strong>{h.plot_code}</strong> ({h.plot_name})
                    </p>
                  </div>

                  <div className="text-right shrink-0">
                    <span className="text-sm font-black font-mono text-slate-900">
                      {formatNumber(h.quantity_kg)} kg
                    </span>
                    <div className="text-[10.5px] text-emerald-700 font-semibold">
                      A: {formatNumber(h.grade_a_kg || 0)} kg
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
