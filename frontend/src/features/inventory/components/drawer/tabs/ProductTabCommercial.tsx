import React from 'react';
import { Package, Award, Star, Calendar, ShieldCheck, Thermometer } from 'lucide-react';
import { ProductItem } from '@/services/productApi';
import { DataFieldRow } from '@/components/common/DataFieldRow';

interface ProductTabCommercialProps {
  product: ProductItem;
}

const money = (n?: number) => (n || 0).toLocaleString('vi-VN') + ' ₫';

export const ProductTabCommercial: React.FC<ProductTabCommercialProps> = ({ product }) => {
  const star = product.star_rating || product.quality_information?.star_rating || 4;
  const cert = product.quality_information || {};

  return (
    <div className="space-y-4">
      {/* OCOP Banner */}
      <div className="rounded-2xl border border-amber-200 bg-amber-50/70 p-4 text-amber-950 flex items-start gap-3">
        <div className="p-2 rounded-xl bg-amber-100 text-amber-800 shrink-0">
          <Award className="w-5 h-5" />
        </div>
        <div className="text-xs space-y-1">
          <div className="flex items-center gap-1.5 font-extrabold text-sm text-amber-900">
            <span>Sản phẩm đạt chứng nhận OCOP {star} Sao</span>
            <div className="flex items-center">
              {Array.from({ length: star }).map((_, idx) => (
                <Star key={idx} className="w-3.5 h-3.5 fill-amber-500 text-amber-500" />
              ))}
            </div>
          </div>
          <p className="text-amber-800 leading-relaxed">
            Được Hội đồng đánh giá và phân hạng sản phẩm OCOP cấp tỉnh/huyện công nhận theo Quyết
            định 148/QĐ-TTg của Thủ tướng Chính phủ.
          </p>
        </div>
      </div>

      {/* Thông số thương mại */}
      <div className="bg-slate-50/80 rounded-2xl p-4 border border-slate-200">
        <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-2.5 flex items-center gap-1.5">
          <Package className="w-3.5 h-3.5 text-emerald-600" />
          Hồ sơ Thương mại & Bao gói
        </h4>
        <div className="divide-y divide-slate-200/60 text-xs">
          <DataFieldRow label="Tên thương mại sản phẩm" value={product.product_name} />
          <DataFieldRow label="Mã sản phẩm (SKU)" value={product.product_code} isMono />
          <DataFieldRow label="Thương hiệu bảo hộ" value={product.brand || 'HTX Nông nghiệp Tân Tiến'} />
          <DataFieldRow label="Phân nhóm ngành hàng" value={product.category} />
          <DataFieldRow
            label="Quy cách đóng gói"
            value={
              typeof product.specification === 'string'
                ? product.specification
                : (product.specification as any)?.package || 'Túi hút chân không 500g'
            }
          />
          <DataFieldRow
            label="Giá bán tham chiếu"
            value={
              <span className="font-bold text-emerald-800 font-mono text-sm">
                {money(product.price)} / {product.unit || 'Kg'}
              </span>
            }
          />
        </div>
      </div>

      {/* Hồ sơ chất lượng OCOP */}
      <div className="bg-slate-50/80 rounded-2xl p-4 border border-slate-200">
        <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-2.5 flex items-center gap-1.5">
          <Award className="w-3.5 h-3.5 text-emerald-600" />
          Chứng nhận Chất lượng & Tiêu chuẩn kỹ thuật
        </h4>
        <div className="divide-y divide-slate-200/60 text-xs">
          <DataFieldRow
            label="Số Quyết định cấp sao"
            value={cert.ocop_cert_number || 'QĐ-UBND-2026-089'}
            isMono
          />
          <DataFieldRow
            label="Ngày công nhận hiệu lực"
            value={cert.cert_date || '15/01/2026'}
            isMono
          />
          <DataFieldRow
            label="Thời hạn bảo quản"
            value={`${cert.shelf_life_days || 21} ngày kể từ ngày đóng gói`}
          />
          <DataFieldRow
            label="Điều kiện nhiệt độ lưu kho"
            value={cert.storage_condition || 'Bảo quản mát 8-12°C, độ ẩm 85-90%'}
          />
          <DataFieldRow
            label="Trạng thái lưu hành"
            value={
              <span className="inline-flex items-center gap-1 font-bold text-emerald-800">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                Đang lưu hành chính thức
              </span>
            }
          />
        </div>
      </div>
    </div>
  );
};
