import React, { useState } from 'react';
import { History, Search, Download, Filter } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { formatDate } from '@/utils/formatters';

interface AuditLog {
  id: string;
  time: string;
  actor: string;
  action: string;
  target: string;
  detail: string;
  status: 'Thành công' | 'Thất bại' | 'Cảnh báo';
}

const mockLogs: AuditLog[] = [
  { id: '1', time: '2026-09-08T14:32:00Z', actor: 'Nguyễn Văn An (Quản trị viên)', action: 'Cập nhật điểm', target: 'Hồ sơ OCOP: DOS-2026-001', detail: 'Chấm điểm Tiêu chí 1.1 thành 8/10 điểm', status: 'Thành công' },
  { id: '2', time: '2026-09-08T10:15:00Z', actor: 'Trần Thị Bình (Kế toán)', action: 'Tải minh chứng', target: 'Minh chứng: MC-ATVSTP-02', detail: 'Tải lên file Giay_Chung_Nhan_VietGAP.pdf', status: 'Thành công' },
  { id: '3', time: '2026-09-08T09:05:00Z', actor: 'Lê Văn Cường (Trưởng nhóm SX)', action: 'Tạo nhật ký', target: 'Thửa đất: PLOT-TV001-01', detail: 'Ghi nhận phun thuốc BVTV sinh học', status: 'Thành công' },
  { id: '4', time: '2026-09-07T16:20:00Z', actor: 'Hệ thống', action: 'Cảnh báo PHI', target: 'Lô thu hoạch: HAR-002', detail: 'Thu hoạch trước hạn cách ly (thiếu 2 ngày)', status: 'Thất bại' },
  { id: '5', time: '2026-09-07T14:10:00Z', actor: 'Nguyễn Văn An (Quản trị viên)', action: 'Phân quyền', target: 'Vai trò: Kế toán', detail: 'Thêm quyền FINANCE.TRANSACTION.APPROVE', status: 'Cảnh báo' },
];

export const AuditPage: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');

  const filteredLogs = mockLogs.filter(log => 
    log.actor.toLowerCase().includes(searchTerm.toLowerCase()) || 
    log.action.toLowerCase().includes(searchTerm.toLowerCase()) ||
    log.target.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8 animate-in fade-in duration-500">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 bg-slate-800 rounded-3xl p-8 text-white shadow-xl shadow-slate-800/20">
        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-white/10 backdrop-blur-md rounded-2xl">
              <History className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-3xl font-bold tracking-tight">Nhật ký Hệ thống</h1>
          </div>
          <p className="text-slate-300 text-lg max-w-2xl leading-relaxed">
            Truy vết toàn bộ lịch sử chỉnh sửa dữ liệu, duyệt minh chứng và thay đổi phân quyền người dùng (Audit Log).
          </p>
        </div>
        
        <div className="flex gap-4">
          <button className="flex items-center gap-2 px-6 py-3.5 bg-white/10 text-white hover:bg-white/20 rounded-2xl font-bold shadow-sm transition-all">
            <Download className="w-5 h-5" />
            <span>Xuất báo cáo</span>
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
            Bộ lọc
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
                <th className="py-3 px-6">Đối tượng</th>
                <th className="py-3 px-6">Trạng thái</th>
                <th className="py-3 px-6 text-right">Chi tiết</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredLogs.map((log) => (
                <tr key={log.id} className="hover:bg-slate-50 transition-colors">
                  <td className="py-4 px-6 font-mono text-xs text-slate-500">
                    {formatDate(log.time, true)}
                  </td>
                  <td className="py-4 px-6 font-bold text-slate-800">
                    {log.actor}
                  </td>
                  <td className="py-4 px-6">
                    <span className="font-semibold text-slate-700 bg-slate-100 px-2.5 py-1 rounded-md text-xs border border-slate-200">
                      {log.action}
                    </span>
                  </td>
                  <td className="py-4 px-6 font-medium text-slate-700">
                    {log.target}
                  </td>
                  <td className="py-4 px-6">
                    {log.status === 'Thành công' && <span className="text-green-700 bg-green-50 px-2.5 py-1 rounded-full text-xs font-semibold border border-green-200">Thành công</span>}
                    {log.status === 'Thất bại' && <span className="text-red-700 bg-red-50 px-2.5 py-1 rounded-full text-xs font-semibold border border-red-200">Thất bại</span>}
                    {log.status === 'Cảnh báo' && <span className="text-orange-700 bg-orange-50 px-2.5 py-1 rounded-full text-xs font-semibold border border-orange-200">Cảnh báo</span>}
                  </td>
                  <td className="py-4 px-6 text-right text-slate-600 text-xs">
                    {log.detail}
                  </td>
                </tr>
              ))}
              {filteredLogs.length === 0 && (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-slate-500">
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
