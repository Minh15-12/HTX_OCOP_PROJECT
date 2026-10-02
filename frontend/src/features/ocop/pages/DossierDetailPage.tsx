import React, { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { 
  ArrowLeft, Star, FileText, CheckSquare, Upload, Award, FileCheck, Save, Send, CheckCircle2, 
  Printer, Clock, Eye, Link as LinkIcon, ShieldCheck, ChevronRight, Download, Plus, X,
  FileSpreadsheet
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
  MOCK_OCOP_DOSSIERS_FULL, MOCK_CRITERIA_GROUPS_SUMMARY, MOCK_CRITERIA_DETAILS, 
  MOCK_EVIDENCES_FULL, OcopCriterionDetail, EvidenceItem 
} from '../../../services/ocopService';
import { Qd148DocumentModal } from '../components/Qd148DocumentModal';
import { exportToExcel } from '@/utils/exportUtils';

export const DossierDetailPage: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  
  const dossier = MOCK_OCOP_DOSSIERS_FULL.find((d) => d.id === id || d.code === id) || MOCK_OCOP_DOSSIERS_FULL[0];
  
  const [activeTab, setActiveTab] = useState<'overview' | 'self_eval' | 'council' | 'evidences' | 'dossier_package' | 'workflow'>('overview');
  const [activeGroupIndex, setActiveGroupIndex] = useState<number>(1);
  const [evidenceCategoryFilter, setEvidenceCategoryFilter] = useState<string>('ALL');
  const [highlightedCode, setHighlightedCode] = useState<string | null>(null);
  
  // Modals
  const [isFormModalOpen, setIsFormModalOpen] = useState<boolean>(false);
  const [isAddEvidenceModalOpen, setIsAddEvidenceModalOpen] = useState<boolean>(false);

  const [criteriaScores, setCriteriaScores] = useState<Record<string, number>>({
    '1.1': 4.5,
    '1.2': 4.0,
    '1.3': 4.5,
    '1.4': 4.5,
    '2.1': 4.0,
    '2.2': 4.0,
    '2.3': 4.0,
    '2.4': 4.0,
    '3.1': 4.5,
    '3.2': 5.0,
    '3.3': 4.5,
    '3.4': 4.5,
    '4.1': 4.5,
    '4.2': 4.5,
    '4.3': 4.5,
    '5.1': 4.5,
    '5.2': 4.0,
    '6.1': 4.5,
  });

  const totalScore = Object.values(criteriaScores).reduce((a, b) => a + b, 0);

  const activeGroupCriteria = MOCK_CRITERIA_DETAILS.filter((c) => c.groupId === activeGroupIndex);

  const filteredEvidences = MOCK_EVIDENCES_FULL.filter((ev) => {
    if (evidenceCategoryFilter === 'ALL') return true;
    return ev.category === evidenceCategoryFilter;
  });

  // Radar Chart Data preparation
  const radarData = MOCK_CRITERIA_GROUPS_SUMMARY.map((g) => ({
    subject: `Nhóm ${g.id}`,
    fullName: g.name,
    'Điểm tối đa': g.maxScore,
    'Điểm đạt được': g.achievedScore,
  }));

  // Smooth scroll deep linking helper
  const scrollToCriterion = (code: string) => {
    const criterion = MOCK_CRITERIA_DETAILS.find((c) => c.code === code);
    if (criterion) {
      setActiveGroupIndex(criterion.groupId);
    }
    setActiveTab('self_eval');
    setHighlightedCode(code);
    setTimeout(() => {
      const el = document.getElementById(`criterion-row-${code}`);
      if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    }, 150);
    setTimeout(() => setHighlightedCode(null), 3000);
  };

  const handleExportCriteriaExcel = () => {
    const exportData = MOCK_CRITERIA_DETAILS.map((c) => ({
      'Mã chỉ tiêu': c.code,
      'Tên tiêu chí': c.name,
      'Nhóm tiêu chí': MOCK_CRITERIA_GROUPS_SUMMARY.find((g) => g.id === c.groupId)?.name || '',
      'Điểm tối đa': c.maxScore,
      'Điểm tự đánh giá': criteriaScores[c.code] ?? c.selfScore,
      'Ghi chú minh chứng': c.note,
    }));
    exportToExcel(exportData, `Bang_Diem_Tu_Danh_Gia_OCOP_${dossier.code}`, 'Diem_OCOP');
  };

  return (
    <div className="space-y-6 pb-20 animate-fade-in text-slate-800">
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
              Thông tin sản phẩm OCOP
            </h1>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsFormModalOpen(true)}
            className="px-4 py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white font-extrabold text-xs rounded-xl shadow-xs transition-all flex items-center gap-1.5"
          >
            <Printer className="w-4 h-4" /> Xuất Biểu mẫu QĐ 148
          </button>
        </div>
      </div>

      {/* Product Banner & Score Meter Card (Image 1 Top Right & Image 3 Screen 2) */}
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
              <span className="pill-badge pill-blue text-[10.5px]">Đang thẩm định</span>
            </div>
            <p><strong>Mã hồ sơ:</strong> <span className="font-mono font-bold text-slate-700">{dossier.code}</span></p>
            <p><strong>Chủ thể:</strong> {dossier.subjectName}</p>
            <p><strong>Nhóm sản phẩm:</strong> {dossier.productCategory}</p>
            <p><strong>Cấp đánh giá:</strong> <span className="font-bold text-amber-900">{dossier.evalLevel}</span></p>
            <p><strong>Ngày nộp hồ sơ:</strong> {dossier.submissionDate}</p>
          </div>
        </div>

        {/* Circular Gauge Score Meter (Image 1 Top Right) */}
        <div className="flex flex-col items-center justify-center p-4 bg-emerald-50/60 rounded-2xl border border-emerald-100 shrink-0">
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
                strokeDashoffset={238 - (238 * dossier.totalScore) / 100}
                strokeLinecap="round"
                fill="transparent"
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-xl font-black text-emerald-950">{dossier.totalScore.toString().replace('.', ',')}</span>
              <span className="text-[10px] font-bold text-slate-400">/ 100</span>
            </div>
          </div>

          <div className="flex items-center gap-1 mt-2">
            {[1, 2, 3, 4].map((s) => (
              <Star key={s} className="w-4 h-4 fill-amber-400 text-amber-400" />
            ))}
          </div>
          <span className="text-xs font-black text-emerald-900 mt-0.5">Đạt yêu cầu 4 sao</span>
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
          2. Tự đánh giá
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
          4. Minh chứng
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

      {/* TAB 1: TỔNG QUAN KẾT QUẢ THEO 6 NHÓM TIÊU CHÍ & BIỂU ĐỒ RA-ĐA */}
      {activeTab === 'overview' && (
        <div className="bg-white border border-slate-200 rounded-b-2xl p-6 shadow-xs space-y-6">
          <div className="flex justify-between items-center border-b pb-3">
            <h3 className="font-black text-slate-900 text-sm">
              Kết quả tự đánh giá theo bộ tiêu chí (100 điểm)
            </h3>
            <button
              onClick={() => setActiveTab('self_eval')}
              className="text-xs text-emerald-700 font-bold hover:underline"
            >
              Xem chi tiết tiêu chí &rsaquo;
            </button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
            {/* Left 3 cols: Table */}
            <div className="lg:col-span-3 overflow-x-auto border border-slate-200 rounded-xl">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="border-b border-slate-200 bg-slate-50 text-[11px] font-bold text-slate-500 uppercase">
                    <th className="py-3 px-4">Nhóm tiêu chí</th>
                    <th className="py-3 px-4 text-center">Tỉ trọng</th>
                    <th className="py-3 px-4 text-center">Tối đa</th>
                    <th className="py-3 px-4 text-center">Đạt được</th>
                    <th className="py-3 px-4 text-center">Tỉ lệ (%)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-medium">
                  {MOCK_CRITERIA_GROUPS_SUMMARY.map((g) => (
                    <tr key={g.id} className="hover:bg-slate-50">
                      <td className="py-3 px-4 font-bold text-slate-800">{g.name}</td>
                      <td className="py-3 px-4 text-center font-semibold text-slate-600">{g.weight}%</td>
                      <td className="py-3 px-4 text-center font-bold text-slate-700">{g.maxScore}</td>
                      <td className="py-3 px-4 text-center font-black text-emerald-800">{g.achievedScore.toString().replace('.', ',')}</td>
                      <td className="py-3 px-4 text-center font-bold text-slate-700">{g.percent.toString().replace('.', ',')}%</td>
                    </tr>
                  ))}
                  <tr className="bg-emerald-50/60 font-black text-slate-900 border-t-2 border-emerald-200">
                    <td className="py-3 px-4">Tổng cộng</td>
                    <td className="py-3 px-4 text-center">100%</td>
                    <td className="py-3 px-4 text-center">100</td>
                    <td className="py-3 px-4 text-center text-emerald-950 text-sm">{dossier.totalScore.toString().replace('.', ',')}</td>
                    <td className="py-3 px-4 text-center text-emerald-950 text-sm">78,5%</td>
                  </tr>
                </tbody>
              </table>
            </div>

            {/* Right 2 cols: Radar Chart (Biểu đồ Ra-đa Đánh giá OCOP) */}
            <div className="lg:col-span-2 border border-slate-200 rounded-xl p-4 bg-gradient-to-br from-slate-50 to-emerald-50/40 flex flex-col justify-between">
              <div className="flex items-center justify-between border-b border-slate-200/80 pb-2">
                <h4 className="font-extrabold text-slate-900 text-xs">Biểu đồ Ra-đa Tiêu chí OCOP</h4>
                <span className="pill-badge pill-green text-[10px]">Phân hạng: 4 Sao</span>
              </div>
              
              <div className="h-60 w-full my-2">
                <ResponsiveContainer width="100%" height="100%">
                  <RadarChart cx="50%" cy="50%" outerRadius="70%" data={radarData}>
                    <PolarGrid stroke="#cbd5e1" />
                    <PolarAngleAxis dataKey="subject" tick={{ fontSize: 10, fill: '#334155', fontWeight: 700 }} />
                    <PolarRadiusAxis angle={30} domain={[0, 30]} tick={{ fontSize: 9 }} />
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

      {/* TAB 2: TỰ ĐÁNH GIÁ THEO BỘ TIÊU CHÍ */}
      {activeTab === 'self_eval' && (
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Left Vertical 6-Group Navigation Sidebar */}
          <div className="lg:col-span-1 bg-white border border-slate-200 rounded-2xl p-4 shadow-xs space-y-2 text-xs font-bold">
            <h4 className="text-[11px] text-slate-400 uppercase tracking-wider mb-2">Nhóm tiêu chí đánh giá</h4>
            {MOCK_CRITERIA_GROUPS_SUMMARY.map((g) => (
              <button
                key={g.id}
                onClick={() => setActiveGroupIndex(g.id)}
                className={`w-full text-left p-3 rounded-xl transition-all flex items-center gap-2.5 ${
                  activeGroupIndex === g.id
                    ? 'bg-emerald-700 text-white shadow-xs font-extrabold'
                    : 'bg-slate-50 hover:bg-slate-100 text-slate-700'
                }`}
              >
                <div className={`w-5 h-5 rounded-full flex items-center justify-center font-mono text-[10px] ${
                  activeGroupIndex === g.id ? 'bg-white text-emerald-800' : 'bg-slate-200 text-slate-600'
                }`}>
                  {g.id}
                </div>
                <span className="line-clamp-2">{g.name.split('. ')[1]}</span>
              </button>
            ))}
          </div>

          {/* Right Main Scoring Table */}
          <div className="lg:col-span-3 bg-white border border-slate-200 rounded-2xl p-6 shadow-xs space-y-4">
            <div className="flex justify-between items-center border-b pb-2">
              <h3 className="font-extrabold text-slate-900 text-sm">
                {MOCK_CRITERIA_GROUPS_SUMMARY[activeGroupIndex - 1]?.name} ({MOCK_CRITERIA_GROUPS_SUMMARY[activeGroupIndex - 1]?.maxScore} điểm)
              </h3>
              <button
                onClick={handleExportCriteriaExcel}
                className="px-3 py-1.5 bg-slate-100 hover:bg-emerald-50 text-slate-700 hover:text-emerald-800 font-bold text-xs rounded-xl border border-slate-200 transition-colors inline-flex items-center gap-1.5"
              >
                <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-600" /> Xuất Excel
              </button>
            </div>

            <div className="overflow-x-auto border border-slate-200 rounded-xl">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="border-b border-slate-200 bg-slate-50 text-[11px] font-bold text-slate-500 uppercase">
                    <th className="py-3 px-3">Tiêu chí</th>
                    <th className="py-3 px-3 text-center">Điểm tối đa</th>
                    <th className="py-3 px-3 text-center">Điểm tự đánh giá *</th>
                    <th className="py-3 px-3">Nhận xét</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-medium">
                  {activeGroupCriteria.map((c) => (
                    <tr
                      id={`criterion-row-${c.code}`}
                      key={c.id}
                      className={`transition-colors duration-500 ${
                        highlightedCode === c.code ? 'bg-amber-100/90 border-l-4 border-amber-500 font-bold' : 'hover:bg-slate-50'
                      }`}
                    >
                      <td className="py-3 px-3">
                        <div className="font-bold text-slate-900">{c.code} {c.name}</div>
                      </td>
                      <td className="py-3 px-3 text-center font-bold text-slate-700">{c.maxScore}</td>
                      <td className="py-3 px-3 text-center">
                        <select
                          value={criteriaScores[c.code] ?? c.selfScore}
                          onChange={(e) => setCriteriaScores({ ...criteriaScores, [c.code]: Number(e.target.value) })}
                          className="px-2.5 py-1 bg-white border border-slate-300 rounded-lg text-xs font-bold text-emerald-900 focus:ring-2 focus:ring-emerald-500 focus:outline-none shadow-xs"
                        >
                          <option value={5}>5,0</option>
                          <option value={4.5}>4,5</option>
                          <option value={4.0}>4,0</option>
                          <option value={3.5}>3,5</option>
                        </select>
                      </td>
                      <td className="py-3 px-3 text-slate-600">{c.note}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="flex justify-end gap-2 pt-3">
              <button
                onClick={() => alert('Đã lưu nháp kết quả tự đánh giá!')}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl"
              >
                Lưu nháp
              </button>
              <button
                onClick={() => {
                  if (activeGroupIndex < 6) setActiveGroupIndex(activeGroupIndex + 1);
                }}
                className="px-5 py-2 bg-emerald-700 hover:bg-emerald-800 text-white font-extrabold text-xs rounded-xl shadow-xs"
              >
                Tiếp theo &rsaquo;
              </button>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: HỘI ĐỒNG ĐÁNH GIÁ (Image 1 Bottom Right 1 & Image 3 Screen 6) */}
      {activeTab === 'council' && (
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs space-y-6">
          <div className="flex justify-between items-center border-b pb-3">
            <div>
              <h3 className="font-extrabold text-slate-900 text-sm">Phiếu đánh giá hội đồng</h3>
              <p className="text-xs text-slate-500">Chủ thể: HTX Tân Tiến &bull; Sản phẩm: Ớt chuông Sweet Palermo Đỏ Đà Lạt</p>
            </div>
            <div className="pill-badge pill-green text-xs font-extrabold">
              &bull; Đề xuất công nhận 4 sao
            </div>
          </div>

          <div className="overflow-x-auto border border-slate-200 rounded-xl">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50 text-[11px] font-bold text-slate-500 uppercase">
                  <th className="py-3 px-4">Nhóm tiêu chí</th>
                  <th className="py-3 px-4 text-center">Điểm tối đa</th>
                  <th className="py-3 px-4 text-center">Điểm đạt</th>
                  <th className="py-3 px-4 text-center">Tỉ lệ (%)</th>
                  <th className="py-3 px-4 text-center">Nhận xét</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium">
                {MOCK_CRITERIA_GROUPS_SUMMARY.map((g) => (
                  <tr key={g.id} className="hover:bg-slate-50">
                    <td className="py-3 px-4 font-bold text-slate-800">{g.name}</td>
                    <td className="py-3 px-4 text-center font-bold text-slate-700">{g.maxScore}</td>
                    <td className="py-3 px-4 text-center font-black text-emerald-800">{g.achievedScore.toString().replace('.', ',')}</td>
                    <td className="py-3 px-4 text-center font-bold text-slate-700">{g.percent.toString().replace('.', ',')}%</td>
                    <td className="py-3 px-4 text-center font-bold text-emerald-700">Đạt yêu cầu</td>
                  </tr>
                ))}
                <tr className="bg-emerald-50/60 font-black text-slate-900 border-t-2 border-emerald-200">
                  <td className="py-3 px-4">Tổng cộng</td>
                  <td className="py-3 px-4 text-center">100</td>
                  <td className="py-3 px-4 text-center text-emerald-950 text-sm">78,5</td>
                  <td className="py-3 px-4 text-center text-emerald-950 text-sm">78,5%</td>
                  <td className="py-3 px-4 text-center text-emerald-950 text-xs uppercase font-extrabold">Đề xuất 4 sao</td>
                </tr>
              </tbody>
            </table>
          </div>

          <div className="pt-4 grid grid-cols-2 text-center text-xs gap-4 font-bold text-slate-700">
            <div>
              <p>Chủ tịch hội đồng</p>
              <p className="italic font-normal text-slate-400 mt-8">(Đã ký tên)</p>
            </div>
            <div>
              <p>Thư ký hội đồng</p>
              <p className="italic font-normal text-slate-400 mt-8">(Đã ký tên)</p>
            </div>
          </div>
        </div>
      )}

      {/* TAB 4: QUẢN LÝ MINH CHỨNG (Image 1 Bottom Middle 1 & Image 3 Screen 5) */}
      {activeTab === 'evidences' && (
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs space-y-4">
          <div className="flex justify-between items-center border-b pb-3">
            <h3 className="font-extrabold text-slate-900 text-sm">Quản lý minh chứng</h3>
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
              Chất lượng sản phẩm
            </button>
            <button
              onClick={() => setEvidenceCategoryFilter('PROCESS')}
              className={`px-3 py-1.5 rounded-lg transition-colors ${
                evidenceCategoryFilter === 'PROCESS' ? 'bg-emerald-700 text-white' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              Quy trình sản xuất
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
                  <th className="py-3 px-3 text-center">Liên kết tiêu chí</th>
                  <th className="py-3 px-3 text-center">Ngày tải lên</th>
                  <th className="py-3 px-3 text-center">Thao tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium">
                {filteredEvidences.map((ev, idx) => (
                  <tr key={ev.id} className="hover:bg-slate-50">
                    <td className="py-3 px-3 text-center font-mono font-bold text-slate-500">{idx + 1}</td>
                    <td className="py-3 px-3 font-bold text-slate-900">{ev.title}</td>
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
                    <td className="py-3 px-3 text-center text-slate-500">{ev.uploadedAt}</td>
                    <td className="py-3 px-3 text-center">
                      <button
                        onClick={() => alert(`Đang tải xuống file ${ev.fileName}`)}
                        className="p-1.5 hover:bg-emerald-100 text-emerald-800 rounded-lg transition-colors"
                        title="Tải xuống"
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

      {/* TAB 5: BỘ HỒ SƠ OCOP (Image 1 Bottom Left 2 Grid) */}
      {activeTab === 'dossier_package' && (
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs space-y-4">
          <div className="flex justify-between items-center border-b pb-3">
            <h3 className="font-extrabold text-slate-900 text-sm">Bộ hồ sơ OCOP - Ớt chuông Sweet Palermo Đỏ Đà Lạt</h3>
            <button
              onClick={() => setIsFormModalOpen(true)}
              className="px-4 py-2 bg-emerald-700 hover:bg-emerald-800 text-white font-extrabold text-xs rounded-xl shadow-xs inline-flex items-center gap-1.5"
            >
              <Download className="w-4 h-4" /> Xuất hồ sơ
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl space-y-2 text-xs">
              <FileText className="w-8 h-8 text-emerald-700" />
              <h4 className="font-bold text-slate-900">Phiếu đăng ký</h4>
              <p className="text-[11px] text-slate-500">Mẫu số 01</p>
              <span className="pill-badge pill-green">&bull; Đã nộp</span>
            </div>

            <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl space-y-2 text-xs">
              <FileText className="w-8 h-8 text-emerald-700" />
              <h4 className="font-bold text-slate-900">Báo cáo tự đánh giá</h4>
              <p className="text-[11px] text-slate-500">Mẫu số 02</p>
              <span className="pill-badge pill-green">&bull; Đã nộp</span>
            </div>

            <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl space-y-2 text-xs">
              <FileText className="w-8 h-8 text-amber-600" />
              <h4 className="font-bold text-slate-900">Biểu số 03 (UBND xã)</h4>
              <p className="text-[11px] text-slate-500">Xác nhận</p>
              <span className="pill-badge pill-amber">&bull; Đang chờ</span>
            </div>

            <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl space-y-2 text-xs">
              <FileText className="w-8 h-8 text-emerald-700" />
              <h4 className="font-bold text-slate-900">Minh chứng số</h4>
              <p className="text-[11px] text-slate-500">12 tài liệu</p>
              <span className="pill-badge pill-green">&bull; Đã nộp</span>
            </div>

            <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl space-y-2 text-xs opacity-60">
              <FileText className="w-8 h-8 text-slate-400" />
              <h4 className="font-bold text-slate-900">Biểu số 04 (Cấp huyện)</h4>
              <p className="text-[11px] text-slate-500">Báo cáo huyện</p>
              <span className="pill-badge pill-gray">&bull; Chưa nộp</span>
            </div>

            <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl space-y-2 text-xs opacity-60">
              <FileText className="w-8 h-8 text-slate-400" />
              <h4 className="font-bold text-slate-900">Kết quả đánh giá</h4>
              <p className="text-[11px] text-slate-500">Quyết định cấp tỉnh</p>
              <span className="pill-badge pill-gray">&bull; Chưa có</span>
            </div>
          </div>
        </div>
      )}

      {/* TAB 6: WORKFLOW đánh giá OCOP (Image 1 Middle Bottom & Image 3 Bottom Pipeline) */}
      {activeTab === 'workflow' && (
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs space-y-6">
          <h3 className="font-extrabold text-slate-900 text-sm border-b pb-2">
            Workflow đánh giá OCOP (Theo QĐ 148/QĐ-TTg và Kế hoạch dự án)
          </h3>

          <div className="grid grid-cols-2 md:grid-cols-5 gap-3 text-xs">
            <div className="p-3 bg-emerald-50 border border-emerald-300 rounded-xl space-y-1">
              <div className="font-black text-emerald-900">1. Khởi tạo hồ sơ</div>
              <p className="text-[11px] text-emerald-800">Tạo hồ sơ mới & nhập thông tin sản phẩm</p>
            </div>
            <div className="p-3 bg-emerald-50 border border-emerald-300 rounded-xl space-y-1">
              <div className="font-black text-emerald-900">2. Tự đánh giá</div>
              <p className="text-[11.5px] text-emerald-800">Đánh giá 18 tiêu chí QĐ 148</p>
            </div>
            <div className="p-3 bg-emerald-50 border border-emerald-300 rounded-xl space-y-1">
              <div className="font-black text-emerald-900">3. Nộp hồ sơ</div>
              <p className="text-[11.5px] text-emerald-800">Gửi UBND xã kèm tài liệu</p>
            </div>
            <div className="p-3 bg-blue-50 border border-blue-300 rounded-xl space-y-1">
              <div className="font-black text-blue-900">4. Rà soát (UBND xã)</div>
              <p className="text-[11.5px] text-blue-800">Xác nhận Biểu số 03</p>
            </div>
            <div className="p-3 bg-amber-50 border border-amber-300 rounded-xl space-y-1">
              <div className="font-black text-amber-900">5. Tiếp nhận (Cấp tỉnh)</div>
              <p className="text-[11.5px] text-amber-800">Thẩm định chuyển Hội đồng</p>
            </div>
          </div>
        </div>
      )}

      {/* Modal Add Evidence (Image 1 Bottom Middle 1) */}
      {isAddEvidenceModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 animate-fade-in">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-lg p-6 space-y-4">
            <div className="flex items-center justify-between border-b pb-3">
              <h3 className="font-black text-slate-900 text-sm">Thêm minh chứng mới</h3>
              <button onClick={() => setIsAddEvidenceModalOpen(false)} className="p-1 text-slate-400 hover:text-slate-700">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-700 font-bold mb-1">Tiêu chí liên quan *</label>
                <select className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-bold">
                  <option>1.2 Đặc điểm, chất lượng sản phẩm</option>
                  <option>2.1 Nhãn hiệu & tem QR</option>
                  <option>3.1 VietGAP còn hiệu lực</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-700 font-bold mb-1">Loại minh chứng *</label>
                <select className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-bold">
                  <option>Giấy chứng nhận chất lượng</option>
                  <option>Hồ sơ pháp lý</option>
                  <option>Nhật ký sản xuất</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-700 font-bold mb-1">Mô tả *</label>
                <textarea
                  rows={2}
                  placeholder="Kết quả kiểm nghiệm chất lượng sản phẩm..."
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-medium"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-bold mb-1">Tệp đính kèm *</label>
                <div className="p-6 border-2 border-dashed border-slate-300 rounded-xl text-center hover:border-emerald-500 cursor-pointer transition-colors bg-slate-50">
                  <Upload className="w-8 h-8 text-slate-400 mx-auto mb-2" />
                  <p className="font-bold text-slate-700">Kéo thả file hoặc chọn file</p>
                  <p className="text-[11px] text-slate-400 mt-0.5">PDF, JPG, PNG (Tối đa 10MB)</p>
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
                  alert('Đã tải lên minh chứng thành công!');
                }}
                className="px-5 py-2 bg-emerald-700 hover:bg-emerald-800 text-white font-extrabold text-xs rounded-xl shadow-xs"
              >
                Lưu minh chứng
              </button>
            </div>
          </div>
        </div>
      )}

      {/* QĐ 148 Export Modal */}
      <Qd148DocumentModal
        isOpen={isFormModalOpen}
        onClose={() => setIsFormModalOpen(false)}
        dossier={dossier}
      />
    </div>
  );
};
