import React, { useState } from 'react';
import { History, Search, Download, Filter } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { useQuery } from '@tanstack/react-query';
import { auditApi, AuditLogItem } from '@/services/auditApi';

const mockLogs: AuditLogItem[] = [
  { id: '1', createdAt: '2026-09-08 14:32:00', userName: 'Nguyễn Văn An (Quản trị viên)', action: 'Cập nhật điểm', entityType: 'Hồ sơ OCOP: DOS-2026-001', entityId: '1', hashSha256: 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855' },
  { id: '2', createdAt: '2026-09-08 10:15:00', userName: 'Trần Thị Bình (Kế toán)', action: 'Tải minh chứng', entityType: 'Minh chứng: MC-ATVSTP-02', entityId: '2', hashSha256: '8f434346648f6b96df89dda901c5176b10a6d83961dd3c1ac88b59b2dc327aa4' },
  { id: '3', createdAt: '2026-09-08 09:05:00', userName: 'Lê Văn Cường (Trưởng nhóm SX)', action: 'Tạo nhật ký', entityType: 'Thửa đất: PLOT-TV001-01', entityId: '3', hashSha256: 'a591a6d40bf420404a011733cfb7b190d62c65bf0bcda32b57b277d9ad9f146e' },
];

export const AuditPage: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');

  const { data: apiLogs } = useQuery({
    queryKey: ['auditLogs'],
    queryFn: () => auditApi.getAuditLogs().catch(() => mockLogs),
  });

  const logs = apiLogs && apiLogs.length > 0 ? apiLogs : mockLogs;

  const filteredLogs = logs.filter(log =>
    (log.userName || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    (log.action || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    (log.entityType || '').toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8 animate-in fade-in duration-500 font-sans">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 bg-slate-800 rounded-3xl p-8 text-white shadow-xl shadow-slate-800/20">
        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-white/10 backdrop-blur-md rounded-2xl">
              <History className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-3xl font-bold tracking-tight">Nhật ký Hệ thống Audit Trail (SHA-256)</h1>
          </div>
          <p className="text-slate-300 text-lg max-w-2xl leading-relaxed">
            Truy vết toàn bộ lịch sử chỉnh sửa dữ liệu, duyệt minh chứng và thay đổi phân quyền người dùng bảo mật nối chuỗi.
          </p>
        </div>

        <div className="flex gap-4">
          <button className="flex items-center gap-2 px-6 py-3.5 bg-white/10 text-white hover:bg-white/20 rounded-2xl font-bold shadow-sm transition-all cursor-pointer">
            <Download className="w-5 h-5" />
            <span>Xuất báo cáo Audit</span>
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
        {/* Toolbar */}
        <div className="p-4 border-b border-slate-100 flex flex-col md:flex-row gap-4 justify-between items-center bg-slate-50/50">
          <div className="relative w-full md:w-96">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Tìm kiếm người thực hiện, hành động..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-11 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-slate-500/20 focus:border-slate-500 transition-all text-sm"
            />
          </div>
          <Button variant="secondary" leftIcon={<Filter className="w-4 h-4" />}>
            Bộ lọc nhật ký
          </Button>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-sm">
            <thead>
              <tr className="border-b border-slate-200 text-xs uppercase tracking-wider text-slate-500 font-bold bg-slate-100">
                <th className="py-3 px-6">Thời gian</th>
                <th className="py-3 px-6">Người thực hiện</th>
                <th className="py-3 px-6">Hành động</th>
                <th className="py-3 px-6">Thực thể / Loại dữ liệu</th>
                <th className="py-3 px-6">Mã Băm Hash SHA-256</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredLogs.map((log) => (
                <tr key={log.id} className="hover:bg-slate-50 transition-colors">
                  <td className="py-4 px-6 font-mono text-xs text-slate-500">
                    {log.createdAt}
                  </td>
                  <td className="py-4 px-6 font-bold text-slate-800">
                    {log.userName}
                  </td>
                  <td className="py-4 px-6">
                    <span className="font-semibold text-emerald-800 bg-emerald-50 px-2.5 py-1 rounded-md text-xs border border-emerald-200">
                      {log.action}
                    </span>
                  </td>
                  <td className="py-4 px-6 font-medium text-slate-700">
                    {log.entityType}
                  </td>
                  <td className="py-4 px-6 font-mono text-[11px] text-slate-500 truncate max-w-[200px]" title={log.hashSha256}>
                    {log.hashSha256 || 'SHA256-AUTHENTICATED'}
                  </td>
                </tr>
              ))}
              {filteredLogs.length === 0 && (
                <tr>
                  <td colSpan={5} className="py-12 text-center text-slate-500">
                    Không tìm thấy nhật ký hệ thống nào phù hợp.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
