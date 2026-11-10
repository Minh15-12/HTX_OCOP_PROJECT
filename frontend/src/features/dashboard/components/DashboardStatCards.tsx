import React from 'react';
import { Users, Sprout, Warehouse, Coins, AlertTriangle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface DashboardStatCardsProps {
  activeMembersCount: number;
  totalMembersCount: number;
  pendingMembersCount: number;
  totalPlotArea: number;
  plotsCount: number;
  lowStockCount: number;
}

export const DashboardStatCards: React.FC<DashboardStatCardsProps> = ({
  activeMembersCount,
  totalMembersCount,
  pendingMembersCount,
  totalPlotArea,
  plotsCount,
  lowStockCount,
}) => {
  const navigate = useNavigate();

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
      {/* Card 1: Members */}
      <div className="bg-white border border-[#e7e9ec] rounded-xl p-4 shadow-subtle flex items-start gap-3.5 hover:shadow-panel transition-all">
        <div className="w-11 h-11 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0 border border-emerald-100">
          <Users className="w-5.5 h-5.5" />
        </div>
        <div className="cursor-pointer" onClick={() => navigate('/members')}>
          <div className="text-[12px] text-slate-500 font-medium hover:text-emerald-700 transition-colors">
            Xã viên hoạt động
          </div>
          <div className="text-2xl font-black text-slate-900 mt-0.5">
            {activeMembersCount}{' '}
            <span className="text-sm font-semibold text-slate-400">/ {totalMembersCount}</span>
          </div>
          <div className="text-[11.3px] text-slate-500 mt-0.5 font-medium flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-500"></span>
            {pendingMembersCount} xã viên chờ duyệt
          </div>
        </div>
      </div>

      {/* Card 2: Zones */}
      <div className="bg-white border border-[#e7e9ec] rounded-xl p-4 shadow-subtle flex items-start gap-3.5 hover:shadow-panel transition-all">
        <div className="w-11 h-11 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0 border border-blue-100">
          <Sprout className="w-5.5 h-5.5" />
        </div>
        <div className="cursor-pointer" onClick={() => navigate('/agriculture/plots')}>
          <div className="text-[12px] text-slate-500 font-medium hover:text-blue-700 transition-colors">
            Diện tích vùng trồng
          </div>
          <div className="text-2xl font-black text-slate-900 mt-0.5">
            {totalPlotArea > 0 ? `${totalPlotArea.toFixed(1)} ha` : '0 ha'}
          </div>
          <div className="text-[11.3px] text-emerald-600 font-bold mt-0.5">
            {plotsCount > 0 ? `${plotsCount} thửa đất / vùng canh tác` : 'Chưa có vùng trồng'}
          </div>
        </div>
      </div>

      {/* Card 3: Low Stock */}
      <div className="bg-white border border-[#e7e9ec] rounded-xl p-4 shadow-subtle flex items-start gap-3.5 hover:shadow-panel transition-all">
        <div className="w-11 h-11 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center shrink-0 border border-amber-100">
          <Warehouse className="w-5.5 h-5.5" />
        </div>
        <div className="cursor-pointer" onClick={() => navigate('/inventory/materials')}>
          <div className="text-[12px] text-slate-500 font-medium hover:text-amber-700 transition-colors">
            Vật tư dưới ngưỡng tồn
          </div>
          <div className="text-2xl font-black text-slate-900 mt-0.5">{lowStockCount}</div>
          <div className="text-[11.3px] text-amber-700 font-bold mt-0.5 flex items-center gap-1">
            <AlertTriangle className="w-3 h-3" />
            {lowStockCount > 0
              ? `${lowStockCount} mặt hàng cần nhập bổ sung`
              : 'Tất cả vật tư ở ngưỡng an toàn'}
          </div>
        </div>
      </div>

      {/* Card 4: Receivables/Debt */}
      <div className="bg-white border border-[#e7e9ec] rounded-xl p-4 shadow-subtle flex items-start gap-3.5 hover:shadow-panel transition-all">
        <div className="w-11 h-11 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center shrink-0 border border-purple-100">
          <Coins className="w-5.5 h-5.5" />
        </div>
        <div className="cursor-pointer" onClick={() => navigate('/finance')}>
          <div className="text-[12px] text-slate-500 font-medium hover:text-purple-700 transition-colors">
            Công nợ xã viên
          </div>
          <div className="text-2xl font-black text-slate-900 mt-0.5">Theo dõi thời gian thực</div>
          <div className="text-[11.3px] text-purple-700 font-bold mt-0.5">
            Cấn trừ vụ thu hoạch tự động
          </div>
        </div>
      </div>
    </div>
  );
};
