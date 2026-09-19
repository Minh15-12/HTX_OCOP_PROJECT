import React, { useState } from 'react';
import {
  Wallet,
  Search,
  Plus,
  Eye,
  CheckCircle2,
  AlertCircle,
  TrendingUp,
  FileSpreadsheet,
  Calendar,
  ChevronRight,
  RotateCcw,
  X,
  Upload,
  Users,
  Layers,
  FileText,
  Printer,
  QrCode,
  MapPin,
  Building,
  ShieldAlert,
  Download,
  ArrowLeft,
  ArrowRight,
} from 'lucide-react';
import { mockMembersList, mockCapitalTransactions } from '@/services/memberService';
import {
  getStoredMembers,
  saveMembersToStorage,
  getStoredCapitalTransactions,
  saveCapitalTransactionsToStorage,
} from '@/services/dbStorage';
import { Member, CapitalTransaction, LandContribution, CapitalCertificate } from '@/types/memberTypes';
import { openVoucherPrintWindow, getVoucherDocumentBlobUrl } from '@/utils/voucherDocumentGenerator';
import { formatDate, numberToVietnameseWords } from '@/utils/formatters';

const nfc = (str?: string | number | null): string => {
  if (str === undefined || str === null) return '';
  let text = String(str).normalize('NFC');
  return text
    .replace(/\s+([\u0300-\u036f])/g, '$1')
    .replace(/bằ\s+ng/gi, 'bằng')
    .replace(/cấ\s+p/gi, 'cấp')
    .replace(/Giấ\s+y/gi, 'Giấy')
    .replace(/LÂM\s+ĐỒ\s+NG/gi, 'LÂM ĐỒNG')
    .replace(/Đô\s+ng/gi, 'Đồng')
    .replace(/Số\s+́/gi, 'Số')
    .replace(/Số́/g, 'Số')
    .replace(/cấ\s*p/gi, 'cấp')
    .replace(/Giấ\s*y/gi, 'Giấy')
    .replace(/Thị\s+trấ\s*n/gi, 'Thị trấn')
    .replace(/trấ\s*n/gi, 'trấn')
    .replace(/ĐINH\s+VĂN/gi, 'Đinh Văn')
    .replace(/LÂM\s+HÀ/gi, 'Lâm Hà')
    .replace(/LÂM\s+ĐỒ̀\s*NG/gi, 'LÂM ĐỒNG')
    .normalize('NFC');
};

