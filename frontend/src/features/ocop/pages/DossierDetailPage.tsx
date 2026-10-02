import React, { useState, useEffect } from 'react';
import { 
  ArrowLeft, Star, FileText, CheckSquare, Upload, Award, FileCheck, Save, Send, CheckCircle2, 
  AlertTriangle, ShieldCheck, Printer, Clock, Info, Check, RefreshCw, Link as LinkIcon, AlertCircle 
} from 'lucide-react';
import { useNavigate, useParams } from 'react-router-dom';
import { ocopService, OcopDossier, OcopCriterion, OcopEvidence, EvaluatorScoreItem } from '../../../services/ocopService';
import { Qd148DocumentModal } from '../components/Qd148DocumentModal';

export const DossierDetailPage: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  
  const [dossier, setDossier] = useState<OcopDossier | null>(null);
  const [criteria, setCriteria] = useState<OcopCriterion[]>([]);
  const [evidences, setEvidences] = useState<OcopEvidence[]>([]);
  const [evaluators, setEvaluators] = useState<EvaluatorScoreItem[]>([]);
  const [activeTab, setActiveTab] = useState<'overview' | 'scoring' | 'evidences' | 'council' | 'certificate'>('scoring');
  
  // Interactive Self-Assessment Scores state (18 criteria QĐ 148)
  const [scores, setScores] = useState<Record<string, number>>({
    'TC-A.1.1': 7,
    'TC-A.1.2': 3,
    'TC-A.2.1': 5,
    'TC-A.3.1': 5,
    'TC-A.4.1': 5,
    'TC-A.5.1': 5,
    'TC-A.6.1': 5,
    'TC-A.7.1': 5,
    'TC-B.8.1': 5,
    'TC-B.9.1': 3,
    'TC-B.10.1': 4,
    'TC-B.11.1': 3,
    'TC-B.12.1': 5,
    'TC-B.12.2': 5,
    'TC-C.13.1': 5,
    'TC-C.14.1': 5,
    'TC-C.15.1': 5,
    'TC-C.16.1': 10,
    'TC-C.17.1': 3,
    'TC-C.18.1': 3,
  });

  // Modal States
  const [isFormModalOpen, setIsFormModalOpen] = useState<boolean>(false);
  const [submitAlertModal, setSubmitAlertModal] = useState<{ open: boolean; missing: OcopCriterion[]; canSubmit: boolean }>({
    open: false,
    missing: [],
    canSubmit: false,
  });
  const [submitSuccess, setSubmitSuccess] = useState<boolean>(false);

  useEffect(() => {
    const loadData = async () => {
      const currentDossier = await ocopService.getDossierById(id || 'DOS-2026-001');
      if (currentDossier) setDossier(currentDossier);

      const critList = await ocopService.getCriteria();
      setCriteria(critList);

      const evList = await ocopService.getEvidences(id || 'DOS-2026-001');
      setEvidences(evList);

      const evalList = await ocopService.getEvaluatorScores(id || 'DOS-2026-001');
      setEvaluators(evalList);
    };
    loadData();
  }, [id]);

  if (!dossier) {
    return <div className="p-12 text-center text-slate-500">Đang tải chi tiết hồ sơ OCOP...</div>;
  }

  const totalSelfScore = Object.values(scores).reduce((a, b) => a + b, 0);
  const starResult = ocopService.calculateScoreStar(totalSelfScore, dossier.mandatoryPassed);

  // Check completeness rate for submission
  const completeness = ocopService.calculateCompleteness(evidences, criteria);

  const handleOpenSubmitCheck = () => {
    if (completeness.missing.length > 0) {
      setSubmitAlertModal({
        open: true,
        missing: completeness.missing,
        canSubmit: false,
      });
    } else {
      setSubmitAlertModal({
        open: true,
        missing: [],
        canSubmit: true,
      });
    }
  };

  const handleConfirmSubmit = () => {
    setSubmitAlertModal({ open: false, missing: [], canSubmit: false });
    setSubmitSuccess(true);
    setDossier({
      ...dossier,
      status: 'HTX_SUBMITTED',
      statusLabel: 'Đã nộp UBND Xã (Đang chờ xác nhận Biểu 03)',
      progressPercent: 100,
    });
  };

  const handleImportEvidenceFromFarmingLog = () => {
    const newEvidence: OcopEvidence = {
      id: `EVID-${Date.now()}`,
      applicationId: dossier.id,
      criterionCode: 'TC-C.14.1',
      title: 'Nhật ký phun thuốc & Kiểm định thời gian cách ly (PHI) từ Trại ớt Palermo Tân Tiến',
      fileName: 'Nhat_Ky_Canh_Tac_PHI_Palermo_2026.pdf',
      fileSize: '2.1 MB',
      fileHashSha256: '7b98d12345e6789a0123456789abcdef7b98d12345e6789a0123456789abcdef',
      mimeType: 'application/pdf',
      version: 'v1.0',
      uploadedAt: new Date().toISOString().replace('T', ' ').substring(0, 16),
      status: 'VERIFIED',
      sourceModule: 'NhatKy',
    };
    setEvidences([newEvidence, ...evidences]);
  };

  return (
    <div className="space-y-5 pb-20 animate-fade-in">
      {/* Top Navigation & Status Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-4 rounded-2xl border border-[#e7e9ec] shadow-subtle">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate('/ocop/dossiers')}
            className="p-2 rounded-xl border border-slate-200 bg-slate-50 hover:bg-white text-slate-700 transition-all shadow-xs"
            title="Quay lại danh sách"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <span className="font-mono font-bold text-xs text-slate-500 px-2 py-0.5 bg-slate-100 rounded-md">
                {dossier.code}
              </span>
              <span className="pill-badge pill-amber">{dossier.statusLabel}</span>
              <span className="pill-badge pill-green">Bộ tiêu chí QĐ 148/QĐ-TTg</span>
            </div>
            <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight mt-1">
              {dossier.productName}
            </h1>
            <p className="text-xs text-slate-500 font-medium mt-0.5">
              Chủ thể: <strong>{dossier.submittedBy}</strong> &bull; Địa chỉ: {dossier.address}
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2 flex-wrap self-start sm:self-auto">
          <button
            onClick={() => setIsFormModalOpen(true)}
            className="px-3.5 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-extrabold text-[12.8px] transition-all flex items-center gap-1.5 border border-slate-200"
          >
            <Printer className="w-4 h-4 text-emerald-700" /> Biểu mẫu QĐ 148
          </button>

          <button
            onClick={handleOpenSubmitCheck}
            className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-black text-[13px] shadow-sm transition-all flex items-center gap-2 active:scale-98"
          >
            <Send className="w-4 h-4" /> Nộp Hồ Sơ Chính Thức
          </button>
        </div>
      </div>

      {/* Submission Success Alert */}
      {submitSuccess && (
        <div className="p-4 bg-emerald-50 border border-emerald-300 rounded-2xl text-emerald-900 flex items-center gap-3 animate-fade-in shadow-sm">
          <CheckCircle2 className="w-6 h-6 text-emerald-600 shrink-0" />
          <div className="text-[13px]">
            <p className="font-extrabold text-emerald-950">Nộp hồ sơ OCOP thành công lên UBND Xã!</p>
            <p className="text-emerald-800">
              Hồ sơ <strong>{dossier.productName}</strong> đã được gửi chính thức. UBND Xã Tân Tiến đang thẩm định và lập <strong>Biểu số 03</strong> để chuyển Hội đồng Tỉnh.
            </p>
          </div>
        </div>
      )}

      {/* Farmer Stepper Guide Header */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-emerald-950 text-white p-4 rounded-2xl shadow-subtle grid grid-cols-2 md:grid-cols-4 gap-3 text-xs">
        <div className="p-2.5 bg-white/10 rounded-xl border border-white/10 flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-full bg-emerald-500 text-slate-950 font-black flex items-center justify-center shrink-0 text-xs">1</div>
          <div>
            <p className="font-bold text-emerald-300">Thông tin chủ thể</p>
            <p className="text-[10.5px] text-slate-300">HTX Tân Tiến (Đã xác minh)</p>
          </div>
        </div>
        <div className="p-2.5 bg-white/10 rounded-xl border border-white/10 flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-full bg-emerald-500 text-slate-950 font-black flex items-center justify-center shrink-0 text-xs">2</div>
          <div>
            <p className="font-bold text-emerald-300">Tự chấm điểm QĐ 148</p>
            <p className="text-[10.5px] text-slate-300">{totalSelfScore} / 100 điểm</p>
          </div>
        </div>
        <div className="p-2.5 bg-white/10 rounded-xl border border-white/10 flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-full bg-emerald-500 text-slate-950 font-black flex items-center justify-center shrink-0 text-xs">3</div>
          <div>
            <p className="font-bold text-emerald-300">Minh chứng số VietGAP</p>
            <p className="text-[10.5px] text-slate-300">{evidences.length} tài liệu số</p>
          </div>
        </div>
        <div className="p-2.5 bg-white/10 rounded-xl border border-white/10 flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-full bg-amber-400 text-slate-950 font-black flex items-center justify-center shrink-0 text-xs">4</div>
          <div>
            <p className="font-bold text-amber-300">Hội đồng thẩm định</p>
            <p className="text-[10.5px] text-slate-300">Blind Scoring 4-5 sao</p>
          </div>
        </div>
      </div>

      {/* Dynamic Tabs Navigation Header */}
      <div className="flex flex-wrap border-b border-[#e7e9ec] bg-white rounded-t-2xl px-4 pt-2 gap-1 text-[13px] font-bold">
        <button
          onClick={() => setActiveTab('overview')}
          className={`py-3 px-4 border-b-2 transition-all flex items-center gap-2 ${
            activeTab === 'overview'
              ? 'border-emerald-600 text-emerald-800 bg-emerald-50/50 rounded-t-lg'
              : 'border-transparent text-slate-500 hover:text-slate-900'
          }`}
        >
          <FileText className="w-4 h-4" /> 1. Tổng quan & Biểu mẫu
        </button>
        <button
          onClick={() => setActiveTab('scoring')}
          className={`py-3 px-4 border-b-2 transition-all flex items-center gap-2 ${
            activeTab === 'scoring'
              ? 'border-emerald-600 text-emerald-800 bg-emerald-50/50 rounded-t-lg'
              : 'border-transparent text-slate-500 hover:text-slate-900'
          }`}
        >
          <CheckSquare className="w-4 h-4" /> 2. Chấm điểm Tiêu chí ({totalSelfScore}/100đ)
        </button>
        <button
          onClick={() => setActiveTab('evidences')}
          className={`py-3 px-4 border-b-2 transition-all flex items-center gap-2 ${
            activeTab === 'evidences'
              ? 'border-emerald-600 text-emerald-800 bg-emerald-50/50 rounded-t-lg'
              : 'border-transparent text-slate-500 hover:text-slate-900'
          }`}
        >
          <Upload className="w-4 h-4" /> 3. Kho Minh chứng số ({evidences.length})
        </button>
        <button
          onClick={() => setActiveTab('council')}
          className={`py-3 px-4 border-b-2 transition-all flex items-center gap-2 ${
            activeTab === 'council'
              ? 'border-emerald-600 text-emerald-800 bg-emerald-50/50 rounded-t-lg'
              : 'border-transparent text-slate-500 hover:text-slate-900'
          }`}
        >
          <Award className="w-4 h-4" /> 4. Đánh giá Hội đồng (Blind)
        </button>
        <button
          onClick={() => setActiveTab('certificate')}
          className={`py-3 px-4 border-b-2 transition-all flex items-center gap-2 ${
            activeTab === 'certificate'
              ? 'border-emerald-600 text-emerald-800 bg-emerald-50/50 rounded-t-lg'
              : 'border-transparent text-slate-500 hover:text-slate-900'
          }`}
        >
          <FileCheck className="w-4 h-4" /> 5. Quyết định & Chứng nhận
        </button>
      </div>

      {/* TAB 1: OVERVIEW & FORM SUMMARY */}
      {activeTab === 'overview' && (
        <div className="bg-white border border-[#e7e9ec] rounded-b-2xl p-6 shadow-subtle space-y-6">
          <div className="flex items-center justify-between border-b pb-4">
            <div>
              <h3 className="font-black text-slate-900 text-base">Thông tin chung Hồ sơ OCOP Tân Tiến</h3>
              <p className="text-xs text-slate-500">Đối tượng áp dụng: HTX Dịch vụ Nông nghiệp Tổng hợp Tân Tiến &bull; Căn cứ QĐ 148/QĐ-TTg</p>
            </div>
            <button
              onClick={() => setIsFormModalOpen(true)}
              className="px-4 py-2 bg-emerald-800 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl transition-all inline-flex items-center gap-1.5"
            >
              <Printer className="w-4 h-4" /> Xem & Xuất Biểu số 01, 02, 03
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-[13px]">
            <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-2.5">
              <h4 className="font-extrabold text-slate-900 border-b pb-1">1. Thông tin Chủ thể sản xuất</h4>
              <p><strong>Tên chủ thể:</strong> {dossier.submittedBy}</p>
              <p><strong>Mã HTX:</strong> {dossier.cooperativeCode}</p>
              <p><strong>Đại diện pháp luật:</strong> Nguyễn Văn Tân - Giám đốc HTX</p>
              <p><strong>Địa chỉ:</strong> {dossier.address}</p>
              <p><strong>Quy mô xã viên:</strong> 165 hộ gia đình canh tác rau hoa công nghệ cao</p>
            </div>

            <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-2.5">
              <h4 className="font-extrabold text-slate-900 border-b pb-1">2. Thông tin Sản phẩm Đăng ký</h4>
              <p><strong>Tên sản phẩm:</strong> <span className="font-black text-emerald-900">{dossier.productName}</span></p>
              <p><strong>Phân nhóm sản phẩm:</strong> {dossier.productCategory}</p>
              <p><strong>Hạng sao đăng ký:</strong> <span className="font-black text-amber-700">{dossier.targetStar} SAO OCOP</span></p>
              <p><strong>Mã số vùng trồng:</strong> MSVT-LĐ-2026-08 (Chi cục Trồng trọt Lâm Đồng)</p>
              <p><strong>Chứng nhận chất lượng:</strong> VietGAP còn hiệu lực đến năm 2028</p>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: CRITERIA SCORING MATRIX */}
      {activeTab === 'scoring' && (
        <div className="space-y-5">
          {/* Live Score Summary Banner */}
          <div className="p-5 bg-gradient-to-r from-emerald-900 to-teal-900 text-white rounded-2xl shadow-md flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="text-[11.5px] text-emerald-300 font-extrabold uppercase tracking-wider">
                Tổng điểm tự đánh giá OCOP (QĐ 148)
              </div>
              <div className="flex items-baseline gap-2 mt-1">
                <span className="text-4xl font-black tracking-tight">{totalSelfScore.toFixed(1)}</span>
                <span className="text-emerald-200 text-sm font-bold">/ 100.0 điểm</span>
              </div>
            </div>

            <div className="bg-white/10 backdrop-blur-xs border border-white/20 rounded-xl px-5 py-3 flex items-center gap-3">
              <Star className="w-8 h-8 fill-amber-400 text-amber-400 shrink-0" />
              <div>
                <div className="text-[11px] text-emerald-200 font-bold uppercase">Phân hạng dự kiến:</div>
                <div className={`text-base font-black ${starResult.color}`}>{starResult.label}</div>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => alert('Đã lưu bảng điểm tự đánh giá!')}
                className="px-4 py-2.5 bg-emerald-800 hover:bg-emerald-700 text-white font-bold text-[12.8px] rounded-xl transition-all inline-flex items-center gap-1.5"
              >
                <Save className="w-4 h-4" /> Lưu Bản Nháp
              </button>
            </div>
          </div>

          {/* Criteria Groups Accordion & Scoring Cards */}
          <div className="bg-white border border-[#e7e9ec] rounded-2xl shadow-subtle overflow-hidden divide-y divide-slate-100">
            {criteria.map((c) => (
              <div key={c.id} className="p-4 sm:p-5 hover:bg-slate-50/70 transition-colors space-y-2">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="px-2 py-0.5 bg-slate-100 font-mono font-bold text-xs text-slate-700 rounded-md">
                        {c.code}
                      </span>
                      {c.isMandatory && (
                        <span className="px-2 py-0.5 bg-rose-50 text-rose-700 font-bold text-[11px] rounded-md border border-rose-200">
                          Bắt buộc (Điều kiện khống chế)
                        </span>
                      )}
                    </div>
                    <h4 className="font-extrabold text-slate-900 text-sm">{c.name}</h4>
                    <p className="text-xs text-slate-500">{c.description}</p>
                    <p className="text-[11.5px] text-emerald-800 font-medium italic bg-emerald-50/80 p-2 rounded-lg border border-emerald-100">
                      💡 <strong>Hướng dẫn cho nông dân:</strong> {c.farmerInstruction}
                    </p>
                  </div>

                  <div className="flex items-center gap-3 shrink-0 self-end sm:self-center">
                    <div className="text-right">
                      <div className="text-[11px] text-slate-400 font-bold uppercase">Điểm tối đa</div>
                      <div className="text-xs font-black text-slate-700">{c.maxScore}đ</div>
                    </div>

                    <select
                      value={scores[c.code] ?? c.maxScore}
                      onChange={(e) => setScores({ ...scores, [c.code]: Number(e.target.value) })}
                      className="px-3 py-2 border border-slate-300 rounded-xl text-sm font-black bg-white focus:ring-2 focus:ring-emerald-500 focus:outline-none cursor-pointer shadow-xs"
                    >
                      <option value={c.maxScore}>{c.maxScore} điểm (Tối đa)</option>
                      <option value={Math.round(c.maxScore * 0.8)}>{Math.round(c.maxScore * 0.8)} điểm (Tốt)</option>
                      <option value={Math.round(c.maxScore * 0.5)}>{Math.round(c.maxScore * 0.5)} điểm (Trung bình)</option>
                      <option value={0}>0 điểm (Chưa đạt)</option>
                    </select>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 3: DIGITAL EVIDENCES VAULT */}
      {activeTab === 'evidences' && (
        <div className="bg-white border border-[#e7e9ec] rounded-2xl p-6 shadow-subtle space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b pb-4">
            <div>
              <h3 className="font-black text-slate-900 text-base">Kho Minh chứng Số OCOP (SHA-256 Validated)</h3>
              <p className="text-xs text-slate-500">Tải lên hoặc trích xuất tự động từ Nhật ký canh tác HTX Tân Tiến &bull; Bảo mật SHA-256</p>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={handleImportEvidenceFromFarmingLog}
                className="px-3.5 py-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-900 font-bold text-xs rounded-xl border border-emerald-200 transition-all inline-flex items-center gap-1.5"
              >
                <LinkIcon className="w-3.5 h-3.5 text-emerald-700" /> Tải từ Nhật ký canh tác HTX
              </button>

              <button
                onClick={() => alert('Vui lòng chọn file PDF/Hình ảnh minh chứng!')}
                className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl transition-all"
              >
                + Tải file lên
              </button>
            </div>
          </div>

          <div className="space-y-3">
            {evidences.map((ev) => (
              <div
                key={ev.id}
                className="flex flex-col sm:flex-row sm:items-center justify-between p-4 bg-slate-50 rounded-xl border border-slate-200 gap-3 text-[12.8px] hover:border-emerald-300 transition-all"
              >
                <div className="flex items-start gap-3">
                  <FileCheck className="w-6 h-6 text-emerald-600 shrink-0 mt-0.5" />
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-extrabold text-slate-900">{ev.title}</span>
                      <span className="px-2 py-0.5 bg-slate-200 font-mono font-bold text-[10.5px] text-slate-700 rounded-md">
                        {ev.criterionCode}
                      </span>
                      {ev.sourceModule && (
                        <span className="px-2 py-0.5 bg-emerald-100 text-emerald-900 font-bold text-[10.5px] rounded-md">
                          Module {ev.sourceModule}
                        </span>
                      )}
                    </div>
                    <p className="text-xs font-mono text-slate-500 mt-1">File: {ev.fileName} ({ev.fileSize}) &bull; Version {ev.version}</p>
                    <p className="text-[10.5px] font-mono text-slate-400 mt-0.5 truncate max-w-md">
                      SHA-256: {ev.fileHashSha256}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3 self-end sm:self-center shrink-0">
                  <span className="pill-badge pill-green">Đã xác minh</span>
                  <button
                    onClick={() => alert(`Đang xem trước file: ${ev.fileName}`)}
                    className="px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-xs font-bold text-slate-700 hover:bg-slate-50 transition-colors"
                  >
                    Xem file
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 4: COUNCIL EVALUATION (BLIND SCORING) */}
      {activeTab === 'council' && (
        <div className="bg-white border border-[#e7e9ec] rounded-2xl p-6 shadow-subtle space-y-5">
          <div className="border-b pb-4">
            <h3 className="font-black text-slate-900 text-base">Kết quả Chấm điểm Hội đồng (Blind Scoring)</h3>
            <p className="text-xs text-slate-500">Hội đồng 4 thành viên chấm điểm độc lập &bull; Tự động tính trung bình cộng & kiểm tra chênh lệch điểm</p>
          </div>

          <div className="p-4 bg-emerald-900 text-white rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="text-xs text-emerald-300 font-bold uppercase">Điểm trung bình chính thức Hội đồng:</div>
              <div className="text-3xl font-black text-white mt-0.5">86.6 / 100 điểm</div>
            </div>
            <div className="bg-emerald-800 border border-emerald-700 rounded-xl px-4 py-2 text-right">
              <div className="text-[11px] text-emerald-200">Kết quả Xếp hạng:</div>
              <div className="text-base font-black text-amber-300">⭐⭐⭐⭐ OCOP 4 SAO</div>
            </div>
          </div>

          <div className="space-y-3">
            {evaluators.map((ev, idx) => (
              <div key={idx} className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-1.5 text-xs">
                <div className="flex justify-between items-center font-bold">
                  <span className="text-slate-900 text-sm font-extrabold">{ev.evaluatorName} ({ev.role})</span>
                  <span className="text-emerald-800 font-black text-sm">{ev.score} / 100 điểm</span>
                </div>
                <p className="text-slate-600 italic">"{ev.comments}"</p>
                <div className="text-[10.5px] text-slate-400 text-right">Thời gian chấm: {ev.submittedAt}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 5: CERTIFICATE & DECISION PREVIEW */}
      {activeTab === 'certificate' && (
        <div className="bg-white border border-[#e7e9ec] rounded-2xl p-6 shadow-subtle space-y-6">
          <div className="flex items-center justify-between border-b pb-4">
            <div>
              <h3 className="font-black text-slate-900 text-base">Xem trước Quyết định & Chứng nhận OCOP</h3>
              <p className="text-xs text-slate-500">Giấy chứng nhận sản phẩm OCOP có hiệu lực 36 tháng kể từ ngày cấp</p>
            </div>
            <button
              onClick={() => setIsFormModalOpen(true)}
              className="px-4 py-2 bg-emerald-800 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl transition-all"
            >
              In Giấy Chứng Nhận
            </button>
          </div>

          <div className="p-8 border-4 border-double border-amber-300 rounded-3xl bg-gradient-to-b from-amber-50/40 to-amber-100/20 text-center space-y-4 shadow-sm max-w-2xl mx-auto">
            <Award className="w-16 h-16 text-amber-500 mx-auto" />
            <h2 className="text-2xl font-black text-amber-950 uppercase tracking-wide">GIẤY CHỨNG NHẬN SẢN PHẨM OCOP</h2>
            <p className="text-base font-black text-slate-900">{dossier.productName}</p>
            <p className="text-xs text-slate-600">Thuộc chủ thể: {dossier.submittedBy}</p>
            <div className="inline-block px-4 py-1 bg-amber-400 text-slate-950 font-black text-sm rounded-full shadow-xs">
              ĐẠT CHỨNG NHẬN OCOP 4 SAO CẤP TỈNH
            </div>
            <p className="text-[11px] text-slate-500 pt-4">Thời hạn chứng nhận: 36 tháng (Hiệu lực 2026 - 2029)</p>
          </div>
        </div>
      )}

      {/* QĐ 148 Document Export Modal */}
      <Qd148DocumentModal
        isOpen={isFormModalOpen}
        onClose={() => setIsFormModalOpen(false)}
        dossier={dossier}
      />

      {/* Submission Safeguard Alert Modal (BR-OCOP-01) */}
      {submitAlertModal.open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 animate-fade-in">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-md p-6 space-y-4">
            {submitAlertModal.canSubmit ? (
              <>
                <div className="flex items-center gap-3 text-emerald-800">
                  <ShieldCheck className="w-8 h-8 text-emerald-600 shrink-0" />
                  <div>
                    <h3 className="font-extrabold text-base text-slate-900">Xác nhận Nộp Hồ Sơ OCOP</h3>
                    <p className="text-xs text-slate-500">Hồ sơ đã đạt 100% minh chứng bắt buộc theo QĐ 148.</p>
                  </div>
                </div>

                <p className="text-xs text-slate-600 leading-relaxed">
                  Bà con có chắc chắn muốn chuyển hồ sơ <strong>{dossier.productName}</strong> lên UBND Xã Tân Tiến để tiến hành thẩm định và ký Biểu số 03 không?
                </p>

                <div className="flex items-center justify-end gap-2 pt-2">
                  <button
                    onClick={() => setSubmitAlertModal({ open: false, missing: [], canSubmit: false })}
                    className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl"
                  >
                    Hủy bỏ
                  </button>

                  <button
                    onClick={handleConfirmSubmit}
                    className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs rounded-xl shadow-xs"
                  >
                    Xác nhận Nộp Ngay
                  </button>
                </div>
              </>
            ) : (
              <>
                <div className="flex items-center gap-3 text-rose-800">
                  <AlertTriangle className="w-8 h-8 text-rose-600 shrink-0" />
                  <div>
                    <h3 className="font-extrabold text-base text-slate-900">Chưa thể nộp hồ sơ!</h3>
                    <p className="text-xs text-rose-600 font-bold">Thiếu minh chứng bắt buộc theo BR-OCOP-01</p>
                  </div>
                </div>

                <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl space-y-1.5 text-xs text-rose-950">
                  <p className="font-bold">Danh sách tiêu chí bắt buộc còn thiếu minh chứng:</p>
                  <ul className="list-disc pl-4 space-y-1 text-[11.5px]">
                    {submitAlertModal.missing.map((m) => (
                      <li key={m.id}>
                        <strong>{m.code}:</strong> {m.name}
                      </li>
                    ))}
                  </ul>
                </div>

                <p className="text-xs text-slate-500">
                  Vui lòng tải bổ sung minh chứng cho các tiêu chí bắt buộc trên trước khi nộp chính thức.
                </p>

                <div className="flex items-center justify-end pt-2">
                  <button
                    onClick={() => setSubmitAlertModal({ open: false, missing: [], canSubmit: false })}
                    className="px-4 py-2 bg-slate-800 text-white font-bold text-xs rounded-xl"
                  >
                    Đóng & Tải bổ sung
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
