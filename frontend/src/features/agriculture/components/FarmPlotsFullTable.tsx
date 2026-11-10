import React, { useState, useMemo } from 'react';
import {
  MapPin,
  Pencil,
  Plus,
  Users,
  Trash2,
  ShieldAlert,
  Search,
  Filter,
  Eye,
  FileSpreadsheet,
  CheckCircle2,
} from 'lucide-react';
import { FarmPlot, ProductionUnit } from '@/services/farmPlotApi';
import { PhiCountdownBadge } from './PhiCountdownBadge';
import { Pagination } from '@/components/ui/Pagination';
import { exportToExcel } from '@/utils/exportUtils';
import { useToast } from '@/components/ui/ToastNotification';

const statusText: Record<string, string> = {
  ACTIVE: 'Đang canh tác',
  PREPARING: 'Chuẩn bị đất',
  FALLOW: 'Đang nghỉ vụ',
  INACTIVE: 'Ngưng canh tác',
  UNDER_PUC_REVIEW: 'Chờ đánh giá PUC',
  IN_QUARANTINE: 'Cách ly PHI 🛑',
};

const statusBadgeClasses: Record<string, string> = {
  ACTIVE: 'border-emerald-300 bg-emerald-50 text-emerald-800 font-bold',
  PREPARING: 'border-amber-200 bg-amber-50 text-amber-700',
  FALLOW: 'border-slate-300 bg-slate-100 text-slate-600 font-medium',
  INACTIVE: 'border-red-200 bg-red-50 text-red-600',
  UNDER_PUC_REVIEW: 'border-amber-300 bg-amber-100 text-amber-900 font-bold',
  IN_QUARANTINE: 'border-rose-300 bg-rose-50 text-rose-800 font-extrabold animate-pulse ring-1 ring-rose-200',
};

interface FarmPlotsFullTableProps {
  units?: ProductionUnit[];
  selectedUnit: ProductionUnit | null;
  plots: FarmPlot[];
  plotsLoading: boolean;
  onOpenEditUnitModal: (unit: ProductionUnit) => void;
  onOpenAddPlotModal: () => void;
  onEditPlot: (plot: FarmPlot) => void;
  onOpenAssignments: (plot: FarmPlot) => void;
  onDeletePlot: (plot: FarmPlot) => void;
  onSelectPlot: (plot: FarmPlot) => void;
  selectedPlotId?: string;
  onSwitchToMap?: () => void;
  isAllUnitsMode?: boolean;
}

