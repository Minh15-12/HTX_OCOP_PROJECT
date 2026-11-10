import React from 'react';

interface DataFieldRowProps {
  label: string;
  value: React.ReactNode;
  isMono?: boolean;
  highlight?: boolean;
  subtitle?: string;
  valueClassName?: string;
}

export const DataFieldRow: React.FC<DataFieldRowProps> = ({
  label,
  value,
  isMono,
  highlight,
  subtitle,
  valueClassName = '',
}) => {
  const titleText =
    typeof value === 'string' || typeof value === 'number' ? String(value) : undefined;
  const displayValue = value !== undefined && value !== null && value !== '' ? value : '—';

  return (
    <div className="flex items-start justify-between py-2 border-b border-slate-100/80 text-[13px] gap-3">
      <div className="shrink-0 max-w-[48%] pt-0.5">
        <span className="text-slate-500 font-medium">{label}</span>
        {subtitle && <p className="text-xs text-slate-400 font-normal mt-0.5">{subtitle}</p>}
      </div>
      <div
        title={titleText}
        className={`text-right font-semibold min-w-0 flex-1 break-words leading-relaxed select-text ${
          highlight
            ? 'text-emerald-800 bg-emerald-50 px-2.5 py-0.5 rounded inline-block text-left sm:text-right'
            : isMono
            ? 'font-mono text-slate-800'
            : 'text-slate-900'
        } ${valueClassName}`}
      >
        {displayValue}
      </div>
    </div>
  );
};

export default DataFieldRow;
