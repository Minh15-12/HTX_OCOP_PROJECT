import React, { useState, useMemo } from 'react';
import { Search, Download, ArrowDownRight, ArrowUpRight, History } from 'lucide-react';
import { StockReceipt } from '../../../types/inventory';
import { Pagination } from '@/components/ui/Pagination';

const num = (n: number) => n.toLocaleString('vi-VN');
const money = (n: number) => n.toLocaleString('vi-VN') + ' ₫';
const fmtDate = (iso?: string) => {
  if (!iso) return '—';
  const [y, m, d] = iso.split('-');
  return `${d}/${m}/${y}`;
};

interface StockReceiptsTableProps {
  history: StockReceipt[];
  onSelectRow?: (receipt: StockReceipt) => void;
  selectedId?: string;
}

export const StockReceiptsTable: React.FC<StockReceiptsTableProps> = ({
  history,
  onSelectRow,
  selectedId,
}) => {
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState<'all' | 'IN' | 'OUT'>('all');
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10;

  const filtered = useMemo(() => {
    return history.filter((r) => {
      const q = search.toLowerCase().trim();
      const matchText =
        !q ||
        r.id.toLowerCase().includes(q) ||
        r.itemName.toLowerCase().includes(q) ||
        (r.note && r.note.toLowerCase().includes(q)) ||
        (r.person && r.person.toLowerCase().includes(q));

      const matchType = typeFilter === 'all' || r.type === typeFilter;
      return matchText && matchType;
    });
  }, [history, search, typeFilter]);

  const totalPages = Math.ceil(filtered.length / pageSize) || 1;
  const pagedHistory = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filtered.slice(start, start + pageSize);
  }, [filtered, currentPage, pageSize]);

  const exportCSV = () => {
    const headers = ['Mã phiếu', 'Loại giao dịch', 'Tên vật tư', 'Số lượng', 'ĐVT', 'Ngày giao dịch', 'Người thực hiện', 'Diễn giải'];
    const rows = filtered.map((r) => [
      r.id,
      r.type === 'IN' ? 'Nhập kho' : 'Xuất kho',
      `"${r.itemName.replace(/"/g, '""')}"`,
      r.qty,
      r.unit,
      r.date,
      `"${(r.person || '').replace(/"/g, '""')}"`,
      `"${(r.note || '').replace(/"/g, '""')}"`,
    ]);

    const csvContent = '\uFEFF' + [headers.join(','), ...rows.map((r) => r.join(','))].join('\r\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `Lich_su_nhap_xuat_kho_${new Date().toISOString().slice(0, 10)}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="bg-white border border-slate-200 rounded-b-2xl shadow-xs overflow-hidden space-y-0">
      {/* Controls Bar */}
      <div className="p-3.5 border-b border-slate-200 bg-slate-50/70 flex flex-wrap items-center justify-between gap-3">
        <div className="relative flex-1 min-w-[240px]">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setCurrentPage(1);
            }}
            placeholder="Tìm theo mã phiếu, tên vật tư, diễn giải, người thực hiện..."
            className="w-full pl-9 pr-3 py-1.5 bg-white border border-slate-300 rounded-xl text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500"
          />
        </div>

        <select
          value={typeFilter}
          onChange={(e) => {
            setTypeFilter(e.target.value as any);
            setCurrentPage(1);
          }}
          className="bg-white border border-slate-300 rounded-xl px-3 py-1.5 text-xs font-semibold text-slate-700 focus:outline-none"
        >
          <option value="all">Tất cả loại phiếu</option>
          <option value="IN">Phiếu Nhập kho (Bổ sung hàng)</option>
          <option value="OUT">Phiếu Xuất kho (Cấp phát)</option>
        </select>

        <button
          type="button"
          onClick={exportCSV}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white hover:bg-slate-100 border border-slate-300 rounded-xl text-slate-700 font-bold text-xs transition-colors cursor-pointer"
        >
          <Download className="w-3.5 h-3.5" />
          Xuất CSV
        </button>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs border-collapse">
          <thead>
            <tr className="bg-slate-50 text-slate-700 font-bold border-b border-slate-200 uppercase text-[11px] tracking-wider">
              <th className="py-3 px-4">Mã phiếu</th>
              <th className="py-3 px-4">Loại giao dịch</th>
              <th className="py-3 px-4">Tên vật tư</th>
              <th className="py-3 px-4 text-right">Số lượng</th>
              <th className="py-3 px-4">Ngày ghi nhận</th>
              <th className="py-3 px-4">Người thực hiện</th>
              <th className="py-3 px-4">Diễn giải / Mục đích</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
            {pagedHistory.length === 0 ? (
              <tr>
                <td colSpan={7} className="py-12 text-center text-slate-400">
                  <div className="flex flex-col items-center justify-center gap-2">
                    <History className="w-8 h-8 text-slate-300" />
                    <p className="font-bold text-slate-600">Chưa có lịch sử nhập / xuất kho</p>
                    <p className="text-[11.5px] text-slate-400">
                      Các thao tác nhập bổ sung hoặc xuất cấp phát vật tư sẽ tự động ghi sổ tại đây.
                    </p>
                  </div>
                </td>
              </tr>
            ) : (
              pagedHistory.map((r) => {
                const isIn = r.type === 'IN';
                const isSelected = selectedId === r.id;
                return (
                  <tr
                    key={r.id}
                    onClick={() => onSelectRow?.(r)}
                    className={`transition-colors cursor-pointer ${
                      isSelected ? 'bg-emerald-50/80 font-medium' : 'hover:bg-slate-50/80'
                    }`}
                  >
                    <td className="py-3 px-4 font-mono font-bold text-slate-800">{r.id}</td>
                    <td className="py-3 px-4">
                      <span
                        className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold ${
                          isIn
                            ? 'bg-emerald-100 text-emerald-800'
                            : 'bg-blue-100 text-blue-800'
                        }`}
                      >
                        {isIn ? (
                          <>
                            <ArrowDownRight className="w-3.5 h-3.5 text-emerald-600" />
                            Nhập kho
                          </>
                        ) : (
                          <>
                            <ArrowUpRight className="w-3.5 h-3.5 text-blue-600" />
                            Xuất cấp phát
                          </>
                        )}
                      </span>
                    </td>
                    <td className="py-3 px-4 font-bold text-slate-900">{r.itemName}</td>
                    <td className="py-3 px-4 text-right font-mono font-black text-slate-900">
                      {isIn ? '+' : '-'}{num(r.qty)} <span className="text-[11px] text-slate-500 font-normal">{r.unit}</span>
                    </td>
                    <td className="py-3 px-4 font-mono text-slate-600">{fmtDate(r.date)}</td>
                    <td className="py-3 px-4 text-slate-700">{r.person || 'Thủ kho HTX'}</td>
                    <td className="py-3 px-4 text-slate-500 break-words">{r.note || '—'}</td>
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
            <strong>{filtered.length}</strong> giao dịch
          </div>
          <Pagination
            currentPage={currentPage}
            totalItems={filtered.length}
            pageSize={pageSize}
            onPageChange={setCurrentPage}
          />
        </div>
      )}
    </div>
  );
};
