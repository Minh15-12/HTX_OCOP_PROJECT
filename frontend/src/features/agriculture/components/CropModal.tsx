import React, { useState, useEffect } from 'react';
import { X, Sprout, Check } from 'lucide-react';
import type { CropItem } from '@/types/agriculture';

interface CropModalProps {
  isOpen: boolean;
  onClose: () => void;
  cropToEdit?: CropItem | null;
  onSubmit: (crop: Omit<CropItem, 'id'>, id?: string) => Promise<void>;
  isSubmitting?: boolean;
}

export const CropModal: React.FC<CropModalProps> = ({
  isOpen,
  onClose,
  cropToEdit,
  onSubmit,
  isSubmitting = false,
}) => {
  const [cropCode, setCropCode] = useState('');
  const [name, setName] = useState('');
  const [scientificName, setScientificName] = useState('');
  const [category, setCategory] = useState('Rau củ quả OCOP');
  const [growthDuration, setGrowthDuration] = useState<number>(120);
  const [yieldTonHa, setYieldTonHa] = useState<number>(75);
  const [defaultPhi, setDefaultPhi] = useState<number>(7);
  const [origin, setOrigin] = useState('');
  const [description, setDescription] = useState('');
  const [status, setStatus] = useState<'ACTIVE' | 'INACTIVE'>('ACTIVE');

  useEffect(() => {
    if (cropToEdit) {
      setCropCode(cropToEdit.crop_code);
      setName(cropToEdit.name);
      setScientificName(cropToEdit.scientific_name || '');
      setCategory(cropToEdit.category || 'Rau củ quả OCOP');
      setGrowthDuration(cropToEdit.growth_duration_days || 120);
      setYieldTonHa(cropToEdit.standard_yield_ton_ha || 75);
      setDefaultPhi(cropToEdit.default_phi_days || 7);
      setOrigin(cropToEdit.origin || '');
      setDescription(cropToEdit.description || '');
      setStatus(cropToEdit.status || 'ACTIVE');
    } else {
      setCropCode(`CROP-${Date.now().toString().slice(-4)}`);
      setName('');
      setScientificName('');
      setCategory('Rau củ quả OCOP');
      setGrowthDuration(120);
      setYieldTonHa(75);
      setDefaultPhi(7);
      setOrigin('Hạt giống F1 nhập khẩu');
      setDescription('');
      setStatus('ACTIVE');
    }
  }, [cropToEdit, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      alert('Vui lòng nhập tên giống cây trồng');
      return;
    }
    await onSubmit(
      {
        crop_code: cropCode.trim().toUpperCase(),
        name: name.trim(),
        scientific_name: scientificName.trim(),
        category,
        growth_duration_days: Number(growthDuration) || 120,
        standard_yield_ton_ha: Number(yieldTonHa) || 75,
        default_phi_days: Number(defaultPhi) || 7,
        origin: origin.trim(),
        description: description.trim(),
        status,
      },
      cropToEdit?.id
    );
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 animate-fade-in text-[13px]"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-lg p-6 space-y-4 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between border-b pb-3 border-slate-200">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-emerald-100 text-emerald-800">
              <Sprout className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-black text-slate-900 text-sm">
                {cropToEdit ? 'Chỉnh sửa Giống Cây Trồng' : 'Thêm Giống Cây Trồng Mới'}
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Danh mục giống chuẩn phục vụ lập kế hoạch mùa vụ và VietGAP
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1 text-slate-400 hover:text-slate-700 cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3.5 text-xs">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-700 font-bold mb-1">Mã giống cây *</label>
              <input
                type="text"
                value={cropCode}
                onChange={(e) => setCropCode(e.target.value)}
                placeholder="VD: CROP-PALERMO-RED"
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-mono font-bold text-slate-800 uppercase"
                required
              />
            </div>
            <div>
              <label className="block text-slate-700 font-bold mb-1">Nhóm ngành hàng *</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-800"
              >
                <option value="Rau củ quả OCOP">Rau củ quả OCOP</option>
                <option value="Cây ăn trái đặc sản">Cây ăn trái đặc sản</option>
                <option value="Dược liệu & Nấm">Dược liệu & Nấm</option>
                <option value="Hoa & Cây cảnh">Hoa & Cây cảnh</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-slate-700 font-bold mb-1">Tên giống cây trồng *</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="VD: Ớt Chuông Sweet Palermo Đỏ Đà Lạt"
              className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-800"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-700 font-bold mb-1">Tên khoa học</label>
              <input
                type="text"
                value={scientificName}
                onChange={(e) => setScientificName(e.target.value)}
                placeholder="VD: Capsicum annuum var. grossum"
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-serif italic text-slate-700"
              />
            </div>
            <div>
              <label className="block text-slate-700 font-bold mb-1">Xuất xứ hạt giống</label>
              <input
                type="text"
                value={origin}
                onChange={(e) => setOrigin(e.target.value)}
                placeholder="VD: Rijk Zwaan (Hà Lan)"
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-medium text-slate-800"
              />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block text-slate-700 font-bold mb-1">Chu kỳ sinh trưởng (ngày)</label>
              <input
                type="number"
                min={30}
                value={growthDuration}
                onChange={(e) => setGrowthDuration(Number(e.target.value))}
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-mono text-slate-800"
              />
            </div>
            <div>
              <label className="block text-slate-700 font-bold mb-1">Năng suất chuẩn (tấn/ha)</label>
              <input
                type="number"
                min={1}
                value={yieldTonHa}
                onChange={(e) => setYieldTonHa(Number(e.target.value))}
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-mono text-slate-800"
              />
            </div>
            <div>
              <label className="block text-slate-700 font-bold mb-1">Cách ly PHI chuẩn (ngày)</label>
              <input
                type="number"
                min={0}
                value={defaultPhi}
                onChange={(e) => setDefaultPhi(Number(e.target.value))}
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-mono text-emerald-800 font-bold"
              />
            </div>
          </div>

          <div>
            <label className="block text-slate-700 font-bold mb-1">Mô tả đặc tính & Quy cách</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={2}
              placeholder="Độ ngọt Brix cam kết, khả năng chống chịu sâu bệnh..."
              className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-medium text-slate-800"
            />
          </div>

          <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl cursor-pointer"
            >
              Hủy
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-5 py-2 bg-emerald-700 hover:bg-emerald-800 text-white font-extrabold text-xs rounded-xl shadow-xs cursor-pointer active:scale-98 disabled:opacity-50"
            >
              {isSubmitting ? 'Đang lưu...' : cropToEdit ? 'Cập nhật' : 'Thêm giống cây'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
