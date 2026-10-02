import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Award, Plus, Search, Star, Eye, Edit, Trash2, Calendar, Clock, 
  FileText, CheckCircle2, AlertCircle, PieChart as PieIcon, Filter, Layers 
} from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { 
  ocopServiceFull, OcopDossierItem, MOCK_TIMELINE_SCHEDULES 
} from '../../../services/ocopService';

export const DossiersPage: React.FC = () => {
  const navigate = useNavigate();
  const [dossiers, setDossiers] = useState<OcopDossierItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [search, setSearch] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [levelFilter, setLevelFilter] = useState<string>('ALL');
  const [yearFilter, setYearFilter] = useState<string>('2025');

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      const data = await ocopServiceFull.getDossiersList();
      setDossiers(data);
      setLoading(false);
    };
    loadData();
  }, []);

  const filtered = dossiers.filter((d) => {
    const matchesSearch =
      d.productName.toLowerCase().includes(search.toLowerCase()) ||
      d.code.toLowerCase().includes(search.toLowerCase()) ||
      d.subjectName.toLowerCase().includes(search.toLowerCase());

    const matchesStatus = statusFilter === 'ALL' || d.status === statusFilter;
    const matchesLevel = levelFilter === 'ALL' || d.evalLevel === levelFilter;
    const matchesYear = yearFilter === 'ALL' || d.year.toString() === yearFilter;

    return matchesSearch && matchesStatus && matchesLevel && matchesYear;
  });

  const doughnutData = [
    { name: 'Tự đánh giá', value: 3, color: '#0284c7' },
    { name: 'Thẩm định', value: 1, color: '#d97706' },
    { name: 'Chờ đánh giá', value: 1, color: '#eab308' },
  ];

  const getStatusBadge = (status: OcopDossierItem['status'], label: string) => {
    switch (status) {
      case 'IN_EVALUATION':
        return <span className="pill-badge pill-blue">&bull; {label}</span>;
      case 'CERTIFIED':
        return <span className="pill-badge pill-green">&bull; {label}</span>;
      case 'SELF_EVALUATING':
        return <span className="pill-badge pill-amber">&bull; {label}</span>;
      case 'NOT_STARTED':
      default:
        return <span className="pill-badge pill-gray">&bull; {label}</span>;
    }
  };

  return (
    <div className="space-y-6 pb-20 animate-fade-in text-slate-800">
      {/* Top Page Header (Image 1 Top Left) */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
            Đánh giá phân hạng OCOP
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Quản lý hồ sơ, tiêu chí, minh chứng và quá trình đánh giá, phân hạng sản phẩm OCOP.
          </p>
        </div>

        <button
          onClick={() => navigate('/ocop/dossiers/new')}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-extrabold text-xs shadow-sm transition-all shrink-0 active:scale-98"
        >
          <Plus className="w-4 h-4 stroke-[3]" /> Thêm hồ sơ OCOP
        </button>
      </div>

      {/* 4 KPI Top Stat Cards (Image 1 Top Left) */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        {/* Card 1 */}
        <div className="p-4 bg-white rounded-2xl border border-slate-200 shadow-xs flex items-center justify-between">
          <div>
            <div className="text-[11.5px] text-slate-500 font-bold">Tổng sản phẩm</div>
            <div className="text-2xl font-black text-slate-900 mt-0.5">5</div>
            <div className="text-[10.5px] text-slate-400 font-medium">Sản phẩm đăng ký</div>
          </div>
          <div className="w-10 h-10 rounded-xl bg-emerald-800 text-white flex items-center justify-center font-black">
            <FileText className="w-5 h-5" />
          </div>
        </div>

        {/* Card 2 */}
        <div className="p-4 bg-white rounded-2xl border border-slate-200 shadow-xs flex items-center justify-between">
          <div>
            <div className="text-[11.5px] text-slate-500 font-bold">Đang tự đánh giá</div>
            <div className="text-2xl font-black text-slate-900 mt-0.5">3</div>
            <div className="text-[10.5px] text-slate-400 font-medium">Đang thực hiện</div>
          </div>
          <div className="w-10 h-10 rounded-xl bg-sky-600 text-white flex items-center justify-center font-black">
            <Clock className="w-5 h-5" />
          </div>
        </div>

        {/* Card 3 */}
        <div className="p-4 bg-white rounded-2xl border border-slate-200 shadow-xs flex items-center justify-between">
          <div>
            <div className="text-[11.5px] text-slate-500 font-bold">Đang thẩm định</div>
            <div className="text-2xl font-black text-slate-900 mt-0.5">1</div>
            <div className="text-[10.5px] text-slate-400 font-medium">Cấp huyện/tỉnh</div>
          </div>
          <div className="w-10 h-10 rounded-xl bg-amber-500 text-white flex items-center justify-center font-black">
            <Award className="w-5 h-5" />
          </div>
        </div>

        {/* Card 4 */}
        <div className="p-4 bg-white rounded-2xl border border-slate-200 shadow-xs flex items-center justify-between">
          <div>
            <div className="text-[11.5px] text-slate-500 font-bold">Đã công nhận</div>
            <div className="text-2xl font-black text-slate-900 mt-0.5">1</div>
            <div className="text-[10.5px] text-slate-400 font-medium">Có kết quả</div>
          </div>
          <div className="w-10 h-10 rounded-xl bg-purple-600 text-white flex items-center justify-center font-black">
            <CheckCircle2 className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Main Grid: Table Left (2 Cols) + Side Charts Right (1 Col) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Data Table Container */}
        <div className="lg:col-span-2 space-y-4">
          <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs space-y-4">
            <h3 className="font-extrabold text-slate-900 text-sm border-b pb-2">
              Danh sách sản phẩm OCOP
            </h3>

            {/* Filter Controls Bar */}
            <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 text-xs">
              <div className="relative sm:col-span-1">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Tìm kiếm sản phẩm..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 font-medium focus:bg-white focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                />
              </div>

              <div>
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="w-full p-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 font-bold focus:bg-white focus:ring-2 focus:ring-emerald-500 focus:outline-none cursor-pointer"
                >
                  <option value="ALL">Tất cả trạng thái</option>
                  <option value="IN_EVALUATION">Đang thẩm định</option>
                  <option value="CERTIFIED">Đã công nhận</option>
                  <option value="SELF_EVALUATING">Đang tự đánh giá</option>
                  <option value="NOT_STARTED">Chưa bắt đầu</option>
                </select>
              </div>

              <div>
                <select
                  value={levelFilter}
                  onChange={(e) => setLevelFilter(e.target.value)}
                  className="w-full p-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 font-bold focus:bg-white focus:ring-2 focus:ring-emerald-500 focus:outline-none cursor-pointer"
                >
                  <option value="ALL">Tất cả cấp đánh giá</option>
                  <option value="3 sao">3 sao</option>
                  <option value="4 sao">4 sao</option>
                  <option value="5 sao">5 sao</option>
                </select>
              </div>

              <div>
                <select
                  value={yearFilter}
                  onChange={(e) => setYearFilter(e.target.value)}
                  className="w-full p-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 font-bold focus:bg-white focus:ring-2 focus:ring-emerald-500 focus:outline-none cursor-pointer"
                >
                  <option value="ALL">Tất cả năm</option>
                  <option value="2025">Năm 2025</option>
                  <option value="2026">Năm 2026</option>
                </select>
              </div>
            </div>

            {/* Table */}
            <div className="overflow-x-auto border border-slate-200 rounded-xl">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="border-b border-slate-200 bg-slate-50 text-[11px] font-bold text-slate-500 uppercase">
                    <th className="py-3 px-3 w-10 text-center">STT</th>
                    <th className="py-3 px-3">Tên sản phẩm</th>
                    <th className="py-3 px-3">Chủ thể</th>
                    <th className="py-3 px-3">Nhóm sản phẩm</th>
                    <th className="py-3 px-3 text-center">Cấp đánh giá</th>
                    <th className="py-3 px-3">Trạng thái</th>
                    <th className="py-3 px-3 text-center">Thao tác</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-medium">
                  {filtered.map((d) => (
                    <tr
                      key={d.id}
                      onClick={() => navigate(`/ocop/dossiers/${d.id}`)}
                      className="hover:bg-emerald-50/50 cursor-pointer transition-colors"
                    >
                      <td className="py-3.5 px-3 text-center font-mono font-bold text-slate-500">{d.stt}</td>
                      <td className="py-3.5 px-3">
                        <div className="font-extrabold text-slate-900">{d.productName}</div>
                      </td>
                      <td className="py-3.5 px-3 text-slate-600 font-medium">{d.subjectName}</td>
                      <td className="py-3.5 px-3 text-slate-700">{d.productCategory}</td>
                      <td className="py-3.5 px-3 text-center font-bold text-amber-900">{d.evalLevel}</td>
                      <td className="py-3.5 px-3">{getStatusBadge(d.status, d.statusLabel)}</td>
                      <td className="py-3.5 px-3 text-center">
                        <div className="flex items-center justify-center gap-1.5" onClick={(e) => e.stopPropagation()}>
                          <button
                            onClick={() => navigate(`/ocop/dossiers/${d.id}`)}
                            className="p-1.5 hover:bg-emerald-100 text-emerald-800 rounded-lg transition-colors"
                            title="Xem chi tiết"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => navigate(`/ocop/dossiers/${d.id}`)}
                            className="p-1.5 hover:bg-slate-200 text-slate-600 rounded-lg transition-colors"
                            title="Chỉnh sửa"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Right Column: Side Charts & Upcoming Schedule (Image 1 Middle Right) */}
        <div className="space-y-6">
          {/* Card 1: Tiến độ đánh giá OCOP Donut Chart */}
          <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs space-y-3">
            <h3 className="font-extrabold text-slate-900 text-xs uppercase tracking-wider border-b pb-2">
              Tiến độ đánh giá OCOP
            </h3>
            <div className="relative h-44 flex items-center justify-center">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={doughnutData}
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={65}
                    paddingAngle={4}
                    dataKey="value"
                  >
                    {doughnutData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
              <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                <span className="text-xl font-black text-slate-900">40%</span>
                <span className="text-[10px] text-slate-400 font-bold">Hoàn thành</span>
              </div>
            </div>

            <div className="space-y-1.5 text-xs">
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-sky-600" /> Tự đánh giá
                </span>
                <span className="font-bold text-slate-700">3 sản phẩm</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-amber-500" /> Thẩm định
                </span>
                <span className="font-bold text-slate-700">1 sản phẩm</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-yellow-400" /> Chờ đánh giá
                </span>
                <span className="font-bold text-slate-700">1 sản phẩm</span>
              </div>
            </div>
          </div>

          {/* Card 2: Lịch trình sắp tới */}
          <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs space-y-3">
            <h3 className="font-extrabold text-slate-900 text-xs uppercase tracking-wider border-b pb-2">
              Lịch trình sắp tới
            </h3>
            <div className="space-y-3">
              {MOCK_TIMELINE_SCHEDULES.map((item) => (
                <div key={item.id} className="p-3 bg-slate-50 rounded-xl border border-slate-200/80 space-y-1 text-xs">
                  <div className="flex justify-between items-center">
                    <span className="font-mono font-bold text-emerald-800 text-[11px]">{item.date}</span>
                    <span className="pill-badge pill-blue">{item.type}</span>
                  </div>
                  <div className="font-extrabold text-slate-900">{item.title}</div>
                  <div className="text-[11px] text-slate-500">{item.productName}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
