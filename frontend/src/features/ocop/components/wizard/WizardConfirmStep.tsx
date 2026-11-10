import React from 'react';
import { CheckCircle2, Star, AlertTriangle, Send } from 'lucide-react';
import { calculateOcopScores } from '../../data/ocopQd148Data';
import { WizardFormData } from './wizardTypes';

interface WizardConfirmStepProps {
  formData: WizardFormData;
  evidencesCount: number;
  calculation: ReturnType<typeof calculateOcopScores>;
  activeCooperativeName: string;
  onSubmit: () => void;
  onBack: () => void;
}

export const WizardConfirmStep: React.FC<WizardConfirmStepProps> = ({
  formData,
  evidencesCount,
  calculation,
  activeCooperativeName,
  onSubmit,
  onBack,
}) => {
  return (
    <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs space-y-6 animate-fade-in">
      <div className="border-b pb-3">
        <h3 className="font-black text-slate-900 text-sm flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600" /> 5. Rà soát & Xác nhận hồ sơ trước khi nộp
        </h3>
        <p className="text-[11.5px] text-slate-500 mt-0.5">
          Rà soát tổng hợp điểm, điều kiện khống chế và tính pháp lý của hồ sơ.
        </p>
      </div>

      <div className="space-y-3">
        <div className="p-3.5 bg-emerald-50/70 border border-emerald-200 rounded-xl flex items-center justify-between text-xs">
          <div className="flex items-center gap-2.5 font-bold text-emerald-900">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>Thông tin chủ thể HTX ({activeCooperativeName || formData.subjectName})</span>
          </div>
          <span className="pill-badge pill-green">Đã hoàn thành</span>
        </div>

        <div className="p-3.5 bg-emerald-50/70 border border-emerald-200 rounded-xl flex items-center justify-between text-xs">
          <div className="flex items-center gap-2.5 font-bold text-emerald-900">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>Sản phẩm OCOP ({formData.productName}{formData.area ? ` - ${formData.area}` : ''})</span>
          </div>
          <span className="pill-badge pill-green">Đã hoàn thành</span>
        </div>

        <div className="p-3.5 bg-emerald-50/70 border border-emerald-200 rounded-xl flex items-center justify-between text-xs">
          <div className="flex items-center gap-2.5 font-bold text-emerald-900">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>Kho minh chứng số hóa ({evidencesCount} tài liệu kèm mã băm SHA-256)</span>
          </div>
          <span className="pill-badge pill-green">{evidencesCount} tài liệu hợp lệ</span>
        </div>

        <div className="p-3.5 bg-amber-50/80 border border-amber-200 rounded-xl flex items-center justify-between text-xs">
          <div className="flex items-center gap-2.5 font-bold text-amber-900">
            <Star className="w-4 h-4 text-amber-500 fill-amber-500 shrink-0" />
            <span>Tổng điểm tự chấm: <strong>{calculation.totalScore.toFixed(1)} / 100đ</strong> &bull; Đề xuất {calculation.starLabel}</span>
          </div>
          <span className="pill-badge pill-amber">{calculation.totalScore.toFixed(1)}đ</span>
        </div>

        {/* Mandatory Issues Alert in Step 5 */}
        {!calculation.isPassingMandatory && calculation.mandatoryIssues.length > 0 && (
          <div className="p-3.5 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-900 space-y-1.5 animate-fade-in">
            <div className="flex items-center gap-2 font-bold text-rose-800">
              <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
              <span>Cảnh báo điều kiện khống chế chưa đạt (QĐ 148/QĐ-TTg):</span>
            </div>
            <ul className="list-disc pl-5 space-y-0.5 text-[11.5px] font-medium text-rose-800">
              {calculation.mandatoryIssues.map((issue, idx) => (
                <li key={idx}>{issue}</li>
              ))}
            </ul>
          </div>
        )}
      </div>

      {/* Legal Confirmation Checkbox */}
      <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl text-xs space-y-2">
        <label className="flex items-start gap-2 cursor-pointer font-bold text-slate-800">
          <input type="checkbox" defaultChecked className="mt-0.5 rounded text-emerald-600 focus:ring-emerald-500" />
          <span>
            Tôi là <strong>{formData.repName}</strong> (Giám đốc {activeCooperativeName || formData.subjectName}), cam đoan toàn bộ thông tin kê khai và tài liệu minh chứng trong hồ sơ là hoàn toàn trung thực, chính xác và chịu mọi trách nhiệm trước pháp luật.
          </span>
        </label>
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
          onClick={onSubmit}
          className="px-6 py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white font-extrabold text-xs rounded-xl shadow-md inline-flex items-center gap-2 active:scale-98 transition-all cursor-pointer"
        >
          <Send className="w-4 h-4" /> Nộp hồ sơ thẩm định chính thức
        </button>
      </div>
    </div>
  );
};
