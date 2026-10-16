import React, { useState, useMemo } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import {
  Plus,
  Search,
  ShieldAlert,
  ShieldCheck,
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
  Layers,
  Sprout,
  Calendar,
  Columns2,
  Maximize2,
  Check,
  Lock,
} from 'lucide-react';
import { fetchFarmingLogs, deleteFarmingLog } from '@/services/farmingLogApi';
import { fetchCropSeasons, CropSeason } from '@/services/cropSeasonApi';
import { Skeleton } from '@/components/ui/Skeleton';
import { QuickMobileLogModal } from '../components/QuickMobileLogModal';
import { FarmingLogDetailModal } from '../components/FarmingLogDetailModal';
import { FarmingLogDetailPanel } from '../components/FarmingLogDetailPanel';
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
  const [selectedSeasonId, setSelectedSeasonId] = useState<string>('ALL');
  const [isLogModalOpen, setIsLogModalOpen] = useState(false);
  const [selectedPhoto, setSelectedPhoto] = useState<string | null>(null);

  // Master-Detail State (Split View)
  const [selectedLogId, setSelectedLogId] = useState<string | null>(null);
  const [isSplitView, setIsSplitView] = useState(true);

  // Detail & Edit Modals State
  const [selectedLogForDetailModal, setSelectedLogForDetailModal] = useState<FarmingLog | null>(null);
  const [selectedLogForEdit, setSelectedLogForEdit] = useState<FarmingLog | null>(null);
  const [logToDelete, setLogToDelete] = useState<FarmingLog | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const { data: seasonsData } = useQuery({
    queryKey: ['cropSeasons'],
    queryFn: () => fetchCropSeasons(),
  });
  const seasons: CropSeason[] = Array.isArray(seasonsData?.data)
    ? seasonsData.data
    : (seasonsData as any) || [];

  const currentSeason = seasons.find((s) => s.id === selectedSeasonId);
  const isSeasonReadOnly = currentSeason?.status === 'COMPLETED';

  const { data: rawLogsList = [], isLoading } = useQuery<FarmingLog[]>({
    queryKey: ['farming-logs', search, selectedActivity],
    queryFn: async () => {
      return fetchFarmingLogs({
        search: search.trim() || undefined,
        activity_type: selectedActivity !== 'ALL' ? selectedActivity : undefined,
      });
    },
  });

  const logsList = useMemo(() => {
    if (selectedSeasonId === 'ALL') return rawLogsList;
    return rawLogsList.filter((l) => l.crop_season_id === selectedSeasonId);
  }, [rawLogsList, selectedSeasonId]);

  // Automatically select first log if none selected
  const activeLog = useMemo(() => {
    if (logsList.length === 0) return null;
    if (!selectedLogId) return logsList[0];
    return logsList.find((l) => l.id === selectedLogId) || logsList[0];
  }, [logsList, selectedLogId]);

  // Statistics for KPI Cards (Hình 3)
  const stats = useMemo(() => {
    const total = logsList.length;
    const sprayCount = logsList.filter(
      (l) => l.activity_type === 'SPRAYING' || l.activity_type === 'FERTILIZATION'
    ).length;
    const quarantineCount = logsList.filter(
      (l) => l.phi_days && l.phi_days > 0
    ).length;
    const gpsAndPhotoCount = logsList.filter(
      (l) => l.gps_latitude && l.attachment_reference && l.attachment_reference.length > 0
    ).length;
    const complianceRate = total > 0 ? Math.round((gpsAndPhotoCount / total) * 100) : 100;

    return {
      total,
      sprayCount,
      quarantineCount,
      complianceRate,
    };
  }, [logsList]);

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
    <div className="space-y-5 pb-12 animate-fade-in text-[13px] text-slate-700">
      {/* 1. Header (Fixes Hình 2: Clean, Balanced, Primary CTA firmly positioned) */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-emerald-100 text-emerald-600 shadow-sm ring-8 ring-emerald-50">
            <Layers className="h-6 w-6" strokeWidth={2.2} />
          </div>
          <div>
            <div className="mb-1 flex items-center gap-2 text-[11px] font-semibold uppercase tracking-wider text-emerald-600">
              <span>Sản xuất & Nhật ký</span>
              <span className="text-slate-300">•</span>
              <span className="bg-emerald-100 text-emerald-800 px-2 py-0.2 rounded-full font-bold">
                Thông tư 02/2024/TT-BNNPTNT
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900">
              Nhật Ký Canh Tác Điện Tử
            </h1>
            <p className="mt-0.5 text-xs sm:text-sm text-slate-500">
              HTX Nông nghiệp Tân Tiến • Giám sát 10 trường quy chuẩn, khóa an toàn PHI Guard và tọa độ GPS hiện trường.
            </p>
          </div>
        </div>

        {isSeasonReadOnly ? (
          <div
            className="min-h-[48px] shrink-0 inline-flex items-center justify-center gap-2 rounded-2xl bg-slate-100 border border-slate-300 px-5 py-3 text-sm font-extrabold text-slate-500 cursor-not-allowed shadow-2xs"
            title="Mùa vụ đã hoàn tất và quyết toán - Dữ liệu đã đóng băng"
          >
            <Lock className="w-4 h-4 text-slate-500" />
            <span>Mùa vụ đã khóa (Read-only)</span>
          </div>
        ) : (
          <button
            onClick={() => setIsLogModalOpen(true)}
            className="min-h-[48px] shrink-0 inline-flex items-center justify-center gap-2 rounded-2xl bg-emerald-600 px-5 py-3 text-sm font-extrabold text-white shadow-lg shadow-emerald-600/20 transition hover:-translate-y-0.5 hover:bg-emerald-700 active:translate-y-0 cursor-pointer"
          >
            <Plus className="w-5 h-5 stroke-[2.5]" />
            <span>Ghi nhật ký mới (TT02)</span>
          </button>
        )}
      </div>

      {/* 2. Top 4 KPI Metric Cards (Implements Hình 3: Balanced Overview) */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {/* Card 1: Tổng lượt ghi */}
        <div className="group rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:border-emerald-200 hover:shadow-md">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-xs font-semibold text-slate-500">Tổng lượt ghi nhật ký</p>
              <p className="mt-2 text-3xl font-extrabold tracking-tight text-slate-900">{stats.total}</p>
              <p className="mt-1 text-xs text-slate-400">Canh tác vụ Thu Đông 2026</p>
            </div>
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
              <Layers className="h-5 w-5" />
            </div>
          </div>
        </div>

        {/* Card 2: Cảnh báo PHI */}
        <div className="group rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:border-rose-200 hover:shadow-md">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-xs font-semibold text-slate-500">Đang cách ly an toàn PHI</p>
              <p className="mt-2 text-3xl font-extrabold tracking-tight text-rose-600 flex items-center gap-1.5">
                {stats.quarantineCount} <span className="text-sm font-bold text-slate-500">lượt</span>
              </p>
              <p className="mt-1 text-xs text-rose-500 font-medium">Khóa tự động lệnh thu hoạch</p>
            </div>
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-rose-50 text-rose-600">
              <ShieldAlert className="h-5 w-5" />
            </div>
          </div>
        </div>

        {/* Card 3: Phun thuốc & Bón phân */}
        <div className="group rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:border-amber-200 hover:shadow-md">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-xs font-semibold text-slate-500">Xử lý dinh dưỡng / BVTV</p>
              <p className="mt-2 text-3xl font-extrabold tracking-tight text-slate-900">
                {stats.sprayCount} <span className="text-sm font-bold text-slate-500">lượt</span>
              </p>
              <p className="mt-1 text-xs text-slate-400">Kiểm soát vật tư & số lô</p>
            </div>
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-amber-50 text-amber-600">
              <Sprout className="h-5 w-5" />
            </div>
          </div>
        </div>

        {/* Card 4: Tỷ lệ minh chứng GPS & Ảnh */}
        <div className="group rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:border-blue-200 hover:shadow-md">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-xs font-semibold text-slate-500">Minh chứng đạt chuẩn số</p>
              <p className="mt-2 text-3xl font-extrabold tracking-tight text-blue-700">
                {stats.complianceRate}%
              </p>
              <p className="mt-1 text-xs text-slate-400">Đầy đủ tọa độ GPS & Ảnh thực tế</p>
            </div>
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
              <Camera className="h-5 w-5" />
            </div>
          </div>
        </div>
      </div>

      {/* Notice Banner PHI Guard */}
      <div className="p-4 bg-amber-50/90 border border-amber-300 rounded-2xl text-amber-950 flex items-start gap-3.5 shadow-2xs">
        <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
        <div>
          <h4 className="font-extrabold text-amber-950 text-sm">
            Khóa an toàn PHI (Pre-Harvest Interval) đang giám sát tự động:
          </h4>
          <p className="mt-1 text-xs text-amber-900 leading-relaxed">
            Hệ thống tự động tính <code className="bg-amber-100 px-1.5 py-0.5 rounded text-amber-950 font-mono font-bold">safe_harvest_date = activity_date + phi_days</code>.
            Mọi nỗ lực thu hoạch trước ngày an toàn sẽ bị <strong>chặn 100% bằng mã lỗi ERR_HARVEST_PHI_VIOLATION</strong> theo Thông tư 02/2024.
          </p>
        </div>
      </div>

      {/* Notice Banner: Season Frozen / Read-Only Guard */}
      {isSeasonReadOnly && (
        <div className="p-4 bg-slate-100 border border-slate-300 rounded-2xl text-slate-800 flex items-start gap-3.5 shadow-2xs animate-fade-in">
          <Lock className="w-5 h-5 text-slate-600 shrink-0 mt-0.5" />
          <div className="flex-1">
            <div className="flex items-center justify-between">
              <h4 className="font-extrabold text-slate-900 text-sm">
                Mùa vụ "{currentSeason?.name}" Đã Hoàn Tất Quyết Toán (Trạng thái: COMPLETED)
              </h4>
              <span className="px-2.5 py-0.5 rounded-full text-[11px] font-black bg-slate-200 text-slate-800 border border-slate-300">
                ĐÃ ĐÓNG BĂNG DỮ LIỆU
              </span>
            </div>
            <p className="mt-1 text-xs text-slate-600 leading-relaxed">
              Dữ liệu canh tác của mùa vụ này đã được khóa cố định nhằm phục vụ thẩm định hồ sơ OCOP và kiểm toán VietGAP theo quy định pháp lý. Hệ thống tự động vô hiệu hóa các thao tác tạo mới, sửa đổi hoặc xóa nhật ký.
            </p>
          </div>
        </div>
      )}

      {/* 3. Table Toolbar with Search, Filter, Excel Export, and View Mode Toggle */}
      <div className="p-4 bg-white border border-slate-200 rounded-2xl shadow-subtle flex flex-wrap items-center justify-between gap-3">
        <div className="relative flex-1 min-w-[280px]">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Tìm theo mã thửa, vật tư, hoạt động, số lô, người thực hiện..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-[13px] text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
          />
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          {/* Season Filter Dropdown */}
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4 text-slate-500 shrink-0" />
            <select
              value={selectedSeasonId}
              onChange={(e) => setSelectedSeasonId(e.target.value)}
              className="min-h-[38px] px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-700 focus:outline-none focus:border-emerald-500"
            >
              <option value="ALL">Tất cả mùa vụ</option>
              {seasons.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name} ({s.status === 'COMPLETED' ? 'Đã đóng / Read-only' : s.status})
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-slate-500 shrink-0" />
            <select
              value={selectedActivity}
              onChange={(e) => setSelectedActivity(e.target.value)}
              className="min-h-[38px] px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 focus:outline-none focus:border-emerald-500"
            >
              <option value="ALL">Tất cả hoạt động</option>
              <option value="LAND_PREPARATION">Làm đất & Xử lý giá thể</option>
              <option value="FERTILIZATION">Bón phân & Dinh dưỡng</option>
              <option value="SPRAYING">Phun thuốc BVTV & Chế phẩm</option>
              <option value="CARE">Chăm sóc & Tỉa cành</option>
              <option value="HARVEST">Thu hoạch</option>
            </select>
          </div>

          {/* Export Excel Button (Cleanly integrated on toolbar) */}
          <button
            onClick={handleExportExcel}
            className="min-h-[38px] inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 font-bold text-xs shadow-2xs transition cursor-pointer"
            title="Xuất dữ liệu 10 trường sang Excel"
          >
            <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
            <span>Xuất Excel</span>
          </button>

          {/* Toggle Split Master-Detail vs Full Table View */}
          <button
            onClick={() => setIsSplitView((prev) => !prev)}
            className={`min-h-[38px] hidden xl:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-bold transition cursor-pointer ${
              isSplitView
                ? 'bg-emerald-50 border-emerald-300 text-emerald-800'
                : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
            }`}
            title={isSplitView ? 'Đang bật chia đôi màn hình Master-Detail' : 'Bật chế độ chia đôi màn hình'}
          >
            {isSplitView ? <Columns2 className="w-4 h-4 text-emerald-600" /> : <Maximize2 className="w-4 h-4 text-slate-500" />}
            <span>{isSplitView ? 'Chia đôi màn hình' : 'Xem toàn bảng'}</span>
          </button>
        </div>
      </div>

      {/* 4. Master-Detail Split View (Implements Hình 4 & Fixes Hình 1) */}
      <div className={`grid grid-cols-1 ${isSplitView ? 'xl:grid-cols-[minmax(0,1.55fr)_minmax(380px,0.95fr)]' : ''} gap-5 items-start`}>
        {/* Left: Master Table Section */}
        <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm flex flex-col">
          <div className="flex items-center justify-between border-b border-slate-100 px-5 py-3.5 bg-slate-50/70">
            <div>
              <h2 className="text-sm font-extrabold text-slate-800">Danh sách nhật ký canh tác</h2>
              <p className="mt-0.5 text-xs text-slate-400">
                {logsList.length} lượt ghi • Click chọn dòng để xem chi tiết bên phải
              </p>
            </div>
            <div className="text-xs text-slate-400 font-medium hidden sm:block">
              Chuẩn Thông tư 02/2024
            </div>
          </div>

          <div className="overflow-x-auto">
            {isLoading ? (
              <div className="p-4 space-y-3">
                {Array.from({ length: 5 }).map((_, idx) => (
                  <div key={idx} className="flex items-center gap-4 py-3 border-b border-slate-100 animate-pulse">
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
                Chưa có dữ liệu nhật ký canh tác phù hợp. Bấm "Ghi nhật ký mới (TT02)" để thêm lượt ghi đầu tiên.
              </div>
            ) : (
              <table className="w-full text-left border-collapse text-[12.8px] min-w-[750px]">
                <thead>
                  <tr className="border-b border-slate-200 text-[11px] uppercase tracking-wider text-slate-400 font-extrabold bg-slate-50">
                    <th className="py-3 px-4 min-w-[105px]">Ngày</th>
                    <th className="py-3 px-4 min-w-[160px]">Thửa đất</th>
                    <th className="py-3 px-4 min-w-[170px]">Hoạt động TT02</th>
                    <th className="py-3 px-4 min-w-[170px]">Vật tư / Khối lượng</th>
                    <th className="py-3 px-4 min-w-[140px]">Kiểm soát PHI</th>
                    <th className="py-3 px-4 text-center min-w-[90px]">Thao tác</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {logsList.map((log: FarmingLog) => {
                    const actMeta = ACTIVITY_TYPES_META[log.activity_type] || {
                      label: log.activity_type,
                      badgeClass: 'bg-slate-100 text-slate-700 border-slate-200',
                    };

                    const isSelected = activeLog?.id === log.id;

                    return (
                      <tr
                        key={log.id}
                        onClick={() => setSelectedLogId(log.id)}
                        className={`cursor-pointer transition-all ${
                          isSelected
                            ? 'bg-emerald-50/70 ring-2 ring-emerald-500/40 font-medium'
                            : 'hover:bg-slate-50/80 bg-white'
                        }`}
                      >
                        {/* 1. Date */}
                        <td className="py-3.5 px-4 font-semibold text-slate-900 whitespace-nowrap">
                          <div className="flex items-center gap-1.5">
                            {isSelected && <span className="w-1.5 h-1.5 rounded-full bg-emerald-600" />}
                            <span>{log.activity_date}</span>
                          </div>
                        </td>

                        {/* 2. Plot */}
                        <td className="py-3.5 px-4">
                          <div className="font-bold text-slate-900 whitespace-nowrap">{log.plot_code}</div>
                          <div className="text-[11px] text-slate-400 truncate max-w-[160px]">
                            {log.plot_name || 'Vùng ớt Sweet Palermo'}
                          </div>
                        </td>

                        {/* 3. Activity Type */}
                        <td className="py-3.5 px-4">
                          <span
                            className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold border whitespace-nowrap ${actMeta.badgeClass}`}
                          >
                            {actMeta.label}
                          </span>
                          {log.description && (
                            <div className="text-[11px] text-slate-500 mt-1 line-clamp-1 max-w-[180px]" title={log.description}>
                              {log.description}
                            </div>
                          )}
                        </td>

                        {/* 4. Material & Quantity */}
                        <td className="py-3.5 px-4">
                          {log.material_name ? (
                            <div>
                              <div className="font-semibold text-emerald-800 line-clamp-1 max-w-[170px]" title={log.material_name}>
                                {log.material_name}
                              </div>
                              <div className="text-[11px] font-medium text-slate-500">
                                {log.quantity_applied ? `${log.quantity_applied} ${log.unit || ''}` : '-'}
                              </div>
                            </div>
                          ) : (
                            <span className="text-slate-400 text-xs italic">Không dùng vật tư</span>
                          )}
                        </td>

                        {/* 5. PHI Safety */}
                        <td className="py-3.5 px-4 whitespace-nowrap">
                          {log.phi_days && log.phi_days > 0 ? (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10.5px] font-extrabold bg-rose-100 text-rose-900 border border-rose-300">
                              <ShieldAlert className="w-3 h-3 text-rose-600" /> Cách ly {log.phi_days} ngày
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10.5px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                              <CheckCircle className="w-3 h-3 text-emerald-600" /> An toàn
                            </span>
                          )}
                        </td>

                        {/* 6. Quick Action Icons */}
                        <td className="py-3.5 px-4 whitespace-nowrap text-center" onClick={(e) => e.stopPropagation()}>
                          <div className="flex items-center justify-center gap-1">
                            <button
                              onClick={() => setSelectedLogForDetailModal(log)}
                              title="Xem chi tiết modal"
                              className="p-1.5 text-slate-400 hover:text-emerald-700 hover:bg-emerald-50 rounded-lg transition-colors cursor-pointer"
                            >
                              <Eye className="w-4 h-4" />
                            </button>
                            {!isSeasonReadOnly && (
                              <>
                                <button
                                  onClick={() => setSelectedLogForEdit(log)}
                                  title="Chỉnh sửa nhật ký"
                                  className="p-1.5 text-slate-400 hover:text-blue-700 hover:bg-blue-50 rounded-lg transition-colors cursor-pointer"
                                >
                                  <Pencil className="w-4 h-4" />
                                </button>
                                <button
                                  onClick={() => setLogToDelete(log)}
                                  title="Xóa nhật ký canh tác"
                                  className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              </>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            )}
          </div>
        </section>

        {/* Right: Master-Detail Inspector Panel (Styled Identical to Reference Image 4) */}
        {isSplitView && (
          <FarmingLogDetailPanel
            log={activeLog}
            onEdit={(log) => setSelectedLogForEdit(log)}
            onDelete={(log) => setLogToDelete(log)}
            onViewPhoto={(photoUrl) => setSelectedPhoto(photoUrl)}
            isReadOnly={isSeasonReadOnly}
          />
        )}
      </div>

      {/* Quick Mobile Logging Modal */}
      <QuickMobileLogModal
        isOpen={isLogModalOpen}
        onClose={() => setIsLogModalOpen(false)}
        onSuccess={() => {
          queryClient.invalidateQueries({ queryKey: ['farming-logs'] });
        }}
      />

      {/* Farming Log Detail Modal (for Mobile/Popup view) */}
      <FarmingLogDetailModal
        isOpen={!!selectedLogForDetailModal}
        onClose={() => setSelectedLogForDetailModal(null)}
        log={selectedLogForDetailModal}
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
                className="px-4 py-2.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 font-bold text-xs transition cursor-pointer"
              >
                Hủy bỏ
              </button>
              <button
                onClick={handleDeleteLog}
                disabled={isDeleting}
                className="px-5 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs shadow-md transition disabled:opacity-60 cursor-pointer"
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
