import React from 'react';
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
} from 'recharts';

const PIE_COLORS = ['#059669', '#9333ea', '#2563eb', '#f59e0b'];

interface ProfitChartsProps {
  pieData: { name: string; value: number }[];
  barData: { month: string; paid: number; unpaid: number }[];
}

export const ProfitCharts: React.FC<ProfitChartsProps> = ({ pieData, barData }) => {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
      {/* Pie Chart */}
      <div className="bg-white border border-[#e7e9ec] p-5 rounded-2xl shadow-xs space-y-3">
        <h3 className="font-extrabold text-slate-900 text-sm">
          Biểu đồ Cơ cấu Trích Quỹ & Phân chia Thặng dư (Luật HTX 2023)
        </h3>
        <div className="h-56">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={pieData}
                cx="50%"
                cy="50%"
                innerRadius={55}
                outerRadius={80}
                paddingAngle={4}
                dataKey="value"
              >
                {pieData.map((_, i) => (
                  <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                ))}
              </Pie>
              <Tooltip formatter={(value) => [`${Number(value).toLocaleString('vi-VN')} ₫`, 'Giá trị']} />
            </PieChart>
          </ResponsiveContainer>
        </div>
        <div className="grid grid-cols-2 gap-2 text-xs pt-1 border-t border-slate-100">
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-emerald-600 shrink-0" />
            <span>Chia xã viên (85%)</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-purple-600 shrink-0" />
            <span>Quỹ chung không chia (5%)</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-blue-600 shrink-0" />
            <span>Quỹ ĐTPT & Dự phòng (10%)</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-amber-500 shrink-0" />
            <span>Quỹ Phúc lợi (5%)</span>
          </div>
        </div>
      </div>

      {/* Bar Chart */}
      <div className="bg-white border border-[#e7e9ec] p-5 rounded-2xl shadow-xs space-y-3">
        <div className="flex justify-between items-center">
          <h3 className="font-extrabold text-slate-900 text-sm">
            Biểu đồ Tiến độ Chi trả Thặng dư cho Xã viên
          </h3>
          <div className="flex items-center gap-3 text-xs font-bold">
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-600" /> Đã giải ngân
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-500" /> Còn tồn đọng
            </span>
          </div>
        </div>
        <div className="h-56">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={barData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
              <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#64748b' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
              <Tooltip formatter={(value) => [`${Number(value).toLocaleString('vi-VN')} ₫`, 'Số tiền']} />
              <Bar dataKey="paid" fill="#059669" radius={[4, 4, 0, 0]} maxBarSize={32} />
              <Bar dataKey="unpaid" fill="#f59e0b" radius={[4, 4, 0, 0]} maxBarSize={32} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};
