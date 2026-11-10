import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { Users, UserPlus, Shield, Calendar, UserCheck } from 'lucide-react';
import { FarmPlot, fetchPlotMemberAssignments, MemberAssignment } from '@/services/farmPlotApi';

interface FarmPlotTabAssignmentsProps {
  plot: FarmPlot;
  onOpenAssignments?: (plot: FarmPlot) => void;
}

const roleNames: Record<string, string> = {
  OWNER: 'Chủ sở hữu / Trưởng thửa',
  WORKER: 'Xã viên phụ trách canh tác',
  TECHNICIAN: 'Cán bộ kỹ thuật theo dõi',
  SUPERVISOR: 'Giám sát viên chất lượng',
};

export const FarmPlotTabAssignments: React.FC<FarmPlotTabAssignmentsProps> = ({
  plot,
  onOpenAssignments,
}) => {
  const { data: assignments = [], isLoading } = useQuery<MemberAssignment[]>({
    queryKey: ['plotAssignments', plot.id],
    queryFn: () => fetchPlotMemberAssignments(plot.id),
  });

  return (
    <div className="space-y-4">
      {/* Header bar */}
      <div className="flex items-center justify-between">
        <div>
          <h4 className="text-xs font-extrabold text-slate-800">
            Danh sách nhân sự phụ trách ({assignments.length})
          </h4>
          <p className="text-[11px] text-slate-400">
            Xã viên chịu trách nhiệm canh tác, ghi chép nhật ký và bảo vệ thửa đất.
          </p>
        </div>

        {onOpenAssignments && (
          <button
            type="button"
            onClick={() => onOpenAssignments(plot)}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-300 rounded-xl text-xs font-bold transition cursor-pointer"
          >
            <UserPlus className="w-3.5 h-3.5" />
            Phân công mới
          </button>
        )}
      </div>

      {/* Loading state */}
      {isLoading ? (
        <div className="py-12 text-center text-slate-400">
          <div className="inline-block animate-spin rounded-full h-6 w-6 border-2 border-emerald-600 border-t-transparent mb-2" />
          <p className="text-xs font-semibold">Đang tải danh sách phân công xã viên...</p>
        </div>
      ) : assignments.length === 0 ? (
        <div className="p-8 text-center rounded-2xl border border-dashed border-slate-200 bg-slate-50/70">
          <Users className="w-8 h-8 text-slate-300 mx-auto mb-2" />
          <p className="font-bold text-xs text-slate-700">Chưa có xã viên nào được phân công</p>
          <p className="text-[11px] text-slate-400 max-w-xs mx-auto mt-1">
            Gán xã viên phụ trách thửa đất để liên kết tự động với nhật ký canh tác và kho vật tư.
          </p>
          {onOpenAssignments && (
            <button
              type="button"
              onClick={() => onOpenAssignments(plot)}
              className="mt-3 inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs font-bold transition shadow-xs cursor-pointer"
            >
              <UserPlus className="w-3.5 h-3.5" />
              Gán xã viên ngay
            </button>
          )}
        </div>
      ) : (
        <div className="space-y-2.5">
          {assignments.map((item) => (
            <div
              key={item.id}
              className="p-3.5 rounded-xl border border-slate-200 bg-white hover:border-emerald-200 transition shadow-2xs flex items-center justify-between"
            >
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 flex items-center justify-center font-bold text-xs">
                  <UserCheck className="w-4 h-4 text-emerald-700" />
                </div>
                <div>
                  <div className="font-bold text-xs text-slate-900">{item.member_name}</div>
                  <div className="flex items-center gap-2 mt-0.5 text-[11px] text-slate-400">
                    <span className="font-mono bg-slate-100 px-1 py-0.2 rounded text-slate-600 font-semibold">
                      {item.member_code}
                    </span>
                    <span>•</span>
                    <span className="text-emerald-700 font-semibold">
                      {roleNames[item.role] || item.role}
                    </span>
                  </div>
                </div>
              </div>

              {item.assigned_date && (
                <div className="text-right text-[11px] text-slate-400">
                  <div className="flex items-center gap-1">
                    <Calendar className="w-3 h-3 text-slate-400" />
                    <span>{new Date(item.assigned_date).toLocaleDateString('vi-VN')}</span>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
