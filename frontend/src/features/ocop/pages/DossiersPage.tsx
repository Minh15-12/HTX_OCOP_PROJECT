import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Award, Plus, Search, Star, Eye, Edit, Trash2, Calendar, Clock, 
  FileText, CheckCircle2, AlertCircle, Filter, Layers, RefreshCw, 
  Download, Printer, ChevronRight, X, MoreVertical, FileCheck, Building2, MapPin, Phone, Mail, User,
  FileSpreadsheet
} from 'lucide-react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, 
  PieChart, Pie, Cell 
} from 'recharts';
import { ocopServiceFull, OcopDossierItem } from '../../../services/ocopService';
import { Qd148DocumentModal } from '../components/Qd148DocumentModal';
import { exportToExcel } from '@/utils/exportUtils';

export const DossiersPage: React.FC = () => {
  const navigate = useNavigate();
  const [dossiers, setDossiers] = useState<OcopDossierItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [search, setSearch] = useState<string>('');
  const [activeTabFilter, setActiveTabFilter] = useState<'ALL' | 'PROCESSING' | 'COMPLETED' | 'CERTIFIED'>('ALL');
  const [categoryFilter, setCategoryFilter] = useState<string>('ALL');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [selectedDossier, setSelectedDossier] = useState<OcopDossierItem | null>(null);
  const [previewTab, setPreviewTab] = useState<'overview' | 'eval' | 'evidences' | 'package' | 'workflow'>('overview');
  const [isFormModalOpen, setIsFormModalOpen] = useState<boolean>(false);

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      const data = await ocopServiceFull.getDossiersList();
      setDossiers(data);
      if (data.length > 0) setSelectedDossier(data[0]);
      setLoading(false);
    };
    loadData();
  }, []);

  const filteredDossiers = dossiers.filter((d) => {
    const matchesSearch =
      d.productName.toLowerCase().includes(search.toLowerCase()) ||
      d.code.toLowerCase().includes(search.toLowerCase()) ||
      d.subjectName.toLowerCase().includes(search.toLowerCase());

    const matchesCategory = categoryFilter === 'ALL' || d.productCategory.includes(categoryFilter);
    const matchesStatus = statusFilter === 'ALL' || d.status === statusFilter;

    let matchesTab = true;
    if (activeTabFilter === 'PROCESSING') matchesTab = d.status === 'SELF_EVALUATING' || d.status === 'IN_EVALUATION' || d.status === 'DRAFT';
    if (activeTabFilter === 'COMPLETED') matchesTab = d.status === 'APPROVED';
    if (activeTabFilter === 'CERTIFIED') matchesTab = d.status === 'CERTIFIED';

    return matchesSearch && matchesCategory && matchesStatus && matchesTab;
  });

  const doughnutData = [
    { name: 'Đã hoàn thành', value: 5, color: '#059669' },
    { name: 'Đang thực hiện', value: 2, color: '#0284c7' },
    { name: 'Chưa hoàn thiện', value: 1, color: '#f59e0b' },
  ];

  const barDataStar = [
    { star: '3 sao', count: 6, fill: '#0284c7' },
    { star: '4 sao', count: 4, fill: '#059669' },
    { star: '5 sao', count: 2, fill: '#7c3aed' },
  ];

  const categoryPieData = [
    { name: 'Thực phẩm', value: 60, color: '#059669' },
    { name: 'Đồ uống', value: 20, color: '#0284c7' },
    { name: 'Thảo dược', value: 10, color: '#d97706' },
    { name: 'Khác', value: 10, color: '#64748b' },
  ];

  return (
    <div className="space-y-5 pb-20 animate-fade-in text-slate-800">
      {/* Top Page Header (Matching Image 1) */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
            Hồ sơ & Chấm điểm OCOP
          </h1>
          <p className="text-xs text-slate-500 mt-1 font-medium">
            Quản lý hồ sơ đăng ký, tự đánh giá và chấm điểm sản phẩm OCOP theo Bộ tiêu chí QĐ 148/2023.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="relative w-64 hidden sm:block">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Tìm kiếm hồ sơ, sản phẩm, mã..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-800 focus:bg-white focus:ring-2 focus:ring-emerald-500 focus:outline-none"
            />
          </div>

          <button
            onClick={() => {
              const exportData = filteredDossiers.map((d) => ({
                'Mã hồ sơ': d.code,
                'Sản phẩm': d.productName,
                'Chủ thể': d.subjectName,
                'Nhóm sản phẩm': d.productCategory,
                'Điểm tự đánh giá': d.totalScore,
                'Trạng thái': d.statusLabel,
                'Ngày nộp': d.submissionDate,
              }));
              exportToExcel(exportData, 'Danh_Sach_Ho_So_OCOP', 'HoSoOCOP');
            }}
            className="inline-flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-800 font-bold text-xs shadow-2xs transition-all shrink-0 cursor-pointer"
          >
            <FileSpreadsheet className="w-4 h-4 text-emerald-600" /> Xuất Excel
          </button>

          <button
            onClick={() => navigate('/ocop/dossiers/new')}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-extrabold text-xs shadow-sm transition-all shrink-0 active:scale-98 cursor-pointer"
          >
            <Plus className="w-4 h-4 stroke-[3]" /> Thêm hồ sơ OCOP
          </button>
        </div>
      </div>

      {/* 4 KPI Top Stat Cards (Matching Image 1) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1 */}
        <div className="p-4 bg-white rounded-2xl border border-slate-200 shadow-xs flex items-center justify-between">
          <div className="space-y-1">
            <div className="text-[11.5px] text-slate-500 font-bold">Tổng sản phẩm đăng ký</div>
            <div className="text-2xl font-black text-slate-900">12</div>
            <div className="text-[10.5px] text-emerald-600 font-bold flex items-center gap-1">
              <span>&uarr; 16,7%</span> <span className="text-slate-400 font-normal">so với kỳ trước</span>
            </div>
          </div>
          <div className="w-11 h-11 rounded-2xl bg-emerald-50 text-emerald-600 border border-emerald-100 flex items-center justify-center font-black">
            <FileText className="w-5 h-5" />
          </div>
        </div>

        {/* Card 2 */}
        <div className="p-4 bg-white rounded-2xl border border-slate-200 shadow-xs flex items-center justify-between">
          <div className="space-y-1">
            <div className="text-[11.5px] text-slate-500 font-bold">Đang tự đánh giá</div>
            <div className="text-2xl font-black text-slate-900">5</div>
            <div className="text-[10.5px] text-emerald-600 font-bold flex items-center gap-1">
              <span>&uarr; 25,0%</span> <span className="text-slate-400 font-normal">so với kỳ trước</span>
            </div>
          </div>
          <div className="w-11 h-11 rounded-2xl bg-sky-50 text-sky-600 border border-sky-100 flex items-center justify-center font-black">
            <Clock className="w-5 h-5" />
          </div>
        </div>

        {/* Card 3 */}
        <div className="p-4 bg-white rounded-2xl border border-slate-200 shadow-xs flex items-center justify-between">
          <div className="space-y-1">
            <div className="text-[11.5px] text-slate-500 font-bold">Đang thẩm định</div>
            <div className="text-2xl font-black text-slate-900">4</div>
            <div className="text-[10.5px] text-emerald-600 font-bold flex items-center gap-1">
              <span>&uarr; 33,3%</span> <span className="text-slate-400 font-normal">so với kỳ trước</span>
            </div>
          </div>
          <div className="w-11 h-11 rounded-2xl bg-amber-50 text-amber-600 border border-amber-100 flex items-center justify-center font-black">
            <Award className="w-5 h-5" />
          </div>
        </div>

        {/* Card 4 */}
        <div className="p-4 bg-white rounded-2xl border border-slate-200 shadow-xs flex items-center justify-between">
          <div className="space-y-1">
            <div className="text-[11.5px] text-slate-500 font-bold">Đã công nhận OCOP</div>
            <div className="text-2xl font-black text-slate-900">3</div>
            <div className="text-[10.5px] text-emerald-600 font-bold flex items-center gap-1">
              <span>&uarr; 50,0%</span> <span className="text-slate-400 font-normal">so với kỳ trước</span>
            </div>
          </div>
          <div className="w-11 h-11 rounded-2xl bg-purple-50 text-purple-600 border border-purple-100 flex items-center justify-center font-black">
            <CheckCircle2 className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Main Split Grid Layout: Table & Charts Left (2/3) + Side Drawer Right (1/3) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column (2/3 width) */}
        <div className="lg:col-span-2 space-y-6">
          {/* Main Dossiers Data Table Box */}
          <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs space-y-4">
            {/* Filter Tabs Header Bar */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b pb-3">
              <div className="flex items-center gap-2 overflow-x-auto text-xs font-bold">
                {[
                  { id: 'ALL', label: 'Tất cả hồ sơ' },
                  { id: 'PROCESSING', label: 'Đang xử lý' },
                  { id: 'COMPLETED', label: 'Đã hoàn thành' },
                  { id: 'CERTIFIED', label: 'Đã công nhận' },
                ].map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTabFilter(tab.id as any)}
                    className={`px-3 py-1.5 rounded-xl transition-all whitespace-nowrap ${
                      activeTabFilter === tab.id
                        ? 'bg-emerald-800 text-white font-extrabold shadow-xs'
                        : 'text-slate-600 hover:bg-slate-100'
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>

              {/* Dropdown Filters */}
              <div className="flex items-center gap-2 text-xs font-semibold">
                <select
                  value={categoryFilter}
                  onChange={(e) => setCategoryFilter(e.target.value)}
                  className="p-1.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-700"
                >
                  <option value="ALL">Tất cả sản phẩm</option>
                  <option value="Thực phẩm">Thực phẩm</option>
                  <option value="Đồ uống">Đồ uống</option>
                  <option value="Thảo dược">Thảo dược</option>
                </select>

                <button
                  onClick={() => { setSearch(''); setCategoryFilter('ALL'); setStatusFilter('ALL'); }}
                  className="p-1.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-600 hover:bg-slate-100 flex items-center gap-1"
                >
                  <RefreshCw className="w-3.5 h-3.5" /> Làm mới
                </button>
              </div>
            </div>

            {/* Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-slate-200 bg-slate-50 text-[10.5px] font-bold text-slate-500 uppercase">
                    <th className="py-2.5 px-3">STT</th>
                    <th className="py-2.5 px-3">Mã hồ sơ</th>
                    <th className="py-2.5 px-3">Tên sản phẩm</th>
                    <th className="py-2.5 px-3">Chủ thể</th>
                    <th className="py-2.5 px-3">Nhóm ngành</th>
                    <th className="py-2.5 px-3">Tiến độ hoàn thiện</th>
                    <th className="py-2.5 px-3">Số sao dự kiến</th>
                    <th className="py-2.5 px-3">Trạng thái</th>
                    <th className="py-2.5 px-3 text-right">Thao tác</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                  {filteredDossiers.map((d, index) => (
                    <tr
                      key={d.id}
                      onClick={() => setSelectedDossier(d)}
                      className={`cursor-pointer transition-colors ${
                        selectedDossier?.id === d.id ? 'bg-emerald-50/70 font-bold' : 'hover:bg-slate-50/80'
                      }`}
                    >
                      <td className="py-2.5 px-3 font-mono text-slate-400">{index + 1}</td>
                      <td className="py-2.5 px-3 font-mono text-slate-600 font-bold">{d.code}</td>
                      <td className="py-2.5 px-3 font-extrabold text-slate-900">{d.productName}</td>
                      <td className="py-2.5 px-3 text-slate-600">{d.subjectName}</td>
                      <td className="py-2.5 px-3">
                        <span className="px-2 py-0.5 rounded-lg bg-emerald-100/80 text-emerald-800 font-bold text-[10.5px]">
                          {d.productCategory.split(' ')[0]}
                        </span>
                      </td>
                      <td className="py-2.5 px-3">
                        <div className="w-24 space-y-1">
                          <div className="flex justify-between text-[10px] font-bold">
                            <span>{d.progressPercent}%</span>
                          </div>
                          <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                            <div
                              className={`h-full rounded-full ${
                                d.progressPercent >= 80 ? 'bg-emerald-600' : d.progressPercent >= 50 ? 'bg-sky-500' : 'bg-amber-500'
                              }`}
                              style={{ width: `${d.progressPercent}%` }}
                            />
                          </div>
                        </div>
                      </td>
                      <td className="py-2.5 px-3">
                        <div className="flex items-center gap-0.5 text-amber-500 font-bold text-[11px]">
                          <span>{d.targetStar} sao</span>
                          <div className="flex">
                            {Array.from({ length: d.targetStar }).map((_, i) => (
                              <Star key={i} className="w-3 h-3 fill-amber-400 text-amber-400" />
                            ))}
                          </div>
                        </div>
                      </td>
                      <td className="py-2.5 px-3">
                        <span className={`pill-badge text-[10px] ${
                          d.status === 'CERTIFIED' ? 'pill-green' : d.status === 'IN_EVALUATION' ? 'pill-blue' : 'pill-amber'
                        }`}>
                          {d.statusLabel}
                        </span>
                      </td>
                      <td className="py-2.5 px-3 text-right space-x-1.5" onClick={(e) => e.stopPropagation()}>
                        <button
                          onClick={() => navigate(`/ocop/dossiers/${d.id}`)}
                          className="p-1 text-slate-400 hover:text-emerald-700 transition-colors"
                          title="Xem chi tiết"
                        >
                          <Eye className="w-4 h-4 inline" />
                        </button>
                        <button
                          onClick={() => navigate(`/ocop/dossiers/new`)}
                          className="p-1 text-slate-400 hover:text-sky-700 transition-colors"
                          title="Chỉnh sửa"
                        >
                          <Edit className="w-4 h-4 inline" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Bottom 3 Summary Charts Row (Matching Image 1 Bottom) */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Donut Chart: Tiến độ hoàn thiện */}
            <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs space-y-3">
              <h4 className="font-extrabold text-slate-900 text-xs border-b pb-2">
                Tiến độ hoàn thiện hồ sơ
              </h4>
              <div className="h-44 relative flex items-center justify-center">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={doughnutData}
                      cx="50%"
                      cy="50%"
                      innerRadius={45}
                      outerRadius={65}
                      paddingAngle={4}
                      dataKey="value"
                    >
                      {doughnutData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                  </PieChart>
                </ResponsiveContainer>
                <div className="absolute text-center">
                  <div className="text-xl font-black text-slate-900">72%</div>
                  <div className="text-[10px] text-slate-400 font-bold">Hoàn thiện</div>
                </div>
              </div>
            </div>

            {/* Bar Chart: Số lượng SP theo sao */}
            <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs space-y-3">
              <h4 className="font-extrabold text-slate-900 text-xs border-b pb-2">
                Số lượng sản phẩm theo phân hạng sao
              </h4>
              <div className="h-44">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={barDataStar}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                    <XAxis dataKey="star" tick={{ fontSize: 10, fontWeight: 700 }} />
                    <YAxis tick={{ fontSize: 10 }} />
                    <Bar dataKey="count" radius={[6, 6, 0, 0]}>
                      {barDataStar.map((entry, index) => (
                        <Cell key={`bar-${index}`} fill={entry.fill} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Pie Chart: Nhóm ngành */}
            <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs space-y-3">
              <h4 className="font-extrabold text-slate-900 text-xs border-b pb-2">
                Nhóm ngành sản phẩm
              </h4>
              <div className="h-44 flex items-center">
                <ResponsiveContainer width="60%" height="100%">
                  <PieChart>
                    <Pie data={categoryPieData} cx="50%" cy="50%" outerRadius={55} dataKey="value">
                      {categoryPieData.map((entry, index) => (
                        <Cell key={`pie-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                  </PieChart>
                </ResponsiveContainer>
                <div className="space-y-1 text-[11px] font-bold text-slate-600">
                  {categoryPieData.map((item, idx) => (
                    <div key={idx} className="flex items-center gap-1.5">
                      <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: item.color }} />
                      <span>{item.name}: {item.value}%</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Panel (1/3 width) - "Chi tiết hồ sơ OCOP" Side Drawer Preview (Matching Image 1 Right Panel) */}
        {selectedDossier && (
          <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs space-y-5 flex flex-col h-fit sticky top-20">
            {/* Header Product Card */}
            <div className="flex items-start justify-between border-b pb-4">
              <div className="flex items-center gap-3">
                <div className="w-16 h-16 rounded-xl overflow-hidden bg-slate-100 border border-slate-200 shrink-0">
                  <img
                    src={selectedDossier.productImage || 'https://images.unsplash.com/photo-1563565375-f3fdfdbefa83?auto=format&fit=crop&w=600&q=80'}
                    alt={selectedDossier.productName}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div>
                  <h3 className="font-black text-slate-900 text-sm">{selectedDossier.productName}</h3>
                  <div className="text-[11px] text-slate-500 font-mono mt-0.5">Mã hồ sơ: {selectedDossier.code}</div>
                  <span className="pill-badge pill-amber text-[10px] mt-1">{selectedDossier.statusLabel}</span>
                </div>
              </div>

              {/* Circular Gauge Score */}
              <div className="w-14 h-14 rounded-full bg-emerald-50 border-4 border-emerald-600 flex flex-col items-center justify-center shrink-0 shadow-xs">
                <span className="text-xs font-black text-emerald-950">{selectedDossier.progressPercent}%</span>
                <span className="text-[8px] text-emerald-700 font-bold uppercase">Hoàn thiện</span>
              </div>
            </div>

            {/* Preview Sub-Tabs */}
            <div className="flex items-center border-b text-xs font-bold text-slate-500 overflow-x-auto">
              <button
                onClick={() => setPreviewTab('overview')}
                className={`py-2 px-3 border-b-2 transition-all ${
                  previewTab === 'overview' ? 'border-emerald-700 text-emerald-900 font-black' : 'border-transparent hover:text-slate-800'
                }`}
              >
                Tổng quan
              </button>
              <button
                onClick={() => setPreviewTab('eval')}
                className={`py-2 px-3 border-b-2 transition-all ${
                  previewTab === 'eval' ? 'border-emerald-700 text-emerald-900 font-black' : 'border-transparent hover:text-slate-800'
                }`}
              >
                Tự đánh giá
              </button>
              <button
                onClick={() => setPreviewTab('evidences')}
                className={`py-2 px-3 border-b-2 transition-all ${
                  previewTab === 'evidences' ? 'border-emerald-700 text-emerald-900 font-black' : 'border-transparent hover:text-slate-800'
                }`}
              >
                Minh chứng
              </button>
              <button
                onClick={() => setPreviewTab('package')}
                className={`py-2 px-3 border-b-2 transition-all ${
                  previewTab === 'package' ? 'border-emerald-700 text-emerald-900 font-black' : 'border-transparent hover:text-slate-800'
                }`}
              >
                Bộ hồ sơ
              </button>
            </div>

            {/* Tab 1: Overview Details */}
            {previewTab === 'overview' && (
              <div className="space-y-4 text-xs font-medium">
                {/* Product Info */}
                <div className="space-y-2">
                  <h4 className="font-extrabold text-slate-900 text-xs border-b pb-1">Thông tin sản phẩm</h4>
                  <div className="grid grid-cols-2 gap-1 text-[11.5px]">
                    <span className="text-slate-500">Tên sản phẩm:</span>
                    <span className="font-bold text-slate-900">{selectedDossier.productName}</span>
                    <span className="text-slate-500">Nhóm sản phẩm:</span>
                    <span className="font-semibold text-slate-800">{selectedDossier.productCategory}</span>
                    <span className="text-slate-500">Quy cách đóng gói:</span>
                    <span className="font-semibold text-slate-800">500g/hộp, 1kg/thùng</span>
                    <span className="text-slate-500">Thị trường tiêu thụ:</span>
                    <span className="font-semibold text-slate-800">Nội địa, xuất khẩu</span>
                    <span className="text-slate-500">Giá bán dự kiến:</span>
                    <span className="font-bold text-emerald-800">80.000đ/kg</span>
                  </div>
                </div>

                {/* Subject HTX Info */}
                <div className="space-y-2 pt-2 border-t">
                  <h4 className="font-extrabold text-slate-900 text-xs border-b pb-1 flex items-center justify-between">
                    <span>Thông tin chủ thể</span>
                    <span className="text-[10px] text-emerald-700 font-bold hover:underline cursor-pointer">Xem chi tiết HTX</span>
                  </h4>
                  <div className="space-y-1 text-[11.5px]">
                    <div className="flex justify-between">
                      <span className="text-slate-500">Tên đơn vị:</span>
                      <span className="font-bold text-slate-900 text-right">{selectedDossier.subjectName}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">Địa chỉ:</span>
                      <span className="font-semibold text-slate-800 text-right">{selectedDossier.address}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">MST:</span>
                      <span className="font-mono text-slate-800">5801234567</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">Người đại diện:</span>
                      <span className="font-bold text-slate-900">{selectedDossier.representative} - Giám đốc</span>
                    </div>
                  </div>
                </div>

                {/* Farm Plot Scale */}
                <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-2">
                  <h4 className="font-extrabold text-slate-900 text-[11px]">Quy mô vùng trồng</h4>
                  <div className="grid grid-cols-3 gap-2 text-center text-[10.5px]">
                    <div className="bg-white p-1.5 rounded-lg border">
                      <div className="text-slate-400">Diện tích</div>
                      <div className="font-black text-emerald-900 mt-0.5">25.5 ha</div>
                    </div>
                    <div className="bg-white p-1.5 rounded-lg border">
                      <div className="text-slate-400">Sản lượng</div>
                      <div className="font-black text-emerald-900 mt-0.5">120 tấn/năm</div>
                    </div>
                    <div className="bg-white p-1.5 rounded-lg border">
                      <div className="text-slate-400">Địa điểm</div>
                      <div className="font-bold text-slate-800 mt-0.5">Lâm Hà</div>
                    </div>
                  </div>
                </div>

                {/* Related Documents */}
                <div className="space-y-2 pt-2 border-t">
                  <h4 className="font-extrabold text-slate-900 text-xs border-b pb-1">Tài liệu liên quan</h4>
                  <div className="space-y-1.5 text-[11px]">
                    <div className="p-2 bg-slate-50 rounded-lg flex items-center justify-between border">
                      <div className="flex items-center gap-2 truncate">
                        <FileText className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                        <span className="truncate font-semibold">Giấy chứng nhận VietGAP (2.4 MB)</span>
                      </div>
                      <span className="pill-badge pill-green text-[9.5px]">Hợp lệ</span>
                    </div>
                    <div className="p-2 bg-slate-50 rounded-lg flex items-center justify-between border">
                      <div className="flex items-center gap-2 truncate">
                        <FileText className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                        <span className="truncate font-semibold">Kết quả kiểm nghiệm chất lượng (1.2 MB)</span>
                      </div>
                      <span className="pill-badge pill-green text-[9.5px]">Hợp lệ</span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Footer Action Buttons */}
            <div className="pt-3 border-t space-y-2">
              <button
                onClick={() => navigate(`/ocop/dossiers/${selectedDossier.id}`)}
                className="w-full py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white font-extrabold text-xs rounded-xl shadow-xs transition-all text-center flex items-center justify-center gap-1.5"
              >
                Mở Workspace Chấm điểm OCOP &rsaquo;
              </button>
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => setIsFormModalOpen(true)}
                  className="py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl"
                >
                  Xuất Biểu mẫu QĐ 148
                </button>
                <button
                  onClick={() => navigate('/ocop/dossiers/new')}
                  className="py-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 font-bold text-xs rounded-xl border border-emerald-200"
                >
                  Sửa hồ sơ
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* QĐ 148 Export Modal */}
      {selectedDossier && (
        <Qd148DocumentModal
          isOpen={isFormModalOpen}
          onClose={() => setIsFormModalOpen(false)}
          dossier={selectedDossier}
        />
      )}
    </div>
  );
};
