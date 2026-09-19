import React, { useState } from 'react';
import { ShieldCheck, Plus, Search, Edit, MoreVertical, Users, Key } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Role } from '@/services/systemService';

interface Props {
  roles: Role[];
  selectedRoleId: string | null;
  onSelectRole: (roleId: string) => void;
  onAddRole: () => void;
}

export const RoleManagementCard: React.FC<Props> = ({ roles, selectedRoleId, onSelectRole, onAddRole }) => {
  const [searchTerm, setSearchTerm] = useState('');

  const filteredRoles = roles.filter(r => 
    r.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    r.code.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden h-full flex flex-col">
      <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
            <ShieldCheck className="w-4.5 h-4.5" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-800">Quản lý vai trò & Phân quyền</h3>
            <p className="text-xs text-slate-500">Thiết lập quyền truy cập cho từng vai trò trong hệ thống</p>
          </div>
        </div>
        <Button variant="primary" size="sm" leftIcon={<Plus className="w-4 h-4" />} onClick={onAddRole}>
          Thêm vai trò
        </Button>
      </div>

      <div className="p-4 border-b border-slate-100">
        <div className="relative">
          <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
          <input
            type="text"
            placeholder="Tìm kiếm vai trò..."
            className="w-full h-9 pl-9 pr-3 text-xs rounded-lg border border-slate-300 focus:outline-none focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      <div className="overflow-x-auto flex-1">
        <table className="w-full text-left text-xs">
          <thead className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200 uppercase text-[11px]">
            <tr>
              <th className="py-2.5 px-4">Vai trò</th>
              <th className="py-2.5 px-4 text-center">Số người dùng</th>
              <th className="py-2.5 px-4 text-center">Trạng thái</th>
              <th className="py-2.5 px-4 text-right">Thao tác</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {filteredRoles.map((role) => {
              const isSelected = selectedRoleId === role.id;
              return (
                <tr
                  key={role.id}
                  onClick={() => onSelectRole(role.id)}
                  className={`cursor-pointer transition-colors ${
                    isSelected ? 'bg-emerald-50/70 font-medium' : 'hover:bg-slate-50/80'
                  }`}
                >
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-2">
                      <div className={`w-7 h-7 rounded-md flex items-center justify-center ${isSelected ? 'bg-emerald-600 text-white' : 'bg-slate-100 text-slate-600'}`}>
                        <Users className="w-3.5 h-3.5" />
                      </div>
                      <div>
                        <span className="font-semibold text-slate-800 block">{role.name}</span>
                        <span className="text-[11px] text-slate-400 font-mono">{role.code}</span>
                      </div>
                    </div>
                  </td>
                  <td className="py-3 px-4 text-center">
                    <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-slate-100 text-slate-700">
                      {role.user_count ?? 0}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-center">
                    <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-100 text-emerald-800">
                      Hoạt động
                    </span>
                  </td>
                  <td className="py-3 px-4 text-right">
                    <div className="flex items-center justify-end gap-1.5" onClick={(e) => e.stopPropagation()}>
                      <button
                        onClick={() => onSelectRole(role.id)}
                        className={`px-2.5 py-1 text-[11px] font-medium rounded-md transition-colors ${
                          isSelected
                            ? 'bg-emerald-600 text-white'
                            : 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100'
                        }`}
                      >
                        <Key className="w-3 h-3 inline mr-1" />
                        Cài đặt quyền
                      </button>
                      <button className="p-1 text-slate-400 hover:text-slate-600 rounded">
                        <Edit className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};
