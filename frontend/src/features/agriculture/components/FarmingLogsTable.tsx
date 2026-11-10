import React from 'react';
import {
  Calendar,
  MapPin,
  Camera,
  ShieldAlert,
  ShieldCheck,
  Eye,
  Pencil,
  Trash2,
  Lock,
  Clock,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Layers,
  Droplets,
} from 'lucide-react';
import { Skeleton } from '@/components/ui/Skeleton';
import { Pagination } from '@/components/ui/Pagination';
import { ACTIVITY_TYPES_META } from '@/types/agriculture';
import type { FarmingLog } from '@/types/agriculture';

interface FarmingLogsTableProps {
  logsList: FarmingLog[];
  paginatedLogs: FarmingLog[];
  activeLog: FarmingLog | null;
  isLoading: boolean;
  isSeasonReadOnly: boolean;
  currentPage: number;
  pageSize: number;
  onPageChange: (page: number) => void;
  onPageSizeChange: (size: number) => void;
  onSelectLog: (id: string) => void;
  onOpenDetailModal: (log: FarmingLog) => void;
  onOpenEditModal: (log: FarmingLog) => void;
  onOpenDeleteModal: (log: FarmingLog) => void;
  onSelectPhoto: (url: string) => void;
  onVerifyLog?: (log: FarmingLog) => void;
  onRejectLog?: (log: FarmingLog) => void;
}

