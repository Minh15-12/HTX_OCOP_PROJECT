import React from 'react';
import { Package, FileText, Calendar, DollarSign, User, AlertCircle } from 'lucide-react';
import { StockReceipt } from '@/types/inventory';
import { DataFieldRow } from '@/components/common/DataFieldRow';

interface StockReceiptTabDetailsProps {
  receipt: StockReceipt;
}

const num = (n: number) => n.toLocaleString('vi-VN');
const money = (n: number) => n.toLocaleString('vi-VN') + ' ₫';

export const StockReceiptTabDetails: React.FC<StockReceiptTabDetailsProps> = ({ receipt }) => {
  const isIn = receipt.type === 'IN';
  const totalValue = receipt.qty * (receipt.unitPrice || 0);

  return (
    <div className="space-y-4">
      {/* Thông tin chứng từ kho */}
      <div className="bg-slate-50/80 rounded-2xl p-4 border border-slate-200">
        <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-2.5 flex items-center gap-1.5">
          <FileText className="w-3.5 h-3.5 text-emerald-600" />
          Thông số chứng từ kho
        </h4>
        <div className="divide-y divide-slate-200/60 text-xs">
          <DataFieldRow label="Mã số phiếu" value={receipt.id} isMono />
          <DataFieldRow
            label="Loại hình giao dịch"
            value={
              <span
                className={`font-bold ${
                  isIn ? 'text-emerald-700' : 'text-blue-700'
                }`}
              >
                {isIn ? 'Nhập kho bổ sung (Tăng tồn kho)' : 'Xuất kho cấp phát (Giảm tồn kho)'}
              </span>
            }
          />
          <DataFieldRow
            label="Ngày lập phiếu"
            value={
              receipt.date
                ? new Date(receipt.date).toLocaleDateString('vi-VN')
                : '—'
            }
          />
          <DataFieldRow
            label="Cán bộ lập phiếu / Thủ kho"
            value={receipt.person || 'Thủ kho HTX'}
          />
        </div>
      </div>

      {/* Thông tin hàng hóa & Định giá */}
      <div className="bg-slate-50/80 rounded-2xl p-4 border border-slate-200">
        <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-2.5 flex items-center gap-1.5">
          <Package className="w-3.5 h-3.5 text-emerald-600" />
          Quy cách vật tư & Định giá ghi sổ
        </h4>
        <div className="divide-y divide-slate-200/60 text-xs">
          <DataFieldRow label="Tên danh mục vật tư" value={receipt.itemName} />
          <DataFieldRow label="Mã ID vật tư" value={receipt.itemId} isMono />
          <DataFieldRow
            label="Số lượng giao dịch"
            value={
              <span className="font-extrabold text-slate-900 font-mono text-xs">
                {num(receipt.qty)} {receipt.unit}
              </span>
            }
          />
          <DataFieldRow
            label="Đơn giá hạch toán"
            value={receipt.unitPrice ? money(receipt.unitPrice) : 'Theo đơn giá vốn bình quân kho'}
          />
          <DataFieldRow
            label="Tổng giá trị hạch toán"
            value={
              totalValue > 0 ? (
                <span className="font-extrabold text-emerald-800 font-mono text-sm">
                  {money(totalValue)}
                </span>
              ) : (
                '—'
              )
            }
          />
        </div>
      </div>

      {/* Diễn giải & Ghi chú */}
      <div className="bg-slate-50/80 rounded-2xl p-4 border border-slate-200">
        <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-2.5 flex items-center gap-1.5">
          <AlertCircle className="w-3.5 h-3.5 text-emerald-600" />
          Diễn giải & Mục đích xuất/nhập
        </h4>
        <p className="text-xs text-slate-700 leading-relaxed font-medium">
          {receipt.note || 'Không có ghi chú diễn giải kèm theo phiếu này.'}
        </p>
      </div>
    </div>
  );
};
