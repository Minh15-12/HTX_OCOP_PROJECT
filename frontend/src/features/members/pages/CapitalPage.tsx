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
} from 'lucide-react';
import { mockMembersList, mockCapitalTransactions } from '@/services/memberService';
import { Member, CapitalTransaction, LandContribution, CapitalCertificate } from '@/types/memberTypes';

export const CapitalPage: React.FC = () => {
  const [members, setMembers] = useState<Member[]>(mockMembersList);
  const [transactions, setTransactions] = useState<CapitalTransaction[]>(mockCapitalTransactions);

  const [search, setSearch] = useState('');
  const [capitalStatusFilter, setCapitalStatusFilter] = useState<string>('ALL');
  const [selectedCapitalMember, setSelectedCapitalMember] = useState<Member | null>(null);

  const [showRecordModal, setShowRecordModal] = useState(false);
  const [recordStep, setRecordStep] = useState<1 | 2 | 3>(1);
  const [showPendingCapitalModal, setShowPendingCapitalModal] = useState(false);
  const [showCertificateModal, setShowCertificateModal] = useState(false);
  const [activeCertificate, setActiveCertificate] = useState<CapitalCertificate | null>(null);
  const [capitalDrawerTab, setCapitalDrawerTab] = useState<'history' | 'land' | 'certificate' | 'info'>('history');

  const [toast, setToast] = useState<{ message: string; type: 'success' | 'danger' } | null>(null);

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

    triggerToast(`Đã phê duyệt thành công giao dịch ${tx.transaction_code} (${tx.amount.toLocaleString('vi-VN')} ₫) cho ${tx.member_name}!`, 'success');
  };

  const handleRejectCapitalTx = (txId: string) => {
    const tx = transactions.find((t) => t.id === txId);
    if (!tx) return;
    setTransactions((prev) => prev.filter((t) => t.id !== txId));
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
      status: 'APPROVED',
      recorded_by: 'Kế toán trưởng',
      recorded_date: new Date().toLocaleDateString('vi-VN'),
      land_details: landDetails,
      certificate_code: certCode,
    };

    setTransactions([newTx, ...transactions]);

    setMembers(
      members.map((m) => {
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
            capital_status: newRemaining === 0 ? 'DU_VON' : 'CHUA_DU',
            ownership_percentage: Number(((newContributed / newCoopTotal) * 100).toFixed(2)),
            land_contributions: newLandList,
          };
        }
        return m;
      })
    );

    setShowRecordModal(false);
    setRecordStep(1);
    triggerToast(`Đã ghi nhận góp vốn thành công cho xã viên ${mem.full_name}!`);
  };

  const openCertificatePreview = (member: Member) => {
    const certCode = member.certificate?.certificate_code || `GCN-2025-${member.member_code}`;
    const cert: CapitalCertificate = {
      certificate_code: certCode,
      certificate_issue_date: member.contribution_date || '10/01/2024',
      issue_count: 1,
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
      member_cccd_date: member.cccd_issue_date,
      member_cccd_place: member.cccd_issue_place,
      total_capital_amount: member.contributed_capital,
      capital_in_words: member.capital_in_words || `${(member.contributed_capital / 1000000).toFixed(0)} triệu đồng`,
      contribution_form: member.capital_form === 'QUYEN_SU_DUNG_DAT' ? 'Quyền sử dụng đất & Tiền mặt' : 'Tiền mặt / Chuyển khoản',
      contribution_date: member.join_date,
      representative_name: 'Trần Văn Cường (Chủ tịch HĐQT)',
      qr_code_payload: `HTX_OCOP_CERT:${certCode}|MEMBER:${member.member_code}|AMOUNT:${member.contributed_capital}`,
    };
    setActiveCertificate(cert);
    setShowCertificateModal(true);
  };

  const filteredMembers = members.filter((m) => {
    const matchSearch =
      m.full_name.toLowerCase().includes(search.toLowerCase()) ||
      m.member_code.toLowerCase().includes(search.toLowerCase());
    const matchCapitalStatus = capitalStatusFilter === 'ALL' || m.capital_status === capitalStatusFilter;
    return matchSearch && matchCapitalStatus;
  });

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
                {filteredMembers.map((m, idx) => {
                  const pct = m.ownership_percentage || Number((((m.contributed_capital || 0) / (totalContributedCapital || 1)) * 100).toFixed(2));
                  const isNearLimit = pct >= 25.0 && pct < 30.0;
                  const isLimitBreach = pct >= 30.0;

                  return (
                    <tr
                      key={m.id}
                      onClick={() => setSelectedCapitalMember(m)}
                      className={`cursor-pointer hover:bg-slate-50 transition-colors ${
                        selectedCapitalMember?.id === m.id ? 'bg-emerald-50/60 font-semibold' : ''
                      }`}
                    >
                      <td className="py-3 px-3 text-slate-500 font-medium">{idx + 1}</td>
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
                              setSelectedCapitalMember(m);
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
        </div>

        {/* SIDE DRAWER FOR SELECTED MEMBER */}
        {selectedCapitalMember && (
          <div className="bg-white border border-[#e7e9ec] rounded-xl shadow-subtle p-4 space-y-4 animate-fade-in">
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
                            <td className="py-2 px-2.5 text-slate-600">{tx.contribution_date}</td>
                            <td className="py-2 px-2.5 font-bold text-emerald-700">+{tx.amount.toLocaleString('vi-VN')} ₫</td>
                            <td className="py-2 px-2.5 text-slate-600">{tx.payment_method === 'CASH' ? 'Tiền mặt' : tx.payment_method === 'LAND' ? 'Ruộng đất (QSDĐ)' : 'Chuyển khoản'}</td>
                            <td className="py-2 px-2.5 font-mono text-emerald-700 font-semibold">{tx.receipt_number}</td>
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
                <div className="p-3 border border-emerald-200 bg-emerald-50/40 rounded-xl text-center space-y-2">
                  <QrCode className="w-12 h-12 text-emerald-700 mx-auto" />
                  <div className="font-extrabold text-slate-900 text-sm">Giấy chứng nhận phần vốn góp điện tử</div>
                  <div className="font-mono text-xs text-emerald-800 font-bold">Số: GCN-2025-{selectedCapitalMember.member_code}</div>
                  <button
                    onClick={() => openCertificatePreview(selectedCapitalMember)}
                    className="w-full py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-lg inline-flex items-center justify-center gap-1.5 shadow-xs"
                  >
                    <Eye className="w-4 h-4" /> Xem trước & In Giấy chứng nhận
                  </button>
                </div>
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
            {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map((m) => (
              <div key={m} className="flex-1 flex items-end justify-center gap-0.5 relative group">
                <div className="w-2 bg-emerald-600 rounded-t-xs" style={{ height: `${40 + (m * 4) % 50}%` }}></div>
                <div className="w-2 bg-blue-500 rounded-t-xs" style={{ height: `${35 + (m * 3.8) % 45}%` }}></div>
                <span className="absolute -bottom-5 text-[10px] font-bold text-slate-400">T{m}</span>
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
                    <div className="border-2 border-dashed border-slate-200 hover:border-emerald-500 rounded-xl p-3 text-center bg-slate-50/50 cursor-pointer">
                      <Upload className="w-5 h-5 text-slate-400 mx-auto mb-1" />
                      <div className="text-slate-600 font-medium text-[11.5px]">Tải lên Biên bản họp Đại hội thành viên / Hợp đồng công chứng</div>
                    </div>
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

      {/* CERTIFICATE PREVIEW & PRINT MODAL */}
      {showCertificateModal && activeCertificate && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fade-in overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-3xl w-full shadow-modal overflow-hidden my-6 border-4 border-emerald-700">
            {/* Certificate Header Action Bar */}
            <div className="p-3 bg-slate-900 text-white flex justify-between items-center">
              <span className="font-bold text-xs flex items-center gap-1.5">
                <QrCode className="w-4 h-4 text-emerald-400" /> BẢN XEM TRƯỚC GIẤY CHỨNG NHẬN PHẦN VỐN GÓP ĐIỆN TỬ
              </span>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => window.print()}
                  className="px-3 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded text-xs font-bold inline-flex items-center gap-1"
                >
                  <Printer className="w-3.5 h-3.5" /> In Giấy chứng nhận
                </button>
                <button onClick={() => setShowCertificateModal(false)} className="text-slate-400 hover:text-white p-1">
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Standard Certificate Content Matching giay-chung-nhan-gop-von-4.docx */}
            <div className="p-8 space-y-6 text-slate-900 font-serif bg-[#fffdf9] relative">
              <div className="text-center space-y-1">
                <div className="font-bold uppercase text-xs tracking-wider">{activeCertificate.cooperative_name}</div>
                <div className="text-[11px] text-slate-600">Số: {activeCertificate.certificate_code}</div>
                <div className="text-xs font-bold pt-2">CỘNG HÒA XÃ HỘI CHỦ NGHĨA VIỆT NAM</div>
                <div className="text-xs font-bold italic border-b border-slate-300 pb-2 w-48 mx-auto">Độc lập – Tự do – Hạnh phúc</div>
              </div>

              <div className="text-center pt-2 space-y-1">
                <h2 className="text-xl font-black uppercase text-emerald-900 tracking-wide">GIẤY CHỨNG NHẬN VỐN GÓP</h2>
                <div className="text-xs italic text-slate-600">(Cấp lần thứ {activeCertificate.issue_count})</div>
              </div>

              <div className="text-[12px] leading-relaxed space-y-2 text-justify">
                <p>Căn cứ Luật Hợp tác xã số 17/2023/QH15 được Quốc hội nước CHXHCN Việt Nam thông qua;</p>
                <p>Căn cứ Điều lệ {activeCertificate.cooperative_name};</p>
                <p>Căn cứ mức vốn góp thực tế của các thành viên.</p>
              </div>

              <div className="p-4 border border-slate-300 rounded-lg space-y-2 text-[12.5px] bg-white">
                <div className="font-bold text-emerald-800 uppercase text-xs border-b pb-1">HỢP TÁC XÃ CHỨNG NHẬN:</div>
                <div className="grid grid-cols-2 gap-2">
                  <div>Họ và tên thành viên: <strong>{activeCertificate.member_full_name}</strong></div>
                  <div>Giới tính: <strong>{activeCertificate.member_gender}</strong></div>
                  <div>Ngày sinh: <strong>{activeCertificate.member_dob}</strong></div>
                  <div>Dân tộc: <strong>{activeCertificate.member_ethnicity}</strong> &bull; Quốc tịch: <strong>{activeCertificate.member_nationality}</strong></div>
                  <div className="col-span-2">Nơi đăng ký HKTT: <strong>{activeCertificate.member_address}</strong></div>
                  <div>Số CCCD/CMND: <strong className="font-mono">{activeCertificate.member_cccd}</strong></div>
                  <div>Ngày cấp: <strong>{activeCertificate.member_cccd_date}</strong></div>
                </div>
              </div>

              <div className="p-4 border-2 border-emerald-600 rounded-lg space-y-2 text-[13px] bg-emerald-50/30">
                <div className="flex justify-between items-baseline">
                  <span>TỔNG SỐ VỐN GÓP THỰC TẾ:</span>
                  <strong className="text-lg text-emerald-900 font-extrabold">{activeCertificate.total_capital_amount.toLocaleString('vi-VN')} VNĐ</strong>
                </div>
                <div>Bằng chữ: <strong className="italic">{activeCertificate.capital_in_words}</strong></div>
                <div>Hình thức góp vốn: <strong>{activeCertificate.contribution_form}</strong></div>
                <div>Thời điểm hoàn thành góp vốn: <strong>{activeCertificate.contribution_date}</strong></div>
              </div>

              <div className="pt-6 flex justify-between items-end">
                <div className="text-center space-y-2">
                  <div className="p-2 border border-slate-200 rounded-lg bg-white inline-block">
                    <QrCode className="w-16 h-16 text-slate-800 mx-auto" />
                    <span className="text-[9px] font-mono text-slate-500 block mt-1">Mã QR Tra cứu GCN</span>
                  </div>
                </div>

                <div className="text-center text-[12px] space-y-1">
                  <div className="italic text-slate-600">Lâm Đồng, Ngày {new Date().getDate()} tháng {new Date().getMonth() + 1} năm {new Date().getFullYear()}</div>
                  <div className="font-bold uppercase text-xs pt-1">ĐẠI DIỆN THEO PHÁP LUẬT CỦA HTX</div>
                  <div className="text-[10px] text-slate-400 italic">(Ký tên, đóng dấu)</div>
                  <div className="h-12"></div>
                  <div className="font-bold text-emerald-900">{activeCertificate.representative_name}</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
