import React from 'react';
import {
  Search,
  Eye,
  Pencil,
  Printer,
  UserCheck,
  UserX,
  AlertCircle,
  AlertTriangle,
  Users,
} from 'lucide-react';
import { Member } from '@/types/memberTypes';
import { Pagination } from '@/components/ui/Pagination';
import { formatDate } from '@/utils/formatters';

interface MembersTableProps {
  members: Member[];
  selectedMember: Member | null;
  onSelectMember: (m: Member) => void;
  onOpenEdit: (m: Member) => void;
  onOpenApprove: (m: Member) => void;
  onOpenReject: (m: Member) => void;
  onSuspendMember: (m: Member) => void;
  onReactivateMember: (m: Member) => void;
  onTransitionStatus: (id: string, targetStatus: string, reason?: string) => void;
  onOpenTerminationCheck: (m: Member) => void;
  onPrintMember?: (m: Member) => void;
  search: string;
  setSearch: (s: string) => void;
  statusFilter: string;
  setStatusFilter: (s: string) => void;
  typeFilter: string;
  setTypeFilter: (s: string) => void;
  currentPage: number;
  setCurrentPage: (p: number) => void;
  pageSize?: number;
}

export const MembersTable: React.FC<MembersTableProps> = ({
  members,
  selectedMember,
  onSelectMember,
  onOpenEdit,
  onOpenApprove,
  onOpenReject,
  onSuspendMember,
  onReactivateMember,
  onTransitionStatus,
  onOpenTerminationCheck,
  onPrintMember,
  search,
  setSearch,
  statusFilter,
  setStatusFilter,
  typeFilter,
  setTypeFilter,
  currentPage,
  setCurrentPage,
  pageSize = 6,
}) => {
  // Filter logic
  const filteredMembers = members.filter((m) => {
    const matchesSearch =
      m.full_name.toLowerCase().includes(search.toLowerCase()) ||
      m.member_code.toLowerCase().includes(search.toLowerCase()) ||
      (m.cccd && m.cccd.includes(search));

    const matchesType = typeFilter === 'ALL' || m.member_type === typeFilter;
    const isOverdue =
      m.capital_status === 'CHUA_DU' &&
      m.join_date &&
      new Date().getTime() - new Date(m.join_date).getTime() > 180 * 24 * 60 * 60 * 1000;

    const matchesStatus =
      statusFilter === 'ALL'
        ? true
        : statusFilter === 'OVERDUE_CAPITAL'
        ? isOverdue
        : statusFilter === 'INACTIVE'
        ? m.status === 'INACTIVE' || m.status === 'TERMINATED'
        : m.status === statusFilter;

    return matchesSearch && matchesType && matchesStatus;
  });

  const totalPages = Math.ceil(filteredMembers.length / pageSize) || 1;
  const safeCurrentPage = Math.min(currentPage, totalPages);
  const startIndex = (safeCurrentPage - 1) * pageSize;
  const paginatedMembers = filteredMembers.slice(startIndex, startIndex + pageSize);

  return (
    <div
      className="w-full bg-white border border-[#e7e9ec] rounded-b-xl shadow-subtle overflow-hidden"
    >
      {/* Filter Bar */}
      <div className="p-3.5 border-b border-[#e7e9ec] bg-slate-50/50 flex flex-wrap items-center justify-between gap-3">
        <div className="relative flex-1 min-w-[220px]">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Tìm theo tên xã viên, mã XV, CCCD..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 bg-white border border-slate-200 rounded-lg text-[12.8px] text-slate-700 focus:outline-none focus:ring-1 focus:ring-emerald-500"
          />
        </div>

        <div className="flex items-center gap-2">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-[12.5px] text-slate-700 font-medium focus:outline-none cursor-pointer"
          >
            <option value="ALL">Trạng thái: Tất cả</option>
            <option value="ACTIVE">Đang hoạt động</option>
            <option value="OVERDUE_CAPITAL">⚠️ Quá hạn nộp vốn 6 tháng</option>
            <option value="PENDING">Chờ duyệt</option>
            <option value="REJECTED">Bị từ chối</option>
            <option value="SUSPENDED">Tạm đình chỉ</option>
            <option value="PENDING_TERMINATION">Chờ quyết toán</option>
            <option value="TERMINATED">Đã chấm dứt tư cách</option>
            <option value="INACTIVE">Đã ngưng hoạt động / Đã rút khỏi HTX</option>
          </select>

          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-[12.5px] text-slate-700 font-medium focus:outline-none"
          >
            <option value="ALL">Loại xã viên: Tất cả (3 loại)</option>
            <option value="CHINH_THUC">Chính thức</option>
            <option value="LIEN_KET_GOP_VON">Liên kết góp vốn</option>
            <option value="LIEN_KET_KHONG_GOP_VON">Liên kết không góp vốn</option>
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse text-[12.9px]">
          <thead>
            <tr className="border-b border-[#e7e9ec] text-[11px] uppercase tracking-wider text-slate-400 font-bold bg-slate-50">
              <th className="py-2.5 px-3">Mã xã viên</th>
              <th className="py-2.5 px-3">Họ và tên</th>
              <th className="py-2.5 px-3">Giới tính</th>
              <th className="py-2.5 px-3">Ngày tham gia</th>
              <th className="py-2.5 px-3">Loại xã viên</th>
              <th className="py-2.5 px-3 text-right">Vốn góp (đồng)</th>
              <th className="py-2.5 px-3 text-right">Tỷ lệ (%)</th>
              <th className="py-2.5 px-3">Trạng thái</th>
              <th className="py-2.5 px-3 text-center w-[120px]">Thao tác</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {paginatedMembers.length === 0 ? (
              <tr>
                <td colSpan={9} className="py-12 text-center text-slate-400 text-xs">
                  <div className="flex flex-col items-center justify-center gap-2">
                    <Users className="w-8 h-8 text-slate-300" />
                    {search || statusFilter !== 'ALL' || typeFilter !== 'ALL' ? (
                      <>
                        <p className="font-bold text-slate-700">Không tìm thấy thành viên nào phù hợp</p>
                        <p className="text-[11.5px] text-slate-400 max-w-sm">
                          Không có xã viên nào khớp với từ khóa "{search}" hoặc các bộ lọc đã chọn.
                        </p>
                        <button
                          type="button"
                          onClick={() => {
                            setSearch('');
                            setStatusFilter('ALL');
                            setTypeFilter('ALL');
                            setCurrentPage(1);
                          }}
                          className="mt-2 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl cursor-pointer transition-colors"
                        >
                          Đặt lại bộ lọc tìm kiếm
                        </button>
                      </>
                    ) : (
                      <>
                        <p className="font-bold text-slate-600">Sổ đăng ký thành viên hiện đang trống</p>
                        <p className="text-[11.5px] text-slate-400">
                          Bấm nút "Thêm thành viên" để ghi danh xã viên đầu tiên theo Luật HTX 2023.
                        </p>
                      </>
                    )}
                  </div>
                </td>
              </tr>
            ) : (
              paginatedMembers.map((m) => (
                <tr
                  key={m.id}
                  onClick={() => onSelectMember(m)}
                  className={`cursor-pointer hover:bg-slate-50 transition-colors ${
                    selectedMember?.id === m.id ? 'bg-emerald-50/60 font-semibold' : ''
                  }`}
                >
                  <td className="py-3 px-3 font-mono text-[12px] font-bold text-slate-600">{m.member_code}</td>
                  <td className="py-3 px-3 font-bold text-slate-900">{m.full_name}</td>
                  <td className="py-3 px-3 text-slate-600">{m.gender}</td>
                  <td className="py-3 px-3 text-slate-600">{formatDate(m.join_date)}</td>
                  <td className="py-3 px-3">
                    {m.member_type === 'CHINH_THUC' && <span className="pill-badge pill-green">Chính thức</span>}
                    {m.member_type === 'LIEN_KET_GOP_VON' && <span className="pill-badge pill-blue">LK góp vốn</span>}
                    {m.member_type === 'LIEN_KET_KHONG_GOP_VON' && <span className="pill-badge pill-purple">LK không góp vốn</span>}
                  </td>
                  <td className="py-3 px-3 text-right font-extrabold text-emerald-700">
                    {m.total_capital_contributed.toLocaleString('vi-VN')} ₫
                  </td>
                  <td className="py-3 px-3 text-right font-bold text-slate-800">{m.ownership_percentage}%</td>
                  <td className="py-3 px-3">
                    <div className="flex flex-col gap-1 items-start">
                      {m.status === 'ACTIVE' && <span className="pill-badge pill-green">Đang hoạt động</span>}
                      {m.status === 'PENDING' && <span className="pill-badge pill-amber">Chờ duyệt</span>}
                      {(m.status === 'INACTIVE' || m.status === 'TERMINATED') && (
                        <span className="pill-badge pill-slate bg-slate-100 text-slate-600 border border-slate-200">Đã chấm dứt</span>
                      )}
                      {m.status === 'REJECTED' && <span className="pill-badge pill-red">Từ chối duyệt</span>}
                      {m.status === 'SUSPENDED' && (
                        <span className="pill-badge bg-orange-100 text-orange-700 border border-orange-200 font-bold">Tạm đình chỉ</span>
                      )}
                      {m.status === 'PENDING_TERMINATION' && (
                        <span className="pill-badge bg-purple-100 text-purple-700 border border-purple-200 font-bold">Chờ quyết toán</span>
                      )}

                      {/* BR-COOP-004 Limit Warning */}
                      {m.ownership_percentage > 30.0 && (
                        <span className="px-1.5 py-0.5 bg-amber-100 text-amber-800 text-[10px] font-extrabold rounded border border-amber-300 flex items-center gap-1">
                          <AlertCircle className="w-3 h-3" /> Vượt 30% vốn
                        </span>
                      )}

                      {/* BR-COOP-006 Overdue 6-Month Warning */}
                      {m.capital_status === 'CHUA_DU' &&
                        m.join_date &&
                        new Date().getTime() - new Date(m.join_date).getTime() > 180 * 24 * 60 * 60 * 1000 && (
                          <span className="px-1.5 py-0.5 bg-rose-100 text-rose-800 text-[10px] font-extrabold rounded border border-rose-300 flex items-center gap-1">
                            <AlertTriangle className="w-3 h-3 text-rose-600" /> Quá hạn 6 tháng
                          </span>
                        )}
                    </div>
                  </td>
                  <td className="py-3 px-3 text-center">
                    <div className="inline-flex items-center justify-center gap-1.5 flex-wrap">
                      {m.status === 'PENDING' && (
                        <>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              onOpenApprove(m);
                            }}
                            className="px-2 py-1 bg-emerald-100 hover:bg-emerald-200 text-emerald-800 font-extrabold rounded-md text-[11px] inline-flex items-center gap-1 transition-colors shadow-2xs cursor-pointer"
                            title="Phê duyệt hồ sơ xã viên này"
                          >
                            <UserCheck className="w-3.5 h-3.5" /> Duyệt
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              onOpenReject(m);
                            }}
                            className="px-2 py-1 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 font-extrabold rounded-md text-[11px] inline-flex items-center gap-1 transition-colors shadow-2xs cursor-pointer"
                            title="Từ chối duyệt hồ sơ xã viên này"
                          >
                            <UserX className="w-3.5 h-3.5" /> Từ chối
                          </button>
                        </>
                      )}
                      {m.status === 'ACTIVE' && (
                        <>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              onSuspendMember(m);
                            }}
                            className="px-2 py-1 bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-200 font-bold rounded-md text-[11px] transition-colors cursor-pointer"
                            title="Tạm đình chỉ hoạt động"
                          >
                            Đình chỉ
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              onTransitionStatus(m.id, 'PENDING_TERMINATION', 'Khởi động thủ tục quyết toán');
                            }}
                            className="px-2 py-1 bg-purple-50 hover:bg-purple-100 text-purple-800 border border-purple-200 font-bold rounded-md text-[11px] transition-colors cursor-pointer"
                            title="Chuyển sang bước chờ quyết toán"
                          >
                            Quyết toán
                          </button>
                        </>
                      )}
                      {m.status === 'SUSPENDED' && (
                        <>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              onReactivateMember(m);
                            }}
                            className="px-2 py-1 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 font-bold rounded-md text-[11px] transition-colors cursor-pointer"
                            title="Khôi phục trạng thái Đang hoạt động"
                          >
                            Khôi phục
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              onTransitionStatus(m.id, 'PENDING_TERMINATION', 'Chuyển sang thủ tục quyết toán');
                            }}
                            className="px-2 py-1 bg-purple-50 hover:bg-purple-100 text-purple-800 border border-purple-200 font-bold rounded-md text-[11px] transition-colors cursor-pointer"
                            title="Chuyển sang bước chờ quyết toán"
                          >
                            Quyết toán
                          </button>
                        </>
                      )}
                      {m.status === 'PENDING_TERMINATION' && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onOpenTerminationCheck(m);
                          }}
                          className="px-2 py-1 bg-rose-100 hover:bg-rose-200 text-rose-800 border border-rose-300 font-extrabold rounded-md text-[11px] transition-colors cursor-pointer"
                          title="Kiểm tra 4 điều kiện cấn trừ nợ và chấm dứt tư cách"
                        >
                          Chấm dứt
                        </button>
                      )}
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onSelectMember(m);
                        }}
                        className="p-1.5 text-slate-400 hover:text-emerald-700 hover:bg-emerald-50 rounded-lg transition-colors cursor-pointer"
                        title="Xem thông tin chi tiết"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                      {onPrintMember && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onPrintMember(m);
                          }}
                          className="p-1.5 text-slate-400 hover:text-teal-700 hover:bg-teal-50 rounded-lg transition-colors cursor-pointer"
                          title="Xem &amp; In Sổ tờ khai hồ sơ xã viên (Điều 33 Luật HTX 2023)"
                        >
                          <Printer className="w-4 h-4" />
                        </button>
                      )}
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onOpenEdit(m);
                        }}
                        className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                        title="Cập nhật thông tin xã viên"
                      >
                        <Pencil className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {filteredMembers.length > 0 && (
        <Pagination
          currentPage={safeCurrentPage}
          totalItems={filteredMembers.length}
          pageSize={pageSize}
          onPageChange={setCurrentPage}
        />
      )}
    </div>
  );
};
