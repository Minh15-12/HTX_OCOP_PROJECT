import React from 'react';
import { Award, ChevronRight } from 'lucide-react';
import { WizardFormData } from './wizardTypes';

interface WizardProductStepProps {
  formData: WizardFormData;
  setFormData: React.Dispatch<React.SetStateAction<WizardFormData>>;
  onNext: () => void;
  onBack: () => void;
}

export const WizardProductStep: React.FC<WizardProductStepProps> = ({
  formData,
  setFormData,
  onNext,
  onBack,
}) => {
  return (
    <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs space-y-6">
      <div className="space-y-4">
        <h3 className="font-black text-slate-900 text-sm border-b pb-2 flex items-center gap-2">
          <Award className="w-4 h-4 text-emerald-600" /> 2. Thông tin sản phẩm đăng ký đánh giá
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs font-medium">
          <div className="md:col-span-2">
            <label className="block text-slate-700 font-bold mb-1">Tên sản phẩm OCOP *</label>
            <input
              type="text"
              value={formData.productName}
              onChange={(e) => setFormData({ ...formData, productName: e.target.value })}
              className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 font-black text-sm focus:bg-white focus:ring-2 focus:ring-emerald-500 focus:outline-none"
            />
          </div>
          <div>
            <label className="block text-slate-700 font-bold mb-1">Mã sản phẩm</label>
            <input
              type="text"
              value={formData.productCode}
              onChange={(e) => setFormData({ ...formData, productCode: e.target.value })}
              className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 font-mono font-bold"
            />
          </div>
          <div>
            <label className="block text-slate-700 font-bold mb-1">Phân nhóm sản phẩm (QĐ 148)</label>
            <input
              type="text"
              value={formData.category}
              onChange={(e) => setFormData({ ...formData, category: e.target.value })}
              className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-emerald-900 font-bold"
            />
          </div>
          <div className="md:col-span-2">
            <label className="block text-slate-700 font-bold mb-1">Vùng nguyên liệu canh tác</label>
            <input
              type="text"
              value={formData.rawLocation}
              onChange={(e) => setFormData({ ...formData, rawLocation: e.target.value })}
              className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-800"
            />
          </div>
          <div>
            <label className="block text-slate-700 font-bold mb-1">Quy mô diện tích (ha)</label>
            <input
              type="text"
              value={formData.area}
              onChange={(e) => setFormData({ ...formData, area: e.target.value })}
              className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 font-bold"
            />
          </div>
          <div>
            <label className="block text-slate-700 font-bold mb-1">Sản lượng bình quân / năm</label>
            <input
              type="text"
              value={formData.yield}
              onChange={(e) => setFormData({ ...formData, yield: e.target.value })}
              className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 font-bold"
            />
          </div>
        </div>
      </div>

      <div className="flex justify-between pt-4 border-t">
        <button
          type="button"
          onClick={onBack}
          className="px-5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl cursor-pointer"
        >
          Quay lại
        </button>
        <button
          type="button"
          onClick={onNext}
          className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs rounded-xl shadow-xs inline-flex items-center gap-1.5 cursor-pointer"
        >
          Tiếp tục Bước 3 <ChevronRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
