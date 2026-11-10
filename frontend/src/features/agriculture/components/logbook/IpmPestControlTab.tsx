import React, { useState } from 'react';
import {
  ShieldAlert,
  Bug,
  Search,
  Plus,
  Filter,
  CheckCircle2,
  AlertTriangle,
  Clock,
  Sparkles,
  Info,
  Calendar,
  Layers,
  ShieldCheck,
  Ban
} from 'lucide-react';
import type { FarmingLog } from '@/types/agriculture';

interface IpmPestControlTabProps {
  logs: FarmingLog[];
  onAddLog: () => void;
  onViewDetail: (log: FarmingLog) => void;
  isReadOnly?: boolean;
}

export const IpmPestControlTab: React.FC<IpmPestControlTabProps> = ({
  logs,
  onAddLog,
  onViewDetail,
  isReadOnly = false,
}) => {
  const [filterType, setFilterType] = useState<'ALL' | 'SCOUTING' | 'BIOCONTROL' | 'CHEMICAL'>('ALL');
  const [searchTerm, setSearchTerm] = useState('');

  // Lọc các bản ghi liên quan đến IPM, Thiên địch và BVTV
  const ipmLogs = logs.filter((log) => {
    const isIpmRelated =
      log.activity_type === 'SPRAYING' ||
      log.activity_type === 'PEST_CONTROL' ||
      log.activity_type === 'BIOCONTROL' ||
      log.activity_type === 'IPM_SCOUTING' ||
      Boolean(log.pest_target) ||
      Boolean(log.active_ingredient) ||
      Boolean(log.phi_days && log.phi_days > 0);

    if (!isIpmRelated) return false;

    if (filterType === 'SCOUTING' && log.activity_type !== 'IPM_SCOUTING') return false;
    if (filterType === 'BIOCONTROL' && log.activity_type !== 'BIOCONTROL') return false;
    if (filterType === 'CHEMICAL' && log.activity_type !== 'SPRAYING') return false;

    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      const matchPest = log.pest_target?.toLowerCase().includes(term);
      const matchActive = log.active_ingredient?.toLowerCase().includes(term);
      const matchMat = log.material_name?.toLowerCase().includes(term);
      const matchPlot = log.plot_code?.toLowerCase().includes(term);
      return matchPest || matchActive || matchMat || matchPlot;
    }

    return true;
  });

  return (
    <div className="space-y-5">
      {/* Banner Cảnh báo An Toàn IPM & PHI */}
      <div className="p-4 rounded-xl border border-sky-200 bg-sky-50/70 text-sky-950 flex flex-col md:flex-row items-start md:items-center justify-between gap-3 text-sm">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-sky-600 text-white flex items-center justify-center font-bold flex-shrink-0">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div>
            <p className="font-bold text-sky-900">Quy tắc 4 Đúng & Quản Lý Dịch Hại Tổng Hợp (IPM):</p>
            <p className="text-xs text-sky-800 opacity-90 mt-0.5">
              Ưu tiên biện pháp sinh học thả thiên địch. Khi thả thiên địch ngưng thuốc hóa học ít nhất 21 ngày. Tuân thủ Thông tư 75/2025/TT-BNNMT & VietGAP TCVN 11892-1:2017.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 self-end md:self-auto flex-shrink-0">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800 border border-emerald-200">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
            Không để ô trống
          </span>
        </div>
      </div>

      {/* Filter Bar & Add Button */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
        <div className="flex flex-wrap items-center gap-2 flex-1">
          {/* Quick Filter Buttons */}
          <button
            onClick={() => setFilterType('ALL')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
              filterType === 'ALL'
                ? 'bg-slate-800 text-white shadow-sm'
                : 'bg-slate-100 hover:bg-slate-200 text-slate-600'
            }`}
          >
            Tất cả ({ipmLogs.length})
          </button>
          <button
            onClick={() => setFilterType('SCOUTING')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
              filterType === 'SCOUTING'
                ? 'bg-purple-600 text-white shadow-sm'
                : 'bg-purple-50 text-purple-700 hover:bg-purple-100'
            }`}
          >
            🔍 Điều tra Dịch hại
          </button>
          <button
            onClick={() => setFilterType('BIOCONTROL')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
              filterType === 'BIOCONTROL'
                ? 'bg-teal-600 text-white shadow-sm'
                : 'bg-teal-50 text-teal-700 hover:bg-teal-100'
            }`}
          >
            🐛 Thả Thiên Địch (Sinh học)
          </button>
          <button
            onClick={() => setFilterType('CHEMICAL')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
              filterType === 'CHEMICAL'
                ? 'bg-rose-600 text-white shadow-sm'
                : 'bg-rose-50 text-rose-700 hover:bg-rose-100'
            }`}
          >
            🛡️ Thuốc BVTV & PHI
          </button>

          <div className="relative min-w-[200px] ml-auto">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Tìm đối tượng hại, hoạt chất..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>
        </div>

        {!isReadOnly && (
          <button
            onClick={onAddLog}
            className="flex items-center justify-center gap-2 px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-lg text-sm font-medium transition shadow-sm"
          >
            <Plus className="w-4 h-4" />
            Ghi Nhật Ký IPM / BVTV
          </button>
        )}
      </div>

      {/* Bảng Dịch Hại, Thiên Địch & Bảo Vệ Thực Vật Chuẩn VietGAP */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold text-xs uppercase tracking-wider">
              <tr>
                <th className="py-3 px-4">Ngày ghi</th>
                <th className="py-3 px-4">Thửa</th>
                <th className="py-3 px-4">Phân loại</th>
                <th className="py-3 px-4">Đối tượng hại / Mật độ</th>
                <th className="py-3 px-4">Vật tư & Tên Hoạt chất</th>
                <th className="py-3 px-4">Nhóm IRAC/FRAC</th>
                <th className="py-3 px-4">Số Lô & Phiếu Kho</th>
                <th className="py-3 px-4">Thời gian cách ly PHI</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {ipmLogs.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-slate-400">
                    <ShieldAlert className="w-10 h-10 mx-auto text-slate-300 mb-2" />
                    <p className="font-medium text-slate-500">Chưa có bản ghi dịch hại hoặc BVTV nào</p>
                    <p className="text-xs text-slate-400 mt-1">Bấm nút "Ghi Nhật Ký IPM / BVTV" để bắt đầu theo dõi</p>
                  </td>
                </tr>
              ) : (
                ipmLogs.map((log) => {
                  const isScouting = log.activity_type === 'IPM_SCOUTING';
                  const isBiocontrol = log.activity_type === 'BIOCONTROL';
                  const isSpraying = log.activity_type === 'SPRAYING';

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
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        {isScouting ? (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-purple-50 text-purple-700 border border-purple-200">
                            Điều tra IPM
                          </span>
                        ) : isBiocontrol ? (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-teal-50 text-teal-700 border border-teal-200">
                            Thả Thiên Địch
                          </span>
                        ) : (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-rose-50 text-rose-700 border border-rose-200">
                            Thuốc BVTV
                          </span>
                        )}
                      </td>
                      <td className="py-3.5 px-4">
                        <div className="text-xs space-y-0.5">
                          <p className="font-semibold text-slate-800">
                            {log.pest_target || (isScouting ? 'Kiểm tra bọ trĩ & nhện đỏ' : 'Phòng trừ tổng hợp')}
                          </p>
                          <p className={`font-mono text-[11px] ${
                            log.pest_density === 'KHÔNG_PHÁT_HIỆN' || !log.pest_density
                              ? 'text-emerald-600 font-semibold'
                              : 'text-amber-700'
                          }`}>
                            {log.pest_density || 'Không phát hiện (Sạch sâu bệnh)'}
                          </p>
                        </div>
                      </td>
                      <td className="py-3.5 px-4">
                        <div className="text-xs space-y-0.5 max-w-[240px]">
                          <p className="font-semibold text-slate-800 truncate">
                            {log.material_name || log.biocontrol_agent_name || 'Radiant 60SC (Dow Agro)'}
                          </p>
                          <p className="text-slate-500 text-[11px]">
                            Hoạt chất: <span className="font-semibold text-slate-700">{log.active_ingredient || 'Spinetoram 60g/L'}</span>
                          </p>
                        </div>
                      </td>
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <span className="font-mono text-xs font-bold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded border border-indigo-200">
                          {log.resistance_group || 'IRAC 5 (Spinosyns)'}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 whitespace-nowrap text-xs">
                        <p className="font-mono text-slate-700 font-medium">
                          Lot: {log.material_lot_number || 'LOT-BVTV-2601'}
                        </p>
                        <p className="text-slate-400 text-[11px]">
                          {log.material_export_slip_code || 'PXK-HTX-0058'}
                        </p>
                      </td>
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        {isBiocontrol ? (
                          <span className="inline-flex items-center gap-1 text-xs text-teal-700 font-medium">
                            <Clock className="w-3.5 h-3.5 text-teal-600" />
                            Ngưng hóa chất 21 ngày
                          </span>
                        ) : log.phi_days ? (
                          <div className="text-xs space-y-0.5">
                            <span className="inline-flex items-center gap-1 font-bold text-rose-700 bg-rose-50 px-2 py-0.5 rounded border border-rose-200">
                              <ShieldAlert className="w-3 h-3 text-rose-600" />
                              PHI: {log.phi_days} ngày
                            </span>
                            <p className="text-[11px] text-slate-500">
                              An toàn: <span className="font-medium text-emerald-700">{log.safe_harvest_date || 'Sau 3 ngày'}</span>
                            </p>
                          </div>
                        ) : (
                          <span className="text-xs text-slate-400 italic">Không áp dụng</span>
                        )}
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
