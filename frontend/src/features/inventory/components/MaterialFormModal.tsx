import React, { useState } from 'react';
import { X } from 'lucide-react';
import { Material, MaterialCategory } from '../../../types/inventory';

const CATEGORIES: MaterialCategory[] = ['Phân bón', 'Thuốc BVTV Sinh học', 'Vật tư đóng gói', 'Nông cụ'];

interface MaterialFormModalProps {
  mode: 'add' | 'edit';
  initialData?: Partial<Material>;
  onClose: () => void;
  onSave: (data: Partial<Material>) => void;
}

export const MaterialFormModal: React.FC<MaterialFormModalProps> = ({
  mode,
  initialData = {},
  onClose,
  onSave,
}) => {
  const [formData, setFormData] = useState<Partial<Material>>({
    name: '',
    category: 'Phân bón',
    unit: 'kg',
    stockQty: 0,
    minSafetyStock: 0,
    unitPrice: 0,
    supplierName: '',
    warehouseName: '',
    expiryDate: '',
    description: '',
    status: 'ACTIVE',
    ...initialData,
  });

  const isValid = Boolean(formData.name?.trim() && formData.unit?.trim());

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs animate-fade-in"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="w-full max-w-lg bg-white rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        <div className="flex items-start justify-between px-5 pt-4 pb-3 border-b border-slate-200">
          <div>
            <h3 className="text-base font-extrabold text-slate-900">
              {mode === 'add' ? 'Thêm mới Vật tư / Nông cụ' : 'Chỉnh sửa Vật tư'}
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              {mode === 'add'
                ? 'Khai báo vật tư mới vào danh mục quản lý kho HTX'
                : `Mã vật tư: ${initialData.id || initialData.code}`}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-600 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="px-5 py-4 overflow-y-auto space-y-3.5 text-sm">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Tên vật tư - nông cụ (*)
            </label>
            <input
              type="text"
              value={formData.name || ''}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="VD: Phân bón NPK 16-16-8 Đầu Trâu"
              className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500 text-xs font-medium"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Phân loại (*)</label>
              <select
                value={formData.category || 'Phân bón'}
                onChange={(e) =>
                  setFormData({ ...formData, category: e.target.value as MaterialCategory })
                }
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500 text-xs font-medium"
              >
                {CATEGORIES.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Đơn vị tính (*)
              </label>
              <input
                type="text"
                value={formData.unit || ''}
                onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
                placeholder="kg / cái / chai (1L)"
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500 text-xs font-medium"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Số lượng tồn kho ban đầu
              </label>
              <input
                type="number"
                min="0"
                value={formData.stockQty ?? 0}
                onChange={(e) =>
                  setFormData({ ...formData, stockQty: Number(e.target.value) || 0 })
                }
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-slate-900 focus:bg-white focus:outline-none font-mono text-xs font-bold"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Ngưỡng tồn an toàn (*)
              </label>
              <input
                type="number"
                min="0"
                value={formData.minSafetyStock ?? 0}
                onChange={(e) =>
                  setFormData({ ...formData, minSafetyStock: Number(e.target.value) || 0 })
                }
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-slate-900 focus:bg-white focus:outline-none font-mono text-xs font-bold"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Đơn giá tham chiếu (VNĐ)
              </label>
              <input
                type="number"
                min="0"
                value={formData.unitPrice ?? 0}
                onChange={(e) =>
                  setFormData({ ...formData, unitPrice: Number(e.target.value) || 0 })
                }
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-slate-900 focus:bg-white focus:outline-none font-mono text-xs font-bold"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Hạn sử dụng (HSD)
              </label>
              <input
                type="date"
                value={formData.expiryDate || ''}
                onChange={(e) => setFormData({ ...formData, expiryDate: e.target.value })}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-slate-900 focus:bg-white focus:outline-none text-xs"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Nhà cung cấp
              </label>
              <input
                type="text"
                value={formData.supplierName || ''}
                onChange={(e) => setFormData({ ...formData, supplierName: e.target.value })}
                placeholder="Công ty Bio Việt..."
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-slate-900 focus:bg-white focus:outline-none text-xs"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Tên kho lưu trữ
              </label>
              <input
                type="text"
                value={formData.warehouseName || ''}
                onChange={(e) => setFormData({ ...formData, warehouseName: e.target.value })}
                placeholder="Kho vật tư chính..."
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-slate-900 focus:bg-white focus:outline-none text-xs"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Ghi chú & Đặc tả kỹ thuật
            </label>
            <textarea
              rows={2}
              value={formData.description || ''}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Ghi chú thành phần, chỉ dẫn bón lót hoặc cách bảo quản..."
              className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-slate-900 focus:bg-white focus:outline-none text-xs"
            />
          </div>

          <div className="flex justify-end gap-2 pt-3 border-t border-slate-200">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-white hover:bg-slate-100 border border-slate-300 rounded-xl text-slate-700 font-bold text-xs transition-colors"
            >
              Hủy bỏ
            </button>
            <button
              type="button"
              onClick={() => onSave(formData)}
              disabled={!isValid}
              className="px-5 py-2 bg-emerald-700 hover:bg-emerald-800 disabled:opacity-50 text-white font-bold text-xs rounded-xl shadow-xs transition-all active:scale-98"
            >
              {mode === 'add' ? 'Thêm mới vật tư' : 'Lưu cập nhật'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
