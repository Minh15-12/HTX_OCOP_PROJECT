import React, { useState } from 'react';
import {
  Droplets,
  Plus,
  Search,
  Filter,
  CheckCircle,
  AlertTriangle,
  Beaker,
  Thermometer,
  FileText,
  Clock,
  Layers,
  Sparkles
} from 'lucide-react';
import type { FarmingLog } from '@/types/agriculture';

interface FertigationLogTabProps {
  logs: FarmingLog[];
  onAddLog: () => void;
  onViewDetail: (log: FarmingLog) => void;
  isReadOnly?: boolean;
}

export const FertigationLogTab: React.FC<FertigationLogTabProps> = ({
  logs,
  onAddLog,
  onViewDetail,
  isReadOnly = false,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [methodFilter, setMethodFilter] = useState<string>('ALL');

  // Lọc chỉ các log dinh dưỡng hoặc tưới phân
  const fertigationLogs = logs.filter((log) => {
    const isFert =
      log.activity_type === 'FERTILIZATION' ||
      log.activity_type === 'FERTILIZING' ||
      Boolean(log.fertigation_method) ||
      Boolean(log.ec_solution) ||
      Boolean(log.tank_composition);
    if (!isFert) return false;

    if (methodFilter !== 'ALL' && log.fertigation_method !== methodFilter) {
      return false;
    }

    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      const matchPlot = log.plot_code?.toLowerCase().includes(term);
      const matchMat = log.material_name?.toLowerCase().includes(term);
      const matchLot = log.material_lot_number?.toLowerCase().includes(term);
      return matchPlot || matchMat || matchLot;
    }

    return true;
  });

  return (
    <div className="space-y-5">
      {/* KPI Cards Dinh dưỡng & Kiểm soát CNC */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
            <Droplets className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xs text-slate-500 font-medium">Tổng lượt châm phân / tưới</p>
            <p className="text-xl font-bold text-slate-800">{fertigationLogs.length} lượt</p>
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
            <Beaker className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xs text-slate-500 font-medium">EC Dung Dịch Chuẩn</p>
            <p className="text-xl font-bold text-blue-600">1.8 - 2.2 <span className="text-xs font-normal text-slate-500">mS/cm</span></p>
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-purple-50 text-purple-600 flex items-center justify-center font-bold">
            <Thermometer className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xs text-slate-500 font-medium">EC Nước Thoát / Rễ</p>
            <p className="text-xl font-bold text-purple-600">2.2 - 2.5 <span className="text-xs font-normal text-slate-500">mS/cm</span></p>
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-teal-50 text-teal-600 flex items-center justify-center font-bold">
            <CheckCircle className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xs text-slate-500 font-medium">pH Dung Dịch Đạt Chuẩn</p>
            <p className="text-xl font-bold text-teal-600">5.8 - 6.2</p>
          </div>
        </div>
      </div>

      {/* Header & Filter Controls */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
        <div className="flex flex-wrap items-center gap-3 flex-1">
          <div className="relative min-w-[220px]">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Tìm theo thửa, vật tư, số lô..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          <div className="flex items-center gap-1.5 text-sm">
            <Filter className="w-4 h-4 text-slate-400" />
            <select
              value={methodFilter}
              onChange={(e) => setMethodFilter(e.target.value)}
              className="border border-slate-200 rounded-lg px-2.5 py-2 text-sm text-slate-700 bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
            >
              <option value="ALL">Tất cả phương pháp</option>
              <option value="DRIP_EMITTER">Tưới nhỏ giọt qua que ghim</option>
              <option value="DRENCH">Tưới gốc</option>
              <option value="FOLIAR">Phun qua lá</option>
            </select>
          </div>
        </div>

        {!isReadOnly && (
          <button
            onClick={onAddLog}
            className="flex items-center justify-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-sm font-medium transition shadow-sm"
          >
            <Plus className="w-4 h-4" />
            Thêm Lượt Dinh Dưỡng
          </button>
        )}
      </div>

      {/* Bảng Nhật Ký Dinh Dưỡng & Fertigation Công Nghệ Cao */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold text-xs uppercase tracking-wider">
              <tr>
                <th className="py-3 px-4">Ngày bón/tưới</th>
                <th className="py-3 px-4">Thửa đất</th>
                <th className="py-3 px-4">Phương pháp bón</th>
                <th className="py-3 px-4 text-center">EC Tưới / EC Thoát</th>
                <th className="py-3 px-4 text-center">pH Dung Dịch</th>
                <th className="py-3 px-4">Thùng A & Thùng B / Phân bón</th>
                <th className="py-3 px-4">Số Lô (Lot/LSX) & Phiếu Kho</th>
                <th className="py-3 px-4">Người thực hiện</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {fertigationLogs.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-slate-400">
                    <Droplets className="w-10 h-10 mx-auto text-slate-300 mb-2" />
                    <p className="font-medium text-slate-500">Chưa có bản ghi dinh dưỡng & tưới phân nào</p>
                    <p className="text-xs text-slate-400 mt-1">Bấm nút "Thêm Lượt Dinh Dưỡng" để ghi nhận quy trình châm phân Fertigation</p>
                  </td>
                </tr>
              ) : (
                fertigationLogs.map((log) => {
                  const methodBadge =
                    log.fertigation_method === 'FOLIAR' ? (
                      <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-amber-50 text-amber-700 border border-amber-200">
                        Phun qua lá
                      </span>
                    ) : log.fertigation_method === 'DRENCH' ? (
                      <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-50 text-blue-700 border border-blue-200">
                        Tưới gốc
                      </span>
                    ) : (
                      <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-emerald-50 text-emerald-700 border border-emerald-200">
                        Nhỏ giọt que ghim
                      </span>
                    );

                  return (
                    <tr
                      key={log.id}
                      onClick={() => onViewDetail(log)}
                      className="hover:bg-slate-50/80 cursor-pointer transition"
                    >
                      <td className="py-3.5 px-4 font-mono font-medium text-slate-800 whitespace-nowrap">
                        {log.activity_date}
                      </td>
                      <td className="py-3.5 px-4 font-semibold text-slate-800 whitespace-nowrap">
                        Thửa {log.plot_code}
                      </td>
                      <td className="py-3.5 px-4 whitespace-nowrap">{methodBadge}</td>
                      <td className="py-3.5 px-4 text-center whitespace-nowrap">
                        <span className="font-mono font-bold text-blue-600">{log.ec_solution ?? '2.0'}</span>
                        <span className="text-slate-400 mx-1">/</span>
                        <span className="font-mono text-purple-600">{log.ec_drain ?? '2.4'}</span>
                        <span className="text-[10px] text-slate-400 ml-1">mS/cm</span>
                      </td>
                      <td className="py-3.5 px-4 text-center whitespace-nowrap">
                        <span className="font-mono font-bold text-teal-700 bg-teal-50 px-2 py-0.5 rounded border border-teal-200">
                          {log.ph_solution ?? '5.9'}
                        </span>
                      </td>
                      <td className="py-3.5 px-4">
                        <div className="text-xs space-y-0.5 max-w-[260px]">
                          <p className="font-semibold text-slate-800 truncate">
                            {log.material_name || 'Công thức NPK Ca-B + Vi lượng EDTA'}
                          </p>
                          <p className="text-slate-500 text-[11px]">
                            Lượng dùng: <span className="font-semibold text-slate-700">{log.quantity_applied ?? '15'} {log.unit ?? 'kg'}</span>
                          </p>
                        </div>
                      </td>
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <div className="text-xs space-y-0.5">
                          <p className="font-mono text-slate-700 font-medium">
                            Lot: {log.material_lot_number || 'LOT-PB-2601'}
                          </p>
                          <p className="text-slate-400 text-[11px]">
                            {log.material_export_slip_code || 'PXK-HTX-0042'}
                          </p>
                        </div>
                      </td>
                      <td className="py-3.5 px-4 whitespace-nowrap text-slate-600 text-xs">
                        {log.performer_name || 'Hộ xã viên A'}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
