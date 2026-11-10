import React from 'react';
import type { CropSeason } from '@/services/cropSeasonApi';

interface QuickLogSeasonPlotDateProps {
  cropSeasonId: string;
  setCropSeasonId: (id: string) => void;
  seasons: CropSeason[];
  plotId: string;
  setPlotId: (id: string) => void;
  plots: { id: string; plot_code: string; name: string }[];
  activityDate: string;
  setActivityDate: (date: string) => void;
}

export const QuickLogSeasonPlotDate: React.FC<QuickLogSeasonPlotDateProps> = ({
  cropSeasonId,
  setCropSeasonId,
  seasons,
  plotId,
  setPlotId,
  plots,
  activityDate,
  setActivityDate,
}) => {
  return (
    <>
      <div>
        <label className="block text-xs font-bold text-slate-700 mb-1.5">
          2. Mùa vụ canh tác <span className="text-rose-500">*</span>
        </label>
        <select
          value={cropSeasonId}
          onChange={(e) => setCropSeasonId(e.target.value)}
          className="w-full min-h-[48px] rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2.5 text-xs sm:text-sm font-semibold text-slate-800 outline-none focus:border-emerald-500 focus:bg-white focus:ring-2 focus:ring-emerald-200"
        >
          {seasons.map((s) => (
            <option key={s.id} value={s.id}>
              {s.name} ({s.crop})
            </option>
          ))}
        </select>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-bold text-slate-700 mb-1.5">
            3. Thửa đất canh tác <span className="text-rose-500">*</span>
          </label>
          <select
            value={plotId}
            onChange={(e) => setPlotId(e.target.value)}
            className="w-full min-h-[48px] rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2.5 text-xs sm:text-sm font-semibold text-slate-800 outline-none focus:border-emerald-500 focus:bg-white focus:ring-2 focus:ring-emerald-200"
          >
            {plots.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-xs font-bold text-slate-700 mb-1.5">
            4. Ngày thực hiện <span className="text-rose-500">*</span>
          </label>
          <div className="relative">
            <input
              type="date"
              value={activityDate}
              onChange={(e) => setActivityDate(e.target.value)}
              className="w-full min-h-[48px] rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2.5 text-xs sm:text-sm font-semibold text-slate-800 outline-none focus:border-emerald-500 focus:bg-white focus:ring-2 focus:ring-emerald-200"
            />
          </div>
        </div>
      </div>
    </>
  );
};
