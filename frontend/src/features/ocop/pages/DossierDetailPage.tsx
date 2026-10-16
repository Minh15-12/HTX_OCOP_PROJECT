import React, { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { 
  ArrowLeft, Star, FileText, CheckSquare, Upload, Award, FileCheck, Save, Send, CheckCircle2, 
  Printer, Clock, Eye, Link as LinkIcon, ShieldCheck, ChevronRight, Download, Plus, X,
  FileSpreadsheet, Sparkles, AlertCircle, HelpCircle, Lightbulb
} from 'lucide-react';
import {
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  ResponsiveContainer,
  Tooltip as RechartsTooltip,
} from 'recharts';
import { 
  MOCK_OCOP_DOSSIERS_FULL, MOCK_CRITERIA_GROUPS_SUMMARY, 
  MOCK_EVIDENCES_FULL, EvidenceItem 
} from '../../../services/ocopService';
import { 
  OCOP_QD148_CRITERIA_DATA, 
  ALL_INDICATORS, 
  DEFAULT_SUGGESTED_SCORES, 
  calculateOcopScores 
} from '../data/ocopQd148Data';
import { FarmerCriterionCard } from '../components/FarmerCriterionCard';
import { RealtimeProgressBar } from '../components/RealtimeProgressBar';
import { SmartSuggestionButton } from '../components/SmartSuggestionButton';
import { Qd148DocumentModal } from '../components/Qd148DocumentModal';
import { exportToExcel } from '@/utils/exportUtils';

export const DossierDetailPage: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  
  const dossier = MOCK_OCOP_DOSSIERS_FULL.find((d) => d.id === id || d.code === id) || MOCK_OCOP_DOSSIERS_FULL[0];
  
  const [activeTab, setActiveTab] = useState<'overview' | 'self_eval' | 'council' | 'evidences' | 'dossier_package' | 'workflow'>('overview');
  const [activeGroupCode, setActiveGroupCode] = useState<'ALL' | 'GA' | 'GB' | 'GC'>('ALL');
  const [evidenceCategoryFilter, setEvidenceCategoryFilter] = useState<string>('ALL');
  const [highlightedCode, setHighlightedCode] = useState<string | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  
  // Modals
  const [isFormModalOpen, setIsFormModalOpen] = useState<boolean>(false);
  const [isAddEvidenceModalOpen, setIsAddEvidenceModalOpen] = useState<boolean>(false);

  // Criteria scores mapped to QĐ 148 standard 11 criteria (default to benchmark scores)
  const [criteriaScores, setCriteriaScores] = useState<Record<string, number>>({
    'TC-A.1.1': 10.0,
    'TC-A.2.1': 5.0,
    'TC-A.3.1': 10.0,
    'TC-A.4.1': 15.0,
    'TC-B.1.1': 8.0,
    'TC-B.1.2': 7.0,
    'TC-B.2.1': 8.5,
    'TC-C.1.1': 10.0,
    'TC-C.2.1': 10.0,
    'TC-C.2.2': 5.0,
    'TC-C.3.1': 10.0,
  });

  // Calculate evidences count map
  const evidenceCountMap: Record<string, number> = {
    'TC-A.1.1': 2,
    'TC-A.2.1': 1,
    'TC-A.3.1': 1,
    'TC-A.4.1': 1,
    'TC-B.1.1': 1,
    'TC-B.1.2': 2,
    'TC-B.2.1': 1,
    'TC-C.1.1': 2,
    'TC-C.2.1': 2,
    'TC-C.2.2': 1,
    'TC-C.3.1': 1,
  };

  // Real-time reactive calculation
  const calculation = calculateOcopScores(criteriaScores, evidenceCountMap);

  const filteredEvidences = MOCK_EVIDENCES_FULL.filter((ev) => {
    if (evidenceCategoryFilter === 'ALL') return true;
    return ev.category === evidenceCategoryFilter;
  });

  // Radar Chart Data preparation based on real scores
  const radarData = [
    { subject: 'Phần A (Sản phẩm)', fullName: 'Phần A: Sản phẩm & Cộng đồng', 'Điểm tối đa': 40.0, 'Điểm đạt được': calculation.partAScore },
    { subject: 'Phần B (Tiếp thị)', fullName: 'Phần B: Khả năng Tiếp thị', 'Điểm tối đa': 25.0, 'Điểm đạt được': calculation.partBScore },
    { subject: 'Phần C (Chất lượng)', fullName: 'Phần C: Chất lượng Sản phẩm', 'Điểm tối đa': 35.0, 'Điểm đạt được': calculation.partCScore },
  ];

  // 1-Click apply smart recommendations
  const handleApplySmartSuggestions = () => {
    setCriteriaScores(DEFAULT_SUGGESTED_SCORES);
    setToastMessage('Đã tự động điền toàn bộ điểm gợi ý từ hệ thống dữ liệu HTX Tân Tiến!');
    setTimeout(() => setToastMessage(null), 4000);
  };

  // Smooth scroll deep linking helper
  const scrollToCriterion = (code: string) => {
    const indicator = ALL_INDICATORS.find((c) => c.code === code || c.criterionCode === code);
    if (indicator) {
      setActiveGroupCode(indicator.groupCode);
    }
    setActiveTab('self_eval');
    setHighlightedCode(code);
    setTimeout(() => {
      const el = document.getElementById(`indicator-card-${code}`);
      if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    }, 150);
    setTimeout(() => setHighlightedCode(null), 3000);
  };

  const handleExportCriteriaExcel = () => {
    const exportData = ALL_INDICATORS.map((ind) => ({
      'Mã chỉ tiêu': ind.code,
      'Tiêu chí': ind.criterionName,
      'Nội dung đánh giá': ind.name,
      'Nhóm tiêu chí': ind.groupName,
      'Điểm tối đa': ind.maxScore,
      'Điểm tự đánh giá': criteriaScores[ind.code] ?? 0,
      'Bắt buộc (*)': ind.isMandatory ? 'Có' : 'Không',
      'Căn cứ giải trình': ind.smartSuggestion.reason,
    }));
    exportToExcel(exportData, `Bang_Diem_Tu_Danh_Gia_OCOP_${dossier.code}`, 'Diem_OCOP');
  };

  return (
    <div className="space-y-6 pb-20 animate-fade-in text-slate-800">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-5 right-5 z-50 bg-emerald-900 text-white px-5 py-3 rounded-2xl shadow-xl flex items-center gap-3 border border-emerald-700 animate-slide-in">
          <CheckCircle2 className="w-5 h-5 text-emerald-400" />
          <span className="text-xs font-bold">{toastMessage}</span>
          <button onClick={() => setToastMessage(null)} className="text-emerald-300 hover:text-white">✕</button>
        </div>
      )}

      {/* Top Bar Header */}
      <div className="flex items-center justify-between bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate('/ocop/dossiers')}
            className="p-2 rounded-xl border border-slate-200 bg-slate-50 hover:bg-white text-slate-700 transition-all shadow-xs"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[11.5px] font-mono font-bold text-slate-400">OCOP / Hồ sơ sản phẩm / {dossier.productName}</span>
              <span className="pill-badge pill-blue">{dossier.statusLabel}</span>
            </div>
            <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight mt-0.5">
              Chi tiết Hồ sơ & Tự chấm điểm OCOP
            </h1>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsFormModalOpen(true)}
            className="px-4 py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white font-extrabold text-xs rounded-xl shadow-xs transition-all flex items-center gap-1.5 active:scale-98"
          >
            <Printer className="w-4 h-4" /> Xuất Biểu mẫu QĐ 148 (A4)
          </button>
        </div>
      </div>

      {/* Product Banner & Reactive Score Meter Card */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-5">
          <div className="w-32 h-28 rounded-2xl overflow-hidden bg-slate-100 border border-slate-200 shrink-0">
            <img
              src={dossier.productImage || 'https://images.unsplash.com/photo-1563565375-f3fdfdbefa83?auto=format&fit=crop&w=600&q=80'}
              alt={dossier.productName}
              className="w-full h-full object-cover"
            />
          </div>

          <div className="space-y-1 text-xs">
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-black text-slate-900 tracking-tight">{dossier.productName}</h2>
              <span className="pill-badge pill-green text-[10.5px]">QĐ 148 Đầy đủ 100đ</span>
            </div>
            <p><strong>Mã hồ sơ:</strong> <span className="font-mono font-bold text-slate-700">{dossier.code}</span></p>
            <p><strong>Chủ thể:</strong> {dossier.subjectName}</p>
            <p><strong>Người đại diện:</strong> {dossier.representative} &bull; <strong>Điện thoại:</strong> {dossier.phone}</p>
            <p><strong>Vùng canh tác:</strong> {dossier.address} (280 ha nhà kính)</p>
            <p><strong>Cấp đánh giá:</strong> <span className="font-bold text-amber-900">{calculation.starLabel}</span></p>
          </div>
        </div>

        {/* Circular Gauge Score Meter (Real-time Reactive) */}
        <div className="flex flex-col items-center justify-center p-4 bg-emerald-50/60 rounded-2xl border border-emerald-100 shrink-0 min-w-[180px]">
          <div className="relative w-24 h-24 flex items-center justify-center">
            <svg className="w-full h-full transform -rotate-90">
              <circle cx="48" cy="48" r="38" stroke="#e2e8f0" strokeWidth="8" fill="transparent" />
              <circle
                cx="48"
                cy="48"
                r="38"
                stroke="#059669"
                strokeWidth="8"
                strokeDasharray={238}
                strokeDashoffset={238 - (238 * Math.min(calculation.totalScore, 100)) / 100}
                strokeLinecap="round"
                fill="transparent"
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-xl font-black text-emerald-950 font-mono">
                {calculation.totalScore.toFixed(1).replace('.', ',')}
              </span>
              <span className="text-[10px] font-bold text-slate-400">/ 100đ</span>
            </div>
          </div>

          <div className="flex items-center gap-1 mt-2">
            {[1, 2, 3, 4, 5].map((s) => (
              <Star
                key={s}
                className={`w-4 h-4 ${
                  s <= calculation.starRating
                    ? 'fill-amber-400 text-amber-400'
                    : 'text-slate-300'
                }`}
              />
            ))}
          </div>
          <span className="text-xs font-black text-emerald-900 mt-0.5 text-center">
            {calculation.starLabel}
          </span>
          <span className="text-[11px] font-bold text-emerald-700 font-mono mt-0.5">
            Tiến độ: {calculation.completionPercentage}% Hoàn thành
          </span>
        </div>
      </div>

      {/* Navigation Sub-Tabs Bar */}
      <div className="flex flex-wrap border-b border-slate-200 bg-white rounded-t-2xl px-4 pt-2 gap-1 text-xs font-bold">
        <button
          onClick={() => setActiveTab('overview')}
          className={`py-3 px-4 border-b-2 transition-all flex items-center gap-1.5 ${
            activeTab === 'overview' ? 'border-emerald-700 text-emerald-900 font-extrabold bg-emerald-50/50 rounded-t-xl' : 'border-transparent text-slate-500 hover:text-slate-900'
          }`}
        >
          1. Tổng quan
        </button>
        <button
          onClick={() => setActiveTab('self_eval')}
          className={`py-3 px-4 border-b-2 transition-all flex items-center gap-1.5 ${
            activeTab === 'self_eval' ? 'border-emerald-700 text-emerald-900 font-extrabold bg-emerald-50/50 rounded-t-xl' : 'border-transparent text-slate-500 hover:text-slate-900'
          }`}
        >
          2. Tự đánh giá (11 Tiêu chí)
        </button>
        <button
          onClick={() => setActiveTab('council')}
          className={`py-3 px-4 border-b-2 transition-all flex items-center gap-1.5 ${
            activeTab === 'council' ? 'border-emerald-700 text-emerald-900 font-extrabold bg-emerald-50/50 rounded-t-xl' : 'border-transparent text-slate-500 hover:text-slate-900'
          }`}
        >
          3. Hội đồng đánh giá
        </button>
        <button
          onClick={() => setActiveTab('evidences')}
          className={`py-3 px-4 border-b-2 transition-all flex items-center gap-1.5 ${
            activeTab === 'evidences' ? 'border-emerald-700 text-emerald-900 font-extrabold bg-emerald-50/50 rounded-t-xl' : 'border-transparent text-slate-500 hover:text-slate-900'
          }`}
        >
          4. Minh chứng số
        </button>
        <button
          onClick={() => setActiveTab('dossier_package')}
          className={`py-3 px-4 border-b-2 transition-all flex items-center gap-1.5 ${
            activeTab === 'dossier_package' ? 'border-emerald-700 text-emerald-900 font-extrabold bg-emerald-50/50 rounded-t-xl' : 'border-transparent text-slate-500 hover:text-slate-900'
          }`}
        >
          5. Bộ hồ sơ OCOP
        </button>
        <button
          onClick={() => setActiveTab('workflow')}
          className={`py-3 px-4 border-b-2 transition-all flex items-center gap-1.5 ${
            activeTab === 'workflow' ? 'border-emerald-700 text-emerald-900 font-extrabold bg-emerald-50/50 rounded-t-xl' : 'border-transparent text-slate-500 hover:text-slate-900'
          }`}
        >
          6. Workflow & Lịch sử
        </button>
      </div>

      {/* TAB 1: TỔNG QUAN KẾT QUẢ THEO 3 PHẦN TIÊU CHÍ QĐ 148 & BIỂU ĐỒ RA-ĐA */}
      {activeTab === 'overview' && (
        <div className="bg-white border border-slate-200 rounded-b-2xl p-6 shadow-xs space-y-6">
          <div className="flex justify-between items-center border-b pb-3">
            <div>
              <h3 className="font-black text-slate-900 text-sm">
                Kết quả tự đánh giá theo Bộ tiêu chí OCOP 100 điểm (QĐ 148/QĐ-TTg)
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Phân bổ: Phần A (40.0đ) + Phần B (25.0đ) + Phần C (35.0đ) = 100.0đ
              </p>
            </div>
            <button
              onClick={() => setActiveTab('self_eval')}
              className="text-xs text-emerald-700 font-bold hover:underline flex items-center gap-1"
            >
              Chỉnh sửa điểm tiêu chí &rsaquo;
            </button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
            {/* Left 3 cols: Table */}
            <div className="lg:col-span-3 overflow-x-auto border border-slate-200 rounded-xl">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="border-b border-slate-200 bg-slate-50 text-[11px] font-bold text-slate-500 uppercase">
                    <th className="py-3 px-4">Nhóm tiêu chí QĐ 148</th>
                    <th className="py-3 px-4 text-center">Tối đa</th>
                    <th className="py-3 px-4 text-center">Đạt được</th>
                    <th className="py-3 px-4 text-center">Tỉ lệ (%)</th>
                    <th className="py-3 px-4 text-center">Đánh giá</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-medium">
                  <tr className="hover:bg-slate-50">
                    <td className="py-3 px-4 font-bold text-slate-800">
                      Phần A: Sản phẩm & sức mạnh cộng đồng
                    </td>
                    <td className="py-3 px-4 text-center font-bold text-slate-700">40.0</td>
                    <td className="py-3 px-4 text-center font-black text-emerald-800 font-mono">
                      {calculation.partAScore.toFixed(1)}
                    </td>
                    <td className="py-3 px-4 text-center font-bold text-slate-700 font-mono">
                      {((calculation.partAScore / 40.0) * 100).toFixed(1)}%
                    </td>
                    <td className="py-3 px-4 text-center font-bold text-emerald-700">Đạt xuất sắc</td>
                  </tr>
                  <tr className="hover:bg-slate-50">
                    <td className="py-3 px-4 font-bold text-slate-800">
                      Phần B: Khả năng tiếp thị
                    </td>
                    <td className="py-3 px-4 text-center font-bold text-slate-700">25.0</td>
                    <td className="py-3 px-4 text-center font-black text-blue-800 font-mono">
                      {calculation.partBScore.toFixed(1)}
                    </td>
                    <td className="py-3 px-4 text-center font-bold text-slate-700 font-mono">
                      {((calculation.partBScore / 25.0) * 100).toFixed(1)}%
                    </td>
                    <td className="py-3 px-4 text-center font-bold text-blue-700">Đạt xuất sắc</td>
                  </tr>
                  <tr className="hover:bg-slate-50">
                    <td className="py-3 px-4 font-bold text-slate-800">
                      Phần C: Chất lượng sản phẩm
                    </td>
                    <td className="py-3 px-4 text-center font-bold text-slate-700">35.0</td>
                    <td className="py-3 px-4 text-center font-black text-purple-800 font-mono">
                      {calculation.partCScore.toFixed(1)}
                    </td>
                    <td className="py-3 px-4 text-center font-bold text-slate-700 font-mono">
                      {((calculation.partCScore / 35.0) * 100).toFixed(1)}%
                    </td>
                    <td className="py-3 px-4 text-center font-bold text-purple-700">Đạt xuất sắc</td>
                  </tr>
                  <tr className="bg-emerald-50/80 font-black text-slate-900 border-t-2 border-emerald-300">
                    <td className="py-3 px-4 uppercase text-emerald-950">TỔNG CỘNG HOÀN THÀNH</td>
                    <td className="py-3 px-4 text-center font-mono">100.0</td>
                    <td className="py-3 px-4 text-center text-emerald-950 text-sm font-mono font-black">
                      {calculation.totalScore.toFixed(1)}
                    </td>
                    <td className="py-3 px-4 text-center text-emerald-950 text-sm font-mono">
                      {((calculation.totalScore / 100.0) * 100).toFixed(1)}%
                    </td>
                    <td className="py-3 px-4 text-center text-emerald-900 font-extrabold uppercase">
                      {calculation.starLabel}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            {/* Right 2 cols: Radar Chart (Biểu đồ Ra-đa Đánh giá OCOP) */}
            <div className="lg:col-span-2 border border-slate-200 rounded-xl p-4 bg-gradient-to-br from-slate-50 to-emerald-50/40 flex flex-col justify-between">
              <div className="flex items-center justify-between border-b border-slate-200/80 pb-2">
                <h4 className="font-extrabold text-slate-900 text-xs">Biểu đồ Ra-đa 3 Nhóm Tiêu chí</h4>
                <span className="pill-badge pill-green text-[10px]">{calculation.starLabel}</span>
              </div>
              
              <div className="h-60 w-full my-2">
                <ResponsiveContainer width="100%" height="100%">
                  <RadarChart cx="50%" cy="50%" outerRadius="70%" data={radarData}>
                    <PolarGrid stroke="#cbd5e1" />
                    <PolarAngleAxis dataKey="subject" tick={{ fontSize: 10, fill: '#334155', fontWeight: 700 }} />
                    <PolarRadiusAxis angle={30} domain={[0, 40]} tick={{ fontSize: 9 }} />
                    <Radar name="Điểm tối đa" dataKey="Điểm tối đa" stroke="#94a3b8" fill="#cbd5e1" fillOpacity={0.3} />
                    <Radar name="Điểm đạt được" dataKey="Điểm đạt được" stroke="#059669" fill="#10b981" fillOpacity={0.65} />
                    <RechartsTooltip formatter={(val: any) => [`${val} điểm`]} />
                  </RadarChart>
                </ResponsiveContainer>
              </div>

              <div className="flex justify-center gap-4 text-[11px] font-bold border-t border-slate-200/80 pt-2 text-slate-600">
                <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 bg-slate-300 rounded-full"></span> Điểm tối đa</span>
                <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 bg-emerald-500 rounded-full"></span> Thực đạt</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: TỰ ĐÁNH GIÁ THEO 11 TIÊU CHÍ (FARMER-CENTRIC UX & TOUCH CARDS >=48PX) */}
      {activeTab === 'self_eval' && (
        <div className="space-y-6">
          {/* Reactive Real-time Progress Bar */}
          <RealtimeProgressBar calculation={calculation} targetStar={4} />

          {/* Sub Header Bar with Filter & 1-Click Smart Suggestion */}
          <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center flex-wrap gap-2 text-xs font-bold">
              <span className="text-slate-500 mr-1">Lọc nhóm:</span>
              <button
                type="button"
                onClick={() => setActiveGroupCode('ALL')}
                className={`px-3 py-1.5 rounded-xl transition-all ${
                  activeGroupCode === 'ALL'
                    ? 'bg-slate-900 text-white shadow-xs'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
              >
                Tất cả (11 chỉ tiêu)
              </button>
              <button
                type="button"
                onClick={() => setActiveGroupCode('GA')}
                className={`px-3 py-1.5 rounded-xl transition-all ${
                  activeGroupCode === 'GA'
                    ? 'bg-emerald-700 text-white shadow-xs'
                    : 'bg-emerald-50 text-emerald-800 hover:bg-emerald-100'
                }`}
              >
                Phần A: Sản phẩm (40đ)
              </button>
              <button
                type="button"
                onClick={() => setActiveGroupCode('GB')}
                className={`px-3 py-1.5 rounded-xl transition-all ${
                  activeGroupCode === 'GB'
                    ? 'bg-blue-700 text-white shadow-xs'
                    : 'bg-blue-50 text-blue-800 hover:bg-blue-100'
                }`}
              >
                Phần B: Tiếp thị (25đ)
              </button>
              <button
                type="button"
                onClick={() => setActiveGroupCode('GC')}
                className={`px-3 py-1.5 rounded-xl transition-all ${
                  activeGroupCode === 'GC'
                    ? 'bg-purple-700 text-white shadow-xs'
                    : 'bg-purple-50 text-purple-800 hover:bg-purple-100'
                }`}
              >
                Phần C: Chất lượng (35đ)
              </button>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleApplySmartSuggestions}
                className="px-3.5 py-1.5 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white font-black text-xs rounded-xl shadow-xs flex items-center gap-1.5 active:scale-98 transition-all"
                title="Tự động áp dụng toàn bộ mức điểm gợi ý từ hệ thống"
              >
                <Sparkles className="w-3.5 h-3.5" />
                💡 Gợi ý thông minh từ dữ liệu HTX
              </button>

              <button
                type="button"
                onClick={handleExportCriteriaExcel}
                className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl border border-slate-200 transition-colors inline-flex items-center gap-1.5"
              >
                <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-600" /> Xuất Excel
              </button>
            </div>
          </div>

          {/* Criterion Cards Grid */}
          <div className="space-y-4">
            {OCOP_QD148_CRITERIA_DATA
              .filter(group => activeGroupCode === 'ALL' || activeGroupCode === group.code)
              .map(group => (
                <div key={group.code} className="space-y-3">
                  <div className="flex items-center justify-between bg-slate-100/90 px-4 py-2.5 rounded-xl border border-slate-200">
                    <span className="font-black text-xs text-slate-900 uppercase tracking-wide">
                      {group.name}: {group.fullName} (Tối đa {group.maxScore.toFixed(1)}đ)
                    </span>
                    <span className="text-xs font-mono font-black text-emerald-800">
                      Thực đạt: {group.code === 'GA' ? calculation.partAScore.toFixed(1) : group.code === 'GB' ? calculation.partBScore.toFixed(1) : calculation.partCScore.toFixed(1)} / {group.maxScore.toFixed(1)}đ
                    </span>
                  </div>

                  <div className="space-y-3">
                    {group.indicators.map(ind => (
                      <FarmerCriterionCard
                        key={ind.code}
                        indicator={ind}
                        selectedScore={criteriaScores[ind.code]}
                        onSelectScore={(newScore) => {
                          setCriteriaScores({ ...criteriaScores, [ind.code]: newScore });
                          setToastMessage(`Đã cập nhật chỉ tiêu ${ind.code}: ${newScore.toFixed(1)} điểm`);
                          setTimeout(() => setToastMessage(null), 3000);
                        }}
                        hasEvidence={(evidenceCountMap[ind.code] || 0) > 0}
                        onViewEvidence={() => setActiveTab('evidences')}
                      />
                    ))}
                  </div>
                </div>
              ))}
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t">
            <button
              type="button"
              onClick={() => {
                setToastMessage('Đã lưu kết quả tự đánh giá vào hệ thống!');
                setTimeout(() => setToastMessage(null), 3000);
              }}
              className="px-5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl"
            >
              Lưu nháp
            </button>
            <button
              type="button"
              onClick={() => setIsFormModalOpen(true)}
              className="px-6 py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white font-extrabold text-xs rounded-xl shadow-xs flex items-center gap-2"
            >
              <Printer className="w-4 h-4" /> Xem trước & In Biểu mẫu QĐ 148
            </button>
          </div>
        </div>
      )}

      {/* TAB 3: HỘI ĐỒNG ĐÁNH GIÁ */}
      {activeTab === 'council' && (
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs space-y-6">
          <div className="flex justify-between items-center border-b pb-3">
            <div>
              <h3 className="font-extrabold text-slate-900 text-sm">Phiếu đánh giá hội đồng OCOP Tỉnh Lâm Đồng</h3>
              <p className="text-xs text-slate-500">Chủ thể: HTX Tân Tiến &bull; Sản phẩm: Ớt chuông Sweet Palermo Đỏ Đà Lạt</p>
            </div>
            <div className="pill-badge pill-green text-xs font-extrabold">
              &bull; Đề xuất công nhận 4 sao OCOP
            </div>
          </div>

          <div className="overflow-x-auto border border-slate-200 rounded-xl">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50 text-[11px] font-bold text-slate-500 uppercase">
                  <th className="py-3 px-4">Nhóm tiêu chí QĐ 148</th>
                  <th className="py-3 px-4 text-center">Điểm tối đa</th>
                  <th className="py-3 px-4 text-center">Điểm hội đồng chấm</th>
                  <th className="py-3 px-4 text-center">Tỉ lệ (%)</th>
                  <th className="py-3 px-4 text-center">Nhận xét</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium">
                <tr className="hover:bg-slate-50">
                  <td className="py-3 px-4 font-bold text-slate-800">Phần A: Sản phẩm và sức mạnh cộng đồng</td>
                  <td className="py-3 px-4 text-center font-mono font-bold">40.0</td>
                  <td className="py-3 px-4 text-center font-mono font-black text-emerald-800">38.0</td>
                  <td className="py-3 px-4 text-center font-mono font-bold">95.0%</td>
                  <td className="py-3 px-4 text-center font-bold text-emerald-700">Đạt xuất sắc</td>
                </tr>
                <tr className="hover:bg-slate-50">
                  <td className="py-3 px-4 font-bold text-slate-800">Phần B: Khả năng tiếp thị</td>
                  <td className="py-3 px-4 text-center font-mono font-bold">25.0</td>
                  <td className="py-3 px-4 text-center font-mono font-black text-emerald-800">23.5</td>
                  <td className="py-3 px-4 text-center font-mono font-bold">94.0%</td>
                  <td className="py-3 px-4 text-center font-bold text-emerald-700">Đạt xuất sắc</td>
                </tr>
                <tr className="hover:bg-slate-50">
                  <td className="py-3 px-4 font-bold text-slate-800">Phần C: Chất lượng sản phẩm</td>
                  <td className="py-3 px-4 text-center font-mono font-bold">35.0</td>
                  <td className="py-3 px-4 text-center font-mono font-black text-emerald-800">33.5</td>
                  <td className="py-3 px-4 text-center font-mono font-bold">95.7%</td>
                  <td className="py-3 px-4 text-center font-bold text-emerald-700">Đạt xuất sắc</td>
                </tr>
                <tr className="bg-emerald-50/60 font-black text-slate-900 border-t-2 border-emerald-200">
                  <td className="py-3 px-4">TỔNG CỘNG ĐIỂM HỘI ĐỒNG</td>
                  <td className="py-3 px-4 text-center font-mono">100.0</td>
                  <td className="py-3 px-4 text-center text-emerald-950 text-sm font-mono font-black">95.0</td>
                  <td className="py-3 px-4 text-center text-emerald-950 text-sm font-mono">95.0%</td>
                  <td className="py-3 px-4 text-center text-emerald-950 text-xs uppercase font-extrabold">Đề xuất 4 sao OCOP (Tiềm năng 5 sao)</td>
                </tr>
              </tbody>
            </table>
          </div>

          <div className="pt-4 grid grid-cols-2 text-center text-xs gap-4 font-bold text-slate-700">
            <div>
              <p>Chủ tịch Hội đồng Thẩm định</p>
              <p className="italic font-normal text-slate-400 mt-8">(Đã ký tên điện tử)</p>
            </div>
            <div>
              <p>Thư ký Hội đồng OCOP</p>
              <p className="italic font-normal text-slate-400 mt-8">(Đã ký tên điện tử)</p>
            </div>
          </div>
        </div>
      )}

      {/* TAB 4: QUẢN LÝ MINH CHỨNG SỐ HÓA */}
      {activeTab === 'evidences' && (
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs space-y-4">
          <div className="flex justify-between items-center border-b pb-3">
            <div>
              <h3 className="font-extrabold text-slate-900 text-sm">Kho Minh chứng Số hóa & Toàn vẹn SHA-256</h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Mỗi tệp tài liệu được lưu trữ kèm mã băm SHA-256 để chống giả mạo hồ sơ.
              </p>
            </div>
            <button
              onClick={() => setIsAddEvidenceModalOpen(true)}
              className="px-4 py-2 bg-emerald-700 hover:bg-emerald-800 text-white font-extrabold text-xs rounded-xl shadow-xs inline-flex items-center gap-1.5"
            >
              <Plus className="w-4 h-4" /> Thêm minh chứng
            </button>
          </div>

          {/* Evidence Category Filter Tabs */}
          <div className="flex gap-2 border-b pb-2 text-xs font-bold">
            <button
              onClick={() => setEvidenceCategoryFilter('ALL')}
              className={`px-3 py-1.5 rounded-lg transition-colors ${
                evidenceCategoryFilter === 'ALL' ? 'bg-emerald-700 text-white' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              Tất cả
            </button>
            <button
              onClick={() => setEvidenceCategoryFilter('LEGAL')}
              className={`px-3 py-1.5 rounded-lg transition-colors ${
                evidenceCategoryFilter === 'LEGAL' ? 'bg-emerald-700 text-white' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              Hồ sơ pháp lý
            </button>
            <button
              onClick={() => setEvidenceCategoryFilter('QUALITY')}
              className={`px-3 py-1.5 rounded-lg transition-colors ${
                evidenceCategoryFilter === 'QUALITY' ? 'bg-emerald-700 text-white' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              Chất lượng & ATTP
            </button>
            <button
              onClick={() => setEvidenceCategoryFilter('PROCESS')}
              className={`px-3 py-1.5 rounded-lg transition-colors ${
                evidenceCategoryFilter === 'PROCESS' ? 'bg-emerald-700 text-white' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              Quy trình canh tác
            </button>
          </div>

          {/* Evidence Table */}
          <div className="overflow-x-auto border border-slate-200 rounded-xl">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50 text-[11px] font-bold text-slate-500 uppercase">
                  <th className="py-3 px-3 w-10 text-center">STT</th>
                  <th className="py-3 px-3">Tên minh chứng</th>
                  <th className="py-3 px-3">Loại</th>
                  <th className="py-3 px-3 text-center">Chỉ tiêu OCOP</th>
                  <th className="py-3 px-3 font-mono text-[10px]">Mã băm SHA-256</th>
                  <th className="py-3 px-3 text-center">Ngày tải lên</th>
                  <th className="py-3 px-3 text-center">Thao tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium">
                {filteredEvidences.map((ev, idx) => (
                  <tr key={ev.id} className="hover:bg-slate-50">
                    <td className="py-3 px-3 text-center font-mono font-bold text-slate-500">{idx + 1}</td>
                    <td className="py-3 px-3">
                      <div className="font-bold text-slate-900">{ev.title}</div>
                      <span className="text-[11px] text-slate-500 font-mono">{ev.fileName} ({ev.fileSize})</span>
                    </td>
                    <td className="py-3 px-3"><span className="pill-badge pill-blue">{ev.categoryLabel}</span></td>
                    <td className="py-3 px-3 text-center">
                      <button
                        onClick={() => scrollToCriterion(ev.criterionCode)}
                        className="px-2.5 py-1 bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-300 rounded-lg text-xs font-mono font-bold transition-all inline-flex items-center gap-1 cursor-pointer shadow-2xs"
                        title="Bấm để cuộn mượt xem vị trí tiêu chí này"
                      >
                        <LinkIcon className="w-3 h-3 text-amber-600" /> {ev.criterionCode}
                      </button>
                    </td>
                    <td className="py-3 px-3 font-mono text-[10px] text-slate-500" title={ev.fileHashSha256}>
                      <span className="bg-slate-100 px-1.5 py-0.5 rounded border border-slate-200">
                        {ev.fileHashSha256 ? `${ev.fileHashSha256.slice(0, 16)}...` : 'e3b0c44298fc1c14...'}
                      </span>
                    </td>
                    <td className="py-3 px-3 text-center text-slate-500">{ev.uploadedAt}</td>
                    <td className="py-3 px-3 text-center">
                      <button
                        onClick={() => alert(`Đang tải xuống file ${ev.fileName}`)}
                        className="p-1.5 hover:bg-emerald-100 text-emerald-800 rounded-lg transition-colors"
                        title="Tải xuống tệp"
                      >
                        <Download className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 5: BỘ HỒ SƠ OCOP */}
      {activeTab === 'dossier_package' && (
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs space-y-4">
          <div className="flex justify-between items-center border-b pb-3">
            <h3 className="font-extrabold text-slate-900 text-sm">Bộ hồ sơ OCOP - Ớt chuông Sweet Palermo Đỏ Đà Lạt</h3>
            <button
              onClick={() => setIsFormModalOpen(true)}
              className="px-4 py-2 bg-emerald-700 hover:bg-emerald-800 text-white font-extrabold text-xs rounded-xl shadow-xs inline-flex items-center gap-1.5"
            >
              <Printer className="w-4 h-4" /> In / Xuất Hồ sơ QĐ 148
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div 
              onClick={() => setIsFormModalOpen(true)}
              className="p-4 bg-slate-50 hover:bg-emerald-50/60 border border-slate-200 rounded-2xl space-y-2 text-xs cursor-pointer transition-all hover:border-emerald-400"
            >
              <FileText className="w-8 h-8 text-emerald-700" />
              <h4 className="font-bold text-slate-900">Biểu số 01: Phiếu đăng ký</h4>
              <p className="text-[11px] text-slate-500">Đăng ký tham gia phân hạng OCOP</p>
              <span className="pill-badge pill-green">&bull; Đã sẵn sàng in</span>
            </div>

            <div 
              onClick={() => setIsFormModalOpen(true)}
              className="p-4 bg-slate-50 hover:bg-emerald-50/60 border border-slate-200 rounded-2xl space-y-2 text-xs cursor-pointer transition-all hover:border-emerald-400"
            >
              <FileText className="w-8 h-8 text-emerald-700" />
              <h4 className="font-bold text-slate-900">Biểu số 02: Báo cáo tự đánh giá</h4>
              <p className="text-[11px] text-slate-500">4 phần + 14 minh chứng phụ lục</p>
              <span className="pill-badge pill-green">&bull; Đã sẵn sàng in</span>
            </div>

            <div 
              onClick={() => setIsFormModalOpen(true)}
              className="p-4 bg-slate-50 hover:bg-emerald-50/60 border border-slate-200 rounded-2xl space-y-2 text-xs cursor-pointer transition-all hover:border-emerald-400"
            >
              <FileText className="w-8 h-8 text-amber-600" />
              <h4 className="font-bold text-slate-900">Biểu số 03: Xác nhận UBND Xã</h4>
              <p className="text-[11px] text-slate-500">Xác nhận 4 nội dung địa phương</p>
              <span className="pill-badge pill-green">&bull; Đã có xác nhận</span>
            </div>
          </div>
        </div>
      )}

      {/* TAB 6: WORKFLOW */}
      {activeTab === 'workflow' && (
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs space-y-6">
          <h3 className="font-extrabold text-slate-900 text-sm border-b pb-2">
            Quy trình hoàn thiện & Thẩm định OCOP (Theo QĐ 148/QĐ-TTg)
          </h3>

          <div className="grid grid-cols-2 md:grid-cols-5 gap-3 text-xs">
            <div className="p-3 bg-emerald-50 border border-emerald-300 rounded-xl space-y-1">
              <div className="font-black text-emerald-900">1. Khởi tạo hồ sơ</div>
              <p className="text-[11px] text-emerald-800">Tạo hồ sơ mới & kê khai vùng trồng 280 ha</p>
            </div>
            <div className="p-3 bg-emerald-50 border border-emerald-300 rounded-xl space-y-1">
              <div className="font-black text-emerald-900">2. Tự đánh giá</div>
              <p className="text-[11.5px] text-emerald-800">Chấm 11 tiêu chí QĐ 148 (100đ)</p>
            </div>
            <div className="p-3 bg-emerald-50 border border-emerald-300 rounded-xl space-y-1">
              <div className="font-black text-emerald-900">3. Kho minh chứng</div>
              <p className="text-[11.5px] text-emerald-800">14 tài liệu kèm mã băm SHA-256</p>
            </div>
            <div className="p-3 bg-emerald-50 border border-emerald-300 rounded-xl space-y-1">
              <div className="font-black text-emerald-900">4. UBND Xã xác nhận</div>
              <p className="text-[11.5px] text-emerald-800">Ký xác nhận Biểu số 03</p>
            </div>
            <div className="p-3 bg-blue-50 border border-blue-300 rounded-xl space-y-1">
              <div className="font-black text-blue-900">5. Tiếp nhận & Thẩm định</div>
              <p className="text-[11.5px] text-blue-800">Hội đồng cấp Tỉnh họp chấm điểm</p>
            </div>
          </div>
        </div>
      )}

      {/* Modal Add Evidence */}
      {isAddEvidenceModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 animate-fade-in">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-lg p-6 space-y-4">
            <div className="flex items-center justify-between border-b pb-3">
              <h3 className="font-black text-slate-900 text-sm">Thêm minh chứng số hóa mới</h3>
              <button onClick={() => setIsAddEvidenceModalOpen(false)} className="p-1 text-slate-400 hover:text-slate-700">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-700 font-bold mb-1">Chỉ tiêu OCOP liên quan *</label>
                <select className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-bold">
                  {ALL_INDICATORS.map(ind => (
                    <option key={ind.code} value={ind.code}>
                      {ind.code} - {ind.criterionName}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-slate-700 font-bold mb-1">Tên tài liệu minh chứng *</label>
                <input
                  type="text"
                  placeholder="VD: Phiếu kiểm nghiệm ISO 17025..."
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-medium"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-bold mb-1">Tệp đính kèm (Tính mã băm SHA-256) *</label>
                <div className="p-6 border-2 border-dashed border-slate-300 rounded-xl text-center hover:border-emerald-500 cursor-pointer transition-colors bg-slate-50">
                  <Upload className="w-8 h-8 text-slate-400 mx-auto mb-2" />
                  <p className="font-bold text-slate-700">Kéo thả file hoặc chọn file</p>
                  <p className="text-[11px] text-slate-400 mt-0.5">PDF, JPG, PNG (Tối đa 25MB)</p>
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-3 border-t">
              <button
                onClick={() => setIsAddEvidenceModalOpen(false)}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl"
              >
                Hủy
              </button>
              <button
                onClick={() => {
                  setIsAddEvidenceModalOpen(false);
                  setToastMessage('Đã tải lên minh chứng và tạo mã băm SHA-256 thành công!');
                  setTimeout(() => setToastMessage(null), 3000);
                }}
                className="px-5 py-2 bg-emerald-700 hover:bg-emerald-800 text-white font-extrabold text-xs rounded-xl shadow-xs"
              >
                Lưu minh chứng
              </button>
            </div>
          </div>
        </div>
      )}

      {/* QĐ 148 Export Modal with live scores */}
      <Qd148DocumentModal
        isOpen={isFormModalOpen}
        onClose={() => setIsFormModalOpen(false)}
        dossier={dossier}
        scores={criteriaScores}
      />
    </div>
  );
};