export const FarmPlotsFullTable: React.FC<FarmPlotsFullTableProps> = ({
  units = [],
  selectedUnit,
  plots,
  plotsLoading,
  onOpenEditUnitModal,
  onOpenAddPlotModal,
  onEditPlot,
  onOpenAssignments,
  onDeletePlot,
  onSelectPlot,
  selectedPlotId,
  onSwitchToMap,
  isAllUnitsMode = false,
}) => {
  const { showToast } = useToast();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  const isViewingAll = !selectedUnit || isAllUnitsMode;

  // Enrich plots with unit info if missing
  const enrichedPlots = useMemo(() => {
    return plots.map((p) => {
      const parent = units.find((u) => u.id === p.production_unit_id);
      return {
        ...p,
        unit_name: p.unit_name || parent?.name || selectedUnit?.name || 'Vùng chuyên canh',
        unit_code: p.unit_code || parent?.unit_code || selectedUnit?.unit_code || '—',
      };
    });
  }, [plots, units, selectedUnit]);

  // Filter plots
  const filteredPlots = useMemo(() => {
    return enrichedPlots.filter((plot) => {
      const matchSearch =
        plot.plot_code.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (plot.unit_name && plot.unit_name.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (plot.unit_code && plot.unit_code.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (plot.gps_coordinates && plot.gps_coordinates.toLowerCase().includes(searchTerm.toLowerCase()));
      const matchStatus = statusFilter === 'ALL' || plot.status === statusFilter;
      return matchSearch && matchStatus;
    });
  }, [enrichedPlots, searchTerm, statusFilter]);

  // Paginated plots
  const paginatedPlots = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredPlots.slice(start, start + pageSize);
  }, [filteredPlots, currentPage, pageSize]);

  // Handle Export Excel
  const handleExportExcel = () => {
    if (plots.length === 0) {
      showToast('Không có dữ liệu thửa đất để xuất!', 'warning');
      return;
    }

    const exportData = filteredPlots.map((p, idx) => ({
      STT: idx + 1,
      'Mã thửa đất': p.plot_code,
      'Vùng sản xuất': p.unit_name,
      'Mã vùng': p.unit_code,
      'Cây trồng': selectedUnit?.crop || 'Theo quy hoạch vùng',
      'Diện tích (ha)': p.area,
      'Diện tích (m²)': Number(p.area) * 10000,
      'Trạng thái': statusText[p.status] || p.status,
      'Tọa độ GPS': p.gps_coordinates || '—',
      'Ngày an toàn PHI': p.safe_harvest_date || 'Không cách ly',
    }));

    const filename = selectedUnit
      ? `Danh_Sach_Thua_Dat_${selectedUnit.unit_code}`
      : `Toan_Bo_Thua_Dat_HTX_${new Date().toISOString().slice(0, 10)}`;

    exportToExcel(exportData, filename, 'ThuaDat');
    showToast('Xuất danh sách thửa đất sang Excel thành công!', 'success');
  };

  const quarantineCount = plots.filter((p) => p.status === 'IN_QUARANTINE').length;
  const activeCount = plots.filter((p) => p.status === 'ACTIVE').length;
  const totalPlotArea = plots.reduce((sum, p) => sum + (Number(p.area) || 0), 0);

  return (
    <div className="space-y-3.5">
      {/* Plots Table Container */}
      <div className="rounded-2xl border border-slate-200 bg-white shadow-xs overflow-hidden">
        {/* Table Toolbar: Search & Status Filters */}
        <div className="border-b border-slate-100 p-3.5 bg-slate-50/50 flex flex-col md:flex-row md:items-center md:justify-between gap-3">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs font-bold text-slate-700 flex items-center gap-1">
              <Filter className="h-3.5 w-3.5 text-slate-400" /> Bộ lọc:
            </span>
            <button
              type="button"
              onClick={() => { setStatusFilter('ALL'); setCurrentPage(1); }}
              className={`rounded-lg px-2.5 py-1 text-xs font-bold transition cursor-pointer ${
                statusFilter === 'ALL'
                  ? 'bg-slate-800 text-white shadow-2xs'
                  : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
              }`}
            >
              Tất cả ({plots.length})
            </button>
            <button
              type="button"
              onClick={() => { setStatusFilter('ACTIVE'); setCurrentPage(1); }}
              className={`rounded-lg px-2.5 py-1 text-xs font-bold transition cursor-pointer ${
                statusFilter === 'ACTIVE'
                  ? 'bg-emerald-700 text-white shadow-2xs'
                  : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
              }`}
            >
              Đang canh tác ({activeCount})
            </button>
            {quarantineCount > 0 && (
              <button
                type="button"
                onClick={() => { setStatusFilter('IN_QUARANTINE'); setCurrentPage(1); }}
                className={`rounded-lg px-2.5 py-1 text-xs font-bold transition cursor-pointer ${
                  statusFilter === 'IN_QUARANTINE'
                    ? 'bg-rose-700 text-white shadow-2xs'
                    : 'bg-rose-50 text-rose-800 border border-rose-200 hover:bg-rose-100'
                }`}
              >
                Cách ly PHI ({quarantineCount}) 🛑
              </button>
            )}
            <button
              type="button"
              onClick={() => { setStatusFilter('FALLOW'); setCurrentPage(1); }}
              className={`rounded-lg px-2.5 py-1 text-xs font-bold transition cursor-pointer ${
                statusFilter === 'FALLOW'
                  ? 'bg-slate-700 text-white shadow-2xs'
                  : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
              }`}
            >
              Nghỉ vụ ({plots.filter((p) => p.status === 'FALLOW').length})
            </button>
          </div>

          <div className="flex items-center gap-2">
            <div className="relative min-w-[220px]">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
                placeholder={isViewingAll ? "Tìm mã thửa, vùng, GPS..." : "Tìm mã thửa, GPS..."}
                className="w-full rounded-xl border border-slate-200 bg-white pl-8 pr-3 py-1.5 text-xs font-semibold text-slate-800 outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20"
              />
            </div>
            <button
              type="button"
              onClick={handleExportExcel}
              className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-xs font-bold text-slate-700 shadow-2xs hover:bg-slate-50 transition cursor-pointer shrink-0"
              title="Xuất danh sách thửa đất sang Excel"
            >
              <FileSpreadsheet className="h-3.5 w-3.5 text-emerald-600" />
              <span>Xuất Excel</span>
            </button>
          </div>
        </div>

        {/* Table Body */}
        {plotsLoading ? (
          <div className="py-16 text-center text-xs text-slate-400">
            Đang tải dữ liệu thửa đất...
          </div>
        ) : filteredPlots.length === 0 ? (
          <div className="p-12 text-center">
            <MapPin className="mx-auto mb-2 h-8 w-8 text-slate-300" />
            <p className="text-sm font-bold text-slate-700">
              {searchTerm || statusFilter !== 'ALL'
                ? 'Không tìm thấy thửa đất phù hợp bộ lọc'
                : 'Chưa có thửa đất nào'}
            </p>
            <p className="mt-1 text-xs text-slate-400">
              {searchTerm || statusFilter !== 'ALL'
                ? 'Thử thay đổi từ khóa tìm kiếm hoặc chọn bộ lọc "Tất cả".'
                : 'Bấm nút "Thêm thửa mới" để khởi tạo thửa đất đầu tiên.'}
            </p>
            {searchTerm || statusFilter !== 'ALL' ? (
              <button
                type="button"
                onClick={() => {
                  setSearchTerm('');
                  setStatusFilter('ALL');
                  setCurrentPage(1);
                }}
                className="mt-3.5 inline-flex items-center gap-1.5 rounded-xl bg-slate-100 px-3.5 py-2 text-xs font-bold text-slate-700 hover:bg-slate-200 transition cursor-pointer"
              >
                Đặt lại bộ lọc tìm kiếm
              </button>
            ) : (
              <button
                type="button"
                onClick={onOpenAddPlotModal}
                className="mt-3.5 inline-flex items-center gap-1.5 rounded-xl bg-emerald-700 px-3.5 py-2 text-xs font-bold text-white shadow-xs hover:bg-emerald-800 transition cursor-pointer"
              >
                <Plus className="h-4 w-4" /> Thêm thửa mới
              </button>
            )}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50/80 font-bold text-slate-600">
                  <th className="py-3 px-4 w-12 text-center">STT</th>
                  {isViewingAll && <th className="py-3 px-4">Vùng Sản Xuất</th>}
                  <th className="py-3 px-4">Mã Thửa Đất</th>
                  <th className="py-3 px-4">Diện Tích (ha)</th>
                  <th className="py-3 px-4">Tọa Độ GPS</th>
                  <th className="py-3 px-4">Trạng Thái Canh Tác</th>
                  <th className="py-3 px-4">Giám Sát An Toàn PHI</th>
                  <th className="py-3 px-4 text-right">Thao Tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {paginatedPlots.map((plot, idx) => {
                  const isSelected = selectedPlotId === plot.id;
                  const isQuarantine = plot.status === 'IN_QUARANTINE';

                  return (
                    <tr
                      key={plot.id}
                      onClick={() => onSelectPlot(plot)}
                      className={`hover:bg-slate-50/80 transition cursor-pointer ${
                        isSelected ? 'bg-emerald-50/60 font-medium' : ''
                      }`}
                    >
                      <td className="py-3.5 px-4 text-center font-medium text-slate-400">
                        {(currentPage - 1) * pageSize + idx + 1}
                      </td>

                      {isViewingAll && (
                        <td className="py-3.5 px-4">
                          <div className="font-bold text-slate-800">{plot.unit_name}</div>
                          <div className="text-[11px] font-mono font-semibold text-emerald-700">{plot.unit_code}</div>
                        </td>
                      )}

                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-2">
                          <div
                            className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-lg ${
                              isQuarantine
                                ? 'bg-rose-100 text-rose-700'
                                : 'bg-emerald-100 text-emerald-800'
                            }`}
                          >
                            {isQuarantine ? <ShieldAlert className="h-4 w-4" /> : <MapPin className="h-4 w-4" />}
                          </div>
                          <div>
                            <div className="flex items-center gap-1.5 flex-wrap">
                              <span className="font-mono font-bold text-slate-900 hover:text-emerald-700">
                                {plot.plot_code}
                              </span>
                              {plot.greenhouse_type === 'HIGH_TECH_GREENHOUSE' && (
                                <span className="text-[10px] font-extrabold px-1.5 py-0.2 rounded bg-emerald-100 text-emerald-800 border border-emerald-300">
                                  Nhà màng CNC
                                </span>
                              )}
                            </div>
                            {plot.national_cadastral_code ? (
                              <div className="text-[10.5px] text-slate-500 font-mono mt-0.5">
                                Tờ {plot.land_sheet_number || '—'} / Thửa {plot.land_parcel_number || '—'} &bull; Mã ĐĐ: {plot.national_cadastral_code}
                              </div>
                            ) : !isViewingAll ? (
                              <div className="text-[11px] text-slate-400">
                                Lô thuộc {plot.unit_code}
                              </div>
                            ) : null}
                          </div>
                        </div>
                      </td>

                      <td className="py-3.5 px-4 font-semibold text-slate-800">
                        <span className="font-bold">{plot.area}</span> ha
                        <span className="text-[11px] text-slate-400 block font-normal">
                          {(Number(plot.area) * 10000).toLocaleString('vi-VN')} m²
                        </span>
                        {plot.substrate_bag_count ? (
                          <span className="text-[10.5px] text-emerald-700 block font-bold mt-0.5">
                            {plot.substrate_bag_count.toLocaleString('vi-VN')} túi giá thể
                            {plot.planting_density_per_sqm ? ` • ${plot.planting_density_per_sqm} cây/m²` : ''}
                          </span>
                        ) : null}
                      </td>

                      <td className="py-3.5 px-4 font-mono text-[11.5px] text-slate-600">
                        {plot.gps_coordinates ? (
                          <div className="space-y-0.5">
                            <span className="flex items-center gap-1 font-bold text-slate-800">
                              <MapPin className="w-3 h-3 text-emerald-600 shrink-0" />
                              {plot.gps_coordinates}
                            </span>
                            {plot.geometry_geojson?.coordinates?.[0]?.length >= 3 && (
                              <span className="text-[10px] font-sans font-bold text-emerald-700 bg-emerald-50 px-1.5 py-0.2 rounded border border-emerald-200 block w-fit">
                                Đã vẽ ranh giới ({plot.geometry_geojson.coordinates[0].length} đỉnh)
                              </span>
                            )}
                          </div>
                        ) : plot.geometry_geojson?.coordinates?.[0]?.length >= 3 ? (
                          <span className="inline-flex items-center gap-1 text-[11px] font-sans font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                            <CheckCircle2 className="w-3 h-3 text-emerald-600" /> Đã vẽ đa giác WebGIS
                          </span>
                        ) : (
                          <span className="text-slate-400 italic font-sans text-xs">Chưa ghim GPS</span>
                        )}
                      </td>

                      <td className="py-3.5 px-4">
                        <span
                          className={`inline-block rounded-full px-2.5 py-0.5 text-[11px] font-bold border ${
                            statusBadgeClasses[plot.status] || 'border-slate-200 bg-slate-100 text-slate-700'
                          }`}
                        >
                          {statusText[plot.status] || plot.status}
                        </span>
                      </td>

                      <td className="py-3.5 px-4">
                        <PhiCountdownBadge safeHarvestDate={plot.safe_harvest_date} status={plot.status} />
                      </td>

                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5" onClick={(e) => e.stopPropagation()}>
                          <button
                            type="button"
                            onClick={() => onSelectPlot(plot)}
                            className="inline-flex items-center gap-1 rounded-lg border border-slate-200 bg-white px-2 py-1 text-[11px] font-bold text-slate-700 shadow-2xs hover:bg-slate-50 cursor-pointer"
                            title="Xem chi tiết thửa đất"
                          >
                            <Eye className="h-3 w-3 text-slate-500" /> Chi tiết
                          </button>
                          <button
                            type="button"
                            onClick={() => onOpenAssignments(plot)}
                            className="inline-flex items-center gap-1 rounded-lg border border-slate-200 bg-white px-2 py-1 text-[11px] font-bold text-emerald-800 shadow-2xs hover:bg-emerald-50 cursor-pointer"
                            title="Phân công xã viên nhận khoán"
                          >
                            <Users className="h-3 w-3 text-emerald-600" /> Xã viên
                          </button>
                          <button
                            type="button"
                            onClick={() => onEditPlot(plot)}
                            className="inline-flex h-6.5 w-6.5 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-600 hover:text-blue-600 hover:bg-blue-50 shadow-2xs cursor-pointer"
                            title="Sửa thửa đất"
                          >
                            <Pencil className="h-3 w-3" />
                          </button>
                          <button
                            type="button"
                            onClick={() => onDeletePlot(plot)}
                            className="inline-flex h-6.5 w-6.5 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-400 hover:text-rose-600 hover:bg-rose-50 shadow-2xs cursor-pointer"
                            title="Xóa thửa đất"
                          >
                            <Trash2 className="h-3 w-3" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination */}
        {filteredPlots.length > pageSize && (
          <div className="p-4 border-t border-slate-100">
            <Pagination
              currentPage={currentPage}
              totalItems={filteredPlots.length}
              pageSize={pageSize}
              onPageChange={setCurrentPage}
              onPageSizeChange={setPageSize}
              pageSizeOptions={[10, 20, 50]}
            />
          </div>
        )}
      </div>
    </div>
  );
};
