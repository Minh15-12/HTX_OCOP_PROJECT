import React from 'react';
import { Package, Star, QrCode } from 'lucide-react';

interface ProductKpiCardsProps {
  totalProducts: number;
  totalStar5: number;
  totalStar4: number;
  totalStar3: number;
  totalLotsLinked: number;
  cooperativeCode: string;
}

export const ProductKpiCards: React.FC<ProductKpiCardsProps> = ({
  totalProducts,
  totalStar4,
  totalStar3,
  totalLotsLinked,
  cooperativeCode,
}) => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-4 gap-3.5">
      <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-subtle">
        <div className="text-[12px] text-slate-500 font-bold flex items-center justify-between">
          <span className="flex items-center gap-1.5">
            <Package className="w-4 h-4 text-emerald-600" /> Tổng Sản Phẩm OCOP
          </span>
          <span className="text-[10px] bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full font-black uppercase">
            {cooperativeCode}
          </span>
        </div>
        <div className="text-2xl font-black text-slate-900 mt-2">{totalProducts} sản phẩm</div>
        <div className="text-[11px] text-slate-400 mt-1">Đã được chứng nhận hoặc đang đánh giá</div>
      </div>

      <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-subtle">
        <div className="text-[12px] text-slate-500 font-bold flex items-center justify-between">
          <span className="flex items-center gap-1.5">
            <Star className="w-4 h-4 fill-amber-400 text-amber-400" /> Sản Phẩm 4 Sao OCOP
          </span>
          <span className="text-[10px] bg-amber-100 text-amber-800 px-2 py-0.5 rounded-full font-black">
            CẤP TỈNH
          </span>
        </div>
        <div className="text-2xl font-black text-amber-700 mt-2">{totalStar4} sản phẩm</div>
        <div className="text-[11px] text-slate-500 mt-1">UBND Tỉnh công nhận</div>
      </div>

      <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-subtle">
        <div className="text-[12px] text-slate-500 font-bold flex items-center justify-between">
          <span className="flex items-center gap-1.5">
            <Star className="w-4 h-4 fill-sky-500 text-sky-500" /> Sản Phẩm 3 Sao OCOP
          </span>
          <span className="text-[10px] bg-sky-100 text-sky-800 px-2 py-0.5 rounded-full font-black">
            CẤP HUYỆN
          </span>
        </div>
        <div className="text-2xl font-black text-sky-700 mt-2">{totalStar3} sản phẩm</div>
        <div className="text-[11px] text-slate-500 mt-1">UBND Huyện/Thành phố công nhận</div>
      </div>

      <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-subtle">
        <div className="text-[12px] text-slate-500 font-bold flex items-center justify-between">
          <span className="flex items-center gap-1.5">
            <QrCode className="w-4 h-4 text-emerald-600" /> Lô Tem GS1 Đã Gán
          </span>
          <span className="text-[10px] bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full font-black">
            TRUY XUẤT
          </span>
        </div>
        <div className="text-2xl font-black text-emerald-700 mt-2">{totalLotsLinked} lô hàng</div>
        <div className="text-[11px] text-emerald-600 mt-1 font-semibold">
          Tích hợp mã QR GS1-128 chuẩn quốc gia
        </div>
      </div>
    </div>
  );
};
