import React, { useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import {
  Vote as VoteIcon,
  Plus,
  Search,
  Filter,
  CheckCircle2,
  Calendar,
  Users,
  CheckSquare,
} from 'lucide-react';
import { meetingApi, Meeting } from '@/services/meetingApi';
import { useTenantContextStore } from '@/stores/tenantContextStore';
import { MeetingsTable } from '../components/meetings/MeetingsTable';
import { CreateMeetingModal } from '../components/meetings/CreateMeetingModal';
import { CastVoteModal } from '../components/meetings/CastVoteModal';
import { MeetingDetailDrawer } from '../components/meetings/MeetingDetailDrawer';

export const MeetingsPage: React.FC = () => {
  const queryClient = useQueryClient();
  const { activeCooperative } = useTenantContextStore();

  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState('ALL');
  const [statusFilter, setStatusFilter] = useState('ALL');

  // Modals state
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [selectedMeeting, setSelectedMeeting] = useState<Meeting | null>(null);
  const [votingMeeting, setVotingMeeting] = useState<Meeting | null>(null);
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 3500);
  };

  const { data: response, isLoading } = useQuery({
    queryKey: ['meetings', search, typeFilter, statusFilter],
    queryFn: () =>
      meetingApi.getMeetings({
        search: search.trim() || undefined,
        meeting_type: typeFilter !== 'ALL' ? typeFilter : undefined,
        status: statusFilter !== 'ALL' ? statusFilter : undefined,
      }),
  });

  const meetings = response?.data || [];

  // KPI Calculations
  const inProgressCount = meetings.filter((m) => m.status === 'IN_PROGRESS').length;
  const completedCount = meetings.filter((m) => m.status === 'COMPLETED').length;
  const totalVotesRecorded = meetings.reduce((sum, m) => sum + (m.votes_count || 0), 0);

  return (
    <div className="space-y-5 pb-12 animate-fade-in font-sans text-slate-800">
      {/* Toast Notification */}
      {toastMsg && (
        <div className="fixed top-4 right-4 z-50 px-4 py-3 rounded-xl shadow-lg text-white text-xs font-bold flex items-center gap-2 bg-emerald-600 animate-in fade-in">
          <CheckCircle2 className="w-4 h-4" />
          {toastMsg}
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-2 text-xs text-slate-500 font-semibold mb-1">
            <span>QUẢN TRỊ HTX</span>
            <span>/</span>
            <span className="text-emerald-700">ĐẠI HỘI &amp; BIỂU QUYẾT</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2.5">
            <VoteIcon className="w-6 h-6 text-emerald-700" />
            Đại Hội Xã Viên &amp; Biểu Quyết Nghị Quyết
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Quản trị các kỳ Đại hội thành viên thường niên, bất thường và biểu quyết nghị quyết theo Luật HTX 2023.
          </p>
        </div>

        <button
          onClick={() => setIsCreateModalOpen(true)}
          className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-xs flex items-center gap-2 transition-all cursor-pointer w-fit"
        >
          <Plus className="w-4 h-4" />
          Tổ chức cuộc họp mới
        </button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
        <div className="p-4 bg-white rounded-2xl border border-slate-200/80 shadow-2xs">
          <div className="flex items-center justify-between text-slate-500 text-xs font-semibold">
            <span>Tổng số cuộc họp</span>
            <Calendar className="w-4 h-4 text-blue-600" />
          </div>
          <div className="mt-2 text-2xl font-black text-slate-900 font-mono">
            {meetings.length}
          </div>
          <p className="text-[11px] text-slate-400 mt-0.5">
            {completedCount} kỳ đại hội đã bế mạc
          </p>
        </div>

        <div className="p-4 bg-white rounded-2xl border border-slate-200/80 shadow-2xs">
          <div className="flex items-center justify-between text-slate-500 text-xs font-semibold">
            <span>Đang mở biểu quyết</span>
            <CheckSquare className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="mt-2 text-2xl font-black text-emerald-700 font-mono">
            {inProgressCount}
          </div>
          <p className="text-[11px] text-slate-400 mt-0.5">
            Cử tri / Xã viên đang bỏ phiếu
          </p>
        </div>

        <div className="p-4 bg-white rounded-2xl border border-slate-200/80 shadow-2xs">
          <div className="flex items-center justify-between text-slate-500 text-xs font-semibold">
            <span>Phiếu biểu quyết ghi nhận</span>
            <Users className="w-4 h-4 text-purple-600" />
          </div>
          <div className="mt-2 text-2xl font-black text-slate-900 font-mono">
            {totalVotesRecorded}
          </div>
          <p className="text-[11px] text-slate-400 mt-0.5">
            Chống gian lận biểu quyết theo SHA-256
          </p>
        </div>
      </div>

      {/* Filter Toolbar */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-3.5 shadow-2xs flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Tìm theo tiêu đề, nội dung..."
            className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
          />
        </div>

        <div className="flex items-center gap-2.5 w-full sm:w-auto">
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
          >
            <option value="ALL">Tất cả loại đại hội</option>
            <option value="ANNUAL">Đại hội thường niên</option>
            <option value="EXTRAORDINARY">Đại hội bất thường</option>
            <option value="REGULAR">Họp định kỳ</option>
          </select>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
          >
            <option value="ALL">Tất cả trạng thái</option>
            <option value="IN_PROGRESS">Đang diễn ra</option>
            <option value="PLANNED">Lên kế hoạch</option>
            <option value="COMPLETED">Đã bế mạc</option>
          </select>
        </div>
      </div>

      {/* Main Table */}
      <MeetingsTable
        meetings={meetings}
        isLoading={isLoading}
        onSelectMeeting={(m) => setSelectedMeeting(m)}
        onOpenVoteModal={(m) => setVotingMeeting(m)}
      />

      {/* Modals & Drawers */}
      <CreateMeetingModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onSuccess={() => {
          queryClient.invalidateQueries({ queryKey: ['meetings'] });
          showToast('Đã khởi tạo cuộc họp / đại hội mới thành công!');
        }}
      />

      <CastVoteModal
        isOpen={Boolean(votingMeeting)}
        meeting={votingMeeting}
        onClose={() => setVotingMeeting(null)}
        onSuccess={() => {
          queryClient.invalidateQueries({ queryKey: ['meetings'] });
          if (selectedMeeting?.id) {
            queryClient.invalidateQueries({ queryKey: ['meetingSummaries', selectedMeeting.id] });
            queryClient.invalidateQueries({ queryKey: ['meetingVotes', selectedMeeting.id] });
          }
          showToast('Đã ghi nhận phiếu biểu quyết thành công!');
        }}
      />

      <MeetingDetailDrawer
        meeting={selectedMeeting}
        isOpen={Boolean(selectedMeeting)}
        onClose={() => setSelectedMeeting(null)}
        onOpenVoteModal={(m) => setVotingMeeting(m)}
      />
    </div>
  );
};
