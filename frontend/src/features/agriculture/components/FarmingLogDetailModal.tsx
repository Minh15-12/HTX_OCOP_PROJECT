import React from 'react';
import {
  X,
  Calendar,
  MapPin,
  ExternalLink,
  ShieldAlert,
  ShieldCheck,
  CheckCircle,
  Clock,
  Camera,
  Layers,
  FileText,
  User,
  Package,
  Sparkles,
} from 'lucide-react';
import type { FarmingLog } from '@/types/agriculture';
import { ACTIVITY_TYPES_META } from '@/types/agriculture';

interface FarmingLogDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  log: FarmingLog | null;
}

export const FarmingLogDetailModal: React.FC<FarmingLogDetailModalProps> = ({
  isOpen,
  onClose,
  log,
}) => {
  if (!isOpen || !log) return null;

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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 p-4 sm:p-6 backdrop-blur-sm animate-fade-in text-[13px]">
      <div className="relative w-full max-w-2xl max-h-[90vh] bg-white rounded-3xl shadow-2xl border border-slate-100 flex flex-col overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-100 bg-gradient-to-r from-emerald-50/70 via-white to-slate-50 flex items-start justify-between">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="font-mono text-xs font-black text-emerald-800 bg-emerald-100 px-2.5 py-0.5 rounded-full border border-emerald-300">
                {log.id}
              </span>
              <span
                className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold border ${actMeta.badgeClass}`}
              >
                {actMeta.label}
              </span>
              {isQuarantine ? (
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-extrabold bg-rose-100 text-rose-800 border border-rose-300">
                  <ShieldAlert className="w-3.5 h-3.5 text-rose-600" /> Cách ly {log.phi_days} ngày
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800 border border-emerald-300">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" /> An toàn (0 ngày)
                </span>
              )}
            </div>
            <h2 className="text-lg font-black text-slate-900 tracking-tight">
              Chi Tiết Nhật Ký Canh Tác Điện Tử
            </h2>
            <p className="text-xs text-slate-500">
              Quy chuẩn 10 trường Thông tư 02/2024/TT-BNNPTNT • HTX Nông nghiệp Tân Tiến
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body Content */}
        <div className="p-6 overflow-y-auto space-y-5">
          {/* Section 1: Thông tin cơ bản & Thửa đất */}
          <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200/80 space-y-3">
            <h4 className="text-xs font-black text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
              <Layers className="w-4 h-4 text-emerald-600" />
              1. Thửa Đất & Mùa Vụ Canh Tác
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div>
                <span className="text-slate-400 block text-[11px]">Mã thửa đất (Plot Code):</span>
                <span className="font-mono font-bold text-slate-900 text-sm bg-white px-2 py-0.5 rounded border border-slate-200 inline-block mt-0.5">
                  {log.plot_code}
                </span>
              </div>
              <div>
                <span className="text-slate-400 block text-[11px]">Tên thửa đất:</span>
                <span className="font-semibold text-slate-800">
                  {log.plot_name || 'Vùng trồng ớt chuông Sweet Palermo'}
                </span>
              </div>
              <div>
                <span className="text-slate-400 block text-[11px]">Ngày thực hiện hoạt động:</span>
                <span className="font-bold text-slate-900 flex items-center gap-1 mt-0.5">
                  <Calendar className="w-3.5 h-3.5 text-emerald-600" />
                  {log.activity_date}
                </span>
              </div>
              <div>
                <span className="text-slate-400 block text-[11px]">Mùa vụ liên kết:</span>
                <span className="font-medium text-slate-700">
                  {log.crop_season_name || 'Vụ Ớt Chuông Sweet Palermo Thu Đông 2026'}
                </span>
              </div>
            </div>
          </div>

          {/* Section 2: Vật tư & Khối lượng */}
          <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200/80 space-y-3">
            <h4 className="text-xs font-black text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
              <Package className="w-4 h-4 text-emerald-600" />
              2. Vật Tư Nông Nghiệp & Liều Lượng Sử Dụng
            </h4>
            {log.material_name ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div className="sm:col-span-2">
                  <span className="text-slate-400 block text-[11px]">Tên vật tư / chế phẩm sinh học:</span>
                  <span className="font-bold text-emerald-900 text-sm">{log.material_name}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[11px]">Mã số SKU vật tư:</span>
                  <span className="font-mono font-semibold text-slate-800">
                    {log.material_sku || 'Chưa gắn SKU'}
                  </span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[11px]">Số lô sản xuất vật tư:</span>
                  <span className="font-mono font-bold text-slate-800 bg-white px-2 py-0.5 rounded border border-slate-200 inline-block">
                    {log.material_batch_number || 'Chưa có số lô'}
                  </span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[11px]">Khối lượng / Thể tích đã bón:</span>
                  <span className="font-black text-slate-900 text-sm">
                    {log.quantity_applied ? `${log.quantity_applied} ${log.unit || ''}` : '-'}
                  </span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[11px]">Đơn vị tính:</span>
                  <span className="font-medium text-slate-700">{log.unit || 'Lít'}</span>
                </div>
              </div>
            ) : (
              <div className="text-xs text-slate-500 italic bg-white p-3 rounded-xl border border-slate-200">
                Hoạt động không sử dụng vật tư hóa chất / phân bón (chăm sóc cơ giới, tỉa cành hoặc làm đất).
              </div>
            )}
          </div>

          {/* Section 3: Khóa an toàn PHI */}
          <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200/80 space-y-3">
            <h4 className="text-xs font-black text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              3. Giám Sát Thời Gian Cách Ly An Toàn (PHI Guard)
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div>
                <span className="text-slate-400 block text-[11px]">Số ngày cách ly quy định (PHI):</span>
                <span className="font-bold text-slate-900 text-sm">
                  {log.phi_days ? `${log.phi_days} ngày` : '0 ngày (An toàn thu hoạch)'}
                </span>
              </div>
              <div>
                <span className="text-slate-400 block text-[11px]">Ngày an toàn cho phép thu hoạch:</span>
                <span className="font-extrabold text-emerald-800 text-sm">
                  {log.safe_harvest_date || log.activity_date}
                </span>
              </div>
              {isQuarantine && (
                <div className="sm:col-span-2 p-3 bg-amber-50 rounded-xl border border-amber-300 text-amber-900 text-xs">
                  <strong>Khóa tự động:</strong> Lệnh thu hoạch trên thửa đất <code>{log.plot_code}</code> sẽ bị chặn tự động bởi hệ thống cho đến sau ngày{' '}
                  <strong className="underline text-amber-950">{log.safe_harvest_date}</strong> nhằm đảm bảo an toàn thực phẩm.
                </div>
              )}
            </div>
          </div>

          {/* Section 4: Tọa độ GPS & Minh chứng hình ảnh */}
          <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200/80 space-y-3">
            <h4 className="text-xs font-black text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
              <MapPin className="w-4 h-4 text-emerald-600" />
              4. Vị Trí Hiện Trường & Ảnh Minh Chứng Thực Tế
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div>
                <span className="text-slate-400 block text-[11px] mb-1">Tọa độ GPS tại thời điểm ghi nhận:</span>
                {hasGps ? (
                  <div className="space-y-2">
                    <span className="font-mono text-xs font-bold text-slate-800 bg-white px-2.5 py-1 rounded-lg border border-slate-200 block">
                      📍 {log.gps_latitude?.toFixed(5)}° N, {log.gps_longitude?.toFixed(5)}° E
                    </span>
                    {googleMapsUrl && (
                      <a
                        href={googleMapsUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-700 hover:text-emerald-800 underline decoration-emerald-400"
                      >
                        <ExternalLink className="w-3.5 h-3.5" />
                        Mở vị trí trên bản đồ Google Maps
                      </a>
                    )}
                  </div>
                ) : (
                  <span className="text-slate-400 italic">Chưa gắn tọa độ GPS</span>
                )}
              </div>

              <div>
                <span className="text-slate-400 block text-[11px] mb-1">Ảnh minh chứng hiện trường:</span>
                {log.attachment_reference && log.attachment_reference.length > 0 ? (
                  <div className="space-y-2">
                    <div className="h-32 w-full rounded-xl overflow-hidden border border-slate-200 bg-white relative group">
                      <img
                        src={log.attachment_reference[0]}
                        alt="Minh chứng nhật ký"
                        className="w-full h-full object-cover transition group-hover:scale-105"
                      />
                    </div>
                    <span className="text-[11px] text-slate-500">
                      Có {log.attachment_reference.length} tệp hình ảnh đính kèm
                    </span>
                  </div>
                ) : (
                  <span className="text-slate-400 italic">Không có ảnh đính kèm</span>
                )}
              </div>
            </div>
          </div>

          {/* Section 5: Mô tả & Người thực hiện */}
          <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200/80 space-y-3">
            <h4 className="text-xs font-black text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
              <User className="w-4 h-4 text-emerald-600" />
              5. Trách Nhiệm Kỹ Thuật & Ghi Chú Chi Tiết
            </h4>
            <div className="space-y-2 text-xs">
              <div>
                <span className="text-slate-400 block text-[11px]">Người thực hiện / Cán bộ kỹ thuật:</span>
                <span className="font-bold text-slate-900 text-sm">
                  {log.performer_name || log.performed_by || 'Xã viên HTX Tân Tiến'}
                </span>
              </div>
              <div>
                <span className="text-slate-400 block text-[11px]">Nội dung mô tả chi tiết:</span>
                <p className="bg-white p-3 rounded-xl border border-slate-200 text-slate-800 leading-relaxed font-medium">
                  {log.description || 'Không có ghi chú bổ sung.'}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-slate-100 bg-slate-50 flex items-center justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-900 text-white font-bold text-xs shadow-sm transition active:scale-95"
          >
            Đóng
          </button>
        </div>
      </div>
    </div>
  );
};
