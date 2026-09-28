import React from 'react';
import { Member, MEMBER_TYPE_LABELS } from '@/types/memberTypes';
import { Edit2, Eye, UserCheck, UserX, Info } from 'lucide-react';
import { formatDate } from '@/utils/formatters';

interface MemberTableProps {
  members: Member[];
  onView: (m: Member) => void;
  onEdit: (m: Member) => void;
  onApprove: (m: Member) => void;
  onSuspend: (m: Member) => void;
}

export const MemberTable: React.FC<MemberTableProps> = ({
  members,
  onView,
  onEdit,
  onApprove,
  onSuspend,
}) => {
  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'ACTIVE':
        return <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-xs font-semibold border border-green-200">Đang hoạt động</span>;
      case 'PENDING':
        return <span className="px-3 py-1 bg-yellow-100 text-yellow-700 rounded-full text-xs font-semibold border border-yellow-200">Chờ duyệt</span>;
      case 'INACTIVE':
        return <span className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-xs font-semibold border border-gray-200">Đã ngưng</span>;
      case 'REJECTED':
        return <span className="px-3 py-1 bg-red-100 text-red-700 rounded-full text-xs font-semibold border border-red-200">Từ chối</span>;
      default:
        return <span className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-xs font-semibold border border-gray-200">{status}</span>;
    }
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 text-sm">
              <th className="px-6 py-4 font-semibold">Mã XV / Họ tên</th>
              <th className="px-6 py-4 font-semibold">Liên hệ</th>
              <th className="px-6 py-4 font-semibold">Vai trò</th>
              <th className="px-6 py-4 font-semibold">Trạng thái</th>
              <th className="px-6 py-4 font-semibold text-right">Hành động</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {members.map((m) => (
              <tr key={m.id} className="hover:bg-slate-50 transition-colors">
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center font-bold">
                      {m.full_name.charAt(0)}
                    </div>
                    <div>
                      <div className="font-semibold text-slate-800 text-base">{m.full_name}</div>
                      <div className="text-slate-500 text-sm">{m.member_code}</div>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <div className="text-sm text-slate-700">{m.phone}</div>
                  <div className="text-xs text-slate-500 truncate max-w-[150px]" title={m.address}>{m.ward}, {m.district}</div>
                </td>
                <td className="px-6 py-4">
                  <div className="text-sm font-medium text-slate-700">
                    {MEMBER_TYPE_LABELS[m.member_type] || m.member_type}
                  </div>
                  <div className="text-xs text-slate-500 mt-1">
                    Gia nhập: {formatDate(m.join_date)}
                  </div>
                </td>
                <td className="px-6 py-4">
                  {getStatusBadge(m.status)}
                </td>
                <td className="px-6 py-4">
                  <div className="flex justify-end gap-2">
                    <button 
                      onClick={() => onView(m)}
                      className="p-2 text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors"
                      title="Xem chi tiết"
                    >
                      <Eye className="w-4 h-4" />
                    </button>
                    <button 
                      onClick={() => onEdit(m)}
                      className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                      title="Chỉnh sửa hồ sơ"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    {m.status === 'PENDING' && (
                      <button 
                        onClick={() => onApprove(m)}
                        className="p-2 text-slate-400 hover:text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                        title="Duyệt kết nạp"
                      >
                        <UserCheck className="w-4 h-4" />
                      </button>
                    )}
                    {m.status === 'ACTIVE' && (
                      <button 
                        onClick={() => onSuspend(m)}
                        className="p-2 text-slate-400 hover:text-orange-600 hover:bg-orange-50 rounded-lg transition-colors"
                        title="Đình chỉ / Chấm dứt"
                      >
                        <UserX className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
            {members.length === 0 && (
              <tr>
                <td colSpan={5} className="px-6 py-12 text-center text-slate-500">
                  <Info className="w-8 h-8 text-slate-300 mx-auto mb-3" />
                  <p>Không có dữ liệu xã viên nào.</p>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};
