import React from 'react';
import { 
  BarChart3, Download, Calendar, Filter, Star, CheckCircle2, FileText, Award, 
  TrendingUp, RefreshCw, Eye, DollarSign, PieChart as PieIcon, MapPin, FileSpreadsheet, ShieldCheck
} from 'lucide-react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, 
  PieChart, Pie, Cell, LineChart, Line, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar 
} from 'recharts';

export const OcopReportsPage: React.FC = () => {
  const barDataYear = [
    { year: '2023', star3: 2, star4: 1, star5: 1 },
    { year: '2024', star3: 3, star4: 3, star5: 1 },
    { year: '2025', star3: 4, star4: 6, star5: 2 },
  ];

  const pieDataCategory = [
    { name: 'Thực phẩm', value: 60, color: '#059669' },
    { name: 'Đồ uống', value: 20, color: '#0284c7' },
    { name: 'Thảo dược', value: 10, color: '#d97706' },
    { name: 'Vải & may mặc', value: 5, color: '#7c3aed' },
    { name: 'Lưu niệm - Nội thất', value: 5, color: '#e11d48' },
    { name: 'Du lịch cộng đồng', value: 0, color: '#64748b' },
  ];

  const lineRevenueData = [
    { year: '2023', revenue: 1420 },
    { year: '2024', revenue: 2180 },
    { year: '2025', revenue: 2850 },
  ];

  const radarData = [
    { subject: 'Sản phẩm & cộng đồng', A: 100, fullMark: 100 },
    { subject: 'Khả năng tiếp thị', A: 75, fullMark: 100 },
    { subject: 'Chất lượng sản phẩm', A: 90, fullMark: 100 },
    { subject: 'Bao bì & truy xuất', A: 85, fullMark: 100 },
    { subject: 'Thị trường tiêu thụ', A: 70, fullMark: 100 },
  ];

  const topProducts = [
    { rank: 1, name: 'Ớt chuông Sweet Palermo Đỏ Đà Lạt', revenue: '820 triệu', percent: 85 },
    { rank: 2, name: 'Rau xà lách thủy canh Tân Tiến', revenue: '450 triệu', percent: 60 },
    { rank: 3, name: 'Trà thảo mộc cổ truyền', revenue: '320 triệu', percent: 45 },
    { rank: 4, name: 'Mật ong rừng Mê Linh', revenue: '280 triệu', percent: 38 },
    { rank: 5, name: 'Tinh dầu sả chanh', revenue: '250 triệu', percent: 32 },
  ];

  const regionalData = [
    { location: 'Xã Tân Tiến', total: 5, star3: 2, star4: 2, star5: 1 },
    { location: 'Huyện Lâm Hà', total: 3, star3: 2, star4: 1, star5: 0 },
    { location: 'TP. Đà Lạt', total: 2, star3: 1, star4: 1, star5: 0 },
    { location: 'Huyện Đức Trọng', total: 1, star3: 0, star4: 1, star5: 0 },
    { location: 'Khác', total: 1, star3: 0, star4: 0, star5: 1 },
  ];

  return (
    <div className="space-y-6 pb-20 animate-fade-in text-slate-800">
      {/* Top Header (Matching Image 3) */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
            Báo cáo & Thống kê OCOP
          </h1>
          <p className="text-xs text-slate-500 mt-1 font-medium">
            Tổng hợp số liệu, phân tích xu hướng và hiệu quả chương trình OCOP của HTX.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2 p-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-700">
            <Calendar className="w-4 h-4 text-slate-400" />
            <span>01/01/2023 - 31/12/2025</span>
          </div>

          <select className="p-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-700">
            <option>Tất cả sản phẩm</option>
            <option>Sản phẩm đạt 4-5 sao</option>
          </select>

          <button
            onClick={() => alert('Xuất file Báo cáo tổng hợp Excel / PDF thành công!')}
            className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-700 hover:bg-emerald-800 text-white font-extrabold text-xs rounded-xl shadow-xs transition-all"
          >
            <Download className="w-4 h-4" /> Xuất báo cáo
          </button>
        </div>
      </div>

      {/* 6 Top KPI Stat Cards (Matching Image 3) */}
      <div className="grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        <div className="p-3.5 bg-white rounded-2xl border border-slate-200 shadow-xs space-y-1">
          <div className="text-[11px] text-slate-500 font-bold">Tổng số sản phẩm OCOP</div>
          <div className="text-2xl font-black text-slate-900">12</div>
          <div className="text-[10px] text-emerald-600 font-bold">&uarr; 2 sản phẩm so với kỳ trước</div>
        </div>

        <div className="p-3.5 bg-white rounded-2xl border border-slate-200 shadow-xs space-y-1">
          <div className="text-[11px] text-slate-500 font-bold">Sản phẩm 3 sao</div>
          <div className="text-2xl font-black text-sky-700">4</div>
          <div className="text-[10px] text-sky-600 font-bold">33,3% tổng số sản phẩm</div>
        </div>

        <div className="p-3.5 bg-white rounded-2xl border border-slate-200 shadow-xs space-y-1">
          <div className="text-[11px] text-slate-500 font-bold">Sản phẩm 4 sao</div>
          <div className="text-2xl font-black text-emerald-800">6</div>
          <div className="text-[10px] text-emerald-600 font-bold">&uarr; 50,0% tổng số sản phẩm</div>
        </div>

        <div className="p-3.5 bg-white rounded-2xl border border-slate-200 shadow-xs space-y-1">
          <div className="text-[11px] text-slate-500 font-bold">Sản phẩm 5 sao</div>
          <div className="text-2xl font-black text-purple-800">2</div>
          <div className="text-[10px] text-purple-600 font-bold">&uarr; 16,7% tổng số sản phẩm</div>
        </div>

        <div className="p-3.5 bg-white rounded-2xl border border-slate-200 shadow-xs space-y-1">
          <div className="text-[11px] text-slate-500 font-bold">Tỷ lệ hoàn thiện hồ sơ</div>
          <div className="text-2xl font-black text-slate-900">92,5%</div>
          <div className="text-[10px] text-emerald-600 font-bold">&uarr; 12,5% so với kỳ trước</div>
        </div>

        <div className="p-3.5 bg-white rounded-2xl border border-slate-200 shadow-xs space-y-1">
          <div className="text-[11px] text-slate-500 font-bold">Doanh thu sản phẩm OCOP</div>
          <div className="text-xl font-black text-emerald-900">2,85 tỷ</div>
          <div className="text-[10px] text-emerald-600 font-bold">&uarr; 18,7% so với kỳ trước</div>
        </div>
      </div>

      {/* Row 1: 3 Analytics Charts (Matching Image 3 Middle Charts Row) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Stacked Bar Chart: Thống kê số lượng SP theo năm */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-4">
          <h3 className="font-extrabold text-slate-900 text-xs border-b pb-2">
            Thống kê số lượng sản phẩm OCOP theo năm và phân hạng sao
          </h3>
          <div className="h-56">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={barDataYear}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="year" tick={{ fontSize: 11, fontWeight: 700 }} />
                <YAxis tick={{ fontSize: 11 }} />
                <Bar dataKey="star3" name="3 sao" fill="#0284c7" stackId="a" />
                <Bar dataKey="star4" name="4 sao" fill="#059669" stackId="a" />
                <Bar dataKey="star5" name="5 sao" fill="#7c3aed" stackId="a" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Donut Chart: Cơ cấu sản phẩm theo nhóm ngành */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-4">
          <h3 className="font-extrabold text-slate-900 text-xs border-b pb-2">
            Cơ cấu sản phẩm theo nhóm ngành
          </h3>
          <div className="h-56 flex items-center">
            <ResponsiveContainer width="55%" height="100%">
              <PieChart>
                <Pie data={pieDataCategory} cx="50%" cy="50%" innerRadius={40} outerRadius={65} paddingAngle={3} dataKey="value">
                  {pieDataCategory.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
              </PieChart>
            </ResponsiveContainer>
            <div className="space-y-1 text-[11px] font-bold text-slate-600">
              {pieDataCategory.map((item, idx) => (
                <div key={idx} className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: item.color }} />
                  <span>{item.name}: {item.value}%</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Line Chart: Xu hướng doanh thu */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-4">
          <h3 className="font-extrabold text-slate-900 text-xs border-b pb-2">
            Xu hướng doanh thu sản phẩm OCOP (Triệu đồng)
          </h3>
          <div className="h-56">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={lineRevenueData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="year" tick={{ fontSize: 11, fontWeight: 700 }} />
                <YAxis tick={{ fontSize: 11 }} />
                <Line type="monotone" dataKey="revenue" stroke="#059669" strokeWidth={3} dot={{ r: 5, fill: '#059669' }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Row 2: Data Table Left (2/3) + Top Revenue & Renewal Cards Right (1/3) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Section: OCOP Product Master Data Table */}
        <div className="lg:col-span-2 bg-white border border-slate-200 rounded-2xl p-5 shadow-xs space-y-4">
          <h3 className="font-extrabold text-slate-900 text-xs border-b pb-2">
            Danh sách sản phẩm OCOP công nhận
          </h3>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50 text-[10.5px] font-bold text-slate-500 uppercase">
                  <th className="py-2.5 px-3">STT</th>
                  <th className="py-2.5 px-3">Mã SP</th>
                  <th className="py-2.5 px-3">Tên sản phẩm</th>
                  <th className="py-2.5 px-3">Chủ thể</th>
                  <th className="py-2.5 px-3">Nhóm ngành</th>
                  <th className="py-2.5 px-3">Số sao</th>
                  <th className="py-2.5 px-3">Doanh thu (năm)</th>
                  <th className="py-2.5 px-3">Trạng thái</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                <tr className="hover:bg-slate-50">
                  <td className="py-2.5 px-3 font-mono text-slate-400">1</td>
                  <td className="py-2.5 px-3 font-mono font-bold text-slate-700">SP-001</td>
                  <td className="py-2.5 px-3 font-extrabold text-slate-900">Ớt chuông Sweet Palermo Đỏ Đà Lạt</td>
                  <td className="py-2.5 px-3 text-slate-600">HTX Tân Tiến</td>
                  <td className="py-2.5 px-3"><span className="px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 font-bold text-[10px]">Thực phẩm</span></td>
                  <td className="py-2.5 px-3 font-bold text-amber-500">4 sao ⭐⭐⭐⭐</td>
                  <td className="py-2.5 px-3 font-mono font-black text-emerald-900">820 triệu</td>
                  <td className="py-2.5 px-3"><span className="pill-badge pill-green text-[10px]">Đã công nhận</span></td>
                </tr>
                <tr className="hover:bg-slate-50">
                  <td className="py-2.5 px-3 font-mono text-slate-400">2</td>
                  <td className="py-2.5 px-3 font-mono font-bold text-slate-700">SP-002</td>
                  <td className="py-2.5 px-3 font-extrabold text-slate-900">Rau xà lách thủy canh Tân Tiến</td>
                  <td className="py-2.5 px-3 text-slate-600">HTX Tân Tiến</td>
                  <td className="py-2.5 px-3"><span className="px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 font-bold text-[10px]">Thực phẩm</span></td>
                  <td className="py-2.5 px-3 font-bold text-amber-500">3 sao ⭐⭐⭐</td>
                  <td className="py-2.5 px-3 font-mono font-black text-emerald-900">450 triệu</td>
                  <td className="py-2.5 px-3"><span className="pill-badge pill-blue text-[10px]">Đang thẩm định</span></td>
                </tr>
                <tr className="hover:bg-slate-50">
                  <td className="py-2.5 px-3 font-mono text-slate-400">3</td>
                  <td className="py-2.5 px-3 font-mono font-bold text-slate-700">SP-003</td>
                  <td className="py-2.5 px-3 font-extrabold text-slate-900">Trà thảo mộc cổ truyền</td>
                  <td className="py-2.5 px-3 text-slate-600">HTX Tân Tiến</td>
                  <td className="py-2.5 px-3"><span className="px-2 py-0.5 rounded bg-sky-100 text-sky-800 font-bold text-[10px]">Đồ uống</span></td>
                  <td className="py-2.5 px-3 font-bold text-amber-500">3 sao ⭐⭐⭐</td>
                  <td className="py-2.5 px-3 font-mono font-black text-emerald-900">320 triệu</td>
                  <td className="py-2.5 px-3"><span className="pill-badge pill-green text-[10px]">Đã công nhận</span></td>
                </tr>
                <tr className="hover:bg-slate-50">
                  <td className="py-2.5 px-3 font-mono text-slate-400">4</td>
                  <td className="py-2.5 px-3 font-mono font-bold text-slate-700">SP-004</td>
                  <td className="py-2.5 px-3 font-extrabold text-slate-900">Mật ong rừng Mê Linh</td>
                  <td className="py-2.5 px-3 text-slate-600">HTX Tân Tiến</td>
                  <td className="py-2.5 px-3"><span className="px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 font-bold text-[10px]">Thực phẩm</span></td>
                  <td className="py-2.5 px-3 font-bold text-amber-500">3 sao ⭐⭐⭐</td>
                  <td className="py-2.5 px-3 font-mono font-black text-emerald-900">280 triệu</td>
                  <td className="py-2.5 px-3"><span className="pill-badge pill-amber text-[10px]">Đang tự đánh giá</span></td>
                </tr>
                <tr className="hover:bg-slate-50">
                  <td className="py-2.5 px-3 font-mono text-slate-400">5</td>
                  <td className="py-2.5 px-3 font-mono font-bold text-slate-700">SP-005</td>
                  <td className="py-2.5 px-3 font-extrabold text-slate-900">Tinh dầu sả chanh</td>
                  <td className="py-2.5 px-3 text-slate-600">HTX Tân Tiến</td>
                  <td className="py-2.5 px-3"><span className="px-2 py-0.5 rounded bg-amber-100 text-amber-800 font-bold text-[10px]">Thảo dược</span></td>
                  <td className="py-2.5 px-3 font-bold text-amber-500">3 sao ⭐⭐⭐</td>
                  <td className="py-2.5 px-3 font-mono font-black text-emerald-900">250 triệu</td>
                  <td className="py-2.5 px-3"><span className="pill-badge pill-gray text-[10px]">Lưu nháp</span></td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* Right Section: Top Revenue Products & Certification Expiration status */}
        <div className="space-y-6">
          {/* Top 5 Products by Revenue */}
          <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs space-y-4">
            <h3 className="font-extrabold text-slate-900 text-xs border-b pb-2">
              Top 5 sản phẩm có doanh thu cao nhất
            </h3>

            <div className="space-y-3 text-xs">
              {topProducts.map((p) => (
                <div key={p.rank} className="space-y-1">
                  <div className="flex justify-between font-bold">
                    <span className="text-slate-800">{p.rank}. {p.name}</span>
                    <span className="font-mono text-emerald-800">{p.revenue}</span>
                  </div>
                  <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                    <div className="h-full bg-emerald-600 rounded-full" style={{ width: `${p.percent}%` }} />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Certification Expiration status */}
          <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs space-y-4">
            <h3 className="font-extrabold text-slate-900 text-xs border-b pb-2">
              Tình hình chứng nhận & tái đánh giá
            </h3>

            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-full border-4 border-emerald-600 bg-emerald-50 flex items-center justify-center font-black text-emerald-950 shrink-0">
                75%
              </div>
              <div className="space-y-1 text-xs">
                <div className="font-bold text-slate-900">Sản phẩm còn hiệu lực chứng nhận</div>
                <div className="text-[11px] text-slate-500">Hiệu lực GCN: 36 tháng theo QĐ 148</div>
              </div>
            </div>

            <div className="space-y-2 text-xs border-t pt-3">
              <div className="flex justify-between">
                <span className="text-slate-600 font-semibold">&bull; Đang hiệu lực:</span>
                <span className="font-bold text-emerald-700">9 sản phẩm</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-600 font-semibold">&bull; Sắp hết hạn (&le; 90 ngày):</span>
                <span className="font-bold text-amber-600">2 sản phẩm</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-600 font-semibold">&bull; Đã hết hạn:</span>
                <span className="font-bold text-rose-600">1 sản phẩm</span>
              </div>
            </div>

            <button className="w-full py-2 bg-emerald-700 hover:bg-emerald-800 text-white font-extrabold text-xs rounded-xl shadow-xs">
              Xem chi tiết danh sách GCN
            </button>
          </div>
        </div>
      </div>

      {/* Row 3: Regional Breakdown & Radar Chart */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Regional Breakdown Table */}
        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs space-y-4">
          <h3 className="font-extrabold text-slate-900 text-xs border-b pb-2">
            Báo cáo theo địa phương
          </h3>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b bg-slate-50 text-[10px] font-bold text-slate-500 uppercase">
                  <th className="py-2 px-3">Xã / Huyện</th>
                  <th className="py-2 px-3 text-center">Số sản phẩm</th>
                  <th className="py-2 px-3 text-center">3 sao</th>
                  <th className="py-2 px-3 text-center">4 sao</th>
                  <th className="py-2 px-3 text-center">5 sao</th>
                </tr>
              </thead>
              <tbody className="divide-y font-medium text-slate-700">
                {regionalData.map((r, idx) => (
                  <tr key={idx} className="hover:bg-slate-50">
                    <td className="py-2 px-3 font-bold text-slate-900">{r.location}</td>
                    <td className="py-2 px-3 text-center font-bold text-emerald-800">{r.total}</td>
                    <td className="py-2 px-3 text-center">{r.star3}</td>
                    <td className="py-2 px-3 text-center">{r.star4}</td>
                    <td className="py-2 px-3 text-center">{r.star5}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Radar Spider Chart */}
        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs space-y-4">
          <h3 className="font-extrabold text-slate-900 text-xs border-b pb-2">
            Xu hướng theo tiêu chí đánh giá
          </h3>
          <div className="h-52">
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart cx="50%" cy="50%" outerRadius="70%" data={radarData}>
                <PolarGrid stroke="#e2e8f0" />
                <PolarAngleAxis dataKey="subject" tick={{ fontSize: 9, fontWeight: 700 }} />
                <PolarRadiusAxis angle={30} domain={[0, 100]} />
                <Radar name="Sản phẩm HTX" dataKey="A" stroke="#059669" fill="#059669" fillOpacity={0.5} />
              </RadarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Export & Quick Actions Card */}
        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs space-y-4">
          <h3 className="font-extrabold text-slate-900 text-xs border-b pb-2">
            Báo cáo & Xuất file
          </h3>
          <div className="grid grid-cols-3 gap-2 text-center text-xs font-bold">
            <div className="p-3 bg-slate-50 border rounded-xl hover:bg-slate-100 cursor-pointer">
              <FileSpreadsheet className="w-5 h-5 text-emerald-700 mx-auto mb-1" />
              <span>Excel</span>
            </div>
            <div className="p-3 bg-slate-50 border rounded-xl hover:bg-slate-100 cursor-pointer">
              <FileText className="w-5 h-5 text-rose-600 mx-auto mb-1" />
              <span>PDF</span>
            </div>
            <div className="p-3 bg-slate-50 border rounded-xl hover:bg-slate-100 cursor-pointer">
              <FileText className="w-5 h-5 text-sky-600 mx-auto mb-1" />
              <span>Word</span>
            </div>
          </div>

          <div className="space-y-1.5 text-xs font-semibold pt-2 border-t">
            <div className="p-2 hover:bg-slate-50 rounded-lg cursor-pointer text-emerald-800 flex justify-between">
              <span>Báo cáo sản phẩm theo sao</span> &rsaquo;
            </div>
            <div className="p-2 hover:bg-slate-50 rounded-lg cursor-pointer text-emerald-800 flex justify-between">
              <span>Báo cáo doanh thu sản phẩm OCOP</span> &rsaquo;
            </div>
            <div className="p-2 hover:bg-slate-50 rounded-lg cursor-pointer text-emerald-800 flex justify-between">
              <span>Báo cáo chứng nhận & tái đánh giá</span> &rsaquo;
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
