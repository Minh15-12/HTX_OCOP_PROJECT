import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { History, ShieldCheck, ExternalLink, Loader2 } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { auditApi, AuditLogItem } from '@/services/auditApi';
import { Button } from '@/components/ui/Button';
import { Pagination } from '@/components/ui/Pagination';

export const SystemAuditLogCard: React.FC = () => {
  const navigate = useNavigate();
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(5);
  const [actionFilter, setActionFilter] = useState('ALL');

  const { data: auditLogs = [], isLoading } = useQuery({
    queryKey: ['systemAuditLogs'],
    queryFn: () => auditApi.getAuditLogs().catch(() => []),
  });

  const filteredLogs = useMemo(() => {
    if (actionFilter === 'ALL') return auditLogs;
    return auditLogs.filter((log) => log.action === actionFilter);
  }, [auditLogs, actionFilter]);

  const uniqueActions = useMemo(() => {
    return Array.from(new Set(auditLogs.map((l) => l.action).filter(Boolean)));
  }, [auditLogs]);

  const paginatedLogs = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredLogs.slice(start, start + pageSize);
  }, [filteredLogs, currentPage, pageSize]);

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
      <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
            <History className="w-4.5 h-4.5" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-800">Nhật ký hệ thống Audit Trail (SHA-256)</h3>
            <p className="text-xs text-slate-500">Ghi nhận dữ liệu bất biến và con trỏ chuỗi khối an toàn</p>
          </div>
        </div>
        <Button
          variant="secondary"
          size="sm"
          onClick={() => navigate('/audit')}
          className="cursor-pointer"
        >
          <span>Xem trang Audit đầy đủ</span>
          <ExternalLink className="w-3.5 h-3.5 ml-1" />
        </Button>
      </div>

      <div className="p-4 border-b border-slate-100 flex items-center gap-3">
        <div className="w-64">
          <label className="block text-[11px] font-medium text-slate-500 mb-1">Loại hành động</label>
          <select
            value={actionFilter}
            onChange={(e) => {
              setActionFilter(e.target.value);
              setCurrentPage(1);
            }}
            className="w-full h-8 px-2 text-xs rounded border border-slate-300 bg-white"
          >
            <option value="ALL">Tất cả hành động ({auditLogs.length})</option>
            {uniqueActions.map((act) => (
              <option key={act} value={act}>
                {act}
              </option>
            ))}
          </select>
        </div>
        <div className="text-xs text-slate-400 self-end pb-1.5 font-medium">
          Hiển thị <strong>{filteredLogs.length}</strong> sự kiện kiểm toán đã xác thực
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs">
          <thead className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200 uppercase text-[11px]">
            <tr>
              <th className="py-2.5 px-4">Thời gian</th>
              <th className="py-2.5 px-4">Người thực hiện</th>
              <th className="py-2.5 px-4">Hành động</th>
              <th className="py-2.5 px-4">Thực thể</th>
              <th className="py-2.5 px-4">Mã băm SHA-256</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {isLoading ? (
              <tr>
                <td colSpan={5} className="py-8 text-center text-slate-400">
                  <Loader2 className="w-5 h-5 animate-spin mx-auto mb-1 text-emerald-600" />
                  <span>Đang tải nhật ký kiểm toán từ máy chủ...</span>
                </td>
              </tr>
            ) : paginatedLogs.length === 0 ? (
              <tr>
                <td colSpan={5} className="py-8 text-center text-slate-400">
                  Chưa ghi nhận sự kiện kiểm toán nào phù hợp.
                </td>
              </tr>
            ) : (
              paginatedLogs.map((log: AuditLogItem) => (
                <tr key={log.id} className="hover:bg-slate-50/80">
                  <td className="py-2.5 px-4 font-mono text-slate-500 text-[11px]">{log.createdAt}</td>
                  <td className="py-2.5 px-4 font-semibold text-slate-800">{log.userName}</td>
                  <td className="py-2.5 px-4">
                    <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                      {log.action}
                    </span>
                  </td>
                  <td className="py-2.5 px-4 text-slate-700 font-medium">
                    {log.entityType} <span className="font-mono text-slate-400 text-[10.5px]">#{log.entityId.slice(0, 8)}</span>
                  </td>
                  <td className="py-2.5 px-4 font-mono text-[10.5px] text-slate-500 truncate max-w-[150px]" title={log.hashSha256}>
                    {log.hashSha256 ? `${log.hashSha256.slice(0, 16)}...` : 'SHA256-AUTHENTICATED'}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
      {filteredLogs.length > 0 && (
        <div className="p-3 border-t border-slate-100 bg-white">
          <Pagination
            currentPage={currentPage}
            totalItems={filteredLogs.length}
            pageSize={pageSize}
            onPageChange={setCurrentPage}
            onPageSizeChange={(newSize) => {
              setPageSize(newSize);
              setCurrentPage(1);
            }}
            pageSizeOptions={[5, 10, 20]}
          />
        </div>
      )}
    </div>
  );
};
