import React from 'react';
import { Meeting } from '@/services/meetingApi';
import { Calendar, Users, Eye, CheckSquare, Clock, AlertCircle } from 'lucide-react';

interface MeetingsTableProps {
  meetings: Meeting[];
  isLoading: boolean;
  onSelectMeeting: (m: Meeting) => void;
  onOpenVoteModal: (m: Meeting) => void;
}

export const MeetingsTable: React.FC<MeetingsTableProps> = ({
  meetings,
  isLoading,
  onSelectMeeting,
  onOpenVoteModal,
}) => {
  const getTypeBadge = (type: string) => {
    switch (type) {
      case 'ANNUAL':
        return (
          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-blue-50 text-blue-700 border border-blue-200">
            Đại hội thường niên
          </span>
        );
      case 'EXTRAORDINARY':
        return (
          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-purple-50 text-purple-700 border border-purple-200">
            Đại hội bất thường
          </span>
        );
      default:
        return (
          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-100 text-slate-700 border border-slate-200">
            Họp định kỳ
          </span>
        );
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'IN_PROGRESS':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200 animate-pulse">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-600"></span>
            Đang diễn ra (Mở biểu quyết)
          </span>
        );
      case 'COMPLETED':
        return (
          <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-slate-100 text-slate-700 border border-slate-200">
            Đã bế mạc
          </span>
        );
      case 'CANCELLED':
        return (
          <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-rose-50 text-rose-700 border border-rose-200">
            Đã hủy
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-amber-50 text-amber-700 border border-amber-200">
            <Clock className="w-3 h-3" />
            Lên kế hoạch
          </span>
        );
    }
  };

  if (isLoading) {
    return (
      <div className="bg-white rounded-2xl border border-slate-200/80 overflow-hidden shadow-2xs">
        <div className="p-8 text-center text-slate-400 text-xs flex flex-col items-center justify-center gap-2">
          <div className="w-7 h-7 border-3 border-emerald-600 border-t-transparent rounded-full animate-spin" />
          <span>Đang tải danh sách cuộc họp & đại hội từ hệ thống...</span>
        </div>
      </div>
    );
  }

  if (meetings.length === 0) {
    return (
      <div className="bg-white rounded-2xl border border-slate-200/80 p-12 text-center shadow-2xs">
        <div className="w-12 h-12 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center mx-auto mb-3">
          <AlertCircle className="w-6 h-6" />
        </div>
        <h3 className="text-sm font-bold text-slate-700">Chưa có cuộc họp hoặc đại hội nào</h3>
        <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
          Chưa tìm thấy bản ghi đại hội nào phù hợp với bộ lọc hiện tại. Nhấn nút "Tổ chức cuộc họp mới" để khởi tạo.
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl border border-slate-200/80 overflow-hidden shadow-2xs">
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse text-xs">
          <thead>
            <tr className="bg-slate-50/80 border-b border-slate-200 text-slate-600 font-bold uppercase tracking-wider text-[11px]">
              <th className="py-3 px-4">Tên cuộc họp / Đại hội</th>
              <th className="py-3 px-4">Loại hình</th>
              <th className="py-3 px-4">Ngày tổ chức</th>
              <th className="py-3 px-4">Số phiếu bầu</th>
              <th className="py-3 px-4">Trạng thái</th>
              <th className="py-3 px-4 text-right">Thao tác</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {meetings.map((m) => {
              const canVote = m.status === 'IN_PROGRESS';
              return (
                <tr
                  key={m.id}
                  onClick={() => onSelectMeeting(m)}
                  className="hover:bg-slate-50/80 transition-colors cursor-pointer group"
                >
                  <td className="py-3.5 px-4 font-semibold text-slate-900">
                    <div className="font-bold text-slate-900 group-hover:text-emerald-700 transition-colors">
                      {m.title}
                    </div>
                    {m.description && (
                      <div className="text-[11px] text-slate-400 font-normal break-words mt-0.5">
                        {m.description}
                      </div>
                    )}
                  </td>
                  <td className="py-3.5 px-4 whitespace-nowrap">
                    {getTypeBadge(m.meeting_type)}
                  </td>
                  <td className="py-3.5 px-4 whitespace-nowrap text-slate-600 font-medium">
                    <div className="flex items-center gap-1.5 font-mono">
                      <Calendar className="w-3.5 h-3.5 text-slate-400" />
                      {m.meeting_date}
                    </div>
                  </td>
                  <td className="py-3.5 px-4 whitespace-nowrap font-mono font-semibold text-slate-700">
                    <div className="flex items-center gap-1">
                      <Users className="w-3.5 h-3.5 text-slate-400" />
                      <span>{m.votes_count ?? 0} phiếu</span>
                    </div>
                  </td>
                  <td className="py-3.5 px-4 whitespace-nowrap">
                    {getStatusBadge(m.status)}
                  </td>
                  <td className="py-3.5 px-4 whitespace-nowrap text-right">
                    <div className="flex items-center justify-end gap-1.5" onClick={(e) => e.stopPropagation()}>
                      {canVote && (
                        <button
                          type="button"
                          onClick={() => onOpenVoteModal(m)}
                          className="px-2.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-[11px] font-bold flex items-center gap-1 transition-colors cursor-pointer shadow-2xs"
                        >
                          <CheckSquare className="w-3.5 h-3.5" />
                          Biểu quyết
                        </button>
                      )}
                      <button
                        type="button"
                        onClick={() => onSelectMeeting(m)}
                        className="px-2.5 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-[11px] font-bold flex items-center gap-1 transition-colors cursor-pointer"
                      >
                        <Eye className="w-3.5 h-3.5 text-slate-500" />
                        Chi tiết
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};
