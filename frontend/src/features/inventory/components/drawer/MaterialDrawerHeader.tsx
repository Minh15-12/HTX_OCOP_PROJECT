import React from 'react';
import {
  X,
  Pencil,
  ArrowDownRight,
  ArrowUpRight,
  Package,
  Layers,
  Coins,
  ShieldAlert,
} from 'lucide-react';
import { Material } from '@/types/inventory';

interface MaterialDrawerHeaderProps {
  material: Material;
  onClose: () => void;
  onEdit: (m: Material) => void;
  onStockMove: (m: Material, type: 'IN' | 'OUT') => void;
}

const formatMoney = (n: number) => (n || 0).toLocaleString('vi-VN') + ' ₫';
const formatNum = (n: number) => (n || 0).toLocaleString('vi-VN');

export const MaterialDrawerHeader: React.FC<MaterialDrawerHeaderProps> = ({
  material,
  onClose,
  onEdit,
  onStockMove,
}) => {
  const isOutOfStock = material.stockQty <= 0;
  const isLowStock = !isOutOfStock && material.stockQty < material.minSafetyStock;
  const totalValue = material.stockQty * (material.unitPrice || 0);

  return (
    <div className="p-5 border-b border-slate-200 bg-white z-10 shrink-0 shadow-xs space-y-4">
      {/* Top row: Avatar + Title + Status + Action buttons */}
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3.5 min-w-0">
          <div className="w-12 h-12 rounded-2xl bg-emerald-100 text-emerald-800 font-black flex items-center justify-center text-lg shadow-2xs shrink-0 border border-emerald-200">
            <Package className="w-6 h-6 text-emerald-700" />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <h2 className="text-lg font-black text-slate-900 tracking-tight truncate">
                {material.name}
              </h2>
              {isOutOfStock ? (
                <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-rose-100 text-rose-700 border border-rose-200">
                  Hết hàng
                </span>
              ) : isLowStock ? (
                <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-amber-100 text-amber-800 border border-amber-200">
                  Dưới mức an toàn
                </span>
              ) : (
                <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-100 text-emerald-700 border border-emerald-200">
                  Đủ số lượng
                </span>
              )}
            </div>
            <p className="text-xs text-slate-500 font-medium mt-1 truncate">
              <span className="font-mono text-emerald-800 font-bold">{material.code}</span>
              <span className="mx-1.5 text-slate-300">&bull;</span>
              <span className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 font-semibold text-[11px]">
                {material.category}
              </span>
              {material.supplierName && (
                <>
                  <span className="mx-1.5 text-slate-300">&bull;</span>
                  <span>{material.supplierName}</span>
                </>
              )}
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-1.5 shrink-0">
          <button
            type="button"
            onClick={() => onStockMove(material, 'IN')}
            className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-xl border border-emerald-300 bg-emerald-50 text-emerald-800 hover:bg-emerald-100 text-xs font-bold transition-all shadow-2xs cursor-pointer"
            title="Nhập thêm hàng vào kho"
          >
            <ArrowDownRight className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Nhập kho</span>
          </button>
          <button
            type="button"
            onClick={() => onStockMove(material, 'OUT')}
            disabled={isOutOfStock}
            className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-xl border border-blue-300 bg-blue-50 text-blue-800 hover:bg-blue-100 disabled:opacity-40 text-xs font-bold transition-all shadow-2xs cursor-pointer"
            title="Xuất kho cấp phát"
          >
            <ArrowUpRight className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Xuất kho</span>
          </button>
          <button
            type="button"
            onClick={() => onEdit(material)}
            className="p-1.5 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
            title="Chỉnh sửa vật tư"
          >
            <Pencil className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-xl border border-slate-200 text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
            title="Đóng chi tiết"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Quick KPI Stat Chips */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 pt-1">
        <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200/80">
          <div className="flex items-center gap-1.5 text-[11px] font-bold text-slate-500">
            <Package className="w-3.5 h-3.5 text-emerald-600" />
            <span>Tồn kho hiện tại</span>
          </div>
          <div className="text-sm font-black font-mono text-slate-900 mt-1">
            {formatNum(material.stockQty)}{' '}
            <span className="text-xs font-normal text-slate-500">{material.unit}</span>
          </div>
        </div>

        <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200/80">
          <div className="flex items-center gap-1.5 text-[11px] font-bold text-slate-500">
            <Coins className="w-3.5 h-3.5 text-blue-600" />
            <span>Đơn giá nhập</span>
          </div>
          <div className="text-sm font-black font-mono text-slate-900 mt-1">
            {material.unitPrice ? formatMoney(material.unitPrice) : '—'}
          </div>
        </div>

        <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200/80">
          <div className="flex items-center gap-1.5 text-[11px] font-bold text-slate-500">
            <Layers className="w-3.5 h-3.5 text-indigo-600" />
            <span>Tổng giá trị tồn</span>
          </div>
          <div className="text-sm font-black font-mono text-emerald-800 mt-1">
            {totalValue > 0 ? formatMoney(totalValue) : '—'}
          </div>
        </div>

        <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200/80">
          <div className="flex items-center gap-1.5 text-[11px] font-bold text-slate-500">
            <ShieldAlert className="w-3.5 h-3.5 text-amber-600" />
            <span>Định mức tối thiểu</span>
          </div>
          <div className="text-sm font-black font-mono text-slate-800 mt-1">
            {formatNum(material.minSafetyStock)}{' '}
            <span className="text-xs font-normal text-slate-500">{material.unit}</span>
          </div>
        </div>
      </div>
    </div>
  );
};
