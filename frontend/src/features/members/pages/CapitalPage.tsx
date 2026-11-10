import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
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
import { downloadServerReportXlsx } from '@/utils/exportUtils';
import { buildCapitalCertificate } from '../utils/certificateUtils';
import { useTenantContextStore } from '@/stores/tenantContextStore';
import { CapitalKpiCards } from '../components/CapitalKpiCards';
import { CapitalMembersTab } from '../components/CapitalMembersTab';
import { CapitalMemberDrawer } from '../components/CapitalMemberDrawer';
import { CapitalCharts } from '../components/CapitalCharts';
import { CapitalRecordModal, CapitalFormData } from '../components/CapitalRecordModal';
import { CapitalPendingModal } from '../components/CapitalPendingModal';
import { CapitalCertificateModal } from '../components/CapitalCertificateModal';
import { CapitalVoucherModal } from '../components/CapitalVoucherModal';

export const CapitalPage: React.FC = () => {
  const queryClient = useQueryClient();
  const { activeCooperative } = useTenantContextStore();

  // TanStack React Query v5 Data Fetching
  const { data: members = [], isLoading: loadingMembers } = useQuery<Member[]>({
    queryKey: ['members'],
    queryFn: () => getMembersFromApi(),
  });

  const { data: transactions = [] } = useQuery<CapitalTransaction[]>({
    queryKey: ['capital-contributions'],
    queryFn: () => getCapitalContributionsApi(),
  });

  const { data: summaryData = null } = useQuery<CapitalSummaryData | null>({
    queryKey: ['capital-summary'],
    queryFn: () => getCapitalSummaryApi(),
  });

  // Filter & Selected state
  const [searchParams] = useSearchParams();
  const paramMemberId = searchParams.get('member_id') || searchParams.get('memberId');
  const [search, setSearch] = useState('');
  const [capitalStatusFilter, setCapitalStatusFilter] = useState<string>('ALL');
  const [selectedCapitalMember, setSelectedCapitalMember] = useState<Member | null>(null);

  useEffect(() => {
    if (paramMemberId && members.length > 0) {
      const target = members.find((m) => m.id === paramMemberId || m.member_code === paramMemberId);
      if (target) {
        setSelectedCapitalMember(target);
      }
    }
  }, [paramMemberId, members]);

  // Modals state
  const [showRecordModal, setShowRecordModal] = useState<boolean>(false);
  const [selectedRecordMember, setSelectedRecordMember] = useState<Member | null>(null);
  const [recordContributionType, setRecordContributionType] = useState<
    'TIEN_MAT' | 'CHUYEN_KHOAN' | 'LAND' | 'HIEN_VAT' | undefined
  >(undefined);
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
        cadastral_status: formData.cadastral_status,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['members'] });
      queryClient.invalidateQueries({ queryKey: ['capital-contributions'] });
      queryClient.invalidateQueries({ queryKey: ['capital-summary'] });
    },
  });

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

  const handleSelectMember = (m: Member) => {
    setSelectedCapitalMember(m);
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
    const cert = buildCapitalCertificate(member, transactions, activeCooperative, targetIssueCount);
    setActiveCertificate(cert);
    setShowCertificateModal(true);
  };

  const handleExportExcel = async () => {
    try {
      await downloadServerReportXlsx(
        '/reports/export/capital',
        `Bao_Cao_Von_Gop_HTX_${new Date().toISOString().slice(0, 10)}.xlsx`
      );
      triggerToast('Đã tải thành công file Excel Báo cáo vốn góp từ Server!');
    } catch {
      exportCapitalToExcel(members, transactions);
      triggerToast('Đã xuất thành công file Excel Báo cáo vốn góp!');
    }
  };

  return (
    <div className="space-y-4 pb-12 animate-fade-in font-sans text-slate-700">
      {/* Toast Notification Floating */}
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

      {/* Breadcrumb Header */}
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold text-slate-400">
            <span>Quản trị Xã viên</span>
            <ChevronRight className="w-3.5 h-3.5" />
            <span className="text-slate-800">Quản lý Vốn góp (Luật HTX 2023)</span>
          </div>
          <h1 className="text-xl font-extrabold text-slate-900 tracking-tight mt-1">
            Quản lý Vốn góp & Chứng nhận Vốn
          </h1>
          <p className="text-[12.8px] text-slate-500">
            Theo dõi vốn cam kết, nộp vốn thực tế, định giá ruộng đất góp vốn và cấp Giấy chứng nhận
            phần vốn góp điện tử
          </p>
        </div>

        <div className="flex items-center gap-2">
          <div className="px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-xs font-bold text-slate-700 flex items-center gap-2 shadow-xs">
            <Calendar className="w-4 h-4 text-emerald-600" />
            <span>Niên độ 2025</span>
          </div>

          <button
            onClick={() => {
              setSelectedRecordMember(null);
              setRecordContributionType(undefined);
              setShowRecordModal(true);
            }}
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

      {/* Main Members Capital Table (Full Width 100%) */}
      <div className="w-full">
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

      {/* Slide-over Sheet / Drawer for Capital Member Details (Overlay with Backdrop) */}
      <CapitalMemberDrawer
        isOpen={Boolean(selectedCapitalMember)}
        member={selectedCapitalMember}
        onClose={() => setSelectedCapitalMember(null)}
        transactions={transactions}
        onOpenCertificate={openCertificatePreview}
        onViewVoucher={(tx) => setViewingVoucherTx(tx)}
        onRecordCapital={(m) => {
          setSelectedRecordMember(m);
          setRecordContributionType(undefined);
          setShowRecordModal(true);
        }}
        onAddLand={(m) => {
          setSelectedRecordMember(m);
          setRecordContributionType('LAND');
          setShowRecordModal(true);
        }}
      />

      {/* Charts & Analytics */}
      <CapitalCharts members={members} />

      {/* Record Capital Modal */}
      <CapitalRecordModal
        isOpen={showRecordModal}
        onClose={() => {
          setShowRecordModal(false);
          setSelectedRecordMember(null);
          setRecordContributionType(undefined);
        }}
        members={members}
        initialMemberId={selectedRecordMember?.id}
        initialContributionType={recordContributionType}
        totalContributedCapital={totalContributedCapital}
        onSubmit={handleSaveContribution}
      />

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
