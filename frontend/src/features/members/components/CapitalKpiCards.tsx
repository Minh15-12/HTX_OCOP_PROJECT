import React from 'react';
import {
  Wallet,
  CheckCircle2,
  AlertCircle,
  TrendingUp,
  Users,
  MapPin,
  ShieldAlert,
} from 'lucide-react';
import { Member, CapitalTransaction } from '@/types/memberTypes';

interface CapitalKpiCardsProps {
  members: Member[];
  transactions: CapitalTransaction[];
  totalCommittedCapital: number;
  totalContributedCapital: number;
  totalRemainingCapital: number;
  overallCapitalPct: number;
  associateGroupPct: number;
  isAssociateGroupOverLimit: boolean;
  totalLandAreaSqm?: number;
  onOpenPendingModal: () => void;
  triggerToast: (msg: string, type?: 'success' | 'danger') => void;
}

export const CapitalKpiCards: React.FC<CapitalKpiCardsProps> = ({
  members,
  transactions,
  totalCommittedCapital,
  totalContributedCapital,
  totalRemainingCapital,
  overallCapitalPct,
  associateGroupPct,
  isAssociateGroupOverLimit,
  totalLandAreaSqm = 45000,
  onOpenPendingModal,
  triggerToast,
}) => {
  const pendingCount = transactions.filter((t) => t.status === 'PENDING').length;
  const incompleteMembersCount = members.filter((m) => m.capital_status === 'CHUA_DU').length;

  return (
    <div className="space-y-4">
      {/* LAW 2023 WARNING BANNER IF ASSOCIATE GROUP OVER LIMIT */}
      {isAssociateGroupOverLimit && (
        <div className="bg-amber-50 border border-amber-200 p-3.5 rounded-xl flex items-center justify-between text-xs font-bold text-amber-900 shadow-xs">
          <div className="flex items-center gap-2.5">
            <ShieldAlert className="w-5 h-5 text-amber-600 shrink-0" />
            <span>
              CẢNH BÁO LUẬT HTX 2023: Tổng vốn nhóm Thành viên liên kết ({associateGroupPct}%) vượt giới hạn tối đa 30% vốn điều lệ. Cần tạm dừng kết nạp liên kết mới!
            </span>
          </div>
          <button
            onClick={() => triggerToast('Đã gửi thông báo cảnh báo đến HĐQT HTX!', 'danger')}
            className="px-3 py-1 bg-amber-600 hover:bg-amber-700 text-white rounded-lg text-[11px] transition-colors"
          >
            Xem nghị quyết
          </button>
        </div>
      )}

      {/* TOP 6 KPI STATS CARDS - MODERN GLASSMORPHISM */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-4">
        {/* Card 1: Tổng vốn cam kết */}
        <div className="bg-white/90 backdrop-blur-md border border-white/60 p-5 rounded-2xl shadow-xl shadow-slate-200/40 relative overflow-hidden group hover:-translate-y-1 transition-all duration-300">
          <div className="absolute -right-4 -top-4 w-20 h-20 bg-gradient-to-br from-emerald-100 to-emerald-50 rounded-full blur-2xl opacity-60 group-hover:scale-150 transition-transform duration-500 pointer-events-none"></div>
          <div className="flex items-center justify-between relative z-10">
            <span className="text-xs font-extrabold text-slate-500 uppercase tracking-wider">Tổng vốn góp</span>
            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-emerald-100 to-emerald-200 text-emerald-700 flex items-center justify-center shadow-sm">
              <Wallet className="w-4 h-4" />
            </div>
          </div>
          <div className="text-xl font-black text-slate-900 mt-2 relative z-10">
            {totalCommittedCapital.toLocaleString('vi-VN')} ₫
          </div>
          <div className="text-xs font-bold text-emerald-600 flex items-center gap-1 mt-1.5 relative z-10">
            <TrendingUp className="w-3.5 h-3.5" /> +8,5% so với năm trước
          </div>
        </div>

        {/* Card 2: Đã góp */}
        <div className="bg-white/90 backdrop-blur-md border border-white/60 p-5 rounded-2xl shadow-xl shadow-slate-200/40 relative overflow-hidden group hover:-translate-y-1 transition-all duration-300">
          <div className="absolute -right-4 -top-4 w-20 h-20 bg-gradient-to-br from-blue-100 to-blue-50 rounded-full blur-2xl opacity-60 group-hover:scale-150 transition-transform duration-500 pointer-events-none"></div>
          <div className="flex items-center justify-between relative z-10">
            <span className="text-xs font-extrabold text-slate-500 uppercase tracking-wider">Đã góp</span>
            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-blue-100 to-blue-200 text-blue-700 flex items-center justify-center shadow-sm">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <div className="text-xl font-black text-slate-900 mt-2 relative z-10">
            {totalContributedCapital.toLocaleString('vi-VN')} ₫
          </div>
          <div className="w-full bg-slate-100 rounded-full h-2 mt-2.5 overflow-hidden relative z-10 shadow-inner">
            <div
              className="bg-gradient-to-r from-blue-500 to-blue-600 h-2 rounded-full transition-all duration-1000 shadow-[0_0_10px_rgba(37,99,235,0.4)]"
              style={{ width: `${Math.min(overallCapitalPct, 100)}%` }}
            ></div>
          </div>
        </div>

        {/* Card 3: Còn phải góp */}
        <div className="bg-white/90 backdrop-blur-md border border-white/60 p-5 rounded-2xl shadow-xl shadow-slate-200/40 relative overflow-hidden group hover:-translate-y-1 transition-all duration-300">
          <div className="absolute -right-4 -top-4 w-20 h-20 bg-gradient-to-br from-amber-100 to-amber-50 rounded-full blur-2xl opacity-60 group-hover:scale-150 transition-transform duration-500 pointer-events-none"></div>
          <div className="flex items-center justify-between relative z-10">
            <span className="text-xs font-extrabold text-slate-500 uppercase tracking-wider">Còn phải góp</span>
            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-amber-100 to-amber-200 text-amber-700 flex items-center justify-center shadow-sm">
              <AlertCircle className="w-4 h-4" />
            </div>
          </div>
          <div className="text-xl font-black text-amber-600 mt-2 relative z-10">
            {totalRemainingCapital.toLocaleString('vi-VN')} ₫
          </div>
          <div className="text-xs text-slate-500 font-semibold mt-1.5 relative z-10">
            <span className="text-amber-600 font-bold bg-amber-50 px-1.5 py-0.5 rounded">
              {incompleteMembersCount}
            </span>{' '}
            xã viên chưa đủ
          </div>
        </div>

        {/* Card 4: Khối liên kết */}
        <div className="bg-white/90 backdrop-blur-md border border-white/60 p-5 rounded-2xl shadow-xl shadow-slate-200/40 relative overflow-hidden group hover:-translate-y-1 transition-all duration-300">
          <div className="absolute -right-4 -top-4 w-20 h-20 bg-gradient-to-br from-purple-100 to-purple-50 rounded-full blur-2xl opacity-60 group-hover:scale-150 transition-transform duration-500 pointer-events-none"></div>
          <div className="flex items-center justify-between relative z-10">
            <span className="text-xs font-extrabold text-slate-500 uppercase tracking-wider">Khối liên kết</span>
            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-purple-100 to-purple-200 text-purple-700 flex items-center justify-center shadow-sm">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <div className="text-xl font-black text-slate-900 mt-2 relative z-10">
            {associateGroupPct}% <span className="text-xs text-slate-400 font-medium">(Max 30%)</span>
          </div>
          <div className="w-full bg-slate-100 rounded-full h-2 mt-2.5 overflow-hidden relative z-10 shadow-inner">
            <div
              className={`h-2 rounded-full transition-all duration-1000 ${
                isAssociateGroupOverLimit
                  ? 'bg-rose-500'
                  : 'bg-gradient-to-r from-purple-500 to-purple-600'
              }`}
              style={{ width: `${Math.min(associateGroupPct, 100)}%` }}
            ></div>
          </div>
        </div>

        {/* Card 5: Ruộng đất góp vốn */}
        <div className="bg-white/90 backdrop-blur-md border border-white/60 p-5 rounded-2xl shadow-xl shadow-slate-200/40 relative overflow-hidden group hover:-translate-y-1 transition-all duration-300">
          <div className="absolute -right-4 -top-4 w-20 h-20 bg-gradient-to-br from-teal-100 to-teal-50 rounded-full blur-2xl opacity-60 group-hover:scale-150 transition-transform duration-500 pointer-events-none"></div>
          <div className="flex items-center justify-between relative z-10">
            <span className="text-xs font-extrabold text-slate-500 uppercase tracking-wider">Đất góp vốn</span>
            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-teal-100 to-teal-200 text-teal-700 flex items-center justify-center shadow-sm">
              <MapPin className="w-4 h-4" />
            </div>
          </div>
          <div className="text-xl font-black text-slate-900 mt-2 relative z-10">
            {totalLandAreaSqm.toLocaleString('vi-VN')} <span className="text-sm">m²</span>
          </div>
          <div className="text-xs text-teal-600 font-semibold mt-1.5 relative z-10 bg-teal-50 inline-block px-2 py-0.5 rounded-md border border-teal-100">
            Đã sang tên HTX
          </div>
        </div>

        {/* Card 6: Chờ duyệt */}
        <div
          onClick={onOpenPendingModal}
          className="bg-gradient-to-br from-white to-rose-50/50 backdrop-blur-md border border-rose-100/60 p-5 rounded-2xl shadow-xl shadow-rose-200/40 relative overflow-hidden group hover:-translate-y-1 hover:border-rose-300 transition-all duration-300 cursor-pointer"
        >
          <div className="absolute -right-4 -top-4 w-20 h-20 bg-gradient-to-br from-rose-200 to-rose-100 rounded-full blur-2xl opacity-60 group-hover:scale-150 transition-transform duration-500 pointer-events-none"></div>
          <div className="flex items-center justify-between relative z-10">
            <span className="text-xs font-extrabold text-rose-500 uppercase tracking-wider group-hover:text-rose-700 transition-colors">
              Chờ duyệt
            </span>
            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-rose-100 to-rose-200 text-rose-700 flex items-center justify-center shadow-sm group-hover:scale-110 transition-transform">
              <AlertCircle className="w-4 h-4" />
            </div>
          </div>
          <div className="text-xl font-black text-rose-700 mt-2 relative z-10">
            {pendingCount} <span className="text-sm font-bold">giao dịch</span>
          </div>
          <div className="text-xs text-rose-600 font-bold mt-1.5 relative z-10 flex items-center gap-1 group-hover:underline">
            Xem chi tiết &rarr;
          </div>
        </div>
      </div>
    </div>
  );
};
