import React from 'react';
import { Link as LinkIcon, ShieldCheck } from 'lucide-react';
import { ProductItem } from '@/services/productApi';
import type { HarvestItem } from '@/types/agriculture';

interface AttachLotModalProps {
  isOpen: boolean;
  onClose: () => void;
  products: ProductItem[];
  harvests: HarvestItem[];
  selectedProductId: string;
  setSelectedProductId: (id: string) => void;
  selectedLotId: string;
  setSelectedLotId: (id: string) => void;
  attachQuantity: number;
  setAttachQuantity: (qty: number) => void;
  onSubmit: (e: React.FormEvent) => void;
  isPending: boolean;
}

export const AttachLotModal: React.FC<AttachLotModalProps> = ({
  isOpen,
  onClose,
  products,
  harvests,
  selectedProductId,
  setSelectedProductId,
  selectedLotId,
  setSelectedLotId,
  attachQuantity,
  setAttachQuantity,
  onSubmit,
  isPending,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fade-in">
      <div className="bg-white rounded-2xl max-w-lg w-full p-6 space-y-4 shadow-modal border border-slate-100">
        <div className="flex items-center gap-2 text-emerald-800">
          <LinkIcon className="w-5 h-5 text-emerald-600" />
          <h3 className="text-lg font-extrabold text-slate-900">
            Liên Kết Lô Thu Hoạch Vào Sản Phẩm OCOP
          </h3>
        </div>
        <p className="text-xs text-slate-500">
          Gán lô nông sản đạt KCS Grade A từ nhật ký thu hoạch vào mã sản phẩm OCOP để in tem GS1-128 chuẩn quốc gia.
        </p>

        <form onSubmit={onSubmit} className="space-y-3.5 text-xs">
          <div>
            <label className="block font-bold text-slate-700 mb-1">Chọn Sản phẩm OCOP *</label>
            <select
              value={selectedProductId}
              onChange={(e) => setSelectedProductId(e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg font-bold text-slate-900"
              required
            >
              {products.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.product_name} ({p.product_code}) - {p.star_rating || 4} Sao
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block font-bold text-slate-700 mb-1">Chọn Lô Thu Hoạch Đạt KCS *</label>
            <select
              value={selectedLotId}
              onChange={(e) => setSelectedLotId(e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg font-mono text-emerald-800 font-bold"
              required
            >
              {harvests.map((h) => (
                <option key={h.id} value={h.lot_id || h.id}>
                  {h.lot_code || h.harvest_code} - {h.plot_name} ({h.grade_a_kg} kg Loại A, Brix {h.brix_level})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block font-bold text-slate-700 mb-1">
              Số lượng phân bổ tem GS1 (Gói / Hộp)
            </label>
            <input
              type="number"
              min="1"
              step="1"
              value={attachQuantity}
              onChange={(e) => setAttachQuantity(Number(e.target.value))}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg font-bold text-slate-800"
            />
            <span className="text-[11px] text-slate-400 mt-0.5 block">
              Số lượng bao bì thành phẩm dự kiến dán tem truy xuất nguồn gốc của lô này.
            </span>
          </div>

          <div className="bg-emerald-50 p-3 rounded-xl border border-emerald-200 text-emerald-900 text-xs flex items-start gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
            <div>
              <strong>Chuỗi truy xuất khép kín:</strong> Người tiêu dùng quét mã QR trên bao bì sản phẩm OCOP này sẽ
              xem được trọn vẹn nhật ký canh tác của thửa đất, kết quả kiểm nghiệm Quick Lab và giấy chứng nhận OCOP
              hợp lệ.
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-slate-300 rounded-lg font-bold text-slate-600 hover:bg-slate-50 cursor-pointer"
            >
              Hủy
            </button>
            <button
              type="submit"
              disabled={isPending}
              className="px-5 py-2 bg-emerald-700 text-white rounded-lg font-extrabold hover:bg-emerald-800 shadow-md flex items-center gap-1.5 cursor-pointer"
            >
              {isPending ? 'Đang liên kết...' : 'Xác nhận liên kết'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
