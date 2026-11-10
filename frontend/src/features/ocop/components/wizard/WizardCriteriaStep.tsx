import React, { useState } from 'react';
import { ShieldCheck, Sparkles, CheckCircle2, ChevronRight } from 'lucide-react';
import { OCOP_QD148_CRITERIA_DATA, calculateOcopScores } from '../../data/ocopQd148Data';
import { RealtimeProgressBar } from '../RealtimeProgressBar';
import { FarmerCriterionCard } from '../FarmerCriterionCard';

interface WizardCriteriaStepProps {
  scores: Record<string, number>;
  onSelectScore: (criterionCode: string, score: number) => void;
  onApplyAllSmartSuggestions: () => void;
  smartAppliedNotification: string | null;
  calculation: ReturnType<typeof calculateOcopScores>;
  evidenceCountMap: Record<string, number>;
  onNext: () => void;
  onBack: () => void;
}

export const WizardCriteriaStep: React.FC<WizardCriteriaStepProps> = ({
  scores,
  onSelectScore,
  onApplyAllSmartSuggestions,
  smartAppliedNotification,
  calculation,
  evidenceCountMap,
  onNext,
  onBack,
}) => {
  const [expandedGroup, setExpandedGroup] = useState<'GA' | 'GB' | 'GC' | 'ALL'>('ALL');

  return (
    <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs space-y-6 animate-fade-in">
      {/* Header with 1-Click Smart Suggestion Button */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b pb-4">
        <div>
          <h3 className="font-black text-slate-900 text-sm flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-600" /> 4. Tự đánh giá & Chấm điểm 11 Tiêu chí (QĐ 148/QĐ-TTg)
          </h3>
          <p className="text-[11.5px] text-slate-500 mt-0.5">
            Nông dân chủ động chạm chọn điểm từng tiêu chí hoặc áp dụng gợi ý tự động từ dữ liệu HTX.
          </p>
        </div>

        <button
          type="button"
          onClick={onApplyAllSmartSuggestions}
          className="px-4 py-2 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white font-black text-xs rounded-xl shadow-md flex items-center gap-2 transition-all active:scale-98 cursor-pointer"
        >
          <Sparkles className="w-4 h-4 text-amber-200 animate-spin" />
          💡 Gợi ý thông minh từ dữ liệu HTX (1 Chạm)
        </button>
      </div>

      {/* Notification if applied */}
      {smartAppliedNotification && (
        <div className="p-3 bg-emerald-50 border border-emerald-300 rounded-xl text-xs text-emerald-900 flex items-center gap-2 animate-fade-in font-bold">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{smartAppliedNotification}</span>
        </div>
      )}

      {/* Reactive Real-time Progress Bar & Star Rating Component */}
      <RealtimeProgressBar calculation={calculation} targetStar={4} />

      {/* Group Filter Tabs */}
      <div className="flex gap-2 border-b border-slate-200 pb-2 text-xs font-bold overflow-x-auto">
        <button
          type="button"
          onClick={() => setExpandedGroup('ALL')}
          className={`px-3 py-1.5 rounded-xl transition-all whitespace-nowrap cursor-pointer ${
            expandedGroup === 'ALL'
              ? 'bg-slate-900 text-white shadow-xs'
              : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
          }`}
        >
          Tất cả 11 tiêu chí (100đ)
        </button>
        <button
          type="button"
          onClick={() => setExpandedGroup('GA')}
          className={`px-3 py-1.5 rounded-xl transition-all whitespace-nowrap cursor-pointer ${
            expandedGroup === 'GA'
              ? 'bg-emerald-700 text-white shadow-xs'
              : 'bg-emerald-50 text-emerald-800 hover:bg-emerald-100'
          }`}
        >
          Phần A: Sản phẩm & Cộng đồng (40đ)
        </button>
        <button
          type="button"
          onClick={() => setExpandedGroup('GB')}
          className={`px-3 py-1.5 rounded-xl transition-all whitespace-nowrap cursor-pointer ${
            expandedGroup === 'GB'
              ? 'bg-blue-700 text-white shadow-xs'
              : 'bg-blue-50 text-blue-800 hover:bg-blue-100'
          }`}
        >
          Phần B: Khả năng Tiếp thị (25đ)
        </button>
        <button
          type="button"
          onClick={() => setExpandedGroup('GC')}
          className={`px-3 py-1.5 rounded-xl transition-all whitespace-nowrap cursor-pointer ${
            expandedGroup === 'GC'
              ? 'bg-purple-700 text-white shadow-xs'
              : 'bg-purple-50 text-purple-800 hover:bg-purple-100'
          }`}
        >
          Phần C: Chất lượng Sản phẩm (35đ)
        </button>
      </div>

      {/* Interactive Farmer Criterion Cards List */}
      <div className="space-y-4">
        {OCOP_QD148_CRITERIA_DATA
          .filter((group) => expandedGroup === 'ALL' || expandedGroup === group.code)
          .map((group) => (
            <div key={group.code} className="space-y-3">
              <div className="flex items-center justify-between bg-slate-50 px-3.5 py-2 rounded-xl border border-slate-200">
                <span className="font-black text-xs text-slate-900 uppercase tracking-wide">
                  {group.name}: {group.fullName} (Tối đa {group.maxScore.toFixed(1)}đ)
                </span>
                <span className="text-xs font-mono font-bold text-emerald-800">
                  Đạt: {group.code === 'GA' ? calculation.partAScore.toFixed(1) : group.code === 'GB' ? calculation.partBScore.toFixed(1) : calculation.partCScore.toFixed(1)}đ
                </span>
              </div>

              <div className="space-y-3 pl-1">
                {group.indicators.map((ind) => (
                  <FarmerCriterionCard
                    key={ind.code}
                    indicator={ind}
                    selectedScore={scores[ind.code]}
                    onSelectScore={(newScore) => onSelectScore(ind.code, newScore)}
                    hasEvidence={(evidenceCountMap[ind.code] || 0) > 0}
                  />
                ))}
              </div>
            </div>
          ))}
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
          Tiếp tục Bước 5 (Xác nhận) <ChevronRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
