import React from 'react';
import { ResolutionSummary } from '@/services/meetingApi';
import { CheckCircle2, XCircle, AlertCircle, Users, Percent, ShieldCheck } from 'lucide-react';

interface ResolutionsSummaryCardProps {
  summaries: ResolutionSummary[];
  isLoading?: boolean;
}

export const ResolutionsSummaryCard: React.FC<ResolutionsSummaryCardProps> = ({
  summaries,
  isLoading,
}) => {
  if (isLoading) {
    return (
      <div className="p-6 text-center text-slate-400 text-xs flex items-center justify-center gap-2">
        <div className="w-4 h-4 border-2 border-emerald-600 border-t-transparent rounded-full animate-spin" />
        Đang tổng hợp kết quả biểu quyết...
      </div>
    );
  }

  if (!summaries || summaries.length === 0) {
    return (
      <div className="p-6 text-center bg-slate-50 rounded-xl border border-dashed border-slate-200">
        <AlertCircle className="w-7 h-7 text-slate-400 mx-auto mb-1.5" />
        <p className="text-xs font-bold text-slate-700">Chưa có biểu quyết nào</p>
        <p className="text-[11px] text-slate-500 mt-0.5">
          Chưa ghi nhận phiếu biểu quyết cho các nghị quyết trong cuộc họp này.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {summaries.map((res) => {
        const isApproved = res.is_approved;
        return (
          <div
            key={res.resolution_code}
            className="p-4 bg-white rounded-xl border border-slate-200 shadow-2xs hover:border-slate-300 transition-all"
          >
            {/* Header */}
            <div className="flex flex-wrap items-center justify-between gap-2 pb-2.5 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 text-xs font-mono font-bold bg-blue-50 text-blue-800 rounded border border-blue-200">
                  {res.resolution_code}
                </span>
                <span className="text-xs font-bold text-slate-900">
                  Nghị quyết {res.resolution_code}
                </span>
                {res.resolution_type === 'CRITICAL' ? (
                  <span className="px-2 py-0.5 text-[10px] font-bold bg-amber-100 text-amber-800 rounded-full border border-amber-200">
                    Trọng yếu (Chuẩn $\ge$ 75%)
                  </span>
                ) : (
                  <span className="px-2 py-0.5 text-[10px] font-bold bg-slate-100 text-slate-700 rounded-full border border-slate-200">
                    Thông thường (Chuẩn $\ge$ 50%)
                  </span>
                )}
              </div>
              <div className="flex items-center gap-1.5">
                {isApproved ? (
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    ĐẠT THÔNG QUA ({res.approval_percentage}%)
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-rose-100 text-rose-800 border border-rose-200">
                    <XCircle className="w-3.5 h-3.5" />
                    CHƯA ĐẠT ({res.approval_percentage}%)
                  </span>
                )}
              </div>
            </div>

            {/* Progress Bar with Law Citation */}
            <div className="mt-3">
              {(() => {
                const targetThreshold = res.required_percentage ?? (res.resolution_type === 'CRITICAL' ? 75 : 50);
                return (
                  <>
                    <div className="flex items-center justify-between text-[11px] font-medium text-slate-600 mb-1">
                      <span className="flex items-center gap-1">
                        <span>Tỷ lệ tán thành (theo tỷ trọng biểu quyết)</span>
                        <span className="text-[10px] text-slate-400">(Điều 72 Luật HTX 2023)</span>
                      </span>
                      <span className="font-bold text-slate-900 font-mono">
                        {res.approval_percentage}% / Yêu cầu $\ge$ {targetThreshold}%
                      </span>
                    </div>
                    <div className="w-full bg-slate-100 rounded-full h-3 overflow-hidden flex relative border border-slate-200">
                      {/* Threshold indicator line with marker */}
                      <div
                        className="absolute top-0 bottom-0 w-0.5 bg-amber-500 z-10 shadow-xs"
                        style={{ left: `${targetThreshold}%` }}
                        title={`Ngưỡng thông qua theo luật: ${targetThreshold}%`}
                      />
                      <div
                        className={`h-full transition-all duration-500 ${
                          isApproved ? 'bg-emerald-600' : 'bg-rose-500'
                        }`}
                        style={{ width: `${Math.min(100, Math.max(0, res.approval_percentage))}%` }}
                      />
                    </div>
                    <div className="flex justify-between items-center text-[9.5px] text-slate-400 mt-1">
                      <span>0%</span>
                      <span style={{ marginLeft: `${targetThreshold - 12}%` }} className="text-amber-700 font-semibold font-mono">
                        ▲ Ngưỡng {targetThreshold}% ({res.resolution_type === 'CRITICAL' ? 'Trọng yếu' : 'Thường'})
                      </span>
                      <span>100%</span>
                    </div>
                  </>
                );
              })()}
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 mt-3 pt-3 border-t border-slate-100">
              <div className="p-2 rounded-lg bg-slate-50 border border-slate-100">
                <div className="flex items-center gap-1 text-[11px] text-slate-500 font-medium">
                  <Users className="w-3 h-3" />
                  <span>Tổng cử tri</span>
                </div>
                <div className="mt-0.5 text-xs font-mono font-bold text-slate-800">
                  {res.total_voters} phiếu
                </div>
                <div className="text-[10px] text-slate-400 font-mono">
                  Trọng số: {res.total_weight.toFixed(2)}
                </div>
              </div>

              <div className="p-2 rounded-lg bg-emerald-50/60 border border-emerald-100">
                <div className="text-[11px] text-emerald-800 font-medium flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                  <span>Tán thành</span>
                </div>
                <div className="mt-0.5 text-xs font-mono font-bold text-emerald-900">
                  {res.for_count} ({res.for_weight.toFixed(2)})
                </div>
              </div>

              <div className="p-2 rounded-lg bg-rose-50/60 border border-rose-100">
                <div className="text-[11px] text-rose-800 font-medium flex items-center gap-1">
                  <XCircle className="w-3 h-3 text-rose-600" />
                  <span>Không tán thành</span>
                </div>
                <div className="mt-0.5 text-xs font-mono font-bold text-rose-900">
                  {res.against_count} ({res.against_weight.toFixed(2)})
                </div>
              </div>

              <div className="p-2 rounded-lg bg-slate-50 border border-slate-100">
                <div className="text-[11px] text-slate-600 font-medium flex items-center gap-1">
                  <ShieldCheck className="w-3 h-3 text-slate-500" />
                  <span>Phiếu trắng</span>
                </div>
                <div className="mt-0.5 text-xs font-mono font-bold text-slate-700">
                  {res.abstain_count} ({res.abstain_weight.toFixed(2)})
                </div>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};
