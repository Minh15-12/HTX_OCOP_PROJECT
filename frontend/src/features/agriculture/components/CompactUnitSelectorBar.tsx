import React from 'react';
import {
  Layers,
  MapPin,
  Pencil,
  Plus,
  FileSpreadsheet,
  CheckCircle2,
  AlertCircle,
  Sprout,
  Compass,
} from 'lucide-react';
import { ProductionUnit } from '@/services/farmPlotApi';

interface CompactUnitSelectorBarProps {
  units: ProductionUnit[];
  selectedUnitId: string | 'ALL';
  onSelectUnitId: (unitId: string | 'ALL') => void;
  onOpenCreateUnitModal: () => void;
  onOpenEditUnitModal: (unit: ProductionUnit) => void;
  onOpenAddPlotModal: () => void;
  onExportExcel?: () => void;
  onToggleMapView?: () => void;
  isMapView?: boolean;
}

export const CompactUnitSelectorBar: React.FC<CompactUnitSelectorBarProps> = ({
  units,
  selectedUnitId,
  onSelectUnitId,
  onOpenCreateUnitModal,
  onOpenEditUnitModal,
  onOpenAddPlotModal,
  onExportExcel,
  onToggleMapView,
  isMapView = false,
}) => {
  const selectedUnit = units.find((u) => u.id === selectedUnitId) || null;
  const totalArea = units.reduce((sum, u) => sum + (Number(u.area) || 0), 0);

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-3.5 shadow-xs transition-all">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        {/* Left: Dropdown Selector & Context Badges */}
        <div className="flex flex-1 flex-wrap items-center gap-2.5 min-w-0">
          <div className="flex items-center gap-2 shrink-0">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-50 text-emerald-700 border border-emerald-200 shadow-2xs">
              <Layers className="h-4.5 w-4.5" />
            </div>
            <label htmlFor="unit-selector" className="text-xs font-black uppercase tracking-wider text-slate-700 whitespace-nowrap">
              Vùng trồng:
            </label>
          </div>

          {/* Smart Select Combobox */}
          <div className="relative min-w-[260px] flex-1 max-w-md">
            <select
              id="unit-selector"
              value={selectedUnitId}
              onChange={(e) => onSelectUnitId(e.target.value)}
              className="w-full appearance-none rounded-xl border border-emerald-300 bg-emerald-50/40 px-3.5 py-2 pr-9 text-xs font-bold text-slate-800 outline-none transition hover:border-emerald-500 focus:border-emerald-600 focus:bg-white focus:ring-2 focus:ring-emerald-500/20 cursor-pointer shadow-2xs"
            >
              <option value="ALL" className="py-1 font-bold text-slate-900 bg-white">
                🌟 Xem tất cả vùng trồng (Toàn bộ HTX: {units.length} vùng • {totalArea.toFixed(1)} ha)
              </option>
              <optgroup label="Danh sách vùng sản xuất chuyên canh" className="text-slate-500 font-semibold bg-white">
                {units.map((u) => (
                  <option key={u.id} value={u.id} className="py-1 text-slate-800 font-semibold bg-white">
                    {u.unit_code} — {u.name} ({u.crop} • {u.area} ha)
                  </option>
                ))}
              </optgroup>
            </select>
            <div className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-emerald-700 text-xs font-bold">
              ▼
            </div>
          </div>

          {/* Context badges when viewing single unit */}
          {selectedUnit ? (
            <div className="hidden sm:flex flex-wrap items-center gap-1.5 text-xs">
              <span className="inline-flex items-center gap-1 rounded-lg bg-slate-100 border border-slate-200 px-2.5 py-1 text-slate-700 font-semibold">
                <Sprout className="h-3.5 w-3.5 text-emerald-600" />
                {selectedUnit.crop}
              </span>
              <span className="inline-flex items-center gap-1 rounded-lg bg-emerald-50 border border-emerald-200 px-2.5 py-1 text-emerald-800 font-bold">
                📐 {selectedUnit.area} ha
              </span>
              {selectedUnit.puc_code ? (
                <span className="inline-flex items-center gap-1 rounded-lg bg-blue-50 border border-blue-200 px-2.5 py-1 text-blue-800 font-bold">
                  <CheckCircle2 className="h-3.5 w-3.5 text-blue-600" />
                  PUC: {selectedUnit.puc_code}
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 rounded-lg bg-amber-50 border border-amber-200 px-2.5 py-1 text-amber-800 font-semibold">
                  <AlertCircle className="h-3.5 w-3.5 text-amber-600" />
                  Chưa cấp PUC
                </span>
              )}
              <button
                type="button"
                onClick={() => onOpenEditUnitModal(selectedUnit)}
                className="inline-flex items-center gap-1 rounded-lg border border-slate-200 bg-white px-2 py-1 text-[11px] font-bold text-slate-600 hover:text-emerald-700 hover:border-emerald-300 transition cursor-pointer shadow-2xs"
                title="Sửa thông tin vùng này"
              >
                <Pencil className="h-3 w-3" /> Sửa
              </button>
            </div>
          ) : (
            <div className="hidden sm:flex items-center gap-1.5 text-xs text-slate-500">
              <span className="rounded-lg bg-slate-100 border border-slate-200 px-2.5 py-1 font-semibold text-slate-700">
                🏛️ {units.length} vùng sản xuất
              </span>
              <span className="rounded-lg bg-emerald-50 border border-emerald-200 px-2.5 py-1 font-bold text-emerald-800">
                📐 Tổng quy hoạch: {totalArea.toFixed(1)} ha
              </span>
            </div>
          )}
        </div>

        {/* Right Actions */}
        <div className="flex flex-wrap items-center gap-2 shrink-0">
          {onToggleMapView && (
            <button
              type="button"
              onClick={onToggleMapView}
              className={`inline-flex items-center gap-1.5 rounded-xl border px-3 py-1.5 text-xs font-bold transition shadow-2xs cursor-pointer ${
                isMapView
                  ? 'bg-emerald-700 border-emerald-800 text-white'
                  : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50 hover:border-emerald-300'
              }`}
            >
              <Compass className="h-3.5 w-3.5" />
              <span>{isMapView ? 'Xem Bảng Phân Lô' : 'Bản Đồ Số GIS'}</span>
            </button>
          )}

          {onExportExcel && (
            <button
              type="button"
              onClick={onExportExcel}
              className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-xs font-bold text-slate-700 shadow-2xs hover:bg-slate-50 transition cursor-pointer"
              title="Xuất danh sách thửa đất sang Excel"
            >
              <FileSpreadsheet className="h-3.5 w-3.5 text-emerald-600" />
              <span className="hidden sm:inline">Xuất Excel</span>
            </button>
          )}

          <button
            type="button"
            onClick={onOpenCreateUnitModal}
            className="inline-flex items-center gap-1.5 rounded-xl border border-emerald-300 bg-emerald-50 px-3 py-1.5 text-xs font-bold text-emerald-800 hover:bg-emerald-100 transition shadow-2xs cursor-pointer"
          >
            <Plus className="h-3.5 w-3.5" />
            <span>Khai báo vùng</span>
          </button>

          <button
            type="button"
            onClick={onOpenAddPlotModal}
            className="inline-flex items-center gap-1.5 rounded-xl bg-emerald-700 px-3.5 py-1.5 text-xs font-extrabold text-white shadow-xs hover:bg-emerald-800 transition active:scale-98 cursor-pointer"
          >
            <Plus className="h-4 w-4" />
            <span>Thêm thửa đất</span>
          </button>
        </div>
      </div>
    </div>
  );
};
