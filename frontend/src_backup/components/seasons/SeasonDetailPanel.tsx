import { Pencil, Lock, Trash2, Sprout } from 'lucide-react';
import type { Season } from '../../types/season';
import { SEASON_STATUS_STYLES } from '../../types/season';

interface Props {
  season: Season | null;
  onEdit: (season: Season) => void;
  onClose: (season: Season) => void;
  onDelete: (season: Season) => void;
}

export default function SeasonDetailPanel({ season, onEdit, onClose, onDelete }: Props) {
  if (!season) {
    return (
      <div className="flex h-full min-h-[300px] flex-col items-center justify-center rounded-xl border border-dashed border-gray-300 bg-white p-8 text-center text-gray-400">
        <Sprout size={32} className="mb-2" />
        <p className="text-sm">Chọn một mùa vụ trong danh sách để xem chi tiết</p>
      </div>
    );
  }

  const canEdit = season.status !== 'da_dong';

  return (
    <div className="rounded-xl border border-gray-200 bg-white p-5">
      <div className="mb-3 flex items-start justify-between">
        <div>
          <h3 className="text-base font-semibold text-gray-800">{season.name}</h3>
          <p className="text-xs text-gray-400">{season.code}</p>
        </div>
        <span className={`rounded-full px-2.5 py-1 text-xs font-medium ${SEASON_STATUS_STYLES[season.status]}`}>
          {season.status_label}
        </span>
      </div>

      <div className="mb-4 h-32 w-full overflow-hidden rounded-lg bg-green-50">
        <div className="flex h-full items-center justify-center text-green-300">
          <Sprout size={48} />
        </div>
      </div>

      <dl className="space-y-2 text-sm">
        <Row label="Cây trồng" value={season.crop} />
        <Row label="Giống" value={season.variety || '—'} />
        <Row label="Phương thức canh tác" value={season.farming_method || '—'} />
        <Row label="Vùng trồng" value={season.vung_trong_name || '—'} />
        <Row label="Diện tích" value={`${season.area.toLocaleString('vi-VN')} ha`} />
        <Row
          label="Thời gian canh tác"
          value={`${formatDate(season.start_date)} → ${formatDate(season.end_date)}`}
        />
        <Row label="Sản lượng mục tiêu" value={`${season.target_yield.toLocaleString('vi-VN')} kg`} />
        {season.actual_yield !== null && (
          <Row label="Sản lượng thực tế" value={`${season.actual_yield.toLocaleString('vi-VN')} kg`} />
        )}
        <Row label="Người phụ trách" value={season.manager_name || '—'} />
        {season.notes && <Row label="Ghi chú" value={season.notes} />}
      </dl>

      <div className="mt-5 flex gap-2 border-t pt-4">
        <button
          onClick={() => onEdit(season)}
          disabled={!canEdit}
          className="flex flex-1 items-center justify-center gap-1.5 rounded-lg border border-gray-300 py-2 text-sm font-medium text-gray-600 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
        >
          <Pencil size={14} /> Chỉnh sửa
        </button>
        <button
          onClick={() => onClose(season)}
          disabled={!canEdit}
          className="flex flex-1 items-center justify-center gap-1.5 rounded-lg border border-amber-300 py-2 text-sm font-medium text-amber-600 hover:bg-amber-50 disabled:cursor-not-allowed disabled:opacity-50"
        >
          <Lock size={14} /> Đóng vụ
        </button>
        <button
          onClick={() => onDelete(season)}
          className="flex items-center justify-center rounded-lg border border-red-200 px-3 py-2 text-red-500 hover:bg-red-50"
        >
          <Trash2 size={14} />
        </button>
      </div>
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between gap-4">
      <dt className="shrink-0 text-gray-400">{label}</dt>
      <dd className="text-right font-medium text-gray-700">{value}</dd>
    </div>
  );
}

function formatDate(d: string) {
  if (!d) return '—';
  const [y, m, day] = d.split('-');
  return `${day}/${m}/${y}`;
}
