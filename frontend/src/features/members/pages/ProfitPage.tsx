import React, { useState, useEffect } from 'react';
import { PieChart, Search, CheckCircle2 } from 'lucide-react';
import { SurplusDistributionPlan, SurplusDistributionItem } from '@/types/memberTypes';
import { mockSurplusPlan, mockSurplusItems } from '@/services/memberService';
import { formatCurrency } from '@/utils/formatters';

export const ProfitPage: React.FC = () => {
  const [plan, setPlan] = useState<SurplusDistributionPlan | null>(null);
  const [items, setItems] = useState<SurplusDistributionItem[]>([]);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    setPlan(mockSurplusPlan);
    setItems(mockSurplusItems);
  }, []);

  if (!plan) return null;

  const filteredItems = items.filter(i => 
    i.member_name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    i.member_code.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8 animate-in fade-in duration-500">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 bg-amber-600 rounded-3xl p-8 text-white shadow-xl shadow-amber-600/20">
        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-white/20 backdrop-blur-md rounded-2xl">
              <PieChart className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-3xl font-bold tracking-tight">Phân phối Lợi nhuận</h1>
          </div>
          <p className="text-amber-50 text-lg max-w-2xl leading-relaxed">
            Công thức phân chia thặng dư theo Luật HTX 2023. Đảm bảo tỷ lệ 30% theo Vốn góp và 70% theo Doanh số dịch vụ nội bộ.
          </p>
        </div>
      </div>

      {/* Analytics Dashboard */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm col-span-1 lg:col-span-2">
          <h2 className="text-xl font-bold text-slate-800 mb-6">Tổng quan Quỹ Phân chia {plan.fiscal_year}</h2>
          
          <div className="grid grid-cols-2 gap-4 mb-6">
            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
              <div className="text-sm font-semibold text-slate-500 mb-1">Tổng lợi nhuận ròng</div>
              <div className="text-2xl font-bold text-slate-800">{formatCurrency(plan.total_net_profit)} ₫</div>
            </div>
            <div className="p-4 bg-emerald-50 rounded-2xl border border-emerald-100">
              <div className="text-sm font-semibold text-emerald-600 mb-1">Dành cho Xã viên ({plan.member_share_rate}%)</div>
              <div className="text-2xl font-bold text-emerald-700">{formatCurrency(plan.member_share_amount)} ₫</div>
            </div>
          </div>

          <h3 className="text-sm font-bold text-slate-700 mb-3">Công thức phân bổ chi tiết:</h3>
          <div className="flex h-8 rounded-full overflow-hidden text-xs font-bold text-white mb-2">
            <div className="bg-blue-500 h-full flex items-center justify-center" style={{ width: '30%' }}>30% theo Vốn Góp</div>
            <div className="bg-amber-500 h-full flex items-center justify-center" style={{ width: '70%' }}>70% theo Doanh số (Mức độ sử dụng dịch vụ)</div>
          </div>
          <div className="flex justify-between text-sm font-medium text-slate-600">
            <span>{formatCurrency(plan.member_share_amount * 0.3)} ₫</span>
            <span>{formatCurrency(plan.member_share_amount * 0.7)} ₫</span>
          </div>
        </div>

        <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm">
          <h2 className="text-lg font-bold text-slate-800 mb-4">Trích lập các quỹ khác</h2>
          <div className="space-y-4">
            <div>
              <div className="flex justify-between text-sm font-semibold text-slate-700 mb-1">
                <span>Quỹ đầu tư phát triển ({plan.reserve_fund_rate}%)</span>
                <span>{formatCurrency(plan.reserve_fund_amount)} ₫</span>
              </div>
              <div className="w-full bg-slate-100 rounded-full h-2">
                <div className="bg-indigo-500 h-2 rounded-full" style={{ width: `${plan.reserve_fund_rate}%` }}></div>
              </div>
            </div>
            <div>
              <div className="flex justify-between text-sm font-semibold text-slate-700 mb-1">
                <span>Quỹ phúc lợi ({plan.welfare_fund_rate}%)</span>
                <span>{formatCurrency(plan.welfare_fund_amount)} ₫</span>
              </div>
              <div className="w-full bg-slate-100 rounded-full h-2">
                <div className="bg-pink-500 h-2 rounded-full" style={{ width: `${plan.welfare_fund_rate}%` }}></div>
              </div>
            </div>
            <div>
              <div className="flex justify-between text-sm font-semibold text-slate-700 mb-1">
                <span>Quỹ chung không chia</span>
                <span>{formatCurrency(plan.unallocated_common_fund_amount)} ₫</span>
              </div>
              <div className="w-full bg-slate-100 rounded-full h-2">
                <div className="bg-slate-500 h-2 rounded-full" style={{ width: '5%' }}></div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="space-y-6">
        <div className="flex flex-col md:flex-row gap-4 justify-between items-center bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
          <div className="relative w-full md:w-96">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
            <input 
              type="text" 
              placeholder="Tìm kiếm xã viên nhận thưởng..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 transition-all"
            />
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 text-sm">
                  <th className="px-6 py-4 font-semibold">Xã viên</th>
                  <th className="px-6 py-4 font-semibold">Vốn góp (30%)</th>
                  <th className="px-6 py-4 font-semibold">Doanh số (70%)</th>
                  <th className="px-6 py-4 font-semibold">Tổng nhận</th>
                  <th className="px-6 py-4 font-semibold">Trạng thái</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredItems.map((item) => (
                  <tr key={item.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="font-semibold text-slate-800 text-base">{item.member_name}</div>
                      <div className="text-slate-500 text-sm">{item.member_code}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="font-medium text-slate-700">{formatCurrency(item.capital_share_amount)} ₫</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="font-medium text-slate-700">{formatCurrency(item.service_share_amount)} ₫</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="font-bold text-emerald-600">{formatCurrency(item.total_payout_amount)} ₫</div>
                    </td>
                    <td className="px-6 py-4">
                      {item.payout_status === 'DA_NHAN' ? (
                        <span className="flex items-center gap-1.5 text-green-700 bg-green-50 px-3 py-1 rounded-full text-xs font-semibold border border-green-200 w-max">
                          <CheckCircle2 className="w-3.5 h-3.5" /> Đã nhận
                        </span>
                      ) : (
                        <span className="flex items-center gap-1.5 text-slate-700 bg-slate-100 px-3 py-1 rounded-full text-xs font-semibold border border-slate-200 w-max">
                          Chờ chi trả
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};
