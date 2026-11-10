import React, { useState, useMemo } from 'react';
import { Search, Download, ClipboardCheck, AlertCircle, CheckCircle2, Calendar, FileText, Plus } from 'lucide-react';
import { StockCount } from '../../../types/inventory';
import { Pagination } from '@/components/ui/Pagination';

const fmtDate = (iso?: string) => {
  if (!iso) return '—';
  const [y, m, d] = iso.split('-');
  return `${d}/${m}/${y}`;
};

interface StockCountsTableProps {
  counts: StockCount[];
  isLoading?: boolean;
  onOpenCreateModal?: () => void;
}

export const StockCountsTable: React.FC<StockCountsTableProps> = ({
  counts,
  isLoading = false,
  onOpenCreateModal,
}) => {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'DRAFT' | 'COMPLETED' | 'APPROVED'>('ALL');
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10;

  const filtered = useMemo(() => {
    return counts.filter((c) => {
      const q = search.toLowerCase().trim();
      const matchText =
        !q ||
        c.countCode.toLowerCase().includes(q) ||
        (c.note && c.note.toLowerCase().includes(q));

      const matchStatus = statusFilter === 'ALL' || c.status === statusFilter;
      return matchText && matchStatus;
    });
  }, [counts, search, statusFilter]);

  const totalPages = Math.ceil(filtered.length / pageSize) || 1;
  const pagedCounts = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filtered.slice(start, start + pageSize);
  }, [filtered, currentPage, pageSize]);

  return (
    <div className="space-y-4">
      {/* Controls Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-white p-4 rounded-xl border border-slate-200/80 shadow-2xs">
        <div className="flex flex-wrap items-center gap-3 flex-1 min-w-[280px]">
          <div className="relative flex-1 min-w-[200px] max-w-md">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Tìm mã đợt kiểm kê, ghi chú..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600"
            />
          </div>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as any)}
            className="text-xs bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-slate-700 font-medium focus:outline-hidden"
          >
            <option value="ALL">Tất cả trạng thái</option>
            <option value="COMPLETED">Đã hoàn thành kiểm kê</option>
            <option value="APPROVED">Đã phê duyệt điều chỉnh</option>
            <option value="DRAFT">Bản nháp</option>
          </select>
        </div>

        <div className="flex items-center gap-3">
          <div className="text-xs text-slate-500 font-medium">
            Tổng số: <strong className="text-slate-800">{filtered.length}</strong> đợt kiểm kê
          </div>
          {onOpenCreateModal && (
            <button
              type="button"
              onClick={onOpenCreateModal}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-700 hover:bg-emerald-800 text-white font-extrabold text-xs rounded-lg shadow-xs cursor-pointer active:scale-98 transition-all"
            >
              <Plus className="w-3.5 h-3.5" /> Tạo đợt kiểm kê
            </button>
          )}
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border border-slate-200/80 shadow-2xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold uppercase tracking-wider">
                <th className="py-3 px-4">Mã Đợt Kiểm Kê</th>
                <th className="py-3 px-4">Kho Thực Hiện</th>
                <th className="py-3 px-4">Ngày Kiểm Kê</th>
                <th className="py-3 px-4 text-center">Số Mặt Hàng Đếm</th>
                <th className="py-3 px-4 text-center">Lệch Tồn Kho</th>
                <th className="py-3 px-4">Trạng Thái</th>
                <th className="py-3 px-4">Ghi Chú</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
              {isLoading ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-400">
                    Đang nạp dữ liệu kiểm kê kho...
                  </td>
                </tr>
              ) : pagedCounts.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-400">
                    Chưa có đợt kiểm kê nào được ghi nhận
                  </td>
                </tr>
              ) : (
                pagedCounts.map((c) => (
                  <tr key={c.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3 px-4 font-mono font-bold text-slate-900">
                      <div className="flex items-center gap-1.5">
                        <ClipboardCheck className="w-3.5 h-3.5 text-blue-600" />
                        <span>{c.countCode}</span>
                      </div>
                    </td>
                    <td className="py-3 px-4 font-semibold text-slate-800">{c.warehouseName || 'Kho Trung tâm'}</td>
                    <td className="py-3 px-4 text-slate-600">{fmtDate(c.countDate)}</td>
                    <td className="py-3 px-4 text-center font-bold text-slate-900">{c.totalItems}</td>
                    <td className="py-3 px-4 text-center">
                      {c.discrepancyCount > 0 ? (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-bold bg-amber-50 text-amber-800 border border-amber-200">
                          <AlertCircle className="w-3 h-3 text-amber-600" />
                          Lệch {c.discrepancyCount} mục
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-medium bg-emerald-50 text-emerald-800">
                          <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                          Khớp 100%
                        </span>
                      )}
                    </td>
                    <td className="py-3 px-4">
                      {c.status === 'APPROVED' ? (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-100 text-emerald-800">
                          Đã phê duyệt
                        </span>
                      ) : c.status === 'COMPLETED' ? (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold bg-blue-100 text-blue-800">
                          Đã hoàn thành
                        </span>
                      ) : (
                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-semibold bg-slate-100 text-slate-700">
                          Bản nháp
                        </span>
                      )}
                    </td>
                    <td className="py-3 px-4 text-slate-500 break-words">{c.note || '—'}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        {filtered.length > pageSize && (
          <div className="p-3 border-t border-slate-200">
            <Pagination
              currentPage={currentPage}
              totalItems={filtered.length}
              pageSize={pageSize}
              onPageChange={setCurrentPage}
            />
          </div>
        )}
      </div>
    </div>
  );
};
