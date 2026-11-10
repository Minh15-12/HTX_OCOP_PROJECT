import React from 'react';
import { Member, CapitalTransaction } from '@/types/memberTypes';
import { MemberDrawer } from './MemberDrawer';

interface CapitalMemberDrawerProps {
  isOpen: boolean;
  member: Member | null;
  onClose: () => void;
  transactions?: CapitalTransaction[];
  onOpenCertificate?: (member: Member, issueCount?: number) => void;
  onViewVoucher?: (transaction: CapitalTransaction) => void;
  onRecordCapital?: (member: Member) => void;
  onAddLand?: (member: Member) => void;
}

/**
 * Unified CapitalMemberDrawer adapter:
 * Tái sử dụng trực tiếp MemberDrawer với initialTab='capital',
 * loại bỏ hoàn toàn 761 dòng mã trùng lặp bloatware.
 */
export const CapitalMemberDrawer: React.FC<CapitalMemberDrawerProps> = ({
  isOpen,
  member,
  onClose,
  transactions = [],
  onOpenCertificate,
  onViewVoucher,
  onRecordCapital,
}) => {
  return (
    <MemberDrawer
      isOpen={isOpen}
      member={member}
      onClose={onClose}
      transactions={transactions}
      initialTab="capital"
      onPrintCertificate={onOpenCertificate}
      onPrintVoucher={(_, tx) => tx && onViewVoucher?.(tx)}
      onRecordCapital={onRecordCapital}
    />
  );
};

export default CapitalMemberDrawer;
