import React, { useState, useMemo } from 'react';
import {
  MapPin,
  Plus,
  Search,
  Pencil,
  Sprout,
  SlidersHorizontal,
} from 'lucide-react';
import { ProductionUnit } from '@/services/farmPlotApi';
import { Pagination } from '@/components/ui/Pagination';

const statusText: Record<string, string> = {
  ACTIVE: 'Đang canh tác',
  PREPARING: 'Chuẩn bị đất',
  FALLOW: 'Đang nghỉ vụ',
  INACTIVE: 'Ngưng canh tác',
  UNDER_PUC_REVIEW: 'Chờ đánh giá PUC ⚠️',
  IN_QUARANTINE: 'Cách ly PHI 🛑',
};

const statusClass: Record<string, string> = {
  ACTIVE: 'border-emerald-300 bg-emerald-50 text-emerald-800 font-bold',
  PREPARING: 'border-amber-200 bg-amber-50 text-amber-700',
  FALLOW: 'border-slate-300 bg-slate-100 text-slate-600 font-medium',
  INACTIVE: 'border-red-200 bg-red-50 text-red-600',
  UNDER_PUC_REVIEW: 'border-amber-300 bg-amber-100 text-amber-900 font-bold',
  IN_QUARANTINE: 'border-rose-400 bg-rose-100 text-rose-900 font-extrabold animate-pulse ring-2 ring-rose-200',
};

interface ProductionUnitsListProps {
  units: ProductionUnit[];
  selectedUnit: ProductionUnit | null;
  onSelectUnit: (unit: ProductionUnit) => void;
  onOpenCreateModal: () => void;
  onOpenEditModal: (unit: ProductionUnit) => void;
  isLoading: boolean;
}

