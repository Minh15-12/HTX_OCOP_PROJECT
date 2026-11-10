import React, { useState, useEffect } from 'react';
import { Member, CapitalTransaction, CapitalForm } from '@/types/memberTypes';
import { X, CheckCircle2, AlertTriangle } from 'lucide-react';
import { MemberWizardFormState } from './wizard/wizardTypes';
import { MemberWizardStep1Personal } from './wizard/MemberWizardStep1Personal';
import { MemberWizardStep2Contact } from './wizard/MemberWizardStep2Contact';
import { MemberWizardStep3Capital } from './wizard/MemberWizardStep3Capital';
import { MemberWizardStep4Profit } from './wizard/MemberWizardStep4Profit';
import { MemberWizardStep5Confirm } from './wizard/MemberWizardStep5Confirm';

interface MemberWizardProps {
  isOpen: boolean;
  onClose: () => void;
  nextMemberNumber: number;
  totalMemberCapital: number;
  onAddMemberAndTx: (member: Member, tx?: CapitalTransaction) => void;
  triggerToast: (msg: string, type?: 'success' | 'danger' | 'warning' | 'info') => void;
}

export const MemberWizard: React.FC<MemberWizardProps> = ({
  isOpen,
  onClose,
  nextMemberNumber,
  totalMemberCapital,
  onAddMemberAndTx,
  triggerToast,
}) => {
  const [wizardStep, setWizardStep] = useState<1 | 2 | 3 | 4 | 5>(1);
  const [wizardStepError, setWizardStepError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [wizardUploadedFile, setWizardUploadedFile] = useState<File | null>(null);

  const calculateDynamicProfitRate = (committedCap: number, initialCap: number, method: string) => {
    const actualCap = method === 'Góp một lần' ? committedCap : initialCap;
    const newTotalCoopCap = totalMemberCapital + actualCap;
    return newTotalCoopCap > 0 ? Number(((actualCap / newTotalCoopCap) * 100).toFixed(2)) : 0;
  };

  const initialFormState: MemberWizardFormState = {
    full_name: '',
    gender: 'Nam',
    dob: '',
    cccd: '',
    cccd_issue_date: '',
    cccd_issue_place: '',
    education_level: 'Chưa xác định',
    occupation: '',
    province: 'Lâm Đồng',
    district: '',
    ward: '',
    detail_address: '',
    phone: '',
    email: '',
    zalo: '',
    facebook: '',
    capital_form: 'TIEN_MAT' as CapitalForm,
    capital_payment_method: 'CASH',
    capital_receipt_file: null,
    committed_capital: 0,
    initial_contributed_capital: 0,
    capital_in_words: '',
    contribution_date: new Date().toISOString().split('T')[0],
    commitment_deadline: new Date(Date.now() + 180 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    contribution_method: 'Góp một lần',
    member_type: 'CHINH_THUC',
    profit_share_rate: 0,
    payout_method: 'CASH',
    bank_name: '',
    bank_account: '',
    account_holder: '',
    credit_limit: 0,
    notes: '',
  };

  const [wizardForm, setWizardForm] = useState<MemberWizardFormState>(initialFormState);

  useEffect(() => {
    if (isOpen) {
      setWizardStep(1);
      setWizardStepError(null);
      setFieldErrors({});
      setWizardUploadedFile(null);
      setWizardForm({
        ...initialFormState,
        profit_share_rate: 0,
      });
    }
  }, [isOpen]);

  const updateFormData = (patch: Partial<MemberWizardFormState>) => {
    setWizardForm((prev) => ({ ...prev, ...patch }));
  };

  const clearFieldError = (field: string) => {
    setFieldErrors((prev) => {
      const next = { ...prev };
      delete next[field];
      return next;
    });
  };

  const validateWizardStep = (step: number): boolean => {
    const errors: Record<string, string> = {};
    let mainMsg: string | null = null;

    if (step === 1) {
      if (!wizardForm.full_name.trim()) errors.full_name = 'Vui lòng nhập Họ và tên xã viên';
      if (!wizardForm.dob) errors.dob = 'Vui lòng chọn Ngày sinh';
      if (!wizardForm.cccd.trim()) {
        errors.cccd = 'Vui lòng nhập Số CCCD (12 chữ số)';
      } else if (!/^[0-9]{12}$/.test(wizardForm.cccd.trim())) {
        errors.cccd = 'Số CCCD phải bao gồm đúng 12 chữ số';
      }
      if (!wizardForm.cccd_issue_date) errors.cccd_issue_date = 'Vui lòng chọn Ngày cấp';
      if (!wizardForm.cccd_issue_place.trim()) errors.cccd_issue_place = 'Vui lòng nhập Nơi cấp CCCD';

      if (Object.keys(errors).length > 0) {
        if (errors.cccd_issue_place && Object.keys(errors).length === 1) {
          mainMsg = 'Vui lòng nhập Nơi cấp CCCD trước khi chuyển sang bước tiếp theo!';
        } else if (errors.cccd) {
          mainMsg = errors.cccd;
        } else if (errors.full_name) {
          mainMsg = 'Vui lòng nhập Họ và tên xã viên!';
        } else {
          mainMsg = 'Vui lòng điền đầy đủ các thông tin cá nhân bắt buộc (có dấu *)!';
        }
      }
    } else if (step === 2) {
      if (!wizardForm.detail_address.trim()) errors.detail_address = 'Vui lòng nhập Địa chỉ chi tiết';
      if (!wizardForm.phone.trim()) {
        errors.phone = 'Vui lòng nhập Số điện thoại liên hệ';
      } else if (!/^0[0-9]{9}$/.test(wizardForm.phone.trim()) && !/^[0-9]{10}$/.test(wizardForm.phone.trim())) {
        errors.phone = 'Số điện thoại phải bao gồm đúng 10 chữ số';
      }
      if (Object.keys(errors).length > 0) {
        if (errors.phone) mainMsg = errors.phone;
        else mainMsg = 'Vui lòng điền đầy đủ thông tin địa chỉ chi tiết và Số điện thoại 10 chữ số!';
      }
    } else if (step === 3) {
      const actualContributed =
        wizardForm.contribution_method === 'Góp một lần'
          ? wizardForm.committed_capital
          : wizardForm.initial_contributed_capital;
      if (!wizardForm.committed_capital || wizardForm.committed_capital <= 0) {
        errors.committed_capital = 'Vốn cam kết phải lớn hơn 0 VNĐ';
      }
      if (!actualContributed || actualContributed < 0) {
        errors.initial_contributed_capital = 'Số tiền thực góp đợt 1 không hợp lệ';
      }
      if (!wizardForm.contribution_date) {
        errors.contribution_date = 'Vui lòng chọn Ngày góp vốn';
      }
      if (Object.keys(errors).length > 0) {
        mainMsg = errors.committed_capital || errors.initial_contributed_capital || 'Vui lòng điền đầy đủ thông tin vốn góp!';
      }
    } else if (step === 4) {
      if (wizardForm.profit_share_rate === undefined || wizardForm.profit_share_rate < 0) {
        errors.profit_share_rate = 'Tỷ lệ phân chia phải lớn hơn hoặc bằng 0%';
      }
      if (Object.keys(errors).length > 0) {
        mainMsg = 'Vui lòng nhập tỷ lệ phân chia lợi nhuận hợp lệ!';
      }
    }

    setFieldErrors(errors);
    setWizardStepError(mainMsg);
    return Object.keys(errors).length === 0;
  };

  const handleNextStep = () => {
    if (validateWizardStep(wizardStep)) {
      setWizardStepError(null);
      setFieldErrors({});
      setWizardStep((wizardStep + 1) as any);
    }
  };

  const handleStepHeaderClick = (targetStep: number) => {
    if (targetStep <= wizardStep) {
      setWizardStepError(null);
      setFieldErrors({});
      setWizardStep(targetStep as any);
    } else {
      if (validateWizardStep(wizardStep)) {
        setWizardStepError(null);
        setFieldErrors({});
        setWizardStep(targetStep as any);
      }
    }
  };

  const handleWizardSubmit = () => {
    if (!validateWizardStep(1) || !validateWizardStep(2) || !validateWizardStep(3) || !validateWizardStep(4)) {
      triggerToast('Vui lòng hoàn tất các bước thông tin bị thiếu trước khi lưu!', 'danger');
      return;
    }
    const newCode = `TV${String(nextMemberNumber).padStart(3, '0')}`;
    const committedCap = wizardForm.committed_capital || 0;
    const contributedCap =
      wizardForm.contribution_method === 'Góp một lần'
        ? committedCap
        : wizardForm.initial_contributed_capital || 0;
    const remainingCap = Math.max(0, committedCap - contributedCap);
    const capitalStat = remainingCap === 0 ? ('DU_VON' as const) : ('CHUA_DU' as const);

    const sharesCount = Math.floor(contributedCap / 100000);
    const newCapitalTotal = totalMemberCapital + contributedCap;
    const ownPct = Number(((contributedCap / (newCapitalTotal || 1)) * 100).toFixed(2));
    const fullAddr = `${wizardForm.detail_address ? wizardForm.detail_address + ', ' : ''}${wizardForm.ward}, ${wizardForm.district}, ${wizardForm.province}`;

    const newMem: Member = {
      id: `mem-00${nextMemberNumber}`,
      cooperative_id: 'coop-01',
      member_code: newCode,
      full_name: wizardForm.full_name,
      gender: wizardForm.gender,
      dob: wizardForm.dob || '1992-06-15',
      cccd: wizardForm.cccd,
      cccd_issue_date: wizardForm.cccd_issue_date || '2021-01-01',
      cccd_issue_place: wizardForm.cccd_issue_place || 'Cục Cảnh sát QLHC về trật tự xã hội',
      education_level: wizardForm.education_level,
      occupation: wizardForm.occupation || 'Nông dân',
      province: wizardForm.province,
      district: wizardForm.district,
      ward: wizardForm.ward,
      detail_address: wizardForm.detail_address,
      address: fullAddr,
      phone: wizardForm.phone,
      email: wizardForm.email,
      zalo: wizardForm.zalo,
      facebook: wizardForm.facebook,
      capital_form: wizardForm.capital_form,
      contribution_date: wizardForm.contribution_date,
      contribution_method: wizardForm.contribution_method,
      member_type: wizardForm.member_type,
      committed_capital: committedCap,
      contributed_capital: contributedCap,
      remaining_capital: remainingCap,
      commitment_deadline: wizardForm.commitment_deadline,
      total_capital_contributed: contributedCap,
      capital_in_words: wizardForm.capital_in_words,
      total_shares_held: sharesCount,
      ownership_percentage: ownPct,
      capital_status: capitalStat,
      profit_share_rate: wizardForm.profit_share_rate,
      payout_method: wizardForm.payout_method,
      bank_account: wizardForm.bank_account,
      bank_name: wizardForm.bank_name,
      account_holder: wizardForm.account_holder || wizardForm.full_name,
      notes: wizardForm.notes,
      status: 'PENDING',
      join_date: new Date().toISOString().split('T')[0],
      current_debt: 0,
      credit_limit: wizardForm.credit_limit || 15000000,
      annual_product_output_kg: 0,
      notary_document_url: wizardUploadedFile ? URL.createObjectURL(wizardUploadedFile) : undefined,
    };

    let firstTx: CapitalTransaction | undefined;
    if (contributedCap > 0) {
      firstTx = {
        id: `CC-${Math.floor(100000 + Math.random() * 900000)}`,
        member_id: newMem.id,
        member_code: newMem.member_code,
        member_name: newMem.full_name,
        transaction_code: `PT-${Math.floor(100000 + Math.random() * 900000)}`,
        amount: contributedCap,
        share_quantity: Math.floor(contributedCap / 100000),
        contribution_date: wizardForm.contribution_date,
        payment_method: wizardForm.capital_form === 'HIEN_VAT' ? 'ASSET' : 'CASH',
        receipt_number: `PT-${Math.floor(100000 + Math.random() * 900000)}`,
        content: `Góp vốn đợt 1 (Lần đầu kết nạp xã viên ${newMem.full_name})`,
        notes: wizardForm.notes || 'Góp vốn đợt 1 khi gia nhập HTX',
        status: 'APPROVED',
        recorded_by: 'Kế toán trưởng',
        recorded_date: new Date().toLocaleDateString('vi-VN'),
        receipt_file_name: wizardUploadedFile ? wizardUploadedFile.name : undefined,
        receipt_file_url: wizardUploadedFile ? URL.createObjectURL(wizardUploadedFile) : undefined,
      };
    }

    onAddMemberAndTx(newMem, firstTx);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-5xl flex flex-col max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-emerald-50">
          <div>
            <h3 className="text-lg font-black text-emerald-900">Thêm mới Xã viên</h3>
            <p className="text-xs text-emerald-700 mt-1">Hoàn thành 5 bước để tạo hồ sơ và ghi nhận vốn góp ban đầu</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-600 hover:bg-white rounded-xl transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Progress Tracker */}
        <div className="flex justify-between items-center px-8 py-4 bg-white border-b border-slate-100 relative">
          <div className="absolute top-1/2 left-10 right-10 h-1 bg-slate-100 -z-10 -translate-y-1/2 rounded-full" />

          {[1, 2, 3, 4, 5].map((step) => {
            const isActive = wizardStep === step;
            const isCompleted = step < wizardStep;

            return (
              <div
                key={step}
                className="flex flex-col items-center gap-2 cursor-pointer relative bg-white px-2 group"
                onClick={() => handleStepHeaderClick(step)}
              >
                <div
                  className={`w-9 h-9 rounded-full flex items-center justify-center font-bold text-sm transition-all shadow-sm ${
                    isActive
                      ? 'bg-emerald-600 text-white border-2 border-emerald-600 ring-4 ring-emerald-50'
                      : isCompleted
                      ? 'bg-emerald-100 text-emerald-600 border-2 border-emerald-100'
                      : 'bg-white text-slate-400 border-2 border-slate-200 group-hover:border-emerald-300'
                  }`}
                >
                  {isCompleted ? <CheckCircle2 className="w-5 h-5" /> : step}
                </div>
                <span
                  className={`text-[11px] font-bold uppercase tracking-wider ${
                    isActive
                      ? 'text-emerald-700'
                      : isCompleted
                      ? 'text-slate-700'
                      : 'text-slate-400 group-hover:text-emerald-600'
                  }`}
                >
                  {step === 1
                    ? 'Cá nhân'
                    : step === 2
                    ? 'Liên hệ'
                    : step === 3
                    ? 'Vốn góp'
                    : step === 4
                    ? 'Lợi nhuận'
                    : 'Hoàn tất'}
                </span>
              </div>
            );
          })}
        </div>

        {/* Error Message */}
        {wizardStepError && (
          <div className="mx-6 mt-4 p-3 bg-rose-50 border border-rose-100 rounded-xl flex items-center gap-2 text-rose-700 text-sm font-medium animate-shake">
            <AlertTriangle className="w-4 h-4 shrink-0" />
            {wizardStepError}
          </div>
        )}

        {/* Form Body */}
        <div className="p-6 overflow-y-auto flex-1 custom-scrollbar bg-slate-50/50">
          {wizardStep === 1 && (
            <MemberWizardStep1Personal
              formData={wizardForm}
              onChange={updateFormData}
              fieldErrors={fieldErrors}
              onClearError={clearFieldError}
            />
          )}

          {wizardStep === 2 && (
            <MemberWizardStep2Contact
              formData={wizardForm}
              onChange={updateFormData}
              fieldErrors={fieldErrors}
              onClearError={clearFieldError}
            />
          )}

          {wizardStep === 3 && (
            <MemberWizardStep3Capital
              formData={wizardForm}
              onChange={updateFormData}
              fieldErrors={fieldErrors}
              onClearError={clearFieldError}
              calculateDynamicProfitRate={calculateDynamicProfitRate}
            />
          )}

          {wizardStep === 4 && (
            <MemberWizardStep4Profit
              formData={wizardForm}
              onChange={updateFormData}
              fieldErrors={fieldErrors}
            />
          )}

          {wizardStep === 5 && (
            <MemberWizardStep5Confirm
              formData={wizardForm}
              uploadedFile={wizardUploadedFile}
              onFileSelect={setWizardUploadedFile}
            />
          )}
        </div>

        {/* Footer Action */}
        <div className="p-5 border-t border-slate-100 flex justify-between bg-white items-center">
          <button
            type="button"
            onClick={() => (wizardStep > 1 ? setWizardStep((wizardStep - 1) as any) : onClose())}
            className="px-6 py-2.5 border border-slate-200 text-slate-600 rounded-xl font-bold text-sm hover:bg-slate-50 transition-colors"
          >
            {wizardStep > 1 ? 'Quay lại bước trước' : 'Hủy bỏ'}
          </button>

          <button
            type="button"
            onClick={wizardStep < 5 ? handleNextStep : handleWizardSubmit}
            className="px-8 py-3 bg-emerald-600 text-white rounded-xl font-bold text-sm hover:bg-emerald-700 shadow-md shadow-emerald-600/20 transition-all flex items-center gap-2"
          >
            {wizardStep < 5 ? 'Tiếp tục' : 'Tạo hồ sơ Xã viên'}
            {wizardStep === 5 && <CheckCircle2 className="w-4 h-4" />}
          </button>
        </div>
      </div>
    </div>
  );
};
