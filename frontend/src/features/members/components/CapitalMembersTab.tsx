import React, { useState } from 'react';
import {
  Search,
  RotateCcw,
  Eye,
  QrCode,
  ArrowLeft,
  ArrowRight,
} from 'lucide-react';
import { Member } from '@/types/memberTypes';

interface CapitalMembersTabProps {
  members: Member[];
  search: string;
  setSearch: (s: string) => void;
  capitalStatusFilter: string;
  setCapitalStatusFilter: (s: string) => void;
  totalContributedCapital: number;
  selectedCapitalMember: Member | null;
  onSelectMember: (m: Member) => void;
  onOpenCertificate: (m: Member) => void;
}

export const CapitalMembersTab: React.FC<CapitalMembersTabProps> = ({
  members,
  search,
  setSearch,
  capitalStatusFilter,
  setCapitalStatusFilter,
  totalContributedCapital,
  selectedCapitalMember,
  onSelectMember,
  onOpenCertificate,
}) => {
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [pageSize, setPageSize] = useState<number>(6);

  React.useEffect(() => {
    setCurrentPage(1);
  }, [search, capitalStatusFilter]);

  const filteredMembers = members.filter((m) => {
    const matchesSearch =
      search === '' ||
      (m.full_name && m.full_name.toLowerCase().includes(search.toLowerCase())) ||
      (m.member_code && m.member_code.toLowerCase().includes(search.toLowerCase())) ||
      (m.cccd && m.cccd.includes(search));

    const matchesStatus =
      capitalStatusFilter === 'ALL' || m.capital_status === capitalStatusFilter;

    return matchesSearch && matchesStatus;
  });

  const totalPages = Math.ceil(filteredMembers.length / pageSize) || 1;
  const safeCurrentPage = Math.min(currentPage, totalPages);
  const paginatedMembers = filteredMembers.slice(
    (safeCurrentPage - 1) * pageSize,
    safeCurrentPage * pageSize
  );

  return (
    <div className="bg-white border border-[#e7e9ec] rounded-xl shadow-subtle overflow-hidden">
      {/* Search and Filters bar */}
      <div className="p-3.5 border-b border-[#e7e9ec] bg-slate-50/50 flex flex-wrap items-center justify-between gap-3">
        <div className="relative flex-1 min-w-[220px]">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Tìm theo tên, mã xã viên, CCCD..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 bg-white border border-slate-200 rounded-lg text-[12.8px] text-slate-700 focus:outline-none focus:ring-1 focus:ring-emerald-500"
          />
        </div>

        <div className="flex items-center gap-2">
          <select
            value={capitalStatusFilter}
            onChange={(e) => setCapitalStatusFilter(e.target.value)}
            className="px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-[12.5px] text-slate-700 font-medium focus:outline-none"
          >
            <option value="ALL">Trạng thái: Tất cả</option>
            <option value="DU_VON">Đủ vốn</option>
            <option value="CHUA_DU">Chưa đủ</option>
          </select>

          <button
            onClick={() => {
              setSearch('');
              setCapitalStatusFilter('ALL');
            }}
            className="px-3 py-1.5 border border-slate-200 hover:bg-slate-100 text-slate-600 font-bold text-[12px] rounded-lg inline-flex items-center gap-1 transition-colors"
          >
            <RotateCcw className="w-3.5 h-3.5" /> Đặt lại
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse text-[12.8px] bg-white">
          <thead>
            <tr className="border-b border-[#e7e9ec] text-[11px] uppercase tracking-wider text-slate-500 font-bold bg-gradient-to-r from-slate-50 to-slate-100 shadow-[0_1px_2px_rgba(0,0,0,0.02)]">
              <th className="py-2.5 px-3">STT</th>
              <th className="py-2.5 px-3">Mã xã viên</th>
              <th className="py-2.5 px-3">Họ và tên</th>
              <th className="py-2.5 px-3">Phân loại TV</th>
              <th className="py-2.5 px-3 text-right">Vốn cam kết (đ)</th>
              <th className="py-2.5 px-3 text-right">Đã góp (đ)</th>
              <th className="py-2.5 px-3 text-right">Còn thiếu (đ)</th>
              <th className="py-2.5 px-3 text-right">Tỷ lệ % (Max 30%)</th>
              <th className="py-2.5 px-3">Trạng thái</th>
              <th className="py-2.5 px-3 text-center">Thao tác</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {paginatedMembers.length === 0 ? (
              <tr>
                <td colSpan={10} className="py-8 text-center text-slate-400">
                  Không tìm thấy xã viên nào phù hợp
                </td>
              </tr>
            ) : (
              paginatedMembers.map((m, idx) => {
                const committed = m.committed_capital ?? m.total_capital_contributed ?? 0;
                const contributed = m.contributed_capital ?? m.total_capital_contributed ?? 0;
                const remaining = Math.max(0, committed - contributed);
                const isFullyPaid = contributed >= committed && committed > 0;
                const pct =
                  totalContributedCapital > 0
                    ? Number(((contributed / totalContributedCapital) * 100).toFixed(2))
                    : (m.ownership_percentage || 0);
                const isNearLimit = pct >= 25.0 && pct < 30.0;
                const isLimitBreach = pct >= 30.0;

                return (
                  <tr
                    key={m.id}
                    onClick={() => onSelectMember(m)}
                    className={`cursor-pointer hover:bg-slate-50 transition-colors ${
                      selectedCapitalMember?.id === m.id ? 'bg-emerald-50/60 font-semibold' : ''
                    }`}
                  >
                    <td className="py-3 px-3 text-slate-500 font-medium">
                      {(safeCurrentPage - 1) * pageSize + idx + 1}
                    </td>
                    <td className="py-3 px-3 font-mono font-bold text-slate-600">{m.member_code}</td>
                    <td className="py-3 px-3">
                      <strong className="text-slate-900 block">{m.full_name}</strong>
                      <span className="text-[10.5px] text-slate-400 block break-words" title={m.address}>
                        {m.address}
                      </span>
                    </td>
                    <td className="py-3 px-3 whitespace-nowrap">
                      {m.member_type === 'CHINH_THUC' ? (
                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
                          Chính thức
                        </span>
                      ) : (
                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-100 text-blue-800">
                          Liên kết
                        </span>
                      )}
                    </td>
                    <td className="py-3 px-3 text-right font-bold text-slate-900 whitespace-nowrap">
                      {committed.toLocaleString('vi-VN')} ₫
                    </td>
                    <td className="py-3 px-3 text-right font-extrabold text-emerald-700 whitespace-nowrap">
                      {contributed.toLocaleString('vi-VN')} ₫
                    </td>
                    <td className="py-3 px-3 text-right font-bold text-amber-800 whitespace-nowrap">
                      {remaining.toLocaleString('vi-VN')} ₫
                    </td>
                    <td className="py-3 px-3 text-right font-extrabold">
                      {isLimitBreach ? (
                        <span
                          className="px-2 py-0.5 bg-rose-100 text-rose-700 rounded-md font-mono text-[11px]"
                          title="Vi phạm trần 30% Luật HTX 2023"
                        >
                          {pct}% ⛔
                        </span>
                      ) : isNearLimit ? (
                        <span
                          className="px-2 py-0.5 bg-amber-100 text-amber-800 rounded-md font-mono text-[11px]"
                          title="Cảnh báo cận trần 30%"
                        >
                          {pct}% ⚠️
                        </span>
                      ) : (
                        <span className="text-slate-800 font-mono">{pct}%</span>
                      )}
                    </td>
                    <td className="py-3 px-3">
                      {isFullyPaid ? (
                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
                          Đủ vốn
                        </span>
                      ) : (
                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800">
                          Chưa đủ
                        </span>
                      )}
                    </td>
                    <td className="py-3 px-3 text-center">
                      <div className="inline-flex items-center gap-1">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onSelectMember(m);
                          }}
                          className="p-1 text-slate-400 hover:text-emerald-700 hover:bg-emerald-50 rounded-lg transition-colors"
                          title="Xem chi tiết vốn góp"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onOpenCertificate(m);
                          }}
                          className="p-1 text-emerald-600 hover:text-emerald-800 hover:bg-emerald-50 rounded-lg transition-colors"
                          title="Xem & In Giấy chứng nhận vốn góp điện tử"
                        >
                          <QrCode className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
          <tfoot className="bg-slate-50 border-t border-slate-200 font-bold text-[12.5px] text-slate-900 shadow-[0_-1px_2px_rgba(0,0,0,0.02)]">
            <tr>
              <td colSpan={4} className="py-3 px-3 text-right text-slate-600 uppercase tracking-wider">
                Tổng cộng (trang hiện tại):
              </td>
              <td className="py-3 px-3 text-right">
                {paginatedMembers
                  .reduce(
                    (sum, m) => sum + (m.committed_capital ?? m.total_capital_contributed ?? 0),
                    0
                  )
                  .toLocaleString('vi-VN')}{' '}
                ₫
              </td>
              <td className="py-3 px-3 text-right text-emerald-700">
                {paginatedMembers
                  .reduce(
                    (sum, m) => sum + (m.contributed_capital ?? m.total_capital_contributed ?? 0),
                    0
                  )
                  .toLocaleString('vi-VN')}{' '}
                ₫
              </td>
              <td className="py-3 px-3 text-right text-amber-800">
                {paginatedMembers
                  .reduce(
                    (sum, m) =>
                      sum +
                      Math.max(
                        0,
                        (m.committed_capital ?? m.total_capital_contributed ?? 30000000) -
                          (m.contributed_capital ?? m.total_capital_contributed ?? 0)
                      ),
                    0
                  )
                  .toLocaleString('vi-VN')}{' '}
                ₫
              </td>
              <td colSpan={3}></td>
            </tr>
          </tfoot>
        </table>
      </div>

      {/* Pagination Controls */}
      <div className="px-4 py-3 border-t border-[#e7e9ec] bg-slate-50/80 flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-2 text-slate-500 font-medium">
          <span>Hiển thị</span>
          <select
            value={pageSize}
            onChange={(e) => {
              setPageSize(Number(e.target.value));
              setCurrentPage(1);
            }}
            className="px-2 py-1 bg-white border border-slate-300 rounded-md font-semibold text-slate-700 focus:outline-none focus:ring-1 focus:ring-emerald-500 cursor-pointer"
          >
            <option value={5}>5 xã viên / trang</option>
            <option value={6}>6 xã viên / trang</option>
            <option value={10}>10 xã viên / trang</option>
            <option value={20}>20 xã viên / trang</option>
          </select>
          <span>
            trên tổng số <strong>{filteredMembers.length}</strong> xã viên
          </span>
        </div>

        <div className="flex items-center gap-1.5">
          <button
            onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
            disabled={safeCurrentPage <= 1}
            className="p-1.5 border border-slate-300 rounded-md hover:bg-white disabled:opacity-40 disabled:cursor-not-allowed transition-all text-slate-700"
            title="Trang trước"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
          </button>

          <span className="px-3 py-1 font-bold text-slate-800 bg-white border border-slate-200 rounded-md">
            Trang {safeCurrentPage} / {totalPages}
          </span>

          <button
            onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
            disabled={safeCurrentPage >= totalPages}
            className="p-1.5 border border-slate-300 rounded-md hover:bg-white disabled:opacity-40 disabled:cursor-not-allowed transition-all text-slate-700"
            title="Trang sau"
          >
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
};
