import React from 'react';
import {
  FileText,
  ArrowDownRight,
  ArrowUpRight,
  X,
  Package,
  Calendar,
  DollarSign,
  User,
} from 'lucide-react';
import { StockReceipt } from '@/types/inventory';

interface StockReceiptDrawerHeaderProps {
  receipt: StockReceipt;
  onClose: () => void;
}

const num = (n: number) => n.toLocaleString('vi-VN');
const money = (n: number) => n.toLocaleString('vi-VN') + ' ₫';

export const StockReceiptDrawerHeader: React.FC<StockReceiptDrawerHeaderProps> = ({
  receipt,
  onClose,
}) => {
  const isIn = receipt.type === 'IN';
  const totalValue = receipt.qty * (receipt.unitPrice || 0);

  return (
    <div
      className={`p-5 text-white border-b ${
        isIn
          ? 'bg-gradient-to-r from-emerald-900 via-teal-950 to-slate-900 border-emerald-800/40'
          : 'bg-gradient-to-r from-blue-900 via-indigo-950 to-slate-900 border-blue-800/40'
      }`}
    >
      {/* Top action row */}
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-white/10 backdrop-blur-md text-white border border-white/10 shadow-inner">
            {isIn ? (
              <ArrowDownRight className="h-6 w-6 text-emerald-300" strokeWidth={2.2} />
            ) : (
              <ArrowUpRight className="h-6 w-6 text-blue-300" strokeWidth={2.2} />
            )}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-mono text-xs font-bold text-white bg-white/15 px-2 py-0.5 rounded border border-white/20">
                {receipt.id}
              </span>
              <span
                className={`text-[11px] font-bold px-2 py-0.5 rounded-full border ${
                  isIn
                    ? 'bg-emerald-500/20 text-emerald-200 border-emerald-400/30'
                    : 'bg-blue-500/20 text-blue-200 border-blue-400/30'
                }`}
              >
                {isIn ? 'Phiếu Nhập kho (Bổ sung)' : 'Phiếu Xuất kho (Cấp phát vụ)'}
              </span>
            </div>
            <h2 className="text-lg font-black tracking-tight text-white mt-1">
              {receipt.itemName}
            </h2>
          </div>
        </div>

        <button
          type="button"
          onClick={onClose}
          aria-label="Đóng ngăn chi tiết phiếu kho"
          className="p-1.5 rounded-xl hover:bg-white/15 text-slate-300 hover:text-white transition cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* 4 KPI summary cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 mt-4 pt-4 border-t border-white/10">
        <div className="bg-white/5 rounded-xl p-2.5 border border-white/10">
          <div className="flex items-center gap-1.5 text-[11px] text-slate-300 font-medium">
            <Package className="w-3.5 h-3.5 text-emerald-300" />
            Số lượng
          </div>
          <div className="text-base font-extrabold text-white mt-0.5">
            {isIn ? '+' : '-'}{num(receipt.qty)} <span className="text-xs text-slate-300 font-normal">{receipt.unit}</span>
          </div>
        </div>

        <div className="bg-white/5 rounded-xl p-2.5 border border-white/10">
          <div className="flex items-center gap-1.5 text-[11px] text-slate-300 font-medium">
            <DollarSign className="w-3.5 h-3.5 text-amber-300" />
            Đơn giá
          </div>
          <div className="text-sm font-extrabold text-white mt-0.5 truncate">
            {receipt.unitPrice ? money(receipt.unitPrice) : 'Giá chuẩn kho'}
          </div>
        </div>

        <div className="bg-white/5 rounded-xl p-2.5 border border-white/10">
          <div className="flex items-center gap-1.5 text-[11px] text-slate-300 font-medium">
            <DollarSign className="w-3.5 h-3.5 text-teal-300" />
            Tổng giá trị
          </div>
          <div className="text-sm font-extrabold text-emerald-300 mt-0.5 truncate">
            {totalValue > 0 ? money(totalValue) : '—'}
          </div>
        </div>

        <div className="bg-white/5 rounded-xl p-2.5 border border-white/10">
          <div className="flex items-center gap-1.5 text-[11px] text-slate-300 font-medium">
            <User className="w-3.5 h-3.5 text-sky-300" />
            Người phụ trách
          </div>
          <div className="text-sm font-extrabold text-white mt-0.5 truncate">
            {receipt.person || 'Thủ kho'}
          </div>
        </div>
      </div>
    </div>
  );
};
