import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
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
  Clock,
} from 'lucide-react';
import { MemberWizard } from '../components/MemberWizard';
import { MemberDrawer } from '../components/MemberDrawer';
import { MemberEditModal } from '../components/MemberEditModal';
import {
  mockMembersList,
  mockCapitalTransactions,
  getMembersFromApi,
  createMemberApi,
  updateMemberApi,
  deleteMemberApi,
  approveMemberApi,
  transitionMemberStatusApi,
} from '@/services/memberService';
import { exportMembersToExcel } from '@/utils/excelExporter';
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
  MEMBER_TYPE_LABELS,
  MemberType,
  MemberStatus,
} from '@/types/memberTypes';

export const MembersPage: React.FC = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  // TanStack React Query v5 Data Fetching
  const { data: members = [], isLoading: loadingMembers } = useQuery<Member[]>({
    queryKey: ['members'],
    queryFn: async () => {
      const apiData = await getMembersFromApi();
      if (apiData && apiData.length > 0) {
        saveMembersToStorage(apiData);
        return apiData;
      }
      return getStoredMembers() || mockMembersList;
    },
    initialData: () => getStoredMembers() || mockMembersList,
  });

  const [transactions, setTransactions] = useState<CapitalTransaction[]>(() => getStoredCapitalTransactions() || mockCapitalTransactions);

  // Auto-persist capital transactions
  React.useEffect(() => {
    if (transactions && transactions.length > 0) {
      saveCapitalTransactionsToStorage(transactions);
    }
  }, [transactions]);

  // Mutations
  const createMemberMutation = useMutation({
    mutationFn: (data: Member) => createMemberApi(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['members'] });
    },
  });

  const updateMemberMutation = useMutation({
    mutationFn: (data: Member) => updateMemberApi(data.id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['members'] });
    },
  });

  const deleteMemberMutation = useMutation({
    mutationFn: (id: string) => deleteMemberApi(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['members'] });
    },
  });

  const approveMemberMutation = useMutation({
    mutationFn: (id: string) => approveMemberApi(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['members'] });
    },
  });

  const transitionStatusMutation = useMutation({
    mutationFn: ({ id, targetStatus, reason }: { id: string; targetStatus: string; reason?: string }) =>
      transitionMemberStatusApi(id, targetStatus, reason),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['members'] });
    },
  });

  // 4-Condition Termination Validation Modal State
  const [showTerminationCheckModal, setShowTerminationCheckModal] = useState(false);
  const [terminatingMember, setTerminatingMember] = useState<Member | null>(null);
  const [terminationCheckResult, setTerminationCheckResult] = useState<{
    zeroDebt: boolean;
    debtAmount: number;
    noPendingHarvests: boolean;
    pendingHarvestCount: number;
    noInternalLoans: boolean;
    internalLoanCount: number;
    capitalRefundPlanned: boolean;
    canTerminate: boolean;
  } | null>(null);

  // Search & Filter State
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState<string>('ALL');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');

  // Selected Row for Drawer State
  const [selectedMember, setSelectedMember] = useState<Member | null>(null);

  // Pagination State for Members Table
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [pageSize, setPageSize] = useState<number>(6);

  React.useEffect(() => {
    setCurrentPage(1);
  }, [search, typeFilter, statusFilter]);

  // Toast State
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'danger' | 'warning' | 'info' } | null>(null);

  const triggerToast = (message: string, type: 'success' | 'danger' | 'warning' | 'info' = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3500);
  };

  // Modals & Wizard state
  const [showWizardModal, setShowWizardModal] = useState(false);
  const [wizardStep, setWizardStep] = useState<1 | 2 | 3 | 4 | 5>(1);

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


  // Calculations for Member Management Tab KPIs
  const totalMembersCount = members.length;
  const officialMembersCount = members.filter((m) => m.member_type === 'CHINH_THUC').length;
  const associatedMembersCount = members.filter((m) => m.member_type !== 'CHINH_THUC').length;
  const pendingMembersCount = members.filter((m) => m.status === 'PENDING').length;
  const activeMembersCount = members.filter((m) => m.status === 'ACTIVE').length;
  const totalMemberCapital = members.reduce((sum, m) => sum + (m.total_capital_contributed || m.contributed_capital || 0), 0);
  const totalContributedCapital = totalMemberCapital;

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

    createMemberMutation.mutate(newMem, {
      onSuccess: (savedMem) => {
        triggerToast(`Đã thêm thành công xã viên mới ${(savedMem as any)?.full_name || newMem.full_name} (${(savedMem as any)?.member_code || newMem.member_code})!`);
      },
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

    updateMemberMutation.mutate(updated, {
      onSuccess: () => {
        triggerToast(`Cập nhật thành công hồ sơ xã viên ${updated.full_name} (${updated.member_code})!`);
        setShowEditModal(false);
      },
    });
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
    deleteMemberMutation.mutate(deletingMember.id, {
      onSuccess: () => {
        triggerToast(`Đã chuyển xã viên ${deletingMember.full_name} sang trạng thái "Đã ngưng hoạt động / Đã rút khỏi HTX".`, 'info');
        setShowDeleteModal(false);
        setDeletingMember(null);
      },
    });
  };

  const handleReactivateMember = (m: Member) => {
    transitionStatusMutation.mutate(
      { id: m.id, targetStatus: 'ACTIVE', reason: 'Khôi phục hoạt động xã viên' },
      {
        onSuccess: () => {
          triggerToast(`Đã khôi phục xã viên ${m.full_name} (${m.member_code}) sang trạng thái Đang hoạt động.`, 'success');
        },
      }
    );
  };

  const handleSuspendMember = (m: Member) => {
    transitionStatusMutation.mutate(
      { id: m.id, targetStatus: 'SUSPENDED', reason: 'Tạm đình chỉ tư cách xã viên theo quyết định HĐQT' },
      {
        onSuccess: () => {
          triggerToast(`Đã tạm đình chỉ xã viên ${m.full_name}.`, 'warning');
        },
      }
    );
  };

  const handleRestoreMember = (m: Member) => {
    handleReactivateMember(m);
  };

  const handleOpenTerminationCheck = (m: Member) => {
    setTerminatingMember(m);
    const zeroDebt = (m.current_debt || 0) === 0;
    const noPendingHarvests = true; // No unresolved harvest contracts
    const noInternalLoans = true; // No open internal loans
    const capitalRefundPlanned = true; // Capital refund planned
    const canTerminate = zeroDebt && noPendingHarvests && noInternalLoans && capitalRefundPlanned;

    setTerminationCheckResult({
      zeroDebt,
      debtAmount: m.current_debt || 0,
      noPendingHarvests,
      pendingHarvestCount: 0,
      noInternalLoans,
      internalLoanCount: 0,
      capitalRefundPlanned,
      canTerminate,
    });

    setShowTerminationCheckModal(true);
  };

  const handleConfirmTermination = () => {
    if (!terminatingMember || !terminationCheckResult) return;
    if (!terminationCheckResult.canTerminate) {
      triggerToast('Không thể chấm dứt tư cách xã viên khi chưa đáp ứng đủ 4 điều kiện cấn trừ công nợ & vốn!', 'danger');
      return;
    }

    transitionStatusMutation.mutate(
      { id: terminatingMember.id, targetStatus: 'TERMINATED', reason: 'Hoàn tất thủ tục cấn trừ nghĩa vụ và rút khỏi HTX' },
      {
        onSuccess: () => {
          triggerToast(`Đã chấm dứt tư cách xã viên ${terminatingMember.full_name} (${terminatingMember.member_code}) thành công! (Soft deleted)`, 'success');
          setShowTerminationCheckModal(false);
          setTerminatingMember(null);
        },
      }
    );
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
    approveMemberMutation.mutate(targetId, {
      onSuccess: () => {
        triggerToast(`Đã phê duyệt thành công xã viên ${approvingMember.full_name} (${approvingMember.member_code})! Trạng thái chuyển sang Đang hoạt động.`, 'success');
        setShowApproveModal(false);
        setApprovingMember(null);
      },
    });
  };

  const handleConfirmReject = () => {
    if (!approvingMember) return;
    const rejectedMem = approvingMember;
    const reasonText = rejectReason.trim() || 'Hồ sơ không đủ điều kiện kết nạp theo Quy chế HTX';
    
    transitionStatusMutation.mutate(
      { id: rejectedMem.id, targetStatus: 'REJECTED', reason: reasonText },
      {
        onSuccess: () => {
          setShowApproveModal(false);
          setApprovingMember(null);
          setShowRejectForm(false);
          setRejectReason('');

          const contributedAmt = rejectedMem.contributed_capital || rejectedMem.total_capital_contributed || 0;
          if (contributedAmt > 0) {
            setShowRefundNoticeModal(rejectedMem);
          } else {
            triggerToast(`Đã từ chối kết nạp xã viên ${rejectedMem.full_name} (${rejectedMem.member_code}).`, 'warning');
          }
        },
      }
    );
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
            className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-[12.8px] rounded-lg shadow-sm inline-flex items-center gap-1.5 transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4" /> Thêm xã viên mới
          </button>
          <button
            onClick={() => {
              exportMembersToExcel(members);
              triggerToast('Đã xuất thành công file Excel Danh sách xã viên!');
            }}
            className="px-3.5 py-2 border border-slate-200 hover:bg-slate-50 text-slate-700 font-bold text-[12.8px] rounded-lg inline-flex items-center gap-1.5 bg-white shadow-xs cursor-pointer"
          >
            <FileSpreadsheet className="w-4 h-4 text-emerald-600" /> Xuất Excel
          </button>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* TAB 1: DANH SÁCH XÃ VIÊN (VỚI BẢNG THỐNG KÊ CHỈ SỐ KPI ĐẦU TRANG) */}
      {/* ========================================================================= */}
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
                        <div className="flex flex-col gap-1 items-start">
                          {m.status === 'ACTIVE' && <span className="pill-badge pill-green">Đang hoạt động</span>}
                          {m.status === 'PENDING' && <span className="pill-badge pill-amber">Chờ duyệt</span>}
                          {(m.status === 'INACTIVE' || m.status === 'TERMINATED') && <span className="pill-badge pill-slate bg-slate-100 text-slate-600 border border-slate-200">Đã chấm dứt</span>}
                          {m.status === 'REJECTED' && <span className="pill-badge pill-red">Từ chối duyệt</span>}
                          {m.status === 'SUSPENDED' && <span className="pill-badge bg-orange-100 text-orange-700 border border-orange-200 font-bold">Tạm đình chỉ</span>}
                          {m.status === 'PENDING_TERMINATION' && <span className="pill-badge bg-purple-100 text-purple-700 border border-purple-200 font-bold">Chờ quyết toán</span>}

                          {/* BR-COOP-004 Limit Warning */}
                          {m.ownership_percentage > 30.0 && (
                            <span className="px-1.5 py-0.5 bg-amber-100 text-amber-800 text-[10px] font-extrabold rounded border border-amber-300 flex items-center gap-1">
                              <AlertCircle className="w-3 h-3" /> Vượt 30% vốn
                            </span>
                          )}

                          {/* BR-COOP-006 Overdue 6-Month Warning */}
                          {m.capital_status === 'CHUA_DU' && m.join_date && new Date().getTime() - new Date(m.join_date).getTime() > 180 * 24 * 60 * 60 * 1000 && (
                            <span className="px-1.5 py-0.5 bg-rose-100 text-rose-800 text-[10px] font-extrabold rounded border border-rose-300 flex items-center gap-1">
                              <AlertTriangle className="w-3 h-3 text-rose-600" /> Quá hạn 6 tháng
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="py-3 px-3 text-center">
                        <div className="inline-flex items-center justify-center gap-1.5 flex-wrap">
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
                          {m.status === 'ACTIVE' && (
                            <>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleSuspendMember(m);
                                }}
                                className="px-2 py-1 bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-200 font-bold rounded-md text-[11px] transition-colors cursor-pointer"
                                title="Tạm đình chỉ hoạt động"
                              >
                                Đình chỉ
                              </button>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  transitionStatusMutation.mutate({ id: m.id, targetStatus: 'PENDING_TERMINATION', reason: 'Khởi động thủ tục quyết toán' });
                                }}
                                className="px-2 py-1 bg-purple-50 hover:bg-purple-100 text-purple-800 border border-purple-200 font-bold rounded-md text-[11px] transition-colors cursor-pointer"
                                title="Chuyển sang bước chờ quyết toán"
                              >
                                Quyết toán
                              </button>
                            </>
                          )}
                          {m.status === 'SUSPENDED' && (
                            <>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleReactivateMember(m);
                                }}
                                className="px-2 py-1 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 font-bold rounded-md text-[11px] transition-colors cursor-pointer"
                                title="Khôi phục trạng thái Đang hoạt động"
                              >
                                Khôi phục
                              </button>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  transitionStatusMutation.mutate({ id: m.id, targetStatus: 'PENDING_TERMINATION', reason: 'Chuyển sang thủ tục quyết toán' });
                                }}
                                className="px-2 py-1 bg-purple-50 hover:bg-purple-100 text-purple-800 border border-purple-200 font-bold rounded-md text-[11px] transition-colors cursor-pointer"
                                title="Chuyển sang bước chờ quyết toán"
                              >
                                Quyết toán
                              </button>
                            </>
                          )}
                          {m.status === 'PENDING_TERMINATION' && (
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleOpenTerminationCheck(m);
                              }}
                              className="px-2 py-1 bg-rose-100 hover:bg-rose-200 text-rose-800 border border-rose-300 font-extrabold rounded-md text-[11px] transition-colors cursor-pointer"
                              title="Kiểm tra 4 điều kiện cấn trừ nợ và chấm dứt tư cách"
                            >
                              Chấm dứt
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
              onTerminate={handleOpenTerminationCheck}
              transactions={transactions}
            />
          </div>
        </div>

      {/* ========================================================================= */}
      {/* 5-STEP WIZARD MODAL: THÊM XÃ VIÊN MỚI */}
      {/* ========================================================================= */}
      <MemberWizard
        isOpen={showWizardModal}
        onClose={() => setShowWizardModal(false)}
        nextMemberNumber={members.length + 1}
        totalMemberCapital={totalMemberCapital}
        onAddMemberAndTx={(newMem, firstTx) => {
          createMemberMutation.mutate(newMem, {
            onSuccess: () => {
              if (firstTx) {
                setTransactions((prev) => [...prev, firstTx]);
              }
              triggerToast(`Đã thêm thành công xã viên mới ${newMem.full_name} (${newMem.member_code})!`);
            },
          });
        }}
        triggerToast={triggerToast}
      />

      {/* REDESIGNED EDIT MEMBER MODAL */}
      <MemberEditModal
        isOpen={showEditModal}
        member={editingMember}
        onClose={() => setShowEditModal(false)}
        onSave={(updatedMem) => {
          updateMemberMutation.mutate(updatedMem, {
            onSuccess: () => {
              if (selectedMember?.id === updatedMem.id) setSelectedMember(updatedMem);
              triggerToast(`Đã cập nhật thông tin xã viên ${updatedMem.member_code} thành công!`);
            },
          });
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

      {/* MODAL KIỂM TRA 4 ĐIỀU KIỆN CHẤM DỨT TƯ CÁCH XÃ VIÊN (LUẬT HTX 2023) */}
      {showTerminationCheckModal && terminatingMember && terminationCheckResult && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 animate-fade-in">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-100 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2 text-rose-700 font-extrabold text-base">
                <AlertTriangle className="w-5 h-5 text-rose-600" />
                <span>Kiểm Tra 4 Điều Kiện Chấm Dứt Tư Cách</span>
              </div>
              <button onClick={() => setShowTerminationCheckModal(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 text-xs text-slate-700 space-y-1">
              <p className="font-bold text-slate-900">Xã viên: {terminatingMember.full_name} ({terminatingMember.member_code})</p>
              <p>Địa chỉ: {terminatingMember.address}</p>
              <p>Tổng vốn góp: <span className="font-extrabold text-emerald-700">{terminatingMember.total_capital_contributed?.toLocaleString('vi-VN')} ₫</span></p>
            </div>

            <div className="space-y-2 text-xs">
              <p className="font-bold text-slate-800 uppercase tracking-wide text-[11px]">Bảng kiểm 4 điều kiện cấn trừ công nợ &amp; nghĩa vụ (Luật HTX 2023):</p>
              
              {/* Check 1 */}
              <div className={`p-3 rounded-lg border flex items-start gap-2.5 ${terminationCheckResult.zeroDebt ? 'bg-emerald-50 border-emerald-200 text-emerald-900' : 'bg-rose-50 border-rose-200 text-rose-900'}`}>
                {terminationCheckResult.zeroDebt ? <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" /> : <XCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />}
                <div>
                  <div className="font-bold text-[12.5px]">1. Không còn dư nợ vật tư trả chậm</div>
                  <div className="text-[11.5px] opacity-90">
                    {terminationCheckResult.zeroDebt ? 'Đã tất toán 100% công nợ vật tư.' : `Tồn dư nợ: ${terminationCheckResult.debtAmount.toLocaleString('vi-VN')} ₫ (Cần cấn trừ/thu hồi trước khi chấm dứt)`}
                  </div>
                </div>
              </div>

              {/* Check 2 */}
              <div className={`p-3 rounded-lg border flex items-start gap-2.5 ${terminationCheckResult.noPendingHarvests ? 'bg-emerald-50 border-emerald-200 text-emerald-900' : 'bg-rose-50 border-rose-200 text-rose-900'}`}>
                {terminationCheckResult.noPendingHarvests ? <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" /> : <XCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />}
                <div>
                  <div className="font-bold text-[12.5px]">2. Không còn hợp đồng giao nộp nông sản treo</div>
                  <div className="text-[11.5px] opacity-90">
                    {terminationCheckResult.noPendingHarvests ? 'Tất cả hợp đồng giao nộp sản phẩm đã nghiệm thu.' : `Còn ${terminationCheckResult.pendingHarvestCount} hợp đồng chưa thanh lý.`}
                  </div>
                </div>
              </div>

              {/* Check 3 */}
              <div className={`p-3 rounded-lg border flex items-start gap-2.5 ${terminationCheckResult.noInternalLoans ? 'bg-emerald-50 border-emerald-200 text-emerald-900' : 'bg-rose-50 border-rose-200 text-rose-900'}`}>
                {terminationCheckResult.noInternalLoans ? <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" /> : <XCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />}
                <div>
                  <div className="font-bold text-[12.5px]">3. Không còn khoản vay tín dụng nội bộ</div>
                  <div className="text-[11.5px] opacity-90">
                    {terminationCheckResult.noInternalLoans ? 'Không có khoản vay nội bộ tồn đọng.' : `Còn ${terminationCheckResult.internalLoanCount} khoản vay chưa tất toán.`}
                  </div>
                </div>
              </div>

              {/* Check 4 */}
              <div className={`p-3 rounded-lg border flex items-start gap-2.5 ${terminationCheckResult.capitalRefundPlanned ? 'bg-emerald-50 border-emerald-200 text-emerald-900' : 'bg-rose-50 border-rose-200 text-rose-900'}`}>
                {terminationCheckResult.capitalRefundPlanned ? <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" /> : <XCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />}
                <div>
                  <div className="font-bold text-[12.5px]">4. Phương án hoàn trả vốn góp đã được ghi nhận</div>
                  <div className="text-[11.5px] opacity-90">
                    {terminationCheckResult.capitalRefundPlanned ? 'Đã lập phương án hoàn trả phần vốn góp theo Điều lệ.' : 'Chưa lập phương án hoàn trả vốn.'}
                  </div>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
              <button
                onClick={() => setShowTerminationCheckModal(false)}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl text-xs transition-colors"
              >
                Hủy bỏ
              </button>
              <button
                onClick={handleConfirmTermination}
                disabled={!terminationCheckResult.canTerminate || transitionStatusMutation.isPending}
                className={`px-4 py-2 font-extrabold rounded-xl text-xs flex items-center gap-1.5 transition-all shadow-md ${
                  terminationCheckResult.canTerminate
                    ? 'bg-rose-600 hover:bg-rose-700 text-white cursor-pointer'
                    : 'bg-slate-200 text-slate-400 cursor-not-allowed'
                }`}
              >
                <UserX className="w-4 h-4" />
                {transitionStatusMutation.isPending ? 'Đang xử lý...' : 'Xác nhận Chấm dứt tư cách (Soft Delete)'}
              </button>
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
