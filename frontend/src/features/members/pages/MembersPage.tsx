import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Plus, FileSpreadsheet, CheckCircle2, AlertCircle, Loader2, Users, MapPin, UserCheck } from 'lucide-react';
import { MemberDrawer } from '../components/MemberDrawer';
import { MembersTable } from '../components/MembersTable';
import { MemberKpiCards } from '../components/MemberKpiCards';
import { MemberModalsContainer } from '../components/MemberModalsContainer';
import { LandContributionsTab } from '../components/LandContributionsTab';
import { MemberProfileModal } from '../components/MemberProfileModal';
import { CapitalCertificateModal } from '../components/CapitalCertificateModal';
import { CapitalVoucherModal } from '../components/CapitalVoucherModal';
import { buildCapitalCertificate } from '../utils/certificateUtils';
import { useMembersData } from '../hooks/useMembersData';
import { exportMembersToExcel } from '@/utils/excelExporter';
import { downloadServerReportXlsx } from '@/utils/exportUtils';
import { useTenantContextStore } from '@/stores/tenantContextStore';
import { Member, CapitalTransaction, CapitalCertificate } from '@/types/memberTypes';

export const MembersPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { activeCooperative } = useTenantContextStore();
  const [activeTab, setActiveTab] = useState<'members' | 'land' | 'pending'>('members');
  const [showLandModal, setShowLandModal] = useState(false);

  // New In-app A4 PDF Modals state (Zero HTML popups)
  const [profileModalMember, setProfileModalMember] = useState<Member | null>(null);
  const [certificateModalCert, setCertificateModalCert] = useState<CapitalCertificate | null>(null);
  const [voucherModalTx, setVoucherModalTx] = useState<{ member: Member; tx?: CapitalTransaction } | null>(null);

  const {
    members,
    loadingMembers,
    transactions,
    setTransactions,
    toast,
    triggerToast,
    createMemberMutation,
    updateMemberMutation,
    transitionStatusMutation,
    showWizardModal,
    setShowWizardModal,
    showEditModal,
    setShowEditModal,
    editingMember,
    setEditingMember,
    showDeleteModal,
    setShowDeleteModal,
    deletingMember,
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
    totalMembersCount,
    officialMembersCount,
    associatedMembersCount,
    pendingMembersCount,
    activeMembersCount,
    totalMemberCapital,
    handleOpenEdit,
    handleConfirmDelete,
    handleReactivateMember,
    handleSuspendMember,
    handleOpenTerminationCheck,
    handleConfirmTermination,
    handleConfirmApprove,
    handleConfirmReject,
    handleSelectMember,
  } = useMembersData();

  const paramMemberId = searchParams.get('member_id') || searchParams.get('memberId');
  const paramSearch = searchParams.get('search');

  useEffect(() => {
    if (paramSearch) {
      setSearch(paramSearch);
    }
    if (paramMemberId && members.length > 0) {
      const found = members.find((m) => m.id === paramMemberId || m.member_code === paramMemberId);
      if (found) {
        setSelectedMember(found);
      }
    }
  }, [paramMemberId, paramSearch, members, setSearch, setSelectedMember]);

  const handleOpenCertificateModal = (m: Member, targetIssueCount?: number) => {
    const cert = buildCapitalCertificate(m, transactions, activeCooperative, targetIssueCount);
    setCertificateModalCert(cert);
  };

  if (loadingMembers) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] text-slate-500 gap-3">
        <Loader2 className="w-8 h-8 animate-spin text-emerald-600" />
        <span className="text-sm font-semibold">Đang tải dữ liệu xã viên...</span>
      </div>
    );
  }

  return (
    <div className="space-y-4 pb-12">
      {/* Toast Notification Floating */}
      {toast && (
        <div
          className={`fixed top-4 right-4 z-50 px-4 py-3 rounded-xl shadow-modal text-white text-xs font-extrabold flex items-center gap-2 animate-bounce ${
            toast.type === 'success'
              ? 'bg-emerald-600'
              : toast.type === 'warning'
              ? 'bg-amber-600'
              : toast.type === 'info'
              ? 'bg-blue-600'
              : 'bg-rose-600'
          }`}
        >
          {toast.type === 'success' ? (
            <CheckCircle2 className="w-4 h-4" />
          ) : (
            <AlertCircle className="w-4 h-4" />
          )}
          {toast.message}
        </div>
      )}

      {/* PAGE HEADER */}
      <div className="bg-white border border-[#e7e9ec] rounded-xl p-4 shadow-subtle flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-extrabold text-slate-900 tracking-tight">
            Quản lý Xã viên Hợp tác xã
          </h1>
          <p className="text-[12.8px] text-slate-500 mt-0.5">
            Quản lý danh sách, phân loại thành viên &amp; kiểm soát quyền biểu quyết (Luật HTX 2023)
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowWizardModal(true)}
            className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-[12.8px] rounded-lg shadow-sm inline-flex items-center gap-1.5 transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4" /> Thêm xã viên mới
          </button>
          <button
            onClick={async () => {
              try {
                await downloadServerReportXlsx(
                  '/reports/export/members',
                  `danh_ba_xa_vien_${new Date().toISOString().slice(0, 10)}.xlsx`
                );
                triggerToast('Đã tải thành công file Excel Danh sách xã viên từ Server!');
              } catch {
                exportMembersToExcel(members);
                triggerToast('Đã xuất thành công file Excel Danh sách xã viên!');
              }
            }}
            className="px-3.5 py-2 border border-slate-200 hover:bg-slate-50 text-slate-700 font-bold text-[12.8px] rounded-lg inline-flex items-center gap-1.5 bg-white shadow-xs cursor-pointer"
          >
            <FileSpreadsheet className="w-4 h-4 text-emerald-600" /> Xuất Excel
          </button>
        </div>
      </div>

      {/* TOP 5 KPI SUMMARY CARDS */}
      <MemberKpiCards
        totalMembersCount={totalMembersCount}
        activeMembersCount={activeMembersCount}
        officialMembersCount={officialMembersCount}
        associatedMembersCount={associatedMembersCount}
        pendingMembersCount={pendingMembersCount}
        totalMemberCapital={totalMemberCapital}
        onFilterPending={() => setStatusFilter('PENDING')}
        onNavigateCapital={() => navigate('/capital')}
      />

      {/* 3-Tabs Navigation Bar */}
      <div className="flex items-center gap-2 border-b border-slate-200 bg-white p-2 rounded-2xl shadow-xs overflow-x-auto">
        <button
          type="button"
          onClick={() => {
            setActiveTab('members');
            setStatusFilter('ALL');
          }}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-black transition cursor-pointer whitespace-nowrap ${
            activeTab === 'members'
              ? 'bg-emerald-700 text-white shadow-xs'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
          }`}
        >
          <Users className="w-4 h-4" />
          <span>Tab 1: Sổ Đăng Ký Xã Viên ({totalMembersCount})</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('land')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-black transition cursor-pointer whitespace-nowrap ${
            activeTab === 'land'
              ? 'bg-emerald-700 text-white shadow-xs'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
          }`}
        >
          <MapPin className="w-4 h-4" />
          <span>Tab 2: Đất Đai &amp; QSDĐ Đóng Góp</span>
        </button>

        <button
          type="button"
          onClick={() => {
            setActiveTab('pending');
            setStatusFilter('PENDING');
          }}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-black transition cursor-pointer whitespace-nowrap ${
            activeTab === 'pending'
              ? 'bg-amber-600 text-white shadow-xs'
              : 'text-amber-800 bg-amber-50 hover:bg-amber-100'
          }`}
        >
          <UserCheck className="w-4 h-4" />
          <span>Tab 3: Đơn Chờ Xét Duyệt ({pendingMembersCount})</span>
        </button>
      </div>

      {activeTab === 'land' ? (
        <LandContributionsTab />
      ) : (
        /* MAIN MEMBER TABLE & DRAWER */
        <div className="w-full">
        <MembersTable
          members={members}
          selectedMember={selectedMember}
          onSelectMember={handleSelectMember}
          onOpenEdit={handleOpenEdit}
          onOpenApprove={(m) => {
            setApprovingMember(m);
            setShowApproveModal(true);
          }}
          onOpenReject={(m) => {
            setApprovingMember(m);
            setShowApproveModal(true);
          }}
          onSuspendMember={handleSuspendMember}
          onReactivateMember={handleReactivateMember}
          onTransitionStatus={(id, targetStatus, reason) =>
            transitionStatusMutation.mutate({ id, targetStatus, reason })
          }
          onOpenTerminationCheck={handleOpenTerminationCheck}
          onPrintMember={(m) => setProfileModalMember(m)}
          search={search}
          setSearch={setSearch}
          statusFilter={statusFilter}
          setStatusFilter={setStatusFilter}
          typeFilter={typeFilter}
          setTypeFilter={setTypeFilter}
          currentPage={currentPage}
          setCurrentPage={setCurrentPage}
          pageSize={pageSize}
        />

        {/* Drawer Details Member */}
        <MemberDrawer
          isOpen={!!selectedMember}
          member={selectedMember}
          onClose={() => setSelectedMember(null)}
          onEdit={handleOpenEdit}
          onApprove={(m) => {
            setApprovingMember(m);
            setShowApproveModal(true);
          }}
          onReject={(m) => {
            setApprovingMember(m);
            setShowApproveModal(true);
          }}
          onPrint={(m) => setProfileModalMember(m)}
          onPrintCertificate={handleOpenCertificateModal}
          onPrintVoucher={(m, tx) =>
            setVoucherModalTx({
              member: m,
              tx: tx || transactions.find((t) => t.member_id === m.id || t.member_code === m.member_code),
            })
          }
          onPreviewFile={() => {}}
          onSuspend={handleSuspendMember}
          onRestore={handleReactivateMember}
          onTerminate={handleOpenTerminationCheck}
          transactions={transactions}
        />
      </div>
      )}

      {/* MODALS CONTAINER */}
      <MemberModalsContainer
        showWizardModal={showWizardModal}
        setShowWizardModal={setShowWizardModal}
        showEditModal={showEditModal}
        setShowEditModal={setShowEditModal}
        editingMember={editingMember}
        setEditingMember={setEditingMember}
        showDeleteModal={showDeleteModal}
        setShowDeleteModal={setShowDeleteModal}
        deletingMember={deletingMember}
        showApproveModal={showApproveModal}
        setShowApproveModal={setShowApproveModal}
        approvingMember={approvingMember}
        showRefundNoticeModal={showRefundNoticeModal}
        setShowRefundNoticeModal={setShowRefundNoticeModal}
        showTerminationCheckModal={showTerminationCheckModal}
        setShowTerminationCheckModal={setShowTerminationCheckModal}
        terminatingMember={terminatingMember}
        terminationCheckResult={terminationCheckResult}
        isTerminationPending={transitionStatusMutation.isPending}
        totalMembersCount={totalMembersCount}
        totalMemberCapital={totalMemberCapital}
        selectedMember={selectedMember}
        setSelectedMember={setSelectedMember}
        onAddMemberAndTx={(newMem, firstTx) => {
          createMemberMutation.mutate(newMem, {
            onSuccess: () => {
              if (firstTx) setTransactions((prev) => [...prev, firstTx]);
              triggerToast(
                `Đã thêm thành công xã viên mới ${newMem.full_name} (${newMem.member_code})!`
              );
            },
          });
        }}
        onUpdateMember={(updatedMem) => {
          updateMemberMutation.mutate(updatedMem, {
            onSuccess: () => {
              triggerToast(`Đã cập nhật thông tin xã viên ${updatedMem.member_code} thành công!`);
            },
          });
        }}
        onConfirmDelete={handleConfirmDelete}
        onConfirmApprove={handleConfirmApprove}
        onConfirmReject={handleConfirmReject}
        onConfirmTermination={handleConfirmTermination}
        triggerToast={triggerToast}
      />

      {/* SỔ TỜ KHAI HỒ SƠ XÃ VIÊN (A4 PDF - ZERO HTML POPUPS) */}
      <MemberProfileModal
        isOpen={!!profileModalMember}
        member={profileModalMember}
        onClose={() => setProfileModalMember(null)}
      />

      {/* GIẤY CHỨNG NHẬN VỐN GÓP (A4 PDF - ZERO HTML POPUPS) */}
      <CapitalCertificateModal
        isOpen={!!certificateModalCert}
        certificate={certificateModalCert}
        onClose={() => setCertificateModalCert(null)}
      />

      {/* CHỨNG TỪ KẾ TOÁN GÓP VỐN (A4 PDF - ZERO HTML POPUPS) */}
      <CapitalVoucherModal
        transaction={voucherModalTx?.tx || null}
        member={voucherModalTx?.member || null}
        onClose={() => setVoucherModalTx(null)}
      />
    </div>
  );
};

export default MembersPage;
