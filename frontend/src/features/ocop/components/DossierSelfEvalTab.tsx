import React, { useState } from 'react';
import { Sparkles, FileSpreadsheet, Printer } from 'lucide-react';
import { RealtimeProgressBar } from './RealtimeProgressBar';
import { FarmerCriterionCard } from './FarmerCriterionCard';
import { OCOP_QD148_CRITERIA_DATA } from '../data/ocopQd148Data';

interface DossierSelfEvalTabProps {
  calculation: any;
  criteriaScores: Record<string, number>;
  evidenceCountMap: Record<string, number>;
  onScoreChange: (code: string, newScore: number) => void;
  onApplySmartSuggestions: () => void;
  onExportExcel: () => void;
  onOpenPrintModal: () => void;
  onGoToEvidences: () => void;
  onSaveDraft: () => void;
}

export const DossierSelfEvalTab: React.FC<DossierSelfEvalTabProps> = ({
  calculation,
  criteriaScores,
  evidenceCountMap,
  onScoreChange,
  onApplySmartSuggestions,
  onExportExcel,
  onOpenPrintModal,
  onGoToEvidences,
  onSaveDraft,
}) => {
  const [activeGroupCode, setActiveGroupCode] = useState<'ALL' | 'GA' | 'GB' | 'GC'>('ALL');

  return (
    <div className="space-y-6">
      {/* Reactive Real-time Progress Bar */}
      <RealtimeProgressBar calculation={calculation} targetStar={4} />

      {/* Sub Header Bar with Filter & 1-Click Smart Suggestion */}
      <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center flex-wrap gap-2 text-xs font-bold">
          <span className="text-slate-500 mr-1">Lọc nhóm:</span>
          <button
            type="button"
            onClick={() => setActiveGroupCode('ALL')}
            className={`px-3 py-1.5 rounded-xl transition-all cursor-pointer ${
              activeGroupCode === 'ALL'
                ? 'bg-slate-900 text-white shadow-xs'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            Tất cả (11 chỉ tiêu)
          </button>
          <button
            type="button"
            onClick={() => setActiveGroupCode('GA')}
            className={`px-3 py-1.5 rounded-xl transition-all cursor-pointer ${
              activeGroupCode === 'GA'
                ? 'bg-emerald-700 text-white shadow-xs'
                : 'bg-emerald-50 text-emerald-800 hover:bg-emerald-100'
            }`}
          >
            Phần A: Sản phẩm (40đ)
          </button>
          <button
            type="button"
            onClick={() => setActiveGroupCode('GB')}
            className={`px-3 py-1.5 rounded-xl transition-all cursor-pointer ${
              activeGroupCode === 'GB'
                ? 'bg-blue-700 text-white shadow-xs'
                : 'bg-blue-50 text-blue-800 hover:bg-blue-100'
            }`}
          >
            Phần B: Tiếp thị (25đ)
          </button>
          <button
            type="button"
            onClick={() => setActiveGroupCode('GC')}
            className={`px-3 py-1.5 rounded-xl transition-all cursor-pointer ${
              activeGroupCode === 'GC'
                ? 'bg-purple-700 text-white shadow-xs'
                : 'bg-purple-50 text-purple-800 hover:bg-purple-100'
            }`}
          >
            Phần C: Chất lượng (35đ)
          </button>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={onApplySmartSuggestions}
            className="px-3.5 py-1.5 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white font-black text-xs rounded-xl shadow-xs flex items-center gap-1.5 active:scale-98 transition-all cursor-pointer"
            title="Tự động áp dụng toàn bộ mức điểm gợi ý từ hệ thống"
          >
            <Sparkles className="w-3.5 h-3.5" />
            💡 Gợi ý thông minh từ dữ liệu HTX
          </button>

          <button
            type="button"
            onClick={onExportExcel}
            className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl border border-slate-200 transition-colors inline-flex items-center gap-1.5 cursor-pointer"
          >
            <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-600" /> Xuất Excel
          </button>
        </div>
      </div>

      {/* Criterion Cards Grid */}
      <div className="space-y-4">
        {OCOP_QD148_CRITERIA_DATA.filter(
          (group) => activeGroupCode === 'ALL' || activeGroupCode === group.code
        ).map((group) => (
          <div key={group.code} className="space-y-3">
            <div className="flex items-center justify-between bg-slate-100/90 px-4 py-2.5 rounded-xl border border-slate-200">
              <span className="font-black text-xs text-slate-900 uppercase tracking-wide">
                {group.name}: {group.fullName} (Tối đa {group.maxScore.toFixed(1)}đ)
              </span>
              <span className="text-xs font-mono font-black text-emerald-800">
                Thực đạt:{' '}
                {group.code === 'GA'
                  ? calculation.partAScore.toFixed(1)
                  : group.code === 'GB'
                  ? calculation.partBScore.toFixed(1)
                  : calculation.partCScore.toFixed(1)}{' '}
                / {group.maxScore.toFixed(1)}đ
              </span>
            </div>

            <div className="space-y-3">
              {group.indicators.map((ind) => (
                <FarmerCriterionCard
                  key={ind.code}
                  indicator={ind}
                  selectedScore={criteriaScores[ind.code]}
                  onSelectScore={(newScore) => onScoreChange(ind.code, newScore)}
                  hasEvidence={(evidenceCountMap[ind.code] || 0) > 0}
                  onViewEvidence={onGoToEvidences}
                />
              ))}
            </div>
          </div>
        ))}
      </div>

      <div className="flex justify-end gap-3 pt-4 border-t border-slate-200">
        <button
          type="button"
          onClick={onSaveDraft}
          className="px-5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl cursor-pointer"
        >
          Lưu nháp
        </button>
        <button
          type="button"
          onClick={onOpenPrintModal}
          className="px-6 py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white font-extrabold text-xs rounded-xl shadow-xs flex items-center gap-2 cursor-pointer"
        >
          <Printer className="w-4 h-4" /> Xem trước & In Biểu mẫu QĐ 148
        </button>
      </div>
    </div>
  );
};
