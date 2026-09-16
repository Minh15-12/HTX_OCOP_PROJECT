import React, { useState, useRef } from 'react';
import {
  Users,
  Search,
  Plus,
  Eye,
  Pencil,
  Trash2,
  Wallet,
  Building,
  Phone,
  Mail,
  MapPin,
  X,
  CreditCard,
  Calculator,
  ShieldCheck,
  TrendingUp,
  FileSpreadsheet,
  CheckCircle2,
  AlertCircle,
  ArrowRight,
  ArrowLeft,
  Upload,
  Calendar,
  UserCheck,
  AlertTriangle,
  UserX,
  RefreshCw,
  ExternalLink,
  Save,
  Download,
  Printer,
  RotateCcw,
  FileText,
  PieChart,
  BarChart3,
  Filter,
  ChevronRight,
  Check,
  MoreVertical,
  Layers,
  Award,
} from 'lucide-react';
import {
  mockMembersList,
  mockCapitalTransactions,
  mockSurplusPlan,
  mockSurplusItems,
  getMembersFromApi,
  createMemberApi,
  approveMemberApi,
} from '@/services/memberService';
import { updateMemberInStorage } from '@/services/dbStorage';
import {
  Member,
  CapitalTransaction,
  SurplusDistributionPlan,
  SurplusDistributionItem,
  MEMBER_TYPE_LABELS,
  MemberType,
  MemberStatus,
} from '@/types/memberTypes';

