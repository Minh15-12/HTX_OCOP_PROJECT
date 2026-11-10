import React from 'react';
import { Material } from '@/types/inventory';
import { DataFieldRow } from '@/components/common/DataFieldRow';
import { formatDate } from '@/utils/formatters';

interface MaterialTabOverviewProps {
  material: Material;
}

const formatMoney = (n: number) => (n || 0).toLocaleString('vi-VN') + ' ₫';
const formatNum = (n: number) => (n || 0).toLocaleString('vi-VN');

export const MaterialTabOverview: React.FC<MaterialTabOverviewProps> = ({ material }) => {
  const getExpiryNotice = (expiryDate?: string) => {
    if (!expiryDate) return null;
    const now = new Date();
    const exp = new Date(expiryDate);
    const diffTime = exp.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    if (diffDays <= 0) {
      return (
        <span className="text-rose-700 font-bold bg-rose-50 px-2 py-0.5 rounded text-xs border border-rose-200">
          Đã hết hạn ({Math.abs(diffDays)} ngày trước)
        </span>
      );
    }
    if (diffDays <= 30) {
      return (
        <span className="text-amber-800 font-bold bg-amber-50 px-2 py-0.5 rounded text-xs border border-amber-200">
          Sắp hết hạn (còn {diffDays} ngày)
        </span>
      );
    }
    return (
      <span className="text-emerald-700 font-medium bg-emerald-50 px-2 py-0.5 rounded text-xs border border-emerald-200">
        Còn hạn an toàn (còn {diffDays} ngày)
      </span>
    );
  };

  const isLowStock = material.stockQty < material.minSafetyStock;

  return (
    <div className="space-y-4">
      {/* CARD 1: THÔNG TIN CƠ BẢN */}
      <div className="bg-white rounded-xl border border-slate-200/90 shadow-2xs p-5">
        <h3 className="text-xs font-black uppercase tracking-wider text-slate-800 pb-3 mb-2 border-b border-slate-100 flex items-center justify-between">
          <span>Thông tin phân loại & quy chuẩn</span>
          <span className="text-[11px] font-mono text-slate-400 font-normal">
            Mã VT: {material.code}
          </span>
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-1">
          <DataFieldRow label="Mã vật tư" value={material.code} isMono highlight />
          <DataFieldRow label="Tên thương mại" value={material.name} />
          <DataFieldRow label="Nhóm phân loại" value={material.category} />
          <DataFieldRow label="Đơn vị tính cơ sở" value={material.unit} />
          <DataFieldRow
            label="Trạng thái theo dõi"
            value={
              material.status === 'ACTIVE' ? (
                <span className="text-emerald-700 font-bold">Đang sử dụng</span>
              ) : (
                <span className="text-slate-500">Tạm ngừng sử dụng</span>
              )
            }
          />
          <DataFieldRow
            label="Điểm kho mặc định"
            value={material.warehouseName || 'Kho chính HTX'}
          />
        </div>
      </div>

      {/* CARD 2: ĐỊNH MỨC & TỒN KHO */}
      <div className="bg-white rounded-xl border border-slate-200/90 shadow-2xs p-5">
        <h3 className="text-xs font-black uppercase tracking-wider text-slate-800 pb-3 mb-2 border-b border-slate-100">
          Định mức an toàn & Trị giá tồn kho
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-1">
          <DataFieldRow
            label="Đơn giá nhập định mức"
            value={material.unitPrice ? formatMoney(material.unitPrice) : '—'}
            isMono
          />
          <DataFieldRow
            label="Mức dự trữ an toàn (Min)"
            value={`${formatNum(material.minSafetyStock)} ${material.unit}`}
            isMono
          />
          <DataFieldRow
            label="Số lượng thực tế tại kho"
            value={`${formatNum(material.stockQty)} ${material.unit}`}
            isMono
            highlight={!isLowStock}
          />
          <DataFieldRow
            label="Tình trạng dự trữ"
            value={
              material.stockQty <= 0 ? (
                <span className="text-rose-700 font-bold">Hết hàng</span>
              ) : isLowStock ? (
                <span className="text-amber-800 font-bold">Cần đặt hàng bổ sung</span>
              ) : (
                <span className="text-emerald-700 font-bold">Đảm bảo sản xuất</span>
              )
            }
          />
          <DataFieldRow
            label="Tổng giá trị tồn ước tính"
            value={formatMoney(material.stockQty * (material.unitPrice || 0))}
            isMono
            highlight
          />
          <DataFieldRow
            label="Phương pháp định giá"
            value="Bình quân gia quyền (Weighted Average)"
          />
        </div>
      </div>

      {/* CARD 3: NHÀ CUNG CẤP & HẠN DÙNG */}
      <div className="bg-white rounded-xl border border-slate-200/90 shadow-2xs p-5">
        <h3 className="text-xs font-black uppercase tracking-wider text-slate-800 pb-3 mb-2 border-b border-slate-100">
          Nguồn gốc cung ứng & Hạn sử dụng
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-1">
          <DataFieldRow
            label="Đơn vị cung ứng"
            value={material.supplierName || 'Nội bộ HTX / Tự cung cấp'}
          />
          <DataFieldRow
            label="Hạn sử dụng ghi trên nhãn"
            value={material.expiryDate ? formatDate(material.expiryDate) : 'Không áp dụng'}
            isMono
          />
          {material.expiryDate && (
            <div className="md:col-span-2">
              <DataFieldRow
                label="Đánh giá hạn sử dụng"
                value={getExpiryNotice(material.expiryDate)}
              />
            </div>
          )}
        </div>
      </div>

      {/* CARD 4: QUY CÁCH BẢO QUẢN & MÔ TẢ */}
      <div className="bg-white rounded-xl border border-slate-200/90 shadow-2xs p-5">
        <h3 className="text-xs font-black uppercase tracking-wider text-slate-800 pb-3 mb-2 border-b border-slate-100">
          Quy cách bảo quản &amp; Ghi chú kỹ thuật
        </h3>
        <p className="text-[13px] text-slate-700 leading-relaxed whitespace-pre-line">
          {material.description ||
            'Chưa có ghi chú chi tiết về quy chuẩn bảo quản. Đề nghị thủ kho lưu trữ ở nơi khô ráo, thoáng mát, tránh ẩm mốc và tuân thủ các quy tắc an toàn bảo hộ lao động theo tiêu chuẩn OCOP.'}
        </p>
      </div>
    </div>
  );
};
