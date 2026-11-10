import React from 'react';
import { ReceivablePayable } from '@/services/financeApi';
import { DataFieldRow } from '@/components/common/DataFieldRow';

interface DebtTabOverviewProps {
  debt: ReceivablePayable;
}

const formatMoney = (n: number) => (n || 0).toLocaleString('vi-VN') + ' ₫';

export const DebtTabOverview: React.FC<DebtTabOverviewProps> = ({ debt }) => {
  const isReceivable = debt.debtType === 'RECEIVABLE';
  const paidAmount = Math.max(0, debt.totalAmount - debt.remainingAmount);
  const percentPaid =
    debt.totalAmount > 0 ? Math.min(100, Math.round((paidAmount / debt.totalAmount) * 100)) : 0;

  return (
    <div className="space-y-4">
      {/* CARD 1: THÔNG TIN HỒ SƠ CÔNG NỢ */}
      <div className="bg-white rounded-xl border border-slate-200/90 shadow-2xs p-5">
        <h3 className="text-xs font-black uppercase tracking-wider text-slate-800 pb-3 mb-2 border-b border-slate-100 flex items-center justify-between">
          <span>Thông tin hồ sơ công nợ</span>
          <span className="text-[11px] font-mono text-slate-400 font-normal">
            Mã: {debt.id}
          </span>
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-1">
          <DataFieldRow label="Mã hồ sơ nợ" value={debt.id} isMono highlight />
          <DataFieldRow label="Đối tượng công nợ" value={debt.debtorName} highlight />
          <DataFieldRow
            label="Phân loại nghiệp vụ"
            value={isReceivable ? 'Phải thu xã viên (Receivable)' : 'Phải trả đối tác (Payable)'}
          />
          <DataFieldRow
            label="Kỳ hạn thanh toán"
            value={debt.dueDate || 'Theo quy chế hợp đồng'}
            isMono
          />
          <div className="md:col-span-2">
            <DataFieldRow
              label="Diễn giải nguồn gốc nợ"
              value={debt.description || 'Tạm ứng vật tư nông nghiệp & phân bón mùa vụ'}
            />
          </div>
        </div>
      </div>

      {/* CARD 2: TIẾN ĐỘ THU HỒI & TỶ LỆ THANH TOÁN */}
      <div className="bg-white rounded-xl border border-slate-200/90 shadow-2xs p-5">
        <h3 className="text-xs font-black uppercase tracking-wider text-slate-800 pb-3 mb-3 border-b border-slate-100 flex items-center justify-between">
          <span>Tiến độ thanh toán & Khấu trừ</span>
          <span className="text-xs font-mono font-bold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded">
            Đã thu {percentPaid}%
          </span>
        </h3>

        {/* Progress Bar */}
        <div className="space-y-1.5 mb-4">
          <div className="flex justify-between text-xs font-semibold text-slate-600">
            <span>Tiến độ thu hồi nợ</span>
            <span>{percentPaid}%</span>
          </div>
          <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden">
            <div
              className="h-full bg-emerald-600 rounded-full transition-all duration-500"
              style={{ width: `${percentPaid}%` }}
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-1">
          <DataFieldRow label="Số tiền gốc ban đầu" value={formatMoney(debt.totalAmount)} isMono />
          <DataFieldRow
            label="Số tiền đã thu hồi / cấn trừ"
            value={formatMoney(paidAmount)}
            isMono
            highlight
          />
          <DataFieldRow
            label="Dư nợ còn lại"
            value={formatMoney(debt.remainingAmount)}
            isMono
            valueClassName="text-rose-700 font-black"
          />
          <DataFieldRow
            label="Tình trạng đối soát"
            value={
              debt.status === 'SETTLED' ? (
                <span className="text-emerald-700 font-bold">Đã tất toán</span>
              ) : debt.status === 'PARTIAL' ? (
                <span className="text-amber-800 font-bold">Đang thu hồi dở dang</span>
              ) : (
                <span className="text-rose-700 font-bold">Chưa thanh toán đợt nào</span>
              )
            }
          />
        </div>
      </div>

      {/* CARD 3: QUY ĐỊNH CẤN TRỪ ĐIỀU LỆ HTX */}
      <div className="bg-white rounded-xl border border-slate-200/90 shadow-2xs p-5">
        <h3 className="text-xs font-black uppercase tracking-wider text-slate-800 pb-3 mb-2 border-b border-slate-100">
          Nguyên tắc cấn trừ công nợ nội bộ
        </h3>
        <p className="text-[13px] text-slate-700 leading-relaxed">
          Theo Điều lệ HTX Nông nghiệp, các khoản nợ tạm ứng vật tư phân bón sẽ được ưu tiên cấn trừ trực tiếp khi HTX thu mua nông sản hoặc khi chi trả phân chia lợi nhuận cuối năm tài chính. Việc thanh toán được đối soát tự động và in phiếu thu/chi có chữ ký thủ quỹ và kế toán trưởng.
        </p>
      </div>
    </div>
  );
};
