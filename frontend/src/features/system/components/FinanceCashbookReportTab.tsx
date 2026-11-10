import React, { useState } from 'react';
import { TrendingUp, TrendingDown, Wallet, DollarSign, FileSpreadsheet, Printer, ArrowDownRight, ArrowUpRight } from 'lucide-react';
import { DashboardMetrics } from '@/services/reportApi';
import { CashTransaction } from '@/services/financeApi';
import { openInteractivePrintWindow } from '@/utils/pdfExportUtils';
import { useTenantContextStore } from '@/stores/tenantContextStore';
import { Skeleton } from '@/components/ui/Skeleton';

interface FinanceCashbookReportTabProps {
  metrics: DashboardMetrics | undefined;
  cashTransactions: CashTransaction[];
  isLoading: boolean;
  onExportExcel: () => void;
  isExportingExcel: boolean;
  onExportDebts?: () => void;
  isExportingDebts?: boolean;
}

export const FinanceCashbookReportTab: React.FC<FinanceCashbookReportTabProps> = ({
  metrics,
  cashTransactions,
  isLoading,
  onExportExcel,
  isExportingExcel,
  onExportDebts,
  isExportingDebts,
}) => {
  const { activeCooperative } = useTenantContextStore();
  const coopName = activeCooperative?.legal_name || 'Hợp tác xã Nông nghiệp';

  const totalIncome = metrics?.finance?.total_income ?? cashTransactions
    .filter((tx) => tx.transactionType === 'INCOME')
    .reduce((sum, tx) => sum + (tx.amount || 0), 0);

  const totalExpense = metrics?.finance?.total_expense ?? cashTransactions
    .filter((tx) => tx.transactionType === 'EXPENSE')
    .reduce((sum, tx) => sum + (tx.amount || 0), 0);

  const netBalance = metrics?.finance?.net_balance ?? (totalIncome - totalExpense);
  const totalReceivables = metrics?.finance?.total_receivables ?? 0;

  const handlePrint = () => {
    const tableRows = cashTransactions.map((tx, idx) => `
      <tr>
        <td style="text-align:center;">${idx + 1}</td>
        <td style="font-family:monospace; font-weight:bold;">${tx.voucherNumber || tx.id.slice(0, 8)}</td>
        <td>${tx.transactionDate}</td>
        <td><strong style="color: ${tx.transactionType === 'INCOME' ? '#0f766e' : '#b91c1c'};">${tx.transactionType === 'INCOME' ? 'Thu tiền' : 'Chi tiền'}</strong></td>
        <td>${tx.category}</td>
        <td>${tx.description || '—'}</td>
        <td style="text-align:right; font-family:monospace; font-weight:bold; color: ${tx.transactionType === 'INCOME' ? '#0f766e' : '#b91c1c'};">
          ${tx.transactionType === 'INCOME' ? '+' : '-'}${(tx.amount || 0).toLocaleString('vi-VN')} ₫
        </td>
        <td style="text-align:center;">${tx.status === 'APPROVED' ? 'Đã duyệt' : 'Chờ duyệt'}</td>
      </tr>
    `).join('');

    const html = `
      <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; padding: 20px; color: #1e293b;">
        <div style="border-bottom: 2px solid #0f766e; padding-bottom: 12px; margin-bottom: 20px;">
          <h2 style="margin: 0; color: #0f766e; font-size: 20px; text-transform: uppercase;">${coopName}</h2>
          <h1 style="margin: 6px 0 0 0; color: #0f172a; font-size: 16px;">SỔ QUỸ TIỀN MẶT & BÁO CÁO DÒNG TIỀN THU - CHI</h1>
          <div style="font-size: 12px; color: #64748b; margin-top: 4px;">Căn cứ Chế độ Kế toán HTX (Thông tư 71/2024/TT-BTC & TT 24/2017/TT-BTC) • Ngày trích xuất: ${new Date().toLocaleDateString('vi-VN')}</div>
        </div>

        <div style="display: grid; grid-template-columns: repeat(4, 1fr); gap: 12px; margin-bottom: 20px;">
          <div style="padding: 10px; border: 1px solid #cbd5e1; border-radius: 6px; background: #f8fafc;">
            <div style="font-size: 11px; color: #64748b;">Tổng thu quỹ</div>
            <div style="font-size: 18px; font-weight: bold; color: #0f766e;">+${totalIncome.toLocaleString('vi-VN')} ₫</div>
          </div>
          <div style="padding: 10px; border: 1px solid #cbd5e1; border-radius: 6px; background: #f8fafc;">
            <div style="font-size: 11px; color: #64748b;">Tổng chi quỹ</div>
            <div style="font-size: 18px; font-weight: bold; color: #b91c1c;">-${totalExpense.toLocaleString('vi-VN')} ₫</div>
          </div>
          <div style="padding: 10px; border: 1px solid #cbd5e1; border-radius: 6px; background: #f8fafc;">
            <div style="font-size: 11px; color: #64748b;">Tồn quỹ khả dụng</div>
            <div style="font-size: 18px; font-weight: bold; color: #0f172a;">${netBalance.toLocaleString('vi-VN')} ₫</div>
          </div>
          <div style="padding: 10px; border: 1px solid #cbd5e1; border-radius: 6px; background: #f8fafc;">
            <div style="font-size: 11px; color: #64748b;">Công nợ phải thu</div>
            <div style="font-size: 18px; font-weight: bold; color: #d97706;">${totalReceivables.toLocaleString('vi-VN')} ₫</div>
          </div>
        </div>

        <table style="width: 100%; border-collapse: collapse; font-size: 12px; margin-top: 15px;">
          <thead>
            <tr style="background: #f1f5f9; border-bottom: 2px solid #cbd5e1;">
              <th style="padding: 8px; border: 1px solid #cbd5e1;">STT</th>
              <th style="padding: 8px; border: 1px solid #cbd5e1;">Mã chứng từ</th>
              <th style="padding: 8px; border: 1px solid #cbd5e1;">Ngày lập</th>
              <th style="padding: 8px; border: 1px solid #cbd5e1;">Loại</th>
              <th style="padding: 8px; border: 1px solid #cbd5e1;">Khoản mục</th>
              <th style="padding: 8px; border: 1px solid #cbd5e1;">Diễn giải</th>
              <th style="padding: 8px; border: 1px solid #cbd5e1; text-align:right;">Số tiền</th>
              <th style="padding: 8px; border: 1px solid #cbd5e1; text-align:center;">Trạng thái</th>
            </tr>
          </thead>
          <tbody>
            ${tableRows}
          </tbody>
        </table>

        <div style="display: flex; justify-content: space-between; margin-top: 40px; font-size: 12px;">
          <div style="text-align: center;">
            <strong>THỦ QUỸ</strong><br/><br/><br/>
            (Ký và ghi rõ họ tên)
          </div>
          <div style="text-align: center;">
            <strong>KẾ TOÁN TRƯỞNG</strong><br/><br/><br/>
            (Ký và ghi rõ họ tên)
          </div>
          <div style="text-align: center;">
            <strong>GIÁM ĐỐC HTX</strong><br/><br/><br/>
            (Ký tên và đóng dấu)
          </div>
        </div>
      </div>
    `;

    openInteractivePrintWindow({
      title: `Sổ Quỹ Tiền Mặt - ${coopName}`,
      filename: `so_quy_tien_mat_${new Date().toISOString().slice(0, 10)}.html`,
      contentHtml: html,
      orientation: 'landscape',
    });
  };

  return (
    <div className="space-y-5 animate-fade-in">
      {/* 4 Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
        <div className="p-4 bg-white border border-slate-200 rounded-2xl shadow-2xs">
          <div className="flex items-center justify-between text-slate-500 text-xs font-semibold">
            <span>Tổng thu tiền vào quỹ</span>
            <TrendingUp className="w-4 h-4 text-emerald-600" />
          </div>
          {isLoading ? (
            <Skeleton className="h-8 w-28 mt-2" />
          ) : (
            <div className="text-xl font-black text-emerald-700 mt-1 truncate">
              {totalIncome.toLocaleString('vi-VN')} ₫
            </div>
          )}
          <div className="text-[11px] text-slate-400 mt-1 font-medium">
            Bán nông sản, hoàn ứng & vốn góp
          </div>
        </div>

        <div className="p-4 bg-white border border-slate-200 rounded-2xl shadow-2xs">
          <div className="flex items-center justify-between text-slate-500 text-xs font-semibold">
            <span>Tổng chi tiền ra quỹ</span>
            <TrendingDown className="w-4 h-4 text-rose-600" />
          </div>
          {isLoading ? (
            <Skeleton className="h-8 w-28 mt-2" />
          ) : (
            <div className="text-xl font-black text-rose-700 mt-1 truncate">
              {totalExpense.toLocaleString('vi-VN')} ₫
            </div>
          )}
          <div className="text-[11px] text-slate-400 mt-1 font-medium">
            Thu mua nông sản & mua vật tư
          </div>
        </div>

        <div className="p-4 bg-white border border-slate-200 rounded-2xl shadow-2xs">
          <div className="flex items-center justify-between text-slate-500 text-xs font-semibold">
            <span>Tồn quỹ khả dụng</span>
            <Wallet className="w-4 h-4 text-blue-600" />
          </div>
          {isLoading ? (
            <Skeleton className="h-8 w-28 mt-2" />
          ) : (
            <div className={`text-xl font-black mt-1 truncate ${netBalance >= 0 ? 'text-slate-900' : 'text-rose-700'}`}>
              {netBalance.toLocaleString('vi-VN')} ₫
            </div>
          )}
          <div className="text-[11px] text-slate-400 mt-1 font-medium">
            Tiền mặt tại quỹ & ngân hàng
          </div>
        </div>

        <div className="p-4 bg-white border border-slate-200 rounded-2xl shadow-2xs">
          <div className="flex items-center justify-between text-slate-500 text-xs font-semibold">
            <span>Công nợ phải thu xã viên</span>
            <DollarSign className="w-4 h-4 text-amber-600" />
          </div>
          {isLoading ? (
            <Skeleton className="h-8 w-28 mt-2" />
          ) : (
            <div className="text-xl font-black text-amber-700 mt-1 truncate">
              {totalReceivables.toLocaleString('vi-VN')} ₫
            </div>
          )}
          <div className="text-[11px] text-slate-400 mt-1 font-medium">
            Tạm ứng phân bón, thuốc BVTV & giống
          </div>
        </div>
      </div>

      {/* Action Toolbar & Cashbook Table */}
      <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-2xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-3">
          <div>
            <h3 className="text-sm font-extrabold text-slate-900">
              Nhật ký Sổ Quỹ Thu - Chi gần nhất
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Toàn bộ bút toán thu chi gắn liền với kiểm soát chứng từ và phân tách trách nhiệm kế toán.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={onExportExcel}
              disabled={isExportingExcel}
              className="px-3.5 py-1.5 rounded-xl border border-emerald-300 bg-white hover:bg-emerald-50 text-emerald-800 font-bold text-xs inline-flex items-center gap-1.5 shadow-2xs transition-all cursor-pointer disabled:opacity-50"
            >
              <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
              {isExportingExcel ? 'Đang xuất...' : 'Xuất Sổ Quỹ Excel'}
            </button>
            {onExportDebts && (
              <button
                onClick={onExportDebts}
                disabled={isExportingDebts}
                className="px-3.5 py-1.5 rounded-xl border border-amber-300 bg-white hover:bg-amber-50 text-amber-800 font-bold text-xs inline-flex items-center gap-1.5 shadow-2xs transition-all cursor-pointer disabled:opacity-50"
              >
                <FileSpreadsheet className="w-4 h-4 text-amber-600" />
                {isExportingDebts ? 'Đang xuất...' : 'Xuất Sổ Công Nợ Excel'}
              </button>
            )}
            <button
              onClick={handlePrint}
              className="px-3.5 py-1.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs inline-flex items-center gap-1.5 shadow-xs transition-all cursor-pointer"
            >
              <Printer className="w-4 h-4" /> In / Lưu PDF
            </button>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                <th className="py-2.5 px-3">Mã phiếu</th>
                <th className="py-2.5 px-3">Ngày lập</th>
                <th className="py-2.5 px-3">Loại phiếu</th>
                <th className="py-2.5 px-3">Khoản mục</th>
                <th className="py-2.5 px-3">Diễn giải</th>
                <th className="py-2.5 px-3 text-right">Số tiền</th>
                <th className="py-2.5 px-3 text-center">Trạng thái</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
              {isLoading ? (
                <tr>
                  <td colSpan={7} className="py-6 text-center text-slate-400">Đang tải nhật ký sổ quỹ...</td>
                </tr>
              ) : cashTransactions.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-6 text-center text-slate-400">Chưa có giao dịch sổ quỹ nào.</td>
                </tr>
              ) : (
                cashTransactions.slice(0, 15).map((tx) => (
                  <tr key={tx.id} className="hover:bg-slate-50 transition-colors">
                    <td className="py-2.5 px-3 font-mono font-bold text-slate-800">
                      {tx.voucherNumber || tx.id.slice(0, 8)}
                    </td>
                    <td className="py-2.5 px-3 text-slate-600">{tx.transactionDate}</td>
                    <td className="py-2.5 px-3">
                      <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10.5px] font-bold ${
                        tx.transactionType === 'INCOME'
                          ? 'bg-emerald-100 text-emerald-800'
                          : 'bg-rose-100 text-rose-800'
                      }`}>
                        {tx.transactionType === 'INCOME' ? (
                          <>
                            <ArrowDownRight className="w-3 h-3 text-emerald-700" /> Thu quỹ
                          </>
                        ) : (
                          <>
                            <ArrowUpRight className="w-3 h-3 text-rose-700" /> Chi quỹ
                          </>
                        )}
                      </span>
                    </td>
                    <td className="py-2.5 px-3 text-slate-700 font-medium">{tx.category}</td>
                    <td className="py-2.5 px-3 text-slate-500 break-words">{tx.description || '—'}</td>
                    <td className={`py-2.5 px-3 text-right font-mono font-bold ${
                      tx.transactionType === 'INCOME' ? 'text-emerald-700' : 'text-rose-700'
                    }`}>
                      {tx.transactionType === 'INCOME' ? '+' : '-'}{(tx.amount || 0).toLocaleString('vi-VN')} ₫
                    </td>
                    <td className="py-2.5 px-3 text-center">
                      <span className="pill-badge pill-green text-[10px]">Đã ghi sổ</span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
