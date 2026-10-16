import React, { useState, useRef, useEffect } from 'react';
import { Member, CapitalTransaction, MemberType, CapitalForm } from '@/types/memberTypes';
import { X, Upload, FileText, CheckCircle2, UserCheck, AlertTriangle, ChevronRight } from 'lucide-react';

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
  const wizardFileInputRef = useRef<HTMLInputElement>(null);
  const [wizardUploadedFile, setWizardUploadedFile] = useState<File | null>(null);

  const calculateDynamicProfitRate = (committedCap: number, initialCap: number, method: string) => {
    const actualCap = method === 'Góp một lần' ? committedCap : initialCap;
    const newTotalCoopCap = totalMemberCapital + actualCap;
    return newTotalCoopCap > 0 ? Number(((actualCap / newTotalCoopCap) * 100).toFixed(2)) : 0;
  };

  const [wizardForm, setWizardForm] = useState({
    full_name: '',
    gender: 'Nam' as 'Nam' | 'Nữ' | 'Khác',
    dob: '',
    cccd: '',
    cccd_issue_date: '',
    cccd_issue_place: '',
    education_level: 'Chưa xác định',
    occupation: '',
    province: 'Lâm Đồng',
    district: 'Huyện Lâm Hà',
    ward: 'Xã Mê Linh',
    detail_address: '',
    phone: '',
    email: '',
    zalo: '',
    facebook: '',
    capital_form: 'TIEN_MAT' as CapitalForm,
      capital_payment_method: 'CASH' as 'CASH' | 'BANK_TRANSFER',
      capital_receipt_file: null as File | null,
      committed_capital: 50000000,
    initial_contributed_capital: 10000000,
    capital_in_words: 'Năm mươi triệu đồng',
    contribution_date: new Date().toISOString().split('T')[0],
    commitment_deadline: new Date(Date.now() + 180 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    contribution_method: 'Góp một lần',
    member_type: 'CHINH_THUC' as MemberType,
    profit_share_rate: calculateDynamicProfitRate(50000000, 10000000, 'Góp một lần'),
    payout_method: 'CASH' as 'CASH' | 'BANK_TRANSFER',
    bank_name: '',
    bank_account: '',
    account_holder: '',
    credit_limit: 15000000,
    notes: '',
  });

  useEffect(() => {
    if (isOpen) {
      setWizardStep(1);
      setWizardStepError(null);
      setFieldErrors({});
      setWizardUploadedFile(null);
      setWizardForm({
        full_name: '',
        gender: 'Nam',
        dob: '',
        cccd: '',
        cccd_issue_date: '',
        cccd_issue_place: '',
        education_level: 'Chưa xác định',
        occupation: '',
        province: 'Lâm Đồng',
        district: 'Huyện Lâm Hà',
        ward: 'Xã Mê Linh',
        detail_address: '',
        phone: '',
        email: '',
        zalo: '',
        facebook: '',
        capital_form: 'TIEN_MAT',
          capital_payment_method: 'CASH' as 'CASH' | 'BANK_TRANSFER',
          capital_receipt_file: null as File | null,
          committed_capital: 50000000,
        initial_contributed_capital: 10000000,
        capital_in_words: 'Năm mươi triệu đồng',
        contribution_date: new Date().toISOString().split('T')[0],
        commitment_deadline: new Date(Date.now() + 180 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        contribution_method: 'Góp một lần',
        member_type: 'CHINH_THUC',
        profit_share_rate: calculateDynamicProfitRate(50000000, 10000000, 'Góp một lần'),
        payout_method: 'CASH',
        bank_name: '',
        bank_account: '',
        account_holder: '',
        credit_limit: 15000000,
        notes: '',
      });
    }
  }, [isOpen]);

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
      const actualContributed = wizardForm.contribution_method === 'Góp một lần' ? wizardForm.committed_capital : wizardForm.initial_contributed_capital;
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
    const newCode = `TV00${nextMemberNumber}`;
    const committedCap = wizardForm.committed_capital || 50000000;
    const contributedCap = wizardForm.contribution_method === 'Góp một lần'
      ? committedCap
      : (wizardForm.initial_contributed_capital || 10000000);
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

  const handleWizardFileDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      setWizardUploadedFile(e.dataTransfer.files[0]);
    }
  };

  const handleWizardFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setWizardUploadedFile(e.target.files[0]);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-5xl flex flex-col max-h-[90vh] overflow-hidden">
        {/* Hướng dẫn Header */}
        <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-emerald-50">
          <div>
            <h3 className="text-lg font-black text-emerald-900">Thêm mới Xã viên</h3>
            <p className="text-xs text-emerald-700 mt-1">Hoàn thành 5 bước để tạo hồ sơ và ghi nhận vốn góp ban đầu</p>
          </div>
          <button onClick={onClose} className="p-2 text-slate-400 hover:text-slate-600 hover:bg-white rounded-xl transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Progress Tracker */}
        <div className="flex justify-between items-center px-8 py-4 bg-white border-b border-slate-100 relative">
          <div className="absolute top-1/2 left-10 right-10 h-1 bg-slate-100 -z-10 -translate-y-1/2 rounded-full"></div>
          
          {[1, 2, 3, 4, 5].map((step) => {
            const isActive = wizardStep === step;
            const isCompleted = step < wizardStep;
            
            return (
              <div 
                key={step} 
                className="flex flex-col items-center gap-2 cursor-pointer relative bg-white px-2 group"
                onClick={() => handleStepHeaderClick(step)}
              >
                <div className={`w-9 h-9 rounded-full flex items-center justify-center font-bold text-sm transition-all shadow-sm ${
                  isActive ? 'bg-emerald-600 text-white border-2 border-emerald-600 ring-4 ring-emerald-50' : 
                  isCompleted ? 'bg-emerald-100 text-emerald-600 border-2 border-emerald-100' : 
                  'bg-white text-slate-400 border-2 border-slate-200 group-hover:border-emerald-300'
                }`}>
                  {isCompleted ? <CheckCircle2 className="w-5 h-5" /> : step}
                </div>
                <span className={`text-[11px] font-bold uppercase tracking-wider ${
                  isActive ? 'text-emerald-700' : 
                  isCompleted ? 'text-slate-700' : 
                  'text-slate-400 group-hover:text-emerald-600'
                }`}>
                  {step === 1 ? 'Cá nhân' : 
                   step === 2 ? 'Liên hệ' : 
                   step === 3 ? 'Vốn góp' : 
                   step === 4 ? 'Lợi nhuận' : 
                   'Hoàn tất'}
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
          
          {/* STEP 1 */}
          <div className={wizardStep === 1 ? 'block animate-fade-in' : 'hidden'}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5 bg-white p-5 rounded-xl border border-slate-100 shadow-sm">
              <div className="md:col-span-2">
                <h4 className="text-sm font-bold text-slate-800 mb-3 border-b border-slate-100 pb-2">Thông tin Cơ bản</h4>
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">Họ và tên <span className="text-rose-500">*</span></label>
                <input
                  type="text"
                  value={wizardForm.full_name}
                  onChange={(e) => {
                    setWizardForm({ ...wizardForm, full_name: e.target.value.toUpperCase() });
                    if (fieldErrors.full_name) setFieldErrors({ ...fieldErrors, full_name: '' });
                  }}
                  className={`w-full px-3.5 py-2.5 bg-slate-50 border ${fieldErrors.full_name ? 'border-rose-300 ring-2 ring-rose-100' : 'border-slate-200 focus:border-emerald-500'} rounded-lg text-sm font-bold text-slate-800 transition-colors uppercase`}
                  placeholder="NGUYỄN VĂN A"
                />
                {fieldErrors.full_name && <p className="text-[10px] text-rose-500 font-medium mt-1">{fieldErrors.full_name}</p>}
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">Giới tính <span className="text-rose-500">*</span></label>
                <select
                  value={wizardForm.gender}
                  onChange={(e) => setWizardForm({ ...wizardForm, gender: e.target.value as 'Nam' | 'Nữ' | 'Khác' })}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-700 focus:border-emerald-500"
                >
                  <option value="Nam">Nam</option>
                  <option value="Nữ">Nữ</option>
                  <option value="Khác">Khác</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">Ngày sinh <span className="text-rose-500">*</span></label>
                <input
                  type="date"
                  value={wizardForm.dob}
                  onChange={(e) => {
                    setWizardForm({ ...wizardForm, dob: e.target.value });
                    if (fieldErrors.dob) setFieldErrors({ ...fieldErrors, dob: '' });
                  }}
                  className={`w-full px-3.5 py-2.5 bg-slate-50 border ${fieldErrors.dob ? 'border-rose-300 ring-2 ring-rose-100' : 'border-slate-200 focus:border-emerald-500'} rounded-lg text-sm text-slate-700`}
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">Nghề nghiệp hiện tại</label>
                <input
                  type="text"
                  value={wizardForm.occupation}
                  onChange={(e) => setWizardForm({ ...wizardForm, occupation: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 focus:border-emerald-500 rounded-lg text-sm text-slate-700"
                  placeholder="VD: Nông dân, Kỹ sư..."
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5 bg-white p-5 rounded-xl border border-slate-100 shadow-sm mt-4">
              <div className="md:col-span-2">
                <h4 className="text-sm font-bold text-slate-800 mb-3 border-b border-slate-100 pb-2">Định danh</h4>
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">Số CCCD/CMND <span className="text-rose-500">*</span></label>
                <input
                  type="text"
                  value={wizardForm.cccd}
                  onChange={(e) => {
                    setWizardForm({ ...wizardForm, cccd: e.target.value });
                    if (fieldErrors.cccd) setFieldErrors({ ...fieldErrors, cccd: '' });
                  }}
                  maxLength={12}
                  className={`w-full px-3.5 py-2.5 bg-slate-50 border ${fieldErrors.cccd ? 'border-rose-300 ring-2 ring-rose-100' : 'border-slate-200 focus:border-emerald-500'} rounded-lg text-sm text-slate-700 font-mono`}
                  placeholder="Đúng 12 chữ số"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">Ngày cấp <span className="text-rose-500">*</span></label>
                <input
                  type="date"
                  value={wizardForm.cccd_issue_date}
                  onChange={(e) => {
                    setWizardForm({ ...wizardForm, cccd_issue_date: e.target.value });
                    if (fieldErrors.cccd_issue_date) setFieldErrors({ ...fieldErrors, cccd_issue_date: '' });
                  }}
                  className={`w-full px-3.5 py-2.5 bg-slate-50 border ${fieldErrors.cccd_issue_date ? 'border-rose-300 ring-2 ring-rose-100' : 'border-slate-200 focus:border-emerald-500'} rounded-lg text-sm text-slate-700`}
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-xs font-bold text-slate-700 mb-1.5">Nơi cấp <span className="text-rose-500">*</span></label>
                <input
                  type="text"
                  value={wizardForm.cccd_issue_place}
                  onChange={(e) => {
                    setWizardForm({ ...wizardForm, cccd_issue_place: e.target.value });
                    if (fieldErrors.cccd_issue_place) setFieldErrors({ ...fieldErrors, cccd_issue_place: '' });
                  }}
                  className={`w-full px-3.5 py-2.5 bg-slate-50 border ${fieldErrors.cccd_issue_place ? 'border-rose-300 ring-2 ring-rose-100' : 'border-slate-200 focus:border-emerald-500'} rounded-lg text-sm text-slate-700`}
                  placeholder="VD: Cục Cảnh sát QLHC về trật tự xã hội"
                />
              </div>
            </div>
          </div>

          {/* STEP 2 */}
          <div className={wizardStep === 2 ? 'block animate-fade-in' : 'hidden'}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5 bg-white p-5 rounded-xl border border-slate-100 shadow-sm">
              <div className="md:col-span-2">
                <h4 className="text-sm font-bold text-slate-800 mb-3 border-b border-slate-100 pb-2">Địa chỉ</h4>
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">Tỉnh/Thành phố</label>
                <select
                  value={wizardForm.province}
                  onChange={(e) => setWizardForm({ ...wizardForm, province: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 focus:border-emerald-500 rounded-lg text-sm text-slate-700"
                >
                  <option value="Lâm Đồng">Lâm Đồng</option>
                  <option value="Khác">Khác</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">Quận/Huyện</label>
                <select
                  value={wizardForm.district}
                  onChange={(e) => setWizardForm({ ...wizardForm, district: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 focus:border-emerald-500 rounded-lg text-sm text-slate-700"
                >
                  <option value="Huyện Lâm Hà">Huyện Lâm Hà</option>
                  <option value="Đà Lạt">Đà Lạt</option>
                  <option value="Bảo Lộc">Bảo Lộc</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">Phường/Xã</label>
                <select
                  value={wizardForm.ward}
                  onChange={(e) => setWizardForm({ ...wizardForm, ward: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 focus:border-emerald-500 rounded-lg text-sm text-slate-700"
                >
                  <option value="Xã Mê Linh">Xã Mê Linh</option>
                  <option value="Thị trấn Đinh Văn">Thị trấn Đinh Văn</option>
                  <option value="Xã Đông Thanh">Xã Đông Thanh</option>
                </select>
              </div>

              <div className="md:col-span-2">
                <label className="block text-xs font-bold text-slate-700 mb-1.5">Địa chỉ chi tiết (Thôn/Số nhà) <span className="text-rose-500">*</span></label>
                <input
                  type="text"
                  value={wizardForm.detail_address}
                  onChange={(e) => {
                    setWizardForm({ ...wizardForm, detail_address: e.target.value });
                    if (fieldErrors.detail_address) setFieldErrors({ ...fieldErrors, detail_address: '' });
                  }}
                  className={`w-full px-3.5 py-2.5 bg-slate-50 border ${fieldErrors.detail_address ? 'border-rose-300 ring-2 ring-rose-100' : 'border-slate-200 focus:border-emerald-500'} rounded-lg text-sm text-slate-700`}
                  placeholder="VD: Thôn 2, Xã Mê Linh..."
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5 bg-white p-5 rounded-xl border border-slate-100 shadow-sm mt-4">
              <div className="md:col-span-2">
                <h4 className="text-sm font-bold text-slate-800 mb-3 border-b border-slate-100 pb-2">Liên lạc trực tuyến</h4>
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">Số điện thoại <span className="text-rose-500">*</span></label>
                <input
                  type="tel"
                  value={wizardForm.phone}
                  onChange={(e) => {
                    setWizardForm({ ...wizardForm, phone: e.target.value });
                    if (fieldErrors.phone) setFieldErrors({ ...fieldErrors, phone: '' });
                  }}
                  className={`w-full px-3.5 py-2.5 bg-slate-50 border ${fieldErrors.phone ? 'border-rose-300 ring-2 ring-rose-100' : 'border-slate-200 focus:border-emerald-500'} rounded-lg text-sm text-slate-700 font-mono`}
                  placeholder="10 chữ số"
                />
              </div>
              
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">Email (Tùy chọn)</label>
                <input
                  type="email"
                  value={wizardForm.email}
                  onChange={(e) => setWizardForm({ ...wizardForm, email: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 focus:border-emerald-500 rounded-lg text-sm text-slate-700"
                  placeholder="email@example.com"
                />
              </div>
              
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">Zalo (Tùy chọn)</label>
                <input
                  type="text"
                  value={wizardForm.zalo}
                  onChange={(e) => setWizardForm({ ...wizardForm, zalo: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 focus:border-emerald-500 rounded-lg text-sm text-slate-700"
                  placeholder="Số ĐT Zalo"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">Facebook (Tùy chọn)</label>
                <input
                  type="text"
                  value={wizardForm.facebook}
                  onChange={(e) => setWizardForm({ ...wizardForm, facebook: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 focus:border-emerald-500 rounded-lg text-sm text-slate-700"
                  placeholder="Link hoặc Tên FB"
                />
              </div>
            </div>
          </div>

          {/* STEP 3 */}
          <div className={wizardStep === 3 ? 'block animate-fade-in' : 'hidden'}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5 bg-white p-5 rounded-xl border border-slate-100 shadow-sm">
               <div className="md:col-span-2">
                <h4 className="text-sm font-bold text-slate-800 mb-3 border-b border-slate-100 pb-2">Vốn góp & Loại Thành viên</h4>
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">Phân loại thành viên</label>
                <select
                  value={wizardForm.member_type}
                  onChange={(e) => setWizardForm({ ...wizardForm, member_type: e.target.value as MemberType })}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 focus:border-emerald-500 rounded-lg text-sm text-slate-700 font-semibold"
                >
                  <option value="CHINH_THUC">Chính thức (Bắt buộc dùng DV HTX)</option>
                  <option value="LIEN_KET_GOP_VON">Liên kết góp vốn</option>
                  <option value="LIEN_KET_KHONG_GOP_VON">Liên kết không góp vốn</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">Hình thức nộp vốn</label>
                <select
                  value={wizardForm.capital_form}
                  onChange={(e) => setWizardForm({ ...wizardForm, capital_form: e.target.value as CapitalForm })}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 focus:border-emerald-500 rounded-lg text-sm text-slate-700"
                >
                  <option value="TIEN_MAT">Bằng tiền</option>
                  <option value="HIEN_VAT">Hiện vật / Quyền sử dụng đất</option>
                </select>
              </div>

              {wizardForm.capital_form === 'TIEN_MAT' && (
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">Phương thức thanh toán</label>
                  <select
                    value={wizardForm.capital_payment_method}
                    onChange={(e) => setWizardForm({ ...wizardForm, capital_payment_method: e.target.value as 'CASH' | 'BANK_TRANSFER' })}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 focus:border-emerald-500 rounded-lg text-sm text-slate-700"
                  >
                    <option value="CASH">Tiền mặt</option>
                    <option value="BANK_TRANSFER">Chuyển khoản</option>
                  </select>
                </div>
              )}

              {wizardForm.capital_form === 'TIEN_MAT' && wizardForm.capital_payment_method === 'BANK_TRANSFER' && (
                <div className="md:col-span-2">
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">Ảnh chứng từ / Biên lai chuyển khoản</label>
                  <div className="flex items-center gap-3">
                    <label className="px-4 py-2 bg-white border border-slate-300 rounded-lg text-sm font-medium text-slate-700 cursor-pointer hover:bg-slate-50 flex items-center gap-2">
                      <Upload className="w-4 h-4" />
                      Tải lên chứng từ
                      <input 
                        type="file" 
                        accept="image/*,.pdf" 
                        className="hidden" 
                        onChange={(e) => {
                          if (e.target.files && e.target.files[0]) {
                            setWizardForm({ ...wizardForm, capital_receipt_file: e.target.files[0] });
                          }
                        }}
                      />
                    </label>
                    {wizardForm.capital_receipt_file && (
                      <span className="text-sm text-slate-600 flex items-center gap-1">
                        <FileText className="w-4 h-4 text-emerald-600" /> 
                        {wizardForm.capital_receipt_file.name}
                      </span>
                    )}
                  </div>
                </div>
              )}

              {wizardForm.member_type !== 'LIEN_KET_KHONG_GOP_VON' && (
                <>
                  <div className="md:col-span-2 mt-2">
                    <label className="block text-xs font-bold text-slate-700 mb-1.5">Phương thức đóng vốn</label>
                    <div className="flex gap-4 bg-slate-50 p-3 rounded-lg border border-slate-100">
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="radio"
                          name="contribution_method"
                          value="Góp một lần"
                          checked={wizardForm.contribution_method === 'Góp một lần'}
                          onChange={(e) => setWizardForm({ ...wizardForm, contribution_method: e.target.value })}
                          className="w-4 h-4 text-emerald-600 focus:ring-emerald-500"
                        />
                        <span className="text-sm text-slate-700 font-medium">Đóng 1 lần (Đủ vốn cam kết)</span>
                      </label>
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="radio"
                          name="contribution_method"
                          value="Góp nhiều lần"
                          checked={wizardForm.contribution_method === 'Góp nhiều lần'}
                          onChange={(e) => setWizardForm({ ...wizardForm, contribution_method: e.target.value })}
                          className="w-4 h-4 text-emerald-600 focus:ring-emerald-500"
                        />
                        <span className="text-sm text-slate-700 font-medium">Đóng nhiều đợt (Luật HTX: Tối đa 6 tháng)</span>
                      </label>
                    </div>
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-xs font-bold text-slate-700 mb-1.5">Tổng Vốn Cam Kết (VNĐ) <span className="text-rose-500">*</span></label>
                    <input
                      type="number"
                      value={wizardForm.committed_capital}
                      onChange={(e) => {
                        const val = parseInt(e.target.value) || 0;
                        setWizardForm({ 
                          ...wizardForm, 
                          committed_capital: val,
                          profit_share_rate: calculateDynamicProfitRate(val, wizardForm.initial_contributed_capital, wizardForm.contribution_method)
                        });
                        if (fieldErrors.committed_capital) setFieldErrors({ ...fieldErrors, committed_capital: '' });
                      }}
                      className="w-full px-3.5 py-3 bg-slate-50 border border-slate-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100 rounded-lg text-lg text-slate-900 font-black transition-all"
                    />
                    <div className="text-[11px] text-slate-500 mt-2 italic flex items-center gap-1">
                      <AlertTriangle className="w-3.5 h-3.5 text-amber-500" />
                      Mức tối thiểu: 10.000.000 ₫ (Theo Điều lệ). Tối đa: 30% vốn điều lệ đối với thành viên chính thức.
                    </div>
                  </div>

                  {wizardForm.contribution_method === 'Góp nhiều lần' && (
                    <div className="md:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-5 p-4 bg-amber-50/50 rounded-xl border border-amber-200 shadow-sm">
                      <div>
                        <label className="block text-[11px] font-bold text-amber-900 mb-1.5">Số tiền thực góp đợt 1 (VNĐ)</label>
                        <input
                          type="number"
                          value={wizardForm.initial_contributed_capital}
                          onChange={(e) => {
                            const val = parseInt(e.target.value) || 0;
                            setWizardForm({ 
                              ...wizardForm, 
                              initial_contributed_capital: val,
                              profit_share_rate: calculateDynamicProfitRate(wizardForm.committed_capital, val, wizardForm.contribution_method)
                            });
                          }}
                          className="w-full px-3.5 py-2.5 bg-white border border-amber-300 focus:border-amber-500 focus:ring-2 focus:ring-amber-100 rounded-lg text-sm font-bold text-amber-900 transition-all"
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] font-bold text-amber-900 mb-1.5">Ngày hạn chót nộp đủ vốn</label>
                        <input
                          type="date"
                          value={wizardForm.commitment_deadline}
                          onChange={(e) => setWizardForm({ ...wizardForm, commitment_deadline: e.target.value })}
                          className="w-full px-3.5 py-2.5 bg-white border border-amber-300 focus:border-amber-500 focus:ring-2 focus:ring-amber-100 rounded-lg text-sm text-amber-900 transition-all"
                        />
                      </div>
                    </div>
                  )}

                  <div className="md:col-span-2">
                    <label className="block text-xs font-bold text-slate-700 mb-1.5">Ngày ghi nhận góp vốn <span className="text-rose-500">*</span></label>
                    <input
                      type="date"
                      value={wizardForm.contribution_date}
                      onChange={(e) => {
                        setWizardForm({ ...wizardForm, contribution_date: e.target.value });
                        if (fieldErrors.contribution_date) setFieldErrors({ ...fieldErrors, contribution_date: '' });
                      }}
                      className="w-full md:w-1/2 px-3.5 py-2.5 bg-slate-50 border border-slate-200 focus:border-emerald-500 rounded-lg text-sm text-slate-700"
                    />
                  </div>
                </>
              )}
            </div>
          </div>

          {/* STEP 4 */}
          <div className={wizardStep === 4 ? 'block animate-fade-in' : 'hidden'}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5 bg-white p-5 rounded-xl border border-slate-100 shadow-sm">
               <div className="md:col-span-2">
                <h4 className="text-sm font-bold text-slate-800 mb-3 border-b border-slate-100 pb-2">Ngân hàng & Lợi nhuận</h4>
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">Hình thức nhận chi trả</label>
                <select
                  value={wizardForm.payout_method}
                  onChange={(e) => setWizardForm({ ...wizardForm, payout_method: e.target.value as 'CASH' | 'BANK_TRANSFER' })}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 focus:border-emerald-500 rounded-lg text-sm font-semibold text-emerald-700"
                >
                  <option value="BANK_TRANSFER">Chuyển khoản ngân hàng</option>
                  <option value="CASH">Tiền mặt tại HTX</option>
                </select>
              </div>

              {wizardForm.payout_method === 'BANK_TRANSFER' && (
                <>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1.5">Ngân hàng thụ hưởng</label>
                    <input
                      type="text"
                      value={wizardForm.bank_name}
                      onChange={(e) => setWizardForm({ ...wizardForm, bank_name: e.target.value })}
                      className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 focus:border-emerald-500 rounded-lg text-sm text-slate-700"
                      placeholder="VD: Agribank chi nhánh Lâm Hà"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1.5">Số tài khoản</label>
                    <input
                      type="text"
                      value={wizardForm.bank_account}
                      onChange={(e) => setWizardForm({ ...wizardForm, bank_account: e.target.value })}
                      className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 focus:border-emerald-500 rounded-lg text-sm text-slate-700 font-mono font-bold"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1.5">Tên chủ tài khoản</label>
                    <input
                      type="text"
                      value={wizardForm.account_holder}
                      onChange={(e) => setWizardForm({ ...wizardForm, account_holder: e.target.value.toUpperCase() })}
                      className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 focus:border-emerald-500 rounded-lg text-sm text-slate-700 uppercase"
                      placeholder="NGUYEN VAN A"
                    />
                  </div>
                </>
              )}

              <div className="md:col-span-2">
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  Hạn mức nợ vật tư trả chậm cho phép (VNĐ)
                </label>
                <input
                  type="number"
                  step="1000000"
                  value={wizardForm.credit_limit}
                  onChange={(e) => setWizardForm({ ...wizardForm, credit_limit: parseInt(e.target.value) || 0 })}
                  className="w-full md:w-1/2 px-3.5 py-2.5 bg-slate-50 border border-slate-200 focus:border-emerald-500 rounded-lg text-sm font-black text-emerald-800"
                />
                <p className="text-[11px] text-slate-400 mt-1">
                  Mặc định 15.000.000 ₫ (Theo Luật HTX 2023). Thủ kho sẽ cảnh báo và chặn xuất kho ứng trước nếu dư nợ hiện tại vượt quá hạn mức này.
                </p>
              </div>

              <div className="md:col-span-2 mt-4 p-5 bg-gradient-to-br from-emerald-50 to-teal-50 rounded-xl border border-emerald-100 flex items-start gap-3 shadow-sm">
                <AlertTriangle className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                <div>
                  <h4 className="text-[13px] font-bold text-emerald-900 mb-2">Tỷ lệ phân chia lợi nhuận ước tính (Theo % vốn góp)</h4>
                  <div className="flex items-end gap-2">
                    <input
                      type="number"
                      step="0.01"
                      value={wizardForm.profit_share_rate}
                      onChange={(e) => setWizardForm({ ...wizardForm, profit_share_rate: parseFloat(e.target.value) || 0 })}
                      className="w-32 px-3 py-2 bg-white border border-emerald-300 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100 rounded-lg text-lg font-black text-emerald-700 transition-all"
                    />
                    <span className="text-emerald-700 font-bold mb-2">%</span>
                  </div>
                  <p className="text-[11.5px] text-emerald-800/80 mt-2 leading-relaxed">
                    Hệ thống tự động tính tỷ lệ này dựa trên tổng vốn hiện tại của HTX. Tuy nhiên, theo Luật HTX 2023, phân chia thặng dư sẽ bao gồm <strong>Chia theo vốn góp</strong> và <strong>Chia theo mức độ sử dụng dịch vụ nội bộ</strong>.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* STEP 5 */}
          <div className={wizardStep === 5 ? 'block animate-fade-in' : 'hidden'}>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
              <div className="bg-white p-5 rounded-xl border border-slate-100 shadow-sm">
                <h4 className="text-sm font-bold text-slate-800 mb-4 flex items-center gap-2">
                  <FileText className="w-4 h-4 text-emerald-600" /> Hồ sơ đính kèm (Tùy chọn)
                </h4>
                
                <div 
                  className="border-2 border-dashed border-slate-300 rounded-xl p-8 text-center bg-slate-50 hover:bg-slate-100 hover:border-emerald-400 transition-all cursor-pointer group"
                  onDragOver={(e) => e.preventDefault()}
                  onDrop={handleWizardFileDrop}
                  onClick={() => wizardFileInputRef.current?.click()}
                >
                  <input 
                    type="file" 
                    ref={wizardFileInputRef} 
                    className="hidden" 
                    onChange={handleWizardFileSelect}
                    accept=".pdf,.jpg,.jpeg,.png"
                  />
                  {wizardUploadedFile ? (
                    <div className="flex flex-col items-center animate-fade-in">
                      <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mb-3">
                        <CheckCircle2 className="w-8 h-8 text-emerald-600" />
                      </div>
                      <p className="text-sm font-bold text-slate-800">{wizardUploadedFile.name}</p>
                      <p className="text-[11px] font-medium text-slate-500 mt-1">{(wizardUploadedFile.size / 1024 / 1024).toFixed(2)} MB</p>
                      <button 
                        onClick={(e) => { e.stopPropagation(); setWizardUploadedFile(null); }}
                        className="mt-4 px-4 py-1.5 bg-rose-50 text-rose-600 rounded-lg text-xs font-bold hover:bg-rose-100 transition-colors"
                      >
                        Xóa file
                      </button>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center">
                      <div className="w-14 h-14 bg-white rounded-full shadow-sm flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                        <Upload className="w-6 h-6 text-slate-400 group-hover:text-emerald-500 transition-colors" />
                      </div>
                      <p className="text-sm font-semibold text-slate-700">Kéo thả Đơn xin gia nhập vào đây</p>
                      <p className="text-xs text-slate-400 mt-1">Hỗ trợ PDF, JPG, PNG (Tối đa 5MB)</p>
                      <button className="mt-4 px-4 py-2 border border-slate-200 bg-white rounded-lg text-xs font-bold text-slate-700 shadow-sm hover:border-emerald-300 transition-colors">
                        Hoặc chọn file từ máy
                      </button>
                    </div>
                  )}
                </div>
              </div>

              <div className="bg-slate-900 p-6 rounded-xl shadow-lg text-white relative overflow-hidden">
                {/* Decorative background circle */}
                <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/10 rounded-full blur-2xl translate-x-10 -translate-y-10"></div>
                
                <h4 className="text-sm font-bold text-emerald-400 mb-4 flex items-center gap-2 border-b border-slate-700/60 pb-3 relative z-10">
                  <UserCheck className="w-4 h-4" /> Tổng kết Hồ sơ
                </h4>
                
                <div className="space-y-5 relative z-10">
                  <div>
                    <p className="text-[11px] uppercase tracking-wider font-bold text-slate-400 mb-1">Xã viên</p>
                    <p className="text-xl font-black text-white">{wizardForm.full_name || 'CHƯA NHẬP TÊN'}</p>
                    <p className="text-sm text-slate-300 font-mono mt-1">{wizardForm.cccd || '---'}</p>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-[11px] uppercase tracking-wider font-bold text-slate-400 mb-1">Số điện thoại</p>
                      <p className="text-sm font-bold text-white">{wizardForm.phone || '---'}</p>
                    </div>
                    <div>
                      <p className="text-[11px] uppercase tracking-wider font-bold text-slate-400 mb-1">Loại thành viên</p>
                      <p className="text-sm font-bold text-emerald-400">
                        {wizardForm.member_type === 'CHINH_THUC' ? 'Chính thức' : wizardForm.member_type === 'LIEN_KET_GOP_VON' ? 'Liên kết (Có vốn)' : 'Liên kết (Không vốn)'}
                      </p>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4 mt-2">
                    <div>
                      <p className="text-[11px] uppercase tracking-wider font-bold text-slate-400 mb-1">Địa chỉ</p>
                      <p className="text-sm font-bold text-white">{wizardForm.detail_address}, {wizardForm.ward}, {wizardForm.district}, {wizardForm.province}</p>
                    </div>
                    <div>
                      <p className="text-[11px] uppercase tracking-wider font-bold text-slate-400 mb-1">Hình thức / PTTT</p>
                      <p className="text-sm font-bold text-white">
                        {wizardForm.capital_form === 'TIEN_MAT' ? 'Tiền mặt' : 'Hiện vật'} / 
                        {wizardForm.capital_payment_method === 'CASH' ? ' TM' : ' CK'}
                      </p>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4 mt-2">
                    <div>
                      <p className="text-[11px] uppercase tracking-wider font-bold text-slate-400 mb-1">Tài khoản nhận lợi nhuận</p>
                      <p className="text-sm font-bold text-white">{wizardForm.bank_account || '---'}</p>
                    </div>
                    <div>
                      <p className="text-[11px] uppercase tracking-wider font-bold text-slate-400 mb-1">Ngân hàng</p>
                      <p className="text-sm font-bold text-white">{wizardForm.bank_name || '---'}</p>
                    </div>
                  </div>

                  <div className="pt-4 border-t border-slate-700/60">
                    <div className="flex justify-between items-end mb-1.5">
                      <p className="text-[11px] uppercase tracking-wider font-bold text-slate-400">Vốn thực góp (Đợt 1)</p>
                      <p className="text-xl font-black text-emerald-400">
                        {wizardForm.contribution_method === 'Góp một lần' 
                          ? (wizardForm.committed_capital || 0).toLocaleString('vi-VN') 
                          : (wizardForm.initial_contributed_capital || 0).toLocaleString('vi-VN')} ₫
                      </p>
                    </div>
                    {wizardForm.contribution_method === 'Góp nhiều lần' && (
                      <div className="flex justify-between items-end">
                        <p className="text-[11px] uppercase tracking-wider font-bold text-slate-400">Vốn cam kết</p>
                        <p className="text-sm font-bold text-amber-400">
                          {(wizardForm.committed_capital || 0).toLocaleString('vi-VN')} ₫
                        </p>
                      </div>
                    )}
                  </div>
                  
                  <div className="bg-rose-500/10 border border-rose-500/20 p-3.5 rounded-xl mt-4">
                    <p className="text-[11.5px] text-rose-200 leading-relaxed">
                      <strong>Lưu ý:</strong> Sau khi tạo, xã viên sẽ ở trạng thái <span className="font-bold text-rose-300 text-[10px] uppercase bg-rose-900/40 px-1.5 py-0.5 rounded ml-1">CHỜ DUYỆT</span>. Cần phải thông qua HĐQT phê duyệt để chính thức trở thành thành viên.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Form Footer Action */}
        <div className="p-5 border-t border-slate-100 flex justify-between bg-white items-center">
          <button
            type="button"
            onClick={() => wizardStep > 1 ? setWizardStep((wizardStep - 1) as any) : onClose()}
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
