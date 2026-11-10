import React from 'react';
import { Star, ShieldCheck, QrCode } from 'lucide-react';
import { ProductItem } from '@/services/productApi';

interface ProductCardProps {
  product: ProductItem;
  onOpenAttachLot: (productId: string) => void;
  onSelectProduct?: (product: ProductItem) => void;
  isSelected?: boolean;
}

const money = (n?: number) => (n || 0).toLocaleString('vi-VN') + ' ₫';

export const ProductCard: React.FC<ProductCardProps> = ({
  product,
  onOpenAttachLot,
  onSelectProduct,
  isSelected,
}) => {
  const star = product.star_rating || product.quality_information?.star_rating || 4;
  const certNum = product.quality_information?.ocop_cert_number || 'QĐ-UBND-2026-089';

  return (
    <div
      onClick={() => onSelectProduct?.(product)}
      className={`bg-white border rounded-2xl p-5 transition-all flex flex-col justify-between relative group cursor-pointer ${
        isSelected
          ? 'border-emerald-600 ring-2 ring-emerald-500/30 shadow-panel bg-emerald-50/20'
          : 'border-[#e7e9ec] shadow-subtle hover:shadow-panel hover:border-emerald-300'
      }`}
    >
      <div>
        <div className="flex items-center justify-between">
          <span className="text-[11px] font-mono font-black text-emerald-800 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-md">
            {product.product_code}
          </span>
          <span className="px-2.5 py-0.5 rounded-full text-[11px] font-black bg-emerald-100 text-emerald-800 border border-emerald-200 flex items-center gap-1">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-700" />
            Đạt OCOP {star} Sao
          </span>
        </div>

        <div className="mt-3">
          <h3 className="font-black text-[15px] text-slate-900 leading-snug group-hover:text-emerald-700 transition-colors">
            {product.product_name}
          </h3>
          <p className="text-[12px] text-slate-500 mt-0.5">{product.category}</p>
          {product.specification && (
            <p className="text-[11.5px] text-slate-400 italic mt-0.5 truncate">
              {typeof product.specification === 'string'
                ? product.specification
                : (product.specification as any)?.package ||
                  (product.specification as any)?.packaging ||
                  JSON.stringify(product.specification)}
            </p>
          )}
        </div>

        {/* Star Rating Badge Box */}
        <div className="mt-3.5 p-2.5 bg-amber-50/70 border border-amber-200/80 rounded-xl flex items-center justify-between">
          <div>
            <div className="text-[10.5px] font-bold text-amber-800 uppercase tracking-wider">
              Quyết Định Công Nhận:
            </div>
            <div className="text-[11.5px] font-extrabold text-slate-800 font-mono">{certNum}</div>
          </div>
          <div className="flex items-center gap-1 bg-white px-2 py-1 rounded-lg border border-amber-200 shadow-2xs">
            {Array.from({ length: star }).map((_, idx) => (
              <Star key={idx} className="w-4 h-4 fill-amber-400 text-amber-400" />
            ))}
            <span className="text-[12px] font-black text-amber-800 ml-1">{star} sao</span>
          </div>
        </div>

        {/* Linked GS1 Lots status */}
        <div className="mt-3 p-2.5 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <QrCode className="w-4 h-4 text-emerald-700" />
            <div>
              <div className="text-[10.5px] font-bold text-slate-500 uppercase">
                Lô tem GS1 liên kết:
              </div>
              <div className="text-[12px] font-black text-slate-900">
                {product.lots_count || 1} lô thu hoạch đang lưu hành
              </div>
            </div>
          </div>
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onOpenAttachLot(product.id);
            }}
            className="px-2.5 py-1 text-[11px] font-bold bg-white hover:bg-emerald-50 text-emerald-800 border border-emerald-300 rounded-lg shadow-2xs transition-colors cursor-pointer"
          >
            + Gán thêm lô
          </button>
        </div>
      </div>

      <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-[12.8px]">
        <div>
          <div className="text-[10.5px] text-slate-400 font-bold">Giá bán tham chiếu:</div>
          <div className="font-black text-emerald-700 text-base">{money(product.price)}</div>
        </div>
        <span className="text-xs font-bold text-slate-600 bg-slate-100 px-2.5 py-1 rounded-lg">
          {product.unit || 'Kg'}
        </span>
      </div>
    </div>
  );
};
