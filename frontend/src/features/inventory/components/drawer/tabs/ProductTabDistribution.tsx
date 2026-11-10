import React from 'react';
import { Store, Truck, ShieldCheck, CheckCircle2, Award, Building2 } from 'lucide-react';
import { ProductItem } from '@/services/productApi';
import { DataFieldRow } from '@/components/common/DataFieldRow';

interface ProductTabDistributionProps {
  product: ProductItem;
}

export const ProductTabDistribution: React.FC<ProductTabDistributionProps> = ({ product }) => {
  return (
    <div className="space-y-4">
      {/* Distribution Header */}
      <div className="rounded-2xl border border-emerald-200 bg-emerald-50/70 p-4 text-emerald-900 flex items-start gap-3">
        <div className="p-2 rounded-xl bg-emerald-100 text-emerald-800 shrink-0">
          <Truck className="w-5 h-5" />
        </div>
        <div className="text-xs space-y-1">
          <h4 className="font-extrabold text-sm text-emerald-950">
            Kênh Phân phối Thương phẩm & Chuỗi Giá trị OCOP
          </h4>
          <p className="text-emerald-800 leading-relaxed">
            Sản phẩm được bao tiêu và phân phối thông qua các chuỗi siêu thị bán lẻ hiện đại, sàn
            thương mại điện tử và điểm giới thiệu sản phẩm OCOP tiêu biểu của tỉnh.
          </p>
        </div>
      </div>

      {/* Chuỗi phân phối đối tác */}
      <div className="bg-slate-50/80 rounded-2xl p-4 border border-slate-200">
        <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-2.5 flex items-center gap-1.5">
          <Store className="w-3.5 h-3.5 text-emerald-600" />
          Hệ thống đối tác bao tiêu & Siêu thị
        </h4>
        <div className="divide-y divide-slate-200/60 text-xs">
          <DataFieldRow
            label="Kênh phân phối chủ lực"
            value={product.quality_information?.distribution_channels || 'Hệ thống đối tác bao tiêu & Điểm bán sản phẩm OCOP'}
          />
          <DataFieldRow
            label="Kênh bán lẻ liên kết"
            value={product.quality_information?.retail_outlets || 'Cửa hàng thực phẩm sạch & Điểm giới thiệu OCOP địa phương'}
          />
          <DataFieldRow
            label="Kênh thương mại điện tử"
            value={product.quality_information?.ecommerce || 'Sàn giao dịch nông sản & Cổng thương mại điện tử OCOP'}
          />
          <DataFieldRow
            label="Quy chuẩn vận chuyển & Logistics"
            value={product.quality_information?.logistics || 'Bảo quản chuỗi cung ứng lạnh tiêu chuẩn (Cold-Chain)'}
          />
        </div>
      </div>

      {/* Chứng chỉ & An toàn Vệ sinh thực phẩm */}
      <div className="bg-slate-50/80 rounded-2xl p-4 border border-slate-200">
        <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-2.5 flex items-center gap-1.5">
          <Award className="w-3.5 h-3.5 text-emerald-600" />
          Chứng chỉ Thực hành Nông nghiệp Tốt
        </h4>
        <div className="divide-y divide-slate-200/60 text-xs">
          <DataFieldRow
            label="Chứng nhận VietGAP"
            value={
              <span className="inline-flex items-center gap-1 font-bold text-emerald-800">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                {product.quality_information?.vietgap_cert || 'Đạt chuẩn VietGAP Trồng trọt'}
              </span>
            }
          />
          <DataFieldRow
            label="Giấy chứng nhận ATVSTP"
            value={product.quality_information?.food_safety_cert || 'Đã chứng nhận đủ điều kiện ATVSTP'}
            isMono
          />
          <DataFieldRow
            label="Kiểm nghiệm dư lượng BVTV"
            value={product.quality_information?.lab_test_note || 'Đạt chỉ tiêu kiểm nghiệm an toàn thực phẩm OCOP'}
          />
        </div>
      </div>
    </div>
  );
};
