import React from 'react';
import { Layers, Pencil, Plus, FileSpreadsheet } from 'lucide-react';
import { ProductionUnit } from '@/services/farmPlotApi';

interface FarmPlotBannerProps {
  units: ProductionUnit[];
  selectedUnit: ProductionUnit | null;
  plotsCount: number;
  activeCount: number;
  quarantineCount: number;
  totalPlotArea: number;
  onOpenEditUnitModal: (unit: ProductionUnit) => void;
  onOpenAddPlotModal: () => void;
  onExportExcel: () => void;
  onSwitchToMap?: () => void;
}

export const FarmPlotBanner: React.FC<FarmPlotBannerProps> = ({
  units,
  selectedUnit,
  plotsCount,
  activeCount,
  quarantineCount,
  totalPlotArea,
  onOpenEditUnitModal,
  onOpenAddPlotModal,
  onExportExcel,
  onSwitchToMap,
}) => {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs">
      <div className="flex flex-col gap-3.5 lg:flex-row lg:items-center lg:justify-between">
        <div className="space-y-1">
          <div className="flex flex-wrap items-center gap-2">
            <span className="rounded-md bg-emerald-100 px-2.5 py-0.5 text-xs font-mono font-bold text-emerald-800">
              {selectedUnit ? selectedUnit.unit_code : 'TOÀN HỢP TÁC XÃ'}
            </span>
            <h2 className="text-lg font-black text-slate-900">
              {selectedUnit ? selectedUnit.name : 'Toàn Bộ Thửa Đất Canh Tác'}
            </h2>
            {selectedUnit?.puc_code ? (
              <span className="rounded-full bg-blue-50 border border-blue-200 px-2.5 py-0.5 text-xs font-bold text-blue-700 flex items-center gap-1">
                Mã PUC: <span className="font-mono">{selectedUnit.puc_code}</span>
              </span>
            ) : selectedUnit ? (
              <span className="rounded-full bg-amber-50 border border-amber-200 px-2.5 py-0.5 text-xs font-semibold text-amber-700">
                Chưa cấp mã PUC
              </span>
            ) : (
              <span className="rounded-full bg-emerald-50 border border-emerald-200 px-2.5 py-0.5 text-xs font-bold text-emerald-800">
                {units.length} vùng sản xuất
              </span>
            )}
          </div>

          <div className="flex flex-wrap items-center gap-x-5 gap-y-1 text-xs text-slate-600">
            {selectedUnit ? (
              <>
                <span>🌱 Cây trồng: <strong className="text-slate-800">{selectedUnit.crop}</strong></span>
                <span>📐 Diện tích: <strong className="text-slate-800">{selectedUnit.area} ha</strong> ({totalPlotArea.toFixed(1)} ha đã phân lô)</span>
                <span>📍 GPS vùng: <strong className="font-mono text-slate-700">{selectedUnit.gps_coordinates || '—'}</strong></span>
              </>
            ) : (
              <>
                <span>📐 Tổng diện tích đã phân lô: <strong className="text-slate-900 font-extrabold">{totalPlotArea.toFixed(1)} ha</strong></span>
                <span>🌱 Tổng số thửa đất: <strong className="text-emerald-700 font-extrabold">{plotsCount} thửa</strong></span>
                <span>🛡️ Giám sát an toàn: <strong className="text-slate-800">{activeCount} an toàn</strong> • {quarantineCount > 0 ? <strong className="text-rose-600 font-bold">{quarantineCount} cách ly PHI</strong> : '100% an toàn'}</span>
              </>
            )}
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {onSwitchToMap && (
            <button
              type="button"
              onClick={onSwitchToMap}
              className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-xs font-bold text-slate-700 shadow-2xs hover:border-emerald-300 hover:text-emerald-800 transition cursor-pointer"
            >
              <Layers className="h-3.5 w-3.5 text-emerald-600" /> Bản đồ GIS
            </button>
          )}
          {selectedUnit && (
            <button
              type="button"
              onClick={() => onOpenEditUnitModal(selectedUnit)}
              className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-xs font-bold text-slate-700 shadow-2xs hover:border-emerald-300 hover:text-emerald-800 transition cursor-pointer"
            >
              <Pencil className="h-3.5 w-3.5" /> Sửa vùng
            </button>
          )}
          <button
            type="button"
            onClick={onExportExcel}
            className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-xs font-bold text-slate-700 shadow-2xs hover:bg-slate-50 transition cursor-pointer"
          >
            <FileSpreadsheet className="h-3.5 w-3.5 text-emerald-600" /> Xuất Excel
          </button>
          <button
            type="button"
            onClick={onOpenAddPlotModal}
            className="inline-flex items-center gap-1.5 rounded-xl bg-emerald-700 px-3.5 py-1.5 text-xs font-bold text-white shadow-xs hover:bg-emerald-800 transition active:scale-98 cursor-pointer"
          >
            <Plus className="h-4 w-4" /> Thêm thửa mới
          </button>
        </div>
      </div>
    </div>
  );
};
