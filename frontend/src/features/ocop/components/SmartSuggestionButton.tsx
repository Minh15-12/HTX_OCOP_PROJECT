import React from 'react';
import { Sparkles, Check, Database } from 'lucide-react';

interface SmartSuggestionButtonProps {
  onApply: () => void;
  suggestedScore?: number;
  reason?: string;
  dataSource?: string;
  isApplied?: boolean;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}

export const SmartSuggestionButton: React.FC<SmartSuggestionButtonProps> = ({
  onApply,
  suggestedScore,
  reason,
  dataSource,
  isApplied = false,
  className = '',
  size = 'md',
}) => {
  const sizeClasses = {
    sm: 'px-2.5 py-1.5 text-xs',
    md: 'px-3.5 py-2 text-xs',
    lg: 'px-4 py-2.5 text-sm',
  };

  return (
    <div className={`inline-flex flex-col gap-1 ${className}`}>
      <button
        type="button"
        onClick={onApply}
        className={`group font-black rounded-xl border transition-all flex items-center justify-center gap-2 shadow-xs active:scale-98 ${sizeClasses[size]} ${
          isApplied
            ? 'bg-emerald-50 text-emerald-800 border-emerald-300 hover:bg-emerald-100'
            : 'bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white border-amber-600 hover:shadow-amber-200'
        }`}
        title={reason ? `Căn cứ: ${reason}` : 'Tự động phân tích dữ liệu HTX để điền điểm tối ưu'}
      >
        {isApplied ? (
          <>
            <Check className="w-4 h-4 text-emerald-600 stroke-[3]" />
            <span>Đã áp dụng gợi ý HTX ({suggestedScore}đ)</span>
          </>
        ) : (
          <>
            <Sparkles className="w-4 h-4 text-amber-100 group-hover:rotate-12 transition-transform" />
            <span>💡 Gợi ý thông minh từ dữ liệu HTX {suggestedScore !== undefined && `(${suggestedScore}đ)`}</span>
          </>
        )}
      </button>

      {reason && (
        <div className="flex items-start gap-1.5 text-[11px] text-slate-500 bg-amber-50/70 border border-amber-200/80 rounded-lg p-2 leading-relaxed">
          <Database className="w-3.5 h-3.5 text-amber-600 shrink-0 mt-0.5" />
          <div>
            <span className="font-bold text-amber-900">Căn cứ tự động: </span>
            <span className="text-slate-700">{reason}</span>
            {dataSource && (
              <span className="block text-[10px] text-slate-500 font-mono mt-0.5">
                Nguồn: {dataSource}
              </span>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
