import React, { useState } from 'react';
import { X, UserCheck, Users, Plus } from 'lucide-react';
import { FarmPlot, MemberAssignment } from '@/services/farmPlotApi';
import { Member } from '@/types/memberTypes';

interface PlotAssignmentModalProps {
  plot: FarmPlot | null;
  members: Member[];
  assignments: MemberAssignment[];
  assignmentsLoading: boolean;
  onClose: () => void;
  onAssign: (memberId: string, role: string) => Promise<void>;
  isAssigning?: boolean;
}

export const PlotAssignmentModal: React.FC<PlotAssignmentModalProps> = ({
  plot,
  members,
  assignments,
  assignmentsLoading,
  onClose,
  onAssign,
  isAssigning = false,
}) => {
  const [selectedMemberId, setSelectedMemberId] = useState(members[0]?.id || '');
  const [role, setRole] = useState('Xã viên canh tác VietGAP');

  if (!plot) return null;

  const handleAssign = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedMemberId) {
      alert('Vui lòng chọn xã viên');
      return;
    }
    await onAssign(selectedMemberId, role);
  };

  const inputCls =
    'w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2 text-xs font-semibold text-slate-800 outline-none transition focus:border-emerald-500 focus:bg-white focus:ring-2 focus:ring-emerald-500/20';

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 p-4 backdrop-blur-xs animate-fade-in text-[13px]"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="w-full max-w-md overflow-hidden rounded-3xl border border-white/60 bg-white shadow-2xl">
        <div className="flex items-center justify-between border-b border-slate-100 bg-gradient-to-r from-emerald-50 to-white px-6 py-4">
          <div>
            <h3 className="font-extrabold text-slate-900 text-base flex items-center gap-2">
              <UserCheck className="w-5 h-5 text-emerald-600" />
              Phân công Xã viên phụ trách
            </h3>
            <p className="text-xs text-slate-400 font-mono mt-0.5">
              Thửa đất: <strong className="text-slate-800">{plot.plot_code}</strong> ({plot.area} ha)
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-xl bg-white text-slate-400 shadow-xs hover:text-slate-700 cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-6 space-y-4 text-xs">
          {/* Current assignments */}
          <div className="space-y-2">
            <h4 className="font-bold text-slate-700 flex items-center gap-1.5">
              <Users className="w-4 h-4 text-emerald-600" />
              Danh sách Xã viên đang phụ trách:
            </h4>
            {assignmentsLoading ? (
              <div className="text-xs text-slate-400 py-4 text-center">Đang tải phân công...</div>
            ) : assignments.length === 0 ? (
              <div className="p-3.5 bg-slate-50 rounded-xl border border-dashed border-slate-200 text-center text-slate-400 text-xs">
                Chưa có xã viên nào được phân công thửa đất này.
              </div>
            ) : (
              <div className="space-y-2 max-h-40 overflow-y-auto pr-1">
                {assignments.map((ma) => (
                  <div
                    key={ma.id}
                    className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between"
                  >
                    <div>
                      <div className="font-bold text-slate-800">
                        {ma.member_name} ({ma.member_code})
                      </div>
                      <div className="text-slate-400 text-[11px] mt-0.5">
                        {ma.role} • Từ ngày {ma.assigned_date}
                      </div>
                    </div>
                    <span className="px-2 py-0.5 bg-emerald-100 text-emerald-800 text-[10px] font-bold rounded-full">
                      Đang phụ trách
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* New assignment form */}
          <form onSubmit={handleAssign} className="pt-3 border-t border-slate-100 space-y-3">
            <h4 className="font-bold text-slate-700 flex items-center gap-1.5">
              <Plus className="w-4 h-4 text-emerald-600" />
              Phân công Xã viên mới:
            </h4>
            <div className="space-y-2">
              <label className="block text-[11px] font-bold text-slate-600">Chọn xã viên *</label>
              <select
                value={selectedMemberId}
                onChange={(e) => setSelectedMemberId(e.target.value)}
                className={inputCls}
                required
              >
                {members.length === 0 ? (
                  <option value="">Không có dữ liệu xã viên</option>
                ) : (
                  members.map((m) => (
                    <option key={m.id} value={m.id}>
                      {m.member_code || m.id.slice(0, 8)} - {m.full_name}
                    </option>
                  ))
                )}
              </select>

              <label className="block text-[11px] font-bold text-slate-600">Vai trò đảm nhận *</label>
              <input
                type="text"
                value={role}
                onChange={(e) => setRole(e.target.value)}
                className={inputCls}
                placeholder="VD: Xã viên canh tác VietGAP / Trưởng nhóm phụ trách"
                required
              />
            </div>

            <button
              type="submit"
              disabled={isAssigning || members.length === 0}
              className="w-full py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs rounded-xl shadow-xs transition active:scale-98 disabled:opacity-50 cursor-pointer"
            >
              {isAssigning ? 'Đang phân công...' : 'Xác nhận Phân công Xã viên'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};
