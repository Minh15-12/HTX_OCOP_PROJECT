import React, { useState, useMemo } from 'react';
import {
  Search, Download, Plus, ArrowDownLeft, ArrowUpRight, Printer, Wallet, FileSpreadsheet,
} from 'lucide-react';
import { CashTransaction } from '@/services/financeApi';
import { Pagination } from '@/components/ui/Pagination';
import { downloadServerReportXlsx } from '@/utils/exportUtils';

const money = (n: number) => (n || 0).toLocaleString('vi-VN') + ' ₫';

interface CashbookTabProps {
  cashList: CashTransaction[];
  onOpenModal: () => void;
  onPrintVoucher: (voucher: CashTransaction) => void;
  onSelectRow?: (transaction: CashTransaction) => void;
  selectedId?: string;
}

export const CashbookTab: React.FC<CashbookTabProps> = ({
  cashList,
  onOpenModal,
  onPrintVoucher,
  onSelectRow,
  selectedId,
}) => {
  const [search, setSearch] = useState('');
  const [filterType, setFilterType] = useState<'ALL' | 'INCOME' | 'EXPENSE'>('ALL');
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10;

  const filtered = useMemo(() => {
    return cashList.filter((item) => {
      const q = search.toLowerCase().trim();
      const matchText =
        !q ||
        item.voucherNumber.toLowerCase().includes(q) ||
        item.personName.toLowerCase().includes(q) ||
        (item.description && item.description.toLowerCase().includes(q)) ||
        item.category.toLowerCase().includes(q);

      const matchType = filterType === 'ALL' || item.transactionType === filterType;
      return matchText && matchType;
    });
  }, [cashList, search, filterType]);

  const totalPages = Math.ceil(filtered.length / pageSize) || 1;
  const pagedList = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filtered.slice(start, start + pageSize);
  }, [filtered, currentPage, pageSize]);

  const exportCSV = () => {
    const headers = ['Số phiếu', 'Loại phiếu', 'Ngày chứng từ', 'Hạng mục', 'Số tiền (VNĐ)', 'Đối tác', 'Hình thức', 'Mô tả'];
    const rows = filtered.map((c) => [
      c.voucherNumber,
      c.transactionType === 'INCOME' ? 'Thu tiền' : 'Chi tiền',
      c.transactionDate,
      `"${c.category.replace(/"/g, '""')}"`,
      c.amount,
      `"${c.personName.replace(/"/g, '""')}"`,
      c.paymentMethod === 'BANK_TRANSFER' ? 'Chuyển khoản' : 'Tiền mặt',
      `"${(c.description || '').replace(/"/g, '""')}"`,
    ]);

    const csvContent = '\uFEFF' + [headers.join(','), ...rows.map((r) => r.join(','))].join('\r\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `So_quy_thu_chi_${new Date().toISOString().slice(0, 10)}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const summary = useMemo(() => {
    let income = 0;
    let expense = 0;
    let incomeCount = 0;
    let expenseCount = 0;
    cashList.forEach((item) => {
      if (item.transactionType === 'INCOME') {
        income += item.amount || 0;
        incomeCount++;
      } else {
        expense += item.amount || 0;
        expenseCount++;
      }
    });
    return {
      income,
      expense,
      balance: income - expense,
      incomeCount,
      expenseCount,
    };
  }, [cashList]);

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
              placeholder="Tìm theo số phiếu, tên đối tác, diễn giải..."
              className="w-full pl-9 pr-3 py-1.5 bg-white border border-slate-300 rounded-xl text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          <select
            value={filterType}
            onChange={(e) => {
              setFilterType(e.target.value as any);
              setCurrentPage(1);
            }}
            className="bg-white border border-slate-300 rounded-xl px-3 py-1.5 text-xs font-semibold text-slate-700 focus:outline-none"
          >
            <option value="ALL">Tất cả giao dịch ({cashList.length})</option>
            <option value="INCOME">Phiếu Thu (Tiền vào quỹ)</option>
            <option value="EXPENSE">Phiếu Chi (Tiền ra khỏi quỹ)</option>
          </select>

          <button
            type="button"
            onClick={async () => {
              try {
                await downloadServerReportXlsx(
                  '/reports/export/cash-book',
                  `so_quy_tien_mat_${new Date().toISOString().slice(0, 10)}.xlsx`
                );
              } catch {
                exportCSV();
              }
            }}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white hover:bg-slate-100 border border-slate-300 rounded-xl text-slate-700 font-bold text-xs transition-colors cursor-pointer"
          >
            <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-600" />
            Xuất Sổ quỹ (.xlsx)
          </button>

          <button
            type="button"
            onClick={onOpenModal}
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs rounded-xl shadow-xs transition-all active:scale-98 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            Lập phiếu Thu / Chi
          </button>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-50 text-slate-700 font-bold border-b border-slate-200 uppercase text-[11px] tracking-wider">
                <th className="py-3 px-4">Số chứng từ</th>
                <th className="py-3 px-4">Loại phiếu</th>
                <th className="py-3 px-4">Hạng mục</th>
                <th className="py-3 px-4 text-right">Số tiền</th>
                <th className="py-3 px-4">Ngày chứng từ</th>
                <th className="py-3 px-4">Đối tác / Người nộp-nhận</th>
                <th className="py-3 px-4">Hình thức</th>
                <th className="py-3 px-4">Nội dung / Diễn giải</th>
                <th className="py-3 px-4 text-center">In phiếu</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
              {pagedList.length === 0 ? (
                <tr>
                  <td colSpan={9} className="py-12 text-center text-slate-400">
                    <div className="flex flex-col items-center justify-center gap-2">
                      <Wallet className="w-8 h-8 text-slate-300" />
                      {search || filterType !== 'ALL' ? (
                        <>
                          <p className="font-bold text-slate-700">Không tìm thấy chứng từ phù hợp</p>
                          <p className="text-[11.5px] text-slate-400 max-w-sm">
                            Không có giao dịch nào khớp với từ khóa "{search}" hoặc bộ lọc đang chọn.
                          </p>
                          <button
                            type="button"
                            onClick={() => {
                              setSearch('');
                              setFilterType('ALL');
                              setCurrentPage(1);
                            }}
                            className="mt-2 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl cursor-pointer transition-colors"
                          >
                            Đặt lại bộ lọc tìm kiếm
                          </button>
                        </>
                      ) : (
                        <>
                          <p className="font-bold text-slate-600">Chưa có chứng từ thu / chi nào</p>
                          <p className="text-[11.5px] text-slate-400">
                            Bấm "Lập phiếu Thu / Chi" để ghi sổ chứng từ kế toán đầu tiên.
                          </p>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              ) : (
              pagedList.map((item) => {
                const isIncome = item.transactionType === 'INCOME';
                const isSelected = selectedId === item.id;
                return (
                  <tr
                    key={item.id}
                    onClick={() => onSelectRow?.(item)}
                    className={`transition-colors cursor-pointer ${
                      isSelected ? 'bg-emerald-50/80 font-medium' : 'hover:bg-slate-50/80'
                    }`}
                  >
                    <td className="py-3 px-4 font-mono font-bold text-slate-800">
                      {item.voucherNumber}
                    </td>
                    <td className="py-3 px-4">
                      <span
                        className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold ${
                          isIncome
                            ? 'bg-emerald-100 text-emerald-800'
                            : 'bg-rose-100 text-rose-800'
                        }`}
                      >
                        {isIncome ? (
                          <>
                            <ArrowDownLeft className="w-3.5 h-3.5 text-emerald-600" /> Thu tiền
                          </>
                        ) : (
                          <>
                            <ArrowUpRight className="w-3.5 h-3.5 text-rose-600" /> Chi tiền
                          </>
                        )}
                      </span>
                    </td>
                    <td className="py-3 px-4 font-bold text-slate-900">{item.category}</td>
                    <td
                      className={`py-3 px-4 text-right font-mono font-black text-xs ${
                        isIncome ? 'text-emerald-700' : 'text-rose-700'
                      }`}
                    >
                      {isIncome ? '+' : '-'}{money(item.amount)}
                    </td>
                    <td className="py-3 px-4 font-mono text-slate-600">{item.transactionDate}</td>
                    <td className="py-3 px-4 font-medium text-slate-800">{item.personName}</td>
                    <td className="py-3 px-4">
                      <span className="inline-block px-2 py-0.5 rounded-lg text-[10.5px] font-bold bg-slate-100 text-slate-700">
                        {item.paymentMethod === 'BANK_TRANSFER' ? 'Chuyển khoản' : 'Tiền mặt'}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-slate-500 break-words">
                      {item.description || '—'}
                    </td>
                    <td className="py-3 px-4 text-center">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          onPrintVoucher(item);
                        }}
                        title="Xem & in phiếu thu/chi theo TT 200/2014/TT-BTC"
                        className="p-1.5 hover:bg-emerald-50 text-emerald-700 rounded-lg transition-colors cursor-pointer"
                      >
                        <Printer className="w-4 h-4" />
                      </button>
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
            <strong>{filtered.length}</strong> chứng từ
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
