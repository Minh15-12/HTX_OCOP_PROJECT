import React, { useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Search, Download, DollarSign, Receipt, CheckCircle2, Clock, Loader2, Wheat } from 'lucide-react';
import { ReceivablePayable, financeApi } from '@/services/financeApi';
import { fetchCropSeasons } from '@/services/cropSeasonApi';
import { reportApi } from '@/services/reportApi';
import { Pagination } from '@/components/ui/Pagination';
import { DebtDrawer } from './drawer/DebtDrawer';
import { DebtAgingSummaryCard } from './DebtAgingSummaryCard';

const money = (n: number) => (n || 0).toLocaleString('vi-VN') + ' ₫';

interface DebtsTabProps {
  debtsList: ReceivablePayable[];
  onSettleDebt: (debt: ReceivablePayable) => void;
}

export const DebtsTab: React.FC<DebtsTabProps> = ({ debtsList, onSettleDebt }) => {
  const [search, setSearch] = useState('');
  const [selectedDebt, setSelectedDebt] = useState<ReceivablePayable | null>(null);
  const [typeFilter, setTypeFilter] = useState<'ALL' | 'RECEIVABLE' | 'PAYABLE'>('ALL');
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'PENDING' | 'PARTIAL' | 'SETTLED'>('ALL');
  const [seasonFilter, setSeasonFilter] = useState<string>('ALL');
  const [currentPage, setCurrentPage] = useState(1);
  const [isExporting, setIsExporting] = useState(false);
  const pageSize = 10;

  const { data: seasons = [] } = useQuery({
    queryKey: ['cropSeasons'],
    queryFn: () => fetchCropSeasons().catch(() => []),
  });

  const filtered = useMemo(() => {
    return debtsList.filter((d) => {
      const q = search.toLowerCase().trim();
      const matchText =
        !q ||
        d.debtorName.toLowerCase().includes(q) ||
        d.id.toLowerCase().includes(q) ||
        (d.description && d.description.toLowerCase().includes(q)) ||
        ((d as any).crop_season_name && (d as any).crop_season_name.toLowerCase().includes(q));

      const matchType = typeFilter === 'ALL' || d.debtType === typeFilter;
      const matchStatus = statusFilter === 'ALL' || d.status === statusFilter;
      const matchSeason = seasonFilter === 'ALL' || (d as any).crop_season_id === seasonFilter;
      return matchText && matchType && matchStatus && matchSeason;
    });
  }, [debtsList, search, typeFilter, statusFilter, seasonFilter]);

  const totalPages = Math.ceil(filtered.length / pageSize) || 1;
  const pagedDebts = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filtered.slice(start, start + pageSize);
  }, [filtered, currentPage, pageSize]);

  const handleExportExcel = async () => {
    try {
      setIsExporting(true);
      await reportApi.exportReceivablesPayablesExcel();
    } catch (err: any) {
      console.warn('Lỗi xuất Excel từ server, chuyển sang xuất CSV dự phòng:', err);
      exportCSV();
    } finally {
      setIsExporting(false);
    }
  };

  const exportCSV = () => {
    const headers = ['Mã nợ', 'Phân loại', 'Đối tượng', 'Gốc ban đầu', 'Đã thanh toán', 'Dư nợ còn lại', 'Hạn thanh toán', 'Trạng thái', 'Ghi chú'];
    const rows = filtered.map((d) => [
      d.id,
      d.debtType === 'RECEIVABLE' ? 'Phải thu' : 'Phải trả',
      `"${d.debtorName.replace(/"/g, '""')}"`,
      d.totalAmount,
      Math.max(0, d.totalAmount - d.remainingAmount),
      d.remainingAmount,
      d.dueDate || '',
      d.status,
      `"${(d.description || '').replace(/"/g, '""')}"`,
    ]);

    const csvContent = '\uFEFF' + [headers.join(','), ...rows.map((r) => r.join(','))].join('\r\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `So_theo_doi_cong_no_${new Date().toISOString().slice(0, 10)}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const quickScopeCounts = useMemo(() => {
    let receivableCount = 0;
    let payableCount = 0;
    let pendingCount = 0;
    debtsList.forEach((d) => {
      if (d.debtType === 'RECEIVABLE') receivableCount++;
      if (d.debtType === 'PAYABLE') payableCount++;
      if (d.status !== 'SETTLED') pendingCount++;
    });
    return {
      all: debtsList.length,
      receivable: receivableCount,
      payable: payableCount,
      pending: pendingCount,
    };
  }, [debtsList]);

  const { data: agingSummary = null, isLoading: loadingAging } = useQuery({
    queryKey: ['debtAgingSummary'],
    queryFn: () => financeApi.getDebtAgingSummary(),
  });

  return (
    <div className="space-y-4">
      {/* 5-Bucket Aging Debt Summary Card */}
      <DebtAgingSummaryCard summary={agingSummary} isLoading={loadingAging} />

      <div className="bg-white border border-slate-200 rounded-2xl shadow-xs overflow-hidden space-y-0">
        {/* Scope Pill Filter Bar */}
        <div className="px-4 py-2.5 bg-slate-50/90 border-b border-slate-200 flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-1.5 bg-slate-200/60 p-1 rounded-xl">
            <button
              type="button"
              onClick={() => {
                setTypeFilter('ALL');
                setStatusFilter('ALL');
                setCurrentPage(1);
              }}
              className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                typeFilter === 'ALL' && statusFilter === 'ALL'
                  ? 'bg-white text-slate-900 shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Tất cả ({quickScopeCounts.all})
            </button>
            <button
              type="button"
              onClick={() => {
                setTypeFilter('RECEIVABLE');
                setStatusFilter('ALL');
                setCurrentPage(1);
              }}
              className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                typeFilter === 'RECEIVABLE' && statusFilter === 'ALL'
                  ? 'bg-white text-amber-900 shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Phải thu xã viên ({quickScopeCounts.receivable})
            </button>
            <button
              type="button"
              onClick={() => {
                setTypeFilter('PAYABLE');
                setStatusFilter('ALL');
                setCurrentPage(1);
              }}
              className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                typeFilter === 'PAYABLE' && statusFilter === 'ALL'
                  ? 'bg-white text-blue-900 shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Phải trả đối tác ({quickScopeCounts.payable})
            </button>
            <button
              type="button"
              onClick={() => {
                setStatusFilter('PENDING');
                setCurrentPage(1);
              }}
              className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                statusFilter === 'PENDING'
                  ? 'bg-white text-rose-800 shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Còn nợ cần thu ({quickScopeCounts.pending})
            </button>
          </div>

          <button
            type="button"
            onClick={handleExportExcel}
            disabled={isExporting}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-50 hover:bg-emerald-100 border border-emerald-300 text-emerald-800 rounded-xl font-bold text-xs transition-colors cursor-pointer disabled:opacity-50"
            title="Xuất file Excel Sổ theo dõi công nợ chi tiết theo chuẩn kế toán"
          >
            {isExporting ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
            ) : (
              <Download className="w-3.5 h-3.5" />
            )}
            <span>{isExporting ? 'Đang xuất...' : 'Xuất Sổ Công Nợ (Excel)'}</span>
          </button>
        </div>

        {/* Search Controls Bar */}
        <div className="p-3.5 border-b border-slate-200 bg-white flex flex-wrap items-center justify-between gap-3">
          <div className="relative flex-1 min-w-[240px]">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setCurrentPage(1);
              }}
              placeholder="Tìm theo tên đối tượng, mã công nợ..."
              className="w-full pl-9 pr-3 py-1.5 bg-white border border-slate-300 rounded-xl text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          <div className="flex items-center gap-2">
            <select
              value={seasonFilter}
              onChange={(e) => {
                setSeasonFilter(e.target.value);
                setCurrentPage(1);
              }}
              className="bg-white border border-slate-300 rounded-xl px-3 py-1.5 text-xs font-semibold text-slate-700 focus:outline-none"
            >
              <option value="ALL">Vụ mùa: Tất cả</option>
              {seasons.map((s: any) => (
                <option key={s.id} value={s.id}>
                  {s.season_name || s.name}
                </option>
              ))}
            </select>

            <select
              value={typeFilter}
              onChange={(e) => {
                setTypeFilter(e.target.value as any);
                setCurrentPage(1);
              }}
              className="bg-white border border-slate-300 rounded-xl px-3 py-1.5 text-xs font-semibold text-slate-700 focus:outline-none"
            >
              <option value="ALL">Loại: Tất cả</option>
              <option value="RECEIVABLE">Phải thu (Tạm ứng)</option>
              <option value="PAYABLE">Phải trả (Tiền hàng NCC)</option>
            </select>

            <select
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value as any);
                setCurrentPage(1);
              }}
              className="bg-white border border-slate-300 rounded-xl px-3 py-1.5 text-xs font-semibold text-slate-700 focus:outline-none"
            >
              <option value="ALL">Trạng thái: Tất cả</option>
              <option value="PENDING">Chưa thanh toán</option>
              <option value="PARTIAL">Thanh toán một phần</option>
              <option value="SETTLED">Đã thanh toán đủ</option>
            </select>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-50 text-slate-700 font-bold border-b border-slate-200 uppercase text-[11px] tracking-wider">
                <th className="py-3 px-4">Mã hồ sơ nợ</th>
                <th className="py-3 px-4">Phân loại nợ</th>
                <th className="py-3 px-4">Đối tượng thụ hưởng / Xã viên</th>
                <th className="py-3 px-4 text-right">Gốc ban đầu</th>
                <th className="py-3 px-4 text-right">Đã thanh toán</th>
                <th className="py-3 px-4 text-right">Dư nợ còn lại</th>
                <th className="py-3 px-4">Hạn chót</th>
                <th className="py-3 px-4">Trạng thái</th>
                <th className="py-3 px-4 text-center">Xử lý thu hồi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
              {pagedDebts.length === 0 ? (
                <tr>
                  <td colSpan={9} className="py-12 text-center text-slate-400">
                    <div className="flex flex-col items-center justify-center gap-2">
                      <Receipt className="w-8 h-8 text-slate-300" />
                      {search || typeFilter !== 'ALL' || statusFilter !== 'ALL' ? (
                        <>
                          <p className="font-bold text-slate-700">Không tìm thấy khoản công nợ phù hợp</p>
                          <p className="text-[11.5px] text-slate-400 max-w-sm">
                            Không có hồ sơ công nợ nào khớp với từ khóa "{search}" hoặc các bộ lọc đã chọn.
                          </p>
                          <button
                            type="button"
                            onClick={() => {
                              setSearch('');
                              setTypeFilter('ALL');
                              setStatusFilter('ALL');
                              setCurrentPage(1);
                            }}
                            className="mt-2 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl cursor-pointer transition-colors"
                          >
                            Đặt lại bộ lọc tìm kiếm
                          </button>
                        </>
                      ) : (
                        <>
                          <p className="font-bold text-slate-600">Không tìm thấy khoản công nợ nào</p>
                          <p className="text-[11.5px] text-slate-400">
                            Công nợ tạm ứng vật tư hoặc công nợ bán buôn sẽ tự động cập nhật tại đây.
                          </p>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              ) : (
              pagedDebts.map((item) => {
                const isReceivable = item.debtType === 'RECEIVABLE';
                const isPaid = item.status === 'SETTLED';
                const paidAmount = Math.max(0, item.totalAmount - item.remainingAmount);
                const isSelected = selectedDebt?.id === item.id;
                return (
                  <tr
                    key={item.id}
                    onClick={() => setSelectedDebt(item)}
                    className={`cursor-pointer transition-colors ${
                      isSelected ? 'bg-emerald-50/80 font-medium' : 'hover:bg-slate-50/80'
                    }`}
                  >
                    <td className="py-3 px-4 font-mono font-bold text-slate-800">
                      <div className="flex items-center gap-1.5">
                        {isSelected && <span className="w-1.5 h-1.5 rounded-full bg-emerald-600" />}
                        <span>{item.id}</span>
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <span
                        className={`inline-block px-2.5 py-0.5 rounded-full text-[11px] font-bold ${
                          isReceivable
                            ? 'bg-amber-100 text-amber-900'
                            : 'bg-blue-100 text-blue-900'
                        }`}
                      >
                        {isReceivable ? 'Phải thu xã viên' : 'Phải trả đối tác'}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <div className="font-bold text-slate-900">{item.debtorName}</div>
                      {(item as any).crop_season_name && (
                        <div className="mt-0.5">
                          <span className="inline-flex items-center gap-1 text-[10.5px] font-bold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
                            <Wheat className="w-3 h-3 text-emerald-600" />
                            {(item as any).crop_season_name}
                          </span>
                        </div>
                      )}
                      {item.description && <div className="text-[11px] text-slate-400 break-words mt-0.5">{item.description}</div>}
                    </td>
                    <td className="py-3 px-4 text-right font-mono text-slate-600">
                      {money(item.totalAmount)}
                    </td>
                    <td className="py-3 px-4 text-right font-mono text-emerald-700 font-bold">
                      {money(paidAmount)}
                    </td>
                    <td className="py-3 px-4 text-right font-mono font-black text-rose-700 text-xs">
                      {money(item.remainingAmount)}
                    </td>
                    <td className="py-3 px-4 font-mono text-slate-600">{item.dueDate || '—'}</td>
                    <td className="py-3 px-4">
                      {isPaid ? (
                        <span className="inline-flex items-center gap-1 text-emerald-700 font-bold text-[11px] bg-emerald-50 px-2 py-0.5 rounded-lg border border-emerald-200">
                          <CheckCircle2 className="w-3.5 h-3.5" /> Đã xong
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-amber-700 font-bold text-[11px] bg-amber-50 px-2 py-0.5 rounded-lg border border-amber-200">
                          <Clock className="w-3.5 h-3.5" /> Còn nợ
                        </span>
                      )}
                    </td>
                    <td className="py-3 px-4 text-center">
                      {!isPaid && item.remainingAmount > 0 && (
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            onSettleDebt(item);
                          }}
                          className="px-2.5 py-1 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-300 rounded-lg font-bold text-[11px] cursor-pointer transition-colors shadow-2xs"
                        >
                          Thu nợ
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })
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
            <strong>{filtered.length}</strong> khoản nợ
          </div>
          <Pagination
            currentPage={currentPage}
            totalItems={filtered.length}
            pageSize={pageSize}
            onPageChange={setCurrentPage}
          />
        </div>
      )}

      {/* Debt Detail Drawer */}
      <DebtDrawer
        debt={selectedDebt}
        isOpen={!!selectedDebt}
        onClose={() => setSelectedDebt(null)}
        onSettle={(d) => {
          setSelectedDebt(null);
          onSettleDebt(d);
        }}
      />
      </div>
    </div>
  );
};
