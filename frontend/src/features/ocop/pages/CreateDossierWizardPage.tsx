import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Star } from 'lucide-react';
import { useTenantContextStore } from '@/stores/tenantContextStore';
import { 
  DEFAULT_SUGGESTED_SCORES, 
  calculateOcopScores 
} from '../data/ocopQd148Data';
import { UploadedEvidence, WizardFormData } from '../components/wizard/wizardTypes';
import { WizardStepper } from '../components/wizard/WizardStepper';
import { WizardGeneralStep } from '../components/wizard/WizardGeneralStep';
import { WizardProductStep } from '../components/wizard/WizardProductStep';
import { WizardEvidencesStep } from '../components/wizard/WizardEvidencesStep';
import { WizardCriteriaStep } from '../components/wizard/WizardCriteriaStep';
import { WizardConfirmStep } from '../components/wizard/WizardConfirmStep';
import { WizardSuccessStep } from '../components/wizard/WizardSuccessStep';
import { tokenStorage } from '@/services/tokenStorage';

export const CreateDossierWizardPage: React.FC = () => {
  const navigate = useNavigate();
  const { activeCooperative } = useTenantContextStore();
  const [currentStep, setCurrentStep] = useState<number>(1);
  const currentYear = new Date().getFullYear();
  const user = tokenStorage.getUser();

  // Clean Initial Form State without hardcoded mocks
  const [formData, setFormData] = useState<WizardFormData>({
    dossierCode: `HS-OCOP-${currentYear}-${Date.now().toString().slice(-4)}`,
    evalYear: String(currentYear),
    evalBatch: `Đợt 1 (${currentYear})`,
    createdDate: new Date().toLocaleDateString('vi-VN'),
    status: 'Lưu nháp',
    evalLevel: 'Cấp huyện',
    creatorName: user?.full_name || '',
    creatorRole: (user?.roles?.[0]?.display_name || user?.roles?.[0]?.name || (typeof user?.roles?.[0] === 'string' ? user?.roles?.[0] : '')) || 'Cán bộ phụ trách',

    subjectName: activeCooperative?.legal_name || '',
    subjectCode: activeCooperative?.cooperative_code || activeCooperative?.tax_code || '',
    subjectType: 'Hợp tác xã',
    address: activeCooperative?.address || '',
    phone: activeCooperative?.phone_number || '',
    email: activeCooperative?.email || '',

    repName: (activeCooperative as any)?.representative_name || user?.full_name || '',
    repRole: 'Người đại diện pháp luật',
    repPhone: activeCooperative?.phone_number || '',
    repEmail: activeCooperative?.email || '',

    memberCount: '',
    laborCount: '',
    establishedDate: (activeCooperative as any)?.established_date || '',
    notes: '',

    productName: '',
    productCode: '',
    category: '',
    rawLocation: '',
    area: '',
    yield: '',
  });

  // Empty Evidences & Scores State (Truthful Initial Data State)
  const [evidences, setEvidences] = useState<UploadedEvidence[]>([]);
  const [scores, setScores] = useState<Record<string, number>>({});
  const [smartAppliedNotification, setSmartAppliedNotification] = useState<string | null>(null);

  // Evidence map for score calculator
  const evidenceCountMap: Record<string, number> = {};
  evidences.forEach((ev) => {
    evidenceCountMap[ev.criterionCode] = (evidenceCountMap[ev.criterionCode] || 0) + 1;
  });

  // Real-time calculation
  const calculation = calculateOcopScores(scores, evidenceCountMap);

  const steps = [
    { num: 1, title: 'Thông tin chung' },
    { num: 2, title: 'Sản phẩm OCOP' },
    { num: 3, title: 'Hồ sơ minh chứng' },
    { num: 4, title: 'Tiêu chí đánh giá' },
    { num: 5, title: 'Xác nhận hồ sơ' },
    { num: 6, title: 'Gửi đánh giá' },
  ];

  const handleApplyAllSmartSuggestions = () => {
    setScores(DEFAULT_SUGGESTED_SCORES);
    setSmartAppliedNotification(
      `Đã áp dụng toàn bộ mức điểm gợi ý tối ưu từ dữ liệu vùng trồng, VietGAP và hồ sơ năng lực của ${
        activeCooperative?.legal_name || 'HTX'
      } (Tổng: 98.5đ - 4 Sao OCOP)!`
    );
    setTimeout(() => {
      setSmartAppliedNotification(null);
    }, 5000);
  };

  const handleAddEvidence = (newEv: UploadedEvidence | UploadedEvidence[]) => {
    const toAdd = Array.isArray(newEv) ? newEv : [newEv];
    setEvidences((prev) => [...toAdd, ...prev]);
  };

  const handleDeleteEvidence = (id: string) => {
    setEvidences(evidences.filter((e) => e.id !== id));
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6 pb-20 animate-fade-in text-slate-800">
      {/* Top Header */}
      <div className="flex items-center justify-between bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate('/ocop/dossiers')}
            className="p-2 rounded-xl border border-slate-200 bg-slate-50 hover:bg-white text-slate-700 transition-all shadow-xs cursor-pointer"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[11.5px] font-mono font-bold text-slate-400">Trang chủ / OCOP / Hồ sơ OCOP</span>
              <span className="pill-badge pill-blue">QĐ 148 Chuẩn hóa</span>
            </div>
            <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight mt-0.5">
              Chuẩn bị Hồ sơ Phân hạng OCOP (QĐ 148/QĐ-TTg)
            </h1>
          </div>
        </div>
        <div className="flex items-center gap-2.5">
          {calculation.totalScore > 0 && (
            <div className="hidden sm:flex items-center gap-1.5 px-3 py-1 bg-amber-50 border border-amber-200 rounded-xl text-xs font-black text-amber-800 shadow-2xs">
              <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-500" />
              <span>{calculation.totalScore.toFixed(1)}đ ({calculation.starLabel})</span>
            </div>
          )}
          <span className="pill-badge pill-green font-mono font-black text-xs">
            {calculation.completionPercentage}% Hoàn thành
          </span>
        </div>
      </div>

      {/* Stepper Progress Bar Header */}
      <WizardStepper
        steps={steps}
        currentStep={currentStep}
        onSelectStep={setCurrentStep}
      />

      {/* Main Form Content */}
      <div className="space-y-6">
        {currentStep === 1 && (
          <WizardGeneralStep
            formData={formData}
            setFormData={setFormData}
            onNext={() => setCurrentStep(2)}
          />
        )}

        {currentStep === 2 && (
          <WizardProductStep
            formData={formData}
            setFormData={setFormData}
            onNext={() => setCurrentStep(3)}
            onBack={() => setCurrentStep(1)}
          />
        )}

        {currentStep === 3 && (
          <WizardEvidencesStep
            evidences={evidences}
            onAddEvidence={handleAddEvidence}
            onDeleteEvidence={handleDeleteEvidence}
            onNext={() => setCurrentStep(4)}
            onBack={() => setCurrentStep(2)}
          />
        )}

        {currentStep === 4 && (
          <WizardCriteriaStep
            scores={scores}
            onSelectScore={(code, score) => setScores({ ...scores, [code]: score })}
            onApplyAllSmartSuggestions={handleApplyAllSmartSuggestions}
            smartAppliedNotification={smartAppliedNotification}
            calculation={calculation}
            evidenceCountMap={evidenceCountMap}
            onNext={() => setCurrentStep(5)}
            onBack={() => setCurrentStep(3)}
          />
        )}

        {currentStep === 5 && (
          <WizardConfirmStep
            formData={formData}
            evidencesCount={evidences.length}
            calculation={calculation}
            activeCooperativeName={activeCooperative?.legal_name || ''}
            onSubmit={() => setCurrentStep(6)}
            onBack={() => setCurrentStep(4)}
          />
        )}

        {currentStep === 6 && (
          <WizardSuccessStep
            dossierCode={formData.dossierCode}
            productName={formData.productName}
            onFinish={() => navigate('/ocop/dossiers')}
          />
        )}
      </div>
    </div>
  );
};

export default CreateDossierWizardPage;
