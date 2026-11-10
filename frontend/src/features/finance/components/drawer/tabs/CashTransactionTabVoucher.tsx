import React from 'react';
import { Printer, FileText, CheckCircle2 } from 'lucide-react';
import { CashTransaction } from '@/services/financeApi';
import { useTenantContextStore } from '@/stores/tenantContextStore';

interface CashTransactionTabVoucherProps {
  transaction: CashTransaction;
}

const money = (n: number) => (n || 0).toLocaleString('vi-VN') + ' ₫';

export const CashTransactionTabVoucher: React.FC<CashTransactionTabVoucherProps> = ({
  transaction,
}) => {
  const { activeCooperative } = useTenantContextStore();
  const isIncome = transaction.transactionType === 'INCOME';

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-4">
      {/* Print action bar */}
      <div className="flex items-center justify-between bg-slate-50 p-3 rounded-2xl border border-slate-200">
        <div>
          <p className="text-xs font-bold text-slate-800">
            Xem trước Phiếu {isIncome ? 'Thu (Mẫu 01-TT)' : 'Chi (Mẫu 02-TT)'}
          </p>
          <p className="text-[11px] text-slate-400">
            Chuẩn biểu mẫu kế toán HTX theo Thông tư 88/2021/TT-BTC của Bộ Tài chính.
          </p>
        </div>

        <button
          type="button"
          onClick={handlePrint}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs font-bold transition shadow-xs cursor-pointer"
        >
          <Printer className="w-3.5 h-3.5" />
          In phiếu ngay
        </button>
      </div>

      {/* Printable Voucher Paper */}
      <div className="p-6 bg-white border border-slate-300 rounded-2xl shadow-sm text-slate-900 font-serif space-y-4 print:border-none print:shadow-none print:p-0">
        {/* Header */}
        <div className="flex justify-between items-start border-b border-slate-200 pb-3 font-sans">
          <div>
            <div className="text-xs font-bold uppercase tracking-wider text-slate-700">
              {activeCooperative?.legal_name || 'HỢP TÁC XÃ NÔNG NGHIỆP TÂN TIẾN'}
            </div>
            <div className="text-[11px] text-slate-500">
              Mã số thuế: {activeCooperative?.tax_code || '5801234567'}
            </div>
          </div>
          <div className="text-right text-[11px] text-slate-500">
            <div className="font-bold">Mẫu số: {isIncome ? '01-TT' : '02-TT'}</div>
            <div>(Ban hành theo TT số 88/2021/TT-BTC)</div>
          </div>
        </div>

        {/* Title */}
        <div className="text-center font-sans py-2">
          <h3 className="text-base font-black tracking-tight uppercase text-slate-900">
            {isIncome ? 'PHIẾU THU' : 'PHIẾU CHI'}
          </h3>
          <p className="text-[11px] text-slate-500 mt-0.5 font-mono">
            Số: <strong>{transaction.voucherNumber}</strong> — Ngày: {transaction.transactionDate}
          </p>
        </div>

        {/* Content */}
        <div className="text-xs space-y-2 font-sans">
          <div className="flex justify-between">
            <span className="text-slate-600">
              {isIncome ? 'Họ và tên người nộp tiền:' : 'Họ và tên người nhận tiền:'}
            </span>
            <span className="font-bold text-slate-900">{transaction.personName}</span>
          </div>

          <div className="flex justify-between">
            <span className="text-slate-600">Lý do nộp / chi:</span>
            <span className="text-slate-800 italic">
              {transaction.description || transaction.category}
            </span>
          </div>

          <div className="flex justify-between">
            <span className="text-slate-600">Số tiền:</span>
            <span className="font-mono font-black text-sm text-slate-900">
              {money(transaction.amount)}
            </span>
          </div>

          <div className="flex justify-between">
            <span className="text-slate-600">Hình thức:</span>
            <span className="text-slate-800">
              {transaction.paymentMethod === 'BANK_TRANSFER'
                ? 'Chuyển khoản ngân hàng'
                : 'Tiền mặt'}
            </span>
          </div>
        </div>

        {/* 4 Signatures */}
        <div className="grid grid-cols-4 gap-2 text-center text-[11px] font-sans pt-8">
          <div>
            <div className="font-bold text-slate-800">Giám đốc HTX</div>
            <div className="text-[10px] text-slate-400 italic">(Ký, đóng dấu)</div>
            <div className="mt-9 font-semibold text-slate-700">Ban Giám Đốc</div>
          </div>
          <div>
            <div className="font-bold text-slate-800">Kế toán trưởng</div>
            <div className="text-[10px] text-slate-400 italic">(Ký, họ tên)</div>
            <div className="mt-9 font-semibold text-slate-700">Kế toán HTX</div>
          </div>
          <div>
            <div className="font-bold text-slate-800">Thủ quỹ</div>
            <div className="text-[10px] text-slate-400 italic">(Ký, họ tên)</div>
            <div className="mt-9 font-semibold text-slate-700">Thủ quỹ HTX</div>
          </div>
          <div>
            <div className="font-bold text-slate-800">
              {isIncome ? 'Người nộp tiền' : 'Người nhận tiền'}
            </div>
            <div className="text-[10px] text-slate-400 italic">(Ký, họ tên)</div>
            <div className="mt-9 font-semibold text-slate-700">{transaction.personName}</div>
          </div>
        </div>
      </div>
    </div>
  );
};
