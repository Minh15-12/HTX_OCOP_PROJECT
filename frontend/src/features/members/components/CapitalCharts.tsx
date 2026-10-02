import React from 'react';
import { Layers, Users } from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from 'recharts';
import { Member } from '@/types/memberTypes';

interface CapitalChartsProps {
  members: Member[];
  cashTotal?: number;
  bankTotal?: number;
  landTotal?: number;
}

export const CapitalCharts: React.FC<CapitalChartsProps> = ({
  members,
  cashTotal = 985000000,
  bankTotal = 1061000000,
  landTotal = 134000000,
}) => {
  const total = cashTotal + bankTotal + landTotal || 1;

  const pieData = [
    { name: 'Tiền mặt', value: cashTotal, color: '#10b981' },
    { name: 'Chuyển khoản', value: bankTotal, color: '#3b82f6' },
    { name: 'QSDĐ / Hiện vật', value: landTotal, color: '#f59e0b' },
  ];

  const top5Members = [...members]
    .sort(
      (a, b) =>
        (b.contributed_capital || b.total_capital_contributed || 0) -
        (a.contributed_capital || a.total_capital_contributed || 0)
    )
    .slice(0, 5);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
      {/* Monthly Chart */}
      <div className="col-span-1 lg:col-span-2 bg-white border border-[#e7e9ec] rounded-xl shadow-subtle p-4">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-[15px] font-extrabold text-slate-900">
            Biểu đồ tiến độ thu vốn góp 2025
          </h3>
          <div className="flex items-center gap-4 text-xs font-bold text-slate-900">
            <div className="flex items-center gap-1.5">
              <div className="w-3 h-3 rounded-full bg-emerald-500"></div> Cam kết
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-3 h-3 rounded-full bg-blue-500"></div> Đã nộp
            </div>
          </div>
        </div>
        <div className="h-72 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={[
                { name: 'T1', 'Cam kết': 200000000, 'Đã nộp': 180000000 },
                { name: 'T2', 'Cam kết': 250000000, 'Đã nộp': 230000000 },
                { name: 'T3', 'Cam kết': 300000000, 'Đã nộp': 280000000 },
                { name: 'T4', 'Cam kết': 450000000, 'Đã nộp': 400000000 },
                { name: 'T5', 'Cam kết': 500000000, 'Đã nộp': 480000000 },
                { name: 'T6', 'Cam kết': 600000000, 'Đã nộp': 550000000 },
                { name: 'T7', 'Cam kết': 700000000, 'Đã nộp': 650000000 },
                { name: 'T8', 'Cam kết': 320000000, 'Đã nộp': 305000000 },
                { name: 'T9', 'Cam kết': 900000000, 'Đã nộp': 850000000 },
                { name: 'T10', 'Cam kết': 105000000, 'Đã nộp': 95000000 },
                { name: 'T11', 'Cam kết': 115000000, 'Đã nộp': 105000000 },
                { name: 'T12', 'Cam kết': 120000000, 'Đã nộp': 110000000 },
              ]}
              margin={{ top: 10, right: 10, left: 10, bottom: 0 }}
            >
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
              <XAxis
                dataKey="name"
                axisLine={{ stroke: '#e2e8f0' }}
                tickLine={false}
                tick={{ fontSize: 12, fill: '#64748b', fontWeight: 600 }}
                dy={10}
              />
              <RechartsTooltip
                cursor={{ fill: '#f1f5f9' }}
                contentStyle={{
                  borderRadius: '8px',
                  border: 'none',
                  backgroundColor: '#0f172a',
                  color: '#fff',
                  boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
                }}
                itemStyle={{ fontSize: '13px', fontWeight: 500 }}
                labelStyle={{
                  fontSize: '14px',
                  fontWeight: 700,
                  marginBottom: '8px',
                  borderBottom: '1px solid #334155',
                  paddingBottom: '4px',
                }}
                formatter={(value: any) => [Number(value).toLocaleString('vi-VN') + ' ₫']}
                labelFormatter={(label: any) => `Tháng ${String(label || '').replace('T', '')}/2025`}
              />
              <Bar dataKey="Cam kết" fill="#10b981" radius={[4, 4, 0, 0]} maxBarSize={16} />
              <Bar dataKey="Đã nộp" fill="#3b82f6" radius={[4, 4, 0, 0]} maxBarSize={16} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Structure & Top Members */}
      <div className="col-span-1 flex flex-col gap-4">
        <div className="bg-white border border-[#e7e9ec] rounded-xl shadow-subtle p-4 flex-1">
          <h3 className="text-sm font-extrabold text-slate-900 mb-2 flex items-center gap-2">
            <Layers className="w-4 h-4 text-purple-600" /> Cơ cấu hình thức vốn góp
          </h3>
          <div className="h-44 w-full relative">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={70}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <RechartsTooltip
                  formatter={(value: any, name: any) => {
                    const percent = ((Number(value) / total) * 100).toFixed(1);
                    return [`${Number(value).toLocaleString('vi-VN')} ₫ (${percent}%)`, name];
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
              <span className="text-[10px] font-bold text-slate-500 uppercase">Tổng góp</span>
              <span className="text-xs font-black text-slate-900">
                {(total / 1000000000).toFixed(2)} Tỷ
              </span>
            </div>
          </div>
          <div className="flex justify-center gap-4 mt-2">
            <div className="flex items-center gap-1.5">
              <div className="w-2.5 h-2.5 rounded-full bg-emerald-500"></div>
              <span className="text-[10px] text-slate-600 font-semibold">Tiền mặt</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-2.5 h-2.5 rounded-full bg-blue-500"></div>
              <span className="text-[10px] text-slate-600 font-semibold">C.Khoản</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-2.5 h-2.5 rounded-full bg-amber-500"></div>
              <span className="text-[10px] text-slate-600 font-semibold">QSDĐ</span>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-amber-50 to-orange-50 border border-amber-200 rounded-xl shadow-subtle p-4 relative overflow-hidden">
          <div className="absolute -right-4 -bottom-4 text-amber-200/50">
            <Users className="w-24 h-24" />
          </div>
          <h3 className="text-sm font-extrabold text-amber-900 mb-3 relative z-10 flex items-center gap-2">
            👑 Top 5 xã viên góp vốn nhiều nhất
          </h3>
          <div className="space-y-2.5 relative z-10">
            {top5Members.map((m, i) => (
              <div key={m.id} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="w-5 h-5 rounded-full bg-white border border-amber-200 text-[10px] font-bold text-amber-700 flex items-center justify-center">
                    {i + 1}
                  </span>
                  <span className="text-xs font-bold text-slate-800">{m.full_name}</span>
                </div>
                <span className="text-xs font-extrabold text-emerald-700">
                  {(m.contributed_capital || m.total_capital_contributed || 0).toLocaleString('vi-VN')} ₫
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
