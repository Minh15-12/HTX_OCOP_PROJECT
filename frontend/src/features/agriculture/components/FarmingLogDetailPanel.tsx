import React from 'react';
import {
  X,
  Calendar,
  MapPin,
  ExternalLink,
  ShieldAlert,
  ShieldCheck,
  CheckCircle,
  Camera,
  Layers,
  FileText,
  User,
  Package,
  Pencil,
  Trash2,
  Maximize2,
} from 'lucide-react';
import type { FarmingLog } from '@/types/agriculture';
import { ACTIVITY_TYPES_META } from '@/types/agriculture';
import { Lock } from 'lucide-react';

interface FarmingLogDetailPanelProps {
  log: FarmingLog | null;
  onClose?: () => void;
  onEdit: (log: FarmingLog) => void;
  onDelete: (log: FarmingLog) => void;
  onViewPhoto: (photoUrl: string) => void;
  isReadOnly?: boolean;
}

export const FarmingLogDetailPanel: React.FC<FarmingLogDetailPanelProps> = ({
  log,
  onClose,
  onEdit,
  onDelete,
  onViewPhoto,
  isReadOnly = false,
}) => {
  if (!log) {
    return (
      <div className="flex min-h-[500px] flex-col items-center justify-center p-8 text-center bg-white rounded-2xl border border-slate-200 shadow-sm">
        <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-slate-50 text-slate-300">
          <Layers className="h-8 w-8" />
        </div>
        <h3 className="font-bold text-slate-700 text-sm">Chọn một lượt ghi nhật ký</h3>
        <p className="mt-1 max-w-xs text-xs text-slate-400 leading-relaxed">
          Nhấp vào bất kỳ dòng nào trong bảng bên trái để xem đầy đủ hồ sơ canh tác 10 trường theo Thông tư 02/2024.
        </p>
      </div>
    );
  }

  const actMeta = ACTIVITY_TYPES_META[log.activity_type] || {
    label: log.activity_type,
    badgeClass: 'bg-slate-100 text-slate-700 border-slate-200',
  };

  const hasGps = log.gps_latitude && log.gps_longitude;
  const googleMapsUrl = hasGps
    ? `https://www.google.com/maps?q=${log.gps_latitude},${log.gps_longitude}`
    : null;

  const isQuarantine = Boolean(log.phi_days && log.phi_days > 0);

  return (
    <aside className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm flex flex-col animate-fade-in text-[13px]">
      {/* Header Styled Identical to Reference Image 4 */}
      <div className="border-b border-slate-100 bg-gradient-to-br from-emerald-50 via-white to-white p-5">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-100 text-emerald-700 shadow-xs">
              <Layers className="h-5 w-5" />
            </div>
            <div>
              <p className="text-[10px] font-bold uppercase tracking-widest text-emerald-600">
                Chi tiết nhật ký canh tác (TT02)
              </p>
              <h3 className="mt-0.5 text-base sm:text-lg font-extrabold text-slate-900 leading-snug">
                {log.plot_code} • {log.plot_name || 'Vùng trồng ớt Sweet Palermo'}
              </h3>
            </div>
          </div>

          <div className="flex items-center gap-1.5 shrink-0">
            {isReadOnly ? (
              <span className="inline-flex items-center gap-1.5 rounded-lg border border-slate-300 bg-slate-100 px-2.5 py-1 text-xs font-bold text-slate-600">
                <Lock className="h-3.5 w-3.5 text-slate-500" />
                <span>Khóa kiểm toán OCOP</span>
              </span>
            ) : (
              <>
                <button
                  onClick={() => onEdit(log)}
                  className="inline-flex items-center gap-1 rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-xs font-bold text-slate-700 shadow-2xs hover:border-emerald-300 hover:text-emerald-700 hover:bg-emerald-50/50 transition cursor-pointer"
                  title="Chỉnh sửa lượt ghi này"
                >
                  <Pencil className="h-3.5 w-3.5 text-slate-500" />
                  <span>Sửa</span>
                </button>
                <button
                  onClick={() => onDelete(log)}
                  className="inline-flex items-center justify-center h-8 w-8 rounded-lg border border-slate-200 bg-white text-slate-400 hover:text-rose-600 hover:bg-rose-50 shadow-2xs transition cursor-pointer"
                  title="Xóa lượt ghi này"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              </>
            )}
            {onClose && (
              <button
                onClick={onClose}
                className="inline-flex items-center justify-center h-8 w-8 rounded-lg border border-slate-200 bg-white text-slate-400 hover:text-slate-700 hover:bg-slate-50 shadow-2xs transition cursor-pointer"
                title="Đóng bảng chi tiết"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>
        </div>

        {/* Status Badges Row */}
        <div className="mt-3.5 flex flex-wrap items-center justify-between gap-2 rounded-xl border border-white bg-white/80 px-3.5 py-2.5 shadow-xs">
          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-500 font-medium">Hoạt động:</span>
            <span className={`rounded-full border px-2.5 py-0.5 text-[11px] font-bold ${actMeta.badgeClass}`}>
              {actMeta.label}
            </span>
          </div>

          <div className="flex items-center gap-1.5">
            {isQuarantine ? (
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-extrabold bg-rose-100 text-rose-900 border border-rose-300 animate-pulse">
                <ShieldAlert className="w-3.5 h-3.5 text-rose-600" /> Cách ly {log.phi_days} ngày
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-50 text-emerald-800 border border-emerald-200">
                <CheckCircle className="w-3.5 h-3.5 text-emerald-600" /> An toàn (0 ngày)
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Detail Content Body */}
      <div className="p-5 space-y-4 overflow-y-auto max-h-[calc(100vh-280px)]">
        {/* Metadata Grid */}
        <div className="grid grid-cols-2 gap-3">
          <div className="rounded-xl bg-slate-50 p-3 border border-slate-100">
            <p className="text-[11px] font-medium text-slate-400">Mã nhật ký</p>
            <p className="mt-1 font-mono font-bold text-slate-800 text-xs truncate">{log.id}</p>
          </div>

          <div className="rounded-xl bg-slate-50 p-3 border border-slate-100">
            <p className="text-[11px] font-medium text-slate-400">Ngày thực hiện</p>
            <p className="mt-1 font-bold text-slate-900 text-xs flex items-center gap-1">
              <Calendar className="w-3.5 h-3.5 text-emerald-600" />
              {log.activity_date}
            </p>
          </div>

          <div className="col-span-2 rounded-xl bg-slate-50 p-3 border border-slate-100">
            <p className="text-[11px] font-medium text-slate-400">Mùa vụ canh tác</p>
            <p className="mt-1 text-xs font-semibold text-slate-800">
              {log.crop_season_name || 'Vụ Ớt Chuông Sweet Palermo Thu Đông 2026'}
            </p>
          </div>
        </div>

        {/* Material & Volume Section */}
        <div className="rounded-2xl border border-slate-200/90 bg-white p-3.5 space-y-2.5 shadow-2xs">
          <div className="flex items-center justify-between">
            <h4 className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
              <Package className="w-4 h-4 text-emerald-600" />
              Vật tư nông nghiệp & Liều lượng
            </h4>
            {log.quantity_applied && (
              <span className="font-black text-xs text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                {log.quantity_applied} {log.unit || 'Lít'}
              </span>
            )}
          </div>

          {log.material_name ? (
            <div className="space-y-1.5 text-xs">
              <div className="font-bold text-slate-900">{log.material_name}</div>
              <div className="flex flex-wrap items-center gap-2 text-[11px] font-mono text-slate-500">
                {log.material_sku && (
                  <span className="bg-slate-100 px-1.5 py-0.5 rounded border border-slate-200">
                    SKU: {log.material_sku}
                  </span>
                )}
                {log.material_batch_number && (
                  <span className="bg-blue-50 text-blue-800 px-1.5 py-0.5 rounded border border-blue-200 font-semibold">
                    Lô: {log.material_batch_number}
                  </span>
                )}
              </div>
            </div>
          ) : (
            <p className="text-xs text-slate-400 italic">
              Không dùng vật tư hóa chất (chăm sóc cơ giới / tỉa cành / làm đất).
            </p>
          )}
        </div>

        {/* PHI Guard Info */}
        <div className={`rounded-2xl border p-3.5 space-y-2 ${
          isQuarantine ? 'border-amber-300 bg-amber-50/80 text-amber-950' : 'border-emerald-200 bg-emerald-50/40 text-emerald-950'
        }`}>
          <div className="flex items-center justify-between text-xs">
            <span className="font-bold flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              Khóa an toàn cách ly PHI
            </span>
            <span className="font-extrabold">
              {log.phi_days ? `${log.phi_days} ngày cách ly` : '0 ngày'}
            </span>
          </div>
          <div className="text-xs flex items-center justify-between pt-1 border-t border-slate-200/50">
            <span className="text-slate-500 text-[11px]">Ngày an toàn thu hoạch:</span>
            <span className="font-black text-xs text-slate-900">
              {log.safe_harvest_date || log.activity_date}
            </span>
          </div>
        </div>

        {/* GPS Location & Evidence Photos */}
        <div className="rounded-2xl border border-slate-200/90 bg-white p-3.5 space-y-3 shadow-2xs">
          <h4 className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
            <MapPin className="w-4 h-4 text-emerald-600" />
            Vị trí hiện trường & Minh chứng thực tế
          </h4>

          {/* GPS Coordinates */}
          <div className="text-xs space-y-1">
            <span className="text-[11px] text-slate-400 block">Tọa độ GPS ghi nhận:</span>
            {hasGps ? (
              <div className="flex items-center justify-between gap-2 bg-slate-50 p-2 rounded-xl border border-slate-200">
                <span className="font-mono text-xs font-bold text-slate-800">
                  {log.gps_latitude?.toFixed(4)}° N, {log.gps_longitude?.toFixed(4)}° E
                </span>
                {googleMapsUrl && (
                  <a
                    href={googleMapsUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700 hover:text-emerald-800 underline decoration-emerald-400"
                  >
                    <ExternalLink className="w-3 h-3" />
                    Google Maps
                  </a>
                )}
              </div>
            ) : (
              <span className="text-slate-400 italic text-[11px]">Chưa gắn tọa độ GPS</span>
            )}
          </div>

          {/* Evidence Photos */}
          {log.attachment_reference && log.attachment_reference.length > 0 && (
            <div className="space-y-1.5 pt-1 border-t border-slate-100">
              <span className="text-[11px] text-slate-400 block">Ảnh chụp hiện trường ({log.attachment_reference.length}):</span>
              <div className="flex gap-2 overflow-x-auto py-1">
                {log.attachment_reference.map((photo, i) => (
                  <button
                    key={i}
                    onClick={() => onViewPhoto(photo)}
                    className="relative h-20 w-28 shrink-0 rounded-xl overflow-hidden border border-slate-200 shadow-2xs hover:opacity-90 transition group cursor-pointer"
                  >
                    <img src={photo} alt={`Minh chứng ${i + 1}`} className="w-full h-full object-cover" />
                    <div className="absolute inset-0 bg-black/20 group-hover:bg-black/0 transition" />
                    <div className="absolute bottom-1 right-1 bg-black/60 rounded px-1 py-0.2 text-[9px] text-white font-bold">
                      #{i + 1}
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Performer & Notes */}
        <div className="rounded-2xl border border-slate-200/90 bg-white p-3.5 space-y-2 shadow-2xs">
          <div className="flex items-center justify-between text-xs">
            <span className="text-[11px] text-slate-400 font-medium">Người thực hiện:</span>
            <span className="font-bold text-slate-800 flex items-center gap-1">
              <User className="w-3.5 h-3.5 text-emerald-600" />
              {log.performer_name || log.performed_by || 'Xã viên HTX Tân Tiến'}
            </span>
          </div>

          {log.description && (
            <div className="pt-2 border-t border-slate-100">
              <span className="text-[11px] text-slate-400 block mb-1">Mô tả công việc:</span>
              <p className="text-xs text-slate-700 bg-slate-50 p-2.5 rounded-xl border border-slate-200 leading-relaxed font-medium">
                {log.description}
              </p>
            </div>
          )}
        </div>
      </div>
    </aside>
  );
};