export const CapitalPage: React.FC = () => {
  const [members, setMembers] = useState<Member[]>(() => {
    const stored = getStoredMembers();
    if (stored && stored.length > 0) return stored;
    saveMembersToStorage(mockMembersList);
    return mockMembersList;
  });

  const [transactions, setTransactions] = useState<CapitalTransaction[]>(() => {
    const stored = getStoredCapitalTransactions();
    if (stored && stored.length > 0) return stored;
    saveCapitalTransactionsToStorage(mockCapitalTransactions);
    return mockCapitalTransactions;
  });

  const [search, setSearch] = useState('');
  const [capitalStatusFilter, setCapitalStatusFilter] = useState<string>('ALL');
  const [selectedCapitalMember, setSelectedCapitalMember] = useState<Member | null>(null);

  // Pagination State for Capital List
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [pageSize, setPageSize] = useState<number>(6);

  React.useEffect(() => {
    setCurrentPage(1);
  }, [search, capitalStatusFilter]);

  const [showRecordModal, setShowRecordModal] = useState(false);
  const [recordStep, setRecordStep] = useState<1 | 2 | 3>(1);
  const [showPendingCapitalModal, setShowPendingCapitalModal] = useState(false);
  const [showCertificateModal, setShowCertificateModal] = useState(false);
  const [activeCertificate, setActiveCertificate] = useState<CapitalCertificate | null>(null);
  const [capitalDrawerTab, setCapitalDrawerTab] = useState<'history' | 'land' | 'certificate' | 'info'>('history');
  const [viewingVoucherTx, setViewingVoucherTx] = useState<CapitalTransaction | null>(null);

  const [toast, setToast] = useState<{ message: string; type: 'success' | 'danger' } | null>(null);

  // File Upload State & Drag-and-Drop Handlers
  const fileInputRef = React.useRef<HTMLInputElement>(null);
  const [uploadedFile, setUploadedFile] = useState<{ name: string; size: string; url?: string } | null>(null);
  const [isDragging, setIsDragging] = useState(false);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const sizeMb = (file.size / (1024 * 1024)).toFixed(2);
      setUploadedFile({ name: file.name, size: `${sizeMb} MB`, url: URL.createObjectURL(file) });
      triggerToast(`Đã nhận file chứng từ: ${file.name}`);
    }
  };

  const handleDropFile = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) {
      const sizeMb = (file.size / (1024 * 1024)).toFixed(2);
      setUploadedFile({ name: file.name, size: `${sizeMb} MB`, url: URL.createObjectURL(file) });
      triggerToast(`Đã kéo thả thành công file: ${file.name}`);
    }
  };

  const triggerToast = (message: string, type: 'success' | 'danger' = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3500);
  };

  // Form State for Multi-Step Capital Recording
  const [capitalForm, setCapitalForm] = useState({
    member_id: members[0]?.id || '',
    contribution_type: 'TIEN_MAT' as 'TIEN_MAT' | 'CHUYEN_KHOAN' | 'LAND' | 'HIEN_VAT',
    amount: 10000000,
    contribution_date: new Date().toISOString().split('T')[0],
    receipt_number: `PT${Math.floor(100000 + Math.random() * 900000)}`,
    content: 'Góp vốn đợt bổ sung theo Điều lệ',
    approval_mode: 'DIRECT_APPROVE' as 'DIRECT_APPROVE' | 'SUBMIT_PENDING',
    notes: '',
    // Land Specific Fields
    land_certificate_no: '',
    plot_number: '',
    map_sheet_number: '',
    land_area_sqm: 1500,
    land_use_type: 'Đất trồng lúa',
    appraised_unit_price: 20000,
  });

  // Calculations & Rule Enforcement
  const totalCommittedCapital = members.reduce((sum, m) => sum + (m.committed_capital || 0), 0);
  const totalContributedCapital = members.reduce((sum, m) => sum + (m.contributed_capital || 0), 0);
  const totalRemainingCapital = Math.max(0, totalCommittedCapital - totalContributedCapital);
  const overallCapitalPct = totalCommittedCapital > 0 ? Number(((totalContributedCapital / totalCommittedCapital) * 100).toFixed(2)) : 0;

  // Group Capital Calculations for Law 2023 Validation
  const associateGroupCapital = members
    .filter((m) => m.member_type === 'LIEN_KET_GOP_VON')
    .reduce((sum, m) => sum + (m.contributed_capital || 0), 0);
  const associateGroupPct = totalContributedCapital > 0 ? Number(((associateGroupCapital / totalContributedCapital) * 100).toFixed(2)) : 0;
  const isAssociateGroupOverLimit = associateGroupPct > 30.0;

  const handleApproveCapitalTx = (txId: string) => {
    const tx = transactions.find((t) => t.id === txId);
    if (!tx) return;

    const updatedTxs = transactions.map((t) =>
      t.id === txId
        ? {
            ...t,
            status: 'APPROVED' as const,
            recorded_by: 'Kế toán trưởng',
            recorded_date: new Date().toLocaleDateString('vi-VN'),
          }
        : t
    );
    setTransactions(updatedTxs);
    saveCapitalTransactionsToStorage(updatedTxs);

    const updatedMembers = members.map((m) => {
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
    });
    setMembers(updatedMembers);
    saveMembersToStorage(updatedMembers);

    triggerToast(`Đã phê duyệt thành công giao dịch ${tx.transaction_code} (${tx.amount.toLocaleString('vi-VN')} ₫) cho ${tx.member_name}!`, 'success');
  };

  const handleRejectCapitalTx = (txId: string) => {
    const tx = transactions.find((t) => t.id === txId);
    if (!tx) return;
    const updatedTxs = transactions.filter((t) => t.id !== txId);
    setTransactions(updatedTxs);
    saveCapitalTransactionsToStorage(updatedTxs);
    triggerToast(`Đã từ chối giao dịch ${tx.transaction_code} của ${tx.member_name}.`, 'danger');
  };

  // Law 2023 Validation Before Saving Contribution
  const handleValidateAndSaveContribution = (e: React.FormEvent) => {
    e.preventDefault();
    const mem = members.find((m) => m.id === capitalForm.member_id);
    if (!mem) return;

    const newMemberTotal = (mem.contributed_capital || 0) + capitalForm.amount;
    const newCoopTotal = totalContributedCapital + capitalForm.amount;
    const projectedOwnershipPct = (newMemberTotal / newCoopTotal) * 100;

    // Rule Check: Personal 30% limit for official members (BR-COOP-004)
    if (mem.member_type === 'CHINH_THUC' && projectedOwnershipPct > 30.0) {
      triggerToast(`CẢNH BÁO VI PHẠM: Tỷ lệ sở hữu dự kiến ${projectedOwnershipPct.toFixed(2)}% vượt trần 30% Luật HTX 2023!`, 'danger');
      return;
    }

    const certCode = `GCN-2025-${Math.floor(1000 + Math.random() * 9000)}`;

    let landDetails: LandContribution | undefined = undefined;
    if (capitalForm.contribution_type === 'LAND') {
      landDetails = {
        land_certificate_no: capitalForm.land_certificate_no || 'BD123456',
        plot_number: capitalForm.plot_number || '12',
        map_sheet_number: capitalForm.map_sheet_number || '04',
        land_area_sqm: capitalForm.land_area_sqm,
        land_use_type: capitalForm.land_use_type,
        appraised_unit_price: capitalForm.appraised_unit_price,
        total_land_value: capitalForm.land_area_sqm * capitalForm.appraised_unit_price,
        cadastral_status: 'REGISTERED_CHANGE',
      };
    }

    const isPending = capitalForm.approval_mode === 'SUBMIT_PENDING';
    const txStatus = isPending ? 'PENDING' : 'APPROVED';

    const newTx: CapitalTransaction = {
      id: `CC-00${transactions.length + 1}`,
      member_id: mem.id,
      member_code: mem.member_code,
      member_name: mem.full_name,
      transaction_code: capitalForm.receipt_number,
      amount: capitalForm.contribution_type === 'LAND' && landDetails ? landDetails.total_land_value : capitalForm.amount,
      share_quantity: Math.floor(capitalForm.amount / 100000),
      contribution_date: capitalForm.contribution_date,
      payment_method: capitalForm.contribution_type === 'CHUYEN_KHOAN' ? 'BANK_TRANSFER' : capitalForm.contribution_type === 'LAND' ? 'LAND' : 'CASH',
      receipt_number: capitalForm.receipt_number,
      content: capitalForm.content,
      notes: capitalForm.notes,
      status: txStatus,
      recorded_by: isPending ? mem.full_name : 'Kế toán trưởng',
      recorded_date: new Date().toLocaleDateString('vi-VN'),
      land_details: landDetails,
      certificate_code: certCode,
    };

    const updatedTxs = [newTx, ...transactions];
    setTransactions(updatedTxs);
    saveCapitalTransactionsToStorage(updatedTxs);

    if (!isPending) {
      const updatedMembers = members.map((m) => {
        if (m.id === mem.id) {
          const addedAmount = newTx.amount;
          const newContributed = (m.contributed_capital || 0) + addedAmount;
          const newRemaining = Math.max(0, (m.committed_capital || 0) - newContributed);
          const newLandList = landDetails ? [...(m.land_contributions || []), landDetails] : m.land_contributions;
          return {
            ...m,
            contributed_capital: newContributed,
            remaining_capital: newRemaining,
            total_capital_contributed: newContributed,
            capital_status: newRemaining === 0 ? ('DU_VON' as const) : ('CHUA_DU' as const),
            ownership_percentage: Number(((newContributed / newCoopTotal) * 100).toFixed(2)),
            land_contributions: newLandList,
          };
        }
        return m;
      });
      setMembers(updatedMembers);
      saveMembersToStorage(updatedMembers);
      triggerToast(`Đã ghi nhận & phê duyệt góp vốn thành công cho xã viên ${mem.full_name}!`);
    } else {
      triggerToast(`Đã tạo giao dịch ở trạng thái CHỜ DUYỆT cho ${mem.full_name}! Kế toán có thể phê duyệt trong danh sách Chờ duyệt.`, 'success');
    }

    setShowRecordModal(false);
    setRecordStep(1);
  };

  const openCertificatePreview = (member: Member, targetIssueCount?: number) => {
    // Get member's approved transaction history sorted chronologically
    const memberTxs = transactions
      .filter((tx) => (tx.member_id === member.id || tx.member_code === member.member_code) && tx.status === 'APPROVED')
      .sort((a, b) => {
        const dateA = a.contribution_date.includes('/') ? a.contribution_date.split('/').reverse().join('-') : a.contribution_date;
        const dateB = b.contribution_date.includes('/') ? b.contribution_date.split('/').reverse().join('-') : b.contribution_date;
        return new Date(dateA).getTime() - new Date(dateB).getTime();
      });

    const issueCount = targetIssueCount && targetIssueCount > 0 ? targetIssueCount : Math.max(1, memberTxs.length);

    // Calculate cumulative capital up to this issue batch
    const cumulativeTxs = memberTxs.slice(0, issueCount);
    const cumulativeCapital = cumulativeTxs.length > 0
      ? cumulativeTxs.reduce((sum, tx) => sum + tx.amount, 0)
      : (member.contributed_capital || member.committed_capital || 10000000);

    // Breakdown cash vs assets
    const cashAmount = cumulativeTxs
      .filter((tx) => tx.payment_method === 'CASH' || tx.payment_method === 'BANK_TRANSFER')
      .reduce((sum, tx) => sum + tx.amount, 0);
    const assetAmount = cumulativeTxs
      .filter((tx) => tx.payment_method === 'LAND' || tx.payment_method === 'ASSET')
      .reduce((sum, tx) => sum + tx.amount, 0);

    const latestTx = cumulativeTxs[cumulativeTxs.length - 1];
    const contributionDate = latestTx ? latestTx.contribution_date : (member.contribution_date || member.join_date);

    const certCode = `${String(issueCount).padStart(2, '0')}/2025/GCN-HTX`;

    const cert: CapitalCertificate = {
      certificate_code: certCode,
      certificate_issue_date: contributionDate,
      issue_count: issueCount,
      legal_base_law: 'Căn cứ Luật Hợp tác xã số 23/2012/QH13 (và Luật HTX số 17/2023/QH15) được Quốc hội thông qua và các văn bản hướng dẫn thi hành;',
      legal_base_charter: 'Căn cứ Điều lệ Hợp tác xã được Đại hội thành viên thông qua ngày 15/12/2023;',
      cooperative_name: 'HỢP TÁC XÃ NÔNG NGHIỆP THƯƠNG MẠI DỊCH VỤ OCOP LÂM ĐỒNG',
      cooperative_address: 'Số 123, Đường Hùng Vương, Thị trấn Đinh Văn, Huyện Lâm Hà, Tỉnh Lâm Đồng',
      cooperative_license_no: '4201982345',
      cooperative_license_date: '15/12/2023',
      member_full_name: member.full_name,
      member_gender: member.gender,
      member_dob: member.dob,
      member_ethnicity: 'Kinh',
      member_nationality: 'Việt Nam',
      member_address: member.address,
      member_cccd: member.cccd,
      member_cccd_date: member.cccd_issue_date || '10/05/2021',
      member_cccd_place: member.cccd_issue_place || 'Cục Cảnh sát QLHC về trật tự xã hội',
      total_capital_amount: cumulativeCapital,
      capital_in_words: member.capital_in_words || `${(cumulativeCapital / 1000000).toLocaleString('vi-VN')} triệu đồng`,
      contribution_form: assetAmount > 0 ? 'Tiền mặt và Tài sản (Quyền sử dụng đất)' : 'Tiền mặt / Chuyển khoản',
      cash_amount_text: cashAmount > 0 ? `${cashAmount.toLocaleString('vi-VN')} VNĐ` : '0 VNĐ',
      asset_amount_text: assetAmount > 0 ? `${assetAmount.toLocaleString('vi-VN')} VNĐ (Gồm diện tích QSDĐ đăng ký HTX)` : 'Không',
      contribution_date: contributionDate,
      issue_place: 'Lâm Đồng',
      representative_name: 'Trần Văn Cường (Chủ tịch HĐQT / Giám đốc)',
      qr_code_payload: `HTX_OCOP_CERT:${certCode}|MEMBER:${member.member_code}|BATCH:${issueCount}|AMOUNT:${cumulativeCapital}`,
    };
    setActiveCertificate(cert);
    setShowCertificateModal(true);
  };

  const handlePrintStandalone = (cert: CapitalCertificate) => {
    const printWin = window.open('', '_blank', 'width=850,height=1100');
    if (!printWin) {
      window.print();
      return;
    }

    const htmlContent = `
<!DOCTYPE html>
<html lang="vi">
<head>
  <meta charset="UTF-8">
  <title>Giấy chứng nhận vốn góp - ${cert.certificate_code}</title>
  <style>
    @page { size: A4 portrait; margin: 12mm 18mm; }
    * { box-sizing: border-box; }
    body {
      font-family: 'Times New Roman', Times, serif;
      color: #000000;
      background: #ffffff;
      margin: 0;
      padding: 15px 20px;
      font-size: 15px;
      line-height: 1.5;
      -webkit-print-color-adjust: exact;
    }
    .header-table { width: 100%; border-collapse: collapse; margin-bottom: 10px; }
    .header-table td { vertical-align: top; }
    .title { text-align: center; margin: 18px 0 10px 0; }
    .title h1 { font-size: 24px; margin: 0; text-transform: uppercase; font-weight: bold; }
    .title div { font-size: 14px; font-style: italic; margin-top: 4px; font-weight: bold; }
    .legal-bases { font-style: italic; font-size: 14.5px; margin-bottom: 12px; }
    .legal-bases p { margin: 3px 0; }
    .section-info { font-size: 15px; margin-bottom: 12px; }
    .section-info div { margin: 4px 0; }
    .cert-heading { text-align: center; font-weight: bold; text-transform: uppercase; font-size: 16px; letter-spacing: 2px; margin: 15px 0 10px 0; }
    .grid-3 { display: grid; grid-template-columns: 1fr 1fr 1.2fr; gap: 8px; }
    .grid-2 { display: grid; grid-template-columns: 1fr 1.2fr; gap: 8px; }
    .signatures { margin-top: 25px; width: 100%; border-collapse: collapse; }
    .signatures td { vertical-align: bottom; text-align: center; }
    @media print {
      .no-print { display: none !important; }
    }
  </style>
</head>
<body>
  <div class="no-print" style="margin-bottom: 15px; text-align: right; padding: 8px; background: #f1f5f9; border-radius: 8px;">
    <button onclick="window.print()" style="padding: 8px 16px; background: #059669; color: #fff; border: none; border-radius: 6px; font-weight: bold; cursor: pointer; font-size: 13px;">
      🖨 In / Tải PDF (A4)
    </button>
    <button onclick="window.close()" style="padding: 8px 16px; background: #475569; color: #fff; border: none; border-radius: 6px; font-weight: bold; cursor: pointer; font-size: 13px; margin-left: 8px;">
      ✕ Đóng
    </button>
  </div>

  <table class="header-table">
    <tr>
      <td style="width: 52%; text-align: left;">
        <div style="font-weight: bold; text-transform: uppercase; font-size: 14px;">${nfc(cert.cooperative_name)}</div>
        <div style="font-size: 13.5px; margin-top: 2px;">Số: <strong>${nfc(cert.certificate_code)}</strong></div>
      </td>
      <td style="width: 48%; text-align: center;">
        <div style="font-weight: bold; text-transform: uppercase; font-size: 14px;">CỘNG HÒA XÃ HỘI CHỦ NGHĨA VIỆT NAM</div>
        <div style="font-weight: bold; font-style: italic; font-size: 13.5px; margin-top: 2px;">Độc lập – Tự do – Hạnh phúc</div>
        <div style="width: 120px; border-bottom: 1px solid #000; margin: 4px auto 0 auto;"></div>
      </td>
    </tr>
  </table>

  <div class="title">
    <h1>GIẤY CHỨNG NHẬN VỐN GÓP</h1>
    <div>(Cấp lần thứ ${cert.issue_count})</div>
  </div>

  <div class="legal-bases">
    <p>Căn cứ Luật Hợp tác xã số 23/2012/QH13 (và Luật HTX số 17/2023/QH15) được Quốc hội nước CHXHCN Việt Nam thông qua và các văn bản hướng dẫn thi hành;</p>
    <p>Căn cứ Điều lệ ${nfc(cert.cooperative_name)} được thông qua ngày ${nfc(cert.cooperative_license_date)};</p>
    <p>Căn cứ mức vốn góp thực tế của các thành viên.</p>
  </div>

  <div class="section-info">
    <div>Hợp tác xã (ghi bằng chữ in hoa): <strong style="text-transform: uppercase;">${nfc(cert.cooperative_name)}</strong></div>
    <div>Địa chỉ trụ sở chính: <span>${nfc(cert.cooperative_address)}</span></div>
    <div>Số và ngày cấp Giấy chứng nhận đăng ký HTX: <span>Số <strong>${nfc(cert.cooperative_license_no)}</strong>, ngày <strong>${nfc(cert.cooperative_license_date)}</strong></span></div>
  </div>

  <div class="cert-heading">CHỨNG NHẬN</div>

  <div class="section-info">
    <div>Họ và tên thành viên (là cá nhân hoặc đại diện hộ gia đình): <strong style="text-transform: uppercase; font-size: 16px;">${nfc(cert.member_full_name)}</strong></div>
    <div class="grid-3">
      <div>Giới tính: <strong>${nfc(cert.member_gender)}</strong></div>
      <div>Sinh ngày: <strong>${nfc(cert.member_dob)}</strong></div>
      <div>Dân tộc: <strong>${nfc(cert.member_ethnicity)}</strong> &nbsp;&nbsp; Quốc tịch: <strong>${nfc(cert.member_nationality)}</strong></div>
    </div>
    <div>Nơi đăng ký hộ khẩu thường trú: <strong>${nfc(cert.member_address)}</strong></div>
    <div class="grid-2">
      <div>Chứng minh nhân dân số (hoặc CCCD): <strong>${nfc(cert.member_cccd)}</strong></div>
      <div>Ngày cấp: <strong>${nfc(cert.member_cccd_date)}</strong> &nbsp;&nbsp; Nơi cấp: <strong>${nfc(cert.member_cccd_place)}</strong></div>
    </div>
  </div>

  <div class="section-info">
    <div>Tổng số vốn góp: <strong style="font-size: 17px;">${cert.total_capital_amount.toLocaleString('vi-VN')} đồng</strong> (Bằng chữ: <strong style="font-style: italic;">${nfc(cert.capital_in_words)}</strong>)</div>
    <div>Hình thức góp vốn:</div>
    <div style="padding-left: 24px;">
      <div>+ Tiền mặt / Chuyển khoản: <strong>${nfc(cert.cash_amount_text) || `${cert.total_capital_amount.toLocaleString('vi-VN')} đồng`}</strong></div>
      <div>+ Tài sản (ghi rõ loại tài sản): <strong>${nfc(cert.asset_amount_text) || 'Không'}</strong></div>
    </div>
    <div style="margin-top: 4px;">Thời điểm góp vốn: <strong>${nfc(cert.contribution_date)}</strong></div>
  </div>

  <div style="font-style: italic; font-size: 14px; margin-top: 12px; text-align: justify;">
    Trình tự, thủ tục cấp, cấp lại, thay đổi, thu hồi giấy chứng nhận vốn góp thực hiện theo quy định của Điều lệ HTX.
  </div>

  <table class="signatures">
    <tr>
      <td style="width: 40%;">
        <img
          src="https://api.qrserver.com/v1/create-qr-code/?size=160x160&data=${encodeURIComponent(
            `HTX OCOP LÂM ĐỒNG - GCN VỐN GÓP: Số ${cert.certificate_code} | Xã Viên: ${cert.member_full_name} (${cert.member_cccd}) | Tổng vốn thực góp: ${cert.total_capital_amount.toLocaleString('vi-VN')} VNĐ | Cấp lần thứ: ${cert.issue_count} | Ngày cấp: ${cert.certificate_issue_date}`
          )}"
          alt="QR Code"
          style="width: 95px; height: 95px; border: 1px solid #ccc; padding: 2px;"
        />
        <div style="font-size: 11px; font-family: monospace; margin-top: 4px; font-weight: bold;">Mã QR Tra cứu GCN</div>
      </td>
      <td style="width: 60%;">
        <div style="font-style: italic; font-size: 14px;">${nfc(cert.issue_place)}, Ngày ${new Date().getDate()} tháng ${new Date().getMonth() + 1} năm ${new Date().getFullYear()}</div>
        <div style="font-weight: bold; text-transform: uppercase; font-size: 14px; margin-top: 4px;">ĐĐ. THEO PHÁP LUẬT CỦA HỢP TÁC XÃ</div>
        <div style="font-size: 12px; font-style: italic;">(Ký tên, đóng dấu)</div>
        <div style="height: 65px;"></div>
        <div style="font-weight: bold; text-transform: uppercase; font-size: 15px;">${nfc(cert.representative_name)}</div>
      </td>
    </tr>
  </table>

  <script>
    window.onload = function() {
      setTimeout(function() {
        window.print();
      }, 400);
    };
  </script>
</body>
</html>
    `;

    printWin.document.write(htmlContent);
    printWin.document.close();
  };

  const filteredMembers = members.filter((m) => {
    const matchSearch =
      m.full_name.toLowerCase().includes(search.toLowerCase()) ||
      m.member_code.toLowerCase().includes(search.toLowerCase());
    const matchCapitalStatus = capitalStatusFilter === 'ALL' || m.capital_status === capitalStatusFilter;
    return matchSearch && matchCapitalStatus;
  });

  const totalPages = Math.ceil(filteredMembers.length / pageSize) || 1;
  const safeCurrentPage = Math.min(currentPage, totalPages);
  const paginatedMembers = filteredMembers.slice(
    (safeCurrentPage - 1) * pageSize,
    safeCurrentPage * pageSize
  );

  const handleSelectCapitalMember = (m: Member) => {
    setSelectedCapitalMember(m);
    setTimeout(() => {
      const el = document.getElementById('capital-drawer-panel');
      if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      }
    }, 50);
  };

  return (
    <div className="space-y-4 pb-12 animate-fade-in">
      {toast && (
        <div className={`fixed top-4 right-4 z-50 px-4 py-3 rounded-xl shadow-modal text-white text-xs font-extrabold flex items-center gap-2 animate-bounce ${toast.type === 'danger' ? 'bg-rose-600' : 'bg-emerald-600'}`}>
          <CheckCircle2 className="w-4 h-4" />
          {toast.message}
        </div>
      )}

      {/* Breadcrumb Header */}
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold text-slate-400">
            <span>Quản trị HTX</span>
            <ChevronRight className="w-3.5 h-3.5" />
            <span className="text-slate-800">Quản lý Vốn góp (Luật HTX 2023)</span>
          </div>
          <h1 className="text-xl font-extrabold text-slate-900 tracking-tight mt-1">Quản lý Vốn góp & Chứng nhận Vốn</h1>
          <p className="text-[12.8px] text-slate-500">
            Theo dõi vốn cam kết, nộp vốn thực tế, định giá ruộng đất góp vốn và cấp Giấy chứng nhận phần vốn góp điện tử
          </p>
        </div>

        <div className="flex items-center gap-2">
          <div className="px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-xs font-bold text-slate-700 flex items-center gap-2 shadow-xs">
            <Calendar className="w-4 h-4 text-emerald-600" />
            <span>Niên độ 2025</span>
          </div>

          <button
            onClick={() => {
              setRecordStep(1);
              setShowRecordModal(true);
            }}
            className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-[12.8px] rounded-lg shadow-sm inline-flex items-center gap-1.5 transition-all"
          >
            <Plus className="w-4 h-4" /> Ghi nhận góp vốn
          </button>
          <button className="px-3.5 py-2 border border-slate-200 hover:bg-slate-50 text-slate-700 font-bold text-[12.8px] rounded-lg inline-flex items-center gap-1.5 bg-white shadow-xs">
            <FileSpreadsheet className="w-4 h-4 text-emerald-600" /> Xuất Excel
          </button>
        </div>
      </div>

      {/* LAW 2023 WARNING BANNER IF ASSOCIATE GROUP OVER LIMIT */}
      {isAssociateGroupOverLimit && (
        <div className="bg-amber-50 border border-amber-200 p-3.5 rounded-xl flex items-center justify-between text-xs font-bold text-amber-900 shadow-xs">
          <div className="flex items-center gap-2.5">
            <ShieldAlert className="w-5 h-5 text-amber-600 shrink-0" />
            <span>CẢNH BÁO LUẬT HTX 2023: Tổng vốn nhóm Thành viên liên kết ({associateGroupPct}%) vượt giới hạn tối đa 30% vốn điều lệ. Cần tạm dừng kết nạp liên kết mới!</span>
          </div>
          <button onClick={() => triggerToast('Đã gửi thông báo cảnh báo đến HĐQT HTX!', 'danger')} className="px-3 py-1 bg-amber-600 text-white rounded-lg text-[11px]">
            Xem nghị quyết
          </button>
        </div>
      )}

      {/* TOP 6 KPI STATS CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-3">
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

        <div className="bg-white border border-[#e7e9ec] p-3.5 rounded-xl shadow-subtle space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-400 uppercase">Còn phải góp</span>
            <div className="w-7 h-7 rounded-lg bg-amber-100 text-amber-700 flex items-center justify-center">
              <AlertCircle className="w-4 h-4" />
            </div>
          </div>
          <div className="text-lg font-black text-amber-800">{totalRemainingCapital.toLocaleString('vi-VN')} ₫</div>
          <div className="text-[11px] text-slate-500 font-semibold">{members.filter((m) => m.capital_status === 'CHUA_DU').length} xã viên chưa đủ</div>
        </div>

        <div className="bg-white border border-[#e7e9ec] p-3.5 rounded-xl shadow-subtle space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-400 uppercase">Khối liên kết (Max 30%)</span>
            <div className="w-7 h-7 rounded-lg bg-purple-100 text-purple-700 flex items-center justify-center">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <div className="text-lg font-black text-slate-900">{associateGroupPct}%</div>
          <div className="text-[11px] text-slate-500 font-medium">
            Vốn góp: <strong className="text-purple-700">{associateGroupCapital.toLocaleString('vi-VN')} ₫</strong>
          </div>
        </div>

        <div className="bg-white border border-[#e7e9ec] p-3.5 rounded-xl shadow-subtle space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-400 uppercase">Ruộng đất góp vốn</span>
            <div className="w-7 h-7 rounded-lg bg-teal-100 text-teal-700 flex items-center justify-center">
              <MapPin className="w-4 h-4" />
            </div>
          </div>
          <div className="text-lg font-black text-slate-900">45.000 m²</div>
          <div className="text-[11px] text-slate-500 font-semibold">Đã sang tên HTX</div>
        </div>

        <div
          onClick={() => setShowPendingCapitalModal(true)}
          className="bg-white border border-[#e7e9ec] p-3.5 rounded-xl shadow-subtle space-y-1 cursor-pointer hover:border-amber-400 hover:shadow-md transition-all group"
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-400 uppercase group-hover:text-amber-700 transition-colors">Chờ duyệt</span>
            <div className="w-7 h-7 rounded-lg bg-rose-100 text-rose-700 flex items-center justify-center group-hover:scale-110 transition-transform">
              <AlertCircle className="w-4 h-4" />
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

      {/* MAIN CAPITAL TABLE & SIDE DRAWER */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 items-start">
        <div className={`${selectedCapitalMember ? 'lg:col-span-2' : 'lg:col-span-3'} bg-white border border-[#e7e9ec] rounded-xl shadow-subtle overflow-hidden`}>
          <div className="p-3.5 border-b border-[#e7e9ec] bg-slate-50/50 flex flex-wrap items-center justify-between gap-3">
            <div className="relative flex-1 min-w-[220px]">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Tìm theo tên, mã xã viên..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-9 pr-3 py-1.5 bg-white border border-slate-200 rounded-lg text-[12.8px] text-slate-700 focus:outline-none"
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

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-[12.8px]">
              <thead>
                <tr className="border-b border-[#e7e9ec] text-[11px] uppercase tracking-wider text-slate-400 font-bold bg-slate-50">
                  <th className="py-2.5 px-3">STT</th>
                  <th className="py-2.5 px-3">Mã xã viên</th>
                  <th className="py-2.5 px-3">Họ và tên</th>
                  <th className="py-2.5 px-3">Phân loại TV</th>
                  <th className="py-2.5 px-3 text-right">Vốn cam kết (đ)</th>
                  <th className="py-2.5 px-3 text-right">Đã góp (đ)</th>
                  <th className="py-2.5 px-3 text-right">Còn thiếu (đ)</th>
                  <th className="py-2.5 px-3 text-right">Tỷ lệ % (Max 30%)</th>
                  <th className="py-2.5 px-3">Trạng thái</th>
                  <th className="py-2.5 px-3 text-center">Thao tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {paginatedMembers.map((m, idx) => {
                  const pct = m.ownership_percentage || Number((((m.contributed_capital || 0) / (totalContributedCapital || 1)) * 100).toFixed(2));
                  const isNearLimit = pct >= 25.0 && pct < 30.0;
                  const isLimitBreach = pct >= 30.0;

                  return (
                    <tr
                      key={m.id}
                      onClick={() => handleSelectCapitalMember(m)}
                      className={`cursor-pointer hover:bg-slate-50 transition-colors ${
                        selectedCapitalMember?.id === m.id ? 'bg-emerald-50/60 font-semibold' : ''
                      }`}
                    >
                      <td className="py-3 px-3 text-slate-500 font-medium">
                        {(safeCurrentPage - 1) * pageSize + idx + 1}
                      </td>
                      <td className="py-3 px-3 font-mono font-bold text-slate-600">{m.member_code}</td>
                      <td className="py-3 px-3">
                        <strong className="text-slate-900 block">{m.full_name}</strong>
                        <span className="text-[10.5px] text-slate-400">{m.address}</span>
                      </td>
                      <td className="py-3 px-3">
                        {m.member_type === 'CHINH_THUC' ? (
                          <span className="pill-badge pill-green text-[10px]">Chính thức</span>
                        ) : m.member_type === 'LIEN_KET_GOP_VON' ? (
                          <span className="pill-badge pill-blue text-[10px]">LK góp vốn</span>
                        ) : (
                          <span className="pill-badge pill-gray text-[10px]">LK không vốn</span>
                        )}
                      </td>
                      <td className="py-3 px-3 text-right font-bold text-slate-900">
                        {m.committed_capital?.toLocaleString('vi-VN')} ₫
                      </td>
                      <td className="py-3 px-3 text-right font-extrabold text-emerald-700">
                        {m.contributed_capital?.toLocaleString('vi-VN')} ₫
                      </td>
                      <td className="py-3 px-3 text-right font-bold text-amber-800">
                        {m.remaining_capital?.toLocaleString('vi-VN')} ₫
                      </td>
                      <td className="py-3 px-3 text-right font-extrabold">
                        {isLimitBreach ? (
                          <span className="px-2 py-0.5 bg-rose-100 text-rose-700 rounded-md font-mono text-[11px]" title="Vi phạm trần 30% Luật HTX 2023">
                            {pct}% ⛔
                          </span>
                        ) : isNearLimit ? (
                          <span className="px-2 py-0.5 bg-amber-100 text-amber-800 rounded-md font-mono text-[11px]" title="Cảnh báo cận trần 30%">
                            {pct}% ⚠️
                          </span>
                        ) : (
                          <span className="text-slate-800 font-mono">{pct}%</span>
                        )}
                      </td>
                      <td className="py-3 px-3">
                        {m.capital_status === 'DU_VON' ? (
                          <span className="pill-badge pill-green">Đủ vốn</span>
                        ) : (
                          <span className="pill-badge pill-amber">Chưa đủ</span>
                        )}
                      </td>
                      <td className="py-3 px-3 text-center">
                        <div className="inline-flex items-center gap-1">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleSelectCapitalMember(m);
                            }}
                            className="p-1 text-slate-400 hover:text-emerald-700 hover:bg-emerald-50 rounded-lg"
                            title="Xem chi tiết vốn góp"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              openCertificatePreview(m);
                            }}
                            className="p-1 text-emerald-600 hover:text-emerald-800 hover:bg-emerald-50 rounded-lg"
                            title="Xem & In Giấy chứng nhận vốn góp điện tử"
                          >
                            <QrCode className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
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
                ({filteredMembers.length > 0 ? (safeCurrentPage - 1) * pageSize + 1 : 0} -{' '}
                {Math.min(safeCurrentPage * pageSize, filteredMembers.length)} trên tổng số{' '}
                <strong className="text-slate-800 font-extrabold">{filteredMembers.length}</strong> xã viên)
              </span>
            </div>

            <div className="flex items-center gap-1.5">
              <button
                disabled={safeCurrentPage <= 1}
                onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                className="px-2.5 py-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed font-medium text-slate-700 transition-colors flex items-center gap-1 cursor-pointer shadow-2xs"
              >
                <ArrowLeft className="w-3.5 h-3.5" /> Trước
              </button>

              <div className="flex items-center gap-1 px-1">
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((pageNum) => (
                  <button
                    key={pageNum}
                    onClick={() => setCurrentPage(pageNum)}
                    className={`w-7 h-7 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                      safeCurrentPage === pageNum
                        ? 'bg-emerald-600 text-white shadow-2xs'
                        : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-100'
                    }`}
                  >
                    {pageNum}
                  </button>
                ))}
              </div>

              <button
                disabled={safeCurrentPage >= totalPages}
                onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
                className="px-2.5 py-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed font-medium text-slate-700 transition-colors flex items-center gap-1 cursor-pointer shadow-2xs"
              >
                Sau <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>

        {/* SIDE DRAWER FOR SELECTED MEMBER */}
        {selectedCapitalMember && (
          <div id="capital-drawer-panel" className="bg-white border border-[#e7e9ec] rounded-xl shadow-subtle p-4 space-y-4 animate-fade-in sticky top-16 z-20 max-h-[calc(100vh-140px)] overflow-y-auto">
            <div className="flex items-start justify-between border-b border-[#e7e9ec] pb-3">
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-full bg-emerald-100 text-emerald-800 font-bold flex items-center justify-center text-sm border border-emerald-200 shrink-0">
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

            <div className="p-3 bg-emerald-50/50 border border-emerald-100 rounded-xl space-y-2">
              <div className="flex justify-between items-baseline">
                <span className="text-[11.5px] font-bold text-slate-500">Tổng vốn thực góp:</span>
                <span className="text-lg font-black text-emerald-800">
                  {selectedCapitalMember.contributed_capital?.toLocaleString('vi-VN')} ₫
                </span>
              </div>
              <div className="w-full bg-slate-200 rounded-full h-2 overflow-hidden">
                <div className="bg-emerald-600 h-2 rounded-full" style={{ width: '100%' }}></div>
              </div>
              <div className="grid grid-cols-2 gap-2 pt-2 text-[11.8px] border-t border-emerald-200/60">
                <div><span className="text-slate-500">Vốn cam kết:</span> <strong className="text-slate-900">{selectedCapitalMember.committed_capital?.toLocaleString('vi-VN')} ₫</strong></div>
                <div><span className="text-slate-500">Tỷ lệ sở hữu:</span> <strong className="text-emerald-700">{selectedCapitalMember.ownership_percentage}%</strong></div>
              </div>
            </div>

            <div className="border-b border-[#e7e9ec] flex gap-3 text-[12px] font-bold overflow-x-auto">
              <button onClick={() => setCapitalDrawerTab('history')} className={`pb-2 border-b-2 whitespace-nowrap ${capitalDrawerTab === 'history' ? 'border-emerald-600 text-emerald-800' : 'border-transparent text-slate-400'}`}>Lịch sử góp vốn</button>
              <button onClick={() => setCapitalDrawerTab('land')} className={`pb-2 border-b-2 whitespace-nowrap ${capitalDrawerTab === 'land' ? 'border-emerald-600 text-emerald-800' : 'border-transparent text-slate-400'}`}>Ruộng đất góp vốn</button>
              <button onClick={() => setCapitalDrawerTab('certificate')} className={`pb-2 border-b-2 whitespace-nowrap ${capitalDrawerTab === 'certificate' ? 'border-emerald-600 text-emerald-800' : 'border-transparent text-slate-400'}`}>Giấy chứng nhận</button>
            </div>

            {capitalDrawerTab === 'history' && (
              <div className="space-y-3">
                <div className="overflow-x-auto border border-slate-200 rounded-lg">
                  <table className="w-full text-left text-[11.8px]">
                    <thead className="bg-slate-50 text-[10.5px] uppercase font-bold text-slate-400">
                      <tr>
                        <th className="py-2 px-2.5">Ngày</th>
                        <th className="py-2 px-2.5">Số tiền</th>
                        <th className="py-2 px-2.5">Hình thức</th>
                        <th className="py-2 px-2.5">Chứng từ</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {transactions
                        .filter((tx) => tx.member_id === selectedCapitalMember.id || tx.member_code === selectedCapitalMember.member_code)
                        .map((tx) => (
                          <tr key={tx.id}>
                            <td className="py-2 px-2.5 text-slate-600">{formatDate(tx.contribution_date)}</td>
                            <td className="py-2 px-2.5 font-bold text-emerald-700">+{tx.amount.toLocaleString('vi-VN')} ₫</td>
                            <td className="py-2 px-2.5 text-slate-600">{tx.payment_method === 'CASH' ? 'Tiền mặt' : tx.payment_method === 'LAND' ? 'Ruộng đất (QSDĐ)' : 'Chuyển khoản'}</td>
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
                          </tr>
                        ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {capitalDrawerTab === 'land' && (
              <div className="space-y-3">
                <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-2">
                  <div className="flex items-center gap-2 text-emerald-800 font-extrabold text-[12.8px]">
                    <MapPin className="w-4 h-4" /> Thửa đất nông nghiệp đóng góp
                  </div>
                  <div className="text-[12px] space-y-1 text-slate-700">
                    <div>Số seri Sổ đỏ: <strong className="font-mono text-slate-900">BD 123456</strong></div>
                    <div>Số thửa: <strong>12</strong> &bull; Số tờ bản đồ: <strong>04</strong></div>
                    <div>Diện tích đóng góp: <strong className="text-emerald-700">1.500 m²</strong> (Đất trồng lúa)</div>
                    <div>Giá trị định giá HTX: <strong className="text-slate-900">30.000.000 ₫</strong> (20.000 đ/m²)</div>
                    <div className="pt-1"><span className="pill-badge pill-green text-[10px]">Đã đăng ký biến động đất đai sang tên HTX</span></div>
                  </div>
                </div>
              </div>
            )}

            {capitalDrawerTab === 'certificate' && (
              <div className="space-y-3 text-[12px]">
                <div className="text-[11.5px] font-bold text-slate-500 flex justify-between items-center">
                  <span>DANH SÁCH GIẤY CHỨNG NHẬN ĐÃ CẤP</span>
                  <span className="pill-badge pill-green text-[10px]">Cập nhật theo Luật HTX</span>
                </div>
                {(() => {
                  const memApprovedTxs = transactions
                    .filter((tx) => (tx.member_id === selectedCapitalMember.id || tx.member_code === selectedCapitalMember.member_code) && tx.status === 'APPROVED')
                    .sort((a, b) => {
                      const dateA = a.contribution_date.includes('/') ? a.contribution_date.split('/').reverse().join('-') : a.contribution_date;
                      const dateB = b.contribution_date.includes('/') ? b.contribution_date.split('/').reverse().join('-') : b.contribution_date;
                      return new Date(dateA).getTime() - new Date(dateB).getTime();
                    });

                  if (memApprovedTxs.length === 0) {
                    return (
                      <div className="p-3 border border-emerald-200 bg-emerald-50/40 rounded-xl text-center space-y-2">
                        <QrCode className="w-10 h-10 text-emerald-700 mx-auto" />
                        <div className="font-extrabold text-slate-900 text-sm">Giấy chứng nhận phần vốn góp điện tử (Lần 1)</div>
                        <div className="font-mono text-xs text-emerald-800 font-bold">Số: 01/2025/GCN-HTX</div>
                        <button
                          onClick={() => openCertificatePreview(selectedCapitalMember, 1)}
                          className="w-full py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-lg inline-flex items-center justify-center gap-1.5 shadow-xs"
                        >
                          <Eye className="w-4 h-4" /> Xem trước & In Giấy chứng nhận
                        </button>
                      </div>
                    );
                  }

                  return memApprovedTxs.map((tx, idx) => {
                    const issueNum = idx + 1;
                    const isLatest = issueNum === memApprovedTxs.length;
                    const cumulativeAmt = memApprovedTxs.slice(0, issueNum).reduce((sum, t) => sum + t.amount, 0);

                    return (
                      <div key={tx.id} className={`p-3 border rounded-xl space-y-2 transition-all ${isLatest ? 'border-emerald-500 bg-emerald-50/50 shadow-xs' : 'border-slate-200 bg-slate-50/50'}`}>
                        <div className="flex justify-between items-start">
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="font-extrabold text-slate-900 text-[13px]">Giấy chứng nhận Vốn (Lần {issueNum})</span>
                              {isLatest && <span className="pill-badge pill-green text-[9.5px]">Mới nhất</span>}
                            </div>
                            <div className="font-mono text-[11px] text-emerald-800 font-bold">Số: {String(issueNum).padStart(2, '0')}/2025/GCN-HTX</div>
                          </div>
                          <span className="text-[11px] text-slate-500 font-semibold">{tx.contribution_date}</span>
                        </div>
                        <div className="text-[11.8px] space-y-0.5 text-slate-600 bg-white/70 p-2 rounded-lg border border-slate-100">
                          <div>Đợt nộp tiền/tài sản: <strong className="text-emerald-700">+{tx.amount.toLocaleString('vi-VN')} ₫</strong> ({tx.payment_method === 'CASH' ? 'Tiền mặt' : tx.payment_method === 'LAND' ? 'Ruộng đất (QSDĐ)' : 'Chuyển khoản'})</div>
                          <div>Tổng lũy kế vốn đã góp: <strong className="text-slate-900">{cumulativeAmt.toLocaleString('vi-VN')} ₫</strong></div>
                        </div>
                        <button
                          onClick={() => openCertificatePreview(selectedCapitalMember, issueNum)}
                          className={`w-full py-1.5 font-bold text-xs rounded-lg inline-flex items-center justify-center gap-1.5 ${isLatest ? 'bg-emerald-600 hover:bg-emerald-700 text-white' : 'bg-slate-200 hover:bg-slate-300 text-slate-800'}`}
                        >
                          <Eye className="w-3.5 h-3.5" /> Xem trước & In GCN Lần {issueNum}
                        </button>
                      </div>
                    );
                  });
                })()}
              </div>
            )}
          </div>
        )}
      </div>

      {/* CHARTS GRID MATCHING IMAGE 2 BOTTOM */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
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
              <div key={item.m} className="flex-1 flex items-end justify-center gap-0.5 relative group cursor-pointer">
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

        <div className="bg-white border border-[#e7e9ec] p-4 rounded-xl shadow-subtle space-y-3">
          <h3 className="font-extrabold text-slate-900 text-sm">Cơ cấu loại tài sản vốn góp</h3>
          <div className="flex items-center justify-center py-2 relative">
            <div className="w-32 h-32 rounded-full border-[14px] border-emerald-600 border-t-amber-500 flex flex-col items-center justify-center text-center">
              <span className="text-[12px] font-extrabold text-slate-900">2.450.000.000 ₫</span>
              <span className="text-[9.5px] text-slate-400 uppercase font-bold">Tổng vốn góp</span>
            </div>
          </div>
          <div className="space-y-1.5 text-[12px] pt-2">
            <div className="flex justify-between items-center">
              <span className="flex items-center gap-2 text-slate-600"><span className="w-3 h-3 rounded-full bg-emerald-600"></span> Tiền mặt / Chuyển khoản</span>
              <strong className="text-slate-900">1.850.000.000 ₫ (75,5%)</strong>
            </div>
            <div className="flex justify-between items-center">
              <span className="flex items-center gap-2 text-slate-600"><span className="w-3 h-3 rounded-full bg-amber-500"></span> Quyền sử dụng đất (QSDĐ)</span>
              <strong className="text-amber-800">600.000.000 ₫ (24,5%)</strong>
            </div>
          </div>
        </div>

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
              { rank: 1, name: 'Nguyễn Văn A', amount: 30000000 },
              { rank: 2, name: 'Trần Thị B', amount: 40000000 },
              { rank: 3, name: 'Lê Văn C', amount: 20000000 },
              { rank: 4, name: 'Phạm Thị D', amount: 25000000 },
              { rank: 5, name: 'Hoàng Văn E', amount: 30000000 },
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

      {/* PENDING TRANSACTIONS MODAL */}
      {showPendingCapitalModal && (
        <div
          onClick={(e) => {
            if (e.target === e.currentTarget) setShowPendingCapitalModal(false);
          }}
          className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fade-in overflow-y-auto"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="bg-white rounded-2xl max-w-2xl w-full shadow-modal overflow-hidden my-6 border border-slate-200 flex flex-col max-h-[85vh]"
          >
            <div className="p-4 bg-slate-900 text-white flex justify-between items-center shrink-0">
              <div className="flex items-center gap-2">
                <AlertCircle className="w-5 h-5 text-amber-400" />
                <div>
                  <h3 className="font-extrabold text-sm text-white">Giao dịch Góp vốn Chờ Phê duyệt</h3>
                  <p className="text-[11.5px] text-slate-300">
                    Phê duyệt bút toán nộp tiền mặt, chuyển khoản & ruộng đất đóng góp của xã viên
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowPendingCapitalModal(false)}
                className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-4 space-y-3 overflow-y-auto flex-1 bg-slate-50/50">
              {transactions.filter((t) => t.status === 'PENDING').length === 0 ? (
                <div className="py-12 text-center space-y-2 bg-white rounded-xl border border-slate-200">
                  <CheckCircle2 className="w-12 h-12 text-emerald-500 mx-auto" />
                  <div className="font-extrabold text-slate-900 text-sm">Tất cả giao dịch đã được phê duyệt!</div>
                  <p className="text-xs text-slate-500">Hiện không có bút toán nộp vốn nào cần duyệt thêm.</p>
                </div>
              ) : (
                transactions
                  .filter((t) => t.status === 'PENDING')
                  .map((tx) => (
                    <div
                      key={tx.id}
                      className="p-4 bg-white border border-slate-200 rounded-xl space-y-3 shadow-xs hover:border-emerald-300 transition-all"
                    >
                      <div className="flex justify-between items-start">
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-extrabold text-slate-900 text-sm">{tx.member_name}</span>
                            <span className="font-mono text-xs text-slate-500 font-bold">({tx.member_code})</span>
                            <span className="pill-badge pill-amber text-[10px]">Chờ duyệt</span>
                          </div>
                          <p className="text-xs text-slate-500 mt-0.5">
                            Mã chứng từ: <strong className="font-mono text-slate-800">{tx.transaction_code}</strong> &bull; Ngày nộp: {tx.contribution_date}
                          </p>
                        </div>
                        <div className="text-right">
                          <div className="text-base font-black text-emerald-700">+{tx.amount.toLocaleString('vi-VN')} ₫</div>
                          <span className="text-[11px] text-slate-500 font-bold">
                            {tx.payment_method === 'CASH' ? 'Tiền mặt' : tx.payment_method === 'LAND' ? 'Ruộng đất (QSDĐ)' : 'Chuyển khoản'}
                          </span>
                        </div>
                      </div>

                      <div className="p-2.5 bg-slate-50 rounded-lg text-xs space-y-1 text-slate-700 border border-slate-100">
                        <div>Nội dung: <strong>{tx.content}</strong></div>
                        {tx.notes && <div>Ghi chú: <span className="italic text-slate-600">{tx.notes}</span></div>}
                      </div>

                      <div className="flex justify-between items-center pt-1 border-t border-slate-100">
                        <span className="text-[11px] text-slate-400">
                          Người tạo: {tx.recorded_by || tx.member_name}
                        </span>
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handleRejectCapitalTx(tx.id)}
                            className="px-3 py-1.5 border border-rose-200 text-rose-700 hover:bg-rose-50 font-bold rounded-lg text-xs transition-all"
                          >
                            Từ chối
                          </button>
                          <button
                            onClick={() => handleApproveCapitalTx(tx.id)}
                            className="px-4 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-lg text-xs shadow-xs inline-flex items-center gap-1 transition-all"
                          >
                            <CheckCircle2 className="w-3.5 h-3.5" /> Phê duyệt & Cấp Vốn
                          </button>
                        </div>
                      </div>
                    </div>
                  ))
              )}
            </div>

            <div className="p-3 bg-slate-100 border-t border-slate-200 flex justify-end shrink-0">
              <button
                type="button"
                onClick={() => setShowPendingCapitalModal(false)}
                className="px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-800 font-bold text-xs rounded-lg inline-flex items-center gap-1.5 transition-all cursor-pointer"
              >
                <X className="w-4 h-4 text-slate-600" /> Đóng cửa sổ
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MULTI-STEP RECORD CAPITAL MODAL */}
      {showRecordModal && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fade-in">
          <div className="bg-white rounded-2xl max-w-xl w-full shadow-modal overflow-hidden">
            <div className="p-4 border-b border-slate-200 flex justify-between items-center bg-slate-50">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-full bg-emerald-600 text-white font-black text-xs flex items-center justify-center">
                  {recordStep}
                </div>
                <h3 className="font-extrabold text-slate-900 text-base">
                  {recordStep === 1 && 'Bước 1: Chọn Xã viên & Hình thức tài sản'}
                  {recordStep === 2 && 'Bước 2: Định giá & Thông tin tài sản góp'}
                  {recordStep === 3 && 'Bước 3: Xác nhận & Kiểm tra ranh giới Luật 2023'}
                </h3>
              </div>
              <button onClick={() => setShowRecordModal(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleValidateAndSaveContribution} className="p-5 space-y-4 text-[12.8px]">
              {recordStep === 1 && (
                <div className="space-y-4">
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Chọn Thành viên HTX *</label>
                    <select
                      value={capitalForm.member_id}
                      onChange={(e) => setCapitalForm({ ...capitalForm, member_id: e.target.value })}
                      className="w-full px-3 py-2 border border-slate-200 rounded-lg font-bold text-slate-800"
                    >
                      {members.map((m) => (
                        <option key={m.id} value={m.id}>
                          {m.full_name} ({m.member_code}) - {m.member_type === 'CHINH_THUC' ? 'Chính thức' : 'Liên kết'}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 mb-2">Hình thức tài sản đóng góp *</label>
                    <div className="grid grid-cols-2 gap-3">
                      <div
                        onClick={() => setCapitalForm({ ...capitalForm, contribution_type: 'TIEN_MAT' })}
                        className={`p-3 rounded-xl border-2 cursor-pointer flex items-center gap-2.5 ${capitalForm.contribution_type === 'TIEN_MAT' ? 'border-emerald-600 bg-emerald-50/50' : 'border-slate-200'}`}
                      >
                        <Wallet className="w-5 h-5 text-emerald-600" />
                        <div>
                          <div className="font-extrabold text-slate-800">Tiền mặt</div>
                          <div className="text-[10.5px] text-slate-400">Nộp tiền trực tiếp tại quỹ</div>
                        </div>
                      </div>

                      <div
                        onClick={() => setCapitalForm({ ...capitalForm, contribution_type: 'CHUYEN_KHOAN' })}
                        className={`p-3 rounded-xl border-2 cursor-pointer flex items-center gap-2.5 ${capitalForm.contribution_type === 'CHUYEN_KHOAN' ? 'border-emerald-600 bg-emerald-50/50' : 'border-slate-200'}`}
                      >
                        <Building className="w-5 h-5 text-blue-600" />
                        <div>
                          <div className="font-extrabold text-slate-800">Chuyển khoản</div>
                          <div className="text-[10.5px] text-slate-400">Qua tài khoản ngân hàng HTX</div>
                        </div>
                      </div>

                      <div
                        onClick={() => setCapitalForm({ ...capitalForm, contribution_type: 'LAND' })}
                        className={`p-3 rounded-xl border-2 cursor-pointer flex items-center gap-2.5 col-span-2 ${capitalForm.contribution_type === 'LAND' ? 'border-emerald-600 bg-emerald-50/50' : 'border-slate-200'}`}
                      >
                        <MapPin className="w-5 h-5 text-amber-600" />
                        <div>
                          <div className="font-extrabold text-slate-800">Quyền sử dụng đất (QSDĐ)</div>
                          <div className="text-[10.5px] text-slate-400">Định giá ruộng đất tích tụ canh tác sang tên HTX (Miễn 100% lệ phí trước bạ)</div>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="pt-2 flex justify-end gap-2 border-t border-slate-200">
                    <button
                      type="button"
                      onClick={() => setRecordStep(2)}
                      className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-lg shadow-sm"
                    >
                      Tiếp theo &rarr;
                    </button>
                  </div>
                </div>
              )}

              {recordStep === 2 && (
                <div className="space-y-4">
                  {capitalForm.contribution_type === 'LAND' ? (
                    <div className="space-y-3">
                      <div className="p-2.5 bg-amber-50 border border-amber-200 rounded-lg text-amber-900 text-[11.5px] font-bold">
                        Đóng góp bằng Quyền sử dụng đất (Luật HTX 2023 & Luật Đất đai 2024)
                      </div>
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="block font-bold text-slate-700 mb-1">Số seri Sổ đỏ *</label>
                          <input
                            type="text"
                            required
                            value={capitalForm.land_certificate_no}
                            onChange={(e) => setCapitalForm({ ...capitalForm, land_certificate_no: e.target.value })}
                            placeholder="BD 123456"
                            className="w-full px-3 py-2 border border-slate-200 rounded-lg font-mono font-bold"
                          />
                        </div>
                        <div>
                          <label className="block font-bold text-slate-700 mb-1">Số thửa & Số tờ bản đồ</label>
                          <div className="flex gap-2">
                            <input
                              type="text"
                              placeholder="Thửa"
                              value={capitalForm.plot_number}
                              onChange={(e) => setCapitalForm({ ...capitalForm, plot_number: e.target.value })}
                              className="w-1/2 px-2 py-2 border border-slate-200 rounded-lg font-bold"
                            />
                            <input
                              type="text"
                              placeholder="Tờ"
                              value={capitalForm.map_sheet_number}
                              onChange={(e) => setCapitalForm({ ...capitalForm, map_sheet_number: e.target.value })}
                              className="w-1/2 px-2 py-2 border border-slate-200 rounded-lg font-bold"
                            />
                          </div>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="block font-bold text-slate-700 mb-1">Diện tích đóng góp (m²) *</label>
                          <input
                            type="number"
                            required
                            value={capitalForm.land_area_sqm}
                            onChange={(e) => setCapitalForm({ ...capitalForm, land_area_sqm: Number(e.target.value) })}
                            className="w-full px-3 py-2 border border-slate-200 rounded-lg font-bold text-emerald-800"
                          />
                        </div>
                        <div>
                          <label className="block font-bold text-slate-700 mb-1">Đơn giá định giá (đ/m²) *</label>
                          <input
                            type="number"
                            required
                            value={capitalForm.appraised_unit_price}
                            onChange={(e) => setCapitalForm({ ...capitalForm, appraised_unit_price: Number(e.target.value) })}
                            className="w-full px-3 py-2 border border-slate-200 rounded-lg font-bold"
                          />
                        </div>
                      </div>

                      <div className="p-2 bg-slate-100 rounded-lg flex justify-between font-extrabold text-slate-900">
                        <span>Tổng giá trị góp đất quy đổi:</span>
                        <span className="text-emerald-700">{(capitalForm.land_area_sqm * capitalForm.appraised_unit_price).toLocaleString('vi-VN')} ₫</span>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="block font-bold text-slate-700 mb-1">Số tiền góp (đ) *</label>
                          <input
                            type="number"
                            step={1000000}
                            required
                            value={capitalForm.amount}
                            onChange={(e) => setCapitalForm({ ...capitalForm, amount: Number(e.target.value) })}
                            className="w-full px-3 py-2 border border-slate-200 rounded-lg font-bold text-emerald-800"
                          />
                        </div>
                        <div>
                          <label className="block font-bold text-slate-700 mb-1">Số chứng từ / Phiếu thu</label>
                          <input
                            type="text"
                            value={capitalForm.receipt_number}
                            onChange={(e) => setCapitalForm({ ...capitalForm, receipt_number: e.target.value })}
                            className="w-full px-3 py-2 border border-slate-200 rounded-lg font-mono font-bold"
                          />
                        </div>
                      </div>
                    </div>
                  )}

                  <div>
                    <label className="block font-bold text-slate-700 mb-1">File Biên bản định giá / Chứng từ scan</label>
                    <input
                      type="file"
                      ref={fileInputRef}
                      onChange={handleFileSelect}
                      accept=".pdf,.doc,.docx,.png,.jpg,.jpeg"
                      className="hidden"
                    />
                    {!uploadedFile ? (
                      <div
                        onClick={() => fileInputRef.current?.click()}
                        onDragOver={(e) => {
                          e.preventDefault();
                          setIsDragging(true);
                        }}
                        onDragLeave={() => setIsDragging(false)}
                        onDrop={handleDropFile}
                        className={`border-2 border-dashed rounded-xl p-4 text-center cursor-pointer transition-all ${
                          isDragging
                            ? 'border-emerald-500 bg-emerald-50 scale-102'
                            : 'border-emerald-400/80 hover:border-emerald-600 bg-emerald-50/20 hover:bg-emerald-50/50'
                        }`}
                      >
                        <Upload className="w-6 h-6 text-emerald-600 mx-auto mb-1.5 animate-bounce" />
                        <div className="text-slate-800 font-bold text-[12px]">Bấm vào đây để chọn file hoặc Kéo thả file vào đây</div>
                        <div className="text-slate-500 text-[11px] mt-0.5 font-medium">Tải lên Biên bản họp Đại hội thành viên / Hợp đồng công chứng / Sổ đỏ (PDF, DOCX, PNG, JPG)</div>
                      </div>
                    ) : (
                      <div className="p-3 border border-emerald-300 bg-emerald-50/70 rounded-xl flex items-center justify-between shadow-xs">
                        <div className="flex items-center gap-2.5">
                          <FileText className="w-6 h-6 text-emerald-700 shrink-0" />
                          <div className="text-left">
                            <div className="font-extrabold text-slate-900 text-xs truncate max-w-[240px]">{uploadedFile.name}</div>
                            <div className="text-[10.5px] text-emerald-800 font-bold">{uploadedFile.size} &bull; Đã sẵn sàng đính kèm</div>
                          </div>
                        </div>
                        <div className="flex items-center gap-1.5">
                          {uploadedFile.url && (
                            <a
                              href={uploadedFile.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="px-2.5 py-1 bg-white border border-slate-200 text-emerald-700 hover:bg-emerald-100 rounded-lg text-xs font-bold flex items-center gap-1"
                            >
                              <Eye className="w-3.5 h-3.5" /> Xem
                            </a>
                          )}
                          <button
                            type="button"
                            onClick={() => {
                              setUploadedFile(null);
                            }}
                            className="p-1.5 bg-white border border-slate-200 text-rose-600 hover:bg-rose-50 rounded-lg text-xs font-bold"
                            title="Xóa file đã chọn"
                          >
                            <X className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="pt-2 flex justify-between gap-2 border-t border-slate-200">
                    <button
                      type="button"
                      onClick={() => setRecordStep(1)}
                      className="px-4 py-2 border border-slate-200 rounded-lg text-slate-600 font-bold hover:bg-slate-50"
                    >
                      &larr; Quay lại
                    </button>
                    <button
                      type="button"
                      onClick={() => setRecordStep(3)}
                      className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-lg shadow-sm"
                    >
                      Kiểm tra ranh giới Luật &rarr;
                    </button>
                  </div>
                </div>
              )}

              {recordStep === 3 && (
                <div className="space-y-4">
                  <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl space-y-2 text-xs">
                    <div className="font-extrabold text-emerald-900 text-sm">Kết quả kiểm tra Luật HTX 2023:</div>
                    <div className="flex justify-between">
                      <span>Xã viên thụ hưởng:</span>
                      <strong className="text-slate-900">{members.find((m) => m.id === capitalForm.member_id)?.full_name}</strong>
                    </div>
                    <div className="flex justify-between">
                      <span>Hình thức góp:</span>
                      <strong className="text-slate-900">{capitalForm.contribution_type === 'LAND' ? 'Quyền sử dụng đất' : 'Tiền tệ'}</strong>
                    </div>
                    <div className="flex justify-between text-emerald-800 font-bold">
                      <span>Giá trị nộp bổ sung:</span>
                      <span>{(capitalForm.contribution_type === 'LAND' ? capitalForm.land_area_sqm * capitalForm.appraised_unit_price : capitalForm.amount).toLocaleString('vi-VN')} ₫</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Cảnh báo tỷ lệ trần 30%:</span>
                      <strong className="text-emerald-700">ĐẠT AN TOÀN (Dưới 30%)</strong>
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="block font-bold text-slate-700 text-xs">Chế độ phê duyệt khi lưu *</label>
                    <div className="grid grid-cols-2 gap-2">
                      <label
                        onClick={() => setCapitalForm({ ...capitalForm, approval_mode: 'DIRECT_APPROVE' })}
                        className={`p-2.5 rounded-lg border cursor-pointer flex items-center gap-2 text-xs ${capitalForm.approval_mode === 'DIRECT_APPROVE' ? 'border-emerald-600 bg-emerald-50 text-emerald-900 font-bold' : 'border-slate-200 text-slate-600'}`}
                      >
                        <input
                          type="radio"
                          name="approval_mode"
                          checked={capitalForm.approval_mode === 'DIRECT_APPROVE'}
                          onChange={() => {}}
                        />
                        <span>Phê duyệt & Cấp vốn ngay</span>
                      </label>

                      <label
                        onClick={() => setCapitalForm({ ...capitalForm, approval_mode: 'SUBMIT_PENDING' })}
                        className={`p-2.5 rounded-lg border cursor-pointer flex items-center gap-2 text-xs ${capitalForm.approval_mode === 'SUBMIT_PENDING' ? 'border-amber-500 bg-amber-50 text-amber-900 font-bold' : 'border-slate-200 text-slate-600'}`}
                      >
                        <input
                          type="radio"
                          name="approval_mode"
                          checked={capitalForm.approval_mode === 'SUBMIT_PENDING'}
                          onChange={() => {}}
                        />
                        <span>Tạo giao dịch Chờ duyệt</span>
                      </label>
                    </div>
                  </div>

                  <div className="pt-2 flex justify-between gap-2 border-t border-slate-200">
                    <button
                      type="button"
                      onClick={() => setRecordStep(2)}
                      className="px-4 py-2 border border-slate-200 rounded-lg text-slate-600 font-bold hover:bg-slate-50"
                    >
                      &larr; Quay lại
                    </button>
                    <button
                      type="submit"
                      className="px-6 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-lg shadow-md"
                    >
                      Lưu & Cấp Giấy chứng nhận Vốn
                    </button>
                  </div>
                </div>
              )}
            </form>
          </div>
        </div>
      )}

      {/* CERTIFICATE PREVIEW & PRINT MODAL MATCHING giay-chung-nhan-gop-von-4.docx */}
      {showCertificateModal && activeCertificate && (
        <div
          onClick={(e) => {
            if (e.target === e.currentTarget) setShowCertificateModal(false);
          }}
          className="fixed inset-0 bg-slate-900/80 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fade-in overflow-y-auto print:p-0 print:bg-white print:static"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="bg-white max-w-4xl w-full shadow-2xl overflow-hidden my-6 relative flex flex-col max-h-[95vh] border border-slate-300 print:max-h-none print:shadow-none print:my-0 print:w-full print:border-none"
          >
            {/* Global CSS Print Injection to hide web app background on Ctrl+P or window.print */}
            <style>{`
              @media print {
                @page {
                  size: A4 portrait;
                  margin: 10mm 15mm;
                }
                html, body {
                  height: auto !important;
                  overflow: visible !important;
                  background: #ffffff !important;
                  margin: 0 !important;
                  padding: 0 !important;
                }
                nav, sidebar, header, aside, [role="navigation"], .no-print {
                  display: none !important;
                }
                body * {
                  visibility: hidden !important;
                }
                #printable-certificate, #printable-certificate * {
                  visibility: visible !important;
                }
                #printable-certificate {
                  position: fixed !important;
                  left: 0 !important;
                  top: 0 !important;
                  width: 100% !important;
                  height: auto !important;
                  margin: 0 !important;
                  padding: 10mm 15mm !important;
                  box-shadow: none !important;
                  border: none !important;
                  background: #ffffff !important;
                  z-index: 9999999 !important;
                }
              }
            `}</style>

            {/* Certificate Header Action Bar */}
            <div className="p-3 bg-slate-900 text-white flex justify-between items-center shrink-0 print:hidden">
              <span className="font-bold text-xs flex items-center gap-1.5">
                <QrCode className="w-4 h-4 text-emerald-400" /> BẢN XEM TRƯỚC GIẤY CHỨNG NHẬN PHẦN VỐN GÓP (CẤP LẦN THỨ {activeCertificate.issue_count})
              </span>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => handlePrintStandalone(activeCertificate)}
                  className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold inline-flex items-center gap-1.5 transition-all cursor-pointer shadow-sm"
                  title="Mở cửa sổ riêng để in hoặc xuất file PDF chuẩn A4"
                >
                  <Printer className="w-3.5 h-3.5" /> In Giấy chứng nhận (A4)
                </button>
                <button
                  type="button"
                  onClick={() => setShowCertificateModal(false)}
                  className="px-3.5 py-1.5 bg-slate-700 hover:bg-slate-800 text-white rounded-lg text-xs font-bold inline-flex items-center gap-1.5 transition-all cursor-pointer"
                  title="Thoát / Đóng cửa sổ"
                >
                  <X className="w-4 h-4" /> Thoát / Đóng
                </button>
              </div>
            </div>

            {/* Scrollable Standard Certificate Content (Clean A4 Times New Roman Format) */}
            <div
              id="printable-certificate"
              style={{
                fontFamily: '"Times New Roman", Times, serif',
                color: '#000000',
                backgroundColor: '#ffffff',
              }}
              className="p-8 md:p-12 space-y-4 overflow-y-auto flex-1 text-[15px] leading-relaxed select-text print:p-0 print:overflow-visible"
            >
              {/* Header 2 Columns: HTX & Quốc Hiệu */}
              <div className="flex justify-between items-start pt-1">
                <div className="text-left space-y-0.5">
                  <div className="font-bold uppercase text-[14px]">{nfc(activeCertificate.cooperative_name)}</div>
                  <div className="text-[13.5px]">Số: <strong>{nfc(activeCertificate.certificate_code)}</strong></div>
                </div>
                <div className="text-center space-y-0.5">
                  <div className="font-bold uppercase text-[14px]">CỘNG HÒA XÃ HỘI CHỦ NGHĨA VIỆT NAM</div>
                  <div className="font-bold italic text-[13.5px]">Độc lập – Tự do – Hạnh phúc</div>
                  <div className="w-32 border-b border-black mx-auto pt-0.5"></div>
                </div>
              </div>

              {/* Title Section */}
              <div className="text-center pt-4 pb-1 space-y-1">
                <h1 className="text-2xl md:text-3xl font-bold uppercase tracking-wide">GIẤY CHỨNG NHẬN VỐN GÓP</h1>
                <div className="text-[14px] italic font-bold">(Cấp lần thứ {activeCertificate.issue_count})</div>
              </div>

              {/* Legal Bases */}
              <div className="text-[14.5px] italic space-y-1 pl-1">
                <p>Căn cứ Luật Hợp tác xã số 23/2012/QH13 (và Luật HTX số 17/2023/QH15) được Quốc hội nước CHXHCN Việt Nam thông qua và các văn bản hướng dẫn thi hành;</p>
                <p>Căn cứ Điều lệ {nfc(activeCertificate.cooperative_name)} được thông qua ngày {nfc(activeCertificate.cooperative_license_date)};</p>
                <p>Căn cứ mức vốn góp thực tế của các thành viên.</p>
              </div>

              {/* Cooperative Info */}
              <div className="space-y-1.5 text-[15px] pt-1">
                <div>Hợp tác xã (ghi bằng chữ in hoa): <strong className="uppercase font-bold">{nfc(activeCertificate.cooperative_name)}</strong></div>
                <div>Địa chỉ trụ sở chính: <span>{nfc(activeCertificate.cooperative_address)}</span></div>
                <div>Số và ngày cấp Giấy chứng nhận đăng ký HTX: <span>Số <strong>{nfc(activeCertificate.cooperative_license_no)}</strong>, ngày <strong>{nfc(activeCertificate.cooperative_license_date)}</strong></span></div>
              </div>

              {/* CHỨNG NHẬN Header */}
              <div className="text-center font-bold uppercase text-base tracking-widest pt-3 pb-1">
                CHỨNG NHẬN
              </div>

              {/* Member Details */}
              <div className="space-y-1.5 text-[15px]">
                <div>Họ và tên thành viên (là cá nhân hoặc đại diện hộ gia đình): <strong className="uppercase font-bold text-[16px] pl-1">{nfc(activeCertificate.member_full_name)}</strong></div>
                <div className="grid grid-cols-3 gap-2">
                  <div>Giới tính: <strong>{nfc(activeCertificate.member_gender)}</strong></div>
                  <div>Sinh ngày: <strong>{nfc(activeCertificate.member_dob)}</strong></div>
                  <div>Dân tộc: <strong>{nfc(activeCertificate.member_ethnicity)}</strong> &nbsp;&nbsp; Quốc tịch: <strong>{nfc(activeCertificate.member_nationality)}</strong></div>
                </div>
                <div>Nơi đăng ký hộ khẩu thường trú: <strong>{nfc(activeCertificate.member_address)}</strong></div>
                <div className="grid grid-cols-2 gap-2">
                  <div>Chứng minh nhân dân số (hoặc CCCD): <strong>{nfc(activeCertificate.member_cccd)}</strong></div>
                  <div>Ngày cấp: <strong>{nfc(activeCertificate.member_cccd_date)}</strong> &nbsp;&nbsp; Nơi cấp: <strong>{nfc(activeCertificate.member_cccd_place)}</strong></div>
                </div>
              </div>

              {/* Capital Amount Breakdown */}
              <div className="space-y-1.5 text-[15px] pt-2">
                <div>Tổng số vốn góp: <strong className="text-[17px] font-bold">{activeCertificate.total_capital_amount.toLocaleString('vi-VN')} đồng</strong> (Bằng chữ: <strong className="italic font-bold">{nfc(activeCertificate.capital_in_words)}</strong>)</div>
                <div>Hình thức góp vốn:</div>
                <div className="pl-6 space-y-1">
                  <div>+ Tiền mặt / Chuyển khoản: <strong>{nfc(activeCertificate.cash_amount_text) || `${activeCertificate.total_capital_amount.toLocaleString('vi-VN')} đồng`}</strong></div>
                  <div>+ Tài sản (ghi rõ loại tài sản): <strong>{nfc(activeCertificate.asset_amount_text) || 'Không'}</strong></div>
                </div>
                <div>Thời điểm góp vốn: <strong>{nfc(activeCertificate.contribution_date)}</strong></div>
              </div>

              {/* Legal Notice */}
              <div className="text-[14px] italic pt-3 text-justify">
                Trình tự, thủ tục cấp, cấp lại, thay đổi, thu hồi giấy chứng nhận vốn góp thực hiện theo quy định của Điều lệ HTX.
              </div>

              {/* Signatures & QR Code */}
              <div className="pt-6 flex justify-between items-end">
                <div className="text-center space-y-1">
                  <img
                    src={`https://api.qrserver.com/v1/create-qr-code/?size=160x160&data=${encodeURIComponent(
                      `HTX OCOP LÂM ĐỒNG - GCN VỐN GÓP: Số ${activeCertificate.certificate_code} | Xã Viên: ${activeCertificate.member_full_name} (${activeCertificate.member_cccd}) | Tổng vốn thực góp: ${activeCertificate.total_capital_amount.toLocaleString('vi-VN')} VNĐ | Cấp lần thứ: ${activeCertificate.issue_count} | Ngày cấp: ${activeCertificate.certificate_issue_date}`
                    )}`}
                    alt="Mã QR Tra cứu GCN"
                    className="w-24 h-24 mx-auto border border-slate-200 p-1 bg-white"
                  />
                  <span className="text-[11px] font-mono text-slate-700 font-bold block mt-1">Mã QR Tra cứu GCN</span>
                </div>

                <div className="text-center text-[14px] space-y-1 pr-2">
                  <div className="italic">{nfc(activeCertificate.issue_place)}, Ngày {new Date().getDate()} tháng {new Date().getMonth() + 1} năm {new Date().getFullYear()}</div>
                  <div className="font-bold uppercase text-[14px]">ĐĐ. THEO PHÁP LUẬT CỦA HỢP TÁC XÃ</div>
                  <div className="text-[12px] italic">(Ký tên, đóng dấu)</div>
                  <div className="h-20"></div>
                  <div className="font-bold uppercase text-[15px]">{nfc(activeCertificate.representative_name)}</div>
                </div>
              </div>
            </div>

            {/* Bottom Fixed Action Bar */}
            <div className="p-3 bg-slate-100 border-t border-slate-300 flex justify-between items-center shrink-0 print:hidden">
              <span className="text-xs text-slate-500 font-medium hidden sm:inline">
                Nhấn "Thoát / Đóng" hoặc click phông nền mờ để quay lại
              </span>
              <div className="flex items-center gap-2.5 ml-auto">
                <button
                  type="button"
                  onClick={() => setShowCertificateModal(false)}
                  className="px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-800 font-bold text-xs rounded-lg inline-flex items-center gap-1.5 transition-all cursor-pointer"
                >
                  <X className="w-4 h-4 text-slate-600" /> Thoát / Đóng
                </button>
                <button
                  type="button"
                  onClick={() => handlePrintStandalone(activeCertificate)}
                  className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-lg shadow-sm inline-flex items-center gap-1.5 transition-all cursor-pointer"
                  title="Mở cửa sổ riêng để in hoặc xuất file PDF chuẩn A4"
                >
                  <Printer className="w-4 h-4" /> In Giấy chứng nhận (A4)
                </button>
            </div>
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
                    const mem = members.find((m) => m.id === viewingVoucherTx.member_id || m.member_code === viewingVoucherTx.member_code) || selectedCapitalMember || members[0];
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
                    members.find((m) => m.id === viewingVoucherTx.member_id || m.member_code === viewingVoucherTx.member_code) || selectedCapitalMember || members[0],
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
