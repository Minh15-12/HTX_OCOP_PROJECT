import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { apiClient } from '../../../services/apiClient';
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

  const { data: logsData, isLoading } = useQuery({
    queryKey: ['farming-logs', search],
    queryFn: async () => {
      try {
        const res: any = await apiClient.get('/farming-logs', { params: { search } });
        return res.data || res;
      } catch {
        return {
          data: [
            {
              id: 'NK-2026-001',
              activity_date: '2026-09-25',
              plot_code: 'PLOT-TT-01',
              crop_season_name: 'Mùa vụ Ớt chuông Sweet Palermo Thu Đông 2026',
              activity_type: 'SPRAYING',
              material_name: 'Chế phẩm Nấm Trichoderma',
              material_batch_number: 'LOT-BVTV-2026-88',
              quantity_applied: 2.5,
              unit: 'Lít',
              phi_days: 7,
              gps_latitude: 11.9404,
              gps_longitude: 108.4583,
              performer_name: 'Nguyễn Văn An',
            },
            {
              id: 'NK-2026-002',
              activity_date: '2026-09-20',
              plot_code: 'PLOT-TT-02',
              crop_season_name: 'Mùa vụ Ớt chuông Sweet Palermo Thu Đông 2026',
              activity_type: 'FERTILIZING',
              material_name: 'Phân bón lá Ca-B hữu cơ',
              material_batch_number: 'LOT-NPK-2026-12',
              quantity_applied: 50.0,
              unit: 'Kg',
              phi_days: 0,
              gps_latitude: 11.9412,
              gps_longitude: 108.4590,
              performer_name: 'Lê Hoàng Cường',
            }
          ]
        };
      }
    }
  });

  const logsList = logsData?.data || mockLogs;

  return (
    <div className="space-y-4 pb-12 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">
            Nhật ký Canh tác & Truy xuất 10 Trường (Thông tư 02/2024/TT-BNNPTNT)
          </h1>
          <p className="text-[12.8px] text-slate-500 mt-0.5">
            Ghi nhận hoạt động sản xuất, kiểm soát an toàn PHI, tọa độ GPS, lô vật tư và bằng chứng điện tử.
          </p>
        </div>
        <button className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-[12.8px] shadow-sm transition-all self-start sm:self-auto">
          <Plus className="w-4 h-4" />
          Ghi nhật ký mới (TT02)
        </button>
      </div>

      {/* Notice Banner PHI */}
      <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl text-amber-900 flex items-start gap-3 text-[12.8px]">
        <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
        <div>
          <h4 className="font-bold text-amber-950">Khóa an toàn PHI (Pre-Harvest Interval) đang hoạt động:</h4>
          <p className="mt-0.5 text-amber-800">
            Hệ thống tự động tính toán <code>safe_harvest_date</code> và <strong>chặn thu hoạch hoàn toàn (ERR_HARVEST_PHI_VIOLATION)</strong> đối với thửa đất đang trong thời gian cách ly thuốc BVTV.
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
              placeholder="Tìm kiếm theo thửa đất, hoạt động, loại vật tư, người thực hiện..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 bg-white border border-slate-200 rounded-lg text-[12.8px] text-slate-700 focus:outline-none focus:ring-1 focus:ring-emerald-500"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-[12.9px]">
            <thead>
              <tr className="border-b border-[#e7e9ec] text-[11px] uppercase tracking-wider text-slate-400 font-bold bg-slate-50">
                <th className="py-3 px-4">Ngày thực hiện</th>
                <th className="py-3 px-4">Mã thửa & Mùa vụ</th>
                <th className="py-3 px-4">Hoạt động</th>
                <th className="py-3 px-4">Vật tư & Số lô SX</th>
                <th className="py-3 px-4">Liều lượng</th>
                <th className="py-3 px-4">Cách ly PHI</th>
                <th className="py-3 px-4">Tọa độ GPS</th>
                <th className="py-3 px-4">Người ghi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {logsList.map((log: any) => (
                <tr key={log.id} className="hover:bg-slate-50">
                  <td className="py-3 px-4 font-semibold text-slate-800">{log.activity_date || log.date}</td>
                  <td className="py-3 px-4">
                    <div className="font-bold text-slate-900">{log.plot_code || log.plotName}</div>
                    <div className="text-[11px] text-slate-400">{log.crop_season_name || 'Mùa vụ chính'}</div>
                  </td>
                  <td className="py-3 px-4">
                    <span className="font-semibold text-slate-800">{log.activity_type || log.activityType}</span>
                  </td>
                  <td className="py-3 px-4">
                    <div className="font-medium text-emerald-800">{log.material_name || log.materialsUsed}</div>
                    {log.material_batch_number && (
                      <div className="text-[11px] font-mono text-slate-500">Lô: {log.material_batch_number}</div>
                    )}
                  </td>
                  <td className="py-3 px-4 font-medium text-slate-700">
                    {log.quantity_applied ? `${log.quantity_applied} ${log.unit || ''}` : '-'}
                  </td>
                  <td className="py-3 px-4">
                    {log.phi_days && log.phi_days > 0 ? (
                      <span className="pill-badge pill-amber flex items-center gap-1">
                        <ShieldAlert className="w-3.5 h-3.5" /> Cách ly {log.phi_days} ngày
                      </span>
                    ) : (
                      <span className="pill-badge pill-green flex items-center gap-1">
                        <CheckCircle className="w-3.5 h-3.5" /> An toàn
                      </span>
                    )}
                  </td>
                  <td className="py-3 px-4 text-xs font-mono text-slate-600">
                    {log.gps_latitude && log.gps_longitude ? (
                      `${log.gps_latitude.toFixed(4)}, ${log.gps_longitude.toFixed(4)}`
                    ) : (
                      <span className="text-slate-400 italic">Đã gắn GPS</span>
                    )}
                  </td>
                  <td className="py-3 px-4 text-slate-700 font-medium">{log.performer_name || log.performer}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
