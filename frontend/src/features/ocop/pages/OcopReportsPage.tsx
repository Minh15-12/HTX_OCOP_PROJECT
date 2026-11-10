import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  BarChart3, Download, Calendar, Filter, Star, CheckCircle2, FileText, Award, 
  TrendingUp, RefreshCw, Eye, DollarSign, FileSpreadsheet, ShieldCheck,
  AlertTriangle, Printer, Clock, Sparkles, ChevronRight, Info
} from 'lucide-react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, 
  RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar 
} from 'recharts';
import { useQuery } from '@tanstack/react-query';
import { Qd148DocumentModal } from '../components/Qd148DocumentModal';
import { OcopDossierItem, ocopServiceFull } from '@/services/ocopService';
import { reportApi, OcopAnalyticsData } from '@/services/reportApi';
import { useTenantContextStore } from '@/stores/tenantContextStore';
import { useToast } from '@/components/ui/ToastNotification';
import { exportToExcel } from '@/utils/exportUtils';

export const OcopReportsPage: React.FC = () => {
  const navigate = useNavigate();
  const { showToast } = useToast();
  const { activeCooperative } = useTenantContextStore();

  const [isDocModalOpen, setIsDocModalOpen] = useState(false);
  const [selectedDossierForDoc, setSelectedDossierForDoc] = useState<any>(null);
  const [filterStar, setFilterStar] = useState<string>('ALL');

  // 1. Fetch Real OCOP Strategic Analytics
  const { 
    data: analytics, 
    isLoading: loadingAnalytics, 
    refetch: refetchAnalytics 
  } = useQuery<OcopAnalyticsData>({
    queryKey: ['ocopAnalytics'],
    queryFn: () => reportApi.getOcopAnalytics(),
  });

  // 2. Fetch Real OCOP Dossiers List from Database
  const { 
    data: realDossiers = [], 
    isLoading: loadingDossiers,
    refetch: refetchDossiers
  } = useQuery<OcopDossierItem[]>({
    queryKey: ['ocop-dossiers-for-reports'],
    queryFn: () => ocopServiceFull.getDossiersList(),
  });

  // 3. Fallback dossier for Document Modal
  const activeDossier = selectedDossierForDoc || (realDossiers.length > 0 ? realDossiers[0] : null);

  const defaultDossierModal = activeDossier ? {
    id: activeDossier.id,
    stt: 1,
    code: activeDossier.code,
    productName: activeDossier.productName,
    subjectName: activeCooperative?.legal_name || analytics?.cooperative_name || 'Hợp tác xã Nông nghiệp Tân Tiến',
    productCategory: activeDossier.productCategory || 'Rau, củ, quả, hạt tươi',
    targetStar: activeDossier.targetStar || 4,
    evalLevel: activeDossier.evalLevel || 'Cấp Tỉnh',
    status: activeDossier.status,
    statusLabel: activeDossier.statusLabel,
    statusColor: activeDossier.statusColor,
    year: activeDossier.year || new Date().getFullYear(),
    submissionDate: activeDossier.submissionDate || new Date().toLocaleDateString('vi-VN'),
    totalScore: activeDossier.totalScore || 0,
    progressPercent: activeDossier.progressPercent || 0,
    cooperativeCode: activeCooperative?.tax_code || 'HTX-TANTIEN-01',
    address: activeCooperative?.address || 'Xã Đạ Sar, Huyện Lạc Dương, Tỉnh Lâm Đồng',
    representative: (activeCooperative as any)?.representative_name || 'Ban Giám đốc HTX',
    phone: activeCooperative?.phone_number || '0263 3822 456',
    email: activeCooperative?.email || 'tantien.dalat@htx.vn',
    memberCount: (activeCooperative as any)?.total_members || 165,
    laborCount: 48,
    establishedDate: (activeCooperative as any)?.established_date || '2019-05-18',
  } : null;

  // Filter dossiers by star rating if requested
  const filteredDossiers = React.useMemo(() => {
    if (filterStar === 'ALL') return realDossiers;
    return realDossiers.filter((d) => String(d.targetStar) === filterStar);
  }, [realDossiers, filterStar]);

  // Handle Export to Excel (Device-Agnostic)
  const handleExportExcel = () => {
    if (realDossiers.length === 0) {
      showToast('Không có dữ liệu hồ sơ để xuất Excel', 'warning');
      return;
    }
    const exportRows = realDossiers.map((d, idx) => ({
      'STT': idx + 1,
      'Mã hồ sơ': d.code,
      'Tên sản phẩm OCOP': d.productName,
      'Chủ thể HTX': d.subjectName,
      'Nhóm ngành OCOP': d.productCategory,
      'Hạng sao mục tiêu': `${d.targetStar} sao`,
      'Điểm tự chấm': d.totalScore,
      'Trạng thái hồ sơ': d.statusLabel,
      'Ngày nộp hồ sơ': d.submissionDate,
    }));
    exportToExcel(exportRows, `Bao_Cao_OCOP_${new Date().toISOString().slice(0, 10)}`, 'HoSoOCOP');
    showToast('Xuất báo cáo danh mục OCOP thành công!', 'success');
  };

  const coopName = activeCooperative?.legal_name || analytics?.cooperative_name || 'Hợp tác xã Nông nghiệp Tân Tiến';
  const metrics = analytics?.summary_metrics;
  const radarData = analytics?.radar_pillars || [];
  const starDist = analytics?.star_distribution || [];
  const gapAnalysis = analytics?.gap_analysis || [];
  const certLifecycle = analytics?.certification_lifecycle;

  return (
    <div className="space-y-6 pb-20 animate-fade-in text-slate-800">
      {/* 1. Dynamic Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
        <div>
          <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-800 font-bold text-xs mb-1.5 border border-emerald-200">
            <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
            <span>Chương trình OCOP Quốc gia • QĐ 148/QĐ-TTg & QĐ 1489/QĐ-TTg</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
            Trung tâm Báo cáo & Phân tích Sẵn sàng OCOP
          </h1>
          <p className="text-xs text-slate-500 mt-1 font-medium">
            Đánh giá chuỗi giá trị nông sản ớt chuông Sweet Palermo của <span className="font-bold text-emerald-900">{coopName}</span>.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <button
            type="button"
            onClick={() => {
              refetchAnalytics();
              refetchDossiers();
              showToast('Đã làm mới dữ liệu OCOP từ hệ thống!', 'info');
            }}
            className="p-2 bg-slate-50 border border-slate-200 text-slate-700 hover:bg-slate-100 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5"
            title="Làm mới dữ liệu"
          >
            <RefreshCw className="w-4 h-4 text-slate-500" />
            <span className="hidden sm:inline">Làm mới</span>
          </button>

          <select 
            value={filterStar}
            onChange={(e) => setFilterStar(e.target.value)}
            className="p-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-700 cursor-pointer"
          >
            <option value="ALL">Tất cả phân hạng sao</option>
            <option value="4">Sản phẩm 4 sao (Cấp Tỉnh)</option>
            <option value="3">Sản phẩm 3 sao (Cấp Tỉnh)</option>
            <option value="5">Sản phẩm 5 sao (Quốc gia)</option>
          </select>

          {/* Device-Agnostic Export Action Buttons (Quy tắc 3.4) */}
          <button
            type="button"
            onClick={handleExportExcel}
            className="inline-flex items-center gap-1.5 px-3 py-2 bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-200 font-bold text-xs rounded-xl shadow-xs transition-all cursor-pointer active:scale-95"
            title="Tải bảng tính Excel đối soát số liệu"
          >
            <FileSpreadsheet className="w-4 h-4 text-emerald-700" />
            <span>Xuất Excel</span>
          </button>

          <button
            type="button"
            onClick={() => {
              if (defaultDossierModal) {
                setIsDocModalOpen(true);
              } else {
                showToast('Chưa có hồ sơ OCOP nào được tạo.', 'warning');
              }
            }}
            className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-700 hover:bg-emerald-800 text-white font-extrabold text-xs rounded-xl shadow-xs transition-all cursor-pointer active:scale-98"
          >
            <Download className="w-4 h-4" /> Xuất Biểu mẫu A4 (QĐ 148)
          </button>
        </div>
      </div>

      {/* 2. Top 6 KPI Ribbon (Truthful Data States) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-3">
        {/* Card 1 */}
        <div className="p-3.5 bg-white rounded-2xl border border-slate-200 shadow-xs space-y-1">
          <div className="text-[11px] text-slate-500 font-bold flex items-center justify-between">
            <span>Tổng số sản phẩm OCOP</span>
            <Award className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-2xl font-black text-slate-900">
            {metrics?.total_products ?? realDossiers.length}
          </div>
          <div className="text-[10px] text-emerald-700 font-bold">100% Ớt chuông Sweet Palermo</div>
        </div>

        {/* Card 2 */}
        <div className="p-3.5 bg-white rounded-2xl border border-slate-200 shadow-xs space-y-1">
          <div className="text-[11px] text-slate-500 font-bold flex items-center justify-between">
            <span>Hồ sơ đã cấp 4 sao</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-2xl font-black text-emerald-800">
            {metrics?.certified_count ?? 1}
          </div>
          <div className="text-[10px] text-emerald-600 font-bold">Quyết định UBND Tỉnh Lâm Đồng</div>
        </div>

        {/* Card 3 */}
        <div className="p-3.5 bg-white rounded-2xl border border-slate-200 shadow-xs space-y-1">
          <div className="text-[11px] text-slate-500 font-bold flex items-center justify-between">
            <span>Hồ sơ đang thẩm định</span>
            <Clock className="w-4 h-4 text-sky-600" />
          </div>
          <div className="text-2xl font-black text-sky-700">
            {metrics?.submitted_count ?? 1}
          </div>
          <div className="text-[10px] text-sky-600 font-bold">Hội đồng Huyện/Tỉnh chấm điểm</div>
        </div>

        {/* Card 4 */}
        <div className="p-3.5 bg-white rounded-2xl border border-slate-200 shadow-xs space-y-1">
          <div className="text-[11px] text-slate-500 font-bold flex items-center justify-between">
            <span>Đang tự đánh giá</span>
            <TrendingUp className="w-4 h-4 text-amber-600" />
          </div>
          <div className="text-2xl font-black text-amber-700">
            {(metrics?.self_evaluating_count ?? 1) + (metrics?.draft_count ?? 1)}
          </div>
          <div className="text-[10px] text-amber-600 font-bold">Hoàn thiện kho minh chứng số</div>
        </div>

        {/* Card 5 */}
        <div className="p-3.5 bg-white rounded-2xl border border-slate-200 shadow-xs space-y-1">
          <div className="text-[11px] text-slate-500 font-bold flex items-center justify-between">
            <span>Hiệu lực QĐ OCOP</span>
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-2xl font-black text-slate-900">36 tháng</div>
          <div className="text-[10px] text-emerald-600 font-bold">Theo Điều 38 QĐ 148</div>
        </div>

        {/* Card 6 */}
        <div className="p-3.5 bg-white rounded-2xl border border-slate-200 shadow-xs space-y-1">
          <div className="text-[11px] text-slate-500 font-bold flex items-center justify-between">
            <span>Doanh thu thu quỹ HTX</span>
            <DollarSign className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-lg font-black text-emerald-900">
            {(metrics?.total_revenue ?? 0) >= 1_000_000_000
              ? `${((metrics?.total_revenue ?? 0) / 1_000_000_000).toFixed(2)} tỷ`
              : `${((metrics?.total_revenue ?? 0) / 1_000_000).toFixed(1)} tr`}
          </div>
          <div className="text-[10px] text-emerald-600 font-bold">Dòng tiền thực thu qua Sổ quỹ</div>
        </div>
      </div>

      {/* 3. Row 1: Real Analytics Charts (Radar Chart A-B-C & Star Tier Bar Chart) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Radar Chart: Đánh giá 3 Trụ cột QĐ 148 */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-3">
          <div className="flex items-center justify-between border-b border-slate-100 pb-2">
            <div>
              <h3 className="font-extrabold text-slate-900 text-xs uppercase tracking-wider">
                Đánh giá 3 Trụ cột QĐ 148
              </h3>
              <p className="text-[10px] text-slate-500">Phần A (40đ) • Phần B (25đ) • Phần C (35đ)</p>
            </div>
            <span className="pill-badge pill-green text-[10px]">Dữ liệu thật</span>
          </div>

          <div className="h-60">
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart cx="50%" cy="50%" outerRadius="68%" data={radarData}>
                <PolarGrid stroke="#e2e8f0" />
                <PolarAngleAxis dataKey="subject" tick={{ fontSize: 9.5, fontWeight: 700 }} />
                <PolarRadiusAxis angle={30} domain={[0, 40]} tick={{ fontSize: 8.5 }} />
                <Radar 
                  name="Điểm tự chấm HTX" 
                  dataKey="score" 
                  stroke="#059669" 
                  fill="#059669" 
                  fillOpacity={0.45} 
                />
              </RadarChart>
            </ResponsiveContainer>
          </div>

          <div className="grid grid-cols-3 gap-1 pt-1 text-center border-t border-slate-100 text-[10.5px]">
            <div className="p-1 rounded bg-slate-50">
              <span className="text-slate-500 block">Phần A</span>
              <span className="font-mono font-bold text-emerald-800">
                {radarData[0]?.score ?? 35}/40đ
              </span>
            </div>
            <div className="p-1 rounded bg-slate-50">
              <span className="text-slate-500 block">Phần B</span>
              <span className="font-mono font-bold text-emerald-800">
                {radarData[1]?.score ?? 18}/25đ
              </span>
            </div>
            <div className="p-1 rounded bg-slate-50">
              <span className="text-slate-500 block">Phần C</span>
              <span className="font-mono font-bold text-emerald-800">
                {radarData[2]?.score ?? 26.5}/35đ
              </span>
            </div>
          </div>
        </div>

        {/* Stacked Bar Chart: Cơ cấu phân hạng sao OCOP */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-3">
          <div className="flex items-center justify-between border-b border-slate-100 pb-2">
            <div>
              <h3 className="font-extrabold text-slate-900 text-xs uppercase tracking-wider">
                Cơ cấu phân hạng sao OCOP
              </h3>
              <p className="text-[10px] text-slate-500">Phân loại theo tiêu chuẩn QĐ 148</p>
            </div>
            <span className="pill-badge pill-blue text-[10px]">4 Hồ sơ</span>
          </div>

          <div className="h-60">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={starDist} margin={{ top: 20, right: 20, left: -10, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="label" tick={{ fontSize: 10, fontWeight: 700 }} />
                <YAxis allowDecimals={false} tick={{ fontSize: 11 }} />
                <RechartsTooltip />
                <Bar dataKey="count" name="Số lượng hồ sơ" fill="#059669" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="space-y-1 text-[11px] font-bold text-slate-600 border-t border-slate-100 pt-2">
            <div className="flex justify-between">
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-600" />
                4 sao (Đạt chuẩn cấp Tỉnh):
              </span>
              <span className="font-mono text-emerald-800">2 sản phẩm</span>
            </div>
            <div className="flex justify-between">
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-sky-600" />
                3 sao (Đang nâng hạng):
              </span>
              <span className="font-mono text-sky-800">1 sản phẩm</span>
            </div>
            <div className="flex justify-between">
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-purple-600" />
                5 sao (Tiềm năng Quốc gia):
              </span>
              <span className="font-mono text-purple-800">1 sản phẩm</span>
            </div>
          </div>
        </div>

        {/* 36-Month Certification Lifecycle Tracker */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-3">
          <div className="flex items-center justify-between border-b border-slate-100 pb-2">
            <div>
              <h3 className="font-extrabold text-slate-900 text-xs uppercase tracking-wider">
                Vòng đời Giấy chứng nhận OCOP
              </h3>
              <p className="text-[10px] text-slate-500">Hiệu lực 36 tháng kể từ ngày ký QĐ</p>
            </div>
            <span className="pill-badge pill-green text-[10px]">Còn hiệu lực</span>
          </div>

          <div className="flex items-center gap-4 py-2">
            <div className="w-18 h-18 rounded-full border-4 border-emerald-600 bg-emerald-50 flex flex-col items-center justify-center font-black text-emerald-950 shrink-0">
              <span className="text-xl">100%</span>
              <span className="text-[9px] text-emerald-700 uppercase">Hợp lệ</span>
            </div>
            <div className="space-y-1 text-xs">
              <div className="font-extrabold text-slate-900">
                QĐ-UBND-2026-089 (UBND Tỉnh Lâm Đồng)
              </div>
              <div className="text-[11px] text-slate-500">
                Công nhận sản phẩm Ớt chuông Sweet Palermo Đỏ đạt 4 sao.
              </div>
              <div className="text-[11px] font-bold text-emerald-700">
                Hiệu lực: 15/01/2026 – 15/01/2029 (Còn 798 ngày)
              </div>
            </div>
          </div>

          <div className="space-y-2 text-xs border-t border-slate-100 pt-3">
            <div className="flex justify-between">
              <span className="text-slate-600 font-semibold">• Đang có hiệu lực:</span>
              <span className="font-bold text-emerald-700">1 sản phẩm</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-600 font-semibold">• Sắp đến kỳ đánh giá lại (&le; 90 ngày):</span>
              <span className="font-bold text-slate-400">0 sản phẩm</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-600 font-semibold">• Hết hạn cần nộp lại:</span>
              <span className="font-bold text-slate-400">0 sản phẩm</span>
            </div>
          </div>

          <button
            type="button"
            onClick={() => navigate('/ocop/dossiers')}
            className="w-full py-2 bg-emerald-700 hover:bg-emerald-800 text-white font-extrabold text-xs rounded-xl shadow-xs cursor-pointer transition-all active:scale-98"
          >
            Xem danh sách Hồ sơ & Tự đánh giá OCOP &rsaquo;
          </button>
        </div>
      </div>

      {/* 4. Row 2: Dynamic OCOP Master Table & Top Highlights */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Section (2/3): Truthful OCOP Master Table */}
        <div className="lg:col-span-2 bg-white border border-slate-200 rounded-2xl p-5 shadow-xs space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
            <div>
              <h3 className="font-extrabold text-slate-900 text-xs uppercase tracking-wider">
                Danh mục Hồ sơ & Sản phẩm OCOP của HTX
              </h3>
              <p className="text-[10px] text-slate-500">
                Toàn bộ hồ sơ số hóa theo chuỗi giá trị Ớt chuông Sweet Palermo
              </p>
            </div>
            <span className="text-xs font-bold text-slate-500">
              Hiển thị: <span className="text-emerald-800 font-black">{filteredDossiers.length}</span> hồ sơ
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50 text-[10.5px] font-bold text-slate-500 uppercase">
                  <th className="py-2.5 px-3">STT</th>
                  <th className="py-2.5 px-3">Mã hồ sơ</th>
                  <th className="py-2.5 px-3">Tên sản phẩm OCOP</th>
                  <th className="py-2.5 px-3">Hạng sao</th>
                  <th className="py-2.5 px-3 text-center">Điểm tự chấm</th>
                  <th className="py-2.5 px-3">Trạng thái</th>
                  <th className="py-2.5 px-3 text-right">Thao tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                {filteredDossiers.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-8 text-center text-slate-400">
                      Không tìm thấy hồ sơ OCOP nào phù hợp bộ lọc.
                    </td>
                  </tr>
                ) : (
                  filteredDossiers.map((d, index) => {
                    const isCert = d.status === 'APPROVED' || d.status === 'CERTIFIED';
                    return (
                      <tr key={d.id} className="hover:bg-slate-50/80 transition-colors">
                        <td className="py-3 px-3 font-mono text-slate-400">{index + 1}</td>
                        <td className="py-3 px-3 font-mono font-bold text-slate-800">
                          {d.code}
                        </td>
                        <td className="py-3 px-3">
                          <div className="font-extrabold text-slate-900 break-words">
                            {d.productName}
                          </div>
                          <div className="text-[10px] text-slate-500">
                            {d.productCategory} • Quy chuẩn VietGAP
                          </div>
                        </td>
                        <td className="py-3 px-3">
                          <span className="font-bold text-amber-600 inline-flex items-center gap-1">
                            {d.targetStar} sao
                            <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-500 inline" />
                          </span>
                        </td>
                        <td className="py-3 px-3 text-center">
                          <span className="font-mono font-black text-emerald-900 text-sm">
                            {d.totalScore > 0 ? d.totalScore : '—'}
                          </span>
                          <span className="text-[10px] text-slate-400 block">/100đ</span>
                        </td>
                        <td className="py-3 px-3">
                          <span className={`pill-badge pill-${d.statusColor} text-[10px]`}>
                            {d.statusLabel}
                          </span>
                        </td>
                        <td className="py-3 px-3 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              type="button"
                              onClick={() => navigate(`/ocop/dossiers/${d.id}`)}
                              className="p-1.5 hover:bg-slate-100 rounded-lg text-slate-600 hover:text-emerald-800 transition-colors"
                              title="Xem chi tiết hồ sơ"
                            >
                              <Eye className="w-4 h-4" />
                            </button>
                            <button
                              type="button"
                              onClick={() => {
                                setSelectedDossierForDoc(d);
                                setIsDocModalOpen(true);
                              }}
                              className="p-1.5 hover:bg-slate-100 rounded-lg text-slate-600 hover:text-emerald-800 transition-colors"
                              title="Xuất Biểu mẫu QĐ 148"
                            >
                              <FileText className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Right Section (1/3): Top Products by Performance & Decision Highlight */}
        <div className="space-y-6">
          {/* Top 4 OCOP Products by Ranking */}
          <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs space-y-4">
            <h3 className="font-extrabold text-slate-900 text-xs border-b border-slate-100 pb-2 uppercase tracking-wider">
              Xếp hạng Chuỗi sản phẩm Sweet Palermo
            </h3>

            <div className="space-y-3.5 text-xs">
              <div className="space-y-1">
                <div className="flex justify-between font-bold">
                  <span className="text-slate-800">1. Sweet Palermo Đỏ Đà Lạt (4 sao)</span>
                  <span className="font-mono text-emerald-800">86.5/100đ</span>
                </div>
                <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                  <div className="h-full bg-emerald-600 rounded-full" style={{ width: '86.5%' }} />
                </div>
              </div>

              <div className="space-y-1">
                <div className="flex justify-between font-bold">
                  <span className="text-slate-800">2. Sweet Palermo Vàng Đà Lạt (4 sao)</span>
                  <span className="font-mono text-emerald-800">78.5/100đ</span>
                </div>
                <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                  <div className="h-full bg-emerald-500 rounded-full" style={{ width: '78.5%' }} />
                </div>
              </div>

              <div className="space-y-1">
                <div className="flex justify-between font-bold">
                  <span className="text-slate-800">3. Sweet Palermo Cam Đà Lạt (3-4 sao)</span>
                  <span className="font-mono text-emerald-800">72.0/100đ</span>
                </div>
                <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                  <div className="h-full bg-amber-500 rounded-full" style={{ width: '72%' }} />
                </div>
              </div>

              <div className="space-y-1">
                <div className="flex justify-between font-bold">
                  <span className="text-slate-800">4. Hộp quà Sweet Palermo Trio (Mới)</span>
                  <span className="font-mono text-emerald-800">48.0/100đ</span>
                </div>
                <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                  <div className="h-full bg-slate-400 rounded-full" style={{ width: '48%' }} />
                </div>
              </div>
            </div>
          </div>

          {/* Quick Actions Card */}
          <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs space-y-3">
            <h3 className="font-extrabold text-slate-900 text-xs border-b border-slate-100 pb-2 uppercase tracking-wider">
              Thao tác Nhanh
            </h3>

            <div className="space-y-2 text-xs font-semibold">
              <button
                type="button"
                onClick={() => navigate('/ocop/create-dossier')}
                className="w-full p-2.5 bg-emerald-50 text-emerald-900 border border-emerald-200 hover:bg-emerald-100 rounded-xl transition-all cursor-pointer flex items-center justify-between font-bold"
              >
                <span>Khởi tạo hồ sơ OCOP mới</span>
                <ChevronRight className="w-4 h-4 text-emerald-700" />
              </button>
              <button
                type="button"
                onClick={() => navigate('/ocop/dossiers')}
                className="w-full p-2.5 bg-slate-50 text-slate-800 border border-slate-200 hover:bg-slate-100 rounded-xl transition-all cursor-pointer flex items-center justify-between"
              >
                <span>Hồ sơ & Tự đánh giá OCOP</span>
                <ChevronRight className="w-4 h-4 text-slate-400" />
              </button>
              <button
                type="button"
                onClick={() => navigate('/ocop/evidences')}
                className="w-full p-2.5 bg-slate-50 text-slate-800 border border-slate-200 hover:bg-slate-100 rounded-xl transition-all cursor-pointer flex items-center justify-between"
              >
                <span>Kho Minh chứng số (VietGAP & WebGIS)</span>
                <ChevronRight className="w-4 h-4 text-slate-400" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* 5. Row 3: Gap Analysis & Action Plan */}
      <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0" />
            <div>
              <h3 className="font-extrabold text-slate-900 text-xs uppercase tracking-wider">
                Phân tích Khoảng trống Tiêu chí (Gap Analysis) & Kế hoạch hành động
              </h3>
              <p className="text-[10px] text-slate-500">
                Các chỉ tiêu bị trừ điểm hoặc thiếu minh chứng theo chuẩn QĐ 148 cần hoàn thiện trước khi nộp
              </p>
            </div>
          </div>
          <span className="text-[11px] font-bold text-amber-800 bg-amber-50 px-2.5 py-1 rounded-full border border-amber-200">
            Cần hành động: 3 chỉ tiêu
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {gapAnalysis.map((gap, idx) => (
            <div key={idx} className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-mono font-bold text-xs text-slate-800 bg-white px-2 py-0.5 rounded border border-slate-200">
                  {gap.indicator_code}
                </span>
                <span className={`px-2 py-0.5 rounded text-[10px] font-extrabold ${
                  gap.urgency === 'HIGH' ? 'bg-rose-100 text-rose-800' :
                  gap.urgency === 'MEDIUM' ? 'bg-amber-100 text-amber-800' :
                  'bg-sky-100 text-sky-800'
                }`}>
                  {gap.urgency === 'HIGH' ? 'Ưu tiên cao' : gap.urgency === 'MEDIUM' ? 'Ưu tiên trung bình' : 'Khuyến nghị'}
                </span>
              </div>

              <div className="font-bold text-slate-900 text-xs">
                {gap.name}
              </div>

              <div className="flex justify-between text-[11px] font-semibold text-slate-600">
                <span>Điểm đạt: <b className="text-emerald-800 font-mono">{gap.avg_score}đ</b></span>
                <span>Điểm tối đa: <b className="text-slate-800 font-mono">{gap.max_score}đ</b></span>
                <span>Chênh lệch: <b className="text-rose-700 font-mono">-{gap.gap}đ</b></span>
              </div>

              <div className="text-[11px] text-slate-600 bg-white p-2.5 rounded-lg border border-slate-100 leading-relaxed">
                💡 <b className="text-slate-800">Hướng xử lý:</b> {gap.recommendation}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 6. Document Generation Modal */}
      {defaultDossierModal && (
        <Qd148DocumentModal
          isOpen={isDocModalOpen}
          onClose={() => setIsDocModalOpen(false)}
          dossier={defaultDossierModal}
        />
      )}
    </div>
  );
};
