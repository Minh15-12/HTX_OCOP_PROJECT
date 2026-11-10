import React from 'react';
import { FileText, Check, Clock, FileWarning } from 'lucide-react';

interface EvidenceKpiCardsProps {
  totalCount: number;
  validCount: number;
  pendingCount: number;
  rejectedCount: number;
}

export const EvidenceKpiCards: React.FC<EvidenceKpiCardsProps> = ({
  totalCount,
  validCount,
  pendingCount,
  rejectedCount,
}) => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      <div className="p-4 bg-white rounded-2xl border border-slate-200 shadow-xs flex items-center justify-between">
        <div className="space-y-1">
          <div className="text-[11.5px] text-slate-500 font-bold">Tổng số tài liệu</div>
          <div className="text-2xl font-black text-slate-900">{totalCount}</div>
          <div className="text-[10.5px] text-emerald-600 font-bold">
            &uarr; 100% <span className="text-slate-400 font-normal">hồ sơ số hóa</span>
          </div>
        </div>
        <div className="w-11 h-11 rounded-2xl bg-emerald-50 text-emerald-600 border border-emerald-100 flex items-center justify-center font-black">
          <FileText className="w-5 h-5" />
        </div>
      </div>

      <div className="p-4 bg-white rounded-2xl border border-slate-200 shadow-xs flex items-center justify-between">
        <div className="space-y-1">
          <div className="text-[11.5px] text-slate-500 font-bold">Tài liệu hợp lệ</div>
          <div className="text-2xl font-black text-slate-900">{validCount}</div>
          <div className="text-[10.5px] text-emerald-600 font-bold">
            &uarr; {totalCount > 0 ? ((validCount / totalCount) * 100).toFixed(0) : 0}%
          </div>
        </div>
        <div className="w-11 h-11 rounded-2xl bg-sky-50 text-sky-600 border border-sky-100 flex items-center justify-center font-black">
          <Check className="w-5 h-5 stroke-[3]" />
        </div>
      </div>

      <div className="p-4 bg-white rounded-2xl border border-slate-200 shadow-xs flex items-center justify-between">
        <div className="space-y-1">
          <div className="text-[11.5px] text-slate-500 font-bold">Chờ duyệt / Thiếu</div>
          <div className="text-2xl font-black text-slate-900">{pendingCount}</div>
          <div className="text-[10.5px] text-amber-600 font-bold">&uarr; {pendingCount} hồ sơ</div>
        </div>
        <div className="w-11 h-11 rounded-2xl bg-amber-50 text-amber-600 border border-amber-100 flex items-center justify-center font-black">
          <Clock className="w-5 h-5" />
        </div>
      </div>

      <div className="p-4 bg-white rounded-2xl border border-slate-200 shadow-xs flex items-center justify-between">
        <div className="space-y-1">
          <div className="text-[11.5px] text-slate-500 font-bold">Bị từ chối</div>
          <div className="text-2xl font-black text-slate-900">{rejectedCount}</div>
          <div className="text-[10.5px] text-rose-600 font-bold">&darr; {rejectedCount} hồ sơ</div>
        </div>
        <div className="w-11 h-11 rounded-2xl bg-rose-50 text-rose-600 border border-rose-100 flex items-center justify-center font-black">
          <FileWarning className="w-5 h-5" />
        </div>
      </div>
    </div>
  );
};
