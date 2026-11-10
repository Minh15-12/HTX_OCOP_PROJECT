import React, { useState } from 'react';
import { Users, Plus, Search, Edit, Lock, Unlock, UserCheck, ShieldAlert } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { UserItem } from '@/services/systemService';
import { Pagination } from '@/components/ui/Pagination';

interface Props {
  users: UserItem[];
  onAddUser: () => void;
  onEditUser: (user: UserItem) => void;
  onToggleStatus: (userId: string) => void;
}

export const UserManagementCard: React.FC<Props> = ({ users, onAddUser, onEditUser, onToggleStatus }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  const filtered = users.filter(u =>
    u.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
    u.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    u.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  React.useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm]);

  const paginatedUsers = React.useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filtered.slice(start, start + pageSize);
  }, [filtered, currentPage, pageSize]);

  const getRoleBadge = (roles: any) => {
    if (!roles || roles.length === 0) {
      return <span className="px-2 py-0.5 rounded text-[11px] font-medium bg-slate-100 text-slate-600">Thành viên</span>;
    }
    const r = typeof roles[0] === 'string' ? roles[0] : roles[0].name || roles[0].code;
    if (r.includes('ADMIN') || r.includes('OWNER') || r.includes('Quản trị')) {
      return <span className="px-2 py-0.5 rounded text-[11px] font-medium bg-purple-100 text-purple-800">🔑 {r}</span>;
    }
    if (r.includes('Kế toán') || r.includes('STAFF')) {
      return <span className="px-2 py-0.5 rounded text-[11px] font-medium bg-blue-100 text-blue-800">👤 {r}</span>;
    }
    return <span className="px-2 py-0.5 rounded text-[11px] font-medium bg-emerald-100 text-emerald-800">🌱 {r}</span>;
  };

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
      <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
            <Users className="w-4.5 h-4.5" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-800">Quản lý người dùng</h3>
            <p className="text-xs text-slate-500">Danh sách người dùng đang hoạt động trong hệ thống</p>
          </div>
        </div>
        <Button variant="primary" size="sm" leftIcon={<Plus className="w-4 h-4" />} onClick={onAddUser}>
          Thêm người dùng
        </Button>
      </div>

      <div className="p-4 border-b border-slate-100 flex items-center justify-between gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
          <input
            type="text"
            placeholder="Tìm kiếm theo tên, email, số điện thoại..."
            className="w-full h-9 pl-9 pr-3 text-xs rounded-lg border border-slate-300 focus:outline-none focus:ring-1 focus:ring-emerald-500"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <span className="text-xs text-slate-500">
          Hiển thị {filtered.length > 0 ? (currentPage - 1) * pageSize + 1 : 0} - {Math.min(currentPage * pageSize, filtered.length)} trong tổng số {filtered.length} người dùng
        </span>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs">
          <thead className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200 uppercase text-[11px]">
            <tr>
              <th className="py-3 px-4 w-12 text-center">STT</th>
              <th className="py-3 px-4">Tên đăng nhập</th>
              <th className="py-3 px-4">Họ tên</th>
              <th className="py-3 px-4">Vai trò</th>
              <th className="py-3 px-4 text-center">Trạng thái</th>
              <th className="py-3 px-4 text-right">Thao tác</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {paginatedUsers.map((u, idx) => (
              <tr key={u.id} className="hover:bg-slate-50/80 transition-colors">
                <td className="py-3 px-4 text-center font-mono text-slate-500">
                  {(currentPage - 1) * pageSize + idx + 1}
                </td>
                <td className="py-3 px-4 font-mono font-semibold text-slate-800">{u.username}</td>
                <td className="py-3 px-4 font-medium text-slate-800">
                  <div>{u.full_name}</div>
                  <div className="text-[11px] text-slate-400">{u.email}</div>
                </td>
                <td className="py-3 px-4">{getRoleBadge(u.roles)}</td>
                <td className="py-3 px-4 text-center">
                  {u.status === 'ACTIVE' ? (
                    <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-100 text-emerald-800">
                      Hoạt động
                    </span>
                  ) : (
                    <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-semibold bg-red-100 text-red-800">
                      Đã khóa
                    </span>
                  )}
                </td>
                <td className="py-3 px-4 text-right">
                  <div className="flex items-center justify-end gap-2">
                    <button
                      onClick={() => onEditUser(u)}
                      className="p-1 text-slate-500 hover:text-slate-700 hover:bg-slate-100 rounded"
                      title="Chỉnh sửa"
                    >
                      <Edit className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => onToggleStatus(u.id)}
                      className={`p-1 rounded ${
                        u.status === 'ACTIVE'
                          ? 'text-amber-600 hover:bg-amber-50'
                          : 'text-emerald-600 hover:bg-emerald-50'
                      }`}
                      title={u.status === 'ACTIVE' ? 'Khóa tài khoản' : 'Mở khóa tài khoản'}
                    >
                      {u.status === 'ACTIVE' ? <Lock className="w-3.5 h-3.5" /> : <Unlock className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                </td>
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr>
                <td colSpan={6} className="py-8 text-center text-slate-400">
                  Không tìm thấy người dùng phù hợp.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      {filtered.length > 0 && (
        <div className="p-3 border-t border-slate-100 bg-white">
          <Pagination
            currentPage={currentPage}
            totalItems={filtered.length}
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
