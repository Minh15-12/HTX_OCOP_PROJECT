import React from 'react';
import { Layers, ChevronRight, ShieldAlert } from 'lucide-react';
import { CriteriaGroupItem } from '../../data/criteriaCatalogData';

interface CriteriaGroupCardProps {
  group: CriteriaGroupItem;
}

export const CriteriaGroupCard: React.FC<CriteriaGroupCardProps> = ({ group }) => {
  return (
    <div className="border border-slate-200/80 rounded-xl overflow-hidden shadow-card">
      <div className="bg-cop-900 text-white px-5 py-3 flex items-center justify-between">
        <div className="flex items-center gap-2 font-bold text-sm">
          <Layers className="w-4 h-4 text-emerald-400" />
          <span>
            {group.code}: {group.name}
          </span>
        </div>
      </div>

      <div className="p-4 bg-white divide-y divide-slate-100">
        {group.criteria.map((criterion) => (
          <div key={criterion.id} className="py-3 first:pt-0 last:pb-0">
            <h4 className="text-xs font-bold text-slate-800 flex items-center justify-between mb-2">
              <span className="flex items-center gap-1.5">
                <ChevronRight className="w-3.5 h-3.5 text-cop-600" />
                {criterion.code} - {criterion.name}
              </span>
              <span className="text-slate-500 font-semibold">Tối đa {criterion.max_score} điểm</span>
            </h4>

            <div className="ml-5 space-y-2">
              {criterion.indicators.map((ind) => (
                <div
                  key={ind.id}
                  className="flex flex-wrap items-center justify-between gap-2 p-2.5 rounded-lg bg-slate-50 border border-slate-200/60 text-xs"
                >
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-cop-700">{ind.code}</span>
                    <span className="text-slate-700 font-medium">{ind.name}</span>
                    {ind.is_mandatory && (
                      <span
                        className="flex items-center gap-0.5 px-2 py-0.5 rounded bg-rose-50 text-rose-700 border border-rose-200 font-bold text-[10px]"
                        title="Chỉ tiêu bắt buộc khống chế hạ sao khi đạt 0 điểm"
                      >
                        <ShieldAlert className="w-3 h-3 text-rose-600" /> Bắt buộc (*)
                      </span>
                    )}
                  </div>
                  <span className="font-bold text-slate-900 bg-white px-2 py-1 rounded border">
                    {ind.max_score} điểm
                  </span>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
