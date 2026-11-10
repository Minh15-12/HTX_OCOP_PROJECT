import { Member, CapitalTransaction, CapitalCertificate } from '@/types/memberTypes';

/**
 * Builds a standardized CapitalCertificate object according to
 * Luật Hợp tác xã số 17/2023/QH15 and Decree 30/2020/NĐ-CP.
 */
export const buildCapitalCertificate = (
  member: Member,
  transactions: CapitalTransaction[] = [],
  activeCooperative?: {
    legal_name?: string;
    address?: string;
    tax_code?: string;
    representative_name?: string;
  } | null,
  targetIssueCount?: number
): CapitalCertificate => {
  const memberTxs = transactions
    .filter(
      (tx) =>
        (tx.member_id === member.id || tx.member_code === member.member_code) &&
        tx.status === 'APPROVED'
    )
    .sort((a, b) => {
      const dateA = a.contribution_date.includes('/')
        ? a.contribution_date.split('/').reverse().join('-')
        : a.contribution_date;
      const dateB = b.contribution_date.includes('/')
        ? b.contribution_date.split('/').reverse().join('-')
        : b.contribution_date;
      return new Date(dateA).getTime() - new Date(dateB).getTime();
    });

  const issueCount =
    targetIssueCount && targetIssueCount > 0
      ? targetIssueCount
      : Math.max(1, memberTxs.length);

  const cumulativeTxs = memberTxs.slice(0, issueCount);
  const cumulativeCapital =
    cumulativeTxs.length > 0
      ? cumulativeTxs.reduce((sum, tx) => sum + tx.amount, 0)
      : member.contributed_capital || member.total_capital_contributed || 0;

  const cashAmount = cumulativeTxs
    .filter((tx) => tx.payment_method === 'CASH' || tx.payment_method === 'BANK_TRANSFER')
    .reduce((sum, tx) => sum + tx.amount, 0);

  const assetAmount = cumulativeTxs
    .filter((tx) => tx.payment_method === 'LAND' || tx.payment_method === 'ASSET')
    .reduce((sum, tx) => sum + tx.amount, 0);

  const latestTx = cumulativeTxs[cumulativeTxs.length - 1];
  const contributionDate = latestTx
    ? latestTx.contribution_date
    : member.join_date || new Date().toISOString().slice(0, 10);
  const currentYear = new Date().getFullYear();
  const certCode = `${String(issueCount).padStart(2, '0')}/${currentYear}/GCN-HTX`;

  return {
    certificate_code: certCode,
    certificate_issue_date: contributionDate,
    issue_count: issueCount,
    legal_base_law:
      'Căn cứ Luật Hợp tác xã số 17/2023/QH15 được Quốc hội nước CHXHCN Việt Nam thông qua và các văn bản hướng dẫn thi hành;',
    legal_base_charter: 'Căn cứ Điều lệ Hợp tác xã được Đại hội thành viên thông qua;',
    cooperative_name: activeCooperative?.legal_name || member.cooperative_name || 'HỢP TÁC XÃ NÔNG NGHIỆP DỊCH VỤ OCOP',
    cooperative_address: activeCooperative?.address || 'Lâm Đồng, Việt Nam',
    cooperative_license_no: activeCooperative?.tax_code || '—',
    cooperative_license_date: (activeCooperative as any)?.license_date || (activeCooperative as any)?.founding_date || '—',
    member_full_name: member.full_name,
    member_gender: member.gender || '—',
    member_dob: member.dob || '—',
    member_ethnicity: member.ethnicity || 'Kinh',
    member_nationality: 'Việt Nam',
    member_address: member.address || member.detail_address || '—',
    member_cccd: member.cccd || '—',
    member_cccd_date: member.cccd_issue_date || '—',
    member_cccd_place: member.cccd_issue_place || '—',
    total_capital_amount: cumulativeCapital,
    capital_in_words: member.capital_in_words || (cumulativeCapital > 0 ? `${(cumulativeCapital / 1000000).toLocaleString('vi-VN')} triệu đồng` : 'Không đồng'),
    contribution_form:
      assetAmount > 0
        ? 'Tiền mặt và Tài sản (Quyền sử dụng đất)'
        : 'Tiền mặt / Chuyển khoản',
    cash_amount_text: cashAmount > 0 ? `${cashAmount.toLocaleString('vi-VN')} VNĐ` : '0 VNĐ',
    asset_amount_text:
      assetAmount > 0 ? `${assetAmount.toLocaleString('vi-VN')} VNĐ (QSDĐ HTX)` : 'Không',
    contribution_date: contributionDate,
    issue_place: 'Lâm Đồng',
    representative_name: activeCooperative?.representative_name || 'Giám đốc HTX',
    qr_code_payload: `HTX_OCOP_CERT:${certCode}|MEMBER:${member.member_code}|AMOUNT:${cumulativeCapital}`,
  };
};
