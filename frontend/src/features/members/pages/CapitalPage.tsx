import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  Plus,
  FileSpreadsheet,
  Calendar,
  ChevronRight,
  CheckCircle2,
} from 'lucide-react';
import {
  getMembersFromApi,
  getCapitalContributionsApi,
  getCapitalSummaryApi,
  createCapitalContributionApi,
} from '@/services/memberService';
import { Member, CapitalTransaction, CapitalCertificate } from '@/types/memberTypes';
import { exportCapitalToExcel, CapitalSummaryData } from '@/utils/excelExporter';
import { CapitalKpiCards } from '../components/CapitalKpiCards';
import { CapitalMembersTab } from '../components/CapitalMembersTab';
import { CapitalMemberDrawer } from '../components/CapitalMemberDrawer';
import { CapitalCharts } from '../components/CapitalCharts';
import { CapitalRecordModal, CapitalFormData } from '../components/CapitalRecordModal';
import { CapitalPendingModal } from '../components/CapitalPendingModal';
import { CapitalCertificateModal } from '../components/CapitalCertificateModal';
import { CapitalVoucherModal } from '../components/CapitalVoucherModal';

const nfc = (str?: string | number | null): string => {
  if (str === undefined || str === null) return '';
  return String(str)
    .normalize('NFC')
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
  const queryClient = useQueryClient();

  // TanStack React Query v5 Data Fetching
  const { data: members = [], isLoading: loadingMembers } = useQuery<Member[]>({
    queryKey: ['members'],
    queryFn: () => getMembersFromApi(),
  });

  const { data: transactions = [], isLoading: loadingTx } = useQuery<CapitalTransaction[]>({
    queryKey: ['capital-contributions'],
    queryFn: () => getCapitalContributionsApi(),
  });

  const { data: summaryData = null, isLoading: loadingSummary } = useQuery<CapitalSummaryData | null>({
    queryKey: ['capital-summary'],
    queryFn: () => getCapitalSummaryApi(),
  });

  const loading = loadingMembers || loadingTx || loadingSummary;

  // Filter & Selected state
  const [search, setSearch] = useState('');
  const [capitalStatusFilter, setCapitalStatusFilter] = useState<string>('ALL');
  const [txTypeFilter, setTxTypeFilter] = useState<string>('ALL');
  const [dateFilter, setDateFilter] = useState<string>('');
  const [selectedCapitalMember, setSelectedCapitalMember] = useState<Member | null>(null);

  // Pagination
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [pageSize, setPageSize] = useState<number>(6);

  // Modals state
  const [showRecordModal, setShowRecordModal] = useState<boolean>(false);
  const [showPendingCapitalModal, setShowPendingCapitalModal] = useState<boolean>(false);
  const [showCertificateModal, setShowCertificateModal] = useState<boolean>(false);
  const [activeCertificate, setActiveCertificate] = useState<CapitalCertificate | null>(null);
  const [viewingVoucherTx, setViewingVoucherTx] = useState<CapitalTransaction | null>(null);

  const [toast, setToast] = useState<{ message: string; type: 'success' | 'danger' } | null>(null);

  const triggerToast = (message: string, type: 'success' | 'danger' = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3500);
  };

  const createCapitalMutation = useMutation({
    mutationFn: async ({ memberId, formData }: { memberId: string; formData: CapitalFormData }) => {
      const effectiveAmount =
        formData.contribution_type === 'LAND'
          ? (formData.land_area_sqm || 0) * (formData.appraised_unit_price || 0)
          : formData.amount;

      return createCapitalContributionApi(memberId, {
        form: formData.contribution_type,
        amount: effectiveAmount,
        date: formData.contribution_date,
        notes: formData.content,
        land_certificate_no: formData.land_certificate_no,
        plot_number: formData.plot_number,
        map_sheet_number: formData.map_sheet_number,
        land_area_sqm: formData.land_area_sqm,
        land_use_type: formData.land_use_type,
        appraised_unit_price: formData.appraised_unit_price,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['members'] });
      queryClient.invalidateQueries({ queryKey: ['capital-contributions'] });
      queryClient.invalidateQueries({ queryKey: ['capital-summary'] });
    },
  });

  useEffect(() => {
    setCurrentPage(1);
  }, [search, capitalStatusFilter]);

  // Calculations
  const totalCommittedCapital =
    summaryData?.total_committed_capital ??
    members.reduce((sum, m) => sum + (m.committed_capital || 0), 0);

  const totalContributedCapital =
    summaryData?.total_paid_capital ??
    members.reduce((sum, m) => sum + (m.contributed_capital || 0), 0);

  const totalRemainingCapital =
    summaryData?.remaining_capital ??
    Math.max(0, totalCommittedCapital - totalContributedCapital);

  const overallCapitalPct =
    summaryData?.completion_rate ??
    (totalCommittedCapital > 0
      ? Number(((totalContributedCapital / totalCommittedCapital) * 100).toFixed(2))
      : 0);

  const associateGroupCapital = members
    .filter((m) => m.member_type === 'LIEN_KET_GOP_VON')
    .reduce((sum, m) => sum + (m.contributed_capital || 0), 0);

  const associateGroupPct =
    totalContributedCapital > 0
      ? Number(((associateGroupCapital / totalContributedCapital) * 100).toFixed(2))
      : 0;

  const isAssociateGroupOverLimit = associateGroupPct > 30.0;
  const pendingCount = transactions.filter((t) => t.status === 'PENDING').length;

  // Filter members
  const filteredMembers = members.filter((m) => {
    const matchSearch =
      (m.full_name || '').toLowerCase().includes(search.toLowerCase()) ||
      (m.member_code || '').toLowerCase().includes(search.toLowerCase());
    const matchStatus =
      capitalStatusFilter === 'ALL' || m.capital_status === capitalStatusFilter;
    return matchSearch && matchStatus;
  });

  const totalPages = Math.ceil(filteredMembers.length / pageSize) || 1;
  const safeCurrentPage = Math.min(currentPage, totalPages);
  const paginatedMembers = filteredMembers.slice(
    (safeCurrentPage - 1) * pageSize,
    safeCurrentPage * pageSize
  );

  // Handlers
  const handleSelectMember = (m: Member) => {
    setSelectedCapitalMember(m);
    setTimeout(() => {
      const el = document.getElementById('capital-drawer-panel');
      if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      }
    }, 50);
  };

  const handleApproveCapitalTx = (txId: string) => {
    const tx = transactions.find((t) => t.id === txId);
    if (!tx) return;

    queryClient.invalidateQueries({ queryKey: ['members'] });
    queryClient.invalidateQueries({ queryKey: ['capital-contributions'] });
    queryClient.invalidateQueries({ queryKey: ['capital-summary'] });

    triggerToast(
      `Đã phê duyệt giao dịch ${tx.transaction_code || tx.receipt_number || ''} (${tx.amount.toLocaleString('vi-VN')} ₫) cho ${tx.member_name}!`,
      'success'
    );
  };

  const handleRejectCapitalTx = (txId: string) => {
    const tx = transactions.find((t) => t.id === txId);
    if (!tx) return;
    queryClient.invalidateQueries({ queryKey: ['capital-contributions'] });
    triggerToast(`Đã từ chối giao dịch của ${tx.member_name}.`, 'danger');
  };

  const handleSaveContribution = async (formData: CapitalFormData) => {
    const mem = members.find((m) => m.id === formData.member_id);
    if (!mem) return;

    createCapitalMutation.mutate(
      { memberId: mem.id, formData },
      {
        onSuccess: () => {
          const isPending = formData.approval_mode === 'SUBMIT_PENDING';
          if (!isPending) {
            triggerToast(`Đã ghi nhận & phê duyệt góp vốn cho xã viên ${mem.full_name}!`);
          } else {
            triggerToast(`Đã tạo giao dịch CHỜ DUYỆT cho ${mem.full_name}!`, 'success');
          }
        },
      }
    );
  };

  const openCertificatePreview = (member: Member, targetIssueCount?: number) => {
    const memberTxs = transactions
      .filter(
        (tx) =>
          (tx.member_id === member.id || tx.member_code === member.member_code) &&
          tx.status === 'APPROVED'
      )
      .sort((a, b) => new Date(a.contribution_date).getTime() - new Date(b.contribution_date).getTime());

    const issueCount = targetIssueCount && targetIssueCount > 0 ? targetIssueCount : Math.max(1, memberTxs.length);
    const cumulativeTxs = memberTxs.slice(0, issueCount);
    const cumulativeCapital =
      cumulativeTxs.length > 0
        ? cumulativeTxs.reduce((sum, tx) => sum + tx.amount, 0)
        : member.contributed_capital || 10000000;

    const cashAmount = cumulativeTxs
      .filter((tx) => tx.payment_method === 'CASH' || tx.payment_method === 'BANK_TRANSFER')
      .reduce((sum, tx) => sum + tx.amount, 0);

    const assetAmount = cumulativeTxs
      .filter((tx) => tx.payment_method === 'LAND' || tx.payment_method === 'ASSET')
      .reduce((sum, tx) => sum + tx.amount, 0);

    const latestTx = cumulativeTxs[cumulativeTxs.length - 1];
    const contributionDate = latestTx ? latestTx.contribution_date : (member.join_date || '2025-01-01');
    const certCode = `${String(issueCount).padStart(2, '0')}/2025/GCN-HTX`;

    const cert: CapitalCertificate = {
      certificate_code: certCode,
      certificate_issue_date: contributionDate,
      issue_count: issueCount,
      legal_base_law:
        'Căn cứ Luật Hợp tác xã số 17/2023/QH15 được Quốc hội nước CHXHCN Việt Nam thông qua và các văn bản hướng dẫn thi hành;',
      legal_base_charter: 'Căn cứ Điều lệ Hợp tác xã được Đại hội thành viên thông qua;',
      cooperative_name: 'HỢP TÁC XÃ NÔNG NGHIỆP THƯƠNG MẠI DỊCH VỤ OCOP PHÚ THỊNH',
      cooperative_address: 'Thị trấn Đinh Văn, Huyện Lâm Hà, Tỉnh Lâm Đồng',
      cooperative_license_no: '4201982345',
      cooperative_license_date: '15/12/2023',
      member_full_name: member.full_name,
      member_gender: member.gender || 'Nam',
      member_dob: member.dob || '15/06/1980',
      member_ethnicity: 'Kinh',
      member_nationality: 'Việt Nam',
      member_address: member.address,
      member_cccd: member.cccd,
      member_cccd_date: member.cccd_issue_date || '10/05/2021',
      member_cccd_place: member.cccd_issue_place || 'Cục Cảnh sát QLHC về TTXH',
      total_capital_amount: cumulativeCapital,
      capital_in_words: `${(cumulativeCapital / 1000000).toLocaleString('vi-VN')} triệu đồng`,
      contribution_form:
        assetAmount > 0
          ? 'Tiền mặt và Tài sản (Quyền sử dụng đất)'
          : 'Tiền mặt / Chuyển khoản',
      cash_amount_text: cashAmount > 0 ? `${cashAmount.toLocaleString('vi-VN')} VNĐ` : '0 VNĐ',
      asset_amount_text:
        assetAmount > 0 ? `${assetAmount.toLocaleString('vi-VN')} VNĐ (QSDĐ HTX)` : 'Không',
      contribution_date: contributionDate,
      issue_place: 'Lâm Đồng',
      representative_name: 'Trần Văn Cường (Chủ tịch HĐQT / Giám đốc)',
      qr_code_payload: `HTX_OCOP_CERT:${certCode}|MEMBER:${member.member_code}|AMOUNT:${cumulativeCapital}`,
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
  </style>
</head>
<body>
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
    <p>Căn cứ Luật Hợp tác xã số 17/2023/QH15 được Quốc hội nước CHXHCN Việt Nam thông qua và các văn bản hướng dẫn thi hành;</p>
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
    <div>Họ và tên thành viên: <strong style="text-transform: uppercase; font-size: 16px;">${nfc(cert.member_full_name)}</strong></div>
    <div class="grid-3">
      <div>Giới tính: <strong>${nfc(cert.member_gender)}</strong></div>
      <div>Sinh ngày: <strong>${nfc(cert.member_dob)}</strong></div>
      <div>Dân tộc: <strong>${nfc(cert.member_ethnicity)}</strong> &nbsp;&nbsp; Quốc tịch: <strong>${nfc(cert.member_nationality)}</strong></div>
    </div>
    <div>Nơi đăng ký HKTT: <strong>${nfc(cert.member_address)}</strong></div>
    <div class="grid-2">
      <div>CCCD/CMND số: <strong>${nfc(cert.member_cccd)}</strong></div>
      <div>Ngày cấp: <strong>${nfc(cert.member_cccd_date)}</strong> &nbsp;&nbsp; Nơi cấp: <strong>${nfc(cert.member_cccd_place)}</strong></div>
    </div>
  </div>

  <div class="section-info">
    <div>Tổng số vốn góp: <strong style="font-size: 17px;">${cert.total_capital_amount.toLocaleString('vi-VN')} đồng</strong> (Bằng chữ: <strong style="font-style: italic;">${nfc(cert.capital_in_words)}</strong>)</div>
    <div>Hình thức góp vốn:</div>
    <div style="padding-left: 24px;">
      <div>+ Tiền mặt / Chuyển khoản: <strong>${nfc(cert.cash_amount_text) || `${cert.total_capital_amount.toLocaleString('vi-VN')} đồng`}</strong></div>
      <div>+ Tài sản (quyền sử dụng đất): <strong>${nfc(cert.asset_amount_text) || 'Không'}</strong></div>
    </div>
    <div style="margin-top: 4px;">Thời điểm góp vốn: <strong>${nfc(cert.contribution_date)}</strong></div>
  </div>

  <div style="font-style: italic; font-size: 14px; margin-top: 12px; text-align: justify;">
    Trình tự, thủ tục cấp, cấp lại, thay đổi, thu hồi giấy chứng nhận vốn góp thực hiện theo quy định của Luật HTX 2023 và Điều lệ HTX.
  </div>

  <table class="signatures">
    <tr>
      <td style="width: 40%;">
        <img
          src="https://api.qrserver.com/v1/create-qr-code/?size=160x160&data=${encodeURIComponent(
            `HTX OCOP - GCN VỐN GÓP: Số ${cert.certificate_code} | Xã Viên: ${cert.member_full_name} | Vốn thực góp: ${cert.total_capital_amount.toLocaleString('vi-VN')} VNĐ`
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
</body>
</html>
    `;
    printWin.document.write(htmlContent);
    printWin.document.close();
    printWin.focus();
    setTimeout(() => printWin.print(), 500);
  };

  const handleExportExcel = () => {
    exportCapitalToExcel(members, transactions, summaryData || undefined);
    triggerToast('Đã xuất thành công file Excel Báo cáo vốn góp HTX!');
  };

  return (
    <div className="space-y-4 pb-12 animate-fade-in">
      {toast && (
        <div
          className={`fixed top-4 right-4 z-50 px-4 py-3 rounded-xl shadow-modal text-white text-xs font-extrabold flex items-center gap-2 animate-bounce ${
            toast.type === 'danger' ? 'bg-rose-600' : 'bg-emerald-600'
          }`}
        >
          <CheckCircle2 className="w-4 h-4" />
          {toast.message}
        </div>
      )}

      {/* Header & Quick Action Buttons */}
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold text-slate-400">
            <span>Quản trị HTX</span>
            <ChevronRight className="w-3.5 h-3.5" />
            <span className="text-slate-800">Quản lý Vốn góp (Luật HTX 2023)</span>
          </div>
          <h1 className="text-xl font-extrabold text-slate-900 tracking-tight mt-1">
            Quản lý Vốn góp & Chứng nhận Vốn
          </h1>
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
            onClick={() => setShowRecordModal(true)}
            className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-[12.8px] rounded-lg shadow-sm inline-flex items-center gap-1.5 transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4" /> Ghi nhận góp vốn
          </button>
          <button
            onClick={handleExportExcel}
            className="px-3.5 py-2 border border-slate-200 hover:bg-slate-50 text-slate-700 font-bold text-[12.8px] rounded-lg inline-flex items-center gap-1.5 bg-white shadow-xs cursor-pointer"
          >
            <FileSpreadsheet className="w-4 h-4 text-emerald-600" /> Xuất Excel
          </button>
        </div>
      </div>

      {/* KPI Cards & Law 2023 Limit Warning */}
      <CapitalKpiCards
        members={members}
        transactions={transactions}
        totalCommittedCapital={totalCommittedCapital}
        totalContributedCapital={totalContributedCapital}
        totalRemainingCapital={totalRemainingCapital}
        overallCapitalPct={overallCapitalPct}
        associateGroupPct={associateGroupPct}
        isAssociateGroupOverLimit={isAssociateGroupOverLimit}
        onOpenPendingModal={() => setShowPendingCapitalModal(true)}
        triggerToast={triggerToast}
      />

      {/* Main Members Capital Table & Side Drawer */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 items-start">
        <div className={selectedCapitalMember ? 'lg:col-span-2' : 'lg:col-span-3'}>
          <CapitalMembersTab
            members={members}
            search={search}
            setSearch={setSearch}
            capitalStatusFilter={capitalStatusFilter}
            setCapitalStatusFilter={setCapitalStatusFilter}
            totalContributedCapital={totalContributedCapital}
            selectedCapitalMember={selectedCapitalMember}
            onSelectMember={handleSelectMember}
            onOpenCertificate={openCertificatePreview}
          />
        </div>

        {selectedCapitalMember && (
          <CapitalMemberDrawer
            member={selectedCapitalMember}
            onClose={() => setSelectedCapitalMember(null)}
            transactions={transactions}
            onOpenCertificate={openCertificatePreview}
            onViewVoucher={(tx) => setViewingVoucherTx(tx)}
          />
        )}
      </div>

      {/* Charts & Analytics */}
      <CapitalCharts members={members} />

      {/* Record Capital Modal */}
      <CapitalRecordModal
        isOpen={showRecordModal}
        onClose={() => setShowRecordModal(false)}
        members={members}
        totalContributedCapital={totalContributedCapital}
        onSubmit={handleSaveContribution}
      />

      {/* Pending Transactions Modal */}
      <CapitalPendingModal
        isOpen={showPendingCapitalModal}
        onClose={() => setShowPendingCapitalModal(false)}
        pendingTransactions={transactions.filter((t) => t.status === 'PENDING')}
        onApprove={handleApproveCapitalTx}
        onReject={handleRejectCapitalTx}
      />

      {/* Certificate Modal */}
      <CapitalCertificateModal
        isOpen={showCertificateModal}
        onClose={() => setShowCertificateModal(false)}
        certificate={activeCertificate}
        onPrintStandalone={handlePrintStandalone}
      />

      {/* Voucher Modal */}
      <CapitalVoucherModal
        transaction={viewingVoucherTx}
        member={
          viewingVoucherTx
            ? members.find(
                (m) =>
                  m.id === viewingVoucherTx.member_id ||
                  m.member_code === viewingVoucherTx.member_code
              ) || selectedCapitalMember
            : null
        }
        onClose={() => setViewingVoucherTx(null)}
      />
    </div>
  );
};

export default CapitalPage;
