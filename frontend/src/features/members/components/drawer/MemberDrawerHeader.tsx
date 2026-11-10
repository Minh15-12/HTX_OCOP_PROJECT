import React from 'react';
import { Member } from '@/types/memberTypes';
import {
  X,
  Pencil,
  Printer,
  PauseCircle,
  PlayCircle,
  Ban,
  UserCheck,
  UserX,
} from 'lucide-react';

interface MemberDrawerHeaderProps {
  member: Member;
  onClose: () => void;
  onEdit?: (m: Member) => void;
  onPrint?: (m: Member) => void;
  onApprove?: (m: Member) => void;
  onReject?: (m: Member) => void;
  onSuspend?: (m: Member) => void;
  onRestore?: (m: Member) => void;
  onTerminate?: (m: Member) => void;
}

import { MEMBER_TYPE_LABELS } from '@/features/members/constants';

export const MemberDrawerHeader: React.FC<MemberDrawerHeaderProps> = ({
  member,
  onClose,
  onEdit,
  onPrint,
  onApprove,
  onReject,
  onSuspend,
  onRestore,
  onTerminate,
}) => {
  const initials = member.full_name
    .split(' ')
    .filter(Boolean)
    .slice(-2)
    .map((w) => w[0])
    .join('')
    .toUpperCase() || 'XV';

  return (
    <div className="p-5 border-b border-slate-200 bg-white z-10 flex items-center justify-between shrink-0 shadow-xs relative">
      {/* Left: Avatar + Name + Subtitle + Badge */}
      <div className="flex items-center gap-3.5 min-w-0">
        <div className="w-12 h-12 rounded-xl bg-teal-100 text-teal-800 font-black flex items-center justify-center text-lg shadow-xs shrink-0 border border-teal-200">
          {initials}
        </div>
        <div className="min-w-0">
          <div className="flex items-center gap-2.5 flex-wrap">
            <h2 className="text-lg font-black text-slate-900 tracking-tight truncate">
              {member.full_name}
            </h2>
            {member.status === 'ACTIVE' && (
              <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-100 text-emerald-700 border border-emerald-200">
                Đang hoạt động
              </span>
            )}
            {member.status === 'PENDING' && (
              <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-amber-100 text-amber-800 border border-amber-200">
                Chờ duyệt
              </span>
            )}
            {member.status === 'SUSPENDED' && (
              <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-orange-100 text-orange-800 border border-orange-200">
                Tạm đình chỉ
              </span>
            )}
            {member.status === 'TERMINATED' && (
              <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-slate-100 text-slate-600 border border-slate-200">
                Đã chấm dứt
              </span>
            )}
            {member.status === 'REJECTED' && (
              <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-rose-100 text-rose-700 border border-rose-200">
                Đã từ chối
              </span>
            )}
          </div>
          <p className="text-xs text-slate-500 font-medium mt-1 truncate">
            <span className="font-mono text-emerald-800 font-bold">{member.member_code}</span>
            <span className="mx-1.5 text-slate-300">&bull;</span>
            <span>{MEMBER_TYPE_LABELS[member.member_type] || member.member_type}</span>
            <span className="mx-1.5 text-slate-300">&bull;</span>
            <span>{member.occupation || 'Chưa cập nhật'}</span>
          </p>
        </div>
      </div>

      {/* Right: Actions + Close Button */}
      <div className="flex items-center gap-2 shrink-0">
        {member.status === 'PENDING' && onApprove && onReject && (
          <div className="flex items-center gap-1.5 mr-2">
            <button
              onClick={() => onApprove(member)}
              className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-lg shadow-xs flex items-center gap-1 transition-colors"
            >
              <UserCheck className="w-3.5 h-3.5" /> Duyệt
            </button>
            <button
              onClick={() => onReject(member)}
              className="px-3 py-1.5 bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs rounded-lg shadow-xs flex items-center gap-1 transition-colors"
            >
              <UserX className="w-3.5 h-3.5" /> Từ chối
            </button>
          </div>
        )}

        {onPrint && (
          <button
            onClick={() => onPrint(member)}
            className="p-2 text-slate-500 hover:text-emerald-700 hover:bg-emerald-50 rounded-lg border border-slate-200 transition-colors"
            title="In hồ sơ xã viên"
          >
            <Printer className="w-4 h-4" />
          </button>
        )}

        {onEdit && (
          <button
            onClick={() => onEdit(member)}
            className="p-2 text-slate-500 hover:text-blue-700 hover:bg-blue-50 rounded-lg border border-slate-200 transition-colors"
            title="Chỉnh sửa thông tin"
          >
            <Pencil className="w-4 h-4" />
          </button>
        )}

        {member.status === 'ACTIVE' && onSuspend && (
          <button
            onClick={() => onSuspend(member)}
            className="p-2 text-slate-500 hover:text-orange-700 hover:bg-orange-50 rounded-lg border border-slate-200 transition-colors"
            title="Tạm đình chỉ"
          >
            <PauseCircle className="w-4 h-4" />
          </button>
        )}

        {member.status === 'SUSPENDED' && onRestore && (
          <button
            onClick={() => onRestore(member)}
            className="p-2 text-slate-500 hover:text-emerald-700 hover:bg-emerald-50 rounded-lg border border-slate-200 transition-colors"
            title="Khôi phục"
          >
            <PlayCircle className="w-4 h-4" />
          </button>
        )}

        {(member.status === 'ACTIVE' || member.status === 'SUSPENDED') && onTerminate && (
          <button
            onClick={() => onTerminate(member)}
            className="p-2 text-slate-500 hover:text-rose-700 hover:bg-rose-50 rounded-lg border border-slate-200 transition-colors"
            title="Chấm dứt tư cách"
          >
            <Ban className="w-4 h-4" />
          </button>
        )}

        {/* Nút Đóng kiểu thanh lịch */}
        <button
          onClick={onClose}
          className="px-3.5 py-1.5 border border-slate-200 hover:border-slate-300 bg-white hover:bg-slate-50 text-slate-700 font-bold text-xs rounded-lg shadow-2xs flex items-center gap-1.5 transition-colors ml-1 cursor-pointer"
        >
          <span>Đóng</span>
          <X className="w-4 h-4 text-slate-400" />
        </button>
      </div>
    </div>
  );
};
