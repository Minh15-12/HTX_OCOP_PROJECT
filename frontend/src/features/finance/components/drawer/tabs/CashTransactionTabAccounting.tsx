import React from 'react';
import { FileText, User, Receipt, ShieldCheck, AlertCircle } from 'lucide-react';
import { CashTransaction } from '@/services/financeApi';
import { DataFieldRow } from '@/components/common/DataFieldRow';

interface CashTransactionTabAccountingProps {
  transaction: CashTransaction;
}

const money = (n: number) => (n || 0).toLocaleString('vi-VN') + ' ₫';

export const CashTransactionTabAccounting: React.FC<CashTransactionTabAccountingProps> = ({
  transaction,
}) => {
  const isIncome = transaction.transactionType === 'INCOME';

  // Determine standard accounting accounts based on transaction
  const debitAccount = isIncome
    ? transaction.paymentMethod === 'BANK_TRANSFER'
      ? 'TK 1121 (Tiền gửi ngân hàng)'
      : 'TK 1111 (Tiền mặt tại quỹ)'
    : transaction.category.includes('vật tư')
    ? 'TK 152 (Nguyên liệu, vật liệu tồn kho)'
    : transaction.category.includes('thu mua')
    ? 'TK 156 / 331 (Nông sản thu mua / Phải trả người bán)'
    : 'TK 642 / 627 (Chi phí quản lý / Chi phí sản xuất chung)';

  const creditAccount = isIncome
    ? transaction.category.includes('vốn')
      ? 'TK 411 (Vốn đầu tư của chủ sở hữu / Vốn góp xã viên)'
      : transaction.category.includes('bán')
      ? 'TK 511 (Doanh thu bán hàng và cung cấp dịch vụ)'
      : 'TK 131 / 138 (Phải thu khách hàng / Thu nợ xã viên)'
    : transaction.paymentMethod === 'BANK_TRANSFER'
    ? 'TK 1121 (Tiền gửi ngân hàng)'
    : 'TK 1111 (Tiền mặt tại quỹ)';

  return (
    <div className="space-y-4">
      {/* Định khoản kế toán */}
      <div className="bg-slate-50/80 rounded-2xl p-4 border border-slate-200">
        <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-2.5 flex items-center gap-1.5">
          <Receipt className="w-3.5 h-3.5 text-emerald-600" />
          Định khoản kế toán theo TT 88/2021/TT-BTC
        </h4>
        <div className="divide-y divide-slate-200/60 text-xs">
          <DataFieldRow label="Số hiệu chứng từ" value={transaction.voucherNumber} isMono />
          <DataFieldRow
            label="Phân loại bút toán"
            value={
              <span className={`font-bold ${isIncome ? 'text-emerald-700' : 'text-rose-700'}`}>
                {isIncome ? 'Bút toán Thu tiền (Tăng tiền)' : 'Bút toán Chi tiền (Giảm tiền)'}
              </span>
            }
          />
          <DataFieldRow label="Tài khoản Nợ (Debit)" value={debitAccount} isMono />
          <DataFieldRow label="Tài khoản Có (Credit)" value={creditAccount} isMono />
          <DataFieldRow
            label="Số tiền ghi sổ"
            value={
              <span
                className={`font-black font-mono text-sm ${
                  isIncome ? 'text-emerald-800' : 'text-rose-800'
                }`}
              >
                {money(transaction.amount)}
              </span>
            }
          />
        </div>
      </div>

      {/* Thông tin đối tác giao dịch */}
      <div className="bg-slate-50/80 rounded-2xl p-4 border border-slate-200">
        <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-2.5 flex items-center gap-1.5">
          <User className="w-3.5 h-3.5 text-emerald-600" />
          Đối tác & Phương thức thanh toán
        </h4>
        <div className="divide-y divide-slate-200/60 text-xs">
          <DataFieldRow
            label={isIncome ? 'Người nộp tiền' : 'Người nhận tiền'}
            value={<span className="font-bold text-slate-900">{transaction.personName}</span>}
          />
          <DataFieldRow label="Hạng mục hạch toán" value={transaction.category} />
          <DataFieldRow
            label="Hình thức thanh toán"
            value={
              transaction.paymentMethod === 'BANK_TRANSFER'
                ? 'Chuyển khoản qua Ngân hàng HTX'
                : 'Tiền mặt giao nhận trực tiếp tại quỹ'
            }
          />
          <DataFieldRow label="Ngày chứng từ" value={transaction.transactionDate} isMono />
          <DataFieldRow
            label="Trạng thái kiểm soát"
            value={
              <span className="inline-flex items-center gap-1 text-emerald-800 font-bold">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                Đã kiểm tra hợp lệ & đối chiếu quỹ
              </span>
            }
          />
        </div>
      </div>

      {/* Nội dung diễn giải */}
      <div className="bg-slate-50/80 rounded-2xl p-4 border border-slate-200">
        <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-2.5 flex items-center gap-1.5">
          <AlertCircle className="w-3.5 h-3.5 text-emerald-600" />
          Nội dung & Lý do nộp / chi tiền
        </h4>
        <p className="text-xs text-slate-700 leading-relaxed font-medium">
          {transaction.description || 'Không có mô tả chi tiết kèm theo chứng từ này.'}
        </p>
      </div>
    </div>
  );
};
