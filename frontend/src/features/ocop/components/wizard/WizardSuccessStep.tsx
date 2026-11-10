import React from 'react';
import { CheckCircle2 } from 'lucide-react';

interface WizardSuccessStepProps {
  dossierCode: string;
  productName: string;
  onFinish: () => void;
}

export const WizardSuccessStep: React.FC<WizardSuccessStepProps> = ({
  dossierCode,
  productName,
  onFinish,
}) => {
  return (
    <div className="bg-white border border-slate-200 rounded-2xl p-8 shadow-xs text-center space-y-4 animate-fade-in">
      <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto">
        <CheckCircle2 className="w-10 h-10 stroke-[2.5]" />
      </div>
      <h2 className="text-xl font-black text-slate-900">Hồ sơ OCOP đã được nộp thành công!</h2>
      <p className="text-xs text-slate-500 max-w-md mx-auto leading-relaxed">
        Hồ sơ mã <strong>{dossierCode}</strong> ({productName}) đã được chuyển đến UBND và Hội đồng Đánh giá OCOP có thẩm quyền theo QĐ 148/QĐ-TTg.
      </p>

      <div className="pt-2 flex justify-center gap-3">
        <button
          type="button"
          onClick={onFinish}
          className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs rounded-xl shadow-xs cursor-pointer"
        >
          Xem danh sách hồ sơ OCOP
        </button>
      </div>
    </div>
  );
};
