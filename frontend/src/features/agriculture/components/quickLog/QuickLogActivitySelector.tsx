import React from 'react';
import { Shovel, Sprout, ShieldAlert, Scissors, Wheat } from 'lucide-react';
import type { ActivityType } from '@/types/agriculture';
import { ACTIVITY_TYPES_META } from '@/types/agriculture';

interface QuickLogActivitySelectorProps {
  activityType: ActivityType;
  onSelectActivity: (type: ActivityType) => void;
}

export const QuickLogActivitySelector: React.FC<QuickLogActivitySelectorProps> = ({
  activityType,
  onSelectActivity,
}) => {
  return (
    <div>
      <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
        1. Chọn công việc hôm nay (1 chạm) <span className="text-rose-500">*</span>
      </label>
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
        {(Object.keys(ACTIVITY_TYPES_META) as ActivityType[]).map((key) => {
          const meta = ACTIVITY_TYPES_META[key];
          const isSelected = activityType === key;

          return (
            <button
              key={key}
              type="button"
              onClick={() => onSelectActivity(key)}
              className={`min-h-[54px] p-2.5 rounded-2xl border text-left flex items-center gap-3 transition-all cursor-pointer ${
                isSelected
                  ? 'border-emerald-600 bg-emerald-50 text-emerald-950 shadow-md ring-2 ring-emerald-500/20 font-bold'
                  : 'border-slate-200 bg-white text-slate-700 hover:border-emerald-200 hover:bg-slate-50'
              }`}
            >
              <div
                className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl ${
                  isSelected
                    ? 'bg-emerald-600 text-white shadow-sm'
                    : 'bg-slate-100 text-slate-600'
                }`}
              >
                {key === 'LAND_PREPARATION' && <Shovel className="h-5 w-5" />}
                {key === 'FERTILIZATION' && <Sprout className="h-5 w-5" />}
                {key === 'SPRAYING' && <ShieldAlert className="h-5 w-5" />}
                {key === 'CARE' && <Scissors className="h-5 w-5" />}
                {key === 'HARVEST' && <Wheat className="h-5 w-5" />}
              </div>
              <span className="text-xs leading-snug">{meta.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
};
