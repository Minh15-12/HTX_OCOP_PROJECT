import React, { useState, useMemo } from 'react';
import { Search, Download, ArrowDownRight, ArrowUpRight, Pencil, Trash2, AlertTriangle } from 'lucide-react';
import { Material, MaterialCategory } from '../../../types/inventory';
import { Pagination } from '@/components/ui/Pagination';

const CATEGORIES: MaterialCategory[] = ['Phân bón', 'Thuốc BVTV Sinh học', 'Vật tư đóng gói', 'Nông cụ'];

const money = (n: number) => n.toLocaleString('vi-VN') + ' ₫';
const num = (n: number) => n.toLocaleString('vi-VN');

const fmtDate = (iso?: string) => {
  if (!iso) return '—';
  const [y, m, d] = iso.split('-');
  return `${d}/${m}/${y}`;
};

const getExpiryStatus = (expiryDate?: string): 'normal' | 'warning' | 'expired' => {
  if (!expiryDate) return 'normal';
  const now = new Date();
  const exp = new Date(expiryDate);
  const diffTime = exp.getTime() - now.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  if (diffDays <= 0) return 'expired';
  if (diffDays <= 30) return 'warning';
  return 'normal';
};

const getStockStatus = (item: Material): 'het' | 'canhbao' | 'du' => {
  if (item.stockQty <= 0) return 'het';
  if (item.stockQty < item.minSafetyStock) return 'canhbao';
  return 'du';
};

const STATUS_META = {
  du: { label: 'Đủ số lượng', fg: '#15803D', bg: '#DCFCE7' },
  canhbao: { label: 'Cảnh báo thiếu', fg: '#C2410C', bg: '#FFEDD5' },
  het: { label: 'Hết hàng', fg: '#B91C1C', bg: '#FEE2E2' },
};

interface MaterialsTableProps {
  items: Material[];
  onEdit: (item: Material) => void;
  onDelete: (item: Material) => void;
  onStockMove: (item: Material, type: 'IN' | 'OUT') => void;
  initialStatusFilter?: string;
  onSelectRow?: (item: Material) => void;
  selectedId?: string;
}

