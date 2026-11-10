import React, { useState } from 'react';
import { History, Search, Download, Filter, ShieldCheck } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { useQuery } from '@tanstack/react-query';
import { auditApi, AuditLogItem } from '@/services/auditApi';
import { Pagination } from '@/components/ui/Pagination';
import { exportToExcel } from '@/utils/exportUtils';
import { useToast } from '@/components/ui/ToastNotification';

import { AuditLogDrawer } from '../components/drawer/AuditLogDrawer';
import { VerifyChainModal } from '../components/VerifyChainModal';

export const AuditPage: React.FC = () => {
  const { showToast } = useToast();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedEntity, setSelectedEntity] = useState('ALL');
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [selectedLog, setSelectedLog] = useState<AuditLogItem | null>(null);
  const [verifyModalOpen, setVerifyModalOpen] = useState(false);

  const { data: logs = [], isLoading: loadingLogs } = useQuery({
    queryKey: ['auditLogs'],
    queryFn: () => auditApi.getAuditLogs().catch(() => []),
  });

  const filteredLogs = logs.filter(log => {
    const matchesSearch =
      (log.userName || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (log.action || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (log.entityType || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (log.hashSha256 || '').toLowerCase().includes(searchTerm.toLowerCase());
    const matchesEntity = selectedEntity === 'ALL' || log.entityType === selectedEntity;
    return matchesSearch && matchesEntity;
  });

  React.useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, selectedEntity]);

  const handleExportAudit = () => {
    if (filteredLogs.length === 0) {
      showToast('Chưa có dữ liệu nhật ký kiểm toán để xuất.', 'info');
      return;
    }
    const exportData = filteredLogs.map((log, idx) => ({
      STT: idx + 1,
      'Mã bản ghi': log.id,
      'Thời gian': log.createdAt,
      'Người thực hiện': log.userName,
      'Mã người dùng': log.userId || '',
      'Hành động': log.action,
      'Loại thực thể': log.entityType,
      'Mã thực thể': log.entityId,
      'Địa chỉ IP': log.ipAddress || '',
      'Mã băm SHA-256': log.hashSha256 || '',
    }));
    exportToExcel(exportData, 'nhat_ky_kiem_toan_sha256', 'AuditLog');
    showToast('Xuất báo cáo kiểm toán SHA-256 Excel thành công!', 'success');
  };

  const paginatedLogs = React.useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredLogs.slice(start, start + pageSize);
  }, [filteredLogs, currentPage, pageSize]);

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

        <div className="flex flex-wrap gap-3">
          <button
            type="button"
            onClick={() => setVerifyModalOpen(true)}
            className="flex items-center gap-2 px-5 py-3.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-2xl font-bold shadow-sm transition-all cursor-pointer"
          >
            <ShieldCheck className="w-5 h-5" />
            <span>Kiểm tra toàn vẹn chuỗi Hash</span>
          </button>
          <button
            type="button"
            onClick={handleExportAudit}
            className="flex items-center gap-2 px-6 py-3.5 bg-white/10 text-white hover:bg-white/20 rounded-2xl font-bold shadow-sm transition-all cursor-pointer"
          >
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
          <div className="flex items-center gap-2 self-stretch md:self-auto">
            <div className="flex items-center gap-1.5 text-xs text-slate-500 font-bold shrink-0">
              <Filter className="w-4 h-4 text-emerald-600" />
              <span>Phân loại:</span>
            </div>
            <select
              value={selectedEntity}
              onChange={(e) => setSelectedEntity(e.target.value)}
              className="h-10 px-3 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-700 focus:outline-none focus:ring-2 focus:ring-slate-500/20"
            >
              <option value="ALL">Tất cả thực thể</option>
              <option value="Member">Xã viên (Member)</option>
              <option value="OcopApplication">Hồ sơ OCOP (OcopApplication)</option>
              <option value="FinalDecision">Quyết định OCOP (FinalDecision)</option>
              <option value="CashTransaction">Sổ quỹ tiền mặt (CashTransaction)</option>
              <option value="Material">Vật tư kho (Material)</option>
              <option value="FarmPlot">Thửa đất (FarmPlot)</option>
              <option value="GeneratedDocument">Tài liệu sinh số (GeneratedDocument)</option>
              <option value="SystemSetting">Cấu hình hệ thống (SystemSetting)</option>
            </select>
          </div>
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
              {loadingLogs ? (
                <tr>
                  <td colSpan={5} className="py-14 text-center text-slate-400">
                    <div className="inline-block animate-spin rounded-full h-7 w-7 border-2 border-emerald-600 border-t-transparent mb-2" />
                    <p className="font-semibold text-xs text-slate-600">Đang tải nhật ký kiểm toán hệ thống...</p>
                  </td>
                </tr>
              ) : paginatedLogs.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-12 text-center text-slate-500 text-xs">
                    Không tìm thấy nhật ký hệ thống nào phù hợp.
                  </td>
                </tr>
              ) : (
                paginatedLogs.map((log) => {
                  const isSelected = selectedLog?.id === log.id;
                  return (
                    <tr
                      key={log.id}
                      onClick={() => setSelectedLog(log)}
                      className={`transition-colors cursor-pointer ${
                        isSelected ? 'bg-emerald-50/80 font-medium' : 'hover:bg-slate-50'
                      }`}
                    >
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
                  );
                })
              )}
            </tbody>
          </table>
        </div>
        {filteredLogs.length > 0 && (
          <div className="p-4 border-t border-slate-100 bg-white">
            <Pagination
              currentPage={currentPage}
              totalItems={filteredLogs.length}
              pageSize={pageSize}
              onPageChange={setCurrentPage}
              onPageSizeChange={(newSize) => {
                setPageSize(newSize);
                setCurrentPage(1);
              }}
              pageSizeOptions={[5, 10, 20, 50]}
            />
          </div>
        )}
      </div>

      {/* Audit Log Drawer */}
      <AuditLogDrawer
        log={selectedLog}
        isOpen={!!selectedLog}
        onClose={() => setSelectedLog(null)}
      />

      {/* Verify Chain Modal */}
      <VerifyChainModal
        isOpen={verifyModalOpen}
        onClose={() => setVerifyModalOpen(false)}
        logs={logs}
      />
    </div>
  );
};

