import React, { useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import {
  Plus,
  Search,
  ShieldAlert,
  CheckCircle,
  AlertTriangle,
  Camera,
  MapPin,
  Filter,
  FileSpreadsheet,
  Eye,
  Pencil,
  Trash2,
  X,
  AlertOctagon,
} from 'lucide-react';
import { fetchFarmingLogs, deleteFarmingLog } from '@/services/farmingLogApi';
import { QuickMobileLogModal } from '../components/QuickMobileLogModal';
import { FarmingLogDetailModal } from '../components/FarmingLogDetailModal';
import { EditFarmingLogModal } from '../components/EditFarmingLogModal';
import { ACTIVITY_TYPES_META } from '@/types/agriculture';
import type { FarmingLog } from '@/types/agriculture';
import { exportToExcel } from '@/utils/exportUtils';
import { useToast } from '@/components/ui/ToastNotification';

export const FarmingLogsPage: React.FC = () => {
  const queryClient = useQueryClient();
  const { showToast } = useToast();

  const [search, setSearch] = useState('');
  const [selectedActivity, setSelectedActivity] = useState<string>('ALL');
  const [isLogModalOpen, setIsLogModalOpen] = useState(false);
  const [selectedPhoto, setSelectedPhoto] = useState<string | null>(null);

  // Detail & Edit Modals State
  const [selectedLogForDetail, setSelectedLogForDetail] = useState<FarmingLog | null>(null);
  const [selectedLogForEdit, setSelectedLogForEdit] = useState<FarmingLog | null>(null);
  const [logToDelete, setLogToDelete] = useState<FarmingLog | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const { data: logsList = [], isLoading } = useQuery<FarmingLog[]>({
    queryKey: ['farming-logs', search, selectedActivity],
    queryFn: async () => {
      return fetchFarmingLogs({
        search: search.trim() || undefined,
        activity_type: selectedActivity !== 'ALL' ? selectedActivity : undefined,
      });
    },
  });

  const handleExportExcel = () => {
    if (!logsList || logsList.length === 0) {
      showToast('Không có dữ liệu nhật ký canh tác để xuất!', 'warning');
      return;
    }

    const exportRows = logsList.map((log, index) => {
      const act = ACTIVITY_TYPES_META[log.activity_type]?.label || log.activity_type;
      return {
        'STT': index + 1,
        'Mã nhật ký': log.id,
        'Ngày thực hiện': log.activity_date,
        'Mã thửa đất': log.plot_code,
        'Tên thửa đất': log.plot_name || 'Vùng trồng ớt Sweet Palermo',
        'Hoạt động TT02': act,
        'Vật tư / Chế phẩm': log.material_name || 'Không dùng',
        'Mã SKU vật tư': log.material_sku || '',
        'Số lô sản xuất vật tư': log.material_batch_number || '',
        'Khối lượng / Liều lượng': log.quantity_applied ? `${log.quantity_applied} ${log.unit || ''}` : '-',
        'Số ngày cách ly (PHI)': log.phi_days ? `${log.phi_days} ngày` : '0 ngày',
        'Ngày an toàn thu hoạch': log.safe_harvest_date || log.activity_date,
        'Tọa độ GPS': log.gps_latitude && log.gps_longitude ? `${log.gps_latitude}, ${log.gps_longitude}` : '',
        'Người thực hiện': log.performer_name || log.performed_by || 'Xã viên HTX Tân Tiến',
        'Mô tả chi tiết': log.description || '',
      };
    });

    exportToExcel(exportRows, 'Nhat_Ky_Canh_Tac_TT02_HTX_Tan_Tien', 'NhatKyCanhTac');
    showToast('Xuất sổ nhật ký canh tác sang file Excel (.xlsx) thành công!', 'success');
  };

  const handleDeleteLog = async () => {
    if (!logToDelete) return;
    try {
      setIsDeleting(true);
      await deleteFarmingLog(logToDelete.id);
      showToast(`Đã xóa lượt ghi nhật ký [${logToDelete.id}] thành công`, 'success');
      setLogToDelete(null);
      queryClient.invalidateQueries({ queryKey: ['farming-logs'] });
    } catch (err: any) {
      showToast(err.message || 'Xóa nhật ký thất bại', 'error');
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="space-y-5 pb-12 animate-fade-in text-[13px]">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">
            Nhật Ký Canh Tác Điện Tử 10 Trường (Thông tư 02/2024/TT-BNNPTNT)
          </h1>
          <p className="text-xs sm:text-[13px] text-slate-500 mt-0.5">
            HTX Tân Tiến Đà Lạt • Quản lý nhật ký thời gian thực, liên thông PHI Guard, tọa độ GPS và số lô vật tư.
          </p>
        </div>
        <div className="flex items-center gap-2.5 self-start sm:self-auto flex-wrap">
          <button
            onClick={handleExportExcel}
            className="min-h-[44px] inline-flex items-center gap-1.5 px-4 py-2 rounded-2xl bg-white border border-slate-300 hover:bg-slate-50 active:scale-95 text-slate-700 font-bold text-xs sm:text-sm shadow-2xs transition-all cursor-pointer"
            title="Xuất dữ liệu 10 trường sang Excel"
          >
            <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
            <span>Xuất Excel (.xlsx)</span>
          </button>
          <button
            onClick={() => setIsLogModalOpen(true)}
            className="min-h-[44px] inline-flex items-center gap-2 px-5 py-2 rounded-2xl bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white font-extrabold text-xs sm:text-sm shadow-md hover:shadow-lg transition-all cursor-pointer"
          >
            <Plus className="w-5 h-5 stroke-[2.5]" />
            <span>Ghi nhật ký mới (TT02)</span>
          </button>
        </div>
      </div>

      {/* Notice Banner PHI Guard */}
      <div className="p-4 bg-amber-50/90 border border-amber-300 rounded-2xl text-amber-950 flex items-start gap-3.5 shadow-2xs">
        <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
        <div>
          <h4 className="font-extrabold text-amber-950 text-sm">
            Khóa an toàn PHI (Pre-Harvest Interval) đang giám sát liên tục:
          </h4>
          <p className="mt-1 text-xs text-amber-900 leading-relaxed">
            Hệ thống tự động tính toán <code className="bg-amber-100 px-1 py-0.5 rounded text-amber-950 font-mono">safe_harvest_date = activity_date + phi_days</code> khi ghi nhận phun thuốc BVTV.
            Mọi nỗ lực thu hoạch sớm trước ngày an toàn sẽ bị <strong>chặn 100% bằng mã lỗi ERR_HARVEST_PHI_VIOLATION</strong> theo quy định an toàn thực phẩm.
          </p>
        </div>
      </div>

      {/* Main Table Card */}
      <div className="bg-white border border-slate-200 rounded-2xl shadow-subtle overflow-hidden">
        {/* Filters Bar */}
        <div className="p-4 border-b border-slate-200 bg-slate-50/70 flex flex-wrap items-center justify-between gap-3">
          <div className="relative flex-1 min-w-[260px]">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Tìm theo mã thửa, vật tư, hoạt động, số lô, người thực hiện..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-white border border-slate-200 rounded-xl text-xs sm:text-[13px] text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
            />
          </div>

          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-slate-500 shrink-0" />
            <select
              value={selectedActivity}
              onChange={(e) => setSelectedActivity(e.target.value)}
              className="min-h-[38px] px-3 py-1.5 bg-white border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 focus:outline-none focus:border-emerald-500"
            >
              <option value="ALL">Tất cả hoạt động</option>
              <option value="LAND_PREPARATION">Làm đất & Xử lý giá thể</option>
              <option value="FERTILIZATION">Bón phân & Dinh dưỡng</option>
              <option value="SPRAYING">Phun thuốc BVTV & Chế phẩm</option>
              <option value="CARE">Chăm sóc & Tỉa cành</option>
              <option value="HARVEST">Thu hoạch</option>
            </select>
          </div>
        </div>

        {/* Table Content */}
        <div className="overflow-x-auto">
          {isLoading ? (
            <div className="p-12 text-center text-slate-400 text-xs font-medium">
              Đang tải nhật ký canh tác...
            </div>
          ) : logsList.length === 0 ? (
            <div className="p-12 text-center text-slate-400 text-xs font-medium">
              Chưa có dữ liệu nhật ký canh tác phù hợp. Bấm "Ghi nhật ký mới (TT02)" để thêm lượt ghi nhận đầu tiên.
            </div>
          ) : (
            <table className="w-full text-left border-collapse text-[12.8px]">
              <thead>
                <tr className="border-b border-slate-200 text-[11px] uppercase tracking-wider text-slate-400 font-extrabold bg-slate-50">
                  <th className="py-3 px-4">Ngày thực hiện</th>
                  <th className="py-3 px-4">Thửa đất & Vùng trồng</th>
                  <th className="py-3 px-4">Hoạt động TT02</th>
                  <th className="py-3 px-4">Vật tư & Số lô SX</th>
                  <th className="py-3 px-4">Khối lượng</th>
                  <th className="py-3 px-4">Kiểm soát PHI</th>
                  <th className="py-3 px-4">Tọa độ GPS</th>
                  <th className="py-3 px-4">Minh chứng</th>
                  <th className="py-3 px-4">Người thực hiện</th>
                  <th className="py-3 px-4 text-center">Thao tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {logsList.map((log: FarmingLog) => {
                  const actMeta = ACTIVITY_TYPES_META[log.activity_type] || {
                    label: log.activity_type,
                    badgeClass: 'bg-slate-100 text-slate-700 border-slate-200',
                  };

                  return (
                    <tr key={log.id} className="hover:bg-slate-50/80 transition-colors">
                      {/* 1. Date */}
                      <td className="py-3.5 px-4 font-semibold text-slate-800 whitespace-nowrap">
                        {log.activity_date}
                      </td>

                      {/* 2. Plot & Season */}
                      <td className="py-3.5 px-4">
                        <div className="font-bold text-slate-900">{log.plot_code}</div>
                        <div className="text-[11px] text-slate-400 line-clamp-1 max-w-[180px]">
                          {log.plot_name || log.crop_season_name || 'Vùng trồng ớt Sweet Palermo'}
                        </div>
                      </td>

                      {/* 3. Activity Type */}
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <span
                          className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold border ${actMeta.badgeClass}`}
                        >
                          {actMeta.label}
                        </span>
                        {log.description && (
                          <div className="text-[11px] text-slate-500 mt-1 line-clamp-1 max-w-[200px]" title={log.description}>
                            {log.description}
                          </div>
                        )}
                      </td>

                      {/* 4. Material & Batch */}
                      <td className="py-3.5 px-4">
                        {log.material_name ? (
                          <div>
                            <div className="font-semibold text-emerald-800">{log.material_name}</div>
                            {log.material_batch_number && (
                              <div className="text-[11px] font-mono text-slate-500 flex items-center gap-1 mt-0.5">
                                <span className="bg-slate-100 px-1 py-0.2 rounded border border-slate-200">
                                  Lô: {log.material_batch_number}
                                </span>
                              </div>
                            )}
                          </div>
                        ) : (
                          <span className="text-slate-400 italic">Không dùng vật tư</span>
                        )}
                      </td>

                      {/* 5. Quantity */}
                      <td className="py-3.5 px-4 font-bold text-slate-800 whitespace-nowrap">
                        {log.quantity_applied ? `${log.quantity_applied} ${log.unit || ''}` : '-'}
                      </td>

                      {/* 6. PHI Safety */}
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        {log.phi_days && log.phi_days > 0 ? (
                          <div className="flex flex-col gap-0.5">
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-extrabold bg-rose-100 text-rose-800 border border-rose-300">
                              <ShieldAlert className="w-3.5 h-3.5 text-rose-600" /> Cách ly {log.phi_days} ngày
                            </span>
                            {log.safe_harvest_date && (
                              <span className="text-[10.5px] font-medium text-slate-500">
                                An toàn từ: {log.safe_harvest_date}
                              </span>
                            )}
                          </div>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                            <CheckCircle className="w-3.5 h-3.5 text-emerald-600" /> An toàn (0 ngày)
                          </span>
                        )}
                      </td>

                      {/* 7. GPS Coordinates */}
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        {log.gps_latitude && log.gps_longitude ? (
                          <span className="inline-flex items-center gap-1 font-mono text-[11px] text-slate-700 bg-slate-100 px-2 py-0.5 rounded border border-slate-200">
                            <MapPin className="w-3 h-3 text-emerald-600" />
                            {log.gps_latitude.toFixed(4)}, {log.gps_longitude.toFixed(4)}
                          </span>
                        ) : (
                          <span className="text-slate-400 text-xs italic">Chưa gắn GPS</span>
                        )}
                      </td>

                      {/* 8. Evidence Photo */}
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        {log.attachment_reference && log.attachment_reference.length > 0 ? (
                          <button
                            onClick={() => setSelectedPhoto(log.attachment_reference![0])}
                            className="inline-flex items-center gap-1 text-xs font-bold text-emerald-700 hover:text-emerald-800 underline decoration-emerald-400 cursor-pointer"
                          >
                            <Camera className="w-3.5 h-3.5 text-emerald-600" />
                            Xem ảnh ({log.attachment_reference.length})
                          </button>
                        ) : (
                          <span className="text-slate-300 text-xs">-</span>
                        )}
                      </td>

                      {/* 9. Performer */}
                      <td className="py-3.5 px-4 text-slate-700 font-medium whitespace-nowrap">
                        {log.performer_name || log.performed_by || 'Xã viên HTX Tân Tiến'}
                      </td>

                      {/* 10. Actions (View, Edit, Delete) */}
                      <td className="py-3.5 px-4 whitespace-nowrap text-center">
                        <div className="flex items-center justify-center gap-1">
                          <button
                            onClick={() => setSelectedLogForDetail(log)}
                            title="Xem chi tiết 10 trường TT02"
                            className="p-1.5 text-slate-500 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors cursor-pointer"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => setSelectedLogForEdit(log)}
                            title="Chỉnh sửa nhật ký"
                            className="p-1.5 text-slate-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors cursor-pointer"
                          >
                            <Pencil className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => setLogToDelete(log)}
                            title="Xóa nhật ký canh tác"
                            className="p-1.5 text-slate-500 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* Quick Mobile Logging Modal */}
      <QuickMobileLogModal
        isOpen={isLogModalOpen}
        onClose={() => setIsLogModalOpen(false)}
        onSuccess={() => {
          queryClient.invalidateQueries({ queryKey: ['farming-logs'] });
        }}
      />

      {/* Farming Log Detail Modal (10 Fields TT02) */}
      <FarmingLogDetailModal
        isOpen={!!selectedLogForDetail}
        onClose={() => setSelectedLogForDetail(null)}
        log={selectedLogForDetail}
      />

      {/* Edit Farming Log Modal */}
      <EditFarmingLogModal
        isOpen={!!selectedLogForEdit}
        onClose={() => setSelectedLogForEdit(null)}
        log={selectedLogForEdit}
        onSuccess={() => {
          queryClient.invalidateQueries({ queryKey: ['farming-logs'] });
        }}
      />

      {/* Delete Confirmation Modal */}
      {logToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 p-4 backdrop-blur-sm animate-fade-in text-[13px]">
          <div className="w-full max-w-md bg-white rounded-3xl shadow-2xl border border-slate-100 overflow-hidden p-6 space-y-4">
            <div className="flex items-center gap-3 text-rose-600">
              <div className="p-3 bg-rose-100 rounded-2xl">
                <AlertOctagon className="w-6 h-6 text-rose-600" />
              </div>
              <div>
                <h3 className="font-black text-slate-900 text-base">Xác Nhận Xóa Nhật Ký</h3>
                <p className="text-xs text-slate-500">Mã lượt ghi: {logToDelete.id}</p>
              </div>
            </div>

            <div className="p-3.5 bg-rose-50/80 rounded-2xl border border-rose-200 text-xs text-rose-900 leading-relaxed">
              Bạn có chắc chắn muốn xóa lượt ghi nhật ký này vào ngày <strong>{logToDelete.activity_date}</strong> trên thửa đất <strong>{logToDelete.plot_code}</strong>?
              <br />
              <span className="text-[11px] text-rose-700 italic mt-1 block">
                * Lưu ý: Lịch sử canh tác cần được lưu giữ tối thiểu 2 năm theo Thông tư 02/2024/TT-BNNPTNT để phục vụ đánh giá OCOP và chứng nhận VietGAP.
              </span>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                onClick={() => setLogToDelete(null)}
                className="px-4 py-2.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 font-bold text-xs transition"
              >
                Hủy bỏ
              </button>
              <button
                onClick={handleDeleteLog}
                disabled={isDeleting}
                className="px-5 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs shadow-md transition disabled:opacity-60"
              >
                {isDeleting ? 'Đang xóa...' : 'Xác nhận Xóa'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Photo Preview Modal */}
      {selectedPhoto && (
        <div
          onClick={() => setSelectedPhoto(null)}
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 p-4 backdrop-blur-sm cursor-pointer"
        >
          <div className="relative max-w-lg max-h-[85vh] rounded-2xl overflow-hidden border border-white/20 shadow-2xl">
            <img src={selectedPhoto} alt="Minh chứng thực tế" className="w-full h-full object-contain" />
            <div className="absolute bottom-0 inset-x-0 bg-black/60 p-3 text-white text-xs font-bold text-center">
              Ảnh minh chứng nhật ký canh tác TT02 - HTX Tân Tiến (Click để đóng)
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
