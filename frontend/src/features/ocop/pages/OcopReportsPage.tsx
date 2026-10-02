import React from 'react';
import { BarChart3, Download, Calendar, Filter, Star, CheckCircle2, FileText, Award } from 'lucide-react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  PieChart, Pie, Cell, Legend 
} from 'recharts';

export const OcopReportsPage: React.FC = () => {
  const barData = [
    { year: '2023', star3: 2, star4: 1, star5: 0 },
    { year: '2024', star3: 3, star4: 2, star5: 0 },
    { year: '2025', star3: 1, star4: 2, star5: 0 },
  ];

  const pieData = [
    { name: 'Thực phẩm', value: 60, color: '#059669' },
    { name: 'Đồ uống', value: 20, color: '#0284c7' },
    { name: 'Thảo dược', value: 10, color: '#d97706' },
    { name: 'Khác', value: 10, color: '#64748b' },
  ];

  return (
    <div className="space-y-6 pb-20 animate-fade-in text-slate-800">
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[11.5px] font-mono font-bold text-slate-400">OCOP / Báo cáo - Thống kê</span>
            <span className="pill-badge pill-green">Độc lập & Tự động</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight mt-0.5">
            Báo cáo & Thống kê Đánh giá OCOP
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Tổng hợp dữ liệu sản phẩm đăng ký, kết quả xếp hạng sao theo năm và phân bổ nhóm sản phẩm HTX.
          </p>
        </div>

        <button
          onClick={() => alert('Xuất báo cáo PDF/Excel thành công!')}
          className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs rounded-xl shadow-xs inline-flex items-center gap-2"
        >
          <Download className="w-4 h-4" /> Xuất Báo Cáo
        </button>
      </div>

      {/* KPI Cards Header (Image 1 Bottom Right 2) */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <div className="p-4 bg-white rounded-2xl border border-slate-200 shadow-xs flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center font-black">
            5
          </div>
          <div>
            <div className="text-xs text-slate-500 font-bold">Tổng sản phẩm OCOP</div>
            <div className="text-base font-black text-slate-900">5 Sản phẩm</div>
          </div>
        </div>

        <div className="p-4 bg-white rounded-2xl border border-slate-200 shadow-xs flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center font-black">
            1
          </div>
          <div>
            <div className="text-xs text-slate-500 font-bold">Sản phẩm 3 sao</div>
            <div className="text-base font-black text-amber-900">1 Sản phẩm</div>
          </div>
        </div>

        <div className="p-4 bg-white rounded-2xl border border-slate-200 shadow-xs flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center font-black">
            2
          </div>
          <div>
            <div className="text-xs text-slate-500 font-bold">Sản phẩm 4 sao</div>
            <div className="text-base font-black text-emerald-900">2 Sản phẩm</div>
          </div>
        </div>

        <div className="p-4 bg-white rounded-2xl border border-slate-200 shadow-xs flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-purple-100 text-purple-700 flex items-center justify-center font-black">
            0
          </div>
          <div>
            <div className="text-xs text-slate-500 font-bold">Sản phẩm 5 sao</div>
            <div className="text-base font-black text-purple-900">0 Sản phẩm</div>
          </div>
        </div>
      </div>

      {/* Recharts Analytics Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Bar Chart: Kết quả phân hạng theo năm */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-4">
          <h3 className="font-extrabold text-slate-900 text-sm border-b pb-2">
            Kết quả phân hạng theo năm
          </h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={barData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                <XAxis dataKey="year" tickLine={false} axisLine={false} className="text-xs font-bold" />
                <YAxis tickLine={false} axisLine={false} className="text-xs font-bold" />
                <Tooltip />
                <Bar dataKey="star3" name="3 sao" fill="#0284c7" radius={[4, 4, 0, 0]} />
                <Bar dataKey="star4" name="4 sao" fill="#059669" radius={[4, 4, 0, 0]} />
                <Bar dataKey="star5" name="5 sao" fill="#d97706" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Pie Chart: Tỷ lệ theo nhóm sản phẩm */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-4">
          <h3 className="font-extrabold text-slate-900 text-sm border-b pb-2">
            Tỷ lệ theo nhóm sản phẩm
          </h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};
