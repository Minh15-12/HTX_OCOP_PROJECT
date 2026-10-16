import React, { useState } from 'react';
import { 
  CriterionIndicator, 
  getCriterionBadgeStatus 
} from '../data/ocopQd148Data';
import { CriterionStatusBadge } from './CriterionStatusBadge';
import { SmartSuggestionButton } from './SmartSuggestionButton';
import { 
  Info, 
  CheckCircle, 
  HelpCircle, 
  FileCheck, 
  Star, 
  AlertCircle, 
  ChevronDown, 
  ChevronUp, 
  Lightbulb 
} from 'lucide-react';

interface FarmerCriterionCardProps {
  indicator: CriterionIndicator;
  selectedScore: number | undefined;
  onSelectScore: (score: number) => void;
  hasEvidence?: boolean;
  onViewEvidence?: () => void;
  className?: string;
}

export const FarmerCriterionCard: React.FC<FarmerCriterionCardProps> = ({
  indicator,
  selectedScore,
  onSelectScore,
  hasEvidence = true,
  onViewEvidence,
  className = '',
}) => {
  const [showPlainHelp, setShowPlainHelp] = useState<boolean>(false);
  const badgeInfo = getCriterionBadgeStatus(indicator, selectedScore, hasEvidence);
  const isAppliedSuggestion = selectedScore === indicator.smartSuggestion.suggestedScore;

  return (
    <div
      id={`indicator-card-${indicator.code}`}
      className={`bg-white rounded-2xl border transition-all p-5 shadow-xs space-y-4 ${
        badgeInfo.status === 'RED'
          ? 'border-rose-300 ring-1 ring-rose-100'
          : badgeInfo.status === 'YELLOW'
          ? 'border-amber-200'
          : 'border-slate-200 hover:border-emerald-300'
      } ${className}`}
    >
      {/* Header: Indicator code, name, mandatory flag, tri-color status badge */}
      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3 border-b border-slate-100 pb-3">
        <div className="space-y-1">
          <div className="flex items-center flex-wrap gap-2">
            <span className="font-mono text-xs font-black text-emerald-800 bg-emerald-50 px-2.5 py-0.5 rounded-lg border border-emerald-200">
              {indicator.code}
            </span>
            <span className="text-xs font-bold text-slate-500">
              {indicator.criterionName}
            </span>
            {indicator.isMandatory && (
              <span
                title="Tiêu chí bắt buộc (Khống chế cứng) theo QĐ 148"
                className="inline-flex items-center gap-1 text-[11px] font-extrabold text-rose-700 bg-rose-50 px-2 py-0.5 rounded-md border border-rose-200"
              >
                <AlertCircle className="w-3 h-3" />
                Bắt buộc (*)
              </span>
            )}
          </div>
          <h4 className="text-sm font-black text-slate-900 leading-snug">
            {indicator.name}
          </h4>
        </div>

        {/* Right side status badge and max score */}
        <div className="flex sm:flex-col items-center sm:items-end justify-between sm:justify-center gap-1.5 shrink-0">
          <CriterionStatusBadge status={badgeInfo.status} label={badgeInfo.label} />
          <span className="text-xs font-bold text-slate-500">
            Tối đa: <strong className="text-emerald-800 font-mono text-sm">{indicator.maxScore.toFixed(1)}đ</strong>
          </span>
        </div>
      </div>

      {/* Mandatory alert warning if RED */}
      {indicator.isMandatory && badgeInfo.status === 'RED' && (
        <div className="p-3 bg-rose-50/90 border border-rose-200 rounded-xl text-xs text-rose-800 flex items-start gap-2 animate-fade-in">
          <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
          <div>
            <span className="font-bold">Lưu ý khống chế bắt buộc: </span>
            <span>{indicator.mandatoryReason || 'Tiêu chí bắt buộc cần có điểm > 0 và minh chứng hợp lệ để không bị đánh trượt sao OCOP.'}</span>
          </div>
        </div>
      )}

      {/* Farmer Plain-Language Explanation Accordion (Giải thích mộc mạc cho nông dân) */}
      <div className="border border-emerald-100 bg-emerald-50/40 rounded-xl overflow-hidden transition-all">
        <button
          type="button"
          onClick={() => setShowPlainHelp(!showPlainHelp)}
          className="w-full px-3.5 py-2.5 flex items-center justify-between text-left text-xs font-bold text-emerald-900 hover:bg-emerald-100/60 transition-colors"
        >
          <div className="flex items-center gap-2">
            <Lightbulb className="w-4 h-4 text-amber-500 shrink-0" />
            <span>🌾 Chú giải mộc mạc cho nhà nông: <strong>{indicator.plainExplanation.term}</strong></span>
          </div>
          {showPlainHelp ? (
            <ChevronUp className="w-4 h-4 text-emerald-700" />
          ) : (
            <ChevronDown className="w-4 h-4 text-emerald-700" />
          )}
        </button>

        {showPlainHelp && (
          <div className="p-3.5 text-xs text-slate-700 space-y-2.5 bg-white border-t border-emerald-100 animate-fade-in leading-relaxed">
            <div>
              <span className="font-bold text-slate-900">Giải thích dễ hiểu: </span>
              <span>{indicator.plainExplanation.explanation}</span>
            </div>
            <div className="p-2.5 bg-amber-50 border border-amber-200/80 rounded-lg text-amber-950 font-medium">
              <span className="font-bold text-amber-900">Lời khuyên nông dân: </span>
              {indicator.plainExplanation.farmerAdvice}
            </div>
            <div className="flex items-center gap-2 text-slate-600 text-[11.5px]">
              <FileCheck className="w-3.5 h-3.5 text-emerald-600" />
              <span>Minh chứng thực tế: <strong>{indicator.plainExplanation.exampleEvidence}</strong></span>
            </div>
          </div>
        )}
      </div>

      {/* Large Touch-Friendly Card-based Radio Options (>=48px touch targets) */}
      <div className="space-y-2">
        <label className="block text-xs font-bold text-slate-700">
          Chạm/Click chọn mức điểm tự chấm (Bà con HTX trực tiếp chọn mức phù hợp):
        </label>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
          {indicator.options.map((opt) => {
            const isSelected = selectedScore === opt.score;
            return (
              <button
                type="button"
                key={opt.score}
                onClick={() => onSelectScore(opt.score)}
                className={`min-h-[52px] p-3 rounded-xl border text-left transition-all flex items-start gap-3 active:scale-99 ${
                  isSelected
                    ? 'border-emerald-600 bg-emerald-50/80 ring-2 ring-emerald-500 shadow-xs'
                    : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50 bg-white'
                }`}
              >
                {/* Custom Large Radio Circle (>=24px) */}
                <div
                  className={`w-5 h-5 mt-0.5 rounded-full border-2 flex items-center justify-center shrink-0 transition-colors ${
                    isSelected ? 'border-emerald-600 bg-emerald-600 text-white' : 'border-slate-300 bg-white'
                  }`}
                >
                  {isSelected && <div className="w-2 h-2 rounded-full bg-white" />}
                </div>

                {/* Option text content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <span className={`text-xs font-black ${isSelected ? 'text-emerald-950' : 'text-slate-900'}`}>
                      {opt.label}
                    </span>
                    <span
                      className={`text-xs font-mono font-black px-2 py-0.5 rounded-md shrink-0 ${
                        isSelected
                          ? 'bg-emerald-600 text-white'
                          : 'bg-slate-100 text-slate-700'
                      }`}
                    >
                      {opt.score.toFixed(1)}đ
                    </span>
                  </div>
                  <p className="text-[11.5px] text-slate-500 mt-0.5 leading-snug">
                    {opt.description}
                  </p>
                  <p className="text-[11px] text-emerald-800 font-medium italic mt-1">
                    👉 {opt.farmerNote}
                  </p>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Smart Suggestion Assistant Footer */}
      <div className="pt-2 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <SmartSuggestionButton
          suggestedScore={indicator.smartSuggestion.suggestedScore}
          reason={indicator.smartSuggestion.reason}
          dataSource={indicator.smartSuggestion.dataSource}
          isApplied={isAppliedSuggestion}
          onApply={() => onSelectScore(indicator.smartSuggestion.suggestedScore)}
          size="sm"
        />

        {onViewEvidence && (
          <button
            type="button"
            onClick={onViewEvidence}
            className="text-xs font-bold text-slate-600 hover:text-emerald-700 inline-flex items-center gap-1.5 self-end sm:self-auto"
          >
            <FileCheck className="w-3.5 h-3.5 text-emerald-600" />
            <span>Xem minh chứng ({indicator.smartSuggestion.evidenceTitle})</span>
          </button>
        )}
      </div>
    </div>
  );
};
