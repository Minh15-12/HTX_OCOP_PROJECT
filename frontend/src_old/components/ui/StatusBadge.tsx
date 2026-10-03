import React from 'react';
import { cn } from '@/utils/cn';

export type StatusType =
  | 'DRAFT'
  | 'SUBMITTED'
  | 'PENDING'
  | 'IN_PROGRESS'
  | 'SCORING'
  | 'APPROVED'
  | 'ACTIVE'
  | 'COMPLETED'
  | 'REJECTED'
  | 'CANCELLED'
  | 'FAILED'
  | 'LOCKED'
  | 'NEEDS_REVISION'
  | 'UNRATED'
  | '1_STAR'
  | '2_STAR'
  | '3_STAR'
  | '4_STAR'
  | '5_STAR'
  | string;

export interface StatusBadgeProps {
  status: StatusType;
  label?: string;
  className?: string;
}

const statusConfig: Record<string, { bg: string; text: string; defaultLabel: string }> = {
  DRAFT: { bg: 'bg-slate-100 border-slate-200', text: 'text-slate-700', defaultLabel: 'Nháp' },
  SUBMITTED: { bg: 'bg-amber-50 border-amber-200', text: 'text-amber-700', defaultLabel: 'Đã nộp' },
  PENDING: { bg: 'bg-amber-50 border-amber-200', text: 'text-amber-700', defaultLabel: 'Chờ duyệt' },
  IN_PROGRESS: { bg: 'bg-sky-50 border-sky-200', text: 'text-sky-700', defaultLabel: 'Đang xử lý' },
  SCORING: { bg: 'bg-blue-50 border-blue-200', text: 'text-blue-700', defaultLabel: 'Đang chấm điểm' },
  APPROVED: { bg: 'bg-emerald-50 border-emerald-200', text: 'text-emerald-700', defaultLabel: 'Đã duyệt' },
  ACTIVE: { bg: 'bg-emerald-50 border-emerald-200', text: 'text-emerald-700', defaultLabel: 'Đang hoạt động' },
  COMPLETED: { bg: 'bg-emerald-50 border-emerald-200', text: 'text-emerald-700', defaultLabel: 'Hoàn thành' },
  REJECTED: { bg: 'bg-rose-50 border-rose-200', text: 'text-rose-700', defaultLabel: 'Từ chối' },
  CANCELLED: { bg: 'bg-slate-100 border-slate-200', text: 'text-slate-600', defaultLabel: 'Đã hủy' },
  FAILED: { bg: 'bg-rose-50 border-rose-200', text: 'text-rose-700', defaultLabel: 'Thất bại' },
  LOCKED: { bg: 'bg-indigo-50 border-indigo-200', text: 'text-indigo-700', defaultLabel: 'Đã khóa' },
  NEEDS_REVISION: { bg: 'bg-orange-50 border-orange-200', text: 'text-orange-700', defaultLabel: 'Cần bổ sung' },
  UNRATED: { bg: 'bg-slate-100 border-slate-200', text: 'text-slate-600', defaultLabel: 'Chưa xếp hạng' },
  '1_STAR': { bg: 'bg-amber-100 border-amber-300', text: 'text-amber-800', defaultLabel: '1 Sao ★' },
  '2_STAR': { bg: 'bg-amber-100 border-amber-300', text: 'text-amber-800', defaultLabel: '2 Sao ★★' },
  '3_STAR': { bg: 'bg-amber-100 border-amber-400', text: 'text-amber-900', defaultLabel: '3 Sao ★★★' },
  '4_STAR': { bg: 'bg-emerald-100 border-emerald-400', text: 'text-emerald-900', defaultLabel: '4 Sao ★★★★' },
  '5_STAR': { bg: 'bg-amber-400 border-amber-500', text: 'text-amber-950', defaultLabel: '5 Sao ★★★★★' },
};

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status, label, className }) => {
  const config = statusConfig[status] || {
    bg: 'bg-slate-100 border-slate-200',
    text: 'text-slate-700',
    defaultLabel: status,
  };

  return (
    <span
      className={cn(
        'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold border transition-colors',
        config.bg,
        config.text,
        className
      )}
    >
      {label || config.defaultLabel}
    </span>
  );
};