export const FarmingLogsTable: React.FC<FarmingLogsTableProps> = ({
  logsList,
  paginatedLogs,
  activeLog,
  isLoading,
  isSeasonReadOnly,
  currentPage,
  pageSize,
  onPageChange,
  onPageSizeChange,
  onSelectLog,
  onOpenDetailModal,
  onOpenEditModal,
  onOpenDeleteModal,
  onSelectPhoto,
  onVerifyLog,
  onRejectLog,
}) => {
  return (
    <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm flex flex-col">
      <div className="flex items-center justify-between border-b border-slate-100 px-5 py-3.5 bg-slate-50/70">
        <div>
          <h2 className="text-sm font-extrabold text-slate-800">Danh sách nhật ký canh tác</h2>
          <p className="mt-0.5 text-xs text-slate-400">
            {logsList.length} lượt ghi • Nhấn vào dòng để xem chi tiết nhật ký VietGAP
          </p>
        </div>
        <div className="text-xs text-slate-400 font-medium hidden sm:block">
          Chuẩn TCVN 12850:2019
        </div>
      </div>

      <div className="w-full">
        {isLoading ? (
          <div className="p-4 space-y-3">
            {Array.from({ length: 5 }).map((_, idx) => (
              <div
                key={idx}
                className="flex items-center gap-4 py-3 border-b border-slate-100 animate-pulse"
              >
                <Skeleton className="h-4 w-20" />
                <Skeleton className="h-4 w-32" />
                <Skeleton className="h-4 w-28" />
                <Skeleton className="h-4 w-36" />
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-4 w-16 ml-auto" />
              </div>
            ))}
          </div>
        ) : logsList.length === 0 ? (
          <div className="p-12 text-center text-slate-400 text-xs font-medium">
            Chưa có dữ liệu nhật ký canh tác phù hợp. Bấm "Ghi nhật ký mới (TT02)" để thêm lượt ghi
            đầu tiên.
          </div>
        ) : (
          <>
            {/* Mobile Touch Cards (<768px) */}
            <div className="block md:hidden p-3 space-y-3">
              {paginatedLogs.map((log: FarmingLog) => {
                const actMeta = ACTIVITY_TYPES_META[log.activity_type] || {
                  label: log.activity_type,
                  badgeClass: 'bg-slate-100 text-slate-700 border-slate-200',
                };
                const isSelected = activeLog?.id === log.id;

                return (
                  <div
                    key={log.id}
                    onClick={() => {
                      onSelectLog(log.id);
                      onOpenDetailModal(log);
                    }}
                    className={`p-4 rounded-2xl border transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-emerald-50/70 border-emerald-500 shadow-sm'
                        : 'bg-white border-slate-200 hover:border-slate-300 shadow-xs'
                    }`}
                  >
                    <div className="flex items-center justify-between gap-2 mb-2">
                      <div className="flex items-center gap-1.5 font-black text-xs text-slate-900">
                        <Calendar className="w-4 h-4 text-emerald-700" />
                        <span>{log.activity_date}</span>
                      </div>
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[10.5px] font-extrabold border ${actMeta.badgeClass}`}
                      >
                        {actMeta.label}
                      </span>
                    </div>

                    <div className="space-y-1.5 text-xs">
                      <div className="flex items-center justify-between">
                        <span className="text-slate-500">Mã thửa:</span>
                        <strong className="text-slate-800">{log.plot_name || 'Thửa đất'}</strong>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-slate-500">Người thực hiện:</span>
                        <span className="text-slate-700 font-semibold">{log.performer_name}</span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Desktop Table */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full border-collapse text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-200 bg-slate-50 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                    <th className="py-3 px-4">Ngày ghi</th>
                    <th className="py-3 px-4">Thửa đất</th>
                    <th className="py-3 px-4">Hoạt động</th>
                    <th className="py-3 px-4">Vật tư & Liều lượng</th>
                    <th className="py-3 px-4">Cách ly PHI</th>
                    <th className="py-3 px-4">Thẩm định ICS</th>
                    <th className="py-3 px-4">Ảnh & GPS</th>
                    <th className="py-3 px-4">Người thực hiện</th>
                    <th className="py-3 px-4 text-right">Thao tác</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                  {paginatedLogs.map((log: FarmingLog) => {
                    const actMeta = ACTIVITY_TYPES_META[log.activity_type] || {
                      label: log.activity_type,
                      badgeClass: 'bg-slate-100 text-slate-700 border-slate-200',
                    };
                    const isSelected = activeLog?.id === log.id;
                    const hasQuarantine = log.phi_days && log.phi_days > 0;
                    const hasItems = log.items && log.items.length > 0;

                    return (
                      <tr
                        key={log.id}
                        onClick={() => onSelectLog(log.id)}
                        className={`cursor-pointer transition-colors ${
                          isSelected ? 'bg-emerald-50/80 font-bold' : 'hover:bg-slate-50/80'
                        }`}
                      >
                        <td className="py-3 px-4 font-mono font-bold text-slate-900 whitespace-nowrap">
                          {log.activity_date}
                        </td>
                        <td className="py-3 px-4 font-semibold text-slate-800">
                          {log.plot_name || log.plot_code || log.farm_plot_id}
                        </td>
                        <td className="py-3 px-4">
                          <span
                            className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[10.5px] font-bold border ${actMeta.badgeClass}`}
                          >
                            {actMeta.label}
                          </span>
                        </td>
                        <td className="py-3 px-4">
                          <div className="break-words text-slate-800 font-medium space-y-0.5">
                            {hasItems ? (
                              <div>
                                {log.items!.length > 1 && (
                                  <span className="inline-block px-1.5 py-0.5 rounded text-[10px] font-black bg-purple-100 text-purple-800 border border-purple-200 mb-1">
                                    Tank-Mix ({log.items!.length} món)
                                  </span>
                                )}
                                {log.items!.map((it, idx) => (
                                  <div key={idx} className="text-[11px] text-slate-800">
                                    • {it.item_name || it.material_name} ({it.dosage_per_ha ? `${it.dosage_per_ha}/ha` : `${it.quantity_applied || ''} ${it.unit || ''}`})
                                  </div>
                                ))}
                              </div>
                            ) : log.ec_solution ? (
                              <div className="text-[11px] font-mono font-bold text-teal-800">
                                Dinh dưỡng Fertigation: EC {log.ec_solution} | pH {log.ph_solution || '6.0'}
                              </div>
                            ) : log.materials_used && log.materials_used.length > 0 ? (
                              log.materials_used.map((m: any, idx: number) => (
                                <span key={idx}>
                                  {m.material_name || m.name} ({m.quantity || m.amount}{' '}
                                  {m.unit || 'L'})
                                </span>
                              ))
                            ) : log.material_name ? (
                              <span>
                                {log.material_name} ({log.quantity_applied || ''} {log.unit || ''})
                              </span>
                            ) : (
                              <span className="text-slate-400 italic">Không dùng vật tư</span>
                            )}
                          </div>
                        </td>
                        <td className="py-3 px-4">
                          {hasQuarantine ? (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10.5px] font-bold bg-rose-50 text-rose-700 border border-rose-200">
                              <ShieldAlert className="w-3 h-3 text-rose-600" />
                              {log.phi_days} ngày (đến {log.safe_harvest_date || 'N/A'})
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10.5px] font-medium bg-emerald-50 text-emerald-700">
                              <ShieldCheck className="w-3 h-3" /> An toàn
                            </span>
                          )}
                        </td>
                        {/* ICS Audit Column */}
                        <td className="py-3 px-4 whitespace-nowrap">
                          {log.status === 'VERIFIED' ? (
                            <div className="space-y-0.5">
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10.5px] font-extrabold bg-emerald-50 text-emerald-800 border border-emerald-300">
                                <CheckCircle2 className="w-3 h-3 text-emerald-600" /> Đã thẩm định
                              </span>
                              {log.verifier_name && (
                                <span className="block text-[9.5px] text-slate-500 font-medium">
                                  bởi {log.verifier_name}
                                </span>
                              )}
                            </div>
                          ) : log.status === 'REJECTED' ? (
                            <div className="space-y-0.5">
                              <span
                                className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10.5px] font-extrabold bg-rose-50 text-rose-800 border border-rose-300"
                                title={log.rejection_reason || 'Bị từ chối thẩm định'}
                              >
                                <AlertTriangle className="w-3 h-3 text-rose-600" /> Từ chối
                              </span>
                              {log.rejection_reason && (
                                <span className="block text-[9.5px] text-rose-700 max-w-[120px] truncate" title={log.rejection_reason}>
                                  {log.rejection_reason}
                                </span>
                              )}
                            </div>
                          ) : (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10.5px] font-bold bg-amber-50 text-amber-800 border border-amber-300">
                              <Clock className="w-3 h-3 text-amber-600" /> Chờ duyệt ICS
                            </span>
                          )}

                          {log.is_backdated && (
                            <span className="inline-block px-1.5 py-0.2 rounded text-[9.5px] font-black bg-amber-100 text-amber-900 border border-amber-300 mt-1">
                              Lùi &gt;48h
                            </span>
                          )}
                          {log.hash_sha256 && (
                            <span className="block text-[9px] font-mono text-emerald-800 mt-0.5" title={`SHA-256: ${log.hash_sha256}`}>
                              🔒 {log.hash_sha256.substring(0, 8)}...
                            </span>
                          )}
                        </td>
                        <td className="py-3 px-4" onClick={(e) => e.stopPropagation()}>
                          <div className="flex items-center gap-1.5">
                            {log.attachment_reference && log.attachment_reference.length > 0 ? (
                              <button
                                onClick={() => onSelectPhoto(log.attachment_reference![0])}
                                className="w-7 h-7 rounded-lg overflow-hidden border border-slate-200 hover:scale-110 transition-transform shrink-0"
                                title="Bấm để xem ảnh phóng to"
                              >
                                <img
                                  src={log.attachment_reference[0]}
                                  alt="Minh chứng"
                                  className="w-full h-full object-cover"
                                />
                              </button>
                            ) : (
                              <span className="w-7 h-7 rounded-lg bg-slate-100 flex items-center justify-center text-slate-300">
                                <Camera className="w-3.5 h-3.5" />
                              </span>
                            )}
                            {log.gps_latitude && (
                              <span
                                className={`p-1 rounded-md text-[10px] font-mono flex items-center border ${
                                  log.is_gps_verified === false
                                    ? 'bg-amber-50 text-amber-800 border-amber-300'
                                    : 'text-emerald-700 bg-emerald-50 border-emerald-200'
                                }`}
                                title={`Tọa độ: ${log.gps_latitude}, ${log.gps_longitude}${log.gps_distance_to_edge_meters ? ` (cách mép thửa ${log.gps_distance_to_edge_meters}m)` : ''}`}
                              >
                                <MapPin className="w-3 h-3" />
                              </span>
                            )}
                          </div>
                        </td>
                        <td className="py-3 px-4 whitespace-nowrap text-slate-700">
                          {log.performer_name || 'Mai Văn Tân'}
                        </td>
                        <td
                          className="py-3 px-4 text-right space-x-1 whitespace-nowrap"
                          onClick={(e) => e.stopPropagation()}
                        >
                          {/* ICS Quick Review Actions */}
                          {onVerifyLog && log.status !== 'VERIFIED' && !isSeasonReadOnly && (
                            <button
                              onClick={() => onVerifyLog(log)}
                              className="p-1 text-slate-400 hover:text-emerald-700 transition cursor-pointer"
                              title="Duyệt hợp chuẩn VietGAP (ICS Phê chuẩn)"
                            >
                              <CheckCircle2 className="w-4 h-4 inline text-emerald-600" />
                            </button>
                          )}
                          {onRejectLog && log.status !== 'REJECTED' && !isSeasonReadOnly && (
                            <button
                              onClick={() => onRejectLog(log)}
                              className="p-1 text-slate-400 hover:text-rose-600 transition cursor-pointer"
                              title="Từ chối thẩm định / Yêu cầu giải trình"
                            >
                              <XCircle className="w-4 h-4 inline text-rose-500" />
                            </button>
                          )}

                          <button
                            onClick={() => onOpenDetailModal(log)}
                            className="p-1 text-slate-400 hover:text-emerald-700 transition cursor-pointer"
                            title="Xem chi tiết"
                          >
                            <Eye className="w-4 h-4 inline" />
                          </button>
                          {!isSeasonReadOnly ? (
                            <>
                              <button
                                onClick={() => onOpenEditModal(log)}
                                className="p-1 text-slate-400 hover:text-blue-700 transition cursor-pointer"
                                title="Chỉnh sửa"
                              >
                                <Pencil className="w-4 h-4 inline" />
                              </button>
                              <button
                                onClick={() => onOpenDeleteModal(log)}
                                className="p-1 text-slate-400 hover:text-rose-600 transition cursor-pointer"
                                title="Xóa"
                              >
                                <Trash2 className="w-4 h-4 inline" />
                              </button>
                            </>
                          ) : (
                            <span
                              className="p-1 text-slate-300 cursor-not-allowed inline-block"
                              title="Mùa vụ đã khóa"
                            >
                              <Lock className="w-3.5 h-3.5 inline text-slate-400" />
                            </span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Pagination Controls */}
            {logsList.length > 0 && (
              <div className="border-t border-slate-100 p-3">
                <Pagination
                  currentPage={currentPage}
                  totalItems={logsList.length}
                  pageSize={pageSize}
                  onPageChange={onPageChange}
                  onPageSizeChange={onPageSizeChange}
                  pageSizeOptions={[5, 10, 20, 50]}
                />
              </div>
            )}
          </>
        )}
      </div>
    </section>
  );
};
