import React, { useState, useMemo } from 'react';
import { Search, Download, ArrowUpRight, CheckCircle2, FileText, UserCheck, CreditCard, Recycle, Printer, AlertTriangle } from 'lucide-react';
import { StockIssue } from '../../../types/inventory';
import { Pagination } from '@/components/ui/Pagination';

const money = (n: number) => (n || 0).toLocaleString('vi-VN') + ' ₫';
const fmtDate = (iso?: string) => {
  if (!iso) return '—';
  const [y, m, d] = iso.split('-');
  return `${d}/${m}/${y}`;
};

interface StockIssuesTableProps {
  issues: StockIssue[];
  onApproveIssue?: (id: string) => void;
  onPrintVoucher?: (issue: StockIssue) => void;
  onReturnPackaging?: (issue: StockIssue) => void;
  isLoading?: boolean;
}

export const StockIssuesTable: React.FC<StockIssuesTableProps> = ({
  issues,
  onApproveIssue,
  onPrintVoucher,
  onReturnPackaging,
  isLoading = false,
}) => {
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState<'ALL' | 'CREDIT_ADVANCE' | 'SALE_CASH' | 'INTERNAL_USE'>('ALL');
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'DRAFT' | 'APPROVED' | 'COMPLETED'>('ALL');
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10;

  const filtered = useMemo(() => {
    return issues.filter((iss) => {
      const q = search.toLowerCase().trim();
      const matchText =
        !q ||
        iss.issueCode.toLowerCase().includes(q) ||
        (iss.memberName && iss.memberName.toLowerCase().includes(q)) ||
        (iss.note && iss.note.toLowerCase().includes(q));

      const matchType = typeFilter === 'ALL' || iss.issueType === typeFilter;
      const matchStatus = statusFilter === 'ALL' || iss.status === statusFilter;
      return matchText && matchType && matchStatus;
    });
  }, [issues, search, typeFilter, statusFilter]);

  const totalPages = Math.ceil(filtered.length / pageSize) || 1;
  const pagedIssues = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filtered.slice(start, start + pageSize);
  }, [filtered, currentPage, pageSize]);

  const exportCSV = () => {
    const headers = ['Mã phiếu xuất', 'Loại xuất kho', 'Xã viên nhận', 'Tổng tiền', 'Ngày xuất', 'Trạng thái', 'Ghi chú'];
    const rows = filtered.map((i) => [
      i.issueCode,
      i.issueType === 'CREDIT_ADVANCE' ? 'Ứng nợ đầu vụ' : (i.issueType === 'SALE_CASH' ? 'Bán thu tiền' : 'Tiêu hao'),
      `"${(i.memberName || '').replace(/"/g, '""')}"`,
      i.totalAmount,
      i.issueDate,
      i.status,
      `"${(i.note || '').replace(/"/g, '""')}"`,
    ]);
    const csvContent = '\uFEFF' + [headers.join(','), ...rows.map((r) => r.join(','))].join('\r\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Danh_sach_xuat_kho_${new Date().toISOString().slice(0, 10)}.csv`;
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
              placeholder="Tìm mã phiếu xuất, tên xã viên, ghi chú..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600"
            />
          </div>

          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value as any)}
            className="text-xs bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-slate-700 font-medium focus:outline-hidden"
          >
            <option value="ALL">Tất cả loại xuất</option>
            <option value="CREDIT_ADVANCE">⚡ Xuất nợ đầu vụ (Credit Advance)</option>
            <option value="SALE_CASH">💵 Bán thu tiền ngay</option>
            <option value="INTERNAL_USE">📦 Tiêu hao nội bộ</option>
          </select>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as any)}
            className="text-xs bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-slate-700 font-medium focus:outline-hidden"
          >
            <option value="ALL">Tất cả trạng thái</option>
            <option value="DRAFT">Bản nháp</option>
            <option value="APPROVED">Đã duyệt</option>
            <option value="COMPLETED">Hoàn tất xuất kho</option>
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
                <th className="py-3 px-4">Mã Phiếu Xuất</th>
                <th className="py-3 px-4">Loại Xuất Kho</th>
                <th className="py-3 px-4">Xã Viên Nhận</th>
                <th className="py-3 px-4 text-right">Tổng Giá Trị</th>
                <th className="py-3 px-4">Ngày Xuất</th>
                <th className="py-3 px-4 text-center">Thu Hồi Vỏ BVTV</th>
                <th className="py-3 px-4">Trạng Thái</th>
                <th className="py-3 px-4 text-center">Thao Tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
              {isLoading ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-slate-400">
                    Đang tải danh sách phiếu xuất kho...
                  </td>
                </tr>
              ) : pagedIssues.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-slate-400">
                    Không tìm thấy phiếu xuất kho nào phù hợp
                  </td>
                </tr>
              ) : (
                pagedIssues.map((iss) => (
                  <tr key={iss.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3 px-4 font-mono font-bold text-slate-900">
                      <div className="flex items-center gap-1.5">
                        <ArrowUpRight className="w-3.5 h-3.5 text-amber-600" />
                        <span>{iss.issueCode}</span>
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      {iss.issueType === 'CREDIT_ADVANCE' ? (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-bold bg-amber-50 text-amber-800 border border-amber-200">
                          <CreditCard className="w-3 h-3" />
                          Ứng nợ đầu vụ
                        </span>
                      ) : iss.issueType === 'SALE_CASH' ? (
                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-bold bg-emerald-50 text-emerald-800 border border-emerald-200">
                          Tiền mặt
                        </span>
                      ) : (
                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-medium bg-slate-100 text-slate-700">
                          Nội bộ
                        </span>
                      )}
                    </td>
                    <td className="py-3 px-4">
                      <div className="font-semibold text-slate-900">{iss.memberName || 'Khách vãng lai'}</div>
                      {iss.note && <div className="text-[11px] text-slate-400 break-words">{iss.note}</div>}
                    </td>
                    <td className="py-3 px-4 text-right font-extrabold text-slate-900">
                      {money(iss.totalAmount)}
                    </td>
                    <td className="py-3 px-4 text-slate-600">{fmtDate(iss.issueDate)}</td>
                    <td className="py-3 px-4 text-center">
                      {(iss.emptyBottlesExpected || 0) > 0 ? (
                        (iss.emptyBottlesReturned || 0) >= (iss.emptyBottlesExpected || 0) ? (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-bold bg-emerald-50 text-emerald-800 border border-emerald-200">
                            <CheckCircle2 className="w-3 h-3" />
                            Đã thu {iss.emptyBottlesReturned}/{iss.emptyBottlesExpected} vỏ
                          </span>
                        ) : (
                          <div className="flex items-center justify-center gap-1">
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-bold bg-amber-50 text-amber-800 border border-amber-200">
                              <Recycle className="w-3 h-3 text-amber-600" />
                              {iss.emptyBottlesReturned || 0}/{iss.emptyBottlesExpected} vỏ
                            </span>
                            {onReturnPackaging && (
                              <button
                                onClick={() => onReturnPackaging(iss)}
                                className="p-1 hover:bg-emerald-50 text-emerald-700 rounded-md transition-colors cursor-pointer"
                                title="Ghi nhận thu hồi vỏ bao bì thuốc BVTV"
                              >
                                <Recycle className="w-3.5 h-3.5" />
                              </button>
                            )}
                          </div>
                        )
                      ) : (
                        <span className="text-slate-400">—</span>
                      )}
                    </td>
                    <td className="py-3 px-4">
                      {iss.status === 'COMPLETED' ? (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-100 text-emerald-800">
                          <CheckCircle2 className="w-3 h-3" /> Đã hoàn tất
                        </span>
                      ) : iss.status === 'APPROVED' ? (
                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-semibold bg-blue-100 text-blue-800">
                          Đã duyệt
                        </span>
                      ) : (
                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-semibold bg-slate-100 text-slate-700">
                          Bản nháp
                        </span>
                      )}
                    </td>
                    <td className="py-3 px-4 text-center">
                      <div className="flex items-center justify-center gap-1.5">
                        {iss.status === 'DRAFT' && onApproveIssue && (
                          <button
                            onClick={() => onApproveIssue(iss.id)}
                            className="p-1.5 hover:bg-emerald-50 text-emerald-700 rounded-md transition-colors cursor-pointer"
                            title="Phê duyệt xuất kho"
                          >
                            <UserCheck className="w-4 h-4" />
                          </button>
                        )}
                        {onPrintVoucher && (
                          <button
                            onClick={() => onPrintVoucher(iss)}
                            className="inline-flex items-center gap-1 px-2 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-[11px] rounded-lg transition-colors cursor-pointer"
                            title="In Mẫu 02-VT / Tải PDF, Excel"
                          >
                            <Printer className="w-3.5 h-3.5 text-emerald-700" />
                            <span>Mẫu 02-VT</span>
                          </button>
                        )}
                      </div>
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
