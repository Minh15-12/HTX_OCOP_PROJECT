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
} from 'lucide-react';
import { mockMembersList, mockCapitalTransactions } from '@/services/memberService';
import { Member, CapitalTransaction } from '@/types/memberTypes';

export const CapitalPage: React.FC = () => {
  const [members, setMembers] = useState<Member[]>(mockMembersList);
  const [transactions, setTransactions] = useState<CapitalTransaction[]>(mockCapitalTransactions);

  const [search, setSearch] = useState('');
  const [capitalStatusFilter, setCapitalStatusFilter] = useState<string>('ALL');
  const [selectedCapitalMember, setSelectedCapitalMember] = useState<Member | null>(null);

  const [showRecordModal, setShowRecordModal] = useState(false);
  const [showPendingCapitalModal, setShowPendingCapitalModal] = useState(false);
  const [capitalDrawerTab, setCapitalDrawerTab] = useState<'history' | 'docs' | 'info'>('history');

  const [toast, setToast] = useState<{ message: string; type: 'success' | 'danger' } | null>(null);

  const triggerToast = (message: string, type: 'success' | 'danger' = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3500);
  };

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

    triggerToast(`Đã phê duyệt thành công giao dịch góp vốn ${tx.transaction_code} (${tx.amount.toLocaleString('vi-VN')} ₫) cho ${tx.member_name}!`, 'success');
  };

  const handleRejectCapitalTx = (txId: string) => {
    const tx = transactions.find((t) => t.id === txId);
    if (!tx) return;
    setTransactions((prev) => prev.filter((t) => t.id !== txId));
    triggerToast(`Đã từ chối giao dịch ${tx.transaction_code} của ${tx.member_name}.`, 'danger');
  };

  const [capitalForm, setCapitalForm] = useState({
    member_id: members[0]?.id || '',
    amount: 10000000,
    contribution_date: new Date().toISOString().split('T')[0],
    payment_method: 'CASH' as 'CASH' | 'BANK_TRANSFER',
    receipt_number: 'PT000126',
    content: 'Góp vốn đợt bổ sung',
    notes: '',
  });

  // Calculations
  const totalCommittedCapital = members.reduce((sum, m) => sum + (m.committed_capital || 0), 0);
  const totalContributedCapital = members.reduce((sum, m) => sum + (m.contributed_capital || 0), 0);
  const totalRemainingCapital = totalCommittedCapital - totalContributedCapital;
  const overallCapitalPct = Number(((totalContributedCapital / totalCommittedCapital) * 100).toFixed(2));
  const partialCapitalCount = members.filter((m) => m.capital_status === 'CHUA_DU').length;

  const handleSaveCapitalTransaction = (e: React.FormEvent) => {
    e.preventDefault();
    const mem = members.find((m) => m.id === capitalForm.member_id);
    if (!mem) return;

    const newTx: CapitalTransaction = {
      id: `CC-00${transactions.length + 1}`,
      member_id: mem.id,
      member_code: mem.member_code,
      member_name: mem.full_name,
      transaction_code: capitalForm.receipt_number,
      amount: capitalForm.amount,
      share_quantity: Math.floor(capitalForm.amount / 100000),
      contribution_date: capitalForm.contribution_date,
      payment_method: capitalForm.payment_method,
      receipt_number: capitalForm.receipt_number,
      content: capitalForm.content,
      notes: capitalForm.notes,
      status: 'APPROVED',
      recorded_by: 'Nguyễn Văn A (Kế toán)',
      recorded_date: new Date().toLocaleDateString('vi-VN'),
    };

    setTransactions([newTx, ...transactions]);
    setMembers(
      members.map((m) => {
        if (m.id === mem.id) {
          const newContributed = (m.contributed_capital || 0) + capitalForm.amount;
          const newRemaining = Math.max(0, (m.committed_capital || 0) - newContributed);
          return {
            ...m,
            contributed_capital: newContributed,
            remaining_capital: newRemaining,
            total_capital_contributed: newContributed,
            capital_status: newRemaining === 0 ? 'DU_VON' : 'CHUA_DU',
          };
        }
        return m;
      })
    );

    setShowRecordModal(false);
    triggerToast(`Đã ghi nhận góp vốn thành công cho xã viên ${mem.full_name}!`);
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
        <div className="fixed top-4 right-4 z-50 px-4 py-3 rounded-xl shadow-modal text-white text-xs font-extrabold flex items-center gap-2 bg-emerald-600 animate-bounce">
          <CheckCircle2 className="w-4 h-4" />
          {toast.message}
        </div>
      )}

      {/* Breadcrumb Header */}
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold text-slate-400">
            <span>Vốn góp</span>
            <ChevronRight className="w-3.5 h-3.5" />
            <span className="text-slate-800">Tổng quan</span>
          </div>
          <h1 className="text-xl font-extrabold text-slate-900 tracking-tight mt-1">Quản lý Vốn góp xã viên</h1>
          <p className="text-[12.8px] text-slate-500">
            Quản lý vốn cam kết, vốn đã góp và tiến độ hoàn thành nghĩa vụ góp vốn của xã viên HTX
          </p>
        </div>

        <div className="flex items-center gap-2">
          <div className="px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-xs font-bold text-slate-700 flex items-center gap-2 shadow-xs">
            <Calendar className="w-4 h-4 text-emerald-600" />
            <span>01/01/2025 - 31/12/2025</span>
          </div>

          <button
            onClick={() => setShowRecordModal(true)}
            className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-[12.8px] rounded-lg shadow-sm inline-flex items-center gap-1.5 transition-all"
          >
            <Plus className="w-4 h-4" /> Ghi nhận góp vốn
          </button>
          <button className="px-3.5 py-2 border border-slate-200 hover:bg-slate-50 text-slate-700 font-bold text-[12.8px] rounded-lg inline-flex items-center gap-1.5 bg-white shadow-xs">
            <FileSpreadsheet className="w-4 h-4 text-emerald-600" /> Xuất Excel
          </button>
        </div>
      </div>

      {/* TOP 6 KPI STATS CARDS MATCHING IMAGE 2 */}
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
          <div className="text-[11px] text-slate-500 font-semibold">{partialCapitalCount} xã viên chưa đủ</div>
        </div>

        <div className="bg-white border border-[#e7e9ec] p-3.5 rounded-xl shadow-subtle space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-400 uppercase">Số xã viên</span>
            <div className="w-7 h-7 rounded-lg bg-purple-100 text-purple-700 flex items-center justify-center">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <div className="text-lg font-black text-slate-900">125 người</div>
          <div className="text-[11px] text-slate-500 font-medium">
            Đã đủ: <strong className="text-emerald-700">102</strong> &bull; Chưa đủ: <strong className="text-amber-700">23</strong>
          </div>
        </div>

        <div className="bg-white border border-[#e7e9ec] p-3.5 rounded-xl shadow-subtle space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-400 uppercase">Giao dịch</span>
            <div className="w-7 h-7 rounded-lg bg-teal-100 text-teal-700 flex items-center justify-center">
              <Layers className="w-4 h-4" />
            </div>
          </div>
          <div className="text-lg font-black text-slate-900">386 giao dịch</div>
          <div className="text-[11px] text-slate-500 font-semibold">Tháng này: +28</div>
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
                  <th className="py-2.5 px-3">Ngày tham gia</th>
                  <th className="py-2.5 px-3 text-right">Vốn cam kết (đ)</th>
                  <th className="py-2.5 px-3 text-right">Đã góp (đ)</th>
                  <th className="py-2.5 px-3 text-right">Còn thiếu (đ)</th>
                  <th className="py-2.5 px-3 text-right">Tỷ lệ (%)</th>
                  <th className="py-2.5 px-3">Trạng thái</th>
                  <th className="py-2.5 px-3 text-center">Thao tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredMembers.map((m, idx) => (
                  <tr
                    key={m.id}
                    onClick={() => setSelectedCapitalMember(m)}
                    className={`cursor-pointer hover:bg-slate-50 transition-colors ${
                      selectedCapitalMember?.id === m.id ? 'bg-emerald-50/60 font-semibold' : ''
                    }`}
                  >
                    <td className="py-3 px-3 text-slate-500 font-medium">{idx + 1}</td>
                    <td className="py-3 px-3 font-mono font-bold text-slate-600">{m.member_code}</td>
                    <td className="py-3 px-3 font-bold text-slate-900">{m.full_name}</td>
                    <td className="py-3 px-3 text-slate-600">{m.join_date}</td>
                    <td className="py-3 px-3 text-right font-bold text-slate-900">
                      {m.committed_capital?.toLocaleString('vi-VN')} ₫
                    </td>
                    <td className="py-3 px-3 text-right font-extrabold text-emerald-700">
                      {m.contributed_capital?.toLocaleString('vi-VN')} ₫
                    </td>
                    <td className="py-3 px-3 text-right font-bold text-amber-800">
                      {m.remaining_capital?.toLocaleString('vi-VN')} ₫
                    </td>
                    <td className="py-3 px-3 text-right font-bold text-slate-800">
                      {Math.round(((m.contributed_capital || 0) / (m.committed_capital || 1)) * 100)}%
                    </td>
                    <td className="py-3 px-3">
                      {m.capital_status === 'DU_VON' ? (
                        <span className="pill-badge pill-green">Đủ vốn</span>
                      ) : (
                        <span className="pill-badge pill-amber">Chưa đủ</span>
                      )}
                    </td>
                    <td className="py-3 px-3 text-center">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedCapitalMember(m);
                        }}
                        className="p-1.5 text-slate-400 hover:text-emerald-700 hover:bg-emerald-50 rounded-lg"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr className="bg-slate-100/80 font-extrabold text-slate-900 border-t-2 border-slate-200 text-[12.8px]">
                  <td colSpan={4} className="py-3 px-3 text-slate-900">Tổng cộng</td>
                  <td className="py-3 px-3 text-right">{totalCommittedCapital.toLocaleString('vi-VN')} ₫</td>
                  <td className="py-3 px-3 text-right text-emerald-700">{totalContributedCapital.toLocaleString('vi-VN')} ₫</td>
                  <td className="py-3 px-3 text-right text-amber-800">{totalRemainingCapital.toLocaleString('vi-VN')} ₫</td>
                  <td className="py-3 px-3 text-right">{overallCapitalPct}%</td>
                  <td colSpan={2}></td>
                </tr>
              </tfoot>
            </table>
          </div>
        </div>

        {selectedCapitalMember && (
          <div className="bg-white border border-[#e7e9ec] rounded-xl shadow-subtle p-4 space-y-4 animate-fade-in">
            <div className="flex items-start justify-between border-b border-[#e7e9ec] pb-3">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-800 font-bold flex items-center justify-center text-base border border-emerald-200 shrink-0">
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
                <span className="text-[11.5px] font-bold text-slate-500">Tổng vốn:</span>
                <span className="text-lg font-black text-emerald-800">
                  {selectedCapitalMember.contributed_capital?.toLocaleString('vi-VN')} ₫
                </span>
              </div>
              <div className="w-full bg-slate-200 rounded-full h-2 overflow-hidden">
                <div className="bg-emerald-600 h-2 rounded-full" style={{ width: '100%' }}></div>
              </div>
              <div className="grid grid-cols-2 gap-2 pt-2 text-[11.8px] border-t border-emerald-200/60">
                <div><span className="text-slate-500">Vốn cam kết:</span> <strong className="text-slate-900">{selectedCapitalMember.committed_capital?.toLocaleString('vi-VN')} ₫</strong></div>
                <div><span className="text-slate-500">Lần góp gần nhất:</span> <strong className="text-slate-900">15/05/2025</strong></div>
                <div><span className="text-slate-500">Đã góp:</span> <strong className="text-emerald-700">{selectedCapitalMember.contributed_capital?.toLocaleString('vi-VN')} ₫</strong></div>
                <div><span className="text-slate-500">Tổng số lần góp:</span> <strong className="text-slate-900">3 lần</strong></div>
              </div>
            </div>

            <div className="border-b border-[#e7e9ec] flex gap-4 text-[12px] font-bold">
              <button onClick={() => setCapitalDrawerTab('history')} className={`pb-2 border-b-2 ${capitalDrawerTab === 'history' ? 'border-emerald-600 text-emerald-800' : 'border-transparent text-slate-400'}`}>Lịch sử góp vốn</button>
              <button onClick={() => setCapitalDrawerTab('docs')} className={`pb-2 border-b-2 ${capitalDrawerTab === 'docs' ? 'border-emerald-600 text-emerald-800' : 'border-transparent text-slate-400'}`}>Chứng từ</button>
              <button onClick={() => setCapitalDrawerTab('info')} className={`pb-2 border-b-2 ${capitalDrawerTab === 'info' ? 'border-emerald-600 text-emerald-800' : 'border-transparent text-slate-400'}`}>Thông tin</button>
            </div>

            {capitalDrawerTab === 'history' && (
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-[12px] font-bold text-slate-700">Lịch sử giao dịch</span>
                  <button onClick={() => setShowRecordModal(true)} className="px-2.5 py-1 bg-emerald-600 text-white font-bold text-[11.5px] rounded-lg inline-flex items-center gap-1">
                    <Plus className="w-3.5 h-3.5" /> Ghi nhận góp vốn
                  </button>
                </div>
                <div className="overflow-x-auto border border-slate-200 rounded-lg">
                  <table className="w-full text-left text-[11.8px]">
                    <thead className="bg-slate-50 text-[10.5px] uppercase font-bold text-slate-400">
                      <tr>
                        <th className="py-2 px-2.5">Ngày</th>
                        <th className="py-2 px-2.5">Số tiền</th>
                        <th className="py-2 px-2.5">Hình thức</th>
                        <th className="py-2 px-2.5">Chứng từ</th>
                        <th className="py-2 px-2.5">Trạng thái</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {transactions.map((tx) => (
                        <tr key={tx.id}>
                          <td className="py-2 px-2.5 text-slate-600">{tx.contribution_date}</td>
                          <td className="py-2 px-2.5 font-bold text-emerald-700">+{tx.amount.toLocaleString('vi-VN')} ₫</td>
                          <td className="py-2 px-2.5 text-slate-600">{tx.payment_method === 'CASH' ? 'Tiền mặt' : 'Chuyển khoản'}</td>
                          <td className="py-2 px-2.5 font-mono text-emerald-700 font-semibold">{tx.receipt_number}</td>
                          <td className="py-2 px-2.5"><span className="pill-badge pill-green text-[10px]">Đã duyệt</span></td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
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
            <h3 className="font-extrabold text-slate-900 text-sm">Biểu đồ vốn góp theo thời gian</h3>
            <div className="flex items-center gap-3 text-[11px] font-bold">
              <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-full bg-emerald-600"></span> Vốn cam kết</span>
              <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-full bg-blue-500"></span> Vốn đã góp</span>
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
          <h3 className="font-extrabold text-slate-900 text-sm">Cơ cấu vốn góp</h3>
          <div className="flex items-center justify-center py-2 relative">
            <div className="w-32 h-32 rounded-full border-[14px] border-emerald-600 border-t-amber-500 flex flex-col items-center justify-center text-center">
              <span className="text-[12px] font-extrabold text-slate-900">2.450.000.000 ₫</span>
              <span className="text-[9.5px] text-slate-400 uppercase font-bold">Tổng vốn góp</span>
            </div>
          </div>
          <div className="space-y-1.5 text-[12px] pt-2">
            <div className="flex justify-between items-center">
              <span className="flex items-center gap-2 text-slate-600"><span className="w-3 h-3 rounded-full bg-emerald-600"></span> Đã góp</span>
              <strong className="text-slate-900">2.180.000.000 ₫ (88,98%)</strong>
            </div>
            <div className="flex justify-between items-center">
              <span className="flex items-center gap-2 text-slate-600"><span className="w-3 h-3 rounded-full bg-amber-500"></span> Còn phải góp</span>
              <strong className="text-amber-800">270.000.000 ₫ (11,02%)</strong>
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
              { rank: 1, name: 'Nguyễn Văn A', amount: 120000000 },
              { rank: 2, name: 'Trần Thị B', amount: 100000000 },
              { rank: 3, name: 'Lê Văn C', amount: 80000000 },
              { rank: 4, name: 'Phạm Thị D', amount: 75000000 },
              { rank: 5, name: 'Hoàng Văn E', amount: 60000000 },
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

      {/* RECORD CAPITAL MODAL */}
      {showRecordModal && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fade-in">
          <div className="bg-white rounded-2xl max-w-xl w-full shadow-modal overflow-hidden">
            <div className="p-4 border-b border-slate-200 flex justify-between items-center bg-slate-50">
              <h3 className="font-extrabold text-slate-900 text-base">Ghi nhận góp vốn</h3>
              <button onClick={() => setShowRecordModal(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveCapitalTransaction} className="p-5 space-y-4 text-[12.8px]">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Xã viên *</label>
                  <select
                    value={capitalForm.member_id}
                    onChange={(e) => setCapitalForm({ ...capitalForm, member_id: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg font-bold text-slate-800"
                  >
                    {members.map((m) => (
                      <option key={m.id} value={m.id}>
                        {m.full_name} ({m.member_code})
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Số tiền góp *</label>
                  <input
                    type="number"
                    step={1000000}
                    required
                    value={capitalForm.amount}
                    onChange={(e) => setCapitalForm({ ...capitalForm, amount: Number(e.target.value) })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg font-bold text-emerald-800"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Số chứng từ</label>
                  <input
                    type="text"
                    value={capitalForm.receipt_number}
                    onChange={(e) => setCapitalForm({ ...capitalForm, receipt_number: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg font-mono font-bold"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Nội dung</label>
                  <input
                    type="text"
                    value={capitalForm.content}
                    onChange={(e) => setCapitalForm({ ...capitalForm, content: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">File chứng từ</label>
                <div className="border-2 border-dashed border-slate-200 hover:border-emerald-500 rounded-xl p-4 text-center bg-slate-50/50 cursor-pointer">
                  <Upload className="w-6 h-6 text-slate-400 mx-auto mb-1" />
                  <div className="text-slate-600 font-medium text-[12px]">Kéo thả file hoặc chọn file</div>
                  <div className="text-slate-400 text-[10.5px]">PDF, JPG, PNG (Tối đa 10MB)</div>
                </div>
              </div>

              <div className="pt-2 flex justify-end gap-2 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setShowRecordModal(false)}
                  className="px-4 py-2 border border-slate-200 rounded-lg text-slate-600 font-bold hover:bg-slate-50"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-lg shadow-sm"
                >
                  Lưu
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* PENDING CAPITAL TRANSACTIONS APPROVAL MODAL */}
      {showPendingCapitalModal && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fade-in overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-3xl w-full shadow-modal overflow-hidden my-6">
            <div className="p-4 border-b border-slate-200 flex justify-between items-center bg-slate-50">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center font-bold border border-amber-200">
                  <AlertCircle className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-extrabold text-slate-900 text-base">
                    Giao dịch Góp vốn chờ Phê duyệt ({transactions.filter((t) => t.status === 'PENDING').length})
                  </h3>
                  <p className="text-[11.5px] text-slate-500">
                    Danh sách chứng từ nộp vốn mới của xã viên chờ Kế toán/HĐQT đối soát và phê duyệt nhập quỹ
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowPendingCapitalModal(false)}
                className="text-slate-400 hover:text-slate-600 p-1.5 hover:bg-slate-100 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-5 space-y-4 max-h-[calc(100vh-220px)] overflow-y-auto">
              {transactions.filter((t) => t.status === 'PENDING').length === 0 ? (
                <div className="text-center py-10 space-y-2">
                  <CheckCircle2 className="w-12 h-12 text-emerald-500 mx-auto" />
                  <p className="font-extrabold text-slate-800 text-sm">Tất cả giao dịch góp vốn đã được phê duyệt thành công!</p>
                  <p className="text-[12px] text-slate-400">Không còn chứng từ góp vốn nào ở trạng thái chờ duyệt.</p>
                </div>
              ) : (
                <div className="overflow-x-auto border border-slate-200 rounded-xl">
                  <table className="w-full text-left border-collapse text-[12.5px]">
                    <thead>
                      <tr className="border-b border-slate-200 bg-slate-50 text-[11px] uppercase tracking-wider text-slate-500 font-extrabold">
                        <th className="py-2.5 px-3">Mã CT</th>
                        <th className="py-2.5 px-3">Xã viên</th>
                        <th className="py-2.5 px-3 text-right">Số tiền góp</th>
                        <th className="py-2.5 px-3">Hình thức</th>
                        <th className="py-2.5 px-3">Ngày nộp</th>
                        <th className="py-2.5 px-3">Chứng từ</th>
                        <th className="py-2.5 px-3 text-center">Thao tác</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {transactions
                        .filter((t) => t.status === 'PENDING')
                        .map((tx) => (
                          <tr key={tx.id} className="hover:bg-slate-50/80 transition-colors">
                            <td className="py-3 px-3 font-mono font-bold text-slate-700">{tx.transaction_code}</td>
                            <td className="py-3 px-3">
                              <strong className="text-slate-900 block">{tx.member_name}</strong>
                              <span className="text-[11px] font-mono text-slate-400">{tx.member_code}</span>
                            </td>
                            <td className="py-3 px-3 text-right font-black text-emerald-700">
                              {tx.amount.toLocaleString('vi-VN')} ₫
                            </td>
                            <td className="py-3 px-3">
                              {tx.payment_method === 'CASH' ? (
                                <span className="pill-badge pill-green text-[10px]">Tiền mặt</span>
                              ) : (
                                <span className="pill-badge pill-blue text-[10px]">Chuyển khoản</span>
                              )}
                            </td>
                            <td className="py-3 px-3 text-slate-600 font-mono text-[11.8px]">{tx.contribution_date}</td>
                            <td className="py-3 px-3">
                              {tx.receipt_file_name ? (
                                <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-slate-100 text-slate-700 font-mono text-[11px] rounded border border-slate-200">
                                  <FileText className="w-3 h-3 text-emerald-600" /> {tx.receipt_file_name}
                                </span>
                              ) : (
                                <span className="text-slate-400 text-[11px]">Không có file</span>
                              )}
                            </td>
                            <td className="py-3 px-3 text-center">
                              <div className="inline-flex items-center justify-center gap-1.5">
                                <button
                                  onClick={() => handleApproveCapitalTx(tx.id)}
                                  className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold rounded-md text-[11.5px] inline-flex items-center gap-1 shadow-xs transition-all"
                                  title="Phê duyệt giao dịch nộp vốn này"
                                >
                                  <CheckCircle2 className="w-3.5 h-3.5" /> Duyệt
                                </button>
                                <button
                                  onClick={() => handleRejectCapitalTx(tx.id)}
                                  className="px-2.5 py-1 bg-rose-50 hover:bg-rose-100 text-rose-700 font-extrabold rounded-md text-[11.5px] border border-rose-200 transition-colors"
                                  title="Hủy/Từ chối giao dịch"
                                >
                                  Từ chối
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            <div className="p-4 border-t border-slate-200 bg-slate-50 flex justify-end">
              <button
                onClick={() => setShowPendingCapitalModal(false)}
                className="px-5 py-2 border border-slate-300 rounded-lg text-slate-700 font-bold hover:bg-white text-[12.8px]"
              >
                Đóng cửa sổ
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
