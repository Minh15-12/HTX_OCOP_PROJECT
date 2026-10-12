import React from 'react';
import { ScoreCalculationResult } from '../data/ocopQd148Data';
import { Star, ShieldCheck, AlertTriangle, CheckCircle2 } from 'lucide-react';

interface RealtimeProgressBarProps {
  calculation: ScoreCalculationResult;
  className?: string;
  targetStar?: number;
}

export const RealtimeProgressBar: React.FC<RealtimeProgressBarProps> = ({
  calculation,
  className = '',
  targetStar = 4,
}) => {
  const {
    totalScore,
    starRating,
    starLabel,
    completionPercentage,
    isPassingMandatory,
    mandatoryIssues,
    partAScore,
    partBScore,
    partCScore,
    scoredCriteriaCount,
    validEvidenceCount,
    totalIndicatorsCount,
  } = calculation;

  return (
    <div className={`bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-4 ${className}`}>
      {/* Top row: Completion % and Star Prediction */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <h4 className="text-sm font-black text-slate-900 tracking-tight">
              Tiến độ hoàn thiện hồ sơ OCOP
            </h4>
            <span
              className={`px-2 py-0.5 rounded-full text-xs font-black ${
                completionPercentage >= 100
                  ? 'bg-emerald-100 text-emerald-800'
                  : 'bg-amber-100 text-amber-900'
              }`}
            >
              {completionPercentage}% Hoàn thành
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Đã chấm <strong>{scoredCriteriaCount}/{totalIndicatorsCount}</strong> chỉ tiêu &bull; Có <strong>{validEvidenceCount}/{totalIndicatorsCount}</strong> minh chứng số
          </p>
        </div>

        {/* Projected Star badge */}
        <div className="flex items-center gap-2.5 bg-slate-50 border border-slate-200 px-3.5 py-2 rounded-xl">
          <div className="flex items-center">
            {[1, 2, 3, 4, 5].map((s) => (
              <Star
                key={s}
                className={`w-4 h-4 ${
                  s <= starRating
                    ? 'text-amber-400 fill-amber-400'
                    : 'text-slate-300'
                }`}
              />
            ))}
          </div>
          <div className="text-right">
            <span className="block text-xs font-black text-slate-900">
              {totalScore.toFixed(1)} / 100đ
            </span>
            <span className="block text-[11px] font-bold text-emerald-800">
              {starLabel}
            </span>
          </div>
        </div>
      </div>

      {/* Reactive Progress Bar */}
      <div className="space-y-1.5">
        <div className="w-full h-3 bg-slate-100 rounded-full overflow-hidden p-0.5 border border-slate-200">
          <div
            className={`h-full rounded-full transition-all duration-500 ease-out ${
              completionPercentage >= 100
                ? 'bg-gradient-to-r from-emerald-500 to-emerald-600'
                : completionPercentage >= 60
                ? 'bg-gradient-to-r from-amber-400 to-emerald-500'
                : 'bg-gradient-to-r from-rose-400 to-amber-500'
            }`}
            style={{ width: `${Math.min(completionPercentage, 100)}%` }}
          />
        </div>
        <div className="flex justify-between text-[11px] font-medium text-slate-500">
          <span>0%</span>
          <span>Khởi tạo</span>
          <span>50% (Đủ điểm chấm)</span>
          <span>Đủ minh chứng</span>
          <span className="font-bold text-emerald-700">100% Đủ điều kiện nộp</span>
        </div>
      </div>

      {/* Group Score Breakdown (Part A: 40đ, Part B: 25đ, Part C: 35đ) */}
      <div className="grid grid-cols-3 gap-2 text-center text-xs pt-1">
        <div className="bg-emerald-50/60 border border-emerald-100 rounded-xl p-2.5">
          <span className="block text-[11px] font-bold text-slate-600">Phần A (Sản phẩm)</span>
          <span className="block font-black text-emerald-900 text-sm mt-0.5">
            {partAScore.toFixed(1)} <span className="text-slate-400 text-xs font-normal">/ 40đ</span>
          </span>
        </div>
        <div className="bg-blue-50/60 border border-blue-100 rounded-xl p-2.5">
          <span className="block text-[11px] font-bold text-slate-600">Phần B (Tiếp thị)</span>
          <span className="block font-black text-blue-900 text-sm mt-0.5">
            {partBScore.toFixed(1)} <span className="text-slate-400 text-xs font-normal">/ 25đ</span>
          </span>
        </div>
        <div className="bg-purple-50/60 border border-purple-100 rounded-xl p-2.5">
          <span className="block text-[11px] font-bold text-slate-600">Phần C (Chất lượng)</span>
          <span className="block font-black text-purple-900 text-sm mt-0.5">
            {partCScore.toFixed(1)} <span className="text-slate-400 text-xs font-normal">/ 35đ</span>
          </span>
        </div>
      </div>

      {/* Mandatory Condition Alerts if any */}
      {!isPassingMandatory && mandatoryIssues.length > 0 && (
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 text-xs text-amber-900 space-y-1.5 animate-fade-in">
          <div className="flex items-center gap-1.5 font-black text-amber-800">
            <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
            <span>Cảnh báo điều kiện khống chế (Cần hoàn tất trước khi nộp):</span>
          </div>
          <ul className="list-disc pl-5 space-y-0.5 text-[11.5px] font-medium text-amber-900">
            {mandatoryIssues.map((issue, idx) => (
              <li key={idx}>{issue}</li>
            ))}
          </ul>
        </div>
      )}

      {isPassingMandatory && completionPercentage >= 100 && (
        <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-3 text-xs text-emerald-900 flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span className="font-bold">
            Hồ sơ đã đạt 100% tiến độ và thỏa mãn toàn bộ điều kiện khống chế. Sẵn sàng nộp thẩm định!
          </span>
        </div>
      )}
    </div>
  );
};
