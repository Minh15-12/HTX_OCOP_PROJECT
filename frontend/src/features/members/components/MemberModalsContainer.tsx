import React from 'react';
import { MemberWizard } from './MemberWizard';
import { MemberEditModal } from './MemberEditModal';
import {
  DeleteMemberModal,
  ApproveRejectModal,
  RefundNoticeModal,
} from './MemberStatusModals';
import { MemberTerminationCheckModal } from './MemberTerminationCheckModal';
import { Member, CapitalTransaction } from '@/types/memberTypes';

interface MemberModalsContainerProps {
  showWizardModal: boolean;
  setShowWizardModal: (open: boolean) => void;
  showEditModal: boolean;
  setShowEditModal: (open: boolean) => void;
  editingMember: Member | null;
  setEditingMember: (m: Member | null) => void;
  showDeleteModal: boolean;
  setShowDeleteModal: (open: boolean) => void;
  deletingMember: Member | null;
  showApproveModal: boolean;
  setShowApproveModal: (open: boolean) => void;
  approvingMember: Member | null;
  showRefundNoticeModal: Member | null;
  setShowRefundNoticeModal: (m: Member | null) => void;
  showTerminationCheckModal: boolean;
  setShowTerminationCheckModal: (open: boolean) => void;
  terminatingMember: Member | null;
  terminationCheckResult: any;
  isTerminationPending: boolean;
  totalMembersCount: number;
  totalMemberCapital: number;
  selectedMember: Member | null;
  setSelectedMember: (m: Member | null) => void;
  onAddMemberAndTx: (newMem: Member, firstTx?: CapitalTransaction) => void;
  onUpdateMember: (updatedMem: Member) => void;
  onConfirmDelete: () => void;
  onConfirmApprove: () => void;
  onConfirmReject: () => void;
  onConfirmTermination: () => void;
  triggerToast: (msg: string, type?: 'success' | 'danger' | 'warning' | 'info') => void;
}

export const MemberModalsContainer: React.FC<MemberModalsContainerProps> = ({
  showWizardModal,
  setShowWizardModal,
  showEditModal,
  setShowEditModal,
  editingMember,
  showDeleteModal,
  setShowDeleteModal,
  deletingMember,
  showApproveModal,
  setShowApproveModal,
  approvingMember,
  showRefundNoticeModal,
  setShowRefundNoticeModal,
  showTerminationCheckModal,
  setShowTerminationCheckModal,
  terminatingMember,
  terminationCheckResult,
  isTerminationPending,
  totalMembersCount,
  totalMemberCapital,
  selectedMember,
  setSelectedMember,
  onAddMemberAndTx,
  onUpdateMember,
  onConfirmDelete,
  onConfirmApprove,
  onConfirmReject,
  onConfirmTermination,
  triggerToast,
}) => {
  return (
    <>
      {/* 5-STEP WIZARD MODAL */}
      <MemberWizard
        isOpen={showWizardModal}
        onClose={() => setShowWizardModal(false)}
        nextMemberNumber={totalMembersCount + 1}
        totalMemberCapital={totalMemberCapital}
        onAddMemberAndTx={onAddMemberAndTx}
        triggerToast={triggerToast}
      />

      {/* EDIT MEMBER MODAL */}
      <MemberEditModal
        isOpen={showEditModal}
        member={editingMember}
        onClose={() => setShowEditModal(false)}
        onSave={(updatedMem) => {
          onUpdateMember(updatedMem);
          if (selectedMember?.id === updatedMem.id) setSelectedMember(updatedMem);
        }}
        triggerToast={triggerToast}
      />

      {/* DELETE / DEACTIVATE CONFIRMATION MODAL */}
      <DeleteMemberModal
        isOpen={showDeleteModal}
        member={deletingMember}
        onClose={() => setShowDeleteModal(false)}
        onConfirm={onConfirmDelete}
      />

      {/* APPROVE / REJECT MEMBER MODAL */}
      <ApproveRejectModal
        isOpen={showApproveModal}
        member={approvingMember}
        onClose={() => setShowApproveModal(false)}
        onApprove={onConfirmApprove}
        onReject={onConfirmReject}
      />

      {/* CAPITAL REFUND NOTICE & PAYMENT VOUCHER MODAL */}
      <RefundNoticeModal
        member={showRefundNoticeModal}
        onForwardToAccountant={(mem) => {
          triggerToast(
            `Đã chuyển lệnh chi hoàn trả ${(
              mem.contributed_capital ||
              mem.total_capital_contributed ||
              0
            ).toLocaleString('vi-VN')} ₫ sang Kế toán!`,
            'warning'
          );
          setShowRefundNoticeModal(null);
        }}
        onConfirmRefundPaid={(mem) => {
          triggerToast(
            `Đã lập Phiếu Chi & Xác nhận xuất quỹ hoàn tiền ${(
              mem.contributed_capital ||
              mem.total_capital_contributed ||
              0
            ).toLocaleString('vi-VN')} ₫ thành công!`,
            'success'
          );
          setShowRefundNoticeModal(null);
        }}
        onPostpone={() => {
          triggerToast(`Đã lưu nhiệm vụ hoàn vốn để xử lý sau.`, 'info');
          setShowRefundNoticeModal(null);
        }}
      />

      {/* 4-CONDITION TERMINATION CHECK MODAL */}
      <MemberTerminationCheckModal
        isOpen={showTerminationCheckModal}
        member={terminatingMember}
        result={terminationCheckResult}
        onClose={() => setShowTerminationCheckModal(false)}
        onConfirm={onConfirmTermination}
        isPending={isTerminationPending}
      />
    </>
  );
};
