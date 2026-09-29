import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
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
  XCircle,
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
import { MemberWizard } from '../components/MemberWizard';
import { MemberDrawer } from '../components/MemberDrawer';
import { MemberEditModal } from '../components/MemberEditModal';
import {
  mockMembersList,
  mockCapitalTransactions,
  mockSurplusPlan,
  mockSurplusItems,
  getMembersFromApi,
  createMemberApi,
  approveMemberApi,
} from '@/services/memberService';
import {
  getStoredMembers,
  saveMembersToStorage,
  getStoredCapitalTransactions,
  saveCapitalTransactionsToStorage,
  updateMemberInStorage,
} from '@/services/dbStorage';
import { openVoucherPrintWindow, getVoucherDocumentBlobUrl } from '@/utils/voucherDocumentGenerator';
import { formatDate, numberToVietnameseWords } from '@/utils/formatters';
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
  const navigate = useNavigate();
  const [members, setMembers] = React.useState<Member[]>(() => getStoredMembers() || mockMembersList);
  const [loadingMembers, setLoadingMembers] = React.useState<boolean>(false);
  const [transactions, setTransactions] = useState<CapitalTransaction[]>(() => getStoredCapitalTransactions() || mockCapitalTransactions);
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

  // Auto-persist changes to local database store
  React.useEffect(() => {
    if (members && members.length > 0) {
      saveMembersToStorage(members);
    }
  }, [members]);

  React.useEffect(() => {
    if (transactions && transactions.length > 0) {
      saveCapitalTransactionsToStorage(transactions);
    }
  }, [transactions]);

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

  // Pagination State for Members Table
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [pageSize, setPageSize] = useState<number>(6);

  // Pagination State for Capital Table
  const [capitalCurrentPage, setCapitalCurrentPage] = useState<number>(1);
  const [capitalPageSize, setCapitalPageSize] = useState<number>(6);

  React.useEffect(() => {
    setCurrentPage(1);
  }, [search, typeFilter, statusFilter]);

  React.useEffect(() => {
    setCapitalCurrentPage(1);
  }, [search, capitalStatusFilter]);

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

  // Approve & Reject Member Modal state
  const [showApproveModal, setShowApproveModal] = useState(false);
  const [approvingMember, setApprovingMember] = useState<Member | null>(null);
  const [showRejectForm, setShowRejectForm] = useState(false);
  const [rejectReason, setRejectReason] = useState('');
  const [showRefundNoticeModal, setShowRefundNoticeModal] = useState<Member | null>(null);

  // Pending Capital Transactions Modal State
  const [showPendingCapitalModal, setShowPendingCapitalModal] = useState(false);
  const [showProfitFormulaModal, setShowProfitFormulaModal] = useState(false);
  const [viewingVoucherTx, setViewingVoucherTx] = useState<CapitalTransaction | null>(null);

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
    fileUrl: '',
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
    bank_name: '',
    bank_account: '',
    account_holder: '',
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

  // Realtime Profit Share Rate Calculation helper for Wizard
  const currentWizardActualCapital = wizardForm.contribution_method === 'Góp một lần' ? wizardForm.committed_capital : wizardForm.initial_contributed_capital;
  const estimatedNewCoopTotalCapital = totalMemberCapital + currentWizardActualCapital;
  const wizardAutoCalculatedRate = estimatedNewCoopTotalCapital > 0
    ? Number(((currentWizardActualCapital / estimatedNewCoopTotalCapital) * 100).toFixed(2))
    : 0;

  const calculateDynamicProfitRate = (committedCap: number, initialCap: number, method: string) => {
    const actualCap = method === 'Góp một lần' ? committedCap : initialCap;
    const newTotalCoopCap = totalMemberCapital + actualCap;
    return newTotalCoopCap > 0 ? Number(((actualCap / newTotalCoopCap) * 100).toFixed(2)) : 0;
  };

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
    const initRate = calculateDynamicProfitRate(50000000, 10000000, 'Góp một lần');
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
      profit_share_rate: initRate,
      payout_method: 'CASH',
      bank_name: '',
      bank_account: '',
      account_holder: '',
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
      bank_account: wizardForm.bank_account,
      bank_name: wizardForm.bank_name,
      account_holder: wizardForm.account_holder || wizardForm.full_name,
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

  const handleSuspendMember = (m: Member) => {
    const updatedMember: Member = { ...m, status: 'SUSPENDED' };
    setMembers((prev) => prev.map((item) => (item.id === m.id ? updatedMember : item)));
    updateMemberInStorage(updatedMember);
    if (selectedMember?.id === m.id) setSelectedMember(updatedMember);
    if (selectedCapitalMember?.id === m.id) setSelectedCapitalMember(updatedMember);
    triggerToast(`Đã tạm đình chỉ xã viên ${m.full_name}.`, 'warning');
  };

  const handleRestoreMember = (m: Member) => {
    const updatedMember: Member = { ...m, status: 'ACTIVE' };
    setMembers((prev) => prev.map((item) => (item.id === m.id ? updatedMember : item)));
    updateMemberInStorage(updatedMember);
    if (selectedMember?.id === m.id) setSelectedMember(updatedMember);
    if (selectedCapitalMember?.id === m.id) setSelectedCapitalMember(updatedMember);
    triggerToast(`Đã khôi phục trạng thái hoạt động cho xã viên ${m.full_name}.`, 'success');
  };

  const handleTerminateMember = (m: Member) => {
    if ((m.current_debt || 0) > 0) {
      triggerToast(`Không thể chấm dứt tư cách xã viên ${m.full_name} vì còn dư nợ ${(m.current_debt || 0).toLocaleString('vi-VN')} ₫. Vui lòng cấn trừ/thu hồi công nợ trước!`, 'danger');
      return;
    }
    const reason = window.prompt('Nhập lý do chấm dứt tư cách (Sẽ không thể khôi phục trạng thái này, dữ liệu liên quan sẽ được đóng băng):');
    if (reason === null) return;
    
    const updatedMember: Member = { 
      ...m, 
      status: 'TERMINATED',
      deleted_at: new Date().toISOString(),
      deleted_reason: reason || 'Rút khỏi HTX / Hủy tư cách thành viên'
    };
    
    setMembers((prev) => prev.map((item) => (item.id === m.id ? updatedMember : item)));
    updateMemberInStorage(updatedMember);
    if (selectedMember?.id === m.id) setSelectedMember(updatedMember);
    if (selectedCapitalMember?.id === m.id) setSelectedCapitalMember(updatedMember);
    triggerToast(`Đã chấm dứt tư cách xã viên ${m.full_name}.`, 'info');
  };

  const handleOpenApprove = (m: Member) => {
    setApprovingMember(m);
    setShowRejectForm(false);
    setRejectReason('');
    setShowApproveModal(true);
  };

  const handleOpenReject = (m: Member) => {
    setApprovingMember(m);
    setShowRejectForm(true);
    setRejectReason('');
    setShowApproveModal(true);
  };

  const handleConfirmApprove = () => {
    if (!approvingMember) return;
    const targetId = approvingMember.id;
    approveMemberApi(targetId);
    setMembers((prev) =>
      prev.map((m) => (m.id === targetId ? { ...m, status: 'ACTIVE' as MemberStatus } : m))
    );
    setTransactions((prev) =>
      prev.map((t) => (t.member_id === targetId ? { ...t, status: 'APPROVED' as const } : t))
    );
    if (selectedMember?.id === targetId) {
      setSelectedMember({ ...selectedMember, status: 'ACTIVE' });
    }
    if (selectedCapitalMember?.id === targetId) {
      setSelectedCapitalMember({ ...selectedCapitalMember, status: 'ACTIVE' });
    }
    triggerToast(`Đã phê duyệt thành công xã viên ${approvingMember.full_name} (${approvingMember.member_code})! Trạng thái chuyển sang Đang hoạt động.`, 'success');
    setShowApproveModal(false);
    setApprovingMember(null);
  };

  const handleConfirmReject = () => {
    if (!approvingMember) return;
    const rejectedMem = approvingMember;
    const reasonText = rejectReason.trim() || 'Hồ sơ không đủ điều kiện kết nạp theo Quy chế HTX';
    
    setMembers((prev) =>
      prev.map((m) =>
        m.id === rejectedMem.id
          ? {
              ...m,
              status: 'REJECTED' as MemberStatus,
              notes: `[Từ chối duyệt]: ${reasonText}. ${m.notes || ''}`,
            }
          : m
      )
    );

    // Update associated capital transactions to REJECTED
    setTransactions((prev) =>
      prev.map((t) => (t.member_id === rejectedMem.id ? { ...t, status: 'REJECTED' as const } : t))
    );

    if (selectedMember?.id === rejectedMem.id) {
      setSelectedMember({ ...selectedMember, status: 'REJECTED', notes: `[Từ chối duyệt]: ${reasonText}` });
    }
    if (selectedCapitalMember?.id === rejectedMem.id) {
      setSelectedCapitalMember({ ...selectedCapitalMember, status: 'REJECTED' });
    }

    setShowApproveModal(false);
    setApprovingMember(null);
    setShowRejectForm(false);
    setRejectReason('');

    // Check if rejected member contributed capital đợt 1 to trigger refund notice
    const contributedAmt = rejectedMem.contributed_capital || rejectedMem.total_capital_contributed || 0;
    if (contributedAmt > 0) {
      setShowRefundNoticeModal(rejectedMem);
    } else {
      triggerToast(`Đã từ chối kết nạp xã viên ${rejectedMem.full_name} (${rejectedMem.member_code}).`, 'warning');
    }
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
      receipt_file_name: capitalForm.fileName || `${capitalForm.receipt_number.toLowerCase()}.pdf`,
      receipt_file_url: capitalForm.fileUrl || undefined,
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

  const totalPagesTab1 = Math.ceil(filteredMembersTab1.length / pageSize) || 1;
  const safeCurrentPageTab1 = Math.min(currentPage, totalPagesTab1);
  const paginatedMembersTab1 = filteredMembersTab1.slice(
    (safeCurrentPageTab1 - 1) * pageSize,
    safeCurrentPageTab1 * pageSize
  );

  const handleSelectMember = (m: Member) => {
    setSelectedMember(m);
    setTimeout(() => {
      const el = document.getElementById('member-detail-panel');
      if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      }
    }, 50);
  };

  const filteredMembersTab2 = members.filter((m) => {
    const matchSearch =
      m.full_name.toLowerCase().includes(search.toLowerCase()) ||
      m.member_code.toLowerCase().includes(search.toLowerCase());
    const matchCapitalStatus = capitalStatusFilter === 'ALL' || m.capital_status === capitalStatusFilter;
    return matchSearch && matchCapitalStatus;
  });

  const totalCapitalPagesTab2 = Math.ceil(filteredMembersTab2.length / capitalPageSize) || 1;
  const safeCapitalCurrentPageTab2 = Math.min(capitalCurrentPage, totalCapitalPagesTab2);
  const paginatedMembersTab2 = filteredMembersTab2.slice(
    (safeCapitalCurrentPageTab2 - 1) * capitalPageSize,
    safeCapitalCurrentPageTab2 * capitalPageSize
  );

  const handleSelectCapitalMember = (m: Member) => {
    setSelectedCapitalMember(m);
    setTimeout(() => {
      const el = document.getElementById('capital-detail-panel');
      if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      }
    }, 50);
  };

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
              onClick={() => navigate('/capital')}
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
                  navigate('/capital');
                }}
                className="text-[11.5px] text-emerald-700 hover:underline font-bold inline-flex items-center gap-0.5 cursor-pointer"
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
                  <option value="REJECTED">Bị từ chối</option>
                  <option value="SUSPENDED">Tạm đình chỉ</option>
                  <option value="PENDING_TERMINATION">Chờ quyết toán</option>
                  <option value="TERMINATED">Đã chấm dứt tư cách</option>
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
                  {paginatedMembersTab1.map((m) => (
                    <tr
                      key={m.id}
                      onClick={() => handleSelectMember(m)}
                      className={`cursor-pointer hover:bg-slate-50 transition-colors ${
                        selectedMember?.id === m.id ? 'bg-emerald-50/60 font-semibold' : ''
                      }`}
                    >
                      <td className="py-3 px-3 font-mono text-[12px] font-bold text-slate-600">{m.member_code}</td>
                      <td className="py-3 px-3 font-bold text-slate-900">{m.full_name}</td>
                      <td className="py-3 px-3 text-slate-600">{m.gender}</td>
                      <td className="py-3 px-3 text-slate-600">{formatDate(m.join_date)}</td>
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
                        {m.status === 'REJECTED' && <span className="pill-badge pill-red">Từ chối duyệt</span>}
                        {m.status === 'SUSPENDED' && <span className="pill-badge bg-orange-100 text-orange-700 border border-orange-200">Tạm đình chỉ</span>}
                        {m.status === 'PENDING_TERMINATION' && <span className="pill-badge bg-purple-100 text-purple-700 border border-purple-200">Chờ quyết toán</span>}
                        {m.status === 'TERMINATED' && <span className="pill-badge bg-slate-200 text-slate-500 border border-slate-300">Đã chấm dứt</span>}
                      </td>
                      <td className="py-3 px-3 text-center">
                        <div className="inline-flex items-center justify-center gap-1.5">
                          {m.status === 'PENDING' && (
                            <>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleOpenApprove(m);
                                }}
                                className="px-2 py-1 bg-emerald-100 hover:bg-emerald-200 text-emerald-800 font-extrabold rounded-md text-[11px] inline-flex items-center gap-1 transition-colors shadow-2xs cursor-pointer"
                                title="Phê duyệt hồ sơ xã viên này"
                              >
                                <UserCheck className="w-3.5 h-3.5" /> Duyệt
                              </button>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleOpenReject(m);
                                }}
                                className="px-2 py-1 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 font-extrabold rounded-md text-[11px] inline-flex items-center gap-1 transition-colors shadow-2xs cursor-pointer"
                                title="Từ chối duyệt hồ sơ xã viên này"
                              >
                                <UserX className="w-3.5 h-3.5" /> Từ chối
                              </button>
                            </>
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
                              handleSelectMember(m);
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

            {/* Pagination Controls Bar */}
            <div className="px-4 py-3 border-t border-[#e7e9ec] bg-slate-50/80 flex flex-wrap items-center justify-between gap-3 text-xs">
              <div className="flex items-center gap-2 text-slate-500 font-medium">
                <span>Hiển thị</span>
                <select
                  value={pageSize}
                  onChange={(e) => {
                    setPageSize(Number(e.target.value));
                    setCurrentPage(1);
                  }}
                  className="px-2 py-1 bg-white border border-slate-300 rounded-md font-semibold text-slate-700 focus:outline-none focus:ring-1 focus:ring-emerald-500 cursor-pointer"
                >
                  <option value={5}>5 xã viên / trang</option>
                  <option value={6}>6 xã viên / trang</option>
                  <option value={8}>8 xã viên / trang</option>
                  <option value={10}>10 xã viên / trang</option>
                  <option value={20}>20 xã viên / trang</option>
                </select>
                <span>
                  ({filteredMembersTab1.length > 0 ? (safeCurrentPageTab1 - 1) * pageSize + 1 : 0} -{' '}
                  {Math.min(safeCurrentPageTab1 * pageSize, filteredMembersTab1.length)} trên tổng số{' '}
                  <strong className="text-slate-800 font-extrabold">{filteredMembersTab1.length}</strong> xã viên)
                </span>
              </div>

              <div className="flex items-center gap-1.5">
                <button
                  disabled={safeCurrentPageTab1 <= 1}
                  onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                  className="px-2.5 py-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed font-medium text-slate-700 transition-colors flex items-center gap-1 cursor-pointer shadow-2xs"
                >
                  <ArrowLeft className="w-3.5 h-3.5" /> Trước
                </button>

                <div className="flex items-center gap-1 px-1">
                  {Array.from({ length: totalPagesTab1 }, (_, i) => i + 1).map((pageNum) => (
                    <button
                      key={pageNum}
                      onClick={() => setCurrentPage(pageNum)}
                      className={`w-7 h-7 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                        safeCurrentPageTab1 === pageNum
                          ? 'bg-emerald-600 text-white shadow-2xs'
                          : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-100'
                      }`}
                    >
                      {pageNum}
                    </button>
                  ))}
                </div>

                <button
                  disabled={safeCurrentPageTab1 >= totalPagesTab1}
                  onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPagesTab1))}
                  className="px-2.5 py-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed font-medium text-slate-700 transition-colors flex items-center gap-1 cursor-pointer shadow-2xs"
                >
                  Sau <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>

          {/* Drawer Details Member - COMPREHENSIVE VIEW MATCHING ALL WIZARD FIELDS */}
            <MemberDrawer
              isOpen={!!selectedMember}
              member={selectedMember}
              onClose={() => setSelectedMember(null)}
              onEdit={handleOpenEdit}
              onApprove={handleOpenApprove}
              onReject={handleOpenReject}
              onPrint={handlePrintMemberProfile}
              onPrintVoucher={openVoucherPrintWindow}
              onPreviewFile={(url, name) => handlePreviewWizardFile(null, url, name)}
              onSuspend={handleSuspendMember}
              onRestore={handleRestoreMember}
              onTerminate={handleTerminateMember}
              transactions={transactions}
            />
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
            <div className="flex items-center gap-3">
              <button
                onClick={() => setActiveTab('members')}
                className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-lg text-xs inline-flex items-center gap-1.5 transition-colors cursor-pointer border border-slate-200"
              >
                <ArrowLeft className="w-3.5 h-3.5 text-emerald-700" /> Quay lại Danh sách Xã viên
              </button>
              <div className="flex items-center gap-2 text-xs font-bold text-slate-400">
                <span>Vốn góp</span>
                <ChevronRight className="w-3.5 h-3.5" />
                <span className="text-slate-800">Tổng quan</span>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => navigate('/capital')}
                className="px-3 py-1.5 bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs rounded-lg inline-flex items-center gap-1.5 transition-colors shadow-2xs cursor-pointer"
              >
                Chuyển sang Phân hệ Vốn góp chính <ArrowRight className="w-3.5 h-3.5" />
              </button>
              <div className="px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-xs font-bold text-slate-700 flex items-center gap-2">
                <Calendar className="w-4 h-4 text-emerald-600" />
                <span>01/01/2025 - 31/12/2025</span>
              </div>
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
                    {paginatedMembersTab2.map((m, idx) => {
                      const committed = m.committed_capital ?? m.total_capital_contributed ?? 30000000;
                      const contributed = m.contributed_capital ?? m.total_capital_contributed ?? 0;
                      const remaining = Math.max(0, committed - contributed);
                      const isFullyPaid = contributed >= committed && committed > 0;
                      const completionPct = Math.min(100, Math.round((contributed / (committed || 1)) * 100));

                      return (
                        <tr
                          key={m.id}
                          onClick={() => handleSelectCapitalMember(m)}
                          className={`cursor-pointer hover:bg-slate-50 transition-colors ${
                            selectedCapitalMember?.id === m.id ? 'bg-emerald-50/60 font-semibold' : ''
                          }`}
                        >
                          <td className="py-3 px-3 text-slate-500 font-medium">
                            {(safeCapitalCurrentPageTab2 - 1) * capitalPageSize + idx + 1}
                          </td>
                          <td className="py-3 px-3 font-mono font-bold text-slate-600">{m.member_code}</td>
                          <td className="py-3 px-3 font-bold text-slate-900">{m.full_name}</td>
                          <td className="py-3 px-3 text-slate-600">{formatDate(m.join_date)}</td>
                          <td className="py-3 px-3 text-right font-bold text-slate-900">
                            {committed.toLocaleString('vi-VN')} ₫
                          </td>
                          <td className="py-3 px-3 text-right font-extrabold text-emerald-700">
                            {contributed.toLocaleString('vi-VN')} ₫
                          </td>
                          <td className="py-3 px-3 text-right font-bold text-amber-800">
                            {remaining.toLocaleString('vi-VN')} ₫
                          </td>
                          <td className="py-3 px-3 text-right font-bold text-slate-800">
                            {completionPct}%
                          </td>
                          <td className="py-3 px-3">
                            {isFullyPaid ? (
                              <span className="pill-badge pill-green">Đủ vốn</span>
                            ) : (
                              <span className="pill-badge pill-amber">Chưa đủ</span>
                            )}
                          </td>
                        <td className="py-3 px-3 text-center">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleSelectCapitalMember(m);
                            }}
                            className="p-1.5 text-slate-400 hover:text-emerald-700 hover:bg-emerald-50 rounded-lg"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    );
                  })}
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

              {/* Pagination Controls Bar for Tab 2 */}
              <div className="px-4 py-3 border-t border-[#e7e9ec] bg-slate-50/80 flex flex-wrap items-center justify-between gap-3 text-xs">
                <div className="flex items-center gap-2 text-slate-500 font-medium">
                  <span>Hiển thị</span>
                  <select
                    value={capitalPageSize}
                    onChange={(e) => {
                      setCapitalPageSize(Number(e.target.value));
                      setCapitalCurrentPage(1);
                    }}
                    className="px-2 py-1 bg-white border border-slate-300 rounded-md font-semibold text-slate-700 focus:outline-none focus:ring-1 focus:ring-emerald-500 cursor-pointer"
                  >
                    <option value={5}>5 xã viên / trang</option>
                    <option value={6}>6 xã viên / trang</option>
                    <option value={8}>8 xã viên / trang</option>
                    <option value={10}>10 xã viên / trang</option>
                    <option value={20}>20 xã viên / trang</option>
                  </select>
                  <span>
                    ({filteredMembersTab2.length > 0 ? (safeCapitalCurrentPageTab2 - 1) * capitalPageSize + 1 : 0} -{' '}
                    {Math.min(safeCapitalCurrentPageTab2 * capitalPageSize, filteredMembersTab2.length)} trên tổng số{' '}
                    <strong className="text-slate-800 font-extrabold">{filteredMembersTab2.length}</strong> xã viên)
                  </span>
                </div>

                <div className="flex items-center gap-1.5">
                  <button
                    disabled={safeCapitalCurrentPageTab2 <= 1}
                    onClick={() => setCapitalCurrentPage((prev) => Math.max(prev - 1, 1))}
                    className="px-2.5 py-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed font-medium text-slate-700 transition-colors flex items-center gap-1 cursor-pointer shadow-2xs"
                  >
                    <ArrowLeft className="w-3.5 h-3.5" /> Trước
                  </button>

                  <div className="flex items-center gap-1 px-1">
                    {Array.from({ length: totalCapitalPagesTab2 }, (_, i) => i + 1).map((pageNum) => (
                      <button
                        key={pageNum}
                        onClick={() => setCapitalCurrentPage(pageNum)}
                        className={`w-7 h-7 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                          safeCapitalCurrentPageTab2 === pageNum
                            ? 'bg-emerald-600 text-white shadow-2xs'
                            : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-100'
                        }`}
                      >
                        {pageNum}
                      </button>
                    ))}
                  </div>

                  <button
                    disabled={safeCapitalCurrentPageTab2 >= totalCapitalPagesTab2}
                    onClick={() => setCapitalCurrentPage((prev) => Math.min(prev + 1, totalCapitalPagesTab2))}
                    className="px-2.5 py-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed font-medium text-slate-700 transition-colors flex items-center gap-1 cursor-pointer shadow-2xs"
                  >
                    Sau <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>

            {/* SIDE DRAWER CHI TIẾT VỐN GÓP MATCHING IMAGE 2 EXACTLY */}
            {selectedCapitalMember && (
              <div id="capital-detail-panel" className="bg-white border border-[#e7e9ec] rounded-xl shadow-subtle p-4 space-y-4 animate-fade-in sticky top-16 z-20 max-h-[calc(100vh-140px)] overflow-y-auto">
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
                              <td className="py-2 px-2.5 text-slate-600">{formatDate(tx.contribution_date)}</td>
                              <td className="py-2 px-2.5 font-bold text-emerald-700">+{tx.amount.toLocaleString('vi-VN')} ₫</td>
                              <td className="py-2 px-2.5 text-slate-600">
                                {tx.payment_method === 'CASH' ? 'Tiền mặt' : 'Chuyển khoản'}
                              </td>
                              <td className="py-2 px-2.5">
                                <button
                                  type="button"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setViewingVoucherTx(tx);
                                  }}
                                  className="font-mono text-emerald-700 font-bold hover:underline inline-flex items-center gap-1 cursor-pointer bg-emerald-50 hover:bg-emerald-100 px-2 py-0.5 rounded border border-emerald-200 transition-colors"
                                  title="Nhấn để xem / in file chứng từ"
                                >
                                  <FileText className="w-3.5 h-3.5 text-emerald-600" />
                                  {tx.receipt_number || 'PT000125'}
                                </button>
                              </td>
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
            {/* Chart 1: Biểu đồ vốn góp theo thời gian 2025 */}
            <div className="bg-white border border-[#e7e9ec] p-4 rounded-xl shadow-subtle space-y-3">
              <div className="flex justify-between items-center">
                <h3 className="font-extrabold text-slate-900 text-sm">Biểu đồ tiến độ thu vốn góp 2025</h3>
                <div className="flex items-center gap-3 text-[11px] font-bold">
                  <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-full bg-emerald-600"></span> Cam kết</span>
                  <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-full bg-blue-500"></span> Đã nộp</span>
                </div>
              </div>
              <div className="h-44 flex items-end justify-between gap-1 pt-6 px-2 border-b border-slate-200">
                {[
                  { m: 1, c: 150000000, a: 140000000 },
                  { m: 2, c: 180000000, a: 175000000 },
                  { m: 3, c: 200000000, a: 190000000 },
                  { m: 4, c: 220000000, a: 210000000 },
                  { m: 5, c: 250000000, a: 245000000 },
                  { m: 6, c: 280000000, a: 270000000 },
                  { m: 7, c: 300000000, a: 290000000 },
                  { m: 8, c: 320000000, a: 305000000 },
                  { m: 9, c: 350000000, a: 340000000 },
                  { m: 10, c: 380000000, a: 360000000 },
                  { m: 11, c: 400000000, a: 385000000 },
                  { m: 12, c: 450000000, a: 435000000 },
                ].map((item) => (
                  <div key={item.m} className="flex-1 flex items-end justify-center gap-0.5 group relative cursor-pointer">
                    <div
                      className="w-2 bg-emerald-600 rounded-t-xs hover:opacity-80 transition-all"
                      style={{ height: `${(item.c / 500000000) * 100}%` }}
                    ></div>
                    <div
                      className="w-2 bg-blue-500 rounded-t-xs hover:opacity-80 transition-all"
                      style={{ height: `${(item.a / 500000000) * 100}%` }}
                    ></div>
                    <span className="absolute -bottom-5 text-[10px] font-bold text-slate-400">T{item.m}</span>
                    {/* Hover Tooltip */}
                    <div className="absolute bottom-full mb-2 hidden group-hover:block z-30 bg-slate-900 text-white text-[10px] p-2 rounded-lg shadow-xl whitespace-nowrap pointer-events-none">
                      <div className="font-bold border-b border-slate-700 pb-1 mb-1">Tháng {item.m}/2025</div>
                      <div className="text-emerald-300">Cam kết: {item.c.toLocaleString('vi-VN')} ₫</div>
                      <div className="text-blue-300">Đã nộp: {item.a.toLocaleString('vi-VN')} ₫</div>
                    </div>
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
                <label className="block font-bold text-slate-700 mb-1">File chứng từ đính kèm</label>
                <label className="border-2 border-dashed border-slate-200 hover:border-emerald-500 rounded-xl p-4 text-center bg-slate-50/50 cursor-pointer block transition-colors">
                  <Upload className="w-6 h-6 text-slate-400 mx-auto mb-1" />
                  <div className="text-slate-600 font-medium text-[12px]">
                    {capitalForm.fileName ? `Đã chọn: ${capitalForm.fileName}` : 'Kéo thả file hoặc nhấn để chọn file đính kèm'}
                  </div>
                  <div className="text-slate-400 text-[10.5px]">PDF, JPG, PNG (Tối đa 10MB)</div>
                  <input
                    type="file"
                    accept=".pdf,.png,.jpg,.jpeg"
                    className="hidden"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) {
                        const reader = new FileReader();
                        reader.onload = (evt) => {
                          const dataUrl = evt.target?.result as string;
                          setCapitalForm({ ...capitalForm, fileName: file.name, fileUrl: dataUrl });
                        };
                        reader.readAsDataURL(file);
                      }
                    }}
                  />
                </label>
                {capitalForm.fileName && (
                  <div className="mt-2 p-2 bg-emerald-50 border border-emerald-200 rounded-lg text-xs text-emerald-800 flex items-center justify-between">
                    <span className="font-semibold truncate">📁 {capitalForm.fileName}</span>
                    <button
                      type="button"
                      onClick={() => setCapitalForm({ ...capitalForm, fileName: '', fileUrl: '' })}
                      className="text-rose-600 hover:underline font-bold ml-2 cursor-pointer"
                    >
                      Xóa file
                    </button>
                  </div>
                )}
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
      <MemberWizard
        isOpen={showWizardModal}
        onClose={() => setShowWizardModal(false)}
        nextMemberNumber={members.length + 1}
        totalMemberCapital={totalMemberCapital}
        onAddMemberAndTx={(newMem, firstTx) => {
          setMembers([...members, newMem]);
          if (firstTx) {
            setTransactions([...transactions, firstTx]);
          }
          triggerToast(`Đã thêm thành công xã viên mới ${newMem.full_name} (${newMem.member_code}) vào Database!`);
        }}
        triggerToast={triggerToast}
      />

      {/* REDESIGNED EDIT MEMBER MODAL */}
      <MemberEditModal
        isOpen={showEditModal}
        member={editingMember}
        onClose={() => setShowEditModal(false)}
        onSave={(updatedMem) => {
          setMembers(members.map(m => m.id === updatedMem.id ? updatedMem : m));
          if (selectedMember?.id === updatedMem.id) setSelectedMember(updatedMem);
          triggerToast(`Đã cập nhật thông tin xã viên ${updatedMem.member_code} thành công!`);
        }}
        triggerToast={triggerToast}
      />

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

      {/* APPROVE / REJECT MEMBER MODAL WITH CAPITAL REFUND REMINDER */}
      {showApproveModal && approvingMember && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fade-in">
          <div className="bg-white rounded-2xl max-w-lg w-full shadow-modal overflow-hidden p-6 space-y-4 text-center flex flex-col max-h-[90vh]">
            <div className={`w-14 h-14 rounded-full flex items-center justify-center mx-auto border shrink-0 ${showRejectForm ? 'bg-rose-100 text-rose-600 border-rose-200' : 'bg-emerald-100 text-emerald-700 border-emerald-200'}`}>
              {showRejectForm ? <UserX className="w-7 h-7" /> : <UserCheck className="w-7 h-7" />}
            </div>

            <div className="shrink-0">
              <h3 className="text-lg font-extrabold text-slate-900">
                {showRejectForm ? 'Từ chối duyệt kết nạp xã viên' : 'Phê duyệt hồ sơ xã viên mới'}
              </h3>
              <p className="text-[13px] text-slate-600 mt-1">
                Xã viên: <strong className="text-slate-900">{approvingMember.full_name}</strong> (<span className="font-mono">{approvingMember.member_code}</span>)
              </p>
            </div>

            <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl text-[12px] text-slate-700 text-left space-y-1.5 shrink-0">
              <div className="flex justify-between"><span className="text-slate-500">Loại xã viên:</span> <strong>{MEMBER_TYPE_LABELS[approvingMember.member_type]}</strong></div>
              <div className="flex justify-between"><span className="text-slate-500">Vốn thực góp đợt 1:</span> <strong className="text-emerald-800">{(approvingMember.contributed_capital || approvingMember.total_capital_contributed || 0)?.toLocaleString('vi-VN')} ₫</strong> ({approvingMember.capital_form === 'HIEN_VAT' ? 'Hiện vật' : 'Tiền mặt'})</div>
              <div className="flex justify-between"><span className="text-slate-500">Vốn cam kết:</span> <span className="font-mono text-slate-900">{approvingMember.committed_capital?.toLocaleString('vi-VN')} ₫</span></div>
              <div className="flex justify-between"><span className="text-slate-500">SĐT liên hệ:</span> <span className="font-mono">{approvingMember.phone}</span></div>
            </div>

            {/* CAPITAL REFUND WARNING NOTICE IF CAPITAL WAS CONTRIBUTED */}
            {(approvingMember.contributed_capital || approvingMember.total_capital_contributed || 0) > 0 && (
              <div className="p-3 bg-amber-50 border border-amber-200 text-amber-900 rounded-xl text-[11.5px] text-left space-y-1 flex items-start gap-2.5">
                <i className="ri-error-warning-line text-amber-600 text-base mt-0.5 shrink-0"></i>
                <div>
                  <p className="font-bold text-amber-800">Lưu ý nghiệp vụ Tài chính HTX:</p>
                  <p className="leading-relaxed">
                    Xã viên này đã tạm nộp <strong>{(approvingMember.contributed_capital || approvingMember.total_capital_contributed || 0).toLocaleString('vi-VN')} ₫</strong> vốn góp đợt 1.
                    Nếu <strong>Từ chối duyệt</strong>, HTX có nghĩa vụ lập <strong>Phiếu chi hoàn trả khoản tiền/hiện vật tạm thu</strong> này cho người nộp.
                  </p>
                </div>
              </div>
            )}

            {!showRejectForm ? (
              <>
                <p className="text-[11.5px] text-slate-500 italic shrink-0">
                  Vui lòng lựa chọn quyết định của Hội đồng Quản trị / Chủ tịch HTX:
                </p>

                <div className="pt-2 flex justify-between gap-3 shrink-0">
                  <button
                    type="button"
                    onClick={() => setShowRejectForm(true)}
                    className="px-4 py-2 border border-rose-300 text-rose-700 hover:bg-rose-50 font-bold rounded-lg text-[12.5px] inline-flex items-center gap-1.5 transition-all cursor-pointer"
                  >
                    <UserX className="w-4 h-4" /> Từ chối duyệt
                  </button>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setShowApproveModal(false)}
                      className="px-4 py-2 border border-slate-300 rounded-lg text-slate-700 font-bold hover:bg-slate-50 text-[12.5px]"
                    >
                      Hủy bỏ
                    </button>
                    <button
                      type="button"
                      onClick={handleConfirmApprove}
                      className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-lg text-[12.5px] shadow-sm inline-flex items-center gap-1.5 transition-all cursor-pointer"
                    >
                      <UserCheck className="w-4 h-4" /> Đồng ý phê duyệt
                    </button>
                  </div>
                </div>
              </>
            ) : (
              <div className="space-y-3 text-left animate-fade-in shrink-0">
                <div>
                  <label className="block font-bold text-slate-700 mb-1 text-[12px]">Lý do từ chối kết nạp *</label>
                  <textarea
                    rows={2}
                    required
                    placeholder="Ví dụ: Hồ sơ chứng từ không đủ điều kiện, Không đạt yêu cầu Điều lệ HTX, Người nộp xin rút đơn..."
                    value={rejectReason}
                    onChange={(e) => setRejectReason(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg text-slate-800 text-[12.5px]"
                  ></textarea>
                </div>

                <div className="flex justify-end gap-2 pt-1">
                  <button
                    type="button"
                    onClick={() => setShowRejectForm(false)}
                    className="px-4 py-1.5 border border-slate-300 rounded-lg text-slate-700 font-bold text-[12px]"
                  >
                    Quay lại
                  </button>
                  <button
                    type="button"
                    onClick={handleConfirmReject}
                    className="px-5 py-1.5 bg-rose-600 hover:bg-rose-700 text-white font-bold rounded-lg text-[12px] shadow-sm inline-flex items-center gap-1.5 transition-all cursor-pointer"
                  >
                    <XCircle className="w-4 h-4" /> Xác nhận từ chối kết nạp
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* CAPITAL REFUND NOTICE & PAYMENT VOUCHER MODAL */}
      {showRefundNoticeModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-[60] animate-fade-in">
          <div className="bg-white rounded-2xl max-w-md w-full shadow-2xl border border-slate-200 overflow-hidden p-6 space-y-4 text-center">
            <div className="w-16 h-16 rounded-full bg-amber-100 text-amber-700 flex items-center justify-center mx-auto border border-amber-300">
              <i className="ri-hand-coin-line text-3xl"></i>
            </div>

            <div>
              <span className="pill-badge pill-red text-[11px] mb-1">Đã Từ Chối Kết Nạp</span>
              <h3 className="text-lg font-extrabold text-slate-900 mt-1">Yêu cầu Hoàn trả Vốn Tạm nộp</h3>
              <p className="text-[12.5px] text-slate-600 mt-1">
                Hồ sơ của <strong>{showRefundNoticeModal.full_name}</strong> (<span className="font-mono">{showRefundNoticeModal.member_code}</span>) đã bị từ chối.
              </p>
            </div>

            <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl text-[12.5px] text-left space-y-2">
              <div className="flex justify-between items-center border-b border-amber-200/80 pb-2">
                <span className="text-amber-900 font-medium">Số tiền vốn cần hoàn trả:</span>
                <strong className="text-rose-700 text-base font-mono">
                  {(showRefundNoticeModal.contributed_capital || showRefundNoticeModal.total_capital_contributed || 0).toLocaleString('vi-VN')} ₫
                </strong>
              </div>
              <div className="flex justify-between text-xs text-amber-800">
                <span>Hình thức đã nộp:</span>
                <span className="font-bold">{showRefundNoticeModal.capital_form === 'HIEN_VAT' ? 'Hiện vật (Trả lại tài sản)' : 'Tiền mặt / Chuyển khoản'}</span>
              </div>
              <div className="flex justify-between text-xs text-amber-800">
                <span>SĐT người nộp:</span>
                <span className="font-mono font-bold">{showRefundNoticeModal.phone}</span>
              </div>
            </div>

            <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg text-[11.5px] text-slate-600 text-left leading-relaxed">
              📌 <strong>Hướng dẫn nghiệp vụ:</strong>
              <ul className="list-disc pl-4 mt-1 space-y-1">
                <li><strong>Nếu là HĐQT/Chủ tịch:</strong> Chọn <em>Chuyển lệnh chi cho Kế toán</em> để giao việc.</li>
                <li><strong>Nếu là Kế toán/Thủ quỹ:</strong> Chọn <em>Lập Phiếu Chi & Đã chi tiền</em> nếu đã xuất quỹ hoàn xong.</li>
              </ul>
            </div>

            <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-2">
              <button
                type="button"
                onClick={() => {
                  triggerToast(`Đã chuyển lệnh chi hoàn trả ${(showRefundNoticeModal.contributed_capital || 0).toLocaleString('vi-VN')} ₫ sang Kế toán! (Lưu tại Trung tâm Nhắc việc)`, 'warning');
                  setShowRefundNoticeModal(null);
                }}
                className="w-full sm:w-auto px-3.5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl text-xs shadow-2xs inline-flex items-center justify-center gap-1.5 transition-all cursor-pointer"
                title="Tạo nhắc việc cho Kế toán xuất quỹ (Tiền chưa bị trừ ngay)"
              >
                <i className="ri-send-plane-line text-sm"></i> 📋 Chuyển lệnh chi cho Kế toán
              </button>
              <button
                type="button"
                onClick={() => {
                  triggerToast(`Đã lập Phiếu Chi & Xác nhận xuất quỹ hoàn tiền ${(showRefundNoticeModal.contributed_capital || 0).toLocaleString('vi-VN')} ₫ thành công!`, 'success');
                  setShowRefundNoticeModal(null);
                }}
                className="w-full sm:w-auto px-3.5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-xs shadow-2xs inline-flex items-center justify-center gap-1.5 transition-all cursor-pointer"
                title="Kế toán/Thủ quỹ xác nhận đã giao tiền cho người nộp và trừ quỹ HTX"
              >
                <i className="ri-money-dollar-circle-line text-sm"></i> 💵 Lập Phiếu Chi & Đã chi tiền
              </button>
              <button
                type="button"
                onClick={() => {
                  triggerToast(`Đã lưu nhiệm vụ hoàn vốn cho ${showRefundNoticeModal.full_name} vào Dashboard Task Hub để xử lý sau.`, 'info');
                  setShowRefundNoticeModal(null);
                }}
                className="w-full sm:w-auto px-3 py-2.5 border border-slate-300 hover:bg-slate-50 text-slate-700 font-bold rounded-xl text-xs transition-all cursor-pointer"
              >
                ⏳ Để sau (Lưu vào Nhắc việc)
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

      {/* PROFIT SHARE FORMULA EXPLANATION MODAL */}
      {showProfitFormulaModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-[60] animate-fade-in">
          <div className="bg-white rounded-2xl max-w-xl w-full shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[85vh] my-auto">
            {/* Header */}
            <div className="p-4 border-b border-slate-200 flex justify-between items-center bg-emerald-700 text-white shrink-0">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-white/20 text-white flex items-center justify-center font-bold">
                  <i className="ri-calculator-line text-lg"></i>
                </div>
                <div>
                  <h3 className="font-extrabold text-base">Công thức Tính Tỷ lệ Phân chia Lợi nhuận</h3>
                  <p className="text-[11px] text-emerald-100">Căn cứ theo Điều 74 Luật Hợp tác xã 2023</p>
                </div>
              </div>
              <button
                onClick={() => setShowProfitFormulaModal(false)}
                className="text-white/80 hover:text-white p-1 hover:bg-white/10 rounded-lg transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Body */}
            <div className="p-5 space-y-4 text-[12.8px] text-slate-700 overflow-y-auto custom-form-scrollbar">
              {/* Formula Box */}
              <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl space-y-2 text-center">
                <p className="font-extrabold text-slate-900 text-[13px]">CÔNG THỨC CHUẨN TÍNH TỶ LỆ HƯỞNG LỢI NHUẬN:</p>
                <div className="p-3 bg-white rounded-lg border border-emerald-300 font-mono font-bold text-emerald-800 text-sm shadow-2xs">
                  Tỷ lệ % = (Vốn thực nộp Đợt 1 / Tổng vốn thực góp toàn HTX) × 100%
                </div>
              </div>

              {/* Realtime breakdown for current member */}
              <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-2.5">
                <h4 className="font-bold text-slate-900 text-[12.5px] uppercase tracking-wider flex items-center gap-1.5">
                  <i className="ri-numbers-line text-emerald-600"></i> Bảng tính thực tế cho Xã viên này:
                </h4>
                <div className="space-y-2 pl-1 text-[12px]">
                  <div className="flex justify-between py-1 border-b border-slate-200/60">
                    <span className="text-slate-600">1. Vốn thực góp Đợt 1 (Xã viên mới):</span>
                    <strong className="text-emerald-700 font-mono text-sm">{currentWizardActualCapital.toLocaleString('vi-VN')} ₫</strong>
                  </div>
                  <div className="flex justify-between py-1 border-b border-slate-200/60">
                    <span className="text-slate-600">2. Tổng vốn thực góp hiện có của các Xã viên cũ:</span>
                    <span className="font-mono text-slate-800">{totalMemberCapital.toLocaleString('vi-VN')} ₫</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-slate-200/60">
                    <span className="text-slate-600">3. Tổng vốn thực nộp của HTX sau khi kết nạp:</span>
                    <span className="font-mono text-slate-900 font-bold">{estimatedNewCoopTotalCapital.toLocaleString('vi-VN')} ₫</span>
                  </div>
                  <div className="flex justify-between py-2 bg-emerald-100/70 px-3 rounded-lg text-emerald-950 font-bold items-center">
                    <span>➔ Tỷ lệ % lợi nhuận dự kiến:</span>
                    <span className="text-base font-mono text-emerald-800">{wizardAutoCalculatedRate}%</span>
                  </div>
                </div>
              </div>

              {/* Legal explanation */}
              <div className="space-y-1.5 text-[12px] leading-relaxed bg-amber-50/70 p-3.5 border border-amber-200 rounded-xl text-amber-900">
                <p className="font-bold flex items-center gap-1.5 text-amber-800">
                  <i className="ri-shield-check-line text-sm text-amber-600"></i> Căn cứ Pháp lý & Quản trị Kế toán:
                </p>
                <p>
                  • <strong>Luật HTX 2023 (Điều 74)</strong>: Phân phối thặng dư của HTX dựa trên tỷ lệ vốn góp thực tế nộp vào quỹ và mức độ sử dụng dịch vụ.<br/>
                  • <strong>Vì sao không dùng Vốn cam kết?</strong> Vốn cam kết chỉ là hạn mức đăng ký. Chỉ số tiền thực góp mới chính thức được ngân hàng/quỹ HTX ghi nhận để đầu tư sinh lời.
                </p>
              </div>
            </div>

            {/* Footer */}
            <div className="p-3.5 border-t border-slate-200 bg-slate-50 flex justify-between items-center shrink-0">
              <button
                type="button"
                onClick={() => {
                  setWizardForm({ ...wizardForm, profit_share_rate: wizardAutoCalculatedRate });
                  setShowProfitFormulaModal(false);
                }}
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-lg text-xs shadow-2xs inline-flex items-center gap-1.5 transition-all cursor-pointer"
              >
                <i className="ri-check-double-line text-sm"></i> Áp dụng tỷ lệ {wizardAutoCalculatedRate}% vào Form
              </button>
              <button
                type="button"
                onClick={() => setShowProfitFormulaModal(false)}
                className="px-4 py-2 border border-slate-300 hover:bg-white text-slate-700 font-bold rounded-lg text-xs transition-all cursor-pointer"
              >
                Đóng lại
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL PREVIEW FILE CHỨNG TỪ (HÌNH 5) */}
      {viewingVoucherTx && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fade-in">
          <div className="bg-white rounded-2xl max-w-4xl w-full h-[90vh] shadow-modal overflow-hidden flex flex-col">
            <div className="p-4 border-b border-slate-200 flex justify-between items-center bg-slate-50">
              <div className="flex items-center gap-2">
                <FileText className="w-5 h-5 text-emerald-600" />
                <h3 className="font-extrabold text-slate-900 text-base">
                  Xem file chứng từ đính kèm: <span className="font-mono text-emerald-800">{viewingVoucherTx.receipt_number}</span>
                </h3>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => {
                    const mem = members.find((m) => m.id === viewingVoucherTx.member_id || m.member_code === viewingVoucherTx.member_code) || selectedMember || members[0];
                    openVoucherPrintWindow(mem, viewingVoucherTx);
                  }}
                  className="px-3 py-1.5 bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs rounded-lg inline-flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  <Printer className="w-4 h-4" /> In chứng từ
                </button>
                <button
                  type="button"
                  onClick={() => setViewingVoucherTx(null)}
                  className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>
            <div className="flex-1 bg-slate-100 p-4 overflow-auto flex items-center justify-center">
              {viewingVoucherTx.receipt_file_url &&
              (viewingVoucherTx.receipt_file_url.startsWith('data:image/') ||
                viewingVoucherTx.receipt_file_name?.match(/\.(png|jpg|jpeg|webp|gif)$/i)) ? (
                <div className="bg-white p-4 rounded-xl shadow-md max-h-full flex flex-col items-center justify-center overflow-auto border border-slate-200">
                  <img
                    src={viewingVoucherTx.receipt_file_url}
                    alt={viewingVoucherTx.receipt_file_name || viewingVoucherTx.receipt_number}
                    className="max-h-[70vh] max-w-full object-contain rounded-lg shadow-sm"
                  />
                  {viewingVoucherTx.receipt_file_name && (
                    <div className="mt-3 text-xs font-bold text-slate-600">
                      📁 File đính kèm: {viewingVoucherTx.receipt_file_name}
                    </div>
                  )}
                </div>
              ) : viewingVoucherTx.receipt_file_url &&
                (viewingVoucherTx.receipt_file_url.startsWith('data:application/pdf') ||
                  viewingVoucherTx.receipt_file_name?.endsWith('.pdf')) ? (
                <iframe
                  src={viewingVoucherTx.receipt_file_url}
                  title="Chứng từ PDF đính kèm"
                  className="w-full h-full border-0 rounded-xl bg-white shadow-sm"
                />
              ) : (
                <iframe
                  src={getVoucherDocumentBlobUrl(
                    members.find((m) => m.id === viewingVoucherTx.member_id || m.member_code === viewingVoucherTx.member_code) || selectedMember || members[0],
                    viewingVoucherTx
                  )}
                  title="Biên nhận chứng từ"
                  className="w-full h-full border-0 rounded-xl bg-white shadow-sm"
                />
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
