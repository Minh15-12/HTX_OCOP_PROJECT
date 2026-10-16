import React from 'react';
import { CheckCircle2, AlertTriangle, AlertCircle } from 'lucide-react';
import { CriterionBadgeStatus } from '../data/ocopQd148Data';

interface CriterionStatusBadgeProps {
  status: CriterionBadgeStatus;
  label?: string;
  showIconOnly?: boolean;
}

export const CriterionStatusBadge: React.FC<CriterionStatusBadgeProps> = ({
  status,
  label,
  showIconOnly = false,
}) => {
  if (status === 'GREEN') {
    return (
      <span
        title="🟢 Đã hoàn thành: Đã tự chấm điểm và có đủ minh chứng hợp lệ"
        className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-black bg-emerald-100 text-emerald-800 border border-emerald-300 shadow-xs"
      >
        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 stroke-[2.5]" />
        {!showIconOnly && <span>{label || 'Hoàn thành'}</span>}
      </span>
    );
  }

  if (status === 'YELLOW') {
    return (
      <span
        title="🟡 Cần bổ sung: Đã chọn điểm nhưng cần bổ sung thêm minh chứng/giải trình"
        className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-black bg-amber-100 text-amber-900 border border-amber-300 shadow-xs"
      >
        <AlertTriangle className="w-3.5 h-3.5 text-amber-600 stroke-[2.5]" />
        {!showIconOnly && <span>{label || 'Cần bổ sung'}</span>}
      </span>
    );
  }

  // RED
  return (
    <span
      title="🔴 Chưa đạt: Tiêu chí bắt buộc (*) đạt 0 điểm hoặc thiếu minh chứng pháp lý"
      className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-black bg-rose-100 text-rose-900 border border-rose-300 shadow-xs animate-pulse"
    >
      <AlertCircle className="w-3.5 h-3.5 text-rose-600 stroke-[2.5]" />
      {!showIconOnly && <span>{label || 'Chưa đạt / Thiếu MC'}</span>}
    </span>
  );
};
