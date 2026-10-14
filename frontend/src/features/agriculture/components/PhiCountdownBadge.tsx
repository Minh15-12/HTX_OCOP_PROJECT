import React, { useState, useEffect } from 'react';
import { ShieldAlert, CheckCircle, Clock } from 'lucide-react';

interface PhiCountdownBadgeProps {
  safeHarvestDate?: string | null;
  status?: string;
  className?: string;
  compact?: boolean;
}

interface RemainingTime {
  isExpired: boolean;
  days: number;
  hours: number;
  minutes: number;
  formattedTarget: string;
}

function parseIsoDateToEndOfDay(safeHarvestDateStr: string): { targetDate: Date; formattedTarget: string } | null {
  const trimmed = safeHarvestDateStr.trim();
  // Match standard ISO YYYY-MM-DD prefix
  const match = trimmed.match(/^(\d{4})-(\d{2})-(\d{2})/);
  if (match) {
    const year = parseInt(match[1], 10);
    const month = parseInt(match[2], 10); // 1-based month
    const day = parseInt(match[3], 10);

    if (!isNaN(year) && !isNaN(month) && !isNaN(day)) {
      // Deterministic DD/MM/YYYY formatting, completely timezone-independent
      const formattedTarget = `${String(day).padStart(2, '0')}/${String(month).padStart(2, '0')}/${year}`;
      // Construct target at client local end-of-day: 23:59:59.999
      const targetDate = new Date(year, month - 1, day, 23, 59, 59, 999);
      if (!isNaN(targetDate.getTime())) {
        return { targetDate, formattedTarget };
      }
    }
  }

  // Fallback for non-standard date string formats
  const fallback = new Date(trimmed);
  if (!isNaN(fallback.getTime())) {
    const day = String(fallback.getDate()).padStart(2, '0');
    const month = String(fallback.getMonth() + 1).padStart(2, '0');
    const year = fallback.getFullYear();
    const formattedTarget = `${day}/${month}/${year}`;
    const targetDate = new Date(fallback.getFullYear(), fallback.getMonth(), fallback.getDate(), 23, 59, 59, 999);
    return { targetDate, formattedTarget };
  }

  return null;
}

function calculateRemainingTime(safeHarvestDateStr?: string | null): RemainingTime {
  if (!safeHarvestDateStr) {
    return { isExpired: true, days: 0, hours: 0, minutes: 0, formattedTarget: '' };
  }

  const parsed = parseIsoDateToEndOfDay(safeHarvestDateStr);
  if (!parsed) {
    return { isExpired: true, days: 0, hours: 0, minutes: 0, formattedTarget: '' };
  }

  const { targetDate, formattedTarget } = parsed;
  const now = new Date();
  const diffMs = targetDate.getTime() - now.getTime();

  if (diffMs <= 0) {
    return { isExpired: true, days: 0, hours: 0, minutes: 0, formattedTarget };
  }

  const totalMinutes = Math.floor(diffMs / (1000 * 60));
  const days = Math.floor(totalMinutes / (60 * 24));
  const hours = Math.floor((totalMinutes % (60 * 24)) / 60);
  const minutes = totalMinutes % 60;

  return { isExpired: false, days, hours, minutes, formattedTarget };
}

export const PhiCountdownBadge: React.FC<PhiCountdownBadgeProps> = ({
  safeHarvestDate,
  status,
  className = '',
  compact = false,
}) => {
  const [remaining, setRemaining] = useState<RemainingTime>(() =>
    calculateRemainingTime(safeHarvestDate)
  );

  useEffect(() => {
    setRemaining(calculateRemainingTime(safeHarvestDate));
    const interval = setInterval(() => {
      setRemaining(calculateRemainingTime(safeHarvestDate));
    }, 60000); // Re-calculate every minute

    return () => clearInterval(interval);
  }, [safeHarvestDate]);

  // If status is not in quarantine and no future safe harvest date
  const isQuarantine = status === 'IN_QUARANTINE' || (!remaining.isExpired && !!safeHarvestDate);

  if (!isQuarantine || remaining.isExpired) {
    return (
      <span
        className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200 ${className}`}
        title="Đã qua thời hạn cách ly PHI, đủ điều kiện an toàn để thu hoạch"
      >
        <CheckCircle className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
        <span>Đạt an toàn PHI</span>
      </span>
    );
  }

  const countdownText =
    remaining.days > 0
      ? `Còn ${remaining.days} ngày ${remaining.hours} giờ`
      : remaining.hours > 0
      ? `Còn ${remaining.hours} giờ ${remaining.minutes} phút`
      : `Còn ${remaining.minutes} phút`;

  if (compact) {
    return (
      <span
        className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-bold bg-rose-100 text-rose-800 border border-rose-300 animate-pulse ${className}`}
        title={`Cách ly PHI đến ngày ${remaining.formattedTarget}`}
      >
        <Clock className="w-3 h-3 text-rose-600 shrink-0" />
        <span>{countdownText}</span>
      </span>
    );
  }

  return (
    <div
      className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-xl border border-rose-300 bg-rose-50 text-rose-900 text-xs font-bold shadow-xs animate-pulse ${className}`}
      title={`Thửa đất đang trong thời gian cách ly thuốc BVTV đến ngày ${remaining.formattedTarget}`}
    >
      <ShieldAlert className="w-4 h-4 text-rose-600 shrink-0 animate-bounce" />
      <div className="flex flex-col sm:flex-row sm:items-center sm:gap-2">
        <span className="font-extrabold text-rose-700">🛑 Cách ly PHI:</span>
        <span className="font-mono text-rose-900">{countdownText}</span>
        {remaining.formattedTarget && (
          <span className="text-[11px] text-rose-600/90 font-normal">
            (Đến {remaining.formattedTarget})
          </span>
        )}
      </div>
    </div>
  );
};
