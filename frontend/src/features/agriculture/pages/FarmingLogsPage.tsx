import React, { useState } from 'react';
import { BookOpen, Plus, Search, ShieldAlert, CheckCircle, Calendar, AlertTriangle } from 'lucide-react';

interface FarmingLog {
  id: string;
  date: string;
  plotName: string;
  activityType: string;
  materialsUsed: string;
  phiDays: number; // Safety quarantine days
  status: 'SAFE' | 'QUARANTINE_ACTIVE';
  performer: string;
}

const mockLogs: FarmingLog[] = [
  {
    id: 'NK-2026-001',
    date: '05/09/2026',
    plotName: 'Vùng trồng Trà Oolong Cầu Đất #1',
    activityType: 'Phun chế phẩm sinh học trị sâu cuốn lá',
    materialsUsed: 'Chế phẩm Sinh học Bio-Tricho (500 ml)',
    phiDays: 3,
    status: 'QUARANTINE_ACTIVE',
    performer: 'Nguyễn Văn An',
  },
  {
    id: 'NK-2026-002',
    date: '02/09/2026',
    plotName: 'Vùng trồng Dâu Tây Đà Lạt VietGAP',
    activityType: 'Bón phân hữu cơ sinh học đợt 2',
    materialsUsed: 'Phân hữu cơ Quế Lâm (200 kg)',
    phiDays: 0,
    status: 'SAFE',
    performer: 'Lê Hoàng Cường',
  },
  {
    id: 'NK-2026-003',
    date: '28/08/2026',
    plotName: 'Vùng trồng Cà phê Arabica Cầu Đất',
    activityType: 'Tỉa cành tạo tán sau thu hoạch',
    materialsUsed: 'Không dùng vật tư hoá chất',
    phiDays: 0,
    status: 'SAFE',
    performer: 'Trần Thị Bình',
  },
];

export const FarmingLogsPage: React.FC = () => {
  const [search, setSearch] = useState('');

  return (
    <div className="space-y-4 pb-12 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">
            Nhật ký Canh tác & Quản lý Thời gian Cấm thu hoạch (PHI)
          </h1>
          <p className="text-[12.8px] text-slate-500 mt-0.5">
            Ghi nhận hoạt động tưới tiêu, bón phân, phun thuốc và cảnh báo tự động thời gian cách ly an toàn thực phẩm.
          </p>
        </div>
        <button className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-[12.8px] shadow-sm transition-all self-start sm:self-auto">
          <Plus className="w-4 h-4" />
          Ghi nhật ký mới
        </button>
      </div>

      {/* Notice Banner PHI */}
      <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl text-amber-900 flex items-start gap-3 text-[12.8px]">
        <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
        <div>
          <h4 className="font-bold text-amber-950">Lưu ý quan trọng về thời gian cách ly (PHI):</h4>
          <p className="mt-0.5 text-amber-800">
            Có <strong>1 lô vùng trồng (Vùng trồng Trà Oolong Cầu Đất #1)</strong> đang trong thời gian cấm thu hoạch PHI (còn 2 ngày). Nghiêm cấm thu hoạch trước ngày 08/09/2026.
          </p>
        </div>
      </div>

      {/* Main Table */}
      <div className="bg-white border border-[#e7e9ec] rounded-xl shadow-subtle overflow-hidden">
        <div className="p-3.5 border-b border-[#e7e9ec] bg-slate-50/50 flex flex-wrap items-center justify-between gap-3">
          <div className="relative flex-1 min-w-[240px]">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Tìm kiếm theo vùng trồng, hoạt động, người thực hiện..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 bg-white border border-slate-200 rounded-lg text-[12.8px] text-slate-700 focus:outline-none focus:ring-1 focus:ring-emerald-500"
            />
          </div>
        </div>

        <table className="w-full text-left border-collapse text-[12.9px]">
          <thead>
            <tr className="border-b border-[#e7e9ec] text-[11px] uppercase tracking-wider text-slate-400 font-bold bg-slate-50">
              <th className="py-3 px-4">Mã nhật ký</th>
              <th className="py-3 px-4">Ngày ghi</th>
              <th className="py-3 px-4">Vùng trồng</th>
              <th className="py-3 px-4">Hoạt động canh tác</th>
              <th className="py-3 px-4">Vật tư sử dụng</th>
              <th className="py-3 px-4">Cách ly PHI</th>
              <th className="py-3 px-4">Người ghi</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {mockLogs.map((log) => (
              <tr key={log.id} className="hover:bg-slate-50">
                <td className="py-3 px-4 font-mono font-bold text-slate-600 text-[12px]">{log.id}</td>
                <td className="py-3 px-4 font-semibold text-slate-800">{log.date}</td>
                <td className="py-3 px-4 font-bold text-slate-900">{log.plotName}</td>
                <td className="py-3 px-4 text-slate-800">{log.activityType}</td>
                <td className="py-3 px-4 font-medium text-emerald-800">{log.materialsUsed}</td>
                <td className="py-3 px-4">
                  {log.status === 'QUARANTINE_ACTIVE' ? (
                    <span className="pill-badge pill-amber flex items-center gap-1">
                      <ShieldAlert className="w-3.5 h-3.5" /> Đang cách ly ({log.phiDays} ngày)
                    </span>
                  ) : (
                    <span className="pill-badge pill-green flex items-center gap-1">
                      <CheckCircle className="w-3.5 h-3.5" /> An toàn thu hoạch
                    </span>
                  )}
                </td>
                <td className="py-3 px-4 text-slate-700 font-medium">{log.performer}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
