import {
  X,
  Pencil,
  Lock,
  CalendarDays,
  Sprout,
  CheckCircle2,
  Clock,
  Wheat,
  Printer,
} from 'lucide-react';
import { CropSeason } from '@/services/cropSeasonApi';
import { formatDate } from '@/utils/formatters';

interface CropSeasonDrawerHeaderProps {
  season: CropSeason;
  onClose: () => void;
  onEdit: (s: CropSeason) => void;
  onCloseSeason?: (s: CropSeason) => void;
  onPrintSeason?: () => void;
}

const statusText: Record<string, string> = {
  PLANNED: 'Chưa bắt đầu',
  ACTIVE: 'Đang diễn ra',
  HARVESTING: 'Đang thu hoạch 🍇',
  COMPLETED: 'Đã kết thúc',
  CANCELLED: 'Đã hủy',
};

const getTimelineProgress = (startDateStr?: string | null, endDateStr?: string | null) => {
  if (!startDateStr || !endDateStr) return { percent: 0, daysLeft: 0 };
  const start = new Date(startDateStr).getTime();
  const end = new Date(endDateStr).getTime();
  const now = Date.now();
  if (Number.isNaN(start) || Number.isNaN(end) || end <= start) return { percent: 0, daysLeft: 0 };
  if (now <= start) return { percent: 0, daysLeft: Math.ceil((end - now) / (1000 * 3600 * 24)) };
  if (now >= end) return { percent: 100, daysLeft: 0 };
  const total = end - start;
  const elapsed = now - start;
  const percent = Math.min(100, Math.max(0, Math.round((elapsed / total) * 100)));
  const daysLeft = Math.max(0, Math.ceil((end - now) / (1000 * 3600 * 24)));
  return { percent, daysLeft };
};

export const CropSeasonDrawerHeader: React.FC<CropSeasonDrawerHeaderProps> = ({
  season,
  onClose,
  onEdit,
  onCloseSeason,
  onPrintSeason,
}) => {
  const isCompleted = season.status === 'COMPLETED';
  const { percent, daysLeft } = isCompleted
    ? { percent: 100, daysLeft: 0 }
    : getTimelineProgress(season.start_date, season.expected_end_date);

  return (
    <div className="p-5 border-b border-slate-200 bg-white z-10 shrink-0 shadow-xs space-y-4">
      {/* Top row */}
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3.5 min-w-0">
          <div className="w-12 h-12 rounded-2xl bg-emerald-100 text-emerald-800 font-black flex items-center justify-center text-lg shadow-2xs shrink-0 border border-emerald-200">
            <CalendarDays className="w-6 h-6 text-emerald-700" />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <h2 className="text-lg font-black text-slate-900 tracking-tight truncate">
                {season.name}
              </h2>
              <span
                className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold border ${
                  season.status === 'ACTIVE'
                    ? 'bg-emerald-100 text-emerald-800 border-emerald-200 font-bold'
                    : season.status === 'HARVESTING'
                    ? 'bg-blue-100 text-blue-800 border-blue-200 font-bold animate-pulse'
                    : season.status === 'COMPLETED'
                    ? 'bg-slate-100 text-slate-700 border-slate-200'
                    : 'bg-amber-100 text-amber-800 border-amber-200'
                }`}
              >
                {statusText[season.status] || season.status}
              </span>
            </div>
            <p className="text-xs text-slate-500 font-medium mt-1 truncate">
              <span className="font-mono text-emerald-800 font-bold">
                {season.unit_code || 'VÙNG'}
              </span>
              <span className="mx-1.5 text-slate-300">&bull;</span>
              <span>{season.crop}</span>
              <span className="mx-1.5 text-slate-300">&bull;</span>
              <span>{formatDate(season.start_date)} – {formatDate(season.expected_end_date)}</span>
            </p>
          </div>
        </div>

        {/* Action buttons */}
        <div className="flex items-center gap-1.5 shrink-0">
          {onPrintSeason && (
            <button
              type="button"
              onClick={onPrintSeason}
              className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-xl border border-emerald-300 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 text-xs font-bold transition shadow-2xs cursor-pointer"
              title="In / Xuất Hồ sơ Kế hoạch mùa vụ & Dự toán BOM (A4)"
            >
              <Printer className="w-3.5 h-3.5 text-emerald-700" />
              <span className="hidden sm:inline">In hồ sơ</span>
            </button>
          )}

          {!isCompleted && onCloseSeason && (
            <button
              type="button"
              onClick={() => onCloseSeason(season)}
              className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-xl border border-slate-300 bg-white hover:bg-slate-100 text-slate-700 text-xs font-bold transition shadow-2xs cursor-pointer"
              title="Đóng mùa vụ (Hoàn tất sản xuất)"
            >
              <Lock className="w-3.5 h-3.5 text-slate-500" />
              <span className="hidden sm:inline">Đóng vụ</span>
            </button>
          )}
          <button
            type="button"
            onClick={() => onEdit(season)}
            className="p-1.5 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
            title="Chỉnh sửa kế hoạch mùa vụ"
          >
            <Pencil className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-xl border border-slate-200 text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
            title="Đóng chi tiết"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Progress timeline */}
      <div className="space-y-1.5 bg-slate-50 p-2.5 rounded-xl border border-slate-200/80">
        <div className="flex items-center justify-between text-xs font-semibold text-slate-600">
          <span>Tiến độ chu kỳ sinh trưởng</span>
          <span className="font-mono text-emerald-800 font-bold">
            {percent}% ({isCompleted ? 'Đã hoàn tất' : daysLeft > 0 ? `Còn ${daysLeft} ngày` : 'Đã quá hạn vụ'})
          </span>
        </div>
        <div className="w-full bg-slate-200 rounded-full h-2 overflow-hidden">
          <div
            className={`h-full rounded-full transition-all duration-500 ${
              isCompleted ? 'bg-slate-400' : percent > 85 ? 'bg-amber-500' : 'bg-emerald-600'
            }`}
            style={{ width: `${percent}%` }}
          />
        </div>
      </div>
    </div>
  );
};
