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
  Droplets,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  Lock,
} from 'lucide-react';
import type { FarmingLog } from '@/types/agriculture';
import { ACTIVITY_TYPES_META } from '@/types/agriculture';
import { useTenantContextStore } from '@/stores/tenantContextStore';

interface FarmingLogDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  log: FarmingLog | null;
  onEdit?: (log: FarmingLog) => void;
  onDelete?: (log: FarmingLog) => void;
  onVerify?: (log: FarmingLog) => void;
  onReject?: (log: FarmingLog) => void;
}

export const FarmingLogDetailModal: React.FC<FarmingLogDetailModalProps> = ({
  isOpen,
  onClose,
  log,
  onEdit,
  onDelete,
  onVerify,
  onReject,
}) => {
  const { activeCooperative } = useTenantContextStore();

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
      <div className="relative w-full max-w-3xl max-h-[92vh] bg-white rounded-3xl shadow-2xl border border-slate-100 flex flex-col overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-100 bg-gradient-to-r from-emerald-50/70 via-white to-slate-50 flex items-start justify-between">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="font-mono text-xs font-black text-emerald-800 bg-emerald-100 px-2.5 py-0.5 rounded-full border border-emerald-300">
                {log.log_code || log.id}
              </span>
              <span
                className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold border ${actMeta.badgeClass}`}
              >
                {actMeta.label}
              </span>

              {/* ICS Status */}
              {log.status === 'VERIFIED' ? (
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-extrabold bg-emerald-100 text-emerald-900 border border-emerald-300">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-700" /> Đã thẩm định ICS
                </span>
              ) : log.status === 'REJECTED' ? (
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-extrabold bg-rose-100 text-rose-900 border border-rose-300">
                  <AlertTriangle className="w-3.5 h-3.5 text-rose-700" /> Bị từ chối thẩm định
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-100 text-amber-900 border border-amber-300">
                  <Clock className="w-3.5 h-3.5 text-amber-700" /> Chờ thẩm định ICS
                </span>
              )}

              {log.is_backdated && (
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-black bg-amber-100 text-amber-900 border border-amber-300">
                  <AlertTriangle className="w-3.5 h-3.5 text-amber-700" /> Ghi lùi ngày (&gt;48h)
                </span>
              )}

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
              Quy chuẩn 10 trường TCVN 12850:2019 &amp; VietGAP TCVN 11892-1:2017 • {activeCooperative?.legal_name || 'Hợp tác xã'}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
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

          {/* Section 2: Vật tư & Phối trộn Tank-Mix */}
          <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200/80 space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-black text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                <Package className="w-4 h-4 text-emerald-600" />
                2. Vật Tư Nông Nghiệp &amp; Danh Mục Phối Trộn (Tank-Mix)
              </h4>
              {log.items && log.items.length > 1 && (
                <span className="px-2 py-0.5 rounded-full text-[10.5px] font-black bg-purple-100 text-purple-900 border border-purple-200">
                  Phối trộn Tank-Mix ({log.items.length} món)
                </span>
              )}
            </div>

            {log.items && log.items.length > 0 ? (
              <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 text-[10.5px] font-bold text-slate-500 uppercase border-b border-slate-200">
                    <tr>
                      <th className="py-2 px-3">#</th>
                      <th className="py-2 px-3">Tên thuốc / Chế phẩm</th>
                      <th className="py-2 px-3">Hoạt chất / Chủng loại</th>
                      <th className="py-2 px-3">Liều lượng</th>
                      <th className="py-2 px-3">Số lô (Batch)</th>
                      <th className="py-2 px-3">Cách ly PHI</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {log.items.map((it, idx) => (
                      <tr key={idx} className="hover:bg-slate-50/50">
                        <td className="py-2 px-3 font-mono font-bold text-slate-400">{idx + 1}</td>
                        <td className="py-2 px-3 font-bold text-slate-900">{it.item_name}</td>
                        <td className="py-2 px-3 text-slate-600">
                          {it.active_ingredient || 'Vi sinh / Hữu cơ'}
                          {it.resistance_group && (
                            <span className="ml-1 text-[10px] font-mono text-purple-700">[{it.resistance_group}]</span>
                          )}
                        </td>
                        <td className="py-2 px-3 font-semibold text-slate-800">
                          {it.dosage_per_ha ? `${it.dosage_per_ha}/ha` : `${it.quantity_applied || ''} ${it.unit || ''}`}
                        </td>
                        <td className="py-2 px-3 font-mono text-[11px] text-slate-600">{it.material_lot_number || 'N/A'}</td>
                        <td className="py-2 px-3">
                          {it.phi_days && it.phi_days > 0 ? (
                            <span className="text-amber-800 font-bold">{it.phi_days} ngày</span>
                          ) : (
                            <span className="text-emerald-700 font-medium">0 ngày</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : log.material_name ? (
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
                    {log.material_batch_number || log.material_lot_number || 'Chưa có số lô'}
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

          {/* Section 2.1: Tưới phân nhỏ giọt Fertigation Công nghệ cao */}
          {(log.ec_solution || log.tank_composition) && (
            <div className="bg-teal-50/60 p-4 rounded-2xl border border-teal-200/80 space-y-3">
              <h4 className="text-xs font-black text-teal-900 uppercase tracking-wider flex items-center gap-1.5">
                <Droplets className="w-4 h-4 text-teal-700" />
                Thông Số Châm Phân Fertigation Nhà Màng
              </h4>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                <div className="bg-white p-2.5 rounded-xl border border-teal-100">
                  <span className="text-slate-400 block text-[10.5px]">EC Cấp dung dịch:</span>
                  <span className="font-mono font-black text-teal-900 text-sm">{log.ec_solution} mS/cm</span>
                </div>
                <div className="bg-white p-2.5 rounded-xl border border-teal-100">
                  <span className="text-slate-400 block text-[10.5px]">EC Thoát rễ:</span>
                  <span className="font-mono font-black text-teal-900 text-sm">{log.ec_drain || '-'} mS/cm</span>
                </div>
                <div className="bg-white p-2.5 rounded-xl border border-teal-100">
                  <span className="text-slate-400 block text-[10.5px]">pH Dung dịch:</span>
                  <span className="font-mono font-black text-teal-900 text-sm">{log.ph_solution || '6.0'}</span>
                </div>
                <div className="bg-white p-2.5 rounded-xl border border-teal-100">
                  <span className="text-slate-400 block text-[10.5px]">Lượng nước tưới:</span>
                  <span className="font-mono font-black text-teal-900 text-sm">{log.water_volume_liters ? `${log.water_volume_liters} L` : '-'}</span>
                </div>
              </div>
              {log.tank_composition && (
                <div className="space-y-1.5 text-xs bg-white p-3 rounded-xl border border-teal-100">
                  {log.tank_composition.tank_a && (
                    <div>
                      <strong className="text-teal-900 font-bold">Thùng A (Canxi/Sắt):</strong>{' '}
                      <span className="text-slate-700">
                        {typeof log.tank_composition.tank_a === 'string'
                          ? log.tank_composition.tank_a
                          : Array.isArray(log.tank_composition.tank_a)
                          ? log.tank_composition.tank_a.map((i: any) => `${i.name || ''} (${i.kg || i.amount || ''}kg)`).join(', ')
                          : JSON.stringify(log.tank_composition.tank_a)}
                      </span>
                    </div>
                  )}
                  {log.tank_composition.tank_b && (
                    <div>
                      <strong className="text-teal-900 font-bold">Thùng B (Kali/Lân/Magie/Vi lượng):</strong>{' '}
                      <span className="text-slate-700">
                        {typeof log.tank_composition.tank_b === 'string'
                          ? log.tank_composition.tank_b
                          : Array.isArray(log.tank_composition.tank_b)
                          ? log.tank_composition.tank_b.map((i: any) => `${i.name || ''} (${i.kg || i.amount || ''}kg)`).join(', ')
                          : JSON.stringify(log.tank_composition.tank_b)}
                      </span>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

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
              4. Vị Trí Hiện Trường &amp; Kiểm Tra Geofencing Thửa Đất
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div>
                <span className="text-slate-400 block text-[11px] mb-1">Tọa độ GPS tại thời điểm ghi nhận:</span>
                {hasGps ? (
                  <div className="space-y-2">
                    <span className="font-mono text-xs font-bold text-slate-800 bg-white px-2.5 py-1 rounded-lg border border-slate-200 block">
                      📍 {log.gps_latitude?.toFixed(5)}° N, {log.gps_longitude?.toFixed(5)}° E
                    </span>
                    {log.is_gps_verified ? (
                      <span className="inline-flex items-center gap-1 text-[11px] text-emerald-700 font-bold bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                        <CheckCircle2 className="w-3.5 h-3.5" /> Nằm trong ranh giới thửa đất (Hợp lệ)
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-[11px] text-amber-800 font-bold bg-amber-50 px-2 py-0.5 rounded border border-amber-300">
                        <AlertTriangle className="w-3.5 h-3.5 text-amber-600" /> Vị trí cách mép thửa {log.gps_distance_to_edge_meters || 0}m (Dung sai 50m)
                      </span>
                    )}
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
              5. Trách Nhiệm Kỹ Thuật &amp; Ghi Chú Chi Tiết
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

          {/* Section 6: Thẩm Định ICS & Bảo Chứng Chuỗi Băm SHA-256 */}
          <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200/80 space-y-3">
            <h4 className="text-xs font-black text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
              <Lock className="w-4 h-4 text-emerald-600" />
              6. Thẩm Định Hợp Chuẩn ICS &amp; Chuỗi Băm SHA-256 Bất Biến
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div>
                <span className="text-slate-400 block text-[11px]">Trạng thái thẩm định:</span>
                <span className="font-bold text-slate-900">
                  {log.status === 'VERIFIED'
                    ? 'Đã thẩm định hợp chuẩn VietGAP'
                    : log.status === 'REJECTED'
                    ? 'Bị từ chối thẩm định / Cần giải trình'
                    : 'Chờ Tổ trưởng Kỹ thuật ICS phê duyệt'}
                </span>
              </div>
              <div>
                <span className="text-slate-400 block text-[11px]">Người thẩm định:</span>
                <span className="font-semibold text-slate-800">
                  {log.verifier_name || (log.status === 'VERIFIED' ? 'Tổ trưởng Kỹ thuật ICS' : 'Chưa thẩm định')}
                </span>
              </div>
              {log.rejection_reason && (
                <div className="sm:col-span-2 p-3 bg-rose-50 rounded-xl border border-rose-200 text-rose-900 text-xs">
                  <strong className="text-rose-950 font-bold flex items-center gap-1">
                    <AlertTriangle className="w-3.5 h-3.5 text-rose-600" /> Lý do từ chối giải trình:
                  </strong>
                  <p className="mt-1 font-medium">{log.rejection_reason}</p>
                </div>
              )}
              {log.hash_sha256 && (
                <div className="sm:col-span-2 bg-white p-3 rounded-xl border border-slate-200 space-y-1">
                  <span className="text-slate-400 block text-[10.5px]">Mã băm SHA-256 bảo chứng toàn vẹn (Tamper-evident Hash):</span>
                  <code className="font-mono text-[11px] text-emerald-800 break-all select-all block bg-slate-50 p-1.5 rounded border border-slate-200">
                    {log.hash_sha256}
                  </code>
                  {log.prev_hash && (
                    <div className="text-[10px] text-slate-400 font-mono mt-1">
                      Mắt xích trước: {log.prev_hash.substring(0, 16)}...
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Footer with ICS Actions */}
        <div className="px-6 py-4 border-t border-slate-100 bg-slate-50 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            {onVerify && log.status !== 'VERIFIED' && (
              <button
                type="button"
                onClick={() => {
                  onVerify(log);
                  onClose();
                }}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs shadow-xs transition active:scale-95 cursor-pointer"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>Phê chuẩn VietGAP</span>
              </button>
            )}
            {onReject && log.status !== 'REJECTED' && (
              <button
                type="button"
                onClick={() => {
                  onReject(log);
                  onClose();
                }}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-800 border border-rose-300 font-bold text-xs transition active:scale-95 cursor-pointer"
              >
                <XCircle className="w-4 h-4 text-rose-600" />
                <span>Từ chối thẩm định</span>
              </button>
            )}
          </div>

          <button
            onClick={onClose}
            className="px-5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-900 text-white font-bold text-xs shadow-sm transition active:scale-95 cursor-pointer"
          >
            Đóng
          </button>
        </div>
      </div>
    </div>
  );
};
