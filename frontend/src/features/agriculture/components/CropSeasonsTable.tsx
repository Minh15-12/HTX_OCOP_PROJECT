import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Search,
  SlidersHorizontal,
  Pencil,
  Lock,
  CalendarDays,
  Sprout,
  Wheat,
  BookOpen,
  Printer,
  FileSpreadsheet,
} from 'lucide-react';
import { CropSeason, CropSeasonStatus } from '@/services/cropSeasonApi';
import { ProductionUnit } from '@/services/farmPlotApi';
import { Pagination } from '@/components/ui/Pagination';
import { exportCropSeasonsToExcel } from '@/utils/excelExporter';

const statusText: Record<string, string> = {
  PLANNED: 'Chưa bắt đầu',
  ACTIVE: 'Đang diễn ra',
  HARVESTING: 'Đang thu hoạch 🍇',
  COMPLETED: 'Đã kết thúc',
  CANCELLED: 'Đã hủy',
};

const statusClass: Record<string, string> = {
  PLANNED: 'bg-amber-50 text-amber-800 border-amber-200',
  ACTIVE: 'bg-emerald-50 text-emerald-800 border-emerald-200 font-bold',
  HARVESTING: 'bg-blue-50 text-blue-800 border-blue-200 font-bold animate-pulse',
  COMPLETED: 'bg-slate-100 text-slate-700 border-slate-200',
  CANCELLED: 'bg-rose-50 text-rose-700 border-rose-200',
};

