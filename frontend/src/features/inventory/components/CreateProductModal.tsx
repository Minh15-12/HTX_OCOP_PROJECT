import React from 'react';
import { Package } from 'lucide-react';
import { CreateProductPayload } from '@/services/productApi';

interface CreateProductModalProps {
  isOpen: boolean;
  onClose: () => void;
  form: CreateProductPayload;
  setForm: React.Dispatch<React.SetStateAction<CreateProductPayload>>;
  onSubmit: (e: React.FormEvent) => void;
  isPending: boolean;
}

export const CreateProductModal: React.FC<CreateProductModalProps> = ({
  isOpen,
  onClose,
  form,
  setForm,
  onSubmit,
  isPending,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fade-in">
      <div className="bg-white rounded-2xl max-w-lg w-full p-6 space-y-4 shadow-modal border border-slate-100">
        <div className="flex items-center gap-2 text-emerald-800">
          <Package className="w-5 h-5 text-emerald-600" />
          <h3 className="text-lg font-extrabold text-slate-900">Thêm Sản Phẩm OCOP Mới</h3>
        </div>
        <p className="text-xs text-slate-500">
          Đăng ký sản phẩm thương mại và định danh hồ sơ OCOP theo quy định Luật HTX 2023.
        </p>

        <form onSubmit={onSubmit} className="space-y-3.5 text-xs">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-bold text-slate-700 mb-1">Mã sản phẩm *</label>
              <input
                type="text"
                value={form.product_code}
                onChange={(e) => setForm({ ...form, product_code: e.target.value })}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg font-mono font-bold text-slate-900"
                required
              />
            </div>
            <div>
              <label className="block font-bold text-slate-700 mb-1">Phân hạng OCOP dự kiến</label>
              <select
                value={form.star_rating}
                onChange={(e) => setForm({ ...form, star_rating: Number(e.target.value) })}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg font-bold text-amber-800"
              >
                <option value={3}>3 sao (Cấp Huyện)</option>
                <option value={4}>4 sao (Cấp Tỉnh)</option>
                <option value={5}>5 sao (Cấp Quốc gia)</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block font-bold text-slate-700 mb-1">Tên sản phẩm OCOP *</label>
            <input
              type="text"
              value={form.product_name}
              onChange={(e) => setForm({ ...form, product_name: e.target.value })}
              placeholder="Ví dụ: Ớt Chuông Sweet Palermo Đỏ"
              className="w-full px-3 py-2 border border-slate-300 rounded-lg font-bold"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-bold text-slate-700 mb-1">Danh mục nông sản</label>
              <input
                type="text"
                value={form.category}
                onChange={(e) => setForm({ ...form, category: e.target.value })}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg"
              />
            </div>
            <div>
              <label className="block font-bold text-slate-700 mb-1">Thương hiệu / Xuất xứ</label>
              <input
                type="text"
                value={form.brand}
                onChange={(e) => setForm({ ...form, brand: e.target.value })}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg font-bold text-emerald-800"
              />
            </div>
          </div>

          <div>
            <label className="block font-bold text-slate-700 mb-1">Quy cách đóng gói & Bảo quản</label>
            <input
              type="text"
              value={form.specification}
              onChange={(e) => setForm({ ...form, specification: e.target.value })}
              placeholder="Ví dụ: Túi hút chân không 500g, bảo quản 8-12°C"
              className="w-full px-3 py-2 border border-slate-300 rounded-lg"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-bold text-slate-700 mb-1">Giá bán tham chiếu (đ)</label>
              <input
                type="number"
                step="1000"
                value={form.price}
                onChange={(e) => setForm({ ...form, price: Number(e.target.value) })}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg font-black text-emerald-800 text-sm"
              />
            </div>
            <div>
              <label className="block font-bold text-slate-700 mb-1">Đơn vị tính</label>
              <input
                type="text"
                value={form.unit}
                onChange={(e) => setForm({ ...form, unit: e.target.value })}
                placeholder="Túi 500g, Hộp 1kg, Kg..."
                className="w-full px-3 py-2 border border-slate-300 rounded-lg font-bold"
              />
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
              className="px-5 py-2 bg-emerald-700 text-white rounded-lg font-extrabold hover:bg-emerald-800 shadow-md cursor-pointer"
            >
              {isPending ? 'Đang tạo...' : 'Lưu sản phẩm'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
