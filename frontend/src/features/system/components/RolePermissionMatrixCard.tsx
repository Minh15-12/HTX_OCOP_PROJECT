import React, { useState, useEffect } from 'react';
import { Key, Save, CheckSquare, Square, Shield } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Role, PermissionGroup } from '@/services/systemService';

interface Props {
  role: Role | null;
  permissionGroups: PermissionGroup[];
  onSavePermissions: (roleId: string, permissions: string[]) => void;
  isSaving: boolean;
}

export const RolePermissionMatrixCard: React.FC<Props> = ({
  role,
  permissionGroups,
  onSavePermissions,
  isSaving,
}) => {
  const [selectedPerms, setSelectedPerms] = useState<Set<string>>(new Set());

  useEffect(() => {
    if (role && role.permissions) {
      setSelectedPerms(new Set(role.permissions));
    } else {
      setSelectedPerms(new Set());
    }
  }, [role]);

  if (!role) {
    return (
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs p-8 text-center flex flex-col items-center justify-center min-h-[300px]">
        <Shield className="w-12 h-12 text-slate-300 mb-3" />
        <h4 className="text-sm font-bold text-slate-700">Chưa chọn vai trò</h4>
        <p className="text-xs text-slate-500 mt-1 max-w-xs">
          Vui lòng chọn một vai trò ở bảng danh sách bên cạnh để cấu hình ma trận phân quyền chi tiết.
        </p>
      </div>
    );
  }

  const togglePermission = (code: string) => {
    const next = new Set(selectedPerms);
    if (next.has(code)) {
      next.delete(code);
    } else {
      next.add(code);
    }
    setSelectedPerms(next);
  };

  const handleSave = () => {
    onSavePermissions(role.id, Array.from(selectedPerms));
  };

  // Matrix categories simulation matching screenshot (Vốn góp, Phân chia lợi nhuận, Báo cáo tài chính...)
  const matrixItems = [
    {
      group: 'Vốn góp',
      items: [
        { label: 'Xem danh sách vốn góp', view: 'MEMBER.READ', add: 'CAPITAL.CREATE', edit: 'CAPITAL.UPDATE', delete: 'CAPITAL.DELETE', approve: 'CAPITAL.APPROVE' },
        { label: 'Thêm giao dịch vốn góp', view: 'MEMBER.READ', add: 'CAPITAL.CREATE', edit: null, delete: null, approve: null },
        { label: 'Sửa giao dịch vốn góp', view: 'MEMBER.READ', add: null, edit: 'CAPITAL.UPDATE', delete: null, approve: null },
        { label: 'Duyệt giao dịch vốn góp', view: 'MEMBER.READ', add: null, edit: null, delete: null, approve: 'CAPITAL.APPROVE' },
      ],
    },
    {
      group: 'Phân chia lợi nhuận',
      items: [
        { label: 'Xem danh sách phân chia', view: 'FINANCE.READ', add: 'FINANCE.TRANSACTION.CREATE', edit: 'FINANCE.UPDATE', delete: null, approve: 'FINANCE.TRANSACTION.APPROVE' },
        { label: 'Thực hiện phân chia', view: 'FINANCE.READ', add: 'FINANCE.TRANSACTION.CREATE', edit: null, delete: null, approve: null },
        { label: 'Duyệt phân chia', view: 'FINANCE.READ', add: null, edit: null, delete: null, approve: 'FINANCE.TRANSACTION.APPROVE' },
      ],
    },
    {
      group: 'Báo cáo tài chính',
      items: [
        { label: 'Xem báo cáo tài chính', view: 'FINANCE.READ', add: null, edit: null, delete: null, approve: null },
        { label: 'Xuất file báo cáo', view: 'FINANCE.READ', add: 'REPORT.EXPORT', edit: null, delete: null, approve: null },
      ],
    },
  ];

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden flex flex-col h-full">
      <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
            <Key className="w-4.5 h-4.5" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-800">
              Chi tiết quyền vai trò: <span className="text-emerald-700">{role.name}</span>
            </h3>
            <p className="text-xs text-slate-500">Phân quyền thao tác chi tiết tài chính, vốn góp, lợi nhuận và báo cáo</p>
          </div>
        </div>

        <Button variant="primary" size="sm" leftIcon={<Save className="w-4 h-4" />} onClick={handleSave} isLoading={isSaving}>
          Lưu phân quyền
        </Button>
      </div>

      <div className="overflow-x-auto flex-1 p-4">
        <table className="w-full text-left text-xs border border-slate-200 rounded-lg overflow-hidden">
          <thead className="bg-slate-100 text-slate-700 font-bold border-b border-slate-200 text-[11px] uppercase">
            <tr>
              <th className="py-2.5 px-4">Chức năng</th>
              <th className="py-2.5 px-3 text-center w-16">Xem</th>
              <th className="py-2.5 px-3 text-center w-16">Thêm</th>
              <th className="py-2.5 px-3 text-center w-16">Sửa</th>
              <th className="py-2.5 px-3 text-center w-16">Xóa</th>
              <th className="py-2.5 px-3 text-center w-16">Duyệt</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200">
            {matrixItems.map((cat, idx) => (
              <React.Fragment key={idx}>
                <tr className="bg-emerald-50/60 font-bold text-emerald-900">
                  <td colSpan={6} className="py-2 px-4 text-xs font-bold uppercase tracking-wider">
                    {cat.group}
                  </td>
                </tr>
                {cat.items.map((item, itemIdx) => (
                  <tr key={itemIdx} className="hover:bg-slate-50 transition-colors">
                    <td className="py-2.5 px-4 font-medium text-slate-700">{item.label}</td>
                    
                    {/* Xem */}
                    <td className="py-2.5 px-3 text-center">
                      <input
                        type="checkbox"
                        className="rounded border-slate-300 text-emerald-600 focus:ring-emerald-500 w-4 h-4 cursor-pointer"
                        checked={item.view ? selectedPerms.has(item.view) : true}
                        onChange={() => item.view && togglePermission(item.view)}
                      />
                    </td>
                    
                    {/* Thêm */}
                    <td className="py-2.5 px-3 text-center">
                      <input
                        type="checkbox"
                        className="rounded border-slate-300 text-emerald-600 focus:ring-emerald-500 w-4 h-4 cursor-pointer"
                        checked={item.add ? selectedPerms.has(item.add) : false}
                        onChange={() => item.add && togglePermission(item.add)}
                      />
                    </td>

                    {/* Sửa */}
                    <td className="py-2.5 px-3 text-center">
                      <input
                        type="checkbox"
                        className="rounded border-slate-300 text-emerald-600 focus:ring-emerald-500 w-4 h-4 cursor-pointer"
                        checked={item.edit ? selectedPerms.has(item.edit) : false}
                        onChange={() => item.edit && togglePermission(item.edit)}
                      />
                    </td>

                    {/* Xóa */}
                    <td className="py-2.5 px-3 text-center">
                      <input
                        type="checkbox"
                        className="rounded border-slate-300 text-emerald-600 focus:ring-emerald-500 w-4 h-4 cursor-pointer"
                        checked={item.delete ? selectedPerms.has(item.delete) : false}
                        onChange={() => item.delete && togglePermission(item.delete)}
                      />
                    </td>

                    {/* Duyệt */}
                    <td className="py-2.5 px-3 text-center">
                      <input
                        type="checkbox"
                        className="rounded border-slate-300 text-emerald-600 focus:ring-emerald-500 w-4 h-4 cursor-pointer"
                        checked={item.approve ? selectedPerms.has(item.approve) : false}
                        onChange={() => item.approve && togglePermission(item.approve)}
                      />
                    </td>
                  </tr>
                ))}
              </React.Fragment>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
