import React, { useState, useMemo } from 'react';
import {
  MapPin,
  Pencil,
  Plus,
  FileSpreadsheet,
  Search,
  Filter,
  Layers,
  Sprout,
  CheckCircle2,
  AlertCircle,
  Clock,
  Compass,
  ArrowRight,
} from 'lucide-react';
import { ProductionUnit } from '@/services/farmPlotApi';
import { Pagination } from '@/components/ui/Pagination';
import { exportToExcel } from '@/utils/exportUtils';
import { useToast } from '@/components/ui/ToastNotification';

interface ProductionUnitsTableProps {
  units: ProductionUnit[];
  isLoading: boolean;
  onOpenCreateModal: () => void;
  onOpenEditModal: (unit: ProductionUnit) => void;
  onViewPlotsOfUnit: (unit: ProductionUnit) => void;
  onOpenMapView: (unit: ProductionUnit) => void;
}

export const ProductionUnitsTable: React.FC<ProductionUnitsTableProps> = ({
  units,
  isLoading,
  onOpenCreateModal,
  onOpenEditModal,
  onViewPlotsOfUnit,
  onOpenMapView,
}) => {
  const { showToast } = useToast();
  const [searchTerm, setSearchTerm] = useState('');
  const [pucFilter, setPucFilter] = useState<'ALL' | 'HAS_PUC' | 'NO_PUC' | 'REVIEW'>('ALL');
  const [cropFilter, setCropFilter] = useState<string>('ALL');
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  // Extract unique crops for filter
  const uniqueCrops = useMemo(() => {
    const crops = new Set<string>();
    units.forEach((u) => {
      if (u.crop) crops.add(u.crop);
    });
    return Array.from(crops);
  }, [units]);

  // Filtered units
  const filteredUnits = useMemo(() => {
    return units.filter((u) => {
      const matchSearch =
        u.unit_code.toLowerCase().includes(searchTerm.toLowerCase()) ||
        u.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (u.puc_code && u.puc_code.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (u.crop && u.crop.toLowerCase().includes(searchTerm.toLowerCase()));

      let matchPuc = true;
      if (pucFilter === 'HAS_PUC') matchPuc = !!u.puc_code && u.puc_status !== 'UNDER_PUC_REVIEW';
      else if (pucFilter === 'NO_PUC') matchPuc = !u.puc_code;
      else if (pucFilter === 'REVIEW') matchPuc = u.puc_status === 'UNDER_PUC_REVIEW';

      const matchCrop = cropFilter === 'ALL' || u.crop === cropFilter;

      return matchSearch && matchPuc && matchCrop;
    });
  }, [units, searchTerm, pucFilter, cropFilter]);

  // Paginated units
  const paginatedUnits = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredUnits.slice(start, start + pageSize);
  }, [filteredUnits, currentPage, pageSize]);

  // Handle Export Excel
  const handleExportExcel = () => {
    if (filteredUnits.length === 0) {
      showToast('Không có dữ liệu vùng trồng để xuất!', 'warning');
      return;
    }

    const exportData = filteredUnits.map((u, idx) => ({
      STT: idx + 1,
      'Mã vùng sản xuất': u.unit_code,
      'Tên vùng sản xuất': u.name,
      'Cây trồng chủ lực': u.crop,
      'Diện tích quy hoạch (ha)': u.area,
      'Diện tích quy hoạch (m²)': Number(u.area) * 10000,
      'Mã số PUC Cục BVTV': u.puc_code || 'Chưa cấp',
      'Tình trạng thẩm định PUC':
        u.puc_status === 'UNDER_PUC_REVIEW'
          ? 'Đang chờ thẩm định'
          : u.puc_code
          ? 'Đạt chuẩn'
          : 'Chưa nộp hồ sơ',
      'Tọa độ GPS trạm':
        u.gps_coordinates ||
        (u.location
          ? typeof u.location === 'string'
            ? u.location
            : (u.location.latitude ?? u.location.lat)
            ? `${Number(u.location.latitude ?? u.location.lat).toFixed(6)}, ${Number(u.location.longitude ?? u.location.lng).toFixed(6)}`
            : '—'
          : '—'),
      'Địa chỉ hành chính':
        u.location && typeof u.location === 'object'
          ? [u.location.address, u.location.commune, u.location.district, u.location.province].filter(Boolean).join(', ')
          : '—',
      'Trạng thái hoạt động': u.status,
    }));

    exportToExcel(exportData, `Danh_Sach_Vung_Trong_PUC_${new Date().toISOString().slice(0, 10)}`, 'VungTrong');
    showToast('Xuất danh sách vùng trồng sang Excel thành công!', 'success');
  };

  const hasPucCount = units.filter((u) => u.puc_code && u.puc_status !== 'UNDER_PUC_REVIEW').length;
  const noPucCount = units.filter((u) => !u.puc_code).length;
  const reviewCount = units.filter((u) => u.puc_status === 'UNDER_PUC_REVIEW').length;

  return (
    <div className="space-y-3.5">
      {/* Table Container */}
      <div className="rounded-2xl border border-slate-200 bg-white shadow-xs overflow-hidden">
        {/* Table Toolbar */}
        <div className="border-b border-slate-100 p-3.5 bg-slate-50/50 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-3">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs font-bold text-slate-700 flex items-center gap-1">
              <Filter className="h-3.5 w-3.5 text-slate-400" /> Tiêu chí PUC:
            </span>
            <button
              type="button"
              onClick={() => { setPucFilter('ALL'); setCurrentPage(1); }}
              className={`rounded-lg px-2.5 py-1 text-xs font-bold transition cursor-pointer ${
                pucFilter === 'ALL'
                  ? 'bg-slate-800 text-white shadow-2xs'
                  : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
              }`}
            >
              Tất cả ({units.length})
            </button>
            <button
              type="button"
              onClick={() => { setPucFilter('HAS_PUC'); setCurrentPage(1); }}
              className={`rounded-lg px-2.5 py-1 text-xs font-bold transition cursor-pointer ${
                pucFilter === 'HAS_PUC'
                  ? 'bg-emerald-700 text-white shadow-2xs'
                  : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
              }`}
            >
              Đã cấp PUC ({hasPucCount})
            </button>
            {reviewCount > 0 && (
              <button
                type="button"
                onClick={() => { setPucFilter('REVIEW'); setCurrentPage(1); }}
                className={`rounded-lg px-2.5 py-1 text-xs font-bold transition cursor-pointer ${
                  pucFilter === 'REVIEW'
                    ? 'bg-amber-600 text-white shadow-2xs'
                    : 'bg-amber-50 text-amber-800 border border-amber-200 hover:bg-amber-100'
                }`}
              >
                Chờ thẩm định ({reviewCount})
              </button>
            )}
            <button
              type="button"
              onClick={() => { setPucFilter('NO_PUC'); setCurrentPage(1); }}
              className={`rounded-lg px-2.5 py-1 text-xs font-bold transition cursor-pointer ${
                pucFilter === 'NO_PUC'
                  ? 'bg-slate-700 text-white shadow-2xs'
                  : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
              }`}
            >
              Chưa cấp PUC ({noPucCount})
            </button>

            {uniqueCrops.length > 1 && (
              <select
                value={cropFilter}
                onChange={(e) => { setCropFilter(e.target.value); setCurrentPage(1); }}
                className="rounded-lg border border-slate-200 bg-white px-2.5 py-1 text-xs font-semibold text-slate-700 outline-none focus:border-emerald-500 cursor-pointer"
              >
                <option value="ALL">Tất cả cây trồng</option>
                {uniqueCrops.map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            )}
          </div>

          <div className="flex items-center gap-2">
            <div className="relative min-w-[220px]">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
                placeholder="Tìm mã vùng, tên, mã PUC..."
                className="w-full rounded-xl border border-slate-200 bg-white pl-8 pr-3 py-1.5 text-xs font-semibold text-slate-800 outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20"
              />
            </div>

            <button
              type="button"
              onClick={handleExportExcel}
              className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-xs font-bold text-slate-700 shadow-2xs hover:bg-slate-50 transition cursor-pointer shrink-0"
              title="Xuất danh sách vùng trồng sang Excel"
            >
              <FileSpreadsheet className="h-3.5 w-3.5 text-emerald-600" /> Xuất Excel
            </button>

            <button
              type="button"
              onClick={onOpenCreateModal}
              className="inline-flex items-center gap-1.5 rounded-xl bg-emerald-700 px-3.5 py-1.5 text-xs font-bold text-white shadow-xs hover:bg-emerald-800 transition active:scale-98 cursor-pointer shrink-0"
            >
              <Plus className="h-4 w-4" /> Khai báo vùng mới
            </button>
          </div>
        </div>

        {/* Table Body */}
        {isLoading ? (
          <div className="py-16 text-center text-xs text-slate-400">
            Đang tải danh sách vùng sản xuất...
          </div>
        ) : filteredUnits.length === 0 ? (
          <div className="p-12 text-center">
            <MapPin className="mx-auto mb-2 h-8 w-8 text-slate-300" />
            <p className="text-sm font-bold text-slate-700">Không tìm thấy vùng sản xuất phù hợp</p>
            <p className="mt-1 text-xs text-slate-400">Thử thay đổi từ khóa tìm kiếm hoặc bấm "Khai báo vùng mới".</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50/80 font-bold text-slate-600">
                  <th className="py-3 px-4 w-12 text-center">STT</th>
                  <th className="py-3 px-4 min-w-[280px]">Mã Vùng &amp; Tên Vùng Trồng</th>
                  <th className="py-3 px-4">Cây Trồng Chủ Lực</th>
                  <th className="py-3 px-4">Quy Mô Quy Hoạch</th>
                  <th className="py-3 px-4">Mã Số PUC Cục BVTV</th>
                  <th className="py-3 px-4">Tọa Độ GPS Trạm</th>
                  <th className="py-3 px-4 text-right">Thao Tác Quản Trị</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {paginatedUnits.map((unit, idx) => {
                  const hasPuc = !!unit.puc_code;
                  const isReview = unit.puc_status === 'UNDER_PUC_REVIEW';

                  return (
                    <tr key={unit.id} className="hover:bg-slate-50/80 transition">
                      <td className="py-3.5 px-4 text-center font-medium text-slate-400">
                        {(currentPage - 1) * pageSize + idx + 1}
                      </td>

                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-2.5">
                          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-emerald-50 text-emerald-700 border border-emerald-200">
                            <Layers className="h-4 w-4" />
                          </div>
                          <div>
                            <span className="font-mono font-bold text-slate-900 text-xs">
                              {unit.unit_code}
                            </span>
                            <div className="font-extrabold text-slate-800 text-[12.5px] leading-snug break-words">
                              {unit.name}
                            </div>
                          </div>
                        </div>
                      </td>

                      <td className="py-3.5 px-4 font-semibold text-slate-800">
                        <div className="flex items-center gap-1.5">
                          <Sprout className="h-3.5 w-3.5 text-emerald-600 shrink-0" />
                          <span>{unit.crop}</span>
                        </div>
                      </td>

                      <td className="py-3.5 px-4 font-semibold text-slate-800">
                        <span className="font-extrabold text-slate-900">{unit.area}</span> ha
                        <span className="text-[11px] text-slate-400 block font-normal">
                          {(Number(unit.area) * 10000).toLocaleString('vi-VN')} m²
                        </span>
                      </td>

                      <td className="py-3.5 px-4">
                        {hasPuc ? (
                          <div className="space-y-0.5">
                            <span className="inline-flex items-center gap-1 rounded-full bg-blue-50 border border-blue-200 px-2.5 py-0.5 text-[11px] font-mono font-bold text-blue-800">
                              <CheckCircle2 className="h-3 w-3 text-blue-600" /> {unit.puc_code}
                            </span>
                            <span className="text-[10px] text-slate-400 block">Đạt chuẩn Cục BVTV</span>
                          </div>
                        ) : isReview ? (
                          <div className="space-y-0.5">
                            <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 border border-amber-200 px-2.5 py-0.5 text-[11px] font-bold text-amber-800">
                              <Clock className="h-3 w-3 text-amber-600" /> Chờ thẩm định PUC
                            </span>
                            <span className="text-[10px] text-slate-400 block">Hồ sơ đã nộp</span>
                          </div>
                        ) : (
                          <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 border border-slate-200 px-2.5 py-0.5 text-[11px] font-semibold text-slate-600">
                            <AlertCircle className="h-3 w-3 text-slate-400" /> Chưa cấp mã PUC
                          </span>
                        )}
                      </td>

                      <td className="py-3.5 px-4 font-mono text-[11.5px] text-slate-600">
                        {(() => {
                          const lat = unit.location?.latitude ?? unit.location?.lat;
                          const lng = unit.location?.longitude ?? unit.location?.lng;
                          const hasPolygon = (unit.location?.polygon_coordinates || unit.location?.polygon)?.length >= 3;
                          const gpsStr = unit.gps_coordinates || (lat && lng ? `${Number(lat).toFixed(4)}°, ${Number(lng).toFixed(4)}°` : (typeof unit.location === 'string' ? unit.location : null));

                          return gpsStr ? (
                            <div className="space-y-0.5">
                              <span className="font-bold text-slate-800 flex items-center gap-1 font-mono">
                                <MapPin className="w-3 h-3 text-emerald-600 shrink-0" />
                                {gpsStr}
                              </span>
                              <div className="flex items-center gap-1.5 flex-wrap">
                                {hasPolygon && (
                                  <span className="text-[10px] font-sans font-bold text-emerald-700 bg-emerald-50 px-1.5 py-0.2 rounded border border-emerald-200">
                                    Đã vẽ ranh giới
                                  </span>
                                )}
                                {unit.location?.address && (
                                  <span className="text-[10.5px] font-sans text-slate-400 break-words max-w-[180px]">
                                    {unit.location.address}
                                  </span>
                                )}
                              </div>
                            </div>
                          ) : (
                            <span className="text-slate-400 italic">Chưa xác định</span>
                          );
                        })()}
                      </td>

                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            type="button"
                            onClick={() => onViewPlotsOfUnit(unit)}
                            className="inline-flex items-center gap-1 rounded-xl bg-emerald-50 border border-emerald-200 px-2.5 py-1 text-[11.5px] font-bold text-emerald-800 shadow-2xs hover:bg-emerald-100 transition cursor-pointer"
                            title="Chuyển sang xem danh sách thửa đất của vùng này"
                          >
                            <span>Xem thửa đất</span>
                            <ArrowRight className="h-3 w-3" />
                          </button>

                          <button
                            type="button"
                            onClick={() => onOpenMapView(unit)}
                            className="inline-flex h-7 w-7 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-600 hover:text-emerald-700 hover:border-emerald-300 shadow-2xs transition cursor-pointer"
                            title="Xem bản đồ GIS của vùng này"
                          >
                            <Compass className="h-3.5 w-3.5" />
                          </button>

                          <button
                            type="button"
                            onClick={() => onOpenEditModal(unit)}
                            className="inline-flex h-7 w-7 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-600 hover:text-blue-600 hover:border-blue-300 shadow-2xs transition cursor-pointer"
                            title="Sửa hồ sơ vùng trồng"
                          >
                            <Pencil className="h-3.5 w-3.5" />
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
        {filteredUnits.length > pageSize && (
          <div className="p-3.5 border-t border-slate-100">
            <Pagination
              currentPage={currentPage}
              totalItems={filteredUnits.length}
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