const formatDate = (value?: string | null) => {
  if (!value) return '—';
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return value.slice(0, 10);
  return d.toLocaleDateString('vi-VN');
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

interface CropSeasonsTableProps {
  seasons: CropSeason[];
  units: ProductionUnit[];
  isLoading: boolean;
  onEditSeason: (season: CropSeason) => void;
  onCloseSeason: (season: CropSeason) => void;
  onOpenCreateModal: () => void;
  onSelectRow?: (season: CropSeason) => void;
  selectedId?: string;
  onPrintSeason?: (season: CropSeason) => void;
}

export const CropSeasonsTable: React.FC<CropSeasonsTableProps> = ({
  seasons,
  units,
  isLoading,
  onEditSeason,
  onCloseSeason,
  onOpenCreateModal,
  onSelectRow,
  selectedId,
  onPrintSeason,
}) => {
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('Tất cả');
  const [scopeFilter, setScopeFilter] = useState<'ALL' | 'ACTIVE_ONLY' | 'HISTORY_ONLY'>('ALL');
  const [cropFilter, setCropFilter] = useState('Tất cả');
  const [unitFilter, setUnitFilter] = useState('Tất cả');
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10;

  const activeCount = useMemo(() => {
    return seasons.filter((s) => s.status !== 'COMPLETED' && s.status !== 'CANCELLED').length;
  }, [seasons]);

  const historyCount = useMemo(() => {
    return seasons.filter((s) => s.status === 'COMPLETED' || s.status === 'CANCELLED').length;
  }, [seasons]);

  const crops = useMemo(() => {
    return Array.from(new Set(seasons.map((s) => s.crop).filter(Boolean)));
  }, [seasons]);

  const filtered = useMemo(() => {
    return seasons.filter((s) => {
      const q = search.toLowerCase().trim();
      const matchSearch =
        !q ||
        s.name.toLowerCase().includes(q) ||
        (s.crop && s.crop.toLowerCase().includes(q)) ||
        (s.unit_name && s.unit_name.toLowerCase().includes(q)) ||
        (s.unit_code && s.unit_code.toLowerCase().includes(q));

      const matchStatus = statusFilter === 'Tất cả' || s.status === statusFilter;
      const matchCrop = cropFilter === 'Tất cả' || s.crop === cropFilter;
      const matchUnit = unitFilter === 'Tất cả' || s.production_unit_id === unitFilter;

      let matchScope = true;
      if (scopeFilter === 'ACTIVE_ONLY') {
        matchScope = s.status !== 'COMPLETED' && s.status !== 'CANCELLED';
      } else if (scopeFilter === 'HISTORY_ONLY') {
        matchScope = s.status === 'COMPLETED' || s.status === 'CANCELLED';
      }

      return matchSearch && matchStatus && matchCrop && matchUnit && matchScope;
    });
  }, [seasons, search, statusFilter, cropFilter, unitFilter, scopeFilter]);

  const pagedSeasons = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filtered.slice(start, start + pageSize);
  }, [filtered, currentPage, pageSize]);

  const handleResetFilters = () => {
    setSearch('');
    setStatusFilter('Tất cả');
    setScopeFilter('ALL');
    setCropFilter('Tất cả');
    setUnitFilter('Tất cả');
    setCurrentPage(1);
  };

  return (
    <div className="bg-white border border-slate-200 rounded-2xl shadow-xs overflow-hidden space-y-0">
      {/* 1. Scope Switcher: Hiện tại vs Quá khứ */}
      <div className="p-3 bg-slate-100/70 border-b border-slate-200 flex flex-wrap items-center justify-between gap-2.5">
        <div className="inline-flex items-center gap-1.5 p-1 bg-white rounded-xl border border-slate-200 shadow-2xs">
          <button
            type="button"
            onClick={() => {
              setScopeFilter('ALL');
              setCurrentPage(1);
            }}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer ${
              scopeFilter === 'ALL'
                ? 'bg-emerald-700 text-white shadow-2xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
            }`}
          >
            Tất cả vụ ({seasons.length})
          </button>

          <button
            type="button"
            onClick={() => {
              setScopeFilter('ACTIVE_ONLY');
              setCurrentPage(1);
            }}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer flex items-center gap-1 ${
              scopeFilter === 'ACTIVE_ONLY'
                ? 'bg-emerald-700 text-white shadow-2xs'
                : 'text-emerald-800 hover:bg-emerald-50'
            }`}
          >
            <span>🌟 Đang sản xuất ({activeCount})</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setScopeFilter('HISTORY_ONLY');
              setCurrentPage(1);
            }}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer flex items-center gap-1 ${
              scopeFilter === 'HISTORY_ONLY'
                ? 'bg-slate-800 text-white shadow-2xs'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <span>📦 Lịch sử đã đóng ({historyCount})</span>
          </button>
        </div>

        {scopeFilter === 'HISTORY_ONLY' && (
          <span className="text-[11px] font-bold text-slate-500 flex items-center gap-1 bg-slate-200/70 px-2.5 py-1 rounded-lg">
            <Lock className="w-3.5 h-3.5" />
            <span>Chế độ tra cứu quá khứ (Read-only)</span>
          </span>
        )}
      </div>

      {/* Search & Filters */}
      <div className="p-3.5 border-b border-slate-200 bg-slate-50/70 flex flex-wrap items-center justify-between gap-3">
        <div className="relative flex-1 min-w-[240px]">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setCurrentPage(1);
            }}
            placeholder="Tìm theo tên mùa vụ, cây trồng, mã vùng..."
            className="w-full pl-9 pr-3 py-1.5 bg-white border border-slate-300 rounded-xl text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500"
          />
        </div>

        <select
          value={unitFilter}
          onChange={(e) => {
            setUnitFilter(e.target.value);
            setCurrentPage(1);
          }}
          className="bg-white border border-slate-300 rounded-xl px-3 py-1.5 text-xs font-semibold text-slate-700 focus:outline-none"
        >
          <option value="Tất cả">Tất cả vùng sản xuất</option>
          {units.map((u) => (
            <option key={u.id} value={u.id}>
              {u.unit_code} - {u.name}
            </option>
          ))}
        </select>

        <select
          value={cropFilter}
          onChange={(e) => {
            setCropFilter(e.target.value);
            setCurrentPage(1);
          }}
          className="bg-white border border-slate-300 rounded-xl px-3 py-1.5 text-xs font-semibold text-slate-700 focus:outline-none"
        >
          <option value="Tất cả">Tất cả cây trồng</option>
          {crops.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </select>

        <select
          value={statusFilter}
          onChange={(e) => {
            setStatusFilter(e.target.value);
            setCurrentPage(1);
          }}
          className="bg-white border border-slate-300 rounded-xl px-3 py-1.5 text-xs font-semibold text-slate-700 focus:outline-none"
        >
          <option value="Tất cả">Tất cả trạng thái</option>
          <option value="PLANNED">Chưa bắt đầu</option>
          <option value="ACTIVE">Đang diễn ra</option>
          <option value="HARVESTING">Đang thu hoạch</option>
          <option value="COMPLETED">Đã kết thúc</option>
        </select>

        <button
          type="button"
          onClick={() => exportCropSeasonsToExcel(filtered)}
          className="px-3 py-1.5 bg-teal-50 hover:bg-teal-100 text-teal-800 border border-teal-200 rounded-xl font-bold text-xs cursor-pointer transition shadow-2xs inline-flex items-center gap-1.5 shrink-0"
          title="Xuất danh sách mùa vụ đã lọc ra file Excel (.xlsx)"
        >
          <FileSpreadsheet className="w-3.5 h-3.5 text-teal-700" />
          <span>Xuất Excel</span>
        </button>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs border-collapse">
          <thead>
            <tr className="bg-slate-50 text-slate-700 font-bold border-b border-slate-200 uppercase text-[11px] tracking-wider">
              <th className="py-3 px-4">Tên mùa vụ & Vùng sản xuất</th>
              <th className="py-3 px-4">Cây trồng</th>
              <th className="py-3 px-4">Thời gian chu kỳ</th>
              <th className="py-3 px-4">Tiến độ mùa vụ</th>
              <th className="py-3 px-4 text-center">Trạng thái</th>
              <th className="py-3 px-4 text-center">Thao tác</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
            {isLoading ? (
              <tr>
                <td colSpan={6} className="py-16 text-center text-slate-400">
                  <div className="inline-block animate-spin rounded-full h-7 w-7 border-2 border-emerald-600 border-t-transparent mb-2" />
                  <p className="font-semibold text-slate-600">Đang tải danh sách mùa vụ canh tác...</p>
                </td>
              </tr>
            ) : pagedSeasons.length === 0 ? (
              <tr>
                <td colSpan={6} className="py-14 text-center text-slate-400">
                  <div className="flex flex-col items-center justify-center gap-2">
                    <CalendarDays className="w-8 h-8 text-slate-300" />
                    {seasons.length > 0 ? (
                      <>
                        <p className="font-bold text-slate-700 text-sm">
                          Không tìm thấy mùa vụ phù hợp
                        </p>
                        <p className="text-xs text-slate-500 max-w-sm">
                          Không có mùa vụ nào khớp với từ khóa tìm kiếm hoặc bộ lọc phạm vi đang chọn.
                        </p>
                        <button
                          type="button"
                          onClick={handleResetFilters}
                          className="mt-2 inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs rounded-xl shadow-2xs transition cursor-pointer"
                        >
                          <span>Đặt lại bộ lọc tìm kiếm</span>
                        </button>
                      </>
                    ) : (
                      <>
                        <p className="font-bold text-slate-600">Chưa có mùa vụ canh tác nào</p>
                        <p className="text-[11.5px] text-slate-400">
                          Bấm "Khai báo mùa vụ mới" để khởi tạo kế hoạch canh tác đầu tiên.
                        </p>
                        <button
                          type="button"
                          onClick={onOpenCreateModal}
                          className="mt-2 px-3.5 py-1.5 bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs rounded-xl shadow-xs transition cursor-pointer"
                        >
                          Khai báo mùa vụ mới
                        </button>
                      </>
                    )}
                  </div>
                </td>
              </tr>
            ) : (
              pagedSeasons.map((item) => {
                const isCompleted = item.status === 'COMPLETED';
                const { percent, daysLeft } = isCompleted
                  ? { percent: 100, daysLeft: 0 }
                  : getTimelineProgress(item.start_date, item.expected_end_date);

                const isSelected = selectedId === item.id;

                return (
                  <tr
                    key={item.id}
                    onClick={() => onSelectRow?.(item)}
                    className={`transition-colors cursor-pointer ${
                      isSelected ? 'bg-emerald-50/80 font-medium' : 'hover:bg-slate-50/80'
                    }`}
                  >
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-bold text-slate-900 text-xs">{item.name}</span>
                        {item.logbook_status === 'FROZEN_ARCHIVED' && (
                          <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-slate-800 text-emerald-300 border border-slate-700 inline-flex items-center gap-1 shadow-2xs">
                            <Lock className="w-2.5 h-2.5 text-emerald-400" />
                            ĐÃ KHÓA SỔ
                          </span>
                        )}
                      </div>
                      <div className="mt-1 text-[11px] text-slate-400 flex items-center gap-1.5 flex-wrap">
                        <span className="font-mono font-semibold text-emerald-800 bg-emerald-50 px-1 py-0.2 rounded border border-emerald-200">
                          {item.unit_code || 'VÙNG'}
                        </span>
                        <span>{item.unit_name || item.production_unit_id}</span>
                        {item.puc_quota_kg && (
                          <span className="text-emerald-700 font-bold">
                            &bull; Trần PUC: {item.puc_quota_kg.toLocaleString('vi-VN')} kg
                          </span>
                        )}
                        {item.seed_supplier && (
                          <span className="text-slate-500">
                            &bull; Giống: {item.seed_supplier}
                          </span>
                        )}
                      </div>
                    </td>

                    <td className="py-3.5 px-4 font-medium text-slate-800">
                      <span className="inline-flex items-center gap-1">
                        <Sprout className="w-3.5 h-3.5 text-emerald-600" />
                        {item.crop}
                      </span>
                    </td>

                    <td className="py-3.5 px-4 font-mono text-slate-600">
                      <div>Từ: {formatDate(item.start_date)}</div>
                      <div className="text-[11px] text-slate-400">Đến: {formatDate(item.expected_end_date)}</div>
                    </td>

                    <td className="py-3.5 px-4 min-w-[140px]">
                      <div className="flex items-center justify-between text-[11px] mb-1">
                        <span className="font-bold text-slate-700">{percent}%</span>
                        <span className="text-slate-400">
                          {isCompleted ? 'Đã hoàn tất' : daysLeft > 0 ? `Còn ${daysLeft} ngày` : 'Hết hạn vụ'}
                        </span>
                      </div>
                      <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
                        <div
                          className={`h-full rounded-full transition-all ${
                            isCompleted ? 'bg-slate-400' : percent > 85 ? 'bg-amber-500' : 'bg-emerald-600'
                          }`}
                          style={{ width: `${percent}%` }}
                        />
                      </div>
                    </td>

                    <td className="py-3.5 px-4 text-center">
                      <span
                        className={`inline-block px-2.5 py-0.5 rounded-full text-[11px] border font-bold ${
                          statusClass[item.status] || 'bg-slate-100 text-slate-600 border-slate-200'
                        }`}
                      >
                        {statusText[item.status] || item.status}
                      </span>
                    </td>

                    <td className="py-3.5 px-4 text-center">
                      <div className="inline-flex items-center gap-1.5">
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            navigate(`/agriculture/logs?season_id=${item.id}`);
                          }}
                          className="px-2 py-1 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-300 rounded-lg font-bold text-[11px] cursor-pointer transition shadow-2xs inline-flex items-center gap-1"
                          title="Xem sổ nhật ký canh tác của mùa vụ này"
                        >
                          <BookOpen className="w-3 h-3 text-emerald-700" />
                          Nhật ký
                        </button>
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            navigate(`/agriculture/harvests?season_id=${item.id}`);
                          }}
                          className="px-2 py-1 bg-blue-50 hover:bg-blue-100 text-blue-800 border border-blue-300 rounded-lg font-bold text-[11px] cursor-pointer transition shadow-2xs inline-flex items-center gap-1"
                          title="Xem hoặc ghi nhận thu hoạch cho mùa vụ này"
                        >
                          <Wheat className="w-3 h-3 text-blue-700" />
                          Thu hoạch
                        </button>
                        {onPrintSeason && (
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              onPrintSeason(item);
                            }}
                            className="px-2 py-1 bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-200 rounded-lg font-bold text-[11px] cursor-pointer transition shadow-2xs inline-flex items-center gap-1"
                            title="In / Xuất hồ sơ kế hoạch mùa vụ & BOM (A4)"
                          >
                            <Printer className="w-3 h-3 text-slate-600" />
                            In hồ sơ
                          </button>
                        )}
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            onEditSeason(item);
                          }}
                          className="px-2 py-1 bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 rounded-lg font-bold text-[11px] cursor-pointer transition shadow-2xs inline-flex items-center gap-1"
                        >
                          <Pencil className="w-3 h-3 text-slate-500" />
                          Sửa
                        </button>
                        {!isCompleted && (
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              onCloseSeason(item);
                            }}
                            className="px-2 py-1 bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-300 rounded-lg font-bold text-[11px] cursor-pointer transition shadow-2xs inline-flex items-center gap-1"
                            title="Khóa & đóng mùa vụ (BR-FARM-002)"
                          >
                            <Lock className="w-3 h-3 text-amber-700" />
                            Đóng
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination Footer */}
      {filtered.length > pageSize && (
        <div className="p-3 border-t border-slate-200 bg-slate-50 flex items-center justify-between">
          <div className="text-xs text-slate-500 font-medium">
            Hiển thị <strong>{(currentPage - 1) * pageSize + 1}</strong>–
            <strong>{Math.min(currentPage * pageSize, filtered.length)}</strong> trên tổng số{' '}
            <strong>{filtered.length}</strong> mùa vụ
          </div>
          <Pagination
            currentPage={currentPage}
            totalItems={filtered.length}
            pageSize={pageSize}
            onPageChange={setCurrentPage}
          />
        </div>
      )}
    </div>
  );
};
