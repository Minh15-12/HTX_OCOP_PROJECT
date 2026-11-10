import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  getMembersFromApi,
  createMemberApi,
  updateMemberApi,
  deleteMemberApi,
  approveMemberApi,
  transitionMemberStatusApi,
} from '@/services/memberService';
import {
  getStoredCapitalTransactions,
  saveCapitalTransactionsToStorage,
} from '@/services/dbStorage';
import { Member, CapitalTransaction } from '@/types/memberTypes';

export function useMembersData() {
  const queryClient = useQueryClient();

  // TanStack React Query v5 Data Fetching
  const { data: members = [], isLoading: loadingMembers } = useQuery<Member[]>({
    queryKey: ['members'],
    queryFn: async () => {
      const apiData = await getMembersFromApi();
      return apiData;
    },
    staleTime: 0,
  });

  const [transactions, setTransactions] = useState<CapitalTransaction[]>(
    () => getStoredCapitalTransactions() || []
  );

  useEffect(() => {
    if (transactions && transactions.length > 0) {
      saveCapitalTransactionsToStorage(transactions);
    }
  }, [transactions]);

  // Toast State
  const [toast, setToast] = useState<{
    message: string;
    type: 'success' | 'danger' | 'warning' | 'info';
  } | null>(null);

  const triggerToast = (
    message: string,
    type: 'success' | 'danger' | 'warning' | 'info' = 'success'
  ) => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3500);
  };

  // Mutations
  const createMemberMutation = useMutation({
    mutationFn: (data: Member) => createMemberApi(data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['members'] }),
  });

  const updateMemberMutation = useMutation({
    mutationFn: (data: Member) => updateMemberApi(data.id, data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['members'] }),
  });

  const deleteMemberMutation = useMutation({
    mutationFn: (id: string) => deleteMemberApi(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['members'] }),
  });

  const approveMemberMutation = useMutation({
    mutationFn: (id: string) => approveMemberApi(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['members'] }),
  });

  const transitionStatusMutation = useMutation({
    mutationFn: ({
      id,
      targetStatus,
      reason,
    }: {
      id: string;
      targetStatus: string;
      reason?: string;
    }) => transitionMemberStatusApi(id, targetStatus, reason),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['members'] }),
  });

  // Modal States
  const [showWizardModal, setShowWizardModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingMember, setEditingMember] = useState<Member | null>(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deletingMember, setDeletingMember] = useState<Member | null>(null);
  const [showApproveModal, setShowApproveModal] = useState(false);
  const [approvingMember, setApprovingMember] = useState<Member | null>(null);
  const [showRefundNoticeModal, setShowRefundNoticeModal] = useState<Member | null>(null);

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
  const [selectedMember, setSelectedMember] = useState<Member | null>(null);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [pageSize, setPageSize] = useState<number>(6);

  useEffect(() => {
    setCurrentPage(1);
  }, [search, typeFilter, statusFilter]);

  // Calculations for KPI Cards
  const totalMembersCount = members.length;
  const officialMembersCount = members.filter((m) => m.member_type === 'CHINH_THUC').length;
  const associatedMembersCount = members.filter((m) => m.member_type !== 'CHINH_THUC').length;
  const pendingMembersCount = members.filter((m) => m.status === 'PENDING').length;
  const activeMembersCount = members.filter((m) => m.status === 'ACTIVE').length;
  const totalMemberCapital = members.reduce(
    (sum, m) => sum + (m.total_capital_contributed || m.contributed_capital || 0),
    0
  );

  // Handlers
  const handleOpenEdit = (m: Member) => {
    setEditingMember({ ...m });
    setShowEditModal(true);
  };

  const handleOpenDelete = (m: Member) => {
    setDeletingMember(m);
    setShowDeleteModal(true);
  };

  const handleConfirmDelete = () => {
    if (!deletingMember) return;
    if ((deletingMember.current_debt || 0) > 0) {
      triggerToast(
        `Không thể ngưng hoạt động xã viên ${deletingMember.full_name} vì còn dư nợ ${(
          deletingMember.current_debt || 0
        ).toLocaleString('vi-VN')} ₫. Vui lòng cấn trừ/thu hồi công nợ trước!`,
        'warning'
      );
      return;
    }
    deleteMemberMutation.mutate(deletingMember.id, {
      onSuccess: () => {
        triggerToast(
          `Đã chuyển xã viên ${deletingMember.full_name} sang trạng thái "Đã ngưng hoạt động / Đã rút khỏi HTX".`,
          'info'
        );
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
          triggerToast(
            `Đã khôi phục xã viên ${m.full_name} (${m.member_code}) sang trạng thái Đang hoạt động.`,
            'success'
          );
        },
      }
    );
  };

  const handleSuspendMember = (m: Member) => {
    transitionStatusMutation.mutate(
      { id: m.id, targetStatus: 'SUSPENDED', reason: 'Tạm đình chỉ tư cách xã viên' },
      {
        onSuccess: () => {
          triggerToast(`Đã tạm đình chỉ xã viên ${m.full_name}.`, 'warning');
        },
      }
    );
  };

  const handleOpenTerminationCheck = (m: Member) => {
    setTerminatingMember(m);
    const zeroDebt = (m.current_debt || 0) === 0;
    setTerminationCheckResult({
      zeroDebt,
      debtAmount: m.current_debt || 0,
      noPendingHarvests: true,
      pendingHarvestCount: 0,
      noInternalLoans: true,
      internalLoanCount: 0,
      capitalRefundPlanned: true,
      canTerminate: zeroDebt,
    });
    setShowTerminationCheckModal(true);
  };

  const handleConfirmTermination = () => {
    if (!terminatingMember || !terminationCheckResult) return;
    if (!terminationCheckResult.canTerminate) {
      triggerToast('Không thể chấm dứt tư cách xã viên khi chưa hết công nợ!', 'danger');
      return;
    }

    transitionStatusMutation.mutate(
      {
        id: terminatingMember.id,
        targetStatus: 'TERMINATED',
        reason: 'Hoàn tất thủ tục cấn trừ nghĩa vụ và rút khỏi HTX',
      },
      {
        onSuccess: () => {
          triggerToast(
            `Đã chấm dứt tư cách xã viên ${terminatingMember.full_name} (${terminatingMember.member_code}) thành công! (Soft deleted)`,
            'success'
          );
          setShowTerminationCheckModal(false);
          setTerminatingMember(null);
        },
      }
    );
  };

  const handleConfirmApprove = () => {
    if (!approvingMember) return;
    approveMemberMutation.mutate(approvingMember.id, {
      onSuccess: () => {
        triggerToast(
          `Đã phê duyệt thành công xã viên ${approvingMember.full_name} (${approvingMember.member_code})!`,
          'success'
        );
        setShowApproveModal(false);
        setApprovingMember(null);
      },
    });
  };

  const handleConfirmReject = () => {
    if (!approvingMember) return;
    const rejectedMem = approvingMember;
    transitionStatusMutation.mutate(
      { id: rejectedMem.id, targetStatus: 'REJECTED', reason: 'Hồ sơ không đủ điều kiện' },
      {
        onSuccess: () => {
          setShowApproveModal(false);
          setApprovingMember(null);
          const contributedAmt =
            rejectedMem.contributed_capital || rejectedMem.total_capital_contributed || 0;
          if (contributedAmt > 0) {
            setShowRefundNoticeModal(rejectedMem);
          } else {
            triggerToast(`Đã từ chối kết nạp xã viên ${rejectedMem.full_name}.`, 'warning');
          }
        },
      }
    );
  };

  const handleSelectMember = (m: Member) => {
    setSelectedMember(m);
    setTimeout(() => {
      const el = document.getElementById('member-detail-panel');
      if (el) el.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }, 50);
  };

  return {
    members,
    loadingMembers,
    transactions,
    setTransactions,
    toast,
    triggerToast,
    // Mutations
    createMemberMutation,
    updateMemberMutation,
    deleteMemberMutation,
    approveMemberMutation,
    transitionStatusMutation,
    // Modals
    showWizardModal,
    setShowWizardModal,
    showEditModal,
    setShowEditModal,
    editingMember,
    setEditingMember,
    showDeleteModal,
    setShowDeleteModal,
    deletingMember,
    setDeletingMember,
    showApproveModal,
    setShowApproveModal,
    approvingMember,
    setApprovingMember,
    showRefundNoticeModal,
    setShowRefundNoticeModal,
    showTerminationCheckModal,
    setShowTerminationCheckModal,
    terminatingMember,
    terminationCheckResult,
    // Filters & Pagination
    search,
    setSearch,
    typeFilter,
    setTypeFilter,
    statusFilter,
    setStatusFilter,
    selectedMember,
    setSelectedMember,
    currentPage,
    setCurrentPage,
    pageSize,
    setPageSize,
    // KPI
    totalMembersCount,
    officialMembersCount,
    associatedMembersCount,
    pendingMembersCount,
    activeMembersCount,
    totalMemberCapital,
    // Handlers
    handleOpenEdit,
    handleOpenDelete,
    handleConfirmDelete,
    handleReactivateMember,
    handleSuspendMember,
    handleOpenTerminationCheck,
    handleConfirmTermination,
    handleConfirmApprove,
    handleConfirmReject,
    handleSelectMember,
  };
}
