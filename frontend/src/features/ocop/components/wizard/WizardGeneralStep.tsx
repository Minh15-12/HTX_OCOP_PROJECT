import React from 'react';
import { FileText, Building2, ChevronRight } from 'lucide-react';
import { WizardFormData } from './wizardTypes';

interface WizardGeneralStepProps {
  formData: WizardFormData;
  setFormData: React.Dispatch<React.SetStateAction<WizardFormData>>;
  onNext: () => void;
}

export const WizardGeneralStep: React.FC<WizardGeneralStepProps> = ({
  formData,
  setFormData,
  onNext,
}) => {
  return (
    <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs space-y-6">
      {/* 1.1 Dossier & Evaluation Info */}
      <div className="space-y-4">
        <h3 className="font-black text-slate-900 text-sm border-b pb-2 flex items-center gap-2">
          <FileText className="w-4 h-4 text-emerald-600" /> 1.1 Thông tin hồ sơ & Đợt đánh giá
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-xs font-medium">
          <div>
            <label className="block text-slate-700 font-bold mb-1">Mã hồ sơ *</label>
            <input
              type="text"
              value={formData.dossierCode}
              onChange={(e) => setFormData({ ...formData, dossierCode: e.target.value })}
              className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 font-mono font-bold focus:bg-white focus:ring-2 focus:ring-emerald-500 focus:outline-none"
            />
          </div>
          <div>
            <label className="block text-slate-700 font-bold mb-1">Năm đánh giá *</label>
            <input
              type="text"
              value={formData.evalYear}
              onChange={(e) => setFormData({ ...formData, evalYear: e.target.value })}
              className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 font-bold focus:bg-white focus:ring-2 focus:ring-emerald-500 focus:outline-none"
            />
          </div>
          <div>
            <label className="block text-slate-700 font-bold mb-1">Đợt đánh giá</label>
            <input
              type="text"
              value={formData.evalBatch}
              onChange={(e) => setFormData({ ...formData, evalBatch: e.target.value })}
              className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 focus:bg-white focus:ring-2 focus:ring-emerald-500 focus:outline-none"
            />
          </div>
          <div>
            <label className="block text-slate-700 font-bold mb-1">Cấp đánh giá mục tiêu</label>
            <input
              type="text"
              value={formData.evalLevel}
              onChange={(e) => setFormData({ ...formData, evalLevel: e.target.value })}
              className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 font-bold focus:bg-white focus:ring-2 focus:ring-emerald-500 focus:outline-none"
            />
          </div>
        </div>
      </div>

      {/* 1.2 Cooperative Subject Info */}
      <div className="space-y-4">
        <h3 className="font-black text-slate-900 text-sm border-b pb-2 flex items-center gap-2">
          <Building2 className="w-4 h-4 text-emerald-600" /> 1.2 Thông tin chủ thể HTX
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs font-medium">
          <div className="md:col-span-2">
            <label className="block text-slate-700 font-bold mb-1">Tên Hợp tác xã (Chủ thể) *</label>
            <input
              type="text"
              value={formData.subjectName}
              onChange={(e) => setFormData({ ...formData, subjectName: e.target.value })}
              className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 font-bold focus:bg-white focus:ring-2 focus:ring-emerald-500 focus:outline-none"
            />
          </div>
          <div>
            <label className="block text-slate-700 font-bold mb-1">Người đại diện hợp pháp *</label>
            <input
              type="text"
              value={formData.repName}
              onChange={(e) => setFormData({ ...formData, repName: e.target.value })}
              className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 font-bold focus:bg-white focus:ring-2 focus:ring-emerald-500 focus:outline-none"
            />
          </div>
          <div>
            <label className="block text-slate-700 font-bold mb-1">Chức vụ đại diện</label>
            <input
              type="text"
              value={formData.repRole}
              onChange={(e) => setFormData({ ...formData, repRole: e.target.value })}
              className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:bg-white focus:ring-2 focus:ring-emerald-500 focus:outline-none"
            />
          </div>
          <div className="md:col-span-2">
            <label className="block text-slate-700 font-bold mb-1">Địa chỉ trụ sở</label>
            <input
              type="text"
              value={formData.address}
              onChange={(e) => setFormData({ ...formData, address: e.target.value })}
              className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:bg-white focus:ring-2 focus:ring-emerald-500 focus:outline-none"
            />
          </div>
        </div>
      </div>

      <div className="flex justify-end pt-4 border-t">
        <button
          type="button"
          onClick={onNext}
          className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs rounded-xl shadow-xs inline-flex items-center gap-1.5 cursor-pointer"
        >
          Tiếp tục Bước 2 <ChevronRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
