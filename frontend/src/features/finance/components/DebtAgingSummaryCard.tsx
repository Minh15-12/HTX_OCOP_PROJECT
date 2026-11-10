import React, { useState } from 'react';
import {
  TrendingUp,
  TrendingDown,
  DollarSign,
  AlertTriangle,
  Clock,
  ShieldAlert,
  Loader2,
  BarChart3,
} from 'lucide-react';

export interface DebtAgingSummaryData {
  total_receivable: number;
  overdue_receivable: number;
  total_payable: number;
  overdue_payable: number;
  net_debt_position: number;
  total_open_debts_count: number;
  aging_breakdown: {
    current: number;
    overdue_1_30: number;
    overdue_31_60: number;
    overdue_61_90: number;
    overdue_90_plus: number;
  };
}

interface DebtAgingSummaryCardProps {
  summary: DebtAgingSummaryData | null;
  isLoading?: boolean;
}

const money = (n: number) => (n || 0).toLocaleString('vi-VN') + ' ₫';
const moneyCompact = (n: number) => {
  if (!n) return '0 ₫';
  if (n >= 1_000_000_000) return (n / 1_000_000_000).toFixed(1) + ' tỷ';
  if (n >= 1_000_000) return (n / 1_000_000).toFixed(1) + ' tr';
  return (n / 1_000).toFixed(0) + ' k';
};

