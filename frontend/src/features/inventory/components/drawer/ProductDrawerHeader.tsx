import React from 'react';
import {
  Package,
  Star,
  ShieldCheck,
  QrCode,
  X,
  DollarSign,
  Calendar,
  Layers,
  Award,
} from 'lucide-react';
import { ProductItem } from '@/services/productApi';

interface ProductDrawerHeaderProps {
  product: ProductItem;
  onClose: () => void;
  onOpenAttachLot?: (productId: string) => void;
}

const money = (n?: number) => (n || 0).toLocaleString('vi-VN') + ' ₫';

export const ProductDrawerHeader: React.FC<ProductDrawerHeaderProps> = ({
  product,
  onClose,
  onOpenAttachLot,
}) => {
  const star = product.star_rating || product.quality_information?.star_rating || 4;
  const certNum = product.quality_information?.ocop_cert_number || 'QĐ-UBND-2026-089';

  return (
    <div className="bg-gradient-to-r from-emerald-900 via-teal-950 to-slate-900 text-white p-5 border-b border-emerald-800/40">
      {/* Top action row */}
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-white/10 backdrop-blur-md text-amber-300 border border-white/10 shadow-inner">
            <Award className="h-6 w-6" strokeWidth={2.2} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-mono text-xs font-bold text-emerald-300 bg-emerald-900/60 px-2 py-0.5 rounded border border-emerald-500/30">
                {product.product_code}
              </span>
              <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-0.5 rounded-full border bg-amber-400/20 text-amber-300 border-amber-300/30">
                <Star className="w-3 h-3 fill-amber-300 text-amber-300" />
                OCOP {star} Sao
              </span>
            </div>
            <h2 className="text-lg font-black tracking-tight text-white mt-1">
              {product.product_name}
            </h2>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {onOpenAttachLot && (
            <button
              type="button"
              onClick={() => onOpenAttachLot(product.id)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs transition shadow-xs cursor-pointer"
            >
              <QrCode className="w-3.5 h-3.5" />
              + Gán lô GS1
            </button>
          )}
          <button
            type="button"
            onClick={onClose}
            aria-label="Đóng ngăn chi tiết sản phẩm OCOP"
            className="p-1.5 rounded-xl hover:bg-white/15 text-slate-300 hover:text-white transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* 4 KPI summary cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 mt-4 pt-4 border-t border-white/10">
        <div className="bg-white/5 rounded-xl p-2.5 border border-white/10">
          <div className="flex items-center gap-1.5 text-[11px] text-slate-300 font-medium">
            <DollarSign className="w-3.5 h-3.5 text-emerald-300" />
            Giá bán tham chiếu
          </div>
          <div className="text-base font-extrabold text-emerald-300 mt-0.5 font-mono">
            {money(product.price)}
          </div>
        </div>

        <div className="bg-white/5 rounded-xl p-2.5 border border-white/10">
          <div className="flex items-center gap-1.5 text-[11px] text-slate-300 font-medium">
            <Package className="w-3.5 h-3.5 text-sky-300" />
            Đơn vị quy cách
          </div>
          <div className="text-sm font-extrabold text-white mt-0.5 truncate">
            {product.unit || 'Kg'}
          </div>
        </div>

        <div className="bg-white/5 rounded-xl p-2.5 border border-white/10">
          <div className="flex items-center gap-1.5 text-[11px] text-slate-300 font-medium">
            <QrCode className="w-3.5 h-3.5 text-teal-300" />
            Lô GS1 lưu hành
          </div>
          <div className="text-base font-extrabold text-white mt-0.5 font-mono">
            {product.lots_count || (product.lots ? product.lots.length : 1)} lô
          </div>
        </div>

        <div className="bg-white/5 rounded-xl p-2.5 border border-white/10">
          <div className="flex items-center gap-1.5 text-[11px] text-slate-300 font-medium">
            <Calendar className="w-3.5 h-3.5 text-amber-300" />
            Hạn dùng bảo quản
          </div>
          <div className="text-sm font-extrabold text-amber-300 mt-0.5">
            {product.quality_information?.shelf_life_days
              ? `${product.quality_information.shelf_life_days} ngày`
              : '21 ngày'}
          </div>
        </div>
      </div>
    </div>
  );
};
