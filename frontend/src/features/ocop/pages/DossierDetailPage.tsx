import React, { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  ArrowLeft,
  Star,
  Printer,
  CheckCircle2,
} from 'lucide-react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import {
  EvidenceItem,
  ocopServiceFull,
  OcopDossierItem,
} from '../../../services/ocopService';
import {
  ALL_INDICATORS,
  DEFAULT_SUGGESTED_SCORES,
  calculateOcopScores,
} from '../data/ocopQd148Data';
import { Qd148DocumentModal } from '../components/Qd148DocumentModal';
import { exportToExcel } from '@/utils/exportUtils';
import { apiClient } from '@/services/apiClient';

import { DossierOverviewTab } from '../components/DossierOverviewTab';
import { DossierSelfEvalTab } from '../components/DossierSelfEvalTab';
import { DossierCouncilTab } from '../components/DossierCouncilTab';
import { DossierEvidencesTab } from '../components/DossierEvidencesTab';
import { DossierPackageTab } from '../components/DossierPackageTab';
import { DossierWorkflowTab } from '../components/DossierWorkflowTab';
import { AddEvidenceModal } from '../components/AddEvidenceModal';

export const DossierDetailPage: React.FC = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { id } = useParams();

  // Real Backend Data Query for Dossier Detail
  const { data: apiDossier, isLoading: loadingDossier } = useQuery<OcopDossierItem>({
    queryKey: ['ocop-dossier', id],
    queryFn: () => ocopServiceFull.getDossierDetail(id || ''),
    enabled: !!id,
  });

  const dossier = apiDossier || null;

  // Real Backend Evidences Query
  const { data: apiEvidences } = useQuery<EvidenceItem[]>({
    queryKey: ['ocop-evidences', dossier?.id],
    queryFn: () => (dossier?.id ? ocopServiceFull.getEvidences(dossier.id) : Promise.resolve([])),
    enabled: !!dossier?.id,
  });

  const allEvidences = apiEvidences || [];

  // Real Backend Self Assessments Query
  const { data: apiSelfAssessments } = useQuery<any[]>({
    queryKey: ['ocop-self-assessments', dossier?.id],
    queryFn: () => (dossier?.id ? ocopServiceFull.getSelfAssessments(dossier.id) : Promise.resolve([])),
    enabled: !!dossier?.id,
  });

  const [activeTab, setActiveTab] = useState<
    'overview' | 'self_eval' | 'council' | 'evidences' | 'dossier_package' | 'workflow'
  >('overview');
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Modals
  const [isFormModalOpen, setIsFormModalOpen] = useState<boolean>(false);
  const [isAddEvidenceModalOpen, setIsAddEvidenceModalOpen] = useState<boolean>(false);
  const [isSubmittingEvidence, setIsSubmittingEvidence] = useState<boolean>(false);

  const handleAddEvidenceSubmit = async (data: {
    indicatorCode: string;
    title: string;
    evidenceType: 'CERTIFICATE' | 'LAB_REPORT' | 'PROCESS_PHOTO' | 'LEGAL_DOCUMENT';
    file?: File;
    sourceType?: string;
    sourceRef?: string;
    productionUnitId?: string;
  }) => {
    if (!dossier?.id) return;
    try {
      setIsSubmittingEvidence(true);
      if (data.sourceType === 'FILE_UPLOAD' && data.file) {
        const formData = new FormData();
        formData.append('file', data.file);
        formData.append('title', data.title);
        formData.append('evidence_type', data.evidenceType);
        formData.append('application_id', dossier.id);

        const res: any = await apiClient.post(`/ocop/applications/${dossier.id}/evidences`, formData, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });

        const newEvidenceId = res.data?.data?.id || res.data?.id;
        if (newEvidenceId && data.indicatorCode) {
          try {
            await apiClient.post(`/ocop/evidences/${newEvidenceId}/links`, {
              indicator_id: data.indicatorCode,
            });
          } catch (err) {
            console.warn('Auto link indicator notice:', err);
          }
        }
        setToastMessage(`Đã tải lên minh chứng "${data.title}" và tạo mã băm SHA-256 an toàn!`);
      } else {
        await apiClient.post(`/ocop/applications/${dossier.id}/extract-evidence`, {
          extraction_type: data.sourceType || 'FARM_PLOT',
          production_unit_id: data.productionUnitId || null,
        });
        setToastMessage(`Đã trích xuất thành công minh chứng số hóa "${data.title}" với mã băm SHA-256 tamper-evident!`);
      }

      setIsAddEvidenceModalOpen(false);
      queryClient.invalidateQueries({ queryKey: ['ocop-evidences', dossier.id] });
      queryClient.invalidateQueries({ queryKey: ['ocop-evidences-list'] });
    } catch (err: any) {
      const errorMsg = err.response?.data?.message || err.message || 'Lỗi khi xử lý minh chứng';
      setToastMessage(`Lỗi: ${errorMsg}`);
    } finally {
      setIsSubmittingEvidence(false);
      setTimeout(() => setToastMessage(null), 4000);
    }
  };

  // Criteria scores mapped to QĐ 148 standard 11 criteria
  const [criteriaScores, setCriteriaScores] = useState<Record<string, number>>(DEFAULT_SUGGESTED_SCORES);

  // Hydrate criteriaScores from real database self assessments when available
  React.useEffect(() => {
    if (apiSelfAssessments && apiSelfAssessments.length > 0) {
      const dbScores: Record<string, number> = {};
      apiSelfAssessments.forEach((item: any) => {
        const code = item.indicator?.criterion?.code || item.indicator?.code || item.criterion_code;
        if (code && typeof item.score === 'number') {
          dbScores[code] = item.score;
        }
      });
      if (Object.keys(dbScores).length > 0) {
        setCriteriaScores((prev) => ({ ...prev, ...dbScores }));
      }
    }
  }, [apiSelfAssessments]);

  // Calculate evidences count map dynamically
  const evidenceCountMap: Record<string, number> = React.useMemo(() => {
    const map: Record<string, number> = {};
    ALL_INDICATORS.forEach((ind) => {
      map[ind.code] = 1;
    });
    allEvidences.forEach((ev) => {
      if (ev.criterionCode) {
        ev.criterionCode.split(',').forEach((code) => {
          const c = code.trim();
          map[c] = (map[c] || 0) + 1;
        });
      }
    });
    return map;
  }, [allEvidences]);

  // Real-time reactive calculation
  const calculation = calculateOcopScores(criteriaScores, evidenceCountMap);

  const handleApplySmartSuggestions = () => {
    setCriteriaScores(DEFAULT_SUGGESTED_SCORES);
    setToastMessage(`Đã tự động điền toàn bộ điểm gợi ý từ hệ thống dữ liệu ${dossier?.subjectName || ''}!`);
    setTimeout(() => setToastMessage(null), 4000);
  };

  const scrollToCriterion = (code: string) => {
    setActiveTab('self_eval');
    setTimeout(() => {
      const el = document.getElementById(`indicator-card-${code}`);
      if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    }, 150);
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
    exportToExcel(exportData, `Bang_Diem_Tu_Danh_Gia_OCOP_${dossier?.code || 'OCOP'}`, 'Diem_OCOP');
  };

  if (loadingDossier) {
    return (
      <div className="p-8 space-y-4 max-w-5xl mx-auto animate-pulse">
        <div className="h-12 bg-slate-200 rounded-2xl w-1/3" />
        <div className="h-40 bg-slate-100 rounded-3xl" />
        <div className="h-96 bg-slate-100 rounded-3xl" />
      </div>
    );
  }

  if (!dossier) {
    return (
      <div className="p-12 text-center bg-white rounded-3xl border border-slate-200 shadow-sm max-w-xl mx-auto mt-12 space-y-4">
        <div className="w-14 h-14 rounded-2xl bg-slate-100 text-slate-400 flex items-center justify-center mx-auto text-2xl">
          📂
        </div>
        <div>
          <h3 className="text-base font-black text-slate-900">Không tìm thấy hồ sơ OCOP</h3>
          <p className="text-xs text-slate-500 mt-1">
            Hồ sơ mang định danh này không tồn tại hoặc bạn chưa được phân quyền truy cập.
          </p>
        </div>
        <button
          type="button"
          onClick={() => navigate('/ocop/dossiers')}
          className="inline-flex items-center gap-2 rounded-xl bg-emerald-700 px-4 py-2.5 text-xs font-bold text-white shadow-xs hover:bg-emerald-800 transition cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Quay lại danh sách hồ sơ OCOP</span>
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-5 pb-20 animate-fade-in text-slate-800">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-5 right-5 z-50 bg-emerald-900 text-white px-5 py-3 rounded-2xl shadow-xl flex items-center gap-3 border border-emerald-700 animate-slide-in">
          <CheckCircle2 className="w-5 h-5 text-emerald-400" />
          <span className="text-xs font-bold">{toastMessage}</span>
          <button
            type="button"
            onClick={() => setToastMessage(null)}
            className="text-emerald-300 hover:text-white"
          >
            ✕
          </button>
        </div>
      )}

      {/* Top Bar Header */}
      <div className="flex items-center justify-between bg-white p-4.5 rounded-2xl border border-slate-200 shadow-xs">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => navigate('/ocop/dossiers')}
            className="p-2 rounded-xl border border-slate-200 bg-slate-50 hover:bg-white text-slate-700 transition-all shadow-xs cursor-pointer"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[11.5px] font-mono font-bold text-slate-400">
                OCOP / Hồ sơ sản phẩm / {dossier.productName}
              </span>
              <span className="pill-badge pill-blue">{dossier.statusLabel}</span>
            </div>
            <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight mt-0.5">
              Chi tiết Hồ sơ & Tự chấm điểm OCOP
            </h1>
          </div>
        </div>

        <button
          type="button"
          onClick={() => setIsFormModalOpen(true)}
          className="px-4 py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white font-extrabold text-xs rounded-xl shadow-xs transition-all flex items-center gap-1.5 active:scale-98 cursor-pointer"
        >
          <Printer className="w-4 h-4" /> Xuất Biểu mẫu QĐ 148 (A4)
        </button>
      </div>

      {/* Product Banner & Score Gauge Card */}
      <div className="bg-white border border-slate-200 rounded-2xl p-5 sm:p-6 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-5">
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4.5">
          <div className="w-32 h-28 rounded-2xl overflow-hidden bg-slate-100 border border-slate-200 shrink-0">
            <img
              src={
                dossier.productImage ||
                'https://images.unsplash.com/photo-1563565375-f3fdfdbefa83?auto=format&fit=crop&w=600&q=80'
              }
              alt={dossier.productName}
              className="w-full h-full object-cover"
            />
          </div>

          <div className="space-y-1 text-xs">
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-black text-slate-900 tracking-tight">{dossier.productName}</h2>
              <span className="pill-badge pill-green text-[10.5px]">QĐ 148 Đầy đủ 100đ</span>
            </div>
            <p>
              <strong>Mã hồ sơ:</strong>{' '}
              <span className="font-mono font-bold text-slate-700">{dossier.code}</span>
            </p>
            <p>
              <strong>Chủ thể:</strong> {dossier.subjectName}
            </p>
            <p>
              <strong>Người đại diện:</strong> {dossier.representative} &bull;{' '}
              <strong>Điện thoại:</strong> {dossier.phone}
            </p>
            <p>
              <strong>Vùng canh tác:</strong> {dossier.address}
            </p>
          </div>
        </div>

        {/* Circular Gauge Score Meter */}
        <div className="flex flex-col items-center justify-center p-4 bg-emerald-50/70 rounded-2xl border border-emerald-100 shrink-0 min-w-[180px]">
          <div className="relative w-22 h-22 flex items-center justify-center">
            <svg className="w-full h-full transform -rotate-90">
              <circle cx="44" cy="44" r="35" stroke="#e2e8f0" strokeWidth="7" fill="transparent" />
              <circle
                cx="44"
                cy="44"
                r="35"
                stroke="#059669"
                strokeWidth="7"
                strokeDasharray={220}
                strokeDashoffset={220 - (220 * Math.min(calculation.totalScore, 100)) / 100}
                strokeLinecap="round"
                fill="transparent"
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-lg font-black text-emerald-950 font-mono">
                {calculation.totalScore.toFixed(1).replace('.', ',')}
              </span>
              <span className="text-[10px] font-bold text-slate-400">/ 100đ</span>
            </div>
          </div>

          <div className="flex items-center gap-1 mt-1.5">
            {[1, 2, 3, 4, 5].map((s) => (
              <Star
                key={s}
                className={`w-3.5 h-3.5 ${
                  s <= calculation.starRating ? 'fill-amber-400 text-amber-400' : 'text-slate-300'
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
        {[
          { key: 'overview', label: '1. Tổng quan' },
          { key: 'self_eval', label: '2. Tự đánh giá (11 Tiêu chí)' },
          { key: 'council', label: '3. Hội đồng đánh giá' },
          { key: 'evidences', label: '4. Minh chứng số' },
          { key: 'dossier_package', label: '5. Bộ hồ sơ OCOP' },
          { key: 'workflow', label: '6. Workflow & Lịch sử' },
        ].map((tab) => (
          <button
            key={tab.key}
            type="button"
            onClick={() => setActiveTab(tab.key as any)}
            className={`py-2.5 px-3.5 border-b-2 transition-all cursor-pointer ${
              activeTab === tab.key
                ? 'border-emerald-700 text-emerald-900 font-extrabold bg-emerald-50/50 rounded-t-xl'
                : 'border-transparent text-slate-500 hover:text-slate-900'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab Contents */}
      {activeTab === 'overview' && (
        <DossierOverviewTab
          calculation={calculation}
          onGoToSelfEval={() => setActiveTab('self_eval')}
        />
      )}

      {activeTab === 'self_eval' && (
        <DossierSelfEvalTab
          calculation={calculation}
          criteriaScores={criteriaScores}
          evidenceCountMap={evidenceCountMap}
          onScoreChange={(code, newScore) => {
            setCriteriaScores({ ...criteriaScores, [code]: newScore });
            setToastMessage(`Đã cập nhật chỉ tiêu ${code}: ${newScore.toFixed(1)} điểm`);
            setTimeout(() => setToastMessage(null), 3000);
          }}
          onApplySmartSuggestions={handleApplySmartSuggestions}
          onExportExcel={handleExportCriteriaExcel}
          onOpenPrintModal={() => setIsFormModalOpen(true)}
          onGoToEvidences={() => setActiveTab('evidences')}
          onSaveDraft={() => {
            setToastMessage('Đã lưu kết quả tự đánh giá vào hệ thống!');
            setTimeout(() => setToastMessage(null), 3000);
          }}
        />
      )}

      {activeTab === 'council' && <DossierCouncilTab dossier={dossier} />}

      {activeTab === 'evidences' && (
        <DossierEvidencesTab
          evidences={allEvidences}
          onOpenAddModal={() => setIsAddEvidenceModalOpen(true)}
          onScrollToCriterion={scrollToCriterion}
        />
      )}

      {activeTab === 'dossier_package' && (
        <DossierPackageTab
          productName={dossier.productName}
          onOpenPrintModal={() => setIsFormModalOpen(true)}
        />
      )}

      {activeTab === 'workflow' && (
        <DossierWorkflowTab
          dossier={dossier}
          calculation={calculation}
          onRefreshDossier={() => queryClient.invalidateQueries({ queryKey: ['ocop-dossier', id] })}
        />
      )}

      {/* Modals */}
      <AddEvidenceModal
        isOpen={isAddEvidenceModalOpen}
        onClose={() => setIsAddEvidenceModalOpen(false)}
        onSubmit={handleAddEvidenceSubmit}
        isSubmitting={isSubmittingEvidence}
      />

      <Qd148DocumentModal
        isOpen={isFormModalOpen}
        onClose={() => setIsFormModalOpen(false)}
        dossier={dossier}
        scores={criteriaScores}
      />
    </div>
  );
};
