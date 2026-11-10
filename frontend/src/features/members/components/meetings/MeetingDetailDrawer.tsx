import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  X,
  Users,
  Calendar,
  CheckCircle2,
  Clock,
  PlayCircle,
  StopCircle,
  FileText,
  Vote as VoteIcon,
  CheckSquare,
  Printer,
} from 'lucide-react';
import { meetingApi, Meeting, ResolutionSummary, Vote } from '@/services/meetingApi';
import { DataFieldRow } from '@/features/members/components/drawer/common/DataFieldRow';
import { ResolutionsSummaryCard } from './ResolutionsSummaryCard';
import { MeetingMinutesPrintModal } from './MeetingMinutesPrintModal';

interface MeetingDetailDrawerProps {
  meeting: Meeting | null;
  isOpen: boolean;
  onClose: () => void;
  onOpenVoteModal: (m: Meeting) => void;
}

export const MeetingDetailDrawer: React.FC<MeetingDetailDrawerProps> = ({
  meeting,
  isOpen,
  onClose,
  onOpenVoteModal,
}) => {
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState<'overview' | 'votes'>('overview');
  const [isPrintModalOpen, setIsPrintModalOpen] = useState(false);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  // Query summaries
  const { data: summaries = [], isLoading: loadingSummaries } = useQuery<ResolutionSummary[]>({
    queryKey: ['meetingSummaries', meeting?.id],
    queryFn: () => (meeting?.id ? meetingApi.getResolutionsSummary(meeting.id) : Promise.resolve([])),
    enabled: Boolean(isOpen && meeting?.id),
  });

  // Query votes
  const { data: votes = [], isLoading: loadingVotes } = useQuery<Vote[]>({
    queryKey: ['meetingVotes', meeting?.id],
    queryFn: () => (meeting?.id ? meetingApi.getVotes(meeting.id) : Promise.resolve([])),
    enabled: Boolean(isOpen && meeting?.id && activeTab === 'votes'),
  });

  const updateStatusMutation = useMutation({
    mutationFn: (newStatus: 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED') =>
      meeting ? meetingApi.updateMeeting(meeting.id, { status: newStatus }) : Promise.reject(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['meetings'] });
      queryClient.invalidateQueries({ queryKey: ['meetingSummaries', meeting?.id] });
    },
  });

  if (!isOpen || !meeting) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-40 bg-slate-900/40 backdrop-blur-xs transition-opacity animate-fade-in"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Slide-over Panel */}
      <div
        className="fixed inset-y-0 right-0 z-50 w-full max-w-2xl bg-white shadow-2xl flex flex-col border-l border-slate-200 animate-slide-in-right overflow-hidden"
        role="dialog"
        aria-modal="true"
      >
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-200 flex items-start justify-between bg-slate-50/80">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center shrink-0 border border-emerald-200 mt-0.5">
              <VoteIcon className="w-5 h-5" />
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <span className="px-2 py-0.5 text-[10px] font-bold uppercase rounded bg-blue-100 text-blue-800">
                  {meeting.meeting_type === 'ANNUAL'
                    ? 'Đại hội thường niên'
                    : meeting.meeting_type === 'EXTRAORDINARY'
                    ? 'Đại hội bất thường'
                    : 'Họp định kỳ'}
                </span>
                <span
                  className={`px-2.5 py-0.5 text-[10px] font-bold rounded-full ${
                    meeting.status === 'IN_PROGRESS'
                      ? 'bg-emerald-100 text-emerald-800'
                      : meeting.status === 'COMPLETED'
                      ? 'bg-slate-100 text-slate-700'
                      : 'bg-amber-100 text-amber-800'
                  }`}
                >
                  {meeting.status}
                </span>
              </div>
              <h2 className="text-base font-bold text-slate-900 mt-1">{meeting.title}</h2>
              <div className="flex items-center gap-2 text-xs text-slate-500 mt-0.5">
                <Calendar className="w-3.5 h-3.5" />
                <span>Ngày họp: {meeting.meeting_date}</span>
              </div>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-200/60 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-slate-200 px-6 bg-white gap-6">
          <button
            onClick={() => setActiveTab('overview')}
            className={`py-3 text-xs font-bold border-b-2 transition-colors cursor-pointer flex items-center gap-2 ${
              activeTab === 'overview'
                ? 'border-emerald-600 text-emerald-700'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <FileText className="w-4 h-4" />
            Tổng quan &amp; Kết quả Nghị quyết ({summaries.length})
          </button>
          <button
            onClick={() => setActiveTab('votes')}
            className={`py-3 text-xs font-bold border-b-2 transition-colors cursor-pointer flex items-center gap-2 ${
              activeTab === 'votes'
                ? 'border-emerald-600 text-emerald-700'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Users className="w-4 h-4" />
            Phiếu biểu quyết ({meeting.votes_count ?? votes.length})
          </button>
        </div>

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto p-6 space-y-5">
          {activeTab === 'overview' && (
            <>
              {/* Meeting Info Card */}
              <div className="bg-slate-50 rounded-xl p-4 border border-slate-200">
                <h4 className="text-xs font-bold text-slate-800 mb-3 uppercase tracking-wide">
                  Thông tin pháp lý cuộc họp
                </h4>
                <div className="divide-y divide-slate-200/60 text-xs">
                  <DataFieldRow label="Mã cuộc họp" value={meeting.id} isMono />
                  <DataFieldRow
                    label="Hình thức tổ chức"
                    value={
                      meeting.meeting_type === 'ANNUAL'
                        ? 'Đại hội thành viên thường niên'
                        : meeting.meeting_type === 'EXTRAORDINARY'
                        ? 'Đại hội thành viên bất thường'
                        : 'Họp định kỳ Ban Quản trị / Xã viên'
                    }
                  />
                  <DataFieldRow label="Ngày tổ chức" value={meeting.meeting_date} isMono />
                  <DataFieldRow
                    label="Nội dung chương trình"
                    value={meeting.description || 'Chưa cập nhật nội dung chi tiết'}
                  />
                  <DataFieldRow
                    label="Trạng thái hiện tại"
                    value={
                      <span
                        className={`px-2 py-0.5 rounded-full text-[10.5px] font-bold ${
                          meeting.status === 'IN_PROGRESS'
                            ? 'bg-emerald-100 text-emerald-800'
                            : 'bg-slate-100 text-slate-700'
                        }`}
                      >
                        {meeting.status}
                      </span>
                    }
                  />
                </div>
              </div>

              {/* Resolutions Summary */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wide">
                    Kết quả biểu quyết các Nghị quyết
                  </h4>
                  {meeting.status === 'IN_PROGRESS' && (
                    <button
                      onClick={() => onOpenVoteModal(meeting)}
                      className="px-2.5 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-[11px] font-bold flex items-center gap-1 cursor-pointer"
                    >
                      <CheckSquare className="w-3.5 h-3.5" />
                      Bỏ phiếu ngay
                    </button>
                  )}
                </div>
                <ResolutionsSummaryCard summaries={summaries} isLoading={loadingSummaries} />
              </div>
            </>
          )}

          {activeTab === 'votes' && (
            <div>
              {loadingVotes ? (
                <div className="p-8 text-center text-slate-400 text-xs flex items-center justify-center gap-2">
                  <div className="w-4 h-4 border-2 border-emerald-600 border-t-transparent rounded-full animate-spin" />
                  Đang tải danh sách phiếu biểu quyết...
                </div>
              ) : votes.length === 0 ? (
                <div className="p-8 text-center bg-slate-50 rounded-xl border border-dashed border-slate-200 text-slate-500 text-xs">
                  Chưa ghi nhận phiếu biểu quyết nào cho cuộc họp này.
                </div>
              ) : (
                <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
                  <table className="w-full text-left text-xs">
                    <thead>
                      <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold uppercase text-[10px]">
                        <th className="py-2.5 px-3">Xã viên / Cử tri</th>
                        <th className="py-2.5 px-3">Nghị quyết</th>
                        <th className="py-2.5 px-3">Lựa chọn</th>
                        <th className="py-2.5 px-3">Trọng số</th>
                        <th className="py-2.5 px-3 text-right">Thời gian</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 font-medium">
                      {votes.map((v) => (
                        <tr key={v.id} className="hover:bg-slate-50/50">
                          <td className="py-2 px-3 font-semibold text-slate-800">
                            {v.user_name || v.user_id.slice(0, 8)}
                          </td>
                          <td className="py-2 px-3 font-mono font-bold text-blue-700">
                            {v.resolution_code}
                          </td>
                          <td className="py-2 px-3">
                            <span
                              className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                                v.choice === 'FOR'
                                  ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                                  : v.choice === 'AGAINST'
                                  ? 'bg-rose-50 text-rose-700 border border-rose-200'
                                  : 'bg-slate-100 text-slate-700'
                              }`}
                            >
                              {v.choice === 'FOR'
                                ? 'Tán thành'
                                : v.choice === 'AGAINST'
                                ? 'Không tán thành'
                                : 'Phiếu trắng'}
                            </span>
                          </td>
                          <td className="py-2 px-3 font-mono text-slate-600">
                            {v.weight.toFixed(2)}
                          </td>
                          <td className="py-2 px-3 text-right font-mono text-slate-400 text-[11px]">
                            {new Date(v.created_at).toLocaleString('vi-VN')}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="p-4 border-t border-slate-200 bg-slate-50/90 flex flex-wrap items-center justify-between gap-2">
          <div className="flex flex-wrap items-center gap-2">
            {meeting.status === 'PLANNED' && (
              <button
                type="button"
                onClick={() => updateStatusMutation.mutate('IN_PROGRESS')}
                disabled={updateStatusMutation.isPending}
                className="px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer shadow-xs"
              >
                <PlayCircle className="w-4 h-4" />
                Khai mạc &amp; Mở biểu quyết
              </button>
            )}
            {meeting.status === 'IN_PROGRESS' && (
              <button
                type="button"
                onClick={() => updateStatusMutation.mutate('COMPLETED')}
                disabled={updateStatusMutation.isPending}
                className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-900 text-white text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer shadow-xs"
              >
                <StopCircle className="w-4 h-4" />
                Bế mạc đại hội (Khóa biểu quyết)
              </button>
            )}

            <button
              type="button"
              onClick={() => setIsPrintModalOpen(true)}
              className="px-3.5 py-2 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer shadow-xs"
            >
              <Printer className="w-4 h-4" />
              Xuất Biên bản &amp; Nghị quyết (A4)
            </button>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl border border-slate-200 text-xs font-bold text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
          >
            Đóng
          </button>
        </div>
      </div>

      <MeetingMinutesPrintModal
        isOpen={isPrintModalOpen}
        onClose={() => setIsPrintModalOpen(false)}
        meeting={meeting}
        summaries={summaries}
      />
    </>
  );
};