export const DebtAgingSummaryCard: React.FC<DebtAgingSummaryCardProps> = ({
  summary,
  isLoading,
}) => {
  const [hoveredBucket, setHoveredBucket] = useState<string | null>(null);

  if (isLoading) {
    return (
      <div className="p-6 bg-white rounded-2xl border border-slate-200/80 shadow-2xs flex items-center justify-center text-slate-400 text-xs gap-2">
        <Loader2 className="w-5 h-5 animate-spin text-emerald-600" />
        Đang phân tích số liệu tuổi nợ công nợ HTX...
      </div>
    );
  }

  if (!summary) return null;

  const aging = summary.aging_breakdown || {
    current: 0,
    overdue_1_30: 0,
    overdue_31_60: 0,
    overdue_61_90: 0,
    overdue_90_plus: 0,
  };

  const totalAgingSum =
    aging.current +
    aging.overdue_1_30 +
    aging.overdue_31_60 +
    aging.overdue_61_90 +
    aging.overdue_90_plus;

  const maxVal = Math.max(
    aging.current,
    aging.overdue_1_30,
    aging.overdue_31_60,
    aging.overdue_61_90,
    aging.overdue_90_plus,
    1
  );

  const getPct = (val: number) =>
    totalAgingSum > 0 ? Math.round((val / totalAgingSum) * 100) : 0;

  const buckets = [
    {
      id: 'current',
      label: 'Trong hạn',
      sublabel: 'Chưa đến ngày đáo hạn',
      amount: aging.current,
      color: 'bg-emerald-500 hover:bg-emerald-600',
      textColor: 'text-emerald-700',
      borderColor: 'border-emerald-200',
      bgColor: 'bg-emerald-50/60',
    },
    {
      id: 'overdue_1_30',
      label: '1–30 ngày',
      sublabel: 'Quá hạn ngắn hạn',
      amount: aging.overdue_1_30,
      color: 'bg-amber-400 hover:bg-amber-500',
      textColor: 'text-amber-700',
      borderColor: 'border-amber-200',
      bgColor: 'bg-amber-50/60',
    },
    {
      id: 'overdue_31_60',
      label: '31–60 ngày',
      sublabel: 'Cần gửi văn bản nhắc nợ',
      amount: aging.overdue_31_60,
      color: 'bg-orange-400 hover:bg-orange-500',
      textColor: 'text-orange-700',
      borderColor: 'border-orange-200',
      bgColor: 'bg-orange-50/60',
    },
    {
      id: 'overdue_61_90',
      label: '61–90 ngày',
      sublabel: 'Nguy cơ trễ hạn cao',
      amount: aging.overdue_61_90,
      color: 'bg-orange-600 hover:bg-orange-700',
      textColor: 'text-orange-800',
      borderColor: 'border-orange-300',
      bgColor: 'bg-orange-50/70',
    },
    {
      id: 'overdue_90_plus',
      label: '> 90 ngày',
      sublabel: 'Nợ xấu cần cưỡng chế / trích lập',
      amount: aging.overdue_90_plus,
      color: 'bg-rose-600 hover:bg-rose-700',
      textColor: 'text-rose-700',
      borderColor: 'border-rose-300',
      bgColor: 'bg-rose-50/70',
      isCritical: true,
    },
  ];

  return (
    <div className="p-4 sm:p-5 bg-white rounded-2xl border border-slate-200/80 shadow-2xs space-y-5">
      {/* 3 Metric Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5">
        {/* Phải thu */}
        <div className="p-3.5 rounded-xl bg-blue-50/60 border border-blue-100 flex items-start justify-between">
          <div>
            <span className="text-[11px] font-bold uppercase tracking-wider text-blue-700">
              Công nợ phải thu (Xã viên / Đối tác nợ HTX)
            </span>
            <div className="mt-1 text-lg font-black text-blue-900 font-mono">
              {money(summary.total_receivable)}
            </div>
            <div className="mt-0.5 text-[11px] font-semibold text-rose-600 flex items-center gap-1">
              <AlertTriangle className="w-3 h-3" />
              <span>Quá hạn: {money(summary.overdue_receivable)}</span>
            </div>
          </div>
          <div className="p-2 rounded-lg bg-blue-100 text-blue-800">
            <TrendingUp className="w-4 h-4" />
          </div>
        </div>

        {/* Phải trả */}
        <div className="p-3.5 rounded-xl bg-amber-50/60 border border-amber-100 flex items-start justify-between">
          <div>
            <span className="text-[11px] font-bold uppercase tracking-wider text-amber-800">
              Công nợ phải trả (HTX nợ Nhà cung cấp)
            </span>
            <div className="mt-1 text-lg font-black text-amber-900 font-mono">
              {money(summary.total_payable)}
            </div>
            <div className="mt-0.5 text-[11px] font-semibold text-rose-600 flex items-center gap-1">
              <AlertTriangle className="w-3 h-3" />
              <span>Quá hạn: {money(summary.overdue_payable)}</span>
            </div>
          </div>
          <div className="p-2 rounded-lg bg-amber-100 text-amber-800">
            <TrendingDown className="w-4 h-4" />
          </div>
        </div>

        {/* Vị thế nợ ròng */}
        <div
          className={`p-3.5 rounded-xl border flex items-start justify-between ${
            summary.net_debt_position >= 0
              ? 'bg-emerald-50/60 border-emerald-100'
              : 'bg-rose-50/60 border-rose-100'
          }`}
        >
          <div>
            <span
              className={`text-[11px] font-bold uppercase tracking-wider ${
                summary.net_debt_position >= 0 ? 'text-emerald-800' : 'text-rose-800'
              }`}
            >
              Vị thế nợ ròng (Phải thu - Phải trả)
            </span>
            <div
              className={`mt-1 text-lg font-black font-mono ${
                summary.net_debt_position >= 0 ? 'text-emerald-900' : 'text-rose-900'
              }`}
            >
              {money(summary.net_debt_position)}
            </div>
            <p className="mt-0.5 text-[11px] text-slate-500">
              {summary.total_open_debts_count} khoản nợ chưa tất toán
            </p>
          </div>
          <div
            className={`p-2 rounded-lg ${
              summary.net_debt_position >= 0
                ? 'bg-emerald-100 text-emerald-800'
                : 'bg-rose-100 text-rose-800'
            }`}
          >
            <DollarSign className="w-4 h-4" />
          </div>
        </div>
      </div>

      {/* Visual Bar Chart 5 kỳ tuổi nợ */}
      <div className="p-4 bg-slate-50/60 rounded-xl border border-slate-200 space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <BarChart3 className="w-4 h-4 text-emerald-600" />
            <span className="text-xs font-black uppercase text-slate-800 tracking-wider">
              Biểu đồ trực quan phân bổ 5 kỳ tuổi nợ HTX
            </span>
          </div>
          <div className="text-[11px] text-slate-500">
            Tổng nợ phân tích:{' '}
            <strong className="font-mono text-slate-900">{money(totalAgingSum)}</strong>
          </div>
        </div>

        {/* Visual Columns Chart */}
        <div className="pt-6 pb-2 px-2">
          <div className="h-44 flex items-end justify-between gap-3 sm:gap-6 border-b border-slate-200 pb-2">
            {buckets.map((b) => {
              const heightPct = Math.max(12, Math.round((b.amount / maxVal) * 100));
              const pctOfTotal = getPct(b.amount);
              const isHov = hoveredBucket === b.id;

              return (
                <div
                  key={b.id}
                  className="flex-1 flex flex-col items-center h-full justify-end group cursor-pointer"
                  onMouseEnter={() => setHoveredBucket(b.id)}
                  onMouseLeave={() => setHoveredBucket(null)}
                >
                  {/* Floating Value Tag */}
                  <div className="mb-2 text-center transition-transform group-hover:-translate-y-1">
                    <span className="text-[11px] font-mono font-black text-slate-900 block">
                      {moneyCompact(b.amount)}
                    </span>
                    <span className="text-[9.5px] font-bold text-slate-400">
                      {pctOfTotal}%
                    </span>
                  </div>

                  {/* Vertical Bar */}
                  <div className="w-full max-w-[56px] bg-slate-200/70 rounded-t-xl h-full flex items-end p-0.5">
                    <div
                      className={`w-full rounded-t-lg transition-all duration-500 ${b.color} ${
                        isHov ? 'ring-2 ring-slate-400 ring-offset-1' : ''
                      }`}
                      style={{ height: `${heightPct}%` }}
                    />
                  </div>

                  {/* Bar Label */}
                  <div className="mt-2.5 text-center">
                    <div className="text-[11px] font-bold text-slate-700 whitespace-nowrap">
                      {b.label}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* 5 Bucket Cards Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 text-xs pt-1">
          {buckets.map((b) => (
            <div
              key={b.id}
              className={`p-2.5 rounded-xl border transition-all ${b.bgColor} ${b.borderColor} ${
                hoveredBucket === b.id ? 'ring-2 ring-emerald-500 shadow-xs' : ''
              }`}
            >
              <div className={`text-[10.5px] font-bold ${b.textColor} flex items-center justify-between`}>
                <span>{b.label}</span>
                {b.isCritical && <ShieldAlert className="w-3 h-3 text-rose-600" />}
              </div>
              <div className="mt-1 font-mono font-black text-slate-900 text-[12.5px]">
                {money(b.amount)}
              </div>
              <div className="text-[10px] text-slate-500 mt-0.5 truncate" title={b.sublabel}>
                {b.sublabel}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
