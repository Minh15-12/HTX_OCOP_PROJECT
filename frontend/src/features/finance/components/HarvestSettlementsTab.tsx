import React, { useState, useMemo } from 'react';
import { Search, Download, Wheat, Plus, CheckCircle2, Printer, Check, Clock } from 'lucide-react';
import { HarvestSettlementRecord } from '@/services/financeApi';
import { Pagination } from '@/components/ui/Pagination';
import { SettlementVoucherModal } from './SettlementVoucherModal';
import { useToast } from '@/components/ui/ToastNotification';

const money = (n: number) => (n || 0).toLocaleString('vi-VN') + ' ₫';

interface HarvestSettlementsTabProps {
  settlements: HarvestSettlementRecord[];
  onOpenModal: () => void;
  onApproveSettlement?: (id: string) => void;
}

export const HarvestSettlementsTab: React.FC<HarvestSettlementsTabProps> = ({
  settlements,
  onOpenModal,
  onApproveSettlement,
}) => {
  const { showToast } = useToast();
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedVoucher, setSelectedVoucher] = useState<HarvestSettlementRecord | null>(null);
  const pageSize = 10;

  const filtered = useMemo(() => {
    return settlements.filter((s) => {
      const q = search.toLowerCase().trim();
      const matchQuery =
        !q ||
        s.id.toLowerCase().includes(q) ||
        (s.voucher_number && s.voucher_number.toLowerCase().includes(q)) ||
        (s.debt_code && s.debt_code.toLowerCase().includes(q)) ||
        (s.member_name && s.member_name.toLowerCase().includes(q));

      const matchStatus =
        statusFilter === 'ALL' ||
        (statusFilter === 'POSTED' && (s.status === 'POSTED' || s.status === 'Đã ghi sổ' || !s.status)) ||
        s.status === statusFilter;

      return matchQuery && matchStatus;
    });
  }, [settlements, search, statusFilter]);

  const totalPages = Math.ceil(filtered.length / pageSize) || 1;
  const pagedSettlements = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filtered.slice(start, start + pageSize);
  }, [filtered, currentPage, pageSize]);

  const handleApprove = (s: HarvestSettlementRecord) => {
    if (onApproveSettlement) {
      onApproveSettlement(s.id);
    } else {
      showToast(`Đã duyệt quyết toán cho xã viên ${s.member_name} thành công!`, 'success');
    }
  };

  const exportCSV = () => {
    const headers = [
      'Mã quyết toán',
      'Số phiếu',
      'Mã nợ cấn trừ',
      'Xã viên',
      'Hình thức thanh toán',
      'Số tiền quyết toán',
      'Ngày quyết toán',
      'Trạng thái',
      'Ghi chú',
    ];
    const rows = filtered.map((s) => [
      s.id,
      s.voucher_number || '',
      s.debt_code || '',
      `"${(s.member_name || '').replace(/"/g, '""')}"`,
      s.payment_method || '',
      s.amount,
      s.settlement_date,
      s.status,
      `"${(s.note || '').replace(/"/g, '""')}"`,
    ]);

    const csvContent = '\uFEFF' + [headers.join(','), ...rows.map((r) => r.join(','))].join('\r\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `Bang_ke_quyet_toan_mua_vu_${new Date().toISOString().slice(0, 10)}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="bg-white border border-slate-200 rounded-b-2xl shadow-xs overflow-hidden space-y-0 text-xs">
      {/* Controls Bar */}
      <div className="p-3.5 border-b border-slate-200 bg-slate-50/70 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2 flex-1 min-w-[280px]">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setCurrentPage(1);
              }}
              placeholder="Tìm theo mã quyết toán, mùa vụ, tên xã viên..."
              className="w-full pl-9 pr-3 py-1.5 bg-white border border-slate-300 rounded-xl text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          <select
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value);
              setCurrentPage(1);
            }}
            className="px-2.5 py-1.5 bg-white border border-slate-300 rounded-xl text-xs text-slate-700 font-bold focus:outline-none focus:ring-2 focus:ring-emerald-500 cursor-pointer"
          >
            <option value="ALL">Tất cả trạng thái</option>
            <option value="POSTED">Đã ghi sổ quỹ</option>
            <option value="APPROVED">Đã phê duyệt</option>
            <option value="DRAFT">Dự thảo</option>
          </select>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={exportCSV}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white hover:bg-slate-100 border border-slate-300 rounded-xl text-slate-700 font-bold text-xs transition-colors cursor-pointer"
          >
            <Download className="w-3.5 h-3.5" />
            Xuất CSV
          </button>

          <button
            type="button"
            onClick={onOpenModal}
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs rounded-xl shadow-xs transition-all active:scale-98 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            Chốt quyết toán mùa vụ
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs border-collapse">
          <thead>
            <tr className="bg-slate-50 text-slate-700 font-bold border-b border-slate-200 uppercase text-[11px] tracking-wider">
              <th className="py-3 px-4">Mã quyết toán</th>
              <th className="py-3 px-4">Số chứng từ / Phiếu</th>
              <th className="py-3 px-4">Mã nợ cấn trừ</th>
              <th className="py-3 px-4">Xã viên thụ hưởng</th>
              <th className="py-3 px-4">Hình thức chi trả</th>
              <th className="py-3 px-4 text-right">Số tiền quyết toán</th>
              <th className="py-3 px-4">Ngày quyết toán</th>
              <th className="py-3 px-4 text-center">Trạng thái</th>
              <th className="py-3 px-4 text-center">Hành động</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
            {pagedSettlements.length === 0 ? (
              <tr>
                <td colSpan={9} className="py-12 text-center text-slate-400">
                  <div className="flex flex-col items-center justify-center gap-2">
                    <Wheat className="w-8 h-8 text-slate-300" />
                    <p className="font-bold text-slate-600">Chưa có bảng kê quyết toán mùa vụ</p>
                    <p className="text-[11.5px] text-slate-400">
                      Bấm "Chốt quyết toán mùa vụ" để cấn trừ nợ tự động và lập phiếu chi thanh toán cho xã viên.
                    </p>
                  </div>
                </td>
              </tr>
            ) : (
              pagedSettlements.map((s) => (
                <tr key={s.id} className="hover:bg-slate-50/80 transition-colors">
                  <td className="py-3 px-4 font-mono font-bold text-slate-800">{s.id}</td>
                  <td className="py-3 px-4 font-mono font-semibold text-blue-700">
                    {s.voucher_number || '—'}
                  </td>
                  <td className="py-3 px-4 font-mono font-bold text-amber-700">
                    {s.debt_code || '—'}
                  </td>
                  <td className="py-3 px-4 font-medium text-slate-800">👤 {s.member_name}</td>
                  <td className="py-3 px-4">
                    <span className="pill-badge pill-blue text-[11px]">
                      {s.payment_method === 'HARVEST_OFFSET' ? 'Cấn trừ nợ thu hoạch' : s.payment_method}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-right font-mono font-black text-emerald-700 text-xs">
                    {money(s.amount)}
                  </td>
                  <td className="py-3 px-4 font-mono text-slate-600">{s.settlement_date}</td>
                  <td className="py-3 px-4 text-center">
                    {s.status === 'DRAFT' ? (
                      <span className="inline-flex items-center gap-1 text-slate-600 font-bold text-[11px] bg-slate-100 px-2 py-0.5 rounded-lg border border-slate-200">
                        <Clock className="w-3.5 h-3.5 text-slate-500" /> Bản nháp
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-emerald-700 font-bold text-[11px] bg-emerald-50 px-2 py-0.5 rounded-lg border border-emerald-200">
                        <CheckCircle2 className="w-3.5 h-3.5" /> {s.status || 'Đã ghi sổ'}
                      </span>
                    )}
                  </td>
                  <td className="py-3 px-4 text-center">
                    <div className="flex items-center justify-center gap-1.5">
                      {s.status === 'DRAFT' && (
                        <button
                          type="button"
                          onClick={() => handleApprove(s)}
                          title="Phê duyệt quyết toán"
                          className="p-1.5 text-emerald-700 hover:bg-emerald-50 rounded-lg border border-emerald-200 cursor-pointer transition-colors"
                        >
                          <Check className="w-3.5 h-3.5 stroke-[2.5]" />
                        </button>
                      )}
                      <button
                        type="button"
                        onClick={() => setSelectedVoucher(s)}
                        title="In phiếu chi quyết toán"
                        className="inline-flex items-center gap-1 px-2 py-1 text-slate-700 hover:bg-slate-100 rounded-lg border border-slate-300 font-semibold cursor-pointer transition-colors text-[11px]"
                      >
                        <Printer className="w-3.5 h-3.5 text-slate-500" />
                        In phiếu
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination Footer */}
      {filtered.length > pageSize && (
        <div className="p-3 border-t border-slate-200 bg-slate-50 flex items-center justify-between">
          <div className="text-xs text-slate-500 font-medium">
            Hiển thị <strong>{(currentPage - 1) * pageSize + 1}</strong>–
            <strong>{Math.min(currentPage * pageSize, filtered.length)}</strong> trên tổng số{' '}
            <strong>{filtered.length}</strong> bảng kê
          </div>
          <Pagination
            currentPage={currentPage}
            totalItems={filtered.length}
            pageSize={pageSize}
            onPageChange={setCurrentPage}
          />
        </div>
      )}

      {/* Printable Voucher Modal */}
      <SettlementVoucherModal
        isOpen={!!selectedVoucher}
        onClose={() => setSelectedVoucher(null)}
        settlement={selectedVoucher}
      />
    </div>
  );
};