export const MaterialsTable: React.FC<MaterialsTableProps> = ({
  items,
  onEdit,
  onDelete,
  onStockMove,
  initialStatusFilter = 'all',
  onSelectRow,
  selectedId,
}) => {
  const [search, setSearch] = useState('');
  const [catFilter, setCatFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>(initialStatusFilter);
  const [sortKey, setSortKey] = useState<keyof Material | null>(null);
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('asc');
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10;

  const filtered = useMemo(() => {
    return items.filter((it) => {
      const q = search.toLowerCase().trim();
      const matchText =
        !q ||
        it.name.toLowerCase().includes(q) ||
        it.code.toLowerCase().includes(q) ||
        (it.supplierName && it.supplierName.toLowerCase().includes(q));

      const matchCat = catFilter === 'all' || it.category === catFilter;

      let matchStatus = true;
      if (statusFilter === 'expiring') {
        matchStatus = getExpiryStatus(it.expiryDate) !== 'normal';
      } else if (statusFilter !== 'all') {
        matchStatus = getStockStatus(it) === statusFilter;
      }

      return matchText && matchCat && matchStatus;
    });
  }, [items, search, catFilter, statusFilter]);

  const sorted = useMemo(() => {
    if (!sortKey) return filtered;
    return [...filtered].sort((a, b) => {
      const va = a[sortKey] ?? '';
      const vb = b[sortKey] ?? '';
      if (typeof va === 'number' && typeof vb === 'number') {
        return sortDir === 'asc' ? va - vb : vb - va;
      }
      return sortDir === 'asc'
        ? String(va).localeCompare(String(vb), 'vi')
        : String(vb).localeCompare(String(va), 'vi');
    });
  }, [filtered, sortKey, sortDir]);

  const totalPages = Math.ceil(sorted.length / pageSize) || 1;
  const pagedItems = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return sorted.slice(start, start + pageSize);
  }, [sorted, currentPage, pageSize]);

  const handleSort = (key: keyof Material) => {
    if (sortKey === key) {
      setSortDir(sortDir === 'asc' ? 'desc' : 'asc');
    } else {
      setSortKey(key);
      setSortDir('asc');
    }
    setCurrentPage(1);
  };

  const exportCSV = () => {
    const headers = [
      'Mã VT',
      'Tên vật tư',
      'Phân loại',
      'Tồn kho',
      'ĐVT',
      'Ngưỡng an toàn',
      'Đơn giá',
      'Thành tiền',
      'Hạn sử dụng',
      'Nhà cung cấp',
      'Trạng thái kho',
    ];
    const rows = filtered.map((it) => [
      it.code,
      `"${it.name.replace(/"/g, '""')}"`,
      it.category,
      it.stockQty,
      it.unit,
      it.minSafetyStock,
      it.unitPrice || 0,
      (it.stockQty * (it.unitPrice || 0)),
      it.expiryDate || '',
      `"${(it.supplierName || '').replace(/"/g, '""')}"`,
      STATUS_META[getStockStatus(it)].label,
    ]);

    const csvContent =
      '\uFEFF' + [headers.join(','), ...rows.map((r) => r.join(','))].join('\r\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `Bao_cao_ton_kho_vat_tu_${new Date().toISOString().slice(0, 10)}.csv`;
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
            placeholder="Tìm vật tư theo tên, mã VT, nhà cung cấp..."
            className="w-full pl-9 pr-3 py-1.5 bg-white border border-slate-300 rounded-xl text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500"
          />
        </div>

        <select
          value={catFilter}
          onChange={(e) => {
            setCatFilter(e.target.value);
            setCurrentPage(1);
          }}
          className="bg-white border border-slate-300 rounded-xl px-3 py-1.5 text-xs font-semibold text-slate-700 focus:outline-none"
        >
          <option value="all">Tất cả phân loại ({CATEGORIES.length})</option>
          {CATEGORIES.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </select>

        <select
          value={statusFilter}
          onChange={(e) => {
            setStatusFilter(e.target.value);
            setCurrentPage(1);
          }}
          className="bg-white border border-slate-300 rounded-xl px-3 py-1.5 text-xs font-semibold text-slate-700 focus:outline-none"
        >
          <option value="all">Tất cả trạng thái kho</option>
          <option value="du">Đủ số lượng</option>
          <option value="canhbao">Cảnh báo thiếu</option>
          <option value="het">Hết hàng</option>
          <option value="expiring">Cảnh báo sắp hết hạn</option>
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
              <th
                onClick={() => handleSort('code')}
                className="py-3 px-4 cursor-pointer hover:bg-slate-100"
              >
                Mã VT
              </th>
              <th
                onClick={() => handleSort('name')}
                className="py-3 px-4 cursor-pointer hover:bg-slate-100"
              >
                Tên vật tư - nông cụ
              </th>
              <th
                onClick={() => handleSort('category')}
                className="py-3 px-4 cursor-pointer hover:bg-slate-100"
              >
                Phân loại
              </th>
              <th
                onClick={() => handleSort('stockQty')}
                className="py-3 px-4 text-right cursor-pointer hover:bg-slate-100"
              >
                Tồn kho
              </th>
              <th className="py-3 px-4 text-right">Đơn giá</th>
              <th className="py-3 px-4 text-right">Tổng giá trị</th>
              <th
                onClick={() => handleSort('expiryDate')}
                className="py-3 px-4 cursor-pointer hover:bg-slate-100"
              >
                Hạn sử dụng
              </th>
              <th className="py-3 px-4">Trạng thái kho</th>
              <th className="py-3 px-4 text-center">Thao tác</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
            {pagedItems.length === 0 ? (
              <tr>
                <td colSpan={9} className="py-12 text-center text-slate-400">
                  <div className="flex flex-col items-center justify-center gap-2">
                    <AlertTriangle className="w-8 h-8 text-slate-300" />
                    {search || catFilter !== 'all' || statusFilter !== 'all' ? (
                      <>
                        <p className="font-bold text-slate-700">Không tìm thấy vật tư nào phù hợp</p>
                        <p className="text-[11.5px] text-slate-400 max-w-sm">
                          Không có mặt hàng nào khớp với từ khóa "{search}" hoặc các bộ lọc đã chọn.
                        </p>
                        <button
                          type="button"
                          onClick={() => {
                            setSearch('');
                            setCatFilter('all');
                            setStatusFilter('all');
                            setCurrentPage(1);
                          }}
                          className="mt-2 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl cursor-pointer transition-colors"
                        >
                          Đặt lại bộ lọc tìm kiếm
                        </button>
                      </>
                    ) : (
                      <>
                        <p className="font-bold text-slate-600">Kho vật tư hiện đang trống</p>
                        <p className="text-[11.5px] text-slate-400">
                          Bấm "Thêm vật tư" để khởi tạo danh mục vật tư đầu tiên cho HTX.
                        </p>
                      </>
                    )}
                  </div>
                </td>
              </tr>
            ) : (
              pagedItems.map((it) => {
                const st = getStockStatus(it);
                const sm = STATUS_META[st];
                const expSt = getExpiryStatus(it.expiryDate);
                const isSelected = selectedId === it.id;
                const totalVal = it.stockQty * (it.unitPrice || 0);

                return (
                  <tr
                    key={it.id}
                    onClick={() => onSelectRow?.(it)}
                    className={`cursor-pointer transition-colors ${
                      isSelected
                        ? 'bg-emerald-50/80 font-medium'
                        : 'hover:bg-slate-50/80'
                    }`}
                  >
                    <td className="py-3 px-4 font-mono font-bold text-slate-800">
                      <div className="flex items-center gap-1.5">
                        {isSelected && <span className="w-1.5 h-1.5 rounded-full bg-emerald-600" />}
                        <span>{it.code}</span>
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <div className="font-bold text-slate-900">{it.name}</div>
                      {it.supplierName && (
                        <div className="text-[11px] text-slate-400">{it.supplierName}</div>
                      )}
                    </td>
                    <td className="py-3 px-4">
                      <span className="inline-block px-2 py-0.5 rounded-full text-[11px] font-bold bg-slate-100 text-slate-700 border border-slate-200">
                        {it.category}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right font-mono font-black text-slate-900">
                      {num(it.stockQty)} <span className="text-[11px] text-slate-500 font-normal">{it.unit}</span>
                    </td>
                    <td className="py-3 px-4 text-right font-mono text-slate-600">
                      {it.unitPrice ? money(it.unitPrice) : '—'}
                    </td>
                    <td className="py-3 px-4 text-right font-mono font-bold text-slate-900">
                      {totalVal > 0 ? money(totalVal) : '—'}
                    </td>
                    <td className="py-3 px-4">
                      {it.expiryDate ? (
                        <div className="flex items-center gap-1.5">
                          <span
                            className={`font-mono ${
                              expSt === 'expired'
                                ? 'text-rose-700 font-bold'
                                : expSt === 'warning'
                                ? 'text-amber-700 font-bold'
                                : 'text-slate-600'
                            }`}
                          >
                            {fmtDate(it.expiryDate)}
                          </span>
                          {expSt === 'warning' && (
                            <span className="text-[10px] bg-amber-100 text-amber-800 font-bold px-1.5 py-0.2 rounded">
                              HSD ≤30d
                            </span>
                          )}
                          {expSt === 'expired' && (
                            <span className="text-[10px] bg-rose-100 text-rose-800 font-bold px-1.5 py-0.2 rounded">
                              Hết hạn
                            </span>
                          )}
                        </div>
                      ) : (
                        '—'
                      )}
                    </td>
                    <td className="py-3 px-4">
                      <span
                        className="inline-block px-2.5 py-1 rounded-full text-[11px] font-bold"
                        style={{ color: sm.fg, backgroundColor: sm.bg }}
                      >
                        {sm.label}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-center">
                      <div className="flex items-center justify-center gap-1">
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            onStockMove(it, 'IN');
                          }}
                          title="Nhập thêm hàng"
                          className="p-1.5 hover:bg-emerald-50 text-emerald-700 rounded-lg transition-colors cursor-pointer"
                        >
                          <ArrowDownRight className="w-4 h-4" />
                        </button>
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            onStockMove(it, 'OUT');
                          }}
                          disabled={it.stockQty <= 0}
                          title="Xuất kho cấp phát"
                          className="p-1.5 hover:bg-blue-50 disabled:opacity-30 text-blue-700 rounded-lg transition-colors cursor-pointer"
                        >
                          <ArrowUpRight className="w-4 h-4" />
                        </button>
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            onEdit(it);
                          }}
                          title="Chỉnh sửa vật tư"
                          className="p-1.5 hover:bg-slate-100 text-slate-600 rounded-lg transition-colors cursor-pointer"
                        >
                          <Pencil className="w-4 h-4" />
                        </button>
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            onDelete(it);
                          }}
                          title="Xóa vật tư"
                          className="p-1.5 hover:bg-rose-50 text-rose-600 rounded-lg transition-colors cursor-pointer"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination Footer */}
      {sorted.length > pageSize && (
        <div className="p-3 border-t border-slate-200 bg-slate-50 flex items-center justify-between">
          <div className="text-xs text-slate-500 font-medium">
            Hiển thị <strong>{(currentPage - 1) * pageSize + 1}</strong>–
            <strong>{Math.min(currentPage * pageSize, sorted.length)}</strong> trên tổng số{' '}
            <strong>{sorted.length}</strong> vật tư
          </div>
          <Pagination
            currentPage={currentPage}
            totalItems={sorted.length}
            pageSize={pageSize}
            onPageChange={setCurrentPage}
          />
        </div>
      )}
    </div>
  );
};
