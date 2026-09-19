import React from 'react';
import { History, Search, Filter } from 'lucide-react';
import { Button } from '@/components/ui/Button';

export const SystemAuditLogCard: React.FC = () => {
  const auditLogs = [
    { id: '1', time: '10/09/2025 08:32', actor: 'Nguyễn Văn A', action: 'Cập nhật quyền', detail: 'Sửa quyền vai trò Kế toán' },
    { id: '2', time: '09/09/2025 14:21', actor: 'Trần Thị B', action: 'Thêm người dùng', detail: 'Tạo tài khoản nvhtx01' },
    { id: '3', time: '08/09/2025 16:45', actor: 'Lê Văn C', action: 'Đăng nhập', detail: 'Đăng nhập hệ thống' },
    { id: '4', time: '07/09/2025 10:12', actor: 'Phạm Thị D', action: 'Thay đổi cấu hình', detail: 'Cập nhật thông tin đơn vị' },
    { id: '5', time: '05/09/2025 09:30', actor: 'Nguyễn Văn A', action: 'Sao lưu dữ liệu', detail: 'Backup hệ thống' },
  ];

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
      <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
            <History className="w-4.5 h-4.5" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-800">Nhật ký hệ thống</h3>
            <p className="text-xs text-slate-500">Theo dõi mọi hoạt động trong hệ thống</p>
          </div>
        </div>
        <Button variant="secondary" size="sm">
          Xem tất cả
        </Button>
      </div>

      <div className="p-4 border-b border-slate-100 grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div>
          <label className="block text-[11px] font-medium text-slate-500 mb-1">Loại hành động</label>
          <select className="w-full h-8 px-2 text-xs rounded border border-slate-300 bg-white">
            <option>Tất cả hành động</option>
            <option>Đăng nhập</option>
            <option>Cập nhật quyền</option>
            <option>Sao lưu dữ liệu</option>
          </select>
        </div>
        <div>
          <label className="block text-[11px] font-medium text-slate-500 mb-1">Người thực hiện</label>
          <select className="w-full h-8 px-2 text-xs rounded border border-slate-300 bg-white">
            <option>Tất cả người dùng</option>
            <option>Nguyễn Văn A</option>
            <option>Trần Thị B</option>
          </select>
        </div>
        <div>
          <label className="block text-[11px] font-medium text-slate-500 mb-1">Khoảng thời gian</label>
          <input type="text" readOnly value="01/01/2025 - 31/12/2025" className="w-full h-8 px-2 text-xs rounded border border-slate-300 bg-slate-50" />
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs">
          <thead className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200 uppercase text-[11px]">
            <tr>
              <th className="py-2.5 px-4">Thời gian</th>
              <th className="py-2.5 px-4">Người thực hiện</th>
              <th className="py-2.5 px-4">Hành động</th>
              <th className="py-2.5 px-4">Chi tiết</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {auditLogs.map((log) => (
              <tr key={log.id} className="hover:bg-slate-50/80">
                <td className="py-2.5 px-4 font-mono text-slate-500 text-[11px]">{log.time}</td>
                <td className="py-2.5 px-4 font-semibold text-slate-800">{log.actor}</td>
                <td className="py-2.5 px-4">
                  <span className="px-2 py-0.5 rounded text-[11px] font-medium bg-emerald-50 text-emerald-700">
                    {log.action}
                  </span>
                </td>
                <td className="py-2.5 px-4 text-slate-600">{log.detail}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
