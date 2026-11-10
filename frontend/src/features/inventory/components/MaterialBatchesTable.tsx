import React, { useState, useMemo } from 'react';
import { Search, Download, Clock, AlertTriangle, ShieldCheck, Calendar, Filter } from 'lucide-react';
import { MaterialBatch } from '../../../types/inventory';
import { Pagination } from '@/components/ui/Pagination';

const num = (n: number) => (n || 0).toLocaleString('vi-VN');
const fmtDate = (iso?: string) => {
  if (!iso) return '—';
  const [y, m, d] = iso.split('-');
  return `${d}/${m}/${y}`;
};

interface MaterialBatchesTableProps {
  batches: MaterialBatch[];
  isLoading?: boolean;
}

export const MaterialBatchesTable: React.FC<MaterialBatchesTableProps> = ({
  batches,
  isLoading = false,
}) => {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'ACTIVE' | 'NEAR_EXPIRY' | 'EXPIRED'>('ALL');
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10;

  const filtered = useMemo(() => {
    return batches.filter((b) => {
      const q = search.toLowerCase().trim();
      const matchText =
        !q ||
        b.batchCode.toLowerCase().includes(q) ||
        b.materialName.toLowerCase().includes(q);

      const matchStatus = statusFilter === 'ALL' || b.status === statusFilter;
      return matchText && matchStatus;
    });
  }, [batches, search, statusFilter]);

  const totalPages = Math.ceil(filtered.length / pageSize) || 1;
  const pagedBatches = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filtered.slice(start, start + pageSize);
  }, [filtered, currentPage, pageSize]);

  const exportCSV = () => {
    const headers = ['Mã Lô Vật Tư', 'Tên Vật Tư', 'Số Lượng Tồn', 'ĐVT', 'Ngày Sản Xuất', 'Hạn Sử Dụng', 'Số Ngày Còn Lại', 'Trạng Thái'];
    const rows = filtered.map((b) => [
      b.batchCode,
      `"${b.materialName.replace(/"/g, '""')}"`,
      b.quantity,
      b.unit,
      b.manufactureDate || '',
      b.expiredAt || '',
      b.daysUntilExpiry ?? '',
      b.status === 'EXPIRED' ? 'Hết hạn' : (b.status === 'NEAR_EXPIRY' ? 'Cận date' : 'Bình thường'),
    ]);
    const csvContent = '\uFEFF' + [headers.join(','), ...rows.map((r) => r.join(','))].join('\r\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Danh_sach_lo_vat_tu_FEFO_${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-4">
      {/* Controls Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-white p-4 rounded-xl border border-slate-200/80 shadow-2xs">
        <div className="flex flex-wrap items-center gap-3 flex-1 min-w-[280px]">
          <div className="relative flex-1 min-w-[200px] max-w-md">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Tìm mã số lô, tên vật tư..."
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
            <option value="ALL">Tất cả trạng thái HSD</option>
            <option value="NEAR_EXPIRY">⚠️ Cận date (≤ 30 ngày)</option>
            <option value="EXPIRED">⛔ Đã hết hạn sử dụng</option>
            <option value="ACTIVE">✅ Còn hạn an toàn</option>
          </select>
        </div>

        <button
          onClick={exportCSV}
          className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors cursor-pointer"
        >
          <Download className="w-4 h-4" />
          <span>Xuất CSV</span>
        </button>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border border-slate-200/80 shadow-2xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold uppercase tracking-wider">
                <th className="py-3 px-4">Mã Số Lô (Batch Code)</th>
                <th className="py-3 px-4">Tên Vật Tư</th>
                <th className="py-3 px-4 text-right">Số Lượng Tồn</th>
                <th className="py-3 px-4">ĐVT</th>
                <th className="py-3 px-4">Ngày Sản Xuất</th>
                <th className="py-3 px-4">Hạn Sử Dụng (FEFO)</th>
                <th className="py-3 px-4 text-center">Trạng Thái HSD</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
              {isLoading ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-400">
                    Đang nạp danh mục lô vật tư...
                  </td>
                </tr>
              ) : pagedBatches.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-400">
                    <div className="flex flex-col items-center justify-center gap-2">
                      <Clock className="w-8 h-8 text-slate-300" />
                      {search || statusFilter !== 'ALL' ? (
                        <>
                          <p className="font-bold text-slate-700">Không tìm thấy lô vật tư phù hợp</p>
                          <p className="text-[11.5px] text-slate-400 max-w-sm">
                            Không có lô nào khớp với từ khóa "{search}" hoặc trạng thái hạn dùng đang lọc.
                          </p>
                          <button
                            type="button"
                            onClick={() => {
                              setSearch('');
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
                          <p className="font-bold text-slate-600">Chưa có lô vật tư nào được ghi nhận</p>
                          <p className="text-[11.5px] text-slate-400">
                            Các lô vật tư sẽ được tự động tạo khi thực hiện Phiếu Nhập Kho theo nguyên tắc FEFO.
                          </p>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              ) : (
                pagedBatches.map((b) => (
                  <tr key={b.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3 px-4 font-mono font-bold text-slate-900">
                      <div className="flex items-center gap-1.5">
                        <Clock className="w-3.5 h-3.5 text-emerald-600" />
                        <span>{b.batchCode}</span>
                      </div>
                    </td>
                    <td className="py-3 px-4 font-bold text-slate-900">{b.materialName}</td>
                    <td className="py-3 px-4 text-right font-extrabold text-slate-900">{num(b.quantity)}</td>
                    <td className="py-3 px-4 text-slate-500">{b.unit}</td>
                    <td className="py-3 px-4 text-slate-500">{fmtDate(b.manufactureDate)}</td>
                    <td className="py-3 px-4 font-mono font-bold">
                      <div className="flex items-center gap-1 text-slate-800">
                        <Calendar className="w-3.5 h-3.5 text-slate-400" />
                        <span>{fmtDate(b.expiredAt)}</span>
                      </div>
                    </td>
                    <td className="py-3 px-4 text-center">
                      {b.status === 'EXPIRED' ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-rose-50 text-rose-800 border border-rose-200">
                          <AlertTriangle className="w-3 h-3 text-rose-600" />
                          Hết hạn
                        </span>
                      ) : b.status === 'NEAR_EXPIRY' ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-amber-50 text-amber-800 border border-amber-200">
                          <Clock className="w-3 h-3 text-amber-600" />
                          Còn {b.daysUntilExpiry} ngày
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-medium bg-emerald-50 text-emerald-800 border border-emerald-200">
                          <ShieldCheck className="w-3 h-3 text-emerald-600" />
                          An toàn
                        </span>
                      )}
                    </td>
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