export const MembersPage: React.FC = () => {
  const [members, setMembers] = React.useState<Member[]>(mockMembersList);
  const [loadingMembers, setLoadingMembers] = React.useState<boolean>(false);
  const [transactions, setTransactions] = useState<CapitalTransaction[]>(mockCapitalTransactions);
  const [surplusPlan, setSurplusPlan] = useState<SurplusDistributionPlan>(mockSurplusPlan);
  const [surplusItems, setSurplusItems] = useState<SurplusDistributionItem[]>(mockSurplusItems);

  React.useEffect(() => {
    let isMounted = true;
    setLoadingMembers(true);
    getMembersFromApi()
      .then((data) => {
        if (isMounted && data && data.length > 0) {
          setMembers(data);
        }
      })
      .catch((err) => console.warn('Fetch members error:', err))
      .finally(() => {
        if (isMounted) setLoadingMembers(false);
      });

    return () => {
      isMounted = false;
    };
  }, []);

  // Tab State
  const [activeTab, setActiveTab] = useState<'members' | 'capital' | 'profit' | 'coop'>('members');

  // Search & Filter State
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState<string>('ALL');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [capitalStatusFilter, setCapitalStatusFilter] = useState<string>('ALL');
  const [profitStatusFilter, setProfitStatusFilter] = useState<string>('ALL');
  const [payoutMethodFilter, setPayoutMethodFilter] = useState<string>('ALL');

  // Selected Row for Drawer State
  const [selectedMember, setSelectedMember] = useState<Member | null>(null);
  const [selectedCapitalMember, setSelectedCapitalMember] = useState<Member | null>(null);
  const [selectedSurplusItem, setSelectedSurplusItem] = useState<SurplusDistributionItem | null>(null);

  // Toast State
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'danger' | 'warning' | 'info' } | null>(null);

  const triggerToast = (message: string, type: 'success' | 'danger' | 'warning' | 'info' = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3500);
  };

  // Modals & Wizard state
  const [showWizardModal, setShowWizardModal] = useState(false);
  const [wizardStep, setWizardStep] = useState<1 | 2 | 3 | 4 | 5>(1);
  const [showRecordCapitalModal, setShowRecordCapitalModal] = useState(false);
  const [showCreateProfitModal, setShowCreateProfitModal] = useState(false);

  // Edit & Delete Member Modal state
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingMember, setEditingMember] = useState<Member | null>(null);
  const [editTab, setEditTab] = useState<'personal' | 'contact' | 'capital' | 'profit'>('personal');

  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deletingMember, setDeletingMember] = useState<Member | null>(null);

  // Approve Member Modal state
  const [showApproveModal, setShowApproveModal] = useState(false);
  const [approvingMember, setApprovingMember] = useState<Member | null>(null);

  // Pending Capital Transactions Modal State
  const [showPendingCapitalModal, setShowPendingCapitalModal] = useState(false);

  // Capital Form State (Ghi nhận góp vốn)
  const [capitalForm, setCapitalForm] = useState({
    member_id: members[0]?.id || '',
    amount: 10000000,
    contribution_date: new Date().toISOString().split('T')[0],
    payment_method: 'CASH' as 'CASH' | 'BANK_TRANSFER',
    receipt_number: 'PT000126',
    content: 'Góp vốn đợt bổ sung',
    notes: '',
    fileName: '',
  });

  // Profit Plan Form State (Cập nhật thông tin kỳ phân chia)
  const [profitPlanForm, setProfitPlanForm] = useState({
    fiscal_year: surplusPlan.fiscal_year,
    total_net_profit: surplusPlan.total_net_profit,
    reserve_fund_rate: surplusPlan.reserve_fund_rate,
    member_share_rate: surplusPlan.member_share_rate,
    welfare_fund_rate: surplusPlan.welfare_fund_rate,
    planned_payout_date: surplusPlan.planned_payout_date,
    notes: surplusPlan.notes,
  });

  // Wizard Form State (5-Step Add Member)
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
    capital_form: 'TIEN_MAT' as 'TIEN_MAT' | 'HIEN_VAT',
    committed_capital: 50000000,
    initial_contributed_capital: 10000000,
    capital_in_words: 'Năm mươi triệu đồng',
    contribution_date: new Date().toISOString().split('T')[0],
    commitment_deadline: new Date(Date.now() + 180 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    contribution_method: 'Góp một lần',
    member_type: 'CHINH_THUC' as MemberType,
    profit_share_rate: 2.85,
    payout_method: 'CASH' as 'CASH' | 'BANK_TRANSFER',
    notes: '',
  });

  // Drawer Sub-tab state inside Capital Detail Drawer
  const [capitalDrawerTab, setCapitalDrawerTab] = useState<'history' | 'docs' | 'info'>('history');

  // Calculations for Member Management Tab KPIs
  const totalMembersCount = members.length;
  const officialMembersCount = members.filter((m) => m.member_type === 'CHINH_THUC').length;
  const associatedMembersCount = members.filter((m) => m.member_type !== 'CHINH_THUC').length;
  const pendingMembersCount = members.filter((m) => m.status === 'PENDING').length;
  const activeMembersCount = members.filter((m) => m.status === 'ACTIVE').length;
  const totalMemberCapital = members.reduce((sum, m) => sum + (m.total_capital_contributed || m.contributed_capital || 0), 0);

  // Calculations for Capital Tab KPIs
  const totalCommittedCapital = members.reduce((sum, m) => sum + (m.committed_capital || 0), 0);
  const totalContributedCapital = members.reduce((sum, m) => sum + (m.contributed_capital || 0), 0);
  const totalRemainingCapital = totalCommittedCapital - totalContributedCapital;
  const overallCapitalPct = Number(((totalContributedCapital / totalCommittedCapital) * 100).toFixed(2));
  const fullCapitalCount = members.filter((m) => m.capital_status === 'DU_VON').length;
  const partialCapitalCount = members.filter((m) => m.capital_status === 'CHUA_DU').length;

  // Calculations for Profit Tab KPIs
  const distributedProfitAmount = surplusItems
    .filter((i) => i.payout_status === 'DA_NHAN')
    .reduce((sum, i) => sum + i.total_payout_amount, 0);
  const remainingProfitAmount = surplusPlan.total_net_profit - distributedProfitAmount;
  const distributedProfitPct = Math.round((distributedProfitAmount / surplusPlan.total_net_profit) * 100);
  const paidMemberCount = surplusItems.filter((i) => i.payout_status === 'DA_NHAN').length;
  const unpaidMemberCount = surplusItems.filter((i) => i.payout_status === 'CHUA_NHAN').length;

  // File Upload State for Wizard Step 3
  const wizardFileInputRef = useRef<HTMLInputElement>(null);
  const [wizardUploadedFile, setWizardUploadedFile] = useState<File | null>(null);

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

  // File Preview Modal State
  const [previewFileModal, setPreviewFileModal] = useState<{
    name: string;
    size?: number | string;
    type?: string;
    url: string;
  } | null>(null);

  const handlePreviewWizardFile = (fileObj?: File | null, existingUrl?: string, name?: string) => {
    if (fileObj) {
      const url = URL.createObjectURL(fileObj);
      setPreviewFileModal({
        name: fileObj.name,
        size: fileObj.size,
        type: fileObj.type || (fileObj.name.toLowerCase().endsWith('.pdf') ? 'application/pdf' : 'image/jpeg'),
        url,
      });
    } else if (existingUrl) {
      setPreviewFileModal({
        name: name || 'Giấy chứng từ đính kèm',
        url: existingUrl,
        type: existingUrl.toLowerCase().endsWith('.pdf') || name?.toLowerCase().endsWith('.pdf') ? 'application/pdf' : 'image/jpeg',
      });
    }
  };

  // Edit Member Validation State
  const [editError, setEditError] = useState<string | null>(null);
  const [editFieldErrors, setEditFieldErrors] = useState<Record<string, string>>({});

  const validateEditMember = (m: Member): boolean => {
    const errors: Record<string, string> = {};
    let mainMsg: string | null = null;

    if (!m.full_name.trim()) {
      errors.full_name = 'Vui lòng nhập Họ và tên xã viên';
    }
    if (!m.dob) {
      errors.dob = 'Vui lòng chọn Ngày sinh';
    }
    if (!m.cccd.trim()) {
      errors.cccd = 'Vui lòng nhập Số CCCD (12 chữ số)';
    } else if (!/^[0-9]{12}$/.test(m.cccd.trim())) {
      errors.cccd = 'Số CCCD phải bao gồm đúng 12 chữ số (Ví dụ: 049085001234)';
    }
    if (!m.cccd_issue_date) {
      errors.cccd_issue_date = 'Vui lòng chọn Ngày cấp';
    }
    if (!m.cccd_issue_place.trim()) {
      errors.cccd_issue_place = 'Vui lòng nhập Nơi cấp CCCD';
    }
    if (!m.detail_address.trim()) {
      errors.detail_address = 'Vui lòng nhập Địa chỉ chi tiết (số nhà, thôn/xóm)';
    }
    if (!m.phone.trim()) {
      errors.phone = 'Vui lòng nhập Số điện thoại liên hệ';
    } else if (!/^0[0-9]{9}$/.test(m.phone.trim()) && !/^[0-9]{10}$/.test(m.phone.trim())) {
      errors.phone = 'Số điện thoại phải bao gồm đúng 10 chữ số (Ví dụ: 0987654321)';
    }

    if (Object.keys(errors).length > 0) {
      if (errors.phone) {
        mainMsg = errors.phone;
      } else if (errors.cccd) {
        mainMsg = errors.cccd;
      } else if (errors.full_name) {
        mainMsg = 'Vui lòng nhập Họ và tên xã viên!';
      } else if (errors.cccd_issue_place) {
        mainMsg = 'Vui lòng nhập Nơi cấp CCCD!';
      } else if (errors.detail_address) {
        mainMsg = 'Vui lòng nhập Địa chỉ chi tiết!';
      } else {
        mainMsg = 'Vui lòng kiểm tra và sửa lại các thông tin bắt buộc bị sai phạm trước khi lưu!';
      }
    }

    setEditFieldErrors(errors);
    setEditError(mainMsg);
    return Object.keys(errors).length === 0;
  };

  // Wizard Validation State
  const [wizardStepError, setWizardStepError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  const openAddMemberModal = () => {
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
      committed_capital: 50000000,
      initial_contributed_capital: 10000000,
      capital_in_words: 'Năm mươi triệu đồng',
      contribution_date: new Date().toISOString().split('T')[0],
      commitment_deadline: new Date(Date.now() + 180 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      contribution_method: 'Góp một lần',
      member_type: 'CHINH_THUC',
      profit_share_rate: 2.85,
      payout_method: 'CASH',
      notes: '',
    });
    setShowWizardModal(true);
  };

  const validateWizardStep = (step: number): boolean => {
    const errors: Record<string, string> = {};
    let mainMsg: string | null = null;

    if (step === 1) {
      if (!wizardForm.full_name.trim()) {
        errors.full_name = 'Vui lòng nhập Họ và tên xã viên';
      }
      if (!wizardForm.dob) {
        errors.dob = 'Vui lòng chọn Ngày sinh';
      }
      if (!wizardForm.cccd.trim()) {
        errors.cccd = 'Vui lòng nhập Số CCCD (12 chữ số)';
      } else if (!/^[0-9]{12}$/.test(wizardForm.cccd.trim())) {
        errors.cccd = 'Số CCCD phải bao gồm đúng 12 chữ số (Ví dụ: 049085001234)';
      }
      if (!wizardForm.cccd_issue_date) {
        errors.cccd_issue_date = 'Vui lòng chọn Ngày cấp';
      }
      if (!wizardForm.cccd_issue_place.trim()) {
        errors.cccd_issue_place = 'Vui lòng nhập Nơi cấp CCCD';
      }

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
      if (!wizardForm.detail_address.trim()) {
        errors.detail_address = 'Vui lòng nhập Địa chỉ chi tiết (số nhà, thôn/xóm)';
      }
      if (!wizardForm.phone.trim()) {
        errors.phone = 'Vui lòng nhập Số điện thoại liên hệ';
      } else if (!/^0[0-9]{9}$/.test(wizardForm.phone.trim()) && !/^[0-9]{10}$/.test(wizardForm.phone.trim())) {
        errors.phone = 'Số điện thoại phải bao gồm đúng 10 chữ số (Ví dụ: 0987654321)';
      }

      if (Object.keys(errors).length > 0) {
        if (errors.phone) {
          mainMsg = errors.phone;
        } else {
          mainMsg = 'Vui lòng điền đầy đủ thông tin địa chỉ chi tiết và Số điện thoại 10 chữ số!';
        }
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

  // Handlers
  const handleWizardSubmit = () => {
    if (!validateWizardStep(1) || !validateWizardStep(2) || !validateWizardStep(3) || !validateWizardStep(4)) {
      triggerToast('Vui lòng hoàn tất các bước thông tin bị thiếu trước khi lưu!');
      return;
    }
    const nextNum = members.length + 1;
    const newCode = `TV00${nextNum}`;
    const committedCap = wizardForm.committed_capital || 50000000;
    const contributedCap = wizardForm.contribution_method === 'Góp một lần'
      ? committedCap
      : (wizardForm.initial_contributed_capital || 10000000);
    const remainingCap = Math.max(0, committedCap - contributedCap);
    const capitalStat = remainingCap === 0 ? ('DU_VON' as const) : ('CHUA_DU' as const);

    const sharesCount = Math.floor(contributedCap / 100000);
    const newCapitalTotal = totalContributedCapital + contributedCap;
    const ownPct = Number(((contributedCap / (newCapitalTotal || 1)) * 100).toFixed(2));
    const fullAddr = `${wizardForm.detail_address ? wizardForm.detail_address + ', ' : ''}${wizardForm.ward}, ${wizardForm.district}, ${wizardForm.province}`;

    const newMem: Member = {
      id: `mem-00${nextNum}`,
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
      bank_account: '',
      bank_name: '',
      notes: wizardForm.notes,
      status: 'PENDING',
      join_date: new Date().toISOString().split('T')[0],
      current_debt: 0,
      annual_product_output_kg: 0,
      notary_document_url: wizardUploadedFile ? URL.createObjectURL(wizardUploadedFile) : undefined,
    };

    // Create initial CapitalTransaction record for 1st payment
    if (contributedCap > 0) {
      const firstTx: CapitalTransaction = {
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
      setTransactions((prev) => [firstTx, ...prev]);
    }

    createMemberApi(newMem)
      .then((savedMem) => {
        setMembers((prev) => [...prev, savedMem]);
        triggerToast(`Đã thêm thành công xã viên mới ${savedMem.full_name} (${savedMem.member_code}) vào Database!`);
      })
      .catch(() => {
        setMembers((prev) => [...prev, newMem]);
        triggerToast(`Đã thêm thành công xã viên mới ${newMem.full_name} (${newMem.member_code})!`);
      });

    setShowWizardModal(false);
    setWizardStep(1);
  };

  const handleOpenEdit = (m: Member) => {
    setEditingMember({ ...m });
    setEditError(null);
    setEditFieldErrors({});
    setEditTab('personal');
    setShowEditModal(true);
  };

  const handleSaveEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingMember) return;

    if (!validateEditMember(editingMember)) {
      triggerToast('Vui lòng sửa các thông tin bị sai phạm trước khi lưu!', 'danger');
      return;
    }

    setEditError(null);
    setEditFieldErrors({});

    const fullAddr = `${editingMember.detail_address ? editingMember.detail_address + ', ' : ''}${editingMember.ward}, ${editingMember.district}, ${editingMember.province}`;
    const updated: Member = {
      ...editingMember,
      address: fullAddr,
      remaining_capital: Math.max(0, (editingMember.committed_capital || 0) - (editingMember.contributed_capital || 0)),
      capital_status: ((editingMember.contributed_capital || 0) >= (editingMember.committed_capital || 0) && editingMember.committed_capital > 0) ? 'DU_VON' : 'CHUA_DU',
    };

    setMembers(members.map((m) => (m.id === updated.id ? updated : m)));
    updateMemberInStorage(updated);
    if (selectedMember?.id === updated.id) setSelectedMember(updated);
    if (selectedCapitalMember?.id === updated.id) setSelectedCapitalMember(updated);
    setShowEditModal(false);
    triggerToast(`Cập nhật thành công hồ sơ xã viên ${updated.full_name} (${updated.member_code})!`);
  };

  const handleOpenDelete = (m: Member) => {
    setDeletingMember(m);
    setShowDeleteModal(true);
  };

  const handleConfirmDelete = () => {
    if (!deletingMember) return;
    if ((deletingMember.current_debt || 0) > 0) {
      triggerToast(`Không thể ngưng hoạt động xã viên ${deletingMember.full_name} vì còn dư nợ ${(deletingMember.current_debt || 0).toLocaleString('vi-VN')} ₫. Vui lòng cấn trừ/thu hồi công nợ trước!`, 'warning');
      return;
    }
    const updatedMember: Member = { ...deletingMember, status: 'INACTIVE' };
    setMembers((prev) => prev.map((m) => (m.id === deletingMember.id ? updatedMember : m)));
    updateMemberInStorage(updatedMember);
    if (selectedMember?.id === deletingMember.id) setSelectedMember(updatedMember);
    if (selectedCapitalMember?.id === deletingMember.id) setSelectedCapitalMember(updatedMember);
    setShowDeleteModal(false);
    triggerToast(`Đã chuyển xã viên ${deletingMember.full_name} sang trạng thái "Đã ngưng hoạt động / Đã rút khỏi HTX".`, 'info');
  };

  const handleReactivateMember = (m: Member) => {
    const updated: Member = { ...m, status: 'ACTIVE' };
    setMembers((prev) => prev.map((item) => (item.id === m.id ? updated : item)));
    updateMemberInStorage(updated);
    if (selectedMember?.id === m.id) setSelectedMember(updated);
    if (selectedCapitalMember?.id === m.id) setSelectedCapitalMember(updated);
    triggerToast(`Đã kích hoạt lại xã viên ${m.full_name} (${m.member_code}) sang trạng thái Đang hoạt động.`, 'success');
  };

  const handleOpenApprove = (m: Member) => {
    setApprovingMember(m);
    setShowApproveModal(true);
  };

  const handleConfirmApprove = () => {
    if (!approvingMember) return;
    approveMemberApi(approvingMember.id);
    setMembers((prev) =>
      prev.map((m) => (m.id === approvingMember.id ? { ...m, status: 'ACTIVE' as MemberStatus } : m))
    );
    if (selectedMember?.id === approvingMember.id) {
      setSelectedMember({ ...selectedMember, status: 'ACTIVE' });
    }
    if (selectedCapitalMember?.id === approvingMember.id) {
      setSelectedCapitalMember({ ...selectedCapitalMember, status: 'ACTIVE' });
    }
    triggerToast(`Đã phê duyệt thành công xã viên ${approvingMember.full_name} (${approvingMember.member_code})! Trạng thái chuyển sang Đang hoạt động.`, 'success');
    setShowApproveModal(false);
    setApprovingMember(null);
  };

  const handlePrintMemberProfile = (m: Member) => {
    const printWindow = window.open('', '_blank', 'width=900,height=1000');
    if (!printWindow) {
      triggerToast('Vui lòng cho phép mở cửa sổ pop-up trên trình duyệt để in hồ sơ!', 'danger');
      return;
    }

    const today = new Date();
    const dateStr = `Ngày ${today.getDate()} tháng ${today.getMonth() + 1} năm ${today.getFullYear()}`;
    const memberTypeLabel = MEMBER_TYPE_LABELS[m.member_type] || m.member_type;

    const htmlContent = `
<!DOCTYPE html>
<html lang="vi">
<head>
  <meta charset="UTF-8">
  <title>Hồ sơ xã viên - ${m.full_name} (${m.member_code})</title>
  <style>
    @media print {
      @page { size: A4 portrait; margin: 12mm; }
      body { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
    }
    body {
      font-family: 'Times New Roman', Times, serif;
      font-size: 12.5pt;
      line-height: 1.45;
      color: #000;
      background: #fff;
      padding: 15px;
      margin: 0 auto;
      max-width: 800px;
    }
    .header-table { width: 100%; border-collapse: collapse; margin-bottom: 15px; }
    .header-table td { vertical-align: top; text-align: center; }
    .org-name { font-size: 11pt; font-weight: bold; text-transform: uppercase; }
    .national-motto { font-size: 11pt; font-weight: bold; }
    .national-sub { font-size: 11pt; border-bottom: 1px solid #000; display: inline-block; padding-bottom: 2px; margin-bottom: 8px; }
    .doc-title { text-align: center; margin: 15px 0 10px 0; }
    .doc-title h2 { font-size: 15pt; font-weight: bold; text-transform: uppercase; margin: 0; }
    .doc-title p { font-style: italic; font-size: 10.5pt; margin: 3px 0 0 0; }
    .section-title { font-weight: bold; font-size: 12.5pt; text-transform: uppercase; margin-top: 14px; margin-bottom: 6px; border-bottom: 1.5px solid #000; padding-bottom: 2px; }
    .info-table { width: 100%; border-collapse: collapse; margin-bottom: 10px; }
    .info-table td, .info-table th { border: 1px solid #333; padding: 5px 8px; font-size: 11pt; text-align: left; }
    .info-table th { background-color: #f2f2f2; font-weight: bold; }
    .field-label { font-weight: bold; width: 33%; color: #111; }
    .field-value { width: 67%; }
    .sig-table { width: 100%; margin-top: 25px; border-collapse: collapse; page-break-inside: avoid; }
    .sig-table td { text-align: center; vertical-align: top; width: 33.33%; font-size: 10.5pt; }
    .sig-title { font-weight: bold; text-transform: uppercase; }
    .sig-space { height: 70px; }
  </style>
</head>
<body>
  <table class="header-table">
    <tr>
      <td style="width: 45%;">
        <div class="org-name">HỢP TÁC XÃ NÔNG NGHIỆP DỊCH VỤ OCOP</div>
        <div style="font-size: 9.5pt;">Mã số HTX: 0317892312</div>
        <div style="font-size: 9.5pt; font-style: italic;">Lâm Đồng, Việt Nam</div>
      </td>
      <td style="width: 55%;">
        <div class="national-motto">CỘNG HÒA XÃ HỘI CHỦ NGHĨA VIỆT NAM</div>
        <div class="national-sub">Độc lập - Tự do - Hạnh phúc</div>
      </td>
    </tr>
  </table>

  <div class="doc-title">
    <h2>SỔ TỜ KHAI HỒ SƠ XÃ VIÊN</h2>
    <p>Mã số xã viên: <strong>${m.member_code}</strong> &bull; Trạng thái: <strong>${m.status === 'ACTIVE' ? 'Đang hoạt động' : m.status === 'PENDING' ? 'Chờ duyệt' : 'Đã ngưng hoạt động'}</strong></p>
  </div>

  <div class="section-title">I. THÔNG TIN CÁ NHÂN XÃ VIÊN</div>
  <table class="info-table">
    <tr>
      <td class="field-label">Họ và tên xã viên:</td>
      <td class="field-value"><strong style="font-size: 12pt; text-transform: uppercase;">${m.full_name}</strong></td>
    </tr>
    <tr>
      <td class="field-label">Giới tính / Ngày sinh:</td>
      <td class="field-value">${m.gender || '—'} &nbsp;|&nbsp; Ngày sinh: ${m.dob || '—'}</td>
    </tr>
    <tr>
      <td class="field-label">Số CCCD (12 chữ số):</td>
      <td class="field-value"><strong>${m.cccd}</strong> &nbsp;|&nbsp; Ngày cấp: ${m.cccd_issue_date || '—'}</td>
    </tr>
    <tr>
      <td class="field-label">Nơi cấp CCCD:</td>
      <td class="field-value">${m.cccd_issue_place || '—'}</td>
    </tr>
    <tr>
      <td class="field-label">Địa chỉ đăng ký:</td>
      <td class="field-value">${m.address || m.detail_address || '—'}</td>
    </tr>
    <tr>
      <td class="field-label">Số điện thoại / Email:</td>
      <td class="field-value">${m.phone} &nbsp;|&nbsp; ${m.email || '—'}</td>
    </tr>
    <tr>
      <td class="field-label">Trình độ / Nghề nghiệp:</td>
      <td class="field-value">${m.education_level || '—'} &nbsp;|&nbsp; ${m.occupation || '—'}</td>
    </tr>
  </table>

  <div class="section-title">II. TÌNH HÌNH VỐN GÓP VÀ QUYỀN LỢI SỞ HỮU</div>
  <table class="info-table">
    <tr>
      <th style="width: 50%;">Chỉ tiêu Quản lý Vốn</th>
      <th style="width: 50%;">Giá trị ghi nhận</th>
    </tr>
    <tr>
      <td>Phân loại xã viên:</td>
      <td><strong>${memberTypeLabel}</strong></td>
    </tr>
    <tr>
      <td>Số vốn cam kết góp:</td>
      <td><strong>${(m.committed_capital || 0).toLocaleString('vi-VN')} ₫</strong></td>
    </tr>
    <tr>
      <td>Số vốn thực đã góp:</td>
      <td><strong style="color: #047857;">${(m.total_capital_contributed || 0).toLocaleString('vi-VN')} ₫</strong></td>
    </tr>
    <tr>
      <td>Vốn còn phải góp:</td>
      <td>${(m.remaining_capital || 0).toLocaleString('vi-VN')} ₫</td>
    </tr>
    <tr>
      <td>Số tiền bằng chữ:</td>
      <td><em>${m.capital_in_words || '—'}</em></td>
    </tr>
    <tr>
      <td>Số cổ phần / Tỷ lệ sở hữu:</td>
      <td><strong>${m.total_shares_held || 0} cổ phần</strong> (${m.ownership_percentage || 0}%)</td>
    </tr>
    <tr>
      <td>Trạng thái vốn góp:</td>
      <td>${m.capital_status === 'DU_VON' ? 'Đã góp đủ vốn' : 'Chưa góp đủ vốn'}</td>
    </tr>
  </table>

  <div class="section-title">III. THÔNG TIN TÀI KHOẢN THỤ HƯỞNG CỔ TỨC</div>
  <table class="info-table">
    <tr>
      <td class="field-label">Ngân hàng thụ hưởng:</td>
      <td class="field-value">${m.bank_name || '—'}</td>
    </tr>
    <tr>
      <td class="field-label">Số tài khoản:</td>
      <td class="field-value"><strong>${m.bank_account || '—'}</strong></td>
    </tr>
    <tr>
      <td class="field-label">Tên chủ tài khoản:</td>
      <td class="field-value">${m.account_holder || m.full_name}</td>
    </tr>
    <tr>
      <td class="field-label">Hình thức chi trả:</td>
      <td class="field-value">${m.payout_method === 'BANK_TRANSFER' ? 'Chuyển khoản ngân hàng' : 'Nhận tiền mặt'}</td>
    </tr>
  </table>

  <div class="section-title">IV. SẢN LƯỢNG NÔNG SẢN & NGHĨA VỤ CÔNG NỢ</div>
  <table class="info-table">
    <tr>
      <td class="field-label">Sản lượng cung ứng / năm:</td>
      <td class="field-value"><strong>${(m.annual_product_output_kg || 0).toLocaleString('vi-VN')} kg/năm</strong></td>
    </tr>
    <tr>
      <td class="field-label">Dư nợ công nợ hiện tại:</td>
      <td class="field-value">${(m.current_debt || 0) > 0 ? `${m.current_debt.toLocaleString('vi-VN')} ₫ (Có nợ)` : 'Không có dư nợ'}</td>
    </tr>
    <tr>
      <td class="field-label">Ngày chính thức gia nhập:</td>
      <td class="field-value">${m.join_date || '—'}</td>
    </tr>
  </table>

  <div style="text-align: right; font-style: italic; margin-top: 20px; font-size: 10.5pt;">
    ${dateStr}
  </div>

  <table class="sig-table">
    <tr>
      <td>
        <div class="sig-title">XÃ VIÊN KHÊU KHAI</div>
        <div style="font-style: italic; font-size: 9.5pt;">(Ký và ghi rõ họ tên)</div>
        <div class="sig-space"></div>
        <strong>${m.full_name}</strong>
      </td>
      <td>
        <div class="sig-title">KẾ TOÁN TRƯỞNG</div>
        <div style="font-style: italic; font-size: 9.5pt;">(Ký và ghi rõ họ tên)</div>
        <div class="sig-space"></div>
      </td>
      <td>
        <div class="sig-title">CHỦ TỊCH HĐQT</div>
        <div style="font-style: italic; font-size: 9.5pt;">(Ký tên và đóng dấu)</div>
        <div class="sig-space"></div>
      </td>
    </tr>
  </table>
  <script>
    window.onload = function() {
      setTimeout(function() {
        window.print();
      }, 500);
    };
  </script>
</body>
</html>
    `;

    printWindow.document.open();
    printWindow.document.write(htmlContent);
    printWindow.document.close();
  };

  const handleApproveCapitalTx = (txId: string) => {
    const tx = transactions.find((t) => t.id === txId);
    if (!tx) return;

    setTransactions((prev) =>
      prev.map((t) =>
        t.id === txId
          ? {
              ...t,
              status: 'APPROVED' as const,
              recorded_by: 'Kế toán trưởng',
              recorded_date: new Date().toLocaleDateString('vi-VN'),
            }
          : t
      )
    );

    setMembers((prev) =>
      prev.map((m) => {
        if (m.id === tx.member_id || m.member_code === tx.member_code) {
          const newContributed = (m.contributed_capital || m.total_capital_contributed || 0) + tx.amount;
          const newCommitted = m.committed_capital || newContributed;
          const newRemaining = Math.max(0, newCommitted - newContributed);
          return {
            ...m,
            contributed_capital: newContributed,
            total_capital_contributed: newContributed,
            remaining_capital: newRemaining,
            capital_status: newContributed >= newCommitted && newCommitted > 0 ? ('DU_VON' as const) : ('CHUA_DU' as const),
          };
        }
        return m;
      })
    );

    triggerToast(`Đã phê duyệt thành công giao dịch góp vốn ${tx.transaction_code} (${tx.amount.toLocaleString('vi-VN')} ₫) cho ${tx.member_name}!`, 'success');
  };

  const handleRejectCapitalTx = (txId: string) => {
    const tx = transactions.find((t) => t.id === txId);
    if (!tx) return;
    setTransactions((prev) => prev.filter((t) => t.id !== txId));
    triggerToast(`Đã từ chối giao dịch ${tx.transaction_code} của ${tx.member_name}.`, 'danger');
  };

  const handleSaveCapitalTransaction = (e: React.FormEvent) => {
    e.preventDefault();
    const mem = members.find((m) => m.id === capitalForm.member_id);
    if (!mem) return;

    const newTx: CapitalTransaction = {
      id: `CC-00${transactions.length + 1}`,
      member_id: mem.id,
      member_code: mem.member_code,
      member_name: mem.full_name,
      transaction_code: capitalForm.receipt_number,
      amount: capitalForm.amount,
      share_quantity: Math.floor(capitalForm.amount / 100000),
      contribution_date: capitalForm.contribution_date,
      payment_method: capitalForm.payment_method,
      receipt_number: capitalForm.receipt_number,
      content: capitalForm.content,
      notes: capitalForm.notes,
      status: 'APPROVED',
      recorded_by: 'Nguyễn Văn A (Kế toán)',
      recorded_date: new Date().toLocaleDateString('vi-VN'),
    };

    setTransactions([newTx, ...transactions]);

    // Update member's capital
    setMembers(
      members.map((m) => {
        if (m.id === mem.id) {
          const newContributed = m.contributed_capital + capitalForm.amount;
          const newRemaining = Math.max(0, m.committed_capital - newContributed);
          return {
            ...m,
            contributed_capital: newContributed,
            remaining_capital: newRemaining,
            total_capital_contributed: newContributed,
            capital_status: newRemaining === 0 ? 'DU_VON' : 'CHUA_DU',
          };
        }
        return m;
      })
    );

    setShowRecordCapitalModal(false);
    triggerToast(`Đã ghi nhận góp vốn thành công cho xã viên ${mem.full_name}!`);
  };

  const handleUpdateProfitPlan = (e: React.FormEvent) => {
    e.preventDefault();
    const reserveAmt = (profitPlanForm.total_net_profit * profitPlanForm.reserve_fund_rate) / 100;
    const memberAmt = (profitPlanForm.total_net_profit * profitPlanForm.member_share_rate) / 100;
    const welfareAmt = (profitPlanForm.total_net_profit * profitPlanForm.welfare_fund_rate) / 100;

    setSurplusPlan({
      ...surplusPlan,
      fiscal_year: profitPlanForm.fiscal_year,
      total_net_profit: profitPlanForm.total_net_profit,
      reserve_fund_rate: profitPlanForm.reserve_fund_rate,
      reserve_fund_amount: reserveAmt,
      member_share_rate: profitPlanForm.member_share_rate,
      member_share_amount: memberAmt,
      welfare_fund_rate: profitPlanForm.welfare_fund_rate,
      welfare_fund_amount: welfareAmt,
      planned_payout_date: profitPlanForm.planned_payout_date,
      notes: profitPlanForm.notes,
    });

    triggerToast(`Đã cập nhật phương án phân chia lợi nhuận năm ${profitPlanForm.fiscal_year}!`);
  };

  // Filters
  const filteredMembersTab1 = members.filter((m) => {
    const matchSearch =
      m.full_name.toLowerCase().includes(search.toLowerCase()) ||
      m.member_code.toLowerCase().includes(search.toLowerCase()) ||
      m.phone.includes(search) ||
      m.cccd.includes(search);
    const matchType = typeFilter === 'ALL' || m.member_type === typeFilter;
    const matchStatus = statusFilter === 'ALL' || m.status === statusFilter;
    return matchSearch && matchType && matchStatus;
  });

  const filteredMembersTab2 = members.filter((m) => {
    const matchSearch =
      m.full_name.toLowerCase().includes(search.toLowerCase()) ||
      m.member_code.toLowerCase().includes(search.toLowerCase());
    const matchCapitalStatus = capitalStatusFilter === 'ALL' || m.capital_status === capitalStatusFilter;
    return matchSearch && matchCapitalStatus;
  });

  const filteredSurplusItems = surplusItems.filter((i) => {
    const matchSearch =
      i.member_name.toLowerCase().includes(search.toLowerCase()) ||
      i.member_code.toLowerCase().includes(search.toLowerCase());
    const matchStatus = profitStatusFilter === 'ALL' || i.payout_status === profitStatusFilter;
    const matchMethod = payoutMethodFilter === 'ALL' || i.payout_method === payoutMethodFilter;
    return matchSearch && matchStatus && matchMethod;
  });

  return (
    <div className="space-y-4 pb-12">
      {/* Toast Notification Floating */}
      {toast && (
        <div
          className={`fixed top-4 right-4 z-50 px-4 py-3 rounded-xl shadow-modal text-white text-xs font-extrabold flex items-center gap-2 animate-bounce ${
            toast.type === 'success' ? 'bg-emerald-600' :
            toast.type === 'warning' ? 'bg-amber-600' :
            toast.type === 'info' ? 'bg-blue-600' : 'bg-rose-600'
          }`}
        >
          {toast.type === 'success' ? <CheckCircle2 className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
          {toast.message}
        </div>
      )}

      {/* PAGE HEADER & TOP NAVIGATION TABS */}
      <div className="bg-white border border-[#e7e9ec] rounded-xl p-4 shadow-subtle flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-extrabold text-slate-900 tracking-tight">Quản lý Xã viên Hợp tác xã</h1>
          <p className="text-[12.8px] text-slate-500 mt-0.5">
            Quản lý danh sách, phân loại thành viên &amp; kiểm soát quyền biểu quyết (Luật HTX 2023)
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={openAddMemberModal}
            className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-[12.8px] rounded-lg shadow-sm inline-flex items-center gap-1.5 transition-all"
          >
            <Plus className="w-4 h-4" /> Thêm xã viên mới
          </button>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* TAB 1: DANH SÁCH XÃ VIÊN (VỚI BẢNG THỐNG KÊ CHỈ SỐ KPI ĐẦU TRANG) */}
      {/* ========================================================================= */}
      {activeTab === 'members' && (
        <div className="space-y-4 animate-fade-in">
          {/* TOP 5 KPI SUMMARY CARDS FOR MEMBER MANAGEMENT */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
            {/* Card 1: Tổng số Xã viên */}
            <div className="bg-white border border-[#e7e9ec] p-3.5 rounded-xl shadow-subtle space-y-1">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-extrabold text-slate-400 uppercase tracking-wider">TỔNG XÃ VIÊN</span>
                <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center">
                  <Users className="w-4 h-4" />
                </div>
              </div>
              <div className="text-xl font-black text-slate-900">{totalMembersCount} người</div>
              <div className="text-[11.5px] font-bold text-emerald-600 flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5" /> {activeMembersCount} đang hoạt động
              </div>
            </div>

            {/* Card 2: Xã viên Chính thức */}
            <div className="bg-white border border-[#e7e9ec] p-3.5 rounded-xl shadow-subtle space-y-1">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-extrabold text-slate-400 uppercase tracking-wider">CHÍNH THỨC</span>
                <div className="w-8 h-8 rounded-lg bg-blue-100 text-blue-600 flex items-center justify-center">
                  <Award className="w-4 h-4" />
                </div>
              </div>
              <div className="text-xl font-black text-slate-900">{officialMembersCount} người</div>
              <div className="text-[11.5px] text-slate-500 font-medium">Có quyền biểu quyết</div>
            </div>

            {/* Card 3: Xã viên Liên kết */}
            <div className="bg-white border border-[#e7e9ec] p-3.5 rounded-xl shadow-subtle space-y-1">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-extrabold text-slate-400 uppercase tracking-wider">LIÊN KẾT</span>
                <div className="w-8 h-8 rounded-lg bg-purple-100 text-purple-700 flex items-center justify-center">
                  <Layers className="w-4 h-4" />
                </div>
              </div>
              <div className="text-xl font-black text-slate-900">{associatedMembersCount} người</div>
              <div className="text-[11.5px] text-slate-500 font-medium">Góp vốn &amp; tiêu thụ</div>
            </div>

            {/* Card 4: Hồ sơ Chờ duyệt */}
            <div
              onClick={() => setStatusFilter('PENDING')}
              className="bg-white border border-[#e7e9ec] p-3.5 rounded-xl shadow-subtle space-y-1 cursor-pointer hover:border-amber-400 hover:shadow-md transition-all group"
            >
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-extrabold text-slate-400 uppercase tracking-wider group-hover:text-amber-700 transition-colors">CHỜ PHÊ DUYỆT</span>
                <div className="w-8 h-8 rounded-lg bg-amber-100 text-amber-700 flex items-center justify-center group-hover:scale-110 transition-transform">
                  <ClockIcon className="w-4 h-4" />
                </div>
              </div>
              <div className="text-xl font-black text-amber-700">{pendingMembersCount} hồ sơ</div>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setStatusFilter('PENDING');
                }}
                className="text-[11.5px] text-emerald-700 hover:underline font-bold inline-flex items-center gap-0.5"
              >
                Lọc chưa duyệt &rarr;
              </button>
            </div>

            {/* Card 5: Tổng vốn góp Xã viên */}
            <div
              onClick={() => setActiveTab('capital')}
              className="bg-white border border-[#e7e9ec] p-3.5 rounded-xl shadow-subtle space-y-1 cursor-pointer hover:border-emerald-400 hover:shadow-md transition-all group"
            >
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-extrabold text-slate-400 uppercase tracking-wider group-hover:text-emerald-700 transition-colors">VỐN GÓP XÃ VIÊN</span>
                <div className="w-8 h-8 rounded-lg bg-teal-100 text-teal-700 flex items-center justify-center group-hover:scale-110 transition-transform">
                  <Wallet className="w-4 h-4" />
                </div>
              </div>
              <div className="text-xl font-black text-emerald-800">{totalMemberCapital.toLocaleString('vi-VN')} ₫</div>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setActiveTab('capital');
                }}
                className="text-[11.5px] text-emerald-700 hover:underline font-bold inline-flex items-center gap-0.5"
              >
                Quản lý vốn &rarr;
              </button>
            </div>
          </div>

          {/* MAIN MEMBER TABLE & DRAWER GRID */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 items-start">
          <div className={`${selectedMember ? 'lg:col-span-2' : 'lg:col-span-3'} bg-white border border-[#e7e9ec] rounded-b-xl shadow-subtle overflow-hidden`}>
            {/* Filter Bar */}
            <div className="p-3.5 border-b border-[#e7e9ec] bg-slate-50/50 flex flex-wrap items-center justify-between gap-3">
              <div className="relative flex-1 min-w-[220px]">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Tìm theo tên xã viên, mã XV, CCCD..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full pl-9 pr-3 py-1.5 bg-white border border-slate-200 rounded-lg text-[12.8px] text-slate-700 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                />
              </div>

              <div className="flex items-center gap-2">
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-[12.5px] text-slate-700 font-medium focus:outline-none"
                >
                  <option value="ALL">Trạng thái: Tất cả</option>
                  <option value="ACTIVE">Đang hoạt động</option>
                  <option value="PENDING">Chờ duyệt</option>
                  <option value="INACTIVE">Đã ngưng hoạt động / Đã rút khỏi HTX</option>
                </select>

                <select
                  value={typeFilter}
                  onChange={(e) => setTypeFilter(e.target.value)}
                  className="px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-[12.5px] text-slate-700 font-medium focus:outline-none"
                >
                  <option value="ALL">Loại xã viên: Tất cả (3 loại)</option>
                  <option value="CHINH_THUC">Chính thức</option>
                  <option value="LIEN_KET_GOP_VON">Liên kết góp vốn</option>
                  <option value="LIEN_KET_KHONG_GOP_VON">Liên kết không góp vốn</option>
                </select>
              </div>
            </div>

            {/* Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-[12.9px]">
                <thead>
                  <tr className="border-b border-[#e7e9ec] text-[11px] uppercase tracking-wider text-slate-400 font-bold bg-slate-50">
                    <th className="py-2.5 px-3">Mã xã viên</th>
                    <th className="py-2.5 px-3">Họ và tên</th>
                    <th className="py-2.5 px-3">Giới tính</th>
                    <th className="py-2.5 px-3">Ngày tham gia</th>
                    <th className="py-2.5 px-3">Loại xã viên</th>
                    <th className="py-2.5 px-3 text-right">Vốn góp (đồng)</th>
                    <th className="py-2.5 px-3 text-right">Tỷ lệ (%)</th>
                    <th className="py-2.5 px-3">Trạng thái</th>
                    <th className="py-2.5 px-3 text-center w-[120px]">Thao tác</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredMembersTab1.map((m) => (
                    <tr
                      key={m.id}
                      onClick={() => setSelectedMember(m)}
                      className={`cursor-pointer hover:bg-slate-50 transition-colors ${
                        selectedMember?.id === m.id ? 'bg-emerald-50/60 font-semibold' : ''
                      }`}
                    >
                      <td className="py-3 px-3 font-mono text-[12px] font-bold text-slate-600">{m.member_code}</td>
                      <td className="py-3 px-3 font-bold text-slate-900">{m.full_name}</td>
                      <td className="py-3 px-3 text-slate-600">{m.gender}</td>
                      <td className="py-3 px-3 text-slate-600">{m.join_date}</td>
                      <td className="py-3 px-3">
                        {m.member_type === 'CHINH_THUC' && <span className="pill-badge pill-green">Chính thức</span>}
                        {m.member_type === 'LIEN_KET_GOP_VON' && <span className="pill-badge pill-blue">LK góp vốn</span>}
                        {m.member_type === 'LIEN_KET_KHONG_GOP_VON' && <span className="pill-badge pill-purple">LK không góp vốn</span>}
                      </td>
                      <td className="py-3 px-3 text-right font-extrabold text-emerald-700">
                        {m.total_capital_contributed.toLocaleString('vi-VN')} ₫
                      </td>
                      <td className="py-3 px-3 text-right font-bold text-slate-800">{m.ownership_percentage}%</td>
                      <td className="py-3 px-3">
                        {m.status === 'ACTIVE' && <span className="pill-badge pill-green">Đang hoạt động</span>}
                        {m.status === 'PENDING' && <span className="pill-badge pill-amber">Chờ duyệt</span>}
                        {m.status === 'INACTIVE' && <span className="pill-badge pill-slate bg-slate-100 text-slate-600 border border-slate-200">Đã ngưng hoạt động</span>}
                      </td>
                      <td className="py-3 px-3 text-center">
                        <div className="inline-flex items-center justify-center gap-1.5">
                          {m.status === 'PENDING' && (
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleOpenApprove(m);
                              }}
                              className="px-2 py-1 bg-emerald-100 hover:bg-emerald-200 text-emerald-800 font-extrabold rounded-md text-[11px] inline-flex items-center gap-1 transition-colors shadow-2xs"
                              title="Phê duyệt xã viên này"
                            >
                              <UserCheck className="w-3.5 h-3.5" /> Duyệt
                            </button>
                          )}
                          {m.status === 'INACTIVE' && (
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleReactivateMember(m);
                              }}
                              className="px-2 py-1 bg-blue-50 hover:bg-blue-100 text-blue-700 font-extrabold rounded-md text-[11px] inline-flex items-center gap-1 transition-colors border border-blue-200 shadow-2xs"
                              title="Kích hoạt lại xã viên"
                            >
                              <RefreshCw className="w-3.5 h-3.5" /> Kích hoạt lại
                            </button>
                          )}
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelectedMember(m);
                            }}
                            className="p-1.5 text-slate-400 hover:text-emerald-700 hover:bg-emerald-50 rounded-lg transition-colors"
                            title="Xem thông tin chi tiết"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleOpenEdit(m);
                            }}
                            className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                            title="Cập nhật thông tin xã viên"
                          >
                            <Pencil className="w-4 h-4" />
                          </button>
                          {m.status !== 'INACTIVE' && (
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleOpenDelete(m);
                              }}
                              className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                              title="Ngưng hoạt động / Cho rút khỏi HTX"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Drawer Details Member - COMPREHENSIVE VIEW MATCHING ALL WIZARD FIELDS */}
          {selectedMember && (
            <div className="bg-white border border-[#e7e9ec] rounded-xl shadow-subtle animate-fade-in max-h-[calc(100vh-180px)] flex flex-col overflow-hidden">
              {/* Fixed Header */}
              <div className="p-4 border-b border-[#e7e9ec] bg-white z-10 flex items-start justify-between shrink-0 shadow-2xs">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-2xl bg-emerald-600 text-white font-extrabold flex items-center justify-center text-base shadow-sm shrink-0">
                    {selectedMember.full_name.substring(0, 2).toUpperCase()}
                  </div>
                  <div>
                    <h3 className="font-extrabold text-[15px] text-slate-900 flex items-center gap-2">
                      {selectedMember.full_name}
                      {selectedMember.status === 'ACTIVE' && (
                        <span className="pill-badge pill-green text-[10px]">Đang hoạt động</span>
                      )}
                      {selectedMember.status === 'PENDING' && (
                        <span className="pill-badge pill-amber text-[10px]">Chờ duyệt</span>
                      )}
                      {selectedMember.status === 'INACTIVE' && (
                        <span className="pill-badge pill-slate bg-slate-100 text-slate-600 border border-slate-200 text-[10px]">Đã ngưng hoạt động</span>
                      )}
                    </h3>
                    <p className="text-[11.8px] text-slate-500 font-mono">
                      Mã: <strong>{selectedMember.member_code}</strong> &bull; Tham gia: {selectedMember.join_date}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => handlePrintMemberProfile(selectedMember)}
                    className="p-1.5 text-slate-400 hover:text-emerald-700 hover:bg-emerald-50 rounded-lg transition-colors"
                    title="In hồ sơ xã viên"
                  >
                    <Printer className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleOpenEdit(selectedMember)}
                    className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                    title="Chỉnh sửa thông tin"
                  >
                    <Pencil className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => setSelectedMember(null)}
                    className="text-slate-400 hover:text-slate-600 p-1.5 hover:bg-slate-100 rounded-lg"
                    title="Đóng"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Scrollable Body Content */}
              <div className="p-4 overflow-y-auto space-y-4 flex-1">
                {/* Approval Notice Banner */}
                {selectedMember.status === 'PENDING' && (
                  <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-[12px] flex items-center justify-between gap-2 shadow-2xs">
                    <div className="flex items-center gap-2">
                      <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
                      <div>
                        <strong className="text-amber-900 font-extrabold block">Hồ sơ chưa được phê duyệt</strong>
                        <span className="text-amber-700 text-[11px]">Cần Chủ tịch/HĐQT phê duyệt để kích hoạt thành viên.</span>
                      </div>
                    </div>
                    <button
                      onClick={() => handleOpenApprove(selectedMember)}
                      className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-[11.5px] rounded-lg shadow-xs shrink-0 flex items-center gap-1.5 transition-all"
                    >
                      <UserCheck className="w-4 h-4" /> Duyệt hồ sơ ngay
                    </button>
                  </div>
                )}

                {/* Badges Summary Bar */}
                <div className="grid grid-cols-2 gap-2 p-2.5 bg-slate-50 rounded-xl border border-slate-100 text-[11.5px]">
                  <div>
                    <span className="text-slate-400 block text-[10px] uppercase font-bold">Loại xã viên:</span>
                    <strong className="text-emerald-800">{MEMBER_TYPE_LABELS[selectedMember.member_type]}</strong>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px] uppercase font-bold">Tỷ lệ sở hữu:</span>
                    <strong className="text-slate-900">{selectedMember.ownership_percentage}% vốn HTX</strong>
                  </div>
                </div>

                {/* 1. THÔNG TIN CÁ NHÂN */}
                <div className="p-3 bg-white border border-slate-200/80 rounded-xl space-y-2 text-[12.2px]">
                  <div className="text-[11px] uppercase tracking-wider text-slate-500 font-extrabold flex items-center gap-1.5 border-b border-slate-100 pb-1.5">
                    <Users className="w-3.5 h-3.5 text-emerald-600" /> 1. Thông tin cá nhân
                  </div>
                  <div className="grid grid-cols-2 gap-x-2 gap-y-1.5">
                    <div>
                      <span className="text-slate-400 block text-[10.5px]">Họ và tên:</span>
                      <strong className="text-slate-900">{selectedMember.full_name}</strong>
                    </div>
                    <div>
                      <span className="text-slate-400 block text-[10.5px]">Giới tính:</span>
                      <span className="font-medium text-slate-800">{selectedMember.gender}</span>
                    </div>
                    <div>
                      <span className="text-slate-400 block text-[10.5px]">Ngày sinh:</span>
                      <span className="font-medium text-slate-800">{selectedMember.dob || '—'}</span>
                    </div>
                    <div>
                      <span className="text-slate-400 block text-[10.5px]">Số CCCD:</span>
                      <span className="font-mono font-bold text-slate-900">{selectedMember.cccd || '—'}</span>
                    </div>
                    <div>
                      <span className="text-slate-400 block text-[10.5px]">Ngày cấp:</span>
                      <span className="text-slate-700">{selectedMember.cccd_issue_date || '—'}</span>
                    </div>
                    <div>
                      <span className="text-slate-400 block text-[10.5px]">Nơi cấp:</span>
                      <span className="text-slate-700 truncate block" title={selectedMember.cccd_issue_place}>{selectedMember.cccd_issue_place || '—'}</span>
                    </div>
                    <div>
                      <span className="text-slate-400 block text-[10.5px]">Trình độ học vấn:</span>
                      <span className="font-medium text-slate-800">{selectedMember.education_level || 'Chưa xác định'}</span>
                    </div>
                    <div>
                      <span className="text-slate-400 block text-[10.5px]">Nghề nghiệp:</span>
                      <span className="font-medium text-slate-800">{selectedMember.occupation || 'Nông dân'}</span>
                    </div>
                  </div>
                </div>

                {/* 2. THÔNG TIN LIÊN HỆ & ĐỊA CHỈ */}
                <div className="p-3 bg-white border border-slate-200/80 rounded-xl space-y-2 text-[12.2px]">
                  <div className="text-[11px] uppercase tracking-wider text-slate-500 font-extrabold flex items-center gap-1.5 border-b border-slate-100 pb-1.5">
                    <MapPin className="w-3.5 h-3.5 text-emerald-600" /> 2. Thông tin liên hệ &amp; Địa chỉ
                  </div>
                  <div className="space-y-1.5">
                    <div>
                      <span className="text-slate-400 block text-[10.5px]">Địa chỉ thường trú:</span>
                      <span className="font-medium text-slate-800 leading-snug">{selectedMember.address}</span>
                    </div>
                    <div className="grid grid-cols-2 gap-x-2 gap-y-1.5 pt-1">
                      <div>
                        <span className="text-slate-400 block text-[10.5px]">Số điện thoại:</span>
                        <strong className="font-mono text-emerald-800">{selectedMember.phone}</strong>
                      </div>
                      <div>
                        <span className="text-slate-400 block text-[10.5px]">Email:</span>
                        <span className="text-slate-700 truncate block" title={selectedMember.email}>{selectedMember.email || '—'}</span>
                      </div>
                      <div>
                        <span className="text-slate-400 block text-[10.5px]">Zalo:</span>
                        <span className="text-slate-700">{selectedMember.zalo || '—'}</span>
                      </div>
                      <div>
                        <span className="text-slate-400 block text-[10.5px]">Facebook:</span>
                        <span className="text-slate-700 truncate block" title={selectedMember.facebook}>{selectedMember.facebook || '—'}</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* 3. THÔNG TIN VỐN GÓP */}
                <div className="p-3 bg-white border border-slate-200/80 rounded-xl space-y-2 text-[12.2px]">
                  <div className="text-[11px] uppercase tracking-wider text-slate-500 font-extrabold flex items-center justify-between border-b border-slate-100 pb-1.5">
                    <span className="flex items-center gap-1.5">
                      <Wallet className="w-3.5 h-3.5 text-emerald-600" /> 3. Thông tin vốn góp
                    </span>
                    {selectedMember.capital_status === 'DU_VON' ? (
                      <span className="pill-badge pill-green text-[9.5px]">Đủ vốn</span>
                    ) : (
                      <span className="pill-badge pill-amber text-[9.5px]">Chưa đủ</span>
                    )}
                  </div>
                  <div className="grid grid-cols-2 gap-x-2 gap-y-1.5">
                    <div>
                      <span className="text-slate-400 block text-[10.5px]">Hình thức góp:</span>
                      <span className="font-medium text-slate-800">{selectedMember.capital_form === 'TIEN_MAT' ? 'Tiền mặt' : 'Hiện vật'}</span>
                    </div>
                    <div>
                      <span className="text-slate-400 block text-[10.5px]">Phương thức góp:</span>
                      <span className="font-medium text-slate-800">{selectedMember.contribution_method || 'Góp một lần'}</span>
                    </div>
                    <div>
                      <span className="text-slate-400 block text-[10.5px]">Vốn cam kết:</span>
                      <strong className="text-slate-900">{(selectedMember.committed_capital || selectedMember.total_capital_contributed)?.toLocaleString('vi-VN')} ₫</strong>
                    </div>
                    <div>
                      <span className="text-slate-400 block text-[10.5px]">Đã thực góp:</span>
                      <strong className="text-emerald-700">{(selectedMember.contributed_capital || selectedMember.total_capital_contributed)?.toLocaleString('vi-VN')} ₫</strong>
                    </div>
                    <div>
                      <span className="text-slate-400 block text-[10.5px]">Ngày góp vốn:</span>
                      <span className="text-slate-700">{selectedMember.contribution_date || selectedMember.join_date}</span>
                    </div>
                    <div>
                      <span className="text-slate-400 block text-[10.5px]">Số cổ phần:</span>
                      <strong className="text-slate-900">{selectedMember.total_shares_held} cổ phần</strong>
                    </div>
                    {selectedMember.capital_in_words && (
                      <div className="col-span-2">
                        <span className="text-slate-400 block text-[10.5px]">Bằng chữ:</span>
                        <span className="italic text-slate-600 text-[11.5px]">"{selectedMember.capital_in_words}"</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* 4. PHÂN CHIA LỢI NHUẬN & NGÂN HÀNG */}
                <div className="p-3 bg-white border border-slate-200/80 rounded-xl space-y-2 text-[12.2px]">
                  <div className="text-[11px] uppercase tracking-wider text-slate-500 font-extrabold flex items-center gap-1.5 border-b border-slate-100 pb-1.5">
                    <Calculator className="w-3.5 h-3.5 text-emerald-600" /> 4. Phân chia lợi nhuận &amp; Ngân hàng
                  </div>
                  <div className="grid grid-cols-2 gap-x-2 gap-y-1.5">
                    <div>
                      <span className="text-slate-400 block text-[10.5px]">Tỷ lệ chia lợi nhuận:</span>
                      <strong className="text-emerald-800 text-[13px]">{selectedMember.profit_share_rate}%</strong>
                    </div>
                    <div>
                      <span className="text-slate-400 block text-[10.5px]">Hình thức nhận:</span>
                      <span className="font-medium text-slate-800">{selectedMember.payout_method === 'CASH' ? 'Tiền mặt' : 'Chuyển khoản'}</span>
                    </div>
                    {selectedMember.bank_account && (
                      <div className="col-span-2 space-y-1 pt-1 border-t border-slate-100">
                        <div className="flex justify-between">
                          <span className="text-slate-400 text-[10.5px]">Ngân hàng:</span>
                          <span className="font-semibold text-slate-800 text-right">{selectedMember.bank_name}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-slate-400 text-[10.5px]">Số tài khoản:</span>
                          <span className="font-mono font-bold text-slate-900">{selectedMember.bank_account}</span>
                        </div>
                        {selectedMember.account_holder && (
                          <div className="flex justify-between">
                            <span className="text-slate-400 text-[10.5px]">Chủ tài khoản:</span>
                            <span className="font-bold text-slate-800">{selectedMember.account_holder}</span>
                          </div>
                        )}
                      </div>
                    )}
                    {selectedMember.notes && (
                      <div className="col-span-2 pt-1 border-t border-slate-100">
                        <span className="text-slate-400 block text-[10.5px]">Ghi chú:</span>
                        <p className="text-slate-600 text-[11.5px] italic leading-relaxed">{selectedMember.notes}</p>
                      </div>
                    )}
                  </div>
                </div>

                {/* 5. THỐNG KÊ HOẠT ĐỘNG */}
                <div className="p-3 bg-slate-50 border border-slate-200/60 rounded-xl space-y-2 text-[12px]">
                  <div className="text-[11px] uppercase tracking-wider text-slate-500 font-extrabold flex items-center gap-1.5 border-b border-slate-200/60 pb-1.5">
                    <TrendingUp className="w-3.5 h-3.5 text-blue-600" /> 5. Hoạt động &amp; Sản lượng
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <span className="text-slate-400 block text-[10.5px]">Sản lượng cung ứng:</span>
                      <strong className="text-slate-900">{(selectedMember.annual_product_output_kg || 0).toLocaleString('vi-VN')} kg/năm</strong>
                    </div>
                    <div>
                      <span className="text-slate-400 block text-[10.5px]">Công nợ hiện tại:</span>
                      <strong className={selectedMember.current_debt > 0 ? 'text-rose-600' : 'text-emerald-700'}>
                        {selectedMember.current_debt ? `${selectedMember.current_debt.toLocaleString('vi-VN')} ₫` : 'Không có nợ'}
                      </strong>
                    </div>
                  </div>
                </div>
              </div>

              {/* Fixed Footer Quick Actions */}
              <div className="p-3 border-t border-slate-200 bg-white z-10 flex justify-between gap-2 shrink-0 shadow-2xs">
                <button
                  onClick={() => handlePrintMemberProfile(selectedMember)}
                  className="flex-1 py-2 border border-slate-200 hover:bg-slate-50 text-slate-700 font-bold text-[12.5px] rounded-lg inline-flex items-center justify-center gap-1.5 transition-colors"
                >
                  <Printer className="w-4 h-4 text-emerald-600" /> In hồ sơ
                </button>
                <button
                  onClick={() => handleOpenEdit(selectedMember)}
                  className="flex-1 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-[12.5px] rounded-lg inline-flex items-center justify-center gap-1.5 shadow-xs transition-colors"
                >
                  <Pencil className="w-4 h-4" /> Chỉnh sửa
                </button>
              </div>
            </div>
          )}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 2: QUẢN LÝ VỐN GÓP (MATCHING IMAGE 2 EXACTLY 100%) */}
      {/* ========================================================================= */}
      {activeTab === 'capital' && (
        <div className="space-y-4 animate-fade-in">
          {/* Breadcrumb Header */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-xs font-bold text-slate-400">
              <span>Vốn góp</span>
              <ChevronRight className="w-3.5 h-3.5" />
              <span className="text-slate-800">Tổng quan</span>
            </div>
            <div className="px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-xs font-bold text-slate-700 flex items-center gap-2">
              <Calendar className="w-4 h-4 text-emerald-600" />
              <span>01/01/2025 - 31/12/2025</span>
            </div>
          </div>

          {/* TOP 6 KPI STATS CARDS MATCHING IMAGE 2 */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-3">
            {/* Card 1: Tổng vốn góp */}
            <div className="bg-white border border-[#e7e9ec] p-3.5 rounded-xl shadow-subtle space-y-1">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold text-slate-400 uppercase">Tổng vốn góp</span>
                <div className="w-7 h-7 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center">
                  <Wallet className="w-4 h-4" />
                </div>
              </div>
              <div className="text-lg font-black text-slate-900">{totalCommittedCapital.toLocaleString('vi-VN')} ₫</div>
              <div className="text-[11px] font-bold text-emerald-600 flex items-center gap-1">
                <TrendingUp className="w-3 h-3" /> +8,5% so với năm trước
              </div>
            </div>

            {/* Card 2: Đã góp */}
            <div className="bg-white border border-[#e7e9ec] p-3.5 rounded-xl shadow-subtle space-y-1">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold text-slate-400 uppercase">Đã góp</span>
                <div className="w-7 h-7 rounded-lg bg-blue-100 text-blue-600 flex items-center justify-center">
                  <CheckCircle2 className="w-4 h-4" />
                </div>
              </div>
              <div className="text-lg font-black text-slate-900">{totalContributedCapital.toLocaleString('vi-VN')} ₫</div>
              <div className="w-full bg-slate-100 rounded-full h-1.5 mt-1 overflow-hidden">
                <div className="bg-blue-600 h-1.5 rounded-full" style={{ width: `${overallCapitalPct}%` }}></div>
              </div>
            </div>

            {/* Card 3: Còn phải góp */}
            <div className="bg-white border border-[#e7e9ec] p-3.5 rounded-xl shadow-subtle space-y-1">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold text-slate-400 uppercase">Còn phải góp</span>
                <div className="w-7 h-7 rounded-lg bg-amber-100 text-amber-700 flex items-center justify-center">
                  <AlertCircle className="w-4 h-4" />
                </div>
              </div>
              <div className="text-lg font-black text-amber-800">{totalRemainingCapital.toLocaleString('vi-VN')} ₫</div>
              <div className="text-[11px] text-slate-500 font-semibold">{partialCapitalCount} xã viên chưa đủ</div>
            </div>

            {/* Card 4: Số xã viên */}
            <div className="bg-white border border-[#e7e9ec] p-3.5 rounded-xl shadow-subtle space-y-1">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold text-slate-400 uppercase">Số xã viên</span>
                <div className="w-7 h-7 rounded-lg bg-purple-100 text-purple-700 flex items-center justify-center">
                  <Users className="w-4 h-4" />
                </div>
              </div>
              <div className="text-lg font-black text-slate-900">125 người</div>
              <div className="text-[11px] text-slate-500 font-medium">
                Đã đủ: <strong className="text-emerald-700">102</strong> &bull; Chưa đủ: <strong className="text-amber-700">23</strong>
              </div>
            </div>

            {/* Card 5: Giao dịch */}
            <div className="bg-white border border-[#e7e9ec] p-3.5 rounded-xl shadow-subtle space-y-1">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold text-slate-400 uppercase">Giao dịch</span>
                <div className="w-7 h-7 rounded-lg bg-teal-100 text-teal-700 flex items-center justify-center">
                  <Layers className="w-4 h-4" />
                </div>
              </div>
              <div className="text-lg font-black text-slate-900">386 giao dịch</div>
              <div className="text-[11px] text-slate-500 font-semibold">Tháng này: +28</div>
            </div>

            {/* Card 6: Chờ duyệt */}
            <div
              onClick={() => setShowPendingCapitalModal(true)}
              className="bg-white border border-[#e7e9ec] p-3.5 rounded-xl shadow-subtle space-y-1 cursor-pointer hover:border-amber-400 hover:shadow-md transition-all group"
            >
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold text-slate-400 uppercase group-hover:text-amber-700 transition-colors">Chờ duyệt</span>
                <div className="w-7 h-7 rounded-lg bg-rose-100 text-rose-700 flex items-center justify-center group-hover:scale-110 transition-transform">
                  <ClockIcon className="w-4 h-4" />
                </div>
              </div>
              <div className="text-lg font-black text-rose-700">
                {transactions.filter((t) => t.status === 'PENDING').length} giao dịch
              </div>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setShowPendingCapitalModal(true);
                }}
                className="text-[11px] text-emerald-700 hover:underline font-bold inline-flex items-center gap-0.5"
              >
                Xem chi tiết &rarr;
              </button>
            </div>
          </div>

          {/* MAIN CAPITAL TABLE & DRAWER GRID */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 items-start">
            <div className={`${selectedCapitalMember ? 'lg:col-span-2' : 'lg:col-span-3'} bg-white border border-[#e7e9ec] rounded-xl shadow-subtle overflow-hidden`}>
              {/* Table Action & Filter Bar */}
              <div className="p-3.5 border-b border-[#e7e9ec] bg-slate-50/50 flex flex-wrap items-center justify-between gap-3">
                <div className="relative flex-1 min-w-[220px]">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    placeholder="Tìm theo tên, mã xã viên..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="w-full pl-9 pr-3 py-1.5 bg-white border border-slate-200 rounded-lg text-[12.8px] text-slate-700 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                  />
                </div>

                <div className="flex items-center gap-2">
                  <select
                    value={capitalStatusFilter}
                    onChange={(e) => setCapitalStatusFilter(e.target.value)}
                    className="px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-[12.5px] text-slate-700 font-medium focus:outline-none"
                  >
                    <option value="ALL">Trạng thái: Tất cả</option>
                    <option value="DU_VON">Đủ vốn</option>
                    <option value="CHUA_DU">Chưa đủ</option>
                  </select>

                  <button
                    onClick={() => {
                      setSearch('');
                      setCapitalStatusFilter('ALL');
                    }}
                    className="px-3 py-1.5 border border-slate-200 hover:bg-slate-100 text-slate-600 font-bold text-[12px] rounded-lg inline-flex items-center gap-1"
                  >
                    <RotateCcw className="w-3.5 h-3.5" /> Đặt lại
                  </button>
                </div>
              </div>

              {/* Capital Table matching Image 2 */}
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-[12.8px]">
                  <thead>
                    <tr className="border-b border-[#e7e9ec] text-[11px] uppercase tracking-wider text-slate-400 font-bold bg-slate-50">
                      <th className="py-2.5 px-3">STT</th>
                      <th className="py-2.5 px-3">Mã xã viên</th>
                      <th className="py-2.5 px-3">Họ và tên</th>
                      <th className="py-2.5 px-3">Ngày tham gia</th>
                      <th className="py-2.5 px-3 text-right">Vốn cam kết (đ)</th>
                      <th className="py-2.5 px-3 text-right">Đã góp (đ)</th>
                      <th className="py-2.5 px-3 text-right">Còn thiếu (đ)</th>
                      <th className="py-2.5 px-3 text-right">Tỷ lệ (%)</th>
                      <th className="py-2.5 px-3">Trạng thái</th>
                      <th className="py-2.5 px-3 text-center">Thao tác</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {filteredMembersTab2.map((m, idx) => (
                      <tr
                        key={m.id}
                        onClick={() => setSelectedCapitalMember(m)}
                        className={`cursor-pointer hover:bg-slate-50 transition-colors ${
                          selectedCapitalMember?.id === m.id ? 'bg-emerald-50/60 font-semibold' : ''
                        }`}
                      >
                        <td className="py-3 px-3 text-slate-500 font-medium">{idx + 1}</td>
                        <td className="py-3 px-3 font-mono font-bold text-slate-600">{m.member_code}</td>
                        <td className="py-3 px-3 font-bold text-slate-900">{m.full_name}</td>
                        <td className="py-3 px-3 text-slate-600">{m.join_date}</td>
                        <td className="py-3 px-3 text-right font-bold text-slate-900">
                          {m.committed_capital?.toLocaleString('vi-VN')} ₫
                        </td>
                        <td className="py-3 px-3 text-right font-extrabold text-emerald-700">
                          {m.contributed_capital?.toLocaleString('vi-VN')} ₫
                        </td>
                        <td className="py-3 px-3 text-right font-bold text-amber-800">
                          {m.remaining_capital?.toLocaleString('vi-VN')} ₫
                        </td>
                        <td className="py-3 px-3 text-right font-bold text-slate-800">
                          {Math.round(((m.contributed_capital || 0) / (m.committed_capital || 1)) * 100)}%
                        </td>
                        <td className="py-3 px-3">
                          {m.capital_status === 'DU_VON' ? (
                            <span className="pill-badge pill-green">Đủ vốn</span>
                          ) : (
                            <span className="pill-badge pill-amber">Chưa đủ</span>
                          )}
                        </td>
                        <td className="py-3 px-3 text-center">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelectedCapitalMember(m);
                            }}
                            className="p-1.5 text-slate-400 hover:text-emerald-700 hover:bg-emerald-50 rounded-lg"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>

                  {/* Summary Total Row matching Image 2 */}
                  <tfoot>
                    <tr className="bg-slate-100/80 font-extrabold text-slate-900 border-t-2 border-slate-200 text-[12.8px]">
                      <td colSpan={4} className="py-3 px-3 text-slate-900">Tổng cộng</td>
                      <td className="py-3 px-3 text-right">{totalCommittedCapital.toLocaleString('vi-VN')} ₫</td>
                      <td className="py-3 px-3 text-right text-emerald-700">{totalContributedCapital.toLocaleString('vi-VN')} ₫</td>
                      <td className="py-3 px-3 text-right text-amber-800">{totalRemainingCapital.toLocaleString('vi-VN')} ₫</td>
                      <td className="py-3 px-3 text-right">{overallCapitalPct}%</td>
                      <td colSpan={2}></td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            </div>

            {/* SIDE DRAWER CHI TIẾT VỐN GÓP MATCHING IMAGE 2 EXACTLY */}
            {selectedCapitalMember && (
              <div className="bg-white border border-[#e7e9ec] rounded-xl shadow-subtle p-4 space-y-4 animate-fade-in">
                <div className="flex items-start justify-between border-b border-[#e7e9ec] pb-3">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-800 font-bold flex items-center justify-center text-base border border-emerald-200 shrink-0">
                      {selectedCapitalMember.full_name.substring(0, 2).toUpperCase()}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="font-extrabold text-[15px] text-slate-900">{selectedCapitalMember.full_name}</h3>
                        <span className="pill-badge pill-green text-[10.5px]">Đã góp đủ</span>
                      </div>
                      <p className="text-[11.8px] text-slate-500">Mã xã viên: {selectedCapitalMember.member_code} &bull; Tham gia: {selectedCapitalMember.join_date}</p>
                    </div>
                  </div>
                  <button onClick={() => setSelectedCapitalMember(null)} className="text-slate-400 hover:text-slate-600 p-1">
                    <X className="w-4 h-4" />
                  </button>
                </div>

                {/* Progress Box */}
                <div className="p-3 bg-emerald-50/50 border border-emerald-100 rounded-xl space-y-2">
                  <div className="flex justify-between items-baseline">
                    <span className="text-[11.5px] font-bold text-slate-500">Tổng vốn:</span>
                    <span className="text-lg font-black text-emerald-800">
                      {selectedCapitalMember.contributed_capital?.toLocaleString('vi-VN')} ₫
                    </span>
                  </div>
                  <div className="w-full bg-slate-200 rounded-full h-2 overflow-hidden">
                    <div className="bg-emerald-600 h-2 rounded-full" style={{ width: '100%' }}></div>
                  </div>

                  <div className="grid grid-cols-2 gap-2 pt-2 text-[11.8px] border-t border-emerald-200/60">
                    <div>
                      <span className="text-slate-500">Vốn cam kết:</span>{' '}
                      <strong className="text-slate-900">{selectedCapitalMember.committed_capital?.toLocaleString('vi-VN')} ₫</strong>
                    </div>
                    <div>
                      <span className="text-slate-500">Lần góp gần nhất:</span>{' '}
                      <strong className="text-slate-900">15/05/2025</strong>
                    </div>
                    <div>
                      <span className="text-slate-500">Đã góp:</span>{' '}
                      <strong className="text-emerald-700">{selectedCapitalMember.contributed_capital?.toLocaleString('vi-VN')} ₫</strong>
                    </div>
                    <div>
                      <span className="text-slate-500">Tổng số lần góp:</span>{' '}
                      <strong className="text-slate-900">3 lần</strong>
                    </div>
                  </div>
                </div>

                {/* Drawer Inner Tabs */}
                <div className="border-b border-[#e7e9ec] flex gap-4 text-[12px] font-bold">
                  <button
                    onClick={() => setCapitalDrawerTab('history')}
                    className={`pb-2 border-b-2 ${capitalDrawerTab === 'history' ? 'border-emerald-600 text-emerald-800' : 'border-transparent text-slate-400'}`}
                  >
                    Lịch sử góp vốn
                  </button>
                  <button
                    onClick={() => setCapitalDrawerTab('docs')}
                    className={`pb-2 border-b-2 ${capitalDrawerTab === 'docs' ? 'border-emerald-600 text-emerald-800' : 'border-transparent text-slate-400'}`}
                  >
                    Chứng từ
                  </button>
                  <button
                    onClick={() => setCapitalDrawerTab('info')}
                    className={`pb-2 border-b-2 ${capitalDrawerTab === 'info' ? 'border-emerald-600 text-emerald-800' : 'border-transparent text-slate-400'}`}
                  >
                    Thông tin
                  </button>
                </div>

                {/* Tab Content: Lịch sử góp vốn */}
                {capitalDrawerTab === 'history' && (
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-[12px] font-bold text-slate-700">Lịch sử giao dịch</span>
                      <button
                        onClick={() => setShowRecordCapitalModal(true)}
                        className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-[11.5px] rounded-lg inline-flex items-center gap-1"
                      >
                        <Plus className="w-3.5 h-3.5" /> Ghi nhận góp vốn
                      </button>
                    </div>

                    <div className="overflow-x-auto border border-slate-200 rounded-lg">
                      <table className="w-full text-left text-[11.8px]">
                        <thead className="bg-slate-50 text-[10.5px] uppercase font-bold text-slate-400">
                          <tr>
                            <th className="py-2 px-2.5">Ngày</th>
                            <th className="py-2 px-2.5">Số tiền</th>
                            <th className="py-2 px-2.5">Hình thức</th>
                            <th className="py-2 px-2.5">Chứng từ</th>
                            <th className="py-2 px-2.5">Trạng thái</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                          {transactions.map((tx) => (
                            <tr key={tx.id}>
                              <td className="py-2 px-2.5 text-slate-600">{tx.contribution_date}</td>
                              <td className="py-2 px-2.5 font-bold text-emerald-700">+{tx.amount.toLocaleString('vi-VN')} ₫</td>
                              <td className="py-2 px-2.5 text-slate-600">
                                {tx.payment_method === 'CASH' ? 'Tiền mặt' : 'Chuyển khoản'}
                              </td>
                              <td className="py-2 px-2.5 font-mono text-emerald-700 font-semibold">{tx.receipt_number}</td>
                              <td className="py-2 px-2.5">
                                <span className="pill-badge pill-green text-[10px]">Đã duyệt</span>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>

                    {/* Section: Thông tin bổ sung */}
                    <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-1 text-[11.8px]">
                      <div className="font-bold text-slate-800">Thông tin bổ sung</div>
                      <p className="text-slate-600 italic">"{selectedCapitalMember.notes}"</p>
                      <div className="text-slate-500 pt-1 text-[11px]">
                        Người ghi nhận: <strong>Nguyễn Văn A (Kế toán)</strong> &bull; Ngày ghi nhận: 15/05/2025
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* CHARTS GRID MATCHING IMAGE 2 BOTTOM */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            {/* Chart 1: Biểu đồ vốn góp theo thời gian */}
            <div className="bg-white border border-[#e7e9ec] p-4 rounded-xl shadow-subtle space-y-3">
              <div className="flex justify-between items-center">
                <h3 className="font-extrabold text-slate-900 text-sm">Biểu đồ vốn góp theo thời gian</h3>
                <div className="flex items-center gap-3 text-[11px] font-bold">
                  <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-full bg-emerald-600"></span> Vốn cam kết</span>
                  <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-full bg-blue-500"></span> Vốn đã góp</span>
                </div>
              </div>
              <div className="h-44 flex items-end justify-between gap-1 pt-6 px-2 border-b border-slate-200">
                {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map((m) => (
                  <div key={m} className="flex-1 flex items-end justify-center gap-0.5 group relative">
                    <div className="w-2 bg-emerald-600 rounded-t-xs" style={{ height: `${40 + (m * 4) % 50}%` }}></div>
                    <div className="w-2 bg-blue-500 rounded-t-xs" style={{ height: `${35 + (m * 3.8) % 45}%` }}></div>
                    <span className="absolute -bottom-5 text-[10px] font-bold text-slate-400">T{m}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Chart 2: Cơ cấu vốn góp */}
            <div className="bg-white border border-[#e7e9ec] p-4 rounded-xl shadow-subtle space-y-3">
              <h3 className="font-extrabold text-slate-900 text-sm">Cơ cấu vốn góp</h3>
              <div className="flex items-center justify-center py-2 relative">
                <div className="w-32 h-32 rounded-full border-[14px] border-emerald-600 border-t-amber-500 flex flex-col items-center justify-center text-center">
                  <span className="text-[12px] font-extrabold text-slate-900">2.450.000.000 ₫</span>
                  <span className="text-[9.5px] text-slate-400 uppercase font-bold">Tổng vốn góp</span>
                </div>
              </div>
              <div className="space-y-1.5 text-[12px] pt-2">
                <div className="flex justify-between items-center">
                  <span className="flex items-center gap-2 text-slate-600">
                    <span className="w-3 h-3 rounded-full bg-emerald-600"></span> Đã góp
                  </span>
                  <strong className="text-slate-900">2.180.000.000 ₫ (88,98%)</strong>
                </div>
                <div className="flex justify-between items-center">
                  <span className="flex items-center gap-2 text-slate-600">
                    <span className="w-3 h-3 rounded-full bg-amber-500"></span> Còn phải góp
                  </span>
                  <strong className="text-amber-800">270.000.000 ₫ (11,02%)</strong>
                </div>
              </div>
            </div>

            {/* Widget 3: Top 5 xã viên góp vốn nhiều nhất */}
            <div className="bg-white border border-[#e7e9ec] p-4 rounded-xl shadow-subtle space-y-3">
              <div className="flex justify-between items-center">
                <h3 className="font-extrabold text-slate-900 text-sm">Top 5 xã viên góp vốn nhiều nhất</h3>
                <button
                  onClick={() => setSelectedCapitalMember(members[0])}
                  className="text-[11.5px] text-emerald-700 font-bold hover:underline"
                >
                  Xem chi tiết &rarr;
                </button>
              </div>
              <div className="space-y-2 text-[12.5px]">
                {[
                  { rank: 1, name: 'Nguyễn Văn A', amount: 120000000 },
                  { rank: 2, name: 'Trần Thị B', amount: 100000000 },
                  { rank: 3, name: 'Lê Văn C', amount: 80000000 },
                  { rank: 4, name: 'Phạm Thị D', amount: 75000000 },
                  { rank: 5, name: 'Hoàng Văn E', amount: 60000000 },
                ].map((item, idx) => (
                  <div
                    key={item.rank}
                    onClick={() => setSelectedCapitalMember(members[idx] || members[0])}
                    className="flex justify-between items-center p-2 rounded-lg bg-slate-50 hover:bg-emerald-50 cursor-pointer transition-colors"
                  >
                    <div className="flex items-center gap-2.5">
                      <span className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-800 text-[11px] font-black flex items-center justify-center">
                        {item.rank}
                      </span>
                      <span className="font-bold text-slate-800">{item.name}</span>
                    </div>
                    <span className="font-extrabold text-emerald-700">{item.amount.toLocaleString('vi-VN')} ₫</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 3: PHÂN CHIA LỢI NHUẬN (MATCHING IMAGE 1 EXACTLY 100%) */}
      {/* ========================================================================= */}
      {activeTab === 'profit' && (
        <div className="space-y-4 animate-fade-in">
          {/* Breadcrumb Header */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-xs font-bold text-slate-400">
              <span>Trang chủ</span>
              <ChevronRight className="w-3.5 h-3.5" />
              <span>Quản lý HTX</span>
              <ChevronRight className="w-3.5 h-3.5" />
              <span className="text-slate-800">Phân chia lợi nhuận</span>
            </div>
          </div>

          {/* TOP 5 KPI STATS CARDS MATCHING IMAGE 1 */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
            {/* Card 1: Tổng lợi nhuận năm */}
            <div className="bg-white border border-[#e7e9ec] p-3.5 rounded-xl shadow-subtle space-y-1">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold text-slate-400 uppercase">Tổng lợi nhuận năm</span>
                <div className="w-7 h-7 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center">
                  <Wallet className="w-4 h-4" />
                </div>
              </div>
              <div className="text-lg font-black text-slate-900">{surplusPlan.total_net_profit.toLocaleString('vi-VN')} ₫</div>
              <div className="text-[11px] font-bold text-emerald-600 flex items-center gap-1">
                <TrendingUp className="w-3 h-3" /> +12,5% so với năm trước
              </div>
            </div>

            {/* Card 2: Đã phân chia */}
            <div className="bg-white border border-[#e7e9ec] p-3.5 rounded-xl shadow-subtle space-y-1">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold text-slate-400 uppercase">Đã phân chia</span>
                <div className="w-7 h-7 rounded-lg bg-blue-100 text-blue-600 flex items-center justify-center">
                  <CheckCircle2 className="w-4 h-4" />
                </div>
              </div>
              <div className="text-lg font-black text-slate-900">{distributedProfitAmount.toLocaleString('vi-VN')} ₫</div>
              <div className="w-full bg-slate-100 rounded-full h-1.5 mt-1 overflow-hidden">
                <div className="bg-blue-600 h-1.5 rounded-full" style={{ width: `${distributedProfitPct}%` }}></div>
              </div>
            </div>

            {/* Card 3: Còn lại */}
            <div className="bg-white border border-[#e7e9ec] p-3.5 rounded-xl shadow-subtle space-y-1">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold text-slate-400 uppercase">Còn lại</span>
                <div className="w-7 h-7 rounded-lg bg-orange-100 text-orange-700 flex items-center justify-center">
                  <AlertCircle className="w-4 h-4" />
                </div>
              </div>
              <div className="text-lg font-black text-orange-700">{remainingProfitAmount.toLocaleString('vi-VN')} ₫</div>
              <div className="w-full bg-slate-100 rounded-full h-1.5 mt-1 overflow-hidden">
                <div className="bg-orange-500 h-1.5 rounded-full" style={{ width: '16%' }}></div>
              </div>
            </div>

            {/* Card 4: Số xã viên nhận */}
            <div className="bg-white border border-[#e7e9ec] p-3.5 rounded-xl shadow-subtle space-y-1">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold text-slate-400 uppercase">Số xã viên nhận</span>
                <div className="w-7 h-7 rounded-lg bg-purple-100 text-purple-700 flex items-center justify-center">
                  <Users className="w-4 h-4" />
                </div>
              </div>
              <div className="text-lg font-black text-slate-900">125 người</div>
              <div className="text-[11px] text-slate-500 font-medium">
                Đã nhận: <strong className="text-emerald-700">{paidMemberCount}</strong> &bull; Chưa nhận: <strong className="text-orange-700">{unpaidMemberCount}</strong>
              </div>
            </div>

            {/* Card 5: Kỳ phân chia */}
            <div className="bg-white border border-[#e7e9ec] p-3.5 rounded-xl shadow-subtle space-y-1">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold text-slate-400 uppercase">Kỳ phân chia</span>
                <div className="w-7 h-7 rounded-lg bg-slate-100 text-slate-600 flex items-center justify-center">
                  <Calendar className="w-4 h-4" />
                </div>
              </div>
              <select className="w-full mt-1 bg-white border border-slate-200 rounded-lg px-2 py-1 text-xs font-bold text-slate-800">
                <option value="2024">Năm 2024</option>
                <option value="2023">Năm 2023</option>
              </select>
            </div>
          </div>

          {/* CARD: THÔNG TIN KỲ PHÂN CHIA MATCHING IMAGE 1 */}
          <div className="bg-white border border-[#e7e9ec] rounded-xl p-4 shadow-subtle space-y-4">
            <h3 className="font-extrabold text-slate-900 text-sm border-b border-[#e7e9ec] pb-2">
              Thông tin kỳ phân chia
            </h3>

            <form onSubmit={handleUpdateProfitPlan} className="space-y-4 text-[12.8px]">
              <div className="grid grid-cols-1 md:grid-cols-5 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Năm tài chính *</label>
                  <select
                    value={profitPlanForm.fiscal_year}
                    onChange={(e) => setProfitPlanForm({ ...profitPlanForm, fiscal_year: Number(e.target.value) })}
                    className="w-full px-3 py-1.5 border border-slate-200 rounded-lg font-bold"
                  >
                    <option value={2024}>2024</option>
                    <option value={2025}>2025</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Tổng lợi nhuận sau thuế (đ)</label>
                  <input
                    type="number"
                    value={profitPlanForm.total_net_profit}
                    onChange={(e) => setProfitPlanForm({ ...profitPlanForm, total_net_profit: Number(e.target.value) })}
                    className="w-full px-3 py-1.5 border border-slate-200 rounded-lg font-bold text-slate-900"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Tỷ lệ trích lập quỹ (%)</label>
                  <div className="flex items-center gap-1">
                    <input
                      type="number"
                      value={profitPlanForm.reserve_fund_rate}
                      onChange={(e) => setProfitPlanForm({ ...profitPlanForm, reserve_fund_rate: Number(e.target.value) })}
                      className="w-20 px-3 py-1.5 border border-slate-200 rounded-lg font-bold"
                    />
                    <span className="text-[11.5px] text-slate-400 font-semibold">(125.000.000 đ)</span>
                  </div>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Tỷ lệ chia cho xã viên (%)</label>
                  <div className="flex items-center gap-1">
                    <input
                      type="number"
                      value={profitPlanForm.member_share_rate}
                      onChange={(e) => setProfitPlanForm({ ...profitPlanForm, member_share_rate: Number(e.target.value) })}
                      className="w-20 px-3 py-1.5 border border-slate-200 rounded-lg font-bold text-emerald-800"
                    />
                    <span className="text-[11.5px] text-slate-400 font-semibold">(1.062.500.000 đ)</span>
                  </div>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Tỷ lệ quỹ khen thưởng, phúc lợi (%)</label>
                  <div className="flex items-center gap-1">
                    <input
                      type="number"
                      value={profitPlanForm.welfare_fund_rate}
                      onChange={(e) => setProfitPlanForm({ ...profitPlanForm, welfare_fund_rate: Number(e.target.value) })}
                      className="w-20 px-3 py-1.5 border border-slate-200 rounded-lg font-bold"
                    />
                    <span className="text-[11.5px] text-slate-400 font-semibold">(62.500.000 đ)</span>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-3 items-end">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Ngày dự kiến phân chia *</label>
                  <input
                    type="text"
                    value={profitPlanForm.planned_payout_date}
                    onChange={(e) => setProfitPlanForm({ ...profitPlanForm, planned_payout_date: e.target.value })}
                    className="w-full px-3 py-1.5 border border-slate-200 rounded-lg"
                  />
                </div>

                <div className="md:col-span-2 flex items-center gap-2">
                  <div className="flex-1">
                    <label className="block font-bold text-slate-700 mb-1">Ghi chú</label>
                    <input
                      type="text"
                      value={profitPlanForm.notes}
                      onChange={(e) => setProfitPlanForm({ ...profitPlanForm, notes: e.target.value })}
                      className="w-full px-3 py-1.5 border border-slate-200 rounded-lg"
                    />
                  </div>

                  <button
                    type="submit"
                    className="mt-6 px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-lg shadow-sm text-[12.8px] whitespace-nowrap transition-all"
                  >
                    Cập nhật thông tin
                  </button>
                </div>
              </div>
            </form>
          </div>

          {/* MAIN PROFIT TABLE & DRAWER GRID MATCHING IMAGE 1 */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 items-start">
            <div className={`${selectedSurplusItem ? 'lg:col-span-2' : 'lg:col-span-3'} bg-white border border-[#e7e9ec] rounded-xl shadow-subtle overflow-hidden`}>
              <div className="p-3 border-b border-[#e7e9ec] bg-slate-50/50 flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-3 text-[12.5px] font-bold text-slate-600">
                  <span className="text-emerald-800 border-b-2 border-emerald-600 pb-1">Tất cả (125)</span>
                  <span className="hover:text-slate-900 cursor-pointer">Đã nhận (102)</span>
                  <span className="hover:text-slate-900 cursor-pointer">Chưa nhận (23)</span>
                </div>

                <div className="flex items-center gap-2">
                  <div className="relative">
                    <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      placeholder="Tìm theo tên xã viên, mã xã viên..."
                      value={search}
                      onChange={(e) => setSearch(e.target.value)}
                      className="pl-8 pr-3 py-1 bg-white border border-slate-200 rounded-lg text-[12px]"
                    />
                  </div>

                  <select
                    value={profitStatusFilter}
                    onChange={(e) => setProfitStatusFilter(e.target.value)}
                    className="px-2.5 py-1 bg-white border border-slate-200 rounded-lg text-[12px] font-medium"
                  >
                    <option value="ALL">Trạng thái: Tất cả</option>
                    <option value="DA_NHAN">Đã nhận</option>
                    <option value="CHUA_NHAN">Chưa nhận</option>
                  </select>

                  <button
                    onClick={() => triggerToast('Đã tạo đợt phân chia mới!')}
                    className="px-3 py-1 bg-emerald-600 text-white font-bold text-[12px] rounded-lg inline-flex items-center gap-1"
                  >
                    <Plus className="w-3.5 h-3.5" /> Tạo đợt phân chia
                  </button>
                </div>
              </div>

              {/* Profit Table matching Image 1 */}
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-[12.8px]">
                  <thead>
                    <tr className="border-b border-[#e7e9ec] text-[11px] uppercase tracking-wider text-slate-400 font-bold bg-slate-50">
                      <th className="py-2.5 px-3">STT</th>
                      <th className="py-2.5 px-3">Mã xã viên</th>
                      <th className="py-2.5 px-3">Họ và tên</th>
                      <th className="py-2.5 px-3 text-right">Vốn góp (đ)</th>
                      <th className="py-2.5 px-3 text-right">Tỷ lệ chia (%)</th>
                      <th className="py-2.5 px-3 text-right">Số tiền được nhận (đ)</th>
                      <th className="py-2.5 px-3">Hình thức nhận</th>
                      <th className="py-2.5 px-3">Trạng thái</th>
                      <th className="py-2.5 px-3 text-center">Thao tác</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {filteredSurplusItems.map((item, idx) => (
                      <tr
                        key={item.id}
                        onClick={() => setSelectedSurplusItem(item)}
                        className={`cursor-pointer hover:bg-slate-50 transition-colors ${
                          selectedSurplusItem?.id === item.id ? 'bg-emerald-50/60 font-semibold' : ''
                        }`}
                      >
                        <td className="py-3 px-3 text-slate-500 font-medium">{idx + 1}</td>
                        <td className="py-3 px-3 font-mono font-bold text-slate-600">{item.member_code}</td>
                        <td className="py-3 px-3 font-bold text-slate-900">{item.member_name}</td>
                        <td className="py-3 px-3 text-right text-slate-800">
                          {item.capital_contributed?.toLocaleString('vi-VN')} ₫
                        </td>
                        <td className="py-3 px-3 text-right font-bold text-slate-800">{item.share_percentage}%</td>
                        <td className="py-3 px-3 text-right font-extrabold text-slate-900">
                          {item.total_payout_amount.toLocaleString('vi-VN')} ₫
                        </td>
                        <td className="py-3 px-3 text-slate-700 font-medium">
                          {item.payout_method === 'BANK_TRANSFER' ? 'Chuyển khoản' : 'Tiền mặt'}
                        </td>
                        <td className="py-3 px-3">
                          {item.payout_status === 'DA_NHAN' ? (
                            <span className="pill-badge pill-green">Đã nhận</span>
                          ) : (
                            <span className="pill-badge pill-amber">Chưa nhận</span>
                          )}
                        </td>
                        <td className="py-3 px-3 text-center">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelectedSurplusItem(item);
                            }}
                            className="p-1.5 text-slate-400 hover:text-emerald-700 hover:bg-emerald-50 rounded-lg"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* SIDE DRAWER CHI TIẾT PHÂN CHIA LỢI NHUẬN MATCHING IMAGE 1 EXACTLY */}
            {selectedSurplusItem && (
              <div className="bg-white border border-[#e7e9ec] rounded-xl shadow-subtle p-4 space-y-4 animate-fade-in">
                <div className="flex items-start justify-between border-b border-[#e7e9ec] pb-3">
                  <div className="flex items-center gap-3">
                    <div className="w-11 h-11 rounded-full bg-emerald-100 text-emerald-800 font-bold flex items-center justify-center text-sm border border-emerald-200 shrink-0">
                      {selectedSurplusItem.member_name.substring(0, 2).toUpperCase()}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="font-extrabold text-[15px] text-slate-900">{selectedSurplusItem.member_name}</h3>
                        <span className="pill-badge pill-green text-[10.5px]">Đã nhận</span>
                      </div>
                      <p className="text-[11.8px] text-slate-500">
                        {selectedSurplusItem.member_code} &bull; Thành viên chính thức &bull; Tham gia: 10/01/2024
                      </p>
                    </div>
                  </div>
                  <button onClick={() => setSelectedSurplusItem(null)} className="text-slate-400 hover:text-slate-600 p-1">
                    <X className="w-4 h-4" />
                  </button>
                </div>

                {/* Section 1: Thông tin lợi nhuận */}
                <div className="space-y-2 text-[12.5px] border-b border-slate-200 pb-3">
                  <div className="font-bold text-slate-800 text-[12px] uppercase">Thông tin lợi nhuận</div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Vốn góp:</span>
                    <span className="font-bold text-slate-900">{selectedSurplusItem.capital_contributed?.toLocaleString('vi-VN')} ₫</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Tỷ lệ chia:</span>
                    <span className="font-bold text-slate-900">{selectedSurplusItem.share_percentage}%</span>
                  </div>
                  <div className="flex justify-between text-emerald-800 font-extrabold text-sm">
                    <span>Số tiền được nhận:</span>
                    <span>{selectedSurplusItem.total_payout_amount.toLocaleString('vi-VN')} ₫</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Hình thức nhận:</span>
                    <span className="font-medium text-slate-800">
                      {selectedSurplusItem.payout_method === 'BANK_TRANSFER' ? 'Chuyển khoản' : 'Tiền mặt'}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Ngày nhận:</span>
                    <span className="font-medium text-slate-800">15/03/2025</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Mã giao dịch:</span>
                    <span className="font-mono font-bold text-emerald-700">LN2025-001</span>
                  </div>
                </div>

                {/* Section 2: Thông tin tài khoản nhận */}
                <div className="space-y-2 text-[12.5px] border-b border-slate-200 pb-3">
                  <div className="font-bold text-slate-800 text-[12px] uppercase">Thông tin tài khoản nhận</div>
                  <div className="p-2.5 bg-slate-50 border border-slate-200 rounded-lg space-y-1">
                    <div className="font-bold text-emerald-800 text-[12px]">Ngân hàng TMCP Ngoại thương Việt Nam (VCB)</div>
                    <div className="text-[12px] text-slate-700 font-mono font-bold">STK: 1234567890</div>
                    <div className="text-[11.5px] text-slate-500">Chủ tài khoản: <strong>Nguyễn Văn A</strong></div>
                  </div>
                </div>

                {/* Section 3: Chứng từ liên quan */}
                <div className="space-y-2 text-[12.5px] border-b border-slate-200 pb-3">
                  <div className="font-bold text-slate-800 text-[12px] uppercase">Chứng từ liên quan</div>
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between p-2 bg-slate-50 border border-slate-200 rounded-lg">
                      <div className="flex items-center gap-2">
                        <FileText className="w-4 h-4 text-rose-600" />
                        <div>
                          <div className="font-bold text-[12px] text-slate-800">Quyết định phân chia lợi nhuận.pdf</div>
                          <div className="text-[10.5px] text-slate-400">1.2 MB</div>
                        </div>
                      </div>
                      <button className="p-1 text-slate-400 hover:text-emerald-700">
                        <Download className="w-4 h-4" />
                      </button>
                    </div>

                    <div className="flex items-center justify-between p-2 bg-slate-50 border border-slate-200 rounded-lg">
                      <div className="flex items-center gap-2">
                        <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
                        <div>
                          <div className="font-bold text-[12px] text-slate-800">Danh sách xã viên nhận lợi nhuận.xlsx</div>
                          <div className="text-[10.5px] text-slate-400">856 KB</div>
                        </div>
                      </div>
                      <button className="p-1 text-slate-400 hover:text-emerald-700">
                        <Download className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>

                {/* Section 4: Lịch sử giao dịch Timeline */}
                <div className="space-y-2 text-[12.5px]">
                  <div className="font-bold text-slate-800 text-[12px] uppercase">Lịch sử giao dịch</div>
                  <div className="space-y-3 pl-2">
                    <div className="flex items-start gap-2 text-[11.8px]">
                      <div className="w-2.5 h-2.5 rounded-full bg-emerald-600 mt-1"></div>
                      <div className="flex-1">
                        <div className="flex justify-between items-center">
                          <span className="font-bold text-slate-900">15/03/2025 10:30</span>
                          <span className="pill-badge pill-green text-[9.5px]">Đã duyệt</span>
                        </div>
                        <div className="text-slate-600">Đã chi trả lợi nhuận</div>
                        <div className="text-slate-400 text-[11px]">Nguyễn Văn A (Kế toán)</div>
                      </div>
                    </div>

                    <div className="flex items-start gap-2 text-[11.8px]">
                      <div className="w-2.5 h-2.5 rounded-full bg-blue-500 mt-1"></div>
                      <div className="flex-1">
                        <div className="flex justify-between items-center">
                          <span className="font-bold text-slate-900">12/03/2025 14:15</span>
                          <span className="pill-badge pill-green text-[9.5px]">Đã duyệt</span>
                        </div>
                        <div className="text-slate-600">Tạo giao dịch phân chia</div>
                        <div className="text-slate-400 text-[11px]">Nguyễn Văn A (Kế toán)</div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="pt-2 flex justify-between gap-2 border-t border-slate-200">
                  <button className="px-3 py-1.5 border border-rose-300 text-rose-700 font-bold hover:bg-rose-50 text-[12px] rounded-lg inline-flex items-center gap-1">
                    <Trash2 className="w-3.5 h-3.5" /> Hủy giao dịch
                  </button>
                  <button className="px-3 py-1.5 border border-blue-300 text-blue-700 font-bold hover:bg-blue-50 text-[12px] rounded-lg inline-flex items-center gap-1">
                    <Printer className="w-3.5 h-3.5" /> In biên lai
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* CHARTS GRID MATCHING IMAGE 1 BOTTOM */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {/* Chart 1: Cơ cấu phân chia lợi nhuận */}
            <div className="bg-white border border-[#e7e9ec] p-4 rounded-xl shadow-subtle space-y-3">
              <h3 className="font-extrabold text-slate-900 text-sm">Cơ cấu phân chia lợi nhuận</h3>
              <div className="flex items-center justify-between">
                <div className="w-36 h-36 rounded-full border-[16px] border-emerald-600 border-l-blue-500 border-b-orange-400 flex flex-col items-center justify-center text-center">
                  <span className="text-[12px] font-extrabold text-slate-900">1.250.000.000 ₫</span>
                  <span className="text-[9.5px] text-slate-400 uppercase font-bold">Tổng lợi nhuận</span>
                </div>
                <div className="space-y-2 text-[12px]">
                  <div className="flex items-center justify-between gap-4">
                    <span className="flex items-center gap-2 text-slate-600">
                      <span className="w-3 h-3 rounded-full bg-emerald-600"></span> Chia cho xã viên (85%)
                    </span>
                    <strong className="text-slate-900">1.062.500.000 ₫</strong>
                  </div>
                  <div className="flex items-center justify-between gap-4">
                    <span className="flex items-center gap-2 text-slate-600">
                      <span className="w-3 h-3 rounded-full bg-blue-500"></span> Quỹ trích lập (10%)
                    </span>
                    <strong className="text-slate-900">125.000.000 ₫</strong>
                  </div>
                  <div className="flex items-center justify-between gap-4">
                    <span className="flex items-center gap-2 text-slate-600">
                      <span className="w-3 h-3 rounded-full bg-orange-400"></span> Quỹ khen thưởng, phúc lợi (5%)
                    </span>
                    <strong className="text-slate-900">62.500.000 ₫</strong>
                  </div>
                </div>
              </div>
            </div>

            {/* Chart 2: Tình hình nhận lợi nhuận */}
            <div className="bg-white border border-[#e7e9ec] p-4 rounded-xl shadow-subtle space-y-3">
              <div className="flex justify-between items-center">
                <h3 className="font-extrabold text-slate-900 text-sm">Tình hình nhận lợi nhuận</h3>
                <div className="flex items-center gap-3 text-[11px] font-bold">
                  <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-full bg-emerald-600"></span> Đã nhận</span>
                  <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-full bg-orange-500"></span> Chưa nhận</span>
                </div>
              </div>
              <div className="h-44 flex items-end justify-between gap-2 pt-6 px-2 border-b border-slate-200">
                {['Tháng 1', 'Tháng 2', 'Tháng 3', 'Tháng 4', 'Tháng 5', 'Tháng 6'].map((m, i) => (
                  <div key={m} className="flex-1 flex items-end justify-center gap-1">
                    <div className="w-3 bg-emerald-600 rounded-t-xs" style={{ height: `${60 + i * 5}%` }}></div>
                    <div className="w-3 bg-orange-500 rounded-t-xs" style={{ height: `${20 + i * 3}%` }}></div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 4: HỒ SƠ HỢP TÁC XÃ NÔNG NGHIỆP */}
      {/* ========================================================================= */}
      {activeTab === 'coop' && (
        <div className="bg-white border border-[#e7e9ec] rounded-b-xl p-6 shadow-subtle space-y-6 animate-fade-in">
          <div className="flex items-center gap-4 border-b border-[#e7e9ec] pb-4">
            <div className="w-14 h-14 rounded-2xl bg-emerald-100 text-emerald-800 flex items-center justify-center font-black text-xl border border-emerald-200">
              HTX
            </div>
            <div>
              <h2 className="text-lg font-extrabold text-slate-900">Hồ sơ Hợp tác xã Nông nghiệp</h2>
              <p className="text-[12.8px] text-slate-500">Thông tin pháp lý &amp; Danh sách Ban Quản trị HTX</p>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL POPUP: GHI NHẬN GÓP VỐN (MATCHING IMAGE 2 BOTTOM LEFT POPUP) */}
      {/* ========================================================================= */}
      {showRecordCapitalModal && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fade-in">
          <div className="bg-white rounded-2xl max-w-xl w-full shadow-modal overflow-hidden">
            <div className="p-4 border-b border-slate-200 flex justify-between items-center bg-slate-50">
              <h3 className="font-extrabold text-slate-900 text-base">Ghi nhận góp vốn</h3>
              <button onClick={() => setShowRecordCapitalModal(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveCapitalTransaction} className="p-5 space-y-4 text-[12.8px]">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Xã viên *</label>
                  <select
                    value={capitalForm.member_id}
                    onChange={(e) => setCapitalForm({ ...capitalForm, member_id: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg font-bold text-slate-800"
                  >
                    {members.map((m) => (
                      <option key={m.id} value={m.id}>
                        {m.full_name} ({m.member_code})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Số tiền góp *</label>
                  <input
                    type="number"
                    step={1000000}
                    required
                    value={capitalForm.amount}
                    onChange={(e) => setCapitalForm({ ...capitalForm, amount: Number(e.target.value) })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg font-bold text-emerald-800"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Ngày góp *</label>
                  <input
                    type="date"
                    required
                    value={capitalForm.contribution_date}
                    onChange={(e) => setCapitalForm({ ...capitalForm, contribution_date: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Hình thức *</label>
                  <div className="flex items-center gap-4 pt-2 font-medium">
                    <label className="flex items-center gap-1.5 cursor-pointer">
                      <input
                        type="radio"
                        name="pm"
                        checked={capitalForm.payment_method === 'CASH'}
                        onChange={() => setCapitalForm({ ...capitalForm, payment_method: 'CASH' })}
                      />
                      Tiền mặt
                    </label>
                    <label className="flex items-center gap-1.5 cursor-pointer">
                      <input
                        type="radio"
                        name="pm"
                        checked={capitalForm.payment_method === 'BANK_TRANSFER'}
                        onChange={() => setCapitalForm({ ...capitalForm, payment_method: 'BANK_TRANSFER' })}
                      />
                      Chuyển khoản
                    </label>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Số chứng từ</label>
                  <input
                    type="text"
                    value={capitalForm.receipt_number}
                    onChange={(e) => setCapitalForm({ ...capitalForm, receipt_number: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg font-mono font-bold"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Nội dung</label>
                  <input
                    type="text"
                    value={capitalForm.content}
                    onChange={(e) => setCapitalForm({ ...capitalForm, content: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">File chứng từ</label>
                <div className="border-2 border-dashed border-slate-200 hover:border-emerald-500 rounded-xl p-4 text-center bg-slate-50/50 cursor-pointer">
                  <Upload className="w-6 h-6 text-slate-400 mx-auto mb-1" />
                  <div className="text-slate-600 font-medium text-[12px]">Kéo thả file hoặc chọn file</div>
                  <div className="text-slate-400 text-[10.5px]">PDF, JPG, PNG (Tối đa 10MB)</div>
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Ghi chú</label>
                <textarea
                  rows={2}
                  placeholder="Nhập ghi chú (nếu có)..."
                  value={capitalForm.notes}
                  onChange={(e) => setCapitalForm({ ...capitalForm, notes: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-slate-700"
                ></textarea>
              </div>

              <div className="pt-2 flex justify-end gap-2 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setShowRecordCapitalModal(false)}
                  className="px-4 py-2 border border-slate-200 rounded-lg text-slate-600 font-bold hover:bg-slate-50"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-lg shadow-sm"
                >
                  Lưu
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 5-STEP WIZARD MODAL: THÊM XÃ VIÊN MỚI */}
      {/* ========================================================================= */}
      {showWizardModal && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fade-in">
          <div className="bg-white rounded-2xl max-w-2xl w-full shadow-modal overflow-hidden flex flex-col max-h-[88vh] my-auto">
            <div className="p-5 border-b border-slate-200 flex justify-between items-center bg-white shrink-0">
              <h3 className="font-extrabold text-slate-900 text-lg">Thêm xã viên mới</h3>
              <button onClick={() => setShowWizardModal(false)} className="text-slate-400 hover:text-slate-600 p-1">
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Stepper Header */}
            <div className="px-6 py-4 bg-slate-50/70 border-b border-slate-200/80 shrink-0">
              <div className="flex items-center justify-between text-center relative">
                {[1, 2, 3, 4, 5].map((s) => (
                  <React.Fragment key={s}>
                    <div 
                      onClick={() => handleStepHeaderClick(s)} 
                      className="flex flex-col items-center gap-1 z-10 cursor-pointer group"
                    >
                      <div
                        className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                          wizardStep === s
                            ? 'bg-emerald-600 text-white ring-4 ring-emerald-100'
                            : wizardStep > s
                            ? 'bg-emerald-600 text-white'
                            : 'bg-slate-200 text-slate-500 group-hover:bg-slate-300'
                        }`}
                      >
                        {wizardStep > s ? <CheckCircle2 className="w-5 h-5" /> : s}
                      </div>
                      <span className="text-[11px] font-bold text-slate-700 max-w-[70px] leading-tight group-hover:text-emerald-700">
                        {s === 1 && 'Thông tin cá nhân'}
                        {s === 2 && 'Thông tin liên hệ'}
                        {s === 3 && 'Thông tin vốn góp'}
                        {s === 4 && 'Phân chia lợi nhuận'}
                        {s === 5 && 'Xác nhận'}
                      </span>
                    </div>
                    {s < 5 && (
                      <div className={`flex-1 h-0.5 mx-2 ${wizardStep > s ? 'bg-emerald-600' : 'bg-slate-200'}`}></div>
                    )}
                  </React.Fragment>
                ))}
              </div>
            </div>

            {/* Step Body */}
            <div className="p-6 space-y-4 text-[12.8px] flex-1 overflow-y-auto custom-form-scrollbar">
              {/* WARNING ALERT BANNER FOR STEP ERRORS */}
              {wizardStepError && (
                <div className="p-3.5 bg-red-50 border border-red-200 text-red-700 rounded-xl text-[12.5px] font-bold flex items-center gap-2.5 shadow-xs animate-fade-in">
                  <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0" />
                  <span>{wizardStepError}</span>
                </div>
              )}
              {/* BƯỚC 1: THÔNG TIN CÁ NHÂN (MATCHING SCREENSHOT 1) */}
              {wizardStep === 1 && (
                <div className="space-y-3 animate-fade-in">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block font-bold text-slate-700 mb-1">Mã xã viên</label>
                      <input
                        type="text"
                        disabled
                        value="Tự động"
                        className="w-full px-3 py-2 bg-slate-100 border border-slate-200 rounded-lg text-slate-400 font-medium cursor-not-allowed text-[12.5px]"
                      />
                    </div>
                    <div>
                      <label className="block font-bold text-slate-700 mb-1">Họ và tên *</label>
                      <input
                        type="text"
                        required
                        placeholder="Nhập họ và tên"
                        value={wizardForm.full_name}
                        onChange={(e) => {
                          setWizardForm({ ...wizardForm, full_name: e.target.value });
                          if (fieldErrors.full_name) setFieldErrors({ ...fieldErrors, full_name: '' });
                        }}
                        className={`w-full px-3 py-2 border rounded-lg text-slate-800 focus:ring-1 focus:outline-none ${
                          fieldErrors.full_name ? 'border-red-500 bg-red-50/20 focus:ring-red-500' : 'border-slate-200 focus:ring-emerald-500'
                        }`}
                      />
                      {fieldErrors.full_name && <span className="text-red-500 text-[11px] font-bold mt-1 block">{fieldErrors.full_name}</span>}
                    </div>
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Giới tính *</label>
                    <div className="flex items-center gap-6 pt-1 font-medium text-slate-800">
                      {['Nam', 'Nữ', 'Khác'].map((g) => (
                        <label key={g} className="flex items-center gap-2 cursor-pointer">
                          <input
                            type="radio"
                            name="wizardGender"
                            checked={wizardForm.gender === g}
                            onChange={() => setWizardForm({ ...wizardForm, gender: g as any })}
                            className="accent-emerald-600"
                          />
                          {g}
                        </label>
                      ))}
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block font-bold text-slate-700 mb-1">Ngày sinh *</label>
                      <input
                        type="date"
                        required
                        value={wizardForm.dob}
                        onChange={(e) => {
                          setWizardForm({ ...wizardForm, dob: e.target.value });
                          if (fieldErrors.dob) setFieldErrors({ ...fieldErrors, dob: '' });
                        }}
                        className={`w-full px-3 py-2 border rounded-lg text-slate-700 ${
                          fieldErrors.dob ? 'border-red-500 bg-red-50/20' : 'border-slate-200'
                        }`}
                      />
                      {fieldErrors.dob && <span className="text-red-500 text-[11px] font-bold mt-1 block">{fieldErrors.dob}</span>}
                    </div>
                    <div>
                      <label className="block font-bold text-slate-700 mb-1">Số CCCD (12 chữ số) *</label>
                      <input
                        type="text"
                        required
                        placeholder="Nhập đúng 12 chữ số CCCD (Ví dụ: 049085001234)"
                        value={wizardForm.cccd}
                        onChange={(e) => {
                          setWizardForm({ ...wizardForm, cccd: e.target.value });
                          if (fieldErrors.cccd) setFieldErrors({ ...fieldErrors, cccd: '' });
                        }}
                        className={`w-full px-3 py-2 border rounded-lg font-mono font-bold ${
                          fieldErrors.cccd ? 'border-red-500 bg-red-50/20 text-red-900' : 'border-slate-200 text-slate-800'
                        }`}
                      />
                      {fieldErrors.cccd && <span className="text-red-500 text-[11px] font-bold mt-1 block">{fieldErrors.cccd}</span>}
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block font-bold text-slate-700 mb-1">Ngày cấp *</label>
                      <input
                        type="date"
                        required
                        value={wizardForm.cccd_issue_date}
                        onChange={(e) => {
                          setWizardForm({ ...wizardForm, cccd_issue_date: e.target.value });
                          if (fieldErrors.cccd_issue_date) setFieldErrors({ ...fieldErrors, cccd_issue_date: '' });
                        }}
                        className={`w-full px-3 py-2 border rounded-lg text-slate-700 ${
                          fieldErrors.cccd_issue_date ? 'border-red-500 bg-red-50/20' : 'border-slate-200'
                        }`}
                      />
                      {fieldErrors.cccd_issue_date && <span className="text-red-500 text-[11px] font-bold mt-1 block">{fieldErrors.cccd_issue_date}</span>}
                    </div>
                    <div>
                      <label className="block font-bold text-slate-700 mb-1">Nơi cấp CCCD *</label>
                      <input
                        type="text"
                        required
                        placeholder="Nhập nơi cấp CCCD (Ví dụ: Cục Cảnh sát QLHC về trật tự xã hội)"
                        value={wizardForm.cccd_issue_place}
                        onChange={(e) => {
                          setWizardForm({ ...wizardForm, cccd_issue_place: e.target.value });
                          if (fieldErrors.cccd_issue_place) setFieldErrors({ ...fieldErrors, cccd_issue_place: '' });
                        }}
                        className={`w-full px-3 py-2 border rounded-lg ${
                          fieldErrors.cccd_issue_place ? 'border-red-500 bg-red-50/20 text-red-900' : 'border-slate-200'
                        }`}
                      />
                      {fieldErrors.cccd_issue_place && <span className="text-red-500 text-[11px] font-bold mt-1 block">{fieldErrors.cccd_issue_place}</span>}
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block font-bold text-slate-700 mb-1">Trình độ học vấn</label>
                      <select
                        value={wizardForm.education_level}
                        onChange={(e) => setWizardForm({ ...wizardForm, education_level: e.target.value })}
                        className="w-full px-3 py-2 border border-slate-200 rounded-lg bg-white font-medium text-slate-800"
                      >
                        <option value="Chưa xác định">Chưa xác định</option>
                        <option value="THPT">THPT (12/12)</option>
                        <option value="Trung cấp">Trung cấp</option>
                        <option value="Cao đẳng">Cao đẳng</option>
                        <option value="Đại học">Đại học</option>
                      </select>
                    </div>

                    <div>
                      <label className="block font-bold text-slate-700 mb-1">Nghề nghiệp</label>
                      <input
                        type="text"
                        placeholder="Nhập nghề nghiệp"
                        value={wizardForm.occupation}
                        onChange={(e) => setWizardForm({ ...wizardForm, occupation: e.target.value })}
                        className="w-full px-3 py-2 border border-slate-200 rounded-lg"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* BƯỚC 2: THÔNG TIN LIÊN HỆ (MATCHING SCREENSHOT 2) */}
              {wizardStep === 2 && (
                <div className="space-y-4 animate-fade-in">
                  <div>
                    <h4 className="text-[11px] font-extrabold uppercase text-slate-400 tracking-wider mb-2">
                      ĐỊA CHỈ THƯỜNG TRÚ
                    </h4>
                    <div className="grid grid-cols-2 gap-4 mb-3">
                      <div>
                        <label className="block font-bold text-slate-700 mb-1">Tỉnh/Thành phố *</label>
                        <select
                          value={wizardForm.province}
                          onChange={(e) => setWizardForm({ ...wizardForm, province: e.target.value })}
                          className="w-full px-3 py-2 border border-slate-200 rounded-lg bg-white font-medium text-slate-800"
                        >
                          <option value="Lâm Đồng">Lâm Đồng</option>
                          <option value="Đắc Lắk">Đắc Lắk</option>
                          <option value="Gia Lai">Gia Lai</option>
                          <option value="Đồng Nai">Đồng Nai</option>
                        </select>
                      </div>

                      <div>
                        <label className="block font-bold text-slate-700 mb-1">Quận/Huyện *</label>
                        <select
                          value={wizardForm.district}
                          onChange={(e) => setWizardForm({ ...wizardForm, district: e.target.value })}
                          className="w-full px-3 py-2 border border-slate-200 rounded-lg bg-white font-medium text-slate-800"
                        >
                          <option value="Huyện Lâm Hà">Huyện Lâm Hà</option>
                          <option value="Huyện Đức Trọng">Huyện Đức Trọng</option>
                          <option value="Huyện Di Linh">Huyện Di Linh</option>
                        </select>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block font-bold text-slate-700 mb-1">Xã/Phường *</label>
                        <select
                          value={wizardForm.ward}
                          onChange={(e) => setWizardForm({ ...wizardForm, ward: e.target.value })}
                          className="w-full px-3 py-2 border border-slate-200 rounded-lg bg-white font-medium text-slate-800"
                        >
                          <option value="Xã Mê Linh">Xã Mê Linh</option>
                          <option value="Xã Tân Hà">Xã Tân Hà</option>
                          <option value="Xã Đinh Văn">Xã Đinh Văn</option>
                          <option value="Xã Liên Hà">Xã Liên Hà</option>
                        </select>
                      </div>

                      <div>
                        <label className="block font-bold text-slate-700 mb-1">Địa chỉ chi tiết *</label>
                        <input
                          type="text"
                          required
                          placeholder="Số nhà, thôn/xóm"
                          value={wizardForm.detail_address}
                          onChange={(e) => {
                            setWizardForm({ ...wizardForm, detail_address: e.target.value });
                            if (fieldErrors.detail_address) setFieldErrors({ ...fieldErrors, detail_address: '' });
                          }}
                          className={`w-full px-3 py-2 border rounded-lg ${
                            fieldErrors.detail_address ? 'border-red-500 bg-red-50/20 text-red-900' : 'border-slate-200'
                          }`}
                        />
                        {fieldErrors.detail_address && <span className="text-red-500 text-[11px] font-bold mt-1 block">{fieldErrors.detail_address}</span>}
                      </div>
                    </div>
                  </div>

                  <div className="pt-2 border-t border-slate-100">
                    <h4 className="text-[11px] font-extrabold uppercase text-slate-400 tracking-wider mb-2">
                      THÔNG TIN LIÊN HỆ
                    </h4>
                    <div className="grid grid-cols-2 gap-4 mb-3">
                      <div>
                        <label className="block font-bold text-slate-700 mb-1">Số điện thoại * (10 chữ số)</label>
                        <input
                          type="text"
                          required
                          placeholder="Ví dụ: 0987654321"
                          value={wizardForm.phone}
                          onChange={(e) => {
                            setWizardForm({ ...wizardForm, phone: e.target.value });
                            if (fieldErrors.phone) setFieldErrors({ ...fieldErrors, phone: '' });
                          }}
                          className={`w-full px-3 py-2 border rounded-lg font-bold ${
                            fieldErrors.phone ? 'border-red-500 bg-red-50/20 text-red-900' : 'border-slate-200 text-slate-900'
                          }`}
                        />
                        {fieldErrors.phone && <span className="text-red-500 text-[11px] font-bold mt-1 block">{fieldErrors.phone}</span>}
                      </div>

                      <div>
                        <label className="block font-bold text-slate-700 mb-1">Email</label>
                        <input
                          type="email"
                          placeholder="Nhập email"
                          value={wizardForm.email}
                          onChange={(e) => setWizardForm({ ...wizardForm, email: e.target.value })}
                          className="w-full px-3 py-2 border border-slate-200 rounded-lg"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block font-bold text-slate-700 mb-1">Zalo (nếu có)</label>
                        <input
                          type="text"
                          placeholder="SĐT Zalo"
                          value={wizardForm.zalo}
                          onChange={(e) => setWizardForm({ ...wizardForm, zalo: e.target.value })}
                          className="w-full px-3 py-2 border border-slate-200 rounded-lg"
                        />
                      </div>

                      <div>
                        <label className="block font-bold text-slate-700 mb-1">Facebook (nếu có)</label>
                        <input
                          type="text"
                          placeholder="facebook.com/..."
                          value={wizardForm.facebook}
                          onChange={(e) => setWizardForm({ ...wizardForm, facebook: e.target.value })}
                          className="w-full px-3 py-2 border border-slate-200 rounded-lg"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* BƯỚC 3: THÔNG TIN VỐN GÓP & CAM KẾT (UPGRADED BR-COOP-006) */}
              {wizardStep === 3 && (
                <div className="space-y-4 animate-fade-in">
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Hình thức góp vốn *</label>
                    <div className="flex items-center gap-6 pt-1 font-medium text-slate-800">
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="radio"
                          name="capitalFormRadio"
                          checked={wizardForm.capital_form === 'TIEN_MAT'}
                          onChange={() => setWizardForm({ ...wizardForm, capital_form: 'TIEN_MAT' })}
                          className="accent-emerald-600"
                        />
                        Tiền mặt
                      </label>
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="radio"
                          name="capitalFormRadio"
                          checked={wizardForm.capital_form === 'HIEN_VAT'}
                          onChange={() => setWizardForm({ ...wizardForm, capital_form: 'HIEN_VAT' })}
                          className="accent-emerald-600"
                        />
                        Hiện vật
                      </label>
                    </div>
                    {wizardForm.capital_form === 'HIEN_VAT' && (
                      <div className="mt-2.5 p-3 bg-amber-50 border border-amber-200 rounded-lg text-xs text-amber-800 flex items-start gap-2">
                        <i className="ri-information-line text-amber-600 text-sm mt-0.5"></i>
                        <div>
                          <p className="font-semibold mb-0.5">Lưu ý khi Góp vốn bằng Hiện vật (Theo Luật HTX 2023):</p>
                          <p className="leading-relaxed">
                            • Giá trị ghi nhận bên dưới là <strong>giá trị tài sản được quy đổi ra VNĐ</strong> dựa trên <strong>Biên bản định giá</strong> của Hội đồng định giá HTX hoặc Tổ chức thẩm định độc lập.<br/>
                            • Vui lòng tải lên <strong>Biên bản định giá / Biên bản bàn giao tài sản / Giấy tờ tài sản</strong> ở ô chứng từ bên dưới.
                          </p>
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block font-bold text-slate-700 mb-1">Vốn cam kết góp theo Điều lệ (VND) *</label>
                      <input
                        type="number"
                        step={1000000}
                        required
                        placeholder="Nhập tổng vốn đăng ký góp"
                        value={wizardForm.committed_capital}
                        onChange={(e) => {
                          const val = Number(e.target.value);
                          const isOneTime = wizardForm.contribution_method === 'Góp một lần';
                          setWizardForm({
                            ...wizardForm,
                            committed_capital: val,
                            initial_contributed_capital: isOneTime ? val : Math.min(val, wizardForm.initial_contributed_capital),
                          });
                        }}
                        className="w-full px-3 py-2 border border-slate-200 rounded-lg font-bold text-slate-900 text-base"
                      />
                    </div>

                    <div>
                      <label className="block font-bold text-slate-700 mb-1">Số tiền thực góp Đợt 1 (VND) *</label>
                      <input
                        type="number"
                        step={1000000}
                        required
                        placeholder="Số tiền thực nộp đợt 1"
                        disabled={wizardForm.contribution_method === 'Góp một lần'}
                        value={wizardForm.contribution_method === 'Góp một lần' ? wizardForm.committed_capital : wizardForm.initial_contributed_capital}
                        onChange={(e) => setWizardForm({ ...wizardForm, initial_contributed_capital: Number(e.target.value) })}
                        className={`w-full px-3 py-2 border rounded-lg font-bold text-emerald-800 text-base ${
                          wizardForm.contribution_method === 'Góp một lần' ? 'bg-slate-100 text-slate-600 cursor-not-allowed' : 'bg-white border-slate-200'
                        }`}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block font-bold text-slate-700 mb-1">Bằng chữ (Vốn cam kết)</label>
                      <input
                        type="text"
                        placeholder="Nhập bằng chữ"
                        value={wizardForm.capital_in_words}
                        onChange={(e) => setWizardForm({ ...wizardForm, capital_in_words: e.target.value })}
                        className="w-full px-3 py-2 border border-slate-200 rounded-lg text-slate-600"
                      />
                    </div>

                    <div>
                      <label className="block font-bold text-slate-700 mb-1">Ngày góp vốn (Đợt 1) *</label>
                      <input
                        type="date"
                        required
                        value={wizardForm.contribution_date}
                        onChange={(e) => {
                          const dateVal = e.target.value;
                          const d = new Date(dateVal || Date.now());
                          d.setMonth(d.getMonth() + 6);
                          const deadline = d.toISOString().split('T')[0];
                          setWizardForm({ ...wizardForm, contribution_date: dateVal, commitment_deadline: deadline });
                        }}
                        className="w-full px-3 py-2 border border-slate-200 rounded-lg"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block font-bold text-slate-700 mb-1">Phương thức góp vốn</label>
                      <select
                        value={wizardForm.contribution_method}
                        onChange={(e) => {
                          const method = e.target.value;
                          setWizardForm({
                            ...wizardForm,
                            contribution_method: method,
                            initial_contributed_capital: method === 'Góp một lần' ? wizardForm.committed_capital : wizardForm.initial_contributed_capital,
                          });
                        }}
                        className="w-full px-3 py-2 border border-slate-200 rounded-lg bg-white font-medium text-slate-800"
                      >
                        <option value="Góp một lần">Góp một lần (Nộp 100% ngay)</option>
                        <option value="Theo đợt">Theo đợt (Cam kết góp tiếp)</option>
                      </select>
                    </div>

                    <div>
                      <label className="block font-bold text-slate-700 mb-1">Thời hạn góp đủ (Hạn 6 tháng BR-COOP-006)</label>
                      <input
                        type="date"
                        value={wizardForm.commitment_deadline}
                        onChange={(e) => setWizardForm({ ...wizardForm, commitment_deadline: e.target.value })}
                        className="w-full px-3 py-2 border border-slate-200 rounded-lg font-medium text-slate-700"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Loại xã viên *</label>
                    <select
                      value={wizardForm.member_type}
                      onChange={(e) => setWizardForm({ ...wizardForm, member_type: e.target.value as any })}
                      className="w-full px-3 py-2 border border-slate-200 rounded-lg bg-white font-bold text-slate-900"
                    >
                      <option value="CHINH_THUC">Chính thức (Có quyền biểu quyết & Hưởng lợi nhuận)</option>
                      <option value="LIEN_KET_GOP_VON">Liên kết góp vốn (Không biểu quyết, Hưởng lợi nhuận)</option>
                      <option value="LIEN_KET_KHONG_GOP_VON">Liên kết không góp vốn (Tiêu thụ sản phẩm)</option>
                    </select>
                  </div>

                  {/* Card Tính toán Vốn tự động Realtime */}
                  {(() => {
                    const actualContributed = wizardForm.contribution_method === 'Góp một lần'
                      ? wizardForm.committed_capital
                      : wizardForm.initial_contributed_capital;
                    const remaining = Math.max(0, wizardForm.committed_capital - actualContributed);
                    const isFullyPaid = remaining === 0;

                    return (
                      <div className={`p-3.5 rounded-xl border space-y-1.5 text-xs ${isFullyPaid ? 'bg-emerald-50/80 border-emerald-200' : 'bg-amber-50/80 border-amber-200'}`}>
                        <div className="flex items-center justify-between font-extrabold">
                          <span className="text-slate-800">TỔNG HỢP NGHĨA VỤ VỐN GÓP:</span>
                          <span className={`px-2 py-0.5 rounded text-[11px] font-bold ${isFullyPaid ? 'bg-emerald-600 text-white' : 'bg-amber-600 text-white'}`}>
                            {isFullyPaid ? 'ĐÃ ĐỦ VỐN (CẤP GCN NGAY)' : 'CHƯA ĐỦ VỐN (THEO DÕI GÓP TIẾP)'}
                          </span>
                        </div>
                        <div className="grid grid-cols-3 gap-2 pt-1 border-t border-slate-200/60 font-medium text-slate-700">
                          <div>Cam kết: <strong className="text-slate-900 font-bold">{wizardForm.committed_capital.toLocaleString('vi-VN')} ₫</strong></div>
                          <div>Thực góp đợt 1: <strong className="text-emerald-700 font-bold">{actualContributed.toLocaleString('vi-VN')} ₫</strong></div>
                          <div>Còn nợ: <strong className={isFullyPaid ? 'text-emerald-700 font-bold' : 'text-rose-700 font-extrabold'}>{remaining.toLocaleString('vi-VN')} ₫</strong></div>
                        </div>
                        {!isFullyPaid && (
                          <div className="text-[11px] text-amber-800 font-medium italic pt-0.5">
                            * Số tiền còn nợ <strong>{remaining.toLocaleString('vi-VN')} ₫</strong> sẽ tự động chuyển sang trang <strong>Quản lý vốn góp</strong> để kế toán theo dõi thu bổ sung đợt 2, đợt 3 trước hạn <strong>{wizardForm.commitment_deadline}</strong>.
                          </div>
                        )}
                      </div>
                    );
                  })()}

                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Giấy biên nhận / Chứng từ (nếu có)</label>

                    <input
                      type="file"
                      ref={wizardFileInputRef}
                      onChange={handleWizardFileSelect}
                      accept=".pdf,.png,.jpg,.jpeg"
                      className="hidden"
                    />

                    {wizardUploadedFile ? (
                      <div className="border border-emerald-300 bg-emerald-50/70 rounded-xl p-3.5 flex items-center justify-between animate-fade-in shadow-xs">
                        <div
                          className="flex items-center gap-3 cursor-pointer group/file flex-1 mr-2"
                          onClick={() => handlePreviewWizardFile(wizardUploadedFile)}
                          title="Nhấn vào đây để xem trực tiếp nội dung file"
                        >
                          <div className="w-10 h-10 rounded-lg bg-emerald-600 group-hover/file:bg-emerald-700 text-white flex items-center justify-center font-bold shadow-xs shrink-0 transition-colors">
                            <FileText className="w-5 h-5" />
                          </div>
                          <div className="min-w-0 flex-1">
                            <div className="font-bold text-slate-800 text-[12.5px] group-hover/file:text-emerald-700 flex items-center gap-1.5 transition-colors">
                              <span className="truncate">{wizardUploadedFile.name}</span>
                              <Eye className="w-4 h-4 text-emerald-600 shrink-0" />
                            </div>
                            <div className="text-[11px] text-slate-500 flex items-center gap-1.5">
                              <span>{(wizardUploadedFile.size / 1024).toFixed(1)} KB</span>
                              <span>&bull;</span>
                              <span className="text-emerald-700 font-semibold underline">Nhấn để xem trực tiếp nội dung</span>
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-1 shrink-0">
                          <button
                            type="button"
                            onClick={() => handlePreviewWizardFile(wizardUploadedFile)}
                            className="px-2.5 py-1.5 bg-white hover:bg-emerald-100 text-emerald-800 font-bold text-[11.5px] border border-emerald-200 rounded-lg transition-colors flex items-center gap-1 shadow-2xs"
                            title="Xem nội dung file"
                          >
                            <Eye className="w-3.5 h-3.5" /> Xem file
                          </button>
                          <button
                            type="button"
                            onClick={() => setWizardUploadedFile(null)}
                            className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-white rounded-lg transition-colors"
                            title="Xóa file đính kèm"
                          >
                            <X className="w-5 h-5" />
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div
                        onClick={() => wizardFileInputRef.current?.click()}
                        onDragOver={(e) => e.preventDefault()}
                        onDrop={handleWizardFileDrop}
                        className="border-2 border-dashed border-slate-200 hover:border-emerald-500 rounded-xl p-5 text-center bg-slate-50/50 hover:bg-emerald-50/30 cursor-pointer transition-all group"
                      >
                        <Upload className="w-6 h-6 text-slate-400 group-hover:text-emerald-600 mx-auto mb-1.5 transition-colors" />
                        <div className="text-slate-600 font-medium text-[12px]">
                          Kéo thả file vào đây hoặc <span className="text-emerald-700 font-bold underline">Chọn file</span>
                        </div>
                        <div className="text-slate-400 text-[10.5px] mt-0.5">Định dạng: PDF, JPG, PNG (Tối đa 10MB)</div>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* BƯỚC 4: PHÂN CHIA LỢI NHUẬN (MATCHING SCREENSHOT 4) */}
              {wizardStep === 4 && (
                <div className="space-y-4 animate-fade-in">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block font-bold text-slate-700 mb-1">Tỷ lệ phân chia lợi nhuận *</label>
                      <div className="relative">
                        <input
                          type="number"
                          step={0.1}
                          required
                          value={wizardForm.profit_share_rate}
                          onChange={(e) => setWizardForm({ ...wizardForm, profit_share_rate: Number(e.target.value) })}
                          className="w-full px-3 py-2 pr-8 border border-slate-200 rounded-lg font-bold text-slate-900"
                        />
                        <span className="absolute right-3 top-1/2 -translate-y-1/2 font-bold text-slate-400">%</span>
                      </div>
                      <p className="text-[11px] text-slate-400 mt-1">Dựa trên tỷ lệ vốn góp và mức độ tham gia hoạt động của HTX</p>
                    </div>

                    <div>
                      <label className="block font-bold text-slate-700 mb-1">Hình thức nhận lợi nhuận *</label>
                      <div className="flex items-center gap-6 pt-2 font-medium text-slate-800">
                        <label className="flex items-center gap-2 cursor-pointer">
                          <input
                            type="radio"
                            name="payoutMethodRadio"
                            checked={wizardForm.payout_method === 'CASH'}
                            onChange={() => setWizardForm({ ...wizardForm, payout_method: 'CASH' })}
                            className="accent-emerald-600"
                          />
                          Bằng tiền mặt
                        </label>
                        <label className="flex items-center gap-2 cursor-pointer">
                          <input
                            type="radio"
                            name="payoutMethodRadio"
                            checked={wizardForm.payout_method === 'BANK_TRANSFER'}
                            onChange={() => setWizardForm({ ...wizardForm, payout_method: 'BANK_TRANSFER' })}
                            className="accent-emerald-600"
                          />
                          Chuyển khoản
                        </label>
                      </div>
                    </div>
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Ghi chú</label>
                    <textarea
                      rows={3}
                      placeholder="Ví dụ: Nhận lợi nhuận hằng năm vào cuối quý IV"
                      value={wizardForm.notes}
                      onChange={(e) => setWizardForm({ ...wizardForm, notes: e.target.value })}
                      className="w-full px-3 py-2 border border-slate-200 rounded-lg text-slate-700"
                    ></textarea>
                  </div>
                </div>
              )}

              {/* BƯỚC 5: XÁC NHẬN (MATCHING SCREENSHOT 5 EXACTLY) */}
              {wizardStep === 5 && (
                <div className="space-y-4 animate-fade-in text-[12px]">
                  <div className="grid grid-cols-2 gap-6 bg-slate-50/50 p-4 rounded-xl border border-slate-200/80">
                    {/* Column 1: THÔNG TIN CÁ NHÂN & THÔNG TIN LIÊN HỆ */}
                    <div className="space-y-4">
                      <div className="space-y-1.5">
                        <h4 className="font-extrabold text-[11px] uppercase text-slate-500 tracking-wider flex items-center gap-1.5">
                          <Users className="w-3.5 h-3.5 text-emerald-600" /> THÔNG TIN CÁ NHÂN
                        </h4>
                        <div className="space-y-1 pl-1">
                          <div className="flex justify-between"><span className="text-slate-500">Họ và tên:</span> <strong className="text-slate-900">{wizardForm.full_name || 'Nguyễn Thành Minh'}</strong></div>
                          <div className="flex justify-between"><span className="text-slate-500">Giới tính:</span> <span>{wizardForm.gender}</span></div>
                          <div className="flex justify-between"><span className="text-slate-500">Ngày sinh:</span> <span className="text-slate-400">{wizardForm.dob || '—'}</span></div>
                          <div className="flex justify-between"><span className="text-slate-500">Số CCCD:</span> <span className="text-slate-400 font-mono">{wizardForm.cccd || '—'}</span></div>
                          <div className="flex justify-between"><span className="text-slate-500">Ngày cấp:</span> <span className="text-slate-400">{wizardForm.cccd_issue_date || '—'}</span></div>
                          <div className="flex justify-between"><span className="text-slate-500">Nơi cấp:</span> <span className="text-slate-400">{wizardForm.cccd_issue_place || '—'}</span></div>
                          <div className="flex justify-between"><span className="text-slate-500">Trình độ học vấn:</span> <span>{wizardForm.education_level}</span></div>
                        </div>
                      </div>

                      <div className="space-y-1.5 pt-2 border-t border-slate-200/60">
                        <h4 className="font-extrabold text-[11px] uppercase text-slate-500 tracking-wider flex items-center gap-1.5">
                          <MapPin className="w-3.5 h-3.5 text-emerald-600" /> THÔNG TIN LIÊN HỆ
                        </h4>
                        <div className="space-y-1 pl-1">
                          <div className="flex justify-between"><span className="text-slate-500">Địa chỉ:</span> <span className="text-slate-800">{wizardForm.detail_address}, {wizardForm.ward}, {wizardForm.district}, {wizardForm.province}</span></div>
                          <div className="flex justify-between"><span className="text-slate-500">SĐT:</span> <strong className="font-mono text-slate-900">{wizardForm.phone || '03732937532'}</strong></div>
                          <div className="flex justify-between"><span className="text-slate-500">Email:</span> <span className="text-slate-400">{wizardForm.email || '—'}</span></div>
                          <div className="flex justify-between"><span className="text-slate-500">Zalo:</span> <span className="text-slate-400">{wizardForm.zalo || '—'}</span></div>
                        </div>
                      </div>
                    </div>

                    {/* Column 2: THÔNG TIN VỐN GÓP & PHÂN CHIA LỢI NHUẬN */}
                    <div className="space-y-4">
                      <div className="space-y-1.5">
                        <h4 className="font-extrabold text-[11px] uppercase text-slate-500 tracking-wider flex items-center gap-1.5">
                          <Wallet className="w-3.5 h-3.5 text-emerald-600" /> THÔNG TIN VỐN GÓP
                        </h4>
                        <div className="space-y-1 pl-1">
                          <div className="flex justify-between"><span className="text-slate-500">Loại xã viên:</span> <strong className="text-emerald-800">{MEMBER_TYPE_LABELS[wizardForm.member_type]}</strong></div>
                          <div className="flex justify-between"><span className="text-slate-500">Hình thức:</span> <span>{wizardForm.capital_form === 'TIEN_MAT' ? 'Tiền mặt' : 'Hiện vật'}</span></div>
                          <div className="flex justify-between"><span className="text-slate-500">Vốn cam kết:</span> <strong className="text-slate-900">{wizardForm.committed_capital.toLocaleString('vi-VN')} ₫</strong></div>
                          <div className="flex justify-between"><span className="text-slate-500">Thực góp Đợt 1:</span> <strong className="text-emerald-700">{(wizardForm.contribution_method === 'Góp một lần' ? wizardForm.committed_capital : wizardForm.initial_contributed_capital).toLocaleString('vi-VN')} ₫</strong></div>
                          <div className="flex justify-between"><span className="text-slate-500">Phương thức:</span> <span>{wizardForm.contribution_method}</span></div>
                          <div className="flex justify-between"><span className="text-slate-500">Hạn nộp đủ vốn:</span> <span className="font-mono">{wizardForm.commitment_deadline}</span></div>
                        </div>
                      </div>

                      <div className="space-y-1.5 pt-2 border-t border-slate-200/60">
                        <h4 className="font-extrabold text-[11px] uppercase text-slate-500 tracking-wider flex items-center gap-1.5">
                          <Calculator className="w-3.5 h-3.5 text-emerald-600" /> PHÂN CHIA LỢI NHUẬN
                        </h4>
                        <div className="space-y-1 pl-1">
                          <div className="flex justify-between"><span className="text-slate-500">Tỷ lệ phân chia:</span> <strong className="text-slate-900">{wizardForm.profit_share_rate}%</strong></div>
                          <div className="flex justify-between"><span className="text-slate-500">Hình thức nhận:</span> <span>{wizardForm.payout_method === 'CASH' ? 'Bằng tiền mặt' : 'Chuyển khoản'}</span></div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Status Notification Banner matching Screenshot 5 */}
                  <div className="p-3.5 bg-emerald-50/70 border border-emerald-200/80 rounded-xl text-[12px] text-slate-700 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span>Hồ sơ sẽ được lưu ở trạng thái</span>
                      <span className="pill-badge pill-amber text-[10.5px]">Chờ duyệt</span>
                      <span>— cần chủ tịch xác nhận trước khi chuyển sang Đang hoạt động.</span>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Stepper Footer Buttons */}
            <div className="p-4 border-t border-slate-200 flex justify-between items-center bg-slate-50 shrink-0">
              {wizardStep > 1 ? (
                <button
                  type="button"
                  onClick={() => setWizardStep((wizardStep - 1) as any)}
                  className="px-5 py-2 border border-slate-300 rounded-lg text-slate-700 font-bold hover:bg-white text-[12.8px]"
                >
                  Quay lại
                </button>
              ) : (
                <div></div>
              )}

              {wizardStep < 5 ? (
                <button
                  type="button"
                  onClick={handleNextStep}
                  className="px-6 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-lg text-[12.8px] shadow-sm transition-all"
                >
                  Tiếp tục
                </button>
              ) : (
                <button
                  type="button"
                  onClick={handleWizardSubmit}
                  className="px-6 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-lg text-[12.8px] shadow-sm transition-all"
                >
                  Xác nhận và lưu
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* REDESIGNED EDIT MEMBER MODAL */}
      {showEditModal && editingMember && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fade-in">
          <div className="bg-white rounded-2xl max-w-2xl w-full shadow-modal overflow-hidden flex flex-col max-h-[88vh] my-auto">
            {/* Header */}
            <div className="p-4 border-b border-slate-200 flex justify-between items-center bg-slate-50/80 shrink-0">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center font-bold text-sm border border-blue-200">
                  <Pencil className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <h3 className="font-extrabold text-slate-900 text-base flex items-center gap-2">
                    Cập nhật xã viên: {editingMember.full_name}
                    <span className="font-mono text-[11.5px] px-2 py-0.5 bg-slate-200 text-slate-700 rounded-md">
                      {editingMember.member_code}
                    </span>
                  </h3>
                  <p className="text-[11.5px] text-slate-500">Chỉnh sửa đầy đủ thông tin định danh, liên hệ, vốn góp &amp; nhận lợi nhuận</p>
                </div>
              </div>
              <button onClick={() => setShowEditModal(false)} className="text-slate-400 hover:text-slate-600 p-1 rounded-lg">
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Sub-Tabs Bar Inside Edit Modal */}
            <div className="bg-slate-100/60 border-b border-slate-200 px-4 pt-2 flex gap-2 text-[12.5px] font-bold overflow-x-auto shrink-0">
              <button
                type="button"
                onClick={() => setEditTab('personal')}
                className={`px-3 py-2 border-b-2 transition-all flex items-center gap-1.5 ${
                  editTab === 'personal'
                    ? 'border-blue-600 text-blue-700 font-extrabold bg-white rounded-t-lg'
                    : 'border-transparent text-slate-500 hover:text-slate-800'
                }`}
              >
                <Users className="w-3.5 h-3.5" /> 1. Cá nhân
              </button>
              <button
                type="button"
                onClick={() => setEditTab('contact')}
                className={`px-3 py-2 border-b-2 transition-all flex items-center gap-1.5 ${
                  editTab === 'contact'
                    ? 'border-blue-600 text-blue-700 font-extrabold bg-white rounded-t-lg'
                    : 'border-transparent text-slate-500 hover:text-slate-800'
                }`}
              >
                <MapPin className="w-3.5 h-3.5" /> 2. Liên hệ &amp; Địa chỉ
              </button>
              <button
                type="button"
                onClick={() => setEditTab('capital')}
                className={`px-3 py-2 border-b-2 transition-all flex items-center gap-1.5 ${
                  editTab === 'capital'
                    ? 'border-blue-600 text-blue-700 font-extrabold bg-white rounded-t-lg'
                    : 'border-transparent text-slate-500 hover:text-slate-800'
                }`}
              >
                <Wallet className="w-3.5 h-3.5" /> 3. Vốn góp &amp; Loại XV
              </button>
              <button
                type="button"
                onClick={() => setEditTab('profit')}
                className={`px-3 py-2 border-b-2 transition-all flex items-center gap-1.5 ${
                  editTab === 'profit'
                    ? 'border-blue-600 text-blue-700 font-extrabold bg-white rounded-t-lg'
                    : 'border-transparent text-slate-500 hover:text-slate-800'
                }`}
              >
                <Calculator className="w-3.5 h-3.5" /> 4. Lợi nhuận &amp; Ngân hàng
              </button>
            </div>

            {/* Form Body */}
            <form onSubmit={handleSaveEdit} className="flex flex-col flex-1 overflow-hidden min-h-0">
              <div className="p-6 space-y-4 text-[12.8px] flex-1 overflow-y-auto custom-form-scrollbar">
              {/* WARNING ALERT BANNER FOR EDIT ERRORS */}
              {editError && (
                <div className="p-3.5 bg-red-50 border border-red-200 text-red-700 rounded-xl text-[12.5px] font-bold flex items-center gap-2.5 shadow-xs animate-fade-in">
                  <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0" />
                  <span>{editError}</span>
                </div>
              )}

              {/* TAB 1: CÁ NHÂN */}
              {editTab === 'personal' && (
                <div className="space-y-4 animate-fade-in">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block font-bold text-slate-700 mb-1">Mã xã viên</label>
                      <input
                        type="text"
                        disabled
                        value={editingMember.member_code}
                        className="w-full px-3 py-2 bg-slate-100 border border-slate-200 rounded-lg text-slate-500 font-mono font-bold text-[12.5px]"
                      />
                    </div>
                    <div>
                      <label className="block font-bold text-slate-700 mb-1">Họ và tên *</label>
                      <input
                        type="text"
                        required
                        value={editingMember.full_name}
                        onChange={(e) => {
                          setEditingMember({ ...editingMember, full_name: e.target.value });
                          if (editFieldErrors.full_name) setEditFieldErrors({ ...editFieldErrors, full_name: '' });
                        }}
                        className={`w-full px-3 py-2 border rounded-lg font-bold focus:ring-1 focus:outline-none ${
                          editFieldErrors.full_name ? 'border-red-500 bg-red-50/20 text-red-900 focus:ring-red-500' : 'border-slate-200 text-slate-900 focus:ring-blue-500'
                        }`}
                      />
                      {editFieldErrors.full_name && <span className="text-red-500 text-[11px] font-bold mt-1 block">{editFieldErrors.full_name}</span>}
                    </div>
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Giới tính *</label>
                    <div className="flex items-center gap-6 pt-1 font-medium text-slate-800">
                      {['Nam', 'Nữ', 'Khác'].map((g) => (
                        <label key={g} className="flex items-center gap-2 cursor-pointer">
                          <input
                            type="radio"
                            name="editGender"
                            checked={editingMember.gender === g}
                            onChange={() => setEditingMember({ ...editingMember, gender: g as any })}
                            className="accent-blue-600"
                          />
                          {g}
                        </label>
                      ))}
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block font-bold text-slate-700 mb-1">Ngày sinh *</label>
                      <input
                        type="date"
                        required
                        value={editingMember.dob}
                        onChange={(e) => {
                          setEditingMember({ ...editingMember, dob: e.target.value });
                          if (editFieldErrors.dob) setEditFieldErrors({ ...editFieldErrors, dob: '' });
                        }}
                        className={`w-full px-3 py-2 border rounded-lg text-slate-700 ${
                          editFieldErrors.dob ? 'border-red-500 bg-red-50/20' : 'border-slate-200'
                        }`}
                      />
                      {editFieldErrors.dob && <span className="text-red-500 text-[11px] font-bold mt-1 block">{editFieldErrors.dob}</span>}
                    </div>
                    <div>
                      <label className="block font-bold text-slate-700 mb-1">Số CCCD (12 chữ số) *</label>
                      <input
                        type="text"
                        required
                        placeholder="Nhập đúng 12 chữ số CCCD (Ví dụ: 049085001234)"
                        value={editingMember.cccd}
                        onChange={(e) => {
                          setEditingMember({ ...editingMember, cccd: e.target.value });
                          if (editFieldErrors.cccd) setEditFieldErrors({ ...editFieldErrors, cccd: '' });
                        }}
                        className={`w-full px-3 py-2 border rounded-lg font-mono font-bold ${
                          editFieldErrors.cccd ? 'border-red-500 bg-red-50/20 text-red-900' : 'border-slate-200 text-slate-900'
                        }`}
                      />
                      {editFieldErrors.cccd && <span className="text-red-500 text-[11px] font-bold mt-1 block">{editFieldErrors.cccd}</span>}
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block font-bold text-slate-700 mb-1">Ngày cấp *</label>
                      <input
                        type="date"
                        required
                        value={editingMember.cccd_issue_date}
                        onChange={(e) => {
                          setEditingMember({ ...editingMember, cccd_issue_date: e.target.value });
                          if (editFieldErrors.cccd_issue_date) setEditFieldErrors({ ...editFieldErrors, cccd_issue_date: '' });
                        }}
                        className={`w-full px-3 py-2 border rounded-lg text-slate-700 ${
                          editFieldErrors.cccd_issue_date ? 'border-red-500 bg-red-50/20' : 'border-slate-200'
                        }`}
                      />
                      {editFieldErrors.cccd_issue_date && <span className="text-red-500 text-[11px] font-bold mt-1 block">{editFieldErrors.cccd_issue_date}</span>}
                    </div>
                    <div>
                      <label className="block font-bold text-slate-700 mb-1">Nơi cấp CCCD *</label>
                      <input
                        type="text"
                        required
                        value={editingMember.cccd_issue_place}
                        onChange={(e) => {
                          setEditingMember({ ...editingMember, cccd_issue_place: e.target.value });
                          if (editFieldErrors.cccd_issue_place) setEditFieldErrors({ ...editFieldErrors, cccd_issue_place: '' });
                        }}
                        className={`w-full px-3 py-2 border rounded-lg ${
                          editFieldErrors.cccd_issue_place ? 'border-red-500 bg-red-50/20 text-red-900' : 'border-slate-200'
                        }`}
                      />
                      {editFieldErrors.cccd_issue_place && <span className="text-red-500 text-[11px] font-bold mt-1 block">{editFieldErrors.cccd_issue_place}</span>}
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block font-bold text-slate-700 mb-1">Trình độ học vấn</label>
                      <select
                        value={editingMember.education_level}
                        onChange={(e) => setEditingMember({ ...editingMember, education_level: e.target.value })}
                        className="w-full px-3 py-2 border border-slate-200 rounded-lg bg-white font-medium text-slate-800"
                      >
                        <option value="Chưa xác định">Chưa xác định</option>
                        <option value="THPT">THPT (12/12)</option>
                        <option value="Trung cấp">Trung cấp</option>
                        <option value="Cao đẳng">Cao đẳng</option>
                        <option value="Đại học">Đại học</option>
                      </select>
                    </div>

                    <div>
                      <label className="block font-bold text-slate-700 mb-1">Nghề nghiệp</label>
                      <input
                        type="text"
                        value={editingMember.occupation}
                        onChange={(e) => setEditingMember({ ...editingMember, occupation: e.target.value })}
                        className="w-full px-3 py-2 border border-slate-200 rounded-lg"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 2: LIÊN HỆ & ĐỊA CHỈ */}
              {editTab === 'contact' && (
                <div className="space-y-4 animate-fade-in">
                  <div>
                    <h4 className="text-[11px] font-extrabold uppercase text-slate-400 tracking-wider mb-2">
                      ĐỊA CHỈ THƯỜNG TRÚ
                    </h4>
                    <div className="grid grid-cols-2 gap-4 mb-3">
                      <div>
                        <label className="block font-bold text-slate-700 mb-1">Tỉnh/Thành phố *</label>
                        <select
                          value={editingMember.province}
                          onChange={(e) => setEditingMember({ ...editingMember, province: e.target.value })}
                          className="w-full px-3 py-2 border border-slate-200 rounded-lg bg-white font-medium text-slate-800"
                        >
                          <option value="Lâm Đồng">Lâm Đồng</option>
                          <option value="Đắc Lắk">Đắc Lắk</option>
                          <option value="Gia Lai">Gia Lai</option>
                          <option value="Đồng Nai">Đồng Nai</option>
                        </select>
                      </div>

                      <div>
                        <label className="block font-bold text-slate-700 mb-1">Quận/Huyện *</label>
                        <select
                          value={editingMember.district}
                          onChange={(e) => setEditingMember({ ...editingMember, district: e.target.value })}
                          className="w-full px-3 py-2 border border-slate-200 rounded-lg bg-white font-medium text-slate-800"
                        >
                          <option value="Huyện Lâm Hà">Huyện Lâm Hà</option>
                          <option value="Huyện Đức Trọng">Huyện Đức Trọng</option>
                          <option value="Huyện Di Linh">Huyện Di Linh</option>
                        </select>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block font-bold text-slate-700 mb-1">Xã/Phường *</label>
                        <select
                          value={editingMember.ward}
                          onChange={(e) => setEditingMember({ ...editingMember, ward: e.target.value })}
                          className="w-full px-3 py-2 border border-slate-200 rounded-lg bg-white font-medium text-slate-800"
                        >
                          <option value="Xã Mê Linh">Xã Mê Linh</option>
                          <option value="Xã Tân Hà">Xã Tân Hà</option>
                          <option value="Xã Đinh Văn">Xã Đinh Văn</option>
                          <option value="Xã Liên Hà">Xã Liên Hà</option>
                        </select>
                      </div>

                      <div>
                        <label className="block font-bold text-slate-700 mb-1">Địa chỉ chi tiết *</label>
                        <input
                          type="text"
                          required
                          placeholder="Số nhà, thôn/xóm"
                          value={editingMember.detail_address}
                          onChange={(e) => {
                            setEditingMember({ ...editingMember, detail_address: e.target.value });
                            if (editFieldErrors.detail_address) setEditFieldErrors({ ...editFieldErrors, detail_address: '' });
                          }}
                          className={`w-full px-3 py-2 border rounded-lg ${
                            editFieldErrors.detail_address ? 'border-red-500 bg-red-50/20 text-red-900' : 'border-slate-200'
                          }`}
                        />
                        {editFieldErrors.detail_address && <span className="text-red-500 text-[11px] font-bold mt-1 block">{editFieldErrors.detail_address}</span>}
                      </div>
                    </div>
                  </div>

                  <div className="pt-2 border-t border-slate-100">
                    <h4 className="text-[11px] font-extrabold uppercase text-slate-400 tracking-wider mb-2">
                      THÔNG TIN LIÊN HỆ
                    </h4>
                    <div className="grid grid-cols-2 gap-4 mb-3">
                      <div>
                        <label className="block font-bold text-slate-700 mb-1">Số điện thoại * (10 chữ số)</label>
                        <input
                          type="text"
                          required
                          placeholder="Ví dụ: 0987654321"
                          value={editingMember.phone}
                          onChange={(e) => {
                            setEditingMember({ ...editingMember, phone: e.target.value });
                            if (editFieldErrors.phone) setEditFieldErrors({ ...editFieldErrors, phone: '' });
                          }}
                          className={`w-full px-3 py-2 border rounded-lg font-bold ${
                            editFieldErrors.phone ? 'border-red-500 bg-red-50/20 text-red-900' : 'border-slate-200 text-slate-900'
                          }`}
                        />
                        {editFieldErrors.phone && <span className="text-red-500 text-[11px] font-bold mt-1 block">{editFieldErrors.phone}</span>}
                      </div>

                      <div>
                        <label className="block font-bold text-slate-700 mb-1">Email</label>
                        <input
                          type="email"
                          value={editingMember.email}
                          onChange={(e) => setEditingMember({ ...editingMember, email: e.target.value })}
                          className="w-full px-3 py-2 border border-slate-200 rounded-lg"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block font-bold text-slate-700 mb-1">Zalo (nếu có)</label>
                        <input
                          type="text"
                          value={editingMember.zalo}
                          onChange={(e) => setEditingMember({ ...editingMember, zalo: e.target.value })}
                          className="w-full px-3 py-2 border border-slate-200 rounded-lg"
                        />
                      </div>

                      <div>
                        <label className="block font-bold text-slate-700 mb-1">Facebook (nếu có)</label>
                        <input
                          type="text"
                          value={editingMember.facebook}
                          onChange={(e) => setEditingMember({ ...editingMember, facebook: e.target.value })}
                          className="w-full px-3 py-2 border border-slate-200 rounded-lg"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 3: VỐN GÓP & LOẠI XÃ VIÊN */}
              {editTab === 'capital' && (
                <div className="space-y-4 animate-fade-in">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block font-bold text-slate-700 mb-1">Loại xã viên *</label>
                      <select
                        value={editingMember.member_type}
                        onChange={(e) => setEditingMember({ ...editingMember, member_type: e.target.value as any })}
                        className="w-full px-3 py-2 border border-slate-200 rounded-lg bg-white font-bold text-emerald-800"
                      >
                        <option value="CHINH_THUC">1. Chính thức (Biểu quyết + Vốn góp)</option>
                        <option value="LIEN_KET_GOP_VON">2. Liên kết góp vốn (Không biểu quyết)</option>
                        <option value="LIEN_KET_KHONG_GOP_VON">3. Liên kết không góp vốn (Tiêu thụ)</option>
                      </select>
                    </div>

                    <div>
                      <label className="block font-bold text-slate-700 mb-1">Trạng thái hồ sơ *</label>
                      <select
                        value={editingMember.status}
                        onChange={(e) => setEditingMember({ ...editingMember, status: e.target.value as any })}
                        className="w-full px-3 py-2 border border-slate-200 rounded-lg bg-white font-bold text-slate-900"
                      >
                        <option value="ACTIVE">Đang hoạt động</option>
                        <option value="PENDING">Chờ duyệt</option>
                        <option value="INACTIVE">Ngừng hoạt động</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Hình thức góp vốn *</label>
                    <div className="flex items-center gap-6 pt-1 font-medium text-slate-800">
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="radio"
                          name="editCapitalFormRadio"
                          checked={editingMember.capital_form === 'TIEN_MAT'}
                          onChange={() => setEditingMember({ ...editingMember, capital_form: 'TIEN_MAT' })}
                          className="accent-blue-600"
                        />
                        Tiền mặt
                      </label>
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="radio"
                          name="editCapitalFormRadio"
                          checked={editingMember.capital_form === 'HIEN_VAT'}
                          onChange={() => setEditingMember({ ...editingMember, capital_form: 'HIEN_VAT' })}
                          className="accent-blue-600"
                        />
                        Hiện vật
                      </label>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block font-bold text-slate-700 mb-1">Vốn cam kết (VND) *</label>
                      <input
                        type="number"
                        step={1000000}
                        required
                        value={editingMember.committed_capital || editingMember.total_capital_contributed}
                        onChange={(e) => setEditingMember({ ...editingMember, committed_capital: Number(e.target.value) })}
                        className="w-full px-3 py-2 border border-slate-200 rounded-lg font-bold text-slate-900 text-base"
                      />
                    </div>

                    <div>
                      <label className="block font-bold text-slate-700 mb-1">Đã thực góp (VND) *</label>
                      <input
                        type="number"
                        step={1000000}
                        required
                        value={editingMember.contributed_capital || editingMember.total_capital_contributed}
                        onChange={(e) => setEditingMember({ ...editingMember, contributed_capital: Number(e.target.value), total_capital_contributed: Number(e.target.value) })}
                        className="w-full px-3 py-2 border border-slate-200 rounded-lg font-bold text-emerald-800 text-base"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block font-bold text-slate-700 mb-1">Bằng chữ</label>
                      <input
                        type="text"
                        value={editingMember.capital_in_words || ''}
                        onChange={(e) => setEditingMember({ ...editingMember, capital_in_words: e.target.value })}
                        className="w-full px-3 py-2 border border-slate-200 rounded-lg text-slate-700"
                      />
                    </div>

                    <div>
                      <label className="block font-bold text-slate-700 mb-1">Ngày góp vốn *</label>
                      <input
                        type="date"
                        required
                        value={editingMember.contribution_date || editingMember.join_date}
                        onChange={(e) => setEditingMember({ ...editingMember, contribution_date: e.target.value })}
                        className="w-full px-3 py-2 border border-slate-200 rounded-lg text-slate-700"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 4: LỢI NHUẬN & NGÂN HÀNG */}
              {editTab === 'profit' && (
                <div className="space-y-4 animate-fade-in">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block font-bold text-slate-700 mb-1">Tỷ lệ phân chia lợi nhuận *</label>
                      <div className="relative">
                        <input
                          type="number"
                          step={0.1}
                          required
                          value={editingMember.profit_share_rate}
                          onChange={(e) => setEditingMember({ ...editingMember, profit_share_rate: Number(e.target.value) })}
                          className="w-full px-3 py-2 pr-8 border border-slate-200 rounded-lg font-bold text-slate-900"
                        />
                        <span className="absolute right-3 top-1/2 -translate-y-1/2 font-bold text-slate-400">%</span>
                      </div>
                    </div>

                    <div>
                      <label className="block font-bold text-slate-700 mb-1">Hình thức nhận lợi nhuận *</label>
                      <div className="flex items-center gap-6 pt-2 font-medium text-slate-800">
                        <label className="flex items-center gap-2 cursor-pointer">
                          <input
                            type="radio"
                            name="editPayoutMethodRadio"
                            checked={editingMember.payout_method === 'CASH'}
                            onChange={() => setEditingMember({ ...editingMember, payout_method: 'CASH' })}
                            className="accent-blue-600"
                          />
                          Bằng tiền mặt
                        </label>
                        <label className="flex items-center gap-2 cursor-pointer">
                          <input
                            type="radio"
                            name="editPayoutMethodRadio"
                            checked={editingMember.payout_method === 'BANK_TRANSFER'}
                            onChange={() => setEditingMember({ ...editingMember, payout_method: 'BANK_TRANSFER' })}
                            className="accent-blue-600"
                          />
                          Chuyển khoản
                        </label>
                      </div>
                    </div>
                  </div>

                  <div className="pt-2 border-t border-slate-100 space-y-3">
                    <h4 className="text-[11px] font-extrabold uppercase text-slate-400 tracking-wider">
                      THÔNG TIN TÀI KHOẢN NGÂN HÀNG
                    </h4>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block font-bold text-slate-700 mb-1">Tên Ngân hàng</label>
                        <input
                          type="text"
                          placeholder="Ví dụ: Agribank, Vietcombank..."
                          value={editingMember.bank_name || ''}
                          onChange={(e) => setEditingMember({ ...editingMember, bank_name: e.target.value })}
                          className="w-full px-3 py-2 border border-slate-200 rounded-lg font-medium"
                        />
                      </div>

                      <div>
                        <label className="block font-bold text-slate-700 mb-1">Số tài khoản</label>
                        <input
                          type="text"
                          placeholder="Nhập STK ngân hàng"
                          value={editingMember.bank_account || ''}
                          onChange={(e) => setEditingMember({ ...editingMember, bank_account: e.target.value })}
                          className="w-full px-3 py-2 border border-slate-200 rounded-lg font-mono font-bold"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block font-bold text-slate-700 mb-1">Tên chủ tài khoản</label>
                      <input
                        type="text"
                        placeholder="Tên in trên thẻ ngân hàng"
                        value={editingMember.account_holder || ''}
                        onChange={(e) => setEditingMember({ ...editingMember, account_holder: e.target.value })}
                        className="w-full px-3 py-2 border border-slate-200 rounded-lg font-bold"
                      />
                    </div>

                    <div>
                      <label className="block font-bold text-slate-700 mb-1">Ghi chú</label>
                      <textarea
                        rows={2}
                        placeholder="Ghi chú quá trình tham gia hoặc nhận lợi nhuận..."
                        value={editingMember.notes || ''}
                        onChange={(e) => setEditingMember({ ...editingMember, notes: e.target.value })}
                        className="w-full px-3 py-2 border border-slate-200 rounded-lg text-slate-700"
                      ></textarea>
                    </div>
                  </div>
                </div>
              )}
            </div>

              {/* Modal Footer */}
              <div className="p-4 border-t border-slate-200 flex justify-between items-center bg-slate-50 shrink-0">
                <button
                  type="button"
                  onClick={() => setShowEditModal(false)}
                  className="px-5 py-2 border border-slate-300 rounded-lg text-slate-700 font-bold hover:bg-white text-[12.8px]"
                >
                  Hủy bỏ
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg text-[12.8px] shadow-sm inline-flex items-center gap-1.5 transition-all"
                >
                  <Save className="w-4 h-4" /> Lưu thay đổi
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* DELETE / DEACTIVATE CONFIRMATION MODAL */}
      {showDeleteModal && deletingMember && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fade-in">
          <div className="bg-white rounded-2xl max-w-md w-full shadow-modal overflow-hidden p-6 space-y-4 text-center">
            <div className="w-14 h-14 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center mx-auto border border-rose-200">
              <UserX className="w-7 h-7" />
            </div>
            <div>
              <h3 className="text-lg font-extrabold text-slate-900">Xác nhận ngưng hoạt động xã viên?</h3>
              <p className="text-[13px] text-slate-600 mt-1">
                Chuyển trạng thái cho xã viên <strong className="text-slate-900">{deletingMember.full_name}</strong> (<span className="font-mono">{deletingMember.member_code}</span>) sang <strong>"Đã ngưng hoạt động / Đã rút khỏi HTX"</strong>.
              </p>
            </div>

            {(deletingMember.current_debt || 0) > 0 ? (
              <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-left text-[12px] space-y-1">
                <div className="flex items-center gap-1.5 font-bold text-red-800">
                  <AlertTriangle className="w-4 h-4 text-red-600 shrink-0" /> KHÔNG THỂ NGƯNG HOẠT ĐỘNG (DƯ NỢ CÔNG NỢ)
                </div>
                <p className="text-slate-700">
                  Xã viên <strong>{deletingMember.full_name}</strong> hiện còn dư nợ <strong className="text-red-700 font-extrabold">{(deletingMember.current_debt || 0).toLocaleString('vi-VN')} ₫</strong> tại HTX.
                </p>
                <p className="text-[11px] text-red-700 font-medium italic pt-1 border-t border-red-200/60 mt-1">
                  💡 Theo Luật Hợp tác xã 2023, xã viên phải hoàn tất nghĩa vụ tài chính/thu hồi công nợ trước khi chấm dứt tư cách thành viên.
                </p>
              </div>
            ) : (
              <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl text-left text-[12px] text-slate-600 space-y-1">
                <p className="font-bold text-slate-800">ℹ️ Lưu trữ dữ liệu an toàn (Soft Delete):</p>
                <p>Hệ thống không xóa vĩnh viễn dữ liệu để đảm bảo toàn vẹn chứng từ kế toán & lịch sử vốn góp.</p>
                <p>Bạn có thể tra cứu danh sách xã viên đã ngưng hoạt động bất cứ lúc nào trong bộ lọc <strong>"Trạng thái: Đã ngưng hoạt động"</strong>.</p>
              </div>
            )}

            <div className="pt-2 flex justify-center gap-3">
              <button onClick={() => setShowDeleteModal(false)} className="px-5 py-2 border border-slate-300 rounded-lg text-slate-700 font-bold hover:bg-slate-50 text-[12.8px]">
                Hủy bỏ
              </button>
              {(deletingMember.current_debt || 0) > 0 ? (
                <button disabled className="px-5 py-2 bg-slate-200 text-slate-400 font-bold rounded-lg text-[12.8px] cursor-not-allowed inline-flex items-center gap-1.5">
                  <UserX className="w-4 h-4" /> Không thể ngưng (Còn dư nợ)
                </button>
              ) : (
                <button onClick={handleConfirmDelete} className="px-5 py-2 bg-rose-600 hover:bg-rose-700 text-white font-bold rounded-lg text-[12.8px] shadow-sm inline-flex items-center gap-1.5">
                  <UserX className="w-4 h-4" /> Xác nhận ngưng hoạt động
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* APPROVE MEMBER CONFIRMATION MODAL */}
      {showApproveModal && approvingMember && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fade-in">
          <div className="bg-white rounded-2xl max-w-md w-full shadow-modal overflow-hidden p-6 space-y-4 text-center">
            <div className="w-14 h-14 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center mx-auto border border-emerald-200">
              <UserCheck className="w-7 h-7" />
            </div>
            <div>
              <h3 className="text-lg font-extrabold text-slate-900">Phê duyệt xã viên mới</h3>
              <p className="text-[13px] text-slate-600 mt-1">
                Xác nhận phê duyệt hồ sơ cho xã viên <strong className="text-slate-900">{approvingMember.full_name}</strong> (<span className="font-mono">{approvingMember.member_code}</span>)?
              </p>
            </div>

            <div className="p-3 bg-emerald-50/70 border border-emerald-200/80 rounded-xl text-[12px] text-slate-700 text-left space-y-1">
              <div className="flex justify-between"><span className="text-slate-500">Loại xã viên:</span> <strong>{MEMBER_TYPE_LABELS[approvingMember.member_type]}</strong></div>
              <div className="flex justify-between"><span className="text-slate-500">Vốn góp:</span> <strong className="text-emerald-800">{(approvingMember.committed_capital || approvingMember.total_capital_contributed)?.toLocaleString('vi-VN')} ₫</strong></div>
              <div className="flex justify-between"><span className="text-slate-500">SĐT liên hệ:</span> <span className="font-mono">{approvingMember.phone}</span></div>
            </div>

            <p className="text-[11.5px] text-slate-400 italic">
              Sau khi phê duyệt, xã viên sẽ chính thức chuyển sang trạng thái <strong>Đang hoạt động</strong> và có quyền lợi trong HTX.
            </p>

            <div className="pt-2 flex justify-center gap-3">
              <button
                onClick={() => setShowApproveModal(false)}
                className="px-5 py-2 border border-slate-300 rounded-lg text-slate-700 font-bold hover:bg-slate-50 text-[12.8px]"
              >
                Hủy bỏ
              </button>
              <button
                onClick={handleConfirmApprove}
                className="px-6 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-lg text-[12.8px] shadow-sm inline-flex items-center gap-1.5 transition-all"
              >
                <UserCheck className="w-4 h-4" /> Đồng ý phê duyệt
              </button>
            </div>
          </div>
        </div>
      )}

      {/* PENDING CAPITAL TRANSACTIONS APPROVAL MODAL */}
      {showPendingCapitalModal && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fade-in">
          <div className="bg-white rounded-2xl max-w-3xl w-full shadow-modal overflow-hidden flex flex-col max-h-[88vh] my-auto">
            <div className="p-4 border-b border-slate-200 flex justify-between items-center bg-slate-50 shrink-0">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center font-bold border border-amber-200">
                  <ClockIcon className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-extrabold text-slate-900 text-base">
                    Giao dịch Góp vốn chờ Phê duyệt ({transactions.filter((t) => t.status === 'PENDING').length})
                  </h3>
                  <p className="text-[11.5px] text-slate-500">
                    Danh sách chứng từ nộp vốn mới của xã viên chờ Kế toán/HĐQT đối soát và phê duyệt nhập quỹ
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowPendingCapitalModal(false)}
                className="text-slate-400 hover:text-slate-600 p-1.5 hover:bg-slate-100 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-5 space-y-4 flex-1 overflow-y-auto custom-form-scrollbar">
              {transactions.filter((t) => t.status === 'PENDING').length === 0 ? (
                <div className="text-center py-10 space-y-2">
                  <CheckCircle2 className="w-12 h-12 text-emerald-500 mx-auto" />
                  <p className="font-extrabold text-slate-800 text-sm">Tất cả giao dịch góp vốn đã được phê duyệt thành công!</p>
                  <p className="text-[12px] text-slate-400">Không còn chứng từ góp vốn nào ở trạng thái chờ duyệt.</p>
                </div>
              ) : (
                <div className="overflow-x-auto border border-slate-200 rounded-xl">
                  <table className="w-full text-left border-collapse text-[12.5px]">
                    <thead>
                      <tr className="border-b border-slate-200 bg-slate-50 text-[11px] uppercase tracking-wider text-slate-500 font-extrabold">
                        <th className="py-2.5 px-3">Mã CT</th>
                        <th className="py-2.5 px-3">Xã viên</th>
                        <th className="py-2.5 px-3 text-right">Số tiền góp</th>
                        <th className="py-2.5 px-3">Hình thức</th>
                        <th className="py-2.5 px-3">Ngày nộp</th>
                        <th className="py-2.5 px-3">Chứng từ</th>
                        <th className="py-2.5 px-3 text-center">Thao tác</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {transactions
                        .filter((t) => t.status === 'PENDING')
                        .map((tx) => (
                          <tr key={tx.id} className="hover:bg-slate-50/80 transition-colors">
                            <td className="py-3 px-3 font-mono font-bold text-slate-700">{tx.transaction_code}</td>
                            <td className="py-3 px-3">
                              <strong className="text-slate-900 block">{tx.member_name}</strong>
                              <span className="text-[11px] font-mono text-slate-400">{tx.member_code}</span>
                            </td>
                            <td className="py-3 px-3 text-right font-black text-emerald-700">
                              {tx.amount.toLocaleString('vi-VN')} ₫
                            </td>
                            <td className="py-3 px-3">
                              {tx.payment_method === 'CASH' ? (
                                <span className="pill-badge pill-green text-[10px]">Tiền mặt</span>
                              ) : (
                                <span className="pill-badge pill-blue text-[10px]">Chuyển khoản</span>
                              )}
                            </td>
                            <td className="py-3 px-3 text-slate-600 font-mono text-[11.8px]">{tx.contribution_date}</td>
                            <td className="py-3 px-3">
                              {tx.receipt_file_name ? (
                                <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-slate-100 text-slate-700 font-mono text-[11px] rounded border border-slate-200">
                                  <FileText className="w-3 h-3 text-emerald-600" /> {tx.receipt_file_name}
                                </span>
                              ) : (
                                <span className="text-slate-400 text-[11px]">Không có file</span>
                              )}
                            </td>
                            <td className="py-3 px-3 text-center">
                              <div className="inline-flex items-center justify-center gap-1.5">
                                <button
                                  onClick={() => handleApproveCapitalTx(tx.id)}
                                  className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold rounded-md text-[11.5px] inline-flex items-center gap-1 shadow-xs transition-all"
                                  title="Phê duyệt giao dịch nộp vốn này"
                                >
                                  <CheckCircle2 className="w-3.5 h-3.5" /> Duyệt
                                </button>
                                <button
                                  onClick={() => handleRejectCapitalTx(tx.id)}
                                  className="px-2.5 py-1 bg-rose-50 hover:bg-rose-100 text-rose-700 font-extrabold rounded-md text-[11.5px] border border-rose-200 transition-colors"
                                  title="Hủy/Từ chối giao dịch"
                                >
                                  Từ chối
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            <div className="p-4 border-t border-slate-200 bg-slate-50 flex justify-end shrink-0">
              <button
                onClick={() => setShowPendingCapitalModal(false)}
                className="px-5 py-2 border border-slate-300 rounded-lg text-slate-700 font-bold hover:bg-white text-[12.8px]"
              >
                Đóng cửa sổ
              </button>
            </div>
          </div>
        </div>
      )}

      {/* FILE PREVIEW MODAL */}
      {previewFileModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fade-in">
          <div className="bg-white rounded-2xl max-w-4xl w-full shadow-modal overflow-hidden flex flex-col max-h-[90vh]">
            {/* Modal Header */}
            <div className="p-4 border-b border-slate-200 flex items-center justify-between bg-slate-50 shrink-0">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-emerald-600 text-white flex items-center justify-center font-bold shrink-0">
                  <FileText className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-extrabold text-[14.5px] text-slate-900 truncate max-w-md" title={previewFileModal.name}>
                    {previewFileModal.name}
                  </h3>
                  <p className="text-[11px] text-slate-500">
                    {previewFileModal.size ? (typeof previewFileModal.size === 'number' ? `${(previewFileModal.size / 1024).toFixed(1)} KB` : previewFileModal.size) : 'File chứng từ đính kèm'} &bull; Đang xem trước nội dung
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <a
                  href={previewFileModal.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-3 py-1.5 border border-slate-200 hover:bg-white text-slate-700 font-bold text-[12px] rounded-lg inline-flex items-center gap-1.5 transition-colors shadow-2xs"
                  title="Mở tab mới full màn hình"
                >
                  <ExternalLink className="w-3.5 h-3.5 text-emerald-600" /> Mở tab mới
                </a>
                <a
                  href={previewFileModal.url}
                  download={previewFileModal.name}
                  className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-[12px] rounded-lg inline-flex items-center gap-1.5 transition-colors shadow-2xs"
                  title="Tải file về máy"
                >
                  <Download className="w-3.5 h-3.5" /> Tải về
                </a>
                <button
                  onClick={() => setPreviewFileModal(null)}
                  className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-200 rounded-lg transition-colors ml-1"
                  title="Đóng xem trước"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Modal Content Body */}
            <div className="p-4 overflow-y-auto flex-1 bg-slate-100 flex items-center justify-center min-h-[420px]">
              {previewFileModal.type?.startsWith('image/') || previewFileModal.name.match(/\.(jpg|jpeg|png|gif|webp)$/i) ? (
                <img
                  src={previewFileModal.url}
                  alt={previewFileModal.name}
                  className="max-h-[72vh] max-w-full object-contain rounded-xl shadow-md border border-slate-200 bg-white"
                />
              ) : previewFileModal.type?.includes('pdf') || previewFileModal.name.toLowerCase().endsWith('.pdf') ? (
                <iframe
                  src={previewFileModal.url}
                  title={previewFileModal.name}
                  className="w-full h-[72vh] rounded-xl border border-slate-300 bg-white shadow-xs"
                />
              ) : (
                <div className="text-center p-8 bg-white rounded-2xl shadow-sm border border-slate-200 max-w-md">
                  <FileText className="w-16 h-16 text-emerald-600 mx-auto mb-3" />
                  <h4 className="font-extrabold text-slate-900 text-base mb-1">{previewFileModal.name}</h4>
                  <p className="text-[12px] text-slate-500 mb-4">Trình duyệt không thể xem trực tiếp định dạng file này. Bạn có thể mở trong tab mới hoặc tải về máy.</p>
                  <div className="flex justify-center gap-2">
                    <a
                      href={previewFileModal.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-4 py-2 bg-emerald-600 text-white font-bold text-xs rounded-xl shadow-xs inline-flex items-center gap-1.5"
                    >
                      <ExternalLink className="w-4 h-4" /> Mở trong tab mới
                    </a>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const ClockIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
);
