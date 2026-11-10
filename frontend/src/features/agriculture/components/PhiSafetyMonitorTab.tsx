import React, { useState, useMemo } from 'react';
import {
  ShieldAlert,
  AlertTriangle,
  CheckCircle2,
  Clock,
  Search,
  Filter,
  Calendar,
  MapPin,
  User,
  FileSpreadsheet,
  Activity,
  Layers,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  LayoutList,
  GitCommit,
  Plus,
} from 'lucide-react';
import { FarmingLog } from '@/types/agriculture';
import { exportToExcel } from '@/utils/exportUtils';

interface PhiSafetyMonitorTabProps {
  logs: FarmingLog[];
  onSelectLog: (log: FarmingLog) => void;
  onOpenQuickLog: () => void;
}

export const PhiSafetyMonitorTab: React.FC<PhiSafetyMonitorTabProps> = ({
  logs,
  onSelectLog,
  onOpenQuickLog,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [safetyFilter, setSafetyFilter] = useState<'ALL' | 'IN_PHI' | 'SAFE'>('ALL');
  const [viewMode, setViewMode] = useState<'TIMELINE' | 'TABLE'>('TIMELINE');

  // Filter logs that involve pesticide or fertilizer with PHI
  const sprayLogs = useMemo(() => {
    return logs.filter(
      (l) =>
        l.activity_type === 'SPRAYING' ||
        l.activity_type === 'FERTILIZATION' ||
        Boolean(l.active_ingredient) ||
        (l.phi_days && l.phi_days > 0)
    );
  }, [logs]);

  // Compute PHI status and timeline progress for each log
  const computedList = useMemo(() => {
    const now = new Date();
    return sprayLogs.map((log) => {
      const sprayDate = new Date(log.activity_date);
      const phiDays = log.phi_days || 0;
      const safeHarvestDate = new Date(sprayDate.getTime() + phiDays * 24 * 60 * 60 * 1000);
      const diffMs = safeHarvestDate.getTime() - now.getTime();
      const remainingDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24));
      const isInQuarantine = remainingDays > 0;

      // Calculate progress percentage (0% = just sprayed, 100% = safe)
      let progressPercent = 100;
      if (phiDays > 0) {
        const totalDurationMs = phiDays * 24 * 60 * 60 * 1000;
        const elapsedMs = now.getTime() - sprayDate.getTime();
        progressPercent = Math.min(Math.max(Math.round((elapsedMs / totalDurationMs) * 100), 0), 100);
      }

      return {
        ...log,
        computedPhiDays: phiDays,
        safeHarvestDateStr: safeHarvestDate.toISOString().slice(0, 10),
        remainingDays: remainingDays > 0 ? remainingDays : 0,
        isInQuarantine,
        progressPercent,
      };
    });
  }, [sprayLogs]);

  // Summary metrics
  const activeQuarantineCount = computedList.filter((item) => item.isInQuarantine).length;
  const safeCount = computedList.filter((item) => !item.isInQuarantine).length;

  const filteredItems = useMemo(() => {
    return computedList.filter((item) => {
      if (safetyFilter === 'IN_PHI' && !item.isInQuarantine) return false;
      if (safetyFilter === 'SAFE' && item.isInQuarantine) return false;

      if (!searchTerm) return true;
      const term = searchTerm.toLowerCase();
      return (
        item.plot_code?.toLowerCase().includes(term) ||
        item.crop_name?.toLowerCase().includes(term) ||
        item.performed_by?.toLowerCase().includes(term) ||
        item.active_ingredient?.toLowerCase().includes(term) ||
        item.notes?.toLowerCase().includes(term)
      );
    });
  }, [computedList, safetyFilter, searchTerm]);

  const handleExportExcel = () => {
    const rows = filteredItems.map((item, idx) => ({
      STT: idx + 1,
      'Mã Thửa Đất': item.plot_code || '---',
      'Cây Trồng': item.crop_name || '---',
      'Ngày Phun/Bón': item.activity_date,
      'Hoạt Chất / Chế Phẩm': item.active_ingredient || item.notes || '---',
      'Thời Gian Cách Ly (Ngày)': item.computedPhiDays,
      'Ngày An Toàn Thu Hoạch': item.safeHarvestDateStr,
      'Trạng Thái Cách Ly': item.isInQuarantine ? `Đang cách ly (Còn ${item.remainingDays} ngày)` : 'Đã an toàn',
      'Tiến Độ Cách Ly (%)': `${item.progressPercent}%`,
      'Người Thực Hiện': item.performed_by || '---',
    }));
    exportToExcel(rows, `giam_sat_cach_ly_phi_${new Date().toISOString().slice(0, 10)}.xlsx`);
  };

  return (
    <div className="space-y-4 animate-fade-in text-[13px]">
      {/* Alert Banner & KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 flex items-center gap-3 shadow-2xs">
          <div className="w-10 h-10 rounded-xl bg-amber-100 flex items-center justify-center text-amber-700 shrink-0">
            <ShieldAlert className="w-5 h-5 animate-pulse" />
          </div>
          <div>
            <div className="text-[11px] font-bold text-amber-800 uppercase tracking-wide">
              Đang trong thời gian cách ly (PHI)
            </div>
            <div className="text-xl font-black text-amber-900 mt-0.5">
              {activeQuarantineCount} thửa đất
            </div>
            <div className="text-[10.5px] text-amber-700 mt-0.5 font-medium">
              🛑 Nghiêm cấm thu hoạch trước ngày chỉ định
            </div>
          </div>
        </div>

        <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-4 flex items-center gap-3 shadow-2xs">
          <div className="w-10 h-10 rounded-xl bg-emerald-100 flex items-center justify-center text-emerald-700 shrink-0">
            <CheckCircle2 className="w-5 h-5" />
          </div>
          <div>
            <div className="text-[11px] font-bold text-emerald-800 uppercase tracking-wide">
              Đã hết hạn cách ly — An toàn
            </div>
            <div className="text-xl font-black text-emerald-900 mt-0.5">
              {safeCount} lượt xử lý
            </div>
            <div className="text-[10.5px] text-emerald-700 mt-0.5 font-medium">
              ✅ Đủ điều kiện thu hoạch và kiểm nghiệm KCS
            </div>
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-2xl p-4 flex items-center justify-between shadow-2xs">
          <div>
            <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wide">
              Quy chuẩn kiểm soát
            </div>
            <div className="text-sm font-black text-slate-800 mt-1">
              VietGAP TCVN 11892-1:2017
            </div>
            <div className="text-[10.5px] text-slate-500 mt-0.5">
              OCOP Tiêu chí C.2.2 • TCVN 12850:2019
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleExportExcel}
              className="px-3 py-1.5 border border-slate-200 hover:bg-slate-50 text-slate-700 font-bold text-xs rounded-xl inline-flex items-center gap-1.5 cursor-pointer shadow-2xs transition"
            >
              <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-600" /> Xuất Excel
            </button>
            <button
              type="button"
              onClick={onOpenQuickLog}
              className="px-3.5 py-1.5 bg-emerald-700 hover:bg-emerald-800 text-white font-extrabold text-xs rounded-xl inline-flex items-center gap-1.5 shadow-xs transition cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" /> Ghi nhật ký BVTV / PHI
            </button>
          </div>
        </div>
      </div>

      {/* Filter and Mode Switcher Bar */}
      <div className="bg-white p-3 rounded-2xl border border-slate-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2 overflow-x-auto">
          {/* Status Filters */}
          <button
            type="button"
            onClick={() => setSafetyFilter('ALL')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer ${
              safetyFilter === 'ALL'
                ? 'bg-slate-800 text-white shadow-2xs'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            Tất cả ({computedList.length})
          </button>
          <button
            type="button"
            onClick={() => setSafetyFilter('IN_PHI')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer flex items-center gap-1.5 ${
              safetyFilter === 'IN_PHI'
                ? 'bg-rose-700 text-white shadow-2xs'
                : 'text-rose-700 bg-rose-50 hover:bg-rose-100'
            }`}
          >
            <AlertTriangle className="w-3.5 h-3.5" />
            Đang cách ly ({activeQuarantineCount})
          </button>
          <button
            type="button"
            onClick={() => setSafetyFilter('SAFE')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer flex items-center gap-1.5 ${
              safetyFilter === 'SAFE'
                ? 'bg-emerald-700 text-white shadow-2xs'
                : 'text-emerald-700 bg-emerald-50 hover:bg-emerald-100'
            }`}
          >
            <CheckCircle2 className="w-3.5 h-3.5" />
            Đã an toàn ({safeCount})
          </button>
        </div>

        <div className="flex items-center gap-2">
          {/* View Mode Toggle: Timeline vs Table */}
          <div className="flex bg-slate-100 p-0.5 rounded-xl border border-slate-200 text-xs">
            <button
              type="button"
              onClick={() => setViewMode('TIMELINE')}
              className={`px-3 py-1.5 rounded-lg font-bold flex items-center gap-1.5 transition cursor-pointer ${
                viewMode === 'TIMELINE'
                  ? 'bg-white text-emerald-800 shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <GitCommit className="w-3.5 h-3.5 text-emerald-600" />
              <span>Tiến trình Timeline</span>
            </button>
            <button
              type="button"
              onClick={() => setViewMode('TABLE')}
              className={`px-3 py-1.5 rounded-lg font-bold flex items-center gap-1.5 transition cursor-pointer ${
                viewMode === 'TABLE'
                  ? 'bg-white text-emerald-800 shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <LayoutList className="w-3.5 h-3.5 text-emerald-600" />
              <span>Bảng chi tiết</span>
            </button>
          </div>

          {/* Search Box */}
          <div className="relative w-full sm:w-60">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Tìm thửa đất, hoạt chất..."
              className="w-full pl-9 pr-3 py-1.5 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-emerald-500 outline-none"
            />
          </div>
        </div>
      </div>

      {/* Mode 1: Visual Safety Timeline Cards (Gantt-like Progress) */}
      {viewMode === 'TIMELINE' && (
        <div className="space-y-3">
          {filteredItems.length === 0 ? (
            <div className="p-12 text-center text-slate-400 bg-white rounded-2xl border border-slate-200">
              <ShieldAlert className="w-10 h-10 mx-auto text-slate-300 mb-2" />
              <p className="font-semibold text-slate-600">Không có dữ liệu xử lý BVTV / Cách ly PHI</p>
              <p className="text-xs text-slate-400 mt-0.5">Tất cả các thửa đất đều đang ở trạng thái canh tác an toàn thông thường.</p>
            </div>
          ) : (
            filteredItems.map((item) => (
              <div
                key={item.id}
                className={`bg-white rounded-2xl border p-4 sm:p-5 transition-all shadow-2xs hover:shadow-sm ${
                  item.isInQuarantine
                    ? 'border-amber-300 bg-gradient-to-r from-amber-50/30 to-white'
                    : 'border-slate-200 hover:border-emerald-300'
                }`}
              >
                {/* Top Card Info */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b pb-3 border-slate-100">
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 font-bold ${
                        item.isInQuarantine
                          ? 'bg-rose-100 text-rose-800'
                          : 'bg-emerald-100 text-emerald-800'
                      }`}
                    >
                      <MapPin className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-black text-sm text-slate-900">
                          {item.plot_code || 'Thửa đất'}
                        </span>
                        <span className="text-xs font-bold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                          {item.crop_name || 'Ớt Sweet Palermo'}
                        </span>
                        {item.active_ingredient && (
                          <span className="text-[11px] font-semibold text-slate-600 bg-slate-100 px-2 py-0.5 rounded">
                            {item.active_ingredient}
                          </span>
                        )}
                      </div>
                      <p className="text-[11px] text-slate-500 mt-0.5 flex items-center gap-2">
                        <span>Thực hiện: <strong>{item.performed_by || 'Xã viên HTX'}</strong></span>
                        <span>&bull;</span>
                        <span>Hoạt động: {item.activity_type === 'SPRAYING' ? 'Phun phòng trừ BVTV' : 'Bón phân bổ sung'}</span>
                      </p>
                    </div>
                  </div>

                  {/* Status Badge */}
                  <div className="flex items-center gap-2 self-start sm:self-auto">
                    {item.isInQuarantine ? (
                      <span className="px-3 py-1 bg-rose-100 text-rose-800 border border-rose-300 rounded-xl text-xs font-black flex items-center gap-1.5 shadow-2xs">
                        <span className="w-2 h-2 rounded-full bg-rose-600 animate-ping mr-0.5" />
                        Đang cách ly PHI (Còn {item.remainingDays} ngày)
                      </span>
                    ) : (
                      <span className="px-3 py-1 bg-emerald-100 text-emerald-800 border border-emerald-300 rounded-xl text-xs font-black flex items-center gap-1.5 shadow-2xs">
                        <CheckCircle2 className="w-4 h-4 text-emerald-700" />
                        Đã hết hạn cách ly — An toàn thu hoạch
                      </span>
                    )}

                    <button
                      type="button"
                      onClick={() => onSelectLog(item)}
                      className="px-2.5 py-1 text-xs font-bold text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 rounded-lg transition cursor-pointer"
                    >
                      Chi tiết
                    </button>
                  </div>
                </div>

                {/* Timeline Progress Visualizer */}
                <div className="pt-4 space-y-2">
                  <div className="flex items-center justify-between text-xs font-bold">
                    <span className="text-slate-600 flex items-center gap-1.5">
                      <Calendar className="w-3.5 h-3.5 text-slate-400" />
                      Ngày xử lý: <strong className="text-slate-900">{item.activity_date}</strong>
                    </span>

                    <span className="text-[11px] font-mono text-slate-500">
                      Thời gian cách ly: <strong>{item.computedPhiDays} ngày</strong> ({item.progressPercent}% hoàn thành)
                    </span>

                    <span className="text-emerald-800 flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5 text-emerald-600" />
                      Ngày an toàn: <strong className="text-emerald-950 font-black">{item.safeHarvestDateStr}</strong>
                    </span>
                  </div>

                  {/* Progress Track */}
                  <div className="relative w-full h-3 bg-slate-100 rounded-full overflow-hidden border border-slate-200">
                    <div
                      className={`h-full transition-all duration-500 rounded-full ${
                        item.isInQuarantine
                          ? 'bg-gradient-to-r from-amber-400 to-rose-500'
                          : 'bg-emerald-600'
                      }`}
                      style={{ width: `${item.progressPercent}%` }}
                    />
                  </div>

                  {/* Timeline Stage Points */}
                  <div className="flex items-center justify-between text-[10.5px] text-slate-500 pt-1">
                    <div className="flex items-center gap-1">
                      <span className="w-2 h-2 rounded-full bg-slate-400" />
                      <span>Bắt đầu phun thuốc</span>
                    </div>

                    <div className="flex items-center gap-1 font-semibold text-amber-800">
                      {item.isInQuarantine ? (
                        <span>🛑 Khu vực cách ly an toàn VietGAP</span>
                      ) : (
                        <span className="text-emerald-700">✓ Đã vượt qua thời gian cách ly</span>
                      )}
                    </div>

                    <div className="flex items-center gap-1 font-bold text-emerald-700">
                      <span className="w-2 h-2 rounded-full bg-emerald-600" />
                      <span>Được phép thu hoạch</span>
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* Mode 2: Traditional Full Table View */}
      {viewMode === 'TABLE' && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50/80 border-b border-slate-200 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                  <th className="py-3 px-4">Thửa Đất &amp; Cây Trồng</th>
                  <th className="py-3 px-4">Ngày Phun/Xử Lý</th>
                  <th className="py-3 px-4 text-center">Thời Gian Cách Ly</th>
                  <th className="py-3 px-4">Ngày An Toàn Thu Hoạch</th>
                  <th className="py-3 px-4 text-center">Trạng Thái An Toàn</th>
                  <th className="py-3 px-4">Hoạt Chất &amp; Ghi Chú</th>
                  <th className="py-3 px-4 text-right">Thao Tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredItems.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-12 text-center text-slate-400">
                      <ShieldAlert className="w-10 h-10 mx-auto text-slate-300 mb-2" />
                      <p className="font-semibold text-slate-600">Không có dữ liệu xử lý BVTV / Cách ly PHI</p>
                    </td>
                  </tr>
                ) : (
                  filteredItems.map((item) => (
                    <tr key={item.id} className="hover:bg-slate-50/60 transition group">
                      <td className="py-3 px-4">
                        <div className="font-bold text-slate-900 font-mono flex items-center gap-1.5">
                          <MapPin className="w-3.5 h-3.5 text-slate-400" />
                          {item.plot_code || 'Chưa định danh'}
                        </div>
                        <div className="text-[11px] text-emerald-700 font-semibold mt-0.5">
                          {item.crop_name || 'Cây trồng vụ'}
                        </div>
                      </td>

                      <td className="py-3 px-4">
                        <div className="flex items-center gap-1.5 font-medium text-slate-700">
                          <Calendar className="w-3.5 h-3.5 text-slate-400" />
                          {item.activity_date}
                        </div>
                        <div className="text-[10.5px] text-slate-400">
                          {item.activity_type === 'SPRAYING' ? 'Phun thuốc BVTV' : 'Bón phân bổ sung'}
                        </div>
                      </td>

                      <td className="py-3 px-4 text-center">
                        <span className="inline-block px-2.5 py-1 rounded-lg bg-amber-100 text-amber-900 font-bold text-xs">
                          {item.computedPhiDays} ngày
                        </span>
                      </td>

                      <td className="py-3 px-4">
                        <div className="font-bold text-slate-800 flex items-center gap-1.5">
                          <Clock className="w-3.5 h-3.5 text-slate-400" />
                          {item.safeHarvestDateStr}
                        </div>
                        <div className="text-[10.5px] text-slate-400">Được phép thu hái</div>
                      </td>

                      <td className="py-3 px-4 text-center">
                        {item.isInQuarantine ? (
                          <div className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-rose-100 text-rose-800 text-[11px] font-bold border border-rose-200">
                            <span className="w-2 h-2 rounded-full bg-rose-600 animate-ping mr-0.5" />
                            Cách ly (Còn {item.remainingDays} ngày)
                          </div>
                        ) : (
                          <div className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-800 text-[11px] font-bold border border-emerald-200">
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-700" />
                            Đã an toàn thu hoạch
                          </div>
                        )}
                      </td>

                      <td className="py-3 px-4 max-w-xs">
                        <div className="font-semibold text-slate-800">
                          {item.active_ingredient || 'Thảo mộc sinh học'}
                        </div>
                        <div className="text-[11px] text-slate-500 truncate mt-0.5" title={item.notes || ''}>
                          {item.notes || 'Thực hiện theo khuyến cáo VietGAP'}
                        </div>
                      </td>

                      <td className="py-3 px-4 text-right">
                        <button
                          type="button"
                          onClick={() => onSelectLog(item)}
                          className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs cursor-pointer transition"
                        >
                          Chi tiết
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