export const ProductionUnitsList: React.FC<ProductionUnitsListProps> = ({
  units,
  selectedUnit,
  onSelectUnit,
  onOpenCreateModal,
  onOpenEditModal,
  isLoading,
}) => {
  const [search, setSearch] = useState('');
  const [cropFilter, setCropFilter] = useState('Tất cả');
  const [statusFilter, setStatusFilter] = useState('Tất cả');
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(6);

  const crops = useMemo(() => {
    return Array.from(new Set(units.map((u) => u.crop).filter(Boolean)));
  }, [units]);

  const filtered = useMemo(() => {
    return units.filter((u) => {
      const q = search.toLowerCase();
      const matchSearch =
        !q ||
        [u.name, u.unit_code, u.crop, u.puc_code || ''].some((v) =>
          (v || '').toLowerCase().includes(q)
        );
      const matchStatus =
        statusFilter === 'Tất cả' ||
        statusText[u.status] === statusFilter ||
        (statusFilter === 'Chờ đánh giá PUC' && u.puc_status === 'UNDER_PUC_REVIEW');
      const matchCrop = cropFilter === 'Tất cả' || u.crop === cropFilter;
      return matchSearch && matchStatus && matchCrop;
    });
  }, [units, search, statusFilter, cropFilter]);

  const paginatedUnits = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filtered.slice(start, start + pageSize);
  }, [filtered, currentPage, pageSize]);

  const totalArea = units.reduce((a, u) => a + (Number(u.area) || 0), 0);

  return (
    <div className="space-y-4">
      {/* Filter Bar */}
      <div className="rounded-2xl border border-slate-200 bg-white p-3.5 shadow-xs">
        <div className="mb-2.5 flex items-center gap-2 text-xs font-bold text-slate-600">
          <SlidersHorizontal className="h-4 w-4 text-emerald-600" />
          Tìm kiếm & bộ lọc vùng sản xuất
        </div>
        <div className="flex flex-col gap-2.5 sm:flex-row">
          <div className="relative min-w-0 flex-1">
            <Search className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-400" />
            <input
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setCurrentPage(1);
              }}
              placeholder="Tìm tên vùng, mã vùng, mã PUC Cục BVTV, cây trồng..."
              className="h-9 w-full rounded-xl border border-slate-200 bg-slate-50 pl-9 pr-3 text-xs outline-none transition placeholder:text-slate-400 focus:border-emerald-500 focus:bg-white focus:ring-2 focus:ring-emerald-500/20"
            />
          </div>
          <select
            value={cropFilter}
            onChange={(e) => {
              setCropFilter(e.target.value);
              setCurrentPage(1);
            }}
            className="h-9 rounded-xl border border-slate-200 bg-white px-3 text-xs font-semibold text-slate-600 outline-none transition focus:border-emerald-500"
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
            className="h-9 rounded-xl border border-slate-200 bg-white px-3 text-xs font-semibold text-slate-600 outline-none transition focus:border-emerald-500"
          >
            <option value="Tất cả">Tất cả trạng thái</option>
            {Object.values(statusText).map((t) => (
              <option key={t} value={t}>
                {t}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Units List Card */}
      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-xs">
        <div className="flex items-center justify-between border-b border-slate-100 px-5 py-3.5 bg-slate-50/70">
          <div>
            <h2 className="text-sm font-extrabold text-slate-800">Danh sách vùng trồng</h2>
            <p className="text-[11px] text-slate-400">{filtered.length} vùng sản xuất phù hợp</p>
          </div>
          <div className="rounded-full bg-emerald-50 border border-emerald-200 px-3 py-1 text-xs font-bold text-emerald-800">
            Tổng: {totalArea.toFixed(1)} ha
          </div>
        </div>

        {isLoading ? (
          <div className="py-20 text-center text-xs text-slate-400">
            <div className="inline-block animate-spin rounded-full h-7 w-7 border-2 border-emerald-600 border-t-transparent mb-2" />
            <p className="font-semibold text-slate-600">Đang tải danh sách vùng sản xuất...</p>
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex min-h-[300px] flex-col items-center justify-center p-6 text-center">
            <div className="mb-3 flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-50 text-slate-300">
              <MapPin className="h-7 w-7" />
            </div>
            <p className="font-bold text-slate-700 text-xs">Chưa có vùng trồng nào</p>
            <p className="mt-1 max-w-xs text-[11px] leading-4 text-slate-400">
              Chưa có dữ liệu vùng trồng phù hợp. Khai báo vùng trồng mới để quản lý sản xuất và cấp mã số vùng trồng PUC.
            </p>
            <button
              type="button"
              onClick={onOpenCreateModal}
              className="mt-3.5 inline-flex items-center gap-1.5 rounded-xl bg-emerald-700 px-3.5 py-2 text-xs font-bold text-white transition hover:bg-emerald-800 shadow-xs cursor-pointer"
            >
              <Plus className="h-4 w-4" /> Khai báo vùng trồng
            </button>
          </div>
        ) : (
          <div>
            <div className="divide-y divide-slate-100">
              {paginatedUnits.map((u) => {
                const displayStatusKey =
                  u.puc_status === 'UNDER_PUC_REVIEW' ? 'UNDER_PUC_REVIEW' : u.status;
                const isSelected = selectedUnit?.id === u.id;

                return (
                  <div
                    key={u.id}
                    onClick={() => onSelectUnit(u)}
                    className={`group cursor-pointer px-4.5 py-3.5 transition-all hover:bg-emerald-50/40 ${
                      isSelected ? 'bg-emerald-50/70 border-l-4 border-l-emerald-600' : 'bg-white'
                    }`}
                  >
                    <div className="flex items-center gap-3.5">
                      <div
                        className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl transition ${
                          isSelected
                            ? 'bg-emerald-100 text-emerald-700 shadow-xs'
                            : 'bg-slate-100 text-slate-500 group-hover:bg-emerald-50 group-hover:text-emerald-700'
                        }`}
                      >
                        <Sprout className="h-5 w-5" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-center gap-1.5">
                          <h3 className="break-words font-bold text-slate-900 text-xs">{u.name}</h3>
                          <span
                            className={`rounded-md border px-2 py-0.5 text-[10px] font-bold ${
                              statusClass[displayStatusKey] ||
                              'border-slate-200 bg-slate-100 text-slate-600'
                            }`}
                          >
                            {statusText[displayStatusKey] || displayStatusKey}
                          </span>
                        </div>
                        <div className="mt-1 flex flex-wrap items-center gap-x-2.5 gap-y-0.5 text-[11px] text-slate-400">
                          <span>
                            Mã: <b className="font-semibold text-slate-700 font-mono">{u.unit_code}</b>
                          </span>
                          {u.puc_code && (
                            <span>
                              • PUC:{' '}
                              <b className="font-mono font-bold text-blue-700 bg-blue-50 px-1 py-0.2 rounded border border-blue-200">
                                {u.puc_code}
                              </b>
                            </span>
                          )}
                          <span>
                            • Cây trồng: <b className="font-semibold text-slate-700">{u.crop}</b>
                          </span>
                        </div>
                      </div>
                      <div className="hidden text-right sm:block">
                        <p className="text-base font-extrabold text-slate-800">{u.area}</p>
                        <p className="text-[10px] text-slate-400 font-bold uppercase">ha</p>
                      </div>
                      <button
                        type="button"
                        title="Sửa vùng trồng"
                        onClick={(e) => {
                          e.stopPropagation();
                          onOpenEditModal(u);
                        }}
                        className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-slate-400 opacity-60 transition hover:bg-white hover:text-emerald-700 hover:shadow-xs group-hover:opacity-100 cursor-pointer"
                      >
                        <Pencil className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>

            {filtered.length > pageSize && (
              <div className="p-3 border-t border-slate-100 bg-slate-50 flex items-center justify-between">
                <Pagination
                  currentPage={currentPage}
                  totalItems={filtered.length}
                  pageSize={pageSize}
                  onPageChange={setCurrentPage}
                  onPageSizeChange={setPageSize}
                  pageSizeOptions={[6, 12, 24]}
                />
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
