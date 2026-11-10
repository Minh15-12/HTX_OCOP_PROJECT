import React from 'react';
import { AlertTriangle, ArrowRight, ShieldAlert, Clock } from 'lucide-react';
import { TaskItem } from '@/stores/taskNotificationStore';

interface DashboardAlertStripProps {
  criticalCount: number;
  pendingCount: number;
  criticalTasks?: TaskItem[];
  onNavigateToActionHub: () => void;
}

export const DashboardAlertStrip: React.FC<DashboardAlertStripProps> = ({
  criticalCount,
  pendingCount,
  criticalTasks = [],
  onNavigateToActionHub,
}) => {
  if (criticalCount === 0 && pendingCount === 0) {
    return null;
  }

  const firstUrgentTask = criticalTasks[0];

  return (
    <div className="bg-gradient-to-r from-rose-50 via-amber-50/60 to-white border border-rose-200/80 rounded-xl p-3.5 sm:p-4 shadow-subtle flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 transition-all">
      <div className="flex items-start sm:items-center gap-3">
        <div className="w-9 h-9 rounded-lg bg-rose-600 text-white flex items-center justify-center shrink-0 shadow-sm animate-pulse">
          {criticalCount > 0 ? (
            <ShieldAlert className="w-5 h-5" />
          ) : (
            <AlertTriangle className="w-5 h-5" />
          )}
        </div>
        <div>
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-[13px] font-extrabold text-slate-900">
              {criticalCount > 0
                ? `Cảnh báo: Có ${criticalCount} tác vụ khẩn cấp cần giải quyết ngay`
                : `Nhắc việc: Có ${pendingCount} việc cần xử lý trong ngày`}
            </span>
            <span className="pill-badge pill-red text-[10.5px]">Ưu tiên cao</span>
          </div>
          <p className="text-[12px] text-slate-600 mt-0.5 line-clamp-1">
            {firstUrgentTask
              ? `Tác vụ trọng yếu: ${firstUrgentTask.title} (${firstUrgentTask.dueLabel})`
              : 'Vui lòng kiểm tra các phê duyệt tài chính, giám sát cách ly VietGAP và cảnh báo kho vật tư.'}
          </p>
        </div>
      </div>

      <div className="flex items-center gap-2 self-end sm:self-auto shrink-0">
        <button
          onClick={onNavigateToActionHub}
          className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-rose-700 hover:bg-rose-800 text-white text-[12px] font-bold rounded-lg transition-colors shadow-xs cursor-pointer"
        >
          <Clock className="w-3.5 h-3.5" />
          Xử lý ngay tại Trung tâm Tác nghiệp
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
};
