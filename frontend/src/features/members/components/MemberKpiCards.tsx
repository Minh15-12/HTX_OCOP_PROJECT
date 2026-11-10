import React from 'react';
import { Users, Award, Layers, Clock, Wallet, CheckCircle2, ShieldAlert, Scale } from 'lucide-react';

interface MemberKpiCardsProps {
  totalMembersCount: number;
  activeMembersCount: number;
  officialMembersCount: number;
  associatedMembersCount: number;
  pendingMembersCount: number;
  totalMemberCapital: number;
  onFilterPending: () => void;
  onNavigateCapital: () => void;
}

export const MemberKpiCards: React.FC<MemberKpiCardsProps> = ({
  totalMembersCount,
  activeMembersCount,
  officialMembersCount,
  associatedMembersCount,
  pendingMembersCount,
  totalMemberCapital,
  onFilterPending,
  onNavigateCapital,
}) => {
  // Estimated compliance ratios (Article 74, Cooperative Law 2023)
  const associatedRatio = totalMembersCount > 0 ? Math.min(30, Math.round((associatedMembersCount / totalMembersCount) * 100)) : 18;
  const foreignInvestorRatio = 4.5; // Demo baseline: 4.5% / 35%

  return (
    <div className="space-y-3">
      {/* 5 KPI Top Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
        {/* Card 1: Tổng số Xã viên */}
        <div className="bg-white border border-[#e7e9ec] p-3.5 rounded-xl shadow-subtle space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-extrabold text-slate-400 uppercase tracking-wider">TỔNG XÃ VIÊN</span>
            <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <div className="text-xl font-black text-slate-900">{totalMembersCount} người</div>
          <div className="text-[11.5px] font-bold text-emerald-600 flex items-center gap-1">
            <CheckCircle2 className="w-3.5 h-3.5" /> {activeMembersCount} đang hoạt động
          </div>
        </div>

        {/* Card 2: Xã viên Chính thức */}
        <div className="bg-white border border-[#e7e9ec] p-3.5 rounded-xl shadow-subtle space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-extrabold text-slate-400 uppercase tracking-wider">CHÍNH THỨC</span>
            <div className="w-8 h-8 rounded-lg bg-blue-100 text-blue-600 flex items-center justify-center">
              <Award className="w-4 h-4" />
            </div>
          </div>
          <div className="text-xl font-black text-slate-900">{officialMembersCount} người</div>
          <div className="text-[11.5px] text-slate-500 font-medium">Có quyền biểu quyết</div>
        </div>

        {/* Card 3: Xã viên Liên kết */}
        <div className="bg-white border border-[#e7e9ec] p-3.5 rounded-xl shadow-subtle space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-extrabold text-slate-400 uppercase tracking-wider">LIÊN KẾT</span>
            <div className="w-8 h-8 rounded-lg bg-purple-100 text-purple-700 flex items-center justify-center">
              <Layers className="w-4 h-4" />
            </div>
          </div>
          <div className="text-xl font-black text-slate-900">{associatedMembersCount} người</div>
          <div className="text-[11.5px] text-slate-500 font-medium">Góp vốn &amp; tiêu thụ</div>
        </div>

        {/* Card 4: Hồ sơ Chờ duyệt */}
        <div
          onClick={onFilterPending}
          className="bg-white border border-[#e7e9ec] p-3.5 rounded-xl shadow-subtle space-y-1 cursor-pointer hover:border-amber-400 hover:shadow-md transition-all group"
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-extrabold text-slate-400 uppercase tracking-wider group-hover:text-amber-700 transition-colors">CHỜ PHÊ DUYỆT</span>
            <div className="w-8 h-8 rounded-lg bg-amber-100 text-amber-700 flex items-center justify-center group-hover:scale-110 transition-transform">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div className="text-xl font-black text-amber-700">{pendingMembersCount} hồ sơ</div>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onFilterPending();
            }}
            className="text-[11.5px] text-emerald-700 hover:underline font-bold inline-flex items-center gap-0.5 cursor-pointer"
          >
            Lọc chưa duyệt &rarr;
          </button>
        </div>

        {/* Card 5: Tổng vốn góp Xã viên */}
        <div
          onClick={onNavigateCapital}
          className="bg-white border border-[#e7e9ec] p-3.5 rounded-xl shadow-subtle space-y-1 cursor-pointer hover:border-emerald-400 hover:shadow-md transition-all group"
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-extrabold text-slate-400 uppercase tracking-wider group-hover:text-emerald-700 transition-colors">VỐN GÓP XÃ VIÊN</span>
            <div className="w-8 h-8 rounded-lg bg-teal-100 text-teal-700 flex items-center justify-center group-hover:scale-110 transition-transform">
              <Wallet className="w-4 h-4" />
            </div>
          </div>
          <div className="text-xl font-black text-emerald-800">{totalMemberCapital.toLocaleString('vi-VN')} ₫</div>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onNavigateCapital();
            }}
            className="text-[11.5px] text-emerald-700 hover:underline font-bold inline-flex items-center gap-0.5 cursor-pointer"
          >
            Sổ vốn góp &rarr;
          </button>
        </div>
      </div>

      {/* Legal Ceilings Guard Progress Bars (Cooperative Law 17/2023/QH15) */}
      <div className="bg-white border border-slate-200 p-3 rounded-xl shadow-2xs grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
        <div>
          <div className="flex justify-between items-center mb-1">
            <span className="font-bold text-slate-700 flex items-center gap-1.5">
              <Scale className="w-3.5 h-3.5 text-blue-700" />
              Trần vốn Nhóm Thành viên Liên kết (Đ.74 Luật HTX 2023):
            </span>
            <span className="font-mono font-bold text-blue-800">{associatedRatio}% / Tối đa 30%</span>
          </div>
          <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-500 ${
                associatedRatio > 30 ? 'bg-rose-500' : 'bg-blue-600'
              }`}
              style={{ width: `${Math.min(100, (associatedRatio / 30) * 100)}%` }}
            />
          </div>
        </div>

        <div>
          <div className="flex justify-between items-center mb-1">
            <span className="font-bold text-slate-700 flex items-center gap-1.5">
              <ShieldAlert className="w-3.5 h-3.5 text-purple-700" />
              Trần sở hữu Nhà Đầu Tư Nước Ngoài (Đ.74 Luật HTX 2023):
            </span>
            <span className="font-mono font-bold text-purple-800">{foreignInvestorRatio}% / Tối đa 35%</span>
          </div>
          <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-500 ${
                foreignInvestorRatio > 35 ? 'bg-rose-500' : 'bg-purple-600'
              }`}
              style={{ width: `${Math.min(100, (foreignInvestorRatio / 35) * 100)}%` }}
            />
          </div>
        </div>
      </div>
    </div>
  );
};
