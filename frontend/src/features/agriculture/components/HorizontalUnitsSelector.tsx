import React, { useState, useMemo } from 'react';
import { MapPin, Plus, Search, Sprout, CheckCircle2, ChevronRight, SlidersHorizontal, Layers, Award } from 'lucide-react';
import { ProductionUnit } from '@/services/farmPlotApi';

interface HorizontalUnitsSelectorProps {
  units: ProductionUnit[];
  selectedUnit: ProductionUnit | null;
  onSelectUnit: (unit: ProductionUnit) => void;
  onOpenCreateModal: () => void;
  isLoading: boolean;
}

export const HorizontalUnitsSelector: React.FC<HorizontalUnitsSelectorProps> = ({
  units,
  selectedUnit,
  onSelectUnit,
  onOpenCreateModal,
  isLoading,
}) => {
  const [search, setSearch] = useState('');

  const filteredUnits = useMemo(() => {
    if (!search.trim()) return units;
    const q = search.toLowerCase();
    return units.filter(
      (u) =>
        u.name.toLowerCase().includes(q) ||
        u.unit_code.toLowerCase().includes(q) ||
        (u.puc_code && u.puc_code.toLowerCase().includes(q)) ||
        (u.crop && u.crop.toLowerCase().includes(q))
    );
  }, [units, search]);

  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-xs space-y-3">
      {/* Top Toolbar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-emerald-50 text-emerald-700">
            <Layers className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-xs font-black uppercase tracking-wider text-slate-800">
              Chọn Vùng Trồng / Vùng Nguyên Liệu Tập Trung
            </h3>
            <p className="text-[11px] text-slate-400">
              Nhấp chọn vùng để tải toàn bộ bảng phân lô và bản đồ tọa độ GPS bên dưới
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <div className="relative min-w-[220px]">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Tìm nhanh vùng, mã PUC..."
              className="w-full pl-8 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-xl outline-none focus:bg-white focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
            />
          </div>

          <button
            type="button"
            onClick={onOpenCreateModal}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs shadow-2xs transition active:scale-98 cursor-pointer shrink-0"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Thêm vùng mới</span>
          </button>
        </div>
      </div>

      {/* Horizontal Carousel / Grid of Unit Cards */}
      <div className="flex items-stretch gap-3 overflow-x-auto pb-2 pt-1 scrollbar-thin scrollbar-thumb-slate-200">
        {isLoading ? (
          <div className="py-6 text-center text-xs text-slate-400 w-full">Đang tải danh sách vùng trồng...</div>
        ) : filteredUnits.length === 0 ? (
          <div className="py-6 text-center text-xs text-slate-400 w-full">
            Không tìm thấy vùng trồng nào phù hợp với từ khóa "{search}".
          </div>
        ) : (
          filteredUnits.map((u) => {
            const isSelected = selectedUnit?.id === u.id;
            return (
              <div
                key={u.id}
                onClick={() => onSelectUnit(u)}
                className={`min-w-[260px] sm:min-w-[280px] p-3.5 rounded-2xl border-2 transition-all cursor-pointer flex flex-col justify-between select-none ${
                  isSelected
                    ? 'border-emerald-600 bg-gradient-to-br from-emerald-50/90 to-teal-50/40 shadow-sm ring-2 ring-emerald-500/20'
                    : 'border-slate-200 bg-white hover:border-emerald-300 hover:bg-slate-50/60'
                }`}
              >
                <div>
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-1.5">
                      <span className="font-mono text-xs font-black text-slate-900">{u.unit_code}</span>
                      {isSelected && <CheckCircle2 className="w-4 h-4 text-emerald-600 fill-emerald-100" />}
                    </div>
                    {u.puc_code ? (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-extrabold bg-blue-100 text-blue-800 border border-blue-200">
                        <Award className="w-3 h-3 text-blue-600" />
                        PUC: {u.puc_code}
                      </span>
                    ) : (
                      <span className="px-1.5 py-0.5 rounded text-[10px] font-semibold bg-slate-100 text-slate-600">
                        Chưa cấp PUC
                      </span>
                    )}
                  </div>

                  <h4 className="font-extrabold text-slate-900 text-[13px] mt-1.5 break-words leading-tight" title={u.name}>
                    {u.name}
                  </h4>

                  <div className="mt-2 flex items-center gap-3 text-xs text-slate-500">
                    <div className="flex items-center gap-1">
                      <Sprout className="w-3.5 h-3.5 text-emerald-600" />
                      <span className="font-semibold text-slate-700">{u.crop || 'Chưa chọn'}</span>
                    </div>
                    <span>•</span>
                    <div>
                      Quy mô: <strong className="text-slate-800 font-extrabold">{u.area} ha</strong>
                    </div>
                  </div>
                </div>

                <div className="mt-3 pt-2.5 border-t border-slate-100 flex items-center justify-between text-[11px]">
                  <span className="text-slate-500">
                    {u.plots_count ?? 0} thửa đất
                  </span>
                  <span
                    className={`font-bold ${
                      isSelected ? 'text-emerald-700 underline font-black' : 'text-slate-400'
                    }`}
                  >
                    {isSelected ? 'Đang chọn xem' : 'Nhấp để chọn'}
                  </span>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
